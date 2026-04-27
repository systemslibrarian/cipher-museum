# Cipher Corpus Schema Changelog

## v0.2 (Draft 2020-12)

### Major Changes
- Upgraded schema to JSON Schema Draft 2020-12.
- Added `split` field (enum: public, blind) for benchmark/public split.
- Added `transcription_quality` field (enum: clean, noisy) to indicate transcription fidelity.
- Expanded `language` to support ISO 639-1/2 codes and language tags.
- Added `source_provenance` object with:
  - `url` (string, required for historical)
  - `archive` (string, required for historical)
  - `publication_date` (string, YYYY or YYYY-MM-DD)
  - `license` (string)
- Documented all new fields and updated required fields for v0.2.

### Migration Notes
- All v0.1 records must be validated and updated to conform to v0.2 schema.
- Historical records require full `source_provenance`.
- Synthetic records may use minimal provenance.

---

## v0.1 (Draft-07)
- Initial release: synthetic records only, basic metadata, no provenance object.
