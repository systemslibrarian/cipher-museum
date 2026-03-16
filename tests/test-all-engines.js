#!/usr/bin/env node
/**
 * THE CIPHER MUSEUM — Automated Engine Test Suite
 * Tests all 35 cipher engines for:
 *   1. Engine exists and has encode/decode methods
 *   2. Encode produces non-empty output
 *   3. Decode(Encode(plaintext)) roundtrips back to plaintext (where applicable)
 *   4. Known-answer tests against published/verified values
 *
 * Run:  node tests/test-all-engines.js
 */
'use strict';

/* ── Bootstrap: simulate browser globals so all-engines.js can load ── */
global.window = global;

require('../js/ciphers/all-engines.js');

const E = window.CipherEngines;
if (!E) { console.error('FATAL: CipherEngines did not load'); process.exit(1); }

let pass = 0, fail = 0, skip = 0;
const failures = [];

function assert(testName, condition, detail) {
  if (condition) {
    pass++;
    console.log(`  ✅  ${testName}`);
  } else {
    fail++;
    const msg = `  ❌  ${testName}` + (detail ? `  →  ${detail}` : '');
    console.log(msg);
    failures.push(msg);
  }
}

function section(name) { console.log(`\n━━━ ${name} ━━━`); }

/* ── Helper: clean text the same way engines do ── */
const clean = t => t.toUpperCase().replace(/[^A-Z]/g, '');

/* ══════════════════════════════════════════════════════════════
   TEST DEFINITIONS
   Each entry: { engine, label, msg, key, roundtrip, knownEnc?, encryptOnly? }
   ══════════════════════════════════════════════════════════════ */
const tests = [
  // 1. Caesar
  { engine: 'caesar', label: 'Caesar Cipher', msg: 'THE QUICK BROWN FOX', key: '3', roundtrip: true,
    knownEnc: 'WKH TXLFN EURZQ IRA' },

  // 2. Monoalphabetic
  { engine: 'monoalphabetic', label: 'Monoalphabetic', msg: 'ATTACK AT DAWN', key: 'ZEBRA', roundtrip: true },

  // 3. Polybius
  { engine: 'polybius', label: 'Polybius Square', msg: 'HELLO', key: '', roundtrip: false,
    knownEnc: '23 15 31 31 34',
    customDecode: { input: '23 15 31 31 34', expected: 'HELLO' } },

  // 4. Homophonic
  { engine: 'homophonic', label: 'Homophonic Substitution', msg: 'SECRET MESSAGE', key: 'CIPHER', roundtrip: true },

  // 5. Playfair
  { engine: 'playfair', label: 'Playfair', msg: 'HIDE THE GOLD', key: 'MONARCHY', roundtrip: true },

  // 6. Hill
  { engine: 'hill', label: 'Hill Cipher', msg: 'SHORT', key: '3,3,2,5', roundtrip: true },

  // 7. Vigenère
  { engine: 'vigenere', label: 'Vigenère', msg: 'ATTACKATDAWN', key: 'LEMON', roundtrip: true,
    knownEnc: 'LXFOPVEFRNHR' },

  // 8. Beaufort (self-reciprocal)
  { engine: 'beaufort', label: 'Beaufort', msg: 'THE QUICK BROWN FOX', key: 'FORTIFICATION', roundtrip: false,
    customRoundtrip: true },

  // 9. Gronsfeld
  { engine: 'gronsfeld', label: 'Gronsfeld', msg: 'THE SECRET CODE', key: '31415', roundtrip: true },

  // 10. Porta (self-reciprocal)
  { engine: 'porta', label: 'Porta', msg: 'DEFEND THE EAST WALL', key: 'FORTIFY', roundtrip: false,
    customRoundtrip: true },

  // 11. Running Key
  { engine: 'runningKey', label: 'Running Key', msg: 'FLEE AT ONCE', key: 'WE HOLD THESE TRUTHS TO BE SELF EVIDENT', roundtrip: true },

  // 12. Rail Fence
  { engine: 'railFence', label: 'Rail Fence', msg: 'WE ARE DISCOVERED FLEE AT ONCE', key: '3', roundtrip: true },

  // 13. Columnar Transposition
  { engine: 'columnar', label: 'Columnar Transposition', msg: 'THE TOMATO IS A PLANT', key: 'ZEBRA', roundtrip: true },

  // 14. Double Transposition
  { engine: 'doubleTransposition', label: 'Double Transposition', msg: 'ATTACK AT DAWN', key: 'FIRST,SECOND', roundtrip: true },

  // 15. Bacon
  { engine: 'bacon', label: "Bacon's Cipher", msg: 'HELLO', key: '', roundtrip: false,
    knownEnc: 'AABBB AABAA ABABB ABABB ABBAB',
    customDecode: { input: 'AABBB AABAA ABABB ABABB ABBAB', expected: 'HELLO' } },

  // 16. Tap Code
  { engine: 'tapCode', label: 'Tap Code', msg: 'HELLO', key: '', roundtrip: false,
    customDecode: null },  // tap code H→H, E→E, L→L, L→L, O→O but K→C

  // 17. Pigpen
  { engine: 'pigpen', label: 'Pigpen', msg: 'FREEMASON', key: '', roundtrip: true },

  // 18. Bifid
  { engine: 'bifid', label: 'Bifid', msg: 'FLEEATONCE', key: 'SECRET', roundtrip: true },

  // 19. Trifid
  { engine: 'trifid', label: 'Trifid', msg: 'DEFEND', key: 'FELIX', roundtrip: true },

  // 20. ADFGX
  { engine: 'adfgx', label: 'ADFGX', msg: 'ATTACK', key: 'PRIVACY,GERMAN', roundtrip: true },

  // 21. ADFGVX
  { engine: 'adfgvx', label: 'ADFGVX', msg: 'ATTACK', key: 'PRIVACY,GERMAN', roundtrip: true },

  // 22. Nihilist
  { engine: 'nihilist', label: 'Nihilist', msg: 'DYNAMITE WINTER PALACE', key: 'RUSSIAN,KEY', roundtrip: true },

  // 23. One-Time Pad (uses random key when not provided)
  { engine: 'otp', label: 'One-Time Pad', msg: 'ATTACK', key: 'SECRET', roundtrip: false,
    customTest: true },

  // 24. Fractionated Morse (encrypt-only)
  { engine: 'fractionatedMorse', label: 'Fractionated Morse', msg: 'HELLO WORLD', key: 'ROUNDTABLE',
    encryptOnly: true },

  // 25. Confederate Vigenère
  { engine: 'confederateVigenere', label: 'Confederate Vigenère', msg: 'SEND REINFORCEMENTS', key: 'CONFEDERATE', roundtrip: true },

  // 26. Bazeries
  { engine: 'bazeries', label: 'Bazeries', msg: 'RETREAT TO THE HILLS', key: '42', roundtrip: true },

  // 27. Alberti Disk
  { engine: 'alberti', label: 'Alberti Disk', msg: 'SECRETS OF THE VATICAN', key: '3', roundtrip: true },

  // 28. Jefferson Disk
  { engine: 'jefferson', label: 'Jefferson Disk', msg: 'WE HOLD THESE TRUTHS', key: '3,1,5,2,4,6', roundtrip: true },

  // 29. Enigma (self-reciprocal)
  { engine: 'enigma', label: 'Enigma Machine', msg: 'HELLO WORLD', key: 'AAA', roundtrip: false,
    customRoundtrip: true },

  // 30. Lorenz (self-reciprocal)
  { engine: 'lorenz', label: 'Lorenz', msg: 'URGENT MESSAGE', key: 'LORENZ', roundtrip: false,
    customRoundtrip: true },

  // 31. Dictionary Code
  { engine: 'dictionaryCode', label: 'Dictionary Code', msg: 'WTUSC', key: 'We the People of the United States in Order to form a more perfect Union establish Justice insure domestic Tranquility provide for the common defence', roundtrip: false,
    customTest: true },

  // 32. Stager (Route Cipher)
  { engine: 'stager', label: 'Stager (Route)', msg: 'WE ARE DISCOVERED FLEE AT ONCE', key: '5', roundtrip: true },

  // 33. VIC
  { engine: 'vic', label: 'VIC Cipher', msg: 'AGENT REPORT', key: 'SNOWFALL', roundtrip: true },

  // 34. Scytale
  { engine: 'scytale', label: 'Scytale', msg: 'ATTACK AT DAWN', key: '3', roundtrip: true },

  // 35. Vernam (uses random key when not provided)
  { engine: 'vernam', label: 'Vernam (XOR)', msg: 'SECRET', key: 'KEYKEE', roundtrip: false,
    customTest: true },
];

/* ══════════════════════════════════════════════════════════════
   RUN ALL TESTS
   ══════════════════════════════════════════════════════════════ */
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   THE CIPHER MUSEUM — Engine Test Suite             ║');
console.log('║   Testing all 35 cipher engines                     ║');
console.log('╚══════════════════════════════════════════════════════╝');

/* ── 1. Check that all 35 engines exist ── */
section('Engine Existence');
const expectedEngines = [
  'caesar', 'monoalphabetic', 'polybius', 'homophonic', 'playfair', 'hill',
  'vigenere', 'beaufort', 'gronsfeld', 'porta', 'runningKey',
  'railFence', 'columnar', 'doubleTransposition',
  'bacon', 'tapCode', 'pigpen',
  'bifid', 'trifid', 'adfgx', 'adfgvx', 'nihilist',
  'otp', 'fractionatedMorse', 'confederateVigenere',
  'bazeries', 'alberti', 'jefferson', 'enigma', 'lorenz',
  'dictionaryCode', 'stager', 'vic',
  'scytale', 'vernam'
];

for (const name of expectedEngines) {
  assert(`${name} exists`, !!E[name], E[name] ? '' : 'missing from CipherEngines');
  if (E[name]) {
    assert(`${name}.encode is function`, typeof E[name].encode === 'function');
    assert(`${name}.decode is function`, typeof E[name].decode === 'function');
  }
}

/* ── 2. Encode / Decode / Roundtrip tests ── */
section('Encode & Decode Tests');

for (const t of tests) {
  const engine = E[t.engine];
  if (!engine) {
    assert(`${t.label}: engine loaded`, false, 'ENGINE MISSING');
    continue;
  }

  // Encode
  let encoded;
  try {
    encoded = engine.encode(t.msg, t.key);
    assert(`${t.label}: encode produces output`, encoded && encoded.length > 0,
      `got: "${encoded}"`);
  } catch (err) {
    assert(`${t.label}: encode runs without error`, false, err.message);
    continue;
  }

  // Known-answer check
  if (t.knownEnc) {
    // Caesar preserves spaces/case in output; clean both for comparison
    const got = clean(encoded);
    const want = clean(t.knownEnc);
    assert(`${t.label}: known-answer match`, got === want,
      `expected "${want}", got "${got}"`);
  }

  // Encrypt-only ciphers
  if (t.encryptOnly) {
    skip++;
    console.log(`  ⏭️  ${t.label}: decrypt skipped (encrypt-only)`);
    continue;
  }

  // Custom decode test (e.g., Polybius, Bacon)
  if (t.customDecode) {
    try {
      const decoded = engine.decode(t.customDecode.input, t.key);
      assert(`${t.label}: decode known input`, clean(decoded) === clean(t.customDecode.expected),
        `expected "${t.customDecode.expected}", got "${decoded}"`);
    } catch (err) {
      assert(`${t.label}: decode runs without error`, false, err.message);
    }
  }

  // Standard roundtrip: decode(encode(msg)) === msg
  if (t.roundtrip) {
    try {
      const decoded = engine.decode(encoded, t.key);
      const original = clean(t.msg);
      const result = clean(decoded);
      // Some ciphers pad with X, so check startsWith
      const matches = result === original || result.startsWith(original);
      assert(`${t.label}: roundtrip decode(encode(msg)) ≈ msg`, matches,
        `original "${original}", roundtrip "${result}"`);
    } catch (err) {
      assert(`${t.label}: roundtrip decode`, false, err.message);
    }
  }

  // Self-reciprocal ciphers: encode(encode(msg)) === msg
  if (t.customRoundtrip) {
    try {
      const double = engine.encode(encoded, t.key);
      // For Enigma/Lorenz, the encoded text has no spaces, so clean both
      const original = clean(t.msg);
      const result = clean(double);
      assert(`${t.label}: self-reciprocal encode(encode(msg)) = msg`, result === original,
        `original "${original}", double-encoded "${result}"`);
    } catch (err) {
      assert(`${t.label}: self-reciprocal test`, false, err.message);
    }
  }

  // Custom tests for OTP/Vernam (random key in output) and Dictionary Code
  if (t.customTest) {
    if (t.engine === 'otp') {
      try {
        // OTP with explicit key
        const enc = engine.encode('HELLO', 'XMCKL');
        // Encode appends "\n[Key: ...]"
        const cipherOnly = enc.split('\n')[0];
        const dec = engine.decode(cipherOnly, 'XMCKL');
        assert(`${t.label}: roundtrip with explicit key`, clean(dec) === 'HELLO',
          `got "${dec}"`);
      } catch (err) {
        assert(`${t.label}: OTP custom test`, false, err.message);
      }
    }
    if (t.engine === 'vernam') {
      try {
        const enc = engine.encode('SECRET', 'KEYKEE');
        const cipherOnly = enc.split('\n')[0];
        const dec = engine.decode(cipherOnly, 'KEYKEE');
        assert(`${t.label}: roundtrip with explicit key`, clean(dec) === 'SECRET',
          `got "${dec}"`);
      } catch (err) {
        assert(`${t.label}: Vernam custom test`, false, err.message);
      }
    }
    if (t.engine === 'dictionaryCode') {
      try {
        const enc = engine.encode('WE', t.key);
        assert(`${t.label}: encode produces indices`, /^\d/.test(enc),
          `got "${enc}"`);
        const dec = engine.decode(enc, t.key);
        assert(`${t.label}: decode retrieves first letters`, clean(dec) === 'WE' || clean(dec).startsWith('W'),
          `got "${dec}"`);
      } catch (err) {
        assert(`${t.label}: Dictionary custom test`, false, err.message);
      }
    }
  }
}

/* ── 3. Tap Code special: encode then decode ── */
section('Tap Code Roundtrip');
try {
  const tc = E.tapCode;
  const enc = tc.encode('HELLO');
  assert('Tap Code: encode runs', enc && enc.length > 0, `got: "${enc}"`);
  const dec = tc.decode(enc);
  // K→C substitution is expected, otherwise should match
  assert('Tap Code: decode(encode) ≈ msg', clean(dec) === 'HELLO',
    `got "${dec}" (K→C expected)`);
} catch (err) {
  assert('Tap Code: roundtrip', false, err.message);
}

/* ── 4. Cross-verification: Vigenère against CrypTool-known values ── */
section('CrypTool Cross-Verification');
// Vigenère: well-known test vector
// Plaintext: ATTACKATDAWN, Key: LEMON → Ciphertext: LXFOPVEFRNHR
{
  const enc = E.vigenere.encode('ATTACKATDAWN', 'LEMON');
  assert('Vigenère (CrypTool): ATTACKATDAWN + LEMON = LXFOPVEFRNHR',
    clean(enc) === 'LXFOPVEFRNHR', `got "${enc}"`);
  const dec = E.vigenere.decode('LXFOPVEFRNHR', 'LEMON');
  assert('Vigenère (CrypTool): decode LXFOPVEFRNHR + LEMON = ATTACKATDAWN',
    clean(dec) === 'ATTACKATDAWN', `got "${dec}"`);
}

// Caesar: shift 13 = ROT13
{
  const enc = E.caesar.encode('HELLO', '13');
  assert('Caesar ROT13: HELLO → URYYB', clean(enc) === 'URYYB', `got "${enc}"`);
  const dec = E.caesar.decode('URYYB', '13');
  assert('Caesar ROT13: URYYB → HELLO', clean(dec) === 'HELLO', `got "${dec}"`);
}

// Polybius: known mapping
{
  const enc = E.polybius.encode('A');
  assert('Polybius: A → 11', enc.trim() === '11', `got "${enc}"`);
  const enc2 = E.polybius.encode('Z');
  assert('Polybius: Z → 55', enc2.trim() === '55', `got "${enc2}"`);
}

// Rail Fence: known example (3 rails)
{
  const enc = E.railFence.encode('WEAREDISCOVEREDFLEEATONCE', '3');
  assert('Rail Fence (3): WEAREDISCOVEREDFLEEATONCE → WECRLTEERDSOEEFEAOCAIVDEN',
    clean(enc) === 'WECRLTEERDSOEEFEAOCAIVDEN', `got "${enc}"`);
}

// Beaufort self-reciprocal
{
  const msg = 'TESTMESSAGE';
  const key = 'KEY';
  const enc = E.beaufort.encode(msg, key);
  const dec = E.beaufort.decode(enc, key);
  assert('Beaufort self-reciprocal: decode(encode(x)) = x',
    clean(dec) === clean(msg), `got "${dec}"`);
}

/* ── 5. Demo-Loader Config coverage ── */
section('Demo Config Coverage');
const fs = require('fs');
const loaderSrc = fs.readFileSync(require('path').join(__dirname, '..', 'js', 'demo-loader.js'), 'utf8');

for (const name of expectedEngines) {
  // Check CONFIGS has an entry that references this engine (except engines without demos)
  const hasConfig = loaderSrc.includes(`engine: '${name}'`);
  if (name === 'caesar') {
    // caesar has its own script, not in all-engines configs
    skip++;
    console.log(`  ⏭️  ${name}: has dedicated caesar.js (skipped config check)`);
  } else {
    assert(`demo-loader CONFIGS includes engine '${name}'`, hasConfig,
      hasConfig ? '' : `no config found for ${name}`);
  }
}

/* ── 6. Check HTML files have demo-section or at least load demo-loader ── */
section('HTML Exhibit Integration');
const path = require('path');
const ciphersDir = path.join(__dirname, '..', 'ciphers');
const htmlFiles = fs.readdirSync(ciphersDir).filter(f => f.endsWith('.html'));

let hasDemo = 0, hasScripts = 0;
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ciphersDir, file), 'utf8');
  const hasDemoSection = content.includes('demo-section');
  const hasLoader = content.includes('demo-loader.js');
  const hasEngines = content.includes('all-engines.js') || content.includes('caesar.js');

  if (hasDemoSection) hasDemo++;
  if (hasLoader) hasScripts++;

  // Every exhibit should at least load demo-loader.js for sources
  assert(`${file}: loads demo-loader.js`, hasLoader,
    hasLoader ? '' : 'missing <script src="demo-loader.js">');
}
console.log(`\n  📊 ${hasDemo}/${htmlFiles.length} exhibits have demo-section`);
console.log(`  📊 ${hasScripts}/${htmlFiles.length} exhibits load demo-loader.js`);

/* ── 7. Sources coverage ── */
section('Sources Coverage');
for (const name of expectedEngines) {
  // Some engines map to different source keys
  const key = name;
  const hasSource = loaderSrc.includes(`${key}: [`) || loaderSrc.includes(`'${key}': [`);
  assert(`SOURCES has entry for '${name}'`, hasSource,
    hasSource ? '' : `no sources found for ${name}`);
}
// Also check the special non-engine exhibits
for (const special of ['navajo-code-talkers', 'zodiac']) {
  const hasSource = loaderSrc.includes(`'${special}': [`);
  assert(`SOURCES has entry for '${special}'`, hasSource);
}

/* ══════════════════════════════════════════════════════════════
   RESULTS SUMMARY
   ══════════════════════════════════════════════════════════════ */
console.log('\n╔══════════════════════════════════════════════════════╗');
console.log(`║   RESULTS:  ✅ ${String(pass).padStart(3)} passed   ❌ ${String(fail).padStart(3)} failed   ⏭️ ${String(skip).padStart(3)} skipped  ║`);
console.log('╚══════════════════════════════════════════════════════╝');

if (failures.length) {
  console.log('\n🔴 FAILURES:');
  failures.forEach(f => console.log(f));
}

process.exit(fail > 0 ? 1 : 0);
