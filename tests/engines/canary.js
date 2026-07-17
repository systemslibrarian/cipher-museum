#!/usr/bin/env node
'use strict';

/**
 * Mutation canary: proves the spec harness actually catches a broken engine.
 *
 * Runs one spec with CIPHER_ENGINE_CANARY set, which makes engine-spec.js wrap
 * that engine's encode to corrupt its output. The canary PASSES only if the
 * spec run FAILS — a suite that lets a corrupted engine through is itself
 * broken.
 */

const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const CANARIES = ['caesar', 'playfair'];

for (const name of CANARIES) {
  const result = spawnSync(
    process.execPath,
    ['--test', path.join('tests', 'engines', 'specs', `${name}.spec.js`)],
    { cwd: root, env: { ...process.env, CIPHER_ENGINE_CANARY: name }, stdio: 'pipe' }
  );
  if (result.status === 0) {
    console.error(`CANARY FAILURE: ${name}.spec.js passed with a deliberately corrupted ${name} engine.`);
    process.exit(1);
  }
  console.log(`canary ok: corrupted ${name} engine was caught by its spec`);
}
