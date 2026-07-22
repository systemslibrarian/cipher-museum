/* lwe-math.test.js — run with: node lwe-math.test.js
   Exits non-zero on any failure, so it drops straight into a GitHub Actions step. */
"use strict";
var L = require("./lwe-math.js");

var passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; }
  else { failed++; console.error("  ✗ FAIL: " + msg); }
}
function eqVec(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

var Q = 97; // prime, matches the exhibit
var N = 4;

// ---- modular plumbing ----
assert(L.mod(-1, Q) === 96, "mod maps -1 to q-1, not -1");
assert(L.center(96, Q) === -1, "center reads 96 as -1 of noise");
assert(L.center(48, Q) === 48, "center leaves the lower half alone");
assert(L.modInv(5, Q) * 5 % Q === 1, "modInv(5) is a genuine inverse mod 97");
assert(L.modInv(0, Q) === null, "0 has no inverse");
var invOk = true;
for (var a = 1; a < Q; a++) if (L.mod(a * L.modInv(a, Q), Q) !== 1) invOk = false;
assert(invOk, "every nonzero residue mod 97 inverts correctly");

// ---- transpose is an involution ----
var Atest = [[1, 2, 3], [4, 5, 6]];
assert(JSON.stringify(L.transpose(L.transpose(Atest))) === JSON.stringify(Atest),
  "transpose twice is the identity");

// ---- deterministic PRNG so failures are reproducible ----
var seed = 20260722;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
function randInt(lo, hi) { return lo + Math.floor(rnd() * (hi - lo + 1)); }
function randMat(n) {
  var M = [];
  for (var i = 0; i < n; i++) {
    var row = [];
    for (var j = 0; j < n; j++) row.push(randInt(0, Q - 1));
    M.push(row);
  }
  return M;
}
function randSmall(n, b) {
  var v = [];
  for (var i = 0; i < n; i++) v.push(randInt(-b, b));
  return v;
}

// ---- the central claim: no noise means no security ----
// With e = 0 the LWE sample is an ordinary linear system, and elimination
// recovers the secret exactly. This is why the error term exists at all.
var cleanRecovered = 0, cleanTrials = 0;
for (var trial = 0; trial < 400; trial++) {
  var A = randMat(N);
  var s = randSmall(N, 1);
  var t0 = L.lweSample(A, s, [0, 0, 0, 0], Q);
  var x = L.gaussianSolve(A, t0, Q);
  if (x === null) continue; // singular A, skip
  cleanTrials++;
  var sMod = s.map(function (v) { return L.mod(v, Q); });
  if (eqVec(x, sMod)) cleanRecovered++;
}
assert(cleanTrials > 300, "most random 4x4 matrices mod 97 are invertible (" + cleanTrials + "/400)");
assert(cleanRecovered === cleanTrials,
  "with zero error, elimination recovers s every single time (" + cleanRecovered + "/" + cleanTrials + ")");

// ---- and the flip side: any noise at all destroys that ----
// Elimination cannot see the error, so it returns a confident wrong answer.
var noisyRecovered = 0, noisyTrials = 0;
for (trial = 0; trial < 400; trial++) {
  var A2 = randMat(N);
  var s2 = randSmall(N, 1);
  var e2v = randSmall(N, 1);
  if (e2v.every(function (v) { return v === 0; })) continue; // need actual noise
  var t2 = L.lweSample(A2, s2, e2v, Q);
  var x2 = L.gaussianSolve(A2, t2, Q);
  if (x2 === null) continue;
  noisyTrials++;
  var s2Mod = s2.map(function (v) { return L.mod(v, Q); });
  if (eqVec(x2, s2Mod)) noisyRecovered++;
}
assert(noisyTrials > 250, "enough noisy trials to be meaningful (" + noisyTrials + ")");
assert(noisyRecovered / noisyTrials < 0.02,
  "with error present, elimination essentially never recovers s (" +
  noisyRecovered + "/" + noisyTrials + ")");

// ---- the round trip: encrypt then decrypt, both bits ----
var rtOk = 0, rtTotal = 0;
for (trial = 0; trial < 600; trial++) {
  var A3 = randMat(N);
  var s3 = randSmall(N, 1);
  var e3 = randSmall(N, 1);
  var t3 = L.lweSample(A3, s3, e3, Q);
  var m = trial % 2;
  var r = randSmall(N, 1), e1 = randSmall(N, 1), ee2 = randInt(-1, 1);
  var ct = L.encryptBit(A3, t3, m, r, e1, ee2, Q);
  var out = L.decryptBit(ct.u, ct.v, s3, Q);
  rtTotal++;
  if (out.bit === m) rtOk++;
}
assert(rtOk === rtTotal, "small-noise round trip is exact for both bits (" + rtOk + "/" + rtTotal + ")");

// ---- the cancellation identity, stated directly ----
// v - s·u should equal m*floor(q/2) plus noise well inside the budget.
var budget = L.noiseBudget(Q);
assert(budget === 24, "noise budget at q=97 is floor(q/4) = 24");
var worstNoise = 0;
for (trial = 0; trial < 600; trial++) {
  var A4 = randMat(N), s4 = randSmall(N, 1), e4 = randSmall(N, 1);
  var t4 = L.lweSample(A4, s4, e4, Q);
  var m4 = trial % 2;
  var ct4 = L.encryptBit(A4, t4, m4, randSmall(N, 1), randSmall(N, 1), randInt(-1, 1), Q);
  var d4 = L.decryptBit(ct4.u, ct4.v, s4, Q);
  worstNoise = Math.max(worstNoise, Math.abs(d4.noise));
}
assert(worstNoise < budget,
  "residual noise always stays inside the budget at b=1 (worst " + worstNoise + " < " + budget + ")");

// ---- and the budget is real: crank the error and decryption breaks ----
// This is the property the exhibit's slider demonstrates.
function successRate(bound, trials) {
  var ok = 0;
  for (var i = 0; i < trials; i++) {
    var A5 = randMat(N), s5 = randSmall(N, 1), e5 = randSmall(N, bound);
    var t5 = L.lweSample(A5, s5, e5, Q);
    var m5 = i % 2;
    var c5 = L.encryptBit(A5, t5, m5, randSmall(N, 1), randSmall(N, bound), randInt(-bound, bound), Q);
    if (L.decryptBit(c5.u, c5.v, s5, Q).bit === m5) ok++;
  }
  return ok / trials;
}
// Noise accumulates as a signed random walk, so the failure curve is a slope,
// not a cliff — which is exactly what the exhibit's slider should show.
var rLow = successRate(1, 800);
var rMid = successRate(8, 800);
var rHigh = successRate(24, 800);
assert(rLow === 1, "error bound 1: decryption never fails (" + (rLow * 100).toFixed(0) + "%)");
assert(rMid < 0.99 && rMid > 0.85,
  "error bound 8: decryption degrades but mostly holds (" + (rMid * 100).toFixed(0) + "%)");
assert(rHigh < 0.65,
  "error bound 24 (= the whole budget): decryption collapses toward a coin flip (" +
  (rHigh * 100).toFixed(0) + "%)");
assert(rLow > rMid && rMid > rHigh, "success falls monotonically as the error grows");

// ---- residualNoise is the quantity that actually predicts failure ----
// This is the one a UI should show. decryptBit.noise measures against the bit
// it decoded, so on a failure it is small and reads as nonsense.
var predicted = 0, checked = 0, sawOver = 0;
for (trial = 0; trial < 1200; trial++) {
  var A6 = randMat(N), s6 = randSmall(N, 1), e6 = randSmall(N, 6);
  var t6 = L.lweSample(A6, s6, e6, Q);
  var m6 = trial % 2;
  var c6 = L.encryptBit(A6, t6, m6, randSmall(N, 1), randSmall(N, 6), randInt(-6, 6), Q);
  var d6 = L.decryptBit(c6.u, c6.v, s6, Q);
  var resid = L.residualNoise(d6.raw, m6, Q);
  checked++;
  var wrong = d6.bit !== m6;
  if (Math.abs(resid) >= budget) sawOver++;
  // The exact pair of claims, both directions:
  //   |resid| <  budget  =>  always correct   (the guarantee)
  //   wrong              =>  |resid| >= budget (nothing fails inside it)
  var guaranteeHolds = Math.abs(resid) < budget ? !wrong : true;
  var failureExplained = wrong ? Math.abs(resid) >= budget : true;
  if (guaranteeHolds && failureExplained) predicted++;
}
assert(predicted === checked,
  "strictly-under-budget error always decodes correctly, and every failure is " +
  "at or over budget (" + predicted + "/" + checked + ")");
assert(sawOver > 0, "the test actually exercised some over-budget cases (" + sawOver + ")");
assert(L.ringDist(1, Q - 1, Q) === 2, "ring distance wraps: 1 and 96 are 2 apart mod 97");
assert(L.ringDist(0, 48, Q) === 48 && L.ringDist(48, 0, Q) === 48, "ring distance is symmetric");
assert(L.residualNoise(48, 1, Q) === 0, "a perfect 1 has zero residual");
assert(L.residualNoise(0, 0, Q) === 0, "a perfect 0 has zero residual");
assert(L.residualNoise(50, 1, Q) === 2, "residual is measured from the sent bit's ideal");

// ---- honesty check: the secret really is short, and t really is not ----
var Ah = randMat(N), sh = randSmall(N, 1), eh = randSmall(N, 1);
var th = L.lweSample(Ah, sh, eh, Q);
var sShort = sh.every(function (v) { return Math.abs(v) <= 1; });
var tLooksRandom = th.some(function (v) { return L.center(v, Q) > 10 || L.center(v, Q) < -10; });
assert(sShort, "the secret vector is short by construction");
assert(tLooksRandom, "t does not look short — it is spread across Z_q");

console.log("\nlwe-math: " + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
