# Reading the Radio Log: a bounded traffic-analysis exercise

Added 2 November 2026 at `lab/traffic-analysis.html`, as the priority-2 historical traffic-analysis extension from the 2 November ebook review. It is one bounded exercise inside the museum, not a new exhibit number, hall or repository.

**Everything in the log is invented.** Callsigns, frequencies, times, serials, bearings, the chatter fragment and the exercise key are original teaching fixtures. The page says so in its first paragraph, its meta descriptions, both table captions and the key's caption.

## What the learner does

1. **Reads a two-day log** of 34 intercepts (18 on Day 1, 16 on Day 2). Each row holds externals only: time, frequency, from, to, serial or receipt, length in groups, and an intercept operator's note. There is no message text anywhere in the data model, so nothing can be decrypted.
2. **Connects senders and receivers** by ticking pairs of Day 1 callsigns, then compares the drawing with the log. Confirmed, unsupported and missed links are drawn differently. The one partly read callsign (`K?7`) is drawn as its own node and is never merged with KR7.
3. **Records a net-control hypothesis** (H1). Its status is `hypothesis` in every state. Later evidence adds reasons for and against, but never upgrades it to an observation.
4. **Matches the Day 2 callsigns** to Day 1 stations, or leaves them unresolved, and reads the consequences: which clues agree, which stations vanish, and which stations change role overnight.
5. **Sorts eight statements** as observed, inference, or not supported by this log.
6. **Opens a second stage** after recording matches. Bearings from two invented direction-finding posts give fixes with a stated rough uncertainty. A partly unreadable plain-language fragment asks GA1 to repeat its "number 5 … yesterday". The consequences are recomputed against the learner's own matches.
7. **Debriefs** against the invented key, then reads the history behind the exercise, its stated limits, and the onward links.

## How the acceptance points are met

| Requirement | Implementation | Guard in `tests/test-traffic-analysis.js` |
| --- | --- | --- |
| A network can be produced without decrypting any payload | Links come only from the From/To fields. Log rows are restricted to a whitelist of external fields. | Block 1: field whitelist; exact Day 1 and Day 2 link sets |
| Uncertainty and missing observations stay visible | A computed, always-visible list: two coverage gaps, serial gaps, a receipt for an unheard message, an expected receipt not heard, the partial callsign, a frequency silent on Day 2 and a new one. DF gaps carry stated reasons. Fix circles show uncertainty. | Blocks 2 and 6; wiring checks that the list survives every step and is never hidden |
| A plausible wrong callsign match has an observable consequence | GA1 took ZB3's old frequency (4190 kHz). Matching on frequency alone makes ZB3 change from receipt-only to busiest sender, leaves DH9 unidentified, puts the chatter fragment under tension, and, with DF, implies a 20 km overnight move against a combined uncertainty of about 9 km. Correcting the match removes all of these. | Block 5, including every alternative for GA1; wiring checks for the map's move line before and after correction |
| Headquarters hypothesis kept distinct from observed fact | H1 card, "H1: hypothesis" tag separate from the node label, statement "KR7 is a headquarters" scored as inference | Block 7 |
| Nothing implies traffic volume alone proves military intent | Volume is reported per covered hour (Day 1: 510 groups in 9.5 h; Day 2: 607 in 11 h). The "traffic rose, so an attack" statement is scored unsupported. The key contains no intentions. | Block 3; prose regex in block 9 |
| Linked to the history route and the Blind Relay correlation | Ciphers at War tour stop; Station HYPO related card; Hall of Codebreakers panel; onward section linking `crypto-lab-blind-relay/#corr-h` with a two-row size/timing correspondence. No generic "metadata leaks" warning. | Block 10; block 9 forbids "metadata leaks" |

## Sources and what was checked

| Source | Public link | Used for | Verification limit |
| --- | --- | --- | --- |
| Donald A. Borrmann, William T. Kvetkas, Charles V. Brown, Michael J. Flatley and Robert Hunt, *The History of Traffic Analysis: World War I – Vietnam* (Center for Cryptologic History, NSA, 2013) | [NSA PDF](https://media.defense.gov/2021/Jul/13/2002761879/-1/-1/0/TRAFFIC_ANALYSIS.PDF); [GovInfo](https://www.govinfo.gov/app/details/GOVPUB-D-PURL-gpo91580) | Definition and elements (pp. 3–6), net structure (p. 7), deception and dummy traffic (pp. 8–9), WWI signals-silence example (p. 13), Jutland callsign example (pp. 14–15). | Read in full from the GovInfo copy; the NSA host refused scripted download. Page numbers are the brochure's printed numbers. |
| Whitfield Diffie and Susan Landau, *Privacy on the Line*, updated and expanded edition (MIT Press, 2007) | [open-access DOI](https://doi.org/10.7551/mitpress/5572.001.0001) | One sentence. The book calls traffic analysis, not cryptanalysis, "the heart of a communications intelligence organization" (ch. 4, p. 102). It also describes a narrower form of traffic analysis in law-enforcement records of numbers called, pen registers (ch. 5, p. 133). | Checked on 3 November 2026 against the open-access text of this edition: the MIT Press open-access copy on the Internet Archive (`mit_press_book_9780262256018`, CC BY-NC-ND 4.0). Crossref confirms that the DOI resolves to ISBN 9780262256018. The quotation is the book's own wording. The often-repeated "Traffic analysis, not cryptanalysis, is the backbone of communications intelligence" is a later paraphrase and does not appear in this edition; the nearest wording is "the backbone of a communications intelligence organization is not its ability to read individual messages" (p. 133). MIT Press Direct and OAPEN both showed bot checks. Those were not attempted. |
| James Thirsk, "Traffic analysis: a log-reader's tale", chapter 15 in Ralph Erskine and Michael Smith (eds), *The Bletchley Park Codebreakers* (Biteback, 2011) | [contents of the 2001 edition](https://cryptocellar.org/ActionContents.html), where it is chapter 14 of *Action This Day* | Cited as a participant's account of wartime "log-reading". No claim is drawn from its content. | The chapter text was not read. The title and the 2001 chapter number come from the published contents; the 2011 chapter number comes from the review brief and a catalogue summary. |
| Blind Relay (Crypto Lab) | [live lab](https://systemslibrarian.github.io/crypto-lab-blind-relay/#corr-h) | The size and timing joins, padding, and how ambiguous joins are reported. | Checked against `src/ui/correlation.ts` and the README at commit `fcf1b42`. |

No private Drive or uploaded copy of any source is linked. The review document itself was not present at the path given in the brief (`~/Downloads/New-Ebook-Review-…-2026-11-02.md`). The exercise was built from the brief's summary of its section 2.

## Surfaces changed

`lab/traffic-analysis.html`, `js/traffic-analysis.js`, `css/traffic-analysis.css`; `tours/wartime.json` (new stop after Lorenz); `ciphers/station-hypo.html` (related card); `halls/codebreakers.html` (traffic-analysis panel and NSA source in the reading panel); `teaching.html`; `lab/workbench.html`; `README.md` (Recent Changes and lab list); `scripts/build-search-index.js` and the regenerated `js/search-index.json` (one entry added, nothing else changed apart from the timestamp); `sw.js` (offline list and re-stamped version); `tests/run-all.js`; `docs/page-audit/coverage.json`. Exhibit counts, artifact cards and trust labels are unaffected: this is a lab page, not a numbered exhibit.

On 3 November 2026 three related-card tags on neighbouring pages were corrected:
- **Station HYPO → JN-25.** "The cipher HYPO broke" became "The naval code attacked by HYPO and other Allied units". This matches HYPO's own page body and the Rochefort page.
- **Station HYPO → Purple.** "US diplomatic code MAGIC parallel operation" became "Japanese diplomatic cipher machine, a source of MAGIC". This matches the Purple page: Purple was Japan's machine, and MAGIC was the US intelligence stream it fed.
- **JN-25 → Lorenz.** "Strategic-level wartime traffic analysis" became "German strategic teleprinter cipher attacked at Bletchley Park". Lorenz traffic was attacked by cryptanalysis, and calling that traffic analysis blurs the distinction this exercise teaches.

Neither page's prose or metadata changed otherwise. HYPO's Quick Facts "Key Break: JN-25" row was left alone. "Key Break" is a field shared by five person pages, and HYPO's page body already says the recovery was partial.

## Verification

- `node tests/test-traffic-analysis.js`: model, JSDOM wiring and prose guards, as tabled above.
- **Each guard was made to fail first.** Before the tour, HYPO, hall and search-index links existed, block 10 failed ("The Ciphers at War tour must include the exercise"). Eighteen deliberate defects were then introduced one at a time, and the suite failed on every one before being restored. They covered: merging `K?7` into KR7; adding message text to a row; never flagging movement; never flagging role change; scoring the volume statement as inference; upgrading H1 at stage 2; scoring the headquarters statement as observed; removing the fictional label; adding a volume-proves-attack sentence; revealing stage 2 before matches; clearing the missing list; citing internal row ids; removing the tour stop; adding a Drive link; misstating the row count; misstating the debrief's phantom distance; computing a fix from the wrong range; and disabling the frequency clue.
- **Four later guards (3 November) were each seen failing before their fix:** the Diffie and Landau citation must carry the book's own wording and page (block 9), and the three corrected related-card tags (block 11). The suite was run after each fix in turn, so each guard failed on its own.
- Chromium at 390 and 1280 px (`docs/page-audit/traffic-analysis-browser-20261102.json`): no page errors, no document overflow, and a keyboard-driven flow through steps 2–5. The phantom-move line appears with the wrong match and disappears after correction. At 390 px the two log tables scroll inside their own container. This is not an automated WCAG audit.
- Full `npm test`, run after these changes.

## Limits stated on the page

Scale (34 rows versus thousands); a single callsign change rather than a periodic system; a rough ±2°/±4° DF model; no deliberate deception in the log; and no real analyst ever had a key.
