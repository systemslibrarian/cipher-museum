'use strict';
// Research-evaluation v2: the suite must reproduce, and the split and grouping rules
// must actually reject the leakage they claim to prevent. A rule nobody has tried to
// break is a guess, so each one is tested against a deliberately leaky item list.
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const root=path.join(__dirname,'..');
const splits=require('../scripts/research-splits');

// ── The rules themselves ────────────────────────────────────────────────────
const clean=[
  {sourceDocument:'letter-a',split:'test',keySeed:20001,poolId:'pool-31000'},
  {sourceDocument:'letter-a',split:'test',keySeed:20002,poolId:'pool-31000'},
  {sourceDocument:'letter-b',split:'test',keySeed:20003,poolId:'pool-31000'}
];
assert.equal(splits.audit(clean).ok,true,'a correctly grouped item list passes');
assert.equal(splits.audit(clean).documents,2);
// 1. Variants of one source plaintext may not straddle a split.
const straddles=splits.audit([clean[0],{...clean[1],split:'development',keySeed:10001}]);
assert.equal(straddles.ok,false);
assert.ok(straddles.problems.some(p=>/appears in both/.test(p)),'source grouping is enforced: '+straddles.problems);
// 2. A key seed may not be shared between splits.
const sharedSeed=splits.audit([clean[0],{sourceDocument:'letter-z',split:'development',keySeed:20001}]);
assert.equal(sharedSeed.ok,false);
assert.ok(sharedSeed.problems.some(p=>/shared by/.test(p)),'disjoint key seeds are enforced');
assert.ok(sharedSeed.problems.some(p=>/outside the development range/.test(p)),'per-split seed ranges are enforced');
// 3. A fixed code pool may not be shared between splits.
const sharedPool=splits.audit([clean[0],{sourceDocument:'letter-z',split:'development',keySeed:10001,poolId:'pool-31000'}]);
assert.equal(sharedPool.ok,false);
assert.ok(sharedPool.problems.some(p=>/Code pool .* shared by/.test(p)),'disjoint code pools are enforced');
// 4. Seeds are allocated deterministically inside the split's own range.
for (const split of splits.SPLITS) {
  const range=splits.SEED_RANGES[split];
  for (const label of ['a','letter-b:full-2hom','x'.repeat(40)]) {
    const seed=splits.seedFor(split,label,'key');
    assert.ok(seed>=range[0]&&seed<=range[1],split+' seed for '+label+' stays in range');
    assert.equal(seed,splits.seedFor(split,label,'key'),'seed allocation is deterministic');
  }
}
assert.notEqual(splits.seedFor('test','a','key'),splits.seedFor('development','a','key'),'the same label gets different seeds per split');
assert.throws(()=>splits.splitOf('not-a-collection'),/Unknown collection/);
assert.throws(()=>splits.seedFor('not-a-split','a','key'),/Unknown split/);

// ── The suite reproduces ────────────────────────────────────────────────────
const result=spawnSync(process.execPath,['scripts/evaluate-research-v2.js','--check'],{cwd:root,encoding:'utf8'});
process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');
assert.equal(result.status,0,'research-evaluation v2 must reproduce from its fixtures, models and solvers');

const report=JSON.parse(fs.readFileSync(path.join(root,'data/research/v2/evaluation.json'),'utf8'));
const t=report.tasks;
assert.equal(report.version,2);
assert.equal(report.grouping.ok,true,'the published run audited its own splits');
assert.equal(report.grouping.perSplit.test>0,true,'the test split holds items');

// Released v1 material is preserved, not overwritten.
const v1=JSON.parse(fs.readFileSync(path.join(root,'data/research/v1/evaluation.json'),'utf8'));
assert.equal(v1.version,1,'research-evaluation v1 is still published');
const v1Fixtures=JSON.parse(fs.readFileSync(path.join(root,'data/research/v1/exercises.json'),'utf8'));
assert.deepEqual(v1Fixtures.cases.map(c=>c.id),['letter-a','letter-b','language-shift'],'v1 identifiers are unchanged');
const v2Corpus=JSON.parse(fs.readFileSync(path.join(root,'data/research/v2/corpus.json'),'utf8'));
for (const id of ['letter-a','letter-b','language-shift']) {
  const a=v1Fixtures.cases.find(c=>c.id===id), b=v2Corpus.documents.find(c=>c.id===id);
  assert.ok(b,'v2 carries the v1 fixture '+id);
  assert.equal(a.text,b.text,'v2 reruns the identical v1 text for '+id);
}
assert.ok(v1.records.every(r=>r.unassisted.verified===false),'the v1 baseline failures are still recorded as failures');

// ── Each task reports its own denominator and keeps the tasks apart ─────────
assert.ok(t.independentKeyRecovery.annealing.denominator>0);
assert.equal(t.independentKeyRecovery.exactRecovery.denominator,t.independentKeyRecovery.annealing.denominator);
// Known-key application is a different task from recovery, and it is exact.
assert.equal(t.independentKeyRecovery.knownKeyApplicationExact,t.independentKeyRecovery.exactRecovery.denominator,
  'applying a complete known key reproduces the plaintext every time');
// Arbitrary symbol names cannot change either solver.
assert.equal(t.independentKeyRecovery.relabellingInvariant.annealing,true);
assert.equal(t.independentKeyRecovery.relabellingInvariant.beamSearch,true);
// Failures are retained rather than quietly dropped.
assert.ok(t.independentKeyRecovery.annealing.plaintextError.mean>0,'unassisted recovery failures are published');
assert.ok(t.independentKeyRecovery.beamSearch.plaintextError.mean>0);
assert.ok(t.independentKeyRecovery.annealing.ms&&t.independentKeyRecovery.beamSearch.ms,'runtime is reported per solver');
assert.ok(t.independentKeyRecovery.annealing.heapDeltaBytes!==undefined,'memory is reported separately from runtime');
// A shared code pool is recognition, not recovery.
assert.equal(t.fixedCodePoolRecognition.knownPoolExact,t.fixedCodePoolRecognition.denominator);
assert.ok(t.fixedCodePoolRecognition.unknownPool.unknownPoolPlaintextError.mean>0,
  'recovering the same pool from one text is not the same problem as applying it');
// Authentic replay stays labelled as replay.
assert.equal(t.authenticKnownKeyReplay.correctRouteExact,true);
assert.equal(t.authenticKnownKeyReplay.wrongRouteExact,false);
assert.equal(t.authenticKnownKeyReplay.fullZ340Recovery,false);
// Transcription error is reported apart from plaintext error, which stays undefined.
assert.equal(t.transcription.searchRejected,true);
assert.equal(t.transcription.plaintextError,null);
assert.ok(t.transcription.unresolvedCoverage>0);
// Segmentation is validated against an exhaustive oracle, and pruning is declared.
for (const c of t.numericalSegmentation.cases) {
  if (c.matchesExhaustiveOracle!==null) assert.equal(c.matchesExhaustiveOracle,true,c.id+' matches the exhaustive oracle');
  if (c.matchesExpected!==null) assert.equal(c.matchesExpected,true,c.id+' matches its hand-computed readings');
}
assert.equal(t.numericalSegmentation.cutoff.globalBestGuaranteed,false);
assert.match(t.numericalSegmentation.cutoff.pruning,/can discard the globally best path/);
assert.notEqual(t.numericalSegmentation.boundaryVersusPlaintext.boundaryMetrics.boundarySymmetricDifference,
  t.numericalSegmentation.boundaryVersusPlaintext.plaintextError,'boundary error and plaintext error are separate measurements');
// Language shift: controls behave, and uncovered languages are declared.
const controls=t.languageAndDomainShift.controls;
assert.ok(controls.every(c=>c.correct===true),'every language control behaved as declared: '+JSON.stringify(controls.map(c=>[c.id,c.correct])));
assert.equal(controls.find(c=>c.id==='absent-language-english').decided,false,'a language with no profile is abstained on, not guessed');
assert.equal(controls.find(c=>c.id==='random-control').decided,false);
assert.ok(Object.keys(t.languageAndDomainShift.summary.perLanguage).length===3,'recovery is reported per language');
assert.match(t.languageAndDomainShift.unresolvedCoverage,/no profile/);
// The suite says plainly what it is not.
assert.ok(report.limits.some(l=>/blind benchmark/.test(l)),'the suite states that it is not a blind benchmark');
assert.ok(report.limits.some(l=>/not independent source documents/.test(l)),'the holdout limitation is published');
assert.match(report.relationToV1,/not replaced|unchanged/i);
console.log('Research evaluation v2: split rules, task separation, preserved v1 baseline and declared limits passed.');
