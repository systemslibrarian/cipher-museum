#!/usr/bin/env python3
"""Round 3 Phase 7 (Americana) page generator.

Produces 2 Revolutionary War exhibits: Culper Ring / Tallmadge Code and
Arnold-Andre Book Cipher. Mirrors the Phase 4/5/6 builders.
"""
import os
import sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CIPHERS = os.path.join(REPO, 'ciphers')

PAGES = [
  {
    'slug': 'culper-ring',
    'title': 'Culper Ring / Tallmadge Code',
    'subtitle': 'Washington\u2019s spy ring codebook · 1779',
    'meta_desc': "Major Benjamin Tallmadge\u2019s 1779 codebook for George Washington\u2019s Culper Spy Ring. Roughly 750 numbered entries covering people, places, military terms, and common words \u2014 used by Abraham Woodhull and Robert Townsend on British-occupied Long Island and Manhattan.",
    'hall_href': '../halls/civil-war.html',
    'hall_label': 'Hall V: American Field Cryptography',
    'hall_short': 'Hall V · American Field',
    'page_meta_label': 'Hall V · American Field',
    'era_class': 'era-modern',
    'era_label': 'American Revolution · 1778\u20131783',
    'sec_class': 'sec-broken',
    'sec_label': 'Codebook (compromised by capture, never broken)',
    'tagline': 'A 760-entry pocket codebook that let Washington read New York Harbor for four years \u2014 and that the British never compromised.',
    'facts': [
      ('Designer', 'Major Benjamin Tallmadge, US Army (Washington\u2019s intelligence chief)'),
      ('Year', 'In active use 1779 \u2013 1783'),
      ('Mechanism', 'Codebook of ~760 numbered entries (people, places, words)'),
      ('Operators', 'Abraham Woodhull (Samuel Culper Sr), Robert Townsend (Samuel Culper Jr), Anna Strong'),
      ('Status', 'No British break of the cipher itself recorded'),
    ],
    'panels': [
      ('\U0001f4dc', 'Historical Context',
       "<p>By 1778 George Washington\u2019s army had been forced out of New York City and the British held the harbour, Manhattan, and most of Long Island. Washington needed reliable, sustained intelligence from inside that perimeter \u2014 ship arrivals, troop movements, the names of ranking British officers in the city. He turned to a 24-year-old Continental Army officer, Major Benjamin Tallmadge, who in spring 1779 organised what is now called the Culper Spy Ring.</p>"
       "<p style=\"margin-top:1rem;\">Tallmadge\u2019s solution to the secrecy problem was a small leather-bound codebook with roughly 760 numbered entries. Each entry was a person, place, military term, or common word. \u201cWashington\u201d became <code>711</code>; \u201cNew York\u201d became <code>727</code>; \u201cspy\u201d became <code>178</code>. The codebook was distributed only to Tallmadge, Washington, Abraham Woodhull (Samuel Culper Sr), and Robert Townsend (Samuel Culper Jr). It was used continuously from 1779 until the end of the war \u2014 and no British break of the cipher itself is recorded. Surviving copies of Tallmadge\u2019s codebook are in the Library of Congress.</p>"),
      ('\u2699\ufe0f', 'How It Works',
       "<p>The codebook is a parallel-list nomenclator. The plaintext list runs alphabetically through the words and proper names of interest; each entry has a number from 1 to roughly 760. The cipher list runs in numeric order, each number against its plaintext, so the recipient can decode.</p>"
       "<p style=\"margin-top:1rem;\">Operators wrote messages using ordinary English for low-value content and substituted code numbers for sensitive words \u2014 names of officers, ship counts, place names. Numbers were embedded in otherwise innocuous letters (\u201cI saw 711 yesterday and he asked after the 660 in 727\u201d \u2014 \u201cI saw Washington yesterday and he asked after the people in New York\u201d).</p>"
       "<p style=\"margin-top:1rem;\">For deeper concealment, Culper messages were written in James Jay\u2019s invisible ink (\u201csympathetic stain\u201d) between the lines of cover letters. The ink itself was Washington\u2019s second-most carefully guarded secret of the war \u2014 only a handful of people knew the recipe.</p>"
       "<p style=\"margin-top:1rem;\">The demo above uses a stable 200-entry codebook indexed from 100. Words not in the codebook fall through to per-letter codes in the 800s, bracketed by sentinels 998 and 999 \u2014 the same trick Tallmadge would have used (he had a small alphabet table for proper nouns the codebook didn\u2019t cover).</p>"),
      ('\U0001f480', 'How It Was (Not) Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">No British cryptanalytic break</div><div class=\"attack-diff\">Complexity: Hard without a captured codebook</div><p class=\"attack-desc\">A 760-entry random-numbered nomenclator in casually English-mixed letters is genuinely difficult to break by frequency alone, especially when sensitive words are used sparingly. The British signals organisation in New York intercepted Culper letters but could not read them. The ring\u2019s secrecy was compromised exactly once, when courier Caleb Brewster was nearly captured \u2014 by accident, not cryptanalysis.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Operational risks</div><div class=\"attack-diff\">Complexity: N/A \u2014 the system\u2019s real risk was capture, not codebreaking</div><p class=\"attack-desc\">A captured codebook would have been catastrophic: the British would have read every Culper message in its archive. Tallmadge enforced strict need-to-know discipline, kept his own copy with the army, and never named his agents in writing. The ring\u2019s identities were not all public until Robert Townsend was identified by historian Morton Pennypacker in 1929 \u2014 150 years later.</p></div>"),
      ('\U0001f52c', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>Culper lesson</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>Codebook + invisible ink = layered defence</td><td>Defence in depth \u2014 multiple independent security layers</td></tr>"
       "<tr><td>Strict need-to-know distribution of code material</td><td>Modern key management: split knowledge, dual control, HSMs</td></tr>"
       "<tr><td>Embedding ciphertext in plausible cover traffic</td><td>Steganography and traffic-analysis-resistant protocols</td></tr>"
       "<tr><td>Operational discipline beats algorithmic complexity</td><td>Modern incident-response: most breaches are operational, not cryptographic</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('arnold-andre', 'Arnold\u2013Andr\u00e9 Book Cipher', 'The contemporary cipher used <em>against</em> Washington \u2014 by Benedict Arnold'),
      ('book-cipher', 'Book Ciphers', 'The same family of nomenclator + literal cipher'),
      ('zimmermann', 'Zimmermann Telegram', 'Same architecture (codebook of words to numbers) at industrial scale'),
    ],
    'prev': ('stager', 'Stager Cipher'),
    'next': ('arnold-andre', 'Arnold\u2013Andr\u00e9 Book Cipher'),
  },
  {
    'slug': 'arnold-andre',
    'title': 'Arnold\u2013Andr\u00e9 Book Cipher',
    'subtitle': 'Blackstone\u2019s Commentaries · 1779\u20131780',
    'meta_desc': "The book cipher Benedict Arnold and Major John Andr\u00e9 used to plot the surrender of West Point. Each plaintext word located in a shared book (Blackstone\u2019s <em>Commentaries</em>) and transmitted as the triple page.line.word.",
    'hall_href': '../halls/civil-war.html',
    'hall_label': 'Hall V: American Field Cryptography',
    'hall_short': 'Hall V · American Field',
    'page_meta_label': 'Hall V · American Field',
    'era_class': 'era-modern',
    'era_label': 'American Revolution · 1779\u20131780',
    'sec_class': 'sec-broken',
    'sec_label': 'Compromised by capture (1780)',
    'tagline': 'A book cipher with two volumes of Blackstone\u2019s <em>Commentaries</em> as the key. The cipher held; the courier didn\u2019t.',
    'facts': [
      ('Operators', 'Major General Benedict Arnold &amp; Major John Andr\u00e9 (British Army)'),
      ('Year', 'July 1779 \u2013 September 1780'),
      ('Book', 'Blackstone\u2019s <em>Commentaries on the Laws of England</em> (also Bailey\u2019s <em>Dictionary</em>)'),
      ('Format', 'Triple page.line.word, e.g. <code>27.4.6</code> = page 27, line 4, word 6'),
      ('Compromise', 'Andr\u00e9 captured 23 Sept 1780 with cipher key, plans, and pass'),
    ],
    'panels': [
      ('\U0001f4dc', 'Historical Context',
       "<p>In July 1779, Major General Benedict Arnold \u2014 hero of Saratoga, lately appointed military governor of Philadelphia \u2014 opened a secret correspondence with the British command in New York under the cover-name \u201cMonk\u201d (after General George Monck, who restored the English monarchy in 1660). His liaison was Major John Andr\u00e9, the cultivated young Adjutant-General to General Sir Henry Clinton. Their negotiations centred on Arnold\u2019s offer to deliver the Hudson River fortress at West Point to the British in exchange for cash and a brigadier\u2019s commission in the British Army.</p>"
       "<p style=\"margin-top:1rem;\">Their cipher was a book code. Both men carried matching copies of Sir William Blackstone\u2019s <em>Commentaries on the Laws of England</em> (Andr\u00e9 alternatively used Nathan Bailey\u2019s <em>Universal Etymological English Dictionary</em>). Each plaintext word was located in the book and transmitted as a numeric triple: page, line, word. The sister of an American spy could carry the resulting strings of numbers without arousing suspicion.</p>"
       "<p style=\"margin-top:1rem;\">The plot collapsed not through cryptanalysis but through plain bad luck. On 23 September 1780, three New York militiamen stopped Andr\u00e9 near Tarrytown as he returned from a meeting with Arnold. They searched him, found the cipher key and the plans of West Point in his boot, and turned him in. Andr\u00e9 was hanged as a spy on 2 October. Arnold escaped to British lines, sailed for England, and lived out his life in disgrace. West Point did not fall.</p>"),
      ('\u2699\ufe0f', 'How It Works',
       "<p>Both correspondents own identical copies of an agreed reference book. To encrypt a word, the sender finds it in the book and writes down a triple <code>page.line.word</code>. To decrypt, the receiver looks up that triple in their own copy and recovers the plaintext.</p>"
       "<p style=\"margin-top:1rem;\">Unique to a book cipher: the \u201ckey\u201d is a published book, easy to obtain innocuously and impossible to memorise. There is no codebook to capture, no machine to seize \u2014 unless the courier is searched, in which case everything is exposed at once.</p>"
       "<p style=\"margin-top:1rem;\">Words not in the book had to be spelled out letter by letter using a parallel scheme \u2014 either a simple letter-position code or, in Arnold\u2019s correspondence, occasional substitutions and abbreviations agreed in advance. Modern cryptanalysis classifies this as a homophonic / nomenclator hybrid.</p>"
       "<p style=\"margin-top:1rem;\">The demo above uses a deterministic 240-word \u201cbook\u201d organised as 12 pages \u00d7 5 lines \u00d7 4 words. Words not in the book fall through to per-letter triples on \u201cpage 14\u201d, bracketed by sentinel triples <code>13.1.1</code> and <code>15.1.1</code> \u2014 mirroring how Arnold and Andr\u00e9 handled out-of-book words in practice.</p>"),
      ('\U0001f480', 'How It Was Compromised',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Capture of the courier (23 September 1780)</div><div class=\"attack-diff\">Complexity: Three militiamen, an unscheduled patrol</div><p class=\"attack-desc\">Andr\u00e9 was returning from West Point in civilian clothes \u2014 a fatal mistake, since it made him a spy under the laws of war rather than a uniformed officer. John Paulding, David Williams, and Isaac Van Wart stopped him near Tarrytown, found the documents in his boot, and turned him over to the Continental Army. He was tried, convicted, and hanged within ten days.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Cryptanalysis was never required</div><div class=\"attack-diff\">Complexity: Moot \u2014 the plaintext was recovered with the key</div><p class=\"attack-desc\">A book cipher with a published reference is genuinely hard to break given only ciphertext: the analyst must guess which book is the key, and there are millions to try. But once the courier and the key are captured together, the entire correspondence becomes readable. The Arnold cipher was never broken cryptanalytically; it never needed to be.</p></div>"),
      ('\U0001f52c', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>Arnold\u2013Andr\u00e9 lesson</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>Public reference as the key</td><td>Trusted-third-party root certificates: well-known but high-value targets</td></tr>"
       "<tr><td>Single point of failure (the courier)</td><td>The 2010s SolarWinds / supply-chain attacks against single trusted channels</td></tr>"
       "<tr><td>Cryptography held; operations failed</td><td>The defining pattern of modern breaches: TLS is fine, the operator clicked the link</td></tr>"
       "<tr><td>Carrying key + ciphertext together</td><td>Why modern protocols separate key storage from encrypted data (HSM \u2260 disk)</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('culper-ring', 'Culper Ring / Tallmadge Code', 'The contemporary cipher used <em>by</em> Washington against the British'),
      ('book-cipher', 'Book Ciphers', 'Earlier and later examples in the same family'),
      ('beale', 'Beale Ciphers', 'A famous unsolved book cipher from the next generation'),
    ],
    'prev': ('culper-ring', 'Culper Ring / Tallmadge Code'),
    'next': ('book-cipher', 'Book Ciphers'),
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
