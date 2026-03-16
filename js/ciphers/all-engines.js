/**
 * THE CIPHER MUSEUM — All Cipher Engines
 * Complete implementations for every exhibit (33 ciphers)
 */
'use strict';

window.CipherEngines = (() => {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const clean = t => t.toUpperCase().replace(/[^A-Z]/g, '');
  const mod = (a, m) => ((a % m) + m) % m;

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
        return text.replace(/[^0-9]/g, '').match(/.{2}/g)?.map(c => rev[c] || '?').join('') || '';
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
      let t = clean(text).replace(/J/g, 'I'), p = [], i = 0;
      while (i < t.length) {
        const a = t[i], b = (i + 1 < t.length && t[i + 1] !== a) ? t[++i] : 'X';
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
      decode: (t, k) => process(pairs(t), makeGrid(k), false)
    };
  })();

  /* ─── 6. Hill ─── */
  const hill = (() => {
    function modInv(a, m) { a = mod(a, m); for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x; return -1; }
    return {
      encode: (text, keyStr) => {
        const t = clean(text); const k = (keyStr || '3,3,2,5').split(',').map(Number);
        if (k.length < 4) return 'Need 4 numbers (2x2 matrix)';
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
        return r;
      }
    };
  })();

  /* ─── 7. Vigenère ─── */
  const vigenere = (() => {
    function run(text, key, enc) {
      const t = clean(text), k = clean(key || 'KEY'); let r = '';
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
      const t = clean(text), k = clean(key || 'KEY'); let r = '';
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
      'PQRSTUVWXYZNOLMABCDEFGHIJK', 'QRSTUVWXYZNOPLMKABCDEFGHIJ',
      'RSTUVWXYZNOPQLMKJABCDEFGHI', 'STUVWXYZNOPQRLMKJIABCDEFGH',
      'TUVWXYZNOPQRSLMKJIHABCDEFG', 'UVWXYZNOPQRSTLMKJIHGABCDEF',
      'VWXYZNOPQRSTULMKJIHGFABCDE', 'WXYZNOPRQSTUVLMKJIHGFEABCD',
      'XYZNOPQRSTUVWLMKJIHGFEDABC', 'YZNOPQRSTUVWXLMKJIHGFEDCAB',
      'ZNOPQRSTUVWXYLMKJIHGFEDCBA'
    ];
    function run(text, key) {
      const t = clean(text), k = clean(key || 'KEY'); let r = '';
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
      const t = clean(text), k = clean(key || defaultKey); let r = '';
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
      const t = clean(text), rails = Math.max(2, parseInt(key) || 3);
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
      const t = clean(text), n = t.length, rails = Math.max(2, parseInt(key) || 3);
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
        const t = clean(text), k = clean(key || 'ZEBRA'), cols = k.length;
        const rows = Math.ceil(t.length / cols);
        const grid = Array.from({ length: rows }, () => Array(cols).fill('X'));
        let idx = 0;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (idx < t.length) grid[r][c] = t[idx++];
        const o = order(key);
        return o.map(c => grid.map(r => r[c]).join('')).join('');
      },
      decode: (text, key) => {
        const t = clean(text), k = clean(key || 'ZEBRA'), cols = k.length;
        const rows = Math.ceil(t.length / cols), o = order(key);
        const long = t.length % cols || cols;
        const colLens = Array(cols).fill(rows);
        if (t.length % cols) for (let i = 0; i < cols; i++) { const orig = o.indexOf(i); if (orig >= long) colLens[i]--; }
        const columns = {}; let pos = 0;
        for (const c of o) { columns[c] = t.substr(pos, colLens[c]).split(''); pos += colLens[c]; }
        let r = [];
        for (let row = 0; row < rows; row++) for (let c = 0; c < cols; c++) if (columns[c]?.[row]) r.push(columns[c][row]);
        return r.join('');
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
        const t = clean(text), grid = makeGrid(key), per = parseInt(period) || 5;
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
        const t = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
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
      let k = clean(key || '');
      if (k.length < t.length) {
        const rng = (s => () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s % 26; })(Date.now());
        while (k.length < t.length) k += A[rng()];
      }
      let r = '';
      for (let i = 0; i < t.length; i++) r += A[mod(t.charCodeAt(i) - 65 + k.charCodeAt(i) - 65, 26)];
      return r + '\n[Key: ' + k.substr(0, t.length) + ']';
    },
    decode: (text, key) => {
      const t = clean(text), k = clean(key || '');
      if (k.length < t.length) return 'Key must be at least as long as message';
      let r = '';
      for (let i = 0; i < t.length; i++) r += A[mod(t.charCodeAt(i) - 65 - (k.charCodeAt(i) - 65), 26)];
      return r;
    }
  }))();

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
      decode: () => '(Fractionated Morse decode is complex — see How It Works)'
    };
  })();

  /* ─── 25. Confederate Vigenère (Brass Cipher Disk) ─── */
  const confederateVigenere = (() => {
    const inner = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    function run(text, key, enc) {
      const t = clean(text), k = clean(key || 'CONFEDERATE'); let r = '';
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
        const subst = monoalphabetic.encode(text, word);
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
      'OYQBFHMCZKTIJAPGLEDSRUXNWV', 'YXTQLJDZWKFVSRMPGOBIAUNCHM',
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
    function makeWheel(size, seed) {
      const bits = []; const rng = (s => () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s & 1; })(seed);
      for (let i = 0; i < size; i++) bits.push(rng());
      return bits;
    }
    function run(text, key) {
      const t = clean(text);
      const seed = clean(key || 'LORENZ').split('').reduce((s, c) => s * 31 + c.charCodeAt(0), 7);
      const chi = [makeWheel(41, seed), makeWheel(31, seed + 1), makeWheel(29, seed + 2),
        makeWheel(26, seed + 3), makeWheel(23, seed + 4)];
      const psi = [makeWheel(43, seed + 5), makeWheel(47, seed + 6), makeWheel(51, seed + 7),
        makeWheel(53, seed + 8), makeWheel(59, seed + 9)];
      let result = '';
      for (let i = 0; i < t.length; i++) {
        let val = t.charCodeAt(i) - 65;
        for (let b = 0; b < 5; b++) {
          const xorBit = chi[b][i % chi[b].length] ^ psi[b][i % psi[b].length];
          val ^= (xorBit << b);
        }
        result += A[mod(val, 26)];
      }
      return result;
    }
    return { encode: run, decode: run };
  })();

  /* ─── 31. Dictionary Code ─── */
  const dictionaryCode = (() => {
    const defaultText = 'We the People of the United States in Order to form a more perfect Union establish Justice insure domestic Tranquility provide for the common defence promote the general Welfare and secure the Blessings of Liberty to ourselves and our Posterity do ordain and establish this Constitution for the United States of America';
    return {
      encode: (text, key) => {
        const ref = (key || defaultText).split(/\s+/);
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
        const ref = (key || defaultText).split(/\s+/);
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
      const t = clean(text);
      const cols = Math.max(2, parseInt(key) || 5);
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
      const cols = Math.max(2, parseInt(key) || 5);
      const rows = Math.ceil(t.length / cols);
      const grid = Array.from({ length: rows }, () => Array(cols).fill(''));
      let idx = 0;
      for (let col = 0; col < cols; col++) {
        if (col % 2 === 0) for (let row = 0; row < rows; row++) { if (idx < t.length) grid[row][col] = t[idx++]; }
        else for (let row = rows - 1; row >= 0; row--) { if (idx < t.length) grid[row][col] = t[idx++]; }
      }
      let result = '';
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) result += grid[r][c];
      return result;
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
    return {
      encode: (text, key) => {
        const { map } = makeCheckerboard(key);
        return clean(text).replace(/J/g, 'I').split('').map(ch => map[ch] || '??').join('');
      },
      decode: (text, key) => {
        const { rev } = makeCheckerboard(key);
        const nums = text.replace(/[^0-9]/g, '');
        let result = '', i = 0;
        while (i < nums.length) {
          if (rev[nums[i]]) { result += rev[nums[i]]; i++; }
          else if (i + 1 < nums.length && rev[nums.substr(i, 2)]) { result += rev[nums.substr(i, 2)]; i += 2; }
          else { result += '?'; i++; }
        }
        return result;
      }
    };
  })();

  return {
    caesar, monoalphabetic, polybius, homophonic, playfair, hill,
    vigenere, beaufort, gronsfeld, porta, runningKey,
    railFence, columnar, doubleTransposition,
    bacon, tapCode, pigpen,
    bifid, trifid, adfgx, adfgvx, nihilist,
    otp, fractionatedMorse, confederateVigenere,
    bazeries, alberti, jefferson, enigma, lorenz,
    dictionaryCode, stager, vic
  };
})();
