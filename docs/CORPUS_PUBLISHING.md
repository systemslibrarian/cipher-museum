# Publishing the Cipher Corpus (DOI + mirrors)

Steps that require account access and are therefore yours to run, Paul. Every
prerequisite in the repo is already done: `CITATION.cff` is current (v0.5),
`public/corpus/SHA256SUMS.txt` covers every distributed file, the CHANGELOG has
a v0.5 entry, and the `corpus-v0.5` git tag marks the exact commit.

## 1. Zenodo DOI (makes the BibTeX citation real)

1. Sign in at https://zenodo.org (GitHub login works) and, under
   *GitHub* in account settings, flip the toggle for
   `systemslibrarian/cipher-museum`.
2. Create a GitHub **Release** from the `corpus-v0.5` tag (Releases → Draft new
   release → choose tag `corpus-v0.5`). Paste the v0.5 CHANGELOG entry as the
   release notes. Zenodo archives the release automatically and mints a DOI
   (plus a version-independent "concept DOI").
3. Add the concept DOI to: `CITATION.cff` (`doi:` field),
   `public/corpus/README.md` citation section, and the cipher-corpus.html page.

Notes: Zenodo archives the repository tarball — the LFS files (`all.jsonl`,
`all.json`) are pointers inside that tarball, so ALSO attach the real
`all.jsonl` (and `SHA256SUMS.txt`) as release assets so the archived record is
self-contained. GitHub release assets allow files up to 2 GB.

## 2. Hugging Face mirror (discoverability alongside CipherBank)

1. `pip install huggingface_hub` and `huggingface-cli login`.
2. Create dataset repo, e.g. `systemslibrarian/cipher-corpus`.
3. Upload `all.jsonl`, `llm-3shot-eval.jsonl`, `SHA256SUMS.txt`, and a dataset
   card (the corpus README is 90% of the card; add the `license: cc0-1.0`
   YAML header for synthetic records and note the per-record license field).
4. Link the HF dataset from cipher-corpus.html and the README, next to the
   CipherBank links.

## 3. External review (the one thing no test suite provides)

Suggested reviewers to approach with the ENGINE_AUDIT + one exhibit each:
- the American Cryptogram Association (the engines already follow ACA
  conventions, e.g. omit-J Playfair) — the *Cryptogram* editors review
  educational material;
- Crypto Museum (cryptomuseum.com) for the machine-cipher exhibits;
- any university history-of-cryptography course staff for the historical
  prose.

A single "reviewed by" acknowledgment on the About page is award-material.

## Already done in-repo (no action needed)

- `CITATION.cff` v0.5 with CipherBank reference intact
- `SHA256SUMS.txt` (verify with `sha256sum -c SHA256SUMS.txt`)
- `llm-3shot-eval.jsonl` ships again (300 deterministic public-split prompts)
- v0.2 leftover expansion files archived under `public/corpus/archive/`
- Canonical-vs-subset relationships documented in the corpus README
- Pending v0.6 merge documented (1,710 Arabic + 46 historical records)
