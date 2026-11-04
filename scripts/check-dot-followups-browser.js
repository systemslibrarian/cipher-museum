#!/usr/bin/env node
'use strict';

// Real-browser acceptance checks for the 4 November research additions.
// CI installs the pinned browser dependencies and retains this report/screenshots.
// This is a bounded Chromium check, not a cross-engine or historical certification.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'tmp/dot-browser');
fs.mkdirSync(OUT, { recursive: true });
const results = [];
let base;
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };

const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  const file = path.resolve(ROOT, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
  if (!file.startsWith(ROOT + path.sep) || pathname.split('/').some(p => p.startsWith('.'))) {
    res.writeHead(403).end(); return;
  }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
});

function record(viewport, name, ok, detail = '') {
  results.push({ viewport, name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${viewport} ${name}${detail ? ': ' + detail : ''}`);
}
async function check(viewport, name, fn) {
  try { await fn(); record(viewport, name, true); }
  catch (err) { record(viewport, name, false, err.message); }
}
async function contains(page, selector, pattern) {
  assert.match(await page.locator(selector).innerText(), pattern);
}
async function press(page, selector) {
  await page.locator(selector).focus();
  await page.keyboard.press('Enter');
}
async function snapshot(page, viewport, selector, name) {
  await page.locator(selector).screenshot({ path: path.join(OUT, `${viewport}-${name}.png`) });
}
async function common(page, viewport, name, scope, errors) {
  await check(viewport, `${name}: no script errors or document overflow`, async () => {
    assert.deepEqual(errors, []);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'horizontal document overflow');
  });
  await accessibility(page, viewport, name, scope);
}
async function accessibility(page, viewport, name, scope) {
  await check(viewport, `${name}: automated accessibility scan`, async () => {
    const result = await new AxeBuilder({ page }).include(scope)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    fs.writeFileSync(path.join(OUT, `${viewport}-${name}-axe.json`), JSON.stringify(result, null, 2));
    assert.deepEqual(result.violations.map(v => ({ id: v.id, impact: v.impact,
      nodes: v.nodes.map(n => n.target) })), []);
  });
}

async function alignment(page, viewport) {
  await press(page, '#alignment-example');
  assert.equal(await page.locator('#alignment-list .alignment-link').count(), 2);
  await contains(page, '#alignment-list', /1 source passage\s*↔\s*2 reading passages/);
  await contains(page, '#alignment-list', /2 source passages\s*↔\s*1 reading passage/);
  await contains(page, '#alignment-source-unmatched', /torn seal/);
  await contains(page, '#alignment-target-unmatched', /place uncertain/);
  const source = await page.inputValue('#alignment-source-text');
  const target = await page.inputValue('#alignment-target-text');
  await page.fill('#alignment-source-ranges', '46–64');
  await page.fill('#alignment-target-ranges', '50–74');
  await page.fill('#alignment-note', 'Trial association; needs evidence');
  await press(page, '#alignment-add');
  assert.equal(await page.locator('#alignment-list .alignment-link').count(), 3);
  await page.locator('#reading-alignment details').filter({ hasText: 'Correct a recorded link' }).locator('summary').click();
  await page.selectOption('#alignment-withdraw-id', 'alignment-3');
  await page.fill('#alignment-withdraw-reason', 'The two additions have no supporting correspondence.');
  await press(page, '#alignment-withdraw');
  assert.equal(await page.locator('#alignment-list .alignment-link').count(), 2);
  await page.locator('#reading-alignment details').filter({ has: page.locator('#alignment-history') }).locator('summary').click();
  await contains(page, '#alignment-history', /alignment-3/);
  const downloadPending = page.waitForEvent('download');
  await press(page, '#export-record');
  const download = await downloadPending;
  const saved = path.join(OUT, `${viewport}-alignment.json`);
  await download.saveAs(saved);
  // Replace the current state first: the assertions must observe a completed
  // import, not the same two cards left over before asynchronous file reading.
  const sentinel = await page.evaluate(() => window.MuseumResearch.create('IMPORT CONTROL'));
  await page.setInputFiles('#import-file', { name: 'import-control.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(sentinel)) });
  await page.waitForFunction(() => document.getElementById('source-raw').value === 'IMPORT CONTROL'
    && document.getElementById('import-file').value === '');
  assert.equal(await page.locator('#alignment-list .alignment-link').count(), 0);
  await page.setInputFiles('#import-file', saved);
  await page.waitForFunction(() => document.querySelectorAll('#alignment-list .alignment-link').length === 2
    && document.getElementById('import-file').value === '');
  assert.equal(await page.inputValue('#alignment-source-text'), source);
  assert.equal(await page.inputValue('#alignment-target-text'), target);
  await contains(page, '#alignment-history', /The two additions have no supporting correspondence/);
  await accessibility(page, viewport, 'alignment-populated', '#reading-alignment');
  await snapshot(page, viewport, '#reading-alignment', 'alignment');

  // A textarea displays CRLF as LF. Selections must still index the original
  // code points, and importing/exporting must not silently rewrite the source.
  const crlf = await page.evaluate(() => window.MuseumResearch.addLayer(
    window.MuseumResearch.create('A\r\nB😀C'), 'normalized', 'revision-1',
    'X\r\nY', 'Original CRLF selection control'));
  await page.setInputFiles('#import-file', { name: 'crlf-control.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(crlf)) });
  await page.waitForFunction(() => document.getElementById('alignment-source-text').value === 'A\nB😀C');
  await page.locator('#alignment-source-text').evaluate(el => el.setSelectionRange(2, 5));
  await press(page, '#alignment-source-select');
  assert.equal(await page.inputValue('#alignment-source-ranges'), '4–5');
  await page.locator('#alignment-target-text').evaluate(el => el.setSelectionRange(2, 3));
  await press(page, '#alignment-target-select');
  assert.equal(await page.inputValue('#alignment-target-ranges'), '4–4');
  await page.fill('#alignment-note', 'Original CRLF and Unicode selection check');
  await press(page, '#alignment-add');
  assert.equal(await page.locator('#alignment-list .alignment-link').count(), 1);
  const crlfPending = page.waitForEvent('download');
  await press(page, '#export-record');
  const crlfDownload = await crlfPending;
  const crlfSaved = path.join(OUT, `${viewport}-crlf.json`);
  await crlfDownload.saveAs(crlfSaved);
  const roundTrip = JSON.parse(fs.readFileSync(crlfSaved, 'utf8'));
  assert.equal(roundTrip.raw, 'A\r\nB😀C');
  assert.equal(roundTrip.layers[0].text, 'X\r\nY');
  assert.equal(roundTrip.alignments[0].sourceRanges[0].literal, 'B😀');
  assert.equal(roundTrip.alignments[0].sourceRanges[0].start, 3);
  assert.equal(roundTrip.alignments[0].sourceRanges[0].end, 5);

  await page.fill('#alignment-source-ranges', '1');
  await page.fill('#alignment-target-ranges', '1');
  await page.fill('#alignment-note', 'Draft from the previous document');
  const replacement = await page.evaluate(() => window.MuseumResearch.addLayer(
    window.MuseumResearch.create('ZZZ'), 'normalized', 'revision-1', 'YYY', 'Independent replacement control'));
  await page.setInputFiles('#import-file', { name: 'replacement.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(replacement)) });
  await page.waitForFunction(() => document.getElementById('alignment-source-text').value === 'ZZZ');
  assert.equal(await page.inputValue('#alignment-source-ranges'), '');
  assert.equal(await page.inputValue('#alignment-target-ranges'), '');
  assert.equal(await page.inputValue('#alignment-note'), '');
  await page.fill('#source-shelfmark', 'Unsaved archive-field control');
  await page.fill('#alignment-source-ranges', '1');
  await page.fill('#alignment-target-ranges', '1');
  await page.fill('#alignment-note', 'A new proposed comparison');
  await press(page, '#alignment-add');
  await contains(page, '#alignment-status', /Save.*metadata/i);
  assert.equal(await page.inputValue('#source-shelfmark'), 'Unsaved archive-field control');
  assert.equal(await page.locator('#alignment-list .alignment-link').count(), 0);
}

async function structure(page, viewport) {
  await contains(page, '#structure-message', /^ASH PINE ASH$/);
  await page.selectOption('#structure-guess', 'same');
  await press(page, '#structure-check');
  await contains(page, '#structure-result', /Supported conclusion/);
  await page.selectOption('#structure-mode', 'merged');
  assert.equal(await page.inputValue('#structure-guess'), '');
  await page.locator('#structure-workings summary').click();
  await contains(page, '#structure-counts', /8 compatible source triples: 4 with matching ends; 4 with different ends/);
  await page.selectOption('#structure-guess', 'uncertain');
  await press(page, '#structure-check');
  await contains(page, '#structure-result', /Supported conclusion/);
  await page.selectOption('#structure-query', 'c');
  await page.selectOption('#structure-guess', 'different');
  await press(page, '#structure-check');
  await contains(page, '#structure-result', /Supported conclusion/);
  await page.selectOption('#structure-mode', 'fresh');
  await page.selectOption('#structure-query', 'b');
  await page.locator('#structure-workings summary').click();
  await contains(page, '#structure-counts', /64 compatible source triples: 16 with matching ends; 48 with different ends/);
  await page.selectOption('#structure-guess', 'uncertain');
  await press(page, '#structure-check');
  await contains(page, '#structure-result', /Supported conclusion/);
  await snapshot(page, viewport, '#structure-controls', 'structure');
  await press(page, '#structure-reset');
  assert.equal(await page.inputValue('#structure-mode'), 'bijective');
  assert.equal(await page.inputValue('#structure-query'), 'a');
}

async function concealment(page, viewport) {
  assert.equal(await page.locator('#invoice-readings li').count(), 2);
  await page.selectOption('#invoice-format', 'framed');
  await contains(page, '#invoice-record', /^1\|2$/);
  assert.equal(await page.locator('#invoice-readings li').count(), 1);
  await page.check('#marker-extra');
  await contains(page, '#marker-reading', /^DAWN MEET AT DAWN$/);
  await contains(page, '#music-reading', /^MEET$/);
  await contains(page, '#music-count', /= 5/);
  await page.selectOption('#music-message', 'WAIT');
  await contains(page, '#music-count', /= 4/);
  await contains(page, '#music-reading', /^WAIT$/);
  await snapshot(page, viewport, '#concealment', 'concealment');
  await press(page, '#concealment-reset');
  assert.equal(await page.inputValue('#invoice-format'), 'plain');
  assert.equal(await page.isChecked('#marker-extra'), false);
  assert.equal(await page.inputValue('#music-message'), 'MEET');
}

async function charles(page, viewport) {
  await press(page, '#charles-check-model');
  await contains(page, '#charles-model-result', /contradicted/i);
  await page.selectOption('#charles-model', 'mixed');
  await press(page, '#charles-check-model');
  await contains(page, '#charles-model-result', /compatible/i);
  await press(page, '#charles-reveal-key');
  await contains(page, '#charles-reading', /^GOTOGATE\[g5\]$/);
  await press(page, '#charles-check-copy');
  await contains(page, '#charles-copy-result', /exact agreement/i);
  await page.selectOption('#charles-null', 'letter');
  await contains(page, '#charles-reading', /^GOTOGATEE\[g5\]$/);
  await press(page, '#charles-check-copy');
  await contains(page, '#charles-copy-result', /mismatch/i);
  await accessibility(page, viewport, 'charles-v-revealed', '#charles-v');
  await snapshot(page, viewport, '#charles-v', 'charles-v');
  await press(page, '#charles-reset');
  assert.equal(await page.isEnabled('#charles-reveal-key'), false);
  assert.equal(await page.isEnabled('#charles-check-copy'), false);
  await contains(page, '#charles-record', /contradicted/i);
}

(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch();
    for (const [viewport, dimensions] of [['desktop', { width: 1280, height: 900 }], ['narrow', { width: 375, height: 812 }]]) {
      const context = await browser.newContext({ viewport: dimensions, acceptDownloads: true });
      await context.route('**/*', route => route.request().url().startsWith(base + '/') ? route.continue() : route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      for (const [name, url, scope, exercise] of [
        ['alignment', '/lab/evidence-workbench.html', '#reading-alignment', alignment],
        ['reading-evidence', '/lab/reading-the-evidence.html', '#main-content', async (p, v) => { await structure(p, v); await concealment(p, v); }],
        ['charles-v', '/lab/decipherment-cases.html', '#charles-v', charles],
        ['portuguese-1649', '/lab/intercept-to-intelligence.html', '#portuguese-1649', async (p, v) => {
          await contains(p, '#portuguese-1649', /1649/);
          assert.ok(await p.locator('#portuguese-1649 a[href*="/histocrypt/article/"]').count());
          await snapshot(p, v, '#portuguese-1649', 'portuguese-1649');
        }],
        ['ika', '/ciphers/ika.html', '#main-content', async (p, v) => {
          assert.equal(await p.locator('#ika-evidence-table [data-evidence-tier]').count(), 4);
          await contains(p, '#ika-open', /What a Replay/);
          await snapshot(p, v, '#main-content', 'ika');
        }]
      ]) {
        errors.length = 0;
        await check(viewport, `${name}: interactive checks`, async () => {
          const response = await page.goto(base + url, { waitUntil: 'load' });
          assert.equal(response.status(), 200);
          await exercise(page, viewport);
        });
        await common(page, viewport, name, scope, errors);
      }
      await context.close();
    }
  } catch (err) {
    record('runner', 'browser setup', false, err.stack);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
    const failed = results.filter(r => !r.ok).length;
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({
      commit: process.env.GITHUB_SHA || null, engine: 'Chromium',
      scope: 'Two viewport widths, new controls, page errors, overflow and automated WCAG A/AA checks; no cross-engine or historical certification.',
      passed: results.length - failed, failed, results
    }, null, 2) + '\n');
    console.log(`${results.length - failed} passed; ${failed} failed`);
    if (failed) process.exitCode = 1;
  }
})();
