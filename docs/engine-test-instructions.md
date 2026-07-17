# How to Validate the Cipher Engines

The authoritative engine check is the verification suite added by the 2026
engine sweep, governed by [CIPHER_ENGINE_STANDARD.md](./CIPHER_ENGINE_STANDARD.md):

```sh
npm run test:engines
```

This runs [tests/engines/run.js](../tests/engines/run.js), which executes:

- all 84 per-engine spec files in `tests/engines/specs/` (fast-check roundtrip
  properties, boundary and robustness cases, invalid-key handling, Unicode
  policy, 100 KB performance ceilings, state isolation, and one fixed
  known-answer test per engine);
- the legacy suites `tests/test-all-engines.js`, `tests/test-deep-ciphers.js`,
  and `tests/test-enigma.js`;
- a full replay of all 100,026 published corpus records in
  `public/corpus/all.jsonl` with exact pinned accounting — the run fails if a
  single record total or per-deviation-rule event count drifts.

All stages must pass; the run ends with
`All cipher engine verification suites passed.`

## Quick individual checks

```sh
node --test tests/engines/specs/<engine>.spec.js   # one engine's spec
node tests/engines/corpus-replay.js                # corpus replay only
node tests/engines/corpus-replay.js --engine hill  # one engine's corpus records
node tests/test-all-engines.js                     # legacy roundtrip/KAT suite
```

## Corpus schema validation

```sh
npm run validate:corpus
```

This checks the corpus files for schema and record validity (data shape, not
engine behavior).

## Troubleshooting

- If a spec fails, check the engine in `js/ciphers/all-engines.js`, its
  contract in `tests/engines/helpers/contracts.js`, and its KAT in
  `tests/engines/helpers/known-answers.js`.
- If the corpus replay reports pinned-count drift, an engine change added or
  removed a mismatch inside a known-deviation family. Either revert the
  behavior change or update the pinned counts in
  `tests/engines/corpus-replay.js` alongside a reviewed explanation.
- After any change to `js/ciphers/all-engines.js`, run `npm run build:js` —
  `tests/test-min-fresh.js` fails if the minified bundle is stale, and the
  service-worker `VERSION` in `sw.js` should be bumped so offline visitors get
  the new bundle.
- `scripts/qa-corpus.js` is deprecated and reports pre-sweep expectations; do
  not use it as an engine gate (see its header comment).
