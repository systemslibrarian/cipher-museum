/**
 * THE CIPHER MUSEUM — Service Worker
 * Offline support for classrooms and flaky connections.
 *
 * Strategy:
 *   - HTML navigations: network-first, falling back to cache (content stays fresh
 *     online; the whole museum keeps working offline once pages are visited).
 *   - Static assets (css/js/images/json): cache-first with background refresh.
 *   - The multi-megabyte corpus downloads under /public/ are never cached.
 *
 * VERSION is stamped automatically by `npm run build:js` from a hash of the
 * minified bundles (scripts/sw-version.js); tests/test-sw-version.js fails the
 * suite if it drifts. Old caches are purged on activate.
 */
'use strict';

const VERSION = 'cipher-museum-e803824a';
const CORE = [
  '/',
  '/index.html',
  '/css/museum.css',
  '/js/nav.js',
  '/js/footer.js',
  '/js/breadcrumbs.js',
  '/js/ui-delegates.js',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/images/icons/icon-192.png',
  '/images/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Never cache the corpus downloads — they are enormous and versioned separately.
  if (url.pathname.startsWith('/public/')) return;

  if (req.mode === 'navigate') {
    // Network-first for pages.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/index.html')))
    );
    return;
  }

  // Cache-first with background refresh for static assets.
  event.respondWith(
    caches.match(req).then((hit) => {
      const refresh = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || refresh;
    })
  );
});
