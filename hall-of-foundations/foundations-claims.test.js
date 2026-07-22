/* foundations-claims.test.js — run with: node hall-of-foundations/foundations-claims.test.js

   Guards the cryptographic accuracy of the Hall's prose.

   The wing went through an accuracy sweep that corrected several explanatory
   claims. Twice during that work a corrected claim reappeared somewhere the
   fix had not reached: the ML-KEM good-basis/bad-basis line survived in the
   glossary entry, the guided-tour note and both og:description tags after the
   exhibit pages themselves were fixed, and §147's honesty box went on
   asserting it at the top of a page whose closing section refuted it.

   Neither the math tests nor the interaction tests can see that. Prose is not
   executable, so it needs its own guard: retired claims must not come back,
   and the corrections that replaced them must stay put.

   Every entry below records WHY the banned form is wrong, so a future editor
   hitting a failure can judge it rather than just route around it.

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

// Every surface a claim can reach a visitor through. The ML-KEM error was
// found in four of these; a fix that touches only the exhibit pages is not a
// fix. Add new surfaces here rather than assuming pages are the whole story.
var SURFACES = [];
fs.readdirSync(DIR).filter(function (f) { return /\.html$/.test(f); })
  .forEach(function (f) { SURFACES.push(path.join(DIR, f)); });
SURFACES.push(path.join(DIR, "README.md"));
[
  "glossary.html",
  "timeline.html",
  "tours/foundations.json",
  "js/search-index.json"
].forEach(function (rel) {
  var p = path.join(ROOT, rel);
  if (fs.existsSync(p)) SURFACES.push(p);
});

var NAMED = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", hellip: "…", times: "×", minus: "−"
};
// Decode entities so patterns match what a visitor actually reads: the museum
// writes "A&#183;s + e", and a rule looking for "A·s + e" must still find it.
function decode(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, function (m, h) { return String.fromCodePoint(parseInt(h, 16)); })
    .replace(/&#(\d+);/g, function (m, d) { return String.fromCodePoint(+d); })
    .replace(/&([a-zA-Z]+);/g, function (m, n) { return NAMED[n] !== undefined ? NAMED[n] : m; });
}
function readViews(file) {
  var raw = fs.readFileSync(file, "utf8");
  return {
    // tags stripped, entities decoded, whitespace collapsed — so a claim broken
    // across lines or interrupted by an <a href> still matches
    text: decode(raw.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " "),
    raw: decode(raw).replace(/\s+/g, " ")
  };
}
var VIEWS = SURFACES.map(function (f) {
  return { file: path.relative(ROOT, f), views: readViews(f) };
});

// ============================ retired claims ============================
var BANNED = [
  {
    re: /public key is (a|the) bad basis/i,
    why: "ML-KEM's public key is (A, t = As + e); the secret is a short vector, " +
         "not a short basis. Good-basis/bad-basis is the GGH/NTRU trapdoor shape."
  },
  {
    re: /secret key is (a|the) good (basis|one)/i,
    why: "Same error from the other side — ML-KEM stores no secret basis."
  },
  {
    re: /publishes the skewed basis and keeps the tidy one secret/i,
    why: "States the GGH trapdoor as what cryptography generally does. It is one " +
         "construction, and not the one the deployed standards use."
  },
  {
    re: /This is ML-KEM decryption/i,
    why: "ML-KEM decryption cancels a shared term using a short secret vector; " +
         "it does not round with a private basis."
  },
  {
    re: /no pairing,? no succinct verification/i,
    why: "STARKs, Bulletproofs and Halo-style systems achieve succinctness with " +
         "no pairing at all. Pairings are one family, not a requirement."
  },
  {
    re: /(assumption beneath every signature|every signature stands on|under every deployed signature)/i,
    why: "SLH-DSA rests on concrete hash properties rather than an idealized " +
         "oracle, and standard-model signature schemes exist."
  },
  {
    re: /every public-key primitive in the modern wing/i,
    why: "ML-KEM, ML-DSA and hash-based signatures are not generator-and-order " +
         "group schemes — which is precisely why they survive Shor."
  },
  {
    re: /statement about surprise, not about arithmetic difficulty/i,
    why: "True for AES-128; for a 256-bit curve, '128-bit security' denotes the " +
         "~2^128 cost of the best known discrete-log attack."
  },
  {
    re: /S-box is inversion in the field GF\(2/i,
    why: "GF(2^8) is an extension field of polynomials mod an irreducible, not " +
         "the GF(p) this exhibit builds — and the S-box adds an affine map."
  },
  {
    re: /when a modern scheme claims a security level, that claim is a reduction/i,
    why: "No reduction proves AES secure. Symmetric trust comes from surviving " +
         "public cryptanalysis, which is different currency."
  },
  {
    re: /grammar of nearly every public-key scheme/i,
    why: "Overstates reach into the post-quantum shelf; it is the discrete-log family."
  },
  {
    re: /1 in 710 candidates is prime/i,
    why: "1/ln(2^1024) is the density over all integers. Conditioned on odd — " +
         "which is what keygen tests — it is about 1 in 355."
  }
];

BANNED.forEach(function (rule) {
  var hits = VIEWS.filter(function (v) {
    return rule.re.test(v.views.text) || rule.re.test(v.views.raw);
  }).map(function (v) { return v.file; });
  assert(hits.length === 0,
    "retired claim /" + rule.re.source + "/ is back in: " + hits.join(", ") +
    "\n      why it is wrong: " + rule.why);
});

// ========================= corrections still present =========================
// The mirror of the list above: a claim can also be lost by an unrelated
// rewrite, leaving a page silently less accurate than it was.
function fileText(rel) {
  var p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  return readViews(p).text;
}
var REQUIRED = [
  ["hall-of-foundations/closest-vector.html", /t = A.s \+ e|A·s \+ e/,
    "§152 must state ML-KEM's actual public relation"],
  ["hall-of-foundations/closest-vector.html", /short secret vector/i,
    "§152 must say the secret is a short vector"],
  ["hall-of-foundations/lattices-svp.html", /short secret vector/i,
    "§147 must point at the real key structure, not just the trapdoor picture"],
  ["hall-of-foundations/learning-with-errors.html", /Module-LWE/,
    "§157 must name the problem the standards actually rest on"],
  ["hall-of-foundations/prime-number-theorem.html", /355/,
    "§144 must give the odd-candidate density"],
  ["hall-of-foundations/random-oracle.html", /SLH-DSA/,
    "§154 must name the signature standard that does not need the oracle"],
  ["hall-of-foundations/random-oracle.html", /[Nn]ecessary, not sufficient/,
    "§154 must caveat that avalanche is not evidence of one-wayness"],
  ["hall-of-foundations/pairings.html", /STARK/,
    "§156 must name a succinct system that uses no pairing"],
  ["hall-of-foundations/group-theory.html", /ML-KEM and ML-DSA/,
    "§149 must name where the group-theoretic family stops"],
  ["hall-of-foundations/entropy.html", /AES-128/,
    "§151 must distinguish symmetric from public-key '128-bit security'"],
  ["hall-of-foundations/finite-fields.html", /extension field/i,
    "§142 must distinguish GF(2^8) from GF(p)"],
  ["hall-of-foundations/modular-arithmetic.html", /prime-order subgroup/i,
    "§143 must note deployed DH avoids primitive roots"],
  ["hall-of-foundations/reduction.html", /cryptanalyst/i,
    "§148 must contrast reduction-based with cryptanalysis-based trust"],
  ["hall-of-foundations/euler-fermat.html", /Chinese Remainder Theorem/,
    "§145 must explain messages not coprime to n"],
  ["hall-of-foundations/euler-fermat.html", /Carmichael/,
    "§145 must note implementations use lambda(n)"],
  ["glossary.html", /short secret vector/i,
    "the LWE glossary entry must describe ML-KEM's real key structure"]
];
REQUIRED.forEach(function (row) {
  var t = fileText(row[0]);
  assert(t !== null && row[1].test(t),
    "correction missing from " + row[0] + ": " + row[2]);
});

// ================= the three-view arc stays consistent =================
// §147, §152 and §157 teach one problem through three lenses. Each must carry
// the shared note, or a visitor landing on one sees a fragment of the argument.
["lattices-svp.html", "closest-vector.html", "learning-with-errors.html"].forEach(function (f) {
  var t = readViews(path.join(DIR, f)).text;
  assert(/Three views of one problem/.test(t),
    f + " carries the shared three-view note");
  ["147", "152", "157"].forEach(function (n) {
    assert(t.indexOf("§" + n) !== -1, f + " links the arc to §" + n);
  });
});

console.log("\nfoundations-claims: " + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
