# Cipher Corpus Versioning Policy & Archive Infrastructure (v0.3)

## Versioning Policy
- All corpus and schema changes are versioned using semantic versioning (MAJOR.MINOR.PATCH)
- Each version is documented in the changelog
- Deprecated fields and breaking changes are announced in advance

## Archive Infrastructure
- Old schema and corpus versions are stored in `/public/corpus/archive/`
- Each archived file is named with its version (e.g., `cipher-corpus.schema.v0.2.json`)
- Reports and receipts are retained for all published runs

## Access
- Users can browse and download archived versions for reproducibility and research

---

This ensures long-term stability and transparency for all users and contributors.
