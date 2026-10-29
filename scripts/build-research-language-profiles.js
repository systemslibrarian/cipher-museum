#!/usr/bin/env node
'use strict';
// Builds the versioned historical-language scoring profiles. Explicit refresh only;
// never part of routine metadata builds, and it never reads evaluation fixtures or keys.
//
// Only COUNTS are written to the repository. Source texts are public-domain works
// fetched on demand into an untracked cache; each source records its URL, byte size
// and SHA-256 so the build can be reproduced and checked without redistributing text.
//
//   node scripts/build-research-language-profiles.js --fetch   refresh the cache, then build
//   node scripts/build-research-language-profiles.js           build from the existing cache
//   node scripts/build-research-language-profiles.js --check   fail if the committed file is stale
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const cache = path.join(root, 'tmp', 'language-corpora');
const out = path.join(root, 'data', 'research', 'v2', 'language-profiles.json');
const argv = process.argv.slice(2);
const want = f => argv.includes(f);

// Pruning keeps the published model small enough to ship and to embed in the audit
// pack. It is a declared loss: coverage below reports what it costs.
const KEEP_QUAD = 20000, KEEP_TRI = 6000, FLOOR = 0.1, PENALTY = 1.5;
const HOLDOUT_SHARE = 0.05;
const held = [];

// Every source is a pre-1800 work in the public domain worldwide. Project Gutenberg
// supplies the transcription; the museum stores no part of the text itself.
const SOURCES = [
  { profile: 'historical-french-1580', id: 'montaigne-essais-i',
    url: 'https://www.gutenberg.org/cache/epub/48529/pg48529.txt',
    work: 'Michel de Montaigne, Essais, Volume I (first published 1580)',
    edition: 'Project Gutenberg eBook 48529, a bilingual edition presenting the original text beside a modern-French rendering.',
    // The original-spelling text is the two-space-indented body. The modern rendering,
    // editorial apparatus and Latin quotations sit at other indents and are dropped.
    extract: 'two-space-indented body lines only' },
  { profile: 'historical-italian-1320', id: 'dante-commedia',
    url: 'https://www.gutenberg.org/cache/epub/1012/pg1012.txt',
    work: 'Dante Alighieri, La Divina Commedia (composed c. 1308–1320)',
    edition: 'Project Gutenberg eBook 1012.',
    extract: 'verse body, dropping canto headings and bracketed editorial notes' },
  { profile: 'historical-latin-classical', id: 'caesar-bello-gallico',
    url: 'https://www.gutenberg.org/cache/epub/18837/pg18837.txt',
    work: 'Julius Caesar, Commentarii de Bello Gallico, Libri V–VIII (c. 50 BCE)',
    edition: 'Project Gutenberg eBook 18837.',
    extract: 'continuous prose body, dropping book/chapter headings' }
];


// Development probes used to set the abstention thresholds. Deliberately separate from
// the evaluation fixtures, so the evaluation measures something the thresholds did not see.
// Short public-domain quotations and museum-written sentences only.
const DEVELOPMENT = [
  { id: 'french-archaic', expect: 'historical-french-1580',
    note: 'Montaigne, Essais I, opening of the chapter on sadness (public domain).',
    text: 'Il nest rien si certain que la mort et rien si incertain que lheure dicelle cest vne chose qui se doit attendre de tous' },
  { id: 'french-modern', expect: 'historical-french-1580',
    note: 'Museum-written modern French. The RIGHT language and the WRONG period: the profile names both, and a modern text still ranks it first.',
    text: 'La lettre arrive avant la nuit nous gardons les signes et les espaces du document original une lecture possible ne suffit pas' },
  { id: 'latin-classical', expect: 'historical-latin-classical',
    note: 'Caesar, De Bello Gallico (public domain).',
    text: 'Caesar cum in Galliam venit alterius factionis principes erant Aedui alterius Sequani cum per se minus valerent' },
  { id: 'italian-verse', expect: 'historical-italian-1320',
    note: 'Dante, Inferno I (public domain).',
    text: 'Nel mezzo del cammin di nostra vita mi ritrovai per una selva oscura che la diritta via era smarrita ahi quanto a dir' },
  { id: 'latin-inside-french', expect: 'historical-french-1580',
    note: 'Museum-written French carrying an embedded Latin tag, the mixed-language case the papers warn about.',
    text: 'Il disoit que la fortune ne peut rien sur le sage car Curae leues loquuntur ingentes stupent et cela se void assez' },
  { id: 'absent-language-english', expect: null,
    note: 'NEGATIVE CONTROL. English is not in the profile set, so no answer is correct; the comparison must abstain.',
    text: 'The messenger returned before the rain she carried a letter and a small wooden box we read the letter together' },
  { id: 'short-input', expect: null,
    note: 'NEGATIVE CONTROL. Too short to separate any two profiles.', text: 'La mort' },
  { id: 'random-control', expect: null,
    note: 'NEGATIVE CONTROL. No planted language at all.',
    text: 'QXZJKVWQPZXJKVQWZXJPKVQWZXJKPVQWZXJKVPQWZXJKVQPWZXJKVQZ' }
];

const PROFILES = {
  'historical-french-1580': {
    language: 'French', period: 'Sixteenth century (text first published 1580)',
    register: 'Essayistic prose: reflective, classicizing, heavy in Latin quotation.',
    orthography: 'Original early-modern spelling retained: undifferentiated i/j and u/v, -oit imperfects, s before consonants (mesme, estre).',
    relevance: 'Closest published profile to the French of the 1578–1584 Mary Stuart correspondence, but a different author, register and decade.',
    limits: 'One author, one volume. Not chancery or diplomatic French, and not a substitute for the orthography of any particular scribe.' },
  'historical-italian-1320': {
    language: 'Italian', period: 'Early fourteenth century',
    register: 'Narrative verse in terza rima.',
    orthography: 'Original Tuscan spelling with elision marks; apostrophes and accents are removed by the normalization below.',
    relevance: 'An Italian profile with period orthography, for comparison against French and Latin hypotheses.',
    limits: 'Verse, not prose. Fourteenth-century Tuscan is two centuries earlier than the chancery Italian of most enciphered diplomatic correspondence; letter statistics from verse carry metrical structure that prose does not.' },
  'historical-latin-classical': {
    language: 'Latin', period: 'First century BCE (classical)',
    register: 'Military and administrative narrative prose.',
    orthography: 'Classical orthography with u for consonantal v; no medieval e-caudata or ae/e confusion.',
    relevance: 'Latin appears inside French, Italian and German historical ciphers; a Latin profile lets that hypothesis be tested rather than assumed.',
    limits: 'Classical Latin, NOT the medieval or early-modern ecclesiastical and chancery Latin that actually appears in enciphered archives. Expect this profile to understate the real variation.' }
};

const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');

async function cached(source) {
  const file = path.join(cache, source.id + '.txt');
  if (fs.existsSync(file) && !want('--fetch')) return fs.readFileSync(file);
  if (!want('--fetch')) {
    throw new Error('Missing cached corpus ' + source.id + '. Run with --fetch, or save ' + source.url + ' to ' + file + '.');
  }
  if (typeof fetch !== 'function') throw new Error('This Node.js build cannot fetch; save ' + source.url + ' to ' + file + '.');
  const response = await fetch(source.url);
  if (!response.ok) throw new Error('Could not fetch ' + source.url + ': HTTP ' + response.status);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.mkdirSync(cache, { recursive: true });
  fs.writeFileSync(file, buffer);
  return buffer;
}

function body(raw) {
  const text = raw.replace(/\r/g, '');
  const start = text.indexOf('*** START OF');
  const end = text.indexOf('*** END OF');
  const inner = start >= 0 ? text.slice(text.indexOf('\n', start) + 1) : text;
  return end > start ? inner.slice(0, inner.indexOf('*** END OF')) : inner;
}

function extract(source, raw) {
  const lines = body(raw.toString('utf8')).split('\n');
  if (source.profile === 'historical-french-1580') {
    // Original-spelling body only: exactly two leading spaces. The modern rendering,
    // front matter and Latin verse quotations use other indents.
    return lines.filter(l => /^ {2}\S/.test(l) && !/^\s*_.*_\s*$/.test(l)).map(l => l.slice(2));
  }
  return lines.filter(l => l.trim() && !/^\s*\[/.test(l) && !/^[A-Z0-9 .,'’\-]{8,}$/.test(l.trim()));
}

// Accents are folded because the solver and the published key alphabets are A–Z.
// Folding is lossy and is declared as part of the profile's normalization.
const FOLD = { 'À':'A','Á':'A','Â':'A','Ã':'A','Ä':'A','Å':'A','Æ':'AE','Ç':'C','È':'E','É':'E','Ê':'E','Ë':'E',
  'Ì':'I','Í':'I','Î':'I','Ï':'I','Ñ':'N','Ò':'O','Ó':'O','Ô':'O','Õ':'O','Ö':'O','Ø':'O','Œ':'OE',
  'Ù':'U','Ú':'U','Û':'U','Ü':'U','Ý':'Y','ß':'SS' };
function normalize(line) {
  return Array.from(line.toUpperCase()).map(c => FOLD[c] === undefined ? c : FOLD[c]).join('').replace(/[^A-Z]/g, '');
}

// A declared orthography probe: the share of archaic over modern French markers in the
// extracted text. It verifies that the extraction kept the original and not the modern
// rendering. It is a check on the build, not a claim about the language.
const ARCHAIC = [/\bVN\b/g, /\bVNE\b/g, /ESTOIT/g, /AUOIR/g, /MESME/g, /NOSTRE/g, /\bLUY\b/g, /OIENT\b/g];
const MODERN = [/\bUN\b/g, /\bUNE\b/g, /ETAIT/g, /\bAVOIR\b/g, /\bMEME\b/g, /\bNOTRE\b/g, /\bLUI\b/g, /AIENT\b/g];
const countAll = (text, patterns) => patterns.reduce((n, p) => n + (text.match(p) || []).length, 0);

async function buildProfile(key) {
  const quad = Object.create(null), tri = Object.create(null), letters = Array(26).fill(0);
  let quadTotal = 0, triTotal = 0, letterTotal = 0, segments = 0, keptChars = 0, sourceChars = 0;
  const sources = [];
  for (const source of SOURCES.filter(s => s.profile === key)) {
    const raw = await cached(source);
    const all = extract(source, raw);
    // The last HOLDOUT_SHARE of each source is reserved and never counted, so the
    // evaluation has text the model has not seen. Same work and same author, so this
    // is a document-internal holdout, NOT an independent source document.
    const cut = Math.floor(all.length * (1 - HOLDOUT_SHARE));
    const lines = all.slice(0, cut);
    held.push({ profile: key, source: source.id, lines: all.slice(cut).filter(l => l.trim().length > 30) });
    const joined = lines.map(normalize);
    sourceChars += raw.length;
    const probe = normalize(lines.join(' '));
    for (const text of joined) {
      if (!text) continue;
      segments++; keptChars += text.length;
      const c = Array.from(text, x => x.charCodeAt(0) - 65);
      c.forEach(x => { letters[x]++; letterTotal++; });
      for (let i = 0; i < c.length - 2; i++) { const n = c[i] * 676 + c[i + 1] * 26 + c[i + 2]; tri[n] = (tri[n] || 0) + 1; triTotal++; }
      for (let i = 0; i < c.length - 3; i++) { const n = c[i] * 17576 + c[i + 1] * 676 + c[i + 2] * 26 + c[i + 3]; quad[n] = (quad[n] || 0) + 1; quadTotal++; }
    }
    // The probe only means anything for the French source, where the extraction has to
    // separate original spelling from a modern rendering printed in the same file.
    const probed = source.profile === 'historical-french-1580';
    const archaic = probed ? countAll(probe, ARCHAIC) : 0, modern = probed ? countAll(probe, MODERN) : 0;
    sources.push({ id: source.id, work: source.work, edition: source.edition, url: source.url,
      bytes: raw.length, sha256: sha(raw), extract: source.extract,
      orthographyProbe: probed
        ? { scope: 'Build check that the extraction kept original 1580s spelling, not the modern rendering printed alongside it.',
            archaicMarkers: archaic, modernMarkers: modern,
            archaicShare: archaic + modern ? Number((archaic / (archaic + modern)).toFixed(4)) : null }
        : { scope: 'Not applicable: this source contains no modern-language rendering to separate.' } });
  }
  // Line segments never form n-grams across their boundaries, so no cross-line
  // sequence is invented where the source had a break.
  const take = (table, keep) => Object.entries(table).map(([n, c]) => [Number(n), c])
    .sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, keep);
  const quadKept = take(quad, KEEP_QUAD), triKept = take(tri, KEEP_TRI);
  const quadDistinct = Object.keys(quad).length, triDistinct = Object.keys(tri).length;
  const quadMass = quadKept.reduce((n, e) => n + e[1], 0), triMass = triKept.reduce((n, e) => n + e[1], 0);
  return Object.assign({ id: key }, PROFILES[key], {
    sources, segments, letterTotal, triTotal, quadTotal,
    normalization: 'Uppercase; accents and ligatures folded to A–Z (' +
      'É→E, Æ→AE, ß→SS and so on); every other character removed; no n-gram crosses a source line break. Folding is lossy.',
    pruning: 'Published counts keep the ' + KEEP_QUAD + ' most frequent quadgrams and ' + KEEP_TRI +
      ' most frequent trigrams. Anything else scores at the floor.',
    rights: 'Pre-1800 work, public domain worldwide. Only n-gram counts are published here; no part of the transcription is redistributed.',
    coverage: {
      quadgramTypesObserved: quadDistinct, quadgramTypesPublished: quadKept.length,
      quadgramTokenShareKept: Number((quadMass / quadTotal).toFixed(4)),
      trigramTypesObserved: triDistinct, trigramTypesPublished: triKept.length,
      trigramTokenShareKept: Number((triMass / triTotal).toFixed(4)),
      lettersKept: letterTotal, charactersOfSourceFile: sourceChars,
      holdoutShare: HOLDOUT_SHARE,
      holdoutNote: 'The final ' + (100 * HOLDOUT_SHARE) + '% of each source was reserved before counting and is written to holdout.json. The model has not seen it, but it is the same work by the same author: a document-internal holdout, not an independent source document.',
      note: 'Token share kept is the fraction of training n-gram occurrences that a published count covers. Unseen text will fall to the floor more often than these figures suggest.' },
    floorCount: FLOOR, frequencyPenalty: PENALTY, letters,
    quad: quadKept, tri: triKept });
}

async function main() {
const profiles = [];
for (const key of Object.keys(PROFILES)) profiles.push(await buildProfile(key));
const data = {
  version: 1, id: 'museum-language-profiles-v1',
  purpose: 'Versioned scoring profiles for historical-language hypotheses. Scores rank candidates within one profile and compare profiles by mean log-probability per letter; they are not calibrated probabilities and never a probability that a reading is historically correct.',
  baseline: { id: 'museum-prose-quadgram-v1', file: 'data/research/v1/language-model.json',
    disclosure: 'The modern-English model built from Cipher Museum exhibit prose remains available and is clearly a BASELINE: modern English, museum register, not historical material.' },
  // Declared abstention rule. Comparing raw log-likelihoods from differently sized
  // corpora is not meaningful, so the comparison uses mean log-probability per letter
  // and refuses to choose when the input is short, the margin is small or coverage is low.
  // Thresholds are CALIBRATED on the development probes below, which are museum-written
  // or short public-domain quotations and are deliberately separate from the evaluation
  // fixtures. Calibrating on a handful of probes is not a measured accuracy figure.
  abstention: { minimumLetters: 40, minimumMargin: 0.8, minimumCoverage: 0.75,
    calibratedOn: 'development probes recorded in this file',
    note: 'Below any threshold the comparison reports no decision. Abstention is a result, not a failure.' },
  development: DEVELOPMENT,
  profiles
};
// Held-out passages are short extracts from pre-1800 public-domain works, kept as text
// because an evaluation has to be reproducible from the committed repository alone.
const holdout = { version: 1, id: 'museum-language-holdout-v1',
  scope: 'Passages reserved from the SAME documents used to build the profiles. Unseen by the model, but the same work and author: use them to measure model fit, not independent-source generalization.',
  rights: 'Pre-1800 works, public domain worldwide; short extracts.',
  passages: held.flatMap(h => {
    const text = h.lines.join(' ').replace(/\s+/g, ' ').trim();
    const chunks = [];
    for (let i = 0; i + 400 <= text.length && chunks.length < 3; i += 600) chunks.push(text.slice(i, i + 400));
    return chunks.map((t, n) => ({ id: h.source + '-holdout-' + (n + 1), profile: h.profile, source: h.source,
      characters: t.length, sha256: sha(Buffer.from(t, 'utf8')), text: t }));
  }) };
const holdoutFile = path.join(root, 'data', 'research', 'v2', 'holdout.json');
const encoded = JSON.stringify(data) + '\n';
if (want('--check')) {
  const holdoutEncoded = JSON.stringify(holdout, null, 2) + '\n';
  if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== encoded) {
    console.error('Historical-language profiles are stale.'); process.exitCode = 1;
  } else if (!fs.existsSync(holdoutFile) || fs.readFileSync(holdoutFile, 'utf8') !== holdoutEncoded) {
    console.error('Held-out language passages are stale.'); process.exitCode = 1;
  } else console.log('Historical-language profiles and held-out passages are current.');
} else {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, encoded);
  fs.writeFileSync(holdoutFile, JSON.stringify(holdout, null, 2) + '\n');
  console.log('Wrote ' + path.relative(root, holdoutFile) + ': ' + holdout.passages.length + ' held-out passages.');
  profiles.forEach(p => console.log(p.id + ': ' + p.letterTotal + ' letters, ' + p.coverage.quadgramTypesObserved +
    ' quadgram types (' + p.coverage.quadgramTypesPublished + ' published, ' +
    (100 * p.coverage.quadgramTokenShareKept).toFixed(1) + '% of training occurrences covered)'));
  console.log('Wrote ' + path.relative(root, out) + ': ' + fs.statSync(out).size + ' bytes.');
}
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
