# 🏛️ The Cipher Museum

> *"The heart of the discerning acquires knowledge, for the ears of the wise seek it out."* — Proverbs 18:15

An open-source, interactive educational website exploring **37 historically important ciphers** across **10 exhibit halls** — from the Spartan scytale in 500 BC to post-quantum cryptography.

**[Live Site](https://ciphermuseum.com)**

---

## 🗺️ Ten Exhibit Halls · 37 Ciphers

| Hall | Title | Ciphers |
|------|-------|---------|
| I | Birth of Cryptography | Scytale, Caesar, Polybius |
| II | Classical Substitution | Monoalphabetic, Homophonic, Playfair, Hill |
| III | Polyalphabetic Revolution | Vigenère, Beaufort, Porta, Gronsfeld, Running Key |
| IV | Transposition & Fractionation | Rail Fence, Columnar, Double Transposition, Bifid, Trifid, Fractionated Morse |
| V | Military & Spy Ciphers | Nihilist, ADFGX, ADFGVX, Bazeries, VIC |
| ⚔ | Civil War Gallery | Stager, Confederate Vigenère, Dictionary Code |
| VI | Mechanical Cipher Machines | Alberti Disk, Jefferson Disk, Enigma, Lorenz, Vernam |
| VII | Puzzle & Novelty Ciphers | Pigpen, Bacon's Cipher, Tap Code, Zodiac |
| ★ | The Unbreakable & the Modern | One-Time Pad, Navajo Code Talkers, Modern Crypto |
| ⚜ | Hall of Codebreakers | 10 stories — from Al-Kindi to the Zodiac solvers |

Plus: **Cryptanalysis Lab** — 7 techniques, 12 famous codebreaks, interactive demos.  
Plus: **Cipher Challenges** — 6 progressive puzzles from Caesar to Enigma.

---

## 🔐 Every Exhibit Follows Four-Part Structure

1. **Historical Context** — When, where, who used it, why
2. **How It Works** — Encryption steps, diagrams, interactive demo (major ciphers)
3. **How It Was Broken** — The specific technique, with context
4. **What It Teaches Modern Crypto** — The direct line from this cipher to AES/RSA

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

## 📁 File Structure

```
cipher-museum/
├── index.html              ← Entrance Hall (hero + 10 hall cards)
├── museum-map.html         ← Visual site map + 37-cipher index
├── timeline.html           ← 2,400-year interactive timeline (clickable era legend)
├── challenges.html         ← 6 progressive cipher challenges
├── glossary.html           ← Cryptography glossary
├── cryptanalysis.html      ← Cryptanalysis Lab (7 techniques + demos)
├── modern.html             ← Modern Cryptography overview
├── favicon.svg             ← Gold cipher wheel icon
├── CNAME                   ← Custom domain (ciphermuseum.com)
├── css/
│   └── museum.css          ← Complete design system (~330 rules)
├── js/
│   ├── demo-loader.js      ← Lazy-loads cipher demos
│   └── ciphers/
│       ├── caesar.js        ← Caesar cipher engine
│       ├── cipher-engines.js← Vigenère, Rail Fence, Columnar engines
│       └── all-engines.js   ← Combined engine bundle
├── images/
│   ├── halls/              ← Hall hero banners (SVG)
│   ├── diagrams/           ← Cipher diagrams
│   └── historical/         ← Historical images
├── halls/                  ← 10 exhibit halls
│   ├── ancient.html         ← Hall I: Birth of Cryptography
│   ├── substitution.html    ← Hall II: Classical Substitution
│   ├── polyalphabetic.html  ← Hall III: Polyalphabetic Revolution
│   ├── transposition.html   ← Hall IV: Transposition & Fractionation
│   ├── military.html        ← Hall V: Military & Spy Ciphers
│   ├── civil-war.html       ← Special Exhibition: Civil War
│   ├── machines.html        ← Hall VI: Mechanical Machines
│   ├── puzzle.html          ← Hall VII: Puzzle & Novelty
│   ├── unbreakable.html     ← Final Hall: Unbreakable & Modern
│   └── codebreakers.html    ← Special Exhibition: Hall of Codebreakers
└── ciphers/                ← 37 cipher exhibit pages
    ├── scytale.html
    ├── caesar.html          ← Full interactive demo
    ├── polybius.html
    ├── vigenere.html        ← Full interactive demo + Kasiski tool
    ├── playfair.html        ← Full interactive demo (key square builder)
    ├── enigma.html
    ├── navajo-code-talkers.html
    ├── zodiac.html
    ├── vernam.html
    └── [28 more exhibits]
├── tests/
│   ├── test-all-engines.js  ← Engine existence, roundtrip, known-answer tests
│   └── test-deep-ciphers.js ← Edge cases, boundaries, stress tests
```

---

## 🎨 Design

- **Aesthetic:** Smithsonian Dark / Scholarly Gold
- **Fonts:** Cinzel (display) · Cormorant Garamond (body) · JetBrains Mono (code)
- **Theme:** Dark backgrounds (#060608) with gold accents (#C9A84C)
- **Accessibility:** WCAG AA contrast ratios, skip links, ARIA labels, keyboard navigation, `prefers-reduced-motion` support
- **No external dependencies** beyond Google Fonts

---

## 📜 License

MIT License — free to use, fork, and build upon.

---

*Built to honor the brilliant, flawed, and often fatal history of human secrecy.*
