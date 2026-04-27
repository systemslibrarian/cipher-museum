# How to Validate Cipher Engine Roundtrip and Known-Answer Tests

To ensure all cipher engines and benchmark test cases are working as expected, follow these steps:

## 1. Run the Automated Engine Test Suite

This script tests every registered cipher engine for:
- Existence and encode/decode methods
- Non-empty encode output
- Roundtrip correctness (decode(encode(plaintext)) == plaintext)
- Known-answer tests for published/verified values

**Command:**

```sh
node tests/test-all-engines.js
```

A summary of passes/fails will be printed to the console. All engines should pass for the benchmark to be valid.

## 2. Validate Corpus Test Cases

- Ensure `/corpus/test-cases.json` ciphertexts match the output of the corresponding engine and key.
- For roundtrip ciphers, verify that decoding the ciphertext with the same key returns the original plaintext.

## 3. Troubleshooting

- If any engine fails, check the implementation in `js/ciphers/all-engines.js` and the test definition in `tests/test-all-engines.js`.
- For schema or data errors, run:

```sh
npm run validate:corpus
```

This will check the corpus files for schema and record validity.

---

**Note:** All test and corpus files are tracked in the `/corpus` and `/tests` directories. Update or add new test cases as needed for new engines or plaintexts.
