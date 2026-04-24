#!/usr/bin/env python3
"""Round 3 Phase 6 (East Asia & Telegraphy) page generator.

Produces 4 exhibits: Chinese Telegraph Code, Zimmermann Telegram, Slidex,
Commercial Telegraph Codebooks. Mirrors Phase 4/5 builders exactly so that
demo-loader.js, the test suites, the lightbox, and the nav injection all
pick up the new pages automatically.
"""
import os
import sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CIPHERS = os.path.join(REPO, 'ciphers')

PAGES = [
  {
    'slug': 'chinese-telegraph',
    'title': 'Chinese Telegraph Code',
    'subtitle': 'Standard Telegraph Codebook · 1881',
    'meta_desc': "The 1881 Chinese Telegraph Code mapped 7,000+ Chinese characters to 4-digit code groups so they could ride the same Morse-style telegraph network as the Latin alphabet \u2014 and was super-enciphered for diplomatic and military traffic in the 20th century.",
    'hall_href': '../halls/military.html',
    'hall_label': 'Hall VI: Military &amp; Field Cryptography',
    'hall_short': 'Hall VI · Military',
    'page_meta_label': 'Hall VI · Military',
    'era_class': 'era-modern',
    'era_label': 'Late Qing \u2192 PRC · 1881\u20131980s',
    'sec_class': 'sec-broken',
    'sec_label': 'Public codebook (super-enciphered when secret)',
    'tagline': 'Seven thousand Chinese characters, four digits each \u2014 the codebook that put Chinese onto the global telegraph and onto every signals analyst\u2019s desk.',
    'facts': [
      ('Origin', 'Septime Auguste Viguier, French harbour-master, Shanghai'),
      ('Year', 'First codebook 1871; standard edition 1881'),
      ('Mapping', '4-digit code group per Chinese character (~10,000 entries)'),
      ('Use', 'Civil telegraphy publicly; diplomatic / military traffic super-enciphered'),
      ('Status', 'Still used today as a transliteration index for legal names'),
    ],
    'panels': [
      ('\U0001f4dc', 'Historical Context',
       "<p>By the 1860s telegraphy was knitting the world together \u2014 except for the Chinese-speaking world, whose script could not be sent over a wire designed for Latin letters. In 1871 Septime Auguste Viguier, a French harbour-master in Shanghai, published the first systematic telegraph code for Chinese: every character received a unique 4-digit number. The 1881 standard edition by Zheng Guanying expanded it to over 7,000 characters and became the basis for every Chinese telegraph code that followed.</p>"
       "<p style=\"margin-top:1rem;\">The codebook is still in active use today. Hong Kong identity cards, mainland Chinese passports, and Taiwanese name registrations all carry the four-digit Chinese Commercial Code (CCC) number for each character in the holder\u2019s name \u2014 a direct, unbroken descent from the Viguier code of 1871.</p>"),
      ('\u2699\ufe0f', 'How It Works',
       "<p>The codebook is a giant lookup table. Each Chinese character maps to a fixed 4-digit number (0001\u20139999); the operator transmits the digits as Morse code. The receiver looks up each 4-digit group in their copy of the same codebook and recovers the character.</p>"
       "<p style=\"margin-top:1rem;\">For confidentiality, codebook digits were <strong>super-enciphered</strong> by an additive: a numeric key (often supplied by a daily one-time pad page) was added to each code group modulo 10,000, then transmitted. The recipient subtracted the same additive before consulting the codebook. This is the architecture later adopted by the Japanese Navy in JN-25 and many other 20th-century military codebooks.</p>"
       "<p style=\"margin-top:1rem;\">The demo above operates over the Latin alphabet to keep the round-trip transparent: each A\u2013Z letter receives one of 26 stable 4-digit codes, and the additive key is your numeric input.</p>"),
      ('\U0001f480', 'How It Was (and Was Not) Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Public codebook \u2192 trivial without superencipherment</div><div class=\"attack-diff\">Complexity: Lookup only</div><p class=\"attack-desc\">Civil traffic used the published codebook with no additive. Anyone with a copy could read the messages \u2014 the codebook was a transmission convenience, not a cipher.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">With additive: depth attack</div><div class=\"attack-diff\">Complexity: Same as JN-25 \u2014 hard, but reduces to additive recovery</div><p class=\"attack-desc\">When two messages were sent with overlapping additives, the difference of ciphertexts equalled the difference of underlying codegroups. Frequency analysis of common characters (the, of, to-style fillers in Chinese) recovered the additive. This is precisely the technique Rochefort\u2019s team used against JN-25.</p></div>"),
      ('\U0001f52c', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>CTC lesson</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>Codebook + additive = the workhorse military system of the 20th c.</td><td>Block cipher + nonce-based mode is the same architecture (lookup + masking)</td></tr>"
       "<tr><td>Codebook ID numbers persist in identity systems</td><td>Unicode codepoints are the same idea, with cryptographic neutrality</td></tr>"
       "<tr><td>Adapting a script to a hostile transport</td><td>Punycode / IDN encoding for non-ASCII domain names</td></tr>"
       "<tr><td>Once the additive repeats, the system collapses</td><td>Why nonces must never repeat (AES-GCM, ChaCha20-Poly1305)</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('jn-25', 'JN-25', 'Japanese Navy code that used the same codebook+additive architecture'),
      ('zimmermann', 'Zimmermann Telegram', 'German diplomatic codebook 0075/13040 \u2014 same family'),
      ('commercial-codebooks', 'Commercial Codebooks', 'Civilian telegraph codebooks for cost reduction'),
    ],
    'prev': ('redType-a', 'Red (Type A)'),
    'next': ('zimmermann', 'Zimmermann Telegram'),
  },
  {
    'slug': 'zimmermann',
    'title': 'Zimmermann Telegram',
    'subtitle': 'German codes 0075 / 13040 · 1917',
    'meta_desc': "The decoded German telegram of January 1917 that brought the United States into WWI. A two-stage codebook cipher (0075 then 13040), broken by Britain\u2019s Room 40 and surfaced through one of history\u2019s most consequential intelligence operations.",
    'hall_href': '../halls/military.html',
    'hall_label': 'Hall VI: Military &amp; Field Cryptography',
    'hall_short': 'Hall VI · Military',
    'page_meta_label': 'Hall VI · Military',
    'era_class': 'era-wwi',
    'era_label': 'WWI · January 1917',
    'sec_class': 'sec-broken',
    'sec_label': 'Broken (Room 40)',
    'tagline': 'A diplomatic codebook cipher, cracked in Room 40, that pulled the United States into the First World War.',
    'facts': [
      ('Origin', 'German Foreign Office (Arthur Zimmermann, State Secretary)'),
      ('Sent', '16 January 1917'),
      ('Codes', 'Outer: 0075 (super-enciphered diplomatic code); inner: 13040 (transmission code)'),
      ('Broken by', 'Nigel de Grey &amp; Reverend William Montgomery, Room 40, January 1917'),
      ('Outcome', 'US declares war on Germany, 6 April 1917'),
    ],
    'panels': [
      ('\U0001f4dc', 'Historical Context',
       "<p>On 16 January 1917 Foreign Secretary Arthur Zimmermann sent the German ambassador in Washington a telegram instructing him, in the event of US entry into the war, to propose to Mexico an alliance against the United States with the promise of help recovering Texas, New Mexico, and Arizona. The cable was relayed via Stockholm and Buenos Aires using cables the British had cut and re-routed through London \u2014 every word passed through Room 40 of the Admiralty before reaching its destination.</p>"
       "<p style=\"margin-top:1rem;\">Two cryptanalysts, Nigel de Grey and the Reverend William Montgomery, partially decoded the telegram within hours. Britain then faced a delicate problem: revealing the contents would also reveal that they were reading German diplomatic traffic, and the Americans might suspect a forgery. The solution was a months-long deception that ended with a copy of the cable being \u201cstolen\u201d from a Mexican post office. The telegram\u2019s publication on 1 March 1917 swung American opinion decisively toward war.</p>"),
      ('\u2699\ufe0f', 'How It Works',
       "<p>The Zimmermann Telegram was protected by the German diplomatic code <strong>0075</strong>: a two-part codebook in which common words and phrases mapped to 4- and 5-digit code groups, and the resulting digit string was super-enciphered by an additive key. By January 1917 the British had recovered enough of 0075 from intercepts and a captured codebook (Magdeburg, 1914) to read most of it.</p>"
       "<p style=\"margin-top:1rem;\">Because Washington could not receive 0075, the cable was forwarded by the German Embassy from Washington to Mexico City re-encoded in the older diplomatic code <strong>13040</strong>, which the British had also broken. The retransmission was a critical operational error: it gave Room 40 a parallel text in two ciphers and let them attribute the leak to Mexican rather than British sources.</p>"
       "<p style=\"margin-top:1rem;\">The demo above is a faithful but simplified codebook engine: each input word is encoded as a 5-digit group via a fixed 140-word codebook, with super-enciphered additive applied to every group. Words not in the codebook fall through to a per-letter mode marked by sentinel groups \u2014 mirroring how operators handled proper nouns and place names.</p>"),
      ('\U0001f480', 'How It Was Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Codebook recovery from depth (1914\u20131917)</div><div class=\"attack-diff\">Complexity: Years of patient analysis</div><p class=\"attack-desc\">Room 40 had been collecting German diplomatic traffic since 1914. Repeated codegroup contexts, captured codebooks (notably the SKM and HVB books from sunk warships), and stylised diplomatic boilerplate let analysts gradually map most of the 0075 and 13040 codebooks before the Zimmermann cable arrived.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Hall\u2019s deception operation</div><div class=\"attack-diff\">Complexity: Statecraft, not cryptanalysis</div><p class=\"attack-desc\">Admiral Sir William \u201cBlinker\u201d Hall, head of Room 40, used a British agent in Mexico to obtain a copy of the cable from a commercial telegraph office in Mexico City \u2014 an entirely real document that allowed the British to share the plaintext with the Americans without revealing they had been reading German cable traffic since 1914.</p></div>"),
      ('\U0001f52c', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>Zimmermann lesson</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>Re-encoding the same plaintext in two systems leaks both</td><td>Same key, two protocols \u2192 cross-protocol attacks (DROWN, ALPACA)</td></tr>"
       "<tr><td>Operationally, intercepts depend on owning the wires</td><td>BGP hijack, undersea cable taps, lawful intercept architectures</td></tr>"
       "<tr><td>The hardest problem is using the intelligence without burning the source</td><td>The Bletchley \u201cULTRA\u201d disclosure problem; modern source protection in SIGINT</td></tr>"
       "<tr><td>Diplomatic codebooks are huge symmetric secrets distributed by hand</td><td>Why public-key cryptography was a generational leap forward</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('chinese-telegraph', 'Chinese Telegraph Code', 'Same codebook+additive family, civilian roots'),
      ('great-cipher', 'Great Cipher', 'Earlier diplomatic codebook (Louis XIV)'),
      ('jn-25', 'JN-25', 'WWII descendant of the same architecture'),
    ],
    'prev': ('chinese-telegraph', 'Chinese Telegraph Code'),
    'next': ('slidex', 'Slidex'),
  },
  {
    'slug': 'slidex',
    'title': 'Slidex',
    'subtitle': 'British WWII tactical bigram cipher card',
    'meta_desc': "Slidex was the British / Allied tactical paper-and-card cipher of WWII. A printed grid plus a sliding strip turned 2-letter bigrams into other bigrams. Quick at the platoon level, weak at scale \u2014 traffic analysis exploited it routinely.",
    'hall_href': '../halls/military.html',
    'hall_label': 'Hall VI: Military &amp; Field Cryptography',
    'hall_short': 'Hall VI · Military',
    'page_meta_label': 'Hall VI · Military',
    'era_class': 'era-wwii',
    'era_label': 'WWII · 1943\u20131945',
    'sec_class': 'sec-broken',
    'sec_label': 'Tactical (intentionally weak)',
    'tagline': 'A piece of paper, a sliding strip, and a daily key card \u2014 the cipher that secured British platoon traffic from Normandy to Burma.',
    'facts': [
      ('Origin', 'Royal Signals, United Kingdom'),
      ('Year', 'In service 1943 \u2013 late 1950s'),
      ('Mechanism', 'Bigram substitution from a printed grid + sliding strip'),
      ('Use', 'Tactical voice and morse traffic; never strategic'),
      ('Successor', 'BATCO (Battle Code) from late 1950s'),
    ],
    'panels': [
      ('\U0001f4dc', 'Historical Context',
       "<p>Slidex was the British answer to a problem every WWII army faced: how do you encrypt platoon-level radio traffic without giving every signaller a fragile machine? The answer was a small printed card with a movable strip. The cipher was deliberately weak \u2014 it would not stop a serious cryptanalyst given a few days of traffic \u2014 but it was robust against an opponent who needed the message <em>now</em>, in the next 30 minutes, before the gunfire moved.</p>"
       "<p style=\"margin-top:1rem;\">It was issued from 1943 onwards across the British and Commonwealth armies and saw heavy use in Normandy, Italy, and the Far East. The Germans broke it routinely; the Japanese had less success, but tactical traffic is by its nature obsolete within hours.</p>"),
      ('\u2699\ufe0f', 'How It Works',
       "<p>Each Slidex card carries a 17\u00d717 grid (or 12\u00d712 in some issues). The rows and columns are headed by mixed alphabets that change daily. Inside each cell is a printed bigram (e.g. \u201cBT\u201d, \u201cQM\u201d) drawn from a pool of 289 distinct two-letter combinations. To encrypt:</p>"
       "<ol style=\"margin:0.5rem 0 0 1.5rem;line-height:1.8;\">"
       "<li>Find your plaintext bigram by locating its two letters as the row label and column label.</li>"
       "<li>Read off the cipher bigram printed in that cell.</li>"
       "</ol>"
       "<p style=\"margin-top:1rem;\">A sliding paper strip lets the operator change the row alphabet rapidly, giving a polyalphabetic flavour to long messages. Decryption reverses the lookup.</p>"
       "<p style=\"margin-top:1rem;\">The demo above builds a deterministic 26\u00d726 Slidex card from your seed and substitutes plaintext bigrams accordingly. Odd-length messages are padded with X (the standard Slidex convention).</p>"),
      ('\U0001f480', 'How It Was Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Bigram frequency analysis</div><div class=\"attack-diff\">Complexity: Routine \u2014 days of traffic suffice</div><p class=\"attack-desc\">A bigram cipher with a fixed daily card is essentially a monoalphabetic substitution on the 676-symbol bigram alphabet. The bigrams TH, HE, IN, ER are extremely common in English; identifying just the top few collapses the cipher quickly. German Y-Service units routinely read tactical Slidex within hours of intercept.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Stereotyped tactical traffic</div><div class=\"attack-diff\">Complexity: Trivial when message templates are predictable</div><p class=\"attack-desc\">\u201cWilco out\u201d, \u201croger over\u201d, position reports with grid references, fixed call-signs \u2014 tactical traffic is full of cribs. Slidex relied on the message being obsolete by the time the cipher was broken, not on resisting analysis.</p></div>"),
      ('\U0001f52c', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>Slidex lesson</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>Cryptographic strength is a function of how long the secret matters</td><td>Modern \u201cforward secrecy\u201d \u2014 yesterday\u2019s key shouldn\u2019t decrypt tomorrow\u2019s traffic</td></tr>"
       "<tr><td>Tactical cipher \u2260 strategic cipher</td><td>Different threat models for ephemeral vs long-lived data</td></tr>"
       "<tr><td>Paper crypto for non-specialist users</td><td>Modern \u201cone-glance\u201d safety: emoji codes, SAS pairing, QR-key exchange</td></tr>"
       "<tr><td>Stereotyped templates leak structure</td><td>Why protocol designers obsess over removing predictable headers (HTTP/2 HPACK)</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('m-94', 'M-94 / CSP-488', 'American tactical cipher of the same era'),
      ('m209', 'M-209', 'Pin-and-lug tactical cipher (US, mid-WWII)'),
      ('playfair', 'Playfair', 'The original 19th-c. bigram cipher Slidex descends from'),
    ],
    'prev': ('zimmermann', 'Zimmermann Telegram'),
    'next': ('commercial-codebooks', 'Commercial Codebooks'),
  },
  {
    'slug': 'commercial-codebooks',
    'title': 'Commercial Telegraph Codebooks',
    'subtitle': 'ABC, Bentley\u2019s, Lieber\u2019s · 1870s\u20131930s',
    'meta_desc': "Commercial telegraph codebooks (ABC Code, Bentley\u2019s, Lieber\u2019s) were the workhorses of Victorian and Edwardian global business. Each English word or phrase mapped to a 5-letter pronounceable codeword \u2014 cheaper, denser, and incidentally a layer of confidentiality.",
    'hall_href': '../halls/military.html',
    'hall_label': 'Hall VI: Military &amp; Field Cryptography',
    'hall_short': 'Hall VI · Military',
    'page_meta_label': 'Hall VI · Military',
    'era_class': 'era-modern',
    'era_label': 'Victorian \u2192 inter-war · 1870s\u20131930s',
    'sec_class': 'sec-broken',
    'sec_label': 'Public codebooks (compression, not secrecy)',
    'tagline': 'Five letters of nonsense that meant \u201cship the cargo via Suez and reply with prices in pounds sterling\u201d. The compression layer of the Victorian internet.',
    'facts': [
      ('Notable codebooks', 'ABC Code (1879), Bentley\u2019s (1906), Lieber\u2019s, Western Union'),
      ('Codeword format', '5-letter pronounceable groups (CVCVC)'),
      ('Charged as', 'One word per codeword by international telegraph tariff'),
      ('Use', 'Civilian commerce, shipping, banking, and insurance'),
      ('Status', 'Mostly public; private codebooks added a confidentiality layer'),
    ],
    'panels': [
      ('\U0001f4dc', 'Historical Context',
       "<p>By the late 19th century, transatlantic cable charges ran to several shillings per word. A long business message could cost more than the goods it described. The solution was the commercial codebook: a printed dictionary in which each common English phrase mapped to a single 5-letter codeword. \u201cCONFIRMED SHIPMENT URGENT\u201d became one billable word, not three.</p>"
       "<p style=\"margin-top:1rem;\">By 1900 dozens of competing codebooks existed. The ABC Code (Clausen-Thue, 1879), Bentley\u2019s Complete Phrase Code (1906), and Lieber\u2019s were the most popular. International telegraph regulations specifically permitted these <em>artificial</em> 5-letter codewords as long as they were pronounceable \u2014 hence the consonant-vowel-consonant-vowel-consonant (CVCVC) pattern that became standard.</p>"
       "<p style=\"margin-top:1rem;\">Private codebooks added a second layer: a firm could rebind a public codebook with shifted entries, or print its own \u201cprivate code\u201d known only to its branches. This was the closest thing to civilian commercial cryptography in widespread use before the 1970s.</p>"),
      ('\u2699\ufe0f', 'How It Works',
       "<p>Each codebook is essentially two parallel sorted lists:</p>"
       "<ul style=\"margin:0.5rem 0 0 1.5rem;line-height:1.8;\">"
       "<li>A <strong>plain index</strong> listing every English word or phrase the codebook covers, in alphabetical order, each beside its codeword.</li>"
       "<li>A <strong>code index</strong> listing every codeword in alphabetical order, each beside its plaintext.</li>"
       "</ul>"
       "<p style=\"margin-top:1rem;\">The CVCVC structure (e.g. <code>BAFEK</code>, <code>QILUP</code>) gave 200,000 possible codewords per book \u2014 enough for thousands of phrases plus inflections and proper-name placeholders. Codebooks were rated by their <em>checking distance</em>: how many letters had to differ between any two valid codewords, so that single-character telegraph errors would not turn one valid message into another.</p>"
       "<p style=\"margin-top:1rem;\">The demo above operates on a small fixed wordlist using exactly the CVCVC encoding scheme. Words not in the wordlist fall through to a per-letter codebook so the round-trip stays clean for arbitrary input.</p>"),
      ('\U0001f480', 'Where the Confidentiality Came From (and Where It Failed)',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Public codebooks: no confidentiality at all</div><div class=\"attack-diff\">Complexity: Lookup</div><p class=\"attack-desc\">Anyone with a copy of ABC or Bentley\u2019s could read public-codebook traffic. Their job was compression and error-checking, not secrecy.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Private codebooks: tractable for state actors</div><div class=\"attack-diff\">Complexity: Within reach of professional cryptanalytic bureaus</div><p class=\"attack-desc\">A private codebook is a monoalphabetic substitution on the phrase alphabet \u2014 enormous in size, but stable. With enough intercepted traffic and known business context (shipping schedules, commodity prices, named correspondents), professional bureaus reconstructed the codebooks. Yardley\u2019s American Black Chamber and the British GC&amp;CS routinely read private commercial codes between the wars.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Codebook + super-encipherment</div><div class=\"attack-diff\">Complexity: Same as JN-25 / 0075-class systems</div><p class=\"attack-desc\">Banks and shipping firms in the 1920s sometimes added a second-layer additive cipher to a private codebook \u2014 essentially the architecture of contemporary military codes. The same depth-attack techniques that worked on JN-25 worked here.</p></div>"),
      ('\U0001f52c', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>Codebook lesson</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>Compression layer that incidentally also encrypts</td><td>HTTP/2 HPACK and QPACK \u2014 compression that leaks plaintext via timing (CRIME, BREACH)</td></tr>"
       "<tr><td>Pronounceable codewords for telegram tariffs</td><td>BIP-39 mnemonic seed words for Bitcoin wallets</td></tr>"
       "<tr><td>Checking distance between codewords</td><td>Hamming distance in modern error-correcting codes</td></tr>"
       "<tr><td>Private codebook = monoalphabetic on the phrase alphabet</td><td>Why \u201ccustom secret protocol\u201d almost always loses to standard public protocols</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('chinese-telegraph', 'Chinese Telegraph Code', 'The contemporary Chinese 4-digit codebook'),
      ('zimmermann', 'Zimmermann Telegram', 'How the diplomatic equivalent of these codebooks worked'),
      ('great-cipher', 'Great Cipher', 'The ancestor of the codebook tradition (Louis XIV)'),
    ],
    'prev': ('slidex', 'Slidex'),
    'next': ('vigenere', 'Vigen\u00e8re Cipher'),
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
