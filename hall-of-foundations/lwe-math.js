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
  // the true message should use this instead: |residual| > q/4 is exactly the
  // condition under which rounding tips to the wrong bit.
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
