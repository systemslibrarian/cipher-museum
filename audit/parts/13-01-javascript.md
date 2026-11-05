# javascript appendix 1

Snapshot: `ccc02443d89ec2c2d9c8d6ef538bbbaf40225aa4`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

## JavaScript — data/research/profile-recovery-v2/inputs/js/research-language-model.js

**Recovery experiment command-line tool:** runs with Node.js in a repository checkout; it is not a browser control. The protocol, every recorded condition, scorer inputs and interpretation are included separately. For v1, --check audits the saved report and --replay reruns search. For the crossed v2 follow-up, scripts/check-profile-recovery-v2.js verifies saved arithmetic and identities; the frozen run.js needs a fresh output directory. Consult each version’s README before execution.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `data/research/profile-recovery-v2/inputs/js/research-language-model.js`
- Served SHA-256: `e494add4faf9ead874c1e00488b78c3043263039861d25725dcc8c1e6ffe9bcb`
- Readable-source SHA-256: `e494add4faf9ead874c1e00488b78c3043263039861d25725dcc8c1e6ffe9bcb`


```javascript
'use strict';
(function(global){
  function build(data){
    if(!data||data.id!=='museum-prose-quadgram-v1'||data.version!==1)throw new Error('Unsupported homophonic language model.');
    const qfloor=Math.log(data.floorCount/data.quadTotal),tfloor=Math.log(data.floorCount/data.triTotal);
    const quad=new Float64Array(26**4).fill(qfloor),tri=new Float64Array(26**3).fill(tfloor);
    data.quad.forEach(([i,n])=>{quad[i]=Math.log(n/data.quadTotal);});data.tri.forEach(([i,n])=>{tri[i]=Math.log(n/data.triTotal);});
    const letterLogs=data.letters.map(n=>Math.log(n/data.letterTotal));
    function fitness(text){
      const n=text.length,counts=new Uint16Array(26);let score=0,last=0;
      for(let i=0;i<n;i++){
        const c=text.charCodeAt(i)-65;if(c<0||c>25)throw new Error('Language model accepts uppercase A–Z only.');counts[c]++;
        last=(last%17576)*26+c;
        if(i>=3)score+=quad[last];else if(i===2&&n===3)score+=tri[last];
      }
      // A declared unigram-distribution penalty discourages collapsed letter keys.
      for(let c=0;c<26;c++)if(counts[c])score-=data.frequencyPenalty*counts[c]*(Math.log(counts[c]/n)-letterLogs[c]);
      return score;
    }
    fitness.modelId=data.id;return{fitness,id:data.id};
  }
  // ── Versioned historical-language profiles ──────────────────────────────
  // Each profile scores letters A–Z under its own corpus. Scores from different
  // profiles are NOT comparable as raw likelihoods, so comparison uses the mean
  // log-probability per letter and reports a margin, never a probability.
  function profileScorer(p){
    const qfloor=Math.log(p.floorCount/p.quadTotal),tfloor=Math.log(p.floorCount/p.triTotal);
    const quad=new Float64Array(26**4).fill(qfloor),tri=new Float64Array(26**3).fill(tfloor);
    const seenQuad=new Uint8Array(26**4);
    p.quad.forEach(([i,n])=>{quad[i]=Math.log(n/p.quadTotal);seenQuad[i]=1;});
    p.tri.forEach(([i,n])=>{tri[i]=Math.log(n/p.triTotal);});
    const letterLogs=p.letters.map(n=>Math.log((n||p.floorCount)/p.letterTotal));
    function read(text){
      const n=text.length,counts=new Uint16Array(26);let score=0,last=0,grams=0,seen=0;
      for(let i=0;i<n;i++){
        const c=text.charCodeAt(i)-65;
        if(c<0||c>25)throw new Error('Language profiles accept uppercase A–Z only.');
        counts[c]++;last=(last%17576)*26+c;
        if(i>=3){score+=quad[last];grams++;if(seenQuad[last])seen++;}
        else if(i===2&&n===3)score+=tri[last];
      }
      for(let c=0;c<26;c++)if(counts[c])score-=p.frequencyPenalty*counts[c]*(Math.log(counts[c]/n)-letterLogs[c]);
      return{score,letters:n,grams,coverage:grams?seen/grams:0,meanLogProbability:n?score/n:0};
    }
    function fitness(text){return read(text).score;}
    fitness.modelId=p.id;
    // Decomposable view for the segmentation lattice: the increment a reading adds,
    // given the text before it. Exact for this quadgram sum apart from the declared
    // unigram-distribution penalty, which depends on the whole string.
    fitness.step=function(prefix,reading){
      if(!reading)return 0;
      const a=prefix?read(prefix).score:0,b=read(prefix+reading).score;
      return b-a;
    };
    return{id:p.id,language:p.language,period:p.period,fitness,read,meta:p};
  }
  function buildProfiles(data){
    if(!data||data.id!=='museum-language-profiles-v1'||data.version!==1)throw new Error('Unsupported historical-language profile set.');
    const profiles=data.profiles.map(profileScorer),byId={};
    profiles.forEach(p=>{byId[p.id]=p;});
    const rule=data.abstention;
    // Compare language hypotheses, and decline when the evidence does not separate them.
    function compare(text,ids){
      const chosen=(ids&&ids.length?ids:profiles.map(p=>p.id)).map(id=>{
        const p=byId[id];if(!p)throw new Error('Unknown language profile: '+id);return p;});
      if(chosen.length<2)throw new Error('Comparing language hypotheses needs at least two profiles.');
      const rows=chosen.map(p=>{const r=p.read(text);
        return{id:p.id,language:p.language,period:p.period,meanLogProbability:r.meanLogProbability,
          coverage:r.coverage,letters:r.letters};});
      rows.sort((a,b)=>b.meanLogProbability-a.meanLogProbability);
      const margin=rows.length>1?rows[0].meanLogProbability-rows[1].meanLogProbability:0;
      const reasons=[];
      if(rows[0].letters<rule.minimumLetters)reasons.push('Input is '+rows[0].letters+' letters; at least '+rule.minimumLetters+' are required.');
      if(margin<rule.minimumMargin)reasons.push('Margin '+margin.toFixed(3)+' is below the declared '+rule.minimumMargin+'.');
      if(rows[0].coverage<rule.minimumCoverage)reasons.push('Best profile covers only '+(100*rows[0].coverage).toFixed(1)+'% of this text\u2019s quadgrams; at least '+(100*rule.minimumCoverage).toFixed(0)+'% are required.');
      return{ranking:rows,margin,decided:reasons.length===0,
        choice:reasons.length?null:rows[0].id,abstentionReasons:reasons,
        rule:rule,
        meaning:'Ranking by mean log-probability per letter under each profile. This is not a probability that the text is in that language, and a language absent from the profile set can never be chosen.'};
    }
    return{id:data.id,version:data.version,profiles,byId,compare,abstention:rule,baseline:data.baseline};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={build,buildProfiles};
  global.MuseumResearchLanguage={build,buildProfiles};
})(typeof window!=='undefined'?window:globalThis);
```


## JavaScript — data/research/profile-recovery-v2/inputs/js/research-model.js

**Recovery experiment command-line tool:** runs with Node.js in a repository checkout; it is not a browser control. The protocol, every recorded condition, scorer inputs and interpretation are included separately. For v1, --check audits the saved report and --replay reruns search. For the crossed v2 follow-up, scripts/check-profile-recovery-v2.js verifies saved arithmetic and identities; the frozen run.js needs a fresh output directory. Consult each version’s README before execution.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `data/research/profile-recovery-v2/inputs/js/research-model.js`
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


## JavaScript — data/research/profile-recovery-v2/inputs/scripts/evaluate-profile-recovery.js

**Recovery experiment command-line tool:** runs with Node.js in a repository checkout; it is not a browser control. The protocol, every recorded condition, scorer inputs and interpretation are included separately. For v1, --check audits the saved report and --replay reruns search. For the crossed v2 follow-up, scripts/check-profile-recovery-v2.js verifies saved arithmetic and identities; the frozen run.js needs a fresh output directory. Consult each version’s README before execution.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `data/research/profile-recovery-v2/inputs/scripts/evaluate-profile-recovery.js`
- Served SHA-256: `fe4e8f50a4cc8d998856f94547be85919c3f7068716ae2fcb8ddaa87f8868128`
- Readable-source SHA-256: `fe4e8f50a4cc8d998856f94547be85919c3f7068716ae2fcb8ddaa87f8868128`


```javascript
#!/usr/bin/env node
'use strict';
// A separate, versioned experiment: do not overwrite the v1/v2 evaluations.
// Fix protocol.json before running; all conditions and failures are published.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const R = require('../js/research-model');
const Lang = require('../js/research-language-model');
const splits = require('./research-splits');
const ROOT = path.join(__dirname, '..');
const DIR = 'data/research/profile-recovery-v1';
const PROTOCOL_FILE = DIR + '/protocol.json';
const REPORT_FILE = DIR + '/evaluation.json';
const BASELINE_FILE = 'data/research/v1/language-model.json';
const PROFILES_FILE = 'data/research/v2/language-profiles.json';
const INPUTS = [PROTOCOL_FILE, 'scripts/evaluate-profile-recovery.js', 'scripts/research-splits.js',
  'js/research-model.js', 'js/research-language-model.js', BASELINE_FILE, PROFILES_FILE,
  'data/research/v2/holdout-author-disjoint.json'];
const read = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const round = value => Number(value.toFixed(8));
const mean = values => values.reduce((a, b) => a + b, 0) / values.length;
const FOLD = { 'À':'A','Á':'A','Â':'A','Ã':'A','Ä':'A','Å':'A','Æ':'AE','Ç':'C','È':'E','É':'E','Ê':'E','Ë':'E',
  'Ì':'I','Í':'I','Î':'I','Ï':'I','Ñ':'N','Ò':'O','Ó':'O','Ô':'O','Õ':'O','Ö':'O','Ø':'O','Œ':'OE',
  'Ù':'U','Ú':'U','Û':'U','Ü':'U','Ý':'Y','ß':'SS' };
function normalize(text) {
  return Array.from(text.toUpperCase()).map(c => FOLD[c] === undefined ? c : FOLD[c]).join('').replace(/[^A-Z]/g, '');
}
function reviewedEdition(passage) {
  const editions = {
    'brantome-dames-galantes': 'Project Gutenberg eBook 39220. Selected body passages; the first excerpt containing publisher and edition front matter is excluded.',
    'machiavelli-commedie': 'Project Gutenberg eBook 56498. Edited text whose preface describes spelling modernization. Excluding that preface does not undo changes in the body.',
    'cicero-orationes': 'Project Gutenberg eBook 226. Selected Latin oration excerpts; the introductory excerpt is excluded. No blanket claim that this edition lacks editorial material is made.'
  };
  assert.ok(editions[passage.source], 'Every selected edition needs its reviewed scope.');
  return editions[passage.source];
}
function inputHashes() {
  return Object.fromEntries(INPUTS.map(file => [file, sha(fs.readFileSync(path.join(ROOT, file)))]));
}
function loadInputs() {
  const protocol = read(PROTOCOL_FILE);
  return { protocol, holdout: read(protocol.holdout), profileData: read(PROFILES_FILE), baselineData: read(BASELINE_FILE) };
}
function encrypt(plaintext, seed, homophones) {
  const random = R.rng(seed), present = [...new Set(plaintext)];
  const pool = Array.from({ length: present.length * homophones }, (_, i) => 'g' + i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const key = {}, byLetter = {};
  present.forEach((letter, i) => {
    byLetter[letter] = pool.slice(homophones * i, homophones * (i + 1));
    byLetter[letter].forEach(symbol => { key[symbol] = letter; });
  });
  const tokens = Array.from(plaintext, letter => byLetter[letter][Math.floor(random() * homophones)]);
  const observed = new Set(tokens);
  return { tokens, key: Object.fromEntries(Object.entries(key).filter(([symbol]) => observed.has(symbol))) };
}
function buildCases(inputs) {
  const { protocol, holdout, profileData } = inputs;
  assert.equal(protocol.id, 'museum-historical-profile-recovery-v1', 'Unsupported experiment protocol.');
  assert.equal(protocol.split, splits.splitOf(protocol.collection), 'Collection must stay in its declared split.');
  const training = profileData.profiles.flatMap(p => p.sources);
  const trainingAuthors = new Set(training.map(s => {
    assert.ok(protocol.sourceAuthors[s.id], 'Every training source needs an explicit author.');
    return protocol.sourceAuthors[s.id];
  }));
  const included = new Set(protocol.selection.included);
  const excluded = new Set(protocol.selection.excluded.map(p => p.id));
  assert.equal(included.size, 6, 'The protocol fixes six passages before outcomes.');
  assert.equal(excluded.size, 3, 'The three edition/introductory passages stay excluded.');
  assert.equal(included.size + excluded.size, holdout.passages.length, 'Account for every held-out passage.');
  for (const p of holdout.passages) {
    assert.notEqual(included.has(p.id), excluded.has(p.id), 'Each passage must be included or excluded, never both.');
  }
  const sources = protocol.selection.included.map(id => {
    const p = holdout.passages.find(p => p.id === id);
    assert.ok(p, 'Missing selected passage ' + id);
    assert.ok(!/-disjoint-1$/.test(p.id), 'Edition front matter must not enter the historical recovery sample.');
    assert.equal(sha(p.text), p.sha256, 'Held-out text checksum changed: ' + id);
    assert.ok(profileData.profiles.some(profile => profile.id === p.profile), 'Unknown expected language profile.');
    assert.ok(protocol.sourceAuthors[p.source], 'Every held-out source needs an explicit author.');
    assert.ok(!trainingAuthors.has(protocol.sourceAuthors[p.source]), 'Training author leaked into recovery holdout.');
    assert.ok(!training.some(s => s.id === p.source || s.work === p.work || s.url === p.url),
      'Training work leaked into recovery holdout.');
    const plaintext = normalize(p.text);
    assert.ok(plaintext.length >= 60 && plaintext.length <= 600, 'Selected passage exceeds the solver input scope.');
    return { id: p.id, source: p.source, author: protocol.sourceAuthors[p.source], work: p.work,
      edition: reviewedEdition(p), editionAsRecordedInV2: p.edition, url: p.url, shift: p.shift, profile: p.profile,
      language: profileData.profiles.find(profile => profile.id === p.profile).language,
      originalSha256: p.sha256, normalizedSha256: sha(plaintext), plaintext };
  });
  for (const p of profileData.profiles) {
    assert.equal(sources.filter(s => s.profile === p.id).length, 2, 'Every language needs exactly two selected passages.');
  }
  const cases = [];
  for (const source of sources) for (const replicate of protocol.replicates) {
    const id = source.id + ':replicate-' + replicate.id;
    const keySeed = splits.seedFor(protocol.split, protocol.id + ':' + id, 'key');
    const encrypted = encrypt(source.plaintext, keySeed, protocol.cipher.homophonesPerPresentLetter);
    assert.equal(encrypted.tokens.map(symbol => encrypted.key[symbol]).join(''), source.plaintext,
      'Known-key application must recover the fixture before unknown-key search.');
    cases.push({ id, passage: source.id, sourceDocument: source.source, collection: protocol.collection,
      split: protocol.split, profile: source.profile, language: source.language, replicate: replicate.id,
      searchSeed: replicate.searchSeed, keySeed, tokens: encrypted.tokens, expectedKey: encrypted.key,
      ciphertextSha256: sha(JSON.stringify(encrypted.tokens)), knownKeyApplicationExact: true });
  }
  assert.equal(cases.length, 30, 'Six passages times five independent key/search-seed pairs.');
  assert.equal(new Set(cases.map(c => c.keySeed)).size, cases.length, 'Independent key seeds collided.');
  assert.equal(new Set(cases.map(c => c.ciphertextSha256)).size, cases.length, 'Independent ciphertexts collided.');
  const grouping = splits.audit(cases);
  assert.ok(grouping.ok, grouping.problems.join('\n'));
  return { sources, cases, grouping };
}
function createScorers(inputs) {
  const baseline = Lang.build(inputs.baselineData);
  const profiles = Lang.buildProfiles(inputs.profileData);
  const scorers = new Map([[baseline.id, baseline.fitness],
    ...profiles.profiles.map(p => [p.id, p.fitness])]);
  assert.deepEqual([...scorers.keys()], inputs.protocol.scorers, 'The full declared scoring-model matrix is required.');
  for (const [id, fitness] of scorers) assert.equal(fitness.modelId, id, 'Scoring function does not match its condition.');
  return scorers;
}
function optionsFor(protocol, c, solver) {
  if (solver === 'annealing') return { seed: c.searchSeed, steps: protocol.solvers.annealing.steps, locks: {} };
  assert.equal(solver, 'beam-search', 'Unknown solver.');
  return { beam: protocol.solvers['beam-search'].beam, branch: protocol.solvers['beam-search'].branch, locks: {} };
}
function roleFor(c, scorer) {
  return scorer === 'museum-prose-quadgram-v1' ? 'baseline' : (scorer === c.profile ? 'matched' : 'mismatched');
}
function measures(expected, candidate, expectedKey, candidateKey) {
  const metric = R.metrics(expected, candidate, expectedKey, candidateKey);
  assert.equal(candidate.length, expected.length, 'Letter-homophone recovery must preserve character positions.');
  return { exact: metric.exact, editDistance: metric.editDistance,
    plaintextError: round(metric.plaintextError),
    positionalError: round(Array.from(expected).filter((letter, i) => letter !== candidate[i]).length / expected.length),
    keyError: round(metric.keyError) };
}
function runCondition(protocol, c, source, solver, scorer, fitness) {
  // This identity check is intentional: a baseline-only runner mislabeled as a
  // historical-model comparison must fail, even if all reported errors look plausible.
  assert.equal(fitness.modelId, scorer, 'Scoring function does not match its condition.');
  let fitnessEvaluations = 0;
  const score = text => { fitnessEvaluations++; return fitness(text); };
  score.modelId = fitness.modelId;
  const options = optionsFor(protocol, c, solver), start = process.hrtime.bigint();
  const result = solver === 'annealing' ? R.search(c.tokens, options, score) : R.beamSearch(c.tokens, options, score);
  const ms = Number(process.hrtime.bigint() - start) / 1e6;
  assert.equal(result.model, scorer, 'Solver returned a different scoring-model identity.');
  assert.equal(result.task, 'key-recovery-candidates', 'Known-key application is not recovery.');
  const candidate = result.candidates[0];
  return Object.assign({ caseId: c.id, solver, scorer, role: roleFor(c, scorer), options,
    ciphertextSha256: c.ciphertextSha256, scoringModelReported: result.model,
    completedSteps: result.completedSteps, fitnessEvaluations,
    plaintext: candidate.plaintext, key: candidate.key, score: candidate.score, ms: round(ms) },
  measures(source.plaintext, candidate.plaintext, c.expectedKey, candidate.key));
}
function stat(rows) {
  return { runs: rows.length, exact: rows.filter(r => r.exact).length,
    plaintextError: round(mean(rows.map(r => r.plaintextError))),
    positionalError: round(mean(rows.map(r => r.positionalError))),
    keyError: round(mean(rows.map(r => r.keyError))) };
}
function delta(values) {
  return { pairs: values.length, mean: round(mean(values)), min: round(Math.min(...values)),
    max: round(Math.max(...values)), matchedWins: values.filter(v => v < -1e-8).length,
    ties: values.filter(v => Math.abs(v) <= 1e-8).length, matchedLosses: values.filter(v => v > 1e-8).length };
}
function summarize(cases, runs) {
  const groupDefs = [{ kind: 'overall', id: 'all', cases },
    ...[...new Set(cases.map(c => c.language))].map(id => ({ kind: 'language', id, cases: cases.filter(c => c.language === id) })),
    ...[...new Set(cases.map(c => c.passage))].map(id => ({ kind: 'passage', id, cases: cases.filter(c => c.passage === id) })),
    ...[...new Set(cases.map(c => c.replicate))].map(id => ({ kind: 'replicate', id, cases: cases.filter(c => c.replicate === id) }))];
  const groups = [];
  for (const solver of ['annealing', 'beam-search']) for (const g of groupDefs) {
    const paired = g.cases.map(c => {
      const mine = runs.filter(r => r.caseId === c.id && r.solver === solver);
      const baseline = mine.find(r => r.role === 'baseline'), matched = mine.find(r => r.role === 'matched');
      const mismatched = mine.filter(r => r.role === 'mismatched');
      assert.ok(baseline && matched && mismatched.length === 2, 'Incomplete paired scoring-model matrix.');
      return { baseline, matched, mismatched };
    });
    groups.push({ solver, group: g.kind, id: g.id, cases: g.cases.length,
      baseline: stat(paired.map(p => p.baseline)), matched: stat(paired.map(p => p.matched)),
      mismatched: stat(paired.flatMap(p => p.mismatched)),
      matchedMinusBaseline: delta(paired.map(p => p.matched.plaintextError - p.baseline.plaintextError)),
      matchedMinusMeanMismatched: delta(paired.map(p => p.matched.plaintextError - mean(p.mismatched.map(r => r.plaintextError)))) });
  }
  // The two mismatch results stay inspectable separately; their pooled mean has
  // the same case weights, but 60 runs are not 60 independent source texts.
  const mismatchedControls = [];
  for (const solver of ['annealing', 'beam-search']) {
    for (const scorer of [...new Set(runs.filter(r => r.role === 'mismatched').map(r => r.scorer))]) {
      const controls = runs.filter(r => r.solver === solver && r.scorer === scorer && r.role === 'mismatched');
      const matched = controls.map(control => runs.find(r => r.caseId === control.caseId && r.solver === solver && r.role === 'matched'));
      mismatchedControls.push({ solver, scorer, control: stat(controls), matchedOnSameCases: stat(matched),
        matchedMinusControl: delta(matched.map((r, i) => r.plaintextError - controls[i].plaintextError)) });
    }
  }
  return { groups, mismatchedControls };
}
function runtime() {
  return { node: process.version, v8: process.versions.v8, platform: process.platform, arch: process.arch,
    locale: Intl.DateTimeFormat().resolvedOptions().locale };
}
function validateReport(report, inputs = loadInputs()) {
  const fixtures = buildCases(inputs), scorers = createScorers(inputs);
  assert.equal(report.id, inputs.protocol.id);
  assert.deepEqual(report.protocol, inputs.protocol, 'Recorded protocol changed.');
  assert.deepEqual(report.hashes, inputHashes(), 'Experiment inputs changed; keep old versions and record a new run.');
  assert.deepEqual(report.sources, fixtures.sources, 'Source provenance or normalized text changed.');
  assert.deepEqual(report.cases, fixtures.cases, 'The independently keyed fixtures changed.');
  assert.deepEqual(report.grouping, fixtures.grouping, 'Source/split grouping changed.');
  assert.equal(report.runs.length, inputs.protocol.runs, 'The full experiment matrix is required.');
  const seen = new Set();
  for (const run of report.runs) {
    const c = fixtures.cases.find(c => c.id === run.caseId);
    assert.ok(c, 'Unknown ciphertext case.');
    assert.ok(Object.hasOwn(inputs.protocol.solvers, run.solver) && scorers.has(run.scorer), 'Unknown solver or scorer.');
    const id = [run.caseId, run.solver, run.scorer].join('/');
    assert.ok(!seen.has(id), 'Duplicate experiment condition.'); seen.add(id);
    assert.equal(run.role, roleFor(c, run.scorer), 'Matched/mismatched labels do not match the source language.');
    assert.deepEqual(run.options, optionsFor(inputs.protocol, c, run.solver), 'Seeds, budgets or locks differ across paired conditions.');
    assert.equal(run.ciphertextSha256, c.ciphertextSha256, 'A condition received a different ciphertext.');
    assert.equal(run.scoringModelReported, run.scorer, 'A condition used the wrong scoring model.');
    const source = fixtures.sources.find(s => s.id === c.passage);
    assert.deepEqual(Object.keys(run.key).sort(), Object.keys(c.expectedKey).sort(), 'Prediction must cover exactly the observed symbols.');
    assert.ok(Object.values(run.key).every(letter => /^[A-Z]$/.test(letter)), 'Prediction contains a non-letter key value.');
    assert.equal(c.tokens.map(symbol => run.key[symbol]).join(''), run.plaintext, 'Predicted plaintext does not apply the reported key.');
    const actual = measures(source.plaintext, run.plaintext, c.expectedKey, run.key);
    for (const [name, value] of Object.entries(actual)) assert.equal(run[name], value, 'Reported ' + name + ' does not match the prediction.');
    const score = scorers.get(run.scorer)(run.plaintext);
    assert.ok(Number.isFinite(run.score) && Math.abs(run.score - score) <= 1e-9 * Math.max(1, Math.abs(score)),
      'Candidate score does not match its declared scoring model.');
    assert.ok(Number.isInteger(run.fitnessEvaluations) && run.fitnessEvaluations > 0, 'Missing score evaluation count.');
    assert.equal(run.completedSteps, run.solver === 'annealing' ? run.options.steps : Object.keys(c.expectedKey).length,
      'A search stopped before its declared budget.');
    assert.ok(Number.isFinite(run.ms) && run.ms >= 0, 'Invalid elapsed runtime.');
  }
  assert.equal(seen.size, fixtures.cases.length * Object.keys(inputs.protocol.solvers).length * scorers.size);
  assert.deepEqual(report.summary, summarize(fixtures.cases, report.runs), 'Reported aggregate or paired differences are inconsistent.');
  return true;
}
function execute(inputs = loadInputs(), progress = () => {}) {
  const fixtures = buildCases(inputs), scorers = createScorers(inputs), runs = [];
  for (const c of fixtures.cases) {
    const source = fixtures.sources.find(s => s.id === c.passage);
    for (const solver of Object.keys(inputs.protocol.solvers)) for (const [scorer, fitness] of scorers) {
      runs.push(runCondition(inputs.protocol, c, source, solver, scorer, fitness));
    }
    progress(c.id, runs.length, inputs.protocol.runs);
  }
  const report = { version: 1, id: inputs.protocol.id, generatedBy: 'scripts/evaluate-profile-recovery.js',
    protocol: inputs.protocol, hashes: inputHashes(), runtime: runtime(),
    sources: fixtures.sources, cases: fixtures.cases, grouping: fixtures.grouping,
    runs, summary: summarize(fixtures.cases, runs),
    limits: [
      'Six public passages, two from each of three works/authors. Thirty independently keyed cases are not thirty independent documents; variants remain grouped by source.',
      'The first passage of every existing author-disjoint source is excluded for front-matter/introductory contamination before outcomes. Existing v2 files and their earlier results are preserved.',
      'Author and work disjointness is checked against explicit source identities and author metadata, not claimed for every possible unrecorded textual borrowing or edition editor.',
      'Matched means language-matched, not necessarily period-, genre- or orthography-matched. The Italian edition states that some spellings were modernized; removing its preface does not undo those editorial decisions.',
      'Both mismatched historical models are run separately on each case. Their pooled mean uses two runs per case; paired comparisons first average those two controls within each case.',
      'Five fixed paired key/search seeds are all published. They vary keys as well as annealing randomness, and are not an isolated estimate of search-seed variance.',
      'Scores, corpus sizes, pruning and unseen-gram floors differ among models. No cross-model likelihood comparison or temperature rescaling is performed; the outcome is externally measured recovery error.',
      'The shipped annealer still uses an English-weighted initial proposal distribution and the beam uses its shipped extension order. Both are held fixed across scorers. These are implementation-specific model substitutions, not a general comparison of language models.',
      'No matched modern French, Italian or Latin baseline is available, so this experiment cannot identify a benefit of historical spelling separately from language matching.',
      'Only clean A-Z letter-homophone ciphertexts are tested. No numerical segmentation, nulls, word codes, transcription ambiguity or authentic unknown historical cipher is recovered here.',
      'Replay needs identical inputs, scorer/solver builds and JavaScript execution behavior. Node/V8/platform/architecture/locale and input hashes are recorded. Cross-engine search paths are not promised to match.',
      'The check command audits provenance, pairing, model identity, complete matrix and arithmetic without rerunning search. Replay reruns every search and demands exact results except runtime; it does not accept a broad per-item error tolerance.',
      'No score-based cherry-picking, best-of-seed reporting, inferential significance or general decipherment-accuracy claim is supported by this bounded experiment.'
    ] };
  validateReport(report, inputs);
  return report;
}
function replayProjection(report) {
  const copy = JSON.parse(JSON.stringify(report));
  delete copy.runtime;
  copy.runs.forEach(run => { delete run.ms; });
  return copy;
}
function printSummary(report) {
  console.log('solver\tcondition\truns\tplaintext error\tpositional error\tkey error\texact');
  for (const group of report.summary.groups.filter(g => g.group === 'overall')) {
    for (const condition of ['baseline', 'matched', 'mismatched']) {
      const s = group[condition];
      console.log([group.solver, condition, s.runs, (100 * s.plaintextError).toFixed(2) + '%',
        (100 * s.positionalError).toFixed(2) + '%', (100 * s.keyError).toFixed(2) + '%', s.exact + '/' + s.runs].join('\t'));
    }
    console.log(group.solver + ' paired matched-minus-baseline: ' + (100 * group.matchedMinusBaseline.mean).toFixed(2) +
      ' percentage points; matched-minus-mean-mismatch: ' + (100 * group.matchedMinusMeanMismatched.mean).toFixed(2) + '.');
  }
}
function main() {
  const args = process.argv.slice(2);
  assert.ok(args.length <= 1 && (!args.length || ['--check', '--replay'].includes(args[0])),
    'Usage: node scripts/evaluate-profile-recovery.js [--check|--replay]');
  if (args[0] === '--check') {
    const report = read(REPORT_FILE); validateReport(report);
    console.log('Historical profile recovery: provenance, all 240 paired conditions, model identities and result arithmetic checked (no search rerun).');
    printSummary(report); return;
  }
  let previous;
  if (args[0] === '--replay') {
    previous = read(REPORT_FILE); validateReport(previous);
    assert.deepEqual(previous.runtime, runtime(), 'Exact replay requires the recorded runtime; use a separately versioned experiment for a different environment.');
  }
  const report = execute(loadInputs(), (id, done, total) => console.log(done + '/' + total + ' conditions completed: ' + id));
  if (previous) {
    assert.deepEqual(replayProjection(report), replayProjection(previous), 'Search replay diverged; no per-item error tolerance is applied.');
    console.log('Historical profile recovery replayed exactly in the recorded runtime; elapsed times excluded.');
  } else {
    fs.writeFileSync(path.join(ROOT, REPORT_FILE), JSON.stringify(report, null, 2) + '\n');
    console.log('Wrote ' + REPORT_FILE);
  }
  printSummary(report);
}
if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { loadInputs, normalize, encrypt, buildCases, createScorers, optionsFor, roleFor,
  measures, runCondition, summarize, validateReport, execute, replayProjection };
```


## JavaScript — data/research/profile-recovery-v2/inputs/scripts/research-splits.js

**Recovery experiment command-line tool:** runs with Node.js in a repository checkout; it is not a browser control. The protocol, every recorded condition, scorer inputs and interpretation are included separately. For v1, --check audits the saved report and --replay reruns search. For the crossed v2 follow-up, scripts/check-profile-recovery-v2.js verifies saved arithmetic and identities; the frozen run.js needs a fresh output directory. Consult each version’s README before execution.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `data/research/profile-recovery-v2/inputs/scripts/research-splits.js`
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


## JavaScript — data/research/profile-recovery-v2/run.js

**Recovery experiment command-line tool:** runs with Node.js in a repository checkout; it is not a browser control. The protocol, every recorded condition, scorer inputs and interpretation are included separately. For v1, --check audits the saved report and --replay reruns search. For the crossed v2 follow-up, scripts/check-profile-recovery-v2.js verifies saved arithmetic and identities; the frozen run.js needs a fresh output directory. Consult each version’s README before execution.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `data/research/profile-recovery-v2/run.js`
- Served SHA-256: `bf879c7ecba04f54b11204a3b83425961692c310e5069c06a1fadee4ec23f7bf`
- Readable-source SHA-256: `bf879c7ecba04f54b11204a3b83425961692c310e5069c06a1fadee4ec23f7bf`


```javascript
'use strict';
const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict'),path=require('path');
const D=__dirname, E=require('./inputs/scripts/evaluate-profile-recovery');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const P=JSON.parse(fs.readFileSync(path.join(D,'protocol.json')));
for(const [f,h] of Object.entries(P.inputHashes))assert.equal(sha(fs.readFileSync(path.join(D,'inputs',f))),h);
const inputs=E.loadInputs(),fixtures=E.buildCases(inputs),scorers=E.createScorers(inputs);
const runtime={node:process.version,v8:process.versions.v8,platform:process.platform,arch:process.arch,locale:Intl.DateTimeFormat().resolvedOptions().locale};
const log=path.join(D,'runs.jsonl');assert.ok(!fs.existsSync(log),'Do not overwrite a completed or partial experiment.');
fs.writeFileSync(path.join(D,'execution.json'),JSON.stringify({startedAt:new Date().toISOString(),runtime,protocolSha256:sha(fs.readFileSync(path.join(D,'protocol.json'))),runnerSha256:sha(fs.readFileSync(__filename))},null,2));
fs.writeFileSync(path.join(D,'fixtures.json'),JSON.stringify(fixtures,null,2));
let done=0;
for(const c of fixtures.cases){
 const source=fixtures.sources.find(s=>s.id===c.passage);
 for(const solver of ['annealing','beam-search'])for(const seed of solver==='annealing'?P.searchSeeds:[null])for(const [scorer,fitness] of scorers){
  let r;try{r=E.runCondition(inputs.protocol,{...c,searchSeed:seed},source,solver,scorer,fitness);r.status='completed';}
  catch(e){r={caseId:c.id,solver,scorer,status:'failed',error:e.stack};}
  Object.assign(r,{searchSeed:seed,passage:c.passage,sourceDocument:c.sourceDocument,language:c.language,keyIndex:c.replicate});
  fs.appendFileSync(log,JSON.stringify(r)+'\n');done++;
 }
 console.log(done+'/720 '+c.id);
}
assert.equal(done,720);fs.writeFileSync(path.join(D,'finished.json'),JSON.stringify({completedAt:new Date().toISOString(),runs:done,runsSha256:sha(fs.readFileSync(log))},null,2));
```


## JavaScript — hall-of-foundations/crypto-algebra.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `hall-of-foundations/crypto-algebra.js`
- Served SHA-256: `d92a9a4e176c60c95bf6c2848a47ac0dfe2bad8a92dabc802508ea874811b704`
- Readable-source SHA-256: `d92a9a4e176c60c95bf6c2848a47ac0dfe2bad8a92dabc802508ea874811b704`


```javascript
/* ==========================================================================
   crypto-algebra.js — pure logic for Exhibits 153-156, no DOM.
   Polynomial rings (ML-KEM/ML-DSA structure), Lagrange interpolation
   (Shamir), and the bilinearity identity for pairings.
   Exposed on window.CryptoAlgebra (browser) and module.exports (Node/CI).
   ========================================================================== */
(function (root) {
  "use strict";

  function mod(n, q) { return ((n % q) + q) % q; }

  // Modular inverse of a mod p (p prime), by extended search. Small p only.
  function modInv(a, p) {
    a = mod(a, p);
    for (let t = 1; t < p; t++) if (mod(a * t, p) === 1) return t;
    return null;
  }

  // ---- Multiplicative order & primitive roots (Exhibit 143) ----
  // The successive powers g^1..g^(p-1) mod p; g is a primitive root when
  // they visit every nonzero residue.
  function powersOf(g, p) {
    const out = []; let x = 1;
    for (let i = 1; i < p; i++) { x = mod(x * g, p); out.push(x); }
    return out;
  }
  function isPrimitiveRoot(g, p) {
    return new Set(powersOf(g, p)).size === p - 1;
  }

  // ---- Polynomial ring R_q = Z_q[X] / (X^n + 1) ----
  // Negacyclic convolution: X^n = -1, so a term of degree k >= n wraps to
  // degree k-n with a sign flip. Coefficients reduced mod q.
  function ringMul(a, b, n, q) {
    const c = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let k = i + j, sign = 1;
        if (k >= n) { k -= n; sign = -1; }
        c[k] = mod(c[k] + sign * a[i] * b[j], q);
      }
    }
    return c;
  }

  function ringAdd(a, b, n, q) {
    const c = new Array(n).fill(0);
    for (let i = 0; i < n; i++) c[i] = mod((a[i] || 0) + (b[i] || 0), q);
    return c;
  }

  // ---- Lagrange interpolation (Shamir's Secret Sharing) ----
  // Evaluate the unique polynomial through the given points at x = 0,
  // all arithmetic mod p. points: [[x,y], ...]. Returns the secret f(0), or null when a denominator has no inverse.
  function lagrangeAtZero(points, p) {
    let secret = 0;
    for (let i = 0; i < points.length; i++) {
      let num = 1, den = 1;
      for (let j = 0; j < points.length; j++) {
        if (i === j) continue;
        num = mod(num * (-points[j][0]), p);
        den = mod(den * (points[i][0] - points[j][0]), p);
      }
      const inv = modInv(den, p);
      if (inv === null) return null;
      secret = mod(secret + points[i][1] * mod(num * inv, p), p);
    }
    return secret;
  }

  // Evaluate a polynomial (coeffs low->high) at x, mod p.
  function polyEval(coeffs, x, p) {
    let acc = 0;
    for (let i = coeffs.length - 1; i >= 0; i--) acc = mod(acc * x + coeffs[i], p);
    return acc;
  }

  // ---- Pairing bilinearity (multiplicative model) ----
  function powmod(g, e, m) {
    let r = 1; g = mod(g, m);
    while (e > 0) { if (e & 1) r = mod(r * g, m); g = mod(g * g, m); e = Math.floor(e / 2); }
    return r;
  }
  // Verify e(aP, bQ) = e(P, Q)^(ab) in a toy multiplicative target group.
  // base plays the role of e(P,Q). Returns { viaProduct, viaChain, equal }.
  function pairingCheck(a, b, base, m) {
    const viaProduct = powmod(base, a * b, m);          // e(P,Q)^(ab)
    const viaChain = powmod(powmod(base, a, m), b, m);   // (e(P,Q)^a)^b
    return { viaProduct, viaChain, equal: viaProduct === viaChain };
  }

  const api = {
    mod, modInv,
    powersOf, isPrimitiveRoot,
    ringMul, ringAdd,
    lagrangeAtZero, polyEval,
    powmod, pairingCheck
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CryptoAlgebra = api;

})(typeof self !== "undefined" ? self : this);
```


## JavaScript — hall-of-foundations/ec-math.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `hall-of-foundations/ec-math.js`
- Served SHA-256: `e73bdc8f38c207be1b4ea73b73809404714dc1d3100e1108c673be6d929b451f`
- Readable-source SHA-256: `e73bdc8f38c207be1b4ea73b73809404714dc1d3100e1108c673be6d929b451f`


```javascript
/* ==========================================================================
   ec-math.js — pure elliptic-curve logic for Exhibits 142 & 150, no DOM.
   Curve arithmetic over F_p (point enumeration, chord-and-tangent group
   law) and over the reals (the hand-drawn construction in Exhibit 150).
   Exposed on window.ECMath (browser) and module.exports (Node/CI).
   ========================================================================== */
(function (root) {
  "use strict";

  function mod(n, p) { return ((n % p) + p) % p; }

  // Modular inverse of k mod p (p prime), by extended search. Small p only.
  function modInv(k, p) {
    k = mod(k, p);
    for (let t = 1; t < p; t++) if (mod(k * t, p) === 1) return t;
    return null;
  }

  // ---- The curve over F_p: y^2 = x^3 + ax + b ----
  function ecRhs(x, a, b, p) { return mod(x * x * x + a * x + b, p); }

  // All affine points (the point at infinity is represented as null).
  function ecPoints(a, b, p) {
    const pts = [];
    for (let x = 0; x < p; x++) {
      const r = ecRhs(x, a, b, p);
      for (let y = 0; y < p; y++) if (mod(y * y, p) === r) pts.push([x, y]);
    }
    return pts;
  }

  // Chord-and-tangent addition over F_p. null is the point at infinity.
  function ecAdd(P, Q, a, p) {
    if (P === null) return Q;
    if (Q === null) return P;
    if (P[0] === Q[0] && mod(P[1] + Q[1], p) === 0) return null;
    let m;
    if (P[0] === Q[0] && P[1] === Q[1]) {
      m = mod(mod(3 * P[0] * P[0] + a, p) * modInv(mod(2 * P[1], p), p), p);
    } else {
      m = mod(mod(Q[1] - P[1], p) * modInv(mod(Q[0] - P[0], p), p), p);
    }
    const x3 = mod(m * m - P[0] - Q[0], p);
    const y3 = mod(m * (P[0] - x3) - P[1], p);
    return [x3, y3];
  }

  function ecIsOnCurve(P, a, b, p) {
    return P === null || mod(P[1] * P[1], p) === ecRhs(P[0], a, b, p);
  }

  // ---- The curve over the reals (Exhibit 150) ----
  function curveY2(x, a, b) { return x * x * x + a * x + b; }

  // The group law drawn by hand: line through P and Q, third intersection,
  // reflect across the x-axis. Returns { third, sum, slope }.
  function ecAddReal(P, Q, a) {
    // A vertical chord (including a vertical tangent at y=0) reaches O.
    if (Math.abs(P[0] - Q[0]) < 1e-9 && Math.abs(P[1] + Q[1]) < 1e-9) {
      return { third: null, sum: null, slope: null };
    }
    let m;
    if (Math.abs(P[0] - Q[0]) < 1e-9 && Math.abs(P[1] - Q[1]) < 1e-9) {
      m = (3 * P[0] * P[0] + a) / (2 * P[1]);
    } else {
      m = (Q[1] - P[1]) / (Q[0] - P[0]);
    }
    const x3 = m * m - P[0] - Q[0];
    const y3 = m * (P[0] - x3) - P[1];
    return { third: [x3, -y3], sum: [x3, y3], slope: m };
  }

  // Smoothness: the discriminant -16(4a^3 + 27b^2) must be nonzero,
  // or the curve has a cusp/node and the group law breaks down.
  function ecIsSmooth(a, b) { return 4 * a * a * a + 27 * b * b !== 0; }

  const api = {
    mod, modInv,
    ecRhs, ecPoints, ecAdd, ecIsOnCurve,
    curveY2, ecAddReal, ecIsSmooth
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ECMath = api;

})(typeof self !== "undefined" ? self : this);
```


## JavaScript — hall-of-foundations/lattice-math.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `hall-of-foundations/lattice-math.js`
- Served SHA-256: `de63f8ec661a052042f9810c198c2eb809eac0125407103726da38c93240da06`
- Readable-source SHA-256: `de63f8ec661a052042f9810c198c2eb809eac0125407103726da38c93240da06`


```javascript
/* ==========================================================================
   lattice-math.js — pure cryptographic-foundations logic, no DOM
   Shared by lattices-svp.html and closest-vector.html.
   Every function here is deterministic and unit-testable in isolation:
   feed it numbers, get numbers back. UI/SVG code lives in the pages.
   Exposed on window.LatticeMath (browser) and module.exports (Node/CI).
   ========================================================================== */
(function (root) {
  "use strict";

  // Determinant of the 2x2 basis [b1 b2] (columns). |det| = covolume = points per unit area^-1.
  function det2(b1, b2) {
    return b1[0] * b2[1] - b1[1] * b2[0];
  }

  // Shortest nonzero lattice vector by exhaustive search over |i|,|j| <= R.
  // Returns { x, y, i, j, len } or null if the lattice is degenerate.
  function shortestVector(b1, b2, R) {
    if (det2(b1, b2) === 0) return null;
    R = R || 7;
    var best = Infinity, bv = null;
    for (var i = -R; i <= R; i++) {
      for (var j = -R; j <= R; j++) {
        if (i === 0 && j === 0) continue;
        var x = i * b1[0] + j * b2[0];
        var y = i * b1[1] + j * b2[1];
        var n = x * x + y * y;
        if (n < best) { best = n; bv = { x: x, y: y, i: i, j: j, len: Math.sqrt(n) }; }
      }
    }
    return bv;
  }

  // True closest lattice point to target t={x,y}, exhaustive over the STANDARD
  // integer lattice (the canonical lattice both bases describe). Returns {x,y,dist}.
  function closestPoint(t, R) {
    R = R || 8;
    var best = Infinity, bv = null;
    for (var i = -R; i <= R; i++) {
      for (var j = -R; j <= R; j++) {
        var d = (i - t.x) * (i - t.x) + (j - t.y) * (j - t.y);
        if (d < best) { best = d; bv = { x: i, y: j, dist: Math.sqrt(d) }; }
      }
    }
    return bv;
  }

  // Babai's rounding: express t in the given basis, round each coordinate.
  // Returns the lattice point { x, y, i, j } the rounding lands on.
  // Correct when the basis is short & near-orthogonal; misfires when skewed.
  function babaiRound(t, b1, b2) {
    var det = det2(b1, b2);
    if (det === 0) return null;
    var a = (t.x * b2[1] - t.y * b2[0]) / det;
    var b = (b1[0] * t.y - b1[1] * t.x) / det;
    var ai = Math.round(a), bi = Math.round(b);
    return { x: ai * b1[0] + bi * b2[0], y: ai * b1[1] + bi * b2[1], i: ai, j: bi };
  }

  // LWE round-trip: hide lattice point v={x,y} under noise vector e={x,y},
  // then try to recover v by Babai-rounding (v+e) in the given basis.
  // Returns { recovered:{x,y,i,j}, ok:boolean, noisyTarget:{x,y} }.
  function lweRecover(v, e, b1, b2) {
    var t = { x: v.x + e.x, y: v.y + e.y };
    var r = babaiRound(t, b1, b2);
    return { recovered: r, ok: (r !== null && r.x === v.x && r.y === v.y), noisyTarget: t };
  }

  // Whether Babai in this basis returns the TRUE closest point for target t.
  function babaiIsCorrect(t, b1, b2) {
    var r = babaiRound(t, b1, b2);
    var c = closestPoint(t);
    return r !== null && r.x === c.x && r.y === c.y;
  }

  var api = {
    det2: det2,
    shortestVector: shortestVector,
    closestPoint: closestPoint,
    babaiRound: babaiRound,
    lweRecover: lweRecover,
    babaiIsCorrect: babaiIsCorrect
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LatticeMath = api;

})(typeof self !== "undefined" ? self : this);
```


## JavaScript — hall-of-foundations/lwe-math.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `hall-of-foundations/lwe-math.js`
- Served SHA-256: `453e6eaf8beafe07331e861efea977075be364c20a03dfc82ad0920dbc5c81d5`
- Readable-source SHA-256: `453e6eaf8beafe07331e861efea977075be364c20a03dfc82ad0920dbc5c81d5`


```javascript
/* ==========================================================================
   lwe-math.js — Learning With Errors: pure logic, no DOM.
   Backs learning-with-errors.html (§157).

   Implements the Regev-style construction that ML-KEM descends from:
     public key : (A, t) with t = A·s + e   (mod q)
     secret key : the short vector s
   Encryption hides a bit behind a large shared term that only s can cancel.

   Every function is deterministic — randomness is injected by the caller as
   explicit vectors, so the CI tests can replay exact cases.
   Exposed on window.LWEMath (browser) and module.exports (Node/CI).
   ========================================================================== */
(function (root) {
  "use strict";

  // Least non-negative residue. JS % is a remainder, not a modulus.
  function mod(a, q) {
    return ((a % q) + q) % q;
  }

  // Centered representative in (-q/2, q/2]. This is the value that matters for
  // noise: 96 mod 97 is "-1 of noise", not "96 of noise".
  function center(a, q) {
    var r = mod(a, q);
    return r > q / 2 ? r - q : r;
  }

  // Modular inverse via extended Euclid. Returns null when gcd(a,q) != 1.
  function modInv(a, q) {
    var t = 0, newT = 1, r = q, newR = mod(a, q);
    while (newR !== 0) {
      var quot = Math.floor(r / newR);
      var tmp = t - quot * newT; t = newT; newT = tmp;
      tmp = r - quot * newR; r = newR; newR = tmp;
    }
    if (r > 1) return null;
    return mod(t, q);
  }

  function dot(a, b, q) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * b[i];
    return mod(s, q);
  }

  function matVec(A, v, q) {
    var out = [];
    for (var i = 0; i < A.length; i++) out.push(dot(A[i], v, q));
    return out;
  }

  function transpose(A) {
    var out = [];
    for (var j = 0; j < A[0].length; j++) {
      var row = [];
      for (var i = 0; i < A.length; i++) row.push(A[i][j]);
      out.push(row);
    }
    return out;
  }

  function addVec(a, b, q) {
    var out = [];
    for (var i = 0; i < a.length; i++) out.push(mod(a[i] + b[i], q));
    return out;
  }

  // ---- the LWE sample ------------------------------------------------------
  // t = A·s + e (mod q). With e = 0 this is an ordinary linear system and
  // Gaussian elimination reads s straight off. The error is the whole defence.
  function lweSample(A, s, e, q) {
    return addVec(matVec(A, s, q), e, q);
  }

  // ---- solving -------------------------------------------------------------
  // Exact Gaussian elimination mod prime q. Returns the unique solution to
  // A·x = b, or null if A is singular. Never sees the error term — that is
  // precisely the point: fed a noisy t it returns a confident, wrong answer.
  function gaussianSolve(A, b, q) {
    var n = A.length, i, j, k;
    var M = [];
    for (i = 0; i < n; i++) {
      var row = [];
      for (j = 0; j < n; j++) row.push(mod(A[i][j], q));
      row.push(mod(b[i], q));
      M.push(row);
    }
    for (i = 0; i < n; i++) {
      var piv = -1;
      for (k = i; k < n; k++) if (M[k][i] !== 0) { piv = k; break; }
      if (piv < 0) return null;
      var tmp = M[i]; M[i] = M[piv]; M[piv] = tmp;
      var inv = modInv(M[i][i], q);
      if (inv === null) return null;
      for (j = i; j <= n; j++) M[i][j] = mod(M[i][j] * inv, q);
      for (k = 0; k < n; k++) {
        if (k === i || M[k][i] === 0) continue;
        var f = M[k][i];
        for (j = i; j <= n; j++) M[k][j] = mod(M[k][j] - f * M[i][j], q);
      }
    }
    var x = [];
    for (i = 0; i < n; i++) x.push(M[i][n]);
    return x;
  }

  // ---- encryption ----------------------------------------------------------
  // Encrypt one bit under (A, t). The caller supplies the ephemeral randomness
  // r and the two error terms, so tests can pin down exact ciphertexts.
  //   u = Aᵀ·r + e1
  //   v = t·r  + e2 + m·floor(q/2)
  function encryptBit(A, t, m, r, e1, e2, q) {
    var u = addVec(matVec(transpose(A), r, q), e1, q);
    var v = mod(dot(t, r, q) + e2 + m * Math.floor(q / 2), q);
    return { u: u, v: v };
  }

  // Decrypt with the short secret s. The large term sᵀAᵀr appears in both v
  // and sᵀu and cancels, leaving m·floor(q/2) plus accumulated noise.
  // Returns the centered residual, the recovered bit, and the noise that
  // survived — so a page can show how much of the budget was spent.
  // Distance between two residues measured around the ring, not along the line:
  // 1 and q-1 are two apart, not q-2 apart.
  function ringDist(a, b, q) {
    var d = mod(a - b, q);
    return Math.min(d, q - d);
  }

  function decryptBit(u, v, s, q) {
    var raw = mod(v - dot(s, u, q), q);
    var half = Math.floor(q / 2);
    // Round to whichever ideal — 0 or floor(q/2) — is actually nearer in the
    // ring. A fixed |centered| > q/4 threshold is the usual shorthand, but with
    // an odd q the two ideals are not symmetrically spaced and the shorthand
    // misdecodes at the boundary. Measuring both distances is exact.
    var d0 = ringDist(raw, 0, q), d1 = ringDist(raw, half, q);
    var bit = d1 < d0 ? 1 : 0;
    var noise = center(raw - bit * half, q);
    return { raw: raw, centered: center(raw, q), bit: bit, noise: noise, d0: d0, d1: d1 };
  }

  // The safe bound: while the accumulated error stays STRICTLY below this,
  // decryption is guaranteed correct. At or above it, correctness depends on
  // which side of the ring the error fell — see the tests for the exact claim.
  function noiseBudget(q) {
    return Math.floor(q / 4);
  }

  // The error that actually accumulated, measured against the bit that was
  // SENT. decryptBit's own `noise` is measured against the bit it decoded, so
  // on a failure it reports a small number — correct for what it means, and
  // misleading if you read it as "how much noise was there". Callers that know
  // the true message should use this instead. For odd q, exact boundary
  // behavior also depends on the sent bit, noise direction and tie rule.
  function residualNoise(raw, m, q) {
    return center(raw - m * Math.floor(q / 2), q);
  }

  var api = {
    mod: mod,
    center: center,
    modInv: modInv,
    dot: dot,
    matVec: matVec,
    transpose: transpose,
    addVec: addVec,
    lweSample: lweSample,
    gaussianSolve: gaussianSolve,
    encryptBit: encryptBit,
    decryptBit: decryptBit,
    noiseBudget: noiseBudget,
    residualNoise: residualNoise,
    ringDist: ringDist
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LWEMath = api;

})(typeof self !== "undefined" ? self : this);
```
