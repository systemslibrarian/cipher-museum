# Cipher Corpus Benchmark Runner (v0.2)

The Benchmark Runner executes all solvers on the corpus, enforces the blind split, and produces HTML and JSON reports.

## Usage

```
node scripts/benchmark-runner.js --corpus public/corpus/all.v2.jsonl --solvers solvers/ --out reports/
```

- Runs each solver on all non-blind records for training, then on blind records for evaluation.
- Outputs:
  - `reports/benchmark-report.html` (summary table, per-cipher breakdown)
  - `reports/benchmark-report.json` (raw results)

## Requirements
- Solvers must implement a standard interface (see `solvers/README.md`).
- All results must be reproducible and timestamped.

## See also
- [Blind Split Policy](blind-split-policy.md)
- [LLM Eval Export Schema](../public/corpus/llm-eval-export.schema.v0.2.md)
