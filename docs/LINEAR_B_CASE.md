# Linear B case in Historical Investigations

Added 3 November 2026 to `lab/decipherment-cases.html#linear-b`, as the priority-2 ancient-script pilot from the 2 November ebook review (section 4). It extends the Linear B structural analogy added the same day in PR #36 rather than building a parallel page. It adds case material to the existing Historical Investigations page and its Evidence Workbench hand-off; the hypothesis and revision framework is unchanged. Egyptian and Maya cases are later follow-ups.

**Verification status.** No Linear B specialist is available to review the case. In place of that review, every transliteration was checked against two published sources where possible. *ti-ri-po-de*, *qe-to-ro-we*, *a-no-we* and *pa-te* = *patēr* appear in both Chadwick (1958) and *Documents in Mycenaean Greek* (1956). *ma-te* "mother" rests on Chadwick alone, and the reading *pantes* rests on *Documents* alone. The page states this in its source note. The inventory of every claim is [`LINEAR_B_SPECIALIST_REVIEW.md`](LINEAR_B_SPECIALIST_REVIEW.md). The transliterations and word identifications on the page (*ti-ri-po-de*, *qe-to-ro-we*, *a-no-we*, *pa-te* = *patēr* or *pantes*) follow Ventris and Chadwick's 1956 edition. A Mycenologist should review them before they are presented as authoritative.

## What the page now teaches

| Brief requirement | Implementation | Guard in `tests/test-linear-b-case.js` |
| --- | --- | --- |
| Structural analysis before sound values | Stage 1: Kober's recurring forms and the beginning of a grid. She deliberately stopped before assigning sounds. | Prose block 4 (triplets) |
| An attractive but wrong hypothesis that is contradicted, revised, and kept | *History:* Kober read her triplets as case forms; her first five proved to be town names and adjectives, while the sign relationships held. Ventris's Etruscan and Aegean prior gave way. *Exercise:* Y is the commonest ending, so "Y marks one item" is offered first and is contradicted by the held-out record. | Blocks 1 and 3; mutations M01, M02, M13 |
| An independent check kept separate from the evidence that built the syllabary | Stage 4: Ta 641, excavated in 1952 and read with Ventris's values. "The tablet did not help form the values; it tested them." The exercise's held-out records are withheld from training in the same way. | Prose block 4; M10 |
| Readings that stay ambiguous | Stage 5: spelling rules, with *pa-te* as *patēr* or *pantes*. In the exercise, Z stays unassigned whichever hypothesis passes. | Blocks 1, 3 and 4; M03, M07 |
| No numerical confidence from Chadwick's rhetoric about odds | Stage 6 calls the odds argument an argument, not a measured probability. | Prose regex; M09 |
| A learner keeps the record | Every check is listed under "Your record", including failures. It survives revision and reset, and goes to the Evidence Workbench with the transfer. | Block 3; M05, M06 |
| An unknown script distinguished from deliberate encryption | Opening paragraph: "Linear B is a script, not a cipher". There was no key to recover and no sender who wanted secrecy. | M08 |
| Original teaching examples, not the book's plates | Invented Latin labels with occurrence counts. No Linear B signs. | Unicode-range guard (M12b); counts match the model (M04) |

## Sources and what was checked

| Source | Used for | Verification |
| --- | --- | --- |
| John Chadwick, *The Decipherment of Linear B* (Cambridge University Press, 1958) | Kober's questions and method; Ventris favouring Etruscan until mid-1952; Work Note 20 of 1 June 1952, introduced as a digression, and the triplets read as place names, "a step Miss Kober had not taken"; spelling rule 7 and *pa-te*; a tablet pairing *pa-te* with *ma-te*; Blegen's letter and Ta 641, including the still-disputed tripod descriptions; the odds called "astronomical" and, of a later check, "beyond mathematical analysis" | Read from the user's copy, added 3 November 2026. By the owner's preference the page cites the book by title, not by page. The page paraphrases throughout and quotes three words ("beyond mathematical analysis"). The file is not linked or committed. |
| Michael Ventris and John Chadwick, *Documents in Mycenaean Greek* (Cambridge University Press, 1956) | Kober's programme stopping short of sounds; her "beginning of a tentative phonetic pattern" (the grid); the reinterpretation of her first five triplets as Cretan town names; Ventris's Work Notes (January 1951 to June 1952) testing Aegean and Etruscan parallels while Greek readings were "regarded as out of the question"; Blegen's letter of 16 May 1953 on Ta 641; the spelling rules and *pa-te*; the argument from odds against chance | Read in an OCR scan of the 1959 printing. The page cites the book by title. The scan is not linked: its licence is unclear. |
| Thomas G. Palaima, "The Pylos Ta Series and the Process of Inventorying Ritual Objects for a Funerary Banquet" (2023), [public PDF](https://sites.utexas.edu/scripts/files/2023/10/2023-TGP-The-Pylos-Ta-Series-and-the-Process-of-Inventorying-Ritual-Objects-for-a-Funerary-Banquet.pdf) | The decipherment's announcement on 1 July 1952; Ta 641 discovered in the 1952 Pylos season and "immediately used" by Ventris to demonstrate his values | Read in full from the PDF (opening page). |
| Andrew Robinson, *The Story of Writing*, revised edition (2007) | Retained from PR #36 | Not rechecked in this change. |

Not on the page: the book's plates, Linear B Unicode signs, and links to uploaded copies of copyrighted books.

## Surfaces changed

- `lab/decipherment-cases.html`: the Linear B section, plus the meta description and hero line.
- `js/structure-exercises.js`: occurrence counts, `commonest()`, `unresolved`, and the record list.
- `tests/test-linear-b-case.js`, registered in `tests/run-all.js`.
- `README.md`: Recent Changes, and the lab-list entry.
- `js/search-index.json`: regenerated; only this page's entry changed.
- `sw.js`: version re-stamped.
- `docs/page-audit/coverage.json`: the `linear_b_case_2026_11_03` entry.

`tests/test-process-exercises.js` from PR #36 passes unchanged.

## Verification

- **Guard first:** `tests/test-linear-b-case.js` failed before any change, with `S.commonest is not a function`.
- **Mutation checks:** thirteen defects were introduced one at a time. Each failed on the guard meant for it:
  - **M01:** X made the commonest ending.
  - **M02:** the attractive hypothesis passes.
  - **M03:** Z resolved.
  - **M04:** a table count drifts from the model.
  - **M05:** reset clears the record.
  - **M06:** duplicate record entries.
  - **M07:** a passing check resolves Z.
  - **M08:** Linear B framed as a cipher.
  - **M09:** a numerical confidence score added.
  - **M10:** the test tablet described as helping form the values.
  - **M11:** a link to an uploaded copy of a book.
  - **M12b:** a real Linear B sign in the section.
  - **M13:** the neutral answer offered first.

  Each file was restored after its check, and the suite passed again.
- **Guards added for the Chadwick revision:** three more, each seen failing on its own defect:
  - **M14:** the context example (*pa-te* with *ma-te*) removed.
  - **M15:** Chadwick's "beyond mathematical analysis" caveat removed.
  - **M16:** the printing that supplies the page numbers left unnamed. Retired on 3 November 2026, when page numbers were removed at the owner's request; the test now checks that Chadwick is cited by title without pages.

## Against the review

The review (`New-Ebook-Review-Crypto-Lab-Cipher-Museum-2026-11-02.md`, section 4) was checked once the user supplied it. This case meets its Linear B acceptance points:
- an attractive wrong hypothesis that is contradicted, revised and kept on record;
- an unknown script distinguished from encryption;
- the syllabary evidence kept separate from the tablet that tested it;
- ambiguous readings shown;
- no numerical score made from Chadwick's odds;
- original examples rather than the book's plates;
- verification status stated in place of specialist review, which is not available.

The review cites Chadwick by page; by the owner's preference this page cites its books by title only. The Egyptian and Maya cases and the writing-systems route followed in later pull requests.
- **Full suite:** `npm test`, run before commit.
