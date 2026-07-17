#!/usr/bin/env node
'use strict';

/**
 * Service-worker cache-version freshness.
 *
 * sw.js's VERSION is derived from the minified bundle contents by
 * scripts/build-min.js. If a bundle changes without `npm run build:js`
 * re-stamping sw.js, returning offline visitors would be served the old
 * engine bundle indefinitely — so this fails the suite instead.
 */

const fs = require('fs');
const path = require('path');
const { swVersionFor } = require('../scripts/sw-version.js');

const ROOT = path.join(__dirname, '..');
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const declared = (sw.match(/const VERSION = '([^']*)';/) || [])[1];
const expected = swVersionFor(ROOT);

console.log('━━━ Service-worker cache version ━━━\n');
if (declared === expected) {
  console.log(`  ✅  sw.js VERSION is current (${declared})`);
  console.log('\n  ✅ Service-worker version fresh');
} else {
  console.error(`  ❌  sw.js VERSION is '${declared}' but bundles hash to '${expected}'.`);
  console.error('      Run: npm run build:js');
  process.exit(1);
}
