#!/usr/bin/env node
'use strict';
// Does a returning visitor actually receive corrected JavaScript, in every engine?
//
// The bug this guards (fixed in a8ef1e3) was not that the new worker was wrong.
// It was that the OLD worker was still in control on the visit that mattered:
// it served every static asset cache-first, so a corrected model arrived only
// on some later visit. A test that installs the current worker first cannot see
// that, because the current worker is network-first for .js. So this harness
// installs the PRE-FIX worker, proves the staleness reproduces, and only then
// upgrades - the negative control is the point of the exercise.
//
// It then checks the offline contract still holds: a precached page loads with
// no network, and an unvisited exhibit shows the explicit offline notice rather
// than the homepage at an exhibit URL.
//
// Playwright is not a committed dependency. Run deliberately:
//   npm i --no-save playwright && npx playwright install chromium firefox webkit
//   node scripts/check-cache-upgrade.js
// Engines: --engines=chromium,firefox,webkit (default: all three available).
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

const root = path.resolve(__dirname, '..');
const PORT = Number(process.env.CACHE_CHECK_PORT || 8744);
const BASE = `http://127.0.0.1:${PORT}`;
const PRE_FIX_REF = 'a8ef1e3^';          // the commit that delivered the fix
const PROBE = '/js/__cache-probe.js';     // not a repository file; served from memory
const CORE_PAGE = '/first-codebreak.html';
const TEST_PAGE = '/__cache-test.html';   // served from memory, not a repository file
const NON_CORE_PAGE = '/ciphers/babington.html';  // exists, deliberately not precached

const swNew = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const swOld = cp.execFileSync('git', ['show', `${PRE_FIX_REF}:sw.js`],
  { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
const version = src => (src.match(/const VERSION = '([^']+)'/) || [])[1];
const OLD_VERSION = version(swOld);
const NEW_VERSION = version(swNew);
if (!OLD_VERSION || !NEW_VERSION || OLD_VERSION === NEW_VERSION) {
  console.error(`Cannot distinguish worker versions (old=${OLD_VERSION} new=${NEW_VERSION}).`);
  process.exit(1);
}
if (/pathname\.endsWith\('\.js'\)/.test(swOld)) {
  console.error(`${PRE_FIX_REF}:sw.js already special-cases .js, so it is not the pre-fix worker. ` +
    'Update PRE_FIX_REF to the commit before the network-first JS change.');
  process.exit(1);
}

// --- the site under test, with two things swappable at runtime -------------
const state = { sw: 'old', probe: 'OLD', hits: 0 };
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.gz': 'application/gzip',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain',
  '.xml': 'application/xml', '.jsonl': 'application/x-ndjson', '.mp3': 'audio/mpeg', '.wasm': 'application/wasm' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, BASE);
  state.hits++;   // lets the harness prove the browser was really offline
  const send = (body, type, store = true) => {
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': store ? 'no-store' : 'no-cache' });
    res.end(body);
  };
  // No HTTP caching anywhere: the only cache in the experiment is the worker's.
  if (url.pathname === '/sw.js') return send(state.sw === 'old' ? swOld : swNew, 'text/javascript');
  if (url.pathname === PROBE) return send(`self.__cacheProbe = '${state.probe}';\n`, 'text/javascript');
  // The script tag is the point: window.__cacheProbe records what the worker in
  // control handed to the PAGE while it loaded, which is what a visitor sees.
  if (url.pathname === TEST_PAGE) {
    return send(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">` +
      `<title>cache probe</title><script src="${PROBE}"></script></head><body>probe</body></html>`, 'text/html');
  }
  let file = path.join(root, decodeURIComponent(url.pathname));
  if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' });
    return res.end('<!DOCTYPE html><title>404</title>not found');
  }
  send(fs.readFileSync(file), TYPES[path.extname(file)] || 'application/octet-stream');
});

const results = [];
// ok === null means the engine cannot run this check. That is recorded as SKIP:
// counting it as a pass would overstate coverage, and counting it as a failure
// would blame the museum for a limitation of the automation.
const rec = (engine, name, ok, detail = '') => {
  results.push({ engine, name, ok, detail });
  const tag = ok === null ? 'SKIP' : ok ? 'PASS' : 'FAIL';
  console.log(`${tag}  ${engine.padEnd(8)} ${name}${detail ? ' — ' + detail : ''}`);
};

const controlled = page => page.waitForFunction(() => !!navigator.serviceWorker.controller, null,
  { timeout: 30000 });
const hasVersion = (page, v) => page.waitForFunction(
  async ver => (await caches.keys()).includes(ver), v, { timeout: 30000 });
const readProbe = page => page.evaluate(async probe => {
  const res = await fetch(probe);
  return (await res.text()).includes('NEW') ? 'NEW' : 'OLD';
}, PROBE);

async function run(engine, launcher) {
  const browser = await launcher.launch();
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  try {
    // ---------------------------------------------------------------------
    // A. The invariant the fix actually introduced: a corrected script is
    //    delivered on the next online visit even when NOTHING else changed -
    //    same worker, same VERSION, no new deployment of sw.js. Under the
    //    pre-fix cache-first policy the visitor keeps the stale model until
    //    some unrelated version bump evicts it.
    //
    //    An earlier draft of this harness bumped the worker version between
    //    the two visits. That made it pass with the fix reverted, because the
    //    bump purges the cache and the probe is fetched fresh regardless of
    //    policy. Holding the version constant is what makes the check real.
    // ---------------------------------------------------------------------
    state.sw = 'new'; state.probe = 'OLD';
    await page.goto(BASE + TEST_PAGE, { waitUntil: 'load' });
    await page.evaluate(() => navigator.serviceWorker.register('/sw.js'));
    await controlled(page);
    await hasVersion(page, NEW_VERSION);
    await page.reload({ waitUntil: 'load' });   // now served through the worker
    const seeded = await page.evaluate(() => window.__cacheProbe);
    rec(engine, 'current worker caches the script on a first visit', seeded === 'OLD', String(seeded));

    state.probe = 'NEW';                        // corrected model, nothing else changed
    await page.reload({ waitUntil: 'load' });
    const delivered = await page.evaluate(() => window.__cacheProbe);
    rec(engine, 'corrected script reaches the page with NO version bump', delivered === 'NEW',
      delivered === 'NEW' ? 'network-first for .js is in effect' :
        `page loaded the stale script (${delivered}); a visitor would see corrected text with the old model`);

    // ---------------------------------------------------------------------
    // B. Negative control: the same sequence under the pre-fix worker must
    //    produce the stale script, or the check above is not measuring the
    //    policy it claims to measure.
    // ---------------------------------------------------------------------
    await context.clearCookies();
    await page.evaluate(async () => {
      for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
      for (const k of await caches.keys()) await caches.delete(k);
    });
    state.sw = 'old'; state.probe = 'OLD';
    await page.goto(BASE + TEST_PAGE, { waitUntil: 'load' });
    await page.evaluate(() => navigator.serviceWorker.register('/sw.js'));
    await controlled(page);
    await hasVersion(page, OLD_VERSION);
    await page.reload({ waitUntil: 'load' });
    state.probe = 'NEW';
    await page.reload({ waitUntil: 'load' });
    const underOldWorker = await page.evaluate(() => window.__cacheProbe);
    rec(engine, 'negative control: pre-fix worker serves the STALE script', underOldWorker === 'OLD',
      underOldWorker === 'OLD' ? 'bug class reproduced in this engine' :
        `got ${underOldWorker}; the cache-first scenario did not reproduce, so A proves less than it appears`);

    // ---------------------------------------------------------------------
    // C. The upgrade path: deploying the corrected worker over the pre-fix one
    //    activates it, purges the superseded cache and claims the page.
    // ---------------------------------------------------------------------
    state.sw = 'new';
    await page.reload({ waitUntil: 'load' });
    let purged = true;
    try {
      await page.waitForFunction(async old => !(await caches.keys()).includes(old),
        OLD_VERSION, { timeout: 30000 });
    } catch (_) { purged = false; }
    rec(engine, 'upgrade purges the superseded cache on activate', purged);
    await page.reload({ waitUntil: 'load' });
    const afterUpgrade = await page.evaluate(() => window.__cacheProbe);
    rec(engine, 'returning visitor receives the corrected script after the upgrade',
      afterUpgrade === 'NEW', String(afterUpgrade));

    // D. The offline contract still holds.
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForFunction(async core => {
      const c = await caches.open(core.v); return !!(await c.match(core.p));
    }, { v: NEW_VERSION, p: CORE_PAGE }, { timeout: 30000 });
    let offlineSupported = true;
    try { await context.setOffline(true); } catch (e) { offlineSupported = false; }
    if (!offlineSupported) {
      rec(engine, 'offline simulation', false, 'engine does not support setOffline; offline unverified here');
    } else {
      const coreBefore = state.hits;
      await page.goto(BASE + CORE_PAGE, { waitUntil: 'load' });
      const title = await page.title();
      if (state.hits > coreBefore) {
        rec(engine, 'precached page loads with no network', null,
          'engine ignored setOffline for this navigation; the page was served over the network');
      } else {
        rec(engine, 'precached page loads with no network', !/unavailable offline/i.test(title), title);
      }
      // The page must exist on the server and be absent from the cache, or an
      // offline notice would prove nothing: a 404 or a typo would produce the
      // same fallback. Both are asserted before the navigation.
      const servedWhenOnline = fs.existsSync(path.join(root, NON_CORE_PAGE.slice(1)));
      const notCached = await page.evaluate(async d => {
        const c = await caches.open(d.v); return !(await c.match(d.p));
      }, { v: NEW_VERSION, p: NON_CORE_PAGE });
      rec(engine, 'offline-notice case is set up honestly', servedWhenOnline && notCached,
        `page exists on disk=${servedWhenOnline}, precached=${!notCached}`);
      const before = state.hits;
      await page.goto(BASE + NON_CORE_PAGE, { waitUntil: 'load' });
      const reachedNetwork = state.hits > before;
      const h1 = await page.evaluate(() => (document.querySelector('h1') || {}).textContent || '');
      if (reachedNetwork) {
        // The request arrived at the test server, so the browser was not
        // offline and the fallback was never asked for. Playwright's Firefox
        // does not apply setOffline to this navigation. Reporting a pass here
        // would be claiming a check that did not happen.
        rec(engine, 'unvisited exhibit shows the explicit offline notice', null,
          'engine ignored setOffline for this navigation; the request reached the server, so the fallback was not exercised');
      } else {
        rec(engine, 'unvisited exhibit shows the explicit offline notice',
          /not available offline/i.test(h1), h1.trim().slice(0, 60) || '(no h1)');
      }
      await context.setOffline(false);
    }
  } catch (error) {
    rec(engine, 'harness completed', false, error.message.split('\n')[0]);
  } finally {
    await browser.close();
  }
}

(async () => {
  let playwright;
  try { playwright = require('playwright'); }
  catch (_) {
    console.error('playwright is not installed. npm i --no-save playwright && npx playwright install chromium firefox webkit');
    process.exit(1);
  }
  const arg = (process.argv.find(a => a.startsWith('--engines=')) || '').split('=')[1];
  const wanted = arg ? arg.split(',').map(s => s.trim()).filter(Boolean) : ['chromium', 'firefox', 'webkit'];
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  const started = Date.now();
  for (const name of wanted) {
    if (!playwright[name]) { rec(name, 'engine available', false, 'unknown engine'); continue; }
    const t = Date.now();
    await run(name, playwright[name]);
    console.log(`        ${name}: ${((Date.now() - t) / 1000).toFixed(1)}s\n`);
  }
  server.close();
  const failed = results.filter(r => r.ok === false);
  const skipped = results.filter(r => r.ok === null);
  console.log(`cache-upgrade: ${results.filter(r => r.ok === true).length}/${results.length - skipped.length} ` +
    `checks passed across ${wanted.length} engine(s) in ${((Date.now() - started) / 1000).toFixed(1)}s ` +
    `(pre-fix ${OLD_VERSION} -> ${NEW_VERSION}).`);
  if (skipped.length) {
    console.log(`\n${skipped.length} check(s) not performed:`);
    skipped.forEach(s2 => console.log(`  ${s2.engine} ${s2.name} — ${s2.detail}`));
  }
  if (failed.length) {
    console.error('\nFailures:');
    failed.forEach(f => console.error(`  ${f.engine} ${f.name}${f.detail ? ' — ' + f.detail : ''}`));
    process.exit(1);
  }
})();
