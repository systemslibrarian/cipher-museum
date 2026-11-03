'use strict';
/* The Linear B specialist-review packet quotes the live site. A reviewer replies to those
 * quotes, so a quote that no longer matches the site would collect a review of text that is
 * not there. This fails when any quoted wording drifts, and when the case gains a
 * transliteration the packet does not list.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

const PACKET = 'docs/LINEAR_B_SPECIALIST_REVIEW.md';
const packet = fs.readFileSync(PACKET, 'utf8');
const norm = s => s.replace(/\s+/g, ' ').trim();

const cache = new Map();
function surfaceText(file) {
  if (!cache.has(file)) {
    const raw = fs.readFileSync(file, 'utf8');
    if (file.endsWith('.html')) {
      const doc = new JSDOM(raw).window.document;
      const metas = [...doc.querySelectorAll('meta[content]')].map(m => m.content).join(' ');
      cache.set(file, norm(doc.body.textContent + ' ' + metas));
    } else cache.set(file, norm(raw));
  }
  return cache.get(file);
}

// Each "Where:" line names one or more files; the quotes that follow must appear in one of them.
const lines = packet.split('\n');
let files = null, quote = [], checked = 0;
const flush = () => {
  if (!quote.length) return;
  const text = norm(quote.join(' '));
  assert.ok(files && files.length, 'Quote without a preceding Where line: ' + text.slice(0, 60));
  assert.ok(files.some(f => surfaceText(f).includes(text)),
    PACKET + ': quoted wording no longer matches ' + files.join(' or ') + ' — update the packet or the page: "' + text.slice(0, 90) + '"');
  checked++; quote = [];
};
for (const line of lines) {
  const where = /^\s*- \*\*Where:\*\*(.*)$/.exec(line);
  const q = /^\s*> ?(.*)$/.exec(line);
  if (where) { flush(); files = [...where[1].matchAll(/`([^`#]+)(?:#[^`]*)?`/g)].map(m => m[1]).filter(f => fs.existsSync(f)); }
  else if (q) quote.push(q[1]);
  else if (quote.length && (/^\s*$/.test(line) || /^\s*- \*\*/.test(line) || /^#/.test(line))) flush();
}
flush();
assert.ok(checked >= 12, 'Expected every claim to carry live wording; checked ' + checked);

// Every transliteration on the case must be listed for the reviewer.
const page = new JSDOM(fs.readFileSync('lab/decipherment-cases.html', 'utf8')).window.document;
const translits = new Set([...page.querySelectorAll('#linear-b em')].map(e => e.textContent.trim()).filter(t => /^[a-z]+(?:-[a-z]+)+$/.test(t)));
const listed = /\*\*Transliterations\.\*\*([^\n]*)/.exec(packet);
assert.ok(listed, 'The packet must list the transliterations up front');
for (const t of translits) assert.ok(listed[1].includes('*' + t + '*'), 'Transliteration on the page but not listed for the reviewer: ' + t);
assert.match(packet, /gives \*\*no sign values\*\*/, 'State explicitly that no sign values are given');
assert.doesNotMatch(page.getElementById('linear-b').innerHTML, /[\u{10000}-\u{100FF}]/u, 'The packet says no Linear B signs are shown; keep it true');

console.log('Linear B review packet: ' + checked + ' quoted passages match the live files; all ' + translits.size + ' transliterations listed; no sign values shown.');
