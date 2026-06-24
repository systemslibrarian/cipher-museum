// test-benchmark-runner.js: Unit test for benchmark runner

const fs = require('fs');
const { execSync } = require('child_process');

// Create a minimal corpus file. Ciphertext and plaintext MUST differ so the
// accuracy measurement is meaningful — the no-op stub solvers return the
// ciphertext, which should score as incorrect against the known plaintext.
const corpusPath = 'tests/minicorpus.jsonl';
fs.writeFileSync(corpusPath, JSON.stringify({
  ciphertext: 'DWWDFN',
  plaintext: 'ATTACK',
  cipher_name: 'Dummy',
  language: 'en',
  homophonic: false,
  noisy: false,
  synthetic: false,
  source_provenance: { type: 'synthetic', details: 'test' }
}) + '\n');

// Run the benchmark runner
execSync('node scripts/benchmark-runner.js --corpus tests/minicorpus.jsonl --solvers solvers/ --out tests/', { stdio: 'inherit' });

// Check that reports exist
if (!fs.existsSync('tests/benchmark-report.html') || !fs.existsSync('tests/benchmark-report.json')) {
  throw new Error('Benchmark runner did not produce reports.');
}

// The runner must now actually MEASURE accuracy, not just emit rows.
if (!fs.existsSync('tests/benchmark-summary.json')) {
  throw new Error('Benchmark runner did not produce an accuracy summary.');
}
const summary = JSON.parse(fs.readFileSync('tests/benchmark-summary.json', 'utf8'));
if (!Array.isArray(summary) || summary.length === 0) {
  throw new Error('Benchmark summary is empty.');
}
for (const s of summary) {
  if (typeof s.scored !== 'number' || typeof s.correct !== 'number') {
    throw new Error(`Summary for ${s.solver_name} is missing accuracy fields.`);
  }
  if (s.scored !== 1) {
    throw new Error(`Expected 1 scored record for ${s.solver_name}, got ${s.scored}.`);
  }
  // The stub solvers echo the ciphertext, which differs from the plaintext.
  if (s.correct !== 0) {
    throw new Error(`No-op solver ${s.solver_name} should score 0 correct, got ${s.correct}.`);
  }
}

// Each per-record result must carry a correctness verdict.
const rows = fs.readFileSync('tests/benchmark-report.json', 'utf8').split('\n').filter(Boolean).map(JSON.parse);
if (!rows.every(r => r.correct === false && typeof r.char_accuracy === 'number')) {
  throw new Error('Per-record results are missing correctness/accuracy fields.');
}

console.log('benchmark runner test passed.');
