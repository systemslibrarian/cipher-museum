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
