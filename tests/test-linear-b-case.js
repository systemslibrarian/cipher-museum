'use strict';
/* Linear B case in lab/decipherment-cases.html.
 *
 * The case teaches four things a decipherment record must keep apart: structure before
 * sound, an attractive interpretation that fails, a test from evidence not used to build
 * the hypothesis, and readings that stay open. Each guard below names what it protects.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const S = require('../js/structure-exercises');

const html = fs.readFileSync('lab/decipherment-cases.html', 'utf8');

// 1. The attractive hypothesis is the one frequency favours, and it fails the held-out test.
assert.equal(S.commonest(), 'Y', 'The fixture must make Y the commonest ending');
assert.equal(S.heldOut('yx').prediction, 'C X');
assert.equal(S.heldOut('yx').matches, false, 'The frequency-favoured reading must be contradicted, or the exercise has no attractive wrong hypothesis');
assert.equal(S.heldOut('xy').matches, true);
for (const h of ['xy', 'yx']) assert.deepEqual(S.heldOut(h).unresolved, ['Z'], 'Z must stay unassigned whichever hypothesis passes');
assert.throws(() => S.heldOut('zz'));

// 2. The static table states the same counts the model uses.
const page = new JSDOM(html).window.document;
const section = page.getElementById('linear-b');
const cells = [...section.querySelectorAll('table tbody td')].map(td => td.textContent.trim());
for (const [family, counts] of Object.entries(S.TRAINING))
  for (const [ending, n] of Object.entries(counts))
    assert.ok(cells.includes(family + ' ' + ending + ' (' + n + ')'), 'Table must show ' + family + ' ' + ending + ' (' + n + ')');

// 3. Wiring: the failed prediction stays on record through revision and reset.
const dom = new JSDOM(html);
S.mount(dom.window.document);
const doc = dom.window.document, $ = id => doc.getElementById(id);
const change = (el, v) => { el.value = v; el.dispatchEvent(new dom.window.Event('change')); };
assert.equal($('linear-hypothesis').value, 'yx', 'The attractive hypothesis is offered first');
assert.equal($('linear-record').children.length, 0);
assert.equal($('linear-heldout').hidden, true, 'Held-out records stay hidden until a hypothesis is checked');
$('linear-reveal').click();
assert.match($('linear-result').textContent, /conflicts/);
change($('linear-hypothesis'), 'xy');
$('linear-reveal').click();
assert.match($('linear-result').textContent, /matches/);
assert.match($('linear-result').textContent, /Z stays unassigned/, 'A passing test must not resolve Z');
let entries = [...$('linear-record').children].map(li => li.textContent);
assert.equal(entries.length, 2);
assert.match(entries[0], /commonest[\s\S]*contradicted/, 'The failed attractive hypothesis must remain in the record after revision');
assert.match(entries[1], /consistent/);
$('linear-reveal').click();
assert.equal($('linear-record').children.length, 2, 'Checking the same hypothesis twice adds no duplicate entry');
$('linear-reset').click();
assert.equal($('linear-heldout').hidden, true);
assert.equal($('linear-record').children.length, 2, 'Reset clears the prediction, not the record');
dom.window.close();

// 4. Prose: script not cipher, independent test, open readings, no confidence score.
const text = section.textContent.replace(/\s+/g, ' ');
assert.match(text, /Linear B is a script, not a cipher/, 'An unknown script must be distinguished from deliberate encryption');
assert.match(text, /Ta 641/);
assert.match(text, /did not help form the values; it tested them/, 'The testing tablet must be kept apart from the evidence that built the values');
assert.match(text, /pa-te can be patēr/, 'At least one reading that stays ambiguous must be shown');
assert.match(text, /triplets/);
assert.match(text, /pairs pa-te with ma-te/, 'Show context settling one ambiguous reading, beside readings that stay open');
assert.match(text, /beyond mathematical analysis/, "Chadwick's own limit on the odds argument must stay beside it");
assert.match(text, /John Chadwick, The Decipherment of Linear B \(Cambridge University Press, 1958\)/, 'Cite Chadwick by title, publisher and year');
assert.doesNotMatch(text, /\bpp?\. \d|\bch\. [IVX\d]|printed pages|Vintage paperback/, "By the owner's preference, books are cited by title, not by chapter or page");
assert.doesNotMatch(text, /\d+(?:\.\d+)?\s*%|\b1 in [\d,]+|odds of [\d,]+|probability of \d/i, 'No numerical confidence score for the decipherment');
assert.doesNotMatch(section.innerHTML, /[\u{10000}-\u{100FF}]/u, 'The exercise uses invented labels, not Linear B signs');
const links = [...section.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
assert.ok(links.includes('https://sites.utexas.edu/scripts/files/2023/10/2023-TGP-The-Pylos-Ta-Series-and-the-Process-of-Inventorying-Ritual-Objects-for-a-Funerary-Banquet.pdf'), 'Ta 641 discovery must cite Palaima');
assert.match(text, /Documents in Mycenaean Greek/);
assert.ok(!links.some(h => /archive\.org|drive\.google|docs\.google/.test(h)), 'Cite publishers and public scholarly pages, not uploaded copies');

console.log('Linear B case: attractive frequency hypothesis fails, counts match, record survives revision and reset, Z stays open, script-not-cipher and source guards passed.');
