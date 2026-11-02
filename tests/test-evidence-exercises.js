'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const model = require('../js/evidence-exercises.js');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

// Independently written expected mappings: readable SEND conflicts at A, B and C.
assert.deepEqual(model.inspect('SEND ME AT NOON').filter(r => r.conflict).map(r => r.symbol), ['A', 'B', 'C']);
assert.deepEqual(model.inspect('SEND ME AT NOON')[1], { symbol: 'B', positions: [2, 3, 6], readings: ['E', 'N'], conflict: true });
assert.equal(model.inspect('MEET ME AT NOON').filter(r => r.conflict).length, 0);
assert.equal(new Set(model.inspect('MEET ME AT NOON').map(r => r.readings[0])).size, 6);
assert.throws(() => model.inspect('TOO SHORT'));
assert.equal(model.original, '1 5 5 3 / 1 5 / 9');
assert.equal(model.decode(false), 'M O O T / M O / ?');
assert.equal(model.decode(true), 'M E E T / M E / ?');
assert.equal(model.decode(false), 'M O O T / M O / ?');
assert.equal(model.encode('regular'), '46 41 43 45');
assert.equal(model.encode('shuffled'), '44 41 46 45');
assert.deepEqual(model.checkPrediction('regular', 43), { correct: true, answer: 43 });
assert.deepEqual(model.checkPrediction('shuffled', 43), { correct: false, answer: 46 });
assert.deepEqual(model.checkPrediction('shuffled', 46), { correct: true, answer: 46 });
for (const bad of [NaN, 40, 47, 43.5]) assert.throws(() => model.checkPrediction('regular', bad));
assert.throws(() => model.encode('unknown'));

function setup(file) {
  const dom = new JSDOM(read(file), { url: 'https://ciphermuseum.com/' + file });
  model.mount(dom.window.document); return dom;
}
let d = setup('lab/evidence-workbench.html'), doc = d.window.document;
doc.querySelector('[aria-label="Inspect symbol B"]').click();
assert.match(doc.getElementById('reading-result').textContent, /positions 2, 3, 6: E and N.*Conflict/);
doc.getElementById('reading-check').click();
assert.match(doc.getElementById('reading-result').textContent, /Reject.*A, B, C/);
doc.getElementById('reading-candidate').value = 'consistent';
doc.getElementById('reading-candidate').dispatchEvent(new d.window.Event('change'));
assert.equal(doc.querySelectorAll('#reading-symbols button[aria-pressed=true]').length, 0);
doc.getElementById('reading-check').click();
assert.match(doc.getElementById('reading-result').textContent, /not proof.*unique decipherment/);
assert.equal(doc.getElementById('source-raw').value, '', 'Standalone exercise must not write to the research record');
d.window.close();

d = setup('ciphers/mary-stuart-castelnau-letters.html'); doc = d.window.document;
const original = doc.getElementById('confusion-original').textContent;
for (let i = 0; i < 4; i++) {
  doc.getElementById('key-confusion-toggle').click();
  assert.equal(doc.getElementById('confusion-proposal').textContent, i % 2 === 0 ? 'M E E T / M E / ?' : 'No alternative reading applied.');
  assert.equal(doc.getElementById('confusion-original').textContent, original);
  assert.equal(doc.getElementById('confusion-literal').textContent, 'M O O T / M O / ?');
  assert.match(doc.getElementById('confusion-result').textContent, /9.*(unresolved|unknown)/);
}
d.window.close();

d = setup('ciphers/nomenclator.html'); doc = d.window.document;
function submit(value) { doc.getElementById('table-guess').value = value; doc.getElementById('table-prediction').dispatchEvent(new d.window.Event('submit', { bubbles: true, cancelable: true })); }
submit(''); assert.match(doc.getElementById('table-result').textContent, /whole number/);
submit('43'); assert.match(doc.getElementById('table-result').textContent, /matches: C → 43/);
assert.equal(doc.getElementById('table-hidden-entries').textContent, 'C → 43; D → 44; E → 45; F → 46');
doc.getElementById('table-mode').value = 'shuffled'; doc.getElementById('table-mode').dispatchEvent(new d.window.Event('change'));
assert.equal(doc.getElementById('table-guess').value, '');
assert.match(doc.getElementById('table-hidden-entries').textContent, /C → \?/);
assert.equal(doc.getElementById('table-ciphertext').textContent, '44 41 46 45');
submit('43'); assert.match(doc.getElementById('table-result').textContent, /does not match: C → 46/);
submit('46'); assert.match(doc.getElementById('table-result').textContent, /matches: C → 46/);
doc.getElementById('table-reset').click(); assert.match(doc.getElementById('table-hidden-entries').textContent, /C → \?/);
d.window.close();

// Keep essential historical denominators, attribution and model boundaries visible.
const history = new JSDOM(read('ciphers/geheimschreiber.html')).window.document.getElementById('daily-codebreaking').textContent;
assert.match(history, /193 of FRA’s 287 civilian staff/);
assert.match(history, /113.*400/);
assert.match(history, /67% figure refers to civilians/);
assert.match(history, /not just its T52 team/);
for (const file of ['lab/evidence-workbench.html', 'ciphers/mary-stuart-castelnau-letters.html', 'ciphers/nomenclator.html', 'ciphers/geheimschreiber.html']) {
  const html = read(file); assert.match(html, /css\/evidence-exercises.css/);
  const page = new JSDOM(html).window.document;
  const ids = [...page.querySelectorAll('[id]')].map(el => el.id);
  assert.equal(new Set(ids).size, ids.length, file + ': no duplicate anchors');
  assert(page.querySelector('.evidence-exercise a[href^="https://"]'), 'Visible primary source');
}
console.log('Evidence exercises: consistency, preserved source/literal layers, unresolved symbol, held-out predictions, reset and source boundaries passed.');
