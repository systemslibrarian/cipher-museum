#!/usr/bin/env node
/**
 * Tests for the ELS engine (js/ciphers/els.js).
 * Run: node tests/test-els.js
 */
'use strict';
const { normalise, findELS, expectedHits } = require('../js/ciphers/els.js');

let pass = 0, fail = 0;
const failures = [];
function assert(name, ok, detail) {
  if (ok) { pass++; console.log(`  ✅  ${name}`); }
  else { fail++; failures.push(name); console.log(`  ❌  ${name}` + (detail ? `  →  ${detail}` : '')); }
}

console.log('━━━ ELS Engine ━━━');

// 1. normalise: strips punctuation, spaces, digits; uppercases letters
assert('normalise strips punctuation/spaces',
  normalise("Hello, World! 123") === 'HELLOWORLD');
assert('normalise empty string', normalise('') === '');
assert('normalise null/undefined safe', normalise(null) === '' && normalise(undefined) === '');

// 2. Construct a text where we KNOW the ELS exists.
//    Plant "BIBLE" with skip d=4 starting at position 0:
//    B___I___B___L___E
const planted = 'BXXXIYYYBZZZL___EQQQ'.replace(/_/g, 'A');
const hits = findELS(planted, 'BIBLE', { minSkip: 2, maxSkip: 10 });
const found = hits.find(h => h.skip === 4 && h.start === 0);
assert('finds planted ELS at skip=4, start=0', !!found,
  `hits=${JSON.stringify(hits)}`);

// 3. Skip-1 reads (which would be the literal word) are excluded by
//    default minSkip=2 — exactly what the original Witztum protocol does.
const literal = findELS('THEBIBLEISHERE', 'BIBLE', { minSkip: 2 });
assert('default minSkip excludes literal word (skip=1)',
  !literal.some(h => h.skip === 1));

// 4. Force minSkip=1 and the literal word is found.
const literalForced = findELS('THEBIBLEISHERE', 'BIBLE', { minSkip: 1 });
assert('with minSkip=1, literal word is found',
  literalForced.some(h => h.skip === 1));

// 5. Empty target returns nothing.
assert('empty target returns []', findELS('ABCDEF', '').length === 0);
assert('empty text returns []', findELS('', 'WORD').length === 0);

// 6. maxResults caps the output.
//    A long run of 'A's means "AAA" appears at every (start, skip).
const aaa = 'A'.repeat(500);
const capped = findELS(aaa, 'AAA', { minSkip: 2, maxSkip: 50, maxResults: 10 });
assert('maxResults caps output', capped.length === 10);

// 7. The McKay critique, made empirical.
//    Generate a long pseudo-random English-frequency text and find a
//    short common-letter target. expectedHits should predict roughly
//    the order of magnitude of actual hits.
function pseudoEnglish(n, seed) {
  // Tiny LCG so the test is deterministic.
  let s = seed >>> 0;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000; };
  const letters = 'EEEEEEEEEEEEETTTTTTTTTAAAAAAAAOOOOOOOOIIIIIIIINNNNNNNSSSSSSSHHHHHHHRRRRRRRDDDDDLLLLCCCCUMMMWWFFGGYYPPBVVKJXQZ';
  let out = '';
  for (let i = 0; i < n; i++) out += letters[Math.floor(rand() * letters.length)];
  return out;
}
const corpus = pseudoEnglish(50000, 42);
const real = findELS(corpus, 'TIE', { minSkip: 2, maxSkip: 200, maxResults: 100000 }).length;
const predicted = expectedHits(50000, 'TIE', { minSkip: 2, maxSkip: 200 });
// "Within 3x" is a fair tolerance for a back-of-envelope analytic model
// applied to a 50k character pseudo-random sample.
assert(`expectedHits is within 3x of actual (predicted=${predicted.toFixed(1)} actual=${real})`,
  real > 0 && Math.abs(Math.log(real / predicted)) < Math.log(3));

// 8. The point of the exhibit, in test form: ANY short common-letter
//    target finds plentiful hits in a long English-frequency text.
const easyTargets = ['CAR', 'WAR', 'OIL', 'TEA'];
const allFound = easyTargets.every(t =>
  findELS(corpus, t, { minSkip: 2, maxSkip: 200, maxResults: 1 }).length > 0);
assert('every short common target appears at some skip in a 50k random corpus', allFound);

// 9. Hit positions are correct: text[start + k*skip] === target[k] for all k.
const verifyHit = (text, target, h) => {
  const t = normalise(text);
  const tg = normalise(target);
  for (let k = 0; k < tg.length; k++) {
    if (t[h.start + k * h.skip] !== tg[k]) return false;
  }
  return true;
};
const real5 = findELS(corpus, 'STAR', { minSkip: 2, maxSkip: 100, maxResults: 5 });
assert('every reported hit actually spells the target',
  real5.length > 0 && real5.every(h => verifyHit(corpus, 'STAR', h)));

console.log(`\n${pass} passed · ${fail} failed`);
if (fail > 0) {
  console.log('\nFailures:');
  failures.forEach(f => console.log('  - ' + f));
  process.exit(1);
}
