/* ─── Cipher Museum — Image Lightbox ─── */
document.addEventListener('DOMContentLoaded', function () {
  // Build overlay
  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Enlarged image');

  var closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '\u00D7';

  var lbImg = document.createElement('img');
  lbImg.src = '';
  lbImg.alt = '';

  var caption = document.createElement('div');
  caption.className = 'lightbox-caption';

  overlay.appendChild(closeBtn);
  overlay.appendChild(lbImg);
  overlay.appendChild(caption);
  document.body.appendChild(overlay);

  function openLightbox(src, alt, cap) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    caption.textContent = cap || '';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  // Close handlers
  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    closeLightbox();
  });

  overlay.addEventListener('click', function (e) {
    if (e.target !== lbImg) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Attach click handler to every .figure img on the page
  var imgs = document.querySelectorAll('.figure img');
  for (var i = 0; i < imgs.length; i++) {
    (function (img) {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var fig = img.closest('figure') || img.closest('.figure');
        var capEl = fig ? fig.querySelector('.figure-caption') : null;
        openLightbox(img.src, img.alt, capEl ? capEl.textContent : '');
      });
    })(imgs[i]);
  }
});
