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
      <div class="corpus-actions">
        <button onclick="navigator.clipboard.writeText('${rec.ciphertext.replace(/'/g,"&#39;")}');showCopied(this)">Copy Ciphertext</button>
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
