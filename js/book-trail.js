/* Optional notebook for the four invented book slips. No network requests. */
(function () {
  'use strict';
  var panel = document.getElementById('notebook');
  if (!panel) return;
  var key = 'cipher-museum-book-slips-v1';
  var fields = [1, 2, 3, 4].map(function (n) { return document.getElementById('slip-answer-' + n); });
  var feedback = document.getElementById('notebook-feedback');
  var saved = null;
  function answers() { return fields.map(function (field) { return field.value.trim(); }); }
  function count() {
    document.getElementById('notebook-count').textContent = answers().filter(Boolean).length + ' of 4 answer spaces filled.';
  }
  function openSlip() {
    if (!/^(#slip-[1-4]|#notebook)$/.test(window.location.hash)) return;
    var slip = document.getElementById(window.location.hash.slice(1));
    if (slip.tagName === 'DETAILS') slip.open = true;
    if (typeof slip.scrollIntoView === 'function') slip.scrollIntoView({ block: 'start' });
  }
  panel.hidden = false;
  try {
    var raw = window.localStorage.getItem(key);
    if (raw) {
      var record = JSON.parse(raw);
      if (!record || record.version !== 1 || !Array.isArray(record.answers) || record.answers.length !== 4 ||
          !record.answers.every(function (a) { return typeof a === 'string' && a.length <= 60; })) {
        throw new Error('Invalid notebook');
      }
      fields.forEach(function (field, i) { field.value = record.answers[i]; });
      saved = JSON.stringify(answers());
      feedback.textContent = 'Your saved answers are back. You can edit them and save again.';
    }
  } catch (_) {
    feedback.textContent = 'Saved answers are unavailable in this browser. You can still fill in the notebook and join the answers.';
  }
  count();
  fields.forEach(function (field) {
    field.addEventListener('input', function () {
      count();
      feedback.textContent = saved === JSON.stringify(answers()) ? 'These answers match your saved notebook.' : 'These edits are not saved. Choose “Save on this device” if you want to return to them later.';
    });
  });
  document.getElementById('save-notebook').addEventListener('click', function () {
    try {
      window.localStorage.setItem(key, JSON.stringify({ version: 1, answers: answers() }));
      saved = JSON.stringify(answers());
      feedback.textContent = 'Saved in this browser on this device. Save again after making changes.';
    } catch (_) {
      feedback.textContent = 'This browser could not save the notebook. Keep a paper copy; joining the answers still works.';
    }
  });
  document.getElementById('clear-notebook').addEventListener('click', function () {
    fields.forEach(function (field) { field.value = ''; });
    document.getElementById('instruction').value = '';
    saved = null;
    count();
    try {
      window.localStorage.removeItem(key);
      feedback.textContent = 'The notebook and its saved answers have been cleared.';
    } catch (_) {
      feedback.textContent = 'The visible notebook is clear. This browser did not allow access to any saved copy; clear site data in your browser if you need to remove it.';
    }
    fields[0].focus();
  });
  document.getElementById('notebook-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var missing = fields.find(function (field) { return !field.value.trim(); });
    if (missing) {
      feedback.textContent = 'Fill all four spaces before joining them. Each slip has hints and an answer reveal.';
      missing.focus();
      return;
    }
    var instruction = document.getElementById('instruction');
    instruction.value = answers().join(' ');
    document.getElementById('unlock-feedback').textContent = 'Your four answers are joined. Choose “Open the sealed letter” to check the instruction.';
    feedback.textContent = 'Your answers are ready at the envelope below.';
    instruction.focus();
  });
  document.querySelectorAll('[data-notebook-slip]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      window.location.hash = 'notebook';
      fields[Number(link.dataset.notebookSlip) - 1].focus();
    });
  });
  window.addEventListener('hashchange', openSlip);
  openSlip();
})();
