/* ==========================================================================
   protocol-math.js — pure logic for the museum's modern protocol exhibits.
   No DOM. Backs:
     ciphers/ecdsa.html                 (§158)
     ciphers/shamir-secret-sharing.html (§159)
     ciphers/zero-knowledge-proofs.html (§160)

   These three are protocols, not ciphers: they sign, share and prove rather
   than encrypt. Each is the deployed counterpart of a Hall of Foundations
   exhibit — §150 elliptic curves, §155 interpolation, §154 Fiat-Shamir — and
   the mathematics here is the same mathematics, at working size.

   All randomness is injected by the caller as explicit values, so every
   result is reproducible and the CI tests can replay exact cases.
   Exposed on window.ProtocolMath (browser) and module.exports (Node/CI).
   ========================================================================== */
(function (root) {
  "use strict";

  function mod(a, m) { return ((a % m) + m) % m; }

  // Modular inverse by extended Euclid. null when gcd(a, m) != 1.
  function modInv(a, m) {
    var t = 0, newT = 1, r = m, newR = mod(a, m);
    while (newR !== 0) {
      var q = Math.floor(r / newR);
      var tmp = t - q * newT; t = newT; newT = tmp;
      tmp = r - q * newR; r = newR; newR = tmp;
    }
    if (r > 1) return null;
    return mod(t, m);
  }

  function powmod(b, e, m) {
    var result = 1; b = mod(b, m);
    while (e > 0) {
      if (e & 1) result = mod(result * b, m);
      b = mod(b * b, m);
      e = Math.floor(e / 2);
    }
    return result;
  }

  /* ---------------------------------------------------------------- curves */
  // Points are {x, y}; the point at infinity is null (the group identity).

  function ecAdd(P, Q, a, p) {
    if (P === null) return Q;
    if (Q === null) return P;
    if (P.x === Q.x && mod(P.y + Q.y, p) === 0) return null; // P + (-P)
    var lam;
    if (P.x === Q.x && P.y === Q.y) {
      var inv2y = modInv(mod(2 * P.y, p), p);
      if (inv2y === null) return null;
      lam = mod((3 * P.x * P.x + a) * inv2y, p);
    } else {
      var invdx = modInv(mod(Q.x - P.x, p), p);
      if (invdx === null) return null;
      lam = mod((Q.y - P.y) * invdx, p);
    }
    var x = mod(lam * lam - P.x - Q.x, p);
    return { x: x, y: mod(lam * (P.x - x) - P.y, p) };
  }

  // Scalar multiplication by double-and-add.
  function ecMul(k, P, a, p) {
    var R = null, N = P;
    if (k < 0) return null;
    while (k > 0) {
      if (k & 1) R = ecAdd(R, N, a, p);
      N = ecAdd(N, N, a, p);
      k = Math.floor(k / 2);
    }
    return R;
  }

  function ecOnCurve(P, a, b, p) {
    if (P === null) return true;
    return mod(P.y * P.y, p) === mod(P.x * P.x * P.x + a * P.x + b, p);
  }

  /* ---------------------------------------------------------------- ECDSA */
  // curve = {a, b, p, G, n} — n is the (prime) order of G.
  // h is the message hash reduced into [0, n). k is the per-signature nonce.
  // Returns null when the nonce produces a degenerate signature, which is the
  // real algorithm's behaviour too: you resample and try again.
  function ecdsaSign(h, d, k, curve) {
    var R = ecMul(k, curve.G, curve.a, curve.p);
    if (R === null) return null;
    var r = mod(R.x, curve.n);
    if (r === 0) return null;
    var kInv = modInv(k, curve.n);
    if (kInv === null) return null;
    var s = mod(kInv * mod(h + r * d, curve.n), curve.n);
    if (s === 0) return null;
    return { r: r, s: s };
  }

  function ecdsaVerify(h, sig, Q, curve) {
    if (!sig) return false;
    if (sig.r <= 0 || sig.r >= curve.n || sig.s <= 0 || sig.s >= curve.n) return false;
    if (!ecOnCurve(Q, curve.a, curve.b, curve.p) || Q === null) return false;
    var w = modInv(sig.s, curve.n);
    if (w === null) return false;
    var u1 = mod(h * w, curve.n);
    var u2 = mod(sig.r * w, curve.n);
    var X = ecAdd(ecMul(u1, curve.G, curve.a, curve.p),
                  ecMul(u2, Q, curve.a, curve.p), curve.a, curve.p);
    if (X === null) return false;
    return mod(X.x, curve.n) === sig.r;
  }

  // The failure that broke the PlayStation 3 and drained Bitcoin wallets:
  // sign twice with the same nonce and the private key falls out by algebra.
  //   s1 = k^-1 (h1 + r d),  s2 = k^-1 (h2 + r d)
  //   => k = (h1 - h2) / (s1 - s2),  then d = (s1 k - h1) / r
  // Returns {k, d} or null if the two signatures do not share a nonce.
  function recoverFromReusedNonce(h1, s1, h2, s2, r, n) {
    var ds = mod(s1 - s2, n);
    if (ds === 0) return null;
    var dsInv = modInv(ds, n);
    if (dsInv === null) return null;
    var k = mod(mod(h1 - h2, n) * dsInv, n);
    var rInv = modInv(r, n);
    if (rInv === null) return null;
    var d = mod(mod(mod(s1 * k, n) - h1, n) * rInv, n);
    return { k: k, d: d };
  }

  /* ------------------------------------------------------ Shamir sharing */
  // Split `secret` so that any `k` of `n` shares reconstruct it and any k-1
  // reveal nothing. coeffs are the k-1 random coefficients above the constant
  // term, supplied by the caller.
  function shamirSplit(secret, k, n, p, coeffs) {
    var poly = [mod(secret, p)];
    for (var i = 0; i < k - 1; i++) poly.push(mod(coeffs[i], p));
    var shares = [];
    for (var x = 1; x <= n; x++) shares.push({ x: x, y: polyEval(poly, x, p) });
    return { shares: shares, poly: poly };
  }

  function polyEval(poly, x, p) {
    var acc = 0;
    for (var i = poly.length - 1; i >= 0; i--) acc = mod(acc * x + poly[i], p);
    return acc;
  }

  // Lagrange interpolation evaluated at zero — the constant term is the secret.
  function shamirCombine(shares, p) {
    var total = 0;
    for (var i = 0; i < shares.length; i++) {
      var num = 1, den = 1;
      for (var j = 0; j < shares.length; j++) {
        if (i === j) continue;
        num = mod(num * mod(-shares[j].x, p), p);
        den = mod(den * mod(shares[i].x - shares[j].x, p), p);
      }
      var dInv = modInv(den, p);
      if (dInv === null) return null;
      total = mod(total + mod(shares[i].y * mod(num * dInv, p), p), p);
    }
    return total;
  }

  /* --------------------------------------------- Schnorr zero-knowledge */
  // group = {p, q, g} with g of prime order q modulo p. Public key y = g^x.
  //   commit:  t = g^r
  //   respond: s = r + c x  (mod q)
  //   verify:  g^s == t * y^c  (mod p)
  function schnorrCommit(r, group) { return powmod(group.g, r, group.p); }
  function schnorrRespond(r, c, x, group) { return mod(r + c * x, group.q); }
  function schnorrVerify(t, c, s, y, group) {
    return powmod(group.g, s, group.p) === mod(t * powmod(y, c, group.p), group.p);
  }

  // The zero-knowledge argument, made concrete: pick the response and the
  // challenge first, then solve for the commitment. The transcript verifies
  // perfectly and no secret was used — which is exactly why a real transcript
  // proves nothing to anyone who did not choose the challenge themselves.
  function schnorrSimulate(c, s, y, group) {
    var yc = powmod(y, c, group.p);
    var inv = modInv(yc, group.p);
    if (inv === null) return null;
    return { t: mod(powmod(group.g, s, group.p) * inv, group.p), c: c, s: s };
  }

  // Soundness from the other side: a prover who can answer two different
  // challenges on one commitment must know the secret, and it drops out.
  //   s1 - s2 = (c1 - c2) x  =>  x = (s1 - s2) / (c1 - c2)
  function schnorrExtract(s1, c1, s2, c2, group) {
    var dc = mod(c1 - c2, group.q);
    if (dc === 0) return null;
    var inv = modInv(dc, group.q);
    if (inv === null) return null;
    return mod(mod(s1 - s2, group.q) * inv, group.q);
  }

  var api = {
    mod: mod, modInv: modInv, powmod: powmod,
    ecAdd: ecAdd, ecMul: ecMul, ecOnCurve: ecOnCurve,
    ecdsaSign: ecdsaSign, ecdsaVerify: ecdsaVerify,
    recoverFromReusedNonce: recoverFromReusedNonce,
    shamirSplit: shamirSplit, shamirCombine: shamirCombine, polyEval: polyEval,
    schnorrCommit: schnorrCommit, schnorrRespond: schnorrRespond,
    schnorrVerify: schnorrVerify, schnorrSimulate: schnorrSimulate,
    schnorrExtract: schnorrExtract,
    // The toy parameters the exhibits use, kept here so pages and tests agree.
    // y^2 = x^3 + 3x + 2 over F_97: 102 affine points plus infinity, so the
    // group has prime order 103 and every point except infinity generates it.
    CURVE: { a: 3, b: 2, p: 97, G: { x: 2, y: 4 }, n: 103 },
    GROUP: { p: 467, q: 233, g: 4 },
    SHAMIR_P: 257
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ProtocolMath = api;

})(typeof self !== "undefined" ? self : this);
