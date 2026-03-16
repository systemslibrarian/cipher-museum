/**
 * THE CIPHER MUSEUM — Responsive Navigation
 * Injects a hamburger toggle at <768px. Pure CSS transition for the drawer.
 * Drop this script into any page: <script src="js/nav.js" defer></script>
 */
'use strict';
(function () {
  var nav = document.querySelector('.museum-nav');
  if (!nav) return;
  var inner = nav.querySelector('.nav-inner');
  if (!inner) return;
  var links = nav.querySelector('.nav-links');
  if (!links) return;

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
