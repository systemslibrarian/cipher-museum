# Research review of 29 October 2026 — implementation record

Scope: the fourteen recommendations R01–R14 from *Cipher Museum: research-based suggestions
— 29 October 2026*. The review inspected commit `e3ca79b6`; that is the baseline this work
starts from, and nothing in it had moved since.

The review was treated as a worklist, not as evidence. **Every detailed technical claim
published here was checked against the primary paper**, and where a claim could not be
checked it was not published. Two papers (CM023 and CM026) had been reduced to abstract-only
summaries in an earlier pass because the publisher's server refused retrieval; both full
PDFs were supplied locally during this pass and read, which is why those two exhibits could
be expanded rather than hedged again.

**Status: all fourteen implemented. No blocked items.**

## R01–R14

| ID | What was done | Files | Sources |
| --- | --- | --- | --- |
| **R01** | Replaced the obsolete "full paper unavailable" paragraph with the tested conditions: random fault model, ChipWhisperer Lite with an XMEGA target, voltage glitches, the two assumed capabilities (same key–IV re-initialization, unlocated bit flip), and the 2,048 keystream bits the attack consumes. Phase table separates fault injection and location (343.330 s / 587.625 s) from internal-state recovery (308.868 s / 320.473 s) with both sums and minute conversions recomputed. Distinguishes 0.995 (fault-location probability) from 0.953 and 0.893 (per-cipher state-recovery probabilities). States explicitly that passive interception of commercial phones was not demonstrated, and describes GEA-2M as a research countermeasure proposal. | `lab/modern-attack-evidence.html#faults` | CM026 §§I–III, IV.C–D, V.A–D, VI; PDF pp. 1–2, 4–5, 9–12 |
| **R02** | Rebuilt the exhibit as a sourced forensic case with a four-label evidence scheme — observed / implemented / conditional inference / open — applied to every claim. Covers the Nokia DA-8520 original and its DES-OFB algorithm, the NSA replacement ROM and the version/date/checksum coincidence, the SBTcipher weaknesses, the List Merge and Branch-and-Prune attacks with their measured runtimes and memory, the nonce bias with its measured 388-case distribution **and the fact that it was already present in the Nokia device**, and the unresolved fixed-format-message question. No simulator, no runtime promise. | `ciphers/ua-8295.html`, `scripts/build-artifact-cards.js`, `data/exhibit-trust.json` | CM023 §§1.2–1.3, 2, 3.5–3.7, 4–4.2, 5.2–5.4, 6.1–6.3, 7.1–7.3; corroborated against Crypto Museum |
| **R03** | Multi-image records with original dimensions, SHA-256 content hash, rotation and crop. Regions are stored in **original-image** coordinates and transformed for display, so changing the presentation never rewrites a region. Selecting an occurrence highlights its crop; selecting a region reports the transcription span and symbol classes it covers. The all-occurrences view is a list of focusable buttons with `aria-pressed`, so selection works from the keyboard. A different hash under a recorded filename is reported, with an explicit note that byte identity is not authenticity. | `js/research-model.js`, `js/research-ui.js`, `lab/evidence-workbench.html`, `css/research-workbench.css` | CM036, CM035 |
| **R04** | Revisable symbol inventory: build from a revision, inspect every occurrence of a class, split or merge with a recorded reason. A split moves **only** the selected occurrences. A merge keeps both earlier labels and both reasons in an append-only decision history that validates on import. | `js/research-model.js`, `js/research-ui.js`, `lab/evidence-workbench.html` | CM036, CM035, CM033 |
| **R05** | Versioned investigation bundle (`cipher-museum-investigation` v1) carrying the evidence record, selected layer, key revisions and locks, solver settings, scoring-model and solver identity, search and segmentation state, candidate provenance, and an image manifest. Import restores the declared state; an invalid or incompatible bundle leaves the current record untouched. Inputs are fingerprinted, so a changed transcription, key or solver input is reported **stale** rather than silently reused, and a different model build is reported too. Image bytes are never embedded and no URL is fetched. Two guided saved examples. | `js/research-model.js`, `js/research-ui.js`, `lab/evidence-workbench.html` | CM034, CM035 |
| **R06** | Versioned historical-language profiles for **French (1580)**, **Italian (c. 1320)** and **classical Latin**, built from pre-1800 public-domain works; only n-gram counts are committed, with each source's URL, byte size and SHA-256 recorded. Each profile publishes period, register, orthography, normalization, pruning, coverage, rights and limits. The modern-English model is retained and labelled a baseline. Comparison ranks by mean log-probability per letter with a declared margin and **abstains** on short input, small margin or low coverage. Thresholds are calibrated on a declared development set that is separate from the evaluation material. | `js/research-language-model.js`, `scripts/build-research-language-profiles.js`, `data/research/v2/language-profiles.json`, `data/research/v2/holdout.json`, `lab/evidence-workbench.html` | CM004, CM005, CM033 |
| **R07** | Segmentation rewritten as a **lattice** with backward-reachability pruning. Below budget it enumerates every complete path and reports the global best as guaranteed; above budget it falls back to bounded k-best and withdraws the guarantee **in the result**. Exact path counts come from the lattice, so the ambiguity view (forced / impossible / genuinely ambiguous, with the codes starting at each position) is correct in both modes. Typed entries for nulls, word codes and alternative readings. Leading zeros, original digits and line boundaries preserved; a declared line-break policy decides whether a code may cross one. `segmentMetrics` reports boundary error apart from plaintext error. | `js/research-model.js`, `js/research-ui.js`, `lab/evidence-workbench.html` | CM006, CM004 |
| **R08** | Beam-search solver added beside the annealing search, with a **disclosed** extension order (symbols in order of first appearance, so every step lengthens the scored prefix) and partial scoring declared **non-admissible**. Both solvers run from the same worker on the same inputs and language resources. Measured head-to-head results are published, including the failures. | `js/research-model.js`, `js/research-worker.js`, `scripts/evaluate-research-v2.js` | CM003, CM002 |
| **R09** | Research-evaluation **v2**, separately versioned. Six declared tasks; split and grouping rules in their own module, audited on every run and tested against deliberately leaky input. v1 fixtures, identifiers and published failures are untouched and rerun as the baseline. | `data/research/v2/`, `scripts/evaluate-research-v2.js`, `scripts/research-splits.js`, `tests/test-research-evaluation-v2.js`, `cipher-corpus.html` | CM009, CM010, CM007, CM036 |
| **R10** | New §6 and §7 on the entropy exhibit. A fully enumerable example shows four messages under independent keys with disjoint inventories: 2.5850 bits per code symbol within a key, 4.5850 pooled — exactly log₂ 4 higher, with nothing about any message changed. States the 26-letter, five-homophone bound of at most 130 code types and log₂ 130 ≈ 7.022 bits, labelled as mathematical inference from the stated model. Explains why unicity certifies no reading and promises no solver. Companion notes on the homophonic and corpus pages. | `hall-of-foundations/entropy.html`, `ciphers/homophonic.html`, `cipher-corpus.html` | CM009, CM031 |
| **R11** | Hypothesis register with claim, supporting evidence, contradictory evidence, a confidence **word** from a fixed list, and unresolved alternatives. The record refuses to call a claim well-supported on fewer than two separate pieces of evidence or with unanswered counterevidence, so a clean key application cannot promote a claim. Evidence on both sides survives export and import. A guided unidentified-document case carries a deliberately misleading catalogue description, an unresolved name, and an outcome that stays incomplete. | `js/research-model.js`, `js/research-ui.js`, `lab/evidence-workbench.html` | CM033, CM004, CM005 |
| **R12** | Five comparison cards, each answering the same six questions: Juniper Dual EC, Office RC4 keystream reuse, KASUMI related-key, Bluetooth fixed-coordinate invalid curve, and small-subgroup confinement versus static-key recovery. Cross-linked both ways with the Lorenz depth explanation and the Diffie–Hellman exhibit. Evidence cards, not simulators. | `lab/modern-attack-evidence.html#cards`, `ciphers/lorenz.html`, `ciphers/diffie-hellman.html` | CL225, CL243, CL247, CL378, CL231 |
| **R13** | §4 on the finite-fields exhibit separates exceptional cases in affine arithmetic, complete formulas **on their stated curve class**, functional-correctness proofs and their trusted-compiler boundary, and constant-time assurance as a property of emitted machine code. The small-curve visualization is unchanged and the JavaScript is explicitly not production-ready, constant-time or verified. A pointer paragraph on the real-curve exhibit. No arithmetic was changed. | `hall-of-foundations/finite-fields.html`, `hall-of-foundations/elliptic-curves-real.html`, `hall-of-foundations/ec-math.test.js` | CL572, CL581 |
| **R14** | A four-row table separating metadata recognition, cipher-family classification, fixed-codebook recognition and genuine plaintext/key recovery, with the measurable metadata gap (71.7% → 30.8%) and the explicit note that one benchmark tier ran no live model. A five-step matched-input recipe with label-shuffled and length-only floors, presented as **a reproducible procedure the museum has not executed** — no numbers from it are published. A six-question checklist for reading someone else's benchmark. Pointers from the corpus page and the v1 protocol. | `lab/modern-attack-evidence.html#ai-results`, `cipher-corpus.html`, `data/research/v1/README.md` | CM012, CM013, CM010 |

## Checks actually run, and their results

### Full suite
`npm test` — **70 suites, all passed**, including the two new ones. The first CI run failed
on research-evaluation v2 and that failure was real: the check was claiming bit-exact
cross-platform reproduction of a stochastic search, which is not true. See the limitations
below for what it now claims instead. `npm run lint:html` —
214 files, no errors. Local link check — 6,540 links, 0 broken. Accessibility, mobile and
structural sweeps — 2,140 / 645 / 2,384 assertions, 0 failed.

### Guards verified by reintroducing the defect
CLAUDE.md requires that a new guard be proved to fail. Each of these was broken deliberately,
confirmed to fail, and restored:

| Defect reintroduced | Caught by |
| --- | --- |
| Split empties the source class instead of moving selected occurrences | "A symbol class cannot be empty" |
| Merge discards the earlier labels | "the merged class keeps the earlier label in its history" |
| 90° rotation loses its inverse | "region round-trips through rotation 90" |
| Stale bundle results reported as fresh | bundle staleness assertion |
| One piece of evidence promotes a claim to well-supported | "Missing expected exception" |
| Segmentation claims the global best after pruning | `globalBestGuaranteed` assertion |
| A code is allowed to cross a line break | line-break path-count assertion |
| Wrong sign on the EC doubling slope | complete-formula oracle, 3 further assertions |

The line-break guard initially **failed to fail**, which exposed a real defect: the `span`
line-break policy was inert, because two mechanisms were enforcing the same rule and one
masked a change in the other. The matcher now decides it in one place and the policy works.
A second real defect was found in the browser rather than by any test: the page never loaded
`research-language-model.js`, so the historical profiles silently never appeared in the
solver menu. Both are fixed.

### Independent oracle for the elliptic-curve arithmetic
The Renes–Costello–Batina complete projective formulas were re-implemented independently and
compared against the museum's affine chord-and-tangent arithmetic on **all 361 ordered point
pairs** of the prime-order curve y² = x³ + 2x + 2 over 𝔽₁₇ — identity, inverses and doublings
included. **Zero disagreements.** No arithmetic was changed; this validates what is there.

### Solver comparison — published results, including the failures
39 items over 13 source documents, seed 41, 6,000 annealing steps, beam width 150.

| Solver | Mean plaintext error | Mean key error | Exact recoveries | Mean runtime |
| --- | --- | --- | --- | --- |
| Simulated annealing | 74.9% | 91.3% | **0 of 39** | 24 ms |
| Beam search | 79.1% | 93.2% | **0 of 39** | 487 ms |

Beam search is worse and about twenty times slower on this material. It is kept as a
comparison baseline, not as an improvement. Both are exact on known-key application (39/39)
and invariant under arbitrary symbol relabelling. The v1 baseline (33.2%, 46.0%, 73.3% on
longer texts at a 15,000-step budget) is unchanged and still published.

Fixed code pool: applying a held pool is exact 13/13; recovering the same pool from one short
text leaves 72.8% mean plaintext error. Language shift: 9/9 held-out passages decided
correctly, and all three controls — English with no profile, modern French, random letters —
behaved as declared.

### Browser verification
Headless Chrome over the DevTools protocol, 43 checks, **42 passed**. Covered the real
background worker running both solvers end to end, cancellation leaving no receipt, the
keyboard-operable occurrence list, split affecting only the selection, the segmentation
ambiguity view and its pruning disclosure, the hypothesis register refusing to promote a
claim, the guided incomplete case, bundle export and its stale flags, language comparison
deciding and abstaining, and every changed page at 1280 px and 375 px with zero horizontal
overflow and zero page script errors. The one non-pass is the local static server's
`/favicon.ico` 404 — a browser default request, not a page resource; the site declares
`favicon.svg`.

## Limitations, stated rather than smoothed over

- **Held-out historical passages are not independent documents.** They are reserved slices
  of the same works, by the same authors, used to build the profiles. Unseen by the model,
  but author and work overlap remains. A genuinely independent early-modern French corpus
  was not available on acceptable terms: the readily obtainable editions mix period text with
  modern translation or nineteenth-century editorial apparatus. The French extraction rule
  and its measured 99.93% archaic-orthography share are published so the choice is auditable.
- **Three languages have profiles.** German, Spanish, English and everything else in the
  historical record are uncovered; such a text can only be abstained on or mis-assigned.
- **Nine passages from three works** is a small measurement. It shows the comparison and its
  abstention rule function. It is not a language-identification accuracy figure.
- **The R14 recipe was not executed.** It is published as a procedure. No benchmark numbers
  are invented or implied.
- **The profile file is not in the offline bundle.** At 0.74 MB it would add a third to the
  service-worker precache that every visitor pays, for a feature only workbench users need.
  It is fetched on demand and the page says so.
- **The audit pack excludes the profile count tables** for the same size reason. Their
  provenance is published in the file itself and their SHA-256 in the evaluation export.
- **Evaluation budgets are small** enough to run on every change. A larger budget is a
  separate experiment; it would not change which task is which.
- **CM023 is a preprint**, and its conclusions about intended attack design are conditional
  on a conjecture the authors posit rather than demonstrate. The exhibit labels them so.
- **Per-item search results are not bit-portable between JavaScript engines.** `Math.exp` and
  `Math.log` are implementation-defined, so one annealing accept/reject can flip and send a
  run down a different path. This was found the honest way: the suite passed locally and
  failed in CI at 74.8% against 74.9%. The reproducibility check now states what it
  guarantees — every count, flag and outcome exactly, aggregates within 5 × 10⁻³, one item's
  own error rates within 0.35, runtime and heap not compared at all. It was then probed
  against three real regressions (a changed seed, a broken known-key path, and a 2% drift in
  every float) and caught all three.

## Acceptance criteria not executed

The review's criteria were used as written except for these, which were not run and are not
claimed: reproducing either paper's attacks; retraining or evaluating any neural model;
executing the R14 matched-input recipe against a live LLM; and testing on browsers other than
Chromium. Browser checks were headless Chromium at two widths, not a cross-browser matrix.
