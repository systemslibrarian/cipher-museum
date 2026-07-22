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
- `learning-with-errors.html` (§157) — t = As + e; the algebra ML-KEM and ML-DSA are actually keyed on

**Companion**
- `modularity-exhibit.html` (§141) — "The Ground Beneath the Curve": the
  modularity theorem and the number theory ECC inherits.

## Shared assets

- `foundations.css` — the wing's component layer, built on the museum's
  Smithsonian Dark / Scholarly Gold tokens in `css/museum.css` (loaded first
  on every page). The wing's original ink-on-vellum palette names survive as
  semantic aliases mapped onto museum tokens.
- `lattice-math.js` / `lwe-math.js` / `crypto-algebra.js` — pure, DOM-free math modules powering
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
- Exhibit numbers (§141–157) follow the museum's existing count: the Complete
  Cipher Index on the museum map ends at exhibit 140, and this wing continues
  from §141.
- Exhibits share the museum's dark/gold design system: `css/museum.css`
  provides tokens, typography, nav, and footer; `foundations.css` styles the
  wing's exhibit components on top of it. The wing is linked from the
  entrance, museum map, mobile nav drawer, sitemap, and site search.

## Where each exhibit meets the museum

A link-topology pass (`foundations-links.test.js`) measured how each exhibit
connects to the rest of the museum, and found three teaching the mathematics
under primitives the museum did not yet exhibit. Those three applications were
subsequently built, so every foundation now has somewhere to lead:

| Exhibit | Teaches | Applied in |
| --- | --- | --- |
| §142 Finite Fields | arithmetic mod a prime | AES, ECDSA |
| §143 / §149 Modular Arithmetic, Group Theory | cyclic groups and generators | Diffie-Hellman, ECDSA, zero-knowledge proofs |
| §144 / §145 Prime Number Theorem, Euler & Fermat | prime density, the RSA congruence | RSA |
| §147 / §152 / §157 lattice arc | SVP, decoding, `t = As + e` | the Modern Cryptography wing (ML-KEM, ML-DSA) |
| §150 Elliptic Curves over ℝ | the chord-and-tangent group law | **§158 ECDSA** |
| §151 Information & Entropy | Shannon entropy | the one-time pad, Vernam, §159 |
| §154 The Random Oracle | avalanche, Fiat–Shamir | SHA-256, §160 |
| §155 Polynomial Interpolation | *k* points fix a degree-(*k*−1) curve | **§159 Shamir's Secret Sharing** |
| §156 Bilinear Pairings | e(aP,bQ) = e(P,Q)^ab | **§160 Zero-Knowledge Proofs** |

`foundations-links.test.js` asserts both directions for these pairs: the
application links back to the foundation, and the foundation points forward to
the application. Neither can be dropped by an unrelated edit without a failure.

The interim answer, before those exhibits existed, was to link the three
orphans to neighbouring *foundations* so no page was a dead end. The wrong
answer would have been to point them at `modern.html` and call the navigation
complete — that page has no section anchors and mentioned zero-knowledge,
threshold cryptography and BLS zero times between them. A link there would have
satisfied a link checker while teaching nothing, and would have erased the
signal that the exhibits were missing in the first place.
