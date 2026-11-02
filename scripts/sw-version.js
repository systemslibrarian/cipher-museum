'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Every generated bundle participates in freshness, whether precached via
// CORE or cached after its first fetch. Keep in sync with the minifier TARGETS.
const EXTRA = [
  'js/ciphers/all-engines.min.js',
  'js/demo-loader.min.js',
  'js/artifact-cards-data.min.js'
];

// Everything sw.js precaches and then serves cache-first, read back out of
// sw.js rather than restated here. The previous hand-maintained copy listed
// css/museum.css but not js/nav.js, js/footer.js, js/breadcrumbs.js or
// js/ui-delegates.js — all precached, none hashed — so a nav.js fix reached
// returning visitors a visit late. Deriving the list removes the drift.
//
// Ordinary HTML entries are skipped deliberately: navigations are network-first
// and hashing every exhibit would restamp VERSION on every content edit. The
// offline page is the exception: it is served from cache with no network and
// must invalidate an installed cache whenever its contents change.
function coreAssets(root) {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const block = sw.match(/const CORE = \[([\s\S]*?)\];/);
  if (!block) throw new Error('sw-version: could not locate CORE in sw.js');
  const out = [];
  // Either quote style: a half-reformatted CORE must not silently drop
  // entries out of the hash, which is worse than failing loudly.
  for (const m of block[1].matchAll(/['"]([^'"]*)['"]/g)) {
    const rel = m[1].replace(/^\//, '');
    if (!rel || (rel.endsWith('.html') && rel !== 'offline.html')) continue;
    out.push(rel);
  }
  if (!out.length) throw new Error('sw-version: parsed CORE but found no assets to hash');
  return out;
}

// The exact file list the version is computed from. Sorted so the version
// depends on content, not on the order entries happen to appear in.
function bundlesFor(root) {
  return [...new Set([...EXTRA, ...coreAssets(root)])].sort();
}

function swVersionFor(root) {
  const hash = crypto.createHash('sha256');
  // Cache-policy changes also invalidate the cache; omit only the generated stamp.
  hash.update(fs.readFileSync(path.join(root, 'sw.js'), 'utf8')
    .replace(/\r\n/g, '\n').replace(/const VERSION = '[^']*';/, 'const VERSION = AUTO;'));
  for (const rel of bundlesFor(root)) {
    hash.update(rel);                 // a rename must change the version too
    // Git commits these text assets with LF. Hash their canonical bytes even
    // when a local checkout uses CRLF; binary files must stay byte-for-byte.
    const bytes = fs.readFileSync(path.join(root, rel));
    hash.update(/\.(css|html|js|json|svg|webmanifest)$/i.test(rel)
      ? Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n')) : bytes);
  }
  return `cipher-museum-${hash.digest('hex').slice(0, 8)}`;
}

module.exports = { swVersionFor, bundlesFor, EXTRA };
