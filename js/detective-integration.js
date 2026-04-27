// detective-integration.js: Example integration for Cipher Detective

function openInDetective(ciphertext) {
  const url = `https://cipherdetective.com/?ciphertext=${encodeURIComponent(ciphertext)}`;
  window.open(url, '_blank');
}

// workbench-integration.js: Example integration for Codebreaker's Workbench
function openInWorkbench(ciphertext) {
  const url = `https://cipherworkbench.com/?ciphertext=${encodeURIComponent(ciphertext)}`;
  window.open(url, '_blank');
}

// Add integration buttons to each corpus card (if not present)
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.corpus-card');
  cards.forEach(card => {
    const ct = card.querySelector('.ciphertext-block');
    if (!ct) return;
    const actions = card.querySelector('.corpus-actions');
    if (!actions) return;
    if (!actions.querySelector('.detective-btn')) {
      const btn = document.createElement('button');
      btn.textContent = 'Open in Detective';
      btn.className = 'detective-btn';
      btn.onclick = () => openInDetective(ct.textContent);
      actions.appendChild(btn);
    }
    if (!actions.querySelector('.workbench-btn')) {
      const btn = document.createElement('button');
      btn.textContent = 'Open in Workbench';
      btn.className = 'workbench-btn';
      btn.onclick = () => openInWorkbench(ct.textContent);
      actions.appendChild(btn);
    }
  });
});
