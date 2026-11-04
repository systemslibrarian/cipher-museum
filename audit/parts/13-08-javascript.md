# javascript appendix 8

Snapshot: `1ff94108c646ead3f612595108ab2e97e1a6151c`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

## JavaScript — js/working-not-secure.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/working-not-secure.js`
- Served SHA-256: `cbb9852d8c1d24e30cca524dda1590a7d75e1974f85a51d6595d6c92e50c1c05`
- Readable-source SHA-256: `cbb9852d8c1d24e30cca524dda1590a7d75e1974f85a51d6595d6c92e50c1c05`


```javascript
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.WorkingNotSecure = api; api.mount(document); }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // An original message and a fixed substitution key, both invented for this page.
  const PLAINTEXT = 'THE SIGNAL STATION WILL CLOSE AT NIGHTFALL AND THE RELIEF CREW WILL ARRIVE BY THE EASTERN ROAD BEFORE DAWN. THEY SHOULD BRING THE NEW CODE TABLES, THE SPARE BATTERIES AND THE WEATHER REPORTS FOR THE NEXT THREE DAYS. NOBODY SHOULD SEND A MESSAGE ABOUT THE CHANGE UNTIL THE NEW TABLES ARE IN PLACE AND THE OLD ONES HAVE BEEN BURNED.';
  const KEY = 'QMZLDWNRAGPKOEVBYSTJIHCUFX';
  // English letters from most to least frequent, the attacker's only outside knowledge.
  const ENGLISH_ORDER = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';
  const CHANCE = 1 / 26;
  // The claim "the ciphertext alone gives nothing away" is refuted when a ciphertext-only attack
  // recovers this share of letters: five times what guessing would.
  const REFUTE_AT = 5 * CHANCE;

  const map = (text, from, to) => text.replace(/[A-Z]/g, c => to[from.indexOf(c)]);
  const encrypt = (text, key) => map(text, ALPHABET, key);
  const decrypt = (text, key) => map(text, key, ALPHABET);
  // log10(26!): the size of the key space, which bounds only exhaustive key search.
  function keyspaceLog10() { let s = 0; for (let i = 2; i <= 26; i++) s += Math.log10(i); return s; }

  // Ciphertext-only attack: pair cipher letters by frequency rank with English letters.
  function frequencyAttack(ciphertext) {
    const counts = {};
    for (const c of ciphertext) if (ALPHABET.includes(c)) counts[c] = (counts[c] || 0) + 1;
    const ranked = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
    const guess = {};
    ranked.forEach((c, i) => { guess[c] = ENGLISH_ORDER[i]; });
    return ciphertext.replace(/[A-Z]/g, c => guess[c]);
  }
  function recovered(plain, guess) {
    let hit = 0, total = 0;
    for (let i = 0; i < plain.length; i++) if (ALPHABET.includes(plain[i])) { total++; if (guess[i] === plain[i]) hit++; }
    return total ? hit / total : 0;
  }

  function assess(opts) {
    const o = opts || {}, plain = o.plaintext || PLAINTEXT, key = o.key || KEY;
    const cipher = encrypt(plain, key);
    const functional = decrypt(cipher, o.decryptKey || key) === plain ? 'passes' : 'fails';
    const guess = frequencyAttack(cipher), share = recovered(plain, guess);
    return { cipher, functional, guess, recovered: share, chance: CHANCE, security: share > REFUTE_AT ? 'claim refuted' : 'not refuted by this test' };
  }

  function mount(doc) {
    const $ = id => doc.getElementById(id);
    if (!$('wn-functional')) return;
    const a = assess();
    $('wn-cipher').textContent = a.cipher;
    $('wn-functional').addEventListener('click', () => {
      const r = assess();
      $('wn-functional-result').textContent = (r.functional === 'passes' ? 'Passes' : 'Fails') + ': decrypting the ciphertext with the key gives back the message exactly. That shows the cipher is correct, not that it is secure.';
    });
    $('wn-security').addEventListener('click', () => {
      const r = assess();
      $('wn-guess').textContent = r.guess;
      $('wn-security-result').textContent = 'The claim is ' + (r.security === 'claim refuted' ? 'refuted' : 'not refuted by this test') + ': ranking cipher letters by frequency, with no key search at all, recovers ' + Math.round(r.recovered * 100) + '% of the letters. Guessing would recover about ' + Math.round(r.chance * 100) + '%.';
    });
  }
  return { ALPHABET, PLAINTEXT, KEY, ENGLISH_ORDER, REFUTE_AT, encrypt, decrypt, keyspaceLog10, frequencyAttack, recovered, assess, mount };
});
```


## JavaScript — scripts/columnar-classroom.js

**Classroom command-line tool:** runs with Node.js in a repository checkout; it is not a browser demo. The linked worksheet and fixed fixtures are included separately.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `scripts/columnar-classroom.js`
- Served SHA-256: `fc4b64e8877c3fad1c6866029f58189c1c7a6f555a4a44fdcc148f78e68fc4f3`
- Readable-source SHA-256: `fc4b64e8877c3fad1c6866029f58189c1c7a6f555a4a44fdcc148f78e68fc4f3`


```javascript
#!/usr/bin/env node
'use strict';
// A small receipt-producing classroom experiment; reuses the Museum solver.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const root = path.join(__dirname, '..');
const columnar = require('../js/columnar-search');
require('../js/detective/lang-model');
const fixturePath = 'public/teaching/columnar-classroom-fixtures.json';
const corpus = JSON.parse(fs.readFileSync(path.join(root, fixturePath), 'utf8'));
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

// Reference preparation is separate from the search implementation: write rows,
// then read the specified columns. Fixed ciphertexts are retained in the fixture.
function referenceEncrypt(plaintext, order) {
  const rows = [];
  for (let i = 0; i < plaintext.length; i += order.length) rows.push(plaintext.slice(i, i + order.length));
  return order.map(column => rows.map(row => row[column] || '').join('')).join('');
}
function runExperiment({clock = () => performance.now()} = {}) {
  const runs = [];
  const variants = [{id:'direct', staged:false}, {id:'staged', staged:true}];
  for (const fixture of corpus.fixtures) {
    if (referenceEncrypt(fixture.plaintext, fixture.order) !== fixture.ciphertext) throw Error('Fixture does not match its independent row/column reference: ' + fixture.id);
    if (fixture.length !== fixture.plaintext.length || fixture.width !== fixture.order.length || fixture.remainder !== fixture.length % fixture.width) throw Error('Fixture shape mismatch: ' + fixture.id);
    for (const seed of corpus.seeds) for (const variant of variants) {
      const options = {width:fixture.width, budget:corpus.budget, restarts:corpus.restarts, seed, staged:variant.staged, alignment:true, segments:true};
      const started = clock();
      const result = columnar.solve(fixture.ciphertext, options);
      const elapsedMs = Math.max(0, clock() - started);
      if (result.evaluations > options.budget || result.preprocessing > result.evaluations) throw Error('Budget accounting failed.');
      const exactPlaintext = !!result.best && result.best.plaintext === fixture.plaintext;
      const exactKey = !!result.best && result.best.order.every((value, i) => value === fixture.order[i]);
      runs.push({fixture:fixture.id, variant:variant.id, options, length:fixture.length, remainder:fixture.remainder,
        rectangle:fixture.remainder ? 'incomplete' : 'complete', evaluations:result.evaluations,
        preprocessingEvaluations:result.preprocessing, elapsedMs,
        exactPlaintext, exactKey, outcome:exactPlaintext ? 'plaintext-recovered' : result.best ? 'different-candidate' : 'no-candidate',
        candidate:result.best ? {plaintext:result.best.plaintext, order:result.best.order, score:result.best.score} : null,
        reason:result.reason});
    }
  }
  const summary = variants.map(variant => {
    const rows = runs.filter(run => run.variant === variant.id);
    return {variant:variant.id, runs:rows.length, exactPlaintexts:rows.filter(run => run.exactPlaintext).length,
      exactKeys:rows.filter(run => run.exactKey).length, noCandidate:rows.filter(run => !run.candidate).length,
      unsuccessfulPlaintexts:rows.filter(run => !run.exactPlaintext).length};
  });
  return {schema:'museum-columnar-classroom-receipt-v1', fixtureSet:corpus,
    sources:{fixturesSha256:digest(fixturePath), solverSha256:digest('js/columnar-search.js'), languageModelSha256:digest('js/detective/lang-model.js'), runnerSha256:digest('scripts/columnar-classroom.js')},
    runtime:{node:process.version, platform:process.platform, arch:process.arch},
    scope:'24 fixed runs: four synthetic messages, three seeds, two variants differing only in staged initialization. Every failure is retained. These counts describe this small fixture set, not general recovery probabilities. Repeated seeds on a message are dependent. Equal evaluation budgets are not equal CPU work. Timings vary and are excluded from exact replay.',
    summary, runs};
}
function withoutTimings(report) {
  return {...report, runs:report.runs.map(({elapsedMs, ...run}) => run)};
}
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--check','--help'].includes(arg))) throw Error('Usage: node scripts/columnar-classroom.js [--check | --help]');
  if (args.includes('--help')) {
    console.log('Emit 24-run JSON receipt to stdout: node scripts/columnar-classroom.js > columnar-classroom-results.json\nCheck deterministic replay, excluding time: node scripts/columnar-classroom.js --check');
  } else if (args.includes('--check')) {
    const first = runExperiment(), second = runExperiment();
    require('node:assert/strict').deepEqual(withoutTimings(first), withoutTimings(second));
    console.log('All 24 classroom runs replay exactly apart from elapsed time. Failures and exhausted budgets remain in the receipt.');
  } else {
    console.log(JSON.stringify(runExperiment(), null, 2));
  }
}
module.exports = {runExperiment, withoutTimings, referenceEncrypt};
```


## JavaScript — scripts/research-splits.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `scripts/research-splits.js`
- Served SHA-256: `fe57341e14a3e4b39aa8d3d15f1238d81e49baf8752ba30b383b726865de4010`
- Readable-source SHA-256: `fe57341e14a3e4b39aa8d3d15f1238d81e49baf8752ba30b383b726865de4010`


```javascript
'use strict';
// Declared split and grouping rules for research-evaluation v2.
//
// Two leakage routes are closed explicitly.
//   1. SOURCE GROUPING. Every ciphertext variant derived from one source document
//      belongs to the same split. Variants of one plaintext are not independent items,
//      and scattering them across splits would let a tuning split reveal a test answer.
//   2. KEY AND CODE-POOL DISJOINTNESS. A key seed used in one split is never reused in
//      another, and the fixed code pools of the pool-recognition task are disjoint
//      between splits. A pool shared across splits turns recognition into memorization.
//
// Splits are assigned from the COLLECTION, not the document, so a whole collection can
// be held out when a question is about generalizing beyond a body of material.
const SPLITS = ['development', 'test'];
// Collections marked development are the only material thresholds or budgets may be
// tuned on. Everything else is reported as a held-out measurement.
const COLLECTION_SPLIT = {
  // The only tuning material: the probes the language-profile abstention thresholds
  // were calibrated on. Nothing else may be tuned against.
  'language-development-probes': 'development',
  'museum-prose-en': 'test',
  'museum-prose-fr': 'test',
  'gutenberg-pre1800': 'test',
  'authentic-z340': 'test'
};
// Key seeds are allocated from per-split disjoint ranges.
const SEED_RANGES = { development: [10000, 19999], test: [20000, 29999] };
const POOL_RANGES = { development: [30000, 30999], test: [31000, 31999] };

function splitOf(collection) {
  const split = COLLECTION_SPLIT[collection];
  if (!split) throw new Error('Unknown collection: ' + collection);
  return split;
}
// Deterministic, order-independent seed allocation inside a split's own range.
function seedFor(split, label, kind) {
  const range = (kind === 'pool' ? POOL_RANGES : SEED_RANGES)[split];
  if (!range) throw new Error('Unknown split: ' + split);
  let h = 2166136261;
  for (let i = 0; i < label.length; i++) { h ^= label.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return range[0] + (h % (range[1] - range[0] + 1));
}
// Check the rules rather than trusting them: used by the evaluation and by its test.
function audit(items) {
  const problems = [];
  const splitByDocument = new Map();
  const seedsBySplit = new Map();
  const poolsBySplit = new Map();
  for (const item of items) {
    const prior = splitByDocument.get(item.sourceDocument);
    if (prior && prior !== item.split) {
      problems.push('Source document ' + item.sourceDocument + ' appears in both ' + prior + ' and ' + item.split + '.');
    }
    splitByDocument.set(item.sourceDocument, item.split);
    if (item.keySeed !== undefined && item.keySeed !== null) {
      if (!seedsBySplit.has(item.split)) seedsBySplit.set(item.split, new Set());
      seedsBySplit.get(item.split).add(item.keySeed);
      const range = SEED_RANGES[item.split];
      if (item.keySeed < range[0] || item.keySeed > range[1]) {
        problems.push('Key seed ' + item.keySeed + ' is outside the ' + item.split + ' range.');
      }
    }
    if (item.poolId !== undefined && item.poolId !== null) {
      if (!poolsBySplit.has(item.split)) poolsBySplit.set(item.split, new Set());
      poolsBySplit.get(item.split).add(item.poolId);
    }
  }
  const splits = Array.from(seedsBySplit.keys());
  for (let i = 0; i < splits.length; i++) for (let j = i + 1; j < splits.length; j++) {
    for (const seed of seedsBySplit.get(splits[i])) {
      if (seedsBySplit.get(splits[j]).has(seed)) problems.push('Key seed ' + seed + ' is shared by ' + splits[i] + ' and ' + splits[j] + '.');
    }
  }
  const poolSplits = Array.from(poolsBySplit.keys());
  for (let i = 0; i < poolSplits.length; i++) for (let j = i + 1; j < poolSplits.length; j++) {
    for (const pool of poolsBySplit.get(poolSplits[i])) {
      if (poolsBySplit.get(poolSplits[j]).has(pool)) problems.push('Code pool ' + pool + ' is shared by ' + poolSplits[i] + ' and ' + poolSplits[j] + '.');
    }
  }
  return { ok: problems.length === 0, problems,
    documents: splitByDocument.size, items: items.length,
    perSplit: Object.fromEntries(SPLITS.map(s => [s, items.filter(i => i.split === s).length])) };
}
module.exports = { SPLITS, COLLECTION_SPLIT, SEED_RANGES, POOL_RANGES, splitOf, seedFor, audit };
```


## JavaScript — sw.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `sw.js`
- Served SHA-256: `b2ba995963c5f085569d04e11ceaedbfcea64f1a9e0c207e440ba100451e0606`
- Readable-source SHA-256: `b2ba995963c5f085569d04e11ceaedbfcea64f1a9e0c207e440ba100451e0606`


```javascript
/**
 * THE CIPHER MUSEUM — Service Worker
 * Offline support for classrooms and flaky connections.
 *
 * Strategy:
 *   - HTML navigations: network-first, falling back to cache (content stays fresh
 *     online; cached pages may be available offline while their assets remain cached).
 *   - JavaScript: network-first with cached fallback, so corrected models arrive
 *     with the exhibit text on the first online visit.
 *   - Other static assets (css/images/json): cache-first with background refresh.
 *   - Requests under /public/, including corpus samples and reports, bypass this cache.
 *
 * VERSION is stamped automatically by `npm run build:js` from a hash of every
 * asset served cache-first — the minified bundles, the non-HTML entries of
 * CORE below, the offline fallback page, and this worker's policy (scripts/sw-version.js).
 * tests/test-sw-version.js fails the suite if it drifts. Old caches are purged
 * on activate, so adding an asset to CORE also re-stamps VERSION.
 */
'use strict';

const VERSION = 'cipher-museum-bef91e41';

const CORE = [
  '/ciphers/gripenstierna.html',
  '/lab/kisses.html',
  '/js/codebreaking-evidence.js',
  '/css/codebreaking-evidence.css',
  '/lab/intercept-to-intelligence.html',
  '/js/intercept-exercise.js',
  '/js/structure-exercises.js',
  '/js/egyptian-case.js',
  '/js/maya-case.js',
  '/lab/reading-the-evidence.html',
  '/js/reading-evidence.js',
  '/lab/traffic-analysis.html',
  '/lab/purple-diagnosis.html',
  '/js/purple-diagnosis.js',
  '/lab/working-is-not-secure.html',
  '/js/working-not-secure.js',
  '/js/traffic-analysis.js',
  '/css/traffic-analysis.css',
  '/css/evidence-exercises.css',
  '/js/evidence-exercises.js',
  '/first-codebreak.html',
  '/classical-guide.html',
  '/codebreak-worksheet.html',
  '/codebreak-answers.html',
  '/css/first-codebreak.css',
  '/js/first-codebreak.js',
  '/',
  '/index.html',
  '/offline.html',
  '/ciphers/myszkowski.html',
  '/ciphers/turning-grille.html',
  '/ciphers/hagelin-c36.html',
  '/ciphers/nema.html',
  '/ciphers/rs44.html',
  '/ciphers/double-playfair.html',
  '/ciphers/amsco.html',
  '/css/manual-cipher-demos.css',
  '/js/manual-cipher-demos.js',
  '/css/multiple-anagramming.css',
  '/js/multiple-anagramming.js',
  '/css/pad-experiments.css',
  '/js/pad-experiments.js',
  '/js/secrecy-experiments.js',
  '/css/detective-workspaces.css',
  '/js/detective/workspaces.js',
  '/js/detective/playback.js',
  '/js/detective/lang-model.js',
  '/lab/evidence-workbench.html',
  '/lab/decipherment-cases.html',
  '/lab/modern-attack-evidence.html',
  '/ciphers/ua-8295.html',
  '/ciphers/sodark.html',
  '/ciphers/nfc-deployment.html',
  '/css/research-workbench.css',
  '/js/research-model.js',
  '/js/research-worker.js',
  '/js/research-language-model.js',
  '/data/research/v1/language-model.json',
  '/js/research-ui.js',
  '/js/research-cases.js',
  '/data/research/v1/z340-section-1.json',
  '/js/ciphers/all-engines.min.js',
  '/css/museum.css',
  '/css/reader-companion.css',
  '/js/reader-companion.js',
  '/js/book-trail.js',
  '/js/book-invitation-demos.js',
  '/css/book-invitation-demos.css',
  '/css/historical-demos.css',
  '/js/historical-ciphers.js',
  '/js/historical-demos.js',
  '/js/nav.js',
  '/js/footer.js',
  '/js/breadcrumbs.js',
  '/js/ui-delegates.js',
  '/js/trust-labels.js',
  '/js/search.js',
  '/js/search-index.json',
  '/js/artifact-cards.js',
  '/js/artifact-cards-data.min.js',
  '/js/demo-loader.min.js',
  '/js/lightbox.js',
  '/fonts/noto-sans-egyptian-hieroglyphs-subset.woff2',
  '/fonts/cinzel-400-latin-ext.woff2',
  '/fonts/cinzel-400-latin.woff2',
  '/fonts/cinzel-600-latin-ext.woff2',
  '/fonts/cinzel-600-latin.woff2',
  '/fonts/cinzel-700-latin-ext.woff2',
  '/fonts/cinzel-700-latin.woff2',
  '/fonts/cormorant-garamond-italic-300-latin-ext.woff2',
  '/fonts/cormorant-garamond-italic-300-latin.woff2',
  '/fonts/cormorant-garamond-italic-400-latin-ext.woff2',
  '/fonts/cormorant-garamond-italic-400-latin.woff2',
  '/fonts/cormorant-garamond-italic-600-latin-ext.woff2',
  '/fonts/cormorant-garamond-italic-600-latin.woff2',
  '/fonts/cormorant-garamond-300-latin-ext.woff2',
  '/fonts/cormorant-garamond-300-latin.woff2',
  '/fonts/cormorant-garamond-400-latin-ext.woff2',
  '/fonts/cormorant-garamond-400-latin.woff2',
  '/fonts/cormorant-garamond-600-latin-ext.woff2',
  '/fonts/cormorant-garamond-600-latin.woff2',
  '/fonts/cormorant-garamond-700-latin-ext.woff2',
  '/fonts/cormorant-garamond-700-latin.woff2',
  '/fonts/jetbrains-mono-300-latin-ext.woff2',
  '/fonts/jetbrains-mono-300-latin.woff2',
  '/fonts/jetbrains-mono-400-latin-ext.woff2',
  '/fonts/jetbrains-mono-400-latin.woff2',
  '/fonts/jetbrains-mono-500-latin-ext.woff2',
  '/fonts/jetbrains-mono-500-latin.woff2',
  '/fonts/jetbrains-mono-700-latin-ext.woff2',
  '/fonts/jetbrains-mono-700-latin.woff2',
  '/hall-of-foundations/index.html',
  '/hall-of-foundations/foundations.css',
  '/images/icons.svg',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/images/icons/icon-192.png',
  '/images/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Bypass all /public/ requests, including corpus downloads, samples and reports.
  if (url.pathname.startsWith('/public/')) return;

  if (req.mode === 'navigate') {
    // Network-first for pages. An unvisited exhibit must display an explicit
    // offline notice, not the homepage at an exhibit URL with broken relative
    // assets (or misleading homepage content).
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/offline.html')))
    );
    return;
  }

  if (url.pathname.endsWith('.js')) {
    const cachedScript = async () => {
      const cache = await caches.open(VERSION);
      // Versioned exhibit URLs use the precached current bundle while offline.
      return (await cache.match(req)) || cache.match(url.pathname);
    };
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then(async (res) => {
          if (!res.ok) return (await cachedScript()) || res;
          try {
            const cache = await caches.open(VERSION);
            await cache.put(req, res.clone());
          } catch (_) { /* A full cache must not discard a successful network response. */ }
          return res;
        })
        .catch(async (error) => {
          const hit = await cachedScript();
          if (hit) return hit;
          throw error;
        })
    );
    return;
  }

  // Cache-first with background refresh for the remaining static assets.
  event.respondWith(
    caches.match(req).then((hit) => {
      const refresh = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || refresh;
    })
  );
});
```
