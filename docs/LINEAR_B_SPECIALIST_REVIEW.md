# Linear B case: specialist review packet

**Status (3 November 2026): no specialist reviewer is available.** This packet is kept as an inventory of every Linear B claim on the site, held in step with the page by a test. The case states its verification status in its source note instead. The cover note below stays usable if a reviewer becomes available.

Prepared 3 November 2026 for a reviewer who works on Linear B or Mycenaean Greek. Everything you need is on this page; you do not need to open the repository.

**What is being reviewed.** The Linear B section of the Cipher Museum's *How a Decipherment Becomes Evidence* page: <https://ciphermuseum.com/lab/decipherment-cases.html#linear-b>. It was added in PR #36 and extended in PR #37, both merged on 3 November 2026. It is a short teaching case, not a scholarly edition.

**How this inventory was made.** The repository was searched for *Linear B*, *Kober*, *Ventris*, *Chadwick*, *Blegen*, *Ta 641*, *Pylos*, *Knossos*, *Mycenae*, and each transliteration used on the page. The search covered pages, scripts, data, the search index, the teaching corpus, tours and docs. Linear B claims appear only on the surfaces listed below. The teaching corpus, tours, glossary, timeline and data files contain none. A test (`tests/test-linear-b-review-packet.js`) fails if any "Live wording" quoted here stops matching the live files, so this packet cannot silently drift from the site.

## The fastest things to confirm

1. **Transliterations.** The page uses six transliterated Linear B words: *ti-ri-po-de*, *qe-to-ro-we*, *a-no-we*, *pa-te* (twice) and *ma-te*. It gives three Greek words with glosses: *patēr* "father", *pantes* "all", and implicitly *mētēr* "mother" for *ma-te*.
2. **Sign values.** The page gives **no sign values**: no syllabogram numbers, no drawings or Unicode Linear B signs, and no value table. A test enforces the absence of Linear B Unicode signs.
3. **The interactive exercise is invented.** It uses Latin-letter labels (A, B, C; X, Y, Z) and says so on the page. It makes no claim about Linear B signs, words or grammar. It only needs checking for whether it misrepresents the historical method.

## Claims to review

Each entry gives:
- the exact text on the live site;
- where it appears;
- the source it is attributed to;
- whether it is **source-derived**, **framing** (the museum's own summary judgement) or an **invented fixture**.

*Chadwick* is John Chadwick, *The Decipherment of Linear B* (Cambridge University Press, 1958). *Documents* is Ventris and Chadwick, *Documents in Mycenaean Greek* (Cambridge University Press, 1956). By the owner's preference both are cited by title, without chapter or page.

### LB-01 · Script, not cipher

- **Where:** `lab/decipherment-cases.html#linear-b`, opening paragraph
- **Live wording:**
  > Linear B is a script, not a cipher. Nobody designed it to hide anything. Its signs record syllables and commodities in Mycenaean palace accounts, in an early form of Greek.
- **Cited to:** *Documents*, on the writing system and ideograms; Palaima (2023), opening page, on the early form of Greek.
- **Kind:** framing, with source-derived facts.
- **Please check:** whether "syllables and commodities" is an acceptable lay summary of syllabograms plus ideograms, and whether "palace accounts" is too narrow for the corpus as a whole.

### LB-02 · Kober's method

- **Where:** `lab/decipherment-cases.html#linear-b`, stage 1
- **Live wording:**
  > Alice Kober collected recurring words and showed that some appear in sets of three related forms, sharing a stem and changing their ending. She deliberately stopped before assigning sounds. From these relationships she drew up the beginning of a grid of signs that seemed to share a consonant or a vowel; Michael Ventris extended it.
- **Cited to:** Chadwick; *Documents*, on Kober's programme stopping short of sound values and her "beginning of a tentative phonetic pattern".
- **Kind:** source-derived.
- **Please check:** whether crediting Kober with "the beginning of a grid" is fair. *Documents* credits her with the diagram, while Chadwick's account presents the grid as Ventris's construction.

### LB-03 · The triplets reinterpreted

- **Where:** `lab/decipherment-cases.html#linear-b`, stage 2
- **Live wording:**
  > Kober read her “triplets” as inflected forms of words. Ventris took a step she had not: he treated them as place names. Her first five proved to be the names of Cretan towns, with adjectives formed from them, and the relationships between signs that she had found still held.
- **Cited to:** Chadwick, which describes the place-name supposition as a step Kober had not taken; *Documents*, on the first five triplets yielding Cretan town names.
- **Kind:** source-derived.
- **Please check:** "inflected forms of words" as a summary of Kober's case analysis, and "adjectives formed from them" (ethnics) for the variant forms.

### LB-04 · Ventris's expected language

- **Where:** `lab/decipherment-cases.html#linear-b`, stage 3
- **Live wording:**
  > Ventris’s working notes of 1951–52 tested Aegean and Etruscan parallels while Greek readings were still regarded as out of the question, and he favoured an Etruscan connection until mid-1952. He introduced his first full test of Greek, Work Note 20 of 1 June 1952, as a digression. Values from the grid then produced the names of Cretan towns and Greek words. The decipherment was announced on 1 July 1952.
- **Cited to:**
  - *Documents*, on the Work Notes, January 1951 to June 1952.
  - Chadwick, on the Etruscan preference until mid-1952.
  - Chadwick, on Work Note 20 of 1 June 1952 and how Ventris introduced it.
  - Palaima (2023), opening page, on the announcement of 1 July 1952.
- **Kind:** source-derived.
- **Please check:**
  - whether "first full test of Greek" overstates Work Note 20, given earlier hints;
  - whether "announced on 1 July 1952" is the date you would give (the BBC broadcast).

### LB-05 · Ta 641 as an independent test

- **Where:** `lab/decipherment-cases.html#linear-b`, stage 4
- **Live wording:**
  > Tablet Ta 641 was excavated at Pylos in 1952, and Carl Blegen studied it in spring 1953. Read with Ventris’s values, the words beside drawings of tripods and pots described those vessels: ti-ri-po-de beside tripods, qe-to-ro-we beside a four-handled pot, a-no-we beside one without handles. Blegen reported this in a letter of 16 May 1953. The tablet did not help form the values; it tested them.
- **Cited to:**
  - Palaima (2023), opening page, on discovery in the 1952 season.
  - Chadwick, on the tablets being cleaned over the winter, Blegen's letter, and the readings *ti-ri-po-de*, *qe-to-ro-we* and *a-no-we* with their prefixes.
  - *Documents*, on the letter of 16 May 1953.
- **Kind:** source-derived; **contains transliterations**.
- **Please check:**
  - the three transliterations and their pairing with the ideograms;
  - "a four-handled pot" and "one without handles", where the page uses "pot" for the vessel type;
  - whether "the tablet did not help form the values" is safe. The tablet was excavated in 1952 but, on the cited accounts, not studied until spring 1953, after the values were published.

### LB-06 · Spelling and open readings

- **Where:** `lab/decipherment-cases.html#linear-b`, stage 5
- **Live wording:**
  > Linear B spelling leaves out l, r and s at the end of a syllable, and m and n before another consonant, so one written word can stand for different Greek words: pa-te can be patēr, “father”, or pantes, “all”. Context settles some cases: one tablet pairs pa-te with ma-te, “mother”, which points to patēr. Others remain open; even on Ta 641, Chadwick noted, the descriptions of the tripods allow several translations with no firm way to choose between them.
- **Cited to:**
  - Chadwick, on spelling rule 7 with *pa-te* = *patēr*, a tablet correlating *pa-te* with *ma-te*, and the tripod descriptions still disputed.
  - *Documents*, on the spelling rules, including *pa-te* as *patēr* or *pantes*.
- **Kind:** source-derived; **contains transliterations**.
- **Please check:**
  - **The spelling rule.** Chadwick states it as *l, m, n, r, s* omitted when final or before another consonant. The page follows *Documents*' division between final or syllable-end *l, r, s* and *m, n* before a consonant. Is the page's version accurate enough for a lay reader?
  - **The *pa-te* readings.** Is *pantes* a sound example?
  - **The pairing.** Is "one tablet pairs *pa-te* with *ma-te*" a fair summary of Chadwick's example?

### LB-07 · No confidence score

- **Where:** `lab/decipherment-cases.html#linear-b`, stage 6
- **Live wording:**
  > Chadwick called the odds against Ta 641’s agreement arising by accident astronomical, and of a later check he wrote that such probabilities are “beyond mathematical analysis”. Ventris and Chadwick also pointed to the system’s success on texts found later.
- **Cited to:**
  - Chadwick, on the odds and on a later check, the tablet with horse and ass heads.
  - *Documents*, on success with texts unknown when the system was formulated.
- **Kind:** source-derived. The page adds that these are "arguments, not measured probabilities" and gives no score; that sentence is framing.
- **Please check:** whether "a later check" is a fair description of the horse-and-ass-heads example.

### LB-08 · The invented exercise and its analogy to Ta 641

- **Where:** `lab/decipherment-cases.html#linear-b`, exercise; the logic is in `js/structure-exercises.js`
- **Live wording:**
  > Original structural exercise: the Latin labels below are invented, not Linear B signs, ancient words or a historical transcription.

  and, after a check:

  > These records were withheld from the training groups, as Ta 641 was absent from the evidence that produced Ventris’s values. They are part of this invented fixture.
- **Cited to:** nothing. The fixture is original to the museum.
- **Kind:** **invented fixture.** It uses invented occurrence counts in which Y is the commonest ending; "Y marks one item" is the attractive wrong reading; held-out records "one jar: C X; two jars: C Y"; a "C Z" record has no numeral and stays unassigned.
- **Please check:** only whether the analogy misrepresents the method, especially the claim that a plural can be the commonest form in inventories. It makes no claim about Linear B grammar.

### LB-09 · Summaries on other surfaces

These restate the case and add no new claims. The page-level summary was synchronized on 4 November 2026 to include the new Charles V case; the Linear B claims and transliterations in this packet are unchanged.

- **Where:** `lab/decipherment-cases.html`, meta description and hero line
- **Live wording:**
  > Compare Copiale, Mary Stuart, Charles V and Z340 with the Egyptian, Linear B and Maya decipherments: what structure, keys and independent checks can each establish.

- **Where:** `README.md`, Recent Changes, 3 November
- **Live wording:**
  > now sets Linear B out as a script, not a cipher, and follows its decipherment in stages: Kober’s structure before sound, her triplets reinterpreted while the structure held, Ventris’s expected language giving way, and tablet Ta 641 as a test from evidence not used to build the values.

- **Where:** `js/search-index.json` repeats the meta description. `js/structure-exercises.js` holds the exercise messages, all about the invented labels, such as:
  > Latin labels; not Linear B signs or an ancient transcription.
- **Kind:** framing.

### Outside this work: one earlier claim

- **Where:** `ciphers/phaistos-disc.html`, Technical Notes. This text predates the Linear B case.
- **Live wording:**
  > Forty-five signs do not by themselves prove a syllabary, and they do not closely match Linear B’s larger syllabic inventory.
- **Kind:** framing, not part of this review. It is listed because it is the only other Linear B statement on the site. Comment only if it is wrong.

## Sources as cited on the page

- John Chadwick, *The Decipherment of Linear B* (Cambridge University Press, 1958).
- Michael Ventris and John Chadwick, *Documents in Mycenaean Greek* (Cambridge University Press, 1956).
- Thomas G. Palaima, "The Pylos Ta Series and the Process of Inventorying Ritual Objects for a Funerary Banquet" (2023), [public PDF](https://sites.utexas.edu/scripts/files/2023/10/2023-TGP-The-Pylos-Ta-Series-and-the-Process-of-Inventorying-Ritual-Objects-for-a-Funerary-Banquet.pdf).
- Andrew Robinson, *The Story of Writing*, revised edition (2007). Carried over from PR #36 and not rechecked.

## Cover note for the reviewer

Dear colleague,

Thank you for looking at this. The Cipher Museum is a free, public teaching site about the history of codes and ciphers. Its new Linear B case shows how a decipherment becomes evidence: structure before sound, an attractive interpretation that fails, a test from a tablet not used to build the values, and readings that stay ambiguous.

We would be grateful for a reply on three points. Brief answers are fine:

1. **Transliterations (LB-05, LB-06).** Are *ti-ri-po-de*, *qe-to-ro-we*, *a-no-we*, *pa-te* and *ma-te*, and the Greek readings and glosses given for them, correct as written?
2. **Historical statements (LB-01 to LB-07).** Is any statement wrong, misleadingly compressed, or attributed to the wrong person? The specific questions under each entry are where we are least sure.
3. **The invented exercise (LB-08).** Does the Latin-label analogy misrepresent the method?

A reply by entry number ("LB-04: date fine; 'first full test' overstates it") is ideal. Corrections will be made on all the surfaces listed here, and your review will be recorded with your permission. We will not describe the case as specialist-reviewed until you have replied.

With thanks,
The Cipher Museum
