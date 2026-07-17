'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { engines } = require('../helpers/engine-spec');

require('../helpers/contracts').defineContractSpec('dictionaryCode');

test('dictionaryCode: unusable reference text falls back to the default reference', () => {
	const expected = engines.dictionaryCode.encode('TEST', undefined);
	assert.equal(engines.dictionaryCode.encode('TEST', '!!!'), expected);
	assert.equal(engines.dictionaryCode.decode(expected, '!!!'), 'TEST');
});