'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Not precached, but loaded by nearly every exhibit page and served
// cache-first once fetched, so a stale copy is just as damaging as a stale
// CORE asset. Keep in sync with scripts/build-min.js TARGETS.
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
// HTML entries are skipped deliberately: navigations are network-first, so a
// page is never served stale, and hashing them would restamp VERSION on every
// content edit.
function coreAssets(root) {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const block = sw.match(/const CORE = \[([\s\S]*?)\];/);
  if (!block) throw new Error('sw-version: could not locate CORE in sw.js');
  const out = [];
  // Either quote style: a half-reformatted CORE must not silently drop
  // entries out of the hash, which is worse than failing loudly.
  for (const m of block[1].matchAll(/['"]([^'"]*)['"]/g)) {
    const rel = m[1].replace(/^\//, '');
    if (!rel || rel.endsWith('.html')) continue;
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
  for (const rel of bundlesFor(root)) {
    hash.update(rel);                 // a rename must change the version too
    hash.update(fs.readFileSync(path.join(root, rel)));
  }
  return `cipher-museum-${hash.digest('hex').slice(0, 8)}`;
}

module.exports = { swVersionFor, bundlesFor, EXTRA };
