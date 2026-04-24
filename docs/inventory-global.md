# Inventory: Global Pages

Per-file extraction. "Hardcoded counts found" lists the literal numeric strings
that appear in user-visible copy and could go stale.

| file | title (trimmed) | meta description length | nav signature (ordered, with active item starred) | footer first line | hardcoded count strings |
|---|---|---|---|---|---|
| `index.html` | "The Cipher Museum — Interactive History of Encryption" | 144 | Entrance*, Explore, Learn, Challenges, Lab | "© The Cipher Museum · MIT License · Open Source" | "37 cipher" (in body), "52 ciphers" (hero), "v2.0.0 ... 37 ciphers · 10 halls" (footer), "2,500 years" |
| `museum-map.html` | "Museum Map — The Cipher Museum" | 114 | Entrance, Museum Map*, Timeline, Challenges, Glossary, Cryptanalysis Techniques, Modern Crypto | "© The Cipher Museum · MIT License" | meta "37 cipher exhibits", tagline "10 halls, 40 exhibits", panel "52 Exhibits", footer "40 exhibits · 10 halls" |
| `timeline.html` | "Timeline — The Cipher Museum" | 122 | Entrance, Museum Map, Timeline*, Challenges, Glossary, Cryptanalysis Techniques | "© The Cipher Museum · MIT License" | "2,400 Years of Encryption" (footer) |
| `challenges.html` | "Cipher Challenges — The Cipher Museum" | 82 | Entrance, Museum Map, Timeline, Challenges*, Glossary, Cryptanalysis Techniques | "© The Cipher Museum · MIT License" | none observed |
| `learn.html` | "Learn — The Cipher Museum" | 126 | (Explore-set: Museum Map, Learn*, Challenges, Lab — missing Entrance + others) | "© The Cipher Museum · MIT License" | none observed |
| `modern.html` | "Modern Cryptography — The Cipher Museum" | 102 | Entrance, Museum Map, Timeline, Challenges, Glossary, Cryptanalysis Techniques, Modern Crypto* | "© The Cipher Museum · MIT License" | none observed |
| `cryptanalysis.html` | "Cryptanalysis Techniques — The Cipher Museum" | 134 | Entrance, Museum Map, Halls, Cryptanalysis*, Modern Crypto | "© The Cipher Museum · MIT License" | (header may say "10 cryptanalysis techniques" — verify in Phase 4) |
| `glossary.html` | "Glossary — The Cipher Museum" | 123 | Entrance, Museum Map, Halls, Timeline, Challenges, Glossary*, Cryptanalysis Techniques | "© The Cipher Museum · MIT License" | "72 Terms Defined" (footer) |
| `comparison.html` | "Cipher Comparison — The Cipher Museum" | 93 | Entrance, Museum Map, Timeline, Comparison*, Challenges, Glossary, Cryptanalysis Techniques | "© The Cipher Museum · MIT License" | "37 cipher" (in body), "2,400 Years of Encryption" (footer) |
| `search.html` | "Search — The Cipher Museum" | 116 | Entrance, Explore, Learn, Challenges, Lab | (no museum-footer found) | "52 cipher" (body) |
| `lab/workbench.html` | "Codebreaker's Workbench — The Cipher Museum" | 133 | (no museum-nav block — uses page-local header) | (no museum-footer found) | "33 cipher engines" (hero intro) — actual dropdown count = 29 |
| `404.html` | "Exhibit Not Found — The Cipher Museum" | 86 | Museum Map, Timeline, Challenges, Glossary | "© The Cipher Museum · MIT License" | "2,500 years" |
| `README.md` | (n/a markdown) | — | — | — | "52 historically important ciphers", "10 exhibit halls", "Hall VI: ... Vernam" (treats Vernam as machines, contradicts Index ★) |

Distinct nav-set signatures (grouping):
1. **Modern-set (recommended canonical):** Entrance, Museum Map, Timeline, Challenges, Glossary, Cryptanalysis Techniques, Modern Crypto — used by `museum-map.html`, `modern.html`. Variants drop one item (timeline/challenges/glossary uses 6 items).
2. **Explore-set (legacy/short):** Entrance, Explore (= museum-map), Learn, Challenges, Lab — used by `index.html`, `search.html`, `learn.html` (which is missing Entrance entirely).
3. **Halls-set:** includes a "Halls" item linking to ancient.html — used by `cryptanalysis.html`, `glossary.html`.
4. **404-set:** Museum Map, Timeline, Challenges, Glossary (no Entrance) — used by `404.html`.
5. **No nav:** `lab/workbench.html` uses a page-local header with no museum-nav block.

Distinct footer variants:
- A. "© The Cipher Museum · MIT License · Open Source" + version line `v2.0.0 "The Redesign" · 37 ciphers · 10 halls` — `index.html` only.
- B. "© The Cipher Museum · MIT License" + count line `40 exhibits · 10 halls` — `museum-map.html` only.
- C. "© The Cipher Museum · MIT License" + label line (varies: "Cipher Challenges" / "Learn" / "2,400 Years of Encryption" / "72 Terms Defined") — `timeline`, `challenges`, `learn`, `glossary`, `comparison`.
- D. "© The Cipher Museum · MIT License" + (no second line) — `modern.html`, `cryptanalysis.html`, `404.html`.
- E. (no footer block) — `search.html`, `lab/workbench.html`.

Stale-count strings to fix (consolidated):
- `37 cipher` → 52: `index.html`, `museum-map.html` meta, `comparison.html`.
- `40 exhibits` → 52: `museum-map.html` tagline, `museum-map.html` footer.
- `33 cipher engines` → 51 (or actual workbench dropdown count after expansion): `lab/workbench.html`.
- `2,400 years` → 2,500 (or 2,600): `timeline.html` footer, `comparison.html` footer.
- `2,500 years` → confirm: `index.html`, `404.html`.
- `v2.0.0` → bump or drop: `index.html` footer.
