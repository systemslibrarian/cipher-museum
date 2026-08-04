#!/usr/bin/env node
/**
 * generate-benchmark-report.js
 * Generates per-cipher accuracy baseline reports from the Cipher Corpus.
 * Reports corpus statistics, difficulty distributions, and expected solver baselines.
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

const TODAY = '2026-04-27';

// Load corpus
const lines = fs.readFileSync(path.join(CORPUS_DIR, 'all.jsonl'), 'utf8').split('\n').filter(Boolean);
const records = lines.map(l => JSON.parse(l));

// Helper: group by key
function groupBy(arr, key) {
  return arr.reduce((acc, r) => { (acc[r[key]] = acc[r[key]] || []).push(r); return acc; }, {});
}

// Expected solver accuracy baselines from difficulty-calibration.json
const SOLVER_BASELINES = {
  beginner: { human: '95-100%', automated: '95-100%', llm_3shot: '80-95%', llm_0shot: '60-80%' },
  intermediate: { human: '60-90%', automated: '60-90%', llm_3shot: '40-70%', llm_0shot: '20-50%' },
  advanced: { human: '20-60%', automated: '20-60%', llm_3shot: '10-40%', llm_0shot: '5-20%' },
  expert: { human: '5-30%', automated: '5-30%', llm_3shot: '2-15%', llm_0shot: '1-5%' },
};

const byDifficulty = groupBy(records, 'difficulty');
const byCipherType = groupBy(records, 'cipher_type');
const byFamily = groupBy(records, 'cipher_family');
const byLanguage = groupBy(records, 'language');
const bySplit = groupBy(records, 'split');
const byQuality = groupBy(records, 'transcription_quality');

// Per-cipher stats
const cipherStats = Object.entries(byCipherType).map(([type, recs]) => {
  const difficulties = groupBy(recs, 'difficulty');
  const diff = Object.keys(difficulties)[0] || 'unknown';
  const baseline = SOLVER_BASELINES[diff] || {};
  const avgLen = Math.round(recs.reduce((s, r) => s + r.normalized_text_length, 0) / recs.length);
  const languages = [...new Set(recs.map(r => r.language))];

  return {
    cipher_type: type,
    cipher_family: recs[0].cipher_family,
    difficulty: diff,
    record_count: recs.length,
    public_count: (difficulties['public'] || recs.filter(r => r.split === 'public')).length,
    blind_count: recs.filter(r => r.split === 'blind').length,
    avg_normalized_length: avgLen,
    languages,
    expected_attacks: [...new Set(recs.flatMap(r => r.expected_attacks))].slice(0, 4),
    solver_baselines: baseline,
    verified_count: recs.filter(r => r.verified).length,
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
  version: '0.2',
  description: 'Cipher Corpus benchmark baseline statistics for solver evaluation',
  corpus_url: 'https://ciphermuseum.com/cipher-corpus.html',
  citation: {
    cipher_corpus: {
      title: 'Cipher Corpus: Comprehensive Classical Cryptanalysis Benchmark',
      author: 'Lester, Paul',
      year: 2026,
      url: 'https://ciphermuseum.com/cipher-corpus.html',
      note: '17,435+ test cases across 81+ cipher algorithms'
    },
    related_work: {
      title: 'CipherBank: Exploring the Boundary of LLM Reasoning Capabilities through Cryptography Challenges',
      authors: 'Li et al.',
      year: 2025,
      url: 'https://arxiv.org/pdf/2504.19093',
      note: 'Foundational benchmark establishing LLM cryptanalysis evaluation methodology'
    }
  },
  summary: {
    total_records: records.length,
    verified_records: records.filter(r => r.verified).length,
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
    description: 'Expected accuracy ranges for different solver types by difficulty tier',
    methodology: 'Estimated from cryptanalytic complexity, key space size, historical time-to-break, and LLM evaluation data',
    baselines: SOLVER_BASELINES,
  },
  per_cipher_stats: cipherStats,
  per_family_stats: familyStats,
  benchmark_splits: {
    public: {
      count: (bySplit.public || []).length,
      description: '70% of records — available for training and development evaluation',
      note: 'Do not train and evaluate on the same split'
    },
    blind: {
      count: (bySplit.blind || []).length,
      description: '30% of records — held-out for honest evaluation of trained solvers',
      note: 'Blind split should only be accessed during final evaluation'
    }
  },
  comparison_with_cipherbank: {
    cipherbank: { records: 2358, cipher_types: 9, historical: false, live_infrastructure: false, blind_splits: false },
    cipher_corpus: {
      records: records.length,
      cipher_types: Object.keys(byCipherType).length,
      historical: records.filter(r => r.source_type === 'historical').length,
      live_infrastructure: true,
      blind_splits: true,
      multilingual: Object.keys(byLanguage).length > 1,
    },
    note: 'Cipher Corpus extends the CipherBank methodology to a broader cipher set with historical records and live benchmark infrastructure.'
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
    <td>${s.avg_normalized_length}</td>
    <td>${s.solver_baselines.llm_3shot || '—'}</td>
    <td>${s.solver_baselines.llm_0shot || '—'}</td>
  </tr>`
).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cipher Corpus Benchmark Baselines</title>
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
<a href="#main-content" class="skip-link" style="position:absolute;left:-9999px;top:0;background:#ffd700;color:#000;padding:0.5em 1em;z-index:9999">Skip to main content</a>
<header>
  <nav>
    <a href="../../index.html">🏛️ Cipher Museum</a>
    <a href="../../cipher-corpus.html">Cipher Corpus</a>
    <a href="benchmark-baselines.html" aria-current="page">Benchmark Report</a>
  </nav>
</header>
<main>
  <h1>Cipher Corpus Benchmark Baselines</h1>
  <p style="color:var(--fg-muted,#bfa76a)">Generated ${TODAY} · v0.2 · <a href="/public/reports/benchmark-baselines.json">Download JSON</a></p>

  <div>
    <div class="stat-box"><div class="stat-num">${report.summary.total_records.toLocaleString()}</div><div class="stat-label">Total Records</div></div>
    <div class="stat-box"><div class="stat-num">${report.summary.cipher_types}</div><div class="stat-label">Cipher Types</div></div>
    <div class="stat-box"><div class="stat-num">${report.summary.languages.length}</div><div class="stat-label">Languages</div></div>
    <div class="stat-box"><div class="stat-num">${report.summary.blind_split}</div><div class="stat-label">Blind Split Records</div></div>
    <div class="stat-box"><div class="stat-num">${report.summary.historical_records}</div><div class="stat-label">Historical Records</div></div>
  </div>

  <h2>Expected Solver Accuracy by Difficulty</h2>
  <table>
    <thead><tr><th>Difficulty</th><th>Records</th><th>Human Expert</th><th>Automated Solver</th><th>LLM 3-Shot</th><th>LLM 0-Shot Challenge</th></tr></thead>
    <tbody>
      ${Object.entries(SOLVER_BASELINES).map(([diff, b]) =>
        `<tr><td class="diff-${diff}">${diff}</td><td>${(byDifficulty[diff]||[]).length}</td><td>${b.human}</td><td>${b.automated}</td><td>${b.llm_3shot}</td><td>${b.llm_0shot}</td></tr>`
      ).join('\n')}
    </tbody>
  </table>

  <h2>Per-Cipher Statistics (Top 50 by Record Count)</h2>
  <table>
    <thead><tr><th>Cipher Type</th><th>Family</th><th>Difficulty</th><th>Records</th><th>Avg Length</th><th>LLM 3-Shot</th><th>LLM 0-Shot</th></tr></thead>
    <tbody>${htmlRows}</tbody>
  </table>

  <h2>Comparison with CipherBank</h2>
  <table>
    <thead><tr><th>Benchmark</th><th>Records</th><th>Algorithms</th><th>Historical</th><th>Blind Splits</th><th>Multilingual</th></tr></thead>
    <tbody>
      <tr><td><a href="https://arxiv.org/pdf/2504.19093" target="_blank" rel="noopener noreferrer">CipherBank (Li et al., 2025)</a></td><td>2,358</td><td>9</td><td>No</td><td>No</td><td>No</td></tr>
      <tr><td><strong><a href="../../cipher-corpus.html">Cipher Corpus v0.2</a></strong></td><td><strong>${report.summary.total_records.toLocaleString()}</strong></td><td><strong>${report.summary.cipher_types}</strong></td><td><strong>Yes (${report.summary.historical_records})</strong></td><td><strong>Yes (${report.summary.blind_split})</strong></td><td><strong>Yes (${report.summary.languages.length} langs)</strong></td></tr>
    </tbody>
  </table>

  <h2>Citation</h2>
  <pre style="background:#222;color:#ffd700;padding:1em;border-radius:6px;overflow-x:auto">@misc{lester2026cipherCorpus,
  title={Cipher Corpus: Comprehensive Classical Cryptanalysis Benchmark},
  author={Lester, Paul},
  year={2026},
  url={https://ciphermuseum.com/cipher-corpus.html},
  note={${report.summary.total_records}+ test cases across ${report.summary.cipher_types}+ cipher algorithms}
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
  <div style="margin-top:0.5em">&copy; Cipher Museum. Synthetic records CC0.</div>
</footer>
</body>
</html>`;

const htmlPath = path.join(REPORTS_DIR, 'benchmark-baselines.html');
fs.writeFileSync(htmlPath, html);
console.log(`Benchmark HTML → ${htmlPath}`);
console.log(`Total: ${records.length} records, ${Object.keys(byCipherType).length} cipher types`);
