# Cipher Engine Audit

Final report for the registry-engine verification sweep requested in
[docs/ENGINE_INVENTORY.md](./ENGINE_INVENTORY.md) and governed by
[docs/CIPHER_ENGINE_STANDARD.md](./CIPHER_ENGINE_STANDARD.md).

## Outcome

| Measure | Result | Evidence |
|---|---:|---|
| Registry engines audited | 84 / 84 | [inventory](./ENGINE_INVENTORY.md) |
| Per-engine spec files | 84 / 84 | [tests/engines/specs](../tests/engines/specs/) |
| Fixed known-answer tests | 84 / 84 | [known-answers registry](../tests/engines/helpers/known-answers.js) |
| Exact roundtrip contract on declared domains | 84 / 84 | [engine spec helpers](../tests/engines/helpers/engine-spec.js) |
| Robustness coverage | 84 / 84 | empty input, invalid keys, normalization, Unicode policy, 100 KB, and state isolation in [engine spec helpers](../tests/engines/helpers/engine-spec.js) |
| Corpus accounting | 100,026 / 100,026 records explained | [tests/engines/corpus-replay.js](../tests/engines/corpus-replay.js) |
| Corpus unexplained failures | 0 | [tests/engines/corpus-replay.js](../tests/engines/corpus-replay.js) |
| Open P0 findings | 0 | this report |
| Open P1 findings | 0 | this report |
| Open P2 findings | 1 | Diana provenance caveat below |
| Open P3 findings | 1 | corpus metadata drift below |

## Resolved Findings

The sweep found real correctness defects. They were fixed in
[js/ciphers/all-engines.js](../js/ciphers/all-engines.js) and locked in with the
new per-engine spec suite.

| Severity | Engines | Issue resolved |
|---|---|---|
| P0 | `otp`, `vernam` | Replaced historically incorrect pad/key behavior: OTP now uses browser CSPRNG semantics for generated pad material, and Vernam is true bytewise XOR rather than mod-26 addition. |
| P0 | `lorenz`, `purple`, `vic` | Replaced structurally incorrect models with materially more faithful implementations matching the claimed primitive family. |
| P1 | `homophonic`, `hill`, `playfair`, `stager`, `scytale`, `foursquare`, `twosquare`, `solitaire`, `slidex` | Removed lossy padding and framing behavior so exact decode-after-encode is preserved on the declared plaintext domain. |
| P1 | `dictionaryCode`, `nihilist`, `bookCipher`, `cardanoGrille` | Fixed empty-input handling, fallback loss, and overflow truncation. |
| P1 | `vigenere`, `beaufort`, `runningKey`, `confederateVigenere`, `porta`, `railFence`, `nullCipher`, `geezMonastic` | Fixed invalid-key normalization and bounds handling so malformed keys do not crash or silently corrupt output. |
| P1 | `jefferson` | Corrected malformed disk wiring data. |
| P1 | `adfgvx`, `venonaPadReuse`, `bazeries`, `nomenclator` | Aligned normalization and key-handling behavior with the shared engine contract. |

## Remaining Findings

| Severity | Scope | Finding | Disposition |
|---|---|---|---|
| P2 | `diana` | The current engine is a reciprocal Beaufort-style implementation and passes roundtrip, fixed-vector, robustness, and corpus checks, but the sweep did not establish an independent authoritative Diana arithmetic/vector from locally available sources. | Keep the engine, but treat it as historically plausible rather than fully provenance-closed until an external primary or secondary source is attached. |
| P3 | Corpus metadata | [public/corpus/README.md](../public/corpus/README.md) reports 100,026 cases across 84 engines, while [corpus/engine-manifest.json](../corpus/engine-manifest.json) header totals do not match the summed manifest rows and three registry engines are absent from that manifest. | Documentation follow-up only. Replay used the canonical [public/corpus/all.jsonl](../public/corpus/all.jsonl) dataset and found 0 unexplained failures. |

No open P0 or P1 engine defects remain after the sweep.

## Engine Disposition

The inventory document remains the canonical per-engine API and provenance table.
This section records final audit status only.

### Pass After Historical Rewrite

`otp`, `vernam`, `lorenz`, `purple`, `vic`

These engines required substantive historical or primitive-level correction and now
pass the shared contract, fixed-vector checks, and corpus replay on their declared
domains.

### Pass After Functional Correction

`homophonic`, `playfair`, `hill`, `vigenere`, `beaufort`, `porta`,
`runningKey`, `railFence`, `adfgvx`, `nihilist`, `venonaPadReuse`,
`confederateVigenere`, `bazeries`, `jefferson`, `dictionaryCode`, `stager`,
`scytale`, `foursquare`, `twosquare`, `solitaire`, `nomenclator`,
`bookCipher`, `cardanoGrille`, `nullCipher`, `slidex`, `geezMonastic`

These engines had correctness, reversibility, overflow, or invalid-key defects at
the start of the sweep and now pass the shared contract.

### Pass With No Open Findings

`caesar`, `monoalphabetic`, `polybius`, `gronsfeld`, `columnar`,
`doubleTransposition`, `bacon`, `tapCode`, `pigpen`, `bifid`, `trifid`,
`adfgx`, `fractionatedMorse`, `alberti`, `enigma`, `greatCipher`,
`babington`, `navajo`, `voynich`, `atbash`, `rot13`,
`straddlingCheckerboard`, `chaocipher`, `m209`, `beale`, `copiale`,
`kryptos`, `autokey`, `sigaba`, `typex`, `kamaSutra`, `aeneasTacticus`,
`jn25`, `redTypeA`, `affine`, `trithemius`, `cardanoAutokey`,
`wheatstone`, `morse`, `fialka`, `kl7`, `geheimschreiber`, `kryha`, `m94`,
`chineseTelegraph`, `zimmermann`, `commercialCode`, `culperRing`,
`arnoldAndre`, `argenti`, `wallisCiphers`, `joseonYeokhak`

These engines satisfied the current contract once they were covered by the new
roundtrip, robustness, known-answer, and corpus replay suite.

### Pass With One Open Caveat

`diana`

Current status: contract-compliant and reproducible, but historical provenance is
still one source short of full closure.

## Release Recommendation

Accept the sweep results.

- Engine correctness: cleared.
- Robustness and state isolation: cleared.
- Corpus replay: cleared with documented deviation rules and 0 unexplained failures.
- Historical accuracy: materially improved; only Diana remains a provenance caveat.
- Follow-up work: reconcile corpus metadata counts and attach a sourced Diana note
  when an authoritative reference is available.