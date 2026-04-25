#!/usr/bin/env node
/**
 * Tests for the Lorenz Depth-Attack engine (js/ciphers/lorenz-depth.js).
 * Run: node tests/test-lorenz-depth.js
 */
'use strict';

const { xorStrings, makeDepth, crackDepth, cribDrag, isLikelyEnglish } =
  require('../js/ciphers/lorenz-depth.js');

let pass = 0, fail = 0;
const failures = [];
function assert(name, ok, detail) {
  if (ok) { pass++; console.log(`  ✅  ${name}`); }
  else { fail++; failures.push(name); console.log(`  ❌  ${name}` + (detail ? `  →  ${detail}` : '')); }
}

console.log('━━━ Lorenz Depth-Attack Engine ━━━');

// 1. XOR involution
const a = 'HELLO WORLD';
const k = 'KEYKEYKEYKE';
const c = xorStrings(a, k);
assert('XOR is involutive: (a XOR k) XOR k === a', xorStrings(c, k) === a);

// 2. makeDepth: keystream truly cancels
const p1 = 'THE GERMAN HIGH COMMAND ATTACKS AT DAWN ON THE EASTERN FRONT';
const p2 = 'OBERKOMMANDO DER WEHRMACHT GREIFT IM OSTEN BEI MORGENGRAUEN';
const key = 'LORENZSZ40KEY';
const { c1, c2, depth } = makeDepth(p1, p2, key);
assert('depth equals P1 XOR P2', depth === xorStrings(p1.slice(0, depth.length), p2.slice(0, depth.length)));
assert('crackDepth(c1, c2) === depth', crackDepth(c1, c2) === depth);

// 3. Crib-drag finds the correct offset for a known crib
// Crib "ATTACKS" appears at offset 24 in P1 → at that offset, P2's
// slice "GREIFT " (or whatever) should appear in the candidate.
const crib1 = 'ATTACKS';
const off1 = p1.indexOf(crib1);
assert('p1 contains the test crib', off1 >= 0);
const expected = p2.substr(off1, crib1.length); // what we should recover
const ranked = cribDrag(depth, crib1);
assert('cribDrag returns at least one result', ranked.length > 0);
const best = ranked[0];
assert(`cribDrag's top hit is at offset ${off1}`, best.offset === off1,
  `got offset=${best.offset} candidate="${best.candidate}"`);
assert(`cribDrag's top candidate matches p2 slice`, best.candidate === expected,
  `expected "${expected}" got "${best.candidate}"`);

// 4. Symmetric: cribbing on P2 also recovers P1
const crib2 = 'WEHRMACHT';
const off2 = p2.indexOf(crib2);
const expectedRev = p1.substr(off2, crib2.length);
const rankedRev = cribDrag(depth, crib2);
assert(`cribDrag on p2's crib recovers p1 slice`,
  rankedRev[0].offset === off2 && rankedRev[0].candidate === expectedRev,
  `got offset=${rankedRev[0].offset} candidate="${rankedRev[0].candidate}"`);

// 5. Real cribs score dramatically higher than garbage cribs
const wrong = cribDrag(depth, 'ZZZZZZZZ');
const realCrib = cribDrag(depth, 'ATTACKS');
const wrongTop = wrong[0] ? wrong[0].score : 0;
const realTop = realCrib[0].score;
assert('real crib scores at least 2x higher than garbage crib',
  realTop >= wrongTop * 2,
  `real=${realTop.toFixed(2)} garbage=${wrongTop.toFixed(2)}`);

// 6. isLikelyEnglish discriminates
assert('isLikelyEnglish("THE QUICK") > isLikelyEnglish("ZZZZZZZZ")',
  isLikelyEnglish('THE QUICK') > isLikelyEnglish('ZZZZZZZZ'));
assert('isLikelyEnglish rejects control bytes', isLikelyEnglish('AB\x01CD') === 0);

// 7. Empty inputs are safe
assert('cribDrag with empty crib returns []', cribDrag(depth, '').length === 0);
assert('xorStrings with empty input returns ""', xorStrings('', 'KEY') === '');

console.log(`\n${pass} passed · ${fail} failed`);
if (fail > 0) {
  console.log('\nFailures:');
  failures.forEach(f => console.log('  - ' + f));
  process.exit(1);
}
