# Seeded solver evaluation

Run `node scripts/evaluate-solvers.js --check` to reproduce `data/solver-evaluation/results.json` exactly. `node scripts/evaluate-solvers.js` regenerates it. Original synthetic evaluation prose was written after the existing model tables were frozen. The report hashes both models and the fixture file; evaluation text is never used to build a language model. No parameters were tuned against these fixtures.

Each run receives 6,000 score evaluations, including initial scores, preprocessing, phase changes, restarts and hybrid polishing. Run `node scripts/evaluate-solvers.js --check --timing` to also record wall-clock durations in `data/solver-evaluation/timings.json`. That separate file records runtime/hardware context and each complete solver call, including preprocessing and polishing. Timing varies with machine load and JIT warm-up and is excluded from byte-for-byte replay; it does not support a general speed ranking.

Counts are not equivalent CPU time: a column-pair score and a whole-text score do different work. Substitution compares matched random-swap kernels for hill climbing, simulated annealing and a 70% annealing / 30% hill-climbing hybrid, each with three restarts. It does not measure all implementations of these methods. The older standalone SA solver now accepts `--seed`, and `--compare` uses the bounded kernels with explicit method labels.

## Observed results

Three original texts, lengths 48, 96 and 192, and three seeds give 27 substitution runs per method. At this budget all three methods achieved **0/27 exact plaintext recoveries**. The report retains character accuracy and each failed run; it supplies no evidence for a universal SA advantage. A failure at 6,000 evaluations does not imply the cipher is secure.

Columnar evaluation uses three texts, widths 5, 8 and 12, complete and incomplete rectangles, and three seeds: 54 runs per variant.

| Variant | Exact plaintext recovery |
| --- | --- |
| Single-element swaps, language scoring | 17/54 |
| Segment slides/swaps, language scoring | 27/54 |
| Staged adjacency, without alignment | 21/54 |
| Staged adjacency and alignment | 22/54 |
| Staged adjacency and alignment, one restart | 13/54 |

These results do not establish that staged scoring always wins; it spends part of the same budget on preprocessing. The report keeps every length, width, incomplete-rectangle flag, seed, preprocessing count and failure.

Repeated seeds and derived lengths from the same text are correlated. The substitution and columnar summaries therefore report all-seed success per original text and a descriptive Wilson interval over only three texts per length/method or width/layout/variant. These convenience-sample intervals are wide (0 to about 0.562 for zero successes out of three) and are not population confidence statements about historical ciphertext. Columnar counts likewise are descriptive repeated-task outcomes, not 54 independent historical cases. More independent text sources and broader budgets are needed for general recommendations.

Source: George Lasry, *A Methodology for the Cryptanalysis of Classical Ciphers with Search Metaheuristics* (2018), §§4.5–4.7, printed pp. 57–60 / supplied PDF pp. 78–81; columnar adaptations in §§5.3.2–5.3.4, printed pp. 69–78 / PDF pp. 90–99.
