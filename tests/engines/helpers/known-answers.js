'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');

const KATS = {
  // Caesar definition: A shifted once is B. See Suetonius, Divus Julius 56.
  caesar: kat('B', engine => engine.encode('A', '1'), 'Caesar shift definition'),
  // Keyword alphabet ZEBRA... places Z in plaintext-A position.
  monoalphabetic: kat('Z', engine => engine.encode('A', 'ZEBRA'), 'keyword alphabet derivation'),
  // Standard 5x5 Polybius square: A is row 1, column 1.
  polybius: kat('11', engine => engine.encode('A'), 'standard Polybius coordinates'),
  // The frequency table allocates numeric code 10 to A before any seeded selection.
  homophonic: kat('A', engine => engine.decode('10', 'CIPHER'), 'frequency-table derivation'),
  // Published textbook vector: https://en.wikipedia.org/wiki/Playfair_cipher
  playfair: kat('BMODZBXDNABEKUDMUIXMMOUVIF', engine =>
    engine.encode('HIDE THE GOLD IN THE TREE STUMP', 'PLAYFAIREXAMPLE'), 'published Playfair vector'),
  // Matrix [[3,3],[2,5]] maps HE -> HI and LP -> AT modulo 26.
  hill: kat('HIAT', engine => engine.encode('HELP', '3,3,2,5'), 'published Hill matrix vector'),
  // Published vector: https://en.wikipedia.org/wiki/Vigenere_cipher
  vigenere: kat('LXFOPVEFRNHR', engine => engine.encode('ATTACKATDAWN', 'LEMON'), 'published Vigenere vector'),
  // Beaufort C=K-P: B(1)-A(0)=B(1).
  beaufort: kat('B', engine => engine.encode('A', 'B'), 'Beaufort arithmetic derivation'),
  // Gronsfeld is numeric Vigenere: A+1=B.
  gronsfeld: kat('B', engine => engine.encode('A', '1'), 'Gronsfeld arithmetic derivation'),
  // Porta tableau row A/B maps A to N.
  porta: kat('N', engine => engine.encode('A', 'A'), 'Porta tableau derivation'),
  // Running-key arithmetic with a one-letter B key maps A to B.
  runningKey: kat('B', engine => engine.encode('A', 'B'), 'running-key arithmetic derivation'),
  // Published vector: https://en.wikipedia.org/wiki/Rail_fence_cipher
  railFence: kat('WECRLTEERDSOEEFEAOCAIVDEN', engine =>
    engine.encode('WEAREDISCOVEREDFLEEATONCE', '3'), 'published Rail Fence vector'),
  // BA orders column 1 before 0: ABCDEF -> BDF|ACE.
  columnar: kat('BDFACE', engine => engine.encode('ABCDEF', 'BA'), 'ragged-column derivation'),
  // Applying the same BA transposition twice: BDFACE -> DAE|BFC.
  doubleTransposition: kat('DAEBFC', engine => engine.encode('ABCDEF', 'BA,BA'), 'double-column derivation'),
  // Bacon's 0 value is five A symbols: https://en.wikipedia.org/wiki/Bacon%27s_cipher
  bacon: kat('AAAAA', engine => engine.encode('A'), 'published Bacon alphabet'),
  // Tap Code A occupies row 1, column 1.
  tapCode: kat('. .', engine => engine.encode('A'), 'Tap Code coordinate derivation'),
  // The museum's displayed Pigpen table assigns its first grid glyph to A.
  pigpen: kat('⌐', engine => engine.encode('A'), 'displayed Pigpen table'),
  // A one-letter Bifid coordinate stream recombines to the same coordinate.
  bifid: kat('A', engine => engine.encode('A', 'SECRET'), 'singleton Bifid derivation'),
  // A one-letter Trifid coordinate stream recombines to the same cube cell.
  trifid: kat('A', engine => engine.encode('A', 'FELIX', 5), 'singleton Trifid derivation'),
  // Natural keyed square puts A at (0,0), emitted as AA; one-column key preserves order.
  adfgx: kat('AA', engine => engine.encode('A', 'A,B'), 'ADFGX square derivation'),
  // Natural 6x6 square puts A at (0,0), emitted as AA.
  adfgvx: kat('AA', engine => engine.encode('A', 'A,B'), 'ADFGVX square derivation'),
  // Natural Polybius A=11 plus key A=11 gives 22.
  nihilist: kat('22', engine => engine.encode('A', 'A,A'), 'Nihilist coordinate addition'),
  // Mod-26 OTP arithmetic: HELLO + XMCKL = EQNVZ.
  otp: kat('EQNVZ', engine => engine.encode('HELLO', 'XMCKL'), 'OTP letter arithmetic derivation'),
  // 5-bit values: 7^23=16, 4^12=8, 11^2=9, 11^10=1, 14^11=5.
  venonaPadReuse: kat('QIJBF', engine => engine.encode('HELLO', 'XMCKL'), '5-bit XOR derivation'),
  // Morse A is .-; terminal x gives trigraph .-x (index 5), identity substitution -> F.
  fractionatedMorse: kat('F', engine => engine.encode('A', 'A'), 'Fractionated Morse trigraph derivation'),
  // The brass-disk implementation uses Vigenere arithmetic: A+B=B.
  confederateVigenere: kat('B', engine => engine.encode('A', 'B'), 'Confederate disk derivation'),
  // Number 1 yields keyword ONE, so plaintext A substitutes to O; a one-letter block is unchanged.
  bazeries: kat('O', engine => engine.encode('A', '1'), 'Bazeries number-word derivation'),
  // Inner disk AZBY... at initial setting 3 maps outer A to inner position 3, Y.
  alberti: kat('Y', engine => engine.encode('A', '3'), 'Alberti disk derivation'),
  // Disk 1 places H immediately after A; offset row is +1.
  jefferson: kat('H', engine => engine.encode('A', '1,2'), 'Jefferson disk-table derivation'),
  // Canonical I-II-III/B/AAA vector: https://cryptomuseum.com/crypto/enigma/i/
  enigma: kat('BDZGO', engine => engine.encode('AAAAA', 'AAA'), 'canonical Enigma vector'),
  // Independently derived ITA2 output using 5 chi, 5 psi, and 37/61 motor wheels.
  lorenz: kat('4Q2HKXOOMKAT', engine => engine.encode('ATTACKATDAWN', 'LORENZ'), 'independent 12-wheel derivation'),
  // ALFA is reference word 1 and starts with A.
  dictionaryCode: kat('1', engine => engine.encode('A', 'ALFA BRAVO'), 'dictionary-index derivation'),
  // Two-column grid AB/CD reads AC then the second column bottom-up, DB.
  stager: kat('ACDB', engine => engine.encode('ABCD', '2'), 'Stager route derivation'),
  // Key A maps A to checkerboard 0; chain digit 1 makes 1; one digit survives both transpositions.
  vic: kat('1', engine => engine.encode('A', 'A'), 'four-stage VIC derivation'),
  // Three rows containing AB/CD/EF read columns as ACE|BDF.
  scytale: kat('ACEBDF', engine => engine.encode('ABCDEF', '3'), 'Scytale grid derivation'),
  // Exhibit bit example: 0x48 XOR 0xB4 = 0xFC.
  vernam: kat('fc', engine => engine.encode('H', 'hex:b4'), 'published Vernam XOR example'),
  // Independent seed/table derivation: ROI maps single-letter token A to code 182.
  greatCipher: kat('182', engine => engine.encode('A', 'ROI'), 'independent seeded codebook derivation'),
  // Independent symbol-pool shuffle: BABINGTON maps A to bracket token w32.
  babington: kat('⟨w32⟩', engine => engine.encode('A', 'BABINGTON'), 'independent seeded symbol derivation'),
  // TANK is a fixed USMC vocabulary entry rather than a randomized spelling path.
  navajo: kat('[CHAY-DA-GAHI]', engine => engine.encode('TANK'), 'USMC vocabulary lookup'),
  // The visualization maps Latin A to the first EVA-safe glyph, o.
  voynich: kat('o', engine => engine.encode('A'), 'EVA display-map derivation'),
  // Atbash reflects A to Z.
  atbash: kat('Z', engine => engine.encode('A'), 'Atbash definition'),
  // ROT13 maps A thirteen places to N.
  rot13: kat('N', engine => engine.encode('A'), 'ROT13 definition'),
  // With natural squares, AA occupies matching (0,0) cells and remains AA.
  foursquare: kat('AA', engine => engine.encode('AA', 'A,A'), 'Four-Square cell derivation'),
  // With natural squares, AB shares a row and the no-flip variant leaves it AB.
  twosquare: kat('AB', engine => engine.encode('AB', 'A,A'), 'Two-Square row derivation'),
  // ATONESIRE occupies top-row slots 0,1,3,4,5,6,8,9; therefore A=0.
  straddlingCheckerboard: kat('0', engine => engine.encode('A', 'ATONESIRE'), 'checkerboard derivation'),
  // Key A yields natural left alphabet and right rotated by 13; right-A index 13 -> left-N.
  chaocipher: kat('N', engine => engine.encode('A', 'A'), 'Chaocipher initial-alphabet derivation'),
  // Independent pin-wheel seed derivation gives four active position-zero pins; Beaufort A -> E.
  m209: kat('E', engine => engine.encode('A', 'HAGELIN'), 'independent seeded pin derivation'),
  // Official Schneier vector: https://www.schneier.com/academic/solitaire/
  solitaire: kat('ITHZUJIWGRFARMW', engine => engine.encode('AAAAAAAAAAAAAAA', 'FOO'), 'Schneier Solitaire vector'),
  // A book containing ALPHA at position 1 encodes A as index 1.
  beale: kat('1', engine => engine.encode('A', 'ALPHA'), 'book-index derivation'),
  // Independent symbol-pool derivation for seed COPIALE assigns first A selection V5.
  copiale: kat('V5', engine => engine.encode('A', 'COPIALE'), 'independent seeded homophone derivation'),
  // K is custom-tableau index zero, so it adds no displacement to A.
  kryptos: kat('A', engine => engine.encode('A', 'K'), 'Kryptos-tableau derivation'),
  // Independent sixes-bank seed derivation maps initial A to A for key PURPLE.
  purple: kat('A', engine => engine.encode('A', 'PURPLE'), 'independent sixes-bank derivation'),
  // Vigenere autokey primer B maps initial A to B.
  autokey: kat('B', engine => engine.encode('A', 'B'), 'Autokey primer derivation'),
  // The fixed nomenclator assigns THE code 60.
  nomenclator: kat('60', engine => engine.encode('THE'), 'nomenclator table lookup'),
  // WHEN is the first word in the embedded Declaration reference.
  bookCipher: kat('1', engine => engine.encode('WHEN'), 'embedded book lookup'),
  // Independent 64-alphabet/step derivation maps initial A to X for seed SIGABA.
  sigaba: kat('X', engine => engine.encode('A', 'SIGABA'), 'independent seeded schedule derivation'),
  // Independent rotor/reflector derivation maps initial A to U for seed TYPEX.
  typex: kat('U', engine => engine.encode('A', 'TYPEX'), 'independent seeded rotor derivation'),
  // Natural keyed alphabet pairs opposite ends, A with Z.
  kamaSutra: kat('Z', engine => engine.encode('A', 'A'), 'paired-alphabet derivation'),
  // Water-clock code uses one-based alphabet positions.
  aeneasTacticus: kat('1', engine => engine.encode('A'), 'one-based signal derivation'),
  // Pedagogical codebook A=10000 and zero additive leaves 10000.
  jn25: kat('10000', engine => engine.encode('A', '00000'), 'JN-25 group derivation'),
  // Independent vowel-table seed derivation maps initial A to O.
  redTypeA: kat('O', engine => engine.encode('A', 'TOKYORED'), 'independent switch-table derivation'),
  // Published affine example: E(x)=5x+8 maps HELLO to RCLLA.
  affine: kat('RCLLA', engine => engine.encode('HELLO', '5,8'), 'published Affine vector'),
  // Progressive shifts 0,1,2,3,4 map HELLO to HFNOS.
  trithemius: kat('HFNOS', engine => engine.encode('HELLO', '0'), 'Trithemius arithmetic derivation'),
  // Seed B supplies the first autokey shift: A+B=B.
  cardanoAutokey: kat('B', engine => engine.encode('A', 'B'), 'Cardano autokey derivation'),
  // Keyed inner disk starts with W for WHEATSTONE; initial outer A advances zero.
  wheatstone: kat('W', engine => engine.encode('A', 'WHEATSTONE'), 'Wheatstone dial derivation'),
  // ITU International Morse assigns A the code .-.
  morse: kat('.-', engine => engine.encode('A'), 'ITU Morse table'),
  // One grille slot at index 0 carries A; remaining 2x2 cells use filler indices H,E,Q.
  cardanoGrille: kat('AH\nEQ', engine => engine.encode('A', '2:0'), 'Cardano grid derivation'),
  // The first carrier beginning with A in the fixed list is "and".
  nullCipher: kat('and', engine => engine.encode('A', 'first'), 'carrier-list derivation'),
  // Independent ten-rotor seed derivation maps initial A to J (M125 normalizes to M).
  fialka: kat('J', engine => engine.encode('A', 'M125'), 'independent seeded rotor derivation'),
  // Independent eight-rotor/notch derivation maps initial A to C.
  kl7: kat('C', engine => engine.encode('A', 'TSEC'), 'independent seeded rotor derivation'),
  // Independent ten-wheel additive/permutation derivation maps initial A to S.
  geheimschreiber: kat('S', engine => engine.encode('A', 'STURGEON'), 'independent seeded wheel derivation'),
  // Independent mixed-wheel derivation puts B at plaintext-A position initially.
  kryha: kat('B', engine => engine.encode('A', 'POCKET'), 'independent seeded wheel derivation'),
  // Independent standard-disk derivation reads five places after A as O.
  m94: kat('O', engine => engine.encode('A', '5'), 'independent seeded disk derivation'),
  // The illustrative fixed table assigns A code 0012; additive zero leaves it unchanged.
  chineseTelegraph: kat('0012', engine => engine.encode('A', '0'), 'fixed telegraph-table derivation'),
  // THE is embedded word-list index zero and formats as five digits.
  zimmermann: kat('00000', engine => engine.encode('THE', '0'), 'embedded codebook derivation'),
  // Independent keyed-card derivation maps plaintext bigram AB to LQ.
  slidex: kat('LQ', engine => engine.encode('AB', 'SLIDEX'), 'independent seeded card derivation'),
  // CVCVC index zero selects B,A,B,A,B.
  commercialCode: kat('BABAB', engine => engine.encode('THE'), 'commercial codeword derivation'),
  // THE is codebook entry zero and Culper codes begin at 100.
  culperRing: kat('100', engine => engine.encode('THE'), 'Tallmadge-table derivation'),
  // OF is the first word in the reconstructed source: page 1, line 1, word 1.
  arnoldAndre: kat('1.1.1', engine => engine.encode('OF'), 'book-coordinate derivation'),
  // Independent homophone-pool derivation assigns the first A use code 66.
  argenti: kat('66', engine => engine.encode('A', 'ARGENTI'), 'independent seeded homophone derivation'),
  // KING is the first fixed Wallis codebook entry, numbered 100.
  wallisCiphers: kat('100', engine => engine.encode('KING', 'WALLIS'), 'Wallis codebook derivation'),
  // YEOKHAK letter values sum to 76; 76 mod 64 mod 26 = 12, so A -> M.
  joseonYeokhak: kat('M', engine => engine.encode('A', 'YEOKHAK'), 'hexagram arithmetic derivation'),
  // Independent keyed permutation derivation places P in plaintext-A position.
  geezMonastic: kat('P', engine => engine.encode('A', 'GEEZ'), 'independent seeded alphabet derivation'),
  // Diana/Beaufort arithmetic: D(3)-A(0)=D(3).
  diana: kat('D', engine => engine.encode('A', 'D'), 'Diana table derivation')
};

function kat(expected, run, provenance) {
  return { expected, run, provenance };
}

function defineKnownAnswerSpec(name, engine) {
  const vector = KATS[name];
  if (!vector) throw new Error(`Missing KAT for ${name}`);
  test(`${name}: KAT (${vector.provenance})`, () => {
    assert.equal(vector.run(engine), vector.expected);
  });
}

module.exports = { KATS, defineKnownAnswerSpec };