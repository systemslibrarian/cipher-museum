'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { JSDOM } = require('jsdom');
const { generate, BASE_SHA256 } = require('../scripts/expand-corpus-v06');
const { engineNameFor, extractKey, expectedPlaintext } = require('./engines/corpus-replay');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const jsonl = p => read(p).trim().split('\n').map(l => JSON.parse(l));
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
const lines = read('public/corpus/all.jsonl').trimEnd().split('\n');
assert.equal(sha(lines.slice(0,100026).join('\n') + '\n'), BASE_SHA256, 'v0.5 records and splits remain byte-identical');
const all = lines.map(l => JSON.parse(l));
const ids = new Map(all.map(r => [r.id,r]));
assert.equal(ids.size, all.length, 'No duplicate IDs');
const added = jsonl('public/corpus/manual-ciphers-v0.6.jsonl');
assert.deepEqual(added, generate(), 'Deterministic expansion');
assert.deepEqual(all.slice(100026), added);
assert.equal(added.length,300);
const types = ['rs44','double_playfair','amsco'];
assert.equal(new Set(all.map(r => r.cipher_type)).size,85);
assert.equal(new Set(added.map(r => r.plaintext)).size,300,'Distinct new plaintexts across types and splits');
for(const type of types) {
  const group = added.filter(r => r.cipher_type === type);
  assert.equal(group.length,100);assert.equal(group.filter(r => r.split === 'public').length,70);
  assert.equal(group.filter(r => r.split === 'blind').length,30);
  for(const r of group) {
    assert.equal(r.source_type,'synthetic');
    const e=global.CipherEngines[engineNameFor(type)], key=extractKey(r);
    assert.equal(e.encode(r.plaintext,key),r.ciphertext);
    assert.equal(e.decode(r.ciphertext,key),expectedPlaintext(r));
    assert.throws(() => extractKey({...r,key:{}}), /explicit key.settings/);
    // Negative control: replacing a stored ciphertext must fail verification.
    const corrupt=(r.ciphertext[0]==='A'?'B':'A')+r.ciphertext.slice(1);
    assert.notEqual(e.encode(r.plaintext,key),corrupt);
  }
}
const fixture = require('./engines/helpers/historical-vectors');
for(const [type,v] of [['rs44',fixture.rs44],['double_playfair',fixture.doublePlayfair],['amsco',fixture.amsco]]) {
  const engine=global.CipherEngines[engineNameFor(type)];
  assert.equal(engine.encode(v.plain),v.cipher,'Independent published answer for '+type);
  assert.equal(engine.decode(v.cipher),v.plain);
}
const dp={cipher_type:'double_playfair',plaintext:'JA',alphabet:'A-Z',casing:'uppercase',key:{type:'settings',settings:{filler:'Z'}}};
assert.equal(expectedPlaintext(dp),'IIAZ','J→II before odd-length filler');
assert.equal(expectedPlaintext({...dp,plaintext:'AZ'}),'AZ','Genuine trailing Z retained');
const stats=JSON.parse(read('public/corpus/stats.json'));
const counted={};for(const r of all){const n=engineNameFor(r.cipher_type);counted[n]=(counted[n]||0)+1;}
assert.deepEqual(stats.perEngine,counted);assert.equal(stats.records,all.length);
const manifest=JSON.parse(read('corpus/engine-manifest.json'));
assert.equal(manifest.total_records,all.length);
for(const e of manifest.engines) assert.equal(e.record_count,counted[e.name]||0,e.name);
assert.deepEqual(manifest.engines.filter(e=>e.record_count).map(e=>e.name).sort(),Object.keys(counted).sort());
const sample=JSON.parse(read('public/corpus/browser-sample.json'));
for(const type of types) assert(sample.some(r => r.cipher_type===type && r.split==='public'));
for(const r of sample.filter(r=>r.id.startsWith('v06-'))) assert.deepEqual(r,ids.get(r.id));
const evals=jsonl('public/corpus/llm-3shot-eval.jsonl');
assert.equal(evals.length,300);
for(const type of types) assert(evals.some(r=>r.cipher_type===type));
for(const r of evals){const source=ids.get(r.source_record);assert(source);assert.equal(source.split,'public');
 if(types.includes(r.cipher_type)) {assert.equal(r.prompts.three_shot.evaluation.target,expectedPlaintext(source));assert.equal(r.prompts.key_recovery.evaluation.target,JSON.stringify(source.key.settings));}}
for(const name of ['beginner','intermediate','advanced','expert']) {
 const subset=jsonl('public/corpus/'+name+'.jsonl');
 for(const r of subset.filter(r=>r.id.startsWith('v06-'))) {assert.deepEqual(r,ids.get(r.id));assert.equal(r.difficulty,name);}
 assert.equal(subset.filter(r=>r.id.startsWith('v06-')).length,added.filter(r=>r.difficulty===name).length);
}
// Execute the actual dropdown and buttons against the shipped minified bundle.
const dom=new JSDOM(read('lab/workbench.html'),{runScripts:'outside-only'});
dom.window.eval(read('js/ciphers/all-engines.min.js'));
for(const script of dom.window.document.querySelectorAll('script:not([src])'))dom.window.eval(script.textContent);
const d=dom.window.document,sel=d.getElementById('wbCipher');
const options=[...sel.options].map(o=>o.value);
assert.deepEqual(options.sort(),Object.keys(dom.window.CipherEngines).sort(),'Every engine selectable exactly once');
for(const r of added.filter((_,i)=>i%25===0)) {
 sel.value=engineNameFor(r.cipher_type);sel.dispatchEvent(new dom.window.Event('change'));
 d.getElementById('wbInput').value=r.plaintext;d.getElementById('wbKey').value=JSON.stringify(r.key.settings);
 d.getElementById('wbEncode').click();assert.equal(d.getElementById('wbOutput').textContent,r.ciphertext);
 d.getElementById('wbInput').value=r.ciphertext;d.getElementById('wbDecode').click();assert.equal(d.getElementById('wbOutput').textContent,expectedPlaintext(r));
}
for(const name of ['patterson','wadsworth','venonaPadReuse']) {
 sel.value=name;sel.dispatchEvent(new dom.window.Event('change'));d.getElementById('wbKey').value='';
 d.getElementById('wbInput').value='THEQUICKBROWNFOX';d.getElementById('wbEncode').click();
 const ct=d.getElementById('wbOutput').textContent;assert(ct&&!ct.startsWith('Error'));
 d.getElementById('wbInput').value=ct;d.getElementById('wbDecode').click();assert.equal(d.getElementById('wbOutput').textContent,'THEQUICKBROWNFOX');
}
dom.window.close();
// Download buttons must resolve to the regenerated files, not old eval mirrors.
const downloadDom=new JSDOM(read('cipher-corpus.html'),{runScripts:'outside-only'});
let opened;
downloadDom.window.open=url=>{opened=url;};
downloadDom.window.eval(read('js/ui-delegates.js'));
for(const name of ['llm-3shot-eval.jsonl','manual-ciphers-v0.6.jsonl','all.jsonl']) {
 downloadDom.window.document.querySelector(`[data-file="${name}"]`).click();
 assert.equal(opened,'/public/corpus/'+name);
}
downloadDom.window.close();
const ciWorkflow = read('.github/workflows/ci.yml');
const corpusJob = ciWorkflow.slice(
  ciWorkflow.indexOf('\n  validate-corpus:'),
  ciWorkflow.indexOf('\n  deploy-pages:')
);
assert.ok(corpusJob.length > 0, 'dedicated corpus-validation job exists');
assert.doesNotMatch(corpusJob, /^\s+if:/m,
  'dedicated corpus validation runs on pull requests as well as main');
const deploymentNeeds = /deploy-pages:\s*\n\s+needs:\s*\[([^\]]+)\]/.exec(ciWorkflow);
assert.ok(deploymentNeeds, 'Pages deployment declares its validation dependencies');
const dependencyNames = deploymentNeeds[1].split(',').map(name => name.trim());
for (const required of ['test', 'browser-tests', 'validate-corpus']) {
  assert.ok(dependencyNames.includes(required),
    'Pages deployment waits for ' + required + ' on the same commit');
}
assert.match(ciWorkflow,/deploy-pages:[\s\S]*ref: \$\{\{ github\.sha \}\}[\s\S]*lfs: true/,
  'Pages deploys exact validated Git/LFS bytes');
assert.match(ciWorkflow,/sha256sum -c SHA256SUMS.txt/);
console.log('Corpus v0.6: append-only baseline, 300 new records, keys, independent answers, metadata, split/export coverage and all 88 workbench options verified.');
