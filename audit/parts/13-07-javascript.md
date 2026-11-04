# javascript appendix 7

Snapshot: `0643be340ca2c7948a4f09e495afc951f45e1564`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

## JavaScript — js/research-model.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/research-model.js`
- Served SHA-256: `7c0fbb1304ab4e5484e403e9a68ad405b09a901d8e62dc49accaaec808b3fd56`
- Readable-source SHA-256: `7c0fbb1304ab4e5484e403e9a68ad405b09a901d8e62dc49accaaec808b3fd56`


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
      images: [], inventory: null, inventoryArchive: [], hypotheses: [] };
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
    create, migrate, validate, revise, annotate, addLayer, validateKey, applyKey,
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


## JavaScript — js/traffic-analysis.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/traffic-analysis.js`
- Served SHA-256: `3cc53e12dcf53c857942f9a23c3c23a48e41e5e50e6ff2f3a100dbb8d945f0eb`
- Readable-source SHA-256: `3cc53e12dcf53c857942f9a23c3c23a48e41e5e50e6ff2f3a100dbb8d945f0eb`


```javascript
/* Invented two-day radio log for a traffic-analysis exercise. Nothing here is
   historical data; the method sources are credited on lab/traffic-analysis.html.
   No message text exists in this model, so nothing can be decrypted. */
(function (root) {
  'use strict';
  const WATCH = { start: '06:00', end: '18:00' };
  // One row per intercepted transmission: externals only. `serial` is the
  // originator's message number (restarted at 1 each day in this invented net);
  // `ack` marks a receipt for the addressee's message of that number.
  const LOG = [
    { id: 'd1-01', day: 1, time: '06:10', khz: 3610, from: 'MV2', to: 'KR7', serial: 1, groups: 42, note: '' },
    { id: 'd1-02', day: 1, time: '06:20', khz: 3775, from: 'TL5', to: 'KR7', serial: 1, groups: 28, note: 'Light, clipped hand', hand: 'light, clipped' },
    { id: 'd1-03', day: 1, time: '06:40', khz: 4050, from: 'DH9', to: 'KR7', serial: 1, groups: 35, note: '' },
    { id: 'd1-04', day: 1, time: '06:50', khz: 3420, from: 'KR7', to: 'ZB3', serial: 1, groups: 51, note: '' },
    { id: 'd1-05', day: 1, time: '06:51', khz: 4190, from: 'ZB3', to: 'KR7', ack: 1, groups: 0, note: 'Receipt only' },
    { id: 'd1-06', day: 1, time: '08:10', khz: 3610, from: 'MV2', to: 'TL5', serial: 2, groups: 17, note: 'MV2 calls TL5 directly' },
    { id: 'd1-07', day: 1, time: '08:12', khz: 3775, from: 'TL5', to: 'MV2', ack: 2, groups: 0, note: 'Receipt only' },
    { id: 'd1-08', day: 1, time: '08:40', khz: 4050, from: 'DH9', to: 'KR7', serial: 2, groups: 60, note: '' },
    { id: 'd1-09', day: 1, time: '08:42', khz: 3420, from: 'KR7', to: 'DH9', serial: 2, groups: 24, note: '' },
    { id: 'd1-10', day: 1, time: '10:20', khz: 3775, from: 'TL5', to: 'KR7', serial: 2, groups: 22, note: 'Light, clipped hand', hand: 'light, clipped' },
    { id: 'd1-11', day: 1, time: '10:40', khz: 4050, from: 'DH9', to: 'KR7', serial: 3, groups: 38, note: '' },
    { id: 'd1-12', day: 1, time: '10:50', khz: 3420, from: 'KR7', to: 'ZB3', serial: 3, groups: 44, note: 'No receipt heard; signal fading', missing: 'Receipt for KR7 number 3 expected from ZB3, not heard.' },
    { id: 'd1-13', day: 1, time: '12:10', khz: 3610, from: 'MV2', to: 'KR7', serial: 3, groups: 26, note: '' },
    { id: 'd1-14', day: 1, time: '12:40', khz: 4050, from: 'DH9', to: 'K?7', serial: 4, groups: 41, note: 'Addressee partly unreadable' },
    { id: 'd1-15', day: 1, time: '16:10', khz: 3610, from: 'MV2', to: 'KR7', serial: 5, groups: 30, note: '' },
    { id: 'd1-16', day: 1, time: '16:40', khz: 4050, from: 'DH9', to: 'KR7', serial: 6, groups: 33, note: '' },
    { id: 'd1-17', day: 1, time: '16:50', khz: 4190, from: 'ZB3', to: 'KR7', ack: 5, groups: 0, note: 'Receipt only' },
    { id: 'd1-18', day: 1, time: '17:20', khz: 3775, from: 'TL5', to: 'KR7', serial: 3, groups: 19, note: '' },
    { id: 'd2-01', day: 2, time: '06:10', khz: 3610, from: 'WQ8', to: 'PX4', serial: 1, groups: 45, note: '' },
    { id: 'd2-02', day: 2, time: '06:20', khz: 3775, from: 'NF6', to: 'PX4', serial: 1, groups: 25, note: 'Light, clipped hand', hand: 'light, clipped' },
    { id: 'd2-03', day: 2, time: '06:40', khz: 4190, from: 'GA1', to: 'PX4', serial: 1, groups: 52, note: '' },
    { id: 'd2-04', day: 2, time: '06:42', khz: 3420, from: 'PX4', to: 'GA1', serial: 1, groups: 30, note: '' },
    { id: 'd2-05', day: 2, time: '08:10', khz: 3610, from: 'WQ8', to: 'PX4', serial: 2, groups: 38, note: '' },
    { id: 'd2-06', day: 2, time: '08:40', khz: 4190, from: 'GA1', to: 'PX4', serial: 2, groups: 66, note: '' },
    { id: 'd2-07', day: 2, time: '08:50', khz: 3420, from: 'PX4', to: 'HY2', serial: 2, groups: 47, note: '' },
    { id: 'd2-08', day: 2, time: '08:51', khz: 4460, from: 'HY2', to: 'PX4', ack: 2, groups: 0, note: 'Receipt only; weak and brief' },
    { id: 'd2-09', day: 2, time: '12:10', khz: 3610, from: 'WQ8', to: 'NF6', serial: 3, groups: 20, note: 'WQ8 calls NF6 directly' },
    { id: 'd2-10', day: 2, time: '12:20', khz: 3775, from: 'NF6', to: 'PX4', serial: 3, groups: 21, note: 'Light, clipped hand', hand: 'light, clipped' },
    { id: 'd2-11', day: 2, time: '12:40', khz: 4190, from: 'GA1', to: 'PX4', serial: 4, groups: 58, note: '' },
    { id: 'd2-12', day: 2, time: '12:42', khz: 3420, from: 'PX4', to: 'GA1', serial: 3, groups: 36, note: '' },
    { id: 'd2-13', day: 2, time: '14:40', khz: 4190, from: 'GA1', to: 'PX4', serial: 5, groups: 61, note: '' },
    { id: 'd2-14', day: 2, time: '16:10', khz: 3610, from: 'WQ8', to: 'PX4', serial: 4, groups: 33, note: '' },
    { id: 'd2-15', day: 2, time: '16:40', khz: 4190, from: 'GA1', to: 'PX4', serial: 6, groups: 57, note: '' },
    { id: 'd2-16', day: 2, time: '17:20', khz: 3775, from: 'NF6', to: 'PX4', serial: 4, groups: 18, note: '' }
  ];
  const GAPS = [
    { day: 1, start: '13:30', end: '16:00', note: 'No coverage: our receiver was re-tasked to another net.' },
    { day: 2, start: '10:00', end: '11:00', note: 'No usable intercept: heavy static.' }
  ];
  // Stage 2. Bearings are degrees clockwise from grid north, read at two invented
  // posts on an invented 60 × 48 km grid. sigma is the assumed reading error.
  const POSTS = { N: { name: 'North DF post', x: 2, y: 46 }, S: { name: 'South DF post', x: 4, y: 2 } };
  const BEARINGS = [
    { day: 1, call: 'KR7', post: 'N', deg: 114, sigma: 2 }, { day: 1, call: 'KR7', post: 'S', deg: 65, sigma: 2 },
    { day: 1, call: 'MV2', post: 'N', deg: 113, sigma: 2 }, { day: 1, call: 'MV2', post: 'S', deg: 39, sigma: 2 },
    { day: 1, call: 'TL5', post: 'S', deg: 67, sigma: 2 },
    { day: 1, call: 'DH9', post: 'N', deg: 122, sigma: 2 }, { day: 1, call: 'DH9', post: 'S', deg: 53, sigma: 2 },
    { day: 1, call: 'ZB3', post: 'N', deg: 130, sigma: 4 }, { day: 1, call: 'ZB3', post: 'S', deg: 81, sigma: 4 },
    { day: 2, call: 'PX4', post: 'N', deg: 114, sigma: 2 }, { day: 2, call: 'PX4', post: 'S', deg: 66, sigma: 2 },
    { day: 2, call: 'WQ8', post: 'N', deg: 113, sigma: 2 }, { day: 2, call: 'WQ8', post: 'S', deg: 39, sigma: 2 },
    { day: 2, call: 'GA1', post: 'N', deg: 123, sigma: 2 }, { day: 2, call: 'GA1', post: 'S', deg: 53, sigma: 2 }
  ];
  const DF_GAPS = {
    '1:TL5': 'Only the South post took a bearing; the North post could not hear it.',
    '1:ZB3': 'Two bearings on one short receipt, so each is read to ±4°.',
    '2:NF6': 'No DF post was tasked against 3775 kHz on Day 2.',
    '2:HY2': 'Its single receipt was too brief for a bearing.'
  };
  const CHATTER = { day: 2, time: '14:41', khz: 3420, text: 'GA1 DE PX4 RPT YR NR 5 ?? YESTERDAY', serial: 5,
    note: 'Plain-language operator chatter, two characters unreadable: “GA1 from PX4: repeat your number 5 … yesterday.” It is not an enciphered message and nothing is decrypted.' };
  // Exercise key: the fictional truth behind the invented log. A real analyst had no such key.
  const KEY = [
    { station: 'A', calls: { 1: 'KR7', 2: 'PX4' }, role: 'Net control; in this invented key, a headquarters.' },
    { station: 'B', calls: { 1: 'MV2', 2: 'WQ8' }, role: 'Outstation. Also works station C directly.' },
    { station: 'C', calls: { 1: 'TL5', 2: 'NF6' }, role: 'Outstation.' },
    { station: 'D', calls: { 1: 'DH9', 2: 'GA1' }, role: 'Outstation. Reassigned from 4050 to 4190 kHz on Day 2.' },
    { station: 'E', calls: { 1: 'ZB3', 2: 'HY2' }, role: 'Keeps a listening watch and sends receipts. Reassigned from 4190 to 4460 kHz on Day 2.' }
  ];
  const STATEMENTS = [
    { text: 'Every other callsign read in full on Day 1 was heard in contact with KR7.', kind: 'observed',
      why: 'Rows show KR7 with MV2, TL5, DH9 and ZB3. The 12:40 row to “K?7” is left out: its addressee was only partly read.' },
    { text: 'KR7 is a headquarters.', kind: 'inference',
      why: 'A station that every other station works fits a net control station, and a net control station often served a headquarters. A relay or signal centre would show the same pattern. Keep it as a hypothesis; later evidence can support it but cannot turn it into an observation.' },
    { text: 'No numbered message from ZB3 was intercepted on Day 1.', kind: 'observed',
      why: 'Both ZB3 rows are receipts. This describes our intercepts, not everything ZB3 did.' },
    { text: 'ZB3 is unimportant because it hardly transmits.', kind: 'unsupported',
      why: 'A quiet station may be keeping a listening watch, obeying an order to stay silent, or sending while we were not listening. Quiet describes the radio, not the unit.' },
    { text: 'The net was silent from 13:30 to 16:00 on Day 1.', kind: 'unsupported',
      why: 'Our receiver was elsewhere. Gaps in the serial numbers, and ZB3’s receipt for a KR7 number 5 we never heard, show that traffic passed during the gap.' },
    { text: 'DH9 sent a message numbered 5 that we did not intercept.', kind: 'inference',
      why: 'DH9’s numbers jump from 4 to 6 across the gap. A missed message is the likeliest explanation; a cancelled or misnumbered message would leave the same gap.' },
    { text: 'On Day 2, GA1 transmitted on 4190 kHz, the frequency ZB3 used on Day 1.', kind: 'observed',
      why: 'Both appear in the log. Whether GA1 is ZB3 is a separate question: compare their schedules and what each one sends.' },
    { text: 'Day 2 traffic rose, so this force is preparing an attack.', kind: 'unsupported',
      why: 'More groups were heard on Day 2 partly because we listened longer. Even a real rise could come from routine reports, repeats of garbled messages, an exercise or deliberate dummy traffic. Volume measures activity on the air, not intention.' }
  ];
  const KINDS = ['observed', 'inference', 'unsupported'];

  const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const minutes = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const isPartial = call => call.includes('?');
  const pairKey = (a, b) => [a, b].sort().join('–');
  function checkDay(day) { if (day !== 1 && day !== 2) throw new Error('Choose Day 1 or Day 2.'); return day; }
  function rows(day) { checkDay(day); return LOG.filter(r => r.day === day); }
  function heardCalls(day) {
    return [...new Set(rows(day).flatMap(r => [r.from, r.to]).filter(c => !isPartial(c)))].sort();
  }
  function possiblePairs(day) {
    const calls = heardCalls(day), out = [];
    calls.forEach((a, i) => calls.slice(i + 1).forEach(b => out.push(pairKey(a, b))));
    return out;
  }
  // Links come only from who called whom. Rows with a partly read callsign are
  // reported separately, never merged into the nearest-looking station.
  function observedLinks(day) {
    const links = new Map();
    for (const r of rows(day)) {
      if (isPartial(r.from) || isPartial(r.to)) continue;
      const k = pairKey(r.from, r.to);
      if (!links.has(k)) links.set(k, { pair: k, rows: [], groups: 0 });
      links.get(k).rows.push(r.id); links.get(k).groups += r.groups;
    }
    return links;
  }
  function partialRows(day) { return rows(day).filter(r => isPartial(r.from) || isPartial(r.to)); }
  function compareLinks(day, chosen) {
    const valid = possiblePairs(day), links = observedLinks(day);
    if (!Array.isArray(chosen) || chosen.some(k => !valid.includes(k))) throw new Error('Choose pairs of callsigns heard on Day ' + day + '.');
    const picked = new Set(chosen);
    return {
      confirmed: valid.filter(k => picked.has(k) && links.has(k)).map(k => links.get(k)),
      missed: valid.filter(k => !picked.has(k) && links.has(k)).map(k => links.get(k)),
      unsupported: valid.filter(k => picked.has(k) && !links.has(k)),
      partial: partialRows(day)
    };
  }
  function partners(day) {
    const out = {};
    heardCalls(day).forEach(c => { out[c] = []; });
    for (const k of observedLinks(day).keys()) { const [a, b] = k.split('–'); out[a].push(b); out[b].push(a); }
    Object.values(out).forEach(list => list.sort());
    return out;
  }
  function coverage(day) {
    const gaps = GAPS.filter(g => g.day === checkDay(day));
    const watch = (minutes(WATCH.end) - minutes(WATCH.start)) / 60;
    const lost = gaps.reduce((s, g) => s + (minutes(g.end) - minutes(g.start)) / 60, 0);
    return { watch, lost, covered: watch - lost, gaps };
  }
  function volume(day) {
    const sent = rows(day).filter(r => r.serial), cov = coverage(day);
    const groups = sent.reduce((s, r) => s + r.groups, 0);
    return { messages: sent.length, groups, covered: cov.covered, perHour: groups / cov.covered };
  }
  // Serial numbers restart each day, so a gap in one originator's sequence is a
  // likely missed message. A receipt is evidence that the addressee's numbered
  // message existed even when we never heard that message.
  function serials(day) {
    const out = {};
    for (const r of rows(day)) {
      if (r.serial && !isPartial(r.from)) (out[r.from] ||= { heard: [], receipted: [] }).heard.push(r.serial);
      if (r.ack && !isPartial(r.to)) (out[r.to] ||= { heard: [], receipted: [] }).receipted.push(r.ack);
    }
    for (const [call, s] of Object.entries(out)) {
      const known = new Set([...s.heard, ...s.receipted]), max = Math.max(...known);
      s.max = max;
      s.receiptOnly = [...new Set(s.receipted)].filter(n => !s.heard.includes(n)).sort((a, b) => a - b);
      s.inferred = Array.from({ length: max }, (_, i) => i + 1).filter(n => !known.has(n));
      out[call] = s;
    }
    return out;
  }
  function profile(day, call) {
    const sent = rows(day).filter(r => r.from === call), mine = rows(day).filter(r => r.from === call || r.to === call);
    if (!mine.length) throw new Error(call + ' was not heard on Day ' + day + '.');
    const numbered = sent.filter(r => r.serial);
    return {
      call, day,
      khz: [...new Set(sent.map(r => r.khz))].sort((a, b) => a - b),
      minutes: [...new Set(sent.map(r => Number(r.time.slice(3))))].sort((a, b) => a - b),
      numbered: numbered.length,
      groups: numbered.reduce((s, r) => s + r.groups, 0),
      receipts: sent.filter(r => r.ack).length,
      role: numbered.length ? 'sends numbered messages' : sent.length ? 'receipts only' : 'only called',
      hands: [...new Set(sent.map(r => r.hand).filter(Boolean))]
    };
  }
  function clues(day2Call, day1Call) {
    const a = profile(1, day1Call), b = profile(2, day2Call);
    return {
      frequency: a.khz.some(k => b.khz.includes(k)),
      schedule: a.minutes.some(m => b.minutes.includes(m)),
      role: a.role === b.role,
      hand: a.hands.some(h => b.hands.includes(h))
    };
  }
  function missingObservations() {
    const out = [];
    for (const day of [1, 2]) {
      for (const g of coverage(day).gaps) out.push({ day, kind: 'coverage', text: g.start + '–' + g.end + ': ' + g.note });
      for (const r of partialRows(day)) out.push({ day, kind: 'partial', text: r.time + ': ' + r.from + ' → ' + r.to + ' — callsign only partly read; kept apart, not merged with any station.' });
      for (const [call, s] of Object.entries(serials(day))) {
        for (const n of s.inferred) out.push({ day, kind: 'serial', text: call + ' number ' + n + ' not heard (its numbers skip from ' + Math.max(...s.heard.filter(x => x < n), 0) + ' to ' + Math.min(...[...s.heard, ...s.receipted].filter(x => x > n)) + ').' });
        for (const n of s.receiptOnly) out.push({ day, kind: 'receipt', text: call + ' number ' + n + ' never intercepted; we know it existed only because its receipt was heard.' });
      }
      for (const r of rows(day).filter(r => r.missing)) out.push({ day, kind: 'receipt', text: r.missing });
    }
    const khz1 = new Set(rows(1).map(r => r.khz)), khz2 = new Set(rows(2).map(r => r.khz));
    for (const k of [...khz1].filter(k => !khz2.has(k))) out.push({ day: 2, kind: 'frequency', text: k + ' kHz carried traffic on Day 1; nothing was heard on it on Day 2.' });
    for (const k of [...khz2].filter(k => !khz1.has(k))) out.push({ day: 2, kind: 'frequency', text: k + ' kHz was not heard in use on Day 1.' });
    return out;
  }
  function checkMatches(matches) {
    const day2 = heardCalls(2), options = heardCalls(1).concat('unresolved');
    if (!matches || typeof matches !== 'object') throw new Error('Record a choice for every Day 2 callsign.');
    for (const call of day2) if (!own(matches, call) || !options.includes(matches[call])) throw new Error('Choose a Day 1 callsign or “leave unresolved” for ' + call + '.');
    if (Object.keys(matches).some(k => !day2.includes(k))) throw new Error('Only Day 2 callsigns can be matched.');
    return day2.map(call => ({ day2: call, day1: matches[call] }));
  }
  // Stage 2: intersect two bearings. The radius is a rough teaching estimate:
  // each bearing's sideways error at its range, combined and divided by the
  // sine of the angle at which the two bearings cross.
  function fixFor(day, call) {
    const bs = BEARINGS.filter(b => b.day === day && b.call === call);
    const reason = DF_GAPS[day + ':' + call] || '';
    if (bs.length < 2) return { kind: bs.length ? 'line' : 'none', bearings: bs, reason };
    const [b1, b2] = bs, p = POSTS[b1.post], q = POSTS[b2.post], rad = d => d * Math.PI / 180;
    const d1 = [Math.sin(rad(b1.deg)), Math.cos(rad(b1.deg))], d2 = [Math.sin(rad(b2.deg)), Math.cos(rad(b2.deg))];
    const den = d1[0] * d2[1] - d1[1] * d2[0];
    const t1 = ((q.x - p.x) * d2[1] - (q.y - p.y) * d2[0]) / den;
    const t2 = ((q.x - p.x) * d1[1] - (q.y - p.y) * d1[0]) / den;
    const cut = Math.abs(b1.deg - b2.deg) * Math.PI / 180;
    const spread = Math.hypot(t1 * Math.tan(rad(b1.sigma)), t2 * Math.tan(rad(b2.sigma)));
    return { kind: 'fix', bearings: bs, x: p.x + t1 * d1[0], y: p.y + t1 * d1[1], radius: spread / Math.sin(cut), reason };
  }
  function movement(day1Call, day2Call) {
    const a = fixFor(1, day1Call), b = fixFor(2, day2Call);
    if (a.kind !== 'fix' || b.kind !== 'fix') {
      const why = a.kind !== 'fix' ? day1Call + ' on Day 1: ' + (a.reason || 'no fix.') : day2Call + ' on Day 2: ' + (b.reason || 'no fix.');
      return { verdict: 'untestable', from: a, to: b, reason: why };
    }
    const distance = Math.hypot(b.x - a.x, b.y - a.y), threshold = a.radius + b.radius;
    return { verdict: distance > threshold ? 'moved' : 'within', from: a, to: b, distance, threshold };
  }
  function chatterCheck(day1Call) {
    const s = serials(1)[day1Call], n = CHATTER.serial;
    if (s && (s.heard.includes(n) || s.receiptOnly.includes(n) || s.inferred.includes(n))) {
      const how = s.heard.includes(n) ? 'we heard its number ' + n : s.receiptOnly.includes(n) ? 'a receipt shows its number ' + n + ' existed' : 'its numbers skip ' + n + ', so a number ' + n + ' probably existed';
      return { status: 'consistent', text: 'Consistent with ' + day1Call + ': ' + how + ' on Day 1.' };
    }
    const sent = s ? s.max : 0;
    return { status: 'tension', text: 'Tension with ' + day1Call + ': in everything we heard on Day 1 it ' + (sent ? 'reached only number ' + sent : 'sent no numbered message at all') + '. A number ' + n + ' would have to fall in hours we did not cover. Possible, but it now needs an extra assumption.' };
  }
  function implications(matches, stage2) {
    const list = checkMatches(matches), day1 = heardCalls(1);
    const matched = list.filter(m => m.day1 !== 'unresolved');
    const byDay1 = {};
    matched.forEach(m => { (byDay1[m.day1] ||= []).push(m.day2); });
    const pairs = matched.map(m => {
      const before = profile(1, m.day1), after = profile(2, m.day2);
      return { ...m, clues: clues(m.day2, m.day1), before, after, roleChange: before.role !== after.role };
    });
    const out = {
      pairs,
      unresolved: list.filter(m => m.day1 === 'unresolved').map(m => m.day2),
      unidentified: day1.filter(c => !byDay1[c]),
      shared: Object.entries(byDay1).filter(([, v]) => v.length > 1).map(([k, v]) => ({ day1: k, day2: v }))
    };
    if (stage2) {
      out.movements = pairs.map(p => ({ day1: p.day1, day2: p.day2, ...movement(p.day1, p.day2) }));
      const ga = list.find(m => m.day2 === 'GA1');
      out.chatter = ga.day1 === 'unresolved'
        ? { status: 'open', text: 'You left GA1 unresolved. The fragment narrows it to a Day 1 station with a number ' + CHATTER.serial + ': ' + day1.filter(c => chatterCheck(c).status === 'consistent').join(', ') + '.' }
        : chatterCheck(ga.day1);
    }
    return out;
  }
  // The net-control choice becomes hypothesis H1. Later evidence is listed as
  // support or doubt; the status itself never changes to "observed".
  function assessHypothesis(call, matches, stage2) {
    const day1 = heardCalls(1);
    if (!day1.includes(call)) throw new Error('Choose a Day 1 callsign for the hypothesis.');
    const p = partners(1), others = day1.filter(c => c !== call);
    const basis = call + ' worked ' + p[call].length + ' of the ' + others.length + ' other callsigns read in full on Day 1' + (p[call].length ? ' (' + p[call].join(', ') + ').' : '.');
    const support = [], doubt = [];
    if (p[call].length === others.length) support.push('Every other station worked it: the shape of a net control station.');
    else doubt.push(others.filter(c => !p[call].includes(c)).join(', ') + ' never worked it in the intercepted rows.');
    doubt.push('A relay or signal centre can show the same shape as a headquarters.');
    let carried = null;
    if (matches) {
      const list = checkMatches(matches), next = list.filter(m => m.day1 === call).map(m => m.day2);
      carried = next.length ? next : [];
      if (!next.length) doubt.push('You matched no Day 2 callsign to ' + call + ', so H1 cannot be followed into Day 2.');
      else if (next.length === 1 && next.every(c => partners(2)[c].length === heardCalls(2).length - 1)) support.push('Your Day 2 match, ' + next[0] + ', is again worked by every other Day 2 station.');
      if (stage2 && next.length) {
        // Our DF posts are on the west edge and the invented force faces west,
        // so "behind" means east of the stations it controls.
        const behind = (day, c) => {
          const f = fixFor(day, c), rest = heardCalls(day).filter(o => o !== c).map(o => fixFor(day, o)).filter(x => x.kind === 'fix');
          return f.kind === 'fix' && rest.length ? f.x - rest.reduce((s, x) => s + x.x, 0) / rest.length : null;
        };
        const d1 = behind(1, call), d2 = behind(2, next[0]);
        if (d1 === null || d2 === null) doubt.push('Direction finding could not fix it on both days, so its position cannot be compared.');
        else if (d1 > 5 && d2 > 5) support.push('Direction finding puts it about ' + Math.round(d1) + ' km (Day 1) and ' + Math.round(d2) + ' km (Day 2) east of the average of the other fixed stations: behind them, in this invented geography. That fits a headquarters; it also fits a rear relay.');
        else doubt.push('Direction finding does not place it behind the other fixed stations on both days.');
      }
    }
    return { id: 'H1', call, status: 'hypothesis', claim: call + ' is the net control station, and perhaps a headquarters.', basis, support, doubt, carried };
  }
  function checkStatements(answers) {
    if (!Array.isArray(answers) || answers.length !== STATEMENTS.length || answers.some(a => !KINDS.includes(a))) throw new Error('Classify every statement first.');
    return STATEMENTS.map((s, i) => ({ ...s, chosen: answers[i], agrees: answers[i] === s.kind }));
  }
  function compareWithKey(matches) {
    return checkMatches(matches).map(m => {
      const truth = KEY.find(k => k.calls[2] === m.day2).calls[1];
      return { ...m, key: truth, verdict: m.day1 === 'unresolved' ? 'unresolved' : m.day1 === truth ? 'agrees' : 'differs' };
    });
  }

  function mount(doc) {
    const $ = id => doc.getElementById(id);
    if (!$('ta-log-1')) return;
    const SVG = 'http://www.w3.org/2000/svg';
    const KIND_LABEL = { observed: 'Observed in the log', inference: 'Inference', unsupported: 'Not supported by this log' };
    function el(tag, text, parent, cls) { const n = doc.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; if (parent) parent.append(n); return n; }
    function svg(tag, attrs, parent, text) { const n = doc.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (text) n.textContent = text; if (parent) parent.append(n); return n; }
    function badge(kind, parent) { const b = el('span', KIND_LABEL[kind] || kind, parent, 'ev'); b.dataset.kind = kind === 'unsupported' ? 'open' : kind; return b; }
    const state = { recorded: null, stage2: false, hypothesis: null };

    // 1. The log, rendered from the same rows the model uses.
    for (const day of [1, 2]) {
      const body = $('ta-log-' + day);
      const gaps = coverage(day).gaps;
      const items = rows(day).map(r => ({ at: minutes(r.time), r })).concat(gaps.map(g => ({ at: minutes(g.start), g }))).sort((a, b) => a.at - b.at);
      for (const { r, g } of items) {
        const tr = el('tr', '', body);
        if (g) { tr.className = 'ta-gap'; const td = el('td', g.start + '–' + g.end + ' — ' + g.note, tr); td.colSpan = 7; continue; }
        if (isPartial(r.from) || isPartial(r.to)) tr.className = 'ta-partial';
        [r.time, String(r.khz), r.from, r.to, r.serial ? String(r.serial) : 'R ' + r.ack, r.serial ? String(r.groups) : '—', r.note || ''].forEach(v => el('td', v, tr));
      }
    }
    const missingList = $('ta-missing');
    for (const m of missingObservations()) el('li', 'Day ' + m.day + ' · ' + m.text, missingList);
    const v1 = volume(1), v2 = volume(2);
    $('ta-volume').textContent = 'Groups heard: Day 1, ' + v1.groups + ' in ' + v1.covered + ' covered hours (' + v1.perHour.toFixed(1) + ' an hour); Day 2, ' + v2.groups + ' in ' + v2.covered + ' covered hours (' + v2.perHour.toFixed(1) + ' an hour). The Day 2 total is ' + Math.round(100 * (v2.groups / v1.groups - 1)) + '% higher, but we also listened ' + (v2.covered - v1.covered) + ' hours longer.';

    // 2. Connect senders and receivers, then draw what was chosen.
    const pairBox = $('ta-pairs');
    possiblePairs(1).forEach((k, i) => {
      const wrap = el('div', '', pairBox, 'ta-pair');
      const box = el('input', '', wrap); box.type = 'checkbox'; box.id = 'ta-pair-' + i; box.value = k;
      const label = el('label', k.replace('–', ' and '), wrap); label.htmlFor = box.id;
    });
    const chosenPairs = () => [...pairBox.querySelectorAll('input:checked')].map(b => b.value);
    function drawNetwork(result) {
      const host = $('ta-network'); host.replaceChildren();
      const calls = heardCalls(1), cx = 200, cy = 150, R = 105;
      const pos = {}; calls.forEach((c, i) => { const a = -Math.PI / 2 + 2 * Math.PI * i / calls.length; pos[c] = [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
      pos['K?7'] = [cx + 175, cy + 120];
      const s = svg('svg', { viewBox: '0 0 400 300', role: 'img', class: 'ta-svg' }, host);
      const confirmed = new Set(result ? result.confirmed.map(l => l.pair) : []), unsupported = new Set(result ? result.unsupported : []);
      const lines = [];
      for (const k of chosenPairs()) lines.push([k, confirmed.has(k) ? 'ta-edge-confirmed' : unsupported.has(k) ? 'ta-edge-unsupported' : 'ta-edge-chosen']);
      if (result) for (const l of result.missed) lines.push([l.pair, 'ta-edge-missed']);
      for (const [k, cls] of lines) { const [a, b] = k.split('–'); svg('line', { x1: pos[a][0], y1: pos[a][1], x2: pos[b][0], y2: pos[b][1], class: cls }, s); }
      if (result) for (const r of result.partial) svg('line', { x1: pos[r.from][0], y1: pos[r.from][1], x2: pos['K?7'][0], y2: pos['K?7'][1], class: 'ta-edge-partial' }, s);
      for (const c of calls.concat(result && result.partial.length ? ['K?7'] : [])) {
        const g = svg('g', { class: c === 'K?7' ? 'ta-node ta-node-partial' : 'ta-node' }, s);
        svg('circle', { cx: pos[c][0], cy: pos[c][1], r: 22 }, g);
        svg('text', { x: pos[c][0], y: pos[c][1] + 5, 'text-anchor': 'middle' }, g, c);
        if (state.hypothesis && state.hypothesis.call === c) svg('text', { x: pos[c][0], y: pos[c][1] - 30, 'text-anchor': 'middle', class: 'ta-hyp-tag' }, g, 'H1: hypothesis');
      }
      const summary = result
        ? 'Day 1 network: ' + result.confirmed.length + ' of your links found in the log, ' + result.unsupported.length + ' with no supporting row, ' + result.missed.length + ' missed. Partly read rows are drawn to a separate K?7 node.'
        : 'Day 1 network with ' + chosenPairs().length + ' links you have chosen, not yet compared with the log.';
      s.setAttribute('aria-label', summary + (state.hypothesis ? ' ' + state.hypothesis.call + ' carries the label H1: hypothesis.' : ''));
      return s;
    }
    const timeOf = id => LOG.find(r => r.id === id).time;
    let lastLinks = null;
    pairBox.addEventListener('change', () => { lastLinks = null; drawNetwork(null); $('ta-pairs-result').textContent = 'Links changed. Compare with the log when ready.'; });
    $('ta-pairs-check').addEventListener('click', () => {
      lastLinks = compareLinks(1, chosenPairs());
      drawNetwork(lastLinks);
      const out = $('ta-pairs-result'); out.replaceChildren();
      el('p', lastLinks.confirmed.length + ' of your links appear in the log. ' + (lastLinks.missed.length ? lastLinks.missed.length + ' observed link' + (lastLinks.missed.length === 1 ? ' is' : 's are') + ' missing from your drawing.' : 'You missed none.') + ' Nothing was decrypted: every link comes from the From and To columns.', out);
      for (const l of lastLinks.confirmed) el('p', l.pair + ': seen in ' + l.rows.length + ' row' + (l.rows.length === 1 ? '' : 's') + ' (' + l.rows.map(timeOf).join(', ') + ').', out);
      for (const l of lastLinks.missed) el('p', 'Missed: ' + l.pair + ', seen at ' + l.rows.map(timeOf).join(' and ') + '.', out);
      for (const k of lastLinks.unsupported) el('p', 'No row shows ' + k + ' working each other. Perhaps they did while we were not listening, but the log cannot show it.', out);
      for (const r of lastLinks.partial) el('p', 'Kept apart: the ' + r.time + ' row, ' + r.from + ' → ' + r.to + '. “K?7” is probably KR7, but probably is not observed. It is drawn as its own node.', out);
    });
    $('ta-pairs-clear').addEventListener('click', () => { pairBox.querySelectorAll('input').forEach(b => { b.checked = false; }); lastLinks = null; drawNetwork(null); $('ta-pairs-result').textContent = 'Choose the pairs you saw working each other, then compare with the log.'; });
    drawNetwork(null);

    function showHypothesis() {
      const out = $('ta-hypothesis'); out.replaceChildren();
      if (!state.hypothesis) { out.textContent = 'No hypothesis recorded yet.'; return; }
      const h = assessHypothesis(state.hypothesis.call, state.recorded, state.stage2);
      state.hypothesis = h;
      const head = el('p', '', out); el('strong', h.id + ' ', head); badge('inference', head); head.append(' ' + h.claim);
      el('p', 'Observed basis: ' + h.basis, out);
      if (h.support.length) { el('p', 'Supports it:', out); const ul = el('ul', '', out); h.support.forEach(t => el('li', t, ul)); }
      el('p', 'Could weaken it:', out); const ul = el('ul', '', out); h.doubt.forEach(t => el('li', t, ul));
      el('p', 'Status: ' + h.status + '. It stays a hypothesis whatever evidence arrives; only the reasons for and against change.', out);
    }
    const netSelect = $('ta-netcontrol');
    heardCalls(1).forEach(c => { const o = el('option', c, netSelect); o.value = c; });
    $('ta-hypothesis-record').addEventListener('click', () => {
      const call = netSelect.value;
      if (!call) { $('ta-hypothesis').textContent = 'Choose a callsign first.'; return; }
      state.hypothesis = { call };
      showHypothesis(); drawNetwork(lastLinks);
    });

    // 3. Match the changed callsigns; consequences follow from the choice.
    const matchBox = $('ta-matches');
    for (const call of heardCalls(2)) {
      const p = profile(2, call);
      const label = el('label', call + ' (Day 2, heard on ' + p.khz.join(', ') + ' kHz) was on Day 1…', matchBox); label.htmlFor = 'ta-match-' + call;
      const sel = el('select', '', matchBox); sel.id = label.htmlFor; sel.dataset.call = call;
      [['', 'Choose…']].concat(heardCalls(1).map(c => [c, c]), [['unresolved', 'Leave unresolved']]).forEach(([value, text]) => { const o = el('option', text, sel); o.value = value; });
    }
    const currentMatches = () => Object.fromEntries([...matchBox.querySelectorAll('select')].map(s => [s.dataset.call, s.value]));
    const CLUE = { frequency: 'frequency', schedule: 'contact schedule', role: 'role on the net', hand: 'operator’s hand' };
    function describeMatches(r, out) {
      out.replaceChildren();
      for (const p of r.pairs) {
        const card = el('div', '', out, 'research-card');
        el('h3', p.day2 + ' = ' + p.day1 + '?', card);
        // A missing hand note is not a disagreement, so it is never listed as one.
        const agree = Object.entries(p.clues).filter(([, v]) => v).map(([k]) => CLUE[k]), differ = Object.entries(p.clues).filter(([k, v]) => !v && k !== 'hand').map(([k]) => CLUE[k]);
        el('p', 'Agrees on: ' + (agree.join(', ') || 'nothing') + '. Differs on: ' + (differ.join(', ') || 'nothing') + '.', card);
        el('p', 'Day 1 ' + p.day1 + ': ' + p.before.role + ' (' + p.before.numbered + ' messages, ' + p.before.groups + ' groups), ' + p.before.khz.join(', ') + ' kHz, at minutes ' + p.before.minutes.join(', ') + '. Day 2 ' + p.day2 + ': ' + p.after.role + ' (' + p.after.numbered + ' messages, ' + p.after.groups + ' groups), ' + p.after.khz.join(', ') + ' kHz, at minutes ' + p.after.minutes.join(', ') + '.', card);
        if (p.roleChange) el('p', 'Consequence: under this match, a station that sent ' + p.before.role + ' now ' + p.after.role + '. Either its behaviour changed overnight, or the match is wrong.', card, 'ta-warning');
      }
      for (const c of r.unidentified) el('p', c + ' is not identified on Day 2 under your matches. Not identified is not the same as silent: it may be one of the callsigns you left unresolved, or unheard.', out, r.pairs.length ? 'ta-warning' : '');
      for (const c of r.unresolved) el('p', c + ' left unresolved. That is a legitimate answer when the evidence is thin.', out);
      for (const s of r.shared) el('p', s.day2.join(' and ') + ' are both matched to ' + s.day1 + '. One station can use two callsigns, but say what makes you think so.', out, 'ta-warning');
    }
    function describeStage2(r, out) {
      out.replaceChildren();
      for (const m of r.movements) {
        const t = m.verdict === 'moved'
          ? 'Implied move: ' + m.day1 + ' → ' + m.day2 + ' puts this station ' + m.distance.toFixed(0) + ' km from its Day 1 fix overnight, more than the combined uncertainty of about ' + m.threshold.toFixed(0) + ' km. If the match is wrong, this movement exists only in your reconstruction.'
          : m.verdict === 'within'
            ? m.day1 + ' → ' + m.day2 + ': the two fixes are ' + m.distance.toFixed(1) + ' km apart, inside the combined uncertainty of about ' + m.threshold.toFixed(0) + ' km. No movement can be claimed.'
            : m.day1 + ' → ' + m.day2 + ': position cannot test this match. ' + m.reason;
        el('p', t, out, m.verdict === 'moved' ? 'ta-warning' : '');
      }
      el('p', 'Chatter fragment: ' + r.chatter.text, out, r.chatter.status === 'tension' ? 'ta-warning' : '');
    }
    function refreshConsequences() {
      if (!state.recorded) return;
      const r = implications(state.recorded, state.stage2);
      describeMatches(r, $('ta-consequences'));
      if (state.stage2) { describeStage2(r, $('ta-stage2-consequences')); drawMap(r); showDebrief(); }
      if (state.hypothesis) showHypothesis();
    }
    $('ta-match-record').addEventListener('click', () => {
      try {
        state.recorded = currentMatches(); checkMatches(state.recorded);
        $('ta-match-status').textContent = 'Matches recorded. Read the consequences, then continue to the notebook or the second-stage evidence.';
        refreshConsequences();
      } catch (e) { state.recorded = null; $('ta-match-status').textContent = e.message; $('ta-consequences').replaceChildren(); }
    });
    matchBox.addEventListener('change', () => { $('ta-match-status').textContent = 'Matches changed. Record them again to update the consequences.'; });
    $('ta-match-reset').addEventListener('click', () => {
      matchBox.querySelectorAll('select').forEach(s => { s.value = ''; });
      state.recorded = null; $('ta-consequences').replaceChildren(); $('ta-match-status').textContent = 'Choose a Day 1 callsign, or leave unresolved, for each Day 2 callsign.';
      if (state.stage2) { $('ta-stage2-consequences').replaceChildren(); drawMap(null); $('ta-key-compare').replaceChildren(); }
      if (state.hypothesis) showHypothesis();
    });

    // 4. Observed, inferred or unsupported.
    const stBox = $('ta-statements');
    STATEMENTS.forEach((s, i) => {
      const card = el('div', '', stBox, 'research-card');
      el('p', (i + 1) + '. ' + s.text, card);
      const label = el('label', 'Your classification for statement ' + (i + 1), card); label.htmlFor = 'ta-statement-' + i;
      const sel = el('select', '', card); sel.id = label.htmlFor;
      [['', 'Choose…']].concat(KINDS.map(k => [k, KIND_LABEL[k]])).forEach(([value, text]) => { const o = el('option', text, sel); o.value = value; });
    });
    $('ta-statements-check').addEventListener('click', () => {
      const out = $('ta-statements-result'); out.replaceChildren();
      try {
        const res = checkStatements(STATEMENTS.map((_, i) => $('ta-statement-' + i).value));
        el('p', res.filter(r => r.agrees).length + '/' + res.length + ' agree with the exercise notes.', out);
        res.forEach((r, i) => { const p = el('p', '', out); p.append((i + 1) + '. '); badge(r.kind, p); p.append(' ' + r.why); });
      } catch (e) { out.textContent = e.message; }
    });
    stBox.addEventListener('change', () => { $('ta-statements-result').textContent = 'Classifications changed. Check again when ready.'; });
    $('ta-statements-reset').addEventListener('click', () => { STATEMENTS.forEach((_, i) => { $('ta-statement-' + i).value = ''; }); $('ta-statements-result').textContent = 'Classify each statement, then check.'; });

    // 5. Second-stage evidence: bearings and one plain-language fragment.
    function drawMap(r) {
      const host = $('ta-map'); host.replaceChildren();
      const W = 60, H = 48, k = 10, X = x => x * k, Y = y => (H - y) * k;
      const s = svg('svg', { viewBox: '0 0 ' + W * k + ' ' + H * k, role: 'img', class: 'ta-svg ta-map' }, host);
      for (let x = 0; x <= W; x += 10) svg('line', { x1: X(x), y1: 0, x2: X(x), y2: H * k, class: 'ta-grid' }, s);
      for (let y = 0; y <= H; y += 10) svg('line', { x1: 0, y1: Y(y), x2: W * k, y2: Y(y), class: 'ta-grid' }, s);
      for (const b of BEARINGS) {
        const p = POSTS[b.post], a = b.deg * Math.PI / 180;
        svg('line', { x1: X(p.x), y1: Y(p.y), x2: X(p.x + 80 * Math.sin(a)), y2: Y(p.y + 80 * Math.cos(a)), class: 'ta-bearing ta-day' + b.day }, s);
      }
      for (const p of Object.values(POSTS)) { svg('rect', { x: X(p.x) - 6, y: Y(p.y) - 6, width: 12, height: 12, class: 'ta-post' }, s); svg('text', { x: X(p.x) + 10, y: Y(p.y) + (p.y > 24 ? 18 : -10), class: 'ta-label' }, s, p.name); }
      for (const day of [1, 2]) for (const c of heardCalls(day)) {
        const f = fixFor(day, c); if (f.kind !== 'fix') continue;
        svg('circle', { cx: X(f.x), cy: Y(f.y), r: f.radius * k, class: 'ta-fix ta-day' + day }, s);
        svg('text', { x: X(f.x) + (day === 1 ? -6 : 6), y: Y(f.y) + (day === 1 ? -f.radius * k - 4 : f.radius * k + 14), 'text-anchor': day === 1 ? 'end' : 'start', class: 'ta-label' }, s, c);
      }
      const moved = r && r.movements ? r.movements.filter(m => m.verdict === 'moved') : [];
      for (const m of moved) {
        svg('line', { x1: X(m.from.x), y1: Y(m.from.y), x2: X(m.to.x), y2: Y(m.to.y), class: 'ta-move' }, s);
        svg('text', { x: X((m.from.x + m.to.x) / 2), y: Y((m.from.y + m.to.y) / 2) - 8, 'text-anchor': 'middle', class: 'ta-label ta-move-label' }, s, m.day1 + '→' + m.day2 + ': ' + m.distance.toFixed(0) + ' km?');
      }
      s.setAttribute('aria-label', 'Invented 60 by 48 km grid with two DF posts on the west edge, bearing lines, Day 1 fixes (dashed circles) and Day 2 fixes (solid circles). ' + (moved.length ? 'Your matches imply ' + moved.map(m => m.day1 + ' to ' + m.day2 + ' moving ' + m.distance.toFixed(0) + ' km').join('; ') + '.' : 'Your matches imply no movement larger than the fix uncertainty.'));
    }
    const dfBody = $('ta-df-table');
    for (const day of [1, 2]) for (const c of heardCalls(day)) {
      const f = fixFor(day, c), tr = el('tr', '', dfBody);
      [String(day), c, f.bearings.map(b => POSTS[b.post].name.replace(' DF post', '') + ' ' + b.deg + '° ±' + b.sigma + '°').join('; ') || '—',
        f.kind === 'fix' ? 'Fix about (' + f.x.toFixed(0) + ', ' + f.y.toFixed(0) + ') km, ±' + f.radius.toFixed(1) + ' km' : f.kind === 'line' ? 'One line of bearing only: no fix' : 'No bearing',
        f.reason].forEach(v => el('td', v, tr));
    }
    $('ta-chatter').textContent = 'Day ' + CHATTER.day + ', ' + CHATTER.time + ', ' + CHATTER.khz + ' kHz: ' + CHATTER.text;
    $('ta-chatter-note').textContent = CHATTER.note;
    $('ta-reveal').addEventListener('click', () => {
      if (!state.recorded) { $('ta-reveal-status').textContent = 'Record your Day 2 matches first, including any you leave unresolved. The point is to see what your own choices imply.'; return; }
      state.stage2 = true; $('ta-stage2').hidden = false; $('ta-debrief').hidden = false;
      $('ta-reveal-status').textContent = 'Second-stage evidence revealed. Changing and re-recording your matches now updates the map, the consequences and the debrief.';
      refreshConsequences();
    });

    // 6. Debrief against the invented key.
    const keyBody = $('ta-key');
    for (const k of KEY) { const tr = el('tr', '', keyBody); ['Station ' + k.station, k.calls[1], k.calls[2], k.role].forEach(v => el('td', v, tr)); }
    function showDebrief() {
      const out = $('ta-key-compare'); out.replaceChildren();
      if (!state.recorded) return;
      const res = compareWithKey(state.recorded);
      el('p', res.filter(r => r.verdict === 'agrees').length + ' of ' + res.length + ' matches agree with the invented key; ' + res.filter(r => r.verdict === 'unresolved').length + ' left unresolved.', out);
      for (const r of res.filter(x => x.verdict === 'differs')) el('p', r.day2 + ': you chose ' + r.day1 + '; the key says ' + r.key + '.', out, 'ta-warning');
    }
  }

  const api = { WATCH, LOG, GAPS, POSTS, BEARINGS, CHATTER, KEY, STATEMENTS, KINDS, heardCalls, possiblePairs, observedLinks, partialRows, compareLinks, partners, coverage, volume, serials, profile, clues, missingObservations, checkMatches, fixFor, movement, chatterCheck, implications, assessHypothesis, checkStatements, compareWithKey, mount };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', () => mount(root.document), { once: true });
    else mount(root.document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
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
