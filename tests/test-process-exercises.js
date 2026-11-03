'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const I = require('../js/intercept-exercise');
const S = require('../js/structure-exercises');
assert.equal(I.decode(I.raw), 'MEET AT ??ST GATE');
assert.equal(I.decode(I.secondCopy), 'MEET AT EAST GATE');
for (const candidate of ['EAST', 'WEST']) {
  assert.equal(I.compare(candidate, false).fits, true);
  assert.equal(I.compare(candidate, false).checked, null);
  assert.equal(I.compare(candidate, true).checked, candidate === 'EAST');
}
assert.throws(() => I.compare('SOUTH', false));
assert.equal(S.encode(true, false).units, 5);
assert.equal(S.encode(false, false).units, 10);
for (const whole of [true, false]) {
  assert.notEqual(S.encode(whole, false).text, S.encode(whole, true).text);
  assert.equal(S.encode(whole, false).units, S.encode(whole, true).units);
}
assert.equal(S.heldOut('xy').prediction, 'C Y');
assert.equal(S.heldOut('yx').matches, false);
function setup(file, model) {
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'));
  model.mount(dom.window.document); return dom;
}
let dom = setup('lab/intercept-to-intelligence.html', I), doc = dom.window.document;
const original = doc.getElementById('intercept-raw').textContent;
doc.getElementById('intercept-claim').value = 'reading';
doc.getElementById('intercept-assess').click();
assert.match(doc.getElementById('intercept-assessment').textContent, /Not checked yet/);
doc.getElementById('intercept-reveal').click();
assert.match(doc.getElementById('intercept-result').textContent, /WEST conflicts/);
doc.getElementById('intercept-choice').value = 'EAST';
doc.getElementById('intercept-choice').dispatchEvent(new dom.window.Event('change'));
assert.match(doc.getElementById('intercept-result').textContent, /EAST agrees/);
assert.equal(doc.getElementById('intercept-raw').textContent, original);
assert.equal(doc.getElementById('intercept-literal').textContent, 'MEET AT ??ST GATE');
doc.getElementById('intercept-assess').click();
assert.match(doc.getElementById('intercept-assessment').textContent, /Supported by I2/);
doc.getElementById('intercept-reset').click();
assert.equal(doc.getElementById('intercept-copy').hidden, true);
assert.equal(doc.getElementById('intercept-assessment').textContent, '');
dom.window.close();
dom = setup('lab/decipherment-cases.html', S); doc = dom.window.document;
assert.equal(doc.getElementById('linear-heldout').hidden, true);
doc.getElementById('linear-hypothesis').value = 'yx';
doc.getElementById('linear-reveal').click();
assert.match(doc.getElementById('linear-result').textContent, /conflicts/);
doc.getElementById('linear-reset').click();
assert.equal(doc.getElementById('linear-heldout').hidden, true);
assert.match(doc.getElementById('linear-result').textContent, /Both hypotheses/);
dom.window.close();
dom = setup('ciphers/navajo-code-talkers.html', S); doc = dom.window.document;
assert.match(doc.getElementById('navajo-second-result').textContent, /^5 /);
doc.getElementById('navajo-whole').click();
assert.match(doc.getElementById('navajo-second-result').textContent, /^10 /);
const first = doc.getElementById('navajo-second-output').textContent;
doc.getElementById('navajo-alternate').click();
assert.notEqual(doc.getElementById('navajo-second-output').textContent, first);
assert.match(doc.getElementById('navajo-second-result').textContent, /^10 /);
dom.window.close();
for (const file of ['lab/intercept-to-intelligence.html', 'lab/decipherment-cases.html', 'ciphers/navajo-code-talkers.html', 'the-book.html']) {
  const html = fs.readFileSync(file, 'utf8');
  assert.doesNotMatch(html, /(?:drive|docs)\.google\.com|chatgpt\.com\/library/);
}
console.log('Process exercises: retained gaps, independent comparison, inference limits, structural holdout, vocabulary alternatives and public citations passed.');
