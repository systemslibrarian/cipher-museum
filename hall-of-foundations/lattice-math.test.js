/* lattice-math.test.js — run with: node lattice-math.test.js
   Exits non-zero on any failure, so it drops straight into a GitHub Actions step. */
"use strict";
var LM = require("./lattice-math.js");

var passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; }
  else { failed++; console.error("  ✗ FAIL: " + msg); }
}
function eqPt(a, b) { return a && b && a.x === b.x && a.y === b.y; }

// ---- det2 ----
assert(LM.det2([1, 0], [0, 1]) === 1, "det of identity basis is 1");
assert(LM.det2([4, 3], [5, 4]) === 1, "bad basis (4,3),(5,4) has det 1 (same lattice)");
assert(LM.det2([2, 0], [0, 2]) === 4, "det scales with cell area");

// ---- shortestVector ----
var sv = LM.shortestVector([1, 0], [0, 1]);
assert(sv.len === 1, "shortest vector of Z^2 has length 1");
var svBad = LM.shortestVector([4, 3], [5, 4]);
assert(Math.abs(svBad.len - 1) < 1e-9, "bad basis still yields length-1 shortest vector");
assert(svBad.i === -5 && svBad.j === 4, "bad-basis shortest vector is the hidden combo -5b1+4b2");

// ---- closestPoint ----
var cp = LM.closestPoint({ x: 2.3, y: 1.7 });
assert(eqPt(cp, { x: 2, y: 2 }), "closest point to (2.3,1.7) is (2,2)");
var cp0 = LM.closestPoint({ x: 0.1, y: -0.1 });
assert(eqPt(cp0, { x: 0, y: 0 }), "closest point near origin is origin");

// ---- babaiRound: good basis is exact, bad basis misfires ----
var good1 = [1, 0], good2 = [0, 1], bad1 = [4, 3], bad2 = [5, 4];
assert(LM.babaiIsCorrect({ x: 2.3, y: 1.7 }, good1, good2), "good basis rounds correctly");
assert(!LM.babaiIsCorrect({ x: 2.3, y: 1.7 }, bad1, bad2), "bad basis misfires on (2.3,1.7)");

// good basis should be correct on a whole grid of targets
var allGood = true;
for (var gx = -3; gx <= 3; gx += 0.3) for (var gy = -3; gy <= 3; gy += 0.3)
  if (!LM.babaiIsCorrect({ x: gx, y: gy }, good1, good2)) allGood = false;
assert(allGood, "good basis is correct across the whole sampled grid");

// ---- lweRecover: noiseless recovers exactly ----
var noiseless = LM.lweRecover({ x: 2, y: -1 }, { x: 0, y: 0 }, good1, good2);
assert(noiseless.ok && eqPt(noiseless.recovered, { x: 2, y: -1 }), "zero-noise LWE recovers the point");

// small noise inside the good-basis cell still recovers
var smallNoise = LM.lweRecover({ x: 2, y: -1 }, { x: 0.3, y: -0.2 }, good1, good2);
assert(smallNoise.ok, "small noise (<0.5) recovers with good basis");

// large noise escapes the cell and fails
var bigNoise = LM.lweRecover({ x: 2, y: -1 }, { x: 0.9, y: 0.9 }, good1, good2);
assert(!bigNoise.ok, "large noise escapes the Voronoi cell and fails to recover");

// ---- EDGE CASES ----
// degenerate basis (det = 0) — the "point at infinity" analogue: no unique solution
assert(LM.babaiRound({ x: 1, y: 1 }, [1, 1], [2, 2]) === null, "degenerate basis (det 0) returns null, not a crash");
assert(LM.det2([1, 1], [2, 2]) === 0, "parallel vectors have det 0");

// target exactly on a lattice point
var onPoint = LM.babaiRound({ x: 3, y: -2 }, good1, good2);
assert(eqPt(onPoint, { x: 3, y: -2 }), "target on a lattice point rounds to itself");

// symmetric noise statistics: good basis tolerates more noise than bad
function recoveryRate(b1, b2, noise, trials) {
  var ok = 0;
  for (var k = 0; k < trials; k++) {
    var v = { x: Math.floor(Math.random() * 7) - 3, y: Math.floor(Math.random() * 7) - 3 };
    var ang = Math.random() * 2 * Math.PI, mag = Math.random() * noise;
    var e = { x: mag * Math.cos(ang), y: mag * Math.sin(ang) };
    if (LM.lweRecover(v, e, b1, b2).ok) ok++;
  }
  return ok / trials;
}
var rGood = recoveryRate(good1, good2, 0.3, 3000);
var rBad = recoveryRate(bad1, bad2, 0.3, 3000);
assert(rGood > rBad, "good basis tolerates more noise than bad (" + (rGood * 100).toFixed(0) + "% vs " + (rBad * 100).toFixed(0) + "%)");
assert(rGood > 0.95, "good basis near-perfect at noise 0.3");

console.log("\nlattice-math: " + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
