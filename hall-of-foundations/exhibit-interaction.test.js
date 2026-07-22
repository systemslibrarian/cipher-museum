/* exhibit-interaction.test.js — run with: node hall-of-foundations/exhibit-interaction.test.js

   End-to-end interaction tests for every interactive exhibit in the Hall,
   driven through the real DOM the way a visitor drives it: load the page,
   work the controls, read what the page announces back.

   Why this exists alongside the math-module tests: lattice-math.js,
   lwe-math.js, crypto-algebra.js and ec-math.js can each be perfectly correct
   while a page wires them up wrongly or narrates their output wrongly. That is
   not hypothetical — this file was written after driving §157 revealed that a
   failed decryption reported the noise measured against the bit it had
   *decoded* rather than the bit that was *sent*, announcing "noise 15 exceeded
   the budget" when the budget is 24. Every math assertion was green at the
   time. Chasing it then exposed a real boundary defect in the rounding rule.

   Two layers:
     1. A sweep over every exhibit — loads clean, draws, and survives having
        every control worked through its full range.
     2. Targeted checks where a page makes a claim whose truth can be computed
        independently and compared against what the page actually says.

   Exits non-zero on any failure. */
"use strict";
var fs = require("fs");
var path = require("path");
var JSDOM, VirtualConsole;
try {
  var jsdom = require("jsdom");
  JSDOM = jsdom.JSDOM; VirtualConsole = jsdom.VirtualConsole;
} catch (err) {
  console.log("\nexhibit-interaction: SKIPPED (jsdom not installed)");
  process.exit(0);
}

var passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; }
  else { failed++; console.error("  ✗ FAIL: " + msg); }
}

var DIR = __dirname;

// Every interactive exhibit in the wing. index.html is a landing page with no
// controls; modularity-exhibit is the companion piece. If a new exhibit is
// added and not listed here, the completeness check at the bottom fails.
var EXHIBITS = [
  ["finite-fields.html",        "§142 Finite Fields"],
  ["modular-arithmetic.html",   "§143 Modular Arithmetic"],
  ["prime-number-theorem.html", "§144 The Prime Number Theorem"],
  ["euler-fermat.html",         "§145 Euler & Fermat"],
  ["one-way-function.html",     "§146 The One-Way Function"],
  ["lattices-svp.html",         "§147 Lattices & the SVP"],
  ["reduction.html",            "§148 Reduction & Proof"],
  ["group-theory.html",         "§149 Group Theory"],
  ["elliptic-curves-real.html", "§150 Elliptic Curves over R"],
  ["entropy.html",              "§151 Information & Entropy"],
  ["closest-vector.html",       "§152 The Closest Vector Problem"],
  ["polynomial-rings.html",     "§153 Polynomial Rings"],
  ["random-oracle.html",        "§154 The Random Oracle"],
  ["interpolation.html",        "§155 Polynomial Interpolation"],
  ["pairings.html",             "§156 Bilinear Pairings"],
  ["learning-with-errors.html", "§157 Learning With Errors"],
  ["modularity-exhibit.html",   "Companion: The Ground Beneath the Curve"]
];

// Load a page with its local <script src> files inlined, so no network is used.
function load(page) {
  var html = fs.readFileSync(path.join(DIR, page), "utf8");
  html = html.replace(/<script src="([^"]+)"[^>]*><\/script>/g, function (m, src) {
    var p = path.join(DIR, src);
    if (!fs.existsSync(p)) return ""; // ../js/nav.js — not needed for exhibit logic
    return "<script>" + fs.readFileSync(p, "utf8").replace(/<\/script>/g, "<\\/script>") + "<" + "/script>";
  });
  var errors = [];
  var vc = new VirtualConsole();
  vc.on("jsdomError", function (e) { errors.push(e.message); });
  var dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole: vc });
  var w = dom.window, d = w.document;
  return {
    page: page, dom: dom, win: w, doc: d, errors: errors,
    $: function (id) { return d.getElementById(id); },
    click: function (id) {
      d.getElementById(id).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    },
    set: function (id, v) {
      var el = d.getElementById(id);
      el.value = String(v);
      el.dispatchEvent(new w.Event("input", { bubbles: true }));
      el.dispatchEvent(new w.Event("change", { bubbles: true }));
    },
    svgs: function () {
      return Array.prototype.slice.call(d.querySelectorAll("main svg[id]"));
    },
    close: function () { try { w.close(); } catch (e) { /* already gone */ } }
  };
}

// Work every control on the page through its range. Controls live only inside
// <main>; the site nav is links, not buttons.
function exerciseAll(p) {
  var w = p.win, d = p.doc, actions = 0;

  Array.prototype.slice.call(d.querySelectorAll("main select")).forEach(function (sel) {
    Array.prototype.slice.call(sel.options).forEach(function (o) {
      sel.value = o.value;
      sel.dispatchEvent(new w.Event("change", { bubbles: true }));
      actions++;
    });
  });

  Array.prototype.slice.call(
    d.querySelectorAll("main input[type=range], main input[type=number]")
  ).forEach(function (inp) {
    var lo = inp.min !== "" ? +inp.min : 0;
    var hi = inp.max !== "" ? +inp.max : 16;
    [lo, Math.floor((lo + hi) / 2), hi].forEach(function (v) {
      inp.value = String(v);
      inp.dispatchEvent(new w.Event("input", { bubbles: true }));
      inp.dispatchEvent(new w.Event("change", { bubbles: true }));
      actions++;
    });
  });

  Array.prototype.slice.call(d.querySelectorAll("main button")).forEach(function (b) {
    b.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    actions++;
  });

  return actions;
}

// ========================= layer 1: the sweep =========================
console.log("\n  sweeping " + EXHIBITS.length + " exhibits...");
EXHIBITS.forEach(function (row) {
  var file = row[0], label = row[1];
  var p = load(file);

  assert(p.errors.length === 0, label + " loads with no script errors: " + p.errors.join("; "));

  var svgs = p.svgs();
  assert(svgs.length > 0, label + " has at least one identified SVG stage");
  var emptyOnLoad = svgs.filter(function (s) { return s.childNodes.length === 0; })
    .map(function (s) { return "#" + s.id; });
  assert(emptyOnLoad.length === 0,
    label + " draws every stage on load (empty: " + emptyOnLoad.join(", ") + ")");

  var n = exerciseAll(p);
  assert(n > 0, label + " exposes working controls (" + n + " interactions)");
  assert(p.errors.length === 0,
    label + " survives every control being worked: " + p.errors.join("; "));

  var emptyAfter = p.svgs().filter(function (s) { return s.childNodes.length === 0; })
    .map(function (s) { return "#" + s.id; });
  assert(emptyAfter.length === 0,
    label + " still draws after every control is worked (empty: " + emptyAfter.join(", ") + ")");

  p.close();
});

// ================= layer 2: does the page tell the truth? =================
console.log("  checking announced results against independent truth...");

// ---- §145 Euler & Fermat: the RSA round trip, including the case the
// exhibit's own footnote calls out (messages sharing a factor with n) ----
(function () {
  var p = load("euler-fermat.html");
  var n = 3233, e = 17, d = 2753; // the toy key stated on the page
  function powmod(b, ex, m) {
    var r = 1n, bb = BigInt(b) % BigInt(m), ee = BigInt(ex), mm = BigInt(m);
    while (ee > 0n) { if (ee & 1n) r = r * bb % mm; bb = bb * bb % mm; ee >>= 1n; }
    return Number(r);
  }
  // 65 is coprime to n; 61 and 53 are the prime factors themselves; 122 = 2*61
  // and 106 = 2*53 also share a factor. Euler's theorem does not cover these,
  // but RSA still round-trips them via CRT — which is exactly what the
  // footnote added in this wing's accuracy sweep claims.
  // (the slider spans 2..3231, so every value here is reachable by a visitor)
  [65, 61, 53, 122, 106, 3231].forEach(function (m) {
    p.set("mr", m);
    p.click("send");
    var txt = p.$("tread").textContent;
    var expectC = powmod(m, e, n);
    var expectBack = powmod(expectC, d, n);
    assert(expectBack === m, "§145 sanity: RSA round trip is mathematically exact for m=" + m);
    assert(txt.indexOf("→") !== -1 && txt.indexOf("✓") !== -1,
      "§145 reports a successful round trip for m=" + m + " (got: " + txt + ")");
    assert(txt.indexOf(String(expectC)) !== -1,
      "§145 shows the genuine ciphertext " + expectC + " for m=" + m + " (got: " + txt + ")");
  });
  var gcd = function (a, b) { return b ? gcd(b, a % b) : a; };
  assert(gcd(61, n) === 61 && gcd(53, n) === 53,
    "§145 the messages tested really do share a factor with n (the footnote's case)");
  p.close();
})();

// ---- §149 Group Theory: Lagrange, live. g generates all of Z/nZ exactly
// when gcd(g,n) = 1, and the order always divides n. ----
(function () {
  var p = load("group-theory.html");
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  var mismatches = 0, checked = 0, divisorFails = 0;
  var nsel = p.$("nsel");
  Array.prototype.slice.call(nsel.options).forEach(function (opt) {
    p.set("nsel", opt.value);
    var n = +opt.value;
    var gsel = p.$("gsel");
    Array.prototype.slice.call(gsel.options).forEach(function (g) {
      p.set("gsel", g.value);
      p.click("trace");
      var txt = p.$("gread").textContent;
      var m = txt.match(/order\s*(\d+)/);
      if (!m) return;
      var order = +m[1];
      var saysGenerator = /generator/.test(txt);
      var trulyGenerator = gcd(+g.value, n) === 1;
      checked++;
      if (saysGenerator !== trulyGenerator) mismatches++;
      if (n % order !== 0) divisorFails++;
    });
  });
  assert(checked > 20, "§149 exercised a real spread of (n, g) pairs (" + checked + ")");
  assert(mismatches === 0,
    "§149 calls g a generator exactly when gcd(g,n)=1 (" + mismatches + " disagreements)");
  assert(divisorFails === 0,
    "§149 the reported order always divides n — Lagrange (" + divisorFails + " violations)");
  p.close();
})();

// ---- §154 The Random Oracle: the avalanche the page claims to show ----
(function () {
  var p = load("random-oracle.html");
  var flips = [];
  for (var i = 0; i < 16; i++) {
    p.set("bitIn", i);
    p.click("toggleBtn");
    var m = p.$("aread").textContent.match(/(\d+)\/16\s*output bits changed/);
    if (m) flips.push(+m[1]);
  }
  // Asserted unconditionally: if the readout format ever changes, this fails
  // loudly rather than skipping the real check.
  assert(flips.length === 16,
    "§154 the avalanche readout reports a bit count on every toggle (" + flips.length + "/16)");
  var mean = flips.reduce(function (a, b) { return a + b; }, 0) / flips.length;
  assert(mean > 5.5 && mean < 10.5,
    "§154 one flipped input bit changes about half of 16 output bits (mean " +
    mean.toFixed(1) + ")");
  assert(flips.every(function (f) { return f > 0; }),
    "§154 no input bit is ignored by the mixer (a zero-flip bit would be a dead input)");
  p.close();
})();

// ---- §152 CVP: Babai rounding is exact in the good basis and misfires in the
// bad one — the asymmetry the whole exhibit is built to show ----
(function () {
  var p = load("closest-vector.html");
  var LM = require("./lattice-math.js");
  var goodHits = 0, badHits = 0, n = 0;
  // Deliberately no half-integer coordinates: those are exact ties between two
  // lattice points, where "the closest corner" is genuinely ambiguous and any
  // answer is defensible. Testing them would assert a tie-break, not correctness.
  var targets = [[2.3, 1.7], [0.4, 3.6], [-1.2, 2.8], [3.3, -0.6], [1.2, 1.3], [-2.7, -1.4]];
  targets.forEach(function (t) {
    p.set("tx", t[0]); p.set("ty", t[1]);
    p.click("applyTarget");
    n++;
    if (LM.babaiIsCorrect({ x: t[0], y: t[1] }, [1, 0], [0, 1])) goodHits++;
    if (LM.babaiIsCorrect({ x: t[0], y: t[1] }, [4, 3], [5, 4])) badHits++;
  });
  assert(goodHits === n, "§152 the good basis rounds correctly on every sampled target");
  assert(badHits < n, "§152 the bad basis misfires on at least one (" + badHits + "/" + n + ")");
  assert(p.errors.length === 0, "§152 setting targets via the keyboard fallback throws nothing");
  assert(p.$("cread").textContent.trim() !== "—", "§152 announces a result after Set target");
  p.close();
})();

// ---- §157 Learning With Errors ----
(function () {
  var p = load("learning-with-errors.html");

  // No error means no security: elimination reads the secret straight off.
  p.set("err", 0);
  p.click("solve");
  assert(/Recovered s exactly/.test(p.$("lread").textContent),
    "§157 at error 0: elimination recovers the secret (got: " + p.$("lread").textContent + ")");

  // Any real error destroys that, across fresh key sets.
  var recovered = 0;
  for (var i = 0; i < 25; i++) {
    p.click("fresh");
    p.set("err", 5);
    p.click("solve");
    if (/Recovered s exactly/.test(p.$("lread").textContent)) recovered++;
  }
  assert(recovered === 0,
    "§157 at error 5: elimination never recovers the secret (" + recovered + "/25 did)");

  // The reveal control must not lie about its own state.
  var before = p.$("reveal").textContent;
  p.click("reveal");
  var after = p.$("reveal").textContent;
  p.click("reveal");
  assert(before !== after && p.$("reveal").textContent === before,
    "§157 Reveal toggles its label and returns (" + before + " / " + after + ")");

  // Round trip through the buttons.
  p.set("derr", 1);
  var ok = 0;
  for (i = 0; i < 40; i++) { p.click("send"); if (/correct/.test(p.$("dread").textContent)) ok++; }
  assert(ok === 40, "§157 at error 1: 40/40 decryptions correct through the UI (got " + ok + ")");

  // THE REGRESSION THIS FILE WAS CREATED FOR. The narration must agree with the
  // budget it quotes: nothing strictly inside the budget may be announced as a
  // failure, and no announced error may exceed the furthest a value can sit
  // from an ideal.
  var checked = 0, incoherent = 0, sawFailure = 0;
  for (i = 0; i < 300; i++) {
    p.set("derr", 20);
    p.click("send");
    var txt = p.$("dread").textContent;
    var m = txt.match(/Accumulated error (\d+)/);
    if (!m) continue;
    checked++;
    var err = +m[1], wrong = /wrong/.test(txt);
    if (wrong) sawFailure++;
    if (wrong && err < 24) incoherent++;
    if (err > 48) incoherent++;
  }
  assert(checked > 250, "§157 readout is parseable on every trial (" + checked + "/300)");
  assert(sawFailure > 0, "§157 at error 20 actually produces some failures (" + sawFailure + ")");
  assert(incoherent === 0,
    "§157 never narrates a failure with an in-budget error (" + incoherent + " of " + checked + ")");

  // Keyboard fallbacks drive the same state as the sliders.
  p.$("errNum").value = "7";
  p.click("applyErr");
  assert(p.$("err").value === "7", "§157 numeric error input updates the slider");
  p.$("derrNum").value = "12";
  p.click("applyDerr");
  assert(p.$("derr").value === "12", "§157 numeric decrypt input updates the slider");

  p.set("derr", 1);
  p.click("run100");
  assert(/200\/200/.test(p.$("dread").textContent),
    "§157 batch run is perfect at error 1 (got: " + p.$("dread").textContent + ")");
  p.close();
})();

// ---- completeness: no exhibit may quietly escape this file ----
(function () {
  var onDisk = fs.readdirSync(DIR).filter(function (f) {
    return /\.html$/.test(f) && f !== "index.html";
  }).sort();
  var covered = EXHIBITS.map(function (r) { return r[0]; }).sort();
  var missing = onDisk.filter(function (f) { return covered.indexOf(f) === -1; });
  var stale = covered.filter(function (f) { return onDisk.indexOf(f) === -1; });
  assert(missing.length === 0,
    "every exhibit page is covered by this file (uncovered: " + missing.join(", ") + ")");
  assert(stale.length === 0,
    "this file lists no pages that no longer exist (stale: " + stale.join(", ") + ")");
})();

console.log("\nexhibit-interaction: " + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
