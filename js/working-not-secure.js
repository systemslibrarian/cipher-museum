(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.WorkingNotSecure = api; api.mount(document); }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // An original message and a fixed substitution key, both invented for this page.
  const PLAINTEXT = 'THE SIGNAL STATION WILL CLOSE AT NIGHTFALL AND THE RELIEF CREW WILL ARRIVE BY THE EASTERN ROAD BEFORE DAWN. THEY SHOULD BRING THE NEW CODE TABLES, THE SPARE BATTERIES AND THE WEATHER REPORTS FOR THE NEXT THREE DAYS. NOBODY SHOULD SEND A MESSAGE ABOUT THE CHANGE UNTIL THE NEW TABLES ARE IN PLACE AND THE OLD ONES HAVE BEEN BURNED.';
  const KEY = 'QMZLDWNRAGPKOEVBYSTJIHCUFX';
  // English letters from most to least frequent, the attacker's only outside knowledge.
  const ENGLISH_ORDER = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';
  const CHANCE = 1 / 26;
  // The claim "the ciphertext alone gives nothing away" is refuted when a ciphertext-only attack
  // recovers this share of letters: five times what guessing would.
  const REFUTE_AT = 5 * CHANCE;

  const map = (text, from, to) => text.replace(/[A-Z]/g, c => to[from.indexOf(c)]);
  const encrypt = (text, key) => map(text, ALPHABET, key);
  const decrypt = (text, key) => map(text, key, ALPHABET);
  // log10(26!): the size of the key space, which bounds only exhaustive key search.
  function keyspaceLog10() { let s = 0; for (let i = 2; i <= 26; i++) s += Math.log10(i); return s; }

  // Ciphertext-only attack: pair cipher letters by frequency rank with English letters.
  function frequencyAttack(ciphertext) {
    const counts = {};
    for (const c of ciphertext) if (ALPHABET.includes(c)) counts[c] = (counts[c] || 0) + 1;
    const ranked = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
    const guess = {};
    ranked.forEach((c, i) => { guess[c] = ENGLISH_ORDER[i]; });
    return ciphertext.replace(/[A-Z]/g, c => guess[c]);
  }
  function recovered(plain, guess) {
    let hit = 0, total = 0;
    for (let i = 0; i < plain.length; i++) if (ALPHABET.includes(plain[i])) { total++; if (guess[i] === plain[i]) hit++; }
    return total ? hit / total : 0;
  }

  function assess(opts) {
    const o = opts || {}, plain = o.plaintext || PLAINTEXT, key = o.key || KEY;
    const cipher = encrypt(plain, key);
    const functional = decrypt(cipher, o.decryptKey || key) === plain ? 'passes' : 'fails';
    const guess = frequencyAttack(cipher), share = recovered(plain, guess);
    return { cipher, functional, guess, recovered: share, chance: CHANCE, security: share > REFUTE_AT ? 'claim refuted' : 'not refuted by this test' };
  }

  function mount(doc) {
    const $ = id => doc.getElementById(id);
    if (!$('wn-functional')) return;
    const a = assess();
    $('wn-cipher').textContent = a.cipher;
    $('wn-functional').addEventListener('click', () => {
      const r = assess();
      $('wn-functional-result').textContent = (r.functional === 'passes' ? 'Passes' : 'Fails') + ': decrypting the ciphertext with the key gives back the message exactly. That shows the cipher is correct, not that it is secure.';
    });
    $('wn-security').addEventListener('click', () => {
      const r = assess();
      $('wn-guess').textContent = r.guess;
      $('wn-security-result').textContent = 'The claim is ' + (r.security === 'claim refuted' ? 'refuted' : 'not refuted by this test') + ': ranking cipher letters by frequency, with no key search at all, recovers ' + Math.round(r.recovered * 100) + '% of the letters. Guessing would recover about ' + Math.round(r.chance * 100) + '%.';
    });
  }
  return { ALPHABET, PLAINTEXT, KEY, ENGLISH_ORDER, REFUTE_AT, encrypt, decrypt, keyspaceLog10, frequencyAttack, recovered, assess, mount };
});
