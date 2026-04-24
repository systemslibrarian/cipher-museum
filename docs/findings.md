# Cipher Museum Findings — 2026-04-24

Audit against commit `c04f1c420ab4cef2df135f0163c422453ab73414` of `systemslibrarian/cipher-museum` (branch `main`).
Cross-referenced with live site at https://ciphermuseum.com.

## Status
- Act I (audit): in progress
- Act II (fix): not started
- Total findings: 0
  - Critical: 0
  - High: 0
  - Medium: 0
  - Low: 0
  - Informational: 0
- Fixed: 0 / 0

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

(none yet — Phase 0 is inventory only)

## Blockers and open questions

- **OQ-1: Hall numbering scheme.** The Complete Cipher Index uses I–V, CW,
  VI–VIII, ★ (no IX, no X). The floor plan and the hall files use I–X
  (civil-war = VI, machines = VII, puzzle = VIII, unbreakable = IX,
  codebreakers = X). Paul to confirm we keep the I–X scheme (the floor plan
  and all hall-page footers already use it; only the Index table is out of
  sync). Tentative answer: yes — Index will be rewritten in Phase 8.
