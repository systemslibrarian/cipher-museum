# Self-Policing Tests (v0.3)

This suite ensures the integrity of the schema, records, and benchmark runner.

- `tests/test-schema-valid.js`: Validates that the schema is valid JSON Schema
- `tests/test-records-valid.js`: Validates all records against the schema
- `tests/test-runner-receipt.js`: Ensures the benchmark runner produces a valid reproducibility receipt

All tests must pass in CI before merging changes.
