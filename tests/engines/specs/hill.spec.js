'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { engines } = require('../helpers/engine-spec');

require('../helpers/contracts').defineContractSpec('hill');

test('hill: singular matrices are rejected on encode and decode', () => {
	for (const key of ['1,2,2,4', '2,4,1,2', '13,13,13,13', '0,0,0,0']) {
		assert.equal(engines.hill.encode('TEST', key), 'Matrix not invertible mod 26', `encode key=${key}`);
		assert.equal(engines.hill.decode('ABCD', key), 'Matrix not invertible mod 26', `decode key=${key}`);
	}
});

test('hill: non-numeric matrix entries are rejected on encode', () => {
	assert.equal(engines.hill.encode('TEST', 'a,b,c,d'), 'Need 4 numbers (2x2 matrix)');
});
