(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.EgyptianCase = api; api.mount(document); }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  // Historical evidence, as reported in Parkinson, Cracking Codes (1999).
  const EVIDENCE = {
    count: { signs: 1419, greekWords: 486 },
    ramesses: { origin: 'egyptian', soundSigns: true }
  };
  const HYPOTHESES = {
    symbolic: { label: 'Each sign stands for one word or idea', maxSignsPerWord: 1.5, minSignsPerWord: 0, soundSignsFor: [] },
    young: { label: 'Sound signs spell only foreign names; the rest is symbolic', maxSignsPerWord: 1.5, minSignsPerWord: 0, soundSignsFor: ['foreign'] },
    mixed: { label: 'Sound signs, sound-and-meaning signs and classifiers work together', maxSignsPerWord: Infinity, minSignsPerWord: 1.5, soundSignsFor: ['foreign', 'egyptian'] }
  };
  function check(hypothesis, evidenceId, data) {
    const h = HYPOTHESES[hypothesis];
    if (!h) throw new Error('Unknown hypothesis: ' + hypothesis);
    if (evidenceId === 'count') {
      const e = data || EVIDENCE.count, ratio = e.signs / e.greekWords;
      const fits = ratio >= h.minSignsPerWord && ratio <= h.maxSignsPerWord;
      return { verdict: fits ? 'consistent' : 'contradicted', ratio };
    }
    if (evidenceId === 'ramesses') {
      const e = data || EVIDENCE.ramesses;
      const fits = !e.soundSigns || h.soundSignsFor.includes(e.origin);
      return { verdict: fits ? 'consistent' : 'contradicted' };
    }
    throw new Error('Unknown evidence: ' + evidenceId);
  }
  // A hypothesis survives only if it is consistent with every check.
  function assess(hypothesis, data) {
    const d = data || {};
    const count = check(hypothesis, 'count', d.count), ramesses = check(hypothesis, 'ramesses', d.ramesses);
    return { count, ramesses, consistent: count.verdict === 'consistent' && ramesses.verdict === 'consistent' };
  }

  // The word pr "go out" as taught in Collier and Manley, section 2: a two-consonant house
  // sign, a mouth sign that repeats its r, and a walking-legs determinative with no sound.
  const WORD = {
    transliteration: 'pr', translation: 'go out',
    signs: [
      { id: 'house', char: '\u{13250}', gardiner: 'O1', name: 'house plan', value: 'pr' },
      { id: 'mouth', char: '\u{1308B}', gardiner: 'D21', name: 'mouth', value: 'r' },
      { id: 'legs', char: '\u{130BB}', gardiner: 'D54', name: 'walking legs', value: null }
    ]
  };
  const ROLES = ['sound', 'complement', 'determinative'];
  function readRoles(roles) {
    let transliteration = '';
    const errors = [];
    for (const sign of WORD.signs) {
      const role = roles[sign.id];
      if (!ROLES.includes(role)) throw new Error('Choose a role for the ' + sign.name + ' sign.');
      if (role === 'sound') {
        if (sign.value === null) errors.push('The ' + sign.name + ' sign has no sound value in this word.');
        else transliteration += sign.value;
      } else if (role === 'complement') {
        // A complement repeats a consonant already written by a larger sound sign.
        if (!sign.value || !transliteration.endsWith(sign.value)) errors.push('The ' + sign.name + ' sign has no preceding sound sign to complement.');
      }
    }
    return { transliteration, errors, matches: errors.length === 0 && transliteration === WORD.transliteration };
  }
  // Signs face the beginning of the line: read into their faces (Collier and Manley, section 7).
  function readingDirection(facing) {
    if (facing === 'right') return 'rtl';
    if (facing === 'left') return 'ltr';
    throw new Error('Unknown facing: ' + facing);
  }
  function checkDirection(answer, facing) { return { correct: answer === readingDirection(facing) }; }

  function mount(doc) {
    const $ = id => doc.getElementById(id);
    if (!$('egypt-hypothesis')) return;
    const checked = [];
    const renderRecord = () => {
      $('egypt-record').replaceChildren(...checked.map(entry => { const li = doc.createElement('li'); li.textContent = entry; return li; }));
      $('egypt-record-empty').hidden = checked.length > 0;
    };
    $('egypt-check').addEventListener('click', () => {
      const value = $('egypt-hypothesis').value, label = HYPOTHESES[value].label;
      const a = assess(value), count = a.count, ram = a.ramesses;
      $('egypt-evidence').hidden = false;
      $('egypt-result').textContent = a.consistent
        ? 'This hypothesis is consistent with both checks: the sign count and the Ramesses cartouche.'
        : 'This hypothesis is contradicted: ' + [count.verdict === 'contradicted' ? 'the Rosetta Stone has about ' + count.ratio.toFixed(1) + ' hieroglyphic signs per Greek word' : '', ram.verdict === 'contradicted' ? 'an Egyptian royal name is written with sound signs' : ''].filter(Boolean).join(', and ') + '. Revise it; the failed check stays in your record.';
      const entry = label + ': sign count ' + count.verdict + '; Ramesses cartouche ' + ram.verdict + '.';
      if (checked[checked.length - 1] !== entry) checked.push(entry);
      renderRecord();
    });
    $('egypt-reset').addEventListener('click', () => {
      $('egypt-hypothesis').selectedIndex = 0; $('egypt-evidence').hidden = true;
      $('egypt-result').textContent = 'Choose a hypothesis about how the script works, then check it.';
    });

    const word = $('egypt-word');
    const renderWord = () => {
      const facing = word.dataset.facing;
      word.classList.toggle('egypt-facing-left', facing === 'left');
      $('egypt-facing-note').textContent = 'The walking legs face ' + facing + '.';
    };
    $('egypt-flip').addEventListener('click', () => {
      word.dataset.facing = word.dataset.facing === 'right' ? 'left' : 'right';
      renderWord(); $('egypt-direction-result').textContent = 'The signs now face the other way. Check your answer again.';
    });
    $('egypt-direction-check').addEventListener('click', () => {
      const r = checkDirection($('egypt-direction').value, word.dataset.facing);
      $('egypt-direction-result').textContent = r.correct
        ? 'Yes. The signs face the start of the line, so you read into their faces.'
        : 'Not quite. Read into the faces of the signs: they look toward the start of the line, whatever direction English uses.';
    });
    $('egypt-roles-check').addEventListener('click', () => {
      let r;
      try { r = readRoles({ house: $('egypt-role-house').value, mouth: $('egypt-role-mouth').value, legs: $('egypt-role-legs').value }); }
      catch (e) { $('egypt-roles-result').textContent = e.message; return; }
      $('egypt-roles-result').textContent = r.matches
        ? 'Transliteration: pr. Translation: “go out”. The house sign writes pr, the mouth repeats its r as a phonetic complement, and the walking legs classify the word as one of motion without adding a sound.'
        : 'Your roles spell “' + (r.transliteration || '(nothing)') + '”, not the word’s consonants pr.' + (r.errors.length ? ' ' + r.errors.join(' ') : '');
    });
    renderWord(); renderRecord();
  }
  return { EVIDENCE, HYPOTHESES, WORD, check, assess, readRoles, readingDirection, checkDirection, mount };
});
