# Purple diagnosis worksheet

Added 3 November 2026 at `lab/purple-diagnosis.html` ("Diagnosing a Machine from Evidence"), as section 5 of the 2 November ebook review. It is a small synthetic worksheet linked from the Purple exhibit and from the Stepping-Switch Cryptanalysis card on Cryptanalysis Techniques. It is not a new exhibit number.

## What the learner does

1. **Read the disclosure,** which states exactly what is supplied, assumed, held out and simplified.
2. **Choose a key position for message B,** from 0 to 10, and align it with message A. The table shows every pair at each key position, marked as A (supplied) or B (placed by your alignment), plus any contradictions and any pairs A and B share.
3. **Test the alignment on message C.** Its ciphertext and start position are supplied; its plaintext is held out until the test. The verdict is one of:
   - **contradiction:** one key position would map a letter two ways;
   - **wrong reading:** C reads a letter its plaintext contradicts;
   - **not confirmed:** fewer than two of C's letters depend on the alignment;
   - **supported.**

   Letters that C reads from A's supplied pairs alone do not count, because they do not test the alignment.
4. **Keep the record.** Every test stays on record through reset.
5. **Read the team section:** Rowlett's supervision, Grotjan's discovery, Friedman, Rosen, Ferner and Small, and a pattern followed by corroboration.

## Section 5 acceptance points

| Requirement | Implementation | Named tests in `tests/test-purple-diagnosis.js` |
| --- | --- | --- |
| A wrong alignment fails on the independent sample | Only offset 2 is supported. Every other offset from 0 to 10 is "contradiction" or "not confirmed". | exactly one offset in range is supported; wrong alignment fails on the independent sample; contradiction path; not-confirmed path; wrong-reading path; letters read from supplied pairs alone do not support an alignment |
| Inferred wiring distinct from supplied information | Table labels "A, supplied" against "B, your alignment". C's plaintext is not in the page until a test. | supplied and inferred entries are kept apart; table marks supplied and alignment-placed pairs; held-out plaintext hidden before the test |
| The inference stays incomplete | A supported alignment still leaves nine of C's twelve letters unknown. | inference stays incomplete |
| Disclose what is supplied, assumed and simplified | The disclosure section; "Synthetic worksheet … not the Purple machine". | disclosure; synthetic, not the authentic machine |
| A team, not a lone-genius puzzle | Names Rowlett, Grotjan, Friedman, Rosen, Ferner and Small, and forbids lone-genius phrasing. | a team, not a lone genius |

## Sources and what was checked

Books were read from the user's copies and, by the owner's preference, are cited by title, publisher and year only; none is linked. The page paraphrases throughout.

| Source | Used for |
| --- | --- |
| Mark Stamp and Richard M. Low, *Applied Cryptanalysis* (Wiley, 2007) | Depth, offset depth, and matched plaintext and ciphertext constraining each position's permutation. The book notes that its own example is simplified. Its table and example messages were **not** reused: the worksheet's messages are original. |
| Frank B. Rowlett, *The Story of Magic* (Aegean Park Press, 1998) | Statistical tests confirming which messages shared a key; Grotjan's first instance of the relationship; Friedman coming in; Rosen's earlier stepping-switch work; Ferner and Small with Rowlett |
| Liza Mundy, *Code Girls* (Hachette, 2017) | Grotjan joining as a junior cryptanalyst in 1939; Rowlett supervising the Purple effort |

**A discrepancy, now noted on the exhibit.** Rowlett's memoir places Grotjan's discovery shortly before Labor Day 1940. Mundy's *Code Girls*, Bauer's *Decrypted Secrets* and the INSCOM Command Historian (Michael E. Bigelow, 2023) give 20 September 1940. The Purple exhibit and the Hall of Codebreakers keep 20 September 1940 and now say that Rowlett's memoir, which the exhibit cites, recalls the day differently; `tests/test-page-audit-claims.js` guards both notes. The worksheet still asserts no date.

## The fixture

The three messages are original English phrases. The permutations are a fixed list of random 26-letter permutations, generated once from seed 1 and stored as data. A search confirmed these properties:
- at the true offset, there are no contradictions and A and B agree in two pairs;
- C confirms three letters, two of which depend on the alignment, and leaves nine unknown;
- every wrong offset in range is rejected.

## Verification

- **Tests first.** The suite was written from the sources before `js/purple-diagnosis.js` existed. It has 23 named tests, and a final check fails if any of the 9 required verdict and failure paths did not run. Writing it caught a real leak: C's plaintext was in the page source while hidden.
- **Mutations.** Eight, each breaking the logic behind a verdict, and each failed:
  - contradictions ignored;
  - supplied letters counted for the alignment;
  - mismatches ignored;
  - no confirmation needed;
  - B placed regardless of offset;
  - held-out plaintext shown at load;
  - reset clears the record;
  - every pair labelled as supplied.
