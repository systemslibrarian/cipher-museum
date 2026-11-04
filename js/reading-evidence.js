/* Original museum exercises; source papers are credited on the companion page. */
(function (root) {
  'use strict';
  const keyTokens = '1 2 2 3 / 4 3 / 5 4 3 2'.split(' ');
  const keys = {
    A: { 1: 'S', 2: 'O', 3: 'N', 4: 'I', 5: 'D' },
    B: { 1: 'M', 2: 'E', 3: 'T', 4: 'A' },
    C: { 1: 'M', 2: 'E', 3: 'T', 4: 'A', 5: 'G' }
  };
  function applyKey(id) {
    if (!Object.hasOwn(keys, id)) throw new Error('Choose key A, B or C.');
    const unresolved = keyTokens.filter(t => t !== '/' && !Object.hasOwn(keys[id], t)).length;
    return { text: keyTokens.map(t => t === '/' ? ' ' : keys[id][t] || '?').join(''), unresolved, total: 10 };
  }
  const spans = [
    { text: 'London, 14 May 1625:', kind: 'cleartext', why: 'The invented sender left this dateline unencrypted. Digits alone do not make a passage ciphertext.' },
    { text: '31 47 31', kind: 'ciphertext', why: 'The invented key records 31 → M and 47 → E: this encrypted passage reads MEM. Appearance alone was only a clue.' },
    { text: 'MON AMI', kind: 'cleartext', why: 'The sender left this French greeting unencrypted. A letter can switch languages; this greeting does not establish the language of every other passage.' },
    { text: '19 20', kind: 'uncertain', why: 'No matching key or contextual explanation survives in this case. These could be codes or ordinary numbers. Leave them unresolved.' },
    { text: 'SEND', kind: 'ciphertext', why: 'The supplied case key maps S → P, E → B, N → K, D → A, giving PBKA. A ciphertext can happen to spell a familiar word. Without the key, uncertainty was reasonable.' },
    { text: '[mark unreadable]', kind: 'uncertain', why: 'This is an editorial report of damage, not letters recovered from the source. Do not feed the bracketed words to a cipher solver.' }
  ];
  function checkSpans(answers) {
    if (!Array.isArray(answers) || answers.length !== spans.length || answers.some(a => !['cleartext', 'ciphertext', 'uncertain'].includes(a))) throw new Error('Mark every passage first.');
    return spans.map((s, i) => ({ ...s, agrees: answers[i] === s.kind, chosen: answers[i] }));
  }
  const phrases = { modern: 'SEND THE SHIP AT NOON', older: 'SENDE THE SHIPPE AT NOONE' };
  const vocabularies = { modern: ['SEND', 'THE', 'SHIP', 'AT', 'NOON'], older: ['SENDE', 'THE', 'SHIPPE', 'AT', 'NOONE'] };
  function shift(text, n) {
    return text.replace(/[A-Z]/g, c => String.fromCharCode(65 + ((c.charCodeAt(0) - 65 + n) % 26 + 26) % 26));
  }
  function distance(a, b) {
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const row = [i];
      for (let j = 1; j <= b.length; j++) row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + Number(a[i - 1] !== b[j - 1]));
      previous = row;
    }
    return previous[b.length];
  }
  // No answer key is passed to the search. Exhaust all 26 Caesar shifts and
  // score exact dictionary-word matches; ties are retained, never called solved.
  function rankCaesar(ciphertext, profile) {
    if (!Object.hasOwn(vocabularies, profile)) throw new Error('Unknown vocabulary.');
    return Array.from({ length: 26 }, (_, key) => {
      const text = shift(ciphertext, -key);
      const score = text.split(/\s+/).filter(w => vocabularies[profile].includes(w)).length;
      return { key, text, score };
    }).sort((a, b) => b.score - a.score || a.key - b.key);
  }
  function noiseExperiment(spelling, noise, profile) {
    if (!Object.hasOwn(phrases, spelling) || !['none', 'substitute', 'delete'].includes(noise)) throw new Error('Unknown experiment setting.');
    const original = phrases[spelling], clean = shift(original, 7);
    const at = original.indexOf('SHIP');
    let damaged = clean;
    if (noise === 'substitute') damaged = clean.slice(0, at) + shift(clean[at], 1) + clean.slice(at + 1);
    if (noise === 'delete') damaged = clean.slice(0, at) + clean.slice(at + 1);
    function run(input) {
      const ranked = rankCaesar(input, profile), best = ranked[0];
      const letters = original.replace(/ /g, '');
      return { ranked, ties: ranked.filter(r => r.score === best.score).length,
        edits: distance(letters, best.text.replace(/ /g, '')), length: letters.length };
    }
    return { original, clean, damaged, position: at + 1, baseline: run(clean), changed: run(damaged) };
  }
  function tokens(text) {
    const parts = text.trim().split(/\s+/).filter(Boolean);
    if (!parts.length || parts.length > 64 || parts.some(t => t.length > 16)) throw new Error('Use 1–64 space-separated symbols, each at most 16 characters.');
    return parts;
  }
  // Section 3.1 of Kambhatla et al.: assign each new symbol its order of first
  // occurrence, and reuse that integer at every later occurrence.
  function recurrence(sequence) {
    const seen = new Map();
    return sequence.map(s => { if (!seen.has(s)) seen.set(s, seen.size + 1); return seen.get(s); });
  }
  function rename(sequence) { return recurrence(sequence).map(n => 'g' + (101 - n)); }
  function alter(sequence) {
    const changed = sequence.slice();
    const firstRepeated = sequence.findIndex((s, i) => sequence.indexOf(s) < i);
    if (firstRepeated >= 0) {
      let fresh = 'NEW'; while (sequence.includes(fresh)) fresh += '_';
      changed[firstRepeated] = fresh;
    } else if (sequence.length > 1) changed[sequence.length - 1] = sequence[0];
    return changed;
  }
  // An original, fully enumerable word task. This is not an LLM experiment.
  // Every possible source has three words from the same four-word alphabet.
  const wordAlphabet = ['PINE', 'OAK', 'ELM', 'ASH'];
  const wordMaps = {
    unchanged: { PINE: 'PINE', OAK: 'OAK', ELM: 'ELM', ASH: 'ASH' },
    bijective: { PINE: 'OAK', OAK: 'ELM', ELM: 'ASH', ASH: 'PINE' },
    merged: { PINE: 'OAK', OAK: 'ASH', ELM: 'OAK', ASH: 'ASH' }
  };
  const wordDemonstrations = [
    ['PINE', 'OAK', 'PINE'], ['PINE', 'OAK', 'ELM'],
    ['ASH', 'ELM', 'ASH'], ['ASH', 'ELM', 'OAK']
  ];
  const wordQueries = {
    a: ['ELM', 'ASH', 'ELM'], b: ['ELM', 'ASH', 'PINE'], c: ['ELM', 'ASH', 'OAK']
  };
  // Frozen possible draws from independent uniform replacement, one per
  // occurrence. Draws may coincide; neither a seed nor a repeatable word key is
  // inferred. Fixing the display makes the lesson replayable, not cryptographic.
  const wordDraws = [
    ['ELM', 'OAK', 'ASH'], ['PINE', 'ELM', 'PINE'],
    ['OAK', 'OAK', 'ASH'], ['ELM', 'ASH', 'PINE'],
    ['ASH', 'ELM', 'PINE'], ['OAK', 'ASH', 'OAK'], ['ELM', 'PINE', 'ASH']
  ];
  const wordTriples = wordAlphabet.flatMap(a => wordAlphabet.flatMap(b => wordAlphabet.map(c => [a, b, c])));
  function matchingEnds(sequence) { return sequence[0] === sequence[2]; }
  function wordTransform(mode, sequence, sample = 0) {
    if (!(Object.hasOwn(wordMaps, mode) || mode === 'fresh')) throw new Error('Choose one of the four replacement rules.');
    if (!Array.isArray(sequence) || sequence.length !== 3 || sequence.some(w => !wordAlphabet.includes(w))) throw new Error('Use three words from PINE, OAK, ELM and ASH.');
    if (!Number.isInteger(sample) || sample < 0 || sample >= wordDraws.length) throw new Error('Unknown frozen sample.');
    return mode === 'fresh' ? wordDraws[sample].slice() : sequence.map(w => wordMaps[mode][w]);
  }
  function structureExperiment(mode, queryId) {
    if (!Object.hasOwn(wordQueries, queryId)) throw new Error('Choose example A, B or C.');
    const source = wordQueries[queryId].slice();
    const encoded = wordTransform(mode, source, 4 + Object.keys(wordQueries).indexOf(queryId));
    // For independent full-vocabulary replacement, every source triple has
    // positive probability of every output triple. No language prior is used.
    const alternatives = wordTriples.filter(candidate => mode === 'fresh' ||
      wordTransform(mode, candidate).every((w, i) => w === encoded[i])).map(candidate => candidate.slice());
    const same = alternatives.filter(matchingEnds).length, different = alternatives.length - same;
    return {
      mode, source, encoded, pattern: recurrence(encoded),
      demonstrations: wordDemonstrations.map((words, i) => ({
        encoded: wordTransform(mode, words, i), same: matchingEnds(words)
      })),
      mapping: mode === 'fresh' ? null : wordAlphabet.map(word => [word, wordMaps[mode][word]]),
      alternatives, same, different,
      conclusion: same && different ? 'uncertain' : same ? 'same' : 'different'
    };
  }

  // Original tiny word code, deliberately not uniquely decodable without
  // boundaries: 12 can mean MEET DAWN or WAIT. Never rank away a legal parse.
  const invoiceKey = { 1: 'MEET', 2: 'DAWN', 3: 'DUSK', 12: 'WAIT', 13: 'CANCEL' };
  const invoiceCases = {
    dawn: { codes: ['1', '2'], units: 6, price: 2 },
    dusk: { codes: ['1', '3'], units: 1, price: 13 },
    single: { codes: ['2'], units: 1, price: 2 }
  };
  function decodeInvoice(record, framed) {
    if (typeof framed !== 'boolean' || typeof record !== 'string' || record.length > 24 ||
        !(framed ? /^\d+(?:\|\d+)*$/ : /^\d+$/).test(record) || record.replace(/\|/g, '').length > 12) {
      throw new Error('Use at most 12 digits, with | only between complete codes.');
    }
    let paths = [];
    if (framed) {
      const codes = record.split('|');
      if (codes.every(code => Object.hasOwn(invoiceKey, code))) paths = [codes];
    } else {
      function visit(position, codes) {
        if (position === record.length) { paths.push(codes); return; }
        for (const code of Object.keys(invoiceKey)) if (record.startsWith(code, position)) visit(position + code.length, codes.concat(code));
      }
      visit(0, []);
    }
    return paths.map(codes => ({ codes, reading: codes.map(code => invoiceKey[code]).join(' ') }));
  }
  function invoiceExperiment(example, format) {
    if (!Object.hasOwn(invoiceCases, example) || !['plain', 'framed'].includes(format)) throw new Error('Choose an invoice example and a boundary rule.');
    const item = invoiceCases[example], record = item.codes.join(format === 'framed' ? '|' : '');
    return { record, units: item.units, price: item.price, amount: item.units * item.price,
      intended: item.codes.map(code => invoiceKey[code]).join(' '),
      ordinaryNumber: /^\d+$/.test(record), candidates: decodeInvoice(record, format === 'framed') };
  }
  const markerKey = { amber: 'MEET', silver: 'AT', copper: 'DAWN' };
  function markerExperiment(extra) {
    if (typeof extra !== 'boolean') throw new Error('Choose whether to add the ordinary sentence.');
    const text = (extra ? 'Copper tools arrived yesterday. ' : '') + 'Send amber beads with the silver wire and copper sheet.';
    const matches = Array.from(text.matchAll(/[a-z]+/gi)).filter(match => Object.hasOwn(markerKey, match[0].toLowerCase()));
    const reading = matches.map(match => markerKey[match[0].toLowerCase()]).join(' ');
    return { text, words: matches.map(match => match[0]), reading, intact: reading === 'MEET AT DAWN' };
  }
  const rhythmKey = { WAIT: [1, 1, 1, 1], MEET: [1, 1, 1, 2] };
  function decodeRhythm(durations) {
    if (!Array.isArray(durations) || durations.some(n => !Number.isInteger(n) || n <= 0)) throw new Error('Note lengths must be positive whole beats in this toy.');
    return Object.keys(rhythmKey).find(word => rhythmKey[word].length === durations.length && rhythmKey[word].every((n, i) => n === durations[i])) || null;
  }
  function musicExperiment(word) {
    if (!Object.hasOwn(rhythmKey, word)) throw new Error('Choose WAIT or MEET.');
    const durations = rhythmKey[word].slice(), beats = durations.reduce((sum, n) => sum + n, 0);
    return { durations, beats, required: 4, fits: beats === 4, reading: decodeRhythm(durations) };
  }
  function mount(doc) {
    const $ = id => doc.getElementById(id);
    if (!$('key-choice')) return;
    function el(tag, text, parent) { const node = doc.createElement(tag); node.textContent = text; if (parent) parent.append(node); return node; }
    function keyView() {
      const id = $('key-choice').value, result = applyKey(id);
      $('key-map').textContent = Object.entries(keys[id]).map(([s, p]) => s + ' → ' + p).join('; ');
      $('key-literal').textContent = result.text;
      $('key-coverage').textContent = (result.total - result.unresolved) + '/' + result.total + ' symbol occurrences mapped; ' + result.unresolved + ' unresolved. Coverage is not a probability of correctness.';
      $('key-copy').hidden = true;
      $('key-result').textContent = 'Inspect the reading, then compare the other keys or reveal the separate plaintext copy.';
    }
    $('key-choice').addEventListener('change', keyView);
    $('keys-compare').addEventListener('click', () => {
      const list = $('key-result'); list.replaceChildren();
      for (const id of Object.keys(keys)) { const r = applyKey(id); el('p', 'Key ' + id + ': ' + r.text + ' — ' + (10 - r.unresolved) + '/10 mapped.', list); }
      el('p', 'A and C both cover every symbol. B is incomplete. A readable result is a candidate to investigate; coverage alone cannot choose a key.', list);
    });
    $('key-reveal').addEventListener('click', () => {
      $('key-copy').hidden = false;
      $('key-result').textContent = 'Key C agrees with the separate copy. Key B agrees where it has entries, but leaves G unresolved. This supports C for this fragment; it does not establish authorship or prove that C works for every letter in the folder.';
    });
    $('key-reset').addEventListener('click', () => { $('key-choice').value = 'A'; keyView(); }); keyView();
    const spanList = $('span-list');
    spans.forEach((s, i) => {
      const box = el('div', '', spanList); box.className = 'research-card';
      el('p', 'Passage ' + (i + 1) + ': ' + s.text, box);
      const label = el('label', 'Your classification for passage ' + (i + 1), box); label.htmlFor = 'span-guess-' + i;
      const select = el('select', '', box); select.id = label.htmlFor;
      [['', 'Choose…'], ['cleartext', 'Cleartext — left unencrypted'], ['ciphertext', 'Ciphertext — encrypted'], ['uncertain', 'Uncertain / insufficient evidence']].forEach(([value, text]) => { const o = el('option', text, select); o.value = value; });
    });
    $('span-check').addEventListener('click', () => {
      const out = $('span-feedback'); out.replaceChildren();
      try {
        const rows = checkSpans(spans.map((_, i) => $('span-guess-' + i).value));
        el('p', rows.filter(r => r.agrees).length + '/6 classifications agree with the case notes. This is feedback on supplied chunks, not a boundary-detection or language-identification benchmark. An uncertain first answer can be sensible before seeing the key.', out);
        rows.forEach((r, i) => el('p', (i + 1) + '. ' + r.kind + ': ' + r.why, out));
      } catch (e) { out.textContent = e.message; }
    });
    spanList.addEventListener('change', () => { $('span-feedback').textContent = 'Your classifications changed. Compare again when ready.'; });
    $('span-reset').addEventListener('click', () => { spans.forEach((_, i) => { $('span-guess-' + i).value = ''; }); $('span-feedback').textContent = 'Classify the passages, then reveal the case notes.'; });
    function noiseView() {
      const r = noiseExperiment($('noise-spelling').value, $('noise-kind').value, $('noise-profile').value);
      $('noise-original').textContent = r.original; $('noise-clean').textContent = r.clean; $('noise-damaged').textContent = r.damaged;
      $('noise-words').textContent = vocabularies[$('noise-profile').value].join(', ');
      $('noise-change').textContent = $('noise-kind').value === 'none' ? 'No transcription change.' : 'Changed ciphertext position ' + r.position + ' (counting spaces): ' + ($('noise-kind').value === 'delete' ? 'deleted one letter.' : 'replaced one letter with the next alphabet letter.');
      const out = $('noise-results'); out.replaceChildren();
      for (const [title, data] of [['Clean transcription', r.baseline], ['Selected transcription', r.changed]]) {
        const card = el('div', '', out); card.className = 'research-card'; el('h3', title, card);
        el('p', 'Best displayed reading: ' + data.ranked[0].text, card);
        el('p', data.ties > 1 ? 'No unique winner: ' + data.ties + ' shifts tie at the top score. Display order uses ascending shift, not confidence.' : 'Unique top score in this 26-key search. Recovered shift: ' + data.ranked[0].key + '.', card);
        el('p', 'Letter edit distance from the supplied original: ' + data.edits + '/' + data.length + ' = ' + (100 * data.edits / data.length).toFixed(1) + '%. Spaces excluded; insertion, deletion and substitution each cost one. The original is used only for evaluation.', card);
        el('p', 'Top three candidates (word matches, not probabilities):', card);
        const list = el('ol', '', card);
        data.ranked.slice(0, 3).forEach(c => el('li', 'Shift ' + c.key + ': ' + c.text + ' — ' + c.score + '/5 words matched.', list));
      }
    }
    ['noise-spelling', 'noise-kind', 'noise-profile'].forEach(id => $(id).addEventListener('change', noiseView));
    $('noise-reset').addEventListener('click', () => { $('noise-spelling').value = 'modern'; $('noise-kind').value = 'none'; $('noise-profile').value = 'modern'; noiseView(); }); noiseView();
    let sequence = [];
    function patternView(mode) {
      try {
        sequence = tokens($('pattern-input').value);
        const other = mode === 'alter' ? alter(sequence) : rename(sequence);
        const a = recurrence(sequence), b = recurrence(other);
        $('pattern-original').textContent = sequence.join(' '); $('pattern-other').textContent = other.join(' ');
        $('pattern-a').textContent = a.join(' '); $('pattern-b').textContent = b.join(' ');
        $('pattern-result').textContent = JSON.stringify(a) === JSON.stringify(b)
          ? 'Same recurrence pattern. Renaming symbols bijectively preserves which positions match. It does not reveal the plaintext.'
          : 'The pattern changed. Changing one occurrence changed a relationship between positions; that is different from renaming every occurrence consistently.';
        if (mode === 'alter' && sequence.length === 1) $('pattern-result').textContent = 'One symbol always has pattern 1. Add at least two symbols to change an equality relationship.';
        const buttons = $('pattern-symbols'); buttons.replaceChildren();
        [...new Set(sequence)].forEach(s => {
          const btn = el('button', s, buttons); btn.type = 'button'; btn.setAttribute('aria-pressed', 'false');
          btn.addEventListener('click', () => {
            buttons.querySelectorAll('button').forEach(n => n.setAttribute('aria-pressed', String(n === btn)));
            $('pattern-positions').textContent = 'Symbol ' + s + ' occurs at positions ' + sequence.flatMap((t, i) => t === s ? [i + 1] : []).join(', ') + '.';
          });
        }); $('pattern-positions').textContent = 'Choose a source symbol to locate its occurrences.';
      } catch (e) {
        for (const id of ['pattern-original', 'pattern-other', 'pattern-a', 'pattern-b', 'pattern-positions']) $(id).textContent = '';
        $('pattern-symbols').replaceChildren(); $('pattern-result').textContent = e.message;
      }
    }
    $('pattern-rename').addEventListener('click', () => patternView('rename'));
    $('pattern-alter').addEventListener('click', () => patternView('alter'));
    $('pattern-input').addEventListener('input', () => { $('pattern-result').textContent = 'Input changed. Choose an action to recalculate the displayed sequences.'; });
    $('pattern-reset').addEventListener('click', () => { $('pattern-input').value = 'Q Z Z R Q Z S R'; patternView('rename'); }); patternView('rename');

    let structureState;
    function structureView() {
      structureState = structureExperiment($('structure-mode').value, $('structure-query').value);
      const r = structureState, rows = $('structure-examples'); rows.replaceChildren();
      r.demonstrations.forEach((example, i) => {
        const row = el('tr', '', rows); const heading = el('th', 'Example ' + (i + 1), row); heading.scope = 'row';
        el('td', example.encoded.join(' '), row); el('td', example.same ? 'Same' : 'Different', row);
      });
      $('structure-message').textContent = r.encoded.join(' ');
      $('structure-pattern').textContent = r.pattern.join(' ');
      $('structure-rule').textContent = r.mode === 'fresh'
        ? 'A fresh uniform word is drawn at every occurrence, independently of the source word. The displayed possible outcomes are frozen for replay; repeats can happen by chance.'
        : r.mode === 'merged' ? 'One fixed rule merges PINE with ELM and OAK with ASH. A repeated output need not mean a repeated source word.'
          : r.mode === 'bijective' ? 'One fixed permutation is used for every occurrence in the examples and the question.' : 'The words are unchanged. This is the baseline.';
      $('structure-source').textContent = r.source.join(' ');
      $('structure-map').textContent = r.mapping ? r.mapping.map(([from, to]) => from + ' → ' + to).join('; ')
        : 'There is no fixed word-to-word mapping. Every three-word source can produce the displayed output under the stated replacement model.';
      $('structure-counts').textContent = r.alternatives.length + ' compatible source triples: ' + r.same + ' with matching ends; ' + r.different + ' with different ends. These are counts, not probabilities.';
      const list = $('structure-alternatives'); list.replaceChildren();
      if (r.mode === 'fresh') el('li', 'All 64 triples: four choices at each of three positions, including all-same, repeated and all-different sources.', list);
      else r.alternatives.forEach(words => el('li', words.join(' ') + (matchingEnds(words) ? ' — same ends' : ' — different ends'), list));
      $('structure-workings').open = false;
      $('structure-guess').value = '';
      $('structure-result').textContent = 'Decide what the transformed message establishes about its original first and last words, then check your reasoning.';
    }
    ['structure-mode', 'structure-query'].forEach(id => $(id).addEventListener('change', structureView));
    $('structure-check').addEventListener('click', () => {
      const answer = $('structure-guess').value, r = structureState;
      if (!['same', 'different', 'uncertain'].includes(answer)) { $('structure-result').textContent = 'Choose a conclusion first.'; return; }
      const label = r.conclusion === 'uncertain' ? 'The transformed message does not determine the answer.'
        : 'The original first and last words are ' + (r.conclusion === 'same' ? 'the same' : 'different') + '.';
      const scope = r.mode === 'fresh' ? 'All 64 source triples can produce this output under independent uniform replacement. A lucky guess about the supplied source is not recovery.'
        : r.mode === 'merged' ? r.conclusion === 'uncertain'
          ? 'Both labels occur among the ' + r.alternatives.length + ' legal sources, even with the entire toy mapping supplied.'
          : 'Different output words imply different source words for this fixed rule. Yet ' + r.alternatives.length + ' source triples remain: this task can be answered without recovering the exact message.'
          : 'One-to-one replacement preserves this equality test. Answering it does not demonstrate that a learner has recovered every word or the whole mapping.';
      $('structure-result').textContent = (answer === r.conclusion ? 'Supported conclusion. ' : 'Reconsider that conclusion. ') + label + ' ' + scope;
    });
    $('structure-guess').addEventListener('change', () => { $('structure-result').textContent = 'Your conclusion changed. Check it against the selected replacement rule.'; });
    $('structure-reset').addEventListener('click', () => { $('structure-mode').value = 'bijective'; $('structure-query').value = 'a'; structureView(); });
    structureView();

    function invoiceView() {
      const r = invoiceExperiment($('invoice-example').value, $('invoice-format').value);
      $('invoice-units').textContent = r.units; $('invoice-price').textContent = r.price; $('invoice-record').textContent = r.record;
      $('invoice-arithmetic').textContent = r.units + ' × ' + r.price + ' = ' + r.amount + ' invented units.';
      $('invoice-intended').textContent = r.intended;
      const list = $('invoice-readings'); list.replaceChildren();
      r.candidates.forEach(candidate => el('li', candidate.codes.join(' | ') + ' → ' + candidate.reading, list));
      $('invoice-result').textContent = r.candidates.length + (r.candidates.length === 1
        ? ' legal reading under the chosen boundary rule. This resolves this example; it does not authenticate a source or make the code secure.'
        : ' legal readings with this key. Knowing the key does not tell the recipient where the sender put the boundaries. No reading is discarded for sounding less natural.');
      $('invoice-cover').textContent = r.ordinaryNumber
        ? 'The displayed amount fits the arithmetic of this invented invoice. That is one consistency check, not a measured chance of escaping notice.'
        : 'The | marks make the boundaries explicit, but the amount field is no longer an ordinary number in this invoice format. Reliable decoding and an inconspicuous cover are separate requirements.';
    }
    ['invoice-example', 'invoice-format'].forEach(id => $(id).addEventListener('change', invoiceView));
    function markerView() {
      const r = markerExperiment($('marker-extra').checked);
      $('marker-text').textContent = r.text; $('marker-words').textContent = r.words.join(' → '); $('marker-reading').textContent = r.reading;
      $('marker-result').textContent = r.intact
        ? 'The extraction matches the intended MEET AT DAWN in this fixture. All reserved words were used deliberately.'
        : 'The ordinary mention of copper is also extracted. The receiver gets an extra DAWN: the rule cannot infer which occurrence the writer intended as a marker.';
    }
    $('marker-extra').addEventListener('change', markerView);
    function musicView() {
      const r = musicExperiment($('music-message').value), list = $('music-notes'); list.replaceChildren();
      r.durations.forEach((beats, i) => { const note = el('li', 'Note ' + (i + 1) + ': ' + (beats === 1 ? 'quarter note — 1 beat' : 'half note — 2 beats'), list); note.className = 'rhythm-note'; });
      $('music-reading').textContent = r.reading;
      $('music-count').textContent = r.durations.join(' + ') + ' = ' + r.beats + ' quarter-note beats.';
      $('music-result').textContent = r.fits
        ? 'The code decodes and this complete bar has the required four beats. Passing this one meter check does not establish musical naturalness or successful concealment.'
        : 'The code still decodes, but this complete bar has ' + r.beats + ' beats where its 4/4 label requires four. That visible inconsistency can attract scrutiny; it does not prove that a real score contains a secret.';
    }
    $('music-message').addEventListener('change', musicView);
    $('concealment-reset').addEventListener('click', () => { $('invoice-example').value = 'dawn'; $('invoice-format').value = 'plain'; $('marker-extra').checked = false; $('music-message').value = 'MEET'; invoiceView(); markerView(); musicView(); });
    invoiceView(); markerView(); musicView();
  }
  const api = { applyKey, spans, checkSpans, shift, distance, rankCaesar, noiseExperiment, tokens, recurrence, rename, alter,
    wordTransform, structureExperiment, decodeInvoice, invoiceExperiment, markerExperiment, decodeRhythm, musicExperiment, mount };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', () => mount(root.document), { once: true });
    else mount(root.document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
