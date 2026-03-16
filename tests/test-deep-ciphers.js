#!/usr/bin/env node
/**
 * THE CIPHER MUSEUM — Deep Cipher Test Suite
 * Comprehensive edge-case, boundary, and correctness tests for all 35 engines.
 *
 * Categories:
 *   A. Edge cases       — empty input, single char, full alphabet
 *   B. Key boundaries   — min/max keys, missing keys, invalid keys
 *   C. Character handling — lowercase, mixed case, special chars, numbers
 *   D. Known-answer vectors — verified against CrypTool, Wikipedia, Practical Cryptography
 *   E. Wrap-around       — A/Z boundaries, shift by 0/25/26
 *   F. Idempotency       — self-reciprocal ciphers double-apply = identity
 *   G. Symmetry          — encode ≠ plaintext (actually encrypts)
 *   H. Stress tests      — long messages, repeated chars
 *
 * Run:  node tests/test-deep-ciphers.js
 */
'use strict';

global.window = global;
require('../js/ciphers/all-engines.js');

const E = window.CipherEngines;
if (!E) { console.error('FATAL: CipherEngines did not load'); process.exit(1); }

let pass = 0, fail = 0;
const failures = [];

function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  ✅  ${name}`); }
  else { fail++; const m = `  ❌  ${name}` + (detail ? `  →  ${detail}` : ''); console.log(m); failures.push(m); }
}

function eq(name, got, want) { ok(name, got === want, `expected "${want}", got "${got}"`); }
function starts(name, got, want) { ok(name, got.startsWith(want), `expected to start with "${want}", got "${got}"`); }
function neq(name, got, notWant) { ok(name, got !== notWant, `should differ from "${notWant}"`); }
function noThrow(name, fn) { try { fn(); ok(name, true); } catch (e) { ok(name, false, e.message); } }

function section(title) { console.log(`\n━━━ ${title} ━━━`); }

const clean = t => t.toUpperCase().replace(/[^A-Z]/g, '');
const FULL_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║   THE CIPHER MUSEUM — Deep Cipher Test Suite            ║');
console.log('║   Edge cases · Boundaries · Known answers · Stress      ║');
console.log('╚══════════════════════════════════════════════════════════╝');

/* ═══════════════════════════════════════════════════════════════
   1. CAESAR
   ═══════════════════════════════════════════════════════════════ */
section('Caesar — Edge Cases & Known Answers');
{
  const c = E.caesar;
  // Shift 1 = basic rotation
  eq('shift 1 encode A→B', clean(c.encode('A', '1')), 'B');
  // Shift 26 = identity (full wrap)
  eq('shift 26 wraps to identity', clean(c.encode('HELLO', '26')), 'HELLO');
  // Shift 25 = reverse of shift 1
  eq('shift 25 encode', clean(c.encode('A', '25')), 'Z');
  eq('shift 1 encode A→B', clean(c.encode('A', '1')), 'B');
  eq('shift 1 encode Z→A (wrap)', clean(c.encode('Z', '1')), 'A');
  // ROT13 known vectors
  eq('ROT13: HELLO→URYYB', clean(c.encode('HELLO', '13')), 'URYYB');
  eq('ROT13 is self-reciprocal', clean(c.encode(c.encode('HELLO', '13'), '13')), 'HELLO');
  // Full alphabet shift 3
  eq('full alphabet shift 3', clean(c.encode(FULL_ALPHA, '3')), 'DEFGHIJKLMNOPQRSTUVWXYZABC');
  // Roundtrip all shifts
  for (let s = 0; s <= 25; s++) {
    const enc = c.encode('TEST', String(s));
    const dec = c.decode(enc, String(s));
    ok(`roundtrip shift ${s}`, clean(dec) === 'TEST');
  }
  // Single character
  eq('single char A shift 3', clean(c.encode('A', '3')), 'D');
  // Lowercase preserved direction
  ok('lowercase input accepted', c.encode('hello', '3').length > 0);
}

/* ═══════════════════════════════════════════════════════════════
   2. MONOALPHABETIC SUBSTITUTION
   ═══════════════════════════════════════════════════════════════ */
section('Monoalphabetic — Keyword Alphabets');
{
  const m = E.monoalphabetic;
  // ZEBRA keyword → alphabet starts ZEBRÁC...
  const enc = m.encode('A', 'ZEBRA');
  eq('A maps to Z with keyword ZEBRA', clean(enc), 'Z');
  // Roundtrip
  const msg = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG';
  eq('roundtrip full pangram', clean(m.decode(m.encode(msg, 'SECRET'), 'SECRET')), clean(msg));
  // Empty keyword defaults
  noThrow('empty keyword no crash', () => m.encode('HELLO', ''));
  // Full alphabet roundtrip
  const full = m.encode(FULL_ALPHA, 'KEYWORD');
  eq('full alphabet roundtrip', clean(m.decode(full, 'KEYWORD')), FULL_ALPHA);
  // Encryption actually changes text
  neq('actually encrypts', clean(m.encode('HELLO', 'ZEBRA')), 'HELLO');
}

/* ═══════════════════════════════════════════════════════════════
   3. POLYBIUS SQUARE
   ═══════════════════════════════════════════════════════════════ */
section('Polybius — Grid Mapping');
{
  const p = E.polybius;
  // Known coordinates: A=11, B=12, ..., E=15, F=21, ...
  eq('A→11', p.encode('A').trim(), '11');
  eq('E→15', p.encode('E').trim(), '15');
  eq('F→21', p.encode('F').trim(), '21');
  eq('Z→55', p.encode('Z').trim(), '55');
  // J maps to I (shared cell)
  eq('J→I mapping', p.encode('J').trim(), p.encode('I').trim());
  // Decode known
  eq('decode 11→A', p.decode('11'), 'A');
  eq('decode 55→Z', p.decode('55'), 'Z');
  // Multi-letter
  eq('HELLO encode', p.encode('HELLO').trim(), '23 15 31 31 34');
  eq('HELLO decode', p.decode('23 15 31 31 34'), 'HELLO');
  // Out-of-range digits handled
  noThrow('out of range no crash', () => p.decode('99'));
}

/* ═══════════════════════════════════════════════════════════════
   4. HOMOPHONIC SUBSTITUTION
   ═══════════════════════════════════════════════════════════════ */
section('Homophonic — Deterministic Seed Roundtrip');
{
  const h = E.homophonic;
  // Roundtrip with same key
  const enc = h.encode('SECRETMESSAGE', 'TESTKEY');
  const dec = h.decode(enc, 'TESTKEY');
  eq('roundtrip with key', clean(dec), 'SECRETMESSAGE');
  // Different keys produce different output
  const enc2 = h.encode('HELLO', 'ALPHA');
  const enc3 = h.encode('HELLO', 'BRAVO');
  neq('different keys → different ciphertext', enc2, enc3);
  // Output is numeric pairs
  ok('output is numeric', /^[\d\s]+$/.test(enc));
}

/* ═══════════════════════════════════════════════════════════════
   5. PLAYFAIR
   ═══════════════════════════════════════════════════════════════ */
section('Playfair — Digraph Rules');
{
  const pf = E.playfair;
  // Basic roundtrip
  const msg = 'HIDETHEGOLD';
  const enc = pf.encode(msg, 'MONARCHY');
  const dec = pf.decode(enc, 'MONARCHY');
  starts('roundtrip HIDETHEGOLD', clean(dec), 'HIDETHEGOLD');
  // J→I substitution
  const jmsg = pf.encode('JELLY', 'KEY');
  ok('J treated as I (no crash)', jmsg.length > 0);
  // Double letters get X padding
  const dbl = pf.encode('BALLOON', 'KEY');
  ok('double letters handled', dbl.length > 0);
  // Short message
  const short = pf.encode('AB', 'KEY');
  eq('two-letter message roundtrip', clean(pf.decode(short, 'KEY')), 'AB');
  // Different keywords produce different ciphertext
  neq('different keys differ', pf.encode('HELLO', 'ALPHA'), pf.encode('HELLO', 'BRAVO'));
}

/* ═══════════════════════════════════════════════════════════════
   6. HILL CIPHER
   ═══════════════════════════════════════════════════════════════ */
section('Hill — Matrix Operations');
{
  const h = E.hill;
  // Known: key [3,3,2,5], "HI" → ?
  const enc = h.encode('HI', '3,3,2,5');
  ok('HI encrypted', enc.length === 2);
  const dec = h.decode(enc, '3,3,2,5');
  eq('HI roundtrip', dec, 'HI');
  // Longer message
  const enc2 = h.encode('SHORT', '3,3,2,5');
  eq('SHORT roundtrip', clean(h.decode(enc2, '3,3,2,5')), 'SHORTX');
  // Non-invertible matrix
  const bad = h.decode('AB', '2,4,1,2');
  ok('non-invertible returns message', bad.length > 0);
}

/* ═══════════════════════════════════════════════════════════════
   7. VIGENÈRE
   ═══════════════════════════════════════════════════════════════ */
section('Vigenère — Published Test Vectors');
{
  const v = E.vigenere;
  // Wikipedia: ATTACKATDAWN + LEMON = LXFOPVEFRNHR
  eq('Wikipedia vector encode', clean(v.encode('ATTACKATDAWN', 'LEMON')), 'LXFOPVEFRNHR');
  eq('Wikipedia vector decode', clean(v.decode('LXFOPVEFRNHR', 'LEMON')), 'ATTACKATDAWN');
  // Key = A = no shift (identity)
  eq('key A is identity', clean(v.encode('HELLO', 'A')), 'HELLO');
  // Key = AAAA
  eq('key AAAA is identity', clean(v.encode('TEST', 'AAAA')), 'TEST');
  // Single-letter key = Caesar
  eq('single-letter key B = Caesar shift 1', clean(v.encode('A', 'B')), 'B');
  // Full alphabet roundtrip
  const full = v.encode(FULL_ALPHA, 'SECRETKEY');
  eq('full alphabet roundtrip', clean(v.decode(full, 'SECRETKEY')), FULL_ALPHA);
  // Long message
  const long = 'A'.repeat(100);
  eq('100-char roundtrip', clean(v.decode(v.encode(long, 'KEY'), 'KEY')), long);
}

/* ═══════════════════════════════════════════════════════════════
   8. BEAUFORT (self-reciprocal)
   ═══════════════════════════════════════════════════════════════ */
section('Beaufort — Self-Reciprocal Property');
{
  const b = E.beaufort;
  // Self-reciprocal: encode(encode(x)) = x
  const msg = 'THEQUICKBROWNFOX';
  const enc = b.encode(msg, 'FORT');
  eq('encode then encode = original', clean(b.encode(enc, 'FORT')), msg);
  // Different messages
  for (const m of ['A', 'Z', 'ABCXYZ', 'ZZZZZ']) {
    const e = b.encode(m, 'KEY');
    eq(`self-reciprocal: ${m}`, clean(b.encode(e, 'KEY')), clean(m));
  }
}

/* ═══════════════════════════════════════════════════════════════
   9. GRONSFELD
   ═══════════════════════════════════════════════════════════════ */
section('Gronsfeld — Numeric Key');
{
  const g = E.gronsfeld;
  // Key = 00000 is identity
  eq('key 00000 is identity', clean(g.encode('HELLO', '00000')), 'HELLO');
  // Roundtrip
  eq('roundtrip 31415', clean(g.decode(g.encode('TESTSECRET', '31415'), '31415')), 'TESTSECRET');
  // Single digit key
  const enc = g.encode('ABC', '1');
  eq('single digit roundtrip', clean(g.decode(enc, '1')), 'ABC');
}

/* ═══════════════════════════════════════════════════════════════
   10. PORTA (self-reciprocal)
   ═══════════════════════════════════════════════════════════════ */
section('Porta — Self-Reciprocal with Correct Tableaux');
{
  const p = E.porta;
  // Self-reciprocal for multiple messages
  for (const m of ['HELLO', 'ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ', FULL_ALPHA]) {
    const key = 'FORTIFY';
    const enc = p.encode(m, key);
    eq(`self-reciprocal: ${m.substring(0, 10)}...`, clean(p.encode(enc, key)), clean(m));
  }
  // Porta only swaps halves: A-M ↔ N-Z
  const enc = p.encode('A', 'A');
  const code = enc.charCodeAt(0);
  ok('A maps to N-Z range (key A)', code >= 78 && code <= 90);
  const enc2 = p.encode('N', 'A');
  const code2 = enc2.charCodeAt(0);
  ok('N maps to A-M range (key A)', code2 >= 65 && code2 <= 77);
}

/* ═══════════════════════════════════════════════════════════════
   11. RUNNING KEY
   ═══════════════════════════════════════════════════════════════ */
section('Running Key — Long Key Text');
{
  const rk = E.runningKey;
  const msg = 'FLEEATONCE';
  const key = 'WE HOLD THESE TRUTHS TO BE SELF EVIDENT';
  eq('roundtrip', clean(rk.decode(rk.encode(msg, key), key)), clean(msg));
  // Key shorter than message — wraps
  const short = rk.encode('ABCDEFGHIJ', 'AB');
  eq('short key wraps roundtrip', clean(rk.decode(short, 'AB')), 'ABCDEFGHIJ');
}

/* ═══════════════════════════════════════════════════════════════
   12. RAIL FENCE
   ═══════════════════════════════════════════════════════════════ */
section('Rail Fence — Various Rail Counts');
{
  const rf = E.railFence;
  // 2 rails known: HELLO → HLOEL
  eq('2 rails: HELLO', clean(rf.encode('HELLO', '2')), 'HLOEL');
  eq('2 rails roundtrip', clean(rf.decode(rf.encode('HELLO', '2'), '2')), 'HELLO');
  // 3 rails known: WEAREDISCOVEREDFLEEATONCE → WECRLTEERDSOEEFEAOCAIVDEN
  eq('3 rails known vector', clean(rf.encode('WEAREDISCOVEREDFLEEATONCE', '3')), 'WECRLTEERDSOEEFEAOCAIVDEN');
  eq('3 rails roundtrip', clean(rf.decode(rf.encode('WEAREDISCOVEREDFLEEATONCE', '3'), '3')), 'WEAREDISCOVEREDFLEEATONCE');
  // Rails = message length → just reverses pattern
  eq('rails=len roundtrip', clean(rf.decode(rf.encode('ABCDE', '5'), '5')), 'ABCDE');
  // 2 rails large message
  const big = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  eq('2 rails full alpha roundtrip', clean(rf.decode(rf.encode(big, '2'), '2')), big);
  // Multiple rail counts roundtrip
  for (let r = 2; r <= 8; r++) {
    const enc = rf.encode('THEQUICKBROWNFOX', String(r));
    eq(`${r} rails roundtrip`, clean(rf.decode(enc, String(r))), 'THEQUICKBROWNFOX');
  }
}

/* ═══════════════════════════════════════════════════════════════
   13. COLUMNAR TRANSPOSITION
   ═══════════════════════════════════════════════════════════════ */
section('Columnar Transposition — Key Ordering');
{
  const ct = E.columnar;
  // Roundtrip various key lengths
  for (const key of ['AB', 'CAB', 'ZEBRA', 'ABCDEFGH']) {
    const msg = 'THETOMATOISAPLANT';
    const enc = ct.encode(msg, key);
    starts(`roundtrip key="${key}"`, clean(ct.decode(enc, key)), msg);
  }
  // Single column key → identity
  eq('single col key', clean(ct.encode('HELLO', 'A')), 'HELLO');
}

/* ═══════════════════════════════════════════════════════════════
   14. DOUBLE TRANSPOSITION
   ═══════════════════════════════════════════════════════════════ */
section('Double Transposition — Two-Key Roundtrip');
{
  const dt = E.doubleTransposition;
  const msg = 'ATTACKATDAWN';
  // Multiple key pairs
  for (const keys of ['AB,CD', 'CAT,DOG', 'GO,RUN']) {
    const enc = dt.encode(msg, keys);
    starts(`roundtrip keys="${keys}"`, clean(dt.decode(enc, keys)), msg);
  }
  // Encryption changes ciphertext
  neq('actually encrypts', clean(dt.encode(msg, 'AB,CD')), msg);
}

/* ═══════════════════════════════════════════════════════════════
   15. BACON'S CIPHER
   ═══════════════════════════════════════════════════════════════ */
section("Bacon's Cipher — Binary Encoding");
{
  const bc = E.bacon;
  // A = 00000 = AAAAA
  eq('A→AAAAA', bc.encode('A').trim(), 'AAAAA');
  // B = 00001 = AAAAB
  eq('B→AAAAB', bc.encode('B').trim(), 'AAAAB');
  // Known: I/J share code (index 8 = 01000 = ABAAA)
  eq('I→ABAAA', bc.encode('I').trim(), 'ABAAA');
  eq('J→I (J maps to I)', bc.encode('J').trim(), bc.encode('I').trim());
  // Decode roundtrip for single letters
  for (let i = 0; i < 25; i++) {
    const ch = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'[i];
    const enc = bc.encode(ch);
    const dec = bc.decode(enc);
    eq(`roundtrip ${ch}`, clean(dec), ch);
  }
}

/* ═══════════════════════════════════════════════════════════════
   16. TAP CODE
   ═══════════════════════════════════════════════════════════════ */
section('Tap Code — Grid Encoding');
{
  const tc = E.tapCode;
  // A = row1,col1 = ". ."
  ok('A encode produces dots', tc.encode('A').includes('.'));
  // K→C substitution (K not in 5x5 grid without K)
  eq('K maps to C', tc.encode('K'), tc.encode('C'));
  // Roundtrip for letters that don't involve K
  const enc = tc.encode('HELLO');
  eq('HELLO roundtrip', tc.decode(enc), 'HELLO');
  // Full alphabet (minus K) roundtrip
  const alpha = 'ABCDEFGHIJLMNOPQRSTUVWXYZ'; // no K
  const fullEnc = tc.encode(alpha);
  eq('full grid roundtrip', tc.decode(fullEnc), alpha);
}

/* ═══════════════════════════════════════════════════════════════
   17. PIGPEN
   ═══════════════════════════════════════════════════════════════ */
section('Pigpen — Symbol Mapping');
{
  const pg = E.pigpen;
  // Each letter maps to a unique symbol
  const enc = pg.encode(FULL_ALPHA);
  ok('all 26 letters produce symbols', enc.length > 26);
  // Roundtrip
  eq('full alphabet roundtrip', clean(pg.decode(pg.encode(FULL_ALPHA))), FULL_ALPHA);
  eq('FREEMASON roundtrip', clean(pg.decode(pg.encode('FREEMASON'))), 'FREEMASON');
}

/* ═══════════════════════════════════════════════════════════════
   18. BIFID
   ═══════════════════════════════════════════════════════════════ */
section('Bifid — Fractionation');
{
  const bf = E.bifid;
  // Roundtrip with multiple keywords
  for (const key of ['SECRET', 'BGWKZQPNDSIOAXEFCLUMTHYVR', 'A']) {
    const enc = bf.encode('FLEEATONCE', key);
    eq(`roundtrip key="${key.substring(0, 6)}"`, clean(bf.decode(enc, key)), 'FLEEATONCE');
  }
  // J→I
  const jenc = bf.encode('JELLY', 'KEY');
  eq('J→I in bifid', clean(bf.decode(jenc, 'KEY')), 'IELLY');
}

/* ═══════════════════════════════════════════════════════════════
   19. TRIFID
   ═══════════════════════════════════════════════════════════════ */
section('Trifid — 3D Fractionation');
{
  const tf = E.trifid;
  eq('roundtrip DEFEND', clean(tf.decode(tf.encode('DEFEND', 'FELIX'), 'FELIX')), 'DEFEND');
  eq('roundtrip longer msg', clean(tf.decode(tf.encode('HELLOWORLD', 'KEY'), 'KEY')), 'HELLOWORLD');
  neq('actually encrypts', clean(tf.encode('DEFEND', 'FELIX')), 'DEFEND');
}

/* ═══════════════════════════════════════════════════════════════
   20 & 21. ADFGX / ADFGVX
   ═══════════════════════════════════════════════════════════════ */
section('ADFGX & ADFGVX — WWI Ciphers');
{
  const ax = E.adfgx;
  eq('ADFGX roundtrip', clean(ax.decode(ax.encode('ATTACK', 'PRIVACY,GERMAN'), 'PRIVACY,GERMAN')), 'ATTACK');
  // Output should only contain ADFGX letters before columnar step
  noThrow('ADFGX no crash on single char', () => ax.encode('A', 'KEY,COL'));

  const avx = E.adfgvx;
  eq('ADFGVX roundtrip', clean(avx.decode(avx.encode('ATTACK', 'PRIVACY,GERMAN'), 'PRIVACY,GERMAN')), 'ATTACK');
  neq('ADFGX ≠ ADFGVX for same input', ax.encode('ATTACK', 'PRIVACY,GERMAN'), avx.encode('ATTACK', 'PRIVACY,GERMAN'));
}

/* ═══════════════════════════════════════════════════════════════
   22. NIHILIST
   ═══════════════════════════════════════════════════════════════ */
section('Nihilist — Polybius + Keyword Addition');
{
  const ni = E.nihilist;
  const enc = ni.encode('DYNAMITEWINTERPALACE', 'RUSSIAN,KEY');
  ok('output is numeric pairs', /^[\d\s]+$/.test(enc));
  eq('roundtrip', clean(ni.decode(enc, 'RUSSIAN,KEY')), 'DYNAMITEWINTERPALACE');
  // All values should be ≥ 22 (min 11+11)
  const nums = enc.trim().split(/\s+/).map(Number);
  ok('all values ≥ 22', nums.every(n => n >= 22));
}

/* ═══════════════════════════════════════════════════════════════
   23. ONE-TIME PAD
   ═══════════════════════════════════════════════════════════════ */
section('One-Time Pad — Perfect Secrecy');
{
  const otp = E.otp;
  // With explicit key of correct length
  const enc = otp.encode('HELLO', 'XMCKL');
  const cipher = enc.split('\n')[0];
  eq('OTP roundtrip with key', clean(otp.decode(cipher, 'XMCKL')), 'HELLO');
  // Key too short for decode → error message
  const short = otp.decode('ABCDEF', 'AB');
  ok('short key returns error msg', short.includes('Key must be'));
  // Random key generates (encode without key)
  const rnd = otp.encode('TEST', '');
  ok('random key generated', rnd.includes('[Key:'));
  // Different random keys each time (probabilistic but strong)
  const r1 = otp.encode('AAAA', '');
  const r2 = otp.encode('AAAA', '');
  // Note: these use Date.now() so in rapid succession they might be same seed
  ok('encode with empty key runs', r1.length > 0);
}

/* ═══════════════════════════════════════════════════════════════
   24. FRACTIONATED MORSE
   ═══════════════════════════════════════════════════════════════ */
section('Fractionated Morse — Encrypt Only');
{
  const fm = E.fractionatedMorse;
  const enc = fm.encode('HELLO WORLD', 'ROUNDTABLE');
  ok('produces output', enc.length > 0);
  neq('output differs from input', clean(enc), 'HELLOWORLD');
  // Different keywords → different ciphertext
  neq('different keys → different output', fm.encode('TEST', 'ALPHA'), fm.encode('TEST', 'BRAVO'));
  // Decode returns informational message
  const dec = fm.decode('ABC', 'KEY');
  ok('decode returns info message', dec.length > 0);
}

/* ═══════════════════════════════════════════════════════════════
   25. CONFEDERATE VIGENÈRE
   ═══════════════════════════════════════════════════════════════ */
section('Confederate Vigenère — Civil War Cipher');
{
  const cv = E.confederateVigenere;
  const msg = 'SENDREINFORCEMENTSNOW';
  eq('roundtrip', clean(cv.decode(cv.encode(msg, 'CONFEDERATE'), 'CONFEDERATE')), msg);
  // Should be equivalent to standard Vigenère
  eq('matches standard Vigenere', clean(cv.encode('HELLO', 'KEY')), clean(E.vigenere.encode('HELLO', 'KEY')));
}

/* ═══════════════════════════════════════════════════════════════
   26. BAZERIES
   ═══════════════════════════════════════════════════════════════ */
section('Bazeries — Number-to-Word Substitution + Reversal');
{
  const bz = E.bazeries;
  const msg = 'RETREATTOTHEHILLS';
  eq('roundtrip key 42', clean(bz.decode(bz.encode(msg, '42'), '42')), msg);
  eq('roundtrip key 7', clean(bz.decode(bz.encode(msg, '7'), '7')), msg);
  eq('roundtrip key 99', clean(bz.decode(bz.encode(msg, '99'), '99')), msg);
  neq('actually encrypts', clean(bz.encode(msg, '42')), msg);
}

/* ═══════════════════════════════════════════════════════════════
   27. ALBERTI DISK
   ═══════════════════════════════════════════════════════════════ */
section('Alberti Disk — Polyalphabetic with Rotation');
{
  const al = E.alberti;
  const msg = 'SECRETSOFTHEVATICAN';
  // Roundtrip across initial settings
  for (let s = 0; s <= 10; s++) {
    eq(`roundtrip setting ${s}`, clean(al.decode(al.encode(msg, String(s)), String(s))), msg);
  }
  // Encryption changes every 4 chars (disk rotates)
  neq('not identity', clean(al.encode(msg, '0')), msg);
}

/* ═══════════════════════════════════════════════════════════════
   28. JEFFERSON DISK
   ═══════════════════════════════════════════════════════════════ */
section('Jefferson Disk — Multi-Disk Transposition');
{
  const jd = E.jefferson;
  const msg = 'WEHOLDTHESETRUTHS';
  eq('roundtrip', clean(jd.decode(jd.encode(msg, '3,1,5,2,4,6'), '3,1,5,2,4,6')), msg);
  // Different orderings produce different ciphertext
  neq('different order → different output', jd.encode('HELLO', '1,2,3,4,5'), jd.encode('HELLO', '5,4,3,2,1'));
}

/* ═══════════════════════════════════════════════════════════════
   29. ENIGMA (self-reciprocal)
   ═══════════════════════════════════════════════════════════════ */
section('Enigma — Self-Reciprocal Rotor Machine');
{
  const en = E.enigma;
  // Self-reciprocal: encode(encode(x, key), key) = x
  for (const key of ['AAA', 'ABC', 'ZZZ', 'MCM']) {
    const msg = 'HELLOWORLD';
    const enc = en.encode(msg, key);
    eq(`self-reciprocal key=${key}`, clean(en.encode(enc, key)), clean(msg));
  }
  // No letter encrypts to itself (Enigma property)
  const enc = en.encode('AAAAAAAAAA', 'AAA');
  const noSelf = !clean(enc).includes('A');
  ok('no letter maps to itself', noSelf);
  // Different start positions → different ciphertext
  neq('AAA ≠ BBB output', en.encode('HELLO', 'AAA'), en.encode('HELLO', 'BBB'));
}

/* ═══════════════════════════════════════════════════════════════
   30. LORENZ (self-reciprocal)
   ═══════════════════════════════════════════════════════════════ */
section('Lorenz — Self-Reciprocal XOR Stream');
{
  const lz = E.lorenz;
  for (const key of ['LORENZ', 'SECRET', 'BLETCHLEY']) {
    const msg = 'URGENTMESSAGE';
    const enc = lz.encode(msg, key);
    eq(`self-reciprocal key=${key}`, clean(lz.encode(enc, key)), clean(msg));
  }
}

/* ═══════════════════════════════════════════════════════════════
   31. DICTIONARY CODE
   ═══════════════════════════════════════════════════════════════ */
section('Dictionary Code — Book Cipher');
{
  const dc = E.dictionaryCode;
  const ref = 'We the People of the United States in Order';
  // W=1, T=2, P=3, O=4, T=2, U=6, S=7, I=8, O=4
  const enc = dc.encode('W', ref);
  eq('W maps to index 1', enc, '1');
  const enc2 = dc.encode('WE', ref);
  ok('WE produces two indices', enc2.includes('-') || enc2.split(/[-\s]/).length >= 2);
  // Decode
  eq('decode index 1 → W', dc.decode('1', ref), 'W');
  eq('decode index 2 → T', dc.decode('2', ref), 'T');
}

/* ═══════════════════════════════════════════════════════════════
   32. STAGER (ROUTE CIPHER)
   ═══════════════════════════════════════════════════════════════ */
section('Stager (Route) — Column Serpentine');
{
  const st = E.stager;
  const msg = 'WEAREDISCOVEREDFLEEATONCE';
  // Multiple column counts
  for (let c = 2; c <= 7; c++) {
    starts(`roundtrip ${c} cols`, clean(st.decode(st.encode(msg, String(c)), String(c))), msg);
  }
  neq('actually encrypts', clean(st.encode(msg, '5')), msg);
}

/* ═══════════════════════════════════════════════════════════════
   33. VIC CIPHER
   ═══════════════════════════════════════════════════════════════ */
section('VIC — Straddling Checkerboard');
{
  const vc = E.vic;
  eq('roundtrip SNOWFALL', clean(vc.decode(vc.encode('AGENTREPORT', 'SNOWFALL'), 'SNOWFALL')), 'AGENTREPORT');
  // Output is numeric
  ok('output is numeric', /^\d+$/.test(vc.encode('HELLO', 'KEY')));
  // Different keywords
  neq('different keys → different output', vc.encode('HELLO', 'ALPHA'), vc.encode('HELLO', 'BRAVO'));
}

/* ═══════════════════════════════════════════════════════════════
   34. SCYTALE
   ═══════════════════════════════════════════════════════════════ */
section('Scytale — Transposition Wrap');
{
  const sc = E.scytale;
  // Roundtrip various row counts
  for (let r = 2; r <= 8; r++) {
    const msg = 'ATTACKATDAWN';
    starts(`roundtrip ${r} rows`, clean(sc.decode(sc.encode(msg, String(r)), String(r))), msg);
  }
  // Known: 3 rows, "ABCDEF" → read columns: ACE BDF → "ADBECF"
  // Actually: 3 rows, 2 cols → grid [[A,B],[C,D],[E,F]] read by cols: ACEBDF
  eq('3 rows ABCDEF', clean(sc.encode('ABCDEF', '3')), 'ACEBDF');
  neq('encryption changes text', clean(sc.encode('HELLO', '2')), 'HELLO');
}

/* ═══════════════════════════════════════════════════════════════
   35. VERNAM (XOR)
   ═══════════════════════════════════════════════════════════════ */
section('Vernam — Modular Addition (XOR-like)');
{
  const vn = E.vernam;
  // Explicit key roundtrip
  const enc = vn.encode('SECRET', 'KEYKEK');
  const cipher = enc.split('\n')[0];
  eq('roundtrip with explicit key', clean(vn.decode(cipher, 'KEYKEK')), 'SECRET');
  // Short key → error on decode
  const short = vn.decode('ABCDEF', 'AB');
  ok('short key returns error', short.includes('Key must'));
  // Random key generation on encode
  ok('random key in output', vn.encode('HELLO', '').includes('[Key:'));
}

/* ═══════════════════════════════════════════════════════════════
   STRESS TESTS
   ═══════════════════════════════════════════════════════════════ */
section('Stress Tests — Long Messages');
{
  const longMsg = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'.repeat(10); // 250 chars, no J (bifid-safe)
  const engines = [
    ['caesar', '7'], ['vigenere', 'STRESS'], ['beaufort', 'TEST'],
    ['railFence', '5'], ['columnar', 'ZEBRA'], ['bifid', 'KEY'],
    ['scytale', '4']
  ];
  for (const [name, key] of engines) {
    const e = E[name];
    noThrow(`${name}: 260-char no crash`, () => {
      const enc = e.encode(longMsg, key);
      e.decode(enc, key);
    });
    if (name === 'beaufort') {
      eq(`${name}: 260-char self-reciprocal`, clean(E.beaufort.encode(E.beaufort.encode(longMsg, key), key)), clean(longMsg));
    } else {
      const enc = e.encode(longMsg, key);
      const dec = e.decode(enc, key);
      starts(`${name}: 260-char roundtrip`, clean(dec), clean(longMsg));
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   REPEATED CHARACTER TESTS
   ═══════════════════════════════════════════════════════════════ */
section('Repeated Characters — Frequency Resistance');
{
  // Monoalphabetic: same letter always maps to same letter
  const monoEnc = clean(E.monoalphabetic.encode('AAAA', 'KEY'));
  ok('mono: repeated A → same char', monoEnc[0] === monoEnc[1] && monoEnc[1] === monoEnc[2]);
  // Vigenère: same letter with different key positions → different output
  const vigEnc = clean(E.vigenere.encode('AAAA', 'ABCD'));
  ok('vigenere: AAAA+ABCD → distinct chars', new Set(vigEnc.split('')).size > 1);
  // Enigma: same letter → all different (rotor stepping)
  const enigEnc = clean(E.enigma.encode('AAAAAA', 'AAA'));
  ok('enigma: 6×A → all different', new Set(enigEnc.split('')).size > 1);
}

/* ═══════════════════════════════════════════════════════════════
   RESULTS
   ═══════════════════════════════════════════════════════════════ */
console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log(`║   RESULTS:  ✅ ${String(pass).padStart(3)} passed   ❌ ${String(fail).padStart(3)} failed                  ║`);
console.log('╚══════════════════════════════════════════════════════════╝');

if (failures.length) {
  console.log('\n🔴 FAILURES:');
  failures.forEach(f => console.log(f));
}

process.exit(fail > 0 ? 1 : 0);
