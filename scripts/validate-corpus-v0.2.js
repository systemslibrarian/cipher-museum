#!/usr/bin/env node
// validate-corpus-v0.2.js
// Validates all records in a JSONL file against the v0.2 schema
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const schemaPath = path.join(__dirname, '../public/corpus/cipher-corpus.schema.json');
const corpusPath = process.argv[2];
if (!corpusPath) {
  console.error('Usage: node validate-corpus-v0.2.js <corpus.jsonl>');
  process.exit(1);
}
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv({allErrors: true, strict: false});
addFormats(ajv);
const validate = ajv.compile(schema);

let fail = 0, pass = 0;
for (const [i, line] of fs.readFileSync(corpusPath, 'utf8').split(/\r?\n/).entries()) {
  if (!line.trim()) continue;
  let rec;
  try { rec = JSON.parse(line); } catch (e) {
    console.error(`Line ${i+1}: Invalid JSON: ${e}`);
    fail++;
    continue;
  }
  const valid = validate(rec);
  if (!valid) {
    fail++;
    console.error(`Line ${i+1} (${rec.id||'no-id'}):\n  ${ajv.errorsText(validate.errors, {separator:'\n  '})}`);
  } else {
    pass++;
  }
}
console.log(`\n${pass} valid, ${fail} invalid records.`);
process.exit(fail ? 1 : 0);
