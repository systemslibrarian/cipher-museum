#!/usr/bin/env node
/**
 * generate-noisy-corpus.js
 * Generates noisy transcription variants simulating OCR errors, historical spelling,
 * and telegraph transmission errors. Run: node scripts/generate-noisy-corpus.js
 */
/* eslint-disable no-console */
global.window = {};
const path = require('path');
require(path.join(__dirname, '../js/ciphers/all-engines.js'));
const CE = global.window.CipherEngines;
if (!CE) { console.error('Failed to load CipherEngines'); process.exit(1); }

const fs = require('fs');
const OUT_DIR = path.join(__dirname, '../public/corpus');
const TODAY = '2026-04-27';
const CORPUS_URL = 'https://ciphermuseum.com/cipher-corpus.html';

const cleanFn = t => String(t).toUpperCase().replace(/[^A-Z]/g, '');

const idCounters = {};
function nextId(prefix) {
  idCounters[prefix] = (idCounters[prefix] || 0) + 1;
  return `${prefix}-${String(idCounters[prefix]).padStart(3, '0')}`;
}

// ─── Noise Functions ───

// OCR-style substitution errors (visually similar characters)
const OCR_SUBSTITUTIONS = [
  ['O', '0'], ['0', 'O'], ['I', '1'], ['1', 'I'], ['L', '1'],
  ['B', '8'], ['G', '6'], ['S', '5'], ['Z', '2'], ['U', 'V'],
  ['V', 'U'], ['N', 'M'], ['M', 'N'], ['C', 'G'], ['D', 'O'],
  ['P', 'F'], ['E', 'F'], ['T', 'I'], ['H', 'K'], ['Q', 'O'],
];

// Historical spelling variants
const HISTORICAL_SPELLINGS = {
  'THE': ['THE', 'YE', 'THY'],
  'THAT': ['THAT', 'THET', 'YAT'],
  'AND': ['AND', 'AN', '&'],
  'WITH': ['WITH', 'WYTH', 'WÎTH'],
  'YOU': ['YOU', 'YE', 'YOW'],
  'HAVE': ['HAVE', 'HAUE', 'HAV'],
  'WHICH': ['WHICH', 'WHICHE', 'WHYCH'],
  'UPON': ['UPON', 'VPON', 'UPPON'],
  'THEIR': ['THEIR', 'THEIR', 'THEYR'],
  'SAID': ['SAID', 'SAYD', 'SEYD'],
};

// Telegraph/radio transmission noise (character dropout/swap)
function addTelegraphNoise(text, rate = 0.04) {
  const chars = text.split('');
  for (let i = 0; i < chars.length; i++) {
    if (Math.random() < rate) {
      const roll = Math.random();
      if (roll < 0.4) {
        // Character swap (adjacent transpose)
        if (i + 1 < chars.length) {
          [chars[i], chars[i+1]] = [chars[i+1], chars[i]];
        }
      } else if (roll < 0.7) {
        // Character substitution (nearby on keyboard or similar shape)
        const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        chars[i] = alpha[Math.floor(Math.random() * 26)];
      } else {
        // Character dropout (space or null)
        chars[i] = ' ';
      }
    }
  }
  return chars.join('').replace(/  +/g, ' ').trim();
}

// OCR-style errors in ciphertext
function addOcrNoise(text, rate = 0.05) {
  let result = text;
  for (const [from, to] of OCR_SUBSTITUTIONS) {
    if (Math.random() < rate) {
      // Apply at most one substitution per pair
      const idx = result.indexOf(from);
      if (idx >= 0) {
        result = result.slice(0, idx) + to + result.slice(idx + from.length);
      }
    }
  }
  return result;
}

// Historical spelling errors in plaintext
function addHistoricalSpelling(text) {
  let result = text;
  for (const [word, variants] of Object.entries(HISTORICAL_SPELLINGS)) {
    if (result.includes(word) && Math.random() < 0.4) {
      const variant = variants[Math.floor(Math.random() * variants.length)];
      result = result.replace(new RegExp(`\\b${word}\\b`), variant);
    }
  }
  return result;
}

// Clean for length calculations
function alphaLen(t) { return t.replace(/[^A-Z]/gi, '').length; }

// ─── Base plaintexts for noisy records ───
const BASE_PLAINTEXTS = [
  'ATTACK AT DAWN THE ENEMY WILL NOT EXPECT IT',
  'SEND REINFORCEMENTS WE ARE GOING TO ADVANCE',
  'THE EAGLE HAS LANDED PROCEED TO RENDEZVOUS',
  'ALL UNITS HOLD YOUR POSITION UNDER FIRE',
  'WE HOLD THESE TRUTHS TO BE SELF EVIDENT THAT ALL MEN ARE CREATED EQUAL',
  'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG',
  'ENIGMA MACHINES WERE BROKEN BY CODEBREAKERS AT BLETCHLEY PARK',
  'VIGENERE CIPHER WAS KNOWN AS THE UNBREAKABLE CIPHER FOR THREE CENTURIES',
  'FREQUENCY ANALYSIS REVEALS THE MOST COMMON LETTERS IN ANY CIPHERTEXT',
  'THE BABINGTON PLOT WAS FOILED WHEN QUEEN ELIZABETHS SPYMASTERS DECODED THE LETTERS',
  'MARY QUEEN OF SCOTS USED CIPHERS TO PLAN HER ESCAPE FROM CAPTIVITY',
  'THE ZIMMERMANN TELEGRAM CHANGED THE COURSE OF THE FIRST WORLD WAR',
  'BLETCHLEY PARK CODEBREAKERS SHORTENED THE WAR BY PERHAPS TWO YEARS',
  'THE NAVAJO CODE TALKERS PROVIDED AN UNBREAKABLE COMMUNICATION SYSTEM IN THE PACIFIC',
  'CAESAR CIPHER IS NAMED AFTER JULIUS CAESAR WHO USED IT FOR MILITARY CORRESPONDENCE',
  'POLYALPHABETIC CIPHERS WERE BELIEVED TO BE UNBREAKABLE UNTIL CHARLES BABBAGE PROVED OTHERWISE',
  'THE INDEX OF COINCIDENCE MEASURES THE PROBABILITY THAT TWO RANDOMLY CHOSEN LETTERS ARE EQUAL',
  'KASISKI EXAMINATION LOOKS FOR REPEATED SEQUENCES IN THE CIPHERTEXT TO FIND THE KEY LENGTH',
  'ONE TIME PAD IS THE ONLY CIPHER THAT IS PROVABLY SECURE IF USED CORRECTLY',
  'THE ENIGMA MACHINE USED ROTORS TO CREATE A COMPLEX POLYALPHABETIC SUBSTITUTION',
  'ALAN TURING DESIGNED THE BOMBE WHICH AUTOMATED THE SEARCH FOR ENIGMA KEYS',
  'THE VIC CIPHER WAS USED BY SOVIET AGENT RUDOLPH ABEL AND RESISTED ANALYSIS FOR YEARS',
  'TRANSPOSITION CIPHERS REARRANGE THE LETTERS WITHOUT CHANGING THEM',
  'THE PLAYFAIR CIPHER OPERATES ON PAIRS OF LETTERS CALLED DIGRAPHS',
  'BIFID CIPHER COMBINES A POLYBIUS SQUARE WITH FRACTIONATION FOR ADDED SECURITY',
];

// Noise profiles
const NOISE_PROFILES = [
  {
    name: 'ocr_light',
    label: 'OCR Scan (Light)',
    description: 'Light OCR errors: occasional character misread (O/0, I/1, B/8)',
    applyNoise: (ct) => addOcrNoise(ct, 0.03),
    source: 'Simulated OCR scan of printed ciphertext (light degradation)',
  },
  {
    name: 'ocr_heavy',
    label: 'OCR Scan (Heavy)',
    description: 'Heavy OCR errors: frequent character misread from low-quality scan',
    applyNoise: (ct) => addOcrNoise(ct, 0.08),
    source: 'Simulated OCR scan of printed ciphertext (heavy degradation)',
  },
  {
    name: 'telegraph',
    label: 'Telegraph Transmission',
    description: 'Telegraph noise: character transpositions and substitutions from electrical interference',
    applyNoise: (ct) => addTelegraphNoise(ct, 0.05),
    source: 'Simulated telegraph transmission with 5% noise rate',
  },
  {
    name: 'historical_spelling',
    label: 'Historical Spelling',
    description: 'Historical spelling variants in plaintext (ye/the, vpon/upon, etc.)',
    applyNoise: (ct) => ct, // applied to plaintext, not ciphertext
    applyPlainNoise: (pt) => addHistoricalSpelling(pt),
    source: 'Historical spelling variants (16th-18th century English)',
  },
];

// Cipher engines to use for noisy records
const NOISY_ENGINE_CONFIGS = [
  {
    engName: 'caesar', type: 'caesar', family: 'substitution', diff: 'beginner',
    attacks: ['frequency analysis (noisy)', 'brute force', 'error correction'],
    tags: ['noisy', 'ocr', 'caesar', 'historical-variant'],
    variants: [['3', { type: 'shift', value: 3 }], ['13', { type: 'shift', value: 13 }]],
  },
  {
    engName: 'vigenere', type: 'vigenere', family: 'polyalphabetic', diff: 'intermediate',
    attacks: ['Kasiski examination (noisy)', 'error-tolerant frequency analysis'],
    tags: ['noisy', 'vigenere', 'historical-variant'],
    variants: [['CIPHER', { type: 'keyword', value: 'CIPHER' }], ['SECRET', { type: 'keyword', value: 'SECRET' }]],
  },
  {
    engName: 'monoalphabetic', type: 'monoalphabetic', family: 'substitution', diff: 'beginner',
    attacks: ['frequency analysis (noisy)', 'digraph analysis'],
    tags: ['noisy', 'monoalphabetic', 'historical-variant'],
    variants: [['KRYPTOS', { type: 'keyword', value: 'KRYPTOS' }], ['MUSEUM', { type: 'keyword', value: 'MUSEUM' }]],
  },
  {
    engName: 'playfair', type: 'playfair', family: 'substitution', diff: 'intermediate',
    attacks: ['bigram frequency analysis (noisy)', 'probable word attack'],
    tags: ['noisy', 'playfair', 'historical-variant'],
    variants: [['KEYWORD', { type: 'keyword', value: 'KEYWORD' }]],
  },
  {
    engName: 'columnar', type: 'columnar_transposition', family: 'transposition', diff: 'intermediate',
    attacks: ['multiple anagramming (noisy)', 'probable word'],
    tags: ['noisy', 'columnar', 'telegraph'],
    variants: [['CIPHER', { type: 'keyword', value: 'CIPHER' }], ['ZEBRA', { type: 'keyword', value: 'ZEBRA' }]],
  },
];

const records = [];

for (const plain of BASE_PLAINTEXTS) {
  for (const eng_cfg of NOISY_ENGINE_CONFIGS) {
    const eng = CE[eng_cfg.engName];
    if (!eng || !eng.encode) continue;

    for (const [keyStr, keyObj] of eng_cfg.variants) {
      // Generate clean ciphertext first
      let ct;
      try { ct = eng.encode(plain.toUpperCase(), keyStr); } catch { continue; }
      if (!ct || ct === '' || /\?|Key required|not invertible/i.test(ct)) continue;

      for (const profile of NOISE_PROFILES) {
        let noisyPlain = plain.toUpperCase();
        let noisyCt = ct;

        if (profile.applyPlainNoise) {
          noisyPlain = profile.applyPlainNoise(noisyPlain);
        }
        noisyCt = profile.applyNoise(ct);

        // Don't include if noise made no change
        if (noisyCt === ct && noisyPlain === plain.toUpperCase()) continue;

        const hasSpaces = /[ \n\t]/.test(noisyCt);
        const hasPunct = /[^A-Z0-9 \n\t]/i.test(noisyCt);
        const normLen = cleanFn(noisyCt).length;

        const record = {
          id: nextId(`noisy-${eng_cfg.type}-${profile.name}`),
          title: `${eng_cfg.type.replace(/_/g, ' ')} — ${profile.label} Variant`,
          cipher_family: eng_cfg.family,
          cipher_type: eng_cfg.type,
          plaintext: noisyPlain,
          ciphertext: noisyCt,
          key: keyObj,
          original_ciphertext: ct,
          language: 'en',
          alphabet: 'A-Z',
          text_length: noisyCt.length,
          normalized_text_length: normLen,
          spacing: hasSpaces ? 'preserved' : 'removed',
          punctuation: hasPunct ? 'mixed' : 'removed',
          casing: /[a-z]/.test(noisyCt) ? 'mixed' : 'uppercase',
          difficulty: eng_cfg.diff,
          source_type: 'synthetic',
          source: `Generated by Cipher Museum — ${profile.source}`,
          license: 'CC0',
          notes: `Noisy variant: ${profile.description}. Original clean ciphertext also available in record.`,
          expected_attacks: eng_cfg.attacks,
          tags: [...eng_cfg.tags, 'noisy', profile.name],
          created_by: 'Cipher Museum',
          verified: false,
          dataset_version: '0.2',
          split: Math.random() < 0.7 ? 'public' : 'blind',
          transcription_quality: 'noisy',
          source_provenance: {
            url: CORPUS_URL,
            archive: 'Cipher Museum Synthetic Corpus — Noisy Transcription Extension',
            publication_date: TODAY,
            license: 'CC0'
          }
        };
        records.push(record);
      }
    }
  }
}

const outPath = path.join(OUT_DIR, 'noisy.jsonl');
fs.writeFileSync(outPath, records.map(r => JSON.stringify(r)).join('\n') + '\n');
const allPath = path.join(OUT_DIR, 'all.jsonl');
fs.appendFileSync(allPath, records.map(r => JSON.stringify(r)).join('\n') + '\n');

console.log(`Generated ${records.length} noisy records → ${outPath}`);
console.log(`Profiles: ${NOISE_PROFILES.map(p => p.name + ':' + records.filter(r => r.tags.includes(p.name)).length).join(', ')}`);
