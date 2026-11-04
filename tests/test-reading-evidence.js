'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
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

// Independently enumerate the complete artificial word universe. A bijection
// must distinguish all 64 messages, while the selected merge has 8 outputs.
const words = ['PINE', 'OAK', 'ELM', 'ASH'];
const triples = [];
for (const a of words) for (const b of words) for (const c of words) triples.push([a, b, c]);
const permutationOutputs = new Set(), mergedOutputs = new Map();
for (const triple of triples) {
  assert.deepEqual(E.wordTransform('unchanged', triple), triple);
  const oneToOne = E.wordTransform('bijective', triple), merged = E.wordTransform('merged', triple);
  permutationOutputs.add(oneToOne.join(' '));
  mergedOutputs.set(merged.join(' '), (mergedOutputs.get(merged.join(' ')) || 0) + 1);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    assert.equal(oneToOne[i] === oneToOne[j], triple[i] === triple[j], 'Bijection preserves every pairwise equality');
    if (merged[i] !== merged[j]) assert.notEqual(triple[i], triple[j], 'Different outputs of a fixed function cannot share an input');
  }
}
assert.equal(permutationOutputs.size, 64);
assert.equal(mergedOutputs.size, 8);
assert.ok([...mergedOutputs.values()].every(count => count === 8));
const expectedWordMessages = {
  unchanged: ['ELM ASH ELM', 'ELM ASH PINE', 'ELM ASH OAK'],
  bijective: ['ASH PINE ASH', 'ASH PINE OAK', 'ASH PINE ELM'],
  merged: ['OAK ASH OAK', 'OAK ASH OAK', 'OAK ASH ASH'],
  fresh: ['ASH ELM PINE', 'OAK ASH OAK', 'ELM PINE ASH']
};
for (const mode of Object.keys(expectedWordMessages)) for (const [i, query] of ['a', 'b', 'c'].entries()) {
  const r = E.structureExperiment(mode, query);
  assert.equal(r.encoded.join(' '), expectedWordMessages[mode][i]);
  assert.ok(r.alternatives.some(t => t.join(' ') === r.source.join(' ')), 'The actual source must remain possible');
  assert.equal(r.same + r.different, r.alternatives.length);
  assert.equal(r.demonstrations.length, 4);
  if (mode === 'unchanged' || mode === 'bijective') {
    assert.equal(r.alternatives.length, 1);
    assert.equal(r.conclusion, query === 'a' ? 'same' : 'different');
  } else if (mode === 'merged') {
    assert.equal(r.alternatives.length, 8);
    assert.equal(r.same, query === 'c' ? 0 : 4);
    assert.equal(r.conclusion, query === 'c' ? 'different' : 'uncertain');
  } else {
    assert.equal(r.alternatives.length, 64);
    assert.equal(r.same, 16);
    assert.equal(r.different, 48);
    assert.equal(r.conclusion, 'uncertain');
    assert.equal(r.mapping, null);
  }
}
const mergedExamples = E.structureExperiment('merged', 'a').demonstrations;
assert.deepEqual(mergedExamples[0].encoded, mergedExamples[1].encoded);
assert.notEqual(mergedExamples[0].same, mergedExamples[1].same, 'The same merged output has opposite source labels');
const freshExamples = E.structureExperiment('fresh', 'a').demonstrations;
assert.equal(freshExamples[0].same, true);
assert.notEqual(freshExamples[0].encoded[0], freshExamples[0].encoded[2], 'Replacement can destroy a true repetition');
assert.equal(freshExamples[1].same, false);
assert.equal(freshExamples[1].encoded[0], freshExamples[1].encoded[2], 'Replacement can create a coincidental repetition');
assert.deepEqual(E.wordTransform('fresh', triples[0], 5), E.wordTransform('fresh', triples[63], 5), 'Frozen replacement draws do not depend on the source');
assert.throws(() => E.structureExperiment('__proto__', 'a'));
assert.throws(() => E.structureExperiment('merged', '__proto__'));
assert.throws(() => E.wordTransform('bijective', ['ELM']));
assert.throws(() => E.wordTransform('fresh', ['ELM', 'ASH', 'UNKNOWN']));
assert.throws(() => E.wordTransform('fresh', triples[0], 7));

assert.deepEqual(E.decodeInvoice('12', false), [
  { codes: ['1', '2'], reading: 'MEET DAWN' }, { codes: ['12'], reading: 'WAIT' }
]);
assert.deepEqual(E.decodeInvoice('1|2', true), [{ codes: ['1', '2'], reading: 'MEET DAWN' }]);
assert.deepEqual(E.decodeInvoice('12', true), [{ codes: ['12'], reading: 'WAIT' }]);
assert.deepEqual(E.decodeInvoice('0', false), []);
assert.deepEqual(E.decodeInvoice('1|99', true), []);
assert.throws(() => E.decodeInvoice('1||2', true));
assert.throws(() => E.decodeInvoice('1|2', false));
assert.throws(() => E.decodeInvoice('12', 'plain'));
assert.throws(() => E.decodeInvoice('1'.repeat(13), false));
// A different algorithm enumerates every boundary mask in 363 strings. This
// catches greedy decoding, dropped parses, and acceptance of unknown codes.
const allowedCodes = new Set(['1', '2', '3', '12', '13']);
let invoiceInputs = [''];
for (let length = 1; length <= 5; length++) {
  invoiceInputs = invoiceInputs.flatMap(prefix => ['1', '2', '3'].map(digit => prefix + digit));
  for (const digits of invoiceInputs) {
    const expectedPaths = [];
    for (let mask = 0; mask < 2 ** (digits.length - 1); mask++) {
      let start = 0; const parts = [];
      for (let position = 1; position < digits.length; position++) if (mask & (1 << (position - 1))) { parts.push(digits.slice(start, position)); start = position; }
      parts.push(digits.slice(start));
      if (parts.every(part => allowedCodes.has(part))) expectedPaths.push(parts.join('|'));
    }
    assert.deepEqual(E.decodeInvoice(digits, false).map(r => r.codes.join('|')).sort(), expectedPaths.sort());
  }
}
for (const example of ['dawn', 'dusk', 'single']) for (const format of ['plain', 'framed']) {
  const r = E.invoiceExperiment(example, format);
  assert.equal(r.amount, example === 'dawn' ? 12 : example === 'dusk' ? 13 : 2);
  assert.equal(r.record.replace(/\|/g, ''), String(r.amount));
  assert.equal(r.candidates.length, format === 'plain' && example !== 'single' ? 2 : 1);
  assert.equal(r.ordinaryNumber, format === 'plain' || example === 'single');
  assert.ok(r.candidates.some(candidate => candidate.reading === r.intended));
}
assert.throws(() => E.invoiceExperiment('__proto__', 'plain'));
assert.equal(E.markerExperiment(false).reading, 'MEET AT DAWN');
assert.equal(E.markerExperiment(true).reading, 'DAWN MEET AT DAWN');
assert.deepEqual(E.markerExperiment(true).words, ['Copper', 'amber', 'silver', 'copper']);
assert.equal(E.markerExperiment(true).intact, false);
assert.throws(() => E.markerExperiment('false'));
assert.deepEqual(E.musicExperiment('WAIT'), { durations: [1, 1, 1, 1], beats: 4, required: 4, fits: true, reading: 'WAIT' });
assert.deepEqual(E.musicExperiment('MEET'), { durations: [1, 1, 1, 2], beats: 5, required: 4, fits: false, reading: 'MEET' });
assert.equal(E.decodeRhythm([2, 2]), null, 'Four beats alone do not identify the word code');
assert.equal(E.decodeRhythm([1, 1, 2]), null);
assert.throws(() => E.decodeRhythm([1, -1, 4]));
assert.throws(() => E.musicExperiment('__proto__'));
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
assert.equal($('structure-mode').value, 'bijective');
assert.equal($('structure-message').textContent, 'ASH PINE ASH');
assert.equal($('structure-examples').children.length, 4);
$('structure-check').click(); assert.match($('structure-result').textContent, /Choose a conclusion/);
change('structure-guess', 'same'); $('structure-check').click(); assert.match($('structure-result').textContent, /Supported conclusion.*the same/);
$('structure-workings').open = true;
change('structure-query', 'b'); assert.equal($('structure-guess').value, ''); assert.equal($('structure-workings').open, false);
assert.doesNotMatch($('structure-result').textContent, /Supported conclusion/);
change('structure-guess', 'different'); $('structure-check').click(); assert.match($('structure-result').textContent, /Supported conclusion/);
change('structure-mode', 'merged'); change('structure-query', 'a');
assert.equal($('structure-message').textContent, 'OAK ASH OAK');
assert.equal($('structure-alternatives').children.length, 8);
assert.match($('structure-counts').textContent, /8 compatible source triples: 4 with matching ends; 4 with different ends/);
change('structure-guess', 'same'); $('structure-check').click(); assert.match($('structure-result').textContent, /Reconsider.*does not determine/);
change('structure-guess', 'uncertain'); $('structure-check').click(); assert.match($('structure-result').textContent, /Supported conclusion/);
change('structure-query', 'b'); assert.equal($('structure-message').textContent, 'OAK ASH OAK');
change('structure-query', 'c'); change('structure-guess', 'different'); $('structure-check').click();
assert.match($('structure-result').textContent, /Supported conclusion.*8 source triples remain/);
change('structure-mode', 'fresh'); change('structure-query', 'b');
assert.equal($('structure-message').textContent, 'OAK ASH OAK');
assert.match($('structure-counts').textContent, /64 compatible source triples: 16 with matching ends; 48 with different ends/);
change('structure-guess', 'same'); $('structure-check').click(); assert.match($('structure-result').textContent, /Reconsider/);
change('structure-guess', 'uncertain'); $('structure-check').click(); assert.match($('structure-result').textContent, /Supported conclusion.*All 64/);
for (const [mode, messages] of Object.entries(expectedWordMessages)) for (const [i, query] of ['a', 'b', 'c'].entries()) {
  change('structure-mode', mode); change('structure-query', query);
  assert.equal($('structure-message').textContent, messages[i]);
  assert.equal($('structure-guess').value, '', 'Changing the experiment clears a prior answer');
}
$('structure-reset').click(); assert.equal($('structure-mode').value, 'bijective'); assert.equal($('structure-query').value, 'a');
assert.equal($('structure-message').textContent, 'ASH PINE ASH');
assert.equal($('invoice-record').textContent, '12'); assert.equal($('invoice-readings').children.length, 2);
assert.match($('invoice-readings').textContent, /MEET DAWN.*WAIT/);
change('invoice-format', 'framed'); assert.equal($('invoice-record').textContent, '1|2'); assert.equal($('invoice-readings').children.length, 1);
assert.match($('invoice-cover').textContent, /no longer an ordinary number/);
change('invoice-example', 'dusk'); assert.match($('invoice-readings').textContent, /MEET DUSK/);
change('invoice-format', 'plain'); assert.match($('invoice-readings').textContent, /MEET DUSK.*CANCEL/);
change('invoice-example', 'single'); assert.equal($('invoice-record').textContent, '2'); assert.equal($('invoice-readings').children.length, 1);
assert.match($('invoice-cover').textContent, /fits the arithmetic/);
$('marker-extra').checked = true; $('marker-extra').dispatchEvent(new dom.window.Event('change'));
assert.equal($('marker-reading').textContent, 'DAWN MEET AT DAWN'); assert.match($('marker-result').textContent, /extra DAWN/);
assert.equal($('music-reading').textContent, 'MEET'); assert.match($('music-count').textContent, /1 \+ 1 \+ 1 \+ 2 = 5/);
assert.match($('music-result').textContent, /code still decodes.*5 beats/);
change('music-message', 'WAIT'); assert.equal($('music-reading').textContent, 'WAIT'); assert.equal($('music-notes').children.length, 4);
assert.match($('music-count').textContent, /= 4/); assert.match($('music-result').textContent, /does not establish musical naturalness/);
$('concealment-reset').click(); assert.equal($('invoice-example').value, 'dawn'); assert.equal($('invoice-format').value, 'plain');
assert.equal($('invoice-readings').children.length, 2); assert.equal($('marker-extra').checked, false);
assert.equal($('marker-reading').textContent, 'MEET AT DAWN'); assert.equal($('music-message').value, 'MEET');
assert.match($('music-count').textContent, /= 5/);
assert.equal(doc.querySelectorAll('.evidence-exercise .paper-credit').length,6);
assert.equal(doc.querySelectorAll('nav[aria-label="Activities"] a').length, 6);
for (const id of ['structure-controls', 'concealment']) {
  const section = $(id);
  assert.equal(doc.querySelectorAll('#' + id).length, 1);
  for (const area of section.querySelectorAll('.evidence-table-scroll')) assert.equal(area.getAttribute('tabindex'), '0');
}
for(const a of doc.querySelectorAll('a[href]')) assert.ok(!/drive\.google|docs\.google/.test(a.href),'Public credits must not expose private Drive copies');
for(const select of doc.querySelectorAll('select')) assert.ok(doc.querySelector('label[for="'+select.id+'"]'));
dom.window.close();

// Exercise the new guards against isolated faulty copies. The shared working
// source is never mutated while another reviewer may be running its tests.
const source = fs.readFileSync('js/reading-evidence.js', 'utf8');
const mutations = [
  ['merging fails to merge', "ELM: 'OAK', ASH: 'ASH'", "ELM: 'PINE', ASH: 'ASH'", M => assert.equal(M.structureExperiment('merged', 'a').alternatives.length, 8)],
  ['noise incorrectly retains only fixed-map candidates', "mode === 'fresh' ||\n      wordTransform", "false ||\n      wordTransform", M => assert.equal(M.structureExperiment('fresh', 'a').alternatives.length, 64)],
  ['greedy invoice hides alternatives', 'return paths.map(codes', 'return paths.slice(0, 1).map(codes', M => assert.equal(M.decodeInvoice('12', false).length, 2)],
  ['accidental first marker silently dropped', '.filter(match => Object.hasOwn(markerKey', '.filter((match, index) => index > 0 && Object.hasOwn(markerKey', M => assert.equal(M.markerExperiment(true).reading, 'DAWN MEET AT DAWN')],
  ['five beats falsely pass four-four', 'fits: beats === 4', 'fits: beats <= 5', M => assert.equal(M.musicExperiment('MEET').fits, false)]
];
for (const [name, before, after, verify] of mutations) {
  assert.equal(source.split(before).length, 2, 'Mutation target must be unique: ' + name);
  const context = { module: { exports: {} } };
  vm.runInNewContext(source.replace(before, after), context);
  assert.throws(() => verify(context.module.exports), assert.AssertionError, 'Guard must catch: ' + name);
}
console.log('Reading the Evidence: six exercises; 64 word triples; 363 independent invoice parses; DOM controls, resets, source links and five isolated mutation guards passed.');
