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
  // Occurrences in the invented training inventory. Y is commonest because inventories
  // mostly count several items, which is what makes "Y is the singular" attractive and wrong.
  const TRAINING = { A: { X: 2, Y: 7, Z: 1 }, B: { X: 1, Y: 6, Z: 1 } };
  const LINEAR_LABELS = { yx: 'Y, the commonest ending, marks one item', xy: 'X marks one item; Y marks two' };
  function commonest() {
    const totals = {};
    for (const family of Object.values(TRAINING)) for (const [ending, n] of Object.entries(family)) totals[ending] = (totals[ending] || 0) + n;
    return Object.keys(totals).sort((a, b) => totals[b] - totals[a])[0];
  }
  function heldOut(hypothesis) {
    if (!['xy', 'yx'].includes(hypothesis)) throw new Error('Unknown structural hypothesis.');
    // The only held-out Z sits beside a jar drawing with no numeral, so no hypothesis here assigns it.
    return { prediction: hypothesis === 'xy' ? 'C Y' : 'C X', matches: hypothesis === 'xy', unresolved: ['Z'] };
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
      const checked = [];
      const renderRecord = () => {
        $('linear-record').replaceChildren(...checked.map(entry => { const li = doc.createElement('li'); li.textContent = entry; return li; }));
        $('linear-record-empty').hidden = checked.length > 0;
      };
      const render = () => {
        const r = heldOut($('linear-hypothesis').value);
        $('linear-prediction').textContent = 'Prediction for two jars: ' + r.prediction;
        $('linear-heldout').hidden = !revealed;
        $('linear-result').textContent = !revealed ? 'Both hypotheses fit the unlabeled training groups. Y is the commonest ending, which makes it look basic, but frequency and repeated endings do not supply meaning or sound.' : r.matches ? 'The prediction matches the held-out labeled record C Y. This supports this invented singular/plural distinction; no phonetic value or ancient language has been deciphered. Z stays unassigned: the only held-out Z has no numeral, so nothing here tests it.' : 'The prediction C X conflicts with the held-out record C Y. Revise the hypothesis; the failed prediction stays in your record.';
      };
      $('linear-hypothesis').addEventListener('change', render);
      $('linear-reveal').addEventListener('click', () => {
        revealed = true;
        const value = $('linear-hypothesis').value, r = heldOut(value);
        const entry = LINEAR_LABELS[value] + ': predicted ' + r.prediction + ' for two jars; ' + (r.matches ? 'consistent with' : 'contradicted by') + ' the held-out C Y. Z unassigned.';
        if (checked[checked.length - 1] !== entry) checked.push(entry);
        renderRecord(); render();
      });
      $('linear-reset').addEventListener('click', () => { revealed = false; $('linear-hypothesis').selectedIndex = 0; render(); });
      $('linear-workbench').addEventListener('click', () => {
        try {
          const record = window.MuseumResearch.create('A X / A Y / A Z\nB X / B Y / B Z');
          record.source.artifactId = 'original-structural-exercise-1';
          record.source.archive = 'Original museum teaching fixture';
          record.source.method = 'Latin labels; not Linear B signs or an ancient transcription. Current hypothesis: ' + $('linear-hypothesis').selectedOptions[0].textContent + '. Checked: ' + (checked.length ? checked.join(' | ') : 'none yet');
          window.sessionStorage.setItem('museum-evidence-import', JSON.stringify(record));
          window.location.href = 'evidence-workbench.html';
        } catch (error) { $('linear-result').textContent = 'Could not transfer the exercise: ' + error.message; }
      });
      renderRecord(); render();
    }
  }
  return { encode, heldOut, commonest, TRAINING, mount };
});
