# Cipher Engine Standard

This is the contract for every engine registered in `window.CipherEngines`.
Engine 85 must satisfy it before its exhibit is merged.

## 1. Public API

Every registry entry is an object with these methods:

```js
{
  encode(text, key): string,
  decode(text, key): string
}
```

- `text` and `key` may be omitted or `null`; an engine must not leak a native
  `TypeError`, `RangeError`, `undefined`, `NaN`, or replacement glyph.
- Both methods return strings. An engine with no safe default may return a clear,
  documented error string; it must never return plausible-looking partial output.
- Optional methods are allowed, but must be documented and tested. For example,
  `venonaPadReuse` exposes crib-drag helpers.
- An explicit key makes output deterministic unless probabilistic encoding is part
  of the documented historical system. Random choices must still be reproducible
  under a test-only injected source.
- Calls are isolated. Running engine A, then B, then A again with the same arguments
  must produce the same A result.

## 2. Text policy

Each engine must declare one input policy in its exhibit and spec:

| Policy | Required behavior |
|---|---|
| Preserve | Preserve case, spacing, punctuation, digits, and unsupported Unicode byte-for-byte. |
| A-Z | Normalize to NFD, remove combining marks, uppercase, then retain A-Z only. |
| Alphanumeric | Normalize as above, then retain A-Z and 0-9. |
| Word/codebook | Normalize each supported word, preserve word boundaries, and use a reversible literal fallback for out-of-vocabulary words. |
| Binary/teleprinter | State the byte or symbol encoding and ciphertext serialization explicitly. |

Composed and decomposed accents must have the same defined result. Thus `é` and
`e\u0301` either both become `E` or are both rejected; they may not diverge silently.
CJK, RTL text, and emoji must likewise be preserved, normalized away, or rejected by
an explicit policy.

Intrinsic historical aliases are allowed only when declared, such as Playfair J/I,
Tap Code K/C, and Babington's 24-letter Elizabethan alphabet (J/I, V/U, and W
omitted — historically written as double-V).

## 3. Reversible framing

For every plaintext in the declared domain and every valid key:

```js
decode(encode(plaintext, key), key) === canonicalize(plaintext)
```

- Do not test with `startsWith`, broad `clean()` comparisons, or unconditional
  trailing-X removal.
- Padding and separator symbols must be escaped or length-framed so literal user
  data cannot be mistaken for structure.
- Block engines must support more than one block; they may not truncate overflow.
- Codebook fallback formats must preserve every supported letter and word boundary.
- If the historical method is inherently ambiguous, either expose metadata needed
  to reverse it or narrow and document the accepted plaintext domain.

## 4. Key handling

- Normalize first, then apply a documented default. A key such as `!!!` must not
  become an empty array that later emits `undefined`.
- Numeric dimensions are bounded before allocation. Current browser demos use a
  maximum practical dimension of 10,000.
- Matrix keys are validated for size and invertibility before encryption.
- Pads must be at least as long as the normalized message. A nonempty short pad is
  rejected clearly rather than silently extended.
- Automatic one-time-pad material uses `crypto.getRandomValues` with rejection
  sampling; `Math.random`, timestamps, and linear congruential generators are not
  acceptable.
- A key parameter that is informational or ignored must say so in the exhibit.

## 5. Historical contract

The exhibit must distinguish among:

1. a historically faithful implementation;
2. a named, documented variant;
3. a pedagogical structural model.

Material omissions must be visible beside the demo. Examples include missing motor
wheels, reconstructed codebooks, reduced alphabets, generated rotor wirings, omitted
key-derivation stages, and a smaller vocabulary. A source-code comment alone is not
sufficient museum disclosure.

The engine must not claim a historical name while implementing a different primitive.
For example, Vernam is bitwise XOR, not modular A-Z addition.

## 6. Required spec

Add exactly one file at `tests/engines/specs/<engine>.spec.js`. It must register:

- a `fast-check` roundtrip property with at least 250 generated cases for ordinary
  engines, or 100 for unusually expensive models;
- deterministic examples for empty input, one character, repeated characters,
  alphabet boundaries, key length one, repeated keys, and key longer than plaintext;
- one fixed KAT with a published source, or an inline derivation independent of the
  production engine;
- invalid-key checks for omitted, empty, non-alphanumeric, out-of-range, and
  structurally invalid keys;
- the declared case, punctuation, nonalphabet, CJK, RTL, emoji, and normalization
  policy;
- an exact 100 KB roundtrip with a five-second ceiling;
- an interleaved A/B/A state-isolation check.

Do not produce a KAT by running the engine and copying its output. Seeded pedagogical
models require a separately implemented derivation or reference model.

## 7. Cross-validation and corpus

- Use a reference implementation where available: Node `crypto`, a published
  machine simulator, an official table, or a standards document.
- Replay every matching Cipher Corpus record. The replay must compare both encode
  and decode paths and must not skip historical, noisy, or complex records silently.
- Every mismatch needs an executable deviation rule containing a narrow predicate
  and rationale. Blanket rules such as “all historical records” are forbidden.
- Corpus metadata must contain enough key material to reproduce a record. A label
  such as “Declaration opening” or a shortened pad is not a key.
- Intentionally noisy records are evaluation fixtures, not valid engine KATs.

## 8. Build and CI

- `npm run test:engines` is the required local and CI command.
- It runs all 84+ per-engine specs, legacy KAT suites, full Enigma vectors, and full
  corpus replay.
- `.github/workflows/ci.yml` must run it on every push and pull request.
- After source changes, run `npm run build:js` and verify the minified browser bundle
  is fresh.
- No engine may be registered unless the source, minified bundle, spec, exhibit
  disclosure, and corpus mapping land together.