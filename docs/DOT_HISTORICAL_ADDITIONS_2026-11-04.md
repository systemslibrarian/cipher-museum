# Dot historical additions — 4 November 2026

## Scope

These additions implement three historical recommendations from the approved Dot follow-up shortlist. They add source-based evidence cases and one original teaching exercise. They do not claim a new historical decipherment or a faithful reconstruction of undocumented machinery.

| Dot item | Visitor surface | Addition |
| --- | --- | --- |
| CL1441 | `lab/intercept-to-intelligence.html#portuguese-1649` | Portuguese letters of 1649: document handling, corrected catalogue dates, surviving plaintexts and translations, and the limit of an inference from archival silence. |
| CL1339 | `lab/decipherment-cases.html#charles-v` | Charles V’s 1547 letter: failed initial hypotheses, a mixed key, partial recovery, the written 1546 date, and the distinction between reporting an allegation and establishing an event. |
| CL1491 | `ciphers/ika.html` | Exhibit 174 in Hall VII: intercepted IKA traffic, captured M-1 hardware, the American M-1 analogue, and hypotheses about IKA’s physical mechanism. Historical trust label; static exhibit. |

Charles V is included in the page’s opening paragraph, hero/meta description, new section and closing comparison. Root synchronized the page-level summary quoted by the Linear B specialist review packet and recorded that change there; the Linear B case and its historical claims remain unchanged.

## Primary sources and checked passages

### Portuguese letters, 1649

Jörgen Dinnissen and Hugo Araújo, [“Prey to a Privateer. Two Portuguese Ciphertexts from 1649”](https://ecp.ep.liu.se/index.php/histocrypt/article/view/392), HistoCrypt 2022, DOI **10.3384/ecp188392**. [Publisher PDF](https://ecp.ep.liu.se/index.php/histocrypt/article/download/392/350/293).

Checked passages:

- PDF p. 1: the quoted catalogue dates and correction of their months; already surviving plaintexts and translations.
- §2, PDF pp. 3–4: Teles da Silva, the letters of 28 May and 3 June 1649 and their setting. The museum does not identify an author of the encryption.
- §3.1–3.2, PDF pp. 5–6: interrogation on 18 June; report and examination order on 19 June; translations read and copied on 21 June; registration on 23 July; arrival in the Netherlands on 20 September; reply dated 1 October. The 18 June row identifies the interrogation, not an independently established exact capture date.
- References, PDF p. 10: collection and document identifiers for the two ciphertext/key records, Portuguese plaintexts and Dutch translations.
- Appendix 2, note 41, PDF p. 17: Portuguese *forças* and Dutch *fortressen* are different readings to preserve, not an occasion to silently correct the translation.

The paper suggests that the information had no strategic impact, but its documentary discussion also states that the period’s secret minutes have not survived and that deliberations are unknown. The museum makes the narrower claim supported by the described surviving record: the study found no trace of resulting action. An absent mention is not proof that nobody used the information.

The catalogue correction is attributed to entries **quoted in the 2022 paper**. The museum has not checked whether the live archive catalogue has since been corrected. Likewise, the archival references are reported through the study, not represented as independently inspected originals.

### Charles V’s letter, 1547

Cécile Pierrot, Camille Desenclos, Pierrick Gaudry and Paul Zimmermann, [“Deciphering Charles Quint (A diplomatic letter from 1547)”](https://ecp.ep.liu.se/index.php/histocrypt/article/view/704), HistoCrypt 2023, pp. 148–159, DOI **10.3384/ecp195704**. [Author-hosted published PDF](https://members.loria.fr/PZimmermann/papers/Histocrypt_Final.pdf).

Checked passages:

- §2.2 and note 2, PDF p. 2: the letter writes 1546; the study interprets the year as 1547 with the contemporary Easter-start year in view. This is a change of year convention, not a Julian/Gregorian day conversion. The exercise does not modify the historical date.
- §3, PDF pp. 4–8: frequency analysis and unsuccessful guesses; related letters in Besançon with marginal decipherments; reconstruction of a mixed system; comparison with previously reconstructed keys. These sources are not advertised as statistically independent confirmations.
- The reconstructed key and discussion: letter values, consonant–vowel units, doubled consonants, nomenclature and nulls. Some nomenclator values are contextual guesses; the nomenclator shown is limited to the letter under discussion.
- §4, PDF p. 9: Charles’s report of an assassination rumour and Saint-Mauris’s reply of 6 March 1547, which calls it a rumour. The source establishes that the allegation was reported, not that the alleged plot occurred.

A later edition by the same researchers, [*Édition d’une lettre chiffrée de Charles Quint à Jean de Saint-Mauris (1547)*](https://hal.science/hal-05269981v2), appeared in 2025. Its existence and bibliographic identity were checked on [Paul Zimmermann’s publication list](https://members.loria.fr/PZimmermann/papers/) and the authors’ HAL profiles. The HAL full text was blocked by its access gateway during this work. It is linked as further reading; no claim about its full contents or about what remains unresolved in 2026 is made. The museum explicitly dates its process account to the 2023 study.

### IKA

Chris Christensen, [“The Imperial Japanese Navy IKA Cipher Machine”](https://ecp.ep.liu.se/index.php/histocrypt/article/view/155), HistoCrypt 2021, DOI **10.3384/ecp183155**. [Publisher PDF](https://ecp.ep.liu.se/index.php/histocrypt/article/download/155/111/54).

Checked passages:

- §2–4, PDF pp. 2–6: the 49-symbol kana system and its 42/7 split, the reconstructed cryptographic behavior, and the absence of a physical machine seen or captured by US Navy codebreakers. The report used primarily is the April 1946 *RIP 28A*.
- §5–7, PDF pp. 6–9: possible mechanisms are not authenticated constructions. Figure 2 on PDF p. 7 is captured **M-1** hardware. Figure 3 on PDF p. 8 is **Holtwick’s American M-1 analogue**. The paper uses Holtwick’s later account to reject occasional identification of the analogue as IKA.
- Appendix A, PDF p. 10: late 1931/early 1932 to July 1933 are US intercept dates. They do not identify IKA’s invention date.
- §4 and conclusion: the historical attack records were unavailable in the cited accounts. This is not a basis for presenting a modern solver’s procedure as the original attack.

The exhibit dates these evidence limits to the 2021 study. It does not assert that every later discovery or present-day collection was checked. No source photograph is reproduced, and no image of M-1 or the American analogue is substituted for an authenticated IKA artifact. Reproducing a cipher’s input/output behavior would not identify a unique physical implementation, so this exhibit does not offer a purportedly faithful machine simulator.

## Original Charles V teaching fixture

`js/charles-v-case.js` contains a deliberately small original fixture. Its labels, mappings and readings are invented and visibly identified as such. It illustrates evidence handling rather than reproducing the historical cipher or its diacritic rules.

1. Fragment A gives the span `g1 g2` → `GOTO`. Two tokens producing four characters contradict any model requiring exactly one letter per token. The length alone does not choose `G|OTO`, `GO|TO` or `GOT|O`.
2. A separately supplied annotated key gives `g1→GO`, `g2→TO`, `g3→GATE` (word code) and `g4→empty` (typed null). It supplies no value for `g5`. The literal message reads `GOTOGATE[g5]`; the unknown marker and absence of inserted spaces are intentional.
3. Check copy B gives `g2 g4 g1` → `TOGO`. The supplied partial key matches. Deliberately changing `g4` to `E` produces `TOEGO` and fails. The check copy is fixed in the fixture, not generated from the visitor’s candidate.

All comparisons are computed from token arrays, candidate entries and independently stored readings. A partial reading cannot pass merely because the expected string contains an identical unknown marker. Unknown entries are distinct from typed nulls. Changing a candidate marks its previous result as needing a new check; the previous record remains. Restart closes the staged clues and resets choices without deleting failed attempts. The record lasts only for the current page session.

The fixture contains no source images, copied historical plaintext or personal data. It uses the existing research-page styles and only browser-local state.

## Validation

- `node tests/test-dot-historical-additions.js`: **22 focused checks passed**. These cover both successful and failed model/key checks, alternate data that changes the verdict, unknown/null handling, prerequisite controls, idempotent mounting, labels, record retention and historical evidence boundaries.
- Five in-memory negative controls confirm that the historical guards reject: replacing the original 1546 year with 1547; turning archival silence into proof of no use; confusing receipt and dispatch dates; relabelling the captured M-1 photograph as IKA; and promoting a proposed IKA mechanism to authenticated hardware.
- `npx htmlhint ciphers/ika.html lab/decipherment-cases.html lab/intercept-to-intelligence.html`: **three pages passed**.
- `git diff --check` for the owned additions: **passed**.

The root integration owns catalogue/count generation, the static-page allowlists, search, sitemap, cache assets, the shared test runner, the current audit export and the full-suite/browser checks. This note records the focused checks, not a separate claim that those integration checks have already run.
