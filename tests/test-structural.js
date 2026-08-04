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
      if (['node_modules', '.git', 'images', 'scripts', 'tests'].includes(f.name)) continue;
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

  // 5b. Anchors must never nest. The parser silently re-splits an <a> inside an
  //     <a>, so the resulting click targets and tab order are the browser's
  //     guess, not the markup's. Wrap the card in a <div> and link the heading.
  const nestedAnchors = [];
  let aDepth = 0;
  for (const m of html.matchAll(/<a\b[^>]*>|<\/a\s*>/gi)) {
    if (m[0][1] === '/') aDepth = Math.max(0, aDepth - 1);
    else {
      if (aDepth > 0) nestedAnchors.push(m[0].slice(0, 70));
      aDepth++;
    }
  }
  ok(`${rel}: no nested <a> elements`, nestedAnchors.length === 0,
    nestedAnchors.length ? `${nestedAnchors.length} nested, first: ${nestedAnchors[0]}` : '');

  // 6. Form labels and aria references must point at real ids on the same page
  const ids = new Set();
  for (const m of html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)) ids.add(m[1]);
  const badLabel = [];
  for (const m of html.matchAll(/<label\b[^>]*\bfor\s*=\s*["']([^"']+)["']/gi)) {
    if (!ids.has(m[1])) badLabel.push(m[1]);
  }
  ok(`${rel}: <label for="..."> targets exist`, badLabel.length === 0, badLabel[0]);

  const badAria = [];
  for (const attr of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns']) {
    const re = new RegExp('\\b' + attr + '\\s*=\\s*["\']([^"\']+)["\']', 'gi');
    for (const m of html.matchAll(re)) {
      for (const r of m[1].split(/\s+/).filter(Boolean)) if (!ids.has(r)) badAria.push(`${attr}="${r}"`);
    }
  }
  ok(`${rel}: aria-* id references exist`, badAria.length === 0, badAria[0]);

  // 7. No stale legacy labels / counts in user-facing copy
  const stale = [
    [/\bFinal Hall\b/, 'Final Hall'],
    [/\bBirth of Cryptography\b/, 'Birth of Cryptography'],
    [/2,500\s+[Yy]ears\s+of\s+(Encryption|Secrets|Cryptographic|cryptographic|Encryption)/, '2,500 Years of …'],
    [/2,400\s+[Yy]ears\s+of\s+Encryption/, '2,400 Years of Encryption'],
  ];
  const hits = [];
  for (const [re, label] of stale) if (re.test(html)) hits.push(label);
  ok(`${rel}: no stale legacy labels in copy`, hits.length === 0, hits.join(', '));

  // 8. <a href=""> must not be empty
  let emptyHref = false;
  for (const _ of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']\s*["']/gi)) { emptyHref = true; break; }
  ok(`${rel}: no empty href attributes`, !emptyHref);

  // 9. Inline alt text must not be a placeholder token
  const placeholderAlts = [];
  for (const m of html.matchAll(/\balt\s*=\s*["'](TODO|TBD|todo|placeholder|image|alt)["']/gi)) {
    placeholderAlts.push(m[1]);
  }
  ok(`${rel}: <img alt> not placeholder`, placeholderAlts.length === 0, placeholderAlts[0]);
}

// VENONA hall consistency checks (Round 3 remediation)
{
  const halls = ['halls/unbreakable.html', 'halls/codebreakers.html'];
  const hallsWithVenona = halls.filter(rel => {
    const html = fs.readFileSync(path.join(REPO, rel), 'utf8');
    return /href\s*=\s*["']\.\.\/ciphers\/venona\.html["']/i.test(html);
  });
  ok('VENONA appears in exactly one hall page', hallsWithVenona.length === 1,
    hallsWithVenona.join(', '));

  const venonaHtml = fs.readFileSync(path.join(REPO, 'ciphers/venona.html'), 'utf8');
  const crumb = venonaHtml.match(/<div class="breadcrumb">[\s\S]*?<a href="\.\.\/halls\/([^"]+)"/i);
  const crumbHall = crumb ? `halls/${crumb[1]}` : null;
  ok('VENONA breadcrumb links to a hall page', !!crumbHall, crumbHall || 'missing breadcrumb hall link');
  if (crumbHall && hallsWithVenona.length === 1) {
    ok('VENONA breadcrumb matches containing hall page', crumbHall === hallsWithVenona[0],
      `breadcrumb=${crumbHall} hall=${hallsWithVenona[0]}`);
  }

  const cardData = JSON.parse(fs.readFileSync(path.join(REPO, 'data/artifact-cards.json'), 'utf8'));
  const venonaCard = cardData && cardData.cards && cardData.cards.venona;
  const hallMap = {
    'halls/unbreakable.html': 'IX',
    'halls/codebreakers.html': 'X'
  };
  const expectedHall = hallsWithVenona.length === 1 ? hallMap[hallsWithVenona[0]] : null;
  ok('VENONA artifact card has hall field', !!(venonaCard && venonaCard.hall), venonaCard ? JSON.stringify(venonaCard) : 'missing card');
  if (venonaCard && expectedHall) {
    ok('VENONA artifact-card hall matches breadcrumb hall', venonaCard.hall === expectedHall,
      `card=${venonaCard.hall} expected=${expectedHall}`);
  }
}

// JS-level checks: every fetch() call site should guard against missing fetch
const jsDir = path.join(REPO, 'js');
function listJs(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) listJs(p, out);
    else if (f.name.endsWith('.js')) out.push(p);
  }
  return out;
}
if (fs.existsSync(jsDir)) {
  for (const jsFile of listJs(jsDir)) {
    const rel = path.relative(REPO, jsFile).replace(/\\/g, '/');
    const src = fs.readFileSync(jsFile, 'utf8');
    if (/\bfetch\s*\(/.test(src)) {
      ok(`${rel}: fetch() guarded by typeof check`,
        /typeof\s+fetch\s*[!=]==?\s*['"]function['"]/.test(src));
    }
  }
}

// JSON validity for shipped data files
const dataDir = path.join(REPO, 'data');
if (fs.existsSync(dataDir)) {
  function listJson(dir, out = []) {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) listJson(p, out);
      else if (f.name.endsWith('.json')) out.push(p);
    }
    return out;
  }
  for (const jf of listJson(dataDir)) {
    const rel = path.relative(REPO, jf).replace(/\\/g, '/');
    let ok2 = true;
    try { JSON.parse(fs.readFileSync(jf, 'utf8')); }
    catch (e) { ok2 = false; }
    ok(`${rel}: valid JSON`, ok2);
  }
}
const sidx = path.join(REPO, 'js', 'search-index.json');
if (fs.existsSync(sidx)) {
  let ok2 = true;
  try { JSON.parse(fs.readFileSync(sidx, 'utf8')); } catch (e) { ok2 = false; }
  ok('js/search-index.json: valid JSON', ok2);
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
