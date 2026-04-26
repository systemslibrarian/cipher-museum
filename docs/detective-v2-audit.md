# Cipher Detective v2 — Pre-Flight Audit

*Superseded — see `js/detective/detective.js` header for current state.*

**Date:** 2026-01  
**Status:** Complete — ready for v2 implementation

---

## Existing module inventory

| File | Exports | Role |
|------|---------|------|
| `js/detective/analyses.js` | `window.DetectiveAnalyses` | Pure analysis: IoC, chi-square, Kasiski, charset, period-IoC |
| `js/detective/scoring.js` | `window.DetectiveScoring` | Weighted scoring → ranked suspects + caseNotes + nextAttack |
| `js/detective/render.js` | `window.DetectiveRender` | DOM write: freq chart, suspects, stats panel |
| `js/detective/detective.js` | `window.CipherDetective` | Entry: wires analyses → scoring → render; URL-hash boot |

All four files use the identical IIFE pattern:
```js
(function(global){ ... })(typeof window !== 'undefined' ? window : global);
```
No build step. Loaded via `<script>` tags in `cipher-detective.html`. Node.js JSDOM test suite runs identically.

---

## DOM slots used by v1.5

```
#detective-input       — textarea
#det-empty             — shown when input is empty
#det-results           — hidden until first input
  #det-reality         — label strip
  #det-short-warning   — short-text alert
  .det-main
    #det-freq-chart-wrap
    #det-freq-interpretation
    #det-suspects-list
    #det-case-notes
    #det-next-attack   — "Recommended Next Attack" box
  .det-sidebar
    #stat-length / #stat-charset / #stat-ioc / #stat-chi / #stat-shift / #stat-period
```

---

## v2 new DOM slots

```
#det-playback-area     — step-by-step playback panel (inside #det-results, before #det-reality)
#det-watch-wrap        — Watch button wrapper (inside Recommended Next Attack section)
#det-attack-tools      — Attack-tool buttons + output row (after #det-next-attack)
#det-challenge-entry   — "Practice Mode" entry button (below textarea, above #det-empty)
#det-challenge-mode    — Full challenge mode panel (below #det-challenge-entry)
```

---

## v2 new modules

| File | Exports | New capabilities |
|------|---------|-----------------|
| `js/detective/attacks.js` | `window.DetectiveAttacks` | Caesar BF, ROT13, Atbash, Morse decode, Encoding decode, Vigenère key-length, Substitution freq suggestions, isApplicable |
| `js/detective/playback.js` | `window.DetectivePlayback` | 7-step narrated investigation playback |
| `js/detective/challenges.js` | `window.DetectiveChallenges` | 15 curated puzzles, 3 tiers, localStorage progress, hints, reveal |

---

## Key observations

### No quadgram / n-gram engine
There is no scored n-gram corpus. The existing `_chiSquareAtShift(letters, shift)` in `analyses.js` (lower = more English-like) can be repurposed to rank all 25 Caesar candidates. This is sufficient for brute-force quality ranking.

### renderNextAttack() target
The `renderNextAttack()` function in `render.js` populates `#det-next-attack` with a `.next-attack-box`. The v2 Watch button must go into `#det-watch-wrap` immediately after (within the same section), **not** inside `#det-next-attack` (which is cleared on each re-render).

### API reuse
- `DetectiveAnalyses._chiSquareAtShift(letters, shift)` — for Caesar brute-force ranking.
- `DetectiveAnalyses._periodIoC(letters, period)` — for Vigenère key-length estimation.
- `DetectiveAnalyses._kasiskiTest(letters)` — for Kasiski in Vigenère key-length.
- `DetectiveAnalyses._freqCounts(letters)` — for substitution frequency suggestions.

### v1.5 tests
2682 tests pass (62 detective, 1843 comprehensive, 777 demo-pages). All must remain green after v2 changes.

### challenge data
`data/detective-challenges.json` — 15 challenges, version `"2"`. Fetched client-side by `challenges.js` via `fetch()`. Node.js tests stub the data directly.

---

## Commit sequence

1. `detective v2: pre-flight audit`
2. `detective v2: attack tools (Caesar brute / ROT13 / Atbash / Morse / encodings / Vigenère key-length / substitution suggestions)`
3. `detective v2: step-by-step attack playback`
4. `detective v2: challenge mode beginner tier`
5. `detective v2: challenge mode intermediate tier`
6. `detective v2: challenge mode advanced tier`
7. `detective v2: tests`
