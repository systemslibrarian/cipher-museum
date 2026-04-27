# Cipher Corpus — Generation Guide

How to expand the corpus to any target size. Written for future researchers who want to take this to a million records, or beyond.

## Architecture Overview

The corpus is built in **generation batches**, each producing a self-contained set of non-overlapping records. Every batch:

1. Defines a unique plaintext pool (texts not used in prior batches)
2. Defines cipher configurations with key variants
3. Runs every `(plaintext, key, cipher)` triple through roundtrip verification
4. Appends passing records to the existing corpus files

This means you can run batches indefinitely and the corpus grows monotonically with no duplicates.

## Files

| File | Purpose |
|------|---------|
| `scripts/generate-full-corpus.js` | Batch 1 — original 21,602 records (v1 plaintexts + v1 keys) |
| `scripts/generate-corpus-v2.js` | Batch 2 — +41,730 records (v2 plaintexts + v2 keys) |
| `scripts/generate-corpus-v3.js` | Batch 3 — +~36,000 records (v3 plaintexts + v2 keys) |
| `scripts/generate-benchmark-report.js` | Regenerates `public/reports/benchmark-baselines.*` |
| `corpus/engine-manifest.json` | Per-engine record counts; updated by each batch script |
| `corpus/plaintexts.json` | Legacy seed file (10 plaintexts); superceded by inline arrays |

## Running a Batch

```bash
# From the repo root
node scripts/generate-corpus-v2.js
node scripts/generate-corpus-v3.js

# After any batch, regenerate the benchmark report
node scripts/generate-benchmark-report.js

# Run the test suite to verify nothing broke
npm test
```

Each script appends to:
- `public/corpus/all.jsonl` — complete corpus
- `public/corpus/{beginner,intermediate,advanced,expert}.jsonl` — difficulty splits
- `public/corpus/all.json` — JSON array (for API consumers)
- `public/corpus/all.csv` — CSV export

## How to Add a New Batch (Batch 4, 5, …)

Copy `scripts/generate-corpus-v3.js` to `scripts/generate-corpus-v4.js` and make these changes:

### 1. Change the ID prefix

```javascript
// In the nextId() function, change 'v3' to 'v4'
return `${k}-v4-${String(idCounters[k]).padStart(4, '0')}`;
```

### 2. Add a fresh plaintext pool

Write 80–150 texts that have **never appeared in any prior batch**. Organize by length:

```javascript
const SHORT_V4 = [
  // 15–45 character texts
  'YOUR NEW SHORT TEXT HERE',
  // ...
];

const MEDIUM_V4 = [
  // 45–120 character texts
  'YOUR MEDIUM LENGTH TEXT WITH MORE WORDS AND CONTENT FOR ANALYSIS',
  // ...
];

const LONG_V4 = [
  // 120–300 character texts (good for advanced/expert ciphers)
  // ...
];

const ALL_V4 = [...SHORT_V4, ...MEDIUM_V4, ...LONG_V4];
const SHORT_MED_V4 = [...SHORT_V4, ...MEDIUM_V4];
```

**Where to find plaintexts:**
- Public domain literary works (Project Gutenberg — anything before 1928 is safe)
- US government documents (always public domain)
- KJV Bible (published 1611, fully public domain)
- Historical military dispatches and diplomatic cables
- Classical philosophy translations (Plato, Aristotle, Cicero)
- Scientific papers from the 19th century and earlier

**Format rules:**
- All uppercase A-Z only (no punctuation, no digits in the text itself)
- Strip accents and diacritics (use `toUpperCase()` and remove non-A-Z)
- Aim for variety in length: short (good for Bacon, tapCode, null cipher), medium (good for most ciphers), long (good for machine ciphers and polyalphabetics)

### 3. Optionally add new key variants

To add coverage for new configurations, extend the `variants` array in any cipher config:

```javascript
{ engName: 'vigenere', ...,
  variants: [
    // existing keys from prior batches ...
    ['NEWKEYWORD', { type: 'keyword', value: 'NEWKEYWORD' }],
  ]
}
```

Key uniqueness: records are unique by `(cipher_type, plaintext, key)` — since you're using a fresh plaintext pool, reusing key variants is fine.

### 4. Run and verify

```bash
node scripts/generate-corpus-v4.js
node scripts/generate-benchmark-report.js
npm test
```

## Scale Estimates

Historical throughput per batch:

| Batch | Plaintexts | Avg variants/cipher | New records | Run time |
|-------|-----------|---------------------|-------------|----------|
| v1    | ~60       | 7                   | 21,602      | ~30 sec  |
| v2    | 126       | 12                  | 41,730      | ~60 sec  |
| v3    | 100       | 10                  | ~33,000     | ~50 sec  |

Rule of thumb: **~3.3 records per (plaintext × variant × cipher)** after roundtrip filtering.

To reach 1,000,000 records:
- Need ~900,000 more (from ~100,000 current)
- At 40,000 per batch: ~22 more batch scripts
- Total unique plaintexts needed: ~22 × 100 = ~2,200

This is very achievable — Project Gutenberg alone has millions of pages of public domain text.

## Roundtrip Verification

Every record in the corpus passes this check before inclusion:

```javascript
function testRoundtrip(eng, plain, key) {
  const ct = eng.encode(plain, key);
  const dt = eng.decode(ct, key);
  const cp = cleanFn(plain);   // normalize to A-Z uppercase
  const dcp = cleanFn(dt);
  return dcp === cp || dcp.startsWith(cp);  // exact match or prefix (for padded ciphers)
}
```

**Pass rate by cipher category:**
- Simple substitution (caesar, affine, rot13): ~100%
- Polyalphabetic (vigenere, beaufort): ~100%
- Polygraphic (playfair, hill): ~95% (some fail due to key constraints)
- Fractionation (bifid, trifid, ADFGX): ~85%
- Machine ciphers (enigma, lorenz, sigaba): ~75-90%
- Codebook ciphers (bookCipher, culperRing, navajo): ~30-50% (sparse outputs)

## Schema

All records conform to `public/corpus/cipher-corpus.schema.json` (v0.2 schema). Required fields:

```
id, title, cipher_family, cipher_type, plaintext, ciphertext, key,
language, alphabet, text_length, normalized_text_length, spacing,
punctuation, casing, difficulty, source_type, source, license,
expected_attacks, tags, created_by, verified, dataset_version,
split, transcription_quality, source_provenance
```

Batch 1 records use `dataset_version: "0.2"`.
Batches 2 and 3 use `dataset_version: "2.0"`.
Future batches should use `"2.0"` or a new version if the schema changes.

## 70/30 Public/Blind Split

Records are assigned to splits at generation time:

```javascript
split: Math.random() < 0.7 ? 'public' : 'blind'
```

This is probabilistic — the actual ratio is approximately 70/30 but not exact. For rigorous benchmarking, use only the `split: "public"` records for training/development and hold out `split: "blind"` records for final evaluation.

See `docs/blind-split-policy.md` for governance details.

## Adding New Cipher Engines

To add a cipher engine not currently in the corpus:

1. Verify the engine exists in `js/ciphers/all-engines.js` and passes roundtrip:
   ```bash
   node -e "
   global.window = {};
   require('./js/ciphers/all-engines.js');
   const eng = global.window.CipherEngines.yourEngine;
   const ct = eng.encode('HELLO WORLD', 'KEY');
   const dt = eng.decode(ct, 'KEY');
   console.log(ct, dt);
   "
   ```
2. Add a config entry to the CONFIGS array in any batch script
3. Run the batch and verify records appear in the output

## Maintenance

After any generation run that changes record counts, update:
- `README.md` — the "21,602+" figure in the Cipher Corpus section
- `cipher-corpus.html` — hero stats and badge counts
- `public/reports/benchmark-baselines.*` — run `node scripts/generate-benchmark-report.js`
- `public/corpus/browser-sample.json` — regenerate if you want fresh samples in the browser UI:
  ```bash
  node -e "
  const fs = require('fs');
  const all = fs.readFileSync('public/corpus/all.jsonl','utf8')
    .split('\n').filter(l=>l.trim()).map(l=>JSON.parse(l));
  const diffs = ['beginner','intermediate','advanced','expert'];
  const sample = diffs.flatMap(d => {
    const recs = all.filter(r=>r.difficulty===d);
    return recs.filter((_,i)=>i%Math.floor(recs.length/25)<1).slice(0,25);
  });
  fs.writeFileSync('public/corpus/browser-sample.json', JSON.stringify(sample, null, 2));
  console.log('Sample:', sample.length, 'records');
  "
  ```

## Citation

If you use or extend this corpus in research:

```bibtex
@misc{ciphermuseum2026,
  title        = {Cipher Museum Corpus: 100,000+ Classical Cryptanalysis Test Cases},
  author       = {Lester, Paul},
  year         = {2026},
  howpublished = {\url{https://ciphermuseum.com/cipher-corpus.html}},
  note         = {CC0 1.0 Universal}
}
```
