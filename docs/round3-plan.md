# Round 3 Plan - Global Expansion

Date: 2026-04-24
Repository: systemslibrarian/cipher-museum
Baseline confirmed from README + museum-map: 63 exhibits across 11 halls, Hall XI Modern Cryptography already shipped.

## Hall numbering confirmation

Round 3 will preserve existing hall order and insert two new halls at the end:
- Hall I: World Origins of Cryptography (rename from Birth of Cryptography)
- Hall II to Hall X: unchanged numbering
- Hall XI: Modern Cryptography (keep existing DES, Diffie-Hellman, RSA, AES, SHA-256)
- Hall XII: Unsolved Ciphers (new)
- Hall XIII: Ciphers in Culture (new)

All hall footers and hall navigation will target 13 halls after integration.

## Slug reservations (no conflicts found)

Collision check run on 2026-04-24 against existing files: no collisions detected for planned slugs.

### Hall I additions
- kama-sutra
- egyptian-substitution
- aeneas-tacticus
- arabic-nomenclators
- rosetta-stone
- histiaeus-tattoo

### Hall II additions
- affine
- argenti
- wallis-ciphers
- wheatstone-cryptograph
- mary-stuart-castelnau-letters
- patterson-jefferson-cipher

### Hall III additions
- trithemius
- cardano-autokey

### Hall V additions
- chinese-telegraph-code
- slidex
- zimmermann-telegram
- morse-code
- commercial-telegraph-codebooks
- diana-cryptosystem

### Hall VI additions
- culper-ring
- arnold-andre

### Hall VII additions
- jn-25
- red-type-a
- fialka
- kl-7
- geheimschreiber
- kryha
- bazeries-cylinder
- m94-m138a

### Hall VIII additions
- cardano-grille

### Hall IX additions
- venona

### Hall XI additions
- kerckhoffs-principle
- sigsaly

### Hall XII additions
- shugborough
- dagapeyeff
- somerton-man
- mccormick
- phaistos-disc

### Hall XIII additions
- da-vinci-code
- national-treasure
- gravity-falls
- cicada-3301
- popular-culture-survey

### Generic-technique additions
- null-cipher-generic
- microdot-stego

### Context/situation additions
- cabinet-noir
- station-hypo
- bletchley-park

### Planned Hall X bio additions (audit-gated)
- joseph-rochefort
- arne-beurling
- dilly-knox
- herbert-yardley
- mavis-batey
- gchq-trio
- david-kahn
- elonka-dunin
- george-lasry

## Structural files planned

- halls/unsolved.html (Hall XII)
- halls/culture.html (Hall XIII)
- cipher-detective.html
- docs/round3-shipped-audit.md
- docs/worldupdates.md

## Working rules

- Round 3 execution follows docs/worldupdates.md phase order.
- SKIP/UPGRADE/BUILD decisions from docs/round3-shipped-audit.md are authoritative for later phases.
- New exhibit pages will follow existing exhibit templates and existing demo-loader engine registration pattern.
