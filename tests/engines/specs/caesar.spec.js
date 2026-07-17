'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  engines,
  fc,
  stringFrom,
  defineRoundtripSpec,
  defineRobustnessSpec
} = require('../helpers/engine-spec');
const { defineKnownAnswerSpec } = require('../helpers/known-answers');

const letters = fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
const visibleAscii = fc.integer({ min: 32, max: 126 }).map(String.fromCharCode);
const ordinaryText = stringFrom(visibleAscii, { maxLength: 512 });
const repeatedText = fc.tuple(visibleAscii, fc.integer({ min: 0, max: 512 }))
  .map(([character, length]) => character.repeat(length));
const longText = stringFrom(visibleAscii, { minLength: 4096, maxLength: 8192 });
const plaintextArbitrary = fc.oneof(
  { weight: 8, arbitrary: ordinaryText },
  { weight: 2, arbitrary: repeatedText },
  { weight: 1, arbitrary: longText },
  { weight: 1, arbitrary: stringFrom(letters, { minLength: 1, maxLength: 1 }) },
  { weight: 1, arbitrary: fc.constant('AZaz') },
  { weight: 1, arbitrary: fc.constant('') }
);
const keyArbitrary = fc.integer({ min: -10000, max: 10000 }).map(String);

defineRoundtripSpec({
  name: 'caesar',
  plaintextArbitrary,
  keyArbitrary,
  examples: [
    { plaintext: '', key: '3' },
    { plaintext: 'A', key: '1' },
    { plaintext: 'Zz', key: '25' },
    { plaintext: 'A'.repeat(4096), key: '1' },
    { plaintext: 'THE QUICK BROWN FOX', key: '333333' },
    { plaintext: 'Key longer than plaintext!', key: '123456789' }
  ]
});

test('caesar: published shift-3 example', () => {
  // Wikipedia, "Caesar cipher", Example section:
  // https://en.wikipedia.org/wiki/Caesar_cipher
  assert.equal(
    engines.caesar.encode('THE QUICK BROWN FOX', '3'),
    'WKH TXLFN EURZQ IRA'
  );
});

defineRobustnessSpec({
  name: 'caesar',
  canonicalize: input => input,
  edgeKey: '3'
});

defineKnownAnswerSpec('caesar', engines.caesar);