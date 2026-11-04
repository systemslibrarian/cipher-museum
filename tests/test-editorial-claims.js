'use strict';
const assert = require('node:assert/strict');
const fs = require('fs');
const plain = p => fs.readFileSync(p,'utf8').replace(/<[^>]*>/g,'').replace(/&mdash;/g,'—');
const modern = plain('modern.html'), hall = plain('halls/modern-crypto.html');
assert.match(hall,/DES and AES are symmetric block ciphers/);
assert.match(hall,/RSA supports distinct public-key encryption and signature schemes/);
assert.match(hall,/OAEP and PSS/);
assert.match(hall,/Diffie–Hellman is key agreement, and SHA-256 is a hash function/);
assert.match(modern,/people, historical and cultural context, mathematical foundations/);
assert.match(modern,/Original ChaCha uses a 64-bit nonce and 64-bit block counter/);
assert.match(modern,/IETF ChaCha20.*96-bit nonce, and 32-bit block counter/);
assert.match(modern,/never reuse a nonce under the same key, and never let the block counter wrap/);
assert.match(plain('learn.html'),/key can protect multiple messages, but nonces must not repeat under that key/);
for (const p of ['timeline.html','ciphers/great-cipher.html']) {
 assert.match(plain(p),/identification remains disputed/);
 assert.doesNotMatch(plain(p),/finally identifies|finally an answer to one of history's great mysteries/);
}
for (const p of ['modern.html','halls/modern-crypto.html','halls/unbreakable.html','learn.html','halls/polyalphabetic.html']) {
 assert.doesNotMatch(plain(p),/Every classical cipher failed|Every cipher.*(?:has been broken|eventually fell)|broke every classical cipher|key that never repeats|keys that never repeat|public-key cryptography.*not ciphers/i,p);
}
assert.match(plain('halls/unbreakable.html'),/secret, uniformly random, independent message-length key used once/);
assert.doesNotMatch(plain('timeline.html'), /every monoalphabetic cipher falls to a frequency table|Every simple substitution cipher is now breakable/);
assert.match(plain('halls/substitution.html'), /With enough suitable ciphertext/);
assert.doesNotMatch(plain('halls/substitution.html'), /Every monoalphabetic cipher is broken/);
console.log('Focused editorial claim regressions passed.');

function checkGrotjan(html) {
 assert.doesNotMatch(html, /one of the great breaks of the war|consonant cipher alphabet|revealed how Purple.s stepping switches were wired/i);
 assert.match(html, /https:\/\/www\.dvidshub\.net\/news\/printable\/454045/);
 assert.match(html, /frank_rowlett\.pdf#page=2/);
 assert.match(html, /further reconstruction/);
}
for (const p of ['halls/codebreakers.html', 'ciphers/purple.html']) {
 const html = fs.readFileSync(p, 'utf8');
 checkGrotjan(html);
 assert.throws(() => checkGrotjan(html + 'one of the great breaks of the war'));
 assert.throws(() => checkGrotjan(html.replace('further reconstruction', 'complete wiring revealed')));
}
console.log('Grotjan source attribution and bounded reconstruction claims passed, including four mutation checks.');

// Narrow-view table panels must support keyboard scrolling.
const purpleHtml = fs.readFileSync('ciphers/purple.html', 'utf8');
for (const label of ['Purple concepts and modern comparisons', 'Purple quick facts']) {
 assert.ok(purpleHtml.includes('role="region" aria-label="' + label + '" tabindex="0"'));
}
