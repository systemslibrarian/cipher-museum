#!/usr/bin/env node
/**
 * Tests for the Caesar Auto-Break engine (js/ciphers/caesar-break.js).
 * Run: node tests/test-caesar-break.js
 */
'use strict';

const { breakCaesar, scoreEnglishChiSquared, shiftText } =
  require('../js/ciphers/caesar-break.js');

let pass = 0, fail = 0;
const failures = [];

function assert(name, ok, detail) {
  if (ok) { pass++; console.log(`  ✅  ${name}`); }
  else { fail++; failures.push(name); console.log(`  ❌  ${name}` + (detail ? `  →  ${detail}` : '')); }
}

console.log('━━━ Caesar Auto-Break Engine ━━━');

// 1. shiftText round-trip
const plain = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG';
for (let s = 1; s <= 25; s++) {
  const enc = shiftText(plain, s);
  const dec = shiftText(enc, 26 - s);
  assert(`shift ${s} round-trips`, dec === plain);
}

// 2. Known Caesar shift-3 vector
assert(
  'shift(3) "HELLO WORLD" → "KHOOR ZRUOG"',
  shiftText('HELLO WORLD', 3) === 'KHOOR ZRUOG',
  shiftText('HELLO WORLD', 3),
);

// 3. Chi-squared favours real English
const english = 'THIS IS A SAMPLE OF ENGLISH TEXT WITH NORMAL LETTER FREQUENCIES';
const garbage = 'XQZJVKQXZJVKQXZJVKQXZJVKQXZJVKQXZJVKQXZJVKQXZJVKQXZJVK';
assert('chi-squared(english) < chi-squared(garbage)',
  scoreEnglishChiSquared(english) < scoreEnglishChiSquared(garbage));

// 4. Auto-break finds the correct shift on a long-enough sample
const samples = [
  { plain: 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG', shift: 3 },
  { plain: 'WE HOLD THESE TRUTHS TO BE SELF EVIDENT THAT ALL MEN ARE CREATED EQUAL', shift: 7 },
  { plain: 'IT WAS THE BEST OF TIMES IT WAS THE WORST OF TIMES IT WAS THE AGE OF WISDOM', shift: 17 },
  { plain: 'TO BE OR NOT TO BE THAT IS THE QUESTION WHETHER TIS NOBLER IN THE MIND', shift: 23 },
  { plain: 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG', shift: 23 }, // sprint challenge string
];
for (const s of samples) {
  const cipher = shiftText(s.plain, s.shift);
  const ranked = breakCaesar(cipher);
  assert(`auto-break finds shift ${s.shift} as top result`,
    ranked[0].shift === s.shift && ranked[0].plaintext === s.plain,
    `got shift=${ranked[0].shift} text="${ranked[0].plaintext.slice(0, 40)}…"`);
  assert(`auto-break returns 25 candidates`, ranked.length === 25);
  // Sorted ascending by score
  let sorted = true;
  for (let i = 1; i < ranked.length; i++) {
    if (ranked[i].score < ranked[i - 1].score) { sorted = false; break; }
  }
  assert(`auto-break results sorted by ascending score`, sorted);
}

// 5. Empty input is safe
const empty = breakCaesar('');
assert('empty input returns 25 entries with score=Infinity',
  empty.length === 25 && empty.every(c => !isFinite(c.score)));

console.log(`\n${pass} passed · ${fail} failed`);
if (fail > 0) {
  console.log('\nFailures:');
  failures.forEach(f => console.log('  - ' + f));
  process.exit(1);
}
