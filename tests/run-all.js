#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const suites = [
  'tests/test-all-engines.js',
  'tests/test-deep-ciphers.js',
  'tests/test-comprehensive.js',
  'tests/test-accessibility.js',
  'tests/test-mobile.js',
  'tests/test-demo-pages.js'
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
