# Cipher Corpus Changelog

## v0.5 (2026-07-17)
- **Engine-verified regeneration.** The 2026 engine verification sweep corrected real defects in the museum's cipher engines (Vernam is now true bytewise XOR with hex ciphertext, Lorenz is a 12-wheel ITA2 XOR model, VIC applies checkerboard + chain addition + double transposition, Purple preserves the sixes/twenties partition, and nine engines use reversible X/Q/Z filler escaping). 7,708 records whose ciphertexts were produced by the old engines were regenerated with the corrected engines (`scripts/regenerate-corpus-v05.js`); touched records carry a regeneration note and `dataset_version: 0.5`.
- **Key metadata repaired on 1,292 records** so every record is reproducible from its own metadata: running-key records now store the actual key text instead of the label "Declaration of Independence (opening)"; solitaire records store the explicit CRYPTONOMICON passphrase; one-time-pad/Vernam "(repeating)" stubs are materialized to full-length explicit pads.
- **Historical data corrections:** `hist-caesar-augustus-001` (stored ciphertext was not a uniform shift-1 encoding), `hist-playfair-wheatstone-001` (key metadata said PLAYFAIR; the stored canonical vector uses PLAYFAIR EXAMPLE), `hist-solitaire-cryptonomicon-001` (ciphertext is Schneier's unkeyed sample output 1; key metadata wrongly claimed the CRYPTONOMICON passphrase).
- **Verification status:** 99,500 of 100,026 records now reproduce exactly with the live engines (`npm run test:engines` replays the full dataset with pinned accounting and 0 unexplained failures). The remaining 526 records are the intentionally noisy transcription variants plus historical records whose real keys or codebooks the pedagogical engines cannot represent — each class carries an explicit rationale in `tests/engines/corpus-replay.js`.
- **Metadata reconciled:** `corpus/engine-manifest.json` per-engine record counts and header total now match the canonical `all.jsonl` exactly (100,026); subset-file counts in this README corrected; the unshipped `llm-3shot-eval.jsonl` reference removed.
- Derived exports `all.json` and `all.csv` regenerated from the canonical `all.jsonl`; subset files (`beginner`/`intermediate`/`advanced`/`expert`/`historical`/`multilingual` and expansions) updated in place for touched record ids.

## v0.4 (2026-04-27)
- **historical.jsonl expanded to 101 records** (up from 55) — 46 new entries spanning 4,000 years of cryptographic history, from the Atbash cipher in the Hebrew Bible (c. 600 BCE) through WWII cipher machines and Vietnam-era tap code.
  - New cipher types covered: atbash, scytale, aeneas_tacticus, affine, autokey, bacon, bazeries, beaufort, bifid, cardano, foursquare, fractionated_morse, geez_monastic, gronsfeld, hill, homophonic, joseon_yeokhak, kama_sutra, kryha, monoalphabetic, morse, nihilist, nomenclator, otp, pigpen, porta, rail_fence, red_type_a, rot13, running_key, slidex, straddling_checkerboard, tap_code, trifid, trithemius, twosquare, typex (38 new cipher types in historical coverage, total 78 types covered).
- **multilingual.jsonl expanded to 5,348 records** (up from 3,638) — added Arabic (ar) with 1,710 records using Buckwalter Latin transliteration, bringing the corpus to 10 languages.
- **New analysis tools** added to `scripts/`:
  - `hill-climbing-solver.js` — monoalphabetic cipher solver using quadgram scoring + hill climbing (95% accuracy on 80+ char ciphertexts, 25 restarts)
  - `sa-solver.js` — simulated annealing variant with hill-climbing polish; better on short ciphertexts
  - `build-quadgrams.js` — regenerates English quadgram statistics from corpus plaintext
  - `data/english-quadgrams.json` — 8,877 quadgram log-probability entries from 896K corpus observations

## v0.3 (2026-04-27)
- **100,026 verified records** across 82 cipher types and 84 cipher engines — ~5× scale-up from v0.2.1.
- Difficulty distribution: 15,533 beginner · 26,969 intermediate · 26,381 advanced · 26,966 expert · 3,638 multilingual · 484 noisy · 55 historical.
- All core records pass automated roundtrip verification.

## v0.2.1 (2026-04-27)
- **17,425 verified records** across 81 cipher types and 84 cipher engines — full-scale comprehensive generation.
- Added all Cipher Museum engines: Caesar through SIGABA, Lorenz, Fialka, KL-7, Geheimschreiber, Solitaire, Navajo, Venona, Chinese Telegraph, Zimmermann, Culper Ring, Wallis Ciphers, Joseon Yeokhak, Geez Monastic, Diana, and 50+ more.
- All records pass automated roundtrip verification.
- 70/30 public/blind split assigned at generation time.
- Engine manifest updated in `corpus/engine-manifest.json`.

## v0.2
- Major dataset expansion: added Playfair, Hill, Polybius, Bacon, Rail Fence, and multilingual (Spanish, French, Russian, German) records.
- Added noisy ciphertext records simulating OCR errors and typos (English, French).
- Added modern cipher baselines (AES, DES, RSA) for educational contrast.
- Updated beginner/intermediate/advanced/expert splits.

## v0.1
- Initial synthetic benchmark release.
- Includes Caesar, ROT13, Atbash, Affine, Vigenère, Playfair, substitution, and transposition examples.
