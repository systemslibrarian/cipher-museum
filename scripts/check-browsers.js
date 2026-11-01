#!/usr/bin/env node
'use strict';
// Cross-engine verification of the research workbench and the pages changed by the
// 29 October 2026 review. Chromium is included so "differs from Chromium" is measured
// in this harness rather than inferred from an earlier run in a different one.
//
// Not part of `npm test`: it needs real browser binaries, which CI does not install.
// Run it deliberately:
//
//   npm i --no-save playwright && npx playwright install chromium firefox webkit
//   python3 -m http.server 8731      # from the repository root, in another shell
//   node scripts/check-browsers.js
//
// Playwright is intentionally NOT a committed devDependency: CI would install it on
// every run and never use it.
const { chromium, firefox, webkit, devices } = require('playwright');
const BASE = 'http://localhost:8731';
const PAGES = ['/lab/evidence-workbench.html','/lab/modern-attack-evidence.html','/lab/decipherment-cases.html',
  '/ciphers/ua-8295.html','/ciphers/homophonic.html','/ciphers/lorenz.html','/ciphers/diffie-hellman.html',
  '/hall-of-foundations/entropy.html','/hall-of-foundations/finite-fields.html',
  '/hall-of-foundations/elliptic-curves-real.html','/cipher-corpus.html'];
const VIEWPORTS = [
  { name: 'desktop-1280', opts: { viewport: { width: 1280, height: 900 } } },
  { name: 'narrow-375',   opts: { viewport: { width: 375, height: 740 } } },
  { name: 'mobile-iPhone13', opts: devices['iPhone 13'] }
];
const results = [];
const rec = (engine, viewport, name, ok, detail = '') => {
  results.push({ engine, viewport, name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${engine.padEnd(8)} ${viewport.padEnd(17)} ${name}${detail ? ' — ' + detail : ''}`);
};

async function run(engineName, launcher) {
  const browser = await launcher.launch();
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext(vp.opts);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });

    // --- the specific regression: do the historical profiles reach the solver menu? ---
    errors.length = 0;
    await page.goto(BASE + '/lab/evidence-workbench.html', { waitUntil: 'load' });
    let opts = [];
    try {
      await page.waitForFunction(() => document.getElementById('search-model').options.length > 1, { timeout: 15000 });
    } catch (_) { /* reported below */ }
    opts = await page.$$eval('#search-model option', os => os.map(o => o.value));
    rec(engineName, vp.name, 'historical profiles in solver menu',
      opts.length === 4 && opts.includes('historical-french-1580') && opts.includes('historical-italian-1320')
        && opts.includes('historical-latin-classical'), opts.join(', ') || 'none');

    // --- language comparison actually runs in this engine ---
    await page.fill('#language-text', 'Il nest rien si certain que la mort et rien si incertain que lheure dicelle cest vne chose qui se doit attendre');
    await page.click('#language-run');
    const lang = await page.textContent('#language-output');
    rec(engineName, vp.name, 'language comparison decides', /historical-french-1580/.test(lang), (lang || '').slice(0, 70));

    // --- symbol inventory and its keyboard-operable occurrence list ---
    await page.fill('#source-raw', 'g1 g2 g1 g3 g1');
    await page.fill('#revision-reason', 'cross-engine check');
    await page.click('#save-revision');
    await page.click('#inventory-build');
    const inv = await page.textContent('#inventory-status');
    const occ = await page.$$eval('#occurrence-list button', bs => bs.map(b => b.getAttribute('aria-pressed')));
    rec(engineName, vp.name, 'inventory builds and lists occurrences',
      /Built 3 classes from 5 occurrences/.test(inv) && occ.length === 3 && occ[0] === 'false', occ.join(','));

    // --- real background worker: run a bounded beam search end to end ---
    await page.click('#search-example');
    await page.selectOption('#search-algorithm', 'beam');
    await page.fill('#search-beam', '20');
    await page.click('#search-run');
    let status = '';
    try {
      await page.waitForFunction(() => !document.getElementById('search-export').disabled, { timeout: 40000 });
      status = await page.textContent('#search-status');
    } catch (_) { status = 'TIMED OUT: ' + (await page.textContent('#search-status')); }
    rec(engineName, vp.name, 'web worker completes a beam search', /beam-search/.test(status), status.slice(0, 90));

    // --- segmentation lattice ---
    await page.click('#segment-run');
    const seg = await page.textContent('#segment-output');
    rec(engineName, vp.name, 'segmentation reports exhaustive mode',
      /Every complete path was enumerated/.test(seg) && /globally best one/.test(seg));
    rec(engineName, vp.name, 'workbench free of page errors', errors.length === 0, errors.slice(0, 2).join(' | '));

    // --- every changed page: no page error, no horizontal overflow ---
    for (const path of PAGES) {
      errors.length = 0;
      await page.goto(BASE + path, { waitUntil: 'load' });
      await page.waitForTimeout(600);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const real = errors.filter(e => !/favicon\.ico/.test(e));
      rec(engineName, vp.name, 'page ' + path, overflow <= 1 && real.length === 0,
        'overflow ' + overflow + 'px' + (real.length ? '; ' + real.slice(0, 1).join('') : ''));
    }
    await context.close();
  }
  await browser.close();
}

(async () => {
  for (const [name, launcher] of [['chromium', chromium], ['firefox', firefox], ['webkit', webkit]]) {
    console.log('\n===== ' + name + ' =====');
    try { await run(name, launcher); }
    catch (e) { rec(name, '-', 'engine run', false, e.message.slice(0, 160)); }
  }
  const failed = results.filter(r => !r.ok);
  console.log('\n' + (results.length - failed.length) + ' passed, ' + failed.length + ' failed of ' + results.length);
  require('fs').writeFileSync(require('path').join(require('os').tmpdir(), 'cipher-museum-browser-check.json'), JSON.stringify(results, null, 2));
  if (failed.length) { console.log('\nFAILURES:'); failed.forEach(f => console.log('  ' + f.engine + ' ' + f.viewport + ' ' + f.name + ' — ' + f.detail)); }
})();
