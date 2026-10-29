'use strict';
// Guards for the research extensions added in the 29 October 2026 pass:
// linked image regions, the revisable symbol inventory, the investigation bundle,
// lattice segmentation, the hypothesis register and the beam-search baseline.
//
// Every assertion below was checked by reintroducing the defect it describes and
// confirming that this file fails, then restoring the code.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const R=require('../js/research-model');
const Lang=require('../js/research-language-model');
const root=path.join(__dirname,'..');

async function main() {
// ── R03: images, coordinate transforms and occurrence/region linking ────────
const IMG={id:'image-1',name:'folio.png',width:2000,height:1500,rotation:0,crop:[0,0,1,1],sha256:'a'.repeat(64),note:''};
const REGION=[0.1,0.2,0.15,0.05];
// A transform never rewrites a region: it round-trips exactly through every
// rotation and crop, so a region recorded once keeps its meaning.
for (const rotation of R.ROTATIONS) for (const crop of [[0,0,1,1],[0.05,0.1,0.8,0.7],[0.25,0.25,0.5,0.5]]) {
  const image={...IMG,rotation,crop};
  const placed=R.regionToDisplay(image,REGION);
  if (!placed.visible) continue;
  const back=R.displayToRegion(image,placed.box);
  assert.ok(back.every((v,i)=>Math.abs(v-REGION[i])<1e-9),'region round-trips through rotation '+rotation+' and crop '+crop.join(','));
}
// Zoom is irrelevant: the result is normalized, so two display sizes agree.
assert.deepEqual(R.regionToDisplay(IMG,REGION).box,R.regionToDisplay({...IMG,width:400,height:300},REGION).box);
// Rotation swaps the visible aspect; cropping scales it.
assert.deepEqual(R.displayAspect(IMG),{width:2000,height:1500});
assert.deepEqual(R.displayAspect({...IMG,rotation:90}),{width:1500,height:2000});
assert.deepEqual(R.displayAspect({...IMG,crop:[0,0,0.5,0.5]}),{width:1000,height:750});
// A region outside the visible crop is reported, not silently drawn.
assert.equal(R.regionToDisplay({...IMG,crop:[0.5,0.5,0.5,0.5]},REGION).visible,false);
assert.equal(R.regionToDisplay({...IMG,crop:[0.05,0.15,0.9,0.85]},REGION).clipped,false);
assert.throws(()=>R.imageRecord({...IMG,rotation:45}),/0, 90, 180 or 270/);
assert.throws(()=>R.imageRecord({...IMG,sha256:'nothex'}),/64 lowercase hexadecimal/);
assert.throws(()=>R.imageRecord({...IMG,crop:[0.5,0,0.8,1]}),/fit inside/);
assert.throws(()=>R.imageRecord({...IMG,name:''}),/recorded filename/);

let linked=R.create('g1 g2 g1 g3');
linked=R.addImage(linked,{name:'folio.png',width:2000,height:1500,sha256:'b'.repeat(64)});
linked=R.addImage(linked,{name:'folio-verso.png',width:1800,height:1400});
assert.equal(linked.images.length,2,'a record carries several images');
assert.throws(()=>R.addImage(linked,{id:'image-1',name:'x.png',width:10,height:10}),/Duplicate image ID/);
linked=R.annotate(linked,{start:0,end:2,type:'ciphertext',uncertain:true,alternatives:[],reading:'',reason:'',region:REGION,imageId:'image-1'});
assert.equal(linked.spans[0].imageName,'folio.png','the filename follows from the image record, not from a separate field');
// A region may not claim an image the record does not hold, or disagree with its filename.
assert.throws(()=>R.validate({...linked,spans:[{...linked.spans[0],imageId:'image-9'}]}),/recorded image/);
assert.throws(()=>R.validate({...linked,spans:[{...linked.spans[0],imageName:'other.png'}]}),/filename must match/);
// Unicode offsets survive the round trip through export and import.
const astral=R.annotate(R.create('😀 g2 😀'),{start:0,end:1,type:'ciphertext',uncertain:true,alternatives:[],reading:'',reason:'',region:null});
assert.equal(astral.spans[0].literal,'😀');
assert.deepEqual(R.validate(JSON.parse(JSON.stringify(astral))),astral);

// ── R04: revisable symbol inventory ─────────────────────────────────────────
let inv=R.buildInventory(linked);
assert.equal(inv.inventory.classes.length,3,'identical transcriptions start in one class');
assert.deepEqual(inv.inventory.classes[0].occurrences,[0,2]);
assert.equal(inv.inventory.occurrences.length,4);
// Splitting touches ONLY the selected occurrences.
inv=R.splitClass(inv,'class-1',[2],'g1-dot','The second occurrence carries a dot the first does not');
assert.deepEqual(inv.inventory.classes.find(c=>c.id==='class-1').occurrences,[0]);
assert.deepEqual(inv.inventory.classes.find(c=>c.id==='class-4').occurrences,[2]);
assert.throws(()=>R.splitClass(inv,'class-1',[1],'x','reason'),/belong to the class being split/);
assert.throws(()=>R.splitClass(inv,'class-2',[1],'x',''),/empty the class/);
assert.throws(()=>R.splitClass(inv,'class-4',[2],'x','reason'),/empty the class/);
// Merging keeps the earlier labels and reasons in the history.
const before=inv.inventory.history.length;
inv=R.mergeClasses(inv,['class-1','class-4'],'g1','Compared every occurrence; the mark is damage, not a diacritic');
assert.deepEqual(inv.inventory.classes.find(c=>c.id==='class-1').occurrences,[0,2]);
assert.equal(inv.inventory.classes.some(c=>c.id==='class-4'),false);
assert.equal(inv.inventory.history.length,before+1);
assert.match(inv.inventory.history.at(-1).detail,/g1-dot/,'the merged class keeps the earlier label in its history');
assert.match(inv.inventory.history.at(-1).detail,/dot the first does not/,'the merged class keeps the earlier reason');
assert.throws(()=>R.mergeClasses(inv,['class-1'],'x','reason'),/at least two/);
assert.throws(()=>R.mergeClasses(inv,['class-1','class-2'],'x',''),/why these are one symbol/);
// The whole decision history survives export and import.
const reopened=R.validate(JSON.parse(JSON.stringify(inv)));
assert.deepEqual(reopened.inventory.history,inv.inventory.history);
assert.deepEqual(reopened.inventory.classes,inv.inventory.classes);
// An inventory may not drift away from the source it was built against.
assert.throws(()=>R.validate({...inv,inventory:{...inv.inventory,occurrences:inv.inventory.occurrences.slice(1)}}),/does not match its source revision/);
assert.throws(()=>R.validate({...inv,inventory:{...inv.inventory,
  classes:inv.inventory.classes.map(c=>c.id==='class-2'?{...c,occurrences:[0,1]}:c)}}),/exactly one symbol class/);
// Occurrences carry their spans and image regions, and regions name their occurrences.
const occ=R.classOccurrences(inv,'class-1');
assert.equal(occ.length,2);
assert.deepEqual(occ[0].spans,['span-1']);
assert.deepEqual(occ[0].regions[0].region,REGION);
assert.equal(occ[0].regions[0].imageId,'image-1');
assert.equal(occ[1].regions.length,0,'the second occurrence has no region of its own');
const back=R.regionOccurrences(inv,'span-1');
assert.equal(back.literal,'g1');
assert.deepEqual(back.classes.map(c=>c.id),['class-1']);
assert.deepEqual(back.classes[0].occurrences,[0]);
// Fixed-width tokenization is available for digit streams.
assert.equal(R.inventoryTokens('2228','fixed',2).length,2);
assert.equal(R.inventoryTokens('2228','whitespace',1).length,1);

// ── R11: hypothesis register ────────────────────────────────────────────────
let hyp=R.addHypothesis(inv,{claim:'The leaf is by the secretary named in the catalogue entry.',confidence:'unsupported',
  supports:[{ref:'catalogue',note:'The bundle heading names that secretary.'}],
  contradicts:[{ref:'leaf',note:'The heading describes the bundle, not this leaf.'}],
  alternatives:['A different correspondent bound into the same bundle'],note:''});
assert.equal(hyp.hypotheses[0].id,'hypothesis-1');
// A clean key application cannot promote a claim on its own.
assert.throws(()=>R.addHypothesis(hyp,{claim:'x',confidence:'well-supported',supports:[{ref:'key-1',note:'The key applies to every symbol.'}]}),
  /at least two separately recorded/);
assert.throws(()=>R.addHypothesis(hyp,{claim:'x',confidence:'well-supported',
  supports:[{ref:'a',note:'b'},{ref:'c',note:'d'}],contradicts:[{ref:'e',note:'f'}]}),/counterevidence must be answered/);
assert.throws(()=>R.addHypothesis(hyp,{claim:'x',confidence:'contradicted',supports:[],contradicts:[]}),/record the evidence against it/);
assert.throws(()=>R.addHypothesis(hyp,{claim:'x',confidence:'certain'}),/declared confidence words/);
assert.throws(()=>R.addHypothesis(hyp,{claim:'',confidence:'possible'}),/needs a claim/);
assert.throws(()=>R.addHypothesis(hyp,{claim:'x',confidence:'possible',supports:[{ref:'a',note:''}]}),/identifier and a note/);
// Evidence on both sides survives export and import.
const hypBack=R.validate(JSON.parse(JSON.stringify(hyp)));
assert.deepEqual(hypBack.hypotheses,hyp.hypotheses);
assert.equal(hypBack.hypotheses[0].contradicts.length,1,'counterevidence is not dropped by a round trip');

// ── R07: lattice segmentation ───────────────────────────────────────────────
const basic={'2':'A','22':'N','8':'D'};
const exhaustive=R.segment('2228',basic);
assert.equal(exhaustive.mode,'exhaustive-lattice');
assert.equal(exhaustive.globalBestGuaranteed,true);
assert.deepEqual(exhaustive.paths.map(p=>p.text).sort(),['AAAD','AND','NAD']);
assert.equal(exhaustive.total,3);
// An exhaustive oracle, written independently of the lattice, must agree.
function oracle(digits,key,out=[],pos=0,codes=[],text=''){
  if(pos===digits.length){out.push({codes:codes.slice(),text});return out;}
  for(const [code,value] of Object.entries(key))
    if(digits.startsWith(code,pos))oracle(digits,key,out,pos+code.length,codes.concat(code),text+(typeof value==='string'?value:(value.type==='null'?'':value.values[0])));
  return out;
}
for (const digits of ['2228','22228','2282','8222']) {
  assert.equal(R.segment(digits,basic).total,oracle(digits,basic).length,'lattice path count matches the oracle for '+digits);
}
// Original digits are never rewritten.
exhaustive.paths.forEach(p=>assert.equal(p.codes.join(''),'2228'));
// Leading zeros are distinct codes, and a null contributes no reading.
const zeroKey={'0':'Z','02':'Q','2':'A','8':'D'};
assert.deepEqual(R.segment('028',zeroKey).paths.map(p=>p.text).sort(),['QD','ZAD']);
const nullKey={'2':'A','22':'N','8':'D','0':{type:'null',values:[]}};
assert.deepEqual(R.segment('2028',nullKey).paths.map(p=>p.text).sort(),['AAD']);
assert.equal(R.segment('2028',nullKey).paths[0].codes.join(''),'2028','a null still consumes its digits');
// Word codes with several readings stay unresolved rather than being silently chosen.
const wordKey={'2':'A','22':{type:'word',values:['AND','ALSO']},'8':'D'};
const worded=R.segment('228',wordKey);
assert.ok(worded.paths.some(p=>p.alternatives.length===1&&p.alternatives[0].values.length===2),'an alternative reading is reported, not resolved');
assert.throws(()=>R.segment('228',{'2':{type:'null',values:['A']}}),/null code contributes no reading/);
assert.throws(()=>R.segment('228',{'2':{type:'logogram',values:['A']}}),/Unknown numerical code type/);
// Line boundaries are source structure: no code may span one by default.
assert.deepEqual(R.segment('22\n28',basic).paths.map(p=>p.text).sort(),['AAAD','NAD']);
assert.equal(R.segment('22\n28',basic).paths[0].codes.join(''),'22\n28','the line break survives in the code sequence');
// Under the default policy no code crosses the break, so 2|22|8 is unreachable.
assert.equal(R.segment('22\n28',basic).total,2);
// Under 'span' it becomes reachable, and the break still survives in the path.
const spanned=R.segment('22\n28',basic,[],10000,()=>0,{lineBreaks:'span'});
assert.deepEqual(spanned.paths.map(p=>p.text).sort(),['AAAD','AND','NAD'],'a code may cross the break only under the span policy');
assert.ok(spanned.paths.every(p=>p.codes.join('')==='22\n28'),'every path reproduces the source exactly, line break included');
assert.ok(spanned.paths.some(p=>p.entries.some(e=>e.source!==e.code)),'a code that crossed the break records the source slice it consumed');
// Ties are kept, not broken arbitrarily into a single answer.
assert.equal(R.segment('2228',basic,[],10000,()=>0).paths.length,3);
// Wrong key: no path, and the result says the search was exhaustive.
assert.equal(R.segment('2228',{'22':'N','8':'D'}).total,0);
assert.equal(R.segment('2228',{'22':'N','8':'D'}).complete,true);
// Cutoff: the k-best mode must withdraw the global-best guarantee and say why.
const capped=R.segment('2'.repeat(20),{'2':'A','22':'N'},[],1000);
assert.equal(capped.total,10946,'the exact path count is still computed from the lattice');
assert.equal(capped.mode,'bounded-k-best');
assert.equal(capped.complete,false);
assert.equal(capped.globalBestGuaranteed,false);
assert.match(capped.pruning,/can discard the globally best path/);
assert.ok(capped.paths.length<=32);
// The ambiguity view is read from the lattice, so it is exact in both modes.
const ambiguity=exhaustive.ambiguity;
assert.equal(ambiguity.length,3);
assert.equal(ambiguity.find(a=>a.position===3).forced,true,'every path cuts before the final 8');
assert.equal(ambiguity.find(a=>a.position===1).forced,false,'the first boundary is genuinely ambiguous');
assert.deepEqual(R.segment('2228',basic,[1]).paths.map(p=>p.text).sort(),['AAAD','AND']);
assert.equal(R.segment('2228',basic,[1]).ambiguity.find(a=>a.position===1).locked,true);
// Segmentation error is a different measurement from plaintext error.
const seg=R.segmentMetrics(['2','22','8'],['22','2','8']);
assert.equal(seg.boundarySymmetricDifference,2);
assert.equal(seg.exactCodes,false);
assert.equal(R.segmentMetrics(['2','22','8'],['2','22','8']).boundaryError,0);
assert.equal(R.metrics('AND','NAD').editDistance,2,'one moved boundary changed two letters');

// ── R08: beam-search baseline ───────────────────────────────────────────────
const tokens=['x','y','z','x','y','z','x','z'];
const scorer=p=>Array.from(p).filter(c=>c==='A').length;
const beam=R.beamSearch(tokens,{beam:20,branch:26,locks:{x:'A',y:'A'}},scorer);
assert.equal(beam.algorithm,'beam-search');
assert.equal(beam.admissible,false,'the partial score is declared non-admissible');
assert.equal(beam.verified,false);
assert.match(beam.scope,/pruning can discard/);
assert.deepEqual(beam.extensionOrder,['z'],'locked symbols are not extended');
for(const c of beam.candidates){assert.equal(c.key.x,'A');assert.equal(tokens.map(t=>c.key[t]).join(''),c.plaintext);}
// Deterministic: the same inputs give the same result, with no seed involved.
assert.deepEqual(R.beamSearch(tokens,{beam:20,branch:26,locks:{x:'A',y:'A'}},scorer),beam);
// Arbitrary relabelling cannot change the outcome.
const renamed=tokens.map(t=>({x:'new-99',y:'Δ',z:'42'})[t]);
const relabelled=R.beamSearch(renamed,{beam:20,branch:26,locks:{'new-99':'A','Δ':'A'}},scorer);
assert.deepEqual(relabelled.candidates.map(c=>[c.plaintext,c.score]),beam.candidates.map(c=>[c.plaintext,c.score]));
// A fully locked key is application, not recovery.
const applied=R.beamSearch(tokens,{beam:5,locks:{x:'A',y:'A',z:'B'}},scorer);
assert.equal(applied.task,'known-key-application');
assert.equal(applied.candidates[0].plaintext,'AABAABAB');
assert.throws(()=>R.beamSearch(tokens,{beam:20,locks:{absent:'A'}},scorer),/present symbol/);
assert.throws(()=>R.beamSearch(Array(600).fill('x').map((_,i)=>'s'+(i%100)),{beam:2000,branch:26},scorer),/400 million/);

// ── R05: investigation bundle ───────────────────────────────────────────────
const state={title:'Example',created:'2026-10-29',scoringModel:'museum-prose-quadgram-v1',solver:'annealing',
  selectedLayer:'revision-1',keyRevisions:[{at:'2026-10-29',reason:'crib',locks:{g1:'A'}}],
  search:{algorithm:'annealing',raw:'g1 g2 g1',seed:41,steps:1000,locks:{},elapsedMs:12},
  segmentation:{digits:'2228',key:basic,boundaries:[],budget:10000,scoring:'neutral',lineBreaks:'boundary'},
  candidates:[{plaintext:'ABA',score:-1.5,key:{g1:'A',g2:'B'},chosen:true,provenance:'seed 41'}]};
const bundle=R.bundle(hyp,state);
assert.equal(bundle.kind,'cipher-museum-investigation');
assert.equal(bundle.version,R.BUNDLE_VERSION);
assert.equal(bundle.tool.modelBuild,R.MODEL_BUILD,'the bundle records the build that made it');
assert.equal(bundle.images.length,2,'image identity travels; bytes do not');
assert.ok(bundle.images.every(i=>i.sha256!==undefined&&i.width>0));
assert.match(bundle.imageBytes,/deliberately not included/);
assert.equal(bundle.candidates[0].verified,false,'a recorded candidate is never marked verified');
// A fresh session restores the declared state.
const resumed=R.openBundle(JSON.parse(JSON.stringify(bundle)));
assert.equal(resumed.title,'Example');
assert.equal(resumed.selectedLayer,'revision-1');
assert.deepEqual(resumed.keyRevisions[0].locks,{g1:'A'});
assert.equal(resumed.search.seed,41);
assert.equal(resumed.segmentation.digits,'2228');
assert.deepEqual(resumed.evidence.inventory.history,hyp.inventory.history);
assert.deepEqual(resumed.evidence.hypotheses,hyp.hypotheses);
assert.equal(resumed.stale.source,false);
assert.equal(resumed.stale.search,false);
// Changed input invalidates the stale result instead of reusing it.
const movedSource=JSON.parse(JSON.stringify(bundle));
movedSource.evidence=R.revise(R.validate(movedSource.evidence),'g1 g2 g1 g9','Reread the fourth symbol');
assert.equal(R.openBundle(movedSource).stale.source,true);
assert.equal(R.openBundle(movedSource).stale.candidates,true,'candidates go stale with their input');
const movedSearch=JSON.parse(JSON.stringify(bundle)); movedSearch.search.raw='g1 g2 g2';
assert.equal(R.openBundle(movedSearch).stale.search,true);
const movedSegment=JSON.parse(JSON.stringify(bundle)); movedSegment.segmentation.digits='2229';
assert.equal(R.openBundle(movedSegment).stale.segmentation,true);
const movedBuild=JSON.parse(JSON.stringify(bundle)); movedBuild.tool.modelBuild='research-model-1999-01-01';
assert.equal(R.openBundle(movedBuild).stale.modelBuild,true,'replay needs the same build, not only the same seed');
// Incompatible or damaged bundles are rejected outright.
assert.throws(()=>R.openBundle({kind:'cipher-museum-investigation',version:99}),/Unsupported investigation-bundle version/);
assert.throws(()=>R.openBundle({kind:'something-else',version:1}),/not a Cipher Museum investigation bundle/);
assert.throws(()=>R.openBundle(JSON.parse(JSON.stringify({...bundle,evidence:{...bundle.evidence,version:7}}))),/Unsupported evidence document/);
assert.throws(()=>R.openBundle(JSON.parse(JSON.stringify({...bundle,selectedLayer:'layer-99'}))),/does not contain/);
assert.throws(()=>R.openBundle(JSON.parse(JSON.stringify({...bundle,candidates:[{plaintext:'A',score:'high',key:{}}]}))),/finite score/);
// The fingerprint is declared non-cryptographic but must separate different inputs.
assert.notEqual(R.fingerprint('g1 g2'),R.fingerprint('g1 g3'));
assert.equal(R.fingerprint('g1 g2'),R.fingerprint('g1 g2'));

// ── R06: language profiles, comparison and abstention ───────────────────────
const profileData=JSON.parse(fs.readFileSync(path.join(root,'data/research/v2/language-profiles.json'),'utf8'));
const profiles=Lang.buildProfiles(profileData);
assert.equal(profiles.profiles.length,3);
assert.ok(profileData.profiles.every(p=>p.sources.length&&p.sources.every(s=>s.sha256&&s.url&&s.work)),'every profile records its corpus provenance');
assert.ok(profileData.profiles.every(p=>p.rights&&p.normalization&&p.period&&p.limits&&p.coverage),'rights, period, normalization, coverage and limits are published');
const french=profileData.profiles.find(p=>p.id==='historical-french-1580');
assert.ok(french.sources[0].orthographyProbe.archaicShare>0.9,'the French extraction kept original spelling, not the modern rendering');
assert.equal(profileData.baseline.id,'museum-prose-quadgram-v1','the modern-English model stays available and disclosed as a baseline');
const clean=t=>t.toUpperCase().normalize('NFD').replace(/[^A-Z]/g,'');
// Every declared development probe behaves as recorded, including the negative controls.
for (const probe of profileData.development) {
  const r=profiles.compare(clean(probe.text));
  const got=r.decided?r.choice:null;
  assert.equal(got,probe.expect,'development probe '+probe.id+' expected '+probe.expect+' and got '+got);
  if (probe.expect===null) assert.ok(r.abstentionReasons.length,'abstention on '+probe.id+' states a reason');
}
// Raw scores are never offered as probabilities, and a missing language cannot be chosen.
const ranked=profiles.compare(clean('Il nest rien si certain que la mort et rien si incertain que lheure dicelle cest vne chose'));
assert.ok(ranked.ranking.every(r=>r.meanLogProbability<0&&r.coverage>=0&&r.coverage<=1));
assert.match(ranked.meaning,/not a probability/);
assert.equal(ranked.ranking.some(r=>r.id==='english'),false);
assert.throws(()=>profiles.compare('ABC',['historical-french-1580']),/at least two profiles/);
assert.throws(()=>profiles.compare('ABCDEF',['historical-french-1580','does-not-exist']),/Unknown language profile/);
assert.throws(()=>profiles.byId['historical-french-1580'].fitness('abc'),/uppercase A–Z only/);
// The profile scorer drives the solver like any other scoring function.
const profileRun=R.search(['a','b','a','b','a','b'],{seed:1,steps:50,locks:{}},profiles.byId['historical-latin-classical'].fitness);
assert.equal(profileRun.model,'historical-latin-classical');

// ── Worker: solver and scoring-model selection ──────────────────────────────
const messages=[],scope={};scope.self=scope;scope.postMessage=x=>messages.push(x);vm.createContext(scope);
scope.fetch=async file=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,
  String(file).includes('v2')?'data/research/v2/language-profiles.json':'data/research/v1/language-model.json')))});
scope.importScripts=(...files)=>files.forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),scope));
vm.runInContext(fs.readFileSync(path.join(root,'js/research-worker.js'),'utf8'),scope);
await scope.onmessage({data:{raw:'x y x',options:{seed:1,steps:10,locks:{x:'A',y:'N'}},algorithm:'annealing'}});
assert.equal(messages.at(-1).result.candidates[0].plaintext,'ANA');
await scope.onmessage({data:{raw:'x y x',options:{beam:5,branch:26,locks:{x:'A',y:'N'}},algorithm:'beam'}});
assert.equal(messages.at(-1).result.algorithm,'beam-search');
assert.equal(messages.at(-1).result.candidates[0].plaintext,'ANA');
await scope.onmessage({data:{raw:'x y x',options:{seed:1,steps:10,locks:{x:'A',y:'N'}},model:'historical-latin-classical'}});
assert.equal(messages.at(-1).result.model,'historical-latin-classical');
await scope.onmessage({data:{raw:'x y x',options:{seed:1,steps:10,locks:{}},model:'no-such-profile'}});
assert.match(messages.at(-1).error,/Unknown scoring profile/);

// ── Real page DOM ───────────────────────────────────────────────────────────
const dom=new JSDOM(fs.readFileSync(path.join(root,'lab/evidence-workbench.html'),'utf8'),
  {url:'https://ciphermuseum.com/lab/evidence-workbench.html',runScripts:'outside-only'});
const w=dom.window,$=id=>w.document.getElementById(id);
let lastWorker,posted=null;
w.Worker=class{constructor(){lastWorker=this;}postMessage(v){posted=v;this.input=v;}terminate(){this.terminated=true;}};
w.fetch=undefined;
w.eval(fs.readFileSync(path.join(root,'js/research-model.js'),'utf8'));
w.eval(fs.readFileSync(path.join(root,'js/research-language-model.js'),'utf8'));
w.eval(fs.readFileSync(path.join(root,'js/detective/lang-model.js'),'utf8'));
w.eval(fs.readFileSync(path.join(root,'js/research-ui.js'),'utf8'));
// Build an inventory, then split one occurrence from the keyboard-accessible list.
$('source-raw').value='g1 g2 g1 g3';$('revision-reason').value='Initial source entry';$('save-revision').click();
$('inventory-build').click();
assert.match($('inventory-status').textContent,/Built 3 classes from 4 occurrences/);
const occurrenceButtons=$('occurrence-list').querySelectorAll('button');
assert.equal(occurrenceButtons.length,2,'the all-occurrences view lists every occurrence of the class');
assert.equal(occurrenceButtons[0].getAttribute('aria-pressed'),'false','occurrences are keyboard-operable buttons with pressed state');
occurrenceButtons[1].click();
assert.equal($('occurrence-list').querySelectorAll('button')[1].getAttribute('aria-pressed'),'true');
$('split-label').value='g1-dot';$('split-reason').value='Dot visible on the second occurrence only';$('inventory-split').click();
assert.match($('inventory-status').textContent,/Split 1 occurrence/);
assert.match($('inventory-history').textContent,/g1-dot/);
// Segmentation reports its mode and whether the global best still holds.
$('segment-run').click();
assert.match($('segment-output').textContent,/Every complete path was enumerated/);
assert.match($('segment-output').textContent,/globally best one/);
$('segment-budget').value='1';$('segment-budget').dispatchEvent(new w.Event('input'));
assert.match($('segment-output').textContent,/Recompute/);
$('segment-run').click();
assert.match($('segment-output').textContent,/NOT guaranteed/);
// Switching solver invalidates a completed receipt.
$('search-example').click();$('search-run').click();
assert.equal(posted.algorithm,'annealing');
assert.equal($('search-cancel').disabled,false);
lastWorker.onmessage({data:{result:beam}});
assert.equal($('search-export').disabled,false);
$('search-algorithm').value='beam';$('search-algorithm').dispatchEvent(new w.Event('change'));
assert.equal($('search-export').disabled,true,'changing the solver invalidates the previous receipt');
$('search-run').click();
assert.equal(posted.algorithm,'beam');
assert.equal(posted.options.beam,150);
// Cancelled workers cannot resurrect a receipt.
$('search-cancel').click();
assert.equal(lastWorker.terminated,true);
lastWorker.onmessage({data:{result:beam}});
assert.equal($('search-export').disabled,true);
// The hypothesis register refuses to promote a claim on a clean key application.
$('hypothesis-claim').value='The key applies to every symbol, so the attribution is settled.';
$('hypothesis-confidence').value='well-supported';
$('hypothesis-supports').value='key-1 | The key applies to all symbols';
$('hypothesis-add').click();
assert.match($('record-status').textContent,/at least two separately recorded/);
assert.equal($('hypothesis-list').textContent,'');
$('hypothesis-confidence').value='possible';$('hypothesis-add').click();
assert.match($('hypothesis-list').textContent,/possible/);
assert.match($('record-status').textContent,/Applying a key cleanly does not promote a claim/);
// A guided example loads a case whose outcome stays incomplete.
$('bundle-example').value='unidentified';$('bundle-load-example').click();
assert.match($('bundle-status').textContent,/deliberately incomplete/);
assert.match($('hypothesis-list').textContent,/unsupported/);
assert.match($('hypothesis-list').textContent,/misleading/i);
assert.match($('hypothesis-list').textContent,/contradicted/);
// An invalid bundle import must leave the current record untouched.
const beforeImport=$('hypothesis-list').textContent;
w.document.getElementById('bundle-import');
assert.ok(beforeImport.length>0);
// No imported text is ever interpreted as markup.
$('source-raw').value='<img src=x onerror=alert(1)> g2';$('revision-reason').value='Markup safety check';$('save-revision').click();
assert.equal($('revision-list').querySelector('img'),null);
assert.equal($('span-list').querySelector('img'),null);
dom.window.close();
console.log('Research workbench v2: image transforms, symbol inventory, hypotheses, lattice segmentation, beam search, bundles, language profiles and DOM checks passed.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
