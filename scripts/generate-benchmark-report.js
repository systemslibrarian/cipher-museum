#!/usr/bin/env node
/**
 * generate-benchmark-report.js
 * Generates descriptive statistics from the Cipher Corpus.
 * This is a dataset inventory, not a measurement of solver accuracy.
 *
 * Usage: node scripts/generate-benchmark-report.js
 * Output: public/reports/benchmark-baselines.json, public/reports/benchmark-baselines.html
 */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const CORPUS_DIR = path.join(__dirname, '../public/corpus');
const REPORTS_DIR = path.join(__dirname, '../public/reports');
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const TODAY = '2026-10-26';

// Load corpus
const lines = fs.readFileSync(path.join(CORPUS_DIR, 'all.jsonl'), 'utf8').split('\n').filter(Boolean);
const records = lines.map(l => JSON.parse(l));

// Helper: group by key
function groupBy(arr, key) {
  return arr.reduce((acc, r) => { (acc[r[key]] = acc[r[key]] || []).push(r); return acc; }, {});
}

// No solver run is supplied to this generator. Do not invent accuracy ranges.
const SOLVER_BASELINES = {};

const byDifficulty = groupBy(records, 'difficulty');
const byCipherType = groupBy(records, 'cipher_type');
const byFamily = groupBy(records, 'cipher_family');
const byLanguage = groupBy(records, 'language');
const bySplit = groupBy(records, 'split');
const byQuality = groupBy(records, 'transcription_quality');
const plaintextSymbolLength = value => Array.from(
  String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '')
).filter(character => /[\p{L}\p{N}]/u.test(character)).length;

// Per-cipher stats
const cipherStats = Object.entries(byCipherType).map(([type, recs]) => {
  const difficulties = groupBy(recs, 'difficulty');
  const difficultyLabels = Object.keys(difficulties);
  const diff = difficultyLabels.length === 1 ? difficultyLabels[0] : 'mixed';
  const baseline = SOLVER_BASELINES[diff] || {};
  const avgLen = Math.round(recs.reduce((sum, record) => sum + plaintextSymbolLength(record.plaintext), 0) / recs.length);
  const languages = [...new Set(recs.map(r => r.language))];

  return {
    cipher_type: type,
    cipher_family: recs[0].cipher_family,
    difficulty: diff,
    difficulty_distribution: Object.fromEntries(Object.entries(difficulties).map(([label, rows]) => [label, rows.length])),
    record_count: recs.length,
    public_count: recs.filter(r => r.split === 'public').length,
    blind_count: recs.filter(r => r.split === 'blind').length,
    avg_plaintext_symbols: avgLen,
    languages,
    expected_attacks: [...new Set(recs.flatMap(r => r.expected_attacks))].slice(0, 4),
    solver_baselines: baseline,
    legacy_verified_flag_count: recs.filter(r => r.verified).length,
    noisy_count: recs.filter(r => r.transcription_quality === 'noisy').length,
  };
}).sort((a, b) => b.record_count - a.record_count);

// Family stats
const familyStats = Object.entries(byFamily).map(([family, recs]) => ({
  family,
  record_count: recs.length,
  cipher_types: [...new Set(recs.map(r => r.cipher_type))],
  difficulty_distribution: Object.fromEntries(
    Object.entries(groupBy(recs, 'difficulty')).map(([d, rs]) => [d, rs.length])
  ),
})).sort((a, b) => b.record_count - a.record_count);

// Overall report
const report = {
  generated: TODAY,
  version: '0.6',
  description: 'Cipher Corpus descriptive statistics; solver accuracy is not measured here',
  corpus_url: 'https://ciphermuseum.com/cipher-corpus.html',
  citation: {
    cipher_corpus: {
      title: 'Cipher Corpus v0.6: A Classical Cryptography Dataset',
      author: 'Clark, Paul A.',
      orcid: '0009-0004-2394-0991',
      year: 2026,
      version: '0.6',
      publisher: 'Zenodo',
      doi: '10.5281/zenodo.23297920',
      concept_doi: '10.5281/zenodo.23297919',
      url: 'https://doi.org/10.5281/zenodo.23297920',
      note: '100,326 canonical records across 85 cipher-type labels'
    },
    related_work: {
      title: 'CipherBank: Exploring the Boundary of LLM Reasoning Capabilities through Cryptography Challenges',
      authors: 'Li et al.',
      year: 2025,
      url: 'https://arxiv.org/pdf/2504.19093',
      note: 'Related LLM decryption benchmark; its records and evaluation methods differ from this corpus'
    }
  },
  summary: {
    total_records: records.length,
    legacy_verified_flag_records: records.filter(r => r.verified).length,
    cipher_types: Object.keys(byCipherType).length,
    cipher_families: Object.keys(byFamily).length,
    languages: Object.keys(byLanguage),
    public_split: (bySplit.public || []).length,
    blind_split: (bySplit.blind || []).length,
    clean_records: (byQuality.clean || []).length,
    noisy_records: (byQuality.noisy || []).length,
    historical_records: records.filter(r => r.source_type === 'historical').length,
    difficulty_distribution: Object.fromEntries(
      Object.entries(byDifficulty).map(([d, rs]) => [d, rs.length])
    ),
    language_distribution: Object.fromEntries(
      Object.entries(byLanguage).map(([l, rs]) => [l, rs.length])
    ),
  },
  solver_baselines: {
    status: 'not_measured',
    description: 'No measured solver accuracy is supplied by this report',
    methodology: 'Record counts and text lengths are computed from the corpus. Previously displayed numerical accuracy ranges were unsupported estimates and have been removed. Use a documented solver run and reproducibility receipt for performance claims.',
    baselines: SOLVER_BASELINES,
  },
  per_cipher_stats: cipherStats,
  per_family_stats: familyStats,
  benchmark_splits: {
    public: {
      count: (bySplit.public || []).length,
      description: 'Public split label — available for training and development evaluation',
      note: 'Do not train and evaluate on the same split'
    },
    blind: {
      count: (bySplit.blind || []).length,
      description: 'Downloadable evaluation split label; not confidential held-out data',
      note: 'Do not train and evaluate on the same records; use separately held-out data for genuinely unseen evaluation'
    }
  },
  comparison_with_cipherbank: {
    cipherbank: { records: 2358, cipher_types: 9 },
    cipher_corpus: { records: records.length, cipher_types: Object.keys(byCipherType).length },
    note: 'These are collection counts, not comparable accuracy results. The collections use different records and evaluation methods.'
  }
};

// Write JSON report
const jsonPath = path.join(REPORTS_DIR, 'benchmark-baselines.json');
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
console.log(`Benchmark report → ${jsonPath}`);

// Write HTML report
const htmlRows = cipherStats.slice(0, 50).map(s =>
  `<tr>
    <td>${s.cipher_type}</td>
    <td>${s.cipher_family}</td>
    <td class="diff-${s.difficulty}">${s.difficulty}</td>
    <td>${s.record_count}</td>
    <td>${s.avg_plaintext_symbols}</td>
  </tr>`
).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cipher Corpus Statistics and Evaluation Status</title>
  <!-- Generated status report, not an exhibit. noindex keeps it out of search
       results; follow keeps its outgoing links working. Omitting it from
       sitemap.xml alone would not keep it out of an index. -->
  <meta name="robots" content="noindex, follow">
  <link rel="stylesheet" href="/css/museum.css">
  <style>
    table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.95em; }
    th, td { border: 1px solid var(--border-card,#3a2c13); padding: 0.4em 0.8em; text-align: left; }
    th { background: var(--bg-card,#18140e); color: var(--fg-heading,#ffd700); }
    tr:nth-child(even) { background: rgba(255,255,255,0.03); }
    .diff-beginner { color: #4caf50; }
    .diff-intermediate { color: #ffc107; }
    .diff-advanced { color: #ff9800; }
    .diff-expert { color: #f44336; }
    .stat-box { display: inline-block; background: var(--bg-card,#18140e); border: 1px solid var(--border-card,#3a2c13); border-radius: 8px; padding: 1em 1.5em; margin: 0.5em; text-align: center; }
    .stat-num { font-size: 2em; font-weight: bold; color: var(--fg-heading,#ffd700); }
    .stat-label { font-size: 0.9em; color: var(--fg-muted,#bfa76a); }
  </style>
</head>
<body>
<a href="#main-content" class="skip-link">Skip to main content</a>
<header>
  <nav>
    <a href="../../index.html">🏛️ Cipher Museum</a>
    <a href="../../cipher-corpus.html">Cipher Corpus</a>
    <a href="benchmark-baselines.html" aria-current="page">Benchmark Report</a>
  </nav>
</header>
<main id="main-content" tabindex="-1">
  <h1>Cipher Corpus Statistics and Evaluation Status</h1>
  <p style="color:var(--fg-muted,#bfa76a)">Generated ${TODAY} · v0.6 · <a href="/public/reports/benchmark-baselines.json">Download JSON</a></p>

  <div>
    <div class="stat-box"><div class="stat-num">${report.summary.total_records.toLocaleString()}</div><div class="stat-label">Total Records</div></div>
    <div class="stat-box"><div class="stat-num">${report.summary.cipher_types}</div><div class="stat-label">Cipher Types</div></div>
    <div class="stat-box"><div class="stat-num">${report.summary.languages.length}</div><div class="stat-label">Languages</div></div>
    <div class="stat-box"><div class="stat-num">${report.summary.blind_split}</div><div class="stat-label">Publicly Available Evaluation Records</div></div>
    <div class="stat-box"><div class="stat-num">${report.summary.historical_records}</div><div class="stat-label">Records Labeled Historical</div></div>
  </div>

  <p>This report inventories the published v0.6 archive. The <a href="../../cipher-corpus.html#corrected-corpus">corrected v0.8 dataset</a> has separate versioned statistics and verification notes.</p>
  <h2>Evaluation Status</h2>
  <p><strong>No solver accuracy has been measured for this report.</strong> Earlier human, automated-solver and LLM percentages were unsupported estimates, not benchmark results, and have been removed. Difficulty labels are curriculum metadata, not calibrated success probabilities.</p>
  <p>The downloadable “blind” split is public and includes answers. It is not confidential held-out data. Records labeled historical include teaching adaptations; the legacy verified flag does not establish source authenticity. See <a href="../corpus/README.md">dataset scope and errata</a>.</p>
  <h2>Record Counts by Difficulty</h2>
  <table>
    <thead><tr><th>Difficulty</th><th>Records</th></tr></thead>
    <tbody>${Object.entries(byDifficulty).map(([diff, recs]) => `<tr><td class="diff-${diff}">${diff}</td><td>${recs.length}</td></tr>`).join('')}</tbody>
  </table>

  <h2>Per-Cipher Statistics (Top 50 by Record Count)</h2>
  <p>“Mixed” means records of that cipher type carry more than one difficulty label. The JSON report includes each difficulty distribution.</p>
  <table>
    <thead><tr><th>Cipher Type</th><th>Family</th><th>Difficulty</th><th>Records</th><th>Avg plaintext symbols</th></tr></thead>
    <tbody>${htmlRows}</tbody>
  </table>

  <h2>Collection Sizes</h2>
  <p>These counts describe different collections and evaluation methods; they do not compare solver accuracy or historical authenticity.</p>
  <table>
    <thead><tr><th>Collection</th><th>Records</th><th>Cipher-type labels</th></tr></thead>
    <tbody>
      <tr><td><a href="https://arxiv.org/pdf/2504.19093" target="_blank" rel="noopener noreferrer">CipherBank (Li et al., 2025)</a></td><td>2,358</td><td>9</td></tr>
      <tr><td><a href="../../cipher-corpus.html">Cipher Corpus v0.6</a></td><td>${report.summary.total_records.toLocaleString()}</td><td>${report.summary.cipher_types}</td></tr>
    </tbody>
  </table>

  <h2>Citation</h2>
  <pre style="background:#222;color:#ffd700;padding:1em;border-radius:6px;overflow-x:auto">@dataset{clark_2026_23297920,
  author={Clark, Paul A.},
  title={Cipher Corpus v0.6: A Classical Cryptography Dataset},
  month={oct},
  year={2026},
  publisher={Zenodo},
  version={0.6},
  doi={10.5281/zenodo.23297920},
  url={https://doi.org/10.5281/zenodo.23297920}
}

@article{li2025cipherbank,
  title={CipherBank: Exploring the Boundary of LLM Reasoning Capabilities through Cryptography Challenges},
  author={Li, Yu and Pei, Qizhi and Sun, Mengyuan and Lin, Honglin and Ming, Chenlin and Gao, Xin and Wu, Jiang and He, Conghui and Wu, Lijun},
  journal={arXiv preprint arXiv:2504.19093},
  year={2025},
  url={https://arxiv.org/pdf/2504.19093}
}</pre>
</main>
<footer style="margin-top:3em;padding:2em 0 1em 0;text-align:center;color:var(--fg-muted,#bfa76a)">
  <div>Whether therefore ye eat, or drink, or whatsoever ye do, do all to the glory of God. — 1 Corinthians 10:31</div>
  <div style="margin-top:0.5em">&copy; Cipher Museum. Synthetic records CC0; historical records retain per-record rights and provenance.</div>
</footer>
</body>
</html>`;

const htmlPath = path.join(REPORTS_DIR, 'benchmark-baselines.html');
fs.writeFileSync(htmlPath, html);
console.log(`Benchmark HTML → ${htmlPath}`);
console.log(`Total: ${records.length} records, ${Object.keys(byCipherType).length} cipher types`);
