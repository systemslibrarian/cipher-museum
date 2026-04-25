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

      function update() {
        var text = input.value;
        if (!text || !text.trim()) {
          global.DetectiveRender.clear();
          return;
        }
        var stats  = global.DetectiveAnalyses.run(text);
        var ranked = global.DetectiveScoring.rank(stats);
        global.DetectiveRender.draw(stats, ranked);
      }

      input.addEventListener('input', update);

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
