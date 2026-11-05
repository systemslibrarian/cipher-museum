#!/usr/bin/env node
'use strict';

// The READMEs advertise the audit reading pack. The pack itself is generated
// output published by .github/workflows/audit-pack.yml, so there is no
// committed manifest to read here any more, and no frozen snapshot date to
// quote: the release is rebuilt from main whenever an exporter input changes.
//
// What still needs keeping honest is the page count. It comes from the
// committed review ledger, which is also what the exporter counts, so the
// advertised number cannot drift from the pack that gets built.
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const RELEASE = 'https://github.com/systemslibrarian/cipher-museum/releases/tag/audit-pack-latest';

function renderAuditSummaries(root = ROOT) {
  const read = file => fs.readFileSync(path.join(root, file), 'utf8');
  const coverage = JSON.parse(read('docs/page-audit/coverage.json'));
  const pageCount = Array.isArray(coverage.pages) ? coverage.pages.length : 0;
  if (!Number.isSafeInteger(pageCount) || pageCount < 1) {
    throw new Error('The review ledger must inventory at least one page.');
  }
  const patterns = [
    ['README.md', /\*\*\[Independent audit reading pack — \d+-page export\]\([^)]+\)\*\*/,
      `**[Independent audit reading pack — ${pageCount}-page export](${RELEASE})**`],
    ['docs/README.md', /\[Complete \d+-page audit export\]\([^)]+\)/,
      `[Complete ${pageCount}-page audit export](${RELEASE})`]
  ];
  return new Map(patterns.map(([file, pattern, replacement]) => {
    const before = read(file);
    if (!pattern.test(before)) throw new Error(`Missing audit-summary marker in ${file}`);
    return [file, before.replace(pattern, replacement)];
  }));
}

if (require.main === module) {
  const check = process.argv.includes('--check');
  const changed = [];
  for (const [file, expected] of renderAuditSummaries()) {
    if (fs.readFileSync(path.join(ROOT, file), 'utf8') === expected) continue;
    changed.push(file);
    if (!check) fs.writeFileSync(path.join(ROOT, file), expected);
  }
  if (check && changed.length) {
    console.error('Stale audit export summaries: ' + changed.join(', ') +
      '. Run node scripts/sync-audit-summary.js after changing the review ledger.');
    process.exitCode = 1;
  } else console.log('Audit export summaries ' + (check ? 'current' : 'synchronized') + '.');
}

module.exports = { renderAuditSummaries };
