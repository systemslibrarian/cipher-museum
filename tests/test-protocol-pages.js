#!/usr/bin/env node
/* test-protocol-pages.js — run with: node tests/test-protocol-pages.js

   End-to-end interaction tests for the three modern protocol exhibits:
   ECDSA (§158), Shamir's Secret Sharing (§159) and Zero-Knowledge Proofs
   (§160). Each is driven through JSDOM the way a visitor drives it — load the
   page, work the controls, read what the page announces back.

   This is the same three-layer discipline the Hall of Foundations uses:
   test-protocol-math.js proves the mathematics, this file proves the page
   wires it up and narrates it correctly. Correct maths announced wrongly is
   still a wrong exhibit, and only this layer can see that.

   Exits non-zero on any failure. */
'use strict';
const fs = require('fs');
const path = require('path');
let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = require('jsdom')); }
catch (e) { console.log('\nprotocol-pages: SKIPPED (jsdom not installed)'); process.exit(0); }

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) passed++;
  else { failed++; console.error('  ✗ FAIL: ' + msg); }
}

const REPO = path.resolve(__dirname, '..');
const DIR = path.join(REPO, 'ciphers');

function load(page) {
  let html = fs.readFileSync(path.join(DIR, page), 'utf8');
  html = html.replace(/<script src="([^"]+)"[^>]*><\/script>/g, (m, src) => {
    const p = path.resolve(DIR, src);
    if (!fs.existsSync(p)) return '';
    return '<script>' + fs.readFileSync(p, 'utf8').replace(/<\/script>/gi, '<\\/script') + '<' + '/script>';
  });
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(html, { runScripts: 'dangerously', virtualConsole: vc });
  const w = dom.window, d = w.document;
  return {
    dom, win: w, doc: d, errors,
    $: id => d.getElementById(id),
    click: id => d.getElementById(id).dispatchEvent(new w.MouseEvent('click', { bubbles: true })),
    set(id, v) {
      const el = d.getElementById(id);
      el.value = String(v);
      el.dispatchEvent(new w.Event('input', { bubbles: true }));
      el.dispatchEvent(new w.Event('change', { bubbles: true }));
    },
    text: id => d.getElementById(id).textContent,
    close() { try { w.close(); } catch (e) { /* gone */ } }
  };
}

/* ───────────────────────── §158 ECDSA ───────────────────────── */
{
  const p = load('ecdsa.html');
  assert(p.errors.length === 0, '§158 loads with no script errors: ' + p.errors.join('; '));
  assert(p.$('curve').childNodes.length > 0, '§158 draws the curve scatter on load');
  assert(/valid/i.test(p.text('sigOut')), '§158 signs and verifies on load (got: ' + p.text('sigOut') + ')');

  // Honest signing must verify across many key/message/nonce combinations.
  let ok = 0, tried = 0;
  for (let d = 1; d <= 30; d++) {
    p.set('d', d); p.set('h', (d * 7) % 103); p.set('k', (d * 5) % 102 + 1);
    p.click('sign');
    const t = p.text('sigOut');
    if (/degenerate/i.test(t)) continue;
    tried++;
    if (/valid/.test(t) && !/REJECTED/.test(t)) ok++;
  }
  assert(tried > 25, '§158 most parameter choices produce a signature (' + tried + '/30)');
  assert(ok === tried, '§158 every honest signature is announced valid (' + ok + '/' + tried + ')');

  // The exhibit's headline claim: reused nonce leaks the key. It must both
  // announce the recovered key AND that key must be the one on screen.
  let leaks = 0, runs = 0;
  for (let d = 5; d <= 40; d += 5) {
    p.set('d', d); p.set('k', 9); p.set('h1', 11); p.set('h2', 29);
    p.click('reuse');
    if (/Degenerate|different messages/i.test(p.text('atkOut'))) continue;
    runs++;
    // the tell the page points at: r must be identical in both signatures
    const rs = p.text('atkOut').match(/\((\d+), \d+\)/g) || [];
    const sameR = rs.length === 2 && rs[0].split(',')[0] === rs[1].split(',')[0];
    p.click('attack');
    const out = p.text('atkOut');
    const m = out.match(/d = .*?= (\d+)/);
    if (sameR && m && Number(m[1]) === d) leaks++;
  }
  assert(runs > 5, '§158 enough nonce-reuse runs (' + runs + ')');
  assert(leaks === runs,
    '§158 reused nonce recovers the exact private key on screen, and r matches in both signatures (' +
    leaks + '/' + runs + ')');

  // Guard rails: out-of-range inputs must be clamped, not crash.
  p.set('d', 9999); p.click('sign');
  assert(Number(p.$('d').value) <= 102, '§158 clamps an out-of-range private key');
  p.set('d', -5); p.click('sign');
  assert(Number(p.$('d').value) >= 1, '§158 clamps a negative private key');
  assert(p.errors.length === 0, '§158 survives bad input without throwing');
  p.close();
}

/* ────────────── §159 Shamir's Secret Sharing ────────────── */
{
  const p = load('shamir-secret-sharing.html');
  assert(p.errors.length === 0, '§159 loads with no script errors: ' + p.errors.join('; '));
  assert(p.$('shareList').childNodes.length > 0, '§159 deals shares on load');
  assert(p.$('grid').childNodes.length === 257, '§159 draws one cell per candidate secret (257)');

  function boxes() {
    return Array.from(p.doc.querySelectorAll('#shareList input[type=checkbox]'));
  }
  function tick(n) {
    boxes().forEach((b, i) => {
      const want = i < n;
      if (b.checked !== want) b.click();
    });
  }

  // Below the threshold the page must claim ALL 257 secrets remain possible —
  // and the claim must match the grid it just drew.
  p.set('secret', 123); p.set('kIn', 3); p.set('nIn', 5);
  p.click('deal');
  tick(2);
  const below = p.text('out');
  assert(/below the threshold/i.test(below), '§159 announces being under the threshold');
  assert(/257 of 257|257 candidate/.test(below.replace(/\s+/g, ' ')),
    '§159 states that every candidate survives with k-1 shares (got: ' + below + ')');

  // At the threshold, exactly the original secret must come back.
  tick(3);
  const at = p.text('out');
  assert(/threshold .*met/i.test(at), '§159 announces the threshold being met');
  assert(at.indexOf('123') !== -1, '§159 reconstructs the exact secret (got: ' + at + ')');

  // Across many secrets and thresholds, reconstruction must always be exact.
  let exact = 0, cases = 0;
  for (const secret of [0, 1, 7, 99, 200, 256]) {
    for (const k of [2, 3, 4]) {
      p.set('secret', secret); p.set('kIn', k); p.set('nIn', Math.min(8, k + 2));
      p.click('deal');
      tick(k);
      cases++;
      if (p.text('out').indexOf(String(secret)) !== -1) exact++;
    }
  }
  assert(exact === cases, '§159 reconstruction is exact across secrets and thresholds (' +
    exact + '/' + cases + ')');

  // n < k must be corrected rather than producing an impossible deal.
  p.set('kIn', 5); p.set('nIn', 2); p.click('deal');
  assert(Number(p.$('nIn').value) >= Number(p.$('kIn').value),
    '§159 raises n when it is set below k, rather than dealing an unusable split');
  assert(p.errors.length === 0, '§159 survives every interaction without throwing');
  p.close();
}

/* ────────────── §160 Zero-Knowledge Proofs ────────────── */
{
  const p = load('zero-knowledge-proofs.html');
  assert(p.errors.length === 0, '§160 loads with no script errors: ' + p.errors.join('; '));
  assert(/ACCEPTED/.test(p.text('proofOut')), '§160 an honest proof is accepted on load');

  // Completeness across many secrets.
  let acc = 0;
  for (let x = 1; x <= 40; x++) { p.set('x', x); p.click('honest'); if (/ACCEPTED/.test(p.text('proofOut'))) acc++; }
  assert(acc === 40, '§160 an honest prover is always accepted (' + acc + '/40)');

  // The simulator: a transcript forged with NO secret must still be accepted.
  // This is the exhibit's central claim, so it is asserted directly.
  let sim = 0;
  for (let x = 1; x <= 40; x++) {
    p.set('x', x); p.click('simulate');
    if (/ACCEPTED/.test(p.text('simOut'))) sim++;
  }
  assert(sim === 40,
    '§160 a forged transcript verifies every time (' + sim + '/40) — the zero-knowledge argument');

  // Special soundness: two challenges on one commitment must yield the secret,
  // and the page must display that exact value.
  let ext = 0;
  for (let x = 3; x <= 60; x += 3) {
    p.set('x', x); p.click('extract');
    const m = p.text('simOut').match(/x = .*?= (\d+)/);
    if (m && Number(m[1]) === x) ext++;
  }
  assert(ext === 20, '§160 extraction recovers the exact secret on screen (' + ext + '/20)');

  // The batch cheat run must report a rate near the 1/q soundness bound, not 0
  // and not something absurd. The exhibit teaches that soundness is a
  // probability, so the number it prints has to be a real one.
  p.set('x', 77);
  p.click('cheatRuns');
  const m = p.text('proofOut').match(/500 attempts.*?:\s*(\d+)\s*succeeded/);
  assert(!!m, '§160 the batch cheat run reports a count (got: ' + p.text('proofOut') + ')');
  if (m) {
    const wins = Number(m[1]);
    assert(wins <= 15,
      '§160 blind guessing stays near the 1/233 bound over 500 tries (got ' + wins + ')');
  }
  assert(p.errors.length === 0, '§160 survives every interaction without throwing');
  p.close();
}

console.log('\nprotocol-pages: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
