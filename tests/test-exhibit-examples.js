#!/usr/bin/env node
'use strict';

/**
 * Exhibit-example regression test.
 *
 * Every hardcoded worked example, challenge, and caption vector printed on the
 * exhibit pages was audited against the live engines (2026-07-17 sweep, then a
 * complete re-sweep of all 143 exhibit pages on 2026-08-04). This test pins
 * those page-displayed vectors so an engine change that would invalidate museum
 * prose fails here, loudly, with the page named.
 *
 * When an engine's convention changes intentionally: update the exhibit page
 * first, then the vector here — never delete a vector to make the suite pass.
 *
 * ── Why this file has four guards, not one ───────────────────────────────────
 *
 * The original version asserted only `engine(input, key) === expected`. That is
 * half a guarantee: it locks the engine, but nothing tied `expected` to the
 * prose it claimed to pin. Five vectors had already drifted away from pages
 * that no longer printed them, and the suite stayed green throughout. So:
 *
 *   A. ENGINE    — engine(input, key) still produces `expected`.
 *   B. ANCHOR    — the value really is printed on that exhibit page.
 *   C. WIRING    — each page's demo-section resolves to the engine its prose is
 *                  about. A page repointed at a neighbouring engine renders
 *                  plausible output for the wrong cipher, and the roundtrip
 *                  check in test-demo-pages.js passes for ANY self-consistent
 *                  engine, so nothing else would notice.
 *   D. UNSOLVED  — Hall XII exhibits never claim a decipherment.
 *
 * ── Vector format ────────────────────────────────────────────────────────────
 *
 *   [page, engine, mode, input, key, expected, compare, anchor?]
 *
 * compare modes:
 *   letters — strip non-alphanumerics, uppercase (most ciphers)
 *   symbols — collapse whitespace runs, trim (morse/tap/format-bearing output)
 *
 * anchor (guard B) — how this vector is tied to the page:
 *   omitted    `expected` itself must appear in the page text.
 *   "literal"  the page prints the example DECOMPOSED (per-letter arrows, digit
 *              rows, XOR sums) so the whole answer never appears as one run.
 *              The literal given must appear instead.
 *   DEMO       the page prints no vector; this pins the exhibit's interactive
 *              default. `input` and `key` are checked against the real defaults
 *              in js/demo-loader.js, so a config edit that silently changes what
 *              visitors first see fails here.
 *   DERIVED    deliberately not printed — a published test vector, a roundtrip,
 *              or a claim the prose makes ABOUT the printed example ("feed it
 *              eight A's and nothing repeats"). Escape hatch of last resort:
 *              the count is budgeted below so it cannot quietly become a
 *              dumping ground for vectors that guard no visible text.
 */

const fs = require('node:fs');
const path = require('node:path');

global.window = global;
require('../js/ciphers/all-engines.js');
const E = global.CipherEngines;

const REPO = path.resolve(__dirname, '..');
const CIPHERS = path.join(REPO, 'ciphers');

const DEMO = '@demo-default';
const DERIVED = '@derived-claim';

const VECTORS = [
  // page, engine, mode, input, key, expected, compare, anchor?
  ['adfgx.html', 'adfgx', 'encode', 'HELLO', 'PRIVACY,A', 'FFDXFXFXGF', 'letters', 'FF DX FX FX GF'],
  ['adfgx.html', 'adfgx', 'decode', 'FFDXFXFXGF', 'PRIVACY,A', 'HELLO', 'letters'],
  // The "How It Works" <pre> and the SVG both print the per-letter fractionation
  // H->FF E->DX L->FX, with O->GF completing HELLO. Columnar key 'A' is the
  // identity permutation, so each row pins the Polybius square alone.
  ['adfgx.html', 'adfgx', 'encode', 'H', 'PRIVACY,A', 'FF', 'letters'],
  ['adfgx.html', 'adfgx', 'encode', 'E', 'PRIVACY,A', 'DX', 'letters'],
  ['adfgx.html', 'adfgx', 'encode', 'L', 'PRIVACY,A', 'FX', 'letters'],
  ['adfgx.html', 'adfgx', 'encode', 'O', 'PRIVACY,A', 'GF', 'letters'],
  // ADFGVX: the inline SVG's three mappings, checked against the page's own
  // printed 6x6 square supplied as the polybius key in reading order.
  ['adfgvx.html', 'adfgvx', 'encode', 'EAT', 'PH0QG64MEA1YNOFDXKR3CVS5Z97J2WBTILU8,A', 'DFDGXD', 'letters', 'e DF a DG t XD'],
  ['aeneas-tacticus.html', 'aeneasTacticus', 'encode', 'SHIPS APPROACH AT NIGHT', undefined,
    '19 8 9 16 19 1 16 16 18 15 1 3 8 1 20 14 9 7 8 20', 'symbols', DEMO],
  // Affine: the page's three "special case" claims — Caesar a=1, Atbash
  // a=25 b=25, ROT13 a=1 b=13 — each pinned to the cipher it generalises.
  ['affine.html', 'affine', 'encode', 'ABNOZ', '1,3', 'DEQRC', 'letters', 'Caesar'],
  ['affine.html', 'affine', 'encode', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '25,25', 'ZYXWVUTSRQPONMLKJIHGFEDCBA', 'letters', 'Atbash'],
  ['affine.html', 'affine', 'encode', 'HELLO', '1,13', 'URYYB', 'letters', 'ROT13'],
  ['affine.html', 'affine', 'encode', 'AFFINE CIPHER', '5,8', 'IHHWVCSWFRCP', 'letters', DEMO],
  ['amharic-ge-ez-ciphers.html', 'geezMonastic', 'encode', 'PRESERVE THE TEXT', 'GEEZ', 'BMTKTMRTOCTOTWO', 'letters', DEMO],
  // Argenti: the exhibit's central instruction — "try encoding AAAAAA and you
  // will see two distinct codes interleaved" — plus the stated 10..89 range.
  ['argenti.html', 'argenti', 'encode', 'AAAAAA', 'ARGENTI', '66 40 66 40 66 40', 'symbols', 'AAAAAA'],
  // Arnold-Andre: out-of-book handling, sentinel 13.1.1 / page-14 letters / 15.1.1.
  ['arnold-andre.html', 'arnoldAndre', 'encode', 'ZEBRA', 'BLACKSTONE',
    '13.1.1 14.6.1 14.1.5 14.1.2 14.4.3 14.1.1 15.1.1', 'symbols', '13.1.1'],
  // ...and the stated 12 pages x 5 lines x 4 words extent of the reconstructed book.
  ['arnold-andre.html', 'arnoldAndre', 'decode', '1.1.1 12.5.4', 'BLACKSTONE', 'OF FORD', 'letters', '12 pages'],
  ['atbash.html', 'atbash', 'encode', 'ABCDEFGHIJKLM', undefined, 'ZYXWVUTSRQPON', 'letters'],
  ['atbash.html', 'atbash', 'encode', 'HELLO', undefined, 'SVOOL', 'letters'],
  ['autokey.html', 'autokey', 'encode', 'AUTOKEY REVEAL', 'QUEENLY', 'QOXSXPWRYOSKP', 'letters'],
  ['autokey.html', 'autokey', 'decode', 'QOXSXPWRYOSKP', 'QUEENLY', 'AUTOKEYREVEAL', 'letters'],
  ['babington.html', 'babington', 'decode', '⟨w25⟩⟨a14⟩⟨w32⟩⟨a20⟩⟨w33⟩⟨a17⟩⟨x2⟩', 'BABINGTON', 'DAGGERELIZABETHATTHETOWERDEATH', 'letters', '⟨w25⟩'],
  // The SVG figure prints this exact glyph string, null ⟨a16⟩ included, so it
  // pins the seeded symbol shuffle and not merely the decode direction.
  ['babington.html', 'babington', 'encode', 'THE QUEEN MUST DIE', 'BABINGTON',
    '⟨w33⟩ ⟨w28⟩ ⟨n04⟩ ⟨a23⟩ ⟨a16⟩ ⟨w15⟩ ⟨a07⟩', 'symbols'],
  ['babington.html', 'babington', 'decode', '⟨w16⟩⟨w18⟩', 'BABINGTON', 'LL', 'letters', '⟨w18⟩'],
  ['bacon.html', 'bacon', 'encode', 'HI', undefined, 'AABBB ABAAA', 'letters'],
  ['bacon.html', 'bacon', 'encode', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', undefined,
    'AAAAA AAAAB AAABA AAABB AABAA AABAB AABBA AABBB ABAAA ABAAA ABAAB ABABA ABABB ABBAA ABBAB ABBBA ABBBB BAAAA BAAAB BAABA BAABB BABAA BABAB BABBA BABBB BBAAA',
    'letters', 'ABBAA'],
  ['beaufort.html', 'beaufort', 'encode', 'HELLOW', 'SECRET', 'LARGQX', 'letters'],
  ['beaufort.html', 'beaufort', 'decode', 'LARGQX', 'SECRET', 'HELLOW', 'letters'],
  ['bifid.html', 'bifid', 'encode', 'HELLO', 'SECRET', 'HKNFO', 'letters'],
  ['bifid.html', 'bifid', 'decode', 'HKNFO', 'SECRET', 'HELLO', 'letters'],
  ['book-cipher.html', 'bookCipher', 'decode', '48.1 5.1 42.1 15.1', undefined, 'GOLD', 'letters'],
  ['caesar.html', 'caesar', 'encode', 'ABNOZ', '3', 'DEQRC', 'letters', 'A → D    N → Q    B → E    O → R    Z → C'],
  ['caesar.html', 'caesar', 'decode', 'QEB NRFZH YOLTK CLU GRJMP LSBO QEB IXWV ALD', '23', 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG', 'letters'],
  // The auto-break textarea's placeholder, "e.g. KHOOR ZRUOG".
  ['caesar.html', 'caesar', 'encode', 'HELLO WORLD', '3', 'KHOOR ZRUOG', 'letters'],
  ['cardano-autokey.html', 'cardanoAutokey', 'encode', 'MEET ME AT MIDNIGHT', 'Q', 'CQIXFQETFULQVONA', 'letters'],
  ['cardano-autokey.html', 'cardanoAutokey', 'decode', 'CQIXFQETFULQVONA', 'Q', 'MEETMEATMIDNIGHT', 'letters', 'CQIXFQETFULQVONA'],
  ['columnar.html', 'columnar', 'encode', 'WEATHERFORECASTINGXX', 'ZEBRA', 'HRTXAFAGERCNTOSXWEEI', 'letters', 'HRTX AFAG ERCN TOSX WEEI'],
  ['columnar.html', 'columnar', 'decode', 'HRTXAFAGERCNTOSXWEEI', 'ZEBRA', 'WEATHERFORECASTINGXX', 'letters', 'WEATH'],
  // confederate-vigenere.html prints "All Vigenere: C = (P + K) mod 26" and lists
  // 'Complete Victory' as the 1864 government keyword; these pin that the
  // Confederate brass-disk engine really is plain Vigenere under that keyword.
  ['confederate-vigenere.html', 'confederateVigenere', 'encode', 'THEPRESIDENT', 'COMPLETEVICTORY', 'VVQECILMYMPM', 'letters', 'Complete Victory'],
  ['confederate-vigenere.html', 'confederateVigenere', 'decode', 'VVQECILMYMPM', 'COMPLETEVICTORY', 'THEPRESIDENT', 'letters', 'Complete Victory'],
  // culper-ring.html states a 215-entry codebook indexed from 100, with per-letter
  // codes in the 800s bracketed by sentinels 998/999. 314 is the last codebook
  // entry, so 315 must fall off the end.
  ['culper-ring.html', 'culperRing', 'decode', '314', undefined, 'TAX', 'letters', '215'],
  ['culper-ring.html', 'culperRing', 'decode', '315', undefined, '???', 'letters', '215'],
  ['culper-ring.html', 'culperRing', 'encode', 'WASHINGTON ATTACK MIDNIGHT', 'TALLMADGE',
    '187 220 998 812 808 803 813 808 806 807 819 999', 'letters', '998'],
  // da-vinci-code.html ships its own inline Atbash (daVinciEncode) rather than
  // calling the engine; this pins the two to each other on the widget default.
  ['da-vinci-code.html', 'atbash', 'encode', 'SOPHIA', undefined, 'HLKSRZ', 'letters', 'SOPHIA'],
  ['diana-cryptosystem.html', 'diana', 'encode', 'ATTACKATDAWNXYZ', 'GORWYWETFRCOYET', 'TSPDZTVNRIBYEXH', 'letters', 'TSPDZ TVNRI BYEXH'],
  ['diana-cryptosystem.html', 'diana', 'decode', 'TSPDZTVNRIBYEXH', 'GORWYWETFRCOYET', 'ATTACKATDAWNXYZ', 'letters', 'ATTAC KATDA WNXYZ'],
  ['double-transposition.html', 'doubleTransposition', 'encode', 'SENDHELPNOW', 'MARK,LION', 'ESLEPNDNOHW', 'letters', 'ESL'],
  ['double-transposition.html', 'doubleTransposition', 'decode', 'ESLEPNDNOHW', 'MARK,LION', 'SENDHELPNOW', 'letters', 'SEND'],
  // The figure's INTERMEDIATE row: pass 1 with key MARK, before LION is applied.
  ['double-transposition.html', 'columnar', 'encode', 'SENDHELPNOW', 'MARK', 'EEODPSHNNLW', 'letters', 'EEO DP SHN NLW'],
  ['enigma.html', 'enigma', 'encode', 'AAAAA', 'AAA', 'BDZGO', 'letters'],
  // The 30-letter extension seeds BOTH cryptanalysis demos on the page.
  ['enigma.html', 'enigma', 'encode', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'AAA', 'BDZGOWCXLTKSBTMCDLPBMUQOFXYHCX', 'letters'],
  ['enigma.html', 'enigma', 'decode', 'BDZGOWCXLTKSBTMCDLPBMUQOFXYHCX', 'AAA', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'letters', 'BDZGOWCXLTKSBTMCDLPBMUQOFXYHCX'],
  ['fialka.html', 'fialka', 'encode', 'WARSAW PACT TRAFFIC', 'M125', 'UVOVMCEHJJFPLHBGM', 'letters', DEMO],
  ['fialka.html', 'fialka', 'decode', 'UVOVMCEHJJFPLHBGM', 'M125', 'WARSAWPACTTRAFFIC', 'letters', DERIVED], // roundtrip of the demo default
  ['four-square.html', 'foursquare', 'encode', 'HELP ME OBI WAN', 'EXAMPLE,KEYWORD', 'FYNFNEHWBXAF', 'letters', DEMO],
  ['four-square.html', 'foursquare', 'decode', 'FYNFNEHWBXAF', 'EXAMPLE,KEYWORD', 'HELPMEOBIWAN', 'letters', DERIVED], // roundtrip of the demo default
  // The SVG prints the keyed substitution of the first four triples only
  // (dot-dot-dot->R, dot-x-dot->A, x-dot-dash->Q, dot-dot-x->U).
  ['fractionated-morse.html', 'fractionatedMorse', 'encode', 'HELLO', 'ROUNDTABLE', 'RAQUNBI', 'letters', '··· →R ·x· →A x·– →Q ··x →U'],
  ['fractionated-morse.html', 'fractionatedMorse', 'decode', 'RAQUNBI', 'ROUNDTABLE', 'HELLO', 'letters', 'HELLO'],
  ['fractionated-morse.html', 'fractionatedMorse', 'encode', 'HELLO WORLD', 'ROUNDTABLE', 'RAQUNBIDWJFNBU', 'letters', DEMO],
  ['geheimschreiber.html', 'geheimschreiber', 'encode', 'OBERKOMMANDO WEHRMACHT', 'STURGEON', 'LTYLOLJNMDJJODVKDQKRS', 'letters', DEMO],
  ['geheimschreiber.html', 'geheimschreiber', 'decode', 'LTYLOLJNMDJJODVKDQKRS', 'STURGEON', 'OBERKOMMANDOWEHRMACHT', 'letters', DERIVED], // roundtrip of the demo default
  ['gravity-falls.html', 'caesar', 'encode', 'TRUST NO ONE', '3', 'WUXVW QR RQH', 'letters', 'TRUST NO ONE'],
  // great-cipher.html invites the visitor to compare two codebook seeds. The
  // engine is deterministic per seed, so this pins the LOUIS codebook.
  ['great-cipher.html', 'greatCipher', 'encode', 'THE KING ORDERS RETREAT TO PARIS AT DAWN', 'LOUIS',
    '164 152 175 100 110 168 108 119 173 116 149 147 149 167 115 170 117 177 167 109 113 159 182 138', 'letters', DEMO],
  ['great-cipher.html', 'greatCipher', 'decode',
    '164 152 175 100 110 168 108 119 173 116 149 147 149 167 115 170 117 177 167 109 113 159 182 138', 'LOUIS',
    'THEKINGORDERSRETREATTOPARISATDAWN', 'letters', DERIVED], // roundtrip of the demo default
  ['gronsfeld.html', 'gronsfeld', 'encode', 'ATTACKAT', '31415', 'DUXBHNBX', 'letters'],
  ['gronsfeld.html', 'gronsfeld', 'encode', 'ATTAC', '31415', 'DUXBH', 'letters'],
  ['gronsfeld.html', 'gronsfeld', 'decode', 'DUXBHNBX', '31415', 'ATTACKAT', 'letters'],
  ['hill.html', 'hill', 'encode', 'HI', '3,3,2,5', 'TC', 'letters'],
  ['hill.html', 'hill', 'decode', 'TC', '3,3,2,5', 'HI', 'letters'],
  ['homophonic.html', 'homophonic', 'encode', 'SECRET MESSAGE', 'CIPHER', '91 26 19 83 29 98 64 36 91 93 10 41 29', 'letters', DEMO],
  ['homophonic.html', 'homophonic', 'decode', '91 26 19 83 29 98 64 36 91 93 10 41 29', 'CIPHER', 'SECRETMESSAGE', 'letters', DERIVED], // roundtrip of the demo default
  ['jefferson-disk.html', 'jefferson', 'encode', 'WE HOLD THESE TRUTHS', '3,1,5,2,4,6', 'BZYENLDFQVIHYKGIG', 'letters', DEMO],
  ['jefferson-disk.html', 'jefferson', 'decode', 'BZYENLDFQVIHYKGIG', '3,1,5,2,4,6', 'WEHOLDTHESETRUTHS', 'letters', DERIVED], // roundtrip of the demo default
  ['jn-25.html', 'jn25', 'encode', 'AF SHORT OF WATER', '31415',
    '41415 41410 41423 41412 41429 41422 41424 41429 41410 41437 41415 41424 41419 41422', 'letters', DERIVED], // additive over the demo default message
  ['kama-sutra.html', 'kamaSutra', 'encode', 'SECRET LOVERS LANGUAGE', 'KAMASUTRA', 'WJNPJQ DBUJPW DYCHVYHJ', 'letters', DEMO],
  ['kama-sutra.html', 'kamaSutra', 'decode', 'WJNPJQ DBUJPW DYCHVYHJ', 'KAMASUTRA', 'SECRET LOVERS LANGUAGE', 'letters', 'Self-inverse'],
  // kerckhoffs.html ships an inline hand-rolled Caesar +13 (kpDemo); this pins
  // it to the engine on the widget's own default input.
  ['kerckhoffs.html', 'caesar', 'encode', 'HELLO WORLD', '13', 'URYYB JBEYQ', 'letters', 'HELLO WORLD'],
  ['kl-7.html', 'kl7', 'encode', 'NATO READY MESSAGE', 'TSEC', 'SQFNSRSJLPRJGMJX', 'letters', DEMO],
  ['kl-7.html', 'kl7', 'decode', 'SQFNSRSJLPRJGMJX', 'TSEC', 'NATOREADYMESSAGE', 'letters', DERIVED], // roundtrip of the demo default
  ['kryha.html', 'kryha', 'encode', 'UNBREAKABLE CIPHER', 'POCKET', 'TGPRAQRLBGESUXWBU', 'letters', DEMO],
  ['kryha.html', 'kryha', 'decode', 'TGPRAQRLBGESUXWBU', 'POCKET', 'UNBREAKABLECIPHER', 'letters', DERIVED], // roundtrip of the demo default
  ['krypto-arg.html', 'caesar', 'encode', 'MEET AT DAWN', '3', 'PHHW DW GDZQ', 'letters'],
  ['krypto-arg.html', 'vigenere', 'encode', 'THE TRUTH IS COMING', 'EXTERMINAL', 'XEXXIGBUIDGLFMES', 'letters', 'XEX XIGBU ID GLFMES'],
  ['krypto-arg.html', 'bacon', 'encode', 'HI', undefined, 'AABBB ABAAA', 'letters', 'aabbb abaaa'],
  // Kryptos: the page quotes the K1 plaintext. This pins the museum's tableau
  // engine against the real sculpture ciphertext, misspelling included.
  ['kryptos.html', 'kryptos', 'decode',
    'EMUFPHZLRFAXYUSDJKZLDKRNSHGNFIVJYQTQUXQBQVYUVLLTREVJYQTMKYRDMFD', 'PALIMPSEST',
    'BETWEENSUBTLESHADINGANDTHEABSENCEOFLIGHTLIESTHENUANCEOFIQLUSION', 'letters', 'IQLUSION'],
  ['kryptos.html', 'kryptos', 'encode', 'BETWEEN SUBTLE SHADING AND THE ABSENCE OF LIGHT', 'PALIMPSEST',
    'EMUFPHZLRFAXYUSDJKZLDKRNSHGNFIVJYQTQUXQB', 'letters', 'PALIMPSEST'],
  ['lorenz.html', 'lorenz', 'encode', 'URGENT MESSAGE', 'LORENZ', 'YKQFIIR7AMQF3', 'letters', DEMO],
  ['lorenz.html', 'lorenz', 'decode', 'YKQFIIR7AMQF3', 'LORENZ', 'URGENTMESSAGE', 'letters', DERIVED], // roundtrip of the demo default
  ['m-94.html', 'm94', 'encode', 'ARMY SIGNAL READY', '5', 'OLQVZXCKRVWGUZH', 'letters', DEMO],
  ['m-94.html', 'm94', 'decode', 'OLQVZXCKRVWGUZH', '5', 'ARMYSIGNALREADY', 'letters', DERIVED], // roundtrip of the demo default
  ['m209.html', 'm209', 'encode', 'ENEMY ADVANCING ON FLANK', 'HAGELIN', 'ARYSIDAIDRBXRYPOXTDQU', 'letters', DEMO],
  // The decode row pins the page's "Beaufort involution" claim, C = (K - P) mod 26.
  ['m209.html', 'm209', 'decode', 'ARYSIDAIDRBXRYPOXTDQU', 'HAGELIN', 'ENEMYADVANCINGONFLANK', 'letters', 'K - plaintext'],
  ['monoalphabetic.html', 'monoalphabetic', 'encode', 'HELLO', 'QWERTYUIOPASDFGHJKLZXCVBNM', 'ITSSG', 'letters'],
  ['morse.html', 'morse', 'encode', 'SOS', undefined, '... --- ...', 'symbols'],
  ['morse.html', 'morse', 'encode', 'HELLO', undefined, '.... . .-.. .-.. ---', 'symbols'],
  ['morse.html', 'morse', 'encode', '73', undefined, '--... ...--', 'symbols'],
  // The exhibit asserts its code IS International Morse. Pin the whole ITU-R
  // M.1677 table, not just the three sample words, so a single-cell drift in
  // the engine cannot hide behind a still-correct "SOS".
  ['morse.html', 'morse', 'encode', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', undefined,
    '.- -... -.-. -.. . ..-. --. .... .. .--- -.- .-.. -- -. --- .--. --.- .-. ... - ..- ...- .-- -..- -.-- --..',
    'symbols', 'International Morse'],
  ['morse.html', 'morse', 'encode', '0123456789', undefined,
    '----- .---- ..--- ...-- ....- ..... -.... --... ---.. ----.', 'symbols', 'International Morse'],
  // national-treasure.html shipped a 26-entry pigpen table in which D and F were
  // both '|-' — a non-injective "substitution" alphabet. It now renders the
  // engine's own symbol set, which this pins.
  ['national-treasure.html', 'pigpen', 'encode', 'FREEMASON', undefined, '┤ ┐• ┼ ┼ ├• ⌐ ╲ ┤• ┼•', 'symbols', 'FREEMASON'],
  ['navajo-code-talkers.html', 'navajo', 'encode', 'IWO', undefined, 'TKIN GLOE-IH A-KHA', 'letters'],
  ['navajo-code-talkers.html', 'navajo', 'encode', 'GUAM', undefined, 'KLIZZIE SHI-DA WOL-LA-CHEE TSIN-TLITI', 'letters'],
  ['navajo-code-talkers.html', 'navajo', 'decode', 'KLIZZIE SHI-DA WOL-LA-CHEE TSIN-TLITI', undefined, 'GUAM', 'letters'],
  ['navajo-code-talkers.html', 'navajo', 'encode', 'ATTACK', undefined, '[AL-TAH-JE-JAY]', 'letters'],
  ['nihilist.html', 'nihilist', 'encode', 'ATTACK', 'NIHILIST,NEMO', '33 52 56 63 35 65', 'letters'],
  ['nihilist.html', 'nihilist', 'decode', '33 52 56 63 35 65', 'NIHILIST,NEMO', 'ATTACK', 'letters'],
  ['nomenclator.html', 'nomenclator', 'decode', '60 70 23 09 12 12 90 81 01 20 92', undefined, 'THE KING WILL ATTACK PARIS AT DAWN', 'letters'],
  // The Break-This answer only holds if the codebook round-trips.
  ['nomenclator.html', 'nomenclator', 'encode', 'THE KING WILL ATTACK PARIS AT DAWN', undefined, '60 70 23 09 12 12 90 81 01 20 92', 'letters'],
  ['null-cipher.html', 'nullCipher', 'decode', 'Help Every Little Pup', 'first', 'HELP', 'letters'],
  // The page documents first/last/N key formats; the decode vector alone would
  // still pass if encode stopped honouring them.
  ['null-cipher.html', 'nullCipher', 'encode', 'HELP', 'first', 'have each long place', 'symbols', DERIVED], // documented key format; carrier output not printed
  ['one-time-pad.html', 'otp', 'encode', 'HELLO', 'XMCKL', 'EQNVZ', 'letters'],
  ['one-time-pad.html', 'otp', 'encode', 'ATTACK', 'HODIZQ', 'HHWIBA', 'letters'],
  ['one-time-pad.html', 'otp', 'decode', 'HHWIBA', 'HODIZQ', 'ATTACK', 'letters'],
  // Patterson 1801. Key 13,34,57,65,22,78,49 is the one Smithline recovered:
  // seven lines to a section. Key '10' is one line taking zero arbitrary
  // letters, so the cipher degenerates to the identity -- the hand-checkable case.
  ['patterson-jefferson-cipher.html', 'patterson', 'encode', 'ATTACK', '10', 'ATTACK', 'letters', DERIVED], // degenerate single-line case
  ['patterson-jefferson-cipher.html', 'patterson', 'decode',
    'QJWIEFKBFDCSUPHLSEUZNUTCTAOXGLHRINSOUZKBFDNRRYVYPHLSEUZOJR',
    '13,34,57,65,22,78,49', 'INCONGRESSJULYFOURTH', 'letters', '13, 34, 57, 65, 22, 78, 49'],
  ['pigpen.html', 'pigpen', 'encode', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', undefined,
    '⌐ ┴ ¬ ├ ┼ ┤ ┌ ┬ ┐ ⌐• ┴• ¬• ├• ┼• ┤• ┌• ┬• ┐• ╲ ╳ ╱ ╲• ╳• ╱• ▽ △', 'symbols'],
  ['playfair.html', 'playfair', 'encode', 'AR', 'MONARCHY', 'RM', 'letters'],
  ['playfair.html', 'playfair', 'encode', 'MC', 'MONARCHY', 'CE', 'letters'],
  ['playfair.html', 'playfair', 'encode', 'HI', 'MONARCHY', 'BF', 'letters'],
  ['playfair.html', 'playfair', 'encode', 'HELPME', 'PLAYFAIR', 'KGALEG', 'letters'],
  ['playfair.html', 'playfair', 'decode', 'KGALEG', 'PLAYFAIR', 'HELPME', 'letters'],
  ['polybius.html', 'polybius', 'encode', 'HELLO', undefined, '23 15 31 31 34', 'letters'],
  ['polybius.html', 'polybius', 'decode', '23 15 31 31 34', undefined, 'HELLO', 'letters'],
  ['porta.html', 'porta', 'encode', 'A', 'A', 'N', 'letters'],
  // The three tableau rows printed in the SVG. Key letters pair up: A and B
  // select row AB, C and D row CD, E and F row EF.
  ['porta.html', 'porta', 'encode', 'ABCDEFGHIJKLM', 'A', 'NOPQRSTUVWXYZ', 'letters'],
  ['porta.html', 'porta', 'encode', 'ABCDEFGHIJKLM', 'C', 'OPQRSTUVWXYZN', 'letters'],
  ['porta.html', 'porta', 'encode', 'ABCDEFGHIJKLM', 'E', 'PQRSTUVWXYZNO', 'letters'],
  // ...and the reciprocity claim printed beneath it: Encrypt(A)=N, Encrypt(N)=A.
  ['porta.html', 'porta', 'encode', 'N', 'A', 'A', 'letters', 'Encrypt'],
  ['rail-fence.html', 'railFence', 'encode', 'HELLOWORLD', '3', 'HOLELWRDLO', 'letters'],
  ['rail-fence.html', 'railFence', 'decode', 'HOLELWRDLO', '3', 'HELLOWORLD', 'letters'],
  ['rot13.html', 'rot13', 'encode', 'HELLO', undefined, 'URYYB', 'letters'],
  ['rot13.html', 'rot13', 'decode', 'URYYB', undefined, 'HELLO', 'letters'],
  ['running-key.html', 'runningKey', 'encode', 'ATTACKATDAWN', 'FROMTHISBOOK', 'FKHMVRILEOKX', 'letters', 'A+F=F, T+R=K, T+O=H, A+M=M'],
  ['scytale.html', 'scytale', 'encode', 'ATTACKATDAWN', '3', 'ACDTKATAWATN', 'letters'],
  ['scytale.html', 'scytale', 'decode', 'ACDTKATAWATN', '3', 'ATTACKATDAWN', 'letters'],
  ['sigaba.html', 'sigaba', 'encode', 'CLIMB MOUNT NIITAKA', 'SIGABA', 'LBVIICVKBEYCICOAV', 'letters'],
  ['sigaba.html', 'sigaba', 'decode', 'LBVIICVKBEYCICOAV', 'SIGABA', 'CLIMB MOUNT NIITAKA', 'letters'],
  // Solitaire: Schneier's two published test vectors. The exhibit's whole claim
  // is that this is *the* Solitaire, so pin the author's own outputs.
  ['solitaire.html', 'solitaire', 'encode', 'AAAAAAAAAAAAAAA', 'FOO', 'ITHZUJIWGRFARMW', 'letters', DERIVED], // Schneier's published vector
  ['solitaire.html', 'solitaire', 'decode', 'ITHZUJIWGRFARMW', 'FOO', 'AAAAAAAAAAAAAAA', 'letters', DERIVED], // Schneier's published vector
  ['solitaire.html', 'solitaire', 'encode', 'SOLITAIRE', 'CRYPTONOMICON', 'KIRAKSFJAN', 'letters', DERIVED], // Schneier's published vector
  // The page's inline step-by-step visualizer must agree with all-engines.
  ['solitaire.html', 'solitaire', 'encode', 'DO NOT USE PC', 'CRYPTONOMICON', 'VITGKMPWLS', 'letters', DEMO],
  ['stager.html', 'stager', 'encode', 'WE ARE DISCOVERED FLEE AT ONCE', '5', 'WDVFTOLEIEASRENCEECREODAE', 'letters', DEMO],
  // Pins every cell of the checkerboard printed on the page: top row
  // A T _ O N E S _ I R, prefix-2 row BCDFGHJKLM, prefix-7 row PQUVWXYZ.
  ['straddling-checkerboard.html', 'straddlingCheckerboard', 'encode', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'ATONESIRE',
    '02021225232425826272829437071961727374757677', 'letters', 'A T'],
  ['straddling-checkerboard.html', 'straddlingCheckerboard', 'encode', 'ATTACK AT DAWN', 'ATONESIRE', '0110212701220744', 'letters', DERIVED], // exercises both escape prefixes
  ['straddling-checkerboard.html', 'straddlingCheckerboard', 'decode', '0110212701220744', 'ATONESIRE', 'ATTACKATDAWN', 'letters', DERIVED], // roundtrip of the row above
  ['tap-code.html', 'tapCode', 'encode', 'H', undefined, '.. ...', 'symbols'],
  ['tap-code.html', 'tapCode', 'encode', 'E', undefined, '. .....', 'symbols'],
  // Pins the grid rows and the K->C collapse printed in the <pre>.
  ['tap-code.html', 'tapCode', 'encode', 'AEJKLPQUVZ', undefined,
    '. .   . .....   .. .....   . ...   ... .   ... .....   .... .   .... .....   ..... .   ..... .....',
    'symbols', 'C=K'],
  // The SVG's H=(1,3,2) E=(1,2,2) L=(2,1,3) on the unkeyed cube, regrouped as
  // (1,1,2)(3,2,1)(2,2,3). Passing the plain alphabet reproduces that cube.
  ['trifid.html', 'trifid', 'encode', 'HEL', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'BVO', 'letters', DERIVED], // the figure stops before naming the output letters
  ['trithemius.html', 'trithemius', 'encode', 'STEGANOGRAPHIA', '0', 'SUGJESUNZJZSUN', 'letters'],
  ['two-square.html', 'twosquare', 'encode', 'COME QUICKLY WE NEED HELP', 'EXAMPLE,KEYWORD', 'FYMEYCYFLYCKVYHOXRHECM', 'letters', DEMO],
  ['two-square.html', 'twosquare', 'decode', 'FYMEYCYFLYCKVYHOXRHECM', 'EXAMPLE,KEYWORD', 'COMEQUICKLYWENEEDHELP', 'letters', DERIVED], // roundtrip of the demo default
  ['typex.html', 'typex', 'decode', 'RZEBVVKJUAVRKTBFBT', 'AAAAA', 'BRITISH SIGNAL READY', 'letters'],
  ['typex.html', 'typex', 'encode', 'BRITISH SIGNAL READY', 'AAAAA', 'RZEBVVKJUAVRKTBFBT', 'letters'],
  ['vernam.html', 'vernam', 'encode', 'GOLD', 'KEYS', '0c0a1517', 'letters'],
  ['vernam.html', 'vernam', 'decode', '0c0a1517', 'KEYS', 'GOLD', 'letters'],
  ['vernam.html', 'vernam', 'encode', 'H', 'hex:b4', 'fc', 'letters', '11111100'],
  ['vic.html', 'vic', 'encode', 'AGENT REPORT', 'SNOWFALL', '1684148420723182491', 'letters', DEMO],
  ['vietnamese-underground.html', 'monoalphabetic', 'encode', 'ADVANCE TO POSITIONS', 'GIAIPHONG', 'GPVGKAH TL MLSCTCLKS', 'letters', DEMO],
  ['vigenere.html', 'vigenere', 'encode', 'ATTACKATDAWN', 'LEMON', 'LXFOPVEFRNHR', 'letters'],
  ['vigenere.html', 'vigenere', 'encode', 'HELLO', 'KEY', 'RIJVS', 'letters'],
  ['vigenere.html', 'vigenere', 'decode', 'VVQECILMYMPM', 'COMPLETEVICTORY', 'THEPRESIDENT', 'letters'],
  // voynich.html is a display map, not a decipherment; this guards the 1:1
  // A->EVA table that the "About this Demo" panel describes.
  ['voynich.html', 'voynich', 'encode', 'HE WHO DECIPHERS THIS WILL BE FAMOUS', undefined,
    'cd jci edykncdqx gckx jkff ad solizx', 'symbols', DEMO],
  // Wadsworth 26:33. The step-by-step table on the page traces ATTACK; the
  // repeated-A vector pins the exhibit's central claim that a plaintext
  // letter cycles all 33 outer symbols before any ciphertext value recurs.
  ['wadsworth-cipher.html', 'wadsworth', 'encode', 'A', 'WADSWORTH', 'B', 'letters', 'B'],
  ['wadsworth-cipher.html', 'wadsworth', 'encode', 'ATTACK', 'WADSWORTH', 'BG8U4B', 'letters'],
  ['wadsworth-cipher.html', 'wadsworth', 'decode', 'BG8U4B', 'WADSWORTH', 'ATTACK', 'letters'],
  ['wadsworth-cipher.html', 'wadsworth', 'encode', 'AAAAAAAA', 'WADSWORTH', 'B3UNG8ZS', 'letters', DERIVED], // the prose claim about repeated A's cycling the outer disc
  ['wadsworth-cipher.html', 'wadsworth', 'encode', 'ATTACKATDAWN', 'WADSWORTH', 'BG8U4BNSH8YJ', 'letters', DERIVED], // extension of the printed ATTACK trace
  ['wallis-ciphers.html', 'wallisCiphers', 'encode', 'KING CHARLES MARCH OXFORD', 'WALLIS', '100 137 162 129', 'letters', DEMO],
  ['wallis-ciphers.html', 'wallisCiphers', 'decode', '100 137 162 129', 'WALLIS', 'KING CHARLES MARCH OXFORD', 'letters', DERIVED], // roundtrip of the demo default
  ['wheatstone.html', 'wheatstone', 'encode', 'TELEGRAPH SIGNAL', 'WHEATSTONE', 'QTFTOMWKNPBOIWF', 'letters', DEMO],
  ['zimmermann.html', 'zimmermann', 'encode', 'WAR WITH MEXICO STOP', '0', '00098 00010 00097 00102', 'letters', DEMO],
  ['zimmermann.html', 'zimmermann', 'decode', '00098 00010 00097 00102', '0', 'WAR WITH MEXICO STOP', 'letters', DERIVED], // roundtrip of the demo default
  ['zodiac.html', 'caesar', 'decode', 'XLI UYMGO FVSAR JSB', '4', 'THE QUICK BROWN FOX', 'letters']
];

// The DERIVED escape hatch is deliberately capped. Raising this number means
// adding a vector that pins nothing a visitor can see — justify it in review.
const DERIVED_COUNT = VECTORS.filter(v => v[7] === DERIVED).length;
const DERIVED_BUDGET = 26;

// ── Guard C: demo wiring ────────────────────────────────────────────────────
// page -> the engine its <div class="demo-section" data-cipher="..."> must
// resolve to through the demo-loader CONFIGS table.
const DEMO_WIRING = {
  'adfgvx.html': 'adfgvx', 'adfgx.html': 'adfgx', 'aeneas-tacticus.html': 'aeneasTacticus',
  'affine.html': 'affine', 'alberti-disk.html': 'alberti', 'amharic-ge-ez-ciphers.html': 'geezMonastic',
  'arabic-nomenclators.html': 'nomenclator', 'argenti.html': 'argenti', 'arnold-andre.html': 'arnoldAndre',
  'atbash.html': 'atbash', 'autokey.html': 'autokey', 'babington.html': 'babington',
  'bacon.html': 'bacon', 'bazeries.html': 'bazeries', 'beale.html': 'beale',
  'beaufort.html': 'beaufort', 'bifid.html': 'bifid', 'bletchley-park.html': 'enigma',
  'book-cipher.html': 'bookCipher', 'caesar.html': 'caesar', 'cardano-autokey.html': 'cardanoAutokey',
  'cardano-grille.html': 'cardanoGrille', 'chaocipher.html': 'chaocipher', 'che-guevara.html': 'vic',
  'chinese-telegraph.html': 'chineseTelegraph', 'columnar.html': 'columnar',
  'commercial-codebooks.html': 'commercialCode', 'confederate-vigenere.html': 'confederateVigenere',
  'copiale.html': 'copiale', 'culper-ring.html': 'culperRing', 'diana-cryptosystem.html': 'diana',
  'dictionary-code.html': 'dictionaryCode', 'double-transposition.html': 'doubleTransposition',
  'enigma.html': 'enigma', 'fialka.html': 'fialka', 'four-square.html': 'foursquare',
  'ira-ciphers.html': 'columnar', 'patterson-jefferson-cipher.html': 'patterson',
  'fractionated-morse.html': 'fractionatedMorse', 'geheimschreiber.html': 'geheimschreiber',
  'great-cipher.html': 'greatCipher', 'gronsfeld.html': 'gronsfeld', 'hill.html': 'hill',
  'homophonic.html': 'homophonic', 'jefferson-disk.html': 'jefferson',
  'jn-25.html': 'jn25', 'kama-sutra.html': 'kamaSutra', 'kl-7.html': 'kl7', 'kryha.html': 'kryha',
  'kryptos.html': 'kryptos', 'latin-american-codebooks.html': 'commercialCode', 'lorenz.html': 'lorenz',
  'm-94.html': 'm94', 'm209.html': 'm209', 'monoalphabetic.html': 'monoalphabetic', 'morse.html': 'morse',
  'navajo-code-talkers.html': 'navajo', 'nihilist.html': 'nihilist', 'nomenclator.html': 'nomenclator',
  'null-cipher.html': 'nullCipher', 'one-time-pad.html': 'otp', 'pigpen.html': 'pigpen',
  'playfair.html': 'playfair', 'polybius.html': 'polybius', 'porta.html': 'porta', 'purple.html': 'purple',
  'rail-fence.html': 'railFence', 'red-army-faction.html': 'otp', 'red-type-a.html': 'redTypeA',
  'rot13.html': 'rot13', 'running-key.html': 'runningKey', 'scytale.html': 'scytale',
  'sigaba.html': 'sigaba', 'slidex.html': 'slidex', 'solitaire.html': 'solitaire', 'stager.html': 'stager',
  'station-hypo.html': 'jn25', 'straddling-checkerboard.html': 'straddlingCheckerboard',
  'tap-code.html': 'tapCode', 'trifid.html': 'trifid', 'trithemius.html': 'trithemius',
  'two-square.html': 'twosquare', 'typex.html': 'typex',
  // venona.html mounts the GENERIC otp playground on purpose: the page's own
  // pad-reuse attack widget sits above it and says so in as many words. The
  // real VENONA mechanism (venonaPadReuse) drives that bespoke widget.
  'venona.html': 'otp',
  'vernam.html': 'vernam', 'vic.html': 'vic', 'vietnamese-underground.html': 'monoalphabetic',
  'vigenere.html': 'vigenere', 'voynich.html': 'voynich', 'wadsworth-cipher.html': 'wadsworth',
  'wallis-ciphers.html': 'wallisCiphers', 'wheatstone.html': 'wheatstone', 'zimmermann.html': 'zimmermann'
};

// Pages carrying a data-cipher that demo-loader deliberately does NOT configure,
// because the page hand-builds its own widget.
const BESPOKE_DEMOS = new Set([
  'bach-motif.html', 'cicada-3301.html', 'dagapeyeff.html', 'dancing-men.html', 'dorabella.html',
  'egyptian-substitution.html', 'freemason-pigpen.html', 'gold-bug.html', 'histiaeus-tattoo.html',
  'krypto-arg.html', 'mccormick.html', 'mit-mystery-hunt.html', 'phaistos-disc.html',
  'rosetta-stone.html', 'sator-square.html', 'shugborough.html', 'somerton-man.html', 'zodiac.html'
]);

// ── Guard D: Hall XII must never claim a decipherment ───────────────────────
const UNSOLVED = [
  'voynich.html', 'beale.html', 'dorabella.html', 'phaistos-disc.html',
  'mccormick.html', 'somerton-man.html', 'dagapeyeff.html'
];

function normalize(value, compare) {
  if (compare === 'symbols') return String(value).trim().replace(/\s+/g, ' ');
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Strip tags and comments but KEEP <script> bodies, so interface labels and JS
// string literals count as printed surfaces (see CLAUDE.md).
function pageText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-zA-Z]+;|&#\d+;/g, ' ');
}

const squash = value => String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');

const pageCache = new Map();
function readPage(page) {
  if (!pageCache.has(page)) {
    const file = path.join(CIPHERS, page);
    pageCache.set(page, fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null);
  }
  return pageCache.get(page);
}

// Parse the demo-loader CONFIGS table: page defaults must be checked, not trusted.
function loadDemoConfigs() {
  const src = fs.readFileSync(path.join(REPO, 'js/demo-loader.js'), 'utf8');
  const start = src.indexOf('const CONFIGS');
  const end = src.indexOf('function buildDemo');
  const body = src.slice(start, end).replace(/^const CONFIGS\s*=\s*/, '').trim().replace(/;$/, '');
  // eslint-disable-next-line no-eval
  const configs = eval('(' + body + ')');
  const out = {};
  for (const [name, config] of Object.entries(configs)) {
    const first = (config.inputs || [])[0];
    out[name] = {
      engine: config.engine,
      msg: config.defaultMsg,
      key: first ? String(first.value) : undefined
    };
  }
  return out;
}

const CONFIGS = loadDemoConfigs();

function dataCipherOf(html) {
  const match = html && html.match(/data-cipher="([^"]*)"/);
  return match ? match[1] : null;
}

let passed = 0;
let failed = 0;
const fail = (label, detail) => {
  console.error(`  ❌  ${label}`);
  if (detail) console.error(`      ${detail}`);
  failed++;
};

// ── Guard A + B ─────────────────────────────────────────────────────────────
for (const [page, engineName, mode, input, key, expected, compare, anchor] of VECTORS) {
  const engine = E[engineName];
  if (!engine) { fail(`${page}: engine ${engineName} missing`); continue; }

  const actual = engine[mode](input, key);
  if (normalize(actual, compare) !== normalize(expected, compare)) {
    fail(`${page} [${engineName}.${mode}] ${JSON.stringify(input)} key=${JSON.stringify(key)}`,
      `page:   ${expected}\n      engine: ${actual}`);
    continue;
  }
  passed++;

  const html = readPage(page);
  if (html === null) { fail(`${page}: exhibit page not found`); continue; }

  if (anchor === DERIVED) { passed++; continue; }

  if (anchor === DEMO) {
    const slug = dataCipherOf(html);
    const config = slug && CONFIGS[slug];
    if (!config) {
      fail(`${page}: vector marked DEMO but page has no demo-loader config`, `data-cipher=${slug}`);
      continue;
    }
    const wantKey = config.key === undefined ? undefined : String(config.key);
    const gotKey = key === undefined ? undefined : String(key);
    if (config.msg !== input || wantKey !== gotKey) {
      fail(`${page}: DEMO vector no longer matches the demo-loader defaults`,
        `config: msg=${JSON.stringify(config.msg)} key=${JSON.stringify(config.key)}\n` +
        `      vector: msg=${JSON.stringify(input)} key=${JSON.stringify(key)}`);
      continue;
    }
    passed++;
    continue;
  }

  // Default: the value (or the named decomposed anchor) must be printed.
  const wanted = anchor === undefined ? expected : anchor;
  const needle = squash(wanted);
  if (!squash(pageText(html)).includes(needle) && !squash(html).includes(needle)) {
    fail(`${page}: pinned value is no longer printed on the page`,
      `looked for: ${JSON.stringify(wanted)}\n` +
      '      A vector that pins nothing a visitor can see has stopped guarding the prose.\n' +
      '      Either restore the example to the page, give the row an explicit anchor\n' +
      '      naming what IS printed, or mark it DEMO / DERIVED with a reason.');
    continue;
  }
  passed++;
}

if (DERIVED_COUNT > DERIVED_BUDGET) {
  fail(`DERIVED budget exceeded: ${DERIVED_COUNT} vectors pin nothing visible (budget ${DERIVED_BUDGET})`,
    'Each DERIVED row is a vector no visitor can check against the page. Justify in review.');
} else {
  passed++;
}

// ── Guard C ─────────────────────────────────────────────────────────────────
const allPages = fs.readdirSync(CIPHERS).filter(f => f.endsWith('.html')).sort();
for (const page of allPages) {
  const html = readPage(page);
  const slug = dataCipherOf(html);
  if (!slug) {
    if (DEMO_WIRING[page]) fail(`${page}: expected a data-cipher declaration, found none`);
    else passed++;
    continue;
  }
  const config = CONFIGS[slug];
  if (!config) {
    if (BESPOKE_DEMOS.has(page)) passed++;
    else fail(`${page}: data-cipher="${slug}" has no demo-loader config and is not listed as bespoke`);
    continue;
  }
  const want = DEMO_WIRING[page];
  if (!want) {
    fail(`${page}: wired to engine "${config.engine}" but absent from DEMO_WIRING`,
      'A new exhibit demo must declare which engine its prose is about.');
  } else if (want !== config.engine) {
    fail(`${page}: demo wired to the wrong engine`,
      `expected ${want}, demo-loader resolves data-cipher="${slug}" to ${config.engine}`);
  } else {
    passed++;
  }
}

// ── Guard D ─────────────────────────────────────────────────────────────────
for (const page of UNSOLVED) {
  const html = readPage(page);
  if (html === null) { fail(`${page}: unsolved exhibit missing`); continue; }
  const text = pageText(html);
  if (!/unsolved|undeciphered|never been (deciphered|publicly cracked|solved)/i.test(text)) {
    fail(`${page}: Hall XII exhibit no longer labels itself unsolved`);
    continue;
  }
  if (/\bsolution confirmed\b|\bnow deciphered\b|\bwe have solved\b/i.test(text)) {
    fail(`${page}: Hall XII exhibit appears to claim a decipherment`);
    continue;
  }
  passed++;
}

console.log('\n━━━ Exhibit example vectors ━━━');
console.log(`  ${VECTORS.length} page vectors  ·  ${DERIVED_COUNT}/${DERIVED_BUDGET} DERIVED  ·  ` +
  `${Object.keys(DEMO_WIRING).length} wired demos  ·  ${UNSOLVED.length} unsolved exhibits`);
console.log(`  ✅ ${passed} assertions passed   ❌ ${failed} failed`);
if (failed > 0) process.exit(1);
