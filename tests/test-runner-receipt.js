// test-runner-receipt.js: Ensure benchmark runner produces a valid reproducibility receipt
const fs = require('fs');
const { execSync } = require('child_process');
const outDir = 'tests/';
const corpus = 'tests/minicorpus.jsonl';
execSync('node scripts/benchmark-runner.js --corpus ' + corpus + ' --solvers solvers/ --out ' + outDir, { stdio: 'inherit' });
const files = fs.readdirSync(outDir).filter(f => f.startsWith('receipt-') && f.endsWith('.json'));
if (files.length === 0) throw new Error('No receipt file produced.');
const receipt = JSON.parse(fs.readFileSync(outDir + files[0], 'utf8'));
if (!receipt.run_id || !receipt.timestamp || !receipt.corpus_version || !receipt.schema_version) throw new Error('Receipt missing required fields.');
console.log('Runner receipt test passed.');
