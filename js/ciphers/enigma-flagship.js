/**
 * THE CIPHER MUSEUM — Enigma Flagship Demo Controller
 * Drives the interactive Enigma machine, rotor visualisation,
 * self-encryption crib check, and brute-force rotor-order search.
 *
 * Depends on: js/ciphers/enigma.js (window.EnigmaEngine)
 */
'use strict';

(function () {
  if (!window.EnigmaEngine) {
    console.error('EnigmaEngine not loaded — flagship demo disabled.');
    return;
  }
  const E = window.EnigmaEngine;
  const $ = id => document.getElementById(id);

  // ─────────────────────────────────────────────────────────────────────────
  // PART 1: Live encryption machine
  // ─────────────────────────────────────────────────────────────────────────

  const root = $('enigma-flagship');
  if (!root) return;

  const els = {
    rotorL: $('eg-rotor-left'),
    rotorM: $('eg-rotor-mid'),
    rotorR: $('eg-rotor-right'),
    reflector: $('eg-reflector'),
    ringL: $('eg-ring-left'),
    ringM: $('eg-ring-mid'),
    ringR: $('eg-ring-right'),
    posL:  $('eg-pos-left'),
    posM:  $('eg-pos-mid'),
    posR:  $('eg-pos-right'),
    plugboard: $('eg-plugboard'),
    plaintext: $('eg-plaintext'),
    ciphertext: $('eg-ciphertext'),
    encryptBtn: $('eg-encrypt'),
    resetBtn:   $('eg-reset'),
    rotorWindowL: $('eg-window-left'),
    rotorWindowM: $('eg-window-mid'),
    rotorWindowR: $('eg-window-right'),
    pathSvg: $('eg-path-svg'),
    pathToggle: $('eg-show-path'),
    a11yLog: $('eg-a11y-log')
  };

  function readConfig() {
    return {
      rotors: [els.rotorL.value, els.rotorM.value, els.rotorR.value],
      reflector: els.reflector.value,
      ringSettings:
        (els.ringL.value || 'A') +
        (els.ringM.value || 'A') +
        (els.ringR.value || 'A'),
      positions:
        (els.posL.value || 'A') +
        (els.posM.value || 'A') +
        (els.posR.value || 'A'),
      plugboard: E.parsePlugboard(els.plugboard.value)
    };
  }

  function setRotorWindows(positions) {
    if (els.rotorWindowL) els.rotorWindowL.textContent = positions[0];
    if (els.rotorWindowM) els.rotorWindowM.textContent = positions[1];
    if (els.rotorWindowR) els.rotorWindowR.textContent = positions[2];
  }

  function announce(msg) {
    if (els.a11yLog) els.a11yLog.textContent = msg;
  }

  function runEncrypt() {
    let cfg;
    try {
      cfg = readConfig();
    } catch (e) {
      els.ciphertext.textContent = 'Configuration error: ' + e.message;
      return;
    }
    const machine = E.createEnigma(cfg);
    const text = (els.plaintext.value || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (!text) {
      els.ciphertext.innerHTML = '<span class="output-empty">Type a message above to encrypt…</span>';
      setRotorWindows(cfg.positions);
      return;
    }
    const result = machine.encryptWithTrace(text);

    // Format ciphertext in 5-letter groups (Wehrmacht convention).
    const grouped = result.ciphertext.replace(/(.{5})/g, '$1 ').trim();
    els.ciphertext.textContent = grouped;
    announce(
      'Encrypted ' + text.length + ' letters. Rotor positions advanced from ' +
      cfg.positions + ' to ' +
      result.steps[result.steps.length - 1].positions.join('') + '. ' +
      'Output: ' + grouped + '.'
    );

    // Window shows the position AFTER the last keystroke.
    const finalPositions = result.steps[result.steps.length - 1].positions
      .map(i => String.fromCharCode(65 + i)).join('');
    setRotorWindows(finalPositions);

    // Optional electrical-path visualisation for the last letter.
    if (els.pathToggle && els.pathToggle.checked && els.pathSvg) {
      drawPath(result.steps[result.steps.length - 1]);
    } else if (els.pathSvg) {
      els.pathSvg.innerHTML = '';
    }
  }

  function resetMachine() {
    els.rotorL.value = 'I'; els.rotorM.value = 'II'; els.rotorR.value = 'III';
    els.reflector.value = 'B';
    els.ringL.value = 'A'; els.ringM.value = 'A'; els.ringR.value = 'A';
    els.posL.value  = 'A'; els.posM.value  = 'A'; els.posR.value  = 'A';
    els.plugboard.value = '';
    els.plaintext.value = '';
    els.ciphertext.innerHTML = '<span class="output-empty">Output will appear here…</span>';
    setRotorWindows(['A','A','A']);
    if (els.pathSvg) els.pathSvg.innerHTML = '';
    announce('Machine reset to default Enigma I configuration: rotors I, II, III; reflector B; rings AAA; positions AAA; no plugboard.');
  }

  // SVG electrical-path drawing for the last encrypted letter.
  // Renders A-Z columns with the contact path traced in gold.
  function drawPath(step) {
    if (!step) return;
    const svg = els.pathSvg;
    const W = 600, H = 220;
    const colX = stage => 30 + stage * 80;   // 7 columns
    const rowY = idx => 14 + idx * 7.5;      // 26 rows

    // 7 stages, in order: input letter, plug-in, rotor R fwd, rotor M fwd,
    // rotor L fwd, reflector, then back through L, M, R, and plug-out.
    // To keep the diagram readable, we collapse to one column per stage
    // and trace the contact at each column.
    const stages = [
      { label: 'Key',     value: step.trace.find(s => s.stage === 'key').value },
      { label: 'Plug',    value: step.trace.find(s => s.stage === 'plug-in').value },
      { label: 'R',       value: step.trace.filter(s => s.stage === 'rotor-fwd' && s.rotor === 2).pop().value },
      { label: 'M',       value: step.trace.filter(s => s.stage === 'rotor-fwd' && s.rotor === 1).pop().value },
      { label: 'L',       value: step.trace.filter(s => s.stage === 'rotor-fwd' && s.rotor === 0).pop().value },
      { label: 'UKW',     value: step.trace.find(s => s.stage === 'reflector').value },
      { label: 'L\u2032', value: step.trace.filter(s => s.stage === 'rotor-rev' && s.rotor === 0).pop().value },
      { label: 'M\u2032', value: step.trace.filter(s => s.stage === 'rotor-rev' && s.rotor === 1).pop().value },
      { label: 'R\u2032', value: step.trace.filter(s => s.stage === 'rotor-rev' && s.rotor === 2).pop().value },
      { label: 'Plug',    value: step.trace.find(s => s.stage === 'plug-out').value }
    ];

    const totalW = 30 + stages.length * 60 + 20;
    let parts = [];
    parts.push(`<svg viewBox="0 0 ${totalW} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Electrical path through Enigma for the letter ${step.input}">`);
    parts.push('<style>' +
      '.eg-col-bg{fill:#1c1c22;stroke:#2e2e3a;stroke-width:.5}' +
      '.eg-col-lbl{font-family:Cinzel,serif;font-size:8px;fill:#C3A96F;text-anchor:middle;letter-spacing:.08em}' +
      '.eg-row-lbl{font-family:JetBrains Mono,monospace;font-size:5px;fill:#5c5c66;text-anchor:middle;dominant-baseline:central}' +
      '.eg-dot{fill:#5c4b26}' +
      '.eg-dot-on{fill:#F1DDA2}' +
      '.eg-wire{stroke:#D4B765;stroke-width:1.6;fill:none;opacity:.85}' +
      '</style>');

    // Background columns
    for (let s = 0; s < stages.length; s++) {
      const x = 30 + s * 60;
      parts.push(`<rect class="eg-col-bg" x="${x - 14}" y="8" width="28" height="${26 * 7.5 + 6}" rx="3"/>`);
      parts.push(`<text class="eg-col-lbl" x="${x}" y="${26 * 7.5 + 24}">${stages[s].label}</text>`);
      for (let r = 0; r < 26; r++) {
        const cy = 14 + r * 7.5;
        const on = (stages[s].value === r);
        parts.push(`<circle class="${on ? 'eg-dot-on' : 'eg-dot'}" cx="${x}" cy="${cy}" r="${on ? 2.4 : 1.4}"/>`);
        if (s === 0 || s === stages.length - 1) {
          parts.push(`<text class="eg-row-lbl" x="${x + (s === 0 ? -10 : 10)}" y="${cy}">${String.fromCharCode(65 + r)}</text>`);
        }
      }
    }
    // Wires connecting consecutive stages
    for (let s = 0; s < stages.length - 1; s++) {
      const x1 = 30 + s * 60, y1 = 14 + stages[s].value * 7.5;
      const x2 = 30 + (s + 1) * 60, y2 = 14 + stages[s + 1].value * 7.5;
      const cx1 = x1 + 30, cx2 = x2 - 30;
      parts.push(`<path class="eg-wire" d="M${x1},${y1} C${cx1},${y1} ${cx2},${y2} ${x2},${y2}"/>`);
    }
    // Output letter callout
    const finalLetter = String.fromCharCode(65 + stages[stages.length - 1].value);
    parts.push(`<text x="${30 + (stages.length - 1) * 60}" y="6" font-family="Cinzel,serif" font-size="10" fill="#F1DDA2" text-anchor="middle">→ ${finalLetter}</text>`);
    parts.push(`<text x="30" y="6" font-family="Cinzel,serif" font-size="10" fill="#F1DDA2" text-anchor="middle">${step.input} →</text>`);
    parts.push('</svg>');
    svg.innerHTML = parts.join('');
  }

  // Wire up live updates
  ['change','input'].forEach(evt => {
    [els.rotorL, els.rotorM, els.rotorR, els.reflector,
     els.ringL, els.ringM, els.ringR,
     els.posL, els.posM, els.posR,
     els.plugboard, els.plaintext]
      .filter(Boolean)
      .forEach(el => el.addEventListener(evt, runEncrypt));
  });
  if (els.pathToggle) els.pathToggle.addEventListener('change', runEncrypt);
  if (els.encryptBtn) els.encryptBtn.addEventListener('click', runEncrypt);
  if (els.resetBtn)   els.resetBtn.addEventListener('click', resetMachine);

  // Initial render
  setRotorWindows(['A','A','A']);
  runEncrypt();

  // ─────────────────────────────────────────────────────────────────────────
  // PART 2: Self-encryption crib check
  // ─────────────────────────────────────────────────────────────────────────

  const cribEls = {
    cipher: $('eg-crib-cipher'),
    crib:   $('eg-crib-text'),
    runBtn: $('eg-crib-check'),
    output: $('eg-crib-output')
  };

  if (cribEls.runBtn) {
    cribEls.runBtn.addEventListener('click', () => {
      const ct = (cribEls.cipher.value || '').toUpperCase().replace(/[^A-Z]/g, '');
      const cr = (cribEls.crib.value || '').toUpperCase().replace(/[^A-Z]/g, '');
      if (!ct || !cr) {
        cribEls.output.innerHTML = '<span class="output-empty">Enter both ciphertext and crib.</span>';
        return;
      }
      const r = E.findCribPositions(ct, cr);
      if (r.valid.length === 0 && r.rejected.length === 0) {
        cribEls.output.innerHTML = '<span class="output-empty">Crib is longer than the ciphertext.</span>';
        return;
      }

      // Build a position-by-position visual grid.
      let html = '<div class="eg-crib-grid" role="table" aria-label="Crib placement analysis">';
      // Header: ciphertext letters
      html += '<div class="eg-crib-row eg-crib-row--header" role="row">';
      html += '<div class="eg-crib-cell-lbl">Position</div>';
      for (let i = 0; i < ct.length; i++) {
        html += `<div class="eg-crib-cell eg-crib-cell--ct">${ct[i]}</div>`;
      }
      html += '</div>';

      // One row per candidate placement
      const rejectedMap = new Map();
      r.rejected.forEach(rj => rejectedMap.set(rj.position, rj));
      for (let pos = 0; pos <= ct.length - cr.length; pos++) {
        const isValid = r.valid.includes(pos);
        const rj = rejectedMap.get(pos);
        html += `<div class="eg-crib-row ${isValid ? 'eg-crib-row--ok' : 'eg-crib-row--bad'}" role="row">`;
        html += `<div class="eg-crib-cell-lbl">@${pos.toString().padStart(2, '0')} ${isValid ? '✓' : '✗'}</div>`;
        for (let i = 0; i < ct.length; i++) {
          if (i < pos || i >= pos + cr.length) {
            html += '<div class="eg-crib-cell eg-crib-cell--blank"></div>';
          } else {
            const ci = i - pos;
            const conflict = rj && rj.conflictAt === ci;
            html += `<div class="eg-crib-cell ${conflict ? 'eg-crib-cell--conflict' : (isValid ? 'eg-crib-cell--ok' : 'eg-crib-cell--bad')}">${cr[ci]}</div>`;
          }
        }
        html += '</div>';
      }
      html += '</div>';

      const total = ct.length - cr.length + 1;
      html += `<p class="eg-crib-summary"><strong>${r.valid.length}</strong> of ${total} positions survive the self-encryption rule. ` +
        `<strong>${r.rejected.length}</strong> rejected because Enigma cannot encrypt a letter to itself.</p>`;

      cribEls.output.innerHTML = html;
      announce(`${r.valid.length} of ${total} positions survive. ${r.rejected.length} rejected.`);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PART 3: Brute-force rotor + position search
  // Runs in the main thread but chunked via setTimeout to keep UI responsive.
  // Searches: 6 rotor orderings × 26³ = 105 456 settings, with no plugboard,
  // ring AAA. Larger search (60 orderings) available with checkbox.
  // ─────────────────────────────────────────────────────────────────────────

  const bfEls = {
    cipher: $('eg-bf-cipher'),
    crib:   $('eg-bf-crib'),
    offset: $('eg-bf-offset'),
    fullSearch: $('eg-bf-full'),
    runBtn: $('eg-bf-run'),
    cancelBtn: $('eg-bf-cancel'),
    progress: $('eg-bf-progress'),
    progressBar: $('eg-bf-progress-bar'),
    candidates: $('eg-bf-candidates')
  };

  let bfCancelled = false;

  if (bfEls.runBtn) {
    bfEls.runBtn.addEventListener('click', () => {
      const ct = (bfEls.cipher.value || '').toUpperCase().replace(/[^A-Z]/g, '');
      const cr = (bfEls.crib.value || '').toUpperCase().replace(/[^A-Z]/g, '');
      const offset = Math.max(0, parseInt(bfEls.offset.value, 10) || 0);
      if (!ct || !cr) {
        bfEls.candidates.innerHTML = '<span class="output-empty">Enter ciphertext and crib.</span>';
        return;
      }
      if (offset + cr.length > ct.length) {
        bfEls.candidates.innerHTML = '<span class="output-empty">Crib offset + length exceeds ciphertext length.</span>';
        return;
      }
      // Self-encryption sanity check first.
      for (let i = 0; i < cr.length; i++) {
        if (ct[offset + i] === cr[i]) {
          bfEls.candidates.innerHTML = `<p class="eg-bf-error">Crib placement contains a self-encryption at position ${offset + i} (letter ${cr[i]}). Enigma cannot do this — adjust the crib offset.</p>`;
          return;
        }
      }

      const available = bfEls.fullSearch && bfEls.fullSearch.checked
        ? ['I','II','III','IV','V']
        : ['I','II','III'];

      bfCancelled = false;
      bfEls.cancelBtn.disabled = false;
      bfEls.runBtn.disabled = true;
      bfEls.candidates.innerHTML = '';
      bfEls.progress.hidden = false;
      bfEls.progressBar.style.width = '0%';

      // Build orderings
      const orders = [];
      for (let a = 0; a < available.length; a++)
        for (let b = 0; b < available.length; b++)
          if (b !== a)
            for (let c = 0; c < available.length; c++)
              if (c !== a && c !== b)
                orders.push([available[a], available[b], available[c]]);

      const slice = ct.substr(offset, cr.length);
      const total = orders.length * 26 * 26 * 26;
      let tested = 0, found = 0;
      let oi = 0, p0 = 0, p1 = 0, p2 = 0;
      const startedAt = Date.now();

      // Process ~8000 machines per chunk, then yield to the event loop.
      function chunk() {
        if (bfCancelled) {
          bfEls.progress.querySelector('.eg-bf-status').textContent =
            `Cancelled at ${tested.toLocaleString()} / ${total.toLocaleString()}.`;
          bfEls.runBtn.disabled = false;
          bfEls.cancelBtn.disabled = true;
          return;
        }
        const CHUNK = 4000;
        for (let n = 0; n < CHUNK && oi < orders.length; n++) {
          const order = orders[oi];
          const positions = String.fromCharCode(65 + p0) +
                            String.fromCharCode(65 + p1) +
                            String.fromCharCode(65 + p2);
          const m = E.createEnigma({
            rotors: order, reflector: 'B',
            ringSettings: 'AAA', positions, plugboard: []
          });
          if (offset > 0) m.encrypt('A'.repeat(offset));
          const got = m.encrypt(cr);
          tested++;
          if (got === slice) {
            found++;
            const cand = document.createElement('div');
            cand.className = 'eg-bf-candidate';
            cand.innerHTML =
              `<span class="eg-bf-rotors">${order.join(' · ')}</span>` +
              `<span class="eg-bf-pos">positions ${positions}</span>` +
              `<button type="button" class="eg-bf-load" data-rotors="${order.join(',')}" data-pos="${positions}">Load into machine</button>`;
            bfEls.candidates.appendChild(cand);
          }
          // Advance position counters
          p2++;
          if (p2 === 26) { p2 = 0; p1++;
            if (p1 === 26) { p1 = 0; p0++;
              if (p0 === 26) { p0 = 0; oi++; }
            }
          }
        }
        const pct = (tested / total * 100);
        bfEls.progressBar.style.width = pct.toFixed(1) + '%';
        const elapsed = (Date.now() - startedAt) / 1000;
        const rate = tested / elapsed;
        bfEls.progress.querySelector('.eg-bf-status').textContent =
          `${tested.toLocaleString()} / ${total.toLocaleString()} settings tested · ${found} candidate${found === 1 ? '' : 's'} · ${rate.toFixed(0)} settings/sec`;

        if (oi < orders.length) {
          setTimeout(chunk, 0);
        } else {
          bfEls.progress.querySelector('.eg-bf-status').textContent =
            `Search complete. Tested ${tested.toLocaleString()} settings. Found ${found} candidate${found === 1 ? '' : 's'}.`;
          bfEls.runBtn.disabled = false;
          bfEls.cancelBtn.disabled = true;
          announce(`Brute-force search complete. ${found} candidate settings found.`);
        }
      }
      chunk();
    });

    bfEls.cancelBtn.addEventListener('click', () => { bfCancelled = true; });

    // Click-to-load candidate settings into the machine
    bfEls.candidates.addEventListener('click', e => {
      const btn = e.target.closest('.eg-bf-load');
      if (!btn) return;
      const rotors = btn.dataset.rotors.split(',');
      const positions = btn.dataset.pos;
      els.rotorL.value = rotors[0];
      els.rotorM.value = rotors[1];
      els.rotorR.value = rotors[2];
      els.ringL.value = 'A'; els.ringM.value = 'A'; els.ringR.value = 'A';
      els.posL.value = positions[0];
      els.posM.value = positions[1];
      els.posR.value = positions[2];
      els.plugboard.value = '';
      els.plaintext.value = bfEls.cipher.value;
      runEncrypt();
      // Scroll to machine
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      announce(`Loaded candidate ${rotors.join(',')} ${positions} into machine.`);
    });
  }
})();
