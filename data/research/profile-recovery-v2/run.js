'use strict';
const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict'),path=require('path');
const D=__dirname, E=require('./inputs/scripts/evaluate-profile-recovery');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const P=JSON.parse(fs.readFileSync(path.join(D,'protocol.json')));
for(const [f,h] of Object.entries(P.inputHashes))assert.equal(sha(fs.readFileSync(path.join(D,'inputs',f))),h);
const inputs=E.loadInputs(),fixtures=E.buildCases(inputs),scorers=E.createScorers(inputs);
const runtime={node:process.version,v8:process.versions.v8,platform:process.platform,arch:process.arch,locale:Intl.DateTimeFormat().resolvedOptions().locale};
const log=path.join(D,'runs.jsonl');assert.ok(!fs.existsSync(log),'Do not overwrite a completed or partial experiment.');
fs.writeFileSync(path.join(D,'execution.json'),JSON.stringify({startedAt:new Date().toISOString(),runtime,protocolSha256:sha(fs.readFileSync(path.join(D,'protocol.json'))),runnerSha256:sha(fs.readFileSync(__filename))},null,2));
fs.writeFileSync(path.join(D,'fixtures.json'),JSON.stringify(fixtures,null,2));
let done=0;
for(const c of fixtures.cases){
 const source=fixtures.sources.find(s=>s.id===c.passage);
 for(const solver of ['annealing','beam-search'])for(const seed of solver==='annealing'?P.searchSeeds:[null])for(const [scorer,fitness] of scorers){
  let r;try{r=E.runCondition(inputs.protocol,{...c,searchSeed:seed},source,solver,scorer,fitness);r.status='completed';}
  catch(e){r={caseId:c.id,solver,scorer,status:'failed',error:e.stack};}
  Object.assign(r,{searchSeed:seed,passage:c.passage,sourceDocument:c.sourceDocument,language:c.language,keyIndex:c.replicate});
  fs.appendFileSync(log,JSON.stringify(r)+'\n');done++;
 }
 console.log(done+'/720 '+c.id);
}
assert.equal(done,720);fs.writeFileSync(path.join(D,'finished.json'),JSON.stringify({completedAt:new Date().toISOString(),runs:done,runsSha256:sha(fs.readFileSync(log))},null,2));
