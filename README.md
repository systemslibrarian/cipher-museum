# 🏛️ The Cipher Museum

> *"The heart of the discerning acquires knowledge, for the ears of the wise seek it out."* — Proverbs 18:15

> *"So whether you eat or drink or whatever you do, do it all for the glory of God."* — 1 Corinthians 10:31 (NIV)

Exploring 3,900+ years of encryption, cryptanalysis, and hidden history.

The Cipher Museum is part digital exhibit, part cipher playground, and part codebreaking classroom exploring **3,900+ years** of encryption, cryptanalysis, and hidden history across **140 exhibits** and **13 exhibit halls**. 110 of the 140 exhibits ship a fully interactive encrypt/decrypt demo or hand-built widget — the remaining 30 are codebreaker biographies and historical context pages. Modern cryptography uses more than ciphers — secure systems combine key exchange, encryption, and hashing.

**[Live Site →](https://ciphermuseum.com)**

---

## 📰 Latest Update

- **Cipher Corpus v0.4** ([cipher-corpus.html](https://ciphermuseum.com/cipher-corpus.html)): Expanded corpus with three research-grade additions:
  - **Historical records: 55 → 101** — 46 new verified records spanning 4,000 years of cryptographic history (Atbash in the Hebrew Bible c. 600 BCE through Vietnam-era tap code 1965). Now covers 78 distinct cipher types with primary-source citations and `historical_context` narratives. New cipher types: atbash, scytale, Aeneas Tacticus, affine, autokey, Bacon bilateral, Bazeries, Beaufort, bifid, trifid, foursquare, Cardano, fractionated Morse, hill, kryha, Nihilist, pigpen, Porta, rail fence, Red Type A, ROT13, running key, Slidex, straddling checkerboard, tap code, Trithemius, TypeX, Vernam OTP, and more.
  - **Arabic multilingual: 1,710 new records** — Arabic (ar) added using Buckwalter Latin transliteration across 12 cipher types. Corpus now covers **10 languages** (en, fr, de, la, es, it, ar, ja, ru, zh), **5,348 total multilingual records** (up from 3,638).
  - **Cryptanalysis solver scripts** — `scripts/hill-climbing-solver.js` (monoalphabetic cipher solver using quadgram scoring + hill climbing, 95% accuracy on 80+ char ciphertexts) and `scripts/sa-solver.js` (simulated annealing variant with HC polish, better on short ciphertexts, `--compare` benchmarking mode). Backed by `scripts/data/english-quadgrams.json` (8,877 quadgrams computed from corpus plaintext).
- **Exhibit 140 — Bible Code / ELS** ([ciphers/bible-code.html](https://ciphermuseum.com/ciphers/bible-code.html)): Interactive equidistant letter sequence explorer comparing Genesis/Exodus against length-matched random text with the same letter distribution. Registered in Hall VIII and the museum map.
- **Lorenz depth-attack interactive** ([ciphers/lorenz.html](https://ciphermuseum.com/ciphers/lorenz.html)): Two-time-pad crib-drag demo and Enigma↔Lorenz comparison table added to the existing Lorenz exhibit.
- **Full test audit** — resolved 12 pre-existing test failures (enigma.html `data-cipher` attribute, bible-code artifact card, heading hierarchy); all eight suites green at 443 + 238 + 1848 + 1760 + 531 + 1773 + 789 + 4945 assertions.
- **Sitemap expanded** to all 176 indexable pages (tools, tours, community, all biographies, and the new exhibit).
- **README factual audit**: corrected interactive-demo count (110/140), page counts (176), and test assertion totals site-wide.
- April 2026: Cipher Museum listed in Crypto Museum's (cryptomuseum.com) curated Virtual Museums directory, alongside Cipher History Museum, Jerry Proc's Crypto Pages, and other established crypto-history archives.

---

## ✨ Features

### 🗺️ Thirteen Exhibit Halls · 140 Exhibits

| Hall | Title | Ciphers |
|------|-------|---------|
| [I](https://ciphermuseum.com/halls/ancient.html) | World Origins of Cryptography | [Egyptian Substitution](https://ciphermuseum.com/ciphers/egyptian-substitution.html), [Rosetta Stone](https://ciphermuseum.com/ciphers/rosetta-stone.html), [Histiaeus's Tattoo](https://ciphermuseum.com/ciphers/histiaeus-tattoo.html), [Scytale](https://ciphermuseum.com/ciphers/scytale.html), [Aeneas Tacticus](https://ciphermuseum.com/ciphers/aeneas-tacticus.html), [Caesar](https://ciphermuseum.com/ciphers/caesar.html), [Atbash](https://ciphermuseum.com/ciphers/atbash.html), [Kama Sutra](https://ciphermuseum.com/ciphers/kama-sutra.html), [Polybius](https://ciphermuseum.com/ciphers/polybius.html), [Arabic Nomenclators](https://ciphermuseum.com/ciphers/arabic-nomenclators.html), [ROT13](https://ciphermuseum.com/ciphers/rot13.html) |
| [II](https://ciphermuseum.com/halls/substitution.html) | Classical Substitution | [Monoalphabetic](https://ciphermuseum.com/ciphers/monoalphabetic.html), [Nomenclator](https://ciphermuseum.com/ciphers/nomenclator.html), [Babington](https://ciphermuseum.com/ciphers/babington.html), [Homophonic](https://ciphermuseum.com/ciphers/homophonic.html), [Great Cipher](https://ciphermuseum.com/ciphers/great-cipher.html), [Playfair](https://ciphermuseum.com/ciphers/playfair.html), [Four-Square](https://ciphermuseum.com/ciphers/four-square.html), [Two-Square](https://ciphermuseum.com/ciphers/two-square.html), [Hill](https://ciphermuseum.com/ciphers/hill.html) |
| [III](https://ciphermuseum.com/halls/polyalphabetic.html) | Polyalphabetic Revolution | [Alberti Disk](https://ciphermuseum.com/ciphers/alberti-disk.html), [Vigenère](https://ciphermuseum.com/ciphers/vigenere.html), [Porta](https://ciphermuseum.com/ciphers/porta.html), [Gronsfeld](https://ciphermuseum.com/ciphers/gronsfeld.html), [Beaufort](https://ciphermuseum.com/ciphers/beaufort.html), [Running Key](https://ciphermuseum.com/ciphers/running-key.html), [Autokey](https://ciphermuseum.com/ciphers/autokey.html) |
| [IV](https://ciphermuseum.com/halls/transposition.html) | Transposition & Fractionation | [Rail Fence](https://ciphermuseum.com/ciphers/rail-fence.html), [Columnar](https://ciphermuseum.com/ciphers/columnar.html), [Double Transposition](https://ciphermuseum.com/ciphers/double-transposition.html), [Bifid](https://ciphermuseum.com/ciphers/bifid.html), [Trifid](https://ciphermuseum.com/ciphers/trifid.html), [ADFGX](https://ciphermuseum.com/ciphers/adfgx.html), [ADFGVX](https://ciphermuseum.com/ciphers/adfgvx.html), [Fractionated Morse](https://ciphermuseum.com/ciphers/fractionated-morse.html) |
| [V](https://ciphermuseum.com/halls/military.html) | Military & Spy Ciphers | [Nihilist](https://ciphermuseum.com/ciphers/nihilist.html), [Bazeries](https://ciphermuseum.com/ciphers/bazeries.html), [VIC](https://ciphermuseum.com/ciphers/vic.html), [Straddling Checkerboard](https://ciphermuseum.com/ciphers/straddling-checkerboard.html), [Book Cipher](https://ciphermuseum.com/ciphers/book-cipher.html) |
| [VI](https://ciphermuseum.com/halls/civil-war.html) | Civil War Gallery | [Stager](https://ciphermuseum.com/ciphers/stager.html), [Confederate Vigenère](https://ciphermuseum.com/ciphers/confederate-vigenere.html), [Dictionary Code](https://ciphermuseum.com/ciphers/dictionary-code.html) |
| [VII](https://ciphermuseum.com/halls/machines.html) | Mechanical Cipher Machines | [Jefferson Disk](https://ciphermuseum.com/ciphers/jefferson-disk.html), [Chaocipher](https://ciphermuseum.com/ciphers/chaocipher.html), [Enigma](https://ciphermuseum.com/ciphers/enigma.html), [M-209](https://ciphermuseum.com/ciphers/m209.html), [Lorenz](https://ciphermuseum.com/ciphers/lorenz.html), [Purple](https://ciphermuseum.com/ciphers/purple.html), [SIGABA](https://ciphermuseum.com/ciphers/sigaba.html), [Typex](https://ciphermuseum.com/ciphers/typex.html), [Navajo Code Talkers](https://ciphermuseum.com/ciphers/navajo-code-talkers.html) |
| [VIII](https://ciphermuseum.com/halls/puzzle.html) | Puzzle & Novelty Ciphers | [Pigpen](https://ciphermuseum.com/ciphers/pigpen.html), [Bacon](https://ciphermuseum.com/ciphers/bacon.html), [Tap Code](https://ciphermuseum.com/ciphers/tap-code.html), [Copiale](https://ciphermuseum.com/ciphers/copiale.html), [Beale](https://ciphermuseum.com/ciphers/beale.html), [Voynich](https://ciphermuseum.com/ciphers/voynich.html), [Dorabella](https://ciphermuseum.com/ciphers/dorabella.html), [Zodiac](https://ciphermuseum.com/ciphers/zodiac.html), [Kryptos](https://ciphermuseum.com/ciphers/kryptos.html) |
| [IX](https://ciphermuseum.com/halls/unbreakable.html) | The Unbreakable | [One-Time Pad](https://ciphermuseum.com/ciphers/one-time-pad.html), [Vernam](https://ciphermuseum.com/ciphers/vernam.html), [VENONA](https://ciphermuseum.com/ciphers/venona.html), [Solitaire / Pontifex](https://ciphermuseum.com/ciphers/solitaire.html) |
| [X](https://ciphermuseum.com/halls/codebreakers.html) | Hall of Codebreakers | [Cabinet Noir](https://ciphermuseum.com/ciphers/cabinet-noir.html), [Station HYPO](https://ciphermuseum.com/ciphers/station-hypo.html), [Bletchley Park](https://ciphermuseum.com/ciphers/bletchley-park.html), [Joseph Rochefort](https://ciphermuseum.com/ciphers/rochefort.html), [Arne Beurling](https://ciphermuseum.com/ciphers/beurling.html), [Dilly Knox](https://ciphermuseum.com/ciphers/dilly-knox.html), [Herbert Yardley](https://ciphermuseum.com/ciphers/yardley.html), [Mavis Batey](https://ciphermuseum.com/ciphers/mavis-batey.html), [GCHQ Trio](https://ciphermuseum.com/ciphers/gchq-trio.html), [David Kahn](https://ciphermuseum.com/ciphers/kahn.html), [Elonka Dunin](https://ciphermuseum.com/ciphers/dunin.html), [George Lasry](https://ciphermuseum.com/ciphers/lasry.html), [Agnes Driscoll](https://ciphermuseum.com/ciphers/agnes-driscoll.html), [Bill Tutte](https://ciphermuseum.com/ciphers/bill-tutte.html), [Elizebeth Friedman](https://ciphermuseum.com/ciphers/elizebeth-friedman.html), [Joan Clarke](https://ciphermuseum.com/ciphers/joan-clarke.html), [Leo Marks](https://ciphermuseum.com/ciphers/leo-marks.html), [Mary Stuart Castelnau Letters](https://ciphermuseum.com/ciphers/mary-stuart-castelnau-letters.html) |
| [XI](https://ciphermuseum.com/halls/modern-crypto.html) | Modern Cryptography | [DES](https://ciphermuseum.com/ciphers/des.html), [Diffie-Hellman](https://ciphermuseum.com/ciphers/diffie-hellman.html), [RSA](https://ciphermuseum.com/ciphers/rsa.html), [AES](https://ciphermuseum.com/ciphers/aes.html), [SHA-256](https://ciphermuseum.com/ciphers/sha256.html) |
| [XII](https://ciphermuseum.com/halls/unsolved.html) | Unsolved Ciphers | [Voynich](https://ciphermuseum.com/ciphers/voynich.html), [Kryptos](https://ciphermuseum.com/ciphers/kryptos.html), [Beale](https://ciphermuseum.com/ciphers/beale.html), [Dorabella](https://ciphermuseum.com/ciphers/dorabella.html), [Zodiac Z-13/Z-32](https://ciphermuseum.com/ciphers/zodiac.html), [Phaistos Disc](https://ciphermuseum.com/ciphers/phaistos-disc.html), [Shugborough](https://ciphermuseum.com/ciphers/shugborough.html), [D'Agapeyeff](https://ciphermuseum.com/ciphers/dagapeyeff.html), [Somerton Man](https://ciphermuseum.com/ciphers/somerton-man.html), [McCormick](https://ciphermuseum.com/ciphers/mccormick.html) |
| [XIII](https://ciphermuseum.com/halls/culture.html) | Cipher Culture | [Bach's BACH motif](https://ciphermuseum.com/ciphers/bach-motif.html), [Conan Doyle's Dancing Men](https://ciphermuseum.com/ciphers/dancing-men.html), [Poe's Gold-Bug](https://ciphermuseum.com/ciphers/gold-bug.html), [Cicada 3301](https://ciphermuseum.com/ciphers/cicada-3301.html), [Krypto ARG](https://ciphermuseum.com/ciphers/krypto-arg.html), [MIT Mystery Hunt](https://ciphermuseum.com/ciphers/mit-mystery-hunt.html), [Sator Square](https://ciphermuseum.com/ciphers/sator-square.html), [Freemason pigpen tradition](https://ciphermuseum.com/ciphers/freemason-pigpen.html), [Da Vinci Code](https://ciphermuseum.com/ciphers/da-vinci-code.html), [National Treasure](https://ciphermuseum.com/ciphers/national-treasure.html), [Gravity Falls](https://ciphermuseum.com/ciphers/gravity-falls.html), [Field Hollers](https://ciphermuseum.com/ciphers/field-hollers.html) |

### 🔐 Every Exhibit Follows Four-Part Structure

1. **Historical Context** — When, where, who used it, why
2. **How It Works** — Encryption steps, diagrams, interactive demo
3. **How It Was Broken** — The specific technique, with context
4. **What It Teaches Modern Crypto** — The direct line from this cipher to AES/RSA

### 🎯 84 Cipher Engines · 110 Interactive Demos

The 140-exhibit collection includes **84 working cipher engines** plus **~27 hand-built widgets** — **110 of the 140 exhibits ship a fully interactive demo**, all built in vanilla JavaScript with no frameworks or build tools. The remaining 30 exhibits are codebreaker biographies, historical context pages (e.g. Cabinet Noir, Bletchley Park figures), and a small number of cipher pages not yet wired with a demo.

Type a message, set a key, and watch the cipher work in real time. Demos are dynamically generated by [js/demo-loader.js](js/demo-loader.js) from the engine implementations in [js/ciphers/all-engines.js](js/ciphers/all-engines.js), and the same engines power the [Codebreaker's Workbench](https://ciphermuseum.com/lab/workbench.html).

For a sortable, filterable view of every cipher system in the museum (era, type, security, hall, solved status, key method) see the [Cipher Comparison Table](https://ciphermuseum.com/comparison.html). For the full 140-exhibit roster including biographies and context pages, see the [Museum Map](https://ciphermuseum.com/museum-map.html).

### 📊 Additional Tools
- **[Cipher Corpus](https://ciphermuseum.com/cipher-corpus.html)** — The most comprehensive open library of known-answer ciphertext challenges for classical ciphers, with 100,026+ test cases across 82 algorithms. Includes:
    - **Challenge Mode** for learners: hides solutions for ciphertext-only practice.
    - **Known Corpus Mode** for teaching, benchmarking, and tool-building: shows all metadata, keys, and plaintexts.
    - **Downloadable datasets**: JSONL, JSON, CSV, schema, difficulty splits (beginner–expert), multilingual records (10 languages, 5,348 records including Arabic), noisy transcription variants, and LLM 3-shot evaluation export.
    - **Quality rules**: Every record includes cipher type, key/settings, plaintext, difficulty, language, expected attack methods, and source/license info. Synthetic and historical records are labeled. **101 historical records** spanning 4,000 years with primary source citations (c. 600 BCE–1999 CE).
    - **Cryptanalysis tools**: `scripts/hill-climbing-solver.js` and `scripts/sa-solver.js` for automated monoalphabetic cipher breaking (quadgram scoring, 95% accuracy on 80+ char ciphertexts).
    - **Integration**: Linked from main nav, mobile nav, and footer. Direct integration with Cipher Detective and Workbench.
    - **Accessibility**: Fully WCAG-compliant with skip links, labeled controls, and keyboard navigation.
    - **For educators, learners, and tool builders**: Practice, teach, or benchmark cryptanalysis tools with reproducible, documented examples. Builds on foundational benchmark work by [CipherBank (Li et al., 2025)](https://arxiv.org/pdf/2504.19093).

- **[Codebreaker's Workbench](https://ciphermuseum.com/lab/workbench.html)** — A unified hands-on lab that exposes **all 84 cipher engines** behind one consistent interface. Pick any cipher from the dropdown, paste your text, set a key (or accept the default), and encrypt/decrypt instantly. Beyond the per-exhibit demos it adds:
    - **Frequency analyser** — letter-frequency histogram with Index of Coincidence and Chi-square against English, useful for detecting monoalphabetic vs. polyalphabetic ciphertext at a glance.
    - **Kasiski / period detector** — repeated-trigram spacing analysis for breaking Vigenère-family ciphers.
    - **N-gram & entropy panel** — bigram/trigram counts and Shannon entropy for distinguishing transposition (preserves frequencies) from substitution (alters them).
    - **Side-by-side Encrypt/Decrypt panes** with copy-to-clipboard and a swap button so you can iterate on a key without retyping ciphertext.
    - **Same engine source as the exhibits** — the workbench pulls from [js/ciphers/all-engines.js](js/ciphers/all-engines.js), so anything you reproduce here matches every demo on the site.
- **[Cipher Detective](https://ciphermuseum.com/cipher-detective.html)** — Identify likely cipher families from unknown ciphertext using IoC, chi-square, and Kasiski evidence, then pivot into ranked suspects and next-attack guidance.
- **[Site Search](https://ciphermuseum.com/search.html)** — Search across all 140 exhibits, 13 exhibit halls, codebreaker biographies, cryptanalysis techniques, and the timeline. Index-driven, no backend, deep-link via `?q=`.
- **[Cryptanalysis Techniques](https://ciphermuseum.com/cryptanalysis.html)** — 10 interactive techniques: frequency analysis, Kasiski examination, index of coincidence, crib dragging, known-plaintext attack, hill climbing, simulated annealing, stepping-switch cryptanalysis (Purple), HMM/SMT decoding (Copiale), and Chaocipher reconstruction.
- **[Cipher Challenges](https://ciphermuseum.com/challenges.html)** — 10 progressive puzzles from Caesar to Enigma with hints and solutions.
- **[Timeline](https://ciphermuseum.com/timeline.html)** — Interactive 3,900+-year history with era filtering, scroll-spy, and 50+ clickable exhibit events.
- **[Comparison Table](https://ciphermuseum.com/comparison.html)** — Sortable, filterable table comparing the museum collection by type, era, hall, security level, solved status, and key method.
- **[Cipher Flow Explorer](https://ciphermuseum.com/cipher-flow.html)** — Visual relationship map between cipher families.
- **[Museum Map](https://ciphermuseum.com/museum-map.html)** — Architectural floor plan with all exhibit halls and cipher exhibits.
- **[Guided Tours](https://ciphermuseum.com/tours/index.html)** — Structured learning paths through the collection.
- **[Glossary](https://ciphermuseum.com/glossary.html)** — Comprehensive cryptography term reference.
- **[Further Reading](https://ciphermuseum.com/further-reading.html)** — Canon references, journals, and scholar/source index.
- **[Community](https://ciphermuseum.com/community/index.html)** — Discussion space for cipher enthusiasts.

---

## 📖 Complete Cipher Index

All 140 exhibits, alphabetically. Biographies and context pages are noted; plain text entries are dedicated cipher exhibits.


| Cipher | Era | Brief Description | How It Was Broken / Status |
|--------|-----|-------------------|----------------------------|
| [ADFGVX Cipher](https://ciphermuseum.com/ciphers/adfgvx.html) | WWI · June 1918 | ADFGVX cipher — Germany's WWI field cipher fusing a 6x6 Polybius square with keyed columnar transposition. Broken by Georges Painvin in June 1918. | Frequency analysis + Kerckhoffs attack (Georges Painvin, June 1918) |
| [ADFGX Cipher](https://ciphermuseum.com/ciphers/adfgx.html) | WWI · March 1918 | ADFGX cipher — March 1918 German field cipher pairing a 5x5 Polybius square with keyed columnar transposition. Broken by Painvin three months later. | Frequency analysis by Georges Painvin; columnar key recovered via IC |
| [Aeneas Tacticus Water-Clock Signal Code](https://ciphermuseum.com/ciphers/aeneas-tacticus.html) | Classical Greece · ~350 BCE | Aeneas Tacticus (~350 BCE) — the Greek general who wrote the world's earliest surviving manual on military communications, including the synchronized water-clock signaling code. | Pattern and timing analysis; trivial with interception |
| [AES (Advanced Encryption Standard)](https://ciphermuseum.com/ciphers/aes.html) | Modern · 2001 | AES (2001) — the cipher that encrypts the modern world; chosen by open competition, scrutinised for two decades, still without a practical attack. | No practical attack known; theoretically secure |
| [Affine Cipher E(x) = a·x + b mod 26](https://ciphermuseum.com/ciphers/affine.html) | Antiquity → 1800s · math-age | The affine cipher — a single linear formula E(x)=a·x+b mod 26 that generalises Caesar (a=1) and Atbash (a=25, b=25). Just 312 keys; trivially broken. | Frequency analysis; only 312 possible keys — exhaustive search |
| [Agnes Meyer Driscoll](https://ciphermuseum.com/ciphers/agnes-driscoll.html) | Interwar & WWII · USA | Agnes Meyer Driscoll was the U.S. Navy's chief cryptanalyst for three decades, breaking Japanese naval codes and training generations of American codebreakers. Known as 'Miss Aggie' and 'Madame X', she was the most formidable cryptanalyst in prewar America. | N/A — codebreaker biography |
| [Alberti Cipher Disk](https://ciphermuseum.com/ciphers/alberti-disk.html) | Renaissance · 1467 | Alberti cipher disk — Leon Battista Alberti's 1467 rotating disk, the first true polyalphabetic device and the tool that began the cipher revolution. | Period detection; each position is a monoalphabetic sub-cipher |
| [Arabic Nomenclators](https://ciphermuseum.com/ciphers/arabic-nomenclators.html) | Abbasid Caliphate · ~850 CE | 9th-century Abbasid Baghdad — al-Kindi's Risalah and the codebooks of the Arab cryptographic golden age, where frequency analysis was born. | Al-Kindi's own frequency analysis defeated contemporaries |
| [ARG Ciphers](https://ciphermuseum.com/ciphers/krypto-arg.html) | Web 2.0 · 2001–present | Alternate-reality games — from The Beast (2001) to Year Zero (2007) and beyond — built on the assumption that players will recognise, transcribe, and crack classical ciphers across forums, phone calls, and physical artifacts. | N/A — ARG puzzle page |
| [Argenti Family Cipher Vatican papal nomenclators · 1500s–1600s](https://ciphermuseum.com/ciphers/argenti.html) | Renaissance Italy · 1500s–1600s | Matteo and Marcello Argenti served as papal cryptanalysts to seven popes. Their <em>Trattato in Cifra</em> codified the homophonic-nomenclator pattern that dominated European diplomacy for two centuries. | Frequency analysis; homophones eventually exhausted under traffic volume |
| [Arne Beurling](https://ciphermuseum.com/ciphers/beurling.html) | WWII · Sweden | Swedish mathematician Arne Beurling broke the German Siemens T52 Geheimschreiber cipher in two weeks in 1940 — an achievement described by NSA historians as perhaps the greatest individual cryptanalytic feat in history. | Beurling himself broke Geheimschreiber in two weeks — biography page |
| [Arnold–André Book Cipher Blackstone’s Commentaries · 1779–1780](https://ciphermuseum.com/ciphers/arnold-andre.html) | American Revolution · 1779–1780 | The book cipher Benedict Arnold and Major John André used to plot the surrender of West Point. Each plaintext word located in a shared book (Blackstone’s <em>Commentaries</em>) and transmitted as the triple page.line.word. | Grid coordinates decoded by Washington's men from captured papers |
| [Atbash](https://ciphermuseum.com/ciphers/atbash.html) | Ancient · ~500 BC | Atbash — the ancient Hebrew reflection cipher (A<->Z, B<->Y, C<->X), self-inverse and used in the Book of Jeremiah (25:26, 51:41) for SHESHACH. | Mirror-alphabet; single pattern lookup — trivially reversible |
| [Autokey](https://ciphermuseum.com/ciphers/autokey.html) | Renaissance · 1586 | Autokey (1586) — Vigenère's self-extending key, the message becomes its own key. Effectively unbreakable until Friedman's 1920s statistical attack. | Kasiski-style coincidence attack; key runs out into plaintext |
| [The Babington Plot Cipher](https://ciphermuseum.com/ciphers/babington.html) | Elizabethan · 1586 | Babington Plot nomenclator (1586) — the cipher that condemned Mary, Queen of Scots, broken in days by Walsingham's cryptographer Thomas Phelippes. | Frequency analysis by Thomas Phelippes for Walsingham, 1586 |
| [Bach's B-A-C-H Motif](https://ciphermuseum.com/ciphers/bach-motif.html) | Baroque Germany · 1750 | The four notes B♭ – A – C – B♮ spell 'BACH' in German musical notation — a self-signature Bach embedded in his final unfinished fugue. | Musical pattern recognition; BACH = B♭–A–C–B♮ letter notation |
| [Bacon's Cipher](https://ciphermuseum.com/ciphers/bacon.html) | 1605 | Bacon's bilateral cipher (1605) — Francis Bacon's 5-bit binary code that hides letters inside a two-typeface carrier, the direct ancestor of ASCII. | Visual pattern analysis: two fonts ↔ binary; trivially detectable |
| [Bazeries Cipher](https://ciphermuseum.com/ciphers/bazeries.html) | 1890s · France | Bazeries cylinder cipher — Etienne Bazeries' 1898 wheel cipher with 20 alphabet disks, an evolution later adopted by the US Army as the M-94 in 1922. | Probable-word crib + frequency analysis (Étienne Bazeries himself) |
| [Beale Ciphers](https://ciphermuseum.com/ciphers/beale.html) | 19th Century · published 1885 | Beale ciphers (~1820) — three book ciphers said to lead to a Virginia treasure. Only #2 was solved (Declaration of Independence key); #1 and #3 unsolved. | B2 cracked with DOI key; B1 and B3 remain unsolved |
| [Beaufort Cipher](https://ciphermuseum.com/ciphers/beaufort.html) | Victorian · 1857 | Beaufort cipher (1857) — Sir Francis Beaufort's reciprocal Vigenère variant where encrypt and decrypt are the same operation. Broken by Kasiski examination. | Kasiski examination; IC test identifies period then frequency attack |
| [Bible Code — Equidistant Letter Sequences](https://ciphermuseum.com/ciphers/bible-code.html) | 1994 · Refuted 1999 | The Bible Code — equidistant letter sequences (ELS) claimed to hide prophecies in the Hebrew scriptures. A rigorous statistical refutation by McKay et al. (1999) showed the same method finds identical 'predictions' in War and Peace and Moby-Dick. | Demonstrated spurious by Brendan McKay using Moby Dick (1999) |
| [Bifid Cipher](https://ciphermuseum.com/ciphers/bifid.html) | 1901 | Bifid cipher (1901) — Felix Delastelle's fractionation cipher that splits Polybius coordinates, transposes them across a period, and recombines. | Period detection + digraph frequency analysis on the fractionated output |
| [Bill Tutte](https://ciphermuseum.com/ciphers/bill-tutte.html) | WWII · Britain | Bill Tutte was a Cambridge mathematician who reconstructed the complete logical structure of the Lorenz SZ40 cipher machine from ciphertext alone — without ever seeing the machine — enabling the creation of Colossus, the world's first programmable electronic computer. | N/A — codebreaker biography |
| [Bletchley Park](https://ciphermuseum.com/ciphers/bletchley-park.html) | WWII · 1939–1945 | Bletchley Park (Station X) was the British WWII signals intelligence headquarters where 10,000 people broke Enigma, Lorenz, and dozens of other Axis ciphers — arguably shortening the war by two years. | N/A — historical context page |
| [Book Cipher](https://ciphermuseum.com/ciphers/book-cipher.html) | 18th–20th c. | Book Cipher (18th c.) — if both correspondents share the same book, the book itself is the key. Used by Benedict Arnold, Aaron Burr, and Beale. | Edition identification; known-plaintext attack with the key text |
| [Cabinet Noir — Black Chambers of Europe](https://ciphermuseum.com/ciphers/cabinet-noir.html) | Europe · 1550–1850 | The European Black Chambers (cabinets noirs) were government departments that intercepted, deciphered, and resealed diplomatic mail from the 16th through 19th centuries — proto-signals-intelligence agencies. | N/A — historical context page |
| [Caesar Cipher](https://ciphermuseum.com/ciphers/caesar.html) | Ancient Rome | Caesar cipher — the simplest substitution cipher, used by Julius Caesar around 58 BC with a shift of 3. Broken by Al-Kindi's frequency analysis circa 850 AD. | Exhaustive search: 25 possible shifts; frequency analysis immediate |
| [Cardano Autokey 1550 · the original self-keying cipher](https://ciphermuseum.com/ciphers/cardano-autokey.html) | Italian Renaissance · 1550 | Girolamo Cardano's 1550 autokey — prime the keystream with a single seed letter, then continue it with the plaintext itself. The first published self-keying scheme. | Pattern repetition + frequency analysis on the reused-key segments |
| [Cardano Grille 1550 · steganography by template](https://ciphermuseum.com/ciphers/cardano-grille.html) | Italian Renaissance · 1550 | Girolamo Cardano's 1550 grille — a card with cut-out windows. Write the secret through the windows; fill the rest with innocuous text; the recipient overlays an identical grille to read. | Geometric reconstruction; visual pattern search for the grille shape |
| [Chaocipher](https://ciphermuseum.com/ciphers/chaocipher.html) | Modern · 1918 | Chaocipher (1918) — John F. Byrne's two-disk dynamic cipher that permutes both alphabets after every character. Unsolved for 90 years until Rubin's 2010 break. | Cryptanalysis by Moshe Rubin (2010) after algorithm finally published |
| [Che Guevara's VIC Variant](https://ciphermuseum.com/ciphers/che-guevara.html) | Cold War · 1956–1967 | Ernesto 'Che' Guevara used a modified VIC straddling-checkerboard cipher for guerrilla communications in Bolivia and the Congo, 1956–1967. | VIC variant; traffic analysis & probable-word attack by CIA/FBI |
| [Chinese Telegraph Code Standard Telegraph Codebook · 1881](https://ciphermuseum.com/ciphers/chinese-telegraph.html) | Late Qing → PRC · 1881–1980s | The 1881 Chinese Telegraph Code mapped 7,000+ Chinese characters to 4-digit code groups so they could ride the same Morse-style telegraph network as the Latin alphabet — and was super-enciphered for diplomatic and military traffic in the 20th century. | Codebook capture; frequency analysis on the numeric groups |
| [Cicada 3301](https://ciphermuseum.com/ciphers/cicada-3301.html) | Internet era · 2012–2014 | An anonymous 2012–2014 internet recruitment puzzle that combined steganography, classical ciphers, GPS coordinates on physical posters, and a copy of the Liber Primus hand-illustrated in glyphic runes. | Community crowd-sourced; each layer solved with open-source analysis |
| [Columnar Transposition](https://ciphermuseum.com/ciphers/columnar.html) | 19th Century | Columnar transposition — write plaintext under a keyword, then read columns in keyword order. Broken by Friedman-era multiple-anagram methods in the 1920s. | Anagramming attack; fitting columns by digraph frequency |
| [Commercial Telegraph Codebooks ABC, Bentley’s, Lieber’s · 1870s–1930s](https://ciphermuseum.com/ciphers/commercial-codebooks.html) | Victorian → inter-war · 1870s–1930s | Commercial telegraph codebooks (ABC Code, Bentley’s, Lieber’s) were the workhorses of Victorian and Edwardian global business. Each English word or phrase mapped to a 5-letter pronounceable codeword — cheaper, denser, and incidentally a layer of confidentiality. | Edition identification + traffic volume reveals repeated groups |
| [Conan Doyle's Dancing Men](https://ciphermuseum.com/ciphers/dancing-men.html) | Edwardian Britain · 1903 | The fictional stick-figure cipher Sherlock Holmes solves in The Adventure of the Dancing Men (1903) — a frequency-analysis primer disguised as a Strand magazine story. | Frequency analysis by Holmes (fictional); E=most common stick figure |
| [Confederate Dictionary Code](https://ciphermuseum.com/ciphers/dictionary-code.html) | Confederate · 1862 | Dictionary code — the Civil War book cipher that encodes each word as page-line-word triplets keyed to a shared dictionary, immune to frequency attacks. | Edition identification; codebook capture or probable-word matching |
| [Confederate Vigenère](https://ciphermuseum.com/ciphers/confederate-vigenere.html) | Confederate · 1862 | Confederate Vigenère (1861-1865) — the brass cipher disk used by Confederate officers, broken in 1863 once the three repeating field keys were recovered. | Kasiski examination; Union cryptanalysts recovered keys from traffic |
| [Copiale Cipher](https://ciphermuseum.com/ciphers/copiale.html) | 18th Century · ~1760s | Copiale Cipher — the 105-page 18th-century Oculist Order manuscript with homophonic substitution. Broken in 2011 by Knight, Megyesi, and Schaefer using HMM. | HMM + SMT symbolic substitution (Berg et al., 2011) |
| [Culper Ring / Tallmadge Code Washington’s spy ring codebook · 1779](https://ciphermuseum.com/ciphers/culper-ring.html) | American Revolution · 1778–1783 | Major Benjamin Tallmadge’s 1779 codebook for George Washington’s Culper Spy Ring. Roughly 750 numbered entries covering people, places, military terms, and common words — used by Abraham Woodhull and Robert Townsend on British-occupied Long Island and Manhattan. | Codebook captured by British; Tallmadge numbers decoded from dictionary |
| [D'Agapeyeff Cipher](https://ciphermuseum.com/ciphers/dagapeyeff.html) | Pre-WWII Britain · 1939 | A 1939 textbook 'cryptogram for the student' that the author himself later admitted he had forgotten how to solve. | Author forgot his key; unsolved to this day |
| [David Kahn](https://ciphermuseum.com/ciphers/kahn.html) | Modern · Journalist/Historian | David Kahn's 1967 masterwork The Codebreakers was the first comprehensive history of cryptography — a book so thorough that the NSA tried to suppress its publication. | N/A — author/historian biography |
| [The Da Vinci Code](https://ciphermuseum.com/ciphers/da-vinci-code.html) | Fiction · 2003 | Dan Brown's 2003 thriller made cryptography mainstream — Atbash, the Fibonacci sequence, and anagrams as plot devices that introduced millions to cipher thinking. | N/A — fictional; simple Atbash substitution in the novel |
| [DES (Data Encryption Standard)](https://ciphermuseum.com/ciphers/des.html) | Modern · 1977 | DES (1977) — the first public, government-standardised cipher; broken by EFF Deep Crack in 1998 and the spark of modern academic cryptanalysis. | 56-bit key exhausted by EFF Deep Crack in 22 hours (1998) |
| [Diana Cryptosystem](https://ciphermuseum.com/ciphers/diana-cryptosystem.html) | Cold War · 1960s–1990s | The US Army Special Forces one-time pad field system (1960s–1990s) — trigraph-based OTP cards issued to Green Berets in Vietnam. | One-time pad variant; misuse (key reuse) made it breakable |
| [Diffie-Hellman Key Exchange](https://ciphermuseum.com/ciphers/diffie-hellman.html) | Modern · 1976 | Diffie-Hellman (1976) — two strangers create a shared secret over an open wire, ending three thousand years of must-meet-first cryptography. | Discrete logarithm problem; no efficient algorithm known |
| [Dilly Knox](https://ciphermuseum.com/ciphers/dilly-knox.html) | WWI/WWII · Britain | Alfred Dillwyn "Dilly" Knox was the British codebreaker who solved the Enigma wiring before Turing, broke the Abwehr Enigma, and was the first to crack the Italian commercial Enigma variant. | N/A — codebreaker biography |
| [Dorabella Cipher](https://ciphermuseum.com/ciphers/dorabella.html) | 19th c. · 1897 | Dorabella Cipher (1897) — Edward Elgar's 1897 cryptogram — 87 squiggles that have resisted every attempt since. Hall XII of The Cipher Museum. | Remains unsolved; 87 characters in three lines |
| [Double Transposition](https://ciphermuseum.com/ciphers/double-transposition.html) | WWI · Germany | Double transposition — apply columnar transposition twice with two keys. The WWII Allied workhorse, considered unbreakable until Lasry et al. (2013). | Known-plaintext or probable-word attack; anagramming both keys |
| [Egyptian Substitution Hieroglyphs](https://ciphermuseum.com/ciphers/egyptian-substitution.html) | Middle Kingdom Egypt · ~1900 BCE | The Khnumhotep II tomb inscription (~1900 BCE) — the world's earliest surviving instance of a deliberate substitution cipher, using unusual hieroglyph variants. | Context/iconographic frequency analysis on hieroglyphic variants |
| [Elizebeth Smith Friedman](https://ciphermuseum.com/ciphers/elizebeth-friedman.html) | Interwar & WWII · USA | Elizebeth Smith Friedman was America's first female professional cryptanalyst, who broke rum-runner codes during Prohibition, exposed Nazi spy networks in South America, and laid the foundations for what became the NSA. | N/A — codebreaker biography |
| [Elonka Dunin](https://ciphermuseum.com/ciphers/dunin.html) | Modern · Cryptographer | Elonka Dunin is a game designer, cryptographer, and the foremost public authority on unsolved ciphers — the creator of the definitive list of famous unsolved codes and an expert on Kryptos. | N/A — codebreaker biography |
| [Enigma Machine](https://ciphermuseum.com/ciphers/enigma.html) | WWII · 1918–1945 | Enigma (1923) — the German rotor cipher securing Wehrmacht and Kriegsmarine traffic. Broken by Polish mathematician Marian Rejewski in 1932. | Bombe (Turing/Welchman) exploiting cribs and Enigma's no-self-encrypt rule |
| [Ethiopian Geʼez Monastic Ciphers](https://ciphermuseum.com/ciphers/amharic-ge-ez-ciphers.html) | East Africa · 14th–19th c. | Ethiopian Orthodox monasteries used syllabary-based substitution ciphers in Ge'ez script to protect sacred texts and inter-monastery communications from the 14th century onward. | Symbol frequency analysis on the limited syllabary |
| [Fialka M-125 Soviet 10-rotor machine · 1956](https://ciphermuseum.com/ciphers/fialka.html) | Cold War · 1956 | The Soviet Cold-War rotor machine. Ten rotors, half stepping forward and half backward, plus a punch-card key sheet — the answer to every weakness Soviet analysts saw in Enigma. | No publicly known break; retired by design |
| [Field Hollers and Coding Songs](https://ciphermuseum.com/ciphers/field-hollers.html) | Americas · 1619–1865 | American enslaved workers used field hollers, work songs, and coded idiom as covert communication — "Follow the Drinking Gourd" encoding an escape route along the Underground Railroad. | N/A — cultural/historical context page |
| [Four-Square Cipher](https://ciphermuseum.com/ciphers/four-square.html) | Late 19th Century · ~1902 | Four-Square cipher (1902) — Delastelle's digram cipher using two keyed and two standard 5x5 squares. Disrupts Playfair frequencies but breaks to digrams. | Digraph frequency analysis; flat distribution betrays the 4-square grid |
| [Fractionated Morse Cipher](https://ciphermuseum.com/ciphers/fractionated-morse.html) | 19th Century | Fractionated Morse — converts text to Morse, regroups dots, dashes, and separators in trigrams, then substitutes via a keyed alphabet. Broken by trigram stats. | Bigram/trigram frequency on the fractionated triplets |
| [Freemason Pigpen Tradition](https://ciphermuseum.com/ciphers/freemason-pigpen.html) | Early modern Europe · 17th–19th c. | The geometric pigpen alphabet — fragments of grids and X-shapes — used by Freemasons, Rosicrucians, and the Hellfire Club from the 17th century onwards as a fraternal cipher and ritual marker. | Symbol substitution; grid lookup trivially reverses it |
| [The GCHQ Trio — Ellis, Cocks, and Williamson](https://ciphermuseum.com/ciphers/gchq-trio.html) | Cold War · GCHQ | James Ellis, Clifford Cocks, and Malcolm Williamson of GCHQ independently invented public-key cryptography in 1970–1973 — but their work remained classified until 1997, four years after Diffie, Hellman, and Rivest had received public credit. | N/A — codebreaker biography group |
| [Geheimschreiber T52 (Sturgeon) Siemens & Halske teleprinter cipher](https://ciphermuseum.com/ciphers/geheimschreiber.html) | WWII · 1932–1945 | The Siemens T52 “Sturgeon” — a German WWII teleprinter cipher with ten irregularly-clocked wheels feeding an additive keystream and a per-character permutation. Broken by Arne Beurling and the Swedish FRA in summer 1940. | Broke by Arne Beurling in ~2 weeks with pure cryptanalysis (1940) |
| [George Lasry](https://ciphermuseum.com/ciphers/lasry.html) | Modern · Computational | George Lasry is a computational cryptographer who has solved more historically unsolved cipher manuscripts in the past decade than anyone alive — including the Copiale Cipher and multiple Zodiac Killer messages. | N/A — codebreaker biography |
| [Gravity Falls Cipher System](https://ciphermuseum.com/ciphers/gravity-falls.html) | Animation · 2012–2016 | The Disney animated series Gravity Falls (2012–2016) hid a different cipher in every episode's credits — Caesar, Atbash, A1Z26 numeric, Vigenère — teaching real cryptography to a generation of children. | Caesar/Vigenère/Atbash keys hidden in show credits; fan community solved |
| [The Great Cipher](https://ciphermuseum.com/ciphers/great-cipher.html) | Baroque · ~1626 | Great Cipher of Louis XIV (1626) — the Rossignol father-and-son syllabic nomenclator with delete-previous-letter traps. Broken by Bazeries in 1893. | Frequency + syllabic hypothesis; broken by Étienne Bazeries c. 1893 |
| [Gronsfeld Cipher](https://ciphermuseum.com/ciphers/gronsfeld.html) | 17th Century | Gronsfeld cipher (1655) — a Vigenère variant restricted to numeric keys (0-9), making it field-portable but with a smaller key space that falls fast to Kasiski. | Kasiski examination; identical to Vigenère with digit key 0–9 |
| [Herbert Yardley](https://ciphermuseum.com/ciphers/yardley.html) | Interwar · USA | Herbert Osborne Yardley founded America's Black Chamber in 1919, broke Japanese diplomatic codes at the 1921 Washington Naval Conference, and then infamously published the secrets in his 1931 bestseller. | N/A — codebreaker biography |
| [Hill Cipher](https://ciphermuseum.com/ciphers/hill.html) | 1929 | Hill cipher (1929) — Lester S. Hill's matrix-based polygraphic cipher, first to apply linear algebra to encryption. Broken by known-plaintext (mod-26 system). | Known-plaintext attack: P·K=C → K=P⁻¹·C (matrix inversion mod 26) |
| [Histiaeus's Tattooed Messenger](https://ciphermuseum.com/ciphers/histiaeus-tattoo.html) | Classical Greece · ~499 BCE | Histiaeus of Miletus (~499 BCE) — the Greek tyrant who tattooed a secret revolt order on a slave's shaved scalp, then waited for the hair to regrow before sending him. | Discovery of the messenger; physical search reveals message |
| [Homophonic Substitution](https://ciphermuseum.com/ciphers/homophonic.html) | Renaissance · ~1400 | Homophonic substitution (1400s) — replace each letter with one of several numeric codes to flatten frequencies. Defeated Mary in 1586; Great Cipher in 1893. | Frequency analysis with pooled homophones; traffic volume collapses it |
| [IRA Book Cipher](https://ciphermuseum.com/ciphers/ira-book-cipher.html) | Modern · 1970s–1990s | The Provisional IRA used book ciphers for encrypted communications between active service units and the Army Council — decoded when the FBI seized key material. | Edition identification; arrests produced the key texts |
| [Jefferson Disk](https://ciphermuseum.com/ciphers/jefferson-disk.html) | 1795 (Jefferson) · 1922 (M-94) | Jefferson disk cipher (1795) — Thomas Jefferson's 26-disk wheel cipher, rediscovered and adopted by the US Army as the M-94 in 1922. Solved by the late 20th c. | Probable-word attack across the wheel rows; brute-forced with cribs |
| [JN-25 (Japanese Naval Code)](https://ciphermuseum.com/ciphers/jn-25.html) | World War II - 1939-1945 | JN-25 (1939-1945) - the Imperial Japanese Navy's superenciphered codebook system broken by Station HYPO and central to Midway intelligence. | Frequency + depth attack (Station HYPO); broken before Midway 1942) |
| [Joan Clarke](https://ciphermuseum.com/ciphers/joan-clarke.html) | WWII · Britain | Joan Clarke was a Bletchley Park cryptanalyst who worked in Hut 8 alongside Alan Turing, making crucial contributions to breaking the Naval Enigma and to the development of the Bombe. | N/A — codebreaker biography |
| [Joseon Yeokhak Cipher](https://ciphermuseum.com/ciphers/joseon-yeokhak.html) | East Asia · 1392–1897 | The Joseon Dynasty (1392–1897) Korean royal court used a cipher based on I Ching hexagram pairings to protect palace communications and diplomatic dispatches. | Context + frequency on the limited character set |
| [Joseph Rochefort](https://ciphermuseum.com/ciphers/rochefort.html) | WWII · Pacific | Commander Joseph Rochefort led Station HYPO and broke JN-25 in 1942, providing the intelligence that won the Battle of Midway and turned the tide of the Pacific War. | N/A — codebreaker biography |
| [Kama Sutra Cipher (Mlecchita Vikalpa)](https://ciphermuseum.com/ciphers/kama-sutra.html) | Classical India · ~400 CE | The Mlecchita Vikalpa cipher from Vatsyayana's Kama Sutra (~400 CE) — a paired-letter substitution taught to lovers as one of the 64 arts. | Simple substitution; frequency analysis or dictionary attack |
| [Kerckhoffs's Principle](https://ciphermuseum.com/ciphers/kerckhoffs.html) | Foundational · 1883 | Auguste Kerckhoffs's 1883 principle — 'A cipher should be secure even if everything about the system, except the key, is public knowledge' — is the bedrock of modern cryptographic design. | N/A — theoretical principle page |
| [KL-7 ADONIS NATO eight-rotor machine · 1952](https://ciphermuseum.com/ciphers/kl-7.html) | Cold War · 1952 | The KL-7 (ADONIS) was NATO’s standard cipher machine from 1952 to 1968. Eight rotors, seven of which stepped, on a re-entrant alphabet. Compromised by John Walker, not by cryptanalysis. | No publicly confirmed break; retired before cryptanalysis succeeded |
| [Kryha Pocket cipher machine · 1924](https://ciphermuseum.com/ciphers/kryha.html) | Inter-war commercial · 1924 | Alexander von Kryha’s 1924 pocket cipher — a clockwork-driven mixed alphabet wheel sold to banks and diplomats as unbreakable, then broken in two hours by William Friedman. | Short cycle (~31 letters) discovered by Friedmans; IC attack |
| [Kryptos](https://ciphermuseum.com/ciphers/kryptos.html) | Modern · 1990 | Kryptos (1990) — Jim Sanborn's CIA-courtyard sculpture in four sections. K1, K2, K3 solved by 1999 (keyed Vigenère and transposition); K4 still unsolved. | K1–K3 solved (Vigenère/transposition); K4 remains unsolved |
| [Latin American Telegraphic Codebooks](https://ciphermuseum.com/ciphers/latin-american-codebooks.html) | Americas · 1870s–1940s | The commercial telegraph boom of 1870–1940 spawned a rich family of Latin American codebooks — from the Código Comercial Mexicano to the Código Telegráfico Argentino — that shaped 20th-century trade. | Codebook seizure; same vulnerability as all codebook systems |
| [Leo Marks](https://ciphermuseum.com/ciphers/leo-marks.html) | WWII · Britain | Leo Marks was the SOE's head of cryptography in WWII, who replaced vulnerable poem codes with one-time pads for field agents, dramatically reducing agent capture rates. He wrote the poem 'The Life That I Have' for agent Violette Szabo. | N/A — codebreaker biography |
| [Lorenz Cipher](https://ciphermuseum.com/ciphers/lorenz.html) | WWII · Germany · 1940 | Lorenz SZ40 cipher (1940) — the German High Command teleprinter cipher with twelve pin-wheels. Broken by Bill Tutte in 1942; industrialised by Colossus in 1944. | Bill Tutte reconstructed wheel structure; Colossus broke it (1944) |
| [M-209 (Hagelin C-38)](https://ciphermuseum.com/ciphers/m209.html) | World War II · 1940 | M-209 cipher machine (1940) — the US Army's portable Hagelin C-38 with six co-prime pin-wheels and a 27-bar lug cage. Broken in the field in WWII. | Probable-word + depth key attack; broken by Friedman team in WWII |
| [M-94 / CSP-488 US Army strip / disk cipher · 1922](https://ciphermuseum.com/ciphers/m-94.html) | WWI → WWII tactical · 1922–1942 | The M-94 (Army) and CSP-488 (Navy) — 25 brass disks on a spindle, each carrying a mixed alphabet. Jefferson’s 1795 idea, mass-produced for WWI tactical traffic and used into 1942. | Probable-word attack across the 25-disk rows; Friedmans broke variants |
| [Mary Queen of Scots — The Castelnau Letters](https://ciphermuseum.com/ciphers/mary-stuart-castelnau-letters.html) | 1586 | The 1586 Castelnau letters by Mary Queen of Scots — a 50,000-character cipher solved by George Lasry, Beáta Megyesi, and Satoshi Tomokiyo in 2022, revealing undocumented French diplomatic intelligence. | Frequency analysis; Phelippes broke Mary Queen of Scots system (1586) |
| [Mavis Batey](https://ciphermuseum.com/ciphers/mavis-batey.html) | WWII · Britain | Mavis Batey (née Lever) was a Bletchley Park cryptanalyst who broke the Italian naval Enigma in 1941, providing the intelligence behind the Battle of Cape Matapan — the Royal Navy's greatest WWII Mediterranean victory. | N/A — codebreaker biography |
| [McCormick Notes](https://ciphermuseum.com/ciphers/mccormick.html) | Late 20th-c. United States · 1999 | Two handwritten notes found in the pockets of murder victim Ricky McCormick in 1999 — declared 'unbreakable' by the FBI's Cryptanalysis and Racketeering Records Unit in 2011. | Remains unsolved; mixed symbols on body of Ricky McCormick |
| [Microdot Steganography](https://ciphermuseum.com/ciphers/microdot.html) | Modern · 1941–1980s | The microdot — a photograph reduced to the size of a typographic period — was the most effective covert communication tool of the 20th century, used by the Abwehr, KGB, and CIA from WWII through the Cold War. | Physical inspection; scanning with microscope reveals the dot |
| [MIT Mystery Hunt](https://ciphermuseum.com/ciphers/mit-mystery-hunt.html) | MIT · 1981–present | An annual three-day puzzle marathon at MIT (since 1981) where teams solve dozens of layered cryptographic, linguistic, and lateral-thinking puzzles to find a hidden coin somewhere on campus. | N/A — puzzle competition page |
| [Monoalphabetic Substitution](https://ciphermuseum.com/ciphers/monoalphabetic.html) | Medieval · ~800 AD | Monoalphabetic substitution — replace each letter with a fixed substitute. Foundation of all substitution ciphers; broken by Al-Kindi's frequency analysis ~850. | Frequency analysis; Caesar to complex substitution all fall the same way |
| [Morse Code Telegraphy's universal alphabet · 1840s](https://ciphermuseum.com/ciphers/morse.html) | Telegraph age · 1840s → | International Morse code — the dot-dash telegraph alphabet that made the wired world possible and provided the carrier signal for a century of military and amateur ciphers. | N/A — encoding system, not a cipher |
| [National Treasure](https://ciphermuseum.com/ciphers/national-treasure.html) | Fiction · 2004 | The 2004 Disney film National Treasure sent audiences hunting for cipher clues on the US dollar bill, the Liberty Bell, and Independence Hall — all real historical sites. | N/A — fictional film; Bacon cipher used as plot device |
| [Navajo Code Talkers](https://ciphermuseum.com/ciphers/navajo-code-talkers.html) | WWII · 1942–1945 | Navajo Code (1942-1945) — a constructed military vocabulary spoken by 420 Marine Code Talkers. Never broken in wartime; declassified in 1968 after long use. | Never broken in WWII; Japanese could not isolate the language structure |
| [Nihilist Cipher](https://ciphermuseum.com/ciphers/nihilist.html) | 1880s · Russia | Nihilist cipher (1880s) — the Russian revolutionary classic adding Polybius numbers to a repeating keyword's Polybius numbers (mod 100). Broken early 1900s. | Double-Polybius structure; IC + frequency analysis on the digit pairs |
| [Nomenclator](https://ciphermuseum.com/ciphers/nomenclator.html) | Renaissance · 1400s–1800s | Nomenclator (1400s) — The 400-year diplomatic compromise: a small substitution alphabet plus a large code dictionary. Hall II of The Cipher Museum. | Frequency analysis on the codewords; Walsingham's team, 1580s |
| [Null Cipher Concealment by selective reading · ancient → modern](https://ciphermuseum.com/ciphers/null-cipher.html) | Antiquity → present | The null cipher — hide the secret in plain sight by spelling it out with the first letters of an innocuous message. Used by spies, prisoners, and Bacon, since at least the Roman empire. | Pattern recognition and positional analysis of the cover text |
| [One-Time Pad](https://ciphermuseum.com/ciphers/one-time-pad.html) | 1882 · Theoretical | One-Time Pad (Miller 1882 / Mauborgne 1917) — the only cipher mathematically unbreakable when the key is truly random, key-length, and never reused (Shannon). | Theoretically unbreakable when used correctly (Shannon 1949) |
| [Patterson's Cipher for Jefferson](https://ciphermuseum.com/ciphers/patterson-jefferson-cipher.html) | 1801 | Robert Patterson's 1801 four-layer transposition cipher — sent to Thomas Jefferson, who couldn't break it. Stumped American statesmen for 206 years until Lawren Smithline cracked it in 2007 using hill-climbing search. | Never practically used; wheel cipher principle later broken |
| [Phaistos Disc](https://ciphermuseum.com/ciphers/phaistos-disc.html) | Bronze Age Crete · ~1700 BCE | A 1700 BCE Cretan terracotta disc stamped with 45 distinct pictograms — the world's oldest 'movable type' and one of its most enduring undeciphered scripts. | Undeciphered; script unknown (Bronze Age Crete) |
| [Pigpen Cipher](https://ciphermuseum.com/ciphers/pigpen.html) | 18th Century | Pigpen cipher (~1700) — Freemason geometric substitution where each letter becomes the lines and dots of its grid cell. Trivial once the glyph table is seen. | Symbol grid lookup; pattern obvious once grid recovered |
| [Playfair Cipher](https://ciphermuseum.com/ciphers/playfair.html) | Victorian · 1854 | Playfair cipher (1854) — Charles Wheatstone's keyed 5x5 digram cipher promoted by Lord Playfair. Used by the British in WWI; broken by digram analysis. | Digraph frequency attack; 676 pairs reduce to statistical attack |
| [Poe's Gold-Bug Cipher](https://ciphermuseum.com/ciphers/gold-bug.html) | Antebellum America · 1843 | Edgar Allan Poe's 1843 short story The Gold-Bug — the first widely read piece of fiction to teach cryptanalysis, complete with a worked decipherment of a buried-treasure cryptogram. | Fictional frequency analysis by Poe's Legrand; E-most-common |
| [Polybius Square](https://ciphermuseum.com/ciphers/polybius.html) | Ancient Greece · ~150 BC | Polybius square (~150 BC) — ancient Greek 5x5 grid mapping each letter to a row-column digit pair. Foundation for Bifid, Trifid, Nihilist, ADFGX, and tap codes. | Grid reconstruction + frequency analysis; trivially reversed |
| [Porta Cipher](https://ciphermuseum.com/ciphers/porta.html) | Renaissance · 1563 | Porta cipher (1563) — della Porta's reciprocal polyalphabetic table where each key letter swaps two halves of the alphabet. Falls to Kasiski just like Vigenère. | IC test identifies polyalphabetic period; then frequency by position |
| [Purple (Type 97 jiki-O-bun-In-ji-ki)](https://ciphermuseum.com/ciphers/purple.html) | World War II · 1939–1945 | Purple machine (1939) — Japan's Type 97 stepping-switch cipher for diplomatic traffic. Broken on 20 September 1940 by Frank Rowlett and the US Army SIS team. | Stepping-switch mechanism reverse-engineered by Friedman's SIS team (1940) |
| [Rail Fence Cipher](https://ciphermuseum.com/ciphers/rail-fence.html) | 19th Century | Rail Fence cipher — write the message in a zigzag across N rails, then read off rail by rail. Trivial to break: brute-force every rail count from 2 to about 10. | Period search; only small number of rail counts possible |
| [Red Army Faction One-Time Pad](https://ciphermuseum.com/ciphers/red-army-faction.html) | Cold War · 1970–1998 | The West German Red Army Faction (RAF/Baader-Meinhof) used KGB-supplied one-time pads for communications — materials discovered in 1993 after German reunification archive access. | Key reuse attack; pads reused across multiple messages |
| [Red (Type A)](https://ciphermuseum.com/ciphers/red-type-a.html) | Interwar to WWII - 1931-1938 | Red (Type A) (1931-1938) - the Japanese diplomatic stepping-switch predecessor to Purple and the cryptanalytic bridge to MAGIC. | Vowel–consonant split pattern exploited by Friedman's SIS (1936) |
| [The Rosetta Stone](https://ciphermuseum.com/ciphers/rosetta-stone.html) | Ptolemaic Egypt · 196 BCE | The Rosetta Stone (196 BCE) — the trilingual decree that unlocked Egyptian hieroglyphs after fourteen centuries of silence, deciphered by Champollion in 1822. | Parallel text decipherment; Champollion, 1822 |
| [ROT13](https://ciphermuseum.com/ciphers/rot13.html) | Modern · 1980s | ROT13 (~1980, Usenet) — the self-inverse Caesar with shift 13, designed as a spoiler obscurer rather than a cipher. One operation toggles text in and out. | Trivial: apply itself; shift-13 is its own inverse |
| [RSA](https://ciphermuseum.com/ciphers/rsa.html) | Modern · 1977 | The first practical public-key cryptosystem — one key encrypts, a different key decrypts, and you can publish the encrypting key in the phone book. | Integer factorisation problem; no efficient algorithm known |
| [Running Key Cipher](https://ciphermuseum.com/ciphers/running-key.html) | 19th Century | Running Key cipher (19th c.) — a Vigenère variant using a long passage of natural text as the key. Broken by Friedman with high-probability-trigram dragging. | IC test shows flat distribution; probable-word crib matching |
| [Sator Square](https://ciphermuseum.com/ciphers/sator-square.html) | Roman Empire · 1st–4th c. CE | A 2nd-century Roman five-letter palindromic word square — SATOR · AREPO · TENET · OPERA · ROTAS — readable forwards, backwards, up, and down. Every element of the square also rearranges into PATER NOSTER + A and O. | Latin palindrome; purely cultural artifact |
| [Scytale](https://ciphermuseum.com/ciphers/scytale.html) | Sparta · ~500 BC | Scytale (~700 BC) — the Spartan transposition device that wraps a leather strip around a rod of fixed diameter. Broken trivially by trying every rod width. | Period search: try every rod diameter — small keyspace |
| [SHA-256](https://ciphermuseum.com/ciphers/sha256.html) | Modern · 2001 | SHA-256 (2001) — a 256-bit fingerprint for any input; the verification engine of Git, Bitcoin, TLS certificates, and software integrity worldwide. | No practical preimage or collision attack known |
| [Shugborough Inscription](https://ciphermuseum.com/ciphers/shugborough.html) | Georgian England · ~1748–1763 | An 18th-century English garden monument bearing the cryptic letters O · U · O · S · V · A · V · V — debated for 250 years and never definitively cracked. | Remains unsolved; 10-letter inscription OUOSVAVV |
| [SIGABA (ECM Mark II)](https://ciphermuseum.com/ciphers/sigaba.html) | WWII · 1940 | SIGABA (ECM Mark II) (1940) — The American WWII rotor machine the Axis never broke — fifteen rotors, irregular stepping. Hall VII of The Cipher Museum. | Never cryptanalysed by Axis powers; retired before any break |
| [SIGSALY — The Encrypted Speech System](https://ciphermuseum.com/ciphers/sigsaly.html) | WWII · 1943–1946 | SIGSALY (1943–1946) was the world's first perfectly secure voice encryption system — a 50-ton machine using vinyl phonograph records as one-time pads to protect Roosevelt-Churchill phone calls during WWII. | N/A — historical secure-voice system context page |
| [Slidex British WWII tactical bigram cipher card](https://ciphermuseum.com/ciphers/slidex.html) | WWII · 1943–1945 | Slidex was the British / Allied tactical paper-and-card cipher of WWII. A printed grid plus a sliding strip turned 2-letter bigrams into other bigrams. Quick at the platoon level, weak at scale — traffic analysis exploited it routinely. | Codebook capture; low-entropy grids cracked by traffic analysis |
| [Solitaire / Pontifex](https://ciphermuseum.com/ciphers/solitaire.html) | Modern · 1999 | Solitaire / Pontifex (1999) — Bruce Schneier's hand cipher driven by a 54-card deck (written for Cryptonomicon). Crowley showed a ~1/22.5 keystream bias. | Small biases found in card-deck keystream (Cryptologia analysis) |
| [Somerton Man Code](https://ciphermuseum.com/ciphers/somerton-man.html) | Post-WWII Australia · 1948 | An unidentified man found dead on an Adelaide beach in 1948 with the word 'Tamám Shud' in his pocket — and a page of letters that may or may not be a cipher. | Body and torn scrap remain unidentified; code unsolved |
| [Stager Cipher](https://ciphermuseum.com/ciphers/stager.html) | Union · 1861 | Stager cipher (1861) — Anson Stager's Union Army route cipher that transposes whole words and salts them with code names. Never broken in the Civil War. | Route transposition; Union operators knew the word lists from captures |
| [Station HYPO — Pearl Harbor to Midway](https://ciphermuseum.com/ciphers/station-hypo.html) | WWII · 1940–1942 | Station HYPO at Pearl Harbor was the US Navy signals intelligence unit that broke JN-25 in 1942 and gave Admiral Nimitz advance warning of the Japanese fleet's target at Midway — turning the tide of the Pacific War. | N/A — historical context page |
| [Straddling Checkerboard](https://ciphermuseum.com/ciphers/straddling-checkerboard.html) | Late 19th – 20th Century | Straddling Checkerboard (1930s) — the Soviet variable-length digit substitution: common letters get one digit, rare letters two. The substitution layer of VIC. | Frequency analysis on the variable-length codegroups |
| [Tap Code](https://ciphermuseum.com/ciphers/tap-code.html) | Korean War · Vietnam War | Tap Code (1965) — the 5x5 Polybius square tapped through walls as row-then-column knocks. Used by US POWs in the Hanoi Hilton during the Vietnam War. | Pattern recognition; 5×5 grid trivially recoverable |
| [Trifid Cipher](https://ciphermuseum.com/ciphers/trifid.html) | 1902 | Trifid cipher (1902) — Felix Delastelle's three-dimensional 3x3x3 extension of the Bifid that fractionates letters into trits and shuffles them across a period. | Period detection + trigraph frequency on the fractionated output |
| [Trithemius Progressive Cipher Steganographia · 1518](https://ciphermuseum.com/ciphers/trithemius.html) | German Renaissance · 1518 | Johannes Trithemius's progressive shift cipher (Polygraphia, 1518) — the first published polyalphabetic, where every successive letter is shifted one further than the last. | IC test reveals the progressive-shift period; then frequency |
| [Two-Square Cipher](https://ciphermuseum.com/ciphers/two-square.html) | Late 19th Century · ~1902 | Two-Square cipher (late 19th c.) — a lighter Delastelle variant using only two keyed 5x5 squares. Many digrams self-encode, leaking the key squares. | Digraph frequency; weaker than Playfair due to shared alpha structure |
| [Typex](https://ciphermuseum.com/ciphers/typex.html) | WWII · 1937 | Typex (1937) — Britain's improved Enigma — five rotors, no plugboard, used at Bletchley to read its own intercepts. Hall VII of The Cipher Museum. | Never broken by Axis powers; retired before any practical attack |
| [VENONA Project](https://ciphermuseum.com/ciphers/venona.html) | Cold War · 1943–1980 | VENONA (1943–1980) was the US Army codebreaking effort that decrypted thousands of Soviet intelligence cables by exploiting key reuse in one-time pads — revealing Julius Rosenberg, Kim Philby, and the Cambridge Five. | OTP key reuse (Feklisov/Philby-era pads); broken 1948–70s |
| [Vernam Cipher](https://ciphermuseum.com/ciphers/vernam.html) | 1917 | Vernam cipher (1917) — Gilbert Vernam's AT&T XOR teleprinter patent, the direct ancestor of the One-Time Pad and every modern stream cipher including ChaCha20. | Secure when key is truly random and used once (Shannon-proven) |
| [VIC Cipher](https://ciphermuseum.com/ciphers/vic.html) | Cold War · 1950s | VIC cipher (1953) — Reino Häyhänen's KGB hand cipher: straddling checkerboard, double transposition, date-driven keystream. Broken in 1957 after his defection. | Probable-word + straddling-checkerboard depth attack (NSA 1953) |
| [Vietnamese Underground Codes](https://ciphermuseum.com/ciphers/vietnamese-underground.html) | Modern · 1940s–1975 | The Viet Minh and NLF used a system of keyed monoalphabetic substitution and prearranged signal codes during the Indochina and Vietnam Wars (1940s–1975). | Codebook capture + traffic analysis by US/ARVN signals units |
| [Vigenère Cipher](https://ciphermuseum.com/ciphers/vigenere.html) | Renaissance · 1553 | Vigenère cipher (1553) — the polyalphabetic shift driven by a repeating keyword, called le chiffre indéchiffrable for 300 years. Broken by Kasiski in 1863. | Kasiski examination (1863): repeated trigrams reveal key length |
| [The Voynich Manuscript](https://ciphermuseum.com/ciphers/voynich.html) | Early 15th c. · Carbon-dated 1404–1438 | Voynich Manuscript (~1400s) — a 240-page illustrated codex in an unknown script (Beinecke MS 408). Has resisted cipher and linguistic analysis for 600 years. | Undeciphered; language/encoding system unknown |
| [Wallis Ciphers John Wallis & the English Civil War · 1640s](https://ciphermuseum.com/ciphers/wallis-ciphers.html) | English Civil War · 1642–1651 | John Wallis of Oxford broke Royalist nomenclators for Parliament during the English Civil War, then served every English government for 50 years. Originator of professional English state cryptanalysis. | Frequency analysis; John Wallis broke several for Charles II |
| [Wheatstone Cryptograph A clock-face polyalphabetic · 1867](https://ciphermuseum.com/ciphers/wheatstone.html) | Victorian London · 1867 | Charles Wheatstone's 1867 cryptograph — two geared clock dials whose hands sweep an outer plain alphabet and an inner mixed alphabet, generating a polyalphabetic ciphertext one click at a time. | IC + period test; closely related to Playfair family |
| [Zimmermann Telegram German codes 0075 / 13040 · 1917](https://ciphermuseum.com/ciphers/zimmermann.html) | WWI · January 1917 | The decoded German telegram of January 1917 that brought the United States into WWI. A two-stage codebook cipher (0075 then 13040), broken by Britain’s Room 40 and surfaced through one of history’s most consequential intelligence operations. | British Room 40 broke it; 3DES codebook + frequency attack |
| [Zodiac Cipher](https://ciphermuseum.com/ciphers/zodiac.html) | 1969 · Solved 2020 | Zodiac killer ciphers (1969) — homophonic substitution as in Z-408 (broken in 1969 by the Hardens) and Z-340 (broken in 2020 by Oranchak, Eaker, Blankenship). | Z408 solved by Hardens (1969); Z13, Z32, Z340 remain unsolved |

---

## 🚀 Running Locally

```bash
git clone https://github.com/systemslibrarian/cipher-museum
cd cipher-museum
python3 -m http.server 8000   # or just open index.html
```

No build tools. No framework. No dependencies beyond Google Fonts.
Pure HTML + CSS + Vanilla JavaScript. GitHub Pages ready.

---

## Corpus Data (Git LFS)

The cipher corpus files are stored via [Git Large File Storage (LFS)](https://git-lfs.github.com/)
due to their size. To access them after cloning:

### Prerequisites
```bash
git lfs install
```

### Clone with LFS files
```bash
git clone https://github.com/systemslibrarian/cipher-museum
```
LFS files download automatically if Git LFS is installed.

### If you already cloned without LFS
```bash
git lfs pull
```

### Corpus Files

| File | Size | Description |
|------|------|-------------|
| [`public/corpus/all.json`](https://github.com/systemslibrarian/cipher-museum/blob/main/public/corpus/all.json) | 125 MB | Full cipher corpus (JSON) |
| [`public/corpus/all.jsonl`](https://github.com/systemslibrarian/cipher-museum/blob/main/public/corpus/all.jsonl) | 98 MB | Full cipher corpus (JSONL, for RAG ingestion) |

> These files are intended for use with the
> [crypto-counsel](https://github.com/systemslibrarian/crypto-counsel)
> RAG pipeline (LlamaIndex + ChromaDB).

---

## 📁 Project Structure

```
cipher-museum/
├── index.html               ← Entrance Hall (hero + 10 hall cards)
├── museum-map.html          ← Interactive floor plan with all exhibits
├── timeline.html            ← 3,900+ year timeline with era filtering & scroll-spy
├── comparison.html          ← Sortable comparison table across the collection
├── challenges.html          ← 10 progressive cipher challenges
├── glossary.html            ← Cryptography glossary
├── cryptanalysis.html       ← Cryptanalysis Techniques (10 interactive techniques)
├── cipher-flow.html         ← Visual cipher family relationships
├── modern.html              ← Modern Cryptography overview
├── favicon.svg              ← Gold cipher wheel icon
├── css/
│   └── museum.css           ← Complete design system (~400 rules)
├── js/
│   ├── nav.js               ← Navigation system (sticky nav, hamburger, ARIA)
│   ├── demo-loader.js       ← Dynamic demo UI generator for all cipher pages
│   └── ciphers/
│       └── all-engines.js   ← 84 cipher engine implementations
├── halls/                   ← 13 exhibit halls
│   ├── ancient.html          ← Hall I: World Origins of Cryptography
│   ├── substitution.html     ← Hall II: Classical Substitution
│   ├── polyalphabetic.html   ← Hall III: Polyalphabetic Revolution
│   ├── transposition.html    ← Hall IV: Transposition & Fractionation
│   ├── military.html         ← Hall V: Military & Spy Ciphers
│   ├── civil-war.html        ← Special Exhibition: Civil War
│   ├── machines.html         ← Hall VI: Mechanical Machines
│   ├── puzzle.html           ← Hall VII: Puzzle & Novelty
│   ├── unbreakable.html      ← Hall IX: The Unbreakable
│   └── codebreakers.html     ← Special Exhibition: Hall of Codebreakers
├── ciphers/                  ← 140 exhibit pages
│   ├── caesar.html            ← with interactive demo + SVG wheel diagram
│   ├── enigma.html            ← with rotor wiring SVG diagram
│   ├── vigenere.html          ← with tabula recta SVG + Kasiski analysis
│   ├── playfair.html          ← with key square builder SVG
│   └── [130+ additional exhibits]
├── data/
│   └── artifact-cards.json  ← Metadata cards (era, family, region, key type…) for all 140 exhibits
├── scripts/                  ← Corpus tools and cryptanalysis solvers
│   ├── hill-climbing-solver.js  ← Monoalphabetic solver: hill climbing + quadgram scoring
│   ├── sa-solver.js             ← Simulated annealing solver (better on short ciphertexts)
│   ├── build-quadgrams.js       ← Regenerates quadgram stats from corpus plaintext
│   ├── qa-corpus.js             ← DEPRECATED corpus QA (superseded by tests/engines/corpus-replay.js)
│   ├── generate-corpus-v*.js    ← Corpus generation batch scripts (v1–v3)
│   └── data/
│       └── english-quadgrams.json  ← 8,877 quadgram log-probabilities (896K observations)
├── lab/
│   └── workbench.html       ← Codebreaker's Workbench (all 84 engines in one lab)
├── tours/                    ← Guided learning paths
├── community/                ← Community discussion and write-up space
└── tests/
    ├── engines/               ← Engine verification suite (per-engine specs, KATs, corpus replay)
    │   ├── run.js             ← Master runner for `npm run test:engines`
    │   ├── specs/             ← One spec file per engine (84): fast-check properties + robustness
    │   ├── helpers/           ← Shared contracts, canonicalization, known-answer registry
    │   └── corpus-replay.js   ← Pinned replay of all 100,026 published corpus records
    ├── test-all-engines.js    ← Engine roundtrip & known-answer tests
    ├── test-deep-ciphers.js   ← Edge cases & stress tests
    ├── test-comprehensive.js  ← Cross-cipher invariants across the collection
    ├── test-accessibility.js  ← ADA / WCAG audit
    ├── test-mobile.js         ← Responsive / mobile audit
    ├── test-structural.js     ← Structural / framing audit
    ├── test-demo-pages.js     ← End-to-end JSDOM simulation of every interactive demo
    ├── test-exhibit-examples.js ← Every hardcoded exhibit example pinned against the engines
    ├── test-sw-version.js     ← Service-worker cache version matches bundle hashes
    └── test-local-links.js    ← Local href/src link checker
```

---

## 🎨 Design System

| Element | Value |
|---------|-------|
| **Aesthetic** | Smithsonian Dark / Scholarly Gold |
| **Display** | Cinzel (serif) |
| **Body** | Cormorant Garamond (serif) |
| **Code** | JetBrains Mono (monospace) |
| **Background** | `#060608` with subtle radial gold gradients |
| **Accent** | `#C9A84C` (gold) with 6 tonal variants |
| **Text** | `#EDE5D4` (headings), `#C8C0B0` (body), `#ACA4B4` (labels) |

### Accessibility

- WCAG AA contrast ratios on all text
- Skip links on every page
- ARIA labels on navigation, demos, and interactive elements
- 44px minimum touch targets on all interactive elements
- `prefers-reduced-motion` support
- Keyboard navigation throughout
- `aria-hidden` on decorative SVGs

### SEO

- Unique meta descriptions on every page
- Open Graph + Twitter cards
- Canonical URLs
- XML sitemap (176 pages)
- Structured data (JSON-LD)
- Custom 404 page

---

## 🧪 Testing

The museum ships with two layers of tests, **all green**: the site suites (rendered DOM, accessibility, links, demo pages) and a dedicated engine verification suite governed by [docs/CIPHER_ENGINE_STANDARD.md](docs/CIPHER_ENGINE_STANDARD.md).

```bash
# One-time setup (needed for the demo-page simulator and fast-check)
npm install

# Engine verification suite — 84 per-engine spec files (fast-check property
# roundtrips, robustness, invalid keys, Unicode policy, state isolation, one
# fixed KAT each), the legacy KAT suites, full Enigma vectors, and a pinned
# replay of all 100,026 published corpus records (0 unexplained failures):
npm run test:engines                # tests/engines/run.js

# Run any site suite individually …
node tests/test-all-engines.js      # 443 — engine roundtrip & known-answer tests across 84 engines
node tests/test-deep-ciphers.js     # 238 — edge cases & stress tests
node tests/test-comprehensive.js    # 1848 — cross-cipher invariants across the collection
node tests/test-accessibility.js    # 1760 — ADA / WCAG audit across 176 pages
node tests/test-mobile.js           #  531 — responsive / mobile audit across 176 pages
node tests/test-structural.js       # 1773 — structural / framing audit across 176 pages
node tests/test-demo-pages.js       #  789 — end-to-end JSDOM simulation of every interactive demo
node tests/test-local-links.js      # 4945 — local href/src link checker across 176 HTML files
node tests/test-exhibit-examples.js #   60 — every hardcoded exhibit example verified against the engines
node tests/test-sw-version.js       #    1 — service-worker cache version derived from bundle hashes

# … or via npm scripts
npm run test:deep
npm run test:comprehensive
npm run test:a11y
npm run test:mobile
npm run test:structural
npm run test:demos
npm run test:links
npm test                            # runs every site suite end-to-end (CI runs test:engines first)
```

`test-demo-pages.js` is the strongest correctness proof: it loads every `ciphers/*.html` page in JSDOM with the real scripts inlined, lets `js/demo-loader.js` build the demo UI, then **clicks the actual on-page Encrypt and Decrypt buttons** and verifies the ciphertext roundtrips back to the original plaintext through the rendered DOM — exactly what a visitor sees. Hand-built pages (Caesar, Playfair, Vigenère, Zodiac) get dedicated assertions against canonical KATs (Caesar shift-3 → `WKHTXLFNEURZQIRA`, Vigenère `LEMON` → `LXFOPVEFRNHR`, Playfair `MONARCHY` decode, Zodiac Z408 reveal).

---

## 📜 License

MIT License — free to use, fork, and build upon.

---

*Built to honor the brilliant, flawed, and often fatal history of human secrecy.*
