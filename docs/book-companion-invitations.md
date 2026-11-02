# Book companion invitation audit

2 November 2026. Baseline: `e254c6f366cdd954db3ea53683d3318081fa3dc1` (PR #25). Compared against the latest supplied full-length manuscript, chapters 1–20. The quotations below are the actual invitations, not reconstructed summaries.

Scope: website fixes on one unmerged branch. The supplementary manuscript revision recommendations are recorded separately by Claude’s supplied review and are **not implemented in this PR**. The cover and book wording are unchanged.

## Chapter 1 — Changed

> Follow the route in the [Babington exhibit](https://ciphermuseum.com/ciphers/babington.html). The small nomenclator model shows how letters and whole words disappear into signs. Then set the cipher aside for a moment: who controls the delivery, and at what point could a copy reach Walsingham? A message can arrive intact and still have served two readers.

Added sourced delivery and copying routes in babington.html#delivery-route. Existing letter/word teaching nomenclator remains. The two routes avoid claiming Walsingham personally carried every original.

## Chapter 2 — Existing activity retained

> Open the [Great Cipher exhibit](https://ciphermuseum.com/ciphers/great-cipher.html). Its codebook is a teaching model, not the Rossignols' recovered key. Change the seed and watch the same sentence acquire different groups. Then examine the Iron Mask claim in the historical account. Which part follows from a repeatable decipherment, and which needs evidence about a prisoner’s identity?

Great Cipher has a seeded teaching codebook and an explicit distinction between Bazeries’s reading and the disputed Bulonde identification. The engine/model tests cover seeded reproducibility; no new historical claim added.

## Chapter 3 — Changed

> Try a short message in [Stager’s cipher](https://ciphermuseum.com/ciphers/stager.html). Before restoring the route, see what you can infer from the visible words. Afterward, compare that first impression with the recovered instruction. The teaching model lets you inspect the gap between knowing the subject of a dispatch and knowing what someone was ordered to do.

Replaced the static whole-word example with a reader-input exercise: invented route keyword, optional codewords/nulls, incomplete-grid padding, hidden dispatch and independently restored order/vocabulary. The older letter widget remains separately labelled.

## Chapter 4 — Changed

> In the [Zimmermann Telegram exhibit](https://ciphermuseum.com/ciphers/zimmermann.html), follow the versions of the message along their different routes. Consider Hall’s problem: what could he show an American official to establish that the proposal was genuine, and what would that evidence disclose about British access? A translation and an account of how it was obtained answer different questions.

Added 0075 and 13040 route sections. British cable access is distinct from agents obtaining a forwarded copy in Mexico; the text does not invent a single physical path for every copy.

## Chapter 5 — Changed

> Follow a teaching message through the two stages in [ADFGVX](https://ciphermuseum.com/ciphers/adfgvx.html), then change one character and compare the outputs. The model shows how an alteration spreads; the historical account explains how relationships between intercepted messages helped Painvin. His deadline adds the harder question: when would a correct answer arrive too late to be useful?

The deployed ADFGVX widget shows actual intermediate coordinate pairs, counts changes between equal-length encryptions with identical keys, supports reverse stages and clears stale comparisons. Added the ammunition order’s substance and the source-date disagreement.

## Chapter 6 — Existing comparison supported by route repair

> Visit [Herbert Yardley](https://ciphermuseum.com/ciphers/yardley.html), then compare his disclosure with the [Zimmermann Telegram](https://ciphermuseum.com/ciphers/zimmermann.html). In each case, identify what the new audience was allowed to learn about the message and about the organisation reading it. Who benefited from that selection? Who might lose access because of it?

Yardley’s existing disclosure account supplies the first half; chapter 4’s corrected Zimmermann route view supplies the second. This is a reading comparison, not a promised widget.

## Chapter 7 — Changed

> Start with Riverbank in [Elizebeth Friedman’s exhibit](https://ciphermuseum.com/ciphers/elizebeth-friedman.html). The [evidence workbench](https://ciphermuseum.com/lab/evidence-workbench.html) gives you a place to record a reading and its assumptions. Try to describe a proposed rule so another person could apply it without knowing your preferred answer. What observation would persuade you to abandon it?

Expanded Riverbank with cited context and a direct evidence-workbench link. The workbench’s typed-key and evidence/provenance controls already exist.

## Chapter 8 — Changed

> Follow the ships and radio traffic in [Elizebeth Friedman’s exhibit](https://ciphermuseum.com/ciphers/elizebeth-friedman.html). Choose a claimed link between a message and a person. What other record would help an investigator establish it? Then return to the Bear Cat episode in this chapter: the same reading had different possibilities before and after the cutter turned back.

Added Bear Cat’s September 1930 pursuit and the Mobile → Washington → New Orleans evidence sequence, with Kahn/Weadon citations. No unverified direct Bear Cat quotation reproduced. Removed the Sargo source note.

## Chapter 9 — Changed

> In [Enigma](https://ciphermuseum.com/ciphers/enigma.html), watch a repeated letter change as the rotors advance, then reset the settings to reproduce a result. Compare that predictable mechanism with the historical message-key procedures described in the exhibit. Which part of the Polish achievement concerned the machine, and which depended on the way its operators used it?

Added doubled message-key procedure, same-plaintext/different-ciphertext positional relationships and the September 1938 change, citing Rejewski’s own paper. Existing Enigma simulator remains separate from historical attack claims.

## Chapter 10 — Existing activity retained

> Visit [Joan Clarke](https://ciphermuseum.com/ciphers/joan-clarke.html) and [Enigma](https://ciphermuseum.com/ciphers/enigma.html). Follow the work from a candidate setting to a checked reading. Then trace the books from U-559 through this chapter. Where did a captured object become a usable clue, and what still had to happen before it could affect a ship’s route?

Joan Clarke explains Banburismus; Enigma provides settings and repeatable encryption. U-559 is explicitly an exercise in returning to the chapter, not a new website simulator. Existing Enigma tests remain applicable.

## Chapter 11 — Link added

> Meet [Agnes Driscoll](https://ciphermuseum.com/ciphers/agnes-driscoll.html), then try the two layers in the [JN-25 teaching model](https://ciphermuseum.com/ciphers/jn-25.html). Removing an additive exposes a group whose meaning still needs a codebook. Return to the Midway water report: which uncertainty did that test reduce, and which decisions still belonged to Nimitz?

The JN-25 two-layer teaching example already separates additive removal from codebook lookup. Added a direct return link to Agnes Driscoll.

## Chapter 12 — Link corrected

> Try the short spelling exercise in the [Navajo Code Talkers exhibit](https://ciphermuseum.com/ciphers/navajo-code-talkers.html), then follow its linked oral histories. The exercise shows one mechanism; the veterans describe the work of using language and code as Marines. What can a printed dictionary tell you about that work, and what becomes visible only through their accounts?

The short spelling exercise and Smithsonian oral history already exist. The misleading Veterans History Project label now links directly to LOC’s Navajo Code Talkers collection, not a research guide.

## Chapter 13 — Existing activity retained

> Open [Lorenz](https://ciphermuseum.com/ciphers/lorenz.html) and [Bill Tutte](https://ciphermuseum.com/ciphers/bill-tutte.html). Follow the observations that pointed to repeating structures before examining the machine. Which inference could be tested against another stretch of intercepted material? The route from a promising period to reliable intelligence involved more than finding a pattern once.

Lorenz and Bill Tutte already explain the depth, inferred wheel periods and the distinction between a pattern and reliable intelligence. The invitation asks readers to follow observations, not reproduce Tutte’s discovery.

## Chapter 14 — Changed

> Compare [VENONA](https://ciphermuseum.com/ciphers/venona.html) with [the one-time pad](https://ciphermuseum.com/ciphers/one-time-pad.html). The demonstrations expose what reuse makes possible. Then use the NSA historical releases linked in this chapter’s notes to examine a translation. Look separately at recovered text, missing passages and editorial identifications. What evidence would you need before turning a cover name into an accusation against a person?

Aligned OTP with manufacturing duplication, partial reading and investigative corroboration. VENONA now distinguishes digitwise mod-10 addition from bitwise XOR and names Lamphere with an FBI historical source. Existing reuse demonstrations remain.

## Chapter 15 — Additional gap fixed

> Try the small numbers in [Diffie–Hellman key exchange](https://ciphermuseum.com/ciphers/diffie-hellman.html). Observe what the two participants publish and how they arrive at a shared value. The arithmetic does not establish who is at the other end. What further evidence would let you trust the identity of the person with whom you had established the secret?

Supplementary Claude review confirmed this page had only a static example. Added editable Alice/Bob exponents for p=23,g=5, both published values and both shared-value calculations, validation and an identity/authentication limitation.

## Chapter 16 — Changed

> Explore the public and private keys in the [RSA teaching model](https://ciphermuseum.com/ciphers/rsa.html). A successful round trip shows that the displayed keys work together. What would it tell you about the person offering the public key? Keep that gap in mind as you follow PGP’s struggle to make usable privacy available beyond government offices. These small numbers protect no real correspondence.

Added editable bounded RSA primes/exponent/message, n/φ(n)/d and both keys, encryption/decryption and invalid-input handling. Tested all 187 representatives for the default modulus, including non-coprime messages. Clearly labelled an insecure toy.

## Chapter 17 — Existing activity retained

> Open the [Copiale case file](https://ciphermuseum.com/lab/decipherment-cases.html#copiale). Compare the initial hypothesis with the recovered role of the ordinary letters, then use the [teaching demonstration](https://ciphermuseum.com/ciphers/copiale.html) to explore separators and homophones. What evidence changed the researchers' interpretation? Replaying their result lets you examine that change; it is not an independent decipherment of the manuscript.

Copiale case file describes the failed initial hypothesis; the teaching model exposes homophones/separators and labels its scope. No independent historical decipherment is promised.

## Chapter 18 — Existing source route retained

> Follow the [Voynich exhibit](https://ciphermuseum.com/ciphers/voynich.html) to the manuscript images. Choose a repeated mark or a page arrangement that another reader can locate. Now consider a proposed meaning. What additional evidence would connect the two? You can make a useful observation about the manuscript even when its language remains unread.

Voynich links to manuscript images and treats proposed readings as unestablished. The activity is observation and evidence assessment, not a claimed solution.

## Chapter 19 — Existing replay retained

> Open Zodiac in [the decipherment case files](https://ciphermuseum.com/lab/decipherment-cases.html). Replay the first nine rows with the published key, then compare the raw and normalised readings. The labels stand for historical symbols rather than reproducing the handwriting. Which changes are visible in the explanation, and what does the recovered text actually establish about its author?

The case file provides the first nine-row Z340 replay, the published key, raw spellings and explicit normalized interpretations. Existing fixture/provenance tests cover the replay; it does not claim authorship identification.

## Chapter 20 — Changed

> Open [Mary’s recovered Castelnau letters](https://ciphermuseum.com/ciphers/mary-stuart-castelnau-letters.html) and follow the case-file link. Compare the roles of letters, word signs and modifiers in the labelled teaching example. Then follow the research source to the seven surviving plaintext copies. What could those copies confirm, and what could the ciphertext restore that an earlier reader had omitted?

Added an invented repeat control and live comparison of letter, null and word-sign roles. Verified F42/F46/F58/F69/F78/F96/F221 against the 2023 article §5.1; linked the article/PDF inventory and case file.

## Sealed Letter (additional reader activity)

The investigation now takes place after 09:12; the room-four note is a later observation and only further movement is paused. All four verdicts have comparable length, multiple options pause movement, and the Ellis accusation can be chosen and rejected for its evidential flaw. The existing complete-case test exercises the stages, wrong choices, final finding and restart.

## Evidence and limits

- Mary’s seven counterparts and repeat/delete controls were checked directly in the Lasry–Biermann–Tomokiyo article (§4, Figure 7, §5.1), using the open PDF mirror when the publisher returned 403.
- Enigma’s procedure and September 1938 change were checked in Rejewski’s 1980 paper, DOI 10.4064/am-16-4-543-559.
- New Orleans/CEC was checked in Patrick Weadon’s NSA account; Riverbank in the Marshall Foundation account. Bear Cat is paraphrased from the book’s Kahn chapter-22 source context, not independently reverified against a page image of Kahn. The proposed quotation is not repeated on the website.
- The ammunition-order passage preserves the difference between Kahn’s chronology and the French Ministry of Armed Forces account. It does not harmonize conflicting dates silently.
- Original prompt route arrows were revised: delivery and intelligence copies are different paths; obtaining the Mexican copy is not the same as the British transatlantic interception.
- No new exhibit count, historical attack capability, decipherment claim, or identity proof is asserted by the toy models.
- Existing invitations were reviewed against page content and applicable repository tests. Browser operation focused on changed activities; this is not a fresh independent historical audit of every unchanged exhibit or a copyright/similarity certification of the manuscript.

## Validation

Working validation record: `tests/test-book-invitations.js`, the full `npm test` runner, and `tests/phone-preview.html` (390-pixel frame; about 375 pixels of content after the scrollbar, not a physical handset).

Fourteen deliberate regressions were caught before restoring the code: RSA arithmetic and invalid primes; Stager direction, null removal, vocabulary and restore wiring; Mary toggle; DH agreement; ADFGVX intermediate and comparison; puzzle answer length and Ellis option; OTP historical regression; VENONA algebra wording. The restored focused suite passes.

Phone-width review covered all 14 changed HTML pages. The new RSA, Stager, Mary, ADFGVX and Diffie–Hellman controls were operated in the browser; the Sealed Letter was completed with both the Ellis accusation and supported finding. No page-level horizontal overflow was observed (390-pixel frame, 375-pixel content width). Final full-suite results are recorded in the PR description. No merge or deployment is authorized by this work item.
