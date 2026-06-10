#!/usr/bin/env node
// benchmark-runner.js: Run all solvers on the corpus and generate reports

const fs = require('fs');
const path = require('path');

const corpusPath = process.argv.includes('--corpus') ? process.argv[process.argv.indexOf('--corpus') + 1] : null;
const solversDir = process.argv.includes('--solvers') ? process.argv[process.argv.indexOf('--solvers') + 1] : null;
const outDir = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : null;

if (!corpusPath || !solversDir || !outDir) {
  console.error('Usage: node benchmark-runner.js --corpus <file> --solvers <dir> --out <dir>');
  process.exit(1);
}

const records = fs.readFileSync(corpusPath, 'utf8').split('\n').filter(Boolean).map(JSON.parse);
const solverFiles = fs.readdirSync(solversDir).filter(f => f.endsWith('.js'));
const solvers = solverFiles.map(f => ({
  name: f.replace(/\.js$/, ''),
  solve: require(path.resolve(solversDir, f)).solve
}));


const results = [];
const now = new Date().toISOString();
const run_id = `runner-${now.replace(/[:.]/g, '-')}`;

for (const solver of solvers) {
  for (const record of records) {
    if (record.blind) continue; // skip blind for training
    const res = solver.solve(record);
    results.push({
      record_id: record.cipher_name,
      solver_name: solver.name,
      run_id,
      timestamp: now,
      result: res
    });
  }
}

// Write JSON report
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const jsonPath = path.join(outDir, 'benchmark-report.json');
fs.writeFileSync(jsonPath, results.map(r => JSON.stringify(r)).join('\n'));

// Write HTML report (simple table)
const htmlRows = results.map(r => `<tr><td>${r.record_id}</td><td>${r.solver_name}</td><td>${r.result.score}</td><td>${r.result.details}</td></tr>`).join('');
const html = `<!DOCTYPE html><html><head><title>Benchmark Report</title></head><body><h1>Benchmark Report</h1><table border=\"1\"><tr><th>Record</th><th>Solver</th><th>Score</th><th>Details</th></tr>${htmlRows}</table></body></html>`;
const htmlPath = path.join(outDir, 'benchmark-report.html');
fs.writeFileSync(htmlPath, html);

// Generate reproducibility receipt
const crypto = require('crypto');
function fileHash(file) {
  if (!fs.existsSync(file)) return null;
  const data = fs.readFileSync(file);
  return 'sha256:' + crypto.createHash('sha256').update(data).digest('hex');
}
const receipt = {
  run_id,
  timestamp: now,
  corpus_version: fileHash(corpusPath),
  schema_version: (() => {
    try {
      const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/corpus/cipher-corpus.schema.json'), 'utf8'));
      return schema.$version || 'unknown';
    } catch { return 'unknown'; }
  })(),
  solvers: solverFiles.map(f => ({ name: f.replace(/\.js$/, ''), version: '0.1.0' })),
  runner_version: fileHash(__filename),
  environment: {
    node: process.version,
    os: process.platform + ' ' + (process.arch || '')
  },
  parameters: { corpus: corpusPath, solvers: solversDir, out: outDir },
  results_file: jsonPath
};
const receiptPath = path.join(outDir, `receipt-${run_id}.json`);
fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));

console.log('Benchmark complete. Reports and receipt written to', outDir);
