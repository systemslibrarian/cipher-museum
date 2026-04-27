# Cipher Corpus Schema Versioning and Deprecation Policy

## Versioning
- The schema is versioned using semantic versioning: MAJOR.MINOR.PATCH (e.g., 0.2.0, 0.3.0)
- All changes to the schema are documented in `cipher-corpus.schema.changelog.md`
- The current schema version is included as a `$version` field in the schema file

## Deprecation
- Deprecated fields will be marked with a `deprecated` property and documented in the changelog
- Breaking changes require a major version bump and advance notice in the repo
- Old schema versions will be archived in `/public/corpus/archive/`

## Change Process
- All schema changes must be proposed via pull request
- Each change must update the changelog and increment the version
- Contributors must update all affected records and scripts

---

This policy ensures stability and transparency for all users and contributors.
