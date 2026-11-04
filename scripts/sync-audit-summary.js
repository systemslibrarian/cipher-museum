#!/usr/bin/env node
'use strict';

// The frozen audit manifest owns the snapshot date and page count. Current-site
// totals come from build-counts.js and must not silently relabel this snapshot.
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');

function renderAuditSummaries(root = ROOT) {
  const read = file => fs.readFileSync(path.join(root, file), 'utf8');
  const manifest = JSON.parse(read('audit/manifest.json'));
  if (!Number.isSafeInteger(manifest.page_count) || manifest.page_count < 1 ||
      !Number.isFinite(Date.parse(manifest.source_commit_time))) {
    throw new Error('The audit manifest must identify its page count and source date.');
  }
  const date = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/New_York'
  }).format(new Date(manifest.source_commit_time));
  const patterns = [
    ['README.md', /\*\*\[Independent audit reading pack — \d+-page snapshot\]\(audit\/README\.md\)\*\* — the frozen \d{1,2} [A-Za-z]+ \d{4} export/,
      `**[Independent audit reading pack — ${manifest.page_count}-page snapshot](audit/README.md)** — the frozen ${date} export`],
    ['docs/README.md', /\[Complete \d+-page audit export\]\(\.\.\/audit\/README\.md\)/,
      `[Complete ${manifest.page_count}-page audit export](../audit/README.md)`]
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
    console.error('Stale audit snapshot summaries: ' + changed.join(', ') +
      '. Run node scripts/sync-audit-summary.js after regenerating the audit pack.');
    process.exitCode = 1;
  } else console.log('Audit snapshot summaries ' + (check ? 'current' : 'synchronized') + '.');
}

module.exports = { renderAuditSummaries };
