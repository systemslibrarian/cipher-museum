/**
 * THE CIPHER MUSEUM — Navigation System
 * 1. Standardizes nav links to one canonical set (handles subdirectory paths)
 * 2. Injects a hamburger toggle at <768px with CSS transition drawer
 * Load on every page: <script src="js/nav.js" defer></script>
 */
'use strict';
(function () {
  var nav = document.querySelector('.museum-nav');
  if (!nav) return;
  var inner = nav.querySelector('.nav-inner');
  if (!inner) return;
  var links = nav.querySelector('.nav-links');
  if (!links) return;

  /* ── Standardize nav links ───────────────────────────── */
  var NAV = [
    ['index.html',        'Entrance'],
    ['museum-map.html',   'Museum Map'],
    ['halls/ancient.html','Halls'],
    ['timeline.html',     'Timeline'],
    ['comparison.html',   'Comparison'],
    ['challenges.html',   'Challenges'],
    ['cryptanalysis.html','Cryptanalysis Lab'],
    ['cipher-flow.html',  'Cipher Flow'],
    ['tours/index.html',  'Tours'],
    ['community/index.html','Community'],
    ['modern.html',       'Modern Crypto'],
    ['glossary.html',     'Glossary']
  ];
  var path = location.pathname;
  var inSub = /\/(ciphers|halls|tours|lab|community)\//.test(path);
  var pre = inSub ? '../' : '';
  var basename = path.split('/').pop() || 'index.html';
  var parentDir = path.split('/').slice(-2, -1)[0] || '';
  var DIR_ACTIVE = {halls:'Halls',tours:'Tours',community:'Community',lab:'Cryptanalysis Lab'};
  var activeLabel = DIR_ACTIVE[parentDir] || null;
  if (!activeLabel) {
    NAV.forEach(function (n) { if (n[0] === basename) activeLabel = n[1]; });
  }
  links.innerHTML = '';
  NAV.forEach(function (n) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = pre + n[0];
    a.textContent = n[1];
    if (n[1] === activeLabel) a.className = 'active';
    li.appendChild(a);
    links.appendChild(li);
  });
  var ghLi = document.createElement('li');
  var ghA = document.createElement('a');
  ghA.href = 'https://github.com/systemslibrarian/cipher-museum';
  ghA.target = '_blank';
  ghA.rel = 'noopener noreferrer';
  ghA.textContent = 'GitHub \u2197';
  ghLi.appendChild(ghA);
  links.appendChild(ghLi);

  /* ── Inject hamburger button ──────────────────────────── */
  var btn = document.createElement('button');
  btn.className = 'nav-hamburger';
  btn.setAttribute('aria-label', 'Toggle navigation menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'nav-drawer');
  btn.innerHTML =
    '<span class="hamburger-bar"></span>' +
    '<span class="hamburger-bar"></span>' +
    '<span class="hamburger-bar"></span>';
  inner.appendChild(btn);

  /* Give the links list an id for aria-controls */
  links.id = 'nav-drawer';

  /* ── Toggle drawer ────────────────────────────────────── */
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', String(open));
  });

  /* Close on link click */
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });

  /* ── Accessibility patches ──────────────────────────── */
  var logoSvg = nav.querySelector('.nav-logo-icon');
  if (logoSvg) logoSvg.setAttribute('aria-hidden', 'true');
  document.querySelectorAll('.section-divider').forEach(function(el){
    el.setAttribute('aria-hidden', 'true');
  });

  /* ── Auto-load companion scripts ─────────────────────── */
  ['breadcrumbs.js','learning-path.js'].forEach(function(f){
    var s = document.createElement('script');
    s.src = pre + 'js/' + f;
    s.defer = true;
    document.body.appendChild(s);
  });
})();

/* ── Scroll-reveal entrance animations (Phase 2C) ──────── */
(function () {
  if (typeof IntersectionObserver === 'undefined') return;
  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(function (el) { observer.observe(el); });
})();

/* ── Exhibit Progress Tracker (Phase 3A) ────────────────── */
(function () {
  var TOTAL = 37;
  var KEY = 'cipher_museum_visited';

  /* Resolve which exhibit page we're on (if any) */
  var path = location.pathname;
  var match = path.match(/ciphers\/([a-z0-9-]+)\.html/);
  if (match) {
    var visited;
    try { visited = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { visited = {}; }
    visited[match[1]] = 1;
    try { localStorage.setItem(KEY, JSON.stringify(visited)); } catch (e) { /* quota */ }
  }

  /* Build badge */
  var visited;
  try { visited = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { visited = {}; }
  var count = Object.keys(visited).length;
  if (count === 0 && !match) return; /* Don't show badge until first visit */

  var badge = document.createElement('div');
  badge.className = 'progress-badge';
  badge.setAttribute('aria-label', 'Exhibits visited: ' + count + ' of ' + TOTAL);
  badge.textContent = '\uD83C\uDFDB\uFE0F ' + count + ' / ' + TOTAL;
  document.body.appendChild(badge);
})();
