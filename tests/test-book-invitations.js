'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const models = require('../js/book-invitation-demos.js');
assert.deepEqual(models.rsa(11,17,7,42), {n:187,phi:160,e:7,d:23,ciphertext:15,recovered:42});
// Includes representatives sharing a factor with n, not merely coprime messages.
for (let m=0;m<187;m++) assert.equal(models.rsa(11,17,7,m).recovered,m);
for (const args of [[11,11,7,42],[9,17,7,42],[101,17,7,42],[11,17,8,42],[11,17,1,42],[11,17,161,42],[11,17,7,187],[11,17,7,-1],[11,17,7,1.5]]) assert.throws(()=>models.rsa(...args));
assert.deepEqual(models.dh(6,15),{A:8,B:19,alice:2,bob:2});
for(let a=1;a<=21;a++)for(let b=1;b<=21;b++)assert.equal(models.dh(a,b).alice,models.dh(a,b).bob);
for(const v of [0,22,1.5,NaN])assert.throws(()=>models.dh(v,6));
const packet = models.stagerEncode('MOVE THE SUPPLIES TO RIVER BRIDGE AT DAWN','BDAC',true,true);
assert.equal(packet.ciphertext,'SUPPLIES AT SKY ORCHARD MOVE SKY TO DAWN SKY LANTERN THE SKY');
assert.deepEqual(models.stagerDecode(packet),{routed:'MOVE THE SUPPLIES TO ORCHARD LANTERN AT DAWN',plaintext:'MOVE THE SUPPLIES TO RIVER BRIDGE AT DAWN'});
for (const key of ['BDAC','LETTER','ZEBRAS','AAAAAAAA']) for (const codes of [false,true]) for (const nulls of [false,true]) {
 for (const msg of ['WAIT','RIVER BRIDGE AT DAWN','TAKE THE SUPPLIES TO THE OLD RIVER BRIDGE BEFORE NOON']) assert.equal(models.stagerDecode(models.stagerEncode(msg,key,codes,nulls)).plaintext,msg);
}
for (const msg of ['', 'SKY', 'ORCHARD', 'PAD', 'WORD '.repeat(121)]) assert.throws(()=>models.stagerEncode(msg,'BDAC',true,true));
assert.throws(()=>models.stagerEncode('WAIT','A1',true,true));
function dom(file) { return new JSDOM(read(file),{url:'https://ciphermuseum.com/'+file,runScripts:'outside-only'}); }
async function main() {
 let d=dom('ciphers/diffie-hellman.html'), w=d.window, doc=w.document;
 const submit=(id)=>doc.getElementById(id).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 models.mount(doc);submit('dh-toy');assert.match(doc.getElementById('dh-result').textContent,/Alice computes B\^a mod 23 = 2/);assert.match(doc.getElementById('dh-result').textContent,/Bob computes A\^b mod 23 = 2/);doc.getElementById('dh-a').value='0';submit('dh-toy');assert.match(doc.getElementById('dh-result').textContent,/from 1 to 21/);w.close();
 d=dom('ciphers/rsa.html');w=d.window;doc=w.document;models.mount(doc);submit('rsa-toy');
 assert.match(doc.getElementById('rsa-result').textContent,/15\^23 mod 187 = 42/);
 doc.getElementById('rsa-p').value='9';submit('rsa-toy');assert.equal(doc.getElementById('rsa-result').hidden,true);assert.match(doc.getElementById('rsa-status').textContent,/different primes/);
 doc.getElementById('rsa-p').value='';submit('rsa-toy');assert.match(doc.getElementById('rsa-status').textContent,/all four fields/);d.window.close();
 d=dom('ciphers/stager.html');w=d.window;doc=w.document;models.mount(doc);
 submit('stager-words');assert.equal(doc.getElementById('stager-words').hidden,true);assert.equal(doc.getElementById('stager-answer').textContent,'');assert.equal(doc.getElementById('stager-transmitted').textContent,packet.ciphertext);
 doc.getElementById('stager-restore').click();assert.match(doc.getElementById('stager-answer').textContent,/MOVE THE SUPPLIES TO RIVER BRIDGE AT DAWN/);
 doc.getElementById('stager-edit').click();assert.equal(doc.getElementById('stager-stage').hidden,true);assert.equal(doc.getElementById('stager-words').hidden,false);
 doc.getElementById('stager-message').value='MEET AT THE BRIDGE';doc.getElementById('stager-keyword').value='LETTER';submit('stager-words');doc.getElementById('stager-restore').click();assert.match(doc.getElementById('stager-answer').textContent,/Vocabulary restored: MEET AT THE BRIDGE$/);w.close();
 d=dom('ciphers/mary-stuart-castelnau-letters.html');w=d.window;doc=w.document;models.mount(doc);
 assert.match(doc.getElementById('mary-reading').textContent,/T E E/);doc.getElementById('mary-repeat').click();assert.match(doc.getElementById('mary-reading').textContent,/^T E ·/);doc.getElementById('mary-repeat').click();assert.match(doc.getElementById('mary-reading').textContent,/^T E E ·/);w.close();
 d=dom('ciphers/adfgvx.html');w=d.window;doc=w.document;
 w.eval(read('js/ciphers/all-engines.js'));w.eval(read('js/demo-loader.js'));
 await new Promise(resolve=>w.document.addEventListener('DOMContentLoaded',resolve,{once:true}));
 doc.getElementById('demo-run-adfgvx').click();assert.equal(doc.getElementById('adfgvx-intermediate').textContent,'AVGGGGAVAXFF');assert.equal(doc.getElementById('demo-output-adfgvx').textContent,'GFVVAAGXGFGA');
 doc.getElementById('demo-msg-adfgvx').value='ATTACJ';doc.getElementById('demo-run-adfgvx').click();assert.match(doc.getElementById('adfgvx-comparison').textContent,/1 message character\(s\), 1 intermediate position\(s\), and 1 final position\(s\)/);
 doc.querySelector('[data-mode="dec"]').click();doc.getElementById('demo-msg-adfgvx').value='GFVVAAGXGFGA';doc.getElementById('demo-run-adfgvx').click();assert.equal(doc.getElementById('adfgvx-intermediate').textContent,'AVGGGGAVAXFF');assert.equal(doc.getElementById('demo-output-adfgvx').textContent,'ATTACK');
 doc.getElementById('demo-clear-adfgvx').click();assert.equal(doc.getElementById('adfgvx-intermediate').textContent,'');w.close();
 d=dom('sealed-letter.html');doc=d.window.document;
 const choices=[...doc.querySelectorAll('#verdict-form label')].map(el=>el.textContent.trim());
 const lengths=choices.map(s=>s.split(/\s+/).length);assert(Math.max(...lengths)-Math.min(...lengths)<=5,'No choice gets a conspicuous length advantage');
 assert(choices.filter(s=>/Hold further movement/.test(s)).length>=2,'Holding movement must not reveal the correct choice');assert.match(choices[0],/accuse Ellis/);assert.doesNotMatch(doc.querySelector('#investigation').textContent,/waiting to move|before the transfer can proceed/);d.window.close();
 assert.doesNotMatch(read('ciphers/one-time-pad.html'),/officers reused key pages under WWII supply pressure|messages and identified Julius/);
 assert.doesNotMatch(read('ciphers/venona.html'),/XOR is the same algebra/);
 assert.match(read('ciphers/venona.html'),/Robert Lamphere/);
 assert.match(read('ciphers/mary-stuart-castelnau-letters.html'),/F42, F46, F58, F69, F78, F96 and F221/);
 console.log('Book invitations: RSA vectors/validation, whole-word route recovery, DOM controls, ADFGVX stages/comparison, modifier and puzzle fairness passed.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
