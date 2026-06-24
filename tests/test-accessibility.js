#!/usr/bin/env node
/**
 * THE CIPHER MUSEUM — Accessibility Audit (WCAG 2.1 AA / ADA)
 *
 * For every HTML page in the site, verifies:
 *   • <html lang="..."> declared
 *   • viewport meta with width=device-width
 *   • exactly one <h1>
 *   • every <img> has an alt attribute (decorative may be alt="")
 *   • every <input> (text-like), <textarea>, <select> has either:
 *       - id matching a <label for="id">
 *       - aria-label
 *       - aria-labelledby
 *       - title (last resort)
 *   • every <button> and <a> has accessible name (text content or aria-label)
 *   • a "skip to main content" / skip link exists
 *   • main landmark present (<main> or role="main")
 *
 * Run:  node tests/test-accessibility.js
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

// Strip HTML comments and <script>/<style> blocks before audit
function stripChrome(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
}

function getAttr(tag, name) {
  const re = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const m = tag.match(re);
  return m ? (m[1] ?? m[2] ?? m[3]) : null;
}
function hasAttr(tag, name) {
  return new RegExp(`\\b${name}\\b(?:\\s*=|\\s|>|/>)`, 'i').test(tag);
}

const files = listHtml(REPO).sort();
console.log(`\n━━━ Accessibility audit: ${files.length} HTML pages ━━━\n`);

for (const file of files) {
  const rel = path.relative(REPO, file);
  const raw = fs.readFileSync(file, 'utf8');
  const html = stripChrome(raw);

  // 1. <html lang>
  const htmlTag = raw.match(/<html\b[^>]*>/i);
  ok(`${rel}: <html lang="..."> declared`,
    !!htmlTag && /lang\s*=\s*["'][a-z-]+["']/i.test(htmlTag[0]),
    htmlTag ? htmlTag[0] : 'no <html> tag');

  // 2. viewport meta
  ok(`${rel}: viewport meta present`,
    /<meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*width=device-width[^"']*["']/i.test(raw),
    'missing or incorrect viewport meta');

  // 3. Exactly one <h1>
  const h1s = (html.match(/<h1\b/gi) || []).length;
  ok(`${rel}: exactly one <h1>`, h1s === 1, `found ${h1s}`);

  // 4. <title>
  ok(`${rel}: <title> present and non-empty`,
    /<title>\s*\S[^<]*<\/title>/i.test(raw), 'missing or empty title');

  // 5. <img alt>
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  let imgFails = 0; let firstImgFail = null;
  for (const t of imgs) {
    if (!hasAttr(t, 'alt')) { imgFails++; if (!firstImgFail) firstImgFail = t.slice(0, 100); }
  }
  ok(`${rel}: every <img> has alt (${imgs.length} imgs)`, imgFails === 0,
    imgFails ? `${imgFails} missing — first: ${firstImgFail}` : null);

  // 6. Form controls have accessible name
  const labelFors = new Set();
  for (const m of html.matchAll(/<label\b[^>]*\bfor\s*=\s*["']([^"']+)["'][^>]*>/gi)) labelFors.add(m[1]);
  // Also: <label>...<input>...</label> wrapping
  const wrappedInputs = new Set();
  for (const m of html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)) {
    for (const im of m[1].matchAll(/<(input|textarea|select)\b[^>]*\bid\s*=\s*["']([^"']+)["']/gi)) {
      wrappedInputs.add(im[2]);
    }
  }

  const controls = [
    ...(html.match(/<input\b[^>]*>/gi) || []),
    ...(html.match(/<textarea\b[^>]*>/gi) || []),
    ...(html.match(/<select\b[^>]*>/gi) || []),
  ];
  let ctlFails = 0; let firstCtlFail = null;
  for (const t of controls) {
    // Skip non-labelable inputs
    const type = (getAttr(t, 'type') || 'text').toLowerCase();
    if (['hidden', 'submit', 'reset', 'button', 'image'].includes(type)) continue;
    const id = getAttr(t, 'id');
    const labeled = (id && (labelFors.has(id) || wrappedInputs.has(id)))
      || hasAttr(t, 'aria-label')
      || hasAttr(t, 'aria-labelledby')
      || hasAttr(t, 'title');
    if (!labeled) { ctlFails++; if (!firstCtlFail) firstCtlFail = t.slice(0, 120); }
  }
  ok(`${rel}: every form control has an accessible name (${controls.length} controls)`,
    ctlFails === 0, ctlFails ? `${ctlFails} unlabeled — first: ${firstCtlFail}` : null);

  // 7. <button> accessible name
  const buttons = html.match(/<button\b[^>]*>([\s\S]*?)<\/button>/gi) || [];
  let btnFails = 0; let firstBtnFail = null;
  for (const b of buttons) {
    const inner = b.replace(/<button\b[^>]*>/i, '').replace(/<\/button>/i, '').replace(/<[^>]+>/g, '').trim();
    const open = b.match(/<button\b[^>]*>/i)[0];
    const named = inner.length > 0 || hasAttr(open, 'aria-label') || hasAttr(open, 'aria-labelledby') || hasAttr(open, 'title');
    if (!named) { btnFails++; if (!firstBtnFail) firstBtnFail = b.slice(0, 100); }
  }
  ok(`${rel}: every <button> has accessible name (${buttons.length} buttons)`,
    btnFails === 0, btnFails ? `${btnFails} unnamed — first: ${firstBtnFail}` : null);

  // 8. <a> accessible name (only check <a href>; anchors without href are jump targets)
  const anchors = html.match(/<a\b[^>]*\bhref\s*=[^>]*>([\s\S]*?)<\/a>/gi) || [];
  let aFails = 0; let firstAFail = null;
  for (const a of anchors) {
    const open = a.match(/<a\b[^>]*>/i)[0];
    const inner = a.replace(/<a\b[^>]*>/i, '').replace(/<\/a>/i, '').replace(/<[^>]+>/g, '').trim();
    const named = inner.length > 0 || hasAttr(open, 'aria-label') || hasAttr(open, 'aria-labelledby') || hasAttr(open, 'title');
    if (!named) { aFails++; if (!firstAFail) firstAFail = a.slice(0, 100); }
  }
  ok(`${rel}: every <a href> has accessible name (${anchors.length} links)`,
    aFails === 0, aFails ? `${aFails} unnamed — first: ${firstAFail}` : null);

  // 9. Skip link
  ok(`${rel}: skip link present`,
    /class=["']skip-link["']|href=["']#main-content["']|href=["']#main["']/i.test(raw),
    'no skip link found');

  // 10. <main> landmark
  ok(`${rel}: <main> landmark present`,
    /<main\b/i.test(html) || /role=["']main["']/i.test(html),
    'no <main> or role="main"');
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
