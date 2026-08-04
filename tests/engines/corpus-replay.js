#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

global.window = global;
require('../../js/ciphers/all-engines.js');

const engines = global.CipherEngines;
const corpusPath = path.resolve(__dirname, '../../public/corpus/all.jsonl');
const limitAt = process.argv.indexOf('--limit');
const limit = limitAt >= 0 ? Number(process.argv[limitAt + 1]) : Infinity;
const engineAt = process.argv.indexOf('--engine');
const engineFilter = engineAt >= 0 ? process.argv[engineAt + 1] : null;

const TYPE_MAP = {
  rail_fence: 'railFence',
  columnar_transposition: 'columnar',
  double_transposition: 'doubleTransposition',
  fractionated_morse: 'fractionatedMorse',
  confederate_vigenere: 'confederateVigenere',
  one_time_pad: 'otp',
  venona_pad_reuse: 'venonaPadReuse',
  four_square: 'foursquare',
  two_square: 'twosquare',
  straddling_checkerboard: 'straddlingCheckerboard',
  great_cipher: 'greatCipher',
  book_cipher: 'bookCipher',
  null_cipher: 'nullCipher',
  cardano_autokey: 'cardanoAutokey',
  cardano_grille: 'cardanoGrille',
  wadsworth: 'wadsworth',
  geez_monastic: 'geezMonastic',
  chinese_telegraph: 'chineseTelegraph',
  wallis_cipher: 'wallisCiphers',
  wallis_ciphers: 'wallisCiphers',
  red_type_a: 'redTypeA',
  arnold_andre: 'arnoldAndre',
  bacon_cipher: 'bacon',
  aeneas_tacticus: 'aeneasTacticus',
  morse_code: 'morse',
  commercial_code: 'commercialCode',
  culper_ring: 'culperRing',
  jefferson_disk: 'jefferson',
  tap_code: 'tapCode',
  navajo_code: 'navajo',
  voynich_render: 'voynich',
  running_key: 'runningKey',
  stager_route: 'stager',
  kama_sutra: 'kamaSutra',
  alberti_disk: 'alberti'
};

const IJ_MERGED = new Set([
  'playfair', 'four_square', 'two_square', 'bifid', 'polybius', 'adfgx',
  'nihilist', 'vic', 'bacon', 'bacon_cipher'
]);

const FILLER_ESCAPE_ENGINES = new Set([
  'playfair', 'hill', 'stager', 'scytale', 'foursquare', 'twosquare',
  'solitaire', 'slidex'
]);

const HISTORICAL_VARIANT_RATIONALES = {
  lorenz: 'The historical Tunny record requires the actual SZ40/42 wheel patterns and settings; the demo derives illustrative wheel bits from a seed.',
  bookCipher: 'The historical record is the unsolved Beale Paper No. 1; its true plaintext and key text are unknown, so no engine can reproduce it.',
  stager: 'The historical Stager record uses a specific route layout not represented by the demo column-count API.',
  confederateVigenere: 'The historical brass-disk record uses a period alphabet/tableau; the demo implements ordinary repeating-key Vigenere.',
  zimmermann: 'The historical telegram uses German diplomatic codebooks 0075/13040; the demo uses an illustrative English word list.',
  enigma: 'The historical record requires rotor order, rings, reflector, and plugboard settings unsupported by the simplified registry API; the full exhibit engine supports them.',
  vic: 'The historical VIC records require exact personal number, date, phrase, and transposition-width settings; the demo derives all four stages from one keyword.',
  culperRing: 'The historical record uses original Tallmadge codebook numbers; the demo ships a smaller reconstructed codebook.',
  navajo: 'The historical phrase uses the full USMC Navajo vocabulary and tokenization; the demo contains a small vocabulary subset.',
  alberti: 'The historical De Cifris record specifies disk alphabets and indicators not accepted by the demo numeric-setting API.',
  vigenere: 'The historical record uses a period tableau/key convention that differs from the demo A-Z Vigenere convention.',
  adfgvx: 'The historical ADFGVX record uses a specific keyed 6x6 square and transposition convention not encoded in the demo key.',
  sigaba: 'The historical SIGABA record requires real cipher/control/index rotor settings; the registry engine is a seeded pedagogical model.',
  jefferson: 'The historical wheel record uses a specific physical disk alphabet/order set not present in the demo disk table.',
  m94: 'The historical M-94 record uses issued disk alphabets and order; the registry engine generates seeded illustrative disks.',
  purple: 'The historical Purple record requires sixes/twenties switch wirings and stepping settings; the demo uses seeded substitution alphabets.',
  greatCipher: 'The historical Grand Chiffre record uses the Rossignol numerical codebook; the demo has an illustrative syllable table.',
  babington: 'The historical Babington symbols and nomenclator are not the seeded bracket-token representation used by the demo.',
  nullCipher: 'The historical record supplies an existing carrier text; the demo API instead generates its own carrier words from plaintext.',
  venonaPadReuse: 'The historical VENONA record uses Soviet five-digit code groups and additive pads; the demo is a simplified A-Z 5-bit XOR model.',
  arnoldAndre: 'The historical book references depend on the exact Blackstone edition and page layout; the demo uses a reconstructed 240-word source.',
  diana: 'The historical Diana record uses published pad-group conventions not represented by the demo keyword-only API.',
  m209: 'The historical M-209 record requires explicit wheel pins, lugs, and starting positions; the demo derives all state from one seed.',
  jn25: 'The historical JN-25 record requires the operational codebook and additive tables; the demo maps individual letters to invented groups.',
  geheimschreiber: 'The historical T52 record uses Baudot and actual wheel/permutation settings; the demo is an A-Z seeded structural model.',
  kl7: 'The historical KL-7 record requires real rotor, ring, notch, and re-entry settings; the demo derives illustrative state from one seed.',
  fialka: 'The historical Fialka record uses a 30-character alphabet and real rotor settings; the demo uses a seeded 26-letter model.',
  chaocipher: 'The historical Chaocipher record specifies independent left and right alphabets; the demo derives both from one keyword.',
  wallisCiphers: 'The historical Wallis record uses its original intercepted nomenclator; the demo uses a small reconstructed word list.',
  chineseTelegraph: 'The historical Chinese Telegraph record maps Chinese characters through the standard codebook; the demo maps Latin A-Z to illustrative groups.',
  wheatstone: 'The historical Wheatstone record requires explicit inner/outer disk alphabets and start positions; the demo accepts only a keyword.',
  copiale: 'The historical Copiale record uses manuscript glyphs and the recovered homophonic mapping; the demo uses synthetic letter-digit symbols.',
  kryptos: 'The historical Kryptos record uses sculpture-specific tableau and section conventions beyond the demo keyword-only model.'
};

const KNOWN_DEVIATIONS = [
  {
    id: 'intentional-noise',
    rationale: 'The record is an intentionally corrupted OCR/telegraph transcription, so it cannot reproduce clean encryption or decryption exactly.',
    matches: record => record.transcription_quality === 'noisy'
  },
  ...Object.entries(HISTORICAL_VARIANT_RATIONALES).map(([engineName, rationale]) => ({
    id: `historical-variant-${engineName}`,
    rationale,
    matches: (record, kind, candidateEngine) => record.source_type === 'historical' && candidateEngine === engineName
  }))
];

function engineNameFor(cipherType) {
  return TYPE_MAP[cipherType] || cipherType;
}

function extractKey(record) {
  const key = record.key;
  if (!key || typeof key !== 'object') return String(key ?? '');
  if (record.cipher_type === 'solitaire' && key.type === 'none') return '1';
  if (key.value !== undefined && key.value !== null) {
    const value = String(key.value);
    if (record.cipher_type === 'running_key' && /^Declaration of Independence/i.test(value)) return '';
    if ((record.cipher_type === 'one_time_pad' || record.cipher_type === 'vernam') && /\(repeating\)/i.test(value)) {
      const base = value.replace(/\(repeating\).*/i, '').toUpperCase().replace(/[^A-Z]/g, '');
      const length = String(record.plaintext || '').toUpperCase().replace(/[^A-Z]/g, '').length;
      return base.repeat(Math.ceil(length / base.length)).slice(0, length);
    }
    return value;
  }
  if (key.shift !== undefined) return String(key.shift);
  if (key.a !== undefined && key.c === undefined) return `${key.a},${key.b ?? 0}`;
  if (key.a !== undefined && key.c !== undefined) return `${key.a},${key.b},${key.c},${key.d}`;
  if (key.key1 !== undefined) return `${key.key1},${key.key2}`;
  if (key.polybius !== undefined && key.columnar !== undefined) return `${key.polybius},${key.columnar}`;
  if (key.polybius !== undefined && key.keyword !== undefined) return `${key.polybius},${key.keyword}`;
  if (key.keyword !== undefined) return String(key.keyword);
  if (key.columns !== undefined) return String(key.columns);
  if (key.initial_left !== undefined) return `${key.initial_left},${key.initial_right}`;
  if (key.outer !== undefined) return `${key.outer},${key.inner},${key.index ?? 'A'}`;
  if (key.inner_disk !== undefined) return String(key.inner_disk);
  if (key.key !== undefined) return String(key.key);
  if (key.disks !== undefined) return String(key.disks);
  if (key.phrase !== undefined) return String(key.phrase);
  if (key.rotors !== undefined) return String(key.rotors);
  if (key.passphrase !== undefined) return String(key.passphrase);
  if (key.switch_settings !== undefined) return String(key.switch_settings);
  for (const value of Object.values(key)) {
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return '';
}

function normalizeCase(value, casing) {
  if (casing === 'uppercase') return value.toUpperCase();
  if (casing === 'lowercase') return value.toLowerCase();
  return value;
}

function applyPlaintextPolicy(value, record) {
  let result = normalizeCase(String(value ?? ''), record.casing);
  if (/A-Z/i.test(String(record.alphabet || ''))) {
    // Match the engines' documented A-Z policy: NFD-fold accented letters to
    // their base letter before filtering, so composed/decomposed accents
    // compare identically instead of being silently dropped.
    result = result.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  } else {
    result = result.replace(/[^\p{L}\p{N}]/gu, '');
  }
  if (IJ_MERGED.has(record.cipher_type)) result = result.replace(/J/g, 'I');
  if (record.cipher_type === 'tap_code') result = result.replace(/K/g, 'C');
  if (record.cipher_type === 'babington') result = result.replace(/J/g, 'I').replace(/V/g, 'U');
  return result;
}

function compactCiphertext(value) {
  return String(value ?? '').toUpperCase().replace(/\s+/g, '');
}

function deviationFor(record, kind, engineName) {
  // Deviation rules may only explain encode/decode mismatches. A thrown
  // exception or a missing engine is always an unexplained failure.
  if (kind !== 'encode' && kind !== 'decode') return null;
  return KNOWN_DEVIATIONS.find(rule => rule.matches(record, kind, engineName)) || null;
}

// Exact accounting for a full, unfiltered replay of public/corpus/all.jsonl.
// Every deviation rule is pinned to its exact event count, so an engine
// regression cannot hide inside an engine-wide rule: any new mismatch (or a
// vanished one) changes the count and fails the run. Update these numbers only
// alongside a reviewed engine or corpus change that explains the delta.
const EXPECTED_FULL_RUN = {
  records: 100026,
  passed: 99500,
  knownRecords: 526,
  knownEvents: 1051,
  events: {
    'intentional-noise': 959,
    'historical-variant-navajo': 6,
    'historical-variant-stager': 4,
    'historical-variant-confederateVigenere': 4,
    'historical-variant-zimmermann': 4,
    'historical-variant-vic': 4,
    'historical-variant-culperRing': 4,
    'historical-variant-vigenere': 4,
    'historical-variant-enigma': 4,
    'historical-variant-purple': 4,
    'historical-variant-babington': 4,
    'historical-variant-nullCipher': 4,
    'historical-variant-kryptos': 4,
    'historical-variant-lorenz': 2,
    'historical-variant-bookCipher': 2,
    'historical-variant-alberti': 2,
    'historical-variant-adfgvx': 2,
    'historical-variant-sigaba': 2,
    'historical-variant-jefferson': 2,
    'historical-variant-m94': 2,
    'historical-variant-greatCipher': 2,
    'historical-variant-venonaPadReuse': 2,
    'historical-variant-arnoldAndre': 2,
    'historical-variant-diana': 2,
    'historical-variant-m209': 2,
    'historical-variant-jn25': 2,
    'historical-variant-geheimschreiber': 2,
    'historical-variant-kl7': 2,
    'historical-variant-fialka': 2,
    'historical-variant-chaocipher': 2,
    'historical-variant-wallisCiphers': 2,
    'historical-variant-chineseTelegraph': 2,
    'historical-variant-wheatstone': 2,
    'historical-variant-copiale': 2
  }
};

async function main() {
  const input = fs.createReadStream(corpusPath, { encoding: 'utf8' });
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  const failures = [];
  const failureCounts = new Map();
  const knownCounts = new Map();
  const engineCounts = new Map();
  let records = 0;
  let passed = 0;
  let known = 0;
  let knownRecords = 0;

  function recordFailure(record, engineName, kind, expected, actual) {
    const deviation = deviationFor(record, kind, engineName);
    if (deviation) {
      known++;
      knownCounts.set(deviation.id, (knownCounts.get(deviation.id) || 0) + 1);
      return true;
    }
    failureCounts.set(`${engineName}:${kind}`, (failureCounts.get(`${engineName}:${kind}`) || 0) + 1);
    if (failures.length < 50) {
      failures.push({ id: record.id, engine: engineName, kind, expected, actual });
    }
    return false;
  }

  for await (const line of lines) {
    if (!line.trim()) continue;
    const record = JSON.parse(line);
    const engineName = engineNameFor(record.cipher_type);
    if (engineFilter && engineName !== engineFilter) continue;
    if (records >= limit) break;
    records++;
    const engine = engines[engineName];
    engineCounts.set(engineName, (engineCounts.get(engineName) || 0) + 1);
    if (!engine) {
      recordFailure(record, engineName, 'missing-engine', record.cipher_type, 'missing');
      continue;
    }

    const key = extractKey(record);
    let recordPassed = true;
    let recordKnown = false;
    try {
      const encoded = engine.encode(record.plaintext, key);
      const expectedCiphertext = compactCiphertext(record.ciphertext);
      const actualCiphertext = compactCiphertext(encoded);
      if (actualCiphertext !== expectedCiphertext) {
        recordPassed = false;
        recordKnown = recordFailure(record, engineName, 'encode', expectedCiphertext, actualCiphertext) || recordKnown;
      }

      const decoded = engine.decode(record.ciphertext, key);
      const expectedPlaintext = applyPlaintextPolicy(record.plaintext, record);
      const actualPlaintext = applyPlaintextPolicy(decoded, record);
      if (actualPlaintext !== expectedPlaintext) {
        recordPassed = false;
        recordKnown = recordFailure(record, engineName, 'decode', expectedPlaintext, actualPlaintext) || recordKnown;
      }
    } catch (error) {
      recordPassed = false;
      recordKnown = recordFailure(record, engineName, 'throw', 'no exception', error.message) || recordKnown;
    }
    if (recordPassed) passed++;
    else if (recordKnown) knownRecords++;
  }

  console.log(`Corpus records: ${records.toLocaleString()}`);
  console.log(`Passed records: ${passed.toLocaleString()}`);
  console.log(`Known-deviation records: ${knownRecords.toLocaleString()}`);
  console.log(`Known-deviation mismatch events: ${known.toLocaleString()}`);
  for (const [id, count] of [...knownCounts].sort((left, right) => right[1] - left[1])) {
    const rule = KNOWN_DEVIATIONS.find(candidate => candidate.id === id);
    console.log(`  ${String(count).padStart(6)} ${id}: ${rule.rationale}`);
  }
  console.log(`Unexplained failures: ${[...failureCounts.values()].reduce((sum, count) => sum + count, 0).toLocaleString()}`);
  for (const [key, count] of [...failureCounts].sort((left, right) => right[1] - left[1])) {
    console.log(`  ${String(count).padStart(6)} ${key}`);
  }
  for (const failure of failures) console.log(`  ${JSON.stringify(failure)}`);

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ records, passed, knownRecords, knownEvents: known, events: Object.fromEntries(knownCounts) }));
  }

  if (records === 0 || failureCounts.size > 0) process.exitCode = 1;

  const isFullRun = limit === Infinity && !engineFilter;
  if (isFullRun && EXPECTED_FULL_RUN.events) {
    const drift = [];
    if (records !== EXPECTED_FULL_RUN.records) drift.push(`records ${records} != ${EXPECTED_FULL_RUN.records}`);
    if (passed !== EXPECTED_FULL_RUN.passed) drift.push(`passed ${passed} != ${EXPECTED_FULL_RUN.passed}`);
    if (knownRecords !== EXPECTED_FULL_RUN.knownRecords) drift.push(`known-deviation records ${knownRecords} != ${EXPECTED_FULL_RUN.knownRecords}`);
    if (known !== EXPECTED_FULL_RUN.knownEvents) drift.push(`known-deviation events ${known} != ${EXPECTED_FULL_RUN.knownEvents}`);
    const ruleIds = new Set([...Object.keys(EXPECTED_FULL_RUN.events), ...knownCounts.keys()]);
    for (const id of ruleIds) {
      const expected = EXPECTED_FULL_RUN.events[id] || 0;
      const actual = knownCounts.get(id) || 0;
      if (expected !== actual) drift.push(`rule ${id}: ${actual} events != pinned ${expected}`);
    }
    if (drift.length > 0) {
      console.log('Pinned corpus accounting drifted (a mismatch appeared or vanished inside a deviation rule):');
      for (const line of drift) console.log(`  ${line}`);
      process.exitCode = 1;
    }
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  TYPE_MAP,
  IJ_MERGED,
  FILLER_ESCAPE_ENGINES,
  engineNameFor,
  extractKey,
  applyPlaintextPolicy,
  compactCiphertext
};