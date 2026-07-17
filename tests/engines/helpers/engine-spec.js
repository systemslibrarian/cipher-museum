'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const fc = require('fast-check');

global.window = global;
require('../../../js/ciphers/all-engines.js');

const engines = global.CipherEngines;

function stringFrom(charArbitrary, constraints = {}) {
  return fc.array(charArbitrary, constraints).map(chars => chars.join(''));
}

function textArbitrary(alphabet, { maxLength = 256, longLength = 2048 } = {}) {
  const character = fc.constantFrom(...alphabet);
  const ordinary = stringFrom(character, { maxLength });
  const repeated = fc.tuple(character, fc.integer({ min: 0, max: maxLength }))
    .map(([value, length]) => value.repeat(length));
  const long = stringFrom(character, {
    minLength: Math.floor(longLength / 2),
    maxLength: longLength
  });

  return fc.oneof(
    { weight: 8, arbitrary: ordinary },
    { weight: 2, arbitrary: repeated },
    { weight: 1, arbitrary: long },
    { weight: 1, arbitrary: stringFrom(character, { minLength: 1, maxLength: 1 }) },
    { weight: 1, arbitrary: fc.constant('') }
  );
}

function keywordArbitrary(alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
  const character = fc.constantFrom(...alphabet);
  return fc.oneof(
    { weight: 8, arbitrary: stringFrom(character, { minLength: 1, maxLength: 32 }) },
    { weight: 2, arbitrary: fc.tuple(character, fc.integer({ min: 1, max: 32 }))
      .map(([value, length]) => value.repeat(length)) },
    { weight: 1, arbitrary: stringFrom(character, { minLength: 33, maxLength: 64 }) }
  );
}

function numericKeyArbitrary({ min = -10000, max = 10000 } = {}) {
  return fc.integer({ min, max }).map(String);
}

function keyPairArbitrary() {
  return fc.tuple(keywordArbitrary(), keywordArbitrary())
    .map(keys => keys.join(','));
}

function matrixKeyArbitrary() {
  function gcd(left, right) {
    let a = Math.abs(left);
    let b = Math.abs(right);
    while (b) [a, b] = [b, a % b];
    return a;
  }

  return fc.tuple(
    fc.integer({ min: -25, max: 25 }),
    fc.integer({ min: -25, max: 25 }),
    fc.integer({ min: -25, max: 25 }),
    fc.integer({ min: -25, max: 25 })
  ).filter(([a, b, c, d]) => gcd(a * d - b * c, 26) === 1)
    .map(values => values.join(','));
}

function boundaryExamples(alphabet, keys, boundaryText) {
  const keyAt = index => keys[index % keys.length];
  const first = alphabet[0];
  const last = alphabet[alphabet.length - 1];
  return [
    { plaintext: '', key: keyAt(0) },
    { plaintext: first, key: keyAt(1) },
    { plaintext: boundaryText || first + last + last + first, key: keyAt(2) },
    { plaintext: first.repeat(4096), key: keyAt(3) },
    { plaintext: alphabet, key: keyAt(4) }
  ];
}

function roundtrip(engine, plaintext, key) {
  return engine.decode(engine.encode(plaintext, key), key);
}

function defineRoundtripSpec({
  name,
  plaintextArbitrary,
  keyArbitrary,
  caseArbitrary,
  examples,
  numRuns = 250,
  run = roundtrip
}) {
  const engine = engines[name];

  test(`${name}: exposes encode and decode`, () => {
    assert.equal(typeof engine?.encode, 'function');
    assert.equal(typeof engine?.decode, 'function');
  });

  test(`${name}: roundtrips required boundary classes`, () => {
    for (const { plaintext, key } of examples) {
      assert.equal(run(engine, plaintext, key), plaintext,
        `plaintext=${JSON.stringify(plaintext)} key=${JSON.stringify(key)}`);
    }
  });

  test(`${name}: property roundtrip`, () => {
    const property = caseArbitrary
      ? fc.property(caseArbitrary, ({ plaintext, key }) => {
        assert.equal(run(engine, plaintext, key), plaintext);
      })
      : fc.property(plaintextArbitrary, keyArbitrary, (plaintext, key) => {
        assert.equal(run(engine, plaintext, key), plaintext);
      });
    fc.assert(property, { numRuns });
  });
}

function defineAlphabetRoundtripSpec({
  name,
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  keyArbitrary = fc.constant(undefined),
  caseArbitrary,
  exampleKeys = [undefined],
  examples,
  boundaryText,
  run,
  numRuns
}) {
  defineRoundtripSpec({
    name,
    plaintextArbitrary: textArbitrary(alphabet),
    keyArbitrary,
    caseArbitrary,
    examples: examples || boundaryExamples(alphabet, exampleKeys, boundaryText),
    run,
    numRuns
  });
}

function defineRobustnessSpec({
  name,
  canonicalize,
  edgeKey,
  edgeKeyFor,
  run = roundtrip,
  maxLongRunMs = 5000
}) {
  const engine = engines[name];
  const edgeInputs = [
    '',
    '   ',
    'A',
    'Hello, World! 123',
    'emoji: 😀; CJK: 漢字; RTL: שלום',
    'é',
    'e\u0301'
  ];

  test(`${name}: documented text and Unicode policy`, () => {
    for (const input of edgeInputs) {
      const key = edgeKeyFor ? edgeKeyFor(input) : edgeKey;
      const actual = run(engine, input, key);
      assert.equal(typeof actual, 'string');
      assert.equal(actual, canonicalize(input), `input=${JSON.stringify(input)}`);
    }
  });

  test(`${name}: invalid keys do not throw uncaught exceptions`, () => {
    for (const key of [undefined, null, '', '!!!', '999999999999999999999']) {
      assert.doesNotThrow(() => {
        const encoded = engine.encode('TEST', key);
        assert.equal(typeof encoded, 'string');
        assert.doesNotMatch(encoded, /undefined|NaN|\?{2,}|�/);
        const decoded = engine.decode(encoded, key);
        assert.equal(typeof decoded, 'string');
        assert.doesNotMatch(decoded, /undefined|NaN|\?{2,}|�/);
      }, `key=${JSON.stringify(key)}`);
    }
  });

  test(`${name}: output is isolated from other engine calls`, () => {
    const plaintext = 'ATTACKATDAWN';
    const key = edgeKeyFor ? edgeKeyFor(plaintext) : edgeKey;
    const before = engine.encode(plaintext, key);
    engines.caesar.encode('INTERLEAVEDCALL', '17');
    const after = engine.encode(plaintext, key);
    assert.equal(after, before);
  });

  test(`${name}: roundtrips 100 KB without excessive runtime`, () => {
    const plaintext = 'A'.repeat(100 * 1024);
    const key = edgeKeyFor ? edgeKeyFor(plaintext) : edgeKey;
    const startedAt = process.hrtime.bigint();
    const actual = run(engine, plaintext, key);
    const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    assert.equal(actual, plaintext);
    assert.ok(elapsedMs <= maxLongRunMs, `elapsed=${elapsedMs.toFixed(1)}ms limit=${maxLongRunMs}ms`);
  });
}

module.exports = {
  engines,
  fc,
  stringFrom,
  textArbitrary,
  keywordArbitrary,
  numericKeyArbitrary,
  keyPairArbitrary,
  matrixKeyArbitrary,
  boundaryExamples,
  defineRoundtripSpec,
  defineAlphabetRoundtripSpec,
  defineRobustnessSpec
};