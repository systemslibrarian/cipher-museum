'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// The files whose content defines the offline cache generation. The minified
// bundles must stay in sync with scripts/build-min.js TARGETS; the shared
// stylesheet and icon sprite are hashed too, so a returning visitor's cached
// copies are purged whenever they change (new HTML + stale CSS once broke
// icon sizing for exactly one visit).
const BUNDLES = [
  'js/ciphers/all-engines.min.js',
  'js/demo-loader.min.js',
  'js/artifact-cards-data.min.js',
  'css/museum.css',
  'images/icons.svg'
];

function swVersionFor(root) {
  const hash = crypto.createHash('sha256');
  for (const rel of BUNDLES) {
    hash.update(fs.readFileSync(path.join(root, rel)));
  }
  return `cipher-museum-${hash.digest('hex').slice(0, 8)}`;
}

module.exports = { swVersionFor, BUNDLES };
