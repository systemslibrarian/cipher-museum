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
