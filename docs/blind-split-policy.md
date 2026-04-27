# Cipher Corpus v0.2 Blind Split Policy

To ensure fair benchmarking and prevent overfitting, the Cipher Corpus is split into training and blind (test) sets. The blind set is never used for solver development or parameter tuning.

## Policy
- The blind set is selected randomly from the full corpus, stratified by cipher type and difficulty.
- Blind set records are marked with `"blind": true` in the JSONL files.
- The split ratio is 80% training, 20% blind by default.
- Contributors must not use blind set records for solver development.
- The split is enforced by the validation script and checked in CI.

## Enforcement
- The validation script checks for proper `blind` labeling.
- CI will fail if blind set records are modified in solver PRs.

---

For questions, contact the maintainers.