#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { renderAuditSummaries } = require('../scripts/sync-audit-summary');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('data/exhibit-trust.json')).exhibits;
const readme = read('README.md');
const section = readme.split('## 📖 Complete Cipher Index')[1];
assert.ok(section, 'README has a complete cipher index');
const rows = [...section.matchAll(/^\| \[[^\]]+\]\(https:\/\/ciphermuseum\.com\/(ciphers\/[^)]+)\) \|.*$/gm)];
const paths = rows.map(row => row[1]);
const expected = manifest.filter(entry => entry.collection === 'cipher-history').map(entry => entry.path);
assert.equal(new Set(paths).size, paths.length, 'Catalogue has no duplicate exhibit rows');
assert.deepEqual([...paths].sort(), [...expected].sort(),
  'README catalogue must list every cipher/history member exactly once, including new exhibits');
const byPath = new Map(rows.map(row => [row[1], row[0]]));
for (const slug of ['typex', 'argenti', 'geheimschreiber']) {
  const file = `ciphers/${slug}.html`;
  const dom = new JSDOM(read(file));
  const description = dom.window.document.querySelector('meta[name="description"]').content;
  dom.window.close();
  assert.ok(byPath.get(file).includes(description),
    `${slug}: catalogue description must agree with the corrected exhibit description`);
}
assert.ok(byPath.get('ciphers/typex.html').includes(manifest.find(e => e.path === 'ciphers/typex.html').note),
  'Typex catalogue status preserves the general-break/capture-assisted distinction');
for (const [file, expectedText] of renderAuditSummaries(root)) {
  assert.equal(read(file), expectedText,
    `${file}: audit count and date must describe the frozen manifest, not a remembered site total`);
}
console.log(`Catalogue: all ${paths.length} cipher/history members, corrected summaries and frozen audit metadata agree.`);
