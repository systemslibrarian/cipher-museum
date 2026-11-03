'use strict';
/* The summary surfaces of lab/decipherment-cases.html must name every case the page holds.
 * A case added without updating the meta description, the hero line, the closing comparison
 * and the search index is the summary drift CLAUDE.md warns about.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

const doc = new JSDOM(fs.readFileSync('lab/decipherment-cases.html', 'utf8')).window.document;
const NAMES = { copiale: 'Copiale', mary: 'Mary Stuart', egyptian: 'Egyptian', 'linear-b': 'Linear B', maya: 'Maya', z340: 'Z340' };
const cases = [...doc.querySelectorAll('main section[id]')].map(s => s.id);
for (const id of cases) assert.ok(NAMES[id], 'New case section #' + id + ' has no summary name; add it here and to the summaries');

const meta = doc.querySelector('meta[name="description"]').content;
const hero = doc.querySelector('.hero-intro').textContent.trim();
const closing = [...doc.querySelectorAll('main section')].find(s => /What the comparison teaches/.test(s.textContent)).textContent;
const entry = JSON.parse(fs.readFileSync('js/search-index.json', 'utf8')).entries.find(e => e.u === 'lab/decipherment-cases.html');
assert.equal(hero, meta, 'Hero line and meta description must say the same thing');
assert.equal(entry.s, meta, 'Search index must carry the current description');
for (const id of cases) {
  for (const [where, text] of [['meta description', meta], ['closing comparison', closing]])
    assert.ok(text.includes(NAMES[id]), where + ' does not name the ' + NAMES[id] + ' case');
}
console.log('Decipherment summary: ' + cases.length + ' cases named in the meta description, hero line, closing comparison and search index.');
