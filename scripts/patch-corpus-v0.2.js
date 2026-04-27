// Patch all v0.1/v0.2 records to conform to v0.2 schema (adds split, transcription_quality, source_provenance)
const fs = require('fs');
const path = require('path');

const infile = process.argv[2];
const outfile = process.argv[3];
if (!infile || !outfile) {
  console.error('Usage: node patch-corpus-v0.2.js <infile.jsonl> <outfile.jsonl>');
  process.exit(1);
}

const lines = fs.readFileSync(infile, 'utf8').split(/\r?\n/);
const patched = [];
for (const line of lines) {
  if (!line.trim()) continue;
  let rec = JSON.parse(line);
  // Add required v0.2 fields if missing
  if (!rec.split) rec.split = 'public';
  if (!rec.transcription_quality) rec.transcription_quality = rec.notes && rec.notes.toLowerCase().includes('noise') ? 'noisy' : 'clean';
  if (!rec.source_provenance) {
    rec.source_provenance = {
      url: 'https://ciphermuseum.com/cipher-corpus.html',
      archive: rec.source_type === 'historical' ? 'See record notes' : 'Cipher Museum Synthetic Corpus',
      publication_date: '2026-04-27',
      license: rec.license || 'CC0'
    };
  }
  patched.push(JSON.stringify(rec));
}
fs.writeFileSync(outfile, patched.join('\n'));
console.log(`Patched ${patched.length} records.`);
