/* foundations-links.test.js — run with: node hall-of-foundations/foundations-links.test.js

   Guards the Hall's link topology.

   The wing is an integrated layer of the Cipher Museum. Onward navigation
   remains inside the museum; explicit primary-source citations and reviewed
   page-specific follow-up labs are allowed.
   Source additions require review of this exact URL allowlist, not a broad
   permission for any external destination or sister-project launcher.

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

// ---- 1. external links must have a reviewed purpose and exact destination ----
// The ebook follow-up authorizes these existing labs instead of duplicate
// Museum engines. Each exception is tied to its explanatory Museum page.
var FOLLOW_UP_LABS = {
  "entropy.html": new Set([
    "https://systemslibrarian.github.io/crypto-lab-good-randomness/",
    "https://systemslibrarian.github.io/crypto-lab-noise-to-numbers/"
  ]),
  "random-oracle.html": new Set(["https://systemslibrarian.github.io/crypto-lab-dilithium-reject/"]),
  "learning-with-errors.html": new Set(["https://systemslibrarian.github.io/crypto-lab-kem-trap/"]),
  "closest-vector.html": new Set([
    "https://systemslibrarian.github.io/crypto-lab-lattice-gentle/",
    "https://systemslibrarian.github.io/crypto-lab-lattice-builder/"
  ]),
  // §142's implementation-assurance panel contrasts a source-code property with a
  // measured side-channel one. Power Trace is the existing demonstration of the
  // latter; the panel is explicit that it computes statistics over simulated leakage.
  "finite-fields.html": new Set(["https://systemslibrarian.github.io/crypto-lab-power-trace/"])
};
function reviewedLab(page, url) {
  return !!FOLLOW_UP_LABS[page] && FOLLOW_UP_LABS[page].has(url);
}
// Other sister-project destinations remain prohibited.
var FOREIGN = /crypto-lab|systemslibrarian\.dev|systemslibrarian\.github\.io/i;
pages.forEach(function (p) {
  var bad = hrefs(path.join(DIR, p)).filter(function (h) { return FOREIGN.test(h) && !reviewedLab(p, h); });
  assert(bad.length === 0,
    p + " links to an unreviewed sister project: " + bad.join(", "));
});

// Exact primary-source destinations reviewed during the accuracy audit.
// Do not replace this with an unrestricted host allowlist.
var PRIMARY_SOURCES = new Set([
  "https://annals.math.princeton.edu/1995/141-3/p01",
  "https://annals.math.princeton.edu/1995/141-3/p02",
  "https://www.rfc-editor.org/rfc/rfc8017.html",
  "https://www.rfc-editor.org/rfc/rfc7919.html",
  "https://www.rfc-editor.org/rfc/rfc8235.html",
  "https://www.rfc-editor.org/rfc/rfc9591.html",
  "https://csrc.nist.gov/pubs/sp/800/186/final",
  "https://csrc.nist.gov/pubs/fips/203/final",
  "https://csrc.nist.gov/pubs/fips/204/final",
  "https://csrc.nist.gov/pubs/fips/205/final",
  "https://doi.org/10.1145/359168.359176",
  "https://crypto.stanford.edu/~dabo/cryptobook/",
  "https://crypto.stanford.edu/~dabo/pubs/papers/weilsigs.pdf",
  "https://eprint.iacr.org/2016/260",
  // §142 implementation-assurance panel: the curve class the completeness guarantee is
  // stated for, and the proof pipeline with its trusted compiler boundary.
  "https://eprint.iacr.org/2015/1060",
  "https://doi.org/10.1109/SP.2019.00005",
  // §151 pooled-entropy and unicity sections: the dataset whose keys are independently
  // generated per text, and the Z340 unicity analysis with its three language assumptions.
  "https://aclanthology.org/2026.resourceful-4.2/",
  "https://eprint.iacr.org/2021/1620"
]);
// Canonical self-references, reviewed citations and page-specific labs only.
pages.forEach(function (p) {
  var bad = hrefs(path.join(DIR, p)).filter(function (h) {
    if (!/^https?:\/\//i.test(h)) return false;
    return h.indexOf("https://ciphermuseum.com/") !== 0 && !PRIMARY_SOURCES.has(h) && !reviewedLab(p, h); // canonical / og:url / og:image
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
  ["modern.html",                  "lattices-svp.html",         "the PQ wing rests on lattice hardness"],
  // Added when the three application exhibits these foundations had been
  // waiting for were finally built. Before §158-160 existed, §150, §155 and
  // §156 had nothing in the museum to point at.
  ["ciphers/ecdsa.html",                 "elliptic-curves-real.html", "ECDSA is the curve group law at working size"],
  ["ciphers/shamir-secret-sharing.html", "interpolation.html",        "Shamir sharing IS Lagrange interpolation"],
  ["ciphers/zero-knowledge-proofs.html", "pairings.html",             "pairing-based zk-SNARKs rest on the bilinear identity"],
  ["ciphers/zero-knowledge-proofs.html", "random-oracle.html",        "Fiat-Shamir replaces the verifier's coins with a hash"]
];

// ---- 6. the foundations must point forward to their applications ----
// The reverse of the pairs above. A foundation that explains the mathematics
// under a museum exhibit should offer the visitor that exhibit.
[["elliptic-curves-real.html", "ecdsa.html"],
 ["interpolation.html",        "shamir-secret-sharing.html"],
 ["pairings.html",             "zero-knowledge-proofs.html"]].forEach(function (row) {
  var raw = fs.readFileSync(path.join(DIR, row[0]), "utf8");
  assert(raw.indexOf("../ciphers/" + row[1]) !== -1,
    row[0] + " should point forward to its application, ciphers/" + row[1]);
});
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
