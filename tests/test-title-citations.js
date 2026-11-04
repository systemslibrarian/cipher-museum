#!/usr/bin/env node
'use strict';

// The owner's preference: the books behind the traffic-analysis exercise, the
// Egyptian, Linear B and Maya cases, the Purple worksheet and the "working is
// not secure" route are cited by title, author, publisher and year only, never
// by chapter, section or page. This covers every surface of that work: pages,
// scripts, tours, records and README entries. Research papers and earlier
// exhibits keep their own citation style and are out of scope, so the Copiale,
// Mary Stuart and Z340 cases on the same page are not scanned.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const LOCATOR = /\bpp?\. ?\d|\bpages? \d|\bch(?:apter)?s?\.? ?(?:\d|[IVX]+\b|[“"])|§|\bAppendix [A-Z]\b|\bprinted pages?\b|\bPDF pages?\b|\bfolios?\b/i;

function htmlText(html, ids) {
  const doc = new JSDOM(html).window.document;
  const parts = ids ? ids.map(id => {
    const el = doc.getElementById(id);
    assert.ok(el, 'Missing section #' + id);
    return el.textContent;
  }) : [doc.body.textContent];
  return parts.join(' ').replace(/\s+/g, ' ');
}

const README_LINKS = /lab\/traffic-analysis\.html|decipherment-cases\.html#(?:egyptian|linear-b|maya)|lab\/purple-diagnosis\.html|lab\/working-is-not-secure\.html|tour=writing-systems|further-reading\.html#case-study-trails/;

const surfaces = {
  'lab/traffic-analysis.html': html => htmlText(html),
  'lab/decipherment-cases.html': html => htmlText(html, ['egyptian', 'linear-b', 'maya']),
  'lab/purple-diagnosis.html': html => htmlText(html),
  'lab/working-is-not-secure.html': html => htmlText(html),
  'js/traffic-analysis.js': s => s,
  'js/egyptian-case.js': s => s,
  'js/maya-case.js': s => s,
  'js/purple-diagnosis.js': s => s,
  'js/working-not-secure.js': s => s,
  'tours/writing-systems.json': s => s,
  'tours/working-not-secure.json': s => s,
  'docs/TRAFFIC_ANALYSIS_EXERCISE.md': s => s,
  'docs/LINEAR_B_CASE.md': s => s,
  'docs/LINEAR_B_SPECIALIST_REVIEW.md': s => s,
  'docs/EGYPTIAN_CASE.md': s => s,
  'docs/MAYA_CASE.md': s => s,
  'docs/PURPLE_DIAGNOSIS.md': s => s,
  'docs/WORKING_NOT_SECURE.md': s => s,
  'README.md': s => s.split('\n').filter(line => README_LINKS.test(line)).join('\n')
};

function check(file, source) {
  const text = surfaces[file](source);
  const m = LOCATOR.exec(text);
  assert.ok(!m, file + ' cites a book by chapter, section or page: “…' + (m ? text.slice(Math.max(0, m.index - 60), m.index + 30) : '') + '…”. Cite the title only.');
}

for (const file of Object.keys(surfaces)) check(file, read(file));

// The README filter must still find this work's entries.
assert.ok(surfaces['README.md'](read('README.md')).split('\n').length >= 6, 'README entries for this work were not found.');

// Mutation checks: a locator put back on each kind of surface is caught, and
// the out-of-scope paper citations on the same page are left alone.
const decipherment = read('lab/decipherment-cases.html');
assert.throws(() => check('lab/decipherment-cases.html', decipherment.replace('(Parkinson)', '(Parkinson p. 31)')), /cites a book by chapter/);
assert.throws(() => check('lab/decipherment-cases.html', decipherment.replace('(Coe)', '(Coe ch. 6)')), /cites a book by chapter/);
assert.doesNotThrow(() => check('lab/decipherment-cases.html', decipherment.replace('</body>', '<p>PDF pp. 2–7</p></body>')));
assert.throws(() => check('lab/purple-diagnosis.html', read('lab/purple-diagnosis.html').replace('(Wiley, 2007)', '(Wiley, 2007), §2.3.3')), /cites a book by chapter/);
assert.throws(() => check('lab/working-is-not-secure.html', read('lab/working-is-not-secure.html').replace('(Oxford University Press, 2002)', '(Oxford University Press, 2002), chapter 6')), /cites a book by chapter/);
assert.throws(() => check('lab/traffic-analysis.html', read('lab/traffic-analysis.html').replace('(NSA history)', '(NSA history, p. 7)')), /cites a book by chapter/);
assert.throws(() => check('docs/EGYPTIAN_CASE.md', read('docs/EGYPTIAN_CASE.md') + '\nParkinson, printed pages 57–59.\n'), /cites a book by chapter/);
assert.throws(() => check('js/maya-case.js', read('js/maya-case.js') + '\n// as Coe reports in ch. 10\n'), /cites a book by chapter/);

console.log('Title citations: ' + Object.keys(surfaces).length + ' surfaces cite books by title only; eight mutation checks passed.');
