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
      adfgx:  'Only the letters A, D, F, G, X appear — consistent with the ADFG (no V) variant.',
      mixed:  'Mixed character set. May contain Base64, hex, or special symbols alongside letters.',
      other:  'Unusual character set — no standard pattern matched.'
    };

    return [
      /* ── Step 1: Normalise ─── */
      {
        title: 'Step 1 of 7 \u2014 Normalise the Text',
        render: function () {
          return '<p class="pb-narration">Every investigation begins the same way: strip whitespace, punctuation, and case. What remains is the raw signal \u2014 the letters themselves. Everything that follows is derived from this normalised form.</p>' +
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
            kasHtml = '<p class="pb-note">No strong Kasiski trigram repeats detected \u2014 the text may be monoalphabetic or too short for trigram analysis (&lt;40 letters needed).</p>';
          }

          return '<p class="pb-narration">Friedrich Kasiski noticed in 1863 that if a polyalphabetic cipher uses a repeating keyword, identical plaintext segments at the same key offset produce identical ciphertext segments. The spacing between those repeats is always a multiple of the key length. Friedman\u2019s period-IoC test (1920) confirms it: splitting the ciphertext into every-n-th-letter strands raises each strand\u2019s IoC toward 0.067 when n equals the true key length.</p>' +
            '<div class="pb-card">' + periodHtml + kasHtml + '</div>' +
            (ph ? '<p class="pb-narration">Key period ' + ph + ' confirmed by both tests. Each of the ' + ph + ' interleaved strands can now be broken as an independent Caesar cipher.</p>' : '<p class="pb-narration">No clear period detected. The cipher is likely monoalphabetic, transposition-based, or uses a very long key.</p>');
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
          return '<p class="pb-narration">Statistics identify cipher families but cannot decrypt. Every family has a targeted attack technique. Here is the most promising one for this ciphertext \u2014 the same approach a professional cryptanalyst would choose first.</p>' +
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
