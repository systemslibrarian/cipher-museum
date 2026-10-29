#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const ciphersDir = path.join(repo, 'ciphers');
const outDir = path.join(repo, 'data');
const outJson = path.join(outDir, 'artifact-cards.json');
const outJs = path.join(repo, 'js', 'artifact-cards-data.js');
const { loadTrust } = require('./exhibit-trust');
const { byPath, trustFor } = loadTrust(repo);

function titleizeSlug(slug) {
  return slug
    .split('-')
    .map((w) => w ? w[0].toUpperCase() + w.slice(1) : w)
    .join(' ')
    .replace(/Otp\b/g, 'OTP')
    .replace(/Rsa\b/g, 'RSA')
    .replace(/Aes\b/g, 'AES')
    .replace(/Sha256\b/g, 'SHA-256')
    .replace(/Jn 25\b/g, 'JN-25')
    .replace(/Kl 7\b/g, 'KL-7')
    .replace(/M 94\b/g, 'M-94');
}

function between(text, re, fallback = '') {
  const m = text.match(re);
  return m ? m[1].trim().replace(/\s+/g, ' ') : fallback;
}

function stripTags(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&rsquo;/g, "'")
    .replace(/&mdash;/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function familyFromHall(hallLabel) {
  const s = hallLabel.toLowerCase();
  if (s.includes('substitution')) return 'Substitution';
  if (s.includes('polyalphabetic')) return 'Polyalphabetic';
  if (s.includes('transposition')) return 'Transposition';
  if (s.includes('military')) return 'Military and Field Ciphers';
  if (s.includes('civil war')) return 'American and Civil War Ciphers';
  if (s.includes('machine')) return 'Mechanical and Rotor Machines';
  if (s.includes('puzzle')) return 'Puzzle and Cultural Ciphers';
  if (s.includes('unbreakable')) return 'One-Time Pad and Theoretical Security';
  if (s.includes('codebreakers')) return 'Codebreakers and Cryptanalysis';
  if (s.includes('modern')) return 'Modern Cryptography';
  if (s.includes('unsolved')) return 'Unsolved Ciphers';
  if (s.includes('culture')) return 'Ciphers in Culture';
  if (s.includes('origins')) return 'Ancient and Foundational Ciphers';
  return 'Historical Cryptography';
}

function keyTypeFromHtml(html) {
  const facts = html.match(/<div class="fact">[\s\S]*?<span class="fact-label">Key Type<\/span>[\s\S]*?<span class="fact-value">([\s\S]*?)<\/span>[\s\S]*?<\/div>/i);
  if (facts) return stripTags(facts[1]);
  return 'Varies by system';
}

function eraFromHtml(html) {
  const eraBadge = between(html, /<span class="badge\s+era-[^"]*">([\s\S]*?)<\/span>/i);
  if (eraBadge) return stripTags(eraBadge);
  const invented = html.match(/<span class="fact-label">Invented<\/span>[\s\S]*?<span class="fact-value">([\s\S]*?)<\/span>/i);
  if (invented) return stripTags(invented[1]);
  return 'Historical period varies';
}


function hallFromHtml(html) {
  const hall = html.match(/<a href="\.\.\/halls\/[^"]+\.html">([^<]*Hall[^<]*)<\/a>/i);
  return hall ? stripTags(hall[1]) : 'Museum exhibit';
}

function lessonFromHtml(html) {
  const m = html.match(/<span class="fact-label">Modern Lesson<\/span>[\s\S]*?<span class="fact-value">([\s\S]*?)<\/span>/i);
  if (m) return stripTags(m[1]);
  return 'Security depends on design quality, key management, and implementation.';
}

function main(check = false) {
  const outputs = new Map();
  const files = fs.readdirSync(ciphersDir).filter((f) => f.endsWith('.html')).sort();
  const cards = {};

  // Per-slug corrections. The generated keyIdea assumes every exhibit turns
  // plaintext into ciphertext, which is false for the protocol exhibits: a
  // key agreement, a hash, a signature, a sharing scheme and a proof system
  // all protect something without encrypting anything.
  const OVERRIDES = {
    enigma: { family: 'Rotor machine' },
    lorenz: { family: 'Teleprinter stream cipher' },
    solitaire: { family: 'Card-deck stream cipher' },
    vernam: { family: 'Additive teleprinter cipher' },
    'amharic-ge-ez-ciphers': {
      family: 'Modern substitution teaching model', region: 'Ethiopian and Eritrean manuscript context',
      usedBy: 'Museum learners; no historical cipher deployment established',
      keyType: 'Keyword-seeded permutation of Latin A–Z'
    },
    'navajo-code-talkers': {
      family: 'Military vocabulary and spelling code', region: 'Pacific theatre, World War II',
      usedBy: 'Navajo Marines trained as Code Talkers'
    },
    'microdot': {
      family: 'Photographic steganography',
      keyType: 'Physical concealment; any content encryption is separate'
    },
    'field-hollers': {
      family: 'Oral traditions and contextual communication', region: 'United States',
      keyType: 'No authenticated fixed cipher reconstructed',
      usedBy: 'Historical African American communities; widget is modern'
    },
    'gravity-falls': {
      family: 'Fictional puzzles using classical ciphers',
      usedBy: 'Series creators and puzzle-solving viewers',
      keyType: 'Varies by puzzle; this widget uses Caesar +3',
      modernLesson: 'Record the text, clues and method; a plausible reading must fit the puzzle.'
    },
    'ua-8295': {
      family: 'Firmware forensics', region: 'Finland / Netherlands',
      usedBy: 'Nokia DA-8520 / USFA UA-8295 terminal users',
      keyType: '15-character user key plus a 5-character nonce derive a 56-bit key',
      modernLesson: 'Separate what was observed in firmware, what was implemented as an attack, what is conditional inference, and what is still open.'
    },
    sodark: {
      family: 'Tweakable block cipher and radio protocol',
      keyType: '56-bit key; 64-bit tweak; attacked eight-round 2G configuration',
      modernLesson: 'State the protected traffic, round count, data requirement and attacker access.'
    },
    'nfc-deployment': {
      family: 'Protocol and deployment case study',
      keyType: 'Device-specific 3DES/AES keys, storage and diversification',
      modernLesson: 'Primitive strength does not establish command integrity or secure authentication state.'
    },
    'nema': {
      region: 'Switzerland', usedBy: 'Swiss Army; training and war-reserve configurations',
      keyType: 'Wheel selection and pairing; ten starting window letters',
      keyIdea: 'Four wired rotors and a moving reflector controlled by separate stepping wheels',
      modernLesson: 'Count the state period separately from the initial key space'
    },
    'hagelin-c36': {
      region: 'Sweden and Switzerland', usedBy: 'Military and diplomatic operators of Hagelin pin-and-lug machines',
      keyType: 'Pin patterns, lug settings, wheel selection and starting positions',
      keyIdea: 'Pin-and-lug mechanisms produce a changing numerical shift; configurations vary by model',
      modernLesson: 'Public cryptanalysis and independent supplier review are separate requirements'
    },
    'turning-grille': {
      region: 'Austria and wartime Europe', usedBy: 'German Army in WWI; other military grille users',
      keyType: 'Hole pattern, starting orientation and rotation direction',
      keyIdea: 'Four quarter-turns visit each cell once, permuting a complete message block',
      modernLesson: 'A stencil can rearrange a message without concealing its existence'
    },
    'myszkowski': {
      region: 'France', usedBy: 'Classical cipher practitioners and puzzle solvers',
      keyType: 'Keyword with repeated letters assigned identical ranks',
      keyIdea: 'Read single columns downwards and tied columns together across rows',
      modernLesson: 'Specify tie handling and incomplete rows to make a permutation reversible'
    },
    'diffie-hellman': {
      keyIdea: 'Two parties derive a shared secret over a public channel; nothing is encrypted',
      keyType: 'No key input — the protocol produces one',
      usedBy: 'Many authenticated key-agreement protocols, including ephemeral-DH modes of TLS'
    },
    'sha256': {
      keyIdea: 'Maps a message shorter than 2^64 bits to a 256-bit digest; hashing does not encrypt the message',
      keyType: 'Unkeyed',
      usedBy: 'Certificate chains, Bitcoin mining, file integrity, password storage (via KDFs)'
    },
    'ecdsa': {
      keyIdea: 'Verifies a signature under an elliptic-curve public key; identity requires authenticating that key',
      keyType: 'Private scalar d with public point Q = dG',
      usedBy: 'TLS certificates, Bitcoin and Ethereum transactions, secure-boot chains'
    },
    'shamir-secret-sharing': {
      keyIdea: 'Any k distinct valid shares recover the field-element secret; fewer reveal nothing when the polynomial coefficients are uniform and independent',
      keyType: 'No key — the secret is the object being split',
      usedBy: 'Threshold backup and custody designs; deployment details vary'
    },
    'zero-knowledge-proofs': {
      keyIdea: 'Proves a statement without revealing the witness beyond what the statement and model permit',
      keyType: 'Witness known only to the prover',
      usedBy: 'Zcash shielded transactions, Ethereum rollups, anonymous credential systems'
    }
  };

  for (const file of files) {
    const slug = file.replace(/\.html$/, '');
    const html = fs.readFileSync(path.join(ciphersDir, file), 'utf8');

    const title = stripTags(between(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, titleizeSlug(slug)));
    const hall = hallFromHtml(html);
    const family = familyFromHall(hall);
    const trust = trustFor('ciphers/' + file);
    const entry = byPath.get('ciphers/' + file);

    cards[slug] = {
      name: title || titleizeSlug(slug),
      // Emitted so the structural tests can check a card's hall against the
      // page's own breadcrumb. Dropping it silently de-links the two.
      // Stored as the bare Roman numeral ("IX"), which is the form those tests
      // compare against — not the full "Hall IX: The Unbreakable" title.
      hall: (String(hall).match(/\b([IVX]+)\b/) || [, String(hall)])[1],
      era: eraFromHtml(html),
      family,
      region: 'Global',
      usedBy: 'See the exhibit for historical participants and source evidence',
      keyType: keyTypeFromHtml(html),
      keyIdea: stripTags(between(html, /<meta name="description" content="([^"]*)"/i, "See the exhibit for its mechanism and limitations.")),
      trust,
      securityFailure: trust ? (entry.note || 'See the exhibit’s documented attacks and limitations.') : null,
      modernLesson: lessonFromHtml(html)
    };
    if (['bombe', 'colossus'].includes(slug)) Object.assign(cards[slug], {
      family: 'Cryptanalysis machinery', region: 'Britain', usedBy: 'Bletchley Park codebreakers and operators',
      keyType: 'Not an encryption system',
      keyIdea: slug === 'bombe' ? 'Search Enigma settings using crib constraints' : 'Score Lorenz wheel hypotheses using electronic logic and counters',
      modernLesson: 'Automation supports analysis; candidate settings still require verification.'
    });
    if (OVERRIDES[slug]) Object.assign(cards[slug], OVERRIDES[slug]);
  }

  fs.mkdirSync(outDir, { recursive: true });
  const jsonText = JSON.stringify({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    totalExhibits: files.length,
    cards
  }, null, 2) + '\n';
  let output = jsonText;
  if (fs.existsSync(outJson)) {
    const previous = JSON.parse(fs.readFileSync(outJson, 'utf8'));
    const next = JSON.parse(jsonText);
    delete previous.generatedAt; delete next.generatedAt;
    if (JSON.stringify(previous) === JSON.stringify(next)) output = fs.readFileSync(outJson, 'utf8');
  }
  outputs.set(outJson, output);

  const jsText = [
    "'use strict';",
    '(function(global){',
    `  global.__ARTIFACT_CARDS__ = ${JSON.stringify({ cards }, null, 2)};`,
    "  if (typeof global.dispatchEvent === 'function') global.dispatchEvent(new global.Event('artifact-cards-ready'));",
    '})(typeof window !== "undefined" ? window : globalThis);',
    ''
  ].join('\n');
  outputs.set(outJs, jsText);
  for (const [file, expected] of outputs) {
    if (!check) { fs.writeFileSync(file, expected, 'utf8'); continue; }
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== expected) {
      console.error(`Stale artifact metadata: ${path.relative(repo, file)}`);
      process.exitCode = 1;
    }
  }

  console.log(`Built artifact cards for ${files.length} exhibits.`);
  console.log(`- ${path.relative(repo, outJson)}`);
  console.log(`- ${path.relative(repo, outJs)}`);
}

main(process.argv.includes('--check'));
