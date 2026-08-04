'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const fc = require('fast-check');

global.window = global;
require('../../../js/ciphers/all-engines.js');

const engines = global.CipherEngines;

// Mutation-canary hook: when CIPHER_ENGINE_CANARY names an engine, corrupt its
// encode output. tests/engines/canary.js runs a spec with this set and asserts
// the spec FAILS — proving the harness catches broken engines. Never set in
// normal runs.
if (process.env.CIPHER_ENGINE_CANARY && engines[process.env.CIPHER_ENGINE_CANARY]) {
  const target = engines[process.env.CIPHER_ENGINE_CANARY];
  const originalEncode = target.encode.bind(target);
  target.encode = (text, key) => {
    const out = originalEncode(text, key);
    return typeof out === 'string' && out.length > 0 ? out.slice(0, -1) + (out.endsWith('Q') ? 'R' : 'Q') : out;
  };
}

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
  maxLongRunMs = 5000,
  longAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  allowsMissMarkers = false
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
    const invalidKeys = [
      undefined, null, '', '   ', '!!!', '0', '-5', '3.7', 'a,b,c,d',
      '999999999999999999999', 'A'.repeat(10000)
    ];
    const garbage = allowsMissMarkers ? /undefined|NaN|�/ : /undefined|NaN|\?{2,}|�/;
    for (const key of invalidKeys) {
      assert.doesNotThrow(() => {
        const encoded = engine.encode('TEST', key);
        assert.equal(typeof encoded, 'string');
        assert.doesNotMatch(encoded, garbage);
        const decoded = engine.decode(encoded, key);
        assert.equal(typeof decoded, 'string');
        assert.doesNotMatch(decoded, garbage);
      }, `key=${String(JSON.stringify(key)).slice(0, 40)}`);
    }
    // Behavioral floor: after all invalid-key calls the engine must still work
    // correctly with a valid key — no residual corruption, no dead engine.
    const validKey = edgeKeyFor ? edgeKeyFor('ATTACKATDAWN') : edgeKey;
    assert.equal(run(engine, 'ATTACKATDAWN', validKey), canonicalize('ATTACKATDAWN'));
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
    // Mixed content from the engine's declared alphabet, so this exercises
    // correctness at scale, not just throughput on a degenerate input.
    const build = size => longAlphabet
      .repeat(Math.ceil(size / longAlphabet.length))
      .slice(0, size);

    const quarter = build(25 * 1024);
    const full = build(100 * 1024);

    // Best of three. A single sample is at the mercy of one scheduler hiccup or
    // GC pause; the minimum of a few is a stable estimate of the real cost, which
    // is what keeps this usable while the rest of the suite runs in parallel.
    const time = text => {
      const key = edgeKeyFor ? edgeKeyFor(text) : edgeKey;
      let actual = null;
      let bestMs = Infinity;
      for (let attempt = 0; attempt < 3; attempt++) {
        const startedAt = process.hrtime.bigint();
        actual = run(engine, text, key);
        const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
        if (elapsedMs < bestMs) bestMs = elapsedMs;
      }
      return { actual, elapsedMs: bestMs };
    };

    const small = time(quarter);
    const large = time(full);

    // Correctness at scale is the assertion that always holds.
    assert.equal(small.actual, quarter);
    assert.equal(large.actual, full);

    // What this guard is really for is pathological complexity — an engine that
    // quietly goes quadratic. An absolute wall-clock deadline is a bad proxy for
    // that: it fails on a loaded machine and passes on an idle one, which is why
    // this suite was kept out of `npm test`. Comparing 4x the input against the
    // same engine in the same process is load-neutral, because contention slows
    // both measurements together.
    //
    // Quadratic growth shows up as exactly 16x here, and linear as 4x, so the
    // threshold has to sit between them — a looser bound would not catch the
    // thing this test exists for. That leaves no room to absorb noise, so the
    // ratio is only judged once the smaller run is long enough for the timing to
    // mean something. Below that, scheduler jitter alone can produce 15x.
    //
    // This is not hypothetical: it caught autokey decrypting in quadratic time
    // (47.6ms -> 774.4ms, a ratio of 16.3) because it indexed back into a string
    // it was building with +=. Fixed, that engine now measures 2.4x.
    const MEASURABLE_MS = 20;
    if (small.elapsedMs >= MEASURABLE_MS) {
      const ratio = large.elapsedMs / small.elapsedMs;
      assert.ok(ratio <= 10,
        `4x the input took ${ratio.toFixed(1)}x the time ` +
        `(25 KB ${small.elapsedMs.toFixed(1)}ms, 100 KB ${large.elapsedMs.toFixed(1)}ms) ` +
        '— suggests worse-than-linear scaling');
    }

    // A very loose absolute backstop, so a true hang still fails rather than
    // hanging the run. Deliberately far above any real engine's cost.
    const hangCeilingMs = Math.max(maxLongRunMs * 12, 60000);
    assert.ok(large.elapsedMs <= hangCeilingMs,
      `elapsed=${large.elapsedMs.toFixed(1)}ms exceeded hang backstop ${hangCeilingMs}ms`);
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