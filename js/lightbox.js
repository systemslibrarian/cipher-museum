/* ─── Cipher Museum — Image Lightbox ─── */
(function(){
  var overlay=document.createElement('div');
  overlay.className='lightbox-overlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-label','Enlarged image');
  overlay.innerHTML='<button class="lightbox-close" aria-label="Close">&times;</button><img src="" alt=""><div class="lightbox-caption"></div>';
  document.body.appendChild(overlay);

  var lbImg=overlay.querySelector('img');
  var caption=overlay.querySelector('.lightbox-caption');
  var closeBtn=overlay.querySelector('.lightbox-close');
  var isOpen=false;

  function open(src,alt,cap){
    lbImg.src=src;
    lbImg.alt=alt||'';
    caption.textContent=cap||'';
    overlay.classList.add('active');
    document.body.style.overflow='hidden';
    isOpen=true;
    setTimeout(function(){ closeBtn.focus(); },50);
  }

  function close(){
    if(!isOpen) return;
    overlay.classList.remove('active');
    document.body.style.overflow='';
    lbImg.src='';
    isOpen=false;
  }

  /* Close when clicking overlay background (not the enlarged image itself) */
  overlay.addEventListener('click',function(e){
    if(e.target===lbImg) return;
    close();
  });
  closeBtn.addEventListener('click',function(e){
    e.stopPropagation();
    close();
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape') close();
  });

  /* Open when clicking any image inside a .figure container */
  document.querySelectorAll('.figure img').forEach(function(img){
    img.addEventListener('click',function(e){
      e.stopPropagation();
      var fig=img.closest('figure')||img.closest('.figure');
      var cap=fig?fig.querySelector('.figure-caption'):null;
      open(img.src,img.alt,cap?cap.textContent:'');
    });
  });
})();
