#!/usr/bin/env node
/**
 * THE CIPHER MUSEUM — Structural Quality Audit
 *
 * Catches classes of bug the JSDOM suites can't easily express:
 *   • Duplicate `id` attributes within a page (a11y + JS breakage)
 *   • Internal links to .html pages that don't exist on disk
 *   • Heading-hierarchy skips (h1→h3, h2→h4, etc.)
 *   • More than one <main> landmark per page
 *   • <a target="_blank"> without rel="noopener"
 *   • CSS missing :focus-visible or prefers-reduced-motion rules
 *
 * Run:  node tests/test-structural.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) pass++;
  else { fail++; const m = `❌  ${name}` + (detail ? `  →  ${detail}` : ''); failures.push(m); console.log('  ' + m); }
}

function listHtml(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (['node_modules', '.git', 'images', 'scripts'].includes(f.name)) continue;
      listHtml(p, out);
    } else if (f.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function strip(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
}

const files = listHtml(REPO).sort();
const pageSet = new Set(files.map(f => path.relative(REPO, f).replace(/\\/g, '/')));

console.log(`\n━━━ Structural audit: ${files.length} HTML pages ━━━\n`);

for (const file of files) {
  const rel = path.relative(REPO, file).replace(/\\/g, '/');
  const raw = fs.readFileSync(file, 'utf8');
  const html = strip(raw);

  // 1. Duplicate IDs
  const idCounts = new Map();
  for (const m of html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)) {
    idCounts.set(m[1], (idCounts.get(m[1]) || 0) + 1);
  }
  const dupes = [...idCounts.entries()].filter(([, n]) => n > 1).map(([id, n]) => `${id}×${n}`);
  ok(`${rel}: no duplicate id attributes`, dupes.length === 0, dupes.join(', '));

  // 2. Heading hierarchy: no level skipped (forward jump > 1)
  const heads = [...html.matchAll(/<(h[1-6])\b/gi)].map(m => parseInt(m[1].slice(1), 10));
  let prev = 0, skip = null;
  for (const h of heads) {
    if (prev && h > prev + 1) { skip = `h${prev}→h${h}`; break; }
    prev = h;
  }
  ok(`${rel}: heading levels do not skip`, skip === null, skip);

  // 3. Single <main> landmark
  const mains = (html.match(/<main\b/gi) || []).length;
  ok(`${rel}: at most one <main> landmark`, mains <= 1, `found ${mains}`);

  // 4. Internal .html links resolve
  const broken = [];
  for (const m of html.matchAll(/href\s*=\s*["']([^"'#?][^"'#?]*\.html)(?:[#?][^"']*)?["']/gi)) {
    const target = m[1];
    if (/^https?:|^\/\//i.test(target)) continue;
    const resolved = path.normalize(path.join(path.dirname(rel), target)).replace(/\\/g, '/');
    if (!pageSet.has(resolved) && !pageSet.has(target)) broken.push(target);
  }
  ok(`${rel}: all internal .html links resolve`, broken.length === 0, broken[0]);

  // 5. target="_blank" must include rel="noopener"
  const unsafe = [];
  for (const m of html.matchAll(/<a\b[^>]*\btarget\s*=\s*["']_blank["'][^>]*>/gi)) {
    if (!/\brel\s*=\s*["'][^"']*noopener/i.test(m[0])) unsafe.push(m[0].slice(0, 80));
  }
  ok(`${rel}: target="_blank" links include rel="noopener"`, unsafe.length === 0, unsafe[0]);
}

// CSS-level checks
const cssPath = path.join(REPO, 'css', 'museum.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  ok('museum.css: declares :focus-visible rules', /:focus-visible/.test(css));
  ok('museum.css: respects prefers-reduced-motion', /prefers-reduced-motion/.test(css));
}

console.log('\n' + '═'.repeat(60));
console.log(`  ✅ ${pass} passed   ❌ ${fail} failed   (${files.length} files)`);
console.log('═'.repeat(60));
if (fail) {
  console.log('\nFailures:');
  failures.slice(0, 50).forEach(f => console.log('  ' + f));
  if (failures.length > 50) console.log(`  … and ${failures.length - 50} more`);
  process.exit(1);
}
