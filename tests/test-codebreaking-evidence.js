'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const m = require('../js/codebreaking-evidence');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
const near = (a,b) => assert(Math.abs(a-b) < 1e-10, `${a} != ${b}`);
function dom(file) {
  const d = new JSDOM(read(file), { runScripts: 'outside-only', url: 'https://ciphermuseum.com/' + file });
  d.window.eval(read('js/codebreaking-evidence.js'));
  return d;
}
function change(d,id,value,type='change') {
  const el=d.window.document.getElementById(id);
  if (typeof value === 'boolean') el.checked=value; else el.value=value;
  el.dispatchEvent(new d.window.Event(type,{bubbles:true}));
}
test('evidence is a likelihood ratio, including negative evidence', () => {
  near(m.evidence(0,0).score,0);
  near(m.evidence(1,1).factor,1.95);
  near(m.evidence(0,1).factor,0.962);
  const r=m.evidence(5,40);
  near(r.factor,1.95**5*0.962**35);
  assert(r.score<m.evidence(5,5).score);
  near(m.evidence(3,20).score+m.evidence(2,20).score,r.score);
  near(m.evidence(5,40,1/26).score,0);
  assert.throws(()=>m.evidence(2,1));assert.throws(()=>m.evidence(1,2,1));
});
test('alignment counts only real overlap in both directions', () => {
  const r=m.alignment(3);assert.equal(r.total,45);assert.equal(r.matches,8);
  near(r.factor,1.95**8*0.962**37);
  for(const offset of [-6,-1,0,1,6]) {
    const r=m.alignment(offset);assert.equal(r.total,48-Math.abs(offset));
    assert(r.pairs.every(p=>p.indexA-p.indexB===offset));
    assert.equal(r.matches,r.pairs.filter(p=>p.a===p.b).length);
  }
  assert.equal(m.alignment(3,16).total,16);
  assert.equal(m.rankAlignments(48)[0].offset,3);
  assert.throws(()=>m.alignment(7));
});
test('cycle extraction handles fixed points and rejects non-permutations', () => {
  assert.deepEqual(m.cycles([0,2,1]),[[0],[1,2]]);
  assert.throws(()=>m.cycles([1,1]));
});
test('conjugation preserves cycle lengths for all 40320 labelings', () => {
  const p=[2,7,4,1,6,3,0,5];
  let checked=0;
  function visit(prefix,rest) {
    if(!rest.length) {
      const q=m.conjugate(p,prefix);
      // Independent identity: q(S(x)) = S(p(x)).
      for(let x=0;x<8;x++)assert.equal(q[prefix[x]],prefix[p[x]]);
      assert.deepEqual(m.cycles(q).map(c=>c.length).sort(),[4,4]);checked++;return;
    }
    rest.forEach((x,i)=>visit([...prefix,x],rest.filter((_,j)=>i!==j)));
  }
  visit([],Array.from({length:8},(_,i)=>i));assert.equal(checked,40320);
});
test('indicators use repeated keys and yield the displayed permutation', () => {
  for(const board of Object.keys(m.BOARDS)) {
    const r=m.indicators(board);const seen=new Set();
    for(const row of r.rows) {seen.add(row[0]);assert.equal(r.observed[row[0]],row[3]);}
    assert.equal(seen.size,8);assert.deepEqual(r.lengths,[4,4]);
    for(const state of m.MAPS)for(let x=0;x<8;x++){assert.notEqual(state[x],x);assert.equal(state[state[x]],x);}
  }
  assert.deepEqual(m.indicators().observed,[2,7,4,1,6,3,0,5]);
  assert.notDeepEqual(m.indicators('ahbe').observed,m.indicators().observed);
});
test('wheel-policy counts hold for every possible previous order', () => {
  assert.equal(new Set(m.ALL_ORDERS.map(x=>x.join(''))).size,60);
  for(const previous of m.ALL_ORDERS) {
    assert.equal(m.wheelOrders(previous,false,false).count,60);
    assert.equal(m.wheelOrders(previous,false,true).count,59);
    const r=m.wheelOrders(previous,true,false);assert.equal(r.count,32);near(r.bits,5);
    assert(r.orders.every(order=>order.every((x,i)=>x!==previous[i])));
    assert.deepEqual(m.wheelOrders(previous,true,true).orders,r.orders);
  }
  assert.throws(()=>m.wheelOrders([1,1,2],true,false));
});
test('paired messages recover a key and reject an equally long decoy', () => {
  const f=m.dispatchCase('same'),p=m.caesar(f.weak,-4);
  assert.equal(p,'SENDSUPPLIESTOHARBOR');assert.equal(p.length,20);
  assert.equal(f.strong,'LMQHKNXSPAXAWSZTZESJ');
  assert.equal(m.deriveKey(f.strong,p),'TIDES');
  assert.deepEqual(m.checkDispatch(p,'TIDES'),{decoded:p,matches:15,total:15,consistent:true});
  const decoy=m.caesar(m.dispatchCase('different').weak,-4);
  assert.equal(decoy.length,p.length);assert.equal(m.dispatchCase('different').strong,f.strong);
  const key=m.deriveKey(f.strong,decoy);assert.equal(key,'TIDEV');
  assert.equal(m.vigenere(f.strong,key,true).slice(0,5),decoy.slice(0,5));
  assert.equal(m.checkDispatch(decoy,key).consistent,false);
  assert.equal(m.checkDispatch(p,'WRONG').consistent,false);
});
test('Banburismus UI recomputes score, overlap and ranking', () => {
  const d=dom('ciphers/joan-clarke.html'),$=id=>d.window.document.getElementById(id);
  change(d,'ban-offset','3','input');
  assert.match($('ban-result').textContent,/8 coincidences in 45 comparisons/);
  assert.equal($('ban-strip-a').children.length,45);assert.equal($('ban-strip-a').querySelectorAll('.is-match').length,8);
  assert.equal($('ban-ranking').children.length,13);assert.equal($('ban-ranking').firstElementChild.cells[0].textContent,'+3');
  change(d,'ban-sample','16');assert.equal($('ban-strip-a').children.length,16);
  assert.match($('ban-result').textContent,/in 16 comparisons/);d.window.close();
});
test('Enigma controls change indicator labels and policy sets', () => {
  const d=dom('ciphers/enigma.html'),$=id=>d.window.document.getElementById(id);
  const before=$('cycle-current').textContent;
  change(d,'cycle-board','ahbe');assert.notEqual($('cycle-current').textContent,before);
  assert.match($('cycle-result').textContent,/4 \+ 4/);
  assert.equal($('cycle-indicators').children.length,8);
  assert.match($('rules-result').textContent,/60 of 60/);
  change(d,'rules-exact',true);assert.match($('rules-result').textContent,/59 of 60/);
  change(d,'rules-position',true);assert.match($('rules-result').textContent,/32 of 60/);
  const orders=$('rules-orders').textContent;change(d,'rules-previous','523');assert.notEqual($('rules-orders').textContent,orders);
  change(d,'rules-position',false);change(d,'rules-exact',false);assert.match($('rules-result').textContent,/60 of 60/);d.window.close();
});
test('paired-message UI gates stages, checks both cases and clears stale conclusions', () => {
  const d=dom('lab/kisses.html'),$=id=>d.window.document.getElementById(id);
  assert($('kiss-derive').disabled);assert($('kiss-check').disabled);
  $('kiss-decode').click();assert.equal($('kiss-plaintext').textContent,'SENDSUPPLIESTOHARBOR');
  $('kiss-derive').click();assert.match($('kiss-key').textContent,/^TIDES/);assert.equal($('kiss-equations').children.length,5);
  $('kiss-check').click();assert.match($('kiss-result').textContent,/15 \/ 15/);assert.match($('kiss-result').textContent,/Consistent/);
  change(d,'kiss-case','different');assert($('kiss-check').disabled);assert.equal($('kiss-equations').children.length,0);
  assert.doesNotMatch($('kiss-result').textContent,/Consistent/);
  $('kiss-decode').click();$('kiss-derive').click();$('kiss-check').click();assert.match($('kiss-result').textContent,/fails this check/);
  $('kiss-reset').click();assert($('kiss-derive').disabled);assert($('kiss-check').disabled);d.window.close();
});
test('public descriptions retain the distinction between history and models', () => {
  assert.match(read('ciphers/gripenstierna.html'),/original machine was lost/);
  assert.match(read('ciphers/gripenstierna.html'),/26 August 1786/);
  assert.match(read('ciphers/gripenstierna.html'),/do not establish 254-bit/);
  assert.match(read('ciphers/joan-clarke.html'),/not Enigma intercepts or a full Banburismus reconstruction/);
  assert.match(read('ciphers/enigma.html'),/model has no Enigma rotor wiring or stepping/);
  assert.match(read('ciphers/enigma.html'),/assuming the attacker|attacker knows yesterday/);
  assert.match(read('lab/kisses.html'),/does not by itself break a sound modern scheme/);
  assert.match(read('lab/kisses.html'),/Every|Everything below is invented/);
});
test('all five additions have public doorways and scripts', () => {
  for (const file of ['ciphers/gripenstierna.html','ciphers/joan-clarke.html','ciphers/enigma.html','lab/kisses.html']) {
    const ids=[...read(file).matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
    assert.equal(new Set(ids).size,ids.length,file+' must mount every exercise only once');
  }
  for(const [file,href] of [
    ['halls/machines.html','../ciphers/gripenstierna.html'],['museum-map.html','ciphers/gripenstierna.html'],
    ['timeline.html','ciphers/gripenstierna.html'],['lab/workbench.html','kisses.html'],
    ['cryptanalysis.html','ciphers/joan-clarke.html#banburismus-experiment'],
    ['hall-of-foundations/group-theory.html','../ciphers/enigma.html#cycle-structure']
  ])assert(read(file).includes(`href="${href}"`),file);
  for(const file of ['ciphers/joan-clarke.html','ciphers/enigma.html','lab/kisses.html'])assert.match(read(file),/src="\.\.\/js\/codebreaking-evidence.js"/);
  for(const id of ['cycle-structure','key-rules'])assert(read('ciphers/enigma.html').includes(`id="${id}"`));
});
console.log(`${passed} codebreaking-evidence tests passed (including exhaustive permutation and wheel-order checks).`);
