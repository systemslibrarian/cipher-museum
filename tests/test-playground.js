#!/usr/bin/env node
/**
 * THE CIPHER MUSEUM — Live Cipher Playground (index.html §3)
 *
 * Loads index.html in JSDOM and drives the playground UI to verify
 * each of the nine cipher engines works end-to-end.
 *
 * Coverage:
 *   1. DOM structure: selector, key field, swap/copy buttons, output panel.
 *   2. Initial state: Caesar selected, key field hidden, demo text seeded.
 *   3. Per-cipher (×9):
 *        a. Encrypt "HELLO" → non-empty ciphertext.
 *        b. Known-answer test against a canonical reference value.
 *        c. Swap to Decrypt and verify plaintext recovery.
 *   4. Full A–Z roundtrip per cipher — catches letter-specific bugs
 *      (e.g. a missing entry in a substitution table) that a single
 *      short plaintext can hide. Polybius and Bacon are lossy for J→I.
 *   5. Case and punctuation preservation for substitution ciphers.
 *   6. Key-field visibility tracks the selected cipher.
 *   7. Vigenère with custom + empty + numeric keys (empty/numeric fall
 *      back to the seeded "MUSEUM" default).
 *   8. Swap button cycles label correctly.
 *   9. Empty input clears the output (no crash, no stale text).
 *  10. Workbench link present.
 *
 * Run:  node tests/test-playground.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const REPO = path.resolve(__dirname, '..');
const INDEX = path.join(REPO, 'index.html');

let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) pass++;
  else { fail++; const m = `❌  ${name}` + (detail ? `  →  ${detail}` : ''); failures.push(m); console.log('  ' + m); }
}
function pad(s, n) { return (s + ' '.repeat(n)).slice(0, n); }
function letters(s) { return (s || '').toUpperCase().replace(/[^A-Z]/g, ''); }
const tick = (ms = 20) => new Promise(r => setTimeout(r, ms));

function stripExternalRefs(html) {
  html = html.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi, '');
  html = html.replace(/<script\b[^>]*\bsrc=["'][^"']+["'][^>]*><\/script>/gi, '');
  return html;
}

async function loadIndex() {
  const raw = fs.readFileSync(INDEX, 'utf8');
  const html = stripExternalRefs(raw);
  const vc = new VirtualConsole();
  vc.on('jsdomError', () => { /* swallow */ });
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vc,
    url: 'http://localhost/index.html'
  });
  await tick();
  return dom;
}

const CIPHERS = [
  'caesar', 'rot13', 'atbash', 'vigenere', 'beaufort',
  'affine', 'railfence', 'polybius', 'bacon'
];

// Letter-bijection ciphers: every input letter maps to exactly one output
// letter, non-letters and case are preserved verbatim. Roundtrip must
// recover the original plaintext exactly (case and punctuation included).
const SUBSTITUTION_BIJECTION = new Set([
  'caesar', 'rot13', 'atbash', 'vigenere', 'beaufort', 'affine'
]);

// I and J share a slot. Round-tripping the full alphabet recovers
// "ABCDEFGHI" + "I" (J→I) + "KLMNOPQRSTUVWXYZ".
const IJ_MERGE = new Set(['polybius', 'bacon']);

(async () => {
  console.log('\n━━━ Live Cipher Playground (index.html §3) ━━━\n');

  const dom = await loadIndex();
  const { window } = dom;
  const { document } = window;

  const selCipher = document.getElementById('pg-cipher');
  const elInput   = document.getElementById('pg-input');
  const elOutput  = document.getElementById('pg-output');
  const elKey     = document.getElementById('pg-key');
  const elKeyWrap = document.getElementById('pg-key-wrap');
  const btnSwap   = document.getElementById('pg-swap');
  const btnCopy   = document.getElementById('pg-copy');

  ok('playground: cipher selector present', !!selCipher);
  ok('playground: plaintext input present', !!elInput);
  ok('playground: output panel present', !!elOutput);
  ok('playground: key field present', !!elKey);
  ok('playground: key wrapper present', !!elKeyWrap);
  ok('playground: swap button present', !!btnSwap);
  ok('playground: copy button present', !!btnCopy);

  if (!selCipher || !elInput || !elOutput || !elKey || !elKeyWrap || !btnSwap) {
    console.log('\n  Aborting: required DOM nodes missing.\n');
    process.exit(1);
  }

  // ── §1  Initial state ────────────────────────────────────────────────
  ok('initial: caesar is selected by default', selCipher.value === 'caesar',
    `value="${selCipher.value}"`);
  ok('initial: key field hidden on load (caesar)', elKeyWrap.style.display === 'none',
    `display="${elKeyWrap.style.display}"`);
  ok('initial: key field default is MUSEUM', elKey.value === 'MUSEUM',
    `value="${elKey.value}"`);
  ok('initial: input seeded with demo text', elInput.value.trim().length > 0,
    `value="${elInput.value}"`);
  ok('initial: output rendered on load', elOutput.textContent.trim().length > 0,
    `output="${elOutput.textContent.slice(0, 60)}"`);

  // ── §2  Selector contents ────────────────────────────────────────────
  const options = Array.from(selCipher.options).map(o => o.value);
  ok('selector: exactly 9 ciphers', options.length === 9, `got ${options.length}`);
  for (const c of CIPHERS) {
    ok(`selector: includes ${c}`, options.includes(c));
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  function setCipher(name) {
    selCipher.value = name;
    selCipher.dispatchEvent(new window.Event('change', { bubbles: true }));
  }
  function setInput(text) {
    elInput.value = text;
    elInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  }
  function setKey(text) {
    elKey.value = text;
    elKey.dispatchEvent(new window.Event('input', { bubbles: true }));
  }
  function getMode() {
    // "↕ Decrypt" label means we are currently in encrypt mode.
    return /Decrypt/.test(btnSwap.textContent) ? 'encrypt' : 'decrypt';
  }
  function ensureMode(target) {
    if (getMode() !== target) btnSwap.click();
  }
  function output() { return elOutput.textContent; }

  // Drive an encrypt → decrypt roundtrip and return both results.
  function roundtrip(name, plaintext, key) {
    ensureMode('encrypt');
    setCipher(name);
    if (key !== undefined) setKey(key);
    setInput(plaintext);
    const ct = output();
    btnSwap.click(); // → decrypt
    setInput(ct);
    const pt = output();
    btnSwap.click(); // back to encrypt
    return { ct, pt };
  }

  // ── §3  Per-cipher: HELLO, KAT, and roundtrip ────────────────────────
  console.log('\n  Per-cipher KAT + roundtrip on "HELLO":\n');

  const PLAIN = 'HELLO';
  const KAT = {
    caesar:    'KHOOR',          // shift +3
    rot13:     'URYYB',
    atbash:    'SVOOL',
    vigenere:  'TYDPI',          // key MUSEUM
    beaufort:  'FQHTG',          // key MUSEUM (reciprocal Vigenère)
    affine:    'RCLLA',          // a=5, b=8
    railfence: 'HOELL',          // 3 rails
    polybius:  '23 15 31 31 34', // standard Polybius square (no-J)
    bacon:     'AABBB AABAA ABABA ABABA ABBAB' // 25-letter Bacon (I/J merged)
  };

  for (const name of CIPHERS) {
    ensureMode('encrypt');
    setCipher(name);

    // Key field visibility tracks the selected cipher.
    const keyShown = elKeyWrap.style.display !== 'none';
    const wantsKey = (name === 'vigenere' || name === 'beaufort');
    ok(`${pad(name, 10)} key field visible iff keyed cipher`, keyShown === wantsKey,
      `wantsKey=${wantsKey} keyShown=${keyShown}`);

    // For keyed ciphers, reset key to the seeded default before the KAT.
    if (wantsKey) setKey('MUSEUM');

    setInput(PLAIN);
    const ct = output().trim();
    ok(`${pad(name, 10)} encrypt produces non-empty ciphertext`, ct.length > 0,
      `out="${ct}"`);

    // KAT: tolerate trailing whitespace differences but require exact match
    // on the canonical form. Polybius/Bacon use spaces — compare directly.
    const ctNorm = ct.replace(/\s+/g, ' ').trim();
    ok(`${pad(name, 10)} HELLO matches KAT (${KAT[name]})`,
      ctNorm === KAT[name].replace(/\s+/g, ' ').trim(),
      `got="${ctNorm}"`);

    // Roundtrip.
    btnSwap.click();
    ok(`${pad(name, 10)} swap toggled to decrypt mode`, getMode() === 'decrypt');
    setInput(ct);
    const recovered = letters(output());
    ok(`${pad(name, 10)} roundtrip recovers plaintext`,
      recovered.startsWith(PLAIN),
      `recovered="${output().slice(0, 60)}"`);
    btnSwap.click(); // back to encrypt
  }

  // ── §4  Full A–Z roundtrip per cipher ────────────────────────────────
  console.log('\n  Full A-Z encrypt/decrypt roundtrip per cipher:\n');

  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // For I/J-merging ciphers, J is collapsed to I on the way back.
  const ALPHA_AFTER_IJ = 'ABCDEFGHIIKLMNOPQRSTUVWXYZ';

  for (const name of CIPHERS) {
    // Vigenère/Beaufort: use the seeded MUSEUM key.
    const { ct, pt } = roundtrip(name, ALPHA);
    const got = letters(pt);
    const want = IJ_MERGE.has(name) ? ALPHA_AFTER_IJ : ALPHA;
    ok(`${pad(name, 10)} A-Z roundtrip (${want.length} letters)`, got === want,
      `got="${got}" want="${want}" ct="${ct.slice(0, 80)}"`);
  }

  // ── §5  Case + punctuation preservation (substitution bijections) ────
  console.log('\n  Case + punctuation preservation:\n');

  // For substitution-bijection ciphers, encrypt+decrypt of mixed text must
  // recover the original byte-for-byte (case + punctuation included).
  const MIXED = 'Hello, World! 123';

  for (const name of SUBSTITUTION_BIJECTION) {
    const { pt } = roundtrip(name, MIXED);
    ok(`${pad(name, 10)} preserves case + punctuation`, pt === MIXED,
      `got="${pt}"`);
  }

  // Rail fence preserves case + punctuation too, just by carrying characters
  // through rails verbatim.
  {
    const { pt } = roundtrip('railfence', MIXED);
    ok(`${pad('railfence', 10)} preserves case + punctuation`, pt === MIXED,
      `got="${pt}"`);
  }

  // ── §6  Caesar known-answer with case mix ────────────────────────────
  {
    ensureMode('encrypt');
    setCipher('caesar');
    setInput('Hello, World!');
    const ct = output();
    ok('caesar: case-preserving KAT ("Hello, World!" → "Khoor, Zruog!")',
      ct === 'Khoor, Zruog!', `got="${ct}"`);
  }

  // ── §7  Vigenère key handling ────────────────────────────────────────
  console.log('\n  Vigenère key handling:\n');

  // Custom key — Wikipedia reference.
  ensureMode('encrypt');
  setCipher('vigenere');
  setKey('LEMON');
  setInput('ATTACKATDAWN');
  ok('vigenere LEMON: Wikipedia KAT (LXFOPVEFRNHR)',
    letters(output()) === 'LXFOPVEFRNHR', `got="${output()}"`);

  // Empty key → falls back to seeded MUSEUM.
  setKey('');
  setInput('HELLO');
  ok('vigenere empty key falls back to MUSEUM (TYDPI)',
    letters(output()) === 'TYDPI', `got="${output()}"`);

  // Digit-only key (after stripping non-letters → empty) → MUSEUM fallback.
  setKey('123');
  setInput('HELLO');
  ok('vigenere digit-only key falls back to MUSEUM (TYDPI)',
    letters(output()) === 'TYDPI', `got="${output()}"`);

  // Lowercase key gets upper-cased.
  setKey('lemon');
  setInput('ATTACKATDAWN');
  ok('vigenere lowercase key upper-cased (LEMON KAT)',
    letters(output()) === 'LXFOPVEFRNHR', `got="${output()}"`);

  // ── §8  Beaufort is self-inverse (encrypt twice = plaintext) ─────────
  ensureMode('encrypt');
  setCipher('beaufort');
  setKey('MUSEUM');
  setInput('HELLO');
  const beauCt = output();
  ok('beaufort: HELLO with MUSEUM → FQHTG', letters(beauCt) === 'FQHTG',
    `got="${beauCt}"`);
  setInput(beauCt);
  ok('beaufort: encrypting ciphertext recovers plaintext (self-inverse)',
    letters(output()) === 'HELLO', `got="${output()}"`);

  // ── §9  Bacon canonical encoding (the bug class we just patched) ─────
  console.log('\n  Bacon canonical 5-bit codes:\n');

  ensureMode('encrypt');
  setCipher('bacon');
  const BACON_KAT = {
    A: 'AAAAA', B: 'AAAAB', C: 'AAABA', D: 'AAABB', E: 'AABAA',
    F: 'AABAB', G: 'AABBA', H: 'AABBB', I: 'ABAAA', J: 'ABAAA',
    K: 'ABAAB', L: 'ABABA', M: 'ABABB', N: 'ABBAA', O: 'ABBAB',
    P: 'ABBBA', Q: 'ABBBB', R: 'BAAAA', S: 'BAAAB', T: 'BAABA',
    U: 'BAABB', V: 'BABAA', W: 'BABAB', X: 'BABBA', Y: 'BABBB',
    Z: 'BBAAA'
  };
  for (const [letter, code] of Object.entries(BACON_KAT)) {
    setInput(letter);
    ok(`bacon: ${letter} → ${code}`, output().trim() === code,
      `got="${output().trim()}"`);
  }

  // ── §10  Polybius canonical encoding ─────────────────────────────────
  ensureMode('encrypt');
  setCipher('polybius');
  const POLY_KAT = {
    A: '11', E: '15', F: '21', I: '24', J: '24', K: '25',
    L: '31', P: '35', Q: '41', U: '45', V: '51', Z: '55'
  };
  for (const [letter, code] of Object.entries(POLY_KAT)) {
    setInput(letter);
    ok(`polybius: ${letter} → ${code}`, output().trim() === code,
      `got="${output().trim()}"`);
  }

  // ── §11  Swap button + UI ────────────────────────────────────────────
  console.log('\n  UI behaviour:\n');

  ensureMode('encrypt');
  setCipher('caesar');
  setInput('TEST');
  const labelStart = btnSwap.textContent;
  btnSwap.click();
  const labelAfter = btnSwap.textContent;
  btnSwap.click();
  const labelBack = btnSwap.textContent;
  ok('swap: label changes on click', labelStart !== labelAfter,
    `start="${labelStart}" after="${labelAfter}"`);
  ok('swap: label returns after two clicks', labelStart === labelBack,
    `start="${labelStart}" back="${labelBack}"`);

  // Input label flips between Plaintext and Ciphertext.
  const inputLabel = elInput.previousElementSibling;
  ok('swap: input label is "Plaintext" in encrypt mode',
    /Plaintext/.test(inputLabel.textContent), `label="${inputLabel.textContent}"`);
  btnSwap.click();
  ok('swap: input label becomes "Ciphertext" in decrypt mode',
    /Ciphertext/.test(inputLabel.textContent), `label="${inputLabel.textContent}"`);
  btnSwap.click(); // restore

  // Empty input clears output.
  ensureMode('encrypt');
  setCipher('caesar');
  setInput('');
  ok('input: empty value clears output panel', output() === '',
    `output="${output()}"`);

  // Switching cipher hides/shows key field correctly.
  setCipher('vigenere');
  ok('selector: switching to vigenere shows key field',
    elKeyWrap.style.display !== 'none',
    `display="${elKeyWrap.style.display}"`);
  setCipher('caesar');
  ok('selector: switching back to caesar hides key field',
    elKeyWrap.style.display === 'none',
    `display="${elKeyWrap.style.display}"`);

  // ── §12  Copy button + Workbench link ────────────────────────────────
  ok('copy button: initial label is COPY', btnCopy.textContent === 'COPY',
    `label="${btnCopy.textContent}"`);

  const wbLink = document.querySelector('#playground a[href*="workbench"]');
  ok('playground: links out to full Workbench', !!wbLink,
    wbLink ? `href="${wbLink.getAttribute('href')}"` : 'missing');

  window.close();

  console.log('\n' + '═'.repeat(70));
  console.log(`  ✅ ${pass} passed   ❌ ${fail} failed`);
  console.log('═'.repeat(70));
  if (fail) {
    console.log('\nFailures:');
    failures.forEach(f => console.log('  ' + f));
    process.exit(1);
  }
})();
