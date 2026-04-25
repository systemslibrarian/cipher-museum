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
