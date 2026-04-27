#!/usr/bin/env node
// validate-record.js: Validate a single cipher record or all records against the v0.2 schema

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv/dist/2020').default;

const schemaPath = path.join(__dirname, 'public/corpus/cipher-corpus.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

function validateRecord(record, idx = null) {
  const valid = validate(record);
  if (!valid) {
    console.error(`Record${idx !== null ? ' #' + idx : ''} INVALID:`);
    console.error(validate.errors);
    return false;
  }
  return true;
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node validate-record.js <file.jsonl>');
    process.exit(1);
  }
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  let allValid = true;
  lines.forEach((line, idx) => {
    try {
      const record = JSON.parse(line);
      if (!validateRecord(record, idx + 1)) allValid = false;
    } catch (e) {
      console.error(`Line ${idx + 1} is not valid JSON.`);
      allValid = false;
    }
  });
  if (allValid) {
    console.log('All records valid.');
    process.exit(0);
  } else {
    process.exit(2);
  }
}

if (require.main === module) main();
