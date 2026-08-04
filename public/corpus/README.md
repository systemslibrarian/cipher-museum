# Cipher Corpus — Classical Cryptanalysis Benchmark

A comprehensive benchmark library for evaluating classical cipher breaking capabilities, containing **100,026 test cases across 82 cipher algorithms** with historical records, multilingual examples, and verified provenance.

Cipher Corpus is an educational benchmark library for classical cryptanalysis — not a collection of secrets, not a production cryptography resource. Known answers are the point. Learners can hide the solution in Challenge Mode; tools can use the answer metadata for scoring.

## Dataset Statistics

| Metric | Value |
|---|---|
| **Total records** | 100,026 |
| **Cipher types** | 82 |
| **Cipher engines** | 81 of the museum's 84 (dictionaryCode, beale, and cardanoGrille have no corpus family) |
| **Languages** | 10 (en, fr, de, la, es, it, ar, ja, ru, zh) |
| **Historical records** | 100 (spanning 4,000 years, 77 cipher types) |
| **Multilingual records** | 5,348 (fr/de/la/es/it/ar) |
| **Noisy transcription variants** | 484 |
| **Public split** | ~70% |
| **Blind split** | ~30% |

### Difficulty Distribution (Synthetic English Corpus)

| Difficulty | Records |
|---|---|
| Beginner | 14,433 |
| Intermediate | 26,969 |
| Advanced | 27,481 |
| Expert | 26,966 |
| **Core total** | **95,849** |

As of corpus v0.5 (2026-07-17), every record reproduces exactly with the museum's
published, test-verified cipher engines (`npm run test:engines` replays all
100,026 records with pinned accounting), with two documented exception classes:
the intentionally noisy transcription variants and a small set of historical
records whose real-world keys or codebooks the pedagogical engines cannot
represent (each carries an explicit rationale in
`tests/engines/corpus-replay.js`).

## Files

> **Git LFS:** `all.json` (125 MB) and `all.jsonl` (98 MB) are stored via [Git Large File Storage](https://git-lfs.github.com/). Run `git lfs install` before cloning, or `git lfs pull` if you already cloned without it.

| File | Description |
|---|---|
| `all.jsonl` | All 100,026 records (JSONL, one per line) — **Git LFS** |
| `all.json` | All records as JSON array — **Git LFS** |
| `all.csv` | Tabular export of key fields |
| `beginner.jsonl` | 14,433 beginner records (subset of `all.jsonl`) |
| `intermediate.jsonl` | 26,969 intermediate records (subset of `all.jsonl`) |
| `advanced.jsonl` | 27,481 advanced records (subset of `all.jsonl`) |
| `expert.jsonl` | 26,966 expert records (subset of `all.jsonl`) |
| `historical.jsonl` | 100 historical records with provenance — 55 are in `all.jsonl`; 45 v0.4 additions are pending canonical merge (planned v0.6) |
| `multilingual.jsonl` | 5,348 multilingual records — 3,638 are in `all.jsonl`; the 1,710 Arabic (Buckwalter) v0.4 additions are pending canonical merge (planned v0.6) |
| `noisy.jsonl` | 484 noisy transcription variants (subset of `all.jsonl`) |
| `llm-3shot-eval.jsonl` | 300 LLM evaluation prompts (3-shot, 0-shot challenge, key recovery) drawn from the public split only |
| `SHA256SUMS.txt` | SHA-256 checksums for the files above |
| `cipher-corpus.schema.json` | JSON Schema v0.2 |
| `CHANGELOG.md` | Version history |
| `archive/` | Superseded v0.2 expansion/template files kept for history |

**Canonical vs. subsets:** `all.jsonl` is the canonical dataset (100,026 records)
and the only file the engine verification suite replays. The difficulty and
noisy files are strict subsets. `historical.jsonl` and `multilingual.jsonl`
additionally contain the v0.4 expansion records that have not yet been merged
into the canonical set — they are valid records but are not covered by the
pinned replay until the planned v0.6 merge.

### Verify your download

```sh
sha256sum -c SHA256SUMS.txt
```

## Usage

### Python (JSONL)

```python
import json
with open("all.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        record = json.loads(line)
        print(record["id"], record["cipher_type"], record["ciphertext"])
```

### LLM Evaluation Prompts

`llm-3shot-eval.jsonl` contains 300 deterministic evaluation records (one per
line) built from public-split records only. Each record has three prompt
variants with ground-truth targets:

```python
import json
with open("llm-3shot-eval.jsonl") as f:
    for line in f:
        r = json.loads(line)
        prompt = r["prompts"]["three_shot"]["prompt"]       # 3 solved examples + test
        target = r["prompts"]["three_shot"]["evaluation"]["target"]
        # also: r["prompts"]["challenge"] (0-shot, no key)
        #       r["prompts"]["key_recovery"] (recover key from PT/CT pair)
```

Regenerate with `node scripts/generate-llm-eval.js` (deterministic — same
corpus in, same file out).

### Benchmark Splits

Records are labeled `split: public` (70%) or `split: blind` (30%). **Do not train and evaluate on the same split.**

## Cipher Families Covered

Substitution, polyalphabetic, transposition, fractionation, polygraphic, machine/rotor, stream, disk, nomenclator, codebook, steganographic, and encoding — from Caesar to SIGABA, Lorenz, Fialka, KL-7, and Solitaire.

Top cipher types by record count: Caesar (600+), Monoalphabetic (600+), Affine (600+), Vigenère (600+), Columnar Transposition (480+), Playfair (448+), Enigma (420+).

## Historical Records

100 historical records spanning 4,000 years of cryptographic history — from the Hebrew Bible to the Cold War — covering 77 cipher types with verified citations:

**Ancient World (c. 600 BCE – 500 CE):**
- Atbash cipher in the Hebrew Bible (Jeremiah 25:26, c. 600 BCE)
- Spartan scytale dispatches (Plutarch/Thucydides, c. 400 BCE)
- Aeneas Tacticus cipher disk (Poliorketika, c. 360 BCE)
- Caesar's ROT3 cipher (Suetonius, c. 50 BCE) and Augustus's ROT1 variant
- Polybius square signaling (c. 150 BCE)
- Kamasutra mlecchita-vikalpa cipher (Vātsyāyana, c. 200 CE)

**Medieval & Renaissance (500–1700 CE):**
- Ethiopian monastic Ge'ez cipher (c. 1200 CE)
- Argenti papal cipher — Argenti family cryptographers (Vatican, 1585)
- Trithemius tabula recta (Polygraphia, 1518)
- Porta reciprocal cipher (De Furtivis Literarum Notis, 1563)
- Cardano grille and autokey (De Subtilitate, c. 1550)
- Bacon bilateral steganographic cipher (Advancement of Learning, 1605)
- Babington Plot nomenclator (Mary Queen of Scots, 1586)

**18th–19th Century:**
- Gronsfeld numeric-key cipher (Count von Gronsfeld, c. 1734)
- Vigenère demonstration (Traicté des Chiffres, 1586) — 2nd record
- Beaufort reciprocal cipher (Admiral Beaufort, 1857)
- Freemason pigpen cipher (c. 1740)
- Poe Gold Bug monoalphabetic (Graham's Magazine, 1843)
- First telegraph message in Morse code (1844)
- Russian Nihilist Party cipher (Narodnaya Volya, c. 1880)
- Rail fence Civil War telegrams (Union Army, c. 1864)
- Bazeries cylinder cipher (French Army, 1891)

**20th Century:**
- Delastelle bifid, trifid, and four-square ciphers (1901–1902)
- WWI ciphers: ADFGX (1918), double transposition, columnar transposition, running key
- Kryha cipher machine — broken by Friedman in 2.5 hours (1926)
- WWII ciphers: Enigma, Lorenz, TypeX, Slidex, Japanese Red Machine, SOE double transposition
- Soviet straddling checkerboard (NKVD/GRU, c. 1920)
- Vernam one-time pad (patent 1919, proved perfect by Shannon 1949)
- Vietnam War POW tap code (Hanoi Hilton, 1965)
- ROT13 Usenet convention (c. 1982)
- Hill cipher — linear algebra cryptography (1929)
- Kryptos K1 and K3 (CIA headquarters, 1990)
- Solitaire cipher (Neal Stephenson's Cryptonomicon, 1999)
- And 30+ more...

Each historical record includes: `historical_context`, `year`, `source_provenance` with archive URL.

## Analysis Tools

The `scripts/` directory contains automated cryptanalysis tools for research and education:

| Script | Description |
|---|---|
| `scripts/hill-climbing-solver.js` | Monoalphabetic cipher solver: hill climbing + quadgram scoring. 95% accuracy on 80+ char ciphertexts. |
| `scripts/sa-solver.js` | Simulated annealing solver: better than hill climbing on short ciphertexts; SA + HC hybrid mode. |
| `scripts/build-quadgrams.js` | Regenerates English quadgram statistics from corpus plaintext. |
| `scripts/data/english-quadgrams.json` | 8,877 quadgram log-probability entries from 896K corpus observations. |

```bash
# Solve a monoalphabetic cipher (hill climbing):
node scripts/hill-climbing-solver.js "CIPHERTEXT" --restarts 25

# Solve a short cipher (simulated annealing):
node scripts/sa-solver.js "SHORT CIPHER" --restarts 10 --verbose

# Test accuracy on corpus records:
node scripts/hill-climbing-solver.js --corpus public/corpus/beginner.jsonl --limit 20

# Compare SA vs HC:
node scripts/sa-solver.js --compare --corpus public/corpus/beginner.jsonl --limit 30
```

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
| **Cipher Corpus v0.5** | **100,026** | **82** | **Yes (100)** | **Yes (10 langs)** | **Yes** | **No** |

### Cite Cipher Corpus

```bibtex
@misc{lester2026cipherCorpus,
  title={Cipher Corpus: Comprehensive Classical Cryptanalysis Benchmark},
  author={Lester, Paul},
  year={2026},
  url={https://ciphermuseum.com/cipher-corpus.html},
  note={100,026+ test cases across 82 cipher algorithms, 10 languages, 100 historical records}
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
