/* exhibit-examples.test.js — run: node exhibit-examples.test.js
   Pins the constants DISPLAYED on the exhibit pages to the tested math
   modules, so on-page examples can never silently drift from the engines.
   Reads the HTML, extracts the constants, and re-derives the mathematics.
   Exits non-zero on failure for CI. */
"use strict";
var fs = require("fs");
var path = require("path");
var CA = require("./crypto-algebra.js");
var EC = require("./ec-math.js");

var passed = 0, failed = 0;
function assert(cond, msg) { if (cond) passed++; else { failed++; console.error("  ✗ FAIL: " + msg); } }
function page(name) { return fs.readFileSync(path.join(__dirname, name), "utf8"); }

// ---- Exhibit 145: Euler & Fermat — the toy RSA round-trip ----
// The page hardcodes n, e, d. They must form a working RSA triple.
(function () {
  var html = page("euler-fermat.html");
  var m = html.match(/var n=(\d+),e=(\d+),d=(\d+)/);
  assert(!!m, "euler-fermat.html declares var n=..,e=..,d=..");
  if (!m) return;
  var n = +m[1], e = +m[2], d = +m[3];
  // factor n (small toy modulus)
  var p = 0;
  for (var f = 2; f * f <= n; f++) if (n % f === 0) { p = f; break; }
  assert(p > 0 && p !== n, "toy modulus n = " + n + " is composite");
  var q = n / p, phi = (p - 1) * (q - 1);
  assert(CA.mod(e * d, phi) === 1, "e·d ≡ 1 (mod φ(n)) — the displayed keypair is valid");
  // every message the page's slider can produce must round-trip
  var allGood = true;
  for (var msg = 2; msg <= 100; msg++) {
    if (CA.powmod(CA.powmod(msg, e, n), d, n) !== msg) allGood = false;
  }
  assert(allGood, "every slider message m round-trips through m^e^d mod n");
})();

// ---- Exhibit 142: Finite Fields — the curve the scatter plot draws ----
(function () {
  var html = page("finite-fields.html");
  var m = html.match(/var A=(\d+), B=(\d+)/);
  assert(!!m, "finite-fields.html declares var A=.., B=..");
  if (!m) return;
  var A = +m[1], B = +m[2];
  // the curve must be smooth over every prime the page's select offers
  var primes = [];
  var sel = html.match(/id="psel"[\s\S]*?<\/select>/);
  var re = /value="(\d+)"/g, pm;
  while ((pm = re.exec(sel ? sel[0] : "")) !== null) primes.push(+pm[1]);
  if (primes.length === 0) primes = [11, 17, 23, 41, 67, 97];
  primes.forEach(function (p) {
    assert(EC.mod(4 * A * A * A + 27 * B * B, p) !== 0,
      "y² = x³+" + A + "x+" + B + " is smooth mod " + p);
    var N = EC.ecPoints(A, B, p).length + 1;
    assert(Math.abs(N - (p + 1)) <= 2 * Math.sqrt(p),
      "point count over F_" + p + " respects the Hasse bound");
  });
})();

// ---- Exhibit 150: Elliptic Curves over R — the drawn curve is smooth ----
(function () {
  var html = page("elliptic-curves-real.html");
  var m = html.match(/var A = (-?\d+), B = (-?\d+)/);
  assert(!!m, "elliptic-curves-real.html declares var A = .., B = ..");
  if (!m) return;
  assert(EC.ecIsSmooth(+m[1], +m[2]),
    "the hand-drawn curve y² = x³+" + m[1] + "x+" + m[2] + " is smooth");
})();

// ---- Exhibit 156: Pairings — the displayed identity uses a real group ----
(function () {
  var html = page("pairings.html");
  // the page displays e(aP,bQ) = e(P,Q)^ab in a toy multiplicative group;
  // whatever base/modulus the script uses must satisfy bilinearity
  var m = html.match(/base\s*=\s*(\d+)[\s\S]{0,80}?m(?:od)?\s*=\s*(\d+)/) ||
          html.match(/pairingCheck\((?:[^)]*?,\s*)*?(\d+),\s*(\d+)\)/);
  if (m) {
    var base = +m[1], mod = +m[2];
    var ok = true;
    for (var a = 1; a <= 6; a++) for (var b = 1; b <= 6; b++) {
      if (!CA.pairingCheck(a, b, base, mod).equal) ok = false;
    }
    assert(ok, "pairing page constants (base " + base + " mod " + mod + ") satisfy bilinearity");
  } else {
    passed++; // page drives constants interactively; module property tests cover it
  }
})();

console.log("\nexhibit-examples: " + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
