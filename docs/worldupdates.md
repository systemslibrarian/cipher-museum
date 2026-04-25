# Round 3 World Updates Checklist

Generated 2026-04-24 by Opus for systemslibrarian/cipher-museum Round 3.
Updated after every commit. Source of truth for completion status.

## Progress summary
- Overall: 106 done / 171 total (62.0%)
- Phase 0 (plan): 4/4
- Phase 0.5 (shipped audit): 6/6
- Phase 1 (Hall I expansion): 9/10
- Phase 2 (Hall XII creation): 16/26
- Phase 3 (Pacific theater): 2/3
- Phase 4 (WWII/interwar machines): 6/9
- Phase 5 (European gaps): 7/10
- Phase 6 (East Asia/global): 0/4
- Phase 7 (Americana/cultural): 3/4
- Phase 8 (global underground traditions): 0/10
- Phase 9 (Hall XIII creation + cultural): 5/14
- Phase 10 (generic techniques - 2 new + 3 upgrades): 1/5
- Phase 11 (context + Kerckhoffs + hall XI upgrades): 0/10
- Phase 12 (bios - ~7 new + Hall X audit upgrades): 0/15
- Phase 13 (global integration): 7/40
- Phase 15 (artifact cards): 8/8
- Phase 16 (research/catalog mode - audit-gated): 0/6
- Phase 17 (cipher detective): 9/9
- Phase 18 (deploy): 7/24

### Log
- 2026-04-24: Phase 0 + 0.5 complete; Hall I renamed.
- 2026-04-24: Engines kamaSutra + aeneasTacticus added; demo CONFIGS for kama-sutra/aeneas-tacticus/arabic-nomenclators registered.
- 2026-04-24: Created Hall I exhibits: kama-sutra.html, aeneas-tacticus.html, arabic-nomenclators.html.
- 2026-04-24: Reconciliation pass: confirmed many Round 3 exhibits already shipped on disk. Checklist updated to match disk reality. Test fixes: ENGINE_PROFILES filled for affine/jn25/redTypeA; cipher pages count target raised from 82 to 84. All 6 test suites green.
- 2026-04-24: Phase 5/7/10 batch — added 7 engines (affine, trithemius, cardanoAutokey, wheatstone, morse, cardanoGrille, nullCipher) with full ENGINE_PROFILES + SOURCES wiring; built 7 exhibit pages (affine.html, trithemius.html, cardano-autokey.html, wheatstone.html, morse.html, cardano-grille.html, null-cipher.html) via scripts/build-phase5-pages.py. All 6 test suites green (564 + 387 + 238 + 1210 + 366 + 406 = 3,171 assertions). Cipher-pages count target 84 → 91.
- 2026-04-24: Phase 4 WWII/Cold-War machines batch — added 5 engines (fialka, kl7, geheimschreiber, kryha, m94) with full ENGINE_PROFILES + SOURCES wiring; built 5 exhibit pages (fialka.html, kl-7.html, geheimschreiber.html, kryha.html, m-94.html) via scripts/build-phase4-pages.py. Geheimschreiber engine rewritten from Baudot 5-bit XOR to mod-26 letter-index arithmetic (5 additive wheels + 5 perm-selector wheels picking among 6 keyed permutations) to guarantee round-trip while preserving the T52 educational story. All 6 test suites green (604 + 392 + 238 + 1260 + 381 + 436 = 3,311 assertions). Cipher-pages count target 91 → 96.
- 2026-04-24: Phase 6 East Asia & Telegraphy batch — added 4 engines (chineseTelegraph, zimmermann, slidex, commercialCode) with full ENGINE_PROFILES + SOURCES wiring; built 4 exhibit pages (chinese-telegraph.html, zimmermann.html, slidex.html, commercial-codebooks.html) via scripts/build-phase6-pages.py. Slidex uses roundtrip-padded mode (X-padding for odd-length plaintext, standard convention). Zimmermann + commercial-codebooks share a deterministic codebook architecture: fixed wordlist with 5-digit / 5-letter codewords plus literal-fallback sentinel for out-of-list words. All 6 test suites green (636 + 396 + 238 + 1300 + 393 + 460 = 3,423 assertions across 130 cipher pages). Cipher-pages count target 96 → 100.
- 2026-04-24: Phase 7 Americana batch — added 2 Revolutionary War engines (culperRing, arnoldAndre) with full ENGINE_PROFILES + SOURCES wiring; built 2 exhibit pages (culper-ring.html, arnold-andre.html) via scripts/build-phase7-pages.py. Culper Ring uses a 200-entry stable codebook (indexed from 100) with 800-range per-letter literal fallback; Arnold-Andre uses a 240-word “book” as page.line.word triples (12 pages × 5 lines × 4 words) with reserved pages 13/14/15 for sentinel + per-letter literal mode. All 6 test suites green (652 + 398 + 238 + 1320 + 399 + 472 = 3,479 assertions across 132 cipher pages). Cipher-pages count target 100 → 102.
- 2026-04-24: Phase 5 stragglers batch (European classical engines) — added 2 engines (argenti, wallisCiphers) with full ENGINE_PROFILES + SOURCES wiring; built 2 exhibit pages (argenti.html, wallis-ciphers.html) via scripts/build-phase5b-pages.py. Argenti uses keyed 2-homophones-per-letter (codes 10–89) with alternating-pick on repeat use — the central Argenti defence against frequency analysis. Wallis combines a 60-word English Civil War nomenclator (3-digit codes from 100) with a keyed 2-digit homophonic alphabet bracketed by sentinels 90/91. Both pages live in Hall II (Classical Substitution) and round-trip cleanly. All 6 test suites green (668 + 400 + 238 + 1340 + 405 + 484 = 3,535 assertions across 134 cipher pages). Cipher-pages count target 102 → 104.
- 2026-04-25: Regression sweep and checkpoint push — restored missing `demo-loader.js` includes on `mary-stuart-castelnau-letters.html` and `patterson-jefferson-cipher.html`; all 6 suites green locally (435 + 238 + 717 + 1710 + 516 + 552 assertions). Added `tests/run-all.js` so `npm test` works again. Added explicit Cipher Detective coverage to comprehensive/demo tests and wired cross-links from `cryptanalysis.html`, `lab/workbench.html`, and `learn.html`.

## Phase 0 - Plan and scaffold
- [x] docs/round3-plan.md created
- [x] docs/worldupdates.md created (this file)
- [x] Slug reservations confirmed, no conflicts
- [x] Hall numbering confirmed: I-X unchanged, XI = Modern Cryptography (shipped), XII = Unsolved (new), XIII = Culture (new)

## Phase 0.5 - Shipped vs Round 3 audit
- [x] README.md read end-to-end; current 63-exhibit / 11-hall / 21-bio state confirmed
- [x] docs/round3-shipped-audit.md created
- [x] Every Round 3 exhibit classified: SHIPPED / THIN / NEW
- [x] Hall X biography audit complete; skip-list recorded
- [x] Thin-upgrade checklist produced per exhibit needing upgrade
- [x] worldupdates.md updated with [SKIP] and [UPGRADE] annotations

## Phase 1 - Hall I expansion to World Origins
- [x] halls/ancient.html renamed/updated to World Origins of Cryptography
- [x] Exhibit: Kama Sutra Cipher - spec, engine, page, tests, registered
- [x] Exhibit: Egyptian Substitution - spec, page, Track B visualization
- [x] Exhibit: Aeneas Tacticus - spec, engine, page, tests, registered
- [x] Exhibit: Arabic Nomenclators - spec, engine, page, tests, registered
- [x] Exhibit: Rosetta Stone - spec, page, Track B trilingual viewer + timeline
- [x] Exhibit: Histiaeus's Tattooed Messenger - spec, page, Track B concealment-demonstration visualization
- [x] Hall I prev/next chains updated (no prev as first hall, next->Hall II)
- [x] Hall I sidebar reflects 11 exhibits
- [UPGRADE-DONE] Shipped ciphers/scytale.html with Tomokiyo revisionist sidebar
- [ ] Additional polish pass on Hall I cards (deferred)

## Phase 2 - Hall XII creation: Unsolved Ciphers
- [x] halls/unsolved.html created
- [x] Voynich moved to Hall XII (breadcrumb updated)
- [x] Kryptos moved to Hall XII (breadcrumb updated)
- [x] Beale Ciphers moved to Hall XII (breadcrumb updated)
- [x] Kryptos 2025 expansion: Full Installation panel
- [x] Kryptos 2025 expansion: 1,735 letters panel (CIA cite)
- [x] Kryptos 2025 expansion: K0 Morse panels with decoded fragments
- [x] Kryptos 2025 expansion: Scheidt partnership panel
- [x] Kryptos 2025 expansion: Bauer/Link/Molle Hill conjecture panel
- [x] Kryptos 2025 expansion: K4 clues released over time timeline
- [x] Kryptos 2025 expansion: WESTXLAYERTWO Passage 2 correction panel
- [x] Kryptos 2025 expansion: 2025 Sale and Seal panel
- [x] Kryptos 2025 expansion: Sanborn other sculptures (Cyrillic Projector, Antipodes)
- [x] Kryptos 2025 expansion: popular culture cross-link panel
- [x] Kryptos interactive: K0 Morse decoder (Web Audio playback)
- [x] Kryptos interactive: K4 clue visualizer
- [x] Kryptos interactive: Installation map (SVG aerial-view)
- [x] Kryptos cross-links to Hill, Vigenere, Transposition, Morse, etc.
- [x] Kryptos 2025 references cited (CIA, WaPo, NYT, RR Auction, Dunin)
- [x] Dorabella moved to Hall XII
- [x] Exhibit: Shugborough - page + Track B visualization
- [x] Exhibit: D'Agapeyeff - page + Track B visualization
- [x] Exhibit: Somerton Man - page + Track B visualization
- [x] Exhibit: McCormick - page + Track B visualization
- [x] Exhibit: Phaistos Disc - page + Track B spiral viewer + glyph catalog
- [x] Zodiac Z-13/Z-32 side panel added
- [x] Hall VIII framing updated (unsolved rhetoric removed)
- [x] Hall XII prev/next correctly set (prev XI, next XIII)

## Phase 3 - Japanese & Pacific Theater
- [x] Exhibit: JN-25 - spec, engine, page, tests, registered
- [x] Exhibit: Red (Type A) - spec, engine, page, tests, registered
- [ ] Code Talkers expansion (Choctaw/Comanche/Hopi panel on Navajo page)

## Phase 4 - WWII / Interwar machines
- [x] Exhibit: Fialka M-125 - spec, engine, page, tests, registered
- [x] Exhibit: KL-7 - spec, engine, page, tests, registered
- [SKIP - already shipped] SIGABA new-build request
- [SKIP - already shipped] Typex new-build request
- [x] Exhibit: Geheimschreiber (T52) - spec, engine, page, tests, registered
- [x] Exhibit: Kryha - spec, engine, page, tests, registered
- [x] Exhibit: Bazeries Cylinder - spec, engine, page, tests, registered
- [x] Exhibit: M-94 / M-138-A - spec, engine, page, tests, registered
- [ ] Fish-family side panel on Geheimschreiber page

## Phase 5 - Missing European classical and polyalphabetic gaps
- [x] Exhibit: Trithemius - engine, page, tests, registered
- [x] Exhibit: Cardano Autokey - engine, page, tests, registered
- [x] Exhibit: Affine - engine, page, tests, registered
- [x] Exhibit: Wheatstone Cryptograph - engine, page, tests, registered
- [x] Exhibit: Argenti Family - spec, engine, page, tests, registered
- [x] Exhibit: Wallis Ciphers - spec, engine, page, tests, registered
- [x] Exhibit: Morse Code - engine, page, tests, registered (audio Track B deferred)
- [ ] Morse side panels: Voyager Golden Record + Morse+Cipher Combination
- [x] Exhibit: Mary Stuart Castelnau Letters - spec, page, Track B viewer
- [x] Exhibit: Patterson Cipher for Jefferson - spec, page, Track B viewer

## Phase 6 - East Asia, South America, and global telegraphy
- [x] Exhibit: Chinese Telegraph Code - spec, engine, page, tests, registered
- [x] Exhibit: Zimmermann Telegram - spec, engine, page, tests, registered
- [x] Exhibit: Slidex - spec, engine, page, tests, registered
- [x] Exhibit: Commercial Telegraph Codebooks - spec, engine, page, tests, registered

## Phase 7 - Americana and cultural additions
- [ ] Exhibit: Culper Ring / Tallmadge - spec, engine, page, tests, registered
- [ ] Exhibit: Arnold-Andre - spec, engine, page, tests, registered
- [x] Exhibit: Cardano Grille - engine, page, tests, registered
- [ ] Hall VI rename decision (if warranted) confirmed

## Phase 8 - Additional global and underground traditions
- [ ] Exhibit: Field Hollers / Spirituals - spec, page, Track B audio visualization
- [ ] Exhibit: Che Guevara's VIC Variant - spec, engine, page, tests, registered
- [ ] Exhibit: IRA Book Cipher - spec, engine, page, tests, registered
- [ ] Exhibit: Red Army Faction OTP Operations - spec, page (OTP engine reuse)
- [ ] Exhibit: Vietnamese Underground Codes - spec, engine, page, tests, registered
- [ ] Exhibit: Joseon Yeokhak Diagrams - spec, engine, page, tests, registered
- [ ] Exhibit: Ethiopian Ge'ez Monastic Ciphers - spec, engine, page, tests, registered
- [ ] Exhibit: Latin American Telegraphic Codebooks - spec, engine, page, tests, registered
- [ ] Exhibit: Diana Cryptosystem - spec, engine, page, tests, registered
- [ ] Cambridge Five side panel added to VENONA biography context

## Phase 9 - Hall XIII creation: Ciphers in Culture
- [x] halls/culture.html created with cultural framing
- [x] Gold-Bug moved to Hall XIII
- [x] Dancing Men moved to Hall XIII
- [ ] Exhibit: Da Vinci Code - spec, engine, page, tests, registered
- [ ] Exhibit: National Treasure - spec, engine, page, tests, registered
- [ ] Exhibit: Gravity Falls Cipher System - spec, engine, page, tests, registered
- [x] Exhibit: Cicada 3301 - spec, engines, page, tests, registered
- [ ] Exhibit: Popular Culture Survey - spec, filterable page
- [ ] Cross-reference side panels (Atbash/Caesar/Affine) added
- [ ] Gold-Bug side panel added
- [ ] Enigma side panel: Three Unbroken Messages
- [ ] Enigma side panel: Operation Boniface
- [x] Hall VIII sidebar/card count updated after moves
- [x] Hall XIII prev link set (XII), no next link

## Phase 10 - Generic-technique exhibits
- [SKIP - already shipped] Nomenclator-generic
- [SKIP - already shipped] Book-cipher-generic
- [SKIP - already shipped] Autokey-generic
- [x] Exhibit: Null Cipher-generic - engine, page, tests, registered
- [ ] Exhibit: Microdot Steganography - spec, engine, page, tests, registered

## Phase 11 - Context / situation + modern cryptography foundations
- [ ] Exhibit: Cabinet Noir - page + map of black chambers
- [ ] Exhibit: Station HYPO - page + annotated floor plan
- [ ] Exhibit: Bletchley Park - page + pannable hut map
- [ ] Exhibit: Kerckhoffs's Principle - page + Track B explainer
- [UPGRADE - shipped baseline] Diffie-Hellman page enhanced to Round 3 spec
- [UPGRADE - shipped baseline] RSA page enhanced to Round 3 spec
- [UPGRADE - shipped baseline] AES page enhanced to Round 3 spec
- [SKIP - already shipped] DES new-build request
- [SKIP - already shipped] SHA-256 new-build request
- [ ] Exhibit: VENONA - spec, page, attack demo + side panels
- [ ] Exhibit: SIGSALY - spec, page, Track B visualization

## Phase 12 - Codebreaker biographies (Hall X expansion)
- [x] Phase 0.5 bio audit complete; skip-list written to docs/round3-shipped-audit.md
- [ ] Bio: Joseph Rochefort
- [ ] Bio: Arne Beurling
- [ ] Bio: Dilly Knox
- [ ] Bio: Herbert Yardley
- [SKIP - already shipped] Joan Clarke
- [ ] Bio: Mavis Batey
- [SKIP - already shipped] Elizebeth Smith Friedman
- [SKIP - already shipped] Leo Marks
- [SKIP - already shipped] Agnes Meyer Driscoll
- [ ] Bio: GCHQ Trio (Ellis, Cocks, Williamson)
- [SKIP - already shipped] Bill Tutte (solo panel exists)
- [ ] Bio: David Kahn
- [ ] Bio: Elonka Dunin
- [ ] Bio: George Lasry
- [ ] Hall X hero subtitle updated

## Phase 13 - Global integration
- [ ] museum-map.html complete cipher index updated with all new exhibits
- [x] museum-map.html Hall XII and Hall XIII added to floor-plan graphic
- [x] museum-map.html subtitle and footer count updated
- [ ] timeline.html year markers added for every new exhibit
- [ ] timeline.html new era anchors added (Egyptian, India, Phaistos, Histiaeus)
- [ ] timeline.html six-stage evolution strip preserved
- [ ] comparison.html data updated with all new rows
- [ ] comparison.html total count in header updated
- [ ] cipher-flow.html family map updated with new families
- [ ] search.html search index rebuilt for all new items
- [ ] tours/ optional new Hall XII/Hall XIII themed tour
- [x] index.html hero counts updated (about 113 ciphers, 13 halls)
- [ ] index.html featured ciphers refreshed (include Hall XII and Hall XIII)
- [ ] index.html playground dropdown updated for new simple ciphers
- [ ] index.html footer version bumped to v3.0.0 Global Expansion
- [x] README.md hall table regenerated with Hall XII and Hall XIII
- [x] README.md count references updated (63->about 113, 11->13)
- [ ] README.md demo roster expanded with new Track A exhibits
- [x] sitemap.xml all new URLs added
- [ ] learn.html cross-links to new exhibits added (if page remains in scope)
- [ ] cryptanalysis.html techniques extended if introduced
- [ ] All hall pages updated from Hall X of Y to of 13
- [ ] Hall prev/next chains fixed for XII and XIII insertion
- [ ] 404.html and glossary.html stale counts updated
- [ ] Workbench header engine count updated
- [ ] Hall XII hero copy includes living-research framing with named researchers
- [ ] Cryptiana bibliographic enrichments applied to listed exhibits
- [ ] M-209 sidebar added (Hagelin family + Rubicon note)
- [ ] Playfair sidebar added (Wheatstone vs Playfair)
- [ ] Nihilist sidebar added (two nihilist ciphers)
- [ ] Columnar sidebar added (route/myszkowski/nihilist variants)
- [ ] Straddling checkerboard sidebar added (family lineage)
- [ ] Jefferson disk sidebar added (wheel-cipher lineage)
- [ ] Hall V comparative tactical systems table added
- [ ] Hall V appendix on modern tactical authentication added
- [ ] further-reading.html created with canon/scholar/source index
- [ ] further-reading.html linked from nav, museum-map, glossary, README
- [ ] Identity statement standardized across README/home/repo description

## Phase 15 - Artifact Card standardization
- [x] data/artifact-cards.json created with final schema
- [x] Card renderer added (demo-loader extension or companion module)
- [x] All 63 existing exhibits have artifact-card entries
- [x] All new Round 3 exhibits have artifact-card entries
- [x] Artifact-card hook added to all exhibit pages
- [x] Card styling matches museum aesthetic, mobile, and accessibility goals
- [x] test-comprehensive.js validates card completeness
- [x] test-demo-pages.js verifies card render on every exhibit page

## Phase 16 - Research / Catalog Mode (audit-gated)
- [ ] Audit of comparison.html, search.html, cipher-flow.html completed
- [ ] Decision recorded in docs/round3-shipped-audit.md (skip / upgrade / build)
- [ ] If UPGRADE: new filter dimensions added to comparison.html
- [ ] If BUILD: catalog.html created with round spec
- [ ] Global nav updated with catalog/research link
- [ ] Mobile-responsive and accessible with no backend

## Phase 17 - Cipher Detective
- [x] cipher-detective.html created
- [x] Analyses implemented: inventory, IoC, Kasiski, chi-square, charset, shape, period
- [x] Family scoring implemented across at least 8 families
- [x] Evidence panels show 3-5 candidates with confidence language
- [x] Limitations section included
- [x] Cross-links to exhibits, cryptanalysis.html, and workbench
- [x] Added to global nav and cryptanalysis/workbench (and learn.html if in scope)
- [x] test-comprehensive.js validates known sample identification
- [x] test-demo-pages.js verifies page render and input handling

## Phase 18 - Deploy and verify
- [x] All six test suites pass locally
- [x] test-demo-pages.js passes for every new exhibit page
- [x] test-comprehensive.js validates artifact-card completeness
- [x] test-comprehensive.js validates Cipher Detective sample identification
- [ ] Every Track A engine works in Workbench
- [ ] Every Track A Try It Yourself block produces output via demo-loader
- [ ] Every Track A Break This Cipher reveal works
- [ ] Every Track B visualization renders
- [x] Every exhibit page shows Artifact Card at top
- [ ] Catalog/research mode page works with all filters
- [x] Cipher Detective page loads and returns evidence-based candidates
- [ ] Local server spot-check: 5 Track A, 5 Track B, 5 bios
- [x] Changes pushed to main
- [ ] Live verification: homepage counts correct
- [ ] Live verification: museum-map shows Hall XII and Hall XIII
- [ ] Live verification: halls/unsolved.html renders
- [ ] Live verification: halls/culture.html renders
- [ ] Live verification: halls/ancient.html shows World Origins
- [ ] Live verification: halls/modern-crypto.html still shows DES/DH/RSA/AES/SHA-256 + Kerckhoffs
- [ ] Live verification: 5 random new exhibits work and show artifact cards
- [ ] Live verification: Workbench shows new engines
- [ ] Live verification: Cipher Detective works on live site
- [ ] Live verification: further-reading.html loads and external links work
- [ ] worldupdates.md final status reaches 100%

## Blockers and deferrals
- None currently.

## Log of significant events
- 2026-04-24 - Round 3 build started.
- 2026-04-24 - Phase 0 complete: plan/checklist created, hall numbering and slug reservations confirmed.
- 2026-04-24 - Phase 0.5 complete: shipped audit produced with SKIP/UPGRADE/BUILD tables.
- 2026-04-24 - Phase 1a started: halls/ancient.html updated to World Origins framing.
- 2026-04-24 - Reconciliation: 28 items audited as already complete on disk; checklist updated. Tests green (2,980 assertions across 6 suites after fixing affine/jn25/redTypeA profiles and 84-page count).
- 2026-04-25 - Phase 15 complete: generated data/artifact-cards.json + js/artifact-cards-data.js (139 entries), added js/artifact-cards.js renderer and nav auto-wiring, added responsive card styles, and added artifact-card checks to comprehensive/demo suites. Full run green (435 + 238 + 1836 + 1710 + 516 + 783 assertions).
