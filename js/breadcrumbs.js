'use strict';
/**
 * THE CIPHER MUSEUM — Breadcrumb Enhancer
 * Upgrades existing .breadcrumb divs to <nav aria-label="breadcrumb"> for a11y.
 * Auto-fills empty breadcrumb containers on new pages (tours, lab, community).
 * Include on every page: <script src="js/breadcrumbs.js" defer></script>
 */
(function(){
  var path = location.pathname;
  var parts = path.split('/').filter(Boolean);
  var pageName = parts[parts.length - 1] || 'index.html';
  var parentDir = parts.length > 1 ? parts[parts.length - 2] : '';
  var inSub = ['ciphers','halls','tours','lab','community'].indexOf(parentDir) !== -1;
  var pre = inSub ? '../' : '';

  /* Map of directory → breadcrumb segment */
  var DIR_LABELS = {
    tours:     {label:'Guided Tours',  href:'tours/index.html'},
    lab:       {label:'Cryptanalysis Lab', href:'cryptanalysis.html'},
    community: {label:'Community',     href:'community/index.html'}
  };

  /* Top-level pages */
  var TOP_NAMES = {
    'cipher-flow.html': 'Cipher Flow Explorer',
    'my-path.html':     'My Cryptographer\'s Path',
    'challenges.html':  'Challenges',
    'timeline.html':    'Timeline',
    'glossary.html':    'Glossary',
    'modern.html':      'Modern Cryptography',
    'museum-map.html':  'Museum Map',
    'cryptanalysis.html':'Cryptanalysis Lab'
  };

  /* ─── Upgrade existing .breadcrumb divs to <nav> ─── */
  var existing = document.querySelectorAll('.breadcrumb');
  existing.forEach(function(el){
    if(el.tagName === 'DIV'){
      var nav = document.createElement('nav');
      nav.setAttribute('aria-label','breadcrumb');
      nav.className = el.className;
      nav.innerHTML = el.innerHTML;
      /* Copy any inline style */
      if(el.style.cssText) nav.style.cssText = el.style.cssText;
      el.parentNode.replaceChild(nav, el);
    }
  });

  /* ─── Auto-fill empty breadcrumbs on new pages ─── */
  var bc = document.querySelector('nav.breadcrumb, .breadcrumb');
  if(bc && bc.innerHTML.trim() === ''){
    var html = '<a href="' + pre + 'index.html">Entrance</a><span>›</span>';
    /* Subdirectory pages */
    if(inSub && DIR_LABELS[parentDir]){
      var dir = DIR_LABELS[parentDir];
      html += '<a href="' + pre + dir.href + '">' + dir.label + '</a><span>›</span>';
    }
    /* Try to get page title from <h1> */
    var h1 = document.querySelector('h1');
    var title = h1 ? h1.textContent.trim() : pageName.replace('.html','');
    html += title;
    bc.innerHTML = html;
  }

  /* ─── Inject breadcrumb on pages that have none ─── */
  if(!document.querySelector('nav.breadcrumb, .breadcrumb')){
    var hero = document.querySelector('.page-hero');
    if(hero){
      var nav = document.createElement('nav');
      nav.setAttribute('aria-label','breadcrumb');
      nav.className = 'breadcrumb';
      var html2 = '<a href="' + pre + 'index.html">Entrance</a><span>›</span>';
      if(inSub && DIR_LABELS[parentDir]){
        var d = DIR_LABELS[parentDir];
        html2 += '<a href="' + pre + d.href + '">' + d.label + '</a><span>›</span>';
      }
      var h1b = document.querySelector('h1');
      html2 += h1b ? h1b.textContent.trim() : pageName.replace('.html','');
      nav.innerHTML = html2;
      hero.insertBefore(nav, hero.firstChild);
    }
  }
})();
