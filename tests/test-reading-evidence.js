'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const E = require('../js/reading-evidence');
assert.deepEqual(E.applyKey('A'), { text:'SOON IN DINO', unresolved:0, total:10 });
assert.deepEqual(E.applyKey('B'), { text:'MEET AT ?ATE', unresolved:1, total:10 });
assert.deepEqual(E.applyKey('C'), { text:'MEET AT GATE', unresolved:0, total:10 });
assert.throws(() => E.applyKey('__proto__'));
const expected = ['cleartext','ciphertext','cleartext','uncertain','ciphertext','uncertain'];
assert.ok(E.checkSpans(expected).every(r => r.agrees));
assert.throws(() => E.checkSpans(['']));
assert.equal(E.shift('SEND THE SHIP AT NOON',7),'ZLUK AOL ZOPW HA UVVU');
assert.equal(E.distance('SHIP','HIP'),1);
assert.equal(E.distance('SHIP','THIP'),1);
assert.equal(E.distance('SHIP','SHIPPE'),2);
assert.equal(E.distance('','ABC'),3);
// Independently check every possible key, including wraparound, without supplying
// the key to the ranker. Nonmatching inputs must remain tied.
for(let k=0;k<26;k++) assert.equal(E.rankCaesar(E.shift('SEND THE SHIP AT NOON',k),'modern')[0].key,k);
assert.equal(E.rankCaesar('XYZ','modern').filter(r => r.score===0).length,26);
for(const spelling of ['modern','older']) for(const noise of ['none','substitute','delete']) for(const model of ['modern','older']) {
  const r=E.noiseExperiment(spelling,noise,model);
  assert.equal(r.baseline.edits,0); assert.equal(r.changed.edits,noise==='none'?0:1);
  assert.equal(r.changed.ranked[0].key,7); assert.equal(r.changed.ties,1);
  assert.equal(r.baseline.ranked[0].score,spelling===model?5:2);
  assert.equal(r.changed.ranked[0].score,spelling===model?(noise==='none'?5:4):2);
  assert.equal(r.clean.length-r.damaged.length,noise==='delete'?1:0);
}
assert.equal(E.noiseExperiment('older','none','modern').changed.ranked[0].text,'SENDE THE SHIPPE AT NOONE','No silent modernization');
assert.throws(()=>E.noiseExperiment('bad','none','modern'));
assert.deepEqual(E.recurrence(['Q','Z','Z','R','Q','Z','S','R']),[1,2,2,3,1,2,4,3]);
for(let n=2;n<=64;n++) {
  const seq=Array.from({length:n},(_,i)=>'symbol'+((i*i)%7));
  assert.deepEqual(E.recurrence(seq),E.recurrence(E.rename(seq)));
  assert.notDeepEqual(E.recurrence(seq),E.recurrence(E.alter(seq)));
}
assert.deepEqual(E.alter(['A','B','C']),['A','B','A']);
assert.deepEqual(E.alter(['A']),['A']);
assert.throws(()=>E.tokens(' '));assert.throws(()=>E.tokens('x '.repeat(65)));
const html=fs.readFileSync('lab/reading-the-evidence.html','utf8');
const dom=new JSDOM(html,{runScripts:'outside-only'}), doc=dom.window.document;
E.mount(doc);
const $=id=>doc.getElementById(id), change=(id,v)=>{ $(id).value=v;$(id).dispatchEvent(new dom.window.Event('change',{bubbles:true})); };
change('key-choice','C'); assert.equal($('key-literal').textContent,'MEET AT GATE');
$('key-reveal').click();assert.equal($('key-copy').hidden,false);
change('key-choice','B');assert.equal($('key-copy').hidden,true);
$('keys-compare').click();assert.match($('key-result').textContent,/A and C both cover/);
$('key-reset').click();assert.equal($('key-choice').value,'A');
$('span-check').click();assert.match($('span-feedback').textContent,/every passage/);
expected.forEach((v,i)=>change('span-guess-'+i,v));$('span-check').click();assert.match($('span-feedback').textContent,/6\/6/);
change('span-guess-0','uncertain');assert.match($('span-feedback').textContent,/changed/);
$('span-reset').click();assert.equal($('span-guess-0').value,'');
change('noise-kind','delete');assert.match($('noise-results').textContent,/SEND THE HIP AT NOON/);
change('noise-spelling','older');change('noise-profile','older');assert.match($('noise-results').textContent,/SENDE THE HIPPE AT NOONE/);
$('noise-reset').click();assert.equal($('noise-kind').value,'none');assert.match($('noise-results').textContent,/0\/17 = 0.0%/);
$('pattern-alter').click();assert.match($('pattern-result').textContent,/pattern changed/);
$('pattern-rename').click();assert.equal($('pattern-a').textContent,$('pattern-b').textContent);
$('pattern-symbols').querySelectorAll('button')[1].click();assert.match($('pattern-positions').textContent,/2, 3, 6/);
$('pattern-input').value='<script> X <script>';$('pattern-rename').click();assert.equal($('pattern-original').textContent,'<script> X <script>');assert.equal($('pattern-original').children.length,0);
$('pattern-input').value='';$('pattern-rename').click();assert.match($('pattern-result').textContent,/Use 1–64/);assert.equal($('pattern-a').textContent,'');
$('pattern-reset').click();assert.equal($('pattern-a').textContent,'1 2 2 3 1 2 4 3');
assert.equal(doc.querySelectorAll('.evidence-exercise .paper-credit').length,4);
for(const a of doc.querySelectorAll('a[href]')) assert.ok(!/drive\.google|docs\.google/.test(a.href),'Public credits must not expose private Drive copies');
for(const select of doc.querySelectorAll('select')) assert.ok(doc.querySelector('label[for="'+select.id+'"]'));
dom.window.close();
console.log('Reading the Evidence: keys, labels, exhaustive shift search, edit metrics, recurrence invariance, controls, resets and source-link checks passed.');
