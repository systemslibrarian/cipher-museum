/* Original finite teaching models. No historical intercepts or machine reconstruction. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.CodebreakingEvidence = api; api.mount(document); }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const SMALL = 'ABCDEFGH';
  const mod = n => (n % 26 + 26) % 26;
  function evidence(matches, total, related = 0.075, chance = 1 / 26) {
    if (!Number.isInteger(matches) || !Number.isInteger(total) || matches < 0 || total < matches ||
        !(related > 0 && related < 1 && chance > 0 && chance < 1)) throw new Error('Invalid evidence model.');
    const hit = 10 * Math.log10(related / chance);
    const miss = 10 * Math.log10((1 - related) / (1 - chance));
    const score = matches * hit + (total - matches) * miss;
    return { matches, total, hit, miss, score, factor: 10 ** (score / 10) };
  }
  // Deterministic invented strips; eight coincidences deliberately planted at +3.
  const STRIP_A = 'QNZVJHATMCWESRUXKDFBIPYOLGHEVSNRCATWXQMJDKUBZFPI';
  const baseB = [...'MRZKPOWUNQXEDTIGLBJHCSYVAFRKMQPZUNWXEITDHLBOVASC'];
  for (const i of [2, 8, 14, 20, 26, 32, 38, 44]) baseB[i] = STRIP_A[i + 3];
  const STRIP_B = baseB.join('');
  function alignment(offset, limit = 48) {
    if (!Number.isInteger(offset) || Math.abs(offset) > 6 || ![16, 32, 48].includes(limit)) throw new Error('Invalid alignment.');
    const pairs = [];
    for (let a = 0; a < STRIP_A.length; a++) {
      const b = a - offset;
      if (b >= 0 && b < STRIP_B.length && pairs.length < limit) pairs.push({ a: STRIP_A[a], b: STRIP_B[b], indexA: a, indexB: b, match: STRIP_A[a] === STRIP_B[b] });
    }
    return { offset, pairs, ...evidence(pairs.filter(p => p.match).length, pairs.length) };
  }
  function rankAlignments(limit) {
    return Array.from({ length: 13 }, (_, i) => alignment(i - 6, limit)).sort((a, b) => b.score - a.score || a.offset - b.offset);
  }
  function permutation(p) {
    if (!Array.isArray(p) || p.length === 0 || new Set(p).size !== p.length || p.some(n => !Number.isInteger(n) || n < 0 || n >= p.length)) throw new Error('Invalid permutation.');
    return p;
  }
  function inverse(p) { permutation(p); const inv = []; p.forEach((v, i) => { inv[v] = i; }); return inv; }
  function cycles(p) {
    permutation(p); const seen = new Set(), out = [];
    for (let i = 0; i < p.length; i++) {
      if (seen.has(i)) continue;
      const cycle = []; let j = i;
      while (!seen.has(j)) { seen.add(j); cycle.push(j); j = p[j]; }
      out.push(cycle);
    }
    return out;
  }
  function conjugate(p, s) {
    permutation(p); permutation(s);
    if (p.length !== s.length) throw new Error('Permutation sizes differ.');
    const inv = inverse(s);
    return p.map((_, i) => s[p[inv[i]]]);
  }
  const MAPS = [
    [1, 0, 3, 2, 5, 4, 7, 6], [2, 3, 0, 1, 6, 7, 4, 5], [3, 2, 1, 0, 7, 6, 5, 4],
    [7, 2, 1, 4, 3, 6, 5, 0], [4, 5, 6, 7, 0, 1, 2, 3], [5, 4, 7, 6, 1, 0, 3, 2]
  ];
  const BOARDS = { none: [0,1,2,3,4,5,6,7], ahbe: [7,4,2,3,1,5,6,0], acdf: [2,1,0,5,4,3,6,7] };
  function indicators(board = 'none') {
    if (!Object.hasOwn(BOARDS, board)) throw new Error('Unknown plugboard.');
    const maps = MAPS.map(p => conjugate(p, BOARDS[board]));
    const rows = Array.from({ length: 8 }, (_, i) => {
      const key = [i, (i + 2) % 8, (i + 5) % 8];
      return maps.map((p, k) => p[key[k % 3]]);
    });
    // Reconstruct from observed indicator pairs, not a stored cycle answer.
    const observed = [];
    rows.forEach(row => { observed[row[0]] = row[3]; });
    const result = cycles(observed);
    return { rows, observed, cycles: result, lengths: result.map(c => c.length).sort((a,b) => a-b) };
  }
  const ALL_ORDERS = [];
  for (let a = 1; a <= 5; a++) for (let b = 1; b <= 5; b++) for (let c = 1; c <= 5; c++) {
    if (a !== b && b !== c && a !== c) ALL_ORDERS.push([a,b,c]);
  }
  function wheelOrders(previous, noPositions, noExact) {
    if (!Array.isArray(previous) || previous.length !== 3 || new Set(previous).size !== 3 || previous.some(x => !Number.isInteger(x) || x < 1 || x > 5)) throw new Error('Invalid previous wheel order.');
    const orders = ALL_ORDERS.filter(order => (!noPositions || order.every((x,i) => x !== previous[i])) && (!noExact || order.some((x,i) => x !== previous[i])));
    return { orders, count: orders.length, bits: Math.log2(orders.length), excluded: 60 - orders.length };
  }
  function caesar(text, shift) { return [...text].map(c => ALPHABET[mod(ALPHABET.indexOf(c) + shift)]).join(''); }
  function vigenere(text, key, decrypt = false) {
    if (!/^[A-Z]+$/.test(text) || !/^[A-Z]+$/.test(key)) throw new Error('Use uppercase A–Z.');
    return [...text].map((c,i) => ALPHABET[mod(ALPHABET.indexOf(c) + (decrypt ? -1 : 1) * ALPHABET.indexOf(key[i % key.length]))]).join('');
  }
  const DISPATCH = 'SENDSUPPLIESTOHARBOR';
  const DECOY = 'SENDPATROLSTOHARBORX';
  const STRONG = vigenere(DISPATCH, 'TIDES');
  function dispatchCase(kind) {
    if (!['same', 'different'].includes(kind)) throw new Error('Unknown dispatch case.');
    return { weak: caesar(kind === 'same' ? DISPATCH : DECOY, 4), strong: STRONG };
  }
  function deriveKey(ciphertext, plaintext, period = 5) {
    if (!/^[A-Z]+$/.test(ciphertext) || !/^[A-Z]+$/.test(plaintext) || !Number.isInteger(period) || period < 1 || Math.min(ciphertext.length, plaintext.length) < period) throw new Error('Invalid crib.');
    return [...plaintext.slice(0,period)].map((p,i) => ALPHABET[mod(ALPHABET.indexOf(ciphertext[i]) - ALPHABET.indexOf(p))]).join('');
  }
  function checkDispatch(plaintext, key) {
    const decoded = vigenere(STRONG, key, true);
    const checks = [...decoded.slice(5)].map((c,i) => c === plaintext[i+5]);
    return { decoded, matches: checks.filter(Boolean).length, total: checks.length, consistent: decoded.length === plaintext.length && checks.every(Boolean) };
  }
  function mount(doc) {
    const $ = id => doc.getElementById(id);
    const tableRows = (id, rows) => $(id).replaceChildren(...rows.map(values => {
      const tr = doc.createElement('tr'); values.forEach(value => { const td = doc.createElement('td'); td.textContent = String(value); tr.append(td); }); return tr;
    }));
    if ($('ban-offset')) {
      const render = () => {
        const limit = Number($('ban-sample').value), r = alignment(Number($('ban-offset').value), limit);
        $('ban-offset-value').textContent = (r.offset >= 0 ? '+' : '') + r.offset;
        for (const [id, key] of [['ban-strip-a','a'],['ban-strip-b','b']]) $(id).replaceChildren(...r.pairs.map(p => {
          const cell = doc.createElement('span'); cell.textContent = p[key]; cell.className = p.match ? 'evidence-letter is-match' : 'evidence-letter';
          cell.title = (key === 'a' ? p.indexA : p.indexB) + 1 + ': ' + (p.match ? 'coincidence' : 'different letters'); return cell;
        }));
        $('ban-result').textContent = `${r.matches} coincidences in ${r.total} comparisons. Score ${r.score.toFixed(2)} decibans; likelihood ratio ${r.factor.toFixed(2)}. Each coincidence adds ${r.hit.toFixed(2)}; each non-match adds ${r.miss.toFixed(2)}. A positive score favors the related model; it is not a probability of correctness.`;
        tableRows('ban-ranking', rankAlignments(limit).map(x => [(x.offset >= 0 ? '+' : '') + x.offset, x.matches + ' / ' + x.total, x.score.toFixed(2)]));
      };
      $('ban-offset').addEventListener('input', render); $('ban-sample').addEventListener('change', render); render();
    }
    if ($('cycle-board')) {
      const render = () => {
        const r = indicators($('cycle-board').value), baseline = indicators();
        tableRows('cycle-indicators', r.rows.map((row,i) => [i + 1, row.map(x => SMALL[x]).join(''), SMALL[row[0]] + ' → ' + SMALL[row[3]]]));
        const notation = cs => cs.map(c => '(' + c.map(x => SMALL[x]).join(' → ') + ' → ' + SMALL[c[0]] + ')').join(' ');
        $('cycle-baseline').textContent = notation(baseline.cycles);
        $('cycle-current').textContent = notation(r.cycles);
        $('cycle-result').textContent = 'Cycle lengths: ' + r.lengths.join(' + ') + '. The labels may change; the cycle lengths survive conjugation. This characteristic constrains candidates but does not uniquely identify a key.';
      };
      $('cycle-board').addEventListener('change', render); render();
    }
    if ($('rules-previous')) {
      const render = () => {
        const r = wheelOrders($('rules-previous').value.split('').map(Number), $('rules-position').checked, $('rules-exact').checked);
        $('rules-result').textContent = `${r.count} of 60 rotor orders remain; ${r.excluded} excluded. With uniform choice among these allowed orders, conditional entropy is ${r.bits.toFixed(3)} bits (unrestricted: ${Math.log2(60).toFixed(3)}). This counts rotor order only, assuming the attacker knows yesterday’s order and the policy.`;
        $('rules-orders').textContent = r.orders.map(order => order.join('–')).join('  ·  ');
      };
      ['rules-previous','rules-position','rules-exact'].forEach(id => $(id).addEventListener('change',render)); render();
    }
    if ($('kiss-case')) {
      let plaintext = '', key = '';
      const reset = () => {
        const f = dispatchCase($('kiss-case').value);
        $('kiss-weak').textContent = f.weak; $('kiss-strong').textContent = f.strong;
        plaintext = ''; key = ''; $('kiss-plaintext').textContent = 'The weak copy is still unread.';
        $('kiss-key').textContent = 'Recover the weak copy first.'; $('kiss-equations').replaceChildren();
        $('kiss-derive').disabled = true; $('kiss-check').disabled = true;
        $('kiss-result').textContent = 'No test yet. Matching lengths alone do not establish a shared message.';
      };
      $('kiss-case').addEventListener('change',reset);
      $('kiss-reset').addEventListener('click',reset);
      $('kiss-decode').addEventListener('click', () => {
        plaintext = caesar(dispatchCase($('kiss-case').value).weak, -4);
        $('kiss-plaintext').textContent = plaintext; $('kiss-derive').disabled = false;
      });
      $('kiss-derive').addEventListener('click', () => {
        if (!plaintext) return;
        key = deriveKey(STRONG, plaintext);
        $('kiss-key').textContent = key + ' — candidate key from the first five positions only.';
        tableRows('kiss-equations', [...key].map((k,i) => [i+1,STRONG[i],plaintext[i],`${ALPHABET.indexOf(STRONG[i])} − ${ALPHABET.indexOf(plaintext[i])} mod 26 = ${ALPHABET.indexOf(k)} (${k})`]));
        $('kiss-check').disabled = false;
      });
      $('kiss-check').addEventListener('click', () => {
        if (!key) return;
        const r = checkDispatch(plaintext,key);
        $('kiss-result').textContent = `${r.decoded}. Held-out positions 6–20: ${r.matches} / ${r.total} match the weak copy. ` + (r.consistent ? 'Consistent with the shared-plaintext hypothesis in this invented fixture. The first five positions fitted by construction; the remaining positions supplied the test.' : 'The shared-plaintext hypothesis fails this check. Do not promote the fitted key to a confirmed recovery.');
      }); reset();
    }
  }
  return { evidence, alignment, rankAlignments, STRIP_A, STRIP_B, inverse, cycles, conjugate, indicators, MAPS, BOARDS, wheelOrders, ALL_ORDERS, caesar, vigenere, dispatchCase, deriveKey, checkDispatch, mount };
});
