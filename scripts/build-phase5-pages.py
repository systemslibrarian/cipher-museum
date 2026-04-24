#!/usr/bin/env python3
"""One-off generator for Round 3 Phase 5/7/10 exhibit pages.

Each entry below describes a single exhibit page; running this script
writes (or refuses to overwrite) the corresponding `ciphers/<slug>.html`.
The shape mirrors the conventions used by ciphers/kama-sutra.html so that
demo-loader.js, the test suites, the lightbox, and the nav injection all
pick the page up automatically.
"""
import os
import sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CIPHERS = os.path.join(REPO, 'ciphers')

PAGES = [
  {
    'slug': 'affine',
    'title': 'Affine Cipher',
    'subtitle': 'E(x) = a·x + b mod 26',
    'meta_desc': "The affine cipher — a single linear formula E(x)=a·x+b mod 26 that generalises Caesar (a=1) and Atbash (a=25, b=25). Just 312 keys; trivially broken.",
    'hall_href': '../halls/substitution.html',
    'hall_label': 'Hall II: The Substitution Hall',
    'hall_short': 'Hall II · Substitution',
    'page_meta_label': 'Hall II · Substitution',
    'era_class': 'era-ancient',
    'era_label': 'Antiquity → 1800s · math-age',
    'sec_class': 'sec-broken',
    'sec_label': 'Trivial',
    'tagline': 'A single linear formula generalises Caesar, Atbash, and ROT13 — and is broken by counting how often E appears.',
    'facts': [
      ('Origin', 'Generalisation of Roman shift ciphers'),
      ('Year', 'Formalised 19th c. (used informally far earlier)'),
      ('Key Type', 'Pair (a,b) — a coprime to 26 → 12·26 = 312 keys'),
      ('Property', 'Caesar = a·1+b; Atbash = a·25+b·25'),
      ('Modern Lesson', 'Linearity is fatal to security'),
    ],
    'panels': [
      ('📜', 'Historical Context',
       "<p>The affine cipher does not have a single named inventor. It is the natural mathematical generalisation of every shift-style cipher humans have improvised since antiquity: pick a multiplier <em>a</em>, pick an offset <em>b</em>, and replace each letter x with a·x+b mod 26. Caesar is the special case a=1; Atbash is a=25, b=25; ROT13 is a=1, b=13. Once nineteenth-century mathematicians wrote cryptography in algebraic notation, all of these collapsed into one formula.</p>"
       "<p style=\"margin-top:1rem;\">The affine cipher is mostly a teaching cipher today. It is the smallest cipher whose key has more than one component, which makes it the cleanest place to introduce the ideas of <em>key space</em>, <em>modular inverses</em>, and the requirement that <em>a</em> and 26 be coprime.</p>"),
      ('⚙️', 'How It Works',
       "<p>Number the alphabet A=0, B=1, …, Z=25. Pick two integers <em>a</em> and <em>b</em>. Encryption is</p>"
       "<pre>E(x) = (a·x + b) mod 26</pre>"
       "<p>Decryption uses the modular inverse of <em>a</em>:</p>"
       "<pre>D(y) = a⁻¹·(y - b) mod 26</pre>"
       "<p style=\"margin-top:1rem;\"><strong>Critical constraint:</strong> <em>a</em> must be coprime to 26 (no shared factor with 26 = 2·13). Only twelve values of <em>a</em> qualify: <code>1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25</code>. Pair each with one of 26 offsets and you get 12·26 = 312 keys — small enough to brute-force by hand.</p>"),
      ('💀', 'How It Was Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Brute force</div><div class=\"attack-diff\">Complexity: Trivial (312 keys)</div><p class=\"attack-desc\">Try all 312 (a, b) pairs and pick the decryption that looks like English. A modern laptop does this in microseconds; an attentive teenager does it in an afternoon.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Frequency analysis</div><div class=\"attack-diff\">Complexity: Trivial (any monoalphabetic substitution)</div><p class=\"attack-desc\">Affine is a monoalphabetic substitution: each plaintext letter always maps to the same ciphertext letter. Letter frequencies survive intact, so the methods al-Kindi described in the ninth century apply unchanged.</p></div>"),
      ('🔬', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>Affine concept</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>Coprime requirement on <em>a</em></td><td>RSA's coprime requirement on the public exponent <em>e</em></td></tr>"
       "<tr><td>Linear transformation in mod 26</td><td>The Hill cipher generalises this to matrix multiplication</td></tr>"
       "<tr><td>Tiny key space</td><td>The reason modern keys are 128–256 bits, not 9 bits</td></tr>"
       "<tr><td>Linearity = trivially invertible</td><td>Modern primitives deliberately add non-linear S-boxes</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('caesar', 'Caesar Cipher', 'The affine cipher with a=1'),
      ('atbash', 'Atbash', 'The affine cipher with a=25, b=25'),
      ('hill', 'Hill Cipher', 'Generalises affine to matrices'),
    ],
    'prev': ('monoalphabetic', 'Monoalphabetic'),
    'next': ('homophonic', 'Homophonic'),
  },
  {
    'slug': 'trithemius',
    'title': 'Trithemius Progressive Cipher',
    'subtitle': 'Steganographia · 1518',
    'meta_desc': "Johannes Trithemius's progressive shift cipher (Polygraphia, 1518) — the first published polyalphabetic, where every successive letter is shifted one further than the last.",
    'hall_href': '../halls/polyalphabetic.html',
    'hall_label': 'Hall III: The Polyalphabetic Era',
    'hall_short': 'Hall III · Polyalphabetic',
    'page_meta_label': 'Hall III · Polyalphabetic',
    'era_class': 'era-renaissance',
    'era_label': 'German Renaissance · 1518',
    'sec_class': 'sec-broken',
    'sec_label': 'Easy',
    'tagline': 'The first published polyalphabetic cipher: a tabula recta with every letter advanced by one more shift than the last.',
    'facts': [
      ('Origin', 'Johannes Trithemius, abbot of Sponheim'),
      ('Published', '<em>Polygraphia</em>, 1518 (posthumous)'),
      ('Key Type', 'Optional starting offset only'),
      ('Significance', 'Introduced the tabula recta to Europe'),
      ('Modern Lesson', 'A predictable keystream is barely a keystream'),
    ],
    'panels': [
      ('📜', 'Historical Context',
       "<p>Johannes Trithemius (1462–1516) was a Benedictine abbot, occult scholar, and one of the most consequential cryptographers of the German Renaissance. His <em>Steganographia</em> (written ~1499, published 1606) disguised a cipher manual as a book of angel-summoning magic; his <em>Polygraphia</em> (1518) was the first printed book on cryptography in the West. The progressive cipher described here appears in <em>Polygraphia</em>'s opening tables.</p>"
       "<p style=\"margin-top:1rem;\">Trithemius's contribution was structural, not numerical. By writing 26 successively-shifted alphabets in a square — the <strong>tabula recta</strong> — he made the polyalphabetic principle visible: each letter could be enciphered by a different alphabet. Belaso (1553) and Vigenère (1586) added the keyword on top of Trithemius's table.</p>"),
      ('⚙️', 'How It Works',
       "<p>Encrypt the first letter with shift 0, the second with shift 1, the third with shift 2, and so on. The keystream is just the position counter:</p>"
       "<pre>Plain:  S T E G A N O G R A P H I A\n"
       "Shift:  0 1 2 3 4 5 6 7 8 9 10 11 12 13\n"
       "Cipher: S U G J E S U N Z J Z S U N</pre>"
       "<p style=\"margin-top:1rem;\">The optional starting offset simply moves the counter's origin. There is no keyword. The system is <em>polyalphabetic</em> in form — every letter uses a different alphabet — but the alphabet sequence is public knowledge, so it offers no real secrecy.</p>"),
      ('💀', 'How It Was Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Try 26 starting offsets</div><div class=\"attack-diff\">Complexity: Trivial</div><p class=\"attack-desc\">Because the keystream is fixed and public, the only secret is the starting position. Twenty-six guesses recover the plaintext — Caesar-grade work.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Frequency drift</div><div class=\"attack-diff\">Complexity: Easy on long messages</div><p class=\"attack-desc\">After 26 letters the shifts wrap around and a 26-period structure emerges. Splitting the ciphertext into 26 columns and frequency-analysing each one yields the offset.</p></div>"),
      ('🔬', 'What It Teaches Modern Cryptography',
       "<p>Trithemius is the proof-of-concept that a single ciphertext letter need not always come from the same alphabet. That single idea unlocks Vigenère, Beaufort, Porta, the Jefferson disk, the Bazeries cylinder, the M-94, the Hagelin lug-and-pin family, and ultimately the rotor machines (Enigma, SIGABA, Typex). Every twentieth-century mechanical cipher is a descendant of Trithemius's table.</p>"
       "<p style=\"margin-top:1rem;\">The flaw — a public, predictable keystream — is also the lesson. Modern stream ciphers (RC4, ChaCha20) are <em>polyalphabetic</em> in exactly Trithemius's sense, but their keystreams are pseudorandom outputs of a keyed PRF. Same architecture, immensely larger key.</p>"),
    ],
    'related': [
      ('vigenere', 'Vigenère Cipher', "Adds a keyword on top of Trithemius's table"),
      ('alberti-disk', 'Alberti Disk', 'The earlier mechanical polyalphabetic ancestor'),
      ('beaufort', 'Beaufort', 'A self-reciprocal variant of the same family'),
    ],
    'prev': ('alberti-disk', 'Alberti Disk'),
    'next': ('vigenere', 'Vigenère Cipher'),
  },
  {
    'slug': 'cardano-autokey',
    'title': 'Cardano Autokey',
    'subtitle': '1550 · the original self-keying cipher',
    'meta_desc': "Girolamo Cardano's 1550 autokey — prime the keystream with a single seed letter, then continue it with the plaintext itself. The first published self-keying scheme.",
    'hall_href': '../halls/polyalphabetic.html',
    'hall_label': 'Hall III: The Polyalphabetic Era',
    'hall_short': 'Hall III · Polyalphabetic',
    'page_meta_label': 'Hall III · Polyalphabetic',
    'era_class': 'era-renaissance',
    'era_label': 'Italian Renaissance · 1550',
    'sec_class': 'sec-broken',
    'sec_label': 'Easy (recovery cascade)',
    'tagline': "Cardano's original autokey: prime with a single letter, then let the message extend its own key.",
    'facts': [
      ('Origin', 'Girolamo Cardano, Italy'),
      ('Year', '1550 (<em>De Subtilitate</em>)'),
      ('Key Type', 'Single priming letter'),
      ('Key Length', 'Effectively the message length'),
      ('Modern Lesson', 'Key reuse from the plaintext is not the same as key freshness'),
    ],
    'panels': [
      ('📜', 'Historical Context',
       "<p>Girolamo Cardano (1501–1576) — physician, mathematician, gambler, and author of the first textbook on probability — proposed the autokey idea in <em>De Subtilitate</em> (1550). Cardano's version is much weaker than the autokey usually attributed to Vigenère today: Cardano primed the keystream with a single letter and then used the plaintext from position 0 onward as the key for positions 1, 2, 3 …</p>"
       "<p style=\"margin-top:1rem;\">The flaw is structural. If an attacker guesses or recovers any plaintext letter, they immediately know the next key letter — and therefore the next plaintext letter — and a cascade unzips the entire message. Vigenère's later refinement (prime with a multi-letter keyword instead of a single letter) blocks the cascade by giving the attacker no foothold to start from.</p>"),
      ('⚙️', 'How It Works',
       "<p>Pick a single seed letter <code>S</code>. The keystream is</p>"
       "<pre>k₀ = S\n"
       "kᵢ = pᵢ₋₁  for i ≥ 1</pre>"
       "<p>Encryption uses the standard Vigenère table: cᵢ = (pᵢ + kᵢ) mod 26. Decryption recovers p₀ from c₀ using S, then uses each just-recovered pᵢ as the key for cᵢ₊₁.</p>"
       "<p style=\"margin-top:1rem;\"><strong>Worked example with S = Q, plaintext MEET ME AT MIDNIGHT:</strong></p>"
       "<pre>Plain : M E E T M E A T M I D N I G H T\n"
       "Key   : Q M E E T M E A T M I D N I G H\n"
       "Cipher: C Q I X F Q E T F U L Q V O N A</pre>"),
      ('💀', 'How It Was Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Probable-word cascade</div><div class=\"attack-diff\">Complexity: Easy with a crib</div><p class=\"attack-desc\">Guess the first plaintext word. Each correct letter immediately reveals the next key letter and therefore the next plaintext letter. The attack propagates forward through the message at no extra cost. The whole reason Vigenère replaced Cardano with a multi-letter primer was to deny the attacker this foothold.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">26 priming guesses</div><div class=\"attack-diff\">Complexity: Trivial on short messages</div><p class=\"attack-desc\">Try every possible seed letter. For each, run the cascade and look for English. Twenty-six attempts and a frequency check is enough.</p></div>"),
      ('🔬', 'What It Teaches Modern Cryptography',
       "<p>Cardano's autokey is the cleanest historical example of <em>state confusion</em>: he conflated <em>using the plaintext</em> with <em>using a fresh key</em>. Modern stream ciphers and AEAD modes go to great length to make sure the keystream is independent of the data being encrypted, precisely because Cardano-style coupling enables exactly the cascade attack shown above.</p>"
       "<p style=\"margin-top:1rem;\">CTR mode and ChaCha20 are the modern correct version of the same idea: the keystream is generated from a key and a counter, never from the plaintext. The lesson — never let your key depend on your data — is one of the load-bearing rules of modern cryptography.</p>"),
    ],
    'related': [
      ('autokey', 'Vigenère Autokey', "Cardano's idea, hardened with a multi-letter primer"),
      ('vigenere', 'Vigenère Cipher', 'The cipher Cardano was iterating on'),
      ('one-time-pad', 'One-Time Pad', 'The opposite extreme — keystream truly independent'),
    ],
    'prev': ('autokey', 'Vigenère Autokey'),
    'next': ('running-key', 'Running Key Cipher'),
  },
  {
    'slug': 'wheatstone',
    'title': 'Wheatstone Cryptograph',
    'subtitle': 'A clock-face polyalphabetic · 1867',
    'meta_desc': "Charles Wheatstone's 1867 cryptograph — two geared clock dials whose hands sweep an outer plain alphabet and an inner mixed alphabet, generating a polyalphabetic ciphertext one click at a time.",
    'hall_href': '../halls/machines.html',
    'hall_label': 'Hall VII: Mechanical Cipher Machines',
    'hall_short': 'Hall VII · Machines',
    'page_meta_label': 'Hall VII · Machines',
    'era_class': 'era-victorian',
    'era_label': 'Victorian London · 1867',
    'sec_class': 'sec-broken',
    'sec_label': 'Weak (1867 standards)',
    'tagline': "Two geared clock dials, an outer plain alphabet, an inner mixed alphabet — the polyalphabetic cipher you can demonstrate without writing anything down.",
    'facts': [
      ('Origin', 'Charles Wheatstone, London'),
      ('Year', '1867 Paris Universal Exposition'),
      ('Key Type', 'Mixed-alphabet keyword (inner dial)'),
      ('Mechanism', 'Two geared hands on concentric dials'),
      ('Modern Lesson', 'Mechanisation does not, by itself, add security'),
    ],
    'panels': [
      ('📜', 'Historical Context',
       "<p>Charles Wheatstone (1802–1875) is best known for the Wheatstone bridge, the concertina, and (with Cooke) the first commercial electric telegraph. He was also an enthusiastic cryptographer: the <strong>Playfair cipher</strong> we know by Lord Playfair's name was actually invented by Wheatstone, and his cryptograph — a brass clockwork enciphering machine the size of a pocket watch — was unveiled at the 1867 Paris Universal Exposition.</p>"
       "<p style=\"margin-top:1rem;\">The cryptograph never saw operational use, but it is mechanically charming and conceptually ahead of its time. It anticipates by half a century the Hagelin lug-and-pin machines and, more loosely, the rotor architecture of the twentieth century: an external alphabet is mapped through a mechanically advancing internal alphabet.</p>"),
      ('⚙️', 'How It Works',
       "<p>The cryptograph is two concentric dials. The outer dial carries the standard alphabet (plus a 27th mark for word-space on the original brass version). The inner dial carries a <strong>mixed</strong> alphabet derived from a keyword — Polybius-style: write the keyword, drop duplicates, then append the unused letters in order.</p>"
       "<p style=\"margin-top:1rem;\">The two hands are geared together so that the inner hand advances one step for every step of the outer hand. To encrypt a letter you sweep the outer hand around to that plaintext letter; the inner hand simultaneously walks across the mixed alphabet, and you read off the ciphertext letter under the inner hand.</p>"
       "<p style=\"margin-top:1rem;\">Because the inner hand never returns to a known position relative to the outer alphabet (each successive plaintext letter advances it by a different amount), the substitution changes letter-by-letter. The cipher is genuinely polyalphabetic, even though the operator only handles a single physical key (the keyword that built the inner dial).</p>"),
      ('💀', 'How It Was Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Kasiski / index of coincidence</div><div class=\"attack-diff\">Complexity: Comparable to Vigenère</div><p class=\"attack-desc\">The keystream is fully determined by the plaintext (it is, in effect, a Cardano-style autokey running over a mixed alphabet). Once the mixed alphabet is recovered — and twenty or thirty plausible keywords cover most operator choices — the rest is a Vigenère-grade cryptanalytic problem.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Mechanical capture</div><div class=\"attack-diff\">Complexity: Steal the device</div><p class=\"attack-desc\">The cipher's only secret is the inner-dial keyword. A captured machine, with a known-keyword crib, becomes a Vigenère table.</p></div>"),
      ('🔬', 'What It Teaches Modern Cryptography',
       "<p>The Wheatstone cryptograph is the cleanest Victorian illustration of a principle that took another sixty years to be stated as <em>Kerckhoffs's principle</em>: the security of a cipher must rest on its key, not on the secrecy of its mechanism. Wheatstone's machine had a beautiful mechanism and a small key. The mechanism on its own bought no security.</p>"),
    ],
    'related': [
      ('playfair', 'Playfair', "Wheatstone's other invention — and Lord Playfair's namesake"),
      ('alberti-disk', 'Alberti Disk', 'Earlier disk-cryptograph using the same idea'),
      ('jefferson-disk', 'Jefferson Disk', 'American disk-based polyalphabetic cousin'),
    ],
    'prev': ('jefferson-disk', 'Jefferson Disk'),
    'next': ('bazeries', 'Bazeries Cylinder'),
  },
  {
    'slug': 'morse',
    'title': 'Morse Code',
    'subtitle': "Telegraphy's universal alphabet · 1840s",
    'meta_desc': "International Morse code — the dot-dash telegraph alphabet that made the wired world possible and provided the carrier signal for a century of military and amateur ciphers.",
    'hall_href': '../halls/ancient.html',
    'hall_label': 'Hall I: World Origins of Cryptography',
    'hall_short': 'Hall I · World Origins',
    'page_meta_label': 'Hall I · Telegraphy',
    'era_class': 'era-victorian',
    'era_label': 'Telegraph age · 1840s →',
    'sec_class': 'sec-broken',
    'sec_label': 'Encoding, not encryption',
    'tagline': "Strictly speaking, Morse is not a cipher — it is the encoding that nineteenth and twentieth-century ciphers were carried on top of.",
    'facts': [
      ('Origin', 'Samuel F. B. Morse & Alfred Vail, USA'),
      ('First message', '1844 — "What hath God wrought"'),
      ('International standard', '1865 (Vienna)'),
      ('Carrier for', 'Vigenère, fractionated Morse, OTP, JN-25, …'),
      ('Modern role', 'Aviation idents, amateur radio, accessibility'),
    ],
    'panels': [
      ('📜', 'Historical Context',
       "<p>Samuel Morse and Alfred Vail's 1840s telegraph code was the first widely deployed digital communication system in human history. It made instantaneous trans-continental signalling possible, redrew the map of finance and journalism, and — for cryptography — created the first universal medium that ciphered messages could ride on. International Morse, slightly different from Morse's original American code, was standardised in Vienna in 1865 and is the form taught and used today.</p>"
       "<p style=\"margin-top:1rem;\">From 1865 to roughly 2000, almost every cipher of military or diplomatic consequence was transmitted over a Morse-coded radio link: Vigenère traffic in the American Civil War, Zimmermann's telegram in 1917, Enigma over short-wave in the 1940s, JN-25 across the Pacific, OTP traffic for clandestine agents into the 1980s. The cipher and the encoding were always two distinct layers — and several twentieth-century cryptosystems (fractionated Morse, the Slidex code) deliberately exploited the encoding's structure.</p>"),
      ('⚙️', 'How It Works',
       "<p>Each letter, digit, and punctuation mark is assigned a unique sequence of dots and dashes. Within a character, elements are separated by one short gap; between characters by a longer gap; between words by a still longer gap (this demo uses <code>/</code> for the word break).</p>"
       "<pre>SOS   = ... --- ...\n"
       "HELLO = .... . .-.. .-.. ---\n"
       "73    = --... ...--   (amateur-radio sign-off, \"best regards\")</pre>"
       "<p style=\"margin-top:1rem;\">The code is roughly optimised for English letter frequencies — E is a single dot, T is a single dash, common letters are short, rare letters long. This makes Morse one of the earliest examples of variable-length coding, predating Huffman by a century.</p>"),
      ('💀', 'How It Was Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">It was never \"broken\" — it is a public encoding</div><div class=\"attack-diff\">Complexity: Trivial (look up the table)</div><p class=\"attack-desc\">Morse is not, and was never intended to be, a cipher. It is a public encoding designed for transmission efficiency and readability. The cryptographic question is always about the cipher running on top of Morse, not Morse itself.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Operator-fingerprinting</div><div class=\"attack-diff\">Used for traffic analysis throughout WWII</div><p class=\"attack-desc\">Skilled operators have a recognisable rhythm — their <em>fist</em>. Allied direction-finding stations could identify individual German operators by ear, track them as they moved between units, and reconstruct order-of-battle even when the underlying Enigma traffic remained unread. The encoding was public, but the human at the key was unique.</p></div>"),
      ('🔬', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>Morse-era idea</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>Encoding ≠ encryption</td><td>Base64, hex, ASCII vs. ChaCha20 — same distinction</td></tr>"
       "<tr><td>Variable-length symbols</td><td>Huffman coding, gzip, JPEG entropy stages</td></tr>"
       "<tr><td>Layered transport</td><td>TLS-over-TCP-over-IP — separate concerns at each layer</td></tr>"
       "<tr><td>Side-channel: operator fist</td><td>Modern timing attacks, keystroke fingerprinting</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('fractionated-morse', 'Fractionated Morse', "Splits each Morse symbol across columns — actual cipher, not just encoding"),
      ('vernam', 'Vernam (1917)', 'Combined a Morse-driven punched-tape keystream with the Baudot teleprinter'),
      ('navajo-code-talkers', 'Navajo Code Talkers', 'Replaced the public Morse alphabet with a private spoken one'),
    ],
    'prev': ('rosetta-stone', 'Rosetta Stone'),
    'next': ('histiaeus-tattoo', 'Histiaeus\u2019s Tattooed Messenger'),
  },
  {
    'slug': 'cardano-grille',
    'title': 'Cardano Grille',
    'subtitle': '1550 · steganography by template',
    'meta_desc': "Girolamo Cardano's 1550 grille — a card with cut-out windows. Write the secret through the windows; fill the rest with innocuous text; the recipient overlays an identical grille to read.",
    'hall_href': '../halls/transposition.html',
    'hall_label': 'Hall IV: The Transposition Hall',
    'hall_short': 'Hall IV · Transposition',
    'page_meta_label': 'Hall IV · Transposition / Steganography',
    'era_class': 'era-renaissance',
    'era_label': 'Italian Renaissance · 1550',
    'sec_class': 'sec-weak',
    'sec_label': 'Weak (steganography, not encryption)',
    'tagline': "A pierced card and an innocuous-looking letter: the recipient overlays an identical grille and reads the secret through the holes.",
    'facts': [
      ('Origin', 'Girolamo Cardano, Italy'),
      ('Year', '1550 (<em>De Subtilitate</em>)'),
      ('Key Type', 'The grille pattern (positions of the holes)'),
      ('Family', 'Steganography / hidden-text transposition'),
      ('Modern Lesson', 'Hiding a message ≠ encrypting a message'),
    ],
    'panels': [
      ('📜', 'Historical Context',
       "<p>Cardano's grille is the second of his great cryptographic ideas — the first being the autokey. He proposed it in <em>De Subtilitate</em> (1550) as a method any literate person could use without algebra: cut a piece of stiff card with windows in irregular positions, write your secret one letter at a time through the windows onto the page beneath, then lift the grille away and fill the surrounding space with plausible-sounding prose.</p>"
       "<p style=\"margin-top:1rem;\">Variants and descendants of the grille remained in active espionage use into the twentieth century. The <strong>turning grille</strong> — a square card rotated through four positions to fill an N×N grid completely — was used by the German Army in the early years of WWI for tactical traffic, and broken by French and British analysts within months.</p>"),
      ('⚙️', 'How It Works',
       "<p>The grille is a square card of side <em>N</em> with holes punched at agreed-upon positions. Sender and receiver each have an identical card. To encrypt:</p>"
       "<ol>"
       "<li>Place the grille over a blank N×N grid.</li>"
       "<li>Write the secret letter-by-letter through the holes.</li>"
       "<li>Lift the grille; fill the remaining cells with plausible filler (a poem, a shopping list, a love letter).</li>"
       "</ol>"
       "<p style=\"margin-top:1rem;\">To decrypt, the recipient places their grille over the received grid in the same orientation and reads the letters visible through the holes.</p>"
       "<p style=\"margin-top:1rem;\">The demo on this page uses a key of the form <code>size:idx,idx,idx,…</code> — the grid side length followed by the zero-based positions of the holes. The default <code>5:0,3,7,12,19,21,24</code> places six holes in a 5×5 grid.</p>"),
      ('💀', 'How It Was Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Capture the grille</div><div class=\"attack-diff\">Complexity: A search of the office</div><p class=\"attack-desc\">There is essentially no algorithm — the security rests entirely on the secrecy of the physical card. Once the card is photographed, copied, or stolen, every past and future message becomes readable.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Style mismatch</div><div class=\"attack-diff\">Complexity: Easy with practice</div><p class=\"attack-desc\">Convincing filler text is hard. A trained censor reading thousands of letters notices stilted phrasing, awkward grammar, and the distinctive cadence of grille-fill — and flags suspicious correspondence for closer inspection.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Brute-force the holes</div><div class=\"attack-diff\">Complexity: Tractable for small grids</div><p class=\"attack-desc\">For a 5×5 grid with 6 holes there are only C(25,6) ≈ 177,000 possible grille patterns. Try each, accept the one whose extracted letters spell English. The turning-grille variant raises the count enough to need cleverer tooling, but not enough to resist a determined cryptanalytic bureau.</p></div>"),
      ('🔬', 'What It Teaches Modern Cryptography',
       "<p>The Cardano grille is the cleanest historical example of <strong>steganography</strong> as distinct from cryptography: the goal is not to make the message unreadable, but to make the message <em>invisible</em>. Modern steganography (LSB embedding in images, DNS-tunnel exfiltration, Cicada 3301's OutGuess puzzles) is methodologically a direct descendant.</p>"
       "<p style=\"margin-top:1rem;\">The strategic lesson is also unchanged: stego buys you traffic-analysis resistance, not confidentiality. Anyone who suspects the channel and acquires the carrier method reads everything. Best practice today is to encrypt first and steganographically hide the ciphertext — belt and braces.</p>"),
    ],
    'related': [
      ('cardano-autokey', 'Cardano Autokey', "Cardano's other 1550 invention"),
      ('cicada-3301', 'Cicada 3301', "Modern steganography in PNG, PDF, MP3, and runic"),
      ('histiaeus-tattoo', 'Histiaeus\u2019s Tattooed Messenger', 'Steganography\u2019s ancient ancestor'),
    ],
    'prev': ('columnar', 'Columnar Transposition'),
    'next': ('double-transposition', 'Double Transposition'),
  },
  {
    'slug': 'null-cipher',
    'title': 'Null Cipher',
    'subtitle': "Concealment by selective reading · ancient → modern",
    'meta_desc': "The null cipher — hide the secret in plain sight by spelling it out with the first letters of an innocuous message. Used by spies, prisoners, and Bacon, since at least the Roman empire.",
    'hall_href': '../halls/transposition.html',
    'hall_label': 'Hall IV: The Transposition Hall',
    'hall_short': 'Hall IV · Transposition',
    'page_meta_label': 'Hall IV · Steganography',
    'era_class': 'era-ancient',
    'era_label': 'Antiquity → present',
    'sec_class': 'sec-weak',
    'sec_label': 'Weak (concealment, not encryption)',
    'tagline': "Spell the secret with every Nth letter of every Mth word. Trivial when noticed; surprisingly hard to notice.",
    'facts': [
      ('Origin', 'Roman & medieval correspondents'),
      ('Notable uses', "Bacon's <em>Advancement of Learning</em>; WWII POW letters; spy classifieds"),
      ('Key Type', 'Position rule — first/last letter, Nth letter, Nth word, …'),
      ('Family', 'Steganography (concealment cipher)'),
      ('Modern Lesson', 'A hidden message that nobody looks for is, briefly, secure'),
    ],
    'panels': [
      ('📜', 'Historical Context',
       "<p>The null cipher is older than any cipher recognised by name. Roman correspondents are documented hiding instructions in the first letters of innocuous-looking poems; medieval monks did the same in marginalia and acrostics; Renaissance humanists turned the technique into a literary game.</p>"
       "<p style=\"margin-top:1rem;\">Operationally it returned to prominence in the world wars. Allied and Axis prisoners both used null ciphers in censored letters home; the most-cited example is the German U-boat commander's letter that read, taking every fifth word, <em>FATHER IS DEAD</em> — a status report, not a bereavement notice. American POWs in Vietnam hid blink patterns and word-position nulls in propaganda interviews. Cold-war espionage frequently used newspaper classifieds as null carriers.</p>"),
      ('⚙️', 'How It Works',
       "<p>Pick a position rule. The simplest is <em>first letter of every word</em>:</p>"
       "<pre>Carrier: <strong>H</strong>elp <strong>E</strong>very <strong>L</strong>ittle <strong>P</strong>up\n"
       "Hidden : H E L P</pre>"
       "<p>The demo on this page builds carrier sentences from a dictionary of common English words and selects ones whose chosen letter matches the next character of your secret. Position keys it accepts:</p>"
       "<ul>"
       "<li><code>first</code> — first letter of each word (default)</li>"
       "<li><code>last</code> — last letter of each word</li>"
       "<li><code>2</code>, <code>3</code>, … — Nth letter of each word</li>"
       "</ul>"
       "<p style=\"margin-top:1rem;\">When no real word fits a needed letter, the demo fabricates a plausible-looking filler so the round-trip always closes. In real use a writer would simply rewrite the carrier sentence around the constraint.</p>"),
      ('💀', 'How It Was Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Suspicion plus the right reading rule</div><div class=\"attack-diff\">Complexity: Trivial once you check</div><p class=\"attack-desc\">Once a censor suspects a letter, they read the first letters, then the last letters, then every second letter, and so on. Within a few minutes any single-rule null cipher is exposed.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Statistical anomaly</div><div class=\"attack-diff\">Complexity: Detectable on long carriers</div><p class=\"attack-desc\">Because the carrier is constrained to spell something, its letter and word-length distributions drift away from natural English. Bletchley-era censors maintained statistical baselines for ordinary correspondence and flagged outliers.</p></div>"),
      ('🔬', 'What It Teaches Modern Cryptography',
       "<p>The null cipher is the ancestor of every <em>covert channel</em> in computer security: timing channels, DNS-tunnel exfiltration, image-LSB steganography, even the way malware hides in CDN traffic. The mechanism is unchanged from the Roman version — pick a carrier nobody will look at, encode the secret in a property of the carrier nobody will measure.</p>"
       "<p style=\"margin-top:1rem;\">The defensive lesson is also unchanged. Defenders cannot watch every field of every packet, so attackers have rich choices for where to hide. Best modern practice is to assume covert channels exist and to design protocols that minimise the bandwidth available for them — not to chase every clever new carrier.</p>"),
    ],
    'related': [
      ('bacon', "Bacon's Cipher", 'Encodes a binary stream into typeface choice — a structured null cipher'),
      ('cardano-grille', 'Cardano Grille', 'The other classical concealment cipher'),
      ('cicada-3301', 'Cicada 3301', 'Modern null/stego puzzles in plain sight'),
    ],
    'prev': ('cardano-grille', 'Cardano Grille'),
    'next': ('bacon', "Bacon's Cipher"),
  },
]


TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}{subtitle_paren} \u2014 The Cipher Museum</title>
  <meta name="description" content="{meta_desc}">
  <meta property="og:title" content="{title}{subtitle_paren} \u2014 The Cipher Museum">
  <meta property="og:description" content="{meta_desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ciphermuseum.com/ciphers/{slug}.html">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{title}{subtitle_paren} \u2014 The Cipher Museum">
  <meta name="twitter:description" content="{meta_desc}">
  <meta name="theme-color" content="#0a0a0f">
  <link rel="canonical" href="https://ciphermuseum.com/ciphers/{slug}.html">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="stylesheet" href="../css/museum.css">
</head>
<body>
<a class="skip-link" href="#main-content">Skip to main content</a>
<nav class="museum-nav" aria-label="Primary">
  <div class="nav-inner">
    <a href="../index.html" class="nav-logo">
      <svg class="nav-logo-icon" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="8" stroke="currentColor" stroke-width="1"/>
        <circle cx="16" cy="16" r="2" fill="currentColor"/>
      </svg>
      <span class="nav-logo-text">The Cipher Museum</span>
    </a>
    <ul class="nav-links">
      <li><a href="../index.html">Entrance</a></li>
      <li><a href="../museum-map.html">Museum Map</a></li>
      <li><a href="../timeline.html">Timeline</a></li>
      <li><a href="../challenges.html">Challenges</a></li>
      <li><a href="../glossary.html">Glossary</a></li>
      <li><a href="../cryptanalysis.html">Cryptanalysis Techniques</a></li>
    </ul>
  </div>
</nav>

<main id="main-content" tabindex="-1">
<div class="page-hero">
  <div class="breadcrumb">
    <a href="../index.html">Entrance</a><span>&rsaquo;</span>
    <a href="{hall_href}">{hall_label}</a><span>&rsaquo;</span>
    {title}
  </div>
  <div class="page-meta">
    <span class="page-num">{page_meta_label}</span>
    <span class="badge {era_class}">{era_label}</span>
    <span class="badge {sec_class}">{sec_label}</span>
  </div>
  <h1 class="page-title">{title}{subtitle_html}</h1>
  <p class="page-tagline">{tagline}</p>
  <div class="exhibit-facts">
{facts_html}
  </div>
</div>

<div class="demo-section" data-cipher="{slug}"></div>

<div class="exhibit-layout">
  <div class="exhibit-main">
{panels_html}
  </div>
  <div class="exhibit-side">
    <div class="panel" style="border-color:var(--gold-b);">
      <div class="panel-head" style="background:var(--gold-glow);border-color:var(--gold-b);">
        <span class="panel-icon">\u2694</span><span class="panel-title" style="color:var(--gold);">Quick Facts</span>
      </div>
      <div class="panel-body">
        <table class="cipher-table">
          <tbody>
{quickfacts_html}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<section class="related-exhibits">
  <h2 class="related-exhibits__heading">Related Exhibits</h2>
  <div class="related-exhibits__grid">
{related_html}
  </div>
</section>

<div class="hall-nav">
  <a href="../ciphers/{prev_slug}.html" class="hall-nav-link">
    <span class="hall-nav-dir">&larr; Previous</span>
    <span class="hall-nav-name">{prev_label}</span>
  </a>
  <a href="../ciphers/{next_slug}.html" class="hall-nav-link next">
    <span class="hall-nav-dir">Next &rarr;</span>
    <span class="hall-nav-name">{next_label}</span>
  </a>
</div>

</main>

<footer class="museum-footer">
  <div class="footer-grid">
    <div class="footer-brand">
      <span class="footer-logo-text">The Cipher Museum</span>
      <p class="footer-brand-desc">Open-source cryptography education. MIT License. GitHub Pages.</p>
    </div>
    <div>
      <div class="footer-col-title">Navigate</div>
      <ul class="footer-links">
        <li><a href="../museum-map.html">Museum Map</a></li>
        <li><a href="../timeline.html">Timeline</a></li>
        <li><a href="../challenges.html">Challenges</a></li>
        <li><a href="../glossary.html">Glossary</a></li>
      </ul>
    </div>
    <div>
      <div class="footer-col-title">This Hall</div>
      <ul class="footer-links">
        <li><a href="{hall_href}">{hall_label}</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span class="footer-copy">&copy; The Cipher Museum &middot; MIT License</span>
    <span class="footer-copy">{hall_short}</span>
  </div>
</footer>
<script src="../js/ciphers/all-engines.js"></script>
<script src="../js/demo-loader.js"></script>
<script src="../js/nav.js" defer></script>
<script src="../js/lightbox.js"></script>
</body>
</html>
"""


def render(p):
  facts_html = '\n'.join(
    f'    <div class="fact"><span class="fact-label">{label}</span><span class="fact-value">{value}</span></div>'
    for label, value in p['facts']
  )
  panels_html_parts = []
  panels_html_parts.append(
    '\n    <div class="cipher-significance">\n      <h3>Why This Matters</h3>\n      ' +
    p['panels'][0][2] + '\n    </div>\n'
  )
  for icon, title, body in p['panels'][1:]:
    panels_html_parts.append(
      f'    <div class="panel">\n      <div class="panel-head"><span class="panel-icon">{icon}</span><span class="panel-title">{title}</span></div>\n      <div class="panel-body">{body}</div>\n    </div>\n'
    )
  panels_html = '\n'.join(panels_html_parts)

  quickfacts_html = '\n'.join(
    f'            <tr><td>{label}</td><td>{value}</td></tr>'
    for label, value in p['facts']
  )

  related_html = '\n'.join(
    f'    <a href="../ciphers/{slug}.html" class="related-card">\n      <span class="related-card__number">Related</span>\n      <span class="related-card__name">{name}</span>\n      <span class="related-card__tag">{tag}</span>\n    </a>'
    for slug, name, tag in p['related']
  )

  subtitle_paren = f' ({p["subtitle"]})' if p.get('subtitle') else ''
  subtitle_html = f' <span style="opacity:.6;font-weight:400;">{p["subtitle"]}</span>' if p.get('subtitle') else ''

  return TEMPLATE.format(
    title=p['title'],
    subtitle_paren=subtitle_paren,
    subtitle_html=subtitle_html,
    meta_desc=p['meta_desc'],
    slug=p['slug'],
    hall_href=p['hall_href'],
    hall_label=p['hall_label'],
    hall_short=p['hall_short'],
    page_meta_label=p['page_meta_label'],
    era_class=p['era_class'],
    era_label=p['era_label'],
    sec_class=p['sec_class'],
    sec_label=p['sec_label'],
    tagline=p['tagline'],
    facts_html=facts_html,
    panels_html=panels_html,
    quickfacts_html=quickfacts_html,
    related_html=related_html,
    prev_slug=p['prev'][0],
    prev_label=p['prev'][1],
    next_slug=p['next'][0],
    next_label=p['next'][1],
  )


def main():
  force = '--force' in sys.argv
  for p in PAGES:
    out = os.path.join(CIPHERS, p['slug'] + '.html')
    if os.path.exists(out) and not force:
      print(f'skip (exists): {out}')
      continue
    with open(out, 'w', encoding='utf-8') as f:
      f.write(render(p))
    print(f'wrote: {out}')


if __name__ == '__main__':
  main()
