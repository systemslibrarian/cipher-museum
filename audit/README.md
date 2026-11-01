# Cipher Museum audit export

A self-contained reading pack for an AI or human reviewer without repository access.

- **Start with [CIPHER_MUSEUM_AUDIT.md](CIPHER_MUSEUM_AUDIT.md)**: all 216 pages, inline scripts, source register and supporting JavaScript/data in one file.
- [CIPHER_MUSEUM_AUDIT_PACK.zip](CIPHER_MUSEUM_AUDIT_PACK.zip): download the master document, all smaller parts, prompt and manifest together.
- [REVIEW_PROMPT.md](REVIEW_PROMPT.md): ready-to-use independent review instructions.
- [parts/](parts/): the same page and appendix content in smaller files for context/upload limits. Upload the prompt and README first, then page parts in order; supply the source register and relevant code/data parts with each batch.
- [manifest.json](manifest.json): all page IDs, original source hashes, supporting-file inventory and export checksums.

## What is included

Complete static body text, including hidden panels, captions, tables, examples, controls and inline SVG geometry; descriptive metadata; image/tooltip/accessibility text; each page's inline scripts; readable shared JavaScript (with hashes of served minified versions); tour and challenge data; all 104 corpus-browser sample records; search/artifact-card text; research scoring model; benchmark/count/schema evidence; page review notes and the complete prior source register; the columnar classroom worksheet, its fixed fixtures and its Node.js runner. This includes duplicates deliberately: the same claim may differ between a page, a card and a search description.

## Limits the reviewer must preserve

No external ebook/paper text, binary images, audio, videos, fonts, standalone CSS, installed dependencies, test execution environment, or complete 100,000-plus-record downloadable corpus is embedded. Image descriptions and inline SVG are available; independently checking other visual details requires the original image. Links identify sources but do not prove they were consulted. Program source allows reasoning about dynamic text; this export does not execute every interaction, random state, worker, browser crypto operation or user-supplied input. Shared scripts are included once; the learning-path script is explicitly labelled dormant. Corpus statistics and prior test results cannot substitute for independently checking omitted records. Readable-source versions of minified scripts are accompanied by their separate hashes, not a claim of byte identity. The historical-language profile tables in `data/research/v2/language-profiles.json` are excluded by size: roughly 0.74 MB of n-gram counts, not reviewable prose. Their provenance, rights, normalization, pruning and coverage are published inside that file and summarized in `data/research/v2/README.md`, and the research-evaluation v2 export records the file's SHA-256 so a reviewer can identify the exact build without the bulk.

The earlier 214-page review was a complete reading/consistency pass with targeted source checks. It was **not independent source verification of every factual claim**. The 67-item tracker records completed bounded work packages, not proof that every statement is correct. Preserve all recorded evidence limits when deciding what to verify next.



## Snapshot and regeneration

Source commit: `8421b8383ca4d05c3138821ec30e4b86fe2eb013` (2026-11-01T16:33:18-05:00). This is a frozen snapshot, not an automatically current view of the website. If pages change, regenerate deliberately.

With repository access and dependencies installed:

```sh
node scripts/export-audit-document.js --ref HEAD
node scripts/export-audit-document.js --check
python3 scripts/package-audit-document.py
python3 scripts/package-audit-document.py --check
```

The exporter reads committed files, checks every public HTML page against the coverage inventory, rejects stale page hashes, preserves every nonempty body text node outside scripts/styles, includes script bodies separately, and checks output checksums. These checks prove export coverage, not factual truth. Update the source review ledger honestly before exporting a later content revision. The --check command uses the recorded source commit and also reports source drift in the current checkout.

## Parts

- [01-pages-P001-P020.md](parts/01-pages-P001-P020.md): Pages P001–P020
- [02-pages-P021-P040.md](parts/02-pages-P021-P040.md): Pages P021–P040
- [03-pages-P041-P060.md](parts/03-pages-P041-P060.md): Pages P041–P060
- [04-pages-P061-P080.md](parts/04-pages-P061-P080.md): Pages P061–P080
- [05-pages-P081-P100.md](parts/05-pages-P081-P100.md): Pages P081–P100
- [06-pages-P101-P120.md](parts/06-pages-P101-P120.md): Pages P101–P120
- [07-pages-P121-P140.md](parts/07-pages-P121-P140.md): Pages P121–P140
- [08-pages-P141-P160.md](parts/08-pages-P141-P160.md): Pages P141–P160
- [09-pages-P161-P180.md](parts/09-pages-P161-P180.md): Pages P161–P180
- [10-pages-P181-P200.md](parts/10-pages-P181-P200.md): Pages P181–P200
- [11-pages-P201-P216.md](parts/11-pages-P201-P216.md): Pages P201–P216
- [12-source-register.md](parts/12-source-register.md): Source register and recorded access limits
- [13-01-javascript.md](parts/13-01-javascript.md): javascript appendix 1
- [13-02-javascript.md](parts/13-02-javascript.md): javascript appendix 2
- [13-03-javascript.md](parts/13-03-javascript.md): javascript appendix 3
- [13-04-javascript.md](parts/13-04-javascript.md): javascript appendix 4
- [13-05-javascript.md](parts/13-05-javascript.md): javascript appendix 5
- [13-06-javascript.md](parts/13-06-javascript.md): javascript appendix 6
- [14-01-data.md](parts/14-01-data.md): data appendix 1
- [14-02-data.md](parts/14-02-data.md): data appendix 2
- [14-03-data.md](parts/14-03-data.md): data appendix 3
- [14-04-data.md](parts/14-04-data.md): data appendix 4
- [14-05-data.md](parts/14-05-data.md): data appendix 5
- [14-06-data.md](parts/14-06-data.md): data appendix 6
- [14-07-data.md](parts/14-07-data.md): data appendix 7
- [15-classroom-worksheet.md](parts/15-classroom-worksheet.md): Columnar classroom worksheet
