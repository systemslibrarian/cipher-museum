---
pretty_name: Cipher Museum Corpus v0.8
license: other
license_name: cipher-museum-record-specific
license_link: LICENSE
language:
  - en
  - la
  - de
  - es
  - fr
  - it
  - zh
size_categories:
  - 100K<n<1M
tags:
  - cryptography
  - classical-ciphers
  - cryptography-education
  - cipher-museum
configs:
  - config_name: default
    data_files:
      - split: public
        path: public.parquet
      - split: blind
        path: blind.parquet
---

# Cipher Museum Corpus v0.8

Paul A. Clark’s Cipher Museum Corpus contains 100,313 classical cryptography records covering 85 cipher types and seven languages. Students can compare how different ciphers transform a message. Educators and researchers can select examples by cipher, language, difficulty, and verification status. English accounts for 96,665 records. Chinese is represented by one record. [Explore the museum’s interactive corpus](https://ciphermuseum.com/cipher-corpus.html).

## Browse and load

Open the dataset viewer and filter by `cipher_type`. The `public` split contains 70,119 records. The `blind` split contains 30,194. Both splits and their answers are publicly downloadable. For a ciphertext-only exercise, show learners just the ciphertext before revealing the answer.

```python
import json
from datasets import load_dataset

rows = load_dataset("systemslibrarian/cipher-museum-corpus", split="public", streaming=True)
example = next(r for r in rows if r["cipher_type"] == "vigenere" and r["benchmark_eligible"])
print(example["ciphertext"])
print(example["plaintext"], json.loads(example["key_json"]))
```

The two Parquet files power the viewer. They preserve the museum’s IDs, split membership and order within each split. The original `key` object has different fields and value types across ciphers. The viewer stores it as a JSON string called `key_json`, which preserves numeric, text, boolean and nested values. Missing optional top-level fields appear as null. Download [all.jsonl.gz](./all.jsonl.gz) for the exact original records in release order.

## Verification and historical evidence

The corpus includes 100,272 synthetic records and 41 labeled historical. Across the complete release, 99,801 records are marked `benchmark_eligible`. Of these, 99,800 were checked by engine replay and one by documented computation. Select `benchmark_eligible == true` when you need reproducible known-answer pairs.

A reproducible computation answers a different question from whether a surviving historical document contains the quoted text. Of the 41 historical records, the museum classifies 31 as catalogued and unreviewed, seven as reconstructions, two as authentic excerpts, and one as an authentic artifact. Read `authenticity`, `pair_status`, `source_provenance` and any `citation_erratum` together. The separate 87-entry historical supplement is available on the museum site and overlaps the main corpus.

## Files, rights and citation

The original gzip, [record schema](./cipher-corpus.schema.json), [release statistics](./stats.json) and [change inventory](./change-inventory.json) are covered by the museum’s [SHA-256 manifest](./SHA256SUMS.txt). Download all five files into one directory and run `sha256sum -c SHA256SUMS.txt`. The decompressed JSONL digest is recorded in `stats.json`. [Museum release notes](https://ciphermuseum.com/docs/releases/corpus-v0.8.md).

The museum dedicates the synthetic records to the public domain under CC0 1.0. Historical records carry individual rights assertions. Consult each record’s `license` and `source_provenance` when reusing material. [Corpus license](./LICENSE).

Suggested citation: Paul A. Clark (2026), *Cipher Museum Corpus*, version 0.8, [Cipher Museum](https://ciphermuseum.com/cipher-corpus.html). When citing this mirror, include the Hugging Face revision used. The [Zenodo DOI 10.5281/zenodo.23297920](https://doi.org/10.5281/zenodo.23297920) identifies the earlier v0.6 archive. v0.8 has no Zenodo DOI.

The related [Classical Cipher Corpus](https://huggingface.co/datasets/systemslibrarian/classical-cipher-corpus) includes museum-derived records and supports the [Cipher Detective AI Space](https://huggingface.co/spaces/systemslibrarian/cipher-detective-ai). Check for overlapping IDs and texts before using one collection for training and the other for evaluation.
