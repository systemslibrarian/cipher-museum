# Two further Reading the Evidence investigations

Added 4 November 2026, following the current-source comparison of Dot's CM108 and CL1341 recommendations. These extend the existing page to six numbered investigations. The first four exercises and the separate historical handbell case remain in place.

## Public sources and exact scope

| Recommendation | Source passages checked | Implemented destination |
| --- | --- | --- |
| CM108: distinguish stable replacement, merging and per-occurrence noise | Fang, Mishra, Gao, Liu and Khashabi, [*ICL CIPHERS: Quantifying “Learning” in In-Context Learning via Substitution Ciphers*](https://aclanthology.org/2025.emnlp-main.1316/) (EMNLP 2025), §§2.2–2.5, printed pp. 25913–25914 / PDF pp. 2–3. These define token substitution, the fixed bijection and independent replacement comparison, and distinguish task-relevant information from recovering the full mapping. | [`lab/reading-the-evidence.html#structure-controls`](../lab/reading-the-evidence.html#structure-controls) |
| CL1341: concealed-message reliability and carrier constraints | Eveline Szarka, [*On the Combination of Cryptography and Steganography in 17th Century Germany*](https://ecp.ep.liu.se/index.php/histocrypt/article/view/705) (HistoCrypt 2023), §§4–6, printed pp. 163–166 / PDF pp. 4–7; conclusion printed p. 167 / PDF p. 8. [Publisher PDF](https://ecp.ep.liu.se/index.php/histocrypt/article/download/705/611/722). Musical constraints, ambiguous invoice numbers and reserved-word collisions motivate the three examples. | [`lab/reading-the-evidence.html#concealment`](../lab/reading-the-evidence.html#concealment) |

These were selected passage rereads, including inspection of the displayed comparison definitions and invoice/music figures. They do not add full-paper reading credit or certify the papers' broader claims. All public citations go to publishers; no private paper links, scanned historical images, historical musical scores or source datasets were copied into the page.

## 1. Four replacement conditions

This is an original, deterministic classroom task, not an LLM evaluation. Every source consists of exactly three whole words from `PINE`, `OAK`, `ELM`, `ASH`. Word boundaries and the three positions are supplied. The task asks whether the **first and last original words are equal**. Four labeled demonstrations accompany three new examples.

The complete artificial universe has `4 × 4 × 4 = 64` sources. The implementation enumerates that entire universe and distinguishes these conditions:

| Condition | Transformation | Exact property in this model |
| --- | --- | --- |
| Unchanged | Identity | All 64 inputs have distinct outputs; source words are visible. |
| Fixed one-to-one | PINE→OAK, OAK→ELM, ELM→ASH, ASH→PINE | All 64 inputs have distinct outputs. Every pairwise equality is preserved. The label can be answered without learning the full inverse. |
| Fixed many-to-one | PINE/ELM→OAK; OAK/ASH→ASH | Eight outputs, each compatible with eight sources when the complete mapping is supplied. Some outputs permit both labels; different endpoint outputs still establish different source endpoints. |
| Fresh replacement per occurrence | An independent uniform choice from all four words replaces every occurrence | Every output triple is possible from every source triple: 64 compatible sources, 16 with matching ends and 48 with different ends. Counts alone are not posterior probabilities. |

For replay, the fresh condition displays seven fixed three-word outcomes, one for each demonstration/query. It does not generate random data or make a claim about a random generator. The independent replacement model is stated explicitly. Coincidentally repeated replacement words are allowed and demonstrated; the interface does not imply that “fresh” means every resulting word must differ.

### Negative and positive controls

Queries A (`ELM ASH ELM`) and B (`ELM ASH PINE`) have opposite source labels but merge to the same received message, `OAK ASH OAK`. Four of its eight source alternatives have matching ends and four do not. A label guess cannot resolve the collision.

Query C (`ELM ASH OAK`) merges to `OAK ASH ASH`. All eight source alternatives have different ends. The label is recoverable while the exact message remains ambiguous. This is the specific distinction between task success and full plaintext recovery.

In the fresh condition, one demonstration loses a genuine repetition and another gains a coincidental repetition. A displayed pattern alone therefore supplies no fixed word mapping. The all-64 count assumes all three words undergo the stated independent full-vocabulary replacement; it is not transferred to partial replacement, natural-language corpora or historical ciphers.

The complete fixed mappings and original query are available in a clearly labeled workings panel. Its preimage counts assume the full mapping is known; the exercise never treats four labels as proof that a learner recovered that mapping. Changing a rule or query clears the previous answer/verdict and closes the old workings. The original user-editable recurrence activity remains separate.

## 2. Three concealed-message controls

The historical paragraph attributes the motivating cases to Szarka's study of handbooks. It does not claim those proposals were routinely adopted or successfully used. The mechanics below are wholly original and deliberately small.

### Invoice boundaries

The published toy word code is:

`1→MEET; 2→DAWN; 3→DUSK; 12→WAIT; 13→CANCEL`.

An invented invoice amount `12` has two legal readings, `1|2 → MEET DAWN` and `12 → WAIT`. Amount `13` similarly permits `MEET DUSK` and `CANCEL`. The parser enumerates every legal segmentation without language scoring or silently selecting a preferred reading.

Explicit framing changes `12` into `1|2`, resolving that fixture to `MEET DAWN`. The interface also points out that this string is no longer an ordinary numeric amount in the declared invoice format. The single-code amount `2` is the positive control: it is unambiguous and remains an ordinary number in either boundary mode. Quantities, prices and currency units are fictional; displayed arithmetic is computed independently of the parsing result.

The source's historical letter key is not reproduced. The sender's intended phrase is placed in a separate disclosure, so the recipient's unresolved boundaries are not silently supplied from an unavailable original.

### Accidental reserved words

The original carrier sentence uses `amber→MEET`, `silver→AT`, `copper→DAWN`. The extraction rule matches whole words, ignores case and punctuation, and extracts every match. Adding the ordinary sentence “Copper tools arrived yesterday.” changes the decoded text from `MEET AT DAWN` to `DAWN MEET AT DAWN`. The decoder does not infer intent or silently remove the inconvenient match.

### Duration code and meter

Two words have unique original duration encodings: `WAIT → 1,1,1,1` and `MEET → 1,1,1,2` quarter-note beats. Both decode under the shown code. Each is presented as one complete single-voice bar labeled 4/4, so WAIT meets the declared four-beat constraint and MEET totals five.

The example models duration only. It does not reproduce a melody or validate general musical naturalness. A visible meter inconsistency can invite scrutiny but does not prove that a real piece contains a secret; passing this one consistency check does not prove concealment. No detection rate, secure covert channel or confidentiality guarantee is claimed.

The section connects to the existing Cardano grille, null-cipher and Bacon exhibits without changing their historical accounts. All three carrier controls have one reset action.

## Implementation and verification

Files changed for these additions:

- `lab/reading-the-evidence.html`: six-section navigation, current description, two activities and public source credits.
- `js/reading-evidence.js`: bounded models, exact enumeration, rendering, stale-state clearing and resets.
- `css/evidence-exercises.css`: styles scoped to the new sections, with focusable scrolling table regions and responsive note cards.
- `tests/test-reading-evidence.js`: existing regressions retained and new behavioral coverage added.

Local verification completed:

- The focused suite passes with all 64 word triples, four conditions, three queries and all pairwise equality checks.
- An independent boundary-bitmask oracle checks all legal parses for 363 digit strings of lengths one through five. It uses a different method from the recursive parser.
- Positive/negative controls cover merged labels, retained task information despite ambiguous plaintext, destroyed and accidental repetitions, framed/unframed invoices, the ordinary single-code case, an extra marker, an unknown rhythm code and the 4/4 violation.
- DOM interactions cover every mode/query, all choices, feedback, stale-state clearing, workings disclosure, the invoice controls, marker toggle, music comparison and both reset actions.
- Five isolated faulty module copies are rejected: a merge that fails to merge, noise treated as a fixed mapping, a greedy parser hiding alternatives, silent removal of an accidental marker, and accepting five beats as valid 4/4. The working source is never mutated during these checks.
- Source-link checks, six paper credits, six activity links, control labels, and focusable table containers pass.
- `npx htmlhint lab/reading-the-evidence.html` and `git diff --check` pass.

Browser, full-repository and deployment evidence are recorded separately by the integration pass. These local checks are not a claim that a historical source was independently deciphered or that the paper's AI experiments were reproduced.
