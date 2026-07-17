#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const specs = fs.readdirSync(path.join(__dirname, 'specs'))
  .filter(file => file.endsWith('.spec.js'))
  .sort()
  .map(file => path.join('tests', 'engines', 'specs', file));

// Every registry engine must have exactly one spec file — a deleted or
// misnamed spec must fail the run, not silently drop coverage.
global.window = global;
require(path.join(root, 'js/ciphers/all-engines.js'));
const engineCount = Object.keys(global.CipherEngines).length;
if (specs.length !== engineCount) {
  console.error(`Spec coverage mismatch: ${specs.length} spec files for ${engineCount} registry engines.`);
  process.exit(1);
}

const commands = [
  ['Property, edge, state, and performance specs', ['--test', '--test-concurrency=4', ...specs]],
  ['Mutation canary (suite must catch a corrupted engine)', ['tests/engines/canary.js']],
  ['Legacy engine integration checks', ['tests/test-all-engines.js']],
  ['Known-answer and deep checks', ['tests/test-deep-ciphers.js']],
  ['Full Enigma reference vectors', ['tests/test-enigma.js']],
  ['Cipher Corpus replay', ['tests/engines/corpus-replay.js']]
];

for (const [label, args] of commands) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log('\nAll cipher engine verification suites passed.');