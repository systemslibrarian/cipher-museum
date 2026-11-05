#!/usr/bin/env node
'use strict';

/**
 * Derive the downloadable v0.8 corpus from the frozen, reproducible v0.7 set.
 * v0.6 and the tagged v0.7 tree are never changed. Run v0.7's builder first.
 *
 * The raw JSONL is a local, ignored build product. A gzip of the complete JSONL
 * is committed and served from the museum download page.
 *
 * What is deterministic is the CONTENT of that gzip, not its bytes: Node's
 * bundled zlib changes between majors (CI builds with Node 22, a developer
 * machine may run 26) and the two encoders emit different deflate streams for
 * identical input. So the committed download is judged by what it decompresses
 * to, it is never rewritten while its content is already exact, and the
 * checksum manifest is derived from the committed bytes. The published file
 * therefore stays byte-stable across machines, which is what its recorded
 * SHA-256 and DOI require.
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const readline = require('node:readline');
const { once } = require('node:events');
const { finished } = require('node:stream/promises');

global.window = global;
require('../js/ciphers/all-engines.js');
const twoSquare = global.CipherEngines.twosquare;

const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'public/corpus/v0.7/all.jsonl');
const OUT = path.join(ROOT, 'public/corpus/v0.8');
const VERSION = '0.8';
const ACA_SOURCE = 'https://www.cryptogram.org/downloads/aca.info/ciphers/TwoSquare.pdf';
const CITATION_ERRORS = Object.freeze({
  'hist-beale-paper1-001': {
    status: 'wrong_work',
    url: 'https://www.gutenberg.org/ebooks/12994',
    note: 'The cited Project Gutenberg item is George William Erskine Russell, Sydney Smith, not The Beale Papers. The original source for this fixture has not been verified.'
  },
  'hist-caesar-suetonius-001': {
    status: 'link_unavailable',
    url: 'https://en.wikisource.org/wiki/The_Lives_of_the_Twelve_Caesars/Life_of_Julius_Caesar',
    note: 'The old link returned HTTP 404 during the 22 October 2026 link audit. This is a teaching reconstruction, not a verified Suetonius ciphertext.'
  },
  'hist-alberti-de-cifris-001': {
    status: 'link_unavailable',
    url: 'https://www.cs.cornell.edu/courses/cs6820/2012fa/handouts/alberti.pdf',
    note: 'The old link returned HTTP 404 during the 22 October 2026 link audit. No replacement has been verified as provenance for this fixture.'
  },
  'hist-venona-rosenberg-001': {
    status: 'link_unavailable',
    url: 'https://www.nsa.gov/Portals/75/documents/news-features/declassified-documents/venona/',
    note: 'The old link returned HTTP 404 during the 22 October 2026 link audit. An overview of VENONA is not proof of this plaintext/ciphertext pair.'
  },
  'hist-chaocipher-byrne-001': {
    status: 'link_unavailable',
    url: 'https://www.cryptomuseum.com/crypto/chaocipher/',
    note: 'The old link returned HTTP 404 during the 22 October 2026 link audit. A related Chaocipher page is not provenance for this fixture.'
  }
});

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const shaFile = file => sha256(fs.readFileSync(file));
const encode = value => JSON.stringify(value) + '\n';

function transformRecord(original) {
  const record = { ...original, dataset_version: VERSION, corpus_version: VERSION };
  const corrections = {};
  if (record.cipher_type === 'two_square') {
    if (record.source_type !== 'synthetic' || !record.key?.key1 || !record.key?.key2) {
      throw new Error(`${record.id}: cannot regenerate Two-square without synthetic source and two keys`);
    }
    const key = `${record.key.key1},${record.key.key2}`;
    const ciphertext = twoSquare.encode(record.plaintext, key);
    if (twoSquare.decode(ciphertext, key) !== String(record.plaintext)
      .normalize('NFD').replace(/\p{M}/gu, '').toUpperCase()
      .replace(/[^A-Z]/g, '').replace(/J/g, 'I')) {
      throw new Error(`${record.id}: corrected Two-square pair did not decode to its prepared plaintext`);
    }
    if (ciphertext !== record.ciphertext) {
      corrections.ciphertext = { from: record.ciphertext, to: ciphertext };
      record.ciphertext = ciphertext;
    }
    // A matched engine output under the ACA convention, never a historical
    // authentication claim. One old ciphertext happens to match by chance.
    record.pair_status = 'verified_pair';
    record.verification_method = 'engine_replay';
    record.benchmark_eligible = true;
    record.verified = true;
  }
  const error = CITATION_ERRORS[record.id];
  if (error) {
    if (record.source_provenance?.url !== error.url) {
      throw new Error(`${record.id}: the reviewed bad citation has changed`);
    }
    const before = record.source_provenance;
    record.source_provenance = {
      ...before,
      url: null,
      archive: 'Original source citation unresolved'
    };
    record.citation_erratum = {
      status: error.status,
      previous_url: before.url,
      previous_archive: before.archive,
      reviewed_on: '2026-10-22',
      note: error.note
    };
    corrections.source_provenance = { from: before, to: record.source_provenance };
    corrections.citation_erratum = { from: null, to: record.citation_erratum };
  }
  return { record, corrections };
}

function schemaFor() {
  const schema = JSON.parse(fs.readFileSync(path.join(ROOT,
    'public/corpus/v0.7/cipher-corpus.schema.json'), 'utf8'));
  schema.$version = VERSION;
  schema.title = 'Cipher Corpus Record (v0.8)';
  schema.properties.verified.description = 'v0.8: whether this is a verified, benchmark-eligible pair. The v0.6 flag did not imply an authenticated historical source.';
  schema.properties.source_provenance.properties.url = {
    type: ['string', 'null'],
    format: 'uri',
    description: 'A verified matching source URL when known; null for retired or unsupported citations. Read citation_erratum when present.'
  };
  schema.properties.citation_erratum = {
    type: 'object',
    description: 'A retired source URL is preserved here for audit, never presented as verified provenance for this record.',
    properties: {
      status: { type: 'string', enum: ['wrong_work', 'link_unavailable'] },
      previous_url: { type: 'string', format: 'uri' },
      previous_archive: { type: 'string' },
      reviewed_on: { type: 'string' },
      note: { type: 'string' }
    },
    required: ['status', 'previous_url', 'previous_archive', 'reviewed_on', 'note']
  };
  return schema;
}

async function writeChunk(stream, chunk) {
  if (!stream.write(chunk)) await once(stream, 'drain');
}

async function produce(tempDir) {
  const plainPath = path.join(tempDir, 'all.jsonl');
  const gzipPath = path.join(tempDir, 'all.jsonl.gz');
  const plain = fs.createWriteStream(plainPath);
  const zipped = fs.createWriteStream(gzipPath);
  const gzip = zlib.createGzip({ level: 9, mtime: 0 });
  gzip.pipe(zipped);
  const rawHash = crypto.createHash('sha256');
  const changed = [];
  let count = 0;
  let twoSquareCount = 0;
  let twoSquareChanged = 0;
  let citationCount = 0;
  try {
    const lines = readline.createInterface({ input: fs.createReadStream(INPUT), crlfDelay: Infinity });
    for await (const line of lines) {
      if (!line) continue;
      const { record, corrections } = transformRecord(JSON.parse(line));
      count++;
      if (record.cipher_type === 'two_square') {
        twoSquareCount++;
        if (corrections.ciphertext) twoSquareChanged++;
      }
      if (record.citation_erratum) citationCount++;
      if (record.cipher_type === 'two_square' || Object.keys(corrections).length) changed.push({
        id: record.id,
        reason_code: [
          ...(corrections.ciphertext ? ['aca_two_square'] : []),
          ...(record.cipher_type === 'two_square' && !corrections.ciphertext
            ? ['aca_two_square_already_matched'] : []),
          ...(corrections.citation_erratum ? [record.citation_erratum.status] : [])
        ].join(','),
        fields: corrections
      });
      const output = encode(record);
      rawHash.update(output);
      await writeChunk(plain, output);
      await writeChunk(gzip, output);
    }
    plain.end(); gzip.end();
    await Promise.all([finished(plain), finished(zipped)]);
  } catch (error) {
    plain.destroy(); gzip.destroy(error); zipped.destroy();
    throw error;
  }
  const summary = {
    records_in: count,
    records_out: count,
    two_square_recomputed: twoSquareCount,
    two_square_ciphertexts_changed: twoSquareChanged,
    source_citations_corrected: citationCount
  };
  if (count !== 100313 || twoSquareCount !== 1072 || twoSquareChanged !== 1071 || citationCount !== 5) {
    throw new Error(`reviewed v0.7 baseline has changed: ${JSON.stringify(summary)}`);
  }
  const inventory = {
    corpus_version: VERSION,
    derived_from: { file: 'public/corpus/v0.7/all.jsonl', corpus_version: '0.7', records: count },
    reason_codes: {
      aca_two_square: `Re-encrypted with the ACA horizontal Two-square convention (${ACA_SOURCE}). One of 1,072 already matched by chance.`,
      aca_two_square_already_matched: 'ACA horizontal Two-square re-encryption matched the old ciphertext by chance; the pair was still independently reverified.',
      wrong_work: 'Cited work is a different book; original source is not verified.',
      link_unavailable: 'Old URL returned HTTP 404 on 2026-10-22; original source has not been verified.'
    },
    summary,
    corrections: changed
  };
  const oldStats = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/corpus/v0.7/stats.json'), 'utf8'));
  const stats = {
    ...oldStats,
    corpus_version: VERSION,
    raw_jsonl_sha256: rawHash.digest('hex'),
    corrections_from_v07: summary
  };
  const artifacts = {
    'cipher-corpus.schema.json': encodePretty(schemaFor()),
    'stats.json': encodePretty(stats),
    'change-inventory.json': encodePretty(inventory)
  };
  for (const [name, contents] of Object.entries(artifacts)) {
    fs.writeFileSync(path.join(tempDir, name), contents);
  }
  const included = ['all.jsonl.gz', ...Object.keys(artifacts)];
  fs.writeFileSync(path.join(tempDir, 'SHA256SUMS.txt'),
    included.map(name => `${shaFile(path.join(tempDir, name))}  ${name}`).join('\n') + '\n');
  return { summary, plainPath, files: [...included, 'SHA256SUMS.txt'] };
}

function encodePretty(value) { return JSON.stringify(value, null, 2) + '\n'; }

async function main() {
  if (!fs.existsSync(INPUT)) {
    throw new Error('Build the frozen source first: npm run build:corpus:v07');
  }
  const check = process.argv.includes('--check');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cipher-corpus-v08-'));
  try {
    const { summary, plainPath, files } = await produce(tempDir);
    fs.mkdirSync(OUT, { recursive: true });
    const committed = name => path.join(OUT, name);
    const rebuilt = name => path.join(tempDir, name);

    // The gzip is compared by content. Its bytes legitimately differ between
    // zlib builds, and the committed bytes are the published, checksummed
    // download, so they are kept whenever they already decompress to exactly
    // the rebuilt JSONL.
    const gz = 'all.jsonl.gz';
    const rebuiltPlainSha = shaFile(plainPath);
    let committedGzContentSha = null;
    if (fs.existsSync(committed(gz))) {
      try { committedGzContentSha = sha256(zlib.gunzipSync(fs.readFileSync(committed(gz)))); }
      catch (error) { committedGzContentSha = `unreadable gzip: ${error.message}`; }
    }
    const gzContentCurrent = committedGzContentSha === rebuiltPlainSha;
    const gzBytesDiffer = gzContentCurrent && shaFile(committed(gz)) !== shaFile(rebuilt(gz));

    const stale = files.filter(name => {
      if (name === gz) return !gzContentCurrent;
      if (name === 'SHA256SUMS.txt') return false; // derived; judged below
      return !fs.existsSync(committed(name)) || shaFile(committed(name)) !== shaFile(rebuilt(name));
    });
    const plainStale = !fs.existsSync(committed('all.jsonl'))
      || shaFile(committed('all.jsonl')) !== rebuiltPlainSha;

    // The manifest must list the bytes that will actually be published: the
    // committed gzip when its content is current, the rebuilt one otherwise,
    // and the rebuilt JSON artifacts (identical to the committed ones when
    // nothing is stale).
    const manifestSource = name => (name === gz && gzContentCurrent) ? committed(name) : rebuilt(name);
    const expectedSums = files.filter(name => name !== 'SHA256SUMS.txt')
      .map(name => `${shaFile(manifestSource(name))}  ${name}`).join('\n') + '\n';
    const sumsStale = !fs.existsSync(committed('SHA256SUMS.txt'))
      || fs.readFileSync(committed('SHA256SUMS.txt'), 'utf8') !== expectedSums;

    if (check && (stale.length || plainStale || sumsStale)) {
      const what = [...stale.map(name => name === gz ? `${gz} (decompressed content)` : name),
        ...(plainStale ? ['all.jsonl'] : []), ...(sumsStale ? ['SHA256SUMS.txt'] : [])];
      throw new Error(`v0.8 outputs differ: ${what.join(', ')}`);
    }
    if (!check) {
      for (const name of stale) fs.copyFileSync(rebuilt(name), committed(name));
      if (plainStale) fs.copyFileSync(plainPath, committed('all.jsonl'));
      if (sumsStale) fs.writeFileSync(committed('SHA256SUMS.txt'), expectedSums);
    }
    if (gzBytesDiffer) {
      console.log(`Note: this machine's zlib (${process.versions.zlib}, Node ${process.version}) encodes ${gz} `
        + 'to different bytes; the decompressed content is identical, so the committed download is kept.');
    }
    console.log(`Cipher Corpus v0.8 ${check ? 'verified' : 'built'}: ${summary.records_out} complete records; `
      + `${summary.two_square_ciphertexts_changed} Two-square ciphertext changes; `
      + `${summary.source_citations_corrected} retired citations; compressed full download present.`);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

if (require.main === module) main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

module.exports = { transformRecord, schemaFor, CITATION_ERRORS, ACA_SOURCE };
