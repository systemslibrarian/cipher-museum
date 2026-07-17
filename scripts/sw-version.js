'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// The bundles whose content defines the offline cache generation. Keep in
// sync with scripts/build-min.js TARGETS.
const BUNDLES = [
  'js/ciphers/all-engines.min.js',
  'js/demo-loader.min.js',
  'js/artifact-cards-data.min.js'
];

function swVersionFor(root) {
  const hash = crypto.createHash('sha256');
  for (const rel of BUNDLES) {
    hash.update(fs.readFileSync(path.join(root, rel)));
  }
  return `cipher-museum-${hash.digest('hex').slice(0, 8)}`;
}

module.exports = { swVersionFor, BUNDLES };
