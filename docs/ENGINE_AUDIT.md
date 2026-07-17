# Cipher Engine Audit

Final report for the registry-engine verification sweep requested in
[docs/ENGINE_INVENTORY.md](./ENGINE_INVENTORY.md) and governed by
[docs/CIPHER_ENGINE_STANDARD.md](./CIPHER_ENGINE_STANDARD.md).

## Outcome

| Measure | Result | Evidence |
|---|---:|---|
| Registry engines audited | 84 / 84 | [inventory](./ENGINE_INVENTORY.md) |
| Per-engine spec files | 84 / 84 | [tests/engines/specs](../tests/engines/specs/) |
| Fixed known-answer tests | 84 / 84 (66 derived or published, 18 pinned regression vectors) | [known-answers registry](../tests/engines/helpers/known-answers.js) |
| Exact roundtrip contract on declared domains | 84 / 84 | [engine spec helpers](../tests/engines/helpers/engine-spec.js) |
| Robustness coverage | 84 / 84 | empty input, invalid keys, normalization, Unicode policy, 100 KB, and state isolation in [engine spec helpers](../tests/engines/helpers/engine-spec.js) |
| Corpus accounting | 100,026 / 100,026 records explained | [tests/engines/corpus-replay.js](../tests/engines/corpus-replay.js) |
| Corpus unexplained failures | 0 | [tests/engines/corpus-replay.js](../tests/engines/corpus-replay.js) |
| Open P0 findings | 0 | this report |
| Open P1 findings | 0 | this report |
| Open P2 findings | 1 | Diana provenance caveat below |
| Open P3 findings | 2 | corpus metadata drift and seeded-model KAT independence below |

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
| P1 | `hill` | Singular (non-invertible) key matrices produced plausible-looking but irrecoverable ciphertext on encode; encode now validates invertibility and numeric entries the same way decode does. Found and fixed in the post-sweep review. |

## Remaining Findings

| Severity | Scope | Finding | Disposition |
|---|---|---|---|
| P2 | `diana` | The current engine is a reciprocal Beaufort-style implementation and passes roundtrip, fixed-vector, robustness, and corpus checks, but the sweep did not establish an independent authoritative Diana arithmetic/vector from locally available sources. | Keep the engine, but treat it as historically plausible rather than fully provenance-closed until an external primary or secondary source is attached. |
| P3 | Corpus metadata | [public/corpus/README.md](../public/corpus/README.md) reports 100,026 cases across 84 engines, while [corpus/engine-manifest.json](../corpus/engine-manifest.json) header totals do not match the summed manifest rows and three registry engines are absent from that manifest. | Documentation follow-up only. Replay used the canonical [public/corpus/all.jsonl](../public/corpus/all.jsonl) dataset and found 0 unexplained failures. |
| P3 | Seeded-model KATs | 18 seeded pedagogical machine models (`lorenz`, `purple`, `vic`, `sigaba`, `typex`, `fialka`, `kl7`, `geheimschreiber`, `kryha`, `m94`, `m209`, `redTypeA`, `slidex`, `copiale`, `argenti`, `greatCipher`, `babington`, `geezMonastic`, `trifid`) have pinned regression vectors rather than independently derived KATs, because their seeded shuffle pipelines have no external reference. They are labeled `pinned regression vector` in [known-answers.js](../tests/engines/helpers/known-answers.js). | Acceptable for pedagogical models: roundtrip properties, robustness checks, and exact-count corpus pinning still cover them. Upgrade any of them by authoring a genuinely independent reference derivation. |

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

## Post-Sweep Review Remediation (2026-07-17)

An adversarial review of the completed sweep found and fixed the following:

- **`hill` singular-matrix defect (P1, fixed):** encode accepted non-invertible
  matrices and emitted undecryptable ciphertext; it now rejects them with the
  same clear error decode uses, with spec coverage in
  [hill.spec.js](../tests/engines/specs/hill.spec.js).
- **Corpus replay hardening:** deviation rules no longer excuse thrown
  exceptions or missing engines, and a full unfiltered replay now pins the
  exact record totals and per-rule event counts in
  [corpus-replay.js](../tests/engines/corpus-replay.js). An engine regression
  can no longer hide inside an engine-wide deviation rule: any new or vanished
  mismatch changes a pinned count and fails the run.
- **KAT honesty:** seeded-model vectors are now labeled
  `pinned regression vector` instead of claiming independent derivation; the
  tautological single-letter `bifid`/`trifid` and identity `purple` KATs were
  replaced (`bifid` now has a hand-derived Delastelle vector).
- **Exhibit accuracy:** the Playfair mini-challenge, Scytale worked example and
  challenge, and Hill worked example were corrected to match the live engines
  (the Hill example had also used a non-invertible matrix); the Vernam page now
  documents its hex serialization and has an engine-checkable challenge.
- **Standard §5 disclosure:** visible "About this demo" notes were added to the
  13 exhibits affected by filler escaping, seeded models, or generated-pad
  behavior (playfair, hill, stager, scytale, four-square, two-square,
  solitaire, cardano-grille, slidex, lorenz, vic, che-guevara, one-time-pad;
  vernam covered by its rewrite above).
- **Offline cache:** the service-worker cache version was bumped so returning
  and offline visitors receive the corrected engine bundle.

## Release Recommendation

Accept the sweep results.

- Engine correctness: cleared.
- Robustness and state isolation: cleared.
- Corpus replay: cleared with documented deviation rules and 0 unexplained failures.
- Historical accuracy: materially improved; only Diana remains a provenance caveat.
- Follow-up work: reconcile corpus metadata counts and attach a sourced Diana note
  when an authoritative reference is available.