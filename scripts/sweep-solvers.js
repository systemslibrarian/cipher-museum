#!/usr/bin/env node
'use strict';
// Bounded solver tuning sweep. Does tuning let beam search beat simulated annealing?
//
// PRE-REGISTERED PROTOCOL, fixed before any result was read:
//
//   Inputs      The 13 `full-2hom` items of research-evaluation v2, one per source
//               document, under their declared per-split key seeds. No item is added,
//               dropped or reweighted after seeing a result.
//   Grid        beam width   : 50, 150, 400, 1000
//               scoring      : frequency-penalty weight 0.0, 1.5 (the shipped model), 3.0
//               = 12 beam configurations.
//   Reference   Simulated annealing at the shipped 6,000-step budget, and again at a
//               high budget, under each of the same three scoring weights = 6 rows.
//               The high budget was registered as 60,000 steps; the shipped solver
//               refuses that on the longest item here (343 tokens x 60,000 exceeds its
//               20-million-evaluation ceiling), so the row uses 50,000 steps, the
//               largest round budget it accepts for EVERY item. Noted before any
//               result was read; it only gives annealing more compute, not less.
//   Budget      One run per cell per item. Branch factor fixed at 26. No restarts, no
//               best-of-n, no per-item tuning. Hard ceiling: 18 cells x 13 items.
//   Metric      Mean plaintext edit error, mean key error, exact recoveries, mean
//               runtime. Decided in advance: beam "wins" only if some cell beats the
//               shipped annealing row on mean plaintext error.
//   Seeds       Annealing uses seed 41 throughout, as in the published evaluation.
//               Beam search is deterministic and takes no seed.
//
// Nothing here is a blind benchmark: these fixtures are public and visible.
const fs = require('node:fs'), path = require('node:path');
const root = path.join(__dirname, '..');
const R = require('../js/research-model');
const Lang = require('../js/research-language-model');
const splits = require('./research-splits');
const modelData = require('../data/research/v1/language-model.json');
const corpus = require('../data/research/v2/corpus.json');
const holdout = require('../data/research/v2/holdout.json');

const BEAMS = [50, 150, 400, 1000];
const PENALTIES = [0, 1.5, 3];
const ANNEAL_STEPS = [6000, 50000];
const BRANCH = 26, SEED = 41;

const letters = t => t.toUpperCase().normalize('NFD').replace(/[^A-Z]/g, '');
const round = (n, p = 4) => Number(n.toFixed(p));
// A scoring variant is the same quadgram model with a different declared weight on the
// unigram-distribution penalty. Nothing else about the model changes.
const scorerFor = penalty => Lang.build(Object.assign({}, modelData, { frequencyPenalty: penalty })).fitness;

function encrypt(plaintext, seed, homophones) {
  const random = R.rng(seed), present = [...new Set(plaintext)];
  const pool = Array.from({ length: present.length * homophones }, (_, i) => 'g' + i);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const key = {}, byLetter = {};
  present.forEach((c, i) => { byLetter[c] = pool.slice(homophones * i, homophones * (i + 1)); byLetter[c].forEach(s => { key[s] = c; }); });
  const tokens = Array.from(plaintext, c => byLetter[c][Math.floor(random() * homophones)]);
  return { tokens, key: Object.fromEntries(Object.entries(key).filter(([s]) => tokens.includes(s))) };
}

const documents = corpus.documents.map(d => ({ id: d.id, collection: d.collection, text: letters(d.text) }))
  .concat(holdout.passages.map(p => ({ id: p.id, collection: 'gutenberg-pre1800', text: letters(p.text) })));
const items = documents.map(doc => {
  const split = splits.splitOf(doc.collection);
  return { id: doc.id + ':full-2hom', sourceDocument: doc.id, plaintext: doc.text,
    keySeed: splits.seedFor(split, doc.id + ':full-2hom', 'key') };
}).filter(i => i.plaintext.length >= 60);

function cell(label, run) {
  const rows = [];
  const start = process.hrtime.bigint();
  for (const item of items) {
    const e = encrypt(item.plaintext, item.keySeed, 2);
    const t0 = process.hrtime.bigint();
    const result = run(e.tokens);
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    const m = R.metrics(item.plaintext, result.candidates[0].plaintext, e.key, result.candidates[0].key);
    rows.push({ id: item.id, plaintextError: m.plaintextError, keyError: m.keyError, exact: m.exact, ms });
  }
  const mean = f => rows.reduce((a, r) => a + r[f], 0) / rows.length;
  return { label, items: rows.length, plaintextError: round(mean('plaintextError')), keyError: round(mean('keyError')),
    exact: rows.filter(r => r.exact).length, meanMs: round(mean('ms'), 1),
    totalMs: round(Number(process.hrtime.bigint() - start) / 1e6, 0) };
}

const cells = [];
for (const penalty of PENALTIES) {
  const score = scorerFor(penalty);
  for (const steps of ANNEAL_STEPS) {
    cells.push(Object.assign({ solver: 'annealing', beam: null, steps, penalty },
      cell('annealing steps=' + steps + ' penalty=' + penalty,
        tokens => R.search(tokens, { seed: SEED, steps, locks: {} }, score))));
  }
  for (const beam of BEAMS) {
    cells.push(Object.assign({ solver: 'beam-search', beam, steps: null, penalty },
      cell('beam=' + beam + ' penalty=' + penalty,
        tokens => R.beamSearch(tokens, { beam, branch: BRANCH, locks: {} }, score))));
  }
}

const shipped = cells.find(c => c.solver === 'annealing' && c.steps === 6000 && c.penalty === 1.5);
const bestBeam = cells.filter(c => c.solver === 'beam-search')
  .reduce((a, b) => (b.plaintextError < a.plaintextError ? b : a));
const bestAnneal = cells.filter(c => c.solver === 'annealing')
  .reduce((a, b) => (b.plaintextError < a.plaintextError ? b : a));

const report = {
  version: 1, id: 'museum-solver-sweep-v1',
  question: 'Does tuning beam width or the scoring weight let beam search beat simulated annealing on this material?',
  protocol: { inputs: items.length + ' full-2hom items, one per source document, at their declared split key seeds',
    grid: { beam: BEAMS, frequencyPenalty: PENALTIES, branch: BRANCH },
    reference: { solver: 'annealing', steps: ANNEAL_STEPS, seed: SEED,
      budgetNote: 'The high annealing budget was registered as 60,000 steps. The shipped solver caps total symbol evaluations at 20 million, which 60,000 steps exceeds on the longest item (343 tokens), so the row uses 50,000 steps - the largest round budget accepted for every item. Recorded before any result was read, and it only grants annealing more compute.' },
    cells: cells.length, runsPerCell: items.length,
    decidedInAdvance: 'Beam search wins only if some cell beats the shipped annealing row (6,000 steps, penalty 1.5) on mean plaintext error.',
    registeredBefore: 'The grid, budget and win condition are fixed in the header of scripts/sweep-solvers.js and were not changed after any result was read.' },
  cells,
  shippedAnnealing: shipped,
  bestBeamCell: bestBeam,
  bestAnnealingCell: bestAnneal,
  beamBeatsShippedAnnealing: bestBeam.plaintextError < shipped.plaintextError,
  beamBeatsBestAnnealing: bestBeam.plaintextError < bestAnneal.plaintextError,
  limits: [
    'Thirteen public fixtures, not a blind benchmark.',
    'One run per cell per item. Annealing is stochastic; a different seed would move its numbers.',
    'Only two knobs were swept. A different partial-scoring function or extension order is a different experiment, not covered here.',
    'Runtime is a machine-dependent Node.js measurement on one laptop.'
  ]
};
const out = path.join(root, 'data/research/v2/solver-sweep.json');
fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
console.log(['solver', 'beam', 'steps', 'penalty', 'plaintextErr', 'keyErr', 'exact', 'meanMs'].join('\t'));
for (const c of cells) console.log([c.solver, c.beam ?? '-', c.steps ?? '-', c.penalty,
  (100 * c.plaintextError).toFixed(1) + '%', (100 * c.keyError).toFixed(1) + '%', c.exact + '/' + c.items, c.meanMs].join('\t'));
console.log('\nbest beam cell: ' + bestBeam.label + ' at ' + (100 * bestBeam.plaintextError).toFixed(1) + '%');
console.log('shipped annealing: ' + (100 * shipped.plaintextError).toFixed(1) + '%');
console.log('beam beats shipped annealing: ' + report.beamBeatsShippedAnnealing);
