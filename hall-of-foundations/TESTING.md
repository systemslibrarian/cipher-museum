# Hall of Foundations — testable logic

The mathematical core of the interactive exhibits is decoupled from the DOM so
it can be unit-tested and fuzzed in CI, independent of any rendering.

## Modules

- `lattice-math.js` — pure functions shared by `lattices-svp.html` (SVP) and
  `closest-vector.html` (CVP / LWE): `shortestVector`, `closestPoint`,
  `babaiRound`, `lweRecover`, `babaiIsCorrect`, `det2`. No DOM references; it
  exports to `window.LatticeMath` in the browser and `module.exports` in Node.

## Running the tests

```bash
npm run test:foundations          # both modules, from the repo root
node hall-of-foundations/lattice-math.test.js
node hall-of-foundations/crypto-algebra.test.js
```

Exits non-zero on any failure. Both tests are registered in `tests/run-all.js`,
so they run as part of `npm test` and the repo's CI workflow
(`.github/workflows/ci.yml`). Coverage includes the good/bad-basis behaviour,
the LWE noise threshold, and edge cases — notably a **degenerate (det = 0)
basis**, the lattice analogue of the point-at-infinity case, which must return
`null` rather than throw.

## Extending

As other exhibits' logic is pulled out of their IIFEs (e.g. `powmod` from
Euler/Fermat, `addFp` from Finite Fields), give each a sibling `*.test.js` and
add a line to the workflow. The pattern: exhibit HTML handles rendering and
events; a `.js` module handles math; a `.test.js` proves the math.
