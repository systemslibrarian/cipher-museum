'use strict';

// Source-derived constraints and original fixture expectations were checked against the
// passages listed in docs/DOT_HISTORICAL_ADDITIONS_2026-11-04.md. The toy is not a replay.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const C = require('../js/charles-v-case');
let tests = 0;
function test(name, fn) { try { fn(); tests++; } catch (error) { error.message = name + ': ' + error.message; throw error; } }
const cases = fs.readFileSync('lab/decipherment-cases.html', 'utf8');
const intercept = fs.readFileSync('lab/intercept-to-intelligence.html', 'utf8');
const ika = fs.readFileSync('ciphers/ika.html', 'utf8');
const normalize = el => el.textContent.replace(/\s+/g, ' ').trim();

test('the first fragment contradicts all one-letter assignments by length', () => {
  assert.deepEqual(C.assessUnits('letters', ['a', 'b'], 'GOTO'), { tokenCount: 2, characterCount: 4, compatible: false });
  assert.equal(C.assessUnits('mixed', ['a', 'b'], 'GOTO').compatible, true);
});
test('a different fragment can support letters; a model name is not a fixed verdict', () => {
  assert.equal(C.assessUnits('letters', ['a', 'b'], 'GO').compatible, true);
  assert.equal(C.assessUnits('mixed', [], 'GO').compatible, false);
  assert.throws(() => C.assessUnits('syllables-only', ['a'], 'GO'));
});
test('original message uses multi-letter, word and null entries, preserving the unknown', () => {
  assert.deepEqual(C.decode(C.MESSAGE, C.PARTIAL_KEY), { text: 'GOTOGATE[g5]', unknown: ['g5'] });
  assert.equal(C.PARTIAL_KEY.g3.kind, 'word');
  assert.equal(C.PARTIAL_KEY.g4.kind, 'null');
  assert.equal(Object.hasOwn(C.PARTIAL_KEY, 'g5'), false);
});
test('decode is compositional on an independent key and keeps missing occurrences', () => {
  const key = { a: { kind: 'letters', value: 'CH' }, b: { kind: 'null', value: '' }, c: { kind: 'word', value: 'ROAD' } };
  assert.deepEqual(C.decode(['c', 'b', 'a', 'z', 'z'], key), { text: 'ROADCH[z][z]', unknown: ['z', 'z'] });
  assert.equal(C.decode(['toString'], key).text, '[toString]', 'Inherited object properties are not key entries');
});
test('null is a typed empty value, not an unknown or a silently blank letter', () => {
  assert.equal(C.decode(['g4'], C.PARTIAL_KEY).text, '');
  assert.deepEqual(C.decode(['g4'], C.PARTIAL_KEY).unknown, []);
  assert.throws(() => C.decode(['x'], { x: { kind: 'null', value: 'E' } }));
  assert.throws(() => C.decode(['x'], { x: { kind: 'letters', value: '' } }));
});
test('check-copy agreement follows the key and the independently supplied reading', () => {
  assert.equal(C.checkCopy(['g2', 'g4', 'g1'], 'TOGO', C.PARTIAL_KEY).matches, true);
  assert.equal(C.checkCopy(['g2', 'g4', 'g1'], 'TOGO', C.candidateKey('letter')).matches, false);
  assert.equal(C.checkCopy(['g2', 'g4', 'g1'], 'TOEGO', C.candidateKey('letter')).matches, true);
  assert.equal(C.checkCopy(['g2', 'g4', 'g1'], 'TOGO', { ...C.PARTIAL_KEY, g2: { kind: 'letters', value: 'TA' } }).matches, false);
});
test('a printed unknown marker cannot pass as a deciphered reading', () => {
  assert.equal(C.checkCopy(['g5'], '[g5]', C.PARTIAL_KEY).matches, false);
});

const dom = new JSDOM(cases);
const doc = dom.window.document;
const $ = id => doc.getElementById(id);
const change = (id, value) => { $(id).value = value; $(id).dispatchEvent(new dom.window.Event('change')); };
C.mount(doc);
C.mount(doc); // Mounting twice must not duplicate controls or checks.
test('later evidence starts hidden and cannot be opened before its prerequisite', () => {
  for (const id of ['charles-fragment', 'charles-key', 'charles-copy']) assert.equal($(id).hidden, true);
  for (const id of ['charles-reveal-key', 'charles-check-copy']) assert.equal($(id).disabled, true);
  $('charles-reveal-key').click();
  $('charles-check-copy').click();
  assert.equal($('charles-key').hidden, true);
  assert.equal($('charles-record').children.length, 0);
});
test('a failed initial hypothesis is recorded before a revised model', () => {
  $('charles-check-model').click();
  assert.match($('charles-model-result').textContent, /2 tokens.*4 characters.*contradicted/);
  assert.equal($('charles-record').children.length, 1);
  change('charles-model', 'mixed');
  $('charles-check-model').click();
  assert.match($('charles-model-result').textContent, /compatible.*does not determine.*unique key/);
  assert.equal($('charles-record').children.length, 2);
  assert.match($('charles-record').firstChild.textContent, /contradicted/);
});
test('opening the typed key produces a partial literal reading', () => {
  $('charles-reveal-key').click();
  assert.equal($('charles-reading').textContent, 'GOTOGATE[g5]');
  assert.match($('charles-reading-note').textContent, /\[g5\].*unknown.*No spaces/);
  assert.equal($('charles-copy').hidden, true);
  assert.equal($('charles-check-copy').disabled, false);
});
test('the deliberate changed null fails and the restored key passes the withheld copy', () => {
  change('charles-null', 'letter');
  assert.equal($('charles-reading').textContent, 'GOTOGATEE[g5]');
  $('charles-check-copy').click();
  assert.match($('charles-copy-result').textContent, /TOEGO.*TOGO.*Mismatch/);
  change('charles-null', 'null');
  assert.match($('charles-copy-result').textContent, /Candidate changed/);
  $('charles-check-copy').click();
  assert.match($('charles-copy-result').textContent, /Exact agreement.*unknown g5.*not a complete key/);
  const record = [...$('charles-record').children].map(normalize);
  assert.equal(record.length, 4);
  assert.match(record[2], /g4 changed to E.*Mismatch/);
});
test('restart closes clues while preserving the failed attempts and their old readings', () => {
  const before = $('charles-record').textContent;
  $('charles-reset').click();
  assert.equal($('charles-record').textContent, before);
  assert.equal($('charles-reading').textContent, '');
  for (const id of ['charles-fragment', 'charles-key', 'charles-copy']) assert.equal($(id).hidden, true);
  for (const id of ['charles-reveal-key', 'charles-check-copy']) assert.equal($(id).disabled, true);
});
test('staged controls have labels and status output', () => {
  for (const control of doc.querySelectorAll('#charles-v select')) assert.ok(doc.querySelector('label[for="' + control.id + '"]'));
  assert.equal($('charles-model-result').getAttribute('role'), 'status');
  assert.equal($('charles-copy-result').getAttribute('role'), 'status');
});

function checkCharlesBoundaries(html) {
  const page = new JSDOM(html);
  try {
    const section = page.window.document.getElementById('charles-v');
    assert.ok(section);
    const text = normalize(section);
    assert.match(text, /Every token, key entry and reading below is invented/);
    assert.match(text, /does not reproduce the historical symbols, diacritic rules or plaintext/);
    assert.match(text, /writes 22 February 1546.*dates it 1547.*January-start.*Easter/);
    assert.match(text, /not a Julian-to-Gregorian day conversion/);
    assert.match(text, /context-based guesses.*nomenclator is limited/);
    assert.match(text, /does not establish that the alleged plot happened/);
    assert.match(text, /2023 study/);
    assert.ok(section.querySelector('a[href="https://ecp.ep.liu.se/index.php/histocrypt/article/view/704"]'));
    assert.ok(section.querySelector('a[href="https://hal.science/hal-05269981v2"]'));
  } finally { page.window.close(); }
}
test('Charles source boundaries cover provenance, partial key, dating and allegations', () => checkCharlesBoundaries(cases));
test('the date guard rejects overwriting the written year with the normalized year', () => {
  assert.throws(() => checkCharlesBoundaries(cases.replace('letter writes 22 February <strong>1546</strong>', 'letter writes 22 February <strong>1547</strong>')));
});

function checkPortugueseBoundaries(html) {
  const page = new JSDOM(html);
  try {
    const section = page.window.document.getElementById('portuguese-1649');
    assert.ok(section);
    const text = normalize(section);
    assert.match(text, /survive with contemporary Portuguese plaintexts and Dutch translations/);
    assert.match(text, /not a first disclosure of previously unknown messages/);
    assert.match(text, /historical decipherer is unnamed/);
    assert.match(text, /Silence in the reply does not prove that nobody discussed or used the intelligence/);
    assert.match(text, /catalogue entries quoted in the 2022 paper/);
    assert.match(text, /1649-3-28.*1649-12-3.*correct the months to May and June/);
    assert.match(text, /forças.*forces.*fortressen.*fortresses/);
    assert.deepEqual([...section.querySelectorAll('time')].map(t => t.dateTime), ['1649-05-28', '1649-06-03', '1649-06-18', '1649-06-19', '1649-06-21', '1649-07-23', '1649-09-20', '1649-10-01']);
    for (const reference of ['65-167, ff. 146–147', '65-88, f. 140', '65-59, f. 139', '65-168, ff. 142–143', '65-89, f. 145', '65-90, f. 141']) assert.ok(text.includes(reference), reference);
    assert.ok(section.querySelector('a[href="https://ecp.ep.liu.se/index.php/histocrypt/article/view/392"]'));
  } finally { page.window.close(); }
}
test('Portuguese timeline distinguishes documents, translation and untraced consequences', () => checkPortugueseBoundaries(intercept));
test('the Portuguese guard rejects turning archival silence into proof of no use', () => {
  assert.throws(() => checkPortugueseBoundaries(intercept.replace('Silence in the reply does not prove that nobody discussed or used the intelligence.', 'Silence proves that nobody used the intelligence.')));
});
test('the timeline guard rejects moving receipt to the dispatch date', () => {
  assert.throws(() => checkPortugueseBoundaries(intercept.replace('datetime="1649-09-20"', 'datetime="1649-07-23"')));
});

function checkIkaBoundaries(html) {
  const page = new JSDOM(html);
  try {
    const d = page.window.document;
    const text = normalize(d.querySelector('main'));
    assert.match(text, /physical IKA mechanism is not established by the cited 2021 study/);
    assert.match(text, /no machine simulator/);
    assert.match(text, /intercept dates, not a known invention date/);
    assert.match(text, /42-symbol group/);
    assert.match(text, /seven-symbol group/);
    assert.deepEqual([...d.querySelectorAll('[data-evidence-tier]')].map(row => row.dataset.evidenceTier), ['traffic', 'successor', 'analogue', 'hypothesis']);
    assert.match(normalize(d.querySelector('[data-evidence-tier="successor"]')), /Figure 2 shows M-1.*not an authenticated IKA/);
    assert.match(normalize(d.querySelector('[data-evidence-tier="analogue"]')), /American M-1 analogue.*Figure 3.*rejects/);
    assert.match(normalize(d.querySelector('[data-evidence-tier="hypothesis"]')), /Kryha-like disks or a Damm half-rotor remain hypotheses/);
    assert.ok(d.querySelector('a[href="https://ecp.ep.liu.se/index.php/histocrypt/article/view/155"]'));
    assert.ok(d.querySelector('script[src="../js/demo-loader.min.js"]'));
    assert.equal(d.querySelectorAll('img').length, 0, 'No unlicensed or misidentified machine photographs');
  } finally { page.window.close(); }
}
test('IKA distinguishes traffic, successor hardware, American analogue and hypotheses', () => checkIkaBoundaries(ika));
test('the IKA guard rejects mislabelling the captured M-1 as IKA', () => {
  assert.throws(() => checkIkaBoundaries(ika.replace('Figure 2 shows M-1', 'Figure 2 shows IKA')));
});
test('the IKA guard rejects presenting a proposed mechanism as authenticated hardware', () => {
  assert.throws(() => checkIkaBoundaries(ika.replace('Kryha-like disks or a Damm half-rotor remain hypotheses', 'Kryha-like disks are the authenticated IKA mechanism')));
});
test('new historical sections contain no private source links or copied source images', () => {
  const p = new JSDOM(intercept);
  const i = new JSDOM(ika);
  for (const section of [$('charles-v'), p.window.document.getElementById('portuguese-1649'), i.window.document.querySelector('main')]) {
    assert.equal(section.querySelectorAll('img').length, 0);
    for (const a of section.querySelectorAll('a[href]')) assert.doesNotMatch(a.href, /drive\.google|docs\.google/);
  }
  p.window.close(); i.window.close();
});
dom.window.close();
console.log('Dot historical additions: ' + tests + ' focused checks passed, including data-dependent counterexamples and five in-memory content regressions.');
