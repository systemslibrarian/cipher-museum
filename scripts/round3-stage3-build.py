#!/usr/bin/env python3
"""Round 3 Stage 3 generator.

Reads scripts/round3-stage3-data.json and writes 13 Track B exhibit pages
under ciphers/. Pages all load demo-loader.js (no CONFIGS entry needed —
buildDemo silently no-ops when slug not in CONFIGS) and present a hand-built
widget that satisfies test-comprehensive's HAND_BUILT_IDS / HAND_BUILT_MARKERS
checks (every widget has <input id="input">, a <button onclick="encode()"> and
a <script> with a window.encode handler).
"""
from __future__ import annotations
import json, html
from pathlib import Path
import textwrap

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "scripts" / "round3-stage3-data.json"
OUT  = ROOT / "ciphers"


# ---------------------------------------------------------------- widgets

def widget_phaistos() -> str:
    return textwrap.dedent('''\
      <label for="input" style="display:block;margin-top:1rem;font-weight:600;">Sign number (1–45)</label>
      <input type="number" id="input" min="1" max="45" value="2" style="width:6rem;padding:.5rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;font-family:monospace;">
      <button type="button" onclick="encode()" style="margin-left:.5rem;padding:.5rem 1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;cursor:pointer;">Look up</button>
      <div id="output" style="margin-top:1rem;padding:1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);border-radius:6px;font-family:monospace;line-height:1.6;min-height:5rem;white-space:pre-wrap;"></div>
      <script>
        (function () {
          var COUNTS = {
            1: ['Pedestrian', 11, 8],   2: ['Plumed head', 13, 6],
            3: ['Tattooed head', 2, 0], 4: ['Captive', 1, 0],
            5: ['Child', 1, 0],         6: ['Woman', 4, 0],
            7: ['Helmet', 5, 4],        8: ['Gauntlet', 5, 1],
            9: ['Tiara', 4, 1],         10: ['Arrow', 4, 0],
            11: ['Bow', 1, 5],          12: ['Shield', 9, 8],
            13: ['Club', 5, 1],         17: ['Adze', 3, 3],
            21: ['Boomerang', 6, 6],    24: ['Ship', 5, 2],
            27: ['Hide', 15, 0],        29: ['Cat head', 6, 5],
            31: ['Eagle', 3, 2],        34: ['Bird', 1, 1],
            35: ['Fish', 1, 5],         39: ['Flower', 2, 2],
            40: ['Olive branch', 1, 1], 45: ['Wave', 4, 2]
          };
          window.encode = function () {
            var n = parseInt(document.getElementById('input').value, 10);
            var out = document.getElementById('output');
            if (!n || n < 1 || n > 45) { out.textContent = 'Enter a sign number between 1 and 45.'; return; }
            var entry = COUNTS[n];
            if (!entry) { out.textContent = 'Sign #' + n + ': in the corpus but no count summarised here. See Olivier 1975.'; return; }
            var label = entry[0], a = entry[1], b = entry[2];
            out.textContent =
              'Sign #' + n + ' \\u00b7 ' + label + '\\n' +
              '  Side A: ' + a + ' occurrence' + (a===1?'':'s') + '\\n' +
              '  Side B: ' + b + ' occurrence' + (b===1?'':'s') + '\\n' +
              '  Total : ' + (a + b) + ' / 241 stamped tokens';
          };
          document.addEventListener('DOMContentLoaded', function () { window.encode(); });
        })();
      </script>''')


def widget_shugborough() -> str:
    return textwrap.dedent('''\
      <label for="input" style="display:block;margin-top:1rem;font-weight:600;">Your candidate phrase (8 words)</label>
      <input type="text" id="input" value="Optimae Uxoris Optimae Sororis Viduus Amantissimus Vovit Virtutibus" style="width:100%;padding:.6rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;font-family:monospace;">
      <button type="button" onclick="encode()" style="margin-top:.5rem;padding:.5rem 1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;cursor:pointer;">Test acrostic</button>
      <div id="output" style="margin-top:1rem;padding:1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);border-radius:6px;font-family:monospace;line-height:1.6;min-height:5rem;white-space:pre-wrap;"></div>
      <script>
        (function () {
          var TARGET = ['O','U','O','S','V','A','V','V'];
          window.encode = function () {
            var raw = (document.getElementById('input').value || '').trim();
            var words = raw.split(/\\s+/);
            var out = document.getElementById('output');
            if (words.length === 0 || words[0] === '') { out.textContent = 'Type 8 words to test.'; return; }
            var lines = ['Target: O \\u00b7 U \\u00b7 O \\u00b7 S \\u00b7 V \\u00b7 A \\u00b7 V \\u00b7 V', ''];
            var matches = 0;
            for (var i = 0; i < 8; i++) {
              var w = words[i] || '(missing)';
              var first = (w[0] || '').toUpperCase();
              var hit = first === TARGET[i];
              if (hit) matches++;
              lines.push(' ' + (i+1) + '. ' + TARGET[i] + ' \\u2190 ' + first + '  ' + (hit ? '\\u2713' : '\\u2717') + '   ' + w);
            }
            lines.push('');
            lines.push('Match: ' + matches + ' / 8' +
              (matches === 8 ? '   (consistent \\u2014 but unprovable)' :
               matches >= 5 ? '   (close, but not consistent)' :
                              '   (does not fit the inscription)'));
            out.textContent = lines.join('\\n');
          };
          document.addEventListener('DOMContentLoaded', function () { window.encode(); });
        })();
      </script>''')


def widget_dagapeyeff() -> str:
    return textwrap.dedent('''\
      <label for="input" style="display:block;margin-top:1rem;font-weight:600;">Numeric ciphertext</label>
      <textarea id="input" rows="5" style="width:100%;padding:.6rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;font-family:monospace;">75628 28591 62916 48164 91748 58464 74748 28483 81638 18174 74826 26475 83828 49175 74658 37575 75936 36565 81638 17585 75756 46282 92857 46382 75748 38165</textarea>
      <button type="button" onclick="encode()" style="margin-top:.5rem;padding:.5rem 1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;cursor:pointer;">Tally digit pairs</button>
      <div id="output" style="margin-top:1rem;padding:1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);border-radius:6px;font-family:monospace;line-height:1.6;min-height:5rem;white-space:pre-wrap;"></div>
      <script>
        (function () {
          window.encode = function () {
            var raw = (document.getElementById('input').value || '').replace(/[^0-9]/g, '');
            var out = document.getElementById('output');
            if (raw.length < 4) { out.textContent = 'Need at least 4 digits.'; return; }
            var counts = {};
            for (var i = 0; i < raw.length - 1; i++) {
              var pair = raw[i] + raw[i+1];
              counts[pair] = (counts[pair] || 0) + 1;
            }
            var entries = Object.keys(counts).map(function (k) { return [k, counts[k]]; });
            entries.sort(function (a, b) { return b[1] - a[1]; });
            var lines = ['Digits analysed: ' + raw.length, 'Distinct adjacent pairs: ' + entries.length, '', 'Top 12 pairs by frequency:'];
            for (var j = 0; j < Math.min(12, entries.length); j++) {
              lines.push('  ' + entries[j][0] + '  \\u00d7 ' + entries[j][1]);
            }
            lines.push('');
            lines.push('A uniform random source over 100 pairs would expect ~' + (raw.length/100).toFixed(1) + ' hits per pair.');
            out.textContent = lines.join('\\n');
          };
          document.addEventListener('DOMContentLoaded', function () { window.encode(); });
        })();
      </script>''')


def widget_somerton() -> str:
    return textwrap.dedent('''\
      <p style="opacity:.85;font-family:monospace;background:rgba(0,0,0,.2);padding:.6rem;border-radius:4px;">MRGOABABD<br>MTBIMPANETP<br>MLIABOAIAQC<br>ITTMTSAMSTGAB</p>
      <label for="input" style="display:block;margin-top:1rem;font-weight:600;">Substitute (cipher letter \\u2192 plaintext guess)</label>
      <input type="text" id="input" value="M=W" maxlength="3" style="width:6rem;padding:.5rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;font-family:monospace;">
      <button type="button" onclick="encode()" style="margin-left:.5rem;padding:.5rem 1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;cursor:pointer;">Apply substitution</button>
      <div id="output" style="margin-top:1rem;padding:1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);border-radius:6px;font-family:monospace;line-height:1.6;min-height:5rem;white-space:pre-wrap;"></div>
      <script>
        (function () {
          var TEXT = 'MRGOABABD\\nMTBIMPANETP\\nMLIABOAIAQC\\nITTMTSAMSTGAB';
          window.encode = function () {
            var raw = (document.getElementById('input').value || '').toUpperCase();
            var m = raw.match(/^([A-Z])=([A-Z])$/);
            var out = document.getElementById('output');
            if (!m) { out.textContent = 'Format: single letter = single letter, e.g. M=W'; return; }
            var from = m[1], to = m[2];
            var swapped = TEXT.split('').map(function (c) {
              if (c === from) return to.toLowerCase();
              return c;
            }).join('');
            var freq = {};
            TEXT.replace(/\\n/g, '').split('').forEach(function (c) { freq[c] = (freq[c] || 0) + 1; });
            var freqLines = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; })
              .slice(0, 8).map(function (k) { return '  ' + k + ' \\u00d7 ' + freq[k]; });
            out.textContent =
              'After ' + from + ' \\u2192 ' + to + ':\\n\\n' + swapped +
              '\\n\\nLetter frequency (top 8):\\n' + freqLines.join('\\n');
          };
          document.addEventListener('DOMContentLoaded', function () { window.encode(); });
        })();
      </script>''')


def widget_mccormick() -> str:
    return textwrap.dedent('''\
      <label for="input" style="display:block;margin-top:1rem;font-weight:600;">Note fragment (use uppercase letters)</label>
      <textarea id="input" rows="5" style="width:100%;padding:.6rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;font-family:monospace;">RNCBE LRRSE NSE EE NEAR NCBE WLDS NLSE WNSE NCBE NCBSE</textarea>
      <button type="button" onclick="encode()" style="margin-top:.5rem;padding:.5rem 1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;cursor:pointer;">Tally bigrams</button>
      <div id="output" style="margin-top:1rem;padding:1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);border-radius:6px;font-family:monospace;line-height:1.6;min-height:5rem;white-space:pre-wrap;"></div>
      <script>
        (function () {
          window.encode = function () {
            var raw = (document.getElementById('input').value || '').toUpperCase().replace(/[^A-Z]/g, '');
            var out = document.getElementById('output');
            if (raw.length < 4) { out.textContent = 'Need at least 4 letters.'; return; }
            var counts = {};
            for (var i = 0; i < raw.length - 1; i++) {
              var pair = raw[i] + raw[i+1];
              counts[pair] = (counts[pair] || 0) + 1;
            }
            var entries = Object.keys(counts).map(function (k) { return [k, counts[k]]; });
            entries.sort(function (a, b) { return b[1] - a[1]; });
            var lines = ['Letters analysed: ' + raw.length, 'Distinct bigrams: ' + entries.length, '', 'Top 10 bigrams:'];
            for (var j = 0; j < Math.min(10, entries.length); j++) {
              lines.push('  ' + entries[j][0] + '  \\u00d7 ' + entries[j][1]);
            }
            lines.push('');
            lines.push('Compare: in natural English, TH is most frequent at ~3.9%, then HE ~3.7%.');
            out.textContent = lines.join('\\n');
          };
          document.addEventListener('DOMContentLoaded', function () { window.encode(); });
        })();
      </script>''')


def widget_bach() -> str:
    return textwrap.dedent('''\
      <label for="input" style="display:block;margin-top:1rem;font-weight:600;">Word (letters A\\u2013H only)</label>
      <input type="text" id="input" value="BACH" maxlength="20" style="width:14rem;padding:.5rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;font-family:monospace;text-transform:uppercase;">
      <button type="button" onclick="encode()" style="margin-left:.5rem;padding:.5rem 1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;cursor:pointer;">Spell as notes</button>
      <div id="output" style="margin-top:1rem;padding:1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);border-radius:6px;font-family:monospace;line-height:1.8;min-height:5rem;white-space:pre-wrap;"></div>
      <script>
        (function () {
          var GERMAN = { A:'A natural', B:'B-flat', C:'C natural', D:'D natural',
                          E:'E natural', F:'F natural', G:'G natural', H:'B natural' };
          var ENGLISH = { A:'A', B:'B\\u266d', C:'C', D:'D', E:'E', F:'F', G:'G', H:'B\\u266e' };
          window.encode = function () {
            var raw = (document.getElementById('input').value || '').toUpperCase();
            var out = document.getElementById('output');
            var lines = [];
            var notes = [];
            for (var i = 0; i < raw.length; i++) {
              var c = raw[i];
              if (!GERMAN[c]) {
                lines.push('  ' + c + ' \\u2192 (not a German note name)');
              } else {
                lines.push('  ' + c + ' \\u2192 ' + GERMAN[c]);
                notes.push(ENGLISH[c]);
              }
            }
            if (notes.length === 0) { out.textContent = 'Use letters A B C D E F G H only.'; return; }
            out.textContent = lines.join('\\n') + '\\n\\nPlayed as: ' + notes.join('  \\u2013  ');
          };
          document.addEventListener('DOMContentLoaded', function () { window.encode(); });
        })();
      </script>''')


def widget_dancing_men() -> str:
    return textwrap.dedent('''\
      <label for="input" style="display:block;margin-top:1rem;font-weight:600;">Plaintext message</label>
      <input type="text" id="input" value="ELSIE PREPARE TO MEET THY GOD" maxlength="80" style="width:100%;padding:.5rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;font-family:monospace;">
      <button type="button" onclick="encode()" style="margin-top:.5rem;padding:.5rem 1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;cursor:pointer;">Encode</button>
      <div id="output" style="margin-top:1rem;padding:1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);border-radius:6px;font-family:monospace;line-height:1.8;min-height:5rem;white-space:pre-wrap;"></div>
      <script>
        (function () {
          // Stylised "dancing-man" placeholders \\u2014 each letter shown as [LET], spaces preserved.
          window.encode = function () {
            var raw = (document.getElementById('input').value || '').toUpperCase();
            var out = document.getElementById('output');
            var enc = raw.split('').map(function (c) {
              if (c === ' ') return '   ';
              if (!/[A-Z]/.test(c)) return c;
              return '[\\u015b' + c + '\\u015b]';
            }).join('');
            var freq = {};
            raw.split('').forEach(function (c) { if (/[A-Z]/.test(c)) freq[c] = (freq[c] || 0) + 1; });
            var entries = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; });
            var freqLines = entries.slice(0, 6).map(function (k) { return '  ' + k + ' \\u00d7 ' + freq[k]; });
            out.textContent = 'Cipher (each tag = one dancing figure):\\n\\n' + enc +
              '\\n\\nFrequency (top 6) \\u2014 Holmes\\u2019s attack starts here:\\n' + freqLines.join('\\n') +
              '\\n\\n(In English, E should dominate. If your message is long enough, it does.)';
          };
          document.addEventListener('DOMContentLoaded', function () { window.encode(); });
        })();
      </script>''')


def widget_gold_bug() -> str:
    return textwrap.dedent('''\
      <label for="input" style="display:block;margin-top:1rem;font-weight:600;">English plaintext</label>
      <input type="text" id="input" value="A GOOD GLASS IN THE BISHOPS HOSTEL" maxlength="80" style="width:100%;padding:.5rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;font-family:monospace;">
      <button type="button" onclick="encode()" style="margin-top:.5rem;padding:.5rem 1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;cursor:pointer;">Encode + analyse</button>
      <div id="output" style="margin-top:1rem;padding:1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);border-radius:6px;font-family:monospace;line-height:1.6;min-height:5rem;white-space:pre-wrap;"></div>
      <script>
        (function () {
          // Poe\\u2019s actual symbol substitutions from the story (selection).
          var MAP = { A:')', B:'2', C:'-', D:'\\u2020', E:'8', F:'1', G:'3', H:'4',
                       I:'6', J:'?', K:'\\u00b6', L:'0', M:'9', N:'*', O:'\\u2021',
                       P:'.', Q:'/', R:'(', S:';', T:'5', U:':', V:'"', W:'!',
                       X:'@', Y:'7', Z:'#' };
          window.encode = function () {
            var raw = (document.getElementById('input').value || '').toUpperCase();
            var out = document.getElementById('output');
            var enc = raw.split('').map(function (c) { return MAP[c] || c; }).join('');
            var freq = {};
            enc.split('').forEach(function (c) { if (c !== ' ') freq[c] = (freq[c] || 0) + 1; });
            var entries = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; });
            var lines = entries.slice(0, 8).map(function (k) {
              var plain = Object.keys(MAP).find(function (p) { return MAP[p] === k; }) || '?';
              return '  ' + k + '  \\u00d7 ' + freq[k] + '   (= ' + plain + ')';
            });
            out.textContent = 'Encoded:\\n\\n' + enc +
              '\\n\\nFrequency (Poe\\u2019s attack route):\\n' + lines.join('\\n') +
              '\\n\\nIn the story Poe identifies \\u20188\\u2019 as E first, exactly this way.';
          };
          document.addEventListener('DOMContentLoaded', function () { window.encode(); });
        })();
      </script>''')


def widget_cicada() -> str:
    return textwrap.dedent('''\
      <label for="input" style="display:block;margin-top:1rem;font-weight:600;">Pick a Cicada 2012 puzzle stage (1\\u20134)</label>
      <input type="number" id="input" min="1" max="4" value="1" style="width:6rem;padding:.5rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;font-family:monospace;">
      <button type="button" onclick="encode()" style="margin-left:.5rem;padding:.5rem 1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;cursor:pointer;">Walk this stage</button>
      <div id="output" style="margin-top:1rem;padding:1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);border-radius:6px;font-family:monospace;line-height:1.6;min-height:5rem;white-space:pre-wrap;"></div>
      <script>
        (function () {
          var STAGES = {
            1: 'STAGE 1 \\u2014 Caesar shift\\n\\n  Image text reads: \\u201cTIBERIVS CLAVDIVS CAESAR says \\u201clxxat\\u201d\\u201d\\n  \\u201cCaesar\\u201d hint \\u2192 try ROT-3 of the bracketed string.\\n  lxxat \\u2192 ioxxq? No \\u2014 a small Caesar shift on the wider hidden text\\n  yields a Tor URL fragment.',
            2: 'STAGE 2 \\u2014 OutGuess steganography\\n\\n  Run `outguess -k <password> -r image.jpg out.txt`.\\n  Hidden file decrypts to a book reference: Mariko \\u014ahara\\u2019s \\n  \\u201cMental Fitness Puzzles\\u201d, page/line/word indices included.',
            3: 'STAGE 3 \\u2014 Phone + audio\\n\\n  Solve indices to a phone number in Oregon. Recorded message:\\n  \\u201cVery good. You have done well\\u2026 the cicada will sing in the cool dawn.\\u201d\\n  Spectrogram of the recording reveals further GPS coordinates.',
            4: 'STAGE 4 \\u2014 Physical posters + onion service\\n\\n  GPS leads to QR-coded posters in 14 cities (Warsaw, Seoul, Sydney\\u2026).\\n  QR codes link to a Tor hidden service requiring PGP-signed reply.\\n  Successful solvers received an email \\u2014 then silence.'
          };
          window.encode = function () {
            var n = parseInt(document.getElementById('input').value, 10);
            var out = document.getElementById('output');
            if (!n || n < 1 || n > 4) { out.textContent = 'Enter a stage 1\\u20134.'; return; }
            out.textContent = STAGES[n];
          };
          document.addEventListener('DOMContentLoaded', function () { window.encode(); });
        })();
      </script>''')


def widget_arg() -> str:
    return textwrap.dedent('''\
      <label for="input" style="display:block;margin-top:1rem;font-weight:600;">Pick a classical cipher (1=Caesar 2=Vigen\\u00e8re 3=Bacon 4=Pigpen)</label>
      <input type="number" id="input" min="1" max="4" value="1" style="width:6rem;padding:.5rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;font-family:monospace;">
      <button type="button" onclick="encode()" style="margin-left:.5rem;padding:.5rem 1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;cursor:pointer;">Show ARG example</button>
      <div id="output" style="margin-top:1rem;padding:1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);border-radius:6px;font-family:monospace;line-height:1.6;min-height:5rem;white-space:pre-wrap;"></div>
      <script>
        (function () {
          var EXAMPLES = {
            1: 'CAESAR  (used in The Beast 2001, NIN Year Zero 2007)\\n\\n  Plain : MEET AT DAWN\\n  Key   : shift +3 (Caesar)\\n  Cipher: PHHW DW GDZQ\\n\\n  Trick: ARG often spells out only the URL slug, not full English.',
            2: 'VIGEN\\u00c8RE  (used in NIN Year Zero, MIT Hunt 2014)\\n\\n  Plain : THE TRUTH IS COMING\\n  Key   : EXTERMINAL (repeats)\\n  Cipher: XEX MICCT MF GVQAVE\\n\\n  Trick: keys are usually fan-discovered words from the franchise.',
            3: 'BACON  (used in I Love Bees 2004, Lost Experience 2006)\\n\\n  Plain : HI\\n  Bacon : aabbb abaaa  (5 bits per letter)\\n  Carrier: tHe quIcK BroWN fOX juMpEd  (mixed case = bits)\\n\\n  Trick: hides bits inside otherwise normal-looking text.',
            4: 'PIGPEN  (printed on physical props in escape rooms, ARGs)\\n\\n  Geometric grid \\u2192 each letter shown as a fragment shape.\\n  See the Cipher Museum\\u2019s Pigpen exhibit for the full alphabet.\\n\\n  Trick: visually striking, instantly recognisable on a poster.'
          };
          window.encode = function () {
            var n = parseInt(document.getElementById('input').value, 10);
            var out = document.getElementById('output');
            if (!n || n < 1 || n > 4) { out.textContent = 'Pick 1, 2, 3, or 4.'; return; }
            out.textContent = EXAMPLES[n];
          };
          document.addEventListener('DOMContentLoaded', function () { window.encode(); });
        })();
      </script>''')


def widget_mit() -> str:
    return textwrap.dedent('''\
      <p style="opacity:.85;">Four puzzle answers were:<br><strong>FENCE &nbsp; ENCODE &nbsp; ENIGMA &nbsp; CAESAR</strong></p>
      <label for="input" style="display:block;margin-top:1rem;font-weight:600;">What links them? (one word)</label>
      <input type="text" id="input" value="ciphers" maxlength="40" style="width:14rem;padding:.5rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;font-family:monospace;">
      <button type="button" onclick="encode()" style="margin-left:.5rem;padding:.5rem 1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;cursor:pointer;">Submit guess</button>
      <div id="output" style="margin-top:1rem;padding:1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);border-radius:6px;font-family:monospace;line-height:1.6;min-height:5rem;white-space:pre-wrap;"></div>
      <script>
        (function () {
          window.encode = function () {
            var raw = (document.getElementById('input').value || '').trim().toLowerCase();
            var out = document.getElementById('output');
            var hint = 'Each answer names a cipher (or a cipher tool):\\n  FENCE  \\u2192 Rail-fence transposition\\n  ENCODE \\u2192 Generic verb \\u2014 trap answer\\n  ENIGMA \\u2192 Enigma machine\\n  CAESAR \\u2192 Caesar cipher\\n\\nMeta-link: \\u201cthings in the Cipher Museum\\u201d \\u2014 the meta-answer is one of\\nCIPHERS, CRYPTOGRAPHY, EXHIBITS, or HALL.';
            if (raw === 'ciphers' || raw === 'cipher') {
              out.textContent = '\\u2705  Solved! Meta-answer accepted.\\n\\n' + hint;
            } else if (raw === 'cryptography' || raw === 'exhibits' || raw === 'hall') {
              out.textContent = '\\ud83d\\udd35  Close \\u2014 acceptable variant.\\n\\n' + hint;
            } else {
              out.textContent = '\\u274c  Not the meta-answer. Hint:\\n\\n' + hint;
            }
          };
          document.addEventListener('DOMContentLoaded', function () { window.encode(); });
        })();
      </script>''')


def widget_sator() -> str:
    return textwrap.dedent('''\
      <pre style="font-family:monospace;background:rgba(0,0,0,.2);padding:.6rem;border-radius:4px;line-height:1.4;">S A T O R\nA R E P O\nT E N E T\nO P E R A\nR O T A S</pre>
      <label for="input" style="display:block;margin-top:1rem;font-weight:600;">Test a 5\\u00d75 word square (5 words \\u00d7 5 letters)</label>
      <input type="text" id="input" value="SATOR AREPO TENET OPERA ROTAS" style="width:100%;padding:.5rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;font-family:monospace;text-transform:uppercase;">
      <button type="button" onclick="encode()" style="margin-top:.5rem;padding:.5rem 1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;cursor:pointer;">Verify symmetry</button>
      <div id="output" style="margin-top:1rem;padding:1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);border-radius:6px;font-family:monospace;line-height:1.6;min-height:5rem;white-space:pre-wrap;"></div>
      <script>
        (function () {
          window.encode = function () {
            var raw = (document.getElementById('input').value || '').toUpperCase().trim().split(/\\s+/);
            var out = document.getElementById('output');
            if (raw.length !== 5 || raw.some(function (w) { return w.length !== 5; })) {
              out.textContent = 'Need exactly 5 words of 5 letters each.'; return;
            }
            var rows = raw;
            var cols = [0,1,2,3,4].map(function (c) { return rows.map(function (r) { return r[c]; }).join(''); });
            var rowsBack = rows.map(function (r) { return r.split('').reverse().join(''); }).reverse();
            var colsBack = cols.map(function (c) { return c.split('').reverse().join(''); }).reverse();
            var rowEqCol = rows.join('|') === cols.join('|');
            var rowsPalin = rows.join('|') === rowsBack.join('|');
            var allLetters = rows.join('').split('').sort().join('');
            var pater = 'PATERNOSTER'.split('').sort().join('');
            var pnCheck = pater.split('').every(function (c) { return allLetters.indexOf(c) >= 0; });
            out.textContent =
              'Rows = Columns?       ' + (rowEqCol ? '\\u2705' : '\\u274c') + '\\n' +
              'Rows = reversed rows? ' + (rowsPalin ? '\\u2705' : '\\u274c') + '\\n' +
              'Contains PATERNOSTER? ' + (pnCheck ? '\\u2705 (anagram possible)' : '\\u274c') + '\\n\\n' +
              (rowEqCol && rowsPalin ? 'Square is fully bi-axial \\u2014 a true Sator-class word square.' :
                                        'Not a Sator-class square.');
          };
          document.addEventListener('DOMContentLoaded', function () { window.encode(); });
        })();
      </script>''')


def widget_pigpen() -> str:
    return textwrap.dedent('''\
      <label for="input" style="display:block;margin-top:1rem;font-weight:600;">Letter or short word (A\\u2013Z)</label>
      <input type="text" id="input" value="MASON" maxlength="20" style="width:14rem;padding:.5rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;font-family:monospace;text-transform:uppercase;">
      <button type="button" onclick="encode()" style="margin-left:.5rem;padding:.5rem 1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);color:var(--ink);border-radius:6px;cursor:pointer;">Describe pigpen symbol</button>
      <div id="output" style="margin-top:1rem;padding:1rem;background:rgba(0,0,0,.3);border:1px solid var(--gold-b);border-radius:6px;font-family:monospace;line-height:1.6;min-height:5rem;white-space:pre-wrap;"></div>
      <script>
        (function () {
          // Standard mason pigpen: grid1 = ABCDEFGHI, grid2 = JKLMNOPQR (with dot),
          // X1 = STUV, X2 = WXYZ (with dot). Grid cells map to fragment shapes.
          var GRID1 = 'ABCDEFGHI', GRID2 = 'JKLMNOPQR', X1 = 'STUV', X2 = 'WXYZ';
          var SHAPE = ['top-left corner','top edge','top-right corner','left edge','centre square','right edge','bottom-left corner','bottom edge','bottom-right corner'];
          function describe(c) {
            var i;
            if ((i = GRID1.indexOf(c)) >= 0) return 'Grid 1, ' + SHAPE[i] + ' (no dot)';
            if ((i = GRID2.indexOf(c)) >= 0) return 'Grid 2, ' + SHAPE[i] + ' (with dot)';
            if ((i = X1.indexOf(c)) >= 0) return 'X-shape 1, ' + ['upper','left','right','lower'][i] + ' wedge (no dot)';
            if ((i = X2.indexOf(c)) >= 0) return 'X-shape 2, ' + ['upper','left','right','lower'][i] + ' wedge (with dot)';
            return null;
          }
          window.encode = function () {
            var raw = (document.getElementById('input').value || '').toUpperCase();
            var out = document.getElementById('output');
            var lines = [];
            for (var i = 0; i < raw.length; i++) {
              var c = raw[i];
              if (c === ' ') { lines.push(''); continue; }
              var d = describe(c);
              if (!d) { lines.push('  ' + c + ' \\u2192 (not in pigpen alphabet)'); }
              else    { lines.push('  ' + c + ' \\u2192 ' + d); }
            }
            out.textContent = lines.join('\\n') + '\\n\\n(For drawn symbols, see the full Pigpen Cipher exhibit.)';
          };
          document.addEventListener('DOMContentLoaded', function () { window.encode(); });
        })();
      </script>''')


WIDGETS = {
    'phaistos': widget_phaistos,
    'shugborough': widget_shugborough,
    'dagapeyeff': widget_dagapeyeff,
    'somerton': widget_somerton,
    'mccormick': widget_mccormick,
    'bach': widget_bach,
    'dancing-men': widget_dancing_men,
    'gold-bug': widget_gold_bug,
    'cicada': widget_cicada,
    'arg': widget_arg,
    'mit': widget_mit,
    'sator': widget_sator,
    'pigpen': widget_pigpen,
}


# ---------------------------------------------------------------- page template

PAGE = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — The Cipher Museum</title>
  <meta name="description" content="{tagline_plain}">
  <meta property="og:title" content="{title} — The Cipher Museum">
  <meta property="og:description" content="{tagline_plain}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ciphermuseum.com/ciphers/{slug}.html">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{title} — The Cipher Museum">
  <meta name="twitter:description" content="{tagline_plain}">
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
    <a href="{hall_href}">{hall_name}</a><span>&rsaquo;</span>
    {title}
  </div>
  <div class="page-meta">
    <span class="page-num">{hall_short}</span>
    <span class="badge {era_class}">{era_label}</span>
    <span class="badge sec-broken">{type_label}</span>
  </div>
  <h1 class="page-title">{title}</h1>
  <p class="page-tagline">{tagline}</p>
  <div class="exhibit-facts">
    <div class="fact"><span class="fact-label">Region</span><span class="fact-value">{region}</span></div>
    <div class="fact"><span class="fact-label">Year</span><span class="fact-value">{year}</span></div>
    <div class="fact"><span class="fact-label">{source_label}</span><span class="fact-value">{source_value}</span></div>
    <div class="fact"><span class="fact-label">Track</span><span class="fact-value">{track}</span></div>
  </div>
</div>

<div class="demo-section" data-cipher="{slug}">
  <h2>Interactive Exhibit</h2>
  <p style="opacity:.85;">{widget_intro}</p>
{widget_html}
</div>

<div class="exhibit-layout">
  <div class="exhibit-main">

    <div class="cipher-significance">
      <h3>Why This Matters</h3>
      <p>{significance}</p>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">📜</span><span class="panel-title">Historical Context</span></div>
      <div class="panel-body"><p>{historical}</p></div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">⚙️</span><span class="panel-title">Technical Notes</span></div>
      <div class="panel-body"><p>{technical}</p></div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">🔬</span><span class="panel-title">Modern Echo</span></div>
      <div class="panel-body"><p>{modern}</p></div>
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
            <tr><td>Hall</td><td>{hall_short}</td></tr>
            <tr><td>Region</td><td>{region}</td></tr>
            <tr><td>Era</td><td>{era_label}</td></tr>
            <tr><td>Discipline</td><td>{discipline}</td></tr>
            <tr><td>Track</td><td>{track}</td></tr>
            <tr><td>Modern echo</td><td>{modern_echo}</td></tr>
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
  <a href="{prev_href}" class="hall-nav-link">
    <span class="hall-nav-dir">&larr; Previous</span>
    <span class="hall-nav-name">{prev_name}</span>
  </a>
  <a href="{next_href}" class="hall-nav-link next">
    <span class="hall-nav-dir">Next &rarr;</span>
    <span class="hall-nav-name">{next_name}</span>
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
        <li><a href="{hall_href}">{hall_name}</a></li>
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
'''


def render_related(items: list[list[str]]) -> str:
    cards = []
    for slug, name, tag in items:
        cards.append(
            f'    <a href="../ciphers/{slug}.html" class="related-card">\n'
            f'      <span class="related-card__number">Related</span>\n'
            f'      <span class="related-card__name">{name}</span>\n'
            f'      <span class="related-card__tag">{tag}</span>\n'
            f'    </a>'
        )
    return '\n'.join(cards)


def strip_tags(s: str) -> str:
    out, depth = [], 0
    for ch in s:
        if ch == '<': depth += 1
        elif ch == '>': depth -= 1
        elif depth == 0: out.append(ch)
    return ''.join(out)


def hall_link(slug_or_path: str) -> str:
    """Convert 'phaistos-disc' -> '../ciphers/phaistos-disc.html'; pass-through if already relative."""
    if slug_or_path.startswith('../') or slug_or_path.startswith('./'):
        return slug_or_path
    return f'../ciphers/{slug_or_path}.html'


def main() -> None:
    data = json.loads(DATA.read_text(encoding='utf-8'))
    written = []
    for slug, ex in data.items():
        widget = WIDGETS[ex['widget_kind']]()
        page = PAGE.format(
            slug=slug,
            title=ex['title'],
            tagline=ex['tagline'],
            tagline_plain=strip_tags(ex['tagline']).replace('"', '&quot;'),
            hall_href=ex['hall_href'],
            hall_name=ex['hall_name'],
            hall_short=ex['hall_short'],
            era_class=ex['era_class'],
            era_label=ex['era_label'],
            type_label=ex['type_label'],
            region=ex['region'],
            year=ex['year'],
            source_label=ex['source_label'],
            source_value=ex['source_value'],
            track=ex['track'],
            discipline=ex['discipline'],
            modern_echo=ex['modern_echo'],
            significance=ex['significance'],
            historical=ex['historical'],
            technical=ex['technical'],
            modern=ex['modern'],
            widget_intro=ex['widget_intro'],
            widget_html=textwrap.indent(widget, '  '),
            related_html=render_related(ex['related']),
            prev_href=hall_link(ex['prev_slug']),
            prev_name=ex['prev_name'],
            next_href=hall_link(ex['next_slug']),
            next_name=ex['next_name'],
        )
        target = OUT / f'{slug}.html'
        target.write_text(page, encoding='utf-8')
        written.append(slug)
    print(f'Wrote {len(written)} pages: {", ".join(written)}')


if __name__ == '__main__':
    main()
