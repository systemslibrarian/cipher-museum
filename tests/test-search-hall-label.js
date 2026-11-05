#!/usr/bin/env node
'use strict';
/* Search-card hall label for halls whose name is an absolute claim.
 *
 * "Enigma Machine · Hall: The Unbreakable · Broken" is what a result card
 * read before 5 November 2026. The hall page itself qualifies its name with a
 * tagline; the card now carries that tagline instead. scripts/build-search-
 * index.js reads it from the hall page at build time, so this guard checks the
 * generated index against the live page rather than against a copied string.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const HALL = 'halls/unbreakable.html';
const hallHtml = read(HALL);
const tagline = (/<p class="page-tagline">([^<]+)<\/p>/.exec(hallHtml) || [])[1];
assert(tagline && tagline.trim().length > 20, HALL + ' must keep a .page-tagline; the search cards for its exhibits are labelled with it');
const name = /<h1 class="page-title">([^<]+)<\/h1>/.exec(hallHtml)[1].trim();

const index = JSON.parse(read('js/search-index.json'));
const members = fs.readdirSync(path.join(root, 'ciphers')).filter(f => f.endsWith('.html'))
  .map(f => 'ciphers/' + f)
  .filter(rel => /<div class="breadcrumb">[\s\S]*?<a href="\.\.\/halls\/unbreakable\.html"/.test(read(rel)));
assert(members.length >= 5, 'expected the Hall IX exhibits to be found by breadcrumb; got ' + members.length);

let checked = 0;
for (const rel of members) {
  const entry = index.entries.find(e => e.u === rel);
  assert(entry, rel + ': search entry exists');
  assert.equal(entry.h, tagline.trim(),
    `${rel}: the card's hall label must be the hall's tagline, not its name - "${name}" beside a "Broken" badge reads as a contradiction`);
  assert.notEqual(entry.h, name, `${rel}: hall name "${name}" is back on the card`);
  // tags are lower-cased by the generator's buildTags
  assert(entry.g.includes(name.toLowerCase()), `${rel}: the hall name must stay in the tags so searching "${name}" still finds the exhibit`);
  checked++;
}
console.log(`search-hall-label: ${checked} Hall IX exhibits carry the hall tagline on their cards; name retained in tags.`);
