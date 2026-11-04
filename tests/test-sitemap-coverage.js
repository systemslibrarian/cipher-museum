#!/usr/bin/env node
'use strict';
/* Sitemap coverage gate.
 *
 * sitemap.xml is hand-maintained, so pages added over the past weeks simply never
 * reached it: 13 indexable pages were missing, including three exhibits and seven
 * lab pages. Nothing noticed, because nothing compared the file to the site.
 *
 * This is the same failure the audit-coverage guard catches for the review ledger,
 * one inventory over. It checks that every public HTML page is either listed in
 * sitemap.xml or deliberately excluded for a recorded reason, and that the sitemap
 * lists nothing that has gone.
 *
 * Deliberate exclusions live in EXCLUDED below, each with the reason. A page that
 * declares <meta name="robots" content="noindex"> excludes itself and needs no entry
 * here - the test reads the page rather than trusting the list.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const ORIGIN = 'https://ciphermuseum.com/';

// Pages that are indexable but intentionally kept out of the sitemap.
const EXCLUDED = new Map([
  ['404.html', 'error page; should not be indexed or advertised'],
  ['offline.html', 'service-worker offline fallback, not a destination'],
  ['codebreak-answers.html', 'answer key for the worksheet; owner chose not to advertise it'],
  ['public/reports/benchmark-baselines.html', 'generated report, linked from the corpus page rather than crawled']
]);

const SKIP_DIR = new Set(['node_modules', 'docs', 'tests', 'scripts', 'audit', 'tmp']);
function publicPages(dir = root, prefix = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const rel = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isDirectory()) { if (!SKIP_DIR.has(entry.name)) out.push(...publicPages(path.join(dir, entry.name), rel)); }
    else if (entry.name.endsWith('.html')) out.push(rel);
  }
  return out;
}
const noindex = file => /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i
  .test(fs.readFileSync(path.join(root, file), 'utf8'));

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const listed = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(m => m[1].replace(ORIGIN, ''))
  .map(p => (p === '' ? 'index.html' : p)));

const pages = publicPages().sort();
const problems = [];
let counted = 0;

for (const page of pages) {
  if (listed.has(page)) { counted++; continue; }
  if (noindex(page)) { counted++; continue; }          // excludes itself, honestly
  if (EXCLUDED.has(page)) { counted++; continue; }      // excluded on purpose, with a reason
  problems.push('indexable page missing from sitemap.xml: ' + page +
    '\n      Add it to sitemap.xml, give the page a noindex meta tag, or record it in' +
    '\n      EXCLUDED in this test with the reason it stays out.');
}
for (const url of listed) {
  if (!fs.existsSync(path.join(root, url))) {
    problems.push('sitemap.xml lists a page that does not exist: ' + url);
  }
}
// An excluded page that later gains a sitemap entry means the list is lying.
for (const [page, why] of EXCLUDED) {
  if (listed.has(page)) problems.push('page is in sitemap.xml but EXCLUDED here as "' + why + '": ' + page);
}

if (problems.length) {
  console.error('\nsitemap-coverage: ' + problems.length + ' problem(s)\n');
  problems.forEach(p => console.error('  ✗ ' + p));
  console.error('');
  process.exit(1);
}
assert.ok(listed.size > 0);
console.log('sitemap-coverage: ' + pages.length + ' public pages, ' + listed.size +
  ' sitemap entries, ' + counted + ' accounted for (' + EXCLUDED.size + ' excluded by policy, ' +
  pages.filter(noindex).length + ' self-excluded with noindex).');
