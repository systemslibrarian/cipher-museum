'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const origin = 'https://ciphermuseum.com';
const bundle = '/js/ciphers/all-engines.min.js';
const stale = new Response('old model');
const fresh = new Response(fs.readFileSync(path.join(root, bundle), 'utf8'));

async function exercise({ online = true, query = '', cached = true, status = 200, full = false } = {}) {
  const listeners = {}, entries = new Map(cached ? [[origin + bundle, stale]] : []);
  const requests = [];
  const key = value => new URL(typeof value === 'string' ? value : value.url, origin).href;
  const cache = {
    match: async request => entries.get(key(request))?.clone(),
    put: async (request, response) => {
      if (full) throw new Error('Quota exceeded');
      entries.set(key(request), response);
    }
  };
  vm.runInNewContext(worker, {
    self: { location: { origin }, addEventListener: (type, fn) => { listeners[type] = fn; } },
    URL, caches: { open: async () => cache },
    fetch: async (request, options) => {
      requests.push({ request, options });
      if (!online) throw new Error('Offline');
      return status === 200 ? fresh.clone() : new Response('Unavailable', { status });
    }
  });
  let response;
  listeners.fetch({ request: { method: 'GET', url: origin + bundle + query, mode: 'cors' },
    respondWith: promise => { response = promise; } });
  return { response: await response, entries, requests };
}

(async () => {
  const warm = await exercise();
  assert.equal(await warm.response.text(), await fresh.clone().text(), 'Online visit must use the corrected engine immediately');
  assert.equal(warm.requests[0].options.cache, 'no-cache', 'Revalidate the HTTP cache too');
  assert.equal(await warm.entries.get(origin + bundle).clone().text(), await fresh.clone().text());
  assert.equal(await (await exercise({ online: false })).response.text(), 'old model');
  assert.equal(await (await exercise({ online: false, query: '?v=example' })).response.text(), 'old model',
    'Offline versioned URL can use the current precached unversioned bundle');
  assert.equal(await (await exercise({ status: 503 })).response.text(), 'old model');
  assert.equal((await exercise({ status: 503, cached: false })).response.status, 503);
  assert.equal(await (await exercise({ full: true })).response.text(), await fresh.clone().text());
  await assert.rejects(exercise({ online: false, cached: false }), /Offline/);

  const exhibit = fs.readFileSync(path.join(root, 'ciphers/babington.html'), 'utf8');
  const oldCache = new Map([[origin + bundle, stale]]);
  for (const rel of ['js/ciphers/all-engines.min.js', 'js/demo-loader.min.js']) {
    const src = [...exhibit.matchAll(/<script\b[^>]*src="([^"]+)"/g)]
      .map(match => match[1]).find(value => value.startsWith('../' + rel));
    assert(src, 'Exhibit loads ' + rel);
    const url = new URL(src, origin + '/ciphers/babington.html');
    const bytes = fs.readFileSync(path.join(root, rel));
    assert.equal(url.searchParams.get('v'), crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12));
    assert(!oldCache.has(url.href), 'Old cache-first worker must fetch this distinct URL');
  }
  const context = { module: { exports: {} } };
  vm.runInNewContext(await fresh.clone().text(), context);
  const model = context.module.exports.babington;
  const encoded = model.encode('WORK V J TOWER', 'BABINGTON');
  assert(!encoded.includes('?'));
  assert.equal(model.decode(encoded, 'BABINGTON'), 'UUORKUITOWER');
  console.log('Script updates: first online visit, offline fallback, HTTP failure, cache quota, old-worker URLs, and Babington round trip passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
