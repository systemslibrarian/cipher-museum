'use strict';
const assert = require('node:assert/strict');
const R = require('../js/research-model');
const fs = require('node:fs');
const path = require('node:path');
// An invented record deliberately separates present custody from attribution.
const d = R.create('21 22 23');
Object.assign(d.source, {
  archive:'Example UK archive',custodianCountry:'United Kingdom',repositoryRecordUrl:'https://example.org/records/123',
  originPlace:'Italy',originStatus:'provisional',productionDateStart:'circa 1500',productionDateEnd:'before 1550',productionDateStatus:'provisional',
  provenance:'Production attributed from a later inventory; not independently established.',
  scriptIdentification:'Humanist cursive?',scriptStatus:'provisional',languageHypothesis:'',languageStatus:'unknown',
  objectRights:'Public domain',objectAccess:'By appointment',objectAttribution:'Example archive, 123',
  imageRights:'Reuse only with written permission',imageAccess:'Reading-room access',imageAttribution:'Photograph by Example Archive',
  transcriptionRights:'CC BY 4.0',transcriptionAccess:'Open',transcriptionAttribution:'Example transcriber'
});
const validated = R.validate(d);
assert.deepEqual(R.migrate(JSON.parse(JSON.stringify(validated))).source,validated.source);
const bundle = R.bundle(validated,{title:'Cross-border source example'});
assert.deepEqual(R.openBundle(JSON.parse(JSON.stringify(bundle))).evidence.source,validated.source);
const old = R.create('A');
old.source = {artifactId:'old',archive:'Legacy archive',shelfmark:'1',folio:'2',transcriber:'T',date:'2020',method:'Manual',url:'',imageName:''};
const restored = R.migrate(old);
assert.equal(restored.source.archive,'Legacy archive');assert.equal(restored.source.languageStatus,'unknown');assert.equal(restored.source.imageRights,'');
const legacyBundle = R.bundle(R.create('A'));
for (const f of R.SOURCE_FIELDS.slice(9)) delete legacyBundle.evidence.source[f];
assert.equal(R.openBundle(legacyBundle).stale.source,false,'empty optional metadata does not invalidate an unchanged old bundle');
assert.throws(()=>R.validate({...d,source:{...d.source,scriptStatus:'certainly magic'}}));
assert.throws(()=>R.validate({...d,source:{...d.source,repositoryRecordUrl:'javascript:alert(1)'}}));
const entries = [{symbol:'21',type:'word',values:['seal']},{symbol:'22',type:'ending',values:['ed']},{symbol:'23',type:'punctuation',values:['.']}];
assert.equal(R.applyKey(['21','22','23'],entries).text,'sealed.');
assert.ok(!R.SEG_TYPES.includes('repeat'),'operational controls remain distinct from literal content');
const html = fs.readFileSync(path.join(__dirname,'../lab/evidence-workbench.html'),'utf8');
for (const field of R.SOURCE_FIELDS) assert.ok(html.includes('id="source-'+field+'"'),'editable and restorable field '+field);
console.log('PASS archival metadata, old version 2 records, rights, uncertainty and mixed linguistic units');
