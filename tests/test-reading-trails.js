#!/usr/bin/env node
'use strict';

// Check the actual book-to-exhibit routes, including fragments, rather than
// merely counting links. Keep the 2018 Sweigart chapter mapping edition-pinned.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');

function validate(html) {
  const doc = new JSDOM(html).window.document;
  const trails = doc.getElementById('reading-trails');
  assert.ok(trails, 'The reading trail section must remain discoverable.');
  const expected = {
    sweigart: ['Al Sweigart', '2018'],
    gaines: ['Helen Fouché Gaines', '1956', '1939'],
    holden: ['Joshua Holden', '2017'],
    esslinger: ['Bernhard Esslinger', '2024']
  };
  for (const [id, labels] of Object.entries(expected)) {
    const book = trails.querySelector('#' + id);
    assert.ok(book && book.tagName === 'DETAILS', id + ' must be an accessible native disclosure.');
    assert.ok(book.querySelector('summary'), id + ' needs a visible keyboard-operable summary.');
    for (const label of labels) assert.ok(book.querySelector('summary').textContent.includes(label), id + ' must identify author and edition: ' + label);
    assert.ok(book.querySelectorAll('.fr-trail-stops > li').length >= 3, id + ' needs usable chapter stops.');
  }
  assert.match(trails.textContent, /concept companions, not reproductions/);
  assert.match(trails.textContent, /not.*complete implementations of their programming chapters/);
  assert.match(trails.querySelector('#sweigart').textContent, /keyed-column variant differs/);
  assert.match(trails.querySelector('#esslinger').textContent, /does not run the book's CrypTool or SageMath exercises/);
  assert.ok(trails.querySelector('a[href="tours/index.html"]'), 'Existing thematic tours should remain reachable.');

  const stops = [...trails.querySelectorAll('#sweigart [data-chapters]')];
  const mapping = [
    ['5-6', 'ciphers/caesar.html', [5, 6]],
    ['7-12', 'ciphers/columnar.html', [7, 12]],
    ['13-15', 'ciphers/affine.html', [13, 15]],
    ['16-17', 'ciphers/monoalphabetic.html', [16, 17]],
    ['18-20', 'ciphers/vigenere.html', [18, 20]],
    ['21', 'ciphers/one-time-pad.html', [21]],
    ['22-24', 'ciphers/rsa.html', [22, 24]]
  ];
  assert.equal(stops.length, mapping.length);
  for (const [chapters, exhibit, sourceChapters] of mapping) {
    const stop = stops.find(item => item.dataset.chapters === chapters);
    assert.ok(stop, 'Missing 2018 chapter range ' + chapters);
    assert.ok(stop.querySelector('a[href="' + exhibit + '"]'), chapters + ' has the wrong exhibit.');
    for (const chapter of sourceChapters) assert.match(stop.textContent, new RegExp('Chapter ' + chapter + '(?![0-9])'), 'Missing bibliographic chapter ' + chapter);
    assert.equal(stop.querySelectorAll('a[href^="https://inventwithpython.com/cracking/"]').length, 0, 'Reference book chapters without linking to ebook copies.');
  }

  // Books behind the newer case studies. Each source's first stop names its
  // edition; every stop cites a chapter, section or printed page range and
  // links the exhibit that relies on it. Books are cited, never linked.
  const caseTrails = {
    'traffic-analysis-books': ['lab/traffic-analysis.html', ['Borrmann et al.', 'Diffie and Landau', 'Thirsk']],
    'ancient-scripts-books': ['lab/decipherment-cases.html', ['Chadwick', 'Ventris and Chadwick', 'Parkinson', 'Collier and Manley', 'Coe', 'Kettunen and Helmke']],
    'purple-books': ['lab/purple-diagnosis.html', ['Stamp and Low', 'Rowlett', 'Mundy']],
    'security-claims-books': ['lab/working-is-not-secure.html', ['Flannery', 'Bauer', 'Piper and Murphy']]
  };
  for (const [id, [exhibit, sources]] of Object.entries(caseTrails)) {
    const trail = trails.querySelector('#' + id);
    assert.ok(trail && trail.tagName === 'DETAILS', id + ' must be an accessible native disclosure.');
    assert.ok(trails.querySelector('.fr-trail-nav a[href="#' + id + '"]'), id + ' must be reachable from the trail picker.');
    const stops = [...trail.querySelectorAll('.fr-trail-stops > li')];
    assert.ok(stops.length >= 3, id + ' needs usable chapter stops.');
    for (const stop of stops) {
      const label = stop.querySelector('strong').textContent;
      assert.match(label, /\bpp?\. \d|\bchapters? (\d|[IVX]+\b|“)|§|\bAppendix [A-Z]\b/, id + ' stop must cite a chapter, section or page: ' + label);
      assert.ok(stop.querySelector('a[href^="' + exhibit + '"]'), id + ' stop must link the exhibit it supports: ' + label);
      assert.equal(stop.querySelectorAll('a[href^="http"]').length, 0, 'Cite books by title and chapter; never link a copy: ' + label);
    }
    for (const source of sources) {
      assert.ok(trail.querySelector('summary').textContent.includes(source), id + ' must name its sources: ' + source);
      const first = stops.find(stop => stop.querySelector('strong').textContent.startsWith(source + ','));
      assert.ok(first, id + ' needs a stop for ' + source);
      assert.match(first.textContent, /\([^()]*\b(19|20)\d\d[;)]/, id + ' must name the edition of ' + source);
    }
  }

  const legalSourceHosts = new Set([
    'inventwithpython.com',
    'store.doverpublications.com',
    'wordpress.rose-hulman.edu',
    'www.cryptool.org'
  ]);
  let internalCount = 0;
  for (const link of trails.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href');
    if (/^https?:/.test(href)) {
      const url = new URL(href);
      assert.equal(url.protocol, 'https:');
      assert.ok(legalSourceHosts.has(url.hostname), 'Use an official author/publisher resource, not a private copy: ' + href);
      assert.equal(url.search, '', 'Source links should not contain tracking or account parameters.');
      assert.ok(link.relList.contains('noopener'), 'External new-tab links need noopener.');
      continue;
    }
    assert.ok(!/^[a-z]+:/i.test(href), 'Unexpected non-web scheme: ' + href);
    const [location, fragment] = href.split('#');
    const [file, query] = location.split('?');
    const target = file ? path.resolve(root, file) : path.join(root, 'further-reading.html');
    const tour = new URLSearchParams(query || '').get('tour');
    if (tour) assert.ok(fs.existsSync(path.join(root, 'tours', tour + '.json')), 'Missing guided tour: ' + href);
    assert.ok(target.startsWith(root + path.sep), 'An exhibit route must stay in this repository.');
    assert.ok(fs.existsSync(target), 'Missing reading trail target: ' + href);
    if (fragment) {
      const targetDoc = file ? new JSDOM(fs.readFileSync(target, 'utf8')).window.document : doc;
      assert.ok(targetDoc.getElementById(decodeURIComponent(fragment)), 'Missing reading trail anchor: ' + href);
    }
    internalCount++;
  }
  assert.ok(internalCount >= 25, 'The trails need direct, usable exhibit routes.');
  assert.doesNotMatch(trails.innerHTML, /drive\.google|docs\.google|file:\/\/|\/workspace\//i, 'Never expose private library copies or local source paths.');
  // Existing recommended books were retained, not silently replaced by trails.
  assert.match(doc.body.textContent, /Simon Singh/);
  assert.match(doc.body.textContent, /Steven Levy/);
  return internalCount;
}

const html = fs.readFileSync(path.join(root, 'further-reading.html'), 'utf8');
const checked = validate(html);

// Mutation checks prove the guards reject a wrong chapter mapping, a stale
// source anchor, a missing scope note, and an accidental private-copy link.
assert.throws(() => validate(html.replace('data-chapters="21"', 'data-chapters="20"')), /Missing 2018 chapter range/);
assert.throws(() => validate(html.replace('ciphers/columnar.html#multiple-anagramming', 'ciphers/columnar.html#missing-reading-exercise')), /Missing reading trail anchor/);
assert.throws(() => validate(html.replace('concept companions, not reproductions', 'complete reproductions')), /concept companions/);
assert.throws(() => validate(html.replace('https://store.doverpublications.com/products/9780486200972', 'https://drive.google.com/file/d/private-copy')), /official author\/publisher resource/);

// User preference: a correct chapter citation must not become a full-ebook link.
assert.throws(() => validate(html.replace('<p>Chapter 5 · Chapter 6</p>', '<p><a href="https://inventwithpython.com/cracking/chapter5.html">Chapter 5</a> · Chapter 6</p>')), /without linking to ebook copies/);

// The case-study trails: a missing page reference, a missing edition, a
// private copy, a stop that no longer reaches its exhibit, a trail dropped
// from the picker, a stale case anchor and a misspelled tour all fail.
assert.throws(() => validate(html.replace('Rowlett, pp. 151–154', 'Rowlett, memoir')), /must cite a chapter, section or page/);
assert.throws(() => validate(html.replace('(Profile Books, 2000)', '')), /must name the edition of Flannery/);
assert.throws(() => validate(html.replace('(Hachette, 2017)', '(Hachette, 2017; <a href="https://drive.google.com/file/d/private-copy">copy</a>)')), /never link a copy/);
assert.throws(() => validate(html.replace('<a href="lab/working-is-not-secure.html#verdict">', '<a href="ciphers/monoalphabetic.html">')), /must link the exhibit it supports/);
assert.throws(() => validate(html.replace('<a href="#purple-books">', '<a href="#purple">')), /reachable from the trail picker/);
assert.throws(() => validate(html.replace('lab/decipherment-cases.html#maya">Maya case', 'lab/decipherment-cases.html#mayan">Maya case')), /Missing reading trail anchor/);
assert.throws(() => validate(html.replace('tour=writing-systems', 'tour=writing-system')), /Missing guided tour/);

// Source links from other exhibits must reveal the referenced book, not leave
// its source and chapters hidden inside a closed disclosure.
const navSource = new JSDOM(html).window.document.getElementById('reading-trail-navigation').textContent;
const linked = new JSDOM(html, { url: 'https://ciphermuseum.com/further-reading.html#holden', runScripts: 'outside-only' });
linked.window.eval(navSource);
assert.equal(linked.window.document.getElementById('holden').open, true, 'A deep link should reveal its book.');
const gains = linked.window.document.getElementById('gaines');
assert.equal(gains.open, false);
linked.window.document.querySelector('.fr-trail-nav a[href="#gaines"]').click();
assert.equal(gains.open, true, 'The book picker should open the selected route.');
gains.open = false;
linked.window.document.querySelector('.fr-trail-nav a[href="#gaines"]').click();
assert.equal(gains.open, true, 'Selecting an already-targeted but closed route should reopen it.');
linked.window.close();
const caseLink = new JSDOM(html, { url: 'https://ciphermuseum.com/further-reading.html#purple-books', runScripts: 'outside-only' });
caseLink.window.eval(navSource);
assert.equal(caseLink.window.document.getElementById('purple-books').open, true, 'A deep link should reveal a case-study trail.');
caseLink.window.close();

console.log('Reading trails: four edition-pinned books, seven Sweigart stops, four case-study trails, ' + checked + ' internal routes, official sources, deep links and twelve mutation checks passed.');
