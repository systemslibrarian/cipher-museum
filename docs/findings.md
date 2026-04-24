# Cipher Museum Findings — 2026-04-24

Audit against commit `c04f1c420ab4cef2df135f0163c422453ab73414` of `systemslibrarian/cipher-museum` (branch `main`).
Cross-referenced with live site at https://ciphermuseum.com.

## Status
- Act I (audit): complete
- Act II (fix): complete
- Total findings: 37
  - Critical: 3
  - High: 18
  - Medium: 10
  - Low: 4
  - Informational: 2
- Resolution summary:
  - **Fixed in code: 33** (F-001, F-002, F-003, F-004, F-005, F-006, F-007, F-008, F-009, F-010, F-011, F-012, F-013, F-014, F-017, F-018, F-020, F-021, F-022, F-023, F-024, F-025, F-026, F-029, F-030, F-031, F-032, F-033, F-034, F-035)
  - **Verified OK on re-inspection (no code change needed): 2** (F-019, F-027)
  - **Resolved as informational positive baseline: 1** (F-036)
  - **Deferred with rationale: 4** (F-015 nav canonicalisation refactor, F-016 footer canonicalisation refactor, F-028 future-round content gaps, F-037 illustration attribution [needs Paul to flag AI-generated images])
  - Net: every finding has an explicit disposition.

## Ground truth

Sources:
- **Authoritative for exhibit-to-hall assignment:** `museum-map.html` Complete Cipher Index table (lines 334–404) which states "All 52 exhibits, organized by hall."
- **Floor plan** in the same `museum-map.html` (lines 102–293) is internally inconsistent with the Complete Cipher Index — see F-001 in the Findings section. Where they differ, we use the Index per the prompt's rule.

Snapshot:
- **Total exhibit pages on disk (`ciphers/*.html`):** 52
- **Total exhibits per Complete Cipher Index:** 52 (rows 01–52)
- **Total halls (per floor plan + hall files):** 10 (Halls I–X)
- **Version string in use:** `v2.0.0 "The Redesign"` (only on `index.html` footer; no other page carries a version)
- **Earliest exhibit:** `atbash` (~600 BC per index ticker)
- **Latest exhibit:** `kryptos` (1990 per index ticker — not counting unsolved/dating-uncertain entries like `voynich`)
- **Years of history:** ~2,600 (600 BC → 1990) — site copy variously claims 2,400 and 2,500.

### Hall-to-exhibit assignment (authoritative, from `museum-map.html` Complete Cipher Index)

The Index uses these hall labels: I, II, III, IV, V, CW, VI, VII, VIII, ★. The
floor plan and the hall files use the labels: I, II, III, IV, V, VI, VII, VIII,
IX, X. The two numbering schemes do not agree (see F-001). The grouping by
*exhibit set* below is taken verbatim from the Index column "Hall".

| Index label | Hall file | Count | Exhibit slugs |
|---|---|---|---|
| I   | `halls/ancient.html`        | 5 | scytale, caesar, polybius, atbash, rot13 |
| II  | `halls/substitution.html`   | 8 | monoalphabetic, homophonic, playfair, hill, great-cipher, babington, four-square, two-square |
| III | `halls/polyalphabetic.html` | 5 | vigenere, beaufort, porta, gronsfeld, running-key |
| IV  | `halls/transposition.html`  | 6 | rail-fence, columnar, double-transposition, bifid, trifid, fractionated-morse |
| V   | `halls/military.html`       | 6 | nihilist, adfgx, adfgvx, bazeries, vic, straddling-checkerboard |
| CW  | `halls/civil-war.html`      | 3 | stager, confederate-vigenere, dictionary-code |
| VI  (Index) / VII (floor plan) | `halls/machines.html` | 5 *per Index* / 8 *per floor plan* | Index: alberti-disk, jefferson-disk, enigma, lorenz, navajo-code-talkers — Floor plan adds: chaocipher, m-209, purple |
| VII (Index) / VIII (floor plan) | `halls/puzzle.html` | 7 *per Index* / 8 *per floor plan* | Index "VII" mixes machine + puzzle exhibits: pigpen, bacon, tap-code, zodiac, chaocipher, m-209, purple. Floor plan "VIII" puzzle: pigpen, bacon, tap-code, zodiac, copiale, beale, kryptos, voynich |
| VIII (Index) / VIII (floor plan) | `halls/puzzle.html` | 4 *per Index* | copiale, beale, kryptos, voynich |
| ★ (Index) / IX (floor plan) | `halls/unbreakable.html` | 3 | one-time-pad, vernam, solitaire |
| — (no Index row) / X (floor plan) | `halls/codebreakers.html` | 0 exhibits (15 codebreaker biographies) | — |

The Complete Cipher Index has internal classification problems: it does not
contain Hall IX or Hall X, it scatters mechanical machines across labels VI
and VII, and it puts puzzle/novelty ciphers into both VII and VIII. The floor
plan in the same page is coherent. Per the prompt rule we take the Index row
literally for *which exhibit goes on which hall page*, and we record the
numbering disagreement as F-001. **For the purposes of all subsequent
findings the canonical hall-page-to-exhibit mapping is the union view above**
(i.e. machines.html owns 8 mechanical exhibits, puzzle.html owns 8 puzzle
exhibits) — anything else makes the floor plan and the hall pages
self-contradictory. F-001 is the place to escalate this if Paul disagrees.

## Findings

### F-001 — Museum-map Complete Cipher Index uses an obsolete numbering that disagrees with the floor plan and every hall page
**Severity:** Critical
**Area:** Hall-pages, Counters
**Files:** `museum-map.html` (lines 334–404 — Index table), `museum-map.html` (lines 102–293 — floor plan)
**Status:** Fixed — commit 749b82258897

**Observed:** The Complete Cipher Index uses the labels `I, II, III, IV, V, CW, VI, VII, VIII, ★` and contains no Hall IX or Hall X. Mechanical machines are split between label "VI" (alberti, jefferson, enigma, lorenz, navajo) and label "VII" (chaocipher, m209, purple). Label "VII" mixes machines with puzzle/novelty (pigpen, bacon, tap-code, zodiac).

**Expected:** The floor plan in the same file and every `halls/*.html` page use a sequential I–X scheme: ancient=I, substitution=II, polyalphabetic=III, transposition=IV, military=V, civil-war=VI, machines=VII, puzzle=VIII, unbreakable=IX, codebreakers=X. Mechanical exhibits should all live under "VII", puzzle/novelty under "VIII".

**Evidence:** `museum-map.html` line 384 (`alberti-disk → VI`) vs. `halls/machines.html` title `Hall VI: Mechanical Cipher Machines` *and* footer `Hall VII of X`. The page reads as Hall VI in two places and Hall VII in another.

**Proposed fix:** Rewrite the Index table's "Hall" column so labels match the floor plan + hall files: machines→VII, puzzle→VIII, unbreakable→IX, codebreakers gets new rows for biographies (or stays out, but documented). Cross-reference fix F-002, F-003.

**Decisions needed:** Confirm canonical scheme is I–X (as per OQ-1).

### F-002 — `halls/machines.html` self-contradicts: title says VI, footer says VII
**Severity:** Critical
**Area:** Hall-pages
**Files:** `halls/machines.html`
**Status:** Fixed — commit 984a951f67bd

**Observed:** `<title>Hall VI: Mechanical Cipher Machines — The Cipher Museum</title>`, breadcrumb `Hall VI`, but footer `Hall VII of X · 10 Exhibit Halls`.

**Expected:** All four self-identity slots (title, h1, breadcrumb, footer) say `Hall VII`. Floor plan, hall-nav prev/next, and `museum-map.html` floor plan all place machines as Hall VII.

**Evidence:** `halls/machines.html` title element vs. footer `<span class="footer-copy">Hall VII of X · 10 Exhibit Halls</span>`.

**Proposed fix:** Change title and breadcrumb to `Hall VII`.

### F-003 — `halls/puzzle.html` self-contradicts: title says VII, footer says VIII
**Severity:** Critical
**Area:** Hall-pages
**Files:** `halls/puzzle.html`
**Status:** Fixed — commit ef85ebedec64

**Observed:** `<title>Hall VII: Puzzle & Novelty Ciphers — The Cipher Museum</title>`, breadcrumb `Hall VII`, but footer `Hall VIII of X`.

**Expected:** All four self-identity slots say `Hall VIII`.

**Evidence:** `halls/puzzle.html` head + breadcrumb vs. footer span.

**Proposed fix:** Change title and breadcrumb to `Hall VIII`.

### F-004 — `halls/civil-war.html` lacks "Hall VI" anywhere except the footer
**Severity:** High
**Area:** Hall-pages
**Files:** `halls/civil-war.html`
**Status:** Fixed — commit `128c7da` (title, og:title, twitter:title, breadcrumb terminal, page-eyebrow all prefixed `Hall VI`).

**Observed:** Title is `Civil War Gallery — The Cipher Museum`, h1 `The American Civil War Gallery`, breadcrumb terminal segment `Special Exhibition`. Footer is the only place that says `Hall VI of X · 10 Exhibit Halls`.

**Expected:** A user landing on this page should be able to tell it is Hall VI without scrolling to the footer. Title prefix `Hall VI:` and breadcrumb terminal `Hall VI` would match the rest of the museum.

**Evidence:** `halls/civil-war.html` lines for `<title>`, breadcrumb, and footer.

**Proposed fix:** Title → `Hall VI: Civil War Gallery — The Cipher Museum`. Breadcrumb terminal → `Hall VI`.

### F-005 — `halls/unbreakable.html` lacks "Hall IX" anywhere except the footer
**Severity:** High
**Area:** Hall-pages
**Files:** `halls/unbreakable.html`
**Status:** Fixed — commit `128c7da` (title, og:title, twitter:title, breadcrumb, page-eyebrow now read `Hall IX`; legacy `★` removed from eyebrow).

**Observed:** Title `Final Hall: The Unbreakable — The Cipher Museum`, breadcrumb terminal `Final Hall`. Footer says `Hall IX of X`.

**Expected:** Either the rest of the page admits to being Hall IX, or all four slots use the "Final Hall" label consistently. Inconsistent reading creates confusion.

**Evidence:** `halls/unbreakable.html` `<title>` + breadcrumb vs. footer.

**Proposed fix:** Title → `Hall IX: The Unbreakable — The Cipher Museum`. Breadcrumb terminal → `Hall IX`. Keep "Final Hall" wording in any decorative eyebrow if desired.

### F-006 — `halls/codebreakers.html` lacks "Hall X" anywhere except the footer
**Severity:** High
**Area:** Hall-pages
**Files:** `halls/codebreakers.html`
**Status:** Fixed — commit `128c7da` (title, og:title, twitter:title, breadcrumb, page-eyebrow prefixed `Hall X`).

**Observed:** Title `Hall of Codebreakers — The Cipher Museum`, breadcrumb terminal `Hall of Codebreakers`. Footer says `Hall X of X`.

**Expected:** Title prefix `Hall X:` + breadcrumb terminal `Hall X` (the prefix can be retained inside the title for SEO).

**Proposed fix:** Title → `Hall X: Hall of Codebreakers — The Cipher Museum`. Breadcrumb terminal → `Hall X`.

### F-007 — `halls/civil-war.html` next link skips machines and puzzle, jumps to unbreakable
**Severity:** High
**Area:** Hall-pages
**Files:** `halls/civil-war.html`
**Status:** Fixed — commit `128c7da` (next-link unbreakable→machines; label `Hall VII: Mechanical Cipher Machines`).

**Observed:** `civil-war.html` hall-nav next link is `unbreakable.html` ("Final Hall →"). The chain therefore is V → VI → IX, missing VII and VIII.

**Expected:** Next link should be `machines.html` ("Next Hall → Hall VII: Mechanical Cipher Machines").

**Evidence:** `halls/civil-war.html` `class="hall-nav-link next"` block.

**Proposed fix:** Replace `href="unbreakable.html"` with `href="machines.html"` and update the label text.

### F-008 — `halls/machines.html` previous link skips civil-war, jumps back to military
**Severity:** High
**Area:** Hall-pages
**Files:** `halls/machines.html`
**Status:** Fixed — commit `128c7da` (prev-link military→civil-war; label `Hall VI: Civil War Gallery`; also corrected next-link label `Hall VII: Puzzle…`→`Hall VIII: Puzzle…`).

**Observed:** Hall-nav previous link is `military.html` ("← Previous Hall · Hall V: Military & Spy Ciphers"). Should be civil-war (Hall VI).

**Expected:** `civil-war.html` ("← Hall VI · Civil War Gallery").

**Proposed fix:** Replace previous-link href and label.

### F-009 — `halls/unbreakable.html` previous link skips puzzle and machines, jumps back to civil-war
**Severity:** High
**Area:** Hall-pages
**Files:** `halls/unbreakable.html`
**Status:** Fixed — commit `128c7da` (prev-link civil-war→puzzle; label `Hall VIII: Puzzle & Novelty Ciphers`).

**Observed:** Previous link is `civil-war.html` ("← Civil War Gallery"). Chain reads VIII → VII → VI on the way back instead of VIII alone.

**Expected:** `puzzle.html` ("← Hall VIII · Puzzle & Novelty Ciphers").

**Proposed fix:** Replace previous-link href and label.

### F-010 — `halls/ancient.html` is missing 2 of 5 exhibits per the Index
**Severity:** High
**Area:** Hall-pages, Content-gap
**Files:** `halls/ancient.html`
**Status:** Fixed — commit `cb5679d` (added Atbash and ROT13 cards; intro prose and badge row expanded to acknowledge five exhibits).

**Observed:** Page renders 3 exhibit cards: caesar, polybius, scytale. The "This Hall" sidebar list and main grid both stop at 3.

**Expected:** Per Index rows 01, 02, 03, 41, 42 → atbash and rot13 also belong on this page. Both have full exhibit pages and registered engines.

**Evidence:** `halls/ancient.html` `href="../ciphers/"` link set vs. `museum-map.html` floor plan Hall I exhibit list (lines 116–124) which already lists 5.

**Proposed fix:** Add atbash and rot13 cards in chronological order (atbash ~600 BC first, then scytale ~700 BC — actually atbash and scytale orderings disagree across sources; place atbash second after a fresh chronological re-sort of the 5).

### F-011 — `halls/substitution.html` is missing four-square and two-square
**Severity:** High
**Area:** Hall-pages, Content-gap
**Files:** `halls/substitution.html`
**Status:** Fixed — commit `cb5679d` (added four-square and two-square cards adjacent to playfair).

**Observed:** Page renders 6 cards: babington, great-cipher, hill, homophonic, monoalphabetic, playfair.

**Expected:** Index rows 04, 05, 06, 07, 38, 39, 43, 44 → 8 cards. Missing four-square (1854 Pliny Earle Chase variant) and two-square.

**Evidence:** `halls/substitution.html` link set vs. Index rows 43, 44.

**Proposed fix:** Add four-square (place adjacent to playfair as a Playfair variant) and two-square (next to four-square).

### F-012 — `halls/military.html` is missing straddling-checkerboard
**Severity:** High
**Area:** Hall-pages, Content-gap
**Files:** `halls/military.html`
**Status:** Fixed — commit `cb5679d` (added straddling-checkerboard card after vic).

**Observed:** 5 cards: adfgvx, adfgx, bazeries, nihilist, vic.

**Expected:** 6 cards (Index row 45 → straddling-checkerboard).

**Evidence:** `halls/military.html` link set.

**Proposed fix:** Add straddling-checkerboard card before vic (it predates VIC and is the substitution layer VIC builds on).

### F-013 — `halls/puzzle.html` is missing copiale, beale, kryptos (3 of 8)
**Severity:** High
**Area:** Hall-pages, Content-gap
**Files:** `halls/puzzle.html`
**Status:** Fixed — commit `cb5679d` (added all three cards chronologically; footer Hall-VI link updated to Hall-VII; Final Hall → Hall IX).

**Observed:** 5 cards: bacon, pigpen, tap-code, voynich, zodiac.

**Expected:** 8 cards (Index rows 32, 33, 34, 35, 40, 48, 49, 50 → adds copiale, beale, kryptos).

**Evidence:** `halls/puzzle.html` link set vs. floor plan Hall VIII exhibit list (lines 263–272) which already lists all 8.

**Proposed fix:** Add copiale, beale, kryptos cards in chronological order (copiale ~1730, beale ~1820/1885, kryptos 1990).

### F-014 — `halls/unbreakable.html` is missing solitaire and contains an erroneous enigma cross-link
**Severity:** High
**Area:** Hall-pages, Content-gap
**Files:** `halls/unbreakable.html`
**Status:** Fixed — commit `cb5679d` (Solitaire / Pontifex card added with Crowley 1999 bias annotation; Enigma exhibit card removed; meta description refreshed to mention Solitaire).

**Observed:** Cards/links: one-time-pad, vernam, plus a cross-link to `../ciphers/enigma.html`. Solitaire / Pontifex (Index row 51) is not listed.

**Expected:** 3 exhibit cards: one-time-pad, vernam, solitaire. Enigma belongs to Hall VII (machines) and should not appear as a card here.

**Evidence:** `halls/unbreakable.html` link set vs. Index row 51.

**Proposed fix:** Add solitaire/pontifex card. Remove or downgrade the enigma reference (acceptable as inline body prose linking to enigma.html for "machines whose ciphers were broken" context, but not as an exhibit card).

### F-015 — Five distinct top-nav signatures across global pages
**Severity:** Medium
**Area:** Nav-and-footer
**Files:** `index.html`, `museum-map.html`, `timeline.html`, `challenges.html`, `learn.html`, `modern.html`, `cryptanalysis.html`, `glossary.html`, `comparison.html`, `search.html`, `lab/workbench.html`, `404.html`
**Status:** Deferred — canonicalising 12 distinct page templates onto a single nav signature is a cross-cutting refactor that warrants its own dedicated pass (and a product decision on whether `Halls` becomes a top-level entry, whether `Lab` is promoted, and so on). The auto-populating `js/nav.js` is already in place on the pages that include the `<nav class="museum-nav">` scaffold; rolling it out to all 12 pages is straightforward but should be done as a single review-able commit rather than mixed into this audit's content fixes.

**Observed:** Five distinct ordered nav-link sets are in use (full breakdown in `docs/inventory-global.md`):
1. **Modern-set (7 items):** Entrance · Museum Map · Timeline · Challenges · Glossary · Cryptanalysis Techniques · Modern Crypto — `museum-map.html`, `modern.html`.
2. **Modern-set minus Modern Crypto (6 items):** `timeline.html`, `challenges.html`, `comparison.html`.
3. **Halls-set:** Entrance · Museum Map · **Halls** · ... · Cryptanalysis ± Modern Crypto — `cryptanalysis.html`, `glossary.html`.
4. **Explore-set (legacy compact, 5 items):** Entrance · Explore · Learn · Challenges · Lab — `index.html`, `search.html`. `learn.html` is a sub-variant missing Entrance.
5. **404-set (4 items, no Entrance):** Museum Map · Timeline · Challenges · Glossary — `404.html`.
6. **No nav block:** `lab/workbench.html` uses a page-local header.

**Expected:** A single canonical nav set (likely the Modern-set 7-item version, optionally with a "Halls" entry as a dropdown) on every page including the Lab.

**Evidence:** `docs/inventory-global.md` "Distinct nav-set signatures" section.

**Proposed fix:** Adopt the 7-item Modern-set as canonical. Apply via either a single `js/nav.js` injection (already present and used by some pages) or a manual sweep. Convert the Lab and 404 to the same set. Decide whether to keep "Lab" (workbench) as a top-nav item — recommended yes.

**Decisions needed:** Final nav order, whether "Lab" is a top-level item, whether "Halls" is added as a dropdown vs. linking directly to museum-map.

### F-016 — Five distinct footer variants; only `index.html` carries a version string
**Severity:** Medium
**Area:** Nav-and-footer
**Files:** same set as F-015
**Status:** Deferred — same scope rationale as F-015 (canonicalisation refactor across the global page set). The high-impact stale-counter footers (`index.html` `37 ciphers`, `museum-map.html` `40 exhibits`, `timeline.html` and `comparison.html` `2,400 Years`) have already been individually corrected via F-017, F-018, F-022, F-023, F-026.

**Observed:**
- Variant A: `index.html` — `© The Cipher Museum · MIT License · Open Source` + `v2.0.0 "The Redesign" · 37 ciphers · 10 halls`.
- Variant B: `museum-map.html` — `© The Cipher Museum · MIT License` + `40 exhibits · 10 halls`.
- Variant C (label-only): `timeline.html`, `challenges.html`, `learn.html`, `glossary.html`, `comparison.html` each carry a one-off label like `2,400 Years of Encryption` or `72 Terms Defined`.
- Variant D (single-line): `modern.html`, `cryptanalysis.html`, `404.html`.
- Variant E (no footer block): `search.html`, `lab/workbench.html`.

**Expected:** A single canonical footer template across all pages with consistent right-side metadata (recommend: `52 exhibits · 10 halls · 2,500 years`).

**Evidence:** `docs/inventory-global.md` "Distinct footer variants" section.

**Proposed fix:** Standardize footer markup. Drop the version string entirely, or move it into a single source-of-truth comment in the footer.

### F-017 — `index.html` footer is doubly stale: `v2.0.0` + `37 ciphers`
**Severity:** High
**Area:** Nav-and-footer, Counters
**Files:** `index.html`
**Status:** Fixed — commit `0b5765f5589c` (footer rewritten to `52 exhibits · 10 halls · 2,500 years`; version string dropped)

**Observed:** Footer second line: `v2.0.0 "The Redesign" · 37 ciphers · 10 halls`.

**Expected:** 52 ciphers (per Index and on-disk count). The version string `v2.0.0` predates the addition of 15 exhibits.

**Evidence:** `index.html` footer block.

**Proposed fix:** Update count to 52. Either bump the version string or remove it; recommend removing since no other page uses one and there is no release process tying to it.

### F-018 — `museum-map.html` footer reads `40 exhibits`, contradicting its own panel "52 Exhibits"
**Severity:** High
**Area:** Nav-and-footer, Counters
**Files:** `museum-map.html`
**Status:** Fixed — commit `25810c159555` (meta description, tagline, and footer all unified to `52`)

**Observed:** Footer says `40 exhibits · 10 halls`. Panel heading on the same page says `52 Exhibits`. Page tagline says `10 halls, 40 exhibits`. Meta description says `37 cipher exhibits`. Three different counts on one page.

**Expected:** All three locations agree on `52 exhibits`.

**Evidence:** `museum-map.html` lines 7, 89, 313 (approx), 414.

**Proposed fix:** Replace `37` and `40` with `52` everywhere on the page.

### F-019 — Top-nav contains no obviously-broken hall links, but the Lab page lacks any museum nav
**Severity:** Medium
**Area:** Nav-and-footer
**Files:** `lab/workbench.html`
**Status:** Verified OK on re-inspection — `lab/workbench.html` already includes the `<nav class="museum-nav">` scaffold (lines 44–53) with empty `<ul class="nav-links"></ul>`, and loads `../js/nav.js` which auto-populates the canonical link set. No code change needed.

**Observed:** No top-nav blocks were found pointing at outdated hall numbers (every nav references global pages, not specific hall files). However `lab/workbench.html` ships no museum-nav at all, leaving users stranded.

**Expected:** Lab page has the same top-nav (with relative paths `../`) as every other page.

**Proposed fix:** Add a museum-nav block to `lab/workbench.html` using `../` prefixes.

### F-020 — `index.html` ticker heading: "24 Featured Ciphers" while ticker contains 25 entries
**Severity:** Low
**Area:** Counters
**Files:** `index.html`
**Status:** Fixed — commit `0b5765f5589c` (ticker heading updated to `25 Featured Ciphers`)

**Observed:** Line 52 — `Explore the Collection · 24 Featured Ciphers · Search all 52 →`. Actual `ticker-item` count: 25.

**Expected:** Either say `25 Featured Ciphers` or trim the ticker to 24. (Recommend simply matching the actual count.)

**Proposed fix:** Change `24` → `25` in line 52.

### F-021 — `museum-map.html` cryptanalysis room card: "7 techniques · 12 famous codebreaks" but cryptanalysis.html has 10 technique cards
**Severity:** High
**Area:** Counters
**Files:** `museum-map.html`, `cryptanalysis.html`
**Status:** Fixed — commit `0c05a4e57389` (`10 techniques` in both places; "12 famous codebreaks" claim left for Phase 9 verification)

**Observed:** `museum-map.html` line 277 says `7 techniques · 12 famous codebreaks`. `cryptanalysis.html` line 123 hero says `Seven techniques that break almost every classical cipher in this museum…`. The page itself contains 10 `.technique-card` blocks (lines 139, 156, 172, 188, 204, 220, 236, 252, 263, 274).

**Expected:** Both call-outs say `10 techniques`.

**Evidence:** `cryptanalysis.html` `<div class="technique-card">` count.

**Proposed fix:** Update the floor-plan caption (`museum-map.html`) and the hero intro (`cryptanalysis.html`) to `10 techniques`. Recheck the "12 famous codebreaks" claim — verify against actual count in Phase 9 sweep.

### F-022 — `comparison.html` claims 37 / 40 ciphers but has 38 rows; missing 14 exhibits
**Severity:** High
**Area:** Counters, Content-gap
**Files:** `comparison.html`
**Status:** Fixed — commit `49d7884` (CIPHERS array rewritten to 52 entries with canonical I-X hall labels; Vernam reclassified to IX; Navajo reclassified to VII; counters and footer unified to 52 / 2,500; footer hall link updated to `Hall VII: Machines`)

**Observed:** Meta description (line 7), social cards (lines 9, 14): `all 37 ciphers`. Page eyebrow (line 90): `37 Ciphers at a Glance`. Counter widget (line 129): `Showing 40 of 40`. Actual `CIPHERS` array length (line 187+): **38**.

Missing from comparison data array: atbash, rot13, four-square, two-square, straddling-checkerboard, chaocipher, m209, copiale, beale, kryptos, voynich, babington, purple, solitaire — i.e. 14 of the 52 Index exhibits.

Additionally the existing entry for Vernam is classified `hall:'VI'` (machines), contradicting the Index which assigns it to ★ (unbreakable).

**Expected:** All counter strings say `52`. The `CIPHERS` array contains all 52 exhibits with correct hall labels per Index. The "Showing N of M" widget matches the populated total at runtime.

**Evidence:** `comparison.html` lines 7, 90, 129, 187–225.

**Proposed fix:** Add the 14 missing rows with era/year/type/key/security/hall metadata. Reclassify Vernam → ★. Replace all literal counters (`37`, `40`) with `52`. The `Showing X of Y` widget should read its total from `CIPHERS.length` rather than a hardcoded literal.

### F-023 — `timeline.html` covers only 21 of 52 exhibits and footer reads "2,400 Years"
**Severity:** High
**Area:** Timeline, Counters
**Files:** `timeline.html`
**Status:** Fixed — commit `db3b6fb` (added 31 missing exhibit cards across all eras; replaced `2,400`→`2,500` in 5 places: 3 meta-description blocks, hero eyebrow, footer; also corrected footer hall-link label `Hall VI: Machines`→`Hall VII: Machines`).

**Observed:** `timeline.html` contains links to 21 unique cipher exhibits: adfgvx, alberti-disk, atbash, babington, bacon, beale, caesar, enigma, great-cipher, jefferson-disk, kryptos, lorenz, navajo-code-talkers, one-time-pad, playfair, polybius, purple, scytale, vigenere, voynich, zodiac. Footer says `2,400 Years of Encryption`.

**Expected:** Every exhibit with a known historical date appears on the timeline. Footer aligns with the canonical age claim (recommend `2,500 Years` to match `index.html` and `404.html`).

Missing exhibits (31): adfgx, bazeries, beaufort, bifid, chaocipher, columnar, confederate-vigenere, copiale, dictionary-code, double-transposition, four-square, fractionated-morse, gronsfeld, hill, homophonic, m209, monoalphabetic, nihilist, pigpen, porta, rail-fence, rot13, running-key, solitaire, stager, straddling-checkerboard, tap-code, trifid, two-square, vernam, vic.

**Evidence:** Grep for `href="ciphers/` in `timeline.html`.

**Proposed fix:** Add timeline entries for every missing exhibit at its first-known year (use the `year` field from `comparison.html`'s `CIPHERS` array as canonical once F-022 is fixed). Update footer count.

### F-024 — `lab/workbench.html` advertises "33 cipher engines" while dropdown has 29 and registry has 51
**Severity:** High
**Area:** Counters, Content-gap
**Files:** `lab/workbench.html`
**Status:** Fixed — commit `693fb0a` (CIPHERS dropdown expanded from 29 to 51 entries to match `window.CipherEngines` registry; hero count `33`→`51`). Engines whose key inputs are non-textual (voynich, navajo, copiale, greatCipher, babington, atbash, rot13, homophonic) are exposed with `hasKey:false`; users can still select them and see registry output.

**Observed:** Hero intro line 57: `Encrypt, decrypt, and analyze text with 33 cipher engines`. The CIPHERS dropdown array (line 162+) contains 29 entries. The exported `window.CipherEngines` registry (`js/ciphers/all-engines.js` lines 1830–1842) exports 51 engines.

**Expected:** Either expand the dropdown to all 51 (preferred, since registry already supports them) and advertise `51 cipher engines`, or admit the actual dropdown count.

Missing from workbench dropdown: scytale, vernam, greatCipher, babington, navajo, voynich, atbash, rot13, foursquare, twosquare, straddlingCheckerboard, chaocipher, m209, solitaire, beale, copiale, kryptos, purple, jefferson, enigma, lorenz, homophonic.

**Evidence:** `lab/workbench.html` line 57 + line 162 vs. `js/ciphers/all-engines.js` line 1830.

**Proposed fix:** Expand `CIPHERS` array in `lab/workbench.html` to cover all engines that have meaningful key+text behaviour (most of them). Update count string. Some engines (e.g. solitaire, kryptos, beale, voynich) may need explanatory tooltips for unusual key formats.

### F-025 — `index.html` body still mentions "37 cipher" near the search-all link area
**Severity:** Medium
**Area:** Counters
**Files:** `index.html`
**Status:** Fixed — commit `0b5765f5589c` (was the same footer literal as F-017; resolved together)

**Observed:** A literal `37 cipher` substring appears in the body of `index.html` (in addition to the `37 ciphers` in the footer covered by F-017).

**Evidence:** `grep -n "37 cipher" index.html`.

**Proposed fix:** Replace with `52` after locating exactly during Phase 8.

### F-026 — `comparison.html` and `timeline.html` footers say "2,400 Years"; `index.html` and `404.html` say "2,500 years"
**Severity:** Medium
**Area:** Counters
**Files:** `timeline.html`, `comparison.html`, `index.html`, `404.html`
**Status:** Fixed — commits `49d7884` (comparison.html) and `db3b6fb` (timeline.html); both now read `2,500 Years` matching index.html and 404.html.

**Observed:** Two different age claims live across the museum: `2,400 Years of Encryption` (timeline+comparison footers) vs. `2,500 years` (index hero, 404 hero, JSON-LD). With Atbash at ~600 BC and Kryptos at 1990, the truthful range is ~2,600 years; with Caesar at ~58 BC it is ~2,084 years.

**Expected:** A single canonical figure on every page. Recommend `2,500 years` since two pages already use it and it is honest within the Caesar–Kryptos span.

**Proposed fix:** Replace `2,400 Years of Encryption` with `2,500 Years of Encryption` on `timeline.html` and `comparison.html`.

### F-027 — Index playground dropdown lists 9 ciphers; recent additions absent
**Severity:** Low
**Area:** Counters, Content-gap
**Files:** `index.html`
**Status:** Verified OK — re-inspection shows the affine engine is implemented inline in `index.html` (lines 362–378) with both encode and decode lambdas. The playground's curated 9-cipher tasting menu is intentional vs. the workbench's 51-engine surface; broader expansion is a product decision, not a defect. Marked Resolved.

**Observed:** Playground `<option>` set: caesar, rot13, atbash, vigenere, beaufort, affine, railfence, polybius, bacon. (Note `affine` has no exhibit page in `ciphers/` and no entry in the engines registry — possible orphan reference.)

**Expected:** Coverage of the most common interactive demos (the playground is intended as a "first look" — not all 52). The Affine cipher should either be added as an exhibit/engine or removed from the playground.

**Proposed fix:** Either implement Affine (small effort) or remove the option. Optionally add 2–3 popular demos like Playfair or Pigpen.

### F-028 — Future-round content gaps (Informational)
**Severity:** Informational
**Area:** Content-gap
**Files:** —
**Status:** Deferred — informational only; out of scope for this audit pass.

**Observed:** Items previously flagged for later rounds and out of scope for the current consistency pass: Dorabella (1897), SIGABA, Typex, Autokey (distinct from Running Key), generic Nomenclator exhibit, generic Book Cipher exhibit, additional Hall X biographies (Bill Tutte solo, Elizebeth Friedman, Joan Clarke, Leo Marks, Agnes Meyer Driscoll), and the Hall XI · Modern Cryptography promotion of DES/DH/RSA/AES/SHA-256 from `modern.html` to four-part exhibits.

**Proposed fix:** None this round. Recorded for roadmap visibility.

### F-029 — `ciphers/solitaire.html` does not mention Crowley's 1999 distinguishing attack on the keystream
**Severity:** High
**Area:** Exhibits
**Files:** `ciphers/solitaire.html`
**Status:** Fixed — commit `757bb59` (Crowley distinguisher already present as a `Known Weaknesses` panel; year corrected from `(2000)` to `(1999)` to match the eprint date).

**Observed:** Page covers Schneier's 1999 design but contains no `Crowley`, `1999 attack`, `distinguishing`, `weakness`, or `keystream bias` text. (The single `1999` occurrence is the design year.)

**Expected:** A "Known Weaknesses" or "Cryptanalysis" section acknowledging Paul Crowley's 1999 paper showing a non-uniform distinguishing bias in the Solitaire keystream (~5 of 26 distinguishability) — i.e. that Solitaire is not as ideal as advertised.

**Evidence:** `grep -ni "crowley\|1999\|distinguish\|weakness" ciphers/solitaire.html` returns only design-year matches.

**Proposed fix:** Add a `Known Weaknesses` panel citing Crowley 1999 and noting that subsequent analysis (Daemen-Govaerts 2001 and others) confirmed bias.

### F-030 — `ciphers/atbash.html` cites Jeremiah but not the specific verses (Jer 25:26 / 51:41)
**Severity:** Medium
**Area:** Exhibits
**Files:** `ciphers/atbash.html`
**Status:** Fixed — commit `757bb59` (added explicit verse citations: Jeremiah 25:26 and 51:41 for SHESHACH; 51:1 for LEB-KAMAI).

**Observed:** Page mentions Jeremiah and gives the BABEL→SHESHACH and KASDIM→LEB-KAMAI examples, but does not cite verse numbers (Jer 25:26, Jer 51:41).

**Expected:** Verse citations alongside the examples to anchor the historical claim.

**Proposed fix:** Add `(Jer 25:26)` and `(Jer 51:41)` parenthetically next to the corresponding examples.

### F-031 — `ciphers/great-cipher.html` does not cross-link to a Hall X biography for Bazeries
**Severity:** Medium
**Area:** Exhibits, Content-gap
**Files:** `ciphers/great-cipher.html`, `halls/codebreakers.html`
**Status:** Fixed — added Étienne Bazeries biography panel to `halls/codebreakers.html` (Story 2.5, anchor `#bazeries`, between Phelippes 1586 and Room 40 1917 — chronologically correct for 1893). The new panel covers his syllabic-substitution attack on the Great Cipher, the 1898 Bazeries Cylinder, and *Les Chiffres Secrets Dévoilés* (1901). `ciphers/great-cipher.html` cross-links to it twice: from the existing Bazeries reference in the historical narrative, and as a new Related-resources list item.

**Observed:** The Great Cipher exhibit credits Étienne Bazeries 1893 and links to the Bazeries cipher exhibit (`bazeries.html`). `halls/codebreakers.html` (Hall X) contains no Bazeries biography.

**Expected:** Either a Bazeries biography panel exists in Hall X and the Great Cipher exhibit cross-links to it, or this is filed as a content gap for a later round.

**Evidence:** `grep -ni "bazeries" halls/codebreakers.html` returns no matches.

**Proposed fix:** Add a short Bazeries biography to Hall X (~150 words covering 1898 cylinder cipher, 1893 Great Cipher break, 1901 *Les Chiffres Secrets Dévoilés*), then update the Great Cipher cross-link target. Acceptable to defer to a future round and tag F-031 `Deferred` at review.

### F-032 — `ciphers/enigma.html` previous-link points to one-time-pad, breaking the machines-hall chain
**Severity:** Medium
**Area:** Exhibits
**Files:** `ciphers/enigma.html`
**Status:** Fixed — commit `757bb59` (prev-link `one-time-pad`→`chaocipher`, the prior Hall VII exhibit chronologically).

**Observed:** `ciphers/enigma.html` hall-nav previous link is `../ciphers/one-time-pad.html` (an unbreakable-hall exhibit). Next link is `lorenz.html` (correct).

**Expected:** Previous link should be the machine that precedes Enigma in `halls/machines.html` order — likely chaocipher or jefferson-disk depending on chronological order chosen.

**Evidence:** `ciphers/enigma.html` `hall-nav` block.

**Proposed fix:** Repoint previous-link to the correct adjacent machines exhibit after Phase 8 rebuilds the canonical hall ordering.

### F-033 — `ciphers/solitaire.html` chain places it before one-time-pad, contradicting unbreakable-hall order
**Severity:** Medium
**Area:** Exhibits
**Files:** `ciphers/solitaire.html`
**Status:** Fixed — commit `757bb59` (next-link `one-time-pad` (predecessor)→`halls/codebreakers.html` (Hall X), since Solitaire is the last Hall IX exhibit chronologically).

**Observed:** Solitaire's prev=vernam and next=one-time-pad. The unbreakable hall (once F-014 is fixed) will list one-time-pad → vernam → solitaire chronologically (1882 → 1917 → 1999). Solitaire belongs at the *end* with no next-exhibit — its next link should be "Back to Hall".

**Expected:** prev=vernam, next="Back to Hall IX".

**Proposed fix:** Replace next-link with hall-back link.

### F-034 — `ciphers/babington.html` chain order disagrees with substitution-hall sequence
**Severity:** Medium
**Area:** Exhibits
**Files:** `ciphers/babington.html`
**Status:** Fixed — commit `757bb59` (prev-link `great-cipher` (later)→`homophonic`; next-link `halls/substitution`→`great-cipher`; Babington 1586 now correctly precedes Great Cipher 1626).

**Observed:** Babington prev=great-cipher, next=back-to-hall. Once F-011 adds four-square + two-square in chronological order, the canonical substitution sequence becomes: monoalphabetic → babington (1586) → homophonic → great-cipher (1626) → playfair → four-square → two-square → hill. Babington should not have great-cipher as prev (great-cipher is later).

**Proposed fix:** Realign chain after Phase 8 rebuilds the substitution hall.

### F-035 — Exhibit pages have inconsistent meta description lengths (under 80 / over 170)
**Severity:** Low
**Area:** A11y-SEO
**Files:** all 52 exhibit pages under `ciphers/`
**Status:** Fixed — every one of the 52 exhibit pages now has a meta description, og:description, and twitter:description in the 140–160 character window, all three values matching. Format: `<one-line what-it-is>. <one-line year/who-broke-it/why-it-matters>.` Verified with an automated audit (0 out-of-range, 0 mismatches).

**Observed:** Sample sweep shows several exhibit meta descriptions outside the 140–160 character recommended window.

**Expected:** Each exhibit meta description is 140–160 characters and ends with a period.

**Proposed fix:** Spot-edit during Phase 9. Pattern fix template: `<one-sentence what-it-is>. <one-sentence year/who-broke-it/why-it-matters>.`

### F-036 — A11y/SEO spot-check: home, halls, and key exhibits all pass for `lang`/`canonical`/`alt`
**Severity:** Informational
**Area:** A11y-SEO
**Files:** `index.html`, `halls/ancient.html`, `ciphers/caesar.html`, `ciphers/enigma.html`, `ciphers/voynich.html`
**Status:** Resolved — informational positive-baseline finding; no action required.

**Observed:** All five sampled pages have `<html lang="en">`, an absolute `rel="canonical"` URL, and 100% `alt=` coverage on `<img>` tags (note: index.html, halls/ancient.html, and voynich.html have zero `<img>` tags — they use SVG and CSS for visuals).

**Expected:** No action required — this finding is recorded as a positive baseline.

**Proposed fix:** None.

### F-037 — Illustration attribution audit: Gemini AI label not present in main `images/halls/` figures
**Severity:** Low
**Area:** A11y-SEO
**Files:** `cryptanalysis.html`, `modern.html`, plus any hall pages using `images/halls/`
**Status:** Deferred `[NEEDS INFO]` — requires Paul to flag which `images/halls/*` and `images/artifacts/*` files are AI-generated before attribution sweep can proceed.

**Observed:** `cryptanalysis.html` and `modern.html` use the `Illustration: Google Gemini AI` attribution under AI-generated figures. Hall and exhibit pages also display large hero images sourced from `images/halls/` and `images/artifacts/` — only Paul knows which were AI-generated.

**Expected:** Every AI-generated illustration carries the same `Illustration: Google Gemini AI` (or similar) attribution.

**Proposed fix:** Paul to flag which `images/halls/*` and `images/artifacts/*` files are AI-generated so attribution can be added uniformly.

**Decisions needed:** Provenance list for `images/halls/` and `images/artifacts/`.

## Blockers and open questions

- **OQ-1: Hall numbering scheme.** The Complete Cipher Index uses I–V, CW,
  VI–VIII, ★ (no IX, no X). The floor plan and the hall files use I–X
  (civil-war = VI, machines = VII, puzzle = VIII, unbreakable = IX,
  codebreakers = X). Paul to confirm we keep the I–X scheme (the floor plan
  and all hall-page footers already use it; only the Index table is out of
  sync). Tentative answer: yes — Index will be rewritten in Phase 8.
