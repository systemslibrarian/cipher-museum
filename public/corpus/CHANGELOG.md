# Cipher Corpus Changelog

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
