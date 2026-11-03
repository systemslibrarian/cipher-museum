(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.InterceptExercise = api; api.mount(document); }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const raw = 'PHHW DW ??VW JDWH';
  const secondCopy = 'PHHW DW HDVW JDWH';
  function decode(text) { return text.replace(/[A-Z]/g, c => String.fromCharCode(65 + (c.charCodeAt(0) - 65 + 23) % 26)); }
  function compare(candidate, revealed) {
    if (!['EAST', 'WEST'].includes(candidate)) throw new Error('Choose EAST or WEST.');
    const proposed = 'MEET AT ' + candidate + ' GATE';
    const literal = decode(raw);
    const fits = [...literal].every((c, i) => c === '?' || c === proposed[i]);
    return { literal, proposed, fits, checked: revealed ? proposed === decode(secondCopy) : null };
  }
  function mount(doc) {
    const $ = id => doc.getElementById(id);
    if (!$('intercept-choice')) return;
    let revealed = false;
    function render() {
      $('intercept-assessment').textContent = '';
      const r = compare($('intercept-choice').value, revealed);
      $('intercept-literal').textContent = r.literal;
      $('intercept-proposed').textContent = r.proposed;
      $('intercept-copy').hidden = !revealed;
      $('intercept-result').textContent = r.checked === null
        ? 'Both candidates fit the readable symbols. The index card supplies context, not missing characters. Candidate only: keep both alternatives.'
        : r.checked ? 'EAST agrees with the separately logged complete copy. Reading checked against I2; the original I1 gaps remain. This does not prove the meeting took place.'
        : 'WEST conflicts with I2. Reject this candidate while retaining the original I1 transcription and the reason for revision.';
    }
    $('intercept-choice').addEventListener('change', render);
    $('intercept-reveal').addEventListener('click', () => { revealed = true; render(); });
    $('intercept-reset').addEventListener('click', () => { revealed = false; $('intercept-choice').value = 'WEST'; render(); });
    $('intercept-assess').addEventListener('click', () => {
      const choice = $('intercept-claim').value;
      $('intercept-assessment').textContent = choice === 'exchange'
        ? 'Supported by log L1: traffic was recorded between callsigns R4 and Q2 at the stated times. Callsigns alone do not establish the people or their intention.'
        : choice === 'reading' ? (revealed ? 'Supported by I2 plus the declared shift key: the complete copy reads MEET AT EAST GATE. Preserve its source ID; it establishes a recorded instruction, not compliance.' : 'Not checked yet: I1 has two unreadable symbols. Inspect I2 before reporting a complete reading.')
        : 'Not established: neither the traffic log nor a readable instruction proves that a meeting happened or identifies the participants.';
    });
    render();
  }
  return { raw, secondCopy, decode, compare, mount };
});
