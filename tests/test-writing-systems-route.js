'use strict';
/* Writing-systems route (tours/writing-systems.json).
 *
 * The route exists to separate unknown scripts from deliberate encryption. A tour note is
 * one more surface a claim lives on, so each note's key claim is checked against the page it
 * points to, and no note may call a writing system a cipher. Registration in tour.html and
 * the tour index is covered by tests/test-navigation-audit.js, which opens every tour.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const tour = JSON.parse(read('tours/writing-systems.json'));
const norm = s => s.replace(/\s+/g, ' ').trim();
const pageText = href => {
  const doc = new JSDOM(read(path.join('tours', href))).window.document;
  return norm(doc.body.textContent + ' ' + [...doc.querySelectorAll('meta[name="description"]')].map(m => m.content).join(' '));
};

assert.equal(tour.id, 'writing-systems');
assert.match(tour.description, /script/i);
assert.match(tour.description, /encrypt|cipher/i, 'The route description must name the distinction it teaches');

// Each stop: the claim in its note must be the claim its own page makes.
const CLAIMS = {
  '../ciphers/rosetta-stone.html': [/two languages and three scripts/, /not an encryption system/],
  '../ciphers/egyptian-substitution.html': [/uncertain intent/],
  '../lab/decipherment-cases.html': [/Linear B is a script, not a cipher/i, /did not help form the values/],
  '../ciphers/phaistos-disc.html': [/remain disputed/, /not established as a cipher/],
  '../ciphers/voynich.html': [/undeciphered script/],
  '../ciphers/copiale.html': [/2011/],
  '../ciphers/amharic-ge-ez-ciphers.html': [/no historical cipher attribution/i]
};
const hrefs = tour.stops.map(s => s.href);
for (const href of Object.keys(CLAIMS)) assert.ok(hrefs.includes(href), 'Route must include ' + href);
for (const stop of tour.stops) {
  const claims = CLAIMS[stop.href];
  if (!claims) continue;
  const text = pageText(stop.href);
  for (const claim of claims) {
    assert.match(stop.note, claim, stop.label + ': note must carry its page’s claim ' + claim);
    assert.match(text, claim, stop.label + ': page no longer makes the claim the tour repeats ' + claim);
  }
}

// No note may call a writing system a cipher. Copiale is the deliberate contrast and is marked as one.
for (const stop of tour.stops) {
  if (!/cipher|encrypt/i.test(stop.note)) continue;
  assert.match(stop.note, /\bnot\b|\bno\b|contrast/i, stop.label + ': a note that mentions ciphers must say what is not one, or mark the contrast');
}
const copiale = tour.stops.find(s => s.href === '../ciphers/copiale.html');
assert.match(copiale.note, /contrast/i, 'Copiale is the real cipher on the route and must be marked as the contrast case');

// Registration in both lists; the navigation audit then opens the tour itself.
assert.match(read('tours/tour.html'), /VALID_TOURS = \[[^\]]*'writing-systems'/);
assert.match(read('tours/index.html'), /\{id:'writing-systems', file:'writing-systems\.json'\}/);

console.log('Writing-systems route: ' + tour.stops.length + ' stops, each note matches its page, no script called a cipher, Copiale marked as the contrast, registered in tour and index.');
