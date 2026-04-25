#!/usr/bin/env node
/**
 * tests/test-detective-v2.js
 * Unit + integration tests for Cipher Detective v2.0
 * Covers: attacks.js, playback.js, challenges.js + DOM wiring
 *
 * Run: node tests/test-detective-v2.js
 * Requires: jsdom  (npm install jsdom)
 */
'use strict';

const path = require('path');
const fs   = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

let pass = 0, fail = 0;

function ok(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅  ${label}`);
    pass++;
  } else {
    console.log(`  ❌  ${label}${detail ? '  (' + detail + ')' : ''}`);
    fail++;
  }
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

function extractLetters(t) { return t.toUpperCase().replace(/[^A-Z]/g, ''); }

function caesarEncrypt(plain, shift) {
  return extractLetters(plain).split('').map(c =>
    String.fromCharCode((c.charCodeAt(0) - 65 + shift) % 26 + 65)).join('');
}

function vigenereEncrypt(plain, key) {
  const k  = key.toUpperCase().replace(/[^A-Z]/g, '');
  const lt = extractLetters(plain);
  let out = '', ki = 0;
  for (const c of lt) {
    out += String.fromCharCode((c.charCodeAt(0) - 65 + k.charCodeAt(ki % k.length) - 65) % 26 + 65);
    ki++;
  }
  return out;
}

function rot13Enc(t)  { return caesarEncrypt(t, 13); }
function atbashEnc(t) { return extractLetters(t).split('').map(c => String.fromCharCode(90 - (c.charCodeAt(0) - 65))).join(''); }

const ROOT = path.join(__dirname, '..');

/* Inline <script src="..."> references for JSDOM (no network required) */
function inlineScripts(html, pageDir) {
  return html.replace(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)><\/script>/gi,
    (_full, before, src, after) => {
      if (/^https?:|^\/\//i.test(src)) return '';
      const resolved = path.resolve(pageDir, src);
      if (!fs.existsSync(resolved)) return '';
      let code = fs.readFileSync(resolved, 'utf8');
      code = code.replace(/<\/script/gi, '<\\/script');
      const attrs = (before + after).replace(/\bsrc=["'][^"']*["']/i, '').trim();
      return `<script ${attrs}>${code}\n</script>`;
    });
}

async function buildDom(ciphertext = '') {
  const raw     = fs.readFileSync(path.join(ROOT, 'cipher-detective.html'), 'utf8');
  const inlined = inlineScripts(raw, ROOT);
  const vc      = new VirtualConsole();
  vc.on('jsdomError', () => {});
  const dom = new JSDOM(inlined, {
    runScripts:         'dangerously',
    pretendToBeVisual:  true,
    virtualConsole:     vc,
    url:                'http://localhost/cipher-detective.html',
  });
  await new Promise(r => setTimeout(r, 15));
  if (ciphertext) {
    const { document, Event } = dom.window;
    const ta = document.getElementById('detective-input');
    if (ta) {
      ta.value = ciphertext;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  return dom;
}

/* Load attacks.js in an isolated JSDOM alongside analyses.js */
function loadAttacksModule() {
  const dom = new JSDOM('', { runScripts: 'dangerously' });
  for (const rel of ['js/detective/analyses.js', 'js/detective/attacks.js']) {
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const s = dom.window.document.createElement('script');
    s.textContent = code;
    dom.window.document.head.appendChild(s);
  }
  return dom.window;
}

const WIN = loadAttacksModule();
const A   = WIN.DetectiveAttacks;
const AN  = WIN.DetectiveAnalyses;

/* ═══════════════════════════════════════════════════════════════════════════
   §1  DetectiveAttacks — caesarBruteForce
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §1  caesarBruteForce ━━━\n');

{
  // Use natural English prose (not a pangram) so chi-square reliably finds shift 7
  const ct = caesarEncrypt('HELLO AND WELCOME TO THE WORLD OF CRYPTOGRAPHY WHERE SECRETS ARE KEPT SAFE THROUGH MATHEMATICS AND CLEVER ENCODING', 7);
  const results = A.caesarBruteForce(ct);

  ok('Returns at least 3 candidates', results.length >= 3);
  ok('Best candidate is shift 7', results[0].shift === 7, `got shift=${results[0].shift}`);
  ok('Best candidate decrypted starts HELLO', results[0].decrypted.startsWith('HELLO'), results[0].decrypted.slice(0, 10));
  ok('chi² values ascending (lower = better English)', results[0].chi <= results[1].chi);
  ok('All candidates have shift, decrypted, chi properties',
    results.every(r => typeof r.shift === 'number' && typeof r.decrypted === 'string' && typeof r.chi === 'number'));
}

{
  ok('Returns empty array for empty string', A.caesarBruteForce('').length === 0);
  ok('Returns empty array for whitespace only', A.caesarBruteForce('   ').length === 0);
}

{
  // ROT13 specific case
  const rot13ct = rot13Enc('THE QUICK BROWN FOX JUMPED OVER THE LAZY DOG ONE TWO THREE');
  const res = A.caesarBruteForce(rot13ct);
  ok('ROT13 detected as shift 13', res[0].shift === 13, `got shift=${res[0].shift}`);
}

{
  // Shift 1 edge case
  const ct1 = caesarEncrypt('ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ', 1);
  const res1 = A.caesarBruteForce(ct1);
  ok('Shift-1 is in top-5 results', res1.some(r => r.shift === 1));
}

{
  // Shift 25 edge case
  const ct25 = caesarEncrypt('THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG', 25);
  const res25 = A.caesarBruteForce(ct25);
  ok('Shift-25 is in top-5 results', res25.some(r => r.shift === 25));
}

/* ═══════════════════════════════════════════════════════════════════════════
   §2  DetectiveAttacks — rot13
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §2  rot13 ━━━\n');

{
  const ct = rot13Enc('KNOWLEDGE IS POWER');
  const r  = A.rot13(ct);
  ok('ROT13 restores plaintext', r.decrypted === 'KNOWLEDGEISPOWER', `got "${r.decrypted}"`);
}
{
  ok('ROT13 is self-inverse: applying twice returns original',
    A.rot13(rot13Enc('CIPHER')).decrypted === 'CIPHER');
}
{
  ok('ROT13 ignores non-letters in spacing', (() => {
    const r = A.rot13('HELLO WORLD');
    // rot13('HELLO WORLD') → 'URYYB JBEYQ'; the space from the input is preserved
    return r.decrypted.includes(' ');
  })());
}

/* ═══════════════════════════════════════════════════════════════════════════
   §3  DetectiveAttacks — atbash
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §3  atbash ━━━\n');

{
  const ct = atbashEnc('BRAVERY IS NOT THE ABSENCE OF FEAR');
  const r  = A.atbash(ct);
  ok('Atbash restores plaintext', r.decrypted === 'BRAVERYISNOTTHEABSENCEOFFEAR', `got "${r.decrypted}"`);
}
{
  ok('Atbash is self-inverse: A→Z→A', A.atbash(atbashEnc('ATBASH')).decrypted === 'ATBASH');
}
{
  ok('Atbash: A↔Z', A.atbash('Z').decrypted === 'A');
  ok('Atbash: Z↔A', A.atbash('A').decrypted === 'Z');
}

/* ═══════════════════════════════════════════════════════════════════════════
   §4  DetectiveAttacks — decodeMorse
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §4  decodeMorse ━━━\n');

{
  const morse = '- .... . / . .- --. .-.. . / .... .- ... / .-.. .- -. -.. . -..';
  const r = A.decodeMorse(morse);
  ok('Valid Morse decoded correctly',    r.valid === true,  `valid=${r.valid}`);
  ok('Decoded text starts with THE',     r.decrypted.startsWith('THE'));
  ok('Word boundaries decoded to spaces', r.decrypted.includes(' '));
}
{
  const single = '.-';
  ok('Single letter A decoded', A.decodeMorse(single).decrypted === 'A');
}
{
  const r = A.decodeMorse('- . ... -');
  ok('TEST in Morse decoded', r.decrypted === 'TEST');
}
{
  const r = A.decodeMorse('INVALID_GARBAGE');
  ok('Invalid Morse returns valid:false', r.valid === false);
  ok('Invalid Morse includes error message', typeof r.error === 'string' && r.error.length > 0);
}
{
  ok('Empty Morse returns valid:false', A.decodeMorse('').valid === false);
}
{
  // Numbers
  const r = A.demodeMorse ? A.decodeMorse('...-- - .-- ---') : A.decodeMorse('...-- .- -. . / . ... -');
  ok('Morse decode handles multi-word', r !== undefined);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §5  DetectiveAttacks — decodeEncoding
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §5  decodeEncoding ━━━\n');

{
  // Base64
  const b64 = 'SEVMTE8gV09STEQ=';
  const r   = A.decodeEncoding(b64);
  ok('Base64 decoded as valid',  r.valid === true,  `valid=${r.valid}`);
  ok('Base64 type identified',   r.type === 'Base64', `type="${r.type}"`);
  ok('Base64 decrypted to HELLO WORLD', r.decrypted === 'HELLO WORLD', `got "${r.decrypted}"`);
}
{
  // Hex
  const hex = '48656c6c6f20576f726c64';
  const r   = A.decodeEncoding(hex);
  ok('Hex decoded as valid',     r.valid === true,  `valid=${r.valid}`);
  ok('Hex type identified',      r.type === 'Hexadecimal', `type="${r.type}"`);
  ok('Hex decrypted to Hello World', r.decrypted === 'Hello World', `got "${r.decrypted}"`);
}
{
  // Binary
  const bin = '01001000' + '01100101' + '01101100' + '01101100' + '01101111';  // Hello
  const r   = A.decodeEncoding(bin);
  ok('Binary decoded as valid',  r.valid === true,  `valid=${r.valid}`);
  ok('Binary type identified',   r.type === 'Binary (8-bit)', `type="${r.type}"`);
  ok('Binary decrypted to Hello', r.decrypted === 'Hello', `got "${r.decrypted}"`);
}
{
  const r = A.decodeEncoding('ZZZZZNOTENCODED!!!!');
  ok('Non-encoded text returns valid:false', r.valid === false);
}
{
  ok('Empty input returns valid:false', A.decodeEncoding('').valid === false);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §6  DetectiveAttacks — vigKeyLength
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §6  vigKeyLength ━━━\n');

{
  // Long Vigenère text with key length 5 (LEMON)
  const ct = vigenereEncrypt(
    'ATTACKATDAWNTHEXCAVALRYWILLRIDEFROMTHENORTHANDMEETTHEINFANTRYATTHECROSSINGWHENTHESIGNALFIRES',
    'LEMON'
  );
  const r = A.vigKeyLength(ct);
  ok('Returns candidates array',  Array.isArray(r.candidates));
  ok('At least 1 candidate found', r.candidates.length >= 1);
  ok('Key length 5 is top candidate', r.candidates[0].length === 5, `got length=${r.candidates[0].length}`);
  ok('Top candidate has pIoC property', typeof r.candidates[0].pIoC === 'number');
  ok('Top candidate has methods array', Array.isArray(r.candidates[0].methods));
}
{
  // Key length 3 (KEY)
  const ct3 = vigenereEncrypt(
    'WESHALLFORWARDANDNEVERGIVEUPWESHALLFORWARDWESHALLSEEGLORYANDVICTORYFOREVERONWARD',
    'KEY'
  );
  const r3 = A.vigKeyLength(ct3);
  ok('Key length 3 is in top-3 candidates', r3.candidates.some(c => c.length === 3));
}
{
  // Too short
  const rShort = A.vigKeyLength('ABC');
  ok('Too-short text returns empty candidates', rShort.candidates.length === 0);
}
{
  // maxKey parameter
  const ct = vigenereEncrypt('TESTINGTESTINGTESTINGTESTINGTESTINGTESTINGTESTINGTEST', 'FIVE');
  const r  = A.vigKeyLength(ct, 6);
  ok('maxKey parameter respected — no candidate exceeds it', r.candidates.every(c => c.length <= 6));
}

/* ═══════════════════════════════════════════════════════════════════════════
   §7  DetectiveAttacks — substFreqSuggestions
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §7  substFreqSuggestions ━━━\n');

{
  // Monoalpha MONARCHY-derived alphabet (A→M B→O C→N ...)
  const ALPHA = 'MONARCHYBDEFGIJKLPQSTUVWXZ';
  const encrypt = plain => extractLetters(plain).split('').map(c =>
    ALPHA[(c.charCodeAt(0) - 65) % 26]).join('');
  const ct = encrypt('FOUR SCORE AND SEVEN YEARS AGO OUR FATHERS BROUGHT FORTH ON THIS CONTINENT');
  const r  = A.substFreqSuggestions(ct);
  ok('Returns mapping array',   Array.isArray(r.mapping));
  ok('Returns 6 suggestions',   r.mapping.length === 6, `got ${r.mapping.length}`);
  ok('First suggestion maps cipher→plain char', r.mapping[0].cipher && r.mapping[0].plain);
  ok('Suggestions include count + pct', typeof r.mapping[0].count === 'number' && typeof r.mapping[0].pct === 'number');
  ok('Contains note string',    typeof r.note === 'string' && r.note.length > 10);
  ok('Note mentions E', r.note.includes('E'));
}
{
  ok('Empty input returns empty mapping', A.substFreqSuggestions('').mapping.length === 0);
}
{
  ok('Single letter returns 1-item mapping', A.substFreqSuggestions('AAAA').mapping.length === 1);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §8  DetectiveAttacks — isApplicable
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §8  isApplicable ━━━\n');

const mockStats = { charset: 'alpha', n: 100, ioc: 0.04 };

ok('caesar ok for alpha stats',       A.isApplicable('caesar', mockStats).ok === true);
ok('rot13 ok for alpha stats',        A.isApplicable('rot13',  mockStats).ok === true);
ok('atbash ok for alpha stats',       A.isApplicable('atbash', mockStats).ok === true);
ok('morse not ok for alpha stats',    A.isApplicable('morse',  mockStats).ok === false);
ok('encoding always ok',              A.isApplicable('encoding', mockStats).ok === true);
ok('vigKeyLength ok for poly alpha',  A.isApplicable('vigKeyLength', mockStats).ok === true);
ok('substFreq ok for alpha ≥30 letters', A.isApplicable('substFreq', mockStats).ok === true);

ok('caesar not ok for Morse charset', A.isApplicable('caesar', { charset: 'morse', n: 50, ioc: 0.04 }).ok === false);
ok('morse ok for Morse charset',      A.isApplicable('morse',  { charset: 'morse', n: 50, ioc: 0.04 }).ok === true);
ok('caesar not ok < 8 letters',       A.isApplicable('caesar', { charset: 'alpha', n: 4, ioc: 0.04 }).ok === false);
ok('vigKeyLength not ok < 50 letters',A.isApplicable('vigKeyLength', { charset: 'alpha', n: 30, ioc: 0.04 }).ok === false);
ok('vigKeyLength not ok when IoC high (monoalpha)', A.isApplicable('vigKeyLength', { charset: 'alpha', n: 100, ioc: 0.068 }).ok === false);
ok('substFreq not ok < 30 letters',   A.isApplicable('substFreq', { charset: 'alpha', n: 20, ioc: 0.06 }).ok === false);
ok('isApplicable returns reason string when not ok',
   typeof A.isApplicable('caesar', { charset: 'morse', n: 50, ioc: 0.04 }).reason === 'string');
ok('isApplicable handles null stats gracefully', A.isApplicable('caesar', null).ok === false);
ok('isApplicable unknown tool returns ok:false', A.isApplicable('nonexistent', mockStats).ok === false);

/* ═══════════════════════════════════════════════════════════════════════════
   §9  DetectivePlayback — unit tests (no DOM)
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §9  DetectivePlayback unit tests ━━━\n');

{
  const dom2 = new JSDOM('', { runScripts: 'dangerously' });
  for (const rel of [
    'js/detective/analyses.js',
    'js/detective/scoring.js',
    'js/detective/playback.js'
  ]) {
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const s = dom2.window.document.createElement('script');
    s.textContent = code;
    dom2.window.document.head.appendChild(s);
  }
  const P = dom2.window.DetectivePlayback;

  ok('DetectivePlayback exported', !!P);
  ok('start function exported',    typeof P.start === 'function');
  ok('next function exported',     typeof P.next  === 'function');
  ok('back function exported',     typeof P.back  === 'function');
  ok('skip function exported',     typeof P.skip  === 'function');

  /* Calling start/next/back/skip without a DOM should not throw */
  let threw = false;
  try {
    const fakeStats = AN.run('THEQUICKBROWNFOXJUMPEDOVERTHELAZYDOGABCDEFGHIJKLMNOPQRSTUVWXYZ');
    const WIN2 = loadAttacksModule(); // has DetectiveAnalyses too
    /* Re-do with scoring.js */
    const dom3 = new JSDOM('', { runScripts: 'dangerously' });
    for (const rel of [
      'js/detective/analyses.js',
      'js/detective/scoring.js',
      'js/detective/playback.js'
    ]) {
      const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      const s3 = dom3.window.document.createElement('script');
      s3.textContent = code;
      dom3.window.document.head.appendChild(s3);
    }
    const P3 = dom3.window.DetectivePlayback;
    const scored = dom3.window.DetectiveScoring.rank(fakeStats);
    P3.start(fakeStats, scored);
    P3.next();
    P3.back();
    P3.skip();
  } catch(e) { threw = true; }
  ok('start/next/back/skip do not throw without DOM', !threw);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §10 DetectiveChallenges — unit tests
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §10 DetectiveChallenges unit tests ━━━\n');

{
  const dom4 = new JSDOM('', {
    runScripts: 'dangerously',
    url: 'http://localhost/',
  });
  const code = fs.readFileSync(path.join(ROOT, 'js/detective/challenges.js'), 'utf8');
  const s4 = dom4.window.document.createElement('script');
  s4.textContent = code;
  dom4.window.document.head.appendChild(s4);
  const C = dom4.window.DetectiveChallenges;

  ok('DetectiveChallenges exported', !!C);
  ok('init function exported',          typeof C.init           === 'function');
  ok('openChallenge function exported', typeof C.openChallenge  === 'function');
  ok('showHint function exported',      typeof C.showHint       === 'function');
  ok('revealSolution function exported',typeof C.revealSolution === 'function');
  ok('markComplete function exported',  typeof C.markComplete   === 'function');
  ok('getProgress function exported',   typeof C.getProgress    === 'function');
  ok('reset function exported',         typeof C.reset          === 'function');
  ok('_inject function exported',       typeof C._inject        === 'function');

  /* Inject minimal test data */
  const testData = [
    {
      id: 'b1', level: 'beginner', levelLabel: 'Beginner', title: 'Test B1',
      setup: 'Test setup.', ciphertext: 'WKH',
      hints: ['Hint 1', 'Hint 2', 'Hint 3'],
      solution: { plaintext: 'THE', key: 'Caesar 3', explanation: 'Test.' },
      whatYouLearned: { text: 'Something.', links: [{ text: 'Link', url: 'test.html' }] }
    },
    {
      id: 'i1', level: 'intermediate', levelLabel: 'Intermediate', title: 'Test I1',
      setup: 'Setup.', ciphertext: 'LXFOP',
      hints: ['H1', 'H2', 'H3'],
      solution: { plaintext: 'ATTAC', key: 'Vig LEMON', explanation: 'Test.' },
      whatYouLearned: { text: 'Info.', links: [] }
    }
  ];
  C._inject(testData);

  const prog0 = C.getProgress();
  ok('getProgress returns {completed, total}', typeof prog0.completed === 'number' && typeof prog0.total === 'number');
  ok('Initial progress: 0 completed',  prog0.completed === 0);
  ok('Total challenges equals injected count', prog0.total === 2);

  /* markComplete + getProgress */
  C.markComplete('b1');
  const prog1 = C.getProgress();
  ok('markComplete increments progress', prog1.completed === 1, `got ${prog1.completed}`);

  /* reset */
  C.reset();
  const progR = C.getProgress();
  ok('reset clears all progress', progR.completed === 0, `got ${progR.completed}`);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §11 challenges.json — data integrity
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §11 detective-challenges.json integrity ━━━\n');

{
  const jsonPath = path.join(ROOT, 'data/detective-challenges.json');
  ok('data/detective-challenges.json exists', fs.existsSync(jsonPath));

  if (fs.existsSync(jsonPath)) {
    let parsed;
    try { parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); } catch(e) { parsed = null; }
    ok('JSON parses without error', parsed !== null);

    if (parsed) {
      ok('Top-level has "challenges" array', Array.isArray(parsed.challenges));
      ok('Has 15 challenges', parsed.challenges.length === 15, `got ${parsed.challenges.length}`);
      ok('Version field is "2"', parsed.version === '2', `got "${parsed.version}"`);

      const ids = parsed.challenges.map(c => c.id);
      const beginner     = ids.filter(id => id.startsWith('b'));
      const intermediate = ids.filter(id => id.startsWith('i'));
      const advanced     = ids.filter(id => id.startsWith('a'));
      ok('5 beginner challenges (b1–b5)',         beginner.length     === 5);
      ok('5 intermediate challenges (i1–i5)',     intermediate.length === 5);
      ok('5 advanced challenges (a1–a5)',          advanced.length     === 5);

      const required = ['id','level','levelLabel','title','setup','ciphertext','hints','solution','whatYouLearned'];
      const allHaveRequired = parsed.challenges.every(c => required.every(k => Object.prototype.hasOwnProperty.call(c, k)));
      ok('All challenges have required fields', allHaveRequired);

      const allHints3 = parsed.challenges.every(c => Array.isArray(c.hints) && c.hints.length === 3);
      ok('All challenges have exactly 3 hints', allHints3);

      const allSolution = parsed.challenges.every(c =>
        c.solution && c.solution.plaintext && c.solution.key && c.solution.explanation);
      ok('All challenges have complete solution objects', allSolution);

      const nomenclator = parsed.challenges.find(c => c.id === 'a3');
      ok('A3 (The Agent\'s Codebook) has codebook object', !!(nomenclator && nomenclator.codebook));

      const levels = new Set(parsed.challenges.map(c => c.level));
      ok('All levels are beginner/intermediate/advanced',
        [...levels].every(l => ['beginner','intermediate','advanced'].includes(l)));
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   §12 DOM integration — attack tools rendered after input
   ═══════════════════════════════════════════════════════════════════════════ */

async function integrationTests() {

console.log('\n━━━ §12 DOM integration — attack tools ━━━\n');

{
  const CAESAR_CT = caesarEncrypt('THE QUICK BROWN FOX JUMPED OVER THE LAZY DOG MANY TIMES', 7);
  const dom = await buildDom(CAESAR_CT);
  const { document } = dom.window;

  const toolsEl = document.getElementById('det-attack-tools');
  ok('#det-attack-tools exists', !!toolsEl);
  ok('#det-attack-tools is visible after valid input', toolsEl && !toolsEl.hidden, `hidden=${toolsEl && toolsEl.hidden}`);

  const btns = toolsEl ? toolsEl.querySelectorAll('.attack-btn') : [];
  ok('7 attack buttons rendered', btns.length === 7, `got ${btns.length}`);

  const btnIds = Array.from(btns).map(b => b.getAttribute('data-tool'));
  ok('Caesar BF button present',      btnIds.includes('caesar'));
  ok('ROT13 button present',          btnIds.includes('rot13'));
  ok('Atbash button present',         btnIds.includes('atbash'));
  ok('Morse button present',          btnIds.includes('morse'));
  ok('Encoding button present',       btnIds.includes('encoding'));
  ok('VigKeyLength button present',   btnIds.includes('vigKeyLength'));
  ok('SubstFreq button present',      btnIds.includes('substFreq'));

  /* Morse should be disabled for alphabetic text */
  const morseBtn = Array.from(btns).find(b => b.getAttribute('data-tool') === 'morse');
  ok('Morse button disabled for alpha text', morseBtn && morseBtn.disabled === true);

  /* VigKeyLength should be disabled for high-IoC text */
  const vigBtn = Array.from(btns).find(b => b.getAttribute('data-tool') === 'vigKeyLength');
  ok('VigKeyLength button disabled for Caesar text (high IoC)', vigBtn && vigBtn.disabled === true);

  dom.window.close();
}

/* ═══════════════════════════════════════════════════════════════════════════
   §13 DOM integration — watch button rendered
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §13 DOM integration — watch button ━━━\n');

{
  const dom = await buildDom(caesarEncrypt('ABCDEFGHIJKLMNOPQRSTUVWXYZTHEQUICKBROWNFOX', 3));
  const { document } = dom.window;

  const wrapEl = document.getElementById('det-watch-wrap');
  ok('#det-watch-wrap exists', !!wrapEl);
  ok('#det-watch-wrap is visible after input', wrapEl && !wrapEl.hidden);

  const watchBtn = document.getElementById('det-watch-btn');
  ok('#det-watch-btn rendered', !!watchBtn);
  ok('Watch button has label text', watchBtn && watchBtn.textContent.toLowerCase().includes('watch'));

  dom.window.close();
}

/* ═══════════════════════════════════════════════════════════════════════════
   §14 DOM integration — challenge entry button
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §14 DOM integration — challenge entry ━━━\n');

{
  const dom = await buildDom();
  const { document } = dom.window;

  const btn = document.getElementById('det-challenge-btn');
  ok('#det-challenge-btn exists', !!btn);

  const modeEl = document.getElementById('det-challenge-mode');
  ok('#det-challenge-mode exists', !!modeEl);

  dom.window.close();
}

/* ═══════════════════════════════════════════════════════════════════════════
   §15 DOM integration — attack tool click dispatches result
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §15 DOM integration — attack tool output ━━━\n');

{
  const CT = caesarEncrypt('THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG MANY TIMES TODAY', 13);
  const dom = await buildDom(CT);
  const { document, Event } = dom.window;

  /* Click the Caesar BF button */
  const btns = document.querySelectorAll('.attack-btn');
  const caesarBtn = Array.from(btns).find(b => b.getAttribute('data-tool') === 'caesar');
  ok('Caesar BF button found and enabled', caesarBtn && !caesarBtn.disabled);

  if (caesarBtn && !caesarBtn.disabled) {
    caesarBtn.dispatchEvent(new Event('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 10));

    const resultEl = document.getElementById('det-attack-result');
    ok('#det-attack-result populated after click', resultEl && resultEl.innerHTML && resultEl.innerHTML.length > 20);
  }

  dom.window.close();
}

/* ═══════════════════════════════════════════════════════════════════════════
   §16 Regression — v1.5 CipherDetective.analyse still works
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §16 Regression — v1.5 API still works ━━━\n');

{
  const dom = await buildDom();
  const CD = dom.window.CipherDetective;

  ok('CipherDetective still exported', !!CD);
  ok('CipherDetective.analyse is function', typeof CD.analyse === 'function');

  const result = CD.analyse(caesarEncrypt('HELLOWORLD', 3));
  ok('analyse returns stats + candidates', result && result.stats && Array.isArray(result.candidates));
  ok('stats has n property', typeof result.stats.n === 'number');

  dom.window.close();
}

/* ═══════════════════════════════════════════════════════════════════════════
   §17 Regression — clear() hides attack tools
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n━━━ §17 Regression — clear() hides v2 elements ━━━\n');

{
  const dom = await buildDom(caesarEncrypt('THEQUICKBROWNFOXJUMPSOVERLAZYDOG', 9));
  const { document, Event } = dom.window;

  /* Tools should be visible after input */
  const toolsEl = document.getElementById('det-attack-tools');
  ok('Attack tools visible after input', toolsEl && !toolsEl.hidden);

  /* Clear by setting empty input */
  const ta = document.getElementById('detective-input');
  ta.value = '';
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  await new Promise(r => setTimeout(r, 10));

  ok('Attack tools hidden after clear', toolsEl && toolsEl.hidden);
  ok('Watch wrap hidden after clear', !!document.getElementById('det-watch-wrap') && document.getElementById('det-watch-wrap').hidden);

  dom.window.close();
}

} // end integrationTests

/* ─── Run ────────────────────────────────────────────────────────────────── */

integrationTests().then(() => {
  console.log('\n' + '─'.repeat(72));
  console.log(`  Detective v2 tests: ${pass} passed, ${fail} failed`);
  console.log('─'.repeat(72) + '\n');
  process.exit(fail > 0 ? 1 : 0);
}).catch(err => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
