// test-benchmark-runner.js: Unit test for benchmark runner

const fs = require('fs');
const { execSync } = require('child_process');

// Create a minimal corpus file
const corpusPath = 'tests/minicorpus.jsonl';
fs.writeFileSync(corpusPath, JSON.stringify({
  ciphertext: 'ABC',
  plaintext: 'ABC',
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
if (fs.existsSync('tests/benchmark-report.html') && fs.existsSync('tests/benchmark-report.json')) {
  console.log('benchmark runner test passed.');
} else {
  throw new Error('Benchmark runner did not produce reports.');
}
