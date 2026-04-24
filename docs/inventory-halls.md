# Inventory: Halls

Per-file extraction from `halls/*.html`. "Card count" = number of unique `ciphers/<slug>.html` links (de-duplicated; the raw `href=` count is higher because of sidebar + prev/next chain duplicates).

| hall file | title says | h1 says | breadcrumb says | footer "Hall X of Y" | unique exhibit cards | prev link | next link |
|---|---|---|---|---|---|---|---|
| `halls/ancient.html`        | "Hall I: Birth of Cryptography" | "Birth of Cryptography" | (default `<a>Entrance › <a>Museum Map › Hall I` style — no roman) | Hall I of X | 3 (caesar, polybius, scytale) | — | substitution.html |
| `halls/substitution.html`   | "Hall II: Classical Substitution" | "Classical Substitution" | default chain | Hall II of X | 6 (babington, great-cipher, hill, homophonic, monoalphabetic, playfair) | ancient.html | polyalphabetic.html |
| `halls/polyalphabetic.html` | "Hall III: The Polyalphabetic Revolution" | "The Polyalphabetic Revolution" | default chain | Hall III of X | 5 (beaufort, gronsfeld, porta, running-key, vigenere) | substitution.html | transposition.html |
| `halls/transposition.html`  | "Hall IV: Transposition & Fractionation" | "Transposition & Fractionation" | default chain | Hall IV of X | 6 (bifid, columnar, double-transposition, fractionated-morse, rail-fence, trifid) | polyalphabetic.html | military.html |
| `halls/military.html`       | "Hall V: Military & Spy Ciphers" | "Military & Spy Ciphers" | default chain | Hall V of X | 5 (adfgvx, adfgx, bazeries, nihilist, vic) | transposition.html | civil-war.html |
| `halls/civil-war.html`      | "Civil War Gallery" (no roman) | "The American Civil War Gallery" | default chain | Hall VI of X | 3 (confederate-vigenere, dictionary-code, stager) | military.html | unbreakable.html  ⚠ skips machines+puzzle |
| `halls/machines.html`       | "Hall VI: Mechanical Cipher Machines" ⚠ | "Mechanical Cipher Machines" | "...Museum Map › Hall VI" ⚠ | Hall VII of X ⚠ contradicts title+breadcrumb | 8 (alberti-disk, chaocipher, enigma, jefferson-disk, lorenz, m209, navajo-code-talkers, purple) | military.html ⚠ skips civil-war | puzzle.html |
| `halls/puzzle.html`         | "Hall VII: Puzzle & Novelty Ciphers" ⚠ | "Puzzle & Novelty Ciphers" | "...Museum Map › Hall VII" ⚠ | Hall VIII of X ⚠ contradicts title+breadcrumb | 5 (bacon, pigpen, tap-code, voynich, zodiac) | machines.html | unbreakable.html |
| `halls/unbreakable.html`    | "Final Hall: The Unbreakable" (no roman) | "The Unbreakable" | default chain | Hall IX of X | 3 (one-time-pad, vernam, plus an enigma cross-link) | civil-war.html ⚠ skips puzzle+machines | ../modern.html |
| `halls/codebreakers.html`   | "Hall of Codebreakers" (no roman) | "Hall of Codebreakers" | default chain | Hall X of X | 7 cross-links to exhibits (chaocipher, copiale, enigma, lorenz, m209, navajo, zodiac) — biographies, not exhibit cards | ../cryptanalysis.html | ../museum-map.html |

Footer "of Y" value: every hall reads "of X" (ten). Consistent.

Major issues spotted (will be filed as findings in Phases 1–2):
- `machines.html` self-contradicts (title VI, footer VII).
- `puzzle.html` self-contradicts (title VII, footer VIII).
- `civil-war.html` next link skips machines and puzzle, going straight to unbreakable.
- `machines.html` previous link skips civil-war.
- `unbreakable.html` previous link skips puzzle and machines, going straight to civil-war.
- `ancient.html` shows 3 of 5 exhibits (missing atbash, rot13).
- `substitution.html` shows 6 of 8 (missing four-square, two-square).
- `military.html` shows 5 of 6 (missing straddling-checkerboard).
- `puzzle.html` shows 5 of 8 (missing copiale, beale, kryptos).
- `unbreakable.html` shows 2 of 3 plus an erroneous enigma cross-link (missing solitaire).
