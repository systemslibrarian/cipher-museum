# Research-paper implementation checklist

Updated: 2026-10-25. Scope: Cipher Museum, based on a substantive review of 27 research papers. Crypto Lab's `docs/encyclopedia-roadmap.md` remains owned by its active implementation worker.

## Implementation

- [x] Reconcile Mary Stuart facts and researcher attribution; distinguish Z340 announcement from FBI receipt; remove unearned “Solved” runtime wording.
- [x] Add an evidence workspace that imports existing transcription exports, preserves source revisions, supports typed spans, alternative readings, image regions, derived readings and source/key relationships.
- [x] Add bounded known-key numerical segmentation with alternative paths, declared scoring and locks.
- [x] Add reproducible many-to-one homophonic search, locked mappings, retained candidates, search trace and explicit limits.
- [x] Add source-backed Copiale/Mary Stuart investigations and an actual first-section Z340 route replay with exceptions disclosed.
- [x] Add a separate versioned research evaluation set and executable checks for key application/recovery, unseen keys, relabelling, noise and wrong hypotheses; preserve corpus archives.
- [x] Add UA-8295, SoDark and NFC case studies and scoped DES/cellular/fault research updates.
- [x] Connect new content to navigation, exhibit metadata, search and offline assets; run existing gates plus focused behavior and browser checks.

Entry points: [Evidence Workbench](../lab/evidence-workbench.html), [historical investigations](../lab/decipherment-cases.html), [modern attack evidence](../lab/modern-attack-evidence.html), [UA-8295](../ciphers/ua-8295.html), [SoDark](../ciphers/sodark.html), [NFC](../ciphers/nfc-deployment.html). The museum now has 172 numbered exhibits. The three new case studies have no pretend attack simulator; NFC is contextual and carries no blanket cipher-security badge.

Delivery uses the repository's existing main-branch CI and GitHub Pages workflow. Git history and the workflow run record the delivered revision; archived release/DOI metadata is unchanged.

## Evidence and scope

Core sources: [transcription conventions](https://ep.liu.se/en/conference-article.aspx?Article_No=14&issue=171&series=ecp), [Copiale](https://aclanthology.org/W11-1202/), [Mary Stuart](https://doi.org/10.1080/01611194.2022.2160677), [Z340](https://arxiv.org/abs/2403.17350), [numerical segmentation](https://aclanthology.org/2022.emnlp-main.44/), [homophonic beam search](https://aclanthology.org/D14-1184/), [recurrence encoding](https://aclanthology.org/2023.findings-eacl.160/), [shared-key LSTM limits](https://arxiv.org/abs/2606.05078v1), [CipherBank](https://aclanthology.org/2025.findings-acl.309/), [UA-8295](https://eprint.iacr.org/2026/1309), [SoDark](https://doi.org/10.46586/tosc.v2021.i3.36-53), [NFC revision 1.1](https://eprint.iacr.org/2026/100).

Museum work emphasizes source interpretation and visible evidence. Do not duplicate Crypto Lab's A5/1 (A-D-12), distance-bounding (S06), or AES fault engines (A-D-06/E-K-06). Conditional-linear DES analysis is distinct from differential–linear composition (A-D-14).

Deliberately deferred research: neural-model training, automatic manuscript OCR, universal modern-cipher fingerprinting, a graph-database migration and unrestricted unknown-key numerical segmentation. These were not recommended as the first implementation. Public exercises are not blind benchmarks; plausible plaintext is not proof of historical correctness.

## Validation record

- `npm test`: all suites passed, including existing cipher-engine specifications, corpus checks, accessibility/mobile structure, navigation, generated metadata and the new research workflow/evaluation checks.
- `npm run validate:release`, `npm run lint:html`, generated metadata checks, local-link checks, service-worker asset hash checks and `git diff --check`: passed. No archived corpus or release-identifier file was changed.
- Real Chromium browser checks: actual background worker/model load, candidate receipt, cancellation, stale-input invalidation, valid/invalid JSON imports, source revisions, local image regions, derived layers, Detective handoff, historical fixture handoff, correct and wrong Z340 routes, and reduced-motion behavior passed. Zero page JavaScript errors.
- All six new pages were checked at 1280 px and 375 px without horizontal overflow. Desktop and mobile screenshots were inspected.
- Offline checks after service-worker installation: the Z340 first-section replay and a real homophonic worker search both completed using cached assets.
- The authentic replay uses all 63 symbol types and all 153 source positions exactly once. Its diplomatic output matches the published reading, including FAN, BRINGO, BECAASE and PARADLCE. Ordinary row order fails the same independent comparison.

## Measured search limits

The initial compact Detective language model was inadequate for unconstrained homophonic recovery. The separate experimental search now uses `museum-prose-quadgram-v1`, a four-letter model derived from museum exhibit prose with an explicit letter-frequency penalty. Its builder never reads evaluation fixtures or keys. Source-text hashes, model/scorer/solver hashes, seeds and budgets are recorded.

At the published 15,000-step budget, unassisted plaintext edit-error rates on the two independently encrypted original English passages were **33.2% and 46.0%**; the modern-French language-shift case had **73.3%** error. These are retained failures, not successful decipherments. Applying the complete known keys was exact. Narrow assisted runs with only one symbol unlocked were exact for the two English passages and had 2.5% plaintext error for French. They do not establish general key recovery. Arbitrary symbol relabelling preserved the search outcomes; applying an earlier key to an independent encryption failed as expected.

The tools support inspecting hypotheses, transcription and mechanical consistency. General reliable historical homophonic recovery remains future work, especially with unknown languages, short texts, nulls, nomenclature or control signs. See [the evaluation protocol and complete results](../data/research/v1/README.md).

## Ebook extensions reviewed 26 October 2026

Book credit uses full titles and pagination, without links to ebook copies.

| Exercise / claim | Full source | Scope and pagination |
| --- | --- | --- |
| Colossus known-pattern chi-setting and selected-score interpretation (`js/chi-setting.js`, `ciphers/colossus.html`) | I. J. Good, Donald Michie and Geoffrey Timms, *General Report on Tunny* (1945) | §§23A–C, printed pp. 78–80 / collected PDF pp. 81–83. The two-impulse dot condition and single-setting versus searched-score distinction are historical; the traffic, wheel pins and Monte Carlo null are declared synthetic teaching choices. §§53A–D, printed pp. 333–335 / PDF pp. 327–329, describe Colossus machinery, which this exercise does not fully emulate. |
| Bounded columnar initialization and segment neighborhoods (`js/columnar-search.js`) | George Lasry, *A Methodology for the Cryptanalysis of Classical Ciphers with Search Metaheuristics* (2018) | §§5.3.2–5.3.4, printed pp. 69–78 / PDF pp. 90–99. Uses bigram adjacency, relative-offset alignment and segment slides/swaps. Sampled neighborhoods, normalized combined alignment scoring and the museum's bigram/trigram finish are explicit adaptations; no claim to reproduce the thesis's large-key results. |
| Solver evaluation (`scripts/evaluate-solvers.js`) | George Lasry, *A Methodology for the Cryptanalysis of Classical Ciphers with Search Metaheuristics* (2018) | §§4.5–4.7, printed pp. 57–60 / PDF pp. 78–81. Repeatable held-out evaluation and ablation principles; the small original-prose fixtures and budgets are this implementation's choices. See `SOLVER_EVALUATION.md` for measured outcomes and limits. |

The public exhibit pages carry these same full-title citations. No book copies are distributed with these changes.
