/**
 * Lorenz Depth-Attack Engine
 * --------------------------
 * The 1941 Bletchley Park cryptanalytic breakthrough that broke the
 * Lorenz SZ40 — and, by extension, every modern stream cipher whose
 * nonce gets reused. Pure JavaScript, no DOM dependencies.
 *
 * Background
 * ----------
 * Lorenz is a Vernam-style cipher: ciphertext C = plaintext P XOR keystream K.
 * If two different plaintexts P1, P2 are sent under the SAME keystream K,
 * the keystream cancels when the ciphertexts are XORed:
 *     C1 XOR C2 = (P1 XOR K) XOR (P2 XOR K) = P1 XOR P2
 * The attacker now has a "depth" — the XOR of the two plaintexts —
 * which leaks an enormous amount of structural information. A guessed
 * crib word for one message reveals the matching slice of the other.
 *
 * On 30 August 1941 a German operator sent a 4,000-character Lorenz
 * message, was asked to resend, and re-sent with the same machine
 * settings but slightly different abbreviations — handing Bletchley
 * Park its first depth. Bill Tutte unwound the entire wheel structure
 * from this single mistake, and Tommy Flowers built Colossus to
 * automate the search. This exact attack (now called nonce-reuse)
 * still breaks WEP, IV-reused TLS, and weak GCM implementations today.
 *
 * Public API
 * ----------
 *   xorStrings(a, b)              → byte-XOR of two equal-length strings
 *   makeDepth(plain1, plain2, key) → { c1, c2, depth }   (demo helper)
 *   crackDepth(c1, c2)            → P1 XOR P2 directly
 *   cribDrag(depthXor, crib)      → slide crib across the depth, return
 *                                   { offset, candidate, score, printable }
 *                                   for every position, sorted best-first
 *   isLikelyEnglish(text)         → cheap printability/English score
 */
(function (root) {
  'use strict';

  // Letter-frequency lookup for cheap English-likelihood scoring.
  // Reuses the same numbers as the Caesar auto-break engine.
  const ENG = {
    A: 8.2,  B: 1.5,  C: 2.8,  D: 4.3,  E: 12.7, F: 2.2,
    G: 2.0,  H: 6.1,  I: 7.0,  J: 0.15, K: 0.77, L: 4.0,
    M: 2.4,  N: 6.7,  O: 7.5,  P: 1.9,  Q: 0.10, R: 6.0,
    S: 6.3,  T: 9.1,  U: 2.8,  V: 0.98, W: 2.4,  X: 0.15,
    Y: 2.0,  Z: 0.074,
  };

  /** Byte-XOR of two strings; truncates to the shorter length. */
  function xorStrings(a, b) {
    const n = Math.min(a.length, b.length);
    let out = '';
    for (let i = 0; i < n; i++) {
      out += String.fromCharCode(a.charCodeAt(i) ^ b.charCodeAt(i));
    }
    return out;
  }

  /**
   * Build a demo two-time-pad depth.
   * Returns { c1, c2, depth } where depth = c1 XOR c2 = plain1 XOR plain2.
   * The key is repeated/truncated to match the longer plaintext.
   */
  function makeDepth(plain1, plain2, key) {
    if (!key || !key.length) throw new Error('Key required');
    const n = Math.max(plain1.length, plain2.length);
    let stream = '';
    while (stream.length < n) stream += key;
    stream = stream.slice(0, n);
    const c1 = xorStrings(plain1, stream.slice(0, plain1.length));
    const c2 = xorStrings(plain2, stream.slice(0, plain2.length));
    return { c1: c1, c2: c2, depth: xorStrings(c1, c2) };
  }

  /** Direct: cancel the keystream, returning P1 XOR P2. */
  function crackDepth(c1, c2) {
    return xorStrings(c1, c2);
  }

  /**
   * Score a candidate plaintext fragment by printability + letter freq.
   * Higher = more English-like. 0 means unprintable.
   *
   * - Hard-fails on any non-printable byte (rules out unaligned XOR garbage).
   * - Rewards letters and spaces; mildly penalises rare-letter pile-ups.
   */
  function isLikelyEnglish(text) {
    if (!text || !text.length) return 0;
    let letters = 0, spaces = 0, symbols = 0;
    let freqSum = 0;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (c < 32 || c > 126) return 0;          // hard fail on control bytes
      if (c === 32) {
        spaces++;
        // Spaces are the single most common character in real English
        // text (~17%, more frequent than 'E'). Score them accordingly,
        // otherwise random letter-pile-ups outrank genuine plaintext.
        freqSum += 13.0;
        continue;
      }
      const ch = String.fromCharCode(c).toUpperCase();
      if (ch >= 'A' && ch <= 'Z') {
        letters++;
        freqSum += (ENG[ch] || 0);
      } else {
        symbols++;                               // punctuation, digits, brackets
      }
    }
    const n = text.length;
    // Demand a high letter+space ratio; a single stray '[' or '@' is a
    // strong signal that this offset is XOR noise, not real plaintext.
    const letterRatio = (letters + spaces) / n;
    if (letterRatio < 0.9) return 0;
    // Multiplicative penalty per non-letter symbol: each one halves the score.
    const penalty = Math.pow(0.5, symbols);
    return (freqSum / n) * letterRatio * penalty;
  }

  /**
   * Crib-drag: slide `crib` across `depthXor` (which equals P1 XOR P2).
   * At each offset i, compute depthXor[i..] XOR crib. If `crib` matches
   * P1 at offset i, the result is the corresponding slice of P2 — and
   * vice versa. Readable output at offset i is strong evidence that
   * `crib` is correct at that position in one of the two messages.
   *
   * Returns an array of { offset, candidate, score, printable } for
   * every legal offset, sorted by descending score.
   */
  function cribDrag(depthXor, crib) {
    const results = [];
    if (!crib || !crib.length) return results;
    const max = depthXor.length - crib.length;
    for (let off = 0; off <= max; off++) {
      const slice = depthXor.substr(off, crib.length);
      const candidate = xorStrings(slice, crib);
      const score = isLikelyEnglish(candidate);
      // printable = no control bytes (used so the UI can grey out junk
      // even when score is zero for other reasons)
      let printable = true;
      for (let i = 0; i < candidate.length; i++) {
        const c = candidate.charCodeAt(i);
        if (c < 32 || c > 126) { printable = false; break; }
      }
      results.push({
        offset: off,
        candidate: candidate,
        score: score,
        printable: printable,
      });
    }
    results.sort((a, b) => b.score - a.score);
    return results;
  }

  const api = {
    xorStrings: xorStrings,
    makeDepth: makeDepth,
    crackDepth: crackDepth,
    cribDrag: cribDrag,
    isLikelyEnglish: isLikelyEnglish,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.LorenzDepth = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
