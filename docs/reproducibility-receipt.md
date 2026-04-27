# Reproducibility Receipt Format (v0.3)

Each benchmark run produces a reproducibility receipt, which records all inputs, code versions, and environment details needed to reproduce the results.

## Receipt Fields
- `run_id`: Unique identifier for the run
- `timestamp`: ISO 8601 timestamp
- `corpus_version`: Hash or version of the corpus file
- `schema_version`: Value of `$version` from schema
- `solvers`: List of solver names and versions
- `runner_version`: Hash or version of benchmark runner script
- `environment`: Node.js version, OS, and relevant package versions
- `parameters`: Command-line arguments and config used
- `results_file`: Path to output report(s)

## Example
```
{
  "run_id": "runner-2026-04-27T12:00:00Z",
  "timestamp": "2026-04-27T12:00:00Z",
  "corpus_version": "sha256:abcd1234...",
  "schema_version": "0.2.0",
  "solvers": [
    { "name": "hillclimb", "version": "0.1.0" },
    { "name": "anneal", "version": "0.1.0" }
  ],
  "runner_version": "sha256:efgh5678...",
  "environment": {
    "node": "20.0.0",
    "os": "Ubuntu 24.04"
  },
  "parameters": {
    "corpus": "public/corpus/all.v2.jsonl",
    "solvers": "solvers/",
    "out": "reports/"
  },
  "results_file": "reports/benchmark-report.json"
}
```

Receipts are saved as `reports/receipt-<run_id>.json` and referenced in the HTML/JSON reports.
