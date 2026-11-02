# Independent book review: companion repairs — 2 November 2026

Scope: the actionable museum findings in the independent review of the 267-page November manuscript. This is a bounded repair record, not a new certification of all historical claims or all museum pages.

| Printed invitation / finding | Change that fulfils it |
| --- | --- |
| Chapter 1: route and nomenclator model; review found WORK becoming ORK | Letter-level W now encodes as U plus the repeat-previous token and decrypts to UU; J→I and V→U are explicit. Whole-word nomenclator entries retain their original spelling. The page and engine standard distinguish those cases. |
| Chapter 11: “removing an additive exposes a group that still needs a codebook” | JN-25 now shows code groups after additive removal before the final reading. The separate encrypt display shows code groups before additive addition. Both stages identify the invented letter-level model. The shared Station HYPO widget receives the same display. |
| Chapter 18: “Follow the exhibit to the manuscript images” | Prominent Yale Beinecke MS 408 digital-collection link and institutional collection guide, distinct from the invented teaching playground. |
| Chapter 19: “Open Zodiac in the decipherment case files” | Chapter directory goes directly to `lab/decipherment-cases.html#z340`; the rebuilt manuscript uses the same target for its link and QR. |
| Yardley: “briefed daily” and an unattributed country count | Replaced by the NSA history's qualified description of timely and delayed material. Yardley's claim to have read two dozen countries is attributed to him, with the NSA's incomplete-record caveat. |

Sources newly checked: [NSA, The Black Chamber](https://www.nsa.gov/History/Cryptologic-History/Historical-Events/Article-View/article/2740622/the-black-chamber/); [Yale Beinecke collection guide](https://beinecke.library.yale.edu/beinecke/collections/beinecke-cipher-voynich-manuscript), which links to [MS 408 digitization](https://collections.library.yale.edu/catalog/2002046). The direct collection viewer was not independently usable in the text-retrieval environment; its destination is grounded in Yale's guide.

## Validation

- Full `npm test`: all suites passed after the fixes; includes engine contracts, historical example fixtures, interactions, accessibility, mobile, links, corpus and research checks.
- Babington regression cases cover WORK, V, J, repeated W, full alphabet, three seeds and whole-word WITH/YOUR/MAJESTY entries. Existing TOWER fixture still passes.
- JN-25 regression covers wraparound (`AF`, key `99999` → `09999 09994`), intermediate `10000 10005`, final `AF`, wrong-key output, clearing and mode switches.
- Interaction sweep now selects the final output by its output-box identity, so a newly added intermediate result cannot make the test pass accidentally.
- HTMLHint: 221 files, no errors.
- Browser checks in a 390-pixel iframe (375-pixel content width with scrollbar): Babington round trip; JN-25 intermediate and final stages; Voynich image panel; Yardley qualifiers; expanded chapter directory and its Zodiac destination. No horizontal overflow in those checked pages. These are phone-width checks, not a complete accessibility audit.
- Minified bundles and service-worker version rebuilt. The audit export is regenerated from the committed source and remains a reading export, not proof of every runtime state.

The manuscript changes and source-by-source editorial ledger are distributed with the revised book source. No claims about bestseller potential or exclusive market positioning are added.
