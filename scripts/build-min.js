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
const crypto = require('crypto');
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

  // A returning visitor can still have the preceding cache-first worker.
  // A new URL makes that worker fetch the fixed teaching model on this visit.
  const exhibitPath = path.join(ROOT, 'ciphers/babington.html');
  let exhibit = fs.readFileSync(exhibitPath, 'utf8');
  for (const rel of ['js/ciphers/all-engines.min.js', 'js/demo-loader.min.js']) {
    const revision = crypto.createHash('sha256')
      .update(fs.readFileSync(path.join(ROOT, rel))).digest('hex').slice(0, 12);
    const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`src="\\.\\./${escaped}(?:\\?v=[a-f0-9]+)?"`);
    if (!pattern.test(exhibit)) throw new Error(`Babington bundle missing: ${rel}`);
    exhibit = exhibit.replace(pattern, `src="../${rel}?v=${revision}"`);
  }
  fs.writeFileSync(exhibitPath, exhibit, 'utf8');

  // Derive the service-worker cache version from every asset served
  // cache-first — the bundles above plus sw.js's own CORE list — so a changed
  // asset can never ship with a stale offline cache. Deterministic: same
  // inputs in, same VERSION out. tests/test-sw-version.js verifies.
  const { swVersionFor } = require('./sw-version.js');
  const swPath = path.join(ROOT, 'sw.js');
  const sw = fs.readFileSync(swPath, 'utf8');
  const version = swVersionFor(ROOT);
  const updated = sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`);
  if (updated !== sw) {
    fs.writeFileSync(swPath, updated, 'utf8');
    console.log(`✅ sw.js VERSION → ${version}`);
  } else {
    console.log(`✅ sw.js VERSION already ${version}`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
