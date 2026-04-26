# Round 3 Verification Audit

**Date:** April 26, 2026  
**Auditor:** Claude Opus (read-only audit)  
**Scope:** Verify Round 3 deliverables against live site and repo

## Summary
Round 3 core deliverables are substantially shipped: Hall XII expected pages exist and are live (with canonical slug [dagapeyeff](ciphers/dagapeyeff.html), not [d-agapeyeff](ciphers/d-agapeyeff.html)); Cipher Detective is live but has drifted beyond v1.5 into a hybrid v2/v3 state; VENONA shipped as a hybrid implementation (historical narrative plus a generic OTP try-it panel, not a dedicated venona engine); Artifact Cards are fully shipped in a dynamic form with 140/140 data entries and consistent rendering in sampled live pages.

## Task 1 — Hall XII Unsolved Exhibits

Reference files: [halls/unsolved.html](halls/unsolved.html), [halls/puzzle.html](halls/puzzle.html), [ciphers](ciphers)  
Live hall URLs: https://ciphermuseum.com/halls/unsolved.html and https://ciphermuseum.com/halls/puzzle.html

### voynich

- Repo file: present ([ciphers/voynich.html](ciphers/voynich.html))
- Live URL: 200 OK (https://ciphermuseum.com/ciphers/voynich.html)
- Hall breadcrumb: Hall XII ("Hall XII: Unsolved Ciphers")
- halls/unsolved.html links to it: yes ([halls/unsolved.html](halls/unsolved.html))
- Old hall page no longer references it: yes (absent from [halls/puzzle.html](halls/puzzle.html))
- Track A (engine + Try It Yourself) | Track B (visualization only) | Mixed | Cannot determine: Track A (live runtime renders "Try It Yourself" panel)
- One-line content summary (verify it's a real exhibit, not a stub): Voynich manuscript overview with chronology, significance, and unsolved status

### kryptos

- Repo file: present ([ciphers/kryptos.html](ciphers/kryptos.html))
- Live URL: 200 OK (https://ciphermuseum.com/ciphers/kryptos.html)
- Hall breadcrumb: Hall XII ("Hall XII: Unsolved Ciphers")
- halls/unsolved.html links to it: yes ([halls/unsolved.html](halls/unsolved.html))
- Old hall page no longer references it: yes (absent from [halls/puzzle.html](halls/puzzle.html))
- Track A (engine + Try It Yourself) | Track B (visualization only) | Mixed | Cannot determine: Track A (live runtime renders "Try It Yourself" panel)
- One-line content summary (verify it's a real exhibit, not a stub): Kryptos K1/K2/K3 solved context and K4 unsolved context

### beale

- Repo file: present ([ciphers/beale.html](ciphers/beale.html))
- Live URL: 200 OK (https://ciphermuseum.com/ciphers/beale.html)
- Hall breadcrumb: Hall XII ("Hall XII: Unsolved Ciphers")
- halls/unsolved.html links to it: yes ([halls/unsolved.html](halls/unsolved.html))
- Old hall page no longer references it: yes (absent from [halls/puzzle.html](halls/puzzle.html))
- Track A (engine + Try It Yourself) | Track B (visualization only) | Mixed | Cannot determine: Track A (live runtime renders "Try It Yourself" panel)
- One-line content summary (verify it's a real exhibit, not a stub): Beale ciphers page with solved #2 and unsolved #1/#3 framing

### dorabella

- Repo file: present ([ciphers/dorabella.html](ciphers/dorabella.html))
- Live URL: 200 OK (https://ciphermuseum.com/ciphers/dorabella.html)
- Hall breadcrumb: Hall XII ("Hall XII: Unsolved Ciphers")
- halls/unsolved.html links to it: yes ([halls/unsolved.html](halls/unsolved.html))
- Old hall page no longer references it: yes (absent from [halls/puzzle.html](halls/puzzle.html))
- Track A (engine + Try It Yourself) | Track B (visualization only) | Mixed | Cannot determine: Track B (interactive symbol-inspector visualization; no encrypt/decrypt engine)
- One-line content summary (verify it's a real exhibit, not a stub): Elgar Dorabella cryptogram page with symbol-analysis tooling

### shugborough

- Repo file: present ([ciphers/shugborough.html](ciphers/shugborough.html))
- Live URL: 200 OK (https://ciphermuseum.com/ciphers/shugborough.html)
- Hall breadcrumb: Hall XII ("Hall XII: Unsolved Ciphers")
- halls/unsolved.html links to it: yes ([halls/unsolved.html](halls/unsolved.html))
- Old hall page no longer references it: N/A (new exhibit)
- Track A (engine + Try It Yourself) | Track B (visualization only) | Mixed | Cannot determine: Track B (interactive inscription-pattern checker)
- One-line content summary (verify it's a real exhibit, not a stub): Shugborough inscription history and undeciphered hypotheses

### dagapeyeff

- Repo file: present ([ciphers/dagapeyeff.html](ciphers/dagapeyeff.html))
- Live URL: 200 OK (https://ciphermuseum.com/ciphers/dagapeyeff.html)
- Hall breadcrumb: Hall XII ("Hall XII: Unsolved Ciphers")
- halls/unsolved.html links to it: yes ([halls/unsolved.html](halls/unsolved.html))
- Old hall page no longer references it: N/A (new exhibit)
- Track A (engine + Try It Yourself) | Track B (visualization only) | Mixed | Cannot determine: Track B (interactive frequency/pair-analysis widget)
- One-line content summary (verify it's a real exhibit, not a stub): D'Agapeyeff 1939 challenge cryptogram context and unsolved status

### d-agapeyeff

- Repo file: absent
- Live URL: 404
- Hall breadcrumb: absent
- halls/unsolved.html links to it: no
- Old hall page no longer references it: N/A (alias check)
- Track A (engine + Try It Yourself) | Track B (visualization only) | Mixed | Cannot determine: N/A
- One-line content summary (verify it's a real exhibit, not a stub): Alias slug not deployed; canonical slug is dagapeyeff

### somerton-man

- Repo file: present ([ciphers/somerton-man.html](ciphers/somerton-man.html))
- Live URL: 200 OK (https://ciphermuseum.com/ciphers/somerton-man.html)
- Hall breadcrumb: Hall XII ("Hall XII: Unsolved Ciphers")
- halls/unsolved.html links to it: yes ([halls/unsolved.html](halls/unsolved.html))
- Old hall page no longer references it: N/A (new exhibit)
- Track A (engine + Try It Yourself) | Track B (visualization only) | Mixed | Cannot determine: Track B (interactive substitution visualization)
- One-line content summary (verify it's a real exhibit, not a stub): Somerton Man code/background and unresolved investigative history

### mccormick

- Repo file: present ([ciphers/mccormick.html](ciphers/mccormick.html))
- Live URL: 200 OK (https://ciphermuseum.com/ciphers/mccormick.html)
- Hall breadcrumb: Hall XII ("Hall XII: Unsolved Ciphers")
- halls/unsolved.html links to it: yes ([halls/unsolved.html](halls/unsolved.html))
- Old hall page no longer references it: N/A (new exhibit)
- Track A (engine + Try It Yourself) | Track B (visualization only) | Mixed | Cannot determine: Track B (interactive bigram analysis widget)
- One-line content summary (verify it's a real exhibit, not a stub): McCormick notes context with FBI-era unsolved framing

### phaistos-disc

- Repo file: present ([ciphers/phaistos-disc.html](ciphers/phaistos-disc.html))
- Live URL: 200 OK (https://ciphermuseum.com/ciphers/phaistos-disc.html)
- Hall breadcrumb: Hall XII ("Hall XII: Unsolved Ciphers")
- halls/unsolved.html links to it: yes ([halls/unsolved.html](halls/unsolved.html))
- Old hall page no longer references it: N/A (new exhibit)
- Track A (engine + Try It Yourself) | Track B (visualization only) | Mixed | Cannot determine: Track B (interactive sign-frequency exploration)
- One-line content summary (verify it's a real exhibit, not a stub): Phaistos Disc provenance and undeciphered-script analysis

Unexpected exhibits found in Hall XII list (live): zodiac (https://ciphermuseum.com/ciphers/zodiac.html)

## Task 2 — Cipher Detective Version

- File path: [cipher-detective.html](cipher-detective.html)
- Live URL: 200 OK (https://ciphermuseum.com/cipher-detective.html)
- Detective UX framing terms present: Evidence, Suspects, Case Notes, Recommended Next Attack (Confidence is implemented as badges, not a section heading)
- Confidence labels per suspect: yes (runtime badges, with classes and label mapping in [js/detective/render.js](js/detective/render.js) and [js/detective/scoring.js](js/detective/scoring.js))
- Frequency chart (SVG): yes (runtime chart renderer in [js/detective/render.js](js/detective/render.js))
- Accessible chart table: yes (visually hidden table companion in [js/detective/render.js](js/detective/render.js))
- Reality Labels: count of [Educational / Classical / Probabilistic / Not modern / More ciphertext] present: 5 runtime labels observed, with wording variants "Not modern encryption" and "More text improves reliability"
- "Insufficient evidence" banner: tested with short input — present (runtime behavior)
- Modular code structure: yes (modules: [js/detective/analyses.js](js/detective/analyses.js), [js/detective/scoring.js](js/detective/scoring.js), [js/detective/render.js](js/detective/render.js), [js/detective/attacks.js](js/detective/attacks.js), [js/detective/lang-model.js](js/detective/lang-model.js), [js/detective/solvers.js](js/detective/solvers.js), [js/detective/playback.js](js/detective/playback.js), [js/detective/challenges.js](js/detective/challenges.js), [js/detective/detective.js](js/detective/detective.js))
- Existing engines reused: no direct reuse of [js/ciphers/all-engines.js](js/ciphers/all-engines.js) detected in detective modules; detector/solvers are self-contained under [js/detective](js/detective)
- v2 markers present (should be NO): attack tool buttons yes, playback button yes, challenge mode yes
- Verdict: shipped at unclear / hybrid version
- Notes: implementation is beyond v1.5 (includes v2 attack tools/playback/challenge mode and v3 auto-solve panel), so it is not a pure v1 nor pure v1.5 deployment

## Task 3 — VENONA Track Determination

### VENONA

- Repo file: [ciphers/venona.html](ciphers/venona.html)
- Live URL: 200 OK (https://ciphermuseum.com/ciphers/venona.html)
- Track A markers: runtime "Try It Yourself" panel renders in venona demo section, with input controls and action buttons via [js/demo-loader.js](js/demo-loader.js)
- Track B markers: custom venona historical visualization styling/sections exist in page source (for example, track-b-widget styles and narrative panels), but no dedicated slider-based playback widget was found
- SIGTOT / 5-UCO side panel: absent
- Cambridge Five side panel: present
- Engine registered in all-engines.js: no dedicated venona engine key found in [js/ciphers/all-engines.js](js/ciphers/all-engines.js)
- Shipped OTP engine has real XOR: partial (page text references XOR, but [js/ciphers/all-engines.js](js/ciphers/all-engines.js) otp implementation is alphabetic mod-26 addition/subtraction, not bytewise XOR)
- Verdict: Hybrid
- Notes: venona uses a generic OTP demo path (data-cipher="otp") rather than a venona-specific cryptanalytic engine

## Task 4 — Artifact Card Coverage

- Data file (data/artifact-cards.json or equivalent): present — path: [data/artifact-cards.json](data/artifact-cards.json)
- Total entries in data file: 140 (out of ~140 expected)
- Renderer module: present — path: [js/artifact-cards.js](js/artifact-cards.js)
- Hook in exhibit templates: absent as static placeholder; dynamic insertion is used instead (renderer inserts after .page-hero and [js/nav.js](js/nav.js) auto-loads artifact scripts on /ciphers/ pages)

- Sample audit (10 exhibits):

| Hall | Slug | Card present | Fields present (count out of 8) | Notes |
|---|---|---:|---:|---|
| I | aeneas-tacticus | yes | 8 | Live jsdom simulation with live scripts rendered full card |
| II | argenti | yes | 8 | Full field set rendered |
| VII | m209 | yes | 8 | Full field set rendered |
| IX (requested sample slug) | venona | yes | 8 | Full field set rendered on venona page |
| XI | aes | yes | 8 | Full field set rendered |
| XII | phaistos-disc | yes | 8 | Full field set rendered |
| XIII | cicada-3301 | yes | 8 | Full field set rendered |
| Original 63 sample | caesar | yes | 8 | Full field set rendered |
| Original 63 sample | enigma | yes | 8 | Full field set rendered |
| Original 63 sample | vigenere | yes | 8 | Full field set rendered |

- Consistency: all sampled cards use same template
- Verdict: fully shipped
- Notes: supporting style rules are present in [css/museum.css](css/museum.css), and live script assets are served at 200: https://ciphermuseum.com/js/artifact-cards-data.js and https://ciphermuseum.com/js/artifact-cards.js

## Unexpected Findings

1. Hall XII live roster includes zodiac in addition to the expected table set.
2. Canonical D'Agapeyeff slug is dagapeyeff; alias d-agapeyeff is not deployed.
3. Cipher Detective has advanced beyond v1.5 into a broader hybrid (v2/v3 features present on live page).
4. VENONA appears under Hall X breadcrumb (Codebreakers) while the audit sampling request used it as a Hall IX example.
5. Artifact Cards are fully dynamic (script insertion) rather than static template placeholders.

## Recommended Next Steps

1. Decide and document intended Cipher Detective target version (v1.5 only vs v2/v3), then align copy/tests/audit docs to that chosen target.
2. Decide whether VENONA should have a dedicated venona engine and dedicated Track A controls (depth/crib workflow) or remain hybrid; update page and engine registry accordingly.
3. If slug aliases are required for external links, add a redirect/alias for d-agapeyeff to dagapeyeff.
4. Clarify hall assignment policy for VENONA (Hall X narrative placement vs any Hall IX references in planning docs).
5. Add a small automated deploy-check script that validates expected Hall XII slugs and key page markers against live URLs after each push.
