# Round 3 Todo Tasks — Cipher Museum Global Expansion

**Project:** Expand Cipher Museum from 63 exhibits across 11 halls → ~113 exhibits across 13 halls.
**Repo:** systemslibrarian/cipher-museum · **Live:** https://ciphermuseum.com
**Source of truth:** [docs/worldupdates.md](docs/worldupdates.md) — update after every commit.
**Last sync with worldupdates.md:** 2026-04-24 (Phase 6 East Asia & Telegraphy batch shipped)

---

## Status Snapshot — 76 / 171 (44.4%)

| Phase | Title | Done / Total | Status |
|------:|-------|------------:|--------|
| 0     | Plan & scaffold | 4/4 | ✅ Complete |
| 0.5   | Shipped vs Round 3 audit | 6/6 | ✅ Complete |
| 1     | Hall I: World Origins | 10/10 | ✅ Complete |
| 2     | Hall XII: Unsolved Ciphers | 10/26 | 🟡 In progress |
| 3     | Pacific Theater | 3/3 | ✅ Complete |
| 4     | WWII / Interwar Machines | 6/9 | 🟡 In progress |
| 5     | European Classical Gaps | 5/10 | 🟡 In progress |
| 6     | East Asia & Telegraphy | 4/4 | ✅ Complete |
| 7     | Americana & Cultural | 1/4 | 🟡 In progress |
| 8     | Global Underground Traditions | 0/10 | ⬜ Not started |
| 9     | Hall XIII: Ciphers in Culture | 3/14 | 🟡 In progress |
| 10    | Generic Techniques | 1/5 (3 SKIPPED — already shipped) | 🟡 1/2 active |
| 11    | Context + Modern Foundations | 0/10 | ⬜ Not started |
| 12    | Hall X Biographies | 0/15 (5 SKIPPED — already shipped) | ⬜ 0/10 active |
| 13    | Global Integration | 7/40 | 🟡 In progress |
| 15    | Artifact Cards | 0/8 | ⬜ Not started |
| 16    | Research / Catalog Mode | 0/6 | ⬜ Not started |
| 17    | Cipher Detective | 0/9 | ⬜ Not started |
| 18    | Deploy & Verify | 0/24 | ⬜ Not started |

---

## Active Work

**Currently building:** Phase 6 East Asia & Telegraphy just shipped — 4 exhibits: Chinese Telegraph Code, Zimmermann Telegram, Slidex, Commercial Codebooks. Phase 4 WWII machines (5 exhibits) shipped previously.

Next on deck: Phase 9 (Hall XIII culture: Da Vinci Code, National Treasure, Gravity Falls, Popular Culture Survey) or finish Phase 5 stragglers (Argenti, Wallis, Mary Stuart, Patterson).

Build order within Phase 5 (remaining):
1. ⬜ Argenti Family
2. ⬜ Wallis Ciphers
3. ⬜ Mary Stuart Castelnau Letters (Track B)
4. ⬜ Patterson's Cipher for Jefferson (Track B)
5. ⬜ Morse audio + Voyager / Morse-Cipher side panels

---

## Key Deliverables

### Content Expansion
- ✓ ~45 new cipher exhibits (Track A: encrypt/decrypt engine + demo; Track B: visualization)
- ✓ ~9 new codebreaker biographies
- ✓ 2 new halls: Hall XII (Unsolved Ciphers), Hall XIII (Ciphers in Culture)
- ✓ Expanded Hall I into "World Origins of Cryptography"

### Museum Experience
- ✓ Artifact Cards on every exhibit (data-driven from `data/artifact-cards.json`)
- ✓ Research / Catalog Mode (filterable by hall, era, family, difficulty, solver status)
- ✓ Cipher Detective (analyzes pasted ciphertext, suggests cipher families)
- ✓ Further-Reading page (four-canon reference canon + scholar links)

### Technical Requirements
- ✓ Every Track A exhibit: `js/ciphers/[slug].js` engine + `all-engines.js` registration
- ✓ Every Track A exhibit: demo-loader integration (not hand-coded demo markup)
- ✓ Every Track A exhibit: 6 test suites pass (engines, deep, comprehensive, accessibility, mobile, demo-pages)
- ✓ Every Track B exhibit: at least one interactive visualization
- ✓ All existing pages: updated nav, breadcrumbs, prev/next, count metadata
- ✓ Vanilla HTML/CSS/JavaScript — no new dependencies

---

## Phases In Detail (status reflects worldupdates.md)

### Phase 0 — Plan & Scaffold ✅
- [x] docs/round3-plan.md created
- [x] docs/worldupdates.md created (persistent checklist)
- [x] Slug conflicts checked
- [x] Hall numbering confirmed (I–XI current, XII = Unsolved, XIII = Culture)

### Phase 0.5 — Audit Shipped vs. Round 3 ✅
- [x] README.md read; current 63-exhibit, 11-hall state confirmed
- [x] docs/round3-shipped-audit.md created
- [x] Every Round 3 exhibit classified: SHIPPED / THIN / NEW
- [x] Skip-list and upgrade-list written

### Phase 1 — Hall I: World Origins ✅
- [x] halls/ancient.html renamed to "World Origins of Cryptography"
- [x] Kama Sutra Cipher (Track A)
- [x] Egyptian Substitution (Track B)
- [x] Aeneas Tacticus (Track A)
- [x] Arabic Nomenclators (Track A)
- [x] Rosetta Stone (Track B trilingual viewer + decipherment timeline)
- [x] Histiaeus's Tattooed Messenger (Track B concealment demo)
- [x] Hall I sidebar reflects 11 exhibits
- [x] Hall I prev/next chains updated
- [x] Scytale upgraded with revisionist sidebar (Tomokiyo)

### Phase 2 — Hall XII: Unsolved Ciphers 🟡
- [x] halls/unsolved.html created
- [UPGRADE] Voynich moved to Hall XII (page exists, breadcrumb work in progress)
- [UPGRADE] Kryptos moved to Hall XII (Kryptos 2025 expansion pack complete)
- [UPGRADE] Beale Ciphers moved to Hall XII
- [UPGRADE] Dorabella moved to Hall XII (full Track B symbol-inspector)
- [x] Shugborough · D'Agapeyeff · Somerton Man · McCormick · Phaistos Disc — pages + Track B viz
- [x] Zodiac Z-13/Z-32 side panel
- [x] Hall VIII framing updated
- [x] Hall XII prev=Hall XI, next=Hall XIII set
- ⬜ Hall XII hero "living research area" copy with named researchers (Lasry, Biermann, Tomokiyo, Pelling, Megyesi, Dunin)

### Phase 3 — Pacific Theater ✅
- [x] JN-25 (Track A: superenciphered codebook engine + page + tests)
- [x] Red (Type A) (Track A: stepping-switch model)
- [x] Navajo expanded with Choctaw/Comanche/Hopi panel + postwar admission framing

### Phase 4 — WWII Machines 🟡
- [x] Fialka M-125 (Track A)
- [x] KL-7 (Track A)
- [SKIP — already shipped] SIGABA, Typex
- [x] Geheimschreiber (T52) (Track A) — Fish Family side panel still pending
- [x] Kryha (Track A)
- [x] Bazeries Cylinder (Track A — 20-disk)
- [x] M-94 / M-138-A (Track A — dual-mode)

### Phase 5 — European Classical ⬜  ← Active phase
- ⬜ **Affine (Track A)** ← in progress
- ⬜ Trithemius (Track A)
- ⬜ Cardano Autokey (Track A)
- ⬜ Wheatstone Cryptograph (Track A)
- ⬜ Argenti Family (Track A)
- ⬜ Wallis Ciphers (Track A)
- ⬜ Morse Code (Track A + audio + Voyager Golden Record + Morse+Cipher side panels)
- ⬜ Mary Stuart Castelnau Letters (Track B annotated viewer + decipherment timeline)
- ⬜ Patterson's Cipher for Jefferson (Track B four-layer animation + Smithline search viz)

### Phase 6 — East Asia & Telegraphy ✅
- [x] Chinese Telegraph Code (Track A)
- [x] Zimmermann Telegram (Track A — codebook + super-encipherment)
- [x] Slidex (Track A) — "Slidex to BATCO" side panel still pending
- [x] Commercial Telegraph Codebooks (Track A — codebook lookup)

### Phase 7 — Americana ⬜
- ⬜ Culper Ring / Tallmadge (Track A)
- ⬜ Arnold-André (Track A)
- ⬜ Cardano Grille (Track A)
- ⬜ Hall VI rename decision

### Phase 8 — Global Underground ⬜
- ⬜ Field Hollers / Spirituals (Track B audio viz)
- ⬜ Che Guevara's VIC Variant (Track A)
- ⬜ IRA Book Cipher (Track A)
- ⬜ Red Army Faction OTP (Track B — reuses OTP engine)
- ⬜ Vietnamese Underground (Track A)
- ⬜ Joseon Yeokhak (Track A)
- ⬜ Ethiopian Ge'ez (Track A)
- ⬜ Latin American Telegraph Codebooks (Track A)
- ⬜ Diana Cryptosystem (Track A — reciprocal Diana table + pad)
- ⬜ Cambridge Five side panel on VENONA bio context

### Phase 9 — Hall XIII: Culture 🟡
- [x] halls/culture.html created
- [UPGRADE] Gold-Bug moved to Hall XIII
- [x] Dancing Men moved to Hall XIII
- ⬜ Da Vinci Code (Track A — Atbash + mirror + Fibonacci)
- ⬜ National Treasure (Track A — Ottendorf book cipher)
- ⬜ Gravity Falls (Track A — multi-layer)
- [x] Cicada 3301 (Track A — OutGuess + runic + RSA demo)
- ⬜ Popular Culture Survey (Track B filterable catalog)
- ⬜ Cross-link side panels (Atbash → Da Vinci, Caesar → Gravity Falls, Affine → Gravity Falls A1Z26)
- ⬜ Gold-Bug "Poe's Challenge / W.B. Tyler" side panel
- ⬜ Enigma "Three Unbroken Messages" side panel
- ⬜ Enigma "Operation Boniface" side panel
- ⬜ Hall VIII card count + sidebar updated after moves
- ⬜ Hall XIII prev = Hall XII, no next link

### Phase 10 — Generic Techniques ⬜
- [SKIP — already shipped] Nomenclator-generic, Book-cipher-generic, Autokey-generic
- ⬜ Null Cipher-generic (Track A)
- ⬜ Microdot Steganography (Track A)

### Phase 11 — Context & Modern Foundations ⬜
- ⬜ Cabinet Noir (Track B map of black chambers)
- ⬜ Station HYPO (Track B floor plan)
- ⬜ Bletchley Park (Track B hut map)
- ⬜ Kerckhoffs's Principle (Track B explainer — NOT a fake encrypt engine)
- [UPGRADE] Diffie-Hellman page enhanced to Round 3 spec
- [UPGRADE] RSA page enhanced (key-gen + encrypt + sign)
- [UPGRADE] AES page enhanced (128/192/256 + ECB/CBC/GCM)
- [SKIP — already shipped] DES, SHA-256
- ⬜ VENONA (Track decision per OTP engine audit) + SIGTOT/5-UCO + Cambridge Five side panels
- ⬜ SIGSALY (Track B three-part viz: voice digitization + noise-key sim + bandwidth)

### Phase 12 — Biographies ⬜
- [x] Phase 0.5 audit complete; skip-list in docs/round3-shipped-audit.md
- ⬜ Joseph Rochefort
- ⬜ Arne Beurling
- ⬜ Dilly Knox
- ⬜ Herbert Yardley
- [SKIP — already shipped] Joan Clarke
- ⬜ Mavis Batey
- [SKIP — already shipped] Elizebeth Smith Friedman
- [SKIP — already shipped] Leo Marks
- [SKIP — already shipped] Agnes Meyer Driscoll
- ⬜ GCHQ Trio (Ellis, Cocks, Williamson)
- [SKIP — already shipped] Bill Tutte
- ⬜ David Kahn
- ⬜ Elonka Dunin
- ⬜ George Lasry
- ⬜ Hall X hero subtitle updated

### Phase 13 — Global Integration 🟡
- ⬜ museum-map.html: complete cipher index updated
- [x] museum-map.html: Hall XII + Hall XIII added to floor plan
- [x] museum-map.html: subtitle and footer count updated
- ⬜ timeline.html: year markers for every new exhibit
- ⬜ timeline.html: era anchors (Egyptian, India, Phaistos, Histiaeus)
- ⬜ timeline.html: six-stage strip preserved
- ⬜ comparison.html: rows 63→~113; total updated
- ⬜ cipher-flow.html: family map updated
- ⬜ search.html: index rebuilt
- ⬜ tours/: optional new Hall XII/XIII themed tour
- [x] index.html: hero counts updated (~113 ciphers, 13 halls)
- ⬜ index.html: featured ciphers refreshed (Hall XII + XIII picks)
- ⬜ index.html: playground dropdown updated
- ⬜ index.html: footer version v3.0.0 "Global Expansion"
- [x] README.md: hall table regenerated with XII + XIII
- [x] README.md: count references updated (63→~113, 11→13)
- ⬜ README.md: demo roster expanded
- [x] sitemap.xml: all new URLs added
- ⬜ learn.html cross-links to new exhibits (if in scope per Phase 0.5)
- ⬜ cryptanalysis.html: techniques extended if introduced
- ⬜ All hall pages: "Hall X of Y" → "of 13"
- ⬜ Hall prev/next chains repaired around XII/XIII insertion
- ⬜ 404.html, glossary.html stale counts updated
- ⬜ Workbench header: engine count updated
- ⬜ Hall XII hero "living research area" framing
- ⬜ Cryptiana enrichments on Babington / Great / Arnold-André / Jefferson / Beale / Culper / Wallis
- ⬜ M-209 sidebar: Hagelin family (C-36, C-38, BC-38, M-209) + Operation Rubicon
- ⬜ Playfair sidebar: "Wheatstone Invented It; Playfair Promoted It"
- ⬜ Nihilist sidebar: "Two Nihilist Ciphers — Substitution and Transposition"
- ⬜ Columnar sidebar: variants (route / Myszkowski / Nihilist)
- ⬜ Straddling Checkerboard sidebar: family lineage (Polybius → Nihilist → Tap Code → VIC)
- ⬜ Jefferson Disk sidebar: wheel-cipher lineage 1790s–WWII (ties Bazeries + M-94/M-138-A)
- ⬜ Hall V comparative tactical-systems table (WWI + WWII)
- ⬜ Hall V appendix: modern tactical authentication (DRYAD, BATCO, KAK)
- ⬜ further-reading.html created (four-canon, HistoCrypt, Cryptologia, scholar links)
- ⬜ further-reading.html linked from nav, museum-map, glossary, README
- ⬜ Identity statement standardized

### Phase 15 — Artifact Cards ⬜
- ⬜ data/artifact-cards.json with schema
- ⬜ Card renderer (demo-loader extension or companion module)
- ⬜ All 63 existing exhibits have entries
- ⬜ All ~51 new Round 3 exhibits have entries
- ⬜ Artifact-card hook on every exhibit page
- ⬜ Card styling matches museum aesthetic + mobile + a11y
- ⬜ test-comprehensive.js validates card completeness
- ⬜ test-demo-pages.js verifies card render on every exhibit page

### Phase 16 — Research / Catalog Mode ⬜
- ⬜ Audit comparison.html, search.html, cipher-flow.html
- ⬜ Decision recorded: skip / upgrade / build
- ⬜ If UPGRADE: new filter dimensions in comparison.html
- ⬜ If BUILD: catalog.html with spec
- ⬜ Global nav link added
- ⬜ Mobile + a11y, no backend

### Phase 17 — Cipher Detective ⬜
- ⬜ cipher-detective.html created
- ⬜ Analyses: char inventory, IoC, Kasiski, chi-square, charset, word-shape, period
- ⬜ Family scoring across 8+ families
- ⬜ Evidence panels: 3–5 candidates with confidence
- ⬜ Limitations section
- ⬜ Cross-links to exhibits, cryptanalysis, workbench
- ⬜ Added to global nav + cryptanalysis + workbench
- ⬜ test-comprehensive.js validates known sample identification
- ⬜ test-demo-pages.js verifies render + input handling

### Phase 18 — Deploy & Verify ⬜
- ⬜ All 6 test suites pass (engines, deep, comprehensive, accessibility, mobile, demo-pages)
- ⬜ test-demo-pages.js: every new exhibit page JSDOM roundtrip OK
- ⬜ test-comprehensive.js: artifact-card completeness validated
- ⬜ test-comprehensive.js: Cipher Detective sample identification validated
- ⬜ Every Track A engine works in Workbench
- ⬜ Every Track A "Try It Yourself" produces output via demo-loader
- ⬜ Every Track A "Break This Cipher" reveal works
- ⬜ Every Track B visualization renders
- ⬜ Every exhibit page shows Artifact Card at top
- ⬜ Catalog/research mode page works with all filters
- ⬜ Cipher Detective accepts input + returns evidence-based candidates
- ⬜ Local server spot-check: 5 Track A, 5 Track B, 5 bios
- ⬜ Pushed to main
- ⬜ Live verification: homepage counts, museum-map, halls/unsolved, halls/culture, halls/ancient, halls/modern-crypto + Kerckhoffs
- ⬜ Live verification: 5 random new exhibits + artifact cards
- ⬜ Live verification: Workbench shows new engines
- ⬜ Live verification: Cipher Detective live, further-reading.html live
- ⬜ worldupdates.md final status reaches 100%

---

## Critical Rules (anti-hallucination)

1. **Source of truth:** Read `docs/worldupdates.md` at start of every phase. Update it after every commit.
2. **Read every file before editing it.** Do not assume contents.
3. **Copy structure from existing exhibits verbatim.** Templates per family:
   - Ancient: `ciphers/caesar.html`, `ciphers/atbash.html`, `ciphers/kama-sutra.html`
   - Polyalphabetic: `ciphers/vigenere.html`
   - Machines: `ciphers/enigma.html`, `ciphers/m209.html`
   - Unsolved: `ciphers/voynich.html`, `ciphers/zodiac.html`
   - Book cipher: `ciphers/beale.html`
   - Cultural: `ciphers/bacon.html`, `ciphers/kryptos.html`
4. **Vanilla HTML/CSS/JS only.** No new dependencies. No build tools.
5. **Track A** must have engine + demo-loader CONFIG + 4 test-suite entries + page with `<div class="demo-section" data-cipher="…">`.
6. **Track B** must have at least one live interactive visualization. NO fake encrypt/decrypt engines for design principles, places, or non-algorithmic exhibits.
7. **Every historical claim sourced** (Kahn, Singh, Frary, Cryptiana, or specialist monograph). Flag uncertain claims `[UNVERIFIED]`.
8. **Completion gates after each phase:** all deliverables exist · `python3 -m http.server 8000` clean · all 6 test suites pass · git commit · no `TODO`/`FIXME`/`mock`/`simulate` tokens · `docs/worldupdates.md` updated.

---

## Pipeline for a New Track A Exhibit

When building a new Track A cipher exhibit, do all of these in one commit:

1. **Engine** — append IIFE to `js/ciphers/all-engines.js`; add name to the return object.
2. **Demo-loader CONFIG** — add slug → engine config in `js/demo-loader.js`.
3. **Exhibit page** — `ciphers/<slug>.html` copied from a template (`kama-sutra.html` for substitution, `vigenere.html` for polyalphabetic, etc.). Include `<div class="demo-section" data-cipher="<slug>"></div>`.
4. **Tests** —
   - `tests/test-comprehensive.js`: add `ENGINE_PROFILES` entry.
   - `tests/test-all-engines.js`: known-answer + roundtrip if not auto-covered.
   - `tests/test-deep-ciphers.js`: edge cases when applicable.
   - `tests/test-demo-pages.js`: auto-picks up new slug if neither HAND_BUILT nor STATIC_PAGES.
5. **Hall page card** — defer to Phase 13 unless the placement is obvious.
6. **Navigation** — set hall-nav `prev`/`next` links inside the new exhibit page.
7. **Update `docs/worldupdates.md`** — check off the item, append log entry.

---

## Reference Canon

1. David Kahn, *The Codebreakers* (Scribner, 1996).
2. Simon Singh, *The Code Book* (Anchor, 1999).
3. Mark Frary, *De/Cipher* (Modern Books, 2017).
4. Satoshi Tomokiyo, *Cryptiana: Articles on Historical Cryptography* (cryptiana.web.fc2.com).

Plus specialist monographs cited per exhibit: Sebag-Montefiore (Enigma), Carlson (Rochefort), Tuchman (Zimmermann), Akkerman (Cabinet Noirs), Lasry et al. in *Cryptologia* (Mary Stuart letters), Rowlett *Story of MAGIC* (Purple), Budiansky *Battle of Wits* (WWII).

