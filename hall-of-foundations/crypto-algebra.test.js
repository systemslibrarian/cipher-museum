/* crypto-algebra.test.js — run: node crypto-algebra.test.js
   Exits non-zero on failure for CI. */
"use strict";
var CA = require("./crypto-algebra.js");

var passed = 0, failed = 0;
function assert(cond, msg) { if (cond) passed++; else { failed++; console.error("  ✗ FAIL: " + msg); } }
function eqArr(a, b) { return a.length === b.length && a.every(function (v, i) { return v === b[i]; }); }

// ---- ring multiplication in Z_17[X]/(X^4+1) ----
assert(eqArr(CA.ringMul([1, 2, 3, 4], [0, 1, 0, 1], 4, 17), [11, 15, 15, 4]),
  "negacyclic mul matches hand computation");
// multiplying by 1 is identity
assert(eqArr(CA.ringMul([5, 6, 7, 8], [1, 0, 0, 0], 4, 17), [5, 6, 7, 8]),
  "multiply by 1 is identity");
// X * X^{n-1} wraps to -1 (i.e. q-1)
assert(eqArr(CA.ringMul([0, 1, 0, 0], [0, 0, 0, 1], 4, 17), [16, 0, 0, 0]),
  "X * X^3 = X^4 = -1 = 16 mod 17");
// commutativity
assert(eqArr(CA.ringMul([2, 0, 1, 3], [1, 4, 0, 2], 4, 13),
  CA.ringMul([1, 4, 0, 2], [2, 0, 1, 3], 4, 13)), "ring multiplication commutes");
// ring addition wraps mod q
assert(eqArr(CA.ringAdd([10, 10, 10, 10], [10, 10, 10, 10], 4, 17), [3, 3, 3, 3]),
  "ring addition reduces mod q");

// ---- Shamir / Lagrange ----
var p = 1613;
var coeffs = [1234, 166, 94]; // secret 1234, degree 2 -> need 3 shares
function share(x) { return [x, CA.polyEval(coeffs, x, p)]; }
var shares = [share(1), share(2), share(3), share(4), share(5)];
assert(CA.lagrangeAtZero(shares.slice(0, 3), p) === 1234, "3 shares recover the secret");
assert(CA.lagrangeAtZero([shares[1], shares[3], shares[4]], p) === 1234,
  "a different 3 shares recover the same secret");
assert(CA.lagrangeAtZero(shares.slice(0, 2), p) !== 1234,
  "2 shares (below threshold) do NOT recover the secret");
assert(CA.lagrangeAtZero([share(9)], p) === CA.polyEval(coeffs, 9, p),
  "1 point interpolates to itself trivially");
// polyEval sanity
assert(CA.polyEval([3, 0, 0], 99, 1613) === 3, "constant polynomial evaluates to the constant");
assert(CA.polyEval([0, 1, 0], 7, 1613) === 7, "identity polynomial f(x)=x gives x");

// ---- pairing bilinearity ----
[[3, 5], [7, 4], [2, 9], [1, 1], [6, 6]].forEach(function (pr) {
  var r = CA.pairingCheck(pr[0], pr[1], 5, 23);
  assert(r.equal, "e(aP,bQ) = e(P,Q)^(ab) for a=" + pr[0] + ", b=" + pr[1]);
});
// symmetry in the exponent: e(P,Q)^(ab) = e(P,Q)^(ba)
var s1 = CA.pairingCheck(3, 5, 5, 23).viaProduct;
var s2 = CA.pairingCheck(5, 3, 5, 23).viaProduct;
assert(s1 === s2, "pairing exponent is symmetric (ab = ba)");

// ---- modInv edge ----
assert(CA.modInv(1, 13) === 1, "inverse of 1 is 1");
assert(CA.mod(CA.modInv(5, 13) * 5, 13) === 1, "modInv(5,13) times 5 is 1 mod 13");

console.log("\ncrypto-algebra: " + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
