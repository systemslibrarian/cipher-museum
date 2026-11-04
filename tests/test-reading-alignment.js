'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.join(__dirname, '..');
const modelFile = process.env.READING_ALIGNMENT_MODEL || path.join(root, 'js/research-model.js');
const uiFile = process.env.READING_ALIGNMENT_UI || path.join(root, 'js/research-ui.js');
const R = require(modelFile), clone = value => JSON.parse(JSON.stringify(value));
let passed = 0;
function test(name, run) { run(); passed++; console.log('PASS ' + name); }
async function asyncTest(name, run) { await run(); passed++; console.log('PASS ' + name); }

// Deliberately tiny, original strings. Expected intervals below are counted by
// hand, including the astral symbol, spaces and line breaks; no aligner supplies
// either the links or their expected complements.
function example() {
  let d = R.addLayer(R.create('A😀B\nC D?'), 'normalized', 'revision-1',
    'One. Two.\nThree.\n[extra]', 'Invented comparison, not a translation claim.');
  d = R.addAlignment(d, { source: 'revision-1', target: 'layer-1',
    sourceRanges: [{ start: 0, end: 3 }],
    targetRanges: [{ start: 5, end: 9 }, { start: 0, end: 4 }],
    note: 'One source passage is split into two reading passages.' });
  return R.addAlignment(d, { source: 'revision-1', target: 'layer-1',
    sourceRanges: [{ start: 4, end: 5 }, { start: 6, end: 7 }],
    targetRanges: [{ start: 10, end: 16 }],
    note: 'Two source passages are combined. <img src=x onerror=alert(1)>' });
}
function ranges(values) { return values.map(({ start, end, literal }) => ({ start, end, literal })); }

test('legacy version 2 records gain an empty collection without losing evidence', () => {
  const old = R.create('unchanged'); delete old.alignments;
  const restored = R.migrate(old);
  assert.deepEqual(restored.alignments, []); assert.equal(restored.raw, 'unchanged');
  const malformed = clone(old); malformed.alignments = null;
  assert.throws(() => R.migrate(malformed), /alignment/i);
});

test('empty alignment metadata preserves fingerprints recorded by the earlier model', () => {
  const b = R.bundle(R.create('A B'), { title: 'Before passage alignment', created: '2026-11-04',
    scoringModel: 'museum-prose-quadgram-v1', solver: 'annealing',
    search: { raw: 'a b a', seed: 0, steps: 17, locks: { a: 'A' } },
    candidates: [{ plaintext: 'ANA', score: -1, key: { a: 'A', b: 'N' }, provenance: 'Original result' }] });
  // Captured from c7b77a4 before this feature was added, not recalculated as an oracle.
  assert.equal(b.sourceFingerprint, '6a4c2d9914ccc165');
  assert.equal(b.search.configurationFingerprint, '3428db9040d5e42f');
  delete b.evidence.alignments;
  const restored = R.openBundle(b);
  assert.equal(restored.stale.source, false); assert.equal(restored.stale.search, false);
  assert.equal(restored.stale.candidates, false);
});

test('split and combined passages retain exact text, stable IDs and Unicode positions', () => {
  const d = example(), before = JSON.stringify(d), view = R.alignmentView(d, 'revision-1', 'layer-1');
  assert.equal(view.source.text, 'A😀B\nC D?'); assert.equal(view.target.text, 'One. Two.\nThree.\n[extra]');
  assert.equal(view.source.length, 8); assert.equal(view.target.length, 24);
  assert.deepEqual(d.alignments.map(a => a.id), ['alignment-1', 'alignment-2']);
  assert.equal(d.alignments[0].sourceRanges[0].id, 'alignment-1-source-1');
  assert.equal(d.alignments[0].sourceRanges[0].literal, 'A😀B');
  assert.deepEqual(d.alignments[0].targetRanges.map(r => r.literal), ['One.', 'Two.']);
  assert.deepEqual(d.alignments[1].sourceRanges.map(r => r.literal), ['C', 'D']);
  assert.deepEqual(view.links.map(a => [a.sourceRanges.length, a.targetRanges.length]), [[1, 2], [2, 1]]);
  assert.equal(JSON.stringify(d), before, 'creating a comparison cannot rewrite its record');
});

test('every unmatched character remains visible, including whitespace and editorial additions', () => {
  const view = R.alignmentView(example(), 'revision-1', 'layer-1');
  assert.deepEqual(ranges(view.sourceUnmatched), [
    { start: 3, end: 4, literal: '\n' }, { start: 5, end: 6, literal: ' ' }, { start: 7, end: 8, literal: '?' }
  ]);
  assert.deepEqual(ranges(view.targetUnmatched), [
    { start: 4, end: 5, literal: ' ' }, { start: 9, end: 10, literal: '\n' },
    { start: 16, end: 24, literal: '\n[extra]' }
  ]);
  const reverse = R.alignmentView(example(), 'layer-1', 'revision-1');
  assert.deepEqual(ranges(reverse.sourceUnmatched), ranges(view.targetUnmatched));
  assert.deepEqual(reverse.links.map(a => [a.sourceRanges.length, a.targetRanges.length]), [[2, 1], [1, 2]]);
  assert.equal(reverse.links[0].reversed, true);
});

test('no links means full texts are unlinked; empty readings are handled explicitly', () => {
  let d = R.addLayer(R.create('A\nB'), 'translation', 'revision-1', 'X', 'Original test fixture');
  assert.deepEqual(ranges(R.alignmentView(d, 'revision-1', 'layer-1').sourceUnmatched), [{ start: 0, end: 3, literal: 'A\nB' }]);
  d = R.addLayer(d, 'translation', 'revision-1', '', 'No reading proposed');
  assert.deepEqual(R.alignmentView(d, 'revision-1', 'layer-2').targetUnmatched, []);
  assert.throws(() => R.alignmentView(d, 'revision-1', 'absent'), /reading|reference/i);
  assert.throws(() => R.alignmentView(d, 'revision-1', 'revision-1'), /different/i);
});

test('combining marks are separate recorded code points and are not silently normalized', () => {
  let d = R.addLayer(R.create('e\u0301X'), 'normalized', 'revision-1', 'éX', 'Explicit composed-character interpretation');
  d = R.addAlignment(d, { source: 'revision-1', target: 'layer-1', sourceRanges: [{ start: 0, end: 2 }],
    targetRanges: [{ start: 0, end: 1 }], note: 'Two recorded code points correspond to one composed code point.' });
  assert.equal(d.raw, 'e\u0301X'); assert.equal(d.alignments[0].sourceRanges[0].literal, 'e\u0301');
  const view = R.alignmentView(d, 'revision-1', 'layer-1');
  assert.equal(view.source.length, 3); assert.equal(view.target.length, 2);
  assert.deepEqual(ranges(view.sourceUnmatched), [{ start: 2, end: 3, literal: 'X' }]);
});

test('overlapping hypotheses use interval unions without hiding the unlinked remainder', () => {
  let d = example();
  d = R.addAlignment(d, { source: 'revision-1', target: 'layer-1',
    sourceRanges: [{ start: 1, end: 5 }], targetRanges: [{ start: 0, end: 9 }], note: 'An overlapping alternative, not a certified match.' });
  assert.deepEqual(ranges(R.alignmentView(d, 'revision-1', 'layer-1').sourceUnmatched), [
    { start: 5, end: 6, literal: ' ' }, { start: 7, end: 8, literal: '?' }
  ]);
});

test('bad ranges, empty groups and silent text changes are rejected', () => {
  const d = example();
  for (const sourceRanges of [[], [{ start: -1, end: 1 }], [{ start: .5, end: 2 }],
    [{ start: 0, end: 0 }], [{ start: 0, end: 9 }], [{ start: 0, end: 3 }, { start: 2, end: 4 }]]) {
    assert.throws(() => R.addAlignment(d, { source: 'revision-1', target: 'layer-1', sourceRanges,
      targetRanges: [{ start: 0, end: 1 }], note: 'Invalid control' }), /range|passage|overlap|start|end/i);
  }
  const changed = clone(d); changed.layers[0].text = 'Xne. Two.\nThree.\n[extra]';
  assert.throws(() => R.validate(changed), /match.*reading|reading.*match|literal/i);
  const altered = clone(d); altered.alignments[0].sourceRanges[0].literal = 'ABC';
  assert.throws(() => R.validate(altered), /match.*reading|reading.*match|literal/i);
  const badId = clone(d); badId.alignments[0].sourceRanges[0].id = 'span-1';
  assert.throws(() => R.validate(badId), /ID|identifier/i);
  const duplicate = clone(d); duplicate.alignments.push(clone(duplicate.alignments[0]));
  assert.throws(() => R.validate(duplicate), /duplicate/i);
  assert.throws(() => R.addAlignment(d, { source: 'revision-1', target: 'layer-1',
    sourceRanges: [{ start: 0, end: 1 }], targetRanges: [{ start: 0, end: 1 }], note: ' ' }), /reason|note|evidence/i);
});

test('withdrawal retains the link and its reason while removing it from active coverage', () => {
  const d = example();
  assert.throws(() => R.withdrawAlignment(d, 'alignment-1', ''), /reason/i);
  const revised = R.withdrawAlignment(d, 'alignment-1', 'The proposed split was unsupported.');
  assert.equal(d.alignments[0].withdrawal, null, 'the previous document is not mutated');
  assert.deepEqual(revised.alignments[0].sourceRanges, d.alignments[0].sourceRanges);
  assert.equal(revised.alignments[0].withdrawal.reason, 'The proposed split was unsupported.');
  const view = R.alignmentView(revised, 'revision-1', 'layer-1');
  assert.equal(view.links.length, 1); assert.equal(view.withdrawn.length, 1);
  assert.equal(view.sourceUnmatched[0].literal, 'A😀B\n');
  assert.throws(() => R.withdrawAlignment(revised, 'alignment-1', 'Again'), /already/i);
});

test('a new source revision cannot move old links or accept a cross-revision link', () => {
  const d = example(), revised = R.addLayer(R.revise(d, 'A😀B\nC E?', 'Reread D as E'),
    'normalized', 'revision-2', 'New reading', 'A new interpretation of revision 2');
  const old = R.alignmentView(revised, 'revision-1', 'layer-1');
  assert.equal(old.current, false); assert.equal(old.source.text, d.raw);
  assert.deepEqual(revised.alignments, d.alignments);
  assert.throws(() => R.addAlignment(revised, { source: 'revision-1', target: 'layer-1',
    sourceRanges: [{ start: 0, end: 1 }], targetRanges: [{ start: 0, end: 1 }], note: 'Old revision' }), /current.*revision/i);
  assert.throws(() => R.alignmentView(revised, 'revision-2', 'layer-1'), /same.*revision/i);
  const forged = clone(revised); forged.alignments[0].revision = 2;
  assert.throws(() => R.validate(forged), /revision/i);
});

test('evidence and investigation round trips retain links and detect changed link evidence', () => {
  const d = example(), b = R.bundle(d, { search: { raw: 'a b a', seed: 0, steps: 17, locks: { a: 'A' } } });
  assert.deepEqual(R.migrate(clone(d)), d);
  assert.deepEqual(R.openBundle(clone(b)).evidence.alignments, d.alignments);
  const changed = clone(b); changed.evidence.alignments[0].note = 'A different explanation';
  const stale = R.openBundle(changed);
  assert.equal(stale.stale.source, true); assert.equal(stale.stale.search, true);
});

function browser() {
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'lab/evidence-workbench.html'), 'utf8'),
    { url: 'https://ciphermuseum.com/lab/evidence-workbench.html', runScripts: 'outside-only' });
  const w = dom.window, $ = id => w.document.getElementById(id), downloads = [];
  w.fetch = undefined;
  w.Blob = class { constructor(parts) { this.parts = parts; } };
  w.URL.createObjectURL = blob => { downloads.push(JSON.parse(blob.parts.join(''))); return 'blob:alignment-test'; };
  w.URL.revokeObjectURL = () => {};
  w.document.addEventListener('click', e => { if (e.target.tagName === 'A') e.preventDefault(); });
  w.eval(fs.readFileSync(modelFile, 'utf8'));
  w.eval(fs.readFileSync(path.join(root, 'js/detective/lang-model.js'), 'utf8'));
  w.eval(fs.readFileSync(uiFile, 'utf8'));
  const importRecord = async record => {
    const text = JSON.stringify(record);
    Object.defineProperty($('import-file'), 'files', { configurable: true, value: [{ size: text.length, text: async () => text }] });
    await $('import-file').onchange();
  };
  const exported = () => { $('export-record').click(); return downloads.at(-1); };
  return { dom, w, $, downloads, importRecord, exported };
}

async function main() {
  const b = browser(), { $, w } = b;
  try {
    await b.importRecord(example());
    test('real UI shows complete readings, grouped links, safe notes and both unmatched lists', () => {
      assert.equal($('alignment-source-text').value, 'A😀B\nC D?');
      assert.equal($('alignment-target-text').value, 'One. Two.\nThree.\n[extra]');
      assert.equal($('alignment-list').querySelectorAll('.alignment-link').length, 2);
      assert.match($('alignment-source-unmatched').textContent, /\?/);
      assert.match($('alignment-target-unmatched').textContent, /\[extra\]/);
      assert.equal($('alignment-list').querySelector('img'), null);
      assert.match($('alignment-list').textContent, /1 source passage.*2 reading passages/);
      assert.match($('alignment-list').textContent, /2 source passages.*1 reading passage/);
    });
    test('selecting astral text in the real textarea yields code-point positions', () => {
      $('alignment-source-text').setSelectionRange(0, 4); // A + surrogate pair + B.
      $('alignment-source-select').click();
      assert.equal($('alignment-source-ranges').value, '1–3');
    });
    test('manual link and withdrawal controls really update the exported record', () => {
      $('alignment-source-ranges').value = '8'; $('alignment-target-ranges').value = '18–24';
      $('alignment-note').value = 'Proposed association for the final mark.'; $('alignment-add').click();
      assert.equal(b.exported().alignments.length, 3);
      $('alignment-withdraw-id').value = 'alignment-3'; $('alignment-withdraw-reason').value = 'The editorial addition has no source counterpart.';
      $('alignment-withdraw').click();
      const saved = b.exported();
      assert.equal(saved.alignments[2].withdrawal.reason, 'The editorial addition has no source counterpart.');
      assert.match($('alignment-history').textContent, /alignment-3/);
      assert.match($('alignment-target-unmatched').textContent, /\[extra\]/);
      assert.equal(saved.raw, 'A😀B\nC D?');
      $('bundle-export').click();
      assert.deepEqual(b.downloads.at(-1).evidence.alignments, saved.alignments);
    });
    test('invalid ranges and unsaved source changes cannot create misleading links', () => {
      $('alignment-source-ranges').value = '1–3, 2–4'; $('alignment-target-ranges').value = '1';
      $('alignment-note').value = 'Invalid overlapping ranges'; $('alignment-add').click();
      assert.equal($('alignment-status').dataset.error, 'true'); assert.equal(b.exported().alignments.length, 3);
      $('source-raw').value = 'Changed source'; $('alignment-source-ranges').value = '1'; $('alignment-add').click();
      assert.match($('alignment-status').textContent, /Save.*source/i);
      $('alignment-withdraw-reason').value = 'An unsaved correction'; $('alignment-withdraw').click();
      assert.match($('alignment-status').textContent, /Save.*source/i);
      assert.equal($('source-raw').value, 'Changed source', 'withdrawing a link cannot discard an unsaved transcription');
      $('revision-reason').value = 'A different transcription'; $('save-revision').click();
      assert.match($('alignment-status').textContent, /earlier.*revision 1/i);
      assert.equal($('alignment-add').disabled, true);
      assert.equal(b.exported().alignments[0].revision, 1);
    });
    test('supplied example demonstrates split, combined and unlinked passages without a historical claim', () => {
      $('alignment-example').click();
      const saved = b.exported();
      assert.equal(saved.raw, 'Sende bread and wine.\nWait here. Keep watch.\n[margin: torn seal]');
      assert.equal(saved.layers[0].text, 'Send bread.\nSend wine.\nWait here and keep watch.\n[editor: place uncertain]');
      assert.deepEqual(saved.alignments.map(a => [a.sourceRanges.length, a.targetRanges.length]), [[1, 2], [2, 1]]);
      assert.match($('alignment-source-unmatched').textContent, /torn seal/);
      assert.match($('alignment-target-unmatched').textContent, /place uncertain/);
      assert.match(w.document.getElementById('reading-alignment').textContent, /original teaching example/i);
      assert.ok(w.document.querySelector('a[href="https://aclanthology.org/2025.ranlp-1.55/"]'));
    });
    const saved = b.exported(); await b.importRecord(saved);
    test('real import/export keeps passage history and original text unchanged', () => {
      assert.deepEqual(b.exported().alignments, saved.alignments);
      assert.equal($('alignment-source-text').value, saved.raw);
      assert.equal($('alignment-target-text').value, saved.layers[0].text);
    });
    const crlf = R.addLayer(R.create('A\r\nB😀C'), 'normalized', 'revision-1', 'X\r\nY', 'CRLF selection control');
    await b.importRecord(crlf);
    test('CRLF display normalization cannot shift ranges or change imported source bytes', () => {
      assert.equal($('alignment-source-text').value, 'A\nB😀C', 'textarea has the browser-normalized display');
      assert.equal(b.exported().raw, 'A\r\nB😀C', 'unchanged save/export retains the original CRLF');
      assert.equal(b.exported().layers[0].text, 'X\r\nY');
      $('alignment-source-text').setSelectionRange(2, 5); $('alignment-source-select').click();
      $('alignment-target-text').setSelectionRange(2, 3); $('alignment-target-select').click();
      assert.equal($('alignment-source-ranges').value, '4–5');
      assert.equal($('alignment-target-ranges').value, '4–4');
      $('alignment-note').value = 'Selection is mapped to the recorded CRLF and astral characters.'; $('alignment-add').click();
      let saved = b.exported();
      assert.equal(saved.alignments[0].sourceRanges[0].literal, 'B😀');
      assert.equal(saved.alignments[0].sourceRanges[0].start, 3);
      assert.equal(saved.raw, 'A\r\nB😀C');
      $('alignment-list').querySelector('button').click();
      assert.equal($('alignment-source-text').selectionStart, 2); assert.equal($('alignment-source-text').selectionEnd, 5);
      $('alignment-source-text').setSelectionRange(1, 2); $('alignment-source-select').click();
      assert.equal($('alignment-source-ranges').value, '2–3', 'one displayed CRLF line break covers both recorded code points');
      $('source-raw').setSelectionRange(2, 5); $('select-span').click();
      assert.equal($('span-start').value, '4'); assert.equal($('span-end').value, '5');
      $('add-span').click(); saved = b.exported();
      assert.equal(saved.spans[0].literal, 'B😀'); assert.equal(saved.raw, crlf.raw);
      $('alignment-source-text').setSelectionRange(3, 4); $('alignment-source-select').click();
      assert.match($('alignment-status').textContent, /whole Unicode characters/);
    });
    const firstRecord = R.addLayer(R.create('AAAA'), 'normalized', 'revision-1', 'BBBB', 'First fixture');
    const secondRecord = R.addLayer(R.create('ZZZZ'), 'normalized', 'revision-1', 'YYYY', 'Different fixture, same generic IDs');
    function draft(note = 'First A corresponds to first B.') {
      $('alignment-source-ranges').value = '1'; $('alignment-target-ranges').value = '1';
      $('alignment-note').value = note; $('alignment-withdraw-reason').value = 'An unrecorded withdrawal reason';
    }
    function draftsAreClear() {
      for (const id of ['alignment-source-ranges', 'alignment-target-ranges', 'alignment-note', 'alignment-withdraw-reason']) assert.equal($(id).value, '', id + ' must not cross record contexts');
    }
    async function importBundle(record) {
      const text = JSON.stringify(R.bundle(record, { title: 'Imported investigation' }));
      Object.defineProperty($('bundle-import'), 'files', { configurable: true, value: [{ size: text.length, text: async () => text }] });
      await $('bundle-import').onchange();
    }
    await asyncTest('evidence imports clear drafts even when generic IDs or all text are unchanged', async () => {
      await b.importRecord(firstRecord); draft(); await b.importRecord(secondRecord);
      draftsAreClear(); assert.equal($('alignment-source-text').value, 'ZZZZ');
      $('alignment-add').click(); assert.equal(b.exported().alignments.length, 0, 'an old note cannot be attached to the newly imported text');
      draft('A fresh draft in the second record'); await b.importRecord(secondRecord); draftsAreClear();
    });
    await asyncTest('investigation imports clear drafts before restoring a different or identical evidence record', async () => {
      await b.importRecord(firstRecord); draft(); await importBundle(secondRecord); draftsAreClear();
      assert.equal($('alignment-target-text').value, 'YYYY');
      draft('Second-record draft'); await importBundle(secondRecord); draftsAreClear();
    });
    await asyncTest('Restore previous record clears drafts for different and identical saved records', async () => {
      await b.importRecord(firstRecord); await b.importRecord(secondRecord); draft('Z corresponds to Y');
      $('restore-record').click(); draftsAreClear(); assert.equal($('alignment-source-text').value, 'AAAA');
      b.exported(); draft(); $('restore-record').click(); draftsAreClear();
    });
    await asyncTest('saving a changed source context clears passage drafts without changing existing links', async () => {
      await b.importRecord(firstRecord); draft(); $('source-shelfmark').value = 'A different catalogue identity';
      $('save-revision').click(); draftsAreClear(); assert.equal(b.exported().source.shelfmark, 'A different catalogue identity');
      draft(); $('source-raw').value = 'CCCC'; $('revision-reason').value = 'Changed recorded reading';
      $('save-revision').click(); draftsAreClear(); assert.equal(b.exported().revision, 2);
    });
    await asyncTest('alignment add and withdrawal preserve unsaved source metadata and require it to be saved', async () => {
      await b.importRecord(firstRecord); draft(); $('source-shelfmark').value = 'New catalogue shelfmark';
      $('alignment-add').click();
      assert.equal($('source-shelfmark').value, 'New catalogue shelfmark');
      assert.match($('alignment-status').textContent, /Save.*metadata/i);
      assert.equal($('alignment-list').querySelectorAll('.alignment-link').length, 0);
      $('save-revision').click(); draftsAreClear(); draft(); $('alignment-add').click();
      assert.equal(b.exported().source.shelfmark, 'New catalogue shelfmark');
      assert.equal($('alignment-list').querySelectorAll('.alignment-link').length, 1);
      $('source-archive').value = 'Revised holding institution'; $('alignment-withdraw-id').value = 'alignment-1';
      $('alignment-withdraw-reason').value = 'A proposed correction'; $('alignment-withdraw').click();
      assert.equal($('source-archive').value, 'Revised holding institution');
      assert.match($('alignment-status').textContent, /Save.*metadata/i);
      assert.equal($('alignment-list').querySelectorAll('.alignment-link').length, 1);
      $('save-revision').click(); $('alignment-withdraw-reason').value = 'A proposed correction'; $('alignment-withdraw').click();
      const saved = b.exported(); assert.equal(saved.source.archive, 'Revised holding institution');
      assert.equal(saved.alignments[0].withdrawal.reason, 'A proposed correction');
    });
    await asyncTest('sanitized metadata displays are not mistaken for edits and retain their imported values', async () => {
      const record = clone(crlf); record.source.shelfmark = 'Shelf\r\nmark'; record.source.url = '  https://example.org/record  ';
      await b.importRecord(record);
      assert.equal($('source-shelfmark').value, 'Shelfmark'); assert.equal($('source-url').value, 'https://example.org/record');
      draft('A corresponds to X in this control'); $('alignment-add').click();
      assert.equal($('alignment-list').querySelectorAll('.alignment-link').length, 1, 'unchanged sanitized fields must not block the action');
      const saved = b.exported();
      assert.equal(saved.raw, 'A\r\nB😀C'); assert.equal(saved.source.shelfmark, 'Shelf\r\nmark');
      assert.equal(saved.source.url, '  https://example.org/record  ');
    });
  } finally { b.dom.window.close(); }
  console.log('Reading alignment: ' + passed + ' model, compatibility, failure-control and DOM checks passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
