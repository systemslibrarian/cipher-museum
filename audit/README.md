# Cipher Museum audit reading pack

**The pack is no longer committed to this repository.** It is generated output —
a complete export of every public page, its inline scripts, the source register
and the supporting code and data — and keeping a 29 MB derived artifact in the
tree meant it was perpetually one page edit away from being stale. It went stale
three separate ways in two weeks, each caught later than the edit that caused it.

It is now built by [`.github/workflows/audit-pack.yml`](../.github/workflows/audit-pack.yml)
and published as a **GitHub Release asset**.

## Get the pack

**[Download the latest pack from Releases →](https://github.com/systemslibrarian/cipher-museum/releases/tag/audit-pack-latest)**

Each release carries:

| Asset | What it is |
| --- | --- |
| `CIPHER_MUSEUM_AUDIT_PACK.zip` | Everything below in one archive |
| `CIPHER_MUSEUM_AUDIT.md` | All pages, scripts, source register and data in one document |
| `manifest.json` | Page IDs, original source hashes, input inventory, export checksums |
| `SHA256SUMS.txt` | Checksums for every asset in the release |

The release notes record the exact source commit the pack was built from. That
commit, not the release date, is what the pack describes.

## Build it yourself

With the repository checked out and dependencies installed:

```sh
node scripts/export-audit-document.js --ref HEAD
node scripts/export-audit-document.js --check
python3 scripts/package-audit-document.py
```

Output lands in `audit/pack/`, which is gitignored. The exporter reads committed
files, checks every public HTML page against the coverage inventory in
`docs/page-audit/coverage.json`, rejects stale page hashes, and verifies its own
output checksums. Those checks prove export coverage, not factual truth.

## What used to be here

`https://ciphermuseum.com/audit/…` previously served the committed copy, because
GitHub Pages publishes the repository root. Those URLs no longer resolve to the
pack. Nothing on the site linked them — they were a side effect of the deployment,
not a published interface — but if you had one bookmarked, the Releases page above
is where the pack lives now.

## Also in this directory

Two hand-written records, unrelated to the generated pack:

- [`EBOOK_IMPLEMENTATION_PROGRESS.md`](EBOOK_IMPLEMENTATION_PROGRESS.md)
- [`EBOOK_REVIEW_RECOMMENDATIONS.md`](EBOOK_REVIEW_RECOMMENDATIONS.md)
