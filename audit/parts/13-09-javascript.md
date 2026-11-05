# javascript appendix 9

Snapshot: `ccc02443d89ec2c2d9c8d6ef538bbbaf40225aa4`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

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


## JavaScript — js/working-not-secure.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/working-not-secure.js`
- Served SHA-256: `cbb9852d8c1d24e30cca524dda1590a7d75e1974f85a51d6595d6c92e50c1c05`
- Readable-source SHA-256: `cbb9852d8c1d24e30cca524dda1590a7d75e1974f85a51d6595d6c92e50c1c05`


```javascript
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.WorkingNotSecure = api; api.mount(document); }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // An original message and a fixed substitution key, both invented for this page.
  const PLAINTEXT = 'THE SIGNAL STATION WILL CLOSE AT NIGHTFALL AND THE RELIEF CREW WILL ARRIVE BY THE EASTERN ROAD BEFORE DAWN. THEY SHOULD BRING THE NEW CODE TABLES, THE SPARE BATTERIES AND THE WEATHER REPORTS FOR THE NEXT THREE DAYS. NOBODY SHOULD SEND A MESSAGE ABOUT THE CHANGE UNTIL THE NEW TABLES ARE IN PLACE AND THE OLD ONES HAVE BEEN BURNED.';
  const KEY = 'QMZLDWNRAGPKOEVBYSTJIHCUFX';
  // English letters from most to least frequent, the attacker's only outside knowledge.
  const ENGLISH_ORDER = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';
  const CHANCE = 1 / 26;
  // The claim "the ciphertext alone gives nothing away" is refuted when a ciphertext-only attack
  // recovers this share of letters: five times what guessing would.
  const REFUTE_AT = 5 * CHANCE;

  const map = (text, from, to) => text.replace(/[A-Z]/g, c => to[from.indexOf(c)]);
  const encrypt = (text, key) => map(text, ALPHABET, key);
  const decrypt = (text, key) => map(text, key, ALPHABET);
  // log10(26!): the size of the key space, which bounds only exhaustive key search.
  function keyspaceLog10() { let s = 0; for (let i = 2; i <= 26; i++) s += Math.log10(i); return s; }

  // Ciphertext-only attack: pair cipher letters by frequency rank with English letters.
  function frequencyAttack(ciphertext) {
    const counts = {};
    for (const c of ciphertext) if (ALPHABET.includes(c)) counts[c] = (counts[c] || 0) + 1;
    const ranked = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
    const guess = {};
    ranked.forEach((c, i) => { guess[c] = ENGLISH_ORDER[i]; });
    return ciphertext.replace(/[A-Z]/g, c => guess[c]);
  }
  function recovered(plain, guess) {
    let hit = 0, total = 0;
    for (let i = 0; i < plain.length; i++) if (ALPHABET.includes(plain[i])) { total++; if (guess[i] === plain[i]) hit++; }
    return total ? hit / total : 0;
  }

  function assess(opts) {
    const o = opts || {}, plain = o.plaintext || PLAINTEXT, key = o.key || KEY;
    const cipher = encrypt(plain, key);
    const functional = decrypt(cipher, o.decryptKey || key) === plain ? 'passes' : 'fails';
    const guess = frequencyAttack(cipher), share = recovered(plain, guess);
    return { cipher, functional, guess, recovered: share, chance: CHANCE, security: share > REFUTE_AT ? 'claim refuted' : 'not refuted by this test' };
  }

  function mount(doc) {
    const $ = id => doc.getElementById(id);
    if (!$('wn-functional')) return;
    const a = assess();
    $('wn-cipher').textContent = a.cipher;
    $('wn-functional').addEventListener('click', () => {
      const r = assess();
      $('wn-functional-result').textContent = (r.functional === 'passes' ? 'Passes' : 'Fails') + ': decrypting the ciphertext with the key gives back the message exactly. That shows the cipher is correct, not that it is secure.';
    });
    $('wn-security').addEventListener('click', () => {
      const r = assess();
      $('wn-guess').textContent = r.guess;
      $('wn-security-result').textContent = 'The claim is ' + (r.security === 'claim refuted' ? 'refuted' : 'not refuted by this test') + ': ranking cipher letters by frequency, with no key search at all, recovers ' + Math.round(r.recovered * 100) + '% of the letters. Guessing would recover about ' + Math.round(r.chance * 100) + '%.';
    });
  }
  return { ALPHABET, PLAINTEXT, KEY, ENGLISH_ORDER, REFUTE_AT, encrypt, decrypt, keyspaceLog10, frequencyAttack, recovered, assess, mount };
});
```


## JavaScript — scripts/check-profile-recovery-v2.js

**Recovery experiment command-line tool:** runs with Node.js in a repository checkout; it is not a browser control. The protocol, every recorded condition, scorer inputs and interpretation are included separately. For v1, --check audits the saved report and --replay reruns search. For the crossed v2 follow-up, scripts/check-profile-recovery-v2.js verifies saved arithmetic and identities; the frozen run.js needs a fresh output directory. Consult each version’s README before execution.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `scripts/check-profile-recovery-v2.js`
- Served SHA-256: `fe95a7e6892b72f8d15d7675f88ac231e46c4f537c33057afea34ca133fd48cf`
- Readable-source SHA-256: `fe95a7e6892b72f8d15d7675f88ac231e46c4f537c33057afea34ca133fd48cf`


```javascript
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const D=path.join(__dirname,'../data/research/profile-recovery-v2');
const E=require(path.join(D,'inputs/scripts/evaluate-profile-recovery'));
const P=require(path.join(D,'protocol.json')),F=require(path.join(D,'fixtures.json'));
const inputs=E.loadInputs();
function verify(rowsOverride, summaryOverride) {
const rows=rowsOverride || require('zlib').gunzipSync(fs.readFileSync(path.join(D,'runs.jsonl.gz'))).toString('utf8').trim().split('\n').map(JSON.parse);
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
for(const [f,h] of Object.entries(P.inputHashes))assert.equal(hash(fs.readFileSync(path.join(D,'inputs',f))),h);
assert.equal(rows.length,720);let checked=0;const seen=new Set(),scorers=E.createScorers(inputs);
for(const r of rows){const id=[r.caseId,r.solver,r.scorer,r.searchSeed].join('/');assert.ok(!seen.has(id));seen.add(id);
 const c=F.cases.find(c=>c.id===r.caseId),s=F.sources.find(s=>s.id===c.passage);assert.ok(c&&s);assert.equal(r.passage,c.passage);assert.equal(r.sourceDocument,c.sourceDocument);assert.equal(r.keyIndex,c.replicate);assert.equal(r.language,c.language);
 assert.ok(P.scorers.includes(r.scorer));assert.ok(r.solver==='annealing'?P.searchSeeds.includes(r.searchSeed):r.searchSeed===null);
 if(r.status!=='completed')continue;
 assert.equal(r.role,E.roleFor(c,r.scorer));assert.equal(r.scoringModelReported,r.scorer);assert.equal(r.ciphertextSha256,c.ciphertextSha256);
 assert.deepEqual(r.options,E.optionsFor(inputs.protocol,{...c,searchSeed:r.searchSeed},r.solver));
 assert.deepEqual(Object.keys(r.key).sort(),Object.keys(c.expectedKey).sort());assert.equal(c.tokens.map(t=>r.key[t]).join(''),r.plaintext);
 for(const [k,v] of Object.entries(E.measures(s.plaintext,r.plaintext,c.expectedKey,r.key)))assert.equal(r[k],v);
 const score=scorers.get(r.scorer)(r.plaintext);assert.ok(Math.abs(score-r.score)<1e-9*Math.max(1,Math.abs(score)));
 assert.equal(r.completedSteps,r.solver==='annealing'?6000:Object.keys(c.expectedKey).length);checked++;
}
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
const variance=a=>a.length?mean(a.map(x=>(x-mean(a))**2)):null;
const stat=a=>({runs:a.length,completed:a.filter(r=>r.status==='completed').length,failed:a.filter(r=>r.status!=='completed').length,exact:a.filter(r=>r.exact).length,...Object.fromEntries(['plaintextError','positionalError','keyError'].map(k=>[k,a.every(r=>r.status==='completed')?mean(a.map(r=>r[k])):null]))});
const delta=a=>({pairs:a.length,mean:mean(a),min:Math.min(...a),max:Math.max(...a),wins:a.filter(x=>x< -1e-8).length,ties:a.filter(x=>Math.abs(x)<=1e-8).length,losses:a.filter(x=>x>1e-8).length});
const groups=[];
for(const solver of ['annealing','beam-search'])for(const field of ['overall','sourceDocument','passage','keyIndex','searchSeed']){
 if(solver==='beam-search'&&field==='searchSeed')continue;
 for(const value of field==='overall'?['all']:[...new Set(rows.filter(r=>r.solver===solver).map(r=>r[field]))]){
 const a=rows.filter(r=>r.solver===solver&&(field==='overall'||r[field]===value));
 const b=a.filter(r=>r.role==='baseline'),m=a.filter(r=>r.role==='matched'),x=a.filter(r=>r.role==='mismatched');
 let paired=null;if(a.every(r=>r.status==='completed'))paired={matchedMinusBaseline:delta(m.map(r=>r.plaintextError-b.find(z=>z.caseId===r.caseId&&z.searchSeed===r.searchSeed).plaintextError)),matchedMinusMeanMismatched:delta(m.map(r=>r.plaintextError-mean(x.filter(z=>z.caseId===r.caseId&&z.searchSeed===r.searchSeed).map(z=>z.plaintextError))))};
 groups.push({solver,group:field,id:value,baseline:stat(b),matched:stat(m),mismatched:stat(x),paired});
 }}
const seedVariation=[];for(const c of F.cases)for(const scorer of P.scorers){const a=rows.filter(r=>r.caseId===c.id&&r.scorer===scorer&&r.solver==='annealing');seedVariation.push({caseId:c.id,scorer,errorMean:mean(a.map(r=>r.plaintextError)),seedPopulationVariance:variance(a.map(r=>r.plaintextError)),min:Math.min(...a.map(r=>r.plaintextError)),max:Math.max(...a.map(r=>r.plaintextError))});}
const keyVariation=[];for(const p of F.sources)for(const scorer of P.scorers){const a=seedVariation.filter(r=>F.cases.find(c=>c.id===r.caseId).passage===p.id&&r.scorer===scorer);keyVariation.push({passage:p.id,scorer,keyMeanPopulationVariance:variance(a.map(r=>r.errorMean)),meanWithinKeySeedVariance:mean(a.map(r=>r.seedPopulationVariance))});}
const old=require(path.join(D,'inputs/data/research/profile-recovery-v1/evaluation.json'));let identical=0;
for(const r of old.runs){const c=F.cases.find(c=>c.id===r.caseId);const n=rows.find(z=>z.caseId===r.caseId&&z.solver===r.solver&&z.scorer===r.scorer&&(r.solver==='beam-search'||z.searchSeed===c.searchSeed));for(const k of ['plaintext','key','score','fitnessEvaluations','plaintextError','positionalError','keyError','exact'])assert.deepEqual(n[k],r[k]);identical++;}
const out={checkedMetrics:checked,expectedRuns:720,failed:rows.filter(r=>r.status!=='completed'),v1OverlappingConditionsIdentical:identical,runtime:require(path.join(D,'execution.json')).runtime,totalConditionSeconds:rows.reduce((s,r)=>s+(r.ms||0),0)/1000,groups,seedVariation,keyVariation,interpretation:'Variances are descriptive population variances across this fixed factorial grid, not inferential estimates across historical sources.'};
assert.deepEqual(F,E.buildCases(inputs),'Recorded fixtures differ from audited construction.');
assert.deepEqual(out,summaryOverride || JSON.parse(fs.readFileSync(path.join(D,'summary.json'))),'Recorded aggregate arithmetic or diagnostics changed.');
assert.equal(out.failed.length,0,'Published run has unexpected failed conditions.');
const exec=JSON.parse(fs.readFileSync(path.join(D,'execution.json')));
assert.equal(exec.protocolSha256,hash(fs.readFileSync(path.join(D,'protocol.json'))));
assert.equal(exec.runnerSha256,hash(fs.readFileSync(path.join(D,'run.js'))));
assert.equal(JSON.parse(fs.readFileSync(path.join(D,'finished.json'))).runsSha256,hash(require('zlib').gunzipSync(fs.readFileSync(path.join(D,'runs.jsonl.gz')))));
return out;
}
if(require.main===module){
 try { const r=verify();console.log(`Profile recovery v2: ${r.checkedMetrics}/720 conditions checked; ${r.v1OverlappingConditionsIdentical}/240 overlapping v1 predictions identical. Zero exact recoveries. No search rerun.`); }
 catch(e){console.error(e.message);process.exitCode=1;}
}
module.exports={verify};
```


## JavaScript — scripts/columnar-classroom.js

**Classroom command-line tool:** runs with Node.js in a repository checkout; it is not a browser demo. The linked worksheet and fixed fixtures are included separately.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `scripts/columnar-classroom.js`
- Served SHA-256: `fc4b64e8877c3fad1c6866029f58189c1c7a6f555a4a44fdcc148f78e68fc4f3`
- Readable-source SHA-256: `fc4b64e8877c3fad1c6866029f58189c1c7a6f555a4a44fdcc148f78e68fc4f3`


```javascript
#!/usr/bin/env node
'use strict';
// A small receipt-producing classroom experiment; reuses the Museum solver.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const root = path.join(__dirname, '..');
const columnar = require('../js/columnar-search');
require('../js/detective/lang-model');
const fixturePath = 'public/teaching/columnar-classroom-fixtures.json';
const corpus = JSON.parse(fs.readFileSync(path.join(root, fixturePath), 'utf8'));
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

// Reference preparation is separate from the search implementation: write rows,
// then read the specified columns. Fixed ciphertexts are retained in the fixture.
function referenceEncrypt(plaintext, order) {
  const rows = [];
  for (let i = 0; i < plaintext.length; i += order.length) rows.push(plaintext.slice(i, i + order.length));
  return order.map(column => rows.map(row => row[column] || '').join('')).join('');
}
function runExperiment({clock = () => performance.now()} = {}) {
  const runs = [];
  const variants = [{id:'direct', staged:false}, {id:'staged', staged:true}];
  for (const fixture of corpus.fixtures) {
    if (referenceEncrypt(fixture.plaintext, fixture.order) !== fixture.ciphertext) throw Error('Fixture does not match its independent row/column reference: ' + fixture.id);
    if (fixture.length !== fixture.plaintext.length || fixture.width !== fixture.order.length || fixture.remainder !== fixture.length % fixture.width) throw Error('Fixture shape mismatch: ' + fixture.id);
    for (const seed of corpus.seeds) for (const variant of variants) {
      const options = {width:fixture.width, budget:corpus.budget, restarts:corpus.restarts, seed, staged:variant.staged, alignment:true, segments:true};
      const started = clock();
      const result = columnar.solve(fixture.ciphertext, options);
      const elapsedMs = Math.max(0, clock() - started);
      if (result.evaluations > options.budget || result.preprocessing > result.evaluations) throw Error('Budget accounting failed.');
      const exactPlaintext = !!result.best && result.best.plaintext === fixture.plaintext;
      const exactKey = !!result.best && result.best.order.every((value, i) => value === fixture.order[i]);
      runs.push({fixture:fixture.id, variant:variant.id, options, length:fixture.length, remainder:fixture.remainder,
        rectangle:fixture.remainder ? 'incomplete' : 'complete', evaluations:result.evaluations,
        preprocessingEvaluations:result.preprocessing, elapsedMs,
        exactPlaintext, exactKey, outcome:exactPlaintext ? 'plaintext-recovered' : result.best ? 'different-candidate' : 'no-candidate',
        candidate:result.best ? {plaintext:result.best.plaintext, order:result.best.order, score:result.best.score} : null,
        reason:result.reason});
    }
  }
  const summary = variants.map(variant => {
    const rows = runs.filter(run => run.variant === variant.id);
    return {variant:variant.id, runs:rows.length, exactPlaintexts:rows.filter(run => run.exactPlaintext).length,
      exactKeys:rows.filter(run => run.exactKey).length, noCandidate:rows.filter(run => !run.candidate).length,
      unsuccessfulPlaintexts:rows.filter(run => !run.exactPlaintext).length};
  });
  return {schema:'museum-columnar-classroom-receipt-v1', fixtureSet:corpus,
    sources:{fixturesSha256:digest(fixturePath), solverSha256:digest('js/columnar-search.js'), languageModelSha256:digest('js/detective/lang-model.js'), runnerSha256:digest('scripts/columnar-classroom.js')},
    runtime:{node:process.version, platform:process.platform, arch:process.arch},
    scope:'24 fixed runs: four synthetic messages, three seeds, two variants differing only in staged initialization. Every failure is retained. These counts describe this small fixture set, not general recovery probabilities. Repeated seeds on a message are dependent. Equal evaluation budgets are not equal CPU work. Timings vary and are excluded from exact replay.',
    summary, runs};
}
function withoutTimings(report) {
  return {...report, runs:report.runs.map(({elapsedMs, ...run}) => run)};
}
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--check','--help'].includes(arg))) throw Error('Usage: node scripts/columnar-classroom.js [--check | --help]');
  if (args.includes('--help')) {
    console.log('Emit 24-run JSON receipt to stdout: node scripts/columnar-classroom.js > columnar-classroom-results.json\nCheck deterministic replay, excluding time: node scripts/columnar-classroom.js --check');
  } else if (args.includes('--check')) {
    const first = runExperiment(), second = runExperiment();
    require('node:assert/strict').deepEqual(withoutTimings(first), withoutTimings(second));
    console.log('All 24 classroom runs replay exactly apart from elapsed time. Failures and exhausted budgets remain in the receipt.');
  } else {
    console.log(JSON.stringify(runExperiment(), null, 2));
  }
}
module.exports = {runExperiment, withoutTimings, referenceEncrypt};
```


## JavaScript — scripts/evaluate-profile-recovery.js

**Recovery experiment command-line tool:** runs with Node.js in a repository checkout; it is not a browser control. The protocol, every recorded condition, scorer inputs and interpretation are included separately. For v1, --check audits the saved report and --replay reruns search. For the crossed v2 follow-up, scripts/check-profile-recovery-v2.js verifies saved arithmetic and identities; the frozen run.js needs a fresh output directory. Consult each version’s README before execution.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `scripts/evaluate-profile-recovery.js`
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


## JavaScript — scripts/research-splits.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `scripts/research-splits.js`
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


## JavaScript — sw.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `sw.js`
- Served SHA-256: `244e1c17683f8cde0024c626925b37069bb99e4dffa382175081e383c6d48c26`
- Readable-source SHA-256: `244e1c17683f8cde0024c626925b37069bb99e4dffa382175081e383c6d48c26`


```javascript
/**
 * THE CIPHER MUSEUM — Service Worker
 * Offline support for classrooms and flaky connections.
 *
 * Strategy:
 *   - HTML navigations: network-first, falling back to cache (content stays fresh
 *     online; cached pages may be available offline while their assets remain cached).
 *   - JavaScript: network-first with cached fallback, so corrected models arrive
 *     with the exhibit text on the first online visit.
 *   - Other static assets (css/images/json): cache-first with background refresh.
 *   - Requests under /public/, including corpus samples and reports, bypass this cache.
 *
 * VERSION is stamped automatically by `npm run build:js` from a hash of every
 * asset served cache-first — the minified bundles, the non-HTML entries of
 * CORE below, the offline fallback page, and this worker's policy (scripts/sw-version.js).
 * tests/test-sw-version.js fails the suite if it drifts. Old caches are purged
 * on activate, so adding an asset to CORE also re-stamps VERSION.
 */
'use strict';

const VERSION = 'cipher-museum-0cca0849';

const CORE = [
  '/ciphers/ika.html',
  '/ciphers/gripenstierna.html',
  '/lab/kisses.html',
  '/js/codebreaking-evidence.js',
  '/css/codebreaking-evidence.css',
  '/lab/intercept-to-intelligence.html',
  '/js/intercept-exercise.js',
  '/js/structure-exercises.js',
  '/js/egyptian-case.js',
  '/js/maya-case.js',
  '/lab/reading-the-evidence.html',
  '/js/reading-evidence.js',
  '/js/charles-v-case.js',
  '/lab/traffic-analysis.html',
  '/lab/purple-diagnosis.html',
  '/js/purple-diagnosis.js',
  '/lab/working-is-not-secure.html',
  '/js/working-not-secure.js',
  '/js/traffic-analysis.js',
  '/css/traffic-analysis.css',
  '/css/evidence-exercises.css',
  '/js/evidence-exercises.js',
  '/first-codebreak.html',
  '/classical-guide.html',
  '/codebreak-worksheet.html',
  '/codebreak-answers.html',
  '/css/first-codebreak.css',
  '/js/first-codebreak.js',
  '/',
  '/index.html',
  '/offline.html',
  '/ciphers/myszkowski.html',
  '/ciphers/turning-grille.html',
  '/ciphers/hagelin-c36.html',
  '/ciphers/nema.html',
  '/ciphers/rs44.html',
  '/ciphers/double-playfair.html',
  '/ciphers/amsco.html',
  '/css/manual-cipher-demos.css',
  '/js/manual-cipher-demos.js',
  '/css/multiple-anagramming.css',
  '/js/multiple-anagramming.js',
  '/css/pad-experiments.css',
  '/js/pad-experiments.js',
  '/js/secrecy-experiments.js',
  '/css/detective-workspaces.css',
  '/js/detective/workspaces.js',
  '/js/detective/playback.js',
  '/js/detective/lang-model.js',
  '/lab/evidence-workbench.html',
  '/lab/decipherment-cases.html',
  '/lab/modern-attack-evidence.html',
  '/ciphers/ua-8295.html',
  '/ciphers/sodark.html',
  '/ciphers/nfc-deployment.html',
  '/css/research-workbench.css',
  '/js/research-model.js',
  '/js/research-worker.js',
  '/js/research-language-model.js',
  '/data/research/v1/language-model.json',
  '/js/research-ui.js',
  '/js/research-cases.js',
  '/data/research/v1/z340-section-1.json',
  '/js/ciphers/all-engines.min.js',
  '/css/museum.css',
  '/css/reader-companion.css',
  '/js/reader-companion.js',
  '/js/book-trail.js',
  '/js/book-invitation-demos.js',
  '/css/book-invitation-demos.css',
  '/css/historical-demos.css',
  '/js/historical-ciphers.js',
  '/js/historical-demos.js',
  '/js/nav.js',
  '/js/footer.js',
  '/js/breadcrumbs.js',
  '/js/ui-delegates.js',
  '/js/trust-labels.js',
  '/js/search.js',
  '/js/search-index.json',
  '/js/artifact-cards.js',
  '/js/artifact-cards-data.min.js',
  '/js/demo-loader.min.js',
  '/js/lightbox.js',
  '/fonts/noto-sans-egyptian-hieroglyphs-subset.woff2',
  '/fonts/cinzel-400-latin-ext.woff2',
  '/fonts/cinzel-400-latin.woff2',
  '/fonts/cinzel-600-latin-ext.woff2',
  '/fonts/cinzel-600-latin.woff2',
  '/fonts/cinzel-700-latin-ext.woff2',
  '/fonts/cinzel-700-latin.woff2',
  '/fonts/cormorant-garamond-italic-300-latin-ext.woff2',
  '/fonts/cormorant-garamond-italic-300-latin.woff2',
  '/fonts/cormorant-garamond-italic-400-latin-ext.woff2',
  '/fonts/cormorant-garamond-italic-400-latin.woff2',
  '/fonts/cormorant-garamond-italic-600-latin-ext.woff2',
  '/fonts/cormorant-garamond-italic-600-latin.woff2',
  '/fonts/cormorant-garamond-300-latin-ext.woff2',
  '/fonts/cormorant-garamond-300-latin.woff2',
  '/fonts/cormorant-garamond-400-latin-ext.woff2',
  '/fonts/cormorant-garamond-400-latin.woff2',
  '/fonts/cormorant-garamond-600-latin-ext.woff2',
  '/fonts/cormorant-garamond-600-latin.woff2',
  '/fonts/cormorant-garamond-700-latin-ext.woff2',
  '/fonts/cormorant-garamond-700-latin.woff2',
  '/fonts/jetbrains-mono-300-latin-ext.woff2',
  '/fonts/jetbrains-mono-300-latin.woff2',
  '/fonts/jetbrains-mono-400-latin-ext.woff2',
  '/fonts/jetbrains-mono-400-latin.woff2',
  '/fonts/jetbrains-mono-500-latin-ext.woff2',
  '/fonts/jetbrains-mono-500-latin.woff2',
  '/fonts/jetbrains-mono-700-latin-ext.woff2',
  '/fonts/jetbrains-mono-700-latin.woff2',
  '/hall-of-foundations/index.html',
  '/hall-of-foundations/foundations.css',
  '/images/icons.svg',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/images/icons/icon-192.png',
  '/images/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Bypass all /public/ requests, including corpus downloads, samples and reports.
  if (url.pathname.startsWith('/public/')) return;

  if (req.mode === 'navigate') {
    // Network-first for pages. An unvisited exhibit must display an explicit
    // offline notice, not the homepage at an exhibit URL with broken relative
    // assets (or misleading homepage content).
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/offline.html')))
    );
    return;
  }

  if (url.pathname.endsWith('.js')) {
    const cachedScript = async () => {
      const cache = await caches.open(VERSION);
      // Versioned exhibit URLs use the precached current bundle while offline.
      return (await cache.match(req)) || cache.match(url.pathname);
    };
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then(async (res) => {
          if (!res.ok) return (await cachedScript()) || res;
          try {
            const cache = await caches.open(VERSION);
            await cache.put(req, res.clone());
          } catch (_) { /* A full cache must not discard a successful network response. */ }
          return res;
        })
        .catch(async (error) => {
          const hit = await cachedScript();
          if (hit) return hit;
          throw error;
        })
    );
    return;
  }

  // Cache-first with background refresh for the remaining static assets.
  event.respondWith(
    caches.match(req).then((hit) => {
      const refresh = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || refresh;
    })
  );
});
```
