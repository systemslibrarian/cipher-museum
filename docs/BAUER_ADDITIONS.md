# Bauer historical-method additions

Date: 3 November 2026. Scope: the five approved recommendations from Friedrich L. Bauer, *Decrypted Secrets: Methods and Maxims of Cryptology*, fourth edition (Springer, 2007). All exercise fixtures and wording are original museum material. No book scans, plates or historical intercepts are reproduced.

| Addition | Destination | Source passages | Model boundary |
|---|---|---|---|
| Gripenstierna | `ciphers/gripenstierna.html` (exhibit 173, Hall VII) | Bauer pp. 51, 131–132; Boris Hagelin, *The Story of Hagelin Cryptos*, printed pp. 5–7 / PDF pp. 11–13 | Historical description and access-role schematic, not a machine simulator. Lost original distinguished from reconstruction; factorial arrangements not equated to attack strength. |
| Banburismus evidence | `ciphers/joan-clarke.html#banburismus-experiment` | Bauer pp. 335–336, 415–419; I. J. Good, *Biometrika* 66(2), 1979, pp. 393–396, §3; GCHQ's Joan Clarke biography | Invented strips with independent Bernoulli match indicators, p=0.075 versus 1/26. Both matches and non-matches contribute. No posterior probability over offsets or full historical Banburismus claim. |
| Paired-message kisses | `lab/kisses.html` | Bauer pp. 288–289, 419–421, §19.5.1; Tony Sale's Virtual Bletchley Park registration-room account | Caesar shift already known; Vigenère period assumed five. Fit first five positions; test remaining 15. Same-length different-message control rejects the assumption. Known plaintext is not a generic break of modern encryption. |
| Rejewski cycles | `ciphers/enigma.html#cycle-structure` | Bauer pp. 431–437, §19.6.2.5; Rejewski, *Applicationes Mathematicae* 16(4), 1980, pp. 543–559, DOI 10.4064/am-16-4-543-559 | Eight symbols, six fixed reciprocal substitutions, complete indicator coverage. No rotor stepping. Derive cycles from observed first-to-fourth pairs; plugboard conjugation changes labels, not lengths. |
| Rotor-order policy | `ciphers/enigma.html#key-rules` | Bauer pp. 481–482; US 6812 Division Bombe Report (1944), printed p. 12 / web page 17 | Five available rotors, three distinct selected. 60 unrestricted orders, 59 if exact repetition forbidden, 32 if all repeated positions forbidden. Entropy assumes uniform allowed choices and known previous order/policy. Other key components excluded. |

## Source verification

- Hagelin's account was read directly at printed pp. 5–7. It describes the 26 August 1786 invoice, 57 disks with two alphabets, two viewing slits, operating roles, loss of the original and later replica. The replica is not presented as a surviving original. Beckman's 2002 article is listed as further study; the full article was not available in this session.
- Good's 1979 first-person statistical account and GCHQ's Clarke biography support the historical evidence-weighting context. The exercise's numerical assumptions are explicitly invented.
- The 1944 Bombe report explicitly describes the position exclusion rule and 32 remaining orders. The exercise independently enumerates the count.
- Rejewski's paper is linked through its publisher DOI; Bauer's cited sections supply the specific cycle discussion used here.
- No claim is made to a complete cryptanalytic break from a score, a cycle signature, a reduced search space or an untested crib.

## Integration

Canonical exhibit membership, totals, trust labels, artifact cards, search, sitemap, machine-hall card, timeline and the Alberti–Gripenstierna–Jefferson neighbor chain are updated. Joan Clarke now counts as interactive. Existing exhibit IDs are unchanged. Lab and cryptanalysis doorways lead to the paired-message exercise; Group Theory leads to the cycle demonstration. New assets participate in service-worker versioning.

## Validation record

`tests/test-codebreaking-evidence.js` checks likelihood-ratio arithmetic, negative evidence, alignment overlap, all 40,320 label permutations, all 60 prior rotor orders, the paired-message positive and negative controls, actual DOM control wiring and public model boundaries. It is registered in `tests/run-all.js`.

Six deliberately planted faults were caught: ignoring non-matches, incorrect conjugation, retaining forbidden rotor positions, always confirming a crib, adding instead of subtracting plaintext, and keeping a stale verdict when the case changes. Each fault was removed afterward.

Desktop browser checks exercised both paired-message outcomes, Banburismus controls, cycle relabeling and the 32-order rule. The new machine page and experiment layouts were visually inspected at a 1348 px viewport. No horizontal document overflow was observed on the checked pages. The repository’s static accessibility and mobile-layout audits also passed; that is not a claim of a physical-phone browser test.

This file records implementation and source scope. Deployment must be verified separately from local tests and from presence on a branch.
