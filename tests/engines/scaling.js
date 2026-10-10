#!/usr/bin/env node
'use strict';

/**
 * Complexity guard — does any engine scale worse than linearly?
 *
 * Quadruple the input and time it. Linear work gives 4x; quadratic gives 16x.
 * The threshold sits between them, because a looser bound would not catch the
 * thing this file exists for.
 *
 * Why this is its own serial script rather than part of the property specs:
 * the spec suite runs at --test-concurrency=4, and concurrent work can perturb
 * the process itself (for example, through garbage collection). CPU time keeps
 * unrelated scheduler pauses out of the measurement, while serial execution
 * keeps process-local contention low.
 *
 * Why it exists at all: autokey decrypted in quadratic time for the entire life
 * of this repo. It indexed back into a string it was building with `+=`, and V8
 * flattens the rope on every indexed read. 25 KB -> 100 KB cost 47.6ms ->
 * 774.4ms. Nothing caught it, because every correctness test passed — a wrong
 * complexity class is still the right answer, just slowly.
 *
 * Coverage note: an engine is only judged once its baseline is long enough for
 * the timing to mean anything. Fast engines are measured in batches of repeated
 * 25 KB roundtrips, then the same batch size is measured at 100 KB. Runtime no
 * longer decides whether a fast engine counts toward coverage. Every registry
 * engine must be measurable; one with a special key format needs an entry below.
 */

const assert = require('node:assert/strict');

global.window = global;
require('../../js/ciphers/all-engines.js');
const engines = global.CipherEngines;

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MEASURABLE_CPU_MS = 20;  // below this, timer granularity swamps the signal
const BASE_BYTES = 25 * 1024;
const RATIO_LIMIT = 10;        // linear 4, quadratic 16
const SAMPLES = 3;             // best-of, to shrug off transient process work
const MAX_REPEATS = 128;

// Keys that satisfy each engine's documented format. An engine whose key format
// is not represented here is reported as skipped and fails the coverage check.
const KEYS = {
  hill: '3,3,2,5', trifid: 'FELIX', railFence: '3', scytale: '3', stager: '2',
  alberti: '3', bazeries: '42', jefferson: '3,1,5,2,4,6', enigma: 'AAA',
  gronsfeld: '31415', patterson: '13,34,57,65,22,78,49',
  doubleTransposition: 'MARK,LION', adfgx: 'PRIVACY,A', adfgvx: 'PRIVACY,A',
  nihilist: 'NIHILIST,NEMO', foursquare: 'PRIVACY,GERMAN',
  twosquare: 'PRIVACY,GERMAN', cardanoGrille: '5:0,3,7,12,19'
};

const build = size => ALPHABET.repeat(Math.ceil(size / ALPHABET.length)).slice(0, size);
const keyFor = (name, text) => name === 'otp'
  ? 'K'.repeat(text.length)
  : (KEYS[name] || 'KEY');

function timeRoundtrip(engine, text, key, repeats) {
  let best = Infinity;
  for (let i = 0; i < SAMPLES; i++) {
    const startedAt = process.cpuUsage();
    try {
      for (let repeat = 0; repeat < repeats; repeat++) {
        engine.decode(engine.encode(text, key), key);
      }
    } catch (err) {
      return null;
    }
    const usage = process.cpuUsage(startedAt);
    const ms = (usage.user + usage.system) / 1000;
    if (ms < best) best = ms;
  }
  return best;
}

const names = Object.keys(engines).sort();
const failures = [];
let judged = 0;
const skipped = [];

console.log(`\n━━━ Engine complexity: ${names.length} engines, ratio limit ${RATIO_LIMIT}x ━━━\n`);

for (const name of names) {
  const engine = engines[name];

  let repeats = 1;
  const smallText = build(BASE_BYTES);
  const smallKey = keyFor(name, smallText);
  let small = timeRoundtrip(engine, smallText, smallKey, repeats);
  while (small !== null && small < MEASURABLE_CPU_MS && repeats < MAX_REPEATS) {
    repeats *= 2;
    small = timeRoundtrip(engine, smallText, smallKey, repeats);
  }

  if (small === null) { skipped.push(`${name} (key format not timeable here)`); continue; }
  if (small < MEASURABLE_CPU_MS) {
    skipped.push(`${name} (too fast to time in ${MAX_REPEATS} × ${BASE_BYTES / 1024} KB batch)`);
    continue;
  }

  const largeText = build(BASE_BYTES * 4);
  const large = timeRoundtrip(engine, largeText, keyFor(name, largeText), repeats);
  if (large === null) { skipped.push(`${name} (failed at 4x)`); continue; }

  judged++;
  const ratio = large / small;
  if (ratio > RATIO_LIMIT) {
    failures.push({ name, repeats, small, large, ratio });
    console.error(`  ❌  ${name.padEnd(24)} ${ratio.toFixed(1)}x  ` +
      `(${repeats} × ${BASE_BYTES / 1024} KB ${small.toFixed(1)} CPU-ms → ` +
      `${repeats} × ${BASE_BYTES * 4 / 1024} KB ${large.toFixed(1)} CPU-ms)`);
  }
}

console.log(`\n  judged ${judged}, skipped ${skipped.length}`);
if (skipped.length) console.log('  skipped: ' + skipped.join(', '));

console.log('\n══════════════════════════════════════════════════════════════════════');
console.log(`  ${failures.length === 0 ? '✅' : '❌'} ${judged - failures.length} within linear bound   ` +
  `❌ ${failures.length} worse than linear`);
console.log('══════════════════════════════════════════════════════════════════════\n');

if (failures.length) {
  console.error('An engine scaling worse than linearly is usually one of:');
  console.error('  - building a string with += and then indexing back into it (autokey)');
  console.error('  - an O(n) lookup inside the per-character loop');
  console.error('  - re-deriving per-message state on every character\n');
  process.exit(1);
}

assert.equal(judged, names.length,
  `${names.length - judged} engines were not timeable — coverage has regressed`);
