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

---

## PR31 Babington cache work — completed 4 November 2026

The note above recorded PR31's Babington cache work as separate and outstanding.
It is now merged and verified. This section closes that item and records the
repository tidying done alongside it.

### What landed

| Change | Commit | Effect |
| --- | --- | --- |
| Cache-delivery fix, rebased onto current main | [`a8ef1e3`](https://github.com/systemslibrarian/cipher-museum/commit/a8ef1e3), [`80ad49c`](https://github.com/systemslibrarian/cipher-museum/commit/80ad49c), [`f25aef6`](https://github.com/systemslibrarian/cipher-museum/commit/f25aef6) | JavaScript served network-first with a cached fallback; the worker's own cache policy folded into its version stamp; content-hash query strings on the two Babington bundles; `tests/test-script-updates.js` added. |
| Audit pack refresh | [`8c92a5a`](https://github.com/systemslibrarian/cipher-museum/commit/8c92a5a) | 227 pages; `export --check` and `package --check` verify. |
| Sitemap completion, README figure, two guards | [`1ff9410`](https://github.com/systemslibrarian/cipher-museum/commit/1ff9410) | 13 indexable pages added to `sitemap.xml`; README audit-pack figure corrected from 220 pages/2 November to 227/3 November; `tests/test-sitemap-coverage.js` added. |
| Audit pack refresh | [`171544c`](https://github.com/systemslibrarian/cipher-museum/commit/171544c) | Regenerated and verified. |

PR31 arrived 43 commits behind main. Merging it as it stood would have deleted
6,182 lines, reverting the Bauer exhibits, the writing-systems cases, the new
tours and their tests along with the exhibit count. It was rebased instead, so
only its delivery changes were carried across. Two conflicts, both generated
values — the service-worker VERSION stamp and the Babington page hash — were
taken from main and regenerated. The Babington *model* correction the original
PR described had already landed in PR30; nothing in that area changed.

### Cache fix verified against a returning visitor

Tested end to end in Chromium against two served builds: `0da0563` (the
pre-fix deployment: cache-first worker, unversioned script URLs) and the
shipped fix. A corrected engine was simulated by marking the bundle source and
running the real `scripts/build-min.js`, so the content hash was stamped by the
shipping code path rather than by hand.

| Check | Result |
| --- | --- |
| Old build caches with no correction present | pass |
| **Pre-fix: returning visitor is served the stale engine** | **pass — bug reproduced** |
| Old cache-first worker in control before upgrade | pass (`/sw.js`) |
| **Fix: returning visitor receives the corrected engine on first reload** | **pass** |
| The versioned bundle URL went to the network | pass (`all-engines.min.js?v=bad272ac4aaa`) |

The negative control matters: without it a passing upgrade test proves nothing,
because it cannot tell a working fix from a test that never detects staleness.
The corrected engine arrived while the **old** cache-first worker was still the
controlling worker, which is the case the fix exists for — the versioned URL is
absent from that worker's cache, so it must go to the network.

### Offline behaviour unchanged

Compared page by page between the pre-fix build and the shipped fix, with the
network down after a warm visit.

| Page | Pre-fix | Shipped fix |
| --- | --- | --- |
| `/index.html` | loaded from cache | loaded from cache |
| `/ciphers/ua-8295.html` | loaded from cache | loaded from cache |
| `/lab/evidence-workbench.html` | loaded from cache | loaded from cache |
| `/ciphers/babington.html` | offline notice | offline notice |
| nonexistent page | offline notice | offline notice |

**Zero regressions.** The Babington exhibit is not in the worker's 28-page
precache list, so the offline notice is the correct result for it on both
builds, not a side effect of this change. An earlier run of this check reported
a failure there; the page choice was wrong, not the worker.

### Sitemap and indexing

`sitemap.xml` is hand-maintained and had fallen 13 pages behind: three exhibits
(UA-8295, SoDark, NFC deployment), seven lab pages (Evidence Workbench,
decipherment cases, modern attack evidence, Purple diagnosis, reading the
evidence, traffic analysis, working-is-not-secure), the classical guide, the
codebreak worksheet and the first-codebreak page. All carried self-referencing
canonical tags and no `noindex`; none was advertised to a crawler. Added.

Kept out on purpose, at the owner's direction:

- `codebreak-answers.html` — the facilitator answer key. It is linked from two
  public pages, so sitemap absence alone would not have kept it out of an index.
  It now carries `<meta name="robots" content="noindex, follow">`, which is the
  mechanism that actually governs indexing; the sitemap guard reads that tag
  from the page rather than keeping a second list that could disagree with it.
  The page is generated, so the tag was added to
  `scripts/build-codebreak-handouts.js` and the handouts regenerated; editing the
  output alone failed `tests/test-first-codebreak.js`, which checks the generator
  reproduces it. The student worksheet is deliberately unaffected.
- `public/reports/benchmark-baselines.html` — generated report, linked from the
  corpus page. Excluded by policy in the guard, with the reason recorded. It
  carries no `noindex`; adding one was not requested.

### Validation

- `npm test` — all suites pass, including the two new guards.
- `npm run lint:html` — 227 pages, no errors.
- Audit pack — 227 pages; `export --check` and `package --check` verify.
- CI on `main`: run [41769443418](https://github.com/systemslibrarian/cipher-museum/actions/runs/41769443418) (`8c92a5a`) and run [41770203199](https://github.com/systemslibrarian/cipher-museum/actions/runs/41770203199) (`171544c`), both success across `test`, `validate-corpus` and `deploy-pages`.
- Live verification on ciphermuseum.com: sitemap serving 221 entries with the
  Evidence Workbench present; the workbench and UA-8295 exhibits return 200.

Browser checks establish the delivery behaviour described above on one engine
and one machine. They do not certify historical conclusions, learning outcomes
or security properties.
