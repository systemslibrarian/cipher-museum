'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { engines } = require('../helpers/engine-spec');

require('../helpers/contracts').defineContractSpec('vic');

test('vic: checkerboard output receives chain addition', () => {
	// With key A, the keyed checkerboard maps plaintext A to 0. The chain seed
	// is 1, so stage 2 adds 1 modulo 10; one digit is unchanged by stages 3-4.
	assert.equal(engines.vic.encode('A', 'A'), '1');
	assert.equal(engines.vic.decode('1', 'A'), 'A');
});