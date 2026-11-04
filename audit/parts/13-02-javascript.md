# javascript appendix 2

Snapshot: `3e47b5e05bd350c91f0e50501ad1f8ffc6b33e20`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

## JavaScript — js/chi-setting.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/chi-setting.js`
- Served SHA-256: `2a1cb8852b434c1edb00c69d0985e66a4ffd8dc25722fe8267f7729b7bf51f2d`
- Readable-source SHA-256: `2a1cb8852b434c1edb00c69d0985e66a4ffd8dc25722fe8267f7729b7bf51f2d`


```javascript
/* General Report on Tunny (Good, Michie, Timms, 1945), §§23A–C.
 * Bounded two-wheel statistical experiment, not a full Colossus emulator. */
(function (root) {
  'use strict';
  function rng(seed) { let x=seed>>>0; return () => { x=(Math.imul(x,1664525)+1013904223)>>>0; return x/4294967296; }; }
  function delta(bits) { return bits.slice(1).map((x,i)=>x^bits[i]); }
  function validate(z, patterns) {
    if (!Array.isArray(z) || z.length<2 || z.length>4096 || z.some(x=>!Number.isInteger(x)||x<0||x>31)) throw Error('Use 2–4096 five-bit symbols.');
    if (patterns.length!==2 || patterns.some((p,i)=>p.length!==[41,31][i] || p.some(b=>b!==0&&b!==1))) throw Error('Known binary chi patterns must have lengths 41 and 31.');
  }
  function rank(z, patterns) {
    validate(z,patterns);
    const dz=delta(z).map(x=>(x&1)^((x>>>1)&1));
    const wheels=patterns.map(p=>p.map((x,i)=>x^p[(i+1)%p.length]));
    const scores=[];
    for(let a=0;a<41;a++) for(let b=0;b<31;b++) {
      let dots=0;
      for(let t=0;t<dz.length;t++) if ((dz[t]^wheels[0][(a+t)%41]^wheels[1][(b+t)%31])===0) dots++;
      scores.push({a,b,dots,sigma:(dots-dz.length/2)/Math.sqrt(dz.length/4)});
    }
    return scores.sort((a,b)=>b.dots-a.dots||a.a-b.a||a.b-b.b);
  }
  function fixture(length=1024, noise=0, seed=1945) {
    if (![64,256,1024,4096].includes(length) || !Number.isFinite(noise) || noise<0 || noise>0.5) throw Error('Invalid fixture settings.');
    const random=rng(seed), patterns=[41,31].map(n=>Array.from({length:n},()=>random()<0.5?0:1));
    const truth={a:Math.floor(random()*41),b:Math.floor(random()*31)};
    // D is a synthetic residual stream, not German plaintext or a psi-wheel emulator.
    // Its impulse-1 XOR impulse-2 parity changes with probability .30 (plus noise).
    let parity=0;
    const residual=[], ciphertext=[];
    for(let t=0;t<length;t++) {
      if(t && ((random()<0.30 ? 1:0) ^ (random()<noise ? 1:0))) parity^=1;
      const first=random()<0.5?0:1;
      const d=first|((first^parity)<<1)|(Math.floor(random()*8)<<2);
      residual.push(d);
      ciphertext.push(d^patterns[0][(truth.a+t)%41]^(patterns[1][(truth.b+t)%31]<<1));
    }
    return {patterns,truth,residual,ciphertext};
  }
  function experiment(length,noise,seed=1945) {
    const data=fixture(length,noise,seed), ranked=rank(data.ciphertext,data.patterns), random=rng(seed^0x7194);
    // Compare the selected maximum with selected maxima under an explicit iid null.
    const nullMaxima=Array.from({length:39},()=>rank(Array.from({length},()=>Math.floor(random()*32)),data.patterns)[0].dots);
    const exceed=nullMaxima.filter(n=>n>=ranked[0].dots).length;
    const familywiseEstimate=(exceed+1)/(nullMaxima.length+1);
    const truthRank=ranked.findIndex(s=>s.a===data.truth.a&&s.b===data.truth.b)+1;
    return { ...data, ranked, nullMaxima, familywiseEstimate, truthRank,
      conclusion: familywiseEstimate<=0.05 && ranked[0].dots>ranked[1].dots ? 'Evidence for further investigation under the synthetic model; not a decryption.' : 'Inconclusive after searching 1,271 settings.' };
  }
  const api={delta,rank,fixture,experiment};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.ChiSetting=api;
  if(typeof document!=='undefined') {
    const button=document.getElementById('chi-run');
    if(button) button.addEventListener('click',()=>{
      const output=document.getElementById('chi-results');
      const length=Number(document.getElementById('chi-length').value),noise=Number(document.getElementById('chi-noise').value);
      button.disabled=true; output.textContent='Counting all settings and 39 null searches…';
      setTimeout(()=>{try {
        const r=experiment(length,noise);
        const preselected=r.ranked.find(s=>s.a===0&&s.b===0);
        output.innerHTML='<p>Preselected offsets (0, 0), fixed before inspecting the tape: '+preselected.dots+' dots; pointwise sigma '+preselected.sigma.toFixed(2)+'. Compare this one setting with the selected maximum below.</p><p>'+r.conclusion+'</p><p>'+length+' five-bit symbols; '+(length-1)+' adjacent differences. Selected maximum: '+r.ranked[0].dots+' dots. Pointwise sigma: '+r.ranked[0].sigma.toFixed(2)+'. This pointwise score ignores selection among 1,271 settings.</p><p>Whole-search Monte Carlo estimate: '+r.familywiseEstimate.toFixed(3)+' (39 independent null searches; minimum reportable estimate 0.025). This coarse model-dependent estimate is not historical confidence or a proof.</p><table class="cipher-table"><thead><tr><th>chi 1 offset</th><th>chi 2 offset</th><th>Dots</th></tr></thead><tbody>'+r.ranked.slice(0,5).map(s=>'<tr><td>'+s.a+'</td><td>'+s.b+'</td><td>'+s.dots+'</td></tr>').join('')+'</tbody></table><details><summary>Inspect fixture truth and known wheel patterns</summary><p>True offsets '+r.truth.a+', '+r.truth.b+'; rank '+r.truthRank+'. Truth is checked only after ranking.</p><p>chi 1: '+r.patterns[0].join('')+'</p><p>chi 2: '+r.patterns[1].join('')+'</p><p>First 12 ciphertext symbols: '+r.ciphertext.slice(0,12).map(n=>n.toString(2).padStart(5,'0')).join(' ')+'</p></details>';
      }catch(e){output.textContent=e.message;}finally{button.disabled=false;}},0);
    });
  }
})(typeof window!=='undefined'?window:globalThis);
```


## JavaScript — js/cipher-corpus.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/cipher-corpus.js`
- Served SHA-256: `1c8f4bb2422eff69ca824a25ef6bf9c531cb3c0ac1fe5c042f89aa1f60e9e6d5`
- Readable-source SHA-256: `1c8f4bb2422eff69ca824a25ef6bf9c531cb3c0ac1fe5c042f89aa1f60e9e6d5`


```javascript
// Cipher Corpus Browser UI

(async function() {
  let records = [];
  if (typeof fetch === 'function') {
    // Load a balanced v0.8 sample; the published v0.6 sample remains an archive.
    try {
      const res = await fetch('public/corpus/v0.8/browser-sample.json');
      if (!res.ok) throw new Error('Corpus HTTP ' + res.status);
      records = await res.json();
      if (!Array.isArray(records)) throw new Error('Invalid corpus response');
    } catch (error) {
      const container = document.getElementById('corpus-cards');
      if (container) {
        container.textContent = 'The corpus could not be loaded. Check your connection and reload this page to try again.';
        container.setAttribute('role', 'status');
      }
      return;
    }
  }
  let mode = 'challenge';

  // Live navigation repairs only. Frozen source_provenance/source_url values remain unchanged in
  // the published corpus and record downloads; these do not verify provenance.
  const sourceLinkUpdates = {
    "https://www.nsa.gov/Portals/75/documents/news-features/declassified-documents/venona/": "https://www.nsa.gov/Helpful-Links/NSA-FOIA/Declassification-Transparency-Initiatives/Historical-Releases/VENONA/",
    "https://www.cs.cornell.edu/courses/cs6820/2012fa/handouts/alberti.pdf": "https://library.cmu.edu/about/news/2023-01/Alberti-La-Cifra",
    "https://www.cryptomuseum.com/crypto/chaocipher/": "https://www.chaocipher.com/",
    "https://www.cryptomuseum.com/crypto/wheatstone/": "https://collection.sciencemuseumgroup.org.uk/objects/co60528",
    "https://en.wikisource.org/wiki/The_Lives_of_the_Twelve_Caesars/Life_of_Julius_Caesar": "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Julius*.html#56.6"
};
  const incorrectSourceLinks = {
    '[ebook-url-omitted-4d836edda9e0; bibliographic credit retained]': { work: "Russell's Sydney Smith", related: '[ebook-url-omitted-a2c16a87be0d; bibliographic credit retained]' },
    '[ebook-url-omitted-7cbbe05acde6; bibliographic credit retained]': { work: 'Tunturikoski', related: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Aeneas_Tacticus/E*.html' },
    '[ebook-url-omitted-fa657a9b3875; bibliographic credit retained]': { work: "Mistral's Mes Origines" }
  };
  // A source credit is not permission to turn an ebook copy into navigation.
  // Keep archival provenance intact, and allow primary papers/manuals (including
  // PDFs); suppress known book-text hosts and ebook file formats at render time.
  function isEbookDestination(url) {
    const host = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();
    return /(^|\.)(gutenberg\.org|books\.google\.[a-z.]+|openlibrary\.org|annas-archive\.[a-z]+|libgen\.[a-z]+)$/.test(host) ||
      /\.(?:epub|mobi|azw3?)(?:$|\/)/.test(pathname) ||
      (host === 'inventwithpython.com' && /^\/cracking(?:\/|$)/.test(pathname)) ||
      (host === 'crypto.stanford.edu' && pathname.includes('/cryptobook')) ||
      (host === 'shoup.net' && /^\/pg(?:\/|$)/.test(pathname)) ||
      (/^(?:www\.)?(?:cacr|math)\.uwaterloo\.ca$/.test(host) && /\/hac(?:\/|$)/.test(pathname)) ||
      (host === 'tekniskkulturarv.dk' && /^\/book\//.test(pathname));
  }
  function sourceLink(rec) {
    const original = rec.source_url || (rec.source_provenance && rec.source_provenance.url);
    const erratum = rec.citation_erratum;
    const mistaken = incorrectSourceLinks[original];
    const replacement = sourceLinkUpdates[original];
    const destination = mistaken ? mistaken.related : (replacement || original);
    const warning = mistaken
      ? '<p>The original dataset citation points to a different work (' + esc(mistaken.work) + '). This does not authenticate the record.</p>'
      : (replacement ? '<p>Original dataset citation unavailable. This does not authenticate the record.</p>' : '');
    let link = '';
    if (destination) {
      try {
        const url = new URL(destination);
        if (/^https?:$/.test(url.protocol) && isEbookDestination(url)) {
          link = '<p>Book source credited in the record metadata; no ebook link is provided.</p>';
        } else if (/^https?:$/.test(url.protocol)) {
          link = '<a href="' + esc(url.href) + '" target="_blank" rel="noopener noreferrer">' +
            (replacement || mistaken ? 'Related verified resource' : 'Dataset source citation') + '</a>';
        }
      } catch (error) { /* Retain any warning; never turn malformed text into a link. */ }
    }
    const note = erratum && erratum.note
      ? '<p>Citation note: ' + esc(erratum.note) + '</p>'
      : '';
    return link || warning || note
      ? '<div class="corpus-source" style="margin-top:0.7em;font-size:0.9em">' + link + warning + note + '</div>'
      : '';
  }

  function recordStatus(rec) {
    const pair = {
      verified_pair: rec.verification_method === 'engine_replay'
        ? 'Plaintext/ciphertext pair reproduces with a museum engine.'
        : (rec.verification_method === 'documented_computation'
          ? 'Plaintext/ciphertext pair checked by documented computation.'
          : 'Pair is marked verified; check its stated verification method.'),
      unverified_pair: 'Plaintext/ciphertext pair has not been independently verified; do not use as a known-answer test.',
      not_a_pair: 'Plaintext and ciphertext cover different extents; do not use as a known-answer pair.'
    }[rec.pair_status] || 'Pair verification status unknown.';
    const provenance = {
      synthetic: 'Synthetic exercise.',
      reconstruction: 'Teaching reconstruction, not a historical transcription.',
      catalogued_unreviewed: 'Historical source attribution has not been independently verified.',
      authentic_excerpt: 'Historical excerpt; see the record source for its scope.',
      authentic_artifact: 'Historical artifact; see the record source for its scope.'
    }[rec.authenticity] || 'Provenance not independently verified.';
    return '<div class="corpus-status">' +
      '<b>v0.8 record:</b> ' + esc(provenance) + ' ' + esc(pair) + '</div>';
  }

  // Safely escape HTML to prevent XSS from record data
  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Page state for pagination
  const PAGE_SIZE = 12;
  let page = 0;
  let filtered = records;

  function applyFilter() {
    const q = ((document.getElementById('corpus-search') || {}).value || '').trim();
    const diff = (document.getElementById('corpus-diff-filter') || {}).value || '';
    filtered = records.filter(r => {
      if (diff && r.difficulty !== diff) return false;
      if (q) {
        const haystack = (r.cipher_type + ' ' + r.cipher_family + ' ' + r.language + ' ' + r.title).toLowerCase();
        if (!haystack.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    page = 0;
    renderCards();
  }

  function renderCards() {
    const container = document.getElementById('corpus-cards');
    if (!container) return;
    container.innerHTML = '';

    const start = page * PAGE_SIZE;
    const pageRecords = filtered.slice(start, start + PAGE_SIZE);

    if (filtered.length === 0) {
      container.innerHTML = '<p style="color:var(--fg-muted,#bfa76a)">No records match.</p>';
      renderPager();
      return;
    }

    for (const rec of pageRecords) {
      container.appendChild(renderCard(rec));
    }
    renderPager();
  }

  function renderPager() {
    let pager = document.getElementById('corpus-pager');
    if (!pager) {
      pager = document.createElement('div');
      pager.id = 'corpus-pager';
      pager.style.cssText = 'display:flex;gap:0.5em;align-items:center;margin:1em 0;flex-wrap:wrap;';
      const container = document.getElementById('corpus-cards');
      if (container) container.after(pager);
    }
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    pager.innerHTML = '';

    if (totalPages <= 1) return;

    const prev = document.createElement('button');
    prev.textContent = '← Prev';
    prev.disabled = page === 0;
    prev.onclick = () => { page--; renderCards(); window.scrollTo(0,0); };
    pager.appendChild(prev);

    const info = document.createElement('span');
    info.style.cssText = 'color:var(--fg-muted,#bfa76a);font-size:0.95em;';
    info.textContent = `Page ${page + 1} of ${totalPages} (${filtered.length} records)`;
    pager.appendChild(info);

    const next = document.createElement('button');
    next.textContent = 'Next →';
    next.disabled = page >= totalPages - 1;
    next.onclick = () => { page++; renderCards(); window.scrollTo(0,0); };
    pager.appendChild(next);
  }

  function renderCard(rec) {
    const card = document.createElement('div');
    card.className = 'corpus-card';
    const isChallenge = mode === 'challenge';

    // Safe onclick handler using data-id instead of inline string injection
    card.innerHTML = `
      <div><b>${esc(rec.title)}</b></div>
      <div class="corpus-meta">
        <span>${esc(rec.cipher_type)}</span> | <span>${esc(rec.cipher_family)}</span> | <span>${esc(rec.difficulty)}</span> | <span>${esc(rec.language)}</span> | <span>${esc(rec.source_type)}</span>
      </div>
      <div class="ciphertext-block corpus-ciphertext">${esc(rec.ciphertext)}</div>
      ${recordStatus(rec)}
      <div class="corpus-visuals" style="margin:0.7em 0 0.7em 0;">
        <div><b>Letter Frequency</b></div>
        <canvas width="220" height="60" class="freq-canvas"></canvas>
        <div style="margin-top:0.5em;"><b>Bigram Heatmap</b></div>
        <canvas width="220" height="60" class="bigram-canvas"></canvas>
      </div>
      <div class="corpus-actions">
        <button class="btn-copy">Copy Ciphertext</button>
        <button class="btn-detective">Try in Cipher Detective</button>
        <button class="btn-workbench">Open in Workbench</button>
        <button class="btn-download-rec">Download Record</button>
      </div>
      <div class="corpus-reveal" style="margin-top:0.7em;${isChallenge ? '' : 'display:none;'}">
        <button class="btn-reveal" data-reveal="hint">Reveal Hint</button>
        <button class="btn-reveal" data-reveal="cipher">Reveal Cipher Type</button>
        <button class="btn-reveal" data-reveal="key">Reveal Key</button>
        <button class="btn-reveal" data-reveal="plaintext">Reveal Plaintext</button>
      </div>
      <div class="corpus-known" style="${isChallenge ? 'display:none;' : ''}margin-top:0.7em;">
        <div style="font-size:0.93em;color:var(--fg-muted,#bfa76a)">
          <b>Plaintext:</b> <span class="known-plaintext">${esc(rec.plaintext)}</span><br>
          <b>Key:</b> <code>${esc(JSON.stringify(rec.key))}</code><br>
          <b>Attacks:</b> ${esc((rec.expected_attacks || []).join(', '))}
          ${rec.scoring_notes ? '<br><b>Scoring:</b> ' + esc(rec.scoring_notes) : ''}
        </div>
      </div>
      ${sourceLink(rec)}
      <div class="corpus-details" style="display:none;margin-top:0.7em;font-size:0.93em;color:var(--fg-muted,#bfa76a);"></div>
    `;

    // Draw frequency and bigram visualisations
    setTimeout(() => {
      const freqCanvas = card.querySelector('.freq-canvas');
      if (freqCanvas) drawFrequencyBar(freqCanvas, rec.ciphertext);
      const bigramCanvas = card.querySelector('.bigram-canvas');
      if (bigramCanvas) drawBigramHeatmap(bigramCanvas, rec.ciphertext);
    }, 0);

    // Wire up buttons using event listeners — no inline JS, no XSS risk
    card.querySelector('.btn-copy').addEventListener('click', function() {
      const button = this;
      function selectForCopy() {
        const block = card.querySelector('.ciphertext-block');
        const range = document.createRange(); range.selectNodeContents(block);
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
        button.textContent = 'Text selected — copy manually';
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(rec.ciphertext).then(() => {
          button.textContent = 'Copied!';
          setTimeout(() => { button.textContent = 'Copy Ciphertext'; }, 1200);
        }, selectForCopy);
      } else selectForCopy();
    });
    card.querySelector('.btn-detective').addEventListener('click', () => {
      openInDetective(rec.ciphertext);
    });
    card.querySelector('.btn-workbench').addEventListener('click', () => {
      openInWorkbench(rec.ciphertext);
    });
    card.querySelector('.btn-download-rec').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = rec.id + '.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    });

    card.querySelectorAll('.btn-reveal').forEach(btn => {
      btn.addEventListener('click', function() {
        const details = card.querySelector('.corpus-details');
        details.style.display = 'block';
        const type = this.dataset.reveal;
        if (type === 'hint') details.textContent = rec.notes || 'No hint available.';
        if (type === 'cipher') details.textContent = 'Cipher type: ' + rec.cipher_type;
        if (type === 'key') details.textContent = 'Key: ' + JSON.stringify(rec.key);
        if (type === 'plaintext') details.textContent = 'Plaintext: ' + rec.plaintext;
      });
    });

    return card;
  }

  function drawFrequencyBar(canvas, text) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const counts = Array(26).fill(0);
    const A = 'A'.charCodeAt(0);
    for (const c of text.toUpperCase()) {
      const code = c.charCodeAt(0) - A;
      if (code >= 0 && code < 26) counts[code]++;
    }
    const max = Math.max(...counts, 1);
    for (let i = 0; i < 26; ++i) {
      const x = i * 8 + 6;
      const h = Math.round((counts[i] / max) * 50);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(x, 55 - h, 6, h);
      ctx.fillStyle = '#bfa76a';
      ctx.font = '8px monospace';
      ctx.fillText(String.fromCharCode(A + i), x, 59);
    }
  }

  function drawBigramHeatmap(canvas, text) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bigrams = {};
    let prev = null;
    for (const c of text.toUpperCase()) {
      if (c >= 'A' && c <= 'Z') {
        if (prev) bigrams[prev + c] = (bigrams[prev + c] || 0) + 1;
        prev = c;
      }
    }
    const entries = Object.entries(bigrams).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const max = entries.length ? entries[0][1] : 1;
    entries.forEach(([bg, count], i) => {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(10, 6 + i * 5, Math.round((count / max) * 180), 4);
      ctx.fillStyle = '#bfa76a';
      ctx.font = '8px monospace';
      ctx.fillText(bg, 2, 10 + i * 5);
    });
  }

  // Mode toggle — button group (.mode-btn / .mode-btn.active)
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode));
    btn.addEventListener('click', function() {
      document.querySelectorAll('.mode-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      this.classList.add('active');
      this.setAttribute('aria-pressed', 'true');
      mode = this.dataset.mode;
      const explanation = document.getElementById('mode-explanation');
      if (explanation) {
        explanation.textContent = mode === 'challenge'
          ? 'Challenge Mode hides the solution — attempt a ciphertext-only solve. Switch to Known Answers to see plaintext, key, and expected attacks.'
          : 'Known Answers shows plaintext, key, and expected attacks for each record — for teaching, benchmarking, and tool development.';
      }
      renderCards();
    });
  });

  // Wire up filter controls if present
  const searchInput = document.getElementById('corpus-search');
  if (searchInput) searchInput.addEventListener('input', applyFilter);
  const diffFilter = document.getElementById('corpus-diff-filter');
  if (diffFilter) diffFilter.addEventListener('change', applyFilter);

  renderCards();
})();
```


## JavaScript — js/cipher-detective.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/cipher-detective.js`
- Served SHA-256: `402c542f823162b39cdaaf7dedf1e58b7a9058b79157601f418bd135ccf466c2`
- Readable-source SHA-256: `402c542f823162b39cdaaf7dedf1e58b7a9058b79157601f418bd135ccf466c2`


```javascript
/* ================================================================
   THE CIPHER MUSEUM — Cipher Detective v1.5 compatibility shim

   This file loads the v1.5 modular sub-packages and re-exports
   window.CipherDetective for backward compatibility with
   test-comprehensive.js and any other callers.

   In the browser the four <script> tags in cipher-detective.html
   load the modules directly; this shim is only used by Node.js
   test runners that require() this single file.
   ================================================================ */
'use strict';

if (typeof require !== 'undefined') {
  /* Node / test runner context: load sub-modules explicitly. */
  require('./detective/analyses.js');
  require('./detective/scoring.js');
  require('./detective/render.js');
  require('./detective/detective.js');
}
/* In a browser context the <script> tags in the HTML page are
   sufficient; nothing more needs to happen here. */
```
