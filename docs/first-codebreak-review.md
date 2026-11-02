# Beginner codebreaking lessons — 2 November 2026

The approved five improvements are implemented as an original guided lesson with links from the homepage, Learn, Teaching, Cipher Detective and the relevant exhibits. The lesson reuses `DetectiveWorkspaces.Desk` for substitution mappings, locks and undo. No exhibit was added to the numbered collection; the collection counts remain unchanged.

| Approved improvement | Implementation |
| --- | --- |
| Guided first codebreak | `first-codebreak.html#first-desk`: an original library notice, partial key, check against the supplied plaintext, progressive clues, one-letter reveals and reflection. |
| Practical clues beyond counts | Highlight repeated words, doubled letters and short words. The most frequent cipher symbol deliberately represents O, so the tempting E hypothesis fails. |
| End-to-end Vigenère attack | `#vigenere-lesson`: repeated-trigram locations and distances, user-selected period, all 26 scored shifts per column, trial keys and full-plaintext verification. Accidental repeats and equivalent repeated keywords are explicitly covered. |
| Language-aware beginner comparison | `#language-lesson`: five original, visible modern-language samples, calculated counts, within-word pairs and short words. These are explicitly small teaching samples, not representative language corpora or historical models. Existing historical-profile tools are linked separately. |
| Printable activities | Separate `codebreak-worksheet.html` and `codebreak-answers.html`, generated from the same fixture definitions. Student handout excludes full plaintexts and the Vigenère key. Print stylesheet removes navigation and uses black text on white. |

Additional work: a same-message homophonic comparison with adjustable O alternatives and repeated random trials; direct Black Chamber attribution in Further Reading; a public `classical-guide.html` mapping all 27 subject entries in the supplied Chamber Guide to museum content. Contact/home/CD-ROM links are resource navigation, not missing cipher subjects. The Sator interpretation, digraph category, and separate Mary Stuart cases are qualified in the crosswalk.

## Evidence and checks

- `npm test`: all 78 registered suites passed, including engines, DOM interactions, accessibility structure, mobile structural checks, local links, corpus and research regression suites. This is not a complete accessibility certification or an independent historical audit.
- `npm run lint:html`: 220 HTML files scanned; no errors.
- `npm run validate:release`: passed. No release or dataset DOI changed.
- `tests/test-first-codebreak.js`: fixed substitution/Vigenère known answers; incorrect guess and lock behavior; immediate input updates; undo and reveals; period/shift selection; accidental-repeat handling; equivalent period-eight key; language switching; whole-token homophone counts; separated worksheet answers; all guide links and fragments; search inclusion.
- Regression guard mutation: deliberately removed the input listener, observed an assertion failure, restored it and reran successfully.
- Desktop Chromium preview: followed the homepage lesson link; typed a G→O guess and observed immediate plaintext changes; found repeated trigrams, selected period 4 and the four suggested shifts, then verified recovery of LAMP; switched the language reference to French.
- Narrow layout: same-origin browser preview frame, 390px outer width / 375px content width with scrollbar. Measured document width 375px and scroll width 375px; inspected heading, navigation and long ciphertext wrapping. This is a responsive browser check, not physical-device testing.
- Print rules: inspected worksheet in a preview applying its print rules to screen. Caught and corrected inherited pale paragraph text; verified black text, white background and hidden navigation/answer navigation. Native printer/PDF pagination was not exercised by the available browser interface.
- Search regeneration changed only the four new page records and the Teaching description, plus timestamp. Service-worker core includes the lesson assets and its version is restamped.

## Limits and maintenance

All narrative exercises, ciphertext fixtures and modern-language samples are original. The Black Chamber informed the teaching format; none of its code, illustrations or historical mock-ups was imported. Technical scope is documented on the lesson page. Browser work stays in memory and is deliberately lost on reload.

Homophone randomness is a teaching simulation, not a secure generator. Charts count three-digit tokens as symbols. Lower English chi-square scores are hypotheses, not probabilities or guarantees. Toy plaintext checks do not authenticate historical evidence.

Regenerate the handouts with `node scripts/build-codebreak-handouts.js`; validate them with `--check`. The page audit ledger records this bounded review separately from older audit evidence. The audit export is regenerated from the committed source after this change.
