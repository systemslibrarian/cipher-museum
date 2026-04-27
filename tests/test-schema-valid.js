// test-schema-valid.js: Validate that the schema is valid JSON Schema
const Ajv = require('ajv/dist/2020');
const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('public/corpus/cipher-corpus.schema.json', 'utf8'));
const ajv = new Ajv();
try {
  ajv.compile(schema);
  console.log('Schema is valid JSON Schema.');
} catch (e) {
  console.error('Schema is invalid:', e.message);
  process.exit(1);
}
