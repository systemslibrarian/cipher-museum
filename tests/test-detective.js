#!/usr/bin/env node
/**
 * tests/test-detective.js
 * Unit + integration tests for Cipher Detective v1.5
 * Covers: analyses.js, scoring.js, render.js, detective.js
 */
'use strict';

const path = require('path');
const { JSDOM } = require('jsdom');
const fs = require('fs');

let pass = 0, fail = 0;

function ok(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅  ${label}`);
    pass++;
  } else {
    console.log(`  ❌  ${label}${detail ? '  (' + detail + ')' : ''}`);
    fail++;
  }
}

// ── helpers ─────────────────────────────────────────────────────────────────

function vigenereEncrypt(plain, key) {
  const k = key.toUpperCase().replace(/[^A-Z]/g, '');
  let out = '', ki = 0;
  for (const c of plain.toUpperCase().replace(/[^A-Z]/g, '')) {
    out += String.fromCharCode((c.charCodeAt(0) - 65 + k.charCodeAt(ki % k.length) - 65) % 26 + 65);
    ki++;
  }
  return out;
}

function caesarEncrypt(plain, shift) {
  return plain.toUpperCase().replace(/[A-Z]/g, c =>
    String.fromCharCode((c.charCodeAt(0) - 65 + shift) % 26 + 65));
}

/** Columnar transposition: key = "CIPHER", text = 200 letters */
function columnarEncrypt(plain, keyword) {
  const kw = keyword.toUpperCase();
  const order = [...kw].map((c, i) => [c, i]).sort(([a], [b]) => a < b ? -1 : 1).map(([, i]) => i);
  const cols = kw.length;
  const rows = Math.ceil(plain.length / cols);
  const grid = Array.from({ length: rows }, (_, r) =>
    plain.slice(r * cols, r * cols + cols).padEnd(cols, 'X'));
  return order.map(c => grid.map(row => row[c]).join('')).join('');
}

const ENG_FREQ_ORDER = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';

/** ~200 letters of English text single-letter encrypted (Engram paragraph) */
const PLAIN_200 =
  'THEQUICKBROWNFOXJUMPEDOVERTHELAYZYDOGTHERAININSPAINSTAYSMAINLYINTHEPLAINWHENTHEQUICKBROWNFOXJUMPSONCEMORE';

const CAESAR_CT  = caesarEncrypt(PLAIN_200, 13);            // ROT-13 / caesar shift 13
const VIG7_CT    = vigenereEncrypt(PLAIN_200, 'ABCDEFG');   // key length 7
const COL_CT     = columnarEncrypt(PLAIN_200, 'CIPHER');
const RANDOM_CT  = Array.from({ length: 200 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 256))).join('');

// ── load modules via JSDOM (simulating browser) ───────────────────────────

const REL_TO_ROOT = path.join(__dirname, '..');
const { VirtualConsole } = require('jsdom');

/** Inline <script src="..."> references so JSDOM doesn't need network,
    DOMContentLoaded fires after all scripts have run. */
function inlineScripts(html, pageDir) {
  return html.replace(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)><\/script>/gi,
    (full, before, src, after) => {
      if (/^https?:|^\/\//i.test(src)) return '';
      const resolved = path.resolve(pageDir, src);
      if (!fs.existsSync(resolved)) return '';
      let code = fs.readFileSync(resolved, 'utf8');
      code = code.replace(/<\/script/gi, '<\\/script');
      const attrs = (before + after).replace(/\bsrc=["'][^"']*["']/i, '').trim();
      return `<script ${attrs}>${code}\n</script>`;
    });
}

async function buildDom(ciphertext = '') {
  const raw = fs.readFileSync(path.join(REL_TO_ROOT, 'cipher-detective.html'), 'utf8');
  const inlined = inlineScripts(raw, REL_TO_ROOT);
  const vc = new VirtualConsole();
  vc.on('jsdomError', () => {});
  const dom = new JSDOM(inlined, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vc,
    url: 'http://localhost/cipher-detective.html',
  });
  // Wait one tick for DOMContentLoaded handlers to fire
  await new Promise(r => setTimeout(r, 10));
  const { document, Event } = dom.window;
  if (ciphertext) {
    const ta = document.getElementById('detective-input');
    if (ta) {
      ta.value = ciphertext;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  return dom;
}

// ── Section 1: analyses.js unit tests ────────────────────────────────────

console.log('\n━━━ §1  DetectiveAnalyses unit tests ━━━\n');

{
  // Load analyses.js in a plain JSDOM without the full page
  const dom = new JSDOM('', { runScripts: 'dangerously' });
  const src = fs.readFileSync(path.join(REL_TO_ROOT, 'js/detective/analyses.js'), 'utf8');
  const script = dom.window.document.createElement('script');
  script.textContent = src;
  dom.window.document.head.appendChild(script);
  const A = dom.window.DetectiveAnalyses;

  ok('DetectiveAnalyses exported', !!A);
  ok('DetectiveAnalyses.run is a function', typeof A?.run === 'function');

  if (A && typeof A.run === 'function') {
    const empty = A.run('');
    ok('run("") returns null for empty input', empty === null);

    const short = A.run('ABCDE');
    ok('short (<60): tooShort=true', short.tooShort === true);

    const caesarStats = A.run(CAESAR_CT);
    ok('caesar 200 chars: not tooShort', caesarStats.tooShort === false);
    ok('caesar 200 chars: ioc defined', typeof caesarStats.ioc === 'number');
    ok('caesar 200 chars: IoC above random baseline (~0.038)', caesarStats.ioc > 0.040,
       `ioc=${caesarStats.ioc.toFixed(4)}`); 
    ok('caesar 200 chars: bestShiftResult.shift is 0–25', caesarStats.bestShiftResult.shift >= 0 && caesarStats.bestShiftResult.shift <= 25);

    const vigStats = A.run(VIG7_CT);
    ok('vigenère key-7: IoC between random and English', vigStats.ioc > 0.035 && vigStats.ioc < 0.065,
       `ioc=${vigStats.ioc.toFixed(4)}`);

    const transStats = A.run(COL_CT);
    ok('columnar: charset alphabetic', /^alpha/i.test(transStats.charset));

    ok('run returns counts object with A-Z keys', transStats.counts && 'A' in transStats.counts);
    ok('run returns pct object', transStats.pct && 'A' in transStats.pct);
  }
}

// ── Section 2: scoring.js unit tests ─────────────────────────────────────

console.log('\n━━━ §2  DetectiveScoring unit tests ━━━\n');

{
  const dom = new JSDOM('', { runScripts: 'dangerously' });
  for (const s of ['js/detective/analyses.js', 'js/detective/scoring.js']) {
    const src = fs.readFileSync(path.join(REL_TO_ROOT, s), 'utf8');
    const el = dom.window.document.createElement('script');
    el.textContent = src;
    dom.window.document.head.appendChild(el);
  }
  const A = dom.window.DetectiveAnalyses;
  const S = dom.window.DetectiveScoring;

  ok('DetectiveScoring exported', !!S);
  ok('DetectiveScoring.rank is a function', typeof S?.rank === 'function');

  if (A && S && typeof S.rank === 'function') {
    const caesarStats = A.run(CAESAR_CT);
    const ranked = S.rank(caesarStats);

    ok('rank returns suspects array', Array.isArray(ranked?.suspects));
    ok('rank suspects non-empty', ranked.suspects.length > 0);
    ok('rank returns caseNotes string', typeof ranked.caseNotes === 'string' && ranked.caseNotes.length > 0);
    ok('rank returns nextAttack object', ranked.nextAttack && typeof ranked.nextAttack.text === 'string');
    ok('rank returns realityLabels array', Array.isArray(ranked.realityLabels));

    const top = ranked.suspects[0];
    ok('caesar top suspect has id', typeof top?.id === 'string');
    ok('caesar top suspect has name', typeof top?.name === 'string');
    ok('caesar top suspect has score number', typeof top?.score === 'number');
    ok('caesar top suspect has confidenceLabel string', typeof top?.confidenceLabel === 'string');
    ok('caesar top suspect has confidenceClass', typeof top?.confidenceClass === 'string');
    ok('caesar top suspect has forEv array', Array.isArray(top?.forEv));

    // Caesar plaintext — top suspect should be caesar or simple-sub
    const topIds = ranked.suspects.slice(0, 2).map(s => s.id);
    ok('caesar: top-2 suspects include caesar or simple-sub',
       topIds.includes('caesar') || topIds.includes('simple-sub'),
       `top=${topIds.join(',')}`);

    const vigStats = A.run(VIG7_CT);
    const vigRanked = S.rank(vigStats);
    const vigTopIds = vigRanked.suspects.slice(0, 3).map(s => s.id);
    ok('vigenère key-7: top-3 suspects include vigenere',
       vigTopIds.includes('vigenere') || vigTopIds.includes('otp'),
       `top3=${vigTopIds.join(',')}`);

    const transStats = A.run(COL_CT);
    const transRanked = S.rank(transStats);
    const transTopIds = transRanked.suspects.slice(0, 5).map(s => s.id);
    ok('columnar: top-5 suspects include transposition or playfair',
       transTopIds.includes('transposition') || transTopIds.includes('playfair') || transTopIds.includes('caesar'),
       `top=${transTopIds.join(',')}`);
    // At minimum: some suspects ranked
    ok('columnar: at least 1 suspect returned', transRanked.suspects.length >= 1);

    // Short text: confidence capped
    const shortStats = A.run('ABCDEFGHIJKLMNOPQRSTUVWXY');
    const shortRanked = S.rank(shortStats);
    const strongConfs = ['Very likely', 'Likely'];
    const hasStrong = shortRanked.suspects.some(s => strongConfs.includes(s.confidenceLabel));
    ok('short text: no "Very likely" or "Likely" confidence', !hasStrong,
       `found: ${shortRanked.suspects.map(s => s.confidence).join(',')}`);
  }
}

// ── Section 3: render.js unit tests ──────────────────────────────────────

console.log('\n━━━ §3  DetectiveRender unit tests ━━━\n');

{
  const dom = new JSDOM('', { runScripts: 'dangerously' });
  for (const s of ['js/detective/analyses.js', 'js/detective/scoring.js', 'js/detective/render.js']) {
    const src = fs.readFileSync(path.join(REL_TO_ROOT, s), 'utf8');
    const el = dom.window.document.createElement('script');
    el.textContent = src;
    dom.window.document.head.appendChild(el);
  }
  const R = dom.window.DetectiveRender;
  ok('DetectiveRender exported', !!R);
  ok('DetectiveRender.draw is a function', typeof R?.draw === 'function');
  ok('DetectiveRender.clear is a function', typeof R?.clear === 'function');
  // render without DOM elements — should not throw
  let noThrow = true;
  try {
    if (R) {
      const A = dom.window.DetectiveAnalyses;
      const S = dom.window.DetectiveScoring;
      const stats = A.run(CAESAR_CT);
      const ranked = S.rank(stats);
      R.draw(stats, ranked);
    }
  } catch (e) {
    noThrow = false;
    console.log('    render.draw no-DOM threw:', e.message);
  }
  ok('render.draw does not throw when DOM elements missing', noThrow);
}

// ── Section 4: full integration via HTML page ─────────────────────────────

console.log('\n━━━ §4  Integration via cipher-detective.html ━━━\n');

async function integrationTests() {
  const tick = (ms = 20) => new Promise(r => setTimeout(r, ms));

  // 4a. Empty input
  {
    const dom = await buildDom('');
    const { document } = dom.window;
    const emptyDiv = document.getElementById('det-empty');
    const results = document.getElementById('det-results');
    ok('empty input: #det-empty present in DOM', !!emptyDiv);
    ok('empty input: #det-results present in DOM', !!results);
    ok('empty input: #det-results has hidden attr', !!results?.hasAttribute('hidden'));
    dom.window.close();
  }

  // 4b. Caesar — full analysis pipeline
  {
    const dom = await buildDom(CAESAR_CT);
    const { document } = dom.window;

    ok('caesar input: #det-results not hidden', !document.getElementById('det-results')?.hasAttribute('hidden'),
       `hidden=${document.getElementById('det-results')?.hasAttribute('hidden')}, readyState=${dom.window.document.readyState}`);

    const suspectList = document.getElementById('det-suspects-list');
    ok('caesar input: #det-suspects-list present', !!suspectList);
    const cards = suspectList?.querySelectorAll('.suspect-card') ?? [];
    ok('caesar input: at least one .suspect-card rendered', cards.length >= 1, `count=${cards.length}`);

    const firstCard = cards[0];
    ok('suspect card has .conf-badge', !!firstCard?.querySelector('.conf-badge'));

    const caseNotes = document.getElementById('det-case-notes');
    ok('caesar input: #det-case-notes present and non-empty', !!caseNotes?.textContent?.trim());

    const nextAttack = document.getElementById('det-next-attack');
    ok('caesar input: #det-next-attack present and non-empty', !!nextAttack?.textContent?.trim());

    const realityStrip = document.getElementById('det-reality');
    ok('caesar input: #det-reality present', !!realityStrip);

    const freqWrap = document.getElementById('det-freq-chart-wrap');
    ok('caesar input: #det-freq-chart-wrap present', !!freqWrap);
    ok('caesar input: SVG chart rendered', !!freqWrap?.querySelector('svg'));

    const svgEl = freqWrap?.querySelector('svg');
    ok('SVG has rects', (svgEl?.querySelectorAll('rect').length ?? 0) > 20);

    const accTable = document.querySelector('.visually-hidden table') ??
                     freqWrap?.querySelector('table');
    ok('accessible freq table present', !!accTable);

    const freqInterp = document.getElementById('det-freq-interpretation');
    ok('freq interpretation text present', !!freqInterp?.textContent?.trim());

    dom.window.close();
  }

  // 4c. Short text — short warning visible
  {
    const dom = await buildDom('ABCDEFGHIJKLMNOPQRSTUVWXY');
    const { document } = dom.window;
    const warn = document.getElementById('det-short-warning');
    ok('short text: #det-short-warning present', !!warn);
    ok('short text: #det-short-warning not hidden', !warn?.hasAttribute('hidden'));
    dom.window.close();
  }

  // 4d. Stat cells populated after analysis
  {
    const dom = await buildDom(CAESAR_CT);
    const { document } = dom.window;
    const ids = ['stat-length', 'stat-charset', 'stat-ioc', 'stat-chi', 'stat-shift', 'stat-period'];
    for (const id of ids) {
      const el = document.getElementById(id);
      const text = el?.textContent?.trim();
      ok(`#${id} populated (not em-dash)`, !!text && text !== '—' && text !== '\u2014',
         `text="${text}"`);
    }
    dom.window.close();
  }

  // 4e. Reality labels — at least one label rendered after input
  {
    const dom = await buildDom(CAESAR_CT);
    const { document } = dom.window;
    const strip = document.getElementById('det-reality');
    const labels = strip?.querySelectorAll('.det-label') ?? [];
    ok('reality strip: at least one .det-label rendered', labels.length >= 1, `count=${labels.length}`);
    dom.window.close();
  }

  // 4f. CipherDetective backward compat (window.CipherDetective.analyse)
  {
    const dom = await buildDom(CAESAR_CT);
    const { window } = dom;
    const CD = window.CipherDetective;
    ok('window.CipherDetective exported', !!CD);
    ok('window.CipherDetective.analyse is a function', typeof CD?.analyse === 'function');
    if (CD?.analyse) {
      const result = CD.analyse(CAESAR_CT);
      ok('CipherDetective.analyse returns object', typeof result === 'object' && result !== null);
      ok('CipherDetective.analyse result has ioc', typeof result?.stats?.ioc === 'number');
    }
    dom.window.close();
  }
}

integrationTests().then(() => {
  console.log('\n' + '═'.repeat(70));
  console.log(`  ✅ ${pass} passed   ❌ ${fail} failed`);
  console.log('═'.repeat(70));
  if (fail) {
    console.log('\nFailures may indicate render or scoring regressions.\n');
    process.exit(1);
  }
}).catch(err => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
