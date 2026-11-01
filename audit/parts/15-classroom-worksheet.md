# Columnar classroom worksheet

Snapshot: `8421b8383ca4d05c3138821ec30e4b86fe2eb013`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

Source: `public/teaching/columnar-classroom.md`. SHA-256: `195e139c2732cb0d3d6c2ab5dd6fe5addf6100e130bd875a52b0d2d945d68091`. Its Node.js runner and fixed JSON fixtures are in the preceding appendices.

# A 24-run columnar classroom experiment

This exercise reuses the Museum's existing bounded columnar solver. It compares direct full-text scoring with staged initialization on four original synthetic messages, three fixed seeds (7, 19, 41) and two variants. Only the staged-initialization option changes. Both variants use segment moves, two restarts and a total budget of 1,000 score evaluations per run. The width is supplied; this is not an unknown-width experiment.

## Run and keep the evidence

Use Node.js in a checkout of the Cipher Museum repository. No extra packages are needed for this script.

```sh
node scripts/columnar-classroom.js > columnar-classroom-results.json
node scripts/columnar-classroom.js --check
```

The first command writes a JSON receipt. The second runs the same experiment twice and compares everything except elapsed milliseconds. The receipt includes all fixture texts and supplied keys, each configuration and seed, source-file SHA-256 hashes, runtime version, candidates, exact-answer comparisons, work counts, timing and failures. There are 24 runs, not 24 independent messages. Repeated seeds on the same message are dependent; this small convenience set does not estimate a general recovery probability.

Source files: [runner](../../scripts/columnar-classroom.js), [fixed fixtures](columnar-classroom-fixtures.json), [existing solver](../../js/columnar-search.js), [existing language model](../../js/detective/lang-model.js).

## First check a fixture by hand

The short complete fixture is `ATTACKATDAWN`, written in rows `ATTA / CKAT / DAWN`. Its columns are `ACD`, `TKA`, `TAW`, `ATN`. Reading columns 3, 1, 4, 2 gives `TAWACDATNTKA`. The JSON stores the same readout order with zero-based indices `[2,0,3,1]`.

The runner checks each fixed ciphertext against a separate row-and-column reference before searching. The other fixtures contain 39, 80 and 90 letters with widths 5, 8 and 12. Their remainders are 4, 0 and 6 respectively. The complete and incomplete rectangles deliberately pose different tasks.

## Fill in the comparison

For each variant, count all 12 runs, including cases without a candidate. Use the receipt's `summary` and inspect the individual `runs` to explain the counts.

| Measure | Direct | Staged |
|---|---|---|
| Exact plaintexts / all 12 runs | | |
| Exact keys / all 12 runs | | |
| No-candidate runs / all 12 runs | | |
| Unsuccessful plaintexts / all 12 runs | | |
| Median elapsed milliseconds on your machine | | |

“Exact plaintext” compares the full candidate with the supplied answer. “Exact key” compares the readout permutation with the supplied key. These are different checks: repeated column contents can sometimes let different permutations reproduce the same text. A high model score alone passes neither check.

`evaluations` includes adjacency preprocessing, stage-transition scoring and all restarts. `preprocessingEvaluations` is a subset of that total, not extra work to add again. The 12-column incomplete fixture can consume the staged preprocessing allocation before returning any candidate: this implementation reserves work for subsequent phases/restarts, so it can stop before reaching 1,000 evaluations. Keep that outcome in the denominator. Equal score-evaluation budgets do not imply equal CPU cost, and wall-clock timings vary with hardware, load and runtime warm-up.

Discuss these questions:

1. Does either variant recover every supplied answer? Which messages or seeds explain its failures?
2. Does the highest candidate score always imply an exact answer? Check the plaintext comparison instead of judging readability.
3. What does the incomplete 12-column case reveal about spending the budget before full-text search?
4. Why does sharing a seed not make two changed algorithms follow matching random trajectories?
5. What broader, separately held-out message set would be needed before claiming one configuration is generally better?

An optional extension is to copy the fixture JSON, declare a larger budget before running, and retain both receipts. If you edit the checked-in fixture data for that extension, its digest changes. Do not silently overwrite or pool runs from different configurations. The fixture answers are for evaluation, not inputs passed to the search.

## Reading and limits

George Lasry, *A Methodology for the Cryptanalysis of Classical Ciphers with Search Metaheuristics* (kassel university press, 2018 published thesis), §4.7, printed pp. 59–60 / PDF pp. 80–81, discusses restarts and initialization costs. §5.3, printed pp. 67–75 / PDF pp. 88–96, compares success and work for baseline and modified columnar methods; printed pp. 79–80 / PDF pp. 100–101 cover incomplete-rectangle experiments.

This worksheet borrows the experimental questions, not the thesis's recovery rates or implementation. The Museum samples moves, uses a compact bigram/trigram model and caps width at 12. Its outputs do not reproduce the thesis's exhaustive neighborhoods, alternating thresholds, optimized triplet scores or large-key performance. All messages here are synthetic and have no claimed historical provenance.
