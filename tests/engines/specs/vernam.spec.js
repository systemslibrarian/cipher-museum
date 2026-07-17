'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { engines } = require('../helpers/engine-spec');

require('../helpers/contracts').defineContractSpec('vernam');

test('vernam: published bitwise XOR example', () => {
	// Exhibit derivation: H = 01001000 (0x48), key = 10110100 (0xB4),
	// and 01001000 XOR 10110100 = 11111100 (0xFC).
	assert.equal(engines.vernam.encode('H', 'hex:b4'), 'fc');
	assert.equal(engines.vernam.decode('fc', 'hex:b4'), 'H');
});