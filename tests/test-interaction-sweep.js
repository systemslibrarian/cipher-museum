#!/usr/bin/env node
'use strict';
// Execute the shared demo controller against every exhibit that declares it.
// This is a wiring/input-state sweep, not a historical or algorithm-conformance test.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const engines = read('js/ciphers/all-engines.js'), loader = read('js/demo-loader.js');
(async () => {
  const rendered = [], bespoke = [], failures = [];
  for (const file of fs.readdirSync(path.join(root, 'ciphers')).filter(x => x.endsWith('.html'))) {
    const raw = read('ciphers/' + file);
    if (!/demo-section/.test(raw)) continue;
    const errors = [], vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message));
    const dom = new JSDOM(raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ''), { runScripts:'outside-only', url:'https://ciphermuseum.com/ciphers/' + file, virtualConsole:vc });
    try {
      const w = dom.window, d = w.document;
      w.eval(engines); w.eval(loader);
      await new Promise(resolve => w.addEventListener('load', resolve, {once:true}));
      const panel = d.querySelector('.demo-panel');
      if (!panel) { bespoke.push(file); continue; }
      const input = panel.querySelector('textarea[id^="demo-msg-"]');
      if (!input) { bespoke.push(file); continue; }
      const key = panel.querySelector('[id^="demo-key-"]');
      const run = panel.querySelector('[id^="demo-run-"]'), clear = panel.querySelector('[id^="demo-clear-"]');
      const output = panel.querySelector('.output-box[id^="demo-output-"]');
      assert.ok(input && run && clear && output, 'Controller renders required controls');
      assert.ok(output.textContent.trim(), 'Default run produces output');
      assert.ok(!output.textContent.startsWith('Error:'), 'Default run must not fail: ' + output.textContent);
      for (const button of panel.querySelectorAll('.mode-btn')) {
        button.click(); assert.equal(button.getAttribute('aria-pressed'), 'true');
        assert.equal(panel.querySelectorAll('.mode-btn[aria-pressed="true"]').length, 1);
        input.value = ''; run.click();
        input.value = '?! <>&"';
        if (key && key.type !== 'range') key.value = '?! <>&"';
        run.click(); assert.equal(output.querySelector('script,img,iframe'), null, 'Errors/output must remain text');
        clear.click(); assert.equal(input.value, ''); assert.match(output.textContent, /Result appears here/);
      }
      assert.deepEqual(errors, []);
      rendered.push(file);
    } catch (error) { failures.push(file + ': ' + error.message); }
    finally { dom.window.close(); }
  }
  console.log('Generic demo UI sweep: ' + rendered.length + ' pages; default, blank, punctuation/invalid key, mode ARIA state and clear.');
  console.log('Bespoke/non-generic pages deferred to their dedicated suites: ' + bespoke.join(', '));
  if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
})();
