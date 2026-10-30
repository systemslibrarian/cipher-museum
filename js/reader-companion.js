/* An original reader puzzle. Client-side gates are a courtesy, not access control. */
'use strict';
(function () {
  const $ = id => document.getElementById(id);
  if (!$('unlock-form')) return;
  const normalize = text => text.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const instruction = 'COMPARE THE COPIES BEFORE YOU TRUST THEM';
  $('unlock-form').addEventListener('submit', event => {
    event.preventDefault();
    if (normalize($('instruction').value) !== normalize(instruction)) {
      $('unlock-feedback').textContent = 'That does not quite fit. Join all four answers in slip order. The hints above are there whenever you want them.';
      return;
    }
    $('unlock-feedback').textContent = 'The instruction fits. The envelope is open below.';
    $('investigation').hidden = false;
    $('case-title').focus();
  });
  $('compare-form').addEventListener('submit', event => {
    event.preventDefault();
    const choice = document.querySelector('input[name="difference"]:checked');
    if (!choice) return;
    if (choice.value !== 'room') {
      $('compare-feedback').textContent = 'Compare the message wording again. Both copies say AT NINE and name ELLIS. The document timestamps are separate from the instruction.';
      return;
    }
    document.querySelectorAll('[data-difference]').forEach(mark => mark.classList.add('revealed'));
    $('compare-feedback').textContent = 'Yes: FOUR became FIVE. You have found a difference. Now decide how much it proves.';
    $('verdict-form').hidden = false;
    document.querySelector('input[name="verdict"]').focus();
  });
  $('verdict-form').addEventListener('submit', event => {
    event.preventDefault();
    const choice = document.querySelector('input[name="verdict"]:checked');
    if (!choice) return;
    const responses = {
      theft: 'Access to keys establishes an opportunity, not a theft. Which record actually says the contents were checked?',
      clerk: 'The log says R opened the envelope. It does not say R wrote or changed the instruction. Those are different claims.',
      nothing: 'An apparently intact seal is an observation. The note explicitly says the contents were not checked.'
    };
    if (choice.value !== 'evidence') {
      $('verdict-feedback').textContent = responses[choice.value] || 'Choose the conclusion supported by these documents.';
      return;
    }
    $('verdict-feedback').textContent = 'That conclusion stays within the evidence.';
    $('finding').hidden = false;
    $('finding-title').focus();
  });
  $('share-finding').addEventListener('click', async () => {
    const text = 'I opened the Curator’s Sealed Letter and completed its evidence investigation at Cipher Museum. Try the free reader’s mystery: https://ciphermuseum.com/sealed-letter.html';
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      $('share-feedback').textContent = 'Copied. Paste it wherever you choose—no solution included.';
    } catch (_) {
      $('share-copy-label').hidden = false;
      $('share-copy').hidden = false;
      $('share-copy').value = text;
      $('share-copy').focus();
      $('share-copy').select();
      $('share-feedback').textContent = 'Select and copy the text below. It contains no solution.';
    }
  });
})();
