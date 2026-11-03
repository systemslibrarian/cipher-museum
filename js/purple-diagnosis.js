(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.PurpleDiagnosis = api; api.mount(document); }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  // Synthetic worksheet data: one 26-letter alphabet and a fixed sequence of random
  // permutations, one per key position. Not Purple's 6-20 split or its stepping switches.
  // A starts at key position 0 and is a supplied crib. B's plaintext is an assumed crib whose
  // starting key position is unknown. C is enciphered from key position 2; its plaintext is
  // held out to test an alignment.
  const FIXTURE = {
    synthetic: true,
    A: { plain: 'CONVOYLEAVESATDUSK', cipher: 'LXPZGNELRSWRPCLPWB', start: 0 },
    B: { plain: 'WEATHERCLEARINNORTH', cipher: 'JKBAKLKZPDPDHOATCLA' },
    C: { cipher: 'IKBYPDRVDJJM', heldOutPlain: 'LEAVESATNOON', start: 2 }
  };
  const OFFSETS = Array.from({ length: 11 }, (_, i) => i);
  const MIN_ALIGNMENT_LETTERS = 2;

  // Pairs at each key position: A where it was supplied, B where the chosen offset puts it.
  function assemble(k, fx) {
    const f = fx || FIXTURE, positions = {};
    const add = (p, plain, cipher, source) => (positions[p] = positions[p] || []).push({ plain, cipher, source });
    [...f.A.plain].forEach((x, i) => add(f.A.start + i, x, f.A.cipher[i], 'A'));
    [...f.B.plain].forEach((x, j) => add(k + j, x, f.B.cipher[j], 'B'));
    const contradictions = [], agreements = [];
    for (const [p, list] of Object.entries(positions)) {
      const fwd = {}, back = {};
      for (const e of list) {
        if (fwd[e.plain] && fwd[e.plain] !== e.cipher) contradictions.push({ position: Number(p), plain: e.plain, ciphers: [fwd[e.plain], e.cipher] });
        if (back[e.cipher] && back[e.cipher] !== e.plain) contradictions.push({ position: Number(p), cipher: e.cipher, plains: [back[e.cipher], e.plain] });
        fwd[e.plain] = e.cipher; back[e.cipher] = e.plain;
      }
      const a = list.filter(e => e.source === 'A'), b = list.filter(e => e.source === 'B');
      for (const e of b) if (a.some(x => x.plain === e.plain && x.cipher === e.cipher)) agreements.push({ position: Number(p), plain: e.plain, cipher: e.cipher });
    }
    return { positions, contradictions, agreements };
  }

  // Read C through the inverse of each partial permutation. A letter read from a pair that A
  // supplied does not test the alignment; only pairs placed by the alignment do.
  function testC(k, fx) {
    const f = fx || FIXTURE, { positions } = assemble(k, f);
    const confirmed = [], mismatches = [];
    let reading = '';
    [...f.C.cipher].forEach((c, i) => {
      const list = positions[f.C.start + i] || [];
      const hit = list.find(e => e.cipher === c && e.source === 'A') || list.find(e => e.cipher === c);
      if (!hit) { reading += '?'; return; }
      reading += hit.plain;
      if (hit.plain === f.C.heldOutPlain[i]) confirmed.push({ index: i, letter: hit.plain, source: hit.source });
      else mismatches.push({ index: i, read: hit.plain, actual: f.C.heldOutPlain[i] });
    });
    return { reading, confirmed, mismatches };
  }

  function verdict(k, fx) {
    if (!fx && !OFFSETS.includes(k)) throw new Error('Offset must be between 0 and ' + OFFSETS[OFFSETS.length - 1] + '.');
    const a = assemble(k, fx), t = testC(k, fx);
    const fromAlignment = t.confirmed.filter(c => c.source === 'B').length;
    let status;
    if (a.contradictions.length) status = 'contradiction';
    else if (t.mismatches.length) status = 'wrong reading';
    else if (fromAlignment < MIN_ALIGNMENT_LETTERS) status = 'not confirmed';
    else status = 'supported';
    return { status, fromAlignment, unknown: (t.reading.match(/\?/g) || []).length, assembly: a, test: t };
  }

  function mount(doc) {
    const $ = id => doc.getElementById(id);
    if (!$('pd-offset')) return;
    const record = [];
    const renderRecord = () => {
      $('pd-record').replaceChildren(...record.map(r => { const li = doc.createElement('li'); li.textContent = r; return li; }));
      $('pd-record-empty').hidden = record.length > 0;
    };
    const renderTable = k => {
      const a = assemble(k), rows = Object.keys(a.positions).map(Number).sort((x, y) => x - y);
      $('pd-table').querySelector('tbody').replaceChildren(...rows.map(p => {
        const tr = doc.createElement('tr');
        const pairs = a.positions[p].map(e => e.plain + '→' + e.cipher + (e.source === 'A' ? ' (A, supplied)' : ' (B, your alignment)')).join('; ');
        const bad = a.contradictions.some(c => c.position === p), agree = a.agreements.some(g => g.position === p);
        for (const v of [String(p), pairs, bad ? 'contradiction' : agree ? 'A and B agree' : '']) { const td = doc.createElement('td'); td.textContent = v; tr.appendChild(td); }
        return tr;
      }));
      $('pd-align-result').textContent = a.contradictions.length
        ? 'This alignment contradicts the supplied pairs at key position ' + a.contradictions[0].position + '.'
        : 'No contradiction. A and B share ' + a.agreements.length + ' identical pair' + (a.agreements.length === 1 ? '' : 's') + ' at the same key positions.';
    };
    $('pd-align').addEventListener('click', () => renderTable(Number($('pd-offset').value)));
    $('pd-test').addEventListener('click', () => {
      const k = Number($('pd-offset').value), v = verdict(k), t = v.test;
      renderTable(k);
      $('pd-reading').textContent = 'Message C read with your partial permutations: ' + t.reading;
      $('pd-heldout-text').textContent = FIXTURE.C.heldOutPlain + '.';
      $('pd-heldout').hidden = false;
      const messages = {
        supported: 'Supported: no contradiction, and message C confirms ' + v.fromAlignment + ' letters that depend on your alignment. ' + v.unknown + ' letters stay unknown.',
        'not confirmed': 'Not confirmed: this alignment contradicts nothing, but message C confirms fewer than ' + MIN_ALIGNMENT_LETTERS + ' letters that depend on it.',
        contradiction: 'Contradiction: at key position ' + v.assembly.contradictions[0]?.position + ' this alignment would give one permutation two different values for the same letter.',
        'wrong reading': 'Wrong reading: message C reads ' + (t.mismatches[0] ? t.mismatches[0].read + ' where its held-out plaintext has ' + t.mismatches[0].actual : '') + '.'
      };
      $('pd-result').textContent = messages[v.status];
      const entry = 'Offset ' + k + ': ' + v.status + (v.status === 'supported' ? ' (' + v.fromAlignment + ' letters confirmed by C, ' + v.unknown + ' unknown)' : '') + '.';
      if (record[record.length - 1] !== entry) record.push(entry);
      renderRecord();
    });
    $('pd-reset').addEventListener('click', () => {
      $('pd-offset').value = '0'; $('pd-table').querySelector('tbody').replaceChildren();
      $('pd-align-result').textContent = ''; $('pd-reading').textContent = ''; $('pd-heldout').hidden = true;
      $('pd-result').textContent = 'Choose an offset for message B, align it, then test it on message C.';
    });
    renderRecord();
  }
  return { FIXTURE, OFFSETS, assemble, testC, verdict, mount };
});
