'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { engines } = require('../helpers/engine-spec');

require('../helpers/contracts').defineContractSpec('purple');

test('purple: preserves the historical sixes/twenties partition', () => {
	const plaintext = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(4);
	const ciphertext = engines.purple.encode(plaintext, 'PURPLE');
	const sixes = new Set('AEIOUY');
	assert.equal(ciphertext.length, plaintext.length);
	for (let index = 0; index < plaintext.length; index++) {
		assert.equal(
			sixes.has(ciphertext[index]),
			sixes.has(plaintext[index]),
			`partition changed at index ${index}: ${plaintext[index]} -> ${ciphertext[index]}`
		);
	}
});