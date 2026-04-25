/* ================================================================
   THE CIPHER MUSEUM — Cipher Detective Analysis Engine v1.0

   window.CipherDetective.analyse(text) → { stats, candidates }

   Scores 10 cipher families using:
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
     David Kahn, "The Codebreakers" (Scribner, 1996) ch. 7–9.
   ================================================================ */
'use strict';

(function (global) {

  /* ─────────────────────── English frequencies (Sinkov) ───────── */
  var ENG_FREQ = {
    A:0.08167,B:0.01492,C:0.02782,D:0.04253,E:0.12702,F:0.02228,
    G:0.02015,H:0.06094,I:0.06966,J:0.00153,K:0.00772,L:0.04025,
    M:0.02406,N:0.06749,O:0.07507,P:0.01929,Q:0.00095,R:0.05987,
    S:0.06327,T:0.09056,U:0.02758,V:0.00978,W:0.02360,X:0.00150,
    Y:0.01974,Z:0.00074
  };

  /* ─────────────────────── Helpers ────────────────────────────── */

  function extractLetters(t) {
    return t.toUpperCase().replace(/[^A-Z]/g, '');
  }

  function freqCounts(letters) {
    var c = {}, i;
    for (i = 0; i < 26; i++) c[String.fromCharCode(65 + i)] = 0;
    for (i = 0; i < letters.length; i++) {
      var ch = letters[i];
      if (Object.prototype.hasOwnProperty.call(c, ch)) c[ch]++;
    }
    return c;
  }

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

  /* Chi-square: compare distribution of `letters` (shifted by `shift`)
     against English.  shift=0 → test ciphertext directly.            */
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

  function bestShift(letters) {
    var best = { shift: 0, chi: Infinity }, i;
    for (i = 0; i < 26; i++) {
      var c = chiSquareAtShift(letters, i);
      if (c < best.chi) best = { shift: i, chi: c };
    }
    return best;
  }

  /* Period IoC: slice `letters` into `period` interleaved streams,
     return mean IoC of those streams.                                */
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

  /* Kasiski examination: find repeated trigrams, compute GCDs of
     their spacings, return [{period, count}] sorted by count desc. */
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
    // Morse: only dot, dash, slash, whitespace
    if (/^[\.\-\/\s]+$/.test(t) && /[\.\-]/.test(t)) return 'morse';
    // Numeric: mostly digits and separator chars
    var nonNumSep = t.replace(/[\d\s\/\.\-,\(\)\[\]]/g, '');
    if (nonNumSep.length === 0 && /\d/.test(t)) return 'numeric';
    // Extract letters only
    var letters = upper.replace(/[^A-Z]/g, '');
    if (letters.length === 0) return 'other';
    var letterSet = {};
    for (var i = 0; i < letters.length; i++) letterSet[letters[i]] = true;
    var setKeys = Object.keys(letterSet);
    // ADFGVX: every letter is in {A,D,F,G,V,X}
    var adfgvxOk = setKeys.every(function (c) { return /^[ADFGVX]$/.test(c); });
    if (adfgvxOk && setKeys.length >= 3) return setKeys.indexOf('V') >= 0 ? 'adfgvx' : 'adfgx';
    // Alpha
    var nonAlpha = t.replace(/[A-Za-z\s]/g, '').length;
    if (nonAlpha / (t.length || 1) > 0.30) return 'mixed';
    return 'alpha';
  }

  /* Digraph structural analysis for Playfair detection. */
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

  /* ─────────────────────── Family scorers ─────────────────────── */

  function scoreFamily(family, stats) {
    var n = stats.n, ioc = stats.ioc, chi0 = stats.chi0;
    var bsr = stats.bestShiftResult;
    var kasiski = stats.kasiski, charset = stats.charset;
    var dg = stats.dg, letters = stats.letters;
    var score = 0;
    var forEv = [], againstEv = [];

    switch (family) {

      case 'caesar':
        if (ioc >= 0.060) {
          score += 3; forEv.push('IoC ' + ioc.toFixed(4) + ' is in the English range — single-alphabet cipher');
        } else if (ioc >= 0.054) {
          score += 1; forEv.push('IoC ' + ioc.toFixed(4) + ' is somewhat elevated');
        } else {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' is too low for a single-alphabet cipher');
        }
        if (bsr.chi < 40) {
          score += 6; forEv.push('Shift ' + bsr.shift + ' gives chi-square ' + bsr.chi.toFixed(1) + ' — very strong match to English letter frequencies');
        } else if (bsr.chi < 80) {
          score += 4; forEv.push('Shift ' + bsr.shift + ' gives chi-square ' + bsr.chi.toFixed(1) + ' — good English match');
        } else if (bsr.chi < 150) {
          score += 1; forEv.push('Shift ' + bsr.shift + ' gives chi-square ' + bsr.chi.toFixed(1) + ' — passable English match');
        } else {
          againstEv.push('Best-shift chi-square ' + bsr.chi.toFixed(1) + ' — no single shift gives English-like distribution');
        }
        // Unshifted chi-square should be high (letters are displaced)
        if (chi0 > 100 && bsr.chi < 100) {
          score += 1; forEv.push('Unshifted chi-square ' + chi0.toFixed(1) + ' confirms the letters are displaced by a fixed offset');
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters-only ciphertext — consistent with letter cipher'); }
        if (ioc < 0.050) { score -= 3; }
        break;

      case 'simple-sub':
        if (ioc >= 0.060) {
          score += 3; forEv.push('IoC ' + ioc.toFixed(4) + ' matches natural-language range — single-alphabet cipher');
        } else {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' too low for single-alphabet cipher');
        }
        // Best shift is still high-chi → alphabet is scrambled, not just shifted
        if (bsr.chi >= 120) {
          score += 3; forEv.push('Chi-square remains ' + bsr.chi.toFixed(1) + ' at every shift — scrambled alphabet, not a simple offset');
        } else if (bsr.chi >= 60) {
          score += 1;
        } else {
          againstEv.push('A single shift accounts for frequency patterns — more consistent with Caesar');
        }
        if (dg.district >= 22) {
          score += 2; forEv.push(dg.district + ' distinct letters — rich usage typical of full-alphabet keyword substitution');
        } else if (dg.district >= 18) {
          score += 1; forEv.push(dg.district + ' distinct letters observed');
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters-only ciphertext'); }
        if (ioc < 0.050) { score -= 3; againstEv.push('IoC too low — likely polyalphabetic'); }
        break;

      case 'vigenere':
        if (ioc >= 0.040 && ioc <= 0.062) {
          score += 3; forEv.push('IoC ' + ioc.toFixed(4) + ' lies between random (0.038) and English (0.067) — polyalphabetic cipher range');
        } else if (ioc > 0.062) {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' too high — suggests single-alphabet (Caesar or monoalphabetic)');
        } else {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' very low — key may be near-OTP length');
        }
        if (kasiski.length > 0) {
          var topK = kasiski[0];
          var pioc = periodIoC(letters, topK.period);
          if (pioc > 0.060) {
            score += 5; forEv.push('Kasiski test suggests period ' + topK.period + '; sliced-IoC ' + pioc.toFixed(4) + ' ≈ English — strongest Vigenère signature');
          } else if (pioc > 0.052) {
            score += 3; forEv.push('Kasiski period ' + topK.period + '; sliced-IoC ' + pioc.toFixed(4) + ' partially elevated');
          } else if (pioc > 0.044) {
            score += 1; forEv.push('Repeated trigrams suggest period ' + topK.period + ' (Kasiski — period IoC moderate)');
          }
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters-only ciphertext'); }
        if (ioc > 0.066) { score -= 3; }
        if (charset !== 'alpha') { score -= 1; }
        break;

      case 'transposition':
        if (ioc >= 0.060) {
          score += 3; forEv.push('IoC ' + ioc.toFixed(4) + ' at English level — transposition preserves letter frequencies');
        } else {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' — transposition cannot lower IoC below 0.060');
        }
        if (chi0 < 50) {
          score += 5; forEv.push('Chi-square ' + chi0.toFixed(1) + ' — distribution nearly identical to English; no substitution occurred');
        } else if (chi0 < 100) {
          score += 3; forEv.push('Chi-square ' + chi0.toFixed(1) + ' — close to English frequencies (rearranged, not substituted)');
        } else if (chi0 < 160) {
          score += 1; forEv.push('Chi-square ' + chi0.toFixed(1) + ' — moderately English-like');
        } else {
          againstEv.push('Chi-square ' + chi0.toFixed(1) + ' — substitution seems to have altered frequencies');
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters only'); }
        if (bsr.chi < chi0 - 50) {
          againstEv.push('A shifted chi-square is notably lower — substitution likely occurred');
        }
        if (ioc < 0.055) { score -= 3; againstEv.push('IoC too low — pure transposition preserves IoC'); }
        break;

      case 'playfair':
        if (dg.isEvenLen) {
          score += 2; forEv.push('Even letter count — Playfair always outputs an even number of letters');
        } else {
          score -= 2; againstEv.push('Odd letter count — Playfair output is always even-length');
        }
        if (dg.adjDupPairs === 0 && n >= 20) {
          score += 4; forEv.push('No duplicate letters in any consecutive digraph pair — structural Playfair constraint');
        } else if (dg.adjDupPairs > 0) {
          score -= 3; againstEv.push(dg.adjDupPairs + ' digraph pair(s) with duplicate letters — Playfair never produces these');
        }
        if (dg.district === 25) {
          score += 3; forEv.push('Exactly 25 distinct letters — Playfair merges I and J into a 25-letter alphabet');
        } else if (dg.district >= 23) {
          score += 1; forEv.push(dg.district + ' distinct letters — near the 25-letter Playfair alphabet');
        }
        if (ioc >= 0.046 && ioc <= 0.065) {
          score += 2; forEv.push('IoC ' + ioc.toFixed(4) + ' — slightly flattened, typical for a digraphic substitution');
        }
        if (n < 20) { score -= 1; againstEv.push('Sample too short for reliable Playfair identification'); }
        break;

      case 'adfgvx':
        if (charset === 'adfgvx') {
          score += 9; forEv.push('Every letter is A, D, F, G, V, or X — the ADFGVX fractionation alphabet (German WWI, June 1918)');
        } else if (charset === 'adfgx') {
          score += 7; forEv.push('Every letter is A, D, F, G, or X — ADFGX variant (German WWI, February–June 1918)');
        } else {
          againstEv.push('Ciphertext contains letters outside the A,D,F,G,V,X set');
          score -= 3;
        }
        if (ioc < 0.055) { score += 1; forEv.push('Low IoC (' + ioc.toFixed(4) + ') expected after the columnar transposition step'); }
        break;

      case 'morse':
        if (charset === 'morse') {
          score += 10; forEv.push('Text contains only dots (·), dashes (−), and spaces — standard Morse code structure');
        } else if (/[\.\-]{2,}/.test(stats.raw)) {
          score += 3; forEv.push('Dots and dashes present — possible Morse or Fractionated Morse');
        } else {
          score -= 5; againstEv.push('No dot/dash pattern — not standard Morse code');
        }
        break;

      case 'numeric':
        if (charset === 'numeric') {
          score += 8; forEv.push('Ciphertext is predominantly digits — book cipher, codebook, or numeric substitution');
        } else {
          var numTokens = (stats.raw.match(/\b\d+\b/g) || []).length;
          var allTokens = (stats.raw.match(/\S+/g) || []).length;
          var numRatio = numTokens / (allTokens || 1);
          if (numRatio > 0.60) { score += 5; forEv.push(Math.round(numRatio * 100) + '% of tokens are numbers'); }
          else if (numRatio > 0.30) { score += 2; forEv.push(Math.round(numRatio * 100) + '% of tokens are numbers'); }
          else { score -= 4; againstEv.push('Insufficient numeric tokens for a book / numeric cipher'); }
        }
        break;

      case 'otp':
        if (ioc >= 0.034 && ioc <= 0.044) {
          score += 5; forEv.push('IoC ' + ioc.toFixed(4) + ' ≈ 0.038 — statistically indistinguishable from random; consistent with OTP or very long Vigenère key');
        } else if (ioc > 0.044 && ioc <= 0.054) {
          score += 2; forEv.push('IoC ' + ioc.toFixed(4) + ' approaching random — could be a very long key cipher');
        } else if (ioc > 0.060) {
          score -= 3; againstEv.push('IoC ' + ioc.toFixed(4) + ' — OTP output should approach random (~0.038)');
        }
        if (chi0 > 280) { score += 2; forEv.push('Very high chi-square (' + chi0.toFixed(1) + ') — no usable alphabetical ordering'); }
        if (kasiski.length === 0 || kasiski[0].count <= 2) {
          score += 1; forEv.push('No significant repeated trigrams — consistent with a unique random key');
        } else {
          againstEv.push('Repeated trigrams found — genuine OTP produces none');
        }
        if (charset === 'alpha' && dg.district >= 24) { score += 1; forEv.push('All 26 letters used — full-alphabet random distribution'); }
        break;

      case 'bifid':
        if (ioc >= 0.044 && ioc <= 0.062) {
          score += 2; forEv.push('IoC ' + ioc.toFixed(4) + ' — fractionated ciphers partially flatten letter frequencies');
        }
        if (dg.district === 25) {
          score += 2; forEv.push('Exactly 25 distinct letters — Polybius square merges I and J (Bifid family)');
        } else if (dg.district >= 23 && dg.district <= 25) {
          score += 1; forEv.push(dg.district + ' distinct letters — close to 25-letter Polybius constraint');
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters only'); }
        if (n >= 40) { score += 1; forEv.push(n + ' characters — sufficient for fractionated cipher detection'); }
        if (ioc > 0.065) { score -= 1; againstEv.push('IoC too high for a fractionated cipher'); }
        break;
    }

    return { score: Math.max(score, 0), forEv: forEv, againstEv: againstEv };
  }

  /* ─────────────────────── Main entry point ───────────────────── */

  function analyse(text) {
    if (!text || text.trim().length === 0) {
      return { stats: null, candidates: [] };
    }

    var letters = extractLetters(text);
    var n = letters.length;
    var ioc = calcIoC(letters);
    var chi0 = chiSquareAtShift(letters, 0);
    var bsr = bestShift(letters);
    var kasiski = kasiskiTest(letters);
    var charset = detectCharset(text);
    var dg = digraphAnalysis(letters);
    var counts = freqCounts(letters);

    // Estimate key period for display
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
    if (!periodHint && ioc >= 0.038 && ioc <= 0.063) {
      var bestP = null, bestPIoC = ioc + 0.008;
      for (var p = 2; p <= 15; p++) {
        var pioc = periodIoC(letters, p);
        if (pioc > bestPIoC) { bestPIoC = pioc; bestP = p; }
      }
      if (bestP) periodHint = bestP;
    }

    var stats = {
      raw: text, letters: letters, n: n,
      ioc: ioc, chi0: chi0,
      bestShiftResult: bsr,
      kasiski: kasiski,
      charset: charset,
      dg: dg,
      counts: counts,
      periodHint: periodHint
    };

    var FAMILIES = [
      { id: 'caesar',        name: 'Caesar / Simple Shift',                url: 'ciphers/caesar.html' },
      { id: 'simple-sub',    name: 'Monoalphabetic Substitution',           url: 'ciphers/monoalphabetic.html' },
      { id: 'vigenere',      name: 'Vigenère / Polyalphabetic',             url: 'ciphers/vigenere.html' },
      { id: 'transposition', name: 'Transposition (Columnar / Rail-Fence)', url: 'ciphers/columnar.html' },
      { id: 'playfair',      name: 'Playfair Digraphic Cipher',             url: 'ciphers/playfair.html' },
      { id: 'adfgvx',        name: 'ADFGVX Fractionated (WWI German)',      url: 'ciphers/adfgvx.html' },
      { id: 'morse',         name: 'Morse Code',                            url: 'ciphers/morse.html' },
      { id: 'numeric',       name: 'Book Cipher / Numeric Code',            url: 'ciphers/book-cipher.html' },
      { id: 'otp',           name: 'One-Time Pad / Random Noise',           url: 'ciphers/otp.html' },
      { id: 'bifid',         name: 'Bifid / Polybius Fractionated',         url: 'ciphers/bifid.html' }
    ];

    var results = FAMILIES.map(function (f) {
      var scored = scoreFamily(f.id, stats);
      return { id: f.id, name: f.name, url: f.url,
               score: scored.score, forEv: scored.forEv, againstEv: scored.againstEv };
    });

    results.sort(function (a, b) { return b.score - a.score; });

    var maxScore = Math.max(results[0].score, 1);
    results.forEach(function (r) {
      r.confidence = Math.min(100, Math.round((r.score / maxScore) * 100));
    });

    return {
      stats: {
        n: n, ioc: ioc, chi0: chi0,
        charset: charset,
        kasiski: kasiski,
        district: dg.district,
        isEvenLen: dg.isEvenLen,
        bestShift: bsr.shift,
        bestShiftChi: bsr.chi,
        periodHint: periodHint,
        counts: counts
      },
      candidates: results.slice(0, 5)
    };
  }

  /* ─────────────────────── Export ─────────────────────────────── */
  global.CipherDetective = {
    analyse: analyse,
    /* Expose helpers for testing */
    _calcIoC: calcIoC,
    _chiSquareAtShift: chiSquareAtShift,
    _kasiskiTest: kasiskiTest,
    _detectCharset: detectCharset,
    _periodIoC: periodIoC
  };

})(typeof window !== 'undefined' ? window : global);
