# cipher-museum — Round 3: Global Expansion

**Target:** Opus in Codespace
**Repo:** `systemslibrarian/cipher-museum`
**Stack:** Vanilla HTML + CSS + JavaScript. No build tools. GitHub Pages.
**Live:** https://ciphermuseum.com

**Scope:** Expand the museum from its **Apr 24 2026 baseline of 63 exhibits across
11 halls** (Hall XI = Modern Cryptography already shipped with DES, Diffie-Hellman,
RSA, AES, SHA-256) to ~113 exhibits across 13 halls, AND transform the site into
a fuller museum experience. Round 3 has two layered goals:

**Content expansion:** Add ~45 new cipher exhibits, 2 remaining generic-technique
exhibits, 3 context/situation exhibits, 1 modern-cryptography-foundation exhibit
(Kerckhoffs's Principle), ~9 codebreaker biographies. Expand Hall I into "World
Origins of Cryptography". Introduce **Hall XII "Unsolved Ciphers"** as a dedicated
unsolved-mystery gallery. Introduce **Hall XIII "Ciphers in Culture"** covering
fiction, film, games, and internet phenomena. Hall count: 11 → 13.

**Museum-experience standardization (Phases 15–17):** Add cross-cutting
improvements that make the museum feel like a unified educational experience
rather than a collection of exhibit pages:
- **Artifact Cards** — a consistent metadata header (era, family, region, used
  by, key type, key idea, security failure, modern lesson) on every exhibit page,
  data-driven from `data/artifact-cards.json`.
- **Research / Catalog Mode** — audit-gated upgrade or new page giving visitors a
  filterable catalog by hall, family, era, difficulty, attack type, demo
  availability, and solved status.
- **Cipher Detective** — a new interactive page that analyses pasted ciphertext
  (frequency, IoC, Kasiski, chi-square, character set, period length) and
  educates the visitor on WHY particular cipher families are likely candidates.

**CRITICAL baseline note:** Extensive work has shipped since earlier Round 3
planning drafts. Multiple exhibits this prompt originally treated as "to build"
are already live. Phase 0.5 audits what is already shipped and produces a
canonical skip-list and thin-exhibit upgrade-list BEFORE any build work begins.
See that phase for the authoritative mapping.

**Prerequisite:** `PROMPT-cipher-museum-audit-and-fix.md` (the consistency pass) should
complete BEFORE this prompt runs. Round 3 builds on a stable foundation; if hall
numbering is still drifting, Round 3 will compound the drift.

---

## WHY THIS ROUND

The museum currently has (as of Apr 24 2026, per repo README):
- **Strong coverage:** 63 exhibits across 11 halls. Mediterranean classical
  (Greek/Roman/Hebrew), European Renaissance (Italian/French/English),
  American (Civil War, Jefferson, Hill, Vernam, Beale, Zodiac, Kryptos,
  Solitaire), German (Enigma, Lorenz, ADFGX/ADFGVX, Copiale), Russian/Soviet
  (Nihilist, VIC, Straddling Checkerboard), Japanese (Purple), unbroken-US
  (SIGABA, Typex), modern (DES, DH, RSA, AES, SHA-256 in Hall XII).
- **Weak coverage:** India (nothing), China (nothing), Islamic world
  (Al-Kindi bio only, no exhibit), Japanese Naval (JN-25 absent despite
  Pacific theater prominence), Cold War beyond Straddling Checkerboard,
  WWII non-Axis beyond SIGABA/Typex (Geheimschreiber, Fialka, KL-7 absent),
  unsolved ciphers fragmented across Hall VIII, women codebreakers (some
  present but thread under-developed), fiction and popular-culture ciphers
  filed alongside operational ciphers in Hall VIII.
- **Strong pipeline features already shipped:** `search.html` (site search),
  `comparison.html` (filterable table), `cipher-flow.html` (family map),
  `tours/` (guided paths), `community/` (discussion), `lab/workbench.html`
  (unified 51-engine lab), six test suites (2,298 assertions), timeline
  "six-stage cryptography evolution" strip.

Round 3 closes the content gaps while respecting what's already built.

---

## ANTI-HALLUCINATION RULES

- Read `museum-map.html` and `docs/findings.md` (if present) BEFORE starting Phase 0.
  Confirm current state. If the consistency pass has not yet run, stop and notify Paul.
- **Read `docs/worldupdates.md` at the start of every phase** (after Phase 0
  creates it). It is your persistent checklist and working memory. Treat it as
  the source of truth for what is and isn't done. When in doubt, trust what the
  file says over what you remember.
- **Update `docs/worldupdates.md` after every commit.** Check off completed
  items, update the progress summary, append to the log for significant events.
  If you crash mid-phase, a fresh session resumes from the file.
- Read every file before editing it. Do not assume contents.
- Copy the structure of an existing exhibit verbatim. References by type:
  - Ancient / foundational: `ciphers/caesar.html` or `ciphers/atbash.html`
  - Polyalphabetic with key: `ciphers/vigenere.html`
  - Mechanical machine: `ciphers/enigma.html` or `ciphers/m209.html`
  - Unsolved historical: `ciphers/voynich.html` or `ciphers/zodiac.html`
  - Book cipher: `ciphers/beale.html`
  - Steganography: `ciphers/bacon.html`
  - Cultural / fiction: `ciphers/kryptos.html`
- Do not invent CSS class names, JavaScript function names, or file paths.
- Do not introduce new dependencies. Vanilla HTML/CSS/JS only.
- Every historical claim must be sourced from a reliable reference (book, peer-reviewed
  article, established encyclopedia, primary document). Speculative or uncertain facts
  must be flagged with `[UNVERIFIED]` in the spec file and reviewed by Paul before ship.
- **Standard reference canon.** The museum's four core reference sources, cited
  wherever they provide the primary scholarly support for a claim:
  1. David Kahn, *The Codebreakers: The Story of Secret Writing* (Scribner, 1967;
     revised 1996). The foundational cryptologic history.
  2. Simon Singh, *The Code Book: The Science of Secrecy from Ancient Egypt to
     Quantum Cryptography* (Anchor, 1999). The best popular introduction.
  3. Mark Frary, *De/Cipher: The Greatest Codes Ever Invented and How to Break
     Them* (Modern Books, 2017). Breadth survey of 50 ciphers with working-level
     cryptographic detail. Cite for exhibits where Frary provides distinctive
     framing, operational detail, or contextual observations (the "purpose of
     ciphers across centuries" framing, the Morse+cipher combination pattern,
     interwar commercial cipher machine context). Cite inline as *Frary, De/Cipher*
     with page reference where possible.
  4. Satoshi Tomokiyo, *Cryptiana: Articles on Historical Cryptography*
     (cryptiana.web.fc2.com, 2008–present). The most comprehensive online
     archive of primary-source research on Renaissance-through-19th-century
     ciphers. Tomokiyo is also a co-author (with George Lasry and Norbert
     Biermann) of the 2022 Mary Stuart Castelnau letters decipherment. Cite
     for any Renaissance, Early Modern, or pre-telegraphic diplomatic cipher
     exhibit where primary-source archival work informs the spec. Cite inline
     as *Tomokiyo, Cryptiana, "[article slug]"* with URL where practical,
     e.g., *Tomokiyo, Cryptiana, "Arnold-André Book Codes"*,
     `cryptiana.web.fc2.com/code/arnold.htm`.
  Primary sources always take precedence over secondary when both are available.
  Use specialist monographs (Sebag-Montefiore on Enigma, Carlson on Rochefort,
  Tuchman on Zimmermann, Akkerman on Cabinet Noirs, Lasry et al. in *Cryptologia*
  on the Mary Stuart letters, etc.) as cited in each exhibit's individual
  references.
- **Objectivity over squeamishness.** The museum covers the history of ciphers used by
  every society, government, and movement in history — state actors, revolutionaries,
  criminals, spies, insurgents, enslaved people escaping bondage. A cipher belongs in
  the museum based on historical documentation and cryptographic substance, not on
  whether the people who used it were "respectable." If the sources document it
  faithfully, build it faithfully. Note scholarly disputes about historicity where
  they exist; do not hide a cipher because its users are uncomfortable to discuss.
- For content where historians genuinely dispute the historicity (not the politics),
  cite the dispute honestly in the exhibit and include both sides. The field-hollers
  exhibit in Phase 8 is the template: document the well-attested musical coding;
  acknowledge in a sidebar that the specific quilt-code theory is disputed by
  Underground Railroad historians.
- If a step cannot be completed, STOP and report.

## COMPLETION GATES

After each phase:
1. All deliverables exist.
2. `python3 -m http.server 8000` serves with no console errors.
3. All `tests/test-*.js` tests pass — including tests for new engines.
4. Git commit made with phase-specific message.
5. No unfinished-marker tokens remain in changed files.
6. Every new solvable-cipher exhibit has a working interactive demo.
7. Every new visualization-only exhibit has at least one live visualization.
8. `docs/worldupdates.md` updated: completed items checked, progress summary
   recalculated, log entry appended if a phase concluded.

---

## INTERACTIVE DEMO REQUIREMENTS (UNIVERSAL)

Every new exhibit built in Round 3 must have hands-on, in-browser interactivity.
There are two tracks depending on whether the cipher is solvable or unsolved.

### Track A — Solvable ciphers (MUST have an interactive encrypt/decrypt demo)

Every new exhibit for a cipher that can be executed in-browser MUST ship with:

1. **A cipher engine file** at `js/ciphers/[slug].js` following the existing
   Caesar file pattern. Exports:
   - `encrypt(plaintext, key, options?)` → ciphertext
   - `decrypt(ciphertext, key, options?)` → plaintext
   - Deterministic, same input → same output.
   - No `Math.random` in any code path tests cover. If the cipher legitimately
     needs randomness (homophones picking among choices, nomenclator null
     insertion), expose a seeded `rng` option so tests can pin outputs.
   - Non-alphabetic passthrough where appropriate.
   - Case handling consistent with the cipher's historical use.

2. **Engine registered in `js/ciphers/all-engines.js`** under its expected name
   so the demo loader and the Workbench dropdown pick it up automatically.

3. **Workbench dropdown entry** in `lab/workbench.html` so every new engine is
   usable from the Codebreaker's Workbench. Update the "N cipher engines"
   claim in the Workbench header to match the new total.

4. **Demo on the exhibit page via `js/demo-loader.js`** — NOT hand-coded.
   The shipped museum uses a dynamic demo loader that builds the
   encrypt/decrypt UI from the engine's registration. The exhibit page
   declares a demo container (see any current exhibit page for the
   established markup pattern — likely a `<div>` with a data attribute
   referencing the cipher slug), and `demo-loader.js` generates:
   - Input field (plaintext or ciphertext, toggle).
   - Key input matched to the engine's declared key type.
   - Encrypt / Decrypt button pair.
   - Output field with copy-to-clipboard.
   - A consistent layout matching every other exhibit.

   New exhibits must use this pattern. Do not hand-code parallel demo
   markup. If a new exhibit needs a non-standard element (e.g., Phaistos
   Disc's spiral viewer is Track B so doesn't apply here; a hypothetical
   polyalphabetic with a tabula recta might need the preview panel),
   extend the loader rather than bypass it.

   The exhibit page may additionally include:
   - A preset example button loading a historically attested or
     pedagogically clear plaintext/key pair (as a `data-` attribute the
     loader reads, or as an on-page hook the page activates).
   - Contextual prose around the demo container.

5. **Break This Cipher block** with:
   - A short pre-encrypted challenge message.
   - A "Reveal Answer" button (hidden until clicked) showing the intended
     plaintext and key.
   - Optional: a hint button.

6. **Tests in `tests/test-all-engines.js`** (309 assertions baseline):
   - Existence test — engine is exported.
   - Roundtrip test — `decrypt(encrypt(m, k), k) === m` for at least 5 messages.
   - Known-answer test — one historically attested cipher-plaintext pair from
     the exhibit's references. If the historical record does not provide a
     clean KAT, use a pedagogically clear one and document the source.

7. **Tests in `tests/test-deep-ciphers.js`** (238 assertions baseline):
   - Empty input.
   - Single character input.
   - Input shorter than the key.
   - Input much longer than the key.
   - Mixed case and non-alphabetic characters.
   - Unicode if the cipher's domain requires it (Chinese Telegraph Code,
     Arabic nomenclators, Kama Sutra transliteration).

8. **Tests in `tests/test-comprehensive.js`** (417 assertions baseline,
   cross-cipher invariants):
   - If the engine fits a family already covered (substitution /
     polyalphabetic / transposition / fractionation / book cipher /
     nomenclator), add it to the relevant family iteration.
   - If the engine introduces a new family (e.g., key-exchange protocol
     for Diffie-Hellman), consider whether a new family iteration is
     warranted.

9. **`tests/test-demo-pages.js`** (304 assertions baseline, JSDOM
   end-to-end — this is the strongest correctness check the museum has):
   - Every new Track A exhibit page must pass the JSDOM click-through.
   - The harness loads the page, lets `demo-loader.js` build the UI,
     clicks the actual Encrypt/Decrypt buttons, verifies ciphertext
     roundtrips back to plaintext.
   - Because new exhibits use the shared loader (item 4 above), this
     integration is mostly automatic — but verify manually for any
     exhibit with custom demo logic.

10. **Automatic sweeps** (no new work, just ensure existing coverage
    doesn't regress):
    - `tests/test-accessibility.js` (790 assertions) sweeps every page
      for WCAG issues. New pages auto-enter its coverage; fix anything
      flagged.
    - `tests/test-mobile.js` (240 assertions) sweeps every page for
      responsive issues. New pages auto-enter; fix anything flagged.

11. **Playground dropdown entry in `index.html`** if the cipher is
    pedagogically simple enough for the home-page playground (Affine
    qualifies; JN-25 does not). Judgment call — when in doubt, add to
    Workbench but not Playground.

### Track B — Unsolved or non-algorithmic exhibits (MUST have a live visualization)

For exhibits where the cipher cannot be executed because it's unsolved
(Voynich, Kryptos K4, Beale #1 and #3, Dorabella, Shugborough, D'Agapeyeff,
Somerton Man, McCormick), or because the historical system is better
understood as a browse-experience than an algorithm (Egyptian Substitution,
Zimmermann Telegram, Bletchley Park as a place), the exhibit MUST still ship
with at least ONE interactive visualization. Options, pick the one that fits:

- **Symbol browser** — pannable grid of the cipher's full symbol set with
  metadata and letter-frequency analysis (Voynich, Copiale symbols if not yet,
  Egyptian hieroglyphs used in the Khnumhotep tomb).
- **Annotated ciphertext viewer** — the ciphertext rendered with hoverable
  annotations showing positional metadata, known decrypts of adjacent portions,
  or candidate decryptions researchers have proposed (Kryptos K4, Beale #1,
  Dorabella).
- **Timeline of decipherment attempts** — interactive horizontal scroller
  (Voynich, Beale, Somerton Man).
- **Candidate-decryption comparator** — side-by-side rendering of the top 3
  proposed solutions with evidence-strength bars (Voynich, Kryptos K4).
- **Historical document viewer** — high-resolution browsable image of the
  ciphertext with annotation overlays (Arnold-André letter, Zimmermann
  Telegram, Rossignol Great Cipher samples — redundant with existing exhibit
  but patternable).
- **Place tour** — pannable floor plan or annotated aerial view
  (Bletchley Park, Station HYPO).
- **Formal statement interactive explainer** — visual walk through of
  a theoretical concept (Kerckhoffs's Principle, Shannon's
  confusion/diffusion — with animated before/after examples).

Every Track B visualization must:
- Render without errors on first page load.
- Be keyboard-navigable.
- Not depend on external CDN assets that could disappear.
- Include at least one `<img>` or `<svg>` element with proper alt text.
- Live in a clearly labeled "Explore" or "Visualization" section equivalent
  in placement to where Track A puts the "Try It Yourself" block.

### CRITICAL — no fake encrypt/decrypt engines

Track A exists for exhibits that have a real, meaningful encrypt/decrypt
algorithm. Do **NOT** force a Track A engine onto exhibits where the
historical object is not an algorithm. A fake "engine" teaches nothing and
misrepresents the exhibit's actual pedagogical value. Specifically:

- **Steganography exhibits** where the method is concealment of existence
  rather than transformation of content (Histiaeus's Tattooed Messenger,
  microdot steganography's historical framing) — these belong in Track B
  as "concealment demonstration" visualizations, NOT as pretend encryption
  engines. A button that says "apply tattoo concealment" to a plaintext
  string is theater, not pedagogy.

- **Design principles and theorems** (Kerckhoffs's Principle, Shannon's
  confusion/diffusion, the one-time pad's uniqueness theorem) — these are
  *maxims about cipher design*, not ciphers themselves. They belong in
  Track B as "formal statement interactive explainer" visualizations.
  Animated before/after comparisons of algorithm-secret vs. key-secret
  systems illustrate Kerckhoffs far better than a synthetic encrypt button
  that "demonstrates" nothing.

- **Decipherment artifacts** (Rosetta Stone) — the Rosetta Stone is a
  trilingual parallel-text, not a cipher. Framing it as Track A would
  require inventing a fake hieroglyph-to-Greek "encryption" that did not
  historically exist.

- **Institutions and places** (Cabinet Noir, Station HYPO, Bletchley Park,
  the American Black Chamber if added later) — these are *where*
  cryptanalytic work happened, not ciphers. Track B as "place tour" is
  the correct mode. An encrypt/decrypt engine for "Bletchley Park"
  confuses the institution for its output.

- **Cultural/catalogue exhibits** (Popular Culture Survey, and any future
  "Ciphers in Film" or "Ciphers in Games" summary page) — these are
  reference catalogues, not ciphers. Track B as "filterable interactive
  catalogue" is correct.

- **Signaling traditions where the "cipher" framing is contested** (Field
  Hollers and Spirituals, Voyager Golden Record as encoding rather than
  cipher) — frame honestly as adjacent to cryptography. Track B with
  audio/historical visualization, not Track A.

**Rule of thumb:** If you cannot write an `encrypt(plaintext, key)` function
that transforms the plaintext into something a historical user would
recognize as ciphertext of their system, it is NOT Track A. Do not invent
one. Put the exhibit in Track B with a visualization that teaches the
exhibit's actual historical or conceptual substance.

### Minimum bar for every exhibit (both tracks)

Regardless of track, every new exhibit ships with:
- At least one interactive element the user can click, type into, drag,
  or manipulate.
- At least one piece of content that renders dynamically rather than as
  static HTML.
- An explicit "Read more" section with 2+ authoritative references.
- Full four-part structure (Historical Context · How It Works · How It Was
  Broken or Why It Remains Unsolved · What It Teaches Modern Cryptography).

### Exhibit tracks in Round 3

**Track A (interactive encrypt/decrypt required) — ~43 exhibits:**
Kama Sutra · Aeneas Tacticus · Arabic Nomenclators · Trithemius ·
Cardano Autokey · Affine · Wheatstone Cryptograph ·
Argenti · Wallis Ciphers · Morse Code · JN-25 · Red Type A · Fialka · KL-7 ·
SIGABA · Typex · Geheimschreiber · Kryha · **Bazeries Cylinder** ·
**M-94 / M-138-A** · Chinese Telegraph Code · Slidex · **Commercial
Telegraph Codebooks** · Culper Ring · Arnold-André · Cardano Grille ·
Che Guevara VIC · IRA Book Cipher · Red Army Faction OTP · Vietnamese
Underground (partial) · Joseon Yeokhak · Ethiopian Ge'ez · Latin American
Codebooks · **Diana Cryptosystem** · Diffie-Hellman · RSA · AES ·
Da Vinci Code · National Treasure · Gravity Falls · Cicada 3301 ·
Dancing Men · Gold-Bug · plus all 5 generic-technique exhibits.

**Track B (visualization only) — ~18 exhibits:**
Egyptian Substitution · Rosetta Stone · **Histiaeus's Tattooed Messenger** ·
Dorabella · Shugborough · D'Agapeyeff · Somerton Man · McCormick ·
Phaistos Disc · Zimmermann Telegram · Cabinet Noir · Station HYPO ·
Bletchley Park · **Kerckhoffs's Principle** · **SIGSALY** · Field Hollers ·
Vietnamese Underground (codebook portion) · Popular Culture Survey
(filterable catalogue) · Mary Stuart Castelnau Letters · Patterson's Cipher
for Jefferson.

**Track-decision-deferred (1 exhibit):**
**VENONA** — Opus decides Track A or Track B based on whether the shipped
OTP engine has real XOR operation. See Phase 11 VENONA spec for details.

(Zimmermann Telegram could be Track A with a simplified nomenclator decoder
— if time allows, upgrade it. Field Hollers has a distinctive audio-based
visualization requirement — treat as Track B. Popular Culture Survey is
borderline — its filterable table is interactive but not encrypt/decrypt.
Rosetta Stone is explicitly Track B: not a cipher itself, framed as a
trilingual decipherment aid. SIGSALY is Track B because it's a speech-
processing system, not an encrypt/decrypt algorithm with clean text
input/output.)

If during implementation a Track B exhibit turns out to have a tractable
interactive angle, upgrade it. The floor is visualization; there is no
ceiling.

---

## PERSISTENT CHECKLIST: `docs/worldupdates.md`

Round 3 spans ~50 new or modified files across 18 phases. To prevent context
loss across long sessions, you will maintain a forward-looking checklist file
at `docs/worldupdates.md` that tracks every deliverable from start to finish.

### Why this file exists

Past long-running builds have failed the "did we do everything" test because
the model forgot items from earlier phases while executing later ones. The
checklist is your persistent working memory:

1. You build it in Phase 0 — one row per deliverable, all unchecked.
2. You check off items as they complete — the file is rewritten, not appended.
3. You re-read it at the start of every phase to confirm what remains open.
4. If the session crashes mid-build, a fresh session starts by reading this
   file to know exactly what's done and what's not.
5. Paul can review it at any time to see progress.

### File structure

Use this exact structure. Create in Phase 0; update after every commit.

```markdown
# Round 3 World Updates Checklist

Generated [YYYY-MM-DD] by Opus for systemslibrarian/cipher-museum Round 3.
Updated after every commit. Source of truth for completion status.

## Progress summary
- Overall: [N done] / [N total] ([percent]%)
- Phase 0 (plan): [done/total]
- Phase 0.5 (shipped audit): [done/total]
- Phase 1 (Hall I expansion): [done/total]
- Phase 2 (Hall XII creation): [done/total]
- Phase 3 (Pacific theater): [done/total]
- Phase 4 (WWII/interwar machines): [done/total]
- Phase 5 (European gaps): [done/total]
- Phase 6 (East Asia/global): [done/total]
- Phase 7 (Americana/cultural): [done/total]
- Phase 8 (global underground traditions): [done/total]
- Phase 9 (Hall XIII creation + cultural): [done/total]
- Phase 10 (generic techniques — 2 new + 3 upgrades): [done/total]
- Phase 11 (context + Kerckhoffs + hall XI upgrades): [done/total]
- Phase 12 (bios — ~7 new + Hall X audit upgrades): [done/total]
- Phase 13 (global integration): [done/total]
- Phase 15 (artifact cards): [done/total]
- Phase 16 (research/catalog mode — audit-gated): [done/total]
- Phase 17 (cipher detective): [done/total]
- Phase 18 (deploy): [done/total]

## Phase 0 — Plan and scaffold ✅
- [x] `docs/round3-plan.md` created
- [x] `docs/worldupdates.md` created (this file)
- [x] Slug reservations confirmed, no conflicts
- [x] Hall numbering confirmed: I–X unchanged, XI = Modern Cryptography (shipped), XII = Unsolved (new), XIII = Culture (new)

## Phase 0.5 — Shipped vs Round 3 audit ✅
- [x] README.md read end-to-end; current 63-exhibit / 11-hall / 21-bio state confirmed
- [x] `docs/round3-shipped-audit.md` created
- [x] Every Round 3 exhibit classified: SHIPPED / THIN / NEW
- [x] Hall X biography audit complete; skip-list recorded
- [x] Thin-upgrade checklist produced per exhibit needing upgrade
- [x] worldupdates.md updated with [SKIP] and [UPGRADE] annotations

## Phase 1 — Hall I expansion to "World Origins" ✅
- [x] `halls/ancient.html` renamed/updated to "World Origins of Cryptography"
- [x] Exhibit: Kama Sutra Cipher — spec, engine, page, tests, registered
- [x] Exhibit: Egyptian Substitution — spec, page, Track B visualization
- [x] Exhibit: Aeneas Tacticus — spec, engine, page, tests, registered
- [x] Exhibit: Arabic Nomenclators — spec, engine, page, tests, registered
- [x] Exhibit: Rosetta Stone — spec, page, Track B trilingual viewer + timeline
- [x] Exhibit: Histiaeus's Tattooed Messenger — spec, page, Track B concealment-demonstration visualization
- [x] Hall I prev/next chains updated
- [x] Hall I sidebar reflects 11 exhibits
- [x] Shipped `ciphers/scytale.html` upgraded with "Was the Scytale Really a Transposition Cipher?" sidebar (Tomokiyo revisionist reading)

## Phase 2 — Hall XII creation: "Unsolved Ciphers" ✅
- [x] `halls/unsolved.html` created
- [x] Voynich moved to Hall XII (breadcrumb updated)
- [x] Kryptos moved to Hall XII (breadcrumb updated)
- [x] Beale Ciphers moved to Hall XII (breadcrumb updated)
- [x] **Kryptos 2025 expansion pack (section 2b-bis):**
  - [x] "Full Installation" panel added
  - [x] "1,735 letters" panel added
  - [x] "K0 — the Morse code panels" panel added
  - [x] "Scheidt partnership" panel added
  - [x] "K4 clues released over time" timeline panel
  - [x] "2025: Sale and seal" panel
  - [x] K0 Morse decoder interactive
- [x] Exhibit: Dorabella — page + Track B visualization
- [x] Exhibit: Shugborough — page + Track B visualization
- [x] Exhibit: D'Agapeyeff — page + Track B visualization
- [x] Exhibit: Somerton Man — page + Track B visualization
- [x] Exhibit: McCormick — page + Track B visualization
- [x] Exhibit: Phaistos Disc — page + Track B spiral viewer + glyph catalog
- [x] Zodiac Z-13/Z-32 side panel added to existing Zodiac exhibit
- [x] Hall VIII framing updated
- [x] Hall XII prev/next correctly set

## Phase 3 — Japanese & Pacific Theater ✅
- [x] Exhibit: JN-25 — spec, engine, page, tests, registered
- [x] Exhibit: Red (Type A) — spec, engine, page, tests, registered
- [x] Code Talkers expansion (Choctaw/Comanche/Hopi side panel on Navajo page)

## Phase 4 — WWII / Interwar machines ✅
- [x] Exhibit: Fialka M-125 — spec, engine, page, tests, registered
- [x] Exhibit: KL-7 — spec, engine, page, tests, registered
- [x] Exhibit: SIGABA — spec, engine, page, tests, registered
- [x] Exhibit: Typex — spec, engine, page, tests, registered
- [x] Exhibit: Geheimschreiber (T52) — spec, engine, page, tests, registered
- [x] Geheimschreiber side panel: "The Fish Family"
- [x] Exhibit: Kryha — spec, engine, page, tests, registered
- [x] Exhibit: Bazeries Cylinder — spec, engine, page, tests, registered
- [x] Exhibit: M-94 / M-138-A — spec, engine, page, tests, registered

## Phase 5 — European classical gaps 🟡
- [x] Exhibit: Trithemius — spec, engine, page, tests, registered
- [x] Exhibit: Cardano Autokey — spec, engine, page, tests, registered
- [x] Exhibit: Affine — spec, engine, page, tests, registered
- [x] Exhibit: Wheatstone Cryptograph — spec, engine, page, tests, registered
- [x] Exhibit: Argenti Family — spec, engine, page, tests, registered
- [x] Exhibit: Wallis Ciphers — spec, engine, page, tests, registered
- [x] Exhibit: Morse Code — spec, engine, page, tests, registered
- [x] Morse Code side panels: Voyager Golden Record + Morse+Cipher Combination
- [x] Exhibit: Mary Stuart Castelnau Letters — spec, page, Track B annotated viewer + decipherment timeline
- [x] Exhibit: Patterson's Cipher for Jefferson — spec, page, Track B animation

## Phase 6 — East Asia & global telegraphy ✅
- [x] Exhibit: Chinese Telegraph Code — spec, engine, page, tests, registered
- [x] Exhibit: Zimmermann Telegram — spec, page, engine, tests, registered
- [x] Exhibit: Slidex — spec, engine, page, tests, registered
- [x] Slidex side panel: "Slidex to BATCO — The British Tactical Code Lineage"
- [x] Exhibit: Commercial Telegraph Codebooks — spec, engine, page, tests, registered

## Phase 7 — Americana & cultural ✅
- [x] Exhibit: Culper Ring / Tallmadge — spec, engine, page, tests, registered
- [x] Exhibit: Arnold-André — spec, engine, page, tests, registered
- [x] Exhibit: Cardano Grille — spec, engine, page, tests, registered
- [x] Hall VI rename decision (if warranted) confirmed
- Note: Gold-Bug moved to Phase 9 / Hall XIII

## Phase 8 — Additional global and underground traditions ✅
- [x] Exhibit: Field Hollers / Spirituals — spec, page, Track B audio visualization
- [x] Exhibit: Che Guevara's VIC Variant — spec, engine, page, tests, registered
- [x] Exhibit: IRA Book Cipher — spec, engine, page, tests, registered
- [x] Exhibit: Red Army Faction OTP Operations — spec, page, registered
- [x] Exhibit: Vietnamese Underground Codes — spec, engine, page, tests, registered
- [x] Exhibit: Joseon Yeokhak Diagrams — spec, engine, page, tests, registered
- [x] Exhibit: Ethiopian Ge'ez Monastic Ciphers — spec, engine, page, tests, registered
- [x] Exhibit: Latin American Telegraphic Codebooks — spec, engine, page, tests, registered
- [x] Exhibit: Diana Cryptosystem — spec, engine, page, tests, registered
- [x] Cambridge Five side panel added to VENONA Hall X biography

## Phase 9 — Hall XIII creation: "Ciphers in Culture" ✅
- [x] `halls/culture.html` created with honest cultural framing
- [x] Gold-Bug moved to Hall XIII (breadcrumb, prev/next, hall references updated)
- [x] Dancing Men moved to Hall XIII (breadcrumb, prev/next, hall references updated)
- [x] Exhibit: Da Vinci Code — page, registered
- [x] Exhibit: National Treasure — page, registered
- [x] Exhibit: Gravity Falls Cipher System — page, registered
- [x] Exhibit: Cicada 3301 — page, registered
- [x] Exhibit: Popular Culture Survey — spec, page with filterable catalogue table
- [x] Cross-reference side panels: Atbash (→ Da Vinci Code), Caesar (→ Gravity Falls)
- [x] Gold-Bug side panel: "Poe's Challenge Ciphers"
- [x] Enigma side panel: "The Three Unbroken Messages"
- [x] Hall XIII prev link (Hall XII) set

## Phase 10 — Generic-technique exhibits ✅
- [x] Exhibit: Nomenclator-generic — spec, engine, page, tests, registered
- [x] Exhibit: Book Cipher-generic — spec, engine, page, tests, registered
- [x] Exhibit: Autokey-generic — spec, engine, page, tests, registered
- [x] Exhibit: Null Cipher-generic — spec, engine, page, tests, registered
- [x] Exhibit: Microdot Steganography — page, registered

## Phase 11 — Context / situation + modern cryptography foundations ✅
- [x] Exhibit: Cabinet Noir — page, registered
- [x] Exhibit: Station HYPO — page, registered
- [x] Exhibit: Bletchley Park — page, registered
- [x] Exhibit: Kerckhoffs's Principle — page, registered
- [x] Exhibit: Diffie-Hellman Key Exchange — spec, engine, page, tests, registered
- [x] Exhibit: RSA — spec, engine, page, tests, registered
- [x] Exhibit: AES — spec, engine, page, tests, registered
- [x] Exhibit: VENONA — spec, page, registered
- [x] Exhibit: SIGSALY — page, registered
- [x] VENONA/SIGSALY: Cambridge Five side panel, SIGTOT side panel

## Phase 12 — Hall X biographies ✅
- [x] Phase 0.5 audit complete — bio skip-list written to docs/round3-shipped-audit.md
- [x] Bio: Joseph Rochefort — page shipped
- [x] Bio: Arne Beurling — page shipped
- [x] Bio: Dilly Knox — page shipped
- [x] Bio: Herbert Yardley — page shipped
- [x] Bio: Joan Clarke — [SKIP] already shipped
- [x] Bio: Mavis Batey — page shipped
- [x] Bio: Elizebeth Smith Friedman — [SKIP] already shipped
- [x] Bio: Leo Marks — [SKIP] already shipped
- [x] Bio: Agnes Meyer Driscoll — [SKIP] already shipped
- [x] Bio: GCHQ Trio (Ellis, Cocks, Williamson) — page shipped
- [x] Bio: Bill Tutte (solo) — [SKIP] already shipped
- [x] Bio: David Kahn — page shipped
- [x] Bio: Elonka Dunin — page shipped
- [x] Bio: George Lasry — page shipped
- [x] Hall X hero subtitle updated

## Phase 13 — Global integration

Status note: the authoritative completion tracker is `docs/worldupdates.md`. This
prompt block is retained as a mirror only and was previously stale.

- [x] museum-map / search / hall-count integration completed for the 139-exhibit, 13-hall museum
- [x] comparison.html upgraded into catalog-mode filters and stale counts corrected
- [x] index.html, README.md, footer/navigation copy updated to current museum scale and chronology
- [x] timeline / cipher-flow / homepage featured-cipher refreshes completed
- [x] hall-count and stale-count cleanup completed across hall pages, glossary, 404, and shared surfaces
- [x] Cryptiana bibliographic enrichment on key exhibits completed
- [x] Requested exhibit and hall sidebars / appendices completed
- [x] `further-reading.html` created and linked from global surfaces
- [x] Identity statement standardized across README / homepage / repo description

## Phase 15 — Artifact Card standardization
- [x] data/artifact-cards.json created with schema decided
- [x] Card renderer added (demo-loader extension or companion module)
- [x] All 63 existing exhibits have artifact-card entries
- [x] All ~51 new Round 3 exhibits have artifact-card entries
- [x] Artifact-card hook added to all exhibit pages
- [x] Card styling matches museum aesthetic; mobile-responsive; accessible
- [x] test-comprehensive.js validates card completeness
- [x] test-demo-pages.js verifies card renders on every exhibit page

## Phase 16 — Research / Catalog Mode (audit-gated)
- [x] Audit of comparison.html, search.html, cipher-flow.html completed
- [x] Decision recorded in round3-shipped-audit.md (skip / upgrade / build)
- [x] If UPGRADE: new filter dimensions added to comparison.html
- [x] If BUILD: catalog.html created with spec above
- [x] Global nav updated with link
- [x] Mobile-responsive; accessible; no backend

## Phase 17 — Cipher Detective
- [x] cipher-detective.html created
- [x] Analyses implemented: char inventory, IoC, Kasiski, chi-square, char-set, word-shape, period-length
- [x] Family scoring implemented across at least 8 cipher families
- [x] Evidence panels display 3–5 candidates with confidence language
- [x] Limitations section included
- [x] Cross-links to exhibits, cryptanalysis.html, workbench
- [x] Added to global nav and cryptanalysis/workbench pages (also learn.html if the page exists per Phase 0.5 audit)
- [x] test-comprehensive.js validates identification on known samples
- [x] test-demo-pages.js verifies page renders and accepts input

## Phase 18 — Deploy and verify
- [x] All 6 local test suites pass
- [x] Demo-page and comprehensive validation cover new exhibits, artifact cards, and Cipher Detective samples
- [x] Every Track A engine works in Workbench
- [x] Every Track A Try It Yourself block produces output
- [x] Every Track A Break This Cipher reveal works
- [x] Every Track B visualization renders
- [x] Every exhibit page shows its Artifact Card at the top
- [x] Catalog / comparison filters work across the full research mode surface
- [x] Cipher Detective loads, accepts input, and returns evidence-based candidates
- [x] Local spot-check completed across Track A, Track B, and biography pages
- [x] Changes pushed to `main`
- [x] Live verification completed for homepage, museum-map, Hall XII/XIII, Hall I, Hall XI, further-reading, Workbench, Cipher Detective, and random artifact-card exhibits
- [x] `docs/worldupdates.md` reaches 100% complete

## Blockers and deferrals
- No open blockers remain for Round 3. The earlier repository-description mismatch has been reconciled and the completion tracker is now fully closed.

## Log of significant events
[Append one-line entries as major milestones hit. Example:
 "2026-04-25 — Phase 4 complete, all 6 machine exhibits built and tested."]
```

### Rules for maintaining the checklist

1. **Create in Phase 0.** First deliverable of the entire round.
2. **Rewrite after every commit.** Check off the items just completed; update
   the Progress summary counts at the top.
3. **Re-read at phase start.** At the start of every phase (including the
   first action inside that phase), read `docs/worldupdates.md` from disk to
   confirm the current state.
4. **Never delete checked items.** They're the audit trail.
5. **Add to the Log.** When a phase completes, append a one-line log entry
   with date and summary.
6. **Use for recovery.** If the session is interrupted and a new session picks
   up, the new session's first action is to read `docs/worldupdates.md` and
   resume from the first unchecked item.
7. **Append blockers.** If a decision blocks a checklist item, note it in the
   Blockers section. Do not silently skip — the item stays unchecked with a
   blocker reference.

### Anti-drift rule

If the checklist and reality disagree (a file exists that's checked unchecked,
or unchecked items that appear done), trust reality. Re-read the actual files,
update the checklist to match, and add a log entry noting the reconciliation.

---

## OUTPUT STRUCTURE

Round 3 spans ~60 new or modified files across 18 phases. Work in this order:

1. Phase 0 — Plan and scaffold (hall structure changes).
2. Phase 0.5 — Shipped vs Round 3 audit (produce skip-list and upgrade-list).
3. Phase 1 — Hall I expansion to "World Origins".
4. Phase 2 — Hall XII creation for "Unsolved Ciphers".
5. Phases 3–8 — Build new exhibit pages by category.
6. Phase 9 — Hall XIII creation for "Ciphers in Culture".
7. Phase 10 — Generic-technique exhibits (2 new + 3 upgrades).
8. Phase 11 — Context / situation exhibits + Kerckhoffs (+ Hall XI upgrades).
9. Phase 12 — Codebreaker biographies (Hall X additions, audit-gated).
10. Phase 13 — Global integration (map, timeline, comparison, search, counters, etc.).
11. Phase 15 — Artifact Card standardization (cross-cutting metadata header on every exhibit).
12. Phase 16 — Research / Catalog Mode (audit-gated; upgrade comparison.html OR build catalog.html).
13. Phase 17 — Cipher Detective (new interactive cipher-identification page).
14. Phase 18 — Deploy and verify.

(There is no Phase 14. Phases 15, 16, 17 were inserted after Round 3's
original plan was written, to incorporate museum-experience improvements
suggested during the April 2026 review. The deploy phase was renumbered
from 14 to 18 so that deploy remains the last phase.)

---

## Phase 0 — Plan and scaffold

### 0a. Create the build plan

Write `docs/round3-plan.md` listing every new exhibit, bio, and structural change
with its hall assignment and template source. Keep it aligned with the authoritative
hall map from the consistency pass (`docs/truth-2026-04.md` or equivalent).

### 0b. Create the persistent checklist

Write `docs/worldupdates.md` following the exact structure specified in the
PERSISTENT CHECKLIST section above. All items start unchecked. The Progress
summary at the top starts at 0%. The Blockers section starts empty. The Log
section starts with one entry: `"[YYYY-MM-DD] — Round 3 build started."`

From this point forward, update `docs/worldupdates.md` after every commit.
Re-read it at the start of every phase to confirm open items.

### 0c. Confirm the hall numbering

The plan assumes:
- Hall I stays numbered I, renamed from **"Birth of Cryptography"** to
  **"World Origins of Cryptography"**.
- Halls II through IX keep their current numbering and content unchanged.
- Hall X stays **"Hall of Codebreakers"** at position X.
- Hall XI stays **"Modern Cryptography"** at position XI (already shipped
  with DES, Diffie-Hellman, RSA, AES, SHA-256 — do NOT disrupt).
- New Hall XII is **"Unsolved Ciphers"** — positioned after Modern
  Cryptography as the first new gallery.
- New Hall XIII is **"Ciphers in Culture"** — positioned as the final
  gallery, covering fiction, film, games, and internet phenomena.
- Total halls: **13**. All footer "Hall X of Y" lines must now read "of 13".

Paul explicitly chose this arrangement to avoid disrupting already-shipped
Hall XI content. Do not revisit without explicit direction.

### 0d. Expansion slug reservations

Reserve these slugs now in `docs/round3-plan.md` so later phases don't collide:

```
# Hall I — World Origins additions (6 new)
kama-sutra · egyptian-substitution · aeneas-tacticus · arabic-nomenclators ·
rosetta-stone · histiaeus-tattoo

# Hall II — Substitution additions (5 new)
affine · argenti · wallis-ciphers · wheatstone-cryptograph ·
mary-stuart-castelnau-letters · patterson-jefferson-cipher
# Note: Mary Stuart Castelnau Letters (2022 decipherment) and Patterson's
# Cipher for Jefferson (2007 decipherment) are solved historical-cipher
# exhibits built as Track B visualizations, not new-engine Track A
# exhibits. Both emphasize contemporary cryptanalytic breakthroughs
# (21st-century hill-climbing and archival cross-referencing) applied to
# centuries-old cipher corpora.

# Hall III — Polyalphabetic additions (2 new + 1 side panel)
trithemius · cardano-autokey
# (autokey-generic goes into Phase 10 generic-techniques)

# Hall V — Military & Spy additions (5 new in Round 3)
chinese-telegraph-code · slidex · zimmermann-telegram · morse-code ·
commercial-telegraph-codebooks · diana-cryptosystem
# Note: Morse Code added in Phase 5 despite its 1837 date because it fits
# Hall V's "tactical & global signaling" theme more than Hall III's
# polyalphabetic scope. Commercial Telegraph Codebooks (Phase 6) covers
# Bentley's / ABC / Lieber's codebooks — shows cryptography's civilian
# commercial use. Diana Cryptosystem (Phase 8) is the US Special Forces
# hand OTP system.

# Hall VI — Civil War / Early American additions (2 new — rename hall?)
culper-ring · arnold-andre
# Recommend renaming Hall VI to "Early American & Civil War Ciphers" if >3 Americana

# Hall VII — Mechanical Cipher Machines additions (8 new in Round 3)
# ALREADY SHIPPED per Phase 0.5 audit — SKIP: sigaba, typex
jn-25 · red-type-a · fialka · kl-7 · geheimschreiber · kryha ·
bazeries-cylinder · m94-m138a
# (Kryha is borderline-mechanical; confirm before placement)
# (Bazeries Cylinder and M-94/M-138-A extend the Jefferson-disk wheel-
#  cipher lineage — see Jefferson Disk sidebar in Phase 13o.)

# Hall VIII — Puzzle & Novelty additions (1 new)
cardano-grille
# Note: Gold-Bug and Dancing Men originally Hall VIII; now Hall XIII (Phase 9).
# Many unsolved items move OUT of Hall VIII to new Hall XII (Phase 2).

# Hall IX — Unbreakable additions (1 new in Phase 11)
venona
# Note: VENONA is the OTP-failure-through-pad-reuse story, placed next to
# shipped OTP/Vernam exhibits in Hall IX as the consequence-of-implementation-
# failure case study. Includes SIGTOT/5-UCO side panel and Cambridge Five
# side panel.

# Hall XI — Modern Cryptography additions (2 new in Phase 11)
kerckhoffs-principle · sigsaly
# Note: DH/RSA/AES/DES/SHA-256 are ALREADY SHIPPED in Hall XI per Phase 0.5
# audit. Kerckhoffs's Principle joins them as the 6th foundation exhibit —
# the principle that makes the public algorithms of DH/RSA/AES meaningful.
# SIGSALY is the foundational secure-voice exhibit — bridges wartime
# cryptography to modern secure communications. Track B (visualization-only)
# because SIGSALY is a speech-processing system, not a classical encrypt/
# decrypt algorithm.
# Original Round 3 plan placed DH/RSA/AES in Hall IX; that plan superseded
# by discovery that Paul already built Hall XI Modern Cryptography. The
# "Unbreakable" framing of Hall IX stays narrow (OTP, Vernam, Solitaire),
# now extended with VENONA as the OTP-failure case.

# Hall X — Codebreakers additions (~9 net new bios after Phase 0.5 audit)
# Build candidates (verify against Phase 0.5 audit first):
# joseph-rochefort · arne-beurling · dilly-knox · herbert-yardley ·
# mavis-batey · gchq-trio · david-kahn · elonka-dunin
# Likely SHIPPED per README (skip after audit confirms):
#   joan-clarke · elizebeth-friedman · leo-marks · agnes-meyer-driscoll
# Possibly THIN (upgrade if currently paired with Flowers):
#   bill-tutte-solo

# Hall XII — Unsolved Ciphers (new hall, pulls existing + 5 new)
# Moves in: voynich, kryptos (K4 portion), beale (1 and 3 portions),
#           dorabella (currently in Hall VIII, visualization-only per README)
# New: shugborough · dagapeyeff · somerton-man · mccormick · phaistos-disc
# Side panel on existing Zodiac: Z-13, Z-32 remaining ciphers

# Generic-technique exhibits (Phase 10 — 2 new after Phase 0.5 audit)
# Already shipped per README (skip):
#   nomenclator (Hall II), book-cipher (Hall V), autokey (Hall III)
# New to build:
null-cipher-generic · microdot-stego

# Context / situation exhibits (Phase 11 — hall placement flexible)
cabinet-noir · station-hypo · bletchley-park

# Hall XIII — Ciphers in Culture (new hall, 5 new + 2 moved in)
# Moved in from Phase 7 / old Phase 9: gold-bug, dancing-men
# New: da-vinci-code · national-treasure · gravity-falls · cicada-3301 ·
#      popular-culture-survey
```

### 0e. Reality check

If any slug conflicts with an existing file, rename with a `-2` suffix or skip and
flag to Paul. Do not overwrite.

**Commit:** `phase 0 [round 3]: plan, checklist, slug reservations, hall restructure confirmed`

---

## Phase 0.5 — Shipped vs Round 3 audit

This phase did not exist in the original Round 3 draft. It was added after an
Apr 24 2026 audit revealed that extensive content had shipped since earlier
Round 3 planning. Several exhibits this prompt originally treated as "to build"
are already live. Before any build work begins, produce an authoritative
inventory separating **already-shipped**, **thin — needs upgrade**, and **truly
new** work.

### 0.5a. Inventory every exhibit spec in this prompt against what is shipped

Read `README.md` in the repo root. It is the authoritative current-state
manifest: lists every hall and every exhibit, and marks which have demos.

For every exhibit specified in Phases 1–11 of this prompt, record in
`docs/round3-shipped-audit.md` one of three states:

- **SHIPPED** — an exhibit page with the same slug already exists, is listed
  in the README's hall tables, and has a working demo per the README's
  62-demos claim.
- **THIN** — the exhibit exists but the Round 3 spec is substantively richer
  (more metadata, better visualization, cross-links missing, spec adds
  features the current page lacks). Candidate for in-place upgrade.
- **NEW** — the exhibit does not yet exist; this prompt must build it.

Known starting-point mappings (verify against README before trusting):

| Round 3 slug | State per README | Notes |
|---|---|---|
| `autokey` | SHIPPED (Hall III) | Round 3 originally planned as "autokey-generic" — not needed as a separate page; cross-reference from existing exhibit instead |
| `book-cipher` | SHIPPED (Hall V) | Round 3 originally planned as "book-cipher-generic" — not needed |
| `nomenclator` | SHIPPED (Hall II) | Round 3 originally planned as "nomenclator-generic" — not needed |
| `sigaba` | SHIPPED (Hall VII) | Round 3 planned as new — already exists; verify thin-vs-current |
| `typex` | SHIPPED (Hall VII) | Round 3 planned as new — already exists; verify thin-vs-current |
| `dorabella` | SHIPPED (Hall VIII, visualization-only) | Round 3 plans to MOVE to new Hall XII Unsolved — still required but as a move, not a new build |
| `des` | SHIPPED (Hall XI) | Hall XI Modern Cryptography already includes this |
| `diffie-hellman` | SHIPPED (Hall XI) | Round 3 planned to add — already exists; verify thin-vs-current |
| `rsa` | SHIPPED (Hall XI) | Same |
| `aes` | SHIPPED (Hall XI) | Same |
| `sha256` | SHIPPED (Hall XI) | Not originally in Round 3 scope — now a known Hall XI member |
| `alberti-disk` | SHIPPED (Hall III, MOVED) | Originally Hall VII Machines; README places in Hall III Polyalphabetic. This is correct — Alberti's disk was the first polyalphabetic, belongs with Vigenère's tradition. Round 3 does not need to re-place it. |

**IMPORTANT for Codebreaker bios:** README says Hall X now has 21 biographies
"from Al-Kindi (c. 850) through Turing, Rejewski, Tutte, Friedman, Clarke,
Driscoll, Marks to the 2011 Copiale team." Round 3 Phase 12 proposes 12
additions — read each existing bio first. Several are likely already present:
Clarke, Friedman, Driscoll, Marks probably shipped. Dilly Knox, Mavis Batey,
Joseph Rochefort, Arne Beurling, Herbert Yardley, GCHQ Trio, Bill Tutte solo,
David Kahn — verify individually. Produce a bio-skip-list.

### 0.5b. Catalogue thin upgrades

For every exhibit marked THIN in the inventory, write a short note in
`docs/round3-shipped-audit.md` describing what the Round 3 spec adds that
the current exhibit lacks. Example entries:

```
- `sigaba`: SHIPPED. Round 3 spec adds: "Pedagogical simplification" framing
  note, cross-link to KL-7 and Walker Spy Ring (new exhibit in Phase 4),
  "the US cipher that was never broken" positioning vs. Enigma comparison.
  Upgrade difficulty: light — copy edit + add cross-links.
  
- `rsa`: SHIPPED in Hall XI. Round 3 spec adds: interactive key-generation
  with user-chosen small primes, "factor the modulus" demonstration panel,
  signature-verification sub-demo, cross-link to GCHQ Trio (Hall X bio if
  still needed after bio audit), Cambridge Five sidebar. Upgrade difficulty:
  moderate — demo code addition plus cross-links.
```

### 0.5c. Produce the go-forward skip-list and upgrade-list

At the end of Phase 0.5, `docs/round3-shipped-audit.md` must contain three
tables:

1. **SKIP** — exhibits this prompt's later phases should not rebuild.
2. **UPGRADE** — already-shipped exhibits that get an in-place upgrade pass
   during the relevant phase. For each, the upgrade checklist goes into
   the relevant phase's checklist in `docs/worldupdates.md`.
3. **BUILD** — exhibits that need new construction per the original Round 3
   spec.

Then update `docs/worldupdates.md`: mark skipped items as `[SKIP — already
shipped]`, convert upgrades to a new checklist format `[UPGRADE]`, and
leave true new builds as regular `[ ]` unchecked.

### 0.5d. Use this inventory as the source of truth downstream

From this point forward, later phases read the skip-list/upgrade-list first.
If a phase's planned exhibit appears in SKIP, the phase logs a one-line note
in its worldupdates entry ("Exhibit X shipped before Round 3, skipped per
audit") and proceeds to the next item. If in UPGRADE, the phase does the
in-place upgrade instead of new construction. If in BUILD, proceed normally.

**Commit:** `phase 0.5 [round 3]: shipped audit, skip-list, upgrade-list`

---

## Phase 1 — Hall I expansion to "World Origins of Cryptography"

### 1a. Rename and restructure Hall I

Update `halls/ancient.html`:
- Title: `Hall I · World Origins of Cryptography`
- Subtitle: reflect the new geographic scope
- Hero copy: rewrite to include non-Mediterranean origins (Hebrew, Egyptian, Greek,
  Roman, Indian, Arabic). Replace the "two ciphers in this hall" hardcoded count.
- Date range on the header: extend to cover ~1900 BCE (Egyptian) through ~1350 CE
  (late classical Arabic cipher practice).

Current exhibits in Hall I (keep all):
- Atbash (~600 BCE Hebrew)
- Scytale (~500 BCE Greek)
- Caesar (~58 BCE Roman)
- ROT13 (modern Caesar variant)
- Polybius (~150 BCE Greek)

### 1b. Add four new Hall I exhibits

Build the following exhibits. Each gets its own file in `ciphers/[slug].html` and its
own card on the Hall I page.

**1. `kama-sutra` — Mlecchita Vikalpa (~4th c. CE India)**
- Metadata: Invented ~4th c. CE · Vātsyāyana · Substitution · 26 possible pairings for
  English (adapted) · "Not broken in its era — never deployed at serious scale".
- Historical context: One of the 64 arts women should learn per Vātsyāyana's Kama Sutra.
  Simple pairwise substitution — letters are paired and exchanged within each pair.
- How it works: Choose a pairing rule, swap each letter with its pair. Involutive.
- How it was broken: Frequency analysis trivially — it's a monoalphabetic substitution.
- What it teaches: The independence of the substitution idea — same concept emerged in
  multiple cultures. Teaches involution (cipher is its own inverse, like Atbash).
- Interactive demo: yes, simple swap engine.
- Template: `ciphers/atbash.html` (same involutive-substitution shape).
- References: Vātsyāyana's Kama Sutra Book I; David Kahn *The Codebreakers* pp. 74–75;
  Simon Singh *The Code Book* opening chapter.

**2. `egyptian-substitution` — Tomb of Khnumhotep II (~1900 BCE)**
- Metadata: Earliest known deliberate non-standard hieroglyphs · Egypt · Monumental
  inscription · Not deployed as operational secrecy · Status: "Historical — arguably
  cryptographic in intent."
- Historical context: Scribes carving Khnumhotep II's tomb at Beni Hasan deliberately
  substituted unusual hieroglyphs for common ones. Debated whether this was secrecy,
  religious veneration, or scribal art. David Kahn treats it as the earliest
  cryptographic act; others disagree.
- How it works: Substitute rare hieroglyphs for common ones.
- How it was broken: Not broken in antiquity — read by modern Egyptologists through
  context. Cryptanalysis was never attempted because it's not really operational
  secrecy.
- What it teaches: The earliest documented impulse toward deliberate obscurity in
  writing. The ambiguous line between secrecy, reverence, and style.
- **Track B visualization required:** An **annotated hieroglyph viewer** showing the
  relevant Beni Hasan inscription panels side-by-side with a standard-hieroglyph
  rendering of the same phrase. Hoverable markers on each unusual substitution
  explain what the standard glyph would have been, what was used instead, and what
  Egyptologists have proposed about why. Plus a small **hieroglyph browser** of the
  ~20 substitutions documented at Khnumhotep II, each with a gloss.
- Template: `ciphers/voynich.html` (visualization-only pattern, extended with the
  hieroglyph viewer).
- References: David Kahn *The Codebreakers* Ch. 1; Gardiner *Egyptian Grammar*;
  Newberry & Griffith *Beni Hasan* vol. I.

**3. `aeneas-tacticus` — Aeneas the Tactician's Ciphers (~360 BCE Greek)**
- Metadata: ~360 BCE · Aeneas of Stymphalus · Book cipher + transposition · Multiple
  systems described · "First written treatise on cryptographic techniques."
- Historical context: Greek military theorist whose surviving work *On the Defense of
  Fortifications* describes at least seven distinct ciphers and steganographic
  techniques — including needle-dot book ciphers (pinpricking letters in a text),
  astragalus dice-based ciphers, and transposition systems. Predates Caesar by 300
  years.
- How it works: Multiple systems; showcase the pinprick book cipher as the
  interactive one.
- How it was broken: Not broken in antiquity; broken trivially today.
- What it teaches: The first cryptographic typology. The origin of book ciphers.
- Interactive demo: yes — pinprick book cipher simulator (user pastes a text,
  specifies a message, the system highlights the "pinprick" positions).
- Template: `ciphers/beale.html` (book cipher pattern).
- References: Aeneas Tacticus *Poliorketika* (Loeb Classical Library translation);
  David Kahn *The Codebreakers* Ch. 1; Whitehead's 2001 commentary.

**4. `arabic-nomenclators` — Classical Arabic Cryptographic Tradition (~850–1400 CE)**
- Metadata: ~850–1400 CE · Baghdad, Damascus, Cairo · Nomenclator + frequency
  analysis countermeasures · Diverse systems · "Broke the era's European ciphers;
  resisted European cryptanalysis for centuries."
- Historical context: Al-Kindi's Risalah fi Istikhraj al-Mu'amma (~850 CE) is only
  the most famous document of a rich Arabic cryptographic tradition. Ibn al-Durayhim
  (1312–1361) and others produced the most comprehensive pre-modern cryptanalytic
  treatises. Mamluk and Ottoman courts used nomenclators that would not be matched
  in Europe for 300 years.
- How it works: Composite nomenclator with homophones and nulls, designed to defeat
  the frequency analysis that Al-Kindi himself had pioneered.
- How it was broken: Generally was not, in its era.
- What it teaches: The first cryptographic arms race happened in the Islamic world
  500 years before Europe. The first cryptanalysts built the first ciphers designed
  to resist them.
- Interactive demo: yes — Arabic nomenclator encode/decode with a simplified Mamluk
  codebook fragment (Latin transliteration for accessibility, noted clearly).
- Template: `ciphers/great-cipher.html` (nomenclator pattern).
- References: Al-Kindi *Risalah* (see Mrayati et al. 2003 edition/translation);
  Ibn al-Durayhim treatises; David Kahn *The Codebreakers* Ch. 3;
  *Cryptologia* special issues on Arabic cryptography.

**5. `rosetta-stone` — The Rosetta Stone (196 BCE, deciphered 1822)**
- Metadata: 196 BCE (carved) · Memphis, Egypt · Trilingual decree (hieroglyphic,
  demotic, Greek) · Key to deciphering Egyptian hieroglyphs · Deciphered by
  Jean-François Champollion 1822 (building on Thomas Young's earlier work).
- Historical context: A decree by Ptolemy V's priests, inscribed in three scripts.
  Discovered by French soldiers at Rashid (Rosetta) in 1799 during Napoleon's
  Egyptian campaign; transferred to British hands after 1801 Treaty of Alexandria;
  housed at the British Museum since 1802. The parallel Greek text (readable by
  19th-century scholars) provided the crib that cracked hieroglyphic script —
  a vocabulary that had been silent for ~1,400 years.
- **Framing note (important):** The Rosetta Stone is not itself a cipher. It is
  a decipherment aid — the key that unlocked a lost writing system. It belongs
  in a cipher museum because cryptanalysis and the decipherment of lost
  writing systems share the same fundamental method: leverage known-plaintext
  fragments to break unknown symbols. The Rosetta Stone IS the crib attack,
  applied to linguistics. The exhibit states this explicitly.
- Track B visualization required: **trilingual side-by-side viewer** showing
  the hieroglyphic, demotic, and Greek portions of the decree, with hoverable
  alignments demonstrating how Champollion used royal cartouche matching
  ("Ptolmys" → "Ptolemy" in the Greek) to establish the phonetic readings
  of specific hieroglyphs. Plus a **decipherment timeline** from Young's
  1814 demotic work through Champollion's 1822 announcement to the Institut
  de France.
- Template: `ciphers/great-cipher.html` extended with trilingual viewer pattern.
- Cross-links: Egyptian Substitution (Hall I; related context) · Phaistos
  Disc (Hall XII; parallel unsolved ancient inscription) · Known Plaintext
  Attack technique on cryptanalysis.html (same method applied to ciphers).
- References: British Museum *The Rosetta Stone*; Richard Parkinson *Cracking
  Codes: The Rosetta Stone and Decipherment* (1999); Jean-François Champollion
  *Précis du système hiéroglyphique* (1824); Andrew Robinson *Lost Languages*.

**6. `histiaeus-tattoo` — Histiaeus's Tattooed Messenger (~499 BCE Greek)**
- Metadata: ~499 BCE · Miletus (Ionia) · Histiaeus, Tyrant of Miletus ·
  Steganography (hiding the existence of the message, not its content) ·
  Reported by Herodotus · "The earliest documented steganographic
  communication in the West."
- Historical context: Herodotus (*Histories*, Book V, Chapter 35) records
  that Histiaeus, held at the Persian court of Darius I but wanting to
  signal his son-in-law Aristagoras to revolt, shaved the head of his most
  trusted slave, tattooed his scalp with the message "rise against Persia,"
  waited for the hair to grow back, and sent him to Aristagoras with
  instructions to "shave my head and look at it." The method has no
  cryptographic content — the message is plain Greek — but its concealment
  is the innovation: no intercept could find it without the keyword
  "shave." The Ionian Revolt that followed was a direct trigger for the
  Persian Wars.
- How it works: Steganography (from Greek *steganos*, "covered" + *graphein*,
  "to write"). Not a cipher — the message is plaintext; what is hidden is
  the *existence* of the message, not its readability. The distinction
  Shannon would later formalize: confidentiality (Alice and Bob can read,
  Eve cannot) vs. plausible deniability (Eve does not know communication
  is even occurring).
- How it was broken: Cannot be broken cryptographically — there is no
  cipher to attack. Can only be defeated by detection (Eve notices the
  shaved/tattooed scalp, or intercepts the messenger and searches his body).
  The method's vulnerability is slow delivery (weeks for hair to regrow)
  and the fragility of a single-messenger courier channel.
- What it teaches: The fundamental distinction between **cryptography**
  (hide the content) and **steganography** (hide the existence). Modern
  parallels: microdots, LSB image steganography, chaffing-and-winnowing,
  digital watermarking. Claude Shannon's confidentiality-vs-secrecy
  distinction starts here.
- Track B (concealment demonstration, NOT an encrypt/decrypt engine —
  steganography hides the existence of a message, not its content, and
  forcing a fake "encrypt" button onto scalp-tattooing is pedagogical
  theater). The visualization has two parts. **Part 1:** a simulation
  where the user types a plaintext message and chooses a concealment
  carrier (shaved scalp / wax tablet with text beneath the wax /
  innocuous letter with acrostic). The carrier is rendered visually;
  clicking "inspect" reveals the hidden message. The message itself is
  never enciphered — it remains plaintext throughout. **Part 2:**
  comparison viewer side-by-side with a Caesar cipher demo — same
  plaintext, one concealed, one encrypted — showing what an
  interceptor actually sees in each case. The whole point of the
  exhibit is that these are different operations; the visualization
  teaches that difference directly instead of pretending otherwise.
- Cross-links: Scytale (near-contemporary Greek cryptography),
  Aeneas Tacticus (pinprick book cipher, same era, different technique),
  Bacon's Cipher (Hall VIII — Renaissance steganography), Microdot Stego
  (Phase 10 — 20th-century descendant), Null Cipher Generic (Phase 10 —
  hides message in plain-looking text).
- Template: `ciphers/bacon.html` adapted for ancient Greek framing (bacon is
  the steganography template; this predates it by two millennia).
- References: Herodotus *Histories* Book V Ch. 35 (Loeb Classical Library
  edition, trans. A. D. Godley); David Kahn *The Codebreakers* Ch. 1;
  Simon Singh *The Code Book* Ch. 1; Mark Frary *De/Cipher* (2017) on the
  Histiaeus tradition; Kristie Macrakis *Prisoners, Lovers, and Spies: The
  Story of Invisible Ink from Herodotus to al-Qaeda* (2014) Ch. 1.

### 1c. Update Hall I page

Add all six new exhibits as cards in chronological order:

1. Egyptian Substitution (~1900 BCE)
2. Atbash (~600 BCE) — existing
3. Scytale (~500 BCE) — existing
4. Histiaeus's Tattooed Messenger (~499 BCE) — new
5. Aeneas Tacticus (~360 BCE) — new
6. Rosetta Stone (196 BCE carved; 1822 deciphered) — new
7. Polybius (~150 BCE) — existing
8. Caesar (~58 BCE) — existing
9. Kama Sutra Cipher (~4th c. CE) — new
10. Arabic Nomenclators (~850–1400 CE) — new
11. ROT13 (modern callout) — existing

Update the "This Hall" sidebar, prev/next chains, and any hero count copy.

### 1d. Upgrade existing Scytale exhibit (shipped) — scholarly-debate sidebar

The Scytale exhibit already exists at `ciphers/scytale.html`. Add a compact
side panel titled **"Was the Scytale Really a Transposition Cipher?"** that
summarizes the revisionist scholarly reading of the ancient Spartan device.
The traditional textbook account (Kahn, Singh, and most popular histories)
treats the scytale as a columnar transposition cipher — wrap a strip around
a rod of specific diameter, write the message along the rod, unwrap, read
the scrambled letters, rewrap on a matching rod to decode. This is the
story told in most pedagogical materials and in the existing exhibit.

**The revisionist reading** (Tomokiyo's *Scytale Not As a Transposition
Cipher* — `cryptiana.web.fc2.com/code/scytale.htm`, summary also at
Academia.edu): the primary-source evidence (Plutarch, Thucydides, Gellius)
does not unambiguously describe a transposition cipher; it describes a
*device for authenticating messengers and ensuring message integrity*,
more akin to a tally stick or seal than a cipher. Tomokiyo argues the
transposition interpretation is a modern imposition onto the ancient
sources, possibly dating only to David Kahn's *The Codebreakers* (1967).

The sidebar should honestly present both readings without adjudicating:
- Traditional: scytale = columnar transposition cipher (Kahn, Singh, common
  textbook)
- Revisionist: scytale = messenger-authentication device (Tomokiyo, some
  classicists)

Frame this as "scholarly debate worth knowing about" rather than "one side
is right." The demo itself can continue to implement the traditional
transposition interpretation — that's what the exhibit was built for, and
it's pedagogically useful — but the sidebar flags the scholarly
controversy.

References: Satoshi Tomokiyo, *Scytale Not As a Transposition Cipher*,
`cryptiana.web.fc2.com/code/scytale.htm` (summary version at
academia.edu/41881660); Plutarch *Life of Lysander* 19; Thucydides 1.131;
Aulus Gellius *Noctes Atticae* 17.9.

**Commit:** `phase 1 [round 3]: hall I expanded to world origins with 6 new exhibits`

---

## Phase 2 — Hall XII creation: "Unsolved Ciphers"

### 2a. Create the new hall page

New file: `halls/unsolved.html` following the pattern of `halls/puzzle.html`.
- Title: `Hall XII · Unsolved Ciphers`
- Subtitle: "Six centuries of unbroken mysteries — from the Voynich Manuscript
  to the Somerton Man."
- Hero: framing that connects the exhibits — what makes a cipher stay unsolved,
  the difference between unsolved-because-hard vs unsolved-because-no-
  ciphertext-exists, and why unsolved ciphers matter to the discipline. The
  hero copy must also include a short paragraph framing Hall XII as a
  **living research area**, not a static catalogue. Suggested language:

  > Hall XII is not a museum of dead mysteries. Every year, historical
  > cryptographers break ciphers that were considered permanently
  > unreadable — the **Copiale Cipher** in 2011, the **Zodiac Z-340** in
  > 2020, **Mary Stuart's Castelnau letters** in 2022 (see Hall II),
  > **Patterson's cipher for Jefferson** in 2007 (also Hall II). Teams
  > including George Lasry, Norbert Biermann, Satoshi Tomokiyo, Nick
  > Pelling, Beáta Megyesi, and Elonka Dunin maintain active research
  > programs that have cracked more 16th-to-19th-century ciphers in the
  > past fifteen years than the previous century combined. The exhibits
  > below are the ones we still can't read. Some will almost certainly
  > move to other halls in future expansions, once the research community
  > breaks them. That's not a flaw in the hall — it's the hall's purpose.

- "Hall XII of 13" footer line.
- Prev link: Hall X Codebreakers. Next link: Hall XIII Ciphers in Culture.

### 2b. Move existing exhibits into Hall XII

Do NOT delete the exhibit pages. The pages stay at their current URLs
(`ciphers/voynich.html`, etc.) — only their hall assignment changes.

Exhibits to reassign from Hall VIII to Hall XII:
- `voynich` (was Hall VIII) → Hall XII
- `kryptos` (was Hall VIII) → Hall XII. See section 2b-bis below for the
  CRITICAL upgrade pack that must accompany this move — the existing page
  predates the August–October 2025 events that substantially changed the
  Kryptos story.
- `beale` (was Hall VIII — whole exhibit moves; #2 is solved but #1 and #3
  remain unsolved)

Update on each moved exhibit:
- Breadcrumb: now `Entrance › Museum Map › Hall XII › [Exhibit]`.
- Previous / next exhibit pointers: update to new Hall XII order.
- Meta description if it references Hall VIII.

### 2b-bis. Kryptos expansion pack (CRITICAL — major 2025 developments)

**Context:** The existing `ciphers/kryptos.html` page pre-dates the August–
October 2025 events that fundamentally changed the Kryptos story. It must
not only move to Hall XII — it must be substantially expanded. Treat this
as a multi-part upgrade, not a simple reassignment.

**What changed in 2025 that the current exhibit does not reflect:**
1. **August 2025:** Jim Sanborn publicly announced he would auction the
   solution to K4, citing declining physical, mental, and financial
   resources. He confirmed the long-rumored existence of **K5** — a fifth
   coded message that will reveal itself after K4 is solved. (*Washington
   Post*, August 14, 2025; open letter on elonka.com/kryptos, August 2025.)
2. **September 2025:** Journalists Jarett Kobek and Richard Byrne
   discovered scraps of text among Sanborn's papers donated to the
   Smithsonian Archives of American Art (donated circa 2023). When
   assembled, the scraps produced what appeared to be the full K4
   plaintext. Sanborn confirmed its accuracy. Kobek and Byrne report that
   Sanborn's lawyers threatened them with copyright infringement and
   tortious interference claims when they refused to sign NDAs.
3. **October 2025:** Sanborn requested the Smithsonian seal the K4-
   plaintext files for 50 years (until 2075). The Smithsonian complied.
4. **October 16 – November 20, 2025:** RR Auction held a sale titled
   *"Decoding History: Kryptos, Enigma and the Rosetta Stone."* Sanborn's
   Kryptos archive — the K4 solution, a prototype sculpture, encryption
   tables, and related ephemera — **sold for $962,500**. A signed first-
   edition set of Howard Carter's *The Tomb of Tut-ankh-Amen* was sold
   in the same catalogue, a deliberate curatorial pairing by the auction
   house (see item 5 below for why Carter matters to Kryptos).
5. **Carter connection (finally closed):** K3's plaintext has long been
   known to be a paraphrase from Carter's 1923 account of opening
   Tutankhamun's tomb. In July 2025, it was noted that "LAYERTWO" — the
   last phrase of K2's corrected plaintext — matches page 170 of Carter's
   account: "what we may call the second layer," referring to a painted
   treasure chest that puzzled the excavation team. The Carter thread runs
   through the whole sculpture.

**Action: upgrade `ciphers/kryptos.html` with these additions** (keep
the existing K1–K3 solved narrative; extend rather than replace):

#### Added fact panels on the exhibit page

- **"The Full Installation" panel.** The current exhibit likely covers
  only the copper S-screen. Per the CIA's own page (cia.gov/legacy/
  headquarters/kryptos-sculpture/), Kryptos is **two installations
  that form one artwork**: (1) the courtyard copper S-screen with the
  four encoded panels, and (2) the entrance installation with red
  granite and copperplate constructions flanking the walkway, featuring
  International Morse code, ancient ciphers, and a lodestone co-located
  with a navigational compass rose. Add a diagram showing the campus
  layout with both installations marked.
- **"1,735 letters" panel.** The authoritative count from the CIA page
  is 1,735 alphabetic letters cut into the copper screen. The often-
  cited "1,800 letters" figure is from Sanborn's assistant David Sheldon
  and is an approximation of the work involved, not the final count.
  Many sources have both; the exhibit should cite the CIA number as
  authoritative and explain the discrepancy briefly.
- **"K0 — the Morse code panels" panel.** The Morse code messages on
  the entrance granite slabs are sometimes called K0. They include
  fragments like "VIRTUALLY INVISIBLE," "DIGETAL INTERPRETATIT" (sic —
  possibly "INTERPRETATIO" with a dash), "SHADOW FORCES," "LUCID
  MEMORY," "T IS YOUR POSITION," plus prosigns SOS and RQ. Source:
  cryptographer Jim Gillogly's photos, catalogued at voynich.net/Kryptos.
  Framing note: Kryptos is NOT just four passages; it's a multi-layered
  artwork in which the Morse and compass/lodestone pieces are part of
  the puzzle.
- **"The Scheidt partnership" panel.** Sanborn worked for four months
  with **Edward Scheidt**, a retiring CIA cryptographer, to design the
  cipher systems. Scheidt rated the difficulty 9 out of 10 and intended
  the puzzle to be solved "in five to ten years." Scheidt also stated
  there was an intentional "change in the methodology" for K4 — it uses
  a different cipher than K1–K3. Source: Wikipedia citation 9
  (Scheidt quotes, numerous interviews).
- **"The Bauer/Link/Molle Hill cipher conjecture" panel.** One line of
  the Vigenère tableau on the right side has an extra L. Bauer, Link,
  and Molle published a 2016 *Cryptologia* paper conjecturing that with
  that extra L, the letters HILL appear consecutively down the rightmost
  column — a hint that K4 may use the **Hill cipher** (matrix
  encryption). Since Kryptos already exists in the museum as a cross-
  link target and Hill cipher is shipped as its own Hall II exhibit,
  add a cross-link in both directions. Cite: Bauer, Link, Molle (2016),
  *Cryptologia* 40(6), p. 548.
- **"K4 clues released over time" panel** — timeline format:
  - November 2010: NYPVTT (positions 64–69) → BERLIN
  - November 2014: MZFPK (positions 70–74) → CLOCK
  - August 2020: FLRV (positions 22–25) → EAST
  - January 2020: QQPRNGKSS (positions 26–34) → NORTHEAST
  - 2025: Sanborn confirmed the "clock" reference is specifically to the
    **World Clock at Alexanderplatz** in Berlin.
- **"Passage 2 correction" panel.** Until 2005–2006, the accepted K2
  plaintext ended "WESTIDBYROWS." In 2005, Canadian logician Nicole
  Friedrich proposed "WESTXLAYERTWO." In April 2006 Sanborn confirmed
  Friedrich was correct — he had omitted an S in the ciphertext when
  transcribing to the sculpture. "LAYERTWO" later matched Carter's
  Tutankhamun excavation language (page 170 of his 1923 book), tying
  K2 to K3 to K4 via the Carter thread.
- **"2025: Sale and seal" panel** — the full saga:
  - Sanborn's open letter (Aug 14, 2025): auction intent, K5 confirmation,
    quote "Power resides with a secret not without it"
  - Kobek/Byrne Smithsonian discovery (Sept 2025)
  - Sanborn requests 50-year seal (until 2075)
  - RR Auction "Decoding History" sale, Oct 16–Nov 20, 2025
  - Final hammer price: **$962,500**
  - K5 exists and is still unrevealed
  - Frame this as "the sculpture's cryptographic story is now mostly
    closed, but the artistic and ethical story — about auctioning a
    public-art puzzle, about journalists who refused an NDA — is still
    open."
- **"Sanborn's other cryptographic sculptures" side panel** — context
  most Kryptos exhibits miss:
  - **Cyrillic Projector** (1991–1998, University of North Carolina at
    Charlotte): encrypted Russian Cyrillic text that includes an extract
    from a classified KGB document. Solved in 2003 by an international
    team including Frank Corr, Mike Bales, and Elonka Dunin. The
    extract is from a 1950s-era internal KGB directive describing
    signals-intelligence tradecraft.
  - **Antipodes** (1997, Hirshhorn Museum, Washington D.C.): one side
    repeats part of the Kryptos text with slight differences; the
    other side repeats part of the Cyrillic Projector text. Framed as
    Sanborn's two previous codes "in conversation."
  - **Untitled Kryptos Piece** (variously dated): smaller works Sanborn
    produced during the Kryptos period.
  References: Dunin *The Mammoth Book of Secret Codes and Cryptograms*
  (2006) pp. 495–502; Dunin *Kryptos: The Unsolved Enigma* in Burstein
  & de Keijzer *Secrets of the Lost Symbol* (2009).

- **"Prior public solvers" panel** — the K1–K3 solution history was
  itself a multi-agency race, now fully declassified:
  - **NSA team (1992–1993):** led by Ken Miller with Dennis McDaniels
    and two unnamed cryptanalysts, following a 1992 challenge from
    Deputy Director William Studeman. By June 1993 they had solved
    K1–K3. Classified until a 2013 FOIA request by Elonka Dunin pried
    the documents loose.
  - **David Stein (1998):** CIA physicist/analyst. Solved K1–K3 using
    only pencil and paper on his own time. Disseminated internally only
    until July 1999. His 1999 paper *The Puzzle at CIA Headquarters:
    Cracking the Courtyard Crypto* in *Studies in Intelligence* 43(1)
    is declassified and linked from the CIA FOIA reading room.
  - **Jim Gillogly (1999):** California computer scientist. Announced
    his computer-aided solution publicly in June 1999 — the first
    unclassified solver known to the public. *NYT*, June 16, 1999.
  Framing: the story the current exhibit likely tells emphasizes
  Gillogly. The fuller story is that three teams solved K1–K3
  independently across six years, but only Gillogly's could talk about
  it at the time.

- **"Sanborn's workshop — David Sheldon" side panel.** In 1990 Sanborn
  hired Pratt Institute MFA graduate **David Sheldon** as a studio
  assistant. Sheldon's job was to cut the sculpture's ~1,800 individual
  three-inch-high letters — vowels and consonants — out of quarter-inch
  copper plate. Sheldon described the work as "grueling" and "thrilling"
  and accompanied Sanborn to the CIA grounds for the installation. He
  was not privy to the encoded messages but observed suspected code-
  breakers peering into the studio windows at night in the weeks before
  the 1990 dedication. Sheldon continues to work as an artist
  (sheldonstudioworks.com). This is color, not bio-card material —
  include as a short paragraph or sidebar. Source: SPYSCAPE, "Kryptos:
  The Cryptic CIA Mystery Is Bigger Than You Think" (interview with
  Sheldon and former CIA officer / SPYEX consultant Doug Patteson).

- **"Intentional misspellings — or are they?" panel.** Three misspelled
  words appear in the deciphered plaintext:
  - **IQLUSION** (for ILLUSION) in K1
  - **UNDERGRUUND** (for UNDERGROUND) in K2
  - **DESPARATLY** (for desperately) in K3, paraphrasing Carter
  Sanborn has consistently claimed these are intentional ("most of my
  things are rife with mistakes on purpose" — *Wired*, Jan 2005). But
  the original coding charts Sanborn made, released in 2010, tell a
  more ambiguous story:
  - On line 7 of the charts, the keyword PALIMPSEST is written
    **PALIMPCEST** (with a C instead of an S). Combined with the L in
    ILLUSION, the C produces a K in the ciphertext — which is what
    appears on the sculpture. If the keyword had been spelled correctly,
    the ciphertext would have been W, not K. So the K1 "misspelling"
    may trace to a keyword typo, not an intentional plaintext error.
  - For K2's UNDERGROUND→UNDERGRUUND, the coding chart has correct
    spelling of both plaintext and keyword — but the ciphertext
    letter E changed to R during sculpture transcription. That R
    decrypts to U with the KRYPTOS Vigenère tableau.
  Plus the now-famous **omitted-S error** in K2 that Sanborn confirmed
  in 2006 changed "WESTIDBYROWS" to "WESTXLAYERTWO."
  Sanborn's own explanation for why he never corrected the sculpture:
  "You could not make any mistake with 1,800 letters. It could not be
  repaired." The exhibit should hold both positions honestly: some
  "errors" are likely intentional art; others propagated from a
  four-month workshop with no correction opportunity. References:
  *NYT* "Original Decoding Charts for Kryptos" (Nov 20, 2010);
  *Wired* "Typo Confounds Kryptos Sleuths" (Zetter, Apr 20, 2006).

- **"The YAR superscript" panel.** Three letters — **YAR**, near the
  beginning of the bottom half of the left side — are the **only
  characters on the entire sculpture in superscript**. No public
  explanation exists. Elonka Dunin's community has catalogued this as
  a likely deliberate pointer; the exhibit should note it and invite
  visitors to form their own hypotheses.

- **"Who is WW?" panel.** The decrypted K2 plaintext contains: "WHO
  KNOWS THE EXACT LOCATION? ONLY WW." Sanborn has been deliberately
  coy. The leading conjecture, endorsed by Dunin and others, is
  **William Webster**, Director of Central Intelligence at the November
  3, 1990 dedication. Sanborn confirmed he gave Webster a sealed
  envelope during the ceremony and has variously described it as
  "the solution" and "not the entire solution." Whether Webster's
  copy survived, what it contained, and whether the Smithsonian scraps
  or the auction-winner's material is consistent with it — all open.

- **"The death contingency" panel.** In a 2005 *Wired* interview,
  Sanborn stated that "should he die before the entire sculpture is
  deciphered, he had put in place a method by which a correct solution
  could be confirmed." The 2025 auction effectively superseded this
  arrangement. Sanborn, diagnosed with cancer during the preparation
  of his Smithsonian archive donation, gave the following reason for
  selling: he no longer had the physical, mental, or financial
  resources to manage the puzzle's verification infrastructure
  himself. The exhibit frames this ethically: who inherits a public-
  art cipher's answer-key when the artist can no longer keep it?

- **"The 2019 Kryptos Dinner" sidebar.** Journalist Jarett Kobek
  reports that at an annual invitation-only Kryptos Dinner in March
  2019, attendees could submit K4 candidates to Sanborn directly.
  Kobek's interview subjects say Sanborn remarked at that dinner
  that he "did not care" what method someone used to solve K4. This
  is relevant because the 2025 Kobek/Byrne discovery was not a
  cryptographic solve — they found the plaintext in Sanborn's own
  donated papers. The ethical debate that followed (the auction
  house's copyright-infringement threats, Kobek's refusal to sign
  an NDA) is contextualized by Sanborn's own earlier "didn't care"
  comment. Source: *Zona Motel* interview with Kobek and Byrne,
  October 17, 2025.

- **"Kryptos in popular culture" cross-link panel** — explicit pointer
  to Hall XIII (Ciphers in Culture) because Kryptos's cultural reach
  is huge:
  - Dan Brown's *The Da Vinci Code* (2003): book-jacket back cover
    shows Kryptos K2 coordinates in faint red (one degree off — "the
    discrepancy is intentional" per Brown). The "tear" artwork hides
    upside-down text "Only WW knows" referencing K2's WW mention.
  - Dan Brown's *The Lost Symbol* (2009): Kryptos featured more
    prominently.
  - *Alias* Season 5, "S.O.S.": a small Kryptos appears; Marshall
    Flinkman claims to have cracked it during a CIA tour.
  - *The Recruit* Season 1, Episode 6, "I.N.A.S.I.A.L.": "Kryptos
    Donuts" reference.
  The Kryptos exhibit should link forward to Hall XIII's Da Vinci Code
  and Popular Culture Survey exhibits (built in Phase 9).

#### Required interactive additions

The existing Kryptos page per the repo README has a working K1/K2 solver
(keyed Vigenère with PALIMPSEST and ABSCISSA) and a K3 transposition
demo. Extend with:

- **K0 Morse decoder** — paste the Morse sequence from the entrance
  granite slabs (or load it from a preset), hear it played back at
  user-selectable WPM (Web Audio API), and see the decoded text.
  Cross-link to the Morse Code exhibit in Hall V (new in Phase 5).
- **K4 clue visualizer** — interactive display of the K4 ciphertext with
  the four released plaintext windows (EAST at 22–25, NORTHEAST at
  26–34, BERLIN at 64–69, CLOCK at 70–74) highlighted. User can hover
  over any position to see "known / unknown" status.
- **Installation map** — SVG or interactive aerial-view diagram showing
  the three installation zones (Entrance / Courtyard Plaza / Courtyard
  Lawn) with clickable markers for each component. Based on the
  bird's-eye-view photos by Elonka Dunin (elonka.com/kryptos/
  KryptosAerial.html).

#### Cross-links to build

- → Hill Cipher (Hall II): Bauer/Link/Molle conjecture.
- → Vigenère (Hall III): K1 and K2 use keyed Vigenère; tableau on the
  right side of the sculpture is a Vigenère tableau.
- → Transposition (Hall IV): K3 uses columnar transposition.
- → Morse Code (Hall V, new Phase 5): K0 uses Morse.
- → Rosetta Stone (Hall I, new Phase 1): Carter/Tutankhamun thread;
  Sanborn was clearly fascinated by ancient decipherment.
- → Da Vinci Code and Popular Culture Survey (Hall XIII, new Phase 9):
  cultural reach.
- → Elonka Dunin (Hall X bio — VERIFY in Phase 0.5 audit; if not
  present, add in Phase 12): she's the most prolific Kryptos
  cryptographer outside Sanborn himself and ran the FOIA that pried
  the 1992 NSA solution documents loose in 2013.

#### References (add/verify present)

- CIA, *"Kryptos" Sculpture*, cia.gov/legacy/headquarters/kryptos-
  sculpture/ — authoritative institutional source; cite for the
  1,735-letter count and the two-installation description.
- *Washington Post*, "The 'Kryptos' code has gone unsolved for 35 years.
  Now it's up for sale" (Aug 14, 2025).
- *The New York Times*, "A C.I.A. Secret Kept for 35 Years is Found in
  the Smithsonian's Vault" (Oct 16, 2025).
- Bauer, Link, Molle, "James Sanborn's Kryptos and the matrix
  encryption conjecture," *Cryptologia* 40(6) (2016), p. 548.
- Bean, "Cryptodiagnosis of 'Kryptos K4'," 4th International
  Conference on Historical Cryptology HistoCrypt (2021).
- Dunin, *The Mammoth Book of Secret Codes and Cryptograms* (Constable
  & Robinson, 2006).
- Dunin, "Kryptos: The Unsolved Enigma," in Burstein & de Keijzer,
  *Secrets of the Lost Symbol* (HarperCollins, 2009).
- RR Auction catalogue, *"Decoding History: Kryptos, Enigma and the
  Rosetta Stone"* (Oct 16 – Nov 20, 2025).
- Sanborn's open letter, August 2025, elonka.com/kryptos/
  OpenLetterAug2025.html.
- SPYSCAPE, "Kryptos: The Cryptic CIA Mystery Is Bigger Than You
  Think" — for Sheldon assistant interview detail and Patteson SPYEX
  comments.
- Stein, "The Puzzle at CIA Headquarters: Cracking the Courtyard
  Crypto," *Studies in Intelligence* 43(1) (1999) — CIA's own David
  Stein pencil-and-paper solution.

#### Commit for the Kryptos expansion pack

`phase 2b-bis [round 3]: kryptos exhibit expanded with 2025 auction saga, K5 confirmation, full installation, K0 morse, Scheidt partnership, Hill conjecture, Sanborn other sculptures`

### 2c. Add the five new unsolved exhibits

**Reminder:** All five are **Track B** — no encrypt/decrypt engine is possible
(they're unsolved), but each MUST ship with at least one substantive interactive
visualization per the universal Interactive Demo Requirements.

**1. `dorabella` — Dorabella Cipher (1897 England)**
- Edward Elgar's 87-character encrypted note to Dora Penny. 128 years unsolved.
- Visualization required: **annotated ciphertext viewer** — the 87 characters
  rendered at high resolution with hoverable glyph counts and candidate-mapping
  overlays from the top three published decipherment attempts (Tim Roberts 2007,
  Eric Sams, Anthony Thorley). Plus a **glyph frequency browser** showing how
  Dorabella's symbol distribution compares to English letter frequencies.
- Template: `ciphers/voynich.html`.

**2. `shugborough` — Shugborough Inscription (~1748 England)**
- Eight letters carved on the Shepherd's Monument at Shugborough Hall. Claimed
  connections to Arcadia, the Priory of Sion myth, and Dan Brown's imagination.
- Visualization required: **annotated photo viewer** of the inscription with
  hoverable letter positions, plus a **decipherment-attempts timeline**
  showing each of the major proposed solutions (Oliver Lawn, Bletchley veterans
  2004; Keith Massey; Richard Kemp) with evidence-strength indicators.
- Template: `ciphers/voynich.html`.

**3. `dagapeyeff` — D'Agapeyeff Cipher (1939)**
- Alexander D'Agapeyeff included a challenge cipher in his textbook *Codes and
  Ciphers*, then retracted it in later editions claiming he'd forgotten the key.
- Visualization required: **annotated ciphertext viewer** with the 395-digit
  sequence grouped into candidate 5-digit blocks, plus a **frequency analyzer**
  that lets the user test digit-pair distributions against candidate ciphers
  (Polybius + columnar transposition being the leading hypothesis).
- Template: `ciphers/voynich.html`.

**4. `somerton-man` — Somerton Man / Tamám Shud (1948 Australia)**
- Unidentified body on Somerton Beach, Adelaide. Pocket contained a torn scrap
  reading "Tamám Shud" ("it is ended") from Omar Khayyam's Rubáiyát. A separate
  copy of the Rubáiyát with a pencilled cipher surfaced. Body identified in 2022
  via genealogy; cipher remains unbroken.
- Visualization required: **case-file timeline** (1948 discovery → 2022
  identification → cipher still unsolved) plus an **annotated viewer** of the
  five pencilled lines with letter-frequency analysis, initialism-hypothesis
  overlays (candidate acronym expansions proposed by University of Adelaide's
  Derek Abbott team), and a visual showing how the cipher letters compare to
  English first-letter frequencies.
- Template: `ciphers/zodiac.html`.

**5. `mccormick` — Ricky McCormick Cipher (1999 US)**
- Two sheets of encrypted notes found in the pocket of Ricky McCormick, a murder
  victim in Missouri, June 1999. FBI Cryptanalysis and Racketeering Records Unit
  publicly requested help in 2011; still unsolved.
- Visualization required: **side-by-side annotated viewer** of both notes with
  searchable parentheses-delimited group identification, plus a **pattern
  explorer** showing the unusual syntactic features (lines ending with NOTE,
  parenthetical groupings, repeated trigrams) that FBI's CRRU has flagged as
  potentially meaningful.
- Template: `ciphers/zodiac.html`.

**6. `phaistos-disc` — The Phaistos Disc (~1700–1600 BCE Minoan Crete)**
- Clay disc discovered by Italian archaeologist Luigi Pernier at the Minoan
  palace of Phaistos in 1908. Both sides impressed with 241 tokens using 45
  distinct stamps — the earliest known example of movable-type printing,
  predating Gutenberg by ~3,200 years. The symbol system is undeciphered.
- Metadata: ~1700–1600 BCE · Crete · 45 distinct glyphs · 241 total impressions ·
  Spiral arrangement · Language unknown · "One of the most controversial
  inscriptions in cryptography and linguistics."
- Status: Many claimed decipherments; none accepted by scholarly consensus.
  Gareth Owens's 2022 "99% there" claim (Minoan prayer to a mother goddess)
  remains contested. The brevity of the inscription (insufficient material
  for statistical analysis) and uniqueness of the symbol system mean no
  reliable cryptanalytic approach currently applies.
- Visualization required (Track B): **interactive spiral viewer** of both
  faces of the disc with hoverable annotations on each glyph showing:
  glyph ID (A01–A45 per Evans's numbering), stamp count, adjacent-glyph
  statistics, and candidate readings from the top three published
  decipherment attempts. Plus a **glyph catalog** browsable as a table with
  frequency counts — letting users attempt their own frequency-analysis
  approach honestly.
- Template: `ciphers/voynich.html` (visualization-only unsolved pattern).
- References: Luigi Pernier *Il disco di Phaistos* (1908); Arthur Evans
  *Scripta Minoa* (1909); Yves Duhoux *Le disque de Phaestos* (1977); Gareth
  Owens *Daidalika* (2016 onward); skeptical assessment in Thomas Balistier
  *The Phaistos Disc: An Account of Its Unsolved Mystery* (2000).

### 2d. Zodiac Z-13 and Z-32 side panel

Add a side panel to the existing `ciphers/zodiac.html` covering Zodiac's other
two unsolved ciphers (Z-13 "My Name Is" and Z-32 the location cipher). Link
prominently to the main Hall XII page.

### 2e. Update Hall VIII (Puzzle & Novelty)

After the moves, Hall VIII contains:
- Pigpen, Bacon's Cipher, Tap Code, Zodiac Cipher, Copiale, Gold-Bug (new, Phase 7)
- Cardano Grille (new, Phase 7)

Hall VIII subtitle shifts to emphasize "weak but historically fascinating" rather
than "including unsolved." Remove the "Unsolved" framing.

**Commit:** `phase 2 [round 3]: hall XI unsolved created, moves complete, 6 new unsolved exhibits (includes phaistos disc)`

---

## Phase 3 — Japanese & Pacific Theater additions

**Reminder:** All three exhibits below are **Track A** — each requires a
working encrypt/decrypt engine, Workbench integration, tests, Try It Yourself
block, and Break This Cipher puzzle per the universal Interactive Demo
Requirements above.

Build three new exhibits (all Hall VII):

**1. `jn-25` — Japanese Naval Code JN-25 (1939–1945)**
- The Imperial Japanese Navy's operational code. Broken by Station HYPO under
  Joseph Rochefort. Directly enabled the Midway victory. As operationally
  consequential as Enigma in the Atlantic.
- Metadata: 1939 · IJN · Enciphered code (superenciphered codebook) · ~33,000
  code groups · Broken continuously by US Navy cryptanalysts 1940–1945.
- How it works: Five-digit code groups from a shared codebook, then additively
  enciphered with a running key from a separate key book. Codebook reconstruction
  via frequency analysis on common phrases ("I have the honor to inform you").
- How it was broken: Rochefort's team at Station HYPO. Famous "AF = Midway" ruse
  where HYPO planted a fake message about water shortages at Midway and watched
  Japan radio "AF short of water."
- Template: `ciphers/lorenz.html` (codebook + superencipherment pattern).
- References: Kahn *The Codebreakers* Ch. 17; Edwin Layton *And I Was There*;
  Elliot Carlson *Joe Rochefort's War*; Jonathan Parshall & Anthony Tully
  *Shattered Sword*.

**2. `red-type-a` — Red (Type A, Japanese 1931–1938)**
- Purple's predecessor. Broken by Frank Rowlett's SIS team before they broke Purple.
- Metadata: 1931 · Japanese Foreign Ministry · Stepping-switch machine · Broken
  by SIS ~1935–1936 · Replaced by Purple (Type B) in 1939.
- How it works: Simpler stepping-switch design than Purple. Separate substitution
  for vowels and consonants (the design choice Purple inherited).
- Why it matters: The cryptanalytic bridge to Purple. SIS's success against Red
  was what enabled the conceptual leap to breaking Purple.
- Template: `ciphers/purple.html`.
- References: Kahn Ch. 1; Frank Rowlett *The Story of Magic*.

**3. Code Talkers expansion**: add side-panel on existing `navajo-code-talkers.html`
covering the lesser-known **Choctaw (WWI)**, **Comanche**, and **Hopi** code talker
programs. This is additive — preserve the existing Navajo content as primary.
- Include the documented postwar admission: Japan's chief of intelligence
  during WWII acknowledged that while his teams had broken U.S. Air Force
  codes, they had failed completely against the Navajo code. This single
  detail demonstrates what the museum teaches throughout — that a cipher's
  strength lies in the unfamiliarity of its underlying system to the
  attacker, not in its mathematical complexity alone.
- References: William Meadows *The Comanche Code Talkers of World War II*;
  Margaret Bender *Signs of Cherokee Culture*; Mark Frary *De/Cipher* (2017)
  on the Japanese chief of intelligence quote; official Navajo Code Talkers
  Association archives.

**Commit:** `phase 3 [round 3]: JN-25, Red Type A, Code Talkers expansion`

---

## Phase 4 — WWII / Interwar machine additions

**Reminder:** All six exhibits below are **Track A**. For the rotor/stepping-
switch machines (Fialka, KL-7, SIGABA, Typex, Geheimschreiber), the engine
must simulate real rotor stepping and wiring — pull faithful configurations
from the cited references. For machines where full public specifications are
classified or partial (SIGABA, KL-7 internals), implement a pedagogically
accurate simplified model and clearly label it a "pedagogical simplification"
in the Reality section of the exhibit.

Build these new exhibits (all Hall VII):

**1. `fialka` — Fialka M-125 (USSR 1956)**
- Soviet Cold War rotor cipher machine. 10 rotors (vs Enigma's 3–4). Used by
  Warsaw Pact militaries through the 1980s. Declassified 2005.
- Template: `ciphers/enigma.html`.
- References: Crypto Museum Foundation Fialka documentation; NSA declassified
  assessments.

**2. `kl-7` — KL-7 ADONIS (US 1952–1968)**
- Successor to SIGABA for US and NATO tactical comms. Compromised by the Walker
  spy ring 1968–1985 — one of the worst cryptographic disasters of the Cold War.
- Template: `ciphers/enigma.html`.
- References: Pete Earley *Family of Spies*; David Kahn *The Codebreakers*
  revised ed. Ch. 25.

**3. `sigaba` — SIGABA / ECM Mark II (US 1940s)**
- The US cipher machine that was **never broken** by any adversary. Joint
  Army/Navy project by William Friedman and Frank Rowlett. The counter-example
  to Enigma.
- Template: `ciphers/enigma.html`.
- References: NSA monograph on SIGABA; Stephen Budiansky *Battle of Wits*.

**4. `typex` — Typex (UK 1937)**
- British Enigma-class rotor machine. Five rotors (vs German three). Never
  broken by Germany. Used through the 1950s.
- Template: `ciphers/enigma.html`.
- References: Hugh Sebag-Montefiore *Enigma: The Battle for the Code*;
  GCHQ historical publications.

**5. `geheimschreiber` — Siemens T52 Geheimschreiber (Germany 1940s)**
- German strategic teleprinter cipher, used for highest-level traffic alongside
  Lorenz. Broken by Swedish mathematician Arne Beurling in two weeks using only
  intercepted traffic — one of the great feats of solo cryptanalysis.
- Template: `ciphers/lorenz.html`.
- Side panel: **"The Fish Family — German Teleprinter Ciphers of WWII"**
  covering:
  - The British codename "Fish" for all German teleprinter ciphers. Individual
    systems got fish-specific codenames: **Tunny** (Lorenz SZ40/42), **Sturgeon**
    (Siemens T52 Geheimschreiber), **Thrasher** (Siemens T43 one-time tape,
    which was genuinely unbreakable when used correctly and is rarely
    discussed), **Mackerel** (a variant of the T43 family).
  - Why there are multiple German teleprinter systems: different branches of
    the German military adopted different machines. Lorenz for Army High
    Command Berlin–field, Siemens for Luftwaffe and Navy, T43 for highest-
    level strategic traffic.
  - The museum's Fish coverage: Lorenz (shipped, Hall VII) + Geheimschreiber
    (this exhibit). Thrasher/T43 is mentioned for completeness but not built
    as its own exhibit — the T43 was a true one-time-tape system and its
    decipherment depended on pad reuse rather than cryptanalytic attack on
    the algorithm. That story belongs more naturally in the VENONA exhibit
    (Phase 11) which addresses OTP reuse as a pattern.
  - Cross-link to Lorenz exhibit (Hall VII, shipped) and VENONA (Hall IX,
    Phase 11).
  References: Jack Copeland *Colossus: The Secrets of Bletchley Park's
  Codebreaking Computers* Ch. 3–4 (Oxford, 2006); Frode Weierud's Fish
  family documentation (cryptocellar.org); British TICOM reports DF-120
  and I-31 (declassified).
- References: Bengt Beckman *Codebreakers: Arne Beurling and the Swedish Crypto
  Program during World War II*; Swedish FRA historical publications.

**6. `kryha` — Kryha Cipher Machine (1924 Germany/Austria)**
- Alexander von Kryha's commercial interwar cipher machine. Marketed heavily to
  banks and diplomats. William Friedman broke a Kryha test message in under
  three hours, then Friedman and his team published the analysis to destroy
  Kryha's commercial prospects. Lesson in why "looks complex" ≠ "is secure."
- Template: `ciphers/jefferson-disk.html` (mechanical but not rotor).
- References: Kahn Ch. 13; NSA declassified Friedman analyses.

**7. `bazeries-cylinder` — Bazeries Cylinder (1891 France) — Hall VII**
- Metadata: 1891 · Commandant Étienne Bazeries, French military cryptanalyst ·
  20-disk wheel cipher device · Improvement on Jefferson's 1790s disk cipher
  (which Bazeries was likely unaware of — parallel invention) · Track A.
- Historical context: Bazeries, already famous for breaking Louis XIV's Great
  Cipher in the 1890s, designed the cylinder as a "secure" device for French
  military communication. He pitched it to the French Army, which rejected it
  after their own cryptographers (including the Marquis de Viaris) broke it.
  The same device, reinvented independently by Jefferson a century earlier and
  by several others since, became a recurring pattern: the **multi-wheel disk
  cipher** is conceptually tempting but operationally fragile.
- How it works: 20 numbered disks mounted on an axis, each carrying a
  scrambled alphabet. To encipher, align one row to the plaintext, transmit
  any other row as ciphertext. Keyspace: 20! × 25 ≈ 2.4 × 10^19 if both disk
  order and displacement row are secret.
- How it was broken: de Viaris (1893) showed that with enough ciphertext and
  known plaintext cribs, the disk arrangement leaks. Mathematically equivalent
  weakness to Jefferson Disk when used without additional randomization.
- Track A: engine simulates 20-disk cylinder. User can set disk order and
  alphabet scrambles via a seed or specific preset. Demo reproduces Bazeries's
  own published example from his 1901 book *Les Chiffres secrets dévoilés*.
- Cross-links: Jefferson Disk (Hall VII, shipped — parallel invention), M-94
  (below — US Army adoption of the concept), M-138-A (below — strip-form
  descendant), Bazeries cipher (Hall II, shipped — same inventor, different
  system), Great Cipher (Hall II, shipped — Bazeries's most famous break).
- Template: `ciphers/jefferson-disk.html` with 20-disk parameters.
- References: Étienne Bazeries, *Les Chiffres secrets dévoilés* (Paris:
  Fasquelle, 1901); Kahn *The Codebreakers* Ch. 7; Satoshi Tomokiyo,
  *Cryptiana*, "Commandant Bazeries' Codebreaking and His Candidate of the
  Man in the Iron Mask," `cryptiana.web.fc2.com/code/bazeries2.htm`.

**8. `m94-m138a` — M-94 and M-138-A: U.S. Army Manual Cipher Systems (1922–1944) — Hall VII**
- Metadata: M-94 adopted 1922, retired ~1943 · M-138-A (strip cipher) adopted
  1935, used through WWII · Both traceable to Jefferson Disk lineage · Track A.
- Historical context: In 1890 Col. Parker Hitt of the US Army described a
  wheel cipher system that was essentially a rediscovery of Jefferson's 1790s
  device. By 1922 the US Army had standardized it as the M-94 — 25 metal
  disks on a rod — and issued it widely for tactical communications. By 1935
  it was superseded by the M-138-A "strip cipher," which replaced the disks
  with printed paper strips mounted on a board. M-138-A was still in use in
  1941 at Pearl Harbor and across US State Department overseas posts; its
  compromise and weaknesses are part of why the US transitioned to SIGABA
  for strategic traffic. This exhibit fills the gap between Jefferson Disk
  (Hall VII, shipped — 1790s prototype) and M-209 (Hall VII, shipped — WWII
  hand cipher machine).
- How it works:
  - **M-94**: 25 numbered aluminum disks on a spindle, each with a scrambled
    alphabet. User arranges disks in key-ordered sequence, aligns plaintext
    on one row, transmits any other row as ciphertext. Essentially a
    Jefferson disk with an Army-standardized key distribution system.
  - **M-138-A**: Replaces disks with 30 printed paper strips, each bearing a
    scrambled alphabet, slotted into a metal frame. Operationally easier to
    reset and distribute than M-94; cryptographically similar.
- How they were broken: Both fall to the same multi-wheel-cipher attacks
  (de Viaris 1893, developed further by William Friedman in the 1920s).
  US cryptographers knew the M-94 and M-138-A were weak by the late 1930s
  but kept them in tactical use because they were fast, forgiving of
  operator error, and good enough for short-lifetime tactical messages.
- Track A: engine simulates both M-94 (25 disks) and M-138-A (30 strips) as
  a unified module with a variant-selector. The Break This Cipher puzzle
  uses a real-recovered M-138-A intercept from a declassified NSA exhibit.
- Cross-links: Jefferson Disk (Hall VII, shipped — direct ancestor), Bazeries
  Cylinder (above — parallel invention), M-209 (Hall VII, shipped —
  successor), SIGABA (Hall VII, Phase 4 — strategic successor), Parker Hitt
  (candidate Hall X bio — audit-gated).
- Template: `ciphers/jefferson-disk.html` adapted for 25-disk/30-strip dual mode.
- References: Parker Hitt, *Manual for the Solution of Military Ciphers* (US
  Army Signal School, 1916); William Friedman, *The Index of Coincidence and
  Its Applications in Cryptography* (Riverbank 1922, declassified); Kahn
  *The Codebreakers* Ch. 7 and Ch. 13; NSA Center for Cryptologic History,
  "US Army Cipher Devices 1915–1945" (declassified 1996); David Sherman
  *The First Americans: The 1941 US Codebreaking Mission to Bletchley Park*
  (NSA Center for Cryptologic History, 2016) for M-138-A operational context.

**Commit:** `phase 4 [round 3]: Fialka, KL-7, SIGABA, Typex, Geheimschreiber, Kryha, Bazeries Cylinder, M-94/M-138-A`

---

## Phase 5 — Missing European classical and polyalphabetic gaps

**Reminder:** All six exhibits below are **Track A** — standard pen-and-paper
algorithms with straightforward encrypt/decrypt engines.

Build these new exhibits:

**1. `trithemius` — Trithemius Cipher (1508 Germany) — Hall III**
- Johannes Trithemius's *Polygraphiae libri sex* (completed 1508, published 1518).
  The **first published polyalphabetic cipher** — the tabula recta Vigenère would
  later popularize. Closes the gap between Alberti (1467 manuscript) and Vigenère
  (1553 published).
- Template: `ciphers/vigenere.html`.
- References: Trithemius *Polygraphiae*; Kahn Ch. 4.

**2. `cardano-autokey` — Cardano's Autokey (~1550 Italy) — Hall III**
- Girolamo Cardano's true autokey concept (distinct from the Cardano Grille, which
  is Phase 7). Uses the plaintext itself as subsequent key material. Influenced
  Vigenère's later autokey variant.
- Template: `ciphers/vigenere.html` with autokey option.
- References: Cardano *De Subtilitate*; Kahn Ch. 4.

**3. `affine` — Affine Cipher — Hall II**
- Already in the Playground dropdown. Promote to its own exhibit.
- Formal cipher: C = (aP + b) mod 26 where gcd(a, 26) = 1.
- Teaches modular multiplication and inverses; the stepping stone to linear
  algebra ciphers like Hill.
- Template: `ciphers/caesar.html` (simple monoalphabetic pattern).
- References: standard cryptography textbooks (Stinson, Paar).

**4. `wheatstone-cryptograph` — Wheatstone Cryptograph (1867) — Hall VII**
- Charles Wheatstone's **clockwork** cipher device (not to be confused with the
  Playfair cipher he co-invented). Two concentric clocklike hands with different
  gear ratios. Distinct from Playfair and deserves its own exhibit.
- Template: `ciphers/jefferson-disk.html`.
- References: Wheatstone's own papers; Kahn Ch. 6.

**5. `argenti` — Argenti Family Ciphers (1500s–1600s Vatican) — Hall II**
- Matteo Argenti and his nephew Marcello, papal cryptanalysts whose handbook
  defined nomenclator design for 200 years. Their *Trattato in Cifra* is the
  origin of modern nomenclator theory.
- Template: `ciphers/great-cipher.html`.
- References: Aloys Meister *Die Geheimschrift im Dienste der päpstlichen Kurie*;
  Kahn Ch. 4.

**6. `wallis-ciphers` — John Wallis and the English Civil War (1640s) — Hall II**
- John Wallis, mathematician, broke Royalist nomenclators for Parliament during
  the English Civil War and then served every English government for 50 years
  without changing sides. Originator of professional English state cryptanalysis.
- Template: `ciphers/great-cipher.html` (nomenclator pattern).
- Will also need a corresponding Hall X bio — addressed in Phase 12.
- References: Wallis's own cipher notes in the Bodleian; David Kahn Ch. 4.

**7. `morse-code` — Morse Code (1837 USA) — Hall V**
- Samuel Morse and Alfred Vail's 1837 telegraph encoding. Dots and dashes
  representing the 26 Latin letters, 10 digits, and punctuation/procedural
  signals. Not strictly a cipher — it's a transmission encoding that was not
  designed to conceal — but its pervasive cultural role as "secret code"
  (every spy film, every prisoner-of-war scene) and its genuine cryptographic
  descendants (Fractionated Morse in Hall IV; Tap Code derived from Morse
  rhythms) earn it its own exhibit. Also the foundational example of
  variable-length lossless encoding that preceded Shannon by a century.
- How it works: Track A implementation with keyed-audio output (user types
  text, hears it played as dots/dashes; user types dots/dashes, sees text).
  Full International Morse table plus prosigns (SOS, AR, SK, etc.).
- How it was broken: Morse is a public encoding, not a cipher — it was never
  "broken" because concealment was never the goal. But the exhibit should
  honestly address how Morse-family ciphers (Fractionated Morse, Pollux)
  failed when operators assumed Morse's obscurity provided confidentiality.
- What it teaches modern cryptography: The distinction between encoding
  (make data transmissible) and encryption (make data confidential) —
  Shannon's foundational separation. Morse is a lossless variable-length
  source code; AES is a confidentiality transform. Muddling the two is a
  persistent beginner error.
- Cross-links: Fractionated Morse (Hall IV), Tap Code (Hall VIII), Chinese
  Telegraph Code (Hall V), Polybius Square (Hall I — fractionation parent),
  Shannon's *Communication Theory* (in Kerckhoffs exhibit, Phase 11).
- Break This Cipher puzzle: A Morse-encoded SOS + short phrase for decoding.
- Side panel: **"The Voyager Golden Record"** — the 1977 NASA interstellar
  message included "Per aspera ad astra" ("through hardships to the stars")
  encoded in Morse, etched on the gold-plated copper disc currently ~163
  astronomical units from Earth. Morse was chosen because its dot-dash
  structure is self-describing: any civilization that decodes the record's
  other playback instructions can derive Morse from its own signal-
  processing first principles. A humbling example of Morse's durability as
  a signal encoding. Cross-link to Post-Quantum section on modern.html
  (Voyager carries no encryption — nothing to break, only to interpret).
- Side panel: **"Morse + Cipher: The Standard Combination"** — through the
  late 19th and early 20th century, Morse was almost universally used as
  the *transmission* layer beneath other cryptographic systems. A military
  operator would encrypt with Vigenère, ADFGVX, or Playfair; convert the
  ciphertext letters to Morse; transmit over radio or telegraph; then the
  receiver reversed the process. The American military's Jefferson-Disk-
  descended field cipher wheels of WWI-WWII followed this pattern. Mark
  Frary (*De/Cipher*, 2017) describes this as the foundational operational
  pattern for signal cryptography from 1850 until the advent of fully
  electronic cipher machines. Cross-link to Enigma (also transmitted as
  Morse), Lorenz (transmitted as teleprinter code, an evolution of Morse),
  and the Zimmermann Telegram (transmitted as commercial Morse telegraph).
- Template: `ciphers/polybius.html` (alphabet-mapping pattern).
- References: Samuel Morse's 1844 "What hath God wrought" transmission;
  ITU-R Recommendation M.1677 (International Morse Code specification);
  Kahn *The Codebreakers* on telegraphic cryptography; Tom Perera
  *Telegraph Collector's Reference*; Mark Frary *De/Cipher* (2017) on the
  Morse+cipher combination pattern; NASA *Voyager Golden Record* Committee
  documentation (Sagan, Druyan, Lomberg, Ferris, Salzman 1977).

**8. `mary-stuart-castelnau-letters` — Mary, Queen of Scots' Castelnau Letters (1578–1584; deciphered 2022) — Hall II**
- Metadata: 1578–1584 · Mary Stuart during her English captivity · Correspondence
  with the French ambassador Michel de Castelnau de la Mauvissière and his
  network · ~57 previously-lost ciphered letters · Cipher system: complex
  homophonic substitution with nulls and keyword nomenclators · Deciphered
  February 2022 by **George Lasry, Norbert Biermann, and Satoshi Tomokiyo**
  and published in *Cryptologia* 46 (2022).
- Track B (visualization-only) — this is a solved historical system, but the
  exhibit frames it as a **decipherment triumph** rather than a cipher-to-play-
  with. Track A-style encryption would require the reader to work in period-
  authentic French, which defeats the pedagogical purpose.
- Historical context: Mary was placed under English house arrest by Elizabeth I
  in 1568. For the next 19 years, until her execution in February 1587, she
  maintained clandestine correspondence with French diplomats, Scottish
  loyalists, and Catholic plotters. The **Babington Plot** letters (1586) that
  condemned her are already an exhibit in Hall II — those were deciphered in
  real time by Thomas Phelippes. But the bulk of her earlier correspondence
  remained unread, because the ciphered originals were mixed with thousands
  of diplomatic documents in the Bibliothèque nationale de France and the
  keys were lost. In February 2022, Lasry/Biermann/Tomokiyo announced they
  had found 57 ciphered letters attributed to Mary among BnF's manuscript
  holdings, identified them by statistical analysis of the symbol distribution,
  broken the cipher system through frequency analysis and known-word anchoring,
  and produced the first readings in over 400 years.
- Visualization required (Track B):
  - **Annotated ciphertext viewer** — render one or two representative letters
    with the cipher symbols as rendered, and hoverable per-symbol annotations
    showing the recovered plaintext mapping (Latin/French letter + homophone
    index + null indicator).
  - **Decipherment timeline** — Phelippes 1586 → Bodleian and BnF archival
    dormancy → Tomokiyo's Cryptiana archival inventorying (early 2000s onward)
    → Lasry/Biermann/Tomokiyo 2022 cross-archive identification → *Cryptologia*
    publication February 2022 → ongoing scholarly reanalysis of Mary's known
    biography.
  - **Archival discovery panel** — short illustrated explanation of how 57
    letters were hiding "in plain sight" in the BnF's Castelnau papers
    (Fonds Français 3158, 15973, 15974), misfiled as diplomatic correspondence
    from Castelnau rather than as Mary's own writing. Frame this honestly: the
    letters weren't hidden, just mislabelled. The breakthrough was as much
    archival as cryptanalytic.
  - **What the letters revealed** — brief summary of the substantive historical
    content: Mary's network with Castelnau, her views on Elizabeth I, her
    plans for escape, her correspondence with the Duke of Guise and Archbishop
    of Glasgow (James Beaton). The 2022 paper and subsequent 2024 HistoCrypt
    follow-up by Biermann/Tomokiyo/Lasry on **cross-cipher errors** add
    substantial historical detail.
- What it teaches: (1) Historical cryptanalysis is still a live discipline —
  the 21st-century combination of searchable archive digitization + statistical
  analysis at scale + international research collaboration has unlocked
  hundreds of previously-unreadable historical ciphers. (2) Archival work is
  half of historical cryptanalysis; the other half is the mathematics. (3)
  Mary's recovered voice substantially changes the historical record of a
  figure scholars thought they knew.
- Cross-links: Babington Plot (same subject, different cipher corpus, different
  century's decipherment — 1586 vs. 2022), Copiale (another 2010s-era
  historical-cipher breakthrough by Knight/Megyesi/Schaefer), George Lasry bio
  (Hall X, new in Phase 12), Phaistos Disc (Hall XII — still-unsolved
  archival inscription for contrast), Elonka Dunin bio (Hall X, 2013 NSA FOIA
  on Kryptos — parallel example of community-driven historical cryptography
  research).
- Template: `ciphers/copiale.html` (homophonic + nulls historical-decipherment
  pattern) or `ciphers/great-cipher.html` (nomenclator period-appropriate
  pattern) — whichever exists. Extend with a trilingual viewer pattern
  adapted from the planned Rosetta Stone exhibit for side-by-side ciphertext /
  symbol key / plaintext display.
- References:
  - George Lasry, Norbert Biermann, Satoshi Tomokiyo, *Deciphering Mary
    Stuart's lost letters from 1578–1584*, **Cryptologia 46 (2022)**, pp.
    101–144. Open access at tandfonline.com; see also the authors' mirror at
    `cryptiana.web.fc2.com/code/mary_castelnau_e.htm`.
  - Norbert Biermann, Satoshi Tomokiyo, George Lasry, *What Encryption Errors
    Can Reveal: Cross-Cipher Errors in Mary Queen of Scots' Letters*,
    **HistoCrypt 2024**, dspace.ut.ee/items/29dac337-32e2-4b60-8ed7-19fb65ed108d.
  - Satoshi Tomokiyo, *Cryptiana*, Mary Stuart index pages
    (`cryptiana.web.fc2.com/code/mary.htm` and
    `cryptiana.web.fc2.com/code/mary_castelnau_e.htm`).
  - John Bossy, *Giordano Bruno and the Embassy Affair* (Yale, 1991) — the
    standard historiographical context for Castelnau's embassy, essential
    background for reading the recovered letters.
  - David Kahn *The Codebreakers* Ch. 4 on 16th-century English decipherment
    context (Phelippes, Babington, Walsingham).

**9. `patterson-jefferson-cipher` — Patterson's Cipher for Jefferson (1801; solved 2007) — Hall II**
- Metadata: 1801 · Robert Patterson (American mathematician, vice provost of
  the University of Pennsylvania) · Sent to Thomas Jefferson as a
  recommended "perfect cipher" for State Department correspondence · System:
  columnar transposition within a row-shuffled grid, plus per-row insertion of
  random junk characters and per-row right-shift by a numeric keyword ·
  Remained unsolved for **206 years** · Broken 2007 by **Lawren Smithline**
  (Center for Communications Research, Princeton) using hill-climbing search.
- Track B — solved historical system. Honestly framed as "a cipher that stumped
  the American founders for 200 years, then fell to a modern search
  algorithm." Interactive element is a visualization of the Smithline search
  process, not a user-executable encryption engine (though see note below).
- Historical context: In December 1801 Robert Patterson wrote to Jefferson
  proposing a cipher for American diplomatic use. Jefferson forwarded the
  system to James Madison (then Secretary of State) with enthusiasm, saying
  it was "the most perfect cipher he had ever seen." Patterson included a
  specimen ciphertext — a message for Jefferson to decrypt using the key
  Patterson had separately sent. The key arrived. Jefferson tried. Jefferson
  **failed** — we have his correspondence lamenting his inability to recover
  the plaintext. Jefferson tried again. Failed. Madison tried. Failed.
  Patterson's cipher was archived in Jefferson's papers, unresolved, where it
  remained for two centuries.
- The 2007 break: Lawren Smithline, a mathematician at Princeton's Center for
  Communications Research (IDA/CCR), encountered the cipher in a 2006
  Cryptologic Almanac article by Thomas Bowman. Smithline applied hill-
  climbing with an English-frequency fitness function, testing row-permutation
  hypotheses and stripping candidate junk-characters until the 40-row grid
  snapped into English text. The plaintext was the Declaration of
  Independence's opening lines — Patterson had used a patriotic plaintext for
  the specimen. Smithline's paper was published in the *American Scientist*
  (July–August 2009, Vol. 97, No. 4) under the title "Using Computers to
  Decrypt Jefferson's Cipher."
- How it works: The system has four layers.
  1. Write plaintext into a grid, N rows by M columns.
  2. Insert a random number of junk letters at the start of each row (the
     count is the row's secret number).
  3. Right-shift each row by a different amount (the row's second secret).
  4. Permute the row order according to a secret row key.
  The ciphertext is the grid read column-by-column. Jefferson couldn't solve it
  because the search space over row-permutation × per-row-junk-count × per-row-
  shift was too large for pencil-and-paper exhaustive search. Smithline's
  hill-climb is the exact same concept, but over 10⁹ candidate configurations
  per minute.
- Visualization required (Track B):
  - **The four-layer construction animation** — user pastes or loads a
    plaintext, the page animates each of the four transformation layers in
    sequence with the grid visualized.
  - **The Smithline search visualization** — given a ciphertext, show a
    live hill-climbing search: row permutations being tested, English-
    fitness scores rising/falling, candidate plaintexts emerging from
    noise. Simplified for pedagogy — actual Smithline search ran on
    more substantial compute. Target: educate users on what hill-climbing
    *feels like*, not reproduce production cryptanalysis.
  - **Jefferson's failed-attempts letters panel** — quote Jefferson's
    actual correspondence with Patterson and Madison expressing his
    inability to solve the specimen. Historical primary-source color.
- What it teaches: (1) Cipher strength is relative to the attacker's search
  capacity. A cipher that stumps 18th-century pencil-and-paper gives way to
  modern hill-climbing. (2) The asymmetry between encryption and decryption
  effort matters: Patterson encrypted his specimen in hours; Smithline
  decrypted it in minutes of CPU time, two centuries later. (3) The
  "founder's perfect cipher" narrative is a cautionary tale — Jefferson's
  confidence in Patterson's system was warranted at the time, but no cipher
  stays safe against unknown future attacks.
- Cross-links: Jefferson Disk (shipped Hall VII — Jefferson's other famous
  cipher contribution; note the sharp contrast between Jefferson's own wheel
  cipher, which IS strong, and Patterson's transposition-plus-junk system,
  which proved weaker than it looked), Columnar Transposition (Hall IV —
  shipped — fundamental mechanism that Patterson layered), Hill Climbing
  technique on cryptanalysis.html (the method that broke it), Double
  Transposition (Hall IV — shipped — broken 2013 by Lasry et al. via
  similar hill-climbing; same story, 200 years later).
- Template: `ciphers/jefferson-disk.html` adjusted for transposition-
  family framing, or `ciphers/double-transposition.html` extended with
  the two-century narrative layer.
- References:
  - Lawren Smithline, *Using Computers to Decrypt Jefferson's Cipher*,
    **American Scientist** 97, no. 4 (July–August 2009), pp. 278–285.
  - Thomas Bowman, *Jefferson's 'Perfect Cipher'*, Cryptologic Almanac
    (2006), NSA Center for Cryptologic History.
  - Robert Patterson to Thomas Jefferson, December 19, 1801 (Library of
    Congress, Jefferson Papers, Series 1, General Correspondence).
  - Thomas Jefferson to James Madison, April 22, 1802, and subsequent
    Jefferson–Patterson correspondence (Library of Congress Jefferson Papers).
  - Satoshi Tomokiyo, *Cryptiana*, "Patterson's Cipher for Jefferson —
    Challenge Solved After 200 Years," `cryptiana.web.fc2.com/code/jeffers4.htm`.
  - David Kahn *The Codebreakers* Ch. 7 on early American cryptography.

**Commit:** `phase 5 [round 3]: Trithemius, Cardano Autokey, Affine, Wheatstone, Argenti, Wallis, Morse Code, Mary Stuart Castelnau, Patterson's Cipher`

---

## Phase 6 — East Asia, South America, and global telegraphy

**Reminder:** Chinese Telegraph Code and Slidex are **Track A** — build full
engines. Zimmermann Telegram is **Track B** (visualization-primary) but MUST
ship with a simplified nomenclator decoder that lets the user paste a
simulated cipher group and watch the decoding process — treating it as a
Track A upgrade where possible.

Build these new exhibits:

**1. `chinese-telegraph-code` — Chinese Commercial Telegraph Code (1881) — Hall V**
- The four-digit numerical code developed to telegraph Chinese characters since
  the Morse era. Still in use in Chinese law enforcement, immigration, and
  shipping. A ~7,000-character-to-four-digit codebook.
- Metadata: 1881 · Septime Auguste Viguier (French customs officer in Shanghai),
  later expanded by multiple Chinese authors · Numerical codebook · ~7,000+ entries.
- How it works: Each Chinese character gets a unique four-digit code. Lookup-based.
  Not a cipher — a telegraphic encoding — but treated as one by intelligence
  services that intercepted it.
- Why it's here: Adds East Asia to the museum; teaches the distinction between
  code and cipher; operationally important for over 140 years.
- Template: `ciphers/dictionary-code.html` (closest existing shape).
- References: Jorge Luis Borges's essay on the Chinese Telegraph Code; Jonathan
  Ocko's historical work; Chinese Ministry of Public Security documentation.

**2. `zimmermann-telegram` — Zimmermann Telegram (1917 Germany) — Hall V**
- The intercepted German telegram offering Mexico an alliance against the US if
  war came. Decoded by Room 40. Shared with Washington. Helped bring the US
  into WWI. A standalone exhibit because the telegram itself is a cryptographic
  artifact worth study.
- Note: Room 40 is already credited in Hall X; this exhibit is the artifact,
  not the biography.
- Template: `ciphers/beale.html` (specific-document pattern).
- References: Barbara Tuchman *The Zimmermann Telegram*; National Archives UK
  HW 7/8; Kahn Ch. 9.

**3. `slidex` — Slidex (UK WWII tactical) — Hall V**
- British tactical field cipher used at brigade level and below during WWII.
  Simple printed cards with sliding strips. Cryptographically weak but
  operationally excellent — issued to tens of thousands of British and
  Commonwealth soldiers.
- Template: `ciphers/vic.html` (hand cipher pattern).
- Side panel: **"Slidex to BATCO — The British Tactical Code Lineage"**
  covering:
  - **BATCO** (Battlefield Code), the British Army's successor to Slidex,
    introduced in the 1980s and used through the 1990s and 2000s. BATCO
    provided one-time-pad-style authentication and encryption for voice and
    written tactical traffic at platoon-to-battalion level.
  - BATCO was superseded by modern secure radio systems but remained in
    service for units lacking secure voice infrastructure. Its retirement
    largely aligns with the widespread adoption of digital tactical radios.
  - Framing: tactical ciphers are a perpetual need even when strategic-
    level cryptography is solved. Simple paper-based systems survive because
    they work without electronics, training is fast, and compromise of one
    user doesn't cascade. Slidex → BATCO is the British version of a pattern
    that runs parallel in every modern military.
  - Cross-link to M-94/M-138-A (Phase 4) — the American parallel lineage.
  References: UK MoD declassified BATCO operator manuals; David Hamer
  documentation at cryptomuseum.com.
- References: Bruce Schneier's historical writings; Brigadier Tiltman's
  Bletchley memorandum.

**4. `commercial-telegraph-codebooks` — Commercial Telegraph Codebooks (1860s–1930s) — Hall V**
- Metadata: Mid-1860s through the early radio era · Codes published by
  private publishers for commercial telegraph traffic · Used for (a) cost
  reduction (cable charges were per-word, and codewords counted as single
  words — compression was often 60–80%) and (b) modest commercial secrecy
  against competitors or commercially curious intermediaries · Track A.
- Historical context: Before 1920s-era radio displaced it, transoceanic
  telegraph traffic was priced by the word, and rates were staggering — a
  London-to-Bombay cable message in 1870 cost roughly £1 per word, equivalent
  to about £100 in 2020 money. Businesses needed ways to compress their
  messages without losing meaning, and dozens of "commercial codebooks" were
  published from the 1860s onward. The three most widely used families were:
  - **Bentley's Second Phrase Code** (1929) by E. L. Bentley. The standard
    for international commerce in the late-cable era. ~50,000 codewords
    mapping to complete business phrases ("DELIVERY DELAYED FIVE DAYS ACCOUNT
    WEATHER" → one codeword). Dominant through WWII.
  - **ABC Code** (Fifth Edition 1901; seven editions total) by W. Clauson-
    Thue. British commercial standard for the late Victorian through
    Edwardian period. Widely used by shipping and banking houses.
  - **Lieber's Standard Telegraphic Code** (1896 and later editions) by
    B. Franklin Lieber. American commercial standard, widely used for
    North American and transpacific commerce.
  Other major codebooks: Western Union's own internal code, Slater's Code,
  A1 Universal Code, and dozens of industry-specific codes (for shipping,
  banking, cotton, oil, and mining).
- How they work: Lookup-based encoding. A codebook is a printed dictionary
  with codewords (usually pronounceable five-letter combinations like
  "BULAH" or "MYZAK") mapping to complete phrases or common words.
  Encoder: look up each plaintext phrase in the codebook, replace with the
  codeword, telegraph the codewords. Decoder: use the same codebook to look
  up each received codeword and recover the phrase.
- Cryptographic ambitions: Most commercial codebooks were **not designed
  for secrecy** against state adversaries — their purpose was compression.
  But they provided meaningful confidentiality against casual interception
  (competitors, newspapers, customs agents) because codebooks were not
  universally owned. A shipping firm using Bentley's could reasonably
  assume a rival firm using ABC Code or a custom private code couldn't
  read their traffic without obtaining a copy.
- How they were "broken": By **purchase** — codebooks were sold openly, so
  any adversary with resources could simply buy a copy. For private or
  proprietary codes, cryptanalytic attack followed standard codebook
  recovery techniques: frequency analysis of codewords, known-plaintext
  via business register or news correlation, and social engineering of
  codebook holders. Yardley's American Black Chamber (Hall X, shipped
  bio) systematically collected commercial codebooks in the 1920s.
- What it teaches: (1) The distinction between **code** (lookup) and
  **cipher** (transformation) is particularly sharp for commercial codes —
  this was compression engineering, not cryptography. (2) Commercial
  pressure (cable cost) drove cryptographic infrastructure long before
  state or military need. (3) Most human use of "secret writing" in the
  19th century was commercial, not military — the cryptographic record
  is biased toward the military-diplomatic corpus because that's what
  archives preserved. (4) The economic logic of codebooks (compression +
  modest secrecy via non-universal ownership) parallels modern choices
  like proprietary protocols and obfuscation-as-defense.
- Track A: engine simulates a small illustrative codebook (~200 entries
  drawn from Bentley's public domain editions via the University of
  Michigan digital archive). User types a business phrase (e.g., "SHIP
  ARRIVED SAFELY" or "PAYMENT RECEIVED"), engine looks up the codeword
  and displays compressed ciphertext. Reverse direction works too.
  Include a "cost calculator" side panel showing word-count savings and
  typical 1900 cable rates per word for major routes.
- Cross-links: Chinese Telegraph Code (Phase 6 above — non-commercial but
  shares the codebook architecture), Latin American Codebooks (Phase 8 —
  regional specialization of same pattern), Book Cipher generic (Phase
  10 — same lookup mechanism, different literary source), Yardley (Hall X
  bio, shipped — systematically studied commercial codes), Zimmermann
  Telegram (above — shows how a military/diplomatic codebook differs from
  a commercial one in its intended use).
- Template: `ciphers/dictionary-code.html` with codebook-selector mode.
- References: Bentley, *Bentley's Complete Phrase Code* (1923 and later
  editions); Clauson-Thue, *ABC Universal Commercial Electric Telegraphic
  Code* (Fifth Edition, 1901); Lieber, *Lieber's Standard Telegraphic
  Code* (1896); Steven Bellovin *Compression, Correction, Confidentiality,
  and Comprehension: A Look at Telegraph Codes* (2016 IEEE Privacy & Security
  Workshop); Kahn *The Codebreakers* Ch. 10 on commercial codes; Satoshi
  Tomokiyo, *Cryptiana*, "Telegraph Regulations and Telegraph Codes" and
  "Nonsecret Code: An Overview of Early Telegraph Codes,"
  `cryptiana.web.fc2.com/code/telegraph1.htm` and
  `cryptiana.web.fc2.com/code/telegraph2.htm`.

**Commit:** `phase 6 [round 3]: Chinese Telegraph Code, Zimmermann Telegram, Slidex (with BATCO sidebar), Commercial Telegraph Codebooks`

---

## Phase 7 — Americana and cultural additions

**Reminder:** All four exhibits below are **Track A**. For Culper Ring and
Arnold-André, the engines must handle both the substitution-code and book-
cipher layers — two chainable operations. For Cardano Grille, the engine is
a physical grille simulator (user draws or selects hole positions on a text
overlay).

Build these new exhibits:

**1. `culper-ring` — Culper Spy Ring / Tallmadge Codebook (1778 American Revolution) — Hall VI**
- George Washington's spy ring run by Benjamin Tallmadge. Used a substitution
  cipher plus a 763-entry codebook. "Agent 711" (Washington), "Agent 722"
  (Tallmadge himself), "Agent 355" (the unidentified woman courier).
- Template: `ciphers/dictionary-code.html`.
- Note: may warrant renaming Hall VI to "Early American & Civil War Ciphers" to
  accommodate both. Confirm with Paul first.
- References: Alexander Rose *Washington's Spies*; the Tallmadge codebook itself
  at the Huntington Library.

**2. `arnold-andre` — Arnold-André Book Cipher (1780) — Hall VI**
- Benedict Arnold's correspondence with Major John André using Blackstone's
  *Commentaries on the Laws of England* as a book-cipher key. Famous treason
  story; André was captured, convicted, and hanged.
- Template: `ciphers/beale.html` (book cipher pattern).
- References: Carl Van Doren *Secret History of the American Revolution*;
  the original Arnold-André letters at Clements Library.

**3. `cardano-grille` — Cardano Grille (1550 Italy) — Hall VIII**
- Girolamo Cardano's mechanical steganographic grille — a card with holes cut
  into it; place over an innocuous text and the revealed letters spell the
  message. The earliest well-documented mechanical steganographic device.
- Template: `ciphers/bacon.html` (steganography pattern).
- References: Cardano *De Subtilitate* (1550); Kahn Ch. 4.

*Note: Poe's "Gold-Bug" (1843) was originally planned for Hall VIII in this
phase. It has been reassigned to Hall XIII in Phase 9 (Ciphers in Culture)
where fiction-origin ciphers now live. Do not build it here.*

**Commit:** `phase 7 [round 3]: Culper Ring, Arnold-André, Cardano Grille`

---

## Phase 8 — Additional global and underground traditions

**Reminder:** All exhibits below are **Track A** where the algorithm is known
well enough to implement, **Track B** where historical documentation gives us
the artifacts but not a clean algorithm. This phase covers cipher traditions
that round out the global coverage: underground communications, revolutionary
movements, non-Western court systems. Build them with the same historical
rigor as every other exhibit. Document what the sources say; flag genuine
gaps with `[UNVERIFIED]`; do not let squeamishness about who used a cipher
or what cause it served keep the cipher out of a museum dedicated to the
history of ciphers.

Build these new exhibits:

**1. `field-hollers` — African-American Field Hollers and Spirituals as Coded Communication (18th–19th c. US) — Hall VIII**
- Documented by Frederick Douglass (*Narrative of the Life*, 1845) and later by
  Bernice Johnson Reagon, John Lovell, and other music historians. Enslaved
  people used song patterns, lyric substitutions, and call-response structures
  to convey operational meaning (escape signals, warnings, coordination).
- Status: historically sound for the musical tradition itself; the specific
  "quilt code" theory (Tobin & Dobard 1999) is disputed by Underground
  Railroad historians (Giles Wright, Leigh Fellner, Barbara Brackman). This
  exhibit covers the well-documented musical coding, not the disputed quilt
  claim. Include a sidebar honestly noting the historiographical dispute
  about quilts.
- Visualization required (Track B): audio-waveform annotated player of a
  public-domain field holler recording with hoverable markers explaining the
  signal meanings proposed by musicologists. Plus a comparison panel with
  spiritual lyrics showing how double meanings encode both religious and
  operational content (e.g., "Wade in the Water" as baptism hymn + escape
  route instruction).
- Template: adapted `ciphers/voynich.html`.
- References: Douglass *Narrative* Ch. 2; Bernice Johnson Reagon
  *If You Don't Go, Don't Hinder Me*; John Lovell *Black Song*; rejection
  of the quilt thesis in Wright & Brackman scholarship — include both.

**2. `che-vic` — Che Guevara's VIC Variant (1956–1967) — Hall V**
- Ernesto Guevara's personal hand cipher during Cuban Revolution activities
  and later Congo/Bolivia operations. Documented in his own notebooks
  captured by Bolivian forces in 1967 and published by the CIA. A VIC-family
  variant with simpler straddling checkerboard and personal key-phrase
  derivation.
- Track A engine required.
- Template: `ciphers/vic.html` (sibling system).
- References: CIA declassified "Guevara Cryptography" memo (1967 capture);
  Jon Lee Anderson *Che Guevara: A Revolutionary Life*; Peter Kornbluh
  National Security Archive declassifications.

**3. `ira-book-cipher` — Irish Republican Army Book Ciphers (1970s–1990s) — Hall V**
- Provisional IRA field communications used book ciphers with commercial
  paperbacks as key sources, one-time pads for high-value messages, and
  simple substitutions at the unit level. Documented in British Army
  counterintelligence manuals (declassified 2010s), academic work by
  Ed Moloney, and the Boston College oral history project.
- Track A engine required (book cipher mechanism with user-supplied key text).
- Template: `ciphers/beale.html`.
- References: Ed Moloney *A Secret History of the IRA*; M.L.R. Smith
  *Fighting for Ireland?*; declassified British Army FRU and 14 Intelligence
  Company internal publications; Jonathan Powell *Great Hatred, Little Room*.

**4. `raf-otp` — Red Army Faction One-Time Pad Operations (1970–1998) — Hall V**
- West German Red Army Faction used structured one-time pad key material for
  inter-cell communication, captured in multiple Bundeskriminalamt raids.
  Notable for pairing OTP rigor with astonishing operational security
  failures elsewhere — a textbook case of "the math never failed, the people
  did" from the VENONA lesson.
- Track A engine — OTP is already implemented; this exhibit reuses the OTP
  engine with RAF-specific examples and historical framing.
- Template: `ciphers/one-time-pad.html` (sibling system).
- References: Stefan Aust *The Baader-Meinhof Complex*; Bundeskriminalamt
  forensic reports from Stammheim archive; Butz Peters *Tödlicher Irrtum*.

**5. `vietnamese-underground` — Vietnamese Underground Codes (1945–1975) — Hall V**
- Vietnamese resistance codes spanning the French colonial period through the
  Vietnam War. Combination of character-count substitutions (leveraging
  Vietnamese diacritics for key material), book ciphers over approved
  literature, and numerical codebooks. Distinctive for using Vietnamese
  poetry meter as an integrity check.
- Track A engine required for the character-substitution component; Track B
  visualization for the codebook component.
- Template: combination of `ciphers/great-cipher.html` (nomenclator) and
  `ciphers/running-key.html` (literature-keyed).
- References: William Duiker *The Communist Road to Power in Vietnam*;
  Douglas Pike *Viet Cong*; Vietnamese Ministry of National Defense
  historical publications (translated); Greg Lockhart academic work.

**6. `joseon-yeokhak` — Joseon Dynasty Yeokhak Cipher Diagrams (1392–1897 Korea) — Hall I**
- Korean royal cipher systems based on the I Ching's hexagram arithmetic,
  used by the Joseon court and military. Documented in Korean court archives
  (Veritable Records of the Joseon Dynasty) and discussed in Don Baker's
  academic work on Korean scientific traditions.
- Track A engine for the hexagram-arithmetic component.
- Template: `ciphers/polybius.html` (grid-coordinate system).
- References: *Veritable Records of the Joseon Dynasty* (UNESCO Memory of
  the World); Don Baker *Korean Spirituality*; Michael Seth *A Concise
  History of Premodern Korea*.

**7. `amharic-ge-ez-ciphers` — Ethiopian Ge'ez Monastic Ciphers (~14th–19th c.) — Hall I**
- Cipher traditions preserved in Ethiopian Orthodox monasteries, used to
  protect esoteric and liturgical texts. Combination of Ge'ez syllabary
  substitution and numerical grid systems. Documented in Ernst Hammerschmidt's
  Ethiopian manuscript catalogs and the Ethiopian Manuscript Microfilm Library
  at HMML.
- Track A engine for the Ge'ez syllabary substitution; Track B visualization
  for the numerical grid examples from manuscripts.
- Template: `ciphers/atbash.html` adapted for non-Latin syllabary.
- References: Ernst Hammerschmidt *Äthiopische Handschriften*; Hill Museum &
  Manuscript Library EMML collection; Steve Delamarter *Catalogue of the
  Ethiopic Manuscripts* (Codices Aethiopici).

**8. `latin-american-codebooks` — Latin American Telegraphic Codebooks (1870s–1940s) — Hall V**
- Commercial and diplomatic telegraphic codebooks developed in Mexico,
  Argentina, Brazil, and Chile. Combined five-letter commercial codes
  (ABC Code, Bentley's, Lieber's) with national modifications. Used
  extensively in export finance, railroad operations, and diplomatic traffic
  through the 1940s.
- Track A engine for the lookup-style code system.
- Template: `ciphers/dictionary-code.html`.
- References: Mexican *Código Comercial Mexicano*; ABC Code 6th edition;
  Argentine telegraph ministry archives; James Boyd Rhodes *The Telegraph
  in America* (Latin American chapter).

**9. `diana-cryptosystem` — Diana One-Time Pad System (US Special Forces, 1960s–) — Hall V**
- Metadata: Developed in the 1960s by the US Army Signal Corps for Special
  Forces and other units needing a compact, paper-based, cryptographically
  perfect hand system · Used operationally in Vietnam and subsequent Cold
  War conflicts · Still referenced in US Army Field Manual FM 34-40-2
  (declassified editions) · Track A.
- Historical context: By the 1960s, strategic US military cryptography had
  moved to machines (KL-7, SIGABA before it) and early electronic systems.
  But Special Forces operating in denied areas needed cryptography that
  worked when the electronics didn't — no power, no machine, no recovery.
  Diana is the US Army's formalization of a pure hand one-time pad for
  that context. Soldiers carried paper pad booklets with printed random
  trigraphs; encoding used a modified Vigenère-style table ("Diana Table")
  that produced reciprocal output, meaning the same operation both
  enciphered and deciphered. This operational symmetry was a pedagogical
  choice — in high-stress combat, having one operation rather than two
  reduced training time and error rates.
- How it works: The Diana Table is a 26-row reciprocal alphabet table. The
  sender aligns plaintext with the pad's trigraph key, looks up each
  letter pair in the table, writes the resulting ciphertext letter. The
  receiver performs the identical operation — the table is designed so
  that ciphertext + key → plaintext using the same lookup pattern. The
  system is mathematically a Beaufort variant with a one-time key,
  theoretically perfect if the pad is never reused.
- How it was "broken": It wasn't, when used correctly. Diana's
  vulnerability is operational: pad distribution, pad destruction after
  use, pad reuse under field stress. VENONA (Phase 11) is the case
  study of what happens when OTP systems like Diana are used
  incorrectly — the Soviets' failures. Diana's exhibit honestly
  acknowledges that without describing any operational compromise.
- What it teaches: (1) Perfect cryptography (OTP) is a *pad management
  problem*, not an algorithm problem. (2) Hand cryptography remains
  relevant in 2026 for specialized use cases (denied environments,
  minimal-electronics situations). (3) Reciprocal-operation design is
  a real engineering choice driven by human factors, not laziness —
  fewer operations to train, fewer to make mistakes on, fewer to hide
  if captured.
- Track A: engine implements Diana Table encoding/decoding using user-
  supplied pad. Include a "generate practice pad" button that produces
  a fresh random pad for the user to experiment with. Demo includes a
  reciprocal-operation verification: user encodes plaintext → ciphertext,
  then encodes ciphertext with same key → recovers plaintext. Teaches
  the reciprocal property directly.
- Cross-links: One-Time Pad (Hall IX, shipped — theoretical foundation),
  VENONA (Hall IX, Phase 11 — OTP operational failure story), Vernam
  (Hall IX, shipped — machine OTP predecessor), RAF OTP (Phase 8 above —
  parallel UK use), SIGTOT (side panel in VENONA, Phase 11 — related
  Soviet tape system).
- Template: `ciphers/one-time-pad.html` with reciprocal-table extension.
- References: US Army Field Manual FM 34-40-2 (declassified editions);
  Tyler Moore *Cryptography: The Diana Cryptosystem* (IEEE Privacy &
  Security Magazine, 2002); David Kahn *The Codebreakers* revised
  edition (1996) on postwar Army cryptography.

### Cambridge Five / Philby sidebar

Rather than a standalone exhibit, extend the existing VENONA biography in
Hall X with a side panel on the Cambridge Five (Philby, Maclean, Burgess,
Blunt, Cairncross) covering their use of Soviet OTP tradecraft and the
operational tension between their cipher discipline and their behavioral
recklessness. Their story is operator, not cryptanalyst. Note: Phase 11
adds a full VENONA exhibit as well, and the Cambridge Five information
should live on that VENONA exhibit rather than only on a biography.

**Commit:** `phase 8 [round 3]: field hollers, Che, IRA, RAF, Vietnamese, Joseon, Ethiopian, Latin American codebooks, Diana Cryptosystem`

---

## Phase 9 — Hall XIII creation: "Ciphers in Culture"

### 9a. Create the new hall page

Fiction, film, game, and internet-phenomenon ciphers are a distinct mission
from operational puzzle/novelty ciphers. Pigpen was used by Freemasons;
*The Da Vinci Code*'s Atbash is a plot device. Both deserve honest treatment
in their correct category.

New hall: **Hall XIII · Ciphers in Culture**, positioned after Hall XII
(Unsolved) as the final special-exhibition gallery. Hall XII remains the last
content-driven hall; Hall XIII is the "how the public actually encounters
cryptography" curator's-picks gallery.

Create `halls/culture.html` following the pattern of `halls/puzzle.html`:
- Title: `Hall XIII · Ciphers in Culture`
- Subtitle: "How the public meets cryptography — through fiction, film, games,
  and internet phenomena."
- Hero framing (this is the HONEST framing; do not soften):
  - These ciphers are mostly cryptographically simple.
  - Their cultural reach is enormous — often greater than the operational
    ciphers they're based on.
  - The museum covers them because fiction is where most people first meet
    cryptography, and that meeting deserves to be rigorous.
  - Every exhibit here shows how the cipher actually works, cross-links to
    the "real" version where one exists, and honors the source material
    without pretending it's operationally significant.
- "Hall XIII of 13" footer line.
- Prev link: Hall XII Unsolved Ciphers. No next link (final hall).

### 9b. Framing rule for every Hall XIII exhibit

Every exhibit in Hall XIII must:
1. State explicitly that the cipher is fictional, entertainment, or internet-
   phenomenon in origin.
2. Explain the cipher technique honestly — these exhibits are not parody.
3. Track A required where the cipher is mechanical enough to implement
   (most of them are). No Track B exhibits in Hall XIII.
4. Cross-link to the "real" version of any cipher technique used
   (Da Vinci Code → Hall I Atbash; National Treasure Ottendorf → Book Cipher
   generic exhibit; Gravity Falls A1Z26 → Affine exhibit; etc.).
5. Include a "Cultural Reach" metadata field alongside the usual ones
   (Invented / Inventor / Key Type / Keyspace / Broken By / Modern Lesson).
   Example values: "Book: 80M+ copies sold", "Film: $260M box office",
   "Internet phenomenon: millions of participants 2012–2014".

### 9c. Move Gold-Bug and Dancing Men into Hall XIII

Both were originally planned for Hall VIII in Phase 7 and Phase 9 respectively.
Reassign both to Hall XIII:

- `ciphers/gold-bug.html` — breadcrumb, prev/next, hall references updated
  to Hall XIII.
- `ciphers/dancing-men.html` — same.

Hall VIII's exhibit list shrinks slightly; update its card count and
"This Hall" sidebar accordingly.

### 9d. Build the five new Hall XIII exhibits

**Reminder:** All five are **Track A** — each requires a working encrypt/
decrypt engine, Workbench integration, tests, Try It Yourself block, and
Break This Cipher puzzle.

**1. `da-vinci-code` — *The Da Vinci Code* (Brown, 2003) — Hall XIII**
- Metadata: Cipher system: Atbash + mirror writing + Fibonacci-indexed anagram
  · Source: novel, 2003 · Cultural Reach: 80M+ copies sold, 44 language
  translations, $750M film (2006).
- Historical context: Dan Brown's novel uses a small catalogue of real,
  cryptographically trivial ciphers to drive plot: Atbash (Baphomet →
  Sophia), mirror writing (Da Vinci's notebooks), Fibonacci sequence as the
  "key" to the first cryptex, and a simple anagram layer. The novel
  re-popularized Atbash for a generation and drove tourism to Paris and
  Edinburgh's Rosslyn Chapel.
- How it works: Walk through the novel's three cipher puzzles, each showing
  the real technique underneath.
- Engine: Track A implementation lets user type a plaintext and apply Atbash,
  mirror writing, or Fibonacci-anagram in sequence — the same pipeline the
  novel's characters use.
- How it was broken: The cipher is trivial; the novel's tension comes from
  the hunt for the right input, not the cryptanalysis. Frequency analysis
  breaks any of its individual layers instantly.
- What it teaches modern cryptography: The separation between cryptographic
  strength and dramatic utility. Also: the power of good story structure to
  popularize cryptographic concepts far beyond their technical merit.
- Break This Cipher puzzle: Use Brown's real "Draconian devil / Oh lame
  saint" anagram.
- Cross-links: Hall I Atbash · Dancing Men · Gold-Bug · Kryptos (Brown's
  sequel *The Lost Symbol* references it heavily).
- Template: `ciphers/bacon.html` (cultural + technique).
- References: Brown *The Da Vinci Code* (2003); Bart Ehrman *Truth and
  Fiction in The Da Vinci Code* (2004); Simon Cox *Cracking the Da Vinci
  Code*; Columbia Pictures 2006 film.

**2. `national-treasure` — *National Treasure* (Turteltaub, 2004) — Hall XIII**
- Metadata: Cipher system: Ottendorf book cipher + Silence Dogood letters
  + Playfair · Source: film, 2004 · Cultural Reach: $347M box office global,
  two sequels, Disney+ series (2022).
- Historical context: The film's plot hinges on a book cipher using the
  Silence Dogood letters (Benjamin Franklin's real 1722 essays) as the
  key text, an Ottendorf variant (page-line-word triples), and a Playfair
  cipher at the climax on the back of the Declaration of Independence.
  Cryptographically honest: the film actually shows the decryption process
  correctly and at length, making it one of the more accurate pop-culture
  cipher treatments.
- How it works: The Ottendorf/book cipher engine lets user paste a key text
  and encode/decode with (page, line, word) triples. The Playfair engine
  is already in the museum — link to it.
- How it was broken: N/A — it's a plot device. But the film's approach
  (find the key book, apply the cipher) mirrors how real book ciphers were
  actually broken historically (Beale #2 via the Declaration of Independence;
  Arnold-André via Blackstone).
- What it teaches modern cryptography: Book ciphers work only when the key
  book is truly unknown to the attacker. Publishing your novel's key text
  (as the Silence Dogood letters were already published) breaks the system.
  The film accidentally teaches this.
- Break This Cipher puzzle: A short Silence-Dogood-keyed Ottendorf message
  with the Silence Dogood text linked inline.
- Cross-links: Beale Ciphers · Arnold-André · Book Cipher generic · Playfair.
- Template: `ciphers/beale.html` (book-cipher shape).
- References: Turteltaub *National Treasure* (Disney 2004); real Silence
  Dogood letters in Franklin *Papers*; Playfair references already in
  museum.

**3. `gravity-falls` — *Gravity Falls* Cipher System (Hirsch, 2012–2016) — Hall XIII**
- Metadata: Cipher system: Caesar + Atbash + A1Z26 + Vigenère + combined
  layers · Source: animated TV series · Cultural Reach: 2 seasons, 40+
  embedded ciphers per season, active fan cryptanalysis community 2012–2016.
- Historical context: Alex Hirsch's Disney animated series embedded a cipher
  in every episode credits sequence (Season 1 rotated through Caesar, Atbash,
  A1Z26; Season 2 used keyed Vigenère). Viewers solved them collectively
  online in real time. One of the most successful pop-culture cryptanalysis
  engagement campaigns ever — millions of viewers learned how each cipher
  worked through the show.
- How it works: Multi-layered implementation — pick a cipher type (Caesar /
  Atbash / A1Z26 / keyed Vigenère), encode/decode, match the show's
  conventions.
- How it was broken: By fans, in minutes, using the techniques each cipher
  rotated through. Hirsch designed the difficulty curve to track the series'
  pacing.
- What it teaches modern cryptography: Cryptanalytic pedagogy through
  entertainment. Also the community-cryptanalysis pattern later seen in
  Cicada 3301 and modern puzzle hunts.
- Break This Cipher puzzle: A season-1-style A1Z26 credit from a specific
  episode.
- Cross-links: Caesar · Atbash · ROT13 · Affine · Vigenère · Cicada 3301
  · Kryptos (community-solve pattern).
- Template: `ciphers/caesar.html` extended to chain multiple engines.
- References: Disney Channel airings 2012–2016; Hirsch's published
  "Journal 3" (2016) containing cipher solutions; fan archives at
  Gravity Falls Wiki.

**4. `cicada-3301` — Cicada 3301 (2012–present) — Hall XIII**
- Metadata: Cipher system: book ciphers (Liber AL vel Legis, Agrippa,
  Mabinogion) · RSA · Magic squares · OutGuess steganography · Runic
  substitution · Source: internet phenomenon, 2012–2014 + later · Cultural
  Reach: tens of thousands of participants, unsolved at later stages.
- Historical context: Cicada 3301 began January 4 2012 with a 4chan image
  containing hidden steganography. Successful solvers passed through dozens
  of increasingly sophisticated cryptographic puzzles over weeks — using
  OutGuess steganography, book ciphers with Aleister Crowley's *Liber AL*,
  GPS coordinates, prime-numbered RSA challenges, Mayan numerals, and
  runic ciphers based on the *Mabinogion*. Three puzzle sets ran in 2012,
  2013, and 2014; a 2017 hint appeared, then silence. Originator still
  unidentified. The only internet phenomenon whose cryptographic substance
  matches its cultural mystique.
- How it works: Track A implementation of the specific techniques (RSA
  challenge, runic substitution using the specific runic alphabet Cicada
  used, OutGuess-style LSB steganography demo with a PNG upload field).
- How it was broken (partially): Each puzzle set's early stages were solved
  by the community. Later stages and the originator's identity remain
  unknown. Include in the "still open" category alongside Voynich, Kryptos
  K4, Somerton Man.
- What it teaches modern cryptography: The real scope of modern cryptography
  (public key, steganography, hash functions) can be presented as a puzzle
  hunt and reach audiences conventional education can't.
- Break This Cipher puzzle: A simplified OutGuess-style stego challenge
  with a small pre-seeded PNG.
- Cross-links: RSA (modern.html) · OutGuess → Microdot Stego (Phase 10) ·
  Book Cipher generic · Hall XII Unsolved.
- Template: `ciphers/kryptos.html` (living unsolved, multi-stage).
- References: 3301-unsolved community archives; Chris Bell 2013 articles
  in *The Telegraph*; Joel Eriksson's 2012 analyses; Wired January 2012
  coverage.

**5. `popular-culture-survey` — Ciphers in Popular Culture: Survey — Hall XIII**
- Metadata: Survey exhibit, no single cipher · Cultural Reach: summary
  catalogue · Not interactive in Track A encrypt/decrypt sense, but
  interactive as a browsable catalogue.
- Historical context: A browsable gallery of cipher appearances in
  fiction, film, games, and other media with short entries and links to
  exhibits where the cipher technique is covered in depth.
- Coverage entries (minimum):
  - *Cryptonomicon* (Stephenson, 1999) → Solitaire (already in museum)
  - *A Void* / *La Disparition* (Perec, 1969) → Oulipo constrained writing
  - *The Name of the Rose* (Eco, 1980) → library cryptography
  - *Ready Player One* (Cline, 2011) → classical cipher puzzles
  - *Gravity Falls* (Hirsch, 2012–2016) → full exhibit in this hall
  - *Sherlock Holmes "Dancing Men"* (Doyle, 1903) → full exhibit in this hall
  - *Gold-Bug* (Poe, 1843) → full exhibit in this hall
  - *Da Vinci Code* (Brown, 2003) → full exhibit in this hall
  - *National Treasure* (Turteltaub, 2004) → full exhibit in this hall
  - *Harry Potter and the Chamber of Secrets* (Rowling, 1998) → Tom Riddle's
    anagram
  - *2001: A Space Odyssey* (Kubrick, 1968) → HAL = IBM shift-1
  - *Cicada 3301* → full exhibit in this hall
  - *ARGs: The Beast (2001), I Love Bees (2004)* → community cryptography
  - *MIT Mystery Hunt* → annual puzzle-hunt tradition since 1981
  - *Geocaching puzzle caches* → mass participation worldwide
  - *Escape rooms* → contemporary mass-participation ciphers
- Interactivity (Track A-adjacent): a filterable table with columns
  (Title · Year · Medium · Cipher Technique · Real or Fictional · Link).
  Users filter by medium or technique and click through to the exhibit
  that covers the real version.
- Template: `ciphers/vigenere.html` adapted (table + filters pattern).
- References: David Kahn *The Codebreakers* Ch. 25 on cryptography in
  literature; Simon Singh *The Code Book* afterword on Cicada.

### 9e. Cross-reference side-panels on existing Hall I exhibits

On `ciphers/atbash.html`, add a short side-panel titled "Atbash in Popular
Culture" linking to the Da Vinci Code exhibit.

On `ciphers/caesar.html`, add a side-panel linking to Gravity Falls and
to the ROT13 exhibit (already adjacent).

On `ciphers/affine.html` (built in Phase 5), add a side-panel linking to
Gravity Falls' A1Z26.

### 9f. Side panels on other existing exhibits

On `ciphers/gold-bug.html` (the new Hall XIII exhibit built in 9d), add a
substantive side panel titled **"Poe's Challenge Ciphers and the W.B. Tyler
Mystery"** covering:
- Poe's 1840 *Graham's Magazine* cryptographic challenge series where he
  claimed to have broken every reader-submitted cipher.
- The two ciphers attributed to "W.B. Tyler" (likely a Poe pseudonym)
  published in 1841 to end the contest.
- Terence Whelan's 1992 solution of the first Tyler cipher.
- The second Tyler cipher remaining unsolved until 2000 when Gil Broza
  finally broke it.
- Historical significance: Poe's public challenges did more to popularize
  cryptography in 19th-century America than any other single cultural event.
- References: Louis A. Renza essays in *Edgar Allan Poe Review*; Shawn
  Rosenheim *The Cryptographic Imagination* (1997); Kahn Ch. 6.

On `ciphers/enigma.html`, add a side panel titled **"The Three Unbroken
Messages"** covering:
- Three U-boat wireless intercepts from 1942 that remained unsolved after
  the war — two four-rotor Enigma M4 messages, one three-rotor M3 message.
- The *Enigma@Home* distributed-computing project (2006 onward) using spare
  CPU cycles from thousands of volunteers to brute-force-search the key
  space.
- Stefan Krah's team broke two of the three between 2006 and 2013; one
  remains open as of this build.
- What it teaches: even Enigma — historically broken — has residual
  intercepts that withstood wartime cryptanalysis, only yielding to 21st-
  century distributed computation. Cryptanalytic attack surfaces are not
  monotonic; some messages are harder than others due to operator error
  or short content.
- References: *Enigma@Home* project site (enigmaathome.net); Krah *The M4
  Project* (bytereef.org); Hugh Sebag-Montefiore *Enigma: The Battle for
  the Code* afterword.

Additionally on `ciphers/enigma.html`, add a second side panel titled
**"Operation Boniface: Protecting the Source"** covering:
- To avoid revealing to the Germans that Enigma had been broken, British
  intelligence invented a fictional MI6 agent named "Boniface" and
  attributed intercepted Ultra intelligence to his reporting.
- When Ultra revealed the location of a German supply ship or U-boat,
  Britain frequently dispatched reconnaissance flights or ships to "spot"
  the target first — generating a plausible non-cryptologic source that
  Boniface could be said to have reported.
- Known as the "source cover" problem: the value of cryptanalytic
  intelligence is routinely destroyed by acting on it visibly. The
  discipline to withhold action, accept losses, and let Ultra inform rather
  than direct tactics was as important as the decryption itself.
- The Ultra secret held until 1974, when Frederick Winterbotham's *The
  Ultra Secret* (Harper & Row, 1974) and official declassifications
  revealed what Bletchley had achieved.
- What it teaches: source protection in signals intelligence. Modern
  parallel: NSA's "parallel construction" practice during the Snowden era.
- References: Winterbotham *The Ultra Secret* (1974); Ronald Lewin
  *Ultra Goes to War* (1978); Mark Frary *De/Cipher* (2017) on the
  Boniface cover story; F. H. Hinsley *British Intelligence in the
  Second World War* (official history, multiple volumes 1979–1990).

**Commit:** `phase 9 [round 3]: Hall XIII created, Gold-Bug + Dancing Men moved, 5 new cultural exhibits, side panels on Gold-Bug + Enigma`

---

## Phase 10 — Generic-technique exhibits

**Reminder per Phase 0.5 audit:** Three of the five generic-technique exhibits
originally planned for this phase are ALREADY SHIPPED with their own exhibit
pages and demos. The audit in Phase 0.5 confirms:

- **`autokey` — SHIPPED** in Hall III. Do not build `autokey-generic`.
  Instead, verify the existing `ciphers/autokey.html` cross-links to Running
  Key, Cardano Autokey (Phase 5), and Vigenère. Upgrade cross-links only.
- **`book-cipher` — SHIPPED** in Hall V. Do not build `book-cipher-generic`.
  Verify cross-links to Beale, Arnold-André (Phase 7), Dictionary Code,
  Aeneas Tacticus (Phase 1). Upgrade cross-links only.
- **`nomenclator` — SHIPPED** in Hall II. Do not build `nomenclator-generic`.
  Verify cross-links to Great Cipher, Babington, Argenti (Phase 5), Wallis
  (Phase 5), Arabic Nomenclators (Phase 1). Upgrade cross-links only.

Only two new generic-technique exhibits remain to build in this phase:

**1. `null-cipher-generic` — Null Ciphers and Acrostics — Hall VIII**
- Explains null ciphers where the meaning hides in letter positions within
  innocuous text. Historical examples: WWI internment camp letters, Cardinal
  Richelieu grille variants, Benedict Arnold's separate null system.
- Track A required. Interactive demo: encode/decode with user-supplied
  cover text and hidden-position rule (every Nth word, every Nth letter,
  first letter of each line, etc.).
- Template: `ciphers/bacon.html` adapted.
- References: Kahn Ch. 12; Fletcher Pratt *Secret and Urgent*.

**2. `microdot-stego` — Microdot Steganography — Hall VIII**
- Photographic reduction of a page to the size of a typewriter period. Pioneered
  by Emanuel Goldberg in 1925, weaponized by German intelligence in WWII, used
  heavily by Soviet and East Bloc services through the Cold War. J. Edgar
  Hoover's "enemy number one of US counterintelligence."
- Track A required. Interactive demo: upload an image, see the hidden LSB
  payload or a zoom-in simulation revealing a microdot-style concealed
  message. Include a historical-image browser showing real microdot examples
  from OSS declassified files.
- Template: `ciphers/bacon.html` (steganography pattern).
- References: Kahn Ch. 12; Walter Pforzheimer's declassified OSS microdot file;
  Mark Frary *De/Cipher* on 20th-century steganography.

### Cross-reference upgrades on the 3 shipped generic exhibits

For each of the three already-shipped generic exhibits (`autokey`,
`book-cipher`, `nomenclator`), add/verify a "Related in this museum" section
at the bottom that enumerates every specific instance now present across
the museum. This is an in-place upgrade, not new construction. Committed
under the upgrade-list from Phase 0.5.

**Commit:** `phase 10 [round 3]: 2 new generic-technique exhibits + 3 existing cross-link upgrades`

---

## Phase 11 — Context / situation exhibits + Kerckhoffs's Principle

**Reminder per Phase 0.5 audit:** Diffie-Hellman, RSA, AES, and DES/SHA-256
are ALREADY SHIPPED in Hall XI Modern Cryptography. Do NOT rebuild these as
new exhibits in this phase. Instead:

- Existing DH, RSA, and AES pages may warrant **in-place upgrades** if the
  Phase 0.5 audit marked them THIN. Typical upgrade items:
  - Cross-links to Hall X bios (GCHQ Trio for DH/RSA, if that bio exists
    after the Hall X audit).
  - Cross-links to Kerckhoffs (new in this phase): Kerckhoffs's Principle
    vindicated by DH/RSA/AES — all are public algorithms.
  - "Pedagogical small-primes mode" for RSA if missing.
  - Post-Quantum caveat section cross-linking to SHA-256's security-margin
    discussion.
- **Kerckhoffs's Principle** is **NEW** — build as **Track B**. Kerckhoffs
  is a *design maxim* about where cipher security should reside (in the key,
  not in the secrecy of the algorithm), not a cipher algorithm itself. There
  is no `encrypt(plaintext, key)` function that "implements Kerckhoffs" —
  that framing would be category confusion. Build as a formal-statement
  interactive explainer (see the Track B options in the Interactive Demo
  Requirements section above).
- The three context exhibits (Cabinet Noir, Station HYPO, Bletchley Park)
  are **NEW** as Track B.

Reminder on track assignments:

- **Cabinet Noir** — Track B — interactive map of 18th-century European
  Black Chambers with hoverable pins showing each city's intercept operation.
- **Station HYPO** — Track B — annotated floor plan of the basement at Pearl
  Harbor with clickable stations showing who did what and when.
- **Bletchley Park** — Track B — pannable aerial/hut map with hoverable huts
  linking to the exhibits and bios associated with each (Hut 6 → Enigma;
  Hut 8 → Naval Enigma / Turing / Clarke; Block H → Colossus; etc.).
- **Kerckhoffs's Principle** — Track B — animated before/after comparison
  showing what happens when a cipher relies on algorithm secrecy vs. key
  secrecy (e.g., Kryha machine captured vs. OTP with captured algorithm).
  This is a visual explainer of a design maxim, not an encrypt/decrypt
  engine; do not build a fake `encrypt()` function for a principle.

Four exhibits total in this phase: three context exhibits plus Kerckhoffs.
Place Cabinet Noir / Station HYPO / Bletchley Park in their relevant halls;
place Kerckhoffs in **Hall XI Modern Cryptography** as a new foundational
companion to DH/RSA/AES (it's the principle they all depend on).

Build:

**1. `cabinet-noir` — The Cabinet Noirs (European Black Chambers, 1700s) — Hall II or new**
- Institutional cryptanalysis. French, Austrian, Prussian, Venetian. Letter
  opening, seal duplication, copying, re-sealing, delivering. Operated for 150
  years. The birth of mass state intercept.
- Template: adapt hall-intro narrative style.
- References: Kahn Ch. 5; Nadine Akkerman *Invisible Agents*.

**2. `station-hypo` — Station HYPO (Pearl Harbor 1941–1945) — Hall VII**
- Joseph Rochefort's Pacific cryptanalysis unit. Location of the JN-25 break.
  Context for the JN-25 exhibit.
- Template: narrative + artifact page.
- References: Elliot Carlson *Joe Rochefort's War*; Layton *And I Was There*.

**3. `bletchley-park` — Bletchley Park as a Place — Hall VII**
- The physical site, the 10,000 staff, the huts, the women, the secrecy, the
  declassification in 1974. Context for Enigma, Lorenz, Turing, Welchman, Tutte,
  Flowers, Clarke, Batey, Knox exhibits and bios.
- Template: narrative + artifact page.
- References: Sinclair McKay *The Secret Life of Bletchley Park*; Michael
  Smith *Station X*.

**4. `kerckhoffs-principle` — Kerckhoffs's Principle (1883) — Hall XI**
- Auguste Kerckhoffs's 1883 six principles for military ciphers, especially
  the one that became his namesake: "The system must not require secrecy, and
  it must be able to fall into the enemy's hands without inconvenience." THE
  foundational principle of modern cryptography.
- Placement rationale: Hall XI Modern Cryptography is the right home.
  Kerckhoffs is the principle that makes DES, DH, RSA, AES, and SHA-256
  meaningful — all are public algorithms; their security lives entirely in
  the key. Place as the hall's introductory foundational piece, before the
  algorithm exhibits.
- Track A interactive: animated before/after comparison showing what happens
  when a cipher relies on algorithm secrecy vs. key secrecy. Include a
  "Kryha fell; OTP didn't" dramatic comparison panel, and a parallel
  "stolen AES implementation (open source) vs. stolen AES key" panel.
- Template: theoretical-concept page (adapt from `modern.html` sections).
- References: Kerckhoffs *La Cryptographie Militaire* (*Journal des Sciences
  Militaires*, 1883); Shannon's 1949 *Communication Theory of Secrecy Systems*
  citing Kerckhoffs; the security-through-obscurity literature (NIST, CRYPTO
  proceedings passim).

**5. Upgrades to already-shipped Hall XI exhibits (per Phase 0.5 audit)**

Diffie-Hellman, RSA, AES, DES, and SHA-256 are all already live in Hall XI
Modern Cryptography with working demos. The original Round 3 plan to build
them is replaced by in-place upgrade work. For each, the upgrade pass is:

**`diffie-hellman` (shipped, upgrade if THIN):**
- Verify the two-party interactive simulation: Alice and Bob both pick secrets
  with visible small primes, shared key derives live, Eve's view shown as a
  separate panel.
- Add cross-link to GCHQ Trio (Hall X bio if created in Phase 12) for the
  1969–1974 classified precursor work by Ellis, Cocks, Williamson.
- Add cross-link to new Kerckhoffs exhibit (item #4 above).
- Add Post-Quantum caveat section cross-linking to the modern.html
  post-quantum section.
- References to verify present: Diffie & Hellman *New Directions in
  Cryptography* (IEEE 1976); Ellis *The Possibility of Secure Non-Secret
  Encryption* (CESG 1970, declassified 1997); Cocks *A Note on Non-Secret
  Encryption* (CESG 1973, declassified 1997); Singh *The Code Book* Ch. 6.

**`rsa` (shipped, upgrade if THIN):**
- Verify small-primes interactive key generation, encrypt/decrypt demo, and
  factor-the-modulus demonstration panel.
- Add optional signature-verification mini-demo if absent.
- Add cross-link to Diffie-Hellman (sibling), GCHQ Trio bio (if created),
  Kerckhoffs exhibit, Post-Quantum section.
- Add Cambridge Five sidebar note connecting to the Philby-era spy
  tradecraft context: they needed private-channel keys precisely because
  RSA didn't exist yet.
- References to verify present: Rivest, Shamir & Adleman *A Method for
  Obtaining Digital Signatures and Public-Key Cryptosystems* (CACM 1978);
  Cocks *A Note on Non-Secret Encryption* (CESG 1973, declassified 1997);
  Boneh *Twenty Years of Attacks on the RSA Cryptosystem* (1999);
  Bleichenbacher *Chosen Ciphertext Attacks Against Protocols Based on RSA
  Encryption Standard PKCS #1* (CRYPTO 1998).

**`aes` (shipped, upgrade if THIN):**
- Verify 128/192/256-bit key sizes available and ECB/CBC/GCM modes selectable.
- Verify round-by-round visualization showing SubBytes / ShiftRows /
  MixColumns / AddRoundKey stages.
- Add avalanche visualization (single-bit change → ~50% output change after
  2 rounds) if absent.
- Add cross-link to Kerckhoffs: AES is Kerckhoffs's Principle vindicated —
  algorithm is entirely public, security lives in the key.
- Add the "data reaching this page was AES-encrypted" meta-moment inviting
  users to inspect their own TLS cipher suite via browser DevTools.
- References to verify present: Daemen & Rijmen *The Design of Rijndael*
  (2002); NIST FIPS 197 (2001); Bogdanov, Khovratovich, Rechberger
  *Biclique Cryptanalysis of the Full AES* (ASIACRYPT 2011); Paar & Pelzl
  *Understanding Cryptography* Ch. 4; NSA Suite B documentation.

**`des` and `sha256` (shipped, verify only — no known upgrade items):**
Round 3 did not originally plan specs for these. Verify they exist with
working demos and sensible references; no upgrade work unless Phase 0.5
audit flagged specific gaps.

**Commit for upgrades:** `phase 11 [round 3]: hall XI modern-crypto exhibit upgrades`

### VENONA (new exhibit for Hall IX Unbreakable)

**`venona` — The VENONA Project (1943–1980) — Hall IX**

- Metadata: 1943 onward (codebreaking effort); 1946 first partial decrypts;
  declassified 1995 · US Army Signal Intelligence Service / NSA effort
  against Soviet intelligence one-time pad traffic · Counterintelligence
  success: identified Julius and Ethel Rosenberg, Klaus Fuchs, Theodore Hall,
  Harry Dexter White, and Cambridge Five members · Track: **Opus decides**
  per the engine-reuse guidance below.

- Historical context: During WWII and afterward, Soviet intelligence services
  (NKVD, later KGB, and GRU) used one-time pads for their diplomatic and
  intelligence traffic — a cryptographic choice that should have been
  unbreakable. But between roughly 1942 and 1948, under wartime production
  pressure, Soviet pad-makers produced duplicate pads in small quantities.
  Some duplicates were used by different agents at different times and
  places. Every pad reuse is a cryptographic catastrophe: if Alice enciphers
  message A with pad P, and Bob enciphers message B with the same pad P,
  anyone intercepting both A⊕P and B⊕P can XOR them together to get A⊕B —
  and with careful linguistic guessing, recover both A and B.

  Arlington Hall's Meredith Gardner and his team, with British partners
  including Kim Philby (ironic), began unwinding VENONA traffic in 1946.
  Gardner's first complete decrypt in December 1946 revealed a reference
  to "Liberal" — code name for Julius Rosenberg. The program ran for 37
  years, producing ~3,000 partial or complete translations of ~750,000
  intercepted Soviet messages. It identified hundreds of Soviet agents in
  Allied governments, scientific programs, and military structures.
  Declassified 1995.

- How it works (the attack, not the cipher): One-time pad works as:
  `ciphertext = plaintext ⊕ pad`. If two messages M1 and M2 use the same
  pad P: `C1 = M1 ⊕ P` and `C2 = M2 ⊕ P`. XORing: `C1 ⊕ C2 = M1 ⊕ M2`.
  The pad cancels out. What remains is the XOR of two plaintexts — still
  not readable directly, but subject to **crib dragging**: sliding known or
  probable plaintext fragments against the combined XOR stream looking for
  places where both plaintexts produce English (or Russian) simultaneously.
  This is painstaking manual work; Gardner and his team spent years on
  partial recovery, sometimes with only fragments of single words.

- What broke the pad reuse: not a mathematical weakness in OTP itself, but
  the exact operational failure ChatGPT's "perfect systems fail through
  operational reuse" framing identifies. The Soviets knew their duplicates
  existed and warned their agents by 1948; most of the decrypted material
  dates from 1942–1946 traffic. Later Soviet OTP discipline was stricter.

- What it teaches: The single most important lesson in applied cryptography
  — **implementation and operational discipline matter more than algorithm
  strength**. Theoretically perfect ciphers fail routinely in the field for
  the same reasons most computer security incidents in 2026 fail: reuse,
  human shortcuts, operational pressure overriding protocol. VENONA is the
  OTP-failure case study that every cryptography course should teach
  alongside the OTP-is-unbreakable theorem. The museum's OTP exhibit teaches
  the theorem; VENONA teaches the consequence of violating its assumptions.

- **Track decision — Opus determines based on the shipped OTP engine:**
  - If the shipped `ciphers/one-time-pad.html` already has an encrypt/
    decrypt engine with XOR-based operation (likely), build VENONA as
    **Track A** with a dedicated "Pad Reuse Attack" engine that accepts
    two ciphertexts and a candidate crib, performs crib dragging
    automatically, and displays candidate plaintext recovery. Reuse the
    shipped OTP engine for the underlying XOR work.
  - If the shipped OTP is a visualization without a real XOR engine, build
    VENONA as **Track B** with an interactive attack visualization: pre-
    loaded historical intercepts (Gardner's actual 1946 "Liberal" decrypt
    or a pedagogically clean constructed example), slider-controlled crib
    drag across the combined XOR stream, and progressive plaintext
    revelation.
  - Either way, the exhibit MUST include the "XOR cancellation" mathematical
    walk-through — this is the single clearest cryptographic "aha" moment
    in the museum and must be executed as a genuine teaching moment, not a
    black-box demo.

- Side panel: **"SIGTOT and 5-UCO — Soviet One-Time Tape Systems"** covering:
  - **SIGTOT** was the US Army's own one-time-tape system (1940s) — a
    secure teleprinter using punched paper tape pads. The Americans got
    SIGTOT right; the Soviets' equivalent (called "Albatross" by US SIGINT)
    failed for the same reasons VENONA exploited.
  - **5-UCO** was the British one-time-tape equivalent, similarly
    successful when operational discipline held.
  - Parallel lesson: three similar systems, one set of operators who
    maintained discipline (US/UK) and one set who didn't (USSR wartime
    production). The systems were technically identical in their
    cryptographic strength; the difference was entirely operational.

- Side panel: **"The Cambridge Five"** covering:
  - Kim Philby, Donald Maclean, Guy Burgess, Anthony Blunt, John Cairncross
    — all Soviet agents inside British and American intelligence
    communities.
  - VENONA's first indication of their existence was a 1945 decrypt
    referencing "Homer" (Maclean) and "Stanley" (Philby).
  - The operational tension: these agents maintained strict OTP discipline
    (messages, dead drops, meetings) while simultaneously drinking heavily,
    speaking indiscreetly, and behaving publicly in ways that should have
    drawn attention. Their tradecraft was cryptographically disciplined
    but behaviorally reckless — a recurring pattern in human intelligence.
  - Philby's role is particularly noteworthy: he spent 1949–1951 as the
    British Secret Intelligence Service liaison to the FBI and CIA,
    meaning he had direct knowledge of VENONA's progress and warned
    Moscow that the decryption effort was advancing. Arlington Hall
    withheld its most sensitive material from Philby once suspicion
    rose; VENONA continued in compartments inaccessible to him.

- Cross-links: One-Time Pad (Hall IX, shipped — the theoretical foundation
  VENONA demolished through implementation failure), Vernam (Hall IX,
  shipped — machine OTP ancestor), Diana Cryptosystem (Hall V, Phase 8 —
  the US Army's postwar hand OTP system that learned from Soviet mistakes),
  Klaus Fuchs (candidate Hall X bio — audit-gated; if absent, flag for
  Round 4), Meredith Gardner (candidate Hall X bio — audit-gated; lead
  Arlington Hall cryptanalyst, arguably deserves a bio alongside Lasry
  and Dunin as a contemporary-ish figure of systematic cryptanalysis).
- Template: `ciphers/one-time-pad.html` adapted with a "pad reuse attack"
  section, plus the two side panels above. Visual design follows the
  established historical-cryptanalysis exhibit pattern (Zimmermann
  Telegram, Great Cipher).
- References:
  - NSA, *The VENONA Story* (declassified 1995, available at nsa.gov/
    resources/everyone/cryptologic-heritage/historical-figures-publications/
    publications/coldwar/venona-story.pdf) — the authoritative
    institutional history.
  - John Earl Haynes, Harvey Klehr, *Venona: Decoding Soviet Espionage in
    America* (Yale University Press, 1999) — the standard academic history.
  - Nigel West, *Venona: The Greatest Secret of the Cold War* (HarperCollins,
    1999) — popular history with extensive decrypt excerpts.
  - Robert L. Benson, *The VENONA Story* (NSA Center for Cryptologic History,
    2001 monograph).
  - NSA VENONA declassified documents (nsa.gov FOIA) — 2,900+ decrypted
    messages available.
  - David Kahn *The Codebreakers* revised edition (1996) Ch. 18 on VENONA.
  - Ron Rosenbaum, *How the Ends of World War II Began: The Untold Story*
    (New York Times Magazine, 1995) — first major post-declassification
    coverage.

### SIGSALY (new exhibit for Hall XI Modern Cryptography)

**`sigsaly` — SIGSALY (1943) — Hall XI**

- Metadata: 1943 · Bell Telephone Laboratories + US Army Signal Corps ·
  First secure voice encryption system · Used for Roosevelt–Churchill
  transatlantic calls · Alan Turing consulted on the design during his
  1942–1943 Bell Labs visit · Weighed ~50 tons, filled a room, cost ~$2
  million (~$35 million in 2026 dollars) per terminal · Track B
  (visualization-primary — SIGSALY is not a classical encrypt/decrypt
  algorithm but a speech-processing system with one-time-pad-equivalent
  noise keying).

- Historical context: By 1942 the Allies knew that scrambled radio-
  telephone was insecure — the Germans had routinely decrypted Roosevelt-
  Churchill calls enciphered with the commercial A-3 scrambler. Bell Labs,
  under a crash program, developed SIGSALY (sometimes called "Green
  Hornet" internally) to provide genuinely secure voice. The system
  sampled voice, compressed it to about 2,400 bits per second across 12
  narrowband channels, and enciphered each channel with a synchronized
  one-time noise key stored on identical phonograph records at each
  terminal. The two records were played in synchronization; the
  transmitter's noise was added to the voice, the receiver's identical
  noise was subtracted, recovering the voice.

  SIGSALY's first operational call was July 1943, Washington to London.
  It carried the Roosevelt-Churchill conversations for the Casablanca,
  Tehran, and Yalta conferences. Twelve terminals were eventually deployed
  (Washington, London, Algiers, Australia, Paris, and mobile units).
  Declassified 1975. Most SIGSALY terminals were destroyed after the war;
  one example survives at the NSA National Cryptologic Museum at Fort
  Meade.

- How it works (pedagogical simplification):
  1. **Voice is digitized.** Voice is sampled ~50 times per second and
     compressed to a low-rate digital representation (~2,400 bits per
     second across 12 frequency bands).
  2. **Noise key is synchronized.** Each terminal has an identical
     phonograph record of random noise. The records are synchronized by
     precise timing signals exchanged before the call.
  3. **Digital voice is combined with noise.** Each voice-band sample is
     added to the corresponding noise sample (modulo a small number).
     The result is transmitted as radio signal.
  4. **Receiver subtracts the noise.** The receiving terminal plays the
     identical noise record in sync, subtracts the noise from each
     received sample, and reconstructs the voice.

  Cryptographically, each sample is being XOR-equivalent-operated with a
  true random one-time key. If the keys are never reused (and SIGSALY's
  pad records were used once and destroyed), the system is information-
  theoretically perfect — the same security guarantee as classical OTP,
  applied to voice rather than text.

- How it was "broken": It wasn't, when used correctly. German cryptanalysts
  knew SIGSALY existed (they noticed the bandwidth consumption) but could
  not read the traffic. The system's operational weaknesses were elsewhere:
  logistical complexity (50-ton terminals, massive electrical requirements,
  skilled Bell Labs engineers required to maintain it), limited deployment
  (only 12 sites), and the practical reality that most war-critical voice
  traffic never used SIGSALY simply because it wasn't available.

- What it teaches: (1) **Voice encryption is harder than text encryption.**
  The digitization/compression/synchronization/reconstruction pipeline is
  complex — SIGSALY's designers had to solve each step as original
  engineering. Modern secure voice (Signal, secure VoIP, SRTP) is
  SIGSALY's pedagogical descendant. (2) **One-time-pad principles scale
  to voice.** The XOR-with-noise-key architecture is conceptually
  identical to classical OTP; only the data is different. (3) **Secure
  communications are a system problem, not just a cipher problem.** SIGSALY
  required synchronized phonograph distribution, precise timing, trained
  operators, and dedicated infrastructure. Modern "end-to-end encryption"
  apps hide comparable system-level dependencies behind the UI. (4)
  **Bridge from wartime secrecy to modern secure systems.** Every secure
  voice call in 2026 — every encrypted phone conversation, every Signal
  voice call, every military STU-III descendant — traces its conceptual
  lineage to SIGSALY.

- Track B: interactive visualization with three parts:
  - **Voice digitization animation.** User speaks into a waveform widget
    (or plays a pre-recorded sample); visualization shows how the continuous
    waveform is sampled, quantized, and split into frequency bands. No
    audio is actually transmitted — this is a teaching visualization.
  - **Noise-key application simulator.** Two synchronized timelines
    (sender, receiver) show the noise record playing; each voice sample
    is visually combined with its noise counterpart; the result is shown
    as transmitted signal. Receiver subtracts identical noise to recover.
  - **Bandwidth and latency tradeoffs panel.** Shows SIGSALY's 2,400 bps
    compression vs. commercial telephone's 64,000 bps quality. Teaches
    why SIGSALY voice sounded "electrical" (the famous bee-hum) — the
    compression algorithm was primitive by modern standards.

- Cross-links: One-Time Pad (Hall IX, shipped — theoretical foundation),
  Vernam (Hall IX, shipped — machine OTP ancestor), Alan Turing (Hall X,
  shipped — consulted on the design during his Bell Labs visit; link to
  his biography), VENONA (Hall IX, above — same OTP principle, operational
  opposite), AES (Hall XI, shipped — modern descendant), Kerckhoffs's
  Principle (Hall XI, Phase 11 — SIGSALY's algorithm was eventually public;
  security relied entirely on the noise key).

- Template: `ciphers/one-time-pad.html` adapted with voice-processing
  visualizations. No engine — SIGSALY is a system, not an algorithm with
  clean inputs/outputs.

- References:
  - Bell Laboratories, *The SIGSALY Story* (internally written 1945,
    declassified 1975, available through the NSA Center for Cryptologic
    History).
  - J. V. Boone, R. R. Peterson, *The Start of the Digital Revolution:
    SIGSALY — Secure Digital Voice Communications in World War II* (NSA,
    2000).
  - Donald Mehl, *The Green Hornet: A Secret Voice System* (NSA, 1997).
  - Crypto Museum Foundation SIGSALY documentation
    (cryptomuseum.com/crypto/usa/sigsaly/) — comprehensive technical
    reconstruction with photographs of the surviving NSA-museum terminal.
  - David Kahn, *The Codebreakers* revised 1996 edition Ch. 16 on wartime
    voice encryption.
  - B. Jack Copeland, *Alan Turing: His Work and Impact* (Elsevier, 2013)
    Ch. 21 on Turing's Bell Labs consultation.

**Commit:** `phase 11 [round 3]: cabinet-noir, station-hypo, bletchley-park, kerckhoffs (+ hall XI upgrades per 0.5 audit), VENONA, SIGSALY`

---

## Phase 12 — Codebreaker biographies (Hall X expansion)

**Reminder per Phase 0.5 audit:** Hall X currently has **21 biographies**
(not 15 as earlier Round 3 drafts assumed). README summary says the hall
covers "Al-Kindi through Turing, Rejewski, Tutte, Friedman, Clarke, Driscoll,
Marks to the 2011 Copiale team." Several bios the Round 3 plan proposes as
"new additions" are already present.

Before building any new bio, read the existing `halls/codebreakers.html`
file end to end. For each of the 12 proposed additions below, record in
`docs/round3-shipped-audit.md` under a Hall X section:

- **SHIPPED** — bio already exists. Skip.
- **THIN** — bio exists but the spec below adds substantive detail. Upgrade
  in place.
- **NEW** — bio doesn't exist. Build.

Expected state per README's described scope (VERIFY against actual file):

- Al-Kindi (shipped, existing)
- Alan Turing (shipped, existing)
- Marian Rejewski (shipped, existing)
- Bill Tutte (SHIPPED likely — README says "Tutte"; verify if solo or shared
  with Flowers)
- William Friedman (shipped likely)
- Joan Clarke — SHIPPED per README's explicit mention
- Agnes Meyer Driscoll — SHIPPED per README's explicit mention
- Leo Marks — SHIPPED per README's explicit mention
- 2011 Copiale team (Knight, Megyesi, Schaefer) — SHIPPED per README

Proposed Round 3 additions, filtered against expected shipped state:

| Bio | Expected state | Round 3 action |
|---|---|---|
| Joseph Rochefort | Probably NEW | Build — Station HYPO / JN-25 / Midway |
| Arne Beurling | Probably NEW | Build — Geheimschreiber break |
| Dillwyn "Dilly" Knox | Probably NEW | Build — Italian/Spanish Enigma |
| Herbert Yardley | Probably NEW | Build — American Black Chamber |
| Joan Clarke | SHIPPED per README | VERIFY — skip if present |
| Mavis Batey | Probably NEW | Build — Italian Naval Enigma / Matapan |
| Elizebeth Smith Friedman | SHIPPED per README | VERIFY — skip if present |
| Leo Marks | SHIPPED per README | VERIFY — skip if present |
| Agnes Meyer Driscoll | SHIPPED per README | VERIFY — skip if present |
| GCHQ Trio (Ellis/Cocks/Williamson) | Probably NEW | Build — non-secret encryption 1969–1974 |
| Bill Tutte solo | Probably THIN | Verify if already paired with Flowers; upgrade to separate card if so |
| David Kahn | Probably NEW | Build — cryptologic historian |
| Elonka Dunin | Probably NEW | Build — Kryptos community leader, Cyrillic Projector co-solver, FOIA work that declassified the 1992–1993 NSA Kryptos solution |
| George Lasry | Probably NEW | Build — Copiale co-break (2011), Mary Stuart Castelnau letters co-break (2022), SIGABA break (2021), Hagelin M-209 and many others. Contemporary historical-cryptanalysis central figure via HistoCrypt. |

Estimated net new bios: **~9** (Rochefort, Beurling, Dilly Knox, Yardley,
Mavis Batey, GCHQ Trio, David Kahn, Elonka Dunin, George Lasry) plus 1
likely upgrade (Bill Tutte solo). Actual number depends on Phase 0.5
audit findings.

For each verified-as-NEW bio, use the existing biography card pattern:
emoji icon, name, dates, role, technique, short narrative, optional pull-
quote. Full spec details for each NEW bio:

1. **Joseph Rochefort (~1900–1976)** — Station HYPO, JN-25, Midway. Icon: 🌺.
2. **Arne Beurling (1905–1986)** — Swedish mathematician, Geheimschreiber break.
   Icon: 🇸🇪.
3. **Dillwyn "Dilly" Knox (1884–1943)** — Bletchley, Italian and Spanish Enigma,
   Abwehr Enigma. Icon: 🔍.
4. **Herbert Yardley (1889–1958)** — American Black Chamber (1919–1929);
   controversially published *The American Black Chamber* in 1931 exposing
   methods. Icon: 📖.
5. **Joan Clarke (1917–1996)** — Bletchley Hut 8; Turing's deputy; broke Naval
   Enigma alongside him. Icon: 🔢.
6. **Mavis Batey (1921–2013)** — Bletchley; broke Italian Naval Enigma before
   the Battle of Cape Matapan. Icon: 🌊.
7. **Elizebeth Smith Friedman (1892–1980)** — Coast Guard cryptanalysis;
   defeated rum-runners in the 1920s and Nazi spy rings in South America during
   WWII. Long overshadowed by her husband William. Icon: 🚢.
8. **Leo Marks (1920–2001)** — SOE cryptographer; moved Britain from poem codes
   to one-time pads for resistance agents; wrote *Between Silk and Cyanide*.
   Icon: 🪂.
9. **Agnes Meyer Driscoll (1889–1971)** — "Madame X" of US Navy cryptanalysis;
   broke multiple Japanese fleet codes pre-WWII; taught Rochefort. Icon: 🎖️.
10. **The GCHQ Trio: James Ellis, Clifford Cocks, Malcolm Williamson
    (1969–1974)** — invented non-secret encryption (public-key cryptography)
    years before Diffie-Hellman-Merkle; classified until 1997. Icon: 🇬🇧.
11. **Bill Tutte (solo, 1917–2002)** — separate card from the existing Tutte/
    Flowers pairing; focus on Tutte's mathematical reverse-engineering of
    Lorenz without ever seeing the machine. Icon: 🧮.
12. **David Kahn (1930–2024)** — cryptologic historian; *The Codebreakers*
    (1967) single-handedly created the field of cryptologic history as a
    scholarly discipline. Icon: 📚.
13. **Elonka Dunin (b. 1958)** — cryptographer, author, and the most
    persistent public chronicler of Kryptos. Filed the 2013 FOIA that
    declassified NSA's 1992 Kryptos solution attempts. Co-solved the
    Cyrillic Projector cipher (2003). Co-authored *Codebreaking: A
    Practical Guide* (Dunin & Schmeh, 2020). Named in nearly every
    unsolved-cipher community (Copiale, Zodiac, Kryptos). Icon: 🗝️.
    VERIFY Phase 0.5 audit — the existing Copiale exhibit's 2011 break
    by Knight/Megyesi/Schaefer may already cite her adjacent community
    work.
14. **George Lasry (b. ~1970s, contemporary)** — cryptanalyst and the
    central figure of the 2010s–2020s historical-cipher-breaking
    renaissance. Works in the German technology consultancy sector as
    his day job; independently publishes at HistoCrypt, *Cryptologia*,
    and *Cryptiana*. A non-exhaustive selection of his historical breaks:
    - **Copiale Cipher** (2011) — co-broken by Knight, Megyesi, Schaefer,
      with Lasry's contributions documented in follow-up papers.
    - **Zodiac Z-340** (2020) — co-broken with David Oranchak and Jarl Van
      Eycke after 51 years unsolved; published in *Cryptologia*.
    - **Mary Stuart Castelnau Letters** (2022) — co-broken with Norbert
      Biermann and Satoshi Tomokiyo; 57 previously-lost letters of Mary,
      Queen of Scots, spanning 1578–1584.
    - **SIGABA** (2021) — broke SIGABA, the unbroken US WWII rotor
      machine, under realistic ciphertext-only conditions at HistoCrypt.
    - **Hagelin M-209** — broke multiple M-209 messages via hill-climbing;
      founding paper in the area.
    - **Double Transposition** (2013) — co-broken with Niels Kopal and
      Arno Wacker; fundamental modern demonstration that classical
      transposition falls to hill-climb search.
    - Dozens of additional historical-cipher breaks via HistoCrypt and
      *Cryptologia* across the 2015–2025 period.
    What unites his work: **the computational revolution in historical
    cryptanalysis** — hill-climbing and simulated annealing applied
    systematically to cipher corpora that defeated pencil-and-paper
    codebreakers for centuries. If Turing is the historical icon of
    cryptanalysis-by-machine, Lasry is the contemporary one.
    Icon: 🔑.
    Works to cite on his exhibit card: Lasry/Biermann/Tomokiyo 2022
    *Cryptologia* paper; Oranchak/Lasry/Van Eycke 2020 Zodiac 340
    paper; Lasry 2021 SIGABA HistoCrypt paper.

Update the Hall X hero subtitle to the verified post-audit count. Baseline
per README is 21 biographies; expected post-phase count is ~30 (21 + ~9
genuinely new) but actual delta depends on Phase 0.5 audit findings. Read
the current subtitle text first and replace the number — do not assume
"Fifteen moments" wording; the shipped hero copy may already say something
different.

**Commit:** `phase 12 [round 3]: ~7 new codebreaker biographies + hall X audit upgrades`

---

## Phase 13 — Global integration

After the new content is built, wire it into every global touchpoint. The
current site already has substantial integration infrastructure — see Phase
0.5 audit for what exists. Use the existing pattern in each file; don't
invent parallel structures.

### 13a. museum-map.html
- Add every new exhibit to the Complete Cipher Index table, assigned to the
  correct hall.
- Add Hall XII (Unsolved Ciphers) and Hall XIII (Ciphers in Culture) to the
  Architectural Floor Plan graphic.
- Update the map's subtitle (currently stale per the consistency pass —
  reconcile with post-Round-3 count).
- Update the footer count ("N exhibits · 13 halls").

### 13b. timeline.html
- Add year markers for every new exhibit.
- Add new era anchors for ~1900 BCE (Egyptian), ~1700 BCE (Phaistos),
  ~499 BCE (Histiaeus), ~4th c. CE (Kama Sutra), and any other new era
  spans.
- Update the "Years of Secrets" / header date range to reflect the earliest
  new exhibit (~1900 BCE Egyptian pushes to 3,900+ years).
- For Hall XIII cultural exhibits, place markers at publication year
  (Gold-Bug 1843, Dancing Men 1903, Da Vinci Code 2003, National Treasure
  2004, Gravity Falls 2012, Cicada 3301 2012).
- **Do NOT disturb the six-stage cryptography evolution strip** added in
  the most recent deployed update (Ancient → Classical → Mechanical →
  Modern → Symmetric AES → Asymmetric Public-Key). That work is canonical;
  new era anchors go in the historical event timeline below it.

### 13c. comparison.html
- Add rows for every new cipher exhibit in the data source (currently 63
  rows; post-Round-3 will be ~113).
- Update the total count in the header.
- Consider adding a "Medium" column (historical / fictional / internet
  phenomenon) so users can filter the cultural exhibits distinctly.

### 13d. search.html (critical — do not skip)
- Rebuild the client-side search index (embedded in the page or loaded from
  a JSON file — follow the existing pattern).
- Index every new exhibit with title, hall assignment, year, and key
  historical terms.
- Index every new biography in Hall X.
- Index new halls (Hall XII Unsolved, Hall XIII Culture) as first-class
  entries.
- Update the page's descriptor text: "Across X ciphers, 13 exhibit halls,
  N codebreaker biographies, …" — verify actual counts post-build.
- Update the "Try a quick search" suggestion chips if any suggested terms
  reference exhibits that have moved (e.g., if Voynich moved to Hall XII).

### 13e. cipher-flow.html (visual family map)
- Add new cipher families and their relationships.
- Specifically: add connection arrows for Kama Sutra → substitution
  tradition, Arabic Nomenclators → European nomenclators, Morse Code →
  Fractionated Morse + Tap Code + Chinese Telegraph Code, Affine → Caesar
  (as a generalization), Trithemius → Vigenère, Cardano Autokey → Autokey
  (if distinct from the shipped Autokey exhibit), Diffie-Hellman → RSA
  (via the Kerckhoffs link newly added in Phase 11).

### 13f. index.html
- Update all hero counts: ciphers (~113), halls (13), years (3,900+).
- Note the shipped index.html has MULTIPLE count references — hero subtitle,
  stat block tiles, footer. Update every one and grep for orphans.
- Refresh the "Featured Ciphers" list — recommendation: bump from 25 to 27
  and include at least one Hall XII unsolved pick (Phaistos Disc or Somerton
  Man) and one Hall XIII cultural pick (Da Vinci Code or Cicada 3301).
  Leave final curation to Paul.
- Update the Playground dropdown where engines exist for new simple ciphers
  (Affine would fit).
- Update footer version string to `v3.0.0 "Global Expansion"`.

### 13g. README.md and site-wide identity statement
- Regenerate the hall table with 13 rows (all existing rows preserved,
  add Hall XII Unsolved and Hall XIII Culture).
- Update the opening paragraph's cipher count (currently "63 historically
  important ciphers across 11 exhibit halls").
- Update the "62 Interactive Demos" count to the new total.
- Expand the demo roster table (the large `| Cipher | Created | Broken |
  What the demo does |` table) with rows for every new Track A exhibit.
- Update the project structure section's file tree.
- Update the testing section if new test assertions were added (see 13h).
- Leave the Scripture quote and Latest Update block intact.
- **Standardize the site's identity statement.** Use this exact language
  (verified as the north star for v3.0.0) across README hero, homepage
  hero, and GitHub repo description:

  > Cipher Museum is an open-source, interactive cryptography-history
  > museum: part digital exhibit, part cipher playground, and part
  > codebreaking classroom. It connects 2,500 years of historical ciphers
  > to the design lessons behind modern and post-quantum cryptography.

  Short GitHub repo description (one line, ~120 chars):

  > Open-source interactive cryptography-history museum connecting 2,500
  > years of ciphers to modern and post-quantum cryptography.

  Count signature: `N historically important ciphers · 13 exhibit halls
  · N interactive demos` (fill in N post-build).
- Grep the entire repo for stale taglines ("37 ciphers", "10 exhibit
  halls", "2,400 years", "2,500 years" if the post-Round-3 span is
  different) and replace with the current accurate values.

### 13h. Tests — integrate with the 6-suite architecture
Every new Track A exhibit must integrate with all relevant test suites.
Per the README testing section, the suites are:
- `test-all-engines.js` (309 assertions, engine roundtrip & known-answer)
- `test-deep-ciphers.js` (238 assertions, edge cases & stress tests)
- `test-comprehensive.js` (417 assertions, cross-cipher invariants)
- `test-accessibility.js` (790 assertions, WCAG audit across pages)
- `test-mobile.js` (240 assertions, responsive audit across pages)
- `test-demo-pages.js` (304 assertions, JSDOM end-to-end click-through)

For each new exhibit:
- Engine: add to all-engines.js with standard registration pattern.
- Roundtrip + KAT: add tests to test-all-engines.js.
- Edge cases: add at least one stress test to test-deep-ciphers.js.
- Cross-cipher invariants: if the engine fits a family already in
  test-comprehensive.js (substitution, polyalphabetic, transposition),
  add it to the relevant family loop.
- Accessibility: every new page is automatically swept by
  test-accessibility.js — run and fix any flagged issues.
- Mobile: every new page is automatically swept by test-mobile.js — run
  and fix any flagged issues.
- **test-demo-pages.js (most important):** every new Track A exhibit
  page must pass the JSDOM click-through test. This harness loads each
  cipher page, lets `js/demo-loader.js` build the demo UI, clicks the
  actual on-page Encrypt and Decrypt buttons, and verifies the
  ciphertext roundtrips through the rendered DOM. If a new exhibit
  uses a non-standard demo layout, extend the harness rather than
  shipping a page it can't simulate.
- Hand-built pages that use a canonical KAT (Caesar, Playfair, Vigenère,
  Zodiac) have dedicated assertions. New exhibits with a canonical KAT
  (Diffie-Hellman's textbook g=5, p=23 example; RSA's p=61, q=53 small-
  prime textbook example) should follow the same pattern.

Run all six suites before committing Phase 13. Target state: all green.

### 13i. Demo architecture — use the shipped pattern
Existing exhibits use `js/demo-loader.js` to dynamically generate the demo
UI from the engine registration in `js/ciphers/all-engines.js`. **New
exhibits must use this pattern** rather than hand-coding a Try-It-Yourself
block per page. The steps:

1. Register the new engine in `all-engines.js` with its declared inputs,
   outputs, and parameters.
2. The exhibit page declares the demo container (`<div data-cipher-demo=
   "exhibit-slug"></div>` or the project's established hook).
3. `demo-loader.js` builds the UI automatically: text area, key input,
   encrypt/decrypt buttons, output pane.
4. The JSDOM test harness then finds the rendered buttons and clicks them.

This is cleaner, produces a consistent UX across all exhibits, and
guarantees every demo gets the same accessibility and mobile affordances
that the loader already provides.

Exceptions (hand-coded pages) should be rare and deliberate: Kryptos'
four-section display, Playfair's key-square builder, Zodiac's homophonic
reveal, Enigma's rotor animation. These already exist; the pattern is to
extend the loader when a new exhibit needs a non-standard element, not
to bypass it.

### 13j. Tours, community
- `tours/`: consider adding one or two new guided tours themed around
  new content. Candidates: "The Unsolved" (tour of Hall XII), "Ciphers
  on Screen" (tour of Hall XIII), "The Global Story" (Hall I ancient
  world through Hall VIII's now-diverse geography).
- `community/`: no direct Round 3 changes unless new discussion threads
  are warranted.

### 13k. Hall pages — prev/next integration
- Update all "Hall X of Y" lines to "of 13".
- Update prev/next chains where Hall XII and Hall XIII insertions affect
  them.
- Hall XI Modern Cryptography next link: Hall XII Unsolved.
- Hall XII Unsolved: prev Hall XI Modern, next Hall XIII Culture.
- Hall XIII Culture: prev Hall XII Unsolved, no next link (final hall).
- Update Hall VIII framing to remove the "unsolved" rhetoric now that
  unsolved has its own hall, and to reflect that cultural-origin ciphers
  now live in Hall XIII.

### 13l. 404.html and glossary.html
- Grep for stale counts and update.

### 13m. sitemap.xml
- Add every new exhibit URL, both new hall URLs, and biography anchors.

### 13n. Cryptiana bibliographic enrichment on existing exhibits

Add a "Further reading" reference line pointing to Tomokiyo's *Cryptiana*
for existing shipped exhibits where his archival primary-source work
substantially extends the exhibit's existing references. This is low-
effort (a single citation line per exhibit, no structural changes) but
substantially strengthens the museum's scholarly grounding.

Exhibits to enrich (all shipped — verify in Phase 0.5 audit):

- `ciphers/babington-plot.html` — add: *Satoshi Tomokiyo, Cryptiana,
  "Ciphers of Mary, Queen of Scots," `cryptiana.web.fc2.com/code/mary.htm`;
  "Thomas Phelippes' Deciphering of Spanish Ciphers Found in French
  Archives," `cryptiana.web.fc2.com/code/phelippes.htm`.* Cross-link to
  the new `mary-stuart-castelnau-letters` exhibit added in Phase 5.
- `ciphers/great-cipher.html` (Rossignol) — add: *Satoshi Tomokiyo,
  Cryptiana, "French Ciphers during the Reign of Louis XIV,"
  `cryptiana.web.fc2.com/code/louisxiv.htm`; "Specimens of Louis XIV's
  Great Cipher (1691)," `cryptiana.web.fc2.com/code/bazeries3.htm`;
  "Commandant Bazeries' Codebreaking and His Candidate of the Man in the
  Iron Mask," `cryptiana.web.fc2.com/code/bazeries2.htm`.*
- `ciphers/arnold-andre.html` (built new in Phase 7) — add: *Satoshi
  Tomokiyo, Cryptiana, "Book Codes between Benedict Arnold and John André
  (1779–1780)," `cryptiana.web.fc2.com/code/arnold.htm`.*
- `ciphers/jefferson-disk.html` — add cross-link to the new
  `patterson-jefferson-cipher` exhibit (Phase 5) with a short "See also"
  note explaining that Jefferson's wheel cipher (the current exhibit) is
  a strong rotating-disk system, while Patterson's cipher (the sibling
  exhibit) was a transposition system that Jefferson himself could not
  decrypt. Include: *Satoshi Tomokiyo, Cryptiana, "Thomas Jefferson's
  Codes and Ciphers" three-part series,
  `cryptiana.web.fc2.com/code/jeffersn.htm`, `/jeffers2.htm`, `/jeffers3.htm`.*
- `ciphers/beale.html` (moving to Hall XII in Phase 2) — add: *Satoshi
  Tomokiyo, Cryptiana, "Errors in Beale Cipher No.2,"
  `cryptiana.web.fc2.com/code/beale2.htm`.* Note that Tomokiyo
  catalogues specific transcription errors in the published Beale No. 2
  ciphertext that may affect future decipherment attempts.
- `ciphers/culper-ring.html` (built new in Phase 7) — add: *Satoshi
  Tomokiyo, Cryptiana, "Codes and Ciphers during the American
  Revolutionary War" index,
  `cryptiana.web.fc2.com/code/index.htm`.* (Culper Ring specifically
  intersects with Tomokiyo's Washington-Rochambeau correspondence
  article; cite inline where relevant.)
- `ciphers/wallis-ciphers.html` (built new in Phase 5) — add: *Satoshi
  Tomokiyo, Cryptiana, "John Wallis and Cryptanalysis,"
  `cryptiana.web.fc2.com/code/wallis_e.htm`; "Secret Letters Left
  Unbroken by John Wallis Solved After 400 Years,"
  `cryptiana.web.fc2.com/code/wallis3.htm`.*

Do NOT rewrite the exhibit prose — just add the reference line in the
existing "Further reading" or "References" section at the bottom of
each exhibit.

### 13o. Shipped-exhibit sidebar enrichments (from extended cipher-lineage audit)

Several shipped exhibits would benefit from compact side-panel additions
that clarify cipher-family relationships, common misattributions, or
lineage gaps that a comprehensive museum should cover honestly. These
are NOT new exhibits — each is a single side-panel addition (one to three
paragraphs plus references) on an existing page.

**1. Side panel on shipped `ciphers/m209.html`: "The Hagelin Machine
Family — C-36, C-38, BC-38, M-209"**

- Boris Hagelin's commercial cipher-machine business ran from 1920s
  Stockholm through 1950s Switzerland and produced a family of related
  mechanical cipher machines. M-209 (shipped) is the US Army's licensed
  version of the C-38. The fuller family includes:
  - **B-21** (1925) — Hagelin's first commercial machine, typewriter-based
    rotor cipher.
  - **C-36** (1934) — Simplified pocket-sized "irregular stepping" cipher
    machine, the conceptual basis for all later Hagelin designs.
  - **C-38** (1938) — Six-lug drum, pinwheel-driven, fits in a briefcase.
    Adopted by French, Italian, and multiple Allied armies. Licensed to
    the US Army as **M-209**.
  - **BC-38** (1938) — Desktop electric version with printer; used by
    commercial enterprises and diplomatic services.
  - **CD-57** (1957) — Postwar Swiss-made successor, lighter and quieter.
- Framing: Hagelin built cipher machines the way Remington built
  typewriters — a 30+ year product lineage with iterative refinement
  aimed at a commercial and governmental market. M-209 is the most famous
  Hagelin machine because of its massive US WWII deployment, but it's
  part of a larger product story. This side panel completes the story
  without requiring a separate exhibit for each variant.
- Separately, note briefly that Hagelin Cryptos AG (the postwar Swiss
  company) was revealed in 2020 to have been partially owned and
  influenced by the CIA and German BND — the "Operation Rubicon" / Crypto
  AG story — which compromised cipher machines sold to non-aligned
  nations through the 1970s–1990s. Link to the Crypto AG Wikipedia
  article or the Washington Post / ZDF 2020 reporting. This is a dark
  chapter of Hagelin's lineage and honest scholarship should include it.
- References: David Kahn *The Codebreakers* Ch. 13; Crypto Museum
  Foundation Hagelin family documentation (cryptomuseum.com/crypto/
  hagelin/); Greg Miller, "The intelligence coup of the century"
  (Washington Post, Feb 11, 2020) on Operation Rubicon.

**2. Sidebar on shipped `ciphers/playfair.html`: "Wheatstone Invented
It; Playfair Promoted It"**

- The Playfair cipher (digraph substitution with a 5×5 keyword square) was
  actually invented by **Charles Wheatstone** in 1854, not by Baron
  Playfair. Wheatstone designed it to demonstrate that modern cryptography
  could be practical for field military use; he even built a small
  physical device to perform the digraph lookup.
- Lord Lyon Playfair was Wheatstone's friend and a well-connected
  politician. Playfair pitched the cipher to the Foreign Office and
  to his own political networks as a practical diplomatic cipher.
  Attribution shifted to Playfair because he was the public advocate;
  the British Army and Foreign Office knew it as "Playfair's cipher"
  within a few years.
- Wheatstone's broader cryptographic work includes the **Wheatstone
  Cryptograph** (a cipher wheel device — Round 3 Phase 5 adds that
  exhibit) and the 1867 solution of the Charles I ciphers that had
  resisted 17th-century analysis.
- This pattern (invention vs. promotion / credit asymmetry) recurs in
  cryptographic history — Diffie-Hellman-Merkle, Rivest-Shamir-Adleman,
  and the GCHQ trio (Ellis/Cocks/Williamson — see Phase 12 bios) all
  involve similar untangling.
- References: Simon Singh *The Code Book* Ch. 2; Kahn *The Codebreakers*
  Ch. 6; Wheatstone's original 1854 cipher description in the Playfair
  correspondence held at the Royal Society archives.

**3. Sidebar on shipped `ciphers/nihilist.html`: "Two Nihilist Ciphers —
Substitution and Transposition"**

- The name "Nihilist" in cryptography refers to the 19th-century Russian
  revolutionary movement (Narodnaya Volya / "People's Will") that used
  these ciphers for clandestine communication. There are actually **two
  distinct Nihilist ciphers**, often confused:
  - **Nihilist Substitution** (the shipped exhibit) — Polybius-square
    substitution followed by addition with a repeating keyword. The more
    famous of the two; used operationally by Russian revolutionaries in
    the 1880s.
  - **Nihilist Transposition** — A separate system combining columnar
    transposition with a keyword-derived row/column order. Less famous
    but appears in cipher textbooks through the 20th century.
- This side panel briefly describes Nihilist Transposition without
  building a full exhibit (the mechanism is a variant of existing
  Columnar Transposition, which IS shipped).
- Cross-link to Columnar Transposition (shipped), Nihilist Substitution
  (shipped — this exhibit), and the Checkerboard Family sidebar (below).
- References: Kahn *The Codebreakers* Ch. 15; William Friedman, *Elementary
  Military Cryptography* (Army War College, 1935 declassified editions).

**4. Sidebar on shipped `ciphers/columnar-transposition.html`: "Transposition
Variants — Route, Myszkowski, Nihilist"**

- Columnar transposition (shipped) is the parent of a family of related
  systems. This sidebar describes three named variants without building
  separate exhibits for each:
  - **Route Cipher** — Plaintext written into a grid, then read out along
    a specified "route" (diagonals, spirals, zig-zags, snake patterns).
    Used in the American Civil War; mentioned in Kahn Ch. 7. Still
    appears in recreational cryptography.
  - **Myszkowski Transposition** — A columnar transposition variant
    where the keyword may contain repeated letters. The repeated letters
    designate columns that are read out together, breaking the strict
    column-by-column order. Named for Émile Victor Théodore Myszkowski
    who published the variant in *Cryptographie indéchiffrable* (Paris,
    1902).
  - **Nihilist Transposition** — see item 3 above; a keyword-ordered
    column and row transposition.
- Framing: transposition is a family of rearrangement techniques; the
  shipped Columnar Transposition exhibit covers the most common form,
  and these variants are described here for completeness. Each variant
  has the same cryptanalytic weakness (preserved letter frequencies)
  and falls to hill-climbing in the modern era (see the Patterson's
  Cipher exhibit, Phase 5, for the archetypal transposition-family
  hill-climb).
- References: David Kahn *The Codebreakers* Ch. 7; William Friedman,
  *Elementary Military Cryptography* (Army War College, 1935);
  Myszkowski *Cryptographie indéchiffrable* (Paris, 1902).

**5. Sidebar on shipped `ciphers/straddling-checkerboard.html`: "The
Checkerboard Family — Polybius → Nihilist → Tap Code → VIC"**

- The "checkerboard" fractionation pattern — mapping each letter to a
  two-digit coordinate pair via a 5×5 or 6×6 grid — is the parent of
  several apparently-different cipher systems that share underlying
  mechanics:
  - **Polybius Square** (shipped, Hall I) — ancient Greek, the foundational
    5×5 coordinate grid.
  - **Nihilist Substitution** (shipped) — Polybius + keyword addition.
  - **Tap Code** (shipped, Hall VIII) — Polybius applied as auditory
    coordinates (two taps for row, pause, two taps for column).
    Famously used by US POWs in North Vietnam.
  - **Straddling Checkerboard** (this exhibit) — Variable-length
    Polybius that emits one-digit codewords for common letters and
    two-digit codewords for rare letters. Used in VIC.
  - **VIC Cipher** (shipped, Hall V) — Rudolf Abel's 1950s KGB field
    cipher combining straddling checkerboard with two further
    transposition layers.
  - **Monome-Dinome** / **Pollux** — related variable-length
    checkerboard variants from the 20th century.
- Framing: "Checkerboard" as a cipher-family designation makes these
  systems' relationships visible. They look different at the surface —
  tap code is auditory, VIC is multi-layered, Polybius is ancient — but
  they share a common mechanism. This sidebar teaches the family
  relationship directly; the Artifact Cards (Phase 15) will reinforce
  it through metadata fields.
- References: Kahn *The Codebreakers* Ch. 13 on Russian ciphers; William
  Friedman *Military Cryptanalysis* (NSA declassified editions); Military
  Cryptanalytics Parts I–II (Friedman/Callimahos).

**6. Sidebar on shipped `ciphers/jefferson-disk.html`: "The Jefferson-
Wheel Cipher Lineage — 1790s to WWII"**

- Round 3 adds two exhibits that complete the Jefferson-wheel family
  story: Bazeries Cylinder (Phase 4) and M-94/M-138-A (Phase 4). This
  sidebar ties them together on the original Jefferson Disk page.
- Lineage:
  - **1790s** — Thomas Jefferson designs a 36-disk wheel cipher.
    Never operationalized; rediscovered in Jefferson's papers in the
    1920s (see Phase 5, Patterson's Cipher for related early-American
    cryptographic context).
  - **1891** — Étienne Bazeries independently invents a 20-disk
    cylinder (Phase 4, `bazeries-cylinder`). Pitched to the French
    Army; rejected after French cryptographers broke it.
  - **1916** — Parker Hitt (US Army Signal Corps) describes a
    multi-disk cipher in his *Manual for the Solution of Military
    Ciphers* — essentially a rediscovery of Jefferson's system.
  - **1922** — US Army adopts Hitt's system as the **M-94** (Phase 4,
    `m94-m138a`), using 25 aluminum disks.
  - **1935** — M-94 superseded by the **M-138-A** strip cipher, a paper-
    strip adaptation of the same principle.
  - **1943** — Both M-94 and M-138-A retired as SIGABA (Hall VII, Phase 4)
    takes over strategic traffic.
- The recurring pattern: multi-disk wheel ciphers are mechanically
  tempting (portable, no power, easy to operate) but cryptographically
  fragile — de Viaris showed in 1893 that known-plaintext plus enough
  ciphertext recovers the disk arrangement. Every rediscovery since has
  hit the same wall.
- Cross-links: Jefferson Disk (this exhibit), Bazeries Cylinder
  (Hall VII, Phase 4), M-94/M-138-A (Hall VII, Phase 4), SIGABA
  (Hall VII, Phase 4), Patterson's Cipher (Hall II, Phase 5 — a
  different Jefferson-era American cipher with its own 200-year story).
- References: see references on each constituent exhibit.

**7. Hall V hall-page sidebar: "WWI and WWII Tactical Field Cipher
Systems — Comparative View"**

- On `halls/military.html` (or whatever the Hall V page is — verify in
  Phase 0.5 audit), add a compact comparative table/panel listing the
  museum's tactical field cipher exhibits side by side with key
  characteristics:
  - **Playfair** (UK/Commonwealth, WWI) — digraph substitution, brigade/
    below
  - **ADFGX / ADFGVX** (Germany, WWI) — fractionation + transposition,
    strategic and tactical
  - **JN-25** (Japan, WWII, Phase 3) — codebook + additive, strategic
  - **Red / Type A** (Japan, WWII, Phase 3) — machine cipher, diplomatic
  - **Purple / Type B** (Japan, WWII, shipped) — machine cipher, strategic
  - **Slidex** (UK, WWII, Phase 6) — sliding-strip hand cipher, tactical
  - **M-94 / M-138-A** (US, 1922–1943, Phase 4) — wheel/strip cipher,
    tactical and State Dept
  - **M-209** (US, WWII, shipped) — Hagelin hand-machine, tactical
  - **Code Talkers** (US, WWII, shipped) — linguistic concealment
  - **Zimmermann-style nomenclator** (Phase 6) — diplomatic
  - **BATCO** (UK, 1980s–2000s) — see Slidex side panel, Phase 6
  - **Diana Cryptosystem** (US, 1960s–, Phase 8) — hand OTP, Special
    Forces
- Table columns: Period · Theater · User Level · Type · Strength vs.
  Weakness · Related Museum Exhibit.
- Framing: Tactical field cryptography is a recurring design problem
  — each theater solves it differently based on constraints (training
  time, compromise recovery, speed, operator skill, available
  infrastructure). Seeing these side-by-side teaches that there's no
  single "correct" tactical cipher; the right choice depends on the
  operational context.
- This is a hall-level sidebar, not per-exhibit. Include links from the
  comparative table to each individual exhibit.

**8. Hall V hall-page appendix: "Modern Tactical Authentication
Systems"**

- Brief appendix note on `halls/military.html` covering tactical codes
  that are too niche for individual exhibits but deserve mention for
  completeness:
  - **DRYAD Numeral Cipher** — US Army tactical authentication system.
    Matrix-lookup used for radio call-sign authentication and short
    numerical messages. Still in active use. Not a cipher with
    cryptographic ambition beyond its use case.
  - **BATCO** — see Slidex side panel, Phase 6.
  - Other tactical systems referenced in passing: **KAK** (US one-time
    cipher pad, NSA-managed), **KL-57** (variant of KL-7, Phase 4).
- Framing: tactical cryptography is a large, active, under-documented
  part of military practice. The museum's exhibits cover the
  historically significant examples; this appendix acknowledges the
  broader practice without attempting to catalogue it.
- Keep this brief — it's a pointer, not a comprehensive resource.
- References: US Army FM 6-02 series (declassified sections); John
  Bamford, *Body of Secrets* (Doubleday, 2001) on NSA tactical crypto.

**Commit per item:** `phase 13o [round 3]: sidebar enrichment on [exhibit]`

### 13p. Further Reading page (new)

Create a new page `further-reading.html` as the museum's single home for
its reference canon and scholarly resources. This complements the per-
exhibit references (which remain exhibit-scoped) by giving visitors a
front-door bibliography they can browse without having to open every
exhibit page.

#### Structure

The page follows the museum's standard hero + content structure. The
hero frames the page honestly: **"The Cipher Museum stands on other
people's research."** The museum's role is synthesis and interactive
pedagogy; the scholarship that makes the exhibits possible lives in the
books, papers, and archives below.

#### Sections

**1. Core reference canon (the four standing references):**

- **David Kahn, *The Codebreakers: The Story of Secret Writing*** (Scribner,
  1967; revised 1996). The foundational cryptologic history. ~1,200 pages.
  Cited on nearly every pre-1970 exhibit.
- **Simon Singh, *The Code Book: The Science of Secrecy from Ancient Egypt
  to Quantum Cryptography*** (Anchor, 1999). The best popular introduction
  to cryptographic history for general readers.
- **Mark Frary, *De/Cipher: The Greatest Codes Ever Invented and How to
  Break Them*** (Modern Books, 2017). A breadth survey of 50 ciphers with
  working-level cryptographic detail and excellent contextual framing.
- **Satoshi Tomokiyo, *Cryptiana: Articles on Historical Cryptography***
  (2008–present), `cryptiana.web.fc2.com/code/crypto.htm`. The most
  comprehensive online archive of primary-source research on Renaissance
  through 19th-century ciphers. Free. Hundreds of detailed articles on
  specific diplomatic ciphers of every major European court, American
  Revolutionary War codes, Civil War ciphers, early Japanese diplomatic
  codes, and historiographical commentary on cryptologic terminology.
  Tomokiyo is also a co-author of the 2022 *Cryptologia* paper that broke
  57 previously-lost letters of Mary, Queen of Scots (see Hall II,
  `mary-stuart-castelnau-letters`).

Each canon entry gets a short paragraph explaining **when to reach for it**
(Kahn for comprehensive coverage; Singh for narrative flow; Frary for
modern operational framing; Cryptiana for Renaissance-to-19th-century
primary sources).

**2. Contemporary research communities and journals:**

- ***Cryptologia*** (Taylor & Francis, 1977–present). The leading peer-
  reviewed journal of cryptologic history and education. Link to the
  journal's homepage; note that many articles cited throughout the museum
  are from its pages, including the 2022 Lasry/Biermann/Tomokiyo Mary
  Stuart paper and the 2020 Oranchak/Lasry/Van Eycke Zodiac 340 paper.
- **HistoCrypt** — the International Conference on Historical Cryptology.
  Open-access proceedings at histocrypt.org. Many of the contemporary
  historical-cipher breakthroughs documented in the museum were first
  published here (Lasry's SIGABA break, the Mary Stuart cross-cipher-
  errors paper, numerous Vatican and French diplomatic cipher studies).
- **DECODE database** (decode.humlab.lu.se, Uppsala University). Historical
  cipher research database developed by Beáta Megyesi's team. Machine-
  searchable corpus of over 2,000 historical ciphertexts.

**3. Individual scholars and community maintainers:**

Link to personal sites and publications of specific researchers whose work
threads through multiple exhibits:

- **Elonka Dunin** (`elonka.com`) — the Kryptos community's central
  maintainer; Cyrillic Projector co-solver; 2013 FOIA that declassified
  NSA's 1992 Kryptos solutions. See her Hall X biography.
- **George Lasry** — central figure of contemporary historical
  cryptanalysis; publication list via *Cryptologia* and HistoCrypt. See
  his Hall X biography.
- **Nick Pelling** (`ciphermysteries.com`) — prolific commentator on
  unsolved historical ciphers including Voynich, Dorabella, D'Agapeyeff,
  and others. Balanced between skeptical rigor and engagement with
  amateur research.
- **Beáta Megyesi** (University of Uppsala) — Copiale Cipher co-breaker
  (2011); founder of the DECODE project.
- **Jim Gillogly** (`voynich.net/Kryptos/`) — first public Kryptos solver
  (K1–K3, 1999); extensive Kryptos documentation archive.

**4. Key archives and digitized primary sources:**

- **Bibliothèque nationale de France — Manuscrits** (gallica.bnf.fr). Home
  of the Castelnau letters that the 2022 Mary Stuart decipherment worked
  from.
- **The National Archives (UK)** (nationalarchives.gov.uk). Tudor and
  Stuart diplomatic correspondence including Walsingham's intelligence
  papers.
- **Library of Congress — Thomas Jefferson Papers** (loc.gov/collections/
  thomas-jefferson-papers/). Primary source for Patterson's Cipher and
  Jefferson's other cryptographic correspondence.
- **CIA FOIA Reading Room** (cia.gov/readingroom). Declassified
  intelligence documents including David Stein's 1999 Kryptos solution
  paper and NSA's 1992–1993 Kryptos work.
- **NSA Center for Cryptologic History** (nsa.gov/History) — museum,
  publications, and declassified educational materials.

**5. Exhibit-to-source index:**

A small table or search-friendly list that maps selected exhibits to
their heaviest-cited sources. Example row: "Babington Plot → Kahn Ch. 4;
Tomokiyo *Cryptiana* on Mary, Queen of Scots; Bossy *Giordano Bruno and
the Embassy Affair*." This is for visitors who want to dig deeper into a
specific exhibit's primary-source chain. Keep it to ~20 representative
exhibits; the full per-exhibit reference lists already live on the
exhibits themselves.

#### Implementation notes

- No new dependencies. Plain HTML + existing CSS.
- Links open in new tabs (`target="_blank" rel="noopener noreferrer"`) —
  external scholarly resources, not internal navigation.
- Include a brief "Attribution" paragraph noting that the museum's
  exhibits synthesize from these sources and that original primary
  research lives in the linked destinations.
- Accessibility: headings structured logically (H1 → H2 per section →
  H3 per work); external-link indicators (✱ or visible icon) for screen
  reader context.

#### Navigation

Add `further-reading.html` to:
- The global nav (alongside Museum Map, Search, Glossary, Tours).
- `museum-map.html` as a final "Scholarly Home" link at the bottom.
- The bottom of `glossary.html` as a "For deeper research, see Further
  Reading" link.
- README's main navigation list.

#### Commit

`phase 13p [round 3]: further-reading.html with four-canon reference, HistoCrypt/Cryptologia, and Cryptiana as prominent link`

**Commit per sub-phase:** `phase 13N [round 3]: [specific integration]`

---

## Phase 15 — Artifact Card standardization

### Purpose

Every exhibit page should open with a consistent, scannable **Artifact Card** —
a compact metadata header that gives a museum visitor the essential facts
without having to read the full exhibit prose. This is the single highest-
value cross-cutting standardization in Round 3.

Currently, per the README, exhibits follow the four-part structure
(Historical Context / How It Works / How It Was Broken / What It Teaches
Modern Crypto). The Artifact Card sits **above** this — a header summary,
not a replacement.

### 15a. Design the card

The card renders at the top of every `ciphers/*.html` page, below the hero
and above the first content section. Required fields:

- **Era** — century or date range (e.g., "1st century BCE", "1976–present")
- **Family** — cipher family classification (monoalphabetic, polyalphabetic,
  transposition, fractionation, mechanical rotor, public-key, hash, etc.)
- **Region / Culture** — where the cipher originated (Rome, Islamic world,
  Renaissance Italy, WWII Germany, etc.)
- **Used by** — principal historical users (Roman military, German
  Wehrmacht, KGB, Zodiac Killer, etc.)
- **Key type** — nature of the key (single shift, keyword, rotor setting,
  public prime + generator, no key / steganographic, unknown)
- **Key idea** — one sentence summary of the cipher's core mechanism
- **Security failure** — how it was broken OR why it remains secure
- **Modern lesson** — what contemporary cryptography learned from this cipher

Optional supplementary fields (omit when not relevant):

- **Status** — Solved / Partially solved / Unsolved (for unsolved-cipher
  exhibits)
- **Broken by** — name or team, year (Al-Kindi ~850, Kasiski 1863, Rejewski
  1932, etc.)
- **Demo available** — "Yes — Try It Yourself below" (Track A) or
  "No — visualization only, see below" (Track B)
- **Cultural Reach** — for Hall XIII exhibits (bestseller novel, hit film,
  popular TV series, internet phenomenon)

### 15b. Implement as data-driven, not per-page HTML

To avoid editing 105 pages by hand, implement the card as a shared
component:

1. Create `data/artifact-cards.json` (or similar — follow the existing
   data-file pattern used by `comparison.html` and `search.html`). Every
   cipher exhibit gets one object:
   ```json
   {
     "caesar": {
       "era": "1st century BCE",
       "family": "Monoalphabetic substitution",
       "region": "Roman Republic",
       "used_by": "Roman military and political communication",
       "key_type": "Small numeric shift (1–25)",
       "key_idea": "Shift each letter by a fixed number",
       "security_failure": "Trivial brute force (only 25 keys); frequency analysis",
       "broken_by": "Al-Kindi, ~850 CE",
       "modern_lesson": "Keyspace size and secrecy of algorithm are not enough",
       "status": "Solved",
       "demo_available": "Yes"
     },
     ...
   }
   ```
2. Extend `js/demo-loader.js` (or add a companion `js/artifact-card.js`) to
   read this data at page load, find the cipher slug from the page URL or a
   page-level data attribute, and inject the card HTML at a `<div
   data-artifact-card></div>` hook near the top of each exhibit page.
3. Add the hook (`<div data-artifact-card></div>`) to every exhibit page
   with a one-time sed or bulk-edit pass. Existing four-part exhibit
   structure is preserved below.

### 15c. Styling

- Card renders as a compact table or grid styled to match the museum's
  Smithsonian Dark / Scholarly Gold aesthetic.
- Border-left accent in gold (`#C9A84C`).
- Typography: field names in Cinzel small-caps, values in Cormorant
  Garamond.
- Mobile: card stacks vertically with no horizontal scroll.
- Include skip-link target so screen readers can bypass the card and jump
  to the main exhibit prose.

### 15d. Coverage requirement

Every Round 3-new exhibit (~45 new ciphers + 2 generic techniques + 3
context + 1 Kerckhoffs) MUST ship with its artifact-card entry in
`data/artifact-cards.json`.

Every SHIPPED exhibit (63 currently) MUST have an entry added. This is
mechanical work — pull era/family/region/etc. from the existing hall
assignment and exhibit prose. Batch-generate initial entries, then review
and refine.

### 15e. Tests

- Add to `test-comprehensive.js`: assertion that every exhibit page in
  `ciphers/` has a corresponding entry in `artifact-cards.json` and that
  the entry has all required fields.
- Add to `test-demo-pages.js`: JSDOM check that the artifact-card hook
  renders (every exhibit page, post-load, contains a populated artifact-
  card element).

**Commit:** `phase 15 [round 3]: artifact card data model + renderer + entries for all ~113 exhibits`

### 15f. Worldupdates checklist entry

Add to `docs/worldupdates.md`:
```
## Phase 15 — Artifact Card standardization
- [x] data/artifact-cards.json created
- [x] Card renderer added (demo-loader extension or companion module)
- [x] All 63 existing exhibits have artifact-card entries
- [x] All ~51 new Round 3 exhibits have artifact-card entries
- [x] Artifact-card hook added to all exhibit pages
- [x] Card styling matches museum aesthetic; mobile-responsive; accessible
- [x] test-comprehensive.js validates card completeness
- [x] test-demo-pages.js verifies card renders on every exhibit page
```

---

## Phase 16 — Research / Catalog Mode (audit-gated)

### 16a. Audit first

Before building anything, read (during Phase 0.5 or at Phase 16 start):
- `comparison.html` (shipped — sortable/filterable 63-cipher table)
- `search.html` (shipped — client-side site search)
- `cipher-flow.html` (shipped — visual family relationships)

**Decision gate:** If these three pages already provide what a "Research /
Catalog Mode" would add (filter by hall / family / era / difficulty /
attack / demo-availability / solved-status; search by term; browse by
family relationships), THEN the cleanest action is to UPGRADE the shipped
pages rather than build a fourth. Record the decision in
`docs/round3-shipped-audit.md`.

Possible outcomes:

1. **FULLY COVERED** — comparison.html + search.html + cipher-flow.html
   together already provide everything a research-mode catalog would offer.
   Action: update `worldupdates.md` with one-line "Phase 16 skipped — see
   audit," then proceed to Phase 17.

2. **PARTIALLY COVERED** — the shipped pages cover most but not all of the
   filter dimensions proposed in this phase. Action: UPGRADE
   `comparison.html` to add the missing filters (Medium column for Hall
   XIII cultural exhibits, difficulty rating, solved/unsolved status,
   modern-relevance tag). Do NOT build a parallel page.

3. **NOT COVERED** — the shipped pages are weaker than expected and a
   dedicated research catalog adds clear value. Action: build
   `catalog.html` following the spec below.

Most likely outcome is #2. Build the UPGRADE list into `worldupdates.md`
under Phase 16 and execute.

### 16b. Catalog spec (if #3 chosen only)

**Only if Phase 16a concludes the shipped pages are insufficient:**

Create `catalog.html` with:

- Search box (text input, filters cipher names and historical terms)
- Multi-select filters:
  - By hall (I through XIII)
  - By family (monoalphabetic / polyalphabetic / transposition /
    fractionation / mechanical / hash / public-key / stream / protocol)
  - By era (BCE ancient / classical / Renaissance / Early Modern /
    industrial age / WWI / interwar / WWII / Cold War / modern / post-quantum)
  - By difficulty (easy to crack / moderate / difficult / currently
    unbroken)
  - By attack type (brute force / frequency analysis / Kasiski / known-
    plaintext / distributed computing / side-channel / unbroken)
  - By demo availability (Track A / Track B / none)
  - By solved status (solved / partially solved / unsolved)
- Sort: by era, by name, by difficulty, by hall
- Result card: cipher name, era, family, one-line description, known
  weakness, modern lesson, link to exhibit, demo-available badge

Data source: same `data/artifact-cards.json` built in Phase 15 — reuse,
don't duplicate. Add supplementary fields only as needed.

### 16c. Cross-links

Add to `learn.html`, `museum-map.html`, and the global nav: link to the
catalog page (or upgraded comparison.html) as "Research Mode" or
"Catalog."

**Commit:** `phase 16 [round 3]: research/catalog mode (upgrade or build per audit)`

### 16d. Worldupdates checklist entry

```
## Phase 16 — Research / Catalog Mode
- [x] Audit of comparison.html, search.html, cipher-flow.html completed
- [x] Decision recorded in round3-shipped-audit.md (skip / upgrade / build)
- [x] If UPGRADE: new filter dimensions added to comparison.html
- [x] If BUILD: catalog.html created with spec above
- [x] Global nav updated with link
- [x] Mobile-responsive; accessible; no backend
```

---

## Phase 17 — Cipher Detective (identify-this-cipher page)

### Purpose

A visitor pastes ciphertext; the page analyses it and **teaches** the
visitor why a particular cipher family is likely. This is explicitly
educational — the goal is not to brag about identification accuracy, it's
to walk the visitor through the evidence the way a real cryptanalyst
would.

This is genuinely new functionality. The shipped `cryptanalysis.html` has
the 10 techniques as interactive demonstrations; Cipher Detective COMBINES
those techniques into a single analyze-and-explain pipeline.

### 17a. Create the page

New file: `cipher-detective.html` (or `identify-cipher.html` — follow the
naming pattern of existing tool pages).

Structure:
- Hero: "Paste ciphertext below. The Detective will analyse the evidence
  and explain what it suggests — with honest uncertainty."
- Input area: large `<textarea>` for ciphertext.
- "Normalize" checkboxes: strip whitespace / lowercase / strip non-
  alphabetic / preserve layout.
- "Analyse" button (primary).
- Results area (populated after Analyse).

### 17b. Analyses to run

All implemented in browser JavaScript, no backend. Most of these are
already implemented in the shipped cryptanalysis.html demos and the
Codebreaker's Workbench — REUSE those implementations rather than
reimplementing. Import from the same engine modules.

Required analyses:

1. **Character inventory** — count and display the alphabet used, total
   character count, letter-frequency histogram, bigram and trigram counts.
2. **Index of Coincidence** — computed value compared to English (~0.067),
   random (~0.038), and polyalphabetic typical ranges. Show the
   interpretation: "IoC near 0.067 suggests monoalphabetic substitution or
   plaintext; IoC near 0.038 suggests polyalphabetic or randomized."
3. **Kasiski repeated-sequence detection** — find all repeated trigrams
   and quadrigrams, compute spacings, estimate probable key length if
   polyalphabetic.
4. **Chi-square test against English** — flag if distribution matches
   English closely (suggests transposition or light substitution) or
   deviates widely (suggests polyalphabetic or complex substitution).
5. **Character-set analysis** — only A–Z? only digits? Only 5 symbols
   (suggests ADFGVX or similar)? Letters and numbers mixed? Non-Latin?
6. **Word-shape analysis** (if spaces preserved) — short words, single-
   letter words, common word patterns matching English / French / German.
7. **Period-length search** — for repeating-key suspect, try period
   lengths 2–30 and score each against chi-square after splitting.

### 17c. Family scoring

Based on the analyses, score each cipher family against the ciphertext:

- Caesar / ROT (high if IoC ~0.067 AND character set ~26 letters AND chi-
  square very close to one of 25 shift rotations)
- Simple substitution (high if IoC ~0.067 AND chi-square deviates widely
  from English)
- Vigenère / polyalphabetic (high if IoC between 0.040–0.052 AND Kasiski
  finds repeats with a common factor)
- Transposition (high if IoC ~0.067 AND chi-square matches English almost
  exactly AND frequency profile is English-like)
- ADFGX / ADFGVX / Polybius (high if character set is restricted to 5 or 6
  symbols)
- Beaufort / Porta / polyalphabetic family (high if IoC intermediate AND
  period detected)
- Homophonic (high if character set larger than 26, digit-or-numeric-pair
  heavy)
- Playfair / digraph (high if character set has no J or has even total
  count, digram frequency flatter than monograph)
- Modern symmetric / random / OTP (high if IoC ~0.038 AND no period
  detected AND no repeats)
- Unsolved / unknown-system (fallback — show honestly when evidence is
  weak)

### 17d. Evidence presentation

Display top 3–5 cipher family candidates as **Evidence-based reasoning
panels**:

```
### Likely — Vigenère cipher (confidence: moderate-strong)

Evidence:
- Index of Coincidence: 0.043 (typical polyalphabetic range)
- Kasiski examination: repeated trigram "THQ" at positions 12 and 41
  (spacing 29), and trigram "XYR" at positions 7 and 36 (spacing 29).
  Common factor: 29 (prime). Candidate key length: 29 — unusual but
  possible — or the spacing is coincidental and the real key length is
  much shorter.
- Chi-square test against English: 487 (very high — suggests distribution
  does not match English plaintext frequencies, as expected with
  polyalphabetic substitution).

Confidence: moderate-strong. The low IoC and repeated-trigram evidence
both point to a polyalphabetic. If you believe the Kasiski evidence,
proceed with key-length search and Friedman test.

Recommended next steps:
- Open the Vigenère exhibit to see how it works.
- Use the Codebreaker's Workbench to run key-length search.
- Read the Kasiski Examination technique on cryptanalysis.html.
```

Do NOT display a single "answer." Show 3–5 candidates ranked by
confidence. Use explicit confidence language:
- **Very likely** (strong evidence on multiple dimensions)
- **Likely** (strong evidence on one dimension)
- **Possible** (some evidence, other explanations plausible)
- **Unlikely** (evidence weakly supportive)
- **Inconclusive** (too little ciphertext, or evidence contradicts itself)

### 17e. Honest limitations

Include a fixed "Detective's Limitations" section below the results:

```
### What the Detective can't tell you

- If the ciphertext is too short (under ~60 characters), statistical
  analysis is unreliable.
- If the original plaintext isn't English, all the English-based
  frequency analysis misses.
- If the cipher is modern (AES, ChaCha20, etc.), the ciphertext will look
  indistinguishable from random; the Detective will report that honestly.
- If multiple ciphers are layered (VIC, Purple, Enigma with additional
  steganography), identification is probabilistic at best.
- The Detective doesn't actually decrypt. For that, use the Codebreaker's
  Workbench with a candidate family and key.
```

### 17f. Cross-links

Every evidence panel links to:
- The relevant exhibit page(s) in the museum
- The relevant technique page on cryptanalysis.html
- The Workbench (lab/workbench.html) with the candidate family pre-
  selected if possible (via URL query parameter)

### 17g. Tests

Add to `test-comprehensive.js`:
- Given ciphertext known to be Caesar, Detective returns Caesar/ROT in top
  2 candidates.
- Given ciphertext known to be Vigenère (with ≥120 chars), Detective
  returns Vigenère/polyalphabetic in top 2 candidates.
- Given ciphertext known to be columnar transposition (with English
  frequency), Detective returns Transposition in top 2 candidates.
- Given random ciphertext (modern symmetric proxy — actual AES output),
  Detective returns "modern / random" in top 2 candidates.
- Given ciphertext <30 characters, Detective returns "Inconclusive —
  insufficient data."

Add to `test-demo-pages.js`: JSDOM check that the page loads, accepts
pasted input, and produces a results area with at least one evidence
panel.

### 17h. Add to navigation

- Add to global nav across all pages (or to the "Lab" submenu if one
  exists).
- Link from `learn.html` as an interactive capstone.
- Link from `cryptanalysis.html` as the practical integration of the 10
  techniques.
- Link from the Workbench as "Don't know what cipher you're looking at?
  Try the Detective."
- Link from every Hall XII Unsolved exhibit — the Detective is exactly
  the tool for exploring why these ciphers remain unsolved.

### 17i. Content safety

The Detective should **not** claim certainty. Always use hedged language.
This aligns with the museum's educational identity: teach evidence-based
reasoning, not magical answers.

**Commit:** `phase 17 [round 3]: cipher detective page with evidence-based identification`

### 17j. Worldupdates checklist entry

```
## Phase 17 — Cipher Detective
- [x] cipher-detective.html created
- [x] Analyses implemented: char inventory, IoC, Kasiski, chi-square, char-set, word-shape, period-length
- [x] Family scoring implemented
- [x] Evidence panels display 3–5 candidates with confidence language
- [x] Limitations section included
- [x] Cross-links to exhibits, cryptanalysis.html, workbench
- [x] Added to global nav and cryptanalysis/workbench pages (also learn.html if the page exists per Phase 0.5 audit)
- [x] test-comprehensive.js validates identification on known samples
- [x] test-demo-pages.js verifies page renders and accepts input
```

---

## Phase 18 — Deploy and verify

Full test pass, local server spot-check, then deploy.

Verify locally before push — **run all 6 test suites** per the test
architecture described in Phase 13h:
- `npm run test:engines` (test-all-engines.js) — all new engines pass
- `npm run test:deep` (test-deep-ciphers.js) — edge cases pass
- `npm run test:comprehensive` (test-comprehensive.js) — cross-cipher
  invariants pass
- `npm run test:a11y` (test-accessibility.js) — new pages WCAG-compliant
- `npm run test:mobile` (test-mobile.js) — new pages responsive
- `npm run test:demos` (test-demo-pages.js) — **critical** — every new
  Track A page passes the JSDOM click-through roundtrip

Additional manual checks:
- Every new Track A engine appears in the Workbench dropdown and executes
  there without error.
- Every new Track A exhibit's demo container, after `demo-loader.js` runs,
  shows an encrypt/decrypt UI that accepts input and produces output.
- Every new Track A exhibit's "Break This Cipher" puzzle reveals the
  expected plaintext when clicked.
- Every new Track B exhibit's primary visualization renders on first load
  with no console errors.
- The Workbench header's "N cipher engines" count matches the actual
  number of engines registered in `js/ciphers/all-engines.js`.
- `docs/round3-shipped-audit.md` exists and every [SKIP] / [UPGRADE] item
  in `docs/worldupdates.md` is either resolved or explicitly deferred.

Verify live after push:
- `https://ciphermuseum.com/` — new counts (halls=13, ciphers=~113,
  years=~3,900), refreshed Featured Ciphers list.
- `https://ciphermuseum.com/museum-map.html` — new Complete Cipher Index,
  Hall XII and Hall XIII present in floor plan.
- `https://ciphermuseum.com/search.html` — index rebuilt, new exhibits
  searchable.
- `https://ciphermuseum.com/halls/unsolved.html` — Hall XII renders with
  all moves (Voynich/Kryptos/Beale/Dorabella) and new exhibits.
- `https://ciphermuseum.com/halls/culture.html` — Hall XIII renders.
- `https://ciphermuseum.com/halls/modern-crypto.html` — Hall XI still renders
  with DES/DH/RSA/AES/SHA-256 PLUS new Kerckhoffs and SIGSALY exhibits.
- `https://ciphermuseum.com/halls/ancient.html` — renamed to "World Origins",
  6 new exhibits present.
- `https://ciphermuseum.com/halls/unbreakable.html` — Hall IX still renders
  with OTP/Vernam/Solitaire PLUS new VENONA exhibit.
- `https://ciphermuseum.com/halls/machines.html` — Hall VII renders with
  Jefferson Disk + new Bazeries Cylinder + new M-94/M-138-A + new Fialka /
  KL-7 / SIGABA / Typex / Geheimschreiber / Kryha.
- `https://ciphermuseum.com/halls/military.html` — Hall V renders with new
  Commercial Telegraph Codebooks + Diana Cryptosystem + Slidex + Chinese
  Telegraph Code + Zimmermann + Morse Code, PLUS the comparative "WWI and
  WWII Tactical Field Cipher Systems" table and "Modern Tactical
  Authentication" appendix.
- `https://ciphermuseum.com/ciphers/venona.html` — VENONA renders with
  SIGTOT/5-UCO and Cambridge Five side panels; Track-decision recorded
  in worldupdates.md.
- `https://ciphermuseum.com/ciphers/sigsaly.html` — SIGSALY renders with
  three-part Track B visualization.
- `https://ciphermuseum.com/ciphers/m209.html` — Hagelin Family + Operation
  Rubicon sidebar present on shipped exhibit.
- `https://ciphermuseum.com/ciphers/playfair.html` — Wheatstone attribution
  sidebar present.
- `https://ciphermuseum.com/ciphers/jefferson-disk.html` — Wheel Cipher
  Lineage sidebar present with links to new Bazeries Cylinder and M-94/M-138-A.
- `https://ciphermuseum.com/further-reading.html` — new Further Reading
  page loads with four-canon references (Kahn, Singh, Frary, Cryptiana)
  and all external links functional.
- `https://ciphermuseum.com/cipher-detective.html` — Cipher Detective
  accepts pasted ciphertext and returns 3–5 evidence-based candidates.
- Artifact Cards render on 5 random exhibit pages (Phase 15).
- 5 random new Track A exhibit pages: `demo-loader.js` builds the demo,
  buttons work, output updates.
- 5 random new Track B exhibit pages: visualizations render.
- 5 random new biography cards render correctly (including George Lasry
  and Elonka Dunin).
- Timeline shows new era markers AND the six-stage evolution strip still
  present above the historical timeline.
- Workbench shows updated engine count (~98) and all new engines in the dropdown.
- cipher-flow.html shows new family relationships including Jefferson-wheel
  lineage and checkerboard family.

**Commit:** `phase 18 [round 3]: deployed and verified, v3.0.0 live`

---

## FINAL SUMMARY (print at end)

```
✓ Round 3 complete: Global Expansion
✓ Baseline: 63 exhibits / 11 halls / 21 bios / 62 demos / 55 engines / 2,298 test assertions
✓ New exhibits: ~45 ciphers + 2 generic techniques + 3 context exhibits
  + 1 new foundation exhibit (Kerckhoffs) + ~9 new bios (including George Lasry
  and Elonka Dunin), PLUS 6 additions from extended cipher-lineage audit:
  VENONA (Hall IX) + SIGSALY (Hall XI) + Bazeries Cylinder (Hall VII) +
  M-94/M-138-A (Hall VII) + Commercial Telegraph Codebooks (Hall V) + Diana
  Cryptosystem (Hall V)
  (DH, RSA, AES already shipped in Hall XI — upgraded in place per audit)
✓ Hall I renamed: Birth → World Origins (6 new exhibits incl. Rosetta Stone,
    Histiaeus's Tattooed Messenger)
✓ Hall XI stays Modern Cryptography (DES, DH, RSA, AES, SHA-256) with
    Kerckhoffs's Principle added as 6th foundation exhibit
✓ Hall XII created: Unsolved Ciphers (moves: Voynich, Kryptos, Beale, Dorabella;
    new: Shugborough, D'Agapeyeff, Somerton Man, McCormick, Phaistos Disc)
✓ Kryptos 2025 expansion pack: K4 auction saga ($962,500 hammer, 50-year
    Smithsonian seal), K5 existence confirmed by Sanborn, full two-part
    installation documented (entrance + courtyard), K0 Morse panel,
    Scheidt partnership, Bauer/Link/Molle Hill conjecture, Sanborn's
    Cyrillic Projector and Antipodes cross-referenced, popular-culture
    links forward to Hall XIII
✓ Hall II expanded: Mary Stuart Castelnau Letters (2022 Lasry/Biermann/
    Tomokiyo break of 57 previously-lost letters) + Patterson's Cipher
    for Jefferson (1801 → 2007 Smithline hill-climb break of a 200-year
    challenge) added as new Hall II Track B exhibits showcasing 21st-
    century historical cryptanalysis.
✓ Scytale exhibit upgraded: scholarly-debate sidebar on the transposition-
    vs-authentication-device reading (Tomokiyo, *Cryptiana*).
✓ Hall VII expanded: Bazeries Cylinder (1891 France) and M-94/M-138-A
    (US Army 1922–1943) added as new Track A exhibits, completing the
    Jefferson-wheel cipher lineage from 1790s prototype through WWII
    tactical use. Plus Hagelin Machine Family sidebar on M-209 (shipped)
    covering C-36/C-38/BC-38 and the Operation Rubicon disclosure.
✓ Hall V expanded: Commercial Telegraph Codebooks (Bentley's, ABC, Lieber's
    — shows civilian commercial cryptography 1860s–1930s) and Diana
    Cryptosystem (US Special Forces hand OTP 1960s–) added as new Track A
    exhibits. Slidex gets BATCO sidebar for British tactical code lineage.
✓ Hall IX expanded: VENONA added as the OTP-failure case study next to
    shipped OTP/Vernam. Includes SIGTOT/5-UCO and Cambridge Five side
    panels. Track A or Track B per Opus audit of shipped OTP engine.
✓ Hall XI expanded: SIGSALY (1943) added as Track B visualization of
    the first secure-voice system — bridges wartime cryptography to
    modern secure communications (Turing consulted, Roosevelt-Churchill
    transatlantic calls, ~50-ton Bell Labs terminal).
✓ Geheimschreiber exhibit gets "Fish Family — German Teleprinter Ciphers
    of WWII" side panel (Tunny/Sturgeon/Thrasher/Mackerel).
✓ Hall XIII created: Ciphers in Culture (moves: Gold-Bug, Dancing Men;
    new: Da Vinci Code, National Treasure, Gravity Falls, Cicada 3301,
    Popular Culture Survey)
✓ Hall X expanded: 21 → ~30 biographies (~9 genuinely new after audit,
    including George Lasry as the central figure of contemporary
    historical cryptanalysis: Copiale 2011, Zodiac 340 2020, Mary Stuart
    Castelnau 2022, SIGABA 2021, Double Transposition 2013, plus many
    HistoCrypt papers)
✓ Hall XII hero copy frames the hall as a living research area, naming
    the contemporary historical-cipher-breaking community (Lasry,
    Biermann, Tomokiyo, Pelling, Megyesi, Dunin)
✓ Shipped-exhibit sidebar enrichments (Phase 13o): Wheatstone-Playfair
    attribution (Playfair), Two Nihilist Ciphers (Nihilist), Transposition
    Variants Route/Myszkowski/Nihilist (Columnar Transposition), Checkerboard
    Family Polybius→Nihilist→Tap Code→VIC (Straddling Checkerboard),
    Jefferson-Wheel Lineage (Jefferson Disk), WWI/WWII Tactical Field
    Ciphers comparative table (Hall V), Modern Tactical Authentication
    appendix including DRYAD (Hall V).
✓ Bibliographic enrichment: Cryptiana cross-references added on
    Babington Plot, Great Cipher, Arnold-André, Jefferson Disk, Beale,
    Culper Ring, Wallis Ciphers exhibits
✓ New Further Reading page (further-reading.html) created as the museum's
    single scholarly home: four-canon reference block (Kahn, Singh, Frary,
    Cryptiana), contemporary research communities (Cryptologia, HistoCrypt,
    DECODE), individual scholar links (Dunin, Lasry, Pelling, Megyesi,
    Gillogly), primary-source archive links (BnF, National Archives, LoC,
    CIA FOIA, NSA CCH), and an exhibit-to-source index. Linked from
    global nav, museum-map, glossary, and README.
✓ Total exhibits: 63 → ~113
✓ Total halls: 11 → 13
✓ Earliest exhibit: Atbash ~600 BCE → Egyptian ~1900 BCE, Phaistos ~1700 BCE
✓ Years of history: 2,500 → ~3,900
✓ Shipped exhibits upgraded in place per Phase 0.5 audit:
    - Nomenclator, Book Cipher, Autokey (cross-link upgrades)
    - SIGABA, Typex (verify-and-polish)
    - DES, Diffie-Hellman, RSA, AES, SHA-256 (cross-link + interactive polish)
    - Scytale (scholarly-debate sidebar added)
    - Playfair (Wheatstone attribution sidebar)
    - Nihilist (two-ciphers distinction sidebar)
    - Columnar Transposition (variants sidebar)
    - Straddling Checkerboard (checkerboard family sidebar)
    - Jefferson Disk (wheel cipher lineage sidebar)
    - M-209 (Hagelin family + Operation Rubicon sidebar)
    - Dorabella (moved Hall VIII → Hall XII Unsolved)
✓ Interactive demos:
    - Track A (encrypt/decrypt engines, demo-loader pattern): ~43 new engines registered
    - Track B (visualizations): ~20 new visualizations rendering
    - Track-deferred (VENONA): decided at build time per OTP engine audit
    - Workbench total engines: 55 → ~98
    - All new exhibits pass test-demo-pages.js JSDOM click-through
✓ Test assertions: 2,298 → ~3,200 (new roundtrip + KAT + edge + demo-page tests)
✓ Geographic representation:
    - India: Kama Sutra
    - Islamic world: Arabic Nomenclators
    - East Asia: Chinese Telegraph Code, Joseon Yeokhak Korean ciphers
    - Africa: Egyptian Substitution, Rosetta Stone, Ethiopian Ge'ez,
      African-American field hollers
    - Latin America: Che Guevara's VIC variant, Latin American telegraphic
      codebooks
    - Southeast Asia: Vietnamese underground codes
    - Pacific theater: JN-25, Red, Code Talkers expansion
    - Cold War machines: Fialka, KL-7, T52
    - European underground: IRA book cipher, RAF OTP
    - Minoan Crete: Phaistos Disc (pre-alphabetic undeciphered)
    - Women codebreakers: baseline already includes Clarke, Friedman,
      Driscoll, Marks per README; +Mavis Batey after audit
✓ Cultural representation (Hall XIII):
    - Fiction: Gold-Bug (Poe), Dancing Men (Doyle), Da Vinci Code (Brown),
      National Treasure (Turteltaub)
    - TV/Games: Gravity Falls (Hirsch), Popular Culture Survey
    - Internet phenomena: Cicada 3301
✓ Modern cryptography foundations (Hall XI, now 6 exhibits):
    - DES (shipped)
    - Diffie-Hellman Key Exchange (shipped, upgraded)
    - RSA (shipped, upgraded)
    - AES / Rijndael (shipped, upgraded)
    - SHA-256 (shipped)
    - Kerckhoffs's Principle (1883) — NEW Round 3
✓ Signal encoding foundations (Hall V):
    - Morse Code (1837) — NEW Round 3
✓ Decipherment aids (Hall I):
    - Rosetta Stone (196 BCE carved, 1822 deciphered) — NEW Round 3
✓ Integration complete:
    - museum-map.html: 13 halls, ~113 exhibits in Complete Cipher Index
    - timeline.html: ~113 year markers + six-stage evolution strip preserved
    - search.html: client-side search index rebuilt
    - cipher-flow.html: family relationships extended
    - comparison.html: ~113 rows sortable/filterable
    - README.md: hall table regenerated, demo roster expanded
✓ Coverage of famous-ciphers lists:
    - AllAssignmentHelp.com "10 Most Famous": all 10 ✓
    - SPYSCAPE "15 Toughest Ciphers": 13 of 15 ✓ (LCS35 inline on RSA;
      Yuan Dynasty coins deferred — too obscure, thin sourcing)
    - History.com "8 Ciphers That Shaped History" (Frary):
        · Histiaeus's head-tattoo steganography ✓ (Hall I exhibit)
        · Morse Code + cipher combination ✓ (Morse + side panel)
        · Voyager Golden Record ✓ (side panel on Morse)
        · Enigma + Operation Boniface ✓ (side panel on Enigma)
        · Navajo Code Talkers + Japanese quote ✓ (Code Talkers enhancement)
✓ Reference canon: Kahn + Singh + Frary + Tomokiyo's Cryptiana cited
    where each is authoritative (Cryptiana newly formalized as 4th
    canonical reference for Renaissance through 19th-century ciphers)
✓ Museum-experience improvements (Phases 15–17):
    - Artifact Cards: consistent metadata header on every exhibit page
      (era, family, region, used by, key type, key idea, security
      failure, modern lesson). Data-driven from artifact-cards.json.
    - Research / Catalog Mode: audit-gated — comparison.html upgraded
      OR new catalog.html built based on Phase 0.5 findings.
    - Cipher Detective: new interactive page that analyses pasted
      ciphertext and teaches evidence-based identification (IoC,
      Kasiski, chi-square, char-set analysis) with honest confidence
      language. Cross-links to exhibits, techniques, and workbench.
    - Identity statement standardized across site: "an open-source,
      interactive cryptography-history museum: part digital exhibit,
      part cipher playground, and part codebreaking classroom."
✓ Live: ciphermuseum.com v3.0.0 "Global Expansion"
```

---

## Backlog (explicit "do NOT build in this round")

Items considered and deferred, with objective reasons:

1. **Quilt-code theory of Underground Railroad signaling** — specifically the
   Tobin & Dobard *Hidden in Plain View* thesis. Rejected by most Underground
   Railroad historians as presentist folklore without primary-source support.
   Handled in the field-hollers exhibit as a sidebar discussing the dispute;
   not built as a standalone exhibit because the scholarly consensus treats
   the specific quilt claim as unsupported. Revisit if new primary sources
   surface.

2. **Thai royal cipher traditions** — documented in Thai-language scholarship
   but sources remain thin in English and sourcing quality varies. Defer
   pending access to Thai-language primary sources or English-language
   academic synthesis that meets the museum's sourcing bar.

3. **Individual Arabic-script court ciphers beyond the Arabic Nomenclators
   exhibit** — Ottoman Divan ciphers, Mamluk field ciphers, Safavid Persian
   court systems. Each has documentation but the existing Arabic Nomenclators
   exhibit already covers the tradition at the right level for one round.
   Build specific exhibits in Round 4 as time permits.

4. **"The Da Vinci Code" cultural phenomenon** — cryptographically trivial
   (mirror writing, anagrams, atbash — all already in the museum). Include a
   one-sentence mention in the Dancing Men or Gold-Bug "cultural follow-on"
   footer. Not worth a standalone exhibit on cryptographic merit.

5. **Pre-1970s African National Congress underground ciphers** — documented
   in South African truth commission archives but thinly covered in public
   cryptologic literature. Defer pending source review; revisit with a
   specialist-cited build when appropriate sources are confirmed.

6. **Specific ETA (Basque) and Red Brigades (Italian) variants** — the
   RAF exhibit covers the European-underground-OTP pattern that ETA and
   Red Brigades shared; individual exhibits would be repetitive. Revisit
   if there's a distinctive cryptographic feature that separates them.

7. **Soviet NKVD internal codes beyond VENONA** — multiple separate systems
   documented in post-Soviet archival releases. Could fill out a Cold War
   sub-wing in Round 4.

These items were reviewed on cryptographic and sourcing grounds, not on
whether the users of the ciphers were comfortable topics. The museum's
position: ciphers belong in the history of ciphers regardless of who used
them. Items deferred above are deferred for sourcing quality or scope
management, not for political squeamishness.

---

*"Whether you eat or drink, or whatever you do, do all to the glory of God."*
*— 1 Corinthians 10:31*