'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');

// Two classes of vector live here:
//  1. Derived KATs — the expected value comes from a published source or a
//     hand-computable derivation that never consults the engine.
//  2. Pinned regression vectors — for seeded pedagogical machine models whose
//     output cannot be derived by hand, the expected value was captured from
//     the audited implementation. They lock the behavior against regressions
//     but are NOT independent evidence of correctness; each is labeled
//     "pinned regression vector" (see docs/ENGINE_AUDIT.md, KAT provenance).
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
  // Hand derivation. SECRET square (J merged): SECRT/ABDFG/HIKLM/NOPQU/VWXYZ.
  // ATTACKATDAWN rows = 100102101143, cols = 044022042010; concatenated and
  // re-paired per Delastelle: (1,0)(0,1)(0,2)(1,0)(1,1)(4,3)(0,4)(4,0)(2,2)(0,4)(2,0)(1,0).
  bifid: kat('AECABYTVKTHA', engine => engine.encode('ATTACKATDAWN', 'SECRET'), 'Delastelle square derivation'),
  // Pinned from the audited implementation (period-5 Delastelle cube; the
  // 27-cell cube layout is implementation-defined, so no independent reference).
  trifid: kat('CLMQLHGTTFVQ', engine => engine.encode('ATTACKATDAWN', 'FELIX', 5), 'pinned regression vector'),
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
  // Pinned from the audited implementation (seeded 12-wheel model; the spec's
  // reference model shares the algorithm, so this is not independent evidence).
  lorenz: kat('4Q2HKXOOMKAT', engine => engine.encode('ATTACKATDAWN', 'LORENZ'), 'pinned regression vector'),
  // ALFA is reference word 1 and starts with A.
  dictionaryCode: kat('1', engine => engine.encode('A', 'ALFA BRAVO'), 'dictionary-index derivation'),
  // Two-column grid AB/CD reads AC then the second column bottom-up, DB.
  stager: kat('ACDB', engine => engine.encode('ABCD', '2'), 'Stager route derivation'),
  // Pinned from the audited implementation (checkerboard + chain addition +
  // double transposition, all derived from the keyword).
  vic: kat('897004678276227388', engine => engine.encode('ATTACKATDAWN', 'SNOWFALL'), 'pinned regression vector'),
  // Three rows containing AB/CD/EF read columns as ACE|BDF.
  scytale: kat('ACEBDF', engine => engine.encode('ABCDEF', '3'), 'Scytale grid derivation'),
  // Exhibit bit example: 0x48 XOR 0xB4 = 0xFC.
  vernam: kat('fc', engine => engine.encode('H', 'hex:b4'), 'published Vernam XOR example'),
  // Pinned from the audited implementation (seeded codebook).
  greatCipher: kat('182', engine => engine.encode('A', 'ROI'), 'pinned regression vector'),
  // Pinned from the audited implementation (seeded symbol pool).
  babington: kat('⟨w32⟩', engine => engine.encode('A', 'BABINGTON'), 'pinned regression vector'),
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
  // Pinned from the audited implementation (seeded pin-and-lug model).
  m209: kat('E', engine => engine.encode('A', 'HAGELIN'), 'pinned regression vector'),
  // Official Schneier vector: https://www.schneier.com/academic/solitaire/
  solitaire: kat('ITHZUJIWGRFARMW', engine => engine.encode('AAAAAAAAAAAAAAA', 'FOO'), 'Schneier Solitaire vector'),
  // A book containing ALPHA at position 1 encodes A as index 1.
  beale: kat('1', engine => engine.encode('A', 'ALPHA'), 'book-index derivation'),
  // Pinned from the audited implementation (seeded homophone pool).
  copiale: kat('V5', engine => engine.encode('A', 'COPIALE'), 'pinned regression vector'),
  // K is custom-tableau index zero, so it adds no displacement to A.
  kryptos: kat('A', engine => engine.encode('A', 'K'), 'Kryptos-tableau derivation'),
  // Pinned from the audited implementation (seeded sixes/twenties model). The
  // sixes/twenties partition itself is asserted separately in purple.spec.js.
  purple: kat('ALDYKSEJPYMD', engine => engine.encode('ATTACKATDAWN', 'PURPLE'), 'pinned regression vector'),
  // Vigenere autokey primer B maps initial A to B.
  autokey: kat('B', engine => engine.encode('A', 'B'), 'Autokey primer derivation'),
  // The fixed nomenclator assigns THE code 60.
  nomenclator: kat('60', engine => engine.encode('THE'), 'nomenclator table lookup'),
  // WHEN is the first word in the embedded Declaration reference.
  bookCipher: kat('1', engine => engine.encode('WHEN'), 'embedded book lookup'),
  // Pinned from the audited implementation (seeded substitution schedule).
  sigaba: kat('X', engine => engine.encode('A', 'SIGABA'), 'pinned regression vector'),
  // Pinned from the audited implementation (seeded rotor model).
  typex: kat('U', engine => engine.encode('A', 'TYPEX'), 'pinned regression vector'),
  // Natural keyed alphabet pairs opposite ends, A with Z.
  kamaSutra: kat('Z', engine => engine.encode('A', 'A'), 'paired-alphabet derivation'),
  // Water-clock code uses one-based alphabet positions.
  aeneasTacticus: kat('1', engine => engine.encode('A'), 'one-based signal derivation'),
  // Pedagogical codebook A=10000 and zero additive leaves 10000.
  jn25: kat('10000', engine => engine.encode('A', '00000'), 'JN-25 group derivation'),
  // Pinned from the audited implementation (seeded vowel/consonant tables).
  redTypeA: kat('O', engine => engine.encode('A', 'TOKYORED'), 'pinned regression vector'),
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
  // Pinned from the audited implementation (seeded ten-rotor model).
  fialka: kat('J', engine => engine.encode('A', 'M125'), 'pinned regression vector'),
  // Pinned from the audited implementation (seeded eight-rotor model).
  kl7: kat('C', engine => engine.encode('A', 'TSEC'), 'pinned regression vector'),
  // Pinned from the audited implementation (seeded wheel model).
  geheimschreiber: kat('S', engine => engine.encode('A', 'STURGEON'), 'pinned regression vector'),
  // Pinned from the audited implementation (seeded wheel model).
  kryha: kat('B', engine => engine.encode('A', 'POCKET'), 'pinned regression vector'),
  // Pinned from the audited implementation (seeded disk set).
  m94: kat('O', engine => engine.encode('A', '5'), 'pinned regression vector'),
  // The illustrative fixed table assigns A code 0012; additive zero leaves it unchanged.
  chineseTelegraph: kat('0012', engine => engine.encode('A', '0'), 'fixed telegraph-table derivation'),
  // THE is embedded word-list index zero and formats as five digits.
  zimmermann: kat('00000', engine => engine.encode('THE', '0'), 'embedded codebook derivation'),
  // Pinned from the audited implementation (seeded bigram card).
  slidex: kat('LQ', engine => engine.encode('AB', 'SLIDEX'), 'pinned regression vector'),
  // CVCVC index zero selects B,A,B,A,B.
  commercialCode: kat('BABAB', engine => engine.encode('THE'), 'commercial codeword derivation'),
  // THE is codebook entry zero and Culper codes begin at 100.
  culperRing: kat('100', engine => engine.encode('THE'), 'Tallmadge-table derivation'),
  // OF is the first word in the reconstructed source: page 1, line 1, word 1.
  arnoldAndre: kat('1.1.1', engine => engine.encode('OF'), 'book-coordinate derivation'),
  // Pinned from the audited implementation (seeded homophone pool).
  argenti: kat('66', engine => engine.encode('A', 'ARGENTI'), 'pinned regression vector'),
  // KING is the first fixed Wallis codebook entry, numbered 100.
  wallisCiphers: kat('100', engine => engine.encode('KING', 'WALLIS'), 'Wallis codebook derivation'),
  // YEOKHAK letter values sum to 76; 76 mod 64 mod 26 = 12, so A -> M.
  // Hand derivation. Key WADSWORTH gives the inner sequence
  // W,A,D,S,O,R,T,H,B,C,... so plaintext A sits one step from the index;
  // one step advances the 33-symbol outer disc from A to B.
  // Key "10" is a single line taking zero arbitrary letters, so the cipher
  // reduces to the identity -- the smallest hand-checkable Patterson case.
  patterson: kat('ATTACK', engine => engine.encode('ATTACK', '10'), 'Patterson single-line identity'),
  wadsworth: kat('B', engine => engine.encode('A', 'WADSWORTH'), 'Wadsworth 26:33 gearing derivation'),
  // Pinned from the audited implementation (seeded keyed permutation).
  geezMonastic: kat('P', engine => engine.encode('A', 'GEEZ'), 'pinned regression vector'),
  // Published Special Forces worked example (radio operator account, repr.
  // Programming Praxis 2014): pad GORWY WETFR COYET over ATTAC KATDA WNXYZ
  // gives TSPDZ TVNRI BYEXH under the DIANA rule P+K+C ≡ 25 (mod 26).
  diana: kat('TSPDZTVNRIBYEXH', engine => engine.encode('ATTACKATDAWNXYZ', 'GORWYWETFRCOYET'), 'published DIANA vector')
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