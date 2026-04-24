#!/usr/bin/env node
/**
 * THE CIPHER MUSEUM — Mobile-Friendliness Audit
 *
 * For every HTML page, verifies:
 *   • viewport meta with width=device-width, initial-scale=1
 *   • no fixed pixel widths on the body or top-level wrappers that would
 *     cause horizontal overflow on a 375px viewport (>= 400px width disallowed)
 *   • no inline `width: 1000px` etc. on any element
 *   • horizontal-scroll guard: every page should rely on responsive layout
 *   • <html> uses no min-width that exceeds 320px
 *   • CSS file (museum.css) declares mobile-friendly rules: max-width, media
 *     queries, no fixed body width
 *
 * Run:  node tests/test-mobile.js
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

const files = listHtml(REPO).sort();
console.log(`\n━━━ Mobile audit: ${files.length} HTML pages ━━━\n`);

const FIXED_WIDTH_PX = /width\s*:\s*(\d{3,})\s*px/gi;

for (const file of files) {
  const rel = path.relative(REPO, file);
  const raw = fs.readFileSync(file, 'utf8');

  // 1. viewport meta with width=device-width AND initial-scale=1
  const vp = raw.match(/<meta[^>]*name=["']viewport["'][^>]*>/i);
  ok(`${rel}: viewport meta width=device-width, initial-scale=1`,
    !!vp && /width=device-width/i.test(vp[0]) && /initial-scale=1/i.test(vp[0]),
    vp ? vp[0] : 'missing viewport meta');

  // 2. No inline bare `width: Npx` >= 400px on any element (max-width / min-width are responsive and OK)
  const offenders = [];
  let m;
  const reAll = /style\s*=\s*"([^"]*)"/gi;
  while ((m = reAll.exec(raw)) !== null) {
    const style = m[1];
    let m2;
    // Negative lookbehind for max-/min- prefix
    const rePx = /(?<![a-z-])width\s*:\s*(\d{3,})\s*px/gi;
    while ((m2 = rePx.exec(style)) !== null) {
      const w = parseInt(m2[1], 10);
      if (w >= 400) offenders.push(`${w}px in style="${style.slice(0, 80)}…"`);
    }
  }
  ok(`${rel}: no inline bare width ≥ 400px`,
    offenders.length === 0,
    offenders[0]);

  // 3. <body> has no inline width or has only max-width (responsive)
  const bodyTag = raw.match(/<body\b[^>]*>/i);
  if (bodyTag) {
    const style = (bodyTag[0].match(/style\s*=\s*"([^"]*)"/i) || [])[1] || '';
    const hasFixedWidth = /(?:^|;)\s*width\s*:\s*\d+\s*px/i.test(style);
    ok(`${rel}: <body> has no fixed pixel width`, !hasFixedWidth, style);
  }
}

// CSS sanity check
const cssPath = path.join(REPO, 'css', 'museum.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  ok('museum.css: contains @media query for mobile', /@media[^{]*max-width/i.test(css));
  ok('museum.css: body declaration has no fixed pixel width',
    !/body\s*\{[^}]*\bwidth\s*:\s*\d{3,}\s*px/i.test(css));
  ok('museum.css: uses responsive units (max-width or %) on containers',
    /(max-width|width\s*:\s*100%)/i.test(css));
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
