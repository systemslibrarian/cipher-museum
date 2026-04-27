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
  var inSub = /\/(ciphers|halls|tours|lab|community)\//.test(path);
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
    ['glossary.html',            'Glossary']
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
      '<span class="footer-copy">140 exhibits · 13 halls · 3,900+ years</span>' +
    '</div>';
})();
