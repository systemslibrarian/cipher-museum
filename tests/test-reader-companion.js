'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

async function main() {
  const dom = new JSDOM(read('sealed-letter.html'), { url: 'https://ciphermuseum.com/sealed-letter.html', runScripts: 'outside-only' });
  const { window } = dom;
  const doc = window.document;
  const $ = id => doc.getElementById(id);
  const submit = id => $(id).dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  try {
    // Solve the actual visible clues, independently of the checker’s answer.
    const key = Object.fromEntries([...doc.querySelector('#slip-1 .key').textContent.matchAll(/(\d{2}) = ([A-Z]+)/g)].map(m => [m[1], m[2]]));
    const first = doc.querySelector('#slip-1 .cipher-strip').textContent.trim().split(/\s+/).map(n => key[n]).join('');
    assert.equal(first, 'COMPARE');
    const rows = [...doc.querySelectorAll('#slip-2 tr')].map(row => [...row.cells].map(c => c.textContent));
    const second = rows[0].map((_, i) => rows.map(row => row[i]).join('')).join('');
    assert.equal(second, 'THECOPIES');
    const strips = [...doc.querySelectorAll('#slip-3 .number-strips p')].slice(1).map(p => p.textContent.split(':')[1].trim().split(/\s+/).map(Number));
    const third = strips[2].map((v, i) => String.fromCharCode(64 + v - (strips[1][i] - strips[0][i]))).join('');
    assert.equal(third, 'BEFORE');
    const fourth = doc.querySelector('#slip-4 .cipher-strip').textContent.replace(/[^A-Z]/g, '');
    assert.equal(fourth, 'YOUTRUSTTHEM');
    window.eval(read('js/reader-companion.js'));
    assert.equal($('investigation').hidden, true);
    for (const wrong of ['COMPARE THE COPIES', 'COMPARE THE COPIES BEFORE YOU TRUST THEM 123', '<script>bad</script>']) {
      $('instruction').value = wrong; submit('unlock-form');
      assert.equal($('investigation').hidden, true, 'Wrong or incomplete instructions must not pass');
    }
    $('instruction').value = [first, second, third, fourth].join(' — ').toLowerCase();
    submit('unlock-form');
    assert.equal($('investigation').hidden, false);
    assert.equal(doc.activeElement.id, 'case-title');
    assert.equal($('copies-panel').hidden, true, 'Reading comes before comparing');
    doc.querySelector('[value="room"]').checked = true; submit('compare-form');
    assert.equal($('source-panel').hidden, true, 'Hidden stages cannot skip the dispatch');
    doc.querySelector('[value="evidence"]').checked = true; submit('verdict-form');
    assert.equal($('finding').hidden, true, 'A forged submit cannot skip the evidence stage');
    const codebook = Object.fromEntries([...doc.querySelectorAll('#dispatch-key [data-code]')].map(el => [el.dataset.code, el.textContent.trim()]));
    const decoded = $('dispatch-cipher').textContent.match(/\d{2}/g).map(code => codebook[code]).join(' ');
    assert.equal(decoded, 'MOVE THE SEALED CASE TO ROOM FOUR AT NINE KEEP BOTH KEYS WITH ELLIS');
    assert.equal(decoded, $('retained-message').textContent.replace(/[.]/g, ''));
    for (const wrong of ['five', '9', 'four 123', '<script>four</script>']) {
      $('dispatch-room').value = wrong; submit('decode-form');
      assert.equal($('copies-panel').hidden, true, 'An incorrect room does not unlock the copies');
    }
    $('dispatch-room').value = 'room 4'; submit('decode-form');
    assert.equal($('copies-panel').hidden, false);
    assert.equal(doc.activeElement.id, 'copies-title');
    doc.querySelector('[value="time"]').checked = true; submit('compare-form');
    assert.equal($('verdict-form').hidden, true);
    doc.querySelector('[value="room"]').checked = true; submit('compare-form');
    assert.equal($('source-panel').hidden, false);
    assert.equal($('verdict-form').hidden, true, 'Comparison alone does not supply corroboration');
    assert.equal(doc.querySelectorAll('mark.revealed').length, 2);
    for (const wrong of ['keys', 'rumour']) {
      doc.querySelector('input[name="source"][value="'+wrong+'"]').checked = true; submit('source-form');
      assert.equal($('register-record').hidden, true);
      assert.equal($('verdict-form').hidden, true);
    }
    doc.querySelector('input[name="source"][value="register"]').checked = true; submit('source-form');
    assert.equal($('register-record').hidden, false);
    assert.equal($('verdict-form').hidden, false);
    assert.equal(doc.activeElement.id, 'register-record');
    for (const wrong of ['theft', 'clerk', 'nothing']) {
      doc.querySelector('[value="'+wrong+'"]').checked = true; submit('verdict-form');
      assert.equal($('finding').hidden, true);
      assert.ok($('verdict-feedback').textContent.length > 30);
    }
    doc.querySelector('[value="evidence"]').checked = true; submit('verdict-form');
    assert.equal($('finding').hidden, false);
    assert.equal(doc.activeElement.id, 'finding-title');
    $('share-finding').click();
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal($('share-copy').hidden, false, 'Clipboard unavailable has a working fallback');
    assert.ok(!$('share-copy').value.includes('COMPARE'));
    let copied = '';
    Object.defineProperty(window.navigator, 'clipboard', { value: { writeText: async text => { copied = text; } }, configurable: true });
    $('share-finding').click();
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.match(copied, /https:\/\/ciphermuseum.com\/sealed-letter.html/);
    assert.match($('share-feedback').textContent, /Copied/);
    submit('playtest-form');
    assert.equal($('playtest-feedback').textContent, '', 'Incomplete playtest forms do not copy notes');
    $('playtest-hardest').value = 'Choosing another source';
    $('playtest-again').value = 'Yes';
    $('playtest-note').value = '<img src=x onerror=alert(1)> The register was helpful.';
    submit('playtest-form');
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.match(copied, /Would try another case: Yes/);
    assert.match(copied, /Entry: Four book slips/);
    assert.match(copied, /The register was helpful/);
    assert.equal(doc.querySelectorAll('img[src=x]').length, 0, 'Playtest text is never injected as markup');
    Object.defineProperty(window.navigator, 'clipboard', { value: undefined, configurable: true });
    submit('playtest-form');
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal($('playtest-copy').hidden, false);
    assert.match($('playtest-copy').value, /Case completed: yes/);
    $('restart-case').click();
    for (const id of ['copies-panel', 'source-panel', 'register-record', 'verdict-form', 'finding']) assert.equal($(id).hidden, true, 'Restart closes '+id);
    assert.equal(doc.querySelectorAll('mark.revealed').length, 0);
    assert.equal(doc.querySelector('[aria-current="step"]').dataset.step, '1');
    $('reveal-dispatch').click();
    assert.equal($('copies-panel').hidden, false, 'Readers can continue after an answer reveal');
    for (const page of ['sealed-letter.html', 'the-book.html']) {
      const p = new JSDOM(read(page)).window.document;
      assert.equal(p.querySelectorAll('h1').length, 1);
      for (const el of p.querySelectorAll('[href], [src]')) {
        const value = el.getAttribute('href') || el.getAttribute('src');
        if (/^(https?:|mailto:|#)/.test(value)) continue;
        assert.ok(fs.existsSync(path.join(__dirname, '..', value.split('#')[0])), page+': '+value);
      }
      for (const img of p.images) assert.ok(img.alt);
    }
    const direct = new JSDOM(read('sealed-letter.html'), { runScripts: 'outside-only' });
    try {
      direct.window.eval(read('js/reader-companion.js'));
      direct.window.document.getElementById('start-case').click();
      assert.equal(direct.window.document.getElementById('investigation').hidden, false, 'A visitor can start without the book slips');
    } finally { direct.window.close(); }
    console.log('Reader companion: book clues, dispatch, stage guards, evidence choices, finding, restart, feedback and clipboard fallbacks passed.');
  } finally { window.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
