'use strict';

const {
  engines,
  fc,
  stringFrom,
  textArbitrary,
  keywordArbitrary,
  numericKeyArbitrary,
  keyPairArbitrary,
  matrixKeyArbitrary,
  defineAlphabetRoundtripSpec,
  defineRobustnessSpec
} = require('./engine-spec');
const { defineKnownAnswerSpec } = require('./known-answers');

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NO_J = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
const NO_K = 'ABCDEFGHIJLMNOPQRSTUVWXYZ';
const VISIBLE_ASCII = Array.from({ length: 95 }, (_, index) => String.fromCharCode(index + 32)).join('');

const keywordKeys = ['KEY', 'A', 'AAAAAA', 'THISKEYISLONGERTHANTHEPLAINTEXT', 'ZYXWVUTSRQPONMLKJIHGFEDCBA'];
const pairKeys = ['PRIVACY,GERMAN', 'A,B', 'AAAA,BBBB', 'THISKEYISLONG,SECONDKEYISEVENLONGER', 'ZEBRA,CIPHER'];
const PRESERVE_TEXT = new Set(['caesar', 'monoalphabetic', 'atbash', 'rot13', 'kamaSutra', 'affine', 'trithemius']);
const WORD_TEXT = new Set(['navajo', 'bookCipher', 'zimmermann', 'commercialCode', 'culperRing', 'arnoldAndre', 'wallisCiphers']);
const IJ_TEXT = new Set(['polybius', 'playfair', 'bacon', 'bifid', 'adfgx', 'nihilist', 'vic', 'foursquare', 'twosquare']);

const contracts = {
  monoalphabetic: {
    alphabet: VISIBLE_ASCII,
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys,
    boundaryText: 'AZaz 09!~'
  },
  polybius: { alphabet: NO_J },
  homophonic: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  playfair: {
    alphabet: NO_J,
    keyArbitrary: keywordArbitrary(NO_J),
    exampleKeys: keywordKeys
  },
  hill: {
    keyArbitrary: matrixKeyArbitrary(),
    exampleKeys: ['3,3,2,5', '1,0,0,1', '1,1,1,2', '25,0,0,25', '7,8,19,3']
  },
  vigenere: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  beaufort: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  gronsfeld: {
    keyArbitrary: stringDigits(),
    exampleKeys: ['31415', '1', '111111', '12345678901234567890', '909090']
  },
  porta: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  runningKey: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  railFence: {
    keyArbitrary: numericKeyArbitrary({ min: 2, max: 32 }),
    exampleKeys: ['3', '2', '4', '32', '8']
  },
  columnar: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: ['ZEBRA', 'A', 'AAAAAA', 'THISKEYISLONGERTHANTHEPLAINTEXT', 'BALLOON']
  },
  doubleTransposition: {
    keyArbitrary: keyPairArbitrary(),
    exampleKeys: pairKeys
  },
  bacon: { alphabet: NO_J },
  tapCode: { alphabet: NO_K },
  pigpen: {},
  bifid: {
    alphabet: NO_J,
    keyArbitrary: keywordArbitrary(NO_J),
    exampleKeys: keywordKeys
  },
  trifid: {
    keyArbitrary: fc.record({
      keyword: keywordArbitrary(),
      period: fc.integer({ min: 1, max: 64 })
    }),
    exampleKeys: [
      { keyword: 'FELIX', period: 5 },
      { keyword: 'A', period: 1 },
      { keyword: 'AAAAAA', period: 2 },
      { keyword: 'THISKEYISLONGERTHANTHEPLAINTEXT', period: 64 },
      { keyword: 'ZYXWVUTSRQPONMLKJIHGFEDCBA', period: 7 }
    ],
    run: (engine, plaintext, key) => engine.decode(
      engine.encode(plaintext, key.keyword, key.period),
      key.keyword,
      key.period
    )
  },
  adfgx: {
    alphabet: NO_J,
    keyArbitrary: keyPairArbitrary(),
    exampleKeys: pairKeys
  },
  adfgvx: {
    alphabet: UPPER + '0123456789',
    keyArbitrary: keyPairArbitrary(),
    exampleKeys: pairKeys
  },
  nihilist: {
    alphabet: NO_J,
    keyArbitrary: keyPairArbitrary(),
    exampleKeys: pairKeys
  },
  otp: sufficientKeyContract(),
  venonaPadReuse: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  fractionatedMorse: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  confederateVigenere: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  bazeries: {
    keyArbitrary: numericKeyArbitrary({ min: 1, max: 99 }),
    exampleKeys: ['42', '1', '11', '99', '7']
  },
  alberti: {
    keyArbitrary: numericKeyArbitrary({ min: 0, max: 25 }),
    exampleKeys: ['3', '0', '11', '25', '7']
  },
  jefferson: {
    keyArbitrary: fc.constantFrom(
      '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26',
      '3,1,5,2,4,6',
      '26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1'
    ),
    exampleKeys: [
      '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26',
      '3,1,5,2,4,6',
      '3,3,3,3,3,3',
      '26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1',
      '2,1'
    ]
  },
  enigma: {
    keyArbitrary: stringFrom(fc.constantFrom(...UPPER), { minLength: 3, maxLength: 3 }),
    exampleKeys: ['AAA', 'AAB', 'MMM', 'ZZZ', 'QEV']
  },
  lorenz: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  dictionaryCode: dictionaryContract(),
  stager: {
    keyArbitrary: numericKeyArbitrary({ min: 2, max: 32 }),
    exampleKeys: ['5', '2', '4', '32', '7']
  },
  vic: {
    alphabet: NO_J,
    keyArbitrary: keywordArbitrary(NO_J),
    exampleKeys: keywordKeys
  },
  scytale: {
    keyArbitrary: numericKeyArbitrary({ min: 2, max: 32 }),
    exampleKeys: ['3', '2', '4', '32', '7']
  },
  vernam: sufficientKeyContract(),
  greatCipher: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys,
    numRuns: 100
  },
  babington: {
    alphabet: 'ABCDEFGHIKLMNOPQRSTUXYZ',
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys,
    numRuns: 100
  },
  navajo: { numRuns: 100 },
  voynich: {},
  atbash: {
    alphabet: VISIBLE_ASCII,
    boundaryText: 'AZaz 09!~'
  },
  rot13: {
    alphabet: VISIBLE_ASCII,
    boundaryText: 'AZaz 09!~'
  },
  foursquare: {
    alphabet: NO_J,
    keyArbitrary: keyPairArbitrary(),
    exampleKeys: pairKeys
  },
  twosquare: {
    alphabet: NO_J,
    keyArbitrary: keyPairArbitrary(),
    exampleKeys: pairKeys
  },
  straddlingCheckerboard: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  chaocipher: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  m209: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  solitaire: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: ['CRYPTONOMICON', 'A', 'AAAAAA', 'THISKEYISLONGERTHANTHEPLAINTEXT', 'FOO']
  },
  beale: bealeContract(),
  copiale: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  kryptos: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  purple: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  autokey: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  nomenclator: {},
  bookCipher: {},
  sigaba: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  typex: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  kamaSutra: {
    alphabet: VISIBLE_ASCII,
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys,
    boundaryText: 'AZaz 09!~'
  },
  aeneasTacticus: {},
  jn25: {
    keyArbitrary: stringDigits(),
    exampleKeys: ['31415', '1', '111111', '12345678901234567890', '909090']
  },
  redTypeA: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  affine: {
    alphabet: VISIBLE_ASCII,
    keyArbitrary: affineKeyArbitrary(),
    exampleKeys: ['5,8', '1,0', '3,3', '25,25', '11,-99'],
    boundaryText: 'AZaz 09!~'
  },
  trithemius: {
    alphabet: VISIBLE_ASCII,
    keyArbitrary: numericKeyArbitrary(),
    exampleKeys: ['0', '1', '111111', '123456789', '-25'],
    boundaryText: 'AZaz 09!~'
  },
  cardanoAutokey: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  wheatstone: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  morse: { alphabet: UPPER + '0123456789' },
  cardanoGrille: {
    keyArbitrary: fc.constantFrom(
      '5:0,3,7,12,19,21,24',
      '2:0',
      '3:0,2,4,6,8',
      '4:0,1,2,3,4,5,6,7',
      '6:0,5,7,12,18,23,30,35'
    ),
    exampleKeys: [
      '5:0,3,7,12,19,21,24',
      '2:0',
      '3:0,2,4,6,8',
      '4:0,1,2,3,4,5,6,7',
      '6:0,5,7,12,18,23,30,35'
    ]
  },
  nullCipher: {
    keyArbitrary: fc.oneof(
      fc.constant('first'),
      fc.constant('last'),
      numericKeyArbitrary({ min: 1, max: 12 })
    ),
    exampleKeys: ['first', 'last', '1', '12', '3'],
    numRuns: 100
  },
  fialka: machineContract('M125'),
  kl7: machineContract('TSEC'),
  geheimschreiber: machineContract('STURGEON'),
  kryha: machineContract('POCKET'),
  m94: {
    keyArbitrary: numericKeyArbitrary({ min: 1, max: 25 }),
    exampleKeys: ['5', '1', '11', '25', '7'],
    numRuns: 100
  },
  chineseTelegraph: {
    keyArbitrary: numericKeyArbitrary({ min: 0, max: 9999 }),
    exampleKeys: ['0', '1', '1111', '9999', '3141']
  },
  zimmermann: {
    keyArbitrary: numericKeyArbitrary({ min: 0, max: 99999 }),
    exampleKeys: ['0', '1', '11111', '99999', '13040'],
    numRuns: 100
  },
  slidex: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  commercialCode: { numRuns: 100 },
  culperRing: { numRuns: 100 },
  arnoldAndre: { numRuns: 100 },
  argenti: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  wallisCiphers: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys,
    numRuns: 100
  },
  joseonYeokhak: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  geezMonastic: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  },
  diana: {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: keywordKeys
  }
};

function stringDigits() {
  return fc.array(fc.constantFrom(...'0123456789'), { minLength: 1, maxLength: 64 })
    .map(digits => digits.join(''));
}

function sufficientKeyContract() {
  const plaintextArbitrary = textArbitrary(UPPER);
  const keyCharacter = fc.constantFrom(...UPPER);
  return {
    caseArbitrary: plaintextArbitrary.chain(plaintext => stringFrom(keyCharacter, {
      minLength: plaintext.length,
      maxLength: plaintext.length + 32
    }).map(key => ({ plaintext, key }))),
    examples: [
      { plaintext: '', key: '' },
      { plaintext: 'A', key: 'Z' },
      { plaintext: 'AZZA', key: 'AAAA' },
      { plaintext: 'A'.repeat(4096), key: 'B'.repeat(4096) },
      { plaintext: UPPER, key: 'THISKEYISLONGERTHANTHEPLAINTEXT' }
    ],
    edgeKeyFor: input => 'A'.repeat(input.normalize('NFD').replace(/\p{M}/gu, '')
      .toUpperCase().replace(/[^A-Z]/g, '').length)
  };
}

function dictionaryContract() {
  const words = [
    'ALFA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL',
    'INDIA', 'JULIETT', 'KILO', 'LIMA', 'MIKE', 'NOVEMBER', 'OSCAR', 'PAPA',
    'QUEBEC', 'ROMEO', 'SIERRA', 'TANGO', 'UNIFORM', 'VICTOR', 'WHISKEY',
    'XRAY', 'YANKEE', 'ZULU'
  ];
  const referenceForOffset = offset => words.slice(offset).concat(words.slice(0, offset)).join(' ');
  return {
    keyArbitrary: fc.integer({ min: 0, max: 25 }).map(referenceForOffset),
    exampleKeys: [0, 1, 7, 13, 25].map(referenceForOffset)
  };
}

function bealeContract() {
  const book = [
    'ALFA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL',
    'INDIA', 'JULIETT', 'KILO', 'LIMA', 'MIKE', 'NOVEMBER', 'OSCAR', 'PAPA',
    'QUEBEC', 'ROMEO', 'SIERRA', 'TANGO', 'UNIFORM', 'VICTOR', 'WHISKEY',
    'XRAY', 'YANKEE', 'ZULU'
  ].join(' ');
  return {
    keyArbitrary: fc.constant(book),
    exampleKeys: [book],
    numRuns: 100
  };
}

function affineKeyArbitrary() {
  const multipliers = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
  return fc.tuple(
    fc.constantFrom(...multipliers),
    fc.integer({ min: -1000, max: 1000 })
  ).map(([a, b]) => `${a},${b}`);
}

function machineContract(defaultKey) {
  return {
    keyArbitrary: keywordArbitrary(),
    exampleKeys: [defaultKey, 'A', 'AAAAAA', 'THISKEYISLONGERTHANTHEPLAINTEXT', 'ZYXWVUTSRQPONMLKJIHGFEDCBA'],
    numRuns: 100
  };
}

function defineContractSpec(name) {
  const contract = contracts[name];
  if (!contract) throw new Error(`Missing engine contract: ${name}`);
  defineKnownAnswerSpec(name, engines[name]);
  defineAlphabetRoundtripSpec({ name, ...contract });
  defineRobustnessSpec({
    name,
    canonicalize: input => canonicalizeInput(name, input),
    edgeKey: contract.exampleKeys?.[0] ?? contract.examples?.[0]?.key,
    edgeKeyFor: contract.edgeKeyFor,
    run: contract.run,
    maxLongRunMs: contract.maxLongRunMs
  });
}

function canonicalizeInput(name, input) {
  const text = String(input);
  if (PRESERVE_TEXT.has(name)) return text;
  if (name === 'voynich') return text.replace(/[A-Za-z]/g, value => value.toUpperCase());
  const normalized = text.normalize('NFD').replace(/\p{M}/gu, '');
  if (name === 'morse') {
    return normalized.toUpperCase().split(/\s+/).map(word => word.replace(/[^A-Z0-9]/g, ''))
      .filter(Boolean).join(' ');
  }
  if (WORD_TEXT.has(name)) {
    return text.toUpperCase().split(/\s+/).map(word => word.replace(/[^A-Z]/g, ''))
      .filter(Boolean).join(' ');
  }
  let result = name === 'adfgvx'
    ? normalized.toUpperCase().replace(/[^A-Z0-9]/g, '')
    : normalized.toUpperCase().replace(/[^A-Z]/g, '');
  if (IJ_TEXT.has(name)) result = result.replace(/J/g, 'I');
  if (name === 'tapCode') result = result.replace(/K/g, 'C');
  if (name === 'babington') result = result.replace(/J/g, 'I').replace(/V/g, 'U').replace(/W/g, '');
  return result;
}

module.exports = { contracts, canonicalizeInput, defineContractSpec };