#!/usr/bin/env node
'use strict';

/**
 * Exhibit-example regression test.
 *
 * Every hardcoded worked example, challenge, and caption vector printed on the
 * exhibit pages was audited against the live engines (2026-07-17 sweep). This
 * test pins those page-displayed vectors so an engine change that would
 * invalidate museum prose fails here, loudly, with the page named.
 *
 * When an engine's convention changes intentionally: update the exhibit page
 * first, then the vector here — never delete a vector to make the suite pass.
 *
 * compare modes:
 *   letters — strip non-alphanumerics, uppercase (most ciphers)
 *   symbols — collapse whitespace runs, trim (morse/tap/format-bearing output)
 */

global.window = global;
require('../js/ciphers/all-engines.js');
const E = global.CipherEngines;

const VECTORS = [
  // page, engine, mode, input, key, expected, compare
  ['atbash.html', 'atbash', 'encode', 'ABCDEFGHIJKLM', undefined, 'ZYXWVUTSRQPON', 'letters'],
  ['atbash.html', 'atbash', 'encode', 'HELLO', undefined, 'SVOOL', 'letters'],
  ['autokey.html', 'autokey', 'encode', 'AUTOKEY REVEAL', 'QUEENLY', 'QOXSXPWRYOSKP', 'letters'],
  ['babington.html', 'babington', 'decode', '⟨w25⟩⟨a14⟩⟨w32⟩⟨a20⟩⟨w33⟩⟨a17⟩⟨x2⟩', 'BABINGTON', 'DAGGERELIZABETHATTHETOWERDEATH', 'letters'],
  ['bacon.html', 'bacon', 'encode', 'HI', undefined, 'AABBB ABAAA', 'letters'],
  ['book-cipher.html', 'bookCipher', 'decode', '48.1 5.1 42.1 15.1', undefined, 'GOLD', 'letters'],
  ['caesar.html', 'caesar', 'encode', 'ABNOZ', '3', 'DEQRC', 'letters'],
  ['caesar.html', 'caesar', 'decode', 'QEB NRFZH YOLTK CLU GRJMP LSBO QEB IXWV ALD', '23', 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG', 'letters'],
  ['cardano-autokey.html', 'cardanoAutokey', 'encode', 'MEET ME AT MIDNIGHT', 'Q', 'CQIXFQETFULQVONA', 'letters'],
  ['diana-cryptosystem.html', 'diana', 'encode', 'ATTACKATDAWNXYZ', 'GORWYWETFRCOYET', 'TSPDZTVNRIBYEXH', 'letters'],
  ['gronsfeld.html', 'gronsfeld', 'encode', 'ATTACKAT', '31415', 'DUXBHNBX', 'letters'],
  ['hill.html', 'hill', 'encode', 'HI', '3,3,2,5', 'TC', 'letters'],
  ['krypto-arg.html', 'caesar', 'encode', 'MEET AT DAWN', '3', 'PHHW DW GDZQ', 'letters'],
  ['monoalphabetic.html', 'monoalphabetic', 'encode', 'HELLO', 'QWERTYUIOPASDFGHJKLZXCVBNM', 'ITSSG', 'letters'],
  ['morse.html', 'morse', 'encode', 'SOS', undefined, '... --- ...', 'symbols'],
  ['morse.html', 'morse', 'encode', 'HELLO', undefined, '.... . .-.. .-.. ---', 'symbols'],
  ['morse.html', 'morse', 'encode', '73', undefined, '--... ...--', 'symbols'],
  ['nomenclator.html', 'nomenclator', 'decode', '60 70 23 09 12 12 90 81 01 20 92', undefined, 'THE KING WILL ATTACK PARIS AT DAWN', 'letters'],
  ['null-cipher.html', 'nullCipher', 'decode', 'Help Every Little Pup', 'first', 'HELP', 'letters'],
  ['one-time-pad.html', 'otp', 'encode', 'HELLO', 'XMCKL', 'EQNVZ', 'letters'],
  ['one-time-pad.html', 'otp', 'encode', 'ATTACK', 'HODIZQ', 'HHWIBA', 'letters'],
  ['playfair.html', 'playfair', 'encode', 'AR', 'MONARCHY', 'RM', 'letters'],
  ['playfair.html', 'playfair', 'encode', 'MC', 'MONARCHY', 'CE', 'letters'],
  ['playfair.html', 'playfair', 'encode', 'HI', 'MONARCHY', 'BF', 'letters'],
  ['playfair.html', 'playfair', 'encode', 'HELPME', 'PLAYFAIR', 'KGALEG', 'letters'],
  ['playfair.html', 'playfair', 'decode', 'KGALEG', 'PLAYFAIR', 'HELPME', 'letters'],
  ['polybius.html', 'polybius', 'encode', 'HELLO', undefined, '23 15 31 31 34', 'letters'],
  ['porta.html', 'porta', 'encode', 'A', 'A', 'N', 'letters'],
  ['rail-fence.html', 'railFence', 'encode', 'HELLOWORLD', '3', 'HOLELWRDLO', 'letters'],
  ['rot13.html', 'rot13', 'encode', 'HELLO', undefined, 'URYYB', 'letters'],
  ['running-key.html', 'runningKey', 'encode', 'ATTACKATDAWN', 'FROMTHISBOOK', 'FKHMVRILEOKX', 'letters'],
  ['scytale.html', 'scytale', 'encode', 'ATTACKATDAWN', '3', 'ACDTKATAWATN', 'letters'],
  ['scytale.html', 'scytale', 'decode', 'ACDTKATAWATN', '3', 'ATTACKATDAWN', 'letters'],
  ['sigaba.html', 'sigaba', 'encode', 'CLIMB MOUNT NIITAKA', 'SIGABA', 'LBVIICVKBEYCICOAV', 'letters'],
  ['tap-code.html', 'tapCode', 'encode', 'H', undefined, '.. ...', 'symbols'],
  ['tap-code.html', 'tapCode', 'encode', 'E', undefined, '. .....', 'symbols'],
  ['trithemius.html', 'trithemius', 'encode', 'STEGANOGRAPHIA', '0', 'SUGJESUNZJZSUN', 'letters'],
  ['typex.html', 'typex', 'decode', 'RZEBVVKJUAVRKTBFBT', 'AAAAA', 'BRITISH SIGNAL READY', 'letters'],
  ['vernam.html', 'vernam', 'encode', 'GOLD', 'KEYS', '0c0a1517', 'letters'],
  ['vernam.html', 'vernam', 'encode', 'H', 'hex:b4', 'fc', 'letters'],
  ['vigenere.html', 'vigenere', 'encode', 'ATTACKATDAWN', 'LEMON', 'LXFOPVEFRNHR', 'letters'],
  ['vigenere.html', 'vigenere', 'encode', 'HELLO', 'KEY', 'RIJVS', 'letters'],
  ['vigenere.html', 'vigenere', 'decode', 'VVQECILMYMPM', 'COMPLETEVICTORY', 'THEPRESIDENT', 'letters'],
  ['zodiac.html', 'caesar', 'decode', 'XLI UYMGO FVSAR JSB', '4', 'THE QUICK BROWN FOX', 'letters'],
  ['nihilist.html', 'nihilist', 'encode', 'ATTACK', 'NIHILIST,NEMO', '33 52 56 63 35 65', 'letters'],
  ['nihilist.html', 'nihilist', 'decode', '33 52 56 63 35 65', 'NIHILIST,NEMO', 'ATTACK', 'letters'],
  ['navajo-code-talkers.html', 'navajo', 'encode', 'IWO', undefined, 'TKIN GLOE-IH A-KHA', 'letters'],
  ['navajo-code-talkers.html', 'navajo', 'encode', 'GUAM', undefined, 'KLIZZIE SHI-DA WOL-LA-CHEE TSIN-TLITI', 'letters'],
  ['navajo-code-talkers.html', 'navajo', 'decode', 'KLIZZIE SHI-DA WOL-LA-CHEE TSIN-TLITI', undefined, 'GUAM', 'letters'],
  ['navajo-code-talkers.html', 'navajo', 'encode', 'ATTACK', undefined, '[AL-TAH-JE-JAY]', 'letters'],
  ['pigpen.html', 'pigpen', 'encode', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', undefined, '⌐ ┴ ¬ ├ ┼ ┤ ┌ ┬ ┐ ⌐• ┴• ¬• ├• ┼• ┤• ┌• ┬• ┐• ╲ ╳ ╱ ╲• ╳• ╱• ▽ △', 'symbols'],
  ['adfgx.html', 'adfgx', 'encode', 'HELLO', 'PRIVACY,A', 'FFDXFXFXGF', 'letters'],
  ['adfgx.html', 'adfgx', 'decode', 'FFDXFXFXGF', 'PRIVACY,A', 'HELLO', 'letters'],
  ['beaufort.html', 'beaufort', 'encode', 'HELLOW', 'SECRET', 'LARGQX', 'letters'],
  ['columnar.html', 'columnar', 'encode', 'WEATHERFORECASTINGXX', 'ZEBRA', 'HRTXAFAGERCNTOSXWEEI', 'letters'],
  ['bifid.html', 'bifid', 'encode', 'HELLO', 'SECRET', 'HKNFO', 'letters'],
  ['double-transposition.html', 'doubleTransposition', 'encode', 'SENDHELPNOW', 'MARK,LION', 'ESLEPNDNOHW', 'letters'],
  ['enigma.html', 'enigma', 'encode', 'AAAAA', 'AAA', 'BDZGO', 'letters'],
  ['krypto-arg.html', 'vigenere', 'encode', 'THE TRUTH IS COMING', 'EXTERMINAL', 'XEXXIGBUIDGLFMES', 'letters'],
  ['fractionated-morse.html', 'fractionatedMorse', 'encode', 'HELLO', 'ROUNDTABLE', 'RAQUNBI', 'letters']
];

function normalize(value, compare) {
  if (compare === 'symbols') return String(value).trim().replace(/\s+/g, ' ');
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

let passed = 0;
let failed = 0;
for (const [page, engineName, mode, input, key, expected, compare] of VECTORS) {
  const engine = E[engineName];
  if (!engine) {
    console.error(`  ❌  ${page}: engine ${engineName} missing`);
    failed++;
    continue;
  }
  const actual = engine[mode](input, key);
  if (normalize(actual, compare) === normalize(expected, compare)) {
    passed++;
  } else {
    console.error(`  ❌  ${page} [${engineName}.${mode}] ${JSON.stringify(input)} key=${JSON.stringify(key)}`);
    console.error(`      page:   ${expected}`);
    console.error(`      engine: ${actual}`);
    failed++;
  }
}

console.log(`\n━━━ Exhibit example vectors ━━━`);
console.log(`  ✅ ${passed} passed   ❌ ${failed} failed   (${VECTORS.length} page vectors)`);
if (failed > 0) process.exit(1);
