#!/usr/bin/env node
/**
 * export-llm-3shot.js
 * Exports Cipher Corpus records in LLM 3-shot evaluation format.
 * Generates prompt templates for evaluating LLMs on classical cipher breaking.
 *
 * Usage: node scripts/export-llm-3shot.js [--difficulty beginner|intermediate|advanced|expert]
 *        [--cipher_type vigenere] [--count 100] [--output eval.jsonl]
 */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const CORPUS_DIR = path.join(__dirname, '../public/corpus');
const OUT_DIR = path.join(__dirname, '../public/eval');
if (!require('fs').existsSync(OUT_DIR)) require('fs').mkdirSync(OUT_DIR, { recursive: true });

// Parse args
const args = process.argv.slice(2);
const getArg = (flag, def) => {
  const idx = args.indexOf(flag);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : def;
};
const difficulty = getArg('--difficulty', null);
const cipherType = getArg('--cipher_type', null);
const count = parseInt(getArg('--count', '200'));
const outFile = getArg('--output', path.join(OUT_DIR, 'llm-3shot-eval.jsonl'));
const _ = null; // suppress lint

// Load corpus
const allPath = path.join(CORPUS_DIR, 'all.jsonl');
const lines = fs.readFileSync(allPath, 'utf8').split('\n').filter(Boolean);
let records = lines.map(l => JSON.parse(l));

// Filter
if (difficulty) records = records.filter(r => r.difficulty === difficulty);
if (cipherType) records = records.filter(r => r.cipher_type === cipherType);

// Only use public split, verified, clean records as shots
const clean = records.filter(r => r.split === 'public' && r.verified && r.transcription_quality === 'clean');
const blind = records.filter(r => r.split === 'blind');
const evalPool = blind.length > 0 ? blind : clean;

// Group by cipher_type for 3-shot example selection
function groupBy(arr, key) {
  return arr.reduce((acc, r) => { (acc[r[key]] = acc[r[key]] || []).push(r); return acc; }, {});
}
const cleanByCipher = groupBy(clean, 'cipher_type');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build 3-shot prompt for a record
function build3ShotPrompt(record, shots) {
  const shotLines = shots.map((s, i) =>
    `Example ${i + 1}:\nCipher: ${s.cipher_type}\nCiphertext: ${s.ciphertext}\nKey: ${JSON.stringify(s.key)}\nPlaintext: ${s.plaintext}`
  ).join('\n\n');

  return `You are a classical cryptanalysis expert. Below are ${shots.length} example${shots.length !== 1 ? 's' : ''} showing how a ${record.cipher_type} cipher works, followed by a ciphertext to decrypt.

${shotLines}

Now decrypt the following:
Cipher: ${record.cipher_type}
Ciphertext: ${record.ciphertext}
Key: ${JSON.stringify(record.key)}

Plaintext:`;
}

// Build zero-shot (challenge) prompt — no key revealed
function buildChallengePrompt(record) {
  return `You are a classical cryptanalysis expert. Analyze and decrypt the following ciphertext.

Cipher type: ${record.cipher_type}
Ciphertext: ${record.ciphertext}
Difficulty: ${record.difficulty}
Expected attack methods: ${record.expected_attacks.join(', ')}

Provide your decryption step by step, then give the final plaintext.

Plaintext:`;
}

// Build key-recovery prompt
function buildKeyRecoveryPrompt(record) {
  return `You are a classical cryptanalysis expert. Given the following ciphertext and its known plaintext, recover the encryption key.

Cipher type: ${record.cipher_type}
Ciphertext: ${record.ciphertext}
Plaintext: ${record.plaintext}
Difficulty: ${record.difficulty}

Describe how you identify the key and provide the recovered key:`;
}

const evalRecords = shuffle(evalPool).slice(0, count);
const output = [];

for (const record of evalRecords) {
  const siblings = (cleanByCipher[record.cipher_type] || [])
    .filter(r => r.id !== record.id);
  const shots = shuffle(siblings).slice(0, 3);

  const entry = {
    id: record.id,
    cipher_type: record.cipher_type,
    cipher_family: record.cipher_family,
    difficulty: record.difficulty,
    language: record.language,
    split: record.split,
    ciphertext: record.ciphertext,
    plaintext: record.plaintext,
    key: record.key,
    text_length: record.text_length,
    normalized_text_length: record.normalized_text_length,
    expected_attacks: record.expected_attacks,
    prompts: {
      three_shot: {
        type: '3-shot',
        description: 'Three in-context examples, key provided — tests cipher decryption ability',
        shot_ids: shots.map(s => s.id),
        prompt: build3ShotPrompt(record, shots),
        evaluation: {
          target: record.plaintext,
          metric: 'exact_match',
          fallback_metric: 'levenshtein_similarity',
          scoring: 'Case-insensitive, strip punctuation before comparison'
        }
      },
      zero_shot_ciphertype_known: {
        type: '0-shot (cipher type known, key known)',
        description: 'No examples, cipher type and key provided — tests basic decryption execution',
        prompt: build3ShotPrompt(record, []),
        evaluation: {
          target: record.plaintext,
          metric: 'exact_match',
          fallback_metric: 'levenshtein_similarity'
        }
      },
      challenge: {
        type: '0-shot challenge (no key)',
        description: 'Cipher type known but no key — tests cryptanalytic capability',
        prompt: buildChallengePrompt(record),
        evaluation: {
          target: record.plaintext,
          metric: 'exact_match',
          fallback_metric: 'levenshtein_similarity'
        }
      },
      key_recovery: {
        type: 'key recovery',
        description: 'Both plaintext and ciphertext provided — tests key recovery',
        prompt: buildKeyRecoveryPrompt(record),
        evaluation: {
          target: JSON.stringify(record.key),
          metric: 'key_match',
          scoring: 'Parse recovered key and compare to ground truth'
        }
      }
    }
  };
  output.push(entry);
}

const outPath = path.join(OUT_DIR, outFile);
fs.writeFileSync(outPath, output.map(r => JSON.stringify(r)).join('\n') + '\n');
console.log(`Exported ${output.length} LLM evaluation records → ${outPath}`);
console.log(`Difficulty breakdown: ${Object.entries(groupBy(output, 'difficulty')).map(([k,v])=>`${k}:${v.length}`).join(', ')}`);
console.log(`Cipher types: ${[...new Set(output.map(r=>r.cipher_type))].length} unique types`);
