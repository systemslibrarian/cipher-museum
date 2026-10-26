#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const manifest = JSON.parse(read('data/exhibit-trust.json')).exhibits;
for (const [slug, number, target] of [['bombe',168,'Enigma'], ['colossus',169,'Lorenz']]) {
  const file = `ciphers/${slug}.html`;
  const entry = manifest.find(e => e.path === file);
  assert.deepEqual([entry.number, entry.label, entry.collection, entry.interactive], [number, null, 'cipher-history', slug === 'colossus']);
  const dom = new JSDOM(read(file));
  const d = dom.window.document;
  assert.equal(d.querySelectorAll('.trust-label').length, 0);
  assert.match(d.querySelector('.exhibit-main').textContent, new RegExp(target));
  assert(d.querySelector(`a[href="https://www.tnmoc.org/${slug}"]`), 'Primary museum source');
  for (const source of ['enigma','lorenz','bletchley-park','bill-tutte']) {
    assert(d.querySelector(`a[href="${source}.html"]`), `${slug}: reciprocal related link to ${source}`);
    const sourceDom = new JSDOM(read(`ciphers/${source}.html`));
    assert(sourceDom.window.document.querySelector(`a[href="${slug}.html"]`), `${source}: doorway to ${slug}`);
    sourceDom.window.close();
  }
  for (const [surface,href] of [['halls/machines.html',`../${file}`],['museum-map.html',file]]) {
    const surfaceDom = new JSDOM(read(surface));
    assert(surfaceDom.window.document.querySelector(`a[href="${href}"]`), `${surface}: doorway to ${slug}`);
    surfaceDom.window.close();
  }
  assert(read('sitemap.xml').includes(`https://ciphermuseum.com/${file}`));
  assert.equal(JSON.parse(read('data/artifact-cards.json')).cards[slug].family, 'Cryptanalysis machinery');
  dom.window.close();
}
assert.match(read('ciphers/bombe.html'), /candidate to check, not a finished plaintext/);
assert.match(read('ciphers/colossus.html'), /neither a stored-program computer nor a general-purpose machine/);
console.log('Codebreaking-machine identities, neutral labels, sources and reciprocal doorways passed.');
