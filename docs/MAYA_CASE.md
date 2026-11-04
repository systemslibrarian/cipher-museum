# Maya case in Historical Investigations

Added 3 November 2026 to `lab/decipherment-cases.html#maya`. This is the second follow-up case from section 4 of the 2 November ebook review. It uses the same evidence-chain layout and the same honesty rules as the Linear B and Egyptian cases.

**Verification status.** No Maya epigrapher is available to review the case, so its readings were checked against a second published source: Harri Kettunen and Christophe Helmke, *Introduction to Maya Hieroglyphs*, 20th edition (Wayeb, 2025), freely published by Wayeb. That handbook confirms:
- Knorozov's turkey reading from Landa's *cu* sign above a turkey;
- the "so-called Landa alphabet";
- *ba-ki* for *baak* "captive" among the harmony rules, after Lacadena and Wichmann (2004);
- Proskouriakoff's work on royal accession.

Landa's letter-name explanation and the birth glyph rest on Coe alone. The page states this in its source note.

## Section 4, and how this meets it

| Section 4 asks | Implementation | Named tests in `tests/test-maya-case.js` |
| --- | --- | --- |
| Compare an alphabetic assumption with the syllabic and logographic interpretation | "Alphabet or syllables?" checks two hypotheses against two observations Coe reports. First, Landa said b aloud as "be", and the sign written in answer recorded that syllable. Second, two signs over a turkey picture spell *k'utz*, a word of three sounds. The alphabet hypothesis is offered first. One failed check rejects a hypothesis, and every check stays on record. | letter names contradict an alphabet; turkey contradicts an alphabet: two signs cannot spell three sounds; turkey consistent with syllables; one failed check is enough to reject a hypothesis; the verdicts follow the data, not the label; record keeps contradicted checks after revision and reset |
| A second evidence step using the historical date-pattern reasoning | "Test a date pattern" uses **invented figures**, labelled as such in the interface, modelled on Proskouriakoff's finding as Coe reports it. In each set the earliest date, a birth, falls 12 to 31 years before an accession, and each set spans a lifetime. A fixed-cycle hypothesis is contradicted by the varying gaps. | varying gaps contradict a fixed cycle; equal gaps would fit a cycle; a set longer than a lifetime contradicts events in one life; rendered date verdict comes from the fixture |
| Keep current readings and historical hypotheses distinct | The Key stage says "Knorozov proposed in 1952". The Reading stage separates his synharmony rule from the later refinement Coe reports: an echoing vowel marks a short vowel, a different one a long vowel. "Read a two-syllable spelling" shows both rules side by side; *ba + ki* is "not covered" by the 1952 rule. | synharmonic spelling reads a short vowel; disharmonic spelling: Knorozov's rule has no reading, the later rule marks a long vowel; rendered spelling verdict shows both rules |
| Avoid implying living Maya languages are secret codes | The case opens "Maya writing is a script for Maya languages, not a code" and "Mayan languages are living languages". A test forbids "secret code" and "encryption" anywhere else in the section. | script, not a code; living languages |
| Original or licensed material, not the book's plates | No glyph images are shown; signs are given in transliteration. The date table is invented. The book is cited, not linked. | no Maya glyph images or uploaded copies; date fixture labelled invented in the UI |
| An attractive wrong hypothesis, contradiction, revision and kept record | As above, plus Brasseur's misuse of the "alphabet" and Thompson's attacks, both in the Structural hypothesis stage. | as above |

## Sources and what was checked

Michael D. Coe, *Breaking the Maya Code*, 3rd edition (Thames & Hudson, 2012), read from the user's copy:

- Landa's account written in Spain around 1566, surviving in a later copy that Brasseur found; Brasseur's careless use of the list and its effect on phonetic approaches.
- Knorozov in 1952; the letter-name explanation of Landa's signs; logograms alongside phonetic signs; *k'u-tz(u)* "turkey" over a turkey picture, a word still used in modern Maya; synharmony; Thompson's attacks.
- Proskouriakoff at Piedras Negras: birth and accession glyphs, the 12-to-31-year interval, sets spanning a lifetime, the inscriptions as history.
- Later work on synharmony and disharmony, with the *ba-k(i)* for *baak* example.
- The syllabic chart, mentioned as the record of current values.

By the owner's preference, Coe is cited by title, without chapter or page. The page paraphrases throughout and quotes nothing beyond the glyph nicknames Coe reports.

## Deviations from section 4

- **The date step uses invented figures, not Piedras Negras dates.** The real dates need Long Count conversions and monument identifications, which would have to be verified monument by monument.
- **The 80-year lifetime is the museum's own assumption, not Coe's,** and the page says so.

## Verification

- **Tests first.** `tests/test-maya-case.js` was written from the source before `js/maya-case.js` existed, and failed until it was built. It has 29 named tests; a final check fails if any of the 14 required verdict and mismatch paths did not run.
- **Mutations.** Twelve, each breaking the logic behind a rendered verdict rather than its text. Each made the suite fail:
  - **Y01:** letter names ignore what was heard.
  - **Y02:** the silent final vowel is ignored.
  - **Y03:** sounds per sign are ignored.
  - **Y04:** the combined verdict uses OR.
  - **Y05:** the harmony test is always true.
  - **Y06:** a long vowel is not marked.
  - **Y07:** the cycle hypothesis ignores the gaps.
  - **Y08:** the lifetime limit is ignored.
  - **Y09:** reset clears the record.
  - **Y10:** the table shows the wrong gap.
  - **Y11:** the spelling check ignores the selection.
  - **Y12:** the date check ignores the chosen hypothesis.
- **Existing suites.** `test-linear-b-case.js` and `test-process-exercises.js` still pass on the same page.

## Merge note

The Egyptian case (a separate PR) also edits `lab/decipherment-cases.html`. It inserts before the Linear B section; this case inserts after it. Both touch:
- the page's `coverage.json` entry;
- `README.md`;
- `sw.js`;
- `tests/run-all.js`.

Whichever lands second regenerates those files. The meta description and the closing "What the comparison teaches" paragraph are deliberately unchanged, so they can be updated once after both cases land.
