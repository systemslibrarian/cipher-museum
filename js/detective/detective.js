/**
 * Cipher Detective
 * --------------------------------------------------
 * Current version: v2+ (post-Round 3 expansion)
 *
 * Shipped capabilities:
 *   - Ranked detection with confidence labels (v1.5 spec)
 *   - Detective UX framing: Evidence / Suspects / Case Notes /
 *     Recommended Next Attack (v1.5 spec)
 *   - Frequency chart with English overlay + accessible table (v1.5 spec)
 *   - Reality Labels strip (v1.5 spec)
 *   - Modular code structure (v1.5 spec)
 *   - Interactive attack tools: Caesar brute force, ROT13, Atbash,
 *     Morse decoding, encoding detection, Vigenere key-length,
 *     substitution frequency suggestions (v2 spec)
 *   - Step-by-step Attack Playback (v2 spec)
 *   - Challenge Mode (v2 spec)
 *   - Auto-solve panel for selected cipher families (post-v2 extension)
 *
 * Modules:
 *   analyses.js     — pure analysis functions (frequency, IoC, etc.)
 *   scoring.js      — cipher-family scoring and confidence assignment
 *   render.js       — DOM rendering, no analysis logic
 *   attacks.js      — attack tool implementations
 *   solvers.js      — auto-solve implementations
 *   lang-model.js   — n-gram English fitness scoring
 *   playback.js     — narrated step-by-step Attack Playback
 *   challenges.js   — Challenge Mode corpus + progression
 *   detective.js    — entry point and orchestration
 *
 * Note: solvers.js implements its own cipher logic rather than
 * importing from js/ciphers/all-engines.js. This is by design —
 * solver paths need candidate ranking and plaintext fitness scoring,
 * which encrypt/decrypt engines do not provide.
 *
 * Future revisions: see docs/detective-roadmap.md if it exists.
 */
'use strict';

(function (global) {

  /* ─── Core pipeline ─────────────────────────────────────────── */
  function analyse(text) {
    var stats  = global.DetectiveAnalyses.run(text);
    var ranked = global.DetectiveScoring.rank(stats);

    /* Backward-compat return shape for test-comprehensive.js */
    return {
      stats: stats ? {
        n:          stats.n,
        ioc:        stats.ioc,
        chi0:       stats.chi0,
        charset:    stats.charset,
        kasiski:    stats.kasiski,
        district:   stats.dg.district,
        isEvenLen:  stats.dg.isEvenLen,
        bestShift:  stats.bestShiftResult.shift,
        bestShiftChi: stats.bestShiftResult.chi,
        periodHint: stats.periodHint,
        counts:     stats.counts
      } : null,
      candidates: ranked.suspects
    };
  }

  /* ─── Page boot (only runs in browser context with a real DOM) ── */
  if (typeof document !== 'undefined') {
    function boot() {
      var input = document.getElementById('detective-input');
      if (!input) return;

      /* Last known stats/ranked for v2 tools */
      var _lastStats  = null;
      var _lastRanked = null;

      function update() {
        var text = input.value;
        if (!text || !text.trim()) {
          global.DetectiveRender.clear();
          _lastStats  = null;
          _lastRanked = null;
          updateAutoSolveButton();
          return;
        }
        var stats  = global.DetectiveAnalyses.run(text);
        var ranked = global.DetectiveScoring.rank(stats);
        _lastStats  = stats;
        _lastRanked = ranked;
        global.DetectiveRender.draw(stats, ranked);
        updateAutoSolveButton();
      }

      function updateAutoSolveButton() {
        var btn = document.getElementById('det-autosolve-btn');
        if (!btn) return;
        var ok = !!(_lastStats && _lastStats.charset === 'alpha' && _lastStats.n >= 4 && global.DetectiveSolvers);
        btn.disabled = !ok;
      }

      input.addEventListener('input', update);

      /* ── v2: Attack tool click delegation ── */
      document.addEventListener('click', function (e) {
        /* Attack button */
        var btn = e.target.closest ? e.target.closest('.attack-btn') : null;
        if (btn && !btn.disabled && _lastStats && global.DetectiveAttacks) {
          var tool = btn.getAttribute('data-tool');
          runAttackTool(tool, input.value, _lastStats);
          return;
        }

        /* Watch step-by-step button */
        if (e.target && e.target.id === 'det-watch-btn' && _lastStats && global.DetectivePlayback) {
          global.DetectivePlayback.start(_lastStats, _lastRanked);
          return;
        }

        /* Challenge mode entry button */
        if (e.target && e.target.id === 'det-challenge-btn' && global.DetectiveChallenges) {
          global.DetectiveChallenges.init();
          return;
        }

        /* Auto-Solve button */
        if (e.target && e.target.id === 'det-autosolve-btn' && _lastStats && global.DetectiveSolvers) {
          runAutoSolve(input.value, _lastStats, _lastRanked);
          return;
        }
      });

      /* Pre-populate from URL hash (e.g., inbound links with sample ciphertext) */
      if (typeof location !== 'undefined' && location.hash && location.hash.length > 1) {
        try {
          var decoded = decodeURIComponent(location.hash.substring(1));
          input.value = decoded;
          update();
        } catch (e) { /* ignore malformed hash */ }
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }

  /* ─── Attack tool runner (v2) ────────────────────────────────── */
  function runAttackTool(tool, ciphertext, stats) {
    var A   = global.DetectiveAttacks;
    var out = '';

    switch (tool) {
      case 'caesar': {
        var results = A.caesarBruteForce(ciphertext);
        if (!results.length) { out = '<p class="attack-nil">No alphabetic letters found.</p>'; break; }
        out = '<table class="pb-table attack-result-table"><caption>Caesar brute-force \u2014 top 5 candidates (lower \u03c7\u00b2 = closer to English)</caption>' +
          '<thead><tr><th>Shift</th><th>\u03c7\u00b2</th><th>Decrypted</th></tr></thead><tbody>';
        results.forEach(function (r, i) {
          out += '<tr' + (i === 0 ? ' class="attack-best-row"' : '') + '>' +
            '<td>' + r.shift + '</td>' +
            '<td>' + r.chi.toFixed(1) + '</td>' +
            '<td class="attack-plaintext">' + esc(r.decrypted) + '</td>' +
            '</tr>';
        });
        out += '</tbody></table>';
        break;
      }
      case 'rot13': {
        var r13 = A.rot13(ciphertext);
        out = '<p class="attack-result-line"><strong>ROT13:</strong> <span class="attack-plaintext">' + esc(r13.decrypted) + '</span></p>';
        break;
      }
      case 'atbash': {
        var rab = A.atbash(ciphertext);
        out = '<p class="attack-result-line"><strong>Atbash:</strong> <span class="attack-plaintext">' + esc(rab.decrypted) + '</span></p>';
        break;
      }
      case 'morse': {
        var rm = A.decodeMorse(ciphertext);
        if (rm.valid) {
          out = '<p class="attack-result-line"><strong>Morse \u2192</strong> <span class="attack-plaintext">' + esc(rm.decrypted) + '</span></p>';
        } else {
          out = '<p class="attack-result-line attack-warn"><strong>Morse decode:</strong> ' + esc(rm.error || 'Could not decode.') + (rm.decrypted ? ' Partial: <span class="attack-plaintext">' + esc(rm.decrypted) + '</span>' : '') + '</p>';
        }
        break;
      }
      case 'encoding': {
        var re = A.decodeEncoding(ciphertext);
        if (re.valid) {
          out = '<p class="attack-result-line"><strong>' + esc(re.type) + ' \u2192</strong> <span class="attack-plaintext">' + esc(re.decrypted) + '</span></p>';
        } else {
          out = '<p class="attack-result-line attack-nil">No Base64, Hex, or Binary encoding detected in this input.</p>';
        }
        break;
      }
      case 'vigKeyLength': {
        var rv = A.vigKeyLength(ciphertext);
        if (!rv.candidates.length) {
          out = '<p class="attack-nil">Too short or ambiguous for key-length estimation (need 50+ letters).</p>';
        } else {
          out = '<table class="pb-table attack-result-table"><caption>Vigen\u00e8re key-length candidates (higher period-IoC = stronger suggestion)</caption>' +
            '<thead><tr><th>Key length</th><th>Period-IoC</th><th>Evidence</th></tr></thead><tbody>';
          rv.candidates.forEach(function (c, i) {
            out += '<tr' + (i === 0 ? ' class="attack-best-row"' : '') + '>' +
              '<td>' + c.length + '</td>' +
              '<td>' + c.pIoC.toFixed(4) + '</td>' +
              '<td>' + (c.methods.length ? esc(c.methods.join(', ')) : 'Period-IoC only') + '</td></tr>';
          });
          out += '</tbody></table>';
        }
        break;
      }
      case 'substFreq': {
        var rs = A.substFreqSuggestions(ciphertext);
        if (!rs.mapping.length) {
          out = '<p class="attack-nil">No letters found.</p>';
        } else {
          var mapStr = rs.mapping.map(function (m) {
            return '<span class="sf-pair" title="' + esc(m.count + ' occurrences, ' + m.pct.toFixed(1) + '%') + '">' + esc(m.cipher) + '\u2192' + esc(m.plain) + '</span>';
          }).join(' ');
          out = '<div class="subst-freq-result">' +
            '<p class="attack-result-line"><strong>Frequency mapping:</strong> ' + mapStr + '</p>' +
            '<p class="attack-note">' + esc(rs.note) + '</p>' +
            '</div>';
        }
        break;
      }
      default:
        out = '<p class="attack-nil">Unknown tool.</p>';
    }

    if (global.DetectiveRender && global.DetectiveRender.renderAttackResult) {
      global.DetectiveRender.renderAttackResult(out);
    }
  }

  /* ─── HTML escape (mirrored from render.js for local use) ─────── */
  function esc(s) {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ─── Auto-Solve runner (v3) ────────────────────────────────── */
  function runAutoSolve(ciphertext, stats, ranked) {
    var btn  = document.getElementById('det-autosolve-btn');
    var out  = document.getElementById('det-autosolve-result');
    if (!btn || !out || !global.DetectiveSolvers) return;

    /* Lock the button and show a working indicator. The actual
       compute is synchronous (~1-5s) so we yield to the browser
       once with setTimeout so the UI can repaint the spinner. */
    btn.disabled = true;
    btn.classList.add('autosolve-btn--running');
    var oldLabel = btn.innerHTML;
    btn.innerHTML = '\u2699\uFE0F Working\u2026';
    out.innerHTML = '<p class="autosolve-runtime">Running every applicable solver\u2026</p>';

    setTimeout(function () {
      var result;
      try {
        result = global.DetectiveSolvers.solveAuto(ciphertext, { stats: stats, ranked: ranked });
      } catch (err) {
        out.innerHTML = '<p class="autosolve-skip">Auto-Solve crashed: ' + esc(err && err.message || String(err)) + '</p>';
        btn.disabled = false;
        btn.classList.remove('autosolve-btn--running');
        btn.innerHTML = oldLabel;
        return;
      }
      out.innerHTML = renderAutoSolveResult(result, ciphertext);
      btn.disabled = false;
      btn.classList.remove('autosolve-btn--running');
      btn.innerHTML = oldLabel;
    }, 30);
  }

  function renderAutoSolveResult(result, ciphertext) {
    if (!result) return '<p class="autosolve-skip">No result.</p>';
    if (result.skipped) return '<p class="autosolve-skip">' + esc(result.skipped) + '</p>';
    if (!result.best || !result.attempts.length) {
      return '<p class="autosolve-skip">No applicable solver produced a result for this input.</p>';
    }

    var best = result.best;
    var conf = best.confidence || { tier: 'inconclusive', label: 'Inconclusive' };
    var encodedCt = encodeURIComponent(ciphertext || '');

    var html = '<div class="autosolve-best">' +
      '<div class="autosolve-best-header">' +
        '<h3 class="autosolve-best-method">Best candidate: ' + esc(best.method) + '</h3>' +
        '<span class="conf-badge conf-badge--' + esc(conf.tier) + '">' + esc(conf.label) + '</span>' +
      '</div>' +
      '<p class="autosolve-best-key"><strong>Key:</strong> ' + esc(best.key) + '</p>' +
      '<div class="autosolve-best-plain">' + esc(best.plaintext) + '</div>' +
      '<a class="autosolve-cta" href="lab/workbench.html#ct=' + encodedCt + '">Refine in the Workbench \u2192</a>' +
      '</div>';

    if (result.attempts.length > 1) {
      html += '<div class="autosolve-others">' +
        '<p class="autosolve-others-title">Other candidates considered</p>' +
        '<table class="autosolve-others-table">' +
        '<thead><tr><th>Method</th><th>Per-char fit</th><th>Confidence</th><th>Plaintext start</th></tr></thead>' +
        '<tbody>';
      for (var i = 1; i < result.attempts.length; i++) {
        var a = result.attempts[i];
        var ac = a.confidence || { tier: 'inconclusive', label: 'Inconclusive' };
        var preview = (a.plaintext || '').replace(/\s+/g, ' ').slice(0, 60);
        html += '<tr>' +
          '<td>' + esc(a.method) + '</td>' +
          '<td>' + (typeof a.perChar === 'number' ? a.perChar.toFixed(2) : '\u2014') + '</td>' +
          '<td><span class="conf-badge conf-badge--' + esc(ac.tier) + '">' + esc(ac.label) + '</span></td>' +
          '<td class="ao-plain">' + esc(preview) + (a.plaintext && a.plaintext.length > 60 ? '\u2026' : '') + '</td>' +
        '</tr>';
      }
      html += '</tbody></table></div>';
    }

    html += '<p class="autosolve-runtime">Solved in ' + result.runtimeMs + ' ms.</p>';
    return html;
  }

  /* ─── Export ─────────────────────────────────────────────────── */
  global.CipherDetective = {
    analyse: analyse,
    /* Low-level helpers exposed for test-comprehensive.js */
    _calcIoC:          global.DetectiveAnalyses._calcIoC,
    _chiSquareAtShift: global.DetectiveAnalyses._chiSquareAtShift,
    _kasiskiTest:      global.DetectiveAnalyses._kasiskiTest,
    _detectCharset:    global.DetectiveAnalyses._detectCharset,
    _periodIoC:        global.DetectiveAnalyses._periodIoC
  };

})(typeof window !== 'undefined' ? window : global);
