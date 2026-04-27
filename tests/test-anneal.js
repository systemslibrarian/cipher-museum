// test-anneal.js: Unit test for anneal solver

const assert = require('assert');
const solver = require('../solvers/anneal');

const dummyRecord = {
  ciphertext: 'XYZ',
  plaintext: 'XYZ',
  cipher_name: 'Dummy',
  language: 'en',
  homophonic: false,
  noisy: false,
  synthetic: false,
  source_provenance: { type: 'synthetic', details: 'test' }
};

const result = solver.solve(dummyRecord);
assert.strictEqual(result.plaintext, 'XYZ');
assert.strictEqual(result.score, 0.0);
console.log('anneal solver test passed.');
