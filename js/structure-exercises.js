(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.StructureExercises = api; api.mount(document); }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const alpha = { A: ['WOL-LA-CHEE','BE-LA-SANA'], T: ['THAN-ZIE','A-WOH'], C: ['MOASI','TLA-GIN'], K: ['JAD-HO-LONI','BA-AH-NE-DI-TININ'], G: ['KLIZZIE','AH-TAD'], U: ['SHI-DA','NO-DA-IH'], M: ['TSIN-TLITI','BE-TAS-TNI'] };
  function encode(whole, alternate) {
    const spell = word => [...word].map(c => alpha[c][alternate ? 1 : 0]);
    const groups = whole ? [['AL-TAH-JE-JAY'], spell('GUAM')] : [spell('ATTACK'), spell('GUAM')];
    return { text: groups.map(g => g.join(' · ')).join(' / '), units: groups.flat().length };
  }
  function heldOut(hypothesis) {
    if (!['xy', 'yx'].includes(hypothesis)) throw new Error('Unknown structural hypothesis.');
    return { prediction: hypothesis === 'xy' ? 'C Y' : 'C X', matches: hypothesis === 'xy' };
  }
  function mount(doc) {
    const $ = id => doc.getElementById(id);
    if ($('navajo-whole')) {
      const render = () => {
        const r = encode($('navajo-whole').checked, $('navajo-alternate').checked);
        $('navajo-second-output').textContent = r.text;
        $('navajo-second-result').textContent = r.units + ' code or spelling entries for ATTACK GUAM. This counts selected dictionary entries, not syllables, radio duration or wartime speed.';
      };
      $('navajo-whole').addEventListener('change', render); $('navajo-alternate').addEventListener('change', render); render();
    }
    if ($('linear-hypothesis')) {
      let revealed = false;
      const render = () => {
        const r = heldOut($('linear-hypothesis').value);
        $('linear-prediction').textContent = 'Prediction for two jars: ' + r.prediction;
        $('linear-heldout').hidden = !revealed;
        $('linear-result').textContent = !revealed ? 'Both hypotheses fit the unlabeled training groups. Repeated endings alone do not supply meaning or sound.' : r.matches ? 'The prediction matches the held-out labeled record C Y. This supports this synthetic singular/plural distinction; no phonetic value or ancient language has been deciphered.' : 'The prediction C X conflicts with the held-out record C Y. Revise the hypothesis and retain the failed prediction.';
      };
      $('linear-hypothesis').addEventListener('change', render);
      $('linear-reveal').addEventListener('click', () => { revealed = true; render(); });
      $('linear-reset').addEventListener('click', () => { revealed = false; $('linear-hypothesis').value = 'xy'; render(); });
      $('linear-workbench').addEventListener('click', () => {
        try {
          const record = window.MuseumResearch.create('A X / A Y / A Z\nB X / B Y / B Z');
          record.source.artifactId = 'original-structural-exercise-1';
          record.source.archive = 'Original museum teaching fixture';
          record.source.method = 'Latin labels; not Linear B signs or an ancient transcription. Hypothesis: ' + $('linear-hypothesis').selectedOptions[0].textContent;
          window.sessionStorage.setItem('museum-evidence-import', JSON.stringify(record));
          window.location.href = 'evidence-workbench.html';
        } catch (error) { $('linear-result').textContent = 'Could not transfer the exercise: ' + error.message; }
      });
      render();
    }
  }
  return { encode, heldOut, mount };
});
