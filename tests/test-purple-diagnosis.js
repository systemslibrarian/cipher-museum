'use strict';
/* Purple diagnosis worksheet (lab/purple-diagnosis.html).
 *
 * Written from the sources before the worksheet was built:
 *   Stamp and Low, Applied Cryptanalysis (2007), section 2.3.3, printed pp. 45-48: messages
 *   enciphered with the same key are in depth; matched plaintext and ciphertext at the same key
 *   position constrain that position's permutation; more legs give more of it; an offset depth
 *   goes into step only from some point; the textbook example is explicitly simplified.
 *   Rowlett, The Story of Magic (1998), printed pp. 151-154: statistical tests confirming
 *   same-key messages; Genevieve Grotjan finding the first case of the relationship; the
 *   section gathering, Friedman coming in, Rosen's earlier stepping-switch work, Rowlett with
 *   Ferner and Small checking the results: a team, and a pattern followed by corroboration.
 *   Mundy, Code Girls (2017), pp. 89-94: Grotjan hired as a junior cryptanalyst in 1939;
 *   Rowlett supervising the Purple effort.
 * Every verdict the page renders, and every fail or mismatch path, is a named test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const W = require('../js/purple-diagnosis');

const ran = new Set();
const test = (name, fn) => { fn(); ran.add(name); };
const html = fs.readFileSync('lab/purple-diagnosis.html', 'utf8');
const OFFSETS = W.OFFSETS;

// --- Mechanism: depth, partial permutations, an independent test ---
test('fixture is synthetic and internally consistent', () => {
  assert.equal(W.FIXTURE.synthetic, true);
  for (const m of ['A', 'B']) assert.equal(W.FIXTURE[m].plain.length, W.FIXTURE[m].cipher.length);
  assert.equal(W.FIXTURE.C.cipher.length, W.FIXTURE.C.heldOutPlain.length);
});
test('exactly one offset in range is supported', () => {
  const supported = OFFSETS.filter(k => W.verdict(k).status === 'supported');
  assert.equal(supported.length, 1, 'One alignment, and only one, should survive the independent test');
});
const TRUE_K = OFFSETS.find(k => W.verdict(k).status === 'supported');
test('wrong alignment fails on the independent sample', () => {
  for (const k of OFFSETS) if (k !== TRUE_K) assert.notEqual(W.verdict(k).status, 'supported', 'offset ' + k);
});
test('contradiction path', () => {
  const k = OFFSETS.find(o => W.assemble(o).contradictions.length > 0);
  assert.ok(k !== undefined); assert.equal(W.verdict(k).status, 'contradiction');
});
test('not-confirmed path: consistent but untested by C', () => {
  const k = OFFSETS.find(o => o !== TRUE_K && W.assemble(o).contradictions.length === 0);
  assert.ok(k !== undefined); assert.equal(W.verdict(k).status, 'not confirmed');
  assert.ok(W.testC(k).confirmed.filter(c => c.source === 'B').length < 2);
});
test('wrong-reading path', () => {
  // A fixture where B's placement makes C read a letter that its held-out plaintext contradicts.
  const fx = { A: { plain: 'AB', cipher: 'XY', start: 0 }, B: { plain: 'CD', cipher: 'PQ' }, C: { cipher: 'PQ', heldOutPlain: 'EF', start: 0 } };
  assert.equal(W.verdict(0, fx).status, 'wrong reading');
});
test('letters read from supplied pairs alone do not support an alignment', () => {
  // C is readable entirely from A's supplied pairs; B adds nothing at C's positions.
  const fx = { A: { plain: 'AB', cipher: 'XY', start: 0 }, B: { plain: 'C', cipher: 'Z' }, C: { cipher: 'XY', heldOutPlain: 'AB', start: 0 } };
  const v = W.verdict(5, fx);
  assert.equal(v.test.confirmed.length, 2); assert.equal(v.status, 'not confirmed');
});
test('supported alignment shows the repeated relationship', () => {
  assert.ok(W.assemble(TRUE_K).agreements.length >= 2, 'At the true offset A and B share pairs at the same key positions');
  assert.equal(W.assemble(TRUE_K).contradictions.length, 0);
});
test('verdict needs letters that depend on the alignment', () => {
  const t = W.testC(TRUE_K);
  assert.ok(t.confirmed.filter(c => c.source === 'B').length >= 2);
  assert.ok(t.confirmed.some(c => c.source === 'A'), 'Letters read from supplied pairs alone do not test the alignment');
});
test('inference stays incomplete', () => assert.match(W.testC(TRUE_K).reading, /\?/));
test('supplied and inferred entries are kept apart', () => {
  const sources = new Set(Object.values(W.assemble(TRUE_K).positions).flat().map(e => e.source));
  assert.deepEqual([...sources].sort(), ['A', 'B']);
});
test('offset outside the range rejected', () => assert.throws(() => W.verdict(99)));

// --- Wiring ---
const dom = new JSDOM(html);
W.mount(dom.window.document);
const doc = dom.window.document, $ = id => doc.getElementById(id);
const change = (el, v) => { el.value = String(v); el.dispatchEvent(new dom.window.Event('change')); };
test('held-out plaintext hidden before the test', () => {
  assert.equal($('pd-heldout').hidden, true);
  assert.doesNotMatch(doc.querySelector('main').textContent, new RegExp(W.FIXTURE.C.heldOutPlain));
});
test('rendered verdicts come from the model', () => {
  for (const k of [0, TRUE_K]) {
    change($('pd-offset'), k); $('pd-test').click();
    assert.match($('pd-result').textContent, new RegExp(W.verdict(k).status === 'supported' ? 'Supported' : 'Not confirmed|Contradiction|Wrong reading'));
  }
  assert.equal($('pd-heldout').hidden, false, 'Held-out plaintext revealed after a test');
});
test('table marks supplied and alignment-placed pairs', () => {
  change($('pd-offset'), TRUE_K); $('pd-align').click();
  const cells = [...doc.querySelectorAll('#pd-table tbody td')].map(td => td.textContent);
  assert.ok(cells.some(t => /supplied/.test(t)) && cells.some(t => /your alignment/.test(t)));
});
test('record keeps failed alignments', () => {
  const entries = [...$('pd-record').children].map(li => li.textContent);
  assert.ok(entries.length >= 2);
  assert.ok(entries.some(e => /not confirmed|contradiction|wrong reading/i.test(e)));
  $('pd-reset').click();
  assert.ok($('pd-record').children.length >= 2, 'Reset keeps the record');
});
test('every control labelled', () => {
  for (const c of doc.querySelectorAll('main select, main input')) assert.ok(doc.querySelector('label[for="' + c.id + '"]'), 'Unlabelled ' + c.id);
});
dom.window.close();

// --- Prose and honesty ---
const page = new JSDOM(html).window.document;
const text = page.querySelector('main').textContent.replace(/\s+/g, ' ');
test('synthetic, not the authentic machine', () => {
  assert.match(text, /synthetic/i);
  assert.match(text, /not the Purple machine/);
});
test('disclosure: supplied, assumed, held out, simplified', () => {
  for (const w of [/supplied/i, /assumed/i, /held out/i, /simplif/i]) assert.match(page.getElementById('pd-disclosure').textContent, w);
});
test('a team, not a lone genius', () => {
  for (const n of ['Genevieve Grotjan', 'Frank Rowlett', 'William Friedman', 'Leo Rosen', 'Robert Ferner', 'Albert Small']) assert.ok(text.includes(n), n);
  assert.doesNotMatch(text, /single-handed|lone genius(?! story)|alone (?:broke|cracked|solved)/i);
});
test('no date asserted for the insight', () => assert.doesNotMatch(text, /20 September 1940|September 20, 1940/, 'Sources differ on the date; the worksheet does not assert one'));
test('sources cited by page', () => {
  assert.match(text, /Stamp and Low[^.]*§2\.3\.3[^.]*pp\. 45–48/);
  assert.match(text, /Rowlett[^.]*pp\. 151–154/);
  assert.match(text, /Mundy[^.]*pp\. 89–94/);
});
test('linked from Purple and Cryptanalysis Techniques', () => {
  assert.ok(fs.readFileSync('ciphers/purple.html', 'utf8').includes('href="../lab/purple-diagnosis.html"'));
  assert.ok(fs.readFileSync('cryptanalysis.html', 'utf8').includes('href="lab/purple-diagnosis.html"'));
});

const REQUIRED = ['exactly one offset in range is supported', 'wrong alignment fails on the independent sample', 'contradiction path',
  'not-confirmed path: consistent but untested by C', 'wrong-reading path', 'letters read from supplied pairs alone do not support an alignment', 'verdict needs letters that depend on the alignment',
  'rendered verdicts come from the model', 'record keeps failed alignments'];
for (const n of REQUIRED) assert.ok(ran.has(n), 'Required test did not run: ' + n);
console.log('Purple diagnosis: ' + ran.size + ' named tests, including ' + REQUIRED.length + ' required verdict and failure paths, passed.');
