#!/usr/bin/env node
'use strict';

// Policy is deliberately independent of the manifest: adding a secure entry
// to the data source must not silently expand the modern-security allowlist.
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const { buildTrustLabels, LABELS } = require('../scripts/build-trust-labels');
const { loadTrust } = require('../scripts/exhibit-trust');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SECURE_ALLOWLIST = new Set([
  'ciphers/one-time-pad.html',
  'ciphers/vernam.html',
  'ciphers/aes.html',
  'ciphers/rsa.html',
  'ciphers/sha256.html',
  'ciphers/diffie-hellman.html',
  'ciphers/ecdsa.html',
  'ciphers/shamir-secret-sharing.html',
  'ciphers/zero-knowledge-proofs.html'
]);
const WARTIME_UNBROKEN_SYSTEMS = ['sigaba', 'typex', 'kl-7', 'fialka', 'navajo-code-talkers'];
const HISTORICAL_COMPROMISES = ['vic', 'stager', 'culper-ring', 'arnold-andre', 'che-guevara'];
const HISTORICAL_SYSTEMS = [...WARTIME_UNBROKEN_SYSTEMS, ...HISTORICAL_COMPROMISES];
const CONTEXT_EXHIBITS = [
  'nfc-deployment',
  'bombe', 'colossus',
  'egyptian-substitution', 'aeneas-tacticus', 'rosetta-stone', 'chinese-telegraph', 'morse',
  'phaistos-disc', 'bletchley-park', 'cabinet-noir', 'kerckhoffs', 'station-hypo', 'bible-code',
  'rochefort', 'beurling', 'dilly-knox', 'yardley', 'mavis-batey', 'gchq-trio', 'kahn',
  'dunin', 'lasry', 'agnes-driscoll', 'bill-tutte', 'elizebeth-friedman', 'joan-clarke', 'leo-marks',
  'freemason-pigpen', 'bach-motif', 'sator-square', 'field-hollers', 'gold-bug', 'dancing-men',
  'da-vinci-code', 'national-treasure', 'gravity-falls', 'cicada-3301', 'mit-mystery-hunt', 'krypto-arg'
];
const SECURE_NUMBERS = {
  'one-time-pad': 36, vernam: 37, 'diffie-hellman': 60, rsa: 61, aes: 62,
  sha256: 63, ecdsa: 158, 'shamir-secret-sharing': 159, 'zero-knowledge-proofs': 160
};

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function parse(rel) {
  return new JSDOM(read(rel), { runScripts: 'outside-only', virtualConsole: new VirtualConsole(), url: `https://ciphermuseum.com/${rel}` });
}
function htmlFiles(dir) {
  return fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.html')).map(f => `${dir}/${f}`);
}

const { exhibits } = JSON.parse(read('data/exhibit-trust.json'));
assert.equal(SECURE_ALLOWLIST.size, 9, 'Exactly nine modern systems');
assert.equal(LABELS.historical.description, 'Obsolete or historical system; notes distinguish cryptanalysis from capture or other operational compromise.', 'Agreed historical definition');
assert.deepEqual(Object.keys(LABELS).sort(), ['broken', 'educational', 'historical', 'secure']);
const { trustFor } = loadTrust(ROOT);
const cards = JSON.parse(read('data/artifact-cards.json')).cards;
const byPath = new Map(exhibits.map(e => [e.path, e]));
assert.equal(byPath.size, exhibits.length, 'Every manifest path is unique');
assert.equal(new Set(exhibits.map(e => e.number)).size, exhibits.length, 'Every exhibit number is unique');
assert.deepEqual([...byPath.keys()].sort(), [
  ...htmlFiles('ciphers'), ...htmlFiles('hall-of-foundations').filter(f => !f.endsWith('/index.html'))
].sort(), 'The audit covers every cipher, protocol, and Foundations exhibit on disk');

for (const entry of exhibits) {
  assert(entry.label === null || Object.hasOwn(LABELS, entry.label), `${entry.path}: known category or no label`);
  assert.equal(entry.label === 'secure', SECURE_ALLOWLIST.has(entry.path),
    `${entry.path}: Secure (Modern) is reserved for the explicit allowlist`);
  if (entry.label === 'secure') assert.equal(entry.number, SECURE_NUMBERS[path.basename(entry.path, '.html')], 'Secure exhibit identity stays fixed');
  if (entry.path.startsWith('hall-of-foundations/')) {
    assert.equal(entry.label, null, `${entry.path}: mathematics carries no cipher trust label`);
  }
}
for (const slug of CONTEXT_EXHIBITS) {
  assert.equal(byPath.get(`ciphers/${slug}.html`)?.label, null, `${slug}: context has no cipher trust label`);
}
for (const slug of HISTORICAL_SYSTEMS) {
  const rel = `ciphers/${slug}.html`;
  assert.equal(byPath.get(rel)?.label, 'historical', `${slug}: obsolete service success is Historical Only`);
  assert.match(byPath.get(rel)?.note || '', slug === 'che-guevara' ? /historical pad system/i : /never|capture|defector|defection|superseded|cryptanalytic|operational/i,
    `${slug}: manifest note distinguishes cryptanalysis from operational history`);
  const dom = parse(rel);
  assert.equal(dom.window.document.querySelector('.page-meta .sec-secure'), null,
    `${slug}: service history must not use a green security badge`);
  dom.window.close();
}
for (const slug of WARTIME_UNBROKEN_SYSTEMS) {
  const rel = `ciphers/${slug}.html`;
  const dom = parse(rel);
  const prose = dom.window.document.querySelector('.cipher-significance').textContent;
  if (slug === 'typex') {
    assert.match(prose, /do not establish a general German wartime cryptanalytic break/i,
      'Typex: absence of an established general break is not absence of all reading');
    assert.match(prose, /does not exclude reading traffic with captured equipment and key material/i,
      'Typex: keep capture-assisted reading distinct from a general break');
  } else {
    assert.match(prose,
      /never publicly broken|no publicly documented.*break|not publicly documented.*broken|no public.*cryptanalytic break/i, `${slug}: qualify the historical claim in exhibit prose`);
  }
  dom.window.close();
}
for (const slug of ['scytale', 'caesar', 'polybius', 'pigpen', 'bacon', 'tap-code', 'atbash', 'rot13',
  'enigma', 'lorenz', 'purple', 'des', 'great-cipher', 'm209', 'chaocipher',
  'copiale', 'mary-stuart-castelnau-letters', 'venona']) {
  assert.equal(byPath.get(`ciphers/${slug}.html`)?.label, 'broken', `${slug}: documented breaks retain Broken`);
}

// Check what a visitor actually sees, not only what the source data says.
function checkBadge(badge, entry, surface) {
  assert(entry, `${surface}: badge belongs to a known exhibit`);
  assert.notEqual(entry.label, null, `${surface}: context must not render a badge`);
  const definition = LABELS[entry.label];
  assert.equal(badge.textContent.trim(), definition.text, `${surface}: visible label matches source`);
  const modifiers = [...badge.classList].filter(c => /^trust-label--/.test(c) && c !== 'trust-label--sm');
  assert.deepEqual(modifiers, [`trust-label--${entry.label}`], `${surface}: class agrees with visible label`);
  if (badge.tagName === 'SPAN') {
    assert.equal(badge.title, definition.description, `${surface}: tooltip matches category`);
  } else {
    assert.equal(badge.title, definition.description, `${surface}: tooltip matches category`);
    assert.match(badge.getAttribute('aria-label'), new RegExp(definition.text.replace(/[()]/g, '\\$&')),
      `${surface}: accessible label agrees with visible label`);
    assert.equal(badge.getAttribute('href'), '../museum-map.html#trust-labels', `${surface}: badge links to definitions`);
  }
  if (badge.classList.contains('trust-label--secure') || badge.textContent.includes('Secure (Modern)')) {
    assert(SECURE_ALLOWLIST.has(entry.path), `${surface}: unauthorized Secure (Modern) on ${entry.path}`);
  }
}

const allHtml = [
  ...fs.readdirSync(ROOT).filter(f => f.endsWith('.html')),
  ...['ciphers', 'halls', 'hall-of-foundations', 'lab', 'tours', 'community'].flatMap(htmlFiles)
];
const rosterPaths = new Set();
for (const rel of allHtml) {
  const dom = parse(rel);
  const d = dom.window.document;
  const ownEntry = byPath.get(rel);
  if (ownEntry) {
    assert.equal(d.querySelectorAll('[class*="sec-"]').length, 0, `${rel}: no independent legacy security badge`);
    assert.equal(d.querySelectorAll('.trust-label-wrap').length, ownEntry.label === null ? 0 : 1,
      `${rel}: exactly the expected number of badge wrappers`);
    assert.equal(d.querySelectorAll('.trust-label').length, ownEntry.label === null ? 0 :
      1 + [...d.querySelectorAll('tr')].filter(row => row.cells[0]?.textContent === 'Trust').length +
      [...d.querySelectorAll('.fact-label')].filter(n => n.textContent === 'Trust').length,
      `${rel}: exactly the expected number of trust badges`);
    assert(![...d.querySelectorAll('tr')].some(row => row.cells[0]?.textContent === 'Security'), `${rel}: quick facts have no independent classification`);
  }
  if (rel.startsWith('halls/')) {
    assert.equal(d.querySelectorAll('[class*="sec-"]').length, 0, `${rel}: legacy hall security badges are retired`);
    for (const card of d.querySelectorAll('a.cipher-card')) {
      const entry = byPath.get(card.getAttribute('href').replace(/^\.\.\//, ''));
      if (entry) assert.equal(card.querySelectorAll('.trust-label').length, entry.label === null ? 0 : 1,
        `${rel}: every linked exhibit renders or omits its canonical label`);
    }
  }
  if (rel === 'museum-map.html') {
    for (const row of d.querySelectorAll('.cipher-table tbody tr')) {
      const href = row.querySelector('a').getAttribute('href');
      const entry = byPath.get(href);
      assert(entry, `${href}: roster entry exists in manifest`);
      assert(!rosterPaths.has(href), `${href}: appears in roster exactly once`);
      rosterPaths.add(href);
      assert.equal(Number(row.cells[0].textContent), entry.number, `${href}: roster number matches source`);
      assert.equal(row.querySelectorAll('.trust-label').length, entry.label === null ? 0 : 1,
        `${href}: map renders or omits the badge according to source`);
    }
  }
  for (const badge of d.querySelectorAll('.trust-label')) {
    if (rel === 'museum-map.html' && badge.closest('#trust-labels')) {
      const key = Object.keys(LABELS).find(k => badge.classList.contains(`trust-label--${k}`));
      assert.equal(badge.textContent.trim(), LABELS[key]?.text, 'Map legend uses one of the four existing categories');
      assert.equal(badge.title, LABELS[key].description, 'Legend tooltip uses shared definition');
      assert.equal(badge.closest('.trust-legend__item').querySelector('.trust-legend__desc').textContent,
        LABELS[key].description, 'Legend prose uses exact shared definition');
      continue;
    }
    let entry = ownEntry;
    if (rel === 'museum-map.html') entry = byPath.get(badge.closest('tr')?.querySelector('a')?.getAttribute('href'));
    if (rel.startsWith('halls/')) entry = byPath.get(badge.closest('a.cipher-card')?.getAttribute('href')?.replace(/^\.\.\//, ''));
    checkBadge(badge, entry, rel);
  }

  // Catch the exact modern label even if someone uses legacy badge markup,
  // plain text, a tooltip, or an accessible name instead of .trust-label.
  const nodes = d.querySelectorAll('body *:not(script):not(style)');
  for (const node of nodes) {
    const ownText = [...node.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ');
    if (![ownText, node.title, node.getAttribute('aria-label')].some(t => t?.includes('Secure (Modern)'))) continue;
    if (rel === 'museum-map.html' && node.closest('#trust-labels')) continue;
    if (rel === 'comparison.html' && node.closest('#security-filter')) continue;
    let target = ownEntry?.path;
    if (rel === 'museum-map.html') target = node.closest('tr')?.querySelector('a')?.getAttribute('href');
    if (rel.startsWith('halls/')) target = node.closest('a.cipher-card')?.getAttribute('href')?.replace(/^\.\.\//, '');
    assert(SECURE_ALLOWLIST.has(target), `${rel}: Secure (Modern) appears outside the explicit allowlist (${target})`);
  }
  if (ownEntry && rel.startsWith('ciphers/')) {
    const card = cards[path.basename(rel, '.html')];
    assert.deepEqual(card.trust, trustFor(rel), `${rel}: artifact classification and definition match source`);
    assert.equal(card.securityFailure, ownEntry.label === null ? null : (ownEntry.note || 'See the exhibit’s documented attacks and limitations.'),
      `${rel}: artifact history is current and separate from classification`);
    assert(d.querySelector('script[src="../js/trust-labels.js"]'), `${rel}: shared badge renderer is loaded`);
    dom.window.eval(read('js/trust-labels.js'));
    dom.window.eval(read('js/artifact-cards-data.min.js'));
    dom.window.eval(read('js/artifact-cards.js'));
    const artifact = d.querySelector('.artifact-card');
    assert(artifact, `${rel}: artifact renderer runs`);
    assert.equal(artifact.querySelectorAll('.trust-label').length, ownEntry.label === null ? 0 : 1,
      `${rel}: artifact omits context trust classification`);
    if (ownEntry.label !== null) checkBadge(artifact.querySelector('.trust-label'), ownEntry, `${rel}: live artifact`);
  }
  dom.window.close();
}
assert.deepEqual([...rosterPaths].sort(), exhibits.filter(e => e.path.startsWith('ciphers/')).map(e => e.path).sort(),
  'Every cipher and protocol appears in the roster');
const searchEntries = new Map(JSON.parse(read('js/search-index.json')).entries.map(e => [e.u, e]));
for (const slug of HISTORICAL_SYSTEMS) {
  const rel = `ciphers/${slug}.html`;
  assert.equal(searchEntries.get(rel)?.b, 'Historical Only',
    `${rel}: search uses the canonical label after service-history badges are removed`);
}
for (const entry of exhibits) {
  const search = searchEntries.get(entry.path);
  assert(search, `${entry.path}: search entry exists`);
  // Foundations are context pages, and their search records omit trust data.
  assert.deepEqual(search.trust || null, trustFor(entry.path), `${entry.path}: search classification and definition match source`);
  assert.equal(search.b, entry.label === null ? '—' : LABELS[entry.label].text, `${entry.path}: canonical search status`);
}
// README is a claim surface too, and nothing read it. Three of these rows kept
// the pre-reclassification story for two remediation passes while the exhibit,
// trust note, comparison row, map row and search entry all already agreed.
// The retired claims, verbatim as they shipped.
const RETIRED_README_CLAIMS = [
  ['vic', /\bBroken in 1957\b/i, 'VIC was exposed by a defector, not broken in 1957'],
  ['vic', /probable-word|depth attack/i, 'no cryptanalytic attack broke VIC'],
  ['culper-ring', /captured by British/i, 'the Culper codebook was never captured'],
  ['culper-ring', /decoded from dictionary/i, 'the Tallmadge numbers were never decoded by the British'],
  ['che-guevara', /probable-word attack/i, 'no cryptanalytic break is claimed for the Che Guevara variant'],
  ['stager', /knew the word lists from captures/i,
    'Confederate wiretappers never read a Stager message; the system became public in post-war memoirs']
];
const readme = read('README.md');
function readmeRow(slug) {
  const row = readme.split('\n').find(line =>
    new RegExp(`^\\| \\[[^\\]]+\\]\\(https://ciphermuseum\\.com/ciphers/${slug.replace(/-/g, '\\-')}\\.html\\)`).test(line));
  assert(row, `README.md: exhibit row for ${slug}`);
  return row;
}
for (const slug of HISTORICAL_COMPROMISES) {
  const row = readmeRow(slug);
  const note = exhibits.find(entry => entry.path === `ciphers/${slug}.html`).note || '';
  assert((slug === 'che-guevara' ? /not Guevara.*historical pad system/i : /Never broken|never captured|no cryptanalytic break|capture|superseded|defection|operational/i).test(note),
    `${slug}: trust note records the operational compromise`);
  for (const [target, pattern, reason] of RETIRED_README_CLAIMS) {
    if (target !== slug) continue;
    assert.doesNotMatch(row, pattern, `README.md row for ${slug} contradicts its exhibit: ${reason}`);
  }
}
// The VIC row is the one that drifted furthest, so pin it to the page itself.
const vicDescription = /<meta name="description" content="([^"]*)"/.exec(read('ciphers/vic.html'))[1];
assert(readmeRow('vic').includes(vicDescription),
  'README.md: the VIC row description must be the exhibit\'s own meta description');
// Corrected in 54c7d6e on the page and missed in README for four releases.
const culperEntries = /Codebook of ~(\d+) numbered entries/.exec(read('ciphers/culper-ring.html'))[1];
assert(readmeRow('culper-ring').includes(`Roughly ${culperEntries} numbered entries`),
  `README.md: the Culper Ring entry count must match the exhibit (~${culperEntries})`);
// The 2 November 2026 book review found these rows still repeating claims their
// exhibits had already qualified. Each row now repeats the exhibit's own meta
// description, so a later page correction cannot be missed here again.
const RETIRED_SUMMARY_CLAIMS = [
  ['egyptian-substitution', /earliest surviving instance of a deliberate substitution cipher/i,
    'whether the Khnumhotep II writing was meant to conceal is uncertain'],
  ['red-type-a', /stepping-switch predecessor/i, 'Red used a half-rotor; the stepping switches were Purple’s'],
  ['purple', /Broken on 20 September 1940 by Frank Rowlett/i,
    'Grotjan’s breakthrough was one step in a continuing team reconstruction'],
  ['bletchley-park', /shortening the war by two years/i, 'time saved is a counterfactual estimate, not a result'],
  ['station-hypo', /broke JN-25 in 1942|turning the tide/i, 'JN-25 recovery was partial and cumulative'],
  ['rochefort', /broke JN-25 in 1942|won the Battle of Midway|turned the tide/i,
    'Midway intelligence was partial and the outcome also depended on reconnaissance and command'],
  ['jn-25', /system broken by Station HYPO/i, 'JN-25 recovery was partial and shared with OP-20-G and allied units']
];
for (const slug of new Set(RETIRED_SUMMARY_CLAIMS.map(([target]) => target))) {
  const row = readmeRow(slug);
  const description = /<meta name="description" content="([^"]*)"/.exec(read(`ciphers/${slug}.html`))[1];
  assert(row.includes(description), `README.md: the ${slug} row description must be the exhibit's own meta description`);
  for (const [target, pattern, reason] of RETIRED_SUMMARY_CLAIMS) {
    if (target === slug) assert.doesNotMatch(row, pattern, `README.md row for ${slug} contradicts its exhibit: ${reason}`);
  }
}

assert.deepEqual(buildTrustLabels({ check: true }), [], 'All rendered badges are current; run npm run build:trust-labels');
for (const generator of ['build-search-index', 'build-artifact-cards']) {
  const result = spawnSync(process.execPath, [`scripts/${generator}.js`, '--check'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(result.status, 0, `${generator}: generated metadata is fresh\n${result.stdout}${result.stderr}`);
}

async function checkInteractiveSurfaces() {
  const comparison = parse('comparison.html');
  comparison.window.eval(read('js/trust-labels.js'));
  const script = [...comparison.window.document.scripts].find(s => s.textContent.includes('var CIPHERS ='));
  comparison.window.eval(script.textContent);
  const rows = [...comparison.window.document.querySelectorAll('#cipher-tbody tr')];
  assert(rows.length > 100, 'Comparison renders its collection');
  for (const row of rows) {
    const entry = byPath.get(row.querySelector('a').getAttribute('href'));
    assert.equal(row.querySelectorAll('.trust-label').length, entry.label === null ? 0 : 1, `${entry.path}: live comparison omits context`);
    if (entry.label !== null) checkBadge(row.querySelector('.trust-label'), entry, `${entry.path}: live comparison`);
  }
  const filter = comparison.window.document.getElementById('security-filter');
  assert.deepEqual([...filter.options].map(o => o.value), ['', ...Object.values(LABELS).map(d => d.text)], 'Comparison filters use shared categories');
  for (const [key, definition] of Object.entries(LABELS)) {
    filter.value = definition.text;
    filter.dispatchEvent(new comparison.window.Event('change'));
    for (const row of rows) assert.equal(!row.classList.contains('hidden'),
      byPath.get(row.querySelector('a').getAttribute('href')).label === key, 'Comparison filter agrees with rendered classification');
  }
  comparison.window.close();

  for (const slug of ['sigaba', 'caesar', 'vernam', 'chaocipher', 'bletchley-park', 'freemason-pigpen']) {
    const dom = new JSDOM(read('search.html'), { runScripts: 'outside-only', url: `https://ciphermuseum.com/search.html?q=${slug}`, virtualConsole: new VirtualConsole() });
    dom.window.fetch = async () => ({ ok: true, json: async () => JSON.parse(read('js/search-index.json')) });
    dom.window.eval(read('js/trust-labels.js'));
    dom.window.eval(read('js/search.js'));
    const script = [...dom.window.document.scripts].find(s => s.textContent.includes("document.addEventListener('DOMContentLoaded'"));
    dom.window.eval(script.textContent);
    await new Promise(resolve => dom.window.setTimeout(resolve, 20));
    const rel = `ciphers/${slug}.html`, entry = byPath.get(rel);
    const result = [...dom.window.document.querySelectorAll('.sr-card')].find(n => n.getAttribute('href') === rel);
    assert(result, `${rel}: live search result`);
    assert.equal(result.querySelectorAll('.trust-label').length, entry.label === null ? 0 : 1, `${rel}: search omits context badges`);
    if (entry.label !== null) {
      checkBadge(result.querySelector('.trust-label'), entry, `${rel}: live search`);
      assert(result.querySelector('.sr-meta').textContent.includes(`Trust: ${LABELS[entry.label].text}`), 'Search uses neutral Trust prefix');
    }
    assert(!result.textContent.includes('Broken:'), 'Search does not present every result as broken');
    dom.window.close();
  }
  console.log(`Trust-label audit passed: ${exhibits.length} exhibits, exactly nine modern systems; headers, map, halls, legends, search, comparison and live artifacts agree.`);
}
checkInteractiveSurfaces().catch(error => { console.error(error); process.exitCode = 1; });
