'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { engines } = require('../helpers/engine-spec');

require('../helpers/contracts').defineContractSpec('otp');

test('otp: automatic pad generation uses the platform CSPRNG', () => {
	const crypto = globalThis.crypto;
	assert.equal(typeof crypto?.getRandomValues, 'function');
	const original = crypto.getRandomValues;
	let calls = 0;
	crypto.getRandomValues = array => {
		calls++;
		array.fill(42);
		return array;
	};
	try {
		const encoded = engines.otp.encode('TEST', '');
		assert.match(encoded, /\[Key: [A-Z]{4}\]/);
		assert.ok(calls > 0, 'expected crypto.getRandomValues to be called');
	} finally {
		crypto.getRandomValues = original;
	}
});