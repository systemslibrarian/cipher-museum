#!/usr/bin/env node
'use strict';

/**
 * Hall-navigation reciprocity guard.
 *
 * Every exhibit page carries a prev/next footer. Those links all resolve —
 * tests/test-local-links.js has always passed — but resolving is not the same
 * as agreeing. The 4 August 2026 audit found 64 one-way edges: page A said
 * "Next -> B" while B said its previous was someone else entirely. Some pages
 * were claimed as the successor of three different predecessors at once.
 *
 * The cause is visible in the shape of the damage: exhibits were added in
 * batches, and each new page wrote its own prev/next without updating the
 * neighbours it had just inserted itself between. Nothing caught it, because
 * every individual link pointed at a real file.
 *
 * The invariant this file enforces:
 *
 *     next(A) === B   =>   prev(B) === A
 *     prev(A) === B   =>   next(B) === A
 *
 * A page may legitimately have no prev (it starts a run) or no next (it ends
 * one). What it may not do is name a neighbour that does not name it back.
 *
 * Deliberately NOT enforced: that the chains follow museum-map roster order.
 * They do not, and should not — the runs are a curated tour that crosses hall
 * boundaries on purpose (the machines run reaches Pigpen in Hall XIII).
 */

const fs = require('fs');
const path = require('path');

const CIPHERS_DIR = path.join(__dirname, '..', 'ciphers');

let passed = 0;
const failures = [];

function ok(label, condition, detail) {
  if (condition) { passed++; return; }
  failures.push({ label, detail });
}

/** Pull the prev/next targets out of a page's hall-nav footer. */
function readNav(slug) {
  const html = fs.readFileSync(path.join(CIPHERS_DIR, `${slug}.html`), 'utf8');
  const block = /<div class="hall-nav">([\s\S]*?)<\/div>\s*(?:<\/main>|<footer|$)/.exec(html);
  const scope = block ? block[1] : html;
  const nav = { prev: null, next: null };
  const link = /<a href="\.\.\/ciphers\/([^"]+)\.html"[^>]*class="hall-nav-link([^"]*)"/g;
  let m;
  while ((m = link.exec(scope)) !== null) {
    nav[/next/.test(m[2]) ? 'next' : 'prev'] = m[1];
  }
  return nav;
}

const slugs = fs.readdirSync(CIPHERS_DIR)
  .filter(f => f.endsWith('.html'))
  .map(f => f.slice(0, -5))
  .sort();

const known = new Set(slugs);
const nav = new Map(slugs.map(s => [s, readNav(s)]));

console.log(`\n━━━ Hall-nav reciprocity: ${slugs.length} exhibit pages ━━━\n`);

for (const slug of slugs) {
  const { prev, next } = nav.get(slug);

  if (next !== null) {
    ok(`${slug} next target exists`, known.has(next), `next -> ${next}.html not found`);
    if (known.has(next)) {
      const back = nav.get(next).prev;
      ok(`${slug} next<->prev reciprocal`, back === slug,
        `${slug} next -> ${next}, but ${next} prev -> ${back === null ? '(none)' : back}`);
    }
  }

  if (prev !== null) {
    ok(`${slug} prev target exists`, known.has(prev), `prev -> ${prev}.html not found`);
    if (known.has(prev)) {
      const fwd = nav.get(prev).next;
      ok(`${slug} prev<->next reciprocal`, fwd === slug,
        `${slug} prev -> ${prev}, but ${prev} next -> ${fwd === null ? '(none)' : fwd}`);
    }
  }

  ok(`${slug} does not link to itself`, prev !== slug && next !== slug,
    'a page cannot be its own neighbour');
}

// No page may be claimed as the successor (or predecessor) of two others.
for (const key of ['next', 'prev']) {
  const claimants = new Map();
  for (const slug of slugs) {
    const target = nav.get(slug)[key];
    if (!target) continue;
    if (!claimants.has(target)) claimants.set(target, []);
    claimants.get(target).push(slug);
  }
  for (const [target, who] of claimants) {
    ok(`${target} claimed as ${key} exactly once`, who.length === 1,
      `${who.length} pages claim ${target} as their ${key}: ${who.join(', ')}`);
  }
}

console.log('\n══════════════════════════════════════════════════════════════════════');
console.log(`  ✅ ${passed} passed   ❌ ${failures.length} failed   (${slugs.length} files)`);
console.log('══════════════════════════════════════════════════════════════════════\n');

if (failures.length) {
  console.error('Failures:');
  for (const f of failures) console.error(`  ❌  ${f.label}\n      ${f.detail}`);
  process.exit(1);
}
