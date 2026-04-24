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
      'PQRSTUVWXYZNOLMABCDEFGHIJK', 'QRSTUVWXYZNOPKLMABCDEFGHIJ',
      'RSTUVWXYZNOPQJKLMABCDEFGHI', 'STUVWXYZNOPQRIJKLMABCDEFGH',
      'TUVWXYZNOPQRSHIJKLMABCDEFG', 'UVWXYZNOPQRSTGHIJKLMABCDEF',
      'VWXYZNOPQRSTUFGHIJKLMABCDE', 'WXYZNOPQRSTUVEFGHIJKLMABCD',
      'XYZNOPQRSTUVWDEFGHIJKLMABC', 'YZNOPQRSTUVWXCDEFGHIJKLMAB',
      'ZNOPQRSTUVWXYBCDEFGHIJKLMA'
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

  /* ─── 34. Scytale ─── */
  const scytale = (() => ({
    encode: (text, key) => {
      const t = clean(text), rows = Math.max(2, parseInt(key) || 3);
      const cols = Math.ceil(t.length / rows);
      const padded = t.padEnd(rows * cols, 'X');
      let r = '';
      for (let c = 0; c < cols; c++)
        for (let row = 0; row < rows; row++) r += padded[row * cols + c];
      return r;
    },
    decode: (text, key) => {
      const t = clean(text), rows = Math.max(2, parseInt(key) || 3);
      const cols = Math.ceil(t.length / rows);
      const padded = t.padEnd(rows * cols, 'X');
      let r = '';
      for (let row = 0; row < rows; row++)
        for (let c = 0; c < cols; c++) r += padded[c * rows + row];
      return r;
    }
  }))();

  /* ─── 35. Vernam (XOR) ─── */
  const vernam = (() => ({
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
      if (t.length % 2) t += 'X';
      let out = '';
      for (let i = 0; i < t.length; i += 2) {
        const a = t[i], b = t[i + 1];
        const [r1, c1] = pos(enc ? L : L, a);
        const [r2, c2] = pos(enc ? R : R, b);
        if (r1 === r2) { out += L[r1 * 5 + c1] + R[r2 * 5 + c2]; } // same row → unchanged
        else { out += L[r1 * 5 + c2] + R[r2 * 5 + c1]; }
      }
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
      const t = clean(text); let out = '';
      for (const ch of t) {
        const r = nextKeystream(deck); deck = r.deck;
        const p = ch.charCodeAt(0) - 64;
        const c = enc ? ((p + r.value - 1) % 26) + 1 : ((p - r.value + 26 - 1) % 26) + 1;
        out += String.fromCharCode(64 + (c === 0 ? 26 : c));
      }
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
  // The real Purple split letters into "sixes" (6 vowels) and "twenties" (20 consonants)
  // routed through stepping switches. We model the essence: a substitution that
  // changes per character based on three stepping wheels.
  const purple = (() => {
    function build(key) {
      const k = (clean(key || 'PURPLE') + 'TOKYO').split('').map(c => c.charCodeAt(0));
      let s = 0; for (const x of k) s = (s * 131 + x) & 0x7fffffff;
      if (s === 0) s = 1;
      const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
      // 25 substitution alphabets (simulating switch positions)
      const alphas = [];
      for (let i = 0; i < 25; i++) {
        const arr = A.split('');
        for (let j = arr.length - 1; j > 0; j--) {
          const r = Math.floor(rng() * (j + 1));
          [arr[j], arr[r]] = [arr[r], arr[j]];
        }
        alphas.push(arr.join(''));
      }
      return alphas;
    }
    function step(i) {
      // Three wheels with periods 25, 24, 23 — pick alphabet by their sum
      return ((i % 25) + Math.floor(i / 25) % 24 + Math.floor(i / 600) % 23) % 25;
    }
    return {
      encode: (text, key) => {
        const alphas = build(key);
        const t = clean(text); let out = '';
        for (let i = 0; i < t.length; i++) {
          const a = alphas[step(i)];
          out += a[A.indexOf(t[i])];
        }
        return out;
      },
      decode: (text, key) => {
        const alphas = build(key);
        const t = clean(text); let out = '';
        for (let i = 0; i < t.length; i++) {
          const a = alphas[step(i)];
          out += A[a.indexOf(t[i])];
        }
        return out;
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
    dictionaryCode, stager, vic,
    scytale, vernam, greatCipher, babington, navajo, voynich,
    atbash, rot13, foursquare, twosquare, straddlingCheckerboard,
    chaocipher, m209, solitaire, beale, copiale, kryptos, purple
  };
})();
