/**
 * Equidistant Letter Sequence (ELS) Search
 * ----------------------------------------
 * The pattern-finding method behind the "Bible code" claims of
 * Witztum-Rips-Rosenberg (1994) and the popular book by Drosnin (1997).
 * Given a body of text and a target word, ELS slides a "skip" of size
 * d across the text and asks: starting at position p, do every d-th
 * letter spell the target?
 *
 *     skip d=5, start p=0:  T_____X_____Y_____Z   →  reads "TXYZ"
 *
 * The cryptanalytic critique is statistical, not literary. For any
 * sufficiently long text, the *number of expected hits* for a target
 * word grows roughly with text-length × alphabet-frequency-product.
 * Long texts find any short word at many skips. The famous 1999
 * refutation (McKay, Bar-Natan, Bar-Hillel, Kalai, Statistical
 * Science) showed the same Witztum-Rips method finds "predictions"
 * of modern events in the Hebrew translation of *War and Peace* and
 * in *Moby-Dick* — including assassinations of Kennedy, Gandhi,
 * Trotsky, and Indira Gandhi.
 *
 * This engine is designed to make that demonstration *runnable*.
 *
 * Public API
 * ----------
 *   normalise(text)                     → letters-only uppercase string
 *   findELS(text, target, opts)         → array of {start, skip, end}
 *                                         opts: { minSkip=2, maxSkip=1000,
 *                                                 maxResults=100 }
 *   expectedHits(textLen, target)       → analytic estimate using English
 *                                         letter frequencies; explains why
 *                                         long texts trivially produce hits
 *
 *   This is purely a search; no claim is made about the meaningfulness
 *   of any hit.
 */
(function (root) {
  'use strict';

  // English letter frequencies (Norvig corpus). The same table is used
  // by caesar-break.js and lorenz-depth.js — kept consistent on purpose.
  const FREQ = {
    A:0.0817, B:0.0150, C:0.0278, D:0.0425, E:0.1270, F:0.0223,
    G:0.0202, H:0.0609, I:0.0697, J:0.0015, K:0.0077, L:0.0403,
    M:0.0241, N:0.0675, O:0.0751, P:0.0193, Q:0.0010, R:0.0599,
    S:0.0633, T:0.0906, U:0.0276, V:0.0098, W:0.0236, X:0.0015,
    Y:0.0197, Z:0.0007,
  };

  /** Strip everything except letters; return uppercase. */
  function normalise(text) {
    if (!text) return '';
    return String(text).toUpperCase().replace(/[^A-Z]/g, '');
  }

  /**
   * Find every position where the target appears as an equidistant
   * letter sequence in text (after normalisation).
   *
   * For each skip d in [minSkip, maxSkip], slide start p across the
   * text and check whether text[p], text[p+d], text[p+2d], ... spells
   * the target.
   *
   * Negative skips are not searched separately; they are equivalent to
   * positive skips read in reverse, which the caller can do by
   * reversing the input text.
   *
   * Returns at most maxResults hits, in scan order. Each hit is
   * { start, skip, end } where end = start + skip*(target.length-1).
   */
  function findELS(text, target, opts) {
    const o = opts || {};
    const minSkip = Math.max(1, o.minSkip || 2);
    const maxSkip = Math.max(minSkip, o.maxSkip || 1000);
    const maxResults = o.maxResults || 100;

    const txt = normalise(text);
    const tgt = normalise(target);
    if (!txt.length || !tgt.length) return [];

    const N = txt.length;
    const L = tgt.length;
    const hits = [];

    for (let d = minSkip; d <= maxSkip && hits.length < maxResults; d++) {
      const span = d * (L - 1);
      const lastStart = N - span - 1;
      if (lastStart < 0) continue;
      // Only positions where text[p] === tgt[0] are candidates;
      // this is a 26x speed-up vs blind scanning.
      for (let p = 0; p <= lastStart; p++) {
        if (txt.charCodeAt(p) !== tgt.charCodeAt(0)) continue;
        let ok = true;
        for (let k = 1; k < L; k++) {
          if (txt.charCodeAt(p + k * d) !== tgt.charCodeAt(k)) { ok = false; break; }
        }
        if (ok) {
          hits.push({ start: p, skip: d, end: p + span });
          if (hits.length >= maxResults) break;
        }
      }
    }
    return hits;
  }

  /**
   * Analytic estimate of expected ELS hits for a target word in a
   * random text of given length, summed over skips [minSkip, maxSkip].
   *
   * For each (start, skip), the probability of a hit is the product of
   * English letter frequencies of the target. The number of (start, skip)
   * pairs is approximately textLen × (maxSkip − minSkip). Multiplying
   * gives the expected number of hits — typically very large for short
   * targets in long texts.
   *
   * This is the single most important number on the page: it is why
   * "the Bible predicts" any short word.
   */
  function expectedHits(textLen, target, opts) {
    const o = opts || {};
    const minSkip = Math.max(1, o.minSkip || 2);
    const maxSkip = Math.max(minSkip, o.maxSkip || 1000);
    const tgt = normalise(target);
    if (!tgt.length || textLen <= 0) return 0;
    let p = 1;
    for (let i = 0; i < tgt.length; i++) {
      p *= (FREQ[tgt[i]] || 0.0001);
    }
    // Approximation: ignore the small reduction in valid starts for
    // large skips. Good to within a few percent for textLen >> maxSkip*L.
    const pairs = textLen * (maxSkip - minSkip + 1);
    return p * pairs;
  }

  const api = {
    normalise: normalise,
    findELS: findELS,
    expectedHits: expectedHits,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.ELS = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
