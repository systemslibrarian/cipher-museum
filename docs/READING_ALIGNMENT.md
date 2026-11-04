# Manual passage comparison — 4 November 2026

Dot recommendation **CM094** is implemented in the [Evidence Workbench](../lab/evidence-workbench.html#reading-alignment). The existing source revisions, reading layers, image anchors and hypothesis register remain in place. The new feature records which particular passages an analyst believes correspond across two readings.

## Source and adaptation

Maarten Janssen, Piroska Lendvai and Anna Jouravel, [*Alignment of Historical Manuscript Transcriptions and Translations*](https://aclanthology.org/2025.ranlp-1.55/) (RANLP 2025), §§3–3.1, printed pp. 464–466 / PDF pp. 3–5. The [public PDF](https://aclanthology.org/2025.ranlp-1.55.pdf) describes shared identifiers connecting passages in complete documents, editable alignments, and comparison displays. It also explains that an alignment table can reorder target passages or leave unaligned material out of its display.

The Museum adapts the representation and inspectability lesson. It keeps each full reading in its original order and lists unlinked material explicitly. These are manual passage links; the Museum does not run the paper's aligners, import its manuscript corpus or claim its measured performance. Selected passage verification for this implementation adds no full-paper reading credit.

## What visitors can do

- Compare the original transcription with a derived reading, or compare two reading layers from the same source revision.
- Select passages or enter inclusive character ranges. A link may connect one passage to several, several to one, or several to several.
- Record an explanation for each link. Different links may overlap when they express competing interpretations; coverage is the union of active ranges, not a claim that those interpretations are mutually consistent.
- Read both complete texts and inspect every unlinked interval, including whitespace, line breaks, margin notes and editorial additions. “Unlinked” means no correspondence is recorded; it does not establish omission, loss or a translation error.
- Withdraw a mistaken link with a reason. The earlier ranges and explanation remain in the history and exported record. A replacement is a new link with its own identifier.
- Export and import either the evidence record or the whole investigation with these links intact.

Unrecorded passage ranges, notes and withdrawal reasons belong to the current comparison. Evidence imports, investigation imports and restoring a record clear those drafts, even if the replacement uses the same generic IDs or identical text. Changing the recorded source, its metadata or the selected comparison also clears them with an explanation. Add and withdraw actions require source edits and metadata edits to be saved first; they cannot silently overwrite a changed shelfmark or other source field.

The original teaching example contains an illustrative older spelling without assigning it to a historical dialect or date. Its first instruction becomes two sentences; two later instructions become one. A margin note and an editorial note remain unlinked. No historical decipherment or translation is claimed.

## Representation and revision safety

The evidence format stays at version 2. Its optional `alignments` array contains records of this form:

```json
{
  "id": "alignment-1",
  "revision": 1,
  "source": "revision-1",
  "target": "layer-1",
  "sourceRanges": [
    {"id": "alignment-1-source-1", "start": 0, "end": 21, "literal": "Sende bread and wine."}
  ],
  "targetRanges": [
    {"id": "alignment-1-target-1", "start": 0, "end": 11, "literal": "Send bread."},
    {"id": "alignment-1-target-2", "start": 12, "end": 22, "literal": "Send wine."}
  ],
  "note": "One instruction is split into two sentences; the source wording is retained.",
  "withdrawal": null
}
```

Stored ranges are zero-based, with an exclusive end, and count Unicode code points. The interface displays one-based inclusive positions. Combining marks count separately; astral characters count once. Every range retains an exact literal snapshot, checked against the named revision or layer during import. Within one side of a link, ranges must be nonempty, ordered and non-overlapping. The limit is 200 links per evidence record and 20 ranges per side of a link, within the existing overall record-size limit.

A link names two distinct readings belonging to the same source revision. New links require the current source revision. Revising the source keeps earlier links attached to the earlier text; it neither shifts their positions nor transfers them to a new reading. Earlier comparisons remain inspectable and visibly identify their revision. They can be withdrawn with a reason, but new links for revised text require a reading derived from that revision.

HTML textareas display CR and CRLF line endings as LF. The UI maps selections back to the recorded code points, so selecting one displayed CRLF line break includes both recorded characters. Merely saving or exporting an unchanged display retains the original line endings. Inspecting a stored range highlights its displayed characters; a range inside a CRLF pair highlights the displayed line break. The same mapping is used by the existing source-span selection control. None of these display operations changes stored text.

Source metadata controls can also sanitize their display, for example by removing line breaks from a text input or trimming surrounding URL whitespace. Dirty-state detection compares against the last rendered control values, not the raw stored strings. An unchanged displayed field retains its imported stored value on save/export; an actual edit must pass the existing source validation.

Records written before this feature import with an empty alignment collection. An absent or empty collection is excluded from investigation fingerprints, preserving the pre-extension bindings of unchanged version 2 bundles. Meaningful links, explanations and withdrawals participate in those fingerprints: changing this evidence makes an earlier dependent receipt stale. The solver model-build identifier is unchanged because no solver behavior changes; source-file hashes still identify the revised implementation.

## Verification

`node tests/test-reading-alignment.js` passes **24 focused checks** covering:

- Legacy imports and the exact source/configuration fingerprints captured from the prior implementation.
- Independently counted one-to-many and many-to-one intervals, reversed comparisons, overlapping hypotheses and every unmatched character.
- Astral characters, decomposed combining marks and CRLF display-to-recorded positions.
- Invalid ranges, changed literal snapshots, duplicate IDs, cross-revision links and required explanations.
- Withdrawal history and recomputed active coverage.
- Evidence and investigation round trips, including stale-receipt detection when link evidence changes.
- The real page's DOM controls, manual linking, withdrawal, safe text rendering, unsaved-source protection, example loading and import/export.
- Unchanged CRLF source bytes and correctly selected source spans after browser-style textarea normalization.
- Draft isolation across evidence import, investigation import, Restore, changed source metadata and changed revisions, including replacement records with identical generic IDs or identical text.
- Unsaved metadata protection for both adding and withdrawing links, and unchanged imported metadata after browser input sanitization.

The new test first failed against the pre-feature implementation. All nine targeted temporary faults were detected: disabling literal checks, counting UTF-16 code units, counting withdrawn links as active, hiding unlinked whitespace, disabling the record button, normalizing recorded CRLF bytes on export, ignoring CRLF when mapping a selection, and separately ignoring dirty metadata when recording or withdrawing a link. The faults were never kept in the working files.

An independent UI review also reproduced two preservation defects before the final repair: a draft could survive replacement by a different record with the same generic IDs, and a link action could discard an unsaved catalogue field. The new replacement-draft regression failed on that earlier UI. The repaired 24-check suite and both original reproductions were then checked independently, including unchanged CRLF source/metadata and URL whitespace. No further findings arose in that bounded follow-up.

Existing regression commands passed:

```text
node tests/test-research-workbench.js
node tests/test-research-workbench-v2.js
node tests/test-research-audit.js
node tests/test-research-audit-dom.js
node tests/test-research-review-20261031.js
node_modules/.bin/htmlhint lab/evidence-workbench.html
```

JavaScript syntax checks and `git diff --check` also passed. DOM tests verify event wiring and state; rendered-browser and deployment evidence belongs in the integration completion record.

## Deliberate limits

There is no automatic alignment, OCR, spelling repair or translation. There is no alignment-error-rate claim, probability or confidence score. A manual link can be wrong even when its ranges are mechanically valid. Two readings must share a recorded source revision; cross-document corpus alignment is outside this bounded workbench addition. Image bytes remain local and separate from the export, as before.

CM095's collection-specific OCR evaluation remains separate future work: held-out images, preservation/insertion metrics with explicit definitions, an unchanged-output correction baseline and review of extreme failures would be required if OCR or automatic correction were introduced.
