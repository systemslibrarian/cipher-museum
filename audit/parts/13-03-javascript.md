# javascript appendix 3

Snapshot: `227086a353fbf8b3a91629f9a97d4eb2634bdc0a`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

## JavaScript — js/ciphers/caesar-break.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/ciphers/caesar-break.js`
- Served SHA-256: `ceb478776f374e6994e649a26fc3e7c33c34e440e93896166832075a1974e9bb`
- Readable-source SHA-256: `ceb478776f374e6994e649a26fc3e7c33c34e440e93896166832075a1974e9bb`


```javascript
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
```


## JavaScript — js/ciphers/caesar.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/ciphers/caesar.js`
- Served SHA-256: `ccb2014670c29e9aa0e2a9709afabe731ec032adf011220d4d8f84fb5acb3089`
- Readable-source SHA-256: `ccb2014670c29e9aa0e2a9709afabe731ec032adf011220d4d8f84fb5acb3089`


```javascript
/**
 * THE CIPHER MUSEUM — Caesar Cipher Engine
 * Exhibit 01 · Ancient Rome · ~58 BC
 */
'use strict';
const CaesarCipher = (() => {
  function shift(text, n, encode) {
    const s = (((encode ? n : -n) % 26) + 26) % 26;
    return text.split('').map(ch => {
      const c = ch.charCodeAt(0);
      if (c>=65&&c<=90) return String.fromCharCode(((c-65+s)%26)+65);
      if (c>=97&&c<=122) return String.fromCharCode(((c-97+s)%26)+97);
      return ch;
    }).join('');
  }
  const encode = (text, key) => shift(text, parseInt(key)||0, true);
  const decode = (text, key) => shift(text, parseInt(key)||0, false);
  const bruteForce = text => Array.from({length:25},(_,i)=>({shift:i+1,text:shift(text,i+1,false)}));
  return { encode, decode, bruteForce };
})();
```


## JavaScript — js/ciphers/els.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/ciphers/els.js`
- Served SHA-256: `ee13df6e1ceaae4bf6c34bbef8075497a2d439c757e3b03af03cb41527f4e450`
- Readable-source SHA-256: `ee13df6e1ceaae4bf6c34bbef8075497a2d439c757e3b03af03cb41527f4e450`


```javascript
/**
 * Equidistant Letter Sequence (ELS) Search
 * ----------------------------------------
 * The pattern-finding method behind the "Bible code" claims of
 * Witztum-Rips-Rosenberg (1994) and the popular book by Drosnin (1997).
 * Given a body of text and a target word, ELS slides a "skip" of size
 * d across the text and asks: starting at position p, do every d-th
 * letter spell the target?
 *
 *     skip d=5, start p=0:  T____X____Y____Z   →  reads "TXYZ"
 *
 * Under an independent-letter model, the expected number of hits is
 * the number of legal placements times the product of letter frequencies.
 * Searching more placements creates more opportunities for coincidences.
 * This classroom search illustrates that effect; it does not reproduce
 * the full WRR experiment, the McKay et al. critique, or a significance
 * test comparing natural-language texts with random controls.
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

  // Fixed rounded English letter-frequency heuristic. This is not a
  // frequency estimate measured from the visitor's selected text.
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

  function options(opts) {
    const o = opts || {};
    const positiveInteger = (value, fallback, name) => {
      const number = value === undefined ? fallback : Number(value);
      if (!Number.isSafeInteger(number) || number < 1) throw new Error(name + ' must be a positive safe integer.');
      return number;
    };
    const minSkip = positiveInteger(o.minSkip, 2, 'Minimum skip');
    return {
      minSkip,
      maxSkip: Math.max(minSkip, positiveInteger(o.maxSkip, 1000, 'Maximum skip')),
      maxResults: positiveInteger(o.maxResults, 100, 'Result limit')
    };
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
    const { minSkip, maxSkip, maxResults } = options(opts);

    const txt = normalise(text);
    const tgt = normalise(target);
    if (!txt.length || !tgt.length) return [];

    const N = txt.length;
    const L = tgt.length;
    const hits = [];

    const lastSkip = L > 1 ? Math.min(maxSkip, Math.floor((N - 1) / (L - 1))) : maxSkip;
    for (let d = minSkip; d <= lastSkip && hits.length < maxResults; d++) {
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
   * pairs is the sum of max(0, textLen - skip*(targetLength-1)).
   * Multiplying gives the expectation under this independent-letter model;
   * real prose need not follow that model. Overlapping placements do not
   * invalidate the sum of their individual expectations.
   *
   * This is the single most important number on the page: it is why
   * "the Bible predicts" any short word.
   */
  function expectedHits(textLen, target, opts) {
    const { minSkip, maxSkip } = options(opts);
    if (!Number.isSafeInteger(textLen) || textLen < 0) throw new Error('Text length must be a nonnegative safe integer.');
    const tgt = normalise(target);
    if (!tgt.length || textLen <= 0) return 0;
    let p = 1;
    for (let i = 0; i < tgt.length; i++) {
      p *= (FREQ[tgt[i]] || 0.0001);
    }
    // Count only starts whose final character is inside the text. Summing
    // this arithmetic progression is exact even for very short passages.
    const strideCount = tgt.length - 1;
    const lastSkip = strideCount ? Math.min(maxSkip, Math.floor((textLen - 1) / strideCount)) : maxSkip;
    if (lastSkip < minSkip) return 0;
    const count = lastSkip - minSkip + 1;
    const pairs = count * textLen - strideCount * count * (minSkip + lastSkip) / 2;
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
```


## JavaScript — js/ciphers/enigma-flagship.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/ciphers/enigma-flagship.js`
- Served SHA-256: `868590fa71155f9473eb14eb64a556ef07867a38d0355a91cb3c3533a9eaeef6`
- Readable-source SHA-256: `868590fa71155f9473eb14eb64a556ef07867a38d0355a91cb3c3533a9eaeef6`


```javascript
/**
 * THE CIPHER MUSEUM — Enigma Flagship Demo Controller
 * Drives the interactive Enigma machine, rotor visualisation,
 * self-encryption crib check, and brute-force rotor-order search.
 *
 * Depends on: js/ciphers/enigma.js (window.EnigmaEngine)
 */
'use strict';

(function () {
  if (!window.EnigmaEngine) {
    console.error('EnigmaEngine not loaded — flagship demo disabled.');
    return;
  }
  const E = window.EnigmaEngine;
  const $ = id => document.getElementById(id);

  // ─────────────────────────────────────────────────────────────────────────
  // PART 1: Live encryption machine
  // ─────────────────────────────────────────────────────────────────────────

  const root = $('enigma-flagship');
  if (!root) return;

  const els = {
    rotorL: $('eg-rotor-left'),
    rotorM: $('eg-rotor-mid'),
    rotorR: $('eg-rotor-right'),
    reflector: $('eg-reflector'),
    ringL: $('eg-ring-left'),
    ringM: $('eg-ring-mid'),
    ringR: $('eg-ring-right'),
    posL:  $('eg-pos-left'),
    posM:  $('eg-pos-mid'),
    posR:  $('eg-pos-right'),
    plugboard: $('eg-plugboard'),
    plaintext: $('eg-plaintext'),
    ciphertext: $('eg-ciphertext'),
    encryptBtn: $('eg-encrypt'),
    resetBtn:   $('eg-reset'),
    rotorWindowL: $('eg-window-left'),
    rotorWindowM: $('eg-window-mid'),
    rotorWindowR: $('eg-window-right'),
    pathSvg: $('eg-path-svg'),
    pathToggle: $('eg-show-path'),
    a11yLog: $('eg-a11y-log')
  };

  function readConfig() {
    return {
      rotors: [els.rotorL.value, els.rotorM.value, els.rotorR.value],
      reflector: els.reflector.value,
      ringSettings:
        (els.ringL.value || 'A') +
        (els.ringM.value || 'A') +
        (els.ringR.value || 'A'),
      positions:
        (els.posL.value || 'A') +
        (els.posM.value || 'A') +
        (els.posR.value || 'A'),
      plugboard: E.parsePlugboard(els.plugboard.value)
    };
  }

  function setRotorWindows(positions) {
    if (els.rotorWindowL) els.rotorWindowL.textContent = positions[0];
    if (els.rotorWindowM) els.rotorWindowM.textContent = positions[1];
    if (els.rotorWindowR) els.rotorWindowR.textContent = positions[2];
  }

  function announce(msg) {
    if (els.a11yLog) els.a11yLog.textContent = msg;
  }

  function runEncrypt() {
    let cfg;
    try {
      cfg = readConfig();
    } catch (e) {
      els.ciphertext.textContent = 'Configuration error: ' + e.message;
      return;
    }
    const machine = E.createEnigma(cfg);
    const text = (els.plaintext.value || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (!text) {
      els.ciphertext.innerHTML = '<span class="output-empty">Type a message above to encrypt…</span>';
      setRotorWindows(cfg.positions);
      return;
    }
    const result = machine.encryptWithTrace(text);

    // Format ciphertext in 5-letter groups (Wehrmacht convention).
    const grouped = result.ciphertext.replace(/(.{5})/g, '$1 ').trim();
    els.ciphertext.textContent = grouped;
    announce(
      'Encrypted ' + text.length + ' letters. Rotor positions advanced from ' +
      cfg.positions + ' to ' +
      result.steps[result.steps.length - 1].positions.join('') + '. ' +
      'Output: ' + grouped + '.'
    );

    // Window shows the position AFTER the last keystroke.
    const finalPositions = result.steps[result.steps.length - 1].positions
      .map(i => String.fromCharCode(65 + i)).join('');
    setRotorWindows(finalPositions);

    // Optional electrical-path visualisation for the last letter.
    if (els.pathToggle && els.pathToggle.checked && els.pathSvg) {
      drawPath(result.steps[result.steps.length - 1]);
    } else if (els.pathSvg) {
      els.pathSvg.innerHTML = '';
    }
  }

  function resetMachine() {
    els.rotorL.value = 'I'; els.rotorM.value = 'II'; els.rotorR.value = 'III';
    els.reflector.value = 'B';
    els.ringL.value = 'A'; els.ringM.value = 'A'; els.ringR.value = 'A';
    els.posL.value  = 'A'; els.posM.value  = 'A'; els.posR.value  = 'A';
    els.plugboard.value = '';
    els.plaintext.value = '';
    els.ciphertext.innerHTML = '<span class="output-empty">Output will appear here…</span>';
    setRotorWindows(['A','A','A']);
    if (els.pathSvg) els.pathSvg.innerHTML = '';
    announce('Machine reset to default Enigma I configuration: rotors I, II, III; reflector B; rings AAA; positions AAA; no plugboard.');
  }

  // SVG electrical-path drawing for the last encrypted letter.
  // Renders A-Z columns with the contact path traced in gold.
  function drawPath(step) {
    if (!step) return;
    const svg = els.pathSvg;
    const W = 600, H = 220;
    const colX = stage => 30 + stage * 80;   // 7 columns
    const rowY = idx => 14 + idx * 7.5;      // 26 rows

    // 7 stages, in order: input letter, plug-in, rotor R fwd, rotor M fwd,
    // rotor L fwd, reflector, then back through L, M, R, and plug-out.
    // To keep the diagram readable, we collapse to one column per stage
    // and trace the contact at each column.
    const stages = [
      { label: 'Key',     value: step.trace.find(s => s.stage === 'key').value },
      { label: 'Plug',    value: step.trace.find(s => s.stage === 'plug-in').value },
      { label: 'R',       value: step.trace.filter(s => s.stage === 'rotor-fwd' && s.rotor === 2).pop().value },
      { label: 'M',       value: step.trace.filter(s => s.stage === 'rotor-fwd' && s.rotor === 1).pop().value },
      { label: 'L',       value: step.trace.filter(s => s.stage === 'rotor-fwd' && s.rotor === 0).pop().value },
      { label: 'UKW',     value: step.trace.find(s => s.stage === 'reflector').value },
      { label: 'L\u2032', value: step.trace.filter(s => s.stage === 'rotor-rev' && s.rotor === 0).pop().value },
      { label: 'M\u2032', value: step.trace.filter(s => s.stage === 'rotor-rev' && s.rotor === 1).pop().value },
      { label: 'R\u2032', value: step.trace.filter(s => s.stage === 'rotor-rev' && s.rotor === 2).pop().value },
      { label: 'Plug',    value: step.trace.find(s => s.stage === 'plug-out').value }
    ];

    const totalW = 30 + stages.length * 60 + 20;
    let parts = [];
    parts.push(`<svg viewBox="0 0 ${totalW} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Electrical path through Enigma for the letter ${step.input}">`);
    parts.push('<style>' +
      '.eg-col-bg{fill:#1c1c22;stroke:#2e2e3a;stroke-width:.5}' +
      '.eg-col-lbl{font-family:Cinzel,serif;font-size:8px;fill:#C3A96F;text-anchor:middle;letter-spacing:.08em}' +
      '.eg-row-lbl{font-family:JetBrains Mono,monospace;font-size:5px;fill:#5c5c66;text-anchor:middle;dominant-baseline:central}' +
      '.eg-dot{fill:#5c4b26}' +
      '.eg-dot-on{fill:#F1DDA2}' +
      '.eg-wire{stroke:#D4B765;stroke-width:1.6;fill:none;opacity:.85}' +
      '</style>');

    // Background columns
    for (let s = 0; s < stages.length; s++) {
      const x = 30 + s * 60;
      parts.push(`<rect class="eg-col-bg" x="${x - 14}" y="8" width="28" height="${26 * 7.5 + 6}" rx="3"/>`);
      parts.push(`<text class="eg-col-lbl" x="${x}" y="${26 * 7.5 + 24}">${stages[s].label}</text>`);
      for (let r = 0; r < 26; r++) {
        const cy = 14 + r * 7.5;
        const on = (stages[s].value === r);
        parts.push(`<circle class="${on ? 'eg-dot-on' : 'eg-dot'}" cx="${x}" cy="${cy}" r="${on ? 2.4 : 1.4}"/>`);
        if (s === 0 || s === stages.length - 1) {
          parts.push(`<text class="eg-row-lbl" x="${x + (s === 0 ? -10 : 10)}" y="${cy}">${String.fromCharCode(65 + r)}</text>`);
        }
      }
    }
    // Wires connecting consecutive stages
    for (let s = 0; s < stages.length - 1; s++) {
      const x1 = 30 + s * 60, y1 = 14 + stages[s].value * 7.5;
      const x2 = 30 + (s + 1) * 60, y2 = 14 + stages[s + 1].value * 7.5;
      const cx1 = x1 + 30, cx2 = x2 - 30;
      parts.push(`<path class="eg-wire" d="M${x1},${y1} C${cx1},${y1} ${cx2},${y2} ${x2},${y2}"/>`);
    }
    // Output letter callout
    const finalLetter = String.fromCharCode(65 + stages[stages.length - 1].value);
    parts.push(`<text x="${30 + (stages.length - 1) * 60}" y="6" font-family="Cinzel,serif" font-size="10" fill="#F1DDA2" text-anchor="middle">→ ${finalLetter}</text>`);
    parts.push(`<text x="30" y="6" font-family="Cinzel,serif" font-size="10" fill="#F1DDA2" text-anchor="middle">${step.input} →</text>`);
    parts.push('</svg>');
    svg.innerHTML = parts.join('');
  }

  // Wire up live updates
  ['change','input'].forEach(evt => {
    [els.rotorL, els.rotorM, els.rotorR, els.reflector,
     els.ringL, els.ringM, els.ringR,
     els.posL, els.posM, els.posR,
     els.plugboard, els.plaintext]
      .filter(Boolean)
      .forEach(el => el.addEventListener(evt, runEncrypt));
  });
  if (els.pathToggle) els.pathToggle.addEventListener('change', runEncrypt);
  if (els.encryptBtn) els.encryptBtn.addEventListener('click', runEncrypt);
  if (els.resetBtn)   els.resetBtn.addEventListener('click', resetMachine);

  // Initial render
  setRotorWindows(['A','A','A']);
  runEncrypt();

  // ─────────────────────────────────────────────────────────────────────────
  // PART 2: Self-encryption crib check
  // ─────────────────────────────────────────────────────────────────────────

  const cribEls = {
    cipher: $('eg-crib-cipher'),
    crib:   $('eg-crib-text'),
    runBtn: $('eg-crib-check'),
    output: $('eg-crib-output')
  };

  if (cribEls.runBtn) {
    cribEls.runBtn.addEventListener('click', () => {
      const ct = (cribEls.cipher.value || '').toUpperCase().replace(/[^A-Z]/g, '');
      const cr = (cribEls.crib.value || '').toUpperCase().replace(/[^A-Z]/g, '');
      if (!ct || !cr) {
        cribEls.output.innerHTML = '<span class="output-empty">Enter both ciphertext and crib.</span>';
        return;
      }
      const r = E.findCribPositions(ct, cr);
      if (r.valid.length === 0 && r.rejected.length === 0) {
        cribEls.output.innerHTML = '<span class="output-empty">Crib is longer than the ciphertext.</span>';
        return;
      }

      // Build a position-by-position visual grid.
      let html = '<div class="eg-crib-grid" role="table" aria-label="Crib placement analysis">';
      // Header: ciphertext letters
      html += '<div class="eg-crib-row eg-crib-row--header" role="row">';
      html += '<div class="eg-crib-cell-lbl">Position</div>';
      for (let i = 0; i < ct.length; i++) {
        html += `<div class="eg-crib-cell eg-crib-cell--ct">${ct[i]}</div>`;
      }
      html += '</div>';

      // One row per candidate placement
      const rejectedMap = new Map();
      r.rejected.forEach(rj => rejectedMap.set(rj.position, rj));
      for (let pos = 0; pos <= ct.length - cr.length; pos++) {
        const isValid = r.valid.includes(pos);
        const rj = rejectedMap.get(pos);
        html += `<div class="eg-crib-row ${isValid ? 'eg-crib-row--ok' : 'eg-crib-row--bad'}" role="row">`;
        html += `<div class="eg-crib-cell-lbl">@${pos.toString().padStart(2, '0')} ${isValid ? '✓' : '✗'}</div>`;
        for (let i = 0; i < ct.length; i++) {
          if (i < pos || i >= pos + cr.length) {
            html += '<div class="eg-crib-cell eg-crib-cell--blank"></div>';
          } else {
            const ci = i - pos;
            const conflict = rj && rj.conflictAt === ci;
            html += `<div class="eg-crib-cell ${conflict ? 'eg-crib-cell--conflict' : (isValid ? 'eg-crib-cell--ok' : 'eg-crib-cell--bad')}">${cr[ci]}</div>`;
          }
        }
        html += '</div>';
      }
      html += '</div>';

      const total = ct.length - cr.length + 1;
      html += `<p class="eg-crib-summary"><strong>${r.valid.length}</strong> of ${total} positions survive the self-encryption rule. ` +
        `<strong>${r.rejected.length}</strong> rejected because Enigma cannot encrypt a letter to itself.</p>`;

      cribEls.output.innerHTML = html;
      announce(`${r.valid.length} of ${total} positions survive. ${r.rejected.length} rejected.`);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PART 3: Brute-force rotor + position search
  // Runs in the main thread but chunked via setTimeout to keep UI responsive.
  // Searches: 6 rotor orderings × 26³ = 105 456 settings, with no plugboard,
  // ring AAA. Larger search (60 orderings) available with checkbox.
  // ─────────────────────────────────────────────────────────────────────────

  const bfEls = {
    cipher: $('eg-bf-cipher'),
    crib:   $('eg-bf-crib'),
    offset: $('eg-bf-offset'),
    fullSearch: $('eg-bf-full'),
    runBtn: $('eg-bf-run'),
    cancelBtn: $('eg-bf-cancel'),
    progress: $('eg-bf-progress'),
    progressBar: $('eg-bf-progress-bar'),
    candidates: $('eg-bf-candidates')
  };

  let bfCancelled = false;

  if (bfEls.runBtn) {
    bfEls.runBtn.addEventListener('click', () => {
      const ct = (bfEls.cipher.value || '').toUpperCase().replace(/[^A-Z]/g, '');
      const cr = (bfEls.crib.value || '').toUpperCase().replace(/[^A-Z]/g, '');
      const offset = Math.max(0, parseInt(bfEls.offset.value, 10) || 0);
      if (!ct || !cr) {
        bfEls.candidates.innerHTML = '<span class="output-empty">Enter ciphertext and crib.</span>';
        return;
      }
      if (offset + cr.length > ct.length) {
        bfEls.candidates.innerHTML = '<span class="output-empty">Crib offset + length exceeds ciphertext length.</span>';
        return;
      }
      // Self-encryption sanity check first.
      for (let i = 0; i < cr.length; i++) {
        if (ct[offset + i] === cr[i]) {
          bfEls.candidates.innerHTML = `<p class="eg-bf-error">Crib placement contains a self-encryption at position ${offset + i} (letter ${cr[i]}). Enigma cannot do this — adjust the crib offset.</p>`;
          return;
        }
      }

      const available = bfEls.fullSearch && bfEls.fullSearch.checked
        ? ['I','II','III','IV','V']
        : ['I','II','III'];

      bfCancelled = false;
      bfEls.cancelBtn.disabled = false;
      bfEls.runBtn.disabled = true;
      bfEls.candidates.innerHTML = '';
      bfEls.progress.hidden = false;
      bfEls.progressBar.style.width = '0%';

      // Build orderings
      const orders = [];
      for (let a = 0; a < available.length; a++)
        for (let b = 0; b < available.length; b++)
          if (b !== a)
            for (let c = 0; c < available.length; c++)
              if (c !== a && c !== b)
                orders.push([available[a], available[b], available[c]]);

      const slice = ct.substr(offset, cr.length);
      const total = orders.length * 26 * 26 * 26;
      let tested = 0, found = 0;
      let oi = 0, p0 = 0, p1 = 0, p2 = 0;
      const startedAt = Date.now();

      // Process ~8000 machines per chunk, then yield to the event loop.
      function chunk() {
        if (bfCancelled) {
          bfEls.progress.querySelector('.eg-bf-status').textContent =
            `Cancelled at ${tested.toLocaleString()} / ${total.toLocaleString()}.`;
          bfEls.runBtn.disabled = false;
          bfEls.cancelBtn.disabled = true;
          return;
        }
        const CHUNK = 4000;
        for (let n = 0; n < CHUNK && oi < orders.length; n++) {
          const order = orders[oi];
          const positions = String.fromCharCode(65 + p0) +
                            String.fromCharCode(65 + p1) +
                            String.fromCharCode(65 + p2);
          const m = E.createEnigma({
            rotors: order, reflector: 'B',
            ringSettings: 'AAA', positions, plugboard: []
          });
          if (offset > 0) m.encrypt('A'.repeat(offset));
          const got = m.encrypt(cr);
          tested++;
          if (got === slice) {
            found++;
            const cand = document.createElement('div');
            cand.className = 'eg-bf-candidate';
            cand.innerHTML =
              `<span class="eg-bf-rotors">${order.join(' · ')}</span>` +
              `<span class="eg-bf-pos">positions ${positions}</span>` +
              `<button type="button" class="eg-bf-load" data-rotors="${order.join(',')}" data-pos="${positions}">Load into machine</button>`;
            bfEls.candidates.appendChild(cand);
          }
          // Advance position counters
          p2++;
          if (p2 === 26) { p2 = 0; p1++;
            if (p1 === 26) { p1 = 0; p0++;
              if (p0 === 26) { p0 = 0; oi++; }
            }
          }
        }
        const pct = (tested / total * 100);
        bfEls.progressBar.style.width = pct.toFixed(1) + '%';
        const elapsed = (Date.now() - startedAt) / 1000;
        const rate = tested / elapsed;
        bfEls.progress.querySelector('.eg-bf-status').textContent =
          `${tested.toLocaleString()} / ${total.toLocaleString()} settings tested · ${found} candidate${found === 1 ? '' : 's'} · ${rate.toFixed(0)} settings/sec`;

        if (oi < orders.length) {
          setTimeout(chunk, 0);
        } else {
          bfEls.progress.querySelector('.eg-bf-status').textContent =
            `Search complete. Tested ${tested.toLocaleString()} settings. Found ${found} candidate${found === 1 ? '' : 's'}.`;
          bfEls.runBtn.disabled = false;
          bfEls.cancelBtn.disabled = true;
          announce(`Brute-force search complete. ${found} candidate settings found.`);
        }
      }
      chunk();
    });

    bfEls.cancelBtn.addEventListener('click', () => { bfCancelled = true; });

    // Click-to-load candidate settings into the machine
    bfEls.candidates.addEventListener('click', e => {
      const btn = e.target.closest('.eg-bf-load');
      if (!btn) return;
      const rotors = btn.dataset.rotors.split(',');
      const positions = btn.dataset.pos;
      els.rotorL.value = rotors[0];
      els.rotorM.value = rotors[1];
      els.rotorR.value = rotors[2];
      els.ringL.value = 'A'; els.ringM.value = 'A'; els.ringR.value = 'A';
      els.posL.value = positions[0];
      els.posM.value = positions[1];
      els.posR.value = positions[2];
      els.plugboard.value = '';
      els.plaintext.value = bfEls.cipher.value;
      runEncrypt();
      // Scroll to machine
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      announce(`Loaded candidate ${rotors.join(',')} ${positions} into machine.`);
    });
  }
})();
```


## JavaScript — js/ciphers/enigma.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/ciphers/enigma.js`
- Served SHA-256: `84fc2459d285d784945fb07af237691da44b5dd8b652f36c235ad400f562a947`
- Readable-source SHA-256: `84fc2459d285d784945fb07af237691da44b5dd8b652f36c235ad400f562a947`


```javascript
/**
 * THE CIPHER MUSEUM — Enigma Machine Engine
 * Exhibit 27 · WWII · Wehrmacht Enigma I (3-rotor)
 *
 * Implements the German Wehrmacht / Luftwaffe Enigma I:
 *   • Rotors I, II, III, IV, V (Wehrmacht set)
 *   • Reflectors B and C (UKW-B, UKW-C)
 *   • Configurable Ringstellung (ring settings)
 *   • Configurable Grundstellung (initial rotor positions)
 *   • Configurable Steckerbrett (plugboard, up to 10 pairs)
 *   • Correct stepping including the middle-rotor double-step anomaly
 *
 * Wirings cited from:
 *   - Tony Sale, "The Bletchley Park 1944 Cryptographic Dictionary"
 *   - Crypto Museum (cryptomuseum.com/crypto/enigma/wiring.htm)
 *   - Wikipedia: Enigma rotor details
 *
 * Verified against canonical test vector:
 *   Rotors I-II-III, rings AAA, positions AAA, no plugboard:
 *     "AAAAA" → "BDZGO"
 */
'use strict';

const EnigmaEngine = (() => {

  const A = 65;
  const ord = c => c.charCodeAt(0) - A;
  const chr = i => String.fromCharCode(((i % 26) + 26) % 26 + A);

  // ── Rotor wirings (right-to-left when reading "A → wiring[0]") ──────────
  // Each string is the substitution: contact i (A=0) → wiring[i].
  // Notch letter = the position shown in the window at which the NEXT
  // keypress causes the rotor to its left to step.
  const ROTORS = {
    I:   { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
    II:  { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
    III: { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' },
    IV:  { wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notch: 'J' },
    V:   { wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK', notch: 'Z' }
  };

  const REFLECTORS = {
    B: 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
    C: 'FVPJIAOYEDRZXWGCTKUQSBNMHL'
  };

  // Pre-compute forward / inverse wiring arrays for each rotor.
  const WIRING_CACHE = {};
  for (const name of Object.keys(ROTORS)) {
    const w = ROTORS[name].wiring;
    const fwd = new Int8Array(26);
    const inv = new Int8Array(26);
    for (let i = 0; i < 26; i++) {
      const o = w.charCodeAt(i) - A;
      fwd[i] = o;
      inv[o] = i;
    }
    WIRING_CACHE[name] = {
      fwd, inv,
      notch: ord(ROTORS[name].notch)
    };
  }

  const REFL_CACHE = {};
  for (const name of Object.keys(REFLECTORS)) {
    const r = REFLECTORS[name];
    const arr = new Int8Array(26);
    for (let i = 0; i < 26; i++) arr[i] = r.charCodeAt(i) - A;
    REFL_CACHE[name] = arr;
  }

  // ── Plugboard ────────────────────────────────────────────────────────────
  // pairs: array of two-letter strings, e.g. [['A','B'],['C','D']]
  // returns Int8Array(26) where map[i] = swapped index (i if no swap).
  function buildPlugboard(pairs) {
    const map = new Int8Array(26);
    for (let i = 0; i < 26; i++) map[i] = i;
    if (!pairs) return map;
    const seen = new Set();
    for (const pair of pairs) {
      if (!pair || pair.length < 2) continue;
      const a = (typeof pair === 'string' ? pair[0] : pair[0]).toUpperCase();
      const b = (typeof pair === 'string' ? pair[1] : pair[1]).toUpperCase();
      if (!/[A-Z]/.test(a) || !/[A-Z]/.test(b) || a === b) continue;
      if (seen.has(a) || seen.has(b)) continue;   // Each letter at most once
      seen.add(a); seen.add(b);
      map[ord(a)] = ord(b);
      map[ord(b)] = ord(a);
    }
    return map;
  }

  // Parse plugboard from a free-text string like "AB CD EF" or "AB,CD,EF"
  function parsePlugboard(str) {
    if (!str) return [];
    const tokens = str.toUpperCase().match(/[A-Z]{2}/g) || [];
    return tokens.map(t => [t[0], t[1]]);
  }

  // ── Core encryption of one letter, with stepping ─────────────────────────
  function makeMachine(config) {
    const rotorNames = (config.rotors || ['I','II','III']).slice(0, 3);
    if (rotorNames.length !== 3) throw new Error('Enigma I requires exactly 3 rotors');
    for (const n of rotorNames) {
      if (!WIRING_CACHE[n]) throw new Error('Unknown rotor: ' + n);
    }
    const reflName = config.reflector || 'B';
    if (!REFL_CACHE[reflName]) throw new Error('Unknown reflector: ' + reflName);

    const ringStr = (config.ringSettings || 'AAA').toUpperCase().padEnd(3, 'A').slice(0, 3);
    const posStr  = (config.positions    || 'AAA').toUpperCase().padEnd(3, 'A').slice(0, 3);

    // Index 0 = LEFT rotor, 1 = MIDDLE, 2 = RIGHT
    const rings     = [ord(ringStr[0]), ord(ringStr[1]), ord(ringStr[2])];
    const positions = [ord(posStr[0]),  ord(posStr[1]),  ord(posStr[2])];
    const wirings   = rotorNames.map(n => WIRING_CACHE[n]);
    const reflector = REFL_CACHE[reflName];

    const plugboard = buildPlugboard(config.plugboard);

    function step() {
      // Double-stepping anomaly: if middle rotor is at its notch, it steps
      // (carrying the left rotor with it) on the next keypress — even if
      // the right rotor isn't at its notch. The right rotor always steps.
      const middleAtNotch = positions[1] === wirings[1].notch;
      const rightAtNotch  = positions[2] === wirings[2].notch;
      if (middleAtNotch) {
        positions[0] = (positions[0] + 1) % 26;
        positions[1] = (positions[1] + 1) % 26;
      } else if (rightAtNotch) {
        positions[1] = (positions[1] + 1) % 26;
      }
      positions[2] = (positions[2] + 1) % 26;
    }

    // Encrypt one A-Z letter (already uppercase index). Returns index.
    // If `trace` is supplied, push intermediate stages into it.
    function encryptIndex(c, trace) {
      step();
      if (trace) trace.push({ stage: 'key', value: c });

      // Plugboard in
      c = plugboard[c];
      if (trace) trace.push({ stage: 'plug-in', value: c });

      // Rotors right → left (forward pass)
      for (let i = 2; i >= 0; i--) {
        const offset = positions[i] - rings[i];
        const inIdx  = (c + offset + 26) % 26;
        const outIdx = wirings[i].fwd[inIdx];
        c = (outIdx - offset + 26) % 26;
        if (trace) trace.push({ stage: 'rotor-fwd', rotor: i, value: c });
      }

      // Reflector
      c = reflector[c];
      if (trace) trace.push({ stage: 'reflector', value: c });

      // Rotors left → right (inverse pass)
      for (let i = 0; i < 3; i++) {
        const offset = positions[i] - rings[i];
        const inIdx  = (c + offset + 26) % 26;
        const outIdx = wirings[i].inv[inIdx];
        c = (outIdx - offset + 26) % 26;
        if (trace) trace.push({ stage: 'rotor-rev', rotor: i, value: c });
      }

      // Plugboard out
      c = plugboard[c];
      if (trace) trace.push({ stage: 'plug-out', value: c });

      return c;
    }

    function encrypt(text) {
      const t = String(text).toUpperCase();
      let out = '';
      for (let i = 0; i < t.length; i++) {
        const code = t.charCodeAt(i);
        if (code >= 65 && code <= 90) {
          out += chr(encryptIndex(code - 65));
        }
        // Non-A-Z characters silently dropped (matches original Enigma behaviour:
        // operators omitted spaces and punctuation).
      }
      return out;
    }

    // Encrypt with full per-letter trace (for visualisation).
    function encryptWithTrace(text) {
      const t = String(text).toUpperCase();
      const result = { ciphertext: '', steps: [] };
      for (let i = 0; i < t.length; i++) {
        const code = t.charCodeAt(i);
        if (code >= 65 && code <= 90) {
          const trace = [];
          const positionsBefore = positions.slice();
          const out = encryptIndex(code - 65, trace);
          result.steps.push({
            input: t[i],
            output: chr(out),
            positions: positions.slice(),     // positions AFTER stepping
            positionsBefore,
            trace
          });
          result.ciphertext += chr(out);
        }
      }
      return result;
    }

    return {
      encrypt,
      encryptWithTrace,
      // Encryption is involutive in Enigma (same machine state decrypts):
      decrypt: encrypt,
      getState: () => ({
        rotors: rotorNames.slice(),
        reflector: reflName,
        ringSettings: rings.map(chr).join(''),
        positions: positions.map(chr).join(''),
        plugboardMap: Array.from(plugboard)
      })
    };
  }

  // Convenience constructor matching the spec's public API.
  function createEnigma(config) {
    return makeMachine(config || {});
  }

  // ── Cryptanalysis helpers (Component 3) ──────────────────────────────────

  /**
   * Self-encryption check.
   * Enigma cannot encrypt any letter to itself. Given a ciphertext and a
   * crib (known plaintext fragment), returns the set of starting offsets
   * at which the crib could legally appear (i.e. no character of the crib
   * matches the ciphertext at that position).
   */
  function findCribPositions(ciphertext, crib) {
    const ct = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
    const cr = crib.toUpperCase().replace(/[^A-Z]/g, '');
    const valid = [];
    const rejected = [];
    if (cr.length === 0 || cr.length > ct.length) {
      return { valid, rejected, ciphertext: ct, crib: cr };
    }
    outer: for (let pos = 0; pos <= ct.length - cr.length; pos++) {
      for (let i = 0; i < cr.length; i++) {
        if (ct[pos + i] === cr[i]) {
          rejected.push({ position: pos, conflictAt: i, letter: cr[i] });
          continue outer;
        }
      }
      valid.push(pos);
    }
    return { valid, rejected, ciphertext: ct, crib: cr };
  }

  /**
   * Brute-force rotor-order + position search for a known crib.
   * Tries all 60 rotor orders × 26³ positions = 1,054,560 settings.
   * Ring settings fixed at AAA, plugboard empty (the cryptanalytically
   * interesting subspace; the bombe's purpose was to extend this to the
   * plugboard, which is far beyond browser scope).
   *
   * Yields candidates incrementally via the `onCandidate` callback so the
   * caller can render progress. Use a Web Worker or chunked scheduling for
   * UI responsiveness.
   *
   * @param {object} opts
   * @param {string} opts.ciphertext  Full intercepted ciphertext.
   * @param {string} opts.crib        Known plaintext fragment.
   * @param {number} opts.cribOffset  Position of the crib in the ciphertext.
   * @param {string} [opts.reflector] 'B' or 'C', default 'B'.
   * @param {string[]} [opts.availableRotors] default ['I','II','III','IV','V'].
   * @param {(c:object)=>void} [opts.onCandidate]
   * @param {(p:object)=>void} [opts.onProgress] called every progressInterval.
   * @param {number} [opts.progressInterval] default 5000.
   * @returns {{candidates:Array, tested:number, totalSpace:number}}
   */
  function bruteForceCrib(opts) {
    const ct = opts.ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
    const crib = opts.crib.toUpperCase().replace(/[^A-Z]/g, '');
    const cribOffset = opts.cribOffset | 0;
    const reflector = opts.reflector || 'B';
    const available = opts.availableRotors || ['I','II','III','IV','V'];
    const onCand = opts.onCandidate || (() => {});
    const onProg = opts.onProgress || (() => {});
    const progInt = opts.progressInterval || 5000;

    if (cribOffset + crib.length > ct.length) {
      throw new Error('Crib offset + length exceeds ciphertext');
    }
    // Reject placements where any crib letter equals the corresponding
    // ciphertext letter (Enigma cannot encrypt to itself).
    for (let i = 0; i < crib.length; i++) {
      if (ct[cribOffset + i] === crib[i]) {
        return {
          candidates: [],
          tested: 0,
          totalSpace: 0,
          rejected: 'Crib placement contains a self-encryption — impossible in Enigma.'
        };
      }
    }

    // We only need to test the slice that covers the crib.
    const slice = ct.substr(cribOffset, crib.length);

    // Generate all rotor orderings (permutations of 3 from `available`).
    const orders = [];
    for (let a = 0; a < available.length; a++)
      for (let b = 0; b < available.length; b++)
        if (b !== a)
          for (let c = 0; c < available.length; c++)
            if (c !== a && c !== b)
              orders.push([available[a], available[b], available[c]]);

    const totalSpace = orders.length * 26 * 26 * 26;
    const candidates = [];
    let tested = 0;

    for (const order of orders) {
      for (let p0 = 0; p0 < 26; p0++) {
        for (let p1 = 0; p1 < 26; p1++) {
          for (let p2 = 0; p2 < 26; p2++) {
            // Advance the rotor state forward to the position the crib
            // sits at: we need the machine state at `cribOffset` keypresses
            // in. Rather than simulating, we use the trick that with no
            // plugboard and ring AAA, we can just construct a fresh
            // machine and encrypt cribOffset dummy letters first, then
            // the crib slice. (Simpler and accurate; brute force speed
            // is dominated by the 1M-machine outer loop.)
            const positions = chr(p0) + chr(p1) + chr(p2);
            const m = makeMachine({
              rotors: order,
              reflector,
              ringSettings: 'AAA',
              positions,
              plugboard: []
            });
            // Fast-forward
            if (cribOffset > 0) m.encrypt('A'.repeat(cribOffset));
            const got = m.encrypt(crib);
            tested++;
            if (got === slice) {
              const cand = {
                rotors: order.slice(),
                positions,
                reflector,
                producedCipher: got
              };
              candidates.push(cand);
              onCand(cand);
            }
            if (tested % progInt === 0) {
              onProg({ tested, totalSpace, found: candidates.length });
            }
          }
        }
      }
    }
    onProg({ tested, totalSpace, found: candidates.length, done: true });
    return { candidates, tested, totalSpace };
  }

  return {
    createEnigma,
    parsePlugboard,
    findCribPositions,
    bruteForceCrib,
    ROTORS,
    REFLECTORS
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnigmaEngine;
}
if (typeof window !== 'undefined') {
  window.EnigmaEngine = EnigmaEngine;
}
```


## JavaScript — js/ciphers/lorenz-depth.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/ciphers/lorenz-depth.js`
- Served SHA-256: `f3d440f9f4d0b31474a556267da6da7942ea6c9e7db85afe0cee1dc9c520aba3`
- Readable-source SHA-256: `f3d440f9f4d0b31474a556267da6da7942ea6c9e7db85afe0cee1dc9c520aba3`


```javascript
/**
 * Lorenz Depth-Attack Engine
 * --------------------------
 * The 1941 Bletchley Park cryptanalytic breakthrough that broke the
 * Lorenz SZ40. The XOR cancellation applies whenever two messages use
 * the same additive keystream. Pure JavaScript, no DOM dependencies.
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
 * after John Tiltman recovered the paired plaintexts; Tommy Flowers
 * later built Colossus to assist Lorenz cryptanalysis. Reusing a nonce
 * under the same key can repeat the keystream in modes such as CTR/GCM;
 * consequences depend on the construction and cannot be generalized to
 * every TLS cipher suite or every use of an IV.
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
   * vice versa. Readable output is a hypothesis to investigate, not a
   * probability or proof that the guessed crib is correct.
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
```


## JavaScript — js/ciphers/lorenz-page.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/ciphers/lorenz-page.js`
- Served SHA-256: `62b47fdffea59380b15313a17874ec19f520b96987000b60ae2bf30f2e2dc8c5`
- Readable-source SHA-256: `62b47fdffea59380b15313a17874ec19f520b96987000b60ae2bf30f2e2dc8c5`


```javascript
/**
 * Lorenz exhibit page glue — wires the depth-attack interactive
 * (defined by js/ciphers/lorenz-depth.js) into the DOM elements on
 * ciphers/lorenz.html. No engine logic lives here; this file is
 * presentation only.
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || !window.LorenzDepth) return;

  const { xorStrings, makeDepth, cribDrag } = window.LorenzDepth;

  // --- helpers ------------------------------------------------------
  const $ = (id) => document.getElementById(id);

  function toHex(s) {
    let out = '';
    for (let i = 0; i < s.length; i++) {
      out += s.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return out;
  }
  function fromHex(h) {
    const clean = (h || '').replace(/\s+/g, '').toLowerCase();
    if (!/^[0-9a-f]*$/.test(clean) || (clean.length % 2) !== 0) return null;
    let out = '';
    for (let i = 0; i < clean.length; i += 2) {
      out += String.fromCharCode(parseInt(clean.substr(i, 2), 16));
    }
    return out;
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
    }[c]));
  }

  // --- default scenario --------------------------------------------
  // Invented German/English examples illustrate a repeated-keystream mistake.
  // These are not the intercepted 1941 messages or a Lorenz wheel simulation.
  const P_A = 'OBERKOMMANDO DER WEHRMACHT GREIFT IM OSTEN AN BEI MORGENGRAUEN';
  const P_B = 'ARMY HIGH COMMAND ATTACKS IN THE EAST AT DAWN ON SIX SEPTEMBER';
  // Pad the shorter to the longer so they share length 1:1.
  const N = Math.max(P_A.length, P_B.length);
  const padA = P_A.padEnd(N, ' ');
  const padB = P_B.padEnd(N, ' ');
  const KEY = 'SZ40LORENZWHEELSTREAM'; // arbitrary repeating "keystream"
  const { c1, c2 } = makeDepth(padA, padB, KEY);

  // --- DOM elements -------------------------------------------------
  const elC1 = $('lz-c1');
  const elC2 = $('lz-c2');
  const elDepth = $('lz-depth');
  const elCrib = $('lz-crib');
  const elDrag = $('lz-drag');
  const elOut = $('lz-results');
  if (!elC1 || !elC2 || !elDepth || !elCrib || !elDrag || !elOut) return;

  // --- depth recompute on input ------------------------------------
  function recomputeDepth() {
    const a = fromHex(elC1.value);
    const b = fromHex(elC2.value);
    if (a === null || b === null) {
      elDepth.value = '⚠ ciphertext must be valid hex (0-9, a-f, even length)';
      return null;
    }
    const depth = xorStrings(a, b);
    elDepth.value = toHex(depth);
    return depth;
  }

  function renderResults(ranked) {
    if (!ranked.length) {
      elOut.innerHTML = '<span class="output-empty">No legal offsets — crib is longer than the depth.</span>';
      return;
    }
    const top = ranked.slice(0, 8);
    const maxScore = top[0].score || 1;
    let html = '<table class="cipher-table" style="margin:0;"><thead><tr>'
      + '<th style="width:5rem;">Offset</th>'
      + '<th>Candidate slice (if the crib is correct at this position)</th>'
      + '<th style="width:6rem;text-align:right;">Score</th>'
      + '</tr></thead><tbody>';
    top.forEach((r, i) => {
      const highScore = r.score > 0 && r.score >= maxScore * 0.5;
      const colour = highScore ? 'var(--gold)' : 'var(--tx3)';
      const weight = i === 0 ? '700' : '400';
      html += '<tr>'
        + `<td style="color:${colour};font-family:var(--fm,monospace);">${r.offset}</td>`
        + `<td style="font-family:var(--fm,monospace);color:${colour};font-weight:${weight};">`
        + escapeHtml(r.candidate.replace(/[\x00-\x1f\x7f-\xff]/g, '·'))
        + '</td>'
        + `<td style="text-align:right;color:${colour};font-family:var(--fm,monospace);">${r.score.toFixed(2)}</td>`
        + '</tr>';
    });
    html += '</tbody></table>';
    if (top[0].score > 0) {
      html += `<p style="font-size:.9rem;color:var(--gold);margin:.75rem 0 0;">Highest-scoring candidate at offset ${top[0].offset}: <code>${escapeHtml(top[0].candidate)}</code>. The English score does not confirm the crib or recover the other message by itself; check this hypothesis against additional evidence.</p>`;
    } else {
      html += '<p style="font-size:.9rem;color:var(--tx3);margin:.75rem 0 0;font-style:italic;">No offset produced English-looking output. Try a different crib (longer cribs are more discriminating).</p>';
    }
    elOut.innerHTML = html;
  }

  function runDrag() {
    const depth = recomputeDepth();
    if (depth === null) {
      elOut.innerHTML = '<span class="output-empty" style="color:var(--rust,#d97757);">Fix the ciphertext hex first.</span>';
      return;
    }
    const crib = (elCrib.value || '').trim();
    if (!crib) {
      elOut.innerHTML = '<span class="output-empty">Type a crib (a guessed plaintext fragment) and click again.</span>';
      return;
    }
    renderResults(cribDrag(depth, crib));
  }

  // --- init --------------------------------------------------------
  elC1.value = toHex(c1);
  elC2.value = toHex(c2);
  recomputeDepth();
  elC1.addEventListener('input', recomputeDepth);
  elC2.addEventListener('input', recomputeDepth);
  elDrag.addEventListener('click', runDrag);
  elCrib.addEventListener('keydown', (e) => { if (e.key === 'Enter') runDrag(); });
})();
```


## JavaScript — js/columnar-search-ui.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/columnar-search-ui.js`
- Served SHA-256: `ea903e79fe135580ff589cc06a6c9e3f47d15e5b66ef30ef47de9b1b2e1d7b3c`
- Readable-source SHA-256: `ea903e79fe135580ff589cc06a6c9e3f47d15e5b66ef30ef47de9b1b2e1d7b3c`


```javascript
(function(){
  'use strict';
  const get=id=>document.getElementById(id),button=get('columnar-search-run');if(!button)return;
  button.addEventListener('click',()=>{
    button.disabled=true;get('columnar-search-output').textContent='Searching within the declared evaluation budget…';
    setTimeout(()=>{try{
      const options={width:Number(get('columnar-search-width').value),seed:Number(get('columnar-search-seed').value),budget:Number(get('columnar-search-budget').value),staged:get('columnar-search-staged').checked,alignment:get('columnar-search-align').checked,segments:get('columnar-search-segments').checked,restarts:Number(get('columnar-search-restarts').value)};
      const text=get('columnar-search-text').value;
      const result=options.width?ColumnarSearch.solve(text,options):ColumnarSearch.unknownWidth(text,options);
      const chosen=options.width?result:result.best;
      get('columnar-search-output').textContent='Score evaluations: '+result.evaluations+' / '+options.budget+'. '+(chosen&&chosen.best?'Width '+chosen.width+'; order '+chosen.best.order.map(x=>x+1).join('-')+'; preprocessing '+chosen.preprocessing+'. Best candidate (unverified):\n'+chosen.best.plaintext:chosen?chosen.reason:'No candidate within the per-width budgets.')+'\nEqual evaluation counts are not equal CPU time. Scores do not certify a decryption or uniqueness.';
    }catch(e){get('columnar-search-output').textContent=e.message;}finally{button.disabled=false;}},0);
  });
})();
```


## JavaScript — js/columnar-search.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/columnar-search.js`
- Served SHA-256: `725bdb4724c8867e35f14235787c9156d13df2965c2afd3054cebccfc7439b1c`
- Readable-source SHA-256: `725bdb4724c8867e35f14235787c9156d13df2965c2afd3054cebccfc7439b1c`


```javascript
/* Bounded adaptation of George Lasry, A Methodology for the Cryptanalysis of
 * Classical Ciphers with Search Metaheuristics (2018), §§5.3.2–5.3.4. */
(function(root) {
  'use strict';
  function rng(seed) { let x=seed>>>0; return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;}; }
  function permutation(order) { return Array.isArray(order)&&order.length>=2&&order.every(x=>Number.isInteger(x)&&x>=0&&x<order.length)&&new Set(order).size===order.length; }
  function columns(text,order) {
    if(!permutation(order)) throw Error('Invalid column permutation.');
    const k=order.length,r=Math.floor(text.length/k),u=text.length%k, cols=Array(k), starts=[];
    let at=0;
    order.forEach((original,rank)=>{starts[rank]=at;const n=r+(original<u?1:0);cols[original]=text.slice(at,at+n);at+=n;});
    return {cols,starts};
  }
  function decrypt(text,order) {
    const {cols}=columns(text,order);let out='';
    for(let row=0;row<Math.ceil(text.length/order.length);row++) for(const col of cols) if(row<col.length)out+=col[row];
    return out;
  }
  function encrypt(text,order) {if(!permutation(order))throw Error('Invalid column permutation.');return order.map(c=>{let out='';for(let i=c;i<text.length;i+=order.length)out+=text[i];return out;}).join('');}
  function shuffle(order,random) {const a=order.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function move(order,random,segments=true) {
    const a=order.slice(),k=a.length,kind=segments?Math.floor(random()*3):0;
    if(kind===0){const i=Math.floor(random()*k);let j=Math.floor(random()*(k-1));if(j>=i)j++;[a[i],a[j]]=[a[j],a[i]];return a;}
    const length=1+Math.floor(random()*Math.floor(k/2));
    if(kind===1){const start=Math.floor(random()*(k-length+1)),part=a.splice(start,length),at=Math.floor(random()*(a.length+1));a.splice(at,0,...part);return a;}
    const left=Math.floor(random()*(k-2*length+1)),right=left+length+Math.floor(random()*(k-left-2*length+1));
    for(let i=0;i<length;i++)[a[left+i],a[right+i]]=[a[right+i],a[left+i]];return a;
  }
  function solve(text,options={},model=root.DetectiveLangModel) {
    text=String(text).toUpperCase().replace(/[^A-Z]/g,'');
    const width=options.width,budget=options.budget??6000,restarts=options.restarts??4,seed=options.seed??2018;
    if(!Number.isInteger(width)||width<2||width>12||text.length<width*2||text.length>2000)throw Error('Use width 2–12 and 2–2000 letters per columnar task (at least two full rows).');
    if(!Number.isInteger(budget)||budget<100||budget>20000||!Number.isInteger(restarts)||restarts<1||restarts>8||!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw Error('Use 100–20000 evaluations, 1–8 restarts and an unsigned 32-bit seed.');
    const random=rng(seed),r=Math.floor(text.length/width),u=text.length%width,staged=options.staged!==false,alignment=options.alignment!==false;
    let evaluations=0,preprocessing=0,best=null;
    const matrix=Array.from({length:width},()=>Array(width));
    if(staged){
      const positions=Array.from({length:width},(_,i)=>Array.from({length:Math.min(i,u)-Math.max(0,u-(width-i))+1},(_,j)=>i*r+Math.max(0,u-(width-i))+j));
      for(let i=0;i<width;i++)for(let j=0;j<width;j++)if(i!==j){
        let score=-Infinity,offset=0;
        for(const a of positions[i])for(const b of positions[j]){
          if(evaluations>=budget-2*restarts)return {best:null,evaluations,preprocessing:evaluations,seed,width,reason:'Preprocessing exhausted the declared budget; increase it or disable staged scoring.'};
          let value=0;for(let row=0;row<r;row++)value+=model.BIGRAM_LOG[text[a+row]+text[b+row]]??model.BIGRAM_FLOOR;
          evaluations++;
          if(value>score){score=value;offset=((b-a)%r+r)%r;}
        }
        matrix[i][j]={score,offset};
      }
      preprocessing=evaluations;
    }
    function adjacency(order){
      const {starts}=columns(text,order),rank=Array(width);order.forEach((col,i)=>rank[col]=i);
      let score=0,align=0,previous=false;
      for(let col=0;col<width-1;col++){
        const i=rank[col],j=rank[col+1],entry=matrix[i][j];score+=entry.score;
        const matches=((starts[j]-starts[i])%r+r)%r===entry.offset;
        if(matches)align+=2+(previous?1:0);previous=matches;
      }
      return score/(r*(width-1))+(u&&alignment?align/(3*(width-1)):0);
    }
    const remaining=budget-evaluations;
    for(let restart=0;restart<restarts;restart++){
      const quota=Math.floor(remaining/restarts)+(restart<remaining%restarts?1:0),end=evaluations+quota;
      let order=shuffle(Array.from({length:width},(_,i)=>i),random),current=-Infinity;
      const stageEnd=evaluations+(staged?Math.floor(quota/3):0);
      if(staged){current=adjacency(order);evaluations++;while(evaluations<stageEnd){const candidate=move(order,random,options.segments!==false),score=adjacency(candidate);evaluations++;if(score>current){order=candidate;current=score;}}}
      let plain=decrypt(text,order);current=model.fitness(plain);evaluations++;
      if(!best||current>best.score)best={order:order.slice(),plaintext:plain,score:current};
      while(evaluations<end){const candidate=move(order,random,options.segments!==false),p=decrypt(text,candidate),score=model.fitness(p);evaluations++;if(score>current){order=candidate;plain=p;current=score;if(score>best.score)best={order:order.slice(),plaintext:plain,score};}}
    }
    return {best,evaluations,preprocessing,seed,width,restarts,reason:'Best candidate within budget; correctness and uniqueness are unverified.'};
  }
  function unknownWidth(text,options={},model=root.DetectiveLangModel){
    const widths=options.widths??[2,3,4,5,6,7,8,9,10,11,12],budget=options.budget??20000;
    if(!Array.isArray(widths)||!widths.length||new Set(widths).size!==widths.length||widths.some(k=>!Number.isInteger(k)||k<2||k>12)||!Number.isInteger(budget)||budget>20000||budget<100*widths.length)throw Error('Invalid outer width budget.');
    const results=widths.map((width,i)=>solve(text,{...options,width,budget:Math.floor(budget/widths.length)+(i<budget%widths.length?1:0)},model));
    return {results,budget,evaluations:results.reduce((n,r)=>n+r.evaluations,0),best:results.filter(r=>r.best).sort((a,b)=>b.best.score-a.best.score)[0]??null};
  }
  const api={rng,columns,decrypt,encrypt,move,solve,unknownWidth};root.ColumnarSearch=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
```


## JavaScript — js/demo-loader.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/demo-loader.min.js`
- Served SHA-256: `5179210f3c44a4747f46ca3cbcbdf04ebf3369e372df0b73fccc917127cbed17`
- Readable-source SHA-256: `bbbab4d906fa66ca72d3bed302648710c3c06c31ddf31a8a4d4f75dd5e289892`


```javascript
/**
 * THE CIPHER MUSEUM — Demo Loader
 * Auto-generates interactive "Try It Yourself" demos for all cipher exhibit pages.
 * Place <div class="demo-section" data-cipher="cipherName"></div> in the HTML.
 */
'use strict';

(function () {
  const CONFIGS = {
    rasterschluessel44: { label:'RS44 (27 March 1944; max 200 prepared letters)', engine:'rasterschluessel44', defaultMsg:'FEINDGREIFTSEITELFXVIERFUENFUHRBEIAAIGQALFISIGQALFISEEMITAQTPANZNAQSUEDWESTAN', inputs:[{type:'text',id:'keyword',label:'Key: manual, or JSON settings (short teaching mode)',value:'manual'}] },
    doublePlayfair: { label:'German Double Playfair (December 1941; J→II; odd filler Z)', engine:'doublePlayfair', defaultMsg:'FEINDLIQERANGRIFFAUFSTRASZEADORFSTRIQBEHAUSENABGEWEHRT', inputs:[{type:'text',id:'keyword',label:'Key: manual, or JSON squares/filler/strict',value:'manual'}] },
    amsco: { label:'AMSCO (ACA digraph-first)', engine:'amsco', defaultMsg:'INCOMPLETECOLUMNARWITHALTERNATINGSINGLELETTERSANDDIGRAPHS', inputs:[{type:'text',id:'keyword',label:'Column ranks (or JSON order/first)',value:'41325'}] },
    caesar: {
      label: 'Caesar Cipher', engine: 'caesar', defaultMsg: 'THE QUICK BROWN FOX',
      inputs: [{ type: 'range', id: 'shift', label: 'Shift', min: 1, max: 25, value: 3 }]
    },
    monoalphabetic: {
      label: 'Monoalphabetic Substitution', engine: 'monoalphabetic', defaultMsg: 'ATTACK AT DAWN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'ZEBRA', placeholder: 'Keyword…' }]
    },
    polybius: {
      label: 'Polybius Square', engine: 'polybius', defaultMsg: 'HELLO WORLD',
      inputs: []
    },
    homophonic: {
      label: 'Homophonic Substitution', engine: 'homophonic', defaultMsg: 'SECRET MESSAGE',
      inputs: [{ type: 'text', id: 'keyword', label: 'Seed Keyword', value: 'CIPHER', placeholder: 'Seed…' }]
    },
    playfair: {
      label: 'Playfair Cipher', engine: 'playfair', defaultMsg: 'HIDE THE GOLD',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'MONARCHY', placeholder: 'Keyword…' }]
    },
    hill: {
      label: 'Hill Cipher', engine: 'hill', defaultMsg: 'SHORT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Key Matrix (a,b,c,d)', value: '3,3,2,5', placeholder: '3,3,2,5' }]
    },
    vigenere: {
      label: 'Vigenère Cipher', engine: 'vigenere', defaultMsg: 'ATTACKATDAWN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'LEMON', placeholder: 'Keyword…' }]
    },
    beaufort: {
      label: 'Beaufort Cipher', engine: 'beaufort', defaultMsg: 'THE QUICK BROWN FOX',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'FORTIFICATION', placeholder: 'Keyword…' }]
    },
    gronsfeld: {
      label: 'Gronsfeld Cipher', engine: 'gronsfeld', defaultMsg: 'THE SECRET CODE',
      inputs: [{ type: 'text', id: 'keyword', label: 'Numeric Key', value: '31415', placeholder: 'Digits…' }]
    },
    porta: {
      label: 'Porta Cipher', engine: 'porta', defaultMsg: 'DEFEND THE EAST WALL',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'FORTIFY', placeholder: 'Keyword…' }]
    },
    runningKey: {
      label: 'Running Key Cipher', engine: 'runningKey', defaultMsg: 'FLEE AT ONCE',
      inputs: [{ type: 'textarea', id: 'keyword', label: 'Key Text', value: 'WE HOLD THESE TRUTHS TO BE SELF EVIDENT', placeholder: 'Long key text…' }]
    },
    railFence: {
      label: 'Rail Fence Cipher', engine: 'railFence', defaultMsg: 'WE ARE DISCOVERED FLEE AT ONCE',
      inputs: [{ type: 'range', id: 'shift', label: 'Rails', min: 2, max: 10, value: 3 }]
    },
    columnar: {
      label: 'Columnar Transposition', engine: 'columnar', defaultMsg: 'THE TOMATO IS A PLANT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'ZEBRA', placeholder: 'Keyword…' }]
    },
    doubleTransposition: {
      label: 'Double Transposition', engine: 'doubleTransposition', defaultMsg: 'ATTACK AT DAWN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keywords (key1,key2)', value: 'FIRST,SECOND', placeholder: 'KEY1,KEY2' }]
    },
    bacon: {
      label: "Bacon's Cipher", engine: 'bacon', defaultMsg: 'HELLO',
      inputs: []
    },
    tapCode: {
      label: 'Tap Code', engine: 'tapCode', defaultMsg: 'HELLO',
      inputs: []
    },
    pigpen: {
      label: 'Pigpen Cipher', engine: 'pigpen', defaultMsg: 'FREEMASON',
      inputs: []
    },
    bifid: {
      label: 'Bifid Cipher', engine: 'bifid', defaultMsg: 'FLEEATONCE',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'SECRET', placeholder: 'Keyword…' }]
    },
    trifid: {
      label: 'Trifid Cipher', engine: 'trifid', defaultMsg: 'DEFEND',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'FELIX', placeholder: 'Keyword…' }]
    },
    adfgx: {
      label: 'ADFGX Cipher', engine: 'adfgx', defaultMsg: 'ATTACK',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keys (polybius,columnar)', value: 'PRIVACY,GERMAN', placeholder: 'KEY1,KEY2' }]
    },
    adfgvx: {
      label: 'ADFGVX Cipher', engine: 'adfgvx', defaultMsg: 'ATTACK',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keys (polybius,columnar)', value: 'PRIVACY,GERMAN', placeholder: 'KEY1,KEY2' }]
    },
    nihilist: {
      label: 'Nihilist Cipher', engine: 'nihilist', defaultMsg: 'DYNAMITE WINTER PALACE',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keys (polybius,keyword)', value: 'RUSSIAN,KEY', placeholder: 'GRID,KEY' }]
    },
    otp: {
      label: 'One-Time Pad', engine: 'otp', defaultMsg: 'ATTACK',
      inputs: [{ type: 'text', id: 'keyword', label: 'Key (leave blank for random)', value: '', placeholder: 'Random key if empty' }]
    },
    fractionatedMorse: {
      label: 'Fractionated Morse', engine: 'fractionatedMorse', defaultMsg: 'HELLO WORLD',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'ROUNDTABLE', placeholder: 'Keyword…' }]
    },
    confederateVigenere: {
      label: 'Confederate Vigenère', engine: 'confederateVigenere', defaultMsg: 'SEND REINFORCEMENTS',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'CONFEDERATE', placeholder: 'Keyword…' }]
    },
    bazeries: {
      label: 'Bazeries-inspired teaching model', engine: 'bazeries', defaultMsg: 'RETREAT TO THE HILLS',
      inputs: [{ type: 'range', id: 'shift', label: 'Number Key', min: 2, max: 99, value: 42 }]
    },
    alberti: {
      label: 'Alberti Cipher Disk', engine: 'alberti', defaultMsg: 'SECRETS OF THE VATICAN',
      inputs: [{ type: 'range', id: 'shift', label: 'Initial Disk Setting', min: 0, max: 25, value: 3 }]
    },
    jefferson: {
      label: 'Jefferson Disk', engine: 'jefferson', defaultMsg: 'WE HOLD THESE TRUTHS',
      inputs: [{ type: 'text', id: 'keyword', label: 'Disk Order (comma-separated)', value: '3,1,5,2,4,6', placeholder: '1,2,3…26' }]
    },
    enigma: {
      label: 'Enigma Machine', engine: 'enigma', defaultMsg: 'HELLO WORLD',
      inputs: [{ type: 'text', id: 'keyword', label: 'Rotor Start (3 letters)', value: 'AAA', placeholder: 'AAA' }]
    },
    lorenz: {
      label: 'Lorenz Cipher', engine: 'lorenz', defaultMsg: 'URGENT MESSAGE',
      inputs: [{ type: 'text', id: 'keyword', label: 'Wheel Seed', value: 'LORENZ', placeholder: 'Seed word…' }]
    },
    dictionaryCode: {
      label: 'Dictionary Code', engine: 'dictionaryCode', defaultMsg: 'WTUSC',
      inputs: [{ type: 'textarea', id: 'keyword', label: 'Reference Text', value: 'We the People of the United States in Order to form a more perfect Union establish Justice insure domestic Tranquility provide for the common defence', placeholder: 'Reference text…' }]
    },
    stager: {
      label: 'Letter-Route Teaching Model — Compare Stager’s Word Routes', engine: 'stager', defaultMsg: 'WE ARE DISCOVERED FLEE AT ONCE',
      inputs: [{ type: 'range', id: 'shift', label: 'Columns', min: 2, max: 10, value: 5 }]
    },
    vic: {
      label: 'VIC Cipher', engine: 'vic', defaultMsg: 'AGENT REPORT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'SNOWFALL', placeholder: 'Keyword…' }]
    },
    scytale: {
      label: 'Scytale', engine: 'scytale', defaultMsg: 'ATTACK AT DAWN',
      inputs: [{ type: 'range', id: 'shift', label: 'Rod Rows', min: 2, max: 10, value: 3 }]
    },
    vernam: {
      label: 'Vernam Cipher (XOR)', engine: 'vernam', defaultMsg: 'SECRET',
      inputs: [{ type: 'text', id: 'keyword', label: 'Key (leave blank for random)', value: '', placeholder: 'Random key if empty' }]
    },
    greatCipher: {
      label: 'Great Cipher (Grand Chiffre)', engine: 'greatCipher',
      defaultMsg: 'THE KING ORDERS RETREAT TO PARIS AT DAWN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Codebook Seed', value: 'LOUIS', placeholder: 'Seed word…' }]
    },
    babington: {
      label: 'Babington Plot Cipher', engine: 'babington',
      defaultMsg: 'THE QUEEN MUST DIE FOR LIBERTY',
      inputs: [{ type: 'text', id: 'keyword', label: 'Codebook Seed', value: 'BABINGTON', placeholder: 'Seed word…' }]
    },
    'navajo-code-talkers': {
      label: 'Navajo Code Talkers', engine: 'navajo',
      defaultMsg: 'ENEMY TANK BATTLESHIP IWO JIMA',
      inputs: []
    },
    voynich: {
      label: 'Voynich exhibit — invented letter-substitution model', engine: 'voynich',
      defaultMsg: 'HE WHO DECIPHERS THIS WILL BE FAMOUS',
      inputs: []
    },
    atbash: {
      label: 'Atbash', engine: 'atbash', defaultMsg: 'HELLO WORLD',
      inputs: []
    },
    rot13: {
      label: 'ROT13', engine: 'rot13', defaultMsg: 'TRY ROTATING THIRTEEN',
      inputs: []
    },
    foursquare: {
      label: 'Four-Square Cipher', engine: 'foursquare', defaultMsg: 'HELP ME OBI WAN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Two Keywords (key1,key2)', value: 'EXAMPLE,KEYWORD', placeholder: 'KEY1,KEY2' }]
    },
    twosquare: {
      label: 'Two-Square Cipher', engine: 'twosquare', defaultMsg: 'COME QUICKLY WE NEED HELP',
      inputs: [{ type: 'text', id: 'keyword', label: 'Two Keywords (key1,key2)', value: 'EXAMPLE,KEYWORD', placeholder: 'KEY1,KEY2' }]
    },
    straddlingCheckerboard: {
      label: 'Straddling Checkerboard', engine: 'straddlingCheckerboard',
      defaultMsg: 'ATTACK AT DAWN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Top-Row Letters (8)', value: 'ATONESIRE', placeholder: '8 distinct letters' }]
    },
    chaocipher: {
      label: 'Chaocipher', engine: 'chaocipher', defaultMsg: 'WELLDONE IS BETTER THAN WELLSAID',
      inputs: [{ type: 'text', id: 'keyword', label: 'Initial Alphabet Key', value: 'CHAOCIPHER', placeholder: 'Seed word…' }]
    },
    m209: {
      label: 'M-209 pin-and-lug teaching model', engine: 'm209', defaultMsg: 'ENEMY ADVANCING ON FLANK',
      note: 'This deterministic teaching model derives six pin wheels and all 27 lug bars from the seed. It is not an operational M-209 key sheet.',
      inputs: [{ type: 'text', id: 'keyword', label: 'Deterministic Pin/Lug Seed', value: 'HAGELIN', placeholder: 'Seed word…' }]
    },
    solitaire: {
      label: 'Solitaire / Pontifex', engine: 'solitaire', defaultMsg: 'DO NOT USE PC',
      inputs: [{ type: 'text', id: 'keyword', label: 'Deck Key', value: 'CRYPTONOMICON', placeholder: 'Key word…' }]
    },
    beale: {
      label: 'Beale Cipher (book cipher)', engine: 'beale', defaultMsg: 'GOLD',
      inputs: [{ type: 'textarea', id: 'keyword', label: 'Reference Text (Declaration of Independence excerpt)',
        value: 'When in the course of human events it becomes necessary for one people to dissolve the political bands which have connected them with another and to assume among the powers of the earth the separate and equal station to which the laws of nature and of natures god entitle them a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation',
        placeholder: 'Long reference text…' }]
    },
    copiale: {
      label: 'Copiale Cipher', engine: 'copiale', defaultMsg: 'OCULIST ORDER SECRETS',
      inputs: [{ type: 'text', id: 'keyword', label: 'Symbol Seed', value: 'COPIALE', placeholder: 'Seed word…' }]
    },
    kryptos: {
      label: 'Kryptos K1/K2 Tableau', engine: 'kryptos', defaultMsg: 'BETWEEN SUBTLE SHADING AND THE ABSENCE OF LIGHT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Vigenère Key', value: 'PALIMPSEST', placeholder: 'PALIMPSEST or ABSCISSA' }]
    },
    purple: {
      label: 'Purple (simplified)', engine: 'purple', defaultMsg: 'CLIMB MOUNT NIITAKA',
      inputs: [{ type: 'text', id: 'keyword', label: 'Switch Seed', value: 'PURPLE', placeholder: 'Seed word…' }]
    },
    autokey: {
      label: 'Autokey Cipher (Vigenère self-extending)', engine: 'autokey', defaultMsg: 'ATTACK AT DAWN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Primer Key', value: 'QUEENLY', placeholder: 'Primer word…' }]
    },
    nomenclator: {
      label: 'Nomenclator (codebook + cipher alphabet)', engine: 'nomenclator',
      defaultMsg: 'THE KING WILL ATTACK PARIS AT DAWN',
      inputs: []
    },
    bookCipher: {
      label: 'Book Cipher (Declaration of Independence)', engine: 'bookCipher',
      defaultMsg: 'GOLD',
      inputs: []
    },
    sigaba: {
      label: 'SIGABA (pseudorandom rotor stepping)', engine: 'sigaba', defaultMsg: 'CLIMB MOUNT NIITAKA',
      inputs: [{ type: 'text', id: 'keyword', label: 'Rotor Seed', value: 'SIGABA', placeholder: 'Seed word…' }]
    },
    typex: {
      label: 'Typex (5-rotor Enigma-style)', engine: 'typex', defaultMsg: 'BRITISH SIGNAL READY',
      inputs: [{ type: 'text', id: 'keyword', label: 'Rotor Start (5 letters)', value: 'AAAAA', placeholder: 'AAAAA' }]
    },
    'kama-sutra': {
      label: 'Kama Sutra Cipher (Mlecchita Vikalpa)', engine: 'kamaSutra',
      defaultMsg: 'SECRET LOVERS LANGUAGE',
      inputs: [{ type: 'text', id: 'keyword', label: 'Pairing Seed', value: 'KAMASUTRA', placeholder: 'Seed word…' }]
    },
    'aeneas-tacticus': {
      label: 'Aeneas Tacticus Water-Clock Code', engine: 'aeneasTacticus',
      defaultMsg: 'SHIPS APPROACH AT NIGHT',
      inputs: []
    },
    'arabic-nomenclators': {
      label: 'Arabic Nomenclator (al-Kindi era)', engine: 'nomenclator',
      defaultMsg: 'THE CALIPH RIDES AT DAWN',
      inputs: []
    },
    'jn-25': {
      label: 'JN-25 (illustrative superenciphered codebook)', engine: 'jn25',
      defaultMsg: 'AF SHORT OF WATER',
      inputs: [{ type: 'text', id: 'keyword', label: 'Additive Key Digits', value: '31415', placeholder: 'Digits only…' }]
    },
    'red-type-a': {
      label: 'Red (Type A) stepping-switch model', engine: 'redTypeA',
      defaultMsg: 'DIPLOMATIC TRAFFIC TOKYO',
      inputs: [{ type: 'text', id: 'keyword', label: 'Switch Seed', value: 'TOKYORED', placeholder: 'Seed word…' }]
    },
    'affine': {
      label: 'Affine Cipher  (E(x) = a·x + b mod 26)', engine: 'affine',
      defaultMsg: 'AFFINE CIPHER',
      inputs: [{ type: 'text', id: 'keyword', label: 'Key (a,b) — a coprime to 26', value: '5,8', placeholder: '5,8' }]
    },
    'trithemius': {
      label: 'Trithemius Progressive Cipher (1518)', engine: 'trithemius',
      defaultMsg: 'STEGANOGRAPHIA',
      inputs: [{ type: 'number', id: 'shift', label: 'Starting Shift', value: '0', placeholder: '0' }]
    },
    'cardano-autokey': {
      label: 'Plaintext Autokey — Modern Comparison Model', engine: 'cardanoAutokey',
      defaultMsg: 'MEET ME AT MIDNIGHT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Single Seed Letter', value: 'Q', placeholder: 'Q' }]
    },
    'wheatstone': {
      label: 'Equal-Dial Substitution Model — Not Historical Wheatstone', engine: 'wheatstone',
      defaultMsg: 'TELEGRAPH SIGNAL',
      inputs: [{ type: 'text', id: 'keyword', label: 'Inner-Dial Keyword', value: 'WHEATSTONE', placeholder: 'Keyword…' }]
    },
    'morse': {
      label: 'International Morse Code', engine: 'morse',
      defaultMsg: 'SOS',
      inputs: []
    },
    'cardano-grille': {
      label: 'Cardano Grille (1550)', engine: 'cardanoGrille',
      defaultMsg: 'MEETME',
      inputs: [{ type: 'text', id: 'keyword', label: 'Pattern (size:idx,idx,…)', value: '5:0,3,7,12,19,21,24', placeholder: 'e.g. 5:0,3,7,12,19' }]
    },
    'null-cipher': {
      label: 'Null Cipher (Hidden-Letter Concealment)', engine: 'nullCipher',
      defaultMsg: 'HELP',
      inputs: [{ type: 'text', id: 'keyword', label: 'Position (first | last | N)', value: 'first', placeholder: 'first' }]
    },
    'fialka': {
      label: 'Fialka M-125 (Soviet 10-rotor model)', engine: 'fialka',
      note: 'Illustrative seeded 26-letter rotor model only. It does not reproduce the M-125 30-contact alphabet, real rotor wiring, stepping, or key-card settings.',
      defaultMsg: 'WARSAW PACT TRAFFIC',
      inputs: [{ type: 'text', id: 'keyword', label: 'Rotor Seed', value: 'M125', placeholder: 'Seed word…' }]
    },
    'kl-7': {
      label: 'KL-7 (US 1952 8-rotor model)', engine: 'kl7',
      note: 'Illustrative seeded 26-letter rotor model only. It does not reproduce ADONIS rotor wiring, notch rings, stepping, or re-entry wiring.',
      defaultMsg: 'NATO READY MESSAGE',
      inputs: [{ type: 'text', id: 'keyword', label: 'Rotor Seed', value: 'TSEC', placeholder: 'Seed word…' }]
    },
    'geheimschreiber': {
      label: 'Geheimschreiber T52 (Sturgeon family)', engine: 'geheimschreiber',
      defaultMsg: 'OBERKOMMANDO WEHRMACHT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Wheel Seed', value: 'STURGEON', placeholder: 'Seed word…' }]
    },
    'kryha': {
      label: 'Kryha Pocket Cipher (1924)', engine: 'kryha',
      defaultMsg: 'UNBREAKABLE CIPHER',
      inputs: [{ type: 'text', id: 'keyword', label: 'Wheel Seed', value: 'POCKET', placeholder: 'Seed word…' }]
    },
    'm-94': {
      label: 'M-94 / M-138-A Strip Cipher (1922)', engine: 'm94',
      defaultMsg: 'ARMY SIGNAL READY',
      inputs: [{ type: 'text', id: 'keyword', label: 'Offset Row[, disk-order]', value: '5', placeholder: '5 or 5,1,2,3,…' }]
    },
    'chinese-telegraph': {
      label: 'Chinese Telegraph Code (1881, 4-digit codebook)', engine: 'chineseTelegraph',
      defaultMsg: 'SHANGHAI',
      inputs: [{ type: 'text', id: 'keyword', label: 'Additive Key (numeric, 0–9999)', value: '0', placeholder: 'e.g. 1234' }]
    },
    'zimmermann': {
      label: 'Codebook and Additive Teaching Model', engine: 'zimmermann',
      note: 'An invented word table with optional additive arithmetic. This does not reconstruct diplomatic codes 0075 or 13040, which were used on successive transmission legs.',
      defaultMsg: 'WAR WITH MEXICO STOP',
      inputs: [{ type: 'text', id: 'keyword', label: 'Teaching-model additive (0–99999)', value: '0', placeholder: 'e.g. 12345' }]
    },
    'slidex': {
      label: 'Slidex (British WWII tactical bigram card)', engine: 'slidex',
      defaultMsg: 'TANK MOVE NORTH',
      inputs: [{ type: 'text', id: 'keyword', label: 'Card Seed', value: 'SLIDEX', placeholder: 'Seed word…' }]
    },
    'commercial-codebooks': {
      label: 'Commercial Telegraph Codebooks (ABC / Bentley\'s style)', engine: 'commercialCode',
      defaultMsg: 'CONFIRMED SHIPMENT URGENT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Codebook (informational only)', value: 'ABC', placeholder: 'ABC, Bentley, Lieber…' }]
    },
    'culper-ring': {
      label: 'Culper Ring / Tallmadge Code (1779)', engine: 'culperRing',
      defaultMsg: 'WASHINGTON ATTACK MIDNIGHT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Codebook key (informational)', value: 'TALLMADGE', placeholder: 'TALLMADGE' }]
    },
    'arnold-andre': {
      label: 'Arnold–André Book Cipher (Blackstone\'s Commentaries)', engine: 'arnoldAndre',
      defaultMsg: 'GENERAL ARNOLD MEET ANDRE TONIGHT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Book seed (informational)', value: 'BLACKSTONE', placeholder: 'BLACKSTONE' }]
    },
    'argenti': {
      label: 'Argenti Family Cipher (Vatican, 1500s–1600s)', engine: 'argenti',
      defaultMsg: 'ATTACK AT DAWN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Homophone Key', value: 'ARGENTI', placeholder: 'ARGENTI' }]
    },
    'wallis-ciphers': {
      label: 'Wallis Ciphers (English Civil War, 1640s)', engine: 'wallisCiphers',
      defaultMsg: 'KING CHARLES MARCH OXFORD',
      inputs: [{ type: 'text', id: 'keyword', label: 'Nomenclator Key', value: 'WALLIS', placeholder: 'WALLIS' }]
    },
    'raf-otp': {
      label: 'Letter-Pad Teaching Model — Not an Authenticated RAF System', engine: 'otp',
      defaultMsg: 'OPERATION READY', inputs: [
        { type: 'text', id: 'keyword', label: 'Pad (leave blank for random)', value: '', placeholder: 'OTP key material…' }
      ]
    },
    'che-vic': {
      label: 'VIC Comparison Model — Not Guevara’s Pad System', engine: 'vic',
      defaultMsg: 'COMRADES MOVE NORTH',
      inputs: [{ type: 'text', id: 'keyword', label: 'Personal Key', value: 'GUEVARA', placeholder: 'Personal phrase' }]
    },
    'ira-ciphers': {
      label: 'IRA Cipher Traffic (Twomey papers, 1926\u20131928)', engine: 'columnar',
      defaultMsg: 'SEND ADDRESS TO SMITH',
      inputs: [{ type: 'text', id: 'keyword', label: 'Transposition Keyword', value: 'IRELAND', placeholder: 'Keyword\u2026' }]
    },
    'latin-american-codebooks': {
      label: 'Invented Commercial Codebook Illustration', engine: 'commercialCode',
      defaultMsg: 'CARGO ARRIVED BUENOSAIRES',
      inputs: [{ type: 'text', id: 'keyword', label: 'Codebook (informational only)', value: 'COMERCIAL', placeholder: 'Invented vocabulary' }]
    },
    'diana-cryptosystem': {
      label: 'Diana Cryptosystem (US Special Forces OTP, 1960s–)', engine: 'diana',
      defaultMsg: 'EXTRACT NOW',
      inputs: [{ type: 'text', id: 'keyword', label: 'Pad Trigraphs', value: 'XKCDQNJVMZAPLR', placeholder: 'Random pad text\u2026' }]
    },
    'patterson-jefferson-cipher': {
      label: 'Patterson\u2019s Cipher for Jefferson (1801) \u2014 sections of \u22649 lines',
      engine: 'patterson',
      defaultMsg: 'IN CONGRESS JULY FOURTH',
      inputs: [{ type: 'text', id: 'keyword', label: 'Key \u2014 pairs of (line number, arbitrary letters)', value: '13,34,57,65,22,78,49', placeholder: '13,34,57,65,22,78,49' }]
    },
    'wadsworth': {
      label: 'Wadsworth Cipher Device (1817) \u2014 26:33 geared disks', engine: 'wadsworth',
      defaultMsg: 'ATTACK',
      inputs: [{ type: 'text', id: 'keyword', label: 'Inner-Disk Keyword', value: 'WADSWORTH', placeholder: 'Keyword\u2026' }]
    },
    'amharic-ge-ez-ciphers': {
      label: 'Illustrative Latin Substitution — Historical Attribution Unverified', engine: 'geezMonastic',
      defaultMsg: 'PRESERVE THE TEXT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Latin Alphabet Seed', value: 'GEEZ', placeholder: 'Key word\u2026' }]
    },
    'vietnamese-underground': {
      label: 'Illustrative Substitution — No Specific Operational Attribution', engine: 'monoalphabetic',
      defaultMsg: 'ADVANCE TO POSITIONS',
      inputs: [{ type: 'text', id: 'keyword', label: 'Teaching Keyword', value: 'GIAIPHONG', placeholder: 'Key word\u2026' }]
    }
  };

  function buildDemo(container) {
    const cipherName = container.dataset.cipher;
    const config = CONFIGS[cipherName];
    if (!config || !window.CipherEngines) return;

    const engine = window.CipherEngines[config.engine];
    if (!engine) return;

    let mode = 'enc';
    const inputId = 'demo-msg-' + cipherName;
    const keyId = 'demo-key-' + cipherName;

    let inputsHTML = '';
    for (const inp of config.inputs) {
      if (inp.type === 'range') {
        inputsHTML += `
          <div class="input-group">
            <label class="input-label" for="${keyId}">${inp.label} — <span id="demo-range-val-${cipherName}">${inp.value}</span></label>
            <div class="range-row">
              <input type="range" class="museum-range" id="${keyId}" min="${inp.min}" max="${inp.max}" value="${inp.value}"
                aria-label="${inp.label}">
              <span class="range-val" id="demo-range-display-${cipherName}">${inp.value}</span>
            </div>
          </div>`;
      } else if (inp.type === 'textarea') {
        inputsHTML += `
          <div class="input-group">
            <label class="input-label" for="${keyId}">${inp.label}</label>
            <textarea class="museum-input" id="${keyId}" rows="2" placeholder="${inp.placeholder || ''}"
              aria-label="${inp.label}">${inp.value}</textarea>
          </div>`;
      } else {
        inputsHTML += `
          <div class="input-group">
            <label class="input-label" for="${keyId}">${inp.label}</label>
            <input class="museum-input" id="${keyId}" type="text" value="${inp.value}" placeholder="${inp.placeholder || ''}"
              aria-label="${inp.label}">
          </div>`;
      }
    }

    const modeToggle = config.encryptOnly ? `
      <div class="mode-toggle" role="group" aria-label="Cipher mode">
        <button class="mode-btn active" data-mode="enc" aria-pressed="true">Encrypt</button>
      </div>` : `
      <div class="mode-toggle" role="group" aria-label="Cipher mode">
        <button class="mode-btn active" data-mode="enc" aria-pressed="true">Encrypt</button>
        <button class="mode-btn" data-mode="dec" aria-pressed="false">Decrypt</button>
      </div>`;

    container.innerHTML = `
      <div class="demo-panel">
        <div class="demo-head">
          <span>🔐</span>
          <span class="demo-title">Try It Yourself</span>
        </div>
        <div class="demo-body">
          ${config.note ? `<p class="demo-model-note" style="grid-column:1/-1;margin:0;padding:.75rem 1rem;border:1px solid var(--gold-b);border-radius:var(--rs);color:var(--tx2);font-size:.9rem;line-height:1.55;"><strong>Model scope:</strong> ${config.note}</p>` : ''}
          <div class="demo-col">
            ${modeToggle}
            <div class="input-group">
              <label class="input-label" for="${inputId}">Message</label>
              <textarea class="museum-input" id="${inputId}" rows="3" placeholder="Type a message…"
                aria-label="Message input">${config.defaultMsg}</textarea>
            </div>
            ${inputsHTML}
          </div>
          <div class="demo-col">
            <div class="btn-group">
              <button class="btn btn-primary" id="demo-run-${cipherName}">Run Cipher</button>
              <button class="btn btn-secondary" id="demo-clear-${cipherName}">Clear</button>
            </div>
            <p class="demo-key-warning" role="status" hidden></p>
            <div class="input-group">
              <span class="input-label" id="demo-output-label-${cipherName}">Output</span>
              <div class="output-box" id="demo-output-${cipherName}" aria-live="polite" aria-labelledby="demo-output-label-${cipherName}" role="status">
                <span class="output-empty">Result appears here…</span>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    // Wire events
    const modeButtons = container.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        mode = btn.dataset.mode;
      });
    });

    const rangeInput = container.querySelector('.museum-range');
    if (rangeInput) {
      const valSpan = document.getElementById('demo-range-val-' + cipherName);
      const displaySpan = document.getElementById('demo-range-display-' + cipherName);
      rangeInput.addEventListener('input', () => {
        if (valSpan) valSpan.textContent = rangeInput.value;
        if (displaySpan) displaySpan.textContent = rangeInput.value;
      });
    }

    function getKey() {
      const el = document.getElementById(keyId);
      return el ? el.value : '';
    }

    const runBtn = document.getElementById('demo-run-' + cipherName);
    const clearBtn = document.getElementById('demo-clear-' + cipherName);
    const outputBox = document.getElementById('demo-output-' + cipherName);
    const msgInput = document.getElementById(inputId);
    const keyWarning = container.querySelector('.demo-key-warning');

    runBtn.addEventListener('click', () => {
      const msg = msgInput.value;
      const key = getKey();
      keyWarning.hidden = true;
      keyWarning.textContent = '';
      if (config.engine === 'runningKey') {
        const keyLength = String(key).toUpperCase().replace(/[^A-Z]/g, '').length;
        const messageLength = msg.toUpperCase().replace(/[^A-Z]/g, '').length;
        if (!keyLength || keyLength < messageLength) {
          keyWarning.textContent = !keyLength
            ? 'No alphabetic key supplied: the engine uses its built-in teaching excerpt and repeats it if needed. Supply a book passage at least as long as your message for a non-repeating running key.'
            : 'This key has ' + keyLength + ' letters for ' + messageLength + ' message letters, so the teaching engine repeats it. This run is periodic, unlike a full-length non-repeating running key.';
          keyWarning.hidden = false;
        }
      }
      try {
        const result = mode === 'enc' ? engine.encode(msg, key) : engine.decode(msg, key);
        outputBox.innerHTML = '';
        outputBox.textContent = result;
      } catch (e) {
        outputBox.textContent = 'Error: ' + e.message;
      }
    });

    clearBtn.addEventListener('click', () => {
      msgInput.value = '';
      keyWarning.hidden = true;
      keyWarning.textContent = '';
      outputBox.innerHTML = '<span class="output-empty">Result appears here…</span>';
    });

    // Embed affordance — teachers can drop any demo into their own page.
    // Hidden on the embed page itself and when already inside an iframe.
    const isEmbedPage = /embed\.html$/.test(location.pathname);
    let framed = false;
    try { framed = window.self !== window.top; } catch { framed = true; }
    if (!isEmbedPage && !framed) {
      const snippet = '<iframe src="https://ciphermuseum.com/embed.html?cipher=' + cipherName +
        '" width="100%" height="520" style="border:1px solid #2e2e3a;border-radius:8px" ' +
        'title="' + config.label + ' interactive demo — The Cipher Museum" loading="lazy"></iframe>';
      const embed = document.createElement('details');
      embed.className = 'demo-embed';
      embed.style.cssText = 'margin-top:.5rem;font-family:var(--fm);font-size:.72rem;color:var(--tx3);';
      const summary = document.createElement('summary');
      summary.textContent = '‹/› Embed this demo on your own page';
      summary.style.cssText = 'cursor:pointer;letter-spacing:.06em;';
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:.5rem;margin-top:.5rem;flex-wrap:wrap;';
      const field = document.createElement('input');
      field.type = 'text';
      field.readOnly = true;
      field.value = snippet;
      field.setAttribute('aria-label', 'Embed code for this demo');
      field.className = 'museum-input';
      field.style.cssText = 'flex:1;min-width:220px;font-size:.7rem;';
      field.addEventListener('focus', () => field.select());
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'btn btn-secondary';
      copy.textContent = 'Copy';
      copy.addEventListener('click', () => {
        const done = () => {
          copy.textContent = 'Copied!';
          setTimeout(() => { copy.textContent = 'Copy'; }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(snippet).then(done, () => field.select());
        } else { field.select(); try { document.execCommand('copy'); done(); } catch {} }
      });
      row.appendChild(field);
      row.appendChild(copy);
      embed.appendChild(summary);
      embed.appendChild(row);
      container.appendChild(embed);
    }

    // Auto-run on load for instant feedback
    runBtn.click();
  }

  /* ─── Sources & Further Reading ─── */
  const SOURCES = {
    caesar: [
      { text: "Suetonius, <em>The Twelve Caesars</em>, \"Divus Iulius\" §56 — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Caesar_cipher" },
      { text: "Simon Singh, <em>The Code Book: The Science of Secrecy from Ancient Egypt to Quantum Cryptography</em> (1999; Anchor paperback, 2000), ch. 1", url: "https://simonsingh.net/books/the-code-book/" },
      { text: "Practical Cryptography — Caesar Cipher", url: "https://practicalcryptography.com/ciphers/caesar-cipher/" }
    ],
    polybius: [
      { text: "Polybius, <em>Histories</em>, Book X §45 — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Polybius_square" },
      { text: "Practical Cryptography — Polybius Square", url: "https://practicalcryptography.com/ciphers/polybius-cipher/" }
    ],
    scytale: [
      { text: "Plutarch, <em>Life of Lysander</em> §19 — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Scytale" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    monoalphabetic: [
      { text: "Al-Kindi, <em>A Manuscript on Deciphering Cryptographic Messages</em> (~850 AD) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Al-Kindi" },
      { text: "Simon Singh, <em>The Code Book: The Science of Secrecy from Ancient Egypt to Quantum Cryptography</em> (1999; Anchor paperback, 2000), ch. 1", url: "https://simonsingh.net/books/the-code-book/" },
      { text: "Practical Cryptography — Simple Substitution", url: "https://practicalcryptography.com/ciphers/simple-substitution-cipher/" }
    ],
    homophonic: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Practical Cryptography — Homophonic Substitution", url: "https://practicalcryptography.com/ciphers/homophonic-substitution-cipher/" }
    ],
    babington: [
      { text: "Pollen, John Hungerford. <em>Mary Queen of Scots and the Babington Plot</em> (Scottish History Society, 1922)" },
      { text: "Simon Singh, <em>The Code Book: The Science of Secrecy from Ancient Egypt to Quantum Cryptography</em> (1999; Anchor paperback, 2000), ch. 1 — \"The Cipher of Mary Queen of Scots\"", url: "https://simonsingh.net/books/the-code-book/" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "British Library — Digitised manuscripts and archives (collection portal)", url: "https://www.bl.uk/collection/digitised-manuscripts-archives" }
    ],
    voynich: [
      { text: "Mary E. D’Imperio, <em>The Voynich Manuscript: An Elegant Enigma</em> (1978), §§5.1–5.2 and 6.2–6.6." },
      { text: "Sravana Reddy and Kevin Knight, <em>What We Know About The Voynich Manuscript</em> (2011), §§4.1–4.2 and Table 2.", url: "https://aclanthology.org/W11-1511/" },
      { text: "René Zandbergen, <em>Transliteration of the Text</em>, including the Landini–Zandbergen EVA design.", url: "https://www.voynich.nu/transcr.html" },
      { text: "Stephen Bax, <em>A Proposed Partial Decoding of the Voynich Script</em> (2014), abstract and proposed readings.", url: "https://stephenbax.net/?page_id=11" },
      { text: "University of Bristol, <em>Statement re: Voynich research paper</em> (16 May 2019).", url: "https://www.bristol.ac.uk/news/2019/may/voynich-manuscript.html" }
    ],
    playfair: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Practical Cryptography — Playfair Cipher", url: "https://practicalcryptography.com/ciphers/playfair-cipher/" }
    ],
    m209: [
      { text: "War Department, <em>TM 11-380: Converter M-209, M-209-A, M-209-B</em> (17 March 1944)", url: "https://www.nsa.gov/news-features/declassified-documents/friedman-documents/assets/files/publications/FOLDER_075/41709299074861.pdf" }
    ],
    hill: [
      { text: "Hill, Lester S., \"Cryptography in an Algebraic Alphabet,\" <em>American Math Monthly</em> 36 (1929) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Hill_cipher" },
      { text: "Practical Cryptography — Hill Cipher", url: "https://practicalcryptography.com/ciphers/hill-cipher/" }
    ],
    vigenere: [
      { text: "Vigenère, Blaise de. <em>Traicté des chiffres</em> (1586) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher" },
      { text: "Kasiski, Friedrich. <em>Die Geheimschriften und die Dechiffrirkunst</em> (1863) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Kasiski_examination" },
      { text: "Simon Singh, <em>The Code Book: The Science of Secrecy from Ancient Egypt to Quantum Cryptography</em> (1999; Anchor paperback, 2000), ch. 2", url: "https://simonsingh.net/books/the-code-book/" }
    ],
    beaufort: [
      { text: "Beaufort, Sir Francis. <em>Cipher system</em> (1857) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Beaufort_cipher" },
      { text: "Practical Cryptography — Beaufort Cipher", url: "https://practicalcryptography.com/ciphers/beaufort-cipher/" }
    ],
    gronsfeld: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    porta: [
      { text: "Satoshi Tomokiyo, Cryptiana — Porta’s <em>De furtivis literarum notis</em> (1563): illustrated analysis", url: "https://cryptiana.web.fc2.com/code/porta.htm" }
    ],
    runningKey: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Practical Cryptography — Running Key Cipher", url: "https://practicalcryptography.com/ciphers/running-key-cipher/" }
    ],
    railFence: [
      { text: "Practical Cryptography — Rail Fence Cipher", url: "https://practicalcryptography.com/ciphers/rail-fence-cipher/" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    columnar: [
      { text: "Practical Cryptography — Columnar Transposition", url: "https://practicalcryptography.com/ciphers/columnar-transposition-cipher/" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    doubleTransposition: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    bacon: [
      { text: "Bacon, Francis. <em>De Augmentis Scientiarum</em> (1623) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Bacon%27s_cipher" },
      { text: "Simon Singh, <em>The Code Book: The Science of Secrecy from Ancient Egypt to Quantum Cryptography</em> (1999; Anchor paperback, 2000), ch. 1", url: "https://simonsingh.net/books/the-code-book/" }
    ],
    tapCode: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Jim and Sybil Stockdale, <em>In Love and War: The Story of a Family’s Ordeal and Sacrifice During the Vietnam Years</em> (1984) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Tap_code" }
    ],
    pigpen: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    bifid: [
      { text: "Delastelle, Félix. <em>Traité élémentaire de cryptographie</em> (1902) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Bifid_cipher" },
      { text: "Practical Cryptography — Bifid Cipher", url: "https://practicalcryptography.com/ciphers/bifid-cipher/" }
    ],
    trifid: [
      { text: "Delastelle, Félix. <em>Traité élémentaire de cryptographie</em> (1902) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Trifid_cipher" }
    ],
    adfgx: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    adfgvx: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Practical Cryptography — ADFGVX Cipher", url: "https://practicalcryptography.com/ciphers/adfgvx-cipher/" }
    ],
    nihilist: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Practical Cryptography — Nihilist Cipher", url: "https://practicalcryptography.com/ciphers/nihilist-cipher/" }
    ],
    otp: [
      { text: "Shannon, Claude. \"Communication Theory of Secrecy Systems\" (1949) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/One-time_pad" },
      { text: "Vernam, Gilbert. US Patent 1,310,719 (1919) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Gilbert_Vernam" }
    ],
    fractionatedMorse: [
      { text: "Practical Cryptography — Fractionated Morse", url: "https://practicalcryptography.com/ciphers/fractionated-morse-cipher/" }
    ],
    confederateVigenere: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    bazeries: [
      { text: "Bazeries, Étienne. <em>Les Chiffres et les Lettres</em> (1901) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Bazeries_cylinder" }
    ],
    alberti: [
      { text: "Alberti, Leon Battista. <em>De Componendis Cifris</em> (1467) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Alberti_cipher" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    jefferson: [
      { text: "Jefferson, Thomas. Papers, 1795 — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Jefferson_disk" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    enigma: [
      { text: "Andrew Hodges, <em>Alan Turing: The Enigma</em> (1983; centenary edition, 2014)", url: "https://www.turing.org.uk/book/" },
      { text: "Simon Singh, <em>The Code Book: The Science of Secrecy from Ancient Egypt to Quantum Cryptography</em> (1999; Anchor paperback, 2000), ch. 4–6", url: "https://simonsingh.net/books/the-code-book/" },
      { text: "David Kahn, <em>Seizing the Enigma: The Race to Break the German U-Boat Codes, 1939–1945</em> (revised edition, 2012)", url: "https://www.usni.org/press/books/seizing-enigma" }
    ],
    lorenz: [
      { text: "B. Jack Copeland (ed.), <em>Colossus: The Secrets of Bletchley Park’s Codebreaking Computers</em> (2006) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Lorenz_cipher" },
      { text: "Simon Singh, <em>The Code Book: The Science of Secrecy from Ancient Egypt to Quantum Cryptography</em> (1999; Anchor paperback, 2000), ch. 6", url: "https://simonsingh.net/books/the-code-book/" }
    ],
    dictionaryCode: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    stager: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    vic: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    vernam: [
      { text: "Vernam, Gilbert. US Patent 1,310,719 (1919) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Gilbert_Vernam" },
      { text: "Shannon, Claude. \"Communication Theory of Secrecy Systems\" (1949) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/One-time_pad" }
    ],
    "navajo-code-talkers": [
      { text: "William C. Meadows, <em>The Comanche Code Talkers of World War II</em> (2002) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Code_talker" },
      { text: "National Museum of the American Indian — <em>Native Words, Native Warriors</em>: Code Talking", url: "https://americanindian.si.edu/nk360/code-talkers/code-talking/" }
    ],
    zodiac: [
      { text: "Oranchak, David et al. \"Cracking the Zodiac 340-Character Cipher\" (2020) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Zodiac_Killer#Communications" },
      { text: "Simon Singh, <em>The Code Book: The Science of Secrecy from Ancient Egypt to Quantum Cryptography</em> (1999; Anchor paperback, 2000), ch. 8", url: "https://simonsingh.net/books/the-code-book/" }
    ],
    autokey: [
      { text: "Vigenère, Blaise de. <em>Traicté des chiffres</em> (1586) — autokey variant — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Autokey_cipher" },
      { text: "Practical Cryptography — Autokey Cipher", url: "https://practicalcryptography.com/ciphers/autokey-cipher/" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    nomenclator: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Simon Singh, <em>The Code Book: The Science of Secrecy from Ancient Egypt to Quantum Cryptography</em> (1999; Anchor paperback, 2000), ch. 1", url: "https://simonsingh.net/books/the-code-book/" }
    ],
    bookCipher: [
      { text: "Ward, James B. <em>The Beale Papers</em> (1885) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Beale_ciphers" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    sigaba: [
      { text: "Stamp &amp; Chan, \"SIGABA: Cryptanalysis of the Full Keyspace\" (2007) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/SIGABA" },
      { text: "NSA Center for Cryptologic History — SIGABA", url: "https://www.nsa.gov/History/Cryptologic-History/" }
    ],
    typex: [
      { text: "Erskine, Ralph. \"The Development of Typex\" (Cryptologia, 1997) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Typex" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." }
    ],
    jn25: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Elliot Carlson, <em>Joe Rochefort's War: The Odyssey of the Codebreaker Who Outwitted Yamamoto at Midway</em> (2011)", url: "https://www.usni.org/press/books/joe-rocheforts-war" },
      { text: "Jonathan Parshall and Anthony Tully, <em>Shattered Sword: The Untold Story of the Battle of Midway</em> (2005) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Battle_of_Midway" }
    ],
    redTypeA: [
      { text: "Rowlett, Frank. <em>The Story of Magic</em> (1998; library catalog record)", url: "https://ci.nii.ac.jp/ncid/BA54201586" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "NSA CCH materials on SIS Japanese machine exploitation", url: "https://www.nsa.gov/History/Cryptologic-History/" }
    ],
    affine: [
      { text: "Lyons, James. \"Affine Cipher\" — Practical Cryptography", url: "https://practicalcryptography.com/ciphers/classical-era/affine/" },
      { text: "Stinson, Douglas. <em>Cryptography: Theory and Practice</em>, ch. 1 (modular arithmetic primer) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Affine_cipher" },
      { text: "Wikipedia — Affine cipher (key-space derivation)", url: "https://en.wikipedia.org/wiki/Affine_cipher" }
    ],
    trithemius: [
      { text: "Trithemius, Johannes. <em>Polygraphia</em> (1518) — first printed cryptography book — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Polygraphia_(book)" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Practical Cryptography — Trithemius cipher", url: "https://practicalcryptography.com/ciphers/classical-era/trithemius/" }
    ],
    cardanoAutokey: [
      { text: "Cardano, Girolamo. <em>De Subtilitate</em> (1550) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Gerolamo_Cardano" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Wikipedia — Autokey cipher (history section)", url: "https://en.wikipedia.org/wiki/Autokey_cipher" }
    ],
    wheatstone: [
      { text: "Wheatstone, Charles. <em>Cryptograph</em> — 1867 Paris Universal Exposition (described in Kahn) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Charles_Wheatstone#Cryptography" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Crypto Museum — Cipher disks and dial machines", url: "https://www.cryptomuseum.com/crypto/" }
    ],
    morse: [
      { text: "ITU-R Recommendation M.1677 — International Morse Code", url: "https://www.itu.int/rec/R-REC-M.1677/" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Wikipedia — Morse code", url: "https://en.wikipedia.org/wiki/Morse_code" }
    ],
    cardanoGrille: [
      { text: "Cardano, Girolamo. <em>De Subtilitate</em> (1550) — original grille proposal — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Cardan_grille" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Wikipedia — Grille (cryptography)", url: "https://en.wikipedia.org/wiki/Grille_(cryptography)" }
    ],
    nullCipher: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Wikipedia — Null cipher", url: "https://en.wikipedia.org/wiki/Null_cipher" },
      { text: "Stamatatos, Efstathios. \"A Survey of Modern Authorship Attribution Methods\" (2009) — statistical detection of constrained text — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Stylometry" }
    ],
    fialka: [
      { text: "Crypto Museum — Fialka M-125 deep dive", url: "https://www.cryptomuseum.com/crypto/fialka/" },
      { text: "Wikipedia — Fialka", url: "https://en.wikipedia.org/wiki/Fialka" },
      { text: "Reuvers &amp; Simons, \"Fialka History &amp; Operation\" (Crypto Museum, 2009)", url: "https://www.cryptomuseum.com/crypto/fialka/files/" }
    ],
    kl7: [
      { text: "Crypto Museum — KL-7 (TSEC/KL-7 ADONIS)", url: "https://www.cryptomuseum.com/crypto/usa/kl7/" },
      { text: "NSA Cryptologic History — general history portal", url: "https://www.nsa.gov/History/Cryptologic-History/" },
      { text: "Wikipedia — KL-7", url: "https://en.wikipedia.org/wiki/KL-7" }
    ],
    geheimschreiber: [
      { text: "Crypto Museum — Siemens &amp; Halske T52 Geheimschreiber", url: "https://www.cryptomuseum.com/crypto/siemens/t52/" },
      { text: "Bengt Beckman, <em>Codebreakers: Arne Beurling and the Swedish Crypto Program during World War II</em> (English edition, 2002) — related Wikipedia overview", url: "https://en.wikipedia.org/wiki/Arne_Beurling" },
      { text: "Wikipedia — Siemens and Halske T52 / \"Sturgeon\" / Fish (cryptography)", url: "https://en.wikipedia.org/wiki/Siemens_and_Halske_T52" }
    ],
    kryha: [
      { text: "NSA — William F. Friedman documents (declassified collection portal)", url: "https://www.nsa.gov/Helpful-Links/NSA-FOIA/Declassification-Transparency-Initiatives/Historical-Releases/Friedman-Documents/" },
      { text: "Crypto Museum — Kryha Standard Cipher Machine", url: "https://www.cryptomuseum.com/crypto/kryha/" },
      { text: "Wikipedia — Kryha", url: "https://en.wikipedia.org/wiki/Kryha" }
    ],
    m94: [
      { text: "Crypto Museum — M-94 / CSP-488", url: "https://www.cryptomuseum.com/crypto/usa/m94/" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Wikipedia — M-94 and M-138-A", url: "https://en.wikipedia.org/wiki/M-94" }
    ],
    chineseTelegraph: [
      { text: "Wikipedia — Chinese telegraph code", url: "https://en.wikipedia.org/wiki/Chinese_telegraph_code" },
      { text: "Thomas S. Mullaney, <em>The Chinese Typewriter: A History</em> (2017; paperback, 2018)", url: "https://mitpress.mit.edu/9780262536103/the-chinese-typewriter/" },
      { text: "Columbia University Libraries — Chinese Telegraphic Codebooks and Cryptography (collection overview, 2019)", url: "https://blogs.library.columbia.edu/rbml/2019/10/09/chinese-telegraphic-codebooks-and-cryptography/" }
    ],
    zimmermann: [
      { text: "NSA Center for Cryptologic History — The Zimmermann Telegram", url: "https://www.nsa.gov/Helpful-Links/NSA-FOIA/Declassification-Transparency-Initiatives/Historical-Releases/" },
      { text: "Tuchman, Barbara W. <em>The Zimmermann Telegram</em> (1985 edition; first published 1958)", url: "https://www.penguinrandomhouse.com/books/180859/the-zimmermann-telegram-by-barbara-w-tuchman/" },
      { text: "National Archives — Zimmermann Telegram (decoded text)", url: "https://www.archives.gov/education/lessons/zimmermann" },
      { text: "Thomas Boghardt, <em>The Zimmermann Telegram: Intelligence, Diplomacy, and America’s Entry into World War I</em> (2012)", url: "https://www.usni.org/press/books/zimmermann-telegram" }
    ],
    slidex: [
      { text: "Crypto Museum — Slidex", url: "https://www.cryptomuseum.com/crypto/uk/slidex/" },
      { text: "Wikipedia — Slidex", url: "https://en.wikipedia.org/wiki/Slidex" },
      { text: "GCHQ — History articles and resources", url: "https://www.gchq.gov.uk/section/advice-guidance/all-topics?topics=History" }
    ],
    commercialCode: [
      { text: "Wikipedia — Commercial code (communications), general overview", url: "https://en.wikipedia.org/wiki/Commercial_code_(communications)" },
      { text: "Bentley's Complete Phrase Code (1906)" },
      { text: "ABC Telegraphic Code, 5th edition (1901)" },
      { text: "Tom Standage, <em>The Victorian Internet: The Remarkable Story of the Telegraph and the Nineteenth Century’s On-Line Pioneers</em> (1998), cultural context." }
    ],
    culperRing: [
      { text: "Rose, Alexander. <em>Washington’s Spies: The Story of America’s First Spy Ring</em> (2007 paperback; first published 2006)", url: "https://www.penguinrandomhouse.com/books/157145/washingtons-spies-by-alexander-rose/" },
      { text: "Library of Congress — Tallmadge's codebook (digitised pages)", url: "https://www.loc.gov/collections/george-washington-papers/" },
      { text: "Mount Vernon — “Culper Spy Ring Codes”, full transcription of the code book (PDF). This is the source for the numbers quoted on this page: 711 = “Gen Washington”, 727 = “New York”", url: "https://mtv-main-assets.mountvernon.org/files/resources/culpercodebook.pdf" },
      { text: "Mount Vernon — The Culper Code Book", url: "https://www.mountvernon.org/george-washington/the-revolutionary-war/spying-and-espionage/the-culper-code-book" },
      { text: "Wikipedia — Culper Ring", url: "https://en.wikipedia.org/wiki/Culper_Ring" }
    ],
    arnoldAndre: [
      { text: "Wikipedia — Benedict Arnold and John André correspondence", url: "https://en.wikipedia.org/wiki/Benedict_Arnold" },
      { text: "Bakeless, John. <em>Turncoats, Traitors and Heroes</em> (1998 reprint; first published 1959)", url: "https://www.hachettebookgroup.com/titles/john-bakeless/turncoats-traitors-and-heroes/9780306808432/" },
      { text: "Mount Vernon — André's captured ciphered letter", url: "https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/john-andre/" },
      { text: "Cipher History — Arnold-André book cipher analysis", url: "https://www.tandfonline.com/journals/ucry20" }
    ],
    argenti: [
      { text: "Meister, Aloys. <em>Die Geheimschrift im Dienste der päpstlichen Kurie</em> (1906)" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Vatican Apostolic Archive — Argenti family papers (Trattato in Cifra)", url: "https://www.archivioapostolicovaticano.va/content/aav/en.html" }
    ],
    wallisCiphers: [
      { text: "Wallis, John. Cipher notes — Bodleian Library MSS", url: "https://www.bodleian.ox.ac.uk/" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Smith, David Eugene. <em>John Wallis as a Cryptographer</em> (Bulletin AMS, 1917)", url: "https://www.ams.org/journals/bull/1917-24-02/S0002-9904-1917-02954-X/" },
      { text: "Wikipedia — John Wallis", url: "https://en.wikipedia.org/wiki/John_Wallis" }
    ],
    "raf-otp": [
      { text: "Aust, Stefan. <em>The Baader-Meinhof Complex</em> (2008 English ed.)", url: "https://www.bodleyhead.co.uk/" },
      { text: "Peters, Butz. <em>Tödlicher Irrtum: Die Geschichte der RAF</em> (2007 paperback; first published 2004)", url: "https://www.fischerverlage.de/buch/butz-peters-toedlicher-irrtum-9783596172658" },
      { text: "Bundeskriminalamt — RAF forensic archive (Stammheim materials)", url: "https://www.bka.de/" },
      { text: "Wikipedia — Red Army Faction (Communications &amp; Tradecraft)", url: "https://en.wikipedia.org/wiki/Red_Army_Faction" }
    ],
    "che-vic": [
      { text: "Anderson, Jon Lee. <em>Che Guevara: A Revolutionary Life</em> (1997)", url: "https://www.groveatlantic.com/book/che-guevara/" },
      { text: "CIA FOIA — “Guevara Cryptography” (1967 Bolivian capture, declassified)", url: "https://www.cia.gov/readingroom/" },
      { text: "National Security Archive — Bolivia &amp; Che Guevara documents (Peter Kornbluh)", url: "https://nsarchive.gwu.edu/" },
      { text: "Wikipedia — VIC Cipher", url: "https://en.wikipedia.org/wiki/VIC_cipher" }
    ],
    "ira-ciphers": [
          {
                "text": "Tom Mahon and James J. Gillogly, <em>Decoding the IRA</em> (2008)."
          },
          {
                "text": "Elonka Dunin and Klaus Schmeh, <em>Codebreaking: A Practical Guide</em> (Robinson, 2020), the Gillogly and Bean IRA transposition case studies."
          },
          {
                "text": "University of Queensland, “UQ data scientist cracks near century old crypto-code” (23 August 2019), documenting Richard Bean’s solution.",
                "url": "https://news.uq.edu.au/2019-08-23-uq-data-scientist-cracks-near-century-old-crypto-code"
          }
    ],
    "latin-american-codebooks": [
      { text: "<em>Código Comercial Mexicano</em> (Mexican commercial telegraph code)", url: "https://www.bnm.unam.mx/" },
      { text: "<em>ABC Universal Commercial Telegraphic Code</em>, 6th edition (1920)." },
      { text: "Bentley, E.L. <em>Bentley’s Complete Phrase Code</em> (1906)" }
    ],
    "diana-cryptosystem": [
      { text: "US Army FM 34-40-2 — Cryptanalysis (declassified editions)", url: "https://armypubs.army.mil/" },
      { text: "Moore, Tyler. “The Diana Cryptosystem” (IEEE Privacy &amp; Security Magazine, 2002)", url: "https://www.computer.org/csdl/magazine/sp" },
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Wikipedia — Beaufort cipher (mathematical kin)", url: "https://en.wikipedia.org/wiki/Beaufort_cipher" }
    ],
    "patterson-jefferson-cipher": [
      { text: "Smithline, Lawren M. “A Cipher to Thomas Jefferson”, <em>American Scientist</em> 97(2), 2009, 142–149", url: "https://www.americanscientist.org/article/a-cipher-to-thomas-jefferson" },
      { text: "Robert Patterson to Thomas Jefferson, 19 December 1801 — Founders Online", url: "https://founders.archives.gov/documents/Jefferson/01-36-02-0025" },
      { text: "Thomas Jefferson to Robert Patterson, 22 March 1802 — Founders Online", url: "https://founders.archives.gov/documents/Jefferson/01-37-02-0083" },
      { text: "Thomas Jefferson, 12 April 1802, Patterson’s Cipher — Library of Congress", url: "https://www.loc.gov/resource/mtj1.026_0086_0094/?st=gallery" }
    ],
    wadsworth: [
      { text: "Kruh, Louis. “The Mystery of Colonel Decius Wadsworth’s Cipher Device”, <em>Cryptologia</em> 6(3), 1982, 238–247", url: "https://doi.org/10.1080/0161-118291857037" },
      { text: "“Decius Wadsworth Disc Cipher” — William F. Friedman collection, NSA (declassified)", url: "https://archive.org/stream/41788379082740/41788379082740_djvu.txt" },
      { text: "National Cryptologic Foundation — Inventors’ Day &amp; the Wadsworth Cipher", url: "https://archive.cryptologicfoundation.org/community/cryptologic-history/cryptologic-history-calendar.html/event/2026/02/11/1770807600/inventors-day-the-wadsworth-cipher/496980" },
      { text: "Kaeding, Thomas. “Automated ciphertext-only attack on the Wheatstone Cryptograph and related devices”, IACR ePrint 2020/1492", url: "https://eprint.iacr.org/2020/1492" }
    ],
    "dagapeyeff": [
          {
                "text": "Alexander d’Agapeyeff, <em>Codes and Ciphers</em> (Oxford University Press, 1939). The challenge-page photograph consulted is numbered 158; its edition is not identified by that image."
          },
          {
                "text": "Hyde &amp; Rugg, “The D’Agapeyeff Cipher” — the researchers’ account of their work; a possible error is a hypothesis, not an established defect.",
                "url": "https://www.hydeandrugg.com/our-research/codes-ciphers/the-dagapeyeff-cipher/"
          }
    ],
    "dorabella": [
          {
                "text": "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996), chapter 21."
          },
          {
                "text": "Bradley Hauer, Colin Choi, Abram Hindle, Scott Smallwood and Grzegorz Kondrak, “Dorabella Cipher as Musical Inspiration” (2025), especially §4.1. Creative musical interpretation, not an authenticated solution.",
                "url": "https://arxiv.org/abs/2509.17950"
          }
    ],
    "phaistos-disc": [
          {
                "text": "Michael Everson, “Phaistos Disc: U+101D0–U+101FF” (2011), corpus transcription. The widget counts the 45 sign classes and excludes the marked gap and combining oblique strokes.",
                "url": "https://www.evertype.com/standards/csur/phaistos-sample.html"
          },
          {
                "text": "Ireland, “Response to L2/11-126 ‘Phaistos Disc Errata’” (2011), pp. 1–3: writing direction and overlapping impressions.",
                "url": "https://www.unicode.org/L2/L2011/11166-phaistos-response.pdf"
          },
          {
                "text": "Heraklion Archaeological Museum, “The Phaistos Disc”: holding institution and catalogue description.",
                "url": "https://www.heraklionmuseum.gr/en/exhibit/the-phaistos-disc/"
          }
    ],
    "shugborough": [
          {
                "text": "National Trust Heritage Records, “Shepherd’s Monument, Shugborough Estate”, MNA181338: relief, inscription and architectural dating.",
                "url": "https://heritagerecords.nationaltrust.org.uk/HBSMR/MonRecord.aspx?skin=printerfriendly&uid=MNA181338"
          }
    ],
    "mccormick": [
          {
                "text": "Federal Bureau of Investigation, “Cryptanalysts, Part 2: Help Solve an Open Murder Case” (29 March 2011), <em>The FBI Story 2011</em>, p. 25. Evidence of what the agency reported in 2011, not a new case-status announcement.",
                "url": "https://www.fbi.gov/file-repository/reports-and-publications/stats-services-publications-fbi-story-fbistory2011.pdf"
          }
    ],
    "sator-square": [
          {
                "text": "Archaeological Park of Pompeii, “The Sator Square from the Palestra Grande” (2022), inventory 20565: first-century graffito and archaeological location.",
                "url": "https://pompeiicommitment.org/en/historiae/il-quadrato-del-sator-dalla-palestra-grande/"
          }
    ],
    greatCipher: [
      { text: "David Kahn, <em>The Codebreakers: The Comprehensive History of Secret Communication from Ancient Times to the Internet</em>, revised edition (1996)." },
      { text: "Wikipedia — Étienne Bazeries (career and the three-year attack on the Rossignol papers)", url: "https://en.wikipedia.org/wiki/%C3%89tienne_Bazeries" },
      { text: "Wikipedia — Great Cipher (records the syllabic code and the “ignore the previous codegroup” trap)", url: "https://en.wikipedia.org/wiki/Great_Cipher" }
    ],
    "amharic-ge-ez-ciphers": [
      { text: "Six, Verona, with Ernst Hammerschmidt. <em>Äthiopische Handschriften 1: Die Handschriften der Staatsbibliothek Preußischer Kulturbesitz</em>", url: "https://www.steiner-verlag.de/AEthiopische-Handschriften-1/9783515030366" },
      { text: "Hill Museum &amp; Manuscript Library — Ethiopia manuscript preservation overview", url: "https://hmml.org/about/global-operations/Ethiopia/" },
      { text: "Haile, Getatchew, et al. <em>Catalogue of the Ethiopic Manuscript Imaging Project</em>, Vol. 1: Codices 1–105, Magic Scrolls 1–134 (2009)", url: "https://wipfandstock.com/9781606088715/catalogue-of-the-ethiopic-manuscript-imaging-project/" },
      { text: "Wikipedia — Geʼez script", url: "https://en.wikipedia.org/wiki/Ge%CA%BDez_script" }
    ]
  };

  const GENERAL_RESOURCES = [
    { text: 'Crypto Museum — Encyclopedic hardware-focused archive (Enigma variants, spy gear, thousands of photos)', url: 'https://www.cryptomuseum.com/' },
    { text: 'CrypTool-Online — Interactive encrypt / decrypt / analysis tools for many classical ciphers', url: 'https://www.cryptool.org/en/cto/' },
    { text: 'CrypTool Open-Source Project (GitHub)', url: 'https://github.com/cryptool-org' },
    { text: 'National Cryptologic Museum (NSA) — Virtual exhibits on VENONA, Purple, and 20th-century crypto', url: 'https://www.nsa.gov/Museum/' },
    { text: 'Cipher Machines &amp; Cryptology — Deep technical simulations of cipher machines', url: 'https://www.ciphermachinesandcryptology.com/' },
    { text: 'Practical Cryptography — Cipher encyclopaedia with detailed algorithms &amp; analysis', url: 'https://practicalcryptography.com/ciphers/' },
    { text: 'CyberChef — GCHQ\'s open-source data transformation playground', url: 'https://gchq.github.io/CyberChef/' },
    { text: 'CryptoHack — Modern cryptography puzzles &amp; challenges', url: 'https://cryptohack.org/' }
  ];

  /* Twelve SOURCES entries were keyed in camelCase while their pages carry the
     hyphenated slug in data-cipher, so the curated citations silently rendered
     as an empty list and the page showed only the generic resources. Map the
     slug a page actually uses onto the key the citations live under. */
  const SOURCE_KEY_ALIASES = {
    'jn-25': 'jn25',
    'red-type-a': 'redTypeA',
    'cardano-autokey': 'cardanoAutokey',
    'cardano-grille': 'cardanoGrille',
    'null-cipher': 'nullCipher',
    'kl-7': 'kl7',
    'm-94': 'm94',
    'chinese-telegraph': 'chineseTelegraph',
    'commercial-codebooks': 'commercialCode',
    'culper-ring': 'culperRing',
    'arnold-andre': 'arnoldAndre',
    'wallis-ciphers': 'wallisCiphers'
  };

  function buildSources(cipherName) {
    const key = SOURCES[cipherName] ? cipherName : (SOURCE_KEY_ALIASES[cipherName] || cipherName);
    const sources = SOURCES[key] || [];
    const target = document.querySelector('.exhibit-side') || document.querySelector('.exhibit-main');
    if (!target) return;

    function renderList(items) {
      return '<ul style="list-style:none;display:flex;flex-direction:column;gap:.75rem;margin:0;padding:0;">' +
        items.map(function (s) {
          return '<li style="font-size:.92rem;line-height:1.65;color:var(--tx2);">' +
            (s.url ? '<a href="' + s.url + '" target="_blank" rel="noopener noreferrer" style="color:var(--gold);">' + s.text + ' ↗</a>' : s.text) + '</li>';
        }).join('') + '</ul>';
    }

    var body = '';
    if (sources.length) {
      body += '<h3 style="color:var(--tx1);margin:0 0 .75rem;font-size:.95rem;">Exhibit Sources</h3>' +
              renderList(sources);
      body += '<hr style="border:none;border-top:1px solid var(--gold-b);margin:1.25rem 0;">';
    }
    body += '<h3 style="color:var(--tx1);margin:0 0 .75rem;font-size:.95rem;">General Cryptography Resources</h3>' +
            renderList(GENERAL_RESOURCES);

    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.style.borderColor = 'var(--gold-b)';
    panel.innerHTML = '<div class="panel-head" style="background:var(--gold-glow);border-color:var(--gold-b);">' +
      '<span class="panel-icon">📚</span>' +
      '<span class="panel-title" style="color:var(--gold);">Further Reading &amp; Sources</span></div>' +
      '<div class="panel-body">' + body + '</div>';
    target.appendChild(panel);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.demo-section[data-cipher]').forEach(function(el) {
      if (!el.children.length) {
        el.innerHTML = '<p style="color:var(--tx3);font-family:var(--fm);font-size:.85rem;padding:1.5rem;text-align:center;border:1px dashed var(--s5);border-radius:var(--rl);">Loading interactive demo\u2026</p>';
      }
      buildDemo(el);
    });
    const cipherEl = document.querySelector('.demo-section[data-cipher]') ||
                     document.querySelector('[data-cipher]');
    if (cipherEl) buildSources(cipherEl.dataset.cipher);
  });
})();
```


## JavaScript — js/detective-integration.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/detective-integration.js`
- Served SHA-256: `272e6f26901fdc776024f57228cc8e06cbeff372c06323694d01ccce49c14459`
- Readable-source SHA-256: `272e6f26901fdc776024f57228cc8e06cbeff372c06323694d01ccce49c14459`


```javascript
'use strict';
// Corpus actions use the museum's tools. Pass the text in the URL fragment,
// without depending on clipboard permission or sending it in an HTTP query.
window.openInDetective = function (ciphertext) {
  const url = new URL('cipher-detective.html', location.href);
  url.hash = encodeURIComponent(ciphertext);
  window.open(url.href, '_blank', 'noopener');
};

window.openInWorkbench = function (ciphertext) {
  const url = new URL('lab/workbench.html', location.href);
  url.hash = 'ct=' + encodeURIComponent(ciphertext);
  window.open(url.href, '_blank', 'noopener');
};
// Buttons are owned by cipher-corpus.js when each card is rendered. Do not
// append another set at DOMContentLoaded: fetch timing and pagination differ.
```


## JavaScript — js/detective/analyses.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/detective/analyses.js`
- Served SHA-256: `1691d50b0c5a4698139f2fa00f1f62babe7dae907e69293d19ce417662367cda`
- Readable-source SHA-256: `1691d50b0c5a4698139f2fa00f1f62babe7dae907e69293d19ce417662367cda`


```javascript
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

  /* ─── Fixed rounded English frequency heuristic ─── */
  var ENG_FREQ = {
    A:0.08167,B:0.01492,C:0.02782,D:0.04253,E:0.12702,F:0.02228,
    G:0.02015,H:0.06094,I:0.06966,J:0.00153,K:0.00772,L:0.04025,
    M:0.02406,N:0.06749,O:0.07507,P:0.01929,Q:0.00095,R:0.05987,
    S:0.06327,T:0.09056,U:0.02758,V:0.00978,W:0.02360,X:0.00150,
    Y:0.01974,Z:0.00074
  };

  /* ─── Helpers ────────────────────────────────────────────────── */

  function extractLetters(t) {
    // Scoped statistical projection, not a replacement for the original
    // transcription. Uppercasing can expand characters (for example ß → SS).
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
```


## JavaScript — js/detective/attacks.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/detective/attacks.js`
- Served SHA-256: `4275877c52228402697a6205bf8d60dfa8b738c726aa43a1d05ace5c9eaf5e74`
- Readable-source SHA-256: `4275877c52228402697a6205bf8d60dfa8b738c726aa43a1d05ace5c9eaf5e74`


```javascript
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
        if (n < 50)         return { ok: false, reason: 'This teaching tool requires at least 50 letters; that threshold does not guarantee reliable estimation.' };
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
```
