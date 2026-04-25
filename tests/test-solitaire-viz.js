const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const HTML_PATH = path.join(__dirname, '..', 'workspaces', 'cipher-museum', 'ciphers', 'solitaire.html');
const html = fs.readFileSync('/workspaces/cipher-museum/ciphers/solitaire.html', 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'file:///workspaces/cipher-museum/ciphers/solitaire.html' });
const { window } = dom;
const { document } = window;

// Suppress noise from external scripts that may not load (file:// + relative)
window.addEventListener('error', e => { /* ignore subresource errors */ });

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log('  PASS:', msg); } else { fail++; console.log('  FAIL:', msg); } };

console.log('--- Static structure checks ---');
const ids = ['sv-key','sv-msg','sv-init','sv-step','sv-letter','sv-encipher','sv-reset','sv-deck','sv-status','sv-stream','sv-streamWrap','sv-cipher','sv-cipherWrap'];
ids.forEach(id => ok(!!document.getElementById(id), 'element #' + id + ' exists'));

console.log('--- Initial state ---');
const $deck = document.getElementById('sv-deck');
const $step = document.getElementById('sv-step');
const $letter = document.getElementById('sv-letter');
const $encipher = document.getElementById('sv-encipher');
ok($step.disabled, 'Next Phase disabled before init');
ok($letter.disabled, 'Next Letter disabled before init');
ok($encipher.disabled, 'Encipher disabled before init');

console.log('--- After Init click ---');
document.getElementById('sv-init').click();
ok(!$step.disabled, 'Next Phase enabled after init');
const cards = $deck.querySelectorAll('.sv-card');
ok(cards.length === 54, 'Exactly 54 cards rendered (got ' + cards.length + ')');
const jokerA = $deck.querySelectorAll('.sv-jokerA').length;
const jokerB = $deck.querySelectorAll('.sv-jokerB').length;
ok(jokerA === 1, 'Exactly 1 A-joker rendered');
ok(jokerB === 1, 'Exactly 1 B-joker rendered');

console.log('--- Step through one full keystream letter (5 phases) ---');
const status = () => document.getElementById('sv-status').textContent;
document.getElementById('sv-step').click(); // phase 1
ok(/Phase 1/.test(status()), 'Phase 1 narration present');
document.getElementById('sv-step').click(); // phase 2
ok(/Phase 2/.test(status()), 'Phase 2 narration present');
document.getElementById('sv-step').click(); // phase 3
ok(/Phase 3/.test(status()), 'Phase 3 narration present');
document.getElementById('sv-step').click(); // phase 4
ok(/Phase 4/.test(status()), 'Phase 4 narration present');
document.getElementById('sv-step').click(); // phase 5 (output)
const stream1 = document.getElementById('sv-stream').textContent.replace(/\s+/g,'');
ok(stream1.length === 1, 'One keystream letter produced after 5 phases (got "' + stream1 + '")');
ok(/^[A-Z]$/.test(stream1), 'Keystream letter is A-Z');

console.log('--- Encipher whole message ---');
// Reset and run full encipher of "DO NOT USE PC" with key "CRYPTONOMICON"
document.getElementById('sv-reset').click();
document.getElementById('sv-key').value = 'CRYPTONOMICON';
document.getElementById('sv-msg').value = 'DO NOT USE PC';
document.getElementById('sv-init').click();
document.getElementById('sv-encipher').click();
const finalCipher = document.getElementById('sv-cipher').textContent.replace(/\s+/g,'');
// finalCipher contains plaintext concatenated with ciphertext; extract last len chars
const plain = 'DONOTUSEPC';
ok(finalCipher.endsWith('VITGKMPWLS'), 'Whole-message ciphertext = VITGKMPWLS (got "' + finalCipher.slice(-10) + '")');
const stream = document.getElementById('sv-stream').textContent.replace(/\s+/g,'');
ok(stream.length >= plain.length, 'Keystream length >= plaintext length (' + stream.length + ' >= ' + plain.length + ')');

console.log('--- Schneier official test vector: key=FOO, plain=AAAAAAAAAAAAAAA -> ITHZUJIWGRFARMW ---');
document.getElementById('sv-reset').click();
document.getElementById('sv-key').value = 'FOO';
document.getElementById('sv-msg').value = 'AAAAAAAAAAAAAAA';
document.getElementById('sv-init').click();
document.getElementById('sv-encipher').click();
const fooCipher = document.getElementById('sv-cipher').textContent.replace(/\s+/g,'');
ok(fooCipher.endsWith('ITHZUJIWGRFARMW'), 'FOO test vector matches Schneier (got "' + fooCipher.slice(-15) + '")');

console.log('--- Decrypt mode: round-trip CRYPTONOMICON / VITGKMPWLS -> DONOTUSEPC ---');
document.getElementById('sv-reset').click();
document.getElementById('sv-modeDec').click();
ok(document.getElementById('sv-modeDec').classList.contains('active'), 'Decrypt mode button active');
ok(document.getElementById('sv-msgLabel').textContent === 'Ciphertext', 'Message label switched to Ciphertext');
document.getElementById('sv-key').value = 'CRYPTONOMICON';
document.getElementById('sv-msg').value = 'VITGKMPWLS';
document.getElementById('sv-init').click();
document.getElementById('sv-encipher').click();
const decoded = document.getElementById('sv-cipher').textContent.replace(/\s+/g,'');
ok(decoded.endsWith('DONOTUSEPC'), 'Decrypt round-trip recovers DONOTUSEPC (got "' + decoded.slice(-10) + '")');

console.log('--- Decrypt the FOO/Schneier vector ---');
document.getElementById('sv-reset').click();
document.getElementById('sv-modeDec').click();
document.getElementById('sv-key').value = 'FOO';
document.getElementById('sv-msg').value = 'ITHZUJIWGRFARMW';
document.getElementById('sv-init').click();
document.getElementById('sv-encipher').click();
const decodedFoo = document.getElementById('sv-cipher').textContent.replace(/\s+/g,'');
ok(decodedFoo.endsWith('AAAAAAAAAAAAAAA'), 'FOO ciphertext decrypts to all-A plaintext');

console.log('--- Mode toggle back to Encrypt ---');
document.getElementById('sv-modeEnc').click();
ok(document.getElementById('sv-modeEnc').classList.contains('active'), 'Encrypt mode button active');
ok(document.getElementById('sv-msgLabel').textContent === 'Plaintext', 'Message label switched back to Plaintext');

console.log('--- Operator tips panel present ---');
ok(/Operator's Field Manual/.test(document.body.textContent), 'Operator tips panel rendered');
ok(/X-pad to multiples of 5/.test(document.body.textContent), 'X-padding tip present');
ok(/5-letter blocks/.test(document.body.textContent), '5-letter group tip present');
ok(/Never reuse a deck/.test(document.body.textContent), 'Key-reuse warning present');

console.log('--- Reset state ---');
document.getElementById('sv-reset').click();
ok(document.getElementById('sv-deck').children.length === 0, 'Deck cleared after reset');
ok(document.getElementById('sv-step').disabled, 'Next Phase disabled after reset');

console.log('\n========== RESULT ==========');
console.log('Passed: ' + pass + '   Failed: ' + fail);
process.exit(fail === 0 ? 0 : 1);
