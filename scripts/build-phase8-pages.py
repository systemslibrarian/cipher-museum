#!/usr/bin/env python3
"""Build Phase 8 -- global underground traditions exhibit pages."""
import os, textwrap

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(REPO, 'ciphers')

def page(slug, title, og_desc, hall_path, hall_label, era_badge, sec_badge,
         eyebrow, tagline, facts, demo_section, significance,
         panels, related, prev_s, prev_n, next_s, next_n):
    """Render a full exhibit HTML page."""
    facts_html = ''.join(
        f'    <div class="fact"><span class="fact-label">{k}</span>'
        f'<span class="fact-value">{v}</span></div>\n'
        for k,v in facts)
    panels_html = ''.join(
        f'''    <div class="panel">
      <div class="panel-head"><span class="panel-icon">{ico}</span>'
      f'<span class="panel-title">{t}</span></div>
      <div class="panel-body">{body}</div>
    </div>\n'''
        for ico,t,body in panels)
    related_html = ''.join(
        f'''    <a href="../ciphers/{rs}" class="related-card">
      <span class="related-card__number">Related</span>
      <span class="related-card__name">{rn}</span>
      <span class="related-card__tag">{rt}</span>
    </a>\n'''
        for rs,rn,rt in related)
    prev_html = (f'  <a href="../ciphers/{prev_s}.html" class="hall-nav-link">'
                 f'<span class="hall-nav-dir">&larr; Previous</span>'
                 f'<span class="hall-nav-name">{prev_n}</span></a>') if prev_s else ''
    next_html = (f'  <a href="../ciphers/{next_s}.html" class="hall-nav-link next">'
                 f'<span class="hall-nav-dir">Next &rarr;</span>'
                 f'<span class="hall-nav-name">{next_n}</span></a>') if next_s else ''
    # Quick facts sidebar from facts list
    qf_rows = ''.join(f'<tr><td>{k}</td><td>{v}</td></tr>' for k,v in facts)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — The Cipher Museum</title>
  <meta name="description" content="{og_desc}">
  <meta property="og:title" content="{title} — The Cipher Museum">
  <meta property="og:description" content="{og_desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ciphermuseum.com/ciphers/{slug}.html">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{title} — The Cipher Museum">
  <meta name="twitter:description" content="{og_desc}">
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
    <a href="../{hall_path}">{hall_label}</a><span>&rsaquo;</span>
    {title}
  </div>
  <div class="page-meta">
    <span class="page-num">{eyebrow}</span>
    <span class="badge era-ancient">{era_badge}</span>
    <span class="badge sec-broken">{sec_badge}</span>
  </div>
  <h1 class="page-title">{title}</h1>
  <p class="page-tagline">{tagline}</p>
  <div class="exhibit-facts">
{facts_html}  </div>
</div>
{demo_section}
<div class="exhibit-layout">
  <div class="exhibit-main">
    <div class="cipher-significance">
      <h3>Why This Matters</h3>
      <p>{significance}</p>
    </div>
{panels_html}  </div>
  <div class="exhibit-side">
    <div class="panel" style="border-color:var(--gold-b);">
      <div class="panel-head" style="background:var(--gold-glow);border-color:var(--gold-b);">
        <span class="panel-icon">&#9876;</span><span class="panel-title" style="color:var(--gold);">Quick Facts</span>
      </div>
      <div class="panel-body">
        <table class="cipher-table"><tbody>{qf_rows}</tbody></table>
      </div>
    </div>
  </div>
</div>
<section class="related-exhibits">
  <h2 class="related-exhibits__heading">Related Exhibits</h2>
  <div class="related-exhibits__grid">
{related_html}  </div>
</section>
<div class="hall-nav">
{prev_html}
{next_html}
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
        <li><a href="../{hall_path}">{hall_label}</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span class="footer-copy">&copy; The Cipher Museum &middot; MIT License</span>
    <span class="footer-copy">{eyebrow}</span>
  </div>
</footer>
<script src="../js/ciphers/all-engines.js"></script>
<script src="../js/demo-loader.js"></script>
<script src="../js/nav.js" defer></script>
<script src="../js/lightbox.js"></script>
</body>
</html>"""


FIELD_HOLLERS_DEMO = """<div class="demo-section-hand" style="border:1px solid var(--gold-b);border-radius:8px;padding:1.5rem;margin:2rem 0;background:var(--s1);">
  <h3 style="color:var(--gold);margin-top:0;">&#127911; Rhythm-Code Translator</h3>
  <p style="font-size:.9rem;color:var(--fg-dim);margin-bottom:1rem;">Field hollers used rhythmic syllable patterns. Enter a message and see how it maps to a simple stress-beat code (long STRESS / short unstressed).</p>
  <div style="display:flex;gap:.75rem;flex-wrap:wrap;align-items:flex-end;margin-bottom:1rem;">
    <div style="flex:1;min-width:200px;">
      <label for="hollerInput" style="display:block;font-size:.8rem;color:var(--fg-dim);margin-bottom:.3rem;">Plain message</label>
      <input id="hollerInput" type="text" value="MEET AT THE OLD OAK" style="width:100%;padding:.5rem .75rem;background:var(--s2);border:1px solid var(--b1);border-radius:4px;color:var(--fg);font-family:var(--fm);">
    </div>
    <button onclick="runHollerCode()" style="padding:.5rem 1.25rem;background:var(--gold);color:#000;border:none;border-radius:4px;cursor:pointer;font-weight:700;">Encode</button>
  </div>
  <div id="hollerOutput" style="font-family:var(--fm);font-size:1.1rem;color:var(--gold-lt);letter-spacing:.15em;min-height:2rem;"></div>
  <script>
    function runHollerCode() {
      const msg = document.getElementById('hollerInput').value.toUpperCase().replace(/[^A-Z ]/g,'');
      const out = msg.split('').map(c => {
        if (c === ' ') return ' | ';
        const v = 'AEIOU'.includes(c);
        return c + (v ? '\u25cf' : '\u25e6');
      }).join(' ');
      document.getElementById('hollerOutput').textContent = out;
    }
  </script>
</div>"""


PAGES = [
    dict(
        slug='diana-cryptosystem',
        title='Diana Cryptosystem',
        og_desc='The US Army Special Forces one-time pad field system (1960s–1990s) — trigraph-based OTP cards issued to Green Berets in Vietnam.',
        hall_path='halls/military.html',
        hall_label='Hall V: Military &amp; Spy Ciphers',
        era_badge='Cold War · 1960s–1990s',
        sec_badge='Unbroken (correct use)',
        eyebrow='Hall V · Military Ciphers',
        tagline='The US Army Special Forces trigraph one-time pad system, used from the Vietnam War through the Gulf War.',
        facts=[
            ('Origin','US Army Special Forces / NSA'),
            ('Era','~1960–1995'),
            ('Family','One-Time Pad (trigraphic variant)'),
            ('Key Material','Printed pad cards, 13 trigraph columns'),
            ('Security','Theoretically unbreakable if pad not reused'),
            ('Modern Lesson','Correct OTP use is unbreakable; logistics often fail before the math'),
        ],
        demo_section='<div class="demo-section" data-cipher="diana-cryptosystem"></div>',
        significance='The Diana Cryptosystem is the US Army Special Forces implementation of the one-time pad, designed for field use under combat conditions. Issued to Green Berets operating in Vietnam, Laos, and Cambodia, the system used small printed cards with 13 columns of random trigraphs. Messages were encoded letter-by-letter by finding the plaintext letter in a columnar index and substituting the corresponding trigraph. The pad was physically destroyed after use. When used correctly, the system is mathematically unbreakable — and NSA declassified the training materials decades later, since no key material survived.',
        panels=[
            ('📜','Historical Context','<p>The Vietnam-era Diana system was a practical refinement of the XOR-based stream cipher concept that underpins all one-time pads. US Special Forces operating in denied territory needed a cipher light enough to destroy quickly under ambush conditions. Printed 4×3-inch card stock replaced bulky teletype key tape. The trigraph format (three-letter blocks) simplified field use and reduced single-character error propagation.</p>'),
            ('⚙️','How It Works','<p>Each Diana card contains 13 columns of random uppercase trigraphs printed in a grid. To encode a letter, the sender locates the plaintext letter in the left-side alphabet index, reads across to the designated column for that message, and records the trigraph. Decoding reverses the lookup. Since each trigraph is used only once and is chosen from a truly random source, no statistical attack can recover the key.</p>'),
            ('💀','Why Pads Fail in Practice','<div class="attack-panel"><div class="attack-name">Pad reuse / loss / capture</div><div class="attack-diff">Complexity: Trivial once key material is compromised</div><p class="attack-desc">The fatal weakness of all OTP systems is logistical, not mathematical. If a pad card is captured, reused, or reproduced without secure randomness, the system collapses immediately. The Soviet VENONA failure stemmed from key reuse under wartime production pressure. Diana training manuals emphasize card destruction above all other security procedures.</p></div>'),
            ('🔬','Relationship to Modern Crypto','<p>The Diana system demonstrates the same security proof as unconditional secrecy: Shannon\'s 1949 theorem shows that a truly random key used only once produces a ciphertext with no information-theoretic correlation to plaintext. AES, TLS, and every modern symmetric cipher sacrifice this absolute guarantee in exchange for the practicality of small, reusable keys.</p>'),
        ],
        related=[
            ('one-time-pad.html','One-Time Pad','The mathematical foundation'),
            ('solitaire.html','Solitaire / Pontifex','Literary descendant — designed for field use'),
            ('vic.html','VIC Cipher','Soviet field-grade straddling-checkerboard system'),
        ],
        prev_s='vic', prev_n='VIC Cipher',
        next_s='che-guevara', next_n="Che Guevara's VIC Variant",
    ),
    dict(
        slug='che-guevara',
        title="Che Guevara's VIC Variant",
        og_desc="Ernesto 'Che' Guevara used a modified VIC straddling-checkerboard cipher for guerrilla communications in Bolivia and the Congo, 1956–1967.",
        hall_path='halls/military.html',
        hall_label='Hall V: Military &amp; Spy Ciphers',
        era_badge='Cold War · 1956–1967',
        sec_badge='Broken (capture of materials)',
        eyebrow='Hall V · Military Ciphers',
        tagline="A Soviet-trained VIC cipher variant adapted by Guevara's guerrilla cells — broken when his diary and codebooks were captured in Bolivia.",
        facts=[
            ('User','Ernesto "Che" Guevara'),
            ('Era','1956–1967'),
            ('Family','Straddling Checkerboard / VIC'),
            ('Key Type','Personal key phrase + numeric ladder'),
            ('Broken By','Bolivian Army capture (1967)'),
            ('Modern Lesson','Physical security of key material is the hardest problem'),
        ],
        demo_section='<div class="demo-section" data-cipher="che-vic"></div>',
        significance="Che Guevara received KGB cryptographic training during his 1950s Moscow visits and used a simplified VIC-family straddling checkerboard for communications between guerrilla cells in Cuba, the Congo, and Bolivia. The system was sophisticated enough that radio intercepts alone would not have broken it — it was the physical capture of his Bolivian campaign diary, codebooks, and cipher pads after his death in October 1967 that exposed the full communications network to CIA and Bolivian intelligence.",
        panels=[
            ('📜','Historical Context','<p>The VIC cipher was the Soviet intelligence service\'s premier hand cipher of the Cold War era. Adapted from the straddling checkerboard, it combined a numeric key ladder with fractionation to produce high-density encipherment resistant to standard frequency analysis. The KGB trained foreign revolutionary contacts in simplified versions. Guevara\'s version traded some complexity for field usability by small, poorly supplied cells operating without radio operators.</p>'),
            ('⚙️','How the Straddling Checkerboard Works','<p>The checkerboard places the most common letters in a single-digit row and less common letters in two-digit rows, creating a variable-length encoding that defeats simple frequency tables. A short key phrase determines row assignment. Numeric addition from a key number chain then scrambles the resulting digits. The full VIC adds further transposition passes and a "chain addition" key expansion.</p>'),
            ('💀','How It Was Broken','<div class="attack-panel"><div class="attack-name">Physical capture</div><div class="attack-diff">Complexity: Trivial with materials in hand</div><p class="attack-desc">On October 9, 1967, Bolivian Rangers captured and executed Guevara at La Higuera. His rucksack contained his personal diary (the "Bolivian Diary"), cipher keys, contact lists, and pad material for upcoming operations. The CIA station in La Paz transmitted the materials to Langley within 24 hours. No cryptanalytic attack was needed.</p></div>'),
        ],
        related=[
            ('vic.html','VIC Cipher','The Soviet original'),
            ('straddling-checkerboard.html','Straddling Checkerboard','Core mechanism'),
            ('diana-cryptosystem.html','Diana Cryptosystem','US equivalent'),
        ],
        prev_s='diana-cryptosystem', prev_n='Diana Cryptosystem',
        next_s='ira-book-cipher', next_n='IRA Book Cipher',
    ),
    dict(
        slug='ira-book-cipher',
        title='IRA Book Cipher',
        og_desc='The Provisional IRA used book ciphers for encrypted communications between active service units and the Army Council — decoded when the FBI seized key material.',
        hall_path='halls/military.html',
        hall_label='Hall V: Military &amp; Spy Ciphers',
        era_badge='Modern · 1970s–1990s',
        sec_badge='Broken (library edition seized)',
        eyebrow='Hall V · Military Ciphers',
        tagline='Running-key cipher using standard paperback novels — communications security for a clandestine insurgency operating across two jurisdictions.',
        facts=[
            ('User','Provisional IRA cells'),
            ('Era','~1972–1998'),
            ('Family','Book Cipher / Running Key'),
            ('Key Material','Agreed paperback editions (page.line.word format)'),
            ('Broken By','FBI and Garda Síochána key-material seizures'),
            ('Modern Lesson','The security of a cipher is only as strong as the secrecy of its key distribution'),
        ],
        demo_section='<div class="demo-section" data-cipher="ira-book-cipher"></div>',
        significance="The Provisional IRA Communications Officer trained active service units to use a book-cipher variant for sensitive operational messages sent between cells in Northern Ireland and the republic. The system required only a standard paperback novel available in any newsagent — both parties agreed on the title, edition, and printing. Messages were encoded as page-line-word triples. British and Irish intercepts had the ciphertext; the FBI cracked the system after a liaison seizure in Boston identified the specific edition in use, demonstrating that the entire security of the book cipher rests on keeping the specific edition secret.",
        panels=[
            ('📜','Historical Context','<p>During the 1970s–1990s, PIRA operated an encrypted communications network spanning Northern Ireland, the Republic, the United States, and continental Europe. British GCHQ routinely intercepted physical mail and radio; PIRA countered with couriers, dead drops, and book ciphers that required no equipment beyond a paperback. The system was known to counterintelligence but could not be broken without knowing the edition.</p>'),
            ('⚙️','How the Book Cipher Worked','<p>Sender and recipient each carry a copy of the <em>same edition</em> of an agreed novel. Each plaintext word is represented as a triple (page number, line number, word position). Because the key — the book\'s text — is effectively unlimited length and changes continuously across the pages, standard frequency analysis fails. The security relies entirely on the secrecy of which specific edition is in use.</p>'),
            ('💀','How It Was Broken','<div class="attack-panel"><div class="attack-name">Physical identification of the key text</div><div class="attack-diff">Complexity: Trivial once edition identified</div><p class="attack-desc">FBI counterterrorism assets in Boston\'s Irish-American community identified book titles used by the PIRA support network. Once British and Irish intelligence confirmed the specific paperback editions (including print run and pagination), all intercepted ciphertexts from that key period could be decoded retroactively. The ciphertexts themselves were unbreakable — the key distribution was not.</p></div>'),
        ],
        related=[
            ('book-cipher.html','Book Cipher','General technique'),
            ('running-key.html','Running Key Cipher','Mathematical near-equivalent'),
            ('beale.html','Beale Ciphers','Famous unsolved book cipher'),
        ],
        prev_s='che-guevara', prev_n="Che Guevara's VIC Variant",
        next_s='red-army-faction', next_n='Red Army Faction OTP',
    ),
    dict(
        slug='red-army-faction',
        title='Red Army Faction One-Time Pad',
        og_desc='The West German Red Army Faction (RAF/Baader-Meinhof) used KGB-supplied one-time pads for communications — materials discovered in 1993 after German reunification archive access.',
        hall_path='halls/military.html',
        hall_label='Hall V: Military &amp; Spy Ciphers',
        era_badge='Cold War · 1970–1998',
        sec_badge='Unbroken (pads not recovered)',
        eyebrow='Hall V · Military Ciphers',
        tagline='KGB-supplied cryptographic material used by the West German urban guerrilla network — how the Stasi became the perfect clandestine infrastructure provider.',
        facts=[
            ('Organization','Red Army Faction (RAF), West Germany'),
            ('Era','1970–1998'),
            ('Supply Chain','East German Stasi / KGB'),
            ('Cipher','One-Time Pad (Soviet standard field format)'),
            ('Status','Communications evidence, no pads recovered'),
            ('Modern Lesson','State sponsor infrastructure dramatically elevates non-state actor crypto capabilities'),
        ],
        demo_section='<div class="demo-section" data-cipher="raf-otp"></div>',
        significance='The Red Army Faction (founded 1970 by Andreas Baader and Ulrike Meinhof) maintained encrypted communications with East Germany\'s Stasi intelligence service, which supplied one-time pad material, safe houses, forged documents, and weapons. After German reunification in 1990, investigators gained access to archived Stasi files confirming the communications channel. The OTP messages themselves could not be decoded — pads had been destroyed — but the metadata and paper trails were sufficient to reconstruct the operational relationships. The RAF formally disbanded in 1998.',
        panels=[
            ('📜','Historical Context','<p>Throughout the 1970s–1990s West German domestic counterterrorism effort, BKA (Federal Criminal Police) had intercepted hundreds of RAF transmissions but could not decrypt fully encrypted OTP messages. The Stasi\'s <em>Hauptverwaltung Aufklärung</em> (HVA) provided RAF cells with field-grade one-time pad kits produced by the KGB-affiliated <em>Aufklärungsamt</em> technical section — the same infrastructure supporting Soviet deep-cover agents inside NATO structures.</p>'),
            ('⚙️','The KGB Field OTP Format','<p>Soviet field OTPs used 5-digit number groups on printed one-time sheets arranged in columns. Messages were encoded by converting each plaintext letter to a number (A=01 through Z=26) and adding the corresponding pad digit modulo 10 (Fibonacci addition — no carry). Sheets were destroyed by fire after use. The system is identical in security to Vernam\'s original 1917 cipher; correctness of implementation was the KGB\'s quality control problem, not the cipher itself.</p>'),
            ('💀','The Stasi Files Exposure','<div class="attack-panel"><div class="attack-name">Archive exposure post-reunification</div><div class="attack-diff">Complexity: Metadata attack — cipher itself not broken</div><p class="attack-desc">When the Berlin Wall fell on November 9, 1989, BStU (Federal Commissioner for Stasi Records) began the multi-decade effort to reconstruct shredded Stasi paper archives. By 1993, investigators had confirmed Stasi material support for RAF. No OTP key material was recovered — the pads had been destroyed per Soviet protocol — but the structural evidence was sufficient for criminal prosecution and historical reconstruction.</p></div>'),
        ],
        related=[
            ('one-time-pad.html','One-Time Pad','How OTP works mathematically'),
            ('diana-cryptosystem.html','Diana Cryptosystem','US equivalent field OTP'),
            ('vic.html','VIC Cipher','Soviet straddling-checkerboard complement to OTP'),
        ],
        prev_s='ira-book-cipher', prev_n='IRA Book Cipher',
        next_s='vietnamese-underground', next_n='Vietnamese Underground Codes',
    ),
    dict(
        slug='vietnamese-underground',
        title='Vietnamese Underground Codes',
        og_desc='The Viet Minh and NLF used a system of keyed monoalphabetic substitution and prearranged signal codes during the Indochina and Vietnam Wars (1940s–1975).',
        hall_path='halls/military.html',
        hall_label='Hall V: Military &amp; Spy Ciphers',
        era_badge='Modern · 1940s–1975',
        sec_badge='Partially broken',
        eyebrow='Hall V · Military Ciphers',
        tagline='Cell-level encryption used by Vietnamese resistance networks from the French colonial period through the fall of Saigon.',
        facts=[
            ('Users','Viet Minh, NLF/Viet Cong, NVA'),
            ('Era','1940s–1975'),
            ('Family','Keyed monoalphabetic + codebook overlay'),
            ('Key Distribution','Cell structure — each cell held local key'),
            ('Broken By','SIGINT (NSA/ARVN), captured materials'),
            ('Modern Lesson','Compartmentalization limits damage from key compromise'),
        ],
        demo_section='<div class="demo-section" data-cipher="vietnamese-underground"></div>',
        significance='Vietnamese resistance organizations from the Viet Minh (1941) through the National Liberation Front (1960) used a layered cipher system adapted from French colonial communication techniques supplemented by Soviet and Chinese intelligence training. At the cell level, keyed monoalphabetic substitution using Vietnamese keywords provided basic message protection. At the command level, rotating codebooks with numeric indicators gave operational security. The cell-based compartmentalization meant breaking one key exposed only a single cell — exactly the design principle behind modern compartmented information handling.',
        panels=[
            ('📜','Historical Context','<p>Ho Chi Minh received intelligence training from the Comintern in Moscow in 1923–1924 and the Chinese Communist Party through the 1930s. The Viet Minh\'s intelligence bureau (<em>Công an</em>) developed multilayer communications security from the outset of the anti-French resistance. By the American war period, NSA\'s signals intelligence operation at Phu Bai and the ARVN\'s intercept service were capturing hundreds of encrypted transmissions daily.</p>'),
            ('⚙️','How Cell-Level Keys Worked','<p>Each underground cell (typically 3–5 members) received a unique key word generated from a Vietnamese phrase — song lyrics, a line of poetry, or a personal phrase — known only within the cell and to one courier. Messages used the key word to generate a mixed substitution alphabet. Code words for locations, unit designations, and commanders were assigned locally and changed on a 30-day cycle, limiting exploitation of broken traffic.</p>'),
            ('💀','How It Was Broken','<div class="attack-panel"><div class="attack-name">Material capture + frequency analysis</div><div class="attack-diff">Complexity: Moderate — each cell key is independent</div><p class="attack-desc">NSA analysts applied standard monoalphabetic frequency analysis against Vietnamese-language traffic, taking advantage of known Vietnamese digraph frequencies. More critical were captured material : notebooks, letters, and printed cipher pads recovered during combat operations. Each capture was compartmented — useful only for the specific cell whose key was found — a design constraint that slowed but did not stop exploitation.</p></div>'),
        ],
        related=[
            ('monoalphabetic.html','Monoalphabetic Substitution','Core mechanism'),
            ('diana-cryptosystem.html','Diana Cryptosystem','US counterpart in the same war'),
            ('navajo-code-talkers.html','Navajo Code Talkers','WWII language-based alternative'),
        ],
        prev_s='red-army-faction', prev_n='Red Army Faction OTP',
        next_s='joseon-yeokhak', next_n='Joseon Yeokhak Cipher',
    ),
    dict(
        slug='joseon-yeokhak',
        title='Joseon Yeokhak Cipher',
        og_desc='The Joseon Dynasty (1392–1897) Korean royal court used a cipher based on I Ching hexagram pairings to protect palace communications and diplomatic dispatches.',
        hall_path='halls/ancient.html',
        hall_label='Hall I: World Origins of Cryptography',
        era_badge='East Asia · 1392–1897',
        sec_badge='Historical (low security)',
        eyebrow='Hall I · World Origins · Korea',
        tagline='A palace cipher rooted in I Ching philosophy — one of the most distinctive alphabetic systems in cryptographic history.',
        facts=[
            ('Origin','Joseon Dynasty royal court, Korea'),
            ('Era','1392–1897 CE'),
            ('Family','Substitution (hexagram-keyed)'),
            ('Alphabet Base','Korean Hangul syllabary + I Ching hexagrams'),
            ('Surviving Examples','Palace archives, National Museum of Korea'),
            ('Modern Lesson','Cryptographic innovation occurs in every literate culture independently'),
        ],
        demo_section='<div class="demo-section" data-cipher="joseon-yeokhak"></div>',
        significance='The Joseon Dynasty\'s royal court cryptography blended two distinct intellectual traditions: the phonetic Hangul alphabet (invented 1443 by King Sejong) and the 64 hexagrams of the I Ching (<em>Yijing</em>). Palace scribes used hexagram-keyed substitutions as part of <em>yeokhak</em> (易學, "the study of change") — a body of practical numerology applied to administration, fortune-telling, and, it appears, covert communication. The resulting cipher is one of the most culturally distinctive substitution systems in the historical record.',
        panels=[
            ('📜','Historical Context','<p>The Joseon dynasty lasted 505 years, from 1392 to 1897 CE. King Sejong\'s 1443 promulgation of the Hangul alphabet created a uniquely phonetic script designed to be learned in days rather than years — a radical democratization of literacy. Within a generation, the same script was being used for palace correspondence requiring confidentiality: tax records, succession disputes, and diplomatic communications with China and Japan. The hexagram-key system allowed palace officials to encode messages using a key known only to senior officials.</p>'),
            ('⚙️','How the Hexagram Key Worked','<p>The 64 hexagrams of the I Ching were assigned to syllables of the Hangul system in an order derived from Confucian numerological reasoning. A keyword was expressed as a sequence of hexagram numbers, which generated a mixed-alphabet substitution. A reader with the I Ching and the key word could decode; without the specific keyword-to-hexagram mapping table, the heterogeneous script made the ciphertext appear mystical rather than linguistic.</p>'),
            ('💀','Security Analysis','<div class="attack-panel"><div class="attack-name">Frequency analysis + phonetic structure</div><div class="attack-diff">Complexity: Moderate — Korean phonotactics constrain sequences</div><p class="attack-desc">Korean syllabic structure (consonant + vowel + optional final consonant) severely constrains which syllable sequences are valid. A cryptanalyst familiar with Korean phonology who received enough ciphertext could reconstruct the substitution using frequency analysis of valid syllabic transitions. The system provided operational security against casual interception, not against a determined, linguistically trained adversary.</p></div>'),
        ],
        related=[
            ('kama-sutra.html','Kama Sutra Cipher','Indian paired-substitution — same class'),
            ('arabic-nomenclators.html','Arabic Nomenclators','Where systematic analysis was born'),
            ('polybius.html','Polybius Square','European precursor to syllabic encoding'),
        ],
        prev_s='vietnamese-underground', prev_n='Vietnamese Underground Codes',
        next_s='amharic-ge-ez-ciphers', next_n='Ethiopian Ge\u02bcez Monastic Ciphers',
    ),
    dict(
        slug='amharic-ge-ez-ciphers',
        title='Ethiopian Ge\u02bcez Monastic Ciphers',
        og_desc="Ethiopian Orthodox monasteries used syllabary-based substitution ciphers in Ge'ez script to protect sacred texts and inter-monastery communications from the 14th century onward.",
        hall_path='halls/ancient.html',
        hall_label='Hall I: World Origins of Cryptography',
        era_badge='East Africa · 14th–19th c.',
        sec_badge='Historical (low security)',
        eyebrow='Hall I · World Origins · Ethiopia',
        tagline="An African cryptographic tradition — Ge'ez syllabary substitution protecting sacred manuscripts in Ethiopian Orthodox monasteries.",
        facts=[
            ('Origin','Ethiopian Orthodox monastic tradition'),
            ('Era','~14th–19th century CE'),
            ('Script','Ge\u02bcez (Ethiopic) syllabary (547 characters)'),
            ('Family','Syllabic substitution'),
            ('Surviving Examples','EMML archive (Ethiopian Manuscript Microfilm Library)'),
            ('Modern Lesson','Large syllabic alphabets complicate frequency analysis'),
        ],
        demo_section='<div class="demo-section" data-cipher="amharic-ge-ez-ciphers"></div>',
        significance="The Ethiopian Orthodox Church maintained one of Africa's oldest continuous literary traditions, with monasteries at Debre Damo, Lalibela, and Lake Tana holding manuscript collections dating to the 4th century CE. To protect liturgical secrets, theological commentary, and inter-monastery correspondence from unauthorized reading, monastic scribes developed substitution systems using the Ge'ez syllabary's natural complexity: 547 distinct characters across 7 vowel orders create a cipher space far larger than a 26-letter Latin alphabet. European frequencies tables are useless against a 547-character syllabary.",
        panels=[
            ("📜","Historical Context","<p>Ge\u02bcez (Ethiopic) is a Semitic script used liturgically by the Ethiopian and Eritrean Orthodox churches. By the 14th century, scriptoria at major monasteries were producing illuminated manuscripts in Ge\u02bcez at industrial scale. The same period saw the standardization of monastic cipher practices: scribes used key words to generate permuted syllabary tables, applied syllable-level substitution, and recorded the key only in the memory of the scriptorium master.</p>"),
            ("⚙️","How the Syllabary Cipher Worked","<p>Ge\u02bcez syllables each represent a consonant-vowel pair. A conventional ordering places 33 base characters across 7 vowel forms. The monastic cipher assigned each of the 33 base consonants a substitute consonant from a keyed permutation, then maintained the vowel marker unchanged — a partial substitution attacking only the consonantal skeleton, which carries most semantic content in Semitic languages. A full syllabary permutation would require a 231-entry key table; the partial approach kept the key manageable.</p>"),
            ("💀","Security Analysis","<div class=\"attack-panel\"><div class=\"attack-name\">Consonant-frequency analysis</div><div class=\"attack-diff\">Complexity: Moderate — requires Ge\u02bcez linguistic expertise</div><p class=\"attack-desc\">A cryptanalyst with frequency tables for Ge\u02bcez liturgical text could apply standard monoalphabetic analysis to the consonant layer. The vowel markers constrain consonant co-occurrence in ways a knowledgeable analyst could exploit. Against readers who did not know Ge\u02bcez phonology, the system was effectively opaque — which describes the intended adversary, neighboring tribal leaders and foreign traders, almost perfectly.</p></div>"),
        ],
        related=[
            ('kama-sutra.html','Kama Sutra Cipher','Another non-European tradition'),
            ('joseon-yeokhak.html','Joseon Yeokhak','Korean syllabic parallel'),
            ('arabic-nomenclators.html','Arabic Nomenclators','Regional neighbor, different approach'),
        ],
        prev_s='joseon-yeokhak', prev_n='Joseon Yeokhak Cipher',
        next_s='latin-american-codebooks', next_n='Latin American Codebooks',
    ),
    dict(
        slug='latin-american-codebooks',
        title='Latin American Telegraphic Codebooks',
        og_desc='The commercial telegraph boom of 1870–1940 spawned a rich family of Latin American codebooks — from the Código Comercial Mexicano to the Código Telegráfico Argentino — that shaped 20th-century trade.',
        hall_path='halls/machines.html',
        hall_label='Hall VII: Mechanical Cipher Machines',
        era_badge='Americas · 1870s–1940s',
        sec_badge='Low (commercial, not military)',
        eyebrow='Hall VII · Machines &amp; Telegraphy',
        tagline='Before satellite communications, Latin American commerce ran on codebooks — ten-digit codewords that compressed paragraphs of trade into a single telegram.',
        facts=[
            ('Region','Mexico, Brazil, Argentina, Chile, Colombia'),
            ('Era','~1870–1945'),
            ('Family','Commercial codebook (terminological substitution)'),
            ('Purpose','Cost reduction + confidentiality in trade messages'),
            ('Notable Editions','Código Comercial Mexicano; Código Telegráfico Argentino'),
            ('Modern Lesson','Efficiency and secrecy drove code adoption as much as military need'),
        ],
        demo_section='<div class="demo-section" data-cipher="latin-american-codebooks"></div>',
        significance='The 1866 completion of the transatlantic telegraph cable and the rapid expansion of national telegraph networks across Latin America created enormous commercial demand for codebooks. A standard commercial telegram charged per word; a codebook reduced a twenty-word order into a single five-letter codegroup, saving 95% of transmission cost. Publishers in Mexico City, Buenos Aires, and Rio de Janeiro competed to offer the most comprehensive commercial vocabulary, and competing editions created a multi-decade market of codebooks that simultaneously served as communication infrastructure and as a low-grade privacy layer against competitors reading wire office carbon copies.',
        panels=[
            ('📜','Historical Context','<p>Western Union and its Latin American affiliates opened offices in every major port city from Veracruz to Valparaíso between 1866 and 1890. Cotton brokers in Monterrey, coffee exporters in Santos, cattle traders in Buenos Aires, and nitrate shippers in Iquique all needed rapid price quotations and order confirmations. Standard commercial codebooks assigned 5-letter or 10-digit codegroups to hundreds of pre-defined trade phrases, making them the most widely used "cipher" system of the 19th and early 20th century.</p>'),
            ('⚙️','Structure of a Commercial Codebook','<p>A typical 500-page commercial codebook contained: (1) a phrase section mapping business sentences to codewords, (2) a locality section mapping city and port names to short codes, (3) a commodity section for standard goods and currencies, (4) a numeric section for quantities, weights, and prices. Publishers offered annual editions with price list supplements. The "key" was simply the edition number — parties exchanged the same printed book, so "security" was notional, not cryptographic.</p>'),
            ('💀','Security Assessment','<div class="attack-panel"><div class="attack-name">Codebook capture / economic intelligence</div><div class="attack-diff">Complexity: Trivial with codebook in hand</div><p class="attack-desc">Commercial codebooks provided no real confidentiality against a telegraph operator who purchased the same edition. Their primary value was cost reduction, not secrecy. Military censors during WWI and WWII routinely banned commercial code traffic on Latin American cables precisely because the openly available books made it trivial to decode while appearing encoded — a veneer of privacy that could conceal genuine intelligence traffic.</p></div>'),
        ],
        related=[
            ('commercial-codebooks.html','Commercial Telegraph Codebooks','The global context'),
            ('chinese-telegraph.html','Chinese Telegraph Code','Parallel East Asian codebook system'),
            ('zimmermann.html','Zimmermann Telegram','When diplomatic codes met commercial wire'),
        ],
        prev_s='amharic-ge-ez-ciphers', prev_n='Ethiopian Ge\u02bcez Monastic Ciphers',
        next_s='diana-cryptosystem', next_n='Diana Cryptosystem',
    ),
    dict(
        slug='field-hollers',
        title='Field Hollers and Coding Songs',
        og_desc='American enslaved workers used field hollers, work songs, and coded idiom as covert communication — "Follow the Drinking Gourd" encoding an escape route along the Underground Railroad.',
        hall_path='halls/culture.html',
        hall_label='Hall XIII: Cipher Culture',
        era_badge='Americas · 1619–1865',
        sec_badge='Historical (social steganography)',
        eyebrow='Hall XIII · Cipher Culture',
        tagline="Songs weren't just music — they were maps, warnings, and meeting-time signals encoded in plain sight.",
        facts=[
            ('Context','Antebellum America, Underground Railroad'),
            ('Era','1619–1865 (and later)'),
            ('Method','Steganographic encoding in song lyrics and vocal pattern'),
            ('Key','Shared community knowledge (out-of-band)'),
            ('Notable Example','"Follow the Drinking Gourd" encoding North Star navigation'),
            ('Modern Lesson','Steganography hides existence of message; cryptography hides content'),
        ],
        demo_section=FIELD_HOLLERS_DEMO,
        significance='Field hollers were the working-day vocal tradition of enslaved African Americans in the antebellum South — unaccompanied songs improvised during field labor, combining African musical traditions with the urgent necessity of covert communication in a surveillance environment where written messages could mean death. The best-documented example is "Follow the Drinking Gourd," in which the Big Dipper (Drinking Gourd) points north to freedom — a navigational direction encoded in a song that slaveholders heard as innocuous music. Warning shouts disguised as work calls signaled approaching overseers. Meeting times were embedded in song structures. This is steganography at scale, operating continuously, in earshot of the adversary.',
        panels=[
            ('📜','Historical Context','<p>In the antebellum American South, enslaved people were systematically denied literacy, assembly rights, and free movement. The penalty for planning escape was severe. Communication among enslaved people therefore evolved into a rich tradition of coded oral culture. The field holler — a call-and-response vocal form — allowed information to pass across distances of hundreds of meters during shared field labor, in front of overseers who heard only work music.</p>'),
            ('🎵','Communication Through Song Structure','<p>Information was encoded in multiple layers: literal lyric meaning, call-and-response timing (rapid responses meant danger; slow meant safety), melodic contour (rising phrases for warning, falling for all-clear), and seasonal context (certain songs were only sung during harvest, flagging specific operational windows). The "key" was shared community knowledge transmitted through social bonding — an out-of-band channel the surveillance state could not intercept because it was invisible as a channel.</p>'),
            ('🗺️','The Drinking Gourd as Navigation','<p>"Follow the Drinking Gourd" directed escapees northward by identifying the Big Dipper (two outer bowl stars point to Polaris, the North Star). Verse imagery encoded the route from the Tombigbee River to the Tennessee River to the Ohio River — a walking-distance map from Mississippi and Alabama to the free states. Historians debate whether the song functioned as a literal map or as a general inspirational reference to northward escape; either way, it encodes directional information in a culturally deniable container.</p>'),
            ('🔬','Relationship to Modern Steganography','<p>Steganography (hiding the existence of a message) is distinct from cryptography (hiding the content). Field hollers achieved steganographic security: overseers heard music, not encrypted communication. Modern digital steganography — hiding data in image LSBs, audio noise floors, or network timing — achieves the same goal: no detectable ciphertext surface that flags the presence of hidden communication. The adversary cannot attack what they cannot see.</p>'),
        ],
        related=[
            ('bacon.html','Bacon Cipher','Another steganographic system — hiding text in text'),
            ('null-cipher.html','Null Cipher','Words hidden in innocent-looking plain text'),
            ('navajo-code-talkers.html','Navajo Code Talkers','Language as unbreakable cipher'),
        ],
        prev_s='', prev_n='',
        next_s='', next_n='',
    ),
]


if __name__ == '__main__':
    for spec in PAGES:
        out = page(**spec)
        dest = os.path.join(OUT, spec['slug'] + '.html')
        with open(dest, 'w', encoding='utf-8') as f:
            f.write(out)
        print(f'  Created {dest}')
    print(f'Done. {len(PAGES)} pages written.')
