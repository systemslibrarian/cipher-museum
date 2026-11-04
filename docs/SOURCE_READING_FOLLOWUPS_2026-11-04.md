# Source and reading follow-ups — 4 November 2026

This editorial follow-up starts from merged PR #52 (671d1704e2ec068a4843a1964551680fea6c162d). It preserves the PR #51/#52 exhibits, recovery experiment, catalogue corrections and book positioning. No ebook manuscript, solver or existing experimental result is changed. A separate crossed-key/search-seed follow-up is added under data/research/profile-recovery-v2; its protocol and complete results have their own README.

## Grotjan and Rowlett

Removed the unverified quotation attributed to Rowlett from `halls/codebreakers.html` and `ciphers/purple.html`. Failure to locate a quotation does not prove that he never said it. The replacement is a bounded paraphrase with direct sources, not a new quotation.

- Michael E. Bigelow, INSCOM Command Historian, [SIS Makes Breakthrough Against Japanese Code](https://www.dvidshub.net/news/printable/454045), dated 20 September 2023: repeated sequences in messages involving the larger twenty-letter group; breakthrough on 20 September 1940; two complete deciphered messages on 27 September. This supports a crucial entry into a continuing reconstruction, not instantaneous recovery of the complete wiring.
- Theodore M. Hannah, [Frank B. Rowlett: A Personal Profile](https://www.nsa.gov/portals/75/documents/news-features/declassified-documents/cryptologic-spectrum/frank_rowlett.pdf#page=2), printed p. 5 / PDF p. 2: Rowlett's first-person recollection of the worksheets and the team's reaction. This profile is not his later memoir and is not used to settle the memoir's date discrepancy.
- Retained the existing warning that *The Story of Magic* recalls the day as shortly before Labor Day, unlike the 20 September date used by the Army historian and *Code Girls*.

The wording no longer calls the twenty-letter group a consonant alphabet, says the alignment revealed the wiring, or labels the discovery the single break.

## Seven title-only concept trails

Added three original museum questions per book, using existing exhibits and verified local routes. These are curatorial concept connections, not claims that particular passages or exercises have been reproduced. No new chapter/page mappings, private copies, ebook downloads or source-book text were added. The section introduction now distinguishes the four older chapter-pinned routes from title-only routes.

Bibliographic and topical checks:

- **Tuchman, The Zimmermann Telegram:** [official publisher record](https://www.penguinrandomhouse.com/books/180859/the-zimmermann-telegram-by-barbara-w-tuchman/) verifies the Random House 1985 paperback. The route names that edition rather than implying this page verifies the original 1958 imprint. Historical 1917 material is separated from invented teaching examples and Second World War laboratories.
- **Sinkov, Elementary Cryptanalysis: A Mathematical Approach:** [MAA/Cambridge contents record](https://www.cambridge.org/core/books/abs/elementary-cryptanalysis/contents/4F67675E88F82CEE9B64B3D79D1931EE) identifies revision by Todd Feil, 2009, and the second-edition preface. The contents support substitution, polygraphic systems, transposition, RSA and one-time-pad topics. This is a title-level route, not a new detailed chapter alignment.
- **Singh, The Code Book: The Secrets Behind Codebreaking:** [official publisher record](https://www.penguinrandomhouse.com/books/168003/the-code-book-the-secrets-behind-codebreaking-by-simon-singh/) identifies the young-adult adaptation, Ember paperback, 2003, and Caesar/Enigma coverage. Kept distinct from the adult edition already listed.
- **Beutelspacher, Cryptology:** the [Cambridge-hosted Mathematical Gazette review listing](https://www.cambridge.org/core/journals/mathematical-gazette/issue/5309FA1A307B8C7167DC7D39A45E65D1?pageNum=6) verifies author, MAA and 1994. The companion route is conceptual and is not represented as passage-verified. The older MAA FOCUS PDF could not be fetched in this check; it is not the sole provenance.
- **Wrixon, Codes, Ciphers & Other Cryptic & Clandestine Communication:** Google Books bibliographic record `um4sAAAAYAAJ`, ISBN 9781579120405, verifies author and 1998; its indexed subject terms include codebook, Morse, null ciphers and concealment. Imprints differ across catalogue records, so the trail states title/year only. The previously suggested NSA catalogue URL returned 404 during recheck. No link to a book copy is exposed in the trail.
- **Goldreich, Foundations of Cryptography:** [author's overview](https://www.wisdom.weizmann.ac.il/~oded/foc-book.html) verifies the two published volumes (2001 and 2004), one-way functions, zero knowledge and the role of reductions. The route explicitly does not implement the constructions or replace the proofs.
- **Stephenson, Cryptonomicon:** [Schneier's Solitaire specification](https://www.schneier.com/academic/solitaire/) identifies the algorithm's appearance in the novel and its 1999 version. The route labels the book fiction and Solitaire an educational historical algorithm, not recommended protection for real secrets.

## Validation scope

The reading-trails tests check all 91 internal links and fragments in the section, editions, picker reachability, seven title-only disclosures, and explicit adaptation/security limits. Mutation tests reject invented chapter references, missing navigation and unsafe scope changes. Editorial tests reject the unsupported quotation and wiring overclaim and require the direct sources. Existing date-discrepancy regressions remain in place.

Browser and aggregate checks are reported in the pull request. An audit export is regenerated from the committed source snapshot; it is a reading export, not a certification of the site's historical claims.

## Audit disposition

The repository's existing `audit/` remains the explicitly frozen PR #52 snapshot. It is not relabeled as covering this follow-up. A separate complete 228-page audit ZIP is generated against this follow-up's exact published source commit and delivered separately, with its manifest, source identity and ZIP checksum. Large inline repository-upload limits do not change its contents or substitute another snapshot. The updated exporter includes the losslessly decompressed full v2 result log and all frozen inputs. The distributed compressed log reconstructs the exact original JSONL bytes and is checked before metrics are assessed.
