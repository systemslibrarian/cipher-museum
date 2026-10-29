# Research workflow evaluation v1

This small, public set accompanies the Evidence Workbench. It is separate from the museum's released corpus and has no inherited DOI. It does not modify archived v0.6, v0.7 or v0.8 data.

- `z340-section-1.json`: authentic first-section ciphertext, published key, diplomatic reading and provenance. This is **known-key replay**, not key recovery. ASCII IDs stand for handwritten glyphs. The independent ciphertext and decoded-grid transcription were read from a solver's public repository and checked against the paper. The route consumes each of 153 source cells once. Spelling corrections and later-section exceptions remain explicit.
- `exercises.json`: three original museum-authored prose passages, normalized explicitly and encrypted under separately generated two-homophone-per-letter keys. They are synthetic, not historical letters. Modern French tests language shift against the English scoring model; it does not represent early modern French.
- `evaluation.json`: reproducible results, including failures, input/model/solver hashes, search budgets, seeds, exact plaintext, edit error and key error. Generate with `node scripts/evaluate-research.js`; check with `node scripts/evaluate-research.js --check`.

The candidate search uses `museum-prose-quadgram-v1`: four-letter counts from museum exhibit prose, with a 1.5-weight unigram-distribution penalty. `language-model.json` records counts, normalization and per-source text hashes. `scripts/build-research-language-model.js` explicitly refreshes this model snapshot; it never reads evaluation fixtures or keys. The numerical segmentation panel separately offers the older compact English model. It has no trained cipher-key pool. All-symbols-locked runs only apply a known key. One-symbol-unlocked runs disclose every other assignment and are very narrow assisted checks. Unassisted recovery is measured separately and failures are retained. None of these public exercises is a blind benchmark; their outputs must not be advertised as general historical-decipherment accuracy.

The scoring model can prefer incorrect, repetitive plaintext. More compute does not repair a mismatched model. Arbitrary relabelling must preserve the search result; copying a key to independently encrypted text should fail. Neither observation establishes historical correctness. A random-input negative control has no planted plaintext, so its error rate is undefined and its candidate stays unverified.

Transcription checks report glyph error and unresolved coverage separately from plaintext error. Missing symbols block letter-only search. Segmentation retains all complete paths found within the stated node budget, with an explicit cutoff and a maximum of 32 retained paths. A boundary difference is measured separately from changed plaintext; a language score does not remove ambiguity.

## Executable checks

`node tests/test-research-workbench.js` tests migration, Unicode offsets, retained source revisions, source-linked image regions, typed key controls, explicit resolution of alternatives, derived-layer provenance, segmentation locks/cutoffs, independent many-to-one assignments, deterministic relabelling, worker imports/cancellation, stale-result invalidation, and the genuine Z340 replay/wrong-route counterexample. These checks run in `npm test`. The toy objective in the search-mechanics test verifies the algorithm's mapping behavior; it is not a cryptanalytic success measurement.

Browser validation additionally covers the real worker, local-file imports, image-region overlays, desktop/mobile overflow, source handoff, route controls, reduced-motion behavior, and offline replay. See `docs/PAPER_REVIEW_IMPLEMENTATION.md` for the executed validation record.

## Research boundaries

The design follows the reviewed transcription, numerical segmentation, Copiale, Mary Stuart and Z340 papers linked in the museum. Shared-key-pool learning is not independent cryptanalysis; synthetic historical-language corpora are not authentic archive pairs; three-shot plaintext/ciphertext pattern inference is not blind recovery. Metadata ablations need comparable procedures, and a language-model score is not a probability that a historical reading is correct.

Neural training, automatic manuscript OCR, calibrated historical-language accuracy, unknown-key numerical segmentation and a general Z340 solver remain outside this implementation. The English baseline is experimental and deliberately exposes its limits.

## Later versions and benchmark interpretation

This version is frozen. [Research-evaluation v2](../v2/README.md) adds a declared task
matrix, audited split rules, historical-language profiles and a second solver baseline; it
reruns these fixtures rather than replacing their published failures.

Before quoting any AI result against this material, read [what an AI cipher result actually
tested](../../../lab/modern-attack-evidence.html#ai-results). Metadata recognition,
cipher-family classification, fixed-codebook recognition and plaintext or key recovery are
four different measurements, and only the last is decipherment.
