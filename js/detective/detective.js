/* ================================================================
   THE CIPHER MUSEUM — Detective Entry Point v1.5

   Ties analyses → scoring → render together.
   Also exports window.CipherDetective for backward compatibility
   with test-comprehensive.js.

   Load order (in HTML / require calls):
     1. js/detective/analyses.js
     2. js/detective/scoring.js
     3. js/detective/render.js
     4. js/detective/detective.js   ← this file
   ================================================================ */
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
          return;
        }
        var stats  = global.DetectiveAnalyses.run(text);
        var ranked = global.DetectiveScoring.rank(stats);
        _lastStats  = stats;
        _lastRanked = ranked;
        global.DetectiveRender.draw(stats, ranked);
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
