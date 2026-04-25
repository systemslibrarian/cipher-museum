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
     Source: Lewand / Norvig approximations. */
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
      'y1="' + BASE_Y + '" y2="' + BASE_Y + '" ',
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
      return 'Distribution matches English. Consistent with a transposition cipher (letters rearranged but unchanged) or near-unencrypted text.';
    }
    if (ioc >= 0.060 && chi0 >= 80) {
      return 'Distribution is English-shaped but offset. Consistent with simple substitution (Caesar, Atbash, monoalphabetic) — one alphabet has replaced another.';
    }
    if (ioc >= 0.040) {
      return 'Distribution is flatter than English. Consistent with polyalphabetic substitution (Vigenère family) or a cipher with a moderate-length repeating key.';
    }
    return 'Distribution is very flat, close to random. Consistent with a long-key polyalphabetic cipher, one-time pad, or modern encryption.';
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
  }

  function clear() {
    show('det-empty');
    hide('det-results');
    hide('det-short-warning');
    hide('det-reality');
    ['stat-length','stat-charset','stat-ioc','stat-chi','stat-shift','stat-period']
      .forEach(function (id) { txt(id, '—'); });
  }

  /* ─── Utility ────────────────────────────────────────────────── */
  function esc(s) {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  global.DetectiveRender = { draw: draw, clear: clear };

})(typeof window !== 'undefined' ? window : global);
