# Typex and handbell context additions — 3 November 2026

Two bounded additions from Dot’s remaining recommendations, compared with main
`94830974042c20b41dfc157a06fe5a608fe79c0f` and open PRs before editing. PR31’s
Babington cache work is separate. Existing evidence exercises and PR36 remain intact.

| Location | Addition | Source and limit |
| --- | --- | --- |
| `ciphers/typex.html#typex-scare` | Probable capture-assisted reading distinguished from a general wartime cryptanalytic break; both short facts agree. | Dermot Turing, HistoCrypt 2019, printed pp. 37–38. Attributed historical reconstruction, not independent archival verification or a claim about every machine variant. |
| `lab/reading-the-evidence.html#handbell-context` | Reported classifier suggestions change with representation; chronology excludes a specific modern form without solving the inscription. | Bean, Gannon and Lang, HistoCrypt 2023, §§2–3 and 5; Sarah Lang’s companion contextual paper. No classifier rerun, calibrated probabilities, recovered plaintext, copied image or artifact inspection. |

The handbell card is explicitly historical and separate from the page’s four
invented exercises. It does not change the recurrence algorithm, train a model,
add a cipher engine or change corpus membership. Public references only.
The page-audit source register and current coverage hashes accompany the changes;
the downloadable full-audit pack remains its explicitly dated frozen snapshot.

Validation:

- HTML lint: all 223 public pages passed; release metadata, current coverage
  hashes, generated artifact data and service-worker checks passed.
- The full museum suite completed. Two assertions needed to reflect the intended
  change (four exercise credits versus a separate historical credit; Typex’s
  qualified general-break claim). Both affected suites passed after the updates;
  all other suites passed in that run.
- Chromium 134 headless shell, 1280 and 390 px: both pages loaded without script
  errors or document overflow. Keyboard activation opened the handbell answer.
  Automated WCAG A/AA checks found no violations in Typex’s main content or the
  handbell card after making the two existing Typex table regions focusable.
- The normal bundled browser download/launch was unavailable locally; a temporary
  executable override was used. Repository browser dependencies were not changed.

Static prose and browser checks do not certify historical conclusions or learning
outcomes. CI and deployment status are recorded separately in the pull request.
