(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.CharlesVCase = api; api.mount(document); }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';

  // Original museum fixture. These labels and readings are not from Charles V's letter.
  const MESSAGE = Object.freeze(['g1', 'g2', 'g3', 'g4', 'g5']);
  const FRAGMENT = Object.freeze({ tokens: Object.freeze(['g1', 'g2']), reading: 'GOTO' });
  const CHECK_COPY = Object.freeze({ tokens: Object.freeze(['g2', 'g4', 'g1']), reading: 'TOGO' });
  const PARTIAL_KEY = Object.freeze({
    g1: Object.freeze({ kind: 'letters', value: 'GO' }),
    g2: Object.freeze({ kind: 'letters', value: 'TO' }),
    g3: Object.freeze({ kind: 'word', value: 'GATE' }),
    g4: Object.freeze({ kind: 'null', value: '' })
  });

  function assessUnits(model, tokens, reading) {
    if (!['letters', 'mixed'].includes(model)) throw new Error('Unknown token model');
    if (!Array.isArray(tokens) || typeof reading !== 'string') throw new Error('Invalid aligned fragment');
    const tokenCount = tokens.length;
    const characterCount = Array.from(reading).length;
    const compatible = model === 'letters' ? tokenCount === characterCount : tokenCount > 0 || characterCount === 0;
    return { tokenCount, characterCount, compatible };
  }

  function decode(tokens, key) {
    if (!Array.isArray(tokens) || !key || typeof key !== 'object') throw new Error('Invalid tokens or key');
    const unknown = [];
    const pieces = tokens.map(token => {
      if (!Object.prototype.hasOwnProperty.call(key, token)) {
        unknown.push(token);
        return '[' + token + ']';
      }
      const entry = key[token];
      if (!entry || !['letters', 'word', 'null'].includes(entry.kind) || typeof entry.value !== 'string' ||
          (entry.kind === 'null' ? entry.value !== '' : entry.value === '')) throw new Error('Invalid key entry for ' + token);
      return entry.value;
    });
    return { text: pieces.join(''), unknown };
  }

  function checkCopy(tokens, reading, key) {
    const result = decode(tokens, key);
    return { ...result, matches: result.unknown.length === 0 && result.text === reading };
  }

  function candidateKey(nullChoice) {
    if (!['null', 'letter'].includes(nullChoice)) throw new Error('Unknown null hypothesis');
    return { ...PARTIAL_KEY, g4: nullChoice === 'null' ? PARTIAL_KEY.g4 : { kind: 'letters', value: 'E' } };
  }

  function mount(doc) {
    const section = doc.getElementById('charles-v');
    if (!section || section.dataset.mounted === 'true') return;
    section.dataset.mounted = 'true';
    const $ = id => doc.getElementById(id);
    let fragmentOpen = false;
    let keyOpen = false;

    function record(text) {
      const item = doc.createElement('li');
      item.textContent = text;
      $('charles-record').appendChild(item);
      $('charles-record-empty').hidden = true;
    }

    function renderReading() {
      const result = decode(MESSAGE, candidateKey($('charles-null').value));
      $('charles-reading').textContent = result.text;
      $('charles-reading-note').textContent = 'The literal reading retains ' + result.unknown.map(t => '[' + t + ']').join(', ') +
        ' as unknown. No spaces or missing words have been supplied.';
    }

    $('charles-check-model').addEventListener('click', () => {
      fragmentOpen = true;
      $('charles-fragment').hidden = false;
      $('charles-reveal-key').disabled = false;
      const model = $('charles-model').value;
      const result = assessUnits(model, FRAGMENT.tokens, FRAGMENT.reading);
      const text = result.tokenCount + ' tokens correspond to ' + result.characterCount + ' characters. ' +
        (model === 'letters' ?
          (result.compatible ? 'One letter per token is compatible with this length; the values still need evidence.' :
            'One letter per token is contradicted by this fragment, whatever letters you choose.') :
          (result.compatible ? 'Mixed units are compatible with this length. It does not determine the token boundaries or a unique key.' :
            'This fragment has no tokens from which the proposed units could produce its reading.'));
      $('charles-model-result').textContent = text;
      record((model === 'letters' ? 'One-letter hypothesis. ' : 'Mixed-unit hypothesis. ') + text);
    });

    $('charles-model').addEventListener('change', () => {
      $('charles-model-result').textContent = 'Hypothesis changed. Open the fragment again to record this check; earlier checks remain below.';
    });

    $('charles-reveal-key').addEventListener('click', () => {
      if (!fragmentOpen) return;
      keyOpen = true;
      $('charles-key').hidden = false;
      $('charles-check-copy').disabled = false;
      renderReading();
    });

    $('charles-null').addEventListener('change', () => {
      if (!keyOpen) return;
      renderReading();
      $('charles-copy-result').textContent = 'Candidate changed. Check it against the copy; earlier results remain in your record.';
    });

    $('charles-check-copy').addEventListener('click', () => {
      if (!keyOpen) return;
      $('charles-copy').hidden = false;
      const result = checkCopy(CHECK_COPY.tokens, CHECK_COPY.reading, candidateKey($('charles-null').value));
      const text = 'Candidate reads ' + result.text + '; the separate copy reads ' + CHECK_COPY.reading + '. ' +
        (result.matches ? 'Exact agreement for this copy. The main message still contains unknown g5; this is not a complete key.' :
          'Mismatch: this candidate fails the check copy. Preserve the failed reading before changing the key.');
      $('charles-copy-result').textContent = text;
      record(($('charles-null').value === 'null' ? 'g4 retained as a null. ' : 'g4 changed to E. ') + text);
    });

    $('charles-reset').addEventListener('click', () => {
      fragmentOpen = false;
      keyOpen = false;
      $('charles-model').value = 'letters';
      $('charles-null').value = 'null';
      for (const id of ['charles-fragment', 'charles-key', 'charles-copy']) $(id).hidden = true;
      for (const id of ['charles-reveal-key', 'charles-check-copy']) $(id).disabled = true;
      $('charles-model-result').textContent = 'Stages restarted. Your earlier checks remain in the record.';
      $('charles-copy-result').textContent = '';
      $('charles-reading').textContent = '';
      $('charles-reading-note').textContent = '';
    });
  }

  return { MESSAGE, FRAGMENT, CHECK_COPY, PARTIAL_KEY, assessUnits, decode, checkCopy, candidateKey, mount };
});
