#!/usr/bin/env node
/**
 * build-quadgrams.js — Compute English quadgram statistics from the corpus.
 *
 * Reads beginner.jsonl English plaintexts and computes log10 probabilities
 * for every 4-letter sequence (quadgram). The output is used by:
 *   - scripts/hill-climbing-solver.js
 *   - scripts/sa-solver.js
 *
 * Usage:
 *   node scripts/build-quadgrams.js
 *
 * Output:
 *   scripts/data/english-quadgrams.json
 */

'use strict';

const fs = require('fs');
const path = require('path');

const CORPUS_FILE = path.join(__dirname, '..', 'public', 'corpus', 'beginner.jsonl');
const OUT_FILE = path.join(__dirname, 'data', 'english-quadgrams.json');

if (!fs.existsSync(CORPUS_FILE)) {
  console.error(`Corpus file not found: ${CORPUS_FILE}`);
  console.error('Run corpus generation first.');
  process.exit(1);
}

const counts = {};
let total = 0;

const lines = fs.readFileSync(CORPUS_FILE, 'utf8').split('\n').filter(l => l.trim());
let processed = 0;

for (const line of lines) {
  try {
    const r = JSON.parse(line);
    if (r.language !== 'en') continue;
    const text = r.plaintext.replace(/[^A-Z]/g, '');
    for (let i = 0; i <= text.length - 4; i++) {
      const q = text.slice(i, i + 4);
      counts[q] = (counts[q] || 0) + 1;
      total++;
    }
    processed++;
  } catch {
    // skip malformed lines
  }
}

const logProbs = {};
for (const [q, c] of Object.entries(counts)) {
  logProbs[q] = Math.log10(c / total);
}

const floor = Math.log10(0.01 / total);

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify({ logProbs, floor, total }));

const top10 = Object.entries(logProbs)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([q, v]) => `${q}:${v.toFixed(2)}`);

console.log(`Processed ${processed} English records from ${CORPUS_FILE}`);
console.log(`Unique quadgrams: ${Object.keys(logProbs).length}`);
console.log(`Total quadgrams:  ${total}`);
console.log(`Floor value:      ${floor.toFixed(4)}`);
console.log(`Top 10:           ${top10.join('  ')}`);
console.log(`Written to:       ${OUT_FILE}`);
