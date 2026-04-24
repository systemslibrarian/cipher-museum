# Inventory: Exhibits

Source: `museum-map.html` Complete Cipher Index + `ls ciphers/*.html` + `js/ciphers/all-engines.js` exported registry (lines 1830–1842).

Engine file column: all engines live in the single file `js/ciphers/all-engines.js`, so "engine file exists" really means "is registered in the exported `window.CipherEngines` object." 51 engines are registered; `zodiac` has no engine (intentional — it is unsolved).

| # | slug | map row | hall per map | page exists | engine name in registry | registered? |
|---|---|---|---|---|---|---|
| 1 | scytale | 01 | I | yes | scytale | yes |
| 2 | caesar | 02 | I | yes | caesar | yes |
| 3 | polybius | 03 | I | yes | polybius | yes |
| 4 | atbash | 41 | I | yes | atbash | yes |
| 5 | rot13 | 42 | I | yes | rot13 | yes |
| 6 | monoalphabetic | 04 | II | yes | monoalphabetic | yes |
| 7 | homophonic | 05 | II | yes | homophonic | yes |
| 8 | playfair | 06 | II | yes | playfair | yes |
| 9 | hill | 07 | II | yes | hill | yes |
| 10 | great-cipher | 38 | II | yes | greatCipher | yes |
| 11 | babington | 39 | II | yes | babington | yes |
| 12 | four-square | 43 | II | yes | foursquare | yes |
| 13 | two-square | 44 | II | yes | twosquare | yes |
| 14 | vigenere | 08 | III | yes | vigenere | yes |
| 15 | beaufort | 09 | III | yes | beaufort | yes |
| 16 | porta | 10 | III | yes | porta | yes |
| 17 | gronsfeld | 11 | III | yes | gronsfeld | yes |
| 18 | running-key | 12 | III | yes | runningKey | yes |
| 19 | rail-fence | 13 | IV | yes | railFence | yes |
| 20 | columnar | 14 | IV | yes | columnar | yes |
| 21 | double-transposition | 15 | IV | yes | doubleTransposition | yes |
| 22 | bifid | 16 | IV | yes | bifid | yes |
| 23 | trifid | 17 | IV | yes | trifid | yes |
| 24 | fractionated-morse | 18 | IV | yes | fractionatedMorse | yes |
| 25 | nihilist | 19 | V | yes | nihilist | yes |
| 26 | adfgx | 20 | V | yes | adfgx | yes |
| 27 | adfgvx | 21 | V | yes | adfgvx | yes |
| 28 | bazeries | 22 | V | yes | bazeries | yes |
| 29 | vic | 23 | V | yes | vic | yes |
| 30 | straddling-checkerboard | 45 | V | yes | straddlingCheckerboard | yes |
| 31 | stager | 24 | CW | yes | stager | yes |
| 32 | confederate-vigenere | 25 | CW | yes | confederateVigenere | yes |
| 33 | dictionary-code | 26 | CW | yes | dictionaryCode | yes |
| 34 | alberti-disk | 27 | VI (machines) | yes | alberti | yes |
| 35 | jefferson-disk | 28 | VI (machines) | yes | jefferson | yes |
| 36 | chaocipher | 46 | VII (puzzle?? — see F-001) | yes | chaocipher | yes |
| 37 | enigma | 29 | VI (machines) | yes | enigma | yes |
| 38 | m209 | 47 | VII (puzzle?? — see F-001) | yes | m209 | yes |
| 39 | lorenz | 30 | VI (machines) | yes | lorenz | yes |
| 40 | purple | 52 | VII (puzzle?? — see F-001) | yes | purple | yes |
| 41 | navajo-code-talkers | 31 | VI (machines) | yes | navajo | yes |
| 42 | pigpen | 32 | VII (puzzle) | yes | pigpen | yes |
| 43 | bacon | 33 | VII (puzzle) | yes | bacon | yes |
| 44 | tap-code | 34 | VII (puzzle) | yes | tapCode | yes |
| 45 | zodiac | 35 | VII (puzzle) | yes | — | NO (unsolved, intentional) |
| 46 | copiale | 48 | VIII (puzzle) | yes | copiale | yes |
| 47 | beale | 49 | VIII (puzzle) | yes | beale | yes |
| 48 | kryptos | 50 | VIII (puzzle) | yes | kryptos | yes |
| 49 | voynich | 40 | VIII (puzzle) | yes | voynich | yes |
| 50 | one-time-pad | 36 | ★ (unbreakable) | yes | otp | yes |
| 51 | vernam | 37 | ★ (unbreakable) | yes | vernam | yes |
| 52 | solitaire | 51 | ★ (unbreakable) | yes | solitaire | yes |

Totals:
- Pages on disk: 52 / 52
- Engines in registry: 51 / 52 (zodiac intentionally absent)
- Map rows: 52 / 52
