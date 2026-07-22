#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const ciphersDir = path.join(repo, 'ciphers');
const outDir = path.join(repo, 'data');
const outJson = path.join(outDir, 'artifact-cards.json');
const outJs = path.join(repo, 'js', 'artifact-cards-data.js');

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

function securityFromHtml(html) {
  const sec = between(html, /<span class="badge\s+sec-[^"]*">([\s\S]*?)<\/span>/i);
  return sec ? stripTags(sec) : 'Historical security profile varies';
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

function main() {
  const files = fs.readdirSync(ciphersDir).filter((f) => f.endsWith('.html')).sort();
  const cards = {};

  // Per-slug corrections. The generated keyIdea assumes every exhibit turns
  // plaintext into ciphertext, which is false for the protocol exhibits: a
  // key agreement, a hash, a signature, a sharing scheme and a proof system
  // all protect something without encrypting anything.
  const OVERRIDES = {
    'diffie-hellman': {
      keyIdea: 'Two parties derive a shared secret over a public channel; nothing is encrypted',
      keyType: 'No key input — the protocol produces one',
      usedBy: 'Every TLS handshake negotiating forward secrecy'
    },
    'sha256': {
      keyIdea: 'One-way compression of any input to a fixed 256-bit digest; not reversible by design',
      keyType: 'Unkeyed',
      usedBy: 'Certificate chains, Bitcoin mining, file integrity, password storage (via KDFs)'
    },
    'ecdsa': {
      keyIdea: 'Proves authorship of a message hash using a private scalar on an elliptic curve',
      keyType: 'Private scalar d with public point Q = dG',
      usedBy: 'TLS certificates, Bitcoin and Ethereum transactions, secure-boot chains'
    },
    'shamir-secret-sharing': {
      keyIdea: 'Hides a secret as a polynomial constant term; any k of n points recover it, k−1 reveal nothing',
      keyType: 'No key — the secret is the object being split',
      usedBy: 'DNSSEC root key ceremonies, HSM master key custody, cryptocurrency custodians'
    },
    'zero-knowledge-proofs': {
      keyIdea: 'Demonstrates knowledge of a secret without transmitting any part of it',
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
      usedBy: 'Historical operators, states, or communities documented for this exhibit',
      keyType: keyTypeFromHtml(html),
      keyIdea: `${family} transformation of plaintext into protected form`,
      securityFailure: securityFromHtml(html),
      modernLesson: lessonFromHtml(html)
    };
    if (OVERRIDES[slug]) Object.assign(cards[slug], OVERRIDES[slug]);
  }

  fs.mkdirSync(outDir, { recursive: true });
  const jsonText = JSON.stringify({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    totalExhibits: files.length,
    cards
  }, null, 2) + '\n';
  fs.writeFileSync(outJson, jsonText, 'utf8');

  const jsText = [
    "'use strict';",
    '(function(global){',
    `  global.__ARTIFACT_CARDS__ = ${JSON.stringify({ cards }, null, 2)};`,
    '})(typeof window !== "undefined" ? window : globalThis);',
    ''
  ].join('\n');
  fs.writeFileSync(outJs, jsText, 'utf8');

  console.log(`Built artifact cards for ${files.length} exhibits.`);
  console.log(`- ${path.relative(repo, outJson)}`);
  console.log(`- ${path.relative(repo, outJs)}`);
}

main();
