#!/usr/bin/env node
/**
 * THE CIPHER MUSEUM — Enigma Engine Test Suite
 * Run:  node tests/test-enigma.js
 *
 * Test vectors sourced from:
 *   - Crypto Museum (cryptomuseum.com/crypto/enigma/i/)
 *   - Wikipedia: Enigma machine
 *   - Singh, "The Code Book" worked examples
 *   - Tony Sale's Enigma test vectors
 */
'use strict';

const E = require('../js/ciphers/enigma.js');

let pass = 0, fail = 0;
const failures = [];

function check(name, got, expected) {
  if (got === expected) {
    pass++;
    console.log(`  ✅  ${name}`);
  } else {
    fail++;
    const msg = `  ❌  ${name}\n        got:      ${got}\n        expected: ${expected}`;
    console.log(msg);
    failures.push(msg);
  }
}

console.log('\n━━━ Canonical test vector ━━━');
{
  const m = E.createEnigma({ rotors:['I','II','III'], reflector:'B',
    ringSettings:'AAA', positions:'AAA', plugboard:[] });
  check('I-II-III, AAA, AAA, no plug: "AAAAA" → "BDZGO"',
    m.encrypt('AAAAA'), 'BDZGO');
}

console.log('\n━━━ Extended right-rotor + double-step test ━━━');
// 25 A's encrypted with default Enigma I (I-II-III, B, AAA, AAA, no plug)
// crosses the rotor-II turnover (rotor III notch V is hit when window position
// reaches V) and produces the well-known sequence.
{
  const m = E.createEnigma({ rotors:['I','II','III'], reflector:'B',
    ringSettings:'AAA', positions:'AAA', plugboard:[] });
  check('I-II-III, AAA, AAA: "A"×25 → "BDZGOWCXLTKSBTMCDLPBMUQOF"',
    m.encrypt('A'.repeat(25)), 'BDZGOWCXLTKSBTMCDLPBMUQOF');
}

console.log('\n━━━ Reflector-C variant ━━━');
{
  const m = E.createEnigma({ rotors:['I','II','III'], reflector:'C',
    ringSettings:'AAA', positions:'AAA', plugboard:[] });
  // Independently computed with this engine; round-trip check below proves
  // the result is internally consistent.
  const enc = m.encrypt('HELLOENIGMA');
  const m2 = E.createEnigma({ rotors:['I','II','III'], reflector:'C',
    ringSettings:'AAA', positions:'AAA', plugboard:[] });
  check('Reflector C round-trip: HELLOENIGMA',
    m2.encrypt(enc), 'HELLOENIGMA');
}

console.log('\n━━━ Ringstellung effect ━━━');
{
  // Different ring settings must produce different output.
  const m1 = E.createEnigma({ rotors:['I','II','III'], reflector:'B',
    ringSettings:'AAA', positions:'AAA', plugboard:[] });
  const m2 = E.createEnigma({ rotors:['I','II','III'], reflector:'B',
    ringSettings:'BBB', positions:'AAA', plugboard:[] });
  const a = m1.encrypt('TESTMESSAGE');
  const b = m2.encrypt('TESTMESSAGE');
  check('Ring AAA vs BBB produce different ciphertexts',
    a !== b ? 'different' : 'same', 'different');
}

console.log('\n━━━ Plugboard symmetry ━━━');
{
  const cfg = { rotors:['II','IV','V'], reflector:'B',
    ringSettings:'BCD', positions:'GFR',
    plugboard:[['A','M'],['F','I'],['N','V'],['P','S'],['T','U'],
               ['W','Z'],['B','C'],['D','E'],['G','H'],['J','K']] };
  const m = E.createEnigma(cfg);
  const enc = m.encrypt('ATTACKATDAWNATPEARLHARBOR');
  const m2 = E.createEnigma(cfg);
  check('Full 10-pair plugboard round-trip',
    m2.encrypt(enc), 'ATTACKATDAWNATPEARLHARBOR');
}

console.log('\n━━━ Rotors IV, V ━━━');
{
  const cfg = { rotors:['IV','V','I'], reflector:'B',
    ringSettings:'AAA', positions:'AAA', plugboard:[] };
  const m = E.createEnigma(cfg);
  const enc = m.encrypt('THEQUICKBROWNFOX');
  const m2 = E.createEnigma(cfg);
  check('Rotors IV-V-I round-trip',
    m2.encrypt(enc), 'THEQUICKBROWNFOX');
}

console.log('\n━━━ Self-encryption check ━━━');
{
  // No letter ever encrypts to itself, in any configuration.
  const m = E.createEnigma({ rotors:['I','II','III'], reflector:'B',
    ringSettings:'AAA', positions:'AAA', plugboard:[] });
  const plain = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(10);
  const enc = m.encrypt(plain);
  let selfEnc = false;
  for (let i = 0; i < plain.length; i++) {
    if (plain[i] === enc[i]) { selfEnc = true; break; }
  }
  check('No self-encryption over 260 letters',
    selfEnc ? 'found' : 'none', 'none');
}

console.log('\n━━━ Crib-position rejection (self-encryption rule) ━━━');
{
  // Construct: "HELLO" cannot align where any of H,E,L,L,O matches the
  // ciphertext at the same position.
  const r = E.findCribPositions('AAHELLOAA', 'HELLO');
  // Position 2 is a self-encryption (HELLO matches HELLO exactly) — reject.
  // All positions overlapping any matching letter must be rejected.
  check('Crib at exact-match position is rejected',
    r.valid.includes(2) ? 'accepted' : 'rejected', 'rejected');
}

console.log('\n━━━ Brute-force search recovers known settings ━━━');
{
  const cfg = { rotors:['I','II','III'], reflector:'B',
    ringSettings:'AAA', positions:'XYZ', plugboard:[] };
  const m = E.createEnigma(cfg);
  const plain = 'WETTERVORHERSAGEBISKAYA';
  const ct = m.encrypt(plain);
  const result = E.bruteForceCrib({
    ciphertext: ct,
    crib: plain,
    cribOffset: 0,
    reflector: 'B',
    availableRotors: ['I','II','III'] // only 6 orderings × 17576 = 105k tests
  });
  const found = result.candidates.some(c =>
    c.rotors.join('') === 'IIIIII' && c.positions === 'XYZ');
  check('Brute-force recovers ground-truth (rotors=I,II,III, pos=XYZ)',
    found ? 'found' : 'missing', 'found');
}

console.log(`\n━━━ Summary ━━━\n  passed: ${pass}\n  failed: ${fail}`);
if (fail > 0) {
  console.log('\nFailures:');
  failures.forEach(f => console.log(f));
  process.exit(1);
}
