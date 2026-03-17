#!/usr/bin/env python3
"""
SEO & Polish Upgrade for The Cipher Museum
Run: python3 scripts/seo-upgrade.py

Idempotent — safe to run multiple times.
Adds: meta descriptions, Open Graph tags, Twitter cards,
      canonical URLs, favicon links, theme-color.
Fixes: exhibit count "of 33" → "of 37".
"""
import os, re, html

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMAIN = 'https://ciphermuseum.com'

DESCRIPTIONS = {
    # ── Root pages ──
    'index.html': 'Walk through 10 exhibit halls spanning 2,500 years of cryptographic history. Explore 37 ciphers, interactive demos, and codebreaking challenges.',
    'challenges.html': 'Break real ciphers. Six progressively harder challenges — from Caesar to Enigma.',
    'cryptanalysis.html': 'Learn how codebreakers crack ciphers. Frequency analysis, Kasiski examination, index of coincidence, and modern computational methods.',
    'glossary.html': 'Cryptography glossary: definitions of ciphers, cryptanalysis, key exchange, and encryption concepts from ancient to modern.',
    'modern.html': 'From AES and RSA to quantum cryptography — explore how modern encryption protects the digital world.',
    'museum-map.html': 'Navigate all 10 exhibit halls and 37 cipher exhibits in The Cipher Museum. Find your next cryptographic adventure.',
    'timeline.html': 'Visual history of encryption from 400 BC to the quantum age. Walk through 2,400 years of codes, ciphers, and codebreakers.',
    # ── Hall pages ──
    'halls/ancient.html': 'Ancient ciphers from Sparta\u2019s scytale to Caesar\u2019s substitution. The first 2,000 years of secret writing.',
    'halls/substitution.html': 'Classical substitution ciphers: monoalphabetic, homophonic, and Polybius square techniques that shaped cryptography for centuries.',
    'halls/polyalphabetic.html': 'The polyalphabetic revolution: Vigen\u00e8re, Beaufort, Porta, and the ciphers that defeated simple frequency analysis.',
    'halls/transposition.html': 'Transposition and fractionation ciphers: rail fence, columnar, bifid, trifid, and ADFGVX systems.',
    'halls/military.html': 'Military and spy ciphers used in real warfare: Nihilist, VIC, Stager, and Confederate systems.',
    'halls/civil-war.html': 'Civil War cryptography: the Stager cipher, Confederate Vigen\u00e8re, and dictionary codes from the American Civil War.',
    'halls/machines.html': 'Mechanical cipher machines: Enigma, Lorenz, Jefferson Disk, and Alberti\u2019s original cipher disk.',
    'halls/puzzle.html': 'Puzzle and novelty ciphers: Pigpen, Bacon\u2019s bilateral, tap code, and other creative encoding systems.',
    'halls/unbreakable.html': 'One-Time Pad, Vernam cipher, and Claude Shannon\u2019s proof of perfect secrecy \u2014 where classical cryptography reached its limits.',
    'halls/codebreakers.html': 'Ten moments when human ingenuity broke what mathematics could not. From Al-Kindi in 850 AD to the Zodiac cipher solved in 2020.',
    # ── Cipher pages ──
    'ciphers/caesar.html': 'Caesar cipher \u2014 the simplest substitution cipher, used by Julius Caesar with a shift of 3. Interactive demo with all 25 shifts.',
    'ciphers/polybius.html': 'Polybius square \u2014 the ancient Greek 5\u00d75 grid converting letters to coordinate pairs. Foundation for bifid, trifid, and ADFGVX.',
    'ciphers/monoalphabetic.html': 'Monoalphabetic substitution \u2014 replacing each letter with a fixed substitute. The foundation of all substitution ciphers.',
    'ciphers/homophonic.html': 'Homophonic substitution \u2014 defeating frequency analysis by mapping each letter to multiple ciphertext symbols.',
    'ciphers/playfair.html': 'Interactive Playfair cipher exhibit: build a live 5\u00d75 key square, visualize digraph encryption rules, and encrypt or decrypt messages in real time.',
    'ciphers/hill.html': 'Hill cipher \u2014 Lester Hill\u2019s 1929 matrix-based polygraphic cipher, the first using linear algebra for encryption.',
    'ciphers/vigenere.html': 'Vigen\u00e8re cipher \u2014 the \u201cindecipherable cipher\u201d that resisted cryptanalysis for 300 years. Interactive tabula recta demo.',
    'ciphers/beaufort.html': 'Beaufort cipher \u2014 Sir Francis Beaufort\u2019s self-reciprocal variant of Vigen\u00e8re where encrypt and decrypt are identical.',
    'ciphers/porta.html': 'Porta cipher \u2014 della Porta\u2019s 1563 self-reciprocal polyalphabetic cipher using a 13-alphabet tableau. Interactive demo.',
    'ciphers/gronsfeld.html': 'Gronsfeld cipher \u2014 a Vigen\u00e8re variant using a numeric key (digits 0\u20139) instead of a keyword. Interactive demo.',
    'ciphers/running-key.html': 'Running key cipher \u2014 a Vigen\u00e8re variant using a book passage as the key, making the key as long as the message.',
    'ciphers/rail-fence.html': 'Rail fence cipher \u2014 a transposition cipher writing messages in zigzag patterns across rails. Interactive demo.',
    'ciphers/columnar.html': 'Columnar transposition cipher \u2014 rearrange message columns by keyword order. Interactive demo and step-by-step visualization.',
    'ciphers/double-transposition.html': 'Double transposition cipher \u2014 applying columnar transposition twice for stronger security. Used by militaries through WWII.',
    'ciphers/bifid.html': 'Bifid cipher \u2014 F\u00e9lix Delastelle\u2019s 1901 fractionation cipher combining substitution and transposition on a Polybius square.',
    'ciphers/trifid.html': 'Trifid cipher \u2014 Delastelle\u2019s three-dimensional extension of the bifid, fractionating letters across three coordinate layers.',
    'ciphers/fractionated-morse.html': 'Fractionated Morse cipher \u2014 converting Morse code dots and dashes into letter groups via substitution and fractionation.',
    'ciphers/nihilist.html': 'Nihilist cipher \u2014 the numeric cipher used by Russian revolutionaries, combining Polybius square with modular addition.',
    'ciphers/adfgx.html': 'ADFGX cipher \u2014 predecessor to ADFGVX, broken by Georges Painvin in 1918. Interactive encryption walkthrough.',
    'ciphers/adfgvx.html': 'ADFGVX cipher \u2014 Germany\u2019s WWI field cipher combining Polybius substitution with columnar transposition. Interactive demo.',
    'ciphers/bazeries.html': 'Bazeries cylinder cipher \u2014 \u00c9tienne Bazeries\u2019 1891 improvement on Jefferson\u2019s wheel cipher. Interactive encryption demo.',
    'ciphers/vic.html': 'VIC cipher \u2014 the Soviet espionage cipher used by Reino H\u00e4yh\u00e4nen, one of the most complex hand ciphers ever created.',
    'ciphers/stager.html': 'Stager cipher \u2014 Anson Stager\u2019s Union Army route cipher from the American Civil War, reading words through grid routes.',
    'ciphers/confederate-vigenere.html': 'Confederate Vigen\u00e8re \u2014 the brass cipher disk used by Confederate officers in the American Civil War.',
    'ciphers/dictionary-code.html': 'Confederate dictionary code \u2014 location-based cipher using shared books to encode strategic Civil War messages.',
    'ciphers/one-time-pad.html': 'One-Time Pad \u2014 the only mathematically proven unbreakable cipher. Shannon\u2019s proof, practical limits, and Cold War use.',
    'ciphers/enigma.html': 'Enigma machine \u2014 the electromechanical rotor cipher that secured Nazi communications and how it was broken at Bletchley Park.',
    'ciphers/lorenz.html': 'Lorenz cipher machine \u2014 the German High Command\u2019s teleprinter cipher, broken by Tutte and Colossus at Bletchley Park.',
    'ciphers/jefferson-disk.html': 'Jefferson disk \u2014 Thomas Jefferson\u2019s 1795 wheel cipher, reinvented as the US Army M-94. Interactive demo.',
    'ciphers/alberti-disk.html': 'Alberti cipher disk \u2014 the first polyalphabetic device, invented circa 1467. The tool that launched the cipher revolution.',
    'ciphers/pigpen.html': 'Pigpen cipher \u2014 the geometric substitution cipher used by Freemasons. Each letter maps to a unique angular symbol.',
    'ciphers/bacon.html': 'Bacon\u2019s cipher \u2014 Francis Bacon\u2019s 1605 bilateral cipher hiding messages using two typefaces. Interactive demo included.',
    'ciphers/tap-code.html': 'Tap code \u2014 the POW communication cipher based on a Polybius grid, tapped through walls by Vietnam War prisoners.',
    'ciphers/scytale.html': 'Explore the Scytale \u2014 the oldest known military cipher device, used by Spartan generals around 500 BC.',
    'ciphers/vernam.html': 'Vernam cipher \u2014 Gilbert Vernam\u2019s 1917 XOR teleprinter patent, the direct ancestor of the One-Time Pad and every modern stream cipher.',
    'ciphers/navajo-code-talkers.html': 'The Navajo Code \u2014 a natural language used as an unbreakable battlefield code by 420 Marine Code Talkers in WWII.',
    'ciphers/zodiac.html': 'Zodiac Cipher \u2014 340 characters, 51 years unsolved, broken in 2020 by a three-person team using computational cryptanalysis.',
}

DEFAULT_DESC = 'The Cipher Museum \u2014 interactive history of encryption from Caesar to quantum cryptography. 37 ciphers, 10 exhibit halls, live demos.'


def get_prefix(filepath):
    """Return '../' for subdirectory files, '' for root files."""
    rel = os.path.relpath(filepath, BASE)
    depth = rel.count(os.sep)
    return '../' * depth


def process_file(filepath):
    rel = os.path.relpath(filepath, BASE)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    prefix = get_prefix(filepath)

    # ── 1. Fix exhibit count ──
    content = content.replace('of 33', 'of 37')

    # ── 2. Determine description ──
    existing = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', content)
    desc = existing.group(1) if existing else DESCRIPTIONS.get(rel, DEFAULT_DESC)

    # ── 3. Build tags to insert before <link rel="stylesheet" ──
    tags = ''

    # Meta description
    if '<meta name="description"' not in content:
        safe_desc = html.escape(desc, quote=True)
        tags += f'  <meta name="description" content="{safe_desc}">\n'

    # Open Graph
    if '<meta property="og:' not in content:
        title_m = re.search(r'<title>(.*?)</title>', content)
        title = html.escape(title_m.group(1), quote=True) if title_m else 'The Cipher Museum'
        safe_desc = html.escape(desc, quote=True)
        canonical = DOMAIN + '/' + ('' if rel == 'index.html' else rel)
        tags += f'  <meta property="og:title" content="{title}">\n'
        tags += f'  <meta property="og:description" content="{safe_desc}">\n'
        tags += f'  <meta property="og:type" content="website">\n'
        tags += f'  <meta property="og:url" content="{canonical}">\n'

    # Twitter card
    if '<meta name="twitter:' not in content:
        title_m = re.search(r'<title>(.*?)</title>', content)
        title = html.escape(title_m.group(1) if title_m else 'The Cipher Museum', quote=True)
        safe_desc = html.escape(desc, quote=True)
        tags += f'  <meta name="twitter:card" content="summary">\n'
        tags += f'  <meta name="twitter:title" content="{title}">\n'
        tags += f'  <meta name="twitter:description" content="{safe_desc}">\n'

    # Theme color
    if '<meta name="theme-color"' not in content:
        tags += '  <meta name="theme-color" content="#0a0a0f">\n'

    # Canonical
    if '<link rel="canonical"' not in content:
        canonical = DOMAIN + '/' + ('' if rel == 'index.html' else rel)
        tags += f'  <link rel="canonical" href="{canonical}">\n'

    # Favicon
    if 'rel="icon"' not in content:
        tags += f'  <link rel="icon" type="image/svg+xml" href="{prefix}favicon.svg">\n'

    # Insert all tags before stylesheet
    if tags and '<link rel="stylesheet"' in content:
        content = content.replace('<link rel="stylesheet"', tags + '  <link rel="stylesheet"', 1)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    count = 0
    for root, dirs, files in os.walk(BASE):
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ('node_modules', 'scripts', 'tests')]
        for fname in sorted(files):
            if fname.endswith('.html'):
                fpath = os.path.join(root, fname)
                if process_file(fpath):
                    rel = os.path.relpath(fpath, BASE)
                    print(f'  \u2713 {rel}')
                    count += 1
    print(f'\n\u2714 {count} files updated')


if __name__ == '__main__':
    main()
