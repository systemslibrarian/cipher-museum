(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.MayaCase = api; api.mount(document); }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  // Evidence as Coe reports it (Breaking the Maya Code, 3rd edition, ch. 6): Landa said b
  // aloud as "be"; over a turkey picture two signs spell k'utz, a word of three sounds.
  const EVIDENCE = {
    letterNames: { heard: ['b', 'e'] },
    turkey: { signs: ['k’u', 'tzu'], word: ['k’', 'u', 'tz'] }
  };
  const HYPOTHESES = {
    alphabet: { label: 'Landa’s list is an alphabet: one sign for one letter', soundsPerSign: 1, finalVowelSilent: false },
    syllabic: { label: 'Most signs are syllables, a consonant plus a vowel, used alongside word signs', soundsPerSign: 2, finalVowelSilent: true }
  };
  function check(hypothesis, evidenceId, data) {
    const h = HYPOTHESES[hypothesis];
    if (!h) throw new Error('Unknown hypothesis: ' + hypothesis);
    if (evidenceId === 'letterNames') {
      // A sign written in answer to a spoken letter name records what was heard.
      const e = data || EVIDENCE.letterNames;
      return { verdict: e.heard.length === h.soundsPerSign ? 'consistent' : 'contradicted' };
    }
    if (evidenceId === 'turkey') {
      const e = data || EVIDENCE.turkey;
      const spelledSounds = e.signs.length * h.soundsPerSign - (h.finalVowelSilent ? 1 : 0);
      return { verdict: spelledSounds === e.word.length ? 'consistent' : 'contradicted', spelledSounds, wordSounds: e.word.length };
    }
    throw new Error('Unknown evidence: ' + evidenceId);
  }
  // A hypothesis survives only if it is consistent with every check.
  function assess(hypothesis, data) {
    const d = data || {};
    const letterNames = check(hypothesis, 'letterNames', d.letterNames), turkey = check(hypothesis, 'turkey', d.turkey);
    return { letterNames, turkey, consistent: letterNames.verdict === 'consistent' && turkey.verdict === 'consistent' };
  }

  // Two CV signs spelling a CVC word. Knorozov (1952): the silent vowel echoes the first
  // (synharmony). Later epigraphers, as Coe reports in ch. 10: an echo marks a short vowel,
  // a different vowel (disharmony) marks a long one, as in ba-k(i) for baak.
  function splitSyllable(sign) {
    const m = /^(.*?)([aeiou])$/.exec(sign);
    if (!m || !m[1]) throw new Error('Not a consonant-vowel sign: ' + sign);
    return { consonant: m[1], vowel: m[2] };
  }
  function readSpelling(signs) {
    if (!Array.isArray(signs) || signs.length !== 2) throw new Error('Give two consonant-vowel signs.');
    const a = splitSyllable(signs[0]), b = splitSyllable(signs[1]);
    const harmonic = a.vowel === b.vowel;
    return {
      knorozov1952: harmonic ? 'synharmonic' : 'not covered',
      laterRule: harmonic ? 'short vowel' : 'long vowel',
      word: a.consonant + a.vowel + (harmonic ? '' : a.vowel) + b.consonant
    };
  }

  // Invented figures, modelled on the pattern Coe describes in ch. 7: in each set the
  // earliest date falls 12 to 31 years before an accession date. Not Piedras Negras data.
  const LIFETIME = 80;
  const DATE_SETS = {
    invented: true,
    sets: [
      { name: 'Set A', initial: 0, accession: 12, last: 47 },
      { name: 'Set B', initial: 60, accession: 91, last: 115 },
      { name: 'Set C', initial: 130, accession: 152, last: 183 }
    ]
  };
  function checkDates(hypothesis, sets) {
    const s = sets || DATE_SETS.sets, gaps = s.map(x => x.accession - x.initial);
    if (hypothesis === 'cycle') {
      const fixed = gaps.every(g => g === gaps[0]);
      return { verdict: fixed ? 'consistent' : 'contradicted', gaps };
    }
    if (hypothesis === 'lives') {
      const fits = s.every(x => x.initial < x.accession && x.last - x.initial <= LIFETIME);
      return { verdict: fits ? 'consistent' : 'contradicted', gaps };
    }
    throw new Error('Unknown date hypothesis: ' + hypothesis);
  }

  function mount(doc) {
    const $ = id => doc.getElementById(id);
    if (!$('maya-hypothesis')) return;
    const checked = [];
    const renderRecord = () => {
      $('maya-record').replaceChildren(...checked.map(entry => { const li = doc.createElement('li'); li.textContent = entry; return li; }));
      $('maya-record-empty').hidden = checked.length > 0;
    };
    $('maya-check').addEventListener('click', () => {
      const value = $('maya-hypothesis').value, a = assess(value);
      $('maya-evidence').hidden = false;
      $('maya-result').textContent = a.consistent
        ? 'This hypothesis is consistent with both checks: the letter names and the turkey spelling.'
        : 'This hypothesis is contradicted: ' + [a.letterNames.verdict === 'contradicted' ? 'a sign written for the spoken name “be” records two sounds, not one letter' : '', a.turkey.verdict === 'contradicted' ? 'two signs read this way spell ' + a.turkey.spelledSounds + ' sounds, but k’utz has ' + a.turkey.wordSounds : ''].filter(Boolean).join(', and ') + '. Revise it; the failed check stays in your record.';
      const entry = HYPOTHESES[value].label + ': letter names ' + a.letterNames.verdict + '; turkey spelling ' + a.turkey.verdict + '.';
      if (checked[checked.length - 1] !== entry) checked.push(entry);
      renderRecord();
    });
    $('maya-reset').addEventListener('click', () => {
      $('maya-hypothesis').selectedIndex = 0; $('maya-evidence').hidden = true;
      $('maya-result').textContent = 'Choose a hypothesis about the signs, then check it.';
    });
    $('maya-spelling-check').addEventListener('click', () => {
      const r = readSpelling($('maya-spelling').value.split(' '));
      $('maya-spelling-result').textContent = 'Knorozov’s 1952 rule: ' + r.knorozov1952 + '. Later rule: ' + r.laterRule + '. Reading: ' + r.word + '.';
    });
    const tbody = $('maya-date-table').querySelector('tbody');
    tbody.replaceChildren(...DATE_SETS.sets.map(s => {
      const tr = doc.createElement('tr');
      for (const v of [s.name, s.initial, s.accession, s.accession - s.initial, s.last, s.last - s.initial]) { const td = doc.createElement('td'); td.textContent = String(v); tr.appendChild(td); }
      return tr;
    }));
    $('maya-dates-check').addEventListener('click', () => {
      const h = $('maya-dates-hypothesis').value, r = checkDates(h);
      $('maya-dates-result').textContent = h === 'cycle'
        ? (r.verdict === 'consistent' ? 'This hypothesis is consistent: every gap is the same.' : 'This hypothesis is contradicted: the gaps are ' + r.gaps.join(', ') + ' years. A fixed cycle would repeat one interval.')
        : (r.verdict === 'consistent' ? 'This hypothesis is consistent: each set starts before its accession and fits within one lifetime, taken here as ' + LIFETIME + ' years.' : 'This hypothesis is contradicted: a set runs longer than one lifetime.');
    });
    renderRecord();
  }
  return { EVIDENCE, HYPOTHESES, DATE_SETS, LIFETIME, check, assess, readSpelling, checkDates, mount };
});
