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
})).filter(s => {
  if (typeof s.solve !== 'function') {
    console.warn(`Skipping ${s.name}: no exported solve() function`);
    return false;
  }
  return true;
});


const results = [];
const now = new Date().toISOString();
const run_id = `runner-${now.replace(/[:.]/g, '-')}`;

// Compare solver output against the record's known plaintext. Spacing,
// punctuation and casing differ across ciphers, so we score on letters/digits
// only (the substantive content), not exact formatting.
const normalize = s => String(s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
function charAccuracy(guess, expected) {
  const g = normalize(guess);
  const e = normalize(expected);
  if (!e.length) return null; // nothing to score against
  const n = Math.max(g.length, e.length);
  let hits = 0;
  for (let i = 0; i < n; i++) if (g[i] === e[i]) hits++;
  return hits / n;
}

// Per-solver accuracy tally.
const summary = {};
for (const solver of solvers) summary[solver.name] = { scored: 0, correct: 0, accSum: 0 };

for (const solver of solvers) {
  for (const record of records) {
    if (record.blind) continue; // skip blind for training
    const res = solver.solve(record);
    // The corpus uses `plaintext`; tolerate `cipher_name`/`id` for the label.
    const expected = record.plaintext;
    const char_accuracy = charAccuracy(res && res.plaintext, expected);
    const correct = expected != null && char_accuracy !== null
      ? normalize(res && res.plaintext) === normalize(expected)
      : null;
    if (correct !== null) {
      const s = summary[solver.name];
      s.scored++;
      if (correct) s.correct++;
      s.accSum += char_accuracy;
    }
    results.push({
      record_id: record.cipher_name ?? record.id ?? record.cipher_type,
      solver_name: solver.name,
      run_id,
      timestamp: now,
      correct,
      char_accuracy,
      result: res
    });
  }
}

// Aggregate accuracy per solver — this is what the benchmark actually measures.
const summaryRows = Object.entries(summary).map(([solver_name, s]) => ({
  solver_name,
  scored: s.scored,
  correct: s.correct,
  exact_accuracy: s.scored ? s.correct / s.scored : null,
  mean_char_accuracy: s.scored ? s.accSum / s.scored : null
}));

// Write JSON report
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const jsonPath = path.join(outDir, 'benchmark-report.json');
fs.writeFileSync(jsonPath, results.map(r => JSON.stringify(r)).join('\n'));
const summaryPath = path.join(outDir, 'benchmark-summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summaryRows, null, 2));

// Write HTML report (summary + per-record table)
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = v => v == null ? '—' : (v * 100).toFixed(1) + '%';
const summaryRowsHtml = summaryRows.map(s =>
  `<tr><td>${esc(s.solver_name)}</td><td>${s.correct}/${s.scored}</td><td>${pct(s.exact_accuracy)}</td><td>${pct(s.mean_char_accuracy)}</td></tr>`).join('');
const htmlRows = results.map(r =>
  `<tr><td>${esc(r.record_id)}</td><td>${esc(r.solver_name)}</td><td>${r.correct == null ? '—' : (r.correct ? '✅' : '❌')}</td><td>${pct(r.char_accuracy)}</td><td>${esc(r.result && r.result.score)}</td><td>${esc(r.result && r.result.details)}</td></tr>`).join('');
const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Benchmark Report</title></head><body>` +
  `<main>` +
  `<h1>Benchmark Report</h1>` +
  `<h2>Accuracy summary</h2>` +
  `<table border="1"><tr><th>Solver</th><th>Solved</th><th>Exact accuracy</th><th>Mean char accuracy</th></tr>${summaryRowsHtml}</table>` +
  `<h2>Per-record results</h2>` +
  `<table border="1"><tr><th>Record</th><th>Solver</th><th>Correct</th><th>Char acc.</th><th>Score</th><th>Details</th></tr>${htmlRows}</table>` +
  `</main></body></html>`;
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
  results_file: jsonPath,
  summary: summaryRows
};
const receiptPath = path.join(outDir, `receipt-${run_id}.json`);
fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));

console.log('Benchmark complete. Reports and receipt written to', outDir);
for (const s of summaryRows) {
  console.log(`  ${s.solver_name}: ${s.correct}/${s.scored} exact` +
    `${s.exact_accuracy == null ? '' : ' (' + (s.exact_accuracy * 100).toFixed(1) + '%)'}`);
}
