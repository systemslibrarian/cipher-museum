/* Original fictional reader case. Gates guide the activity; they are not access control. */
'use strict';
(function () {
  const $ = id => document.getElementById(id);
  if (!$('unlock-form')) return;
  const normalize = text => text.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const instruction = 'COMPARE THE COPIES BEFORE YOU TRUST THEM';
  const state = { started: false, decoded: false, compared: false, source: false, complete: false, entry: '', help: new Set() };
  const stages = ['recover the destination', 'compare the copies', 'request another source', 'make a finding'];
  const codebook = Object.fromEntries([...document.querySelectorAll('#dispatch-key [data-code]')].map(el => [el.dataset.code, el.textContent.trim()]));
  const groups = $('dispatch-cipher').textContent.match(/\d{2}/g) || [];
  const reading = groups.map(group => codebook[group]);
  const room = reading[reading.indexOf('ROOM') + 1];
  const validDispatch = groups.length > 0 && reading.every(Boolean) && normalize(reading.join(' ')) === normalize($('retained-message').textContent);
  function progress(step) {
    document.querySelectorAll('.case-progress [data-step]').forEach(el => {
      const number = Number(el.dataset.step);
      el.classList.toggle('is-complete', state.complete || number < step);
      if (number === step && !state.complete) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    });
    $('case-progress-text').textContent = state.complete ? 'Investigation complete. Your finding is below.' : `Step ${step} of 4: ${stages[step - 1]}.`;
  }
  function openCase(entry) {
    if (!validDispatch) {
      $('unlock-feedback').textContent = 'This case file has an inconsistent dispatch. Please reload the page before continuing.';
      return;
    }
    if (!state.started) state.entry = entry;
    state.started = true;
    $('investigation').hidden = false;
    $('case-title').focus();
  }
  function finishDecode(revealed) {
    if (!state.started) return;
    state.decoded = true;
    if (revealed) state.help.add('dispatch-answer');
    $('decode-feedback').textContent = `The dispatch names ROOM ${room}. The complete reading is beside the delivered copy below.`;
    $('copies-panel').hidden = false;
    progress(2);
    $('copies-title').focus();
  }
  async function copyText(text, feedbackId, copyId, labelId, success) {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      $(copyId).hidden = true;
      $(labelId).hidden = true;
      $(feedbackId).textContent = success;
    } catch (_) {
      $(labelId).hidden = false;
      $(copyId).hidden = false;
      $(copyId).value = text;
      $(copyId).focus();
      $(copyId).select();
      $(feedbackId).textContent = 'Select and copy the text below. Nothing has been sent.';
    }
  }
  $('start-case').addEventListener('click', () => openCase('Direct start'));
  $('unlock-form').addEventListener('submit', event => {
    event.preventDefault();
    if (normalize($('instruction').value) !== normalize(instruction)) {
      $('unlock-feedback').textContent = 'That does not quite fit. Join all four answers in slip order. The hints above are there whenever you want them.';
      return;
    }
    $('unlock-feedback').textContent = 'The instruction fits. The envelope is open below.';
    openCase('Four book slips');
  });
  $('decode-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!state.started) return;
    const answer = normalize($('dispatch-room').value).replace(/^ROOM/, '');
    if (![normalize(room), '4'].includes(answer)) {
      $('decode-feedback').textContent = 'Follow the code group immediately after ROOM. Enter its word or room number; the codebook and hints are available above.';
      return;
    }
    finishDecode(false);
  });
  $('reveal-dispatch').addEventListener('click', () => {
    $('dispatch-room').value = room;
    finishDecode(true);
  });
  $('compare-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!state.decoded) return;
    const choice = document.querySelector('input[name="difference"]:checked');
    if (!choice) return;
    if (choice.value !== 'room') {
      $('compare-feedback').textContent = 'Compare the message wording again. Both copies say AT NINE and name ELLIS. The document timestamps are separate from the instruction.';
      return;
    }
    state.compared = true;
    document.querySelectorAll('[data-difference]').forEach(mark => mark.classList.add('revealed'));
    $('compare-feedback').textContent = 'Yes: A names FOUR and B names FIVE. The difference is established; its cause is not.';
    $('source-panel').hidden = false;
    progress(3);
    $('source-title').focus();
  });
  $('source-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!state.compared) return;
    const choice = document.querySelector('input[name="source"]:checked');
    if (!choice) return;
    if (choice.value !== 'register') {
      $('source-feedback').textContent = choice.value === 'keys'
        ? 'The checkout log could clarify access to the contents. It would not establish which destination the curator authorised.'
        : 'The arrival log could clarify delivery timing. It would not establish the authorised wording. Look for a record linked to reference CM-17.';
      return;
    }
    state.source = true;
    $('register-record').hidden = false;
    $('source-feedback').textContent = 'The register is below. It supports a destination, with limits of its own. Read it before making your finding.';
    $('verdict-form').hidden = false;
    progress(4);
    $('register-record').setAttribute('tabindex', '-1');
    $('register-record').focus();
  });
  $('verdict-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!state.source) return;
    const choice = document.querySelector('input[name="verdict"]:checked');
    if (!choice) return;
    const responses = {
      theft: 'A and E agree, but one could derive from the other. The signature also remains unauthenticated. Agreement alone does not establish two independent confirmations.',
      clerk: 'A later delivery time is not evidence of an authorised revision. Which record says the curator changed the destination?',
      nothing: 'D explicitly says the contents were not checked. An apparently intact seal cannot settle whether they remain intact.'
    };
    if (choice.value !== 'evidence') {
      state.complete = false;
      $('finding').hidden = true;
      progress(4);
      $('verdict-feedback').textContent = responses[choice.value] || 'Choose the conclusion supported by these documents.';
      return;
    }
    state.complete = true;
    $('verdict-feedback').textContent = 'Your finding separates the supported destination from an unsupported accusation.';
    $('finding').hidden = false;
    progress(4);
    $('finding-title').focus();
  });
  document.querySelectorAll('details.hint').forEach((el, index) => {
    el.addEventListener('toggle', () => { if (el.open) state.help.add(`hint-${index}`); });
  });
  $('share-finding').addEventListener('click', () => {
    if (!state.complete) return;
    const text = 'I completed The Curator’s Sealed Letter, a free codebreaking and evidence investigation at Cipher Museum. Try the case: https://ciphermuseum.com/sealed-letter.html';
    copyText(text, 'share-feedback', 'share-copy', 'share-copy-label', 'Copied. Paste the invitation wherever you choose—no solution included.');
  });
  $('playtest-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!state.complete || !$('playtest-form').checkValidity()) return;
    const text = [
      'Cipher Museum playtest · The Curator’s Sealed Letter · Pilot 1',
      `Entry: ${state.entry}`,
      'Case completed: yes',
      `Help items opened: ${state.help.size}`,
      `Most needed help: ${$('playtest-hardest').value}`,
      `Would try another case: ${$('playtest-again').value}`,
      `Notes: ${$('playtest-note').value.trim() || '(none)'}`
    ].join('\n');
    copyText(text, 'playtest-feedback', 'playtest-copy', 'playtest-copy-label', 'Notes copied. Send them to the person who invited you when you are ready. Nothing was submitted here.');
  });
  $('restart-case').addEventListener('click', () => {
    Object.assign(state, { decoded: false, compared: false, source: false, complete: false });
    ['copies-panel', 'source-panel', 'register-record', 'verdict-form', 'finding', 'share-copy', 'share-copy-label', 'playtest-copy', 'playtest-copy-label'].forEach(id => { $(id).hidden = true; });
    ['decode-form', 'compare-form', 'source-form', 'verdict-form', 'playtest-form'].forEach(id => $(id).reset());
    ['decode-feedback', 'compare-feedback', 'source-feedback', 'verdict-feedback', 'share-feedback', 'playtest-feedback'].forEach(id => { $(id).textContent = ''; });
    document.querySelectorAll('[data-difference]').forEach(mark => mark.classList.remove('revealed'));
    progress(1);
    $('case-title').focus();
  });
})();
