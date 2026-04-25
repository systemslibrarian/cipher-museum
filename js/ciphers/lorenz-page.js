/**
 * Lorenz exhibit page glue — wires the depth-attack interactive
 * (defined by js/ciphers/lorenz-depth.js) into the DOM elements on
 * ciphers/lorenz.html. No engine logic lives here; this file is
 * presentation only.
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || !window.LorenzDepth) return;

  const { xorStrings, makeDepth, cribDrag } = window.LorenzDepth;

  // --- helpers ------------------------------------------------------
  const $ = (id) => document.getElementById(id);

  function toHex(s) {
    let out = '';
    for (let i = 0; i < s.length; i++) {
      out += s.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return out;
  }
  function fromHex(h) {
    const clean = (h || '').replace(/\s+/g, '').toLowerCase();
    if (!/^[0-9a-f]*$/.test(clean) || (clean.length % 2) !== 0) return null;
    let out = '';
    for (let i = 0; i < clean.length; i += 2) {
      out += String.fromCharCode(parseInt(clean.substr(i, 2), 16));
    }
    return out;
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
    }[c]));
  }

  // --- default scenario --------------------------------------------
  // The same 1941-style mistake: two messages, same machine setting.
  // P_A is a stylised English render of the operator's first message.
  // P_B is the lazy resend with abbreviations changed (matches the
  // historical case that Tutte unwound). Lengths are equal so the
  // depth is well-defined across the whole message.
  const P_A = 'OBERKOMMANDO DER WEHRMACHT GREIFT IM OSTEN AN BEI MORGENGRAUEN';
  const P_B = 'ARMY HIGH COMMAND ATTACKS IN THE EAST AT DAWN ON SIX SEPTEMBER';
  // Pad the shorter to the longer so they share length 1:1.
  const N = Math.max(P_A.length, P_B.length);
  const padA = P_A.padEnd(N, ' ');
  const padB = P_B.padEnd(N, ' ');
  const KEY = 'SZ40LORENZWHEELSTREAM'; // arbitrary repeating "keystream"
  const { c1, c2 } = makeDepth(padA, padB, KEY);

  // --- DOM elements -------------------------------------------------
  const elC1 = $('lz-c1');
  const elC2 = $('lz-c2');
  const elDepth = $('lz-depth');
  const elCrib = $('lz-crib');
  const elDrag = $('lz-drag');
  const elOut = $('lz-results');
  if (!elC1 || !elC2 || !elDepth || !elCrib || !elDrag || !elOut) return;

  // --- depth recompute on input ------------------------------------
  function recomputeDepth() {
    const a = fromHex(elC1.value);
    const b = fromHex(elC2.value);
    if (a === null || b === null) {
      elDepth.value = '⚠ ciphertext must be valid hex (0-9, a-f, even length)';
      return null;
    }
    const depth = xorStrings(a, b);
    elDepth.value = toHex(depth);
    return depth;
  }

  function renderResults(ranked) {
    if (!ranked.length) {
      elOut.innerHTML = '<span class="output-empty">No legal offsets — crib is longer than the depth.</span>';
      return;
    }
    const top = ranked.slice(0, 8);
    const maxScore = top[0].score || 1;
    let html = '<table class="cipher-table" style="margin:0;"><thead><tr>'
      + '<th style="width:5rem;">Offset</th>'
      + '<th>Recovered slice (the <em>other</em> plaintext at this position)</th>'
      + '<th style="width:6rem;text-align:right;">Score</th>'
      + '</tr></thead><tbody>';
    top.forEach((r, i) => {
      const isReal = r.score > 0 && r.score >= maxScore * 0.5;
      const colour = isReal ? 'var(--gold)' : 'var(--tx3)';
      const weight = i === 0 ? '700' : '400';
      html += '<tr>'
        + `<td style="color:${colour};font-family:var(--fm,monospace);">${r.offset}</td>`
        + `<td style="font-family:var(--fm,monospace);color:${colour};font-weight:${weight};">`
        + escapeHtml(r.candidate.replace(/[\x00-\x1f\x7f-\xff]/g, '·'))
        + '</td>'
        + `<td style="text-align:right;color:${colour};font-family:var(--fm,monospace);">${r.score.toFixed(2)}</td>`
        + '</tr>';
    });
    html += '</tbody></table>';
    if (top[0].score > 0) {
      html += `<p style="font-size:.9rem;color:var(--gold);margin:.75rem 0 0;">↑ Top hit at offset ${top[0].offset}: <code>${escapeHtml(top[0].candidate)}</code> — this is the matching slice from the OTHER message.</p>`;
    } else {
      html += '<p style="font-size:.9rem;color:var(--tx3);margin:.75rem 0 0;font-style:italic;">No offset produced English-looking output. Try a different crib (longer cribs are more discriminating).</p>';
    }
    elOut.innerHTML = html;
  }

  function runDrag() {
    const depth = recomputeDepth();
    if (depth === null) {
      elOut.innerHTML = '<span class="output-empty" style="color:var(--rust,#d97757);">Fix the ciphertext hex first.</span>';
      return;
    }
    const crib = (elCrib.value || '').trim();
    if (!crib) {
      elOut.innerHTML = '<span class="output-empty">Type a crib (a guessed plaintext fragment) and click again.</span>';
      return;
    }
    renderResults(cribDrag(depth, crib));
  }

  // --- init --------------------------------------------------------
  elC1.value = toHex(c1);
  elC2.value = toHex(c2);
  recomputeDepth();
  elC1.addEventListener('input', recomputeDepth);
  elC2.addEventListener('input', recomputeDepth);
  elDrag.addEventListener('click', runDrag);
  elCrib.addEventListener('keydown', (e) => { if (e.key === 'Enter') runDrag(); });
})();
