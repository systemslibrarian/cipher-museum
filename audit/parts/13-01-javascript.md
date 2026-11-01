# javascript appendix 1

Snapshot: `3a2de507d2df3cca40f3535c6d18548299b25bc0`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

## JavaScript — hall-of-foundations/crypto-algebra.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `hall-of-foundations/crypto-algebra.js`
- Served SHA-256: `d92a9a4e176c60c95bf6c2848a47ac0dfe2bad8a92dabc802508ea874811b704`
- Readable-source SHA-256: `d92a9a4e176c60c95bf6c2848a47ac0dfe2bad8a92dabc802508ea874811b704`


```javascript
/* ==========================================================================
   crypto-algebra.js — pure logic for Exhibits 153-156, no DOM.
   Polynomial rings (ML-KEM/ML-DSA structure), Lagrange interpolation
   (Shamir), and the bilinearity identity for pairings.
   Exposed on window.CryptoAlgebra (browser) and module.exports (Node/CI).
   ========================================================================== */
(function (root) {
  "use strict";

  function mod(n, q) { return ((n % q) + q) % q; }

  // Modular inverse of a mod p (p prime), by extended search. Small p only.
  function modInv(a, p) {
    a = mod(a, p);
    for (let t = 1; t < p; t++) if (mod(a * t, p) === 1) return t;
    return null;
  }

  // ---- Multiplicative order & primitive roots (Exhibit 143) ----
  // The successive powers g^1..g^(p-1) mod p; g is a primitive root when
  // they visit every nonzero residue.
  function powersOf(g, p) {
    const out = []; let x = 1;
    for (let i = 1; i < p; i++) { x = mod(x * g, p); out.push(x); }
    return out;
  }
  function isPrimitiveRoot(g, p) {
    return new Set(powersOf(g, p)).size === p - 1;
  }

  // ---- Polynomial ring R_q = Z_q[X] / (X^n + 1) ----
  // Negacyclic convolution: X^n = -1, so a term of degree k >= n wraps to
  // degree k-n with a sign flip. Coefficients reduced mod q.
  function ringMul(a, b, n, q) {
    const c = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let k = i + j, sign = 1;
        if (k >= n) { k -= n; sign = -1; }
        c[k] = mod(c[k] + sign * a[i] * b[j], q);
      }
    }
    return c;
  }

  function ringAdd(a, b, n, q) {
    const c = new Array(n).fill(0);
    for (let i = 0; i < n; i++) c[i] = mod((a[i] || 0) + (b[i] || 0), q);
    return c;
  }

  // ---- Lagrange interpolation (Shamir's Secret Sharing) ----
  // Evaluate the unique polynomial through the given points at x = 0,
  // all arithmetic mod p. points: [[x,y], ...]. Returns the secret f(0), or null when a denominator has no inverse.
  function lagrangeAtZero(points, p) {
    let secret = 0;
    for (let i = 0; i < points.length; i++) {
      let num = 1, den = 1;
      for (let j = 0; j < points.length; j++) {
        if (i === j) continue;
        num = mod(num * (-points[j][0]), p);
        den = mod(den * (points[i][0] - points[j][0]), p);
      }
      const inv = modInv(den, p);
      if (inv === null) return null;
      secret = mod(secret + points[i][1] * mod(num * inv, p), p);
    }
    return secret;
  }

  // Evaluate a polynomial (coeffs low->high) at x, mod p.
  function polyEval(coeffs, x, p) {
    let acc = 0;
    for (let i = coeffs.length - 1; i >= 0; i--) acc = mod(acc * x + coeffs[i], p);
    return acc;
  }

  // ---- Pairing bilinearity (multiplicative model) ----
  function powmod(g, e, m) {
    let r = 1; g = mod(g, m);
    while (e > 0) { if (e & 1) r = mod(r * g, m); g = mod(g * g, m); e = Math.floor(e / 2); }
    return r;
  }
  // Verify e(aP, bQ) = e(P, Q)^(ab) in a toy multiplicative target group.
  // base plays the role of e(P,Q). Returns { viaProduct, viaChain, equal }.
  function pairingCheck(a, b, base, m) {
    const viaProduct = powmod(base, a * b, m);          // e(P,Q)^(ab)
    const viaChain = powmod(powmod(base, a, m), b, m);   // (e(P,Q)^a)^b
    return { viaProduct, viaChain, equal: viaProduct === viaChain };
  }

  const api = {
    mod, modInv,
    powersOf, isPrimitiveRoot,
    ringMul, ringAdd,
    lagrangeAtZero, polyEval,
    powmod, pairingCheck
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CryptoAlgebra = api;

})(typeof self !== "undefined" ? self : this);
```


## JavaScript — hall-of-foundations/ec-math.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `hall-of-foundations/ec-math.js`
- Served SHA-256: `e73bdc8f38c207be1b4ea73b73809404714dc1d3100e1108c673be6d929b451f`
- Readable-source SHA-256: `e73bdc8f38c207be1b4ea73b73809404714dc1d3100e1108c673be6d929b451f`


```javascript
/* ==========================================================================
   ec-math.js — pure elliptic-curve logic for Exhibits 142 & 150, no DOM.
   Curve arithmetic over F_p (point enumeration, chord-and-tangent group
   law) and over the reals (the hand-drawn construction in Exhibit 150).
   Exposed on window.ECMath (browser) and module.exports (Node/CI).
   ========================================================================== */
(function (root) {
  "use strict";

  function mod(n, p) { return ((n % p) + p) % p; }

  // Modular inverse of k mod p (p prime), by extended search. Small p only.
  function modInv(k, p) {
    k = mod(k, p);
    for (let t = 1; t < p; t++) if (mod(k * t, p) === 1) return t;
    return null;
  }

  // ---- The curve over F_p: y^2 = x^3 + ax + b ----
  function ecRhs(x, a, b, p) { return mod(x * x * x + a * x + b, p); }

  // All affine points (the point at infinity is represented as null).
  function ecPoints(a, b, p) {
    const pts = [];
    for (let x = 0; x < p; x++) {
      const r = ecRhs(x, a, b, p);
      for (let y = 0; y < p; y++) if (mod(y * y, p) === r) pts.push([x, y]);
    }
    return pts;
  }

  // Chord-and-tangent addition over F_p. null is the point at infinity.
  function ecAdd(P, Q, a, p) {
    if (P === null) return Q;
    if (Q === null) return P;
    if (P[0] === Q[0] && mod(P[1] + Q[1], p) === 0) return null;
    let m;
    if (P[0] === Q[0] && P[1] === Q[1]) {
      m = mod(mod(3 * P[0] * P[0] + a, p) * modInv(mod(2 * P[1], p), p), p);
    } else {
      m = mod(mod(Q[1] - P[1], p) * modInv(mod(Q[0] - P[0], p), p), p);
    }
    const x3 = mod(m * m - P[0] - Q[0], p);
    const y3 = mod(m * (P[0] - x3) - P[1], p);
    return [x3, y3];
  }

  function ecIsOnCurve(P, a, b, p) {
    return P === null || mod(P[1] * P[1], p) === ecRhs(P[0], a, b, p);
  }

  // ---- The curve over the reals (Exhibit 150) ----
  function curveY2(x, a, b) { return x * x * x + a * x + b; }

  // The group law drawn by hand: line through P and Q, third intersection,
  // reflect across the x-axis. Returns { third, sum, slope }.
  function ecAddReal(P, Q, a) {
    // A vertical chord (including a vertical tangent at y=0) reaches O.
    if (Math.abs(P[0] - Q[0]) < 1e-9 && Math.abs(P[1] + Q[1]) < 1e-9) {
      return { third: null, sum: null, slope: null };
    }
    let m;
    if (Math.abs(P[0] - Q[0]) < 1e-9 && Math.abs(P[1] - Q[1]) < 1e-9) {
      m = (3 * P[0] * P[0] + a) / (2 * P[1]);
    } else {
      m = (Q[1] - P[1]) / (Q[0] - P[0]);
    }
    const x3 = m * m - P[0] - Q[0];
    const y3 = m * (P[0] - x3) - P[1];
    return { third: [x3, -y3], sum: [x3, y3], slope: m };
  }

  // Smoothness: the discriminant -16(4a^3 + 27b^2) must be nonzero,
  // or the curve has a cusp/node and the group law breaks down.
  function ecIsSmooth(a, b) { return 4 * a * a * a + 27 * b * b !== 0; }

  const api = {
    mod, modInv,
    ecRhs, ecPoints, ecAdd, ecIsOnCurve,
    curveY2, ecAddReal, ecIsSmooth
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ECMath = api;

})(typeof self !== "undefined" ? self : this);
```


## JavaScript — hall-of-foundations/lattice-math.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `hall-of-foundations/lattice-math.js`
- Served SHA-256: `de63f8ec661a052042f9810c198c2eb809eac0125407103726da38c93240da06`
- Readable-source SHA-256: `de63f8ec661a052042f9810c198c2eb809eac0125407103726da38c93240da06`


```javascript
/* ==========================================================================
   lattice-math.js — pure cryptographic-foundations logic, no DOM
   Shared by lattices-svp.html and closest-vector.html.
   Every function here is deterministic and unit-testable in isolation:
   feed it numbers, get numbers back. UI/SVG code lives in the pages.
   Exposed on window.LatticeMath (browser) and module.exports (Node/CI).
   ========================================================================== */
(function (root) {
  "use strict";

  // Determinant of the 2x2 basis [b1 b2] (columns). |det| = covolume = points per unit area^-1.
  function det2(b1, b2) {
    return b1[0] * b2[1] - b1[1] * b2[0];
  }

  // Shortest nonzero lattice vector by exhaustive search over |i|,|j| <= R.
  // Returns { x, y, i, j, len } or null if the lattice is degenerate.
  function shortestVector(b1, b2, R) {
    if (det2(b1, b2) === 0) return null;
    R = R || 7;
    var best = Infinity, bv = null;
    for (var i = -R; i <= R; i++) {
      for (var j = -R; j <= R; j++) {
        if (i === 0 && j === 0) continue;
        var x = i * b1[0] + j * b2[0];
        var y = i * b1[1] + j * b2[1];
        var n = x * x + y * y;
        if (n < best) { best = n; bv = { x: x, y: y, i: i, j: j, len: Math.sqrt(n) }; }
      }
    }
    return bv;
  }

  // True closest lattice point to target t={x,y}, exhaustive over the STANDARD
  // integer lattice (the canonical lattice both bases describe). Returns {x,y,dist}.
  function closestPoint(t, R) {
    R = R || 8;
    var best = Infinity, bv = null;
    for (var i = -R; i <= R; i++) {
      for (var j = -R; j <= R; j++) {
        var d = (i - t.x) * (i - t.x) + (j - t.y) * (j - t.y);
        if (d < best) { best = d; bv = { x: i, y: j, dist: Math.sqrt(d) }; }
      }
    }
    return bv;
  }

  // Babai's rounding: express t in the given basis, round each coordinate.
  // Returns the lattice point { x, y, i, j } the rounding lands on.
  // Correct when the basis is short & near-orthogonal; misfires when skewed.
  function babaiRound(t, b1, b2) {
    var det = det2(b1, b2);
    if (det === 0) return null;
    var a = (t.x * b2[1] - t.y * b2[0]) / det;
    var b = (b1[0] * t.y - b1[1] * t.x) / det;
    var ai = Math.round(a), bi = Math.round(b);
    return { x: ai * b1[0] + bi * b2[0], y: ai * b1[1] + bi * b2[1], i: ai, j: bi };
  }

  // LWE round-trip: hide lattice point v={x,y} under noise vector e={x,y},
  // then try to recover v by Babai-rounding (v+e) in the given basis.
  // Returns { recovered:{x,y,i,j}, ok:boolean, noisyTarget:{x,y} }.
  function lweRecover(v, e, b1, b2) {
    var t = { x: v.x + e.x, y: v.y + e.y };
    var r = babaiRound(t, b1, b2);
    return { recovered: r, ok: (r !== null && r.x === v.x && r.y === v.y), noisyTarget: t };
  }

  // Whether Babai in this basis returns the TRUE closest point for target t.
  function babaiIsCorrect(t, b1, b2) {
    var r = babaiRound(t, b1, b2);
    var c = closestPoint(t);
    return r !== null && r.x === c.x && r.y === c.y;
  }

  var api = {
    det2: det2,
    shortestVector: shortestVector,
    closestPoint: closestPoint,
    babaiRound: babaiRound,
    lweRecover: lweRecover,
    babaiIsCorrect: babaiIsCorrect
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LatticeMath = api;

})(typeof self !== "undefined" ? self : this);
```


## JavaScript — hall-of-foundations/lwe-math.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `hall-of-foundations/lwe-math.js`
- Served SHA-256: `453e6eaf8beafe07331e861efea977075be364c20a03dfc82ad0920dbc5c81d5`
- Readable-source SHA-256: `453e6eaf8beafe07331e861efea977075be364c20a03dfc82ad0920dbc5c81d5`


```javascript
/* ==========================================================================
   lwe-math.js — Learning With Errors: pure logic, no DOM.
   Backs learning-with-errors.html (§157).

   Implements the Regev-style construction that ML-KEM descends from:
     public key : (A, t) with t = A·s + e   (mod q)
     secret key : the short vector s
   Encryption hides a bit behind a large shared term that only s can cancel.

   Every function is deterministic — randomness is injected by the caller as
   explicit vectors, so the CI tests can replay exact cases.
   Exposed on window.LWEMath (browser) and module.exports (Node/CI).
   ========================================================================== */
(function (root) {
  "use strict";

  // Least non-negative residue. JS % is a remainder, not a modulus.
  function mod(a, q) {
    return ((a % q) + q) % q;
  }

  // Centered representative in (-q/2, q/2]. This is the value that matters for
  // noise: 96 mod 97 is "-1 of noise", not "96 of noise".
  function center(a, q) {
    var r = mod(a, q);
    return r > q / 2 ? r - q : r;
  }

  // Modular inverse via extended Euclid. Returns null when gcd(a,q) != 1.
  function modInv(a, q) {
    var t = 0, newT = 1, r = q, newR = mod(a, q);
    while (newR !== 0) {
      var quot = Math.floor(r / newR);
      var tmp = t - quot * newT; t = newT; newT = tmp;
      tmp = r - quot * newR; r = newR; newR = tmp;
    }
    if (r > 1) return null;
    return mod(t, q);
  }

  function dot(a, b, q) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * b[i];
    return mod(s, q);
  }

  function matVec(A, v, q) {
    var out = [];
    for (var i = 0; i < A.length; i++) out.push(dot(A[i], v, q));
    return out;
  }

  function transpose(A) {
    var out = [];
    for (var j = 0; j < A[0].length; j++) {
      var row = [];
      for (var i = 0; i < A.length; i++) row.push(A[i][j]);
      out.push(row);
    }
    return out;
  }

  function addVec(a, b, q) {
    var out = [];
    for (var i = 0; i < a.length; i++) out.push(mod(a[i] + b[i], q));
    return out;
  }

  // ---- the LWE sample ------------------------------------------------------
  // t = A·s + e (mod q). With e = 0 this is an ordinary linear system and
  // Gaussian elimination reads s straight off. The error is the whole defence.
  function lweSample(A, s, e, q) {
    return addVec(matVec(A, s, q), e, q);
  }

  // ---- solving -------------------------------------------------------------
  // Exact Gaussian elimination mod prime q. Returns the unique solution to
  // A·x = b, or null if A is singular. Never sees the error term — that is
  // precisely the point: fed a noisy t it returns a confident, wrong answer.
  function gaussianSolve(A, b, q) {
    var n = A.length, i, j, k;
    var M = [];
    for (i = 0; i < n; i++) {
      var row = [];
      for (j = 0; j < n; j++) row.push(mod(A[i][j], q));
      row.push(mod(b[i], q));
      M.push(row);
    }
    for (i = 0; i < n; i++) {
      var piv = -1;
      for (k = i; k < n; k++) if (M[k][i] !== 0) { piv = k; break; }
      if (piv < 0) return null;
      var tmp = M[i]; M[i] = M[piv]; M[piv] = tmp;
      var inv = modInv(M[i][i], q);
      if (inv === null) return null;
      for (j = i; j <= n; j++) M[i][j] = mod(M[i][j] * inv, q);
      for (k = 0; k < n; k++) {
        if (k === i || M[k][i] === 0) continue;
        var f = M[k][i];
        for (j = i; j <= n; j++) M[k][j] = mod(M[k][j] - f * M[i][j], q);
      }
    }
    var x = [];
    for (i = 0; i < n; i++) x.push(M[i][n]);
    return x;
  }

  // ---- encryption ----------------------------------------------------------
  // Encrypt one bit under (A, t). The caller supplies the ephemeral randomness
  // r and the two error terms, so tests can pin down exact ciphertexts.
  //   u = Aᵀ·r + e1
  //   v = t·r  + e2 + m·floor(q/2)
  function encryptBit(A, t, m, r, e1, e2, q) {
    var u = addVec(matVec(transpose(A), r, q), e1, q);
    var v = mod(dot(t, r, q) + e2 + m * Math.floor(q / 2), q);
    return { u: u, v: v };
  }

  // Decrypt with the short secret s. The large term sᵀAᵀr appears in both v
  // and sᵀu and cancels, leaving m·floor(q/2) plus accumulated noise.
  // Returns the centered residual, the recovered bit, and the noise that
  // survived — so a page can show how much of the budget was spent.
  // Distance between two residues measured around the ring, not along the line:
  // 1 and q-1 are two apart, not q-2 apart.
  function ringDist(a, b, q) {
    var d = mod(a - b, q);
    return Math.min(d, q - d);
  }

  function decryptBit(u, v, s, q) {
    var raw = mod(v - dot(s, u, q), q);
    var half = Math.floor(q / 2);
    // Round to whichever ideal — 0 or floor(q/2) — is actually nearer in the
    // ring. A fixed |centered| > q/4 threshold is the usual shorthand, but with
    // an odd q the two ideals are not symmetrically spaced and the shorthand
    // misdecodes at the boundary. Measuring both distances is exact.
    var d0 = ringDist(raw, 0, q), d1 = ringDist(raw, half, q);
    var bit = d1 < d0 ? 1 : 0;
    var noise = center(raw - bit * half, q);
    return { raw: raw, centered: center(raw, q), bit: bit, noise: noise, d0: d0, d1: d1 };
  }

  // The safe bound: while the accumulated error stays STRICTLY below this,
  // decryption is guaranteed correct. At or above it, correctness depends on
  // which side of the ring the error fell — see the tests for the exact claim.
  function noiseBudget(q) {
    return Math.floor(q / 4);
  }

  // The error that actually accumulated, measured against the bit that was
  // SENT. decryptBit's own `noise` is measured against the bit it decoded, so
  // on a failure it reports a small number — correct for what it means, and
  // misleading if you read it as "how much noise was there". Callers that know
  // the true message should use this instead. For odd q, exact boundary
  // behavior also depends on the sent bit, noise direction and tie rule.
  function residualNoise(raw, m, q) {
    return center(raw - m * Math.floor(q / 2), q);
  }

  var api = {
    mod: mod,
    center: center,
    modInv: modInv,
    dot: dot,
    matVec: matVec,
    transpose: transpose,
    addVec: addVec,
    lweSample: lweSample,
    gaussianSolve: gaussianSolve,
    encryptBit: encryptBit,
    decryptBit: decryptBit,
    noiseBudget: noiseBudget,
    residualNoise: residualNoise,
    ringDist: ringDist
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LWEMath = api;

})(typeof self !== "undefined" ? self : this);
```


## JavaScript — js/artifact-cards-data.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/artifact-cards-data.min.js`
- Served SHA-256: `7c06bbd8f43c5e15c87216234017f1c00af20b41f55355ccc7c722e8b12b9687`
- Readable-source SHA-256: `7932b5417c0acaf74a03a35cbd20c3bd489adac964942634e6bd82536cb14f30`


```javascript
'use strict';
(function(global){
  global.__ARTIFACT_CARDS__ = {
  "cards": {
    "adfgvx": {
      "name": "ADFGVX Cipher",
      "hall": "V",
      "era": "WWI · June 1918",
      "family": "Military and Field Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "6×6 Polybius square + columnar key",
      "keyIdea": "ADFGVX combined a 6×6 substitution square with columnar transposition. Painvin’s June 1918 solutions exploited particular traffic and keys, not every later message automatically.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Painvin recovered keys from German traffic in June 1918.",
      "modernLesson": "Layered cipher rounds"
    },
    "adfgx": {
      "name": "ADFGX Cipher",
      "hall": "V",
      "era": "WWI · March 1918",
      "family": "Military and Field Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Polybius key square + columnar key",
      "keyIdea": "Germany’s ADFGX field cipher appeared in March 1918; Painvin obtained solutions in April. Its square-plus-transposition construction required continuing key recovery.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Painvin and other Allied analysts used repeated traffic, statistics and transposition analysis in 1918.",
      "modernLesson": "Compare fractionation and transposition with modern round structures"
    },
    "aeneas-tacticus": {
      "name": "Aeneas Tacticus Water-Clock Signal Code",
      "hall": "I",
      "era": "Classical Greece · ~350 BCE",
      "family": "Ancient and Foundational Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Aeneas’s water-clock signaling, preserved in Polybius: synchronized vessels selected preset military messages, not letters of an alphabet.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Synchronization enables signaling; it does not itself provide secrecy"
    },
    "aes": {
      "name": "AES (Advanced Encryption Standard)",
      "hall": "XI",
      "era": "Modern &middot; 2001",
      "family": "Modern Cryptography",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "AES, standardized in 2001, is a widely deployed block cipher. No practical key-recovery attack is known against correctly used full-round AES.",
      "trust": {
        "key": "secure",
        "text": "Secure (Modern)",
        "description": "Still considered secure when used correctly with modern key handling."
      },
      "securityFailure": "See the exhibit’s documented attacks and limitations.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "affine": {
      "name": "Affine Cipher E(x) = a·x + b mod 26",
      "hall": "II",
      "era": "Antiquity → 1800s · math-age",
      "family": "Substitution",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Pair (a,b) — a coprime to 26 → 12·26 = 312 keys",
      "keyIdea": "The affine cipher — a single linear formula E(x)=a·x+b mod 26 that generalises Caesar (a=1) and Atbash (a=25, b=25). Just 312 keys; trivially broken.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "See the exhibit’s documented attacks and limitations.",
      "modernLesson": "This small affine keyspace and visible language patterns are insecure"
    },
    "agnes-driscoll": {
      "name": "Agnes Meyer Driscoll",
      "hall": "X",
      "era": "Interwar & WWII · USA",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Agnes Meyer Driscoll helped develop U.S. naval cryptanalysis and trained later analysts. Her work included Japanese naval codes, early JN-25 and cipher-machine analysis.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "alberti-disk": {
      "name": "Alberti Cipher Disk",
      "hall": "VII",
      "era": "Renaissance · 1467",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Physical rotating disk (two alphabets)",
      "keyIdea": "Alberti’s fifteenth-century cipher disk illustrates changing substitutions using two alphabets. The exhibit distinguishes historical instructions from a regular-step teaching model.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Index of Coincidence · Frequency analysis",
      "modernLesson": "Physical key material → rotor machines"
    },
    "amharic-ge-ez-ciphers": {
      "name": "Geʼez Script and a Substitution Model",
      "hall": "I",
      "era": "East Africa · teaching model",
      "family": "Modern substitution teaching model",
      "region": "Ethiopian and Eritrean manuscript context",
      "usedBy": "Museum learners; no historical cipher deployment established",
      "keyType": "Keyword-seeded permutation of Latin A–Z",
      "keyIdea": "Explore Geʼez manuscript heritage alongside a modern Latin-letter substitution exercise, with no historical cipher attribution claimed for the model.",
      "trust": {
        "key": "educational",
        "text": "Educational",
        "description": "A didactic construction for learning cryptographic concepts, not for security."
      },
      "securityFailure": "Illustrative Latin-letter substitution model; no identified manuscript authenticates this as a particular Geʽez monastic cipher.",
      "modernLesson": "An unfamiliar writing system is not itself a cipher"
    },
    "amsco": {
      "name": "AMSCO Transposition",
      "hall": "IV",
      "era": "American Cryptogram Association specification",
      "family": "Transposition",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Permutation of column ranks; first cell length",
      "keyIdea": "AMSCO from the American Cryptogram Association specification: alternate one-letter and two-letter cells, read keyed columns, and reconstruct an incomplete final row.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Variable-cell transposition preserves frequencies and is susceptible to probable-word and scored permutation search.",
      "modernLesson": "Decryption must reconstruct cell lengths before filling columns"
    },
    "arabic-nomenclators": {
      "name": "Arabic Nomenclators",
      "hall": "I",
      "era": "Abbasid Caliphate · ~850 CE",
      "family": "Ancient and Foundational Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Arabic cryptanalytic scholarship and a teaching model of nomenclators: frequency analysis, codewords, and the need to identify a particular historical key.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Broken (by its own inventors)",
      "modernLesson": "Cryptanalysis is the indispensable counterweight to cryptography"
    },
    "argenti": {
      "name": "Argenti Family Cipher Vatican papal nomenclators · 1500s–1600s",
      "hall": "II",
      "era": "Renaissance Italy · 1500s–1600s",
      "family": "Substitution",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Giovanni Battista Argenti and his nephew Matteo documented papal nomenclators, homophones, nulls and cryptanalytic methods in Renaissance Italy.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "See the exhibit’s documented attacks and limitations.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "arnold-andre": {
      "name": "Arnold–André Book Cipher Book codes · 1779–1780",
      "hall": "V",
      "era": "American Revolution · 1779–1780",
      "family": "Military and Field Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Arnold and André used changing book codes in their 1779–1780 correspondence, including Blackstone’s Commentaries and dictionary schemes. Captured West Point documents exposed the plot.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Compromised by capture (1780)",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "atbash": {
      "name": "Atbash",
      "hall": "I",
      "era": "Ancient · ~500 BC",
      "family": "Ancient and Foundational Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "None (fixed reflection)",
      "keyIdea": "Atbash reverses the Hebrew alphabet and appears in Jeremiah’s Sheshach references. This exhibit demonstrates a modern, self-inverse A–Z adaptation.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Inspection (it is its own inverse)",
      "modernLesson": "Ciphers without keys offer no security"
    },
    "autokey": {
      "name": "Autokey",
      "hall": "III",
      "era": "Renaissance · 1586",
      "family": "Polyalphabetic",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Short keyword, then plaintext itself extends the key",
      "keyIdea": "Plaintext autokey extends a primer with message letters. It removes a fixed repeating keyword but retains exploitable language structure and error propagation.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Crib propagation and language-scored searches; ordinary repeating-key Kasiski analysis does not apply directly.",
      "modernLesson": "Self-keyed schemes still leak: the key is no longer random once it carries plaintext statistics"
    },
    "babington": {
      "name": "The Babington Plot Cipher",
      "hall": "II",
      "era": "Elizabethan · 1586",
      "family": "Substitution",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Teaching model: 23 letter symbols + 36 codewords + 4 nulls + 1 \"doubleth\"",
      "keyIdea": "The 1586 Babington Plot: intercepted nomenclator letters, a forged postscript, and the difference between compromised keys and an insecure transport channel.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Thomas Phelippes, working for Sir Francis Walsingham · within days of interception",
      "modernLesson": "Cryptography is an operational system, not just an algorithm — channel security and forgery resistance matter"
    },
    "bach-motif": {
      "name": "Bach's B-A-C-H Motif",
      "hall": "XIII",
      "era": "Baroque Germany · 1750",
      "family": "Ciphers in Culture",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "The four notes B♭ – A – C – B♮ spell 'BACH' in German musical notation — a self-signature Bach embedded in his final unfinished fugue.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "bacon": {
      "name": "Bacon's Cipher",
      "hall": "VIII",
      "era": "1605",
      "family": "Puzzle and Cultural Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "5-bit binary (A/B patterns)",
      "keyIdea": "Bacon’s biliteral alphabet represents letters with patterns of two forms and can hide them in a carrier. Binary representation is distinct from a direct historical origin for ASCII.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Pattern recognition · Statistical analysis of A/B distribution",
      "modernLesson": "Two-symbol representation and steganography"
    },
    "bazeries": {
      "name": "Bazeries Cipher",
      "hall": "V",
      "era": "1890s · France",
      "family": "Military and Field Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Numeric key; substitution plus group reversal",
      "keyIdea": "Explore the Bazeries hand-cipher procedure and a simplified browser model, distinguished from his separate mechanical cipher cylinder.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Layered frequency analysis",
      "modernLesson": "Key-controlled multi-layer operations"
    },
    "beale": {
      "name": "Beale Ciphers",
      "hall": "XII",
      "era": "19th Century · published 1885",
      "family": "Unsolved Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Beale ciphers — three numerical ciphers published in an 1885 Lynchburg pamphlet, said to have been written in the 1820s and to point to a Virginia treasure. Only #2 was solved (Declaration of Independence key); #1 and #3 unsolved.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Unsolved (Beale 1 & 3)",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "beaufort": {
      "name": "Beaufort Cipher",
      "hall": "III",
      "era": "Victorian · 1857",
      "family": "Polyalphabetic",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Repeating keyword",
      "keyIdea": "Beaufort cipher (1857) — Sir Francis Beaufort's reciprocal Vigenère variant where encrypt and decrypt are the same operation. Broken by Kasiski examination.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Kasiski Examination · Index of Coincidence",
      "modernLesson": "Symmetric operations in stream ciphers"
    },
    "beurling": {
      "name": "Arne Beurling",
      "hall": "X",
      "era": "WWII · Sweden",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Arne Beurling’s 1940 reconstruction of the Siemens T52, with assistance and subsequent daily-key recovery distinguished from the initial breakthrough.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "bible-code": {
      "name": "Bible Code — Equidistant Letter Sequences",
      "hall": "VIII",
      "era": "1994 · Refuted 1999",
      "family": "Puzzle and Cultural Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "The Bible Code — equidistant letter sequences (ELS) claimed to hide prophecies in the Hebrew scriptures. McKay et al. (1999) examined experimental flexibility; separate Moby-Dick counterexamples addressed popular prophecy claims.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Searching many alternatives creates opportunities for chance matches; significance depends on the test and selection process"
    },
    "bifid": {
      "name": "Bifid Cipher",
      "hall": "IV",
      "era": "1902",
      "family": "Transposition",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "5×5 keyword square",
      "keyIdea": "Bifid cipher (1902) — Felix Delastelle's fractionation cipher that splits Polybius coordinates, transposes them across a period, and recombines.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Statistical analysis · Hill climbing",
      "modernLesson": "Confusion + diffusion combined"
    },
    "bill-tutte": {
      "name": "Bill Tutte",
      "hall": "X",
      "era": "WWII · Britain",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Bill Tutte and the Research Section inferred the Lorenz structure by early 1942, analysing key material recovered by John Tiltman from a 1941 repeated-key transmission.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "bletchley-park": {
      "name": "Bletchley Park",
      "hall": "X",
      "era": "WWII · 1939–1945",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Bletchley Park was a British wartime codebreaking centre. About 10,000 people worked at the site and associated outstations at peak, contributing to Allied intelligence.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "bombe": {
      "name": "Turing–Welchman Bombe",
      "hall": "VII",
      "era": "1940 · Britain",
      "family": "Cryptanalysis machinery",
      "region": "Britain",
      "usedBy": "Bletchley Park codebreakers and operators",
      "keyType": "Not an encryption system",
      "keyIdea": "Search Enigma settings using crib constraints",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Automation supports analysis; candidate settings still require verification."
    },
    "book-cipher": {
      "name": "Book Cipher",
      "hall": "V",
      "era": "18th–20th c.",
      "family": "Military and Field Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "An agreed-upon book; ciphertext is a list of (page, line, word) or (page, word) coordinates",
      "keyIdea": "Book ciphers use an agreed reference text and indexing rule. Explore historical book codes and distinguish them from the disputed Beale treasure narrative.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Security depends on the book, edition and indexing rule; identifying the source or exploiting context can expose messages.",
      "modernLesson": "Key distribution is the hard part; the underlying primitive can be trivial"
    },
    "cabinet-noir": {
      "name": "Cabinet Noir — Black Chambers of Europe",
      "hall": "X",
      "era": "Europe · 1550–1850",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "The European Black Chambers (cabinets noirs) were government departments that intercepted, deciphered, and resealed diplomatic mail from the 16th through 19th centuries — proto-signals-intelligence agencies.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Postal interception provides an earlier comparison for communications intelligence"
    },
    "caesar": {
      "name": "Caesar Cipher",
      "hall": "I",
      "era": "Ancient Rome",
      "family": "Historical Cryptography",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Shift (1–25)",
      "keyIdea": "Caesar’s recorded shift of three, demonstrated on a modern alphabet. Exhaustive shift search is small; frequency analysis helps rank candidate plaintexts.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Exhaustive shift search; frequency evidence helps rank candidates.",
      "modernLesson": "Substitution and exhaustive key search"
    },
    "cardano-autokey": {
      "name": "Cardano Autokey 1550 historical idea · modern comparison model",
      "hall": "III",
      "era": "Italian Renaissance · 1550",
      "family": "Polyalphabetic",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Single priming letter",
      "keyIdea": "Cardano’s self-keying idea and a modern one-letter-primer comparison model. The demo is not an exact reconstruction of Cardano’s historical procedure.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "The one-letter-primer widget is a modern comparison with Vigenère-style plaintext autokey, not Cardano’s exact procedure.",
      "modernLesson": "Key reuse from the plaintext is not the same as key freshness"
    },
    "cardano-grille": {
      "name": "Cardano Grille 1550 · steganography by template",
      "hall": "IV",
      "era": "Italian Renaissance · 1550",
      "family": "Transposition",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "The grille pattern (positions of the holes)",
      "keyIdea": "Girolamo Cardano's 1550 grille — a card with cut-out windows. Write the secret through the windows; fill the rest with innocuous text; the recipient overlays an identical grille to read.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Weak (steganography, not encryption)",
      "modernLesson": "Hiding a message ≠ encrypting a message"
    },
    "chaocipher": {
      "name": "Chaocipher",
      "hall": "VII",
      "era": "Modern · 1918",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Two scrambled 26-letter alphabets",
      "keyIdea": "Chaocipher (1918) — John F. Byrne's two-disk dynamic cipher. Disclosed in 2010; published known-plaintext and in-depth ciphertext-only attacks recover its keys.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Published key-recovery attacks by Lasry, Rubin, Kopal and Wacker (2016).",
      "modernLesson": "State evolution needs analysis under explicit attack conditions"
    },
    "che-guevara": {
      "name": "Che Guevara’s Checkerboard and Pad",
      "hall": "V",
      "era": "Cold War · 1956–1967",
      "family": "Military and Field Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Checkerboard and secret pad digits",
      "keyIdea": "Che Guevara’s checkerboard and digit-pad communications, distinguished from the VIC cipher and from the museum’s simplified comparison demo.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Historical checkerboard-plus-pad system; the widget compares a condensed VIC model, not Guevara’s historical pad system.",
      "modernLesson": "Key handling is part of communications security"
    },
    "chinese-telegraph": {
      "name": "Chinese Telegraph Code Standard Telegraph Codebook · 1881",
      "hall": "VI",
      "era": "Late Qing → PRC · 1881–1980s",
      "family": "American and Civil War Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Chinese telegraph codebooks map characters to four-digit groups. Public character encoding differs from additional encipherment used to protect some diplomatic and military messages.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "cicada-3301": {
      "name": "Cicada 3301",
      "hall": "XIII",
      "era": "Internet era · 2012–2014",
      "family": "Ciphers in Culture",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "An anonymous 2012–2014 internet recruitment puzzle that combined steganography, classical ciphers, GPS coordinates on physical posters, and a copy of the Liber Primus hand-illustrated in glyphic runes.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "colossus": {
      "name": "Colossus",
      "hall": "VII",
      "era": "1944 · Britain",
      "family": "Cryptanalysis machinery",
      "region": "Britain",
      "usedBy": "Bletchley Park codebreakers and operators",
      "keyType": "Not an encryption system",
      "keyIdea": "Score Lorenz wheel hypotheses using electronic logic and counters",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Automation supports analysis; candidate settings still require verification."
    },
    "columnar": {
      "name": "Columnar Transposition",
      "hall": "IV",
      "era": "19th Century",
      "family": "Transposition",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Column-ordering keyword",
      "keyIdea": "Explore columnar transposition and multiple anagramming: rearrange column strips across three synthetic same-key intercepts and compare a different-key control.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Frequency analysis · Anagramming",
      "modernLesson": "Compare positional permutation with AES ShiftRows"
    },
    "commercial-codebooks": {
      "name": "Commercial Telegraph Codebooks ABC, Bentley’s, Lieber’s · 1870s–1930s",
      "hall": "VI",
      "era": "Victorian → inter-war · 1870s–1930s",
      "family": "American and Civil War Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Commercial telegraph codebooks replaced business phrases with compact code groups. Formats and tariffs varied, and a public codebook did not itself provide secrecy.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "confederate-vigenere": {
      "name": "Confederate Vigenère",
      "hall": "Museum exhibit",
      "era": "Confederate · 1862",
      "family": "Historical Cryptography",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Vigenère keyword (15 letters typical)",
      "keyIdea": "Confederate forces used repeating-key Vigenère ciphers during the Civil War. Union analysts read particular dispatches using language clues and recovered keys.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Union analysts exploited repeated keywords and language patterns.",
      "modernLesson": "Operational security failures"
    },
    "copiale": {
      "name": "Copiale Cipher",
      "hall": "VIII",
      "era": "18th Century · ~1760–1780",
      "family": "Puzzle and Cultural Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Knight, Megyesi and Schaefer deciphered the Copiale manuscript in 2011 using transcription, statistics and manual analysis. The exhibit separates that result from its invented demonstration alphabet.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Knight, Megyesi, Schaefer (USC/Uppsala, 2011)",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "culper-ring": {
      "name": "Culper Ring / Tallmadge Code Washington’s spy ring codebook · 1779",
      "hall": "V",
      "era": "American Revolution · 1778–1783",
      "family": "Military and Field Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Major Benjamin Tallmadge’s 1779 codebook for George Washington’s Culper Spy Ring. Roughly 760 numbered entries covering people, places, military terms, and common words — used by Abraham Woodhull and Robert Townsend on British-occupied Long Island and Manhattan.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Historical numerical codebook; captured documents and contextual evidence are distinct from cryptanalytic breaks.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "da-vinci-code": {
      "name": "The Da Vinci Code",
      "hall": "XIII",
      "era": "Fiction · 2003",
      "family": "Ciphers in Culture",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Dan Brown’s 2003 thriller uses Atbash, the Fibonacci sequence and anagrams as fictional clues. Explore those devices and the limits of treating fiction as cryptographic history.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "dagapeyeff": {
      "name": "D'Agapeyeff Cipher",
      "hall": "XII",
      "era": "Pre-WWII Britain · 1939",
      "family": "Unsolved Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Alexander d’Agapeyeff’s 1939 numeric challenge: a verified ciphertext excerpt, overlapping-pair analysis and explicit limits on proposed reconstructions.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Unsolved challenge cipher",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "dancing-men": {
      "name": "Conan Doyle's Dancing Men",
      "hall": "XIII",
      "era": "Edwardian Britain · 1903",
      "family": "Ciphers in Culture",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "The fictional stick-figure cipher Sherlock Holmes solves in The Adventure of the Dancing Men (1903) — a frequency-analysis primer disguised as a Strand magazine story.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "des": {
      "name": "DES (Data Encryption Standard)",
      "hall": "XI",
      "era": "Modern &middot; 1977",
      "family": "Modern Cryptography",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "DES was standardized in 1977. Its 56-bit key became vulnerable to practical exhaustive search, demonstrated by EFF’s Deep Crack in 1998.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Broken (brute force, 1998)",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "diana-cryptosystem": {
      "name": "Diana Cryptosystem",
      "hall": "V",
      "era": "Historical letter-pad system",
      "family": "Military and Field Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "DIANA uses a reciprocal trigraph table to combine message and pad letters. This exhibit verifies the conversion method while leaving exact service dates and deployments unestablished.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "See the exhibit’s documented attacks and limitations.",
      "modernLesson": "Correct OTP use is unbreakable; logistics often fail before the math"
    },
    "dictionary-code": {
      "name": "Confederate Dictionary Code",
      "hall": "Museum exhibit",
      "era": "Confederate · 1862",
      "family": "Historical Cryptography",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Page and word number from shared dictionary",
      "keyIdea": "Dictionary codes replace words with references in an agreed book. Repeated references and language patterns can still leak information; this widget is a simplified model.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Known dictionary + position lookup",
      "modernLesson": "Shared key material management"
    },
    "diffie-hellman": {
      "name": "Diffie-Hellman Key Exchange",
      "hall": "XI",
      "era": "Modern &middot; 1976",
      "family": "Modern Cryptography",
      "region": "Global",
      "usedBy": "Many authenticated key-agreement protocols, including ephemeral-DH modes of TLS",
      "keyType": "No key input — the protocol produces one",
      "keyIdea": "Two parties derive a shared secret over a public channel; nothing is encrypted",
      "trust": {
        "key": "secure",
        "text": "Secure (Modern)",
        "description": "Still considered secure when used correctly with modern key handling."
      },
      "securityFailure": "See the exhibit’s documented attacks and limitations.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "dilly-knox": {
      "name": "Dilly Knox",
      "hall": "X",
      "era": "WWI/WWII · Britain",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Dilly Knox worked on commercial and military Enigma variants, including Italian naval and Abwehr traffic, with colleagues whose contributions the exhibit identifies.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "dorabella": {
      "name": "Dorabella Cipher",
      "hall": "XII",
      "era": "19th c. · 1897",
      "family": "Unsolved Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Three arc counts × eight possible orientations",
      "keyIdea": "Edward Elgar’s 1897 Dorabella cryptogram contains 87 symbols. No proposed reading has achieved general acceptance.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "No generally accepted reading",
      "modernLesson": "Short texts and uncertain transcription make proposed readings harder to verify"
    },
    "double-playfair": {
      "name": "Doppelkastenschlüssel — German Double Playfair",
      "hall": "II",
      "era": "German armed forces · December 1941 edition",
      "family": "Substitution",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Two ordered 5 × 5 squares; 17-column pairing",
      "keyIdea": "German Double Playfair: reconstruct the December 1941 Doppelkastenschlüssel manual, including 17-column pairing, two substitution stages and its published example.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Allied crib and digraph-statistical attacks are documented for German double-box field ciphers; variants must be distinguished.",
      "modernLesson": "Pair formation is part of the cipher, not mere presentation"
    },
    "double-transposition": {
      "name": "Double Transposition",
      "hall": "IV",
      "era": "WWI · Germany",
      "family": "Transposition",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Two columnar keywords",
      "keyIdea": "Two successive columnar transpositions: historical military use, attack conditions, and modern computerized cryptanalysis; not an unbroken cipher until 2013.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Anagramming · Hill climbing (difficult)",
      "modernLesson": "Multiple cipher rounds"
    },
    "dunin": {
      "name": "Elonka Dunin",
      "hall": "X",
      "era": "Modern · Cryptographer",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Elonka Dunin documents Kryptos and unresolved cryptograms and writes about classical cryptanalysis, including Codebreaking: A Practical Guide with Klaus Schmeh.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "ecdsa": {
      "name": "ECDSA",
      "hall": "XI",
      "era": "Modern &middot; 1992",
      "family": "Modern Cryptography",
      "region": "Global",
      "usedBy": "TLS certificates, Bitcoin and Ethereum transactions, secure-boot chains",
      "keyType": "Private scalar d with public point Q = dG",
      "keyIdea": "Verifies a signature under an elliptic-curve public key; identity requires authenticating that key",
      "trust": {
        "key": "secure",
        "text": "Secure (Modern)",
        "description": "Still considered secure when used correctly with modern key handling."
      },
      "securityFailure": "See the exhibit’s documented attacks and limitations.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "egyptian-substitution": {
      "name": "Egyptian Substitution Hieroglyphs",
      "hall": "I",
      "era": "Middle Kingdom Egypt · ~1900 BCE",
      "family": "Ancient and Foundational Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Unusual hieroglyphic spellings in the tomb of Khnumhotep II, around 1900 BCE: an early example discussed in histories of cryptography, with uncertain intent.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Unusual writing does not by itself establish secret-key encryption"
    },
    "elizebeth-friedman": {
      "name": "Elizebeth Smith Friedman",
      "hall": "X",
      "era": "Interwar & WWII · USA",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Elizebeth Smith Friedman led important American cryptanalytic work against smuggling and wartime clandestine communications, with a team whose work remained little known for years.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "enigma": {
      "name": "Enigma Machine",
      "hall": "IX",
      "era": "WWII · 1918–1945",
      "family": "Rotor machine",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Rotor selection, rings, positions and plugboard settings",
      "keyIdea": "Enigma was a family of rotor machines. Rejewski reconstructed German Army Enigma in 1932; later Allied teams attacked changing systems, keys and procedures.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Polish prewar reconstruction; later Allied crib searches and bombe machinery.",
      "modernLesson": "Complexity ≠ security without proper operational discipline"
    },
    "fialka": {
      "name": "Fialka M-125 Soviet 10-rotor machine · 1956",
      "hall": "VII",
      "era": "Cold War · 1956",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Fialka was a Soviet ten-rotor machine with variant-specific alphabets, stepping and a punched-card permutation. The browser uses a simplified Latin-alphabet model.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Never publicly broken by cryptanalysis in operational service; obsolete today.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "field-hollers": {
      "name": "Field Hollers and Coding Songs",
      "hall": "XIII",
      "era": "African American oral traditions",
      "family": "Oral traditions and contextual communication",
      "region": "United States",
      "usedBy": "Historical African American communities; widget is modern",
      "keyType": "No authenticated fixed cipher reconstructed",
      "keyIdea": "Song, shared meaning, and covert communication: documented traditions, disputed Drinking Gourd claims, and a clearly labeled modern annotation exercise.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Concealing a message and encrypting its content are different aims"
    },
    "four-square": {
      "name": "Four-Square Cipher",
      "hall": "II",
      "era": "Early 20th Century · 1902 publication",
      "family": "Substitution",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Two keywords (two keyed squares)",
      "keyIdea": "Four-Square cipher (1902) — Delastelle's digram cipher using two keyed and two standard 5x5 squares. Disrupts Playfair frequencies but breaks to digrams.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Digram frequency analysis · simulated annealing",
      "modernLesson": "Fixed mappings preserve digram statistics"
    },
    "fractionated-morse": {
      "name": "Fractionated Morse Cipher",
      "hall": "IV",
      "era": "Classical Puzzle Cipher",
      "family": "Transposition",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Substitution alphabet for Morse triples",
      "keyIdea": "Fractionated Morse — converts text to Morse, regroups dots, dashes, and separators in trigrams, then substitutes via a keyed alphabet. Broken by trigram stats.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Structural analysis of Morse patterns",
      "modernLesson": "Encoding structure remains relevant to cryptanalysis"
    },
    "freemason-pigpen": {
      "name": "Freemason Pigpen Tradition",
      "hall": "XIII",
      "era": "Masonic inscriptions and later puzzle traditions",
      "family": "Ciphers in Culture",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Pigpen uses geometric symbols for letters and appears in fraternal cipher traditions. The fixed substitution is readily reversible once the alphabet is known.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "gchq-trio": {
      "name": "The GCHQ Trio — Ellis, Cocks, and Williamson",
      "hall": "X",
      "era": "Cold War · GCHQ",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Ellis’s January 1970 non-secret encryption report, Cocks’s 1973 construction, and Williamson’s 1974 key-agreement work, disclosed publicly in 1997.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "geheimschreiber": {
      "name": "Geheimschreiber T52 (Sturgeon) Siemens & Halske teleprinter cipher",
      "hall": "VII",
      "era": "WWII · 1932–1945",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "The Siemens T52 “Sturgeon” — a German WWII teleprinter cipher with ten wheels, with stepping that varied by model feeding an additive keystream and a per-character permutation. Broken by Arne Beurling and the Swedish Defence Staff’s cryptographic service in 1940.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Broken (Beurling, 1940)",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "gold-bug": {
      "name": "Poe's Gold-Bug Cipher",
      "hall": "XIII",
      "era": "Antebellum America · 1843",
      "family": "Ciphers in Culture",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Poe’s The Gold-Bug (1843) makes a substitution decipherment central to a fictional treasure hunt and explains the reasoning to readers.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "gravity-falls": {
      "name": "Gravity Falls Cipher System",
      "hall": "XIII",
      "era": "Animation · 2012–2016",
      "family": "Fictional puzzles using classical ciphers",
      "region": "Global",
      "usedBy": "Series creators and puzzle-solving viewers",
      "keyType": "Varies by puzzle; this widget uses Caesar +3",
      "keyIdea": "Gravity Falls used classical ciphers and visual clues across its episodes and associated puzzles, inviting viewers to decode messages.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Record the text, clues and method; a plausible reading must fit the puzzle."
    },
    "great-cipher": {
      "name": "The Great Cipher",
      "hall": "II",
      "era": "Baroque · 17th century",
      "family": "Substitution",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Codebook of ~587 numbered syllables",
      "keyIdea": "The Rossignols’ syllabic nomenclator was deciphered by Bazeries in the 1890s. His proposed Man in the Iron Mask identification remains disputed.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Étienne Bazeries (1893): syllabic frequency analysis and contextual cribs.",
      "modernLesson": "Decoy tokens & variable-length codewords"
    },
    "gronsfeld": {
      "name": "Gronsfeld Cipher",
      "hall": "III",
      "era": "17th Century",
      "family": "Polyalphabetic",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Numeric keyword (digits 0-9)",
      "keyIdea": "Gronsfeld restricts repeating-key shifts to digits 0–9. Its traditional attribution does not establish an exact invention date, and attack success depends on the available text.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Kasiski · Only 10 possible shifts per position",
      "modernLesson": "Key alphabet size matters"
    },
    "hagelin-c36": {
      "name": "Hagelin C-36 / C-52 Lineage",
      "hall": "VII",
      "era": "1930s–1950s · Sweden / Switzerland",
      "family": "Mechanical and Rotor Machines",
      "region": "Sweden and Switzerland",
      "usedBy": "Military and diplomatic operators of Hagelin pin-and-lug machines",
      "keyType": "Pin patterns, lug settings, wheel selection and starting positions",
      "keyIdea": "Pin-and-lug mechanisms produce a changing numerical shift; configurations vary by model",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "The pin-and-lug family has published cryptanalytic attacks; Greenough’s 1999 C-52 attack uses known plaintext.",
      "modernLesson": "Public cryptanalysis and independent supplier review are separate requirements"
    },
    "hill": {
      "name": "Hill Cipher",
      "hall": "II",
      "era": "1929",
      "family": "Substitution",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Invertible key matrix (n×n)",
      "keyIdea": "Hill’s 1929 cipher mixes groups of letters using an invertible matrix modulo 26. Suitable matched plaintext blocks can expose the key by linear algebra.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Known plaintext attack (matrix algebra)",
      "modernLesson": "Matrix operations in AES MixColumns"
    },
    "histiaeus-tattoo": {
      "name": "Histiaeus's Tattooed Messenger",
      "hall": "I",
      "era": "Classical Greece · ~499 BCE",
      "family": "Ancient and Foundational Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Histiaeus of Miletus (~499 BCE) — the Greek tyrant who tattooed a secret revolt order on a slave's shaved scalp, then waited for the hair to regrow before sending him.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Steganography (concealment)",
      "modernLesson": "Concealment and encryption protect different properties"
    },
    "homophonic": {
      "name": "Homophonic Substitution",
      "hall": "II",
      "era": "Renaissance · ~1400",
      "family": "Substitution",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Symbol-to-letter mapping table",
      "keyIdea": "Homophonic substitution assigns several symbols to common letters to reduce frequency peaks. Statistical attacks still depend on the message, mapping and available evidence.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Statistical analysis · Structural pattern detection",
      "modernLesson": "Non-uniform output distributions"
    },
    "ira-ciphers": {
      "name": "IRA Cipher Traffic",
      "hall": "V",
      "era": "Ireland · 1920s",
      "family": "Military and Field Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Interwar IRA columnar-transposition traffic studied by Jim Gillogly and Tom Mahon. Richard Bean solved the remaining 51-letter published challenge in 2019.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Jim Gillogly; Richard Bean solved the final published challenge in 2019",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "jefferson-disk": {
      "name": "Jefferson Disk",
      "hall": "VII",
      "era": "1795 (Jefferson) · 1922 (M-94)",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Physical disk arrangement (36 disks)",
      "keyIdea": "Jefferson proposed a 36-disk wheel cipher in the 1790s. The later, independently developed US Army M-94 used 25 disks and was adopted in 1922.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Brute force · Probable word attack",
      "modernLesson": "Compare mechanical implementations of substitution"
    },
    "jn-25": {
      "name": "JN-25 (Japanese Naval Code)",
      "hall": "VII",
      "era": "World War II - 1939-1945",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "JN-25 (1939-1945) - the Imperial Japanese Navy's superenciphered codebook system broken by Station HYPO and central to Midway intelligence.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Station HYPO and allied Pacific units",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "joan-clarke": {
      "name": "Joan Clarke",
      "hall": "X",
      "era": "WWII · Britain",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Joan Clarke, Hut 8 cryptanalyst and expert practitioner of Banburismus, helped reduce the search for Naval Enigma settings.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "kahn": {
      "name": "David Kahn",
      "hall": "X",
      "era": "Modern · Journalist/Historian",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "David Kahn (1930–2024), author of The Codebreakers, helped bring cryptologic history to a wide readership. He entered the NSA Cryptologic Hall of Honor in 2020.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "kama-sutra": {
      "name": "Kama Sutra Cipher (Mlecchita Vikalpa)",
      "hall": "I",
      "era": "Classical India · ~400 CE",
      "family": "Ancient and Foundational Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Pairing seed (rearranges 13 letter pairs)",
      "keyIdea": "Mlecchita-vikalpa, secret writing among the Kama Sutra’s arts. The interactive illustrates a modern paired-letter substitution, not a recovered ancient alphabet.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "See the exhibit’s documented attacks and limitations.",
      "modernLesson": "Secret writing appears in different cultural traditions"
    },
    "kerckhoffs": {
      "name": "Kerckhoffs's Principle",
      "hall": "XI",
      "era": "Foundational · 1883",
      "family": "Modern Cryptography",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Auguste Kerckhoffs's 1883 principle — 'A cipher should be secure even if everything about the system, except the key, is public knowledge' — is the bedrock of modern cryptographic design.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Open design enables scrutiny; it does not guarantee freedom from flaws"
    },
    "kl-7": {
      "name": "KL-7 ADONIS NATO eight-rotor machine · 1952",
      "hall": "VII",
      "era": "Cold War · 1952",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "KL-7: an American eight-rotor cipher machine with irregular stepping and re-entry. Stolen key material compromised traffic during the Walker espionage case.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Never publicly broken by cryptanalysis in operational service; stolen keys exposed traffic.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "kryha": {
      "name": "Kryha Pocket cipher machine · 1924",
      "hall": "VII",
      "era": "Inter-war commercial · 1924",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Kryha’s clockwork cipher devices used irregularly moving alphabets. Friedman and colleagues attacked a published challenge in 1933; this widget uses generated settings.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Broken (Friedman, 1933)",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "krypto-arg": {
      "name": "ARG Ciphers",
      "hall": "XIII",
      "era": "Web 2.0 · 2001–present",
      "family": "Ciphers in Culture",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Alternate-reality games — from The Beast (2001) to Year Zero (2007) and beyond — built on the assumption that players will recognise, transcribe, and crack classical ciphers across forums, phone calls, and physical artifacts.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "kryptos": {
      "name": "Kryptos",
      "hall": "XII",
      "era": "Modern · 1990",
      "family": "Unsolved Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Kryptos: K1–K3 publicly solved; K4 plaintext recovered from an archive in 2025, without a publicly demonstrated cryptanalytic solution.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "K1–K3 publicly solved. K4 plaintext was recovered from archival papers in 2025; that is distinct from a public cryptanalytic solution.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "lasry": {
      "name": "George Lasry",
      "hall": "X",
      "era": "Modern · Computational",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "George Lasry applies computational search to classical ciphers. His work includes a 2017 Kassel dissertation and collaborative decipherment of Mary Stuart’s letters.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "latin-american-codebooks": {
      "name": "Latin American Telegraphic Codebooks",
      "hall": "VII",
      "era": "Americas · 1870s–1940s",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Commercial telegraph codebooks compressed business messages. Their regional use and editions need documentary evidence; the demo uses an invented vocabulary.",
      "trust": {
        "key": "educational",
        "text": "Educational",
        "description": "A didactic construction for learning cryptographic concepts, not for security."
      },
      "securityFailure": "Commercial codebook illustration; specific regional military use requires archival evidence.",
      "modernLesson": "Economics can influence communications design"
    },
    "leo-marks": {
      "name": "Leo Marks",
      "hall": "X",
      "era": "WWII · Britain",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Leo Marks worked on SOE communications security, prepared keying material and letter one-time pads. His memoir recounts the practical problems of agent communications.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "lorenz": {
      "name": "Lorenz Cipher",
      "hall": "IX",
      "era": "WWII · Germany · 1940",
      "family": "Teleprinter stream cipher",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "12-wheel teleprinter cipher (Vernam-based)",
      "keyIdea": "Lorenz SZ40/42: Tiltman recovered messages and key from a 1941 depth; Tutte and the Research Section inferred the structure by early 1942; Colossus accelerated wheel-setting from February 1944.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Tiltman: depth (1941) · Tutte: structure (1942) · Colossus: wheel settings (1944)",
      "modernLesson": "Cryptanalysis and early programmable electronic computing"
    },
    "m-94": {
      "name": "M-94 / CSP-488 US Army strip / disk cipher · 1922",
      "hall": "VII",
      "era": "WWI → WWII tactical · 1922–1943",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "The M-94, adopted by the US Army in 1922, used 25 alphabet disks. It resembles Jefferson’s earlier unpublished wheel but was independently developed.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Tactical only",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "m209": {
      "name": "M-209 (Hagelin C-38)",
      "hall": "VII",
      "era": "World War II · 1942 production",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "6 pinwheels (lengths 26, 25, 23, 21, 19, 17) + 27 lug bars",
      "keyIdea": "M-209 cipher machine (US production from 1942) — the US Army's portable Hagelin C-38 with six co-prime pin-wheels and a 27-bar lug cage. Broken in the field in WWII.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Strong (tactical)",
      "modernLesson": "Long periods alone do not ensure security"
    },
    "mary-stuart-castelnau-letters": {
      "name": "Mary Queen of Scots — The Castelnau Letters",
      "hall": "X",
      "era": "1578–1584",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Mary Stuart’s letters from 1578–1584: 57 deciphered letters, about 50,000 words, published by Lasry, Biermann and Tomokiyo in 2023.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "57 letters from 1578–1584, approximately 50,000 words; decipherment published 8 February 2023.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "mavis-batey": {
      "name": "Mavis Batey",
      "hall": "X",
      "era": "WWII · Britain",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Mavis Batey worked with Dilly Knox’s team on Italian naval Enigma. Their decrypts contributed intelligence before the Battle of Cape Matapan in March 1941.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "mccormick": {
      "name": "McCormick Notes",
      "hall": "XII",
      "era": "Late 20th-c. United States · 1999",
      "family": "Unsolved Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Two handwritten notes found with Ricky McCormick in 1999. The FBI’s 2011 appeal sought contextual evidence and help interpreting their notation.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "The FBI’s 2011 appeal reported the notes unresolved.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "microdot": {
      "name": "Microdot Steganography",
      "hall": "V",
      "era": "Twentieth-century espionage",
      "family": "Photographic steganography",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Physical concealment; any content encryption is separate",
      "keyIdea": "Microdots conceal miniature photographic images in ordinary carriers. The browser demonstration is a visual metaphor, not optical microphotography or encryption.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Physical concealment can be discovered by inspection and magnification",
      "modernLesson": "Steganography hides the message; cryptography hides the content"
    },
    "mit-mystery-hunt": {
      "name": "MIT Mystery Hunt",
      "hall": "XIII",
      "era": "MIT · 1981–present",
      "family": "Ciphers in Culture",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "An annual puzzle hunt at MIT (since 1981) where teams solve dozens of layered cryptographic, linguistic, and lateral-thinking puzzles to find a hidden coin somewhere on campus.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "monoalphabetic": {
      "name": "Monoalphabetic Substitution",
      "hall": "II",
      "era": "Ancient roots · medieval cryptanalysis",
      "family": "Substitution",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Full alphabet permutation (26! keys)",
      "keyIdea": "Monoalphabetic substitution — replace each letter with a fixed substitute. A large keyspace can still leak language patterns; al-Kindi described frequency analysis in the ninth century.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Language statistics and word patterns can expose a fixed substitution.",
      "modernLesson": "S-boxes in AES"
    },
    "morse": {
      "name": "Morse Code Telegraphy's universal alphabet · 1840s",
      "hall": "I",
      "era": "Telegraph age · 1840s →",
      "family": "Ancient and Foundational Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "International Morse code — the dot-dash telegraph alphabet that made the wired world possible and provided the carrier signal for a century of military and amateur ciphers.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "myszkowski": {
      "name": "Myszkowski Transposition",
      "hall": "IV",
      "era": "1902 · France",
      "family": "Transposition",
      "region": "France",
      "usedBy": "Classical cipher practitioners and puzzle solvers",
      "keyType": "Keyword with repeated letters assigned identical ranks",
      "keyIdea": "Read single columns downwards and tied columns together across rows",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Repeated-keyword transposition preserves letter frequencies and is vulnerable to statistical and keyword-search attacks.",
      "modernLesson": "Specify tie handling and incomplete rows to make a permutation reversible"
    },
    "national-treasure": {
      "name": "National Treasure",
      "hall": "XIII",
      "era": "Fiction · 2004",
      "family": "Ciphers in Culture",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "The 2004 film National Treasure turns historical documents and landmarks into a fictional cipher hunt; its book clue uses the Silence Dogood letters.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "navajo-code-talkers": {
      "name": "Navajo Code Talkers",
      "hall": "VII",
      "era": "WWII · 1942–1945",
      "family": "Military vocabulary and spelling code",
      "region": "Pacific theatre, World War II",
      "usedBy": "Navajo Marines trained as Code Talkers",
      "keyType": "Military vocabulary and spelling code built from Navajo",
      "keyIdea": "Navajo code talkers used a specialized military vocabulary and spelling alphabet during World War II. Their language and the constructed code were distinct layers.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Never publicly broken in wartime service; a historical military code.",
      "modernLesson": "Specialised shared code, training and operational context"
    },
    "nema": {
      "name": "NEMA — Swiss Rotor Machine",
      "hall": "VII",
      "era": "Postwar Switzerland · 1947",
      "family": "Mechanical and Rotor Machines",
      "region": "Switzerland",
      "usedBy": "Swiss Army; training and war-reserve configurations",
      "keyType": "Wheel selection and pairing; ten starting window letters",
      "keyIdea": "Four wired rotors and a moving reflector controlled by separate stepping wheels",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Obsolete Swiss military rotor machine. The demo fixes one historical wheel configuration; the 17,576-keypress state period is not its key space.",
      "modernLesson": "Count the state period separately from the initial key space"
    },
    "nfc-deployment": {
      "name": "NFC Authentication: When the Tag Stays Unlocked",
      "hall": "XI",
      "era": "Modern cryptography · research case study",
      "family": "Protocol and deployment case study",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Device-specific 3DES/AES keys, storage and diversification",
      "keyIdea": "A case study of protocol state, key storage, integrity checks and counterfeit hardware.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Primitive strength does not establish command integrity or secure authentication state."
    },
    "nihilist": {
      "name": "Nihilist Cipher",
      "hall": "V",
      "era": "1880s · Russia",
      "family": "Military and Field Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Polybius square + numeric keyword",
      "keyIdea": "The additive Nihilist cipher sums plaintext and repeating-key Polybius coordinates. Its traditional Russian revolutionary attribution is qualified, and it differs from Nihilist transposition.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Frequency analysis of digit pairs · Kasiski-equivalent",
      "modernLesson": "Layered cipher operations"
    },
    "nomenclator": {
      "name": "Nomenclator",
      "hall": "II",
      "era": "Renaissance · 1400s–1800s",
      "family": "Substitution",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Substitution alphabet plus a code list; sizes varied",
      "keyIdea": "Nomenclator (1400s) — The 400-year diplomatic compromise: a small substitution alphabet plus a large code dictionary. Hall II of The Cipher Museum.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Historical systems combine code groups, letter substitutions, homophones and nulls; evidence varies by key and traffic.",
      "modernLesson": "Combining methods does not by itself establish security"
    },
    "null-cipher": {
      "name": "Null Cipher Concealment by selective reading · ancient → modern",
      "hall": "IV",
      "era": "Antiquity → present",
      "family": "Transposition",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Position rule — first/last letter, Nth letter, Nth word, …",
      "keyIdea": "A null cipher selects a message from a cover text using a positional rule. It conceals information in ordinary-looking writing; discovery of the rule defeats that concealment.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Weak (concealment, not encryption)",
      "modernLesson": "Concealment does not provide encryption or authentication"
    },
    "one-time-pad": {
      "name": "One-Time Pad",
      "hall": "IX",
      "era": "1882 · Theoretical",
      "family": "One-Time Pad and Theoretical Security",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Random key same length as message (used once)",
      "keyIdea": "A one-time pad offers perfect secrecy with a secret, uniform, independent message-length key used once. Try ciphertext tampering to see why secrecy is not authentication.",
      "trust": {
        "key": "secure",
        "text": "Secure (Modern)",
        "description": "Still considered secure when used correctly with modern key handling."
      },
      "securityFailure": "Perfect secrecy requires an independent, uniformly random secret pad at least as long as the message, used once. No authentication.",
      "modernLesson": "Information-theoretic security (Shannon, 1949)"
    },
    "patterson-jefferson-cipher": {
      "name": "Patterson's Cipher for Jefferson",
      "hall": "II",
      "era": "1801",
      "family": "Substitution",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Robert Patterson's 1801 cipher for Thomas Jefferson — text written down the lines, cut into sections of at most nine, the lines shuffled and padded with arbitrary letters. No earlier decipherment is documented before Lawren Smithline solved it in 2007 by dynamic programming over digraph frequencies.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Solved 2007 — after 206 years",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "phaistos-disc": {
      "name": "Phaistos Disc",
      "hall": "XII",
      "era": "Bronze Age Crete · ~1700 BCE",
      "family": "Unsolved Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "The Phaistos Disc is a Bronze Age stamped inscription from Crete. Its language and reading remain disputed; it is not established as a cipher.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "pigpen": {
      "name": "Pigpen Cipher",
      "hall": "VIII",
      "era": "18th Century",
      "family": "Puzzle and Cultural Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Fixed symbol-to-letter grid",
      "keyIdea": "Pigpen cipher (~1700) — Freemason geometric substitution where each letter becomes the lines and dots of its grid cell. Trivial once the glyph table is seen.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Symbol frequency analysis · Pattern recognition",
      "modernLesson": "Symbols alone do not strengthen a substitution"
    },
    "playfair": {
      "name": "Playfair Cipher",
      "hall": "II",
      "era": "Victorian · 1854",
      "family": "Substitution",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "5×5 keyword square",
      "keyIdea": "Playfair cipher (1854) — Charles Wheatstone's keyed 5x5 digram cipher promoted by Lord Playfair. Used by the British in WWI; broken by digram analysis.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Digraph statistics · hill climbing",
      "modernLesson": "Block encryption and diffusion"
    },
    "polybius": {
      "name": "Polybius Square",
      "hall": "I",
      "era": "Ancient Greece · ~150 BC",
      "family": "Ancient and Foundational Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "None (fixed grid)",
      "keyIdea": "Polybius described a Greek torch-signalling system. The modern Latin 5×5 grid adapts its coordinate idea and supports later substitution and fractionation ciphers.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Frequency analysis",
      "modernLesson": "Coordinate encoding and later fractionation"
    },
    "porta": {
      "name": "Porta Cipher",
      "hall": "III",
      "era": "Renaissance · 1563",
      "family": "Polyalphabetic",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Repeating keyword (pair-based)",
      "keyIdea": "The Porta cipher uses reciprocal substitutions selected by a repeating key. This exhibit’s 26-letter, 13-row table is a modern adaptation of the historical construction.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Index of Coincidence · Statistical analysis",
      "modernLesson": "Lookup-table cipher design"
    },
    "purple": {
      "name": "Purple (97-shiki ōbun injiki)",
      "hall": "VII",
      "era": "World War II · 1939–1945",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Stepping-switch banks (sixes/twenties split) plus daily key sheet",
      "keyIdea": "Purple was Japan’s Type 97 diplomatic stepping-switch cipher. Grotjan’s 20 September 1940 breakthrough helped the US Army SIS team reconstruct it.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Frank Rowlett, Genevieve Grotjan & the US SIS · 20 September 1940",
      "modernLesson": "Distinct sub-ciphers per character class create exploitable structure"
    },
    "rail-fence": {
      "name": "Rail Fence Cipher",
      "hall": "IV",
      "era": "Classical Transposition",
      "family": "Transposition",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Rail count (widget: 2–10)",
      "keyIdea": "Rail Fence transposes a message along a zigzag route. Rail count, offset conventions and message length define the search; there is no universal ten-rail maximum.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Brute force · Trivial keyspace",
      "modernLesson": "Permutation layers in block ciphers"
    },
    "red-army-faction": {
      "name": "RAF–Stasi Records and an OTP Teaching Model",
      "hall": "V",
      "era": "Cold War · 1970–1998",
      "family": "Military and Field Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "RAF–Stasi contacts are documented, but this exhibit does not establish a specific RAF one-time-pad system. The interactive is a generic arithmetic illustration.",
      "trust": {
        "key": "educational",
        "text": "Educational",
        "description": "A didactic construction for learning cryptographic concepts, not for security."
      },
      "securityFailure": "Illustrative letter-pad arithmetic; not a reconstruction of an authenticated RAF key or message.",
      "modernLesson": "Separate organisational evidence from cryptographic evidence"
    },
    "red-type-a": {
      "name": "Red (Type A)",
      "hall": "VII",
      "era": "Interwar to WWII - 1930s",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Red (Type A) (1930s) - the Japanese diplomatic half-rotor predecessor to Purple and the cryptanalytic bridge to MAGIC.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Broken by SIS",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "rochefort": {
      "name": "Joseph Rochefort",
      "hall": "X",
      "era": "WWII · Pacific",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Joseph Rochefort led Station HYPO’s team. Its signals intelligence helped US commanders prepare for Midway alongside other Allied analysis, reconnaissance and operational decisions.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "rosetta-stone": {
      "name": "The Rosetta Stone",
      "hall": "I",
      "era": "Ptolemaic Egypt · 196 BCE",
      "family": "Ancient and Foundational Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "The Rosetta Stone (196 BCE) records a decree in two languages and three scripts. It supported the decipherment of Egyptian hieroglyphs; it is not an encryption system.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Parallel texts can constrain a proposed decipherment"
    },
    "rot13": {
      "name": "ROT13",
      "hall": "I",
      "era": "Modern · 1980s",
      "family": "Ancient and Foundational Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "None (fixed shift of 13)",
      "keyIdea": "ROT13 is a fixed Caesar shift of 13, popularized as an early Usenet viewing convention. Applying it twice restores the text; it provides no confidentiality.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Knowing the system",
      "modernLesson": "Obfuscation ≠ encryption"
    },
    "rs44": {
      "name": "Rasterschlüssel 44 (RS44)",
      "hall": "IV",
      "era": "German field cipher · 1944",
      "family": "Transposition",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Daily stencil, column ranks, starting cell and minute",
      "keyIdea": "Reconstruct the 27 March 1944 RS44 operating procedure with its original example stencil. Animate permitted-cell entry and keyed extraction.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Published Allied attacks used captured stencils, retransmissions and probable plaintext; isolated traffic could remain difficult.",
      "modernLesson": "A large settings count is not evidence of security"
    },
    "rsa": {
      "name": "RSA",
      "hall": "XI",
      "era": "Modern &middot; 1977",
      "family": "Modern Cryptography",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "RSA uses a public modulus and exponents to support public-key constructions. Secure encryption and signatures need specified padding, adequate parameters and correct implementation.",
      "trust": {
        "key": "secure",
        "text": "Secure (Modern)",
        "description": "Still considered secure when used correctly with modern key handling."
      },
      "securityFailure": "See the exhibit’s documented attacks and limitations.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "running-key": {
      "name": "Running Key Cipher",
      "hall": "III",
      "era": "19th Century",
      "family": "Polyalphabetic",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Full-length key text (book or speech)",
      "keyIdea": "Running Key uses a message-length text passage as its Vigenère key. Language patterns in both message and key prevent the perfect secrecy of an ideal one-time pad.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Source text identification · Statistical analysis",
      "modernLesson": "A long key is not necessarily a random key"
    },
    "sator-square": {
      "name": "Sator Square",
      "hall": "XIII",
      "era": "Roman Empire · 1st–4th c. CE",
      "family": "Ciphers in Culture",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "The SATOR square has five palindromically arranged words. Its letters form a PATER NOSTER cross with two A’s and two O’s left over; the intended meaning remains debated.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "scytale": {
      "name": "Scytale",
      "hall": "I",
      "era": "Ancient Sparta · interpretation debated",
      "family": "Ancient and Foundational Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Rod diameter (physical key)",
      "keyIdea": "The traditional scytale reconstruction illustrates transposition, but the dates and cryptographic interpretation of ancient evidence are disputed.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Simple transposition model; historical origin and military use are debated.",
      "modernLesson": "Transposition & key space"
    },
    "sha256": {
      "name": "SHA-256",
      "hall": "XI",
      "era": "Modern &middot; 2002",
      "family": "Modern Cryptography",
      "region": "Global",
      "usedBy": "Certificate chains, Bitcoin mining, file integrity, password storage (via KDFs)",
      "keyType": "Unkeyed",
      "keyIdea": "Maps a message shorter than 2^64 bits to a 256-bit digest; hashing does not encrypt the message",
      "trust": {
        "key": "secure",
        "text": "Secure (Modern)",
        "description": "Still considered secure when used correctly with modern key handling."
      },
      "securityFailure": "See the exhibit’s documented attacks and limitations.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "shamir-secret-sharing": {
      "name": "Shamir's Secret Sharing",
      "hall": "XI",
      "era": "Modern &middot; 1979",
      "family": "Modern Cryptography",
      "region": "Global",
      "usedBy": "Threshold backup and custody designs; deployment details vary",
      "keyType": "No key — the secret is the object being split",
      "keyIdea": "Any k distinct valid shares recover the field-element secret; fewer reveal nothing when the polynomial coefficients are uniform and independent",
      "trust": {
        "key": "secure",
        "text": "Secure (Modern)",
        "description": "Still considered secure when used correctly with modern key handling."
      },
      "securityFailure": "See the exhibit’s documented attacks and limitations.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "shugborough": {
      "name": "Shugborough Inscription",
      "hall": "XII",
      "era": "Georgian England · mid-18th century",
      "family": "Unsolved Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "An eighteenth-century garden monument with eight unexplained letters, O · U · O · S · V · A · V · V, and D · M below.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Unresolved inscription; an encoding method is not established",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "sigaba": {
      "name": "SIGABA (ECM Mark II)",
      "hall": "VII",
      "era": "WWII · 1940",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "15 rotors arranged as 3 banks of 5 (cipher × 5, control × 5, index × 5)",
      "keyIdea": "SIGABA used fifteen rotors in cipher, control and index banks. No successful enemy wartime cryptanalytic break is publicly documented; the widget is a simplified model.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Never publicly broken by cryptanalysis in wartime service; obsolete today.",
      "modernLesson": "Rotor-control design changes the structure available to an analyst"
    },
    "sigsaly": {
      "name": "SIGSALY — The Encrypted Speech System",
      "hall": "VII",
      "era": "WWII · 1943–1946",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "SIGSALY protected high-level Allied voice communications using quantised vocoder parameters and matched one-time key records. The demo illustrates modular addition only.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "See the exhibit’s documented attacks and limitations.",
      "modernLesson": "An early operational use of digital speech parameters and one-time keys"
    },
    "slidex": {
      "name": "Slidex British WWII tactical code card",
      "hall": "VI",
      "era": "WWII & Cold War · 1943–1980s",
      "family": "American and Civil War Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Slidex used a 204-cell tactical vocabulary card and sliding coordinate strips. Reported German recovery times concerned particular wartime traffic, not every message.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Short-lived tactical vocabulary cards and changing cursor settings; the widget is a simplified bigram model.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "sodark": {
      "name": "SoDark and Radio Linking",
      "hall": "XI",
      "era": "Modern cryptography · research case study",
      "family": "Tweakable block cipher and radio protocol",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "56-bit key; 64-bit tweak; attacked eight-round 2G configuration",
      "keyIdea": "An eight-round attack on HF link establishment, with its data and access conditions visible.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Practical attacks target eight-round 2G ALE with suitable data; the paper does not establish the same break of sixteen-round 3G variants.",
      "modernLesson": "State the protected traffic, round count, data requirement and attacker access."
    },
    "solitaire": {
      "name": "Solitaire / Pontifex",
      "hall": "IX",
      "era": "Modern · 1999",
      "family": "Card-deck stream cipher",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Initial ordering of a 54-card deck (52 + 2 jokers)",
      "keyIdea": "Solitaire / Pontifex (1999) — Bruce Schneier's hand cipher driven by a 54-card deck (written for Cryptonomicon). Crowley showed a ~1/22.5 keystream bias.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "See the exhibit’s documented attacks and limitations.",
      "modernLesson": "Manual stream-cipher design and its limitations"
    },
    "somerton-man": {
      "name": "Somerton Man Code",
      "hall": "XII",
      "era": "Post-WWII Australia · 1948",
      "family": "Unsolved Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "The Somerton Man inscription and a simplified transcription experiment. A 2022 genealogical identification proposal is separate from interpreting the letters.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Unresolved inscription; a 2022 genealogical identification proposal is separate from deciphering these letters.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "stager": {
      "name": "Stager Cipher",
      "hall": "Museum exhibit",
      "era": "Union · 1861",
      "family": "Historical Cryptography",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Route transposition + code words",
      "keyIdea": "The Union’s Stager system combined word transposition, code words and operational procedures. Wartime success is a historical claim, not a proof of mathematical security.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Historical Union route-code system; wartime operational success is not a mathematical security guarantee.",
      "modernLesson": "Route transposition as message obfuscation"
    },
    "station-hypo": {
      "name": "Station HYPO — Pearl Harbor to Midway",
      "hall": "X",
      "era": "WWII · 1940–1942",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Station HYPO combined partial JN-25 recovery, traffic analysis and operational context to help anticipate the Japanese operation against Midway in 1942.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "straddling-checkerboard": {
      "name": "Straddling Checkerboard",
      "hall": "V",
      "era": "Late 19th – 20th Century",
      "family": "Military and Field Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "8 high-frequency letters in row 0",
      "keyIdea": "The straddling checkerboard uses one- and two-digit letter codes. It is a substitution component of VIC; this exhibit does not establish an exact first-use date.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Weak (alone) · Strong (in VIC)",
      "modernLesson": "Variable-length codes resist character-aligned attacks"
    },
    "tap-code": {
      "name": "Tap Code",
      "hall": "VIII",
      "era": "Vietnam War · earlier precedents",
      "family": "Puzzle and Cultural Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "5×5 Polybius grid (no key)",
      "keyIdea": "Tap Code (1965) — the 5x5 Polybius square tapped through walls as row-then-column knocks. Used by US POWs in the Hanoi Hilton during the Vietnam War.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Frequency analysis · Grid deduction",
      "modernLesson": "Non-electronic covert communication"
    },
    "trifid": {
      "name": "Trifid Cipher",
      "hall": "IV",
      "era": "1902",
      "family": "Transposition",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "3×3×3 keyword cube",
      "keyIdea": "Trifid cipher (1902) — Felix Delastelle's three-dimensional 3x3x3 extension of the Bifid that fractionates letters into trits and shuffles them across a period.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Statistical analysis",
      "modernLesson": "3D lookup tables in modern cipher design"
    },
    "trithemius": {
      "name": "Trithemius Progressive Cipher Polygraphia · 1518",
      "hall": "III",
      "era": "German Renaissance · 1518",
      "family": "Polyalphabetic",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Optional starting offset only",
      "keyIdea": "Johannes Trithemius's progressive shift cipher (Polygraphia, 1518) — the first published polyalphabetic, where every successive letter is shifted one further than the last.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Easy",
      "modernLesson": "A predictable keystream is barely a keystream"
    },
    "turning-grille": {
      "name": "Fleissner Turning Grille",
      "hall": "IV",
      "era": "1881 · German WWI use",
      "family": "Transposition",
      "region": "Austria and wartime Europe",
      "usedBy": "German Army in WWI; other military grille users",
      "keyType": "Hole pattern, starting orientation and rotation direction",
      "keyIdea": "Four quarter-turns visit each cell once, permuting a complete message block",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "A transposition cipher: quarter-turn holes permute a complete block, preserving letter frequencies.",
      "modernLesson": "A stencil can rearrange a message without concealing its existence"
    },
    "two-square": {
      "name": "Two-Square Cipher",
      "hall": "II",
      "era": "Classical Digraph Cipher",
      "family": "Substitution",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Two keywords (two keyed squares)",
      "keyIdea": "Two-square uses two keyed 5×5 squares to encipher letter pairs. This demo follows the ACA horizontal rectangle rule and discloses its extra filler-escape convention.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Digram frequency · same-row leak",
      "modernLesson": "Beware of identity transformations as edge cases"
    },
    "typex": {
      "name": "Typex",
      "hall": "VII",
      "era": "WWII · 1937",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "5 rotors (3 stepping + 2 stator) chosen from a set of 10 or 14",
      "keyIdea": "Typex was a British Enigma-derived family with five rotor positions. Later models included plugboards; the browser widget is a simplified rotor model.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Never publicly broken by cryptanalysis in wartime service; obsolete today.",
      "modernLesson": "Model differences and operational practices matter alongside the rotor count"
    },
    "ua-8295": {
      "name": "UA-8295: Forensic Cryptanalysis of a Message Terminal",
      "hall": "XI",
      "era": "Modern cryptography · research case study",
      "family": "Firmware forensics",
      "region": "Finland / Netherlands",
      "usedBy": "Nokia DA-8520 / USFA UA-8295 terminal users",
      "keyType": "15-character user key plus a 5-character nonce derive a 56-bit key",
      "keyIdea": "A sourced forensic case: the Nokia original versus the NSA ROM, the attacks actually implemented, and what stays conditional or unresolved.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Separate what was observed in firmware, what was implemented as an attack, what is conditional inference, and what is still open."
    },
    "venona": {
      "name": "VENONA Project",
      "hall": "IX",
      "era": "Cold War · 1943–1980",
      "family": "One-Time Pad and Theoretical Security",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "VENONA analysed intercepted Soviet messages, chiefly from the 1940s, by exploiting duplicated pad material. The project ran from 1943 to 1980.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Partial break (key reuse exploit)",
      "modernLesson": "Even perfect ciphers fail when key generation is flawed"
    },
    "vernam": {
      "name": "Vernam Cipher",
      "hall": "IX",
      "era": "1917",
      "family": "Additive teleprinter cipher",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Key tape (bitwise XOR)",
      "keyIdea": "Vernam’s teleprinter system combines text with a key stream. XOR supplies perfect secrecy only when the pad is uniformly random, independent, secret, long enough and never reused.",
      "trust": {
        "key": "secure",
        "text": "Secure (Modern)",
        "description": "Still considered secure when used correctly with modern key handling."
      },
      "securityFailure": "XOR gives perfect secrecy only with an independent, uniformly random secret pad at least as long as the message, used once. No authentication.",
      "modernLesson": "XOR as cipher operation · nonce uniqueness"
    },
    "vic": {
      "name": "VIC Cipher",
      "hall": "V",
      "era": "Cold War · 1950s",
      "family": "Military and Field Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Straddling checkerboard + double transposition",
      "keyIdea": "VIC cipher (1953) — Reino Häyhänen's KGB hand cipher: straddling checkerboard, double transposition, date-driven keystream. Exposed in 1957 after his defection, not broken cryptanalytically.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Historical Soviet hand system; the key procedure became known through Häyhänen’s 1957 defection. No proof of unbreakability.",
      "modernLesson": "Peak hand-cipher design principles"
    },
    "vietnamese-underground": {
      "name": "Vietnamese Underground Codes",
      "hall": "V",
      "era": "Modern · 1940s–1975",
      "family": "Military and Field Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Vietnamese wartime communications used changing codes and ciphers. This keyword-substitution widget is a teaching model, not a verified universal underground system.",
      "trust": {
        "key": "educational",
        "text": "Educational",
        "description": "A didactic construction for learning cryptographic concepts, not for security."
      },
      "securityFailure": "Illustrative concealment and cipher models; specific operational attribution is not established here.",
      "modernLesson": "Compartmentalization limits damage from key compromise"
    },
    "vigenere": {
      "name": "Vigenère Cipher",
      "hall": "III",
      "era": "Renaissance · 1553",
      "family": "Historical Cryptography",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Repeating keyword",
      "keyIdea": "The repeating-key Vigenère cipher exposes periodic structure. Bellaso described a related system in 1553; Babbage and Kasiski developed attacks in the nineteenth century.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Babbage ~1854 · Kasiski 1863",
      "modernLesson": "Stream ciphers (ChaCha20)"
    },
    "voynich": {
      "name": "The Voynich Manuscript",
      "hall": "XII",
      "era": "Early 15th c. · Carbon-dated 1404–1438",
      "family": "Unsolved Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "The Voynich manuscript has an undeciphered script. Parchment dating and sample-dependent text statistics constrain hypotheses without identifying its language or method.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "No generally accepted decipherment; whether the text encodes language or a cipher remains unresolved.",
      "modernLesson": "Statistical signatures alone cannot tell cipher from constructed language from hoax"
    },
    "wadsworth-cipher": {
      "name": "Wadsworth Cipher",
      "hall": "VII",
      "era": "1817 · USA",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Wadsworth’s 1817 device uses geared disks with 33 and 26 positions. A published 2020 ciphertext-only search studied key recovery for this historical design.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Ciphertext-only stochastic hill climbing (2020)",
      "modernLesson": "Coprime periods buy length; they do not buy security"
    },
    "wallis-ciphers": {
      "name": "Wallis Ciphers John Wallis & the English Civil War · 1640s",
      "hall": "II",
      "era": "English Civil War · 1642–1651",
      "family": "Substitution",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "John Wallis’s seventeenth-century cryptanalysis, with a clearly identified museum nomenclator model. Historical recovery times varied from hours to months.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Royalist nomenclators — broken by Wallis",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "wheatstone": {
      "name": "Wheatstone Cryptograph A clock-face polyalphabetic · 1867",
      "hall": "VII",
      "era": "Victorian London · 1867",
      "family": "Mechanical and Rotor Machines",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Mixed-alphabet keyword (inner dial)",
      "keyIdea": "Charles Wheatstone's 1867 cryptograph — two geared clock dials whose hands sweep an outer plain alphabet and an inner mixed alphabet, generating a polyalphabetic ciphertext one click at a time.",
      "trust": {
        "key": "historical",
        "text": "Historical Only",
        "description": "Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise."
      },
      "securityFailure": "Historical unequal-dial device. The current equal-dial widget is a fixed-substitution teaching model, not its mechanism.",
      "modernLesson": "Mechanisation does not, by itself, add security"
    },
    "yardley": {
      "name": "Herbert Yardley",
      "hall": "X",
      "era": "Interwar · USA",
      "family": "Codebreakers and Cryptanalysis",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "Herbert Osborne Yardley founded America's Black Chamber in 1919, broke Japanese diplomatic codes at the 1921 Washington Naval Conference, and then infamously published the secrets in his 1931 bestseller.",
      "trust": null,
      "securityFailure": null,
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "zero-knowledge-proofs": {
      "name": "Zero-Knowledge Proofs",
      "hall": "XI",
      "era": "Modern &middot; 1985",
      "family": "Modern Cryptography",
      "region": "Global",
      "usedBy": "Zcash shielded transactions, Ethereum rollups, anonymous credential systems",
      "keyType": "Witness known only to the prover",
      "keyIdea": "Proves a statement without revealing the witness beyond what the statement and model permit",
      "trust": {
        "key": "secure",
        "text": "Secure (Modern)",
        "description": "Still considered secure when used correctly with modern key handling."
      },
      "securityFailure": "See the exhibit’s documented attacks and limitations.",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "zimmermann": {
      "name": "Zimmermann Telegram German codes 0075 / 13040 · 1917",
      "hall": "VI",
      "era": "WWI · January 1917",
      "family": "American and Civil War Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Varies by system",
      "keyIdea": "The January 1917 Zimmermann Telegram: code 0075 to Washington, then re-encoded in 13040 for Mexico. Room 40’s reading helped draw the United States into WWI.",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Broken (Room 40)",
      "modernLesson": "Security depends on design quality, key management, and implementation."
    },
    "zodiac": {
      "name": "Zodiac Cipher",
      "hall": "VIII",
      "era": "1969 · Solved 2020",
      "family": "Puzzle and Cultural Ciphers",
      "region": "Global",
      "usedBy": "See the exhibit for historical participants and source evidence",
      "keyType": "Homophonic substitution + diagonal transposition",
      "keyIdea": "Zodiac killer ciphers (1969) — homophonic substitution as in Z-408 (broken in 1969 by the Hardens) and Z-340 (broken in 2020 by Oranchak, Blake, and Van Eycke).",
      "trust": {
        "key": "broken",
        "text": "Broken",
        "description": "Cryptographically broken — historically important but unsafe to use today."
      },
      "securityFailure": "Oranchak, Blake & Van Eycke (2020)",
      "modernLesson": "Layered ciphers · n-gram scoring"
    }
  }
};
  if (typeof global.dispatchEvent === 'function') global.dispatchEvent(new global.Event('artifact-cards-ready'));
})(typeof window !== "undefined" ? window : globalThis);
```


## JavaScript — js/artifact-cards.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/artifact-cards.js`
- Served SHA-256: `5ffdc2e0aeae9d3c95e393b7bc9f277eaddb7f5e87117cde3f21f6e51cc83a92`
- Readable-source SHA-256: `5ffdc2e0aeae9d3c95e393b7bc9f277eaddb7f5e87117cde3f21f6e51cc83a92`


```javascript
/* THE CIPHER MUSEUM — Artifact Card Renderer */
'use strict';

(function () {
  var path = (location.pathname || '').toLowerCase();
  if (path.indexOf('/ciphers/') === -1) return;

  var file = path.split('/').pop() || '';
  var slug = file.replace(/\.html$/, '');
  if (!slug) return;

  function render() {
    var data = (window.__ARTIFACT_CARDS__ && window.__ARTIFACT_CARDS__.cards) || {};
    var card = data[slug];
    if (!card) return;

    var main = document.getElementById('main-content') || document.querySelector('main');
    if (!main) return;
    if (main.querySelector('.artifact-card')) return;

    var anchor = main.querySelector('.page-hero') || main.firstElementChild;
    if (!anchor) return;

    var section = document.createElement('section');
    section.className = 'artifact-card';
    section.setAttribute('aria-label', 'Artifact card metadata');
    section.setAttribute('data-artifact-slug', slug);

    var title = document.createElement('h2');
    title.className = 'artifact-card-title';
    title.textContent = 'Artifact Card';

    var grid = document.createElement('dl');
    grid.className = 'artifact-card-grid';

    function addField(label, value, trust) {
      var dt = document.createElement('dt');
      dt.className = 'artifact-card-label';
      dt.textContent = label;

      var dd = document.createElement('dd');
      dd.className = 'artifact-card-value';
      if (trust) dd.innerHTML = window.TrustLabels.badge(trust);
      else dd.textContent = value || 'Not specified';

      grid.appendChild(dt);
      grid.appendChild(dd);
    }

    if (card.hall) addField('Hall', card.hall);
    addField('Era', card.era);
    addField('Family', card.family);
    addField('Region', card.region);
    addField('Used By', card.usedBy);
    addField('Key Type', card.keyType);
    addField('Key Idea', card.keyIdea);
    if (card.trust) {
      addField('Trust', card.trust.text, card.trust);
      addField('Security History / Limits', card.securityFailure);
    }
    addField('Modern Lesson', card.modernLesson);

    section.appendChild(title);
    section.appendChild(grid);

    if (anchor.nextSibling) {
      main.insertBefore(section, anchor.nextSibling);
    } else {
      main.appendChild(section);
    }
  }

  // Companion scripts can execute in either order. The generated data bundle
  // announces readiness; a delayed document can also retry the same renderer.
  window.addEventListener('artifact-cards-ready', render);
  document.addEventListener('DOMContentLoaded', render, { once: true });
  render();
})();
```


## JavaScript — js/breadcrumbs.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/breadcrumbs.js`
- Served SHA-256: `7e96cb5dbe3e892d9f8631e46ef078d61fcb708987d37c46e480c2f0a1c5ebc1`
- Readable-source SHA-256: `7e96cb5dbe3e892d9f8631e46ef078d61fcb708987d37c46e480c2f0a1c5ebc1`


```javascript
'use strict';
/**
 * THE CIPHER MUSEUM — Breadcrumb Enhancer
 * Upgrades existing .breadcrumb divs to <nav aria-label="breadcrumb"> for a11y.
 * Auto-fills empty breadcrumb containers on new pages (tours, lab, community).
 * Include on every page: <script src="js/breadcrumbs.js" defer></script>
 */
(function(){
  var path = location.pathname;
  var parts = path.split('/').filter(Boolean);
  var pageName = parts[parts.length - 1] || 'index.html';
  var parentDir = parts.length > 1 ? parts[parts.length - 2] : '';
  var inSub = ['ciphers','halls','tours','lab','community','hall-of-foundations'].indexOf(parentDir) !== -1;
  var pre = inSub ? '../' : '';

  /* Map of directory → breadcrumb segment */
  var DIR_LABELS = {
    tours:     {label:'Guided Tours',  href:'tours/index.html'},
    lab:       {label:'Cryptanalysis Lab', href:'cryptanalysis.html'},
    community: {label:'Community',     href:'community/index.html'}
  };

  /* Top-level pages */
  var TOP_NAMES = {
    'cipher-flow.html': 'Cipher Flow Explorer',
    'my-path.html':     'My Cryptographer\'s Path',
    'challenges.html':  'Challenges',
    'timeline.html':    'Timeline',
    'glossary.html':    'Glossary',
    'modern.html':      'Modern Cryptography',
    'museum-map.html':  'Museum Map',
    'cryptanalysis.html':'Cryptanalysis Lab'
  };

  /* ─── Upgrade existing .breadcrumb divs to <nav> ─── */
  var existing = document.querySelectorAll('.breadcrumb');
  existing.forEach(function(el){
    if(el.tagName === 'DIV'){
      var nav = document.createElement('nav');
      nav.setAttribute('aria-label','breadcrumb');
      nav.className = el.className;
      nav.innerHTML = el.innerHTML;
      /* Copy any inline style */
      if(el.style.cssText) nav.style.cssText = el.style.cssText;
      el.parentNode.replaceChild(nav, el);
    }
  });

  /* ─── Auto-fill empty breadcrumbs on new pages ─── */
  var bc = document.querySelector('nav.breadcrumb, .breadcrumb');
  if(bc && bc.innerHTML.trim() === ''){
    var html = '<a href="' + pre + 'index.html">Entrance</a><span>›</span>';
    /* Subdirectory pages */
    if(inSub && DIR_LABELS[parentDir]){
      var dir = DIR_LABELS[parentDir];
      html += '<a href="' + pre + dir.href + '">' + dir.label + '</a><span>›</span>';
    }
    /* Try to get page title from <h1> */
    var h1 = document.querySelector('h1');
    var title = h1 ? h1.textContent.trim() : pageName.replace('.html','');
    html += title;
    bc.innerHTML = html;
  }

  /* ─── Inject breadcrumb on pages that have none ─── */
  if(!document.querySelector('nav.breadcrumb, .breadcrumb')){
    var hero = document.querySelector('.page-hero');
    if(hero){
      var nav = document.createElement('nav');
      nav.setAttribute('aria-label','breadcrumb');
      nav.className = 'breadcrumb';
      var html2 = '<a href="' + pre + 'index.html">Entrance</a><span>›</span>';
      if(inSub && DIR_LABELS[parentDir]){
        var d = DIR_LABELS[parentDir];
        html2 += '<a href="' + pre + d.href + '">' + d.label + '</a><span>›</span>';
      }
      var h1b = document.querySelector('h1');
      html2 += h1b ? h1b.textContent.trim() : pageName.replace('.html','');
      nav.innerHTML = html2;
      hero.insertBefore(nav, hero.firstChild);
    }
  }
})();
```


## JavaScript — js/chi-setting.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/chi-setting.js`
- Served SHA-256: `2a1cb8852b434c1edb00c69d0985e66a4ffd8dc25722fe8267f7729b7bf51f2d`
- Readable-source SHA-256: `2a1cb8852b434c1edb00c69d0985e66a4ffd8dc25722fe8267f7729b7bf51f2d`


```javascript
/* General Report on Tunny (Good, Michie, Timms, 1945), §§23A–C.
 * Bounded two-wheel statistical experiment, not a full Colossus emulator. */
(function (root) {
  'use strict';
  function rng(seed) { let x=seed>>>0; return () => { x=(Math.imul(x,1664525)+1013904223)>>>0; return x/4294967296; }; }
  function delta(bits) { return bits.slice(1).map((x,i)=>x^bits[i]); }
  function validate(z, patterns) {
    if (!Array.isArray(z) || z.length<2 || z.length>4096 || z.some(x=>!Number.isInteger(x)||x<0||x>31)) throw Error('Use 2–4096 five-bit symbols.');
    if (patterns.length!==2 || patterns.some((p,i)=>p.length!==[41,31][i] || p.some(b=>b!==0&&b!==1))) throw Error('Known binary chi patterns must have lengths 41 and 31.');
  }
  function rank(z, patterns) {
    validate(z,patterns);
    const dz=delta(z).map(x=>(x&1)^((x>>>1)&1));
    const wheels=patterns.map(p=>p.map((x,i)=>x^p[(i+1)%p.length]));
    const scores=[];
    for(let a=0;a<41;a++) for(let b=0;b<31;b++) {
      let dots=0;
      for(let t=0;t<dz.length;t++) if ((dz[t]^wheels[0][(a+t)%41]^wheels[1][(b+t)%31])===0) dots++;
      scores.push({a,b,dots,sigma:(dots-dz.length/2)/Math.sqrt(dz.length/4)});
    }
    return scores.sort((a,b)=>b.dots-a.dots||a.a-b.a||a.b-b.b);
  }
  function fixture(length=1024, noise=0, seed=1945) {
    if (![64,256,1024,4096].includes(length) || !Number.isFinite(noise) || noise<0 || noise>0.5) throw Error('Invalid fixture settings.');
    const random=rng(seed), patterns=[41,31].map(n=>Array.from({length:n},()=>random()<0.5?0:1));
    const truth={a:Math.floor(random()*41),b:Math.floor(random()*31)};
    // D is a synthetic residual stream, not German plaintext or a psi-wheel emulator.
    // Its impulse-1 XOR impulse-2 parity changes with probability .30 (plus noise).
    let parity=0;
    const residual=[], ciphertext=[];
    for(let t=0;t<length;t++) {
      if(t && ((random()<0.30 ? 1:0) ^ (random()<noise ? 1:0))) parity^=1;
      const first=random()<0.5?0:1;
      const d=first|((first^parity)<<1)|(Math.floor(random()*8)<<2);
      residual.push(d);
      ciphertext.push(d^patterns[0][(truth.a+t)%41]^(patterns[1][(truth.b+t)%31]<<1));
    }
    return {patterns,truth,residual,ciphertext};
  }
  function experiment(length,noise,seed=1945) {
    const data=fixture(length,noise,seed), ranked=rank(data.ciphertext,data.patterns), random=rng(seed^0x7194);
    // Compare the selected maximum with selected maxima under an explicit iid null.
    const nullMaxima=Array.from({length:39},()=>rank(Array.from({length},()=>Math.floor(random()*32)),data.patterns)[0].dots);
    const exceed=nullMaxima.filter(n=>n>=ranked[0].dots).length;
    const familywiseEstimate=(exceed+1)/(nullMaxima.length+1);
    const truthRank=ranked.findIndex(s=>s.a===data.truth.a&&s.b===data.truth.b)+1;
    return { ...data, ranked, nullMaxima, familywiseEstimate, truthRank,
      conclusion: familywiseEstimate<=0.05 && ranked[0].dots>ranked[1].dots ? 'Evidence for further investigation under the synthetic model; not a decryption.' : 'Inconclusive after searching 1,271 settings.' };
  }
  const api={delta,rank,fixture,experiment};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.ChiSetting=api;
  if(typeof document!=='undefined') {
    const button=document.getElementById('chi-run');
    if(button) button.addEventListener('click',()=>{
      const output=document.getElementById('chi-results');
      const length=Number(document.getElementById('chi-length').value),noise=Number(document.getElementById('chi-noise').value);
      button.disabled=true; output.textContent='Counting all settings and 39 null searches…';
      setTimeout(()=>{try {
        const r=experiment(length,noise);
        const preselected=r.ranked.find(s=>s.a===0&&s.b===0);
        output.innerHTML='<p>Preselected offsets (0, 0), fixed before inspecting the tape: '+preselected.dots+' dots; pointwise sigma '+preselected.sigma.toFixed(2)+'. Compare this one setting with the selected maximum below.</p><p>'+r.conclusion+'</p><p>'+length+' five-bit symbols; '+(length-1)+' adjacent differences. Selected maximum: '+r.ranked[0].dots+' dots. Pointwise sigma: '+r.ranked[0].sigma.toFixed(2)+'. This pointwise score ignores selection among 1,271 settings.</p><p>Whole-search Monte Carlo estimate: '+r.familywiseEstimate.toFixed(3)+' (39 independent null searches; minimum reportable estimate 0.025). This coarse model-dependent estimate is not historical confidence or a proof.</p><table class="cipher-table"><thead><tr><th>chi 1 offset</th><th>chi 2 offset</th><th>Dots</th></tr></thead><tbody>'+r.ranked.slice(0,5).map(s=>'<tr><td>'+s.a+'</td><td>'+s.b+'</td><td>'+s.dots+'</td></tr>').join('')+'</tbody></table><details><summary>Inspect fixture truth and known wheel patterns</summary><p>True offsets '+r.truth.a+', '+r.truth.b+'; rank '+r.truthRank+'. Truth is checked only after ranking.</p><p>chi 1: '+r.patterns[0].join('')+'</p><p>chi 2: '+r.patterns[1].join('')+'</p><p>First 12 ciphertext symbols: '+r.ciphertext.slice(0,12).map(n=>n.toString(2).padStart(5,'0')).join(' ')+'</p></details>';
      }catch(e){output.textContent=e.message;}finally{button.disabled=false;}},0);
    });
  }
})(typeof window!=='undefined'?window:globalThis);
```


## JavaScript — js/cipher-corpus.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/cipher-corpus.js`
- Served SHA-256: `1c8f4bb2422eff69ca824a25ef6bf9c531cb3c0ac1fe5c042f89aa1f60e9e6d5`
- Readable-source SHA-256: `1c8f4bb2422eff69ca824a25ef6bf9c531cb3c0ac1fe5c042f89aa1f60e9e6d5`


```javascript
// Cipher Corpus Browser UI

(async function() {
  let records = [];
  if (typeof fetch === 'function') {
    // Load a balanced v0.8 sample; the published v0.6 sample remains an archive.
    try {
      const res = await fetch('public/corpus/v0.8/browser-sample.json');
      if (!res.ok) throw new Error('Corpus HTTP ' + res.status);
      records = await res.json();
      if (!Array.isArray(records)) throw new Error('Invalid corpus response');
    } catch (error) {
      const container = document.getElementById('corpus-cards');
      if (container) {
        container.textContent = 'The corpus could not be loaded. Check your connection and reload this page to try again.';
        container.setAttribute('role', 'status');
      }
      return;
    }
  }
  let mode = 'challenge';

  // Live navigation repairs only. Frozen source_provenance/source_url values remain unchanged in
  // the published corpus and record downloads; these do not verify provenance.
  const sourceLinkUpdates = {
    "https://www.nsa.gov/Portals/75/documents/news-features/declassified-documents/venona/": "https://www.nsa.gov/Helpful-Links/NSA-FOIA/Declassification-Transparency-Initiatives/Historical-Releases/VENONA/",
    "https://www.cs.cornell.edu/courses/cs6820/2012fa/handouts/alberti.pdf": "https://library.cmu.edu/about/news/2023-01/Alberti-La-Cifra",
    "https://www.cryptomuseum.com/crypto/chaocipher/": "https://www.chaocipher.com/",
    "https://www.cryptomuseum.com/crypto/wheatstone/": "https://collection.sciencemuseumgroup.org.uk/objects/co60528",
    "https://en.wikisource.org/wiki/The_Lives_of_the_Twelve_Caesars/Life_of_Julius_Caesar": "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Julius*.html#56.6"
};
  const incorrectSourceLinks = {
    '[ebook-url-omitted-4d836edda9e0; bibliographic credit retained]': { work: "Russell's Sydney Smith", related: '[ebook-url-omitted-a2c16a87be0d; bibliographic credit retained]' },
    '[ebook-url-omitted-7cbbe05acde6; bibliographic credit retained]': { work: 'Tunturikoski', related: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Aeneas_Tacticus/E*.html' },
    '[ebook-url-omitted-fa657a9b3875; bibliographic credit retained]': { work: "Mistral's Mes Origines" }
  };
  // A source credit is not permission to turn an ebook copy into navigation.
  // Keep archival provenance intact, and allow primary papers/manuals (including
  // PDFs); suppress known book-text hosts and ebook file formats at render time.
  function isEbookDestination(url) {
    const host = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();
    return /(^|\.)(gutenberg\.org|books\.google\.[a-z.]+|openlibrary\.org|annas-archive\.[a-z]+|libgen\.[a-z]+)$/.test(host) ||
      /\.(?:epub|mobi|azw3?)(?:$|\/)/.test(pathname) ||
      (host === 'inventwithpython.com' && /^\/cracking(?:\/|$)/.test(pathname)) ||
      (host === 'crypto.stanford.edu' && pathname.includes('/cryptobook')) ||
      (host === 'shoup.net' && /^\/pg(?:\/|$)/.test(pathname)) ||
      (/^(?:www\.)?(?:cacr|math)\.uwaterloo\.ca$/.test(host) && /\/hac(?:\/|$)/.test(pathname)) ||
      (host === 'tekniskkulturarv.dk' && /^\/book\//.test(pathname));
  }
  function sourceLink(rec) {
    const original = rec.source_url || (rec.source_provenance && rec.source_provenance.url);
    const erratum = rec.citation_erratum;
    const mistaken = incorrectSourceLinks[original];
    const replacement = sourceLinkUpdates[original];
    const destination = mistaken ? mistaken.related : (replacement || original);
    const warning = mistaken
      ? '<p>The original dataset citation points to a different work (' + esc(mistaken.work) + '). This does not authenticate the record.</p>'
      : (replacement ? '<p>Original dataset citation unavailable. This does not authenticate the record.</p>' : '');
    let link = '';
    if (destination) {
      try {
        const url = new URL(destination);
        if (/^https?:$/.test(url.protocol) && isEbookDestination(url)) {
          link = '<p>Book source credited in the record metadata; no ebook link is provided.</p>';
        } else if (/^https?:$/.test(url.protocol)) {
          link = '<a href="' + esc(url.href) + '" target="_blank" rel="noopener noreferrer">' +
            (replacement || mistaken ? 'Related verified resource' : 'Dataset source citation') + '</a>';
        }
      } catch (error) { /* Retain any warning; never turn malformed text into a link. */ }
    }
    const note = erratum && erratum.note
      ? '<p>Citation note: ' + esc(erratum.note) + '</p>'
      : '';
    return link || warning || note
      ? '<div class="corpus-source" style="margin-top:0.7em;font-size:0.9em">' + link + warning + note + '</div>'
      : '';
  }

  function recordStatus(rec) {
    const pair = {
      verified_pair: rec.verification_method === 'engine_replay'
        ? 'Plaintext/ciphertext pair reproduces with a museum engine.'
        : (rec.verification_method === 'documented_computation'
          ? 'Plaintext/ciphertext pair checked by documented computation.'
          : 'Pair is marked verified; check its stated verification method.'),
      unverified_pair: 'Plaintext/ciphertext pair has not been independently verified; do not use as a known-answer test.',
      not_a_pair: 'Plaintext and ciphertext cover different extents; do not use as a known-answer pair.'
    }[rec.pair_status] || 'Pair verification status unknown.';
    const provenance = {
      synthetic: 'Synthetic exercise.',
      reconstruction: 'Teaching reconstruction, not a historical transcription.',
      catalogued_unreviewed: 'Historical source attribution has not been independently verified.',
      authentic_excerpt: 'Historical excerpt; see the record source for its scope.',
      authentic_artifact: 'Historical artifact; see the record source for its scope.'
    }[rec.authenticity] || 'Provenance not independently verified.';
    return '<div class="corpus-status">' +
      '<b>v0.8 record:</b> ' + esc(provenance) + ' ' + esc(pair) + '</div>';
  }

  // Safely escape HTML to prevent XSS from record data
  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Page state for pagination
  const PAGE_SIZE = 12;
  let page = 0;
  let filtered = records;

  function applyFilter() {
    const q = ((document.getElementById('corpus-search') || {}).value || '').trim();
    const diff = (document.getElementById('corpus-diff-filter') || {}).value || '';
    filtered = records.filter(r => {
      if (diff && r.difficulty !== diff) return false;
      if (q) {
        const haystack = (r.cipher_type + ' ' + r.cipher_family + ' ' + r.language + ' ' + r.title).toLowerCase();
        if (!haystack.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    page = 0;
    renderCards();
  }

  function renderCards() {
    const container = document.getElementById('corpus-cards');
    if (!container) return;
    container.innerHTML = '';

    const start = page * PAGE_SIZE;
    const pageRecords = filtered.slice(start, start + PAGE_SIZE);

    if (filtered.length === 0) {
      container.innerHTML = '<p style="color:var(--fg-muted,#bfa76a)">No records match.</p>';
      renderPager();
      return;
    }

    for (const rec of pageRecords) {
      container.appendChild(renderCard(rec));
    }
    renderPager();
  }

  function renderPager() {
    let pager = document.getElementById('corpus-pager');
    if (!pager) {
      pager = document.createElement('div');
      pager.id = 'corpus-pager';
      pager.style.cssText = 'display:flex;gap:0.5em;align-items:center;margin:1em 0;flex-wrap:wrap;';
      const container = document.getElementById('corpus-cards');
      if (container) container.after(pager);
    }
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    pager.innerHTML = '';

    if (totalPages <= 1) return;

    const prev = document.createElement('button');
    prev.textContent = '← Prev';
    prev.disabled = page === 0;
    prev.onclick = () => { page--; renderCards(); window.scrollTo(0,0); };
    pager.appendChild(prev);

    const info = document.createElement('span');
    info.style.cssText = 'color:var(--fg-muted,#bfa76a);font-size:0.95em;';
    info.textContent = `Page ${page + 1} of ${totalPages} (${filtered.length} records)`;
    pager.appendChild(info);

    const next = document.createElement('button');
    next.textContent = 'Next →';
    next.disabled = page >= totalPages - 1;
    next.onclick = () => { page++; renderCards(); window.scrollTo(0,0); };
    pager.appendChild(next);
  }

  function renderCard(rec) {
    const card = document.createElement('div');
    card.className = 'corpus-card';
    const isChallenge = mode === 'challenge';

    // Safe onclick handler using data-id instead of inline string injection
    card.innerHTML = `
      <div><b>${esc(rec.title)}</b></div>
      <div class="corpus-meta">
        <span>${esc(rec.cipher_type)}</span> | <span>${esc(rec.cipher_family)}</span> | <span>${esc(rec.difficulty)}</span> | <span>${esc(rec.language)}</span> | <span>${esc(rec.source_type)}</span>
      </div>
      <div class="ciphertext-block corpus-ciphertext">${esc(rec.ciphertext)}</div>
      ${recordStatus(rec)}
      <div class="corpus-visuals" style="margin:0.7em 0 0.7em 0;">
        <div><b>Letter Frequency</b></div>
        <canvas width="220" height="60" class="freq-canvas"></canvas>
        <div style="margin-top:0.5em;"><b>Bigram Heatmap</b></div>
        <canvas width="220" height="60" class="bigram-canvas"></canvas>
      </div>
      <div class="corpus-actions">
        <button class="btn-copy">Copy Ciphertext</button>
        <button class="btn-detective">Try in Cipher Detective</button>
        <button class="btn-workbench">Open in Workbench</button>
        <button class="btn-download-rec">Download Record</button>
      </div>
      <div class="corpus-reveal" style="margin-top:0.7em;${isChallenge ? '' : 'display:none;'}">
        <button class="btn-reveal" data-reveal="hint">Reveal Hint</button>
        <button class="btn-reveal" data-reveal="cipher">Reveal Cipher Type</button>
        <button class="btn-reveal" data-reveal="key">Reveal Key</button>
        <button class="btn-reveal" data-reveal="plaintext">Reveal Plaintext</button>
      </div>
      <div class="corpus-known" style="${isChallenge ? 'display:none;' : ''}margin-top:0.7em;">
        <div style="font-size:0.93em;color:var(--fg-muted,#bfa76a)">
          <b>Plaintext:</b> <span class="known-plaintext">${esc(rec.plaintext)}</span><br>
          <b>Key:</b> <code>${esc(JSON.stringify(rec.key))}</code><br>
          <b>Attacks:</b> ${esc((rec.expected_attacks || []).join(', '))}
          ${rec.scoring_notes ? '<br><b>Scoring:</b> ' + esc(rec.scoring_notes) : ''}
        </div>
      </div>
      ${sourceLink(rec)}
      <div class="corpus-details" style="display:none;margin-top:0.7em;font-size:0.93em;color:var(--fg-muted,#bfa76a);"></div>
    `;

    // Draw frequency and bigram visualisations
    setTimeout(() => {
      const freqCanvas = card.querySelector('.freq-canvas');
      if (freqCanvas) drawFrequencyBar(freqCanvas, rec.ciphertext);
      const bigramCanvas = card.querySelector('.bigram-canvas');
      if (bigramCanvas) drawBigramHeatmap(bigramCanvas, rec.ciphertext);
    }, 0);

    // Wire up buttons using event listeners — no inline JS, no XSS risk
    card.querySelector('.btn-copy').addEventListener('click', function() {
      const button = this;
      function selectForCopy() {
        const block = card.querySelector('.ciphertext-block');
        const range = document.createRange(); range.selectNodeContents(block);
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
        button.textContent = 'Text selected — copy manually';
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(rec.ciphertext).then(() => {
          button.textContent = 'Copied!';
          setTimeout(() => { button.textContent = 'Copy Ciphertext'; }, 1200);
        }, selectForCopy);
      } else selectForCopy();
    });
    card.querySelector('.btn-detective').addEventListener('click', () => {
      openInDetective(rec.ciphertext);
    });
    card.querySelector('.btn-workbench').addEventListener('click', () => {
      openInWorkbench(rec.ciphertext);
    });
    card.querySelector('.btn-download-rec').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = rec.id + '.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    });

    card.querySelectorAll('.btn-reveal').forEach(btn => {
      btn.addEventListener('click', function() {
        const details = card.querySelector('.corpus-details');
        details.style.display = 'block';
        const type = this.dataset.reveal;
        if (type === 'hint') details.textContent = rec.notes || 'No hint available.';
        if (type === 'cipher') details.textContent = 'Cipher type: ' + rec.cipher_type;
        if (type === 'key') details.textContent = 'Key: ' + JSON.stringify(rec.key);
        if (type === 'plaintext') details.textContent = 'Plaintext: ' + rec.plaintext;
      });
    });

    return card;
  }

  function drawFrequencyBar(canvas, text) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const counts = Array(26).fill(0);
    const A = 'A'.charCodeAt(0);
    for (const c of text.toUpperCase()) {
      const code = c.charCodeAt(0) - A;
      if (code >= 0 && code < 26) counts[code]++;
    }
    const max = Math.max(...counts, 1);
    for (let i = 0; i < 26; ++i) {
      const x = i * 8 + 6;
      const h = Math.round((counts[i] / max) * 50);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(x, 55 - h, 6, h);
      ctx.fillStyle = '#bfa76a';
      ctx.font = '8px monospace';
      ctx.fillText(String.fromCharCode(A + i), x, 59);
    }
  }

  function drawBigramHeatmap(canvas, text) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bigrams = {};
    let prev = null;
    for (const c of text.toUpperCase()) {
      if (c >= 'A' && c <= 'Z') {
        if (prev) bigrams[prev + c] = (bigrams[prev + c] || 0) + 1;
        prev = c;
      }
    }
    const entries = Object.entries(bigrams).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const max = entries.length ? entries[0][1] : 1;
    entries.forEach(([bg, count], i) => {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(10, 6 + i * 5, Math.round((count / max) * 180), 4);
      ctx.fillStyle = '#bfa76a';
      ctx.font = '8px monospace';
      ctx.fillText(bg, 2, 10 + i * 5);
    });
  }

  // Mode toggle — button group (.mode-btn / .mode-btn.active)
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode));
    btn.addEventListener('click', function() {
      document.querySelectorAll('.mode-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      this.classList.add('active');
      this.setAttribute('aria-pressed', 'true');
      mode = this.dataset.mode;
      const explanation = document.getElementById('mode-explanation');
      if (explanation) {
        explanation.textContent = mode === 'challenge'
          ? 'Challenge Mode hides the solution — attempt a ciphertext-only solve. Switch to Known Answers to see plaintext, key, and expected attacks.'
          : 'Known Answers shows plaintext, key, and expected attacks for each record — for teaching, benchmarking, and tool development.';
      }
      renderCards();
    });
  });

  // Wire up filter controls if present
  const searchInput = document.getElementById('corpus-search');
  if (searchInput) searchInput.addEventListener('input', applyFilter);
  const diffFilter = document.getElementById('corpus-diff-filter');
  if (diffFilter) diffFilter.addEventListener('change', applyFilter);

  renderCards();
})();
```


## JavaScript — js/cipher-detective.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/cipher-detective.js`
- Served SHA-256: `402c542f823162b39cdaaf7dedf1e58b7a9058b79157601f418bd135ccf466c2`
- Readable-source SHA-256: `402c542f823162b39cdaaf7dedf1e58b7a9058b79157601f418bd135ccf466c2`


```javascript
/* ================================================================
   THE CIPHER MUSEUM — Cipher Detective v1.5 compatibility shim

   This file loads the v1.5 modular sub-packages and re-exports
   window.CipherDetective for backward compatibility with
   test-comprehensive.js and any other callers.

   In the browser the four <script> tags in cipher-detective.html
   load the modules directly; this shim is only used by Node.js
   test runners that require() this single file.
   ================================================================ */
'use strict';

if (typeof require !== 'undefined') {
  /* Node / test runner context: load sub-modules explicitly. */
  require('./detective/analyses.js');
  require('./detective/scoring.js');
  require('./detective/render.js');
  require('./detective/detective.js');
}
/* In a browser context the <script> tags in the HTML page are
   sufficient; nothing more needs to happen here. */
```
