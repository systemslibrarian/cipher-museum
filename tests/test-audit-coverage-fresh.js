#!/usr/bin/env node
'use strict';
/* Page-inventory gate for the audit export.
 *
 * scripts/export-audit-document.js refuses to run when a page's recorded hash
 * no longer matches its bytes, or when a public page is missing from the
 * inventory. The pack itself is no longer committed - it is built and published
 * by .github/workflows/audit-pack.yml - so this no longer polices a stale
 * artifact. What it still does is keep the export BUILDABLE, and keep the review
 * ledger honest about which pages changed.
 *
 * It checks four things:
 *   1. every public HTML page appears in the coverage inventory;
 *   2. the inventory names no page that no longer exists;
 *   3. every recorded sha256 matches the file on disk;
 *   4. every input the exporter names by hand still exists AND is git-tracked.
 *
 * Check 4 is the one input guard worth keeping. The exporter reads its inputs
 * with `git show <commit>:<path>`, so a file that exists only in the working
 * tree is invisible to it and it aborts with "Missing tracked input". That is
 * how commit bcdeac4 broke the build: a newly registered input was not visible
 * at the commit being exported. Catching it on the pull request is cheaper than
 * catching it in the publish job after merge.
 *
 * A failure of 1-3 is not a bug in the page. It means the review ledger has not
 * been told about a content change yet, and the export would refuse to build.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const coverage = JSON.parse(fs.readFileSync(path.join(root, 'docs/page-audit/coverage.json'), 'utf8'));
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

// Mirrors the exporter's own notion of a public page.
const SKIP = /^(?:docs|tests|scripts|audit|tmp|node_modules)\//;
function publicPages(dir = root, prefix = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const rel = prefix ? prefix + '/' + entry.name : entry.name;
    if (SKIP.test(rel + '/')) continue;
    if (entry.isDirectory()) out.push(...publicPages(path.join(dir, entry.name), rel));
    else if (entry.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

let passed = 0;
const problems = [];
const check = (ok, message) => { if (ok) passed++; else problems.push(message); };

const onDisk = publicPages().sort();
const recorded = coverage.pages.map(p => p.path).sort();

for (const page of onDisk) {
  check(recorded.includes(page),
    'public page missing from the coverage inventory: ' + page);
}
for (const page of recorded) {
  check(onDisk.includes(page),
    'coverage inventory names a page that no longer exists: ' + page);
}

const stale = [];
for (const entry of coverage.pages) {
  const file = path.join(root, entry.path);
  if (!fs.existsSync(file)) continue;
  const actual = sha(file);
  if (actual === entry.sha256) { passed++; continue; }
  stale.push(entry.path);
}
check(stale.length === 0,
  'recorded hashes are stale for ' + stale.length + ' page(s):\n    ' + stale.join('\n    ') +
  '\n\n  These pages changed without the review ledger being updated, so' +
  '\n  scripts/export-audit-document.js cannot regenerate the audit pack.' +
  '\n  Fix by recording what changed and why in docs/page-audit/coverage.json' +
  '\n  (sha256, words, and a note for each page), then:' +
  '\n      node scripts/export-audit-document.js --ref HEAD' +
  '\n      node scripts/export-audit-document.js --check' +
  '\n      python3 scripts/package-audit-document.py' +
  '\n  Refreshing a hash without saying what changed defeats the point of the ledger.');

// ---------------------------------------------------------------------------
// The inputs the exporter names by hand must exist and be visible to git.
// Pages, and anything it discovers by scanning the tree, are covered above or
// cannot go stale by construction. These literal paths can: a rename or a
// delete elsewhere in the repo silently breaks the export.
const exporterSource = fs.readFileSync(path.join(root, 'scripts/export-audit-document.js'), 'utf8');
function declaredPaths(source) {
  const found = new Set();
  // read('x'), scriptFiles.add('x'), and the extras/jsonFiles array literals.
  for (const re of [/\bread\('([^']+)'\)/g, /\bscriptFiles\.add\('([^']+)'\)/g]) {
    for (const m of source.matchAll(re)) found.add(m[1]);
  }
  for (const name of ['extras', 'jsonFiles']) {
    const start = source.indexOf('const ' + name + ' = [');
    assert.notEqual(start, -1, 'exporter no longer declares ' + name + '; update this test');
    const body = source.slice(start, source.indexOf('];', start));
    for (const m of body.matchAll(/'([^']+)'/g)) found.add(m[1]);
  }
  const readme = source.match(/recoveryReadmeFile = '([^']+)'/);
  if (readme) found.add(readme[1]);
  return [...found].sort();
}
const declared = declaredPaths(exporterSource);
check(declared.length > 40,
  'only ' + declared.length + ' exporter inputs were recognised; the parsing in this test has drifted');

const trackedAtHead = new Set(
  execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD'], { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
    .trim().split('\n'));

const missing = declared.filter(p => !fs.existsSync(path.join(root, p)));
check(missing.length === 0,
  'the exporter names ' + missing.length + ' input(s) that do not exist:\n    ' + missing.join('\n    ') +
  '\n\n  scripts/export-audit-document.js will abort rather than build the pack.' +
  '\n  Either restore the file or remove it from the exporter\'s input list.');

const untracked = declared.filter(p => fs.existsSync(path.join(root, p)) && !trackedAtHead.has(p));
check(untracked.length === 0,
  'the exporter names ' + untracked.length + ' input(s) that git cannot see at HEAD:\n    ' + untracked.join('\n    ') +
  '\n\n  The exporter reads inputs with `git show`, so an uncommitted file is' +
  '\n  invisible to it: it aborts with "Missing tracked input". This is the' +
  '\n  failure commit bcdeac4 hit. Commit the file, or stop registering it.');

if (problems.length) {
  console.error('\naudit-coverage-fresh: ' + problems.length + ' problem(s)\n');
  problems.forEach(p => console.error('  ✗ ' + p));
  console.error('');
  process.exit(1);
}
console.log('audit-coverage-fresh: ' + onDisk.length + ' public pages inventoried, ' +
  coverage.pages.length + ' recorded hashes current, ' + declared.length +
  ' declared exporter inputs present and tracked; the export can build.');
