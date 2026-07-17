# Cipher Engine Verification Sweep Summary

This repository completed a full verification sweep of the 84 cipher engines
registered in `window.CipherEngines`.

The sweep covered five goals:

1. inventory every registry engine and its current evidence;
2. enforce exact encode/decode roundtrip behavior on each engine's declared
   plaintext domain;
3. define and test edge-case behavior, normalization, invalid-key handling, and
   state isolation;
4. compare exhibit claims against what the engines actually implement;
5. leave behind a permanent test and documentation standard for future engines.

## Final outcome

The registry now has:

- 84 of 84 engines covered by per-engine specs in `tests/engines/specs/`;
- 84 of 84 engines covered by fixed known-answer tests in
  `tests/engines/helpers/known-answers.js`;
- exact roundtrip coverage for all 84 engines on their declared domains;
- robustness coverage for empty input, invalid keys, normalization, Unicode
  policy, 100 KB roundtrips, and A/B/A state isolation;
- strict corpus replay accounting for all 100,026 records with 0 unexplained
  failures.

Final validation command:

```sh
npm run build:js
npm run test:engines
```

Final verified corpus replay totals:

| Measure | Result |
|---|---:|
| Corpus records | 100,026 |
| Passed records | 91,746 |
| Known-deviation records | 8,280 |
| Known-deviation mismatch events | 13,645 |
| Unexplained failures | 0 |

The final engine runner ended with `All cipher engine verification suites
passed.`

## What was added

New permanent test and documentation infrastructure was added:

- `tests/engines/run.js` as the master engine verification runner;
- `tests/engines/specs/*.spec.js` with one spec per engine;
- `tests/engines/helpers/engine-spec.js` for shared roundtrip and robustness
  contracts;
- `tests/engines/helpers/contracts.js` for engine-specific policy and
  canonicalization rules;
- `tests/engines/helpers/known-answers.js` for one fixed KAT per engine;
- `tests/engines/corpus-replay.js` for strict corpus validation;
- `docs/ENGINE_INVENTORY.md` for the complete 84-engine inventory;
- `docs/ENGINE_AUDIT.md` for the final findings and disposition report;
- `docs/CIPHER_ENGINE_STANDARD.md` for the future engine contract;
- `npm run test:engines` in `package.json`;
- CI wiring in `.github/workflows/ci.yml`;
- rebuilt browser bundle in `js/ciphers/all-engines.min.js`.

## Major engine fixes

The sweep found and fixed real engine defects in `js/ciphers/all-engines.js`.

### Correctness and reversibility fixes

- `dictionaryCode` and `nihilist` no longer return placeholder junk on empty
  decode.
- `scytale`, `stager`, `foursquare`, `twosquare`, `solitaire`, and `slidex`
  now use reversible framing so structural padding does not leak into decoded
  plaintext.
- `bookCipher` now preserves unsupported literal text reversibly.
- `cardanoGrille` was rewritten to support reversible multi-block encoding
  instead of truncating after one grille.
- `jefferson` had malformed disk wiring corrected.

### Robustness fixes

- shared text cleaning was made null-safe and normalization-aware;
- numeric dimensions and positions were bounded before allocation;
- punctuation-only or otherwise empty normalized keys now fall back safely or
  reject clearly instead of producing `undefined` output;
- invalid-key handling was hardened in engines including `vigenere`,
  `beaufort`, `runningKey`, `confederateVigenere`, `porta`, `railFence`,
  `nullCipher`, and `geezMonastic`.

### Historical and primitive-level fixes

- `otp` was changed from an LCG-style generator to `crypto.getRandomValues`
  semantics for generated pad material.
- `vernam` was rewritten as true bytewise XOR with hex ciphertext instead of
  modular A-Z addition.
- `lorenz` was rewritten from a simplified alphabetic model into a 12-wheel
  ITA2 XOR model with chi, psi, and motor-wheel stepping.
- `purple` was rewritten to preserve the sixes/twenties split described by the
  exhibit.
- `vic` was rewritten so it is no longer only a checkerboard demo; it now
  includes checkerboard, chain addition, and reversible transposition stages.

## Legacy and compatibility updates

Existing broader test suites were updated where their expectations were tied to
old incorrect behavior.

- `tests/test-deep-ciphers.js` was updated for exact Hill roundtrip,
  reversible Solitaire padding, and Lorenz encode/decode semantics.
- `tests/test-all-engines.js` and `tests/test-comprehensive.js` were updated
  for the corrected Lorenz behavior.

These were not scope expansions; they were expectation repairs after the engine
implementations became more correct.

## Corpus replay result

The prior corpus QA approach was too permissive. The replacement harness in
`tests/engines/corpus-replay.js` now:

- replays the canonical `public/corpus/all.jsonl` dataset;
- compares both encode and decode behavior;
- does not silently skip historical or noisy cases;
- requires explicit deviation rules with rationale for mismatches;
- reports record counts separately from mismatch-event counts.

All 100,026 corpus records are now accounted for. Remaining mismatches are
documented as explicit known deviations rather than ignored failures.

## Deliverables now present

The requested deliverables are in place:

- `docs/ENGINE_INVENTORY.md`
- `docs/ENGINE_AUDIT.md`
- `docs/CIPHER_ENGINE_STANDARD.md`
- `tests/engines/run.js`
- per-engine specs under `tests/engines/specs/`
- source fixes in `js/ciphers/all-engines.js`
- rebuilt `js/ciphers/all-engines.min.js`

## Remaining caveats

Open high-severity engine issues were cleared during the sweep.

The remaining documented caveats are:

- `diana` passes roundtrip, robustness, KAT, and corpus checks, but its
  historical provenance is still one source short of full closure;
- corpus metadata headers in `corpus/engine-manifest.json` do not fully match
  the canonical dataset totals in `public/corpus/all.jsonl` and
  `public/corpus/README.md`.

These are follow-up documentation and provenance issues, not open correctness
failures in the tested engine suite.

## Files most affected

The main work landed in these areas:

- `js/ciphers/all-engines.js`
- `js/ciphers/all-engines.min.js`
- `tests/engines/`
- `tests/test-all-engines.js`
- `tests/test-comprehensive.js`
- `tests/test-deep-ciphers.js`
- `package.json`
- `.github/workflows/ci.yml`
- `docs/ENGINE_INVENTORY.md`
- `docs/ENGINE_AUDIT.md`
- `docs/CIPHER_ENGINE_STANDARD.md`

## Bottom line

This sweep should be treated as complete implementation and validation work, not
as a starting point for a new audit. The appropriate next step is final review,
commit packaging, and any optional documentation polish around the remaining
historical caveat for `diana`.