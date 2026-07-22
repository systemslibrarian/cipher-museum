# Hall of Foundations — how the wing is tested

The wing is tested in three layers, because three different kinds of thing can
be wrong with an interactive maths exhibit:

1. **The maths can be wrong.** — module tests
2. **The page can wire correct maths up wrongly.** — interaction tests
3. **The prose can explain correct maths incorrectly.** — claims tests

Each layer catches a class the others structurally cannot. All three run under
`npm test` and in CI (`.github/workflows/ci.yml`); every file exits non-zero on
failure.

```bash
npm run test:foundations                        # all three layers
node hall-of-foundations/lwe-math.test.js       # or any single file
```

---

## Layer 1 — the maths

Exhibit logic is decoupled from the DOM so it can be unit-tested and fuzzed
independent of rendering. Each module exports to `window.*` in the browser and
`module.exports` in Node.

| Module | Backs | Covers |
| --- | --- | --- |
| `lattice-math.js` | §147 SVP, §152 CVP | `shortestVector`, `closestPoint`, `babaiRound`, `lweRecover`, `babaiIsCorrect`, `det2` |
| `lwe-math.js` | §157 Learning With Errors | `gaussianSolve`, `lweSample`, `encryptBit`, `decryptBit`, `residualNoise`, `ringDist`, `modInv` |
| `crypto-algebra.js` | §143, §153, §155, §156 | modular arithmetic, polynomial rings, Lagrange interpolation, pairing bilinearity |
| `ec-math.js` | §142, §150 | elliptic-curve group law over ℝ and over 𝔽ₚ |

Plus `foundations-properties.test.js` (property-based, via `fast-check`) and
`exhibit-examples.test.js`, which re-derives the specific constants each page
hard-codes so an exhibit cannot drift from its own worked example.

Edge cases worth knowing about: a **degenerate (det = 0) basis** — the lattice
analogue of the point-at-infinity case — must return `null` rather than throw;
and `decryptBit` rounds to the nearer of the two ideals by ring distance rather
than using the usual `|centered| > q/4` shorthand, which misdecodes at exactly
one residual value because an odd `q` spaces the ideals asymmetrically.

## Layer 2 — the wiring

`exhibit-interaction.test.js` drives every exhibit through JSDOM the way a
visitor drives it: load the page, work the controls, read what the page
announces back.

- **A sweep** over all 17 exhibits: loads with no script errors, draws every
  SVG stage, then has every button, slider, number field and select worked
  through its full range — and must still be error-free and still drawing.
  A completeness check fails if a new exhibit page is added and not listed.
- **Targeted checks** where a claim can be computed independently and compared
  against what the page actually says: the §145 RSA round trip (including
  messages sharing a factor with `n`, the case §145's own footnote calls out),
  §149 Lagrange and the generator condition `gcd(g,n) = 1`, §154's avalanche
  distribution, §152's good/bad basis asymmetry, and §157's solve-then-fail arc.

This layer exists because it caught something layer 1 could not: on a failed
decryption §157 reported the noise measured against the bit it had *decoded*
rather than the bit that was *sent*, announcing "noise 15 exceeded the budget"
when the budget is 24. Every math assertion was green at the time.

## Layer 3 — the prose

`foundations-claims.test.js` guards the explanatory claims themselves.

The wing went through a cryptographic accuracy sweep. Twice, a corrected claim
reappeared somewhere the fix had not reached — the ML-KEM good-basis/bad-basis
line survived in the glossary entry, the guided-tour note and both
`og:description` tags after the exhibit pages were fixed; and §147's honesty box
went on asserting it at the top of a page whose closing section refuted it.

So this layer scans **every surface a claim reaches a visitor through** — all
exhibit HTML, the README, `glossary.html`, `timeline.html`,
`tours/foundations.json` and `js/search-index.json` — with tags stripped and
entities decoded, so a claim broken across lines or interrupted by an `<a>`
still matches. It asserts:

- **retired claims stay retired** — each with a recorded reason, so a future
  editor hitting a failure can judge it rather than route around it;
- **corrections stay present** — the mirror case, where an unrelated rewrite
  silently drops a nuance;
- **the three-view arc stays consistent** — §147 (geometry), §152 (decoding) and
  §157 (algebra) each carry the shared note linking all three.

Both guards have been verified against deliberately reintroduced regressions,
not just observed to pass.

---

## Extending

As other exhibits' logic is pulled out of their IIFEs, give each a sibling
`*.test.js` and register it in `tests/run-all.js` and the `test:foundations`
script. The pattern: exhibit HTML handles rendering and events, a `.js` module
handles maths, a `.test.js` proves the maths.

Then add the exhibit to the `EXHIBITS` list in `exhibit-interaction.test.js`
(the completeness check will fail until you do), and if it makes a claim that
took care to get right, add it to `foundations-claims.test.js` with the reason
written down.
