#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {performance}=require('node:perf_hooks');
const os=require('node:os');
const {solve,wilson}=require('./budgeted-solvers');
const columnar=require('../js/columnar-search');
require('../js/detective/lang-model');
const corpus=require('../data/solver-evaluation/holdout.json');
const root=path.join(__dirname,'..');
const clean=s=>s.toUpperCase().replace(/[^A-Z]/g,'');
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
function shuffle(a,random){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function evaluate(timings){
 const substitution=[],transposition=[],budget=6000;
 for(let textId=0;textId<corpus.texts.length;textId++)for(const length of corpus.lengths){
  const plaintext=clean(corpus.texts[textId]).slice(0,length),key=shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),columnar.rng(1000+textId+length)),ciphertext=Array.from(plaintext,c=>key[c.charCodeAt(0)-65]).join('');
  for(const seed of corpus.seeds)for(const method of ['hc','sa','sa+hc']){
   const started=performance.now(),r=solve(ciphertext,{method,budget,seed});
   if(timings)timings.push({family:'substitution',textId,length,seed,method,evaluations:r.evaluations,elapsedMs:performance.now()-started});
   substitution.push({textId,length,seed,method,evaluations:r.evaluations,exact:r.plaintext===plaintext,characterAccuracy:Array.from(plaintext).filter((c,i)=>c===r.plaintext[i]).length/length,score:r.score});
  }
 }
 const variants=[{name:'swaps-only',segments:false,staged:false},{name:'segments',staged:false},{name:'staged-no-alignment',alignment:false},{name:'staged-alignment'},{name:'staged-one-restart',restarts:1}];
 for(let textId=0;textId<corpus.texts.length;textId++)for(const width of [5,8,12])for(const incomplete of [false,true]){
  const raw=clean(corpus.texts[textId]),length=Math.floor(144/width)*width+(incomplete?Math.floor(width/2):0),plaintext=raw.slice(0,length),order=shuffle(Array.from({length:width},(_,i)=>i),columnar.rng(700+textId+width)),ciphertext=columnar.encrypt(plaintext,order);
  for(const seed of corpus.seeds)for(const variant of variants){const started=performance.now(),r=columnar.solve(ciphertext,{width,budget,seed,...variant});if(timings)timings.push({family:'columnar',textId,width,incomplete,length,seed,variant:variant.name,evaluations:r.evaluations,preprocessing:r.preprocessing,elapsedMs:performance.now()-started});transposition.push({textId,width,incomplete,length,seed,variant:variant.name,evaluations:r.evaluations,preprocessing:r.preprocessing,exact:r.best?.plaintext===plaintext,characterAccuracy:r.best?Array.from(plaintext).filter((c,i)=>c===r.best.plaintext[i]).length/length:0,reason:r.reason});}
 }
 // Seeds on the same text are correlated: uncertainty is computed over per-text all-seed success,
 // and labelled descriptive because the original-text convenience sample is tiny.
 const summary=[];
 for(const method of ['hc','sa','sa+hc'])for(const length of corpus.lengths){const rows=substitution.filter(r=>r.method===method&&r.length===length),successes=rows.filter(r=>r.exact).length,allSeedTexts=corpus.texts.filter((_,i)=>rows.filter(r=>r.textId===i).every(r=>r.exact)).length;summary.push({method,length,successes,runs:rows.length,allSeedTexts,texts:corpus.texts.length,descriptiveWilson95:wilson(allSeedTexts,corpus.texts.length)});}
 const columnarSummary=[];
 for(const variant of variants)for(const width of [5,8,12])for(const incomplete of [false,true]){
  const rows=transposition.filter(r=>r.variant===variant.name&&r.width===width&&r.incomplete===incomplete),allSeedTexts=corpus.texts.filter((_,i)=>rows.filter(r=>r.textId===i).every(r=>r.exact)).length;
  columnarSummary.push({variant:variant.name,width,incomplete,successes:rows.filter(r=>r.exact).length,runs:rows.length,allSeedTexts,texts:corpus.texts.length,descriptiveWilson95:wilson(allSeedTexts,corpus.texts.length)});
 }
 return {schema:1,budget,provenance:corpus.provenance,models:{quadgrams:digest('scripts/data/english-quadgrams.json'),browser:digest('js/detective/lang-model.js'),holdout:digest('data/solver-evaluation/holdout.json')},scope:'Equal score-evaluation budgets, not equal CPU time. Counts include initial scoring, restarts, stage changes, adjacency preprocessing and hybrid polishing. HC/SA/SA+HC use matched random-swap kernels; this is not a claim about every implementation. No model training or parameter tuning occurs in this script. All failures are retained. Repeated seeds on the same text are dependent.',summary,columnarSummary,substitution,transposition};
}
if(require.main===module){const timings=process.argv.includes('--timing')?[]:undefined,report=evaluate(timings),file=path.join(root,'data/solver-evaluation/results.json'),serialized=JSON.stringify(report,null,2)+'\n';if(process.argv.includes('--check')){if(fs.readFileSync(file,'utf8')!==serialized)throw Error('Solver evaluation does not replay.');console.log('Seeded solver evaluation replays exactly.');}else{fs.writeFileSync(file,serialized);console.log(JSON.stringify(report.summary,null,2));}if(timings){fs.writeFileSync(path.join(root,'data/solver-evaluation/timings.json'),JSON.stringify({scope:'One wall-clock observation per run on this machine, including preprocessing and polishing. Runtime varies with hardware, load and JIT warm-up; these values are not reproducible performance guarantees and are excluded from deterministic replay.',runtime:process.version,platform:process.platform,arch:process.arch,cpu:os.cpus()[0]?.model,rows:timings},null,2)+'\n');}}
module.exports={evaluate};
