#!/usr/bin/env python3
"""F-028 tranche 2: generate 6 new exhibit pages + integrate into site.

Adds: autokey, nomenclator, book-cipher, dorabella, sigaba, typex.

Exhibit pages follow the canonical template (atbash.html). Hall membership
follows the museum-map.html Complete Cipher Index labelling (I-IX).
"""
import os
import re
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ─────────────────────────────────────────────────────────────────
# Per-exhibit data
# ─────────────────────────────────────────────────────────────────
EXHIBITS = [
    {
        "slug": "autokey",
        "title": "Autokey",
        "tagline": "Vigenère's self-extending key — the message becomes its own key.",
        "era_label": "Renaissance · 1586",
        "era_class": "era-renaissance",
        "year_short": "1586",
        "sec_label": "Statistical (Friedman, 1920s)",
        "sec_class": "sec-broken",
        "hall_num": "III",
        "hall_slug": "polyalphabetic",
        "hall_name": "Polyalphabetic Frontier",
        "demo_engine": "autokey",
        "facts": [
            ("Origin", "Blaise de Vigenère (1586), refining Belaso/Cardano"),
            ("Year", "1586"),
            ("Key Type", "Short keyword, then plaintext itself extends the key"),
            ("Broken By", "Friedman's index of coincidence + autokey-aware crib dragging (1920s)"),
            ("Modern Lesson", "Self-keyed schemes still leak: the key is no longer random once it carries plaintext statistics"),
        ],
        "why": (
            "Vigenère's <em>autokey</em> is the under-appreciated half of his 1586 system. After the keyword "
            "is exhausted, the plaintext itself is appended to the key — so the key never repeats. That single "
            "change wiped out the Kasiski attack a century before Kasiski wrote it down. For nearly 350 years "
            "the autokey was effectively unbreakable in the field, until William F. Friedman's 1920s statistical "
            "machinery made it tractable."
        ),
        "history": (
            "Belaso (1553) and Cardano (1556) had both proposed self-extending keys; Vigenère's <em>Traicté des "
            "chiffres</em> (1586) gave the construction its definitive form and unfortunately also presented the "
            "much weaker repeating-key variant. History remembered the wrong one: the polyalphabetic that became "
            "known as &lsquo;the Vigenère cipher&rsquo; for the next four centuries is the breakable repeating-key "
            "version, and Vigenère's actually-strong autokey was largely forgotten until Friedman's interwar work."
        ),
        "how": (
            "Pick a short keyword K. Encrypt the first |K| plaintext letters with K under a Vigenère shift. "
            "Then take the plaintext itself, prepend K, and use that string as the running key for the rest of "
            "the message. Decryption recovers K-many letters first, then uses those recovered plaintext letters "
            "as the key for the next stretch — and so on. The key never repeats; its statistics are those of "
            "natural English (or French, etc.), not of a short cycled keyword."
        ),
        "attack_name": "Friedman's Autokey Attack",
        "attack_diff": "Complexity: Polynomial (1920s SIS hand methods)",
        "attack_desc": (
            "The key isn't random — it is plaintext shifted by a few characters. Friedman observed that the "
            "ciphertext has detectable correlation with itself shifted by the keyword length, because shifted "
            "plaintext-vs-plaintext is just the original Vigenère table applied to English-vs-English. Crib "
            "dragging the most likely keyword length yields the keyword in dozens to a few hundred trial decryptions."
        ),
        "lessons": [
            ("Self-extending key", "Modern stream ciphers feed plaintext-derived state back in too — but only via cryptographic mixing (e.g., AES-OFB key schedule)"),
            ("Friedman's index of coincidence (κ)", "Still the canonical periodicity test taught in cryptanalysis courses"),
            ("&lsquo;Don't reuse keys&rsquo; isn't enough", "If your &lsquo;key' has natural-language structure you've leaked it"),
        ],
        "related": [
            ("vigenere", "Vigenère", "Repeating-key sibling, much weaker"),
            ("running-key", "Running Key", "Same idea but key = a long passage, not the message itself"),
            ("beaufort", "Beaufort", "Reciprocal Vigenère variant"),
        ],
        "prev": ("running-key", "Running Key"),
        "next": ("bazeries", "Bazeries Cipher"),
    },
    {
        "slug": "nomenclator",
        "title": "Nomenclator",
        "tagline": "The 400-year diplomatic compromise: a small substitution alphabet plus a large code dictionary.",
        "era_label": "Renaissance · 1400s–1800s",
        "era_class": "era-renaissance",
        "year_short": "1400s",
        "sec_label": "Statistical + intercept-volume",
        "sec_class": "sec-broken",
        "hall_num": "II",
        "hall_slug": "substitution",
        "hall_name": "Substitution Era",
        "demo_engine": "nomenclator",
        "facts": [
            ("Origin", "Italian city-state diplomacy, 14th–15th c."),
            ("Year", "1400s onward (Mantua, Venice, the Vatican)"),
            ("Key Type", "Alphabet substitution + 1,000–2,000 entry codebook of words and names"),
            ("Broken By", "Black Chambers (Vienna, Paris, London) c. 1700–1850 by sheer intercept volume"),
            ("Modern Lesson", "Hybrid systems with mixed-granularity tokens still need uniform statistical hardness"),
        ],
        "why": (
            "From roughly 1400 to 1850, every European court used some flavour of nomenclator. It is the "
            "longest-running cipher family in history. A nomenclator combines two things: (1) a substitution "
            "alphabet for ordinary letters, and (2) a printed codebook listing common words, names, places, "
            "and titles, each replaced by a numeric or symbol code. The Babington plot, the Great Cipher of "
            "Louis XIV, Marie Antoinette's correspondence, and the Spanish Armada's traffic are all nomenclators."
        ),
        "history": (
            "The earliest surviving nomenclator dates to the Mantua chancery in 1401. The Vatican's nomenclators "
            "from the 1500s ran to several thousand entries. By the time Antoine Rossignol designed the Great "
            "Cipher in 1626, nomenclators were standard issue across Europe. They remained in use into the early "
            "telegraphic era — the diplomatic codebook that appears in 1860s telegrams is essentially a printed "
            "industrial-era nomenclator. Black Chambers — government cryptanalytic offices in Vienna, Paris, and "
            "London — built their reputation on slowly reconstructing nomenclator codebooks from intercepted traffic."
        ),
        "how": (
            "A typical 18th-century nomenclator has three parts: <strong>(1)</strong> a substitution alphabet "
            "mapping each letter to one or more cipher symbols (often digits 01–99), <strong>(2)</strong> a "
            "vocabulary list of perhaps 1,500 common words and names mapped to higher numbers, and "
            "<strong>(3)</strong> a list of <em>nulls</em> — symbols that mean &lsquo;ignore me&rsquo; — sprinkled in "
            "to break frequency. Encoding switches granularity mid-message: <em>The</em> ENVOY <em>arrived in</em> "
            "VIENNA might come out as <code>23 1402 41 17 1899</code>."
        ),
        "attack_name": "Black-Chamber Reconstruction",
        "attack_diff": "Complexity: Years of work per codebook",
        "attack_desc": (
            "Letter-level frequencies leak the substitution alphabet quickly. The codebook entries are harder: "
            "they have to be reconstructed from context across many intercepts (a number that always appears "
            "near a date is probably a month; one that always appears near a port is a city). The Vienna Black "
            "Chamber under Lambach famously broke each new diplomatic nomenclator within months of its introduction "
            "in the early 1700s. The Great Cipher resisted attack for over 200 years (see Bazeries, Hall X)."
        ),
        "lessons": [
            ("Mixed-granularity tokens", "Modern compression-then-encrypt schemes have the same problem: a long token leaks more than a short one"),
            ("Codebooks are operational poison", "Distributing and updating codebooks is what eventually killed nomenclators — a problem modern key management still inherits"),
            ("Statistical hardness must be uniform", "Any easy-to-break component (the letter alphabet) opens the rest"),
        ],
        "related": [
            ("babington", "Babington Plot Cipher", "Tudor nomenclator broken by Phelippes"),
            ("great-cipher", "Great Cipher", "The 200-year unbroken nomenclator"),
            ("dictionary-code", "Dictionary / Book Code", "Industrial-era successor"),
            ("homophonic", "Homophonic Substitution", "The frequency-flattening half of a nomenclator alone"),
        ],
        "prev": ("homophonic", "Homophonic Substitution"),
        "next": ("playfair", "Playfair"),
    },
    {
        "slug": "book-cipher",
        "title": "Book Cipher",
        "tagline": "If both correspondents have the same book, the book itself is the key.",
        "era_label": "18th–20th c.",
        "era_class": "era-19c",
        "year_short": "18th c.",
        "sec_label": "Secure if the book is unguessable; broken otherwise",
        "sec_class": "sec-broken",
        "hall_num": "V",
        "hall_slug": "military",
        "hall_name": "Military & Field",
        "demo_engine": "bookCipher",
        "facts": [
            ("Origin", "Pre-revolutionary French military couriers; American Revolutionary War"),
            ("Year", "1700s onward"),
            ("Key Type", "An agreed-upon book; ciphertext is a list of (page, line, word) or (page, word) coordinates"),
            ("Broken By", "Identifying the book — the Beale Cipher 2 was solved when James Ward tried the Declaration of Independence"),
            ("Modern Lesson", "Key distribution is the hard part; the underlying primitive can be trivial"),
        ],
        "why": (
            "A book cipher trades cryptographic complexity for a logistical secret: the book itself. If you and "
            "I both own a copy of the same edition of <em>Don Quixote</em>, I can encode my message as a list of "
            "page/line/word triples and you can read it. Adversaries who don't know which book is in use face a "
            "search problem of unbounded size. The American Revolutionary War, the Aaron Burr conspiracy, the "
            "Beale Treasure papers, German WWI sleeper-agent traffic, and SOE WWII low-priority cells all used "
            "book ciphers."
        ),
        "history": (
            "Benedict Arnold and John André used a book cipher keyed to <em>Blackstone's Commentaries</em> in 1780; "
            "Aaron Burr used one for his 1807 conspiracy correspondence. The most famous book cipher is the second "
            "of the three Beale papers — encoded against the Declaration of Independence and decoded by James "
            "Ward in 1885 (who then published it along with the still-unsolved papers 1 and 3). German agent "
            "ciphers in both World Wars frequently used commercial novels (so they could be replaced if compromised). "
            "SOE used printed-silk one-time pads for high-value circuits but reverted to book ciphers for low-priority "
            "agents whose loss could be tolerated."
        ),
        "how": (
            "Pick a book and an edition. To encode the word <em>RIVER</em>, scan the book until you find that word; "
            "record its location as <code>(page, line, word)</code> — say <code>(127, 14, 6)</code>. Send the "
            "triplet. Variants: <strong>letter-level</strong> book ciphers (every plaintext letter is encoded as "
            "the position of any matching letter in the book), <strong>word-only</strong> ciphers (faster but less "
            "flexible — rare words must be spelled out), and <strong>number-only</strong> ciphers (the running "
            "Beale-style format that is just lists of integers)."
        ),
        "attack_name": "Identify the Book",
        "attack_diff": "Complexity: Unbounded search vs. bounded inference",
        "attack_desc": (
            "If the analyst can guess the book, decryption is mechanical. Hints leak constantly: a (page, line, word) "
            "format that uses small page numbers suggests a pamphlet rather than a novel; recurring locations suggest "
            "a short text re-read; word lengths inferable from spacing point at common words. James Ward solved Beale "
            "Cipher 2 by simply trying the Declaration of Independence. Beale 1 and 3 remain unsolved because no one "
            "has identified <em>their</em> books."
        ),
        "lessons": [
            ("The hard part is key distribution", "Same insight drives modern PKI"),
            ("Out-of-band key sharing", "Couriered books prefigure Diffie-Hellman: get a shared secret without revealing it on the wire"),
            ("Unguessable secrets", "If the adversary knows your book is one of 50 popular novels, you have at most ~6 bits of key"),
        ],
        "related": [
            ("beale", "Beale Ciphers", "The most famous unsolved book cipher (papers 1 and 3)"),
            ("dictionary-code", "Dictionary / Book Code", "Codebook variant — fixed industrial dictionary"),
            ("running-key", "Running Key", "Same book-as-key idea, applied as a Vigenère stream"),
            ("nomenclator", "Nomenclator", "Hand-printed predecessor"),
        ],
        "prev": ("dictionary-code", "Dictionary / Book Code"),
        "next": ("nihilist", "Nihilist Cipher"),
    },
    {
        "slug": "dorabella",
        "title": "Dorabella Cipher",
        "tagline": "Edward Elgar's 1897 cryptogram — 87 squiggles that have resisted every attempt since.",
        "era_label": "19th c. · 1897",
        "era_class": "era-19c",
        "year_short": "1897",
        "sec_label": "Unsolved",
        "sec_class": "sec-secure",
        "hall_num": "VIII",
        "hall_slug": "puzzle",
        "hall_name": "Puzzle & Unsolved",
        "demo_engine": None,
        "facts": [
            ("Origin", "Sir Edward Elgar, composer (1857–1934)"),
            ("Year", "14 July 1897"),
            ("Key Type", "Custom 24-symbol alphabet of arcs and orientations"),
            ("Broken By", "Nobody — over 125 years of attempts, no consensus solution"),
            ("Modern Lesson", "Tiny ciphertexts (87 chars) don't give cryptanalysis enough statistical signal"),
        ],
        "why": (
            "On 14 July 1897 Edward Elgar enclosed a short cryptogram in a thank-you note to Dora Penny, the "
            "21-year-old daughter of a family friend. It runs three lines, eighty-seven characters, drawn from "
            "an alphabet of 24 symbols (arcs of one, two, or three loops, rotated to one of eight angles). Dora "
            "could not read it; she said as much in her 1937 memoir. Elgar never gave the answer. Nobody since — "
            "professional cryptanalysts, computer hill-climbers, Elgar scholars — has produced a decryption that "
            "the cryptanalytic community accepts."
        ),
        "history": (
            "Elgar was a recreational cryptographer; his notebooks contain an alphabet of the same 24 symbols "
            "labelled with letters in a pattern resembling a Polybius-style 3×8 grid. Tony Gaffney, Eric Sams, "
            "and others have proposed plausible-but-disputed substitution solutions, often with claims that the "
            "plaintext is wordplay or an in-joke between Elgar and Penny. The 87-character length is the "
            "fundamental problem: against a homophonic or polyalphabetic substitution it is statistically "
            "insufficient, and there is no second cryptogram in the same system to provide depth. The Elgar "
            "Society holds an open standing prize for a verifiable solution; the prize remains unclaimed."
        ),
        "how": (
            "The 24 symbols are built from one, two, or three concentric semicircular arcs, each rotatable to "
            "one of eight orientations spaced 45° apart (3 × 8 = 24). The natural assumption is a substitution "
            "into the 26-letter English alphabet — possibly with two letters merged (I/J or U/V, in 19th-c. "
            "fashion). The cryptogram's symbol distribution is roughly flat, which rules out a simple Caesar "
            "or unkeyed monoalphabetic. Hill-climbing solvers have produced near-English decryptions, but each "
            "differs from the others in ways that suggest the algorithm is finding local maxima rather than the truth."
        ),
        "attack_name": "Why It Resists",
        "attack_diff": "Complexity: Bounded by 87 characters of ciphertext",
        "attack_desc": (
            "Friedman's index of coincidence on the symbol distribution is between English-flat and uniform. "
            "Modern simulated-annealing solvers (the same family that cracked Zodiac's Z340 in 2020) routinely "
            "produce English-looking output for the Dorabella, but those outputs differ markedly from one run "
            "to the next — a signal that the algorithm is fitting noise. Until either a second cryptogram in the "
            "same system surfaces or an external constraint pins down the alphabet, the Dorabella may be permanently "
            "underdetermined."
        ),
        "lessons": [
            ("Sample size matters", "Modern security analysts care about <em>distinguishing distance</em> partly for this reason — small samples don't give an attacker enough leverage"),
            ("Local maxima are seductive", "When your scoring function is a language model, every local maximum looks like &lsquo;a solution'"),
            ("Without depth, ambiguity wins", "VENONA needed key reuse; Beale 2 needed the right book; Dorabella has neither"),
        ],
        "related": [
            ("voynich", "Voynich Manuscript", "Larger unsolved system, same fundamental problem of underdetermined alphabet"),
            ("zodiac", "Zodiac Killer Ciphers", "Z340 was solved in 2020 — Dorabella may yield to the same techniques"),
            ("kryptos", "Kryptos K4", "97 characters by a known author — same statistical scarcity"),
            ("beale", "Beale Ciphers", "Two of three remain unsolved for the same depth-shortage reason"),
        ],
        "prev": ("voynich", "Voynich Manuscript"),
        "next": ("zodiac", "Zodiac Killer Ciphers"),
    },
    {
        "slug": "sigaba",
        "title": "SIGABA (ECM Mark II)",
        "tagline": "The American WWII rotor machine the Axis never broke — fifteen rotors, irregular stepping.",
        "era_label": "WWII · 1940",
        "era_class": "era-wwii",
        "year_short": "1940",
        "sec_label": "Never broken in service",
        "sec_class": "sec-secure",
        "hall_num": "VII",
        "hall_slug": "machines",
        "hall_name": "Mechanical Machines",
        "demo_engine": "sigaba",
        "facts": [
            ("Origin", "William F. Friedman & Frank Rowlett (US Army SIS); Laurance Safford (US Navy OP-20-G)"),
            ("Year", "Approved 1940; in service 1941–1959"),
            ("Key Type", "15 rotors arranged as 3 banks of 5 (cipher × 5, control × 5, index × 5)"),
            ("Broken By", "Never broken in operational service; declassified 1996"),
            ("Modern Lesson", "Pseudorandom rotor stepping defeats the regularities that broke Enigma"),
        ],
        "why": (
            "Enigma stepped its rotors like a car odometer: predictable, regular, exploitable. Rowlett's insight "
            "in the late 1930s was that the rotor advance itself should be cryptographically driven. SIGABA "
            "added two extra rotor banks whose only job was to decide, on each keystroke, which of the five "
            "<em>cipher</em> rotors should step — sometimes one, sometimes four, never the same pattern twice "
            "in any reasonable interval. That single design choice, combined with rotors that could be inserted "
            "in either direction, made SIGABA the most secure operational cipher machine of WWII."
        ),
        "history": (
            "SIGABA was the joint Army/Navy successor to a tangle of incompatible 1930s machines (M-134, the "
            "Navy's CSP-889). Friedman and Rowlett at the SIS provided the analytical work; Safford's OP-20-G "
            "added the index permuter. Fewer than 10,000 units were ever built — they were heavy, expensive, "
            "and required two operators. The machine handled all US strategic Army and Navy traffic in the "
            "European and Pacific theatres. No SIGABA traffic is known to have been read by the Axis. The "
            "machine remained classified until 1996, decades after its retirement; modern cryptanalytic analyses "
            "(Stamp, Chan; Lee 2000s) suggest SIGABA's effective key space is around 2<sup>95</sup>, well "
            "beyond what 1940s electromechanics could exhaustively search."
        ),
        "how": (
            "Three banks of five rotors. The <strong>cipher bank</strong> performs the actual substitution. "
            "The <strong>control bank</strong> is wired to advance pseudo-randomly, taking input from a four-bit "
            "&lsquo;clock' that rotates one rotor per keystroke. The control bank's outputs feed the "
            "<strong>index bank</strong> — five rotors whose contacts encode the question &lsquo;which of the "
            "five cipher rotors steps next?&rsquo; The result: any given keystroke advances 1–4 of the cipher "
            "rotors in a pattern that depends on the entire current rotor state. The simulation in this exhibit "
            "models that pseudorandom advance and the resulting per-keystroke substitution."
        ),
        "attack_name": "Why It Held",
        "attack_diff": "Complexity: ~2<sup>95</sup> effective key space",
        "attack_desc": (
            "Enigma fell to two structural weaknesses: regular stepping (so the position of each rotor was "
            "predictable as a function of message length) and the reflector (which guaranteed no letter encoded "
            "to itself, providing the famous &lsquo;I/I&rsquo; crib elimination). SIGABA has irregular stepping "
            "by construction, no reflector, and no plugboard self-pairing constraint. The Bombe-style "
            "menu-and-stepping attack that worked on Enigma simply has nothing to grip. Modern (post-2000) "
            "academic analyses confirm that even with full machine knowledge, the search remains intractable "
            "for 1940s computing. SIGABA is the rare WWII machine that actually was as good as its designers claimed."
        ),
        "lessons": [
            ("Make the schedule itself secret", "Same lesson reappears in modern stream ciphers (key schedule must be cryptographically strong)"),
            ("No reflector → no constraint", "Enigma's elegant reciprocity was also its single biggest exploitable property"),
            ("Compartmented design teams", "Friedman and Safford collaborated across services — the rare case of US inter-service cryptographic cooperation actually working"),
        ],
        "related": [
            ("enigma", "Enigma", "What SIGABA was designed to surpass"),
            ("typex", "Typex", "British cousin — Enigma + extra rotors but conventional stepping"),
            ("m209", "M-209", "American tactical machine; SIGABA was the strategic counterpart"),
            ("purple", "Purple", "Japanese diplomatic stepping-switch contemporary"),
        ],
        "prev": ("m209", "M-209 (Hagelin C-38)"),
        "next": ("typex", "Typex"),
    },
    {
        "slug": "typex",
        "title": "Typex",
        "tagline": "Britain's improved Enigma — five rotors, no plugboard, used at Bletchley to read its own intercepts.",
        "era_label": "WWII · 1937",
        "era_class": "era-wwii",
        "year_short": "1937",
        "sec_label": "Never confirmed broken; far stronger than Enigma in service",
        "sec_class": "sec-secure",
        "hall_num": "VII",
        "hall_slug": "machines",
        "hall_name": "Mechanical Machines",
        "demo_engine": "typex",
        "facts": [
            ("Origin", "RAF Squadron Leader O.G.W. Lywood and team, derived from the commercial Enigma G"),
            ("Year", "Service 1937–1956"),
            ("Key Type", "5 rotors (3 stepping + 2 stator) chosen from a set of 10 or 14"),
            ("Broken By", "Never confirmed broken — German cryptanalysts at OKW/Chi reportedly judged it not worth attacking"),
            ("Modern Lesson", "Removing a weakness (Enigma's plugboard quirks) by adding rotors trades operator burden for cryptanalytic strength"),
        ],
        "why": (
            "The British Government Code & Cypher School bought a commercial Enigma G in 1934, took it apart, "
            "and decided they could do better. The result was Typex: five rotors instead of three, no plugboard "
            "(the operational headache that bedeviled German Enigma users), and a typing-and-printing mechanism "
            "instead of Enigma's lampboard. Typex handled the bulk of British and Commonwealth strategic traffic "
            "from 1937 through the mid-1950s. As far as the postwar archives reveal, the Germans never broke it "
            "in service — and Bletchley itself used Typex machines, modified to emulate Enigma, as part of the "
            "Bombe-driven decryption pipeline."
        ),
        "history": (
            "Typex Mark II entered service with the RAF in 1937. By 1939 the Army and Royal Navy had adopted "
            "variants (Mark VI, Mark VIII). Production reached around 12,000 units — far more than SIGABA. "
            "Bletchley Park's TUNNY/Newmanry teams modified Typex machines to function as Enigma simulators "
            "during the closing stages of decryption, so Britain's own Enigma-attacking pipeline depended on its "
            "own Enigma-derived design. Captured German cryptanalytic records (TICOM 1945) suggest the OKW/Chi "
            "studied Typex briefly, decided the analytical effort exceeded the likely return, and never mounted "
            "a serious break attempt — a stark contrast to the German confidence in Enigma's invulnerability."
        ),
        "how": (
            "Five rotors in series. The first three step (with a notch system inherited from Enigma but with "
            "<em>multiple</em> notches per rotor, so the stepping is faster and less predictable than Enigma's "
            "single-notch design). The last two rotors are stators — they can be set but do not advance. There "
            "is no plugboard. Reflector is fixed. The simulation here uses the Enigma core extended with two "
            "additional substitution stages and a multi-notch stepping schedule."
        ),
        "attack_name": "Why It Held",
        "attack_diff": "Complexity: Beyond OKW/Chi's 1940s analytical reach",
        "attack_desc": (
            "Two extra rotors square the search space relative to three-rotor Enigma. The multi-notch stepping "
            "destroys the regular &lsquo;ring-setting at fixed positions' that made the Bombe's menu-elimination "
            "tractable. No plugboard means no plugboard-induced biases — paradoxically the plugboard, designed "
            "to make Enigma stronger, was one of the things that made it breakable, because it constrained "
            "possible configurations in ways the Bombe could test. German analysts in 1942–1944 reportedly "
            "concluded a Typex break would require resources comparable to Britain's Bombe programme — and "
            "Germany never built that infrastructure."
        ),
        "lessons": [
            ("Multi-notch stepping", "Same insight that Hagelin built into the M-209 lugs"),
            ("Fewer features can mean more security", "Removing the plugboard removed an exploitable structural constraint"),
            ("Asymmetric resource investment", "The Bombe required 200+ machines and 10,000 staff; Germany never matched it"),
        ],
        "related": [
            ("enigma", "Enigma", "Direct ancestor; Typex is what happens when an analytic adversary redesigns it"),
            ("sigaba", "SIGABA", "American contemporary; even stronger via pseudorandom stepping"),
            ("m209", "M-209", "Tactical complement"),
            ("lorenz", "Lorenz", "German strategic cipher Typex's contemporaries were attacking"),
        ],
        "prev": ("sigaba", "SIGABA (ECM Mark II)"),
        "next": ("chaocipher", "Chaocipher"),
    },
]

# ─────────────────────────────────────────────────────────────────
# Page template
# ─────────────────────────────────────────────────────────────────
TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — The Cipher Museum</title>
  <meta name="description" content="{meta_desc}">
  <meta property="og:title" content="{title} — The Cipher Museum">
  <meta property="og:description" content="{meta_desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ciphermuseum.com/ciphers/{slug}.html">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{title} — The Cipher Museum">
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
    <ul class="nav-links"></ul>
  </div>
</nav>

<main id="main-content" tabindex="-1">
<div class="page-hero">
  <div class="breadcrumb">
    <a href="../index.html">Entrance</a><span>&rsaquo;</span>
    <a href="../halls/{hall_slug}.html">Hall {hall_num}: {hall_name}</a><span>&rsaquo;</span>
    {title}
  </div>
  <div class="page-meta">
    <span class="badge {era_class}">{era_label}</span>
    <span class="badge {sec_class}">{sec_label}</span>
  </div>
  <h1 class="page-title">{title}</h1>
  <p class="page-tagline">{tagline}</p>
  <div class="exhibit-facts">
{facts_html}
  </div>
</div>

{demo_html}
<div class="exhibit-layout">
  <div class="exhibit-main">

    <div class="cipher-significance">
      <h3>Why This Matters</h3>
      <p>{why}</p>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">📜</span><span class="panel-title">Historical Context</span></div>
      <div class="panel-body"><p>{history}</p></div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">⚙️</span><span class="panel-title">How It Works</span></div>
      <div class="panel-body"><p>{how}</p></div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">💀</span><span class="panel-title">{attack_panel_title}</span></div>
      <div class="panel-body">
        <div class="attack-panel">
          <div class="attack-name">{attack_name}</div>
          <div class="attack-diff">{attack_diff}</div>
          <p class="attack-desc">{attack_desc}</p>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">🔬</span><span class="panel-title">What It Teaches Modern Cryptography</span></div>
      <div class="panel-body">
        <table class="cipher-table">
          <thead><tr><th>Concept from {title}</th><th>Modern Evolution</th></tr></thead>
          <tbody>
{lessons_html}
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
            <tr><td>Era</td><td>{era_label}</td></tr>
            <tr><td>Security</td><td>{sec_label}</td></tr>
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
    <span class="hall-nav-name">{prev_name}</span>
  </a>
  <a href="../ciphers/{next_slug}.html" class="hall-nav-link next">
    <span class="hall-nav-dir">Next &rarr;</span>
    <span class="hall-nav-name">{next_name}</span>
  </a>
</div>

</main>

<footer class="museum-footer"></footer>
<script src="../js/ciphers/all-engines.js"></script>
<script src="../js/demo-loader.js"></script>
<script src="../js/nav.js" defer></script>
<script src="../js/lightbox.js"></script>
</body>
</html>
"""

# ─────────────────────────────────────────────────────────────────
# Render each page
# ─────────────────────────────────────────────────────────────────
def render_facts(facts):
    return "\n".join(
        f'    <div class="fact"><span class="fact-label">{k}</span><span class="fact-value">{v}</span></div>'
        for k, v in facts
    )

def render_quickfacts(facts):
    return "\n".join(
        f"            <tr><td>{k}</td><td>{v}</td></tr>" for k, v in facts
    )

def render_lessons(lessons):
    return "\n".join(
        f"            <tr><td>{a}</td><td>{b}</td></tr>" for a, b in lessons
    )

def render_related(items):
    out = []
    for slug, name, tag in items:
        out.append(
            f'    <a href="../ciphers/{slug}.html" class="related-card">\n'
            f'      <span class="related-card__number">Related</span>\n'
            f'      <span class="related-card__name">{name}</span>\n'
            f'      <span class="related-card__tag">{tag}</span>\n'
            f'    </a>'
        )
    return "\n".join(out)

def make_meta_desc(ex):
    # Build a 140-160 char single-line meta description
    base = f"{ex['title']} ({ex['year_short']}) — {ex['tagline']}"
    base = re.sub(r"\s+", " ", base).strip()
    if len(base) > 160:
        base = base[:157].rstrip() + "..."
    if len(base) < 140:
        # pad with hall info
        extra = f" Hall {ex['hall_num']} of The Cipher Museum."
        if len(base) + len(extra) <= 160:
            base += extra
    return base

for ex in EXHIBITS:
    meta_desc = make_meta_desc(ex)
    demo_html = (
        f'\n<div class="demo-section" data-cipher="{ex["demo_engine"]}"></div>\n'
        if ex["demo_engine"] else ""
    )
    attack_panel_title = "How It Was Broken" if ex["sec_class"] == "sec-broken" else "Why It Has Resisted"
    out = TEMPLATE.format(
        slug=ex["slug"],
        title=ex["title"],
        tagline=ex["tagline"],
        meta_desc=meta_desc,
        era_class=ex["era_class"],
        era_label=ex["era_label"],
        sec_class=ex["sec_class"],
        sec_label=ex["sec_label"],
        hall_num=ex["hall_num"],
        hall_slug=ex["hall_slug"],
        hall_name=ex["hall_name"],
        facts_html=render_facts(ex["facts"]),
        demo_html=demo_html,
        why=ex["why"],
        history=ex["history"],
        how=ex["how"],
        attack_panel_title=attack_panel_title,
        attack_name=ex["attack_name"],
        attack_diff=ex["attack_diff"],
        attack_desc=ex["attack_desc"],
        lessons_html=render_lessons(ex["lessons"]),
        quickfacts_html=render_quickfacts(ex["facts"]),
        related_html=render_related(ex["related"]),
        prev_slug=ex["prev"][0],
        prev_name=ex["prev"][1],
        next_slug=ex["next"][0],
        next_name=ex["next"][1],
    )
    path = ROOT / "ciphers" / f"{ex['slug']}.html"
    path.write_text(out, encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)}  meta-desc {len(meta_desc)} chars")

print("OK — all 6 exhibit pages generated")
