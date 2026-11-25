"""Publish and verify the nine-file v0.8 release under the museum's Hugging Face account."""

import argparse
import hashlib
from pathlib import Path
import os

from huggingface_hub import HfApi

DATASET = "systemslibrarian/cipher-museum-corpus"
EXPECTED = {
    "LICENSE", "README.md", "SHA256SUMS.txt", "all.jsonl.gz",
    "blind.parquet", "change-inventory.json", "cipher-corpus.schema.json",
    "public.parquet", "stats.json",
}


def matches(remote, local):
    if remote.size != local.stat().st_size:
        return False
    data = local.read_bytes()
    if remote.lfs:
        return remote.lfs.sha256 == hashlib.sha256(data).hexdigest()
    header = f"blob {len(data)}\0".encode("ascii")
    return remote.blob_id == hashlib.sha1(header + data).hexdigest()


def publish(folder):
    if {file.name for file in folder.iterdir()} != EXPECTED:
        raise ValueError("Expected only the nine v0.8 release files")
    token = os.getenv("HF_TOKEN")
    if not token:
        raise SystemExit("Add the HF_TOKEN Actions secret, then re-run this job.")
    api = HfApi(token=token)
    if api.whoami()["name"].casefold() != DATASET.split("/")[0]:
        raise SystemExit("The token belongs to a different Hugging Face account.")

    api.create_repo(DATASET, repo_type="dataset", private=False, exist_ok=True)
    info = api.dataset_info(DATASET, files_metadata=True)
    if info.private:
        raise SystemExit("The target dataset already exists and is private.")
    existing = {file.rfilename: file for file in info.siblings}
    for name, remote in existing.items():
        if name == ".gitattributes":
            continue
        if name == "README.md" and set(existing) <= {".gitattributes", "README.md"}:
            continue
        if name not in EXPECTED or not matches(remote, folder / name):
            raise SystemExit(f"Found existing content that differs from the prepared release: {name}")

    if not EXPECTED.issubset(existing) or not matches(existing["README.md"], folder / "README.md"):
        commit = api.upload_folder(
            repo_id=DATASET, repo_type="dataset", folder_path=folder,
            parent_commit=info.sha, commit_message="Publish Cipher Museum Corpus v0.8",
        )
        revision = commit.oid
    else:
        revision = info.sha

    public = HfApi(token=False).dataset_info(DATASET, revision=revision, files_metadata=True)
    remote = {file.rfilename: file for file in public.siblings}
    for name in sorted(EXPECTED):
        if name not in remote or not matches(remote[name], folder / name):
            raise SystemExit(f"Public revision did not verify: {name}")
    print(f"Verified {len(EXPECTED)} files at https://huggingface.co/datasets/{DATASET}/tree/{revision}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("folder", type=Path)
    publish(parser.parse_args().folder)
