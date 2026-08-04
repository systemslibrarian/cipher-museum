#!/usr/bin/env node
'use strict';

/**
 * Exhibit-count consistency guard.
 *
 * The museum quotes its own size on about a dozen surfaces, and every one of
 * them carries a hardcoded copy. Those copies have drifted four separate times:
 * the homepage saying 160 while search said something else, a sitemap comment
 * stuck on an old Foundations range, a search status line that had been
 * counting halls and utility pages as exhibits, and a stale "139" fallback that
 * outlived the exhibit it referred to.
 *
 * Every previous fix was a hand-edit of the surfaces, which is why it kept
 * coming back. This checks them against ground truth instead — what is actually
 * on disk, via scripts/build-counts.js — so the next drift fails here.
 *
 * If this test fails after you legitimately add or remove an exhibit:
 *   1. node scripts/build-counts.js     (recompute data/exhibit-counts.json)
 *   2. update the surfaces it names below
 * The numbers are deliberately NOT auto-rewritten into the prose. They sit
 * inside sentences that need a human to keep readable.
 */

const fs = require('fs');
const path = require('path');
const { computeCounts } = require('../scripts/build-counts.js');

const ROOT = path.resolve(__dirname, '..');
const counts = computeCounts();

let passed = 0;
const failures = [];

function ok(label, condition, detail) {
  if (condition) { passed++; return; }
  failures.push({ label, detail });
}

// ── the generated file must match ground truth ──────────────────────────────
const generatedPath = path.join(ROOT, 'data', 'exhibit-counts.json');
ok('data/exhibit-counts.json exists', fs.existsSync(generatedPath),
  'run: node scripts/build-counts.js');
if (fs.existsSync(generatedPath)) {
  const generated = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));
  for (const key of Object.keys(counts)) {
    ok(`exhibit-counts.json ${key} is current`, generated[key] === counts[key],
      `file says ${generated[key]}, disk says ${counts[key]} — run node scripts/build-counts.js`);
  }
}

// ── every count quoted in prose must agree ──────────────────────────────────
// Checked as exact phrases rather than loose number-hunting. The site legitimately
// quotes subset figures too ("the remaining 30 exhibits are biographies", "the
// 17-exhibit Foundations annex"), and a greedy pattern flags those as drift.
//
// Scope note: comparison.html counts only cipher SYSTEMS — no biographies or
// context pages — so its own "N of N" is a different measurement and is not
// checked against the exhibit totals.
const REQUIRED = [
  ['index.html',      `${counts.total} exhibits`,          'homepage total'],
  ['index.html',      `${counts.ciphers} ciphers`,         'homepage cipher count'],
  ['museum-map.html', `${counts.ciphers} cipher exhibits`, 'map roster heading'],
  ['museum-map.html', `${counts.total} exhibits`,          'map total'],
  ['README.md',       `${counts.total} exhibits`,          'README total'],
  ['README.md',       `${counts.ciphers} cipher exhibits`, 'README cipher count'],
  ['js/footer.js',    `${counts.total} exhibits`,          'site footer'],
  ['museum-map.html', `${counts.foundationsFirst}\u2013${counts.foundationsLast}`, 'Foundations range'],
  ['README.md',       `\u00a7${counts.foundationsFirst}\u2013${counts.foundationsLast}`, 'README Foundations range'],
  ['sitemap.xml',     `exhibits ${counts.foundationsFirst}-${counts.foundationsLast}`, 'sitemap Foundations comment']
];

for (const [rel, phrase, what] of REQUIRED) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { ok(`${rel} exists`, false, 'surface missing'); continue; }
  const text = fs.readFileSync(file, 'utf8');
  ok(`${rel}: ${what} says "${phrase}"`, text.includes(phrase),
    `expected to find "${phrase}" — the count changed, or the wording did`);
}

// Values that were wrong on a live surface at some point. If one reappears in a
// count-shaped context, that is drift returning, not a coincidence.
const STALE = [
  { value: '139', why: 'cipher count before Wadsworth replaced Joseon' },
  { value: '156', why: 'Foundations range before it grew to 157' },
  { value: '188', why: 'search index entry count mistaken for exhibits' }
];
const COUNT_CONTEXT = v => new RegExp(
  `(${v}\\s+exhibits|${v}\\s+ciphers|of\\s+${v}\\b|\u00a7\\d+[\u2013-]${v}\\b|exhibits\\s+\\d+-${v}\\b)`);

// Surfaces that quote the museum's size in prose or UI strings.
const SURFACES = ['index.html', 'museum-map.html', 'README.md', 'search.html',
  'timeline.html', 'teaching.html', 'sitemap.xml', 'js/footer.js'];

for (const rel of SURFACES) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const { value, why } of STALE) {
    const hit = COUNT_CONTEXT(value).exec(text);
    ok(`${rel}: no stale "${value}"`, hit === null,
      hit ? `found "${hit[0]}" — ${why}` : '');
  }
}

// ── the exhibit pages' own "Exhibit N of TOTAL" chips ───────────────────────
const cipherDir = path.join(ROOT, 'ciphers');
for (const f of fs.readdirSync(cipherDir).filter(n => n.endsWith('.html'))) {
  const text = fs.readFileSync(path.join(cipherDir, f), 'utf8');
  const chip = /Exhibit\s+(\d+)\s+of\s+(\d+)/.exec(text);
  if (!chip) continue;
  ok(`${f}: chip denominator`, Number(chip[2]) === counts.ciphers,
    `says "of ${chip[2]}", should be "of ${counts.ciphers}"`);
  ok(`${f}: chip numerator in range`,
    Number(chip[1]) >= 1 && Number(chip[1]) <= counts.protocolsLast,
    `exhibit number ${chip[1]} is outside 1..${counts.protocolsLast}`);
}

console.log(`\n━━━ Exhibit-count consistency ━━━\n`);
console.log(`  ground truth: ${counts.ciphers} ciphers + ${counts.foundations} foundations ` +
  `+ ${counts.protocols} protocols = ${counts.total}, across ${counts.halls} halls\n`);
console.log('══════════════════════════════════════════════════════════════════════');
console.log(`  ✅ ${passed} passed   ❌ ${failures.length} failed`);
console.log('══════════════════════════════════════════════════════════════════════\n');

if (failures.length) {
  console.error('Failures:');
  for (const f of failures) console.error(`  ❌  ${f.label}\n      ${f.detail}`);
  process.exit(1);
}
