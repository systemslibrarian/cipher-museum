# javascript appendix 6

Snapshot: `3a2de507d2df3cca40f3535c6d18548299b25bc0`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

## JavaScript — js/research-ui.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/research-ui.js`
- Served SHA-256: `efca20fdbbb15f84fd17b565409bc3a781b6892b635e933fc485f29fab30abc9`
- Readable-source SHA-256: `efca20fdbbb15f84fd17b565409bc3a781b6892b635e933fc485f29fab30abc9`


```javascript
/* Evidence workbench: local files only; imported text is never inserted as HTML. */
'use strict';
(function () {
  const R = window.MuseumResearch, $ = id => document.getElementById(id);
  let doc = R.create(''), previous = null, worker = null, receipt = null, searchGeneration = 0;
  let imageURL = null, pendingImage = null, activeImage = null, languageSet = null, languageError = '';
  let activeRegionSpan = '';
  let selectedClass = '', selectedOccurrences = new Set(), lastCandidate = '', retainedBundle = null;
  const sourceFields = R.SOURCE_FIELDS;
  const BASELINE = { id: 'museum-prose-quadgram-v1', label: 'Museum modern-English baseline (disclosed: modern, museum prose)' };
  function status(message, error = false) { $('record-status').textContent = message; $('record-status').dataset.error = String(error); }
  function note(id, message, error = false) { $(id).textContent = message; $(id).dataset.error = String(error); }
  function guard(fn) { return function () { try { fn(); } catch (e) { status(e.message, true); } }; }
  function el(tag, text, parent) { const n = document.createElement(tag); n.textContent = text; if (parent) parent.appendChild(n); return n; }
  function download(name, value) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], {type:'application/json'}));
    const a = el('a', ''); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function numbers(value, count, label) {
    const parts = String(value).split(',').map(x => Number(x.trim()));
    if (parts.length !== count || parts.some(n => !Number.isFinite(n))) throw new Error('Enter ' + count + ' numbers for ' + label + '.');
    return parts;
  }
  function pending() { return $('source-raw').value !== doc.raw; }
  function commit() {
    let next = R.revise(doc, $('source-raw').value, $('revision-reason').value);
    for (const f of sourceFields) next.source[f] = $('source-' + f).value;
    next = R.validate(next); previous = doc; doc = next; $('restore-record').disabled = false;
    $('revision-reason').value = ''; render();
  }
  function adopt(next, message) { previous = doc; doc = R.validate(next); $('restore-record').disabled = false; render(); if (message) status(message); }

  // ── Images and coordinate transforms ──────────────────────────────────────
  function currentImage() { return doc.images.find(i => i.id === $('image-select').value) || null; }
  function paintRegion(region, image, spanId = '') {
    activeRegionSpan = spanId;
    const box = $('image-region');
    if (!region || !image || !imageURL || !activeImage || activeImage.id !== image.id) { box.hidden = true; return; }
    const placed = R.regionToDisplay(image, region);
    box.hidden = !placed.visible;
    if (!placed.visible) return;
    ['left','top','width','height'].forEach((f, i) => { box.style[f] = (placed.box[i] * 100) + '%'; });
    box.dataset.clipped = String(placed.clipped);
  }
  $('image-region').onclick = guard(() => {
    if (!activeRegionSpan) return;
    const info = R.regionOccurrences(doc, activeRegionSpan);
    if (info.classes.length) {
      selectedClass = info.classes[0].id; selectedOccurrences = new Set(info.classes[0].occurrences);
      renderInventory();
    }
    status('Highlighted region covers characters ' + (info.start + 1) + '–' + info.end +
      ' of source revision ' + info.revision + ': “' + info.literal + '”.');
  });
  function applyView(image) {
    if (!image) return;
    const c = image.crop, a = R.displayAspect(image);
    const x = c[0] * image.width, y = c[1] * image.height;
    const w = c[2] * image.width, h = c[3] * image.height;
    // SVG crops/rescales the image into the SAME frame as the normalized overlay.
    const matrices = { 0:[1,0,0,1,-x,-y], 90:[0,1,-1,0,h+y,-x],
      180:[-1,0,0,-1,w+x,h+y], 270:[0,-1,1,0,-y,w+x] };
    $('image-view').setAttribute('viewBox', '0 0 ' + a.width + ' ' + a.height);
    $('image-view').style.aspectRatio = a.width + ' / ' + a.height;
    const pixels = $('image-pixels');
    pixels.setAttribute('href', imageURL || '');
    pixels.setAttribute('width', image.width); pixels.setAttribute('height', image.height);
    pixels.setAttribute('transform', 'matrix(' + matrices[image.rotation].join(' ') + ')');
    $('image-region').hidden = true; // Selection must be repainted after a view change.
  }
  function clearImage() {
    if (imageURL) URL.revokeObjectURL(imageURL);
    imageURL = null; activeImage = null; pendingImage = null;
    $('source-image').removeAttribute('src'); $('image-wrap').hidden = true;
    $('image-pixels').removeAttribute('href');
    $('image-file').value = ''; $('image-register').disabled = true; $('image-apply-view').disabled = true;
    $('image-region').hidden = true;
  }
  async function sha256(file) {
    if (!self.crypto || !self.crypto.subtle) return '';
    const digest = await self.crypto.subtle.digest('SHA-256', await file.arrayBuffer());
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  }
  $('image-file').onchange = async function () {
    const file = this.files[0]; if (!file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 8000000) { note('image-status','Choose a PNG, JPEG or WebP image under 8 MB.',true); return; }
    if (imageURL) URL.revokeObjectURL(imageURL);
    imageURL = URL.createObjectURL(file);
    activeImage = null;
    const openedURL = imageURL;
    const img = $('source-image');
    $('image-wrap').hidden = false;
    const hash = await sha256(file);
    if (openedURL !== imageURL) return;
    img.onload = () => {
      if (openedURL !== imageURL) return;
      pendingImage = { name: file.name, width: img.naturalWidth, height: img.naturalHeight, sha256: hash };
      applyView({ ...pendingImage, id: 'local-preview', crop: [0,0,1,1], rotation: 0 });
      $('image-register').disabled = false; $('image-apply-view').disabled = false;
      const known = doc.images.find(i => i.name === file.name);
      if (known && hash && known.sha256 && known.sha256 !== hash) {
        note('image-status','Different bytes under a recorded filename. ' + file.name + ' was registered with hash ' + known.sha256.slice(0,12) + '…, this file hashes to ' + hash.slice(0,12) + '…. Registering it will add a second image record rather than overwrite the first.', true);
      } else if (known) {
        activeImage = known; $('image-select').value = known.id; applyView(known);
        note('image-status','Matches registered image ' + known.id + ' (' + known.name + '), ' + known.width + '×' + known.height + ' pixels' + (hash ? ', same content hash' : '') + '. Byte identity is not an authenticity check.');
      } else {
        note('image-status','Opened ' + file.name + ' at ' + img.naturalWidth + '×' + img.naturalHeight + ' pixels' + (hash ? ', SHA-256 ' + hash.slice(0,12) + '…' : ', no hash available in this browser') + '. Register it to attach regions.');
      }
      render();
    };
    img.src = openedURL;
  };
  $('source-image').onerror = () => { clearImage(); note('image-status','The selected file could not be decoded as an image.',true); };
  $('image-register').onclick = guard(() => {
    if (!pendingImage) throw new Error('Open an image first.');
    const next = R.addImage(doc, Object.assign({}, pendingImage, {
      rotation: Number($('image-rotation').value), crop: numbers($('image-crop').value, 4, 'the crop'), note: $('image-note').value }));
    adopt(next, '');
    const added = doc.images[doc.images.length - 1];
    activeImage = added; $('image-select').value = added.id; applyView(added);
    note('image-status','Registered ' + added.id + ': ' + added.name + ', ' + added.width + '×' + added.height + ' pixels. The bytes stay on your device; only the filename, size and hash are exported.');
    render();
  });
  $('image-apply-view').onclick = guard(() => {
    const image = currentImage();
    if (!image) throw new Error('Register the image before changing its view.');
    image.rotation = Number($('image-rotation').value);
    image.crop = numbers($('image-crop').value, 4, 'the crop');
    adopt(R.validate(doc), '');
    activeImage = doc.images.find(i => i.id === image.id); applyView(activeImage);
    const a = R.displayAspect(activeImage);
    note('image-status','View updated: rotation ' + activeImage.rotation + '°, visible area ' + Math.round(a.width) + '×' + Math.round(a.height) + ' pixels. Recorded regions were not rewritten.');
  });
  $('image-select').onchange = () => {
    const image = currentImage();
    if (!image) return;
    $('image-rotation').value = String(image.rotation);
    $('image-crop').value = image.crop.join(', ');
    if (activeImage && activeImage.id === image.id) applyView(image);
    note('image-status', activeImage && activeImage.id === image.id
      ? 'Showing ' + image.id + '.'
      : 'Selected ' + image.id + ' (' + image.name + '). Open that file above to see its regions.');
    render();
  };

  // ── Symbol inventory ──────────────────────────────────────────────────────
  function inventory() { return doc.inventory; }
  function renderOccurrences() {
    const box = $('occurrence-list'); box.replaceChildren();
    const inv = inventory(); if (!inv) return;
    const klass = inv.classes.find(c => c.id === selectedClass);
    if (!klass) return;
    const linked = R.classOccurrences(doc, klass.id);
    linked.forEach(o => {
      const b = el('button', o.literal + ' @' + (o.start + 1) + (o.regions.length ? ' ▣' : ''), box);
      b.type = 'button'; b.className = 'occurrence';
      b.setAttribute('aria-pressed', String(selectedOccurrences.has(o.index)));
      b.dataset.selected = String(selectedOccurrences.has(o.index));
      b.title = 'Occurrence ' + o.index + ', characters ' + (o.start + 1) + '–' + o.end +
        (o.spans.length ? '; spans ' + o.spans.join(', ') : '; no evidence span') +
        (o.regions.length ? '; ' + o.regions.length + ' image region(s)' : '');
      b.onclick = () => {
        if (selectedOccurrences.has(o.index)) selectedOccurrences.delete(o.index); else selectedOccurrences.add(o.index);
        // Selecting an occurrence highlights its crop on the registered image.
        const region = o.regions[0];
        if (region) {
          const image = doc.images.find(i => i.id === region.imageId) || doc.images.find(i => i.name === region.imageName);
          paintRegion(region.region, image, region.span);
          note('inventory-status','Occurrence ' + o.index + ' is linked to span ' + region.span + ' on ' + (image ? image.id : region.imageName) +
            (activeImage && image && activeImage.id === image.id ? '. Its region is highlighted above.' : '. Open that image to see the region.'));
        } else {
          $('image-region').hidden = true;
          note('inventory-status','Occurrence ' + o.index + ' has no recorded image region. ' + selectedOccurrences.size + ' occurrence(s) selected.');
        }
        renderOccurrences();
      };
    });
  }
  function renderInventory() {
    const inv = inventory();
    const select = $('class-select'), merge = $('merge-with');
    select.replaceChildren(); merge.replaceChildren();
    $('inventory-history').textContent = inv ? inv.history.map(h => h.step + '. ' + h.op + ' — ' + h.detail).join('\n\n') : '';
    const archive = $('inventory-archive'); archive.replaceChildren();
    doc.inventoryArchive.forEach((old, i) => {
      const details = el('details', '', archive);
      el('summary', 'Earlier inventory ' + (i + 1) + ' · source revision ' + old.revision + ' · ' + old.classes.length + ' classes', details);
      el('pre', JSON.stringify(old, null, 2), details);
    });
    if (!inv) { $('occurrence-list').replaceChildren(); return; }
    inv.classes.forEach(c => {
      const o = el('option', c.id + ' · ' + c.label + ' · ' + c.occurrences.length + ' occurrence(s)', select); o.value = c.id;
      const m = el('option', c.id + ' · ' + c.label, merge); m.value = c.id;
    });
    if (!inv.classes.some(c => c.id === selectedClass)) selectedClass = inv.classes.length ? inv.classes[0].id : '';
    select.value = selectedClass;
    renderOccurrences();
  }
  $('inventory-build').onclick = guard(() => {
    if (pending()) throw new Error('Save the revised source before building an inventory from it.');
    adopt(R.buildInventory(doc, { tokens: $('inventory-tokens').value, width: Number($('inventory-width').value) }), '');
    selectedClass = ''; selectedOccurrences.clear(); renderInventory();
    note('inventory-status','Built ' + doc.inventory.classes.length + ' classes from ' + doc.inventory.occurrences.length +
      ' occurrences at revision ' + doc.inventory.revision + '. Identical transcriptions start together; splitting them is your decision to record.');
  });
  $('class-select').onchange = () => { selectedClass = $('class-select').value; selectedOccurrences.clear(); renderOccurrences(); note('inventory-status','Selected ' + selectedClass + '.'); };
  $('inventory-split').onclick = guard(() => {
    if (!selectedOccurrences.size) throw new Error('Select the occurrences to split out first.');
    adopt(R.splitClass(doc, selectedClass, Array.from(selectedOccurrences), $('split-label').value, $('split-reason').value), '');
    const added = doc.inventory.classes[doc.inventory.classes.length - 1];
    selectedOccurrences.clear(); selectedClass = added.id; renderInventory();
    note('inventory-status','Split ' + added.occurrences.length + ' occurrence(s) into ' + added.id + '. The occurrences you did not select stayed where they were.');
  });
  $('inventory-merge').onclick = guard(() => {
    const other = $('merge-with').value;
    if (!other || other === selectedClass) throw new Error('Choose a different class to merge with.');
    adopt(R.mergeClasses(doc, [selectedClass, other], $('merge-label').value, $('merge-reason').value), '');
    selectedOccurrences.clear(); renderInventory();
    note('inventory-status','Merged. Both earlier labels and their reasons are kept in the decision history below.');
  });

  // ── Hypothesis register ───────────────────────────────────────────────────
  function evidenceLines(value) {
    return value.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
      const bar = line.indexOf('|');
      if (bar < 0) throw new Error('Write each piece of evidence as "identifier | what it shows".');
      return { ref: line.slice(0, bar).trim(), note: line.slice(bar + 1).trim() };
    });
  }
  function renderHypotheses() {
    const box = $('hypothesis-list'); box.replaceChildren();
    doc.hypotheses.forEach(h => {
      const card = el('div', '', box); card.className = 'research-card';
      el('h3', h.id + ' · ' + h.confidence, card);
      el('p', h.claim, card);
      el('p', 'Supporting: ' + (h.supports.map(e => e.ref + ' — ' + e.note).join(' · ') || 'none recorded'), card);
      el('p', 'Contradicting: ' + (h.contradicts.map(e => e.ref + ' — ' + e.note).join(' · ') || 'none recorded'), card);
      el('p', 'Unresolved alternatives: ' + (h.alternatives.join(' · ') || 'none recorded'), card);
      if (h.note) el('p', h.note, card);
    });
  }
  $('hypothesis-add').onclick = guard(() => {
    adopt(R.addHypothesis(doc, { claim: $('hypothesis-claim').value, confidence: $('hypothesis-confidence').value,
      supports: evidenceLines($('hypothesis-supports').value), contradicts: evidenceLines($('hypothesis-contradicts').value),
      alternatives: $('hypothesis-alternatives').value.split('\n').map(x => x.trim()).filter(Boolean),
      note: $('hypothesis-note').value }), 'Hypothesis recorded with its evidence on both sides. Applying a key cleanly does not promote a claim.');
    renderHypotheses();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────
  function render() {
    $('source-raw').value = doc.raw;
    sourceFields.forEach(f => { $('source-' + f).value = doc.source[f]; });
    $('revision-label').textContent = 'Current revision ' + doc.revision + ' · ' + Array.from(doc.raw).length + ' Unicode characters. Original transcription retained.';
    const revisions = $('revision-list'); revisions.replaceChildren();
    doc.revisions.forEach(r => { const d = el('details','',revisions); el('summary','Revision ' + r.id + ' — ' + r.reason,d); el('pre',r.raw,d); });
    const imageSelect = $('image-select'), spanImage = $('span-image');
    const keepImage = imageSelect.value, keepSpanImage = spanImage.value;
    imageSelect.replaceChildren(); spanImage.replaceChildren();
    el('option','No image region',spanImage).value = '';
    const imageList = $('image-list'); imageList.replaceChildren();
    doc.images.forEach(i => {
      const o = el('option', i.id + ' · ' + i.name, imageSelect); o.value = i.id;
      const s = el('option', i.id + ' · ' + i.name, spanImage); s.value = i.id;
      const card = el('div','',imageList); card.className = 'research-card';
      el('h3', i.id + ' · ' + i.name, card);
      const aspect = R.displayAspect(i);
      el('p','Original ' + i.width + '×' + i.height + ' pixels. Display rotation ' + i.rotation + '°, crop ' + i.crop.join(', ') +
        ', visible ' + Math.round(aspect.width) + '×' + Math.round(aspect.height) + ' pixels.', card);
      el('p','Content hash: ' + (i.sha256 ? i.sha256 : 'not recorded') + '. Byte identity, not authenticity.', card);
      if (i.note) el('p', i.note, card);
    });
    if (doc.images.some(i => i.id === keepImage)) imageSelect.value = keepImage;
    if (doc.images.some(i => i.id === keepSpanImage)) spanImage.value = keepSpanImage;
    const spans = $('span-list'); spans.replaceChildren();
    doc.spans.forEach(s => {
      const card = el('div','',spans); card.className = 'research-card';
      el('h3',s.id + ' · ' + s.type + (s.uncertain ? ' · unresolved' : ' · recorded reading'),card);
      el('p','Revision ' + s.revision + (s.revision === doc.revision ? ' (current)' : ' (earlier source; not moved to current text)') + ', characters ' + (s.start+1) + '–' + s.end + ': ' + s.literal,card);
      el('p','Alternatives: ' + (s.alternatives.join(' / ') || 'none recorded') + '. Reading: ' + (s.reading || 'unresolved') + '. Reason: ' + (s.reason || 'not recorded'),card);
      if (s.region) {
        const image = doc.images.find(i => i.id === s.imageId) || doc.images.find(i => i.name === s.imageName);
        el('p','Region image: ' + s.imageName + (s.imageId ? ' (' + s.imageId + ')' : ' (filename only; register the image to link it)'),card);
        const b = el('button','Show image region and transcription span',card); b.type = 'button';
        b.onclick = guard(() => {
          // Selecting a region identifies the transcription span it covers.
          const back = R.regionOccurrences(doc, s.id);
          if (!image) throw new Error('Register ' + s.imageName + ' as an image before showing its regions.');
          if (!activeImage || activeImage.id !== image.id) {
            $('image-region').hidden = true;
            status('Open ' + image.name + ' under “Register the source images” to display this region. A matching filename is not an authenticity check.');
          } else { paintRegion(s.region, image, s.id); status('Region displayed on ' + image.id + '.'); }
          const classes = back.classes.map(c => c.id + ' (' + c.label + ', ' + c.occurrences.length + ' occurrence(s) here)').join('; ');
          el('p','This region covers characters ' + (back.start + 1) + '–' + back.end + ' of revision ' + back.revision + ': “' + back.literal + '”' +
            (classes ? '. Symbol classes: ' + classes : '. No inventory covers this revision yet.'), card);
        });
      }
    });
    const layers = $('layer-list'), parent = $('layer-parent'), keptParent = parent.value;
    layers.replaceChildren(); parent.replaceChildren();
    // Earlier selections can be restored/read, but new layers belong to the current revision.
    [doc.revisions.at(-1), ...doc.revisions.slice(0,-1)].forEach(r => {
      const op = el('option','Source revision ' + r.id,parent); op.value = 'revision-' + r.id; op.disabled = r.id !== doc.revision;
    });
    doc.layers.forEach(l => {
      const o = el('option',l.id + ' (' + l.kind + ')',parent); o.value = l.id; o.disabled = l.revision !== doc.revision;
      const d = el('details','',layers); el('summary',l.id + ' · ' + l.kind + ' · revision ' + l.revision,d); el('p','Derived from ' + l.parent + '. ' + l.note,d); el('pre',l.text,d);
    });
    if (Array.from(parent.options).some(o => o.value === keptParent && !o.disabled)) parent.value = keptParent;
    $('relations-list').textContent = JSON.stringify({keys:doc.keys,relations:doc.relations},null,2);
    renderInventory(); renderHypotheses();
  }

  $('save-revision').onclick = guard(() => { commit(); status('Source and revision saved in this tab. Export the record to keep it after closing.'); });
  $('restore-record').onclick = guard(() => { if (previous) { const current = doc; doc = previous; previous = current; clearImage(); render(); status('Previous record restored. Press again to return to the other record.'); } });
  $('export-record').onclick = guard(() => { commit(); download('cipher-museum-evidence-v2.json', doc); status('Evidence record exported. Local image bytes are separate.'); });
  $('import-file').onchange = async function () {
    const file = this.files[0]; if (!file) return;
    try {
      if (file.size > 750000) throw new Error('Import is limited to 750,000 bytes.');
      const next = R.migrate(JSON.parse(await file.text())); previous = doc; doc = next; clearImage(); selectedClass = ''; selectedOccurrences.clear(); render(); $('restore-record').disabled = false;
      status('Imported version ' + doc.version + ' evidence record. Previous saved record is available with Restore.');
    } catch (e) { status('Import rejected; saved record retained. ' + e.message, true); }
    this.value = '';
  };
  $('select-span').onclick = () => {
    const t = $('source-raw'); $('span-start').value = Array.from(t.value.slice(0,t.selectionStart)).length + 1;
    $('span-end').value = Array.from(t.value.slice(0,t.selectionEnd)).length;
    status('Selected text copied to character positions. Save any source change before adding a span.');
  };
  $('add-span').onclick = guard(() => {
    if (pending()) throw new Error('Save the revised source before annotating it.');
    const imageId = $('span-image').value;
    const region = $('span-region').value.trim() ? numbers($('span-region').value, 4, 'the region') : null;
    if (region && !imageId) throw new Error('Choose the registered image this region belongs to.');
    if (imageId && !region) throw new Error('Enter the region coordinates, or choose “No image region”.');
    const image = doc.images.find(i => i.id === imageId);
    const next = R.annotate(doc,{start:Number($('span-start').value)-1,end:Number($('span-end').value),type:$('span-type').value,
      uncertain:$('span-uncertain').checked, alternatives:$('span-alternatives').value.split('\n').map(x=>x.trim()).filter(Boolean),
      reading:$('span-reading').value, reason:$('span-reason').value, region, imageId});
    adopt(next, 'Evidence span appended. Earlier annotations remain in the record.');
    if (region && image) paintRegion(region, image);
  });
  $('add-layer').onclick = guard(() => {
    if (pending()) throw new Error('Save the source revision first.');
    adopt(R.addLayer(doc,$('layer-kind').value,$('layer-parent').value,$('layer-text').value,$('layer-note').value),
      'Derived reading appended; the source has not been overwritten.');
  });
  ['typed-key','key-input'].forEach(id=>$(id).addEventListener('input',()=>{$('key-output').textContent='Inputs changed. Apply the key again.';}));
  $('key-linguistic-example').onclick = guard(() => {
    $('typed-key').value = JSON.stringify([{symbol:'21',type:'word',values:['seal']},{symbol:'22',type:'ending',values:['ed']},{symbol:'23',type:'punctuation',values:['.']}], null, 2);
    $('key-input').value = '21 22 23'; $('key-title').value = 'Invented linguistic content example';
    $('key-source').value = 'https://ecp.ep.liu.se/index.php/histocrypt/article/view/404';
    $('apply-key').click();
  });
  $('apply-key').onclick = guard(() => {
    const tokens=$('key-input').value.trim().split(/\s+/u).filter(Boolean);
    if (!tokens.length || tokens.length>3000) throw new Error('Use 1–3,000 whitespace-separated symbol IDs.');
    const result=R.applyKey(tokens,JSON.parse($('typed-key').value));
    $('key-output').textContent=result.text+'\n'+result.unresolved+' unresolved occurrences. Known-key application; no key recovery performed.';
  });
  $('save-key').onclick = guard(() => {
    const next=R.validate(doc), entries=JSON.parse($('typed-key').value); R.validateKey(entries);
    const id='key-'+(next.keys.length+1);next.keys.push({id,title:$('key-title').value,sourceUrl:$('key-source').value,entries});
    adopt(next, id+' recorded. Add an evidence-backed relationship below if you applied it to a reading.');
  });
  $('add-relation').onclick = guard(() => {
    const next=R.validate(doc);next.relations.push({from:$('relation-from').value,to:$('relation-to').value,type:$('relation-type').value,evidence:$('relation-evidence').value});
    adopt(next, 'Relationship and its supporting evidence recorded. External identifiers are allowed.');
  });

  // ── Segmentation ──────────────────────────────────────────────────────────
  let segmentation=null;
  function invalidateSegments() { segmentation=null;$('segment-output').textContent='Inputs changed. Recompute the alternatives.';$('segment-ambiguity').replaceChildren(); }
  ['segment-digits','segment-key','segment-locks','segment-budget','segment-score','segment-lines'].forEach(id=>$(id).addEventListener('input',invalidateSegments));
  $('segment-lines').addEventListener('change',invalidateSegments);
  $('segment-run').onclick=guard(()=>{
    const digits=$('segment-digits').value.replace(/\r/g,''),key=JSON.parse($('segment-key').value),bounds=$('segment-locks').value.trim();
    const scoring=$('segment-score').value;
    const fit=scoring==='english' ? s=>{const letters=s.toUpperCase().replace(/[^A-Z]/g,'');return letters.length>=3 ? DetectiveLangModel.fitness(letters) : 0;} : ()=>0;
    segmentation=R.segment(digits,key,bounds?bounds.split(',').map(s=>Number(s.trim())):[],Number($('segment-budget').value),fit,{lineBreaks:$('segment-lines').value});
    const out=$('segment-output');out.replaceChildren();
    el('p',(segmentation.complete?'Every complete path was enumerated and scored.':'Budget reached; the retained set is a bounded sample.')+' '+
      segmentation.total+(segmentation.totalCapped?'+':'')+' complete paths exist; '+segmentation.retained+' retained. '+segmentation.visited+' lattice nodes visited. Scoring: '+scoring+'.',out);
    el('p',(segmentation.globalBestGuaranteed?'The highest-scoring retained path is the globally best one. ':'The globally best path is NOT guaranteed: ')+segmentation.pruning,out);
    if (!segmentation.paths.length) el('p',segmentation.complete?'No path matches this key and these boundary locks. Every digit is unresolved.':'No complete path found within the budget. This is not proof that no path exists.',out);
    segmentation.paths.forEach(p=>{
      const d=el('div','',out);d.className='research-card';
      el('pre',p.codes.join(' | ')+' → '+p.text+'\nModel score: '+p.score.toFixed(2)+
        (p.alternatives.length?'\nUnresolved alternative readings: '+p.alternatives.map(a=>a.code+' → '+a.values.join('/')).join('; '):''),d);
      const b=el('button','Record this segmentation as a hypothesis',d);b.type='button';b.onclick=guard(()=>{
        if(pending()||doc.raw!==digits)throw new Error('The saved source must be exactly these digits before attaching a segmentation. Copy them into the source and save a revision first.');
        const note='Known-key segmentation hypothesis. Key: '+JSON.stringify(key)+'. Mandatory boundaries: '+JSON.stringify(segmentation.boundaries)+'. Line-break policy: '+segmentation.lineBreaks+'. Scoring: '+scoring+'. Mode: '+segmentation.mode+'; globally best guaranteed: '+segmentation.globalBestGuaranteed+'. Choice does not establish a historical reading.';
        adopt(R.addLayer(doc,'symbols','revision-'+doc.revision,p.codes.join(' | '),note),'Segmentation hypothesis appended; original digits retained.');
      });
    });
    const amb=$('segment-ambiguity');amb.replaceChildren();
    const open=segmentation.ambiguity.filter(a=>!a.forced&&!a.impossible);
    el('p',open.length?open.length+' of '+segmentation.ambiguity.length+' interior positions are genuinely ambiguous.':'No interior position is ambiguous under this key and these locks.',amb);
    el('pre',segmentation.ambiguity.map(a=>'after digit '+a.position+': '+
      (a.impossible?'impossible':a.forced?'forced':segmentation.totalCapped?'ambiguous (path counts capped)':a.pathsCutting+' of '+segmentation.total+' paths cut here')+
      (a.locked?' (locked)':'')+(a.startingCodes.length?' · codes starting here: '+a.startingCodes.join(', '):'')).join('\n'),amb);
    rememberResults('segmentation');
  });

  // ── Homophonic search and language comparison ─────────────────────────────
  function stopSearch(message) { searchGeneration++;if(worker)worker.terminate();worker=null;receipt=null;$('search-run').disabled=false;$('search-cancel').disabled=true;$('search-export').disabled=true;$('search-results').replaceChildren();$('search-status').textContent=message; }
  ['search-raw','search-locks','search-seed','search-steps','search-beam','search-algorithm','search-model'].forEach(id=>$(id).addEventListener('input',()=>stopSearch('Inputs changed. Run a new search.')));
  ['search-algorithm','search-model'].forEach(id=>$(id).addEventListener('change',()=>stopSearch('Solver or scoring model changed. Run a new search.')));
  $('search-cancel').onclick=()=>stopSearch('Search cancelled. No completed receipt was recorded.');
  $('search-run').onclick=guard(()=>{
    stopSearch('Starting local search…');const raw=$('search-raw').value;R.parseSymbols(raw);
    const algorithm=$('search-algorithm').value, model=$('search-model').value;
    const locks=JSON.parse($('search-locks').value);
    const options=algorithm==='beam'
      ? {beam:Number($('search-beam').value),branch:26,seed:Number($('search-seed').value),locks}
      : {seed:Number($('search-seed').value),steps:Number($('search-steps').value),locks};
    if(!window.Worker)throw new Error('This browser does not support the background worker required for search.');
    const started=performance.now(),generation=searchGeneration;worker=new Worker('../js/research-worker.js');$('search-run').disabled=true;$('search-cancel').disabled=false;
    worker.onerror=()=>{if(generation===searchGeneration)stopSearch('Search worker could not run. Reload online to cache its files, then try again.');};
    worker.onmessage=event=>{
      if(generation!==searchGeneration)return;
      if(event.data.error){stopSearch('Search rejected: '+event.data.error);return;}
      if(event.data.progress){$('search-status').textContent='Searching: '+event.data.progress.step+' / '+event.data.progress.steps+' steps.';return;}
      const r=event.data.result;worker.terminate();worker=null;$('search-run').disabled=false;$('search-cancel').disabled=true;
      receipt={version:2,kind:'cipher-museum-homophonic-search',raw,algorithm,model,options,result:r,elapsedMs:Math.round(performance.now()-started)};
      rememberResults('search');
      lastCandidate=r.candidates[0]?r.candidates[0].plaintext:'';
      $('search-export').disabled=false;
      $('search-status').textContent=(r.task==='known-key-application'?'Known-key application: all symbols were locked.':'Search completed; these are unverified candidates.')+
        ' Solver: '+(r.algorithm||'simulated annealing')+'. '+(r.algorithm==='beam-search'?('Beam width '+r.beam+', '+r.evaluations+' scored hypotheses. The partial score is NOT admissible, so pruning can have discarded the branch holding the correct key.'):(r.completedSteps+' mutation steps. Seed '+r.seed+'.'))+' Model: '+r.model+'.';
      const out=$('search-results');out.replaceChildren();
      r.candidates.forEach((c,i)=>{const d=el('details','',out);d.open=i===0;el('summary','Candidate '+(i+1)+' · model score '+c.score.toFixed(2),d);el('pre',c.plaintext,d);el('pre',JSON.stringify(c.key,null,2),d);});
      const d=el('details','',out);el('summary','Best retained score by step',d);el('pre',r.trace.map(t=>t.step+': '+t.score.toFixed(2)).join('\n'),d);
      if(r.extensionOrder){const e=el('details','',out);el('summary','Disclosed symbol-extension order',e);el('pre',r.extensionOrder.join(' '),e);}
    };worker.postMessage({raw,options,algorithm,model});
  });
  $('search-export').onclick=()=>{if(receipt)download('homophonic-search-receipt.json',receipt);};
  $('search-example').onclick=()=>{
    stopSearch('Original generated exercise loaded. This is a public demonstration, not a blind historical test.');
    const plain='THESECRETLETTERISINTHECHESTTHEKEYISINTHELETTERREADTHELETTERTHENOPENTHECHEST';
    const ids=new Map();let next=1;
    $('search-raw').value=Array.from(plain).map((c,i)=>{const k=c+(i%2);if(!ids.has(k))ids.set(k,'s'+next++);return ids.get(k);}).join(' ');
    $('search-locks').value='{}';$('search-seed').value='41';$('search-steps').value='15000';
  };
  function renderLanguage(text) {
    const out=$('language-output');out.replaceChildren();
    if(!languageSet){el('p','Historical-language profiles are not loaded. '+(languageError||'They are fetched on demand and are deliberately not part of the offline bundle, so this comparison needs a network connection.'),out);return;}
    const letters=text.toUpperCase().normalize('NFD').replace(/[^A-Z]/g,'');
    if(!letters){el('p','Enter a candidate reading first.',out);return;}
    const r=languageSet.compare(letters);
    el('p',r.decided
      ? 'Best fit: '+r.choice+', margin '+r.margin.toFixed(3)+' over the next profile. A profile names a language AND a period; this says nothing about which is right historically.'
      : 'No decision. '+r.abstentionReasons.join(' '),out);
    const table=el('pre',r.ranking.map(x=>x.id.padEnd(30)+' mean log-probability '+x.meanLogProbability.toFixed(3)+'  coverage '+(100*x.coverage).toFixed(1)+'%').join('\n'),out);
    table.setAttribute('aria-label','Language profile ranking');
    el('p',r.meaning,out);
    el('p','Thresholds: at least '+r.rule.minimumLetters+' letters, margin at least '+r.rule.minimumMargin+', coverage at least '+(100*r.rule.minimumCoverage).toFixed(0)+'%. Abstention is a result, not a failure.',out);
  }
  $('language-run').onclick=guard(()=>renderLanguage($('language-text').value));
  $('language-from-candidate').onclick=guard(()=>{
    if(!lastCandidate)throw new Error('Run a search first, or paste a reading.');
    $('language-text').value=lastCandidate;renderLanguage(lastCandidate);
  });

  // ── Investigation bundle ──────────────────────────────────────────────────
  function bundleState() {
    const saved = retainedBundle;
    const keys = doc.keys.map(k => ({ at: doc.source.date || '', reason: 'Saved key ' + k.id + ': ' + k.title,
      locks: Object.fromEntries(k.entries.filter(e => e.type === 'letter' && e.values.length === 1 && /^[A-Z]$/.test(e.values[0])).map(e => [e.symbol, e.values[0]])) }));
    const keyRevisions = (saved ? saved.keyRevisions : []).slice();
    keys.forEach((k,i) => {
      if (!(saved && saved.evidence.keys.some(old => old.id === doc.keys[i].id)) &&
        !keyRevisions.some(old => JSON.stringify(old) === JSON.stringify(k))) keyRevisions.push(k);
    });
    return { title: $('bundle-title').value, created: saved ? saved.created : new Date().toISOString().slice(0,10),
      sourceFingerprint: saved ? saved.sourceFingerprint : undefined, legacyUnbound: saved ? saved.legacyUnbound : false,
      scoringModel: $('search-model').value, solver: $('search-algorithm').value,
      selectedLayer: $('layer-parent').value || ('revision-' + doc.revision),
      keyRevisions,
      search: receipt || (saved && saved.search) ? { ...(saved && saved.search || {}),
        ...(saved && saved.search && !saved.search.producedWith ? { producedWith: saved.tool } : {}),
        algorithm: $('search-algorithm').value, raw: $('search-raw').value, seed: Number($('search-seed').value),
        steps: Number($('search-steps').value), beam: Number($('search-beam').value), locks: JSON.parse($('search-locks').value),
        elapsedMs: receipt ? receipt.elapsedMs : saved.search.elapsedMs } : null,
      segmentation: segmentation || (saved && saved.segmentation) ? { ...(saved && saved.segmentation || {}),
        ...(saved && saved.segmentation && !saved.segmentation.producedWith ? { producedWith: saved.tool } : {}),
        digits: $('segment-digits').value, key: JSON.parse($('segment-key').value),
        boundaries: $('segment-locks').value.trim() ? $('segment-locks').value.split(',').map(x=>Number(x.trim())) : [],
        budget: Number($('segment-budget').value), scoring: $('segment-score').value, lineBreaks: $('segment-lines').value } : null,
      candidates: receipt ? receipt.result.candidates.slice(0,5).map((c,i) => ({ plaintext: c.plaintext, score: c.score, key: c.key,
        chosen: i === 0, provenance: receipt.algorithm + ' · ' + receipt.model + ' · ' + (receipt.options.seed !== undefined ? 'seed ' + receipt.options.seed : 'deterministic') })) : saved ? saved.candidates : [] };
  }
  function rememberResults(kind) {
    const state = bundleState();
    delete state.sourceFingerprint; state.legacyUnbound = false;
    delete state[kind].configurationFingerprint; delete state[kind].inputFingerprint;
    delete state[kind].producedWith;
    retainedBundle = R.bundle(doc, state);
  }
  function restoreBundle(b) {
    stopSearch('Imported investigation: recorded candidates are retained; rerun to reproduce them.');
    invalidateSegments(); previous = doc; doc = b.evidence; retainedBundle = b;
    $('restore-record').disabled = false; $('bundle-title').value = b.title;
    clearImage(); selectedClass = ''; selectedOccurrences.clear();
    if (b.search) {
      $('search-raw').value = b.search.raw; $('search-locks').value = JSON.stringify(b.search.locks);
      $('search-algorithm').value = b.search.algorithm;
      $('search-seed').value = String(b.search.seed); $('search-steps').value = String(b.search.steps);
      $('search-beam').value = String(b.search.beam);
    }
    if (b.segmentation) {
      $('segment-digits').value = b.segmentation.digits; $('segment-key').value = JSON.stringify(b.segmentation.key);
      $('segment-locks').value = b.segmentation.boundaries.join(', '); $('segment-budget').value = String(b.segmentation.budget);
      $('segment-score').value = b.segmentation.scoring; $('segment-lines').value = b.segmentation.lineBreaks;
    }
    const model = b.tool.scoringModel || BASELINE.id;
    if (!Array.from($('search-model').options).some(o => o.value === model)) {
      const option = el('option', 'Saved model: ' + model + ' (not loaded)', $('search-model'));
      option.value = model; option.dataset.saved = 'true';
    }
    $('search-model').value = model;
    render();
    if (b.selectedLayer) $('layer-parent').value = b.selectedLayer;
    lastCandidate = b.candidates.length ? b.candidates[0].plaintext : '';
  }
  function describeBundle(b) {
    const flags = Object.entries(b.stale).filter(([,v]) => v).map(([k]) => k);
    $('bundle-state').textContent = JSON.stringify({ title: b.title, created: b.created, tool: b.tool,
      selectedLayer: b.selectedLayer, keyRevisions: b.keyRevisions.length, search: b.search,
      segmentation: b.segmentation, candidates: b.candidates.length, images: b.images, legacyUnbound: b.legacyUnbound, stale: b.stale }, null, 2);
    return flags;
  }
  $('bundle-export').onclick = guard(() => {
    if (pending()) throw new Error('Save the source revision before exporting the investigation.');
    const b = R.bundle(doc, bundleState());
    download('cipher-museum-investigation.json', b);
    describeBundle(b);
    note('bundle-status','Investigation bundle exported. Image bytes were not included: reopen each file locally and the recorded hash will tell you whether the bytes match.');
  });
  $('bundle-import').onchange = async function () {
    const file = this.files[0]; if (!file) return;
    try {
      if (file.size > 1500000) throw new Error('A bundle is limited to 1,500,000 bytes.');
      const b = R.openBundle(JSON.parse(await file.text()));
      // Only once the bundle validates is the current record replaced.
      restoreBundle(b);
      const flags = describeBundle(b);
      note('bundle-status','Investigation restored: evidence record, selected layer, ' + b.keyRevisions.length + ' key revision(s), solver settings and ' +
        b.candidates.length + ' recorded candidate(s). ' + (flags.length
          ? 'STALE: ' + flags.join(', ') + '. These receipts lack a complete matching binding or no longer match the inputs. Retain them as historical results; recompute before reuse.'
          : 'No stale results. Reproducing a candidate still needs the same solver and scoring-model build, not only the same seed.'), flags.length > 0);
    } catch (e) { note('bundle-status','Bundle rejected; your current record was not touched. ' + e.message, true); }
    this.value = '';
  };
  const EXAMPLES = {
    unidentified: () => {
      let d = R.create('g1 g2 g3 g1 g4 g2 g5 g3 g1 g2');
      d.source = Object.assign(d.source, { artifactId: 'unknown:unidentified-letter:1',
        archive: 'Unidentified; the catalogue entry is for the surrounding bundle, not this leaf',
        folio: 'Single leaf, unfoliated', transcriber: 'Workbench example',
        method: 'Symbol IDs assigned by first appearance; no facsimile is distributed with this example' });
      d.revisions[0].raw = d.raw;
      d = R.addHypothesis(d, { claim: 'The catalogue describes this leaf as a letter from the secretary named in the bundle heading.',
        confidence: 'unsupported',
        supports: [{ ref: 'catalogue-entry', note: 'The bundle heading names that secretary.' }],
        contradicts: [{ ref: 'physical-leaf', note: 'The heading describes the bundle. Nothing on this leaf names anyone, and neighbouring documents are a clue, not a foundation for attribution.' }],
        alternatives: ['A different correspondent whose papers were bound into the same bundle', 'A copy made later and filed with the originals'],
        note: 'DELIBERATELY MISLEADING CATALOGUE DESCRIPTION. The entry is about the bundle; the leaf is unidentified.' });
      d = R.addHypothesis(d, { claim: 'The repeated group g1 g2 stands for a proper name.',
        confidence: 'possible',
        supports: [{ ref: 'revision-1', note: 'The pair recurs at the opening and the close, where a salutation and a signature would sit.' }],
        contradicts: [],
        alternatives: ['A common word rather than a name', 'Two independent symbols that happen to adjoin'],
        note: 'UNRESOLVED NAME. Position is suggestive and is not evidence of identity. This case has no complete outcome and is not meant to acquire one.' });
      d = R.addHypothesis(d, { claim: 'A letter key that applies to every symbol would establish who wrote the leaf.',
        confidence: 'contradicted',
        supports: [], contradicts: [{ ref: 'method', note: 'Applying a key is a mechanical result. Authorship, date and normalized spelling are separate claims needing separate evidence.' }],
        alternatives: [], note: 'Recorded so the register itself states the rule it exists to enforce.' });
      return { doc: d, state: { title: 'Unidentified document, incomplete outcome' },
        message: 'Loaded the unidentified-document case. Its outcome is deliberately incomplete: a misleading catalogue description and an unresolved name both stay visible, and no key application would resolve either.' };
    },
    segmentation: () => {
      let d = R.create('2228');
      d.revisions[0].raw = d.raw;
      d.source = Object.assign(d.source, { artifactId: 'example:numerical-segmentation:1',
        transcriber: 'Workbench example', method: 'Digits recorded exactly as written; no spacing inferred' });
      d = R.addHypothesis(d, { claim: 'The digit stream 2228 has one correct reading.',
        confidence: 'contradicted', supports: [],
        contradicts: [{ ref: 'segmentation', note: 'Under the key {2:A, 22:N, 8:D} three complete paths exist: AAAD, AND and NAD. The source alone selects none of them.' }],
        alternatives: ['AAAD', 'AND', 'NAD'],
        note: 'A language score ranks these; it does not remove the ambiguity.' });
      return { doc: d, state: { title: 'Numerical segmentation with an ambiguous boundary',
          segmentation: { digits: '2228', key: { '2':'A','22':'N','8':'D' }, boundaries: [], budget: 10000, scoring: 'neutral', lineBreaks: 'boundary' } },
        message: 'Loaded the segmentation example. Press “Compare segmentations” to see all three readings and which boundary positions are genuinely ambiguous.' };
    }
  };
  $('bundle-load-example').onclick = guard(() => {
    const key = $('bundle-example').value;
    if (!key) throw new Error('Choose an example first.');
    const made = EXAMPLES[key]();
    const b = R.bundle(made.doc, made.state);
    restoreBundle(b); describeBundle(b);
    note('bundle-status', made.message);
  });

  window.addEventListener('pagehide',()=>{if(worker)worker.terminate();if(imageURL)URL.revokeObjectURL(imageURL);});
  // Explicit handoff from Detective; never fetch source images or papers automatically.
  try {const v=sessionStorage.getItem('museum-evidence-import');if(v){doc=R.migrate(JSON.parse(v));sessionStorage.removeItem('museum-evidence-import');status('Imported your Detective transcription. Add source information, then export to keep the record.');}}catch(e){status('Could not read the Detective handoff: '+e.message,true);}
  // Scoring models: the modern-English baseline is always available; the historical
  // profiles load from a separate versioned file and are disclosed as what they are.
  const modelSelect = $('search-model');
  el('option', BASELINE.label, modelSelect).value = BASELINE.id;
  if (typeof fetch === 'function') {
    fetch('../data/research/v2/language-profiles.json').then(r => { if (!r.ok) throw new Error('Could not load the historical-language profiles.'); return r.json(); })
      .then(data => {
        languageSet = window.MuseumResearchLanguage.buildProfiles(data);
        languageSet.profiles.forEach(p => {
          Array.from(modelSelect.options).filter(o => o.value === p.id && o.dataset.saved).forEach(o => o.remove());
          el('option', p.language + ' — ' + p.period + ' (' + p.id + ')', modelSelect).value = p.id;
        });
      }).catch(e => { languageError = e.message; });
  } else { languageError = 'This browser cannot load the profile file.'; }
  render();
})();
```


## JavaScript — js/research-worker.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/research-worker.js`
- Served SHA-256: `f7e930bbecb8f488c917382b43bad7ca5d0923fd789616e75a0f3fb63281b105`
- Readable-source SHA-256: `f7e930bbecb8f488c917382b43bad7ca5d0923fd789616e75a0f3fb63281b105`


```javascript
'use strict';
importScripts('research-language-model.js', 'research-model.js');
const BASELINE = 'museum-prose-quadgram-v1';
const loaded = {};
// Scoring models are fetched once each and cached for the life of the worker.
function load(id) {
  if (loaded[id]) return loaded[id];
  const file = id === BASELINE ? '../data/research/v1/language-model.json' : '../data/research/v2/language-profiles.json';
  loaded[id] = fetch(file).then(response => {
    if (!response.ok) throw new Error('Could not load the scoring model.');
    return response.json();
  }).then(data => {
    if (id === BASELINE) return MuseumResearchLanguage.build(data).fitness;
    const set = MuseumResearchLanguage.buildProfiles(data);
    const profile = set.byId[id];
    if (!profile) throw new Error('Unknown scoring profile: ' + id);
    return profile.fitness;
  });
  return loaded[id];
}
self.onmessage = async function (event) {
  try {
    const input = event.data;
    if (typeof fetch !== 'function') throw new Error('This browser cannot load the scoring model.');
    const fitness = await load(input.model || BASELINE);
    const tokens = MuseumResearch.parseSymbols(input.raw);
    const progress = value => self.postMessage({ progress: value });
    const result = input.algorithm === 'beam'
      ? MuseumResearch.beamSearch(tokens, input.options, fitness, progress)
      : MuseumResearch.search(tokens, input.options, fitness, progress);
    self.postMessage({ result });
  } catch (error) { self.postMessage({ error: error.message }); }
};
```


## JavaScript — js/search.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/search.js`
- Served SHA-256: `cb152e1c07e71650fb727b994c94a0c3685217bf139dd194e52372039bedf0d7`
- Readable-source SHA-256: `cb152e1c07e71650fb727b994c94a0c3685217bf139dd194e52372039bedf0d7`


```javascript
/**
 * THE CIPHER MUSEUM — Site Search
 * Loads /js/search-index.json and provides ranked substring + token matching
 * across the 167-exhibit collection (cipher pages, exhibit halls, biographies,
 * cryptanalysis techniques, the timeline, and key tool pages).
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
    var inSub = /\/(ciphers|halls|tours|lab|community|hall-of-foundations)\//.test(p);
    return inSub ? '../' : '';
  })();

  var _entries = null;
  var _loadPromise = null;

  function normalizeSearchText(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      // Elide every apostrophe form rather than folding them to one, so an
      // apostrophe-free query ("geez") reaches an apostrophised title ("Geʼez").
      .replace(/[\u2018\u2019\u02bbʼ']/g, '')
      .toLowerCase();
  }

  function words(value) {
    return normalizeSearchText(value).match(/[\p{L}\p{N}]+/gu) || [];
  }

  // Separator-insensitive form. Titles hyphenate designations that visitors type
  // closed up — "M-209", "SHA-256", "KL-7" are searched as "m209", "sha256",
  // "kl7" — so matching also consults a form with every separator removed.
  // Used only as an extra alternative, never to replace a normal match.
  function flatten(value) {
    return normalizeSearchText(value).replace(/[^\p{L}\p{N}]+/gu, '');
  }

  function load() {
    if (_entries) return Promise.resolve(_entries);
    if (_loadPromise) return _loadPromise;
    if (typeof fetch !== 'function') {
      return Promise.reject(new Error('Fetch is unavailable'));
    }
    _loadPromise = fetch(BASE + INDEX_URL_REL, {cache: 'force-cache'})
      .then(function (r) {
        if (!r.ok) throw new Error('Index HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.entries)) throw new Error('Invalid search index');
        _entries = data.entries.map(function (e) {
          var haystack = e.t + ' ' + (e.h || '') + ' ' + (e.s || '') + ' ' + (e.g || []).join(' ');
          return {
            title: e.t,
            url: BASE + e.u,
            kind: e.k,
            hall: e.h,
            created: e.c,
            broken: e.b,
            trust: e.trust || null,
            exhibitNumber: e.exhibitNumber,
            note: e.n || '',
            summary: e.s,
            tags: e.g || [],
            _hay: normalizeSearchText(haystack),
            _words: words(haystack),
            _flat: flatten(haystack)
          };
        });
        return _entries;
      })
      .catch(function (err) {
        console.error('[CipherSearch] index load failed:', err);
        _loadPromise = null;
        throw err;
      });
    return _loadPromise;
  }

  function tokenize(q) {
    return words(q);
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
    var rawLower = normalizeSearchText(raw);
    var titleLower = normalizeSearchText(entry.title);
    var s = 0;
    var matchedField = null;

    var rawFlat = flatten(raw);
    var titleFlat = flatten(entry.title);
    if (titleLower === rawLower || titleFlat === rawFlat) { s += 50; matchedField = 'title'; }
    else if (titleLower.indexOf(rawLower) === 0 || titleFlat.indexOf(rawFlat) === 0) { s += 25; matchedField = 'title'; }
    else if (titleLower.indexOf(rawLower) >= 0 || titleFlat.indexOf(rawFlat) >= 0) { s += 12; matchedField = 'title'; }

    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      var hit = false;
      var eraToken = tok === 'wwi' || tok === 'wwii';
      var includesToken = function (value) {
        if (eraToken) return words(value).indexOf(tok) >= 0;
        return normalizeSearchText(value).indexOf(tok) >= 0 || flatten(value).indexOf(tok) >= 0;
      };

      if (includesToken(titleLower)) { s += 8; hit = true; matchedField = matchedField || 'title'; }
      for (var j = 0; j < entry.tags.length; j++) {
        var tag = normalizeSearchText(entry.tags[j]);
        if (tag === tok) { s += 10; hit = true; matchedField = matchedField || 'tag'; break; }
        if (!eraToken && tag.indexOf(tok) >= 0) { s += 4; hit = true; matchedField = matchedField || 'tag'; }
      }
      if (includesToken(entry.hall || '')) { s += 6; hit = true; matchedField = matchedField || 'hall'; }
      if (includesToken(entry.summary || '')) { s += 4; hit = true; matchedField = matchedField || 'summary'; }
      if (!hit && (eraToken ? entry._words.indexOf(tok) >= 0
          : (entry._hay.indexOf(tok) >= 0 || entry._flat.indexOf(tok) >= 0))) { s += 2; hit = true; matchedField = matchedField || 'any'; }
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
    var raw = String(text);
    var tokens = tokenize(q).filter(function (t) { return t.length >= 2; });
    if (!tokens.length) return escapeHTML(raw);
    // Match original text once. Repeated replacements over escaped HTML can
    // highlight inside an entity or inside the <mark> tags just inserted.
    tokens.sort(function (a, b) { return b.length - a.length; });
    var re = new RegExp(tokens.map(function (t) {
      return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('|'), 'gi');
    var result = '', cursor = 0, match;
    while ((match = re.exec(raw))) {
      result += escapeHTML(raw.slice(cursor, match.index)) + '<mark>' + escapeHTML(match[0]) + '</mark>';
      cursor = match.index + match[0].length;
    }
    return result + escapeHTML(raw.slice(cursor));
  }

  window.CipherSearch = {
    load: load,
    query: query,
    highlight: highlight,
    normalize: normalizeSearchText,
    base: BASE
  };
})();
```


## JavaScript — js/secrecy-experiments.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/secrecy-experiments.js`
- Served SHA-256: `baeeea3ac4c134d997f354f9a8ce1392cc7fb515aad850c4fc2420ca04d21077`
- Readable-source SHA-256: `baeeea3ac4c134d997f354f9a8ce1392cc7fb515aad850c4fc2420ca04d21077`


```javascript
/* Finite probability models for the OTP exhibit, not an encryption tool. */
'use strict';
(function(global){
  function distribution(rows,left,right){
    const joint=new Map(),a=new Map(),b=new Map();
    for(const row of rows){const x=left(row),y=right(row),key=JSON.stringify([x,y]);
      joint.set(key,(joint.get(key)||0)+row.p);a.set(x,(a.get(x)||0)+row.p);b.set(y,(b.get(y)||0)+row.p);}
    let information=0,distance=0;
    for(const [x,px] of a)for(const [y,py] of b){
      const p=joint.get(JSON.stringify([x,y]))||0,independent=px*py;
      if(p>0)information+=p*Math.log2(p/independent);
      distance+=Math.abs(p-independent)/2;
    }
    return {information:Math.abs(information)<1e-12?0:information,distance};
  }
  function binary(priorZero,padOne){
    if(![priorZero,padOne].every(x=>Number.isFinite(x)&&x>=0&&x<=1))throw new Error('Probabilities must be between0 and1.');
    const rows=[];
    for(let m=0;m<2;m++)for(let k=0;k<2;k++)rows.push({m,k,c:m^k,p:(m?1-priorZero:priorZero)*(k?padOne:1-padOne)});
    const ciphertext=[0,1].map(c=>rows.filter(r=>r.c===c).reduce((sum,r)=>sum+r.p,0));
    const posteriorZero=ciphertext.map((p,c)=>p?rows.filter(r=>r.m===0&&r.c===c).reduce((sum,r)=>sum+r.p,0)/p:null);
    return {rows,ciphertext,posteriorZero,information:distribution(rows,r=>r.m,r=>r.c).information,
      pairwiseDistance:Math.abs(1-2*padOne),decryptionError:0};
  }
  function twoMessages(fresh){
    const rows=[],count=fresh?256:64;
    for(let m1=0;m1<4;m1++)for(let m2=0;m2<4;m2++)for(let k1=0;k1<4;k1++){
      for(let j=0;j<(fresh?4:1);j++){const k2=fresh?j:k1;rows.push({m1,m2,c1:m1^k1,c2:m2^k2,p:1/count});}
    }
    const joint=distribution(rows,r=>r.m1+','+r.m2,r=>r.c1+','+r.c2);
    return {count,singleInformation:distribution(rows,r=>r.m1,r=>r.c1).information,
      jointInformation:joint.information,jointDistance:joint.distance};
  }
  const api={binary,twoMessages};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  global.MuseumSecrecy=api;
  if(typeof document==='undefined'||!document.getElementById('secrecy-model'))return;
  const $=id=>document.getElementById(id),fmt=x=>x===null?'undefined (impossible observation)':x.toFixed(5);
  function render(){
    const r=binary(Number($('secrecy-prior').value),Number($('secrecy-bias').value));
    $('secrecy-joint').replaceChildren();
    r.rows.forEach(row=>{const tr=document.createElement('tr');[row.m,row.k,row.c,fmt(row.p)].forEach(value=>{const td=document.createElement('td');td.textContent=String(value);tr.appendChild(td);});$('secrecy-joint').appendChild(tr);});
    $('secrecy-result').textContent='Ciphertext probabilities: C=0: '+fmt(r.ciphertext[0])+', C=1: '+fmt(r.ciphertext[1])+'. '+
      'Pr(M=0 | C=0): '+fmt(r.posteriorZero[0])+'. Pr(M=0 | C=1): '+fmt(r.posteriorZero[1])+'. '+
      'Mutual information I(M;C): '+fmt(r.information)+' bits. Pairwise ciphertext total-variation distance: '+fmt(r.pairwiseDistance)+'. Decryption error:0.';
    const t=twoMessages($('secrecy-fresh').checked);
    $('secrecy-reuse-result').textContent=t.count+' equally likely message/message/pad outcomes. '+
      'Single-message I(M₁;C₁): '+fmt(t.singleInformation)+' bits. Joint I((M₁,M₂);(C₁,C₂)): '+fmt(t.jointInformation)+' bits. '+
      'Distance between the joint message/ciphertext-pair distribution and the product of its marginals: '+fmt(t.jointDistance)+'.';
  }
  ['secrecy-prior','secrecy-bias','secrecy-fresh'].forEach(id=>$(id).addEventListener('change',render));
  render();
})(typeof window!=='undefined'?window:globalThis);
```


## JavaScript — js/trust-labels.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/trust-labels.js`
- Served SHA-256: `df5dd97d87412f530ae69bc145c70159f52e13b7a1cfa8d3403c0f0c83d0476e`
- Readable-source SHA-256: `df5dd97d87412f530ae69bc145c70159f52e13b7a1cfa8d3403c0f0c83d0476e`


```javascript
/* Canonical metadata is generated from data/exhibit-trust.json and data/trust-labels.json. */
'use strict';
(function (global) {
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function badge(trust) {
    if (!trust) return '';
    if (!/^(broken|historical|educational|secure)$/.test(trust.key)) throw new Error('Unknown trust category');
    return '<span class="trust-label trust-label--' + trust.key + ' trust-label--sm" title="' +
      escapeHTML(trust.description) + '">' + escapeHTML(trust.text) + '</span>';
  }
  const api = { badge, escapeHTML };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.TrustLabels = api;
})(typeof window !== 'undefined' ? window : globalThis);
```


## JavaScript — js/ui-delegates.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/ui-delegates.js`
- Served SHA-256: `533029a0253d48b410e3e6f14dfbb616ff3bc233a2f6ef7d1387babd26af4959`
- Readable-source SHA-256: `533029a0253d48b410e3e6f14dfbb616ff3bc233a2f6ef7d1387babd26af4959`


```javascript
'use strict';
/**
 * Global delegated event handlers — replaces inline onclick= attributes.
 *
 * Handles three data-attribute patterns:
 *   data-file="name.jsonl"      → open corpus/eval file in new tab
 *   data-reveal-next            → show nextElementSibling, hide self
 *   data-fn="fnName"            → call window[fnName](data-arg)
 *   data-fn="fnName" data-arg   → call window[fnName](arg), numeric args coerced
 */
(function () {
  // Hide broken images (replaces onerror= inline handlers)
  document.addEventListener('error', function (e) {
    if (e.target && e.target.tagName === 'IMG' && e.target.parentElement) {
      e.target.parentElement.style.display = 'none';
    }
  }, true);

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-file],[data-reveal-next],[data-fn]');
    if (!el) return;

    if ('file' in el.dataset) {
      var name = el.dataset.file;
      var base = '/public/corpus/';
      window.open(base + name, '_blank');
      return;
    }

    if ('revealNext' in el.dataset) {
      var next = el.nextElementSibling;
      if (next) { next.hidden = false; next.style.display = 'block'; }
      el.style.display = 'none';
      return;
    }

    if ('fn' in el.dataset) {
      var fn = window[el.dataset.fn];
      if (typeof fn !== 'function') return;
      if ('arg' in el.dataset) {
        var arg = el.dataset.arg;
        fn(!isNaN(arg) && arg !== '' ? Number(arg) : arg);
      } else {
        fn();
      }
    }
  });
})();
```


## JavaScript — scripts/columnar-classroom.js

**Classroom command-line tool:** runs with Node.js in a repository checkout; it is not a browser demo. The linked worksheet and fixed fixtures are included separately.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `scripts/columnar-classroom.js`
- Served SHA-256: `fc4b64e8877c3fad1c6866029f58189c1c7a6f555a4a44fdcc148f78e68fc4f3`
- Readable-source SHA-256: `fc4b64e8877c3fad1c6866029f58189c1c7a6f555a4a44fdcc148f78e68fc4f3`


```javascript
#!/usr/bin/env node
'use strict';
// A small receipt-producing classroom experiment; reuses the Museum solver.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const root = path.join(__dirname, '..');
const columnar = require('../js/columnar-search');
require('../js/detective/lang-model');
const fixturePath = 'public/teaching/columnar-classroom-fixtures.json';
const corpus = JSON.parse(fs.readFileSync(path.join(root, fixturePath), 'utf8'));
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

// Reference preparation is separate from the search implementation: write rows,
// then read the specified columns. Fixed ciphertexts are retained in the fixture.
function referenceEncrypt(plaintext, order) {
  const rows = [];
  for (let i = 0; i < plaintext.length; i += order.length) rows.push(plaintext.slice(i, i + order.length));
  return order.map(column => rows.map(row => row[column] || '').join('')).join('');
}
function runExperiment({clock = () => performance.now()} = {}) {
  const runs = [];
  const variants = [{id:'direct', staged:false}, {id:'staged', staged:true}];
  for (const fixture of corpus.fixtures) {
    if (referenceEncrypt(fixture.plaintext, fixture.order) !== fixture.ciphertext) throw Error('Fixture does not match its independent row/column reference: ' + fixture.id);
    if (fixture.length !== fixture.plaintext.length || fixture.width !== fixture.order.length || fixture.remainder !== fixture.length % fixture.width) throw Error('Fixture shape mismatch: ' + fixture.id);
    for (const seed of corpus.seeds) for (const variant of variants) {
      const options = {width:fixture.width, budget:corpus.budget, restarts:corpus.restarts, seed, staged:variant.staged, alignment:true, segments:true};
      const started = clock();
      const result = columnar.solve(fixture.ciphertext, options);
      const elapsedMs = Math.max(0, clock() - started);
      if (result.evaluations > options.budget || result.preprocessing > result.evaluations) throw Error('Budget accounting failed.');
      const exactPlaintext = !!result.best && result.best.plaintext === fixture.plaintext;
      const exactKey = !!result.best && result.best.order.every((value, i) => value === fixture.order[i]);
      runs.push({fixture:fixture.id, variant:variant.id, options, length:fixture.length, remainder:fixture.remainder,
        rectangle:fixture.remainder ? 'incomplete' : 'complete', evaluations:result.evaluations,
        preprocessingEvaluations:result.preprocessing, elapsedMs,
        exactPlaintext, exactKey, outcome:exactPlaintext ? 'plaintext-recovered' : result.best ? 'different-candidate' : 'no-candidate',
        candidate:result.best ? {plaintext:result.best.plaintext, order:result.best.order, score:result.best.score} : null,
        reason:result.reason});
    }
  }
  const summary = variants.map(variant => {
    const rows = runs.filter(run => run.variant === variant.id);
    return {variant:variant.id, runs:rows.length, exactPlaintexts:rows.filter(run => run.exactPlaintext).length,
      exactKeys:rows.filter(run => run.exactKey).length, noCandidate:rows.filter(run => !run.candidate).length,
      unsuccessfulPlaintexts:rows.filter(run => !run.exactPlaintext).length};
  });
  return {schema:'museum-columnar-classroom-receipt-v1', fixtureSet:corpus,
    sources:{fixturesSha256:digest(fixturePath), solverSha256:digest('js/columnar-search.js'), languageModelSha256:digest('js/detective/lang-model.js'), runnerSha256:digest('scripts/columnar-classroom.js')},
    runtime:{node:process.version, platform:process.platform, arch:process.arch},
    scope:'24 fixed runs: four synthetic messages, three seeds, two variants differing only in staged initialization. Every failure is retained. These counts describe this small fixture set, not general recovery probabilities. Repeated seeds on a message are dependent. Equal evaluation budgets are not equal CPU work. Timings vary and are excluded from exact replay.',
    summary, runs};
}
function withoutTimings(report) {
  return {...report, runs:report.runs.map(({elapsedMs, ...run}) => run)};
}
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--check','--help'].includes(arg))) throw Error('Usage: node scripts/columnar-classroom.js [--check | --help]');
  if (args.includes('--help')) {
    console.log('Emit 24-run JSON receipt to stdout: node scripts/columnar-classroom.js > columnar-classroom-results.json\nCheck deterministic replay, excluding time: node scripts/columnar-classroom.js --check');
  } else if (args.includes('--check')) {
    const first = runExperiment(), second = runExperiment();
    require('node:assert/strict').deepEqual(withoutTimings(first), withoutTimings(second));
    console.log('All 24 classroom runs replay exactly apart from elapsed time. Failures and exhausted budgets remain in the receipt.');
  } else {
    console.log(JSON.stringify(runExperiment(), null, 2));
  }
}
module.exports = {runExperiment, withoutTimings, referenceEncrypt};
```


## JavaScript — scripts/research-splits.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `scripts/research-splits.js`
- Served SHA-256: `fe57341e14a3e4b39aa8d3d15f1238d81e49baf8752ba30b383b726865de4010`
- Readable-source SHA-256: `fe57341e14a3e4b39aa8d3d15f1238d81e49baf8752ba30b383b726865de4010`


```javascript
'use strict';
// Declared split and grouping rules for research-evaluation v2.
//
// Two leakage routes are closed explicitly.
//   1. SOURCE GROUPING. Every ciphertext variant derived from one source document
//      belongs to the same split. Variants of one plaintext are not independent items,
//      and scattering them across splits would let a tuning split reveal a test answer.
//   2. KEY AND CODE-POOL DISJOINTNESS. A key seed used in one split is never reused in
//      another, and the fixed code pools of the pool-recognition task are disjoint
//      between splits. A pool shared across splits turns recognition into memorization.
//
// Splits are assigned from the COLLECTION, not the document, so a whole collection can
// be held out when a question is about generalizing beyond a body of material.
const SPLITS = ['development', 'test'];
// Collections marked development are the only material thresholds or budgets may be
// tuned on. Everything else is reported as a held-out measurement.
const COLLECTION_SPLIT = {
  // The only tuning material: the probes the language-profile abstention thresholds
  // were calibrated on. Nothing else may be tuned against.
  'language-development-probes': 'development',
  'museum-prose-en': 'test',
  'museum-prose-fr': 'test',
  'gutenberg-pre1800': 'test',
  'authentic-z340': 'test'
};
// Key seeds are allocated from per-split disjoint ranges.
const SEED_RANGES = { development: [10000, 19999], test: [20000, 29999] };
const POOL_RANGES = { development: [30000, 30999], test: [31000, 31999] };

function splitOf(collection) {
  const split = COLLECTION_SPLIT[collection];
  if (!split) throw new Error('Unknown collection: ' + collection);
  return split;
}
// Deterministic, order-independent seed allocation inside a split's own range.
function seedFor(split, label, kind) {
  const range = (kind === 'pool' ? POOL_RANGES : SEED_RANGES)[split];
  if (!range) throw new Error('Unknown split: ' + split);
  let h = 2166136261;
  for (let i = 0; i < label.length; i++) { h ^= label.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return range[0] + (h % (range[1] - range[0] + 1));
}
// Check the rules rather than trusting them: used by the evaluation and by its test.
function audit(items) {
  const problems = [];
  const splitByDocument = new Map();
  const seedsBySplit = new Map();
  const poolsBySplit = new Map();
  for (const item of items) {
    const prior = splitByDocument.get(item.sourceDocument);
    if (prior && prior !== item.split) {
      problems.push('Source document ' + item.sourceDocument + ' appears in both ' + prior + ' and ' + item.split + '.');
    }
    splitByDocument.set(item.sourceDocument, item.split);
    if (item.keySeed !== undefined && item.keySeed !== null) {
      if (!seedsBySplit.has(item.split)) seedsBySplit.set(item.split, new Set());
      seedsBySplit.get(item.split).add(item.keySeed);
      const range = SEED_RANGES[item.split];
      if (item.keySeed < range[0] || item.keySeed > range[1]) {
        problems.push('Key seed ' + item.keySeed + ' is outside the ' + item.split + ' range.');
      }
    }
    if (item.poolId !== undefined && item.poolId !== null) {
      if (!poolsBySplit.has(item.split)) poolsBySplit.set(item.split, new Set());
      poolsBySplit.get(item.split).add(item.poolId);
    }
  }
  const splits = Array.from(seedsBySplit.keys());
  for (let i = 0; i < splits.length; i++) for (let j = i + 1; j < splits.length; j++) {
    for (const seed of seedsBySplit.get(splits[i])) {
      if (seedsBySplit.get(splits[j]).has(seed)) problems.push('Key seed ' + seed + ' is shared by ' + splits[i] + ' and ' + splits[j] + '.');
    }
  }
  const poolSplits = Array.from(poolsBySplit.keys());
  for (let i = 0; i < poolSplits.length; i++) for (let j = i + 1; j < poolSplits.length; j++) {
    for (const pool of poolsBySplit.get(poolSplits[i])) {
      if (poolsBySplit.get(poolSplits[j]).has(pool)) problems.push('Code pool ' + pool + ' is shared by ' + poolSplits[i] + ' and ' + poolSplits[j] + '.');
    }
  }
  return { ok: problems.length === 0, problems,
    documents: splitByDocument.size, items: items.length,
    perSplit: Object.fromEntries(SPLITS.map(s => [s, items.filter(i => i.split === s).length])) };
}
module.exports = { SPLITS, COLLECTION_SPLIT, SEED_RANGES, POOL_RANGES, splitOf, seedFor, audit };
```


## JavaScript — sw.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `sw.js`
- Served SHA-256: `b1a0561a0ccce32a8ab1273ec24e32f43ba7877f6a2df4a36de1c6317b50d9cc`
- Readable-source SHA-256: `b1a0561a0ccce32a8ab1273ec24e32f43ba7877f6a2df4a36de1c6317b50d9cc`


```javascript
/**
 * THE CIPHER MUSEUM — Service Worker
 * Offline support for classrooms and flaky connections.
 *
 * Strategy:
 *   - HTML navigations: network-first, falling back to cache (content stays fresh
 *     online; cached pages may be available offline while their assets remain cached).
 *   - Static assets (css/js/images/json): cache-first with background refresh.
 *   - Requests under /public/, including corpus samples and reports, bypass this cache.
 *
 * VERSION is stamped automatically by `npm run build:js` from a hash of every
 * asset served cache-first — the minified bundles, the non-HTML entries of
 * CORE below, and the self-contained offline fallback page (scripts/sw-version.js).
 * tests/test-sw-version.js fails the suite if it drifts. Old caches are purged
 * on activate, so adding an asset to CORE also re-stamps VERSION.
 */
'use strict';

const VERSION = 'cipher-museum-2c2015b9';

const CORE = [
  '/',
  '/index.html',
  '/offline.html',
  '/ciphers/myszkowski.html',
  '/ciphers/turning-grille.html',
  '/ciphers/hagelin-c36.html',
  '/ciphers/nema.html',
  '/ciphers/rs44.html',
  '/ciphers/double-playfair.html',
  '/ciphers/amsco.html',
  '/css/manual-cipher-demos.css',
  '/js/manual-cipher-demos.js',
  '/css/multiple-anagramming.css',
  '/js/multiple-anagramming.js',
  '/css/pad-experiments.css',
  '/js/pad-experiments.js',
  '/js/secrecy-experiments.js',
  '/css/detective-workspaces.css',
  '/js/detective/workspaces.js',
  '/js/detective/playback.js',
  '/js/detective/lang-model.js',
  '/lab/evidence-workbench.html',
  '/lab/decipherment-cases.html',
  '/lab/modern-attack-evidence.html',
  '/ciphers/ua-8295.html',
  '/ciphers/sodark.html',
  '/ciphers/nfc-deployment.html',
  '/css/research-workbench.css',
  '/js/research-model.js',
  '/js/research-worker.js',
  '/js/research-language-model.js',
  '/data/research/v1/language-model.json',
  '/js/research-ui.js',
  '/js/research-cases.js',
  '/data/research/v1/z340-section-1.json',
  '/js/ciphers/all-engines.min.js',
  '/css/museum.css',
  '/css/reader-companion.css',
  '/js/reader-companion.js',
  '/css/historical-demos.css',
  '/js/historical-ciphers.js',
  '/js/historical-demos.js',
  '/js/nav.js',
  '/js/footer.js',
  '/js/breadcrumbs.js',
  '/js/ui-delegates.js',
  '/js/trust-labels.js',
  '/js/search.js',
  '/js/search-index.json',
  '/js/artifact-cards.js',
  '/js/artifact-cards-data.min.js',
  '/js/demo-loader.min.js',
  '/js/lightbox.js',
  '/fonts/cinzel-400-latin-ext.woff2',
  '/fonts/cinzel-400-latin.woff2',
  '/fonts/cinzel-600-latin-ext.woff2',
  '/fonts/cinzel-600-latin.woff2',
  '/fonts/cinzel-700-latin-ext.woff2',
  '/fonts/cinzel-700-latin.woff2',
  '/fonts/cormorant-garamond-italic-300-latin-ext.woff2',
  '/fonts/cormorant-garamond-italic-300-latin.woff2',
  '/fonts/cormorant-garamond-italic-400-latin-ext.woff2',
  '/fonts/cormorant-garamond-italic-400-latin.woff2',
  '/fonts/cormorant-garamond-italic-600-latin-ext.woff2',
  '/fonts/cormorant-garamond-italic-600-latin.woff2',
  '/fonts/cormorant-garamond-300-latin-ext.woff2',
  '/fonts/cormorant-garamond-300-latin.woff2',
  '/fonts/cormorant-garamond-400-latin-ext.woff2',
  '/fonts/cormorant-garamond-400-latin.woff2',
  '/fonts/cormorant-garamond-600-latin-ext.woff2',
  '/fonts/cormorant-garamond-600-latin.woff2',
  '/fonts/cormorant-garamond-700-latin-ext.woff2',
  '/fonts/cormorant-garamond-700-latin.woff2',
  '/fonts/jetbrains-mono-300-latin-ext.woff2',
  '/fonts/jetbrains-mono-300-latin.woff2',
  '/fonts/jetbrains-mono-400-latin-ext.woff2',
  '/fonts/jetbrains-mono-400-latin.woff2',
  '/fonts/jetbrains-mono-500-latin-ext.woff2',
  '/fonts/jetbrains-mono-500-latin.woff2',
  '/fonts/jetbrains-mono-700-latin-ext.woff2',
  '/fonts/jetbrains-mono-700-latin.woff2',
  '/hall-of-foundations/index.html',
  '/hall-of-foundations/foundations.css',
  '/images/icons.svg',
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
  // Bypass all /public/ requests, including corpus downloads, samples and reports.
  if (url.pathname.startsWith('/public/')) return;

  if (req.mode === 'navigate') {
    // Network-first for pages. An unvisited exhibit must display an explicit
    // offline notice, not the homepage at an exhibit URL with broken relative
    // assets (or misleading homepage content).
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/offline.html')))
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
```
