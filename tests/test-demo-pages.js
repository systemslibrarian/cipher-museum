#!/usr/bin/env node
/**
 * THE CIPHER MUSEUM — Interactive Demo Simulation (end-to-end)
 *
 * For every cipher exhibit page:
 *   1. Read the page HTML.
 *   2. Inline every local <script src="..."> reference (demo-loader.js,
 *      all-engines.js, per-page helpers) so JSDOM doesn't need network.
 *   3. Escape any literal "</script>" inside the inlined JS so the HTML
 *      parser doesn't terminate the <script> block prematurely.
 *   4. Load with runScripts:'dangerously' so DOMContentLoaded fires and
 *      demo-loader.js builds the demo UI.
 *   5. Wait for one event-loop tick, then click Encrypt → capture cipher,
 *      click Decrypt on that cipher → verify lossless roundtrip via the
 *      actual on-page buttons. This proves the END-TO-END demo works the
 *      way a museum visitor experiences it.
 *
 * Run:  node tests/test-demo-pages.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const REPO = path.resolve(__dirname, '..');
const CIPHERS_DIR = path.join(REPO, 'ciphers');
const ARTIFACT_DATA = path.join(REPO, 'js', 'artifact-cards-data.js');
const ARTIFACT_RENDER = path.join(REPO, 'js', 'artifact-cards.js');

let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) pass++;
  else { fail++; const m = `❌  ${name}` + (detail ? `  →  ${detail}` : ''); failures.push(m); console.log('  ' + m); }
}
function pad(s, n) { return (s + ' '.repeat(n)).slice(0, n); }
function letters(s) { return (s || '').toUpperCase().replace(/[^A-Z]/g, ''); }
function lettersIJ(s) { return letters(s).replace(/J/g, 'I'); }
const tick = (ms = 30) => new Promise(r => setTimeout(r, ms));

/** Inline local <script src="..."> tags so JSDOM doesn't need network. */
function inlineScripts(html, pageDir, extraScripts = []) {
  html = html.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi, '');
  html = html.replace(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)><\/script>/gi,
    (full, before, src, after) => {
      if (/^https?:|^\/\//i.test(src)) return '';
      const resolved = path.resolve(pageDir, src);
      if (!fs.existsSync(resolved)) return '';
      let code = fs.readFileSync(resolved, 'utf8');
      // Escape </script> inside JS comments/strings so HTML parser doesn't
      // terminate the inlined <script> block prematurely.
      code = code.replace(/<\/script/gi, '<\\/script');
      const attrs = (before + after).replace(/\bsrc=["'][^"']*["']/i, '').trim();
      return `<script ${attrs}>${code}\n</script>`;
    });
  // Append any extra <script>…</script> blocks just before </body>.
  if (extraScripts.length) {
    const blob = extraScripts.map(p => {
      let code = fs.readFileSync(p, 'utf8');
      code = code.replace(/<\/script/gi, '<\\/script');
      return `<script>${code}\n</script>`;
    }).join('\n');
    if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, blob + '</body>');
    else html += blob;
  }
  return html;
}

async function loadPage(file, extraScripts = []) {
  const raw = fs.readFileSync(file, 'utf8');
  const inlined = inlineScripts(raw, path.dirname(file), extraScripts);
  const vc = new VirtualConsole();
  vc.on('jsdomError', () => { /* swallow */ });
  const rel = path.relative(REPO, file).replace(/\\/g, '/');
  const dom = new JSDOM(inlined, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vc,
    url: 'http://localhost/' + rel
  });
  await tick();
  return dom;
}

async function loadCipherPageWithArtifact(file, extraScripts = []) {
  const scriptList = [];
  if (fs.existsSync(ARTIFACT_DATA)) scriptList.push(ARTIFACT_DATA);
  if (fs.existsSync(ARTIFACT_RENDER)) scriptList.push(ARTIFACT_RENDER);
  return loadPage(file, scriptList.concat(extraScripts));
}

const NON_ROUNDTRIP = new Set([
  'navajo-code-talkers', 'voynich', 'beale', 'dictionary-code',
  'great-cipher', 'babington', 'copiale', 'homophonic'
]);
const IJ_MERGE = new Set([
  'playfair', 'bifid', 'foursquare', 'twosquare',
  'polybius', 'nihilist', 'adfgx', 'vic', 'bacon'
]);
const HAND_BUILT = new Set(['caesar.html', 'playfair.html', 'vigenere.html', 'zodiac.html',
  // Round 3 Track B (visualization-only widgets, no demo-loader CONFIG):
  'egyptian-substitution.html', 'rosetta-stone.html', 'histiaeus-tattoo.html',
  // Round 3 Stage 3 — Hall XII Unsolved + Hall XIII Culture (all Track B):
  'phaistos-disc.html', 'shugborough.html', 'dagapeyeff.html', 'somerton-man.html', 'mccormick.html',
  'bach-motif.html', 'dancing-men.html', 'gold-bug.html', 'cicada-3301.html', 'krypto-arg.html',
  'mit-mystery-hunt.html', 'sator-square.html', 'freemason-pigpen.html',
  // Phase 8 — Track B audio/visualization exhibits:
  'field-hollers.html',
  // Phase 9+ — hand-built analytics + flagship simulation:
  'bible-code.html', 'enigma.html']);
// Pure-content modern-crypto, unsolved pages, and biography pages with no interactive demo:
const STATIC_PAGES = new Set(['aes.html', 'des.html', 'diffie-hellman.html',
  'dorabella.html', 'rsa.html', 'sha256.html', 'cipher-detective.html',
  // Biography / historical narrative pages:
  'beurling.html', 'cabinet-noir.html', 'da-vinci-code.html', 'dilly-knox.html', 'dunin.html',
  'gchq-trio.html', 'gravity-falls.html', 'kahn.html', 'kerckhoffs.html', 'lasry.html',
  'mavis-batey.html', 'microdot.html', 'national-treasure.html', 'rochefort.html',
  'sigsaly.html', 'yardley.html',
  // Phase 12 biographies:
  'agnes-driscoll.html', 'bill-tutte.html', 'elizebeth-friedman.html',
  'joan-clarke.html', 'leo-marks.html',
  // Track B visualization pages:
'mary-stuart-castelnau-letters.html', 'patterson-jefferson-cipher.html'
]);

(async () => {
  console.log('\n━━━ Part A: auto-loaded demos (demo-loader.js) ━━━\n');

  const allPages = fs.readdirSync(CIPHERS_DIR).filter(f => f.endsWith('.html')).sort();

  for (const file of allPages) {
    if (HAND_BUILT.has(file)) continue;
    if (STATIC_PAGES.has(file)) continue;
    const slug = file.replace('.html', '');
    const filePath = path.join(CIPHERS_DIR, file);

    let dom;
    try { dom = await loadCipherPageWithArtifact(filePath); }
    catch (err) { ok(`${pad(slug, 28)} loads in jsdom`, false, err.message); continue; }
    const { window } = dom;
    const { document } = window;

    const artifactCard = document.querySelector('.artifact-card[data-artifact-slug="' + slug + '"]');
    ok(`${pad(slug, 28)} renders artifact card`, !!artifactCard);

    const section = document.querySelector('div.demo-section[data-cipher]');
    if (!section) { ok(`${pad(slug, 28)} has demo-section`, false); window.close(); continue; }
    const dataCipher = section.getAttribute('data-cipher');

    const runBtn = document.getElementById('demo-run-' + dataCipher);
    const msgInput = document.getElementById('demo-msg-' + dataCipher);
    const outputBox = document.getElementById('demo-output-' + dataCipher);
    const modeBtns = section.querySelectorAll('.mode-btn');

    ok(`${pad(slug, 28)} demo-loader rendered Run button`, !!runBtn);
    ok(`${pad(slug, 28)} demo-loader rendered message input`, !!msgInput);
    ok(`${pad(slug, 28)} demo-loader rendered output box`, !!outputBox);
    if (!runBtn || !msgInput || !outputBox) { window.close(); continue; }

    const defaultPlaintext = msgInput.value;
    const initialCiphertext = outputBox.textContent.trim();
    ok(`${pad(slug, 28)} auto-runs on load (non-empty output)`,
      initialCiphertext.length > 0,
      `output="${initialCiphertext.slice(0, 60)}"`);

    if (NON_ROUNDTRIP.has(slug)) {
      if (modeBtns.length >= 2) {
        modeBtns[1].click();
        runBtn.click();
        await tick(10);
        const decoded = outputBox.textContent;
        ok(`${pad(slug, 28)} Decrypt button executes without throwing`,
          !decoded.startsWith('Error:'), decoded.slice(0, 80));
        modeBtns[0].click();
      }
      window.close();
      continue;
    }

    if (modeBtns.length < 2) {
      ok(`${pad(slug, 28)} has Encrypt + Decrypt mode toggle`, false, `found ${modeBtns.length}`);
      window.close(); continue;
    }

    modeBtns[0].click();
    runBtn.click();
    await tick(10);
    const ciphertext = outputBox.textContent.trim();
    ok(`${pad(slug, 28)} Encrypt produces non-empty ciphertext`, ciphertext.length > 0);

    // OTP/Vernam annotate ciphertext with "[Key: …]" when key is auto-generated.
    let cleanCipher = ciphertext;
    const keyMatch = ciphertext.match(/\[Key:\s*([A-Z]+)\]/i);
    if (keyMatch) {
      cleanCipher = ciphertext.replace(/\n?\[Key:[^\]]*\]/i, '').trim();
      const keyField = document.getElementById('demo-key-' + dataCipher);
      if (keyField) keyField.value = keyMatch[1];
    }

    msgInput.value = cleanCipher;
    modeBtns[1].click();
    runBtn.click();
    await tick(10);
    const recovered = outputBox.textContent.trim();

    const want = IJ_MERGE.has(slug) ? lettersIJ(defaultPlaintext) : letters(defaultPlaintext);
    const got = IJ_MERGE.has(slug) ? lettersIJ(recovered) : letters(recovered);
    const matched = got === want || (want.length > 0 && got.startsWith(want));
    ok(`${pad(slug, 28)} roundtrip via UI buttons`, matched,
      `plain="${defaultPlaintext}" cipher="${ciphertext.slice(0, 50)}…" recovered="${recovered.slice(0, 50)}…"`);

    window.close();
  }

  console.log('\n━━━ Part B: hand-built demos (custom UI) ━━━\n');

  const ALL_ENGINES = path.join(REPO, 'js/ciphers/all-engines.js');

  // ── Caesar ────────────────────────────────────────────────────────────
  {
    const dom = await loadCipherPageWithArtifact(path.join(CIPHERS_DIR, 'caesar.html'));
    const { window } = dom;
    const { document } = window;
    const msg = document.getElementById('msgInput');
    const shift = document.getElementById('shiftSlider') || document.querySelector('input[type=range]');
    const output = document.getElementById('cipherOutput')
      || document.getElementById('output')
      || document.querySelector('.demo-output, .output-box');
    ok('caesar.html: msgInput present', !!msg);
    ok('caesar.html: shift control present', !!shift);
    ok('caesar.html: output element present', !!output);
    ok('caesar.html: runCipher() defined', typeof window.runCipher === 'function');
    if (msg && shift && output && typeof window.runCipher === 'function') {
      msg.value = 'THE QUICK BROWN FOX';
      shift.value = '3';
      shift.dispatchEvent(new window.Event('input', { bubbles: true }));
      if (typeof window.setMode === 'function') window.setMode('enc');
      window.runCipher();
      const ct = output.textContent.trim();
      ok('caesar.html: Encrypt via runCipher() → non-empty', ct.length > 0, `out="${ct}"`);
      ok('caesar.html: matches canonical shift-3 (WKHTXLFNEURZQIRA)',
        letters(ct).startsWith('WKHTXLFNEURZQIRA'), `letters="${letters(ct)}"`);
      msg.value = ct;
      if (typeof window.setMode === 'function') window.setMode('dec');
      window.runCipher();
      const pt = output.textContent.trim();
      ok('caesar.html: roundtrip via UI recovers plaintext',
        letters(pt).startsWith('THEQUICKBROWNFOX'), `recovered="${pt}"`);
    }
    window.close();
  }

  // ── Playfair (inject all-engines.js for the decode assertion) ────────
  {
    const dom = await loadCipherPageWithArtifact(path.join(CIPHERS_DIR, 'playfair.html'), [ALL_ENGINES]);
    const { window } = dom;
    const { document } = window;
    const kw = document.getElementById('pf-keyword');
    const msgIn = document.getElementById('pf-msg-input');
    const msgOut = document.getElementById('pf-msg-output');
    ok('playfair.html: keyword field present', !!kw);
    ok('playfair.html: message input present', !!msgIn);
    ok('playfair.html: message output present', !!msgOut);
    ok('playfair.html: CipherEngines available for verification', !!(window.CipherEngines && window.CipherEngines.playfair));
    if (kw && msgIn && msgOut) {
      kw.value = 'MONARCHY';
      msgIn.value = 'HIDETHEGOLDINTHETREESTUMP';
      if (typeof window.setMode === 'function') window.setMode('encrypt');
      kw.dispatchEvent(new window.Event('input', { bubbles: true }));
      msgIn.dispatchEvent(new window.Event('input', { bubbles: true }));
      if (typeof window.updateMessage === 'function') window.updateMessage();
      const ct = msgOut.textContent.trim();
      ok('playfair.html: Encrypt via UI → non-empty ciphertext', ct.length > 0, `out="${ct}"`);
      if (ct.length > 0 && window.CipherEngines && window.CipherEngines.playfair) {
        const dec = window.CipherEngines.playfair.decode(ct.replace(/\s+/g, ''), 'MONARCHY');
        ok('playfair.html: page-produced ciphertext decodes to plaintext (J→I)',
          lettersIJ(dec).startsWith(lettersIJ('HIDETHEGOLDINTHETREESTUMP')), `dec="${dec}"`);
      }
    }
    window.close();
  }

  // ── Vigenère ─────────────────────────────────────────────────────────
  {
    const dom = await loadCipherPageWithArtifact(path.join(CIPHERS_DIR, 'vigenere.html'));
    const { window } = dom;
    const { document } = window;
    const msg = document.getElementById('msgInput');
    const key = document.getElementById('keyInput');
    const output = document.getElementById('cipherOutput')
      || document.getElementById('output')
      || document.querySelector('.demo-output, .output-box');
    ok('vigenere.html: msgInput present', !!msg);
    ok('vigenere.html: keyInput present', !!key);
    ok('vigenere.html: output element present', !!output);
    ok('vigenere.html: runVigenere() defined', typeof window.runVigenere === 'function');
    if (msg && key && output && typeof window.runVigenere === 'function') {
      msg.value = 'ATTACKATDAWN';
      key.value = 'LEMON';
      if (typeof window.setMode === 'function') window.setMode('enc');
      window.runVigenere();
      const ct = output.textContent.trim();
      ok('vigenere.html: Encrypt via runVigenere() → non-empty', ct.length > 0, `out="${ct}"`);
      ok('vigenere.html: matches Wikipedia KAT (LXFOPVEFRNHR)',
        letters(ct).startsWith('LXFOPVEFRNHR'), `letters="${letters(ct)}"`);
      msg.value = ct;
      if (typeof window.setMode === 'function') window.setMode('dec');
      window.runVigenere();
      const pt = output.textContent.trim();
      ok('vigenere.html: roundtrip via UI recovers plaintext',
        letters(pt).startsWith('ATTACKATDAWN'), `recovered="${pt}"`);
    }
    window.close();
  }

  // ── Zodiac ───────────────────────────────────────────────────────────
  {
    const dom = await loadCipherPageWithArtifact(path.join(CIPHERS_DIR, 'zodiac.html'));
    const { window } = dom;
    const { document } = window;
    ok('zodiac.html: zAssignLetter() defined', typeof window.zAssignLetter === 'function');
    ok('zodiac.html: zReveal() defined', typeof window.zReveal === 'function');
    ok('zodiac.html: zReset() defined', typeof window.zReset === 'function');
    if (typeof window.zReveal === 'function') {
      try {
        window.zReveal();
        const body = document.body.textContent;
        ok('zodiac.html: zReveal() inserts canonical Z408 plaintext fragment',
          /KILLING|PARADICE|ANIMAL|FOREST/i.test(body),
          `body excerpt="${body.replace(/\s+/g, ' ').slice(0, 200)}"`);
      } catch (e) {
        ok('zodiac.html: zReveal() executes without throwing', false, e.message);
      }
    }
    window.close();
  }

  // ── Cipher Detective page ────────────────────────────────────────────
  {
    const dom = await loadPage(path.join(REPO, 'cipher-detective.html'));
    const { window } = dom;
    const { document } = window;
    const input = document.getElementById('detective-input');
    const resultsArea = document.getElementById('det-results');
    const candidates = document.getElementById('det-suspects-list');

    ok('cipher-detective.html: input textarea present', !!input);
    ok('cipher-detective.html: results area present', !!resultsArea);
    ok('cipher-detective.html: candidates container present', !!candidates);

    if (input && resultsArea && candidates) {
      input.value = 'WKHTXLFNEURZQIRAMXPSVRYHUWKHODCBGRJWKHTXLFNEURZQIRAMXPSVRYHUWKHODCBGRJWKHTXLFNEURZQIRA';
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
      await tick(20);

      const cards = candidates.querySelectorAll('.suspect-card');
      ok('cipher-detective.html: renders suspect cards after input', cards.length >= 1, `count=${cards.length}`);
      ok('cipher-detective.html: results become visible after analysis',
        !resultsArea.hasAttribute('hidden'), `hidden=${resultsArea.hasAttribute('hidden')}`);
    }
    window.close();
  }

  console.log('\n━━━ Part C: artifact cards across all exhibit pages ━━━\n');

  for (const file of allPages) {
    const slug = file.replace('.html', '');
    const dom = await loadCipherPageWithArtifact(path.join(CIPHERS_DIR, file));
    const { document, close } = dom.window;
    const card = document.querySelector('.artifact-card[data-artifact-slug="' + slug + '"]');
    ok(`${pad(slug, 28)} artifact card present`, !!card);
    close();
  }

  console.log('\n' + '═'.repeat(70));
  console.log(`  ✅ ${pass} passed   ❌ ${fail} failed`);
  console.log('═'.repeat(70));
  if (fail) {
    console.log('\nFailures:');
    failures.slice(0, 80).forEach(f => console.log('  ' + f));
    if (failures.length > 80) console.log(`  … and ${failures.length - 80} more`);
    process.exit(1);
  }
})();
