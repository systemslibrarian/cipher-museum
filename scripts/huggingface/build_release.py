from collections import Counter
from contextlib import ExitStack
from hashlib import sha256
from pathlib import Path
import gzip
import json
import shutil

import pyarrow as pa
import pyarrow.parquet as pq

import argparse

parser = argparse.ArgumentParser(description="Build the Cipher Museum v0.8 Hugging Face mirror.")
parser.add_argument("out", type=Path)
args = parser.parse_args()
src = Path("public/corpus/v0.8")
out = args.out
out.mkdir(parents=True, exist_ok=True)
shutil.copyfile(Path(__file__).with_name("dataset-card.md"), out / "README.md")
stats = json.loads((src / "stats.json").read_text())
for entry in (src / "SHA256SUMS.txt").read_text().splitlines():
    checksum, name = entry.split()
    assert sha256((src / name).read_bytes()).hexdigest() == checksum
    shutil.copyfile(src / name, out / name)
shutil.copyfile(src / "SHA256SUMS.txt", out / "SHA256SUMS.txt")
shutil.copyfile(src.parent / "LICENSE", out / "LICENSE")

fields = []
text = pa.string()
for name in ("id title cipher_family cipher_type plaintext ciphertext key_json language alphabet text_length "
             "normalized_text_length spacing punctuation casing difficulty source_type source license expected_attacks "
             "tags created_by verified dataset_version split transcription_quality source_provenance authenticity "
             "pair_status verification_method benchmark_eligible corpus_version source_batch notes year historical_context "
             "known_solution_method original_ciphertext citation_erratum related_exhibit_url scoring_notes").split():
    dtype = text
    if name in ("text_length", "normalized_text_length"):
        dtype = pa.int64()
    elif name in ("benchmark_eligible", "verified"):
        dtype = pa.bool_()
    elif name in ("expected_attacks", "tags"):
        dtype = pa.list_(text)
    elif name == "source_provenance":
        dtype = pa.struct([(k,text) for k in ("url", "archive", "publication_date", "license")])
    elif name == "citation_erratum":
        dtype = pa.struct([(k,text) for k in ("status", "previous_url", "previous_archive", "reviewed_on", "note")])
    fields.append((name, dtype))
schema = pa.schema(fields)
counts = Counter()
raw_hash = sha256()
split_hashes = {s:sha256() for s in stats["by_split"]}
def fingerprint(r):
    return (json.dumps(r, separators=(",",":"), sort_keys=True, ensure_ascii=False)+"\n").encode()
with ExitStack() as stack:
    writers = {s:stack.enter_context(pq.ParquetWriter(out / (s+".parquet"), schema, compression="zstd")) for s in split_hashes}
    buffers = {s:[] for s in writers}
    with gzip.open(src / "all.jsonl.gz", "rb") as source:
        for line in source:
            raw_hash.update(line)
            row = json.loads(line)
            split = row["split"]
            split_hashes[split].update(fingerprint(row))
            row["key_json"] = json.dumps(row.pop("key"), separators=(",",":"), ensure_ascii=False)
            buffers[split].append(row)
            counts[split] += 1
            if len(buffers[split]) == 4096:
                writers[split].write_table(pa.Table.from_pylist(buffers[split], schema=schema))
                buffers[split].clear()
    for s,rows in buffers.items():
        if rows:
            writers[s].write_table(pa.Table.from_pylist(rows, schema=schema))
assert counts == stats["by_split"] and raw_hash.hexdigest() == stats["raw_jsonl_sha256"]
for s,expected in split_hashes.items():
    result = sha256()
    file = pq.ParquetFile(out / (s+".parquet"))
    assert file.metadata.num_rows == counts[s]
    for batch in file.iter_batches(batch_size=2048):
        for row in batch.to_pylist():
            row = {k:v for k,v in row.items() if v is not None}
            row["key"] = json.loads(row.pop("key_json"))
            result.update(fingerprint(row))
    assert expected.digest() == result.digest(), s
print('Verified raw digest and exact semantic round-trip of every record in both Parquet splits:', counts)
