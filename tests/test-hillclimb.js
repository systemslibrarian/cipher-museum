// test-hillclimb.js: Unit test for hillclimb solver

const assert = require('assert');
const solver = require('../solvers/hillclimb');

const dummyRecord = {
  ciphertext: 'ABC',
  plaintext: 'ABC',
  cipher_name: 'Dummy',
  language: 'en',
  homophonic: false,
  noisy: false,
  synthetic: false,
  source_provenance: { type: 'synthetic', details: 'test' }
};

const result = solver.solve(dummyRecord);
assert.strictEqual(result.plaintext, 'ABC');
assert.strictEqual(result.score, 0.0);
console.log('hillclimb solver test passed.');
