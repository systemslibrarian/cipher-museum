#!/usr/bin/env node
'use strict';
// A separate, versioned experiment: do not overwrite the v1/v2 evaluations.
// Fix protocol.json before running; all conditions and failures are published.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const R = require('../js/research-model');
const Lang = require('../js/research-language-model');
const splits = require('./research-splits');
const ROOT = path.join(__dirname, '..');
const DIR = 'data/research/profile-recovery-v1';
const PROTOCOL_FILE = DIR + '/protocol.json';
const REPORT_FILE = DIR + '/evaluation.json';
const BASELINE_FILE = 'data/research/v1/language-model.json';
const PROFILES_FILE = 'data/research/v2/language-profiles.json';
const INPUTS = [PROTOCOL_FILE, 'scripts/evaluate-profile-recovery.js', 'scripts/research-splits.js',
  'js/research-model.js', 'js/research-language-model.js', BASELINE_FILE, PROFILES_FILE,
  'data/research/v2/holdout-author-disjoint.json'];
const read = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const round = value => Number(value.toFixed(8));
const mean = values => values.reduce((a, b) => a + b, 0) / values.length;
const FOLD = { 'À':'A','Á':'A','Â':'A','Ã':'A','Ä':'A','Å':'A','Æ':'AE','Ç':'C','È':'E','É':'E','Ê':'E','Ë':'E',
  'Ì':'I','Í':'I','Î':'I','Ï':'I','Ñ':'N','Ò':'O','Ó':'O','Ô':'O','Õ':'O','Ö':'O','Ø':'O','Œ':'OE',
  'Ù':'U','Ú':'U','Û':'U','Ü':'U','Ý':'Y','ß':'SS' };
function normalize(text) {
  return Array.from(text.toUpperCase()).map(c => FOLD[c] === undefined ? c : FOLD[c]).join('').replace(/[^A-Z]/g, '');
}
function reviewedEdition(passage) {
  const editions = {
    'brantome-dames-galantes': 'Project Gutenberg eBook 39220. Selected body passages; the first excerpt containing publisher and edition front matter is excluded.',
    'machiavelli-commedie': 'Project Gutenberg eBook 56498. Edited text whose preface describes spelling modernization. Excluding that preface does not undo changes in the body.',
    'cicero-orationes': 'Project Gutenberg eBook 226. Selected Latin oration excerpts; the introductory excerpt is excluded. No blanket claim that this edition lacks editorial material is made.'
  };
  assert.ok(editions[passage.source], 'Every selected edition needs its reviewed scope.');
  return editions[passage.source];
}
function inputHashes() {
  return Object.fromEntries(INPUTS.map(file => [file, sha(fs.readFileSync(path.join(ROOT, file)))]));
}
function loadInputs() {
  const protocol = read(PROTOCOL_FILE);
  return { protocol, holdout: read(protocol.holdout), profileData: read(PROFILES_FILE), baselineData: read(BASELINE_FILE) };
}
function encrypt(plaintext, seed, homophones) {
  const random = R.rng(seed), present = [...new Set(plaintext)];
  const pool = Array.from({ length: present.length * homophones }, (_, i) => 'g' + i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const key = {}, byLetter = {};
  present.forEach((letter, i) => {
    byLetter[letter] = pool.slice(homophones * i, homophones * (i + 1));
    byLetter[letter].forEach(symbol => { key[symbol] = letter; });
  });
  const tokens = Array.from(plaintext, letter => byLetter[letter][Math.floor(random() * homophones)]);
  const observed = new Set(tokens);
  return { tokens, key: Object.fromEntries(Object.entries(key).filter(([symbol]) => observed.has(symbol))) };
}
function buildCases(inputs) {
  const { protocol, holdout, profileData } = inputs;
  assert.equal(protocol.id, 'museum-historical-profile-recovery-v1', 'Unsupported experiment protocol.');
  assert.equal(protocol.split, splits.splitOf(protocol.collection), 'Collection must stay in its declared split.');
  const training = profileData.profiles.flatMap(p => p.sources);
  const trainingAuthors = new Set(training.map(s => {
    assert.ok(protocol.sourceAuthors[s.id], 'Every training source needs an explicit author.');
    return protocol.sourceAuthors[s.id];
  }));
  const included = new Set(protocol.selection.included);
  const excluded = new Set(protocol.selection.excluded.map(p => p.id));
  assert.equal(included.size, 6, 'The protocol fixes six passages before outcomes.');
  assert.equal(excluded.size, 3, 'The three edition/introductory passages stay excluded.');
  assert.equal(included.size + excluded.size, holdout.passages.length, 'Account for every held-out passage.');
  for (const p of holdout.passages) {
    assert.notEqual(included.has(p.id), excluded.has(p.id), 'Each passage must be included or excluded, never both.');
  }
  const sources = protocol.selection.included.map(id => {
    const p = holdout.passages.find(p => p.id === id);
    assert.ok(p, 'Missing selected passage ' + id);
    assert.ok(!/-disjoint-1$/.test(p.id), 'Edition front matter must not enter the historical recovery sample.');
    assert.equal(sha(p.text), p.sha256, 'Held-out text checksum changed: ' + id);
    assert.ok(profileData.profiles.some(profile => profile.id === p.profile), 'Unknown expected language profile.');
    assert.ok(protocol.sourceAuthors[p.source], 'Every held-out source needs an explicit author.');
    assert.ok(!trainingAuthors.has(protocol.sourceAuthors[p.source]), 'Training author leaked into recovery holdout.');
    assert.ok(!training.some(s => s.id === p.source || s.work === p.work || s.url === p.url),
      'Training work leaked into recovery holdout.');
    const plaintext = normalize(p.text);
    assert.ok(plaintext.length >= 60 && plaintext.length <= 600, 'Selected passage exceeds the solver input scope.');
    return { id: p.id, source: p.source, author: protocol.sourceAuthors[p.source], work: p.work,
      edition: reviewedEdition(p), editionAsRecordedInV2: p.edition, url: p.url, shift: p.shift, profile: p.profile,
      language: profileData.profiles.find(profile => profile.id === p.profile).language,
      originalSha256: p.sha256, normalizedSha256: sha(plaintext), plaintext };
  });
  for (const p of profileData.profiles) {
    assert.equal(sources.filter(s => s.profile === p.id).length, 2, 'Every language needs exactly two selected passages.');
  }
  const cases = [];
  for (const source of sources) for (const replicate of protocol.replicates) {
    const id = source.id + ':replicate-' + replicate.id;
    const keySeed = splits.seedFor(protocol.split, protocol.id + ':' + id, 'key');
    const encrypted = encrypt(source.plaintext, keySeed, protocol.cipher.homophonesPerPresentLetter);
    assert.equal(encrypted.tokens.map(symbol => encrypted.key[symbol]).join(''), source.plaintext,
      'Known-key application must recover the fixture before unknown-key search.');
    cases.push({ id, passage: source.id, sourceDocument: source.source, collection: protocol.collection,
      split: protocol.split, profile: source.profile, language: source.language, replicate: replicate.id,
      searchSeed: replicate.searchSeed, keySeed, tokens: encrypted.tokens, expectedKey: encrypted.key,
      ciphertextSha256: sha(JSON.stringify(encrypted.tokens)), knownKeyApplicationExact: true });
  }
  assert.equal(cases.length, 30, 'Six passages times five independent key/search-seed pairs.');
  assert.equal(new Set(cases.map(c => c.keySeed)).size, cases.length, 'Independent key seeds collided.');
  assert.equal(new Set(cases.map(c => c.ciphertextSha256)).size, cases.length, 'Independent ciphertexts collided.');
  const grouping = splits.audit(cases);
  assert.ok(grouping.ok, grouping.problems.join('\n'));
  return { sources, cases, grouping };
}
function createScorers(inputs) {
  const baseline = Lang.build(inputs.baselineData);
  const profiles = Lang.buildProfiles(inputs.profileData);
  const scorers = new Map([[baseline.id, baseline.fitness],
    ...profiles.profiles.map(p => [p.id, p.fitness])]);
  assert.deepEqual([...scorers.keys()], inputs.protocol.scorers, 'The full declared scoring-model matrix is required.');
  for (const [id, fitness] of scorers) assert.equal(fitness.modelId, id, 'Scoring function does not match its condition.');
  return scorers;
}
function optionsFor(protocol, c, solver) {
  if (solver === 'annealing') return { seed: c.searchSeed, steps: protocol.solvers.annealing.steps, locks: {} };
  assert.equal(solver, 'beam-search', 'Unknown solver.');
  return { beam: protocol.solvers['beam-search'].beam, branch: protocol.solvers['beam-search'].branch, locks: {} };
}
function roleFor(c, scorer) {
  return scorer === 'museum-prose-quadgram-v1' ? 'baseline' : (scorer === c.profile ? 'matched' : 'mismatched');
}
function measures(expected, candidate, expectedKey, candidateKey) {
  const metric = R.metrics(expected, candidate, expectedKey, candidateKey);
  assert.equal(candidate.length, expected.length, 'Letter-homophone recovery must preserve character positions.');
  return { exact: metric.exact, editDistance: metric.editDistance,
    plaintextError: round(metric.plaintextError),
    positionalError: round(Array.from(expected).filter((letter, i) => letter !== candidate[i]).length / expected.length),
    keyError: round(metric.keyError) };
}
function runCondition(protocol, c, source, solver, scorer, fitness) {
  // This identity check is intentional: a baseline-only runner mislabeled as a
  // historical-model comparison must fail, even if all reported errors look plausible.
  assert.equal(fitness.modelId, scorer, 'Scoring function does not match its condition.');
  let fitnessEvaluations = 0;
  const score = text => { fitnessEvaluations++; return fitness(text); };
  score.modelId = fitness.modelId;
  const options = optionsFor(protocol, c, solver), start = process.hrtime.bigint();
  const result = solver === 'annealing' ? R.search(c.tokens, options, score) : R.beamSearch(c.tokens, options, score);
  const ms = Number(process.hrtime.bigint() - start) / 1e6;
  assert.equal(result.model, scorer, 'Solver returned a different scoring-model identity.');
  assert.equal(result.task, 'key-recovery-candidates', 'Known-key application is not recovery.');
  const candidate = result.candidates[0];
  return Object.assign({ caseId: c.id, solver, scorer, role: roleFor(c, scorer), options,
    ciphertextSha256: c.ciphertextSha256, scoringModelReported: result.model,
    completedSteps: result.completedSteps, fitnessEvaluations,
    plaintext: candidate.plaintext, key: candidate.key, score: candidate.score, ms: round(ms) },
  measures(source.plaintext, candidate.plaintext, c.expectedKey, candidate.key));
}
function stat(rows) {
  return { runs: rows.length, exact: rows.filter(r => r.exact).length,
    plaintextError: round(mean(rows.map(r => r.plaintextError))),
    positionalError: round(mean(rows.map(r => r.positionalError))),
    keyError: round(mean(rows.map(r => r.keyError))) };
}
function delta(values) {
  return { pairs: values.length, mean: round(mean(values)), min: round(Math.min(...values)),
    max: round(Math.max(...values)), matchedWins: values.filter(v => v < -1e-8).length,
    ties: values.filter(v => Math.abs(v) <= 1e-8).length, matchedLosses: values.filter(v => v > 1e-8).length };
}
function summarize(cases, runs) {
  const groupDefs = [{ kind: 'overall', id: 'all', cases },
    ...[...new Set(cases.map(c => c.language))].map(id => ({ kind: 'language', id, cases: cases.filter(c => c.language === id) })),
    ...[...new Set(cases.map(c => c.passage))].map(id => ({ kind: 'passage', id, cases: cases.filter(c => c.passage === id) })),
    ...[...new Set(cases.map(c => c.replicate))].map(id => ({ kind: 'replicate', id, cases: cases.filter(c => c.replicate === id) }))];
  const groups = [];
  for (const solver of ['annealing', 'beam-search']) for (const g of groupDefs) {
    const paired = g.cases.map(c => {
      const mine = runs.filter(r => r.caseId === c.id && r.solver === solver);
      const baseline = mine.find(r => r.role === 'baseline'), matched = mine.find(r => r.role === 'matched');
      const mismatched = mine.filter(r => r.role === 'mismatched');
      assert.ok(baseline && matched && mismatched.length === 2, 'Incomplete paired scoring-model matrix.');
      return { baseline, matched, mismatched };
    });
    groups.push({ solver, group: g.kind, id: g.id, cases: g.cases.length,
      baseline: stat(paired.map(p => p.baseline)), matched: stat(paired.map(p => p.matched)),
      mismatched: stat(paired.flatMap(p => p.mismatched)),
      matchedMinusBaseline: delta(paired.map(p => p.matched.plaintextError - p.baseline.plaintextError)),
      matchedMinusMeanMismatched: delta(paired.map(p => p.matched.plaintextError - mean(p.mismatched.map(r => r.plaintextError)))) });
  }
  // The two mismatch results stay inspectable separately; their pooled mean has
  // the same case weights, but 60 runs are not 60 independent source texts.
  const mismatchedControls = [];
  for (const solver of ['annealing', 'beam-search']) {
    for (const scorer of [...new Set(runs.filter(r => r.role === 'mismatched').map(r => r.scorer))]) {
      const controls = runs.filter(r => r.solver === solver && r.scorer === scorer && r.role === 'mismatched');
      const matched = controls.map(control => runs.find(r => r.caseId === control.caseId && r.solver === solver && r.role === 'matched'));
      mismatchedControls.push({ solver, scorer, control: stat(controls), matchedOnSameCases: stat(matched),
        matchedMinusControl: delta(matched.map((r, i) => r.plaintextError - controls[i].plaintextError)) });
    }
  }
  return { groups, mismatchedControls };
}
function runtime() {
  return { node: process.version, v8: process.versions.v8, platform: process.platform, arch: process.arch,
    locale: Intl.DateTimeFormat().resolvedOptions().locale };
}
function validateReport(report, inputs = loadInputs()) {
  const fixtures = buildCases(inputs), scorers = createScorers(inputs);
  assert.equal(report.id, inputs.protocol.id);
  assert.deepEqual(report.protocol, inputs.protocol, 'Recorded protocol changed.');
  assert.deepEqual(report.hashes, inputHashes(), 'Experiment inputs changed; keep old versions and record a new run.');
  assert.deepEqual(report.sources, fixtures.sources, 'Source provenance or normalized text changed.');
  assert.deepEqual(report.cases, fixtures.cases, 'The independently keyed fixtures changed.');
  assert.deepEqual(report.grouping, fixtures.grouping, 'Source/split grouping changed.');
  assert.equal(report.runs.length, inputs.protocol.runs, 'The full experiment matrix is required.');
  const seen = new Set();
  for (const run of report.runs) {
    const c = fixtures.cases.find(c => c.id === run.caseId);
    assert.ok(c, 'Unknown ciphertext case.');
    assert.ok(Object.hasOwn(inputs.protocol.solvers, run.solver) && scorers.has(run.scorer), 'Unknown solver or scorer.');
    const id = [run.caseId, run.solver, run.scorer].join('/');
    assert.ok(!seen.has(id), 'Duplicate experiment condition.'); seen.add(id);
    assert.equal(run.role, roleFor(c, run.scorer), 'Matched/mismatched labels do not match the source language.');
    assert.deepEqual(run.options, optionsFor(inputs.protocol, c, run.solver), 'Seeds, budgets or locks differ across paired conditions.');
    assert.equal(run.ciphertextSha256, c.ciphertextSha256, 'A condition received a different ciphertext.');
    assert.equal(run.scoringModelReported, run.scorer, 'A condition used the wrong scoring model.');
    const source = fixtures.sources.find(s => s.id === c.passage);
    assert.deepEqual(Object.keys(run.key).sort(), Object.keys(c.expectedKey).sort(), 'Prediction must cover exactly the observed symbols.');
    assert.ok(Object.values(run.key).every(letter => /^[A-Z]$/.test(letter)), 'Prediction contains a non-letter key value.');
    assert.equal(c.tokens.map(symbol => run.key[symbol]).join(''), run.plaintext, 'Predicted plaintext does not apply the reported key.');
    const actual = measures(source.plaintext, run.plaintext, c.expectedKey, run.key);
    for (const [name, value] of Object.entries(actual)) assert.equal(run[name], value, 'Reported ' + name + ' does not match the prediction.');
    const score = scorers.get(run.scorer)(run.plaintext);
    assert.ok(Number.isFinite(run.score) && Math.abs(run.score - score) <= 1e-9 * Math.max(1, Math.abs(score)),
      'Candidate score does not match its declared scoring model.');
    assert.ok(Number.isInteger(run.fitnessEvaluations) && run.fitnessEvaluations > 0, 'Missing score evaluation count.');
    assert.equal(run.completedSteps, run.solver === 'annealing' ? run.options.steps : Object.keys(c.expectedKey).length,
      'A search stopped before its declared budget.');
    assert.ok(Number.isFinite(run.ms) && run.ms >= 0, 'Invalid elapsed runtime.');
  }
  assert.equal(seen.size, fixtures.cases.length * Object.keys(inputs.protocol.solvers).length * scorers.size);
  assert.deepEqual(report.summary, summarize(fixtures.cases, report.runs), 'Reported aggregate or paired differences are inconsistent.');
  return true;
}
function execute(inputs = loadInputs(), progress = () => {}) {
  const fixtures = buildCases(inputs), scorers = createScorers(inputs), runs = [];
  for (const c of fixtures.cases) {
    const source = fixtures.sources.find(s => s.id === c.passage);
    for (const solver of Object.keys(inputs.protocol.solvers)) for (const [scorer, fitness] of scorers) {
      runs.push(runCondition(inputs.protocol, c, source, solver, scorer, fitness));
    }
    progress(c.id, runs.length, inputs.protocol.runs);
  }
  const report = { version: 1, id: inputs.protocol.id, generatedBy: 'scripts/evaluate-profile-recovery.js',
    protocol: inputs.protocol, hashes: inputHashes(), runtime: runtime(),
    sources: fixtures.sources, cases: fixtures.cases, grouping: fixtures.grouping,
    runs, summary: summarize(fixtures.cases, runs),
    limits: [
      'Six public passages, two from each of three works/authors. Thirty independently keyed cases are not thirty independent documents; variants remain grouped by source.',
      'The first passage of every existing author-disjoint source is excluded for front-matter/introductory contamination before outcomes. Existing v2 files and their earlier results are preserved.',
      'Author and work disjointness is checked against explicit source identities and author metadata, not claimed for every possible unrecorded textual borrowing or edition editor.',
      'Matched means language-matched, not necessarily period-, genre- or orthography-matched. The Italian edition states that some spellings were modernized; removing its preface does not undo those editorial decisions.',
      'Both mismatched historical models are run separately on each case. Their pooled mean uses two runs per case; paired comparisons first average those two controls within each case.',
      'Five fixed paired key/search seeds are all published. They vary keys as well as annealing randomness, and are not an isolated estimate of search-seed variance.',
      'Scores, corpus sizes, pruning and unseen-gram floors differ among models. No cross-model likelihood comparison or temperature rescaling is performed; the outcome is externally measured recovery error.',
      'The shipped annealer still uses an English-weighted initial proposal distribution and the beam uses its shipped extension order. Both are held fixed across scorers. These are implementation-specific model substitutions, not a general comparison of language models.',
      'No matched modern French, Italian or Latin baseline is available, so this experiment cannot identify a benefit of historical spelling separately from language matching.',
      'Only clean A-Z letter-homophone ciphertexts are tested. No numerical segmentation, nulls, word codes, transcription ambiguity or authentic unknown historical cipher is recovered here.',
      'Replay needs identical inputs, scorer/solver builds and JavaScript execution behavior. Node/V8/platform/architecture/locale and input hashes are recorded. Cross-engine search paths are not promised to match.',
      'The check command audits provenance, pairing, model identity, complete matrix and arithmetic without rerunning search. Replay reruns every search and demands exact results except runtime; it does not accept a broad per-item error tolerance.',
      'No score-based cherry-picking, best-of-seed reporting, inferential significance or general decipherment-accuracy claim is supported by this bounded experiment.'
    ] };
  validateReport(report, inputs);
  return report;
}
function replayProjection(report) {
  const copy = JSON.parse(JSON.stringify(report));
  delete copy.runtime;
  copy.runs.forEach(run => { delete run.ms; });
  return copy;
}
function printSummary(report) {
  console.log('solver\tcondition\truns\tplaintext error\tpositional error\tkey error\texact');
  for (const group of report.summary.groups.filter(g => g.group === 'overall')) {
    for (const condition of ['baseline', 'matched', 'mismatched']) {
      const s = group[condition];
      console.log([group.solver, condition, s.runs, (100 * s.plaintextError).toFixed(2) + '%',
        (100 * s.positionalError).toFixed(2) + '%', (100 * s.keyError).toFixed(2) + '%', s.exact + '/' + s.runs].join('\t'));
    }
    console.log(group.solver + ' paired matched-minus-baseline: ' + (100 * group.matchedMinusBaseline.mean).toFixed(2) +
      ' percentage points; matched-minus-mean-mismatch: ' + (100 * group.matchedMinusMeanMismatched.mean).toFixed(2) + '.');
  }
}
function main() {
  const args = process.argv.slice(2);
  assert.ok(args.length <= 1 && (!args.length || ['--check', '--replay'].includes(args[0])),
    'Usage: node scripts/evaluate-profile-recovery.js [--check|--replay]');
  if (args[0] === '--check') {
    const report = read(REPORT_FILE); validateReport(report);
    console.log('Historical profile recovery: provenance, all 240 paired conditions, model identities and result arithmetic checked (no search rerun).');
    printSummary(report); return;
  }
  let previous;
  if (args[0] === '--replay') {
    previous = read(REPORT_FILE); validateReport(previous);
    assert.deepEqual(previous.runtime, runtime(), 'Exact replay requires the recorded runtime; use a separately versioned experiment for a different environment.');
  }
  const report = execute(loadInputs(), (id, done, total) => console.log(done + '/' + total + ' conditions completed: ' + id));
  if (previous) {
    assert.deepEqual(replayProjection(report), replayProjection(previous), 'Search replay diverged; no per-item error tolerance is applied.');
    console.log('Historical profile recovery replayed exactly in the recorded runtime; elapsed times excluded.');
  } else {
    fs.writeFileSync(path.join(ROOT, REPORT_FILE), JSON.stringify(report, null, 2) + '\n');
    console.log('Wrote ' + REPORT_FILE);
  }
  printSummary(report);
}
if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { loadInputs, normalize, encrypt, buildCases, createScorers, optionsFor, roleFor,
  measures, runCondition, summarize, validateReport, execute, replayProjection };
