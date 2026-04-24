# Round 3 World Updates Checklist

Generated 2026-04-24 by Opus for systemslibrarian/cipher-museum Round 3.
Updated after every commit. Source of truth for completion status.

## Progress summary
- Overall: 45 done / 171 total (26.3%)
- Phase 0 (plan): 4/4
- Phase 0.5 (shipped audit): 6/6
- Phase 1 (Hall I expansion): 10/10
- Phase 2 (Hall XII creation): 10/26
- Phase 3 (Pacific theater): 3/3
- Phase 4 (WWII/interwar machines): 0/9
- Phase 5 (European gaps): 0/10
- Phase 6 (East Asia/global): 0/4
- Phase 7 (Americana/cultural): 0/4
- Phase 8 (global underground traditions): 0/10
- Phase 9 (Hall XIII creation + cultural): 3/14
- Phase 10 (generic techniques - 2 new + 3 upgrades): 0/5
- Phase 11 (context + Kerckhoffs + hall XI upgrades): 0/10
- Phase 12 (bios - ~7 new + Hall X audit upgrades): 0/15
- Phase 13 (global integration): 7/40
- Phase 15 (artifact cards): 0/8
- Phase 16 (research/catalog mode - audit-gated): 0/6
- Phase 17 (cipher detective): 0/9
- Phase 18 (deploy): 0/24

### Log
- 2026-04-24: Phase 0 + 0.5 complete; Hall I renamed.
- 2026-04-24: Engines kamaSutra + aeneasTacticus added; demo CONFIGS for kama-sutra/aeneas-tacticus/arabic-nomenclators registered. Test page-count target raised to 69; HAND_BUILT extended with 3 Track B slugs. ENGINE_PROFILES filled in for previously-unregistered autokey/nomenclator/bookCipher/sigaba/typex/kamaSutra/aeneasTacticus.
- 2026-04-24: Created Hall I exhibits: kama-sutra.html, aeneas-tacticus.html, arabic-nomenclators.html.
- 2026-04-24: Continued Phase 1: Hall I gallery/footer now reflects 11 exhibits; added references panels for egyptian-substitution/rosetta-stone/histiaeus-tattoo; updated Hall I prev/next chain across atbash -> kama-sutra -> aeneas -> arabic -> egyptian -> rosetta -> histiaeus -> scytale -> caesar -> polybius -> atbash.
- 2026-04-24: Completed Phase 1: added Rosetta decipherment timeline visualization and Scytale historiography sidebar on the traditional vs revisionist reading.
- 2026-04-24: Continued Phase 2 cleanup: Hall VIII no longer presents Hall XII exhibits as novelty ciphers; verified Hall XII navigation now points back to Hall XI and forward to Hall XIII.
- 2026-04-24: Began Kryptos 2025 expansion work: moved exhibit framing into Hall XII, added K0 Morse decoder, K4 clue visualizer, installation map, and new installation/history panels. Expansion pack not yet complete.
- 2026-04-24: Completed Kryptos 2025 expansion pack with Hall XII framing, K0/K4/map interactives, expanded historiography, 2025 auction context, and long-tail solver lore panels.
- 2026-04-24: Added the Zodiac Z-13/Z-32 side panel and corrected Hall VIII labeling drift on the Zodiac exhibit page.
- 2026-04-24: Refined Dorabella as a complete Hall XII exhibit: restored global nav/footer, fixed hall sequencing, and added a dedicated Track B symbol-inspector visualization.
- 2026-04-24: Started Phase 3 with JN-25: added engine (jn25), demo-loader config + sources, new exhibit page, and coverage in engine/comprehensive tests.
- 2026-04-24: Completed remaining Phase 3 items: added Red Type A (engine + demo wiring + exhibit page + tests), linked Hall VII navigation around the new page, and expanded Navajo with Choctaw/Comanche/Hopi context plus postwar Japanese admission framing.

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
- [x] Hall I prev/next chains updated
- [x] Hall I sidebar reflects 11 exhibits
- [x] Shipped ciphers/scytale.html upgraded with revisionist sidebar

## Phase 2 - Hall XII creation: Unsolved Ciphers
- [x] halls/unsolved.html created
- [UPGRADE] Voynich moved to Hall XII (breadcrumb updated)
- [UPGRADE] Kryptos moved to Hall XII (breadcrumb updated)
- [UPGRADE] Beale Ciphers moved to Hall XII (breadcrumb updated)
- [x] Kryptos 2025 expansion pack content + interactions complete
- [UPGRADE] Dorabella moved to Hall XII
- [x] Exhibit: Shugborough - page + Track B visualization
- [x] Exhibit: D'Agapeyeff - page + Track B visualization
- [x] Exhibit: Somerton Man - page + Track B visualization
- [x] Exhibit: McCormick - page + Track B visualization
- [x] Exhibit: Phaistos Disc - page + Track B spiral viewer + glyph catalog
- [x] Zodiac Z-13/Z-32 side panel added to existing Zodiac exhibit
- [x] Hall VIII framing updated (unsolved rhetoric removed)
- [x] Hall XII prev/next correctly set (prev XI, next XIII)

## Phase 3 - Japanese & Pacific Theater
- [x] Exhibit: JN-25 - spec, engine, page, tests, registered
- [x] Exhibit: Red (Type A) - spec, engine, page, tests, registered
- [x] Navajo page expanded with Choctaw/Comanche/Hopi panel

## Phase 4 - WWII / Interwar machines
- [ ] Exhibit: Fialka M-125 - spec, engine, page, tests, registered
- [ ] Exhibit: KL-7 - spec, engine, page, tests, registered
- [SKIP - already shipped] SIGABA new-build request
- [SKIP - already shipped] Typex new-build request
- [ ] Exhibit: Geheimschreiber (T52) - spec, engine, page, tests, registered
- [ ] Exhibit: Kryha - spec, engine, page, tests, registered
- [ ] Exhibit: Bazeries Cylinder - spec, engine, page, tests, registered
- [ ] Exhibit: M-94 / M-138-A - spec, engine, page, tests, registered
- [ ] Fish-family side panel added on Geheimschreiber page

## Phase 5 - Missing European classical and polyalphabetic gaps
- [ ] Exhibit: Trithemius - spec, engine, page, tests, registered
- [ ] Exhibit: Cardano Autokey - spec, engine, page, tests, registered
- [ ] Exhibit: Affine - spec, engine, page, tests, registered
- [ ] Exhibit: Wheatstone Cryptograph - spec, engine, page, tests, registered
- [ ] Exhibit: Argenti Family - spec, engine, page, tests, registered
- [ ] Exhibit: Wallis Ciphers - spec, engine, page, tests, registered
- [ ] Exhibit: Morse Code - spec, engine/audio, page, tests, registered
- [ ] Morse side panels: Voyager Golden Record + Morse+Cipher Combination
- [ ] Exhibit: Mary Stuart Castelnau Letters - spec, page, Track B viewer
- [ ] Exhibit: Patterson Cipher for Jefferson - spec, page, Track B viewer

## Phase 6 - East Asia, South America, and global telegraphy
- [ ] Exhibit: Chinese Telegraph Code - spec, engine, page, tests, registered
- [ ] Exhibit: Zimmermann Telegram - spec, page, Track B visualization
- [ ] Exhibit: Slidex - spec, engine, page, tests, registered
- [ ] Exhibit: Commercial Telegraph Codebooks - spec, engine, page, tests, registered

## Phase 7 - Americana and cultural additions
- [ ] Exhibit: Culper Ring / Tallmadge - spec, engine, page, tests, registered
- [ ] Exhibit: Arnold-Andre - spec, engine, page, tests, registered
- [ ] Exhibit: Cardano Grille - spec, engine, page, tests, registered
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
- [UPGRADE] Gold-Bug moved to Hall XIII
- [x] Dancing Men moved to Hall XIII (new page expected)
- [ ] Exhibit: Da Vinci Code - spec, engine, page, tests, registered
- [ ] Exhibit: National Treasure - spec, engine, page, tests, registered
- [ ] Exhibit: Gravity Falls Cipher System - spec, engine, page, tests, registered
- [x] Exhibit: Cicada 3301 - spec, engines, page, tests, registered
- [ ] Exhibit: Popular Culture Survey - spec, filterable page
- [ ] Cross-reference side panels (Atbash/Caesar/Affine) added
- [ ] Gold-Bug side panel added
- [ ] Enigma side panel: Three Unbroken Messages
- [ ] Enigma side panel: Operation Boniface
- [ ] Hall VIII sidebar/card count updated after moves
- [ ] Hall XIII prev link set (XII), no next link

## Phase 10 - Generic-technique exhibits
- [SKIP - already shipped] Nomenclator-generic
- [SKIP - already shipped] Book-cipher-generic
- [SKIP - already shipped] Autokey-generic
- [ ] Exhibit: Null Cipher-generic - spec, engine, page, tests, registered
- [ ] Exhibit: Microdot Steganography - spec, engine, page, tests, registered

## Phase 11 - Context / situation + modern cryptography foundations
- [ ] Exhibit: Cabinet Noir - page + map of black chambers
- [ ] Exhibit: Station HYPO - page + annotated floor plan
- [ ] Exhibit: Bletchley Park - page + pannable hut map
- [ ] Exhibit: Kerckhoffs's Principle - page + Track B explainer
- [UPGRADE] Diffie-Hellman page enhanced to Round 3 spec
- [UPGRADE] RSA page enhanced to Round 3 spec
- [UPGRADE] AES page enhanced to Round 3 spec
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
- [ ] data/artifact-cards.json created with final schema
- [ ] Card renderer added (demo-loader extension or companion module)
- [ ] All 63 existing exhibits have artifact-card entries
- [ ] All new Round 3 exhibits have artifact-card entries
- [ ] Artifact-card hook added to all exhibit pages
- [ ] Card styling matches museum aesthetic, mobile, and accessibility goals
- [ ] test-comprehensive.js validates card completeness
- [ ] test-demo-pages.js verifies card render on every exhibit page

## Phase 16 - Research / Catalog Mode (audit-gated)
- [ ] Audit of comparison.html, search.html, cipher-flow.html completed
- [ ] Decision recorded in docs/round3-shipped-audit.md (skip / upgrade / build)
- [ ] If UPGRADE: new filter dimensions added to comparison.html
- [ ] If BUILD: catalog.html created with round spec
- [ ] Global nav updated with catalog/research link
- [ ] Mobile-responsive and accessible with no backend

## Phase 17 - Cipher Detective
- [ ] cipher-detective.html created
- [ ] Analyses implemented: inventory, IoC, Kasiski, chi-square, charset, shape, period
- [ ] Family scoring implemented across at least 8 families
- [ ] Evidence panels show 3-5 candidates with confidence language
- [ ] Limitations section included
- [ ] Cross-links to exhibits, cryptanalysis.html, and workbench
- [ ] Added to global nav and cryptanalysis/workbench (and learn.html if in scope)
- [ ] test-comprehensive.js validates known sample identification
- [ ] test-demo-pages.js verifies page render and input handling

## Phase 18 - Deploy and verify
- [ ] All six test suites pass locally
- [ ] test-demo-pages.js passes for every new exhibit page
- [ ] test-comprehensive.js validates artifact-card completeness
- [ ] test-comprehensive.js validates Cipher Detective sample identification
- [ ] Every Track A engine works in Workbench
- [ ] Every Track A Try It Yourself block produces output via demo-loader
- [ ] Every Track A Break This Cipher reveal works
- [ ] Every Track B visualization renders
- [ ] Every exhibit page shows Artifact Card at top
- [ ] Catalog/research mode page works with all filters
- [ ] Cipher Detective page loads and returns evidence-based candidates
- [ ] Local server spot-check: 5 Track A, 5 Track B, 5 bios
- [ ] Changes pushed to main
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
