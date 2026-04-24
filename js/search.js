/**
 * THE CIPHER MUSEUM — Site Search
 * Loads /js/search-index.json and provides ranked substring + token matching
 * across 52 ciphers, 10 halls, and 12+ key pages.
 *
 * Public API on window.CipherSearch:
 *   load()            → Promise<entries>
 *   query(q, limit)   → array of {entry, score, matchedField}
 *   highlight(text,q) → text with <mark> wrapped tokens
 *
 * Resolves URLs relative to the page that loaded the script
 * (handles ciphers/, halls/, etc. subfolders automatically).
 */
'use strict';
(function () {
  var INDEX_URL_REL = 'js/search-index.json';
  var BASE = (function () {
    var p = location.pathname;
    var inSub = /\/(ciphers|halls|tours|lab|community)\//.test(p);
    return inSub ? '../' : '';
  })();

  var _entries = null;
  var _loadPromise = null;

  function load() {
    if (_entries) return Promise.resolve(_entries);
    if (_loadPromise) return _loadPromise;
    _loadPromise = fetch(BASE + INDEX_URL_REL, {cache: 'force-cache'})
      .then(function (r) {
        if (!r.ok) throw new Error('Index HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        _entries = (data.entries || []).map(function (e) {
          return {
            title: e.t,
            url: BASE + e.u,
            kind: e.k,
            hall: e.h,
            created: e.c,
            broken: e.b,
            summary: e.s,
            tags: e.g || [],
            _hay: (
              e.t + ' ' + (e.h || '') + ' ' + (e.s || '') + ' ' + (e.g || []).join(' ')
            ).toLowerCase()
          };
        });
        return _entries;
      })
      .catch(function (err) {
        console.error('[CipherSearch] index load failed:', err);
        _entries = [];
        return _entries;
      });
    return _loadPromise;
  }

  function tokenize(q) {
    return (q || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  }

  /**
   * Score an entry against the query.
   *  +50 exact title match
   *  +25 title startsWith
   *  +12 title substring
   *  +10 tag exact
   *  +6  hall match
   *  +4  summary substring
   *  +2  any haystack substring
   * AND-mode: every token must hit something.
   */
  function score(entry, tokens, raw) {
    var rawLower = raw.toLowerCase();
    var titleLower = entry.title.toLowerCase();
    var s = 0;
    var matchedField = null;

    if (titleLower === rawLower) { s += 50; matchedField = 'title'; }
    else if (titleLower.indexOf(rawLower) === 0) { s += 25; matchedField = 'title'; }
    else if (titleLower.indexOf(rawLower) >= 0) { s += 12; matchedField = 'title'; }

    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      var hit = false;

      if (titleLower.indexOf(tok) >= 0) { s += 8; hit = true; matchedField = matchedField || 'title'; }
      for (var j = 0; j < entry.tags.length; j++) {
        var tag = entry.tags[j].toLowerCase();
        if (tag === tok) { s += 10; hit = true; matchedField = matchedField || 'tag'; break; }
        if (tag.indexOf(tok) >= 0) { s += 4; hit = true; matchedField = matchedField || 'tag'; }
      }
      if ((entry.hall || '').toLowerCase().indexOf(tok) >= 0) { s += 6; hit = true; matchedField = matchedField || 'hall'; }
      if ((entry.summary || '').toLowerCase().indexOf(tok) >= 0) { s += 4; hit = true; matchedField = matchedField || 'summary'; }
      if (!hit && entry._hay.indexOf(tok) >= 0) { s += 2; hit = true; matchedField = matchedField || 'any'; }
      if (!hit) return 0; // AND-mode: must hit every token
    }

    // Kind preference: ciphers > halls > pages
    if (entry.kind === 'cipher') s += 1;
    if (entry.kind === 'hall') s += 0.5;
    return s;
  }

  function query(q, limit) {
    if (!_entries) return [];
    var raw = (q || '').trim();
    if (!raw) return [];
    var tokens = tokenize(raw);
    if (!tokens.length) return [];
    var out = [];
    for (var i = 0; i < _entries.length; i++) {
      var sc = score(_entries[i], tokens, raw);
      if (sc > 0) out.push({entry: _entries[i], score: sc});
    }
    out.sort(function (a, b) { return b.score - a.score; });
    return limit ? out.slice(0, limit) : out;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function highlight(text, q) {
    var safe = escapeHTML(text);
    var tokens = tokenize(q).filter(function (t) { return t.length >= 2; });
    if (!tokens.length) return safe;
    tokens.sort(function (a, b) { return b.length - a.length; });
    tokens.forEach(function (t) {
      var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      safe = safe.replace(re, '<mark>$1</mark>');
    });
    return safe;
  }

  window.CipherSearch = {
    load: load,
    query: query,
    highlight: highlight,
    base: BASE
  };
})();
