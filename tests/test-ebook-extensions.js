'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const chi=require('../js/chi-setting'),column=require('../js/columnar-search'),bounded=require('../scripts/budgeted-solvers');
const {JSDOM}=require('jsdom');
require('../js/detective/lang-model');
const root=path.join(__dirname,'..');
assert.deepEqual(chi.delta([1,3,2]),[2,1]);
const f=chi.fixture(256,0),ranked=chi.rank(f.ciphertext,f.patterns);
let direct=0;for(let t=0;t<f.residual.length-1;t++){const d=f.residual[t]^f.residual[t+1];if(((d&1)^((d>>>1)&1))===0)direct++;}
assert.equal(ranked.find(r=>r.a===f.truth.a&&r.b===f.truth.b).dots,direct,'Known-setting count must equal independently differenced residual parity.');
assert.equal(ranked.length,1271);
assert.equal(new Set(ranked.map(r=>r.a+','+r.b)).size,1271);
assert.deepEqual(chi.fixture(256,0),f);
const noisy=chi.experiment(1024,0.5);assert.match(noisy.conclusion,/Inconclusive/);
assert.equal(noisy.familywiseEstimate,(1+noisy.nullMaxima.filter(n=>n>=noisy.ranked[0].dots).length)/40);
assert.throws(()=>chi.rank([0,32],f.patterns),/five-bit/);
for(const width of [2,5,8,12])for(const n of [width*4,width*4+Math.floor(width/2)]){
 const text='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(10).slice(0,n),order=Array.from({length:width},(_,i)=>width-i-1);
 assert.equal(column.decrypt(column.encrypt(text,order),order),text,'Incomplete columns keep candidate-dependent lengths.');
 for(let i=0;i<100;i++)assert.deepEqual(column.move(order,column.rng(i),true).sort((a,b)=>a-b),Array.from({length:width},(_,j)=>j));
}
const text='THECOURIERLEFTTHEMESSAGEBESIDETHEBRIDGEBEFORETHENEXTTRAINARRIVED',cipher=column.encrypt(text,[3,1,4,0,2]);
for(const staged of [false,true]){
 const a=column.solve(cipher,{width:5,budget:1000,seed:0,staged});
 assert.deepEqual(a,column.solve(cipher,{width:5,budget:1000,seed:0,staged}));assert.equal(a.evaluations,1000);assert(a.best);assert(a.preprocessing>=0);
}
const outer=column.unknownWidth(cipher,{widths:[4,5,6],budget:3000});assert(outer.evaluations<=3000);
assert.throws(()=>column.solve(cipher,{width:13}),/width/);
for(const method of ['hc','sa','sa+hc']){const a=bounded.solve(cipher,{method,budget:100,seed:0});assert.equal(a.evaluations,100);assert.deepEqual(a,bounded.solve(cipher,{method,budget:100,seed:0}));}
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
// Execute the actual page handlers in a DOM; no network or external services.
async function wiring(page, scripts, run, result, text){
 const dom=new JSDOM(read(page),{runScripts:'outside-only'});scripts.forEach(s=>dom.window.eval(read(s)));dom.window.document.getElementById(run).click();
 await new Promise(resolve=>setTimeout(resolve,50));assert.match(dom.window.document.getElementById(result).textContent,text);assert.equal(dom.window.document.getElementById(run).disabled,false);dom.window.close();
}
(async()=>{
 await wiring('ciphers/colossus.html',['js/chi-setting.js'],'chi-run','chi-results',/1,271|single-setting|Whole-search/);
 await wiring('ciphers/columnar.html',['js/detective/lang-model.js','js/columnar-search.js','js/columnar-search-ui.js'],'columnar-search-run','columnar-search-output',/Score evaluations/);
 const report=require('../data/solver-evaluation/results.json');
 assert(report.substitution.some(r=>!r.exact),'Retain unsuccessful cases.');
 assert(report.transposition.some(r=>!r.exact),'Retain failed columnar cases.');
 assert(report.substitution.every(r=>r.evaluations===report.budget));
 assert(report.transposition.every(r=>r.evaluations<=report.budget));
 assert.equal(new Set(report.transposition.map(r=>r.variant)).size,5);
 for(const f of ['ciphers/colossus.html','ciphers/columnar.html'])assert(!/href="[^"]*(?:annas|\.pdf)/i.test(read(f)),'Book references must not link ebook copies.');
 console.log('Ebook experiments: arithmetic, seeded budgets, incomplete rectangles, controls and DOM wiring passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
