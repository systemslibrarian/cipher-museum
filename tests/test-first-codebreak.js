#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const {execFileSync}=require('node:child_process');
const {JSDOM}=require('jsdom');
const f=require('../js/first-codebreak');
const root=path.join(__dirname,'..'), read=file=>fs.readFileSync(path.join(root,file),'utf8');
async function main() {
  // Fixed independently calculable examples, not only roundtrips.
  assert.equal(f.substitution('HELLO'),'ITSSG');
  assert.equal(f.vigenere('ATTACKATDAWN','LEMON'),'LXFOPVEFRNHR');
  assert.equal(f.vigenere('LXFOPVEFRNHR','LEMON',true),'ATTACKATDAWN');
  assert.throws(()=>f.vigenere('ABC',''));
  assert.throws(()=>f.columns('ABC',0));
  assert.deepEqual(f.columns('ABCDEFGH',3),['ADG','BEH','CF']);
  assert.deepEqual(f.repeats('ABCXYZABC'),[{sequence:'ABC',first:0,second:6,distance:6}]);
  assert.deepEqual(f.counts(f.NOTICE)[0],['O',24]);
  assert.deepEqual(f.bigrams('AA AA'),[['AA',2]],'Bigrams must not cross word boundaries.');
  const vig=f.vigenere(f.letters(f.DISPATCH),f.VIG_KEY);
  assert.equal(f.columns(vig,4).map(g=>f.rankShifts(g)[0].key).join(''),'LAMP');
  assert.equal(f.vigenere(vig,'LAMPLAMP',true),f.letters(f.DISPATCH));
  assert(f.repeats(vig).some(r=>r.sequence==='IZT'&&r.first===25&&r.second===51&&r.distance===26));
  assert(f.repeats(vig).some(r=>r.sequence==='TTT'&&r.first===33&&r.second===53&&r.distance===20));
  assert(f.repeats(vig).some(r=>r.sequence==='TTT'&&r.first===33&&r.second===97&&r.distance===64));
  assert.equal(f.homophones('OOOO',4,()=>0).frequencies[0][1],4,'A draw need not flatten counts.');
  let draws=0;
  const balanced=f.homophones('OOOO',4,()=>draws++/4);
  assert.equal(new Set(balanced.tokens).size,4);
  assert.equal(balanced.tokens.map(t=>balanced.key[t]).join(''),'OOOO');
  assert.equal(f.homophones('OZ',8,()=>.999999).tokens.join(','),'119,200');
  execFileSync(process.execPath,['scripts/build-codebreak-handouts.js','--check'],{cwd:root});

  const dom=new JSDOM(read('first-codebreak.html'),{runScripts:'outside-only',url:'https://ciphermuseum.com/first-codebreak.html'});
  const w=dom.window,d=w.document,$=id=>d.getElementById(id);
  const errors=[];w.addEventListener('error',e=>errors.push(e.error||e.message));
  w.eval(read('js/detective/workspaces.js'));w.eval(read('js/first-codebreak.js'));
  await new Promise(resolve=>w.addEventListener('load',resolve));
  const click=id=>$(id).click();
  const change=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new w.Event('change',{bubbles:true}));};
  assert.deepEqual(errors,[]);
  assert.equal($('lesson-cipher').textContent,f.substitution(f.NOTICE));
  assert(d.querySelectorAll('#clue-output mark').length>0);
  click('lesson-wrong');assert.equal($('lesson-map-G').value,'E');
  change('lesson-map-T','E');assert.match($('desk-status').textContent,/already assigned/);
  click('lesson-undo');assert.equal($('lesson-map-G').value,'');
  $('lesson-map-G').value='O';$('lesson-map-G').dispatchEvent(new w.Event('input'));assert.match($('lesson-plain').textContent,/OO/);$('lesson-lock-G').checked=true;$('lesson-lock-G').dispatchEvent(new w.Event('change'));
  click('lesson-reset');assert.equal($('lesson-map-G').value,'O');assert($('lesson-map-G').readOnly);
  for(let i=0;i<5;i++)click('lesson-hint');assert($('lesson-hint').disabled);assert.equal($('lesson-hints').children.length,5);
  click('lesson-check');assert.match($('desk-status').textContent,/does not match/);
  for(let i=0;i<18;i++)click('lesson-reveal');
  click('lesson-check');assert.match($('desk-status').textContent,/matches the supplied exercise/);
  assert.equal($('lesson-plain').textContent,f.NOTICE);
  click('clue-repeat');assert.match($('clue-caption').textContent,/recur/);

  click('vig-find');assert(d.querySelectorAll('#vig-repeats button').length>0);
  d.querySelector('#vig-repeats button').click();change('vig-period','4');
  assert.match($('vig-distance-note').textContent,/not divisible by 4/,'The accidental repeat must not be presented as proof.');
  assert.equal(d.querySelectorAll('#vig-cipher mark').length,6);
  d.querySelectorAll('#vig-columns .column-card > button').forEach(b=>b.click());
  assert.equal($('vig-key-display').textContent,'LAMP');
  click('vig-check');assert.match($('vig-status').textContent,/Matches the supplied plaintext/);
  change('vig-period','3');click('vig-check');assert.match($('vig-status').textContent,/does not recover/);
  click('vig-reveal');assert.equal($('vig-key-display').textContent,'LAMP');
  change('vig-key-0','A');assert.match($('vig-status').textContent,/Candidate key only/,'Changing a revealed answer must invalidate success.');
  change('vig-period','8');'LAMPLAMP'.split('').forEach((c,i)=>change('vig-key-'+i,c));
  click('vig-check');assert.match($('vig-status').textContent,/Matches the supplied plaintext/);
  for(const sample of f.SAMPLES){change('language-sample',sample.id);assert.equal($('language-text').textContent,sample.text);assert.match($('language-comparison').textContent,new RegExp(sample.name));}
  assert.equal($('language-lesson').tagName,'SECTION');
  change('homophone-count','8');click('homophone-rerun');assert.match($('homophone-status').textContent,/8 possible token/);
  const tokens=$('homophone-output').textContent.split(' ');assert.equal(tokens.length,f.letters(f.NOTICE).length);
  assert(d.querySelectorAll('#homophone-before meter').length>0);assert(d.querySelectorAll('#homophone-after meter').length>=18);
  const ids=Array.from(d.querySelectorAll('[id]'),el=>el.id);assert.equal(new Set(ids).size,ids.length,'IDs must be unique.');
  assert.deepEqual(errors,[]);dom.window.close();

  const student=new JSDOM(read('codebreak-worksheet.html')).window.document;
  const answer=new JSDOM(read('codebreak-answers.html')).window.document;
  assert.equal(student.getElementById('worksheet-substitution').textContent,f.substitution(f.NOTICE));
  assert.equal(student.getElementById('worksheet-vigenere').textContent,vig);
  assert(!student.body.textContent.includes(f.NOTICE));assert(!student.body.textContent.includes('LAMP'));
  assert.equal(answer.getElementById('answer-substitution').textContent,f.NOTICE);
  assert.equal(answer.getElementById('answer-vigenere').textContent,f.DISPATCH);
  const guide=new JSDOM(read('classical-guide.html')).window.document;
  assert.equal(guide.querySelectorAll('tbody tr').length,27);
  // Verify actual destinations and fragment IDs, not just string presence.
  for(const name of ['first-codebreak.html','classical-guide.html','codebreak-worksheet.html','codebreak-answers.html']) {
    const doc=new JSDOM(read(name)).window.document;
    for(const a of doc.querySelectorAll('a[href]')) {
      const href=a.getAttribute('href');if(/^https?:/.test(href))continue;
      const [file,fragment]=href.split('#'),dest=file||name;
      assert(fs.existsSync(path.join(root,dest)),dest);
      if(fragment)assert(new JSDOM(read(dest)).window.document.getElementById(fragment),href);
    }
  }
  const search=JSON.parse(read('js/search-index.json'));
  const entries=Array.isArray(search)?search:search.entries;
  assert(entries.some(e=>JSON.stringify(e).includes('first-codebreak.html')));
  console.log('First codebreak: arithmetic, incorrect hypotheses, partial-key workflow, Vigenère recovery, language panels, homophone counts, print separation and topic destinations passed.');
}
main().catch(e=>{console.error(e);process.exit(1);});
