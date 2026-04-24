#!/usr/bin/env python3
"""Round 3 Phase 5 stragglers (European classical engines): Argenti and Wallis.

Mirrors the Phase 4/5/6/7 builders.
"""
import os
import sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CIPHERS = os.path.join(REPO, 'ciphers')

PAGES = [
  {
    'slug': 'argenti',
    'title': 'Argenti Family Cipher',
    'subtitle': 'Vatican papal nomenclators \u00b7 1500s\u20131600s',
    'meta_desc': "Matteo and Marcello Argenti served as papal cryptanalysts to seven popes. Their <em>Trattato in Cifra</em> codified the homophonic-nomenclator pattern that dominated European diplomacy for two centuries.",
    'hall_href': '../halls/substitution.html',
    'hall_label': 'Hall II: Classical Substitution',
    'hall_short': 'Hall II \u00b7 Substitution',
    'page_meta_label': 'Hall II \u00b7 Substitution',
    'era_class': 'era-classical',
    'era_label': 'Renaissance Italy \u00b7 1500s\u20131600s',
    'sec_class': 'sec-broken',
    'sec_label': 'Secure for its time \u00b7 obsoleted by frequency analysis',
    'tagline': 'The Vatican\u2019s house cryptographers wrote the textbook \u2014 literally \u2014 on homophonic substitution. For 200 years, every European chancery copied it.',
    'facts': [
      ('Designers', 'Matteo Argenti (1561\u20131638) &amp; his nephew Marcello Argenti'),
      ('Employer', 'Holy See (Vatican Secretary of State, 1591\u20131630s)'),
      ('Treatise', '<em>Trattato in Cifra</em> (manuscript, c.1591\u20131605)'),
      ('Mechanism', 'Homophonic substitution + nomenclator + nulls'),
      ('Status', 'Standard Vatican system into the 17th century'),
    ],
    'panels': [
      ('\U0001f4dc', 'Historical Context',
       "<p>From 1555 the Argenti family held a hereditary post in the papal Cifra office \u2014 the Vatican\u2019s cryptographic bureau. Giovanni Battista Argenti (d. 1591), then his nephew Matteo (1561\u20131638), then Matteo\u2019s nephew Marcello served seven popes between them, designing nomenclators for papal nuncios across Europe and breaking the ciphers of foreign powers.</p>"
       "<p style=\"margin-top:1rem;\">Around 1591 Matteo wrote the <em>Trattato in Cifra</em>, an internal handbook for Vatican cryptographers. It set out, for the first time as a coherent design discipline, every defensive trick later European cryptography would rely on: multiple homophones for high-frequency letters, nulls inserted to scramble counts, a parallel nomenclator of named persons and places, and explicit guidance on how to <em>break</em> sloppy enemy ciphers using frequency analysis. Aloys Meister published Matteo\u2019s manuscripts in 1906 (<em>Die Geheimschrift im Dienste der p\u00e4pstlichen Kurie</em>); Kahn devotes much of <em>The Codebreakers</em> chapter 4 to the Argenti tradition.</p>"
       "<p style=\"margin-top:1rem;\">For roughly 200 years \u2014 from the late 16th century until the rise of polyalphabetic ciphers in routine use \u2014 every major European chancery used Argenti-pattern nomenclators. They are why the Babington Plot, the Great Cipher of Louis XIV, and most of the secrets of the Thirty Years\u2019 War were transmitted in the format they were.</p>"),
      ('\u2699\ufe0f', 'How It Works',
       "<p>An Argenti cipher has three layers stacked on top of one another:</p>"
       "<ol style=\"margin-top:.75rem;line-height:1.7;\"><li><strong>Homophonic alphabet.</strong> Each plaintext letter is assigned several cipher symbols (typically 2\u20134 for common letters, 1\u20132 for rare). The encoder rotates between them so common letters never produce the same code twice in a row.</li><li><strong>Nomenclator.</strong> A short list of named persons, places, offices, and frequent words gets dedicated codes that bypass the alphabet entirely \u2014 \u201cthe Pope\u201d, \u201cthe Emperor\u201d, \u201cParis\u201d, etc.</li><li><strong>Nulls.</strong> Meaningless symbols sprinkled at agreed positions to confuse a cryptanalyst counting frequencies.</li></ol>"
       "<p style=\"margin-top:1rem;\">The demo above implements the homophonic core: each letter receives two keyed 2-digit codes (in the range 10\u201389), and the encoder alternates between them on every repeat use. Try encoding <code>AAAAAA</code> \u2014 you will see two distinct codes interleaved, exactly the Argenti defence against frequency attack.</p>"),
      ('\U0001f480', 'How It Was Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Single-letter frequency attack (limited)</div><div class=\"attack-diff\">Complexity: Very high against a properly-designed nomenclator</div><p class=\"attack-desc\">A homophonic cipher with two homophones per letter still leaks information \u2014 the <em>combined</em> frequency of a letter\u2019s codes equals the letter\u2019s natural frequency. Skilled cryptanalysts (including the Argentis themselves, when reading enemy traffic) used this to anchor common letters, then bootstrapped the rest from suspected plaintext words. Long ciphertexts fall to this. Short diplomatic notes do not.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Compromise of the codebook itself</div><div class=\"attack-diff\">Complexity: Espionage problem, not cryptanalytic</div><p class=\"attack-desc\">Like every nomenclator system in history, Argenti ciphers fell most often when a courier was bribed or a chancery clerk defected with the keylist. The Vatican changed nomenclators on a roughly annual cycle to limit this exposure \u2014 a discipline most contemporaneous chanceries did not match.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Eventually obsolete</div><div class=\"attack-diff\">Complexity: 18th-century mathematics</div><p class=\"attack-desc\">By the time of John Wallis (next exhibit) and his contemporaries, professional state cryptanalysts could routinely break Argenti-class systems given enough traffic. The era of pure nomenclators ended around 1700; the polyalphabetic Vigen\u00e8re-family ciphers \u2014 themselves long ignored by chanceries who trusted their nomenclators \u2014 finally came into operational use.</p></div>"),
      ('\U0001f52c', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>Argenti lesson</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>Homophones spread frequency \u2014 but never erase it</td><td>Why ECB-mode block ciphers leak; why authenticated encryption is mandatory</td></tr>"
       "<tr><td>Layered defences (alphabet + nomenclator + nulls)</td><td>Defence in depth: cipher + MAC + nonces + key rotation</td></tr>"
       "<tr><td>Annual key rollover policy</td><td>Modern key rotation discipline (90-day TLS certs, crypto-period limits)</td></tr>"
       "<tr><td>Best-in-class systems still need cryptanalysts to validate them</td><td>Independent academic review; NIST competitions; open-source scrutiny</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('great-cipher', 'Great Cipher of Louis XIV', 'The Argenti tradition\u2019s French descendant'),
      ('babington', 'Babington Plot Cipher', 'A nomenclator-pattern cipher broken in real time'),
      ('homophonic', 'Homophonic Substitution', 'The general pattern Argenti formalised'),
      ('wallis-ciphers', 'Wallis Ciphers', 'The English cryptanalyst who broke nomenclators a generation later'),
    ],
    'prev': ('homophonic', 'Homophonic Substitution'),
    'next': ('wallis-ciphers', 'Wallis Ciphers'),
  },
  {
    'slug': 'wallis-ciphers',
    'title': 'Wallis Ciphers',
    'subtitle': 'John Wallis &amp; the English Civil War \u00b7 1640s',
    'meta_desc': "John Wallis of Oxford broke Royalist nomenclators for Parliament during the English Civil War, then served every English government for 50 years. Originator of professional English state cryptanalysis.",
    'hall_href': '../halls/substitution.html',
    'hall_label': 'Hall II: Classical Substitution',
    'hall_short': 'Hall II \u00b7 Substitution',
    'page_meta_label': 'Hall II \u00b7 Substitution',
    'era_class': 'era-classical',
    'era_label': 'English Civil War \u00b7 1642\u20131651',
    'sec_class': 'sec-broken',
    'sec_label': 'Royalist nomenclators \u2014 broken by Wallis',
    'tagline': 'Cromwell\u2019s mathematician became the first professional English cryptanalyst \u2014 and then served every English government for half a century without changing sides.',
    'facts': [
      ('Cryptanalyst', 'John Wallis (1616\u20131703), Savilian Professor of Geometry, Oxford'),
      ('Targets', 'Royalist nomenclators (Charles I, Prince Rupert, the King\u2019s court)'),
      ('Period', 'Professional cryptanalyst 1642 \u2013 1703'),
      ('Mechanism', 'Nomenclator + 2-digit homophonic alphabet'),
      ('Patrons', 'Parliament, then Cromwell, then Charles II, then James II, then William III'),
    ],
    'panels': [
      ('\U0001f4dc', 'Historical Context',
       "<p>John Wallis (1616\u20131703) was a Cambridge-trained mathematician, ordained Anglican clergyman, and \u2014 from 1649 \u2014 Savilian Professor of Geometry at Oxford. He was also one of the founders of the Royal Society. None of this is what made him historically important to cryptography.</p>"
       "<p style=\"margin-top:1rem;\">In late 1642, at the start of the English Civil War, Wallis was shown a captured Royalist letter by a friend at dinner. He broke it in two hours. Word spread. By 1643 he was Parliament\u2019s house cryptanalyst, reading the King\u2019s correspondence as it was intercepted. After Naseby (1645) the captured King\u2019s cabinet of letters was given to Wallis to decipher; the resulting publication, <em>The King\u2019s Cabinet Opened</em>, devastated Royalist propaganda by exposing Charles I\u2019s secret negotiations with Catholic Ireland.</p>"
       "<p style=\"margin-top:1rem;\">Wallis kept his post through every regime change. He served Parliament, then Oliver Cromwell, then Charles II at the Restoration (Charles II is said to have grumbled that Wallis had \u201cbroken his father\u2019s ciphers\u201d but kept him on anyway), then James II, then William III. He was still actively breaking diplomatic ciphers for the English government when he died at 87. He is the founding figure of professional English state cryptanalysis \u2014 the institutional ancestor of the Government Code &amp; Cypher School and ultimately of GCHQ.</p>"),
      ('\u2699\ufe0f', 'How It Works',
       "<p>The Royalist ciphers Wallis attacked were Argenti-pattern nomenclators of the standard 17th-century kind: a small alphabetic substitution table (often with one or two homophones for common letters) plus a longer codebook of person-and-place codes. Royalist operators were also fond of nulls and of inserting the names of their own family members as agreed cover-words.</p>"
       "<p style=\"margin-top:1rem;\">The demo above implements this dominant design: a 60-word codebook of English Civil War vocabulary (people, places, military terms) using 3-digit codes from <code>100</code>, plus a keyed 2-digit homophonic alphabet (codes 10\u201389) for words not in the codebook \u2014 wrapped in sentinel codes <code>90</code> and <code>91</code> so the decoder can tell which is which. Try encoding <code>KING CHARLES MARCH OXFORD</code> to see how the codebook handles the named entities directly.</p>"
       "<p style=\"margin-top:1rem;\">Wallis\u2019s attack technique was the standard one of the next two centuries: identify the most-frequent codes, guess the alphabet portion against expected high-frequency English letters, look for repeated <em>codeword</em> patterns that match expected proper nouns (\u201cthe King\u201d, \u201cParliament\u201d, \u201cOxford\u201d), and bootstrap from there. He was unusually fast at it.</p>"),
      ('\U0001f480', 'How It Was Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Wallis\u2019s frequency-and-context attack</div><div class=\"attack-diff\">Complexity: A few hours per nomenclator for an experienced analyst</div><p class=\"attack-desc\">Once Wallis had read a few intercepts in a given system he could identify codewords by their distribution: a code that appeared once or twice per letter, around proper noun positions, was almost always a person or place name. He kept running tables of broken codewords and shared them across the war effort. The Royalists never developed an equivalent counter-cryptography effort.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Operational laxity by the Royalists</div><div class=\"attack-diff\">Complexity: Self-inflicted</div><p class=\"attack-desc\">Royalist agents reused nomenclators across years, mixed plaintext and cipher in the same letter, and sometimes labelled their codebook entries with the person\u2019s actual name in the margin. Captured agents carried codebooks; captured letters carried decryption hints. By 1645 Wallis had a substantial library of broken material.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Wallis\u2019s longevity</div><div class=\"attack-diff\">Complexity: Sixty years of cumulative expertise</div><p class=\"attack-desc\">Because Wallis worked continuously for the English state from 1643 to his death in 1703, he accumulated a body of cryptographic knowledge unmatched in Europe. Continental ciphers he had broken decades earlier were still being modestly evolved by their users. He recorded much of his technique in cipher notes now in the Bodleian Library.</p></div>"),
      ('\U0001f52c', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>Wallis lesson</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>Concentrated, persistent, well-funded cryptanalysis beats episodic effort</td><td>Modern signals intelligence: NSA, GCHQ \u2014 the same institutional pattern, scaled</td></tr>"
       "<tr><td>Operational discipline matters as much as algorithm choice</td><td>Modern crypto failures are almost always implementation or operational, not algorithmic</td></tr>"
       "<tr><td>Cumulative knowledge across years compounds the attacker\u2019s advantage</td><td>Why crypto-agility &amp; aggressive deprecation cycles are now standard</td></tr>"
       "<tr><td>The defender publishes; the attacker doesn\u2019t</td><td>Why open cryptanalysis (NIST competitions, IACR) is so valuable to defenders</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('argenti', 'Argenti Family Cipher', 'The Italian tradition Wallis grew up attacking'),
      ('great-cipher', 'Great Cipher of Louis XIV', 'A contemporary French nomenclator that lasted 200 years longer'),
      ('babington', 'Babington Plot Cipher', 'An earlier real-time break of the same cipher family'),
      ('vigenere', 'Vigen\u00e8re Cipher', 'The polyalphabetic alternative that chanceries spent 300 years not adopting'),
    ],
    'prev': ('argenti', 'Argenti Family Cipher'),
    'next': ('great-cipher', 'Great Cipher of Louis XIV'),
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
