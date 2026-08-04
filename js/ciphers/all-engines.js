// Node.js compatibility export for build/validation scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = window.CipherEngines;
}
/**
 * THE CIPHER MUSEUM — All Cipher Engines
 * Complete implementations for every cipher exhibit (84 engines across the 140-exhibit
 * collection; the remaining exhibits are biographies, context
 * pages, and unsolved/visualization-only widgets).
 */
'use strict';

window.CipherEngines = (() => {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const clean = text => String(text ?? '').normalize('NFD').replace(/\p{M}/gu, '')
    .toUpperCase().replace(/[^A-Z]/g, '');
  const cleanAlphanumeric = text => String(text ?? '').normalize('NFD').replace(/\p{M}/gu, '')
    .toUpperCase().replace(/[^A-Z0-9]/g, '');
  const mod = (a, m) => ((a % m) + m) % m;
  const boundedInt = (value, fallback, min, max) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isSafeInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
  };
  const secureRandomLetters = length => {
    const crypto = globalThis.crypto;
    if (!crypto || typeof crypto.getRandomValues !== 'function') {
      throw new Error('Secure random generator unavailable');
    }
    let result = '';
    while (result.length < length) {
      const bytes = new Uint8Array(Math.max(32, (length - result.length) * 2));
      crypto.getRandomValues(bytes);
      for (const byte of bytes) {
        if (byte < 234) result += A[byte % 26];
        if (result.length === length) break;
      }
    }
    return result;
  };
  const escapeFillers = text => text.split('').map(ch => {
    if (ch === 'X') return 'ZA';
    if (ch === 'Q') return 'ZB';
    if (ch === 'Z') return 'ZC';
    return ch;
  }).join('');
  const unescapeFillers = text => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      if (text[i] === 'Z' && /[ABC]/.test(text[i + 1] || '')) {
        result += { A: 'X', B: 'Q', C: 'Z' }[text[i + 1]];
        i++;
      } else {
        result += text[i];
      }
    }
    return result;
  };

  /* ─── 1. Caesar ─── */
  const caesar = (() => {
    function run(text, n, enc) {
      const s = enc ? mod(n, 26) : mod(26 - n, 26);
      return text.split('').map(ch => {
        const c = ch.charCodeAt(0);
        if (c >= 65 && c <= 90) return String.fromCharCode(mod(c - 65 + s, 26) + 65);
        if (c >= 97 && c <= 122) return String.fromCharCode(mod(c - 97 + s, 26) + 97);
        return ch;
      }).join('');
    }
    return {
      encode: (t, k) => run(t, parseInt(k) || 3, true),
      decode: (t, k) => run(t, parseInt(k) || 3, false)
    };
  })();

  /* ─── 2. Monoalphabetic Substitution ─── */
  const monoalphabetic = (() => {
    function makeAlpha(key) {
      const k = clean(key || 'KEYWORD');
      const seen = new Set();
      let alpha = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); alpha += c; }
      for (let i = 0; i < 26; i++) { const c = A[i]; if (!seen.has(c)) alpha += c; }
      return alpha;
    }
    return {
      encode: (text, key) => {
        const alpha = makeAlpha(key);
        return text.split('').map(ch => {
          const u = ch.toUpperCase(); const idx = A.indexOf(u);
          if (idx < 0) return ch;
          const out = alpha[idx];
          return ch === u ? out : out.toLowerCase();
        }).join('');
      },
      decode: (text, key) => {
        const alpha = makeAlpha(key);
        return text.split('').map(ch => {
          const u = ch.toUpperCase(); const idx = alpha.indexOf(u);
          if (idx < 0) return ch;
          const out = A[idx];
          return ch === u ? out : out.toLowerCase();
        }).join('');
      }
    };
  })();

  /* ─── 3. Polybius Square ─── */
  const polybius = (() => {
    const grid = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
    return {
      encode: t => clean(t).replace(/J/g, 'I').split('').map(ch => {
        const i = grid.indexOf(ch); return (Math.floor(i / 5) + 1) + '' + ((i % 5) + 1);
      }).join(' '),
      decode: t => {
        const nums = t.replace(/[^1-5]/g, ''); let r = '';
        for (let i = 0; i < nums.length; i += 2) {
          const row = parseInt(nums[i]) - 1, col = parseInt(nums[i + 1]) - 1;
          if (row >= 0 && row < 5 && col >= 0 && col < 5) r += grid[row * 5 + col];
        }
        return r;
      }
    };
  })();

  /* ─── 4. Homophonic Substitution ─── */
  const homophonic = (() => {
    const freq = { E: 13, T: 9, A: 8, O: 8, I: 7, N: 7, S: 6, H: 6, R: 6, D: 4, L: 4, C: 3, U: 3, M: 3, W: 2, F: 2, G: 2, Y: 2, P: 2, B: 1, V: 1, K: 1, J: 1, X: 1, Q: 1, Z: 1 };
    function buildTable(seed) {
      const table = {}; let n = 10;
      const rng = (s => () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s; })(seed || 42);
      for (const ch of A) {
        const count = freq[ch] || 1;
        table[ch] = [];
        for (let i = 0; i < count; i++) table[ch].push(String(n++).padStart(2, '0'));
      }
      return table;
    }
    return {
      encode: (text, key) => {
        const seed = clean(key || 'KEY').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
        const table = buildTable(seed);
        const rng = (s => () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s; })(seed);
        return clean(text).split('').map(ch => {
          const opts = table[ch];
          return opts ? opts[Math.abs(rng()) % opts.length] : '??';
        }).join(' ');
      },
      decode: (text, key) => {
        const seed = clean(key || 'KEY').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
        const table = buildTable(seed);
        const rev = {};
        for (const [ch, codes] of Object.entries(table)) for (const code of codes) rev[code] = ch;
        return (String(text).match(/\d+/g) || []).map(code => rev[code] || '?').join('');
      }
    };
  })();

  /* ─── 5. Playfair ─── */
  const playfair = (() => {
    function makeGrid(key) {
      const k = clean(key || 'MONARCHY').replace(/J/g, 'I');
      const seen = new Set(); let grid = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); grid += c; }
      for (const c of A) if (c !== 'J' && !seen.has(c)) grid += c;
      return grid;
    }
    function pos(grid, ch) { const i = grid.indexOf(ch); return [Math.floor(i / 5), i % 5]; }
    function pairs(text) {
      // Filler is X, except when the letter needing a filler IS X — then use Q,
      // since a same-letter digraph (X,X) cannot be enciphered by Playfair rules.
      let t = escapeFillers(clean(text).replace(/J/g, 'I')), p = [], i = 0;
      while (i < t.length) {
        const a = t[i];
        const b = (i + 1 < t.length && t[i + 1] !== a) ? t[++i] : (a === 'X' ? 'Q' : 'X');
        p.push([a, b]); i++;
      }
      return p;
    }
    function process(ps, grid, enc) {
      const d = enc ? 1 : 4;
      return ps.map(([a, b]) => {
        const [ra, ca] = pos(grid, a), [rb, cb] = pos(grid, b);
        if (ra === rb) return grid[ra * 5 + (ca + d) % 5] + grid[rb * 5 + (cb + d) % 5];
        if (ca === cb) return grid[((ra + d) % 5) * 5 + ca] + grid[((rb + d) % 5) * 5 + cb];
        return grid[ra * 5 + cb] + grid[rb * 5 + ca];
      }).join('');
    }
    return {
      encode: (t, k) => process(pairs(t), makeGrid(k), true),
      decode: (t, k) => {
        // Ciphertext is already valid digraphs — split it straight. Running it
        // through pairs() would inject filler letters INTO the ciphertext
        // whenever it happens to contain an aligned doubled letter.
        const c = clean(t).replace(/J/g, 'I');
        const ps = [];
        for (let i = 0; i + 1 < c.length; i += 2) ps.push([c[i], c[i + 1]]);
        const raw = process(ps, makeGrid(k), false);
        // Literal X and Q are escaped before encryption, so X is unambiguously
        // structural here: it either separates a doubled letter or pads the end.
        let out = '';
        for (let i = 0; i < raw.length; i++) {
          const ch = raw[i];
          const filler = i % 2 === 1 && i < raw.length - 1 && raw[i - 1] === raw[i + 1] && ch === 'X';
          if (filler) continue;
          out += ch;
        }
        if (out.endsWith('X')) out = out.slice(0, -1);
        return unescapeFillers(out);
      }
    };
  })();

  /* ─── 6. Hill ─── */
  const hill = (() => {
    function modInv(a, m) { a = mod(a, m); for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x; return -1; }
    return {
      encode: (text, keyStr) => {
        const t = escapeFillers(clean(text)); const k = (keyStr || '3,3,2,5').split(',').map(Number);
        if (k.length < 4 || k.some(v => !Number.isFinite(v))) return 'Need 4 numbers (2x2 matrix)';
        if (modInv(mod(k[0] * k[3] - k[1] * k[2], 26), 26) < 0) return 'Matrix not invertible mod 26';
        const padded = t.length % 2 ? t + 'X' : t; let r = '';
        for (let i = 0; i < padded.length; i += 2) {
          const p0 = padded.charCodeAt(i) - 65, p1 = padded.charCodeAt(i + 1) - 65;
          r += A[mod(k[0] * p0 + k[1] * p1, 26)] + A[mod(k[2] * p0 + k[3] * p1, 26)];
        }
        return r;
      },
      decode: (text, keyStr) => {
        const t = clean(text); const k = (keyStr || '3,3,2,5').split(',').map(Number);
        if (k.length < 4) return 'Need 4 numbers';
        const det = mod(k[0] * k[3] - k[1] * k[2], 26); const di = modInv(det, 26);
        if (di < 0) return 'Matrix not invertible mod 26';
        const inv = [mod(k[3] * di, 26), mod(-k[1] * di, 26), mod(-k[2] * di, 26), mod(k[0] * di, 26)];
        let r = '';
        for (let i = 0; i + 1 < t.length; i += 2) {
          const c0 = t.charCodeAt(i) - 65, c1 = t.charCodeAt(i + 1) - 65;
          r += A[mod(inv[0] * c0 + inv[1] * c1, 26)] + A[mod(inv[2] * c0 + inv[3] * c1, 26)];
        }
        if (r.endsWith('X')) r = r.slice(0, -1);
        return unescapeFillers(r);
      }
    };
  })();

  /* ─── 7. Vigenère ─── */
  const vigenere = (() => {
    function run(text, key, enc) {
      const t = clean(text), k = clean(key) || 'KEY'; let r = '';
      for (let i = 0; i < t.length; i++) {
        const p = t.charCodeAt(i) - 65, ki = k.charCodeAt(i % k.length) - 65;
        r += A[enc ? mod(p + ki, 26) : mod(p - ki, 26)];
      }
      return r;
    }
    return { encode: (t, k) => run(t, k, true), decode: (t, k) => run(t, k, false) };
  })();

  /* ─── 8. Beaufort ─── */
  const beaufort = (() => {
    function run(text, key) {
      const t = clean(text), k = clean(key) || 'KEY'; let r = '';
      for (let i = 0; i < t.length; i++) {
        const p = t.charCodeAt(i) - 65, ki = k.charCodeAt(i % k.length) - 65;
        r += A[mod(ki - p, 26)];
      }
      return r;
    }
    return { encode: run, decode: run };
  })();

  /* ─── 9. Gronsfeld ─── */
  const gronsfeld = (() => {
    function run(text, key, enc) {
      const t = clean(text), k = (key || '31415').replace(/[^0-9]/g, '') || '0'; let r = '';
      for (let i = 0; i < t.length; i++) {
        const p = t.charCodeAt(i) - 65, ki = parseInt(k[i % k.length]);
        r += A[enc ? mod(p + ki, 26) : mod(p - ki, 26)];
      }
      return r;
    }
    return { encode: (t, k) => run(t, k, true), decode: (t, k) => run(t, k, false) };
  })();

  /* ─── 10. Porta ─── */
  const porta = (() => {
    const tableaux = [
      'NOPQRSTUVWXYZABCDEFGHIJKLM', 'OPQRSTUVWXYZNMABCDEFGHIJKL',
      'PQRSTUVWXYZNOLMABCDEFGHIJK', 'QRSTUVWXYZNOPKLMABCDEFGHIJ',
      'RSTUVWXYZNOPQJKLMABCDEFGHI', 'STUVWXYZNOPQRIJKLMABCDEFGH',
      'TUVWXYZNOPQRSHIJKLMABCDEFG', 'UVWXYZNOPQRSTGHIJKLMABCDEF',
      'VWXYZNOPQRSTUFGHIJKLMABCDE', 'WXYZNOPQRSTUVEFGHIJKLMABCD',
      'XYZNOPQRSTUVWDEFGHIJKLMABC', 'YZNOPQRSTUVWXCDEFGHIJKLMAB',
      'ZNOPQRSTUVWXYBCDEFGHIJKLMA'
    ];
    function run(text, key) {
      const t = clean(text), k = clean(key || 'KEY') || 'KEY'; let r = '';
      for (let i = 0; i < t.length; i++) {
        const ki = Math.floor((k.charCodeAt(i % k.length) - 65) / 2);
        const row = tableaux[ki % 13];
        const p = t.charCodeAt(i) - 65;
        r += row[p];
      }
      return r;
    }
    return { encode: run, decode: run };
  })();

  /* ─── 11. Running Key ─── */
  const runningKey = (() => {
    const defaultKey = 'WE HOLD THESE TRUTHS TO BE SELF EVIDENT THAT ALL MEN ARE CREATED EQUAL';
    function run(text, key, enc) {
      const t = clean(text), k = clean(key) || clean(defaultKey); let r = '';
      for (let i = 0; i < t.length; i++) {
        const p = t.charCodeAt(i) - 65, ki = k.charCodeAt(i % k.length) - 65;
        r += A[enc ? mod(p + ki, 26) : mod(p - ki, 26)];
      }
      return r;
    }
    return { encode: (t, k) => run(t, k, true), decode: (t, k) => run(t, k, false) };
  })();

  /* ─── 12. Rail Fence ─── */
  const railFence = (() => ({
    encode: (text, key) => {
      const t = clean(text), rails = boundedInt(key, 3, 2, 10000);
      const fence = Array.from({ length: rails }, () => []);
      let rail = 0, dir = 1;
      for (const ch of t) {
        fence[rail].push(ch);
        if (rail === 0) dir = 1; else if (rail === rails - 1) dir = -1;
        rail += dir;
      }
      return fence.flat().join('');
    },
    decode: (text, key) => {
      const t = clean(text), n = t.length, rails = boundedInt(key, 3, 2, 10000);
      const pattern = Array(n); let rail = 0, dir = 1;
      for (let i = 0; i < n; i++) {
        pattern[i] = rail;
        if (rail === 0) dir = 1; else if (rail === rails - 1) dir = -1;
        rail += dir;
      }
      const result = Array(n); let pos = 0;
      for (let r = 0; r < rails; r++)
        for (let i = 0; i < n; i++) if (pattern[i] === r) result[i] = t[pos++];
      return result.join('');
    }
  }))();

  /* ─── 13. Columnar Transposition ─── */
  const columnar = (() => {
    function order(key) {
      return clean(key || 'ZEBRA').split('').map((ch, i) => ({ ch, i }))
        .sort((a, b) => a.ch === b.ch ? a.i - b.i : a.ch.localeCompare(b.ch)).map(x => x.i);
    }
    return {
      encode: (text, key) => {
        // Classical columnar transposition: ragged columns, NO pad characters.
        // This is what makes round-trips lossless and lets double-transposition compose cleanly.
        const t = clean(text), k = clean(key || 'ZEBRA'), cols = k.length;
        if (!cols || !t.length) return t;
        const cells = Array.from({ length: cols }, () => '');
        for (let i = 0; i < t.length; i++) cells[i % cols] += t[i];
        const o = order(key);
        return o.map(c => cells[c]).join('');
      },
      decode: (text, key) => {
        const t = clean(text), k = clean(key || 'ZEBRA'), cols = k.length;
        if (!cols || !t.length) return t;
        const rows = Math.ceil(t.length / cols), o = order(key);
        // Columns whose ORIGINAL index < (t.length % cols) are full (rows chars);
        // the rest are short by 1. When t.length divides cols, all are full.
        const rem = t.length % cols;
        const colLens = Array.from({ length: cols }, (_, c) => (rem === 0 || c < rem) ? rows : rows - 1);
        const cells = {}; let pos = 0;
        for (const c of o) { cells[c] = t.substr(pos, colLens[c]); pos += colLens[c]; }
        let r = '';
        for (let row = 0; row < rows; row++)
          for (let c = 0; c < cols; c++)
            if (row < cells[c].length) r += cells[c][row];
        return r;
      }
    };
  })();

  /* ─── 14. Double Transposition ─── */
  const doubleTransposition = (() => ({
    encode: (text, key) => {
      const keys = (key || 'FIRST,SECOND').split(',').map(k => k.trim());
      let t = columnar.encode(text, keys[0] || 'FIRST');
      return columnar.encode(t, keys[1] || 'SECOND');
    },
    decode: (text, key) => {
      const keys = (key || 'FIRST,SECOND').split(',').map(k => k.trim());
      let t = columnar.decode(text, keys[1] || 'SECOND');
      return columnar.decode(t, keys[0] || 'FIRST');
    }
  }))();

  /* ─── 15. Bacon's Cipher ─── */
  const bacon = (() => {
    const alpha = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
    return {
      encode: t => clean(t).replace(/J/g, 'I').split('').map(ch => {
        const i = alpha.indexOf(ch);
        return i >= 0 ? i.toString(2).padStart(5, '0').replace(/0/g, 'A').replace(/1/g, 'B') : '?????';
      }).join(' '),
      decode: t => {
        const ab = t.replace(/[^ABab]/g, '').toUpperCase(); let r = '';
        for (let i = 0; i + 4 < ab.length; i += 5) {
          const v = parseInt(ab.substr(i, 5).replace(/A/g, '0').replace(/B/g, '1'), 2);
          if (v >= 0 && v < 25) r += alpha[v];
        }
        return r;
      }
    };
  })();

  /* ─── 16. Tap Code ─── */
  const tapCode = (() => {
    const grid = 'ABCDEFGHIJLMNOPQRSTUVWXYZ';
    return {
      encode: t => clean(t).replace(/K/g, 'C').split('').map(ch => {
        const i = grid.indexOf(ch); if (i < 0) return '';
        return '.'.repeat(Math.floor(i / 5) + 1) + ' ' + '.'.repeat((i % 5) + 1);
      }).join('   '),
      decode: t => {
        return t.trim().split(/\s{2,}/).map(g => {
          const parts = g.trim().split(/\s+/);
          if (parts.length < 2) return '';
          const r = (parts[0].match(/\./g) || []).length - 1;
          const c = (parts[1].match(/\./g) || []).length - 1;
          return (r >= 0 && r < 5 && c >= 0 && c < 5) ? grid[r * 5 + c] : '';
        }).join('');
      }
    };
  })();

  /* ─── 17. Pigpen ─── */
  const pigpen = (() => {
    const symbols = {
      A: '⌐', B: '┴', C: '¬', D: '├', E: '┼', F: '┤',
      G: '┌', H: '┬', I: '┐', J: '⌐•', K: '┴•', L: '¬•',
      M: '├•', N: '┼•', O: '┤•', P: '┌•', Q: '┬•', R: '┐•',
      S: '╲', T: '╳', U: '╱', V: '╲•', W: '╳•', X: '╱•',
      Y: '▽', Z: '△'
    };
    const rev = {};
    for (const [k, v] of Object.entries(symbols)) rev[v] = k;
    return {
      encode: t => clean(t).split('').map(ch => symbols[ch] || ch).join(' '),
      decode: t => t.split(/\s+/).map(s => rev[s] || s).join('')
    };
  })();

  /* ─── 18. Bifid ─── */
  const bifid = (() => {
    function makeGrid(key) {
      const k = clean(key || 'SECRET').replace(/J/g, 'I');
      const seen = new Set(); let grid = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); grid += c; }
      for (const c of A) if (c !== 'J' && !seen.has(c)) grid += c;
      return grid;
    }
    function pos(grid, ch) { const i = grid.indexOf(ch === 'J' ? 'I' : ch); return [Math.floor(i / 5), i % 5]; }
    return {
      encode: (text, key) => {
        const t = clean(text).replace(/J/g, 'I'), grid = makeGrid(key);
        const rows = [], cols = [];
        for (const ch of t) { const [r, c] = pos(grid, ch); rows.push(r); cols.push(c); }
        const combined = [...rows, ...cols]; let result = '';
        for (let i = 0; i < combined.length; i += 2) result += grid[combined[i] * 5 + combined[i + 1]];
        return result;
      },
      decode: (text, key) => {
        const t = clean(text).replace(/J/g, 'I'), grid = makeGrid(key);
        const coords = [];
        for (const ch of t) { const [r, c] = pos(grid, ch); coords.push(r, c); }
        const half = coords.length / 2;
        const rows = coords.slice(0, half), cols = coords.slice(half);
        let result = '';
        for (let i = 0; i < half; i++) result += grid[rows[i] * 5 + cols[i]];
        return result;
      }
    };
  })();

  /* ─── 19. Trifid ─── */
  const trifid = (() => {
    const alpha27 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ+';
    function makeGrid(key) {
      const k = clean(key || 'FELIX') + '+'; const seen = new Set(); let grid = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); grid += c; }
      for (const c of alpha27) if (!seen.has(c)) grid += c;
      return grid;
    }
    function pos(grid, ch) {
      const i = grid.indexOf(ch === ' ' ? '+' : ch);
      return [Math.floor(i / 9), Math.floor((i % 9) / 3), i % 3];
    }
    return {
      encode: (text, key, period) => {
        const t = clean(text).replace(/[^A-Z]/g, ''), grid = makeGrid(key);
        const per = parseInt(period) || 5;
        let result = '';
        for (let s = 0; s < t.length; s += per) {
          const block = t.substr(s, per);
          const layers = [[], [], []];
          for (const ch of block) { const [l, r, c] = pos(grid, ch); layers[0].push(l); layers[1].push(r); layers[2].push(c); }
          const flat = [...layers[0], ...layers[1], ...layers[2]];
          for (let i = 0; i + 2 < flat.length; i += 3) result += grid[flat[i] * 9 + flat[i + 1] * 3 + flat[i + 2]];
        }
        return result;
      },
      decode: (text, key, period) => {
        // Trifid alphabet includes '+' so we cannot use the global clean() which strips non-letters.
        const t = (text || '').toUpperCase().replace(/[^A-Z+]/g, ''), grid = makeGrid(key), per = parseInt(period) || 5;
        let result = '';
        for (let s = 0; s < t.length; s += per) {
          const block = t.substr(s, per), blen = block.length;
          const coords = [];
          for (const ch of block) { const [l, r, c] = pos(grid, ch); coords.push(l, r, c); }
          const third = blen;
          const layers = [coords.slice(0, third), coords.slice(third, third * 2), coords.slice(third * 2)];
          for (let i = 0; i < blen; i++) result += grid[layers[0][i] * 9 + layers[1][i] * 3 + layers[2][i]];
        }
        return result;
      }
    };
  })();

  /* ─── 20. ADFGX ─── */
  const adfgx = (() => {
    const letters = 'ADFGX';
    function makeGrid(key) {
      const k = clean(key || 'PRIVACY').replace(/J/g, 'I');
      const seen = new Set(); let grid = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); grid += c; }
      for (const c of A) if (c !== 'J' && !seen.has(c)) grid += c;
      return grid;
    }
    return {
      encode: (text, key) => {
        const keys = (key || 'PRIVACY,GERMAN').split(',');
        const grid = makeGrid(keys[0]);
        const t = clean(text).replace(/J/g, 'I');
        let fractionated = '';
        for (const ch of t) {
          const i = grid.indexOf(ch);
          fractionated += letters[Math.floor(i / 5)] + letters[i % 5];
        }
        return columnar.encode(fractionated, keys[1] || 'GERMAN');
      },
      decode: (text, key) => {
        const keys = (key || 'PRIVACY,GERMAN').split(',');
        const grid = makeGrid(keys[0]);
        const fractionated = columnar.decode(clean(text), keys[1] || 'GERMAN');
        let result = '';
        for (let i = 0; i + 1 < fractionated.length; i += 2) {
          const r = letters.indexOf(fractionated[i]), c = letters.indexOf(fractionated[i + 1]);
          if (r >= 0 && c >= 0) result += grid[r * 5 + c];
        }
        return result;
      }
    };
  })();

  /* ─── 21. ADFGVX ─── */
  const adfgvx = (() => {
    const letters = 'ADFGVX';
    const alpha36 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    function makeGrid(key) {
      const k = (key || 'PRIVACY').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const seen = new Set(); let grid = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); grid += c; }
      for (const c of alpha36) if (!seen.has(c)) grid += c;
      return grid;
    }
    return {
      encode: (text, key) => {
        const keys = (key || 'PRIVACY,GERMAN').split(',');
        const grid = makeGrid(keys[0]);
        const t = cleanAlphanumeric(text);
        let fractionated = '';
        for (const ch of t) {
          const i = grid.indexOf(ch);
          if (i >= 0) fractionated += letters[Math.floor(i / 6)] + letters[i % 6];
        }
        return columnar.encode(fractionated, keys[1] || 'GERMAN');
      },
      decode: (text, key) => {
        const keys = (key || 'PRIVACY,GERMAN').split(',');
        const grid = makeGrid(keys[0]);
        const fractionated = columnar.decode(clean(text), keys[1] || 'GERMAN');
        let result = '';
        for (let i = 0; i + 1 < fractionated.length; i += 2) {
          const r = letters.indexOf(fractionated[i]), c = letters.indexOf(fractionated[i + 1]);
          if (r >= 0 && c >= 0) result += grid[r * 6 + c];
        }
        return result;
      }
    };
  })();

  /* ─── 22. Nihilist ─── */
  const nihilist = (() => {
    function makeGrid(key) {
      const k = clean(key || 'RUSSIAN').replace(/J/g, 'I');
      const seen = new Set(); let grid = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); grid += c; }
      for (const c of A) if (c !== 'J' && !seen.has(c)) grid += c;
      return grid;
    }
    function toNum(grid, ch) {
      const i = grid.indexOf(ch === 'J' ? 'I' : ch);
      return (Math.floor(i / 5) + 1) * 10 + (i % 5) + 1;
    }
    function fromNum(grid, n) {
      const r = Math.floor(n / 10) - 1, c = (n % 10) - 1;
      return (r >= 0 && r < 5 && c >= 0 && c < 5) ? grid[r * 5 + c] : '?';
    }
    return {
      encode: (text, key) => {
        const keys = (key || 'RUSSIAN,KEY').split(',');
        const grid = makeGrid(keys[0]), kw = clean(keys[1] || 'KEY').replace(/J/g, 'I');
        return clean(text).replace(/J/g, 'I').split('').map((ch, i) => {
          return toNum(grid, ch) + toNum(grid, kw[i % kw.length]);
        }).join(' ');
      },
      decode: (text, key) => {
        if (!String(text).trim()) return '';
        const keys = (key || 'RUSSIAN,KEY').split(',');
        const grid = makeGrid(keys[0]), kw = clean(keys[1] || 'KEY').replace(/J/g, 'I');
        return text.trim().split(/\s+/).map((n, i) => {
          const v = parseInt(n) - toNum(grid, kw[i % kw.length]);
          return fromNum(grid, v);
        }).join('');
      }
    };
  })();

  /* ─── 23. One-Time Pad ─── */
  const otp = (() => ({
    encode: (text, key) => {
      const t = clean(text);
      const userKey = clean(key || '');
      let k = userKey;
      let autoGenerated = false;
      if (k.length > 0 && k.length < t.length) return 'Key must be at least as long as message';
      if (!k.length && t.length) {
        autoGenerated = true;
        k = secureRandomLetters(t.length);
      }
      let r = '';
      for (let i = 0; i < t.length; i++) r += A[mod(t.charCodeAt(i) - 65 + k.charCodeAt(i) - 65, 26)];
      // Only annotate with the auto-generated key so encode() output is clean ciphertext when the user supplied a sufficient key.
      return autoGenerated ? r + '\n[Key: ' + k.substr(0, t.length) + ']' : r;
    },
    decode: (text, key) => {
      // Tolerate annotated ciphertext by stripping any trailing "[Key: ...]" annotation.
      const raw = (text || '').replace(/\n?\[Key:[^\]]*\]\s*$/i, '');
      const t = clean(raw), k = clean(key || '');
      if (k.length < t.length) return 'Key must be at least as long as message';
      let r = '';
      for (let i = 0; i < t.length; i++) r += A[mod(t.charCodeAt(i) - 65 - (k.charCodeAt(i) - 65), 26)];
      return r;
    }
  }))();

  /* Option A (audit remediation): VENONA uses a dedicated pad-reuse XOR demo engine, not generic otp. */
  /* ─── 23b. VENONA Pad-Reuse (5-bit XOR over A-Z) ─── */
  const venonaPadReuse = (() => {
    const ALPHA32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    function cleanAlpha26(text) {
      return clean(text);
    }

    function cleanAlpha32(text) {
      return (text || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
    }

    function toVal(ch) {
      const idx = ALPHA32.indexOf(ch);
      return idx >= 0 ? idx : 0;
    }

    function toGlyph(v) {
      return ALPHA32[mod(v, 32)];
    }

    function xorStream(left, right) {
      const len = Math.min(left.length, right.length);
      let out = '';
      for (let i = 0; i < len; i++) out += toGlyph(toVal(left[i]) ^ toVal(right[i]));
      return out;
    }

    function scoreNaturalAlpha(fragment) {
      if (!fragment) return 0;
      let good = 0;
      for (let i = 0; i < fragment.length; i++) {
        const code = fragment.charCodeAt(i);
        if (code >= 65 && code <= 90) good++;
      }
      return good / fragment.length;
    }

    return {
      encode: (text, key) => {
        const t = cleanAlpha26(text);
        const k = cleanAlpha26(key || 'XMCKL');
        if (!k.length) return 'Key required';
        let out = '';
        for (let i = 0; i < t.length; i++) {
          const pv = t.charCodeAt(i) - 65;
          const kv = k.charCodeAt(i % k.length) - 65;
          out += toGlyph(pv ^ kv);
        }
        return out;
      },
      decode: (text, key) => {
        const t = cleanAlpha32(text);
        const k = cleanAlpha26(key || 'XMCKL');
        if (!k.length) return 'Key required';
        let out = '';
        for (let i = 0; i < t.length; i++) {
          const cv = toVal(t[i]);
          const kv = k.charCodeAt(i % k.length) - 65;
          const pv = cv ^ kv;
          out += (pv >= 0 && pv < 26) ? A[pv] : '·';
        }
        return out;
      },
      combineCiphertexts: (cipherA, cipherB) => {
        return xorStream(cleanAlpha32(cipherA), cleanAlpha32(cipherB));
      },
      cribAtPosition: (cipherA, cipherB, crib, position) => {
        const combined = xorStream(cleanAlpha32(cipherA), cleanAlpha32(cipherB));
        const c = cleanAlpha26(crib);
        const pos = Math.max(0, parseInt(position, 10) || 0);
        let other = '';
        for (let i = 0; i < c.length && (pos + i) < combined.length; i++) {
          const vv = toVal(combined[pos + i]) ^ (c.charCodeAt(i) - 65);
          other += (vv >= 0 && vv < 26) ? A[vv] : '·';
        }
        return {
          position: pos,
          crib: c,
          otherPlaintextFragment: other,
          combinedStream: combined,
          confidence: scoreNaturalAlpha(other)
        };
      },
      scanCribPositions: (cipherA, cipherB, crib) => {
        const combined = xorStream(cleanAlpha32(cipherA), cleanAlpha32(cipherB));
        const c = cleanAlpha26(crib);
        const max = Math.max(0, combined.length - c.length);
        const rows = [];
        for (let pos = 0; pos <= max; pos++) {
          let other = '';
          for (let i = 0; i < c.length && (pos + i) < combined.length; i++) {
            const vv = toVal(combined[pos + i]) ^ (c.charCodeAt(i) - 65);
            other += (vv >= 0 && vv < 26) ? A[vv] : '·';
          }
          rows.push({
            position: pos,
            crib: c,
            otherPlaintextFragment: other,
            combinedStream: combined,
            confidence: scoreNaturalAlpha(other)
          });
        }
        return rows;
      }
    };
  })();

  /* ─── 24. Fractionated Morse ─── */
  const fractionatedMorse = (() => {
    const morseMap = {
      A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
      I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
      Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
      Y: '-.--', Z: '--..'
    };
    const triMap = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    function makeSubst(key) {
      const k = clean(key || 'ROUNDTABLE');
      const seen = new Set(); let alpha = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); alpha += c; }
      for (const c of A) if (!seen.has(c)) alpha += c;
      return alpha;
    }
    return {
      encode: (text, key) => {
        const t = clean(text), subst = makeSubst(key);
        let morse = t.split('').map(ch => morseMap[ch] || '').join('x');
        morse += 'x';
        while (morse.length % 3 !== 0) morse += 'x';
        const trigraphs = { '...': 0, '..-': 1, '..x': 2, '.-.': 3, '.--': 4, '.-x': 5,
          '.x.': 6, '.x-': 7, '.xx': 8, '-..': 9, '-.-': 10, '-.x': 11, '--.': 12,
          '---': 13, '--x': 14, '-x.': 15, '-x-': 16, '-xx': 17, 'x..': 18, 'x.-': 19,
          'x.x': 20, 'x-.': 21, 'x--': 22, 'x-x': 23, 'xx.': 24, 'xx-': 25, 'xxx': 26 };
        let result = '';
        for (let i = 0; i + 2 < morse.length; i += 3) {
          const tri = morse.substr(i, 3);
          const idx = trigraphs[tri];
          if (idx !== undefined && idx < 26) result += subst[idx];
        }
        return result;
      },
      decode: (text, key) => {
        const t = clean(text), subst = makeSubst(key);
        const revSubst = {};
        for (let i = 0; i < 26; i++) revSubst[subst[i]] = i;
        const trigraphKeys = ['...', '..-', '..x', '.-.', '.--', '.-x',
          '.x.', '.x-', '.xx', '-..', '-.-', '-.x', '--.', '---', '--x',
          '-x.', '-x-', '-xx', 'x..', 'x.-', 'x.x', 'x-.', 'x--', 'x-x',
          'xx.', 'xx-', 'xxx'];
        let morse = '';
        for (const ch of t) {
          const idx = revSubst[ch];
          if (idx !== undefined && idx < 27) morse += trigraphKeys[idx];
        }
        const revMorse = {};
        for (const [letter, code] of Object.entries(morseMap)) revMorse[code] = letter;
        const parts = morse.split('x');
        let result = '';
        for (const p of parts) {
          if (p && revMorse[p]) result += revMorse[p];
        }
        return result;
      }
    };
  })();

  /* ─── 25. Confederate Vigenère (Brass Cipher Disk) ─── */
  const confederateVigenere = (() => {
    const inner = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    function run(text, key, enc) {
      const t = clean(text), k = clean(key) || 'CONFEDERATE'; let r = '';
      for (let i = 0; i < t.length; i++) {
        const p = t.charCodeAt(i) - 65, ki = k.charCodeAt(i % k.length) - 65;
        r += A[enc ? mod(p + ki, 26) : mod(p - ki, 26)];
      }
      return r;
    }
    return { encode: (t, k) => run(t, k, true), decode: (t, k) => run(t, k, false) };
  })();

  /* ─── 26. Bazeries ─── */
  const bazeries = (() => {
    function numToWord(n) {
      const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
      const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
      const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
      if (n < 10) return ones[n]; if (n < 20) return teens[n - 10];
      return tens[Math.floor(n / 10)] + ones[n % 10];
    }
    return {
      encode: (text, key) => {
        const num = parseInt(key) || 42;
        const word = numToWord(Math.min(num, 99));
        const subst = monoalphabetic.encode(clean(text), word);
        const t = clean(subst), group = Math.max(2, Math.min(num % 7 + 2, 6));
        const blocks = [];
        for (let i = 0; i < t.length; i += group) blocks.push(t.substr(i, group).split('').reverse().join(''));
        return blocks.join('');
      },
      decode: (text, key) => {
        const num = parseInt(key) || 42;
        const word = numToWord(Math.min(num, 99));
        const t = clean(text), group = Math.max(2, Math.min(num % 7 + 2, 6));
        const blocks = [];
        for (let i = 0; i < t.length; i += group) blocks.push(t.substr(i, group).split('').reverse().join(''));
        return monoalphabetic.decode(blocks.join(''), word);
      }
    };
  })();

  /* ─── 27. Alberti Disk ─── */
  const alberti = (() => {
    const outer = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const inner = 'AZBYCXDWEVFUGTHSIRJQKPLOMN';
    function run(text, key, enc) {
      const shift = parseInt(key) || 3;
      const t = clean(text); let r = '', curShift = shift;
      for (let i = 0; i < t.length; i++) {
        if (enc) {
          const idx = outer.indexOf(t[i]);
          r += inner[mod(idx + curShift, 26)];
        } else {
          const idx = inner.indexOf(t[i]);
          r += outer[mod(idx - curShift, 26)];
        }
        if ((i + 1) % 4 === 0) curShift = mod(curShift + 1, 26);
      }
      return r;
    }
    return { encode: (t, k) => run(t, k, true), decode: (t, k) => run(t, k, false) };
  })();

  /* ─── 28. Jefferson Disk ─── */
  const jefferson = (() => {
    const disks = [
      'BQWJEZCTDMYSAHFLPIUKGRONXV', 'ZXSVCBQJGDMPLOEYWAKURHIFNT',
      'JOMHKQSEUPVGNTDCWBRYFLXAZI', 'SGBDQJFLNKHYCOMXEIWRVPUAZT',
      'VCREQTGNBDSKHYLJAXZMUOIPFW', 'KFZUYPWOBGTHSADLMJEIXNRCVQ',
      'PXKYGQETUSMRLZJIVWFHNDCBOA', 'MOQIHWFXCZADVJPLRSBUGNKYETS',
      'RZBQHFUYWJPVAXGONLEDTKMSCI', 'TBHPRICLZWQJVGNSEMDKFXOUYA',
      'XJKCRMQGIVHNASLBWEZTFDYOUP', 'UFJKDHGAQLMNZXRBPEYCSWVITO',
      'GLCBXQJFHZOYMVTPWNIUDRSAKE', 'WHQDUMEYPNIFJZARXLTOCSVGKB',
      'JDVFATBSMCPZYKUOWENRHGQLXI', 'TMNFQXZLHKAWBUIVRGDSPECYOJ',
      'OYQBFHMCZKTIJAPGLEDSRUXNWV', 'YXTQLJDZWKFVSRMPGOBIAUNCHE',
      'CSKDLHQRGBJMWZXIPVTOYFNUAE', 'LDBJITMWPFGVUYCNHSAOXQREKZ',
      'BFQEMYIRZAKOWJHCTSVDNLGPUX', 'NOQIFYJWGRHUBLPXDTSKZACMVE',
      'AXHDMQGZNRJFYVPBCWSLTEUIOK', 'WRNEIBKDGFQZJVOMSLHTUPYCXA',
      'QUIBEPJMDFSVYTZLGORWKANCXH', 'EAHFZICVWXYBKRLMDTSJGPNUOQ'
    ];
    return {
      encode: (text, key) => {
        const t = clean(text);
        const order = (key || '').replace(/[^0-9,]/g, '').split(',').map(Number).filter(n => n > 0 && n <= 26);
        const diskOrder = order.length >= 2 ? order.map(n => n - 1) : Array.from({ length: 26 }, (_, i) => i);
        const offset = 1;
        let r = '';
        for (let i = 0; i < t.length; i++) {
          const disk = disks[diskOrder[i % diskOrder.length]];
          const pos = disk.indexOf(t[i]);
          r += disk[(pos + offset) % 26];
        }
        return r;
      },
      decode: (text, key) => {
        const t = clean(text);
        const order = (key || '').replace(/[^0-9,]/g, '').split(',').map(Number).filter(n => n > 0 && n <= 26);
        const diskOrder = order.length >= 2 ? order.map(n => n - 1) : Array.from({ length: 26 }, (_, i) => i);
        const offset = 1;
        let r = '';
        for (let i = 0; i < t.length; i++) {
          const disk = disks[diskOrder[i % diskOrder.length]];
          const pos = disk.indexOf(t[i]);
          r += disk[mod(pos - offset, 26)];
        }
        return r;
      }
    };
  })();

  /* ─── 29. Enigma (Simplified 3-Rotor) ─── */
  const enigma = (() => {
    const rotors = [
      { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
      { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
      { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' }
    ];
    const reflectorB = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';
    function step(positions) {
      if (positions[1] === rotors[1].notch.charCodeAt(0) - 65) { positions[0]++; positions[1]++; }
      else if (positions[2] === rotors[2].notch.charCodeAt(0) - 65) positions[1]++;
      positions[2]++;
      for (let i = 0; i < 3; i++) positions[i] = mod(positions[i], 26);
    }
    function run(text, key) {
      const t = clean(text);
      const k = clean(key || 'AAA');
      const positions = [k.charCodeAt(0) - 65 || 0, k.charCodeAt(1) - 65 || 0, k.charCodeAt(2) - 65 || 0];
      let result = '';
      for (let i = 0; i < t.length; i++) {
        step(positions);
        let c = t.charCodeAt(i) - 65;
        for (let r = 2; r >= 0; r--) {
          c = mod(rotors[r].wiring.charCodeAt(mod(c + positions[r], 26)) - 65 - positions[r], 26);
        }
        c = reflectorB.charCodeAt(c) - 65;
        for (let r = 0; r < 3; r++) {
          const w = rotors[r].wiring;
          c = mod(w.indexOf(A[mod(c + positions[r], 26)]) - positions[r], 26);
        }
        result += A[c];
      }
      return result;
    }
    return { encode: run, decode: run };
  })();

  /* ─── 30. Lorenz (Simplified SZ40) ─── */
  const lorenz = (() => {
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const ita2 = {
      A:3, B:25, C:14, D:9, E:1, F:13, G:26, H:20, I:6, J:11, K:15,
      L:18, M:28, N:12, O:24, P:22, Q:23, R:10, S:5, T:16, U:7,
      V:30, W:19, X:29, Y:21, Z:17
    };
    const ita2Letters = Object.fromEntries(Object.entries(ita2).map(([letter, value]) => [value, letter]));
    function makeWheel(size, seed) {
      const bits = [];
      const rng = (s => () => { s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff; return (s >>> 30) & 1; })(seed & 0x7fffffff);
      for (let i = 0; i < size; i++) bits.push(rng());
      return bits;
    }
    function run(text, key, decrypt) {
      const input = decrypt
        ? String(text ?? '').toUpperCase().replace(/[^A-Z2-7]/g, '')
        : clean(text);
      const seed = clean(key || 'LORENZ').split('').reduce((s, c) => (Math.imul(s, 31) + c.charCodeAt(0)) & 0x7fffffff, 7);
      const chiLengths = [41, 31, 29, 26, 23];
      const psiLengths = [43, 47, 51, 53, 59];
      const chi = chiLengths.map((length, index) => makeWheel(length, seed + index));
      const psi = psiLengths.map((length, index) => makeWheel(length, seed + 5 + index));
      const motor37 = makeWheel(37, seed + 10);
      const motor61 = makeWheel(61, seed + 11);
      const chiPosition = [0, 0, 0, 0, 0];
      const psiPosition = [0, 0, 0, 0, 0];
      let motor37Position = 0;
      let motor61Position = 0;
      let result = '';
      for (const character of input) {
        let keyValue = 0;
        for (let bit = 0; bit < 5; bit++) {
          keyValue |= ((chi[bit][chiPosition[bit]] ^ psi[bit][psiPosition[bit]]) << bit);
        }
        const inputValue = decrypt ? glyphs.indexOf(character) : ita2[character];
        const outputValue = inputValue ^ keyValue;
        result += decrypt ? (ita2Letters[outputValue] || '·') : glyphs[outputValue];

        for (let bit = 0; bit < 5; bit++) {
          chiPosition[bit] = (chiPosition[bit] + 1) % chiLengths[bit];
        }
        const stepMotor61 = motor37[motor37Position] === 1;
        motor37Position = (motor37Position + 1) % motor37.length;
        if (stepMotor61) {
          const stepPsi = motor61[motor61Position] === 1;
          motor61Position = (motor61Position + 1) % motor61.length;
          if (stepPsi) {
            for (let bit = 0; bit < 5; bit++) {
              psiPosition[bit] = (psiPosition[bit] + 1) % psiLengths[bit];
            }
          }
        }
      }
      return result;
    }
    return {
      encode: (text, key) => run(text, key, false),
      decode: (text, key) => run(text, key, true)
    };
  })();

  /* ─── 31. Dictionary Code ─── */
  const dictionaryCode = (() => {
    const defaultText = 'We the People of the United States in Order to form a more perfect Union establish Justice insure domestic Tranquility provide for the common defence promote the general Welfare and secure the Blessings of Liberty to ourselves and our Posterity do ordain and establish this Constitution for the United States of America';
    function referenceWords(key) {
      const words = String(key ?? '').split(/\s+/).filter(word => /^[A-Za-z]/.test(word));
      return words.length ? words : defaultText.split(/\s+/);
    }
    return {
      encode: (text, key) => {
        const ref = referenceWords(key);
        const t = clean(text);
        const indices = [];
        for (const ch of t) {
          let found = false;
          for (let i = 0; i < ref.length; i++) {
            if (ref[i].toUpperCase().startsWith(ch)) { indices.push(i + 1); found = true; break; }
          }
          if (!found) indices.push('?');
        }
        return indices.join('-');
      },
      decode: (text, key) => {
        if (!String(text).trim()) return '';
        const ref = referenceWords(key);
        return text.split(/[-\s]+/).map(n => {
          const idx = parseInt(n) - 1;
          return (idx >= 0 && idx < ref.length) ? ref[idx][0].toUpperCase() : '?';
        }).join('');
      }
    };
  })();

  /* ─── 32. Stager (Route Cipher) ─── */
  const stager = (() => ({
    encode: (text, key) => {
      const t = escapeFillers(clean(text));
      const cols = boundedInt(key, 5, 2, 10000);
      const rows = Math.ceil(t.length / cols);
      const grid = [];
      let idx = 0;
      for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) grid[r][c] = idx < t.length ? t[idx++] : 'X';
      }
      let result = '', r = 0, c = 0, dir = 1;
      for (let col = 0; col < cols; col++) {
        if (col % 2 === 0) for (let row = 0; row < rows; row++) result += grid[row][col];
        else for (let row = rows - 1; row >= 0; row--) result += grid[row][col];
      }
      return result;
    },
    decode: (text, key) => {
      const t = clean(text);
      const cols = boundedInt(key, 5, 2, 10000);
      const rows = Math.ceil(t.length / cols);
      const grid = Array.from({ length: rows }, () => Array(cols).fill(''));
      let idx = 0;
      for (let col = 0; col < cols; col++) {
        if (col % 2 === 0) for (let row = 0; row < rows; row++) { if (idx < t.length) grid[row][col] = t[idx++]; }
        else for (let row = rows - 1; row >= 0; row--) { if (idx < t.length) grid[row][col] = t[idx++]; }
      }
      let result = '';
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) result += grid[r][c];
      return unescapeFillers(result.replace(/X+$/, ''));
    }
  }))();

  /* ─── 33. VIC Cipher (Simplified) ─── */
  const vic = (() => {
    function makeCheckerboard(key) {
      const k = clean(key || 'SNOWFALL').replace(/J/g, 'I');
      const seen = new Set(); let alpha = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); alpha += c; }
      for (const c of A) if (c !== 'J' && !seen.has(c)) alpha += c;
      const topRow = alpha.substr(0, 8);
      const map = {}; const rev = {};
      for (let i = 0; i < 8; i++) { map[topRow[i]] = String(i); rev[String(i)] = topRow[i]; }
      let code = 80;
      for (let i = 8; i < 25; i++) {
        const s = String(code + (i - 8) % 10);
        const actual = i < 18 ? '8' + ((i - 8)) : '9' + ((i - 18));
        map[alpha[i]] = actual;
        rev[actual] = alpha[i];
      }
      return { map, rev };
    }

    function chainDigits(key, length) {
      const source = clean(key || 'SNOWFALL') || 'SNOWFALL';
      const base = source.split('').map(ch => (ch.charCodeAt(0) - 64) % 10);
      const digits = Array.from({ length: 10 }, (_, index) => base[index % base.length]);
      for (let index = 0; digits.length < length; index++) {
        digits.push((digits[index] + digits[index + 1]) % 10);
      }
      return digits.slice(0, length);
    }

    function transpositionKeys(key) {
      const derived = chainDigits(key, 22);
      return [derived.slice(10, 15).join(''), derived.slice(15, 22).join('')];
    }

    function digitOrder(key) {
      return key.split('').map((digit, index) => ({ digit: Number(digit), index }))
        .sort((left, right) => left.digit - right.digit || left.index - right.index)
        .map(entry => entry.index);
    }

    function transpose(text, key) {
      if (!text) return '';
      const columns = Array.from({ length: key.length }, () => '');
      for (let index = 0; index < text.length; index++) columns[index % key.length] += text[index];
      return digitOrder(key).map(index => columns[index]).join('');
    }

    function untranspose(text, key) {
      if (!text) return '';
      const columnCount = key.length;
      const rows = Math.ceil(text.length / columnCount);
      const remainder = text.length % columnCount;
      const columns = Array(columnCount).fill('');
      let offset = 0;
      for (const index of digitOrder(key)) {
        const length = remainder === 0 || index < remainder ? rows : rows - 1;
        columns[index] = text.slice(offset, offset + length);
        offset += length;
      }
      let result = '';
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columnCount; column++) {
          if (row < columns[column].length) result += columns[column][row];
        }
      }
      return result;
    }

    function decodeCheckerboard(text, key) {
      const { rev } = makeCheckerboard(key);
      let result = '';
      for (let index = 0; index < text.length;) {
        if (rev[text[index]]) {
          result += rev[text[index]];
          index++;
        } else if (index + 1 < text.length && rev[text.slice(index, index + 2)]) {
          result += rev[text.slice(index, index + 2)];
          index += 2;
        } else {
          result += '?';
          index++;
        }
      }
      return result;
    }

    return {
      encode: (text, key) => {
        const { map } = makeCheckerboard(key);
        const checkerboard = clean(text).replace(/J/g, 'I').split('').map(ch => map[ch] || '').join('');
        const stream = chainDigits(key, checkerboard.length);
        const added = checkerboard.split('').map((digit, index) => (Number(digit) + stream[index]) % 10).join('');
        const [firstKey, secondKey] = transpositionKeys(key);
        return transpose(transpose(added, firstKey), secondKey);
      },
      decode: (text, key) => {
        const nums = text.replace(/[^0-9]/g, '');
        const [firstKey, secondKey] = transpositionKeys(key);
        const added = untranspose(untranspose(nums, secondKey), firstKey);
        const stream = chainDigits(key, added.length);
        const checkerboard = added.split('').map((digit, index) => mod(Number(digit) - stream[index], 10)).join('');
        return decodeCheckerboard(checkerboard, key);
      }
    };
  })();

  /* ─── 34. Scytale ─── */
  const scytale = (() => ({
    encode: (text, key) => {
      const t = escapeFillers(clean(text)), rows = boundedInt(key, 3, 2, 10000);
      const cols = Math.ceil(t.length / rows);
      const padded = t.padEnd(rows * cols, 'X');
      let r = '';
      for (let c = 0; c < cols; c++)
        for (let row = 0; row < rows; row++) r += padded[row * cols + c];
      return r;
    },
    decode: (text, key) => {
      const t = clean(text), rows = boundedInt(key, 3, 2, 10000);
      const cols = Math.ceil(t.length / rows);
      const padded = t.padEnd(rows * cols, 'X');
      let r = '';
      for (let row = 0; row < rows; row++)
        for (let c = 0; c < cols; c++) r += padded[c * rows + row];
      return unescapeFillers(r.replace(/X+$/, ''));
    }
  }))();

  /* ─── 35. Vernam (XOR) ─── */
  const vernam = (() => {
    function parseKey(key) {
      const raw = String(key ?? '');
      if (/^hex:/i.test(raw)) {
        const hex = raw.slice(4).replace(/\s+/g, '');
        if (!/^(?:[0-9a-f]{2})*$/i.test(hex)) return null;
        return Uint8Array.from(hex.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []);
      }
      return Uint8Array.from(clean(raw).split('').map(ch => ch.charCodeAt(0)));
    }

    return {
      encode: (text, key) => {
        const plaintext = clean(text);
        const plainBytes = Uint8Array.from(plaintext.split('').map(ch => ch.charCodeAt(0)));
        let keyBytes = parseKey(key);
        if (keyBytes === null) return 'Key must be text or hex:<bytes>';
        let generatedKey = '';
        if (keyBytes.length > 0 && keyBytes.length < plainBytes.length) return 'Key must be at least as long as message';
        if (!keyBytes.length && plainBytes.length) {
          generatedKey = secureRandomLetters(plainBytes.length);
          keyBytes = parseKey(generatedKey);
        }
        const ciphertext = Array.from(plainBytes, (byte, index) => (byte ^ keyBytes[index]).toString(16).padStart(2, '0')).join('');
        return generatedKey ? ciphertext + '\n[Key: ' + generatedKey + ']' : ciphertext;
      },
      decode: (text, key) => {
        const source = String(text ?? '');
        const annotation = source.match(/\n?\[Key:\s*([^\]]+)\]\s*$/i);
        const raw = source.replace(/\n?\[Key:[^\]]*\]\s*$/i, '').replace(/\s+/g, '');
        if (!/^(?:[0-9a-f]{2})*$/i.test(raw)) return 'Ciphertext must be hexadecimal bytes';
        const cipherBytes = Uint8Array.from(raw.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []);
        const keyBytes = parseKey(key || annotation?.[1] || '');
        if (keyBytes === null) return 'Key must be text or hex:<bytes>';
        if (keyBytes.length < cipherBytes.length) return 'Key must be at least as long as message';
        return Array.from(cipherBytes, (byte, index) => String.fromCharCode(byte ^ keyBytes[index])).join('');
      }
    };
  })();

  /* ─── 38. Great Cipher (Grand Chiffre des Rossignols) ─── */
  // Syllable-based nomenclator used by Antoine & Bonaventure Rossignol
  // for Louis XIV (~1626). Unbroken for 200 years until Étienne Bazeries
  // cracked it in 1893. Famous features modeled here:
  //   • Most numbers stand for syllables (not single letters)
  //   • Some numbers are NULLS (decoy — ignored on decode)
  //   • One special number means "delete the previous letter" — a trap
  //     that fooled codebreakers for two centuries
  const greatCipher = (() => {
    // 50 of the most common English/French digrams + syllables
    const SYLL = [
      'TH','HE','IN','ER','AN','RE','ON','AT','EN','ND',
      'ES','OR','TE','OF','ED','IS','IT','AL','AR','ST',
      'TO','NT','NG','SE','HA','AS','OU','IO','LE','VE',
      'CO','ME','DE','HI','RI','RO','IC','NE','EA','RA',
      'CE','LI','CH','LL','BE','MA','SI','OM','UR','CA'
    ];
    const SINGLES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const NULL = '__NULL__';
    const TRAP = '__DEL__'; // "delete the previous letter" — Bazeries' breakthrough
    // 50 syllables + 26 singles + 6 nulls + 1 trap = 83 codewords (numbers 100–182)
    const TOKENS = [...SYLL, ...SINGLES, NULL, NULL, NULL, NULL, NULL, NULL, TRAP];

    function buildTable(seed) {
      const k = (clean(seed || 'ROI') + 'LOUISXIV');
      let s = 0;
      for (let i = 0; i < k.length; i++) s = (s * 131 + k.charCodeAt(i)) & 0x7fffffff;
      if (s === 0) s = 1;
      const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
      const nums = TOKENS.map((_, i) => 100 + i);
      // Fisher–Yates shuffle, deterministic from seed
      for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
      }
      const enc = {}, dec = {}, nulls = [];
      TOKENS.forEach((tok, i) => {
        const n = nums[i];
        dec[n] = tok;
        if (tok === NULL) { nulls.push(n); }
        else { (enc[tok] = enc[tok] || []).push(n); }
      });
      return { enc, dec, nulls };
    }

    return {
      encode: (text, key) => {
        const t = clean(text);
        if (!t) return '';
        const { enc, nulls } = buildTable(key);
        // Sort syllables longest-first for greedy match
        const sortedSyll = SYLL.slice().sort((a, b) => b.length - a.length);
        let s = 0;
        const k2 = (clean(key || 'ROI') + 'BOURBON');
        for (let i = 0; i < k2.length; i++) s = (s * 17 + k2.charCodeAt(i)) & 0x7fffffff;
        if (s === 0) s = 1;
        const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };

        const out = [];
        let i = 0;
        while (i < t.length) {
          // Occasional null insertion (~10%) — historical decoy
          if (out.length > 0 && rng() < 0.1 && nulls.length) {
            out.push(String(nulls[Math.floor(rng() * nulls.length)]).padStart(3, '0'));
          }
          let matched = null;
          for (const syl of sortedSyll) {
            if (t.startsWith(syl, i) && enc[syl]) { matched = syl; break; }
          }
          let tok;
          if (matched) { tok = matched; i += matched.length; }
          else { tok = t[i]; i++; }
          const opts = enc[tok];
          if (opts && opts.length) {
            out.push(String(opts[Math.floor(rng() * opts.length)]).padStart(3, '0'));
          } else {
            out.push('???');
          }
        }
        return out.join(' ');
      },
      decode: (text, key) => {
        const { dec } = buildTable(key);
        const nums = (text.match(/\d{2,4}/g) || []).map(n => parseInt(n, 10));
        let out = '';
        for (const n of nums) {
          const tok = dec[n];
          if (tok === undefined) { out += '?'; continue; }
          if (tok === NULL) continue;
          if (tok === TRAP) { out = out.slice(0, -1); continue; }
          out += tok;
        }
        return out;
      }
    };
  })();

  /* ─── 38b. Babington Plot Cipher (1586) — Mary, Queen of Scots ───
     The actual cipher Anthony Babington used to correspond with Mary
     used 23 cipher symbols for letters (no J, V, W), 36 nomenclator
     symbols for common words/names, 4 nulls, and one "doubleth" symbol
     meaning "double the next letter." Thomas Phelippes solved it within
     days and added a forged postscript that exposed the conspirators.
     Modeled here with bracketed tokens (since we lack a glyph font):
       letters → ⟨α01⟩…⟨α23⟩
       nomens  → ⟨ω01⟩…⟨ω36⟩  (THE, AND, OF, FOR, MARY, ELIZABETH, …)
       nulls   → ⟨∅01⟩…⟨∅04⟩  (decoys, dropped on decode)
       trap    → ⟨×2⟩         (doubles the following letter)               */
  const babington = (() => {
    const LETTERS = 'ABCDEFGHIKLMNOPQRSTUXYZ'.split(''); // 23 symbols, period letters
    const NOMENS = [
      'THE','AND','OF','FOR','WITH','THAT','THIS','SHALL','WILL','MUST',
      'YOUR','MAJESTY','MARY','ELIZABETH','QUEEN','KING','PRINCE','PLOT',
      'POISON','DAGGER','SHIP','SPAIN','FRANCE','SCOTLAND','ENGLAND','TOWER',
      'PRISON','LETTER','SECRET','FRIEND','ENEMY','GENTLEMEN','NOBLE','SIX',
      'DEATH','LIBERTY'
    ]; // 36 nomenclator codewords
    const NULL = '__BNULL__';
    const DOUB = '__BDOUB__'; // "doubleth" — double next letter
    function buildTable(seed) {
      const k = (clean(seed || 'BABINGTON') + 'PHELIPPES');
      let s = 0;
      for (let i = 0; i < k.length; i++) s = (s * 131 + k.charCodeAt(i)) & 0x7fffffff;
      if (s === 0) s = 1;
      const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
      // Build symbol pool
      const symbols = [];
      LETTERS.forEach((_, i) => symbols.push({ kind: 'L', tok: LETTERS[i], sym: 'a' + String(i + 1).padStart(2, '0') }));
      NOMENS.forEach((w, i) => symbols.push({ kind: 'N', tok: w, sym: 'w' + String(i + 1).padStart(2, '0') }));
      for (let i = 0; i < 4; i++) symbols.push({ kind: '0', tok: NULL, sym: 'n' + String(i + 1).padStart(2, '0') });
      symbols.push({ kind: 'D', tok: DOUB, sym: 'x2' });
      // Shuffle so the seed determines which symbol goes to which token
      for (let i = symbols.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [symbols[i].sym, symbols[j].sym] = [symbols[j].sym, symbols[i].sym];
      }
      const enc = {}, dec = {}, nulls = [];
      for (const s2 of symbols) {
        dec[s2.sym] = s2.tok;
        if (s2.tok === NULL) { nulls.push(s2.sym); continue; }
        (enc[s2.tok] = enc[s2.tok] || []).push(s2.sym);
      }
      return { enc, dec, nulls };
    }
    function letterFold(ch) {
      // Map J→I, V→U, W→VV (handled at caller) for the 23-letter alphabet
      if (ch === 'J') return 'I';
      if (ch === 'V') return 'U';
      return ch;
    }
    return {
      encode: (text, key) => {
        const t = clean(text);
        if (!t) return '';
        const { enc, nulls } = buildTable(key);
        const sortedWords = NOMENS.slice().sort((a, b) => b.length - a.length);
        let s = 0;
        const k2 = (clean(key || 'BABINGTON') + 'WALSINGHAM');
        for (let i = 0; i < k2.length; i++) s = (s * 17 + k2.charCodeAt(i)) & 0x7fffffff;
        if (s === 0) s = 1;
        const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
        const out = [];
        let i = 0;
        while (i < t.length) {
          // ~8% chance to insert a null between tokens
          if (out.length > 0 && rng() < 0.08 && nulls.length) {
            out.push('\u27e8' + nulls[Math.floor(rng() * nulls.length)] + '\u27e9');
          }
          // Try longest nomenclator word match first
          let matched = null;
          for (const w of sortedWords) {
            if (t.startsWith(w, i) && enc[w]) { matched = w; break; }
          }
          if (matched) {
            const opts = enc[matched];
            out.push('\u27e8' + opts[Math.floor(rng() * opts.length)] + '\u27e9');
            i += matched.length;
            continue;
          }
          // Otherwise emit a letter symbol (folding J→I, V→U)
          let ch = letterFold(t[i]);
          // Doubled letter? Use the doubleth trap once in a while
          if (i + 1 < t.length && letterFold(t[i + 1]) === ch && enc[DOUB] && rng() < 0.6) {
            out.push('\u27e8' + enc[ch][0] + '\u27e9');
            out.push('\u27e8' + enc[DOUB][0] + '\u27e9');
            i += 2;
            continue;
          }
          if (enc[ch]) {
            const opts = enc[ch];
            out.push('\u27e8' + opts[Math.floor(rng() * opts.length)] + '\u27e9');
          } else {
            out.push('?');
          }
          i++;
        }
        return out.join(' ');
      },
      decode: (text, key) => {
        const { dec } = buildTable(key);
        const matches = (text.match(/\u27e8[a-zA-Z0-9]+\u27e9|\u27e8x2\u27e9/g) || []);
        let out = '';
        for (const m of matches) {
          const sym = m.slice(1, -1).toLowerCase();
          const tok = dec[sym];
          if (tok === undefined) { out += '?'; continue; }
          if (tok === NULL) continue;
          if (tok === DOUB) {
            if (out.length) out += out[out.length - 1];
            continue;
          }
          out += tok;
        }
        return out;
      }
    };
  })();

  /* ─── 38c. Navajo Code Talkers (WWII USMC code) ───
     The actual Navajo code combined two systems:
       • A vocabulary of ~800 Navajo words for military terms
         (e.g. "tortoise" = TANK, "iron-fish" = SUBMARINE)
       • A spelling alphabet for words not in the codebook:
         each English letter mapped to a Navajo word whose first
         letter (in English) was that letter (e.g. A = WOL-LA-CHEE "ant").
     Multiple Navajo words existed per letter to defeat frequency
     analysis. Authoritative source: USMC FM 30-30 / Navajo Code
     Talkers' Dictionary (declassified 1968).                            */
  const navajo = (() => {
    // Two Navajo equivalents per letter where the historical record provides them
    const ALPHA = {
      A: ['WOL-LA-CHEE','BE-LA-SANA'],         // ant, apple
      B: ['SHUSH','TOISH-JEH'],                 // bear, barrel
      C: ['MOASI','TLA-GIN'],                   // cat, coal
      D: ['BE','LHA-CHA-EH'],                   // deer, dog
      E: ['DZEH','AH-JAH'],                     // elk, ear
      F: ['MA-E','CHUO'],                       // fox, fir
      G: ['KLIZZIE','AH-TAD'],                  // goat, girl
      H: ['LIN','CHA'],                         // horse, hat
      I: ['TKIN','YEH-HES'],                    // ice, itch
      J: ['TKELE-CHO-G','AH-YA-TSINNE'],        // jackass, jaw
      K: ['JAD-HO-LONI','BA-AH-NE-DI-TININ'],   // kettle, key
      L: ['DIBEH-YAZZIE','AH-JAD'],             // lamb, leg
      M: ['TSIN-TLITI','BE-TAS-TNI'],           // match, mirror
      N: ['TSAH','A-CHIN'],                     // needle, nose
      O: ['A-KHA','TLO-CHIN'],                  // oil, onion
      P: ['CLA-GI-AIH','BI-SO-DIH'],            // pant, pig
      Q: ['CA-YEILTH'],                         // quiver
      R: ['GAH','DAH-NES-TSA'],                 // rabbit, ram
      S: ['DIBEH','KLESH'],                     // sheep, snake
      T: ['THAN-ZIE','A-WOH'],                  // turkey, tooth
      U: ['SHI-DA','NO-DA-IH'],                 // uncle, ute
      V: ['A-KEH-DI-GLINI'],                    // victor
      W: ['GLOE-IH','DAH-NES-TSA-EE'],          // weasel, weapon
      X: ['AL-NA-AS-DZOH'],                     // crossed (X)
      Y: ['TSAH-AS-ZIH'],                       // yucca
      Z: ['BESH-DO-TLIZ']                       // zinc
    };
    // Common military code-vocabulary entries (subset of ~411 documented terms)
    const VOCAB = {
      AMERICA: 'NE-HE-MAH',          // "our mother"
      AIRPLANE: 'WO-TAH-DE-NE-IH',
      BOMB: 'A-YE-SHI',
      SUBMARINE: 'BESH-LO',          // "iron fish"
      TANK: 'CHAY-DA-GAHI',          // "tortoise"
      BATTLESHIP: 'LO-TSO',          // "whale"
      DESTROYER: 'CA-LO',            // "shark"
      FIGHTER: 'DA-HE-TIH-HI',       // "hummingbird"
      BOMBER: 'JAY-SHO',             // "buzzard"
      MARINE: 'TOH-YIL-KAL',         // "sea soldier"
      ENEMY: 'ANA-IH',
      ATTACK: 'AL-TAH-JE-JAY',
      RETREAT: 'JI-DI-JAH',
      MACHINE: 'CHIDI',
      GUN: 'BE-AL-DOH',
      MORTAR: 'BE-AL-DOH-CID-DA-HI',
      GRENADE: 'NI-MA-SI',           // "potato"
      MINE: 'HA-GAH',
      CAPTAIN: 'BESH-LEGAI-NAH-KIH', // "two silver bars"
      MAJOR: 'CHE-CHIL-BE-TAH-OLA',  // "gold oak leaf"
      GENERAL: 'BIH-KEH-HE',
      ISLAND: 'SEI-TAH',
      NIGHT: 'TLO-EE',
      DAY: 'JI',
      MORNING: 'A-YOR-ANH',
      MESSAGE: 'HANE-AL-NEH'
    };
    function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }
    return {
      encode: (text, _key) => {
        const t = text.toUpperCase();
        // Deterministic per-message RNG so the same message reproduces
        let s = 0;
        for (let i = 0; i < t.length; i++) s = (s * 131 + t.charCodeAt(i)) & 0x7fffffff;
        if (s === 0) s = 1;
        const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
        // Tokenize on whitespace, keeping word chunks
        const words = t.split(/\s+/).filter(Boolean);
        const out = [];
        for (const w of words) {
          const stripped = w.replace(/[^A-Z]/g, '');
          if (VOCAB[stripped]) {
            out.push('[' + VOCAB[stripped] + ']');     // codeword path
          } else {
            const letters = [];
            for (const ch of stripped) {
              if (ALPHA[ch]) letters.push(pick(ALPHA[ch], rng));
              else letters.push('?');
            }
            out.push(letters.join(' '));               // spelling-alphabet path
          }
        }
        return out.join('   /   ');                    // " / " separates words
      },
      decode: (text) => {
        const wordChunks = text.split(/\s*\/\s*/).map(s => s.trim()).filter(Boolean);
        // Build reverse lookups
        const codeWord2Eng = {};
        for (const k in VOCAB) codeWord2Eng[VOCAB[k]] = k;
        const navajo2Letter = {};
        for (const k in ALPHA) for (const w of ALPHA[k]) navajo2Letter[w] = k;
        const out = [];
        for (const wc of wordChunks) {
          const trimmed = wc.trim();
          // Codeword form: [TOKEN]
          const m = trimmed.match(/^\[([^\]]+)\]$/);
          if (m && codeWord2Eng[m[1]]) { out.push(codeWord2Eng[m[1]]); continue; }
          // Spelling alphabet form
          const tokens = trimmed.split(/\s+/);
          let s = '';
          for (const tk of tokens) s += (navajo2Letter[tk] || '?');
          out.push(s);
        }
        return out.join(' ');
      }
    };
  })();

  /* ─── 38d. Voynich Manuscript (Voynichese glyph substitution simulator) ───
     The Voynich Manuscript (Beinecke MS 408, c. 1404–1438) remains
     undeciphered. The "Voynichese" script has ~25–30 base glyphs
     transcribed in EVA (European Voynich Alphabet). This engine is
     NOT a claim that Voynichese is a substitution cipher — it is a
     visualization aid: it lets visitors see what their own English
     would look like if rendered in EVA glyphs, and round-trips
     deterministically so the demo is reversible.                        */
  const voynich = (() => {
    // Common EVA glyph shapes (using the EVA letters that have unicode-safe
    // visual analogues so the page renders without a custom font)
    // Source: Reddy & Knight 2011, "What we know about the Voynich Manuscript"
    const EVA = ['o','a','y','e','d','s','h','c','k','t','p','f','l','r','i','n','m','q','x','g','z','v','j','b','u','w'];
    // Map A→EVA[0] … Z→EVA[25]; render in italic small caps via the page CSS
    function fold(ch) {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90) return EVA[c - 65];
      if (c >= 97 && c <= 122) return EVA[c - 97];
      return ch;
    }
    function unfold(ch) {
      const i = EVA.indexOf(ch.toLowerCase());
      if (i >= 0) return String.fromCharCode(65 + i);
      return ch;
    }
    return {
      encode: (text) => {
        // Voynichese tokens are space-separated "words"; preserve word breaks
        return text.split('').map(fold).join('');
      },
      decode: (text) => {
        return text.split('').map(unfold).join('');
      }
    };
  })();

  /* ─── 39. Atbash (ancient Hebrew reflection cipher) ─── */
  const atbash = (() => {
    const run = t => t.split('').map(ch => {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90)  return String.fromCharCode(90  - (c - 65));
      if (c >= 97 && c <= 122) return String.fromCharCode(122 - (c - 97));
      return ch;
    }).join('');
    return { encode: run, decode: run };
  })();

  /* ─── 40. ROT13 (special-case Caesar) ─── */
  const rot13 = (() => {
    const run = t => caesar.encode(t, 13);
    return { encode: run, decode: run };
  })();

  /* ─── 41. Four-Square Cipher (Delastelle) ─── */
  const foursquare = (() => {
    // Uses the ACA convention (25 letters, J merged into I) — documented on the
    // exhibit page and baked into the published corpus records. Note Wikipedia's
    // four-square example instead omits Q, so its vector (HELPMEOBIWANKENOBI →
    // FYGMKYHOBXMFKKKIMD) will not match; the digraph rule itself is identical.
    const G = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // 25 letters, J→I
    function makeSquare(key) {
      const k = clean(key || 'EXAMPLE').replace(/J/g, 'I');
      const seen = new Set(); let s = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); s += c; }
      for (const c of G) if (!seen.has(c)) s += c;
      return s;
    }
    function pos(sq, ch) { const i = sq.indexOf(ch); return [Math.floor(i / 5), i % 5]; }
    function run(text, key, enc) {
      const [k1, k2] = (key || 'EXAMPLE,KEYWORD').split(',');
      const TL = G, TR = makeSquare(k1), BL = makeSquare(k2), BR = G;
      let t = clean(text).replace(/J/g, 'I');
      if (enc) t = escapeFillers(t);
      if (t.length % 2) t += 'X';
      let out = '';
      for (let i = 0; i < t.length; i += 2) {
        const a = t[i], b = t[i + 1];
        if (enc) {
          const [r1, c1] = pos(TL, a); const [r2, c2] = pos(BR, b);
          out += TR[r1 * 5 + c2] + BL[r2 * 5 + c1];
        } else {
          const [r1, c1] = pos(TR, a); const [r2, c2] = pos(BL, b);
          out += TL[r1 * 5 + c2] + BR[r2 * 5 + c1];
        }
      }
      if (!enc) return unescapeFillers(out.replace(/X+$/, ''));
      return out;
    }
    return { encode: (t, k) => run(t, k, true), decode: (t, k) => run(t, k, false) };
  })();

  /* ─── 42. Two-Square Cipher (horizontal variant) ─── */
  const twosquare = (() => {
    const G = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
    function makeSquare(key) {
      const k = clean(key || 'EXAMPLE').replace(/J/g, 'I');
      const seen = new Set(); let s = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); s += c; }
      for (const c of G) if (!seen.has(c)) s += c;
      return s;
    }
    function pos(sq, ch) { const i = sq.indexOf(ch); return [Math.floor(i / 5), i % 5]; }
    function run(text, key, enc) {
      const [k1, k2] = (key || 'EXAMPLE,KEYWORD').split(',');
      const L = makeSquare(k1), R = makeSquare(k2);
      let t = clean(text).replace(/J/g, 'I');
      if (enc) t = escapeFillers(t);
      if (t.length % 2) t += 'X';
      let out = '';
      for (let i = 0; i < t.length; i += 2) {
        const a = t[i], b = t[i + 1];
        const [r1, c1] = pos(L, a);
        const [r2, c2] = pos(R, b);
        if (r1 === r2) { out += L[r1 * 5 + c1] + R[r2 * 5 + c2]; } // same row → unchanged
        else { out += L[r1 * 5 + c2] + R[r2 * 5 + c1]; }
      }
      if (!enc) return unescapeFillers(out.replace(/X+$/, ''));
      return out;
    }
    // Two-square is reciprocal in the "no-flip" variant we use
    return { encode: (t, k) => run(t, k, true), decode: (t, k) => run(t, k, false) };
  })();

  /* ─── 43. Straddling Checkerboard (Soviet hand cipher core) ─── */
  const straddlingCheckerboard = (() => {
    function build(key) {
      // Top row letters (8 most-frequent slots, 0–9 minus the two "escape" digits)
      const k = clean(key || 'ATONESIRE');
      const seen = new Set(); let topAlpha = '';
      for (const c of k) if (!seen.has(c) && topAlpha.length < 8) { seen.add(c); topAlpha += c; }
      // Pad if keyword too short (shouldn't happen with default)
      for (const c of A) if (!seen.has(c) && topAlpha.length < 8) { seen.add(c); topAlpha += c; }
      // Remaining 18 letters fill rows 2/6 (the two escape digits)
      let rest = '';
      for (const c of A) if (!seen.has(c)) rest += c;
      // Top row digit slots: 0,1,3,4,5,6,8,9  (escape=2 and 7)
      const topSlots = [0, 1, 3, 4, 5, 6, 8, 9];
      const enc = {}, dec = {};
      topAlpha.split('').forEach((ch, i) => {
        const code = String(topSlots[i]);
        enc[ch] = code; dec[code] = ch;
      });
      rest.split('').forEach((ch, i) => {
        const prefix = i < 10 ? '2' : '7';
        const digit  = String(i % 10);
        const code = prefix + digit;
        enc[ch] = code; dec[code] = ch;
      });
      return { enc, dec };
    }
    return {
      encode: (text, key) => {
        const { enc } = build(key);
        return clean(text).split('').map(c => enc[c] || '').join('');
      },
      decode: (text, key) => {
        const { dec } = build(key);
        const digits = text.replace(/\D/g, '');
        let out = '', i = 0;
        while (i < digits.length) {
          const d = digits[i];
          if (d === '2' || d === '7') {
            const pair = digits.substr(i, 2);
            if (dec[pair]) { out += dec[pair]; i += 2; continue; }
          }
          if (dec[d]) { out += dec[d]; }
          i++;
        }
        return out;
      }
    };
  })();

  /* ─── 44. Chaocipher (Byrne, 1918) ─── */
  const chaocipher = (() => {
    function init(key) {
      // Two 26-char alphabets seeded from key
      const k = clean(key || 'CHAOCIPHER');
      const seen = new Set(); let base = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); base += c; }
      for (const c of A) if (!seen.has(c)) base += c;
      // Right alphabet rotated by 13 from left for variety
      const right = base.slice(13) + base.slice(0, 13);
      return [base.split(''), right.split('')];
    }
    function permuteLeft(L) {
      // Take char at position 1 (zenith+1), shift to end after zenith
      // Standard Byrne permutation:
      // 1. rotate so the just-enciphered letter (currently at idx 0) is at zenith → already there
      // 2. extract char at position 1, insert at position 13 (after splitting)
      const ch = L.splice(1, 1)[0];
      L.splice(13, 0, ch);
      return L;
    }
    function permuteRight(R) {
      // Rotate so just-enciphered plaintext letter (at idx 0) → moves so that
      // the next letter (idx 1) goes to zenith (idx 0); then take char at
      // position 2 and insert at position 13.
      // Per Byrne: shift entire alphabet one to the left (rotation), then
      // extract char at position 2 and insert at position 13.
      R.push(R.shift()); // rotate one position left
      const ch = R.splice(2, 1)[0];
      R.splice(13, 0, ch);
      return R;
    }
    return {
      encode: (text, key) => {
        let [L, R] = init(key);
        const t = clean(text); let out = '';
        for (const ch of t) {
          const idx = R.indexOf(ch);
          if (idx < 0) continue;
          out += L[idx];
          // rotate both so the touched chars are at zenith (idx 0)
          for (let i = 0; i < idx; i++) { L.push(L.shift()); R.push(R.shift()); }
          L = permuteLeft(L);
          R = permuteRight(R);
        }
        return out;
      },
      decode: (text, key) => {
        let [L, R] = init(key);
        const t = clean(text); let out = '';
        for (const ch of t) {
          const idx = L.indexOf(ch);
          if (idx < 0) continue;
          out += R[idx];
          for (let i = 0; i < idx; i++) { L.push(L.shift()); R.push(R.shift()); }
          L = permuteLeft(L);
          R = permuteRight(R);
        }
        return out;
      }
    };
  })();

  /* ─── 45. M-209 (Hagelin C-38 — simplified pin-and-lug) ─── */
  // Six pinwheels with co-prime lengths 26,25,23,21,19,17 = period 101,405,850
  // Each wheel has active pins (1) or not (0); active pins sum to a "lug count"
  // that gives a Beaufort-style key shift each character.
  const m209 = (() => {
    const lengths = [26, 25, 23, 21, 19, 17];
    function buildPins(key) {
      const k = (clean(key || 'HAGELIN') + 'M209').split('').map(c => c.charCodeAt(0));
      let s = 0; for (const x of k) s = (s * 131 + x) & 0x7fffffff;
      if (s === 0) s = 1;
      const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
      // Each wheel: random pin pattern (~50% active)
      return lengths.map(L => Array.from({ length: L }, () => rng() < 0.5 ? 1 : 0));
    }
    function shiftFor(pos, pins) {
      // Sum of active pins across all 6 wheels at this position = key shift
      let s = 0;
      for (let w = 0; w < 6; w++) s += pins[w][pos % lengths[w]];
      return s; // 0..6
    }
    function run(text, key) {
      const pins = buildPins(key);
      const t = clean(text); let out = '';
      for (let i = 0; i < t.length; i++) {
        const k = shiftFor(i, pins);
        // Beaufort: c = (K - p) mod 26  → involutive (encode = decode)
        out += A[mod(k - (t.charCodeAt(i) - 65), 26)];
      }
      return out;
    }
    return { encode: run, decode: run };
  })();

  /* ─── 46. Solitaire / Pontifex (Schneier, 1999) ─── */
  // Card-deck stream cipher. Deck of 54 (52 cards + 2 jokers).
  const solitaire = (() => {
    // Card values: 1..52 = clubs, diamonds, hearts, spades A..K
    // Jokers: A=53, B=54
    function initDeck(key) {
      const deck = [];
      for (let i = 1; i <= 54; i++) deck.push(i);
      const k = clean(key || 'CRYPTONOMICON');
      // Key the deck: for each key letter, do one "cycle" then count-cut by letter value
      function step(deck) { return solitaireStep(deck); }
      let d = deck.slice();
      for (const ch of k) {
        d = step(d);
        const v = ch.charCodeAt(0) - 64; // A=1
        d = countCut(d, v);
      }
      return d;
    }
    function moveDown(deck, card, n) {
      const i = deck.indexOf(card);
      const arr = deck.slice();
      arr.splice(i, 1);
      let j = i + n;
      // wrap as if circular with last card sticky
      if (j > arr.length) j = ((j - 1) % arr.length) + 1;
      arr.splice(j, 0, card);
      return arr;
    }
    function tripleCut(deck) {
      const i1 = deck.indexOf(53);
      const i2 = deck.indexOf(54);
      const [a, b] = i1 < i2 ? [i1, i2] : [i2, i1];
      const top = deck.slice(0, a);
      const mid = deck.slice(a, b + 1);
      const bot = deck.slice(b + 1);
      return bot.concat(mid).concat(top);
    }
    function countCut(deck, n) {
      const last = deck[deck.length - 1];
      const cut = Math.min(n, 53);
      const top = deck.slice(0, cut);
      const rest = deck.slice(cut, deck.length - 1);
      return rest.concat(top).concat([last]);
    }
    function solitaireStep(deck) {
      // Move A joker (53) down 1
      let d = moveDown(deck, 53, 1);
      // Move B joker (54) down 2
      d = moveDown(d, 54, 2);
      // Triple cut around the jokers
      d = tripleCut(d);
      // Count cut by value of bottom card (jokers count as 53)
      const bottom = d[d.length - 1];
      d = countCut(d, bottom === 54 ? 53 : bottom);
      return d;
    }
    function nextKeystream(deck) {
      while (true) {
        deck = solitaireStep(deck);
        const top = deck[0];
        const cnt = top === 54 ? 53 : top;
        const out = deck[cnt]; // 0-indexed: count cards down
        if (out === 53 || out === 54) continue; // skip jokers
        return { value: ((out - 1) % 26) + 1, deck };
      }
    }
    function run(text, key, enc) {
      let deck = initDeck(key);
      let t = clean(text); let out = '';
      if (enc) t = escapeFillers(t);
      // Schneier's spec pads the plaintext with X to a multiple of five before
      // encrypting; his published test vectors (e.g. SOLITAIRE/CRYPTONOMICON →
      // KIRAK SFJAN) require it. Padding stays in the decoded output — both
      // sides know trailing X is filler.
      if (enc) while (t.length % 5) t += 'X';
      for (const ch of t) {
        const r = nextKeystream(deck); deck = r.deck;
        const p = ch.charCodeAt(0) - 64;
        const c = enc ? ((p + r.value - 1) % 26) + 1 : ((p - r.value + 26 - 1) % 26) + 1;
        out += String.fromCharCode(64 + (c === 0 ? 26 : c));
      }
      if (!enc) return unescapeFillers(out.replace(/X+$/, ''));
      return out;
    }
    return { encode: (t, k) => run(t, k, true), decode: (t, k) => run(t, k, false) };
  })();

  /* ─── 47. Beale Cipher (book cipher — number = Nth word, take first letter) ─── */
  const beale = (() => {
    function tokens(book) {
      return (book || '').split(/[^A-Za-z]+/).filter(Boolean).map(w => w.toUpperCase());
    }
    return {
      encode: (text, book) => {
        const ws = tokens(book);
        if (!ws.length) return '';
        // For each plaintext letter, find a word in the book starting with it
        const indexByLetter = {};
        ws.forEach((w, i) => {
          const c = w[0];
          (indexByLetter[c] = indexByLetter[c] || []).push(i + 1);
        });
        const t = clean(text); const out = [];
        let s = 1;
        const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
        for (const ch of t) {
          const choices = indexByLetter[ch];
          if (!choices || !choices.length) { out.push('?'); continue; }
          out.push(String(choices[Math.floor(rng() * choices.length)]));
        }
        return out.join(' ');
      },
      decode: (text, book) => {
        const ws = tokens(book);
        const nums = (text.match(/\d+/g) || []).map(n => parseInt(n, 10));
        return nums.map(n => (ws[n - 1] ? ws[n - 1][0] : '?')).join('');
      }
    };
  })();

  /* ─── 48. Copiale Cipher (homophonic substitution; demo uses simplified alphabet) ─── */
  const copiale = (() => {
    // Real Copiale uses ~90 unique symbols. We simulate with letter+digit pairs.
    const symbolPool = (() => {
      const arr = [];
      for (const a of A) for (const d of '0123456789') arr.push(a + d);
      return arr; // 260 symbols
    })();
    const freq = { E: 13, T: 9, A: 8, O: 8, I: 7, N: 7, S: 6, H: 6, R: 6, D: 4, L: 4, C: 3, U: 3, M: 3, W: 2, F: 2, G: 2, Y: 2, P: 2, B: 1, V: 1, K: 1, J: 1, X: 1, Q: 1, Z: 1 };
    function build(key) {
      const k = clean(key || 'COPIALE') + 'OCULIST';
      let s = 0; for (let i = 0; i < k.length; i++) s = (s * 131 + k.charCodeAt(i)) & 0x7fffffff;
      if (s === 0) s = 1;
      const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
      const pool = symbolPool.slice().sort((a, b) => {
        const ha = (a.charCodeAt(0) * 31 + a.charCodeAt(1)) ^ Math.floor(rng() * 1e6);
        const hb = (b.charCodeAt(0) * 31 + b.charCodeAt(1)) ^ Math.floor(rng() * 1e6);
        return ha - hb;
      });
      const enc = {}, dec = {}; let pi = 0;
      for (const ch of A) {
        const n = freq[ch] || 1; enc[ch] = [];
        for (let i = 0; i < n; i++) {
          const sym = pool[pi++]; enc[ch].push(sym); dec[sym] = ch;
        }
      }
      return { enc, dec };
    }
    return {
      encode: (text, key) => {
        const { enc } = build(key);
        let s = 1;
        const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
        return clean(text).split('').map(ch => {
          const opts = enc[ch]; if (!opts) return '??';
          return opts[Math.floor(rng() * opts.length)];
        }).join(' ');
      },
      decode: (text, key) => {
        const { dec } = build(key);
        const toks = (text.match(/[A-Z]\d/g) || []);
        return toks.map(t => dec[t] || '?').join('');
      }
    };
  })();

  /* ─── 49. Kryptos K1/K2-style (Vigenère with custom KRYPTOS-keyed tableau) ─── */
  const kryptos = (() => {
    // Custom alphabet: keyword KRYPTOS then remaining letters
    function ktAlpha() {
      const k = 'KRYPTOS';
      const seen = new Set(); let s = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); s += c; }
      for (const c of A) if (!seen.has(c)) s += c;
      return s;
    }
    const KT = ktAlpha();
    function run(text, key, enc) {
      const k = clean(key || 'PALIMPSEST');
      const t = clean(text); let out = '';
      for (let i = 0; i < t.length; i++) {
        const pIdx = KT.indexOf(t[i]);
        const kIdx = KT.indexOf(k[i % k.length]);
        if (pIdx < 0 || kIdx < 0) { out += t[i]; continue; }
        out += KT[mod(enc ? pIdx + kIdx : pIdx - kIdx, 26)];
      }
      return out;
    }
    return { encode: (t, k) => run(t, k, true), decode: (t, k) => run(t, k, false) };
  })();

  /* ─── 50. Purple (Japanese WWII — simplified stepping rotor model) ─── */
  const purple = (() => {
    const sixes = 'AEIOUY';
    const twenties = 'BCDFGHJKLMNPQRSTVWXZ';

    function shuffled(alphabet, rng) {
      const values = alphabet.split('');
      for (let index = values.length - 1; index > 0; index--) {
        const swapAt = Math.floor(rng() * (index + 1));
        [values[index], values[swapAt]] = [values[swapAt], values[index]];
      }
      return values.join('');
    }

    function build(key) {
      const k = (clean(key || 'PURPLE') + 'TOKYO').split('').map(c => c.charCodeAt(0));
      let s = 0; for (const x of k) s = (s * 131 + x) & 0x7fffffff;
      if (s === 0) s = 1;
      const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
      const sixesTables = Array.from({ length: 25 }, () => shuffled(sixes, rng));
      const twentiesBanks = Array.from({ length: 3 }, () =>
        Array.from({ length: 25 }, () => shuffled(twenties, rng)));
      return { sixesTables, twentiesBanks };
    }

    function substitute(character, alphabet, table, decrypt) {
      return decrypt ? alphabet[table.indexOf(character)] : table[alphabet.indexOf(character)];
    }

    function run(text, key, decrypt) {
      const { sixesTables, twentiesBanks } = build(key);
      const input = clean(text);
      let result = '';
      for (let index = 0; index < input.length; index++) {
        let character = input[index];
        if (sixes.includes(character)) {
          character = substitute(character, sixes, sixesTables[index % 25], decrypt);
        } else {
          const positions = [index % 25, Math.floor(index / 25) % 25, Math.floor(index / 625) % 25];
          if (decrypt) {
            for (let bank = 2; bank >= 0; bank--) {
              character = substitute(character, twenties, twentiesBanks[bank][positions[bank]], true);
            }
          } else {
            for (let bank = 0; bank < 3; bank++) {
              character = substitute(character, twenties, twentiesBanks[bank][positions[bank]], false);
            }
          }
        }
        result += character;
      }
      return result;
    }

    return {
      encode: (text, key) => run(text, key, false),
      decode: (text, key) => run(text, key, true)
    };
  })();

  /* ─── 51. Autokey (Vigenère self-extending) ─── */
  const autokey = (() => {
    function enc(text, key) {
      const k = clean(key || 'KEY');
      const t = clean(text); let out = '';
      for (let i = 0; i < t.length; i++) {
        const ki = i < k.length ? A.indexOf(k[i]) : A.indexOf(t[i - k.length]);
        const pi = A.indexOf(t[i]);
        out += A[mod(pi + ki, 26)];
      }
      return out;
    }
    function dec(text, key) {
      const k = clean(key || 'KEY');
      const c = clean(text); let out = '';
      for (let i = 0; i < c.length; i++) {
        const ki = i < k.length ? A.indexOf(k[i]) : A.indexOf(out[i - k.length]);
        const ci = A.indexOf(c[i]);
        out += A[mod(ci - ki, 26)];
      }
      return out;
    }
    return { encode: enc, decode: dec };
  })();

  /* ─── 52. Nomenclator (illustrative — small fixed codebook) ─── */
  const nomenclator = (() => {
    // A demo nomenclator: digits 01-26 are the substitution alphabet (shifted +0),
    // larger numbers are vocabulary entries, 99 is a null.
    const VOCAB = {
      'THE': '60', 'AND': '61', 'OF': '62', 'TO': '63', 'IN': '64',
      'KING': '70', 'QUEEN': '71', 'ARMY': '72', 'FLEET': '73',
      'LONDON': '80', 'PARIS': '81', 'MADRID': '82', 'VIENNA': '83',
      'ATTACK': '90', 'RETREAT': '91', 'DAWN': '92', 'MIDNIGHT': '93'
    };
    const REV = Object.fromEntries(Object.entries(VOCAB).map(([k,v])=>[v,k]));
    function enc(text, _key) {
      const tokens = String(text ?? '').normalize('NFD').replace(/\p{M}/gu, '').toUpperCase().split(/\b/);
      const out = [];
      for (const tok of tokens) {
        if (/^[A-Z]+$/.test(tok)) {
          if (VOCAB[tok]) { out.push(VOCAB[tok]); continue; }
          for (const ch of tok) {
            const i = A.indexOf(ch);
            if (i >= 0) out.push(String(i + 1).padStart(2, '0'));
          }
        }
      }
      return out.join(' ');
    }
    function dec(text, _key) {
      const groups = (text || '').trim().split(/\s+/);
      let out = '';
      for (const g of groups) {
        if (g === '99') continue;
        if (REV[g]) { out += REV[g] + ' '; continue; }
        const n = parseInt(g, 10);
        if (n >= 1 && n <= 26) out += A[n - 1];
      }
      return out.trim();
    }
    return { encode: enc, decode: dec };
  })();

  /* ─── 53. Book Cipher (illustrative — Declaration of Independence opener) ─── */
  const bookCipher = (() => {
    const BOOK = (
      'When in the course of human events it becomes necessary for one people ' +
      'to dissolve the political bands which have connected them with another ' +
      'and to assume among the powers of the earth the separate and equal station ' +
      'to which the laws of nature and of natures God entitle them a decent respect ' +
      'to the opinions of mankind requires that they should declare the causes ' +
      'which impel them to the separation We hold these truths to be self evident ' +
      'that all men are created equal that they are endowed by their creator with ' +
      'certain unalienable rights that among these are life liberty and the pursuit of happiness'
    ).toUpperCase().split(/\s+/);
    function enc(text, _key) {
      const words = (text || '').toUpperCase().split(/\s+/).filter(Boolean);
      const out = [];
      for (const w of words) {
        const i = BOOK.indexOf(w);
        if (i >= 0) { out.push(String(i + 1)); continue; }
        const literal = w.replace(/[^A-Z]/g, '').split('').map(ch => A.indexOf(ch) + 1);
        if (literal.length) out.push('0.' + literal.join('.'));
      }
      return out.join(' ');
    }
    function dec(text, _key) {
      const groups = (text || '').trim().split(/\s+/);
      const out = [];
      for (const g of groups) {
        if (/^0(?:\.\d+)+$/.test(g)) {
          const literal = g.split('.').slice(1).map(n => A[parseInt(n, 10) - 1] || '?').join('');
          out.push(literal);
        } else if (g.includes('.')) {
          const [w, l] = g.split('.').map(n => parseInt(n, 10));
          if (BOOK[w - 1]) out.push(BOOK[w - 1][l - 1] || '?');
        } else {
          const w = parseInt(g, 10);
          if (BOOK[w - 1]) out.push(BOOK[w - 1]);
        }
      }
      return out.join(' ');
    }
    return { encode: enc, decode: dec };
  })();

  /* ─── 54. SIGABA (illustrative pseudo-random rotor stepping) ─── */
  // Real SIGABA: 5 cipher rotors stepped by the output of 5 control rotors
  // permuted through 5 index rotors. We model the essence: a substitution
  // alphabet that advances 1-4 positions per character driven by a key-seeded PRNG.
  const sigaba = (() => {
    function build(key) {
      const k = (clean(key || 'SIGABA') + 'ECMII').split('').map(c => c.charCodeAt(0));
      let s = 0; for (const x of k) s = (s * 131 + x) & 0x7fffffff;
      if (s === 0) s = 1;
      const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
      // 32 rotor positions; at each step advance 1-4 of them
      const alphas = [];
      for (let i = 0; i < 64; i++) {
        const arr = A.split('');
        for (let j = arr.length - 1; j > 0; j--) {
          const r = Math.floor(rng() * (j + 1));
          [arr[j], arr[r]] = [arr[r], arr[j]];
        }
        alphas.push(arr.join(''));
      }
      // Stepping schedule: pseudo-random cumulative advance
      const steps = [];
      let pos = 0;
      for (let i = 0; i < 4096; i++) {
        const advance = 1 + Math.floor(rng() * 4); // 1..4
        pos = (pos + advance) % 64;
        steps.push(pos);
      }
      return { alphas, steps };
    }
    return {
      encode: (text, key) => {
        const { alphas, steps } = build(key);
        const t = clean(text); let out = '';
        for (let i = 0; i < t.length; i++) {
          const a = alphas[steps[i % steps.length]];
          out += a[A.indexOf(t[i])];
        }
        return out;
      },
      decode: (text, key) => {
        const { alphas, steps } = build(key);
        const t = clean(text); let out = '';
        for (let i = 0; i < t.length; i++) {
          const a = alphas[steps[i % steps.length]];
          out += A[a.indexOf(t[i])];
        }
        return out;
      }
    };
  })();

  /* ─── 55. Typex (illustrative — Enigma-style 5-rotor with multi-notch stepping) ─── */
  const typex = (() => {
    function build(key) {
      const k = (clean(key || 'TYPEX') + 'BLETCHLEY').split('').map(c => c.charCodeAt(0));
      let s = 0; for (const x of k) s = (s * 131 + x) & 0x7fffffff;
      if (s === 0) s = 1;
      const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
      // 5 rotor wirings (random permutations of A)
      const rotors = [];
      for (let r = 0; r < 5; r++) {
        const arr = A.split('');
        for (let j = arr.length - 1; j > 0; j--) {
          const i = Math.floor(rng() * (j + 1));
          [arr[j], arr[i]] = [arr[i], arr[j]];
        }
        rotors.push(arr.join(''));
      }
      // Reflector (pairs)
      const refArr = A.split('');
      for (let j = refArr.length - 1; j > 0; j--) {
        const i = Math.floor(rng() * (j + 1));
        [refArr[j], refArr[i]] = [refArr[i], refArr[j]];
      }
      const reflector = {};
      for (let i = 0; i < 26; i += 2) {
        reflector[refArr[i]] = refArr[i + 1];
        reflector[refArr[i + 1]] = refArr[i];
      }
      return { rotors, reflector };
    }
    function step(positions, i) {
      // 3 stepping rotors with multi-notch (notches at every 5, 7, 11 positions)
      positions[0] = (positions[0] + 1) % 26;
      if (i % 5 === 0) positions[1] = (positions[1] + 1) % 26;
      if (i % 35 === 0) positions[2] = (positions[2] + 1) % 26;
      // rotors 3 and 4 are stators (fixed)
    }
    function encChar(ch, rotors, reflector, positions) {
      let i = A.indexOf(ch);
      // Forward through 5 rotors
      for (let r = 0; r < 5; r++) {
        const offset = r < 3 ? positions[r] : 0;
        i = A.indexOf(rotors[r][mod(i + offset, 26)]);
        i = mod(i - offset, 26);
      }
      // Reflector
      let c = A[i];
      c = reflector[c];
      i = A.indexOf(c);
      // Backward through 5 rotors
      for (let r = 4; r >= 0; r--) {
        const offset = r < 3 ? positions[r] : 0;
        i = mod(i + offset, 26);
        i = rotors[r].indexOf(A[i]);
        i = mod(i - offset, 26);
      }
      return A[mod(i, 26)];
    }
    function run(text, key) {
      const { rotors, reflector } = build(key);
      const positions = [0, 0, 0];
      const t = clean(text); let out = '';
      for (let i = 0; i < t.length; i++) {
        step(positions, i);
        out += encChar(t[i], rotors, reflector, positions);
      }
      return out;
    }
    // Typex (with reflector) is reciprocal — same fn for enc/dec
    return { encode: run, decode: run };
  })();

  /* ─── Round 3: Kama Sutra paired-substitution (Mlecchita Vikalpa) ─── */
  const kamaSutra = (() => {
    function buildPairs(key) {
      const k = clean(key || 'KAMASUTRA');
      const seen = new Set();
      let alpha = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); alpha += c; }
      for (let i = 0; i < 26; i++) { const c = A[i]; if (!seen.has(c)) alpha += c; }
      const map = {};
      for (let i = 0; i < 13; i++) {
        const a = alpha[i], b = alpha[25 - i];
        map[a] = b; map[b] = a;
      }
      return map;
    }
    function run(text, key) {
      const m = buildPairs(key);
      return (text || '').split('').map(ch => {
        const u = ch.toUpperCase();
        if (m[u]) return ch === u ? m[u] : m[u].toLowerCase();
        return ch;
      }).join('');
    }
    return { encode: run, decode: run };
  })();

  /* ─── Round 3: Aeneas Tacticus water-clock signaling code ─── */
  const aeneasTacticus = (() => {
    // Each letter A-Z maps to its position 1-26 (water-clock release time).
    return {
      encode: t => clean(t).split('').map(c => A.indexOf(c) + 1).join(' '),
      decode: t => (t || '').split(/[^0-9]+/).filter(Boolean)
        .map(n => A[parseInt(n, 10) - 1] || '').join('')
    };
  })();

  /* ─── Round 3: JN-25 (illustrative superenciphered codebook model) ─── */
  const jn25 = (() => {
    // Pedagogical model: letters -> 5-digit code groups, then digit-wise additive superencipherment.
    const LETTER_GROUPS = Object.fromEntries(A.split('').map((ch, i) => [ch, String(10000 + i)]));
    const REV_GROUPS = Object.fromEntries(Object.entries(LETTER_GROUPS).map(([k, v]) => [v, k]));

    function normalizeKeyDigits(key) {
      const digits = String(key || '31415').replace(/\D/g, '');
      return digits || '31415';
    }

    function addGroup(group, keyDigits, decrypt) {
      let out = '';
      for (let i = 0; i < 5; i++) {
        const g = group.charCodeAt(i) - 48;
        const k = keyDigits.charCodeAt(i % keyDigits.length) - 48;
        const d = decrypt ? mod(g - k, 10) : mod(g + k, 10);
        out += String(d);
      }
      return out;
    }

    return {
      encode: (text, key) => {
        const t = clean(text);
        const keyDigits = normalizeKeyDigits(key);
        const groups = t.split('').map(ch => LETTER_GROUPS[ch]);
        return groups.map(g => addGroup(g, keyDigits, false)).join(' ');
      },
      decode: (text, key) => {
        const keyDigits = normalizeKeyDigits(key);
        const groups = (String(text || '').match(/\d{5}/g) || []);
        return groups.map(g => REV_GROUPS[addGroup(g, keyDigits, true)] || '?').join('');
      }
    };
  })();

  /* ─── Round 3: Red (Type A) stepping-switch model ─── */
  const redTypeA = (() => {
    const vowels = 'AEIOUY';
    const consonants = 'BCDFGHJKLMNPQRSTVWXZ';

    function seededRng(seedText) {
      let s = 0;
      for (const ch of (seedText || 'REDTYPEA')) s = (s * 131 + ch.charCodeAt(0)) & 0x7fffffff;
      if (s === 0) s = 1;
      return () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return s / 0x7fffffff;
      };
    }

    function shuffle(alpha, rng) {
      const arr = alpha.split('');
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.join('');
    }

    function buildTables(key) {
      const rng = seededRng(clean(key || 'TOKYORED'));
      return {
        vTables: Array.from({ length: 6 }, () => shuffle(vowels, rng)),
        cTables: Array.from({ length: 20 }, () => shuffle(consonants, rng))
      };
    }

    function run(text, key, decrypt) {
      const t = clean(text);
      const { vTables, cTables } = buildTables(key);
      let vPos = 0;
      let cPos = 0;
      let out = '';

      for (const ch of t) {
        if (vowels.includes(ch)) {
          const table = vTables[vPos % vTables.length];
          out += decrypt ? vowels[table.indexOf(ch)] : table[vowels.indexOf(ch)];
          vPos = (vPos + 1) % vTables.length;
        } else if (consonants.includes(ch)) {
          const table = cTables[cPos % cTables.length];
          out += decrypt ? consonants[table.indexOf(ch)] : table[consonants.indexOf(ch)];
          cPos = (cPos + 1) % cTables.length;
        }
      }
      return out;
    }

    return {
      encode: (text, key) => run(text, key, false),
      decode: (text, key) => run(text, key, true)
    };
  })();

  /* ─── Shared helper for Phase 4 rotor / disk-cylinder models ─── */
  function _seededRng(seed) {
    let s = 0;
    for (const ch of (seed || 'SEED')) s = (s * 131 + ch.charCodeAt(0)) & 0x7fffffff;
    if (s === 0) s = 1;
    return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  }
  function _shuffledAlphabet(rng) {
    const arr = A.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  /* ─── Round 3 Phase 4: Fialka M-125 (Soviet 10-rotor) ─── */
  // Pedagogical model. Real Fialka used a 30-character Cyrillic / Latin alphabet
  // and 10 rotors with mixed-direction stepping. This engine models the essential
  // idea: ten reciprocal substitution rotors with non-uniform stepping derived
  // from a keyword. Reflector makes it self-reciprocal like Enigma/Typex.
  const fialka = (() => {
    function build(key) {
      const rng = _seededRng('FIALKA' + clean(key || 'M125'));
      const rotors = []; for (let r = 0; r < 10; r++) rotors.push(_shuffledAlphabet(rng));
      const refArr = _shuffledAlphabet(rng).split('');
      const reflector = {};
      for (let i = 0; i < 26; i += 2) {
        reflector[refArr[i]] = refArr[i + 1];
        reflector[refArr[i + 1]] = refArr[i];
      }
      // Per-rotor step direction: +1 (typewriter style) or -1 (reverse).
      const dirs = []; for (let r = 0; r < 10; r++) dirs.push(rng() > 0.5 ? 1 : -1);
      return { rotors, reflector, dirs };
    }
    function step(positions, dirs, i) {
      // Fast rotor every char; medium every 7th; slow every 31st (coprime with 26).
      positions[0] = mod(positions[0] + dirs[0], 26);
      if (i % 7 === 0)  positions[1] = mod(positions[1] + dirs[1], 26);
      if (i % 31 === 0) positions[2] = mod(positions[2] + dirs[2], 26);
      // rotors 3..9 act as stators that drift slightly with the medium ring
      if (i % 91 === 0) positions[3] = mod(positions[3] + dirs[3], 26);
    }
    function encChar(ch, rotors, reflector, positions) {
      let i = A.indexOf(ch);
      for (let r = 0; r < 10; r++) {
        const off = r < 4 ? positions[r] : 0;
        i = A.indexOf(rotors[r][mod(i + off, 26)]);
        i = mod(i - off, 26);
      }
      let c = reflector[A[i]];
      i = A.indexOf(c);
      for (let r = 9; r >= 0; r--) {
        const off = r < 4 ? positions[r] : 0;
        i = mod(i + off, 26);
        i = rotors[r].indexOf(A[i]);
        i = mod(i - off, 26);
      }
      return A[mod(i, 26)];
    }
    function run(text, key) {
      const { rotors, reflector, dirs } = build(key);
      const positions = [0, 0, 0, 0];
      const t = clean(text); let out = '';
      for (let i = 0; i < t.length; i++) {
        step(positions, dirs, i);
        out += encChar(t[i], rotors, reflector, positions);
      }
      return out;
    }
    return { encode: run, decode: run };
  })();

  /* ─── Round 3 Phase 4: KL-7 (USA, 1952) ─── */
  // Pedagogical model. Real KL-7 had 8 rotors with a re-entry path and a
  // notched-ring stepping mechanism roughly four times more complex than
  // SIGABA. This engine models the essential idea: eight rotor substitutions
  // with irregular stepping driven by notch tables; reciprocal via reflector
  // so the same operation encrypts and decrypts (matching the real KL-7).
  const kl7 = (() => {
    function build(key) {
      const rng = _seededRng('KL7' + clean(key || 'TSEC'));
      const rotors = []; for (let r = 0; r < 8; r++) rotors.push(_shuffledAlphabet(rng));
      const notches = []; for (let r = 0; r < 8; r++) notches.push(Math.floor(rng() * 26));
      const refArr = _shuffledAlphabet(rng).split('');
      const reflector = {};
      for (let i = 0; i < 26; i += 2) {
        reflector[refArr[i]] = refArr[i + 1];
        reflector[refArr[i + 1]] = refArr[i];
      }
      return { rotors, notches, reflector };
    }
    function step(positions, notches) {
      // Always step rotor 0; rotors 1..6 step when previous rotor hits notch.
      positions[0] = mod(positions[0] + 1, 26);
      for (let r = 1; r < 7; r++) {
        if (positions[r - 1] === notches[r - 1]) {
          positions[r] = mod(positions[r] + 1, 26);
        }
      }
    }
    function encChar(ch, rotors, reflector, positions) {
      let i = A.indexOf(ch);
      for (let r = 0; r < 8; r++) {
        const off = r < 7 ? positions[r] : 0;
        i = A.indexOf(rotors[r][mod(i + off, 26)]);
        i = mod(i - off, 26);
      }
      let c = reflector[A[i]];
      i = A.indexOf(c);
      for (let r = 7; r >= 0; r--) {
        const off = r < 7 ? positions[r] : 0;
        i = mod(i + off, 26);
        i = rotors[r].indexOf(A[i]);
        i = mod(i - off, 26);
      }
      return A[mod(i, 26)];
    }
    function run(text, key) {
      const { rotors, notches, reflector } = build(key);
      const positions = [0, 0, 0, 0, 0, 0, 0, 0];
      const t = clean(text); let out = '';
      for (let i = 0; i < t.length; i++) {
        step(positions, notches);
        out += encChar(t[i], rotors, reflector, positions);
      }
      return out;
    }
    return { encode: run, decode: run };
  })();

  /* ─── Round 3 Phase 4: Geheimschreiber T52 (Sturgeon) ─── */
  // Pedagogical model. The real Siemens & Halske T52 was a teleprinter cipher
  // attachment combining XOR addition with a five-bit permutation derived from
  // 10 keystream wheels. Bletchley called the family "Fish", with Lorenz/SZ40
  // labelled "Tunny" and the T52 family "Sturgeon".
  //
  // This engine keeps the structural T52 idea — "additive keystream + per-
  // character permutation, both driven by ten wheels of coprime length" —
  // but works over the 26-letter alphabet rather than the 5-bit Baudot code,
  // so encrypt/decrypt round-trip cleanly without falling onto non-letter
  // Baudot symbols (LTRS shift, FIGS shift, NUL, etc.).
  const geheimschreiber = (() => {
    function build(key) {
      const rng = _seededRng('T52' + clean(key || 'STURGEON'));
      // 10 wheels with coprime lengths near the historical T52 wheel sizes.
      const wheelLens = [47, 53, 59, 61, 67, 71, 73, 79, 83, 89];
      const wheels = wheelLens.map(L => {
        const bits = [];
        for (let i = 0; i < L; i++) bits.push(Math.floor(rng() * 26));
        return bits;
      });
      // Six per-character substitution permutations of 0..25; the wheels
      // pick which one to apply at each position (the "Q-rangler" effect).
      const perms = [];
      for (let p = 0; p < 6; p++) perms.push(_shuffledAlphabet(rng));
      const invPerms = perms.map(p => {
        const inv = new Array(26);
        for (let i = 0; i < 26; i++) inv[A.indexOf(p[i])] = A[i];
        return inv.join('');
      });
      return { wheels, wheelLens, perms, invPerms };
    }
    function additiveAt(i, wheels, wheelLens) {
      let s = 0;
      for (let b = 0; b < 5; b++) s += wheels[b][i % wheelLens[b]];
      return mod(s, 26);
    }
    function permIndexAt(i, wheels, wheelLens) {
      let s = 0;
      for (let b = 5; b < 10; b++) s += wheels[b][(i * 7) % wheelLens[b]];
      return mod(s, 6);
    }
    function run(text, key, decrypt) {
      const { wheels, wheelLens, perms, invPerms } = build(key);
      const t = clean(text); let out = '';
      for (let i = 0; i < t.length; i++) {
        const x = A.indexOf(t[i]);
        const k = additiveAt(i, wheels, wheelLens);
        const p = permIndexAt(i, wheels, wheelLens);
        if (!decrypt) {
          out += perms[p][mod(x + k, 26)];
        } else {
          const y = invPerms[p].charCodeAt(x) - 65;
          out += A[mod(y - k, 26)];
        }
      }
      return out;
    }
    return {
      encode: (text, key) => run(text, key, false),
      decode: (text, key) => run(text, key, true)
    };
  })();

  /* ─── Round 3 Phase 4: Kryha cipher machine (1924) ─── */
  // Alexander von Kryha's pocket cipher device, marketed in the 1920s as
  // "absolutely unbreakable" and demolished by Friedman, Kullback, Sinkov,
  // and Rosen in just a few hours of paper analysis. The mechanism is a
  // single mixed alphabet wheel that advances by an irregular amount on each
  // keystroke, controlled by a 26-position spring-driven gear ring. With one
  // rotor and a small number of distinct step values, period and depth-of-
  // alignment attacks recover the wheel quickly. This is essentially a
  // keyword-driven Vigenère-on-a-mixed-alphabet with non-uniform step sizes.
  const kryha = (() => {
    function build(key) {
      const rng = _seededRng('KRYHA' + clean(key || 'POCKET'));
      const wheel = _shuffledAlphabet(rng);
      // Step pattern: a 26-position table of advance values 1..6.
      const steps = []; for (let i = 0; i < 26; i++) steps.push(1 + Math.floor(rng() * 6));
      return { wheel, steps };
    }
    function run(text, key, decrypt) {
      const { wheel, steps } = build(key);
      const t = clean(text); let out = '';
      let pos = 0; let stepIdx = 0;
      for (let i = 0; i < t.length; i++) {
        const ch = t[i];
        if (!decrypt) {
          const x = A.indexOf(ch);
          out += wheel[mod(x + pos, 26)];
        } else {
          const idx = wheel.indexOf(ch);
          out += A[mod(idx - pos, 26)];
        }
        pos = mod(pos + steps[stepIdx], 26);
        stepIdx = (stepIdx + 1) % 26;
      }
      return out;
    }
    return {
      encode: (text, key) => run(text, key, false),
      decode: (text, key) => run(text, key, true)
    };
  })();

  /* ─── Round 3 Phase 4: M-94 / M-138-A strip cipher ─── */
  // The M-94 (US Army, 1922) and M-138-A (US State Dept., 1934-1959) were
  // direct mechanical descendants of Jefferson's wheel cipher. The M-94 had
  // 25 lettered aluminium disks on a spindle; the M-138-A used 30 paper
  // strips in a frame. Both worked the same way: align the disks/strips so
  // the plaintext appears in a row, then read off any other row as the
  // ciphertext. Recipient does the reverse. Engine is the Jefferson wheel
  // with a configurable disk count and offset row.
  const m94 = (() => {
    function build(key, count) {
      // Key format: optional first integer = offset row (1..25), then a
      // permutation of 1..N or a keyword used to derive disk order.
      const parsed = String(key || '').split(/[, ]+/).filter(Boolean);
      let offset = 5;
      let order = null;
      if (parsed.length && /^\d+$/.test(parsed[0])) {
        offset = parseInt(parsed[0], 10) || 5;
        if (offset < 1) offset = 1; if (offset > count - 1) offset = count - 1;
        parsed.shift();
      }
      if (parsed.length === count && parsed.every(p => /^\d+$/.test(p))) {
        order = parsed.map(p => parseInt(p, 10) - 1);
      }
      // Build N pseudo-random mixed alphabets seeded by the key (or default).
      const rng = _seededRng('M94' + (parsed.join('') || 'STANDARD'));
      const disks = []; for (let r = 0; r < count; r++) disks.push(_shuffledAlphabet(rng));
      if (order) {
        const reordered = order.map(i => disks[i % count]);
        return { disks: reordered, offset };
      }
      return { disks, offset };
    }
    function run(text, key, decrypt, count) {
      const { disks, offset } = build(key, count);
      const t = clean(text); let out = '';
      for (let i = 0; i < t.length; i++) {
        const disk = disks[i % count];
        const ch = t[i];
        if (!decrypt) {
          const idx = disk.indexOf(ch);
          if (idx < 0) { out += ch; continue; }
          out += disk[mod(idx + offset, 26)];
        } else {
          const idx = disk.indexOf(ch);
          if (idx < 0) { out += ch; continue; }
          out += disk[mod(idx - offset, 26)];
        }
      }
      return out;
    }
    return {
      encode: (text, key) => run(text, key, false, 25),
      decode: (text, key) => run(text, key, true, 25)
    };
  })();

  /* ─── Round 3 Phase 5: Affine cipher ─── */
  const affine = (() => {
    // Affine cipher: E(x) = (a*x + b) mod 26, D(y) = a^-1 * (y - b) mod 26.
    // 'a' must be coprime with 26 (the 12 valid values are 1,3,5,7,9,11,15,17,19,21,23,25).
    const VALID_A = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
    function modInverse(a) {
      const m = mod(a, 26);
      for (let i = 1; i < 26; i++) if ((m * i) % 26 === 1) return i;
      return 1;
    }
    function parseKey(key) {
      const parts = String(key == null ? '5,8' : key).split(',').map(s => parseInt(s.trim(), 10));
      let a = isNaN(parts[0]) ? 5 : parts[0];
      let b = isNaN(parts[1]) ? 8 : parts[1];
      // Snap a to nearest valid coprime value if user supplied an even or 13 multiple.
      if (!VALID_A.includes(mod(a, 26))) {
        a = VALID_A.reduce((best, v) => Math.abs(v - mod(a, 26)) < Math.abs(best - mod(a, 26)) ? v : best, 5);
      }
      a = mod(a, 26);
      b = mod(b, 26);
      return { a, b };
    }
    function transform(text, fn) {
      return (text || '').split('').map(ch => {
        const u = ch.toUpperCase();
        const code = u.charCodeAt(0);
        if (code < 65 || code > 90) return ch;
        const x = code - 65;
        const y = fn(x);
        const out = String.fromCharCode(y + 65);
        return ch === u ? out : out.toLowerCase();
      }).join('');
    }
    return {
      encode: (text, key) => {
        const { a, b } = parseKey(key);
        return transform(text, x => mod(a * x + b, 26));
      },
      decode: (text, key) => {
        const { a, b } = parseKey(key);
        const aInv = modInverse(a);
        return transform(text, y => mod(aInv * (y - b), 26));
      }
    };
  })();

  /* ─── Round 3 Phase 5: Trithemius progressive cipher ─── */
  // Johannes Trithemius (1462–1516) — first published polyalphabetic.
  // Each successive plaintext letter is shifted by an additional position
  // (letter 0 by 0, letter 1 by 1, etc.). Optional starting offset.
  const trithemius = (() => {
    function run(text, key, enc) {
      const t = String(text || ''); let r = '';
      const start = parseInt(String(key || '0').replace(/\D/g, ''), 10) || 0;
      let i = 0;
      for (const ch of t) {
        const u = ch.toUpperCase();
        const code = u.charCodeAt(0);
        if (code < 65 || code > 90) { r += ch; continue; }
        const shift = mod((start + i), 26);
        const x = code - 65;
        const y = enc ? mod(x + shift, 26) : mod(x - shift, 26);
        const out = String.fromCharCode(y + 65);
        r += ch === u ? out : out.toLowerCase();
        i++;
      }
      return r;
    }
    return {
      encode: (text, key) => run(text, key, true),
      decode: (text, key) => run(text, key, false)
    };
  })();

  /* ─── Round 3 Phase 5: Cardano Autokey ─── */
  // Girolamo Cardano (1501–1576) — original autokey: prime with a single
  // letter (the key), then continue the keystream with the plaintext itself.
  // Distinct from the later Vigenère-style autokey (already in `autokey`)
  // which primes with a multi-letter keyword. Reference: Frary, De/Cipher.
  const cardanoAutokey = (() => {
    function run(text, key, enc) {
      const t = clean(text);
      const seed = clean(key || 'A').charAt(0) || 'A';
      let r = '';
      // Build keystream from seed + plaintext (Cardano's "self-keying" idea).
      // Encryption: ki = seed for i=0; ki = plain[i-1] otherwise.
      // Decryption: recover plain[i] from cipher[i] using ki, then ki+1=plain[i].
      let prev = seed;
      for (let i = 0; i < t.length; i++) {
        const p = t.charCodeAt(i) - 65;
        const k = prev.charCodeAt(0) - 65;
        if (enc) {
          const c = mod(p + k, 26);
          r += String.fromCharCode(c + 65);
          prev = t[i];
        } else {
          const c = p; // here p is actually ciphertext code
          const plain = mod(c - k, 26);
          const ch = String.fromCharCode(plain + 65);
          r += ch;
          prev = ch;
        }
      }
      return r;
    }
    return {
      encode: (text, key) => run(text, key, true),
      decode: (text, key) => run(text, key, false)
    };
  })();

  /* ─── Round 3 Phase 5: Wheatstone Cryptograph ─── */
  // Charles Wheatstone's 1867 clock-face cryptograph: two concentric dials,
  // outer plain alphabet and inner mixed cipher alphabet. The two hands
  // are geared so that as the long hand sweeps the outer dial the inner
  // hand walks the mixed alphabet beneath, producing a polyalphabetic
  // stream. Pedagogical model: derive the inner alphabet from a keyword
  // (Polybius-style dedupe + remainder), and step both dials per letter.
  // The historical machine used a 27-mark outer dial (26 letters + space)
  // to telegraph word breaks; this Track A model uses 26-mark outer dials
  // on both sides so encrypt/decrypt is unambiguous and round-trips.
  const wheatstone = (() => {
    function makeInner(key) {
      const k = clean(key || 'WHEATSTONE');
      const seen = new Set();
      let s = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); s += c; }
      for (const c of A) if (!seen.has(c)) { seen.add(c); s += c; }
      return s;
    }
    function run(text, key, enc) {
      const inner = makeInner(key);
      const src = clean(text);
      let r = '';
      let outerPos = 0;
      let innerPos = 0;
      for (const ch of src) {
        if (enc) {
          const newOuter = ch.charCodeAt(0) - 65;
          const advance = mod(newOuter - outerPos, 26);
          outerPos = newOuter;
          innerPos = mod(innerPos + advance, 26);
          r += inner[innerPos];
        } else {
          const idx = inner.indexOf(ch);
          const advance = mod(idx - innerPos, 26);
          innerPos = idx;
          outerPos = mod(outerPos + advance, 26);
          r += String.fromCharCode(outerPos + 65);
        }
      }
      return r;
    }
    return {
      encode: (text, key) => run(text, key, true),
      decode: (text, key) => run(text, key, false)
    };
  })();

  /* ─── Round 3 Phase 5: Morse Code ─── */
  // International Morse, the canonical telegraph encoding. Reference:
  // Frary's "Morse + cipher combination" framing. Track A treats text→dots
  // as the encode side and dots→text as the decode side. Audio playback
  // belongs to the exhibit page, not the engine.
  const morse = (() => {
    const TABLE = {
      A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',
      I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',
      Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',
      Y:'-.--',Z:'--..',
      '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
      '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'
    };
    const REV = Object.fromEntries(Object.entries(TABLE).map(([k,v])=>[v,k]));
    return {
      encode: (text /* key ignored */) => {
        const words = String(text ?? '').normalize('NFD').replace(/\p{M}/gu, '')
          .toUpperCase().split(/\s+/).map(word => word.replace(/[^A-Z0-9]/g, ''))
          .filter(Boolean);
        return words.map(word => word.split('').map(ch => TABLE[ch]).join(' ')).join(' / ');
      },
      decode: (text) => {
        const tokens = String(text || '').trim().split(/\s+/);
        let r = '';
        for (const tok of tokens) {
          if (tok === '/' || tok === '|') { r += ' '; continue; }
          if (REV[tok]) r += REV[tok];
        }
        return r;
      }
    };
  })();

  /* ─── Round 3 Phase 7: Cardano Grille ─── */
  // Girolamo Cardano's 1550 grille: a card with cut-out windows. The
  // cleartext is written through the windows; the rest is filled with
  // innocuous covertext. Pedagogical model: encode produces a grid of N×N
  // characters where the message fills positions selected by the grille
  // pattern (a comma-separated list of 0-based indices) and the remaining
  // cells are filled with a deterministic filler. Decode pulls the
  // characters at those indices back out.
  const cardanoGrille = (() => {
    const FILLERS = 'THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG';
    function parsePattern(key) {
      // Format: "size:idx,idx,idx,..." e.g. "5:0,3,7,12,19".
      // If no size given, default to 5×5. If pattern empty, place message
      // at consecutive indices 0..n-1.
      const raw = String(key || '5:').trim();
      const colonAt = raw.indexOf(':');
      let size = 5;
      let body = raw;
      if (colonAt >= 0) {
        const s = parseInt(raw.slice(0, colonAt), 10);
        if (s >= 2 && s <= 12) size = s;
        body = raw.slice(colonAt + 1);
      }
      const indices = body.split(/[ ,;]+/).map(s => parseInt(s, 10)).filter(n => !isNaN(n) && n >= 0 && n < size * size);
      return { size, indices };
    }
    return {
      encode: (text, key) => {
        const { size, indices } = parsePattern(key);
        const msg = escapeFillers(clean(text));
        if (!msg) return '';
        const total = size * size;
        const slots = indices.length ? indices : Array.from({ length: total }, (_, i) => i);
        const blocks = [];
        for (let offset = 0; offset < msg.length; offset += slots.length) {
          const chunk = msg.slice(offset, offset + slots.length).padEnd(slots.length, 'X');
          const grid = new Array(total).fill('');
          for (let i = 0; i < slots.length; i++) grid[slots[i]] = chunk[i];
          for (let i = 0; i < total; i++) if (!grid[i]) grid[i] = FILLERS[i % FILLERS.length];
          const rows = [];
          for (let row = 0; row < size; row++) {
            rows.push(grid.slice(row * size, (row + 1) * size).join(''));
          }
          blocks.push(rows.join('\n'));
        }
        return blocks.join('\n\n');
      },
      decode: (text, key) => {
        const { size, indices } = parsePattern(key);
        const source = String(text || '').trim();
        if (!source) return '';
        const total = size * size;
        const slots = indices.length ? indices : Array.from({ length: total }, (_, i) => i);
        let out = '';
        for (const block of source.split(/\n\s*\n/)) {
          const flat = block.toUpperCase().replace(/[^A-Z]/g, '').slice(0, total);
          for (const idx of slots) if (idx < flat.length) out += flat[idx];
        }
        return unescapeFillers(out.replace(/X+$/, ''));
      }
    };
  })();

  /* ─── Round 3 Phase 10: Null Cipher ─── */
  // Conceal a hidden message inside an innocuous text by reading every
  // Nth letter of every Mth word (or first/last of each word). Track A
  // model: encode wraps the plaintext into a carrier text whose first
  // letter of each word spells out the message; decode reads the chosen
  // positions back out. Key format: "first" | "last" | integer N (Nth
  // letter of each word).
  const nullCipher = (() => {
    const CARRIER_WORDS = ['the','and','of','to','in','that','it','for','on','with','at','by','this','from','they','one','have','this','word','your','said','each','which','their','time','will','about','out','many','then','them','these','some','her','would','make','like','him','into','has','look','more','write','number','other','than','first','water','been','call','who','its','now','find','long','down','day','did','get','come','made','may','part','over','new','sound','take','only','little','work','know','place','year','live','back','give','most','very','after','our','just','name','good','sentence','man','think','say','great','help','through','much','before','line','right','too','mean','old','any','same','tell','boy','follow','came','want','show'];
    function pickPos(key) {
      const k = String(key || 'first').toLowerCase().trim();
      if (k === 'first' || k === '1') return 0;
      if (k === 'last') return -1;
      const n = parseInt(k, 10);
      if (Number.isSafeInteger(n) && n >= 1 && n <= 1024) return n - 1;
      return 0;
    }
    function pickCarrier(letter, pos, salt) {
      const candidates = CARRIER_WORDS.filter(w => {
        if (pos === -1) return w[w.length - 1] && w[w.length - 1].toUpperCase() === letter;
        return w.length > pos && w[pos].toUpperCase() === letter;
      });
      if (candidates.length) return candidates[salt % candidates.length];
      // Fabricate a filler word that places `letter` at the requested
      // position. The word must be long enough to actually HOLD that
      // position (>= pos + 1 chars) or decode would read past its end and
      // silently drop the letter. Use a sentinel different from any letter so
      // the placeholder fill loop never collides with `letter` itself
      // (e.g. letter === 'X' would have collided with an 'x' sentinel).
      const fill = 'aeioutnsr';
      const len = pos === -1 ? 4 : Math.max(4, pos + 1);
      const arr = new Array(len).fill('_');
      const target = pos === -1 ? len - 1 : pos;
      arr[target] = letter.toLowerCase();
      for (let i = 0; i < arr.length; i++) if (arr[i] === '_') arr[i] = fill[(salt + i) % fill.length];
      return arr.join('');
    }
    return {
      encode: (text, key) => {
        const pos = pickPos(key);
        const msg = clean(text);
        const words = [];
        for (let i = 0; i < msg.length; i++) words.push(pickCarrier(msg[i], pos, i));
        return words.join(' ');
      },
      decode: (text, key) => {
        const pos = pickPos(key);
        const words = String(text || '').split(/\s+/).filter(Boolean);
        let r = '';
        for (const w of words) {
          if (pos === -1) { if (w.length) r += w[w.length - 1].toUpperCase(); }
          else if (w.length > pos) r += w[pos].toUpperCase();
        }
        return r;
      }
    };
  })();

  // ============================================================
  // Phase 6: East Asia & Telegraphy
  // ============================================================

  // Chinese Telegraph Code (Standard Telegraph Codebook, 1881).
  // Demo: each Latin letter receives a deterministic 4-digit code group,
  // optionally super-enciphered by adding a numeric additive key (the way
  // CTC was actually overlaid in WWII Chinese diplomatic traffic).
  const chineseTelegraph = (() => {
    function buildTable() {
      // 26 fixed 4-digit code groups, drawn from real CTC ranges (0001..9999)
      // but assigned deterministically to A..Z so the demo round-trips cleanly.
      const base = [
         12,  74, 156, 219, 285, 347, 408, 472, 538, 601,
        667, 729, 792, 856, 918,1024,1187,1255,1346,1421,
       1503,1599,1672,1748,1821,1905
      ];
      const map = {}, inv = {};
      for (let i = 0; i < 26; i++) {
        const code = String(base[i]).padStart(4, '0');
        map[A[i]] = code;
        inv[code] = A[i];
      }
      return { map, inv };
    }
    function additive(key) {
      const k = parseInt(String(key || '0').replace(/[^0-9]/g, '') || '0', 10);
      return (k % 10000 + 10000) % 10000;
    }
    return {
      encode: (text, key) => {
        const { map } = buildTable();
        const k = additive(key);
        const msg = clean(text);
        const out = [];
        for (const ch of msg) {
          const code = parseInt(map[ch], 10);
          out.push(String((code + k) % 10000).padStart(4, '0'));
        }
        return out.join(' ');
      },
      decode: (text, key) => {
        const { inv } = buildTable();
        const k = additive(key);
        const groups = String(text || '').match(/\d{4}/g) || [];
        let r = '';
        for (const g of groups) {
          const original = String((parseInt(g, 10) - k + 10000) % 10000).padStart(4, '0');
          r += inv[original] || '?';
        }
        return r;
      }
    };
  })();

  // Zimmermann Telegram (German diplomatic code 0075 / 13040).
  // Demo: each input word is encoded as a 5-digit code group from a fixed
  // codebook of ~140 common English words. Words not in the codebook fall
  // through to a per-character literal encoding (codes 90000..90025 for A..Z).
  // Optional numeric `key` is added mod 100000 (super-encipherment).
  const zimmermann = (() => {
    const WORDLIST = (
      'THE OF AND TO IN A IS THAT FOR IT WITH AS BE ON BY ARE AT THIS NOT BUT FROM OR HAVE AN THEY WHICH ONE YOU WERE HER ALL SHE WHEN HIS THERE WOULD THEIR WHAT SO UP OUT IF ABOUT WHO GET WHICH GO ME WHEN MAKE CAN LIKE TIME NO JUST HIM KNOW TAKE PEOPLE INTO YEAR YOUR GOOD SOME COULD THEM SEE OTHER THAN THEN NOW LOOK ONLY COME ITS OVER THINK ALSO BACK AFTER USE TWO HOW OUR WORK FIRST WELL WAY EVEN NEW WANT ANY THESE GIVE DAY MOST US MEXICO WAR PEACE ALLIANCE SUBMARINE STOP UNRESTRICTED RESTRICTED AMERICA UNITED STATES JAPAN TEXAS ARIZONA NEW BERLIN MOSCOW NEUTRAL OFFER FINANCIAL SUPPORT HOSTILE RELATION RECONQUER LOST TERRITORY SUPREME COMMAND CABLE'
    ).split(/\s+/);
    function additive(key) {
      const k = parseInt(String(key || '0').replace(/[^0-9]/g, '') || '0', 10);
      return (k % 100000 + 100000) % 100000;
    }
    function fmt5(n) { return String(((n % 100000) + 100000) % 100000).padStart(5, '0'); }
    return {
      encode: (text, key) => {
        const k = additive(key);
        const tokens = String(text || '').toUpperCase().split(/\s+/).filter(Boolean);
        const out = [];
        for (const tok of tokens) {
          // strip punctuation for lookup but keep within token
          const word = tok.replace(/[^A-Z]/g, '');
          if (!word) continue;
          const idx = WORDLIST.indexOf(word);
          if (idx >= 0) {
            out.push(fmt5(idx + k));
          } else {
            // literal fallback: 99999 sentinel + per-letter codes 90000..90025
            out.push(fmt5(99999 + k));
            for (const ch of word) {
              out.push(fmt5(90000 + (ch.charCodeAt(0) - 65) + k));
            }
            out.push(fmt5(99998 + k));
          }
        }
        return out.join(' ');
      },
      decode: (text, key) => {
        const k = additive(key);
        const groups = String(text || '').match(/\d{5}/g) || [];
        const words = [];
        let i = 0;
        while (i < groups.length) {
          const v = (parseInt(groups[i], 10) - k + 100000) % 100000;
          if (v === 99999) {
            // literal mode until 99998
            i++;
            let w = '';
            while (i < groups.length) {
              const lv = (parseInt(groups[i], 10) - k + 100000) % 100000;
              if (lv === 99998) { i++; break; }
              if (lv >= 90000 && lv <= 90025) w += A[lv - 90000];
              else w += '?';
              i++;
            }
            words.push(w);
          } else if (v < WORDLIST.length) {
            words.push(WORDLIST[v]);
            i++;
          } else {
            words.push('???');
            i++;
          }
        }
        return words.join(' ');
      }
    };
  })();

  // Slidex (British / Allied tactical bigram cipher card, WWII).
  // Demo: a 26\u00d726 bigram card built from a keyed mixed alphabet; each
  // plaintext bigram is replaced by the bigram at its (row, col) cell, and
  // decoded by reverse lookup. Final odd letter is padded with X.
  const slidex = (() => {
    function buildCard(key) {
      const seed = (String(key || 'SLIDEX').toUpperCase().replace(/[^A-Z]/g, '') || 'SLIDEX');
      const rng = _seededRng(seed);
      const rowAlpha = _shuffledAlphabet(rng);
      const colAlpha = _shuffledAlphabet(rng);
      // For each cell (r,c) the card prints a bigram; build a deterministic
      // assignment so the 676 cells use all 676 bigrams exactly once.
      const cells = [];
      for (let i = 0; i < 26; i++) for (let j = 0; j < 26; j++) cells.push(A[i] + A[j]);
      // shuffle cells with the keyed RNG
      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
      }
      const enc = {}, dec = {};
      for (let r = 0; r < 26; r++) {
        for (let c = 0; c < 26; c++) {
          const plainBigram = rowAlpha[r] + colAlpha[c];
          const cipherBigram = cells[r * 26 + c];
          enc[plainBigram] = cipherBigram;
          dec[cipherBigram] = plainBigram;
        }
      }
      return { enc, dec };
    }
    return {
      encode: (text, key) => {
        const { enc } = buildCard(key);
        let msg = escapeFillers(clean(text));
        if (msg.length % 2 === 1) msg += 'X';
        let r = '';
        for (let i = 0; i < msg.length; i += 2) {
          const bg = msg.substr(i, 2);
          r += enc[bg] || bg;
        }
        return r;
      },
      decode: (text, key) => {
        const { dec } = buildCard(key);
        const msg = clean(text);
        let r = '';
        for (let i = 0; i + 1 < msg.length; i += 2) {
          const bg = msg.substr(i, 2);
          r += dec[bg] || bg;
        }
        return unescapeFillers(r.replace(/X+$/, ''));
      }
    };
  })();

  // Commercial Telegraph Codebooks (ABC Code, Bentley's, etc., late 19th\u2013early 20th c.)
  // Demo: each input word is encoded as a 5-letter pronounceable codeword in
  // CVCVC pattern. Listed words use a fixed codebook; fallback per-letter encoding
  // for unlisted words mirrors how operators handled proper nouns and numbers.
  const commercialCode = (() => {
    const C = 'BCDFGHJKLMNPQRSTVWXZ';
    const V = 'AEIOU';
    const CN = C.length, VN = V.length;
    function encode5(idx) {
      // 5-letter CVCVC -> 20*5*20*5*20 = 200000 possible codewords
      idx = ((idx % 200000) + 200000) % 200000;
      const c1 = idx % CN; idx = Math.floor(idx / CN);
      const v1 = idx % VN; idx = Math.floor(idx / VN);
      const c2 = idx % CN; idx = Math.floor(idx / CN);
      const v2 = idx % VN; idx = Math.floor(idx / VN);
      const c3 = idx % CN;
      return C[c1] + V[v1] + C[c2] + V[v2] + C[c3];
    }
    function decode5(word) {
      const w = word.toUpperCase();
      if (w.length !== 5) return -1;
      const c1 = C.indexOf(w[0]); if (c1 < 0) return -1;
      const v1 = V.indexOf(w[1]); if (v1 < 0) return -1;
      const c2 = C.indexOf(w[2]); if (c2 < 0) return -1;
      const v2 = V.indexOf(w[3]); if (v2 < 0) return -1;
      const c3 = C.indexOf(w[4]); if (c3 < 0) return -1;
      return c1 + CN * (v1 + VN * (c2 + CN * (v2 + VN * c3)));
    }
    const WORDLIST = (
      'THE OF AND TO IN IS THAT FOR IT WITH AS BE ON BY ARE AT THIS NOT BUT FROM OR HAVE AN THEY WHICH WERE HER ALL SHE WHEN HIS THERE WOULD THEIR WHAT SO UP OUT IF ABOUT WHO GET GO ME MAKE CAN LIKE TIME NO JUST HIM KNOW TAKE PEOPLE INTO YEAR YOUR GOOD SOME COULD THEM SEE OTHER THAN THEN NOW LOOK ONLY COME OVER THINK BACK AFTER USE TWO HOW OUR WORK FIRST WELL WAY EVEN NEW WANT ANY THESE GIVE DAY MOST US ARRIVED DEPARTING SHIPMENT URGENT CONFIRMED CANCEL DELIVERY PAYMENT PRICE QUANTITY OFFER ACCEPT REJECT REPLY CABLE WIRE STOP CONTRACT INVOICE BANK CREDIT DEBIT'
    ).split(/\s+/);
    const SENTINEL_LITERAL_OPEN = 199999;
    const SENTINEL_LITERAL_CLOSE = 199998;
    const LETTER_BASE = 199900;
    return {
      encode: (text, key) => {
        const tokens = String(text || '').toUpperCase().split(/\s+/).filter(Boolean);
        const out = [];
        for (const tok of tokens) {
          const word = tok.replace(/[^A-Z]/g, '');
          if (!word) continue;
          const idx = WORDLIST.indexOf(word);
          if (idx >= 0) {
            out.push(encode5(idx));
          } else {
            out.push(encode5(SENTINEL_LITERAL_OPEN));
            for (const ch of word) {
              out.push(encode5(LETTER_BASE + (ch.charCodeAt(0) - 65)));
            }
            out.push(encode5(SENTINEL_LITERAL_CLOSE));
          }
        }
        return out.join(' ');
      },
      decode: (text, key) => {
        const groups = String(text || '').toUpperCase().match(/[A-Z]{5}/g) || [];
        const words = [];
        let i = 0;
        while (i < groups.length) {
          const v = decode5(groups[i]);
          if (v === SENTINEL_LITERAL_OPEN) {
            i++;
            let w = '';
            while (i < groups.length) {
              const lv = decode5(groups[i]);
              if (lv === SENTINEL_LITERAL_CLOSE) { i++; break; }
              if (lv >= LETTER_BASE && lv <= LETTER_BASE + 25) w += A[lv - LETTER_BASE];
              else w += '?';
              i++;
            }
            words.push(w);
          } else if (v >= 0 && v < WORDLIST.length) {
            words.push(WORDLIST[v]);
            i++;
          } else {
            words.push('???');
            i++;
          }
        }
        return words.join(' ');
      }
    };
  })();

  // ============================================================
  // Phase 7: Americana (Revolutionary War cryptography)
  // ============================================================

  // Culper Ring / Tallmadge Code (1779).
  // Major Benjamin Tallmadge\u2019s codebook for Washington\u2019s spy ring on
  // British-occupied Long Island and Manhattan. ~750 numbered entries
  // covering people, places, military terms, and common words. Demo: a
  // 200-entry stable codebook; each input word \u2192 3-digit code, with a
  // literal per-letter fallback (8xx range) for out-of-codebook words.
  const culperRing = (() => {
    const WORDLIST = (
      'THE OF AND TO IN A IS THAT FOR IT WITH AS BE ON BY ARE AT THIS NOT BUT FROM OR HAVE AN ' +
      'WERE WHEN HER ALL SHE HIS THERE WHAT SO UP OUT IF ABOUT WHO GET GO ME MAKE CAN LIKE ' +
      'TIME NO JUST HIM KNOW TAKE PEOPLE INTO YEAR YOUR GOOD SOME COULD THEM SEE OTHER THAN ' +
      'THEN NOW LOOK ONLY COME OVER THINK BACK AFTER USE TWO HOW OUR WORK FIRST WELL WAY ' +
      'EVEN NEW WANT ANY THESE GIVE DAY MOST US WASHINGTON CULPER TALLMADGE WOODHULL TOWNSEND ' +
      'BRITISH AMERICAN ARMY NAVY GENERAL COLONEL CAPTAIN MAJOR LIEUTENANT FORT POST CAMP ' +
      'SHIP REGIMENT BATTALION COMPANY MUSKET CANNON POWDER LETTER MESSAGE SPY AGENT ENEMY ' +
      'FRIEND SECRET INFORMATION REPORT ATTACK DEFEND MARCH MOVE ARRIVE DEPART CROSS RIVER ' +
      'BRIDGE ROAD HORSE RIDE SHIP BOAT HARBOR LONDON NEWYORK BOSTON PHILADELPHIA SETAUKET ' +
      'OYSTERBAY CONNECTICUT LONGISLAND MANHATTAN HUDSON FLEET TROOPS SUPPLY ORDERS DELIVER ' +
      'RECEIVE WRITE READ ANSWER MEET TONIGHT TOMORROW MORNING EVENING SUNDAY MONDAY TUESDAY ' +
      'WEDNESDAY THURSDAY FRIDAY SATURDAY MONEY GUINEA POUND SHILLING TRADE GOODS CARGO ' +
      'STORE FARM CHURCH TAVERN PRINTING PRESS NEWSPAPER GAZETTE CLINTON ANDRE ARNOLD ROCHAMBEAU ' +
      'GREENE LAFAYETTE LEE STIRLING MORGAN PUTNAM HEATH PARSONS PASSAGE JERSEY VIRGINIA ' +
      'CAROLINA GEORGIA RHODEISLAND MASSACHUSETTS DELAWARE PENNSYLVANIA MARYLAND CONFEDERATE ' +
      'CONGRESS COMMANDER LOYAL REBEL TORY WHIG INDEPENDENCE LIBERTY KING PARLIAMENT TAX'
    ).split(/\s+/);
    const SENT_OPEN = 998, SENT_CLOSE = 999, LETTER_BASE = 800;
    function fmt3(n) { return String(((n % 1000) + 1000) % 1000).padStart(3, '0'); }
    return {
      encode: (text, key) => {
        const tokens = String(text || '').toUpperCase().split(/\s+/).filter(Boolean);
        const out = [];
        for (const tok of tokens) {
          const w = tok.replace(/[^A-Z]/g, '');
          if (!w) continue;
          const idx = WORDLIST.indexOf(w);
          if (idx >= 0) {
            out.push(fmt3(idx + 100)); // codebook entries start at 100, like real Culper numbers
          } else {
            out.push(fmt3(SENT_OPEN));
            for (const ch of w) out.push(fmt3(LETTER_BASE + (ch.charCodeAt(0) - 65)));
            out.push(fmt3(SENT_CLOSE));
          }
        }
        return out.join(' ');
      },
      decode: (text, key) => {
        const groups = String(text || '').match(/\d{3}/g) || [];
        const words = [];
        let i = 0;
        while (i < groups.length) {
          const v = parseInt(groups[i], 10);
          if (v === SENT_OPEN) {
            i++;
            let w = '';
            while (i < groups.length) {
              const lv = parseInt(groups[i], 10);
              if (lv === SENT_CLOSE) { i++; break; }
              if (lv >= LETTER_BASE && lv <= LETTER_BASE + 25) w += A[lv - LETTER_BASE];
              else w += '?';
              i++;
            }
            words.push(w);
          } else if (v >= 100 && v - 100 < WORDLIST.length) {
            words.push(WORDLIST[v - 100]);
            i++;
          } else {
            words.push('???');
            i++;
          }
        }
        return words.join(' ');
      }
    };
  })();

  // Arnold\u2013Andr\u00e9 Book Cipher (1779\u20131780).
  // The cipher Benedict Arnold and John Andr\u00e9 used to plot the surrender
  // of West Point. Each word in plaintext was located in a shared book
  // (Blackstone\u2019s <em>Commentaries on the Laws of England</em>) and
  // transmitted as the triple page.line.word. Demo: a deterministic
  // 240-word \u201cbook\u201d (12 pages \u00d7 5 lines \u00d7 4 words) seeded by the
  // optional key; each input word becomes a triple. Words not in the book
  // fall through to per-letter triples in a reserved page range.
  const arnoldAndre = (() => {
    const SOURCE = (
      'OF THE COMMENTARIES UPON THE LAWS OF ENGLAND THAT TREAT OF THE RIGHTS ' +
      'OF PERSONS AND OF THINGS PROPERTY POSSESSION CONTRACT TRESPASS REMEDY ' +
      'CRIME PUNISHMENT JUSTICE COURT JUDGE JURY SHERIFF STATUTE PARLIAMENT ' +
      'KING REIGN WAR PEACE TREATY ALLY ENEMY FOE CITIZEN SUBJECT LOYAL ' +
      'REBEL ARMY SHIP FORT POINT WEST CAMP TROOPS COMMAND ORDER DELIVER ' +
      'MEET TONIGHT TOMORROW EVENING ARRIVE DEPART CROSS HUDSON RIVER ROAD ' +
      'BRIDGE HORSE LETTER MESSAGE SECRET INFORMATION REPORT ATTACK DEFEND ' +
      'MARCH MOVE FRIEND SPY AGENT ENEMY ARNOLD ANDRE WASHINGTON CLINTON ' +
      'BENEDICT JOHN GENERAL COLONEL CAPTAIN MAJOR LIEUTENANT GUNS POWDER ' +
      'CANNON MUSKET POST SUPPLY MONEY GUINEA POUND SHILLING TRADE CARGO ' +
      'GOODS PRINT NEWSPAPER GAZETTE LONDON NEWYORK BOSTON PHILADELPHIA ' +
      'WESTPOINT KINGS FERRY HAVERSTRAW STONY POINT FORTNIAGARA SARATOGA ' +
      'SARATOGA TICONDEROGA YORKTOWN PRINCETON TRENTON MORRISTOWN MIDWAY ' +
      'MIDDLE FIRST SECOND THIRD FOURTH FIFTH SIXTH SEVENTH EIGHTH NINTH ' +
      'TENTH ELEVENTH TWELFTH SUNDAY MONDAY TUESDAY WEDNESDAY THURSDAY FRIDAY ' +
      'SATURDAY MORNING NOON EVENING NIGHT MIDNIGHT WATCH SENTRY GUARD GATE ' +
      'WALL TOWER HARBOR FLEET FRIGATE SLOOP SCHOONER PRIZE ANCHOR MOOR ' +
      'SEAL BREAK SECRET CIPHER KEY DECODE ENCODE WORD LETTER NUMBER PAGE ' +
      'LINE BOOK COPY READ WRITE PEN INK WAX PARCHMENT HAND SIGNATURE ' +
      'NAME OATH HONOR DUTY HOMAGE TREASON BETRAY DESERT FLEE ESCAPE ' +
      'SAFE PASSAGE PASSWORD COUNTERSIGN PATROL ROUND POST GUARD CHANGE ' +
      'RELIEF DUTY HOUR PIQUET COLOR FLAG WHITE RED BLUE BLACK YELLOW ' +
      'GREEN PURPLE BROWN GRAY SHIPYARD MILL SHOP TAVERN INN CHURCH FARM ' +
      'HOUSE STORE STABLE BARN FIELD WOOD HILL VALLEY STREAM CREEK MOUNTAIN ' +
      'WATER FORD CROSSING NORTH SOUTH EAST WEST RIGHT LEFT FRONT REAR'
    ).split(/\s+/);
    // Pad / trim to 12 pages * 5 lines * 4 words = 240 entries.
    while (SOURCE.length < 240) SOURCE.push('FILLER');
    SOURCE.length = 240;
    function tripleOf(idx) {
      const page = Math.floor(idx / 20) + 1; // 1..12
      const line = Math.floor((idx % 20) / 4) + 1; // 1..5
      const word = (idx % 4) + 1; // 1..4
      return page + '.' + line + '.' + word;
    }
    function indexOfTriple(t) {
      const m = String(t).match(/^(\d+)\.(\d+)\.(\d+)$/);
      if (!m) return -1;
      const p = parseInt(m[1], 10), l = parseInt(m[2], 10), w = parseInt(m[3], 10);
      if (p < 1 || p > 12 || l < 1 || l > 5 || w < 1 || w > 4) return -2;
      return (p - 1) * 20 + (l - 1) * 4 + (w - 1);
    }
    // Reserve pages 13..15 for literal mode: page 13 = sentinel-open,
    // page 14 = letter codes (line=floor((c)/5)+1, word=(c%5)+1, c in 0..25),
    // page 15 = sentinel-close.
    const SENT_OPEN  = '13.1.1';
    const SENT_CLOSE = '15.1.1';
    function letterTriple(ch) {
      const c = ch.charCodeAt(0) - 65;
      return '14.' + (Math.floor(c / 5) + 1) + '.' + ((c % 5) + 1);
    }
    function letterFromTriple(t) {
      const m = t.match(/^14\.(\d+)\.(\d+)$/);
      if (!m) return '?';
      const li = parseInt(m[1], 10) - 1, wi = parseInt(m[2], 10) - 1;
      const c = li * 5 + wi;
      return (c >= 0 && c < 26) ? A[c] : '?';
    }
    return {
      encode: (text, key) => {
        const tokens = String(text || '').toUpperCase().split(/\s+/).filter(Boolean);
        const out = [];
        for (const tok of tokens) {
          const w = tok.replace(/[^A-Z]/g, '');
          if (!w) continue;
          const idx = SOURCE.indexOf(w);
          if (idx >= 0) {
            out.push(tripleOf(idx));
          } else {
            out.push(SENT_OPEN);
            for (const ch of w) out.push(letterTriple(ch));
            out.push(SENT_CLOSE);
          }
        }
        return out.join(' ');
      },
      decode: (text, key) => {
        const groups = String(text || '').match(/\d+\.\d+\.\d+/g) || [];
        const words = [];
        let i = 0;
        while (i < groups.length) {
          const t = groups[i];
          if (t === SENT_OPEN) {
            i++;
            let w = '';
            while (i < groups.length) {
              if (groups[i] === SENT_CLOSE) { i++; break; }
              w += letterFromTriple(groups[i]);
              i++;
            }
            words.push(w);
          } else {
            const idx = indexOfTriple(t);
            if (idx >= 0 && idx < SOURCE.length) words.push(SOURCE[idx]);
            else words.push('???');
            i++;
          }
        }
        return words.join(' ');
      }
    };
  })();

  // Argenti Family Cipher (1500s\u20131600s, Vatican).
  // Matteo and Marcello Argenti served as papal cryptanalysts; their
  // <em>Trattato in Cifra</em> codified the homophonic-nomenclator pattern
  // that dominated European diplomacy for two centuries. Demo: each letter
  // gets two keyed 2-digit homophones (codes 10\u201389) and the encoder
  // alternates between them on each repeat use, so common letters spread
  // across multiple cipher numbers \u2014 the central Argenti innovation.
  const argenti = (() => {
    function build(seed) {
      const rng = _seededRng(seed || 'ARGENTI');
      // Pool of 52 two-digit codes (10..89, skip multiples of 10 reserved for nulls)
      const pool = [];
      for (let n = 10; n <= 89; n++) pool.push(n);
      // Fisher-Yates shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const homo = {}; // letter -> [code1, code2]
      for (let i = 0; i < 26; i++) homo[A[i]] = [pool[i * 2], pool[i * 2 + 1]];
      const reverse = {};
      for (const [ltr, codes] of Object.entries(homo)) {
        for (const c of codes) reverse[c] = ltr;
      }
      return { homo, reverse };
    }
    function fmt2(n) { return String(n).padStart(2, '0'); }
    return {
      encode: (text, key) => {
        const t = clean(text);
        const { homo } = build(key);
        const counters = {};
        const out = [];
        for (const ch of t) {
          const codes = homo[ch];
          if (!codes) continue;
          const pick = (counters[ch] = (counters[ch] || 0) + 1) % 2;
          out.push(fmt2(codes[pick]));
        }
        return out.join(' ');
      },
      decode: (text, key) => {
        const { reverse } = build(key);
        const groups = String(text || '').match(/\d{2}/g) || [];
        return groups.map(g => reverse[parseInt(g, 10)] || '?').join('');
      }
    };
  })();

  // Wallis Ciphers (1640s, English Civil War).
  // John Wallis of Oxford broke Royalist nomenclators for Parliament and
  // founded the English state cryptanalysis tradition. The Royalist systems
  // he attacked were heavily codebook-dominant: long lists of named persons,
  // places, and political terms with per-letter spelling as a fallback.
  // Demo: keyed nomenclator with a ~60-word Civil-War-era codebook (3-digit
  // codes 100\u2013159) plus per-letter 2-digit homophones (10\u201389) for the
  // residual alphabet \u2014 the dominant design Wallis attacked.
  const wallisCiphers = (() => {
    const WORDLIST = (
      'KING QUEEN PRINCE PARLIAMENT COMMONS LORDS COMMITTEE COUNCIL ARMY ' +
      'NAVY GENERAL COLONEL CAPTAIN MAJOR LIEUTENANT REGIMENT TROOP HORSE ' +
      'FOOT MUSKET PIKE POWDER MATCH CANNON FIELD BATTLE SIEGE FORT GARRISON ' +
      'OXFORD LONDON YORK NEWCASTLE NASEBY EDGEHILL MARSTON BRISTOL ' +
      'CHARLES STUART CROMWELL FAIRFAX RUPERT ESSEX MANCHESTER WALLER ' +
      'GORING DIGBY HYDE ROYALIST PARLIAMENTARIAN ROUNDHEAD CAVALIER ' +
      'CIPHER LETTER MESSAGE SECRET INTELLIGENCE INTERCEPT KEY DECIPHER ' +
      'ATTACK DEFEND MARCH RETREAT'
    ).split(/\s+/);
    const SENT_OPEN = 90, SENT_CLOSE = 91; // reserved 2-digit sentinels
    function fmt2(n) { return String(n).padStart(2, '0'); }
    function fmt3(n) { return String(n).padStart(3, '0'); }
    function build(seed) {
      const rng = _seededRng(seed || 'WALLIS');
      const pool = [];
      for (let n = 10; n <= 89; n++) pool.push(n);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const homo = {}, reverse = {};
      for (let i = 0; i < 26; i++) {
        homo[A[i]] = [pool[i * 2], pool[i * 2 + 1]];
        reverse[pool[i * 2]] = A[i];
        reverse[pool[i * 2 + 1]] = A[i];
      }
      return { homo, reverse };
    }
    return {
      encode: (text, key) => {
        const { homo } = build(key);
        const tokens = String(text || '').toUpperCase().split(/\s+/).filter(Boolean);
        const counters = {};
        const out = [];
        for (const tok of tokens) {
          const w = tok.replace(/[^A-Z]/g, '');
          if (!w) continue;
          const idx = WORDLIST.indexOf(w);
          if (idx >= 0) {
            out.push(fmt3(idx + 100));
          } else {
            out.push(fmt2(SENT_OPEN));
            for (const ch of w) {
              const codes = homo[ch];
              const pick = (counters[ch] = (counters[ch] || 0) + 1) % 2;
              out.push(fmt2(codes[pick]));
            }
            out.push(fmt2(SENT_CLOSE));
          }
        }
        return out.join(' ');
      },
      decode: (text, key) => {
        const { reverse } = build(key);
        const groups = String(text || '').match(/\d{2,3}/g) || [];
        const words = [];
        let i = 0;
        while (i < groups.length) {
          const g = groups[i];
          if (g.length === 3) {
            const v = parseInt(g, 10);
            if (v >= 100 && v - 100 < WORDLIST.length) words.push(WORDLIST[v - 100]);
            else words.push('???');
            i++;
          } else {
            const v = parseInt(g, 10);
            if (v === SENT_OPEN) {
              i++;
              let w = '';
              while (i < groups.length) {
                const lv = parseInt(groups[i], 10);
                if (groups[i].length === 2 && lv === SENT_CLOSE) { i++; break; }
                w += reverse[lv] || '?';
                i++;
              }
              words.push(w);
            } else {
              // Stray 2-digit code without sentinel \u2014 treat as a single letter
              words.push(reverse[v] || '?');
              i++;
            }
          }
        }
        return words.join(' ');
      }
    };
  })();

  // Robert Patterson's cipher, from his letter to Thomas Jefferson of
  // 19 December 1801.
  //
  // Patterson's own instructions, as quoted by Smithline (2009): the message
  // is written DOWN the lines -- "the first letter of the message is placed at
  // the beginning of the first line, the second letter at the beginning of the
  // second line, and so on, writing column after column, from left to right".
  // That writing "is then to be distributed into sections of not more than
  // nine lines in each section". Each section is transcribed with its lines
  // "in any order at pleasure", prefixing each line with "any number of
  // arbitrary or insignificant letters, not exceeding nine".
  //
  // The key is a column of two-digit numbers: the first digit of each pair is
  // a line number (their order gives the line permutation), the second is how
  // many arbitrary letters that line carries. The same permutation and the
  // same counts are reused in every section.
  //
  // Source: Lawren M. Smithline, "A Cipher to Thomas Jefferson", American
  // Scientist 97(2), 2009, 142-149.
  const patterson = (() => {
    // Patterson's "arbitrary or insignificant letters" were his choice at the
    // time of writing. A deterministic stand-in keeps the demo reproducible.
    const FILLER = 'QXZJVKWYBGPFMHDCLNTSRAEIOU';

    // Smithline recovered this key for Patterson's challenge cipher.
    const DEFAULT_KEY = '13,34,57,65,22,78,49';

    function parseKey(key) {
      const digits = String(key ?? '').replace(/[^0-9]/g, '');
      const order = [], adds = [];
      for (let i = 0; i + 1 < digits.length; i += 2) {
        order.push(+digits[i]);
        adds.push(+digits[i + 1]);
      }
      const K = order.length;
      // Patterson caps a section at nine lines; the line numbers must be a
      // permutation of 1..K or the key cannot be inverted.
      const valid = K >= 1 && K <= 9 &&
        new Set(order).size === K && order.every(n => n >= 1 && n <= K);
      return valid ? { K, order, adds } : null;
    }

    function junk(lineIndex, count) {
      let s = '';
      for (let t = 0; t < count; t++) s += FILLER[(lineIndex * 5 + t * 3) % 26];
      return s;
    }

    // Writing column-wise into K lines gives line r the characters at
    // positions r, r+K, r+2K, ... so its length follows from the total.
    function lineLength(total, K, r) {
      return Math.floor(total / K) + (r < total % K ? 1 : 0);
    }

    return {
      encode: (text, key) => {
        const k = parseKey(key) || parseKey(DEFAULT_KEY);
        const src = clean(text);
        if (!src) return '';
        const lines = Array.from({ length: k.K }, () => '');
        for (let i = 0; i < src.length; i++) lines[i % k.K] += src[i];
        let out = '';
        for (let j = 0; j < k.K; j++) {
          out += junk(j, k.adds[j]) + lines[k.order[j] - 1];
        }
        return out;
      },
      decode: (text, key) => {
        const k = parseKey(key) || parseKey(DEFAULT_KEY);
        const ct = clean(text);
        const added = k.adds.reduce((a, b) => a + b, 0);
        const total = ct.length - added;
        if (total < 0) return '';
        const lines = new Array(k.K);
        let p = 0;
        for (let j = 0; j < k.K; j++) {
          p += k.adds[j];
          const r = k.order[j] - 1;
          lines[r] = ct.slice(p, p + lineLength(total, k.K, r));
          p += lines[r].length;
        }
        let out = '';
        const width = Math.ceil(total / k.K);
        for (let c = 0; c < width; c++) {
          for (let r = 0; r < k.K; r++) {
            if (c < lines[r].length) out += lines[r][c];
          }
        }
        return out;
      }
    };
  })();

  // Wadsworth's cipher device (Col. Decius Wadsworth, 1817).
  // Two concentric geared discs: the OUTER carries 33 positions (the 26
  // letters plus the digits 2-8), the INNER carries the 26 letters only,
  // and the two are geared 26:33. Enciphering turns the inner disc until
  // the wanted plaintext letter reaches the index; the number of steps
  // that took is read off the outer disc and sent as the ciphertext.
  //
  // Because the step count for a repeated plaintext letter is a full 26
  // and gcd(26, 33) = 1, a given plaintext letter walks through all 33
  // outer symbols before any ciphertext value recurs -- the progressive,
  // long-period behaviour that is the device's whole point. The discs
  // realign only after lcm(26, 33) = 858 steps.
  //
  // Sources: Louis Kruh, "The Mystery of Colonel Decius Wadsworth's
  // Cipher Device", Cryptologia 6(3), 1982, 238-247. The keyed inner
  // sequence is this museum's modelling choice, not a documented setting.
  const wadsworth = (() => {
    const OUTER = A + '2345678';           // 33 positions
    const cleanOuter = text => String(text ?? '').normalize('NFD')
      .replace(/\p{M}/gu, '').toUpperCase().replace(/[^A-Z2-8]/g, '');

    function makeInner(key) {
      const k = clean(key || 'WADSWORTH');
      const seen = new Set();
      let s = '';
      for (const c of k) if (!seen.has(c)) { seen.add(c); s += c; }
      for (const c of A) if (!seen.has(c)) { seen.add(c); s += c; }
      return s;
    }

    return {
      encode: (text, key) => {
        const inner = makeInner(key);
        let innerPos = 0, outerPos = 0, out = '';
        for (const ch of clean(text)) {
          const target = inner.indexOf(ch);
          // "Turn until the letter comes up": never zero steps, so a
          // repeated letter costs a full revolution of 26.
          const steps = mod(target - innerPos, 26) || 26;
          innerPos = target;
          outerPos = mod(outerPos + steps, 33);
          out += OUTER[outerPos];
        }
        return out;
      },
      decode: (text, key) => {
        const inner = makeInner(key);
        let innerPos = 0, outerPos = 0, out = '';
        for (const ch of cleanOuter(text)) {
          const newOuter = OUTER.indexOf(ch);
          const steps = mod(newOuter - outerPos, 33);
          outerPos = newOuter;
          // steps === 26 lands the inner disc back where it started,
          // which is exactly how a repeated letter is recovered.
          innerPos = mod(innerPos + steps, 26);
          out += inner[innerPos];
        }
        return out;
      }
    };
  })();

  // Ethiopian Ge\u02bcez Monastic Cipher (~14th\u201319th c.).
  // Cipher tradition preserved in Ethiopian Orthodox monasteries to protect
  // esoteric and liturgical texts. Demo: keyed monoalphabetic substitution
  // over the Latin alphabet (the actual Ge\u02bcez systems substituted within
  // the Ge\u02bcez syllabary, but the underlying mechanism is the same \u2014 a
  // permutation of the script\u2019s ordered glyph table). The key seeds a
  // shuffled cipher alphabet; the page\u2019s prose explains the syllabary
  // layer.
  const geezMonastic = (() => {
    function buildMap(key) {
      const seed = clean(key) || 'GEEZ';
      const order = _shuffledAlphabet(_seededRng(seed));
      const m = {}, im = {};
      for (let i = 0; i < 26; i++) {
        m[A[i]] = order[i];
        im[order[i]] = A[i];
      }
      return { m, im };
    }
    return {
      encode: (text, key) => {
        const t = clean(text);
        const { m } = buildMap(key);
        let out = '';
        for (const ch of t) out += m[ch] || ch;
        return out;
      },
      decode: (text, key) => {
        const t = clean(text);
        const { im } = buildMap(key);
        let out = '';
        for (const ch of t) out += im[ch] || ch;
        return out;
      }
    };
  })();

  /* ─── Round 3: Diana Cryptosystem (reciprocal US SF field cipher) ─── */
  const diana = (() => {
    // DIANA trigraph rule: P + K + C ≡ 25 (mod 26), i.e. c = (25 - p - k) mod 26.
    // Fully symmetric in all three letters — any two of {plain, key, cipher}
    // yield the third from the same Tri-Graph table, so one lookup both
    // encrypts and decrypts (a strict involution). Sources: NSA, Boak Lectures
    // Vol. I (1973, decl. 2015) pp. 22-25; D. Rijmenants, "DIANA - A Fast
    // Reciprocal One Time Pad Table" (2017); sfrvn.net Commo Security.
    function run(text, key) {
      const t = clean(text);
      const k = clean(key || 'DIANA');
      if (!k.length) return t;
      return t.split('').map((ch, i) => {
        const p = A.indexOf(ch);
        const kp = A.indexOf(k[i % k.length]);
        return A[(77 - p - kp) % 26];
      }).join('');
    }
    return { encode: run, decode: run };
  })();

  return {
    caesar, monoalphabetic, polybius, homophonic, playfair, hill,
    vigenere, beaufort, gronsfeld, porta, runningKey,
    railFence, columnar, doubleTransposition,
    bacon, tapCode, pigpen,
    bifid, trifid, adfgx, adfgvx, nihilist,
    otp, venonaPadReuse, fractionatedMorse, confederateVigenere,
    bazeries, alberti, jefferson, enigma, lorenz,
    dictionaryCode, stager, vic,
    scytale, vernam, greatCipher, babington, navajo, voynich,
    atbash, rot13, foursquare, twosquare, straddlingCheckerboard,
    chaocipher, m209, solitaire, beale, copiale, kryptos, purple,
    autokey, nomenclator, bookCipher, sigaba, typex,
    kamaSutra, aeneasTacticus, jn25, redTypeA,
    affine,
    trithemius, cardanoAutokey, wheatstone, morse, cardanoGrille, nullCipher,
    fialka, kl7, geheimschreiber, kryha, m94,
    chineseTelegraph, zimmermann, slidex, commercialCode,
    culperRing, arnoldAndre,
    argenti, wallisCiphers,
    patterson, wadsworth, geezMonastic,
    diana
  };
})();
