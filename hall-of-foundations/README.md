# Hall of Foundations — Cipher Museum

An interactive wing on the mathematics *under* cryptography: the number theory,
hardness assumptions, and structures that key exchanges, signatures, and
post-quantum schemes stand on. Foundations, not deployable primitives — you
stand on every one of these when you generate a key, but never call them
directly.

Pure static HTML / CSS / vanilla JS with inline SVG. No build step. Pages use
the museum's shared chrome (`../css/museum.css`, `../js/nav.js`), so serve or
open them from the repo root.

## Contents

**Index**
- `index.html` — the wing landing page, grouped into four territories.

**The number theory ECC & RSA rest on**
- `finite-fields.html` (§142) — 𝔽ₚ; the EC point set as a scatter, discrete-log walk
- `modular-arithmetic.html` (§143) — clock arithmetic, primitive roots
- `prime-number-theorem.html` (§144) — π(x) ~ x/ln x; RSA keygen density
- `euler-fermat.html` (§145) — the theorem that makes RSA decryption undo encryption

**Hardness assumptions**
- `one-way-function.html` (§146) — multiply vs factor
- `lattices-svp.html` (§147) — shortest vector; good vs bad basis
- `closest-vector.html` (§152) — CVP + an LWE noise slider (ML-KEM decryption)
- `reduction.html` (§148) — provable security / "as hard as factoring"

**Structures the protocols assume**
- `group-theory.html` (§149) — cyclic groups, generators, order
- `elliptic-curves-real.html` (§150) — the group law, drawn by hand
- `entropy.html` (§151) — Shannon entropy, perfect secrecy, key length

**Post-quantum & advanced structures**
- `polynomial-rings.html` (§153) — R_q = ℤ_q[X]/(Xⁿ+1); the structure inside ML-KEM / ML-DSA
- `random-oracle.html` (§154) — the avalanche effect; Fiat–Shamir → signatures
- `interpolation.html` (§155) — k points fix a curve; Shamir's Secret Sharing
- `pairings.html` (§156) — e(aP,bQ) = e(P,Q)ᵃᵇ; the zk-SNARK identity

**Companion**
- `modularity-exhibit.html` (§141) — "The Ground Beneath the Curve": the
  modularity theorem and the number theory ECC inherits.

## Shared assets

- `foundations.css` — the wing's component layer, built on the museum's
  Smithsonian Dark / Scholarly Gold tokens in `css/museum.css` (loaded first
  on every page). The wing's original ink-on-vellum palette names survive as
  semantic aliases mapped onto museum tokens.
- `lattice-math.js` / `crypto-algebra.js` — pure, DOM-free math modules powering
  the lattice and post-quantum exhibits, exported for both browser and Node.

## Tests & CI

The math is decoupled from rendering so it can be verified independently. See
`TESTING.md`. Run locally:

```bash
npm run test:foundations       # from the repo root — runs both modules
```

Both tests are registered in `tests/run-all.js`, so `npm test` and the repo's
CI workflow (`.github/workflows/ci.yml`) run them on every push and PR.

## Notes on fidelity

- The pairing exhibit uses a multiplicative *toy model* of the target group to
  keep the arithmetic legible; it demonstrates the bilinearity identity
  faithfully, not a full Weil/Tate pairing.
- Exhibit numbers (§141–156) follow the museum's existing count: the Complete
  Cipher Index on the museum map ends at exhibit 140, and this wing continues
  from §141.
- Exhibits share the museum's dark/gold design system: `css/museum.css`
  provides tokens, typography, nav, and footer; `foundations.css` styles the
  wing's exhibit components on top of it. The wing is linked from the
  entrance, museum map, mobile nav drawer, sitemap, and site search.
