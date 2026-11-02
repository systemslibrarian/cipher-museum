/* Original, bounded teaching fixtures. No manuscript or solver output is changed. */
(function (root) {
  'use strict';
  const ciphertext = 'A B B C A B D C E F F E'.split(' ');
  const candidates = { fluent: 'SEND ME AT NOON', consistent: 'MEET ME AT NOON' };
  const keyA = { 1: 'M', 2: 'E', 3: 'T', 4: 'N', 5: 'O', 6: 'R' };
  const keyB = { 1: 'N', 2: 'O', 3: 'R', 4: 'M', 5: 'E', 6: 'T' };
  const original = '1 5 5 3 / 1 5 / 9';
  const tables = {
    regular: { A: 41, B: 42, C: 43, D: 44, E: 45, F: 46 },
    shuffled: { A: 41, B: 42, C: 46, D: 43, E: 45, F: 44 }
  };
  function inspect(candidate) {
    const letters = candidate.replace(/ /g, '');
    if (!/^[A-Z]+$/.test(letters) || letters.length !== ciphertext.length) throw new Error('Expected twelve A–Z letters.');
    return [...new Set(ciphertext)].map(symbol => {
      const positions = ciphertext.flatMap((s, i) => s === symbol ? [i + 1] : []);
      const readings = [...new Set(positions.map(p => letters[p - 1]))];
      return { symbol, positions, readings, conflict: readings.length > 1 };
    });
  }
  function decode(useOtherKey) {
    return original.split(' ').map(s => s === '/' ? '/' : (useOtherKey && s === '5' ? keyB[s] : keyA[s]) || '?').join(' ');
  }
  function tableFor(mode) {
    if (!Object.prototype.hasOwnProperty.call(tables, mode)) throw new Error('Unknown table.');
    return tables[mode];
  }
  function encode(mode) { const t = tableFor(mode); return [...'FACE'].map(c => t[c]).join(' '); }
  function checkPrediction(mode, guess) {
    if (!Number.isInteger(guess) || guess < 41 || guess > 46) throw new Error('Choose a whole number from 41 to 46.');
    return { correct: guess === tableFor(mode).C, answer: tableFor(mode).C };
  }
  function mount(doc) {
    const byId = id => doc.getElementById(id);
    if (byId('reading-candidate')) {
      const choose = byId('reading-candidate');
      function render() {
        const candidate = candidates[choose.value];
        byId('reading-plaintext').textContent = candidate;
        const list = byId('reading-symbols'); list.replaceChildren();
        for (const row of inspect(candidate)) {
          const b = doc.createElement('button'); b.type = 'button'; b.className = 'btn btn-secondary';
          b.textContent = row.symbol; b.setAttribute('aria-label', 'Inspect symbol ' + row.symbol);
          b.addEventListener('click', () => {
            list.querySelectorAll('button').forEach(el => el.setAttribute('aria-pressed', String(el === b)));
            byId('reading-result').textContent = 'Symbol ' + row.symbol + ', positions ' + row.positions.join(', ') + ': ' + row.readings.join(' and ') + '. ' + (row.conflict ? 'Conflict: this symbol would need more than one plaintext letter.' : 'These occurrences agree. Check the other symbols too.');
          });
          b.setAttribute('aria-pressed', 'false'); list.append(b);
        }
        byId('reading-result').textContent = 'Choose a symbol to inspect its repeated occurrences.';
      }
      byId('reading-check').addEventListener('click', () => {
        const conflicts = inspect(candidates[choose.value]).filter(r => r.conflict);
        byId('reading-result').textContent = conflicts.length ? 'Reject this candidate under the stated model: symbols ' + conflicts.map(r => r.symbol).join(', ') + ' have conflicting readings. A fluent sentence is not enough.' : 'All mappings fit this fragment and are one-to-one. That is a consistency check, not proof of the message’s origin or a unique decipherment. Test a new passage and independent evidence.';
      });
      choose.addEventListener('change', render); render();
    }
    if (byId('key-confusion-toggle')) {
      const toggle = byId('key-confusion-toggle');
      function render() {
        byId('confusion-literal').textContent = decode(false);
        byId('confusion-proposal').textContent = toggle.checked ? decode(true) : 'No alternative reading applied.';
        byId('confusion-result').textContent = toggle.checked ? 'Using key B only for symbol 5 gives E in three places. This supports testing key confusion; it does not prove who made an error. Symbol 9 remains unresolved under both keys.' : 'The recorded symbols and literal key-A reading are unchanged. Symbol 9 is unknown, not a null to discard.';
      }
      toggle.addEventListener('change', render); render();
    }
    if (byId('table-prediction')) {
      const mode = byId('table-mode');
      function reset() {
        byId('table-ciphertext').textContent = encode(mode.value);
        byId('table-hidden-entries').textContent = 'C → ?; D → ?; E → ?; F → ?';
        byId('table-guess').value = ''; byId('table-result').textContent = 'A → 41 and B → 42 are known. Predict C, then reveal the remaining entries.';
      }
      byId('table-prediction').addEventListener('submit', event => {
        event.preventDefault();
        try {
          const value = byId('table-guess').value.trim();
          const result = checkPrediction(mode.value, value === '' ? NaN : Number(value));
          const t = tableFor(mode.value);
          byId('table-hidden-entries').textContent = ['C', 'D', 'E', 'F'].map(c => c + ' → ' + t[c]).join('; ');
          byId('table-result').textContent = (result.correct ? 'Your prediction matches: ' : 'Your prediction does not match: ') + 'C → ' + result.answer + '. ' + (mode.value === 'regular' ? 'Consecutive numbering predicted this entry. Two observed mappings alone did not guarantee that rule; the revealed entries now let you test it.' : 'The same two clues also fit this shuffled table. A guessed numbering pattern is a hypothesis, not a recovered key.');
        } catch (e) { byId('table-result').textContent = e.message; }
      });
      mode.addEventListener('change', reset); byId('table-reset').addEventListener('click', reset); reset();
    }
  }
  const api = { ciphertext, candidates, inspect, decode, original, encode, checkPrediction, mount };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', () => mount(root.document), { once: true });
    else mount(root.document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
