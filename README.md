# 🏛️ The Cipher Museum

> *"The heart of the discerning acquires knowledge, for the ears of the wise seek it out."* — Proverbs 18:15

Exploring 3,900+ years of encryption, cryptanalysis, and hidden history.

The Cipher Museum is part digital exhibit, part cipher playground, and part codebreaking classroom exploring **3,900+ years** of encryption, cryptanalysis, and hidden history across **140 exhibits** and **13 exhibit halls**. 110 of the 140 exhibits ship a fully interactive encrypt/decrypt demo or hand-built widget — the remaining 30 are codebreaker biographies and historical context pages. Modern cryptography uses more than ciphers — secure systems combine key exchange, encryption, and hashing.

**[Live Site →](https://ciphermuseum.com)**

---

## 📰 Latest Update

- Added a premium six-stage cryptography evolution strip to [timeline.html](https://ciphermuseum.com/timeline.html), positioned above the historical event timeline.
- Sequence is explicit and ordered: Ancient → Classical → Mechanical → Modern → Symmetric (AES) → Asymmetric (Public-Key).
- Implemented mathematically even horizontal spacing, straight directional connectors, and clear arrowheads.
- Enforced strict two-line node labels, including exact wording for:
    - AES / Modern Symmetric Encryption
    - Public-Key Cryptography / Asymmetric Encryption
- Standardized icon style using consistent inline SVG sizing and stroke weight.
- Added subtle exhibit-style glow, responsive mobile behavior, and reduced-motion support.

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
| [IX](https://ciphermuseum.com/halls/unbreakable.html) | The Unbreakable | [One-Time Pad](https://ciphermuseum.com/ciphers/one-time-pad.html), [Vernam](https://ciphermuseum.com/ciphers/vernam.html), [Solitaire / Pontifex](https://ciphermuseum.com/ciphers/solitaire.html) |
| [X](https://ciphermuseum.com/halls/codebreakers.html) | Hall of Codebreakers | 21 biographies — from Al-Kindi (c. 850) through Turing, Rejewski, Tutte, Friedman, Clarke, Driscoll, Marks to the 2011 Copiale team |
| [XI](https://ciphermuseum.com/halls/modern-crypto.html) | Modern Cryptography | [DES](https://ciphermuseum.com/ciphers/des.html), [Diffie-Hellman](https://ciphermuseum.com/ciphers/diffie-hellman.html), [RSA](https://ciphermuseum.com/ciphers/rsa.html), [AES](https://ciphermuseum.com/ciphers/aes.html), [SHA-256](https://ciphermuseum.com/ciphers/sha256.html) |
| [XII](https://ciphermuseum.com/halls/unsolved.html) | Unsolved Ciphers | [Voynich](https://ciphermuseum.com/ciphers/voynich.html), [Kryptos](https://ciphermuseum.com/ciphers/kryptos.html), [Beale](https://ciphermuseum.com/ciphers/beale.html), [Dorabella](https://ciphermuseum.com/ciphers/dorabella.html), [Zodiac Z-13/Z-32](https://ciphermuseum.com/ciphers/zodiac.html), [Phaistos Disc](https://ciphermuseum.com/ciphers/phaistos-disc.html), [Shugborough](https://ciphermuseum.com/ciphers/shugborough.html), [D'Agapeyeff](https://ciphermuseum.com/ciphers/dagapeyeff.html), [Somerton Man](https://ciphermuseum.com/ciphers/somerton-man.html), [McCormick](https://ciphermuseum.com/ciphers/mccormick.html) |
| [XIII](https://ciphermuseum.com/halls/culture.html) | Cipher Culture | [Bach's BACH motif](https://ciphermuseum.com/ciphers/bach-motif.html), [Conan Doyle's Dancing Men](https://ciphermuseum.com/ciphers/dancing-men.html), [Poe's Gold-Bug](https://ciphermuseum.com/ciphers/gold-bug.html), [Cicada 3301](https://ciphermuseum.com/ciphers/cicada-3301.html), [Krypto ARG](https://ciphermuseum.com/ciphers/krypto-arg.html), [MIT Mystery Hunt](https://ciphermuseum.com/ciphers/mit-mystery-hunt.html), [Sator Square](https://ciphermuseum.com/ciphers/sator-square.html), [Freemason pigpen tradition](https://ciphermuseum.com/ciphers/freemason-pigpen.html), [Da Vinci Code](https://ciphermuseum.com/ciphers/da-vinci-code.html), [National Treasure](https://ciphermuseum.com/ciphers/national-treasure.html), [Gravity Falls](https://ciphermuseum.com/ciphers/gravity-falls.html), [Field Hollers](https://ciphermuseum.com/ciphers/field-hollers.html) |

### 🔐 Every Exhibit Follows Four-Part Structure

1. **Historical Context** — When, where, who used it, why
2. **How It Works** — Encryption steps, diagrams, interactive demo
3. **How It Was Broken** — The specific technique, with context
4. **What It Teaches Modern Crypto** — The direct line from this cipher to AES/RSA

### 🎯 83 Cipher Engines · 110 Interactive Demos

The 140-exhibit collection includes **83 working cipher engines** plus **~27 hand-built widgets** — **110 of the 140 exhibits ship a fully interactive demo**, all built in vanilla JavaScript with no frameworks or build tools. The remaining 30 exhibits are codebreaker biographies, historical context pages (e.g. Cabinet Noir, Bletchley Park figures), and a small number of cipher pages not yet wired with a demo.

Type a message, set a key, and watch the cipher work in real time. Demos are dynamically generated by [js/demo-loader.js](js/demo-loader.js) from the engine implementations in [js/ciphers/all-engines.js](js/ciphers/all-engines.js), and the same engines power the [Codebreaker's Workbench](https://ciphermuseum.com/lab/workbench.html).

For a sortable, filterable view of every cipher system in the museum (era, type, security, hall, solved status, key method) see the [Cipher Comparison Table](https://ciphermuseum.com/comparison.html). For the full 140-exhibit roster including biographies and context pages, see the [Museum Map](https://ciphermuseum.com/museum-map.html).

### 📊 Additional Tools

- **[Codebreaker's Workbench](https://ciphermuseum.com/lab/workbench.html)** — A unified hands-on lab that exposes **all 83 cipher engines** behind one consistent interface. Pick any cipher from the dropdown, paste your text, set a key (or accept the default), and encrypt/decrypt instantly. Beyond the per-exhibit demos it adds:
    - **Frequency analyser** — letter-frequency histogram with Index of Coincidence and Chi-square against English, useful for detecting monoalphabetic vs. polyalphabetic ciphertext at a glance.
    - **Kasiski / period detector** — repeated-trigram spacing analysis for breaking Vigenère-family ciphers.
    - **N-gram & entropy panel** — bigram/trigram counts and Shannon entropy for distinguishing transposition (preserves frequencies) from substitution (alters them).
    - **Side-by-side Encrypt/Decrypt panes** with copy-to-clipboard and a swap button so you can iterate on a key without retyping ciphertext.
    - **Same engine source as the exhibits** — the workbench pulls from [js/ciphers/all-engines.js](js/ciphers/all-engines.js), so anything you reproduce here matches every demo on the site.
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
├── timeline.html            ← 3,900+ year timeline with era filtering & scroll-spy
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

The museum ships with **eight test harnesses, all green.** They cover everything from the cipher engines themselves to the rendered DOM a visitor actually clicks on, plus a local link checker that verifies every relative `href`/`src` resolves.

```bash
# One-time setup (only needed for the demo-page simulator)
npm install

# Run any suite individually …
node tests/test-all-engines.js      # 435 — engine roundtrip & known-answer tests across 83 engines
node tests/test-deep-ciphers.js     # 238 — edge cases & stress tests
node tests/test-comprehensive.js    # 1836 — cross-cipher invariants across the collection
node tests/test-accessibility.js    # 1730 — ADA / WCAG audit across 173 pages
node tests/test-mobile.js           #  522 — responsive / mobile audit across 173 pages
node tests/test-structural.js       # 1734 — structural / framing audit across 173 pages
node tests/test-demo-pages.js       #  777 — end-to-end JSDOM simulation of every interactive demo
node tests/test-local-links.js      # 4897 — local href/src link checker across 173 HTML files

# … or via npm scripts
npm run test:engines
npm run test:deep
npm run test:comprehensive
npm run test:a11y
npm run test:mobile
npm run test:structural
npm run test:demos
npm run test:links
npm test                            # runs every suite end-to-end
```

`test-demo-pages.js` is the strongest correctness proof: it loads every `ciphers/*.html` page in JSDOM with the real scripts inlined, lets `js/demo-loader.js` build the demo UI, then **clicks the actual on-page Encrypt and Decrypt buttons** and verifies the ciphertext roundtrips back to the original plaintext through the rendered DOM — exactly what a visitor sees. Hand-built pages (Caesar, Playfair, Vigenère, Zodiac) get dedicated assertions against canonical KATs (Caesar shift-3 → `WKHTXLFNEURZQIRA`, Vigenère `LEMON` → `LXFOPVEFRNHR`, Playfair `MONARCHY` decode, Zodiac Z408 reveal).

---

## 📜 License

MIT License — free to use, fork, and build upon.

---

*Built to honor the brilliant, flawed, and often fatal history of human secrecy.*
