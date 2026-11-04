# javascript appendix 7

Snapshot: `3720ede99d7ab0feedc8f7dd259d4bce5fea50c6`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

## JavaScript — js/research-model.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/research-model.js`
- Served SHA-256: `c97d533d67d6cccd6c22e6fc3cf919a0f346040c343c2dc675565a44f92241f9`
- Readable-source SHA-256: `c97d533d67d6cccd6c22e6fc3cf919a0f346040c343c2dc675565a44f92241f9`


```javascript
/* Source-preserving research tools. All examples and searches run locally.
 * Papers and model boundaries: docs/PAPER_REVIEW_IMPLEMENTATION.md.
 */
'use strict';
(function (global) {
  const KIND = 'cipher-museum-transcription';
  const TYPES = ['ciphertext', 'cleartext', 'marginal', 'missing', 'editorial'];
  const KEY_TYPES = ['letter', 'syllable', 'word', 'name', 'number', 'content-word', 'function-word', 'ending', 'phrase', 'sentence', 'punctuation', 'null', 'space', 'repeat', 'erase', 'unknown'];
  const SOURCE_FIELDS = ['artifactId','archive','shelfmark','folio','transcriber','date','method','url','imageName',
    'custodianCountry','repositoryRecordUrl','originPlace','originStatus','productionDateStart','productionDateEnd','productionDateStatus','provenance',
    'scriptIdentification','scriptStatus','languageHypothesis','languageStatus',
    'objectRights','objectAccess','objectAttribution','imageRights','imageAccess','imageAttribution','transcriptionRights','transcriptionAccess','transcriptionAttribution'];
  const SOURCE_STATUSES = ['unknown', 'provisional', 'established'];
  const copy = x => JSON.parse(JSON.stringify(x));
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  function check(ok, message) { if (!ok) throw new Error(message); }
  function string(x, max, label) { check(typeof x === 'string' && x.length <= max, label + ' is missing or too long.'); return x; }
  function integer(x, min, max, label) { check(Number.isInteger(x) && x >= min && x <= max, 'Invalid ' + label + '.'); return x; }
  function list(x, max, label) { check(Array.isArray(x) && x.length <= max, 'Invalid ' + label + '.'); return x; }
  function url(x) {
    string(x, 2000, 'Source URL');
    if (x) { let parsed; try { parsed = new URL(x); } catch (_) { throw new Error('Use a complete http or https source URL.'); }
      check(['https:', 'http:'].includes(parsed.protocol) && !parsed.username && !parsed.password, 'Use a source URL without credentials and with http or https.'); }
    return x;
  }
  function source(x) {
    check(x && typeof x === 'object' && !Array.isArray(x), 'Invalid source record.');
    const result = {};
    for (const field of SOURCE_FIELDS) {
      const value = x[field] === undefined ? '' : x[field];
      if (field === 'url' || field === 'repositoryRecordUrl') result[field] = url(value);
      else if (field.endsWith('Status')) { result[field] = value || 'unknown'; check(SOURCE_STATUSES.includes(result[field]), 'Invalid source uncertainty status.'); }
      else result[field] = string(value, 500, field);
    }
    return result;
  }
  function create(raw = '') {
    string(raw, 10000, 'Transcription');
    return { version: 2, kind: KIND, raw, mode: 'symbols', width: 1, annotations: {}, revision: 1,
      source: source({}), revisions: [{ id: 1, raw, reason: 'Initial transcription' }], spans: [], layers: [], keys: [], relations: [],
      images: [], inventory: null, inventoryArchive: [], hypotheses: [], alignments: [] };
  }
  // Legacy positions count Unicode code points, not UTF-16 code units.
  function legacyTokens(raw, mode, width) {
    const tokens = []; let start = -1, text = '';
    function flush(end) { if (text) tokens.push({ start, end, text }); text = ''; start = -1; }
    const chars = Array.from(raw);
    chars.forEach((ch, i) => {
      const keep = !/\s/u.test(ch) && (mode === 'symbols' || ch === '?' || (mode === 'digits' ? /[0-9]/.test(ch) : /[A-Za-z]/.test(ch)));
      if (!keep) { flush(i); return; }
      if (start < 0) start = i;
      text += ch; if (Array.from(text).length === width) flush(i + 1);
    }); flush(chars.length); return tokens;
  }
  function migrate(v) {
    check(v && v.kind === KIND && (v.version === 1 || v.version === 2), 'Unsupported transcription export.');
    if (v.version === 2) return validate(v);
    string(v.raw, 10000, 'Transcription');
    check(['symbols', 'digits', 'letters'].includes(v.mode) && [1, 2, 5].includes(v.width), 'Unsupported legacy alphabet or width.');
    check(v.annotations && typeof v.annotations === 'object' && !Array.isArray(v.annotations), 'Invalid legacy annotations.');
    const d = create(v.raw); d.mode = v.mode; d.width = v.width;
    const tokens = legacyTokens(v.raw, v.mode, v.width);
    Object.entries(v.annotations).forEach(([index, status]) => {
      check(/^(0|[1-9]\d*)$/.test(index) && Number(index) < tokens.length && ['uncertain', 'missing'].includes(status), 'Invalid legacy annotation.');
      const t = tokens[Number(index)];
      d.spans.push({ id: 'span-' + (d.spans.length + 1), revision: 1, start: t.start, end: t.end, literal: t.text,
        type: status === 'missing' ? 'missing' : 'ciphertext', uncertain: true, alternatives: [], reading: '', reason: 'Imported legacy ' + status + ' annotation', region: null });
    }); return validate(d);
  }
  function validate(value) {
    check(value && value.version === 2 && value.kind === KIND, 'Unsupported evidence document.');
    check(JSON.stringify(value).length <= 750000, 'Evidence document exceeds 750,000 characters.');
    const d = copy(value); string(d.raw, 10000, 'Transcription'); d.source = source(d.source);
    check(['symbols', 'digits', 'letters'].includes(d.mode) && [1, 2, 5].includes(d.width), 'Invalid token settings.');
    integer(d.revision, 1, 50, 'revision'); const revisions = new Map();
    list(d.revisions, 50, 'revisions').forEach(r => {
      integer(r.id, 1, 50, 'revision ID'); check(!revisions.has(r.id), 'Duplicate revision.');
      string(r.raw, 10000, 'Revision text'); string(r.reason, 1000, 'Revision reason');
      check(r.id === 1 || r.reason.trim(), 'Each changed transcription needs a revision reason.'); revisions.set(r.id, r);
    });
    check(revisions.has(d.revision) && revisions.get(d.revision).raw === d.raw, 'Current transcription must match its recorded revision.');
    check(revisions.has(1), 'The original transcription must be retained.');
    check(d.revisions.every((r,i) => r.id === i+1) && d.revision === d.revisions.length, 'Revisions must be consecutive, with the latest revision current.');
    d.annotations = {}; // v2 annotations use source spans, never mutable token indices.
    // Version 2 records written before these existed simply have none of them.
    if (!Array.isArray(d.images)) d.images = [];
    if (!Array.isArray(d.hypotheses)) d.hypotheses = [];
    if (d.inventory === undefined) d.inventory = null;
    if (d.inventoryArchive === undefined) d.inventoryArchive = [];
    if (d.alignments === undefined) d.alignments = [];
    const imageIds = new Set();
    list(d.images, 50, 'images').forEach(i => {
      const rec = imageRecord(i);
      check(!imageIds.has(rec.id), 'Duplicate image ID.'); imageIds.add(rec.id);
      Object.assign(i, rec);
    });
    const ids = new Set();
    function unique(id) { string(id, 100, 'Record ID'); check(/^[A-Za-z][A-Za-z0-9_-]*$/.test(id) && !/^revision-/.test(id) && !ids.has(id), 'Invalid, reserved or duplicate record ID.'); ids.add(id); }
    list(d.spans, 500, 'spans').forEach(s => {
      unique(s.id); check(revisions.has(s.revision), 'Span has no source revision.');
      const chars = Array.from(revisions.get(s.revision).raw);
      integer(s.start, 0, chars.length - 1, 'span start'); integer(s.end, s.start + 1, chars.length, 'span end');
      check(s.literal === chars.slice(s.start, s.end).join(''), 'Span does not match its source.');
      check(TYPES.includes(s.type) && typeof s.uncertain === 'boolean', 'Invalid span type or uncertainty.');
      list(s.alternatives, 20, 'alternative readings').forEach(a => string(a, 200, 'Alternative'));
      string(s.reading, 200, 'Accepted reading'); string(s.reason, 1000, 'Reading reason');
      check(!s.reading || !s.alternatives.length || s.alternatives.includes(s.reading), 'Accepted reading must be one of the alternatives.');
      check(s.uncertain || (!s.alternatives.length || (s.reading && s.reason.trim())), 'Resolving alternative readings requires a choice and reason.');
      if (s.region !== null) {
        string(s.imageName, 500, 'Region image filename'); check(s.imageName.trim(), 'An image region needs its recorded source filename.');
        s.imageId = string(s.imageId || '', 100, 'Region image ID');
        check(!s.imageId || imageIds.has(s.imageId), 'An image region must reference a recorded image.');
        check(!s.imageId || d.images.find(i => i.id === s.imageId).name === s.imageName, 'The region filename must match its image record.');
        list(s.region, 4, 'image region'); check(s.region.length === 4 && s.region.every(n => Number.isFinite(n) && n >= 0 && n <= 1), 'Image region uses four fractions between 0 and 1.');
        check(s.region[2] > 0 && s.region[3] > 0 && s.region[0] + s.region[2] <= 1.00000001 && s.region[1] + s.region[3] <= 1.00000001, 'Image region must fit inside the image.');
      }
    });
    const parents = new Set(d.revisions.map(r => 'revision-' + r.id));
    list(d.layers, 100, 'reading layers').forEach(l => {
      unique(l.id); check(['symbols', 'diplomatic', 'normalized', 'translation'].includes(l.kind), 'Unknown reading layer.');
      check(parents.has(l.parent), 'A reading layer must reference an earlier source or layer.');
      check(revisions.has(l.revision), 'Reading layer has no source revision.');
      const parentLayer = d.layers.find(p => p.id === l.parent);
      const parentRevision = parentLayer ? parentLayer.revision : Number(l.parent.replace('revision-', ''));
      check(parentRevision === l.revision, 'Reading layer belongs to a different source revision.');
      string(l.text, 20000, 'Layer text'); string(l.note, 1000, 'Transformation note'); check(l.note.trim(), 'Describe the transformation.'); parents.add(l.id);
    });
    const readingTexts = readingTextIndex(d);
    list(d.alignments, 200, 'passage alignments').forEach(a => {
      check(a && typeof a === 'object' && !Array.isArray(a), 'Invalid passage alignment.');
      unique(a.id); check(/^alignment-[1-9][0-9]*$/.test(a.id), 'Invalid alignment ID.');
      const pair = alignmentPair(readingTexts, a.source, a.target);
      check(a.revision === pair.source.revision, 'An alignment must retain its recorded source revision.');
      ['source', 'target'].forEach(side => {
        const chars = Array.from(pair[side].text), ranges = a[side + 'Ranges'];
        list(ranges, 20, side + ' passage ranges'); check(ranges.length > 0, 'Each side needs at least one passage range.');
        let end = 0;
        ranges.forEach((range, index) => {
          check(range && typeof range === 'object' && !Array.isArray(range), 'Invalid passage range.');
          unique(range.id);
          check(range.id === a.id + '-' + side + '-' + (index + 1), 'A passage ID must retain its alignment and position.');
          integer(range.start, 0, chars.length - 1, 'passage start'); integer(range.end, range.start + 1, chars.length, 'passage end');
          check(range.start >= end, 'Passage ranges must be in text order without overlap within one link.'); end = range.end;
          check(range.literal === chars.slice(range.start, range.end).join(''), 'A passage literal must match its recorded reading.');
        });
      });
      string(a.note, 2000, 'Alignment note'); check(a.note.trim(), 'A passage link needs a note describing the evidence or interpretation.');
      check(a.withdrawal === null || (a.withdrawal && typeof a.withdrawal === 'object' && !Array.isArray(a.withdrawal)), 'Invalid alignment withdrawal.');
      if (a.withdrawal) {
        string(a.withdrawal.reason, 2000, 'Withdrawal reason'); check(a.withdrawal.reason.trim(), 'Withdrawing a link needs a reason.');
      }
    });
    list(d.keys, 30, 'keys').forEach(k => { unique(k.id); string(k.title, 200, 'Key title'); url(k.sourceUrl); validateKey(k.entries); });
    list(d.relations, 100, 'relationships').forEach(r => {
      ['from', 'to', 'evidence'].forEach(f => string(r[f], 2000, 'Relationship ' + f));
      check(r.from.trim() && r.to.trim() && r.evidence.trim(), 'Relationships need two identifiers and supporting evidence.');
      check(['transcribes', 'applies-key', 'supports', 'alternative-to'].includes(r.type), 'Unsupported relationship type.');
    });
    function validateInventory(inv) {
      check(inv && typeof inv === 'object' && !Array.isArray(inv), 'Invalid symbol inventory.');
      check(revisions.has(inv.revision), 'The symbol inventory has no source revision.');
      check(INVENTORY_TOKENS.includes(inv.tokens), 'Unknown inventory tokenization.');
      integer(inv.width, 1, 8, 'inventory token width'); integer(inv.nextId, 1, 5000, 'inventory counter');
      const src = inventoryTokens(revisions.get(inv.revision).raw, inv.tokens, inv.width);
      list(inv.occurrences, 2000, 'inventory occurrences');
      check(inv.occurrences.length === src.length, 'The symbol inventory does not match its source revision.');
      inv.occurrences.forEach((o, i) => check(o.index === i && o.start === src[i].start && o.end === src[i].end && o.literal === src[i].literal,
        'Inventory occurrence ' + i + ' no longer matches the recorded source.'));
      const assigned = new Set(), classIds = new Set();
      list(inv.classes, 500, 'symbol classes').forEach(c => {
        check(/^class-[1-9][0-9]*$/.test(c.id) && !classIds.has(c.id), 'Invalid or duplicate symbol-class ID.'); classIds.add(c.id);
        string(c.label, 200, 'Class label'); check(c.label.trim(), 'Every symbol class needs a label.');
        string(c.note, 4000, 'Class note'); check(c.note.trim(), 'Every symbol class records why it exists.');
        list(c.occurrences, 2000, 'class occurrences').forEach(i => {
          integer(i, 0, inv.occurrences.length - 1, 'occurrence index');
          check(!assigned.has(i), 'An occurrence belongs to exactly one symbol class.'); assigned.add(i); });
        check(c.occurrences.length > 0, 'A symbol class cannot be empty.');
      });
      check(assigned.size === inv.occurrences.length, 'Every occurrence must belong to a symbol class.');
      list(inv.history, 2000, 'inventory history').forEach((h, i) => {
        check(h.step === i + 1, 'Inventory decision history must stay in order.');
        check(INVENTORY_OPS.includes(h.op), 'Unknown inventory operation.');
        string(h.detail, 4000, 'History detail'); check(h.detail.trim(), 'Every inventory decision records what changed.'); });
      check(inv.history.length > 0, 'The inventory must retain its decision history.');
    }
    if (d.inventory !== null) validateInventory(d.inventory);
    list(d.inventoryArchive, 50, 'earlier symbol inventories').forEach(validateInventory);
    list(d.hypotheses, 100, 'hypotheses').forEach(h => {
      unique(h.id); check(/^hypothesis-[1-9][0-9]*$/.test(h.id), 'Invalid hypothesis ID.');
      string(h.claim, 2000, 'Hypothesis claim'); check(h.claim.trim(), 'A hypothesis needs a claim.');
      check(CONFIDENCE.includes(h.confidence), 'Use one of the declared confidence words: ' + CONFIDENCE.join(', ') + '.');
      ['supports', 'contradicts'].forEach(field => list(h[field], 50, field + ' evidence').forEach(e => {
        check(e && typeof e === 'object' && !Array.isArray(e), 'Evidence entries are objects.');
        string(e.ref, 2000, 'Evidence reference'); string(e.note, 2000, 'Evidence note');
        check(e.ref.trim() && e.note.trim(), 'Each piece of evidence needs an identifier and a note.'); }));
      list(h.alternatives, 20, 'unresolved alternatives').forEach(a => string(a, 500, 'Unresolved alternative'));
      string(h.note, 2000, 'Hypothesis note');
      // Applying a key cleanly is not evidence of authorship, attribution or date.
      const evidenceIds = new Set(h.supports.map(e => e.ref.normalize('NFKC').trim().replace(/\s+/g, ' ')));
      check(h.confidence !== 'well-supported' || evidenceIds.size >= 2,
        'Calling a claim well-supported needs at least two separately recorded pieces of supporting evidence.');
      check(h.confidence !== 'well-supported' || h.contradicts.length === 0,
        'Recorded counterevidence must be answered before a claim is called well-supported.');
      check(h.confidence !== 'contradicted' || h.contradicts.length > 0,
        'A contradicted claim must record the evidence against it.');
    });
    return d;
  }
  function revise(d, raw, reason) {
    d = validate(d); string(raw, 10000, 'Transcription'); if (raw === d.raw) return d;
    check(d.revisions.length < 50, 'Export this record before starting a new document: 50 revisions reached.');
    check(typeof reason === 'string' && reason.trim(), 'Describe why the transcription changed.');
    d.revision = Math.max(...d.revisions.map(r => r.id)) + 1; d.raw = raw;
    d.revisions.push({ id: d.revision, raw, reason }); return validate(d);
  }
  function annotate(d, input) {
    d = validate(d); const s = copy(input);
    s.id = 'span-' + (1 + Math.max(0, ...d.spans.map(x => Number(x.id.split('-').pop()) || 0)));
    s.revision = d.revision; s.literal = Array.from(d.raw).slice(s.start, s.end).join('');
    // A region names the image record it belongs to; the filename follows from it.
    if (s.region !== null) {
      if (s.imageId) { const image = d.images.find(i => i.id === s.imageId); check(image, 'An image region must reference a recorded image.'); s.imageName = image.name; }
      else s.imageName = d.source.imageName;
    }
    d.spans.push(s); return validate(d);
  }
  function addLayer(d, kind, parent, text, note) {
    d = validate(d); d.layers.push({ id: 'layer-' + (d.layers.length + 1), revision: d.revision, kind, parent, text, note }); return validate(d);
  }

  // ── Manual passage alignment ─────────────────────────────────────────────
  // Links describe a reader's comparison, never a certified translation. Text
  // stays in its original document order; ranges use Unicode code points and
  // retain literal snapshots so a changed reading cannot silently move a link.
  function readingTextIndex(d) {
    const entries = d.revisions.map(r => ({ id: 'revision-' + r.id, revision: r.id, kind: 'source',
      label: 'Original transcription · revision ' + r.id, text: r.raw }));
    d.layers.forEach(l => entries.push({ id: l.id, revision: l.revision, kind: l.kind,
      label: l.id + ' · ' + l.kind + ' · source revision ' + l.revision, text: l.text }));
    return new Map(entries.map(t => [t.id, { ...t, length: Array.from(t.text).length, current: t.revision === d.revision }]));
  }
  function alignmentPair(texts, source, target) {
    check(typeof source === 'string' && typeof target === 'string' && texts.has(source) && texts.has(target),
      'Choose two existing reading references.');
    check(source !== target, 'Choose two different readings.');
    const pair = { source: texts.get(source), target: texts.get(target) };
    check(pair.source.revision === pair.target.revision, 'Compared readings must belong to the same source revision.');
    return pair;
  }
  function alignmentTexts(d) { return Array.from(readingTextIndex(validate(d)).values()); }
  function addAlignment(d, input) {
    d = validate(d);
    check(input && typeof input === 'object' && !Array.isArray(input), 'Supply a passage alignment.');
    const pair = alignmentPair(readingTextIndex(d), input.source, input.target);
    check(pair.source.revision === d.revision, 'New passage links must use the current source revision.');
    const used = new Set([...d.spans, ...d.layers, ...d.keys, ...d.hypotheses, ...d.alignments,
      ...d.alignments.flatMap(a => a.sourceRanges.concat(a.targetRanges))].map(item => item.id));
    let number = 1;
    while (Array.from(used).some(id => id === 'alignment-' + number || id.startsWith('alignment-' + number + '-'))) number++;
    const id = 'alignment-' + number;
    function recordedRanges(side) {
      const chars = Array.from(pair[side].text);
      const ranges = list(input[side + 'Ranges'], 20, side + ' passage ranges').map(range => {
        check(range && typeof range === 'object' && !Array.isArray(range), 'Invalid passage range.');
        integer(range.start, 0, chars.length - 1, 'passage start'); integer(range.end, range.start + 1, chars.length, 'passage end');
        return { start: range.start, end: range.end };
      }).sort((a, b) => a.start - b.start || a.end - b.end);
      return ranges.map((range, index) => ({ id: id + '-' + side + '-' + (index + 1), ...range,
        literal: chars.slice(range.start, range.end).join('') }));
    }
    d.alignments.push({ id, revision: d.revision, source: input.source, target: input.target,
      sourceRanges: recordedRanges('source'), targetRanges: recordedRanges('target'), note: input.note, withdrawal: null });
    return validate(d);
  }
  function withdrawAlignment(d, id, reason) {
    d = validate(d);
    const link = d.alignments.find(a => a.id === id);
    check(link, 'Choose an existing passage link.'); check(!link.withdrawal, 'This passage link was already withdrawn.');
    string(reason, 2000, 'Withdrawal reason'); check(reason.trim(), 'Withdrawing a link needs a reason.');
    link.withdrawal = { reason }; return validate(d);
  }
  function alignmentView(d, source, target) {
    d = validate(d);
    const pair = alignmentPair(readingTextIndex(d), source, target), links = [], withdrawn = [];
    d.alignments.forEach(a => {
      const forward = a.source === source && a.target === target, reverse = a.source === target && a.target === source;
      if (!forward && !reverse) return;
      const link = { ...copy(a), source, target, recordedSource: a.source, recordedTarget: a.target, reversed: reverse,
        sourceRanges: copy(forward ? a.sourceRanges : a.targetRanges), targetRanges: copy(forward ? a.targetRanges : a.sourceRanges) };
      (a.withdrawal ? withdrawn : links).push(link);
    });
    function unmatched(side) {
      const chars = Array.from(pair[side].text), result = [];
      const covered = links.flatMap(a => a[side + 'Ranges']).sort((a, b) => a.start - b.start || a.end - b.end);
      let end = 0;
      covered.forEach(range => {
        if (range.start > end) result.push({ start: end, end: range.start, literal: chars.slice(end, range.start).join('') });
        end = Math.max(end, range.end);
      });
      if (end < chars.length) result.push({ start: end, end: chars.length, literal: chars.slice(end).join('') });
      return result;
    }
    return { ...pair, revision: pair.source.revision, current: pair.source.revision === d.revision,
      links, withdrawn, sourceUnmatched: unmatched('source'), targetUnmatched: unmatched('target') };
  }
  function validateKey(entries) {
    list(entries, 150, 'key entries'); const seen = new Set();
    entries.forEach(e => {
      string(e.symbol, 100, 'Key symbol'); check(e.symbol.trim() && !seen.has(e.symbol), 'Each key symbol must be nonempty and unique.'); seen.add(e.symbol);
      check(KEY_TYPES.includes(e.type), 'Unknown key-entry type.'); list(e.values, 20, 'key readings').forEach(v => string(v, 200, 'Key reading'));
      if (['null', 'space', 'repeat', 'erase', 'unknown'].includes(e.type)) check(e.values.length === 0, 'Control entries have no literal readings.');
      else { check(e.values.length > 0 && e.values.every(v => v.length > 0), 'Supply at least one reading.'); if (e.type === 'letter') check(e.values.every(v => Array.from(v).length === 1), 'A letter entry contains single characters.'); }
    }); return entries;
  }
  function applyKey(tokens, entries) {
    validateKey(entries); const key = new Map(entries.map(e => [e.symbol, e])); let text = '', unresolved = 0;
    tokens.forEach(t => {
      const e = key.get(t);
      if (!e || e.type === 'unknown') { text += '⟦' + t + '?⟧'; unresolved++; }
      else if (e.type === 'null') return;
      else if (e.type === 'space') text += ' ';
      else if (e.type === 'repeat' || e.type === 'erase') {
        // This explicit teaching convention acts on one resolved Unicode character.
        if (!text || text.endsWith('⟧')) { text += '⟦' + e.type + '?⟧'; unresolved++; }
        else { const chars = Array.from(text); if (e.type === 'repeat') text += chars.at(-1); else text = chars.slice(0, -1).join(''); }
      } else if (e.values.length > 1) { text += '⟦' + e.values.join('/') + '⟧'; unresolved++; }
      else text += e.values[0];
    }); return { text, unresolved, tokens: tokens.length };
  }
  // ── Numerical segmentation ────────────────────────────────────────────────
  // A typed entry distinguishes a letter, a syllable, a whole word, a name and a
  // null that deliberately contributes nothing. A bare string stays one reading.
  const SEG_TYPES = ['letter', 'syllable', 'word', 'name', 'number', 'content-word', 'function-word', 'ending', 'phrase', 'sentence', 'punctuation', 'null'];
  const SEG_LINES = ['boundary', 'span'];
  const COUNT_CAP = 1e15;
  function normalizeCodes(key) {
    const raw = Object.entries(key);
    check(raw.length > 0 && raw.length <= 64, 'Use 1–64 numerical key entries.');
    return raw.map(([code, value]) => {
      check(/^[0-9]{1,6}$/.test(code), 'Codes must contain 1–6 digits.');
      if (typeof value === 'string') {
        string(value, 50, 'Code reading'); check(value.length > 0, 'Code readings cannot be empty.');
        return { code, type: Array.from(value).length === 1 ? 'letter' : 'word', values: [value], note: '' };
      }
      check(value && typeof value === 'object' && !Array.isArray(value), 'A code entry is a string or a typed object.');
      check(SEG_TYPES.includes(value.type), 'Unknown numerical code type.');
      const values = list(value.values || [], 8, 'code readings').map(v => string(v, 50, 'Code reading'));
      if (value.type === 'null') check(values.length === 0, 'A null code contributes no reading.');
      else check(values.length > 0 && values.every(v => v.length > 0), 'Supply at least one reading.');
      return { code, type: value.type, values, note: string(value.note || '', 200, 'Code note') };
    });
  }
  const codeReading = e => (e.type === 'null' ? '' : e.values[0]);
  // Lattice segmentation. Backward reachability prunes dead ends before any path is
  // built. When every complete path fits the node budget the enumeration is exhaustive
  // and the retained set is globally best; otherwise a per-state beam bounds the work
  // and the global optimum is no longer guaranteed. The result says which happened.
  function segment(digits, key, boundaries = [], limit = 10000, score = () => 0, options = {}) {
    check(typeof digits === 'string' && /^[0-9](?:[0-9\n]*[0-9])?$/.test(digits) && digits.replace(/\n/g, '').length <= 80,
      'Use 1–80 digits without spaces; line breaks are allowed and kept as source structure. The source will not be normalized.');
    check(key && typeof key === 'object' && !Array.isArray(key), 'Supply a code-to-reading object.');
    const entries = normalizeCodes(key);
    integer(limit, 1, 20000, 'path budget');
    const opts = options && typeof options === 'object' ? options : {};
    const policy = opts.lineBreaks || 'boundary';
    check(SEG_LINES.includes(policy), 'Unknown line-break policy.');
    const beam = integer(opts.beam === undefined ? 32 : opts.beam, 1, 64, 'retained-path limit');
    const n = digits.length;
    list(boundaries, 159, 'locked boundaries').forEach(b => integer(b, 1, n - 1, 'locked boundary'));
    const cuts = new Set(boundaries);
    // Line breaks are source structure, not data. Under the default policy they are
    // mandatory cuts that no code may cross; under 'span' a code may continue across
    // one. Either way the break itself is never consumed, so the original digits and
    // their line layout survive in every path.
    // Line positions are tracked only for the ambiguity report. Whether a code may
    // cross one is decided in exactly one place, matchAt below, so a change there
    // cannot be masked by a second mechanism quietly enforcing the same rule.
    const lineCuts = new Set();
    if (policy === 'boundary') for (let i = 0; i < n; i++) if (digits[i] === '\n') { lineCuts.add(i); lineCuts.add(i + 1); }
    // Returns the end position of a code matched from pos, or -1.
    function matchAt(pos, code) {
      let i = pos, k = 0;
      while (k < code.length) {
        if (i >= n) return -1;
        if (digits[i] === '\n') { if (policy !== 'span') return -1; i++; continue; }
        if (digits[i] !== code[k]) return -1;
        i++; k++;
      }
      return i;
    }
    const edges = [];
    for (let pos = 0; pos < n; pos++) {
      edges[pos] = [];
      if (digits[pos] === '\n') { edges[pos].push({ entry: null, end: pos + 1 }); continue; }
      for (const e of entries) {
        const end = matchAt(pos, e.code);
        if (end < 0) continue;
        let blocked = false;
        for (let b = pos + 1; b < end; b++) if (cuts.has(b)) { blocked = true; break; }
        if (!blocked) edges[pos].push({ entry: e, end });
      }
    }
    const reach = new Array(n + 1).fill(false), bwd = new Array(n + 1).fill(0);
    reach[n] = true; bwd[n] = 1;
    for (let pos = n - 1; pos >= 0; pos--) {
      let sum = 0;
      for (const edge of edges[pos]) if (reach[edge.end]) sum += bwd[edge.end];
      bwd[pos] = Math.min(sum, COUNT_CAP); reach[pos] = sum > 0;
    }
    const fwd = new Array(n + 1).fill(0); fwd[0] = 1;
    for (let pos = 0; pos < n; pos++) {
      if (!fwd[pos] || !reach[pos]) continue;
      for (const edge of edges[pos]) if (reach[edge.end]) fwd[edge.end] = Math.min(fwd[edge.end] + fwd[pos], COUNT_CAP);
    }
    const total = bwd[0], exhaustive = total <= limit;
    const paths = []; let visited = 0, truncated = false, beamPruned = false;
    const order = (a, b) => b.score - a.score || a.codes.join('|').localeCompare(b.codes.join('|'));
    function keep(codes, items, text) {
      const value = score(text);
      check(Number.isFinite(value), 'The selected scoring model cannot score this reading.');
      paths.push({ codes, entries: items, text, score: value,
        alternatives: items.filter(i => i.values.length > 1).map(i => ({ code: i.code, start: i.start, values: i.values.slice() })) });
      paths.sort(order); if (paths.length > beam) paths.pop();
    }
    function step(pos, edge, codes, items, text) {
      if (!edge.entry) return { codes: codes.concat('\n'), items, text };
      const reading = codeReading(edge.entry);
      // The recorded chunk is the SOURCE slice, so joining a path's chunks always
      // reproduces the original digits, line breaks included.
      const source = digits.slice(pos, edge.end);
      return { codes: codes.concat(source), text: text + reading,
        items: items.concat([{ code: edge.entry.code, source, type: edge.entry.type, reading,
          values: edge.entry.values.slice(), start: pos, end: edge.end }]) };
    }
    if (exhaustive) {
      (function walk(pos, codes, items, text) {
        if (visited >= limit) { truncated = true; return; }
        visited++;
        if (pos === n) { keep(codes, items, text); return; }
        for (const edge of edges[pos]) {
          if (!reach[edge.end]) continue;
          const nx = step(pos, edge, codes, items, text);
          walk(edge.end, nx.codes, nx.items, nx.text);
          if (truncated) return;
        }
      })(0, [], [], '');
    } else {
      const decomposable = typeof score.step === 'function';
      const states = new Array(n + 1);
      states[0] = [{ codes: [], items: [], text: '', score: 0 }];
      for (let pos = 0; pos < n && !truncated; pos++) {
        const here = states[pos];
        if (!here || !here.length || !reach[pos]) continue;
        if (here.length > beam) { here.sort(order); here.length = beam; beamPruned = true; }
        for (const edge of edges[pos]) {
          if (!reach[edge.end]) continue;
          const bucket = states[edge.end] || (states[edge.end] = []);
          for (const partial of here) {
            if (visited >= limit) { truncated = true; break; }
            visited++;
            const nx = step(pos, edge, partial.codes, partial.items, partial.text);
            const value = decomposable ? partial.score + score.step(partial.text, nx.text.slice(partial.text.length)) : 0;
            check(Number.isFinite(value), 'The selected scoring model cannot score this reading.');
            bucket.push({ codes: nx.codes, items: nx.items, text: nx.text, score: value });
          }
          if (truncated) break;
        }
      }
      const finals = (states[n] || []).slice();
      finals.sort(order);
      if (finals.length > beam) beamPruned = true;
      finals.slice(0, beam).forEach(f => keep(f.codes, f.items, f.text));
    }
    // Count saturation cannot establish that every path visits a boundary.
    // A boundary is bypassable iff some edge on a complete path crosses it.
    const bypassable = new Array(n + 1).fill(false);
    for (let pos = 0; pos < n; pos++) if (fwd[pos] > 0) {
      for (const edge of edges[pos]) if (reach[edge.end]) {
        for (let p = pos + 1; p < edge.end; p++) bypassable[p] = true;
      }
    }
    const ambiguity = [];
    if (total > 0) for (let p = 1; p < n; p++) {
      const through = Math.min(fwd[p] * bwd[p], COUNT_CAP);
      ambiguity.push({ position: p, pathsCutting: through, locked: cuts.has(p) || lineCuts.has(p),
        pathsCuttingCapped: through >= COUNT_CAP,
        forced: !bypassable[p], impossible: fwd[p] === 0 || bwd[p] === 0,
        startingCodes: (edges[p] || []).filter(e => e.entry && reach[e.end]).map(e => e.entry.code) });
    }
    const complete = exhaustive && !truncated;
    return { paths, visited, complete, total, totalCapped: total >= COUNT_CAP, retained: paths.length, limit,
      boundaries: boundaries.slice(), lineBreaks: policy, beam, beamPruned, ambiguity,
      mode: exhaustive ? 'exhaustive-lattice' : 'bounded-k-best',
      globalBestGuaranteed: complete,
      pruning: complete
        ? 'Backward reachability only. Every complete path was enumerated and scored, so the retained ranking is globally best.'
        : 'Backward reachability plus a per-state beam of ' + beam + ' within a ' + limit + '-node budget. Pruning can discard the globally best path.' };
  }
  // Segmentation error is reported apart from plaintext error: a boundary can move
  // without changing a letter, and a reading can change without moving a boundary.
  function segmentMetrics(expected, actual) {
    const bounds = codes => { const s = new Set(); let p = 0;
      list(codes, 200, 'code sequence').forEach(c => { p += String(c).length; s.add(p); }); s.delete(p); return s; };
    const a = bounds(expected), b = bounds(actual);
    let shared = 0; a.forEach(x => { if (b.has(x)) shared++; });
    const union = new Set(); a.forEach(x => union.add(x)); b.forEach(x => union.add(x));
    return { boundaryMatches: shared, boundariesExpected: a.size, boundariesActual: b.size,
      boundarySymmetricDifference: union.size - shared,
      boundaryError: a.size ? (a.size - shared) / a.size : (b.size ? 1 : 0),
      exactCodes: expected.length === actual.length && expected.every((c, i) => String(c) === String(actual[i])) };
  }
  function rng(seed) {
    let x = seed >>> 0;
    return function () { x += 0x6D2B79F5; let t = x; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function parseSymbols(raw) {
    string(raw, 12000, 'Symbol sequence'); const tokens = raw.trim().split(/\s+/u).filter(Boolean);
    check(tokens.length >= 3 && tokens.length <= 600, 'Use 3–600 whitespace-separated symbol IDs.');
    check(tokens.every(t => t.length <= 40 && !t.includes('?')), 'Resolve unknown symbols first; IDs may be at most 40 characters.');
    check(new Set(tokens).size <= 100, 'Use at most 100 distinct symbol IDs.'); return tokens;
  }
  // Deterministic simulated annealing; independent assignments permit many-to-one keys.
  function search(tokens, options, score, progress = () => {}) {
    parseSymbols(tokens.join(' ')); const symbols = Array.from(new Set(tokens));
    const seed = integer(options.seed, 0, 4294967295, 'seed');
    const steps = integer(options.steps, 1, 100000, 'search budget');
    check(steps * tokens.length <= 20000000, 'Reduce the step budget: maximum 20 million symbol evaluations.');
    const locks = options.locks || {}; check(typeof locks === 'object' && !Array.isArray(locks), 'Invalid locked key.');
    Object.entries(locks).forEach(([s,v]) => check(symbols.includes(s) && /^[A-Z]$/.test(v), 'A lock must name a present symbol and one A–Z letter.'));
    const random = rng(seed), alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', weighted = 'EEEEEEEEEEEETTTTTTTTTAAAAAAAAOOOOOOOIIIIIIINNNNNNNSSSSSSHHHHHHRRRRRRDDDDLLLLCCCUUUMMWWFFGGYYPPBBVKJXQZ';
    const ids = tokens.map(t => symbols.indexOf(t)), free = symbols.map((_,i) => i).filter(i => !own(locks, symbols[i]));
    let key = [], current = -Infinity, best = -Infinity; const candidates = [], trace = [];
    function decode(k) { return ids.map(i => k[i]).join(''); }
    function retain(k, fit, step) {
      const plaintext = decode(k); if (candidates.some(c => c.plaintext === plaintext)) return;
      candidates.push({ plaintext, score: fit, step, key: Object.fromEntries(symbols.map((s,i) => [s,k[i]])) });
      candidates.sort((a,b) => b.score - a.score || a.plaintext.localeCompare(b.plaintext)); if (candidates.length > 5) candidates.pop();
    }
    const restartLength = Math.min(5000, steps);
    for (let i = 0; i < steps; i++) {
      if (i % restartLength === 0) {
        key = symbols.map(s => own(locks,s) ? locks[s] : weighted[Math.floor(random() * weighted.length)]);
        current = score(decode(key)); check(Number.isFinite(current), 'Scoring model returned an invalid value.'); retain(key, current, i);
      }
      if (!free.length) { retain(key, current, i); best = current; trace.push({ step: 0, score: current }); break; }
      const a = free[Math.floor(random() * free.length)], oldA = key[a];
      let b = -1, oldB;
      if (free.length > 1 && random() < 0.2) { b = free[Math.floor(random() * free.length)]; oldB = key[b]; key[a] = oldB; key[b] = oldA; }
      else key[a] = alphabet[Math.floor(random() * 26)];
      const next = score(decode(key)), temp = 0.2 + 8 * (1 - (i % restartLength) / restartLength);
      check(Number.isFinite(next), 'Scoring model returned an invalid value.');
      if (next >= current || random() < Math.exp((next - current) / temp)) current = next;
      else { key[a] = oldA; if (b >= 0) key[b] = oldB; }
      if (current >= best || i % 1000 === 0) { retain(key, current, i + 1); best = Math.max(best, current); }
      if (i % 1000 === 0 || i === steps - 1) { trace.push({ step: i + 1, score: candidates[0].score }); progress({ step: i + 1, steps, score: candidates[0].score }); }
    }
    return { candidates, trace, seed, requestedSteps: steps, completedSteps: free.length ? steps : 0,
      task: free.length ? 'key-recovery-candidates' : 'known-key-application', locks: copy(locks),
      model: score.modelId || 'custom-scoring-function', verified: false, scope: 'Letter homophones only; no word codes, nulls, control signs or historical-language model.' };
  }
  // ── Images, coordinate transforms and occurrence linking ──────────────────
  // A region is always stored in the ORIGINAL image's normalized coordinates.
  // Crop and rotation describe only how the image is presented, so changing the
  // presentation never rewrites a recorded region.
  const ROTATIONS = [0, 90, 180, 270];
  function imageRecord(x) {
    check(x && typeof x === 'object' && !Array.isArray(x), 'Invalid image record.');
    const r = {};
    r.id = string(x.id, 100, 'Image ID');
    check(/^[A-Za-z][A-Za-z0-9_-]*$/.test(r.id), 'Invalid image ID.');
    r.name = string(x.name || '', 500, 'Image filename');
    check(r.name.trim(), 'An image record needs its recorded filename.');
    r.sha256 = string(x.sha256 || '', 64, 'Image content hash');
    check(r.sha256 === '' || /^[0-9a-f]{64}$/.test(r.sha256), 'An image hash is 64 lowercase hexadecimal characters.');
    r.width = integer(x.width, 1, 100000, 'image width');
    r.height = integer(x.height, 1, 100000, 'image height');
    r.rotation = integer(x.rotation === undefined ? 0 : x.rotation, 0, 270, 'image rotation');
    check(ROTATIONS.includes(r.rotation), 'Rotation must be 0, 90, 180 or 270 degrees clockwise.');
    const crop = x.crop === undefined || x.crop === null ? [0, 0, 1, 1] : x.crop;
    list(crop, 4, 'image crop');
    check(crop.length === 4 && crop.every(v => Number.isFinite(v) && v >= 0 && v <= 1), 'A crop uses four fractions between 0 and 1.');
    check(crop[2] > 0 && crop[3] > 0 && crop[0] + crop[2] <= 1.00000001 && crop[1] + crop[3] <= 1.00000001, 'A crop must fit inside the image.');
    r.crop = crop.map(Number);
    r.note = string(x.note || '', 1000, 'Image note');
    return r;
  }
  function regionToDisplay(image, region) {
    const img = imageRecord(image);
    list(region, 4, 'image region');
    check(region.length === 4 && region.every(v => Number.isFinite(v)), 'A region is four finite numbers.');
    const c = img.crop;
    let x = (region[0] - c[0]) / c[2], y = (region[1] - c[1]) / c[3], w = region[2] / c[2], h = region[3] / c[3];
    const visible = x + w > 1e-9 && y + h > 1e-9 && x < 1 - 1e-9 && y < 1 - 1e-9;
    if (img.rotation === 90) { const nx = 1 - (y + h); y = x; x = nx; const t = w; w = h; h = t; }
    else if (img.rotation === 180) { x = 1 - (x + w); y = 1 - (y + h); }
    else if (img.rotation === 270) { const nx = y; y = 1 - (x + w); x = nx; const t = w; w = h; h = t; }
    const clipped = x < -1e-9 || y < -1e-9 || x + w > 1 + 1e-9 || y + h > 1 + 1e-9;
    return { visible, clipped, box: [x, y, w, h] };
  }
  function displayToRegion(image, box) {
    const img = imageRecord(image);
    list(box, 4, 'display box');
    check(box.length === 4 && box.every(v => Number.isFinite(v)), 'A display box is four finite numbers.');
    let x = box[0], y = box[1], w = box[2], h = box[3];
    if (img.rotation === 90) { const nx = y; y = 1 - (x + w); x = nx; const t = w; w = h; h = t; }
    else if (img.rotation === 180) { x = 1 - (x + w); y = 1 - (y + h); }
    else if (img.rotation === 270) { const nx = 1 - (y + h); y = x; x = nx; const t = w; w = h; h = t; }
    const c = img.crop;
    return [c[0] + x * c[2], c[1] + y * c[3], w * c[2], h * c[3]];
  }
  // Pixel size of what the viewer sees, after cropping and rotation.
  function displayAspect(image) {
    const img = imageRecord(image);
    const w = img.width * img.crop[2], h = img.height * img.crop[3];
    return img.rotation % 180 === 0 ? { width: w, height: h } : { width: h, height: w };
  }
  function addImage(d, input) {
    d = validate(d);
    const next = copy(input || {});
    if (!next.id) next.id = 'image-' + (d.images.length + 1);
    check(!d.images.some(i => i.id === next.id), 'Duplicate image ID.');
    d.images.push(imageRecord(next));
    return validate(d);
  }
  // ── Symbol inventory ──────────────────────────────────────────────────────
  const INVENTORY_TOKENS = ['whitespace', 'fixed'];
  const INVENTORY_OPS = ['build', 'split', 'merge', 'relabel'];
  function inventoryTokens(raw, mode, width) {
    check(INVENTORY_TOKENS.includes(mode), 'Unknown inventory tokenization.');
    const chars = Array.from(raw), out = [];
    let start = -1, text = '';
    const flush = end => { if (text) out.push({ start, end, literal: text }); text = ''; start = -1; };
    chars.forEach((ch, i) => {
      if (/\s/u.test(ch)) { flush(i); return; }
      if (start < 0) start = i;
      text += ch;
      if (mode === 'fixed' && Array.from(text).length === width) flush(i + 1);
    });
    flush(chars.length);
    return out.map((t, i) => ({ index: i, start: t.start, end: t.end, literal: t.literal }));
  }
  function buildInventory(d, options = {}) {
    d = validate(d);
    if (d.inventory) {
      check(d.inventoryArchive.length < 50, 'Export this record before rebuilding: 50 earlier inventories retained.');
      d.inventoryArchive.push(copy(d.inventory));
    }
    const mode = options.tokens || 'whitespace';
    const width = mode === 'fixed' ? integer(options.width || 1, 1, 8, 'token width') : 1;
    const tokens = inventoryTokens(d.raw, mode, width);
    check(tokens.length > 0 && tokens.length <= 2000, 'A symbol inventory needs 1–2,000 occurrences.');
    const byLiteral = new Map();
    tokens.forEach(t => { if (!byLiteral.has(t.literal)) byLiteral.set(t.literal, []); byLiteral.get(t.literal).push(t.index); });
    check(byLiteral.size <= 400, 'Use at most 400 distinct symbols in one inventory.');
    let seq = 0;
    const classes = Array.from(byLiteral.entries()).map(([literal, occ]) => ({
      id: 'class-' + (++seq), label: literal,
      note: 'Initial class: every occurrence transcribed as ' + literal + '. Not yet inspected.',
      occurrences: occ.slice() }));
    d.inventory = { revision: d.revision, tokens: mode, width, nextId: seq + 1, occurrences: tokens, classes,
      history: [{ step: 1, op: 'build',
        detail: 'Built ' + classes.length + ' classes from ' + tokens.length + ' occurrences at revision ' + d.revision +
          '. Identical transcriptions start together; splitting them is a research decision.' }] };
    return validate(d);
  }
  function requireInventory(d) { check(d.inventory, 'Build the symbol inventory before changing it.'); return d.inventory; }
  function splitClass(d, classId, indices, label, reason) {
    d = validate(d); const inv = requireInventory(d);
    const source = inv.classes.find(c => c.id === classId);
    check(source, 'Unknown symbol class.');
    const chosen = Array.from(new Set(list(indices, 2000, 'selected occurrences')
      .map(i => integer(i, 0, inv.occurrences.length - 1, 'occurrence index')))).sort((a, b) => a - b);
    check(chosen.length > 0, 'Select at least one occurrence to split out.');
    check(chosen.every(i => source.occurrences.includes(i)), 'Every selected occurrence must belong to the class being split.');
    check(chosen.length < source.occurrences.length, 'Splitting every occurrence would empty the class; relabel it instead.');
    check(typeof reason === 'string' && reason.trim(), 'Record why these occurrences are a different symbol.');
    const id = 'class-' + inv.nextId++;
    const before = source.label;
    source.occurrences = source.occurrences.filter(i => chosen.indexOf(i) < 0);
    inv.classes.push({ id, label: string(label, 200, 'Class label'), note: reason, occurrences: chosen });
    check(label.trim(), 'The new class needs a label.');
    inv.history.push({ step: inv.history.length + 1, op: 'split',
      detail: 'Split occurrences ' + chosen.join(', ') + ' out of ' + source.id + ' (' + before + ') into ' + id +
        ' (' + label + '). Remaining occurrences keep their earlier assignment. Reason: ' + reason });
    return validate(d);
  }
  function mergeClasses(d, ids, label, reason) {
    d = validate(d); const inv = requireInventory(d);
    const chosen = list(ids, 50, 'merged classes').map(id => {
      const c = inv.classes.find(x => x.id === id); check(c, 'Unknown symbol class.'); return c; });
    check(new Set(ids).size === chosen.length, 'List each merged class once.');
    check(chosen.length >= 2, 'Select at least two classes to merge.');
    check(typeof reason === 'string' && reason.trim(), 'Record why these are one symbol.');
    check(typeof label === 'string' && label.trim(), 'The merged class needs a label.');
    const kept = chosen[0];
    const prior = chosen.map(c => c.id + ' labelled ' + c.label + ' (' + c.note + ')').join(' | ');
    const occ = []; chosen.forEach(c => c.occurrences.forEach(i => occ.push(i)));
    kept.occurrences = Array.from(new Set(occ)).sort((a, b) => a - b);
    kept.label = string(label, 200, 'Class label'); kept.note = reason;
    inv.classes = inv.classes.filter(c => c === kept || chosen.indexOf(c) < 0);
    inv.history.push({ step: inv.history.length + 1, op: 'merge',
      detail: 'Merged into ' + kept.id + ' as ' + label + '. Earlier assignments were: ' + prior + '. Reason: ' + reason });
    return validate(d);
  }
  function relabelClass(d, classId, label, reason) {
    d = validate(d); const inv = requireInventory(d);
    const c = inv.classes.find(x => x.id === classId); check(c, 'Unknown symbol class.');
    check(typeof label === 'string' && label.trim(), 'A class needs a label.');
    check(typeof reason === 'string' && reason.trim(), 'Record why the label changed.');
    const before = c.label;
    c.label = string(label, 200, 'Class label'); c.note = reason;
    inv.history.push({ step: inv.history.length + 1, op: 'relabel',
      detail: 'Relabelled ' + classId + ' from ' + before + ' to ' + label + '. Reason: ' + reason });
    return validate(d);
  }
  // Every occurrence of a class, with the spans and image regions recorded over it.
  function classOccurrences(d, classId) {
    d = validate(d); const inv = requireInventory(d);
    const c = inv.classes.find(x => x.id === classId); check(c, 'Unknown symbol class.');
    return c.occurrences.map(i => {
      const o = inv.occurrences[i];
      const spans = d.spans.filter(s => s.revision === inv.revision && s.start < o.end && s.end > o.start);
      return { index: i, start: o.start, end: o.end, literal: o.literal,
        spans: spans.map(s => s.id),
        regions: spans.filter(s => s.region).map(s => ({ span: s.id, imageId: s.imageId || '', imageName: s.imageName || '', region: s.region.slice() })) };
    });
  }
  // The reverse direction: which transcription characters a recorded region covers.
  function regionOccurrences(d, spanId) {
    d = validate(d);
    const s = d.spans.find(x => x.id === spanId); check(s, 'Unknown evidence span.');
    const inv = d.inventory;
    const classes = [];
    if (inv && inv.revision === s.revision) inv.classes.forEach(c => {
      const hit = c.occurrences.filter(i => { const o = inv.occurrences[i]; return o.start < s.end && o.end > s.start; });
      if (hit.length) classes.push({ id: c.id, label: c.label, occurrences: hit });
    });
    return { span: s.id, revision: s.revision, start: s.start, end: s.end, literal: s.literal,
      imageId: s.imageId || '', imageName: s.imageName || '', region: s.region ? s.region.slice() : null, classes };
  }
  // ── Hypothesis register ───────────────────────────────────────────────────
  const CONFIDENCE = ['unsupported', 'possible', 'probable', 'well-supported', 'contradicted'];
  function addHypothesis(d, input) {
    d = validate(d);
    const h = copy(input || {});
    h.id = 'hypothesis-' + (d.hypotheses.length + 1);
    h.supports = h.supports || []; h.contradicts = h.contradicts || [];
    h.alternatives = h.alternatives || []; h.note = h.note || '';
    d.hypotheses.push(h);
    return validate(d);
  }
  // ── Investigation bundle ──────────────────────────────────────────────────
  const BUNDLE_KIND = 'cipher-museum-investigation';
  const BUNDLE_VERSION = 2;
  const MODEL_BUILD = 'research-model-2026-10-30';
  // Stable key ordering makes bindings independent of JSON object insertion order.
  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
    return JSON.stringify(value);
  }
  function resultBinding(b, type) {
    const state = copy(b[type]);
    delete state.inputFingerprint; delete state.configurationFingerprint;
    delete state.elapsedMs; // A measurement is not a solver input.
    return fingerprint(canonical({ state, source: bindingEvidence(b.evidence), selectedLayer: b.selectedLayer,
      modelBuild: b.tool.modelBuild, scoringModel: type === 'search' ? b.tool.scoringModel : state.scoring,
      solver: type === 'search' ? b.tool.solver : 'numerical-lattice' }));
  }
  // Empty optional metadata must not make an unchanged pre-extension bundle
  // appear edited. Meaningful new metadata still participates in every binding.
  function bindingEvidence(d) {
    const result = copy(d);
    if (Array.isArray(result.alignments) && result.alignments.length === 0) delete result.alignments;
    for (const f of SOURCE_FIELDS.slice(9)) {
      if (result.source[f] === '' || (f.endsWith('Status') && result.source[f] === 'unknown')) delete result.source[f];
    }
    return result;
  }
  // A declared NON-cryptographic 64-bit fingerprint. It detects a changed input so
  // stale results can be invalidated; it is not an integrity or authenticity check.
  function fingerprint(text) {
    string(text, 4000000, 'Fingerprint input');
    let a = 0x811c9dc5, b = 0x01000193;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      a = Math.imul(a ^ c, 16777619) >>> 0;
      b = Math.imul(b + c + i, 2246822519) >>> 0; b = (b ^ b >>> 13) >>> 0;
    }
    return (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0');
  }
  function lockMap(x, label) {
    check(x && typeof x === 'object' && !Array.isArray(x), 'Invalid ' + label + '.');
    const out = {};
    Object.entries(x).forEach(([k, v]) => { string(k, 40, label + ' symbol'); check(/^[A-Z]$/.test(v), 'A lock names one A–Z letter.'); out[k] = v; });
    check(Object.keys(out).length <= 100, 'Too many locked mappings.');
    return out;
  }
  function productionInfo(x) {
    if (x === undefined || x === null) return null;
    check(x && typeof x === 'object' && !Array.isArray(x), 'Invalid recorded tool identity.');
    return { modelBuild: string(x.modelBuild || '', 100, 'Recorded model build'),
      scoringModel: string(x.scoringModel || '', 200, 'Recorded scoring model'),
      solver: string(x.solver || '', 200, 'Recorded solver') };
  }
  function searchState(s) {
    check(s && typeof s === 'object' && !Array.isArray(s), 'Invalid solver state.');
    return { algorithm: string(s.algorithm || 'annealing', 40, 'Solver algorithm'),
      raw: string(s.raw || '', 12000, 'Solver input'),
      seed: integer(s.seed === undefined ? 0 : s.seed, 0, 4294967295, 'seed'),
      steps: integer(s.steps === undefined ? 1 : s.steps, 1, 100000, 'search budget'),
      beam: integer(s.beam === undefined ? 0 : s.beam, 0, 2000, 'beam width'),
      locks: lockMap(s.locks || {}, 'locked key'),
      elapsedMs: integer(s.elapsedMs === undefined ? 0 : s.elapsedMs, 0, 86400000, 'elapsed time'),
      producedWith: productionInfo(s.producedWith),
      configurationFingerprint: string(s.configurationFingerprint || '', 32, 'Solver configuration fingerprint'),
      // Recorded at the time the result was produced, so a later edit shows up as stale.
      inputFingerprint: s.inputFingerprint === undefined
        ? fingerprint(string(s.raw || '', 12000, 'Solver input'))
        : string(s.inputFingerprint, 32, 'Solver input fingerprint') };
  }
  function segmentationState(s) {
    check(s && typeof s === 'object' && !Array.isArray(s), 'Invalid segmentation state.');
    return { digits: string(s.digits || '', 200, 'Digit stream'),
      key: (() => { const k = s.key || {}; normalizeCodes(Object.keys(k).length ? k : { 0: 'A' }); return copy(k); })(),
      boundaries: list(s.boundaries || [], 159, 'locked boundaries').map(b => integer(b, 1, 200, 'locked boundary')),
      budget: integer(s.budget === undefined ? 10000 : s.budget, 1, 20000, 'path budget'),
      scoring: string(s.scoring || 'neutral', 60, 'Segmentation scoring'),
      lineBreaks: string(s.lineBreaks || 'boundary', 20, 'Line-break policy'),
      producedWith: productionInfo(s.producedWith),
      configurationFingerprint: string(s.configurationFingerprint || '', 32, 'Segmentation configuration fingerprint'),
      inputFingerprint: s.inputFingerprint === undefined
        ? fingerprint(string(s.digits || '', 200, 'Digit stream') + '|' + JSON.stringify(s.key || {}))
        : string(s.inputFingerprint, 32, 'Segmentation input fingerprint') };
  }
  function candidateRecord(c) {
    check(c && typeof c === 'object' && !Array.isArray(c), 'Invalid candidate record.');
    return { plaintext: string(c.plaintext || '', 20000, 'Candidate plaintext'),
      score: (check(Number.isFinite(c.score), 'A candidate needs a finite score.'), c.score),
      key: lockMap(c.key || {}, 'candidate key'),
      chosen: c.chosen === true,
      provenance: string(c.provenance || '', 1000, 'Candidate provenance'),
      verified: false };
  }
  function bundle(d, state = {}) {
    d = validate(d);
    const s = state && typeof state === 'object' ? state : {};
    const value = {
      version: BUNDLE_VERSION, kind: BUNDLE_KIND,
      legacyUnbound: s.legacyUnbound === true,
      title: string(s.title || '', 200, 'Investigation title'),
      created: string(s.created || '', 40, 'Bundle timestamp'),
      tool: { modelBuild: MODEL_BUILD, evidenceVersion: d.version,
        scoringModel: string(s.scoringModel || '', 200, 'Scoring-model identity'),
        solver: string(s.solver || '', 200, 'Solver identity') },
      evidence: d,
      selectedLayer: string(s.selectedLayer || '', 100, 'Selected derived layer'),
      keyRevisions: list(s.keyRevisions || [], 50, 'key revisions').map(k => ({
        at: string(k.at || '', 40, 'Key revision time'),
        reason: string(k.reason || '', 1000, 'Key revision reason'),
        locks: lockMap(k.locks || {}, 'locked key') })),
      search: s.search ? searchState(s.search) : null,
      segmentation: s.segmentation ? segmentationState(s.segmentation) : null,
      candidates: list(s.candidates || [], 20, 'retained candidates').map(candidateRecord),
      images: d.images.map(i => ({ id: i.id, name: i.name, sha256: i.sha256, width: i.width, height: i.height,
        rotation: i.rotation, crop: i.crop.slice() })),
      imageBytes: 'Image bytes are deliberately not included. Reopen each file locally; the recorded hash tells you whether the bytes match.',
      sourceFingerprint: s.sourceFingerprint === undefined ? fingerprint(canonical(bindingEvidence(d))) : s.sourceFingerprint,
      limits: 'Replay needs the same solver and scoring-model build, not only the same seed. A recorded filename or hash identifies bytes; it does not establish that an image is the archival object it claims to be.'
    };
    for (const type of ['search', 'segmentation']) if (value[type]) {
      if (s[type].producedWith === undefined) value[type].producedWith = productionInfo(value.tool);
      if (s[type].configurationFingerprint === undefined) value[type].configurationFingerprint = resultBinding(value, type);
    }
    return openBundle(copy(value));
  }
  function openBundle(value) {
    check(value && typeof value === 'object' && !Array.isArray(value), 'This file is not an investigation bundle.');
    check(value.kind === BUNDLE_KIND, 'This file is not a Cipher Museum investigation bundle.');
    check(value.version === 1 || value.version === BUNDLE_VERSION,
      'Unsupported investigation-bundle version ' + value.version + '; this workbench reads version ' + BUNDLE_VERSION + '.');
    check(JSON.stringify(value).length <= 1500000, 'Investigation bundle exceeds 1,500,000 characters.');
    const b = copy(value);
    b.legacyUnbound = b.version === 1 || b.legacyUnbound === true;
    b.version = BUNDLE_VERSION;
    b.title = string(b.title || '', 200, 'Investigation title');
    b.created = string(b.created || '', 40, 'Bundle timestamp');
    check(b.tool && typeof b.tool === 'object', 'A bundle must record the tools that produced it.');
    b.tool.modelBuild = string(b.tool.modelBuild || '', 100, 'Model build');
    b.tool.scoringModel = string(b.tool.scoringModel || '', 200, 'Scoring-model identity');
    b.tool.solver = string(b.tool.solver || '', 200, 'Solver identity');
    b.evidence = validate(b.evidence);
    b.selectedLayer = string(b.selectedLayer || '', 100, 'Selected derived layer');
    check(!b.selectedLayer || b.evidence.revisions.some(r => 'revision-' + r.id === b.selectedLayer) || b.evidence.layers.some(l => l.id === b.selectedLayer),
      'The bundle names a derived layer that its evidence record does not contain.');
    b.keyRevisions = list(b.keyRevisions || [], 50, 'key revisions').map(k => ({
      at: string(k.at || '', 40, 'Key revision time'), reason: string(k.reason || '', 1000, 'Key revision reason'),
      locks: lockMap(k.locks || {}, 'locked key') }));
    b.search = b.search ? searchState(b.search) : null;
    b.segmentation = b.segmentation ? segmentationState(b.segmentation) : null;
    b.candidates = list(b.candidates || [], 20, 'retained candidates').map(candidateRecord);
    b.images = list(b.images || [], 50, 'image manifest').map(i => ({
      id: string(i.id, 100, 'Image ID'), name: string(i.name, 500, 'Image filename'),
      sha256: string(i.sha256 || '', 64, 'Image hash'),
      width: integer(i.width, 1, 100000, 'image width'), height: integer(i.height, 1, 100000, 'image height'),
      rotation: integer(i.rotation, 0, 270, 'image rotation'), crop: i.crop }));
    b.sourceFingerprint = string(b.sourceFingerprint || '', 32, 'Source fingerprint');
    // Stale results are reported, never silently reused.
    const sourceMoved = b.legacyUnbound || b.sourceFingerprint !== fingerprint(canonical(bindingEvidence(b.evidence)));
    const modelMoved = b.tool.modelBuild !== MODEL_BUILD;
    const searchMoved = !!(b.search && (b.legacyUnbound || modelMoved ||
      b.search.inputFingerprint !== fingerprint(b.search.raw) || b.search.configurationFingerprint !== resultBinding(b, 'search')));
    const segmentationMoved = !!(b.segmentation &&
      (b.legacyUnbound || modelMoved || b.segmentation.configurationFingerprint !== resultBinding(b, 'segmentation')));
    b.stale = { source: sourceMoved, search: searchMoved, segmentation: segmentationMoved,
      modelBuild: modelMoved,
      candidates: b.candidates.length > 0 && (!b.search || sourceMoved || searchMoved || modelMoved) };
    return b;
  }
  // ── Beam-search solver baseline ───────────────────────────────────────────
  // A second, bounded homophonic baseline alongside the annealing search.
  // Extension order is DISCLOSED: symbols are fixed in order of first appearance,
  // so every extension lengthens the decoded prefix. Partial hypotheses are scored
  // on that decoded prefix. The heuristic is informative but NOT admissible:
  // beam pruning can discard the branch that contains the correct key.
  function beamSearch(tokens, options, score, progress = () => {}) {
    parseSymbols(tokens.join(' '));
    const opts = options && typeof options === 'object' ? options : {};
    const symbols = Array.from(new Set(tokens));
    const beam = integer(opts.beam === undefined ? 50 : opts.beam, 1, 2000, 'beam width');
    const branch = integer(opts.branch === undefined ? 26 : opts.branch, 1, 26, 'extensions per hypothesis');
    const seed = integer(opts.seed === undefined ? 0 : opts.seed, 0, 4294967295, 'seed');
    const locks = opts.locks || {};
    check(locks && typeof locks === 'object' && !Array.isArray(locks), 'Invalid locked key.');
    Object.entries(locks).forEach(([s, v]) => check(symbols.indexOf(s) >= 0 && /^[A-Z]$/.test(v),
      'A lock must name a present symbol and one A–Z letter.'));
    const alphabet = 'ETAOINSHRDLCUMWFGYPBVKJXQZ'.slice(0, branch);
    const order = symbols.filter(s => !own(locks, s));
    // Longest token prefix decodable once the first k free symbols are assigned.
    const known = new Set(Object.keys(locks));
    const coverage = [];
    for (let k = 0; k <= order.length; k++) {
      if (k > 0) known.add(order[k - 1]);
      let len = 0; while (len < tokens.length && known.has(tokens[len])) len++;
      coverage.push(len);
    }
    check(beam * branch * tokens.length * Math.max(1, order.length) <= 400000000,
      'Reduce the beam width, branching factor or input length: the comparison budget is 400 million symbol evaluations.');
    const decodeWith = (assign, len) => { let t = ''; for (let i = 0; i < len; i++) t += assign[tokens[i]]; return t; };
    const base = Object.assign(Object.create(null), locks);
    let frontier = [{ assign: base, score: 0, covered: coverage[0] }];
    if (coverage[0] > 0) {
      const v = score(decodeWith(base, coverage[0]));
      check(Number.isFinite(v), 'Scoring model returned an invalid value.');
      frontier[0].score = v;
    }
    const trace = []; let evaluations = 0;
    const rank = (a, b) => b.score - a.score || keyString(a.assign).localeCompare(keyString(b.assign));
    function keyString(assign) { return symbols.map(s => assign[s] || '.').join(''); }
    for (let k = 0; k < order.length; k++) {
      const symbol = order[k], len = coverage[k + 1], next = [];
      for (const hyp of frontier) for (const letter of alphabet) {
        const assign = Object.assign(Object.create(null), hyp.assign); assign[symbol] = letter;
        let value = hyp.score;
        if (len > hyp.covered) {
          value = score(decodeWith(assign, len)); evaluations++;
          check(Number.isFinite(value), 'Scoring model returned an invalid value.');
        }
        next.push({ assign, score: value, covered: len });
      }
      next.sort(rank);
      frontier = next.slice(0, beam);
      trace.push({ step: k + 1, score: frontier[0].score, hypotheses: next.length, retained: frontier.length });
      progress({ step: k + 1, steps: order.length, score: frontier[0].score });
    }
    const candidates = [];
    const seen = new Set();
    for (const hyp of frontier) {
      const plaintext = tokens.map(t => hyp.assign[t]).join('');
      if (seen.has(plaintext)) continue; seen.add(plaintext);
      const value = score(plaintext); evaluations++;
      check(Number.isFinite(value), 'Scoring model returned an invalid value.');
      const key = {}; symbols.forEach(s => { key[s] = hyp.assign[s]; });
      candidates.push({ plaintext, score: value, step: order.length, key });
    }
    candidates.sort((a, b) => b.score - a.score || a.plaintext.localeCompare(b.plaintext));
    candidates.length = Math.min(candidates.length, 5);
    if (!candidates.length) {
      const key = {}; symbols.forEach(s => { key[s] = locks[s]; });
      const plaintext = tokens.map(t => locks[t]).join('');
      candidates.push({ plaintext, score: score(plaintext), step: 0, key });
    }
    return { candidates, trace, seed, requestedSteps: order.length, completedSteps: order.length,
      task: order.length ? 'key-recovery-candidates' : 'known-key-application',
      locks: copy(locks), model: score.modelId || 'custom-scoring-function', verified: false,
      algorithm: 'beam-search', beam, branch, evaluations, admissible: false,
      extensionOrder: order.slice(),
      extensionOrderNote: 'Free symbols are fixed in order of first appearance, so every extension lengthens the decoded prefix that is scored.',
      scope: 'Letter homophones only; no word codes, nulls, control signs or historical-language model. ' +
        'Partial scores are non-admissible: beam pruning can discard the branch holding the correct key.' };
  }
  function metrics(expected, actual, expectedKey, actualKey) {
    // Levenshtein distance keeps insertions/deletions distinct from key errors.
    const a = Array.from(expected), b = Array.from(actual); let row = b.map((_,i) => i + 1); row.unshift(0);
    for (let i=1;i<=a.length;i++) { const next=[i]; for (let j=1;j<=b.length;j++) next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1)); row=next; }
    const keys = Object.keys(expectedKey || {});
    return { exact: expected === actual, editDistance: row[b.length], plaintextError: row[b.length] / Math.max(1,a.length),
      keyError: keys.length ? keys.filter(k => !actualKey || actualKey[k] !== expectedKey[k]).length / keys.length : null };
  }
  function z340Route(kind = 'diagonal') {
    check(['diagonal', 'row-major'].includes(kind), 'Unknown route.');
    return Array.from({length:153}, (_, i) => kind === 'diagonal' ? (i % 9) * 17 + (2 * i % 17) : i);
  }
  const api = { TYPES, KEY_TYPES, SEG_TYPES, SOURCE_FIELDS, SOURCE_STATUSES, CONFIDENCE, ROTATIONS, MODEL_BUILD, BUNDLE_VERSION, BUNDLE_KIND,
    create, migrate, validate, revise, annotate, addLayer, alignmentTexts, addAlignment, withdrawAlignment, alignmentView, validateKey, applyKey,
    segment, segmentMetrics, normalizeCodes, rng, parseSymbols, search, beamSearch, metrics, url, z340Route,
    imageRecord, addImage, regionToDisplay, displayToRegion, displayAspect,
    inventoryTokens, buildInventory, splitClass, mergeClasses, relabelClass, classOccurrences, regionOccurrences,
    addHypothesis, bundle, openBundle, fingerprint };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.MuseumResearch = api;
})(typeof window !== 'undefined' ? window : globalThis);
```


## JavaScript — js/research-ui.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/research-ui.js`
- Served SHA-256: `23db4eccd3abd554f5f92f9bb94b48940a13e1fcc5a188be445a478c9b2cdf5e`
- Readable-source SHA-256: `23db4eccd3abd554f5f92f9bb94b48940a13e1fcc5a188be445a478c9b2cdf5e`


```javascript
/* Evidence workbench: local files only; imported text is never inserted as HTML. */
'use strict';
(function () {
  const R = window.MuseumResearch, $ = id => document.getElementById(id);
  let doc = R.create(''), previous = null, worker = null, receipt = null, searchGeneration = 0;
  let imageURL = null, pendingImage = null, activeImage = null, languageSet = null, languageError = '';
  let activeRegionSpan = '';
  let selectedClass = '', selectedOccurrences = new Set(), lastCandidate = '', retainedBundle = null;
  let renderedSourceFields = Object.create(null), alignmentContext = '', alignmentDraftNotice = '';
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
  // Textareas display CR and CRLF as LF. Keep the recorded bytes unchanged when
  // that display has not been edited, and translate selections back to recorded
  // code points rather than shifting every span after a CRLF line break.
  function displayedText(text) { return text.replace(/\r\n?/g, '\n'); }
  function displayGroups(text) {
    const chars = Array.from(text), groups = []; let point = 0, offset = 0;
    while (point < chars.length) {
      const end = point + (chars[point] === '\r' && chars[point + 1] === '\n' ? 2 : 1);
      const width = chars[point] === '\r' ? 1 : chars[point].length;
      groups.push({ start: point, end, displayStart: offset, displayEnd: offset + width });
      point = end; offset += width;
    }
    return groups;
  }
  function recordedSelection(text, control) {
    if (control.value !== displayedText(text)) throw new Error('The displayed reading changed. Select its recorded text again.');
    const positions = new Map([[0, 0]]);
    displayGroups(text).forEach(group => positions.set(group.displayEnd, group.end));
    if (!positions.has(control.selectionStart) || !positions.has(control.selectionEnd)) throw new Error('Select whole Unicode characters, not half of a surrogate pair.');
    return { start: positions.get(control.selectionStart), end: positions.get(control.selectionEnd) };
  }
  function pending() { return $('source-raw').value !== displayedText(doc.raw); }
  function pendingSourceMetadata() {
    return sourceFields.some(field => $('source-' + field).value !== renderedSourceFields[field]);
  }
  function commit() {
    let next = R.revise(doc, pending() ? $('source-raw').value : doc.raw, $('revision-reason').value);
    // Inputs sanitize line breaks (and URL whitespace) when displayed. Preserve
    // the stored value unless the visitor actually changed that control.
    for (const f of sourceFields) if ($('source-' + f).value !== renderedSourceFields[f]) next.source[f] = $('source-' + f).value;
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

  // ── Manual passage comparison ─────────────────────────────────────────────
  function alignmentGuard(fn) {
    return () => { try { fn(); } catch (e) { note('alignment-status', e.message, true); } };
  }
  function passageRanges(value) {
    if (!value.trim()) throw new Error('Enter at least one passage range on each side.');
    return value.split(/[,\n]/).map(part => {
      const match = /^(\d+)(?:\s*[-–]\s*(\d+))?$/.exec(part.trim());
      if (!match) throw new Error('Use character ranges such as 1–4, 10–12, or a single position.');
      return { start: Number(match[1]) - 1, end: Number(match[2] || match[1]) };
    });
  }
  function inspectPassage(side, range) {
    const text = $('alignment-' + side + '-text');
    const recorded = R.alignmentTexts(doc).find(reading => reading.id === $('alignment-' + side).value);
    const groups = displayGroups(recorded.text).filter(group => group.start < range.end && group.end > range.start);
    text.focus();
    text.setSelectionRange(groups[0].displayStart, groups.at(-1).displayEnd);
  }
  function drawPassage(parent, side, range) {
    const item = el('div', '', parent); item.className = 'alignment-range';
    const button = el('button', 'Inspect characters ' + (range.start + 1) + '–' + range.end, item);
    button.type = 'button'; button.onclick = () => inspectPassage(side, range);
    el('pre', /^\s+$/u.test(range.literal) ? 'Whitespace: ' + JSON.stringify(range.literal) : range.literal, item);
  }
  function drawLink(parent, link, historical = false) {
    const card = el('div', '', parent); card.className = 'research-card alignment-link'; card.dataset.alignmentId = link.id;
    el('h4', link.id + (historical ? ' · withdrawn' : ''), card);
    const count = (n, label) => n + ' ' + label + ' passage' + (n === 1 ? '' : 's');
    el('p', count(link.sourceRanges.length, 'source') + ' ↔ ' + count(link.targetRanges.length, 'reading') +
      ' · source revision ' + link.revision + (link.reversed ? ' · shown in the reverse comparison direction' : ''), card);
    const description = el('p', link.note, card); description.className = 'alignment-link-note';
    if (historical) el('p', 'Withdrawal reason: ' + link.withdrawal.reason, card);
    const grid = el('div', '', card); grid.className = 'research-grid';
    ['source', 'target'].forEach(side => {
      const column = el('div', '', grid);
      el('p', side === 'source' ? 'Source passages' : 'Compared-reading passages', column);
      link[side + 'Ranges'].forEach(range => drawPassage(column, side, range));
    });
  }
  function renderAlignment() {
    const texts = R.alignmentTexts(doc), sourceSelect = $('alignment-source'), targetSelect = $('alignment-target');
    const keptSource = sourceSelect.value, keptTarget = targetSelect.value, keptWithdraw = $('alignment-withdraw-id').value;
    sourceSelect.replaceChildren(); targetSelect.replaceChildren();
    texts.slice().sort((a, b) => b.revision - a.revision).forEach(text => {
      el('option', text.label, sourceSelect).value = text.id;
    });
    sourceSelect.value = texts.some(text => text.id === keptSource) ? keptSource : 'revision-' + doc.revision;
    const source = texts.find(text => text.id === sourceSelect.value);
    const targets = texts.filter(text => text.revision === source.revision && text.id !== source.id);
    targets.forEach(text => { el('option', text.label, targetSelect).value = text.id; });
    if (targets.some(text => text.id === keptTarget)) targetSelect.value = keptTarget;
    if (!targets.length) el('option', 'Append a derived reading for this revision first', targetSelect).value = '';
    targetSelect.disabled = targets.length === 0;
    const target = targets.find(text => text.id === targetSelect.value);
    const context = JSON.stringify({ revision: doc.revision, source: doc.source,
      left: [source.id, source.text], right: target ? [target.id, target.text] : null });
    if (alignmentContext && context !== alignmentContext) clearAlignmentDraft('Unrecorded passage ranges and notes were cleared because the source or compared readings changed.');
    alignmentContext = context;
    const draftNotice = alignmentDraftNotice; alignmentDraftNotice = '';
    $('alignment-source-text').value = source.text; $('alignment-target-text').value = target ? target.text : '';
    const describe = text => text.label + ' · ' + text.length + ' Unicode code points.' + (/\r/.test(text.text)
      ? ' This reading contains CR or CRLF line breaks. Selecting a displayed line break includes all its recorded characters.' : '');
    $('alignment-source-description').textContent = describe(source);
    $('alignment-target-description').textContent = target ? describe(target) : 'No compared reading selected.';
    ['alignment-list', 'alignment-history', 'alignment-source-unmatched', 'alignment-target-unmatched', 'alignment-withdraw-id'].forEach(id => $(id).replaceChildren());
    $('alignment-add').disabled = !target || !source.current;
    $('alignment-source-select').disabled = !target || !source.current || !source.text;
    $('alignment-target-select').disabled = !target || !source.current || !target.text;
    $('alignment-withdraw').disabled = true; $('alignment-withdraw-id').disabled = true;
    if (!target) {
      note('alignment-status', 'Append a reading layer for source revision ' + source.revision + ', or load the original example. Earlier links remain available under their recorded revision.' + (draftNotice ? ' ' + draftNotice : ''));
      return;
    }
    const view = R.alignmentView(doc, source.id, target.id);
    note('alignment-status', (view.current ? 'Current source revision ' + view.revision + '. ' :
      'Showing earlier source revision ' + view.revision + '; source revision ' + doc.revision + ' is current. New links are disabled for this earlier revision. ') +
      view.links.length + ' active link(s), ' + view.sourceUnmatched.length + ' unlinked source passage(s), ' +
      view.targetUnmatched.length + ' unlinked compared-reading passage(s). Unlinked means no link has been recorded.' + (draftNotice ? ' ' + draftNotice : ''));
    if (!view.links.length) el('p', 'No active passage links for these readings.', $('alignment-list'));
    view.links.forEach(link => {
      drawLink($('alignment-list'), link);
      el('option', link.id + ' · ' + link.note.slice(0, 70), $('alignment-withdraw-id')).value = link.id;
    });
    if (view.links.some(link => link.id === keptWithdraw)) $('alignment-withdraw-id').value = keptWithdraw;
    $('alignment-withdraw').disabled = view.links.length === 0; $('alignment-withdraw-id').disabled = view.links.length === 0;
    if (!view.withdrawn.length) el('p', 'No withdrawn links for these readings.', $('alignment-history'));
    view.withdrawn.forEach(link => drawLink($('alignment-history'), link, true));
    ['source', 'target'].forEach(side => {
      const box = $('alignment-' + side + '-unmatched'), missing = view[side + 'Unmatched'];
      if (!missing.length) el('p', view[side].length ? 'Every character has at least one recorded link.' : 'This reading is empty.', box);
      missing.forEach(range => drawPassage(box, side, range));
    });
  }
  function clearAlignmentDraft(reason = '') {
    const fields = ['alignment-source-ranges', 'alignment-target-ranges', 'alignment-note', 'alignment-withdraw-reason'];
    const hadDraft = fields.some(id => $(id).value !== '');
    fields.forEach(id => { $(id).value = ''; });
    if (hadDraft && reason) alignmentDraftNotice = reason;
  }
  ['source', 'target'].forEach(side => {
    $('alignment-' + side).onchange = () => { clearAlignmentDraft('Unrecorded passage ranges and notes were cleared because the compared readings changed.'); renderAlignment(); };
    $('alignment-' + side + '-select').onclick = alignmentGuard(() => {
      const text = $('alignment-' + side + '-text');
      if (text.selectionStart === text.selectionEnd) throw new Error('Select a passage in the complete reading first.');
      const reading = R.alignmentTexts(doc).find(item => item.id === $('alignment-' + side).value);
      const range = recordedSelection(reading.text, text), start = range.start + 1, end = range.end;
      const input = $('alignment-' + side + '-ranges');
      input.value = (input.value.trim() ? input.value.trim() + ', ' : '') + start + '–' + end;
      note('alignment-status', 'Added characters ' + start + '–' + end + ' to the ' + (side === 'source' ? 'source' : 'compared-reading') + ' ranges. Record the link when both sides and its explanation are ready.');
    });
  });
  $('alignment-add').onclick = alignmentGuard(() => {
    if (pending() || pendingSourceMetadata()) throw new Error('Save the source and metadata before recording passage links.');
    const next = R.addAlignment(doc, { source: $('alignment-source').value, target: $('alignment-target').value,
      sourceRanges: passageRanges($('alignment-source-ranges').value), targetRanges: passageRanges($('alignment-target-ranges').value),
      note: $('alignment-note').value });
    clearAlignmentDraft(); adopt(next, 'Passage link recorded. Full readings and their original order are unchanged.');
  });
  $('alignment-withdraw').onclick = alignmentGuard(() => {
    if (pending() || pendingSourceMetadata()) throw new Error('Save the source and metadata before withdrawing passage links.');
    const next = R.withdrawAlignment(doc, $('alignment-withdraw-id').value, $('alignment-withdraw-reason').value);
    clearAlignmentDraft(); adopt(next, 'Passage link withdrawn with its reason. Its earlier evidence remains in the history.');
  });
  $('alignment-example').onclick = alignmentGuard(() => loadExample('alignment'));

  // ── Rendering ─────────────────────────────────────────────────────────────
  function render() {
    $('source-raw').value = doc.raw;
    renderedSourceFields = Object.create(null);
    sourceFields.forEach(f => { $('source-' + f).value = doc.source[f]; renderedSourceFields[f] = $('source-' + f).value; });
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
    renderInventory(); renderHypotheses(); renderAlignment();
  }

  $('save-revision').onclick = guard(() => { commit(); status('Source and revision saved in this tab. Export the record to keep it after closing.'); });
  $('restore-record').onclick = guard(() => { if (previous) { clearAlignmentDraft('Unrecorded passage ranges and notes were cleared when the previous record was restored.'); const current = doc; doc = previous; previous = current; clearImage(); render(); status('Previous record restored. Press again to return to the other record.'); } });
  $('export-record').onclick = guard(() => { commit(); download('cipher-museum-evidence-v2.json', doc); status('Evidence record exported. Local image bytes are separate.'); });
  $('import-file').onchange = async function () {
    const file = this.files[0]; if (!file) return;
    try {
      if (file.size > 750000) throw new Error('Import is limited to 750,000 bytes.');
      const next = R.migrate(JSON.parse(await file.text()));
      clearAlignmentDraft('Unrecorded passage ranges and notes were cleared for the imported evidence record.');
      previous = doc; doc = next; clearImage(); selectedClass = ''; selectedOccurrences.clear(); render(); $('restore-record').disabled = false;
      status('Imported version ' + doc.version + ' evidence record. Previous saved record is available with Restore.');
    } catch (e) { status('Import rejected; saved record retained. ' + e.message, true); }
    this.value = '';
  };
  $('select-span').onclick = guard(() => {
    const t = $('source-raw'), range = recordedSelection(pending() ? t.value : doc.raw, t);
    $('span-start').value = range.start + 1; $('span-end').value = range.end;
    status('Selected text copied to character positions. Save any source change before adding a span.');
  });
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
    clearAlignmentDraft('Unrecorded passage ranges and notes were cleared for the replacement investigation.');
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
    alignment: () => {
      let d = R.create('Sende bread and wine.\nWait here. Keep watch.\n[margin: torn seal]');
      d.source = Object.assign(d.source, { artifactId: 'example:passage-comparison:1', transcriber: 'Museum teaching example',
        method: 'Original invented wording with illustrative spelling; no historical date, dialect or facsimile is claimed.' });
      d = R.addLayer(d, 'normalized', 'revision-1',
        'Send bread.\nSend wine.\nWait here and keep watch.\n[editor: place uncertain]',
        'Original teaching rewrite: split the first instruction, join the next two, and add an editorial note.');
      d = R.addAlignment(d, { source: 'revision-1', target: 'layer-1',
        sourceRanges: [{ start: 0, end: 21 }], targetRanges: [{ start: 0, end: 11 }, { start: 12, end: 22 }],
        note: 'One instruction becomes two sentences; Sende is modernized to Send. The source wording remains unchanged.' });
      d = R.addAlignment(d, { source: 'revision-1', target: 'layer-1',
        sourceRanges: [{ start: 22, end: 32 }, { start: 33, end: 44 }], targetRanges: [{ start: 23, end: 48 }],
        note: 'Two instructions become one sentence. The connecting and and lower-case keep belong to the editorial reading.' });
      return { doc: d, state: { title: 'Passages split, combined and left unlinked', selectedLayer: 'layer-1' },
        message: 'Loaded the original passage-comparison example. The margin note and editorial addition have no recorded counterparts; both remain visible.' };
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
  function loadExample(key) {
    if (!Object.hasOwn(EXAMPLES, key)) throw new Error('Choose an example first.');
    const made = EXAMPLES[key]();
    const b = R.bundle(made.doc, made.state);
    restoreBundle(b); describeBundle(b);
    $('bundle-example').value = key;
    clearAlignmentDraft();
    if (key === 'alignment') { $('alignment-source').value = 'revision-1'; $('alignment-target').value = 'layer-1'; renderAlignment(); }
    note('bundle-status', made.message);
  }
  $('bundle-load-example').onclick = guard(() => loadExample($('bundle-example').value));

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


## JavaScript — js/structure-exercises.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/structure-exercises.js`
- Served SHA-256: `8d2676fee813929b1767bc18d4ecdac65086148988a06d694065d6527ea8dc6c`
- Readable-source SHA-256: `8d2676fee813929b1767bc18d4ecdac65086148988a06d694065d6527ea8dc6c`


```javascript
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.StructureExercises = api; api.mount(document); }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const alpha = { A: ['WOL-LA-CHEE','BE-LA-SANA'], T: ['THAN-ZIE','A-WOH'], C: ['MOASI','TLA-GIN'], K: ['JAD-HO-LONI','BA-AH-NE-DI-TININ'], G: ['KLIZZIE','AH-TAD'], U: ['SHI-DA','NO-DA-IH'], M: ['TSIN-TLITI','BE-TAS-TNI'] };
  function encode(whole, alternate) {
    const spell = word => [...word].map(c => alpha[c][alternate ? 1 : 0]);
    const groups = whole ? [['AL-TAH-JE-JAY'], spell('GUAM')] : [spell('ATTACK'), spell('GUAM')];
    return { text: groups.map(g => g.join(' · ')).join(' / '), units: groups.flat().length };
  }
  // Occurrences in the invented training inventory. Y is commonest because inventories
  // mostly count several items, which is what makes "Y is the singular" attractive and wrong.
  const TRAINING = { A: { X: 2, Y: 7, Z: 1 }, B: { X: 1, Y: 6, Z: 1 } };
  const LINEAR_LABELS = { yx: 'Y, the commonest ending, marks one item', xy: 'X marks one item; Y marks two' };
  function commonest() {
    const totals = {};
    for (const family of Object.values(TRAINING)) for (const [ending, n] of Object.entries(family)) totals[ending] = (totals[ending] || 0) + n;
    return Object.keys(totals).sort((a, b) => totals[b] - totals[a])[0];
  }
  function heldOut(hypothesis) {
    if (!['xy', 'yx'].includes(hypothesis)) throw new Error('Unknown structural hypothesis.');
    // The only held-out Z sits beside a jar drawing with no numeral, so no hypothesis here assigns it.
    return { prediction: hypothesis === 'xy' ? 'C Y' : 'C X', matches: hypothesis === 'xy', unresolved: ['Z'] };
  }
  function mount(doc) {
    const $ = id => doc.getElementById(id);
    if ($('navajo-whole')) {
      const render = () => {
        const r = encode($('navajo-whole').checked, $('navajo-alternate').checked);
        $('navajo-second-output').textContent = r.text;
        $('navajo-second-result').textContent = r.units + ' code or spelling entries for ATTACK GUAM. This counts selected dictionary entries, not syllables, radio duration or wartime speed.';
      };
      $('navajo-whole').addEventListener('change', render); $('navajo-alternate').addEventListener('change', render); render();
    }
    if ($('linear-hypothesis')) {
      let revealed = false;
      const checked = [];
      const renderRecord = () => {
        $('linear-record').replaceChildren(...checked.map(entry => { const li = doc.createElement('li'); li.textContent = entry; return li; }));
        $('linear-record-empty').hidden = checked.length > 0;
      };
      const render = () => {
        const r = heldOut($('linear-hypothesis').value);
        $('linear-prediction').textContent = 'Prediction for two jars: ' + r.prediction;
        $('linear-heldout').hidden = !revealed;
        $('linear-result').textContent = !revealed ? 'Both hypotheses fit the unlabeled training groups. Y is the commonest ending, which makes it look basic, but frequency and repeated endings do not supply meaning or sound.' : r.matches ? 'The prediction matches the held-out labeled record C Y. This supports this invented singular/plural distinction; no phonetic value or ancient language has been deciphered. Z stays unassigned: the only held-out Z has no numeral, so nothing here tests it.' : 'The prediction C X conflicts with the held-out record C Y. Revise the hypothesis; the failed prediction stays in your record.';
      };
      $('linear-hypothesis').addEventListener('change', render);
      $('linear-reveal').addEventListener('click', () => {
        revealed = true;
        const value = $('linear-hypothesis').value, r = heldOut(value);
        const entry = LINEAR_LABELS[value] + ': predicted ' + r.prediction + ' for two jars; ' + (r.matches ? 'consistent with' : 'contradicted by') + ' the held-out C Y. Z unassigned.';
        if (checked[checked.length - 1] !== entry) checked.push(entry);
        renderRecord(); render();
      });
      $('linear-reset').addEventListener('click', () => { revealed = false; $('linear-hypothesis').selectedIndex = 0; render(); });
      $('linear-workbench').addEventListener('click', () => {
        try {
          const record = window.MuseumResearch.create('A X / A Y / A Z\nB X / B Y / B Z');
          record.source.artifactId = 'original-structural-exercise-1';
          record.source.archive = 'Original museum teaching fixture';
          record.source.method = 'Latin labels; not Linear B signs or an ancient transcription. Current hypothesis: ' + $('linear-hypothesis').selectedOptions[0].textContent + '. Checked: ' + (checked.length ? checked.join(' | ') : 'none yet');
          window.sessionStorage.setItem('museum-evidence-import', JSON.stringify(record));
          window.location.href = 'evidence-workbench.html';
        } catch (error) { $('linear-result').textContent = 'Could not transfer the exercise: ' + error.message; }
      });
      renderRecord(); render();
    }
  }
  return { encode, heldOut, commonest, TRAINING, mount };
});
```
