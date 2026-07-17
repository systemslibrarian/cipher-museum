# Test Suites

Two layers, both green in CI (`.github/workflows/ci.yml`):

## Engine verification — `npm run test:engines`

`tests/engines/run.js` runs, in order: all 84 per-engine spec files
(`tests/engines/specs/`, one per registry engine — fast-check roundtrip
properties, boundary/robustness/invalid-key cases, Unicode policy, 100 KB
mixed-content roundtrips, state isolation, and one fixed known-answer each),
a mutation canary that proves the harness catches a deliberately corrupted
engine, the legacy suites (`test-all-engines.js`, `test-deep-ciphers.js`,
`test-enigma.js`), and a pinned replay of all 100,026 published corpus records
(`tests/engines/corpus-replay.js` — exact per-rule accounting, 0 unexplained
failures required). Governed by `docs/CIPHER_ENGINE_STANDARD.md`.

## Site suites — `npm test`

`tests/run-all.js` runs: test-all-engines, test-deep-ciphers,
test-comprehensive, test-accessibility, test-mobile, test-demo-pages
(JSDOM end-to-end clicks on every exhibit demo), test-playground,
test-structural, test-local-links, test-min-fresh (minified bundles current),
and test-sw-version (service-worker cache version matches the bundle hashes).

## Other files in this directory

- Solver and cryptanalysis tests (`test-hillclimb.js`, `test-anneal.js`,
  `test-caesar-break.js`, `test-els.js`, `test-lorenz-depth.js`,
  `solvers-smoke.js`, `test-detective*.js`) — run individually as needed.
- Corpus schema checks run via `npm run validate:corpus`
  (`scripts/validate-corpus-v0.2.js`), not from this directory.
- `archive/` holds historical benchmark reports and runner receipts.
