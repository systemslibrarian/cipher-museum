'use strict';
// Reading the Radio Log: model, wiring and prose guards for the invented
// traffic-analysis exercise. Each block names the acceptance point it protects.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const T = require('../js/traffic-analysis');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const PAGE = 'lab/traffic-analysis.html';
const RIGHT = { PX4: 'KR7', WQ8: 'MV2', NF6: 'TL5', GA1: 'DH9', HY2: 'ZB3' };
const TEMPTING = { PX4: 'KR7', WQ8: 'MV2', NF6: 'TL5', GA1: 'ZB3', HY2: 'unresolved' };

// 1. A network can be produced without decrypting anything: the log holds
// externals only, and the links come from the From/To columns alone.
const EXTERNALS = new Set(['id', 'day', 'time', 'khz', 'from', 'to', 'serial', 'ack', 'groups', 'note', 'hand', 'missing']);
for (const r of T.LOG) for (const k of Object.keys(r)) assert.ok(EXTERNALS.has(k), r.id + ' carries a non-external field "' + k + '": the log must never hold message content.');
assert.deepEqual([...T.observedLinks(1).keys()].sort(), ['DH9–KR7', 'KR7–MV2', 'KR7–TL5', 'KR7–ZB3', 'MV2–TL5']);
assert.deepEqual([...T.observedLinks(2).keys()].sort(), ['GA1–PX4', 'HY2–PX4', 'NF6–PX4', 'NF6–WQ8', 'PX4–WQ8']);
assert.deepEqual(T.partners(1).KR7, ['DH9', 'MV2', 'TL5', 'ZB3']);
assert.equal(T.possiblePairs(1).length, 10);
const cmp = T.compareLinks(1, ['DH9–KR7', 'DH9–ZB3']);
assert.deepEqual(cmp.confirmed.map(l => l.pair), ['DH9–KR7']);
assert.deepEqual(cmp.unsupported, ['DH9–ZB3']);
assert.equal(cmp.missed.length, 4);
assert.throws(() => T.compareLinks(1, ['KR7–PX4']), /pairs of callsigns/);
assert.throws(() => T.compareLinks(1, 'KR7–MV2'));

// 2. Uncertainty and missing observations stay visible. A partly read callsign
// is never merged into the nearest-looking station.
assert.ok(!T.heardCalls(1).includes('K?7') && T.heardCalls(1).length === 5, 'K?7 must stay apart from KR7');
assert.equal(T.partialRows(1).length, 1);
assert.ok(T.compareLinks(1, []).partial.some(r => r.to === 'K?7'));
assert.deepEqual(T.coverage(1), { watch: 12, lost: 2.5, covered: 9.5, gaps: T.GAPS.filter(g => g.day === 1) });
assert.equal(T.coverage(2).covered, 11);
const s1 = T.serials(1), s2 = T.serials(2);
assert.deepEqual([s1.MV2.inferred, s1.DH9.inferred, s1.KR7.inferred, s1.KR7.receiptOnly], [[4], [5], [4], [5]]);
assert.deepEqual([s2.NF6.inferred, s2.GA1.inferred], [[2], [3]]);
const missing = T.missingObservations().map(m => m.text).join('\n');
for (const needle of ['13:30–16:00', '10:00–11:00', 'K?7', 'DH9 number 5 not heard', 'KR7 number 5 never intercepted', 'Receipt for KR7 number 3', '4050 kHz carried traffic on Day 1; nothing was heard on it on Day 2', '4460 kHz'])
  assert.ok(missing.includes(needle), 'Missing observation not reported: ' + needle);

// 3. Volume is reported against coverage, and never as evidence of intent.
const v1 = T.volume(1), v2 = T.volume(2);
assert.deepEqual([v1.groups, v2.groups, v1.messages, v2.messages], [510, 607, 15, 15]);
assert.ok(v2.groups > v1.groups && Math.abs(v2.perHour - v1.perHour) < 2, 'The raw Day 2 rise must mostly reflect longer coverage');
const volumeClaim = T.STATEMENTS.find(s => /traffic rose/i.test(s.text));
assert.equal(volumeClaim.kind, 'unsupported', 'A rise in traffic must never be scored as evidence of attack preparation');
assert.match(volumeClaim.why, /coverage|listened longer/);
assert.match(volumeClaim.why, /not intention/);

// 4. Matching validation.
assert.throws(() => T.checkMatches({ ...RIGHT, GA1: '__proto__' }));
assert.throws(() => T.checkMatches({ PX4: 'KR7' }));
assert.throws(() => T.checkMatches({ ...RIGHT, KR7: 'KR7' }));
assert.throws(() => T.checkMatches(Object.assign(Object.create({ GA1: 'DH9' }), { PX4: 'KR7', WQ8: 'MV2', NF6: 'TL5', HY2: 'ZB3' })), /GA1/);

// 5. The plausible wrong match has observable consequences; the key's match has none.
const clueWrong = T.clues('GA1', 'ZB3'), clueRight = T.clues('GA1', 'DH9');
assert.deepEqual([clueWrong.frequency, clueWrong.schedule, clueWrong.role], [true, false, false], 'GA1 = ZB3 must be tempting on frequency alone');
assert.deepEqual([clueRight.frequency, clueRight.schedule, clueRight.role], [false, true, true]);
const bad = T.implications(TEMPTING, true), good = T.implications(RIGHT, true);
assert.ok(bad.pairs.find(p => p.day2 === 'GA1').roleChange, 'Receipt-only ZB3 becoming the busiest sender must be flagged');
assert.deepEqual(bad.unidentified, ['DH9']);
const phantom = bad.movements.find(m => m.day2 === 'GA1');
assert.equal(phantom.verdict, 'moved');
assert.ok(phantom.distance > 15 && phantom.distance > 2 * phantom.threshold, 'The phantom move must clearly exceed the fix uncertainty');
assert.equal(bad.chatter.status, 'tension');
assert.ok(!good.pairs.some(p => p.roleChange) && good.unidentified.length === 0);
assert.ok(good.movements.every(m => m.verdict !== 'moved'), 'The key matching must imply no movement beyond uncertainty');
assert.equal(good.chatter.status, 'consistent');
assert.equal(T.implications(TEMPTING, false).movements, undefined, 'Bearings must not leak into stage 1');
// Every alternative for GA1 that DF can test produces a visible move.
for (const c of T.heardCalls(1).filter(c => c !== 'DH9')) {
  const m = T.implications({ ...RIGHT, GA1: c }, true).movements.find(x => x.day2 === 'GA1');
  assert.equal(m.verdict, T.fixFor(1, c).kind === 'fix' ? 'moved' : 'untestable', 'GA1 = ' + c);
}
assert.ok(/narrows it/.test(T.implications({ ...RIGHT, GA1: 'unresolved' }, true).chatter.text));
assert.deepEqual(T.compareWithKey(RIGHT).map(r => r.verdict), Array(5).fill('agrees'));
assert.deepEqual(T.compareWithKey(TEMPTING).filter(r => r.verdict === 'differs').map(r => r.day2), ['GA1']);

// 6. Direction finding: a fix must reproduce the bearings it was computed from,
// and missing or single bearings must be reported, not interpolated.
const toDeg = (p, f) => (Math.atan2(f.x - p.x, f.y - p.y) * 180 / Math.PI + 360) % 360;
for (const day of [1, 2]) for (const c of T.heardCalls(day)) {
  const f = T.fixFor(day, c);
  if (f.kind === 'fix') for (const b of f.bearings) assert.ok(Math.abs(toDeg(T.POSTS[b.post], f) - b.deg) < 1e-9, day + ' ' + c);
  else assert.ok(f.reason, 'DF gap without a stated reason: Day ' + day + ' ' + c);
}
assert.deepEqual(['1:TL5', '2:NF6', '2:HY2'].map(k => T.fixFor(+k[0], k.slice(2)).kind), ['line', 'none', 'none']);

// 7. The headquarters idea stays a hypothesis whatever evidence arrives.
for (const c of T.heardCalls(1)) for (const m of [undefined, RIGHT, TEMPTING]) for (const st of [false, true]) {
  const h = T.assessHypothesis(c, m, st);
  assert.equal(h.status, 'hypothesis');
  assert.ok(h.doubt.length > 0, 'H1 must always carry at least one reason for doubt');
}
assert.ok(T.assessHypothesis('KR7', RIGHT, true).support.some(t => /behind them/.test(t)));
assert.ok(T.assessHypothesis('MV2', RIGHT, true).doubt.some(t => /never worked it/.test(t)));
const hqStatement = T.STATEMENTS.find(s => s.text === 'KR7 is a headquarters.');
assert.equal(hqStatement.kind, 'inference', 'The headquarters claim must never be scored as an observation');
assert.throws(() => T.checkStatements(['observed']));
assert.equal(T.checkStatements(T.STATEMENTS.map(s => s.kind)).filter(r => r.agrees).length, T.STATEMENTS.length);

// 8. Wiring: the page drives the same model and shows each consequence.
const html = read(PAGE);
const dom = new JSDOM(html, { runScripts: 'outside-only' }), doc = dom.window.document, w = dom.window;
T.mount(doc);
const $ = id => doc.getElementById(id);
const change = (node, v) => { node.value = v; node.dispatchEvent(new w.Event('change', { bubbles: true })); };
assert.equal($('ta-log-1').children.length, 19); assert.equal($('ta-log-2').children.length, 17);
assert.equal(doc.querySelectorAll('tr.ta-gap').length, 2);
const missingItems = $('ta-missing').children.length;
assert.equal(missingItems, T.missingObservations().length);
assert.match($('ta-volume').textContent, /510 in 9\.5 covered hours.*607 in 11 covered hours.*listened 1\.5 hours longer/);
for (const box of $('ta-pairs').querySelectorAll('input')) if (['KR7–MV2', 'DH9–ZB3'].includes(box.value)) { box.checked = true; box.dispatchEvent(new w.Event('change', { bubbles: true })); }
$('ta-pairs-check').click();
assert.match($('ta-pairs-result').textContent, /Nothing was decrypted/);
assert.match($('ta-pairs-result').textContent, /No row shows DH9–ZB3/);
assert.match($('ta-pairs-result').textContent, /Kept apart: the 12:40 row/);
assert.doesNotMatch($('ta-pairs-result').textContent, /d1-\d\d/, 'Feedback must cite visible times, not internal row ids');
assert.equal($('ta-network').querySelectorAll('.ta-edge-unsupported').length, 1);
assert.ok([...$('ta-network').querySelectorAll('text')].some(t => t.textContent === 'K?7'));
change($('ta-netcontrol'), 'KR7'); $('ta-hypothesis-record').click();
assert.match($('ta-hypothesis').textContent, /Status: hypothesis/);
assert.ok([...$('ta-network').querySelectorAll('text')].some(t => t.textContent === 'H1: hypothesis'));
$('ta-reveal').click();
assert.equal($('ta-stage2').hidden, true, 'Stage 2 must wait for recorded matches');
assert.match($('ta-reveal-status').textContent, /Record your Day 2 matches first/);
for (const [k, v] of Object.entries(TEMPTING)) change($('ta-match-' + k), v);
$('ta-match-record').click();
assert.match($('ta-consequences').textContent, /a station that sent receipts only now sends numbered messages/);
assert.match($('ta-consequences').textContent, /DH9 is not identified on Day 2/);
assert.doesNotMatch($('ta-consequences').textContent, /Implied move/, 'Stage 1 must not show bearings');
$('ta-reveal').click();
assert.equal($('ta-stage2').hidden, false); assert.equal($('ta-debrief').hidden, false);
assert.match($('ta-stage2-consequences').textContent, /Implied move: ZB3 → GA1 puts this station 20 km/);
assert.match($('ta-stage2-consequences').textContent, /Tension with ZB3/);
assert.equal($('ta-map').querySelectorAll('.ta-move').length, 1);
assert.match($('ta-key-compare').textContent, /GA1: you chose ZB3; the key says DH9/);
for (const [k, v] of Object.entries(RIGHT)) change($('ta-match-' + k), v);
$('ta-match-record').click();
assert.equal($('ta-map').querySelectorAll('.ta-move').length, 0, 'Correcting the match must remove the phantom move');
assert.doesNotMatch($('ta-stage2-consequences').textContent, /Implied move/);
assert.match($('ta-key-compare').textContent, /5 of 5 matches agree/);
assert.match($('ta-hypothesis').textContent, /behind them/);
assert.match($('ta-hypothesis').textContent, /Status: hypothesis/);
assert.equal($('ta-missing').children.length, missingItems, 'Missing observations must survive every step');
assert.equal($('ta-missing').closest('[hidden]'), null);
$('ta-statements-check').click(); assert.match($('ta-statements-result').textContent, /Classify every statement/);
T.STATEMENTS.forEach((s, i) => change($('ta-statement-' + i), s.kind));
$('ta-statements-check').click(); assert.match($('ta-statements-result').textContent, /8\/8 agree/);
$('ta-match-reset').click(); assert.equal($('ta-map').querySelectorAll('.ta-move').length, 0); assert.equal($('ta-match-PX4').value, '');
for (const control of doc.querySelectorAll('select, input')) assert.ok(doc.querySelector('label[for="' + control.id + '"]'), 'Unlabelled control ' + control.id);
dom.window.close();

// 9. Prose: fictional status, honest scale, sources, and no volume-to-intent claim.
const text = new JSDOM(html).window.document;
const visible = text.querySelector('main').textContent.replace(/\s+/g, ' ');
assert.match(text.querySelector('main > p').textContent, /^This log is fictional\./, 'The fictional label must open the page');
for (const meta of ['meta[name="description"]', 'meta[property="og:description"]']) assert.match(text.querySelector(meta).content, /fictional/);
assert.match(visible, new RegExp('This one has ' + T.LOG.length + ' rows'), 'Stated log size must match the data');
assert.doesNotMatch(visible, /(traffic|volume)[^.]{0,80}\b(proves?|proved|confirms?|establish(es)?|shows?)\b[^.]{0,40}\b(attack|intent|intention|offensive)\b/i, 'No sentence may let traffic volume prove intent');
assert.match(visible, /Volume is not intention/);
assert.ok(visible.includes('overnight move of about ' + Math.round(phantom.distance) + ' km'), 'Debrief distance must match the computed phantom move');
const links = [...text.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
for (const href of ['https://media.defense.gov/2021/Jul/13/2002761879/-1/-1/0/TRAFFIC_ANALYSIS.PDF', 'https://doi.org/10.7551/mitpress/5572.001.0001', 'https://cryptocellar.org/ActionContents.html', 'https://systemslibrarian.github.io/crypto-lab-blind-relay/#corr-h', '../tours/tour.html?tour=wartime', '../ciphers/station-hypo.html'])
  assert.ok(links.includes(href), 'Missing link ' + href);
assert.ok(!links.some(h => /drive\.google|docs\.google/.test(h)), 'Public credits must not expose private Drive copies');
for (const name of ['Borrmann', 'Diffie', 'Landau', 'Thirsk', 'log-reader']) assert.ok(visible.includes(name), 'Source not credited: ' + name);
assert.match(visible, /chapter 15 in Ralph Erskine and Michael Smith/);
assert.match(visible, /“the heart of a communications intelligence organization”[^.]*ch\. 4, p\. 102/, 'Diffie and Landau are cited from the book itself (open-access text), not from a secondary paraphrase');
assert.doesNotMatch(visible, /metadata leaks/i, 'Link to the specific correlation, not a generic warning');

// 10. The history route and modern bridge point back here.
const tour = JSON.parse(read('tours/wartime.json'));
const stop = tour.stops.find(s => s.href === '../lab/traffic-analysis.html');
assert.ok(stop, 'The Ciphers at War tour must include the exercise');
assert.match(stop.note, /invented/i);
assert.ok(read('ciphers/station-hypo.html').includes('href="../lab/traffic-analysis.html"'));
assert.ok(read('halls/codebreakers.html').includes('href="../lab/traffic-analysis.html"'));
const indexEntry = JSON.parse(read('js/search-index.json')).entries.find(e => e.u === PAGE);
assert.ok(indexEntry && /fictional/.test(indexEntry.s), 'Search index must carry the page and its fictional label');

// 11. Neighbouring cards keep codebreaking and traffic analysis apart, and keep HYPO's JN-25 work partial.
const cardTag = (file, href) => new JSDOM(read(file)).window.document.querySelector('.related-card[href="' + href + '"] .related-card__tag').textContent;
assert.doesNotMatch(cardTag('ciphers/station-hypo.html', '../ciphers/jn-25.html'), /HYPO broke/i, 'HYPO recovered JN-25 partially, alongside other Allied units, as its own page says');
assert.doesNotMatch(cardTag('ciphers/station-hypo.html', '../ciphers/purple.html'), /\bUS diplomatic\b/i, 'Purple was a Japanese diplomatic machine; MAGIC was the US name for intelligence from such decrypts');
for (const file of ['ciphers/station-hypo.html', 'ciphers/rochefort.html']) {
  const facts = new JSDOM(read(file)).window.document;
  const rows = [...facts.querySelectorAll('.fact, tr')].filter(r => /^\s*Key Break/.test(r.textContent));
  assert.equal(rows.length, 2, file + ': expected the summary fact and the Quick Facts row');
  for (const row of rows) assert.match(row.textContent, /partial/i, file + ': the Key Break summary must keep JN-25 recovery partial, as the page body does');
}
assert.doesNotMatch(cardTag('ciphers/jn-25.html', '../ciphers/lorenz.html'), /traffic analysis/i, 'Lorenz traffic was attacked by cryptanalysis; calling it traffic analysis blurs the distinction this exercise teaches');

console.log('Reading the Radio Log: externals-only network, kept-apart partial callsign, visible gaps, coverage-adjusted volume, tempting wrong match and its role/position/chatter consequences, DF self-consistency, hypothesis status, wiring, sources and history-route links passed.');
