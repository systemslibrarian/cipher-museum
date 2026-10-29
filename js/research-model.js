/* Source-preserving research tools. All examples and searches run locally.
 * Papers and model boundaries: docs/PAPER_REVIEW_IMPLEMENTATION.md.
 */
'use strict';
(function (global) {
  const KIND = 'cipher-museum-transcription';
  const TYPES = ['ciphertext', 'cleartext', 'marginal', 'missing', 'editorial'];
  const KEY_TYPES = ['letter', 'syllable', 'word', 'name', 'null', 'space', 'repeat', 'erase', 'unknown'];
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
    for (const field of ['artifactId', 'archive', 'shelfmark', 'folio', 'transcriber', 'date', 'method', 'imageName']) result[field] = string(x[field] || '', 500, field);
    result.url = url(x.url || ''); return result;
  }
  function create(raw = '') {
    string(raw, 10000, 'Transcription');
    return { version: 2, kind: KIND, raw, mode: 'symbols', width: 1, annotations: {}, revision: 1,
      source: source({}), revisions: [{ id: 1, raw, reason: 'Initial transcription' }], spans: [], layers: [], keys: [], relations: [],
      images: [], inventory: null, hypotheses: [] };
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
    if (d.inventory !== null) {
      const inv = d.inventory;
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
      check(h.confidence !== 'well-supported' || h.supports.length >= 2,
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
  const SEG_TYPES = ['letter', 'syllable', 'word', 'name', 'null'];
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
    // The ambiguity view is read off the lattice itself, so it is exact in both modes.
    const ambiguity = [];
    if (total > 0) for (let p = 1; p < n; p++) {
      const through = Math.min(fwd[p] * bwd[p], COUNT_CAP);
      ambiguity.push({ position: p, pathsCutting: through, locked: cuts.has(p) || lineCuts.has(p),
        forced: through >= total, impossible: through === 0,
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
  const BUNDLE_VERSION = 1;
  const MODEL_BUILD = 'research-model-2026-10-29';
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
  function searchState(s) {
    check(s && typeof s === 'object' && !Array.isArray(s), 'Invalid solver state.');
    return { algorithm: string(s.algorithm || 'annealing', 40, 'Solver algorithm'),
      raw: string(s.raw || '', 12000, 'Solver input'),
      seed: integer(s.seed === undefined ? 0 : s.seed, 0, 4294967295, 'seed'),
      steps: integer(s.steps === undefined ? 1 : s.steps, 1, 100000, 'search budget'),
      beam: integer(s.beam === undefined ? 0 : s.beam, 0, 2000, 'beam width'),
      locks: lockMap(s.locks || {}, 'locked key'),
      elapsedMs: integer(s.elapsedMs === undefined ? 0 : s.elapsedMs, 0, 86400000, 'elapsed time'),
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
      sourceFingerprint: fingerprint(d.raw),
      limits: 'Replay needs the same solver and scoring-model build, not only the same seed. A recorded filename or hash identifies bytes; it does not establish that an image is the archival object it claims to be.'
    };
    return openBundle(copy(value));
  }
  function openBundle(value) {
    check(value && typeof value === 'object' && !Array.isArray(value), 'This file is not an investigation bundle.');
    check(value.kind === BUNDLE_KIND, 'This file is not a Cipher Museum investigation bundle.');
    check(value.version === BUNDLE_VERSION,
      'Unsupported investigation-bundle version ' + value.version + '; this workbench reads version ' + BUNDLE_VERSION + '.');
    check(JSON.stringify(value).length <= 1500000, 'Investigation bundle exceeds 1,500,000 characters.');
    const b = copy(value);
    b.title = string(b.title || '', 200, 'Investigation title');
    b.created = string(b.created || '', 40, 'Bundle timestamp');
    check(b.tool && typeof b.tool === 'object', 'A bundle must record the tools that produced it.');
    b.tool.modelBuild = string(b.tool.modelBuild || '', 100, 'Model build');
    b.tool.scoringModel = string(b.tool.scoringModel || '', 200, 'Scoring-model identity');
    b.tool.solver = string(b.tool.solver || '', 200, 'Solver identity');
    b.evidence = validate(b.evidence);
    b.selectedLayer = string(b.selectedLayer || '', 100, 'Selected derived layer');
    check(!b.selectedLayer || b.selectedLayer.indexOf('revision-') === 0 || b.evidence.layers.some(l => l.id === b.selectedLayer),
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
    const sourceMoved = b.sourceFingerprint !== fingerprint(b.evidence.raw);
    const searchMoved = !!(b.search && b.search.inputFingerprint !== fingerprint(b.search.raw));
    const segmentationMoved = !!(b.segmentation &&
      b.segmentation.inputFingerprint !== fingerprint(b.segmentation.digits + '|' + JSON.stringify(b.segmentation.key)));
    b.stale = { source: sourceMoved, search: searchMoved, segmentation: segmentationMoved,
      modelBuild: b.tool.modelBuild !== MODEL_BUILD,
      candidates: b.candidates.length > 0 && (sourceMoved || searchMoved) };
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
  const api = { TYPES, KEY_TYPES, SEG_TYPES, CONFIDENCE, ROTATIONS, MODEL_BUILD, BUNDLE_VERSION, BUNDLE_KIND,
    create, migrate, validate, revise, annotate, addLayer, validateKey, applyKey,
    segment, segmentMetrics, normalizeCodes, rng, parseSymbols, search, beamSearch, metrics, url, z340Route,
    imageRecord, addImage, regionToDisplay, displayToRegion, displayAspect,
    inventoryTokens, buildInventory, splitClass, mergeClasses, relabelClass, classOccurrences, regionOccurrences,
    addHypothesis, bundle, openBundle, fingerprint };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.MuseumResearch = api;
})(typeof window !== 'undefined' ? window : globalThis);
