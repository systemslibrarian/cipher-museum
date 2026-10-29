#!/usr/bin/env node
'use strict';
// Research-evaluation v2. A declared task matrix, with grouping and disjointness rules
// that are audited rather than assumed. Public demonstrations, not a blind benchmark:
// every fixture and key in this repository is visible to anyone who looks.
//
// Version 1 is NOT replaced. Its fixtures, identifiers and published failures stay
// exactly where they are, and v2 reruns the v1 English and French cases so the
// baseline numbers remain visible beside the new ones.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const R = require('../js/research-model');
const Lang = require('../js/research-language-model');
const splits = require('./research-splits');
const baseline = Lang.build(require('../data/research/v1/language-model.json'));
const profileData = require('../data/research/v2/language-profiles.json');
const profiles = Lang.buildProfiles(profileData);
const corpus = require('../data/research/v2/corpus.json');
const holdout = require('../data/research/v2/holdout.json');
const z340 = require('../data/research/v1/z340-section-1.json');
const hash = f => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex');
const letters = t => t.toUpperCase().normalize('NFD').replace(/[^A-Z]/g, '');
const round = (n, p = 4) => Number(n.toFixed(p));

// ── Fixture construction ────────────────────────────────────────────────────
// Independent key: a fresh homophone assignment drawn for this one text.
function encryptIndependent(plaintext, seed, homophones) {
  const random = R.rng(seed), present = [...new Set(plaintext)];
  const pool = Array.from({ length: present.length * homophones }, (_, i) => 'g' + i);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const key = {}, byLetter = {};
  present.forEach((c, i) => { byLetter[c] = pool.slice(homophones * i, homophones * (i + 1)); byLetter[c].forEach(s => { key[s] = c; }); });
  const tokens = Array.from(plaintext, c => byLetter[c][Math.floor(random() * homophones)]);
  return { tokens, key: Object.fromEntries(Object.entries(key).filter(([s]) => tokens.includes(s))) };
}
// Fixed code pool: one global symbol-to-letter map reused by every text in its split.
// This is structurally a DIFFERENT task from independent-key recovery.
function buildPool(seed, homophones) {
  const random = R.rng(seed), alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const pool = Array.from({ length: 26 * homophones }, (_, i) => 'p' + i);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const key = {}, byLetter = {};
  Array.from(alphabet).forEach((c, i) => { byLetter[c] = pool.slice(homophones * i, homophones * (i + 1)); byLetter[c].forEach(s => { key[s] = c; }); });
  return { key, byLetter };
}
function encryptWithPool(plaintext, pool, seed) {
  const random = R.rng(seed);
  const tokens = Array.from(plaintext, c => { const options = pool.byLetter[c]; return options[Math.floor(random() * options.length)]; });
  return { tokens, key: Object.fromEntries(Object.entries(pool.key).filter(([s]) => tokens.includes(s))) };
}

const documents = corpus.documents.map(d => ({ id: d.id, collection: d.collection, language: d.language, text: letters(d.text) }))
  .concat(holdout.passages.map(p => ({ id: p.id, collection: 'gutenberg-pre1800',
    language: profileData.profiles.find(x => x.id === p.profile).language + ' (' + profileData.profiles.find(x => x.id === p.profile).period + ')',
    profile: p.profile, text: letters(p.text) })));

// Variants of one source plaintext: full and truncated, two independent keys, and a
// two- versus three-homophone key. All of them stay in the source's own split.
const VARIANTS = [
  { id: 'full-2hom', length: null, homophones: 2 },
  { id: 'full-3hom', length: null, homophones: 3 },
  { id: 'short-2hom', length: 120, homophones: 2 }
];
const items = [];
for (const doc of documents) for (const v of VARIANTS) {
  const split = splits.splitOf(doc.collection);
  const plaintext = v.length ? doc.text.slice(0, v.length) : doc.text;
  if (plaintext.length < 60) continue;
  items.push({ id: doc.id + ':' + v.id, sourceDocument: doc.id, collection: doc.collection, split,
    language: doc.language, profile: doc.profile || null, variant: v.id, homophones: v.homophones,
    plaintext, keySeed: splits.seedFor(split, doc.id + ':' + v.id, 'key'),
    poolId: 'pool-' + splits.seedFor(split, doc.collection, 'pool') });
}
const grouping = splits.audit(items);
if (!grouping.ok) { console.error('Split rules violated:\n  ' + grouping.problems.join('\n  ')); process.exit(1); }

// Small enough to run inside the test suite on every change. A larger budget is a
// separate experiment, not a different conclusion about which task is which.
const BUDGET = { seed: 41, steps: 6000, beam: 150, branch: 26 };
function timed(fn) {
  const before = process.memoryUsage().heapUsed, start = process.hrtime.bigint();
  const value = fn();
  return { value, ms: Number(process.hrtime.bigint() - start) / 1e6,
    heapDeltaBytes: Math.max(0, process.memoryUsage().heapUsed - before) };
}
function summarize(rows, fields) {
  const out = { denominator: rows.length };
  for (const f of fields) {
    const values = rows.map(r => r[f]).filter(v => typeof v === 'number' && Number.isFinite(v));
    out[f] = values.length ? { n: values.length, mean: round(values.reduce((a, b) => a + b, 0) / values.length),
      min: round(Math.min(...values)), max: round(Math.max(...values)) } : null;
  }
  return out;
}

// ── Task 1: independent-key plaintext and key recovery ──────────────────────
const independent = [];
for (const item of items) {
  const e = encryptIndependent(item.plaintext, item.keySeed, item.homophones);
  const anneal = timed(() => R.search(e.tokens, { seed: BUDGET.seed, steps: BUDGET.steps, locks: {} }, baseline.fitness));
  const beam = timed(() => R.beamSearch(e.tokens, { seed: BUDGET.seed, beam: BUDGET.beam, branch: BUDGET.branch, locks: {} }, baseline.fitness));
  const am = R.metrics(item.plaintext, anneal.value.candidates[0].plaintext, e.key, anneal.value.candidates[0].key);
  const bm = R.metrics(item.plaintext, beam.value.candidates[0].plaintext, e.key, beam.value.candidates[0].key);
  const renamed = e.tokens.map(s => 'relabel-' + s);
  independent.push({ id: item.id, split: item.split, collection: item.collection, sourceDocument: item.sourceDocument,
    language: item.language, tokens: e.tokens.length, symbols: Object.keys(e.key).length, homophones: item.homophones,
    annealing: { exact: am.exact, plaintextError: round(am.plaintextError), keyError: round(am.keyError), ms: round(anneal.ms, 1), heapDeltaBytes: anneal.heapDeltaBytes },
    beamSearch: { exact: bm.exact, plaintextError: round(bm.plaintextError), keyError: round(bm.keyError), ms: round(beam.ms, 1), heapDeltaBytes: beam.heapDeltaBytes },
    relabellingInvariant: {
      annealing: JSON.stringify(R.search(renamed, { seed: BUDGET.seed, steps: BUDGET.steps, locks: {} }, baseline.fitness).candidates.map(c => [c.plaintext, c.score]))
        === JSON.stringify(anneal.value.candidates.map(c => [c.plaintext, c.score])),
      beamSearch: JSON.stringify(R.beamSearch(renamed, { seed: BUDGET.seed, beam: BUDGET.beam, branch: BUDGET.branch, locks: {} }, baseline.fitness).candidates.map(c => [c.plaintext, c.score]))
        === JSON.stringify(beam.value.candidates.map(c => [c.plaintext, c.score])) },
    knownKeyApplication: R.search(e.tokens, { seed: BUDGET.seed, steps: BUDGET.steps, locks: e.key }, baseline.fitness).candidates[0].plaintext === item.plaintext });
}

// ── Task 2: fixed-code-pool recognition ─────────────────────────────────────
// Same symbols across every text in the split. Recovering a map you have already seen
// is not the same problem as recovering a key drawn for one message.
const poolItems = items.filter(i => i.variant === 'full-2hom');
const pools = new Map();
const poolTask = poolItems.map(item => {
  if (!pools.has(item.poolId)) pools.set(item.poolId, buildPool(Number(item.poolId.split('-').pop()), 2));
  const pool = pools.get(item.poolId);
  const e = encryptWithPool(item.plaintext, pool, item.keySeed);
  const observed = Object.keys(e.key).length;
  // With the pool known, this is pure application; with it unknown, it is still search.
  const applied = R.applyKey(e.tokens, Object.entries(e.key).map(([symbol, v]) => ({ symbol, type: 'letter', values: [v] })));
  const search = R.search(e.tokens, { seed: BUDGET.seed, steps: BUDGET.steps, locks: {} }, baseline.fitness);
  const m = R.metrics(item.plaintext, search.candidates[0].plaintext, e.key, search.candidates[0].key);
  return { id: item.id, split: item.split, poolId: item.poolId, poolSymbols: Object.keys(pool.key).length,
    symbolsSeenInThisText: observed, poolCoverage: round(observed / Object.keys(pool.key).length),
    knownPoolExact: applied.text === item.plaintext, knownPoolUnresolved: applied.unresolved,
    unknownPoolPlaintextError: round(m.plaintextError), unknownPoolKeyError: round(m.keyError) };
});

// ── Task 3: authentic known-key replay ──────────────────────────────────────
const replay = {
  id: z340.id, kind: z340.kind, task: 'known-key replay',
  symbols: new Set(z340.ciphertext).size, positions: R.z340Route().length,
  correctRouteExact: R.z340Route().map(i => z340.key[z340.ciphertext[i]]).join('') === z340.expectedDiplomatic,
  wrongRouteExact: R.z340Route('row-major').map(i => z340.key[z340.ciphertext[i]]).join('') === z340.expectedDiplomatic,
  fullZ340Recovery: false,
  meaning: 'A published key applied along a published route. Nothing here is key recovery, and the later sections of Z340 are not reproduced.'
};

// ── Task 4: transcription ───────────────────────────────────────────────────
const transcription = (() => {
  const clean = 'ABCDEFGHIJKL', damaged = 'AB?DEFG?IJKL';
  let rejected = false;
  try { R.parseSymbols(damaged.split('').join(' ')); } catch (_) { rejected = true; }
  const glyph = R.metrics(clean, damaged);
  return { input: damaged, glyphError: round(glyph.plaintextError),
    unresolvedCoverage: round((damaged.match(/\?/g) || []).length / damaged.length),
    searchRejected: rejected, plaintextError: null,
    meaning: 'Glyph error and unresolved coverage are reported separately from plaintext error, which is undefined while glyphs are missing. Unknown glyphs are never silently deleted to make a letter-only search run.' };
})();

// ── Task 5: numerical segmentation ──────────────────────────────────────────
// Short cases are checked against an exhaustive oracle, so the lattice is verified
// rather than trusted. Boundary error is reported apart from plaintext error.
function oracle(digits, key) {
  const out = [];
  (function walk(pos, codes, text) {
    if (pos === digits.length) { out.push({ codes: codes.slice(), text }); return; }
    for (const [code, value] of Object.entries(key)) {
      if (digits.startsWith(code, pos)) walk(pos + code.length, codes.concat(code), text + (typeof value === 'string' ? value : (value.type === 'null' ? '' : value.values[0])));
    }
  })(0, [], '');
  return out;
}
const segmentation = (() => {
  const cases = [];
  const basic = { '2': 'A', '22': 'N', '8': 'D' };
  const withNull = { '2': 'A', '22': 'N', '8': 'D', '0': { type: 'null', values: [] } };
  const withWord = { '2': 'A', '22': { type: 'word', values: ['AND', 'ALSO'] }, '8': 'D' };
  const specs = [
    { id: 'ambiguous-2228', digits: '2228', key: basic, boundaries: [], expected: ['AAAD', 'AND', 'NAD'] },
    { id: 'locked-boundary', digits: '2228', key: basic, boundaries: [1], expected: ['AAAD', 'AND'] },
    { id: 'wrong-key', digits: '2228', key: { '22': 'N', '8': 'D' }, boundaries: [], expected: [] },
    { id: 'leading-zero-null', digits: '20228', key: withNull, boundaries: [], expected: null },
    { id: 'word-code-alternatives', digits: '2228', key: withWord, boundaries: [], expected: null },
    { id: 'line-boundary', digits: '22\n28', key: basic, boundaries: [], expected: null }
  ];
  for (const spec of specs) {
    const result = R.segment(spec.digits, spec.key, spec.boundaries, 10000, () => 0);
    const reference = spec.digits.includes('\n') ? null : oracle(spec.digits, spec.key)
      .filter(p => spec.boundaries.every(b => { let acc = 0; return p.codes.some(c => { acc += c.length; return acc === b; }) || b === 0; }));
    cases.push({ id: spec.id, digits: spec.digits, mode: result.mode, complete: result.complete,
      globalBestGuaranteed: result.globalBestGuaranteed, total: result.total, retained: result.retained,
      readings: result.paths.map(p => p.text).sort(),
      expectedReadings: spec.expected, matchesExpected: spec.expected ? JSON.stringify(result.paths.map(p => p.text).sort()) === JSON.stringify(spec.expected.slice().sort()) : null,
      matchesExhaustiveOracle: reference ? reference.length === result.total : null,
      ambiguousPositions: result.ambiguity.filter(a => !a.forced && !a.impossible).map(a => a.position),
      alternativeReadings: result.paths.flatMap(p => p.alternatives).length });
  }
  // Budget cutoff: the k-best mode must say that the global best is no longer guaranteed.
  const capped = R.segment('2'.repeat(20), { '2': 'A', '22': 'N' }, [], 1000, () => 0);
  // Segmentation error is not plaintext error.
  const boundary = R.segmentMetrics(['2', '22', '8'], ['22', '2', '8']);
  return { cases,
    cutoff: { digits: 20, total: capped.total, retained: capped.retained, complete: capped.complete,
      mode: capped.mode, globalBestGuaranteed: capped.globalBestGuaranteed, pruning: capped.pruning },
    boundaryVersusPlaintext: { codesA: ['2', '22', '8'], codesB: ['22', '2', '8'],
      boundaryMetrics: boundary,
      plaintextA: 'AND', plaintextB: 'NAD',
      plaintextError: round(R.metrics('AND', 'NAD').plaintextError),
      meaning: 'Two readings of the same digits differ in one boundary and in two letters. The two errors are different measurements and are reported apart.' } };
})();

// ── Task 6: language and historical-domain shift ────────────────────────────
const languageShift = (() => {
  const rows = [];
  for (const passage of holdout.passages) {
    const text = letters(passage.text);
    const comparison = profiles.compare(text);
    const expected = passage.profile;
    rows.push({ id: passage.id, split: 'test', expectedProfile: expected,
      decided: comparison.decided, choice: comparison.choice, correct: comparison.decided ? comparison.choice === expected : null,
      margin: round(comparison.margin, 3), letters: text.length,
      ranking: comparison.ranking.map(r => ({ id: r.id, meanLogProbability: round(r.meanLogProbability, 3), coverage: round(r.coverage) })),
      abstentionReasons: comparison.abstentionReasons });
  }
  // Controls: a language with no profile, and text with no planted language at all.
  const controls = [
    { id: 'absent-language-english', text: letters(corpus.documents[0].text), expected: null,
      note: 'English has no profile. Any decision here is a false positive.' },
    { id: 'modern-french-domain-shift', text: letters(corpus.documents[2].text), expected: 'historical-french-1580',
      note: 'Right language, wrong period. A profile names both; ranking it first is correct about the language and silent about the period.' },
    { id: 'random-control', text: 'QXZJKVWQPZXJKVQWZXJPKVQWZXJKPVQWZXJKVPQWZXJKVQPWZXJKVQZ', expected: null,
      note: 'No planted language. Abstention is the only correct outcome.' }
  ].map(c => { const r = profiles.compare(c.text);
    return { id: c.id, note: c.note, expectedProfile: c.expected, decided: r.decided, choice: r.choice,
      correct: c.expected === null ? !r.decided : (r.decided && r.choice === c.expected),
      margin: round(r.margin, 3), letters: c.text.length, abstentionReasons: r.abstentionReasons }; });
  const decided = rows.filter(r => r.decided);
  return { passages: rows, controls,
    summary: { denominator: rows.length, decided: decided.length, abstained: rows.length - decided.length,
      correctWhenDecided: decided.filter(r => r.correct).length,
      perLanguage: Object.fromEntries(profileData.profiles.map(p => {
        const mine = rows.filter(r => r.expectedProfile === p.id);
        const got = mine.filter(r => r.decided && r.correct);
        return [p.id, { denominator: mine.length, decided: mine.filter(r => r.decided).length, correct: got.length }];
      })) },
    unresolvedCoverage: 'German, Spanish, English and every other language in the historical record have no profile. A text in one of them can only be abstained on or mis-assigned; it can never be identified.' };
})();

const report = {
  version: 2, id: 'museum-research-evaluation-v2',
  generatedBy: 'scripts/evaluate-research-v2.js',
  relationToV1: 'Research-evaluation v1 is unchanged and still published. Its three fixtures and their failures are rerun here as the museum-prose baseline; v2 adds tasks and material rather than replacing results.',
  scope: 'Public demonstrations. Every fixture, key and seed in this repository is visible, so none of this is a blind benchmark, and none of it may be quoted as general historical-decipherment accuracy.',
  budgets: BUDGET,
  hashes: { solver: hash('js/research-model.js'), scorer: hash('js/research-language-model.js'),
    baselineModel: hash('data/research/v1/language-model.json'), profiles: hash('data/research/v2/language-profiles.json'),
    corpus: hash('data/research/v2/corpus.json'), holdout: hash('data/research/v2/holdout.json'),
    splitRules: hash('scripts/research-splits.js') },
  models: { baseline: baseline.id, profiles: profiles.profiles.map(p => p.id) },
  grouping: Object.assign({ rules: 'All variants of one source document share a split; key seeds and code pools are drawn from per-split disjoint ranges. Audited on every run by scripts/research-splits.js.' }, grouping),
  tasks: {
    independentKeyRecovery: { question: 'Given one ciphertext under a key drawn for it alone, how much of the plaintext and key is recovered?',
      items: independent,
      annealing: summarize(independent.map(r => r.annealing), ['plaintextError', 'keyError', 'ms', 'heapDeltaBytes']),
      beamSearch: summarize(independent.map(r => r.beamSearch), ['plaintextError', 'keyError', 'ms', 'heapDeltaBytes']),
      exactRecovery: { annealing: independent.filter(r => r.annealing.exact).length, beamSearch: independent.filter(r => r.beamSearch.exact).length, denominator: independent.length },
      knownKeyApplicationExact: independent.filter(r => r.knownKeyApplication).length,
      relabellingInvariant: { annealing: independent.every(r => r.relabellingInvariant.annealing), beamSearch: independent.every(r => r.relabellingInvariant.beamSearch) } },
    fixedCodePoolRecognition: { question: 'With one global code pool reused across texts, what is actually being measured?',
      items: poolTask,
      knownPoolExact: poolTask.filter(r => r.knownPoolExact).length, denominator: poolTask.length,
      unknownPool: summarize(poolTask, ['unknownPoolPlaintextError', 'unknownPoolKeyError', 'poolCoverage']),
      meaning: 'Applying a pool you already hold is exact and trivial. Recovering it from one short text is not, and a system trained on a shared pool is not doing independent cryptanalysis.' },
    authenticKnownKeyReplay: replay,
    transcription,
    numericalSegmentation: segmentation,
    languageAndDomainShift: languageShift
  },
  limits: [
    'Held-out historical passages come from the same works and authors used to build the profiles. They are unseen by the model but are not independent source documents.',
    'Three languages have profiles. Everything else in the historical record is uncovered.',
    'Budgets are small enough to run inside a test suite. A larger budget is not reported here and would not change the conclusions about which task is which.',
    'Runtime and heap figures are machine-dependent Node.js measurements around a single call, not peak resident size. The reproducibility check deliberately ignores them; every other recorded result must match exactly.',
    'Nothing in this suite is a blind benchmark, and a public fixture does not become one by being renamed.'
  ]
};
const out = path.join(root, 'data/research/v2/evaluation.json');
const encoded = JSON.stringify(report, null, 2) + '\n';
// Runtime and heap figures are machine-dependent, so --check compares everything else.
// A change in any measured result still fails the check; only the resource columns float.
const VOLATILE = new Set(['ms', 'heapDeltaBytes']);
const stable = value => JSON.stringify(value, (key, v) => (VOLATILE.has(key) ? null : v), 2);
if (process.argv.includes('--check')) {
  if (!fs.existsSync(out)) { console.error('Research evaluation v2 has not been generated.'); process.exitCode = 1; }
  else if (stable(JSON.parse(fs.readFileSync(out, 'utf8'))) !== stable(report)) {
    console.error('Research evaluation v2 is stale: a recorded result no longer reproduces.'); process.exitCode = 1;
  } else console.log('Research evaluation v2 reproduces (runtime and heap figures excluded).');
} else fs.writeFileSync(out, encoded);
const t = report.tasks;
console.log('independent-key recovery: ' + t.independentKeyRecovery.annealing.denominator + ' items; annealing mean plaintext error ' +
  (100 * t.independentKeyRecovery.annealing.plaintextError.mean).toFixed(1) + '%, beam search ' +
  (100 * t.independentKeyRecovery.beamSearch.plaintextError.mean).toFixed(1) + '%; exact recoveries ' +
  t.independentKeyRecovery.exactRecovery.annealing + '/' + t.independentKeyRecovery.exactRecovery.beamSearch + ' of ' + t.independentKeyRecovery.exactRecovery.denominator);
console.log('fixed code pool: known-pool exact ' + t.fixedCodePoolRecognition.knownPoolExact + '/' + t.fixedCodePoolRecognition.denominator +
  '; unknown-pool mean plaintext error ' + (100 * t.fixedCodePoolRecognition.unknownPool.unknownPoolPlaintextError.mean).toFixed(1) + '%');
console.log('language shift: ' + t.languageAndDomainShift.summary.correctWhenDecided + ' correct of ' +
  t.languageAndDomainShift.summary.decided + ' decided, ' + t.languageAndDomainShift.summary.abstained + ' abstained, of ' +
  t.languageAndDomainShift.summary.denominator + ' held-out passages');
