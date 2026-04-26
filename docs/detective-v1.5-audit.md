# Cipher Detective v1.5 — Pre-Flight Audit

*Superseded — see `js/detective/detective.js` header for current state.*

**Audited:** 2026-04-25  
**Files examined:** `cipher-detective.html`, `js/cipher-detective.js`

---

## 1. Current file locations

| File | Role |
|---|---|
| `cipher-detective.html` | Page shell, inline CSS/JS for DOM wiring |
| `js/cipher-detective.js` | Monolithic analysis engine — all logic in one IIFE, exports `window.CipherDetective` |

No `tools/`, `lab/`, or `identify-cipher.html` variants. The page slug is confirmed `cipher-detective.html`.

---

## 2. Existing analyses

The engine in `js/cipher-detective.js` runs six statistical tests:

| Test | Method | Reference |
|---|---|---|
| Index of Coincidence (IoC) | Friedman formula | Friedman (1922) |
| Chi-square vs. English | Sinkov method | Sinkov (1966) |
| Best-shift chi-square | 26 Caesar brute-force | Classical |
| Kasiski examination | Trigram spacing GCDs | Kasiski (1863) |
| Period-sliced IoC | Period validation | Friedman (1920) |
| Character-set detection | Regex heuristics | — |
| Digraph analysis | Even-length + no-dup-pairs | Playfair detection |

Ten cipher families are scored: caesar, simple-sub (monoalphabetic), vigenere, transposition, playfair, adfgvx, morse, numeric (book/codebook), otp/random, bifid.

---

## 3. Current output format

- **Sidebar:** "Cryptanalytic Profile" stats table (6 rows: Length, Characters, IoC, Base Chi-Sq, Best Shift, Probable Period)
- **Main area:** "Most Likely Candidates" heading + up to 5 candidate cards
- Each card shows: cipher name, `N% Match` badge, pro evidence (`+`), con evidence (`-`), optional exhibit link

---

## 4. Helper modules / imports

None. The page is entirely self-contained. No imports from `js/ciphers/all-engines.js` or `js/cryptanalysis/*.js`. The analysis logic is duplicated rather than shared.

---

## 5. CSS / styling conventions

- Uses `css/museum.css` via `<link>`.
- Additional inline `<style>` in the page head with well-scoped class names (`.detective-grid`, `.candidate-card`, `.confidence-badge`, `.stats-table`, etc.).
- CSS variables used correctly: `--s2/s3/s4/s5`, `--gold`, `--gold-b`, `--gold-dim`, `--gold-lt`, `--green`, `--red`, `--tx`, `--tx2`, `--tx3`, `--fd`, `--fb`, `--fm`.
- Museum badge/pill system available in `museum.css` (`.badge`, `.pill`, `.badge-hard`, `.badge-civil`, etc.).
- `.museum-footer` pattern used by other pages.
- Footer is currently a bare `<footer>` without `class="museum-footer"` — minor inconsistency.

---

## 6. What is already good — preserve as-is

- **Analysis quality** — the IoC, chi-square, Kasiski, period-IoC, and digraph logic is solid and well-referenced. Do not rewrite.
- **Scoring logic per family** — each `scoreFamily()` case is calibrated with realistic evidence thresholds. Keep.
- **Character-set detection** — ADFGVX/Morse/numeric heuristics are correct. Keep.
- **Auto-analyze on input** — live updating as the user types is good UX. Keep.
- **Hash pre-population** — `location.hash` can pre-fill the textarea. Keep.
- **Exhibit links** — each candidate links to the relevant exhibit. Keep.
- **CSS variable usage** — consistent with the rest of the museum. Keep.

---

## 7. What is missing or weak vs. v1.5 goals

| Goal | Current state | Gap |
|---|---|---|
| Detective vocabulary (Evidence/Suspects/Confidence/Case Notes) | None — uses "Most Likely Candidates" / "N% Match" | Labels, narrative, and framing |
| Ranked confidence labels (Very likely → Inconclusive) | Numeric percent only | Absolute-score-to-label mapping |
| Frequency chart (SVG, A–Z, with English overlay) | Not present | Needs building from scratch |
| Accessible chart table (`.visually-hidden`) | Not present | Needs building |
| Reality labels strip | Not present | Needs building |
| Recommended Next Attack | Not present | Needs building |
| Short-text banner (< 60 chars) | Generic text in Limitations only | No live banner |
| Case Notes (narrative connecting evidence to suspects) | Not present | Needs writing |
| Modular code structure | Monolithic | Needs splitting |
| Honest Limitations section | Basic (4 bullets) | Needs strengthening per spec |
| `class="museum-footer"` on footer | Missing | Minor fix |

---

## 8. Scoping decisions for v1.5

1. **Keep `js/cipher-detective.js`** as a thin backward-compat shim for `test-comprehensive.js`.
2. **Create `js/detective/analyses.js`** — pure analysis functions.
3. **Create `js/detective/scoring.js`** — scoring, ranking, confidence labels, case notes, next-attack recommendation.
4. **Create `js/detective/render.js`** — all DOM writes.
5. **Create `js/detective/detective.js`** — entry point; also exports `window.CipherDetective` for backward compat.
6. **Redesign `cipher-detective.html`** — new HTML structure for Evidence/Suspects/Next Attack sections; updated inline CSS.
7. **Add `tests/test-detective.js`** — new test suite for the six required cases + render assertions.
8. **Update `tests/test-comprehensive.js`** — change `require` paths to new module files.
9. **Short-text threshold:** 60 alpha characters (per spec).
10. **Confidence thresholds (absolute raw score):**
    - Very likely: score ≥ 8
    - Likely: score ≥ 5
    - Possible: score ≥ 2
    - Unlikely: score ≥ 1
    - Inconclusive: score < 1, or text too short with low score
    - If `tooShort` (< 60 chars): cap at max "Possible"
11. **Frequency chart:** SVG inline, viewBox 520×210, A–Z alphabetical, two side-by-side bars per letter (ciphertext solid / English hatched). Top 3 ciphertext letters in gold. Distinguishable by fill pattern (not color alone).
12. **No new external dependencies.**

---

## 9. Files to create / modify

| File | Action | Description |
|---|---|---|
| `docs/detective-v1.5-audit.md` | Create | This document |
| `js/detective/analyses.js` | Create | Pure analysis functions |
| `js/detective/scoring.js` | Create | Scoring, ranking, labels, case notes, next attack |
| `js/detective/render.js` | Create | All DOM rendering |
| `js/detective/detective.js` | Create | Entry point + backward-compat export |
| `js/cipher-detective.js` | Replace | Thin shim that loads sub-modules (Node compat for tests) |
| `cipher-detective.html` | Modify | New HTML structure, updated CSS, new script loading |
| `tests/test-detective.js` | Create | New test suite |
| `tests/test-comprehensive.js` | Modify | Update `require` paths |
| `tests/test-demo-pages.js` | Modify | Update DOM assertion IDs if needed |
