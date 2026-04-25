/**
 * Caesar Auto-Break Engine
 * ------------------------
 * Brute-forces all 25 non-trivial Caesar shifts and ranks each candidate
 * plaintext by English-likelihood using chi-squared distance against
 * standard English letter frequencies.
 *
 * Pure, deterministic, no DOM dependencies. Browser-friendly: attached to
 * window.CaesarBreak when loaded as a classic <script>.
 *
 * scoreEnglishChiSquared(text):
 *   Lower is better. 0 means identical to English distribution.
 * breakCaesar(ciphertext):
 *   Returns Array<{shift, plaintext, score}> sorted by ascending score
 *   (best candidate first). All 25 non-zero shifts are returned so the
 *   user can see the full process, not just the winner.
 */
(function (root) {
  'use strict';

  // Standard English letter frequencies (percent), from large-corpus norms.
  // Matches the table used elsewhere on the site (cryptanalysis.html).
  const ENGLISH_FREQ = {
    A: 8.2,  B: 1.5,  C: 2.8,  D: 4.3,  E: 12.7, F: 2.2,
    G: 2.0,  H: 6.1,  I: 7.0,  J: 0.15, K: 0.77, L: 4.0,
    M: 2.4,  N: 6.7,  O: 7.5,  P: 1.9,  Q: 0.10, R: 6.0,
    S: 6.3,  T: 9.1,  U: 2.8,  V: 0.98, W: 2.4,  X: 0.15,
    Y: 2.0,  Z: 0.074,
  };
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /** Apply a Caesar shift to text. Non-letters pass through unchanged. */
  function shiftText(text, shift) {
    const s = ((shift % 26) + 26) % 26;
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (c >= 65 && c <= 90) {
        out += String.fromCharCode(((c - 65 + s) % 26) + 65);
      } else if (c >= 97 && c <= 122) {
        out += String.fromCharCode(((c - 97 + s) % 26) + 97);
      } else {
        out += text[i];
      }
    }
    return out;
  }

  /**
   * Chi-squared distance between observed letter frequencies in `text`
   * and standard English frequencies. Lower = more English-like.
   * Formula: Σ ((observed_i − expected_i)² / expected_i)
   */
  function scoreEnglishChiSquared(text) {
    const upper = String(text || '').toUpperCase().replace(/[^A-Z]/g, '');
    const n = upper.length;
    if (n === 0) return Infinity;
    const counts = {};
    for (let i = 0; i < 26; i++) counts[ALPHABET[i]] = 0;
    for (let i = 0; i < n; i++) counts[upper[i]]++;
    let chi = 0;
    for (let i = 0; i < 26; i++) {
      const ch = ALPHABET[i];
      const expected = (ENGLISH_FREQ[ch] / 100) * n;
      const observed = counts[ch];
      const diff = observed - expected;
      chi += (diff * diff) / expected;
    }
    return chi;
  }

  /**
   * Try every shift 1..25, return ranked candidates (best first).
   * Each entry: { shift, plaintext, score }
   */
  function breakCaesar(ciphertext) {
    const text = String(ciphertext || '');
    const candidates = [];
    for (let shift = 1; shift <= 25; shift++) {
      // Decryption with shift k is equivalent to encryption with 26-k.
      const plaintext = shiftText(text, 26 - shift);
      candidates.push({
        shift: shift,
        plaintext: plaintext,
        score: scoreEnglishChiSquared(plaintext),
      });
    }
    candidates.sort((a, b) => a.score - b.score);
    return candidates;
  }

  const api = {
    ENGLISH_FREQ: ENGLISH_FREQ,
    shiftText: shiftText,
    scoreEnglishChiSquared: scoreEnglishChiSquared,
    breakCaesar: breakCaesar,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.CaesarBreak = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
