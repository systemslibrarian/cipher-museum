#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const suites = [
  'tests/test-reader-companion.js',
  'tests/test-ebook-extensions.js',
  'tests/test-ebook-symmetric.js',
  'tests/test-information-examples.js',
  'tests/test-engineering-examples.js',
  'tests/test-classical-teaching.js',
  'tests/test-corpus-v06.js',
  'tests/test-corpus-semantics.js',
  'tests/test-corpus-v07.js',
  'tests/test-corpus-v08.js',
  'tests/test-corpus-supplements.js',
  'tests/test-corpus-supplement-replay.js',
  'tests/test-corpus-eval-v08.js',
  'tests/test-corpus-browser-v08.js',
  'tests/test-book-source-links.js',
  'tests/test-release-identifiers.js',
  'tests/test-search.js',
  'tests/test-interaction-audit.js',
  'tests/test-navigation-audit.js',
  'tests/test-final-audit.js',
  'tests/test-interaction-sweep.js',
  'tests/test-community.js',
  'tests/test-animation-cancellation.js',
  'tests/test-benchmark-runner.js',
  'tests/test-runner-receipt.js',
  'tests/test-all-engines.js',
  'tests/engines/run.js',
  'tests/test-deep-ciphers.js',
  'tests/test-comprehensive.js',
  'tests/test-accessibility.js',
  'tests/test-mobile.js',
  'tests/test-demo-pages.js',
  'tests/test-playground.js',
  'tests/test-structural.js',
  'tests/test-local-links.js',
  'tests/test-nav-reciprocity.js',
  'tests/test-nav-active.js',
  'tests/test-counts.js',
  'tests/test-codebreaking-machines.js',
  'tests/test-editorial-claims.js',
  'tests/test-classical-review.js',
  'tests/test-history-modern-review.js',
  'tests/test-page-audit-claims.js',
  'tests/test-detective-review.js',
  'tests/test-research-workbench.js',
  'tests/test-research-evaluation.js',
  'tests/test-research-workbench-v2.js',
  'tests/test-research-evaluation-v2.js',
  'tests/test-multiple-anagramming.js',
  'tests/test-pad-experiments.js',
  'tests/test-reading-trails.js',
  'tests/test-trust-labels.js',
  'tests/test-artifact-loading.js',
  'tests/test-exhibit-examples.js',
  'tests/test-min-fresh.js',
  'tests/test-sw-version.js',
  'tests/test-sw-offline-fallback.js',
  'tests/test-protocol-math.js',
  'tests/test-protocol-pages.js',
  'tests/test-historical-exhibits.js',
  'tests/test-manual-cipher-exhibits.js',
  'hall-of-foundations/lattice-math.test.js',
  'hall-of-foundations/lwe-math.test.js',
  'hall-of-foundations/crypto-algebra.test.js',
  'hall-of-foundations/ec-math.test.js',
  'hall-of-foundations/foundations-properties.test.js',
  'hall-of-foundations/exhibit-examples.test.js',
  'hall-of-foundations/exhibit-interaction.test.js',
  'hall-of-foundations/foundations-claims.test.js',
  'hall-of-foundations/foundations-links.test.js'
];

const failures = [];

for (const suite of suites) {
  console.log(`\n=== Running ${suite} ===`);
  const result = spawnSync(process.execPath, [suite], {
    cwd: ROOT,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    failures.push(suite);
  }
}

if (failures.length) {
  console.error('\nFailed suites: ' + failures.join(', '));
  process.exit(1);
}
console.log('\nAll test suites passed.');
