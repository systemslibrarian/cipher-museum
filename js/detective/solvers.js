/* ================================================================
   THE CIPHER MUSEUM — Detective Auto-Solvers v1.0

   window.DetectiveSolvers — automatic decryption attempts that go
   beyond the basic Attack Tools panel. Each solver does enough
   cryptanalysis to recover (or strongly hint at) the plaintext
   for a small but historically vital family of ciphers:

       solveCaesar       — best of 25 shifts, scored by language model
       solveRot13        — single transform, scored
       solveAtbash       — single transform, scored
       solveVigenere     — Kasiski/IoC key length + per-column chi-square
       solveSubstitution — hill climbing with random restarts
       solveColumnar     — exhaustive search on column count + ordering

   Top-level entry:
       solveAuto(ciphertext, opts)
         → runs the appropriate solvers given the analysis stats
           and returns a ranked list of plaintext candidates.

   All solvers depend on:
       window.DetectiveAttacks      (basic transforms)
       window.DetectiveAnalyses     (IoC, chi-square, period-IoC)
       window.DetectiveLangModel    (English fitness scoring)

   Performance budget per solver call: roughly 1-3 seconds in a
   modern browser. Heavy loops are bounded so the page stays
   responsive even on phones.
   ================================================================ */
'use strict';

(function (global) {

  var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /* ─── Helpers ─────────────────────────────────────────────────── */
  function lettersOnly(t) {
    return (t || '').toUpperCase().replace(/[^A-Z]/g, '');
  }

  /* Re-inject spaces / punctuation from the original ciphertext into
     a letter-only decrypted string so the user sees readable output. */
  function respace(ct, decLetters) {
    var out = '', li = 0;
    var upper = (ct || '').toUpperCase();
    for (var i = 0; i < upper.length; i++) {
      var ch = upper[i];
      if (ch >= 'A' && ch <= 'Z') {
        out += (li < decLetters.length) ? decLetters[li++] : ch;
      } else {
        out += ch;
      }
    }
    return out;
  }

  function score(text) {
    var letters = lettersOnly(text);
    var f = global.DetectiveLangModel.fitness(text);
    var perChar = letters.length > 0 ? f / letters.length : -Infinity;
    var conf = global.DetectiveLangModel.confidenceLabel(f, letters.length);
    return { fitness: f, perChar: perChar, confidence: conf, length: letters.length };
  }

  function makeResult(method, key, plaintext, extra) {
    var s = score(plaintext);
    var r = {
      method:     method,
      key:        key,
      plaintext:  plaintext,
      fitness:    s.fitness,
      perChar:    s.perChar,
      confidence: s.confidence
    };
    if (extra) for (var k in extra) if (extra.hasOwnProperty(k)) r[k] = extra[k];
    return r;
  }

  /* ─── Caesar ──────────────────────────────────────────────────── */
  function solveCaesar(ct) {
    var letters = lettersOnly(ct);
    if (letters.length < 4) return null;

    var best = null;
    for (var shift = 0; shift < 26; shift++) {
      var dec = '';
      for (var i = 0; i < letters.length; i++) {
        dec += ALPHA[((letters.charCodeAt(i) - 65 - shift + 26) % 26)];
      }
      var pt = respace(ct, dec);
      var f  = global.DetectiveLangModel.fitness(pt);
      if (!best || f > best._f) best = { _f: f, shift: shift, plaintext: pt };
    }
    return makeResult('Caesar', 'shift = ' + best.shift, best.plaintext, { shift: best.shift });
  }

  function solveRot13(ct) {
    var dec = global.DetectiveAttacks.rot13(ct).decrypted;
    return makeResult('ROT13', '(self-inverse)', dec);
  }

  function solveAtbash(ct) {
    var dec = global.DetectiveAttacks.atbash(ct).decrypted;
    return makeResult('Atbash', '(reverse alphabet)', dec);
  }

  /* ─── Vigenère ─────────────────────────────────────────────────
     Step 1: pick best key length using existing Kasiski + period-IoC.
     Step 2: for each key-length candidate, recover each key letter
             by chi-square against English on its own column.
     Step 3: decrypt with the recovered key, score, keep best.       */
  function solveVigenere(ct) {
    var letters = lettersOnly(ct);
    if (letters.length < 30) return null;

    /* Try several plausible key lengths and keep the winner. */
    var lenCandidates = [];
    var kl = global.DetectiveAttacks.vigKeyLength(ct, 16);
    if (kl && kl.candidates && kl.candidates.length) {
      for (var i = 0; i < kl.candidates.length; i++) {
        lenCandidates.push(kl.candidates[i].length);
      }
    }
    /* Always include a few small lengths as a safety net. */
    [2,3,4,5,6,7,8].forEach(function (L) {
      if (lenCandidates.indexOf(L) === -1) lenCandidates.push(L);
    });

    var best = null;
    for (var li = 0; li < lenCandidates.length; li++) {
      var L = lenCandidates[li];
      if (L < 2 || L > 16) continue;
      /* Need at least ~8 letters per column for chi-square to be reliable.
         If the ciphertext is too short, skip this length entirely so we
         don't overfit and steal credit from a simpler cipher. */
      if (letters.length / L < 8) continue;

      /* Recover each key letter by chi-square on its column. */
      var key = '';
      for (var col = 0; col < L; col++) {
        var colStr = '';
        for (var p = col; p < letters.length; p += L) colStr += letters[p];
        if (colStr.length < 2) { key += 'A'; continue; }

        var bestShift = 0, bestChi = Infinity;
        for (var s = 0; s < 26; s++) {
          var chi = global.DetectiveAnalyses._chiSquareAtShift(colStr, s);
          if (chi < bestChi) { bestChi = chi; bestShift = s; }
        }
        key += ALPHA[bestShift];
      }

      /* Decrypt with recovered key. */
      function decryptWithKey(kStr) {
        var d = '';
        for (var j = 0; j < letters.length; j++) {
          var ks2 = kStr.charCodeAt(j % L) - 65;
          d += ALPHA[((letters.charCodeAt(j) - 65 - ks2 + 26) % 26)];
        }
        return d;
      }
      var dec = decryptWithKey(key);
      var pt  = respace(ct, dec);
      var f   = global.DetectiveLangModel.fitness(pt);

      /* Polish: chi-square can pick the wrong column shift by ±1
         when the column is short. Walk through each key letter and
         try alternative shifts, accepting any improvement under the
         full-text language model. Two passes is enough in practice. */
      for (var pass = 0; pass < 2; pass++) {
        for (var pi = 0; pi < L; pi++) {
          for (var altShift = 0; altShift < 26; altShift++) {
            var altKey = key.substr(0, pi) + ALPHA[altShift] + key.substr(pi + 1);
            if (altKey === key) continue;
            var altDec = decryptWithKey(altKey);
            var altPt  = respace(ct, altDec);
            var altF   = global.DetectiveLangModel.fitness(altPt);
            if (altF > f) { key = altKey; dec = altDec; pt = altPt; f = altF; }
          }
        }
      }

      if (!best || f > best._f) best = { _f: f, key: key, length: L, plaintext: pt };
    }

    if (!best) return null;
    return makeResult('Vigenère', best.key + '  (length ' + best.length + ')',
                      best.plaintext, { keyLength: best.length, keyword: best.key });
  }

  /* ─── Monoalphabetic Substitution ─────────────────────────────
     Hill climbing with random restarts. Each "key" is a 26-char
     string mapping ciphertext A..Z to plaintext letters. We start
     from a frequency-aligned seed (most common cipher letter →
     ETAOIN order), then repeatedly swap two output letters,
     keeping any swap that improves the language fitness.

     Bounded to ~5 restarts × ~2000 iterations to stay snappy.    */
  function solveSubstitution(ct) {
    var letters = lettersOnly(ct);
    if (letters.length < 30) return null;

    /* Pre-encode ciphertext as numeric indices for speed.
       We also keep a template that mirrors the original ciphertext
       with placeholders for letters and the literal characters for
       spaces/punctuation, so the language model can use word
       boundaries for its word-bonus heuristic. */
    var ctUpper = (ct || '').toUpperCase();
    var ctIdx = new Array(letters.length);
    var template = '';      /* same length as ctUpper; '\0' marks letter slot */
    var slotPositions = []; /* indices into template where letters go */
    var li = 0;
    for (var ti = 0; ti < ctUpper.length; ti++) {
      var ch0 = ctUpper.charCodeAt(ti);
      if (ch0 >= 65 && ch0 <= 90) {
        ctIdx[li] = ch0 - 65;
        template += '\0';
        slotPositions.push(ti);
        li++;
      } else {
        template += ctUpper[ti];
      }
    }
    var templateArr = template.split('');

    /* Frequency-aligned seed key. */
    var counts = new Array(26);
    for (var c = 0; c < 26; c++) counts[c] = { idx: c, n: 0 };
    for (var k = 0; k < ctIdx.length; k++) counts[ctIdx[k]].n++;
    counts.sort(function (a, b) { return b.n - a.n; });
    var ETAOIN = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';

    /* seedKey[ciphertextIndex] = plaintextLetter */
    var seedKey = new Array(26);
    for (var ci = 0; ci < 26; ci++) seedKey[counts[ci].idx] = ETAOIN[ci];

    function decryptWith(key) {
      /* Builds the FULLY-RESPACED plaintext so the language model's
         word-bonus heuristic can act on real word boundaries. */
      var out = templateArr.slice();
      for (var p = 0; p < ctIdx.length; p++) out[slotPositions[p]] = key[ctIdx[p]];
      return out.join('');
    }

    var bestOverall = null;
    var RESTARTS = 25;
    var ITER_CAP = 3000;

    for (var r = 0; r < RESTARTS; r++) {
      /* Restart 0 uses pure ETAOIN seed; later restarts are fully
         random Fisher-Yates shuffles to escape the seed's basin
         of attraction when it traps us. */
      var key;
      if (r === 0) {
        key = seedKey.slice();
      } else {
        /* Fully random shuffle of the alphabet. */
        key = ALPHA.split('');
        for (var fy = 25; fy > 0; fy--) {
          var jj = (Math.random() * (fy + 1)) | 0;
          var tt = key[fy]; key[fy] = key[jj]; key[jj] = tt;
        }
      }

      /* Track best ever for this restart, plus current working state.
         Pure greedy: always revert losing swaps, never explore worse. */
      var pt   = decryptWith(key);
      var curF = global.DetectiveLangModel.fitness(pt);
      var stagnation = 0;

      for (var it = 0; it < ITER_CAP && stagnation < 400; it++) {
        var a = (Math.random() * 26) | 0;
        var b = (Math.random() * 26) | 0;
        if (a === b) continue;
        var t = key[a]; key[a] = key[b]; key[b] = t;
        var newPt = decryptWith(key);
        var newF  = global.DetectiveLangModel.fitness(newPt);
        if (newF > curF) {
          curF = newF;
          pt   = newPt;
          stagnation = 0;
        } else {
          /* revert */
          var t2 = key[a]; key[a] = key[b]; key[b] = t2;
          stagnation++;
        }
      }

      if (!bestOverall || curF > bestOverall._f) {
        bestOverall = { _f: curF, key: key.slice(), plaintext: pt };
      }
    }

    /* Final exhaustive single-swap polish on the global best. */
    var polishKey = bestOverall.key.slice();
    var polishPt  = bestOverall.plaintext;
    var polishF   = bestOverall._f;
    var improved = true;
    var safety = 0;
    while (improved && safety < 5) {
      improved = false; safety++;
      for (var aa2 = 0; aa2 < 26; aa2++) {
        for (var bb2 = aa2 + 1; bb2 < 26; bb2++) {
          var t3 = polishKey[aa2]; polishKey[aa2] = polishKey[bb2]; polishKey[bb2] = t3;
          var trial = decryptWith(polishKey);
          var trialF = global.DetectiveLangModel.fitness(trial);
          if (trialF > polishF) {
            polishF = trialF; polishPt = trial; improved = true;
          } else {
            var t4 = polishKey[aa2]; polishKey[aa2] = polishKey[bb2]; polishKey[bb2] = t4;
          }
        }
      }
    }
    bestOverall = { _f: polishF, key: polishKey, plaintext: polishPt };

    /* Build a human-readable key string: A→?, B→?, ... */
    var keyStr = '';
    for (var ki = 0; ki < 26; ki++) {
      keyStr += ALPHA[ki] + '\u2192' + bestOverall.key[ki] + (ki < 25 ? ' ' : '');
    }

    return makeResult('Simple Substitution', keyStr, bestOverall.plaintext,
                      { keyMap: bestOverall.key.join('') });
  }

  /* ─── Columnar Transposition ──────────────────────────────────
     For each plausible column count k (2..10):
       - Lay out ciphertext into k columns of equal-ish height.
       - For k ≤ 7, exhaustively try all k! column orderings.
       - For 8 ≤ k ≤ 10, hill climb on the column ordering.
     Score every reading with the English language model and
     keep the strongest.                                          */
  function solveColumnar(ct) {
    var letters = lettersOnly(ct);
    if (letters.length < 20) return null;

    var bestOverall = null;

    /* Standard columnar transposition is keyed by a column ORDER.
       Plaintext is written row-by-row into a k-wide grid with rows
       = ceil(n/k); the LONG columns (those that have one extra letter)
       are the original column indices [0 .. n mod k - 1]. The cipher-
       text is produced by reading columns in `order` and concatenating
       them. So decryption depends on the candidate order: for each
       position c in the order, the chunk length is `rows` if order[c]
       is a long column, else `rows-1`. */
    function decryptWithOrder(text, order) {
      var n        = text.length;
      var k        = order.length;
      var rows     = Math.ceil(n / k);
      var longCols = n - (rows - 1) * k;          /* count of original cols with `rows` letters */

      /* Build per-original-column data. */
      var cols = new Array(k);
      var idx  = 0;
      for (var c = 0; c < k; c++) {
        var origCol = order[c];
        var h = (origCol < longCols) ? rows : (rows - 1);
        cols[origCol] = text.substr(idx, h);
        idx += h;
      }

      var out = '';
      for (var r = 0; r < rows; r++) {
        for (var oc = 0; oc < k; oc++) {
          if (r < cols[oc].length) out += cols[oc][r];
        }
      }
      return out;
    }

    function permute(arr) {
      var results = [];
      function helper(curr, remaining) {
        if (remaining.length === 0) { results.push(curr); return; }
        for (var i = 0; i < remaining.length; i++) {
          var nextRem = remaining.slice(0, i).concat(remaining.slice(i + 1));
          helper(curr.concat([remaining[i]]), nextRem);
        }
      }
      helper([], arr);
      return results;
    }

    for (var k = 2; k <= 10; k++) {
      if (k > letters.length) break;
      var bestForK = null;

      if (k <= 7) {
        /* Exhaustive: 5040 permutations max. */
        var idxs = [];
        for (var ii = 0; ii < k; ii++) idxs.push(ii);
        var perms = permute(idxs);
        for (var pi = 0; pi < perms.length; pi++) {
          var dec = decryptWithOrder(letters, perms[pi]);
          var f   = global.DetectiveLangModel.fitness(dec);
          if (!bestForK || f > bestForK._f) {
            bestForK = { _f: f, order: perms[pi].slice(), plaintext: dec };
          }
        }
      } else {
        /* Hill climb: start from identity, swap two columns each step. */
        var order = [];
        for (var oi = 0; oi < k; oi++) order.push(oi);
        var dec0 = decryptWithOrder(letters, order);
        var bestF = global.DetectiveLangModel.fitness(dec0);
        var bestOrder = order.slice();
        var bestPlain = dec0;
        var stag = 0;
        for (var it = 0; it < 3000 && stag < 500; it++) {
          var a = (Math.random() * k) | 0;
          var b = (Math.random() * k) | 0;
          if (a === b) continue;
          var tmp = order[a]; order[a] = order[b]; order[b] = tmp;
          var newDec = decryptWithOrder(letters, order);
          var newF   = global.DetectiveLangModel.fitness(newDec);
          if (newF > bestF) {
            bestF = newF; bestOrder = order.slice(); bestPlain = newDec;
            stag = 0;
          } else {
            var t2 = order[a]; order[a] = order[b]; order[b] = t2;
            stag++;
          }
        }
        bestForK = { _f: bestF, order: bestOrder, plaintext: bestPlain };
      }

      if (bestForK && (!bestOverall || bestForK._f > bestOverall._f)) {
        bestOverall = { _f: bestForK._f, k: k, order: bestForK.order, plaintext: bestForK.plaintext };
      }
    }

    if (!bestOverall) return null;
    var keyStr = bestOverall.k + ' columns, read order: ' + bestOverall.order.map(function (n) { return n + 1; }).join('-');
    return makeResult('Columnar Transposition', keyStr,
                      respace(ct, bestOverall.plaintext),
                      { columns: bestOverall.k, order: bestOverall.order });
  }

  /* ─── Top-level dispatcher ────────────────────────────────────
     Decides which solvers to run based on the analysis stats and
     ranked suspects, executes them, and returns a sorted attempt
     list.                                                        */
  function solveAuto(ciphertext, opts) {
    opts = opts || {};
    var stats = opts.stats || (global.DetectiveAnalyses ?
                global.DetectiveAnalyses.run(ciphertext) : null);
    var ranked = opts.ranked || (stats && global.DetectiveScoring ?
                global.DetectiveScoring.rank(stats) : null);

    var attempts = [];
    var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    /* Skip everything if the input isn't alphabetic enough. */
    if (!stats || stats.charset !== 'alpha' || stats.n < 4) {
      return {
        ranOn:    stats ? stats.charset : 'unknown',
        attempts: [],
        best:     null,
        runtimeMs: 0,
        skipped:  'Auto-Solve runs on alphabetic ciphertext (≥ 4 letters).'
      };
    }

    /* Always cheap to try: Caesar, ROT13, Atbash. */
    safePush(attempts, function () { return solveCaesar(ciphertext); });
    safePush(attempts, function () { return solveRot13(ciphertext); });
    safePush(attempts, function () { return solveAtbash(ciphertext); });

    /* Polyalphabetic? Try Vigenère. */
    if (stats.n >= 30 && stats.ioc < 0.063) {
      safePush(attempts, function () { return solveVigenere(ciphertext); });
    }

    /* Substitution-like (low chi-square already, or IoC near monoalpha)?
       Hill-climb anyway when we have enough letters — it's bounded. */
    if (stats.n >= 50) {
      safePush(attempts, function () { return solveSubstitution(ciphertext); });
    }

    /* Transposition signal: IoC near English (~0.067) is a hint that
       the underlying letter distribution is unchanged. Or always try
       if the user explicitly asked. */
    if (stats.n >= 20 && (stats.ioc > 0.060 || opts.includeAll)) {
      safePush(attempts, function () { return solveColumnar(ciphertext); });
    }

    var t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    attempts.sort(function (a, b) { return b.fitness - a.fitness; });

    return {
      ranOn:     stats.charset,
      attempts:  attempts,
      best:      attempts[0] || null,
      runtimeMs: Math.round(t1 - t0)
    };
  }

  function safePush(arr, fn) {
    try {
      var r = fn();
      if (r) arr.push(r);
    } catch (e) {
      /* never let one solver break the whole run */
      if (typeof console !== 'undefined' && console.warn) console.warn('[Solvers]', e);
    }
  }

  /* ─── Export ─────────────────────────────────────────────────── */
  global.DetectiveSolvers = {
    solveAuto:         solveAuto,
    solveCaesar:       solveCaesar,
    solveRot13:        solveRot13,
    solveAtbash:       solveAtbash,
    solveVigenere:     solveVigenere,
    solveSubstitution: solveSubstitution,
    solveColumnar:     solveColumnar
  };

})(typeof window !== 'undefined' ? window : global);
