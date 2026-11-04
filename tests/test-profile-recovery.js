'use strict';
// These guards deliberately exercise the plausible defects in this experiment:
// baseline-only execution, front-matter leakage, unmatched seeds, incomplete
// controls, fabricated exact recoveries and inaccurate paired arithmetic.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const E = require('../scripts/evaluate-profile-recovery');
const root = path.join(__dirname, '..');
const clone = value => JSON.parse(JSON.stringify(value));
const inputs = E.loadInputs(), fixtures = E.buildCases(inputs), scorers = E.createScorers(inputs);

// Exercise the real solver-to-scorer wiring on a tiny development fixture, without
// using recovery quality to choose any parameter for the historical test sample.
const toyPlaintext = 'ILSEGRETOVIVE', encrypted = E.encrypt(toyPlaintext, 10001, 2);
const toyCase = { id: 'development-wiring-probe', profile: 'historical-italian-1320',
  tokens: encrypted.tokens, expectedKey: encrypted.key, searchSeed: 7, ciphertextSha256: 'development-only' };
const toySource = { plaintext: toyPlaintext };
const toyProtocol = clone(inputs.protocol);
toyProtocol.solvers.annealing.steps = 12;
toyProtocol.solvers['beam-search'].beam = 2;
for (const solver of Object.keys(toyProtocol.solvers)) for (const [id, fitness] of scorers) {
  const result = E.runCondition(toyProtocol, toyCase, toySource, solver, id, fitness);
  assert.equal(result.scoringModelReported, id, 'Actual solver must execute the named scoring model.');
  assert.equal(result.score, fitness(result.plaintext), 'The returned candidate must be scored by that model.');
  assert.ok(result.fitnessEvaluations > 0);
}
assert.throws(() => E.runCondition(toyProtocol, toyCase, toySource, 'annealing',
  'historical-italian-1320', scorers.get('museum-prose-quadgram-v1')),
/Scoring function does not match its condition/, 'A mislabeled baseline function cannot count as a historical-profile experiment.');

assert.equal(E.normalize('Élève Æ Œ ß I J U V'), 'ELEVEAEOESSIJUV', 'Normalization preserves the stated folds and I/J, U/V distinctions.');
assert.equal(fixtures.grouping.documents, 3, 'Thirty cases represent three source works, not thirty documents.');
assert.equal(fixtures.cases.length, 30);
assert.ok(fixtures.sources.every(s => s.editionAsRecordedInV2), 'Keep the original edition metadata attributed to v2.');
assert.ok(fixtures.sources.filter(s => s.source === 'cicero-orationes').every(s => !/with no editorial translation or notes/.test(s.edition)),
  'Reviewed edition metadata must not repeat the old blanket no-editorial-material claim.');
assert.equal(new Set(fixtures.cases.map(c => c.keySeed)).size, 30);
assert.equal(new Set(fixtures.cases.map(c => c.ciphertextSha256)).size, 30);
const leakedAuthor = clone(inputs);
leakedAuthor.protocol.sourceAuthors['brantome-dames-galantes'] = leakedAuthor.protocol.sourceAuthors['montaigne-essais-i'];
assert.throws(() => E.buildCases(leakedAuthor), /Training author leaked/);
const frontMatter = clone(inputs);
frontMatter.protocol.selection.included[0] = 'brantome-dames-galantes-disjoint-1';
frontMatter.protocol.selection.excluded[0].id = 'brantome-dames-galantes-disjoint-2';
assert.throws(() => E.buildCases(frontMatter), /Edition front matter/);
const corruptedText = clone(inputs);
corruptedText.holdout.passages.find(p => p.id === inputs.protocol.selection.included[0]).text += ' changed';
assert.throws(() => E.buildCases(corruptedText), /checksum changed/);

const report = JSON.parse(fs.readFileSync(path.join(root, 'data/research/profile-recovery-v1/evaluation.json'), 'utf8'));
assert.equal(E.validateReport(report), true);
function rejected(change, pattern) {
  const broken = clone(report); change(broken);
  assert.throws(() => E.validateReport(broken), pattern);
}
rejected(r => { r.runs.pop(); }, /full experiment matrix/);
rejected(r => { r.runs[1] = clone(r.runs[0]); }, /Duplicate experiment condition/);
rejected(r => { r.runs[0].options.seed++; }, /Seeds, budgets or locks differ/);
rejected(r => { r.runs[0].options.locks.g0 = 'A'; }, /Seeds, budgets or locks differ/);
rejected(r => { r.runs[0].ciphertextSha256 = '0'.repeat(64); }, /different ciphertext/);
rejected(r => { r.runs.find(x => x.role === 'matched').scoringModelReported = 'museum-prose-quadgram-v1'; }, /wrong scoring model/);
rejected(r => { r.runs.find(x => x.role === 'mismatched').role = 'matched'; }, /labels do not match/);
rejected(r => { r.runs[0].exact = !r.runs[0].exact; }, /Reported exact/);
rejected(r => { r.runs[0].plaintextError += 0.01; }, /Reported plaintextError/);
rejected(r => { r.summary.groups[0].matchedMinusBaseline.mean *= -1; r.summary.groups[0].matchedMinusBaseline.mean += 0.001; }, /aggregate or paired differences/);
rejected(r => { r.hashes['js/research-model.js'] = '0'.repeat(64); }, /Experiment inputs changed/);
for (const group of report.summary.groups.filter(g => g.group === 'overall')) {
  assert.equal(group.baseline.runs, 30);
  assert.equal(group.matched.runs, 30);
  assert.equal(group.mismatched.runs, 60, 'Both mismatched profiles remain visible.');
  assert.equal(group.matchedMinusMeanMismatched.pairs, 30, 'Mismatch controls are averaged within a case before pairing.');
  assert.equal(group.matchedMinusBaseline.matchedWins + group.matchedMinusBaseline.ties + group.matchedMinusBaseline.matchedLosses, 30);
}
console.log('Historical profile recovery: actual scorer wiring, source separation, all paired conditions and deliberately corrupted reports checked.');
