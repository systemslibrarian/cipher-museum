# Book description and historical-profile recovery — 4 November 2026

## Changes

The book page, homepage, README and search metadata now explain the book's sustained
interest in evidence, corroboration, uncertainty and decisions. The comparison FAQ
acknowledges that Kahn and Singh also address historical consequences and that Singh
provided a Cipher Challenge and interactive CD-ROM. The approved reader promise,
title, cover, author, chapter invitations, prologue and publication status remain.
See [the positioning record](book-positioning-2026-11-02.md) for the primary pages
used to check that comparison. This is a public-copy revision, not a new source audit
or rewrite of the historical chapters.

Two bounded prose errors are corrected: the entropy example distinguishes four
equally likely keys using two bits, and the attack-evidence section labels its five
cards correctly. Their surrounding calculations and claims are preserved.

## A recovery experiment, separate from language recognition

The earlier v2 script compared language profiles on readable passages but ran
independent-key recovery with the modern-English baseline. The new
[`profile-recovery-v1`](../data/research/profile-recovery-v1/README.md) experiment
actually substitutes each scoring function in both real solvers.

Its fixed matrix is six passages × five key/search-seed pairs × four scoring models
× two solvers = **240 conditions**. The six passages come from three works/authors;
they are not thirty independent documents. Each scorer sees the same ciphertext,
empty locks and settings within a solver. Both deliberately mismatched historical
models are retained, with paired differences computed after averaging their errors
within each case. Budgets are 6,000 annealing steps and beam width 150/branch 26.

| Solver | English baseline edit error | Language-matched edit error | Mean of mismatched profiles | Exact recoveries across all conditions |
| --- | ---: | ---: | ---: | ---: |
| Annealing | 75.83% | 70.28% | 76.83% | 0/120 |
| Beam search | 81.27% | 73.79% | 80.48% | 0/120 |

The language-matched models reduce mean edit error overall, but **none of the
conditions recovers a complete message**. Latin annealing is a counterexample:
77.86% error with the matched model versus 72.56% with the English baseline.
Levenshtein edit error, positional character error, key error and exact recovery
remain separate recorded measures. The matched condition uses the known source
language, so it does not test automatic language identification. These results do not establish general
decipherment accuracy or isolate the effect of historical spelling: no matched
modern French, Italian or Latin baseline is available.

## Source-selection correction and preserved history

Before observing recovery outcomes, the protocol excludes the first excerpt from
each existing author-disjoint source. Those excerpts contain front matter or
introductory editorial prose; the Italian one discusses a 1912 edition. The selected
second and third excerpts, their source identities and checksums are all recorded.
Edition modernization, author/genre/period shifts and lossy normalization remain
explicit limitations. New edition descriptions qualify inherited v2 descriptions;
the original values remain attributed to v2 for comparison.

The v1/v2 result JSON, models, historical fixtures and original evaluation script
are unchanged. A dated caveat in the v2 README distinguishes its earlier fixture
ranking from a claim that every excerpt is historical author prose. The live-AI
matched-input recipe on the attack-evidence page remains unexecuted; it is a
different experiment requiring declared live models.

## Reproduction and review

```sh
npm run check:profile-recovery
node tests/test-profile-recovery.js
npm run replay:profile-recovery
```

The check command audits recorded inputs, scorer identities, paired settings,
predicted keys/text, errors and aggregate arithmetic. It does not rerun search.
Replay executes every search in the recorded Node/V8/runtime environment and requires
exact agreement apart from elapsed time. Every run, including failures, is published;
the full matrix was repeated with unchanged ciphertexts, models, seeds and budgets.

The tests deliberately reject a baseline scorer mislabeled as historical, training
author leakage, editorial-front-matter selection, changed text, missing/duplicate
conditions, changed locks/seeds/ciphertext, wrong model labels, invented recovery and
incorrect paired arithmetic. The new suite is explicitly registered in `npm test`.

Independent code review checked scorer substitution, paired conditions, limits and
the distinction between report checking and search replay. Page review checked the
public summary against the recorded result matrix. The regenerated audit pack
includes the runner, protocol, complete results, historical profiles, source excerpts
and interpretation, with their exact hashes.

Fresh browser visual review was unavailable because the Chromium download failed.
Existing browser records in the coverage ledger describe earlier revisions, not this
pass. Local test and GitHub CI/deployment outcomes are recorded with the implementation
pull request.
