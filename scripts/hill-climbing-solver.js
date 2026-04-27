#!/usr/bin/env node
/**
 * Hill-Climbing Monoalphabetic Solver
 *
 * Breaks monoalphabetic substitution ciphers using quadgram scoring and hill climbing.
 *
 * Usage:
 *   node scripts/hill-climbing-solver.js "CIPHERTEXT HERE"
 *   node scripts/hill-climbing-solver.js --file path/to/ciphertext.txt
 *   node scripts/hill-climbing-solver.js --corpus public/corpus/beginner.jsonl --limit 10
 *
 * Algorithm:
 *   1. Start with a random substitution key (26-letter permutation)
 *   2. Score the decryption using quadgram log-probability statistics
 *   3. Try swapping every pair of letters in the key; accept the best improvement
 *   4. Repeat until no improving swap exists (local optimum)
 *   5. Restart from a new random key; keep the best result across restarts
 *
 * Quadgram scoring: sum of log10(P(q)) for every consecutive 4-letter window in the
 * decrypted text. Higher scores = more English-like text.
 *
 * Educational note: This solver demonstrates the automated cryptanalysis technique
 * used against classical substitution ciphers. For long ciphertexts (50+ chars),
 * it typically recovers the key in under 1 second with ~5 restarts.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── Quadgram scorer ────────────────────────────────────────────────────────────

const QUADGRAM_FILE = path.join(__dirname, 'data', 'english-quadgrams.json');

let _qdata = null;
function loadQuadgrams() {
  if (_qdata) return _qdata;
  if (!fs.existsSync(QUADGRAM_FILE)) {
    console.error('Quadgram file not found. Run: node scripts/build-quadgrams.js');
    process.exit(1);
  }
  _qdata = JSON.parse(fs.readFileSync(QUADGRAM_FILE, 'utf8'));
  return _qdata;
}

function scoreText(text) {
  const { logProbs, floor } = loadQuadgrams();
  let score = 0;
  const n = text.length;
  if (n < 4) return floor * 4;
  for (let i = 0; i <= n - 4; i++) {
    const q = text.slice(i, i + 4);
    score += (q in logProbs) ? logProbs[q] : floor;
  }
  return score;
}

// ── Key / cipher operations ────────────────────────────────────────────────────

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randomKey() {
  const arr = ALPHA.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

function swapPositions(key, i, j) {
  const arr = key.split('');
  [arr[i], arr[j]] = [arr[j], arr[i]];
  return arr.join('');
}

function decrypt(ciphertext, key) {
  // key[i] = the ciphertext letter that maps to plaintext letter ALPHA[i]
  // i.e., key is the cipher alphabet; we need the inverse for decryption
  const inv = new Array(26);
  for (let i = 0; i < 26; i++) {
    inv[key.charCodeAt(i) - 65] = i;
  }
  let result = '';
  for (let ci = 0; ci < ciphertext.length; ci++) {
    const c = ciphertext.charCodeAt(ci) - 65;
    if (c >= 0 && c < 26) {
      result += ALPHA[inv[c]];
    } else {
      result += ciphertext[ci];
    }
  }
  return result;
}

function cleanText(text) {
  return text.toUpperCase().replace(/[^A-Z]/g, '');
}

// ── Hill-climbing core ─────────────────────────────────────────────────────────

/**
 * Run one hill-climbing pass from a random starting key.
 * Terminates when no single-swap improvement exists (local optimum).
 */
function hillClimbOnce(ciphertext) {
  let key = randomKey();
  let plain = decrypt(ciphertext, key);
  let score = scoreText(plain);

  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < 25; i++) {
      for (let j = i + 1; j < 26; j++) {
        const newKey = swapPositions(key, i, j);
        const newPlain = decrypt(ciphertext, newKey);
        const newScore = scoreText(newPlain);
        if (newScore > score) {
          key = newKey;
          plain = newPlain;
          score = newScore;
          improved = true;
        }
      }
    }
  }

  return { key, plaintext: plain, score };
}

/**
 * Solve a monoalphabetic cipher using hill climbing with restarts.
 *
 * @param {string} ciphertext  - The ciphertext (any case, spaces/punctuation OK)
 * @param {object} opts
 * @param {number} opts.restarts  - Number of random restarts (default: 20)
 * @param {boolean} opts.verbose  - Print progress per restart
 * @returns {{ key, plaintext, score, restarts }}
 */
function solve(ciphertext, opts = {}) {
  const restarts = opts.restarts || 20;
  const verbose = opts.verbose || false;
  const ct = cleanText(ciphertext);

  if (ct.length < 20) {
    console.warn(`Warning: ciphertext is only ${ct.length} chars. Monoalphabetic solving requires 50+ chars for reliable results.`);
  }

  let best = { key: randomKey(), plaintext: '', score: -Infinity };

  for (let r = 0; r < restarts; r++) {
    const result = hillClimbOnce(ct);
    if (verbose) {
      process.stdout.write(
        `  Restart ${r + 1}/${restarts}: score=${result.score.toFixed(1)}  ` +
        `"${result.plaintext.slice(0, 40)}"\n`
      );
    }
    if (result.score > best.score) {
      best = result;
    }
  }

  return { ...best, restarts, ciphertext: ct };
}

// ── Output formatting ──────────────────────────────────────────────────────────

function printResult(result, label) {
  const { key, plaintext, score, ciphertext, restarts } = result;
  console.log(`\n${'─'.repeat(70)}`);
  if (label) console.log(`Input: ${label}`);
  console.log(`Ciphertext: ${ciphertext.slice(0, 60)}${ciphertext.length > 60 ? '...' : ''}`);
  console.log(`Plaintext:  ${plaintext.slice(0, 60)}${plaintext.length > 60 ? '...' : ''}`);
  console.log(`Key:        ${key}`);
  console.log(`Score:      ${score.toFixed(3)} (${restarts} restarts)`);
}

// ── Key display helper ─────────────────────────────────────────────────────────

function printKey(key) {
  console.log(`\nCipher alphabet (ciphertext → plaintext mapping):`);
  console.log(`CT: ${ALPHA}`);
  console.log(`PT: ${key}`);
}

// ── CLI entry point ────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Hill-Climbing Monoalphabetic Solver — Cipher Museum

USAGE:
  node scripts/hill-climbing-solver.js "CIPHERTEXT"
  node scripts/hill-climbing-solver.js --file path/to/ciphertext.txt
  node scripts/hill-climbing-solver.js --corpus public/corpus/beginner.jsonl [--limit N]
  node scripts/hill-climbing-solver.js --restarts N [other options]

OPTIONS:
  --restarts N   Number of random restarts (default: 20; more = more accurate)
  --verbose      Print each restart's score and first 40 chars
  --limit N      Max records to test from corpus file

EXAMPLES:
  # Solve a direct ciphertext:
  node scripts/hill-climbing-solver.js "WKHHQHPBDWWDFNVDWGDZQ"

  # Solve from a text file:
  node scripts/hill-climbing-solver.js --file tests/sample.txt --restarts 50 --verbose

  # Test against corpus records (monoalphabetic only):
  node scripts/hill-climbing-solver.js --corpus public/corpus/beginner.jsonl --limit 5 --verbose
`);
    process.exit(0);
  }

  let ciphertext = null;
  let filePath = null;
  let corpusPath = null;
  let restarts = 20;
  let verbose = false;
  let limit = Infinity;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file') filePath = args[++i];
    else if (args[i] === '--corpus') corpusPath = args[++i];
    else if (args[i] === '--restarts') restarts = parseInt(args[++i], 10);
    else if (args[i] === '--limit') limit = parseInt(args[++i], 10);
    else if (args[i] === '--verbose') verbose = true;
    else if (!args[i].startsWith('--')) ciphertext = args[i];
  }

  if (filePath) {
    ciphertext = fs.readFileSync(filePath, 'utf8').trim();
  }

  if (corpusPath) {
    // Batch test against monoalphabetic corpus records
    const lines = fs.readFileSync(corpusPath, 'utf8').split('\n').filter(l => l.trim());
    const monoRecords = lines
      .map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(r => r && r.cipher_type === 'monoalphabetic' && r.language === 'en'
                && r.transcription_quality === 'clean' && r.source_type !== 'historical');

    const testRecords = monoRecords.slice(0, limit);
    console.log(`Testing ${testRecords.length} monoalphabetic records from ${corpusPath}`);

    let correct = 0;
    for (const record of testRecords) {
      const result = solve(record.ciphertext, { restarts, verbose });
      const expected = cleanText(record.plaintext);
      const got = cleanText(result.plaintext);
      const match = got === expected;
      if (match) correct++;
      console.log(`\n[${record.id}] ${match ? '✓' : '✗'}`);
      console.log(`  Expected:  ${expected.slice(0, 50)}`);
      console.log(`  Got:       ${got.slice(0, 50)}`);
      console.log(`  Score: ${result.score.toFixed(1)}`);
    }
    console.log(`\nAccuracy: ${correct}/${testRecords.length} (${(100 * correct / testRecords.length).toFixed(1)}%)`);
    process.exit(0);
  }

  if (!ciphertext) {
    console.error('Error: provide ciphertext as argument, --file, or --corpus');
    process.exit(1);
  }

  console.log('Solving monoalphabetic cipher using hill climbing...');
  const result = solve(ciphertext, { restarts, verbose });
  printResult(result);
  printKey(result.key);
}

module.exports = { solve, scoreText, decrypt, cleanText, hillClimbOnce };
