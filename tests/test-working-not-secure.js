'use strict';
/* "Working is not secure" route: lab/working-is-not-secure.html and tours/working-not-secure.json.
 *
 * Written from the sources before the route was built:
 *   Flannery, In Code (2000), chapter "After-math": a scheme that works can still be found
 *   insecure; a negative result is a contribution; the book does not give the technical attack.
 *   Bauer, Decrypted Secrets (4th ed.), section 11.2 "Maxims of Cryptology", printed pp. 220-224:
 *   do not underrate the adversary; inventors overrate their own methods; human error.
 *   Piper and Murphy, Cryptography: A Very Short Introduction, chapter 6: practical systems are
 *   breakable in principle; exhaustive key search is the attack of last resort, so a large key
 *   space bounds only that attack.
 * The route must separate correctness, performance and the security claim; state the adversary's
 * information, the claimed property, a functional test and a separate security test; end with an
 * example where encryption and decryption work but the security claim fails; and must not claim
 * to implement the Cayley-Purser attack or carry old key-size guidance.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const N = require('../js/working-not-secure');

const ran = new Set();
const test = (name, fn) => { fn(); ran.add(name); };
const html = fs.readFileSync('lab/working-is-not-secure.html', 'utf8');

// --- Mechanism: a real functional test and a real, separate security test ---
test('key is a permutation of the alphabet', () => assert.equal(new Set(N.KEY).size, 26));
test('functional test passes: decryption inverts encryption', () => {
  assert.equal(N.decrypt(N.encrypt(N.PLAINTEXT, N.KEY), N.KEY), N.PLAINTEXT);
  assert.equal(N.assess().functional, 'passes');
});
test('functional test fails when decryption is wrong', () => {
  const broken = N.KEY.slice(1) + N.KEY[0];
  assert.equal(N.assess({ decryptKey: broken }).functional, 'fails');
});
test('claimed property: the key space is 26 factorial', () => {
  assert.ok(Math.abs(N.keyspaceLog10() - Math.log10(403291461126605635584000000)) < 1e-9);
});
test('security test refutes the claim on the worked example', () => {
  const a = N.assess();
  assert.ok(a.recovered > N.REFUTE_AT, 'Frequency ranking recovers ' + a.recovered.toFixed(2));
  assert.equal(a.security, 'claim refuted');
});
test('security verdict follows the measurement, not the label', () => {
  // A text with flat letter frequencies gives the frequency attack nothing to work with.
  const flat = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(4);
  assert.equal(N.assess({ plaintext: flat }).security, 'not refuted by this test');
});
test('a passing functional test does not imply a passing security test', () => {
  const a = N.assess();
  assert.equal(a.functional, 'passes'); assert.equal(a.security, 'claim refuted');
});
test('chance level reported beside the measurement', () => assert.ok(Math.abs(N.assess().chance - 1 / 26) < 1e-12));

// --- Wiring ---
const dom = new JSDOM(html);
N.mount(dom.window.document);
const doc = dom.window.document, $ = id => doc.getElementById(id);
test('rendered functional and security results come from the model', () => {
  assert.equal($('wn-security-result').textContent, '');
  $('wn-functional').click();
  assert.match($('wn-functional-result').textContent, /^Passes/);
  $('wn-security').click();
  assert.match($('wn-security-result').textContent, new RegExp(Math.round(N.assess().recovered * 100) + '%'));
  assert.match($('wn-security-result').textContent, /refuted/);
});
test('the four questions are answered separately', () => {
  for (const id of ['wn-q-adversary', 'wn-q-claim', 'wn-q-functional', 'wn-q-security']) assert.ok($(id) && $(id).textContent.trim(), id);
});
dom.window.close();

// --- Prose and honesty ---
const page = new JSDOM(html).window.document;
const text = page.querySelector('main').textContent.replace(/\s+/g, ' ');
test('correctness, performance and security distinguished', () => {
  for (const w of [/correct/i, /performance|fast/i, /security claim/i]) assert.match(text, w);
});
test('failed hypothesis connected to a useful result', () => {
  assert.match(text, /Flannery/); assert.match(text, /negative result/i);
});
test('does not claim to implement the Cayley–Purser attack', () => {
  assert.match(text, /does not reproduce the attack/i);
  assert.doesNotMatch(text, /implements? the Cayley[–-]Purser attack/i);
});
test('no old key-size guidance or unbreakable claims', () => {
  assert.doesNotMatch(text, /\b(?:40|56|128|512|1024|2048)[- ]bit keys? (?:is|are) (?:secure|safe|enough)/i);
  assert.doesNotMatch(text, /unbreakable(?! claims)/i);
});
test('key space described as bounding only exhaustive search', () => assert.match(text, /only exhaustive (?:key )?search/i));
test('sources cited', () => {
  assert.match(text, /Sarah Flannery[^.]*In Code[^.]*“After-math”/);
  assert.match(text, /Bauer[^.]*§11\.2[^.]*pp\. 220–224/);
  assert.match(text, /Piper and Sean Murphy[^.]*chapter 6/);
});
test('executable security game linked, not reimplemented', () => {
  assert.ok(page.querySelector('a[href="https://systemslibrarian.github.io/crypto-lab-hidden-bit/"]'));
});
test('no private copies linked', () => {
  assert.ok(![...page.querySelectorAll('a[href]')].some(a => /drive\.google|docs\.google|archive\.org/.test(a.getAttribute('href'))));
});

// --- The route ---
const tour = JSON.parse(fs.readFileSync('tours/working-not-secure.json', 'utf8'));
test('route registered', () => {
  assert.match(fs.readFileSync('tours/tour.html', 'utf8'), /VALID_TOURS = \[[^\]]*'working-not-secure'/);
  assert.match(fs.readFileSync('tours/index.html', 'utf8'), /\{id:'working-not-secure', file:'working-not-secure\.json'\}/);
});
test('route starts and ends on the worked example', () => {
  assert.equal(tour.stops[0].href, '../lab/working-is-not-secure.html');
  assert.equal(tour.stops.at(-1).href, '../lab/working-is-not-secure.html#verdict');
});
const pageText = href => {
  const [file, frag] = href.split('#');
  const d = new JSDOM(fs.readFileSync(path.join('tours', file), 'utf8')).window.document;
  if (frag) return d.getElementById(frag).textContent.replace(/\s+/g, ' ');
  return (d.body.textContent + ' ' + [...d.querySelectorAll('meta[name="description"]')].map(m => m.content).join(' ')).replace(/\s+/g, ' ');
};
const CLAIMS = {
  '../ciphers/monoalphabetic.html': [/26! possible keys/, /language patterns/],
  '../ciphers/one-time-pad.html': [/used once/, /not authentication/],
  '../ciphers/enigma.html': [/keys and procedures/],
  '../hall-of-foundations/reduction.html': [/quietly assumes/],
  '../hall-of-foundations/entropy.html': [/key generation/],
  '../lab/modern-attack-evidence.html': [/access, data, computation and validation/]
};
test('each stop note carries a claim its page makes', () => {
  for (const [href, claims] of Object.entries(CLAIMS)) {
    const stop = tour.stops.find(s => s.href === href);
    assert.ok(stop, 'Route must include ' + href);
    for (const c of claims) { assert.match(stop.note, c, stop.label + ' note'); assert.match(pageText(href), c, href + ' page'); }
  }
});

const REQUIRED = ['functional test fails when decryption is wrong', 'security test refutes the claim on the worked example',
  'security verdict follows the measurement, not the label', 'a passing functional test does not imply a passing security test',
  'rendered functional and security results come from the model', 'each stop note carries a claim its page makes'];
for (const n of REQUIRED) assert.ok(ran.has(n), 'Required test did not run: ' + n);
console.log('Working is not secure: ' + ran.size + ' named tests, including ' + REQUIRED.length + ' required verdict and failure paths, passed.');
