# Working notes for Claude

Project-specific guidance. See `README.md` for what the museum is, and
`hall-of-foundations/TESTING.md` for how the maths wing is tested.

---

## The failure mode this codebase actually has

Across a long accuracy-and-expansion pass on the Hall of Foundations, **every
single defect found was in prose, labels, or metadata — never in the maths.**
The `.js` modules and their unit tests were green the entire time. That is not
a coincidence; it is the shape of this repo. Content is duplicated across many
surfaces by design (exhibit page, glossary, guided tour, search index,
timeline, artifact cards, `og:description`, hall gallery card), and only the
executable parts have tests by default.

Three habits follow from that.

### 1. A claim lives on more surfaces than you think

An incorrect statement about ML-KEM was fixed on the two exhibit pages. It
survived, live, in **four** other places: the glossary entry, the guided-tour
note in `tours/foundations.json`, both `og:description` tags, and — worst — a
JavaScript string literal that rendered into the interactive's own readout.

Before declaring a content fix done, check every surface:

```
hall-of-foundations/*.html   glossary.html      timeline.html
tours/*.json                 js/search-index.json
data/artifact-cards.json     halls/*.html       modern.html
museum-map.html              <meta>/<og:> tags  JS string literals
```

`hall-of-foundations/foundations-claims.test.js` scans most of these. Note it
strips tags but keeps `<script>` bodies, so it catches interface labels too.

### 2. `grep` finds strings, not claims

The same wrong idea survived two commits as *"cryptography publishes the skewed
basis and keeps the tidy one secret"* — a paraphrase that matched no search for
`bad basis`. After fixing a claim, re-read the surrounding page rather than
trusting the search that found it. Summary boxes at the *top* of a page are the
usual survivors, because the fix usually lands in the detailed section below.

### 3. Regenerating a data file can silently drop fields

`node scripts/build-artifact-cards.js` once computed a `hall` field and never
emitted it, so a regeneration stripped it from every card and broke the
structural tests. Always `git diff` a regenerated data file rather than assuming
the generator is a faithful superset of what was there.

Counts also go stale: `museum-map.html`, `index.html` and `js/footer.js` each
hard-code an exhibit total. Adding an exhibit means updating all three.

---

## Testing: three layers, and what each one cannot see

Run `npm test` (everything) or `npm run test:foundations` / `npm run
test:protocols` for the wings.

| Layer | Files | Catches |
| --- | --- | --- |
| Maths | `*-math.test.js`, `crypto-algebra`, `ec-math` | wrong algorithms |
| Wiring | `exhibit-interaction.test.js`, `test-protocol-pages.js` | correct maths, wrong UI or wrong narration |
| Prose | `foundations-claims.test.js`, `foundations-links.test.js` | retired claims returning, broken link topology |

The wiring layer exists because of a real bug it caught: a failed decryption
reported noise measured against the bit it had *decoded* rather than the bit
*sent*, printing "noise 15 exceeded the budget" when the budget is 24. All
maths assertions were green.

**A guard that has never failed is a guess.** When adding one, deliberately
reintroduce the bug and confirm it fails, then restore. Every guard in the
Foundations wing was verified this way.

---

## Accuracy conventions in the exhibits

- **Don't assert zero where the mathematics says non-zero.** On the toy
  parameters these exhibits use, a random ECDSA forgery verifies about 1/n of
  the time and Schnorr's soundness error is exactly 1/q. Tests assert the rate
  tracks the bound. Asserting zero would claim the toy is stronger than the
  maths allows.
- **Say what the deployed thing actually does.** ML-KEM does not hide a "good
  basis" — it holds a short secret vector. Not every signature needs the random
  oracle. Not every succinct proof needs a pairing. AES has no security
  reduction. These specific corrections are locked in by the prose tests, each
  with its reason recorded in the failure message.
- **Toy parameters need naming as toys.** Each interactive exhibit carries an
  honest-limits section saying how it differs from the deployed scheme.

## Structure notes

- Exhibit numbering is one global sequence: **1–140** ciphers, **141–157** Hall
  of Foundations, **158–160** the modern protocol exhibits. A new cipher page
  continues from 161 — do not restart at 141.
- Foundations exhibits use `foundations.css` on top of `css/museum.css`; cipher
  pages use `exhibit-layout` / `panel` markup. Match the neighbouring page
  rather than inventing components.
- Cipher pages with bespoke interactives (no `demo-loader` config) must be
  listed in `STATIC_PAGES` in **both** `tests/test-comprehensive.js` and
  `tests/test-demo-pages.js`, and still load `demo-loader.min.js`.
- The Hall of Foundations must stay internal to the museum — no links to sister
  projects. Enforced by `foundations-links.test.js`.

## Before finishing a content change

1. `npm test` — all suites, not just the one you touched.
2. `git diff` any regenerated data file.
3. Re-read the changed page top to bottom, not just the diff.
