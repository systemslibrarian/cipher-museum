#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const suites = [
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
  'tests/test-counts.js',
  'tests/test-exhibit-examples.js',
  'tests/test-min-fresh.js',
  'tests/test-sw-version.js',
  'tests/test-protocol-math.js',
  'tests/test-protocol-pages.js',
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

for (const suite of suites) {
  console.log(`\n=== Running ${suite} ===`);
  const result = spawnSync(process.execPath, [suite], {
    cwd: ROOT,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log('\nAll test suites passed.');
