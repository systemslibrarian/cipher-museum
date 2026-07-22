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
    return { recovered: r, ok: (r.x === v.x && r.y === v.y), noisyTarget: t };
  }

  // Whether Babai in this basis returns the TRUE closest point for target t.
  function babaiIsCorrect(t, b1, b2) {
    var r = babaiRound(t, b1, b2);
    var c = closestPoint(t);
    return r.x === c.x && r.y === c.y;
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
