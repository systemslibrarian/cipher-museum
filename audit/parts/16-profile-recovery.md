# Historical-profile recovery experiment

Snapshot: `ccc02443d89ec2c2d9c8d6ef538bbbaf40225aa4`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

Source: `data/research/profile-recovery-v1/README.md`. SHA-256: `8823d67afbad9e6fe9a87a3db2a617f361a1ea8afc938995f7d409a506c19e57`. The protocol, full result matrix, model inputs and Node.js runner are in the preceding appendices.

# Historical-profile recovery experiment v1

Experiment date: **4 November 2026**. This is a separate experiment alongside the
published research evaluations [v1](../v1/README.md) and [v2](../v2/README.md);
their fixtures, identities and recorded results are retained.

**Question:** does a language-matched historical scoring profile improve recovery
of an independently keyed ciphertext compared with the modern-English baseline
and deliberately mismatched historical profiles?

**Observed answer:** it reduced mean plaintext edit error on this small fixed
sample for both solvers, but **none of the 240 conditions recovered an exact
plaintext**. The matched Latin profile made annealing worse on average. These are
measurements of the shipped solvers and scoring models on public synthetic
ciphertexts, not a claim of general historical decipherment accuracy.

The complete [protocol](protocol.json) and [machine-readable report](evaluation.json)
record every input, source, independent key, seed, scorer, prediction, error and
paired comparison. No failed run is omitted.

## Material and source review

The input is **six passages from three works**, taken from
[v2's author-disjoint holdout](../v2/holdout-author-disjoint.json): passages 2 and 3
of each source. Each contributes its full normalized text, 291–329 letters.

| Language-matched profile | Training source | Recovery source | Main shift |
| --- | --- | --- | --- |
| French, `historical-french-1580` | Montaigne, *Essais*, Volume I | Brantôme, *Vies des dames galantes* | Different author and genre, broadly the same period |
| Italian, `historical-italian-1320` | Dante, *Divina Commedia* | Machiavelli, *La mandragola, La Clizia and Belfagor* | Different author, dramatic prose instead of verse, roughly two centuries later |
| Latin, `historical-latin-classical` | Caesar, *De Bello Gallico*, Books V–VIII | Cicero, *Orations* | Different author and genre, broadly the same period |

The texts are in public-domain editions from Project Gutenberg:
[Brantôme, eBook 39220]([ebook-url-omitted-596cb78911d8; bibliographic credit retained]),
[Machiavelli, eBook 56498]([ebook-url-omitted-e6e5d406f8a9; bibliographic credit retained]),
and [Cicero, eBook 226]([ebook-url-omitted-f45573521f48; bibliographic credit retained]).
The existing profile data records the training editions, extraction rules and
source checksums.

### Exclusions fixed before search

Review of the existing fixture strings found a source-quality problem. Every first
excerpt was excluded before any recovery result was inspected:

| Excluded excerpt | Reason |
| --- | --- |
| `brantome-dames-galantes-disjoint-1` | Edition and publisher front matter is mixed with the dedication. |
| `machiavelli-commedie-disjoint-1` | An editor discusses a 1912 edition and altered spellings; the passage is not Machiavelli's dramatic prose. |
| `cicero-orationes-disjoint-1` | Third-person introductory prose about Cicero and Catiline; the fixture does not establish its authorship or period as part of the selected orations. |

These exclusions apply symmetrically to all scorers. No passage was dropped for
being difficult to recover. The old v2 fixture strings and their 9/9 language-ranking
result remain published, with a source caveat in its README.

Removing the Italian preface does **not** undo the edition's spelling changes.
Accordingly, “matched” means **language-matched**; it does not mean that the
period, genre, edition or orthography precisely match the model. The new report
uses reviewed edition descriptions and preserves the inherited metadata separately
as `editionAsRecordedInV2`. It does not adopt v2's blanket statement that the Cicero
edition contains no editorial material.

Source IDs, works, URLs and explicit author metadata are checked against the profile
training sources. All variants remain in the test split and are grouped by the
three source works. This checks the declared provenance; it cannot rule out every
unrecorded textual borrowing or editorial contribution.

## Fixed comparison

The local protocol was fixed before the outcomes were inspected. It was not
externally preregistered, and all material is public.

1. Normalize each selected passage with the profile builder's uppercase A–Z accent
   and ligature folds. Remove spaces, punctuation and digits; preserve I/J and U/V.
   This is lossy normalization, not diplomatic transcription.
2. Create **five independently keyed ciphertexts per passage**, with two homophones
   per present letter. All 30 key seeds are unique and lie in the existing test
   seed range. No fixed code pool is shared across messages.
3. Run the modern-English museum-prose baseline and **all three historical
   profiles** on each ciphertext. For its language, one historical model is matched;
   the other two are separately reported mismatched controls.
4. Within a ciphertext and solver, hold the tokens, options and search seed
   constant across all four scorers. Annealing uses **6,000 steps** and search seeds
   **41, 1729, 2027, 65537 and 104729**. Beam search uses **width 150, branch 26** and
   is deterministic. These are fixed shipped budgets, without tuning against the
   new outcomes.
5. Evaluate only the **top returned candidate**. Solvers receive symbol tokens,
   an empty locked key, the budget and the scoring function. Plaintext and key
   truth are used for fixture construction and for calculating errors after search.

The matrix is **6 passages × 5 key/search-seed pairs × 4 scorers × 2 solvers =
240 conditions**. Thirty successful known-key applications check fixture construction;
they are not counted as recovery successes.

The matched condition is assigned from the source's known language label. This
experiment does not test an automatic choice of language from the ciphertext, and
it never chooses a scorer after looking at which prediction is closest to the truth.

Each replicate changes the key as well as the annealing seed. It therefore samples
paired key/search variation, not search-seed variance in isolation. The five
replicates do not create five new independent source documents. Budgets are
matched **within each solver**; 6,000 annealing steps and a width-150 beam are not
claims of equal computation across algorithms.

## Results

Primary error is Levenshtein edit distance divided by expected plaintext length.
The report also gives positional character error, because these homophone
ciphertexts preserve positions, and key error over the symbols actually observed.
All displayed means weight each case equally; lower is better.

| Solver | Scoring condition | Runs | Plaintext edit error | Positional error | Observed-key error | Exact plaintexts |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Annealing | Modern-English baseline | 30 | 75.83% | 84.52% | 89.32% | 0/30 |
| Annealing | Language-matched historical | 30 | 70.28% | 75.50% | 85.01% | 0/30 |
| Annealing | Both mismatched historical controls | 60 | 76.83% | 84.21% | 89.18% | 0/60 |
| Beam search | Modern-English baseline | 30 | 81.27% | 92.06% | 94.20% | 0/30 |
| Beam search | Language-matched historical | 30 | 73.79% | 82.14% | 89.28% | 0/30 |
| Beam search | Both mismatched historical controls | 60 | 80.48% | 90.05% | 93.06% | 0/60 |

Across the 30 paired cases, matching reduces mean edit error by **5.55 percentage
points for annealing** and **7.48 points for beam search** relative to English.
Against the mean of the two mismatched controls, the reductions are **6.55** and
**6.69 points**, respectively.

These average improvements coexist with very high remaining error. With matched
scoring, annealing still gets about 76% of character positions and 85% of observed
symbol assignments wrong on average; beam search gets about 82% and 89% wrong.
No complete plaintext is recovered in either solver or any control condition.

### Results by source language

Each language has two passages and five key/search pairs per passage. Each baseline
or matched mean therefore has 10 runs; each mismatched mean has 20 runs.

| Solver | Language | English baseline error | Matched error | Mean mismatched error | Matched minus English |
| --- | --- | ---: | ---: | ---: | ---: |
| Annealing | French | 77.39% | 62.33% | 77.11% | −15.06 points |
| Annealing | Italian | 77.55% | 70.64% | 77.47% | −6.90 points |
| Annealing | Latin | 72.56% | 77.86% | 75.92% | **+5.30 points** |
| Beam search | French | 79.49% | 71.47% | 80.43% | −8.02 points |
| Beam search | Italian | 81.47% | 76.62% | 81.78% | −4.85 points |
| Beam search | Latin | 82.84% | 73.27% | 79.22% | −9.57 points |

**Latin under annealing is a counterexample to a universal benefit.** Its matched
profile is worse on average than both English and the mean mismatched control.
The experiment does not identify which combination of scoring, initialization,
search trajectory, passage or edition causes this exception.

### Paired comparisons

For each case, the mismatched reference is the arithmetic mean of its **two**
mismatched runs. This gives 30 paired differences, not 60 independent pairs.
Negative differences favor matching.

| Solver | Reference | Mean matched-minus-reference | Matched wins / ties / losses |
| --- | --- | ---: | ---: |
| Annealing | English baseline | −5.55 points | 21 / 2 / 7 |
| Annealing | Mean mismatched historical | −6.55 points | 16 / 2 / 12 |
| Beam search | English baseline | −7.48 points | 26 / 3 / 1 |
| Beam search | Mean mismatched historical | −6.69 points | 26 / 0 / 4 |

The JSON also reports every mismatched profile separately on the corresponding
cases, the range of paired differences, each passage, and each replicate. No
best-performing seed or favorable language is substituted for the complete matrix.
No confidence interval or statistical significance claim is made for six passages
from only three works.

## What this establishes, and what remains open

This experiment closes the implementation gap between identifying the language of
known plaintext and actually using each historical model to search an unknown key.
The historical scoring functions now run as recovery conditions on identical
ciphertexts beside the English and mismatched controls.

It supports a bounded observation: **these shipped language-matched models reduce
average recovery error on this sample under these budgets, with a Latin annealing
exception and zero exact recoveries**. It does not demonstrate reliable historical
decipherment.

The comparison changes the whole shipped scoring model: corpus, pruning, unseen-gram
floor and frequency distribution. Scores are not compared as cross-model likelihoods.
The annealer's English-weighted initialization and temperature schedule, and beam
search's extension order, remain fixed. No score rescaling or model-specific tuning
was introduced.

There is no matched **modern French, Italian or Latin** baseline here. Consequently,
the results cannot separate the benefit of language matching from the benefit of
historical spelling, nor from model-size or corpus effects. The Italian edition's
modernization further limits any orthographic claim.

All inputs are clean letter-homophone ciphertexts generated from known text. The
experiment contains no authentic unknown cipher, numerical segmentation, word codes,
nulls, ambiguous transcription, unseen language or blinded collection. More source
works, a factorial key/seed design, matched modern-language baselines and distinct
solver budgets would be separate, versioned experiments.

## Reproduction and regression checks

From the repository root:

```sh
node scripts/evaluate-profile-recovery.js --check
node tests/test-profile-recovery.js
node scripts/evaluate-profile-recovery.js --replay
```

The first command audits input hashes, source separation, ciphertext construction,
all 240 conditions, actual recorded model identities, paired options, predicted-key
application, every metric and aggregate arithmetic. **It does not rerun search.**

The test exercises actual scorer-to-solver wiring on a tiny development fixture and
deliberately supplies invalid data: a baseline mislabeled as historical, a leaked
training author, front matter, unequal seeds, supplied key locks, swapped ciphertexts,
missing controls and fabricated success/error counts. Each must fail.

The wiring guard was also verified by temporarily changing the evaluator so that
historical annealing conditions secretly ran the English baseline. The test failed
on the solver's wrong model identity before reaching any source-hash check. The
original evaluator was restored byte for byte and the test passed again.

The replay command runs all 240 searches and demands exact equality of predictions,
keys, scores, evaluation counts, outcomes and summaries, excluding elapsed time.
It first requires the recorded Node/V8/platform/architecture/locale. It applies no
broad per-item search-error tolerance. The committed run uses **Node v24.22.1,
V8 13.6.233.17-node.58, Linux x64, en-US**. Matching these labels is not a promise
of bit-portable JavaScript behavior on every machine; a diverging search is reported
as a failed replay.

The published matrix was executed twice in the recorded runtime. The second run
qualified edition metadata without changing the frozen protocol, ciphertexts,
models, seeds or budgets. All 240 predictions, keys, scores, evaluation counts,
errors and paired summaries matched exactly. The final report contains the reviewed
edition descriptions, final evaluator source hash and second-run timings.

To generate the report from these same versioned inputs:

```sh
node scripts/evaluate-profile-recovery.js
```

Changes to the protocol, source set, scoring model or solver behavior should receive
a separate experiment version. Keep these results and failures available.

## Integration with the published Museum additions

PR #51 adds manual passage-alignment functions to the shared `research-model.js`.
It does not change the recovery solvers. The original report from commit
`6745c789cc40a4885b8ca17fc3e7b952db30784b` is retained as
[`evaluation-pre-integration.json`](evaluation-pre-integration.json), including its
original shared-file hash and timings. The current report records a complete new
execution against the combined file. All 240 predictions, keys, scores, evaluation
counts, errors and paired summaries agree exactly with the original; only elapsed
times and the shared-file hash differ. Protocol, passages, scoring profiles, seeds
and budgets are unchanged. The [comparison receipt](integration-replay.json) records
both report checksums and the precise comparison exclusions. This integration replay is not an additional independent
experiment or evidence of improved recovery.
