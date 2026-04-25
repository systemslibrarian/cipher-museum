# 🏛️ The Cipher Museum

> *"The heart of the discerning acquires knowledge, for the ears of the wise seek it out."* — Proverbs 18:15

Exploring 3,900+ years of encryption, cryptanalysis, and hidden history.

The Cipher Museum is part digital exhibit, part cipher playground, and part codebreaking classroom exploring **3,900+ years** of encryption, cryptanalysis, and hidden history across **139 exhibits** and **13 exhibit halls**. Every cipher exhibit ships with a fully interactive encrypt/decrypt demo (or, for unsolved and visualization-only exhibits, a hand-built widget). Modern cryptography uses more than ciphers — secure systems combine key exchange, encryption, and hashing.

**[Live Site →](https://ciphermuseum.com)**

---

## 📰 Latest Update

- Added a premium six-stage cryptography evolution strip to [timeline.html](timeline.html), positioned above the historical event timeline.
- Sequence is explicit and ordered: Ancient → Classical → Mechanical → Modern → Symmetric (AES) → Asymmetric (Public-Key).
- Implemented mathematically even horizontal spacing, straight directional connectors, and clear arrowheads.
- Enforced strict two-line node labels, including exact wording for:
    - AES / Modern Symmetric Encryption
    - Public-Key Cryptography / Asymmetric Encryption
- Standardized icon style using consistent inline SVG sizing and stroke weight.
- Added subtle exhibit-style glow, responsive mobile behavior, and reduced-motion support.

---

## ✨ Features

### 🗺️ Thirteen Exhibit Halls · 139 Exhibits

| Hall | Title | Ciphers |
|------|-------|---------|
| [I](halls/ancient.html) | World Origins of Cryptography | [Egyptian Substitution](ciphers/egyptian-substitution.html), [Rosetta Stone](ciphers/rosetta-stone.html), [Histiaeus's Tattoo](ciphers/histiaeus-tattoo.html), [Scytale](ciphers/scytale.html), [Aeneas Tacticus](ciphers/aeneas-tacticus.html), [Caesar](ciphers/caesar.html), [Atbash](ciphers/atbash.html), [Kama Sutra](ciphers/kama-sutra.html), [Polybius](ciphers/polybius.html), [Arabic Nomenclators](ciphers/arabic-nomenclators.html), [ROT13](ciphers/rot13.html) |
| [II](halls/substitution.html) | Classical Substitution | [Monoalphabetic](ciphers/monoalphabetic.html), [Nomenclator](ciphers/nomenclator.html), [Babington](ciphers/babington.html), [Homophonic](ciphers/homophonic.html), [Great Cipher](ciphers/great-cipher.html), [Playfair](ciphers/playfair.html), [Four-Square](ciphers/four-square.html), [Two-Square](ciphers/two-square.html), [Hill](ciphers/hill.html) |
| [III](halls/polyalphabetic.html) | Polyalphabetic Revolution | [Alberti Disk](ciphers/alberti-disk.html), [Vigenère](ciphers/vigenere.html), [Porta](ciphers/porta.html), [Gronsfeld](ciphers/gronsfeld.html), [Beaufort](ciphers/beaufort.html), [Running Key](ciphers/running-key.html), [Autokey](ciphers/autokey.html) |
| [IV](halls/transposition.html) | Transposition & Fractionation | [Rail Fence](ciphers/rail-fence.html), [Columnar](ciphers/columnar.html), [Double Transposition](ciphers/double-transposition.html), [Bifid](ciphers/bifid.html), [Trifid](ciphers/trifid.html), [ADFGX](ciphers/adfgx.html), [ADFGVX](ciphers/adfgvx.html), [Fractionated Morse](ciphers/fractionated-morse.html) |
| [V](halls/military.html) | Military & Spy Ciphers | [Nihilist](ciphers/nihilist.html), [Bazeries](ciphers/bazeries.html), [VIC](ciphers/vic.html), [Straddling Checkerboard](ciphers/straddling-checkerboard.html), [Book Cipher](ciphers/book-cipher.html) |
| [VI](halls/civil-war.html) | Civil War Gallery | [Stager](ciphers/stager.html), [Confederate Vigenère](ciphers/confederate-vigenere.html), [Dictionary Code](ciphers/dictionary-code.html) |
| [VII](halls/machines.html) | Mechanical Cipher Machines | [Jefferson Disk](ciphers/jefferson-disk.html), [Chaocipher](ciphers/chaocipher.html), [Enigma](ciphers/enigma.html), [M-209](ciphers/m209.html), [Lorenz](ciphers/lorenz.html), [Purple](ciphers/purple.html), [SIGABA](ciphers/sigaba.html), [Typex](ciphers/typex.html), [Navajo Code Talkers](ciphers/navajo-code-talkers.html) |
| [VIII](halls/puzzle.html) | Puzzle & Novelty Ciphers | [Pigpen](ciphers/pigpen.html), [Bacon](ciphers/bacon.html), [Tap Code](ciphers/tap-code.html), [Copiale](ciphers/copiale.html), [Beale](ciphers/beale.html), [Voynich](ciphers/voynich.html), [Dorabella](ciphers/dorabella.html), [Zodiac](ciphers/zodiac.html), [Kryptos](ciphers/kryptos.html) |
| [IX](halls/unbreakable.html) | The Unbreakable | [One-Time Pad](ciphers/one-time-pad.html), [Vernam](ciphers/vernam.html), [Solitaire / Pontifex](ciphers/solitaire.html) |
| [X](halls/codebreakers.html) | Hall of Codebreakers | 21 biographies — from Al-Kindi (c. 850) through Turing, Rejewski, Tutte, Friedman, Clarke, Driscoll, Marks to the 2011 Copiale team |
| [XI](halls/modern-crypto.html) | Modern Cryptography | [DES](ciphers/des.html), [Diffie-Hellman](ciphers/diffie-hellman.html), [RSA](ciphers/rsa.html), [AES](ciphers/aes.html), [SHA-256](ciphers/sha256.html) |
| [XII](halls/unsolved.html) | Unsolved Ciphers | [Voynich](ciphers/voynich.html), [Kryptos](ciphers/kryptos.html), [Beale](ciphers/beale.html), [Dorabella](ciphers/dorabella.html), [Zodiac Z-13/Z-32](ciphers/zodiac.html), Phaistos Disc, Shugborough, D'Agapeyeff, Somerton Man, McCormick |
| [XIII](halls/culture.html) | Cipher Culture | Bach's BACH motif, Conan Doyle's Dancing Men, Poe's Gold-Bug, Cicada 3301, ARG ciphers, MIT Mystery Hunt, Sator Square, Freemason pigpen tradition |

### 🔐 Every Exhibit Follows Four-Part Structure

1. **Historical Context** — When, where, who used it, why
2. **How It Works** — Encryption steps, diagrams, interactive demo
3. **How It Was Broken** — The specific technique, with context
4. **What It Teaches Modern Crypto** — The direct line from this cipher to AES/RSA

### 🎯 62 Interactive Demos

All 62 cipher pages with engines have fully interactive encrypt/decrypt demos built with vanilla JavaScript — no frameworks, no build tools. (The Dorabella exhibit is included as the 63rd cipher but has no demo — it remains unsolved.) Type a message, set a key, and watch the cipher work in real time. Demos are dynamically generated by [js/demo-loader.js](js/demo-loader.js) from cipher engine implementations in [js/ciphers/all-engines.js](js/ciphers/all-engines.js).

**Complete demo roster:**

Each row gives the year the cipher was first known/published and when it was broken (or how, if not). "—" means broken at any time by trivial inspection.

| Cipher | Created | Broken | What the demo does |
|--------|---------|--------|--------------------|
| [ADFGVX](ciphers/adfgvx.html) | June 1918 (Germany) | June 1918 (Painvin, "Radiogram of Victory") | The 36-character upgrade adding digits — broken by Painvin under wartime deadline. |
| [ADFGX](ciphers/adfgx.html) | March 1918 (Germany) | June 1918 (Painvin) | Polybius with letters A/D/F/G/X followed by a keyed columnar transposition. |
| [Alberti Disk](ciphers/alberti-disk.html) | 1467 (Alberti) | by ~1900 (frequency analysis on each disk setting once turn-points are known) | Rotating cipher-disk demo — shift the inner ring mid-message to switch alphabets. |
| [Atbash](ciphers/atbash.html) | ~600 BC | trivial — single fixed substitution; one frequency pass or recognising A↔Z reveals it | Reverses the alphabet (A↔Z, B↔Y…). Self-inverse — the same operation encrypts and decrypts. |
| [Babington](ciphers/babington.html) | 1586 | 1586 (Phelippes, same year) | Reenacts the 1586 nomenclator that condemned Mary, Queen of Scots; includes Phelippes's "doubleth" forgery trap. |
| [Bacon](ciphers/bacon.html) | 1605 (Francis Bacon) | broken on sight once the two-typeface (a/b) carrier is noticed — the 5-bit code itself is fixed and public | Francis Bacon's 5-bit binary code (a/b → letter) — the ancestor of ASCII. |
| [Bazeries](ciphers/bazeries.html) | 1898 (Étienne Bazeries) | early 20th c. (frequency analysis on the Polybius layer once the numeric keyword length is recovered) | Combines a Polybius substitution with a numeric-keyword transposition. |
| [Beale](ciphers/beale.html) | ~1820 | only #2: 1885 (Ward); #1 & #3 unsolved | Book cipher with the Declaration of Independence as the key — replicates the 1885 Beale #2 mechanism. |
| [Beaufort](ciphers/beaufort.html) | 1857 | 1863 Kasiski applies | Reciprocal Vigenère variant where encryption and decryption are the same operation. |
| [Bifid](ciphers/bifid.html) | 1901 (Delastelle) | 20th c. (period detection → fractionated frequency analysis on row/column streams) | Polybius coordinates split, transposed across a period, then recombined. |
| [Caesar](ciphers/caesar.html) | ~58 BC | ~850 AD (Al-Kindi, frequency analysis) | Shifts every letter by a chosen amount (1–25). Includes a brute-force panel showing all 25 shifts at once. |
| [Chaocipher](ciphers/chaocipher.html) | 1918 (J.F. Byrne) | 2010 (Rubin reconstruction after release) | Two 26-letter alphabets that permute themselves after every character — dynamic state cipher. |
| [Columnar](ciphers/columnar.html) | antiquity | column-count search + anagramming (multiple-anagram method, Friedman 1920s) | Writes plaintext into rows under a keyword, then reads columns out in keyword order. |
| [Confederate Vigenère](ciphers/confederate-vigenere.html) | 1861 | 1863 (Tribune cryptanalysts) | The standard Vigenère with the three Confederate keywords ("Manchester Bluff", "Complete Victory", "Come Retribution"). |
| [Copiale](ciphers/copiale.html) | ~1730 | 2011 (Knight, Megyesi, Schaefer) | Homophonic substitution with nulls, drawn from the 18th-century Oculist Order manuscript broken in 2011. |
| [Dictionary Code](ciphers/dictionary-code.html) | 18th–19th c. | depends on the codebook | Looks up words by page/line/word triplets in a shared book — the Civil War book cipher. |
| [Double Transposition](ciphers/double-transposition.html) | WWI | 2013 (Lasry et al., computer hill-climbing) | Applies columnar transposition twice with two different keys — a WWII workhorse. |
| [Enigma](ciphers/enigma.html) | 1923 (Scherbius) | 1932 (Rejewski) → 1939+ (Bletchley) | Three-rotor Wehrmacht Enigma with plugboard, reflector, and stepping; rotor wiring rendered live. |
| [Four-Square](ciphers/four-square.html) | 1902 (Delastelle) | digram frequency analysis (twice the work of Playfair but the same underlying weakness) | Two keyed squares plus two standard ones — disrupts digram frequencies. |
| [Fractionated Morse](ciphers/fractionated-morse.html) | early 1900s | known-plaintext + trigram frequency on the dot/dash/separator stream | Converts text to Morse, regroups dots/dashes/separators in trigrams, then substitutes via a keyed alphabet. |
| [Great Cipher](ciphers/great-cipher.html) | 1626 (Rossignol) | 1893 (Bazeries) | Rossignol nomenclator that maps numbers onto syllables and traps; demo shows the codebook in action. |
| [Gronsfeld](ciphers/gronsfeld.html) | 1655 | 1863 Kasiski (faster, smaller key space) | Vigenère restricted to numeric keys (0–9), making it weaker but field-portable. |
| [Hill](ciphers/hill.html) | 1929 (Lester Hill) | known-plaintext (linear algebra) | Multiplies plaintext blocks by an invertible 2×2 matrix mod 26. |
| [Homophonic](ciphers/homophonic.html) | 1400s (Italian courts) | 17th–19th c. (frequency analysis on the *flattened* code-number distribution — the technique that broke Mary, Queen of Scots in 1586 and Louis XIV's Great Cipher in 1893) | Substitutes each letter with one of several numeric codes, flattening the frequency profile. |
| [Jefferson Disk](ciphers/jefferson-disk.html) | 1795 (Jefferson) | reused as M-94 (1922); broken late 20th c. | 26-disk wheel cipher: line up the plaintext on one row, read ciphertext from another row. |
| [Kryptos](ciphers/kryptos.html) | 1990 (Sanborn, CIA HQ) | K1–K3 solved (1999); K4 unsolved | Solves K1/K2 (keyed Vigenère with PALIMPSEST/ABSCISSA) and K3 (transposition); shows Sanborn's K4 cribs. |
| [Lorenz](ciphers/lorenz.html) | 1940 (Germany) | 1942 (Tutte) / 1944 (Colossus) | SZ40-style XOR stream cipher with two sets of pin-wheels — the cipher Colossus was built to break. |
| [M-209](ciphers/m209.html) | 1940 (Hagelin C-38) | WWII (German breaks) | Hagelin C-38 simulator: six co-prime pin-wheels and a 27-bar lug cage producing a Beaufort shift per character. |
| [Monoalphabetic](ciphers/monoalphabetic.html) | antiquity | ~850 AD (Al-Kindi) | Builds a keyed substitution alphabet from a keyword and applies it to the text. |
| [Navajo Code Talkers](ciphers/navajo-code-talkers.html) | 1942 | never broken | Looks up military vocabulary in the WWII Navajo code dictionary (e.g., "iron fish" = submarine). |
| [Nihilist](ciphers/nihilist.html) | 1880s (Russia) | early 1900s (Polybius + repeating numeric key recovered via Kasiski-style spacing on the additive layer) | Polybius numbers added (mod 100) to a repeating keyword's Polybius numbers — Russian revolutionary classic. |
| [One-Time Pad](ciphers/one-time-pad.html) | 1882 (Miller) / 1917 (Mauborgne) | unbreakable (Shannon 1949 proof) when used correctly | Generates and applies a truly-random key the same length as the message — provably unbreakable. |
| [Pigpen](ciphers/pigpen.html) | ~1700 (Freemasons) | trivial — fixed substitution with a publicly-known glyph table; recognising the grid shapes is the whole break | Geometric substitution: each letter becomes the lines/dots of its grid cell. |
| [Playfair](ciphers/playfair.html) | 1854 (Wheatstone) | WWI (Friedman & others) | Encrypts letter pairs (digrams) using a keyed 5×5 square; live key-square preview. |
| [Polybius](ciphers/polybius.html) | ~150 BC | trivial — each pair of digits is a fixed letter, so the digit-pair frequencies match the plaintext-letter frequencies exactly | Maps each letter to a row/column digit pair on a 5×5 grid. |
| [Porta](ciphers/porta.html) | 1563 (Della Porta) | 1863 Kasiski applies | 13-row reciprocal table — each key letter swaps two halves of the alphabet. |
| [Purple](ciphers/purple.html) | 1939 (Japan, Type 97) | 20 Sept 1940 (Rowlett, Grotjan, SIS) | Pedagogical reproduction of Japan's Type 97 stepping-switch cipher: vowels and consonants encrypt through separate banks before recombining. |
| [Rail Fence](ciphers/rail-fence.html) | antiquity | trivial — brute-force every rail count from 2 to ~10 and pick the readable English output | Zig-zag transposition on N rails; live diagram of the fence. |
| [ROT13](ciphers/rot13.html) | ~1980 (Usenet) | trivial by design — self-inverse Caesar-13, intended as a spoiler obscurer, not a cipher | The self-inverse Caesar (shift 13). One button toggles the text in place. |
| [Running Key](ciphers/running-key.html) | 19th c. | early 20th c. (Friedman) — high-probability-trigram dragging, since both plaintext and key obey English statistics | Vigenère with a long passage of natural text as the key instead of a short word. |
| [Scytale](ciphers/scytale.html) | ~700 BC (Sparta) | trivial — try every rod diameter (column count) and read the readable diagonal | Wraps the message around a virtual rod of N rows; reading down the columns scrambles the order without changing letters. |
| [Solitaire / Pontifex](ciphers/solitaire.html) | 1999 (Schneier, *Cryptonomicon*) | 1999 (Crowley distinguishing attack — keystream output bias ≈ 1/22.5 vs. 1/26 ideal) | Schneier's hand-operated stream cipher driven by a 54-card deck; deck state animates after each step. |
| [Stager](ciphers/stager.html) | 1861 (Anson Stager) | secure during the war | Anson Stager's Union route cipher — transposes whole words and salts them with code names. |
| [Straddling Checkerboard](ciphers/straddling-checkerboard.html) | 1930s (Soviet) | digit-frequency analysis (the eight common letters get one digit each, so single-digit frequencies match high-frequency English letters) | Common letters get one digit, rare letters two — variable-length codes from a fixed alphabet. |
| [Tap Code](ciphers/tap-code.html) | 1965 (Hanoi Hilton POWs) | POW use only | 5×5 Polybius square tapped as row-then-column knocks — used by POWs in Vietnam. |
| [Trifid](ciphers/trifid.html) | 1902 (Delastelle) | 20th c. — hill-climbing on the 27-symbol alphabet plus period detection on the trit stream | 3D Polybius (3×3×3 cube) — fractionates into trits and shuffles them across a period. |
| [Two-Square](ciphers/two-square.html) | late 19th c. | digram frequency analysis (only two squares means many digrams encode to themselves, leaking the key squares) | Lighter Delastelle variant with only two squares (horizontal or vertical orientation). |
| [Vernam](ciphers/vernam.html) | 1917 (Gilbert Vernam, AT&T) | unbreakable if the tape is one-time | XOR of plaintext with a key tape — the original teleprinter stream cipher. |
| [VIC](ciphers/vic.html) | 1953 (KGB) | 1957 (Häyhänen defection) | Reino Häyhänen's KGB hand cipher: straddling checkerboard + double transposition + date-driven keystream. |
| [Vigenère](ciphers/vigenere.html) | 1553 (Bellaso/Vigenère) | 1854 Babbage (private) · 1863 Kasiski | Polyalphabetic shift driven by a repeating keyword; live tabula-recta lookup and Kasiski hint panel. |
| [Voynich](ciphers/voynich.html) | ~1400s | unsolved | Reversible EVA-glyph round-tripper for the unsolved manuscript; emphasizes that no plaintext mapping is known. |
| [Zodiac](ciphers/zodiac.html) | 1969 | Z408: 1969 (Hardens) · Z340: 2020 (Oranchak/Eaker/Blankenship) | Homophonic substitution as used in Z-408 and Z-340; demonstrates the 2020 diagonal-transposition reveal. |

### 📊 Additional Tools

- **[Codebreaker's Workbench](lab/workbench.html)** — A unified hands-on lab that exposes **all 83 cipher engines** behind one consistent interface. Pick any cipher from the dropdown, paste your text, set a key (or accept the default), and encrypt/decrypt instantly. Beyond the per-exhibit demos it adds:
    - **Frequency analyser** — letter-frequency histogram with Index of Coincidence and Chi-square against English, useful for detecting monoalphabetic vs. polyalphabetic ciphertext at a glance.
    - **Kasiski / period detector** — repeated-trigram spacing analysis for breaking Vigenère-family ciphers.
    - **N-gram & entropy panel** — bigram/trigram counts and Shannon entropy for distinguishing transposition (preserves frequencies) from substitution (alters them).
    - **Side-by-side Encrypt/Decrypt panes** with copy-to-clipboard and a swap button so you can iterate on a key without retyping ciphertext.
    - **Same engine source as the exhibits** — the workbench pulls from [js/ciphers/all-engines.js](js/ciphers/all-engines.js), so anything you reproduce here matches every demo on the site.
- **[Site Search](search.html)** — Search across all 139 exhibits, 13 exhibit halls, codebreaker biographies, cryptanalysis techniques, and the timeline. Index-driven, no backend, deep-link via `?q=`.
- **[Cryptanalysis Techniques](cryptanalysis.html)** — 10 interactive techniques: frequency analysis, Kasiski examination, index of coincidence, crib dragging, known-plaintext attack, hill climbing, simulated annealing, stepping-switch cryptanalysis (Purple), HMM/SMT decoding (Copiale), and Chaocipher reconstruction.
- **[Cipher Challenges](challenges.html)** — 10 progressive puzzles from Caesar to Enigma with hints and solutions.
- **[Timeline](timeline.html)** — Interactive 3,900+-year history with era filtering, scroll-spy, and 50+ clickable exhibit events.
- **[Comparison Table](comparison.html)** — Sortable, filterable table comparing the museum collection by type, era, hall, security level, solved status, and key method.
- **[Cipher Flow Explorer](cipher-flow.html)** — Visual relationship map between cipher families.
- **[Museum Map](museum-map.html)** — Architectural floor plan with all exhibit halls and cipher exhibits.
- **[Guided Tours](tours/index.html)** — Structured learning paths through the collection.
- **[Glossary](glossary.html)** — Comprehensive cryptography term reference.
- **[Further Reading](further-reading.html)** — Canon references, journals, and scholar/source index.
- **[Community](community/index.html)** — Discussion space for cipher enthusiasts.

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

## 📁 Project Structure

```
cipher-museum/
├── index.html               ← Entrance Hall (hero + 10 hall cards)
├── museum-map.html          ← Interactive floor plan with all exhibits
├── timeline.html            ← 2,400-year timeline with era filtering & scroll-spy
├── comparison.html          ← Sortable comparison table across the collection
├── challenges.html          ← 10 progressive cipher challenges
├── glossary.html            ← Cryptography glossary
├── cryptanalysis.html       ← Cryptanalysis Techniques (7 interactive techniques)
├── cipher-flow.html         ← Visual cipher family relationships
├── modern.html              ← Modern Cryptography overview
├── favicon.svg              ← Gold cipher wheel icon
├── css/
│   └── museum.css           ← Complete design system (~400 rules)
├── js/
│   ├── nav.js               ← Navigation system (sticky nav, hamburger, ARIA)
│   ├── demo-loader.js       ← Dynamic demo UI generator for all cipher pages
│   └── ciphers/
│       └── all-engines.js   ← 83 cipher engine implementations
├── halls/                   ← 13 exhibit halls
│   ├── ancient.html          ← Hall I: Birth of Cryptography
│   ├── substitution.html     ← Hall II: Classical Substitution
│   ├── polyalphabetic.html   ← Hall III: Polyalphabetic Revolution
│   ├── transposition.html    ← Hall IV: Transposition & Fractionation
│   ├── military.html         ← Hall V: Military & Spy Ciphers
│   ├── civil-war.html        ← Special Exhibition: Civil War
│   ├── machines.html         ← Hall VI: Mechanical Machines
│   ├── puzzle.html           ← Hall VII: Puzzle & Novelty
│   ├── unbreakable.html      ← Final Hall: The Unbreakable
│   └── codebreakers.html     ← Special Exhibition: Hall of Codebreakers
├── ciphers/                  ← 139 exhibit pages
│   ├── caesar.html            ← with interactive demo + SVG wheel diagram
│   ├── enigma.html            ← with rotor wiring SVG diagram
│   ├── vigenere.html          ← with tabula recta SVG + Kasiski analysis
│   ├── playfair.html          ← with key square builder SVG
│   └── [130+ additional exhibits]
├── tours/                    ← Guided learning paths
├── community/                ← Community discussion pages
└── tests/
    ├── test-all-engines.js    ← Engine roundtrip & known-answer tests
    └── test-deep-ciphers.js   ← Edge cases & stress tests
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
- XML sitemap (54+ pages)
- Structured data (JSON-LD)
- Custom 404 page

---

## 🧪 Testing

The museum ships with **six test harnesses — 2,298 assertions, all green.** They cover everything from the cipher engines themselves to the rendered DOM a visitor actually clicks on.

```bash
# One-time setup (only needed for the demo-page simulator)
npm install

# Run any suite individually …
node tests/test-all-engines.js      # 309 — engine roundtrip & known-answer tests
node tests/test-deep-ciphers.js     # 238 — edge cases & stress tests
node tests/test-comprehensive.js    # 417 — cross-cipher invariants
node tests/test-accessibility.js    # 790 — ADA / WCAG audit across 79 pages
node tests/test-mobile.js           # 240 — responsive / mobile audit across 79 pages
node tests/test-demo-pages.js       # 304 — end-to-end JSDOM simulation of every interactive demo

# … or via npm scripts
npm run test:engines
npm run test:deep
npm run test:comprehensive
npm run test:a11y
npm run test:mobile
npm run test:demos
npm test                            # runs the engine + deep + comprehensive trio
```

`test-demo-pages.js` is the strongest correctness proof: it loads every `ciphers/*.html` page in JSDOM with the real scripts inlined, lets `js/demo-loader.js` build the demo UI, then **clicks the actual on-page Encrypt and Decrypt buttons** and verifies the ciphertext roundtrips back to the original plaintext through the rendered DOM — exactly what a visitor sees. Hand-built pages (Caesar, Playfair, Vigenère, Zodiac) get dedicated assertions against canonical KATs (Caesar shift-3 → `WKHTXLFNEURZQIRA`, Vigenère `LEMON` → `LXFOPVEFRNHR`, Playfair `MONARCHY` decode, Zodiac Z408 reveal).

---

## 📜 License

MIT License — free to use, fork, and build upon.

---

*Built to honor the brilliant, flawed, and often fatal history of human secrecy.*
