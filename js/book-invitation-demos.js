/* Small, invented teaching models for the book's exhibit invitations. */
(function (root) {
  'use strict';
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const prime = n => Number.isInteger(n) && n >= 2 && n <= 97 && !Array.from({length: Math.max(0, Math.floor(Math.sqrt(n)) - 1)}, (_, i) => i + 2).some(d => n % d === 0);
  function pow(base, exponent, modulus) {
    let result = 1;
    while (exponent > 0) {
      if (exponent % 2) result = result * base % modulus;
      base = base * base % modulus;
      exponent = Math.floor(exponent / 2);
    }
    return result;
  }
  function rsa(p, q, e, message) {
    if (!prime(p) || !prime(q) || p === q) throw new Error('Choose two different primes from 2 to 97.');
    const n = p * q, phi = (p - 1) * (q - 1);
    if (!Number.isInteger(e) || e <= 1 || e >= phi || gcd(e, phi) !== 1) throw new Error('Choose a whole-number e greater than 1 and less than φ(n), with gcd(e, φ(n)) = 1.');
    if (!Number.isInteger(message) || message < 0 || message >= n) throw new Error('The message must be a whole number from 0 to ' + (n - 1) + '.');
    let d = 1;
    while (e * d % phi !== 1) d++;
    const ciphertext = pow(message, e, n);
    return { n, phi, e, d, ciphertext, recovered: pow(ciphertext, d, n) };
  }
  function dh(a, b) {
    if (![a, b].every(n => Number.isInteger(n) && n >= 1 && n <= 21)) throw new Error('Choose whole-number private exponents from 1 to 21.');
    const A = pow(5, a, 23), B = pow(5, b, 23);
    return {A, B, alice: pow(B, a, 23), bob: pow(A, b, 23)};
  }
  const vocabulary = { RIVER: 'ORCHARD', BRIDGE: 'LANTERN' };
  function route(keyword) {
    const key = keyword.trim().toUpperCase();
    if (!/^[A-Z]{4,8}$/.test(key)) throw new Error('Use a route keyword of 4–8 letters, A–Z.');
    return [...key].map((letter, col) => ({letter, col})).sort((a, b) => a.letter.localeCompare(b.letter) || a.col - b.col).map((entry, i) => ({col: entry.col, up: i % 2 === 1}));
  }
  function stagerEncode(message, keyword, codes, nulls) {
    const words = message.toUpperCase().match(/[A-Z]+/g) || [];
    if (!words.length || words.length > 120) throw new Error('Enter 1–120 words using letters A–Z. Punctuation and numbers are omitted.');
    if (words.some(w => ['ORCHARD', 'LANTERN', 'SKY', 'PAD'].includes(w))) throw new Error('ORCHARD, LANTERN, SKY and PAD are reserved by this invented key. Choose other message words.');
    const order = route(keyword), columns = order.length, rows = Math.ceil(words.length / columns);
    const encoded = words.map(w => codes ? (vocabulary[w] || w) : w);
    while (encoded.length < rows * columns) encoded.push('PAD');
    const transmitted = [];
    for (const {col, up} of order) {
      for (let r = 0; r < rows; r++) transmitted.push(encoded[(up ? rows - r - 1 : r) * columns + col]);
      if (nulls) transmitted.push('SKY');
    }
    return {ciphertext: transmitted.join(' '), keyword: keyword.trim().toUpperCase(), codes, nulls, rows};
  }
  function stagerDecode(packet) {
    const order = route(packet.keyword), columns = order.length;
    const words = packet.ciphertext.split(' ').filter(w => !packet.nulls || w !== 'SKY');
    if (words.length !== packet.rows * columns) throw new Error('The transmitted grid has an unexpected word count.');
    const grid = Array(words.length); let at = 0;
    for (const {col, up} of order) for (let r = 0; r < packet.rows; r++) grid[(up ? packet.rows - r - 1 : r) * columns + col] = words[at++];
    const routed = grid.filter(w => w !== 'PAD');
    return {routed: routed.join(' '), plaintext: routed.map(w => packet.codes ? ({ORCHARD: 'RIVER', LANTERN: 'BRIDGE'}[w] || w) : w).join(' ')};
  }
  function mount(document) {
    const byId = id => document.getElementById(id);
    const dhForm = byId('dh-toy');
    if (dhForm) {
      dhForm.querySelector('button').disabled = false;
      dhForm.addEventListener('input', () => { byId('dh-result').textContent = 'Inputs changed. Exchange the public values again.'; });
      dhForm.addEventListener('submit', event => {
        event.preventDefault();
        try {
          const a = Number(byId('dh-a').value), b = Number(byId('dh-b').value), r = dh(a, b);
          byId('dh-result').textContent = `Public parameters: p = 23, g = 5\nAlice publishes A = 5^${a} mod 23 = ${r.A}\nBob publishes B = 5^${b} mod 23 = ${r.B}\nAlice computes B^a mod 23 = ${r.alice}\nBob computes A^b mod 23 = ${r.bob}\nThe shared values agree. The arithmetic does not authenticate either person.`;
        } catch (error) { byId('dh-result').textContent = error.message; }
      });
    }
    const rsaForm = byId('rsa-toy');
    if (rsaForm) {
      rsaForm.querySelector('button[type="submit"]').disabled = false;
      const result = byId('rsa-result'), status = byId('rsa-status');
      rsaForm.addEventListener('input', () => { result.hidden = true; result.textContent = ''; status.textContent = 'Inputs changed. Run the round trip again.'; });
      rsaForm.addEventListener('submit', event => {
        event.preventDefault(); result.hidden = true; result.textContent = '';
        try {
          const values = ['p', 'q', 'e', 'message'].map(id => byId('rsa-' + id).value.trim());
          if (values.some(value => !/^\d+$/.test(value))) throw new Error('Enter whole numbers in all four fields.');
          const [p, q, e, message] = values.map(Number), r = rsa(p, q, e, message);
          result.textContent = `n = ${r.n}; φ(n) = ${r.phi}; d = ${r.d}\nPublic key (n, e) = (${r.n}, ${e})\nPrivate key (n, d) = (${r.n}, ${r.d})\nEncrypt: ${message}^${e} mod ${r.n} = ${r.ciphertext}\nDecrypt: ${r.ciphertext}^${r.d} mod ${r.n} = ${r.recovered}`;
          result.hidden = false; status.textContent = 'Round trip succeeded. This verifies the arithmetic, not the identity of the key holder.';
        } catch (error) { status.textContent = error.message; }
      });
    }
    const stagerForm = byId('stager-words');
    if (stagerForm) {
      stagerForm.querySelector('button[type="submit"]').disabled = false;
      let packet;
      stagerForm.addEventListener('submit', event => {
        event.preventDefault(); byId('stager-answer').hidden = true; byId('stager-answer').textContent = '';
        try {
          packet = stagerEncode(byId('stager-message').value, byId('stager-keyword').value, byId('stager-codewords').checked, byId('stager-nulls').checked);
          byId('stager-transmitted').textContent = packet.ciphertext;
          byId('stager-route').textContent = 'Read columns: ' + route(packet.keyword).map(({col, up}) => (col + 1) + (up ? ' up' : ' down')).join(', ') + `. Grid: ${packet.rows} rows × ${packet.keyword.length} columns.`;
          byId('stager-stage').hidden = false; stagerForm.hidden = true; byId('stager-status').textContent = '';
          byId('stager-transmitted').focus();
        } catch (error) { byId('stager-status').textContent = error.message; }
      });
      byId('stager-restore').addEventListener('click', () => {
        if (!packet) return;
        const r = stagerDecode(packet);
        byId('stager-answer').textContent = 'Route restored, nulls and padding removed: ' + r.routed + '\nVocabulary restored: ' + r.plaintext;
        byId('stager-answer').hidden = false;
      });
      byId('stager-edit').addEventListener('click', () => { packet = null; stagerForm.hidden = false; byId('stager-stage').hidden = true; byId('stager-answer').textContent = ''; byId('stager-message').focus(); });
    }
    const modifier = byId('mary-repeat');
    if (modifier) {
      modifier.disabled = false;
      const update = () => { byId('mary-reading').textContent = modifier.checked ? 'T E E · [Castelnau] — ↻ repeats E; X contributes nothing.' : 'T E · [Castelnau] — ↻ is omitted for comparison; X contributes nothing.'; };
      modifier.addEventListener('change', update); update();
    }
  }
  const api = {rsa, dh, route, stagerEncode, stagerDecode, mount};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.document) root.document.addEventListener('DOMContentLoaded', () => mount(root.document));
})(typeof window === 'undefined' ? globalThis : window);
