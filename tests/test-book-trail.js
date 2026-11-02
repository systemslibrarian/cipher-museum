'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const key = 'cipher-museum-book-slips-v1';
function open(saved, blocked = false, hash = '') {
  const dom = new JSDOM(read('sealed-letter.html'), { url: 'https://ciphermuseum.com/sealed-letter.html' + hash, runScripts: 'outside-only' });
  const w = dom.window;
  if (saved !== undefined) w.localStorage.setItem(key, saved);
  if (blocked) Object.defineProperty(w, 'localStorage', { get() { throw new Error('Storage blocked'); } });
  w.eval(read('js/reader-companion.js'));
  w.eval(read('js/book-trail.js'));
  return { dom, w, $: id => w.document.getElementById(id), submit: id => w.document.getElementById(id).dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })) };
}

// The directory must lead to real exhibits and fragments, including all four slip stops.
const directory = new JSDOM(read('the-book.html')).window.document;
const visits = [...directory.querySelectorAll('[data-book-chapter]')];
assert.equal(visits.length, 20);
assert.deepEqual(visits.map(li => Number(li.dataset.bookChapter)), Array.from({ length: 20 }, (_, i) => i + 1));
assert.deepEqual(visits.filter(li => li.querySelector('.slip-stop')).map(li => Number(li.dataset.bookChapter)), [1, 3, 14, 17]);
for (const link of directory.querySelectorAll('#chapter-visits a')) {
  const [file, fragment] = link.getAttribute('href').split('#');
  const target = new JSDOM(read(file)).window.document;
  if (fragment) assert.ok(target.getElementById(fragment), `${file}#${fragment} exists`);
}

let saved;
{
  const { dom, w, $, submit } = open(undefined, false, '#slip-3');
  try {
    assert.equal($('notebook').hidden, false);
    assert.equal($('slip-3').open, true, 'Book links open their slip, but not its answer');
    assert.equal($('slip-3').querySelectorAll('details[open]').length, 0);
    $('slip-answer-1').value = '  compare  ';
    $('slip-answer-1').dispatchEvent(new w.Event('input'));
    assert.match($('notebook-count').textContent, /^1 of 4/);
    assert.equal(w.localStorage.getItem(key), null, 'Typing does not save without a choice');
    submit('notebook-form');
    assert.equal(w.document.activeElement.id, 'slip-answer-2');
    assert.equal($('investigation').hidden, true);
    $('save-notebook').click();
    saved = w.localStorage.getItem(key);
    assert.deepEqual(JSON.parse(saved).answers, ['compare', '', '', '']);
    $('slip-answer-1').value = 'unsaved change';
    $('slip-answer-1').dispatchEvent(new w.Event('input'));
    assert.equal(w.localStorage.getItem(key), saved, 'Editing leaves the saved copy alone');
  } finally { dom.window.close(); }
}
{
  const { dom, w, $, submit } = open(saved);
  try {
    assert.equal($('slip-answer-1').value, 'compare', 'The next visit restores the saved answer');
    ['the copies', 'before', 'you trust them'].forEach((a, i) => { $('slip-answer-' + (i + 2)).value = a; });
    submit('notebook-form');
    assert.equal($('instruction').value, 'compare the copies before you trust them');
    assert.equal(w.document.activeElement.id, 'instruction');
    assert.equal($('investigation').hidden, true, 'Joining answers does not bypass the existing checker');
    submit('unlock-form');
    assert.equal($('investigation').hidden, false);
    w.localStorage.setItem('unrelated-preference', 'keep');
    $('clear-notebook').click();
    assert.equal(w.localStorage.getItem(key), null);
    assert.equal(w.localStorage.getItem('unrelated-preference'), 'keep');
    assert.equal($('instruction').value, '');
    assert.equal($('slip-answer-1').value, '');
    assert.match($('notebook-count').textContent, /^0 of 4/);
  } finally { dom.window.close(); }
}
{
  const { dom, $, submit } = open(undefined, true);
  try {
    ['COMPARE', 'THE COPIES', 'BEFORE', 'YOU TRUST THEM'].forEach((a, i) => { $('slip-answer-' + (i + 1)).value = a; });
    $('save-notebook').click();
    assert.match($('notebook-feedback').textContent, /could not save/);
    submit('notebook-form'); submit('unlock-form');
    assert.equal($('investigation').hidden, false, 'Blocked storage does not block the case');
    $('clear-notebook').click();
    assert.match($('notebook-feedback').textContent, /did not allow access/);
  } finally { dom.window.close(); }
}
for (const value of ['bad JSON', 'null', JSON.stringify({ version: 1, answers: ['only one'] }), JSON.stringify({ version: 2, answers: ['', '', '', ''] }), JSON.stringify({ version: 1, answers: ['x'.repeat(61), '', '', ''] })]) {
  const { dom, $ } = open(value);
  try { assert.equal($('slip-answer-1').value, ''); assert.match($('notebook-feedback').textContent, /unavailable/); }
  finally { dom.window.close(); }
}
{
  const payload = '<img src=x onerror=alert(1)>';
  const { dom, w, $, submit } = open(JSON.stringify({ version: 1, answers: [payload, 'x', 'y', 'z'] }));
  try {
    submit('notebook-form'); submit('unlock-form');
    assert.equal(w.document.querySelector('img[src=x]'), null, 'Saved values remain input text');
    assert.equal($('investigation').hidden, true);
  } finally { dom.window.close(); }
}
console.log('Book trail: 20 destinations, four slip stops, deep links, optional saving, reload, clear, storage failures and checker integration passed.');
