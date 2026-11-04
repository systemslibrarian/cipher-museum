'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const D=path.join(__dirname,'../data/research/profile-recovery-v2');
const E=require(path.join(D,'inputs/scripts/evaluate-profile-recovery'));
const P=require(path.join(D,'protocol.json')),F=require(path.join(D,'fixtures.json'));
const inputs=E.loadInputs();
function verify(rowsOverride, summaryOverride) {
const rows=rowsOverride || require('zlib').gunzipSync(fs.readFileSync(path.join(D,'runs.jsonl.gz'))).toString('utf8').trim().split('\n').map(JSON.parse);
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
for(const [f,h] of Object.entries(P.inputHashes))assert.equal(hash(fs.readFileSync(path.join(D,'inputs',f))),h);
assert.equal(rows.length,720);let checked=0;const seen=new Set(),scorers=E.createScorers(inputs);
for(const r of rows){const id=[r.caseId,r.solver,r.scorer,r.searchSeed].join('/');assert.ok(!seen.has(id));seen.add(id);
 const c=F.cases.find(c=>c.id===r.caseId),s=F.sources.find(s=>s.id===c.passage);assert.ok(c&&s);assert.equal(r.passage,c.passage);assert.equal(r.sourceDocument,c.sourceDocument);assert.equal(r.keyIndex,c.replicate);assert.equal(r.language,c.language);
 assert.ok(P.scorers.includes(r.scorer));assert.ok(r.solver==='annealing'?P.searchSeeds.includes(r.searchSeed):r.searchSeed===null);
 if(r.status!=='completed')continue;
 assert.equal(r.role,E.roleFor(c,r.scorer));assert.equal(r.scoringModelReported,r.scorer);assert.equal(r.ciphertextSha256,c.ciphertextSha256);
 assert.deepEqual(r.options,E.optionsFor(inputs.protocol,{...c,searchSeed:r.searchSeed},r.solver));
 assert.deepEqual(Object.keys(r.key).sort(),Object.keys(c.expectedKey).sort());assert.equal(c.tokens.map(t=>r.key[t]).join(''),r.plaintext);
 for(const [k,v] of Object.entries(E.measures(s.plaintext,r.plaintext,c.expectedKey,r.key)))assert.equal(r[k],v);
 const score=scorers.get(r.scorer)(r.plaintext);assert.ok(Math.abs(score-r.score)<1e-9*Math.max(1,Math.abs(score)));
 assert.equal(r.completedSteps,r.solver==='annealing'?6000:Object.keys(c.expectedKey).length);checked++;
}
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
const variance=a=>a.length?mean(a.map(x=>(x-mean(a))**2)):null;
const stat=a=>({runs:a.length,completed:a.filter(r=>r.status==='completed').length,failed:a.filter(r=>r.status!=='completed').length,exact:a.filter(r=>r.exact).length,...Object.fromEntries(['plaintextError','positionalError','keyError'].map(k=>[k,a.every(r=>r.status==='completed')?mean(a.map(r=>r[k])):null]))});
const delta=a=>({pairs:a.length,mean:mean(a),min:Math.min(...a),max:Math.max(...a),wins:a.filter(x=>x< -1e-8).length,ties:a.filter(x=>Math.abs(x)<=1e-8).length,losses:a.filter(x=>x>1e-8).length});
const groups=[];
for(const solver of ['annealing','beam-search'])for(const field of ['overall','sourceDocument','passage','keyIndex','searchSeed']){
 if(solver==='beam-search'&&field==='searchSeed')continue;
 for(const value of field==='overall'?['all']:[...new Set(rows.filter(r=>r.solver===solver).map(r=>r[field]))]){
 const a=rows.filter(r=>r.solver===solver&&(field==='overall'||r[field]===value));
 const b=a.filter(r=>r.role==='baseline'),m=a.filter(r=>r.role==='matched'),x=a.filter(r=>r.role==='mismatched');
 let paired=null;if(a.every(r=>r.status==='completed'))paired={matchedMinusBaseline:delta(m.map(r=>r.plaintextError-b.find(z=>z.caseId===r.caseId&&z.searchSeed===r.searchSeed).plaintextError)),matchedMinusMeanMismatched:delta(m.map(r=>r.plaintextError-mean(x.filter(z=>z.caseId===r.caseId&&z.searchSeed===r.searchSeed).map(z=>z.plaintextError))))};
 groups.push({solver,group:field,id:value,baseline:stat(b),matched:stat(m),mismatched:stat(x),paired});
 }}
const seedVariation=[];for(const c of F.cases)for(const scorer of P.scorers){const a=rows.filter(r=>r.caseId===c.id&&r.scorer===scorer&&r.solver==='annealing');seedVariation.push({caseId:c.id,scorer,errorMean:mean(a.map(r=>r.plaintextError)),seedPopulationVariance:variance(a.map(r=>r.plaintextError)),min:Math.min(...a.map(r=>r.plaintextError)),max:Math.max(...a.map(r=>r.plaintextError))});}
const keyVariation=[];for(const p of F.sources)for(const scorer of P.scorers){const a=seedVariation.filter(r=>F.cases.find(c=>c.id===r.caseId).passage===p.id&&r.scorer===scorer);keyVariation.push({passage:p.id,scorer,keyMeanPopulationVariance:variance(a.map(r=>r.errorMean)),meanWithinKeySeedVariance:mean(a.map(r=>r.seedPopulationVariance))});}
const old=require(path.join(D,'inputs/data/research/profile-recovery-v1/evaluation.json'));let identical=0;
for(const r of old.runs){const c=F.cases.find(c=>c.id===r.caseId);const n=rows.find(z=>z.caseId===r.caseId&&z.solver===r.solver&&z.scorer===r.scorer&&(r.solver==='beam-search'||z.searchSeed===c.searchSeed));for(const k of ['plaintext','key','score','fitnessEvaluations','plaintextError','positionalError','keyError','exact'])assert.deepEqual(n[k],r[k]);identical++;}
const out={checkedMetrics:checked,expectedRuns:720,failed:rows.filter(r=>r.status!=='completed'),v1OverlappingConditionsIdentical:identical,runtime:require(path.join(D,'execution.json')).runtime,totalConditionSeconds:rows.reduce((s,r)=>s+(r.ms||0),0)/1000,groups,seedVariation,keyVariation,interpretation:'Variances are descriptive population variances across this fixed factorial grid, not inferential estimates across historical sources.'};
assert.deepEqual(F,E.buildCases(inputs),'Recorded fixtures differ from audited construction.');
assert.deepEqual(out,summaryOverride || JSON.parse(fs.readFileSync(path.join(D,'summary.json'))),'Recorded aggregate arithmetic or diagnostics changed.');
assert.equal(out.failed.length,0,'Published run has unexpected failed conditions.');
const exec=JSON.parse(fs.readFileSync(path.join(D,'execution.json')));
assert.equal(exec.protocolSha256,hash(fs.readFileSync(path.join(D,'protocol.json'))));
assert.equal(exec.runnerSha256,hash(fs.readFileSync(path.join(D,'run.js'))));
assert.equal(JSON.parse(fs.readFileSync(path.join(D,'finished.json'))).runsSha256,hash(require('zlib').gunzipSync(fs.readFileSync(path.join(D,'runs.jsonl.gz')))));
return out;
}
if(require.main===module){
 try { const r=verify();console.log(`Profile recovery v2: ${r.checkedMetrics}/720 conditions checked; ${r.v1OverlappingConditionsIdentical}/240 overlapping v1 predictions identical. Zero exact recoveries. No search rerun.`); }
 catch(e){console.error(e.message);process.exitCode=1;}
}
module.exports={verify};
