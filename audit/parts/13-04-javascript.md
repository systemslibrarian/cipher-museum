# javascript appendix 4

Snapshot: `227086a353fbf8b3a91629f9a97d4eb2634bdc0a`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

## JavaScript — js/detective/challenges.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/detective/challenges.js`
- Served SHA-256: `84ab574696183c295f71d28e58cf50fc897df6b3db7e59d6015a34c94ff87464`
- Readable-source SHA-256: `84ab574696183c295f71d28e58cf50fc897df6b3db7e59d6015a34c94ff87464`


```javascript
/* ================================================================
   THE CIPHER MUSEUM — Detective Challenges v2.0

   window.DetectiveChallenges — 15 curated cipher puzzles

   init()                 — load data, build tier UI in #det-challenge-mode
   openChallenge(id)      — show a specific challenge card
   showHint(id, idx)      — reveal hint by index (0, 1, 2)
   revealSolution(id)     — show full solution
   markComplete(id)       — save solved state to localStorage
   getProgress()          — { completed, total }
   reset()                — clear all localStorage keys, re-init UI

   Challenge data is fetched from data/detective-challenges.json.
   localStorage key format: "detective-complete-{id}"
   ================================================================ */
'use strict';

(function (global) {

  var STORAGE_PREFIX = 'detective-complete-';
  var _challenges    = [];
  var _loaded        = false;

  /* ─── Utility ────────────────────────────────────────────────── */
  function esc(s) {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function el(id) {
    return typeof document !== 'undefined' ? document.getElementById(id) : null;
  }

  function findChallenge(id) {
    for (var i = 0; i < _challenges.length; i++) {
      if (_challenges[i].id === id) return _challenges[i];
    }
    return null;
  }

  /* ─── localStorage helpers ───────────────────────────────────── */
  function markComplete(id) {
    try { localStorage.setItem(STORAGE_PREFIX + id, '1'); } catch (e) { /* private browsing */ }
    refreshProgress();
  }

  function isComplete(id) {
    try { return localStorage.getItem(STORAGE_PREFIX + id) === '1'; } catch (e) { return false; }
  }

  function getProgress() {
    var completed = 0;
    for (var i = 0; i < _challenges.length; i++) {
      if (isComplete(_challenges[i].id)) completed++;
    }
    return { completed: completed, total: _challenges.length };
  }

  function refreshProgress() {
    var prog = el('det-challenge-progress');
    if (prog) {
      var p = getProgress();
      prog.textContent = p.completed + ' / ' + p.total + ' solved';
    }
  }

  /* ─── Data loading ───────────────────────────────────────────── */
  function loadData(cb) {
    if (_loaded) { cb(); return; }
    if (typeof fetch === 'function') {
      fetch('data/detective-challenges.json')
        .then(function (r) { if (r.ok === false) throw new Error('Challenge data unavailable'); return r.json(); })
        .then(function (data) {
          _challenges = (data && data.challenges) ? data.challenges : [];
          _loaded = true;
          cb();
        })
        .catch(function (error) {
          _loaded = false;
          cb(error);
        });
    } else {
      /* Node.js test environment — data injected via DetectiveChallenges._inject() */
      _loaded = true;
      cb();
    }
  }

  /* ─── Tier HTML builder ──────────────────────────────────────── */
  function buildTierHtml(level, levelLabel) {
    var items = _challenges.filter(function (c) { return c.level === level; });
    if (items.length === 0) return '';

    var cards = items.map(function (c) {
      var done = isComplete(c.id);
      return '<button class="challenge-card' + (done ? ' challenge-card--done' : '') +
        '" data-challenge-id="' + esc(c.id) + '"' +
        ' aria-label="' + esc(c.title) + (done ? ' — solved' : '') + '">' +
        '<span class="challenge-card-title">' + esc(c.title) + '</span>' +
        (done ? '<span class="challenge-card-done" aria-hidden="true">\u2713</span>' : '') +
        '</button>';
    }).join('');

    return '<div class="challenge-tier">' +
      '<h3 class="challenge-tier-title">' +
        '<span class="challenge-tier-label challenge-tier-label--' + esc(level) + '">' + esc(levelLabel) + '</span>' +
      '</h3>' +
      '<div class="challenge-cards-row">' + cards + '</div>' +
      '</div>';
  }

  /* ─── Challenge detail HTML ──────────────────────────────────── */
  function buildDetailHtml(c) {
    var done = isComplete(c.id);

    /* Codebook (nomenclator challenge only) */
    var codebookHtml = '';
    if (c.codebook) {
      var cbRows = Object.keys(c.codebook).map(function (k) {
        return '<tr><td>' + esc(k) + '</td><td>' + esc(c.codebook[k]) + '</td></tr>';
      }).join('');
      codebookHtml =
        '<div class="challenge-codebook">' +
          '<h4 class="challenge-codebook-title">Codebook</h4>' +
          '<table class="pb-table">' +
            '<thead><tr><th>Code</th><th>Word</th></tr></thead>' +
            '<tbody>' + cbRows + '</tbody>' +
          '</table>' +
        '</div>';
    }

    /* Hints */
    var hintsHtml = c.hints.map(function (h, i) {
      return '<div class="hint-item">' +
        '<button class="hint-btn" data-challenge-id="' + esc(c.id) + '" data-hint-idx="' + i + '">' +
          'Hint ' + (i + 1) +
        '</button>' +
        '<p class="hint-text" id="hint-' + esc(c.id) + '-' + i + '" hidden>' + esc(h) + '</p>' +
        '</div>';
    }).join('');

    /* Further reading links */
    var linksHtml = '';
    if (c.whatYouLearned && c.whatYouLearned.links && c.whatYouLearned.links.length) {
      linksHtml = c.whatYouLearned.links.map(function (l) {
        return '<a href="' + esc(l.url) + '" class="pb-link">' + esc(l.text) + ' \u2192</a>';
      }).join('  ');
    }

    return '<div class="challenge-detail">' +

      /* Header */
      '<div class="challenge-detail-header">' +
        '<button class="pb-btn pb-btn--ghost" id="det-challenge-back">\u2190 All challenges</button>' +
        '<span class="challenge-level-badge challenge-level-badge--' + esc(c.level) + '">' + esc(c.levelLabel) + '</span>' +
        (done ? '<span class="challenge-solved-badge">\u2713 Solved</span>' : '') +
      '</div>' +

      '<h3 class="challenge-detail-title">' + esc(c.title) + '</h3>' +

      /* Setup */
      '<div class="challenge-setup"><p>' + esc(c.setup) + '</p></div>' +

      /* Codebook */
      codebookHtml +

      /* Ciphertext */
      '<div class="challenge-ciphertext-wrap">' +
        '<p class="det-input-label">Ciphertext</p>' +
        '<div class="challenge-ciphertext" aria-label="Ciphertext to analyse">' +
          esc(c.ciphertext) +
        '</div>' +
        '<button class="pb-btn" id="det-challenge-load-ct" ' +
          'data-ciphertext="' + esc(c.ciphertext) + '">' +
          'Load into Detective \u2192' +
        '</button>' +
      '</div>' +

      /* Hints */
      '<div class="hint-strip">' + hintsHtml + '</div>' +

      /* Mark solved / already solved */
      (done
        ? ''
        : '<button class="pb-btn challenge-solve-btn" id="det-challenge-solve" ' +
          'data-challenge-id="' + esc(c.id) + '">Mark as Solved \u2713</button>') +

      /* Reveal solution */
      '<button class="pb-btn pb-btn--ghost" id="det-challenge-reveal" ' +
        'data-challenge-id="' + esc(c.id) + '">Reveal Solution</button>' +

      '<div class="challenge-solution" id="det-challenge-solution-' + esc(c.id) + '" hidden>' +
        '<h4>Solution</h4>' +
        '<p><strong>Plaintext:</strong> ' + esc(c.solution.plaintext) + '</p>' +
        '<p><strong>Key:</strong> ' + esc(c.solution.key) + '</p>' +
        '<p>' + esc(c.solution.explanation) + '</p>' +
      '</div>' +

      /* What you learned */
      '<div class="challenge-learned">' +
        '<strong>What you\u2019ll learn:</strong> ' +
        esc((c.whatYouLearned && c.whatYouLearned.text) || '') +
        (linksHtml ? '&nbsp;&nbsp;' + linksHtml : '') +
      '</div>' +

    '</div>';
  }

  /* ─── Wire detail-view events ────────────────────────────────── */
  function wireDetail(c) {
    var backBtn = el('det-challenge-back');
    if (backBtn) backBtn.addEventListener('click', function () { renderModeUI(); });

    /* Load into Detective textarea */
    var loadBtn = el('det-challenge-load-ct');
    if (loadBtn) loadBtn.addEventListener('click', function () {
      var ct    = loadBtn.getAttribute('data-ciphertext');
      var input = el('detective-input');
      if (input && ct) {
        input.value = ct;
        input.dispatchEvent(new Event('input'));
        var det = el('det-results');
        if (det) det.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    /* Mark solved */
    var solveBtn = el('det-challenge-solve');
    if (solveBtn) solveBtn.addEventListener('click', function () {
      markComplete(c.id);
      openChallenge(c.id);   /* re-render with ✓ done state */
    });

    /* Reveal solution */
    var revealBtn = el('det-challenge-reveal');
    if (revealBtn) revealBtn.addEventListener('click', function () {
      var sol = el('det-challenge-solution-' + c.id);
      if (sol) sol.hidden = false;
    });

    /* Hint buttons */
    var hintBtns = (typeof document !== 'undefined')
      ? document.querySelectorAll('.hint-btn') : [];
    for (var i = 0; i < hintBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          showHint(
            btn.getAttribute('data-challenge-id'),
            +btn.getAttribute('data-hint-idx')
          );
        });
      }(hintBtns[i]));
    }
  }

  /* ─── Render full mode UI (tier view) ────────────────────────── */
  function renderModeUI() {
    var container = el('det-challenge-mode');
    if (!container) return;

    var prog = getProgress();
    container.innerHTML =
      '<div class="challenge-mode-inner">' +
        '<div class="challenge-mode-header">' +
          '<h2 class="challenge-mode-heading">Practice Challenges</h2>' +
          '<span class="challenge-mode-progress" id="det-challenge-progress">' +
            prog.completed + ' / ' + prog.total + ' solved' +
          '</span>' +
          '<div class="challenge-mode-actions">' +
            '<button class="pb-btn pb-btn--ghost" id="det-challenge-reset">Reset progress</button>' +
            '<button class="pb-btn pb-btn--ghost" id="det-challenge-close">\u2715 Close</button>' +
          '</div>' +
        '</div>' +
        buildTierHtml('beginner',     'Beginner') +
        buildTierHtml('intermediate', 'Intermediate') +
        buildTierHtml('advanced',     'Advanced') +
      '</div>';

    /* Wire challenge card clicks */
    var cards = (typeof document !== 'undefined')
      ? container.querySelectorAll('.challenge-card') : [];
    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        card.addEventListener('click', function () {
          openChallenge(card.getAttribute('data-challenge-id'));
        });
      }(cards[i]));
    }

    var resetBtn = el('det-challenge-reset');
    if (resetBtn) resetBtn.addEventListener('click', function () {
      if (typeof confirm !== 'undefined' && !confirm('Reset all challenge progress?')) return;
      reset();
    });

    var closeBtn = el('det-challenge-close');
    if (closeBtn) closeBtn.addEventListener('click', function () {
      var mode = el('det-challenge-mode');
      if (mode) mode.hidden = true;
    });
  }

  /* ─── Public: open a single challenge ────────────────────────── */
  function openChallenge(id) {
    var c = findChallenge(id);
    if (!c) return;
    var container = el('det-challenge-mode');
    if (!container) return;
    container.innerHTML = buildDetailHtml(c);
    wireDetail(c);
  }

  /* ─── Public: show a hint ────────────────────────────────────── */
  function showHint(id, hintIndex) {
    var hintEl = el('hint-' + id + '-' + hintIndex);
    if (hintEl) hintEl.hidden = false;
  }

  /* ─── Public: reveal solution ────────────────────────────────── */
  function revealSolution(id) {
    var sol = el('det-challenge-solution-' + id);
    if (sol) sol.hidden = false;
  }

  /* ─── Public: init ───────────────────────────────────────────── */
  function init() {
    loadData(function (error) {
      var container = el('det-challenge-mode');
      if (!container) return;
      container.hidden = false;
      if (error) {
        container.innerHTML = '<p role="status">Challenges could not be loaded. Check your connection and try again.</p><button id="det-challenge-retry" class="pb-btn">Retry</button>';
        el('det-challenge-retry').addEventListener('click', init);
        return;
      }
      renderModeUI();
    });
  }

  /* ─── Public: reset ──────────────────────────────────────────── */
  function reset() {
    for (var i = 0; i < _challenges.length; i++) {
      try { localStorage.removeItem(STORAGE_PREFIX + _challenges[i].id); } catch (e) { /* */ }
    }
    renderModeUI();
  }

  /* ─── Export ─────────────────────────────────────────────────── */
  global.DetectiveChallenges = {
    init:           init,
    openChallenge:  openChallenge,
    showHint:       showHint,
    revealSolution: revealSolution,
    markComplete:   markComplete,
    getProgress:    getProgress,
    reset:          reset,
    /* Test-only: inject data without fetch */
    _inject: function (data) {
      _challenges = data || [];
      _loaded = true;
    }
  };

})(typeof window !== 'undefined' ? window : global);
```


## JavaScript — js/detective/detective.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/detective/detective.js`
- Served SHA-256: `4abd9c050c1dfbae843aecc5393fa1a1b3374752614e77a7b1dea42607a4cc84`
- Readable-source SHA-256: `4abd9c050c1dfbae843aecc5393fa1a1b3374752614e77a7b1dea42607a4cc84`


```javascript
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
  var autoSolveTimer = null;
  var autoSolveRevision = 0;
  var autoSolveLabel = null;

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
        cancelAutoSolve();
        if (global.DetectivePlayback) global.DetectivePlayback.skip();
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
  function cancelAutoSolve() {
    autoSolveRevision++;
    if (autoSolveTimer !== null) clearTimeout(autoSolveTimer);
    autoSolveTimer = null;
    var btn = document.getElementById('det-autosolve-btn');
    var out = document.getElementById('det-autosolve-result');
    if (btn) {
      btn.classList.remove('autosolve-btn--running');
      if (autoSolveLabel !== null) btn.innerHTML = autoSolveLabel;
    }
    autoSolveLabel = null;
    if (out) out.textContent = '';
  }

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
    autoSolveLabel = oldLabel;
    var revision = autoSolveRevision;
    btn.innerHTML = '\u2699\uFE0F Working\u2026';
    out.innerHTML = '<p class="autosolve-runtime">Running every applicable solver\u2026</p>';

    autoSolveTimer = setTimeout(function () {
      autoSolveTimer = null;
      if (revision !== autoSolveRevision) return;
      var result;
      try {
        result = global.DetectiveSolvers.solveAuto(ciphertext, { stats: stats, ranked: ranked });
      } catch (err) {
        out.innerHTML = '<p class="autosolve-skip">Auto-Solve crashed: ' + esc(err && err.message || String(err)) + '</p>';
        btn.disabled = false;
        btn.classList.remove('autosolve-btn--running');
        btn.innerHTML = oldLabel;
        autoSolveLabel = null;
        return;
      }
      out.innerHTML = renderAutoSolveResult(result, ciphertext);
      btn.disabled = false;
      btn.classList.remove('autosolve-btn--running');
      btn.innerHTML = oldLabel;
      autoSolveLabel = null;
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
        '<h3 class="autosolve-best-method">Best-scoring candidate (unverified): ' + esc(best.method) + '</h3>' +
        '<span class="conf-badge conf-badge--' + esc(conf.tier) + '">' + esc(conf.label) + '</span>' +
      '</div>' +
      '<p class="autosolve-best-key"><strong>Key:</strong> ' + esc(best.key) + '</p>' +
      '<div class="autosolve-best-plain">' + esc(best.plaintext) + '</div>' +
      '<a class="autosolve-cta" href="lab/workbench.html#ct=' + encodedCt + '">Refine in the Workbench \u2192</a>' +
      '</div>';

    html += '<p class="autosolve-runtime">Unverified: the score ranks candidates under this embedded English model. It is not a language probability, a proof of the original message, or an authentication check. Short samples, names, other languages and repeated fragments can mislead. The 60-letter display guard is a teaching convention, not a reliability threshold.</p>';
    var model = global.DetectiveLangModel;
    if (model) {
      var letters = (best.plaintext || '').toUpperCase().replace(/[^A-Z]/g, '').length;
      function displayScore(value) { return Number.isFinite(value) ? value.toFixed(3) : 'not available'; }
      html += '<details><summary>Inspect this candidate’s model score</summary><p>' + letters + ' letters; ' + Math.max(0, letters - 1) + ' overlapping bigrams; ' + Math.max(0, letters - 2) + ' overlapping trigrams.</p>' +
        '<p>Trigram sum ' + displayScore(model.trigramScore(best.plaintext)) +
        ' + 0.4 × bigram sum ' + displayScore(model.bigramScore(best.plaintext)) +
        ' + word bonus ' + displayScore(model.wordBonus(best.plaintext)) +
        ' = total ' + displayScore(model.fitness(best.plaintext)) +
        '. Per letter: ' + displayScore(letters ? model.fitness(best.plaintext) / letters : -Infinity) +
        '. Higher is preferred by the search; these are heuristic units.</p></details>';
    }

    if (result.attempts.length > 1) {
      html += '<div class="autosolve-others">' +
        '<p class="autosolve-others-title">Other candidates considered</p>' +
        '<div class="autosolve-table-scroll" role="region" tabindex="0" aria-label="Other candidate results; scroll horizontally">' +
        '<table class="autosolve-others-table">' +
        '<thead><tr><th>Method</th><th>Per-char fit</th><th>Model-fit note</th><th>Plaintext start</th></tr></thead>' +
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
      html += '</tbody></table></div></div>';
    }

    html += '<p class="autosolve-runtime">Search completed in ' + result.runtimeMs + ' ms.</p>';
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
```


## JavaScript — js/detective/lang-model.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/detective/lang-model.js`
- Served SHA-256: `7c5e01f81df9885c9150841509d32c0d4408f034e7795e9986117c7cd317b483`
- Readable-source SHA-256: `7c5e01f81df9885c9150841509d32c0d4408f034e7795e9986117c7cd317b483`


```javascript
/* ================================================================
   THE CIPHER MUSEUM — English Language Model v1.0

   Compact statistical model used by the Detective's Auto-Solve
   engine to score how "English-like" a piece of candidate
   plaintext is. Higher score = more English-like.

   Approach:
     - Per-letter log probabilities (Norvig 2012 corpus)
     - Top ~80 English bigram log probabilities (Mayzner-revisited)
     - Top ~200 English trigram log probabilities
     - Bonus credit for ~120 most-common English words found
     - Fixed floor penalty for n-grams not in the table

   This ranking heuristic is not a calibrated language detector or
   a probability of authentic plaintext recovery.
   ================================================================ */
'use strict';

(function (global) {

  /* ── Letter log-probabilities (natural log, base e) ───────────
     Source: Norvig, "English Letter Frequency Counts: Mayzner
     Revisited or ETAOIN SRHLDCU" (2012). Frequencies-per-100
     converted to ln(p/100).                                      */
  var LETTER_LOG = {
    A: -2.521, B: -4.213, C: -3.398, D: -3.265, E: -2.080,
    F: -3.730, G: -3.978, H: -2.985, I: -2.581, J: -6.438,
    K: -5.222, L: -3.200, M: -3.685, N: -2.628, O: -2.572,
    P: -3.844, Q: -6.725, R: -2.768, S: -2.730, T: -2.378,
    U: -3.601, V: -4.554, W: -4.087, X: -6.073, Y: -4.097,
    Z: -7.013
  };

  /* ── Top English bigrams ──────────────────────────────────────
     Counts per million (Norvig/Mayzner 2012, normalised), turned
     into log-probabilities. Anything not in this table receives
     LOG_FLOOR (set below). Order roughly by frequency.           */
  var BIGRAM_FREQ = {
    TH: 3.56, HE: 3.07, IN: 2.43, ER: 2.05, AN: 1.99, RE: 1.85, ON: 1.76, AT: 1.49, EN: 1.45, ND: 1.35,
    TI: 1.34, ES: 1.34, OR: 1.28, TE: 1.20, OF: 1.17, ED: 1.17, IS: 1.13, IT: 1.12, AL: 1.09, AR: 1.07,
    ST: 1.05, TO: 1.04, NT: 1.04, NG: 0.95, SE: 0.93, HA: 0.93, AS: 0.87, OU: 0.87, IO: 0.83, LE: 0.83,
    VE: 0.83, CO: 0.79, ME: 0.79, DE: 0.76, HI: 0.76, RI: 0.73, RO: 0.73, IC: 0.70, NE: 0.69, EA: 0.69,
    RA: 0.69, CE: 0.65, LI: 0.62, CH: 0.60, LL: 0.58, BE: 0.58, MA: 0.57, SI: 0.55, OM: 0.55, UR: 0.54,
    CA: 0.54, EL: 0.54, TA: 0.53, LA: 0.53, NS: 0.51, DI: 0.50, FO: 0.50, HO: 0.49, PE: 0.49, EC: 0.48,
    PR: 0.48, NO: 0.47, CT: 0.46, US: 0.45, AC: 0.45, OT: 0.45, IL: 0.44, TR: 0.43, LY: 0.42, NC: 0.41,
    ET: 0.41, UT: 0.41, SS: 0.40, SO: 0.40, RS: 0.40, UN: 0.39, LO: 0.39, WA: 0.38, GE: 0.38, IE: 0.38,
    WH: 0.38, EE: 0.38, WI: 0.37, EM: 0.37, AD: 0.37, OL: 0.37, RT: 0.36, PO: 0.36, WE: 0.36, NA: 0.35,
    UL: 0.35, NI: 0.34, TS: 0.34, MO: 0.34, OW: 0.33, PA: 0.32, IM: 0.32, MI: 0.32, AI: 0.31, SH: 0.30,
    IR: 0.30, SU: 0.29, OS: 0.29, FI: 0.29, RY: 0.28, OD: 0.28, AB: 0.27, EI: 0.27, TT: 0.27, FE: 0.27,
    AM: 0.27, GO: 0.26, FA: 0.26, LU: 0.26, KE: 0.25, OO: 0.25, AY: 0.25, IF: 0.24, BO: 0.24, AP: 0.23,
    EP: 0.23, FU: 0.22, OB: 0.22, BU: 0.22
  };

  /* ── Top English trigrams ─────────────────────────────────────
     Counts per million (well-known published Mayzner-revisited
     values), normalised to relative frequency.                   */
  var TRIGRAM_FREQ = {
    THE: 3.51, AND: 1.59, ING: 1.15, HER: 0.82, HAT: 0.65, HIS: 0.60, THA: 0.59, ERE: 0.56, FOR: 0.54, ENT: 0.53,
    ION: 0.51, TER: 0.46, WAS: 0.46, YOU: 0.44, ITH: 0.43, VER: 0.43, ALL: 0.42, WIT: 0.40, THI: 0.39, TIO: 0.38,
    NDE: 0.37, HAS: 0.36, NCE: 0.36, EDT: 0.36, TIS: 0.34, OFT: 0.33, STH: 0.33, MEN: 0.32, HEN: 0.32, ITS: 0.32,
    HEY: 0.31, RES: 0.31, ATI: 0.30, FRO: 0.30, ATE: 0.30, ETH: 0.29, WHE: 0.29, OUT: 0.28, NTH: 0.28, FOU: 0.27,
    EAR: 0.27, OTH: 0.27, ENC: 0.26, ESS: 0.26, ITY: 0.26, ICA: 0.26, ITI: 0.26, EAT: 0.25, OUL: 0.25, INE: 0.25,
    WHI: 0.25, HAV: 0.25, HEI: 0.24, EVE: 0.24, ERS: 0.24, NOT: 0.24, TIN: 0.24, TED: 0.24, INT: 0.24, BUT: 0.24,
    LIK: 0.23, ARE: 0.23, EST: 0.23, ULD: 0.23, OUR: 0.23, ANT: 0.23, EDA: 0.23, RIN: 0.23, ART: 0.22, UND: 0.22,
    NDT: 0.22, RED: 0.22, EAS: 0.22, RAN: 0.22, REA: 0.22, ITT: 0.22, ESE: 0.22, REE: 0.22, AIN: 0.22, OME: 0.22,
    ROM: 0.21, INA: 0.21, NTO: 0.21, ATH: 0.21, IST: 0.21, USE: 0.21, COM: 0.21, NCO: 0.21, SIN: 0.20, IGH: 0.20,
    NDI: 0.20, HOU: 0.20, NLY: 0.20, EOF: 0.20, MAN: 0.20, ONE: 0.20, TON: 0.20, ROU: 0.20, AME: 0.20, IND: 0.19,
    RAT: 0.19, OUN: 0.19, SAN: 0.19, ETO: 0.19, TOR: 0.19, ANY: 0.19, RIE: 0.19, BEE: 0.19, OUS: 0.19, OWN: 0.18,
    EYO: 0.18, SHO: 0.18, RST: 0.18, TIM: 0.18, LIT: 0.18, GRE: 0.18, NES: 0.18, LIN: 0.18, IDE: 0.18, PER: 0.17,
    MOR: 0.17, ESA: 0.17, SOM: 0.17, EDI: 0.17, EDO: 0.17, NTE: 0.17, EAN: 0.17, ATA: 0.17, RIT: 0.17, THO: 0.17,
    ITE: 0.17, AST: 0.17, ICE: 0.17, IES: 0.16, WAY: 0.16, IGT: 0.16, ROC: 0.16, NEW: 0.16, SEA: 0.16, HEA: 0.16,
    ELL: 0.16, ETT: 0.16, IGN: 0.15, OSE: 0.15, ROW: 0.15, ROO: 0.15, GHT: 0.15, DTH: 0.15, ADE: 0.15, EAD: 0.15,
    INS: 0.15, ESI: 0.15, NDA: 0.15, CAN: 0.15, HAD: 0.15, HAN: 0.15, ABL: 0.15, HIN: 0.14, EOR: 0.14, BLE: 0.14,
    NDS: 0.14, ENA: 0.14, TUR: 0.14, IOU: 0.14, ANC: 0.14, LAN: 0.14, ETE: 0.14, ATT: 0.14, RTH: 0.13, ARS: 0.13,
    NIN: 0.13, RAC: 0.13, GAR: 0.13, NAL: 0.13, ASE: 0.13, TIC: 0.13, HEM: 0.13, DAN: 0.13, FIR: 0.13, VEN: 0.13,
    ICH: 0.13, IVE: 0.13, NTI: 0.13, TLY: 0.13, OND: 0.12, OST: 0.12, REM: 0.12, ENI: 0.12, TWO: 0.12, MOT: 0.12,
    ASA: 0.12, ANS: 0.12, AGE: 0.12, NTS: 0.12, RAI: 0.12, NDH: 0.12, BAC: 0.11, HEC: 0.11, RIG: 0.11, EFI: 0.11,
    OUG: 0.11, KIN: 0.11, THR: 0.11, ULT: 0.11, RIV: 0.11, EAC: 0.11, FIE: 0.11, WIL: 0.11, OFF: 0.10, ENE: 0.10,
    AVE: 0.10, ONS: 0.10, KNO: 0.10, ENS: 0.10, MIN: 0.10, OUC: 0.10, ESH: 0.10, IRS: 0.10, ATU: 0.10, EOP: 0.10,
    ANO: 0.10, SST: 0.10, SOF: 0.10, EFO: 0.10, SAI: 0.10, OPL: 0.10, FRE: 0.10, COU: 0.10
  };

  /* ── Common English words for word-bonus ─────────────────────
     Detecting any of these in the candidate plaintext is strong
     evidence we have something approaching English. Plain set so
     lookups are O(1).                                            */
  var COMMON_WORDS = (function () {
    var list = (
      'THE OF AND TO IN A IS THAT IT FOR YOU WAS WITH ON AS HAVE BUT BE ' +
      'THEY NOT BY THIS FROM WE ARE OR HAS AN HE HIS WHICH AT ONE SO ALL ' +
      'WOULD WILL THERE WHAT WHEN WHO HOW MAN SAID ABOUT MORE INTO THAN ' +
      'THEM ITS TIME LIKE HER SHE OUR OUT IF NO ANY ONLY MY SOME COULD ' +
      'OTHER UP DO BEEN MADE NOW MAY OVER VERY AFTER WAY DOWN WERE TWO ' +
      'NEW JUST WORK MUCH SHOULD WELL SUCH FIRST KNOW GET WHERE BECAUSE ' +
      'MOST DAY THESE ALSO PEOPLE EVEN GOOD MUST EACH MAKE LIFE THINK ' +
      'YEAR YEARS GOD LORD JESUS CHRIST KING POWER HEART HAND TODAY ' +
      'WORLD COME TAKE STILL HOME LONG NIGHT LITTLE WHILE TOO OLD MEN ' +
      'WOMEN GIVE FIND KEEP NEED HELP STAND HOLY SPIRIT FATHER SON LIGHT ' +
      'WORD BOOK HOUSE STREET MIND SOUL TRUE LOVE FREE DEEP HIGH HEAR ' +
      'CALL NAME PART SIDE CASE WORK PLACE NUMBER HEAD FACT GROUP SYSTEM ' +
      'PROGRAM QUESTION GOVERNMENT COMPANY BUSINESS COUNTRY HISTORY ' +
      'NATIONAL IMPORTANT SECRET MESSAGE CIPHER CODE KEY ENEMY WAR'
    ).split(/\s+/);
    var set = {};
    for (var i = 0; i < list.length; i++) {
      if (list[i].length >= 2) set[list[i]] = true;
    }
    return set;
  }());

  /* ── Pre-compute log-probability tables ──────────────────────
     Convert the relative-frequency tables into ln(p) values once.
     Using ln of the raw "per-cent of all bigrams" works fine
     because hill-climbing only needs correct *ranking*.          */
  var BIGRAM_LOG  = {};
  var TRIGRAM_LOG = {};
  (function build() {
    var k;
    for (k in BIGRAM_FREQ)  if (Object.prototype.hasOwnProperty.call(BIGRAM_FREQ,  k)) BIGRAM_LOG[k]  = Math.log(BIGRAM_FREQ[k]  / 100);
    for (k in TRIGRAM_FREQ) if (Object.prototype.hasOwnProperty.call(TRIGRAM_FREQ, k)) TRIGRAM_LOG[k] = Math.log(TRIGRAM_FREQ[k] / 100);
  }());

  /* Fixed penalties for unseen n-grams; these do not establish
     recovery rates, timing guarantees or language probabilities. */
  var BIGRAM_FLOOR  = Math.log(0.01 / 100);  /* unseen bigram  ≈ -9.2 */
  var TRIGRAM_FLOOR = Math.log(0.005 / 100); /* unseen trigram ≈ -9.9 */

  function lettersOnly(t) { return t.toUpperCase().replace(/[^A-Z]/g, ''); }

  /* ── Bigram score ─────────────────────────────────────────────
     Sum of log-probabilities over all overlapping bigrams. */
  function bigramScore(text) {
    var L = lettersOnly(text);
    if (L.length < 2) return -Infinity;
    var s = 0;
    for (var i = 0; i < L.length - 1; i++) {
      var bg = L.charAt(i) + L.charAt(i + 1);
      s += (bg in BIGRAM_LOG) ? BIGRAM_LOG[bg] : BIGRAM_FLOOR;
    }
    return s;
  }

  /* ── Trigram score ────────────────────────────────────────────
     Same shape as bigram. Trigrams give a stronger signal but are
     expensive on long text — fitness() blends both.              */
  function trigramScore(text) {
    var L = lettersOnly(text);
    if (L.length < 3) return -Infinity;
    var s = 0;
    for (var i = 0; i < L.length - 2; i++) {
      var tg = L.charAt(i) + L.charAt(i + 1) + L.charAt(i + 2);
      s += (tg in TRIGRAM_LOG) ? TRIGRAM_LOG[tg] : TRIGRAM_FLOOR;
    }
    return s;
  }

  /* ── Word bonus ───────────────────────────────────────────────
     Counts the common English words present in the original text,
     respecting word boundaries (any non-letter is a separator).
     Each hit adds a fixed bonus weighted by word length squared,
     so longer matches dominate.                                  */
  function wordBonus(text) {
    var bonus = 0;
    var words = text.toUpperCase().split(/[^A-Z]+/);
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (w.length >= 2 && (w in COMMON_WORDS)) {
        bonus += w.length * w.length * 0.55;
      }
    }
    return bonus;
  }

  /* ── Combined fitness ─────────────────────────────────────────
     The single number Auto-Solve maximises. Higher = more
     English-like. Returns roughly bigram+trigram log-prob plus
     a word-presence bonus. The trigram weight is 1.0; the bigram
     weight is 0.4 because trigrams already include bigram signal
     and we don't want to double-count too aggressively.          */
  function fitness(text) {
    var L = lettersOnly(text);
    if (L.length < 3) return -Infinity;
    return trigramScore(text) + 0.4 * bigramScore(text) + wordBonus(text);
  }

  /* Compatibility API: return presentation labels, never probabilities.
     The 60-letter display guard is a teaching convention, not a measured
     minimum. It does not change fitness or the solver's candidate ranking. */
  function confidenceLabel(fitnessVal, textLen) {
    if (!Number.isFinite(fitnessVal) || textLen < 3) {
      return { tier: 'inconclusive', label: 'Insufficient n-gram evidence' };
    }
    if (textLen < 60) {
      return { tier: 'inconclusive', label: 'Short sample — model fit not interpreted' };
    }
    return { tier: 'possible', label: 'Uncalibrated model fit' };
  }

  /* ── Export ──────────────────────────────────────────────────── */
  global.DetectiveLangModel = {
    fitness:         fitness,
    bigramScore:     bigramScore,
    trigramScore:    trigramScore,
    wordBonus:       wordBonus,
    confidenceLabel: confidenceLabel,
    /* exposed for testing */
    LETTER_LOG:      LETTER_LOG,
    BIGRAM_LOG:      BIGRAM_LOG,
    TRIGRAM_LOG:     TRIGRAM_LOG,
    COMMON_WORDS:    COMMON_WORDS,
    BIGRAM_FLOOR:    BIGRAM_FLOOR,
    TRIGRAM_FLOOR:   TRIGRAM_FLOOR
  };

})(typeof window !== 'undefined' ? window : global);
```


## JavaScript — js/detective/playback.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/detective/playback.js`
- Served SHA-256: `7c2c8f3a966e083f343c149b2dd6e734f99ca075c4dbc691c4c6cb6c1d382cd8`
- Readable-source SHA-256: `7c2c8f3a966e083f343c149b2dd6e734f99ca075c4dbc691c4c6cb6c1d382cd8`


```javascript
/* ================================================================
   THE CIPHER MUSEUM — Detective Playback v2.0

   window.DetectivePlayback — 7-step narrated investigation

   start(stats, ranked)  — begin at step 1
   next()                — advance one step
   back()                — go back one step
   skip()                — close / skip all

   Renders into #det-playback-area (inside #det-results).
   Each step: Case Notes narration + evidence card.
   ================================================================ */
'use strict';

(function (global) {

  var _stats  = null;
  var _ranked = null;
  var _step   = 0;
  var _steps  = [];

  /* ─── Utility ────────────────────────────────────────────────── */
  function esc(s) {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function el(id) {
    return typeof document !== 'undefined' ? document.getElementById(id) : null;
  }

  /* ─── Step definitions ───────────────────────────────────────── */
  function buildSteps(stats, ranked) {
    var s  = stats;
    var r  = ranked;

    /* Character set descriptions */
    var CHARSET_MSG = {
      alpha:  'Pure alphabetic text. Morse, numeric encodings, and ADFGVX are immediately ruled out.',
      morse:  'Morse code pattern: only dots, dashes, slashes, and spaces. Likely International Morse.',
      numeric:'Numeric-dominant text. Possible Polybius square, book cipher, or numeric code.',
      adfgvx: 'Only the letters A, D, F, G, V, X appear — a signature of the ADFGVX cipher (WWI).',
      adfgx:  'Only the letters A, D, F, G, X appear — consistent with the five-letter ADFGX variant.',
      mixed:  'Mixed character set. May contain Base64, hex, or special symbols alongside letters.',
      other:  'Unusual character set — no standard pattern matched.'
    };

    return [
      /* ── Step 1: Normalise ─── */
      {
        title: 'Step 1 of 7 \u2014 Preserve the Source, Choose a Projection',
        render: function () {
          return '<p class="pb-narration">Preserve the original transcription first. This Detective uppercases its input and extracts A\u2013Z for its letter statistics; characters outside that alphabet after conversion are excluded from those calculations. That is an analysis choice, not a universal preparation rule. Numeric groups, line breaks and uncertain glyphs can be evidence. Inspect them in the <a href="#transcription-workspace">transcription workspace</a> before choosing a projection. Character-set detection still examines the supplied text.</p>' +
            '<div class="pb-card">' +
              '<div class="pb-metrics-row">' +
                '<div class="pb-metric"><span class="pb-metric-label">Letters extracted</span>' +
                  '<span class="pb-metric-value">' + s.n + '</span></div>' +
                '<div class="pb-metric"><span class="pb-metric-label">Character set</span>' +
                  '<span class="pb-metric-value">' + esc(s.charset) + '</span></div>' +
              '</div>' +
              (s.n < 60 ? '<p class="pb-note pb-note--warn">\u26a0\ufe0f Short sample (' + s.n + ' letters). Statistics below may be unreliable \u2014 reliable analysis needs ~60+ letters.</p>' : '') +
            '</div>';
        }
      },

      /* ── Step 2: Character Set ─── */
      {
        title: 'Step 2 of 7 \u2014 Detect the Character Set',
        render: function () {
          var msg = CHARSET_MSG[s.charset] || 'Unrecognised pattern.';
          return '<p class="pb-narration">The character set is the fastest filter. Some ciphers declare themselves through the characters they use before any frequency work is needed. Morse is unmistakable. ADFGVX is nearly unmistakable. Everything else requires statistical tests.</p>' +
            '<div class="pb-card">' +
              '<p class="pb-finding"><strong>' + esc(s.charset) + ':</strong> ' + esc(msg) + '</p>' +
            '</div>';
        }
      },

      /* ── Step 3: Frequencies ─── */
      {
        title: 'Step 3 of 7 \u2014 Count Letter Frequencies',
        render: function () {
          var counts = s.counts || {};
          var n = s.n || 1;
          var sorted = Object.keys(counts).map(function (k) {
            return { ch: k, count: counts[k], pct: (counts[k] / n) * 100 };
          }).filter(function (x) { return x.count > 0; });
          sorted.sort(function (a, b) { return b.count - a.count; });
          var top5 = sorted.slice(0, 5);
          var rows = top5.map(function (x) {
            var bar = Math.round(x.pct * 2);  /* scale for 20-char max bar */
            return '<tr><td>' + esc(x.ch) + '</td><td>' + x.count + '</td>' +
              '<td>' + x.pct.toFixed(1) + '%</td>' +
              '<td><span class="pb-bar" style="width:' + Math.min(bar, 40) + 'ch" aria-hidden="true"></span></td></tr>';
          }).join('');

          return '<p class="pb-narration">Frequency analysis is the oldest recorded cryptanalytic technique \u2014 documented by al-Kindi in Baghdad around 850 AD. In English, E occurs ~12.7% of the time; T ~9.1%; A ~8.2%. A simple substitution cipher preserves this distribution, merely relabelling the peaks.</p>' +
            '<div class="pb-card">' +
              '<table class="pb-table" aria-label="Top-5 most frequent letters">' +
                '<caption>Top-5 letter frequencies</caption>' +
                '<thead><tr><th>Letter</th><th>Count</th><th>%</th><th></th></tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
              '</table>' +
            '</div>' +
            '<p class="pb-narration">In English plaintext the top-5 letters account for ~40% of all letters. In this ciphertext they account for ' +
              (top5.reduce(function (acc, x) { return acc + x.pct; }, 0)).toFixed(1) + '%. ' +
              (top5.length > 0 && top5[0].pct > 9 ? 'One letter dominates, consistent with monoalphabetic substitution or simple transposition.' : 'Distribution is spread out, consistent with a polyalphabetic cipher.') +
            '</p>';
        }
      },

      /* ── Step 4: IoC & Chi-square ─── */
      {
        title: 'Step 4 of 7 \u2014 Index of Coincidence & Chi-Square',
        render: function () {
          var ioc    = s.ioc;
          var chi0   = s.chi0;
          var bsr    = s.bestShiftResult || {};
          var iocCls = ioc >= 0.065 ? 'pb-high' : ioc >= 0.050 ? 'pb-mid' : 'pb-low';
          var iocMsg = ioc >= 0.065 ? 'Very high \u2014 typical of English plaintext, transposition, or simple monoalphabetic substitution.' :
                       ioc >= 0.055 ? 'Moderate-high \u2014 possible short polyalphabetic key or near-monoalphabetic substitution.' :
                       ioc >= 0.040 ? 'Moderate \u2014 consistent with Vigen\u00e8re or other polyalphabetic cipher.' :
                       'Very low \u2014 consistent with a long-key polyalphabetic cipher, OTP, or modern encryption.';

          return '<p class="pb-narration">William Friedman\u2019s Index of Coincidence (1922) measures how peaked the frequency distribution is. English text \u2248 0.067; a uniform random distribution \u2248 0.038. The chi-square test asks: if we shift the ciphertext back by some amount, how closely does it match English? A very low chi-square at a specific shift is strong evidence of a Caesar cipher.</p>' +
            '<div class="pb-card">' +
              '<div class="pb-metrics-row">' +
                '<div class="pb-metric"><span class="pb-metric-label">IoC</span>' +
                  '<span class="pb-metric-value ' + iocCls + '">' + ioc.toFixed(4) + '</span></div>' +
                '<div class="pb-metric"><span class="pb-metric-label">English baseline</span>' +
                  '<span class="pb-metric-value pb-muted">~0.067</span></div>' +
                '<div class="pb-metric"><span class="pb-metric-label">Base chi-square</span>' +
                  '<span class="pb-metric-value">' + chi0.toFixed(1) + '</span></div>' +
                '<div class="pb-metric"><span class="pb-metric-label">Best Caesar shift</span>' +
                  '<span class="pb-metric-value">' + (bsr.shift > 0 && bsr.chi < 200 ? 'Shift ' + bsr.shift + ' (\u03c7\u00b2 ' + bsr.chi.toFixed(1) + ')' : 'None strong') + '</span></div>' +
              '</div>' +
              '<p class="pb-finding">' + esc(iocMsg) + '</p>' +
            '</div>';
        }
      },

      /* ── Step 5: Period Analysis ─── */
      {
        title: 'Step 5 of 7 \u2014 Period Analysis (Kasiski / IoC)',
        render: function () {
          var ph = s.periodHint;
          var ks = s.kasiski || [];

          var periodHtml = ph
            ? '<div class="pb-metric"><span class="pb-metric-label">Likely key period</span>' +
              '<span class="pb-metric-value pb-high">' + ph + '</span></div>'
            : '';

          var kasHtml;
          if (ks.length > 0) {
            var rows = ks.slice(0, 4).map(function (k) {
              return '<tr><td>' + k.period + '</td><td>' + k.count + '</td></tr>';
            }).join('');
            kasHtml =
              '<table class="pb-table" aria-label="Kasiski period scores">' +
                '<caption>Kasiski repeated-trigram GCD scores</caption>' +
                '<thead><tr><th>Period</th><th>GCD score</th></tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
              '</table>';
          } else {
            kasHtml = '<p class="pb-note">No strong Kasiski trigram repeats detected \u2014 the text may be monoalphabetic or too short for trigram analysis (fewer than 40 letters).</p>';
          }

          return '<p class="pb-narration">Friedrich Kasiski noticed in 1863 that if a polyalphabetic cipher uses a repeating keyword, identical plaintext segments at the same key offset produce identical ciphertext segments. The spacing between those repeats is always a multiple of the key length. Period-sliced IoC provides a second statistical clue: splitting the ciphertext into every-n-th-letter strands raises each strand\u2019s IoC toward 0.067 when n is the key length or a suitable multiple; short samples and coincidental repeats can mislead.</p>' +
            '<div class="pb-card">' + periodHtml + kasHtml + '</div>' +
            (ph ? '<p class="pb-narration">Key period ' + ph + ' suggested by the available evidence; a statistical hint is not confirmation. If this repeating-key Vigenère hypothesis is correct, each of the ' + ph + ' strands can be tested as a Caesar cipher.</p>' : '<p class="pb-narration">No clear period detected. The cipher is likely monoalphabetic, transposition-based, or uses a very long key.</p>');
        }
      },

      /* ── Step 6: Suspect Ranking ─── */
      {
        title: 'Step 6 of 7 \u2014 Ranking the Suspects',
        render: function () {
          var suspects = r.suspects || [];
          var top3     = suspects.slice(0, 3);

          var susHtml = top3.map(function (sus, i) {
            var labels = ['1st', '2nd', '3rd'];
            var proItems = (sus.forEv || []).slice(0, 2).map(function (e) {
              return '<li class="evidence-item evidence-item--pro"><span aria-hidden="true">+</span>' + esc(e) + '</li>';
            }).join('');
            return '<div class="pb-suspect">' +
              '<div class="pb-suspect-header">' +
                '<span class="suspect-rank">' + labels[i] + '</span>' +
                '<span class="suspect-name">' + esc(sus.name) + '</span>' +
                '<span class="conf-badge ' + esc(sus.confidenceClass) + '">' + esc(sus.confidenceLabel) + '</span>' +
              '</div>' +
              (proItems ? '<ul class="evidence-list">' + proItems + '</ul>' : '') +
            '</div>';
          }).join('');

          return '<p class="pb-narration">All gathered evidence \u2014 character set, IoC, chi-square, best shift, period hint, digraph structure \u2014 feeds a weighted scoring function. Each cipher family starts with a prior score and accumulates points for matching indicators. The top-ranked cipher is the most likely candidate, not a certainty.</p>' +
            '<div class="pb-card">' + (susHtml || '<p class="pb-note">Insufficient data to rank suspects. Paste a longer ciphertext sample.</p>') + '</div>' +
            (r.caseNotes ? '<p class="pb-narration">' + esc(r.caseNotes) + '</p>' : '');
        }
      },

      /* ── Step 7: Recommended Attack ─── */
      {
        title: 'Step 7 of 7 \u2014 Recommended Next Attack',
        render: function () {
          var nxt = r.nextAttack;
          return '<p class="pb-narration">Statistics identify cipher families but cannot decrypt. Every family has a targeted attack technique. Here is the most promising one for this ciphertext \u2014 a starting hypothesis to test, not a guaranteed best attack.</p>' +
            '<div class="pb-card">' +
              (nxt
                ? '<p class="pb-finding">' + esc(nxt.text) + '</p>' +
                  (nxt.link ? '<p><a href="' + esc(nxt.link) + '" class="pb-link">' + esc(nxt.linkText || 'Learn more') + ' \u2192</a></p>' : '')
                : '<p class="pb-note">No specific attack recommended. Try the Attack Tools above or open the Codebreaker\u2019s Workbench.</p>') +
            '</div>' +
            '<p class="pb-narration pb-narration--final">Investigation complete. Use the Attack Tools above or the <a href="lab/workbench.html" class="pb-link">Codebreaker\u2019s Workbench</a> to attempt decryption.</p>';
        }
      }
    ];
  }

  /* ─── Render current step into #det-playback-area ───────────── */
  function renderStep() {
    var area = el('det-playback-area');
    if (!area) return;
    if (_step < 0 || _step >= _steps.length) return;

    var step = _steps[_step];
    var isLast = (_step === _steps.length - 1);

    area.innerHTML =
      '<div class="pb-overlay">' +
        '<div class="pb-header">' +
          '<span class="pb-step-title">' + esc(step.title) + '</span>' +
          '<button class="pb-close" id="det-pb-close" aria-label="Close playback">\u2715</button>' +
        '</div>' +
        '<div class="pb-body">' + step.render() + '</div>' +
        '<div class="pb-controls">' +
          '<button class="pb-btn pb-btn--secondary" id="det-pb-back"' +
            (_step === 0 ? ' disabled aria-disabled="true"' : '') + '>\u2190 Back</button>' +
          '<span class="pb-progress">' + (_step + 1) + ' / ' + _steps.length + '</span>' +
          (isLast
            ? '<button class="pb-btn" id="det-pb-finish">Finish \u2713</button>'
            : '<button class="pb-btn" id="det-pb-next">Next \u2192</button>') +
          '<button class="pb-btn pb-btn--ghost" id="det-pb-skip">Skip all</button>' +
        '</div>' +
      '</div>';

    /* Wire controls */
    var backBtn   = document.getElementById('det-pb-back');
    var nextBtn   = document.getElementById('det-pb-next');
    var finBtn    = document.getElementById('det-pb-finish');
    var skipBtn   = document.getElementById('det-pb-skip');
    var closeBtn  = document.getElementById('det-pb-close');

    if (backBtn)  backBtn.addEventListener('click',  back);
    if (nextBtn)  nextBtn.addEventListener('click',  next);
    if (finBtn)   finBtn.addEventListener('click',   skip);
    if (skipBtn)  skipBtn.addEventListener('click',  skip);
    if (closeBtn) closeBtn.addEventListener('click', skip);
  }

  /* ─── Public API ─────────────────────────────────────────────── */
  function start(stats, ranked) {
    _stats  = stats;
    _ranked = ranked;
    _step   = 0;
    _steps  = buildSteps(stats, ranked);

    var area = el('det-playback-area');
    if (!area) return;
    area.hidden = false;
    area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    renderStep();
  }

  function next() {
    if (_step < _steps.length - 1) {
      _step++;
      renderStep();
    }
  }

  function back() {
    if (_step > 0) {
      _step--;
      renderStep();
    }
  }

  function skip() {
    var area = el('det-playback-area');
    if (area) area.hidden = true;
  }

  /* ─── Export ─────────────────────────────────────────────────── */
  global.DetectivePlayback = {
    start: start,
    next:  next,
    back:  back,
    skip:  skip
  };

})(typeof window !== 'undefined' ? window : global);
```


## JavaScript — js/detective/render.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/detective/render.js`
- Served SHA-256: `b7af287631438b285c2d6373e1d832cfca3550623179663f022016a13b90eb7a`
- Readable-source SHA-256: `b7af287631438b285c2d6373e1d832cfca3550623179663f022016a13b90eb7a`


```javascript
/* ================================================================
   THE CIPHER MUSEUM — Detective Render v1.5

   DetectiveRender.draw(stats, ranked)  — write all sections to DOM
   DetectiveRender.clear()              — reset to empty state

   Pure DOM operations. Takes analysis stats + scoring results and
   writes to pre-existing slot elements. Does not perform analysis.
   Does not mutate application state.
   ================================================================ */
'use strict';

(function (global) {

  /* English letter frequencies as percentages, index 0=A … 25=Z.
     Fixed rounded English frequency heuristic; not a calibrated language probability. */
  var ENG_PCT = [
    8.167, 1.492, 2.782, 4.253,12.702, 2.228,
    2.015, 6.094, 6.966, 0.153, 0.772, 4.025,
    2.406, 6.749, 7.507, 1.929, 0.095, 5.987,
    6.327, 9.056, 2.758, 0.978, 2.360, 0.150,
    1.974, 0.074
  ];

  /* ─── DOM slot helpers ───────────────────────────────────────── */
  function el(id)  { return document.getElementById(id); }
  function set(id, html) { var e = el(id); if (e) e.innerHTML = html; }
  function txt(id, v)    { var e = el(id); if (e) e.textContent = v; }
  function show(id) { var e = el(id); if (e) e.hidden = false; }
  function hide(id) { var e = el(id); if (e) e.hidden = true; }

  /* ─── Stats panel ────────────────────────────────────────────── */
  function renderStats(stats) {
    txt('stat-length',  stats.n + ' letters');
    txt('stat-charset', stats.charset);
    txt('stat-ioc',     stats.ioc.toFixed(4) + ' (Eng ~0.066)');
    txt('stat-chi',     stats.chi0.toFixed(1));

    var bsr = stats.bestShiftResult;
    if (bsr.shift > 0 && bsr.chi < 150) {
      txt('stat-shift', 'Shift ' + bsr.shift + ' (χ² ' + bsr.chi.toFixed(1) + ')');
    } else {
      txt('stat-shift', 'None match English');
    }
    txt('stat-period', stats.periodHint ? stats.periodHint + ' (Kasiski/IoC)' : 'None detected');
  }

  /* ─── Reality labels strip ───────────────────────────────────── */
  function renderRealityLabels(labels) {
    var html = labels.map(function (lbl) {
      return '<span class="det-label" title="' + esc(lbl.title) + '">' + esc(lbl.text) + '</span>';
    }).join('');
    set('det-reality', html);
    show('det-reality');
  }

  /* ─── Short-text warning banner ─────────────────────────────── */
  function renderShortWarning(tooShort) {
    if (tooShort) { show('det-short-warning'); }
    else          { hide('det-short-warning'); }
  }

  /* ─── Frequency chart ────────────────────────────────────────── */
  /*
     SVG layout:
       viewBox 0 0 560 215
       Bars from y=175 upward (max height 155px, mapping 12.702% → 155px)
       Two bars per letter (cipher then English), A–Z alphabetical
       Cipher bar: solid gold; top-3 frequency letters use bright gold
       English bar: diagonal hatch overlay to distinguish without color alone
       Letter labels at y=190, legend at y=210
  */
  var SVG_W    = 560;
  var CHART_H  = 155;  /* max bar height in px */
  var BASE_Y   = 175;  /* y of the baseline */
  var LABEL_Y  = 190;
  var LEGEND_Y = 210;
  var SLOT_W   = 21;   /* px per letter group (2 bars + gaps) */
  var BAR_W    = 8;
  var BAR_GAP  = 2;    /* gap between cipher and English bar in a pair */
  var LEFT_PAD = 4;    /* left margin */
  var MAX_ENG  = 12.702; /* E frequency — scale everything to this */

  function buildFreqSVG(stats) {
    var letters = stats.letters;
    var n = stats.n || 1;
    var counts = stats.counts;

    /* Compute cipher percentages for each letter A–Z */
    var cipherPct = [];
    var i;
    for (i = 0; i < 26; i++) {
      var ch = String.fromCharCode(65 + i);
      cipherPct[i] = ((counts[ch] || 0) / n) * 100;
    }

    /* Find top-3 cipher letters by frequency */
    var ranked = cipherPct.map(function (p, idx) { return { idx: idx, p: p }; });
    ranked.sort(function (a, b) { return b.p - a.p; });
    var top3 = {};
    for (i = 0; i < 3 && i < ranked.length; i++) {
      if (ranked[i].p > 0) top3[ranked[i].idx] = true;
    }

    var svgParts = [
      '<svg viewBox="0 0 ' + SVG_W + ' 215" role="img" aria-label="Letter frequency comparison: ciphertext vs English" ',
      'style="width:100%;height:auto;display:block;">',
      '<defs>',
      /* Diagonal hatch for English bars — visually distinct without relying on color alone */
      '<pattern id="det-eng-hatch" x="0" y="0" width="4" height="4" ',
      'patternUnits="userSpaceOnUse">',
      '<line x1="0" y1="4" x2="4" y2="0" ',
      'stroke="rgba(193,169,88,0.55)" stroke-width="1.2"/>',
      '</pattern>',
      '</defs>',
      /* Baseline */
      '<line x1="' + (LEFT_PAD - 2) + '" y1="' + BASE_Y + '" x2="' + (LEFT_PAD + 26 * SLOT_W) + '" ',
      'y2="' + BASE_Y + '" ',
      'stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>'
    ];

    for (i = 0; i < 26; i++) {
      var x    = LEFT_PAD + i * SLOT_W;
      var engX = x + BAR_W + BAR_GAP;

      /* Cipher bar */
      var cH = Math.round(Math.min((cipherPct[i] / MAX_ENG) * CHART_H, CHART_H));
      var cY = BASE_Y - cH;
      var cFill = top3[i] ? '#D4B765' : 'rgba(212,183,101,0.45)';
      var leg = String.fromCharCode(65 + i);
      svgParts.push(
        '<rect x="' + x + '" y="' + cY + '" width="' + BAR_W + '" height="' + cH + '" ',
        'fill="' + cFill + '" aria-label="' + leg + ' ciphertext ' + cipherPct[i].toFixed(1) + '%"/>'
      );

      /* English bar (hatched) */
      var eH = Math.round((ENG_PCT[i] / MAX_ENG) * CHART_H);
      var eY = BASE_Y - eH;
      svgParts.push(
        '<rect x="' + engX + '" y="' + eY + '" width="' + BAR_W + '" height="' + eH + '" ',
        'fill="url(#det-eng-hatch)" stroke="rgba(193,169,88,0.35)" stroke-width="0.5" ',
        'aria-label="' + leg + ' English ' + ENG_PCT[i].toFixed(1) + '%"/>'
      );

      /* Letter label */
      svgParts.push(
        '<text x="' + (x + BAR_W - 1) + '" y="' + LABEL_Y + '" ',
        'text-anchor="middle" font-family="var(--fm,monospace)" font-size="6" ',
        'fill="rgba(255,255,255,' + (top3[i] ? '0.85' : '0.45') + '">' + leg + '</text>'
      );
    }

    /* Legend */
    svgParts.push(
      '<rect x="' + LEFT_PAD + '" y="' + (LEGEND_Y - 7) + '" width="8" height="7" fill="#D4B765"/>',
      '<text x="' + (LEFT_PAD + 11) + '" y="' + LEGEND_Y + '" font-family="var(--fm,monospace)" font-size="7" fill="rgba(255,255,255,0.55)">Ciphertext</text>',
      '<rect x="' + (LEFT_PAD + 72) + '" y="' + (LEGEND_Y - 7) + '" width="8" height="7" fill="url(#det-eng-hatch)" stroke="rgba(193,169,88,0.35)" stroke-width="0.5"/>',
      '<text x="' + (LEFT_PAD + 83) + '" y="' + LEGEND_Y + '" font-family="var(--fm,monospace)" font-size="7" fill="rgba(255,255,255,0.55)">English baseline</text>'
    );

    svgParts.push('</svg>');
    return svgParts.join('');
  }

  /* Accessible table (visually hidden) companion to the SVG chart. */
  function buildFreqTable(stats) {
    var n = stats.n || 1;
    var counts = stats.counts;
    var rows = '';
    for (var i = 0; i < 26; i++) {
      var ch = String.fromCharCode(65 + i);
      var cp = ((counts[ch] || 0) / n * 100).toFixed(1);
      var ep = ENG_PCT[i].toFixed(1);
      rows += '<tr><th scope="row">' + ch + '</th><td>' + cp + '%</td><td>' + ep + '%</td></tr>';
    }
    return '<table class="visually-hidden"><caption>Letter frequency comparison: ciphertext vs. standard English</caption>' +
           '<thead><tr><th scope="col">Letter</th><th scope="col">Ciphertext %</th><th scope="col">English %</th></tr></thead>' +
           '<tbody>' + rows + '</tbody></table>';
  }

  /* "What this suggests" line below the chart. */
  function buildFreqInterpretation(stats) {
    var ioc  = stats.ioc;
    var chi0 = stats.chi0;
    if (ioc >= 0.060 && chi0 < 80) {
      return 'The distribution is close to this English reference. Rearrangement is one possible explanation; the score does not identify the cipher.';
    }
    if (ioc >= 0.060 && chi0 >= 80) {
      return 'The frequency shape is compatible with a substituted English sample. Other languages, sample effects and other transformations remain possible.';
    }
    if (ioc >= 0.040) {
      return 'IoC is below a common English benchmark. This can occur with polyalphabetic substitution, but does not establish the cipher or its key length.';
    }
    return 'Low IoC alone cannot establish randomness, a long key, an OTP or modern encryption. Inspect the source and other evidence.';
  }

  function renderFreqChart(stats) {
    var wrap = el('det-freq-chart-wrap');
    if (!wrap) return;
    wrap.innerHTML = buildFreqSVG(stats) + buildFreqTable(stats);
    set('det-freq-interpretation', buildFreqInterpretation(stats));
  }

  /* ─── Suspects list ─────────────────────────────────────────── */
  function renderSuspects(suspects, tooShort) {
    var html = '';
    suspects.forEach(function (s, idx) {
      var rankLabel = ['1st', '2nd', '3rd', '4th', '5th'][idx] || (idx + 1) + 'th';

      /* Evidence pros */
      var proItems = s.forEv.map(function (e) {
        return '<li class="evidence-item evidence-item--pro"><span aria-hidden="true">+</span>' + esc(e) + '</li>';
      }).join('');

      /* Evidence cons */
      var conItems = s.againstEv.map(function (e) {
        return '<li class="evidence-item evidence-item--con"><span aria-hidden="true">−</span>' + esc(e) + '</li>';
      }).join('');

      var link = s.url ? '<div class="suspect-link"><a href="' + esc(s.url) + '">Read about this cipher →</a></div>' : '';

      html += '<div class="suspect-card" aria-label="Suspect ' + rankLabel + ': ' + esc(s.name) + '">' +
        '<div class="suspect-header">' +
          '<span class="suspect-rank">' + rankLabel + '</span>' +
          '<span class="suspect-name">' + esc(s.name) + '</span>' +
          '<span class="conf-badge ' + s.confidenceClass + '">' + esc(s.confidenceLabel) + '</span>' +
        '</div>' +
        '<ul class="evidence-list">' + proItems + conItems + '</ul>' +
        link +
        '</div>';
    });
    set('det-suspects-list', html || '<p class="det-muted">No strong cipher signatures detected. Try a longer sample.</p>');
  }

  /* ─── Case Notes ─────────────────────────────────────────────── */
  function renderCaseNotes(text) {
    set('det-case-notes', text ? '<p>' + esc(text) + '</p>' : '');
  }

  /* ─── Recommended Next Attack ────────────────────────────────── */
  function renderNextAttack(attack) {
    if (!attack) { set('det-next-attack', ''); return; }
    var linkHtml = attack.link
      ? '<div class="next-attack-link"><a href="' + esc(attack.link) + '">' + esc(attack.linkText) + '</a></div>'
      : '';
    set('det-next-attack',
      '<div class="next-attack-box">' +
        '<p class="next-attack-text">' + esc(attack.text) + '</p>' +
        linkHtml +
      '</div>');
  }

  /* ─── Attack Tool Buttons (v2) ───────────────────────────────── */
  var ATTACK_TOOLS = [
    { id: 'caesar',       label: 'Caesar Brute-Force',     short: 'Caesar BF'     },
    { id: 'rot13',        label: 'ROT13',                  short: 'ROT13'         },
    { id: 'atbash',       label: 'Atbash',                 short: 'Atbash'        },
    { id: 'morse',        label: 'Morse Decode',           short: 'Morse'         },
    { id: 'encoding',     label: 'Encoding Detect',        short: 'Encoding'      },
    { id: 'vigKeyLength', label: 'Vigen\u00e8re Key Length', short: 'Vigen\u00e8re KL' },
    { id: 'substFreq',    label: 'Substitution Freq.',     short: 'Subst. Freq'   }
  ];

  function renderAttackButtons(stats) {
    var toolsEl = el('det-attack-tools');
    if (!toolsEl) return;

    var hasAttacks = global.DetectiveAttacks;

    var buttons = ATTACK_TOOLS.map(function (t) {
      var applicable = hasAttacks
        ? global.DetectiveAttacks.isApplicable(t.id, stats)
        : { ok: true };
      var disabled = (!applicable.ok) ? ' disabled aria-disabled="true"' : '';
      var title    = (!applicable.ok && applicable.reason) ? ' title="' + esc(applicable.reason) + '"' : '';
      return '<button class="attack-btn' + (applicable.ok ? '' : ' attack-btn--disabled') + '" ' +
        'data-tool="' + esc(t.id) + '"' + disabled + title + '>' +
        esc(t.label) +
        '</button>';
    }).join('');

    toolsEl.innerHTML =
      '<div class="attack-tools-header">Attack Tools</div>' +
      '<div class="attack-tools-row">' + buttons + '</div>' +
      '<div class="attack-result" id="det-attack-result" aria-live="polite"></div>';

    toolsEl.hidden = false;
  }

  /* ─── Watch Button (v2) ──────────────────────────────────────── */
  function renderWatchButton() {
    var wrap = el('det-watch-wrap');
    if (!wrap) return;
    wrap.innerHTML =
      '<button class="watch-btn" id="det-watch-btn">' +
        '\u25b6 Watch Step-by-Step Investigation' +
      '</button>';
    wrap.hidden = false;
  }

  /* ─── Render an attack tool result (v2) ─────────────────────── */
  function renderAttackResult(html) {
    var out = el('det-attack-result');
    if (out) out.innerHTML = html;
  }

  /* ─── Public API ─────────────────────────────────────────────── */

  function draw(stats, ranked) {
    /* Hide empty, show results */
    hide('det-empty');
    show('det-results');

    renderStats(stats);
    renderRealityLabels(ranked.realityLabels);
    renderShortWarning(stats.tooShort);
    renderFreqChart(stats);
    renderSuspects(ranked.suspects, stats.tooShort);
    renderCaseNotes(ranked.caseNotes);
    renderNextAttack(ranked.nextAttack);

    /* v2 additions */
    renderAttackButtons(stats);
    renderWatchButton();
  }

  function clear() {
    show('det-empty');
    hide('det-results');
    hide('det-short-warning');
    hide('det-reality');
    hide('det-attack-tools');
    hide('det-watch-wrap');
    ['stat-length','stat-charset','stat-ioc','stat-chi','stat-shift','stat-period']
      .forEach(function (id) { txt(id, '—'); });
  }

  /* ─── Utility ────────────────────────────────────────────────── */
  function esc(s) {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  global.DetectiveRender = {
    draw: draw,
    clear: clear,
    renderAttackResult: renderAttackResult
  };

})(typeof window !== 'undefined' ? window : global);
```


## JavaScript — js/detective/scoring.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/detective/scoring.js`
- Served SHA-256: `7ba0094e5385f87e5d40d5c0d11f664444dbce0b3ab981c406c7254064098265`
- Readable-source SHA-256: `7ba0094e5385f87e5d40d5c0d11f664444dbce0b3ab981c406c7254064098265`


```javascript
/* ================================================================
   THE CIPHER MUSEUM — Detective Scoring v1.5

   window.DetectiveScoring.rank(stats) → { suspects, caseNotes,
                                            nextAttack, realityLabels }

   Takes the stats object produced by DetectiveAnalyses.run() and
   returns a ranked list of cipher-family suspects with confidence
   labels, evidence lists, case-notes narrative, and a single
   recommended next-attack.

   Pure: no DOM access. Depends only on DetectiveAnalyses being
   loaded first (uses DetectiveAnalyses._periodIoC).
   ================================================================ */
'use strict';

(function (global) {

  /* ─── Family registry ────────────────────────────────────────── */
  var FAMILIES = [
    { id: 'caesar',        name: 'Caesar / ROT Cipher',                   url: 'ciphers/caesar.html',      era: 'classical' },
    { id: 'simple-sub',    name: 'Monoalphabetic Substitution',            url: null,                       era: 'classical' },
    { id: 'vigenere',      name: 'Vigenère / Polyalphabetic',              url: 'ciphers/vigenere.html',    era: 'classical' },
    { id: 'transposition', name: 'Transposition (Columnar / Rail-Fence)',  url: 'ciphers/columnar.html',    era: 'classical' },
    { id: 'playfair',      name: 'Playfair Digraphic Cipher',              url: 'ciphers/playfair.html',    era: 'classical' },
    { id: 'adfgvx',        name: 'ADFGVX Fractionated (WWI German)',       url: 'ciphers/adfgvx.html',      era: 'classical' },
    { id: 'morse',         name: 'Morse Code',                             url: 'ciphers/morse.html',       era: 'classical' },
    { id: 'numeric',       name: 'Book Cipher / Numeric Code',             url: 'ciphers/book-cipher.html', era: 'classical' },
    { id: 'otp',           name: 'One-Time Pad / Random / Modern',         url: 'ciphers/one-time-pad.html',         era: 'modern'   },
    { id: 'bifid',         name: 'Bifid / Polybius Fractionated',          url: 'ciphers/bifid.html',       era: 'classical' }
  ];

  /* ─── Score one family against the analysis stats ────────────── */
  function scoreFamily(family, stats) {
    var n       = stats.n;
    var ioc     = stats.ioc;
    var chi0    = stats.chi0;
    var bsr     = stats.bestShiftResult;
    var kasiski = stats.kasiski;
    var charset = stats.charset;
    var dg      = stats.dg;
    var letters = stats.letters;
    var score   = 0;
    var forEv = [], againstEv = [];

    /* Grab periodIoC from analyses module — loaded before scoring. */
    var periodIoC = global.DetectiveAnalyses ? global.DetectiveAnalyses._periodIoC
                                              : function () { return 0; };

    switch (family) {

      case 'caesar':
        if (ioc >= 0.060) {
          score += 3; forEv.push('IoC ' + ioc.toFixed(4) + ' is near a common English benchmark; compatible with a single-alphabet cipher');
        } else if (ioc >= 0.054) {
          score += 1; forEv.push('IoC ' + ioc.toFixed(4) + ' is somewhat elevated');
        } else {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' is below the English benchmark; this does not exclude a single-alphabet cipher');
        }
        if (bsr.chi < 40) {
          score += 6; forEv.push('Shift ' + bsr.shift + ' gives chi-square ' + bsr.chi.toFixed(1) + ' — very strong match to English letter frequencies');
        } else if (bsr.chi < 80) {
          score += 4; forEv.push('Shift ' + bsr.shift + ' gives chi-square ' + bsr.chi.toFixed(1) + ' — good English match');
        } else if (bsr.chi < 150) {
          score += 1; forEv.push('Shift ' + bsr.shift + ' gives chi-square ' + bsr.chi.toFixed(1) + ' — passable English match');
        } else {
          againstEv.push('Best-shift chi-square ' + bsr.chi.toFixed(1) + ' — no single shift gives English-like distribution');
        }
        if (chi0 > 100 && bsr.chi < 100) {
          score += 1; forEv.push('Unshifted chi-square ' + chi0.toFixed(1) + ' is consistent with a fixed offset');
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters-only ciphertext — consistent with a letter cipher'); }
        if (ioc < 0.050) { score -= 3; }
        break;

      case 'simple-sub':
        if (ioc >= 0.060) {
          score += 3; forEv.push('IoC ' + ioc.toFixed(4) + ' is compatible with an English-language single-alphabet hypothesis');
        } else {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' — below a common English benchmark, but not an exclusion');
        }
        /* If no single shift explains the frequencies, the alphabet is scrambled. */
        if (bsr.chi >= 120) {
          score += 3; forEv.push('Chi-square remains high (' + bsr.chi.toFixed(1) + ') at every shift — no tested shift fits the English model well');
        } else if (bsr.chi >= 60) {
          score += 1;
        } else {
          againstEv.push('A single shift accounts for the frequency pattern — more consistent with Caesar');
        }
        if (dg.district >= 22) {
          score += 2; forEv.push(dg.district + ' distinct letters — rich usage typical of full-alphabet keyword substitution');
        } else if (dg.district >= 18) {
          score += 1; forEv.push(dg.district + ' distinct letters observed');
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters-only ciphertext'); }
        if (ioc < 0.050) { score -= 3; againstEv.push('Low IoC weakens this English-language heuristic; monoalphabetic substitution remains possible'); }
        break;

      case 'vigenere':
        if (ioc >= 0.040 && ioc <= 0.062) {
          score += 3; forEv.push('IoC ' + ioc.toFixed(4) + ' lies between random (0.038) and English (0.067) — compatible with some polyalphabetic samples, not a diagnostic interval');
        } else if (ioc > 0.062) {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' is above this heuristic range; polyalphabetic encryption can also produce high IoC');
        } else {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' is low; key length cannot be determined from this alone');
        }
        if (kasiski.length > 0) {
          var topK = kasiski[0];
          var pioc = periodIoC(letters, topK.period);
          if (pioc > 0.060) {
            score += 5; forEv.push('Kasiski test suggests period ' + topK.period + '; sliced-IoC ' + pioc.toFixed(4) + ' ≈ English — strongest Vigenère signature');
          } else if (pioc > 0.052) {
            score += 3; forEv.push('Kasiski period ' + topK.period + '; sliced-IoC ' + pioc.toFixed(4) + ' partially elevated');
          } else if (pioc > 0.044) {
            score += 1; forEv.push('Repeated trigrams point to period ' + topK.period + ' (period IoC moderate)');
          }
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters-only ciphertext'); }
        if (ioc > 0.066) { score -= 3; }
        if (charset !== 'alpha') { score -= 1; }
        break;

      case 'transposition':
        if (ioc >= 0.060) {
          score += 3; forEv.push('IoC ' + ioc.toFixed(4) + ' at English level — transposition preserves letter frequencies exactly');
        } else {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' — below a common English benchmark. Transposition preserves the input’s IoC, whatever its value');
        }
        if (chi0 < 50) {
          score += 5; forEv.push('Chi-square ' + chi0.toFixed(1) + ' — close fit to this English frequency model; it does not establish the transformation');
        } else if (chi0 < 100) {
          score += 3; forEv.push('Chi-square ' + chi0.toFixed(1) + ' — close to English frequencies, compatible with rearrangement');
        } else if (chi0 < 160) {
          score += 1; forEv.push('Chi-square ' + chi0.toFixed(1) + ' — moderately English-like');
        } else {
          againstEv.push('Chi-square ' + chi0.toFixed(1) + ' — substitution seems to have altered the frequencies');
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters only'); }
        if (bsr.chi < chi0 - 50) {
          againstEv.push('Shifting reduces chi-square — substitution likely occurred alongside any rearrangement');
        }
        if (ioc < 0.055) { score -= 3; againstEv.push('Low IoC under this English heuristic; pure transposition still preserves that exact input value'); }
        break;

      case 'playfair':
        if (dg.isEvenLen) {
          score += 2; forEv.push('Even letter count — Playfair always outputs an even number of letters');
        } else {
          score -= 2; againstEv.push('Odd letter count — Playfair output is always even-length');
        }
        if (dg.adjDupPairs === 0 && n >= 20) {
          score += 4; forEv.push('No duplicate letters in any consecutive digraph — the structural Playfair constraint');
        } else if (dg.adjDupPairs > 0) {
          score -= 3; againstEv.push(dg.adjDupPairs + ' digraph pair(s) with duplicate letters — Playfair never produces these');
        }
        if (dg.district === 25) {
          score += 3; forEv.push('Exactly 25 distinct letters — Playfair merges I and J into a 25-letter alphabet');
        } else if (dg.district >= 23) {
          score += 1; forEv.push(dg.district + ' distinct letters — near the 25-letter Playfair alphabet');
        }
        if (ioc >= 0.046 && ioc <= 0.065) {
          score += 2; forEv.push('IoC ' + ioc.toFixed(4) + ' — slightly flattened, typical for digraphic substitution');
        }
        if (n < 20) { score -= 1; againstEv.push('Sample too short for reliable Playfair identification'); }
        break;

      case 'adfgvx':
        if (charset === 'adfgvx') {
          score += 9; forEv.push('Every letter is A, D, F, G, V, or X — the ADFGVX fractionation alphabet (German WWI, June 1918)');
        } else if (charset === 'adfgx') {
          score += 7; forEv.push('Every letter is A, D, F, G, or X — ADFGX variant (German WWI, March–May 1918)');
        } else {
          againstEv.push('Ciphertext contains letters outside the ADFGVX set');
          score -= 3;
        }
        break;

      case 'morse':
        if (charset === 'morse') {
          score += 10; forEv.push('Text contains only dots (·), dashes (−), and spaces — standard Morse code structure');
        } else if (/[\.\-]{2,}/.test(stats.raw)) {
          score += 3; forEv.push('Dots and dashes present — possible Morse or Fractionated Morse');
        } else {
          score -= 5; againstEv.push('No dot/dash pattern — not standard Morse code');
        }
        break;

      case 'numeric':
        if (charset === 'numeric') {
          score += 8; forEv.push('Ciphertext is predominantly digits — book cipher, codebook, or numeric substitution');
        } else {
          var numTokens = (stats.raw.match(/\b\d+\b/g) || []).length;
          var allTokens = (stats.raw.match(/\S+/g) || []).length;
          var numRatio = numTokens / (allTokens || 1);
          if (numRatio > 0.60) { score += 5; forEv.push(Math.round(numRatio * 100) + '% of tokens are numbers'); }
          else if (numRatio > 0.30) { score += 2; forEv.push(Math.round(numRatio * 100) + '% of tokens are numbers'); }
          else { score -= 4; againstEv.push('Insufficient numeric tokens for a book or numeric cipher'); }
        }
        break;

      case 'otp':
        if (ioc >= 0.034 && ioc <= 0.044) {
          score += 5; forEv.push('IoC ' + ioc.toFixed(4) + ' ≈ 0.038, the uniform A–Z expectation. This statistic alone cannot establish randomness or identify a cipher');
        } else if (ioc > 0.044 && ioc <= 0.054) {
          score += 2; forEv.push('IoC ' + ioc.toFixed(4) + ' approaching random — could be a very long key');
        } else if (ioc > 0.060) {
          score -= 3; againstEv.push('IoC ' + ioc.toFixed(4) + ' — OTP/random output should approach ~0.038');
        }
        if (chi0 > 280) { score += 2; forEv.push('Very high chi-square (' + chi0.toFixed(1) + ') — no usable alphabetical ordering'); }
        if (kasiski.length === 0 || kasiski[0].count <= 2) {
          score += 1; forEv.push('No significant repeated trigrams — consistent with a unique key');
        } else {
          againstEv.push('Repeated trigrams found; random output, including a genuine OTP, can contain repetitions by chance');
        }
        if (charset === 'alpha' && dg.district >= 24) {
          score += 1; forEv.push('Many distinct letters appear; this alone does not establish randomness');
        }
        break;

      case 'bifid':
        if (ioc >= 0.044 && ioc <= 0.062) {
          score += 2; forEv.push('IoC ' + ioc.toFixed(4) + ' — fractionated ciphers partially flatten letter frequencies');
        }
        if (dg.district === 25) {
          score += 2; forEv.push('Exactly 25 distinct letters — Polybius square merges I and J (Bifid family)');
        } else if (dg.district >= 23 && dg.district <= 25) {
          score += 1; forEv.push(dg.district + ' distinct letters — close to the 25-letter Polybius constraint');
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters only'); }
        if (n >= 40) { score += 1; forEv.push(n + ' characters available for these heuristic comparisons; no detection guarantee'); }
        if (ioc > 0.065) { score -= 1; againstEv.push('IoC above this heuristic range; fractionated ciphers are not excluded'); }
        break;
    }

    return { score: Math.max(score, 0), forEv: forEv, againstEv: againstEv };
  }

  /* ─── Confidence label from score ────────────────────────────── */
  function scoreToLabel(score, maxScore, tooShort) {
    var pct = maxScore > 0 ? (score / maxScore) : 0;
    if (tooShort) {
      // Cap confidence for short inputs: even a strong score can't be trusted,
      // so the ceiling is 'Possible' regardless of how high pct climbs.
      if (pct >= 0.20) return 'Possible';
      if (pct >= 0.05) return 'Unlikely';
      return 'Inconclusive';
    }
    if (pct >= 0.85) return 'Strongest fit';
    if (pct >= 0.55) return 'Similar fit';
    if (pct >= 0.25) return 'Possible';
    if (pct >= 0.08) return 'Unlikely';
    return 'Inconclusive';
  }

  function labelClass(label) {
    return ({
      'Strongest fit': 'conf-very-likely',
      'Similar fit':  'conf-likely',
      'Possible':     'conf-possible',
      'Unlikely':     'conf-unlikely',
      'Inconclusive': 'conf-inconclusive'
    })[label] || 'conf-inconclusive';
  }

  /* ─── Case Notes narrative ────────────────────────────────────── */
  function buildCaseNotes(stats, topSuspect) {
    var sentences = [];
    var ioc  = stats.ioc;
    var chi0 = stats.chi0;
    var bsr  = stats.bestShiftResult;

    /* IoC reading */
    if (ioc >= 0.065) {
      sentences.push('The Index of Coincidence is ' + ioc.toFixed(4) + ', close to the English benchmark of ~0.067. The letter distribution looks like natural English — consistent with a cipher that substitutes or rearranges whole letters without mixing alphabets.');
    } else if (ioc >= 0.050) {
      sentences.push('The Index of Coincidence is ' + ioc.toFixed(4) + ' — between the English benchmark (~0.067) and the random baseline (~0.038). Some polyalphabetic samples fall here, but plaintext statistics, key and sample length affect the result.');
    } else if (ioc >= 0.036) {
      sentences.push('The Index of Coincidence is ' + ioc.toFixed(4) + ', approaching the random baseline of ~0.038. This value alone does not identify a long key, an OTP or modern encryption, or establish a uniform distribution.');
    } else {
      sentences.push('The Index of Coincidence is ' + ioc.toFixed(4) + ', below the uniform A–Z expectation, which is not a minimum for finite samples. Sample composition and length matter.');
    }

    /* Chi-square / best shift reading */
    if (chi0 < 50) {
      sentences.push('The letters already follow English proportions closely (unshifted chi-square: ' + chi0.toFixed(1) + '). The cipher likely rearranged rather than substituted letters — compare against a transposition family.');
    } else if (bsr.chi < 80 && bsr.shift > 0) {
      sentences.push('Shifting the ciphertext by ' + bsr.shift + ' position' + (bsr.shift === 1 ? '' : 's') + ' gives a chi-square of ' + bsr.chi.toFixed(1) + ' — a strong match to English. A single fixed offset likely maps the cipher alphabet onto plain text.');
    } else if (bsr.chi < 150) {
      sentences.push('Shift ' + bsr.shift + ' produces chi-square ' + bsr.chi.toFixed(1) + ' — a partial English match, but not definitive. Multiple alphabets or a scrambled keyword may be in play.');
    } else {
      sentences.push('No single shift brings the frequencies close to English (best chi-square: ' + bsr.chi.toFixed(1) + ' at shift ' + bsr.shift + '). The alphabet is likely scrambled rather than simply shifted, or multiple alphabets are at work.');
    }

    /* Kasiski hint */
    if (stats.kasiski.length > 0 && stats.periodHint) {
      sentences.push('Kasiski examination found repeated trigrams whose spacing GCDs suggest a key period around ' + stats.periodHint + '. Period-sliced IoC is another heuristic clue, not confirmation of a particular cipher or key length.');
    }

    /* Top suspect */
    if (topSuspect && topSuspect.score > 0) {
      sentences.push('Weighing all the evidence, the strongest match is ' + topSuspect.name + '.');
    } else {
      sentences.push('The evidence is mixed. A longer sample would sharpen the picture considerably.');
    }

    return sentences.join(' ');
  }

  /* ─── Recommended Next Attack ────────────────────────────────── */
  var ATTACK_MAP = {
    'caesar': {
      text: 'The evidence strongly suggests a Caesar or ROT cipher. There are only 25 possible shifts — try brute-forcing them on the Cryptanalysis page, scoring each candidate against English letter frequencies.',
      link: 'cryptanalysis.html', linkText: 'Frequency Analysis on Cryptanalysis →'
    },
    'simple-sub': {
      text: 'Try frequency analysis: map the most frequent ciphertext letters to E, T, A, O, I, N, and look for recognisable English patterns. The Cryptanalysis page has an interactive frequency-analysis tool.',
      link: 'cryptanalysis.html', linkText: 'Frequency Analysis →'
    },
    'vigenere': {
      text: 'The evidence suggests a polyalphabetic cipher. Use Kasiski examination and the Friedman test on the Cryptanalysis page to estimate the key length, then recover individual key letters by single-alphabet frequency analysis on each period slice.',
      link: 'cryptanalysis.html', linkText: 'Kasiski Examination →'
    },
    'transposition': {
      text: 'Letter frequencies match English but the order is scrambled. Try anagram-solving on short recognisable fragments first, then open the seeded columnar search to compare candidate widths and keys.',
      link: 'ciphers/columnar.html#advanced-search', linkText: 'Columnar search →'
    },
    'playfair': {
      text: 'The digraph evidence points to Playfair. Decryption requires recovering the 5×5 key square — typically via digraph frequency analysis and known-plaintext attack. Read the Playfair exhibit for the method.',
      link: 'ciphers/playfair.html', linkText: 'Playfair Cipher →'
    },
    'adfgvx': {
      text: 'The character set is compatible with ADFGX or ADFGVX, but does not prove either identification. This is a two-stage cipher: Polybius-square substitution followed by columnar transposition. Read the exhibit for the historical decryption approach.',
      link: 'ciphers/adfgvx.html', linkText: 'ADFGVX Cipher →'
    },
    'morse': {
      text: 'This looks like Morse code. Dots and dashes separated by spaces represent individual letters; slashes (/) separate words. Any standard Morse decoder will convert it.',
      link: 'ciphers/morse.html', linkText: 'Morse Code →'
    },
    'numeric': {
      text: 'This may be a book cipher or codebook. Identify the reference document indicated, then map each numeric code to its corresponding word or letter on that page.',
      link: 'ciphers/book-cipher.html', linkText: 'Book Cipher →'
    },
    'otp': {
      text: 'These letter-based statistics do not identify a modern cipher or prove secrecy. A long repeating key is not automatically an OTP. Establish the source, representation, key handling and available evidence before choosing an attack.',
      link: null, linkText: null
    },
    'bifid': {
      text: 'The fractionated-cipher signature suggests Bifid or a Polybius-family cipher. Decryption requires recovering the 5×5 key square and the period. The Bifid exhibit introduces the attack approach.',
      link: 'ciphers/bifid.html', linkText: 'Bifid Cipher →'
    },
    'inconclusive': {
      text: 'The evidence is mixed. Try a longer sample, consider whether the original plaintext might not be English, or run several attacks on the Cryptanalysis page and compare the results.',
      link: 'cryptanalysis.html', linkText: 'Cryptanalysis Techniques →'
    }
  };

  function buildNextAttack(topSuspect) {
    if (!topSuspect || topSuspect.score === 0) return ATTACK_MAP['inconclusive'];
    return ATTACK_MAP[topSuspect.id] || ATTACK_MAP['inconclusive'];
  }

  /* ─── Reality Labels ─────────────────────────────────────────── */
  function buildRealityLabels(stats, suspects) {
    var labels = [];
    var top = suspects && suspects[0];
    var n   = stats ? stats.n : 0;

    labels.push({ key: 'edu',   text: 'Educational demo',           title: 'This tool is for learning cryptanalysis. Results are heuristic rankings, not calibrated probabilities or definitive identifications.' });
    labels.push({ key: 'prob',  text: 'Relative heuristic fit', title: 'Labels compare hand-scored candidates; they are not measured probabilities and cannot guarantee identification.' });

    if (top && top.era === 'classical') {
      labels.push({ key: 'class', text: 'Classical cipher',   title: 'The top suspect is a classical (pre-modern) cipher family.' });
    }
    if (!top || top.id !== 'otp') {
      labels.push({ key: 'nomod', text: 'Classical model suggested', title: 'Classical ciphers are not computationally secure. Do not use them to protect sensitive data.' });
    }
    if (n < 200) {
      labels.push({ key: 'short', text: 'More text improves reliability', title: 'Samples under 200 characters give statistical tests less signal. A longer representative sample may help; it cannot guarantee identification.' });
    }
    return labels;
  }

  /* ─── Main entry point ────────────────────────────────────────── */
  function rank(stats) {
    if (!stats) {
      return {
        suspects:      [],
        caseNotes:     '',
        nextAttack:    ATTACK_MAP['inconclusive'],
        realityLabels: []
      };
    }

    var results = FAMILIES.map(function (f) {
      var s = scoreFamily(f.id, stats);
      return { id: f.id, name: f.name, url: f.url, era: f.era,
               score: s.score, forEv: s.forEv, againstEv: s.againstEv };
    });

    results.sort(function (a, b) { return b.score - a.score; });

    var maxScore = Math.max(results[0].score, 1);

    /* Top 3–5 suspects with positive scores (always at least 1). */
    var suspects = results.filter(function (r) { return r.score > 0; }).slice(0, 5);
    if (suspects.length === 0) suspects = [results[0]];

    suspects.forEach(function (r) {
      r.confidenceLabel = scoreToLabel(r.score, maxScore, stats.tooShort);
      r.confidenceClass = labelClass(r.confidenceLabel);
    });

    return {
      suspects:      suspects,
      caseNotes:     buildCaseNotes(stats, suspects[0]),
      nextAttack:    buildNextAttack(suspects[0]),
      realityLabels: buildRealityLabels(stats, suspects)
    };
  }

  /* ─── Export ─────────────────────────────────────────────────── */
  global.DetectiveScoring = {
    rank: rank,
    _scoreToLabel:       scoreToLabel,
    _buildNextAttack:    buildNextAttack,
    _buildRealityLabels: buildRealityLabels
  };

})(typeof window !== 'undefined' ? window : global);
```


## JavaScript — js/detective/solvers.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/detective/solvers.js`
- Served SHA-256: `7ca2a3d405d8db405bcb70f30baee8e6f82e69d90f6b392d31047eefef949a70`
- Readable-source SHA-256: `7ca2a3d405d8db405bcb70f30baee8e6f82e69d90f6b392d31047eefef949a70`


```javascript
/* ================================================================
   THE CIPHER MUSEUM — Detective Auto-Solvers v1.0

   window.DetectiveSolvers — automatic decryption attempts that go
   beyond the basic Attack Tools panel. Each solver does enough
   cryptanalysis to recover (or strongly hint at) the plaintext
   for a small but historically vital family of ciphers:

       solveCaesar       — best of 25 shifts, scored by language model
       solveRot13        — single transform, scored
       solveAtbash       — single transform, scored
       solveVigenere     — Kasiski/IoC key length + per-column chi-square
       solveSubstitution — hill climbing with random restarts
       solveColumnar     — exhaustive search on column count + ordering

   Top-level entry:
       solveAuto(ciphertext, opts)
         → runs the appropriate solvers given the analysis stats
           and returns a ranked list of plaintext candidates.

   All solvers depend on:
       window.DetectiveAttacks      (basic transforms)
       window.DetectiveAnalyses     (IoC, chi-square, period-IoC)
       window.DetectiveLangModel    (English fitness scoring)

   Performance budget per solver call: roughly 1-3 seconds in a
   modern browser. Heavy loops are bounded so the page stays
   responsive even on phones.
   ================================================================ */
'use strict';

(function (global) {

  var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /* ─── Helpers ─────────────────────────────────────────────────── */
  function lettersOnly(t) {
    return (t || '').toUpperCase().replace(/[^A-Z]/g, '');
  }

  /* Re-inject spaces / punctuation from the original ciphertext into
     a letter-only decrypted string so the user sees readable output. */
  function respace(ct, decLetters) {
    var out = '', li = 0;
    var upper = (ct || '').toUpperCase();
    for (var i = 0; i < upper.length; i++) {
      var ch = upper[i];
      if (ch >= 'A' && ch <= 'Z') {
        out += (li < decLetters.length) ? decLetters[li++] : ch;
      } else {
        out += ch;
      }
    }
    return out;
  }

  function score(text) {
    var letters = lettersOnly(text);
    var f = global.DetectiveLangModel.fitness(text);
    var perChar = letters.length > 0 ? f / letters.length : -Infinity;
    var conf = global.DetectiveLangModel.confidenceLabel(f, letters.length);
    return { fitness: f, perChar: perChar, confidence: conf, length: letters.length };
  }

  function makeResult(method, key, plaintext, extra) {
    var s = score(plaintext);
    var r = {
      method:     method,
      key:        key,
      plaintext:  plaintext,
      fitness:    s.fitness,
      perChar:    s.perChar,
      confidence: s.confidence
    };
    if (extra) for (var k in extra) if (extra.hasOwnProperty(k)) r[k] = extra[k];
    return r;
  }

  /* ─── Caesar ──────────────────────────────────────────────────── */
  function solveCaesar(ct) {
    var letters = lettersOnly(ct);
    if (letters.length < 4) return null;

    var best = null;
    for (var shift = 0; shift < 26; shift++) {
      var dec = '';
      for (var i = 0; i < letters.length; i++) {
        dec += ALPHA[((letters.charCodeAt(i) - 65 - shift + 26) % 26)];
      }
      var pt = respace(ct, dec);
      var f  = global.DetectiveLangModel.fitness(pt);
      if (!best || f > best._f) best = { _f: f, shift: shift, plaintext: pt };
    }
    return makeResult('Caesar', 'shift = ' + best.shift, best.plaintext, { shift: best.shift });
  }

  function solveRot13(ct) {
    var dec = global.DetectiveAttacks.rot13(ct).decrypted;
    return makeResult('ROT13', '(self-inverse)', dec);
  }

  function solveAtbash(ct) {
    var dec = global.DetectiveAttacks.atbash(ct).decrypted;
    return makeResult('Atbash', '(reverse alphabet)', dec);
  }

  /* ─── Vigenère ─────────────────────────────────────────────────
     Step 1: pick best key length using existing Kasiski + period-IoC.
     Step 2: for each key-length candidate, recover each key letter
             by chi-square against English on its own column.
     Step 3: decrypt with the recovered key, score, keep best.       */
  function solveVigenere(ct) {
    var letters = lettersOnly(ct);
    if (letters.length < 30) return null;

    /* Try several plausible key lengths and keep the winner. */
    var lenCandidates = [];
    var kl = global.DetectiveAttacks.vigKeyLength(ct, 16);
    if (kl && kl.candidates && kl.candidates.length) {
      for (var i = 0; i < kl.candidates.length; i++) {
        lenCandidates.push(kl.candidates[i].length);
      }
    }
    /* Always include a few small lengths as a safety net. */
    [2,3,4,5,6,7,8].forEach(function (L) {
      if (lenCandidates.indexOf(L) === -1) lenCandidates.push(L);
    });

    var best = null;
    for (var li = 0; li < lenCandidates.length; li++) {
      var L = lenCandidates[li];
      if (L < 2 || L > 16) continue;
      /* Need at least ~8 letters per column for chi-square to be reliable.
         If the ciphertext is too short, skip this length entirely so we
         don't overfit and steal credit from a simpler cipher. */
      if (letters.length / L < 8) continue;

      /* Recover each key letter by chi-square on its column. */
      var key = '';
      for (var col = 0; col < L; col++) {
        var colStr = '';
        for (var p = col; p < letters.length; p += L) colStr += letters[p];
        if (colStr.length < 2) { key += 'A'; continue; }

        var bestShift = 0, bestChi = Infinity;
        for (var s = 0; s < 26; s++) {
          var chi = global.DetectiveAnalyses._chiSquareAtShift(colStr, s);
          if (chi < bestChi) { bestChi = chi; bestShift = s; }
        }
        key += ALPHA[bestShift];
      }

      /* Decrypt with recovered key. */
      function decryptWithKey(kStr) {
        var d = '';
        for (var j = 0; j < letters.length; j++) {
          var ks2 = kStr.charCodeAt(j % L) - 65;
          d += ALPHA[((letters.charCodeAt(j) - 65 - ks2 + 26) % 26)];
        }
        return d;
      }
      var dec = decryptWithKey(key);
      var pt  = respace(ct, dec);
      var f   = global.DetectiveLangModel.fitness(pt);

      /* Polish: chi-square can pick the wrong column shift by ±1
         when the column is short. Walk through each key letter and
         try alternative shifts, accepting any improvement under the
         full-text language model. Two passes is enough in practice. */
      for (var pass = 0; pass < 2; pass++) {
        for (var pi = 0; pi < L; pi++) {
          for (var altShift = 0; altShift < 26; altShift++) {
            var altKey = key.substr(0, pi) + ALPHA[altShift] + key.substr(pi + 1);
            if (altKey === key) continue;
            var altDec = decryptWithKey(altKey);
            var altPt  = respace(ct, altDec);
            var altF   = global.DetectiveLangModel.fitness(altPt);
            if (altF > f) { key = altKey; dec = altDec; pt = altPt; f = altF; }
          }
        }
      }

      if (!best || f > best._f) best = { _f: f, key: key, length: L, plaintext: pt };
    }

    if (!best) return null;
    return makeResult('Vigenère', best.key + '  (length ' + best.length + ')',
                      best.plaintext, { keyLength: best.length, keyword: best.key });
  }

  /* ─── Monoalphabetic Substitution ─────────────────────────────
     Hill climbing with random restarts. Each "key" is a 26-char
     string mapping ciphertext A..Z to plaintext letters. We start
     from a frequency-aligned seed (most common cipher letter →
     ETAOIN order), then repeatedly swap two output letters,
     keeping any swap that improves the language fitness.

     Bounded to ~5 restarts × ~2000 iterations to stay snappy.    */
  function solveSubstitution(ct) {
    var letters = lettersOnly(ct);
    if (letters.length < 30) return null;

    /* Pre-encode ciphertext as numeric indices for speed.
       We also keep a template that mirrors the original ciphertext
       with placeholders for letters and the literal characters for
       spaces/punctuation, so the language model can use word
       boundaries for its word-bonus heuristic. */
    var ctUpper = (ct || '').toUpperCase();
    var ctIdx = new Array(letters.length);
    var template = '';      /* same length as ctUpper; '\0' marks letter slot */
    var slotPositions = []; /* indices into template where letters go */
    var li = 0;
    for (var ti = 0; ti < ctUpper.length; ti++) {
      var ch0 = ctUpper.charCodeAt(ti);
      if (ch0 >= 65 && ch0 <= 90) {
        ctIdx[li] = ch0 - 65;
        template += '\0';
        slotPositions.push(ti);
        li++;
      } else {
        template += ctUpper[ti];
      }
    }
    var templateArr = template.split('');

    /* Frequency-aligned seed key. */
    var counts = new Array(26);
    for (var c = 0; c < 26; c++) counts[c] = { idx: c, n: 0 };
    for (var k = 0; k < ctIdx.length; k++) counts[ctIdx[k]].n++;
    counts.sort(function (a, b) { return b.n - a.n; });
    var ETAOIN = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';

    /* seedKey[ciphertextIndex] = plaintextLetter */
    var seedKey = new Array(26);
    for (var ci = 0; ci < 26; ci++) seedKey[counts[ci].idx] = ETAOIN[ci];

    function decryptWith(key) {
      /* Builds the FULLY-RESPACED plaintext so the language model's
         word-bonus heuristic can act on real word boundaries. */
      var out = templateArr.slice();
      for (var p = 0; p < ctIdx.length; p++) out[slotPositions[p]] = key[ctIdx[p]];
      return out.join('');
    }

    var bestOverall = null;
    var RESTARTS = 25;
    var ITER_CAP = 3000;

    for (var r = 0; r < RESTARTS; r++) {
      /* Restart 0 uses pure ETAOIN seed; later restarts are fully
         random Fisher-Yates shuffles to escape the seed's basin
         of attraction when it traps us. */
      var key;
      if (r === 0) {
        key = seedKey.slice();
      } else {
        /* Fully random shuffle of the alphabet. */
        key = ALPHA.split('');
        for (var fy = 25; fy > 0; fy--) {
          var jj = (Math.random() * (fy + 1)) | 0;
          var tt = key[fy]; key[fy] = key[jj]; key[jj] = tt;
        }
      }

      /* Track best ever for this restart, plus current working state.
         Pure greedy: always revert losing swaps, never explore worse. */
      var pt   = decryptWith(key);
      var curF = global.DetectiveLangModel.fitness(pt);
      var stagnation = 0;

      for (var it = 0; it < ITER_CAP && stagnation < 400; it++) {
        var a = (Math.random() * 26) | 0;
        var b = (Math.random() * 26) | 0;
        if (a === b) continue;
        var t = key[a]; key[a] = key[b]; key[b] = t;
        var newPt = decryptWith(key);
        var newF  = global.DetectiveLangModel.fitness(newPt);
        if (newF > curF) {
          curF = newF;
          pt   = newPt;
          stagnation = 0;
        } else {
          /* revert */
          var t2 = key[a]; key[a] = key[b]; key[b] = t2;
          stagnation++;
        }
      }

      if (!bestOverall || curF > bestOverall._f) {
        bestOverall = { _f: curF, key: key.slice(), plaintext: pt };
      }
    }

    /* Final exhaustive single-swap polish on the global best. */
    var polishKey = bestOverall.key.slice();
    var polishPt  = bestOverall.plaintext;
    var polishF   = bestOverall._f;
    var improved = true;
    var safety = 0;
    while (improved && safety < 5) {
      improved = false; safety++;
      for (var aa2 = 0; aa2 < 26; aa2++) {
        for (var bb2 = aa2 + 1; bb2 < 26; bb2++) {
          var t3 = polishKey[aa2]; polishKey[aa2] = polishKey[bb2]; polishKey[bb2] = t3;
          var trial = decryptWith(polishKey);
          var trialF = global.DetectiveLangModel.fitness(trial);
          if (trialF > polishF) {
            polishF = trialF; polishPt = trial; improved = true;
          } else {
            var t4 = polishKey[aa2]; polishKey[aa2] = polishKey[bb2]; polishKey[bb2] = t4;
          }
        }
      }
    }
    bestOverall = { _f: polishF, key: polishKey, plaintext: polishPt };

    /* Build a human-readable key string: A→?, B→?, ... */
    var keyStr = '';
    for (var ki = 0; ki < 26; ki++) {
      keyStr += ALPHA[ki] + '\u2192' + bestOverall.key[ki] + (ki < 25 ? ' ' : '');
    }

    return makeResult('Simple Substitution', keyStr, bestOverall.plaintext,
                      { keyMap: bestOverall.key.join('') });
  }

  /* ─── Columnar Transposition ──────────────────────────────────
     For each plausible column count k (2..10):
       - Lay out ciphertext into k columns of equal-ish height.
       - For k ≤ 7, exhaustively try all k! column orderings.
       - For 8 ≤ k ≤ 10, hill climb on the column ordering.
     Score every reading with the English language model and
     keep the strongest.                                          */
  function solveColumnar(ct, options) {
    if (options && options.advanced) {
      if (!global.ColumnarSearch) throw new Error('Advanced columnar search is not loaded.');
      var advanced = options.width ? global.ColumnarSearch.solve(ct, options) : global.ColumnarSearch.unknownWidth(ct, options).best;
      if (!advanced || !advanced.best) return null;
      return makeResult('Columnar Transposition', advanced.width + ' columns, bounded seeded search', advanced.best.plaintext,
        { columns: advanced.width, order: advanced.best.order, evaluations: advanced.evaluations, preprocessing: advanced.preprocessing, verified: false });
    }
    var letters = lettersOnly(ct);
    if (letters.length < 20) return null;

    var bestOverall = null;

    /* Standard columnar transposition is keyed by a column ORDER.
       Plaintext is written row-by-row into a k-wide grid with rows
       = ceil(n/k); the LONG columns (those that have one extra letter)
       are the original column indices [0 .. n mod k - 1]. The cipher-
       text is produced by reading columns in `order` and concatenating
       them. So decryption depends on the candidate order: for each
       position c in the order, the chunk length is `rows` if order[c]
       is a long column, else `rows-1`. */
    function decryptWithOrder(text, order) {
      var n        = text.length;
      var k        = order.length;
      var rows     = Math.ceil(n / k);
      var longCols = n - (rows - 1) * k;          /* count of original cols with `rows` letters */

      /* Build per-original-column data. */
      var cols = new Array(k);
      var idx  = 0;
      for (var c = 0; c < k; c++) {
        var origCol = order[c];
        var h = (origCol < longCols) ? rows : (rows - 1);
        cols[origCol] = text.substr(idx, h);
        idx += h;
      }

      var out = '';
      for (var r = 0; r < rows; r++) {
        for (var oc = 0; oc < k; oc++) {
          if (r < cols[oc].length) out += cols[oc][r];
        }
      }
      return out;
    }

    function permute(arr) {
      var results = [];
      function helper(curr, remaining) {
        if (remaining.length === 0) { results.push(curr); return; }
        for (var i = 0; i < remaining.length; i++) {
          var nextRem = remaining.slice(0, i).concat(remaining.slice(i + 1));
          helper(curr.concat([remaining[i]]), nextRem);
        }
      }
      helper([], arr);
      return results;
    }

    for (var k = 2; k <= 10; k++) {
      if (k > letters.length) break;
      var bestForK = null;

      if (k <= 7) {
        /* Exhaustive: 5040 permutations max. */
        var idxs = [];
        for (var ii = 0; ii < k; ii++) idxs.push(ii);
        var perms = permute(idxs);
        for (var pi = 0; pi < perms.length; pi++) {
          var dec = decryptWithOrder(letters, perms[pi]);
          var f   = global.DetectiveLangModel.fitness(dec);
          if (!bestForK || f > bestForK._f) {
            bestForK = { _f: f, order: perms[pi].slice(), plaintext: dec };
          }
        }
      } else {
        /* Hill climb: start from identity, swap two columns each step. */
        var order = [];
        for (var oi = 0; oi < k; oi++) order.push(oi);
        var dec0 = decryptWithOrder(letters, order);
        var bestF = global.DetectiveLangModel.fitness(dec0);
        var bestOrder = order.slice();
        var bestPlain = dec0;
        var stag = 0;
        for (var it = 0; it < 3000 && stag < 500; it++) {
          var a = (Math.random() * k) | 0;
          var b = (Math.random() * k) | 0;
          if (a === b) continue;
          var tmp = order[a]; order[a] = order[b]; order[b] = tmp;
          var newDec = decryptWithOrder(letters, order);
          var newF   = global.DetectiveLangModel.fitness(newDec);
          if (newF > bestF) {
            bestF = newF; bestOrder = order.slice(); bestPlain = newDec;
            stag = 0;
          } else {
            var t2 = order[a]; order[a] = order[b]; order[b] = t2;
            stag++;
          }
        }
        bestForK = { _f: bestF, order: bestOrder, plaintext: bestPlain };
      }

      if (bestForK && (!bestOverall || bestForK._f > bestOverall._f)) {
        bestOverall = { _f: bestForK._f, k: k, order: bestForK.order, plaintext: bestForK.plaintext };
      }
    }

    if (!bestOverall) return null;
    var keyStr = bestOverall.k + ' columns, read order: ' + bestOverall.order.map(function (n) { return n + 1; }).join('-');
    return makeResult('Columnar Transposition', keyStr,
                      respace(ct, bestOverall.plaintext),
                      { columns: bestOverall.k, order: bestOverall.order });
  }

  /* ─── Top-level dispatcher ────────────────────────────────────
     Decides which solvers to run based on the analysis stats and
     ranked suspects, executes them, and returns a sorted attempt
     list.                                                        */
  function solveAuto(ciphertext, opts) {
    opts = opts || {};
    var stats = opts.stats || (global.DetectiveAnalyses ?
                global.DetectiveAnalyses.run(ciphertext) : null);
    var ranked = opts.ranked || (stats && global.DetectiveScoring ?
                global.DetectiveScoring.rank(stats) : null);

    var attempts = [];
    var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    /* Skip everything if the input isn't alphabetic enough. */
    if (!stats || stats.charset !== 'alpha' || stats.n < 4) {
      return {
        ranOn:    stats ? stats.charset : 'unknown',
        attempts: [],
        best:     null,
        runtimeMs: 0,
        skipped:  'Auto-Solve runs on alphabetic ciphertext (≥ 4 letters).'
      };
    }

    /* Always cheap to try: Caesar, ROT13, Atbash. */
    safePush(attempts, function () { return solveCaesar(ciphertext); });
    safePush(attempts, function () { return solveRot13(ciphertext); });
    safePush(attempts, function () { return solveAtbash(ciphertext); });

    /* Polyalphabetic? Try Vigenère. */
    if (stats.n >= 30 && stats.ioc < 0.063) {
      safePush(attempts, function () { return solveVigenere(ciphertext); });
    }

    /* Substitution-like (low chi-square already, or IoC near monoalpha)?
       Hill-climb anyway when we have enough letters — it's bounded. */
    if (stats.n >= 50) {
      safePush(attempts, function () { return solveSubstitution(ciphertext); });
    }

    /* Transposition signal: IoC near English (~0.067) is a hint that
       the underlying letter distribution is unchanged. Or always try
       if the user explicitly asked. */
    if (stats.n >= 20 && (stats.ioc > 0.060 || opts.includeAll)) {
      safePush(attempts, function () { return solveColumnar(ciphertext); });
    }

    var t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    attempts.sort(function (a, b) { return b.fitness - a.fitness; });

    return {
      ranOn:     stats.charset,
      attempts:  attempts,
      best:      attempts[0] || null,
      runtimeMs: Math.round(t1 - t0)
    };
  }

  function safePush(arr, fn) {
    try {
      var r = fn();
      if (r) arr.push(r);
    } catch (e) {
      /* never let one solver break the whole run */
      if (typeof console !== 'undefined' && console.warn) console.warn('[Solvers]', e);
    }
  }

  /* ─── Export ─────────────────────────────────────────────────── */
  global.DetectiveSolvers = {
    solveAuto:         solveAuto,
    solveCaesar:       solveCaesar,
    solveRot13:        solveRot13,
    solveAtbash:       solveAtbash,
    solveVigenere:     solveVigenere,
    solveSubstitution: solveSubstitution,
    solveColumnar:     solveColumnar
  };

})(typeof window !== 'undefined' ? window : global);
```


## JavaScript — js/detective/workspaces.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/detective/workspaces.js`
- Served SHA-256: `5613416b26fa4103525f7eb0d0f554cc0a8dc478ddfc1fbe5c37e93c1ae9449d`
- Readable-source SHA-256: `5613416b26fa4103525f7eb0d0f554cc0a8dc478ddfc1fbe5c37e93c1ae9449d`


```javascript
/* Manual substitution and source-preserving transcription workspaces.
 * Reading: Sweigart (2018), ch.17; Esslinger (2024), ch.3 §§3.4–3.5.1.
 * Original teaching fixtures; no third-party dictionary or manuscript data.
 */
'use strict';
(function (global) {
  var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function validMap(map) {
    var seen = {};
    return Object.keys(map).every(function (key) {
      var value = map[key];
      if (!/^[A-Z]$/.test(key) || !/^[A-Z]$/.test(value) || seen[value]) return false;
      seen[value] = true; return true;
    });
  }
  function mergeWord(map, cipher, plain) {
    if (cipher.length !== plain.length) return null;
    var next = copy(map);
    for (var i = 0; i < cipher.length; i++) {
      if (next[cipher[i]] && next[cipher[i]] !== plain[i]) return null;
      next[cipher[i]] = plain[i];
    }
    return validMap(next) ? next : null;
  }
  function decode(text, map) {
    // Only ASCII letters belong to this alphabet; never silently transliterate.
    return text.replace(/[a-z]/gi, function (letter) { return map[letter.toUpperCase()] || '·'; });
  }
  function pattern(word) {
    var ids = {}, next = 0;
    return word.split('').map(function (letter) {
      if (!Object.prototype.hasOwnProperty.call(ids, letter)) ids[letter] = next++;
      return ids[letter];
    }).join('.');
  }
  function Desk(text) { this.state = { text: text || '', map: {}, locks: {} }; this.history = []; }
  Desk.prototype.save = function () { this.history.push(copy(this.state)); if (this.history.length > 100) this.history.shift(); };
  Desk.prototype.setText = function (text) {
    if (text === this.state.text) return;
    this.save(); this.state = { text: text, map: {}, locks: {} };
  };
  Desk.prototype.assign = function (cipher, plain) {
    if (!/^[A-Z]$/.test(cipher) || !/^[A-Z]?$/.test(plain)) throw new Error('Use one A–Z letter, or leave the entry blank.');
    if (this.state.locks[cipher]) throw new Error('Unlock ' + cipher + ' before editing its mapping.');
    var next = copy(this.state.map);
    if (plain) next[cipher] = plain; else delete next[cipher];
    if (!validMap(next)) throw new Error('That plaintext letter is already assigned to another cipher letter.');
    this.save(); this.state.map = next;
  };
  Desk.prototype.lock = function (cipher, locked) {
    if (!/^[A-Z]$/.test(cipher) || (locked && !this.state.map[cipher])) throw new Error('Assign a letter before locking it.');
    this.save(); if (locked) this.state.locks[cipher] = true; else delete this.state.locks[cipher];
  };
  Desk.prototype.undo = function () { if (this.history.length) this.state = this.history.pop(); };
  Desk.prototype.clear = function () {
    this.save(); var self = this;
    Object.keys(this.state.map).forEach(function (key) { if (!self.state.locks[key]) delete self.state.map[key]; });
  };
  Desk.prototype.suggest = function (suggestions) {
    var next = copy(this.state.map), added = 0;
    suggestions.forEach(function (suggestion) {
      if (next[suggestion.cipher]) return;
      var trial = copy(next); trial[suggestion.cipher] = suggestion.plain;
      if (validMap(trial)) { next = trial; added++; }
    });
    if (added) { this.save(); this.state.map = next; }
    return added;
  };
  Desk.prototype.apply = function (map) {
    if (!validMap(map)) throw new Error('Candidate is not a one-to-one mapping.');
    var self = this;
    Object.keys(this.state.map).forEach(function (key) {
      if (map[key] !== self.state.map[key]) throw new Error('Candidate conflicts with the current key. Compare patterns again.');
    });
    this.save(); this.state.map = copy(map);
  };

  function candidates(text, dictionary, map) {
    if (!/^[A-Za-z\s]*$/.test(text)) throw new Error('Pattern matching needs resolved A–Z words separated by whitespace. Do not turn unknown symbols or punctuation into guessed word boundaries.');
    var words = Array.from(new Set((text.match(/[A-Za-z]+/g) || []).map(function (word) { return word.toUpperCase(); })));
    var dict = dictionary.trim() ? dictionary.trim().split(/\s+/) : [];
    if (dict.length > 100 || dict.some(function (word) { return !/^[a-z]{1,20}$/i.test(word); })) throw new Error('Use at most 100 A–Z dictionary words, each 1–20 letters long.');
    if (!words.length || words.length > 8 || words.some(function (word) { return word.length > 20; })) throw new Error('Use 1–8 distinct cipherwords, each 1–20 letters long; supply word boundaries yourself.');
    dict = Array.from(new Set(dict.map(function (word) { return word.toUpperCase(); })));
    var local = words.map(function (word) { return dict.filter(function (guess) { return pattern(word) === pattern(guess) && !!mergeWord(map, word, guess); }); });
    var allowed = words.map(function () { return new Set(); }), solutions = [], visits = 0, complete = true;
    function search(index, current, chosen) {
      if (++visits > 5000) { complete = false; return; }
      if (index === words.length) {
        solutions.push({ map: current, words: chosen });
        chosen.forEach(function (word, i) { allowed[i].add(word); }); return;
      }
      for (var i = 0; i < local[index].length; i++) {
        var next = mergeWord(current, words[index], local[index][i]);
        if (next) search(index + 1, next, chosen.concat(local[index][i]));
        if (!complete) return;
      }
    }
    search(0, copy(map), []);
    return { words: words, local: local, compatible: allowed.map(function (set) { return Array.from(set); }), solutions: solutions, complete: complete };
  }

  function tokenize(raw, mode, width) {
    if (typeof raw !== 'string' || raw.length > 10000) throw new Error('The transcription must be text no longer than 10,000 characters.');
    if (['symbols', 'digits', 'letters'].indexOf(mode) < 0 || [1, 2, 5].indexOf(width) < 0) throw new Error('Choose a supported alphabet and token width.');
    var tokens = [], excluded = [], spaces = 0, uppercased = 0, group = '', start = 0;
    function flush() { if (group) { tokens.push({ text: group, start: start, incomplete: Array.from(group).length < width }); group = ''; } }
    Array.from(raw).forEach(function (ch, index) {
      if (/\s/u.test(ch)) { spaces++; flush(); return; }
      var keep = mode === 'symbols' || ch === '?' || (mode === 'digits' ? /^[0-9]$/.test(ch) : /^[A-Za-z]$/.test(ch));
      if (!keep) { excluded.push({ symbol: ch, position: index + 1 }); flush(); return; }
      if (mode === 'letters' && /^[a-z]$/.test(ch)) { uppercased++; ch = ch.toUpperCase(); }
      if (!group) start = index + 1;
      group += ch;
      if (Array.from(group).length === width) flush();
    });
    flush();
    var projection = raw.replace(/[^A-Za-z]/g, '').toUpperCase();
    return { tokens: tokens, excluded: excluded, spaces: spaces, uppercased: uppercased, projection: projection,
      projectionRemoved: Array.from(raw).filter(function (ch) { return !/^[A-Za-z]$/.test(ch); }).length };
  }
  function validateDocument(value) {
    if (!value || value.version !== 1 || value.kind !== 'cipher-museum-transcription' || !value.annotations || typeof value.annotations !== 'object' || Array.isArray(value.annotations)) throw new Error('This is not a supported transcription export.');
    var result = tokenize(value.raw, value.mode, value.width), annotations = {};
    Object.keys(value.annotations).forEach(function (key) {
      if (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= result.tokens.length || ['uncertain', 'missing'].indexOf(value.annotations[key]) < 0) throw new Error('An annotation has an invalid position or status.');
      annotations[key] = value.annotations[key];
    });
    return { version: 1, kind: 'cipher-museum-transcription', raw: value.raw, mode: value.mode, width: value.width, annotations: annotations };
  }
  function projectionAllowed(doc, result) {
    return doc.raw.indexOf('?') < 0 && Object.keys(doc.annotations).length === 0 && result.projection.length > 0;
  }

  function boot() {
    var d = document;
    function el(id) { return d.getElementById(id); }
    if (!el('manual-key') || !el('prep-raw')) return;
    var desk = new Desk(el('manual-cipher').value), lastCandidates = null;
    function status(message) { el('manual-status').textContent = message || ''; }
    function renderDesk() {
      el('manual-cipher').value = desk.state.text;
      ALPHABET.split('').forEach(function (cipher) {
        el('manual-map-' + cipher).value = desk.state.map[cipher] || '';
        el('manual-map-' + cipher).readOnly = !!desk.state.locks[cipher];
        el('manual-lock-' + cipher).checked = !!desk.state.locks[cipher];
      });
      el('manual-plain').textContent = decode(desk.state.text, desk.state.map);
      el('manual-undo').disabled = !desk.history.length;
      el('manual-apply').disabled = true; lastCandidates = null;
      el('manual-candidates').textContent = 'Compare patterns to see candidates for the current text and key.';
    }
    ALPHABET.split('').forEach(function (cipher) {
      var cell = d.createElement('div'); cell.className = 'det-key-cell';
      var label = d.createElement('label'); label.htmlFor = 'manual-map-' + cipher; label.textContent = cipher + ' →';
      var input = d.createElement('input'); input.type = 'text'; input.id = label.htmlFor; input.maxLength = 1; input.autocomplete = 'off'; input.setAttribute('aria-label', 'Plaintext for cipher ' + cipher);
      input.addEventListener('change', function () { try { desk.assign(cipher, input.value.trim().toUpperCase()); status('Mapping updated.'); } catch (e) { status(e.message); } renderDesk(); });
      var lockLabel = d.createElement('label'); lockLabel.className = 'det-lock';
      var checkbox = d.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = 'manual-lock-' + cipher; checkbox.setAttribute('aria-label', 'Lock cipher ' + cipher);
      checkbox.addEventListener('change', function () { try { desk.lock(cipher, checkbox.checked); status('Lock updated.'); } catch (e) { status(e.message); } renderDesk(); });
      lockLabel.appendChild(checkbox); lockLabel.appendChild(d.createTextNode('Lock'));
      cell.appendChild(label); cell.appendChild(input); cell.appendChild(lockLabel); el('manual-key').appendChild(cell);
    });
    function newText(text) { var changed = text !== desk.state.text; desk.setText(text); renderDesk(); status(changed ? 'New ciphertext loaded; the key is clear. Undo restores the previous desk.' : 'Ciphertext is unchanged; your current key and locks are retained.'); }
    el('manual-cipher').addEventListener('change', function () { newText(this.value); });
    el('manual-copy').addEventListener('click', function () { newText(el('detective-input').value); });
    el('manual-example').addEventListener('click', function () { newText('ABBA AB'); el('manual-words').value = 'NOON DEED NO DO'; });
    el('manual-undo').addEventListener('click', function () { desk.undo(); renderDesk(); status('Restored the previous text, key and locks.'); });
    el('manual-clear').addEventListener('click', function () { desk.clear(); renderDesk(); status('Cleared unlocked mappings.'); });
    el('manual-frequency').addEventListener('click', function () {
      var suggestions = global.DetectiveAttacks ? global.DetectiveAttacks.substFreqSuggestions(desk.state.text).mapping : [];
      var count = desk.suggest(suggestions); renderDesk(); status('Added ' + count + ' frequency guesses; existing assignments and locks are unchanged.');
    });
    el('manual-words').addEventListener('input', function () { lastCandidates = null; el('manual-apply').disabled = true; el('manual-candidates').textContent = 'Dictionary changed. Compare patterns again.'; });
    el('manual-patterns').addEventListener('click', function () {
      try {
        lastCandidates = candidates(desk.state.text, el('manual-words').value, desk.state.map);
        var result = lastCandidates;
        el('manual-candidates').textContent = result.words.map(function (word, index) {
          return word + ' [' + pattern(word) + ']\n  Pattern + current key: ' + (result.local[index].join(', ') || 'none') + '\n  Compatible across all words: ' + (result.compatible[index].join(', ') || 'none');
        }).join('\n\n') + '\n\n' + (result.complete ? result.solutions.length + ' compatible full assignment(s) within this dictionary.' : 'Search stopped at 5,000 steps. Candidate lists are partial; no uniqueness claim can be made.');
        el('manual-apply').disabled = !(result.complete && result.solutions.length === 1);
        status('Patterns compared. These are dictionary-dependent hypotheses.');
      } catch (e) { lastCandidates = null; el('manual-apply').disabled = true; status(e.message); }
    });
    el('manual-apply').addEventListener('click', function () {
      if (!lastCandidates || !lastCandidates.complete || lastCandidates.solutions.length !== 1) return;
      try { desk.apply(lastCandidates.solutions[0].map); renderDesk(); status('Applied the sole compatible candidate in this dictionary. This is not proof of the original plaintext.'); } catch (e) { status(e.message); }
    });
    renderDesk();

    var prep = { version: 1, kind: 'cipher-museum-transcription', raw: el('prep-raw').value, mode: el('prep-mode').value, width: Number(el('prep-width').value), annotations: {} };
    function prepStatus(message) { el('prep-status').textContent = message || ''; }
    function renderPrep() {
      var result = tokenize(prep.raw, prep.mode, prep.width);
      el('prep-raw').value = prep.raw; el('prep-mode').value = prep.mode; el('prep-width').value = String(prep.width);
      el('prep-losses').textContent = result.tokens.length + ' tokens; ' + result.spaces + ' whitespace characters kept in the original, used as group boundaries; ' + result.uppercased + ' lowercase letters uppercased in tokens. Excluded from tokens: ' + (result.excluded.length ? result.excluded.length + ' symbol(s): ' + result.excluded.slice(0, 30).map(function (item) { return JSON.stringify(item.symbol) + ' at character ' + item.position; }).join(', ') + (result.excluded.length > 30 ? ' …' : '') : 'none') + '.';
      var body = el('prep-tokens'); body.textContent = '';
      result.tokens.slice(0, 300).forEach(function (token, index) {
        var tr = d.createElement('tr'), pos = d.createElement('td'), text = d.createElement('td'), state = d.createElement('td'), select = d.createElement('select');
        pos.textContent = (index + 1) + ' (character ' + token.start + ')';
        text.textContent = token.text + (token.incomplete ? ' [incomplete group]' : '');
        ['read', 'uncertain', 'missing'].forEach(function (value) { var option = d.createElement('option'); option.value = value; option.textContent = value === 'read' ? 'As transcribed' : value === 'uncertain' ? 'Uncertain reading' : 'Missing token'; select.appendChild(option); });
        select.value = prep.annotations[index] || 'read'; select.setAttribute('aria-label', 'Status of token ' + (index + 1));
        select.addEventListener('change', function () { if (select.value === 'read') delete prep.annotations[index]; else prep.annotations[index] = select.value; renderPrep(); var replacement = el('prep-tokens').querySelectorAll('select')[index]; if (replacement) replacement.focus(); prepStatus('Annotation saved for token ' + (index + 1) + '.'); });
        state.appendChild(select); tr.appendChild(pos); tr.appendChild(text); tr.appendChild(state); body.appendChild(tr);
      });
      if (result.tokens.length > 300) { var row = d.createElement('tr'), note = d.createElement('td'); note.colSpan = 3; note.textContent = 'Showing the first 300 tokens. All tokens and annotations remain in the export and counts.'; row.appendChild(note); body.appendChild(row); }
      var counts = new Map();
      result.tokens.forEach(function (token, index) { var key = token.text + (prep.annotations[index] ? ' [' + prep.annotations[index] + ']' : token.text.indexOf('?') >= 0 ? ' [unreadable symbol]' : ''); counts.set(key, (counts.get(key) || 0) + 1); });
      el('prep-frequencies').textContent = Array.from(counts).map(function (entry) { return entry[0] + ': ' + entry[1]; }).join('  |  ') || 'No tokens in this alphabet.';
      el('prep-projection').textContent = result.projection || '(no A–Z letters)';
      var permitted = projectionAllowed(prep, result);
      el('prep-projection-note').textContent = 'This separate projection removes ' + result.projectionRemoved + ' non-ASCII-letter characters, including whitespace, and uppercases ASCII letters. It ignores the selected token width. ' + (permitted ? 'Review this loss before sending it to the Detective. The original stays here.' : 'Sending is blocked while any symbol is unreadable, uncertain or missing, or no A–Z letters remain. Resolve uncertainty explicitly first; dropping a position can invalidate a positional attack.');
      el('prep-send').disabled = !permitted;
    }
    function readPrep() {
      if (Object.keys(prep.annotations).length) { renderPrep(); prepStatus('Change refused: first review and explicitly clear the annotations, or mark each token as transcribed. Changing the alphabet or width does not resolve uncertainty.'); return; }
      prep.raw = el('prep-raw').value; prep.mode = el('prep-mode').value; prep.width = Number(el('prep-width').value); renderPrep(); prepStatus('Transcription or tokenization changed; the original text remains in this workspace.');
    }
    el('prep-clear-annotations').addEventListener('click', function () { prep.annotations = {}; renderPrep(); prepStatus('Annotations explicitly cleared after review. Any question marks still block sending a projection.'); });
    ['prep-raw', 'prep-mode', 'prep-width'].forEach(function (id) { el(id).addEventListener('change', readPrep); });
    el('prep-copy').addEventListener('click', function () { if (Object.keys(prep.annotations).length) { prepStatus('Copy refused: export a copy if needed, then explicitly clear the current annotations before replacing the transcription.'); return; } if (el('detective-input').value.length > 10000) { prepStatus('Copy refused: this workspace accepts up to 10,000 characters. Keep the full source separately and deliberately select an excerpt.'); return; } el('prep-raw').value = el('detective-input').value; readPrep(); prepStatus('Copied Detective input into an independent transcription.'); });
    el('prep-example').addEventListener('click', function () { prep.raw = '12 ?4 56\n12 34 5? ◆'; prep.mode = 'digits'; prep.width = 2; prep.annotations = { '1': 'uncertain' }; renderPrep(); prepStatus('Original exercise: compare widths 1 and 2, and try the all-symbols alphabet to retain the diamond. Question marks keep unreadable positions visible.'); });
    el('prep-send').addEventListener('click', function () {
      var result = tokenize(prep.raw, prep.mode, prep.width); if (!projectionAllowed(prep, result)) return;
      el('detective-input').value = result.projection; el('detective-input').dispatchEvent(new Event('input', { bubbles: true })); prepStatus('Sent only the reviewed A–Z projection. Original transcription and annotations remain here.');
    });
    function exportPrep() { var json = JSON.stringify(validateDocument(prep), null, 2); el('prep-json').value = json; prepStatus('Export includes the exact original transcription, alphabet, width and positional annotations.'); return json; }
    el('prep-export').addEventListener('click', exportPrep);
    if (el('prep-evidence')) el('prep-evidence').addEventListener('click', function () {
      try {
        global.sessionStorage.setItem('museum-evidence-import', JSON.stringify(validateDocument(prep)));
        global.location.href = 'lab/evidence-workbench.html';
      } catch (e) { prepStatus('Could not transfer the record. Export JSON and import it in the Evidence Workbench. ' + e.message); }
    });
    el('prep-download').addEventListener('click', function () {
      var json = exportPrep();
      if (!global.URL || !global.URL.createObjectURL) { prepStatus('Use the exported JSON text below to save this transcription.'); return; }
      var url = global.URL.createObjectURL(new Blob([json], { type: 'application/json' })), link = d.createElement('a');
      link.href = url; link.download = 'cipher-museum-transcription.json'; d.body.appendChild(link); link.click(); link.remove(); setTimeout(function () { global.URL.revokeObjectURL(url); }, 1000);
    });
    el('prep-import').addEventListener('click', function () { try { if (el('prep-json').value.length > 100000) throw new Error('Export is too large.'); prep = validateDocument(JSON.parse(el('prep-json').value)); renderPrep(); prepStatus('Restored the exact transcription and its annotations.'); } catch (e) { prepStatus('Could not load transcription: ' + e.message); } });
    renderPrep();
  }
  var api = { Desk: Desk, decode: decode, pattern: pattern, candidates: candidates, tokenize: tokenize, validateDocument: validateDocument, projectionAllowed: projectionAllowed };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.DetectiveWorkspaces = api;
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot(); }
})(typeof window !== 'undefined' ? window : globalThis);
```


## JavaScript — js/footer.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/footer.js`
- Served SHA-256: `1d5cc4bd041628cc32d535b7aa5e3bbea67b6bce16d250273e0960be6d690d1d`
- Readable-source SHA-256: `1d5cc4bd041628cc32d535b7aa5e3bbea67b6bce16d250273e0960be6d690d1d`


```javascript
/**
 * THE CIPHER MUSEUM — Footer System
 * Renders the canonical site footer into any <footer> element on the page.
 * Auto-loaded by js/nav.js. Handles subdirectory path prefixing.
 *
 * Detection (in order):
 *   1. <footer class="museum-footer">
 *   2. <footer data-footer>
 *   3. The first bare <footer> element
 */
'use strict';
(function () {
  var foot = document.querySelector('footer.museum-footer')
          || document.querySelector('footer[data-footer]')
          || document.querySelector('footer');
  if (!foot) return;

  var path = location.pathname;
  var inSub = /\/(ciphers|halls|tours|lab|community|hall-of-foundations)\//.test(path);
  var pre = inSub ? '../' : '';

  var EXPLORE = [
    ['museum-map.html',          'Museum Map'],
    ['timeline.html',            'Timeline'],
    ['halls/ancient.html',       'Hall I · Ancient'],
    ['halls/machines.html',      'Hall VII · Machines'],
    ['halls/unbreakable.html',   'Hall IX · Unbreakable'],
    ['halls/codebreakers.html',  'Hall X · Codebreakers']
  ];
  var LEARN = [
    ['learn.html',               'How Ciphers Work'],
    ['modern.html',              'Modern Cryptography'],
    ['cipher-corpus.html',       'Cipher Corpus'],
    ['challenges.html',          'Challenges'],
    ['lab/workbench.html',       "Codebreaker's Workbench"],
    ['cryptanalysis.html',       'Cryptanalysis Techniques'],
    ['glossary.html',            'Glossary'],
    ['teaching.html#accuracy',   'Engine Accuracy']
  ];

  function listHtml(items) {
    return items.map(function (n) {
      return '<li><a href="' + pre + n[0] + '">' + n[1] + '</a></li>';
    }).join('');
  }

  foot.className = 'museum-footer';
  foot.innerHTML =
    '<div class="footer-grid">' +
      '<div class="footer-brand">' +
        '<span class="footer-logo-text">The Cipher Museum</span>' +
        '<p class="footer-brand-desc">Built for GitHub Pages. MIT License. Open source.</p>' +
      '</div>' +
      '<div>' +
        '<div class="footer-col-title">Explore</div>' +
        '<ul class="footer-links">' + listHtml(EXPLORE) + '</ul>' +
      '</div>' +
      '<div>' +
        '<div class="footer-col-title">Learn &amp; Build</div>' +
        '<ul class="footer-links">' + listHtml(LEARN) +
          '<li><a href="https://github.com/systemslibrarian/cipher-museum" rel="noopener">GitHub Repository</a></li>' +
        '</ul>' +
      '</div>' +
    '</div>' +
    '<div class="footer-bottom">' +
      '<span class="footer-copy">© The Cipher Museum · MIT License · Open Source</span>' +
      '<span class="footer-copy">172 exhibits · 13 halls · 3,900+ years</span>' +
    '</div>';
})();
```


## JavaScript — js/historical-ciphers.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/historical-ciphers.js`
- Served SHA-256: `0df911fca104641b48a6ef6dbde4ec141c8bcc526ffac157497dbb085510af6b`
- Readable-source SHA-256: `0df911fca104641b48a6ef6dbde4ec141c8bcc526ffac157497dbb085510af6b`


```javascript
/* Historical exhibit algorithms. Each call starts from the supplied key.
 * NEMA wiring/notch measurements: https://www.cryptomuseum.com/crypto/nema/
 * Military stepping and window convention checked against Martin Grap's rmsk2:
 * https://github.com/rmsk2/rmsk2/blob/master/nema_test.cpp
 * This is an independent implementation of the published machine specification.
 */
(function (root) {
  'use strict';
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const clean = text => String(text).normalize('NFD').replace(/\p{M}/gu, '')
    .toUpperCase().replace(/[^A-Z]/g, '');
  const mod = n => (n % 26 + 26) % 26;

  // Electrical contact zero is I. Positions are the lower window row, not
  // the top of the wheels. A two-contact offset connects those conventions.
  const CONTACTS = 'IJKLMNOPQRSTUVWXYZABCDEFGH';
  const physicalWiring = {
    A: 'NSKITCOYMVWAUJDRLZXHFQEGPB', B: 'KJYNTMEHLOZQBWPSXIRFAGUDVC',
    C: 'PNFUTEDIZYAHVRWOJSGBQMKCXL', D: 'WJBEYFUCMDTAZKXPIQHSVLGONR',
    U: 'KWPNGHEFVTAZUDYCXSRJMIBQOL'
  };
  const wiring = Object.fromEntries(Object.entries(physicalWiring).map(([name, w]) =>
    [name, [...CONTACTS].map(c => CONTACTS.indexOf(w[ABC.indexOf(c)]))]));
  const entry = [...'QMNBVCXYLKJHGFDSAPOIUZTREW'].map(c => CONTACTS.indexOf(c));
  const notches = {
    1: 'BJSYZ', 12: 'BCDEFGHIJKLPQRSUVWXYZ', 13: 'ABDEFGJKMNPQRTUVWXY',
    14: 'CEFGHJKLMNOPQSVXZ', 15: 'ADEGMOPQRSTVXYZ', 22: 'ABEGHKMNPQRSVWX'
  };

  function nema(text, windows = 'MQQPZQSOEV') {
    const key = String(windows).trim().toUpperCase();
    if (!/^[A-Z]{10}$/.test(key)) throw new Error('Enter exactly ten A–Z window letters.');
    // Index from the right: red drive, D, drive 15, C, drive 14, B,
    // drive 13, A, drive 12, reflector. The electrical entry is static.
    const position = [0, ...[...key].reverse().map(c => CONTACTS.indexOf(c))];
    const wheels = { 0: entry, 2: wiring.D, 4: wiring.C, 6: wiring.B, 8: wiring.A, 10: wiring.U };
    const notch = (slot, wheel, offset) =>
      notches[wheel].includes(CONTACTS[mod(position[slot] + offset)]);
    const pass = (x, slot, inverse = false) => {
      const displacement = slot === 0 ? 0 : mod(position[slot] - 2);
      const contact = mod(x + displacement);
      return mod((inverse ? wheels[slot].indexOf(contact) : wheels[slot][contact]) - displacement);
    };
    const trace = [];
    let output = '';
    for (const letter of clean(text)) {
      // Sense all notches in the old state, then step backwards before
      // passing current. The two red-wheel tracks drive separate linkages.
      const slow = notch(1, 1, 17);
      const moving = [1, 5, 9];
      if (notch(1, 22, 16)) moving.push(2);
      if (slow) moving.push(3, 7);
      if (slow && notch(3, 15, 16)) moving.push(4);
      if (notch(5, 14, 16)) moving.push(6);
      if (slow && notch(7, 13, 16)) moving.push(8);
      if (notch(9, 12, 16)) moving.push(10);
      moving.forEach(slot => { position[slot] = mod(position[slot] - 1); });
      let x = pass(CONTACTS.indexOf(letter), 0, true);
      [2, 4, 6, 8, 10].forEach(slot => { x = pass(x, slot); });
      [8, 6, 4, 2].forEach(slot => { x = pass(x, slot, true); });
      const result = CONTACTS[pass(x, 0)];
      output += result;
      if (trace.length < 12) trace.push({ input: letter, output: result,
        windows: position.slice(1).reverse().map(p => CONTACTS[p]).join('') });
    }
    return { output, trace, windows: position.slice(1).reverse().map(p => CONTACTS[p]).join('') };
  }

  function rotate(index, size) {
    const row = Math.floor(index / size), col = index % size;
    return col * size + size - 1 - row;
  }

  function grilleOrder(size, holes) {
    if (![4, 6, 8].includes(size)) throw new Error('Choose a 4×4, 6×6, or 8×8 grille.');
    if (!Array.isArray(holes) || holes.length !== size * size / 4 ||
      holes.some(h => !Number.isInteger(h) || h < 0 || h >= size * size)) {
      throw new Error('Select one hole from each rotation orbit.');
    }
    const orientations = [];
    let current = [...holes];
    for (let turn = 0; turn < 4; turn++) {
      orientations.push([...current].sort((a, b) => a - b));
      current = current.map(h => rotate(h, size));
    }
    const order = orientations.flat();
    if (new Set(order).size !== size * size) throw new Error('Rotated holes overlap; every cell must be visited once.');
    return { order, orientations };
  }

  function turningGrille(text, size, holes, decrypt = false) {
    const { order, orientations } = grilleOrder(size, holes);
    const capacity = size * size;
    let input = clean(text);
    const padding = decrypt ? 0 : (capacity - input.length % capacity) % capacity;
    if (decrypt && input.length % capacity) throw new Error(`Ciphertext must contain complete ${capacity}-letter blocks.`);
    input += 'X'.repeat(padding);
    const blocks = [];
    let output = '';
    for (let start = 0; start < input.length; start += capacity) {
      const chunk = input.slice(start, start + capacity);
      const grid = decrypt ? [...chunk] : Array(capacity);
      if (decrypt) output += order.map(i => grid[i]).join('');
      else { order.forEach((cell, i) => { grid[cell] = chunk[i]; }); output += grid.join(''); }
      blocks.push(grid);
    }
    return { output, blocks, padding, orientations };
  }

  function myszkowski(text, keyword, decrypt = false) {
    const key = clean(keyword);
    if (key.length < 2 || key.length > 24) throw new Error('Use a keyword of 2–24 letters.');
    const input = clean(text), width = key.length;
    const groups = [...new Set(key)].sort();
    const ranks = [...key].map(c => groups.indexOf(c) + 1);
    const order = [];
    for (const letter of groups) {
      const cols = [...key].flatMap((c, i) => c === letter ? [i] : []);
      // One column: downwards. Tied columns: across each row before the
      // next row. Missing cells in the last row are skipped, never padded.
      for (let row = 0; row * width < input.length; row++) {
        for (const col of cols) if (row * width + col < input.length) order.push(row * width + col);
      }
    }
    const cells = decrypt ? Array(input.length) : [...input];
    if (decrypt) order.forEach((cell, i) => { cells[cell] = input[i]; });
    const output = decrypt ? cells.join('') : order.map(cell => input[cell]).join('');
    return { output, cells, key, ranks, order };
  }

  const api = { clean, nema, rotate, grilleOrder, turningGrille, myszkowski };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HistoricalCiphers = api;
})(typeof window === 'undefined' ? globalThis : window);
```


## JavaScript — js/historical-demos.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/historical-demos.js`
- Served SHA-256: `39f299e5c2497d83acdea66530dc0a0cf132d98570e614020201b4a2834e7a1a`
- Readable-source SHA-256: `39f299e5c2497d83acdea66530dc0a0cf132d98570e614020201b4a2834e7a1a`


```javascript
(function () {
  'use strict';
  const demo = document.querySelector('[data-historical-demo]');
  if (!demo) return;
  const cipher = demo.dataset.historicalDemo, api = window.HistoricalCiphers;
  const $ = id => document.getElementById(id);
  let mode = 'encrypt', turn = 0, holes = [], last = null;
  const size = () => Number($('grille-size').value);

  function resetHoles() {
    const n = size(), seen = new Set();
    holes = [];
    for (let cell = 0; cell < n * n; cell++) {
      if (seen.has(cell)) continue;
      holes.push(cell);
      let next = cell;
      for (let t = 0; t < 4; t++) { seen.add(next); next = api.rotate(next, n); }
    }
    turn = 0;
  }

  function drawGrille() {
    const n = size(), grid = $('grille-grid');
    grid.replaceChildren();
    grid.style.gridTemplateColumns = `repeat(${n}, minmax(2.75rem, 1fr))`;
    const order = api.grilleOrder(n, holes);
    const visible = new Set(order.orientations[turn]);
    for (let cell = 0; cell < n * n; cell++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'historical-cell' + (visible.has(cell) ? ' is-hole' : '');
      button.textContent = last?.blocks[0]?.[cell] || '·';
      button.setAttribute('aria-pressed', String(visible.has(cell)));
      button.setAttribute('aria-label', `Row ${Math.floor(cell / n) + 1}, column ${cell % n + 1}: ${visible.has(cell) ? 'hole' : 'covered'}, ${button.textContent}`);
      // Select a new representative in the current orientation, then undo
      // the viewing rotation to store it in the original key orientation.
      button.addEventListener('click', () => {
        let base = cell;
        for (let t = turn; t < 4 && turn !== 0; t++) base = api.rotate(base, n);
        const orbit = [base];
        for (let t = 1; t < 4; t++) orbit.push(api.rotate(orbit[t - 1], n));
        holes = holes.filter(h => !orbit.includes(h));
        holes.push(base);
        run();
        grid.children[cell]?.focus();
      });
      grid.appendChild(button);
    }
    $('grille-angle').textContent = `Orientation ${turn * 90}° clockwise. Highlighted cells are the holes; each rotation covers one quarter of the grid.`;
    $('grille-key').textContent = [...holes].sort((a, b) => a - b).join(', ');
    $('grille-reading').textContent = last?.blocks[0]
      ? `Read through these holes: ${order.orientations[turn].map(c => last.blocks[0][c]).join('')}`
      : 'Enter a message to fill the grid.';
  }

  function drawMyszkowski(result) {
    const grid = $('myszkowski-grid');
    grid.replaceChildren();
    grid.style.gridTemplateColumns = `repeat(${result.key.length}, minmax(2.75rem, 1fr))`;
    [...result.key].forEach((letter, i) => {
      const cell = document.createElement('span');
      cell.className = 'historical-cell historical-key-heading';
      cell.textContent = `${letter} ${result.ranks[i]}`;
      grid.appendChild(cell);
    });
    // Keep large messages usable; the full transformation is still output.
    result.cells.slice(0, result.key.length * 12).forEach(letter => {
      const cell = document.createElement('span');
      cell.className = 'historical-cell'; cell.textContent = letter; grid.appendChild(cell);
    });
    $('myszkowski-ranks').textContent = `Ranks: ${result.ranks.join(' ')}. Equal ranks are read across rows together. Grid shows at most twelve message rows.`;
  }

  function run() {
    try {
      const text = $('historical-message').value;
      if (cipher === 'nema') {
        last = api.nema(text, $('nema-windows').value);
        $('nema-trace').replaceChildren();
        last.trace.forEach((step, i) => {
          const row = document.createElement('tr');
          [i + 1, step.input, step.output, step.windows].forEach(value => {
            const cell = document.createElement('td'); cell.textContent = value; row.appendChild(cell);
          });
          $('nema-trace').appendChild(row);
        });
        $('historical-status').textContent = `${mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} ${last.output.length} letters. Each run resets to the supplied windows. Final windows: ${last.windows}.`;
      } else if (cipher === 'turning-grille') {
        last = api.turningGrille(text, size(), holes, mode === 'decrypt');
        drawGrille();
        $('historical-status').textContent = `${last.blocks.length} block(s). ${mode === 'encrypt' ? `${last.padding} X padding letter(s) added.` : 'Padding is retained: remove it only if you know the original length.'} Grid shows the first block.`;
      } else {
        last = api.myszkowski(text, $('myszkowski-key').value, mode === 'decrypt');
        drawMyszkowski(last);
        $('historical-status').textContent = `${mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} ${last.output.length} letters; no padding added.`;
      }
      $('historical-output').textContent = last.output || 'Enter a message to begin.';
    } catch (error) {
      last = null;
      $('historical-output').textContent = '';
      $('historical-status').textContent = error.message;
      if (cipher === 'turning-grille') drawGrille();
      if (cipher === 'nema') $('nema-trace').replaceChildren();
      if (cipher === 'myszkowski') {
        $('myszkowski-grid').replaceChildren();
        $('myszkowski-grid').style.gridTemplateColumns = '';
        $('myszkowski-ranks').textContent = '';
      }
    }
  }

  demo.querySelectorAll('[data-mode]').forEach(button => {
    button.addEventListener('click', () => {
      mode = button.dataset.mode;
      demo.querySelectorAll('[data-mode]').forEach(b => {
        b.classList.toggle('active', b === button);
        b.setAttribute('aria-pressed', String(b === button));
      });
      run();
    });
  });
  $('historical-run').addEventListener('click', run);
  $('historical-use-output').addEventListener('click', () => {
    if (!last?.output) return;
    $('historical-message').value = last.output;
    demo.querySelector(`[data-mode="${mode === 'encrypt' ? 'decrypt' : 'encrypt'}"]`).click();
  });
  $('historical-message').addEventListener('input', run);
  if (cipher === 'nema') $('nema-windows').addEventListener('input', run);
  if (cipher === 'myszkowski') $('myszkowski-key').addEventListener('input', run);
  if (cipher === 'turning-grille') {
    resetHoles();
    $('grille-size').addEventListener('change', () => { resetHoles(); run(); });
    $('grille-rotate').addEventListener('click', () => { turn = (turn + 1) % 4; drawGrille(); });
    $('grille-reset').addEventListener('click', () => { resetHoles(); run(); });
  }
  run();
})();
```
