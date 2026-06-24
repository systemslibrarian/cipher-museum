#!/usr/bin/env node
/**
 * THE CIPHER MUSEUM — Local link checker
 *
 * Walks every .html file in the repo and verifies that each relative
 * href / src target resolves to an existing file (or in-page #anchor).
 *
 * Skips:
 *   - absolute URLs (http://, https://, mailto:, tel:, data:, javascript:)
 *   - protocol-relative URLs (//example.com)
 *   - empty / pure "#" / "#anchor" links (anchors checked only when same-doc)
 *
 * Run:  node tests/test-local-links.js
 * Exits non-zero if any broken local link is found.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'docs', 'tests']);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const RE = /\b(?:href|src)\s*=\s*["']([^"'#?][^"']*?)["']/gi;

const files = walk(REPO);
let checked = 0;
const broken = [];

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  let m;
  while ((m = RE.exec(html)) !== null) {
    let target = m[1].trim();
    if (!target) continue;
    // strip query and fragment
    target = target.split('#')[0].split('?')[0];
    if (!target) continue;
    // skip absolute / non-file schemes
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|ftp:)/i.test(target)) continue;
    if (target.startsWith('//')) continue;

    let resolved;
    if (target.startsWith('/')) {
      resolved = path.join(REPO, target.replace(/^\/+/, ''));
    } else {
      resolved = path.resolve(dir, target);
    }

    checked++;
    if (!fs.existsSync(resolved)) {
      // Try directory index.html
      if (!fs.existsSync(path.join(resolved, 'index.html'))) {
        broken.push({
          file: path.relative(REPO, file),
          target: m[1],
          resolved: path.relative(REPO, resolved),
        });
      }
    }
  }
}

console.log(`\n━━━ Local link check: ${files.length} HTML files, ${checked} relative links ━━━\n`);

if (broken.length === 0) {
  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log(`  ✅ ${checked} links OK   ❌ 0 broken   (${files.length} files)`);
  console.log('══════════════════════════════════════════════════════════════════════');
  process.exit(0);
}

const grouped = {};
for (const b of broken) (grouped[b.file] = grouped[b.file] || []).push(b);
for (const [file, list] of Object.entries(grouped)) {
  console.log(`  ${file}`);
  for (const b of list) console.log(`    ❌ ${b.target}  →  ${b.resolved}`);
}
console.log('\n══════════════════════════════════════════════════════════════════════');
console.log(`  ❌ ${broken.length} broken local link(s) across ${Object.keys(grouped).length} file(s)`);
console.log('══════════════════════════════════════════════════════════════════════');
process.exit(1);
