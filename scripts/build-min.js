#!/usr/bin/env node
/**
 * THE CIPHER MUSEUM — JS minifier
 * Minifies the heavyweight scripts that ship on exhibit pages. Sources stay
 * authoritative; pages reference the .min.js outputs. Run after editing any
 * source below:   npm run build:js
 *
 * tests/test-min-fresh.js fails the suite if a .min.js is stale, so a source
 * edit can't silently ship outdated minified code.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const ROOT = path.join(__dirname, '..');

// Source → minified output. Keep in sync with tests/test-min-fresh.js.
const TARGETS = [
  'js/ciphers/all-engines.js',
  'js/demo-loader.js',
  'js/artifact-cards-data.js',
];

const OPTIONS = { compress: true, mangle: true };

(async () => {
  for (const rel of TARGETS) {
    const src = path.join(ROOT, rel);
    const out = src.replace(/\.js$/, '.min.js');
    const code = fs.readFileSync(src, 'utf8');
    const result = await minify(code, OPTIONS);
    if (result.error) {
      console.error(`❌ ${rel}: ${result.error}`);
      process.exit(1);
    }
    fs.writeFileSync(out, result.code, 'utf8');
    const pct = Math.round((1 - result.code.length / code.length) * 100);
    console.log(`✅ ${rel} → ${path.basename(out)}  (${(code.length / 1024).toFixed(0)} KB → ${(result.code.length / 1024).toFixed(0)} KB, −${pct}%)`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
