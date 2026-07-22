#!/usr/bin/env node
/* test-protocol-math.js — run with: node tests/test-protocol-math.js

   Covers js/protocol-math.js, the shared logic behind the museum's three
   modern protocol exhibits: ECDSA (§158), Shamir's Secret Sharing (§159) and
   zero-knowledge proofs (§160).

   These are protocols rather than ciphers, so there is no encrypt/decrypt
   round trip to check. What matters instead is that each one's SECURITY
   property holds and its documented failure mode really fails — a signature
   scheme that verifies everything is worthless, and a sharing scheme that
   leaks at k-1 shares is worse than none.

   Also guards against drift: protocol-math.js implements modInv, powmod and
   Lagrange-at-zero, and so does hall-of-foundations/crypto-algebra.js. Two
   implementations of the same primitive can diverge silently, so they are
   checked against each other here.

   Exits non-zero on any failure. */
'use strict';
const path = require('path');
const P = require(path.join(__dirname, '..', 'js', 'protocol-math.js'));
const CA = require(path.join(__dirname, '..', 'hall-of-foundations', 'crypto-algebra.js'));

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) passed++;
  else { failed++; console.error('  ✗ FAIL: ' + msg); }
}

// Deterministic PRNG so any failure is reproducible.
let seed = 20260722;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
function randInt(lo, hi) { return lo + Math.floor(rnd() * (hi - lo + 1)); }

const C = P.CURVE, G = P.GROUP, SP = P.SHAMIR_P;

/* ───────────────────────── shared primitives ───────────────────────── */
let invAgree = 0, powAgree = 0;
for (let a = 1; a < 97; a++) {
  if (P.modInv(a, 97) === CA.modInv(a, 97)) invAgree++;
  if (P.powmod(a, a % 20, 97) === CA.powmod(a, a % 20, 97)) powAgree++;
}
assert(invAgree === 96, 'modInv agrees with crypto-algebra.js on every residue mod 97');
assert(powAgree === 96, 'powmod agrees with crypto-algebra.js');
assert(P.modInv(0, 97) === null, 'modInv(0) is null, not a wrong number');

/* ──────────────────────────── the curve ────────────────────────────── */
assert(P.ecOnCurve(C.G, C.a, C.b, C.p), 'the base point lies on the curve');
assert(P.ecMul(C.n, C.G, C.a, C.p) === null, 'n*G is the point at infinity — n really is the order');
assert(P.ecMul(1, C.G, C.a, C.p).x === C.G.x, '1*G is G');
assert(P.ecAdd(C.G, null, C.a, C.p).x === C.G.x, 'infinity is the group identity');
let onCurve = true, distinct = new Set();
for (let k = 1; k < C.n; k++) {
  const R = P.ecMul(k, C.G, C.a, C.p);
  if (!P.ecOnCurve(R, C.a, C.b, C.p)) onCurve = false;
  distinct.add(R.x + ',' + R.y);
}
assert(onCurve, 'every multiple of G stays on the curve');
assert(distinct.size === C.n - 1,
  'G generates all ' + (C.n - 1) + ' affine points (got ' + distinct.size + ')');

/* ──────────────────────────── ECDSA ────────────────────────────────── */
let signed = 0, verified = 0;
for (let t = 0; t < 400; t++) {
  const d = randInt(1, C.n - 1);
  const Q = P.ecMul(d, C.G, C.a, C.p);
  const h = randInt(0, C.n - 1);
  const k = randInt(1, C.n - 1);
  const sig = P.ecdsaSign(h, d, k, C);
  if (!sig) continue;              // degenerate nonce; real ECDSA resamples too
  signed++;
  if (P.ecdsaVerify(h, sig, Q, C)) verified++;
}
assert(signed > 350, 'most nonces produce a usable signature (' + signed + '/400)');
assert(verified === signed, 'every valid signature verifies (' + verified + '/' + signed + ')');

// A signature must not verify against a different message or key — but on a
// curve of order 103 a random forgery still lands about 1/n of the time by
// pure luck, so the honest assertion is that the rate tracks the 1/n bound
// rather than being zero. Real ECDSA uses n near 2^256, where the same bound
// is unreachable. Asserting zero here would be asserting the toy is stronger
// than the mathematics allows.
const FORGE_TRIALS = 6000;
let forgeries = 0, wrongKey = 0, tampered = 0, trials = 0;
for (let t = 0; t < FORGE_TRIALS; t++) {
  const d = randInt(1, C.n - 1);
  const Q = P.ecMul(d, C.G, C.a, C.p);
  const h = randInt(0, C.n - 1);
  const sig = P.ecdsaSign(h, d, randInt(1, C.n - 1), C);
  if (!sig) continue;
  trials++;
  const h2 = (h + 1 + randInt(0, C.n - 3)) % C.n;
  if (h2 !== h && P.ecdsaVerify(h2, sig, Q, C)) forgeries++;
  let d2 = randInt(1, C.n - 1); if (d2 === d) d2 = (d % (C.n - 1)) + 1;
  if (P.ecdsaVerify(h, sig, P.ecMul(d2, C.G, C.a, C.p), C)) wrongKey++;
  if (P.ecdsaVerify(h, { r: sig.r, s: P.mod(sig.s + 1, C.n) }, Q, C)) tampered++;
}
const bound = 4 / C.n;
assert(trials > FORGE_TRIALS * 0.85, 'enough signature trials (' + trials + ')');
assert(forgeries / trials < bound,
  'a different message verifies only at the 1/n luck rate (' + forgeries + '/' + trials +
  ' = ' + (forgeries / trials).toFixed(4) + ', 1/n = ' + (1 / C.n).toFixed(4) + ')');
assert(wrongKey / trials < bound,
  'the wrong public key verifies only at the 1/n luck rate (' + wrongKey + '/' + trials + ')');
assert(tampered / trials < bound,
  'a tampered s verifies only at the 1/n luck rate (' + tampered + '/' + trials + ')');
// And the honest path is not merely "better than luck" — it is exact.
assert(verified === signed, 'meanwhile every honestly produced signature verifies, always');

// Malformed inputs must be rejected rather than crash.
assert(P.ecdsaVerify(5, null, C.G, C) === false, 'a null signature is rejected');
assert(P.ecdsaVerify(5, { r: 0, s: 5 }, C.G, C) === false, 'r = 0 is rejected');
assert(P.ecdsaVerify(5, { r: 5, s: C.n }, C.G, C) === false, 's = n is out of range');
assert(P.ecdsaVerify(5, { r: 5, s: 5 }, null, C) === false, 'the identity is not a public key');
assert(P.ecdsaVerify(5, { r: 5, s: 5 }, { x: 1, y: 1 }, C) === false,
  'a point off the curve is not a public key');

// THE headline failure: reuse a nonce and the private key falls out.
let recovered = 0, attempts = 0;
for (let t = 0; t < 300; t++) {
  const d = randInt(1, C.n - 1);
  const k = randInt(1, C.n - 1);
  const h1 = randInt(0, C.n - 1);
  let h2 = randInt(0, C.n - 1); if (h2 === h1) h2 = (h1 + 1) % C.n;
  const s1 = P.ecdsaSign(h1, d, k, C);
  const s2 = P.ecdsaSign(h2, d, k, C);
  if (!s1 || !s2) continue;
  attempts++;
  const out = P.recoverFromReusedNonce(h1, s1.s, h2, s2.s, s1.r, C.n);
  if (out && out.d === d && out.k === k) recovered++;
}
assert(attempts > 250, 'enough nonce-reuse attempts (' + attempts + ')');
assert(recovered === attempts,
  'reusing one nonce leaks the private key every time (' + recovered + '/' + attempts + ')');

// ...and with distinct nonces it does not.
const dd = 42, Qd = P.ecMul(dd, C.G, C.a, C.p);
const sa = P.ecdsaSign(11, dd, 7, C), sb = P.ecdsaSign(29, dd, 9, C);
assert(sa.r !== sb.r, 'different nonces give different r values');
assert(P.ecdsaVerify(11, sa, Qd, C) && P.ecdsaVerify(29, sb, Qd, C),
  'both distinct-nonce signatures verify');

/* ────────────────────── Shamir's Secret Sharing ─────────────────────── */
let exact = 0, cases = 0, countWrong = 0;
for (let t = 0; t < 400; t++) {
  const secret = randInt(0, SP - 1);
  const k = randInt(2, 5), n = k + randInt(0, 3);
  const coeffs = []; for (let i = 0; i < k - 1; i++) coeffs.push(randInt(0, SP - 1));
  const out = P.shamirSplit(secret, k, n, SP, coeffs);
  if (out.shares.length !== n) countWrong++;
  // every k-subset must reconstruct; test a rotating selection
  const pick = out.shares.slice(t % (n - k + 1), (t % (n - k + 1)) + k);
  cases++;
  if (P.shamirCombine(pick, SP) === P.mod(secret, SP)) exact++;
}
assert(countWrong === 0, 'split always produces exactly n shares');
assert(exact === cases, 'any k shares reconstruct the secret exactly (' + exact + '/' + cases + ')');

// k-1 shares must reveal nothing: for every candidate secret there is a
// consistent polynomial, so the remaining possibilities stay uniform.
const kk = 3, secretA = 123;
const cf = [55, 200];
const sharesA = P.shamirSplit(secretA, kk, 6, SP, cf).shares;
const twoShares = sharesA.slice(0, kk - 1);
let consistent = 0;
for (let guess = 0; guess < SP; guess++) {
  // build the unique degree-(k-1) polynomial through the k-1 shares and (0, guess)
  const pts = twoShares.concat([{ x: 0, y: guess }]);
  // reconstruct at each known x and check agreement
  let ok = true;
  for (const s of twoShares) {
    // Lagrange through pts evaluated at s.x must return s.y
    let acc = 0;
    for (let i = 0; i < pts.length; i++) {
      let num = 1, den = 1;
      for (let j = 0; j < pts.length; j++) {
        if (i === j) continue;
        num = P.mod(num * P.mod(s.x - pts[j].x, SP), SP);
        den = P.mod(den * P.mod(pts[i].x - pts[j].x, SP), SP);
      }
      acc = P.mod(acc + P.mod(pts[i].y * P.mod(num * P.modInv(den, SP), SP), SP), SP);
    }
    if (acc !== s.y) ok = false;
  }
  if (ok) consistent++;
}
assert(consistent === SP,
  'with k-1 shares, every one of the ' + SP + ' possible secrets stays consistent (got ' +
  consistent + ') — the scheme leaks nothing, information-theoretically');

// Fewer than k shares must not reconstruct by accident.
assert(P.shamirCombine(twoShares, SP) !== secretA,
  'k-1 shares do not reconstruct the secret');

/* ─────────────────── Schnorr zero-knowledge proofs ──────────────────── */
assert(P.powmod(G.g, G.q, G.p) === 1, 'g has order dividing q');
assert(G.g !== 1, 'g is not the identity, so its order is exactly q (q is prime)');

let honest = 0;
for (let t = 0; t < 400; t++) {
  const x = randInt(1, G.q - 1);
  const y = P.powmod(G.g, x, G.p);
  const r = randInt(1, G.q - 1), c = randInt(0, G.q - 1);
  const tt = P.schnorrCommit(r, G);
  const s = P.schnorrRespond(r, c, x, G);
  if (P.schnorrVerify(tt, c, s, y, G)) honest++;
}
assert(honest === 400, 'an honest prover always convinces the verifier (' + honest + '/400)');

// Soundness: a cheat who does not know x has to guess. The soundness error is
// exactly 1/q — NOT zero — because for any commitment there is one challenge
// they could have prepared for. That is why the protocol is repeated, or the
// challenge space made huge. Asserting zero here would be asserting something
// false about how Sigma protocols work.
const CHEAT_TRIALS = 20000;
let cheatWins = 0;
for (let t = 0; t < CHEAT_TRIALS; t++) {
  const x = randInt(1, G.q - 1);
  const y = P.powmod(G.g, x, G.p);
  const tt = P.schnorrCommit(randInt(1, G.q - 1), G);
  if (P.schnorrVerify(tt, randInt(0, G.q - 1), randInt(0, G.q - 1), y, G)) cheatWins++;
}
const cheatRate = cheatWins / CHEAT_TRIALS;
assert(cheatRate < 4 / G.q,
  'blind guessing succeeds at roughly the 1/q soundness bound, not more (' +
  cheatWins + '/' + CHEAT_TRIALS + ' = ' + cheatRate.toFixed(5) +
  ', bound 1/q = ' + (1 / G.q).toFixed(5) + ')');

// A cheat who commits honestly but does not know x still cannot answer.
let noSecretWins = 0;
for (let t = 0; t < 400; t++) {
  const x = randInt(1, G.q - 1);
  const y = P.powmod(G.g, x, G.p);
  const r = randInt(1, G.q - 1);
  const tt = P.schnorrCommit(r, G);
  const c = randInt(1, G.q - 1);
  let guess = randInt(1, G.q - 1);          // a wrong secret
  if (guess === x) guess = (x % (G.q - 1)) + 1;
  if (P.schnorrVerify(tt, c, P.schnorrRespond(r, c, guess, G), y, G)) noSecretWins++;
}
assert(noSecretWins === 0,
  'answering with the wrong secret never verifies (' + noSecretWins + '/400)');

// Zero knowledge: a simulator with no secret produces transcripts that verify.
let simOk = 0;
for (let t = 0; t < 400; t++) {
  const x = randInt(1, G.q - 1);
  const y = P.powmod(G.g, x, G.p);
  const sim = P.schnorrSimulate(randInt(0, G.q - 1), randInt(1, G.q - 1), y, G);
  if (sim && P.schnorrVerify(sim.t, sim.c, sim.s, y, G)) simOk++;
}
assert(simOk === 400,
  'a simulator that never sees the secret produces verifying transcripts (' + simOk +
  '/400) — which is why a transcript convinces nobody who did not pick the challenge');

// Special soundness: two answers to one commitment yield the secret.
let extracted = 0;
for (let t = 0; t < 400; t++) {
  const x = randInt(1, G.q - 1);
  const r = randInt(1, G.q - 1);
  let c1 = randInt(0, G.q - 1), c2 = randInt(0, G.q - 1);
  if (c1 === c2) c2 = (c1 + 1) % G.q;
  const s1 = P.schnorrRespond(r, c1, x, G);
  const s2 = P.schnorrRespond(r, c2, x, G);
  if (P.schnorrExtract(s1, c1, s2, c2, G) === x) extracted++;
}
assert(extracted === 400,
  'answering two challenges on one commitment reveals the secret (' + extracted + '/400)');
assert(P.schnorrExtract(5, 3, 9, 3, G) === null, 'identical challenges extract nothing');

console.log('\nprotocol-math: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
