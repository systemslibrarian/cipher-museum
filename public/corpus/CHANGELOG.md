# Cipher Corpus Changelog



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
