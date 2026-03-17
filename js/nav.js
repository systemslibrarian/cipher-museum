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
    ['museum-map.html',   'Explore'],
    ['learn.html',        'Learn'],
    ['challenges.html',   'Challenges'],
    ['lab/workbench.html','Lab']
  ];
  var path = location.pathname;
  var inSub = /\/(ciphers|halls|tours|lab|community)\//.test(path);
  var pre = inSub ? '../' : '';
  var basename = path.split('/').pop() || 'index.html';
  var parentDir = path.split('/').slice(-2, -1)[0] || '';
  var DIR_ACTIVE = {halls:'Explore',tours:'Explore',community:'Explore',lab:'Lab'};
  var ALIASES = {
    'index.html': null,
    'museum-map.html': 'Explore',
    'timeline.html': 'Explore',
    'glossary.html': 'Learn',
    'modern.html': 'Learn',
    'learn.html': 'Learn',
    'cryptanalysis.html': 'Lab',
    'challenges.html': 'Challenges',
    'comparison.html': 'Learn',
    'cipher-flow.html': 'Explore'
  };
  var activeLabel = DIR_ACTIVE[parentDir] || ALIASES[basename] || null;
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

  var badge = document.createElement('a');
  badge.className = 'progress-badge';
  badge.href = ((/\/(ciphers|halls|tours|lab|community)\//.test(location.pathname)) ? '../' : '') + 'museum-map.html';
  badge.setAttribute('aria-label', 'Exhibits visited: ' + count + ' of ' + TOTAL + '. View museum map.');
  badge.textContent = '\uD83C\uDFDB\uFE0F ' + count + ' / ' + TOTAL;
  badge.title = 'Exhibits visited – click to view map';
  document.body.appendChild(badge);
})();
