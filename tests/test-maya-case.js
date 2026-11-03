'use strict';
/* Maya case in lab/decipherment-cases.html#maya.
 *
 * Written from Michael D. Coe, Breaking the Maya Code, 3rd edition (2012), before the case
 * was built. Chapters are cited because the reading copy's pagination is not the print's:
 *   ch. 4  Landa's account written in Spain around 1566, known from a later copy Brasseur found;
 *   ch. 6  Knorozov (1952): Landa's informants wrote signs answering Spanish letter names as
 *          Landa said them (b as "be"), so the signs are syllables; a mixed system of
 *          logograms and phonetic signs; k'u-tz(u) "turkey" over a turkey picture, the word
 *          used in Colonial and modern Maya; synharmony; Thompson attacked the readings;
 *   ch. 7  Proskouriakoff at Piedras Negras: in each set the earliest date, with the
 *          "upended frog" glyph, falls 12 to 31 years before a "toothache" accession date,
 *          and the set covers a ruler's lifetime;
 *   ch. 10 later work: synharmony for short vowels, disharmony for long, e.g. ba-k(i) baak.
 * Every verdict the page renders, and every fail or mismatch path, is a named test below.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const M = require('../js/maya-case');

const ran = new Set();
const test = (name, fn) => { fn(); ran.add(name); };
const html = fs.readFileSync('lab/decipherment-cases.html', 'utf8');

// --- Alphabet or syllables? (Coe ch. 6) ---
test('letter names contradict an alphabet', () => assert.equal(M.check('alphabet', 'letterNames').verdict, 'contradicted'));
test('letter names consistent with syllables', () => assert.equal(M.check('syllabic', 'letterNames').verdict, 'consistent'));
test('turkey contradicts an alphabet: two signs cannot spell three sounds', () => {
  const r = M.check('alphabet', 'turkey');
  assert.equal(r.verdict, 'contradicted'); assert.equal(r.spelledSounds, 2); assert.equal(r.wordSounds, 3);
});
test('turkey consistent with syllables', () => {
  const r = M.check('syllabic', 'turkey');
  assert.equal(r.verdict, 'consistent'); assert.equal(r.spelledSounds, 3);
});
test('one failed check is enough to reject a hypothesis', () => {
  const a = M.assess('alphabet', { turkey: { signs: ['k', 'u', 'tz'], word: ['k', 'u', 'tz'] } });
  assert.equal(a.turkey.verdict, 'consistent'); assert.equal(a.letterNames.verdict, 'contradicted'); assert.equal(a.consistent, false);
  assert.equal(M.assess('syllabic').consistent, true);
});
test('turkey verdict follows the data, not the label', () => {
  // Three one-sound signs would fit letters, and would not fit two-sound syllables.
  assert.equal(M.check('alphabet', 'turkey', { signs: ['k', 'u', 'tz'], word: ['k', 'u', 'tz'] }).verdict, 'consistent');
  assert.equal(M.check('syllabic', 'turkey', { signs: ['k', 'u', 'tz'], word: ['k', 'u', 'tz'] }).verdict, 'contradicted');
});
test('letter-name verdict follows the data', () => {
  // If the informant had heard a bare consonant, a one-letter sign would fit.
  assert.equal(M.check('alphabet', 'letterNames', { heard: ['b'] }).verdict, 'consistent');
});
test('unknown hypothesis or evidence rejected', () => {
  assert.throws(() => M.check('pictographic', 'turkey'));
  assert.throws(() => M.check('syllabic', 'codex'));
});

// --- 1952 rule versus the later refinement (Coe ch. 6 and ch. 10) ---
test('synharmonic spelling reads a short vowel: k’u-tz(u) is k’utz', () => {
  const r = M.readSpelling(['k’u', 'tzu']);
  assert.equal(r.word, 'k’utz'); assert.equal(r.knorozov1952, 'synharmonic'); assert.equal(r.laterRule, 'short vowel');
});
test('disharmonic spelling: Knorozov’s rule has no reading, the later rule marks a long vowel', () => {
  const r = M.readSpelling(['ba', 'ki']);
  assert.equal(r.knorozov1952, 'not covered'); assert.equal(r.laterRule, 'long vowel'); assert.equal(r.word, 'baak');
});
test('malformed spelling rejected', () => assert.throws(() => M.readSpelling(['k’u'])));

// --- Date pattern (Coe ch. 7), on an invented fixture ---
test('fixture is labelled invented and stays inside the reported 12 to 31 years', () => {
  assert.equal(M.DATE_SETS.invented, true);
  for (const s of M.DATE_SETS.sets) { const gap = s.accession - s.initial; assert.ok(gap >= 12 && gap <= 31, s.name); }
});
test('varying gaps contradict a fixed cycle', () => assert.equal(M.checkDates('cycle').verdict, 'contradicted'));
test('gaps consistent with events in one life', () => assert.equal(M.checkDates('lives').verdict, 'consistent'));
test('date verdict follows the data: equal gaps would fit a cycle', () => {
  const equal = [{ name: 'X', initial: 0, accession: 20, last: 40 }, { name: 'Y', initial: 100, accession: 120, last: 140 }];
  assert.equal(M.checkDates('cycle', equal).verdict, 'consistent');
});
test('a set longer than a lifetime contradicts events in one life', () => {
  const long = [{ name: 'Z', initial: 0, accession: 20, last: 130 }];
  assert.equal(M.checkDates('lives', long).verdict, 'contradicted');
});

// --- Wiring ---
const dom = new JSDOM(html);
M.mount(dom.window.document);
const doc = dom.window.document, $ = id => doc.getElementById(id);
const change = (el, v) => { el.value = v; el.dispatchEvent(new dom.window.Event('change')); };
test('attractive hypothesis offered first', () => assert.equal($('maya-hypothesis').value, 'alphabet'));
test('evidence hidden until a hypothesis is checked', () => assert.equal($('maya-evidence').hidden, true));
test('record keeps contradicted checks after revision and reset', () => {
  $('maya-check').click();
  assert.equal($('maya-evidence').hidden, false);
  assert.match($('maya-result').textContent, /contradicted/);
  change($('maya-hypothesis'), 'syllabic'); $('maya-check').click();
  assert.match($('maya-result').textContent, /consistent with both/);
  const entries = [...$('maya-record').children].map(li => li.textContent);
  assert.equal(entries.length, 2);
  assert.match(entries[0], /alphabet[\s\S]*contradicted/i);
  $('maya-reset').click();
  assert.equal($('maya-evidence').hidden, true);
  assert.equal($('maya-record').children.length, 2, 'Reset clears the hypothesis, not the record');
});
test('rendered spelling verdict shows both rules', () => {
  change($('maya-spelling'), 'ba ki'); $('maya-spelling-check').click();
  assert.match($('maya-spelling-result').textContent, /1952[\s\S]*not covered[\s\S]*long vowel[\s\S]*baak/);
  change($('maya-spelling'), 'k’u tzu'); $('maya-spelling-check').click();
  assert.match($('maya-spelling-result').textContent, /k’utz/);
});
test('rendered date verdict comes from the fixture', () => {
  change($('maya-dates-hypothesis'), 'cycle'); $('maya-dates-check').click();
  assert.match($('maya-dates-result').textContent, /contradicted/);
  change($('maya-dates-hypothesis'), 'lives'); $('maya-dates-check').click();
  assert.match($('maya-dates-result').textContent, /consistent/);
  const cells = [...doc.querySelectorAll('#maya-date-table tbody td')].map(td => td.textContent.trim());
  for (const s of M.DATE_SETS.sets) assert.ok(cells.includes(String(s.accession - s.initial)), 'Table must show the gap for ' + s.name);
});
test('every control labelled', () => {
  for (const c of doc.querySelectorAll('#maya select, #maya input')) assert.ok(doc.querySelector('label[for="' + c.id + '"]'), 'Unlabelled ' + c.id);
});
dom.window.close();

// --- Prose and honesty rules ---
const section = new JSDOM(html).window.document.getElementById('maya');
const text = section.textContent.replace(/\s+/g, ' ');
test('script, not a code; living languages', () => {
  assert.match(text, /Maya writing is a script for Maya languages, not a code/);
  assert.match(text, /Mayan languages are living languages/);
  assert.doesNotMatch(text.replace(/not a code/g, ''), /secret code|encrypted|encryption/i, 'Never imply living Maya languages are codes');
});
test('chain stages labelled in order', () => {
  const labels = [...section.querySelectorAll('ol.evidence-chain > li > strong')].map(s => s.textContent.replace(/\.$/, ''));
  assert.deepEqual(labels, ['Source', 'Transcription', 'Structural hypothesis', 'Key', 'Reading', 'Independent checks']);
});
test('every stage cites a Coe chapter', () => {
  for (const li of section.querySelectorAll('ol.evidence-chain > li')) assert.match(li.textContent, /\(Coe ch(?:s)?\. \d/, 'Uncited stage: ' + li.textContent.slice(0, 40));
});
test('historical hypothesis and current reading kept distinct', () => {
  assert.match(text, /Knorozov proposed in 1952/);
  assert.match(text, /later epigraphers/i);
});
test('date fixture labelled invented in the UI', () => assert.match(text, /invented figures/i));
test('no Maya glyph images or uploaded copies', () => {
  assert.equal(section.querySelectorAll('img').length, 0, 'No glyph images: the books’ plates are not reproduced');
  const links = [...section.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
  assert.ok(!links.some(h => /drive\.google|docs\.google|archive\.org/.test(h)));
});
test('source named with edition', () => assert.match(text, /Michael D\. Coe, Breaking the Maya Code, 3rd edition \(Thames & Hudson, 2012\)/));

const REQUIRED = [
  'letter names contradict an alphabet', 'turkey contradicts an alphabet: two signs cannot spell three sounds',
  'letter names consistent with syllables', 'turkey consistent with syllables', 'one failed check is enough to reject a hypothesis',
  'turkey verdict follows the data, not the label', 'letter-name verdict follows the data',
  'disharmonic spelling: Knorozov’s rule has no reading, the later rule marks a long vowel',
  'varying gaps contradict a fixed cycle', 'date verdict follows the data: equal gaps would fit a cycle',
  'a set longer than a lifetime contradicts events in one life', 'record keeps contradicted checks after revision and reset',
  'rendered spelling verdict shows both rules', 'rendered date verdict comes from the fixture'
];
for (const name of REQUIRED) assert.ok(ran.has(name), 'Required test did not run: ' + name);
console.log('Maya case: ' + ran.size + ' named tests, including ' + REQUIRED.length + ' required verdict and mismatch paths, passed.');
