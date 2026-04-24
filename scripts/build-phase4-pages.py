#!/usr/bin/env python3
"""Round 3 Phase 4 (Hall VII WWII / Cold War cipher machines) page generator.

Produces 5 exhibits: Fialka M-125, KL-7 ADONIS, Geheimschreiber T52 (Sturgeon),
Kryha, and M-94 / CSP-488. Mirrors the conventions used by the Phase 5 builder
so demo-loader.js, the test suites, the lightbox, and the nav injection all
pick the page up automatically.
"""
import os
import sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CIPHERS = os.path.join(REPO, 'ciphers')

PAGES = [
  {
    'slug': 'fialka',
    'title': 'Fialka M-125',
    'subtitle': 'Soviet 10-rotor machine · 1956',
    'meta_desc': "The Soviet Cold-War rotor machine. Ten rotors, half stepping forward and half backward, plus a punch-card key sheet — the answer to every weakness Soviet analysts saw in Enigma.",
    'hall_href': '../halls/machines.html',
    'hall_label': 'Hall VII: Mechanical Cipher Machines',
    'hall_short': 'Hall VII · Machines',
    'page_meta_label': 'Hall VII · Machines',
    'era_class': 'era-coldwar',
    'era_label': 'Cold War · 1956',
    'sec_class': 'sec-secure',
    'sec_label': 'Never broken (in service)',
    'tagline': 'Ten rotors, alternating direction, plus a punched-card key sheet — the Soviet answer to every Enigma weakness.',
    'facts': [
      ('Origin', 'Soviet Union (Warsaw Pact issue)'),
      ('Year', 'In service 1956 \u2013 ~1990'),
      ('Rotors', '10 (alternating forward/reverse stepping)'),
      ('Reflector', 'Yes, but unlike Enigma the rotor wiring is not symmetric'),
      ('Status', 'No public break of operational traffic; declassified after 1991'),
    ],
    'panels': [
      ('\U0001f4dc', 'Historical Context',
       "<p>The Fialka (\u201cViolet\u201d) M-125 was the standard cipher machine of the Soviet Union and the Warsaw Pact from the late 1950s into the 1990s. Each Warsaw Pact country received variants with national keyboards (Cyrillic, Latin, Polish, Czech, etc.), but the cryptographic core was identical \u2014 every signal between Moscow, Warsaw, Prague, and East Berlin passed through some flavour of Fialka.</p>"
       "<p style=\"margin-top:1rem;\">It was designed by engineers who had read everything the Soviets recovered about Enigma, and who set out to fix every weakness they found. The result is a machine that looks superficially like Enigma but is, internally, far more careful.</p>"),
      ('\u2699\ufe0f', 'How It Works',
       "<p>Ten rotors sit on a single spindle. Five of them step <strong>forward</strong> on each keypress, and the other five step <strong>backward</strong>. Each rotor advances at its own rate; the stepping pattern is irregular and depends on punched-card key sheets that change daily.</p>"
       "<p style=\"margin-top:1rem;\">Three further design choices matter:</p>"
       "<ul style=\"margin:0.5rem 0 0 1.5rem;line-height:1.8;\">"
       "<li><strong>Asymmetric reflector.</strong> Enigma\u2019s reflector forced the property that no letter could ever encipher to itself (a fatal crib-fitter\u2019s gift). Fialka\u2019s reflector and rotor wiring are arranged so this never holds for the operator.</li>"
       "<li><strong>Per-message key card.</strong> Operators punched the daily key on a card that physically reconfigured rotor order, ring settings, and stepping. There was no plug-board to mis-set.</li>"
       "<li><strong>Numeric alphabet.</strong> The rotor alphabet has 30 contacts, not 26 \u2014 enough to cover Cyrillic plus digits without a separate \u201cfigures\u201d shift.</li>"
       "</ul>"),
      ('\U0001f480', 'How It Was (Not) Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">No public cryptanalytic break</div><div class=\"attack-diff\">Complexity: Believed infeasible without key material</div><p class=\"attack-desc\">No Western agency has admitted to reading Fialka traffic by cryptanalysis. The combination of ten irregularly-stepping rotors and daily key cards puts the workload well beyond contemporary Enigma-style hand methods.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Compromise via key material and HUMINT</div><div class=\"attack-diff\">Complexity: N/A \u2014 traffic decrypted using stolen settings, not cryptanalysis</div><p class=\"attack-desc\">What Western intelligence did read it read by stealing key cards or capturing operators \u2014 the same way the Soviets read American traffic via Walker. Fialka\u2019s mathematics held; its <em>operational</em> security was the leak.</p></div>"),
      ('\U0001f52c', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>Fialka design choice</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>Bidirectional rotor stepping</td><td>Modern stream ciphers mix several clocks at coprime rates (A5/1, Trivium)</td></tr>"
       "<tr><td>Removing \u201cno letter encrypts to itself\u201d</td><td>Bias removal in modern S-box design</td></tr>"
       "<tr><td>Daily punched-card key</td><td>Per-session symmetric keys derived from a master key</td></tr>"
       "<tr><td>Compromise was operational, not mathematical</td><td>Most real-world breaks today are still implementation, not algorithmic</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('enigma', 'Enigma', 'The machine Fialka was explicitly designed to outdo'),
      ('sigaba', 'SIGABA', 'The American contemporary that also resisted attack'),
      ('kl-7', 'KL-7', 'NATO\u2019s answer to Fialka in the same period'),
    ],
    'prev': ('sigaba', 'SIGABA'),
    'next': ('kl-7', 'KL-7'),
  },
  {
    'slug': 'kl-7',
    'title': 'KL-7 ADONIS',
    'subtitle': 'NATO eight-rotor machine · 1952',
    'meta_desc': "The KL-7 (ADONIS) was NATO\u2019s standard cipher machine from 1952 to 1968. Eight rotors, seven of which stepped, on a re-entrant alphabet. Compromised by John Walker, not by cryptanalysis.",
    'hall_href': '../halls/machines.html',
    'hall_label': 'Hall VII: Mechanical Cipher Machines',
    'hall_short': 'Hall VII · Machines',
    'page_meta_label': 'Hall VII · Machines',
    'era_class': 'era-coldwar',
    'era_label': 'Cold War · 1952',
    'sec_class': 'sec-secure',
    'sec_label': 'Never broken cryptanalytically',
    'tagline': 'Eight rotors, irregular stepping, re-entrant alphabet \u2014 the rotor machine NATO trusted with everything until John Walker handed the keys to the Soviets.',
    'facts': [
      ('Origin', 'United States (NSA), then NATO-wide'),
      ('Year', 'In service 1952 \u2013 1968 (replaced by KW-26 / KL-43)'),
      ('Rotors', '8 (one stationary; the other 7 step irregularly)'),
      ('Alphabet', 'Re-entrant 36 contacts (26 letters + control codes)'),
      ('Compromise', 'Walker spy ring delivered key lists 1968\u20131985'),
    ],
    'panels': [
      ('\U0001f4dc', 'Historical Context',
       "<p>The KL-7, code-named ADONIS, was the rotor machine that carried NATO\u2019s most sensitive traffic for almost two decades. It encrypted everything from US Navy submarine orders to NATO command messages. By 1965 the United States alone had over 25,000 KL-7 units in service.</p>"
       "<p style=\"margin-top:1rem;\">Cryptanalytically, the KL-7 was never broken. Operationally, it suffered the most damaging spy compromise in modern American history: Navy Chief Warrant Officer John Walker sold its key lists to the Soviets from 1968 to 1985, allowing the KGB to read US Navy traffic in near real time.</p>"),
      ('\u2699\ufe0f', 'How It Works',
       "<p>Eight rotors sit on a spindle, but only <strong>seven step</strong>; the eighth is stationary and acts as a permutation between the rotor stack and the keyboard mapping. The seven moving rotors advance under the control of a notch table that changes daily, producing an irregular stepping pattern reminiscent of SIGABA but mechanically lighter.</p>"
       "<p style=\"margin-top:1rem;\">Two further details matter for security:</p>"
       "<ul style=\"margin:0.5rem 0 0 1.5rem;line-height:1.8;\">"
       "<li><strong>Re-entrant alphabet.</strong> The rotor alphabet is wider than 26 (it carries numerals, space, and control codes), so the keyboard mapping is not a fixed bijection on A\u2013Z. This breaks the symmetry that crib-fitters exploited in Enigma.</li>"
       "<li><strong>No reflector.</strong> Signal flow is one-way through the rotor stack \u2014 there is no Enigma-style reflection that forces \u201cno letter encrypts to itself\u201d.</li>"
       "</ul>"),
      ('\U0001f480', 'How It Was (Not) Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">No public cryptanalytic break</div><div class=\"attack-diff\">Complexity: Believed infeasible without key material</div><p class=\"attack-desc\">Through 17 years of operational use and another 30 of declassified study, no published attack on the KL-7 cipher itself has appeared. The eight-rotor stack with irregular stepping puts it well beyond Enigma-class workloads.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">The Walker spy ring (1968\u20131985)</div><div class=\"attack-diff\">Complexity: N/A \u2014 keys were stolen, not derived</div><p class=\"attack-desc\">John Walker, a US Navy communications watch officer, photographed KL-7 key lists and sold them to the KGB through a network that included his brother, son, and a friend. The Soviets read US Navy traffic for the entire period \u2014 the most damaging American cipher compromise of the Cold War. Walker was arrested in 1985.</p></div>"),
      ('\U0001f52c', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>KL-7 lesson</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>Rotor stepping that breaks Enigma\u2019s regularity</td><td>Modern stream ciphers irregularly clock multiple LFSRs (A5/1)</td></tr>"
       "<tr><td>Re-entrant alphabet defeats fixed-bijection cribs</td><td>Authenticated encryption breaks the \u201cknown header\u201d crib path</td></tr>"
       "<tr><td>Walker compromise: stolen keys are total breaks</td><td>Why HSMs, key wrapping, and split-knowledge protocols exist</td></tr>"
       "<tr><td>The whole machine was secure; the people leaked</td><td>Modern threat models put insider risk near the top</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('sigaba', 'SIGABA', 'The American WWII rotor machine the KL-7 succeeded'),
      ('fialka', 'Fialka', 'The Soviet contemporary on the other side of the line'),
      ('enigma', 'Enigma', 'The machine whose weaknesses both KL-7 and Fialka avoided'),
    ],
    'prev': ('fialka', 'Fialka M-125'),
    'next': ('geheimschreiber', 'Geheimschreiber T52'),
  },
  {
    'slug': 'geheimschreiber',
    'title': 'Geheimschreiber T52 (Sturgeon)',
    'subtitle': 'Siemens & Halske teleprinter cipher',
    'meta_desc': "The Siemens T52 \u201cSturgeon\u201d \u2014 a German WWII teleprinter cipher with ten irregularly-clocked wheels feeding an additive keystream and a per-character permutation. Broken by Arne Beurling and the Swedish FRA in summer 1940.",
    'hall_href': '../halls/machines.html',
    'hall_label': 'Hall VII: Mechanical Cipher Machines',
    'hall_short': 'Hall VII · Machines',
    'page_meta_label': 'Hall VII · Machines',
    'era_class': 'era-wwii',
    'era_label': 'WWII · 1932\u20131945',
    'sec_class': 'sec-broken',
    'sec_label': 'Broken (Beurling, 1940)',
    'tagline': 'A teleprinter cipher with ten wheels and ten thousand operators \u2014 broken in two weeks by one Swedish mathematician with pencil and paper.',
    'facts': [
      ('Origin', 'Siemens & Halske, Germany'),
      ('Year', 'Deployed ~1932; in heavy WWII use 1940\u20131945'),
      ('Wheels', '10 (5 generate keystream, 5 select permutation)'),
      ('Plaintext', '5-bit Baudot teleprinter code'),
      ('Broken by', 'Arne Beurling, FRA Sweden, May\u2013June 1940'),
    ],
    'panels': [
      ('\U0001f4dc', 'Historical Context',
       "<p>While Lorenz SZ40/42 (\u201cTunny\u201d) carried Hitler\u2019s strategic traffic, the Siemens & Halske T52 \u2014 codenamed \u201cSturgeon\u201d at Bletchley Park \u2014 carried Luftwaffe and Wehrmacht command traffic over leased Swedish telephone lines from 1940. That choice of physical medium turned out to be a catastrophic mistake.</p>"
       "<p style=\"margin-top:1rem;\">In summer 1940 the Swedish military intelligence service (FRA) handed Arne Beurling, a 35-year-old mathematician at Uppsala University, a stack of intercepted telegrams. He was given no machine, no diagram, no captured material. Two weeks later he handed back a complete reconstruction of the T52 algorithm, derived from the ciphertext alone. By 1942 the FRA was reading 200 messages per day. It is among the most extraordinary cryptanalytic feats of the twentieth century.</p>"),
      ('\u2699\ufe0f', 'How It Works',
       "<p>The T52 is a teleprinter cipher. Plaintext is encoded in 5-bit Baudot characters and combined with a keystream generated by ten wheels with coprime lengths (47, 53, 59, 61, 67, 71, 73, 79, 83, 89). The wheels are split into two roles:</p>"
       "<ul style=\"margin:0.5rem 0 0 1.5rem;line-height:1.8;\">"
       "<li><strong>Five wheels generate an additive keystream</strong> that shifts each character.</li>"
       "<li><strong>Five wheels select, per character, one of several keyed substitution permutations</strong> applied after the additive shift.</li>"
       "</ul>"
       "<p style=\"margin-top:1rem;\">In the original T52 the substitution is a bit-permutation on the 5-bit Baudot code. The educational demo above operates on the 26-letter alphabet using mod-26 addition and six keyed permutations of A\u2013Z, which preserves the architectural lesson \u2014 additive keystream plus per-character permutation, ten coprime-length wheels \u2014 while keeping the round-trip clean for arbitrary text.</p>"),
      ('\U0001f480', 'How It Was Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Beurling\u2019s reconstruction (1940)</div><div class=\"attack-diff\">Complexity: One mathematician, two weeks, ciphertext only</div><p class=\"attack-desc\">Beurling exploited two German operating errors. First, the ten wheel lengths are coprime, so the keystream period is enormous \u2014 but operators frequently sent two messages with the <em>same wheel start position</em>, producing a depth. Second, German operators padded with the figure-shift character, which had a distinctive bit pattern that survived the additive masking. With several deep messages and the bias from padding, Beurling derived the wheel motion algebraically.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">App, the electromechanical breaker</div><div class=\"attack-diff\">Complexity: Industrialised the daily settings hunt</div><p class=\"attack-desc\">The FRA built an electromechanical machine called \u201cAppen\u201d that recovered the daily wheel positions automatically once the wiring was known. By 1942 the Swedes were reading T52 traffic at production scale and quietly informing the Allies.</p></div>"),
      ('\U0001f52c', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>Sturgeon lesson</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>Re-using a keystream produces a depth</td><td>Why nonces are mandatory and never reused (AES-GCM, ChaCha20)</td></tr>"
       "<tr><td>Predictable padding leaks the keystream</td><td>Padding oracle attacks (Vaudenay, POODLE)</td></tr>"
       "<tr><td>Coprime wheel lengths \u2260 cryptographic security</td><td>Period \u2260 unpredictability \u2014 modern PRGs require statistical tests</td></tr>"
       "<tr><td>Ciphertext-only break of a complex machine</td><td>The defender must assume the attacker has only ciphertext, not vice versa</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('lorenz', 'Lorenz SZ40/42', 'The other German teleprinter cipher \u2014 broken at Bletchley with Colossus'),
      ('enigma', 'Enigma', 'The German tactical companion to Sturgeon\u2019s strategic role'),
      ('vernam', 'Vernam Cipher', 'The teleprinter additive on which the entire family is built'),
    ],
    'prev': ('kl-7', 'KL-7 ADONIS'),
    'next': ('kryha', 'Kryha'),
  },
  {
    'slug': 'kryha',
    'title': 'Kryha',
    'subtitle': 'Pocket cipher machine · 1924',
    'meta_desc': "Alexander von Kryha\u2019s 1924 pocket cipher \u2014 a clockwork-driven mixed alphabet wheel sold to banks and diplomats as unbreakable, then broken in two hours by William Friedman.",
    'hall_href': '../halls/machines.html',
    'hall_label': 'Hall VII: Mechanical Cipher Machines',
    'hall_short': 'Hall VII · Machines',
    'page_meta_label': 'Hall VII · Machines',
    'era_class': 'era-modern',
    'era_label': 'Inter-war commercial · 1924',
    'sec_class': 'sec-broken',
    'sec_label': 'Broken (Friedman, 1933)',
    'tagline': 'Sold as the unbreakable cipher of the future. Friedman broke a 1135-letter test message in 2 hours 41 minutes.',
    'facts': [
      ('Origin', 'Alexander von Kryha, Berlin'),
      ('Year', 'Patented 1924; sold widely 1924\u20131930s'),
      ('Mechanism', 'Single mixed alphabet wheel, clockwork-driven'),
      ('Marketed as', 'Unbreakable; recommended by German banks and diplomats'),
      ('Broken by', 'William Friedman & Solomon Kullback, US Army SIS, 1933'),
    ],
    'panels': [
      ('\U0001f4dc', 'Historical Context',
       "<p>Alexander von Kryha was a Ukrainian-born engineer who emigrated to Berlin after the Russian Revolution and patented his \u201cKryha Chiffriermaschine\u201d in 1924. It was the first widely-marketed civilian cipher machine: a brass case the size of a pocket watch, sold to German banks, embassies, and businesses with extravagant claims of unbreakability.</p>"
       "<p style=\"margin-top:1rem;\">Sales pitches included challenge messages with cash prizes. Kryha\u2019s machine was used commercially through the late 1920s and was even adopted by the German Foreign Office for some diplomatic traffic \u2014 a decision that intelligence historians regard as one of the more avoidable cryptographic mistakes of the inter-war period.</p>"),
      ('\u2699\ufe0f', 'How It Works',
       "<p>Two concentric wheels: a fixed outer ring of plaintext letters and an inner wheel carrying a <em>mixed</em> alphabet. The operator types a letter on the outer ring, reads off the cipher letter from the inner wheel, then triggers a spring-driven escapement that advances the inner wheel by an irregular number of positions \u2014 between 1 and roughly 26 \u2014 according to a stepping pattern fixed by the wheel design.</p>"
       "<p style=\"margin-top:1rem;\">The advertising claimed astronomical key spaces by counting wheel orientations and stepping pawls. The reality is that the inner wheel is a single mixed alphabet rotated by a finite, repeating sequence of step sizes \u2014 a polyalphabetic cipher with a long but eventually periodic key.</p>"),
      ('\U0001f480', 'How It Was Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Friedman & Kullback, 1933</div><div class=\"attack-diff\">Complexity: Two analysts, 2 hours 41 minutes, ciphertext only</div><p class=\"attack-desc\">William Friedman and Solomon Kullback at the US Army Signal Intelligence Service were given a 1135-letter test message generated by a Kryha. Recognising the periodic structure of the stepping, they reduced the cipher to a small number of correlated substitutions, applied frequency analysis to each, and recovered the plaintext in 2 hours 41 minutes. Their internal report became a standard demonstration of how marketing claims fail under analysis.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Kasiski / index of coincidence</div><div class=\"attack-diff\">Complexity: Routine for any polyalphabetic with finite period</div><p class=\"attack-desc\">Because the stepping repeats, the Kryha is asymptotically a Vigen\u00e8re-like cipher with a long, mixed-alphabet key. The same techniques that work on Vigen\u00e8re \u2014 Kasiski examination to find the period, then frequency analysis on each column \u2014 work on Kryha as soon as you have a few hundred characters of ciphertext.</p></div>"),
      ('\U0001f52c', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>Kryha lesson</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>Counting wheel orientations \u2260 key strength</td><td>Key length \u2260 entropy in modern key analysis</td></tr>"
       "<tr><td>Vendor unbreakability claims with no public review</td><td>\u201cTrust us\u201d crypto vs. open peer-reviewed standards</td></tr>"
       "<tr><td>Fixed stepping pattern = finite period</td><td>Why modern stream ciphers need state at least as large as the security level</td></tr>"
       "<tr><td>2 hours 41 minutes is a long time to admire a cipher</td><td>Time-to-first-break is the only honest security claim</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('jefferson-disk', 'Jefferson Disk', 'The 18th-century pocket cipher Kryha was meant to modernise'),
      ('enigma', 'Enigma', 'The contemporary commercial machine that did achieve real complexity'),
      ('hagelin', 'Hagelin C-38 / M-209', 'The other commercial pocket machine that actually saw secure use'),
    ],
    'prev': ('geheimschreiber', 'Geheimschreiber T52'),
    'next': ('m-94', 'M-94 / CSP-488'),
  },
  {
    'slug': 'm-94',
    'title': 'M-94 / CSP-488',
    'subtitle': 'US Army strip / disk cipher · 1922',
    'meta_desc': "The M-94 (Army) and CSP-488 (Navy) \u2014 25 brass disks on a spindle, each carrying a mixed alphabet. Jefferson\u2019s 1795 idea, mass-produced for WWI tactical traffic and used into 1942.",
    'hall_href': '../halls/machines.html',
    'hall_label': 'Hall VII: Mechanical Cipher Machines',
    'hall_short': 'Hall VII · Machines',
    'page_meta_label': 'Hall VII · Machines',
    'era_class': 'era-modern',
    'era_label': 'WWI \u2192 WWII tactical · 1922\u20131942',
    'sec_class': 'sec-broken',
    'sec_label': 'Tactical only',
    'tagline': 'Twenty-five disks on a spindle. Jefferson\u2019s 1795 idea, finally mass-produced \u2014 and tactical-only by then.',
    'facts': [
      ('Origin', 'United States Army (Mauborgne, Hitt)'),
      ('Year', 'In service 1922 \u2013 1943'),
      ('Mechanism', '25 brass disks on a spindle, each a mixed alphabet'),
      ('Lineage', 'Direct descendant of the Jefferson cipher wheel (1795)'),
      ('Status', 'Tactical only; never trusted for strategic traffic'),
    ],
    'panels': [
      ('\U0001f4dc', 'Historical Context',
       "<p>Thomas Jefferson sketched a cipher wheel of 36 lettered disks on a spindle around 1795, used it briefly, and tucked the design away \u2014 it was rediscovered in his papers in 1922. Within months the US Army adopted essentially the same idea as the M-94 (the Navy version was the CSP-488). It is the only major US cipher system whose direct ancestor is a Founding Father.</p>"
       "<p style=\"margin-top:1rem;\">The M-94 served as the standard tactical cipher of the US Army through the 1920s and 1930s and was still in field use in early WWII alongside the M-209 and SIGABA. It was retired in 1943, by which point its tactical-level security was acknowledged as marginal.</p>"),
      ('\u2699\ufe0f', 'How It Works',
       "<p>Twenty-five aluminum or brass disks slide onto a single spindle. Each disk has the 26 letters of the alphabet engraved around its rim in a different mixed order, and each carries a number (1 through 25) for ordering on the spindle. To encrypt:</p>"
       "<ol style=\"margin:0.5rem 0 0 1.5rem;line-height:1.8;\">"
       "<li>Both sender and recipient agree on the order of the 25 disks for the day.</li>"
       "<li>The sender turns each disk so that the plaintext message reads horizontally across one row.</li>"
       "<li>The sender then chooses any <em>other</em> row and reads the ciphertext off horizontally.</li>"
       "</ol>"
       "<p style=\"margin-top:1rem;\">The recipient stacks the disks in the same agreed order, dials in the ciphertext on the corresponding row, and looks for the row that reads as English. Because there are 25 rows, only one will be sensible plaintext \u2014 the rest are gibberish.</p>"),
      ('\U0001f480', 'How It Was Broken',
       "<div class=\"attack-panel\"><div class=\"attack-name\">Multiple-anagram attack on the disk order</div><div class=\"attack-diff\">Complexity: Tractable for short tactical traffic</div><p class=\"attack-desc\">The cipher\u2019s key is the daily disk-order permutation (25!) and the chosen offset row. With several intercepts of similar length the analyst can superimpose them at the same offset; columns then come from the same disk, and a multiple-anagram attack on the columns recovers the disk order. The Friedman / Kullback team at the SIS demonstrated practical breaks well before WWII.</p></div>"
       "<div class=\"attack-panel\" style=\"margin-top:1rem;\"><div class=\"attack-name\">Captured disk sets</div><div class=\"attack-diff\">Complexity: Trivial once disks are in hand</div><p class=\"attack-desc\">A disk set captured intact reduces the daily key from 25! to 25! / (25 \u22c5 24!) \u2014 you only need the order, not the wirings. The US Army accepted this risk for tactical traffic and reserved SIGABA for anything strategic.</p></div>"),
      ('\U0001f52c', 'What It Teaches Modern Cryptography',
       "<table class=\"cipher-table\">"
       "<thead><tr><th>M-94 lesson</th><th>Modern echo</th></tr></thead>"
       "<tbody>"
       "<tr><td>The hardware key (disk wiring) is the standing key</td><td>Modern HSMs hold a master key with a long lifetime</td></tr>"
       "<tr><td>The session key is just the disk order</td><td>Modern session keys are derived per-message from a master</td></tr>"
       "<tr><td>Tactical vs strategic security tiers</td><td>Modern crypto-agility \u2014 different protections for different threat models</td></tr>"
       "<tr><td>Jefferson\u2019s 127-year lag to deployment</td><td>Good cryptographic ideas often arrive decades before the engineering catches up</td></tr>"
       "</tbody></table>"),
    ],
    'related': [
      ('jefferson-disk', 'Jefferson Disk', 'The 1795 prototype that became the M-94'),
      ('m209', 'M-209', 'The pin-and-lug tactical cipher that succeeded the M-94'),
      ('sigaba', 'SIGABA', 'The strategic machine that backstopped M-94 tactical traffic'),
    ],
    'prev': ('kryha', 'Kryha'),
    'next': ('jefferson-disk', 'Jefferson Disk'),
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
