# 🏛️ The Cipher Museum

> *"The heart of the discerning acquires knowledge, for the ears of the wise seek it out."* — Proverbs 18:15

An open-source, interactive educational website exploring 33 historically important ciphers — from Polybius's torch signals in 150 BC to Cold War spy tradecraft.

**[Live Site](https://systemslibrarian.github.io/cipher-museum)**

---

## 🗺️ Nine Exhibit Halls · 33 Ciphers

| Hall | Title | Ciphers |
|------|-------|---------|
| I | Birth of Cryptography | Caesar, Polybius |
| II | Classical Substitution | Monoalphabetic, Homophonic, Playfair, Hill |
| III | Polyalphabetic Revolution | Vigenère, Beaufort, Porta, Gronsfeld, Running Key |
| IV | Transposition & Fractionation | Rail Fence, Columnar, Double Transposition, Bifid, Trifid, Fractionated Morse |
| V | Military & Spy Ciphers | Nihilist, ADFGX, ADFGVX, Bazeries, VIC |
| ⚔ | Civil War Gallery | Stager, Confederate Vigenère, Dictionary Code |
| VI | Mechanical Cipher Machines | Alberti Disk, Jefferson Disk, Enigma, Lorenz |
| VII | Puzzle & Novelty Ciphers | Pigpen, Bacon's Cipher, Tap Code |
| ★ | The Unbreakable & the Modern | One-Time Pad, Modern Crypto |

Plus: **Cryptanalysis Lab** — 7 techniques, 12 famous codebreaks, interactive demos.

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
open index.html
```

No build tools. No framework. No dependencies beyond Google Fonts.  
Pure HTML + CSS + Vanilla JavaScript. GitHub Pages ready.

---

## 📁 File Structure

```
cipher-museum/
├── index.html              ← Entrance Hall
├── museum-map.html         ← Visual site map + 33-cipher index  
├── cryptanalysis.html      ← Cryptanalysis Lab
├── modern.html             ← Modern Cryptography
├── css/museum.css          ← Complete design system
├── js/ciphers/
│   ├── caesar.js
│   └── cipher-engines.js   ← Vigenère, Rail Fence, Columnar
├── halls/
│   ├── ancient.html        ← Hall I
│   ├── substitution.html   ← Hall II
│   ├── polyalphabetic.html ← Hall III
│   ├── transposition.html  ← Hall IV
│   ├── military.html       ← Hall V
│   ├── civil-war.html      ← Special Exhibition
│   ├── machines.html       ← Hall VI
│   ├── puzzle.html         ← Hall VII
│   └── unbreakable.html    ← Final Hall
└── ciphers/
    ├── caesar.html         ← Full interactive demo
    ├── vigenere.html       ← Full interactive demo + Kasiski tool
    ├── playfair.html       ← Full interactive demo
    └── [30 more exhibits]
```

---

## 🎨 Design

- **Aesthetic:** Smithsonian Dark / Scholarly Gold
- **Fonts:** Cinzel (display) · Cormorant Garamond (body) · JetBrains Mono (code)
- **Theme:** Dark backgrounds (#060608) with gold accents (#C9A84C)
- **No external dependencies** beyond Google Fonts

---

## 📜 License

MIT License — free to use, fork, and build upon.

---

*Built to honor the brilliant, flawed, and often fatal history of human secrecy.*
