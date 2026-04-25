#!/usr/bin/env python3
"""Build Phase 12 codebreaker biography pages."""
import os

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(REPO, 'ciphers')

BIO_STYLE = """<style>
  .bio-hero {
    display:flex;gap:2rem;align-items:flex-start;
    background:var(--s1);border:1px solid var(--gold-b);
    border-radius:8px;padding:1.75rem;margin:2rem 0;
  }
  .bio-portrait {
    width:120px;height:120px;min-width:120px;border-radius:50%;
    background:var(--s2);border:2px solid var(--gold-b);
    display:flex;align-items:center;justify-content:center;
    font-size:3rem;
  }
  .bio-intro h2 { color:var(--gold);margin:0 0 .5rem; font-size:1.35rem; }
  .bio-intro p  { line-height:1.7;color:var(--fg-dim);margin:.5rem 0; }
  .bio-dates    { font-size:.85rem;color:var(--gold-lt);font-family:var(--fm); }
  @media(max-width:600px) { .bio-hero { flex-direction:column; } }
</style>"""

def wrap_bio(slug, title, dates, og_desc, hall_path, hall_label, era_badge, sec_badge,
             eyebrow, tagline, facts_items, bio_para, portrait_emoji,
             significance_p, panels_list, related_list, prev_s, prev_n, next_s, next_n):
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
  {BIO_STYLE}
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
<div class="bio-hero">
  <div class="bio-portrait">{portrait_emoji}</div>
  <div class="bio-intro">
    <h2>{title}</h2>
    <div class="bio-dates">{dates}</div>
    <p>{bio_para}</p>
  </div>
</div>
<div class="exhibit-layout">
  <div class="exhibit-main">
    <div class="cipher-significance"><h3>Why This Person Matters</h3><p>{significance_p}</p></div>
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


BIOS = [
    dict(
        slug='rochefort',
        title='Joseph Rochefort',
        dates='1900 – 1976',
        og_desc='Commander Joseph Rochefort led Station HYPO and broke JN-25 in 1942, providing the intelligence that won the Battle of Midway and turned the tide of the Pacific War.',
        hall_path='halls/codebreakers.html',
        hall_label='Hall X: Hall of Codebreakers',
        era_badge='WWII · Pacific',
        sec_badge='Codebreaker Biography',
        eyebrow='Hall X · Codebreakers',
        tagline="The man in the bathrobe in the basement who won the Battle of Midway.",
        portrait_emoji='⚓',
        facts_items=[
            ('Born','1900, Dayton, Ohio'),
            ('Died','1976, Torrance, California'),
            ('Branch','US Navy'),
            ('Role','Commander, Station HYPO (Combat Intelligence Unit, Pearl Harbor)'),
            ('Key Break','JN-25 — Imperial Japanese Navy main operational cipher'),
            ('Battle won','Midway, June 4–7, 1942'),
            ('Posthumous honor','Distinguished Service Medal (1985)'),
        ],
        bio_para="Joseph Rochefort was a US Navy codebreaker, linguist, and intelligence officer who commanded Station HYPO — the Combat Intelligence Unit at Pearl Harbor — during the six months following the December 1941 attack. Working in an improvised basement operations center, often sleeping in a bathrobe beside his desk, Rochefort led the team that cracked enough of the Japanese JN-25 additive cipher to name the target of Japan's next major offensive. His intelligence enabled Admiral Nimitz to position three carriers at Midway; the resulting battle sank four Japanese fleet carriers and ended Japan's offensive capability in the Pacific.",
        significance_p="Rochefort's Midway intelligence is among the most consequential acts of individual analytical achievement in military history. By correctly identifying Japan's target as 'AF' (Midway Atoll), convincing a skeptical Washington through the deception operation, and overriding OP-20-G's competing assessment, he delivered a strategic surprise that Japan never recovered from. The injustice of his subsequent reassignment — as a result of bureaucratic rivalry with Washington — was not formally acknowledged until 1985, nine years after his death, when President Reagan ordered the posthumous Distinguished Service Medal. The Navy officially named a building at the National Security Agency's Hawaii facility in his honor.",
        panels_list=[
            ('📜','The Road to HYPO','<p>Rochefort served as a naval intelligence officer and Japanese language student in Japan during the 1920s, developing both his linguistic skills and his understanding of Japanese military culture. By the late 1930s he was deeply embedded in signals intelligence work, assigned to the communications intelligence unit that would become Station HYPO. After the Pearl Harbor attack, he requested and received command of the unit, which he immediately placed on a wartime operational footing — 20-hour days, cots in the basement, and a single-minded focus on JN-25.</p>'),
            ('🔬','The Midway Intelligence','<p>In May 1942, Rochefort\'s team read fragmentary JN-25 traffic suggesting an attack on a location coded "AF." To confirm this was Midway, Rochefort arranged for the Midway garrison to send a plain-language radio message claiming their water distillation plant had broken down. Within two days, intercepted Japanese traffic noted "AF" was having water problems. Washington was convinced. Admiral Nimitz deployed his three remaining carriers — Enterprise, Hornet, and the hastily repaired Yorktown — to the Midway ambush position. On June 4, 1942, US dive bombers sank four Japanese carriers in under ten minutes.</p>'),
            ('💔','Injustice and Legacy','<p>Rochefort was relieved of command in October 1942, ostensibly for his role in providing Nimitz accurate intelligence that contradicted OP-20-G\'s assessment. The bureaucratic dispute centered on credit for the Midway intelligence; Washington officers who had opposed Rochefort\'s analysis succeeded in having him reassigned to a floating drydock command — a deliberate humiliation. He spent the remainder of the war out of cryptanalysis. The Naval Security Group formally recommended a posthumous Distinguished Service Medal in 1958; the Navy repeatedly failed to act. President Reagan finally signed the award in 1985.</p>'),
        ],
        related_list=[
            ('station-hypo.html','Station HYPO','Rochefort\'s command — the full story'),
            ('jn-25.html','JN-25','The cipher he broke'),
            ('purple.html','Purple Machine','Parallel MAGIC operation'),
        ],
        prev_s='', prev_n='',
        next_s='beurling', next_n='Arne Beurling',
    ),
    dict(
        slug='beurling',
        title='Arne Beurling',
        dates='1905 – 1986',
        og_desc='Swedish mathematician Arne Beurling broke the German Siemens T52 Geheimschreiber cipher in two weeks in 1940 — an achievement described by NSA historians as perhaps the greatest individual cryptanalytic feat in history.',
        hall_path='halls/codebreakers.html',
        hall_label='Hall X: Hall of Codebreakers',
        era_badge='WWII · Sweden',
        sec_badge='Codebreaker Biography',
        eyebrow='Hall X · Codebreakers',
        tagline="He solved the Geheimschreiber teletype cipher with pencil and paper in two weeks. He never explained how.",
        portrait_emoji='✏️',
        facts_items=[
            ('Born','February 3, 1905, Gothenburg, Sweden'),
            ('Died','November 20, 1986, Princeton, New Jersey'),
            ('Education','Uppsala University — PhD 1933'),
            ('Profession','Mathematician (complex analysis, harmonic analysis)'),
            ('Key Break','Siemens T52 Geheimschreiber — June 1940 (two weeks)'),
            ('Source','Swedish military intelligence (Försvarets radioanstalt, FRA)'),
            ('Legacy','Mathematical analysis, NSA hired him 1954'),
        ],
        bio_para="Arne Beurling was one of the 20th century's greatest mathematicians — his work on complex analysis, harmonic analysis, and potential theory remains foundational. In June 1940, working for Swedish military intelligence with nothing but traffic intercepts and pencil and paper, he reconstructed the wiring of the Siemens T52 Geheimschreiber in approximately two weeks. Sweden was neutral, and the intelligence was never shared with the Allies. Beurling later joined the Institute for Advanced Study in Princeton, where he became a colleague of Albert Einstein.",
        significance_p="Beurling's Geheimschreiber break stands as the supreme individual cryptanalytic achievement of the WWII era. The T52 was a rotor-based teleprinter cipher that German forces considered completely secure — it encrypted the high-level staff communications between Germany and German forces in Norway, running over the Swedish telephone network under a wartime agreement. NSA historians who later examined Beurling's work described it as incomprehensible in its depth and concision. When asked how he did it, Beurling famously replied: 'A magician does not reveal his secrets.' His solution was fully re-derived only in the 1990s when Swedish archives were opened.",
        panels_list=[
            ('🔬','The Geheimschreiber Problem','<p>The Siemens T52 (also known as the Geheimschreiber, "secret writer") was a rotor-based teleprinter encryption machine used for high-level German military communications. Unlike Enigma, which encrypted individual characters via keyboard, the T52 encrypted the Baudot teleprinter code of text fed through it automatically — a stream cipher with multiple interacting rotors. Beurling had only traffic intercepts, no physical machine, and no prior knowledge of the T52\'s design. His reconstruction of the machine\'s logical structure remains the most celebrated example of reverse-engineering a cipher from ciphertext alone.</p>'),
            ('📜','The Two Weeks','<p>In June 1940, German forces occupied Norway, and significant German military traffic began flowing through the Swedish telephone network (under a transit agreement the Swedes had concluded for political reasons). Swedish FRA intercepted this traffic. Beurling was given the intercepts. In approximately two weeks — the exact duration is disputed but consistently cited as "about two weeks" — he produced a working description of the T52\'s operation sufficient to decrypt the traffic. Sweden could read German high-command communications for the remainder of the war, including advance intelligence about Operation Barbarossa.</p>'),
            ('🏛️','After the War','<p>Beurling joined the Institute for Advanced Study at Princeton in 1954 — the same institution where Einstein had worked. He became a consultant to the NSA, where his mathematical approaches to cryptanalysis influenced the development of modern cryptographic theory. His academic work in mathematics — particularly "Beurling\'s theorem" in complex analysis and his work on spectral synthesis in harmonic analysis — is unrelated to cryptography but of equivalent depth. He left no memoir of the Geheimschreiber work and spoke of it only obliquely before his death in 1986.</p>'),
        ],
        related_list=[
            ('geheimschreiber.html','Geheimschreiber','The T52 cipher machine he broke'),
            ('lorenz.html','Lorenz Cipher','The other major German teleprinter cipher broken at Bletchley'),
            ('bletchley-park.html','Bletchley Park','Parallel WWII Allied cryptanalysis'),
        ],
        prev_s='rochefort', prev_n='Joseph Rochefort',
        next_s='dilly-knox', next_n='Dilly Knox',
    ),
    dict(
        slug='dilly-knox',
        title='Dilly Knox',
        dates='1884 – 1943',
        og_desc='Alfred Dillwyn "Dilly" Knox was the British codebreaker who solved the Enigma wiring before Turing, broke the Abwehr Enigma, and was the first to crack the Italian commercial Enigma variant.',
        hall_path='halls/codebreakers.html',
        hall_label='Hall X: Hall of Codebreakers',
        era_badge='WWI/WWII · Britain',
        sec_badge='Codebreaker Biography',
        eyebrow='Hall X · Codebreakers',
        tagline="The eccentric classicist who first reconstructed Enigma rotor wiring — years before Turing arrived at Bletchley.",
        portrait_emoji='📜',
        facts_items=[
            ('Born','July 23, 1884, Oxford'),
            ('Died','February 27, 1943, Hughenden, Buckinghamshire'),
            ('Education','Eton; King\'s College, Cambridge (Classics)'),
            ('WWI','Room 40, Naval Intelligence — broke German naval codes'),
            ('Interwar','Reconstructed Enigma wiring from commercial model, ~1934'),
            ('WWII','Broke Abwehr Enigma; Italian commercial Enigma; ISOS traffic'),
            ('Protégées','Mavis Batey, Margaret Rock'),
        ],
        bio_para="Alfred Dillwyn Knox — universally 'Dilly' — was a classical scholar who became Britain's greatest cryptanalyst of the pre-computer era. He deciphered German naval codes in WWI from Room 40, solved the commercial Enigma in the 1930s, and at Bletchley Park broke the Abwehr (German intelligence) Enigma variant — the system that protected Germany's spy networks across occupied Europe. A notoriously eccentric figure who often worked from his bathtub, Knox died of lymphoma in early 1943, never learning the full strategic impact of his work.",
        significance_p="Dilly Knox's contributions span thirty years of British cryptanalysis. In WWI, his Room 40 work contributed to the intelligence behind the Zimmermann Telegram interception. In the 1930s, working with no inside knowledge of the German military system, he mathematically reconstructed the commercial Enigma's rotor wiring and cipher chain — a crucial theoretical foundation for later work. At Bletchley, he led the team (including Mavis Batey and Margaret Rock) that broke Abwehr Enigma in 1941; decrypts from this system, codenamed ISOS, revealed the identities of German agents in Britain and provided critical intelligence for D-Day deception operations.",
        panels_list=[
            ('📜','Room 40 and the Zimmermann Telegram','<p>During WWI, Knox worked in Room 40 — the Naval Intelligence Division\'s codebreaking section. His analytical framework for attacking substitution-based cipher systems was developed here. The Zimmermann Telegram (1917), which helped bring the United States into WWI, was decrypted in Room 40 using techniques Knox helped develop. After the war, he remained in government signals intelligence work, becoming one of only a handful of people who bridged the WWI and WWII British cryptanalytic communities.</p>'),
            ('🔬','Solving Enigma\'s Wiring','<p>Commercial Enigma machines were available for purchase in the 1920s. Knox obtained one and, by approximately 1934, had deduced the reflector wiring and the method by which the machine generated its cipher alphabet. His critical insight was the "crib" attack on stereotyped message openings — the same analytical foundation later systematized by Turing and Welchman as the Bombe\'s operating principle. Knox\'s pre-war work was the analytical predecessor of every subsequent Allied Enigma success.</p>'),
            ('👩','Mavis Batey and the Female Codebreakers','<p>Knox actively recruited women as cryptanalysts, selecting for intellectual independence and lateral thinking rather than classical qualifications. Mavis Lever (later Batey) and Margaret Rock were among his most successful recruits; both were directly responsible for major breaks. Knox\'s approach to mentoring female codebreakers represented a significant departure from the male-dominated academic and intelligence establishment of the era. Batey\'s role in breaking Abwehr Enigma was crucial to the Double Cross System\'s success in containing German agent networks in Britain.</p>'),
        ],
        related_list=[
            ('enigma.html','Enigma','The machine Knox spent his life attacking'),
            ('bletchley-park.html','Bletchley Park','His WWII home'),
            ('mavis-batey.html','Mavis Batey','His most celebrated protégée'),
        ],
        prev_s='beurling', prev_n='Arne Beurling',
        next_s='yardley', next_n='Herbert Yardley',
    ),
    dict(
        slug='yardley',
        title='Herbert Yardley',
        dates='1889 – 1958',
        og_desc="Herbert Osborne Yardley founded America's Black Chamber in 1919, broke Japanese diplomatic codes at the 1921 Washington Naval Conference, and then infamously published the secrets in his 1931 bestseller.",
        hall_path='halls/codebreakers.html',
        hall_label='Hall X: Hall of Codebreakers',
        era_badge='Interwar · USA',
        sec_badge='Codebreaker Biography',
        eyebrow='Hall X · Codebreakers',
        tagline="He built American signals intelligence from scratch — then blew it all open in a bestselling book.",
        portrait_emoji='🇺🇸',
        facts_items=[
            ('Born','April 13, 1889, Worthington, Indiana'),
            ('Died','August 7, 1958, Washington, D.C.'),
            ('Organization','MI-8 (WWI) → American Black Chamber (1919–1929)'),
            ('Key Break','Japanese diplomatic codes — Washington Naval Conference 1921'),
            ('Controversy','Published <em>The American Black Chamber</em> (1931)'),
            ('Impact','Caused the US to close the Black Chamber; Japanese code changes'),
            ('Later','RCMP codebreaker WWII; NSA precursor work; novelist'),
        ],
        bio_para="Herbert Yardley was the founder of American signals intelligence — a self-taught cryptographer from Indiana who talked his way into Army intelligence in WWI and built America's first permanent codebreaking organization. The 'American Black Chamber' (officially the Cipher Bureau) operated 1919–1929 in New York, funded jointly by the State Department and the Army. Its greatest success was reading Japanese diplomatic traffic during the 1921–22 Washington Naval Conference, giving American negotiators advance knowledge of Japan's bottom-line positions. In 1929, Secretary of State Henry Stimson closed the bureau — reportedly saying 'Gentlemen do not read each other's mail.' Two years later, Yardley published everything.",
        significance_p="Yardley's significance is twofold and paradoxical. He created American signals intelligence — transforming the ad-hoc WWI code-cracking units into a permanent professional organization — and he destroyed it by publishing its methods and successes in a bestselling 1931 book. His publication caused Japan to change its diplomatic codes immediately; it prompted congressional hearings; and it helped motivate the Communications Act of 1934 (which criminalized publication of intercepted communications). His rehabilitation began in WWII when he worked for the RCMP and later for other Allied agencies, and was completed posthumously when later declassification confirmed the broad accuracy of his 1931 claims.",
        panels_list=[
            ('📜','Building the Black Chamber','<p>Yardley joined the State Department as a telegraph code clerk, quickly recognized vulnerabilities in US diplomatic codes, and wrote a paper demonstrating he could read the President\'s messages. Promoted to Army intelligence (MI-8) in WWI, he ran a code-and-cipher section that broke German, Mexican, and other traffic. After the Armistice he persuaded both the Army and the State Department to fund a permanent joint bureau — unprecedented in American history — located in a Manhattan brownstone. The operation read the traffic of 20 nations over its decade of operation.</p>'),
            ('🔬','Washington Naval Conference','<p>The 1921 Washington Naval Conference negotiated the first major international arms limitation treaty — establishing ratios for capital ship tonnage among the great powers. The American delegation, briefed daily by Yardley\'s team on Japan\'s diplomatic instructions to its negotiators, knew in advance the maximum concessions Japan would accept. The US successfully pushed Japan to accept a 10:10:6 capital ship ratio rather than the 10:10:7 Japan was authorized to demand. This is among the clearest documented cases of intelligence-enabled diplomatic advantage in American history.</p>'),
            ('📖','The Book and Its Consequences','<p><em>The American Black Chamber</em> (1931) was a bestseller — Japan read it immediately and changed its diplomatic codes within months. Congress held hearings. The Communications Act of 1934 criminalized what Yardley had done. Japan\'s new codes (including the systems that became RED and then the M-97/PURPLE Typewriter machines) were specifically designed to be unreadable by the methods Yardley had disclosed. In a direct sense, Yardley\'s book created the cryptographic environment that required the US to develop the PURPLE-breaking MAGIC program — the very system that should have warned of Pearl Harbor.</p>'),
        ],
        related_list=[
            ('purple.html','Purple Machine','Japan\'s response to Yardley\'s revelations'),
            ('cabinet-noir.html','Cabinet Noir','European precedents for the Black Chamber'),
            ('venona.html','VENONA','Later US SIGINT success Yardley\'s work helped seed'),
        ],
        prev_s='dilly-knox', prev_n='Dilly Knox',
        next_s='mavis-batey', next_n='Mavis Batey',
    ),
    dict(
        slug='mavis-batey',
        title='Mavis Batey',
        dates='1921 – 2013',
        og_desc="Mavis Batey (née Lever) was a Bletchley Park cryptanalyst who broke the Italian naval Enigma in 1941, providing the intelligence behind the Battle of Cape Matapan — the Royal Navy's greatest WWII Mediterranean victory.",
        hall_path='halls/codebreakers.html',
        hall_label='Hall X: Hall of Codebreakers',
        era_badge='WWII · Britain',
        sec_badge='Codebreaker Biography',
        eyebrow='Hall X · Codebreakers',
        tagline="She broke the Italian naval Enigma at age 19, and the intelligence won the Battle of Cape Matapan.",
        portrait_emoji='🌷',
        facts_items=[
            ('Born','April 5, 1921, Dulwich, London'),
            ('Died','November 12, 2013, London'),
            ('Education','University College London — German literature (interrupted by war)'),
            ('Recruited by','Dilly Knox, 1940'),
            ('Key Break','Italian Naval Enigma (K machine) — March 1941'),
            ('Battle enabled','Cape Matapan, March 28–29, 1941 (Royal Navy destroys 5 Italian ships)'),
            ('Post-war','Garden historian; MBE; author'),
        ],
        bio_para="Mavis Lever was a 19-year-old German literature student when Dilly Knox recruited her to Bletchley Park in 1940. She worked in 'the Cottage' — Knox's small Enigma research section — and in March 1941 broke an Italian naval Enigma message that had been doubly enciphered by an operator error. The decrypts revealed the Italian fleet's movements. Admiral Cunningham launched a deception operation (feigning attendance at a social function in Alexandria) and then sailed to intercept. The resulting Battle of Cape Matapan killed 2,400 Italian sailors and sank three cruisers and two destroyers. The Royal Navy lost three men.",
        significance_p="Mavis Batey exemplifies the hidden contribution of women to Bletchley Park — and the long postwar silence around it. Like virtually all Bletchley veterans, she spent thirty years unable to speak of her work; her husband Keith Batey (also a Bletchley cryptanalyst she met there) described returning home after the war to be asked by a neighbor what they'd done during the war and being unable to answer. When British historian Sinclair McKay began interviewing veterans in the 2000s, the richness of the female experience at Bletchley emerged fully for the first time. Mave Batey's 2009 memoir and her work on Dilly Knox's legacy were among the primary sources that reshaped the historical narrative.",
        panels_list=[
            ('🔬','The Italian Naval Enigma','<p>The Italian Navy used a commercial Enigma variant (the K machine) without the plugboard that complicated the German military system. Knox and his team had long known its structure; what remained was recovering daily settings. In 1941, a doubly-enciphered message provided a crib — when two messages are sent identically with different settings, the second is simultaneously plaintext and ciphertext for the first. Batey recognized the structure, solved the settings, and produced decrypts of Italian fleet movement orders that were flagged immediately to the Naval Intelligence Division.</p>'),
            ('⚓','Cape Matapan','<p>The intelligence from Batey\'s breakthrough showed Italian heavy cruisers operating south of Greece. Admiral Cunningham, to avoid alerting the Italians that their communications were read, staged an elaborate deception — going conspicuously to a party in Alexandria, playing cricket ashore — before quietly sailing with three battleships. The resultant action on the night of March 28–29, 1941 destroyed five Italian warships. Churchill personally congratulated the cryptanalysts. The victory was crucial during the period when Britain\'s Mediterranean position was most vulnerable.</p>'),
            ('📖','After the War','<p>Mavis Batey married Keith Batey, her Bletchley colleague, after the war. She became a distinguished garden historian — her books on the gardens of Nuneham Courtenay, Rousham, and the history of English landscape design are standard academic references. She received an MBE in the 2004 New Year Honours for her garden history work. After GCHQ formally acknowledged Bletchley operations in the 1970s, she became an active public advocate and author on the subject, contributing significantly to the revived historical reputation of Dilly Knox and the Cottage team.</p>'),
        ],
        related_list=[
            ('dilly-knox.html','Dilly Knox','Her mentor and recruiter'),
            ('enigma.html','Enigma','The machine she broke into'),
            ('bletchley-park.html','Bletchley Park','Her wartime home'),
        ],
        prev_s='yardley', prev_n='Herbert Yardley',
        next_s='gchq-trio', next_n='The GCHQ Trio',
    ),
    dict(
        slug='gchq-trio',
        title='The GCHQ Trio — Ellis, Cocks, and Williamson',
        dates='1970 – 1973',
        og_desc="James Ellis, Clifford Cocks, and Malcolm Williamson of GCHQ independently invented public-key cryptography in 1970–1973 — but their work remained classified until 1997, four years after Diffie, Hellman, and Rivest had received public credit.",
        hall_path='halls/codebreakers.html',
        hall_label='Hall X: Hall of Codebreakers',
        era_badge='Cold War · GCHQ',
        sec_badge='Invention Biography',
        eyebrow='Hall X · Codebreakers',
        tagline="They invented RSA and Diffie-Hellman first. No one knew for 27 years.",
        portrait_emoji='🔑',
        facts_items=[
            ('James Ellis','1924–1997 — proposed non-secret encryption concept, 1969'),
            ('Clifford Cocks','b. 1950 — implemented RSA equivalent, 1973 (age 22, first week on job)'),
            ('Malcolm Williamson','b. 1950 — implemented Diffie-Hellman equivalent, 1974'),
            ('Organization','GCHQ (Government Communications Headquarters), Cheltenham'),
            ('Classification','Top secret until 1997'),
            ('Public credit','Diffie & Hellman (1976), Rivest, Shamir & Adleman (1977)'),
            ('Recognition','Clifford Cocks: CMG 2008; IBy 2009'),
        ],
        bio_para="James Ellis was a GCHQ mathematician who in 1969 produced a classified paper demonstrating theoretically that two parties could communicate securely without sharing a secret key in advance. He called it 'non-secret encryption.' Three years later, a 22-year-old mathematician named Clifford Cocks — recently arrived at GCHQ — read Ellis's paper and produced, in the space of thirty minutes, a practical implementation using the difficulty of factoring large numbers: what the public world would later call RSA. Malcolm Williamson independently derived the equivalent of Diffie-Hellman key exchange shortly thereafter. All three papers were classified. When Diffie, Hellman, Rivest, Shamir, and Adleman published their versions in 1976–1977, they received the public credit history accords to priority of publication.",
        significance_p="The GCHQ trio's story is the premier case study in how government secrecy can suppress foundational scientific advances. Public-key cryptography is the cryptographic underpinning of every secure transaction on the modern internet — HTTPS, TLS, SSH, encrypted messaging, digital signatures, and cryptocurrency all depend on it. Had Ellis and Cocks's work been publishable in 1973, open academic research and development would have had four additional years to mature the field. Instead, the academic community worked in ignorance of the prior art, and the GCHQ results remained classified until 1997 — by which point the RSA patent had already been granted and the entire modern cryptographic architecture had been independently built around what were thought to be new academic results.",
        panels_list=[
            ('📜','James Ellis\'s Insight','<p>Ellis\'s 1969 paper, "The Possibility of Secure Non-Secret Digital Encryption," argued from first principles that two parties could establish a secure channel if one party could create a mathematical transformation that was easy to apply (encryption) but hard to reverse (decryption) without a secret, and if the encryption key could be safely made public. He framed this as a mathematical possibility but could not construct a specific implementation. His paper circulated internally at GCHQ but could not be published or shared externally.</p>'),
            ('🔬','Clifford Cocks in Thirty Minutes','<p>Clifford Cocks read Ellis\'s paper shortly after joining GCHQ from Cambridge in 1973. Using his mathematical background in number theory, he recognized that the factoring problem — given N = p × q where p and q are large primes, finding p and q is computationally hard — provided exactly the one-way function Ellis had described. He wrote his implementation in thirty minutes. The system he described is, in every mathematical detail, what the public world would call RSA in 1977. Cocks did not tell his supervisor immediately because he assumed someone had obviously already thought of it. They had not.</p>'),
            ('🌍','Recognition and Impact','<p>GCHQ declassified the Ellis and Cocks papers in 1997, after RSA Security had already licensed RSA as a patented system and built a company around it. Cocks received a Commander of the Order of the British Empire (CMG) in 2008. Ellis had died in 1997, just months after the declassification — close enough to know that the world had finally learned his contribution. The academic cryptography community\'s response was universal acknowledgment: the published RSA paper would have acknowledged Ellis and Cocks had their work been known.</p>'),
        ],
        related_list=[
            ('rsa.html','RSA','The public-equivalent published in 1977'),
            ('diffie-hellman.html','Diffie-Hellman','Williamson\'s public equivalent'),
            ('kerckhoffs.html',"Kerckhoffs's Principle","Why published security beats secret security"),
        ],
        prev_s='mavis-batey', prev_n='Mavis Batey',
        next_s='kahn', next_n='David Kahn',
    ),
    dict(
        slug='kahn',
        title='David Kahn',
        dates='1930 – 2023',
        og_desc="David Kahn's 1967 masterwork The Codebreakers was the first comprehensive history of cryptography — a book so thorough that the NSA tried to suppress its publication.",
        hall_path='halls/codebreakers.html',
        hall_label='Hall X: Hall of Codebreakers',
        era_badge='Modern · Journalist/Historian',
        sec_badge='Cryptohistory Biography',
        eyebrow='Hall X · Codebreakers',
        tagline="He wrote the book the NSA didn't want published — and then wrote six more.",
        portrait_emoji='📚',
        facts_items=[
            ('Born','February 7, 1930, Mineola, New York'),
            ('Died','December 28, 2023, Great Neck, New York'),
            ('Education','Bucknell; Oxford (Magdalen); NYU (PhD)'),
            ('Major Work','<em>The Codebreakers</em> (1967, 1996 revised)'),
            ('NSA response','Attempted classified review to delay/suppress publication'),
            ('Later works','<em>The Codebreakers</em>, <em>Hitler\'s Spies</em>, <em>Seizing the Enigma</em>, <em>The Reader of Gentlemen\'s Mail</em>'),
            ('Legacy','Defined cryptohistory as a field; inducted NSA Cryptologic Hall of Honor 2009'),
        ],
        bio_para="David Kahn was a Jewish-American journalist and historian from New York who spent fifteen years researching and writing the first comprehensive history of cryptography from antiquity to the twentieth century. <em>The Codebreakers</em> (1967) ran to 1,164 pages and covered every significant cipher, cryptanalyst, and intelligence episode Kahn could document. Its pre-publication manuscript was reviewed by the NSA's predecessor, which reportedly asked Macmillan to delay publication on national-security grounds; the publisher declined. The book became a standard reference, sparked a generation of academic and amateur cryptographers, and effectively created the field of cryptohistory.",
        significance_p="Kahn's significance is cultural, historiographic, and indirect-technical. By documenting the complete history of cryptography in one accessible volume, he provided both the historical framework and the motivation for the academic explosion in cryptographic research that characterized the 1970s. Martin Hellman cited The Codebreakers as an influence; Whitfield Diffie read it in college. The cryptographic revolution of the 1970s — public-key cryptography, DES, academic cryptanalysis — had many causes, but the existence of a widely read, rigorously researched history of the field that showed both its depth and its unsolved problems was among them. Kahn spent his lifetime ensuring that the field's history was not forgotten.",
        panels_list=[
            ('📖','The Codebreakers','<p><em>The Codebreakers</em> (Macmillan, 1967; revised 1996) traces cryptography from ancient Egypt through the NSA era. Its coverage of WWII cryptanalysis — written before Bletchley Park was declassified — relied on fragmentary public sources and interviews with veterans who could say little. The 1996 revision incorporated three decades of post-declassification scholarship. As a reference work it remains comprehensive and accurate; as historical writing it is also engaging narrative. Kahn researched primary sources in German military archives, interviewed veterans across Europe, and consulted mathematical papers in multiple languages.</p>'),
            ('🏛️','The NSA and Suppression','<p>The NSA (or its precursor) reviewed the Codebreakers manuscript pre-publication and reportedly raised concerns about several sections. Kahn and Macmillan declined to make substantive changes. The book was published without modification. In subsequent decades, Kahn maintained a civil but wary relationship with US intelligence agencies; he was inducted into the NSA Cryptologic Hall of Honor in 2009, suggesting the institutional tension had dissolved. The episode remains a landmark in the conflict between national security classification and press freedom in the US.</p>'),
            ('📚','Later Works','<p>Kahn\'s subsequent books include: <em>Hitler\'s Spies</em> (1978), a comprehensive study of German military intelligence in WWII; <em>Kahn on Codes</em> (1983), a general-audience introduction; <em>Seizing the Enigma</em> (1991), a detailed account of US and British naval captures of Enigma material; and <em>The Reader of Gentlemen\'s Mail</em> (2004), a biography of Herbert Yardley. He died in December 2023 at age 93, having seen virtually every major cryptological secret he had tried to document eventually declassified and confirmed.</p>'),
        ],
        related_list=[
            ('yardley.html','Herbert Yardley','Subject of Kahn\'s final biography'),
            ('bletchley-park.html','Bletchley Park','Kahn\'s pre-declassification account shaped public understanding'),
            ('enigma.html','Enigma','<em>Seizing the Enigma</em> subject'),
        ],
        prev_s='gchq-trio', prev_n='The GCHQ Trio',
        next_s='dunin', next_n='Elonka Dunin',
    ),
    dict(
        slug='dunin',
        title='Elonka Dunin',
        dates='b. 1958',
        og_desc="Elonka Dunin is a game designer, cryptographer, and the foremost public authority on unsolved ciphers — the creator of the definitive list of famous unsolved codes and an expert on Kryptos.",
        hall_path='halls/codebreakers.html',
        hall_label='Hall X: Hall of Codebreakers',
        era_badge='Modern · Cryptographer',
        sec_badge='Living Legend',
        eyebrow='Hall X · Codebreakers',
        tagline="The Internet&#39;s curator of cryptographic mysteries — and the woman most likely to solve Kryptos K4.",
        portrait_emoji='🎮',
        facts_items=[
            ('Born','1958'),
            ('Background','Video game designer (Simutronics); game narrative and design'),
            ('Role','Cryptographer, author, Kryptos researcher, cipher historian'),
            ('Key work','Famous Unsolved Codes and Ciphers list (maintained since 2000s)'),
            ('Kryptos','Consistent front-rank researcher on K4 (the unsolved fourth section)'),
            ('Books','<em>The Mammoth Book of Secret Codes and Cryptograms</em> (2006)'),
            ('Awards','NSA Day of Cryptology (speaker); game design awards'),
        ],
        bio_para="Elonka Dunin is a game designer and cryptographer who became the Internet's most widely cited authority on unsolved historical ciphers. Her 'Famous Unsolved Codes and Ciphers' list — hosted on her web site and widely reproduced — is the standard reference for students, journalists, and researchers seeking an overview of genuinely unsolved cryptographic mysteries. She has spent years studying Kryptos, the CIA courtyard sculpture by artist Jim Sanborn, and is among a small community of researchers actively pursuing the fourth unsolved section. Her game design background influences her approach to cryptographic puzzles as narrative systems.",
        significance_p="Dunin represents a category of modern cryptographic contribution that the field needs but has historically undervalued: the curator, educator, and public communicator. Her Famous Unsolved Codes list is cited in academic papers, news articles, and Wikipedia as though it were an official institutional resource — it is not, it is maintained by one determined individual who cares about accuracy. Her Kryptos research has produced verified factual contributions; she was the first to publish several key Kryptos facts. More broadly, her public accessibility — speaking at conferences, engaging with media, explaining cipher concepts for general audiences — has made cryptographic history visible to millions of people who would otherwise never encounter it.",
        panels_list=[
            ('🔐','Kryptos Research','<p>Kryptos is a sculpture by Jim Sanborn installed in the CIA courtyard in Langley, Virginia in 1990. It contains four sections of encrypted text; three have been solved (K1: Vigenère, 1999; K2: Vigenère, 1999; K3: transposition, 1999). The fourth section (K4) — 97 characters — remains unsolved. Dunin has studied Kryptos intensively, collaborated directly with Sanborn, and published multiple papers on the structure of K4. She confirmed that the string "BERLIN" appears in the plaintext (Sanborn revealed a two-word clue in 2010 and 2014). K4 remains the premier open cryptanalytic challenge in the world.</p>'),
            ('📋','The Famous Unsolved Codes List','<p>Dunin\'s list of Famous Unsolved Codes and Ciphers covers: the Voynich Manuscript, Kryptos K4, the Beale Ciphers, the Phaistos Disc, the Dorabella Cipher, the Zodiac Killer ciphers, the Shugborough Inscription, the Somerton Man taman shud, the McCormick cipher, and many others. The list distinguishes between genuinely unsolved cipher texts, disputed-unsolved texts, and texts whose unsolved status is contested. It is continuously maintained and has been used as a research organizing framework by academics, journalists, and puzzle solvers for over twenty years.</p>'),
            ('🎮','Game Design and Cipher Narrative','<p>Dunin worked as a producer and narrative designer at Simutronics, the developer of the GemStone online role-playing game series. Her game design experience shaped her approach to cryptographic puzzles as interactive narrative systems — where the solution process is as significant as the solution itself. She brought this perspective to the ARG (alternate reality game) community that developed around Cicada 3301 and similar puzzles. Her 2006 book <em>The Mammoth Book of Secret Codes and Cryptograms</em> provides a collection of solvable cipher puzzles oriented toward general audiences.</p>'),
        ],
        related_list=[
            ('kryptos.html','Kryptos','Her primary research subject'),
            ('voynich.html','Voynich Manuscript','Top of her Famous Unsolved list'),
            ('cicada-3301.html','Cicada 3301','Modern cryptographic puzzle she documented'),
        ],
        prev_s='kahn', prev_n='David Kahn',
        next_s='lasry', next_n='George Lasry',
    ),
    dict(
        slug='lasry',
        title='George Lasry',
        dates='b. 1966',
        og_desc="George Lasry is a computational cryptographer who has solved more historically unsolved cipher manuscripts in the past decade than anyone alive — including the Copiale Cipher and multiple Zodiac Killer messages.",
        hall_path='halls/codebreakers.html',
        hall_label='Hall X: Hall of Codebreakers',
        era_badge='Modern · Computational',
        sec_badge='Living Legend',
        eyebrow='Hall X · Codebreakers',
        tagline="The algorithmist who keeps solving what everyone else gave up on.",
        portrait_emoji='💻',
        facts_items=[
            ('Born','1966'),
            ('Background','Computer scientist; software engineer in telecommunications'),
            ('Affiliation','Working group member, Cryptologia; collaborator, UCL CIPHAS'),
            ('Copiale Cipher','Co-solved 2011 with Kevin Knight and Beáta Megyesi'),
            ('Zodiac ciphers','Contributed to team solving Z340 (2020) and Z13'),
            ('Other solves','Multiple 16th–19th century diplomatic cipher manuscripts'),
            ('Approach','Hill climbing, simulated annealing, and MCMC applied to historical ciphers'),
            ('Degree','PhD in computational cryptanalysis (while in middle age)'),
        ],
        bio_para="George Lasry is a software engineer turned computational cryptanalyst who has spent the past fifteen years developing and applying advanced algorithmic methods to historically unsolved cipher manuscripts. Working largely independently or in small collaborations, he has produced an extraordinary string of solutions to ciphers that had defeated historians, linguists, and amateur cryptanalysts for decades. His methods center on combining statistical language models with metaheuristic optimization algorithms — particularly simulated annealing and hill climbing — implemented in custom software applied to historical manuscripts.",
        significance_p="Lasry represents the transformation of historical cryptanalysis by computational methods. Problems that were genuinely unsolvable before the availability of fast computers and good language statistics — such as long polyalphabetic historical manuscripts — become tractable when paired with efficient optimization algorithms and statistical language scoring functions. His solution of the Copiale Cipher (with Knight and Megyesi), his contributions to the Z340 solution, and his ongoing work on 16th and 17th-century diplomatic cipher manuscripts from European archives have permanently changed the archaeology of secret communication. His techniques are now being applied systematically to digitized archival collections that may harbor hundreds of unsolved historical cipher manuscripts.",
        panels_list=[
            ('🔐','The Copiale Cipher','<p>The Copiale Cipher is a 105-page 18th-century manuscript using a mixture of Roman and abstract symbols. It was photographed, digitized, and made available to researchers in the 2000s without solution. In 2010–2011, Lasry, Kevin Knight (computational linguist at USC), and Beáta Megyesi (Uppsala University) applied statistical machine translation and language modeling techniques, determining that the abstract symbols were nulls, the Roman letters were the actual cipher alphabet, and the underlying language was German. The solution revealed the manuscript as the initiation rituals of a clandestine German secret society related to ophthalmology.</p>'),
            ('🔢','Z340 and the Zodiac Ciphers','<p>The Z340 cipher — a 340-character cryptogram sent by the Zodiac Killer in 1969 — had defeated cryptanalysts for fifty years. In December 2020, a team including David Oranchak, Sam Blake, and Jarl Van Eycke solved it. Lasry made contributions to the community\'s understanding of the cipher structure. The solution revealed a taunting, rambling message. Lasry has continued work on remaining Zodiac ciphers. His methods for processing short historical hand-ciphered texts — combining machine search with human editorial judgment — are now a model for the field.</p>'),
            ('📜','European Diplomatic Archives','<p>Lasry\'s most significant ongoing work involves applying his computational pipeline to digitized archival collections in France, Austria, Spain, and the Vatican — archives containing thousands of enciphered 16th–19th century diplomatic letters that have never been deciphered. He has solved multiple previously unknown ciphers used by historical figures including Mary Queen of Scots, Cardinal Richelieu\'s cipher network, and Renaissance-era Italian diplomatic services. Each solution adds to the historical record of the period\'s political communications.</p>'),
        ],
        related_list=[
            ('copiale.html','Copiale Cipher','His most famous solve'),
            ('zodiac.html','Zodiac Cipher','Z340 partial contributions'),
            ('dunin.html','Elonka Dunin','Fellow modern cipher historian'),
        ],
        prev_s='dunin', prev_n='Elonka Dunin',
        next_s='', next_n='',
    ),
]

if __name__ == '__main__':
    for bio in BIOS:
        out = wrap_bio(**bio)
        dest = os.path.join(OUT, bio['slug'] + '.html')
        with open(dest, 'w', encoding='utf-8') as f:
            f.write(out)
        print(f'  Created {dest}')
    print(f'Done. {len(BIOS)} bio pages written.')
