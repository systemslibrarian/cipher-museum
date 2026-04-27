# Contributing to Cipher Corpus

Thank you for your interest in contributing to the Cipher Corpus! This document outlines the process for adding new cipher records, validating data, and improving the benchmark infrastructure.

## How to Contribute

1. **Add a New Record**
   - Use the record template in `public/corpus/record-template.v0.2.json`.
   - Fill in all required fields according to the schema (`public/corpus/cipher-corpus.schema.json`).
   - For historical ciphers, provide full `source_provenance`.

2. **Validate Your Record**
   - Run `npm run validate:corpus` to check your record against the schema.
   - All records must pass validation before merging.

3. **Submit a Pull Request**
   - Fork the repository and create a new branch.
   - Add your record(s) to the appropriate corpus file.
   - Open a pull request with a clear description and reference to sources if applicable.

## Guidelines
- Follow the schema exactly; see the template for required fields and examples.
- Use clear, verifiable sources for historical records.
- For synthetic records, document the generation method in `source_provenance`.

## Questions?
Open an issue or contact the maintainers for help.
