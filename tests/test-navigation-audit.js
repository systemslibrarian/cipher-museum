#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function open(file, query = '', storage) {
  const errors = [], console = new VirtualConsole();
  console.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(read(file), { url: 'https://ciphermuseum.com/' + file + query,
    runScripts: 'outside-only', virtualConsole: console });
  dom.errors = errors;
  if (storage === 'blocked') Object.defineProperty(dom.window, 'localStorage', { get() { throw Error('Storage unavailable'); } });
  else if (storage) dom.window.localStorage.setItem('ciphermuseum.tours.mathematics.visited', storage);
  dom.window.fetch = async href => ({ ok: true, json: async () => JSON.parse(read(path.join(path.dirname(file), href))) });
  dom.start = () => [...dom.window.document.querySelectorAll('script:not([src])')].forEach(s => dom.window.eval(s.textContent));
  return dom;
}
(async () => {
  let stops = 0;
  const ids = fs.readdirSync(path.join(root, 'tours')).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
  for (const id of ids) {
    const data = JSON.parse(read('tours/' + id + '.json'));
    for (const storage of [undefined, 'blocked', '{"bad":true}']) {
      const dom = open('tours/tour.html', '?tour=' + id, storage);
      try {
        dom.start(); await tick();
        const d = dom.window.document;
        assert.equal(d.getElementById('tourTitle').textContent, data.title);
        assert.equal(d.getElementById('prevBtn').disabled, true);
        for (let i = 0; i < data.stops.length; i++) {
          const stop = data.stops[i];
          assert.equal(d.querySelector('.tour-stop-note').textContent, stop.note);
          // A stop may link to a section: the page must exist and contain that id.
          const [file, fragment] = stop.href.split('#');
          assert.ok(fs.existsSync(path.resolve(root, 'tours', file)), stop.href);
          if (fragment) assert.ok(fs.readFileSync(path.resolve(root, 'tours', file), 'utf8').includes('id="' + fragment + '"'), stop.href + ': no element with that id');
          assert.equal(d.getElementById('tourProg').textContent, `${i + 1} / ${data.stops.length}`);
          if (i < data.stops.length - 1) d.getElementById('nextBtn').click();
        }
        assert.equal(d.getElementById('nextBtn').disabled, true);
        d.getElementById('prevBtn').click();
        assert.equal(d.querySelector('.tour-stop-note').textContent, data.stops.at(-2).note);
        assert.deepEqual(dom.errors, []);
      } finally { dom.window.close(); }
    }
    stops += data.stops.length;
  }
  const index = open('tours/index.html', '', '[0,0,-1,999,"1",1]');
  try {
    index.start(); await tick();
    assert.equal(index.window.document.querySelectorAll('.tour-tile').length, ids.length);
    assert.match(index.window.document.querySelector('a[href="tour.html?tour=mathematics"] .tour-meta').textContent, /2 visited/);
    assert.deepEqual(index.errors, []);
  } finally { index.window.close(); }
  let leaves = 0;
  function walk(route) {
    const dom = open('cipher-flow.html');
    let children = 0;
    try {
      dom.start(); const d = dom.window.document;
      for (const i of route) d.querySelectorAll('.flow-opt')[i].click();
      if (d.getElementById('flowQuestion').style.display === 'none') {
        leaves++;
        assert.ok(d.querySelectorAll('.flow-card').length > 0);
        for (const a of d.querySelectorAll('.flow-card-link')) assert.ok(fs.existsSync(path.join(root, a.getAttribute('href'))));
        d.getElementById('flowReset').click();
        assert.equal(d.querySelectorAll('.flow-card').length, 0);
        assert.equal(d.getElementById('flowQText').textContent, 'What would you like to explore?');
      } else children = d.querySelectorAll('.flow-opt').length;
      assert.deepEqual(dom.errors, []);
    } finally { dom.window.close(); }
    for (let i = 0; i < children; i++) walk([...route, i]);
  }
  walk([]);
  assert.equal(leaves, 12);
  console.log(`PASS ${ids.length} tours / ${stops} stops, blocked and malformed storage, index progress, ${leaves} flow routes and resets.`);
})().catch(e => { console.error(e); process.exitCode = 1; });
