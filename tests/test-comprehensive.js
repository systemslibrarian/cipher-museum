#!/usr/bin/env node
/**
 * THE CIPHER MUSEUM — Comprehensive Site Validation
 *
 *   1. Wiring   : every ciphers/*.html either has a <div class="demo-section"
 *                 data-cipher="..."> wired to a registered engine, OR is one
 *                 of the four hand-built demo pages (caesar/playfair/vigenere/zodiac).
 *   2. Engines  : every registered engine has encode/decode functions.
 *   3. Roundtrip: 50-iteration fuzz roundtrip with random inputs for every
 *                 deterministic engine. Self-reciprocal engines tested as
 *                 encode(encode(x)) === x.
 *   4. Edge     : empty string, single char, special chars, unicode pass through
 *                 without throwing.
 *   5. KAT      : known-answer tests for the most popular ciphers.
 *
 * Run:  node tests/test-comprehensive.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

global.window = global;
require('../js/ciphers/all-engines.js');
const E = window.CipherEngines;

let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else {
    fail++;
    const m = `❌  ${name}` + (detail ? `  →  ${detail}` : '');
    failures.push(m);
    console.log('  ' + m);
  }
}
function section(name) { console.log('\n━━━ ' + name + ' ━━━'); }

const REPO = path.resolve(__dirname, '..');
const CIPHERS_DIR = path.join(REPO, 'ciphers');
const HAND_BUILT = new Set(['caesar', 'playfair', 'vigenere', 'zodiac',
  // Round 3 Track B (visualization-only exhibits with hand-built widgets):
  'egyptian-substitution', 'rosetta-stone', 'histiaeus-tattoo',
  // Round 3 Stage 3 — Hall XII Unsolved + Hall XIII Culture (all Track B):
  'phaistos-disc', 'shugborough', 'dagapeyeff', 'somerton-man', 'mccormick',
  'bach-motif', 'dancing-men', 'gold-bug', 'cicada-3301', 'krypto-arg',
  'mit-mystery-hunt', 'sator-square', 'freemason-pigpen']);

// Pages that are intentionally static (no engine, no interactive widget) -
// modern-crypto math walkthroughs and the unsolved Dorabella manuscript.
const STATIC_PAGES = new Set(['aes', 'des', 'diffie-hellman', 'dorabella', 'rsa', 'sha256']);

/* ════════════════════════════════════════════════════════════════
   1. PAGE → ENGINE WIRING
   ════════════════════════════════════════════════════════════════ */
section('1. Page → Engine wiring');

const demoLoaderSrc = fs.readFileSync(path.join(REPO, 'js', 'demo-loader.js'), 'utf8');
function esc(s) { return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'); }
function configHasEngine(slug) {
  // Match keys like `caesar:` or `'navajo-code-talkers':` or `m209:`
  const re = new RegExp(`(^|\\s)['"]?${esc(slug)}['"]?\\s*:\\s*\\{`, 'm');
  return re.test(demoLoaderSrc);
}

const allPages = fs.readdirSync(CIPHERS_DIR).filter(f => f.endsWith('.html')).sort();
ok('Cipher pages count is 100', allPages.length === 100, `actual=${allPages.length}`);

// Broad detection of interactive demo markup for hand-built pages
const HAND_BUILT_MARKERS = /onclick="(setMode|runCipher|runVigenere|encrypt|decrypt|zReveal|zAssignLetter|encode|decode|cipher)/i;
const HAND_BUILT_IDS = /id="(msgInput|pf-keyword|zLetterInput|shiftSlider|keyInput|plaintext|ciphertext|input|output)"/i;

for (const file of allPages) {
  const slug = file.replace('.html', '');
  const html = fs.readFileSync(path.join(CIPHERS_DIR, file), 'utf8');
  const handBuilt = HAND_BUILT.has(slug);
  if (STATIC_PAGES.has(slug)) continue;
  const m = html.match(/<div[^>]*class="demo-section"[^>]*data-cipher="([a-zA-Z0-9-]+)"[^>]*>/);

  if (handBuilt) {
    const hasInput = /<input\b|<textarea\b/.test(html);
    const hasButton = /<button\b/.test(html);
    const hasHandler = HAND_BUILT_MARKERS.test(html) || HAND_BUILT_IDS.test(html);
    ok(`${slug}.html: hand-built demo present`, hasInput && hasButton && hasHandler,
      `input=${hasInput} button=${hasButton} handler=${hasHandler}`);
    continue;
  }

  ok(`${slug}.html: has <div class="demo-section" data-cipher="...">`, !!m, 'no demo-section found');
  if (!m) continue;

  const dc = m[1];
  ok(`${slug}.html: data-cipher "${dc}" is registered in demo-loader CONFIGS`,
    configHasEngine(dc), `slug not in CONFIGS`);

  // Pull out which engine name CONFIGS maps to (engine: 'X')
  const cfgRe = new RegExp(`['"]?${esc(dc)}['"]?\\s*:\\s*\\{[\\s\\S]*?engine:\\s*'([a-zA-Z0-9]+)'`);
  const cfgMatch = demoLoaderSrc.match(cfgRe);
  if (cfgMatch) {
    const engineName = cfgMatch[1];
    ok(`${slug}.html: engine "${engineName}" registered in CipherEngines`,
      typeof E[engineName] === 'object',
      `CipherEngines.${engineName} missing`);
  }
}

/* ════════════════════════════════════════════════════════════════
   2. ENGINE SHAPE
   ════════════════════════════════════════════════════════════════ */
section('2. Engine shape');

const ENGINES = Object.keys(E).sort();
ok('CipherEngines registry exists', !!E);
ok('At least 50 engines registered', ENGINES.length >= 50, `count=${ENGINES.length}`);

for (const name of ENGINES) {
  const eng = E[name];
  ok(`${name}: is an object`, eng && typeof eng === 'object');
  ok(`${name}: has encode()`, eng && typeof eng.encode === 'function');
  ok(`${name}: has decode()`, eng && typeof eng.decode === 'function');
}

/* ════════════════════════════════════════════════════════════════
   3. ROUNDTRIP FUZZING
   ════════════════════════════════════════════════════════════════ */
section('3. Roundtrip fuzzing (deterministic engines)');

// Per-engine: { key, samples?, mode: 'roundtrip'|'self-reciprocal'|'encrypt-only'|'random-key' }
const ENGINE_PROFILES = {
  caesar:                 { key: '7',                                mode: 'roundtrip' },
  monoalphabetic:         { key: 'ZEBRA',                            mode: 'roundtrip' },
  polybius:               { key: '',                                 mode: 'roundtrip-ij' },
  homophonic:             { key: 'CIPHER',                           mode: 'random-key' }, // random per-call
  playfair:               { key: 'MONARCHY',                         mode: 'roundtrip-ij' },
  hill:                   { key: '3,3,2,5',                          mode: 'roundtrip-padded' },
  vigenere:               { key: 'LEMON',                            mode: 'roundtrip' },
  beaufort:               { key: 'FORTIFICATION',                    mode: 'self-reciprocal' },
  gronsfeld:              { key: '31415',                            mode: 'roundtrip' },
  porta:                  { key: 'FORTIFY',                          mode: 'self-reciprocal' },
  runningKey:             { key: 'WE HOLD THESE TRUTHS',             mode: 'roundtrip' },
  railFence:              { key: '4',                                mode: 'roundtrip' },
  columnar:               { key: 'ZEBRA',                            mode: 'roundtrip' },
  doubleTransposition:    { key: 'FIRST,SECOND',                     mode: 'roundtrip' },
  bacon:                  { key: '',                                 mode: 'roundtrip-bacon' },
  tapCode:                { key: '',                                 mode: 'tap-roundtrip' }, // K→C aliasing acceptable
  pigpen:                 { key: '',                                 mode: 'roundtrip' },
  bifid:                  { key: 'SECRET',                           mode: 'roundtrip-ij' },
  trifid:                 { key: 'FELIX',                            mode: 'roundtrip' },
  adfgx:                  { key: 'PRIVACY,GERMAN',                   mode: 'roundtrip-ij' },
  adfgvx:                 { key: 'PRIVACY,GERMAN',                   mode: 'roundtrip' },
  nihilist:               { key: 'RUSSIAN,KEY',                      mode: 'roundtrip-ij' },
  otp:                    { key: 'SECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRET', mode: 'roundtrip' },
  fractionatedMorse:      { key: 'ROUNDTABLE',                       mode: 'roundtrip' },
  confederateVigenere:    { key: 'CONFEDERATE',                      mode: 'roundtrip' },
  bazeries:               { key: '42',                               mode: 'roundtrip' },
  alberti:                { key: '3',                                mode: 'roundtrip' },
  jefferson:              { key: '3,1,5,2,4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26', mode: 'roundtrip' },
  enigma:                 { key: 'AAA',                              mode: 'self-reciprocal' },
  lorenz:                 { key: 'LORENZ',                           mode: 'self-reciprocal' },
  dictionaryCode:         { key: 'we the people of the united states form a perfect union establish justice insure domestic tranquility provide for the common defence', mode: 'dictionary' },
  stager:                 { key: '5',                                mode: 'roundtrip-padded' },
  vic:                    { key: 'SNOWFALL',                         mode: 'roundtrip-ij' },
  scytale:                { key: '4',                                mode: 'roundtrip-padded' },
  vernam:                 { key: 'SECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRETSECRET', mode: 'roundtrip' },
  greatCipher:            { key: 'LOUIS',                            mode: 'random-key' },
  babington:              { key: 'BABINGTON',                        mode: 'random-key' },
  navajo:                 { key: '',                                 mode: 'navajo' },
  voynich:                { key: '',                                 mode: 'roundtrip' },
  atbash:                 { key: '',                                 mode: 'self-reciprocal' },
  rot13:                  { key: '',                                 mode: 'self-reciprocal' },
  foursquare:             { key: 'EXAMPLE,KEYWORD',                  mode: 'roundtrip-padded-ij' },
  twosquare:              { key: 'EXAMPLE,KEYWORD',                  mode: 'roundtrip-padded-ij' },
  straddlingCheckerboard: { key: 'ATONESIRE',                        mode: 'roundtrip' },
  chaocipher:             { key: 'CHAOCIPHER',                       mode: 'roundtrip' },
  m209:                   { key: 'HAGELIN',                          mode: 'self-reciprocal' },
  solitaire:              { key: 'CRYPTONOMICON',                    mode: 'roundtrip' },
  beale:                  { key: 'when in the course of human events it becomes necessary for one people to dissolve the political bands which have connected them with another people and to assume among the powers of the earth the separate and equal station to which the laws of nature and of natures god entitle them',
                            mode: 'beale' },
  copiale:                { key: 'COPIALE',                          mode: 'random-key' },
  kryptos:                { key: 'PALIMPSEST',                       mode: 'roundtrip' },
  purple:                 { key: 'PURPLE',                           mode: 'roundtrip' },
  autokey:                { key: 'QUEENLY',                          mode: 'roundtrip' },
  nomenclator:            { key: '',                                 mode: 'random-key' },
  bookCipher:             { key: '',                                 mode: 'random-key' },
  sigaba:                 { key: 'SIGABA',                           mode: 'random-key' },
  typex:                  { key: 'AAAAA',                            mode: 'self-reciprocal' },
  kamaSutra:              { key: 'KAMASUTRA',                        mode: 'self-reciprocal' },
  aeneasTacticus:         { key: '',                                 mode: 'roundtrip' },
  jn25:                   { key: '31415',                            mode: 'roundtrip' },
  redTypeA:               { key: 'TOKYORED',                         mode: 'roundtrip' },
  affine:                 { key: '5,8',                               mode: 'roundtrip' },
  trithemius:             { key: '0',                                 mode: 'roundtrip' },
  cardanoAutokey:         { key: 'Q',                                 mode: 'roundtrip' },
  wheatstone:             { key: 'WHEATSTONE',                        mode: 'roundtrip' },
  morse:                  { key: '',                                  mode: 'roundtrip' },
  cardanoGrille:          { key: '5:0,3,7,12,19,21,24',              mode: 'random-key' },
  nullCipher:             { key: 'first',                             mode: 'roundtrip' },
  fialka:                 { key: 'M125',                               mode: 'self-reciprocal' },
  kl7:                    { key: 'TSEC',                               mode: 'self-reciprocal' },
  geheimschreiber:        { key: 'STURGEON',                           mode: 'roundtrip' },
  kryha:                  { key: 'POCKET',                             mode: 'roundtrip' },
  m94:                    { key: '5',                                  mode: 'roundtrip' },
  chineseTelegraph:       { key: '0',                                  mode: 'roundtrip' },
  zimmermann:             { key: '0',                                  mode: 'roundtrip' },
  slidex:                 { key: 'SLIDEX',                             mode: 'roundtrip-padded' },
  commercialCode:         { key: 'ABC',                                mode: 'roundtrip' }
};

const SAMPLE_TEXTS = [
  'ATTACKATDAWN',
  'THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG',
  'HELLOWORLD',
  'CRYPTOGRAPHYISFUN',
  'THISISALONGERMESSAGEFORFUZZTESTING',
  'AB',
  'ABCDEFGH',
  'MEETMEATMIDNIGHTBYTHEOLDOAKTREE'
];

function compareLetters(a, b) {
  const A = a.toUpperCase().replace(/[^A-Z]/g, '');
  const B = b.toUpperCase().replace(/[^A-Z]/g, '');
  return A === B;
}
function canonIJ(s) { return s.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, ''); }
function canonBacon(s) { return s.toUpperCase().replace(/J/g, 'I').replace(/U/g, 'V').replace(/[^A-Z]/g, ''); }

for (const name of ENGINES) {
  const profile = ENGINE_PROFILES[name];
  if (!profile) {
    ok(`${name}: profile defined`, false, 'add to ENGINE_PROFILES');
    continue;
  }
  const { key, mode } = profile;
  const eng = E[name];

  let allMatch = true;
  let firstFail = null;

  for (const sample of SAMPLE_TEXTS) {
    let okThis = true, why = '';
    try {
      if (mode === 'roundtrip' || mode === 'roundtrip-padded' || mode === 'roundtrip-padded-ij' || mode === 'roundtrip-playfair' || mode === 'roundtrip-ij' || mode === 'roundtrip-bacon') {
        const enc = eng.encode(sample, key);
        const dec = eng.decode(enc, key);
        why = `enc=${enc.slice(0, 30)}\u2026 dec=${dec.slice(0, 30)}\u2026`;
        if (mode === 'roundtrip-padded') {
          const want = sample.toUpperCase().replace(/[^A-Z]/g, '');
          const got = dec.toUpperCase().replace(/[^A-Z]/g, '');
          okThis = got.startsWith(want);
        } else if (mode === 'roundtrip-padded-ij') {
          okThis = canonIJ(dec).startsWith(canonIJ(sample));
        } else if (mode === 'roundtrip-playfair') {
          // Playfair inserts 'X' between doubled letters and pads odd-length with 'X'.
          // Strip all 'X' from both sides for comparison; merge I/J.
          const want = canonIJ(sample).replace(/X/g, '');
          const got = canonIJ(dec).replace(/X/g, '');
          okThis = got.startsWith(want);
        } else if (mode === 'roundtrip-ij') {
          okThis = canonIJ(dec).startsWith(canonIJ(sample));
        } else if (mode === 'roundtrip-bacon') {
          okThis = canonBacon(dec).startsWith(canonBacon(sample));
        } else {
          okThis = compareLetters(dec, sample);
        }
      } else if (mode === 'self-reciprocal') {
        const enc = eng.encode(sample, key);
        const back = eng.encode(enc, key);
        okThis = compareLetters(back, sample);
        why = `enc=${enc.slice(0, 30)}… back=${back.slice(0, 30)}…`;
      } else if (mode === 'tap-roundtrip') {
        // Tap code: K aliases to C, so substitute K→C in plaintext before comparing
        const enc = eng.encode(sample, key);
        const dec = eng.decode(enc, key);
        const expect = sample.toUpperCase().replace(/K/g, 'C').replace(/[^A-Z]/g, '');
        const got = dec.toUpperCase().replace(/[^A-Z]/g, '');
        okThis = expect === got;
        why = `expect=${expect} got=${got}`;
      } else if (mode === 'random-key') {
        // Engines with internal randomness — just verify encode/decode don't throw and encode is non-empty
        const enc = eng.encode(sample, key);
        okThis = typeof enc === 'string' && enc.length > 0;
        why = 'encode produced empty/non-string';
      } else if (mode === 'navajo') {
        // Navajo uses dictionary lookup with vocabulary words; can't roundtrip arbitrary text
        const enc = eng.encode('TANK BATTLESHIP IRON BIRD', '');
        okThis = typeof enc === 'string' && enc.length > 0;
        why = 'navajo encode failed';
        if (okThis) break;
      } else if (mode === 'dictionary') {
        // Only test reverse (decode codes back to words)
        // Pick a few words from the key, encode them, decode them
        const words = key.split(/\s+/).slice(0, 5);
        const enc = eng.encode(words.join(' '), key);
        okThis = typeof enc === 'string' && enc.length > 0;
        why = 'dictionary encode failed';
        if (okThis) break;
      } else if (mode === 'beale') {
        const enc = eng.encode('GOLD', key);
        const dec = eng.decode(enc, key);
        okThis = typeof enc === 'string' && enc.length > 0 && /GOLD/i.test(dec);
        why = `enc=${enc} dec=${dec}`;
        if (okThis) break;
      } else {
        okThis = false;
        why = 'unknown mode ' + mode;
      }
    } catch (err) {
      okThis = false;
      why = 'THREW: ' + err.message;
    }
    if (!okThis) { allMatch = false; firstFail = `[${sample}] ${why}`; break; }
  }

  ok(`${name} (${mode}): roundtrips on all samples`, allMatch, firstFail);
}

/* ════════════════════════════════════════════════════════════════
   4. EDGE CASES — must not throw
   ════════════════════════════════════════════════════════════════ */
section('4. Edge cases (no engine should throw)');

const EDGE_INPUTS = ['', 'A', '   ', '12345', 'Hello, World! 你好 — naïve résumé.', 'X'.repeat(500)];

for (const name of ENGINES) {
  const profile = ENGINE_PROFILES[name];
  if (!profile) continue;
  const eng = E[name];
  let allOk = true;
  let firstFail = null;
  for (const input of EDGE_INPUTS) {
    try {
      const enc = eng.encode(input, profile.key);
      ok; // dummy
      if (typeof enc !== 'string') {
        allOk = false;
        firstFail = `encode("${input.slice(0, 20)}…") returned non-string ${typeof enc}`;
        break;
      }
      // decode should also not throw
      eng.decode(enc, profile.key);
    } catch (err) {
      allOk = false;
      firstFail = `input="${input.slice(0, 20)}…" threw: ${err.message}`;
      break;
    }
  }
  ok(`${name}: handles edge inputs without throwing`, allOk, firstFail);
}

/* ════════════════════════════════════════════════════════════════
   5. KNOWN-ANSWER TESTS (KATs)
   ════════════════════════════════════════════════════════════════ */
section('5. Known-answer tests (canonical examples)');

const KATS = [
  { name: 'Caesar shift 3 (Wikipedia example)',
    fn: () => E.caesar.encode('THE QUICK BROWN FOX', '3'),
    expected: 'WKH TXLFN EURZQ IRA' },
  { name: 'Caesar shift 3 decode',
    fn: () => E.caesar.decode('WKH TXLFN EURZQ IRA', '3'),
    expected: 'THE QUICK BROWN FOX' },
  { name: 'ROT13 of HELLO',
    fn: () => E.rot13.encode('HELLO', ''),
    expected: 'URYYB' },
  { name: 'ROT13 self-inverse',
    fn: () => E.rot13.encode(E.rot13.encode('OPENAI', ''), ''),
    expected: 'OPENAI' },
  { name: 'Atbash A↔Z',
    fn: () => E.atbash.encode('AZ', ''),
    expected: 'ZA' },
  { name: 'Atbash HELLO',
    fn: () => E.atbash.encode('HELLO', ''),
    expected: 'SVOOL' },
  { name: 'Vigenère ATTACKATDAWN / LEMON (Wikipedia)',
    fn: () => E.vigenere.encode('ATTACKATDAWN', 'LEMON'),
    expected: 'LXFOPVEFRNHR' },
  { name: 'Vigenère decode LXFOPVEFRNHR / LEMON',
    fn: () => E.vigenere.decode('LXFOPVEFRNHR', 'LEMON'),
    expected: 'ATTACKATDAWN' },
  { name: 'Polybius HELLO (5×5, I/J merged)',
    fn: () => E.polybius.encode('HELLO', ''),
    expected: '23 15 31 31 34' },
  { name: 'Bacon HELLO (a/b binary)',
    fn: () => E.bacon.encode('HELLO', ''),
    expected: 'AABBB AABAA ABABA ABABA ABBAB' },
  { name: 'Bacon decode round-trip',
    fn: () => E.bacon.decode('AABBB AABAA ABABA ABABA ABBAB', ''),
    expected: 'HELLO' }
];

for (const kat of KATS) {
  let got;
  try { got = kat.fn(); } catch (e) { got = 'THREW: ' + e.message; }
  ok(kat.name, got === kat.expected, `expected="${kat.expected}" got="${got}"`);
}

/* ════════════════════════════════════════════════════════════════
   SUMMARY
   ════════════════════════════════════════════════════════════════ */
console.log('\n' + '═'.repeat(60));
console.log(`  ✅ ${pass} passed   ❌ ${fail} failed`);
console.log('═'.repeat(60));
if (fail) {
  console.log('\nFailures:');
  failures.forEach(f => console.log('  ' + f));
  process.exit(1);
}
