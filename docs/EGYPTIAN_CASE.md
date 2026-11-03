# Egyptian case in Historical Investigations

Added 3 November 2026 to `lab/decipherment-cases.html#egyptian`, as the first of the two follow-up cases in section 4 of the 2 November ebook review. It uses the same page, the same evidence-chain layout and the same honesty rules as the Linear B case.

**Specialist review needed.** The sign identifications (O1 house plan, D21 mouth, D54 walking legs), the transliteration *pr*, the translation "go out", and the historical statements should be checked by an Egyptologist before they are presented as authoritative.

## Section 4, and how this meets it

| Section 4 asks | Implementation | Named tests in `tests/test-egyptian-case.js` |
| --- | --- | --- |
| A small, properly sourced example that distinguishes phonograms, phonetic complements and determinatives | The word *pr* "go out" from Collier and Manley §2: a two-consonant house sign, a mouth sign used as a phonetic complement, and a walking-legs determinative. The learner assigns each sign a role, and the page shows the transliteration those roles would spell. | correct roles give pr; mouth read as an extra sound gives prr mismatch; legs read as a sound sign is flagged: no sound value; house read as a determinative loses pr; a complement with nothing to complement is flagged |
| Let learners determine reading direction | The signs are shown facing right, so the text reads right to left: you read into their faces (§7). A control turns the signs round, and the right answer flips with them. | English habit wrong when signs face right; reading into the faces correct both ways; rendered direction verdict follows the rendered facing |
| Compare transliteration with translation | The Reading stage, and the result once the roles are right, give "Transliteration: pr" and "Translation: 'go out'". | rendered role verdict shows the computed transliteration |
| Retain the Rosetta correction | The Source stage says "two languages and three scripts", matching the Rosetta page. | Rosetta correction retained |
| The A–Z activity stays labelled as a modern invention | The Khnumhotep II widget's "invented for display" label is guarded. | A–Z widget on the Khnumhotep page stays labelled invented |
| An attractive but wrong hypothesis, an independent contradiction, revision, a kept record | The three historical hypotheses are tested against two checks that played no part in framing them: Champollion's count (1,419 signs to 486 Greek words) and the Ramesses cartouche from Abu Simbel. "Each sign stands for one word or idea" is offered first. Every check stays in "Your record" through revision and reset. | count contradicts one sign per word; count contradicts Young; Ramesses contradicts Young; one failed check is enough to reject a hypothesis; record keeps contradicted checks after revision and reset |
| An unknown script distinguished from deliberate encryption | "Egyptian hieroglyphs are a writing system, not a cipher." The section also links the deliberately unusual Khnumhotep II spellings. | script, not a cipher |
| Original or properly licensed material, not the books' plates | The signs are Unicode characters, labelled "not a facsimile of any inscription". No plate or drawing is reproduced, and the books are cited, not linked. | exercise labelled; word attributed, not presented as a transcription of one inscription; no private or uploaded copies linked |

## Deviation from section 4

Section 4 suggests "a small, properly sourced inscription". The reading exercise uses one word from Collier and Manley's teaching text, not a specific inscription. The only properly sourced inscription in the case is the Ramesses cartouche, and it serves as historical evidence, not as a text to read.

Reading a specific inscription needs a facsimile or transcription the museum can verify sign by sign and is licensed to show. Two candidates are named in the sources:
- British Museum EA 117, the Abydos king list (Collier and Manley, study exercise 2.9);
- EA 71539, a tomb-chapel fragment (Parkinson, cat. 4).

The books' drawings of them cannot be reproduced. Choosing one, and how to show it, needs a human decision.

## Sources and what was checked

| Source | Used for | Checked |
| --- | --- | --- |
| Richard Parkinson, *Cracking Codes: The Rosetta Stone and Decipherment* (University of California Press, 1999; © Trustees of the British Museum) | p. 15, the classical emphasis on symbols; p. 31, Young's Ptolemy cartouche (five correct values, eight wrong) and his foreign-names proposal; pp. 33–35, the Philae obelisk and the Abu Simbel copies received on 14 September 1822; p. 34, Champollion's 1821 symbolic view and the 1,419-to-486 count; p. 35, Ramesses read from a sun sign and *s* signs; pp. 57–59, sign functions | Read in the user's copy. Printed page = PDF page − 2. |
| Mark Collier and Bill Manley, *How to Read Egyptian Hieroglyphs* (University of California Press, 1998) | §2, consonants only, and *pr* with complement and determinative; pp. 4–5, conventional pronunciation; §5, grouping of signs; §6, determinatives; §7, reading into the faces; §§11–13, two- and three-consonant signs, complements and ideograms | Read in the user's copy, a scan of two-page spreads. Sections and printed pages were matched. |

At the user's instruction, the books are cited by title, publisher, year and page, and the PDFs are not linked or committed. The page paraphrases throughout; its only figures quoted from a source are the two counts.

## Verification

- **Tests first.** `tests/test-egyptian-case.js` was written from the sources before `js/egyptian-case.js` existed, and failed until it was built. It has 35 named tests; a final check fails if any of the 17 required verdict and mismatch tests did not run.
- **Mutations.** Each mutation broke the mechanism behind a rendered verdict, not the displayed text, and each made the suite fail:
  - **E01:** count ratio inverted.
  - **E02:** count range ignored.
  - **E03:** Ramesses origin ignored.
  - **E04:** the combined verdict uses OR. This first slipped through, because no historical hypothesis passes one check and fails the other. It was caught after the verdict moved into `assess()` with a named one-check-fails test.
  - **E05:** direction mapping inverted.
  - **E06:** direction ignores facing.
  - **E07:** "turn round" changes the text only.
  - **E08:** a complement adds a sound.
  - **E09:** a soundless sign is silently accepted.
  - **E10:** an orphan complement is accepted.
  - **E11:** reset clears the record.
  - **E12:** a determinative contributes a sound.
- **Existing suites.** `test-linear-b-case.js` and `test-process-exercises.js` still pass on the same page.

## Merge note

The Maya case is a separate PR and also edits `lab/decipherment-cases.html`. It inserts its section at a different point, but both PRs touch the same files:
- the page's `coverage.json` entry;
- `README.md`;
- `sw.js`;
- `tests/run-all.js`.

Whichever lands second must regenerate those files. The page's meta description and its closing "What the comparison teaches" paragraph are deliberately unchanged here, so that only one combined edit is needed once both cases land.
