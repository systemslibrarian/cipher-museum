#!/usr/bin/env node
/**
 * build-search-index.js
 * Generates js/search-index.json by parsing every HTML page in the site.
 *
 * Usage:  node scripts/build-search-index.js
 * Output: js/search-index.json
 *
 * Covered:
 *   ciphers/*.html  → cipher | exhibit | unsolved | person  (by hall/badge heuristics)
 *   halls/*.html    → hall
 *   top-level pages → page  (explicit inclusion list; index.html and search.html excluded)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT  = path.join(ROOT, 'js', 'search-index.json');

// ── HTML entity decoder ───────────────────────────────────────────────────────

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#39;': "'", '&apos;': "'", '&nbsp;': ' ',
  '&ndash;': '–', '&mdash;': '—', '&middot;': '·',
  '&rsaquo;': '›', '&raquo;': '»', '&laquo;': '«',
  '&hellip;': '…', '&larr;': '←', '&rarr;': '→',
  '&times;': '×', '&copy;': '©',
};

function decodeEntities(str) {
  return str
    .replace(/&[a-z]+;|&#\d+;/gi, e => {
      if (ENTITIES[e]) return ENTITIES[e];
      const n = e.match(/&#(\d+);/);
      return n ? String.fromCharCode(parseInt(n[1], 10)) : '';
    });
}

// ── HTML extraction helpers (regex — no DOM dependency) ──────────────────────

// Use quote-aware patterns so apostrophes inside content="..." don't truncate
function extractMeta(html, name) {
  const pats = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content="([^"]+)"`, 'i'),
    new RegExp(`<meta[^>]+content="([^"]+)"[^>]+name=["']${name}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content='([^']+)'`, 'i'),
    new RegExp(`<meta[^>]+content='([^']+)'[^>]+name=["']${name}["']`, 'i'),
  ];
  for (const p of pats) {
    const m = html.match(p);
    if (m) return decodeEntities(m[1].trim());
  }
  return '';
}

function extractTag(html, selector) {
  // selector is a class name like "page-title", "page-eyebrow"
  const m = html.match(new RegExp(`class=["'][^"']*${selector}[^"']*["'][^>]*>([^<]+)`, 'i'));
  return m ? decodeEntities(m[1].trim().replace(/\s+/g, ' ')) : '';
}

function extractBreadcrumbHall(html) {
  // Breadcrumb has: Entrance › <a href="../halls/X.html">Hall Name</a> › Page
  // We want the second anchor — the hall link
  const bcBlock = html.match(/<div[^>]+class=["'][^"']*breadcrumb[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (!bcBlock) return { name: '', href: '' };
  const links = [...bcBlock[1].matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi)];
  // Find the hall link (href contains /halls/)
  const hallLink = links.find(l => /halls\//i.test(l[1]));
  if (!hallLink) return { name: '', href: '' };
  return {
    href: hallLink[1],
    name: decodeEntities(hallLink[2].trim().replace(/\s+/g, ' ')),
  };
}

function extractFirstBadge(html, classPrefix) {
  const m = html.match(new RegExp(`<span[^>]+class=["'][^"']*${classPrefix}[^"']*["'][^>]*>([^<]+)<\/span>`, 'i'));
  return m ? decodeEntities(m[1].trim().replace(/\s+/g, ' ')) : '';
}

function extractFirstBadgeClass(html, classPrefix) {
  const m = html.match(new RegExp(`<span[^>]+class=["']([^"']*${classPrefix}[^"']*)["']`, 'i'));
  return m ? m[1] : '';
}

function extractAllBadgeKeywords(html, classPrefix, mapper) {
  const re = new RegExp(`<span[^>]+class=["']([^"']*${classPrefix}[^"']*)["'][^>]*>([^<]+)<\/span>`, 'gi');
  const results = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const kw = mapper(m[1], m[2].trim());
    if (kw && !results.includes(kw)) results.push(kw);
  }
  return results;
}

// ── era badge class → short keyword ──────────────────────────────────────────

const ERA_MAP = {
  'era-ancient':      'ancient',
  'era-medieval':     'medieval',
  'era-renaissance':  'renaissance',
  'era-early-modern': 'early modern',
  'era-modern':       'modern',
  'era-wwi':          'wwi',
  'era-wwii':         'wwii',
  'era-coldwar':      'cold war',
  'era-digital':      'digital',
};

function eraKeyword(cls) {
  for (const [k, v] of Object.entries(ERA_MAP)) {
    if (cls.includes(k)) return v;
  }
  return null;
}

// Derive era keyword from badge text — more reliable than CSS class
function eraKeywordFromText(t) {
  if (!t) return null;
  const s = t.toLowerCase();
  if (/wwii|world war ii|\b194[0-5]\b|pacific war/i.test(t)) return 'wwii';
  if (/wwi|world war i\b|\b191[4-8]\b/i.test(t))             return 'wwi';
  if (/cold war|\b195\d\b|\b196\d\b|\b197\d\b|\b198\d\b/i.test(t)) return 'cold war';
  if (/interwar|\b192\d\b|\b193\d\b/i.test(t))                return 'interwar';
  if (/digital|\b199\d\b|\b20\d\d\b/i.test(t))                return 'digital';
  if (/modern.*\b18\d\d\b|\b18\d\d\b.*modern/i.test(t))       return 'modern';
  if (/renaissance|\b1[45]\d\d\b/i.test(t))                   return 'renaissance';
  if (/medieval|middle ages|\b1[0-3]\d\d\b/i.test(t))         return 'medieval';
  if (/ancient|bc\b|bce\b/i.test(t))                          return 'ancient';
  return null;
}

// ── kind classifier for ciphers/ pages ───────────────────────────────────────

function classifyKind(hallHref, secText) {
  if (/codebreakers/i.test(hallHref))   return 'person';
  if (/unsolved/i.test(hallHref))       return 'unsolved';
  if (/biography/i.test(secText))       return 'person';
  if (/unsolved/i.test(secText))        return 'unsolved';
  if (/puzzle|novelty/i.test(hallHref)) return 'exhibit';
  if (secText)                          return 'cipher';
  return 'exhibit';
}

// ── strip "Hall N: " prefix for compact display ───────────────────────────────

function shortHall(name) {
  return name.replace(/^Hall\s+[IVXLCDM\d]+[a-z]?:\s*/i, '').trim() || name;
}

// ── tag deduplication ─────────────────────────────────────────────────────────

function buildTags(...items) {
  const tags = [];
  for (const s of items) {
    if (!s || s === '—') continue;
    const t = s.trim().toLowerCase();
    if (t && t.length < 60 && !tags.includes(t)) tags.push(t);
  }
  return tags;
}

// ── process ciphers/*.html ────────────────────────────────────────────────────

function processCipherPage(file) {
  const html  = fs.readFileSync(file, 'utf8');
  const slug  = path.basename(file);

  const title = extractTag(html, 'page-title');
  if (!title) return null;

  const summary  = extractMeta(html, 'description');
  const hall     = extractBreadcrumbHall(html);
  const hallDisp = shortHall(hall.name);

  const eraCls  = extractFirstBadgeClass(html, 'era-');
  const eraText = extractFirstBadge(html, 'era-');
  // Derive era keyword: prefer text content (reliable) over CSS class (can be mismatched)
  const eraKw   = eraKeywordFromText(eraText) || eraKeyword(eraCls);

  const secText = extractFirstBadge(html, 'sec-');
  const kind    = classifyKind(hall.href, secText);
  const tags    = buildTags(eraKw, hallDisp, secText);

  return {
    t: title,
    u: 'ciphers/' + slug,
    k: kind,
    h: hallDisp || '—',
    c: eraText  || '—',
    b: secText  || '—',
    s: summary,
    g: tags,
  };
}

// ── process halls/*.html ──────────────────────────────────────────────────────

function processHallPage(file) {
  const html  = fs.readFileSync(file, 'utf8');
  const slug  = path.basename(file);

  const title = extractTag(html, 'page-title');
  if (!title) return null;

  const summary = extractMeta(html, 'description');
  const eyebrow = extractTag(html, 'page-eyebrow');

  const eraKws = extractAllBadgeKeywords(html, 'era-', (cls) => eraKeyword(cls));
  const tags   = ['hall', ...eraKws.slice(0, 5)];

  return {
    t: title,
    u: 'halls/' + slug,
    k: 'hall',
    h: '—',
    c: eyebrow || '—',
    b: '—',
    s: summary,
    g: tags,
  };
}

// ── process top-level pages ───────────────────────────────────────────────────

// Explicit inclusion list — index.html (homepage) and search.html excluded
const TOP_LEVEL = [
  'museum-map.html',
  'timeline.html',
  'learn.html',
  'cryptanalysis.html',
  'challenges.html',
  'glossary.html',
  'modern.html',
  'comparison.html',
  'cipher-corpus.html',
  'cipher-detective.html',
  'further-reading.html',
  'popular-culture-survey.html',
  'teaching.html',
  'my-path.html',
];

function processTopPage(file) {
  const html  = fs.readFileSync(file, 'utf8');
  const slug  = path.basename(file);

  const title = extractTag(html, 'page-title')
             || (html.match(/<title>([^<|]+)/) || [])[1]?.trim() || '';
  if (!title) return null;

  const summary = extractMeta(html, 'description');
  const eyebrow = extractTag(html, 'page-eyebrow');

  // Tags from pill badges (corpus page, etc.) — keep short ones
  const tags = [];
  const pillRe = /<span[^>]+class=["'][^"']*\bpill\b[^"']*["'][^>]*>([^<]+)<\/span>/gi;
  let m;
  while ((m = pillRe.exec(html)) !== null) {
    const t = decodeEntities(m[1].trim()).toLowerCase();
    if (t && t.length < 40 && !tags.includes(t)) tags.push(t);
  }

  return {
    t: title,
    u: slug,
    k: 'page',
    h: '—',
    c: eyebrow || '—',
    b: '—',
    s: summary,
    g: tags.slice(0, 8),
  };
}

// ── main ──────────────────────────────────────────────────────────────────────

function main() {
  const entries  = [];
  const warnings = [];

  // 1. Cipher exhibit pages
  const cipherFiles = fs.readdirSync(path.join(ROOT, 'ciphers'))
    .filter(f => f.endsWith('.html'))
    .sort();

  for (const f of cipherFiles) {
    const entry = processCipherPage(path.join(ROOT, 'ciphers', f));
    if (entry) {
      entries.push(entry);
    } else {
      warnings.push('  skip (no h1.page-title): ciphers/' + f);
    }
  }

  // 2. Hall pages
  const hallFiles = fs.readdirSync(path.join(ROOT, 'halls'))
    .filter(f => f.endsWith('.html'))
    .sort();

  for (const f of hallFiles) {
    const entry = processHallPage(path.join(ROOT, 'halls', f));
    if (entry) {
      entries.push(entry);
    } else {
      warnings.push('  skip (no h1.page-title): halls/' + f);
    }
  }

  // 3. Top-level pages
  for (const f of TOP_LEVEL) {
    const file = path.join(ROOT, f);
    if (!fs.existsSync(file)) {
      warnings.push('  skip (file not found): ' + f);
      continue;
    }
    const entry = processTopPage(file);
    if (entry) {
      entries.push(entry);
    } else {
      warnings.push('  skip (no title): ' + f);
    }
  }

  // Write
  const out = {
    version:   1,
    generated: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    entries,
  };
  fs.writeFileSync(OUT, JSON.stringify(out));

  // Report
  const kinds = {};
  for (const e of entries) kinds[e.k] = (kinds[e.k] || 0) + 1;
  console.log(`js/search-index.json — ${entries.length} entries`);
  for (const [k, v] of Object.entries(kinds).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }
  if (warnings.length) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(w));
  }
}

main();
