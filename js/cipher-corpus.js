// Cipher Corpus Browser UI

(async function() {
  let records = [];
  if (typeof fetch === 'function') {
    // Load the browser sample (balanced ~100 records) — full corpus available via download buttons
    const res = await fetch('/public/corpus/browser-sample.json');
    records = await res.json();
  }
  let mode = 'challenge';

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
    const q = (document.getElementById('corpus-search') || {}).value || '';
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
        </div>
      </div>
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
      navigator.clipboard.writeText(rec.ciphertext).catch(() => {});
      this.textContent = 'Copied!';
      setTimeout(() => { this.textContent = 'Copy Ciphertext'; }, 1200);
    });
    card.querySelector('.btn-detective').addEventListener('click', () => {
      navigator.clipboard.writeText(rec.ciphertext).catch(() => {});
      window.open('/cipher-detective.html', '_blank');
    });
    card.querySelector('.btn-workbench').addEventListener('click', () => {
      navigator.clipboard.writeText(rec.ciphertext).catch(() => {});
      window.open('/lab/workbench.html', '_blank');
    });
    card.querySelector('.btn-download-rec').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = rec.id + '.json';
      a.click();
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
    btn.addEventListener('click', function() {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
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
