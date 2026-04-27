# How to Propose Schema Changes

1. Fork the repository and create a new branch.
2. Edit `cipher-corpus.schema.json` and increment the `$version` field.
3. Update `cipher-corpus.schema.changelog.md` with a summary of your changes.
4. If deprecating fields, mark them with a `deprecated` property and document in the changelog.
5. Open a pull request describing your rationale and impact.
6. All changes are reviewed for compatibility and impact on existing records/tools.

---

This process ensures the schema remains stable and transparent for all users.
