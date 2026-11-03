'use strict';
/* Egyptian case in lab/decipherment-cases.html#egyptian.
 *
 * Written from the sources before the case was built:
 *   Parkinson, Cracking Codes (1999): p. 15 the classical emphasis on symbolism; p. 31 Young's
 *   Ptolemy cartouche and his "foreign names only" proposal; p. 34 Champollion's count of
 *   1,419 signs against 486 Greek words; p. 35 Ramesses read at Abu Simbel; pp. 57-59 sign
 *   functions.
 *   Collier and Manley, How to Read Egyptian Hieroglyphs (1998): section 2 (consonants, no
 *   vowels; the word pr "go out" with a mouth-sign complement and walking-legs determinative),
 *   section 6 (determinatives add no sound), section 7 (read into the faces of the signs),
 *   sections 11-13 (two- and three-consonant signs, complements, ideograms).
 * Every verdict the page renders, and every fail or mismatch path, is a named test below.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const E = require('../js/egyptian-case');

const ran = new Set();
const test = (name, fn) => { fn(); ran.add(name); };
const html = fs.readFileSync('lab/decipherment-cases.html', 'utf8');

// --- Hypothesis checks against the historical evidence (Parkinson pp. 34-35) ---
test('evidence counts are Parkinson p. 34', () => {
  assert.equal(E.EVIDENCE.count.signs, 1419);
  assert.equal(E.EVIDENCE.count.greekWords, 486);
});
test('count contradicts one sign per word', () => assert.equal(E.check('symbolic', 'count').verdict, 'contradicted'));
test('count contradicts Young', () => assert.equal(E.check('young', 'count').verdict, 'contradicted'));
test('count consistent with mixed', () => assert.equal(E.check('mixed', 'count').verdict, 'consistent'));
test('Ramesses contradicts one sign per word', () => assert.equal(E.check('symbolic', 'ramesses').verdict, 'contradicted'));
test('Ramesses contradicts Young', () => assert.equal(E.check('young', 'ramesses').verdict, 'contradicted'));
test('Ramesses consistent with mixed', () => assert.equal(E.check('mixed', 'ramesses').verdict, 'consistent'));
test('count verdict follows the numbers, not the label', () => {
  // A script with one sign per Greek word would satisfy the symbolic hypothesis.
  assert.equal(E.check('symbolic', 'count', { signs: 486, greekWords: 486 }).verdict, 'consistent');
  assert.equal(E.check('mixed', 'count', { signs: 486, greekWords: 486 }).verdict, 'contradicted');
});
test('Ramesses verdict follows the name origin', () => {
  // A foreign name in sound signs is what Young's hypothesis allows.
  assert.equal(E.check('young', 'ramesses', { origin: 'foreign', soundSigns: true }).verdict, 'consistent');
});
test('one failed check is enough to reject a hypothesis', () => {
  const a = E.assess('young', { count: { signs: 486, greekWords: 486 } });
  assert.equal(a.count.verdict, 'consistent'); assert.equal(a.ramesses.verdict, 'contradicted');
  assert.equal(a.consistent, false);
  assert.equal(E.assess('mixed').consistent, true);
});
test('unknown hypothesis or evidence rejected', () => {
  assert.throws(() => E.check('alphabetic', 'count'));
  assert.throws(() => E.check('mixed', 'obelisk'));
});

// --- Reading one word: pr "go out" (Collier and Manley sections 2, 6, 7) ---
const RIGHT = { house: 'sound', mouth: 'complement', legs: 'determinative' };
test('correct roles give pr', () => {
  const r = E.readRoles(RIGHT);
  assert.equal(r.transliteration, 'pr'); assert.equal(r.matches, true); assert.deepEqual(r.errors, []);
});
test('mouth read as an extra sound gives prr mismatch', () => {
  const r = E.readRoles({ ...RIGHT, mouth: 'sound' });
  assert.equal(r.transliteration, 'prr'); assert.equal(r.matches, false);
});
test('legs read as a sound sign is flagged: no sound value', () => {
  const r = E.readRoles({ ...RIGHT, legs: 'sound' });
  assert.equal(r.matches, false); assert.match(r.errors.join(' '), /walking legs.*no sound value/i);
});
test('house read as a determinative loses pr', () => {
  const r = E.readRoles({ ...RIGHT, house: 'determinative' });
  assert.equal(r.matches, false); assert.notEqual(r.transliteration, 'pr');
});
test('a complement with nothing to complement is flagged', () => {
  const r = E.readRoles({ house: 'determinative', mouth: 'complement', legs: 'determinative' });
  assert.equal(r.matches, false); assert.match(r.errors.join(' '), /complement/i);
});
test('missing role rejected', () => assert.throws(() => E.readRoles({ house: 'sound', mouth: 'complement' })));
test('direction follows facing', () => {
  assert.equal(E.readingDirection('right'), 'rtl');
  assert.equal(E.readingDirection('left'), 'ltr');
});
test('English habit wrong when signs face right', () => assert.equal(E.checkDirection('ltr', 'right').correct, false));
test('reading into the faces correct both ways', () => {
  assert.equal(E.checkDirection('rtl', 'right').correct, true);
  assert.equal(E.checkDirection('ltr', 'left').correct, true);
  assert.equal(E.checkDirection('rtl', 'left').correct, false);
});

// --- Wiring: what the page renders comes from the model ---
const dom = new JSDOM(html);
E.mount(dom.window.document);
const doc = dom.window.document, $ = id => doc.getElementById(id);
const change = (el, v) => { el.value = v; el.dispatchEvent(new dom.window.Event('change')); };
test('attractive hypothesis offered first', () => assert.equal($('egypt-hypothesis').value, 'symbolic'));
test('evidence hidden until a hypothesis is checked', () => assert.equal($('egypt-evidence').hidden, true));
test('record keeps contradicted checks after revision and reset', () => {
  $('egypt-check').click();
  assert.equal($('egypt-evidence').hidden, false);
  assert.match($('egypt-result').textContent, /contradicted/);
  change($('egypt-hypothesis'), 'young'); $('egypt-check').click();
  change($('egypt-hypothesis'), 'mixed'); $('egypt-check').click();
  assert.match($('egypt-result').textContent, /consistent with both/);
  const entries = [...$('egypt-record').children].map(li => li.textContent);
  assert.equal(entries.length, 3);
  assert.match(entries[0], /one word or idea[\s\S]*contradicted/i);
  assert.match(entries[1], /foreign names[\s\S]*contradicted/i);
  $('egypt-reset').click();
  assert.equal($('egypt-evidence').hidden, true);
  assert.equal($('egypt-record').children.length, 3, 'Reset clears the hypothesis, not the record');
});
test('rendered direction verdict follows the rendered facing', () => {
  assert.equal($('egypt-word').dataset.facing, 'right');
  change($('egypt-direction'), 'ltr'); $('egypt-direction-check').click();
  assert.match($('egypt-direction-result').textContent, /^Not quite/);
  $('egypt-flip').click();
  assert.equal($('egypt-word').dataset.facing, 'left');
  $('egypt-direction-check').click();
  assert.match($('egypt-direction-result').textContent, /^Yes/, 'Flipping the signs must flip the right answer');
});
test('rendered role verdict shows the computed transliteration', () => {
  change($('egypt-role-house'), 'sound'); change($('egypt-role-mouth'), 'sound'); change($('egypt-role-legs'), 'determinative');
  $('egypt-roles-check').click();
  assert.match($('egypt-roles-result').textContent, /prr/);
  change($('egypt-role-mouth'), 'complement'); $('egypt-roles-check').click();
  assert.match($('egypt-roles-result').textContent, /Transliteration: pr\b[\s\S]*Translation: “go out”/);
});
test('every control labelled', () => {
  for (const c of doc.querySelectorAll('#egyptian select, #egyptian input')) assert.ok(doc.querySelector('label[for="' + c.id + '"]'), 'Unlabelled ' + c.id);
});
dom.window.close();

// --- Prose and honesty rules ---
const section = new JSDOM(html).window.document.getElementById('egyptian');
const text = section.textContent.replace(/\s+/g, ' ');
test('script, not a cipher', () => assert.match(text, /Egyptian hieroglyphs are a writing system, not a cipher/));
test('Rosetta correction retained', () => {
  assert.match(text, /two languages and three scripts/);
  assert.match(fs.readFileSync('ciphers/rosetta-stone.html', 'utf8'), /two languages and three scripts/);
});
test('chain stages labelled in order', () => {
  const labels = [...section.querySelectorAll('ol.evidence-chain > li > strong')].map(s => s.textContent.replace(/\.$/, ''));
  assert.deepEqual(labels, ['Source', 'Transcription', 'Structural hypothesis', 'Key', 'Reading', 'Independent checks']);
});
test('source-derived stages cite page or section', () => {
  for (const li of section.querySelectorAll('ol.evidence-chain > li')) assert.match(li.textContent, /\((?:Parkinson|Collier and Manley)[^)]*(?:p\.|pp\.|§)/, 'Uncited stage: ' + li.textContent.slice(0, 40));
});
test('exercise labelled: signs are Unicode characters, not a facsimile', () => assert.match(text, /Unicode characters, not a facsimile/));
test('word attributed, not presented as a transcription of one inscription', () => {
  assert.match(text, /from Collier and Manley’s opening chapter/);
  assert.doesNotMatch(text, /transcription of (?:a|the) (?:stela|inscription|tomb)/i);
});
test('A–Z widget on the Khnumhotep page stays labelled invented', () => assert.match(fs.readFileSync('ciphers/egyptian-substitution.html', 'utf8'), /The assignments are invented for display/));
test('sources named', () => {
  assert.match(text, /Richard Parkinson, Cracking Codes: The Rosetta Stone and Decipherment \(University of California Press, 1999\)/);
  assert.match(text, /Mark Collier and Bill Manley, How to Read Egyptian Hieroglyphs \(University of California Press, 1998\)/);
});
test('no private or uploaded copies linked', () => {
  const links = [...section.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
  assert.ok(!links.some(h => /drive\.google|docs\.google|archive\.org/.test(h)));
});

const REQUIRED = [
  'count contradicts one sign per word', 'count contradicts Young', 'count consistent with mixed',
  'Ramesses contradicts one sign per word', 'Ramesses contradicts Young', 'Ramesses consistent with mixed',
  'count verdict follows the numbers, not the label', 'Ramesses verdict follows the name origin', 'one failed check is enough to reject a hypothesis',
  'mouth read as an extra sound gives prr mismatch', 'legs read as a sound sign is flagged: no sound value',
  'house read as a determinative loses pr', 'a complement with nothing to complement is flagged',
  'English habit wrong when signs face right', 'rendered direction verdict follows the rendered facing',
  'rendered role verdict shows the computed transliteration', 'record keeps contradicted checks after revision and reset'
];
for (const name of REQUIRED) assert.ok(ran.has(name), 'Required test did not run: ' + name);
console.log('Egyptian case: ' + ran.size + ' named tests, including ' + REQUIRED.length + ' required verdict and mismatch paths, passed.');
