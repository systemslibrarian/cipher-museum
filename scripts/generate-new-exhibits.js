/**
 * Generates the 11 new exhibit pages (39-49) added in the April 2026 expansion.
 * Run once: node scripts/generate-new-exhibits.js
 * Idempotent: overwrites the target files.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const TOTAL = 49;
const ROOT = path.resolve(__dirname, '..');

const exhibits = [
  {
    file: 'atbash.html', num: 39, demo: 'atbash',
    title: 'Atbash',
    tagline: 'The ancient Hebrew reflection cipher — A↔Z, B↔Y, C↔X…',
    era: 'Ancient · ~500 BC', sec: 'Trivial', secBadge: 'sec-broken',
    hallSlug: 'ancient', hallName: 'Hall I: Birth of Cryptography',
    facts: [
      ['Origin', 'Hebrew scribes (Book of Jeremiah)'],
      ['Year', '~500 BC'],
      ['Key Type', 'None (fixed reflection)'],
      ['Broken By', 'Inspection (it is its own inverse)'],
      ['Modern Lesson', 'Ciphers without keys offer no security'],
    ],
    significance: 'Atbash is the simplest substitution cipher: A maps to Z, B to Y, on through M↔N. It appears inside the Hebrew Bible — the prophet Jeremiah uses Atbash to disguise the names BABEL and KASDIM as SHESHACH and LEB-KAMAI. It is the ancestor of every reflection-based cipher that followed, including the wirings inside Enigma\'s reflector.',
    history: 'Atbash predates the Caesar cipher by half a millennium. Because it is its own inverse — encrypting twice returns the original — it is the historical root of the "involution" property that later appears in many machines (Enigma, Lorenz). It offered minimal secrecy even in its day; its purpose was likely religious or scribal convention rather than security.',
    howWorks: 'Replace each letter with its mirror across the alphabet:<br><br><pre>A B C D E F G H I J K L M\n| | | | | | | | | | | | |\nZ Y X W V U T S R Q P O N</pre>So HELLO → SVOOL. Encrypt twice and you are back where you started.',
    howBroken: '<div class="attack-panel"><div class="attack-name">Recognition</div><div class="attack-diff">Complexity: Trivial</div><p class="attack-desc">There is no key. Anyone who recognizes the system can decrypt instantly. Frequency analysis is not even needed — the unique letter pattern of A↔Z reflection is visible at a glance once a reader knows the trick.</p></div>',
    teaches: [
      ['Self-inverse operation', 'XOR in modern stream ciphers — same operation encrypts and decrypts'],
      ['Reflector concept', 'Enigma\'s Umkehrwalze (reflector) made the machine reciprocal'],
      ['Security through obscurity fails', 'Kerckhoffs\' principle: only the key should be secret'],
    ],
    related: [
      ['caesar', 'Caesar Cipher', 'Same era, similar weakness'],
      ['monoalphabetic', 'Monoalphabetic', 'Generalized form'],
      ['rot13', 'ROT13', 'Modern reflection cousin'],
    ],
    prev: ['scytale', 'Scytale'], next: ['caesar', 'Caesar Cipher'],
  },
  {
    file: 'rot13.html', num: 40, demo: 'rot13',
    title: 'ROT13',
    tagline: 'The Caesar cipher with shift 13 — its own inverse, ubiquitous on the early internet',
    era: 'Modern · 1980s', sec: 'Trivial', secBadge: 'sec-broken',
    hallSlug: 'ancient', hallName: 'Hall I: Birth of Cryptography',
    facts: [
      ['Origin', 'Usenet net.jokes culture (~1983)'],
      ['Year', '~1983 (popularized)'],
      ['Key Type', 'None (fixed shift of 13)'],
      ['Broken By', 'Knowing the system'],
      ['Modern Lesson', 'Obfuscation ≠ encryption'],
    ],
    significance: 'ROT13 is a special case of the Caesar cipher with shift 13. Because the English alphabet has 26 letters, applying ROT13 twice returns the original — so the same operation encrypts and decrypts. It became the conventional way on early Usenet to hide spoilers, punchlines, and offensive jokes from readers who did not want to see them.',
    history: 'ROT13 has no inventor — it emerged from Usenet convention in the early 1980s. It was never meant to be secure. Its role was social: a small mechanical step the reader had to take to opt in to seeing potentially objectionable content. Most Usenet readers had a single keystroke bound to ROT13. The cipher remains in active use today in puzzle games and in spoiler tags.',
    howWorks: 'Shift each letter forward by 13:<br><br><pre>HELLO → URYYB\nURYYB → HELLO   (apply twice = original)</pre>Because 13 + 13 = 26 = 0 (mod 26), the operation is its own inverse.',
    howBroken: '<div class="attack-panel"><div class="attack-name">Knowing It Is ROT13</div><div class="attack-diff">Complexity: None</div><p class="attack-desc">There is no key. The transformation is fixed and public. ROT13 provides zero confidentiality. Its only value is mild reader effort — enough to prevent accidental viewing, not enough to deter even a curious reader.</p></div><div class="attack-panel"><div class="attack-name">Variants Equally Weak</div><div class="attack-diff">Complexity: None</div><p class="attack-desc">ROT5 (digits) and ROT47 (printable ASCII) are similar conventions for hiding text. None offer security; all are decoded by inspection.</p></div>',
    teaches: [
      ['Self-inverse over the alphabet', 'XOR with the same key in stream ciphers'],
      ['Convention as opt-in viewing', 'Modern spoiler-tags and content-warning toggles'],
      ['Obfuscation vs. encryption', 'Modern crypto distinguishes confidentiality from mere encoding'],
    ],
    related: [
      ['caesar', 'Caesar Cipher', 'Parent shift cipher'],
      ['atbash', 'Atbash', 'Other reflection cipher'],
    ],
    prev: ['atbash', 'Atbash'], next: ['polybius', 'Polybius Square'],
  },
  {
    file: 'four-square.html', num: 41, demo: 'foursquare',
    title: 'Four-Square Cipher',
    tagline: 'Delastelle\'s digram cipher: four 5×5 squares, two of them keyed',
    era: 'Late 19th Century · ~1902', sec: 'Moderate', secBadge: 'sec-broken',
    hallSlug: 'substitution', hallName: 'Hall II: Classical Substitution',
    facts: [
      ['Inventor', 'Félix Delastelle (France)'],
      ['Year', '~1902'],
      ['Key Type', 'Two keywords (two keyed squares)'],
      ['Broken By', 'Digram frequency analysis · simulated annealing'],
      ['Modern Lesson', 'Fixed mappings preserve digram statistics'],
    ],
    significance: 'Félix Delastelle invented several fractionation ciphers (Bifid, Trifid, Four-square). The Four-square is his digraphic cousin to Playfair: encrypt letters two at a time, but use two keyed alphabets instead of one. It avoids Playfair\'s "same row / same column / same letter" edge cases and the needed insertion of X between doubled letters.',
    history: 'Published in his 1902 book Traité Élémentaire de Cryptographie, the Four-square joined the Bifid and Trifid in Delastelle\'s portfolio of methods built on the Polybius square. Though never adopted by a major military, it was used by amateur cipher clubs through the 20th century and remains a popular puzzle.',
    howWorks: 'Arrange four 5×5 squares (J merged into I) in a 2×2 grid. The top-left and bottom-right are plain alphabets; the top-right and bottom-left are keyed.<br><br><pre>┌─────────────┬─────────────┐\n│  PLAIN A→Z  │  KEY 1      │\n├─────────────┼─────────────┤\n│  KEY 2      │  PLAIN A→Z  │\n└─────────────┴─────────────┘</pre>To encrypt a digram: locate the first letter in the top-left and the second in the bottom-right. Read the cipher digram from the top-right (row of letter 1, column of letter 2) and the bottom-left (row of letter 2, column of letter 1).',
    howBroken: '<div class="attack-panel"><div class="attack-name">Digram Frequency Analysis</div><div class="attack-diff">Complexity: Moderate</div><p class="attack-desc">Although single-letter frequencies are flattened, digram frequencies are merely substituted. TH, HE, IN, ER, AN — the most common English digrams — appear with roughly the same frequencies in the ciphertext, just under different letter pairs. With several hundred characters, automated solvers can recover the keys.</p></div><div class="attack-panel"><div class="attack-name">Simulated Annealing</div><div class="attack-diff">Complexity: Moderate</div><p class="attack-desc">Modern hill-climbers score candidate key-square pairs by English digram log-frequencies and converge to the correct keys in seconds.</p></div>',
    teaches: [
      ['Digram-level encryption', 'AES operates on 128-bit blocks — same idea, more bits'],
      ['Multiple keyed tables', 'Modern S-box design uses multiple tabulated nonlinear maps'],
      ['Avoiding edge cases (same-row/col)', 'AES MixColumns provides clean, edge-case-free diffusion'],
    ],
    related: [
      ['playfair', 'Playfair Cipher', 'Single-square digram cousin'],
      ['twosquare', 'Two-Square Cipher', 'Simpler sibling'],
      ['bifid', 'Bifid', 'Same inventor (Delastelle)'],
    ],
    prev: ['playfair', 'Playfair Cipher'], next: ['twosquare', 'Two-Square Cipher'],
  },
  {
    file: 'two-square.html', num: 42, demo: 'twosquare',
    title: 'Two-Square Cipher',
    tagline: 'Delastelle\'s simpler sibling of Four-square — two keyed 5×5 squares',
    era: 'Late 19th Century · ~1902', sec: 'Weak', secBadge: 'sec-broken',
    hallSlug: 'substitution', hallName: 'Hall II: Classical Substitution',
    facts: [
      ['Inventor', 'Félix Delastelle (France)'],
      ['Year', '~1902'],
      ['Key Type', 'Two keywords (two keyed squares)'],
      ['Broken By', 'Digram frequency · same-row leak'],
      ['Modern Lesson', 'Beware of identity transformations as edge cases'],
    ],
    significance: 'A pared-down version of the Four-square: only two keyed squares, side by side. Slightly easier to use by hand but with a glaring weakness — when a digram\'s two letters happen to lie in the same row of their respective squares, the cipher leaves them unchanged. Roughly 20% of digrams pass through unencrypted.',
    history: 'Published alongside the Four-square in Delastelle\'s 1902 treatise. The "horizontal" variant places the squares side by side; a "vertical" variant stacks them. Both share the same-row leak. Used recreationally rather than militarily.',
    howWorks: 'Arrange two keyed 5×5 squares horizontally. For each digram, look up the first letter in the left square and the second in the right square. Read the ciphertext from the opposite corners of the rectangle they form.<br><br><pre>If the two letters share a row → leave them unchanged.\nOtherwise:\n  cipher[0] = left[ row(L), col(R) ]\n  cipher[1] = right[ row(R), col(L) ]</pre>',
    howBroken: '<div class="attack-panel"><div class="attack-name">Same-Row Leakage</div><div class="attack-diff">Complexity: Easy</div><p class="attack-desc">Roughly one in five digrams passes through the cipher unchanged. An attacker can identify these by noticing common English digrams (TH, HE, IN, ER) appearing as themselves in the ciphertext. From there, the rows are partially recovered.</p></div><div class="attack-panel"><div class="attack-name">Digram Frequency Analysis</div><div class="attack-diff">Complexity: Moderate</div><p class="attack-desc">As with Four-square, the cipher is a fixed digram-to-digram substitution. Digram frequency tables and simulated annealing recover both keys with a few hundred characters of ciphertext.</p></div>',
    teaches: [
      ['Identity transformations as weakness', 'Modern designs eliminate fixed points (e.g., AES S-box has no fixed point)'],
      ['Two-key fractionation', 'Twin-key constructions appear in HMAC and double-encryption'],
    ],
    related: [
      ['foursquare', 'Four-Square Cipher', 'Stronger sibling'],
      ['playfair', 'Playfair Cipher', 'Single-square cousin'],
    ],
    prev: ['foursquare', 'Four-Square Cipher'], next: ['hill', 'Hill Cipher'],
  },
  {
    file: 'straddling-checkerboard.html', num: 43, demo: 'straddlingCheckerboard',
    title: 'Straddling Checkerboard',
    tagline: 'Variable-length digit codes for letters — the heart of Soviet hand ciphers',
    era: 'Late 19th – 20th Century', sec: 'Weak (alone) · Strong (in VIC)', secBadge: 'sec-weak',
    hallSlug: 'military', hallName: 'Hall V: Military &amp; Spy Ciphers',
    facts: [
      ['Origin', 'Russian / Soviet hand ciphers'],
      ['First documented', 'Late 1800s nihilist groups'],
      ['Famous use', 'Inside the VIC cipher (Reino Häyhänen, 1950s)'],
      ['Key Type', '8 high-frequency letters in row 0'],
      ['Modern Lesson', 'Variable-length codes resist character-aligned attacks'],
    ],
    significance: 'The straddling checkerboard converts letters to digits using variable-length codes — common letters (E, T, A, O, N, S, I, R) get a single digit; rarer letters get a two-digit code starting with one of two "escape" digits. Because the boundaries between codes are not aligned to fixed column widths, attackers cannot simply slice the ciphertext into uniform blocks. It became a building block in many Soviet hand ciphers, most famously VIC.',
    history: 'The technique appears in late-19th-century anarchist and nihilist correspondence in Russia, where pamphlets had to be encrypted by amateurs working from memory. Soviet intelligence later adopted it as the substitution layer of the VIC cipher carried by deep-cover agent Reino Häyhänen, exposed in 1957 when he defected and revealed the system to the FBI.',
    howWorks: 'Place 8 high-frequency letters along row 0 (the digits 0–9 minus two escape digits, here 2 and 7):<br><br><pre>     0 1 2 3 4 5 6 7 8 9\n  →  A T   O N E S   I R\n  2: B C D F G H J K L M     (prefix 2)\n  7: P Q U V W X Y Z         (prefix 7)</pre>Single-digit codes for top-row letters; two-digit codes for the rest. Decode by reading left to right, treating 2 and 7 as escape digits.',
    howBroken: '<div class="attack-panel"><div class="attack-name">Frequency Analysis on Digits</div><div class="attack-diff">Complexity: Easy (used alone)</div><p class="attack-desc">By itself, the checkerboard is just a substitution from letters to digits. Counting digit frequencies and pair frequencies recovers the alphabet in minutes. Its strength only emerges when combined with additional layers — additive keys, transposition, chain addition — as in VIC.</p></div>',
    teaches: [
      ['Variable-length encoding', 'Huffman coding and modern entropy compression'],
      ['Escape digits / prefix codes', 'UTF-8 multi-byte encoding uses identical principles'],
      ['Layered hand ciphers', 'VIC stacked checkerboard + chain addition + double transposition'],
    ],
    related: [
      ['vic', 'VIC Cipher', 'Built on top of this'],
      ['nihilist', 'Nihilist Cipher', 'Russian forerunner'],
      ['polybius', 'Polybius Square', 'Letter-to-digit ancestor'],
    ],
    prev: ['vic', 'VIC Cipher'], next: ['stager', 'Stager Cipher'],
  },
  {
    file: 'chaocipher.html', num: 44, demo: 'chaocipher',
    title: 'Chaocipher',
    tagline: 'John Byrne\'s 1918 disk cipher — unsolved for 90 years',
    era: 'Modern · 1918', sec: 'Strong (until disclosed)', secBadge: 'sec-strong',
    hallSlug: 'machines', hallName: 'Hall VII: Mechanical Cipher Machines',
    facts: [
      ['Inventor', 'John F. Byrne'],
      ['Year', '1918 (disclosed 2010)'],
      ['Key Type', 'Two scrambled 26-letter alphabets'],
      ['Famous fact', 'Held secret for 92 years; never broken until disclosure'],
      ['Modern Lesson', 'Self-modifying ciphers can be strong with simple parts'],
    ],
    significance: 'John Byrne — Irish-American writer and friend of James Joyce — invented the Chaocipher in 1918 and spent four decades trying to convince the US government and AT&T to adopt it. Nobody would license it without seeing how it worked, and Byrne refused to reveal it. His 1953 autobiography Silent Years included challenge ciphertexts that defeated codebreakers for nearly a century. In 2010, his family donated his papers to the National Cryptologic Museum and the algorithm was finally published. It turned out to be elegantly simple: two rotating disks that permute themselves after each letter.',
    history: 'Byrne carried his concept in a small box he called "The Chao" for over 50 years. William Friedman politely declined to evaluate it. The US Navy declined. AT&T declined. After Byrne\'s death in 1960, the device and notes passed to his son and then sat in a closet until 2010. When the Cipher Deavours / Louis Kruh team finally published the algorithm in Cryptologia, the cryptographic community confirmed: Byrne\'s system was genuinely strong for a hand cipher, with no obvious break given only ciphertext.',
    howWorks: 'Two 26-letter alphabets, called the "left" (ciphertext) and "right" (plaintext) wheels, are independently scrambled. To encrypt one letter:<br><br><pre>1. Find the plaintext letter on the right wheel.\n2. The ciphertext letter is at the same position on the left wheel.\n3. Rotate both wheels so the touched letters are at the "zenith" (position 0).\n4. Permute the LEFT wheel: take the letter at position 1, slide it into position 13.\n5. Permute the RIGHT wheel: rotate it one position, then take the letter at\n   position 2 and slide it into position 13.\n6. Repeat for the next plaintext letter.</pre>The wheels evolve continuously, so the same plaintext letter rarely encrypts to the same ciphertext letter twice in a row.',
    howBroken: '<div class="attack-panel"><div class="attack-name">Disclosure (2010)</div><div class="attack-diff">The only known "break"</div><p class="attack-desc">Despite four decades of public challenge ciphertexts and serious attention from professional cryptanalysts, no published cryptanalytic break of Chaocipher exists. The cipher was "broken" only when its algorithm was finally disclosed by the Byrne family in 2010 — vindicating Byrne\'s belief while also confirming Kerckhoffs\' principle: any cipher can be defeated if the algorithm becomes known and the key is short.</p></div><div class="attack-panel"><div class="attack-name">Known-Plaintext Attack</div><div class="attack-diff">Complexity: Moderate (now that algorithm is public)</div><p class="attack-desc">Modern researchers have shown that with sufficient known plaintext (a few hundred characters), the initial wheel orderings can be recovered by tracing back the deterministic permutations. Pure ciphertext-only attacks remain difficult.</p></div>',
    teaches: [
      ['Self-modifying state', 'Modern stream ciphers (RC4, ChaCha20) update internal state per byte'],
      ['Algorithm secrecy is not security', 'Kerckhoffs\' principle, finally proven on Byrne\'s case'],
      ['Simple components, complex evolution', 'Two wheels + two permutations = strong mixing'],
    ],
    related: [
      ['enigma', 'Enigma Machine', 'Same era, different architecture'],
      ['jefferson-disk', 'Jefferson Disk', 'Earlier disk-based system'],
      ['solitaire', 'Solitaire / Pontifex', 'Later self-modifying hand cipher'],
    ],
    prev: ['jefferson-disk', 'Jefferson Disk'], next: ['enigma', 'Enigma Machine'],
  },
  {
    file: 'm209.html', num: 45, demo: 'm209',
    title: 'M-209 (Hagelin C-38)',
    tagline: 'The US Army\'s portable WWII pin-and-lug cipher machine',
    era: 'World War II · 1940', sec: 'Strong (tactical)', secBadge: 'sec-strong',
    hallSlug: 'machines', hallName: 'Hall VII: Mechanical Cipher Machines',
    facts: [
      ['Inventor', 'Boris Hagelin (Sweden)'],
      ['Year', '1940 (US Army adoption)'],
      ['Production', '~140,000 units (Smith Corona, US)'],
      ['Key Type', '6 pinwheels (lengths 26, 25, 23, 21, 19, 17) + 27 lug bars'],
      ['Period', '101,405,850 letters (LCM of wheel lengths)'],
      ['Modern Lesson', 'Mechanical key streams need long periods'],
    ],
    significance: 'Boris Hagelin\'s C-38 design, sold to the US Army as the M-209, became the standard tactical cipher of American forces in WWII. Compact (about the size of a hardcover book), it weighed 2.7 kg and ran without electricity — a clerk operated it by hand, advancing a wheel and reading off ciphertext one letter at a time. Hagelin became the first millionaire in cryptography from this single contract.',
    history: 'Hagelin\'s family company — Cryptoteknik in Stockholm — had been producing pin-and-lug machines since the 1920s. When Germany invaded Norway in 1940, Hagelin escaped to the United States with the C-38 design rolled up under his arm. The US Signal Corps bought it, mass-produced it as the M-209, and shipped 140,000 units to the front lines. The cipher was known to be vulnerable to skilled cryptanalysis (German B-Dienst broke many M-209 messages), so it was used only for tactical traffic — operational orders meant to be obsolete within hours of being intercepted.',
    howWorks: 'Six pinwheels with co-prime lengths (26, 25, 23, 21, 19, 17) advance one position per letter. Each wheel has tiny pins around its edge, set to "active" or "inactive" by the operator. A bank of 27 lug bars reads which wheels are currently active and produces a number K from 0 to 27 — the key shift for the current letter. Encryption uses a Beaufort transformation:<br><br><pre>cipher = (K - plaintext) mod 26</pre>Because the wheel lengths are pairwise co-prime, the key sequence has period 26 × 25 × 23 × 21 × 19 × 17 = <strong>101,405,850</strong> letters before repeating.',
    howBroken: '<div class="attack-panel"><div class="attack-name">Known-Plaintext Attack</div><div class="attack-diff">Complexity: Hard (in the field) · Moderate (with computers)</div><p class="attack-desc">If an attacker knows or guesses the plaintext of a message (a stereotyped opening, known place name, time stamp), the resulting key stream constrains the lug settings. German cryptanalysts in WWII broke many M-209 messages this way, though it took hours per message.</p></div><div class="attack-panel"><div class="attack-name">Statistical Lug Recovery</div><div class="attack-diff">Complexity: Moderate (with sufficient ciphertext)</div><p class="attack-desc">Because the key is a sum of binary signals modulo 26, certain shift values are over- or under-represented. With enough ciphertext, a statistical attack on the key distribution recovers the lug count for each wheel.</p></div>',
    teaches: [
      ['Pin-and-lug as keystream generator', 'Modern LFSR (linear feedback shift register) stream ciphers'],
      ['Co-prime period maximization', 'Same trick used in pseudo-random number generators today'],
      ['Beaufort involution', 'Encryption and decryption use the same operation'],
    ],
    related: [
      ['enigma', 'Enigma Machine', 'Contemporary German equivalent'],
      ['lorenz', 'Lorenz Cipher', 'Strategic-level German equivalent'],
      ['vic', 'VIC Cipher', 'Cold War successor philosophy'],
    ],
    prev: ['enigma', 'Enigma Machine'], next: ['lorenz', 'Lorenz Cipher'],
  },
  {
    file: 'solitaire.html', num: 46, demo: 'solitaire',
    title: 'Solitaire / Pontifex',
    tagline: 'Bruce Schneier\'s 1999 hand cipher using a deck of playing cards',
    era: 'Modern · 1999', sec: 'Moderate', secBadge: 'sec-moderate',
    hallSlug: 'unbreakable', hallName: 'Hall IX: The Unbreakable',
    facts: [
      ['Inventor', 'Bruce Schneier'],
      ['Year', '1999'],
      ['Famous use', 'Neal Stephenson\'s novel Cryptonomicon (as "Pontifex")'],
      ['Key Type', 'Initial ordering of a 54-card deck (52 + 2 jokers)'],
      ['Keyspace', '54! ≈ 2.3 × 10⁷¹'],
      ['Modern Lesson', 'Hand-deniable crypto for high-risk environments'],
    ],
    significance: 'Bruce Schneier designed Solitaire in 1999 for Neal Stephenson\'s novel Cryptonomicon, where it appears under the name "Pontifex". The goal: a cipher that an agent could carry in a hostile country with nothing more incriminating than a deck of playing cards. Strong enough to resist amateur attack, simple enough to operate by hand. Subsequent analysis revealed minor statistical biases, so it is not recommended for production use today, but it remains an important demonstration that strong-ish encryption can be done with no electronics at all.',
    history: 'Schneier published Solitaire in an appendix to Cryptonomicon and later on his Counterpane website. Within months, cryptanalysts including Paul Crowley discovered small biases in the keystream — enough to make Solitaire weaker than ideal but not catastrophically broken. Schneier maintains the design as a teaching example and acknowledges the analysis. Real-world use by activists and journalists has been documented but is rare.',
    howWorks: 'Treat the 54-card deck as state. Each "round" produces one keystream letter (1–26):<br><br><pre>1. Move the A-joker (53) one card down.\n2. Move the B-joker (54) two cards down.\n3. Triple-cut: swap the chunks above and below the two jokers.\n4. Count-cut: read the value of the bottom card; cut that many cards\n   from the top, place above the bottom card.\n5. Look at the top card\'s value N. Count N cards down. The next card\n   (mod 26) is the keystream output. If it is a joker, repeat from step 1.</pre>Encryption is then a simple Vigenère-style shift: <code>c = (p + k - 1) mod 26 + 1</code>.',
    howBroken: '<div class="attack-panel"><div class="attack-name">Crowley Bias (2000)</div><div class="attack-diff">Complexity: Distinguisher only</div><p class="attack-desc">Paul Crowley showed that the Solitaire keystream has a measurable bias: the probability that two consecutive keystream values are equal is about 1/22.5 instead of the ideal 1/26. This is enough to <em>distinguish</em> Solitaire output from random, but not enough to recover plaintext or key in practice.</p></div><div class="attack-panel"><div class="attack-name">Operator Errors</div><div class="attack-diff">Complexity: The real risk</div><p class="attack-desc">A single mis-step in the count-cut or keystream extraction misaligns the recipient\'s deck and turns the rest of the message into gibberish. In practice, operator error is the main threat — not cryptanalysis.</p></div>',
    teaches: [
      ['Hardware-free cryptography', 'Useful where electronics are dangerous to possess'],
      ['Deniable artifacts', 'A deck of cards is innocuous; a thumb drive is not'],
      ['Distinguishability vs. recovery', 'Modern crypto requires indistinguishability from random'],
    ],
    related: [
      ['vic', 'VIC Cipher', 'Earlier hand cipher tradition'],
      ['one-time-pad', 'One-Time Pad', 'The provably secure ideal'],
      ['chaocipher', 'Chaocipher', 'Another self-modifying hand cipher'],
    ],
    prev: ['vernam', 'Vernam Cipher'], next: ['one-time-pad', 'One-Time Pad'],
  },
  {
    file: 'beale.html', num: 47, demo: 'beale',
    title: 'Beale Ciphers',
    tagline: 'Three book ciphers from 1885 said to lead to a buried treasure — two unsolved',
    era: '19th Century · published 1885', sec: 'Unsolved (Beale 1 & 3)', secBadge: 'sec-unbroken',
    hallSlug: 'puzzle', hallName: 'Hall VIII: Puzzle &amp; Novelty',
    facts: [
      ['Origin', 'James B. Ward pamphlet, Lynchburg, Virginia (1885)'],
      ['Author of plaintexts', 'Allegedly Thomas J. Beale (1820s)'],
      ['Cipher type', 'Book cipher (number = Nth word, take first letter)'],
      ['Solved', 'Beale 2 only (key: Declaration of Independence)'],
      ['Unsolved', 'Beale 1 (treasure location) and Beale 3 (heirs)'],
      ['Treasure value (claimed)', '~$60M+ in modern dollars'],
    ],
    significance: 'In 1885 a Virginia pamphlet appeared claiming that in the 1820s a man named Thomas Jefferson Beale had buried a fortune in gold, silver, and jewels somewhere in Bedford County, Virginia. Beale supposedly left three encrypted messages: cipher 1 names the location, cipher 2 itemizes the contents, cipher 3 names the heirs. In 1880 the unnamed pamphleteer cracked cipher 2 by trying the Declaration of Independence as the key — and read a precise inventory of buried treasure. Ciphers 1 and 3 have never been solved.',
    history: 'The pamphlet is widely suspected to be a hoax — the prose style of the "Beale" letters does not match the 1820s; statistical analysis of cipher 1 suggests it may not encode meaningful English; and no Thomas J. Beale appears in census records of the era. But cipher 2 really does decrypt to a sensible inventory using the Declaration of Independence, which is a remarkable coincidence to manufacture. Treasure hunters have searched Bedford County for over a century. Modern cryptanalysts have tried hundreds of candidate "key books" against ciphers 1 and 3 without success.',
    howWorks: 'A book cipher converts each plaintext letter to the position of a word in a reference text whose first letter matches.<br><br><pre>Plaintext: G O L D\n           ↓ ↓ ↓ ↓\nDeclaration words: 48=Government, 12=One, 42=Liberty, 15=Decent\nCiphertext: 48 12 42 15</pre>To decrypt, you need the exact same edition of the reference text the encoder used. A single misnumbered word breaks the entire message.',
    howBroken: '<div class="attack-panel"><div class="attack-name">Beale 2: Right Book Found</div><div class="attack-diff">Complexity: Lucky guess</div><p class="attack-desc">In 1880 the pamphleteer tried the Declaration of Independence as the key text. Numbering the words and reading their first letters produced fluent English describing buried gold and silver. This single success guarantees the cipher system is real, but the matching key for ciphers 1 and 3 remains unknown.</p></div><div class="attack-panel"><div class="attack-name">Beale 1 & 3: Still Open</div><div class="attack-diff">Complexity: Unsolved after 140 years</div><p class="attack-desc">Cryptanalysts have tested thousands of candidate documents — Bibles, Shakespeare, the US Constitution, contemporary almanacs and newspapers — without success. Statistical analysis of cipher 1 by Carl Hammer (1968) and Jim Gillogly (1980) suggests the letter distribution is non-random in suspicious ways, hinting at either a different cipher type or a hoax.</p></div>',
    teaches: [
      ['Book cipher principle', 'Modern key derivation from shared secrets'],
      ['Edition specificity', 'Cryptographic agility — same key, different formatting → fails'],
      ['Hoax-resistance of evidence', 'Provenance and reproducibility matter as much as the math'],
    ],
    related: [
      ['dictionary-code', 'Dictionary Code', 'Civil War book-cipher cousin'],
      ['running-key', 'Running Key', 'Same idea, different output'],
      ['zodiac', 'Zodiac Cipher', 'Other famous unsolved'],
    ],
    prev: ['zodiac', 'Zodiac Cipher'], next: ['kryptos', 'Kryptos'],
  },
  {
    file: 'copiale.html', num: 48, demo: 'copiale',
    title: 'Copiale Cipher',
    tagline: 'A 105-page 18th-century occult manuscript — broken by computer in 2011',
    era: '18th Century · ~1760s', sec: 'Broken (2011)', secBadge: 'sec-broken',
    hallSlug: 'puzzle', hallName: 'Hall VIII: Puzzle &amp; Novelty',
    facts: [
      ['Origin', 'East Berlin Academy archive (recovered 1990s)'],
      ['Date of creation', '~1760–1780'],
      ['Length', '105 pages, ~75,000 characters'],
      ['Symbol set', '~90 unique handwritten symbols'],
      ['Broken By', 'Knight, Megyesi, Schaefer (USC/Uppsala, 2011)'],
      ['Plaintext language', 'German'],
      ['Content', 'Initiation rituals of the "Oculist Order"'],
    ],
    significance: 'The Copiale Cipher is a beautiful handwritten manuscript using ~90 symbols — a mix of Latin letters, Greek letters, and invented glyphs. It surfaced in the East Berlin academy archives after the fall of the Wall and resisted analysis for two decades. In 2011 a team led by Kevin Knight at USC used statistical machine-translation software (originally built for translating between languages) to crack it: a homophonic substitution cipher in German, describing the initiation rituals of an 18th-century secret society called the Oculist Order ("eye-doctors"), apparently obsessed with vision and ophthalmology.',
    history: 'Knight\'s team treated the unknown symbols as an unknown language and ran an expectation-maximization (EM) algorithm to find the most likely letter mappings, scoring hypotheses against German n-gram statistics. The breakthrough was recognizing that some symbols were nulls (decoys), some were homophones (multiple symbols → one letter), and that the language was German rather than Latin. The decoded text turned out to be a manual of initiation: candidates for membership had a single hair plucked from their eyebrow; new members took an oath in a darkened chamber; the ritual involved an "eye operation" symbolizing the gain of secret sight. The order has no documented connection to the Bavarian Illuminati but may have been a related fraternal experiment.',
    howWorks: 'Each plaintext letter is enciphered as one of multiple symbols (a homophonic substitution). Common letters (E, N, R, S in German) get more symbols; rare letters get fewer. Some symbols stand for nothing — they are pure decoys inserted to flatten frequencies. A small set of symbols stands for whole words or syllables.<br><br>The Copiale uses ~90 symbols to encode a 26-letter alphabet, giving about 3–4 symbols per letter on average for the most common ones.',
    howBroken: '<div class="attack-panel"><div class="attack-name">Statistical Machine Translation (2011)</div><div class="attack-diff">Complexity: Computational</div><p class="attack-desc">Kevin Knight, Beáta Megyesi, and Christiane Schaefer treated the cipher as an unknown language. Their EM algorithm iteratively refined a probability distribution over symbol-to-letter mappings, scoring against German letter and bigram frequencies. Wrong guesses about the language (Latin, English) produced gibberish; switching to German immediately produced fluent text.</p></div><div class="attack-panel"><div class="attack-name">Hypothesis-Driven Symbol Classification</div><div class="attack-diff">Complexity: Insight</div><p class="attack-desc">The team discovered that certain frequent-but-strange symbols had to be nulls (decoys), and that letter pairs like CH and SCH had dedicated symbols — exactly the German bigrams that needed compression. Recognizing the structural patterns of German shrank the search space dramatically.</p></div>',
    teaches: [
      ['NLP for cryptanalysis', 'Modern statistical models attack historical ciphers'],
      ['Homophonic substitution at scale', '90 symbols offers diminishing returns vs. polyalphabetic'],
      ['Documents survive their secrets', 'The cipher protected the rituals for ~250 years'],
    ],
    related: [
      ['homophonic', 'Homophonic Substitution', 'Same family of cipher'],
      ['great-cipher', 'The Great Cipher', 'Earlier nomenclator with similar structure'],
      ['zodiac', 'Zodiac Cipher', 'Modern symbol-substitution mystery'],
    ],
    prev: ['beale', 'Beale Ciphers'], next: ['kryptos', 'Kryptos'],
  },
  {
    file: 'kryptos.html', num: 49, demo: 'kryptos',
    title: 'Kryptos',
    tagline: 'CIA courtyard sculpture, 1990 — three sections solved, one (K4) still open',
    era: 'Modern · 1990', sec: 'K1–K3 Broken · K4 Unsolved', secBadge: 'sec-unbroken',
    hallSlug: 'puzzle', hallName: 'Hall VIII: Puzzle &amp; Novelty',
    facts: [
      ['Artist', 'Jim Sanborn'],
      ['Cryptographic consultant', 'Edward Scheidt (former CIA)'],
      ['Installed', 'November 3, 1990 · CIA HQ, Langley'],
      ['Total characters', '865 letters across 4 sections'],
      ['K1', 'Vigenère, key PALIMPSEST · solved 1999'],
      ['K2', 'Vigenère, key ABSCISSA · solved 1999'],
      ['K3', 'Transposition · solved 1999'],
      ['K4', 'Unknown system · 97 characters · unsolved'],
    ],
    significance: 'Kryptos is a 12-foot copper sculpture installed in the CIA\'s courtyard in 1990, encoded with four separate cryptographic puzzles totaling 865 characters. It was meant to take the agency a few months to solve; instead it took the NSA seven years (they cracked K1–K3 first, in 1992, but kept it secret), and the public CIA team eight. The fourth section, K4 — only 97 characters long — remains unsolved more than 35 years later, despite hints from the artist Jim Sanborn (BERLIN, CLOCK, NORTHEAST, EAST) and two solving prizes that have gone unclaimed.',
    history: 'The CIA commissioned the sculpture from artist Jim Sanborn, who worked with retired CIA cryptographer Ed Scheidt to design four progressively harder ciphers. K1 used a modified Vigenère with the keyword PALIMPSEST and a custom KRYPTOS-keyed alphabet; K2 used the same system with key ABSCISSA. K3 was a transposition cipher quoting Howard Carter\'s description of opening Tutankhamun\'s tomb. K4 remains a mystery — Sanborn has revealed four "cribs" (BERLIN at letters 64–69, CLOCK at 70–74, NORTHEAST at 26–34, EAST at 22–25), but the system that generates the rest is still unknown. Many have tried; none have succeeded.',
    howWorks: 'K1 and K2 use a Vigenère cipher built on a 26-letter "tableau" whose alphabet starts with KRYPTOS:<br><br><pre>Plain  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z\nTableau K R Y P T O S A B C D E F G H I J L M N Q U V W X Z</pre>Each plaintext letter is shifted by the corresponding key letter using this alphabet (not the standard A–Z).<br><br>K3 is a complex transposition. K4 is unknown — possibly a one-time pad, a custom polyalphabetic, or a layered system Sanborn refuses to disclose.',
    howBroken: '<div class="attack-panel"><div class="attack-name">K1, K2, K3 — broken 1992–1999</div><div class="attack-diff">Complexity: Hard but solvable</div><p class="attack-desc">NSA cryptanalysts Dennis McDaniel, Ken Miller, and others solved K1–K3 in 1992 using standard polyalphabetic and transposition techniques. The CIA\'s in-house team led by David Stein solved them independently in 1998. Computer scientist Jim Gillogly published the public solution in 1999. The plaintexts contain the words BETWEEN SUBTLE SHADING AND THE ABSENCE OF LIGHT… and a quotation about Tutankhamun\'s tomb.</p></div><div class="attack-panel"><div class="attack-name">K4 — open since 1990</div><div class="attack-diff">Complexity: Unknown</div><p class="attack-desc">K4 is only 97 characters long. Sanborn has provided four cribs to constrain the search, but the underlying system has resisted every public and (presumably) classified attempt. Speculation includes a one-time pad (in which case it cannot be solved without the pad), a customized periodic cipher with a very long key, or a multi-step composite. Sanborn has said he will reveal the answer if he dies, but as of 2026 it remains open.</p></div>',
    teaches: [
      ['Custom-alphabet polyalphabetics', 'Resistance to standard tableaus'],
      ['Public challenge as research driver', 'Bitcoin puzzles, Project Euler, capture-the-flag culture'],
      ['Short ciphertext is hardest', 'Statistical attacks need data; 97 chars is too few'],
    ],
    related: [
      ['vigenere', 'Vigenère', 'K1 and K2 use a custom tableau version'],
      ['zodiac', 'Zodiac Cipher', 'Other famous unsolved'],
      ['beale', 'Beale Ciphers', 'Public-challenge tradition'],
    ],
    prev: ['copiale', 'Copiale Cipher'], next: ['great-cipher', 'The Great Cipher'],
  },
];

const navLinks = `
      <li><a href="../index.html">Entrance</a></li>
      <li><a href="../museum-map.html">Museum Map</a></li>
      <li><a href="../timeline.html">Timeline</a></li>
      <li><a href="../challenges.html">Challenges</a></li>
      <li><a href="../glossary.html">Glossary</a></li>
      <li><a href="../cryptanalysis.html">Cryptanalysis Techniques</a></li>`;

function escAttr(s) { return String(s).replace(/"/g, '&quot;'); }

function render(ex) {
  const factsHTML = ex.facts.map(([l, v]) =>
    `    <div class="fact"><span class="fact-label">${l}</span><span class="fact-value">${v}</span></div>`
  ).join('\n');

  const quickFactsRows = [['Exhibit', `${String(ex.num).padStart(2, '0')} of ${TOTAL}`], ['Era', ex.era], ['Security', ex.sec], ...ex.facts]
    .map(([l, v]) => `            <tr><td>${l}</td><td>${v}</td></tr>`).join('\n');

  const teachesRows = ex.teaches.map(([a, b]) =>
    `            <tr><td>${a}</td><td>${b}</td></tr>`
  ).join('\n');

  const relatedHTML = ex.related.map(([href, name, tag]) => `    <a href="../ciphers/${href}.html" class="related-card">
      <span class="related-card__number">Related</span>
      <span class="related-card__name">${name}</span>
      <span class="related-card__tag">${tag}</span>
    </a>`).join('\n');

  const demoHTML = ex.demo
    ? `\n<div class="demo-section" data-cipher="${ex.demo}"></div>\n`
    : '';

  const era = ex.era.toLowerCase();
  let eraBadgeClass = 'era-renaissance';
  if (/ancient|bc/.test(era)) eraBadgeClass = 'era-ancient';
  else if (/medieval/.test(era)) eraBadgeClass = 'era-medieval';
  else if (/19th|victorian/.test(era)) eraBadgeClass = 'era-19c';
  else if (/world war|wwii|wwi/.test(era)) eraBadgeClass = 'era-19c';
  else if (/modern/.test(era)) eraBadgeClass = 'era-19c';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ex.title} — The Cipher Museum</title>
  <meta name="description" content="${escAttr(ex.tagline)}">
  <meta property="og:title" content="${ex.title} — The Cipher Museum">
  <meta property="og:description" content="${escAttr(ex.tagline)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ciphermuseum.com/ciphers/${ex.file}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${ex.title} — The Cipher Museum">
  <meta name="twitter:description" content="${escAttr(ex.tagline)}">
  <meta name="theme-color" content="#0a0a0f">
  <link rel="canonical" href="https://ciphermuseum.com/ciphers/${ex.file}">
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
    <ul class="nav-links">${navLinks}
    </ul>
  </div>
</nav>

<main id="main-content" tabindex="-1">
<div class="page-hero">
  <div class="breadcrumb">
    <a href="../index.html">Entrance</a><span>&rsaquo;</span>
    <a href="../halls/${ex.hallSlug}.html">${ex.hallName}</a><span>&rsaquo;</span>
    ${ex.title}
  </div>
  <div class="page-meta">
    <span class="page-num">Exhibit ${String(ex.num).padStart(2, '0')} of ${TOTAL}</span>
    <span class="badge ${eraBadgeClass}">${ex.era}</span>
    <span class="badge ${ex.secBadge}">${ex.sec}</span>
  </div>
  <h1 class="page-title">${ex.title}</h1>
  <p class="page-tagline">${ex.tagline}</p>
  <div class="exhibit-facts">
${factsHTML}
  </div>
</div>
${demoHTML}
<div class="exhibit-layout">
  <div class="exhibit-main">

    <div class="cipher-significance">
      <h3>Why This Matters</h3>
      <p>${ex.significance}</p>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">📜</span><span class="panel-title">Historical Context</span></div>
      <div class="panel-body"><p>${ex.history}</p></div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">⚙️</span><span class="panel-title">How It Works</span></div>
      <div class="panel-body"><p>${ex.howWorks}</p></div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">💀</span><span class="panel-title">How It Was Broken</span></div>
      <div class="panel-body">${ex.howBroken}</div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">🔬</span><span class="panel-title">What It Teaches Modern Cryptography</span></div>
      <div class="panel-body">
        <table class="cipher-table">
          <thead><tr><th>Concept from ${ex.title}</th><th>Modern Evolution</th></tr></thead>
          <tbody>
${teachesRows}
          </tbody>
        </table>
      </div>
    </div>

  </div>
  <div class="exhibit-side">
    <div class="panel" style="border-color:var(--gold-b);">
      <div class="panel-head" style="background:var(--gold-glow);border-color:var(--gold-b);">
        <span class="panel-icon">⚔</span><span class="panel-title" style="color:var(--gold);">Quick Facts</span>
      </div>
      <div class="panel-body">
        <table class="cipher-table">
          <tbody>
${quickFactsRows}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<section class="related-exhibits">
  <h2 class="related-exhibits__heading">Related Exhibits</h2>
  <div class="related-exhibits__grid">
${relatedHTML}
  </div>
</section>

<div class="hall-nav">
  <a href="../ciphers/${ex.prev[0]}.html" class="hall-nav-link">
    <span class="hall-nav-dir">&larr; Previous</span>
    <span class="hall-nav-name">${ex.prev[1]}</span>
  </a>
  <a href="../ciphers/${ex.next[0]}.html" class="hall-nav-link next">
    <span class="hall-nav-dir">Next &rarr;</span>
    <span class="hall-nav-name">${ex.next[1]}</span>
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
        <li><a href="../halls/${ex.hallSlug}.html">${ex.hallName}</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span class="footer-copy">&copy; The Cipher Museum &middot; MIT License</span>
    <span class="footer-copy">Exhibit ${String(ex.num).padStart(2, '0')} of ${TOTAL}</span>
  </div>
</footer>
<script src="../js/ciphers/all-engines.js"></script>
<script src="../js/demo-loader.js"></script>
<script src="../js/nav.js" defer></script>
<script src="../js/lightbox.js"></script>
</body>
</html>
`;
}

for (const ex of exhibits) {
  const out = path.join(ROOT, 'ciphers', ex.file);
  fs.writeFileSync(out, render(ex));
  console.log('wrote', out);
}
console.log('DONE: ' + exhibits.length + ' exhibit pages generated.');
