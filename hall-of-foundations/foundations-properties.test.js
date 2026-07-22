/* foundations-properties.test.js — run: node foundations-properties.test.js
   Property-based fuzzing (fast-check) of the wing's math modules: algebraic
   laws that must hold for ALL inputs, not just the hand-picked vectors in
   the unit tests. Exits non-zero on failure for CI. */
"use strict";
var fc = require("fast-check");
var CA = require("./crypto-algebra.js");
var LM = require("./lattice-math.js");
var EC = require("./ec-math.js");

var passed = 0, failed = 0;
// Fixed seed: CI must be deterministic — a property that only fails on some
// seeds should be caught here once and then reproduce forever.
var SEED = 20260721;
function prop(name, property, runs) {
  try {
    fc.assert(property, { numRuns: runs || 200, seed: SEED });
    passed++;
  } catch (e) {
    failed++;
    console.error("  ✗ FAIL: " + name + "\n    " + String(e.message || e).split("\n")[0]);
  }
}

var smallPrime = fc.constantFrom(5, 7, 11, 13, 17, 19, 23, 29, 31);
var coeff = fc.integer({ min: -50, max: 50 });
var poly4 = fc.array(coeff, { minLength: 4, maxLength: 4 });

// ---- powmod agrees with BigInt exponentiation ----
prop("powmod(g,e,m) = g^e mod m (vs BigInt)", fc.property(
  fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 0, max: 40 }), fc.integer({ min: 2, max: 1000 }),
  function (g, e, m) {
    var expect = Number(BigInt(g) ** BigInt(e) % BigInt(m));
    return CA.powmod(g, e, m) === expect;
  }
));

// ---- ring R_q = Z_q[X]/(X^4+1) laws ----
function eqArr(a, b) { return a.length === b.length && a.every(function (v, i) { return v === b[i]; }); }
prop("ringMul commutes", fc.property(poly4, poly4, smallPrime, function (a, b, q) {
  return eqArr(CA.ringMul(a, b, 4, q), CA.ringMul(b, a, 4, q));
}));
prop("ringMul associates", fc.property(poly4, poly4, poly4, smallPrime, function (a, b, c, q) {
  return eqArr(CA.ringMul(CA.ringMul(a, b, 4, q), c, 4, q),
               CA.ringMul(a, CA.ringMul(b, c, 4, q), 4, q));
}));
prop("ringMul distributes over ringAdd", fc.property(poly4, poly4, poly4, smallPrime, function (a, b, c, q) {
  var left = CA.ringMul(a, CA.ringAdd(b, c, 4, q), 4, q);
  var right = CA.ringAdd(CA.ringMul(a, b, 4, q), CA.ringMul(a, c, 4, q), 4, q);
  return eqArr(left, right);
}));
prop("multiplying by 1 is the identity", fc.property(poly4, smallPrime, function (a, q) {
  var one = [1, 0, 0, 0];
  var norm = a.map(function (v) { return CA.mod(v, q); });
  return eqArr(CA.ringMul(a, one, 4, q), norm);
}));

// ---- Shamir: any k of n shares recover the secret; k-1 do not pin it ----
prop("Lagrange recovers f(0) from any 3 of 5 shares", fc.property(
  fc.integer({ min: 0, max: 1612 }), fc.integer({ min: 0, max: 1612 }), fc.integer({ min: 0, max: 1612 }),
  fc.uniqueArray(fc.integer({ min: 1, max: 30 }), { minLength: 3, maxLength: 3 }),
  function (s, c1, c2, xs) {
    var p = 1613, coeffs = [s, c1, c2];
    var shares = xs.map(function (x) { return [x, CA.polyEval(coeffs, x, p)]; });
    return CA.lagrangeAtZero(shares, p) === s;
  }
));

// ---- pairing bilinearity for arbitrary exponents ----
prop("e(aP,bQ) = e(P,Q)^(ab)", fc.property(
  fc.integer({ min: 0, max: 60 }), fc.integer({ min: 0, max: 60 }),
  fc.constantFrom(2, 3, 5, 7), fc.constantFrom(23, 47, 59),
  function (a, b, base, m) { return CA.pairingCheck(a, b, base, m).equal; }
));

// ---- elliptic curve over F_p: group laws on random smooth curves ----
var curveArb = fc.tuple(smallPrime, fc.integer({ min: 0, max: 20 }), fc.integer({ min: 0, max: 20 }))
  .filter(function (t) {
    // smooth mod p: discriminant 4a^3 + 27b^2 not divisible by p
    return EC.mod(4 * t[1] * t[1] * t[1] + 27 * t[2] * t[2], t[0]) !== 0;
  });
prop("ecAdd is closed and commutative on random smooth curves", fc.property(
  curveArb, fc.nat(200), fc.nat(200),
  function (curve, i, j) {
    var p = curve[0], a = curve[1], b = curve[2];
    var pts = EC.ecPoints(a, b, p);
    if (pts.length === 0) return true;
    var P = pts[i % pts.length], Q = pts[j % pts.length];
    var S = EC.ecAdd(P, Q, a, p), T = EC.ecAdd(Q, P, a, p);
    if (!EC.ecIsOnCurve(S, a, b, p)) return false;
    if (S === null || T === null) return S === T;
    return S[0] === T[0] && S[1] === T[1];
  }
));
prop("Hasse bound holds on random smooth curves", fc.property(curveArb, function (curve) {
  var p = curve[0], N = EC.ecPoints(curve[1], curve[2], p).length + 1;
  return Math.abs(N - (p + 1)) <= 2 * Math.sqrt(p);
}));

// ---- real group law: P+Q stays on the curve, sum reflects the chord ----
// The identity is exact mathematics; only float error separates the sides,
// so compare with a RELATIVE tolerance (large slopes cube the coordinates).
prop("real chord-and-tangent lands on the curve", fc.property(
  fc.double({ min: -1.3, max: 3.0, noNaN: true }), fc.double({ min: -1.3, max: 3.0, noNaN: true }),
  function (x1, x2) {
    var a = 1, b = 1;
    var v1 = EC.curveY2(x1, a, b), v2 = EC.curveY2(x2, a, b);
    if (v1 <= 1e-2 || v2 <= 1e-2) return true;           // stay off the x-intercept
    var P = [x1, Math.sqrt(v1)], Q = [x2, -Math.sqrt(v2)];
    if (Math.abs(P[0] - Q[0]) < 1e-3) return true;        // near-vertical chord -> infinity
    var r = EC.ecAddReal(P, Q, a);
    if (Math.abs(r.slope) > 50) return true;              // numerically wild chords excluded
    var lhs = r.sum[1] * r.sum[1], rhs = EC.curveY2(r.sum[0], a, b);
    var scale = Math.max(1, Math.abs(lhs), Math.abs(rhs));
    return Math.abs(lhs - rhs) / scale < 1e-9;
  }
));

// ---- lattices: Babai rounding with zero noise is exact ----
var basisArb = fc.tuple(
  fc.integer({ min: -5, max: 5 }), fc.integer({ min: -5, max: 5 }),
  fc.integer({ min: -5, max: 5 }), fc.integer({ min: -5, max: 5 })
).map(function (t) { return [[t[0], t[1]], [t[2], t[3]]]; })
 .filter(function (b) { return LM.det2(b[0], b[1]) !== 0; });
prop("lweRecover with zero error is exact for any non-degenerate basis", fc.property(
  basisArb, fc.integer({ min: -5, max: 5 }), fc.integer({ min: -5, max: 5 }),
  function (basis, u, v) {
    var b1 = basis[0], b2 = basis[1];
    var point = { x: u * b1[0] + v * b2[0], y: u * b1[1] + v * b2[1] };
    return LM.lweRecover(point, { x: 0, y: 0 }, b1, b2).ok;
  }
));
prop("degenerate basis returns null, never throws", fc.property(
  fc.integer({ min: -9, max: 9 }), fc.integer({ min: -9, max: 9 }),
  function (x, y) {
    return LM.babaiRound({ x: 1, y: 1 }, [x, y], [x, y]) === null;  // det = 0
  }
));

console.log("\nfoundations-properties: " + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
