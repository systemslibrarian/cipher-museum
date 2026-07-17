#!/usr/bin/env node
'use strict';

/**
 * Regenerates public/corpus/llm-3shot-eval.jsonl from the canonical corpus.
 *
 * Format (as documented in public/corpus/README.md):
 *   {
 *     id, cipher_type, difficulty,
 *     prompts: {
 *       three_shot:   { prompt, evaluation: { target } },
 *       challenge:    { prompt, evaluation: { target } },
 *       key_recovery: { prompt, evaluation: { target } }
 *     }
 *   }
 *
 * Selection is deterministic: for each cipher type (sorted), clean PUBLIC-split
 * records are taken in id order; the first three become the few-shot examples
 * and subsequent records become evaluation targets, round-robin across types
 * until 300 records are emitted. Blind-split records are never used, so the
 * file cannot leak the held-out split.
 */

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const CORPUS = path.resolve(__dirname, '../public/corpus/all.jsonl');
const OUT = path.resolve(__dirname, '../public/corpus/llm-3shot-eval.jsonl');
const TARGET_COUNT = 300;

function describeKey(record) {
  const key = record.key;
  if (!key || typeof key !== 'object') return String(key ?? 'none');
  if (key.value !== undefined && key.value !== null) return String(key.value);
  const parts = Object.entries(key)
    .filter(([name]) => name !== 'type' && name !== 'label')
    .map(([name, value]) => `${name}=${value}`);
  return parts.length ? parts.join(', ') : String(key.type ?? 'none');
}

function threeShotPrompt(examples, record) {
  const shots = examples.map((example, index) =>
    `Example ${index + 1}:\nCiphertext: ${example.ciphertext}\nKey: ${describeKey(example)}\nPlaintext: ${example.plaintext}`
  ).join('\n\n');
  return `You are a classical cryptanalysis assistant. The cipher is ${record.cipher_type}.\n\n${shots}\n\nNow decrypt this message.\nCiphertext: ${record.ciphertext}\nKey: ${describeKey(record)}\nPlaintext:`;
}

function challengePrompt(record) {
  return `The following message was encrypted with the classical cipher "${record.cipher_type}". No key is provided. Recover the plaintext.\nCiphertext: ${record.ciphertext}\nPlaintext:`;
}

function keyRecoveryPrompt(record) {
  return `The following plaintext/ciphertext pair was produced by the classical cipher "${record.cipher_type}". Determine the key or settings used.\nPlaintext: ${record.plaintext}\nCiphertext: ${record.ciphertext}\nKey:`;
}

async function main() {
  const byType = new Map();
  const input = readline.createInterface({ input: fs.createReadStream(CORPUS, { encoding: 'utf8' }), crlfDelay: Infinity });
  for await (const line of input) {
    if (!line.trim()) continue;
    const record = JSON.parse(line);
    if (record.split !== 'public') continue;
    if (record.transcription_quality && record.transcription_quality !== 'clean') continue;
    if (record.source_type === 'historical') continue;
    if (!record.plaintext || !record.ciphertext) continue;
    if (!byType.has(record.cipher_type)) byType.set(record.cipher_type, []);
    byType.get(record.cipher_type).push(record);
  }

  const types = [...byType.keys()].sort().filter(type => byType.get(type).length >= 4);
  for (const type of types) byType.get(type).sort((a, b) => a.id.localeCompare(b.id));

  const out = fs.createWriteStream(OUT, { encoding: 'utf8' });
  let emitted = 0;
  let round = 0;
  while (emitted < TARGET_COUNT) {
    let progressed = false;
    for (const type of types) {
      if (emitted >= TARGET_COUNT) break;
      const records = byType.get(type);
      const index = 3 + round;
      if (index >= records.length) continue;
      const examples = records.slice(0, 3);
      const record = records[index];
      progressed = true;
      out.write(JSON.stringify({
        id: `eval-${record.id}`,
        cipher_type: record.cipher_type,
        difficulty: record.difficulty,
        source_record: record.id,
        prompts: {
          three_shot: { prompt: threeShotPrompt(examples, record), evaluation: { target: record.plaintext } },
          challenge: { prompt: challengePrompt(record), evaluation: { target: record.plaintext } },
          key_recovery: { prompt: keyRecoveryPrompt(record), evaluation: { target: describeKey(record) } }
        }
      }) + '\n');
      emitted++;
    }
    if (!progressed) break;
    round++;
  }
  await new Promise(resolve => out.end(resolve));
  console.log(`Wrote ${emitted} eval records across ${types.length} cipher types to ${OUT}`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
