// scripts/build-corpus.js
// MVP: Export corpus records to JSON, JSONL, CSV for /public/corpus
const fs = require('fs');
const path = require('path');
const corpusTs = path.join(__dirname, '../src/data/cipherCorpusRecords.ts');
const outDir = path.join(__dirname, '../public/corpus');

function extractRecords(tsFile) {
  const content = fs.readFileSync(tsFile, 'utf8');
  const match = content.match(/export const cipherCorpusRecords:.*?= (\[.*\]);/s);
  if (!match) throw new Error('Could not find corpus records array');
  // eslint-disable-next-line no-eval
  return eval(match[1].replace(/\bundefined\b/g, 'null'));
}

function toCSV(records) {
  if (!records.length) return '';
  const fields = Object.keys(records[0]);
  const escape = v => '"' + String(v).replace(/"/g, '""') + '"';
  const rows = [fields.join(',')];
  for (const rec of records) {
    rows.push(fields.map(f => escape(Array.isArray(rec[f]) ? rec[f].join(';') : rec[f])).join(','));
  }
  return rows.join('\n');
}

function main() {
  const records = extractRecords(corpusTs);
  fs.writeFileSync(path.join(outDir, 'all.json'), JSON.stringify(records, null, 2));
  fs.writeFileSync(path.join(outDir, 'all.jsonl'), records.map(r => JSON.stringify(r)).join('\n'));
  fs.writeFileSync(path.join(outDir, 'all.csv'), toCSV(records));
  // Difficulty splits
  for (const diff of ['beginner','intermediate','advanced','expert']) {
    const subset = records.filter(r => r.difficulty === diff);
    fs.writeFileSync(path.join(outDir, `${diff}.jsonl`), subset.map(r => JSON.stringify(r)).join('\n'));
  }
  console.log('Corpus export complete.');
}

main();
