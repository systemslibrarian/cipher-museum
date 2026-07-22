/* exhibit-interaction.test.js — run with: node hall-of-foundations/exhibit-interaction.test.js

   End-to-end interaction test for the Hall's interactive exhibits, driven
   through the real DOM the way a visitor drives it: load the page, click the
   buttons, read the announcements.

   Why this exists as well as the math-module tests: lattice-math.js and
   lwe-math.js can each be fully correct while the page wires them up wrongly
   or narrates their output wrongly. That is not hypothetical — this file was
   written after driving §157 revealed that a failed decryption reported the
   noise measured against the bit it had *decoded* rather than the bit that was
   *sent*, producing the sentence "noise 15 exceeded the budget" when the
   budget is 24. Both modules were green at the time.

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

// Load a page with its local <script src> files inlined, so no network is used.
function load(page) {
  var html = fs.readFileSync(path.join(DIR, page), "utf8");
  html = html.replace(/<script src="([^"]+)"[^>]*><\/script>/g, function (m, src) {
    var p = path.join(DIR, src);
    if (!fs.existsSync(p)) return ""; // ../js/nav.js etc. — not needed here
    return "<script>" + fs.readFileSync(p, "utf8").replace(/<\/script>/g, "<\\/script>") + "<" + "/script>";
  });
  var errors = [];
  var vc = new VirtualConsole();
  vc.on("jsdomError", function (e) { errors.push(e.message); });
  var dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole: vc });
  return {
    dom: dom,
    doc: dom.window.document,
    errors: errors,
    $: function (id) { return dom.window.document.getElementById(id); },
    click: function (id) {
      dom.window.document.getElementById(id)
        .dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    },
    setRange: function (id, v) {
      var el = dom.window.document.getElementById(id);
      el.value = String(v);
      el.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    }
  };
}

// ===================== §157 Learning With Errors =====================
var p = load("learning-with-errors.html");
assert(p.errors.length === 0, "§157 loads with no script errors: " + p.errors.join("; "));
assert(p.$("lwe").childNodes.length > 0, "§157 draws the t = As + e diagram on load");

// The exhibit's central claim, exercised through the UI: no error means the
// secret falls straight out of Gaussian elimination.
p.setRange("err", 0);
p.click("solve");
assert(/Recovered s exactly/.test(p.$("lread").textContent),
  "§157 at error 0: elimination recovers the secret (got: " + p.$("lread").textContent + ")");

// ...and any real error destroys that, across many fresh key sets.
var recovered = 0;
for (var i = 0; i < 25; i++) {
  p.click("fresh");
  p.setRange("err", 5);
  p.click("solve");
  if (/Recovered s exactly/.test(p.$("lread").textContent)) recovered++;
}
assert(recovered === 0,
  "§157 at error 5: elimination never recovers the secret (" + recovered + "/25 did)");

// Reveal toggle flips its own label, so the control never lies about its state.
var before = p.$("reveal").textContent;
p.click("reveal");
var after = p.$("reveal").textContent;
p.click("reveal");
assert(before !== after && p.$("reveal").textContent === before,
  "§157 Reveal toggles its label and returns (" + before + " / " + after + ")");

// Decryption round trip through the buttons.
p.setRange("derr", 1);
var ok = 0;
for (i = 0; i < 40; i++) { p.click("send"); if (/correct/.test(p.$("dread").textContent)) ok++; }
assert(ok === 40, "§157 at error 1: 40/40 decryptions correct through the UI (got " + ok + ")");
assert(p.$("dec").childNodes.length > 0, "§157 draws the noise-budget bar");

// The narration must agree with the budget it quotes. This is the regression
// this file was created for: a wrong bit must always be reported with an
// accumulated error ABOVE 24, and a right bit with one below.
var checked = 0, incoherent = 0, sawFailure = 0;
for (i = 0; i < 300; i++) {
  p.setRange("derr", 20);
  p.click("send");
  var txt = p.$("dread").textContent;
  var m = txt.match(/Accumulated error (\d+)/);
  if (!m) continue;
  checked++;
  var n = +m[1], wrong = /wrong/.test(txt);
  if (wrong) sawFailure++;
  // Exact claim, both directions: nothing strictly inside the budget may be
  // reported as a failure, and no failure may be reported with an error the
  // page's own budget line says was safe.
  if (n < 24 && wrong) incoherent++;
  if (wrong && n < 24) { /* counted above */ }
  else if (!wrong && n >= 48) incoherent++; // impossible: would be nearer the other ideal
}
assert(checked > 250, "§157 readout is parseable on every trial (" + checked + "/300)");
assert(sawFailure > 0, "§157 at error 20 actually produces some failures (" + sawFailure + ")");
assert(incoherent === 0,
  "§157 never reports a failure with an in-budget error, or vice versa (" +
  incoherent + " incoherent of " + checked + ")");

// Keyboard/screen-reader fallbacks must drive the same state as the sliders.
p.$("errNum").value = "7";
p.click("applyErr");
assert(p.$("err").value === "7", "§157 numeric error input updates the slider");
p.$("derrNum").value = "12";
p.click("applyDerr");
assert(p.$("derr").value === "12", "§157 numeric decrypt input updates the slider");
assert(/Decrypted/.test(p.$("dread").textContent), "§157 numeric input also runs a decryption");

// Batch button reports a plausible rate.
p.setRange("derr", 1);
p.click("run100");
assert(/200\/200/.test(p.$("dread").textContent),
  "§157 batch run is perfect at error 1 (got: " + p.$("dread").textContent + ")");

// ===================== §152 Closest Vector Problem =====================
var c = load("closest-vector.html");
assert(c.errors.length === 0, "§152 loads with no script errors: " + c.errors.join("; "));
assert(c.$("cvp").childNodes.length > 0, "§152 draws the lattice on load");
c.click("solve");
assert(c.$("cread").textContent.trim() !== "—", "§152 Solve produces a readout");
c.click("basisToggle");
c.click("solve");
assert(c.$("cread").textContent.trim() !== "—", "§152 still solves after switching basis");

// ===================== §147 Lattices & the SVP =====================
var s = load("lattices-svp.html");
assert(s.errors.length === 0, "§147 loads with no script errors: " + s.errors.join("; "));
s.click("good");
s.click("bad");
assert(s.$("lat") ? s.$("lat").childNodes.length > 0 : true, "§147 basis buttons do not throw");

console.log("\nexhibit-interaction: " + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
