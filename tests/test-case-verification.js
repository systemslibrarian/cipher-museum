'use strict';
/* Verification status and the hieroglyph font for the three script cases.
 *
 * No specialist reviewer is available, so each case states how its readings were checked:
 * which readings two published sources agree on, which rest on one, and that no specialist
 * has reviewed them. The Egyptian exercise needs its three signs to render everywhere, so a
 * three-glyph subset of an open-licensed font ships with the site; its coverage must match the
 * signs the exercise actually draws.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const E = require('../js/egyptian-case');

const doc = new JSDOM(fs.readFileSync('lab/decipherment-cases.html', 'utf8')).window.document;
const note = id => doc.querySelector('#' + id + ' .research-note').textContent.replace(/\s+/g, ' ');

// Each case says what was checked, against what, and that no specialist reviewed it.
const STATUS = {
  'linear-b': [/Chadwick and in Documents in Mycenaean Greek/, /rest on one/, /Not reviewed by a Linear B specialist/],
  egyptian: [/Parkinson p\. 49/, /Parkinson p\. 71/, /Unicode/, /rest on Collier and Manley alone/, /Not reviewed by an Egyptologist/],
  maya: [/Harri Kettunen and Christophe Helmke, Introduction to Maya Hieroglyphs/, /rest on Coe alone/, /Not reviewed by a Maya epigrapher/]
};
for (const [id, patterns] of Object.entries(STATUS))
  for (const p of patterns) assert.match(note(id), p, '#' + id + ' verification status must say ' + p);
const mayaLinks = [...doc.querySelectorAll('#maya .research-note a[href]')].map(a => a.getAttribute('href'));
assert.ok(mayaLinks.some(h => /^https:\/\/www\.wayeb\.org\//.test(h)), 'Link the second Maya source where its publisher hosts it');

// A real inscription to look at, linked rather than reproduced.
const bm = doc.querySelector('#egyptian a[href="https://www.britishmuseum.org/collection/object/Y_EA117"]');
assert.ok(bm, 'Link the Abydos king list on the British Museum collection site');
assert.match(bm.closest('p').textContent, /EA 117/);

// The self-hosted font covers exactly the signs the exercise draws.
const css = fs.readFileSync('css/research-workbench.css', 'utf8');
const face = /@font-face\{font-family:'Cipher Museum Hieroglyphs';[^}]*src:url\(\.\.\/fonts\/([^)]+)\)[^}]*unicode-range:([^}]+)\}/.exec(css);
assert.ok(face, 'The hieroglyph subset needs an @font-face rule');
const fontFile = 'fonts/' + face[1];
assert.ok(fs.existsSync(fontFile), 'Font file missing: ' + fontFile);
assert.ok(fs.statSync(fontFile).size < 20000, 'The subset should stay small');
const ranges = face[2].split(',').map(r => parseInt(r.trim().replace(/^U\+/, ''), 16)).sort();
const drawn = E.WORD.signs.map(s => s.char.codePointAt(0)).sort();
assert.deepEqual(ranges, drawn, 'Font unicode-range must match the signs the exercise draws');
assert.match(css, /\.egypt-word\{[^}]*font-family:"Cipher Museum Hieroglyphs"/, 'The sign row must use the subset first');
assert.ok(fs.readFileSync('sw.js', 'utf8').includes("'/" + fontFile + "'"), 'The offline cache must include the font');
assert.match(fs.readFileSync('fonts/OFL-noto-sans-egyptian-hieroglyphs.txt', 'utf8'), /SIL Open Font License, Version 1\.1/);

// The case records state verification status, not a review that will not happen.
for (const f of ['docs/LINEAR_B_CASE.md', 'docs/EGYPTIAN_CASE.md', 'docs/MAYA_CASE.md']) {
  const md = fs.readFileSync(f, 'utf8');
  assert.doesNotMatch(md, /Specialist review needed/, f + ': no specialist is available; state verification status instead');
  assert.match(md, /\*\*Verification status\.\*\*/, f + ' needs a verification-status paragraph');
}

console.log('Case verification: status notes on three cases, British Museum link, three-glyph font matching the exercise, offline cache and licence, and case records passed.');
