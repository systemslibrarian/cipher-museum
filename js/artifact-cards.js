/* THE CIPHER MUSEUM — Artifact Card Renderer */
'use strict';

(function () {
  var path = (location.pathname || '').toLowerCase();
  if (path.indexOf('/ciphers/') === -1) return;

  var file = path.split('/').pop() || '';
  var slug = file.replace(/\.html$/, '');
  if (!slug) return;

  var data = (window.__ARTIFACT_CARDS__ && window.__ARTIFACT_CARDS__.cards) || {};
  var card = data[slug];
  if (!card) return;

  var main = document.getElementById('main-content') || document.querySelector('main');
  if (!main) return;
  if (main.querySelector('.artifact-card')) return;

  var anchor = main.querySelector('.page-hero') || main.firstElementChild;
  if (!anchor) return;

  var section = document.createElement('section');
  section.className = 'artifact-card';
  section.setAttribute('aria-label', 'Artifact card metadata');
  section.setAttribute('data-artifact-slug', slug);

  var title = document.createElement('h2');
  title.className = 'artifact-card-title';
  title.textContent = 'Artifact Card';

  var grid = document.createElement('dl');
  grid.className = 'artifact-card-grid';

  function addField(label, value) {
    var dt = document.createElement('dt');
    dt.className = 'artifact-card-label';
    dt.textContent = label;

    var dd = document.createElement('dd');
    dd.className = 'artifact-card-value';
    dd.textContent = value || 'Not specified';

    grid.appendChild(dt);
    grid.appendChild(dd);
  }

  addField('Era', card.era);
  addField('Family', card.family);
  addField('Region', card.region);
  addField('Used By', card.usedBy);
  addField('Key Type', card.keyType);
  addField('Key Idea', card.keyIdea);
  addField('Security Failure', card.securityFailure);
  addField('Modern Lesson', card.modernLesson);

  section.appendChild(title);
  section.appendChild(grid);

  if (anchor.nextSibling) {
    main.insertBefore(section, anchor.nextSibling);
  } else {
    main.appendChild(section);
  }
})();
