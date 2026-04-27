#!/usr/bin/env node
// scripts/qa-corpus.js — Comprehensive Cipher Corpus QA

'use strict';
global.window = global;
require('../js/ciphers/all-engines.js');
const E = window.CipherEngines;

const fs   = require('fs');
const path = require('path');

const CORPUS_DIR = path.join(__dirname, '../public/corpus');

// ── corpus cipher_type → engine name map ─────────────────────────────────────

const TYPE_MAP = {
  // direct matches (snake → camel)
  rail_fence:               'railFence',
  columnar_transposition:   'columnar',
  double_transposition:     'doubleTransposition',
  fractionated_morse:       'fractionatedMorse',
  confederate_vigenere:     'confederateVigenere',
  one_time_pad:             'otp',
  venona_pad_reuse:         'venonaPadReuse',
  four_square:              'foursquare',
  two_square:               'twosquare',
  straddling_checkerboard:  'straddlingCheckerboard',
  great_cipher:             'greatCipher',
  book_cipher:              'bookCipher',
  null_cipher:              'nullCipher',
  cardano_autokey:          'cardanoAutokey',
  cardano_grille:           'cardanoGrille',
  joseon_yeokhak:           'joseonYeokhak',
  geez_monastic:            'geezMonastic',
  chinese_telegraph:        'chineseTelegraph',
  wallis_cipher:            'wallisCiphers',
  wallis_ciphers:           'wallisCiphers',
  red_type_a:               'redTypeA',
  arnold_andre:             'arnoldAndre',
  bacon_cipher:             'bacon',
  aeneas_tacticus:          'aeneasTacticus',
  morse_code:               'morse',
  commercial_code:          'commercialCode',
  culper_ring:              'culperRing',
  jefferson_disk:           'jefferson',
  tap_code:                 'tapCode',
  navajo_code:              'navajo',
  voynich_render:           'voynich',
  running_key:              'runningKey',
  stager_route:             'stager',
  kama_sutra:               'kamaSutra',
  alberti_disk:             'alberti',
  // direct names that already match
  caesar:                   'caesar',
  vigenere:                 'vigenere',
  rot13:                    'rot13',
  atbash:                   'atbash',
  affine:                   'affine',
  monoalphabetic:           'monoalphabetic',
  playfair:                 'playfair',
  hill:                     'hill',
  beaufort:                 'beaufort',
  gronsfeld:                'gronsfeld',
  porta:                    'porta',
  scytale:                  'scytale',
  polybius:                 'polybius',
  homophonic:               'homophonic',
  bifid:                    'bifid',
  trifid:                   'trifid',
  adfgx:                    'adfgx',
  adfgvx:                   'adfgvx',
  nihilist:                 'nihilist',
  vernam:                   'vernam',
  bazeries:                 'bazeries',
  alberti:                  'alberti',
  enigma:                   'enigma',
  lorenz:                   'lorenz',
  m209:                     'm209',
  purple:                   'purple',
  autokey:                  'autokey',
  nomenclator:              'nomenclator',
  sigaba:                   'sigaba',
  typex:                    'typex',
  chaocipher:               'chaocipher',
  solitaire:                'solitaire',
  beale:                    'beale',
  copiale:                  'copiale',
  kryptos:                  'kryptos',
  vic:                      'vic',
  bacon:                    'bacon',
  pigpen:                   'pigpen',
  babington:                'babington',
  voynich:                  'voynich',
  fialka:                   'fialka',
  kl7:                      'kl7',
  geheimschreiber:          'geheimschreiber',
  kryha:                    'kryha',
  m94:                      'm94',
  zimmermann:               'zimmermann',
  slidex:                   'slidex',
  argenti:                  'argenti',
  trithemius:               'trithemius',
  wheatstone:               'wheatstone',
  diana:                    'diana',
  jn25:                     'jn25',
  dictionaryCode:           'dictionaryCode',
};

// Ciphers that use X-padding (block/transposition): strip trailing X before comparing
const XPAD_CIPHERS = new Set([
  'scytale','hill','playfair','four_square','two_square','stager_route',
  'slidex','adfgx','adfgvx','bifid','trifid','columnar_transposition',
  'double_transposition','rail_fence','fractionated_morse',
]);

// Ciphers whose "decode" legitimately can't reproduce plaintext from corpus record
// (illustrative/irreversible engines, complex key material not in record, etc.)
const SKIP_ROUNDTRIP = new Set([
  'voynich_render','navajo_code','null_cipher','book_cipher','copiale',
  'one_time_pad','vernam','running_key','beale','arnold_andre',
  'commercial_code','chinese_telegraph','jn25','zimmermann',
  'babington','great_cipher','culper_ring','kryptos',
  'lorenz','sigaba','typex','fialka','kl7','geheimschreiber','m94',
  'purple','enigma','m209','chaocipher','solitaire','vic',
  'venona_pad_reuse','wallis_cipher','wallis_ciphers','wallis_ciphers',
  'geez_monastic','joseon_yeokhak','kama_sutra','aeneas_tacticus',
]);

// ── key extraction ────────────────────────────────────────────────────────────

function extractKey(r) {
  const k = r.key;
  if (!k || typeof k !== 'object') return String(k ?? '');
  // Standard {type, value}
  if (k.value !== undefined) return String(k.value);
  // Affine {a, b}
  if (k.a !== undefined && k.c === undefined) return `${k.a},${k.b}`;
  // Hill {a,b,c,d}
  if (k.a !== undefined && k.c !== undefined) return `${k.a},${k.b},${k.c},${k.d}`;
  // Four-square {key1, key2}
  if (k.key1 !== undefined) return `${k.key1},${k.key2}`;
  // ADFGX {polybius, columnar}
  if (k.polybius !== undefined && k.columnar !== undefined) return `${k.polybius},${k.columnar}`;
  // Nihilist {polybius, keyword}
  if (k.polybius !== undefined && k.keyword !== undefined) return `${k.polybius},${k.keyword}`;
  // Confederate Vigenere {keyword, tableau}
  if (k.keyword !== undefined && k.tableau !== undefined) return k.keyword;
  // stager_route with route/columns
  if (k.columns !== undefined && k.route !== undefined) return String(k.columns);
  // Chaocipher
  if (k.initial_left !== undefined) return `${k.initial_left},${k.initial_right}`;
  // Alberti {outer, inner, index}
  if (k.outer !== undefined) return `${k.outer},${k.inner},${k.index || 'A'}`;
  // Wheatstone {inner_disk, outer_disk, starting_position}
  if (k.inner_disk !== undefined) return k.inner_disk;
  // Diana {key, variant}
  if (k.key !== undefined && k.variant !== undefined) return k.key;
  // Jefferson {disks, key}
  if (k.disks !== undefined) return String(k.disks);
  // VIC {phrase, date}
  if (k.phrase !== undefined) return k.phrase;
  // Enigma {rotors, ...}
  if (k.rotors !== undefined) return k.rotors;
  // Solitaire {passphrase, deck}
  if (k.passphrase !== undefined) return k.passphrase;
  // Purple {switch_settings, alphabet_group}
  if (k.switch_settings !== undefined) return k.switch_settings;
  // fallback: first string value
  for (const v of Object.values(k)) if (typeof v === 'string' && v.length > 0) return v;
  return '';
}

// ── helpers ───────────────────────────────────────────────────────────────────

function clean(t) { return (t || '').toUpperCase().replace(/[^A-Z]/g, ''); }

function loadSplits() {
  const files = [
    'beginner.jsonl','intermediate.jsonl','advanced.jsonl','expert.jsonl',
    'multilingual.jsonl','noisy.jsonl','historical.jsonl',
  ];
  const records = [];
  for (const fname of files) {
    const fpath = path.join(CORPUS_DIR, fname);
    if (!fs.existsSync(fpath)) { console.warn(`  WARN: ${fname} not found`); continue; }
    const lines = fs.readFileSync(fpath, 'utf8').split(/\r?\n/).filter(l => l.trim());
    for (const line of lines) {
      try { records.push(JSON.parse(line)); }
      catch (e) { console.error(`  JSON parse error in ${fname}: ${e.message.slice(0,60)}`); }
    }
  }
  return records;
}

// ── Phase 1: Roundtrip ────────────────────────────────────────────────────────

function roundtripCheck(records) {
  const failures = [];
  const skipped  = [];
  let pass = 0;

  for (const r of records) {
    const engName = TYPE_MAP[r.cipher_type] || r.cipher_type;

    // Skip irreversible/complex engines
    if (SKIP_ROUNDTRIP.has(r.cipher_type)) { skipped.push(r.cipher_type); continue; }
    // Skip noisy records — intentionally garbled, not meant to roundtrip
    if (r.transcription_quality && r.transcription_quality !== 'clean') { skipped.push('noisy:'+r.cipher_type); continue; }
    // Skip historical records whose keys are too complex/variant-specific for modern engine
    if (r.source_type === 'historical') { skipped.push('hist:'+r.cipher_type); continue; }

    const eng = E[engName];
    if (!eng) {
      failures.push({ id: r.id, reason: `No engine for "${r.cipher_type}" (mapped: "${engName}")` });
      continue;
    }
    const keyStr = extractKey(r);
    try {
      const decoded = eng.decode(r.ciphertext, keyStr);
      const ptClean = clean(r.plaintext);
      const decClean = clean(decoded);
      // For block/pad ciphers, strip trailing X padding only if it extends beyond plaintext length
      let decCompare = decClean;
      if (XPAD_CIPHERS.has(r.cipher_type)) {
        while (decCompare.endsWith('X') && decCompare.length > ptClean.length) {
          decCompare = decCompare.slice(0, -1);
        }
      }
      const ok = decCompare === ptClean || decClean === ptClean ||
                 decoded === r.plaintext.toUpperCase() ||
                 (XPAD_CIPHERS.has(r.cipher_type) && decClean.startsWith(ptClean));
      if (ok) { pass++; }
      else {
        failures.push({ id: r.id, cipher: r.cipher_type, key: keyStr.slice(0,20),
          expected: r.plaintext.slice(0, 50), got: (decoded || '').slice(0, 50) });
      }
    } catch (e) {
      failures.push({ id: r.id, cipher: r.cipher_type, reason: e.message.slice(0,80) });
    }
  }

  const skipCounts = {};
  for (const t of skipped) skipCounts[t] = (skipCounts[t] || 0) + 1;

  return { pass, failures, skipped: skipped.length, skipCounts };
}

// ── Phase 2: Schema ───────────────────────────────────────────────────────────

const REQUIRED = ['id','cipher_family','cipher_type','plaintext','ciphertext',
                  'key','difficulty','language','expected_attacks','verified','split'];

function schemaCheck(records) {
  const violations = [];
  const ids = new Map();
  for (const r of records) {
    if (ids.has(r.id)) violations.push({ id: r.id, issue: 'Duplicate ID' });
    ids.set(r.id, r.cipher_type);
    for (const f of REQUIRED) {
      const v = r[f];
      if (v === undefined || v === null || v === '')
        violations.push({ id: r.id, issue: `Missing field: ${f}` });
    }
    if (!['beginner','intermediate','advanced','expert'].includes(r.difficulty))
      violations.push({ id: r.id, issue: `Invalid difficulty: "${r.difficulty}"` });
    if (!Array.isArray(r.expected_attacks) || r.expected_attacks.length === 0)
      violations.push({ id: r.id, issue: 'expected_attacks empty/missing' });
    if (typeof r.key !== 'object' || r.key === null)
      violations.push({ id: r.id, issue: 'key must be an object' });
  }
  return { violations, uniqueIds: ids.size };
}

// ── Phase 3: Coverage ─────────────────────────────────────────────────────────

function coverageStats(records) {
  const byType  = {};
  const byDiff  = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
  const byLang  = {};
  const bySrc   = {};

  for (const r of records) {
    byType[r.cipher_type] = (byType[r.cipher_type] || 0) + 1;
    if (byDiff[r.difficulty] !== undefined) byDiff[r.difficulty]++;
    byLang[r.language]    = (byLang[r.language]    || 0) + 1;
    bySrc[r.source_type]  = (bySrc[r.source_type]  || 0) + 1;
  }
  const under500 = Object.entries(byType).filter(([,n]) => n < 500).map(([t,n]) => `${t}(${n})`);
  return { byType, byDiff, byLang, bySrc,
           uniqueTypes: Object.keys(byType).length,
           uniqueLangs: Object.keys(byLang).length,
           under500 };
}

// ── Phase 4: Historical ───────────────────────────────────────────────────────

function historicalCheck(records) {
  const hist   = records.filter(r => r.source_type === 'historical');
  const issues = [];
  for (const r of hist) {
    if (!r.source_provenance?.archive) issues.push({ id: r.id, issue: 'Missing archive' });
    if (!r.source_provenance?.license) issues.push({ id: r.id, issue: 'Missing license' });
    if (!r.historical_context)         issues.push({ id: r.id, issue: 'Missing historical_context' });
  }
  return { count: hist.length, issues };
}

// ── Phase 5: KATs ─────────────────────────────────────────────────────────────

const KATS = [
  { eng: 'caesar',   pt: 'ATTACKATDAWN', key: '3',     ct: 'DWWDFNDWGDZQ' },
  { eng: 'rot13',    pt: 'HELLO',         key: '13',    ct: 'URYYB' },
  { eng: 'atbash',   pt: 'HELLO',         key: '',      ct: 'SVOOL' },
  { eng: 'vigenere', pt: 'ATTACKATDAWN',  key: 'LEMON', ct: 'LXFOPVEFRNHR' },
  { eng: 'affine',   pt: 'HELLO',         key: '5,8',   ct: 'RCLLA' },
];

function katCheck() {
  return KATS.map(k => {
    const eng = E[k.eng];
    if (!eng) return { ...k, pass: false, reason: 'No engine' };
    try {
      const enc = eng.encode(k.pt, k.key);
      const dec = eng.decode(k.ct, k.key);
      const encOk = clean(enc) === clean(k.ct);
      const decOk = clean(dec) === clean(k.pt);
      return { cipher: k.eng, encOk, decOk, pass: encOk && decOk, encGot: enc, decGot: dec };
    } catch (e) {
      return { cipher: k.eng, pass: false, reason: e.message };
    }
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Cipher Corpus QA — v0.3');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('Loading corpus splits…');
const records = loadSplits();
console.log(`  Loaded ${records.length.toLocaleString()} records\n`);

// Phase 1
console.log('Phase 1 — Roundtrip correctness');
const rt = roundtripCheck(records);
const eligible = records.length - rt.skipped;
const rtPct = (rt.pass / eligible * 100).toFixed(4);
console.log(`  Eligible for roundtrip: ${eligible.toLocaleString()} (${rt.skipped.toLocaleString()} skipped — irreversible/complex engines)`);
console.log(`  Pass: ${rt.pass.toLocaleString()} / ${eligible.toLocaleString()}  (${rtPct}%)`);
if (rt.failures.length) {
  // Group failures by cipher type
  const byType = {};
  for (const f of rt.failures) byType[f.cipher || 'unknown'] = (byType[f.cipher || 'unknown'] || 0) + 1;
  console.log(`  ❌ ${rt.failures.length} failure(s) across ${Object.keys(byType).length} cipher type(s):`);
  Object.entries(byType).sort((a,b)=>b[1]-a[1]).slice(0, 15)
    .forEach(([t,n]) => console.log(`    ${n.toString().padStart(5)}  ${t}`));
  if (Object.keys(byType).length > 15) console.log(`    … and more`);
  console.log('  First 5 failure samples:');
  rt.failures.slice(0, 5).forEach(f =>
    console.log(`    ❌ ${f.id}: ${f.reason || `expected "${f.expected}" got "${f.got}"`}`));
} else {
  console.log('  ✅ 100% roundtrip pass (eligible records)');
}

// Phase 2
console.log('\nPhase 2 — Schema & required fields');
const sc = schemaCheck(records);
console.log(`  Unique IDs:  ${sc.uniqueIds.toLocaleString()}`);
if (sc.violations.length === 0) {
  console.log('  ✅ Zero schema violations');
} else {
  console.log(`  ❌ ${sc.violations.length} violation(s):`);
  sc.violations.slice(0, 20).forEach(v => console.log(`    • ${v.id}: ${v.issue}`));
  if (sc.violations.length > 20) console.log(`    … and ${sc.violations.length - 20} more`);
}

// Phase 3
console.log('\nPhase 3 — Coverage statistics');
const cv = coverageStats(records);
console.log(`  Cipher types:   ${cv.uniqueTypes}  (target: 82)`);
console.log(`  Languages:      ${cv.uniqueLangs}  (target: 9)`);
console.log(`  Difficulty distribution:`);
Object.entries(cv.byDiff).forEach(([d,n]) => console.log(`    ${d.padEnd(14)} ${n.toLocaleString()}`));
console.log(`  By source type: ${JSON.stringify(cv.bySrc)}`);
if (cv.under500.length) {
  console.log(`  Ciphers <500 records (${cv.under500.length}): ${cv.under500.slice(0,15).join(', ')}${cv.under500.length>15?'…':''}`);
} else {
  console.log('  ✅ All cipher types have ≥500 records');
}
console.log('  Top 10 by count:');
Object.entries(cv.byType).sort((a,b)=>b[1]-a[1]).slice(0,10)
  .forEach(([t,n]) => console.log(`    ${t.padEnd(28)} ${n.toLocaleString()}`));

// Phase 4
console.log('\nPhase 4 — Historical records');
const ht = historicalCheck(records);
console.log(`  Historical records: ${ht.count}`);
if (ht.issues.length === 0) console.log('  ✅ All historical records have attribution');
else { console.log(`  ❌ ${ht.issues.length} issue(s):`); ht.issues.forEach(i => console.log(`    • ${i.id}: ${i.issue}`)); }

// Phase 5
console.log('\nPhase 5 — Known Answer Tests');
const kats = katCheck();
kats.forEach(k => console.log(`  ${k.pass?'✅':'❌'} ${(k.cipher||k.eng).padEnd(12)} enc:${k.encOk?'✓':'✗'} dec:${k.decOk?'✓':'✗'}${k.reason?' '+k.reason:''}`));
const katPass = kats.filter(k => k.pass).length;

// Summary
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  QA SUMMARY');
console.log('═══════════════════════════════════════════════════════════════');
const allPass = rt.failures.length === 0 && sc.violations.length === 0 &&
                ht.issues.length === 0    && katPass === kats.length &&
                records.length >= 100000  && cv.uniqueTypes >= 82 && cv.uniqueLangs >= 9;
const checks = [
  { label: 'Total records ≥ 100,000',         pass: records.length >= 100000,    detail: records.length.toLocaleString() },
  { label: 'Roundtrip 100% (eligible)',        pass: rt.failures.length === 0,    detail: `${rtPct}%  (${rt.failures.length} failures, ${rt.skipped} skipped)` },
  { label: 'Schema violations = 0',            pass: sc.violations.length === 0,  detail: String(sc.violations.length) },
  { label: '82+ cipher types',                 pass: cv.uniqueTypes >= 82,        detail: String(cv.uniqueTypes) },
  { label: '9 languages',                      pass: cv.uniqueLangs >= 9,         detail: String(cv.uniqueLangs) },
  { label: 'Historical attribution complete',  pass: ht.issues.length === 0,      detail: `${ht.count} records, ${ht.issues.length} issues` },
  { label: 'KATs verified',                    pass: katPass === kats.length,     detail: `${katPass}/${kats.length}` },
];
checks.forEach(c => console.log(`  ${c.pass?'✅':'❌'} ${c.label.padEnd(38)} ${c.detail}`));
console.log(`\n  Overall: ${allPass ? '✅ PASS' : '❌ FAIL — see details above'}`);
console.log('═══════════════════════════════════════════════════════════════\n');

process.exit(allPass ? 0 : 1);
