#!/usr/bin/env node
'use strict';
// Public claims must agree across prose, fact boxes and metadata.
// The mutation checks demonstrate that restoring an old error is rejected.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
function visible(html) {
  const dom = new JSDOM(html), d = dom.window.document;
  d.querySelectorAll('script,style').forEach(e => e.remove());
  const s = [d.body.textContent, ...Array.from(d.querySelectorAll('meta[content]'), e => e.content)].join(' ').replace(/\s+/g, ' ');
  dom.window.close();
  return s;
}
const checks = [
  ['ciphers/zimmermann.html', s => {
    assert.match(s, /successive transmission legs, not an additive layer/);
    assert.match(s, /teaching choice, not a reconstruction/);
    assert.match(s, /24 February 1917/);
    assert.doesNotMatch(s, /Stockholm and Buenos Aires|months-long deception|SKM and HVB|resulting digit string was super-enciphered|pulled the United States into/);
  }, 'The resulting digit string was super-enciphered by an additive key.'],
  ['ciphers/amharic-ge-ez-ciphers.html', s => {
    assert.match(s, /26 Latin letters A–Z/);
    assert.match(s, /educational construction/);
    assert.doesNotMatch(s, /substitution model using Ethiopic script|documented monastic cipher/);
  }, 'A modern substitution model using Ethiopic script.'],
  ['ciphers/gravity-falls.html', s => {
    assert.match(s, /only Caesar \+3/);
    assert.match(s, /Alex Hirsch interviewed by Rafael Motamayor/);
    assert.doesNotMatch(s, /Demonstrably taught|hundreds of thousands|first mass-participatory|children 8–14/);
  }, 'Demonstrably taught substitution cipher concepts to children 8–14.'],
  ['ciphers/navajo-code-talkers.html', s => {
    assert.match(s, /375–420/);
    assert.match(s, /spelling alphabet/);
    assert.match(s, /not proof of mathematical secrecy/);
    assert.doesNotMatch(s, /95%|first 29 Navajo Code Talkers at Guadalcanal|Why It Was Never Broken/);
  }, 'Security rating: 95%'],
  ['ciphers/microdot.html', s => {
    assert.match(s, /August 1941/);
    assert.match(s, /Paris in 1870/);
    assert.doesNotMatch(s, /discovered.*magazine|First discovered1941/);
  }, 'The FBI discovered microdots in Sebold’s magazine.'],
  ['ciphers/field-hollers.html', s => {
    assert.match(s, /1928/);
    assert.match(s, /modern/);
    assert.doesNotMatch(s, /1619–1865|universally understood secret code/);
  }, 'A universally understood secret code.'],
  ['ciphers/wallis-ciphers.html', s => {
    assert.match(s, /1643/);
    assert.doesNotMatch(s, /In late 1642|two hours|Naseby/);
  }, 'In late 1642 Wallis broke the cipher in two hours.'],
  ['ciphers/ira-ciphers.html', s => {
    assert.match(s, /Richard Bean.*2019/);
    assert.match(s, /51 surviving letters/);
    assert.match(s, /BCAFIEHGKDLJ/);
    assert.match(s, /1923 Vigenère example/);
    assert.doesNotMatch(s, /send Cooney|Mostly 1926–1927/);
    assert.doesNotMatch(s, /59-letter|59 letters|Still unsolved|All but one .*now readable/);
  }, 'Still unsolved: one 59-letter message.'],
  ['ciphers/kahn.html', s => {
    assert.match(s, /Hall of Honor,? (?:in )?2020/);
    assert.doesNotMatch(s, /Hall of Honor (?:1999|2009)|remains comprehensive and accurate/);
  }, 'NSA Cryptologic Hall of Honor 2009'],
  ['ciphers/lasry.html', s => {
    assert.match(s, /16 October 2017/);
    assert.doesNotMatch(s, /b\. 1966|Born1966|everyone else gave up/);
  }, 'b. 1966'],
  ['ciphers/voynich.html', s => {
    assert.match(s, /40\.02%/);
    assert.match(s, /invented A–Z substitution/);
    assert.doesNotMatch(s, /rendered in EVA glyph letters|grammar did not exist/);
    assert.match(s, /do not establish exactly two scribes/);
    assert.doesNotMatch(s, /unlike any natural language|modern ciphertext should look like uniform noise|Every published .*has been refuted/);
  }, 'Modern ciphertext indistinguishability: modern ciphertext should look like uniform noise.'],
  ['ciphers/dunin.html', s => {
    assert.match(s, /David Stein’s independent CIA solution in 1998/);
    assert.match(s, /2025 discovery of K4 plaintext/);
    assert.doesNotMatch(s, /most likely to solve Kryptos|premier open cryptanalytic challenge/);
  }, 'The woman most likely to solve Kryptos K4.'],
  ['ciphers/dorabella.html', s => {
    assert.match(s, /neither rules out monoalphabetic substitution nor proves/);
    assert.match(s, /creative composition process/);
    assert.doesNotMatch(s, /rules out a simple Caesar|permanently underdetermined|statistically insufficient/);
  }, 'The sample is statistically insufficient.'],
  ['ciphers/dagapeyeff.html', s => {
    assert.match(s, /Nonuniform frequencies do not prove/);
    assert.match(s, /no justified unicity-distance calculation/);
    assert.doesNotMatch(s, /strongly implying a real cipher|edge where multiple keys can fit|author lost the key/);
  }, 'The counts are strongly implying a real cipher.'],
  ['ciphers/phaistos-disc.html', s => {
    assert.match(s, /Michael Everson’s published Unicode transcription/);
    assert.match(s, /exclude the marked gap and combining oblique strokes/);
    assert.doesNotMatch(s, /too small for true decipherment|audit the standard sign counts/);
  }, 'The corpus is too small for true decipherment.'],
  ['ciphers/shugborough.html', s => {
    assert.match(s, /inscription date uncertain/);
    assert.doesNotMatch(s, /Inscription added by 1763|officially open/);
  }, 'The inscription was officially open.'],
  ['ciphers/mccormick.html', s => {
    assert.match(s, /not an authenticated transcription/);
    assert.match(s, /FBI’s 2011 appeal/);
    assert.doesNotMatch(s, /barely-literate|limited literacy|full access to context/);
  }, 'Investigators had full access to context.'],
  ['ciphers/sator-square.html', s => {
    assert.match(s, /whole square’s 25 letters/);
    assert.doesNotMatch(s, /Every element of the square also rearranges|5\\u00d75/);
  }, 'Every element of the square also rearranges into PATER NOSTER.'],
  ['timeline.html', s => {
    assert.match(s, /Undated Origins and Teaching Models/);
    assert.match(s, /1623 full description/);
    assert.match(s, /selected Rijndael in October 2000/);
    assert.doesNotMatch(s, /earliest surviving instance of a deliberate substitution cipher|Swedish FRA in summer 1940|called le chiffre indéchiffrable for 300 years/);
  }, 'Broken by Arne Beurling and the Swedish FRA in summer 1940.'],
  ['timeline.html', s => {
    assert.match(s, /Grotjan’s September 1940 insight contributed/);
    assert.doesNotMatch(s, /Purple Broken on September 20/);
  }, 'Purple Broken on September 20'],
  ['halls/machines.html', s => {
    assert.match(s, /Grotjan’s 20 September 1940 breakthrough/);
    assert.match(s, /half-rotor mechanism/);
    assert.doesNotMatch(s, /Broken on 20 September 1940 by Frank Rowlett|stepping-switch predecessor/);
  }, 'Broken on 20 September 1940 by Frank Rowlett and the US Army SIS team.'],
  ['ciphers/jn-25.html', s => {
    assert.match(s, /Partial recoveries by Allied teams, including Station HYPO/);
    assert.doesNotMatch(s, /system broken by Station HYPO|Station HYPO breakthrough that exposed AF|decisive Pacific intelligence/);
  }, 'The Imperial Japanese Navy’s superenciphered codebook system broken by Station HYPO.'],
  ['ciphers/red-army-faction.html', s => {
    assert.match(s, /adds letters modulo 26/);
    assert.match(s, /not a decimal field-pad reconstruction/);
    assert.doesNotMatch(s, /KGB-supplied cryptographic material used|Soviet standard field format|book-cipher model/);
  }, 'One-Time Pad (Soviet standard field format)'],
  ['ciphers/stager.html', s => {
    assert.match(s, /transposes individual Latin letters/);
    assert.match(s, /not a transcription of a dated dispatch/);
    assert.doesNotMatch(s, /protected every sensitive|Unbreakable during the Civil War|precursors to modern public-key infrastructure/);
  }, 'The cipher protected every sensitive Union telegraph.'],
  ['ciphers/sigsaly.html', s => {
    assert.match(s, /does not process speech/);
    assert.match(s, /public deterministic sequence/);
    assert.doesNotMatch(s, /Spoken message \(SIGSALY digitized|Try encoding a message as this cipher does/);
  }, 'Try encoding a message as this cipher does.'],
  ['ciphers/des.html', s => {
    assert.match(s, /In 1994, IBM designer Don Coppersmith/);
    assert.doesNotMatch(s, /until 1991, when Biham and Shamir showed the NSA's S-boxes/);
  }, "until 1991, when Biham and Shamir showed the NSA's S-boxes"],
  ['ciphers/culper-ring.html', s => {
    assert.match(s, /not a manuscript facsimile/);
    assert.match(s, /998\/999 markers are not transcribed/);
    assert.doesNotMatch(s, /the same trick Tallmadge would have used|749 of its 763 entries/);
  }, '749 of its 763 entries are legible in the text layer.'],
  ['ciphers/nomenclator.html', s => {
    assert.match(s, /Lavinde’s 1379 collection/);
    assert.doesNotMatch(s, /earliest surviving nomenclator dates to .*1401|Any easy-to-break component .*opens the rest/);
  }, 'The earliest surviving nomenclator dates to the Mantua chancery in 1401.'],
  ['ciphers/joan-clarke.html', s => {
    assert.match(s, /MBE 1946/);
    assert.doesNotMatch(s, /MBE 1947|Developed Banburismus|continuous Naval Enigma breaks/);
  }, 'MBE 1947'],
  ['ciphers/gchq-trio.html', s => {
    assert.match(s, /Companion of the Order of the Bath \(CB\) in 2008/);
    assert.doesNotMatch(s, /CMG 2008|St Michael and St George|No one knew for 27 years/);
  }, 'Clifford Cocks: CMG 2008'],
  ['ciphers/bill-tutte.html', s => {
    assert.match(s, /keystream first recovered by John Tiltman/);
    assert.doesNotMatch(s, /two identical messages alone|near-identical pair of ciphertexts|relay-based systems/);
  }, 'He deduced the machine from two identical messages alone.'],
  ['ciphers/station-hypo.html', s => {
    assert.match(s, /not a decrypted Japanese naval attack plan/);
    assert.doesNotMatch(s, /attack .*came through a diplomatic channel|carriers Japan could not replace/);
  }, 'The Pearl Harbor attack came through a diplomatic channel.'],
  ['ciphers/chinese-telegraph.html', s => {
    assert.match(s, /digit by digit modulo 10, without carries/);
    assert.match(s, /modulo 10,000, with carries/);
    assert.match(s, /invented A–Z table/);
    assert.doesNotMatch(s, /mainland Chinese passports, and Taiwanese name registrations all carry|precisely the technique Rochefort/);
  }, 'Hong Kong identity cards, mainland Chinese passports, and Taiwanese name registrations all carry CCC numbers.'],
  ['ciphers/fractionated-morse.html', s => {
    assert.match(s, /26 of the 27 possible triples/);
    assert.match(s, /removing spaces and punctuation/);
    assert.doesNotMatch(s, /~1880s/);
  }, 'Invented ~1880s.'],
  ['ciphers/one-time-pad.html', s => {
    assert.match(s, /no random-source provenance claimed/);
    assert.match(s, /ciphertext does not change the prior probabilities/i);
    assert.doesNotMatch(s, /from true random source|Violate any condition → security collapses/);
  }, 'This fixed example comes from true random source — dice, radiation, etc.'],
  ['ciphers/vernam.html', s => {
    assert.match(s, /pseudorandom generator instead supports computational security/);
    assert.match(s, /decimal additive pages/);
    assert.doesNotMatch(s, /non-random\s*→ Vigenère-equivalent/);
  }, 'Repeating or non-random → Vigenère-equivalent (breakable)'],
  ['ciphers/cardano-grille.html', s => {
    // Independent combinatorial calculation pins the actual seven-hole example.
    let c = 1; for (let i = 1; i <= 7; i++) c = c * (26 - i) / i;
    assert.equal(c, 480700);
    assert.match(s, /seven holes/);
    assert.match(s, /C\(25,7\) = 480,700/);
    assert.doesNotMatch(s, /every past and future message becomes readable/);
  }, 'Once captured, every past and future message becomes readable.'],
  ['ciphers/vic.html', s => {
    assert.match(s, /not interoperable with historical VIC traffic/);
    assert.match(s, /two ordinary columnar transpositions/);
    assert.doesNotMatch(s, /resisted all NSA attacks|most complex and secure pencil-and-paper cipher/);
  }, 'The cipher resisted all NSA attacks.']
];
for (const [file, check, oldError] of checks) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  check(visible(html));
  const regressed = html.replace('</body>', `<p>${oldError}</p></body>`);
  assert.throws(() => check(visible(regressed)), assert.AssertionError, `${file}: old error escaped the guard`);
}
{
  function timelineStructure(html) {
    const dom = new JSDOM(html), d = dom.window.document;
    try {
      for (const link of d.querySelectorAll('.tl-legend-item')) {
        const era = link.dataset.filter;
        assert.ok(d.getElementById('era-' + era), 'Every era navigation target exists');
        const stated = Number(link.querySelector('.tl-legend-count').textContent.replace(/\D/g, ''));
        assert.equal(stated, d.querySelectorAll(`.tl-event[data-era="${era}"]`).length, era + ' count');
      }
      for (const slug of ['rail-fence', 'running-key', 'columnar', 'straddling-checkerboard', 'fractionated-morse', 'two-square', 'amharic-ge-ez-ciphers']) {
        const card = d.querySelector(`.tl-card[data-href="ciphers/${slug}.html"]`);
        assert.equal(card.closest('.tl-event').dataset.era, 'undated', slug + ' must not invent a dated origin');
      }
    } finally { dom.window.close(); }
  }
  const html = fs.readFileSync(path.join(root, 'timeline.html'), 'utf8');
  timelineStructure(html);
  assert.throws(() => timelineStructure(html.replace(/(class="tl-legend-count">)\(\d+\)/, '$1(999)')), assert.AssertionError);
  assert.throws(() => timelineStructure(html.replace('data-era="undated"', 'data-era="ancient"')), assert.AssertionError);
}
// Check the rendered arithmetic itself: no speech input or randomness is involved.
{
  const html = fs.readFileSync(path.join(root, 'ciphers/sigsaly.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  const input = 'ATTACK AT DAWN CONFIRM';
  dom.window.document.getElementById('input').value = input;
  dom.window.encode();
  const residues = Array.from(input.slice(0, 20), (ch, i) => (ch.charCodeAt(0) % 6 + (i * 37 + 19) % 6) % 6);
  const out = dom.window.document.getElementById('output').textContent;
  assert.ok(out.includes(`[${residues.join(' ')}]`));
  assert.match(out, /not speech encryption or a one-time pad/);
  assert.equal(dom.window.sigDemo(input), dom.window.sigDemo(input));
  dom.window.close();
}
// Independently reproduce Bean's reconstruction, including the documented omissions.
{
  const key = 'BCAFIEHGKDLJ';
  const plain = 'REGELIGNITESCOTLANDSTATESTHEYRAIDEDANDOBTAINEDSOMEOFTHLS';
  const order = [...key].map((ch, i) => [ch, i]).sort((a,b) => a[0].localeCompare(b[0]));
  let full = '';
  for (const [,column] of order) for (let i = column; i < plain.length; i += key.length) full += plain[i];
  assert.equal(full.length, 56);
  assert.equal(full[25], 'L');
  assert.equal(full.slice(-4), 'ETDS');
  const html = fs.readFileSync(path.join(root, 'ciphers/ira-ciphers.html'), 'utf8');
  const dom = new JSDOM(html);
  const displayed = dom.window.document.querySelector('pre').textContent.replace(/\s/g, '');
  assert.equal(displayed.length, 51);
  assert.equal(full.slice(0,25) + full.slice(26,-4), displayed);
  dom.window.close();
}
console.log(`page-audit-claims: ${checks.length} page checks and ${checks.length} deliberately regressed examples passed`);
// Independent transcription counts exercise every Phaistos sign, not just the default.
{
  const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/phaistos-everson.json'), 'utf8'));
  assert.equal(fixture.A.length, 122);
  assert.equal(fixture.B.length, 119);
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'ciphers/phaistos-disc.html'), 'utf8'), { runScripts: 'dangerously' });
  const d = dom.window.document;
  for (let n = 1; n <= 45; n++) {
    d.getElementById('input').value = n;
    dom.window.encode();
    const out = d.getElementById('output').textContent;
    for (const side of ['A', 'B']) assert.ok(out.includes(`Side ${side}: ${fixture[side].filter(x => x === n).length} occurrence`));
  }
  for (const bad of ['1.5', '0', '46', '']) {
    d.getElementById('input').value = bad;
    dom.window.encode();
    assert.match(d.getElementById('output').textContent, /Enter a sign number/);
  }
  dom.window.close();
}
{
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'ciphers/dagapeyeff.html'), 'utf8'), { runScripts: 'dangerously' });
  const d = dom.window.document;
  d.getElementById('input').value = '00 00';
  dom.window.encode();
  const out = d.getElementById('output').textContent;
  assert.match(out, /Overlapping pairs analysed: 3/);
  assert.match(out, /00\s+× 3/);
  assert.match(out, /expected count 0\.03/);
  dom.window.close();
}
