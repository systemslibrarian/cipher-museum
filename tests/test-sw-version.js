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
const os = require('os');
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
ok('offline fallback is precached and hashed', sw.includes("'/offline.html'") && hashed.has('offline.html'));

// Hashing a dependency is insufficient: a newly precached exhibit must be
// usable before its first online visit has warmed the runtime cache.
const exhibitDependencies = [
  'js/artifact-cards-data.min.js', 'js/artifact-cards.js', 'js/trust-labels.js',
  'js/nav.js', 'js/demo-loader.min.js', 'js/lightbox.js'
];
ok('shared exhibit dependencies are precached', exhibitDependencies.every(rel => core.includes(rel)),
  exhibitDependencies.filter(rel => !core.includes(rel)).join(', '));
const css = fs.readFileSync(path.join(ROOT, 'css/museum.css'), 'utf8');
const fonts = [...css.matchAll(/url\(\.\.\/(fonts\/[^)]+)\)/g)].map(m => m[1]);
ok('museum font dependencies are precached and hashed', fonts.length > 0 &&
  fonts.every(rel => core.includes(rel) && hashed.has(rel)),
  fonts.filter(rel => !core.includes(rel) || !hashed.has(rel)).join(', '));

const missing = [...hashed].filter(rel => !fs.existsSync(path.join(ROOT, rel)));
ok('every hashed file exists on disk', missing.length === 0, missing.join(', '));

console.log(`\n  ${fail ? '❌' : '✅'} Service-worker version ${fail ? 'stale or incomplete' : 'fresh'} (${hashed.size} files hashed)`);
if (fail) process.exit(1);

// A checkout's line endings cannot alter the generated version. Reproduce the
// reviewed CRLF mistake in an isolated fixture, and also prove real text and
// binary changes still invalidate the cache.
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'museum-sw-version-'));
try {
  for (const rel of ['sw.js', ...hashed]) {
    const dest = path.join(fixture, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(ROOT, rel), dest);
  }
  const original = swVersionFor(fixture);
  for (const rel of ['sw.js', ...hashed]) {
    if (!/\.(css|html|js|json|svg|webmanifest)$/i.test(rel)) continue;
    const file = path.join(fixture, rel);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/\r?\n/g, '\r\n'));
  }
  ok('CRLF checkout produces the same version as LF', swVersionFor(fixture) === original);
  fs.appendFileSync(path.join(fixture, 'sw.js'), '\n// revised cache policy\n');
  ok('worker changes invalidate the version', swVersionFor(fixture) !== original);
  fs.writeFileSync(path.join(fixture, 'sw.js'), sw);
  fs.appendFileSync(path.join(fixture, 'offline.html'), '\n<!-- updated offline notice -->\n');
  ok('offline page changes invalidate the version', swVersionFor(fixture) !== original);
  const script = path.join(fixture, 'js/ui-delegates.js');
  fs.appendFileSync(script, '\r\n// genuine changed content\r\n');
  ok('real text changes still invalidate the version', swVersionFor(fixture) !== original);
  const metadataVersion = swVersionFor(fixture);
  fs.appendFileSync(path.join(fixture, 'js/artifact-cards-data.min.js'), '\n// changed artifact metadata\n');
  ok('artifact metadata changes invalidate the version', swVersionFor(fixture) !== metadataVersion);
  const binary = path.join(fixture, 'images/icons/icon-192.png');
  fs.writeFileSync(binary, Buffer.from([13, 10]));
  const binaryVersion = swVersionFor(fixture);
  fs.writeFileSync(binary, Buffer.from([10]));
  ok('binary CRLF bytes are preserved in the hash', swVersionFor(fixture) !== binaryVersion);
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
if (fail) process.exit(1);
