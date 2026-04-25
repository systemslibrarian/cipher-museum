/* ================================================================
   THE CIPHER MUSEUM — Detective Analyses v1.5

   window.DetectiveAnalyses.run(text) → stats object (or null)

   Pure analysis functions — no DOM, no globals required.
   Every function takes primitives and returns plain objects.

   Analyses performed:
     - Index of Coincidence (IoC)          — Friedman (1922)
     - Chi-square against English frequency — Sinkov (1966)
     - Kasiski examination                 — Kasiski (1863)
     - Period-sliced IoC validation         — Friedman (1920)
     - Character set detection
     - Digraph structural analysis

   References:
     William Friedman, "The Index of Coincidence and its Applications in
       Cryptography" (1922).
     Abraham Sinkov, "Elementary Cryptanalysis" (MAA, 1966).
     Friedrich Kasiski, "Die Geheimschriften und die Dechiffrirkunst" (1863).
   ================================================================ */
'use strict';

(function (global) {

  /* ─── English letter frequencies (Lewand / Norvig approximations) ─── */
  var ENG_FREQ = {
    A:0.08167,B:0.01492,C:0.02782,D:0.04253,E:0.12702,F:0.02228,
    G:0.02015,H:0.06094,I:0.06966,J:0.00153,K:0.00772,L:0.04025,
    M:0.02406,N:0.06749,O:0.07507,P:0.01929,Q:0.00095,R:0.05987,
    S:0.06327,T:0.09056,U:0.02758,V:0.00978,W:0.02360,X:0.00150,
    Y:0.01974,Z:0.00074
  };

  /* ─── Helpers ────────────────────────────────────────────────── */

  function extractLetters(t) {
    return t.toUpperCase().replace(/[^A-Z]/g, '');
  }

  /* Return {A:n, B:n, …, Z:n} counts for an uppercase-letters-only string. */
  function freqCounts(letters) {
    var c = {}, i;
    for (i = 0; i < 26; i++) c[String.fromCharCode(65 + i)] = 0;
    for (i = 0; i < letters.length; i++) {
      var ch = letters[i];
      if (Object.prototype.hasOwnProperty.call(c, ch)) c[ch]++;
    }
    return c;
  }

  /* Return {A: pct, …} where pct is 0–100 (percentage of total letters). */
  function freqPct(letters) {
    var counts = freqCounts(letters);
    var n = letters.length || 1;
    var pct = {};
    var keys = Object.keys(counts);
    for (var k = 0; k < keys.length; k++) {
      pct[keys[k]] = (counts[keys[k]] / n) * 100;
    }
    return pct;
  }

  /* IoC: measures how "English-like" the letter distribution is.
     English text ≈ 0.067; random (uniform) ≈ 0.038.
     Low IoC → polyalphabetic or random; high IoC → monoalphabetic or transposition. */
  function calcIoC(letters) {
    var n = letters.length;
    if (n < 2) return 0;
    var counts = freqCounts(letters);
    var sum = 0;
    var keys = Object.keys(counts);
    for (var k = 0; k < keys.length; k++) {
      var f = counts[keys[k]];
      sum += f * (f - 1);
    }
    return sum / (n * (n - 1));
  }

  /* Chi-square: compare the ciphertext distribution (shifted by `shift`)
     against expected English frequencies.
     shift=0 → unshifted ciphertext; low chi-square → close to English.
     Caesar shift=k will produce a very low chi-square at the right k. */
  function chiSquareAtShift(letters, shift) {
    var n = letters.length;
    if (n === 0) return Infinity;
    var counts = freqCounts(letters);
    var chi = 0, i;
    for (i = 0; i < 26; i++) {
      var cipherCode = (i + shift) % 26;
      var cipherLetter = String.fromCharCode(65 + cipherCode);
      var plainLetter  = String.fromCharCode(65 + i);
      var observed = counts[cipherLetter];
      var expected = n * ENG_FREQ[plainLetter];
      if (expected > 0.5) chi += (observed - expected) * (observed - expected) / expected;
    }
    return chi;
  }

  /* Find the Caesar shift that minimises chi-square (most English-like). */
  function bestShift(letters) {
    var best = { shift: 0, chi: Infinity }, i;
    for (i = 0; i < 26; i++) {
      var c = chiSquareAtShift(letters, i);
      if (c < best.chi) best = { shift: i, chi: c };
    }
    return best;
  }

  /* Period-IoC: slice `letters` into `period` interleaved streams;
     return mean IoC of those streams.
     For a Vigenère cipher with the right key length, each stream is
     essentially a monoalphabetic cipher and will have IoC ≈ 0.067. */
  function periodIoC(letters, period) {
    if (letters.length < period * 3) return 0;
    var total = 0, start;
    for (start = 0; start < period; start++) {
      var slice = [];
      for (var i = start; i < letters.length; i += period) slice.push(letters[i]);
      total += calcIoC(slice.join(''));
    }
    return total / period;
  }

  /* Kasiski examination: find repeated trigrams, compute GCDs of their
     spacings, return [{period, count}] sorted by count descending.
     A high count for a particular period strongly suggests a Vigenère key
     of that length (or a divisor of it). */
  function kasiskiTest(letters) {
    if (letters.length < 40) return [];
    var positions = {}, i;
    for (i = 0; i <= letters.length - 3; i++) {
      var tri = letters.slice(i, i + 3);
      if (!positions[tri]) positions[tri] = [];
      positions[tri].push(i);
    }
    var spacings = [];
    var keys = Object.keys(positions);
    for (var ki = 0; ki < keys.length; ki++) {
      var pos = positions[keys[ki]];
      if (pos.length < 2) continue;
      for (i = 1; i < pos.length; i++) spacings.push(pos[i] - pos[i - 1]);
    }
    if (spacings.length === 0) return [];
    var gcdCounts = {};
    for (var si = 0; si < spacings.length; si++) {
      var s = spacings[si];
      for (var d = 2; d <= Math.min(s, 20); d++) {
        if (s % d === 0) gcdCounts[d] = (gcdCounts[d] || 0) + 1;
      }
    }
    var results = [];
    var gKeys = Object.keys(gcdCounts);
    for (var gi = 0; gi < gKeys.length; gi++) {
      results.push({ period: +gKeys[gi], count: gcdCounts[gKeys[gi]] });
    }
    return results.sort(function (a, b) { return b.count - a.count; }).slice(0, 6);
  }

  /* Identify the predominant character type of the raw input. */
  function detectCharset(text) {
    var t = text.trim();
    var upper = t.toUpperCase();
    if (/^[\.\-\/\s]+$/.test(t) && /[\.\-]/.test(t)) return 'morse';
    var nonNumSep = t.replace(/[\d\s\/\.\-,\(\)\[\]]/g, '');
    if (nonNumSep.length === 0 && /\d/.test(t)) return 'numeric';
    var letters = upper.replace(/[^A-Z]/g, '');
    if (letters.length === 0) return 'other';
    var letterSet = {};
    for (var i = 0; i < letters.length; i++) letterSet[letters[i]] = true;
    var setKeys = Object.keys(letterSet);
    var adfgvxOk = setKeys.every(function (c) { return /^[ADFGVX]$/.test(c); });
    if (adfgvxOk && setKeys.length >= 3) return setKeys.indexOf('V') >= 0 ? 'adfgvx' : 'adfgx';
    var nonAlpha = t.replace(/[A-Za-z\s]/g, '').length;
    if (nonAlpha / (t.length || 1) > 0.30) return 'mixed';
    return 'alpha';
  }

  /* Digraph structural analysis — used primarily for Playfair detection. */
  function digraphAnalysis(letters) {
    var isEvenLen = letters.length % 2 === 0;
    var adjDupPairs = 0, i;
    for (i = 0; i < letters.length - 1; i += 2) {
      if (letters[i] === letters[i + 1]) adjDupPairs++;
    }
    var distSet = {};
    for (i = 0; i < letters.length; i++) distSet[letters[i]] = true;
    var district = Object.keys(distSet).length;
    return { isEvenLen: isEvenLen, adjDupPairs: adjDupPairs, district: district };
  }

  /* Estimate the most likely key period for display purposes. */
  function estimatePeriod(letters, kasiski) {
    var periodHint = null;
    if (kasiski.length > 0) {
      for (var ki = 0; ki < Math.min(kasiski.length, 4); ki++) {
        if (periodIoC(letters, kasiski[ki].period) > 0.054) {
          periodHint = kasiski[ki].period;
          break;
        }
      }
      if (!periodHint && kasiski[0].count >= 3) periodHint = kasiski[0].period;
    }
    if (!periodHint) {
      var bestP = null, bestPIoC = 0.046;
      for (var p = 2; p <= 15; p++) {
        var pioc = periodIoC(letters, p);
        if (pioc > bestPIoC) { bestPIoC = pioc; bestP = p; }
      }
      if (bestP) periodHint = bestP;
    }
    return periodHint;
  }

  /* ─── Main entry point ────────────────────────────────────────── */

  function run(text) {
    if (!text || text.trim().length === 0) return null;

    var letters    = extractLetters(text);
    var n          = letters.length;
    var tooShort   = n < 60; /* threshold for reliable statistical analysis */
    var ioc        = calcIoC(letters);
    var chi0       = chiSquareAtShift(letters, 0);
    var bsr        = bestShift(letters);
    var kasiski    = kasiskiTest(letters);
    var charset    = detectCharset(text);
    var dg         = digraphAnalysis(letters);
    var counts     = freqCounts(letters);
    var pct        = freqPct(letters);
    var periodHint = estimatePeriod(letters, kasiski);

    return {
      raw:        text,
      letters:    letters,
      n:          n,
      tooShort:   tooShort,
      ioc:        ioc,
      chi0:       chi0,
      bestShiftResult: bsr,
      kasiski:    kasiski,
      charset:    charset,
      dg:         dg,
      counts:     counts,
      pct:        pct,
      periodHint: periodHint
    };
  }

  /* ─── Export ─────────────────────────────────────────────────── */
  global.DetectiveAnalyses = {
    run: run,
    ENG_FREQ: ENG_FREQ,
    /* Expose helpers for testing */
    _calcIoC:          calcIoC,
    _chiSquareAtShift: chiSquareAtShift,
    _kasiskiTest:      kasiskiTest,
    _detectCharset:    detectCharset,
    _periodIoC:        periodIoC,
    _freqCounts:       freqCounts
  };

})(typeof window !== 'undefined' ? window : global);
