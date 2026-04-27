// test-records-valid.js: Validate all records against the schema
const Ajv = require('ajv/dist/2020');
const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('public/corpus/cipher-corpus.schema.json', 'utf8'));
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);
const files = fs.readdirSync('public/corpus').filter(f => f.endsWith('.jsonl'));
let allValid = true;
files.forEach(file => {
  const lines = fs.readFileSync('public/corpus/' + file, 'utf8').split('\n').filter(Boolean);
  lines.forEach((line, idx) => {
    try {
      const record = JSON.parse(line);
      if (!validate(record)) {
        allValid = false;
        console.error(`${file} line ${idx+1} invalid:`, validate.errors);
      }
    } catch (e) {
      allValid = false;
      console.error(`${file} line ${idx+1} not valid JSON.`);
    }
  });
});
if (allValid) {
  console.log('All records valid.');
  process.exit(0);
} else {
  process.exit(2);
}
