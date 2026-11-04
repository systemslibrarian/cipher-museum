# Dot follow-ups — 4 November 2026

## Approved scope

This release implements all seven packages in the approved Museum shortlist, from baseline `c7b77a493be9519881bf48e7e3b6d8e1fa27d886`. Most additions extend existing pages; IKA is one new historical exhibit. The collection becomes **174 exhibits**, including **154 cipher/history exhibits**. This does not change the 88 cipher engines or the immutable corpus releases.

| Package | Implemented result | Detailed receipt |
| --- | --- | --- |
| Catalogue and frozen-audit consistency | Restored Gripenstierna’s missing catalogue row; synchronized Typex, Argenti and T52 summaries with the reviewed exhibit pages. Added a canonical-membership check and a manifest-driven audit date/count synchronizer. | This file; `tests/test-catalogue-sync.js` |
| CM094 | Manual passage links between source, edited and translated readings. Supports split and combined passages, visible unmatched text, revisions, withdrawals and export/import. | [Passage comparison](READING_ALIGNMENT.md) |
| CM108 | Four replacement conditions with an exact original 64-source task: unchanged, fixed bijection, fixed many-to-one and fresh replacement per occurrence. | [Structure and concealment](DOT_STRUCTURE_ADDITIONS_2026-11-04.md) |
| CL1441 | Portuguese letters of 1649: source versions, documentary chronology, translation discrepancy and limits on inferring policy consequences. | [Historical additions](DOT_HISTORICAL_ADDITIONS_2026-11-04.md) |
| CL1491 | IKA, exhibit 174 in Hall VII: intercepted behavior, M-1 hardware, American analogue and proposed physical mechanisms are separately identified. | [Historical additions](DOT_HISTORICAL_ADDITIONS_2026-11-04.md) |
| CL1339 | Charles V’s 1547 letter and an original staged mixed-key exercise, with failed attempts, an unresolved symbol and a separate check copy. | [Historical additions](DOT_HISTORICAL_ADDITIONS_2026-11-04.md) |
| CL1341 | Three original concealment controls: ambiguous invoice boundaries, accidental reserved words and a decodable rhythm that fails its declared meter. | [Structure and concealment](DOT_STRUCTURE_ADDITIONS_2026-11-04.md) |

## Visitor entry points

- [Compare passages](../lab/evidence-workbench.html#reading-alignment).
- [Compare replacement rules](../lab/reading-the-evidence.html#structure-controls).
- [Test concealed-message reliability](../lab/reading-the-evidence.html#concealment).
- [Follow the Portuguese letters](../lab/intercept-to-intelligence.html#portuguese-1649).
- [Open the Charles V case](../lab/decipherment-cases.html#charles-v).
- [Explore IKA](../ciphers/ika.html).

Current README, teaching and Lab invitations describe the expanded activities. IKA is registered in the canonical trust/collection manifest, Hall VII, the map, timeline, sitemap, search, artifact cards and static-page checks. Generated collection counts use the existing build scripts. The service worker includes the new page and Charles V script, with its version derived from the changed assets.

## Correctness and evidence decisions

Passage links record interpretations, not certified equivalence. Their ranges count the recorded Unicode code points, including whitespace and combining marks. The UI maps browser-normalized line endings back to those positions. Importing and exporting an unchanged CRLF source preserves the original bytes in the JSON text fields. Withdrawing a mistaken link requires a reason and retains its history. Earlier version 2 bundles with no links keep their prior fingerprints; meaningful new links are included in the source fingerprint.

The replacement exercise enumerates its complete artificial universe. Its counts do not measure AI accuracy or supply posterior probabilities. Its many-to-one counterexample demonstrates both ambiguity and the possibility of answering one narrow task without recovering the full message. The concealment exercise separately checks legal decoding and declared carrier constraints; it does not estimate a real interceptor’s detection rate.

Historical evidence is attributed to specified passages. The Portuguese case preserves surviving versions and missing-record uncertainty. The Charles V account explicitly follows the 2023 study; a later 2025 edition is linked without claiming to have read its access-blocked full text. IKA’s physical-mechanism uncertainty is dated to the cited 2021 study. No unverified physical simulator or borrowed historical image was added.

The six source-register additions are selected-passage rereads. They do not increase Dot’s full-paper reading count. Earlier page-review and release receipts remain historical records of their own snapshots. Count-only page changes are identified separately in the current coverage ledger.

## Verification

### Focused checks completed during implementation

- Catalogue guard: all 154 cipher/history members occur exactly once; Typex, Argenti and T52 summaries and the frozen audit metadata agree with their canonical inputs.
- Six catalogue faults were deliberately introduced, detected and restored: missing Gripenstierna, the three stale descriptions, a wrong audit count and a wrong snapshot date.
- Passage comparison: 24 model and DOM checks, including grouped links, unmatched characters, Unicode/CRLF positions, source revision isolation, withdrawn history, old bundle fingerprints and both export formats. Nine isolated faults were detected. Independent review also exposed stale draft reuse after import and loss of unsaved metadata; both are fixed and covered by new regressions.
- Replacement/concealment: all 64 source triples, all rule/query combinations, an independent parsing oracle over 363 invoice strings, controls/resets and five isolated faulty implementations.
- Historical additions: 22 focused checks with changed input/key counterexamples, partial-key handling, prerequisite controls and retained history. Five content mutations were rejected.
- The new models and historical additions received independent review. The IKA fact label was refined from “traffic analysis” to “intercepted ciphertext” to preserve the Museum’s distinction between message content and communication metadata.

### Release gates

The shared suite registers the new focused tests. The integration runs `npm test`, `npm run validate:release`, `npm run lint:html`, generated-metadata checks, corpus checksums and the research evaluation replays. Changes to research source hashes are accompanied by regenerated evaluation receipts; the feature does not claim a new solver, new blind data or improved recovery performance.

`scripts/check-dot-followups-browser.js` is a required dependency of the existing Pages deployment job. It runs Chromium at 1280- and 375-pixel widths, operates the new controls, checks passage export/import including CRLF and an astral character, tests positive and negative readings, checks page errors and document overflow, and runs automated WCAG A/AA scans over the relevant surfaces. The `museum-dot-browser` Actions artifact contains its JSON results and screenshots. This is a bounded Chromium check; it does not certify every browser, accessibility need or historical claim.

After the committed source is available, the audit exporter generates the complete 228-public-page reading pack and the deterministic ZIP. `scripts/sync-audit-summary.js` updates the main and documentation READMEs from that frozen manifest. Its date and count describe the exported snapshot, not a remembered live total. The export’s source commit and checksums identify exactly what the pack contains.

The pull request and Actions run provide the hosted test and deployment outcomes. The completed-work entry in Dot is updated only after the deployed pages have been checked against the merged source.
