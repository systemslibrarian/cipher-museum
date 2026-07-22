/* foundations-links.test.js — run with: node hall-of-foundations/foundations-links.test.js

   Guards the Hall's link topology.

   The wing is meant to be an integrated layer of the Cipher Museum, not a
   satellite that points outward. Today every link in every exhibit is internal
   — but that is true by habit, not by construction, and the first outbound
   link to a sister project would break the property silently. This file makes
   it a rule.

   It also checks the reciprocal direction: an exhibit whose whole purpose is
   to explain the mathematics under a museum primitive should be reachable FROM
   that primitive, or visitors only ever find it by browsing the Hall itself.

   Exits non-zero on any failure. */
"use strict";
var fs = require("fs");
var path = require("path");

var passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; }
  else { failed++; console.error("  ✗ FAIL: " + msg); }
}

var DIR = __dirname;
var ROOT = path.join(DIR, "..");
var pages = fs.readdirSync(DIR).filter(function (f) { return /\.html$/.test(f); });

function hrefs(file) {
  var raw = fs.readFileSync(file, "utf8");
  var out = [], m;
  var re = /(?:href|src)="([^"]+)"/g;
  while ((m = re.exec(raw)) !== null) out.push(m[1]);
  return out;
}

// ---- 1. no exhibit may link off-site ----
// Sister projects in particular: the Hall must not become a launcher for them.
var FOREIGN = /crypto-lab|systemslibrarian\.dev|systemslibrarian\.github\.io/i;
pages.forEach(function (p) {
  var bad = hrefs(path.join(DIR, p)).filter(function (h) { return FOREIGN.test(h); });
  assert(bad.length === 0,
    p + " links to a sister project (must stay inside the museum): " + bad.join(", "));
});

// Any absolute http(s) link at all, with a narrow allowance for the canonical
// self-reference every page carries in its <head>.
pages.forEach(function (p) {
  var bad = hrefs(path.join(DIR, p)).filter(function (h) {
    if (!/^https?:\/\//i.test(h)) return false;
    return h.indexOf("https://ciphermuseum.com/") !== 0; // canonical / og:url / og:image
  });
  assert(bad.length === 0,
    p + " has an off-site absolute link: " + bad.join(", "));
});

// ---- 2. internal links must resolve and stay relative ----
pages.forEach(function (p) {
  var broken = [], absolute = [];
  hrefs(path.join(DIR, p)).forEach(function (h) {
    if (/^(https?:|mailto:|#|data:)/i.test(h)) return;
    if (h.charAt(0) === "/") { absolute.push(h); return; }
    var target = path.join(DIR, h.split("#")[0].split("?")[0]);
    if (!fs.existsSync(target)) broken.push(h);
  });
  assert(broken.length === 0, p + " has unresolvable links: " + broken.join(", "));
  assert(absolute.length === 0,
    p + " uses root-absolute paths, which break on subpath hosting: " + absolute.join(", "));
});

// ---- 3. no exhibit may open an internal link in a new tab ----
// Breaks the back button and is a known accessibility annoyance.
pages.forEach(function (p) {
  var raw = fs.readFileSync(path.join(DIR, p), "utf8");
  var tags = raw.match(/<a\b[^>]*>/g) || [];
  var blank = tags.filter(function (t) {
    return /target\s*=\s*"_blank"/i.test(t) && !/https?:\/\//i.test(t);
  });
  assert(blank.length === 0,
    p + " opens an internal link in a new tab: " + blank.join(" | "));
});

// ---- 4. reciprocity where an exhibit exists to explain a primitive ----
// Each pair is a claim: this application page depends on this foundation
// closely enough that a visitor on the application should be offered it.
var RECIPROCAL = [
  ["ciphers/rsa.html",             "euler-fermat.html",         "RSA correctness rests on Euler's theorem"],
  ["ciphers/rsa.html",             "prime-number-theorem.html", "RSA keygen depends on prime density"],
  ["ciphers/diffie-hellman.html",  "modular-arithmetic.html",   "DH lives in a group of residues"],
  ["ciphers/diffie-hellman.html",  "group-theory.html",         "DH is a generator walked to an unknown power"],
  ["ciphers/aes.html",             "finite-fields.html",        "the AES S-box inverts in a finite field"],
  ["ciphers/sha256.html",          "random-oracle.html",        "SHA-256 is what plays the oracle in practice"],
  ["ciphers/one-time-pad.html",    "entropy.html",              "perfect secrecy is an entropy statement"],
  ["halls/modern-crypto.html",     "finite-fields.html",        "the hall's AES card rests on finite fields"],
  ["halls/modern-crypto.html",     "euler-fermat.html",         "the hall's RSA card rests on Euler-Fermat"],
  ["modern.html",                  "lattices-svp.html",         "the PQ wing rests on lattice hardness"]
];
RECIPROCAL.forEach(function (row) {
  var src = path.join(ROOT, row[0]);
  if (!fs.existsSync(src)) { assert(false, "reciprocal source missing: " + row[0]); return; }
  var raw = fs.readFileSync(src, "utf8");
  assert(raw.indexOf("hall-of-foundations/" + row[1]) !== -1,
    row[0] + " should link back to " + row[1] + " — " + row[2]);
});

// ---- 5. every exhibit offers somewhere to go next ----
// A page with no onward link is a dead end for the visitor who lands on it
// from search. Nav chrome does not count: only links from inside <main>.
pages.forEach(function (p) {
  if (p === "index.html") return;
  var raw = fs.readFileSync(path.join(DIR, p), "utf8");
  var main = raw.slice(raw.indexOf("<main"), raw.indexOf("</main>"));
  var links = (main.match(/href="([^"]+)"/g) || [])
    .map(function (h) { return h.slice(6, -1); })
    .filter(function (h) { return !/^(https?:|#|mailto:)/i.test(h); });
  assert(links.length >= 2,
    p + " offers only " + links.length + " onward link(s) in its body — a near dead end");
});

console.log("\nfoundations-links: " + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
