# Site-wide accuracy audit — 4 August 2026

A full-site error sweep: mechanical checks (links, images, anchors, HTML,
console errors, sitemap, metadata) plus a prose fact-check of every page by
seven parallel review agents, each finding verified against the page text
before any fix. **~349 raw findings; ~230 verified and fixed** across seven
commits. The rest were either judgment calls (deferred below), duplicates,
or could not be confirmed.

## What was checked

- **Mechanical** (fixed in `cf5bc68`): all 198 pages htmlhint-clean; every
  internal link, image, and anchor resolved (1 broken anchor fixed); no
  duplicate ids; no og/canonical mismatches; zero JS console errors on 24
  representative pages; 6 missing sitemap entries added.
- **timeline.html + glossary.html** (`a305689`, 30 fixes): wrong flag emoji,
  era-legend counts less than half reality, Jefferson 36-disk wheel,
  four-square ~1902, NBS-not-NIST, Kryptos K3 = 336 chars, Copiale ~1760s,
  Vernam/Mauborgne OTP history, Zimmermann five-week delay, Bazeries 1891,
  PQC 2016, Beale as book cipher, Navajo "among the very few" unbroken,
  misplaced Hill card, evolution-strip ordering, avalanche = Feistel 1973,
  key-pair definition, AES final round, Polybius ~150 BC.
- **halls/ + museum-map.html** (`59ee6a4`, 44 fixes): Foundations range
  §141–157; era badges covering their own exhibits; roster hall column
  (Voynich/Beale/Kryptos/Dorabella → XII, Pigpen/Bach/Sator → XIII); broken
  worked examples (Kasiski distance 12, Bifid FP, OTP XOR bits, route-cipher
  arrows); "Schorreuder"→Scherbius; Z-340 credited to Oranchak–Blake–Van
  Eycke; Lorenz 5+5+2 wheels; ten unsolved problems; count chips.
- **Root pages** (`c1848de`, 40+): **all four hardest challenges had
  ciphertexts that did not decrypt to their answers** — regenerated with
  verified implementations (Enigma via the museum's own engine);
  comparison-table 139→160 and 14 wrong data rows; corpus count 55→101;
  challenge/tour metas; my-path hall numerals; Enigma keyspace 1.6×10²⁰;
  Mary Stuart paper credits; cipher-detective example.
- **Cipher pages** (`60337b5` + follow-up, ~125): wrong attributions
  (Copiale, Chaocipher/Rubin, VIC/VICTOR, ISK vs ISOS, Tiltman/Tutte,
  Kahn's death and doctorate, Agrell, Dudley's vocoder); date drift
  (Vernam 1917/1919, KL-7→1983, M-94→1943, DSM 1986, Hoover 1946,
  Paris 1865, Marks/Batey birthdays, Champollion 27 Sept); mechanism errors
  (SIGABA stepping, Wheatstone 27:26 gearing, Porta alphabets, T52 wheel
  lengths, Lorenz psi wheels drawn, DES 2⁴⁷/2⁴³); meaningless trust labels
  ("Secure (Modern)" on WWII machines, "Broken" on biographies) → Historical
  Only; fabricated color removed (fake Singh quote, invented Jefferson/
  Madison "tried and failed" letters, invented Mystery Hunt puzzles,
  "Duane Whitlock", RCMP/NSA Yardley claims); hall-numeral breadcrumbs;
  Mary Stuart page (Biermann not Megyesi, 57 letters, 1578–1584, correct
  paper title/DOI).

## Deferred — needs a human decision

1. ~~**`ciphers/joseon-yeokhak.html` — the whole exhibit.**~~ **RESOLVED.**
   No documented "hexagram-keyed" Joseon cipher exists in the
   cryptographic-history literature; the exhibit and its claimed provenance
   were invented. The page was **removed** and its roster slot (exhibit 69)
   reassigned to a new, fully sourced exhibit: **Wadsworth Cipher (1817)**,
   `ciphers/wadsworth-cipher.html`, in Hall VII. Sourced to Louis Kruh,
   *Cryptologia* 6(3) 1982, 238–247 (DOI 10.1080/0161-118291857037) and
   Thomas Kaeding, IACR ePrint 2020/1492. The `joseonYeokhak` engine was
   replaced by a `wadsworth` engine (26:33 gearing) with a derived KAT and
   five pinned page vectors. Corpus fallout handled: 1,100 synthetic records
   re-enciphered and retiered beginner → advanced, and the one *historical*
   Joseon record was **deleted outright** — its provenance (a Gyeongguk
   Daejeon postal cipher, with a non-resolving archive.org URL) was
   fabricated, and no documented Wadsworth ciphertext exists to replace it.
2. **`ciphers/patterson-jefferson-cipher.html`** — the "paraphrased"
   Jefferson/Madison letters and the "Bowman / NSA Cryptologic Almanac
   2006" sourcing remain; the 40-row description conflicts with Patterson's
   documented ≤9-row sections and is wired into the demo, so fixing it means
   reworking the interactive.
3. **`ciphers/cicada-3301.html`** — the "Mariko Ōhara" book reference and
   phone-message wording don't match the documented 2012 solution
   (Mabinogion + Agrippa); the section needs a rewrite against sources.
4. **Unsourced color, left in place pending review**: D'Agapeyeff "three
   doctoral theses" and "Vincent Lynch"; Driscoll FDR anecdote; Elizebeth
   Friedman "Olmstead testimony", LUNA/SARGO/MAGICIAN codenames, "always
   wins" quote; Dorabella "Elgar Society standing prize"; Dunin "NSA Day of
   Cryptology"; Great Cipher "cifre dolose" and "Victor Gendron";
   Gravity Falls season-2 key details; IRA book-cipher FBI/Garda story;
   da Vinci Code museum-attendance statistic; Culper "178 = spy".
5. **Small structural items**: pigpen glyph diagram draws the wrong corner
   shapes (needs an SVG redraw); polybius HELLO highlight cells; slidex
   grid-size contradictions (17×17 vs 26×26 vs 676); alberti/chaocipher
   prev–next chain overlap; Kryptos 865-vs-869 character count and the
   Berlin clock identification; Beale 1820-vs-1885 across surfaces; Enigma
   "Three Unbroken Messages" panel is stale (two were broken in 2006).

## Method note

Raw findings arrived as seven agent reports (not committed); this file is
the durable record. Every fix was string-verified against the live page
before editing, and `npm test` passed after each batch.
