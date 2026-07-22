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
