# Cipher Museum Findings — 2026-04-24

Audit against commit `c04f1c420ab4cef2df135f0163c422453ab73414` of `systemslibrarian/cipher-museum` (branch `main`).
Cross-referenced with live site at https://ciphermuseum.com.

## Status
- Act I (audit): in progress
- Act II (fix): not started
- Total findings: 14
  - Critical: 3
  - High: 11
  - Medium: 0
  - Low: 0
  - Informational: 0
- Fixed: 0 / 14

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
**Status:** Open

**Observed:** The Complete Cipher Index uses the labels `I, II, III, IV, V, CW, VI, VII, VIII, ★` and contains no Hall IX or Hall X. Mechanical machines are split between label "VI" (alberti, jefferson, enigma, lorenz, navajo) and label "VII" (chaocipher, m209, purple). Label "VII" mixes machines with puzzle/novelty (pigpen, bacon, tap-code, zodiac).

**Expected:** The floor plan in the same file and every `halls/*.html` page use a sequential I–X scheme: ancient=I, substitution=II, polyalphabetic=III, transposition=IV, military=V, civil-war=VI, machines=VII, puzzle=VIII, unbreakable=IX, codebreakers=X. Mechanical exhibits should all live under "VII", puzzle/novelty under "VIII".

**Evidence:** `museum-map.html` line 384 (`alberti-disk → VI`) vs. `halls/machines.html` title `Hall VI: Mechanical Cipher Machines` *and* footer `Hall VII of X`. The page reads as Hall VI in two places and Hall VII in another.

**Proposed fix:** Rewrite the Index table's "Hall" column so labels match the floor plan + hall files: machines→VII, puzzle→VIII, unbreakable→IX, codebreakers gets new rows for biographies (or stays out, but documented). Cross-reference fix F-002, F-003.

**Decisions needed:** Confirm canonical scheme is I–X (as per OQ-1).

### F-002 — `halls/machines.html` self-contradicts: title says VI, footer says VII
**Severity:** Critical
**Area:** Hall-pages
**Files:** `halls/machines.html`
**Status:** Open

**Observed:** `<title>Hall VI: Mechanical Cipher Machines — The Cipher Museum</title>`, breadcrumb `Hall VI`, but footer `Hall VII of X · 10 Exhibit Halls`.

**Expected:** All four self-identity slots (title, h1, breadcrumb, footer) say `Hall VII`. Floor plan, hall-nav prev/next, and `museum-map.html` floor plan all place machines as Hall VII.

**Evidence:** `halls/machines.html` title element vs. footer `<span class="footer-copy">Hall VII of X · 10 Exhibit Halls</span>`.

**Proposed fix:** Change title and breadcrumb to `Hall VII`.

### F-003 — `halls/puzzle.html` self-contradicts: title says VII, footer says VIII
**Severity:** Critical
**Area:** Hall-pages
**Files:** `halls/puzzle.html`
**Status:** Open

**Observed:** `<title>Hall VII: Puzzle & Novelty Ciphers — The Cipher Museum</title>`, breadcrumb `Hall VII`, but footer `Hall VIII of X`.

**Expected:** All four self-identity slots say `Hall VIII`.

**Evidence:** `halls/puzzle.html` head + breadcrumb vs. footer span.

**Proposed fix:** Change title and breadcrumb to `Hall VIII`.

### F-004 — `halls/civil-war.html` lacks "Hall VI" anywhere except the footer
**Severity:** High
**Area:** Hall-pages
**Files:** `halls/civil-war.html`
**Status:** Open

**Observed:** Title is `Civil War Gallery — The Cipher Museum`, h1 `The American Civil War Gallery`, breadcrumb terminal segment `Special Exhibition`. Footer is the only place that says `Hall VI of X · 10 Exhibit Halls`.

**Expected:** A user landing on this page should be able to tell it is Hall VI without scrolling to the footer. Title prefix `Hall VI:` and breadcrumb terminal `Hall VI` would match the rest of the museum.

**Evidence:** `halls/civil-war.html` lines for `<title>`, breadcrumb, and footer.

**Proposed fix:** Title → `Hall VI: Civil War Gallery — The Cipher Museum`. Breadcrumb terminal → `Hall VI`.

### F-005 — `halls/unbreakable.html` lacks "Hall IX" anywhere except the footer
**Severity:** High
**Area:** Hall-pages
**Files:** `halls/unbreakable.html`
**Status:** Open

**Observed:** Title `Final Hall: The Unbreakable — The Cipher Museum`, breadcrumb terminal `Final Hall`. Footer says `Hall IX of X`.

**Expected:** Either the rest of the page admits to being Hall IX, or all four slots use the "Final Hall" label consistently. Inconsistent reading creates confusion.

**Evidence:** `halls/unbreakable.html` `<title>` + breadcrumb vs. footer.

**Proposed fix:** Title → `Hall IX: The Unbreakable — The Cipher Museum`. Breadcrumb terminal → `Hall IX`. Keep "Final Hall" wording in any decorative eyebrow if desired.

### F-006 — `halls/codebreakers.html` lacks "Hall X" anywhere except the footer
**Severity:** High
**Area:** Hall-pages
**Files:** `halls/codebreakers.html`
**Status:** Open

**Observed:** Title `Hall of Codebreakers — The Cipher Museum`, breadcrumb terminal `Hall of Codebreakers`. Footer says `Hall X of X`.

**Expected:** Title prefix `Hall X:` + breadcrumb terminal `Hall X` (the prefix can be retained inside the title for SEO).

**Proposed fix:** Title → `Hall X: Hall of Codebreakers — The Cipher Museum`. Breadcrumb terminal → `Hall X`.

### F-007 — `halls/civil-war.html` next link skips machines and puzzle, jumps to unbreakable
**Severity:** High
**Area:** Hall-pages
**Files:** `halls/civil-war.html`
**Status:** Open

**Observed:** `civil-war.html` hall-nav next link is `unbreakable.html` ("Final Hall →"). The chain therefore is V → VI → IX, missing VII and VIII.

**Expected:** Next link should be `machines.html` ("Next Hall → Hall VII: Mechanical Cipher Machines").

**Evidence:** `halls/civil-war.html` `class="hall-nav-link next"` block.

**Proposed fix:** Replace `href="unbreakable.html"` with `href="machines.html"` and update the label text.

### F-008 — `halls/machines.html` previous link skips civil-war, jumps back to military
**Severity:** High
**Area:** Hall-pages
**Files:** `halls/machines.html`
**Status:** Open

**Observed:** Hall-nav previous link is `military.html` ("← Previous Hall · Hall V: Military & Spy Ciphers"). Should be civil-war (Hall VI).

**Expected:** `civil-war.html` ("← Hall VI · Civil War Gallery").

**Proposed fix:** Replace previous-link href and label.

### F-009 — `halls/unbreakable.html` previous link skips puzzle and machines, jumps back to civil-war
**Severity:** High
**Area:** Hall-pages
**Files:** `halls/unbreakable.html`
**Status:** Open

**Observed:** Previous link is `civil-war.html` ("← Civil War Gallery"). Chain reads VIII → VII → VI on the way back instead of VIII alone.

**Expected:** `puzzle.html` ("← Hall VIII · Puzzle & Novelty Ciphers").

**Proposed fix:** Replace previous-link href and label.

### F-010 — `halls/ancient.html` is missing 2 of 5 exhibits per the Index
**Severity:** High
**Area:** Hall-pages, Content-gap
**Files:** `halls/ancient.html`
**Status:** Open

**Observed:** Page renders 3 exhibit cards: caesar, polybius, scytale. The "This Hall" sidebar list and main grid both stop at 3.

**Expected:** Per Index rows 01, 02, 03, 41, 42 → atbash and rot13 also belong on this page. Both have full exhibit pages and registered engines.

**Evidence:** `halls/ancient.html` `href="../ciphers/"` link set vs. `museum-map.html` floor plan Hall I exhibit list (lines 116–124) which already lists 5.

**Proposed fix:** Add atbash and rot13 cards in chronological order (atbash ~600 BC first, then scytale ~700 BC — actually atbash and scytale orderings disagree across sources; place atbash second after a fresh chronological re-sort of the 5).

### F-011 — `halls/substitution.html` is missing four-square and two-square
**Severity:** High
**Area:** Hall-pages, Content-gap
**Files:** `halls/substitution.html`
**Status:** Open

**Observed:** Page renders 6 cards: babington, great-cipher, hill, homophonic, monoalphabetic, playfair.

**Expected:** Index rows 04, 05, 06, 07, 38, 39, 43, 44 → 8 cards. Missing four-square (1854 Pliny Earle Chase variant) and two-square.

**Evidence:** `halls/substitution.html` link set vs. Index rows 43, 44.

**Proposed fix:** Add four-square (place adjacent to playfair as a Playfair variant) and two-square (next to four-square).

### F-012 — `halls/military.html` is missing straddling-checkerboard
**Severity:** High
**Area:** Hall-pages, Content-gap
**Files:** `halls/military.html`
**Status:** Open

**Observed:** 5 cards: adfgvx, adfgx, bazeries, nihilist, vic.

**Expected:** 6 cards (Index row 45 → straddling-checkerboard).

**Evidence:** `halls/military.html` link set.

**Proposed fix:** Add straddling-checkerboard card before vic (it predates VIC and is the substitution layer VIC builds on).

### F-013 — `halls/puzzle.html` is missing copiale, beale, kryptos (3 of 8)
**Severity:** High
**Area:** Hall-pages, Content-gap
**Files:** `halls/puzzle.html`
**Status:** Open

**Observed:** 5 cards: bacon, pigpen, tap-code, voynich, zodiac.

**Expected:** 8 cards (Index rows 32, 33, 34, 35, 40, 48, 49, 50 → adds copiale, beale, kryptos).

**Evidence:** `halls/puzzle.html` link set vs. floor plan Hall VIII exhibit list (lines 263–272) which already lists all 8.

**Proposed fix:** Add copiale, beale, kryptos cards in chronological order (copiale ~1730, beale ~1820/1885, kryptos 1990).

### F-014 — `halls/unbreakable.html` is missing solitaire and contains an erroneous enigma cross-link
**Severity:** High
**Area:** Hall-pages, Content-gap
**Files:** `halls/unbreakable.html`
**Status:** Open

**Observed:** Cards/links: one-time-pad, vernam, plus a cross-link to `../ciphers/enigma.html`. Solitaire / Pontifex (Index row 51) is not listed.

**Expected:** 3 exhibit cards: one-time-pad, vernam, solitaire. Enigma belongs to Hall VII (machines) and should not appear as a card here.

**Evidence:** `halls/unbreakable.html` link set vs. Index row 51.

**Proposed fix:** Add solitaire/pontifex card. Remove or downgrade the enigma reference (acceptable as inline body prose linking to enigma.html for "machines whose ciphers were broken" context, but not as an exhibit card).

## Blockers and open questions

- **OQ-1: Hall numbering scheme.** The Complete Cipher Index uses I–V, CW,
  VI–VIII, ★ (no IX, no X). The floor plan and the hall files use I–X
  (civil-war = VI, machines = VII, puzzle = VIII, unbreakable = IX,
  codebreakers = X). Paul to confirm we keep the I–X scheme (the floor plan
  and all hall-page footers already use it; only the Index table is out of
  sync). Tentative answer: yes — Index will be rewritten in Phase 8.
