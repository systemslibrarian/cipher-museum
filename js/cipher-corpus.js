// Cipher Corpus Browser UI (v0.1 MVP)

(async function() {
  // Load corpus data
  let records = [];
  if (typeof fetch === 'function') {
    const res = await fetch('/public/corpus/all.json');
    records = await res.json();
  } else {
    // fetch not available (e.g., Node.js test environment)
    records = [];
  }
  let mode = 'challenge';

  function renderCards() {
    const cards = document.getElementById('corpus-cards');
    cards.innerHTML = '';
    for (const rec of records) {
      cards.appendChild(renderCard(rec));
    }
  }

  function renderCard(rec) {
    const card = document.createElement('div');
    card.className = 'corpus-card';
    card.innerHTML = `
      <div><b>${rec.title}</b></div>
      <div class="corpus-meta">
        <span>${rec.cipher_type}</span> | <span>${rec.cipher_family}</span> | <span>${rec.difficulty}</span> | <span>${rec.language}</span> | <span>${rec.source_type}</span>
      </div>
      <div class="ciphertext-block corpus-ciphertext">${rec.ciphertext}</div>
      <div class="corpus-visuals" style="margin:0.7em 0 0.7em 0;">
        <div><b>Letter Frequency</b></div>
        <canvas width="220" height="60" class="freq-canvas"></canvas>
        <div style="margin-top:0.5em;"><b>Bigram Heatmap</b></div>
        <canvas width="220" height="60" class="bigram-canvas"></canvas>
      </div>
      <div class="corpus-actions">
        <button onclick="navigator.clipboard.writeText('${rec.ciphertext.replace(/'/g,"&#39;")}");showCopied(this)">Copy Ciphertext</button>
        <button onclick="openDetective('${rec.id}','${rec.ciphertext.replace(/'/g,"&#39;")}' )">Try in Cipher Detective</button>
        <button onclick="openWorkbench('${rec.id}','${rec.ciphertext.replace(/'/g,"&#39;")}' )">Open in Workbench</button>
        <button onclick="downloadRecord('${rec.id}')">Download Record</button>
      </div>
      <div class="corpus-reveal" style="margin-top:0.7em;">
        <button onclick="toggleReveal(this, 'hint')">Reveal Hint</button>
        <button onclick="toggleReveal(this, 'cipher')">Reveal Cipher Type</button>
        <button onclick="toggleReveal(this, 'key')">Reveal Key</button>
        <button onclick="toggleReveal(this, 'plaintext')">Reveal Plaintext</button>
      </div>
      <div class="corpus-details" style="display:none;margin-top:0.7em;"></div>
    `;
    // Draw frequency analysis
    setTimeout(() => {
      const freqCanvas = card.querySelector('.freq-canvas');
      if (freqCanvas) drawFrequencyBar(freqCanvas, rec.ciphertext);
      const bigramCanvas = card.querySelector('.bigram-canvas');
      if (bigramCanvas) drawBigramHeatmap(bigramCanvas, rec.ciphertext);
    }, 0);
      // Draw letter frequency bar chart
      function drawFrequencyBar(canvas, text) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const counts = Array(26).fill(0);
        const A = 'A'.charCodeAt(0);
        let total = 0;
        for (const c of text.toUpperCase()) {
          const code = c.charCodeAt(0) - A;
          if (code >= 0 && code < 26) {
            counts[code]++;
            total++;
          }
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

      // Draw bigram heatmap (simple horizontal bar for most common bigrams)
      function drawBigramHeatmap(canvas, text) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bigrams = {};
        let prev = null;
        for (const c of text.toUpperCase()) {
          if (c >= 'A' && c <= 'Z') {
            if (prev) {
              const bg = prev + c;
              bigrams[bg] = (bigrams[bg] || 0) + 1;
            }
            prev = c;
          }
        }
        const entries = Object.entries(bigrams).sort((a,b)=>b[1]-a[1]).slice(0,10);
        const max = entries.length ? entries[0][1] : 1;
        entries.forEach(([bg, count], i) => {
          ctx.fillStyle = '#ffd700';
          ctx.fillRect(10, 6 + i*5, Math.round((count/max)*180), 4);
          ctx.fillStyle = '#bfa76a';
          ctx.font = '8px monospace';
          ctx.fillText(bg, 2, 10 + i*5);
        });
      }
    card.querySelectorAll('.corpus-reveal button').forEach(btn => {
      btn.addEventListener('click', function() {
        const details = card.querySelector('.corpus-details');
        details.style.display = 'block';
        if (this.textContent.includes('Hint')) details.textContent = rec.notes || 'No hint.';
        if (this.textContent.includes('Cipher')) details.textContent = rec.cipher_type;
        if (this.textContent.includes('Key')) details.textContent = JSON.stringify(rec.key);
        if (this.textContent.includes('Plaintext')) details.textContent = rec.plaintext;
      });
    });
    return card;
  }

  // Mode toggle
  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', e => {
      mode = e.target.value;
      renderCards();
    });
  });

  window.showCopied = function(btn) {
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy Ciphertext'; }, 1200);
  };
  window.openDetective = function(id, ct) {
    navigator.clipboard.writeText(ct);
    window.open('/cipher-detective.html', '_blank');
  };
  window.openWorkbench = function(id, ct) {
    navigator.clipboard.writeText(ct);
    window.open('/lab/workbench.html', '_blank');
  };
  window.downloadRecord = function(id) {
    const rec = records.find(r => r.id === id);
    const blob = new Blob([JSON.stringify(rec, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = id + '.json';
    a.click();
  };
  window.downloadFile = function(name) {
    window.open('/public/corpus/' + name, '_blank');
  };

  renderCards();
})();
