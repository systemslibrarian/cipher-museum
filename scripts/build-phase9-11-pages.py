#!/usr/bin/env python3
"""Build Phase 9/10/11 exhibit pages — Culture, Microdot, and Context pages."""
import os

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(REPO, 'ciphers')

STATIC_STYLE = """<style>
  .track-b-widget {
    border:1px solid var(--gold-b);border-radius:8px;padding:1.5rem;
    margin:2rem 0;background:var(--s1);
  }
  .track-b-widget h3 { color:var(--gold);margin-top:0; }
  .track-b-widget label { display:block;font-size:.8rem;color:var(--fg-dim);margin-bottom:.3rem; }
  .track-b-widget input, .track-b-widget textarea {
    width:100%;padding:.5rem .75rem;background:var(--s2);border:1px solid var(--b1);
    border-radius:4px;color:var(--fg);font-family:var(--fm);box-sizing:border-box;
  }
  .track-b-widget button {
    padding:.5rem 1.25rem;background:var(--gold);color:#000;border:none;
    border-radius:4px;cursor:pointer;font-weight:700;margin-top:.5rem;
  }
  .track-b-output {
    font-family:var(--fm);font-size:1rem;color:var(--gold-lt);
    letter-spacing:.05em;min-height:2rem;margin-top:.75rem;
  }
</style>"""

def wrap(slug, title, og_desc, hall_path, hall_label, era_badge, sec_badge,
         eyebrow, tagline, facts_items, demo_html, significance_p,
         panels_list, related_list, prev_s, prev_n, next_s, next_n):
    facts = ''.join(f'    <div class="fact"><span class="fact-label">{k}</span><span class="fact-value">{v}</span></div>\n' for k,v in facts_items)
    panels = ''.join(f'    <div class="panel"><div class="panel-head"><span class="panel-icon">{ico}</span><span class="panel-title">{t}</span></div><div class="panel-body">{b}</div></div>\n' for ico,t,b in panels_list)
    related = ''.join(f'    <a href="../ciphers/{rs}" class="related-card"><span class="related-card__number">Related</span><span class="related-card__name">{rn}</span><span class="related-card__tag">{rt}</span></a>\n' for rs,rn,rt in related_list)
    qf = ''.join(f'<tr><td>{k}</td><td>{v}</td></tr>' for k,v in facts_items)
    nav_prev = f'  <a href="../ciphers/{prev_s}.html" class="hall-nav-link"><span class="hall-nav-dir">&larr; Previous</span><span class="hall-nav-name">{prev_n}</span></a>' if prev_s else ''
    nav_next = f'  <a href="../ciphers/{next_s}.html" class="hall-nav-link next"><span class="hall-nav-dir">Next &rarr;</span><span class="hall-nav-name">{next_n}</span></a>' if next_s else ''
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
  {STATIC_STYLE}
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
{facts}  </div>
</div>
{demo_html}
<div class="exhibit-layout">
  <div class="exhibit-main">
    <div class="cipher-significance"><h3>Why This Matters</h3><p>{significance_p}</p></div>
{panels}  </div>
  <div class="exhibit-side">
    <div class="panel" style="border-color:var(--gold-b);">
      <div class="panel-head" style="background:var(--gold-glow);border-color:var(--gold-b);">
        <span class="panel-icon">&#9876;</span><span class="panel-title" style="color:var(--gold);">Quick Facts</span>
      </div>
      <div class="panel-body"><table class="cipher-table"><tbody>{qf}</tbody></table></div>
    </div>
  </div>
</div>
<section class="related-exhibits">
  <h2 class="related-exhibits__heading">Related Exhibits</h2>
  <div class="related-exhibits__grid">
{related}  </div>
</section>
<div class="hall-nav">
{nav_prev}
{nav_next}
</div>
</main>
<footer class="museum-footer">
  <div class="footer-grid">
    <div class="footer-brand"><span class="footer-logo-text">The Cipher Museum</span><p class="footer-brand-desc">Open-source cryptography education. MIT License. GitHub Pages.</p></div>
    <div><div class="footer-col-title">Navigate</div><ul class="footer-links"><li><a href="../museum-map.html">Museum Map</a></li><li><a href="../timeline.html">Timeline</a></li><li><a href="../challenges.html">Challenges</a></li><li><a href="../glossary.html">Glossary</a></li></ul></div>
    <div><div class="footer-col-title">This Hall</div><ul class="footer-links"><li><a href="../{hall_path}">{hall_label}</a></li></ul></div>
  </div>
  <div class="footer-bottom"><span class="footer-copy">&copy; The Cipher Museum &middot; MIT License</span><span class="footer-copy">{eyebrow}</span></div>
</footer>
<script src="../js/ciphers/all-engines.js"></script>
<script src="../js/demo-loader.js"></script>
<script src="../js/nav.js" defer></script>
<script src="../js/lightbox.js"></script>
</body>
</html>"""


# ─── helper: generic hand-built encode widget ────────────────────────────────
def widget(fn_name, placeholder, default_val, label="Message"):
    return f"""<div class="track-b-widget">
  <h3>&#128275; Interactive Explorer</h3>
  <p style="font-size:.9rem;color:var(--fg-dim);margin-bottom:1rem;">Try encoding a message as this cipher does.</p>
  <label for="input">{label}</label>
  <input id="input" type="text" value="{default_val}" placeholder="{placeholder}">
  <button onclick="encode()">Encode</button>
  <div id="output" class="track-b-output"></div>
  <script>
    function encode() {{
      const t = document.getElementById('input').value;
      const o = {fn_name}(t);
      document.getElementById('output').textContent = o;
    }}
  </script>
</div>"""


PAGES = [
    # ── Phase 9: Cipher Culture ───────────────────────────────────────────────
    dict(
        slug='da-vinci-code',
        title='The Da Vinci Code',
        og_desc="Dan Brown's 2003 thriller made cryptography mainstream — Atbash, the Fibonacci sequence, and anagrams as plot devices that introduced millions to cipher thinking.",
        hall_path='halls/culture.html',
        hall_label='Hall XIII: Cipher Culture',
        era_badge='Fiction · 2003',
        sec_badge='Pop Culture',
        eyebrow='Hall XIII · Cipher Culture',
        tagline="Dan Brown's 2003 bestseller introduced one hundred million readers to Atbash, anagram ciphers, and the thrill of secret codes hidden in plain sight.",
        facts_items=[
            ('Author','Dan Brown'),
            ('Published','2003 (Doubleday)'),
            ('Copies sold','~80 million+ worldwide'),
            ('Ciphers featured','Atbash, anagram, Fibonacci sequence, mirror writing'),
            ('Impact','Global surge in cryptography interest; Da Vinci tourism boom'),
            ('Historical accuracy','Contested — numerous anachronisms, see panels below'),
        ],
        demo_html=widget('daVinciEncode', 'Enter message…', 'SOPHIA', 'Message (Atbash encodes it)') + """
  <script>
    // Atbash demo inlined for Da Vinci Code page
    function daVinciEncode(t) {
      const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return t.toUpperCase().replace(/[^A-Z]/g,'').split('').map(c=>{
        const i=A.indexOf(c); return i>=0?A[25-i]:c;
      }).join('') + ' (Atbash)';
    }
  </script>""",
        significance_p="The Da Vinci Code is the single most influential work of popular fiction for the field of cryptographic public awareness. By embedding Atbash, anagrams, and the Fibonacci sequence into a gripping thriller, Brown gave readers a felt experience of solving cipher puzzles — and drove them to libraries, cryptography courses, and websites seeking the real history behind his plot devices. Whatever its historical inaccuracies, the novel demonstrably increased engagement with actual ciphers, with visits to the National Cryptologic Museum doubling in the year following publication.",
        panels_list=[
            ('📖','Ciphers in the Book','<p>The novel features: (1) an Atbash-encoded message (used famously in the Book of Jeremiah 25:26 — SHESHACH = BABEL via Atbash), reinforcing Hebrew scripture connections; (2) anagram-based clue-solving, an analogy to transposition ciphers; (3) the Fibonacci sequence as an ordering key, anticipating modern numeric cipher ideas; (4) mirror writing attributed to Leonardo da Vinci, who genuinely used right-to-left script in his notebooks — though not as a serious cipher.</p>'),
            ('🔬','What the Book Gets Right','<p>Atbash is a real Hebrew cipher used in the Old Testament. Leonardo da Vinci genuinely wrote in mirror script, though scholars believe this reflected left-handedness and personal habit rather than cryptographic intent. The Priory of Sion was a real (minor) French organization, though not of medieval origin. The novel\'s depiction of cipher puzzles as solvable through knowledge of history and pattern recognition reflects exactly how historical cryptanalysis works.</p>'),
            ('⚠️','What the Book Gets Wrong','<p>The Priory of Sion conspiracy is largely a 20th-century hoax; the &#8220;historical&#8221; documents Brown cites were forged in the 1960s by Pierre Plantard. The Fibonacci key usage described in the novel conflates several distinct cipher systems. Numerous art-historical details (Mona Lisa dimensions, Last Supper iconography) are anachronistic or fabricated. Brown&#39;s bibliography mixes serious scholarship with debunked conspiracy literature without distinguishing between them.</p>'),
            ('🌍','Cultural Impact','<p>The Da Vinci Code sparked: a verified spike in enrollment in cryptography and medieval history courses; record tourism to the Louvre, Rosslyn Chapel, and Rennes-le-Château; a 2006 film adaptation; a bestseller in 44 languages; and widespread popular interest in "hidden messages" in Renaissance art that persists across social media to this day. For cryptography educators, the book is both a gateway and a source of misconceptions to correct.</p>'),
        ],
        related_list=[
            ('atbash.html','Atbash','The Hebrew cipher Brown features'),
            ('bacon.html','Bacon Cipher','Another hidden-message system in art/text'),
            ('sator-square.html','Sator Square','Real ancient cryptographic puzzle'),
        ],
        prev_s='gold-bug', prev_n='The Gold-Bug',
        next_s='national-treasure', next_n='National Treasure',
    ),
    dict(
        slug='national-treasure',
        title='National Treasure',
        og_desc='The 2004 Disney film National Treasure sent audiences hunting for cipher clues on the US dollar bill, the Liberty Bell, and Independence Hall — all real historical sites.',
        hall_path='halls/culture.html',
        hall_label='Hall XIII: Cipher Culture',
        era_badge='Fiction · 2004',
        sec_badge='Pop Culture',
        eyebrow='Hall XIII · Cipher Culture',
        tagline='Benjamin Franklin, a hidden Freemason cipher, and the Declaration of Independence — the film that made cipher tourism American.',
        facts_items=[
            ('Director','Jon Turteltaub'),
            ('Studio','Walt Disney / Jerry Bruckheimer Films'),
            ('Year','2004'),
            ('Ciphers featured','Ottendorf / book cipher, spectral lens, Freemason imagery'),
            ('Real history used','Independence Hall, the Liberty Bell, Freemason architecture, Franklin'),
            ('Sequel','National Treasure: Book of Secrets (2007)'),
        ],
        demo_html=widget('ntEncode', 'Enter message…', 'FREEMASON', 'Message (Freemason Pigpen encodes it)') + """
  <script>
    // Pigpen substitution demo
    function ntEncode(t) {
      // Map A-Z to 26 symbolic names for display
      const names = ['#+','#-','#=','|-','||','|-',']|',']]','[|',
                     '.+','.-','.=','L+','L-','L=','r+','r-','r=',
                     'v+','v-','v=','x+','x-','x=','<>','<|'];
      return t.toUpperCase().replace(/[^A-Z]/g,'').split('').map(c=>{
        const i=c.charCodeAt(0)-65; return names[i]||c;
      }).join(' ') + ' (Pigpen grid)';
    }
  </script>""",
        significance_p="National Treasure (2004) wove real American history — Freemason architecture, the layout of Washington D.C., the symbolism on the dollar bill — into a cipher-hunt adventure narrative. While no treasure actually exists behind Independence Hall, the film sent millions of viewers to examine the actual historical record of Founding-era cryptography: Benjamin Franklin genuinely used codes in his diplomatic correspondence; George Washington ran the Culper spy ring with invisible ink; and Freemason imagery in early American civic architecture is a documented historical fact, even if not a cipher.",
        panels_list=[
            ('📖','Ciphers in the Film','<p>The film\'s plot devices include: (1) an Ottendorf cipher (book cipher on the back of the Declaration of Independence — fictional but grounded in the real 18th-century Beale tradition); (2) a spectral lens revealing hidden text when specific light is applied — a fictional variant of thermally activated invisible ink; (3) Freemason symbols in the Great Seal and the street layout of Washington D.C.; (4) the phrase "endure, persevere" as an anagram key — a variant of letter-substitution ciphers.</p>'),
            ('🔬','What Is Actually True','<p>Benjamin Franklin was a Freemason — he joined St. John\'s Lodge in Philadelphia in 1731. Washington D.C.\'s original plan by Pierre Charles L\'Enfant does include diagonal avenues cutting through a grid, and some Freemason researchers claim pentagram and compass shapes in the layout, though this is contested. George Washington did operate a sophisticated intelligence network using the Culper Ring (see the exhibit). The Founders corresponded in codes and ciphers, particularly in sensitive diplomatic channels via invisible ink.</p>'),
            ('🌍','Cultural Impact','<p>The film generated measurable increases in tourism to Independence Hall, the National Archives, and the Smithsonian. Online communities devoted to "real national treasure" hunts proliferated. The franchise directly influenced the design of the real-world hunt <em>The Secret</em> (Byron Preiss, 1982 — three casques found as of 2024), and inspired the puzzle-hunt design community that produced later ARGs such as Cicada 3301.</p>'),
        ],
        related_list=[
            ('freemason-pigpen.html','Freemason Pigpen','The cipher featured in the film'),
            ('culper-ring.html','Culper Ring','Real Revolutionary War spy cryptography'),
            ('beale.html','Beale Ciphers','Real American cryptographic treasure hunt'),
        ],
        prev_s='da-vinci-code', prev_n='The Da Vinci Code',
        next_s='gravity-falls', next_n='Gravity Falls',
    ),
    dict(
        slug='gravity-falls',
        title='Gravity Falls Cipher System',
        og_desc="The Disney animated series Gravity Falls (2012–2016) hid a different cipher in every episode's credits — Caesar, Atbash, A1Z26 numeric, Vigenère — teaching real cryptography to a generation of children.",
        hall_path='halls/culture.html',
        hall_label='Hall XIII: Cipher Culture',
        era_badge='Animation · 2012–2016',
        sec_badge='Pop Culture',
        eyebrow='Hall XIII · Cipher Culture',
        tagline='Every episode had a hidden message. Creator Alex Hirsch taught an entire generation of children to solve real cipher puzzles.',
        facts_items=[
            ('Creator','Alex Hirsch'),
            ('Network','Disney Channel / Disney XD'),
            ('Run','June 2012 – February 2016'),
            ('Cipher progression','Season 1: Caesar → Atbash → A1Z26 | Season 2: Vigenère (key: BILL)'),
            ('Community','Vast online cipher-hunting fanbase; subreddit r/gravityfalls'),
            ('Educational impact','Demonstrably taught substitution cipher concepts to children 8–14'),
        ],
        demo_html=widget('gfEncode', 'Secret message…', 'TRUST NO ONE', 'Message (Caesar shift 3)') + """
  <script>
    // Caesar cipher demo (Gravity Falls S1 cipher type)
    function gfEncode(t) {
      const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const shift=3;
      return t.toUpperCase().replace(/[^A-Z ]/g,'').split('').map(c=>{
        if(c===' ') return ' ';
        return A[(A.indexOf(c)+shift)%26];
      }).join('') + ' (Caesar +3)';
    }
  </script>""",
        significance_p="Gravity Falls is arguably the most educationally effective popular media cipher deployment in history — not because of academic design, but because series creator Alex Hirsch embedded real, sequential cipher puzzles into every episode's end credits and promotional materials, explicitly intending child viewers to learn cryptography. Season 1 used Caesar (shift 3), Atbash, and A1Z26 (number-to-letter) in rotation. Season 2 escalated to Vigenère with the keyword BILL. Hundreds of thousands of children learned to identify, apply, and differentiate cipher families as a consequence — then went looking for more.",
        panels_list=[
            ('📺','The Cipher Progression','<p>Each episode of Season 1 ended with a credit cryptogram using one of three rotating systems: Caesar cipher (shift 3), Atbash, or A1Z26 (A=1…Z=26 numeric encoding). The rotation was itself a clue. Season 2 upgraded to Vigenère cipher with a six-letter keyword that fans eventually determined was BILL — a reference to the show\'s main antagonist Bill Cipher, a triangular dream demon. The keyword was hidden in promotional materials and required community collaboration to find.</p>'),
            ('🧩','Community Cryptanalysis','<p>The Gravity Falls cipher community on Reddit (r/gravityfalls) developed systematic episode-by-episode decoding, with new cipher solutions appearing within hours of each broadcast. Fans built dedicated cipher tools, printed cipher wheels, and created tutorial videos for newcomers. The showrunner Alex Hirsch actively engaged with this community through indirect clues and in-character Twitter exchanges as the character Grunkle Stan. This is perhaps the first mass participatory cryptanalysis event designed as entertainment.</p>'),
            ('🔬','The Journals as Cipher Texts','<p>The show\'s three in-universe author\'s journals contained additional cipher puzzles. The Season 2 finale revealed character backstory through a Vigenère-encrypted message using the character\'s real name as key. Hirsch later released a real physical replica of Journal 3 containing additional hidden puzzles — some of which were solved by the fandom before the book\'s publication by crossword fan communities who had obtained advance proofs.</p>'),
        ],
        related_list=[
            ('caesar.html','Caesar Cipher','Season 1 starting cipher'),
            ('atbash.html','Atbash','Season 1 rotation'),
            ('vigenere.html','Vigenère Cipher','Season 2 cipher (key: BILL)'),
        ],
        prev_s='national-treasure', prev_n='National Treasure',
        next_s='field-hollers', next_n='Field Hollers',
    ),
    # ── Phase 10: Generic Techniques ─────────────────────────────────────────
    dict(
        slug='microdot',
        title='Microdot Steganography',
        og_desc='The microdot — a photograph reduced to the size of a typographic period — was the most effective covert communication tool of the 20th century, used by the Abwehr, KGB, and CIA from WWII through the Cold War.',
        hall_path='halls/military.html',
        hall_label='Hall V: Military &amp; Spy Ciphers',
        era_badge='Modern · 1941–1980s',
        sec_badge='Broken (FBI discovers technique)',
        eyebrow='Hall V · Military Ciphers',
        tagline='A full page of text reduced to the size of a period — the microfilm technique that defined Cold War espionage.',
        facts_items=[
            ('Inventor','Dr. Zapp / Agfa (Germany, 1941)'),
            ('Era','1941–1980s'),
            ('Method','Optical reduction photography → 0.1mm dot'),
            ('First discovered','FBI Agent Duane Whitlock, 1941 (German spy Ludwig network)'),
            ('Broken By','Physical discovery — the FBI photographically enlarged suspicious punctuation'),
            ('Modern Lesson','Steganography hides the message; cryptography hides the content'),
        ],
        demo_html=widget('mdEncode', 'Secret message…', 'MEETING LOCATION CONFIRMED', 'Message to hide in a period') + """
  <script>
    function mdEncode(t) {
      // Demo: represent text as base64 (conceptual stand-in for optical reduction)
      const encoded = btoa(t.trim() || 'MESSAGE');
      return '.' + ' ← this period contains: [' + encoded + '] (base64, ~' +
             Math.ceil(encoded.length/8) + ' bytes when photographically reduced to 0.1mm)';
    }
  </script>""",
        significance_p="The microdot was the most operationally significant steganographic tool of the 20th century. An Agfa technical development from the early 1940s, it allowed German intelligence to reduce a full typewritten page — 3,000–4,000 characters — to a dot small enough to hide under a postage stamp, inside a magazine full-stop, or beneath a period in a personal letter. The FBI discovered the technique in 1941 when a double-agent reported it; thereafter, all incoming mail to the US from occupied Europe was examined under magnification. The technique remained in operational use by Soviet intelligence through the 1970s, typically combined with OTP encryption of the microdot's contents.",
        panels_list=[
            ('📜','Historical Context','<p>During WWII, the Abwehr (German military intelligence) operated a network of agents in the United States who used microdots to pass intelligence about US military production back to Hamburg. The network was broken in 1941 when double-agent William Sebold led the FBI to the New York cell. Federal agents discovered microdots concealed in a magazine — tiny specks that, under a microscope, revealed typewritten correspondence. J. Edgar Hoover publicly announced the discovery in 1942, both to warn Americans and to neutralize the technique by exposing it.</p>'),
            ('⚙️','How It Worked','<p>The process: (1) type or handwrite the full message; (2) photograph it on high-resolution microfilm at successive reducing magnifications, achieving a final image approximately 0.1mm × 0.1mm — the size of a printer\'s period; (3) cut the developed microdot from the film and glue it precisely over a period or comma in an innocent letter. The recipient used a low-power microscope to read the dot. KGB tradecraft later combined microdots with OTP-encrypted content, so that even if the dot were found, the content remained protected.</p>'),
            ('💀','Detection and Countermeasures','<div class="attack-panel"><div class="attack-name">Photographic enlargement + mail examination</div><div class="attack-diff">Complexity: Moderate — requires systematic examination of all correspondence</div><p class="attack-desc">Once the technique was known, detection required examining the punctuation of all suspect correspondence under magnification — a labor-intensive process applied in the US by the FBI and in the UK by MI5. By the 1950s, both services had dedicated microdot examination units. The technique became operationally obsolete when digital photography and encrypted digital communication made it unnecessary.</p></div>'),
            ('🔬','Modern Descendants','<p>Digital steganography — hiding data in the least-significant bits of image or audio files — is the direct descendant of the microdot technique: both conceal the existence of a message within an innocent carrier. Modern digital watermarking (hiding copyright data imperceptibly in images), blockchain timestamp proofs embedded in images, and network timing steganography (encoding messages in the timing gaps between packets) all use the same fundamental principle Agfa\'s chemists discovered in 1941.</p>'),
        ],
        related_list=[
            ('null-cipher.html','Null Cipher','Text-based steganography'),
            ('bacon.html','Bacon Cipher','Hidden messages in apparent noise'),
            ('one-time-pad.html','One-Time Pad','Encryption layer often combined with microdots'),
        ],
        prev_s='', prev_n='',
        next_s='', next_n='',
    ),
    # ── Phase 11: Context / Situation Pages ──────────────────────────────────
    dict(
        slug='cabinet-noir',
        title='Cabinet Noir — Black Chambers of Europe',
        og_desc='The European Black Chambers (cabinets noirs) were government departments that intercepted, deciphered, and resealed diplomatic mail from the 16th through 19th centuries — proto-signals-intelligence agencies.',
        hall_path='halls/codebreakers.html',
        hall_label='Hall X: Hall of Codebreakers',
        era_badge='Europe · 1550–1850',
        sec_badge='Historical',
        eyebrow='Hall X · Codebreakers',
        tagline='Before satellites, Western powers ran state intercept bureaux — opening every diplomatic letter, deciphering it, and resealing the wax without a trace.',
        facts_items=[
            ('Period','~1550–1844 CE'),
            ('Geography','France, Austria, Britain, Papal States, Prussia, Venice'),
            ('French Cabinet Noir','Est. by Henri IV (~1600); peak under Rossignol père et fils'),
            ('Austrian Geheime Kabinettskanzlei','Peak 1750–1848; intercepted letters across Europe'),
            ('British Secret Office','GPO interception unit, operating 1660s–1844'),
            ('Modern Lesson','Signals intelligence is as old as the written word'),
        ],
        demo_html=widget('cnEncode', 'Diplomatic message…', 'THE AMBASSADOR REQUESTS SAFE PASSAGE', 'Simulate a Cabinet Noir intercept') + """
  <script>
    // Simulate wax-seal removal and resealing (humorous demo — just shows the "intercepted" message)
    function cnEncode(t) {
      const ts = new Date().toISOString().replace('T',' ').slice(0,16);
      return '[INTERCEPTED ' + ts + ' | Cabinet Noir Vienna] ' +
             t.toUpperCase().replace(/[^A-Z ]/g,'') +
             ' | [RESEALED — ORIGINAL WAX IMPRESSION PRESERVED]';
    }
  </script>""",
        significance_p="The Cabinet Noir is the institutional ancestor of the NSA, GCHQ, and every modern signals intelligence agency. From the 16th century onward, European powers systematically intercepted diplomatic correspondence, employed teams of cryptanalysts to break whatever cipher was in use, copied the contents, and resealed letters — often reassembling broken seals so expertly that recipients never knew. The French Rossignol family served three successive monarchs as chief cryptanalysts; the Austrian Geheime Kabinettskanzlei in Vienna processed mail from across Europe at the peak of the Vienna Congress period; Britain's Secret Office within the General Post Office operated continuously from the 1660s until parliamentary pressure abolished it in 1844.",
        panels_list=[
            ('🏛️','The French Cabinet Noir','<p>Antoine Rossignol (1600–1682) and his son Bonaventure Rossignol became the first professional state cryptanalysts in European history. Antoine broke the Huguenot cipher at the siege of Réalmont (1626) in a single afternoon, demonstrating that ciphertext could be solved under operational time pressure. Under Louis XIV, the Rossignols ran a permanent intercept bureau attached to the royal court, developing new nomenclators for French diplomatic use while simultaneously maintaining a catalog of foreign cipher alphabets. The system they built was not fundamentally changed for 150 years.</p>'),
            ('🏛️','The Austrian Geheime Kabinettskanzlei','<p>The Austrian "secret cabinet chancellery" in Vienna reached its operational peak during the 1750–1848 period, intercepting mail from the entire European diplomatic circuit. The Habsburgs controlled several key postal routes, giving their interceptors first access to letters transiting through their territory. During the Congress of Vienna (1814–1815), the Kabinettskanzlei provided Metternich with advance intelligence on the negotiating positions of every other great power — a strategic intelligence advantage with no modern parallel except satellite intercepts of allied heads of state.</p>'),
            ('🏛️','Britain\'s Secret Office','<p>The British General Post Office maintained a "Secret Office" for mail interception from the 1660s through 1844, when parliamentary scandals — particularly the revelation that the government had opened letters from the Italian nationalist leader Mazzini — generated sufficient public outrage to force abolition. The office\'s cryptanalysts worked on diplomatic ciphers from every European power. When the 1844 select committee investigation revealed the full scope of operations, it produced the first major public debate about government surveillance powers.</p>'),
            ('🔬','From Cabinet Noir to NSA','<p>The institutional lineage is direct: Cabinet Noir → British Secret Office → Room 40 (WWI naval intelligence) → Bletchley Park (WWII) → GCHQ / NSA (Cold War through present). Each generation inherited the accumulated tradecraft of the previous, adding technical capability but preserving the fundamental mission: read communications your adversaries believe are private. The Church Committee (1975) and the 2013 Snowden revelations are the modern equivalents of the 1844 Mazzini scandal — recurring moments when democratic societies must decide how much state interception is legitimate.</p>'),
        ],
        related_list=[
            ('great-cipher.html','Great Cipher','The Rossignol family\'s masterwork'),
            ('babington.html','Babington Plot','Earlier royal interception and cryptanalysis'),
            ('nomenclator.html','Nomenclator','The cipher type Black Chambers targeted'),
        ],
        prev_s='', prev_n='',
        next_s='station-hypo', next_n='Station HYPO',
    ),
    dict(
        slug='station-hypo',
        title='Station HYPO — Pearl Harbor to Midway',
        og_desc='Station HYPO at Pearl Harbor was the US Navy signals intelligence unit that broke JN-25 in 1942 and gave Admiral Nimitz advance warning of the Japanese fleet\'s target at Midway — turning the tide of the Pacific War.',
        hall_path='halls/codebreakers.html',
        hall_label='Hall X: Hall of Codebreakers',
        era_badge='WWII · 1940–1942',
        sec_badge='Broken (JN-25)',
        eyebrow='Hall X · Codebreakers',
        tagline='From a basement under the Pearl Harbor submarine base, Joseph Rochefort\'s team changed the Pacific War in six months.',
        facts_items=[
            ('Location','Pearl Harbor submarine base, Oahu, Hawaii'),
            ('Commander','Commander Joseph Rochefort'),
            ('Period','Active 1940–1942 (most critical)'),
            ('Key Break','JN-25 — Imperial Japanese Navy main cipher'),
            ('Critical Intercept','Midway as \"AF\" — May 1942'),
            ('Outcome','Battle of Midway (June 4–7, 1942): Japan loses 4 carriers in one day'),
        ],
        demo_html='<div class="demo-section" data-cipher="jn-25"></div>',
        significance_p="Station HYPO is the most consequential military signals intelligence success in the Pacific War. Commander Joseph Rochefort's team — working in an improvised basement workspace under Pearl Harbor — broke enough of the JN-25 additive cipher to identify that the Japanese were targeting a location they called 'AF.' Rochefort confirmed AF meant Midway Atoll by arranging a phony radio message from Midway claiming its water distillation plant had broken down. Two days later, Japanese traffic mentioned that 'AF' had water problems. Admiral Nimitz deployed three carriers to the ambush position. On June 4, 1942, the US sank all four Japanese fleet carriers in a single afternoon — the turning point of the Pacific War.",
        panels_list=[
            ('📜','Before Pearl Harbor','<p>Station HYPO began as CAST (Manila) and HYPO (Pearl Harbor) — two of three US Navy intercept stations tasked with breaking Japanese codes alongside OP-20-G in Washington. By late 1941, the teams had partial JN-25 coverage. The Pearl Harbor attack (December 7, 1941) came through a diplomatic channel — the MAGIC decrypt program at Washington — not JN-25. Rochefort\'s team had been focused on fleet movements, not diplomatic signals, and the attack used different communications than expected. The failure haunted the unit and drove them to unprecedented effort through the following months.</p>'),
            ('🔬','The JN-25 Break','<p>JN-25 used a two-layer system: a codebook of five-digit groups for words and phrases, then additively enciphered using a five-digit additive book. Breaking it required exploiting stereotyped message openings (known-plaintext attacks on weather reports and operational routine messages), building up a partial additive recovery, and stripping the additive to reveal underlying code groups. Rochefort\'s team worked 20-hour days in conditions of extreme stress, deliberately under-reporting their confidence level to Washington to avoid being overruled before the Midway operation could be validated.</p>'),
            ('⚔️','Midway: The Intelligence Win','<p>In May 1942, Rochefort\'s analysts identified a Japanese operation against "AF" — an unknown map reference. Rochefort proposed the deception: Midway would send in plain language that its water distillation plant had failed. Within 48 hours, Japanese traffic mentioned the status of "AF\'s water supply." Washington was convinced. Nimitz accepted HYPO\'s assessment and dispatched carriers Enterprise, Hornet, and Yorktown to the Midway ambush position. The battle that followed on June 4–7 sank four Japanese fleet carriers — carriers Japan could not replace — against the loss of Yorktown. The Pacific strategic situation shifted permanently.</p>'),
            ('💔','The Aftermath','<p>Despite the Midway victory being largely attributable to HYPO\'s work, Rochefort was reassigned in October 1942 after a bureaucratic conflict with Washington over credit for the Midway intelligence. He spent the remainder of the war in less significant positions. The injustice was formally acknowledged in 1985 when he was posthumously awarded the Distinguished Service Medal. His tombstone reads: "His work changed the course of history."</p>'),
        ],
        related_list=[
            ('jn-25.html','JN-25','The cipher HYPO broke'),
            ('purple.html','Purple Machine','US diplomatic code MAGIC parallel operation'),
            ('enigma.html','Enigma','Parallel effort at Bletchley Park'),
        ],
        prev_s='cabinet-noir', prev_n='Cabinet Noir',
        next_s='bletchley-park', next_n='Bletchley Park',
    ),
    dict(
        slug='bletchley-park',
        title='Bletchley Park',
        og_desc='Bletchley Park (Station X) was the British WWII signals intelligence headquarters where 10,000 people broke Enigma, Lorenz, and dozens of other Axis ciphers — arguably shortening the war by two years.',
        hall_path='halls/codebreakers.html',
        hall_label='Hall X: Hall of Codebreakers',
        era_badge='WWII · 1939–1945',
        sec_badge='Historical',
        eyebrow='Hall X · Codebreakers',
        tagline="Station X — where 10,000 people cracked Enigma, Lorenz, and Fish, and the world's first programmable computer was born.",
        facts_items=[
            ('Location','Bletchley, Buckinghamshire, England'),
            ('Operation','September 1939 – September 1945'),
            ('Personnel','~10,000 at peak (75% women)'),
            ('Key Breaks','Enigma (Turing/Welchman), Lorenz (Bill Tutte / Heath Robinson)'),
            ('Hardware','Bombe electromechanical computer; Colossus (\'43)'),
            ('Estimated impact','Shortened WWII by 2–4 years (Eisenhower estimate)'),
        ],
        demo_html='<div class="demo-section" data-cipher="enigma"></div>',
        significance_p="Bletchley Park is arguably the most consequential intelligence operation in modern history. At its peak in 1944, over 10,000 people processed Axis communications at the Victorian country estate 80km north of London — roughly 75% were women, largely invisible in the immediate postwar historical record. The Turing-Welchman Bombe broke Enigma traffic at industrial scale. Bill Tutte's reconstruction of the Lorenz SZ40/42 cipher machine — from a single transmission, with no machine in hand — led to Colossus, the world's first programmable electronic computer, designed to process Lorenz traffic. The operation remained classified until the 1970s; its participants kept the secret for thirty years.",
        panels_list=[
            ('🏛️','The Organization','<p>Bletchley Park housed multiple operational sections: Hut 3 (analysis and intelligence reporting), Hut 6 (breaking Enigma Army and Air Force), Hut 8 (Naval Enigma, Turing\'s section), and the combined effort against the Lorenz cipher known as the Fish section. Adjacent outstations handled traffic interception. The facility consumed enormous resources — thousands of Bombe machines, relay of intercepts from hundreds of listening stations, translation from German, Italian, and Japanese by specialist linguists.</p>'),
            ('⚙️','The Bombe','<p>Alan Turing\'s Bombe (refined by Gordon Welchman\'s diagonal board) was an electromechanical computer designed to search the vast key space of Enigma settings by exploiting cribs (known-plaintext attacks using stereotyped openings like weather reports). A single Bombe had 36 drum sets replicating Enigma rotors and could test settings at high speed. By 1943, over 200 Bombes were running at Bletchley and its outstation at Eastcote. On any given day they produced 3–5 daily keys unlocking thousands of messages.</p>'),
            ('⚙️','Colossus and the Lorenz Break','<p>The Lorenz SZ40/42 cipher machine encrypted the highest-level German strategic communications — Hitler to his field commanders. Bill Tutte, a Cambridge mathematician, reconstructed its entire internal structure from a single operator error (a lengthy message re-transmitted with slightly different settings). Tommy Flowers built Colossus — 1,500 vacuum tubes, 5,000 character-per-second paper tape reader — to automate the statistical analysis Tutte had designed. Colossus is the first operational programmable electronic computer, predating ENIAC by two years.</p>'),
            ('💔','Secrecy and After','<p>Under Churchill\'s direct order, Bletchley staff were sworn to absolute secrecy. The operation was not officially acknowledged until F.W. Winterbotham\'s 1974 book <em>The Ultra Secret</em>. Turing was prosecuted for homosexuality in 1952, chemically castrated under court order, and died in 1954 in circumstances consistent with suicide. He was posthumously pardoned by royal pardon in 2013. Joan Clarke, Dilly Knox, Mavis Batey, and many female veterans also went decades without public recognition of their contributions.</p>'),
        ],
        related_list=[
            ('enigma.html','Enigma','The machine Bletchley broke'),
            ('lorenz.html','Lorenz','The Fish cipher broken by Colossus'),
            ('kerckhoffs.html',"Kerckhoffs's Principle","Why Enigma failed despite secrecy"),
        ],
        prev_s='station-hypo', prev_n='Station HYPO',
        next_s='kerckhoffs', next_n="Kerckhoffs's Principle",
    ),
    dict(
        slug='kerckhoffs',
        title="Kerckhoffs's Principle",
        og_desc="Auguste Kerckhoffs's 1883 principle — 'A cipher should be secure even if everything about the system, except the key, is public knowledge' — is the bedrock of modern cryptographic design.",
        hall_path='halls/modern-crypto.html',
        hall_label='Hall XI: Modern Cryptography',
        era_badge='Foundational · 1883',
        sec_badge='Principle (not a cipher)',
        eyebrow='Hall XI · Modern Cryptography',
        tagline="The most important rule in cryptography: assume your adversary knows everything about your system except the key.",
        facts_items=[
            ('Author','Auguste Kerckhoffs van Nieuwenhof (1835–1903)'),
            ('Published','La Cryptographie Militaire, 1883'),
            ('Principle','System security must depend only on key secrecy, not system secrecy'),
            ('Shannon equivalent','Shannon\'s maxim: "the enemy knows the system"'),
            ('Violated by','Security through obscurity, DRM, most "proprietary" crypto'),
            ('Modern Lesson','Open design allows public scrutiny that defeats hidden flaws'),
        ],
        demo_html=widget('kpDemo', 'Secret message…', 'HELLO WORLD',
                         'Message — key is public, algorithm is public, but only you have THE KEY') + """
  <script>
    // Demonstrates Kerckhoffs: algorithm is Caesar (public), key is known (public for demo),
    // but in real Kerckhoffs-compliant systems ONLY the key is secret.
    function kpDemo(t) {
      const shift = 13; // In Kerckhoffs-compliant system: algorithm public (Caesar),
      // key PUBLIC IN THIS DEMO. Only in real use would key be kept private.
      const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const enc = t.toUpperCase().replace(/[^A-Z]/g,'').split('').map(c=>{
        const i=A.indexOf(c); return i>=0?A[(i+shift)%26]:c;
      }).join('');
      return enc + ' ← (Algorithm: Caesar +13 [PUBLIC]. Key: 13 [PUBLIC in demo, secret in real use])';
    }
  </script>""",
        significance_p="Kerckhoffs's Principle — articulated by Dutch linguist Auguste Kerckhoffs in his 1883 paper <em>La Cryptographie Militaire</em> — is the foundational design rule of modern cryptography. It states that a cryptographic system must remain secure even if everything about the system, except the key, is publicly known. The corollary is profound: security through obscurity (hiding the algorithm) is not security at all, because algorithms can be reverse-engineered, leaked, or discovered; only a short, easily changed key needs to remain secret. Every major cipher used today — AES, RSA, the Diffie-Hellman key exchange, TLS — is fully published and open to public scrutiny, with security depending entirely on key secrecy.",
        panels_list=[
            ('📜','The Six Requirements','<p>Kerckhoffs stated six design criteria for military ciphers: (1) the system must be practically, if not mathematically, indecipherable; (2) <strong>the system must not require secrecy and can be stolen by the enemy without causing trouble</strong>; (3) it must be easy to communicate and remember without written notes; (4) the cipher must be applicable to telegraph correspondence; (5) the apparatus must be portable and operable by a single person; (6) the system must be easy to use. Criterion 2 is what posterity calls "Kerckhoffs\'s Principle."</p>'),
            ('🔬','Why Secrecy Through Obscurity Fails','<p>Obscuring an algorithm provides only temporary security — the time until the algorithm is reverse-engineered, the circuit board is captured, or an insider defects. Once exposed, every message ever sent with that algorithm can potentially be re-examined. A Kerckhoffs-compliant system with a strong key: even if the algorithm is known for decades, every message remains protected by its unique key. Changing a compromised key takes minutes; redesigning and deploying a new secret algorithm takes years and may introduce new weaknesses.</p>'),
            ('🔬','Enigma\'s Critical Violation','<p>Nazi Germany fundamentally violated Kerckhoffs\'s Principle when it believed Enigma\'s machine design could be kept permanently secret. Captured machines (from the submarine U-110 and elsewhere), captured key documents, and operator errors gave Bletchley Park everything needed to break the system — because the underlying cipher machine\'s wiring was not designed to be secure if known. A Kerckhoffs-compliant system would have been designed so that machine capture only helped if the specific daily key settings were also known.</p>'),
            ('🔑','The Modern Implication','<p>AES was selected by the US NIST through a public five-year competition (1997–2001). The algorithm was published, attacked by the world\'s best cryptanalysts, analyzed for weaknesses, and refined through open peer review. The competition\'s winning algorithm — designed by Joan Daemen and Vincent Rijmen (Belgian) — is used in virtually every encrypted communication on earth. Its security has been publicly scrutinized for 25 years. This is Kerckhoffs\'s Principle in action at planetary scale.</p>'),
        ],
        related_list=[
            ('aes.html','AES','The most successful Kerckhoffs-compliant cipher'),
            ('enigma.html','Enigma','What happens when you violate the principle'),
            ('bletchley-park.html','Bletchley Park','How obscurity-dependent systems were broken'),
        ],
        prev_s='bletchley-park', prev_n='Bletchley Park',
        next_s='venona', next_n='VENONA Project',
    ),
    dict(
        slug='venona',
        title='VENONA Project',
        og_desc='VENONA (1943–1980) was the US Army codebreaking effort that decrypted thousands of Soviet intelligence cables by exploiting key reuse in one-time pads — revealing Julius Rosenberg, Kim Philby, and the Cambridge Five.',
        hall_path='halls/codebreakers.html',
        hall_label='Hall X: Hall of Codebreakers',
        era_badge='Cold War · 1943–1980',
        sec_badge='Partial break (key reuse exploit)',
        eyebrow='Hall X · Codebreakers',
        tagline='Soviet intelligence used one-time pads — theoretically unbreakable. Then they reused them. The NSA read the mail for forty years.',
        facts_items=[
            ('US Agency','US Army Signals Security Agency (later NSA)'),
            ('Soviet Target','NKVD / KGB / GRU diplomatic and intelligence cables'),
            ('Period','1943–1980 (declassified 1995)'),
            ('Key flaw','Soviet one-time pad key pages reprinted and reissued under WWII pressure'),
            ('Revelations','Julius and Ethel Rosenberg; Kim Philby; Cambridge Five; Donald Maclean'),
            ('Modern Lesson','Even perfect ciphers fail when key generation is flawed'),
        ],
        demo_html='<div class="demo-section" data-cipher="one-time-pad"></div>',
        significance_p="VENONA is the definitive proof that no cipher is more secure than its key generation and management. The Soviets used one-time pads — which are mathematically unbreakable when used correctly — for intelligence traffic between Moscow and their foreign stations. But in 1942–1943, under acute wartime production pressure, Soviet cipher authorities reprinted and reissued key pages that had already been used. American cryptanalysts at the Army's Arlington Hall station discovered the key reuse, enabling partial decryption of thousands of messages. The VENONA decrypts identified Julius Rosenberg (atomic espionage), Kim Philby (British SIS mole), Donald Maclean and Guy Burgess (Cambridge Five), and dozens of other Soviet sources inside the US and British governments — intelligence revelations that shaped the Cold War for forty years.",
        panels_list=[
            ('📜','The Key Reuse Disaster','<p>A genuine one-time pad requires that each key page be used exactly once and then destroyed. In late 1942, Soviet cipher production facilities, overwhelmed by wartime demand, reprinted key material that had already been distributed. The result: some portions of the 1942–1944 NKVD traffic used the same additive key material twice. When Arlington Hall analyst Richard Hallock noticed statistical anomalies suggesting two messages had been enciphered with the same "depth," the VENONA project began reconstructing the additive books and stripping them from messages.</p>'),
            ('🔬','How the Break Worked','<p>The cryptanalytic attack exploited "depth" — two messages enciphered with the same OTP key. If plaintext P₁ and P₂ are enciphered with the same key K as C₁ = P₁ ⊕ K and C₂ = P₂ ⊕ K, then C₁ ⊕ C₂ = P₁ ⊕ P₂ — a "running key" cipher with both messages as mutually known-plaintext constraints. By exploiting linguistic regularities in Soviet diplomatic Russian and known codeword patterns, analysts gradually reconstructed the plaintext and then the actual additive key pages themselves.</p>'),
            ('🕵️','The Revelations','<p>VENONA decrypts identified: Julius Rosenberg (codeword LIBERAL) and Ethel Rosenberg (codeword ETHEL) passing atomic weapons data to Moscow; Klaus Fuchs (also in atomic network); Kim Philby (British head of anti-Soviet SIS operations — simultaneously Moscow Center\'s most senior British agent); Donald Maclean (head of American desk at British Foreign Office); Guy Burgess, Anthony Blunt, and John Cairncross (completing the Cambridge Five). The Rosenbergs were executed in 1953; VENONA remained classified, so the strongest evidence against them could not be used in their trial.</p>'),
            ('🔒','The 37-Year Secret','<p>VENONA was not declassified until 1995. For forty years, American officials who knew Soviet agents had been identified through VENONA could not publicly explain their certainty without exposing the program. Senator Joseph McCarthy\'s vague accusations of mass Communist infiltration were partly fueled by officials who knew Soviet penetration was real — but could not say how they knew. The deception of hiding VENONA distorted American political discourse for a generation.</p>'),
        ],
        related_list=[
            ('one-time-pad.html','One-Time Pad','The cipher VENONA exploited'),
            ('diana-cryptosystem.html','Diana Cryptosystem','US Army field OTP designed to avoid VENONA-type failure'),
            ('station-hypo.html','Station HYPO','US SIGINT Pacific parallel'),
        ],
        prev_s='kerckhoffs', prev_n="Kerckhoffs's Principle",
        next_s='sigsaly', next_n='SIGSALY',
    ),
    dict(
        slug='sigsaly',
        title='SIGSALY — The Encrypted Speech System',
        og_desc="SIGSALY (1943–1946) was the world's first perfectly secure voice encryption system — a 50-ton machine using vinyl phonograph records as one-time pads to protect Roosevelt-Churchill phone calls during WWII.",
        hall_path='halls/machines.html',
        hall_label='Hall VII: Mechanical Cipher Machines',
        era_badge='WWII · 1943–1946',
        sec_badge='Unbroken',
        eyebrow='Hall VII · Mechanical Machines',
        tagline="Twelve rooms, 50 tons, two synchronized phonograph records — the system that kept Churchill's phone calls secret from Hitler.",
        facts_items=[
            ('Development','Bell Laboratories (Claude Shannon, et al.), 1941–1943'),
            ('Security','Theoretically unbreakable — voice one-time pad'),
            ('Machine size','50 tons; 40+ racks of vacuum tubes; 12 rooms'),
            ('Synchronization','Matched vinyl phonograph records as key material'),
            ('Lines installed','Washington D.C., London, Paris, Algiers, Brisbane, Guam,  SHAPE HQ'),
            ('Modern Lesson','The first practical secure voice communication predates digital age by 50 years'),
        ],
        demo_html=widget('sigDemo', 'Spoken phrase…', 'ATTACK AT DAWN CONFIRM',
                         'Spoken message (SIGSALY digitized and OTP-enciphered it)') + """
  <script>
    // Conceptual demo: show SIGSALY's core innovation — voice quantized to digits then OTP-encrypted
    function sigDemo(t) {
      // Simulate 6-level PCM quantization then XOR with 'key'
      const bytes = [];
      for (let i=0; i<Math.min(t.length,20); i++) {
        const q = (t.charCodeAt(i) % 6) + 1; // 6-level quantization
        const k = (i * 37 + 19) % 6 + 1;     // 'random' key digit
        bytes.push(((q + k - 2) % 6) + 1);   // modulo-6 add
      }
      return 'Quantized PCM + OTP: [' + bytes.join(' ') + '] ← 6-level voice samples encrypted with one-time pad digits';
    }
  </script>""",
        significance_p='SIGSALY was the world\'s first secure voice communication system and the first operational digital voice to be transmitted over radio. Bell Laboratories engineers — including Claude Shannon, who used his SIGSALY work as the foundation for his 1945 classified paper "A Mathematical Theory of Cryptography" (later the basis of information theory) — designed a system that digitized speech using 6-level pulse-code modulation, encrypted each sample with a random digit from a vinyl phonograph record, and transmitted the encrypted digital signal. An identical phonograph record, synchronized within milliseconds, decrypted at the receiving end. Because the noise levels on the phonograph records were genuinely random, the system had the same theoretical security as a written one-time pad.',
        panels_list=[
            ('📜','Context: Churchill-Roosevelt Communications','<p>By mid-1942, both Roosevelt and Churchill knew that AT&T\'s A-3 scrambler system — which they had been using for transatlantic phone calls — had been broken by Germany\'s Forschungsamt intercept service. German intelligence was reading their phone calls. Bell Labs was commissioned to build a replacement at the highest urgency. The resulting SIGSALY system was operational by July 1943, just in time for the buildup to Operation Overlord planning.</p>'),
            ('⚙️','How SIGSALY Worked','<p>SIGSALY converted speech to digital form using 6-level quantization at 50 samples per second — the first operational PCM voice digitization in history. Each 2-bit sample was added modulo 6 to a random digit from a specially recorded vinyl phonograph record. The encrypted samples were transmitted as frequency-shift keying on shortwave radio. At the receiver, an identical phonograph record played in exact synchronization and the subtraction was performed, recovering the original PCM stream. The recovered PCM was then converted back to analog speech through a vocoder (voice coder) — also a SIGSALY invention.</p>'),
            ('🔬','Shannon\'s Foundation','<p>Claude Shannon worked on SIGSALY at Bell Labs from 1941. His classified 1945 paper "A Mathematical Theory of Cryptography" — which proved that the one-time pad is the only provably perfect cipher — was directly motivated by SIGSALY\'s design. Shannon\'s 1948 paper "A Mathematical Theory of Communication," the foundation of information theory, used the same mathematical framework. The world\'s greatest theoretical contribution to communications security came directly from the problem of keeping Churchill\'s phone calls private.</p>'),
            ('📡','Global Network','<p>Twelve SIGSALY terminals were installed worldwide: the Pentagon, 10 Downing Street, SHAEF headquarters, Algiers (for Eisenhower), Brisbane (MacArthur), Manila, Guam, and others. Each terminal weighed approximately 50 tons and occupied 12 large rooms. The matched phonograph records were physically carried to both terminals and played exactly once before being destroyed. When Churchill called Roosevelt, the records at both ends were started simultaneously; if synchronization drifted, the call could not continue. The record pairs were produced at a single Bell Labs facility and shipped under armed guard.</p>'),
        ],
        related_list=[
            ('one-time-pad.html','One-Time Pad','SIGSALY\'s mathematical foundation'),
            ('lorenz.html','Lorenz Cipher','Axis equivalent for teleprinter traffic'),
            ('kerckhoffs.html',"Kerckhoffs's Principle",'Why SIGSALY lasted the war securely'),
        ],
        prev_s='venona', prev_n='VENONA Project',
        next_s='', next_n='',
    ),
]

if __name__ == '__main__':
    for spec in PAGES:
        out = wrap(**spec)
        dest = os.path.join(OUT, spec['slug'] + '.html')
        with open(dest, 'w', encoding='utf-8') as f:
            f.write(out)
        print(f'  Created {dest}')
    print(f'Done. {len(PAGES)} pages written.')
