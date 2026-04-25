/* ================================================================
   THE CIPHER MUSEUM — Detective Attacks v2.0

   window.DetectiveAttacks — seven inline attack tools

   All functions are pure (no DOM). Results are plain objects.
   The browser-side click handlers in detective.js call these and
   pass the result to renderAttackResult() in render.js.

   Tools:
     caesarBruteForce(ct)         — top-5 shifts by chi-square
     rot13(ct)                    — ROT13 decode
     atbash(ct)                   — Atbash decode
     decodeMorse(text)            — International Morse decode
     decodeEncoding(text)         — Base64 / Hex / Binary auto-detect
     vigKeyLength(ct, maxKey=15)  — Kasiski + period-IoC key-length candidates
     substFreqSuggestions(ct)     — top-6 cipher→plain frequency guesses
     isApplicable(toolId, stats)  — {ok, reason} gate for button state
   ================================================================ */
'use strict';

(function (global) {

  /* ─── International Morse Code table ────────────────────────── */
  var MORSE_ENC = {
    'A':'.-',   'B':'-...', 'C':'-.-.', 'D':'-..', 'E':'.',
    'F':'..-.', 'G':'--.',  'H':'....', 'I':'..',  'J':'.---',
    'K':'-.-',  'L':'.-..', 'M':'--',   'N':'-.',  'O':'---',
    'P':'.--.', 'Q':'--.-', 'R':'.-.',  'S':'...', 'T':'-',
    'U':'..-',  'V':'...-', 'W':'.--',  'X':'-..-','Y':'-.--',
    'Z':'--..',
    '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
    '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
    '.':'.-.-.-',',':'--..--','?':'..--..',
    '!':'-.-.--','/':'-..-.','=':'-...-',
    '@':'.--.-.','&':'.-...','\"':'.-..-.','\'':'.----.'
  };

  /* Reverse lookup: morse sequence → character */
  var MORSE_DEC = (function () {
    var rev = {};
    var keys = Object.keys(MORSE_ENC);
    for (var i = 0; i < keys.length; i++) rev[MORSE_ENC[keys[i]]] = keys[i];
    return rev;
  }());

  /* English frequency order for substitution mapping */
  var ETAOIN = ['E','T','A','O','I','N','S','H','R','D','L','C','U','M','W','F','G','Y','P','B','V','K','J','X','Q','Z'];

  /* ─── Helpers ────────────────────────────────────────────────── */
  function extractLetters(t) {
    return t.toUpperCase().replace(/[^A-Z]/g, '');
  }

  /* Re-inject spaces from original ciphertext into a letter-only decrypted string. */
  function respacedDecrypt(ct, decLetters) {
    var out = '', li = 0;
    var upper = ct.toUpperCase();
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

  /* ─── Caesar Brute-Force ──────────────────────────────────────
     Returns top-5 shifts sorted by chi-square ascending
     (lower chi-square = closer to English distribution).
     Uses DetectiveAnalyses._chiSquareAtShift which is already
     exposed for testing. */
  function caesarBruteForce(ct) {
    var letters = extractLetters(ct);
    if (letters.length === 0) return [];

    var candidates = [];
    for (var shift = 1; shift < 26; shift++) {
      /* _chiSquareAtShift(letters, shift) measures fit of the
         ciphertext distribution shifted back by `shift` against
         expected English frequencies. */
      var chi = global.DetectiveAnalyses._chiSquareAtShift(letters, shift);

      /* Decrypt: shift each letter back */
      var decLetters = '';
      for (var i = 0; i < letters.length; i++) {
        decLetters += String.fromCharCode(((letters.charCodeAt(i) - 65 - shift + 26) % 26) + 65);
      }

      candidates.push({
        shift:     shift,
        decrypted: respacedDecrypt(ct, decLetters),
        chi:       chi
      });
    }

    candidates.sort(function (a, b) { return a.chi - b.chi; });
    return candidates.slice(0, 5);
  }

  /* ─── ROT13 ───────────────────────────────────────────────────
     Caesar shift 13 — self-inverse. */
  function rot13(ct) {
    var letters = extractLetters(ct);
    var decLetters = '';
    for (var i = 0; i < letters.length; i++) {
      decLetters += String.fromCharCode(((letters.charCodeAt(i) - 65 + 13) % 26) + 65);
    }
    return { decrypted: respacedDecrypt(ct, decLetters) };
  }

  /* ─── Atbash ──────────────────────────────────────────────────
     Reverse alphabet: A↔Z, B↔Y … self-inverse. */
  function atbash(ct) {
    var letters = extractLetters(ct);
    var decLetters = '';
    for (var i = 0; i < letters.length; i++) {
      decLetters += String.fromCharCode(25 - (letters.charCodeAt(i) - 65) + 65);
    }
    return { decrypted: respacedDecrypt(ct, decLetters) };
  }

  /* ─── Morse Decoder ───────────────────────────────────────────
     Word boundaries: ' / '   Letter boundaries: ' '
     Returns { valid, decrypted } or { valid: false, error, decrypted }. */
  function decodeMorse(text) {
    var t = text.trim();
    if (!t) return { valid: false, error: 'Empty input' };

    var words = t.split(/\s*\/\s*/);
    var result = [];
    var unknownSeqs = [];

    for (var wi = 0; wi < words.length; wi++) {
      var word = words[wi].trim();
      if (!word) continue;
      var syms = word.split(/\s+/);
      var decoded = '';
      for (var si = 0; si < syms.length; si++) {
        var sym = syms[si];
        if (!sym) continue;
        var ch = MORSE_DEC[sym];
        if (ch === undefined) {
          unknownSeqs.push(sym);
          decoded += '?';
        } else {
          decoded += ch;
        }
      }
      result.push(decoded);
    }

    var decrypted = result.join(' ');
    if (unknownSeqs.length > 0) {
      return {
        valid: false,
        error: 'Unrecognised Morse sequences: ' + unknownSeqs.join(', '),
        decrypted: decrypted
      };
    }
    return { valid: true, decrypted: decrypted };
  }

  /* ─── Encoding Detector ───────────────────────────────────────
     Auto-detects Binary (8-bit), Hexadecimal, or Base64.
     Returns { valid, type, decrypted } or { valid: false }. */
  function decodeEncoding(text) {
    var t = text.trim().replace(/\s+/g, '');
    if (!t) return { valid: false };

    /* Binary: groups of 8 bits (0 and 1 only) */
    if (/^[01]+$/.test(t) && t.length % 8 === 0 && t.length >= 8) {
      try {
        var binResult = '';
        for (var bi = 0; bi < t.length; bi += 8) {
          binResult += String.fromCharCode(parseInt(t.slice(bi, bi + 8), 2));
        }
        if (/[\x20-\x7e]/.test(binResult)) {        /* printable ASCII sanity check */
          return { valid: true, type: 'Binary (8-bit)', decrypted: binResult };
        }
      } catch (e) { /* fall through */ }
    }

    /* Hexadecimal: even-length string of hex digits */
    if (/^[0-9a-fA-F]+$/.test(t) && t.length % 2 === 0 && t.length >= 4) {
      try {
        var hexResult = '';
        for (var hi = 0; hi < t.length; hi += 2) {
          hexResult += String.fromCharCode(parseInt(t.slice(hi, hi + 2), 16));
        }
        if (/[\x20-\x7e]/.test(hexResult)) {
          return { valid: true, type: 'Hexadecimal', decrypted: hexResult };
        }
      } catch (e) { /* fall through */ }
    }

    /* Base64: standard alphabet + optional padding */
    if (/^[A-Za-z0-9+/]+=*$/.test(t) && t.length % 4 === 0 && t.length >= 4) {
      try {
        var b64Result;
        if (typeof atob !== 'undefined') {
          b64Result = atob(t);
        } else if (typeof Buffer !== 'undefined') {
          b64Result = Buffer.from(t, 'base64').toString('utf8');
        }
        if (b64Result !== undefined && /[\x20-\x7e]/.test(b64Result)) {
          return { valid: true, type: 'Base64', decrypted: b64Result };
        }
      } catch (e) { /* fall through */ }
    }

    return { valid: false };
  }

  /* ─── Vigenère Key-Length Estimator ──────────────────────────
     Combines Kasiski examination and period-IoC to propose
     the top-3 most likely key lengths.
     Returns { candidates: [{length, pIoC, score, methods}] }. */
  function vigKeyLength(ct, maxKey) {
    maxKey = (maxKey !== undefined) ? maxKey : 15;
    var letters = extractLetters(ct);
    if (letters.length < 30) return { candidates: [] };

    var kasiski = global.DetectiveAnalyses._kasiskiTest(letters);

    /* Build a set of Kasiski-supported periods for fast lookup */
    var kasiskiSet = {};
    for (var ki = 0; ki < kasiski.length; ki++) {
      kasiskiSet[kasiski[ki].period] = kasiski[ki].count;
    }

    var candidates = [];
    for (var p = 2; p <= maxKey; p++) {
      var pIoC   = global.DetectiveAnalyses._periodIoC(letters, p);
      var methods = [];
      if (pIoC > 0.053) methods.push('Period-IoC');
      if (kasiskiSet[p]) methods.push('Kasiski (' + kasiskiSet[p] + ' repeat' + (kasiskiSet[p] > 1 ? 's' : '') + ')');
      /* Combined score: pIoC plus a Kasiski bonus */
      var score = pIoC + (kasiskiSet[p] ? 0.005 * kasiskiSet[p] : 0);
      candidates.push({ length: p, pIoC: pIoC, score: score, methods: methods });
    }

    candidates.sort(function (a, b) { return b.score - a.score; });
    return { candidates: candidates.slice(0, 3) };
  }

  /* ─── Substitution Frequency Suggestions ─────────────────────
     Maps the top-6 most frequent ciphertext letters to the
     corresponding positions in ETAOIN order as starting hypotheses.
     Returns { mapping: [{cipher, plain, count, pct}], note }. */
  function substFreqSuggestions(ct) {
    var letters = extractLetters(ct);
    if (letters.length === 0) return { mapping: [], note: 'No letters found.' };

    var counts = global.DetectiveAnalyses._freqCounts(letters);
    var n = letters.length;

    var sorted = Object.keys(counts).map(function (k) {
      return { cipher: k, count: counts[k], pct: (counts[k] / n) * 100 };
    }).filter(function (x) { return x.count > 0; });
    sorted.sort(function (a, b) { return b.count - a.count; });

    var top6 = sorted.slice(0, 6);
    var mapping = top6.map(function (item, idx) {
      return {
        cipher: item.cipher,
        plain:  ETAOIN[idx] || '?',
        count:  item.count,
        pct:    item.pct
      };
    });

    return {
      mapping: mapping,
      note: 'If this is monoalphabetic substitution, the most frequent ciphertext letter ' +
            'likely encodes ' + (mapping[0] ? mapping[0].plain : 'E') +
            ', the second likely ' + (mapping[1] ? mapping[1].plain : 'T') +
            ', and so on. These are starting hypotheses only — verify with context.'
    };
  }

  /* ─── isApplicable ────────────────────────────────────────────
     Returns { ok: true } if the named tool makes sense for the
     given stats object, or { ok: false, reason: string } if not.
     Used to disable/grey-out inapplicable attack buttons. */
  function isApplicable(toolId, stats) {
    if (!stats) return { ok: false, reason: 'No analysis data yet.' };
    var cs  = stats.charset;
    var n   = stats.n;
    var ioc = stats.ioc;

    switch (toolId) {
      case 'caesar':
        if (cs !== 'alpha') return { ok: false, reason: 'Caesar requires alphabetic-only text (detected: ' + cs + ').' };
        if (n < 8)          return { ok: false, reason: 'Too short for meaningful brute-force (need 8+ letters).' };
        return { ok: true };

      case 'rot13':
        if (cs !== 'alpha') return { ok: false, reason: 'ROT13 requires alphabetic-only text.' };
        return { ok: true };

      case 'atbash':
        if (cs !== 'alpha') return { ok: false, reason: 'Atbash requires alphabetic-only text.' };
        return { ok: true };

      case 'morse':
        if (cs !== 'morse') return { ok: false, reason: 'Input does not look like Morse code. Morse uses only . - / and spaces.' };
        return { ok: true };

      case 'encoding':
        /* Always show — auto-detection will report if nothing matches */
        return { ok: true };

      case 'vigKeyLength':
        if (cs !== 'alpha') return { ok: false, reason: 'Vigenère key-length analysis requires alphabetic text.' };
        if (n < 50)         return { ok: false, reason: 'Need at least 50 letters for reliable key-length estimation.' };
        if (ioc > 0.063)    return { ok: false, reason: 'IoC is high — text looks monoalphabetic, not polyalphabetic.' };
        return { ok: true };

      case 'substFreq':
        if (cs !== 'alpha') return { ok: false, reason: 'Substitution frequency analysis requires alphabetic text.' };
        if (n < 30)         return { ok: false, reason: 'Too short for reliable frequency analysis (need 30+ letters).' };
        return { ok: true };

      default:
        return { ok: false, reason: 'Unknown tool: ' + toolId };
    }
  }

  /* ─── Export ─────────────────────────────────────────────────── */
  global.DetectiveAttacks = {
    caesarBruteForce:     caesarBruteForce,
    rot13:                rot13,
    atbash:               atbash,
    decodeMorse:          decodeMorse,
    decodeEncoding:       decodeEncoding,
    vigKeyLength:         vigKeyLength,
    substFreqSuggestions: substFreqSuggestions,
    isApplicable:         isApplicable
  };

})(typeof window !== 'undefined' ? window : global);
