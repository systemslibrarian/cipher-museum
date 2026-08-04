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
 * the spec suite runs at --test-concurrency=4, and under that contention the
 * *larger* of the two runs is proportionally more likely to absorb a GC pause
 * or a scheduler preemption. That produced 10-15x readings for engines which
 * measure 2-6x on a quiet process — false alarms that would have trained people
 * to ignore this check. Measurement needs a quiet room.
 *
 * Why it exists at all: autokey decrypted in quadratic time for the entire life
 * of this repo. It indexed back into a string it was building with `+=`, and V8
 * flattens the rope on every indexed read. 25 KB -> 100 KB cost 47.6ms ->
 * 774.4ms. Nothing caught it, because every correctness test passed — a wrong
 * complexity class is still the right answer, just slowly.
 *
 * Coverage note: an engine is only judged once its baseline is long enough for
 * the timing to mean anything, so the input is doubled until it is. At a fixed
 * 25 KB only 8 of 85 engines were slow enough to judge; escalating brings the
 * check to most of the registry. Engines that stay too fast to measure even at
 * the cap are reported as skipped rather than silently passed.
 */

const assert = require('node:assert/strict');

global.window = global;
require('../../js/ciphers/all-engines.js');
const engines = global.CipherEngines;

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MEASURABLE_MS = 20;      // below this, jitter swamps the signal
const BASE_BYTES = 25 * 1024;
const MAX_BASE_BYTES = 8 * BASE_BYTES;
const RATIO_LIMIT = 10;        // linear 4, quadratic 16
const SAMPLES = 3;             // best-of, to shrug off a single pause

// Keys that satisfy each engine's documented format. An engine whose key format
// is not represented here simply cannot be timed generically, and is skipped.
const KEYS = {
  hill: '3,3,2,5', trifid: 'FELIX', railFence: '3', scytale: '3', stager: '2',
  alberti: '3', bazeries: '42', jefferson: '3,1,5,2,4,6', enigma: 'AAA',
  gronsfeld: '31415', patterson: '13,34,57,65,22,78,49',
  doubleTransposition: 'MARK,LION', adfgx: 'PRIVACY,A', adfgvx: 'PRIVACY,A',
  nihilist: 'NIHILIST,NEMO', foursquare: 'PRIVACY,GERMAN',
  twosquare: 'PRIVACY,GERMAN', cardanoGrille: '5:0,3,7,12,19'
};

const build = size => ALPHABET.repeat(Math.ceil(size / ALPHABET.length)).slice(0, size);

function timeRoundtrip(engine, text, key) {
  let best = Infinity;
  for (let i = 0; i < SAMPLES; i++) {
    const startedAt = process.hrtime.bigint();
    try {
      engine.decode(engine.encode(text, key), key);
    } catch (err) {
      return null;
    }
    const ms = Number(process.hrtime.bigint() - startedAt) / 1e6;
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
  const key = KEYS[name] || 'KEY';

  let baseBytes = BASE_BYTES;
  let small = timeRoundtrip(engine, build(baseBytes), key);
  while (small !== null && small < MEASURABLE_MS && baseBytes < MAX_BASE_BYTES) {
    baseBytes *= 2;
    small = timeRoundtrip(engine, build(baseBytes), key);
  }

  if (small === null) { skipped.push(`${name} (key format not timeable here)`); continue; }
  if (small < MEASURABLE_MS) { skipped.push(`${name} (too fast to time at ${MAX_BASE_BYTES / 1024} KB)`); continue; }

  const large = timeRoundtrip(engine, build(baseBytes * 4), key);
  if (large === null) { skipped.push(`${name} (failed at 4x)`); continue; }

  judged++;
  const ratio = large / small;
  if (ratio > RATIO_LIMIT) {
    failures.push({ name, baseBytes, small, large, ratio });
    console.error(`  ❌  ${name.padEnd(24)} ${ratio.toFixed(1)}x  ` +
      `(${Math.round(baseBytes / 1024)} KB ${small.toFixed(1)}ms → ` +
      `${Math.round(baseBytes * 4 / 1024)} KB ${large.toFixed(1)}ms)`);
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

assert.ok(judged >= 40, `only ${judged} engines were timeable — coverage has regressed`);
