# Cipher Museum — make every book invitation work

Revised execution prompt, 2 November 2026. Follow-up to PR #25 and Claude’s revision check.

Read repository guidance, current `main`, and the latest manuscript before editing. The audit at `e254c6f` is a starting point, not a substitute for checking current behavior. Work on one branch and open a pull request; **do not merge or deploy**.

## Acceptance standard

Read all 20 OPEN THE MUSEUM invitations word for word. For each, distinguish an existing working activity, missing content, a broken interaction, and an external source that the reader must consult. Preserve the manuscript’s nonfiction standards. Cite every new historical statement, preferably using the chapter’s notes and accessible primary sources. Do not invent dialogue, recovered keys, archival provenance, or certainty. Explicitly label invented teaching models. Do not simplify a book invitation merely to excuse a missing feature.

## Changes to investigate and complete

1. **RSA (chapter 16):** a working, bounded small-number model with editable distinct primes p and q and exponent e; display n, φ(n), d, public/private keys, encryption and decryption. Reject invalid inputs, demonstrate a round trip, and explain that arithmetic does not establish identity or provide real security.
2. **One-time pad / VENONA (chapter 14):** align the accounts of duplicated pad pages at manufacture, partial recoveries and investigative corroboration. Distinguish historical decimal addition without carrying from the binary XOR analogue. Include Lamphere’s investigative contribution with a source.
3. **Elizebeth Friedman (chapters 7–8):** give Riverbank enough context to support the hypothesis-testing exercise; link the evidence workbench. Add the Bear Cat pursuit, ship/shore radio traffic and the May 1933 New Orleans trial from the cited sources. Remove the stale Sargo note. Do not present an unverified quotation as verbatim or turn the pursuit into a successful sinking.
4. **Mary’s Castelnau letters (chapter 20):** add a labelled invented modifier and an accessible control whose displayed reading changes. Verify the seven plaintext counterparts against Lasry, Biermann and Tomokiyo (2023), distinguish them from other known letters, and give readers a direct route to the inventory and case file.
5. **Enigma (chapter 9):** explain the doubled message-key indicator, the relationships exploited by Polish analysts, and the relevant procedural chronology. Do not confuse earlier daily ground settings with later per-message procedures or claim the simulator reproduces the historical attack.
6. **Zimmermann (chapter 4):** distinguish the 0075 Berlin–Washington leg from the 13040 Washington–Mexico leg. Identify British interception versus acquisition of the Mexican forwarded copy, with sources. Do not label both as interception at the same place or claim one physical route for every copy.
7. **Stager (chapter 3):** accept the reader’s own words, an explicitly invented keyword-to-route convention, optional codewords and nulls. Hide the input dispatch after sending and reveal recovered order/vocabulary only on request. Preserve whole words; handle incomplete grids and reserved tokens. Clearly separate the old letter-transposition widget.
8. **ADFGVX (chapter 5):** display the actual intermediate coordinate pairs used by the engine. Allow a one-character comparison with the preceding run, retaining the same keys. Do not imply an avalanche effect. Add the ammunition radiogram’s substance and sources, preserving the chronology disagreement noted in the book.
9. **Babington (chapter 1):** show both the delivery channel and the copying/decipherment route. Do not turn a simplified diagram into a claim that Walsingham personally carried each original onward.
10. **Sealed Letter:** reconcile the 09:12 observation with the current investigation time and any further movement. Give all four findings comparable length and tone; more than one can pause movement. Include the Ellis accusation as a selectable but unsupported inference, with appropriate feedback.
11. **Small links:** point the Navajo oral-history invitation to the actual Library of Congress Veterans History Project collection, and link JN-25 back to Agnes Driscoll.
12. **Full invitation audit:** repair any additional genuine gaps. In particular, Claude’s supplementary check flags chapter 15: Diffie–Hellman must let readers change small numbers and observe public values and the agreed shared value, with an authentication limitation.

## Validation and handoff

Test known answers and boundary conditions independently, then operate the actual page handlers. Cover RSA invalid parameters and all message representatives, Stager routes/codewords/nulls/padding and answer hiding, the Mary toggle, ADFGVX intermediate/comparison/decryption/reset, Diffie–Hellman agreement, and the Sealed Letter’s complete progression and distractors. Deliberately restore representative bugs to prove the new guards fail, then restore the fixes.

Run the full repository test suite. Check every changed page at phone width, including the new controls; state whether the check used a handset or a browser frame. Review changed pages and duplicated claims, generated bundles and service-worker freshness. Refresh the audit ledger and source-based audit package as appropriate.

Commit the revised prompt, a chapter-by-chapter invitation audit, and validation evidence. In the PR description quote each affected invitation beside its satisfying change, link the complete 20-chapter audit, and clearly state remaining limits. Open the PR without merging or deploying. The separate manuscript revision prompt is not part of this website PR.
