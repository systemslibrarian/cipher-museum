# Dot research additions — 2 November 2026

Four approved additions to existing pages; no new cipher engine, corpus release,
solver or manuscript record format. The exercises use original synthetic fixtures.

| Addition | Location | Evidence and scope |
| --- | --- | --- |
| Fluent but inconsistent reading | `lab/evidence-workbench.html#reading-consistency` | [Aldarrab and May (2021)](https://aclanthology.org/2021.acl-long.561/), problem definition and noisy-text discussion. Independent repeated-symbol exercise, not their model or outputs. Fixed, noiseless one-to-one substitution is explicitly assumed. |
| Possible encipherer key confusion | `ciphers/mary-stuart-castelnau-letters.html#key-confusion` | [Lasry, Biermann and Tomokiyo (2023)](https://doi.org/10.1080/01611194.2022.2160677), Appendix B, printed pp. 198–200 / PDF pp. 99–101, checked directly. Original transcription and literal decode remain separate from the optional hypothesis. Unknown symbol 9 stays unresolved. |
| Swedish SIGINT operating chain | `ciphers/geheimschreiber.html#daily-codebreaking` | [Wallin (2023)](https://ecp.ep.liu.se/index.php/histocrypt/article/view/707), pp. 1–4, checked directly. Civilian denominator and agency-wide staffing retained; App is apparatus. Attribution is to the paper, not an independent archival investigation. |
| Regular versus shuffled key table | `ciphers/nomenclator.html#key-table-pattern` | [Antal and Mírka (2022)](https://ecp.ep.liu.se/index.php/histocrypt/article/view/387), pp. 3–8, checked directly. Known mappings and token boundaries are disclosed; the fixed message, alphabet and one-code-per-letter selection rule are identical in both tables. No quantified attack claim. |

Implementation: `js/evidence-exercises.js` and `css/evidence-exercises.css`.
The tests independently specify the expected mappings, both ciphertexts and
literal/proposed readings, then exercise the rendered controls, resets and
unresolved-symbol behavior. The existing Mary repeat-symbol activity remains.
The additions do not write into the evidence workbench's record or bundle.

Documentation, page audit notes/hashes and offline cache version are updated.
Collection counts and generated search/artifact metadata are regenerated;
unchanged generated files are not included as artificial changes. The separate
published audit reading pack remains an explicitly dated frozen snapshot.

## Verification

- Focused model and JSDOM interaction checks passed (`node tests/test-evidence-exercises.js`).
- Local Chromium 153 checked all four additions at 390 and 1280 pixels: keyboard activation, disclosure controls, expected outputs, no uncaught page errors or horizontal document overflow. Automated axe checks of each new section reported no WCAG A/AA violations. This is not an assistive-technology certification.
- [Browser check results](page-audit/dot-additions-browser-20261102.json) record the eight page/viewport checks. External requests were blocked during local browser checks; primary-source availability was reviewed separately.
- HTML lint passed for 220 pages; release metadata validation passed.
- Full `npm test` passed, including the engine, corpus, research, links, accessibility, cache freshness and foundation suites. These checks establish bounded
fixture and UI behavior, not historical completeness, decipherment performance,
learning outcomes or a security certification.
