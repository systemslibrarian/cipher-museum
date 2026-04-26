/* Smoke test for the Detective Auto-Solvers. Run with: node tests/solvers-smoke.js */
'use strict';

global.window = global;
require('../js/detective/lang-model.js');
require('../js/detective/analyses.js');
require('../js/detective/scoring.js');
require('../js/detective/attacks.js');
require('../js/detective/solvers.js');

var S = window.DetectiveSolvers;
var A = window.DetectiveAnalyses;

var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var passed = 0, failed = 0;

function check(label, ct, expectMethods, expectFragment) {
  var stats = A.run(ct);
  var t0 = Date.now();
  var res = S.solveAuto(ct, { stats: stats });
  var dt = Date.now() - t0;
  var best = res.best;
  if (!best) {
    console.log('FAIL ' + label + ' — NO RESULT');
    failed++;
    return;
  }
  var topPlain = (best.plaintext || '').toUpperCase().replace(/[^A-Z]/g,'');
  if (typeof expectMethods === 'string') expectMethods = [expectMethods];
  var methodOk = expectMethods.some(function (m) { return best.method.indexOf(m) >= 0; });
  var ok = methodOk && (topPlain.indexOf(expectFragment) >= 0);
  if (ok) passed++; else failed++;
  console.log(
    (ok ? 'PASS ' : 'FAIL ') + label.padEnd(34) +
    ' [' + best.method.padEnd(22) + ']' +
    ' per=' + best.perChar.toFixed(2).padStart(7) +
    '  ' + (dt + 'ms').padStart(7) +
    '  → ' + (best.plaintext || '').substr(0, 64).replace(/\s+/g,' ')
  );
}

/* helpers to build test ciphertexts */
function caesarEnc(pt, n){var out='';for(var i=0;i<pt.length;i++){var c=pt.charCodeAt(i);if(c>=65&&c<=90)out+=String.fromCharCode((c-65+n)%26+65);else out+=pt[i];}return out;}
function vigEnc(pt, key){var k=key.toUpperCase();var out='';var ki=0;for(var i=0;i<pt.length;i++){var c=pt[i];if(c>='A'&&c<='Z'){out+=String.fromCharCode(((c.charCodeAt(0)-65)+(k.charCodeAt(ki%k.length)-65))%26+65);ki++;}else{out+=c;}}return out;}
function subEnc(pt, key){var out='';for(var i=0;i<pt.length;i++){var c=pt[i];if(c>='A'&&c<='Z'){out+=key[c.charCodeAt(0)-65];}else{out+=pt[i];}}return out;}
function colEnc(pt, order){
  /* Standard columnar: write rows of width k, read columns in `order`. */
  var k = order.length;
  var letters = pt.toUpperCase().replace(/[^A-Z]/g,'');
  var rows = Math.ceil(letters.length / k);
  var grid = [];
  for (var r = 0; r < rows; r++) grid.push(letters.substr(r*k, k));
  var out = '';
  for (var oi = 0; oi < k; oi++) {
    var col = order[oi];
    for (var rr = 0; rr < rows; rr++) {
      if (col < grid[rr].length) out += grid[rr][col];
    }
  }
  return out;
}

console.log('=== Cipher Museum — Auto-Solver Smoke Tests ===');
console.log('');

/* Caesar */
check('Caesar shift-3 pangram',
      caesarEnc('THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG', 3),
      'Caesar', 'QUICKBROWNFOX');

check('Caesar shift-7 long',
      caesarEnc('IN THE BEGINNING GOD CREATED THE HEAVENS AND THE EARTH', 7),
      'Caesar', 'INTHEBEGINNING');

/* ROT13 (also valid as Caesar shift 13) */
check('ROT13 phrase',
      caesarEnc('THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG', 13),
      ['ROT13', 'Caesar'], 'QUICKBROWNFOX');

/* Atbash */
check('Atbash phrase',
      'GSV JFRXP YILDM ULC',
      'Atbash', 'THEQUICK');

/* Vigenère short with LEMON — 12 letters is below recoverability
   threshold, so we accept ANY method as long as it doesn't crash. */
check('Vigenere key LEMON short',
      'LXFOPVEFRNHR',
      ['Caesar','Vigen','Substit','ROT13','Atbash','Columnar'],
      '');

/* Vigenère long with SECRET */
var pt1 = 'INTHEBEGINNINGGODCREATEDTHEHEAVENSANDTHEEARTHTHEEARTHWASFORMLESSANDEMPTYDARKNESSWASOVERTHESURFACEOFTHEDEEPANDTHESPIRITOFGODWASHOVERINGOVERTHEWATERS';
check('Vigenere key SECRET long',
      vigEnc(pt1, 'SECRET'),
      'Vigen', 'INTHEBEGINNING');

/* Vigenère medium with KING */
var pt1b = 'TOBEORNOTTOBETHATISTHEQUESTIONWHETHERTISNOBLERINTHEMINDTOSUFFERTHESLINGSANDARROWSOFOUTRAGEOUSFORTUNE';
check('Vigenere key KING shakespeare',
      vigEnc(pt1b, 'KING'),
      'Vigen', 'TOBEORNOT');

/* Substitution: long biblical passage. We preserve word
   boundaries (the cipher only substitutes letters), since real
   monoalphabetic ciphertext usually retains spacing and the
   solver's word-bonus heuristic depends on it. */
var subKey = 'QWERTYUIOPASDFGHJKLZXCVBNM'; /* plaintext A → cipher Q, B → W, ... */
var pt2 = 'SO WHETHER YOU EAT OR DRINK OR WHATEVER YOU DO DO IT ALL FOR THE GLORY OF GOD GIVE NO OFFENSE EITHER TO THE JEWS OR TO THE GREEKS OR TO THE CHURCH OF GOD EVEN AS I PLEASE ALL MEN IN ALL THINGS NOT SEEKING MINE OWN PROFIT BUT THE PROFIT OF MANY THAT THEY MAY BE SAVED';
check('Substitution biblical',
      subEnc(pt2, subKey),
      'Substitut', 'SOWHETHERYOUEAT');

/* Columnar: 5 columns, key order [2,4,0,3,1] (1-based: 3 5 1 4 2) */
var pt3 = 'WEAREDISCOVEREDFLEEATONCEXX';
check('Columnar 5 cols',
      colEnc(pt3, [2,4,0,3,1]),
      'Columnar', 'WEAREDISCOVERED');

/* Columnar: 6 cols, longer text */
var pt4 = 'THEENEMYATTACKSATDAWNMOVEALLUNITSTOTHESOUTHERNFRONTIMMEDIATELYANDPREPAREDEFENSIVEPOSITIONSXX';
check('Columnar 6 cols military',
      colEnc(pt4, [3,1,4,0,5,2]),
      'Columnar', 'THEENEMYATTACK');

console.log('');
console.log('=== ' + passed + ' passed, ' + failed + ' failed ===');
process.exit(failed === 0 ? 0 : 1);
