# Cipher Corpus v0.1 State Report (Phase 1)

## 1. What Exists

### UI & Integration
- **cipher-corpus.html**: Fully implemented browser UI with Challenge/Known mode toggle, record cards, download panel, and Quality Rules.
- **Download links**: Serve all.jsonl, all.json, all.csv, schema, and difficulty splits (beginner/intermediate/advanced/expert).
- **API**: Public JSON endpoints for all records and splits.
- **Integration**: Cipher Detective and Codebreaker's Workbench exist as pages, but no direct integration links from corpus records yet.

### Data Files
- **Corpus files** (in public/corpus/):
  - `all.jsonl`, `all.json`, `all.csv`: Exist and contain synthetic records only.
  - Difficulty splits: `beginner.jsonl`, `intermediate.jsonl`, `advanced.jsonl`, `expert.jsonl` (expert is empty).
  - `cipher-corpus.schema.json`: Present, based on JSON Schema Draft-07, not 2020-12.
- **No historical records** present.
- **No multilingual, noisy, or homophonic records** yet.

### Schema
- Required fields: id, title, cipher_family, cipher_type, plaintext, ciphertext, key, language, alphabet, text_length, normalized_text_length, spacing, punctuation, casing, difficulty, source_type, source, license, expected_attacks, tags, created_by, verified, dataset_version.
- Optional fields: year, historical_context, known_solution_method, hints, tool_notes, related_exhibit_url, try_in_cipher_detective_url, benchmark_split, scoring_notes.

### Quality Rules
- 10 rules published on the page, covering verification, labeling, licensing, attack methods, text length, spacing, reproducibility, and documentation.

## 2. What’s Stubbed or Missing

- **Benchmark Runner**: Not implemented (stubbed as "coming in v0.2").
- **Direct integration links**: Not present in corpus cards for Detective or Workbench.
- **Noisy transcription, multilingual, homophonic, or historical records**: Not present.
- **Blind/public split**: Not implemented.
- **Schema**: Not yet updated for v0.2 fields (`split`, `language` expansion, `transcription_quality`, `source_provenance` object).
- **Contribution workflow**: No CONTRIBUTING.md, record template, or validation script.
- **LLM export/report schema**: Not present.
- **CI validation**: Not present.

## 3. Current Record Count (by Cipher Type & Difficulty)

### Beginner
- Caesar (en, ru, es): 3+
- Atbash (en): 1
- Polybius (en): 1
- Bacon (en): 1

### Intermediate
- Vigenère (en, de, fr): 3+
- Playfair (en): 1
- Rail Fence (en): 1

### Advanced
- Hill (en): 1
- Affine (en, noisy): 1
- Bifid (fr, noisy): 1

### Expert
- Modern ciphers (AES, DES, RSA): 3 (synthetic, for contrast)
- No expert-level classical ciphers yet.

### Homophonic, Multilingual, Noisy
- Not present (to be added in v0.2).

### Historical
- Not present.

## 4. Test & CI
- Test files exist for engines, page structure, and comprehensive validation, but no dedicated corpus validation script.
- No CI hook for corpus validation.

---

**Summary:**  
Cipher Corpus v0.1 is a synthetic-only, English-centric, classical cipher benchmark set with a working browser UI, download panel, and published quality rules. No historical, multilingual, noisy, or homophonic records are present. Schema is not yet v0.2-complete. No direct Detective/Workbench integration, contribution workflow, or benchmark runner yet.

**Ready for Phase 2: Schema Lock.**  
(Gate: State report committed before any code or content changes.)
