# Crossed key and search-seed follow-up

Snapshot: `ccc02443d89ec2c2d9c8d6ef538bbbaf40225aa4`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

Source: `data/research/profile-recovery-v2/README.md`. SHA-256: `b20b6d71b987c23754fb976a43282004fd899e853c151a0db3989b26d12e434d`.

# Historical recovery: crossed key/search experiment

Executed locally on 4 November 2026 and subsequently prepared for publication. No live language model was called. This separate version preserves the original v1 results and failures.

## Finding

Crossing the same five independent keys per passage with all five search seeds preserves the average benefit of language-matched scoring, but still recovers **zero exact plaintexts in 720 conditions**. The earlier Latin annealing exception changes sign on the full grid, showing that the original diagonal key/seed sample did not establish a stable language-level disadvantage.

| Solver | English baseline edit error | Matched profile error | Both mismatched profiles | Matched-minus-English |
|---|---:|---:|---:|---:|
| Annealing | 76.66% | 69.75% | 77.81% | -6.91 percentage points |
| Beam | 81.27% | 73.79% | 80.48% | -7.48 points |

Annealing has 150 baseline, 150 matched and 300 mismatched conditions. Beam has 30 baseline, 30 matched and 60 mismatched conditions. Mean edit error weights each condition equally. No best-seed selection is used.

Matched annealing still has 76.40% positional error and 85.24% observed-key error. Matched beam has 82.14% positional error and 89.28% observed-key error. These solvers remain unreliable on this sample despite the relative improvement.

## Language-specific annealing comparison

| Source | English error | Matched error | Difference | Matched wins/ties/losses |
|---|---:|---:|---:|---:|
| Brantome / French | 75.33% | 66.17% | -9.16 points | 43 / 1 / 6 |
| Machiavelli / Italian | 78.31% | 71.62% | -6.69 points | 33 / 1 / 16 |
| Cicero / Latin | 76.34% | 71.47% | -4.87 points | 33 / 3 / 14 |

Each row is two passages × five keys × five search seeds, not 50 independent documents. In v1 Latin annealing was 5.30 points worse under matching; on the crossed grid it is 4.87 points better. Neither result licenses a universal claim. The v1 diagonal conditions are retained, not replaced or hidden.

Across all annealing pairs: 109 wins, 5 ties and 36 losses against English. Against the average of both mismatched controls: 113 wins, 3 ties and 34 losses; mean improvement 8.06 points. All five search-seed slices favor matching overall, but by differing amounts: 6.87, 8.65, 6.53, 9.50 and 2.99 points in protocol seed order.

## Design and verification

- The protocol was written before this experiment ran, after v1 results were already known. This is a locally frozen exploratory follow-up, not an external preregistration.
- Six reviewed public historical passages from three works, unchanged from v1. Existing author-disjointness checks and front-matter exclusions were applied. The same thirty independently keyed ciphertexts were reused to isolate the seed-crossing change.
- Four unchanged scorers. Annealing: 6,000 steps, seeds 41, 1729, 2027, 65537, 104729. Beam: width 150, branch 26, run once per ciphertext/scorer because it is deterministic.
- Exactly 600 annealing and 120 beam conditions completed; zero execution failures. Every prediction, key, score, metric and elapsed time is retained in `runs.jsonl.gz`.
- Post-run checks validated all 720 metric records against predictions and keys, scorer identities, options, budget completion, input hashes and matrix identities. Thirty known-key fixture checks passed during fixture construction.
- All **240 overlapping v1 conditions** matched v1 plaintext, key, score, fitness evaluation count, errors and exact-success status exactly. This is a strong continuity check, not a second independent experiment. The other 480 conditions were executed once; a complete new-grid replay was not performed.
- Runtime: Node v24.22.1, V8 13.6.233.17-node.58, Linux x64, en-US. Sum of condition timings: 157.419 seconds. Cross-runtime reproducibility is not asserted.
- `summary.json` includes overall, work, passage, key-index and seed summaries, plus per-key seed variance and within-passage variance of key means. These are descriptive population variances of the fixed grid, not inferential estimates across historical sources.
- All inputs were copied outside the repository before execution. The source checkout already had unrelated working-tree changes, so input hashes are authoritative; the recorded Git HEAD alone is not a complete identity of copied bytes. The repository and v1 were not edited by this task.

## What remains unknown

The sample is public, previously evaluated and too small for general historical-decipherment claims. It contains no authentic unknown cipher, transcription ambiguity, nulls, word codes or unknown numerical segmentation. The Italian edition includes spelling modernization. No matched modern French/Italian/Latin baseline exists; language matching, historical orthography, corpus size, pruning and scorer calibration are confounded. Search initialization and temperature remain the shipped choices.

The next substantively independent research step would require new vetted author/work-disjoint material, and a separate matched-language modern-versus-historical scoring comparison with controlled model construction. Merely adding more seeds cannot supply new-source evidence. Any new source or model tuning must receive a separate protocol/version and preserve these failures.

## Reproduction and artifact checks

Run `node scripts/check-profile-recovery-v2.js` from the repository root. This read-only check verifies copied-input hashes, protocol and runner identities, fixture construction, the complete crossed matrix, model identities, every recorded metric, all summaries and exact agreement of 240 overlapping v1 conditions. It does not rerun search.

`run.js` and `inputs/` preserve the execution code and model bytes. To rerun all 720 searches, copy this directory outside the repository into a fresh experiment directory without its generated `runs.jsonl.gz`, `execution.json`, `finished.json`, `fixtures.json`, `summary.json` and progress log, then run `node run.js` there. Keep these published outputs unchanged. Compare plaintexts, keys, scores, evaluation counts and errors exactly; exclude elapsed times. A matching Node/V8 label alone does not guarantee cross-machine bit reproducibility.

Files include the frozen `protocol.json`, copied `inputs/`, full `fixtures.json`, every prediction in `runs.jsonl.gz`, per-group results in `summary.json`, and execution/finish records. The original runner refuses to overwrite an existing run log. `SHA256SUMS` records publication-artifact identities.

No live-LLM result is implied. The separate matched-input LLM recipe remains unexecuted and requires declared model access and settings.

## Lossless result packaging

The published `runs.jsonl.gz` decompresses to the exact original 1,007,652-byte JSONL run log, SHA-256 `8b20471700dddcc58eeed3835d8de89d1071828617089188ce199253cad00fcc`. Compression changes no rows or metrics. The checker decompresses before verifying the original finished-run hash. The frozen runner remains unchanged and writes plain `runs.jsonl` when executed in a fresh replay directory.
