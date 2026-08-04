#!/usr/bin/env node
'use strict';

/**
 * Service-worker cache-version freshness.
 *
 * sw.js's VERSION is derived by scripts/build-min.js from the contents of
 * every asset the service worker serves cache-first. If one of those changes
 * without `npm run build:js` re-stamping sw.js, returning offline visitors
 * keep the old copy — so this fails the suite instead.
 *
 * It also checks the derivation still covers everything sw.js precaches. That
 * list used to be a hand-maintained second copy of CORE and had drifted:
 * js/nav.js was precached but unhashed, so a nav fix landed a visit late. It
 * is now parsed out of sw.js, and a parse that silently matched nothing would
 * hash only the minified bundles — hence the coverage assertions below.
 */

const fs = require('fs');
const path = require('path');
const { swVersionFor, bundlesFor, EXTRA } = require('../scripts/sw-version.js');

const ROOT = path.join(__dirname, '..');
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

let fail = 0;
function ok(name, cond, detail) {
  if (cond) console.log(`  ✅  ${name}`);
  else { fail++; console.error(`  ❌  ${name}` + (detail ? `  →  ${detail}` : '')); }
}

console.log('━━━ Service-worker cache version ━━━\n');

const declared = (sw.match(/const VERSION = '([^']*)';/) || [])[1];
const expected = swVersionFor(ROOT);
ok(`sw.js VERSION is current (${declared})`, declared === expected,
  `declared '${declared}', assets hash to '${expected}' — run: npm run build:js`);

// Every cache-first asset sw.js precaches must contribute to the version.
const hashed = new Set(bundlesFor(ROOT));
const core = [...(sw.match(/const CORE = \[([\s\S]*?)\];/) || [, ''])[1].matchAll(/['"]([^'"]*)['"]/g)]
  .map(m => m[1].replace(/^\//, ''))
  .filter(rel => rel && !rel.endsWith('.html'));

ok('CORE parsed out of sw.js', core.length > 0, 'no non-HTML entries found');
const unhashed = core.filter(rel => !hashed.has(rel));
ok('every precached cache-first asset is hashed', unhashed.length === 0, unhashed.join(', '));
ok('minified bundles are hashed', EXTRA.every(rel => hashed.has(rel)));

const missing = [...hashed].filter(rel => !fs.existsSync(path.join(ROOT, rel)));
ok('every hashed file exists on disk', missing.length === 0, missing.join(', '));

console.log(`\n  ${fail ? '❌' : '✅'} Service-worker version ${fail ? 'stale or incomplete' : 'fresh'} (${hashed.size} files hashed)`);
if (fail) process.exit(1);
