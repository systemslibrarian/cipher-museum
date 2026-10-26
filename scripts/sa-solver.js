#!/usr/bin/env node
/**
 * Simulated Annealing Monoalphabetic Solver
 *
 * Breaks monoalphabetic substitution ciphers using quadgram scoring and
 * simulated annealing (SA). Accepting some worse moves can escape local optima;
 * relative success depends on the ciphertext, model and budget. See the seeded,
 * equal-evaluation-budget comparison in evaluate-solvers.js.
 *
 * Usage:
 *   node scripts/sa-solver.js "CIPHERTEXT HERE"
 *   node scripts/sa-solver.js --file path/to/ciphertext.txt
 *   node scripts/sa-solver.js --corpus public/corpus/intermediate.jsonl --limit 10
 *   node scripts/sa-solver.js --compare  # compare SA vs hill-climbing on a test set
 *
 * Algorithm:
 *   1. Start with a random key and initial temperature T0
 *   2. At each step, randomly swap two letters in the current key
 *   3. Compute delta = newScore - currentScore
 *   4. Accept if delta > 0 (improvement) or with probability exp(delta / T) (worse move)
 *   5. Cool temperature: T = T * cooling_rate after each step
 *   6. Track the globally best key seen throughout the run
 *   7. Restart from a new random key; return the best across all restarts
 *
 * SA vs Hill Climbing:
 *   Hill climbing: fast, deterministic convergence, stuck in local optima
 *   SA: accepts some worse moves; no universal superiority is claimed
 *   Compare HC, SA and SA+HC under matched budgets on held-out tasks
 *
 * Educational note: Simulated annealing was introduced by Kirkpatrick et al. (1983)
 * and named for the metallurgical process of controlled cooling to reduce defects.
 * Its application to cipher solving was described by Jakobsen (1995) and is now
 * standard in automated classical cryptanalysis.
 *
 * References:
 *   Kirkpatrick, S., Gelatt, C.D., Vecchi, M.P. (1983). Optimization by Simulated
 *     Annealing. Science, 220(4598), 671-680.
 *   Jakobsen, T. (1995). A Fast Method for the Cryptanalysis of Substitution Ciphers.
 *     Cryptologia, 19(3), 265-274.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Re-use scoring from hill-climbing-solver
const hc = require('./hill-climbing-solver');
const { scoreText, decrypt, cleanText, hillClimbOnce } = hc;

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const { rng } = require('../js/columnar-search');

function randomKey(random = Math.random) {
  const arr = ALPHA.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

function randomSwap(key, random = Math.random) {
  const arr = key.split('');
  const i = Math.floor(random() * 26);
  let j = Math.floor(random() * 25);
  if (j >= i) j++;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  return arr.join('');
}

// ── SA core ────────────────────────────────────────────────────────────────────

/**
 * Run one simulated annealing pass.
 *
 * @param {string} ciphertext  - Cleaned (A-Z only) ciphertext
 * @param {object} opts
 * @param {number} opts.T0            - Initial temperature (default: 10)
 * @param {number} opts.coolingRate   - Multiplicative cooling per step (default: 0.9997)
 * @param {number} opts.maxSteps      - Max annealing steps (default: 50000)
 */
function saOnce(ciphertext, opts = {}) {
  const T0 = opts.T0 || 10;
  // Cooling must be strictly within (0,1): >= 1 never cools (search degenerates
  // into a non-converging random walk), <= 0 is meaningless.
  let coolingRate = opts.coolingRate || 0.9997;
  if (!(coolingRate > 0 && coolingRate < 1)) coolingRate = 0.9997;
  const maxSteps = opts.maxSteps || 50000;

  const random = opts.random || (opts.seed === undefined ? Math.random : rng(opts.seed));
  let key = randomKey(random);
  let plain = decrypt(ciphertext, key);
  let score = scoreText(plain);

  let bestKey = key;
  let bestScore = score;
  let bestPlain = plain;

  let T = T0;

  for (let step = 0; step < maxSteps; step++) {
    const newKey = randomSwap(key, random);
    const newPlain = decrypt(ciphertext, newKey);
    const newScore = scoreText(newPlain);
    const delta = newScore - score;

    if (delta > 0 || random() < Math.exp(delta / T)) {
      key = newKey;
      plain = newPlain;
      score = newScore;

      if (score > bestScore) {
        bestKey = key;
        bestScore = score;
        bestPlain = plain;
      }
    }

    // Floor the temperature so exp(delta / T) can never divide by an
    // underflowed-to-zero T (which would yield NaN and corrupt acceptance).
    T = Math.max(T * coolingRate, 1e-6);
  }

  return { key: bestKey, plaintext: bestPlain, score: bestScore };
}

// ── Multi-restart SA ───────────────────────────────────────────────────────────

/**
 * Solve a monoalphabetic cipher using simulated annealing with restarts.
 *
 * @param {string} ciphertext  - The ciphertext (any case, spaces/punctuation OK)
 * @param {object} opts
 * @param {number}  opts.restarts       - Number of SA restarts (default: 5)
 * @param {number}  opts.T0             - Initial temperature (default: 10)
 * @param {number}  opts.coolingRate    - Cooling rate per step (default: 0.9997)
 * @param {number}  opts.maxSteps       - Steps per restart (default: 50000)
 * @param {boolean} opts.hybridFinish   - Run hill-climbing polish after SA (default: true)
 * @param {boolean} opts.verbose        - Print per-restart progress
 */
function solve(ciphertext, opts = {}) {
  const restarts = opts.restarts !== undefined ? opts.restarts : 5;
  const hybridFinish = opts.hybridFinish !== false;
  const verbose = opts.verbose || false;
  const ct = cleanText(ciphertext);

  if (ct.length < 10) {
    console.warn(`Warning: ciphertext only ${ct.length} chars. SA needs 30+ chars for reliable results.`);
  }

  const random = opts.seed === undefined ? Math.random : rng(opts.seed);
  let best = { key: randomKey(random), plaintext: '', score: -Infinity };

  for (let r = 0; r < restarts; r++) {
    let result = saOnce(ct, {
      random,
      T0: opts.T0,
      coolingRate: opts.coolingRate,
      maxSteps: opts.maxSteps,
    });

    if (hybridFinish) {
      // Polish the SA result with hill climbing to find the true local optimum
      result = hillClimbFromKey(ct, result.key);
    }

    if (verbose) {
      process.stdout.write(
        `  SA restart ${r + 1}/${restarts}: score=${result.score.toFixed(1)}  ` +
        `"${result.plaintext.slice(0, 40)}"\n`
      );
    }

    if (result.score > best.score) {
      best = result;
    }
  }

  return { ...best, restarts, ciphertext: ct, method: 'sa' + (hybridFinish ? '+hc' : '') };
}

/**
 * Run hill-climbing starting from a given key (not random).
 * Used as a polish step after SA finds a good region.
 */
function hillClimbFromKey(ciphertext, startKey) {
  let key = startKey;
  let plain = decrypt(ciphertext, key);
  let score = scoreText(plain);

  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < 25; i++) {
      for (let j = i + 1; j < 26; j++) {
        const arr = key.split('');
        [arr[i], arr[j]] = [arr[j], arr[i]];
        const newKey = arr.join('');
        const newPlain = decrypt(ciphertext, newKey);
        const newScore = scoreText(newPlain);
        if (newScore > score) {
          key = newKey;
          plain = newPlain;
          score = newScore;
          improved = true;
        }
      }
    }
  }

  return { key, plaintext: plain, score };
}

// ── Comparison mode ────────────────────────────────────────────────────────────

/**
 * Run a head-to-head comparison of SA vs hill-climbing on a set of corpus records.
 */
function compareOnCorpus(corpusPath, limit) {
  const bounded = require('./budgeted-solvers');
  const records = fs.readFileSync(corpusPath, 'utf8').split('\n').filter(Boolean).map(JSON.parse)
    .filter(r => r.cipher_type === 'monoalphabetic' && r.language === 'en' && typeof r.plaintext === 'string').slice(0,limit);
  for (const record of records) for (const seed of [19,83,211]) for (const method of ['hc','sa','sa+hc']) {
    const result = bounded.solve(record.ciphertext, { method, seed, budget:6000 });
    console.log(JSON.stringify({ id:record.id, seed, method, evaluations:result.evaluations, exact:result.plaintext===cleanText(record.plaintext) }));
  }
  console.log('Equal evaluation counts include initial scores, restarts and hybrid polishing. Use evaluate-solvers.js for the versioned held-out benchmark; a supplied corpus may overlap model training.');
}

// ── Output formatting ──────────────────────────────────────────────────────────

function printResult(result) {
  const { key, plaintext, score, ciphertext, restarts, method } = result;
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`Method:     ${method || 'sa+hc'} (${restarts} restarts)`);
  console.log(`Ciphertext: ${ciphertext.slice(0, 60)}${ciphertext.length > 60 ? '...' : ''}`);
  console.log(`Plaintext:  ${plaintext.slice(0, 60)}${plaintext.length > 60 ? '...' : ''}`);
  console.log(`Key:        ${key}`);
  console.log(`Score:      ${score.toFixed(3)}`);
}

function printKey(key) {
  console.log(`\nCipher alphabet (ciphertext → plaintext):`);
  console.log(`CT: ${ALPHA}`);
  console.log(`PT: ${key}`);
}

// ── CLI ────────────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Simulated Annealing Monoalphabetic Solver — Cipher Museum

USAGE:
  node scripts/sa-solver.js "CIPHERTEXT"
  node scripts/sa-solver.js --file path/to/ciphertext.txt
  node scripts/sa-solver.js --corpus public/corpus/intermediate.jsonl [--limit N]
  node scripts/sa-solver.js --compare --corpus public/corpus/beginner.jsonl --limit 20

OPTIONS:
  --seed N         Reproduce a solve with this unsigned 32-bit seed
  --restarts N     SA restarts (default: 5)
  --steps N        SA steps per restart (default: 50000)
  --T0 F           Initial temperature (default: 10.0)
  --cooling F      Cooling rate per step (default: 0.9997)
  --no-hybrid      Skip hill-climbing polish after SA (faster but less accurate)
  --verbose        Print per-restart progress
  --compare        Run SA vs HC comparison on corpus records
  --limit N        Max corpus records to test

EXAMPLES:
  # Solve a direct ciphertext (SA + hill-climbing polish):
  node scripts/sa-solver.js "WKHHQHPBDWWDFNVDWGDZQ" --restarts 10 --verbose

  # Use SA alone (no HC polish) for very long ciphertexts:
  node scripts/sa-solver.js --file tests/long-cipher.txt --no-hybrid --restarts 3

  # Compare SA vs hill-climbing on 20 corpus records:
  node scripts/sa-solver.js --compare --corpus public/corpus/beginner.jsonl --limit 20

WHEN TO USE SA vs HILL CLIMBING:
  Compare matched budgets and report failures; success depends on length and model.
  Run node scripts/evaluate-solvers.js for held-out comparisons and ablations.
`);
    process.exit(0);
  }

  let ciphertext = null;
  let filePath = null;
  let corpusPath = null;
  let restarts = 5;
  let steps = 50000;
  let T0 = 10;
  let coolingRate = 0.9997;
  let hybridFinish = true;
  let verbose = false;
  let compare = false;
  let limit = 20;
  let seed;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--seed') seed = Number(args[++i]);
    else if (args[i] === '--file') filePath = args[++i];
    else if (args[i] === '--corpus') corpusPath = args[++i];
    else if (args[i] === '--restarts') restarts = parseInt(args[++i], 10);
    else if (args[i] === '--steps') steps = parseInt(args[++i], 10);
    else if (args[i] === '--T0') T0 = parseFloat(args[++i]);
    else if (args[i] === '--cooling') coolingRate = parseFloat(args[++i]);
    else if (args[i] === '--no-hybrid') hybridFinish = false;
    else if (args[i] === '--verbose') verbose = true;
    else if (args[i] === '--compare') compare = true;
    else if (args[i] === '--limit') limit = parseInt(args[++i], 10);
    else if (!args[i].startsWith('--')) ciphertext = args[i];
  }

  if (filePath) {
    ciphertext = fs.readFileSync(filePath, 'utf8').trim();
  }

  if (compare) {
    if (!corpusPath) corpusPath = 'public/corpus/beginner.jsonl';
    compareOnCorpus(corpusPath, limit, verbose);
    process.exit(0);
  }

  if (corpusPath && !compare) {
    const lines = fs.readFileSync(corpusPath, 'utf8').split('\n').filter(l => l.trim());
    const monoRecords = lines
      .map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(r => r && r.cipher_type === 'monoalphabetic' && r.language === 'en'
                && r.transcription_quality === 'clean' && r.source_type !== 'historical');

    const tests = monoRecords.slice(0, limit);
    console.log(`Testing ${tests.length} monoalphabetic records from ${corpusPath}`);

    let correct = 0;
    for (const record of tests) {
      const result = solve(record.ciphertext, { seed, restarts, maxSteps: steps, T0, coolingRate, hybridFinish, verbose });
      const expected = cleanText(record.plaintext);
      const got = cleanText(result.plaintext);
      const match = got === expected;
      if (match) correct++;
      console.log(`\n[${record.id}] ${match ? '✓' : '✗'}`);
      console.log(`  Expected:  ${expected.slice(0, 50)}`);
      console.log(`  Got:       ${got.slice(0, 50)}`);
      console.log(`  Score: ${result.score.toFixed(1)}`);
    }
    console.log(`\nAccuracy: ${correct}/${tests.length} (${(100 * correct / tests.length).toFixed(1)}%)`);
    process.exit(0);
  }

  if (!ciphertext) {
    console.error('Error: provide ciphertext as argument, --file, or --corpus');
    process.exit(1);
  }

  console.log('Solving monoalphabetic cipher using simulated annealing...');
  const result = solve(ciphertext, { seed, restarts, maxSteps: steps, T0, coolingRate, hybridFinish, verbose });
  printResult(result);
  printKey(result.key);
}

module.exports = { solve, saOnce, hillClimbFromKey };
