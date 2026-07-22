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
  // all arithmetic mod p. points: [[x,y], ...]. Returns the secret f(0).
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
    ringMul, ringAdd,
    lagrangeAtZero, polyEval,
    powmod, pairingCheck
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CryptoAlgebra = api;

})(typeof self !== "undefined" ? self : this);
