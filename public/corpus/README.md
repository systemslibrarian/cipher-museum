# Cipher Corpus — Classical Cryptanalysis Benchmark

A comprehensive benchmark library for evaluating classical cipher breaking capabilities, containing **21,602+ test cases across 82+ cipher algorithms** with historical records, multilingual examples, and verified provenance.

Cipher Corpus is an educational benchmark library for classical cryptanalysis — not a collection of secrets, not a production cryptography resource. Known answers are the point. Learners can hide the solution in Challenge Mode; tools can use the answer metadata for scoring.

## Dataset Statistics

| Metric | Value |
|---|---|
| **Total records** | 21,602 |
| **Cipher types** | 82 |
| **Cipher engines** | 84 |
| **Languages** | 9 (en, fr, de, la, es, it, ja, ru, zh) |
| **Historical records** | 55 |
| **Multilingual records** | 3,638 |
| **Noisy transcription variants** | 484 |
| **Public split** | ~70% |
| **Blind split** | ~30% |

### Difficulty Distribution (Synthetic English Corpus)

| Difficulty | Records |
|---|---|
| Beginner | 2,460 |
| Intermediate | 4,422 |
| Advanced | 5,176 |
| Expert | 5,367 |
| **Core total** | **17,425** |

All core records pass roundtrip verification (`decrypt(encrypt(plaintext)) == plaintext`).

## Files

| File | Description |
|---|---|
| `all.jsonl` | All 21,602 records (JSONL, one per line) |
| `all.json` | All records as JSON array |
| `all.csv` | Tabular export of key fields |
| `beginner.jsonl` | 2,460 beginner records |
| `intermediate.jsonl` | 4,422 intermediate records |
| `advanced.jsonl` | 5,176 advanced records |
| `expert.jsonl` | 5,367 expert records |
| `historical.jsonl` | 55 historical records with provenance |
| `multilingual.jsonl` | 3,638 multilingual records (fr/de/la/es/it) |
| `noisy.jsonl` | 484 noisy transcription variants |
| `llm-3shot-eval.jsonl` | 300 LLM 3-shot evaluation prompts |
| `cipher-corpus.schema.json` | JSON Schema v0.2 |
| `CHANGELOG.md` | Version history |

## Usage

### Python (JSONL)

```python
import json
with open("all.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        record = json.loads(line)
        print(record["id"], record["cipher_type"], record["ciphertext"])
```

### 3-Shot LLM Evaluation

Use `llm-3shot-eval.jsonl` for structured LLM evaluation. Each record includes:
- `prompts.three_shot.prompt` — 3-shot prompt with examples
- `prompts.challenge.prompt` — 0-shot challenge (no key)
- `prompts.key_recovery.prompt` — key recovery from known PT/CT pair
- `evaluation.target` — ground-truth answer for scoring

```python
import json
with open("llm-3shot-eval.jsonl") as f:
    for line in f:
        r = json.loads(line)
        prompt = r["prompts"]["three_shot"]["prompt"]
        target = r["prompts"]["three_shot"]["evaluation"]["target"]
        # Send prompt to LLM, compare response to target
```

### Benchmark Splits

Records are labeled `split: public` (70%) or `split: blind` (30%). **Do not train and evaluate on the same split.**

## Cipher Families Covered

Substitution, polyalphabetic, transposition, fractionation, polygraphic, machine/rotor, stream, disk, nomenclator, codebook, steganographic, and encoding — from Caesar to SIGABA, Lorenz, Fialka, KL-7, and Solitaire.

Top cipher types by record count: Caesar (600+), Monoalphabetic (600+), Affine (600+), Vigenère (600+), Columnar Transposition (480+), Playfair (448+), Enigma (420+).

## Historical Records

55 historical records spanning 150 BCE to 1999 CE, including:
- Caesar's cipher (documented by Suetonius, c. 121 AD)
- Babington Plot nomenclator (Mary Queen of Scots, 1586)
- Zimmermann Telegram (Room 40, 1917)
- Enigma training vectors (Bletchley Park, WWII)
- VENONA intercepts (NSA, 1944-1980)
- Kryptos K1 and K3 (CIA headquarters, 1990)
- And 49 more...

Each historical record includes: `historical_context`, `year`, `source_provenance` with archive URL.

## Attribution & Related Work

### CipherBank Foundation

Cipher Corpus builds on the pioneering work of **CipherBank** by Li et al. (2025), which established the first systematic benchmark for LLM classical cryptanalysis evaluation, demonstrating that even advanced models achieve only ~45% accuracy on classical cipher tasks.

**CipherBank Resources:**
- [Research Paper (arXiv:2504.19093)](https://arxiv.org/pdf/2504.19093)
- [Dataset (Hugging Face)](https://huggingface.co/datasets/yu0226/CipherBank)
- [Code (GitHub)](https://github.com/Leey21/CipherBank)

**CipherBank citation:**
```bibtex
@article{li2025cipherbank,
  title={CipherBank: Exploring the Boundary of LLM Reasoning Capabilities through Cryptography Challenges},
  author={Li, Yu and Pei, Qizhi and Sun, Mengyuan and Lin, Honglin and Ming, Chenlin and Gao, Xin and Wu, Jiang and He, Conghui and Wu, Lijun},
  journal={arXiv preprint arXiv:2504.19093},
  year={2025},
  url={https://arxiv.org/pdf/2504.19093}
}
```

### Comparison with CipherBank

| Benchmark | Records | Algorithms | Historical | Multilingual | Blind Splits | LLM Eval Format |
|---|---|---|---|---|---|---|
| CipherBank (Li et al., 2025) | 2,358 | 9 | No | No | No | No |
| **Cipher Corpus v0.2** | **21,602** | **82** | **Yes (55)** | **Yes (9 langs)** | **Yes** | **Yes** |

### Cite Cipher Corpus

```bibtex
@misc{lester2026cipherCorpus,
  title={Cipher Corpus: Comprehensive Classical Cryptanalysis Benchmark},
  author={Lester, Paul},
  year={2026},
  url={https://ciphermuseum.com/cipher-corpus.html},
  note={21,602+ test cases across 82+ cipher algorithms, 9 languages}
}
```

## Quality Rules

All Cipher Corpus records must:
- Include both plaintext and ciphertext with the key/settings required to reproduce the encryption.
- Specify cipher family and cipher type.
- State the language, alphabet, and casing.
- Specify spacing and punctuation handling.
- Assign a difficulty level (beginner, intermediate, advanced, expert).
- Include expected attack methods.
- Include source type and license (CC0 for synthetic).
- Pass JSON Schema validation (see `cipher-corpus.schema.json`).
- Historical records must include provenance and rights.

Validation is enforced via JSON Schema and automated test scripts in `tests/` and `scripts/`.

## License

- Synthetic records: **CC0** (public domain)
- Historical records: **public domain** (per-record attribution)
- Code and infrastructure: **MIT**
- See `CITATION.cff` for academic citation format.

## How to Contribute

Submit records with: plaintext, ciphertext, cipher type, key/settings, source, license, verification status, expected attacks, and difficulty. Historical submissions must include source and rights. See the [Cipher Corpus page](https://ciphermuseum.com/cipher-corpus.html) for the community submission form.
