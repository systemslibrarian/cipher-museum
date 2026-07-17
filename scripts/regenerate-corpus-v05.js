#!/usr/bin/env node
'use strict';

/**
 * Cipher Corpus v0.5 regeneration — makes the published dataset reproduce
 * with the verified museum engines (post-2026 engine verification sweep).
 *
 * What it does, per record in public/corpus/all.jsonl:
 *   - Skips intentionally noisy records (transcription_quality !== 'clean')
 *     and historical records, except two documented data repairs:
 *       * hist-caesar-augustus-001 — stored ciphertext was not a uniform
 *         shift-1 encoding; corrected.
 *       * hist-playfair-wheatstone-001 — stored ciphertext is the canonical
 *         PLAYFAIR EXAMPLE vector but the key metadata said only PLAYFAIR;
 *         the key is corrected, the ciphertext was always right.
 *   - Repairs key metadata that could not reproduce the record:
 *       * running_key: the label "Declaration of Independence (opening)" is
 *         replaced with the actual key text used by the exhibit engine.
 *       * solitaire: key type "none" becomes the explicit CRYPTONOMICON
 *         passphrase the demo uses.
 *       * one_time_pad / vernam "(repeating)" pads are materialized to a
 *         full-length explicit pad.
 *   - Re-encodes with the live engine and, when the stored ciphertext no
 *     longer matches (legacy engine output), replaces it and verifies the
 *     decode path.
 *   - Touched records get dataset_version 0.5 and a regeneration note.
 *
 * Then rewrites every subset .jsonl in public/corpus/ that contains a touched
 * record id, and regenerates the derived all.json and all.csv exports.
 *
 * Usage: node scripts/regenerate-corpus-v05.js [--dry-run]
 */

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const {
  engineNameFor,
  extractKey,
  applyPlaintextPolicy,
  compactCiphertext
} = require('../tests/engines/corpus-replay.js');

const engines = global.CipherEngines;
const CORPUS_DIR = path.resolve(__dirname, '../public/corpus');
const ALL = path.join(CORPUS_DIR, 'all.jsonl');
const DRY_RUN = process.argv.includes('--dry-run');

const RUNNING_KEY_TEXT = 'WE HOLD THESE TRUTHS TO BE SELF EVIDENT THAT ALL MEN ARE CREATED EQUAL';
const REGEN_NOTE = 'Ciphertext regenerated 2026-07-17 (corpus v0.5) to match the verified museum engines.';

function repairKey(record) {
  const key = record.key;
  if (!key || typeof key !== 'object') return false;
  if (record.cipher_type === 'running_key' && /^Declaration of Independence/i.test(String(key.value || ''))) {
    key.value = RUNNING_KEY_TEXT;
    key.label = 'Running key text (Declaration of Independence, opening)';
    return true;
  }
  if (record.cipher_type === 'solitaire' && key.type === 'none' && record.id !== 'hist-solitaire-cryptonomicon-001') {
    record.key = { type: 'passphrase', value: 'CRYPTONOMICON', label: 'Deck-keying passphrase' };
    return true;
  }
  if ((record.cipher_type === 'one_time_pad' || record.cipher_type === 'vernam') && /\(repeating\)/i.test(String(key.value || ''))) {
    const base = String(key.value).replace(/\(repeating\).*/i, '').toUpperCase().replace(/[^A-Z]/g, '');
    const length = String(record.plaintext || '').normalize('NFD').replace(/\p{M}/gu, '').toUpperCase().replace(/[^A-Z]/g, '').length;
    key.value = base.repeat(Math.ceil(length / Math.max(1, base.length))).slice(0, Math.max(length, base.length));
    key.label = 'Explicit full-length pad (previously stored as a repeating stub)';
    return true;
  }
  if (record.id === 'hist-playfair-wheatstone-001' && key.keyword === 'PLAYFAIR') {
    key.keyword = 'PLAYFAIR EXAMPLE';
    return true;
  }
  if (record.id === 'hist-solitaire-cryptonomicon-001' && key.passphrase === 'CRYPTONOMICON') {
    // The stored ciphertext EXKYI ZSGEH UNTIQ is Schneier's sample output 1,
    // which uses an UNKEYED standard-ordered deck — no passphrase.
    record.key = { type: 'none', value: null, deck: 'standard ordered', label: 'Unkeyed deck — Schneier sample output 1' };
    return true;
  }
  return false;
}

function annotate(record, extra) {
  const note = extra ? `${REGEN_NOTE} ${extra}` : REGEN_NOTE;
  record.notes = record.notes ? `${record.notes} ${note}`.trim() : note;
  record.dataset_version = '0.5';
}

async function main() {
  const stats = { records: 0, skippedNoisy: 0, skippedHistorical: 0, keyRepaired: 0, ciphertextRegenerated: 0, untouched: 0, irreparable: [] };
  const perEngine = new Map();
  const fixedLines = new Map(); // id -> replacement JSONL line
  const outLines = [];

  const input = readline.createInterface({ input: fs.createReadStream(ALL, { encoding: 'utf8' }), crlfDelay: Infinity });
  for await (const line of input) {
    if (!line.trim()) continue;
    const record = JSON.parse(line);
    stats.records++;
    const engineName = engineNameFor(record.cipher_type);
    const engine = engines[engineName];

    if (record.transcription_quality && record.transcription_quality !== 'clean') {
      stats.skippedNoisy++;
      outLines.push(line);
      continue;
    }
    const historicalRepair = record.id === 'hist-caesar-augustus-001' || record.id === 'hist-playfair-wheatstone-001' ||
      record.id === 'hist-solitaire-cryptonomicon-001';
    if (record.source_type === 'historical' && !historicalRepair) {
      stats.skippedHistorical++;
      outLines.push(line);
      continue;
    }
    if (!engine) {
      stats.irreparable.push({ id: record.id, reason: `no engine for ${record.cipher_type}` });
      outLines.push(line);
      continue;
    }

    const keyChanged = repairKey(record);
    const key = extractKey(record);

    const encoded = engine.encode(record.plaintext, key);
    const encodeOk = compactCiphertext(encoded) === compactCiphertext(record.ciphertext);
    let touched = keyChanged;
    let extraNote = '';

    if (!encodeOk) {
      record.ciphertext = encoded;
      touched = true;
      stats.ciphertextRegenerated++;
      perEngine.set(engineName, (perEngine.get(engineName) || 0) + 1);
      if (record.id === 'hist-caesar-augustus-001') {
        extraNote = 'The previously stored ciphertext was not a uniform shift-1 encoding; this is a reconstructed example, not a quoted historical ciphertext.';
      }
    }

    // Verify the decode path for anything we now claim is reproducible.
    let decoded = engine.decode(record.ciphertext, key);
    if (applyPlaintextPolicy(decoded, record) !== applyPlaintextPolicy(record.plaintext, record)) {
      // Second attempt: some records declare an A-Z alphabet but carry accented
      // letters the engines cannot round-trip through word/codebook fallbacks.
      // Normalize the plaintext to the record's own declared alphabet.
      const folded = String(record.plaintext).normalize('NFD').replace(/\p{M}/gu, '');
      if (folded !== record.plaintext && /A-Z/i.test(String(record.alphabet || ''))) {
        record.plaintext = folded;
        record.text_length = folded.length;
        record.normalized_text_length = folded.toUpperCase().replace(/[^A-Z]/g, '').length;
        record.ciphertext = engine.encode(record.plaintext, key);
        touched = true;
        extraNote = (extraNote ? extraNote + ' ' : '') + 'Plaintext normalized to the declared A-Z alphabet.';
        decoded = engine.decode(record.ciphertext, key);
      }
      if (applyPlaintextPolicy(decoded, record) !== applyPlaintextPolicy(record.plaintext, record)) {
        stats.irreparable.push({ id: record.id, reason: 'decode mismatch after regeneration', engine: engineName });
      }
    }

    if (touched) {
      if (keyChanged) stats.keyRepaired++;
      annotate(record, extraNote);
      const newLine = JSON.stringify(record);
      fixedLines.set(record.id, newLine);
      outLines.push(newLine);
    } else {
      stats.untouched++;
      outLines.push(line);
    }
  }

  console.log(`Records: ${stats.records}`);
  console.log(`Untouched (already reproduce): ${stats.untouched}`);
  console.log(`Skipped noisy: ${stats.skippedNoisy}`);
  console.log(`Skipped historical: ${stats.skippedHistorical}`);
  console.log(`Key metadata repaired: ${stats.keyRepaired}`);
  console.log(`Ciphertexts regenerated: ${stats.ciphertextRegenerated}`);
  for (const [name, count] of [...perEngine].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(6)} ${name}`);
  }
  console.log(`Irreparable: ${stats.irreparable.length}`);
  for (const item of stats.irreparable.slice(0, 20)) console.log(`  ${JSON.stringify(item)}`);

  if (DRY_RUN) {
    console.log('Dry run — no files written.');
    return;
  }
  if (stats.irreparable.length > 0) {
    console.error('Refusing to write: irreparable records present.');
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(ALL, outLines.join('\n') + '\n', 'utf8');
  console.log(`Wrote ${ALL}`);

  // Propagate fixes into every subset .jsonl that shares record ids.
  for (const file of fs.readdirSync(CORPUS_DIR)) {
    if (!file.endsWith('.jsonl') || file === 'all.jsonl') continue;
    const filePath = path.join(CORPUS_DIR, file);
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    let changed = 0;
    const rewritten = lines.map(subsetLine => {
      const trimmed = subsetLine.trim();
      if (!trimmed) return subsetLine;
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && parsed.id && fixedLines.has(parsed.id)) {
          changed++;
          return fixedLines.get(parsed.id);
        }
      } catch {
        // Non-JSON line (template/comment files) — leave untouched.
      }
      return subsetLine;
    });
    if (changed > 0) {
      fs.writeFileSync(filePath, rewritten.join('\n'), 'utf8');
      console.log(`Updated ${file}: ${changed} records`);
    }
  }

  // Regenerate derived exports from the canonical JSONL.
  const records = outLines.map(l => JSON.parse(l));
  const jsonOut = fs.createWriteStream(path.join(CORPUS_DIR, 'all.json'), { encoding: 'utf8' });
  jsonOut.write('[\n');
  records.forEach((record, index) => {
    const body = JSON.stringify(record, null, 2).split('\n').map(l => '  ' + l).join('\n');
    jsonOut.write(body + (index < records.length - 1 ? ',\n' : '\n'));
  });
  jsonOut.write(']\n');
  await new Promise(resolve => jsonOut.end(resolve));
  console.log('Regenerated all.json');

  const CSV_COLUMNS = ['id', 'title', 'cipher_family', 'cipher_type', 'plaintext', 'ciphertext', 'difficulty', 'language', 'source_type', 'license', 'verified', 'dataset_version', 'split'];
  const csvOut = fs.createWriteStream(path.join(CORPUS_DIR, 'all.csv'), { encoding: 'utf8' });
  csvOut.write(CSV_COLUMNS.join(',') + '\n');
  for (const record of records) {
    const row = CSV_COLUMNS.map(column => {
      let value = record[column];
      if (column === 'verified') value = value ? 'True' : 'False';
      return '"' + String(value ?? '').replace(/"/g, '""') + '"';
    });
    csvOut.write(row.join(',') + '\n');
  }
  await new Promise(resolve => csvOut.end(resolve));
  console.log('Regenerated all.csv');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
