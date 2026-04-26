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
        .then(function (r) { return r.json(); })
        .then(function (data) {
          _challenges = (data && data.challenges) ? data.challenges : [];
          _loaded = true;
          cb();
        })
        .catch(function () {
          _challenges = [];
          _loaded = true;
          cb();
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
    loadData(function () {
      var container = el('det-challenge-mode');
      if (!container) return;
      container.hidden = false;
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
