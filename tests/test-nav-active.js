#!/usr/bin/env node
/**
 * THE CIPHER MUSEUM — Navigation active-state & landmark guard
 *
 * js/nav.js rebuilds the primary nav on every page and decides which item is
 * highlighted from an ALIASES table keyed by filename. That table is a second
 * copy of a fact already stated by the NAV list, so the two drift: for a while
 * cryptanalysis.html highlighted "Learn" (it has its own nav item) and
 * cipher-corpus.html highlighted nothing at all (it was missing from ALIASES).
 * Nothing else in the suite executes nav.js, so both defects shipped.
 *
 * This suite runs the real nav.js in JSDOM against real pages and checks:
 *   • every top-level page that has its own nav item highlights that item
 *   • aliased pages (glossary, modern, comparison) fold into their parent
 *   • exactly one item is ever active
 *   • the nav exposes exactly one navigation landmark, named
 *
 * Run:  node tests/test-nav-active.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const REPO = path.resolve(__dirname, '..');
const NAV_JS = fs.readFileSync(path.join(REPO, 'js', 'nav.js'), 'utf8');

let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) pass++;
  else { fail++; const m = `❌  ${name}` + (detail ? `  →  ${detail}` : ''); failures.push(m); console.log('  ' + m); }
}

/* Render a page with nav.js applied, exactly as a browser would. */
function render(rel) {
  const file = path.join(REPO, rel);
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    runScripts: 'outside-only',
    url: 'https://ciphermuseum.test/' + rel
  });
  dom.window.eval(NAV_JS);
  return dom.window.document;
}

/* The canonical nav, read back out of nav.js so this can't drift from it. */
function navLabels() {
  const block = NAV_JS.match(/var NAV = \[([\s\S]*?)\];/);
  if (!block) throw new Error('could not locate NAV in js/nav.js');
  const out = [];
  for (const m of block[1].matchAll(/\['([^']+)',\s*'([^']+)'\]/g)) out.push({ href: m[1], label: m[2] });
  return out;
}

const NAV = navLabels();
console.log(`\n━━━ Navigation active-state guard: ${NAV.length} primary items ━━━\n`);
ok('nav.js: NAV list parsed', NAV.length >= 5, `found ${NAV.length}`);

function activeLabels(doc) {
  return [...doc.querySelectorAll('.nav-links a.active')].map(a => a.textContent);
}

/* 1. A page that owns a nav item must highlight its own item, not another's. */
for (const { href, label } of NAV) {
  if (href.includes('/')) continue;               // subdirectory targets are covered by DIR_ACTIVE
  if (!fs.existsSync(path.join(REPO, href))) { ok(`${href}: page exists`, false); continue; }
  const active = activeLabels(render(href));
  ok(`${href}: highlights its own nav item ("${label}")`,
    active.length === 1 && active[0] === label,
    `active = ${JSON.stringify(active)}`);
}

/* 2. Pages without their own item fold into the right parent, and the
 *    entrance deliberately highlights nothing. */
const ALIASED = [
  ['glossary.html', 'Learn'],
  ['modern.html', 'Learn'],
  ['comparison.html', 'Learn'],
  ['museum-map.html', 'Explore'],
  ['cipher-flow.html', 'Explore'],
  ['halls/culture.html', 'Explore'],
  ['lab/workbench.html', 'Lab'],
  ['index.html', null]
];
for (const [rel, expected] of ALIASED) {
  if (!fs.existsSync(path.join(REPO, rel))) { ok(`${rel}: page exists`, false); continue; }
  const active = activeLabels(render(rel));
  ok(`${rel}: highlights ${expected ? `"${expected}"` : 'nothing'}`,
    expected === null ? active.length === 0 : (active.length === 1 && active[0] === expected),
    `active = ${JSON.stringify(active)}`);
}

/* 3. One navigation landmark, named. nav.js used to stamp role="navigation"
 *    onto the <ul> inside <nav aria-label="Primary">, nesting a landmark in
 *    a landmark and listing the site nav twice for screen-reader users. */
for (const rel of ['index.html', 'museum-map.html', 'cryptanalysis.html', 'halls/culture.html']) {
  const doc = render(rel);
  const nav = doc.querySelector('.museum-nav');
  ok(`${rel}: primary nav is labelled`, !!(nav && nav.getAttribute('aria-label')),
    nav ? 'aria-label missing' : 'no .museum-nav');
  ok(`${rel}: no navigation landmark nested inside the nav`,
    !!nav && nav.querySelectorAll('[role="navigation"]').length === 0,
    nav ? `${nav.querySelectorAll('[role="navigation"]').length} nested` : '');
  ok(`${rel}: drawer keeps id="nav-drawer" for aria-controls`,
    !!doc.querySelector('#nav-drawer'));
  const btn = doc.querySelector('.nav-hamburger');
  ok(`${rel}: hamburger controls the drawer`,
    !!btn && btn.getAttribute('aria-controls') === 'nav-drawer');
}

/* 4. The drawer must not repeat a primary link in its secondary group. */
{
  const doc = render('index.html');
  const hrefs = [...doc.querySelectorAll('#nav-drawer a')].map(a => a.getAttribute('href'));
  const dupes = hrefs.filter((h, i) => hrefs.indexOf(h) !== i);
  ok('drawer: no link appears twice', dupes.length === 0, dupes.join(', '));
}

console.log('\n' + '═'.repeat(60));
console.log(`  ✅ ${pass} passed   ❌ ${fail} failed`);
console.log('═'.repeat(60));
if (fail) {
  console.log('\nFailures:');
  failures.forEach(f => console.log('  ' + f));
  process.exit(1);
}
