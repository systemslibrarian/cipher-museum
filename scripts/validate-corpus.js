// scripts/validate-corpus.js
// Basic validation for Cipher Corpus dataset
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv/dist/2020').default;
const schema = require('../public/corpus/cipher-corpus.schema.json');

const corpusPath = path.join(__dirname, '../src/data/cipherCorpusRecords.ts');

function extractRecords(tsFile) {
  // Naive extraction for demo: expects export const cipherCorpusRecords = [ ... ];
  const content = fs.readFileSync(tsFile, 'utf8');
  const match = content.match(/export const cipherCorpusRecords:.*?= (\[.*\]);/s);
  if (!match) throw new Error('Could not find corpus records array');
  // eslint-disable-next-line no-eval
  return eval(match[1].replace(/\bundefined\b/g, 'null'));
}

function main() {
  const records = extractRecords(corpusPath);
  const ajv = new Ajv({ strict: false });
  const validate = ajv.compile(schema);
  const ids = new Set();
  let valid = true;
  for (const rec of records) {
    if (ids.has(rec.id)) {
      console.error('Duplicate id:', rec.id);
      valid = false;
    }
    ids.add(rec.id);
    if (!validate(rec)) {
      console.error('Schema error for', rec.id, validate.errors);
      valid = false;
    }
    if (!rec.plaintext || !rec.ciphertext) {
      console.error('Missing text for', rec.id);
      valid = false;
    }
    if (!['beginner','intermediate','advanced','expert'].includes(rec.difficulty)) {
      console.error('Invalid difficulty for', rec.id);
      valid = false;
    }
    if (!Array.isArray(rec.expected_attacks)) {
      console.error('expected_attacks not array for', rec.id);
      valid = false;
    }
    if (typeof rec.verified !== 'boolean') {
      console.error('verified not boolean for', rec.id);
      valid = false;
    }
    if (typeof rec.key !== 'object') {
      console.error('key not object for', rec.id);
      valid = false;
    }
  }
  if (valid) {
    console.log('All records valid.');
    process.exit(0);
  } else {
    console.error('Validation failed.');
    process.exit(1);
  }
}

main();
