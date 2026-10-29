# javascript appendix 5

Snapshot: `51fc1e02338ac0b05976a769f51b401bf3f5a171`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

## JavaScript — js/learning-path.js

**Dormant repository content:** no live HTML reference was found in this snapshot. Do not attribute these quizzes to a currently displayed page.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/learning-path.js`
- Served SHA-256: `cca1c5bddf2c0937585e8c9b843d8c8172576977b10d476e4fb582b559cb6b9d`
- Readable-source SHA-256: `cca1c5bddf2c0937585e8c9b843d8c8172576977b10d476e4fb582b559cb6b9d`


```javascript
'use strict';
/**
 * THE CIPHER MUSEUM — Cryptographer's Path (Learning Mode)
 * Toggleable overlay that sequences users through halls with quizzes & badges.
 * Include on every page: <script src="js/learning-path.js" defer></script>
 */
(function(){
  var HALLS = [
    {id:'ancient',      label:'Hall I',   name:'World Origins of Cryptography', href:'halls/ancient.html'},
    {id:'substitution', label:'Hall II',  name:'Classical Substitution', href:'halls/substitution.html'},
    {id:'polyalphabetic',label:'Hall III',name:'Polyalphabetic',         href:'halls/polyalphabetic.html'},
    {id:'transposition',label:'Hall IV',  name:'Transposition',          href:'halls/transposition.html'},
    {id:'military',     label:'Hall V',   name:'Military & Spy',         href:'halls/military.html'},
    {id:'civil-war',    label:'Hall VI',       name:'Civil War Gallery',      href:'halls/civil-war.html'},
    {id:'machines',     label:'Hall VII', name:'Mechanical Machines',     href:'halls/machines.html'},
    {id:'puzzle',       label:'Hall VIII',name:'Puzzle Ciphers',          href:'halls/puzzle.html'},
    {id:'unbreakable',  label:'Hall IX',  name:'The Unbreakable',        href:'halls/unbreakable.html'},
    {id:'codebreakers', label:'Hall X',   name:'Hall of Codebreakers',   href:'halls/codebreakers.html'},
    {id:'foundations',  label:'Annex',    name:'Hall of Foundations',    href:'hall-of-foundations/index.html'}
  ];

  var QUIZZES = {
    ancient:[
      {q:'What does the traditional modern scytale reconstruction illustrate?',opts:['A substitution cipher','A transposition device using a rod','A Roman military code','A Greek frequency table'],a:1},
      {q:'For a 26-letter alphabet, how many nontrivial Caesar shifts are there (excluding the identity shift)?',opts:['26','25','52','10'],a:1},
      {q:'Which scholar described frequency analysis in a surviving ninth-century treatise?',opts:['Julius Caesar','Al-Kindi','Leon Battista Alberti','Blaise de Vigenère'],a:1}
    ],
    substitution:[
      {q:'What makes frequency analysis effective against monoalphabetic ciphers?',opts:['Each letter always maps to the same cipher letter','The key is too short','The alphabet is preserved','It uses a known plaintext'],a:0},
      {q:'How many permutations are possible for a general monoalphabetic substitution of 26 letters?',opts:['26','26!','2²⁵⁶','52!'],a:1},
      {q:'What does a homophonic cipher do differently?',opts:['Uses polyalphabetic shifting','Assigns multiple symbols to common letters','Encrypts pairs of letters','Transposes text positions'],a:1}
    ],
    polyalphabetic:[
      {q:'What gives repeating-key Vigenère its periodic structure?',opts:['Removing spaces','Reversing the alphabet','Reusing the keyword cyclically','Changing the key after every message'],a:2},
      {q:'What technique did Kasiski use to break the Vigenère cipher?',opts:['Brute force','Finding repeated sequences to suggest possible key lengths','Known plaintext attack','Matrix inversion'],a:1},
      {q:'What makes the Alberti disk historically significant?',opts:['It was unbreakable','It is an early documented device for polyalphabetic substitution','It used a rotor mechanism','It was used in WWII'],a:1}
    ],
    transposition:[
      {q:'What does a transposition cipher preserve?',opts:['Letter positions','Letter frequencies','The key','The alphabet order'],a:1},
      {q:'What does a second transposition pass do?',opts:['Guarantees security','Rearranges positions again according to another key','Changes letter frequencies','Adds substitution'],a:1},
      {q:'In the usual Rail Fence zigzag, what happens if the rail count is at least the message length?',opts:['The letters remain in their original order','The key space becomes infinite','Every letter changes','The message becomes perfectly secret'],a:0}
    ],
    military:[
      {q:'What was ADFGVX designed for?',opts:['Naval communication','WWI German field telegraph','Cold War espionage','WWII Pacific theater'],a:1},
      {q:'Which techniques does VIC combine, without thereby proving it unbreakable?',opts:['A computer and RSA','A checkerboard and two transposition stages','A 256-bit block cipher','An unused one-time pad'],a:1},
      {q:'What can help attack a repeating-key Nihilist substitution?',opts:['Machine learning','Frequency analysis on digit sums with repeating key detection','Brute force','A defector revealed the key'],a:1}
    ],
    'civil-war':[
      {q:'Which side used Stager route systems, for which no Confederate cryptanalytic break is documented?',opts:['Confederate','Union','Both used the same system','Neither used ciphers'],a:1},
      {q:'What type of cipher did the Stager system use?',opts:['Substitution','Route transposition plus code words','Enigma-style rotors','One-time pad'],a:1},
      {q:'Which weakness affected the Confederate repeating-key systems shown here?',opts:['Too complex to use','They relied on Vigenère with known weaknesses','They used physical machines','The keys were too long'],a:1}
    ],
    machines:[
      {q:'Why does an Enigma key-space count need a specified machine and keying procedure?',opts:['Every model has the same settings','Rotor choices, plugboard and permitted settings vary','Enigma has no key','Only message length matters'],a:1},
      {q:'What was the historical significance of Colossus?',opts:['It was the first personal computer','It was an early programmable electronic digital computer for codebreaking','It broke the Caesar cipher','It invented public-key cryptography'],a:1},
      {q:'What Enigma property ensures a letter never encrypts to itself?',opts:['The plugboard','The reflector','The rotors','The ring settings'],a:1}
    ],
    puzzle:[
      {q:'What makes the Pigpen cipher easy to recognize?',opts:['Its numeric output','Its distinctive geometric symbols','Its use of colors','Its ASCII art'],a:1},
      {q:'The Zodiac Killer\'s Z340 cipher was solved after how many years?',opts:['5 years','20 years','Over 50 years','It remains unsolved'],a:2},
      {q:'Bacon\'s cipher is an early example of what?',opts:['Public-key cryptography','Steganography','Hash functions','Digital signatures'],a:1}
    ],
    unbreakable:[
      {q:'Who proved the One-Time Pad is perfectly secret?',opts:['Alan Turing','Claude Shannon','Blaise de Vigenère','Auguste Kerckhoffs'],a:1},
      {q:'What is the One-Time Pad\'s critical practical requirement?',opts:['A computer','A secret, independent, uniformly random key as long as the message, used once','A 256-bit key','A public key exchange'],a:1},
      {q:'Which operational failure enabled VENONA’s partial recoveries?',opts:['Better computers','Duplicated one-time-pad material','A mathematical breakthrough','Social engineering'],a:1}
    ],
    codebreakers:[
      {q:'Whose ninth-century treatise is the earliest surviving description of frequency analysis?',opts:['Al-Kindi (9th century)','Alan Turing (20th century)','Charles Babbage (19th century)','Julius Caesar (1st century BC)'],a:0},
      {q:'What did Marian Rejewski use to initially break Enigma?',opts:['A captured machine','Mathematical group theory applied to rotor permutations','Brute force','A defector'],a:1},
      {q:'What principle states that a cipher\'s security must depend only on the key, not secrecy of the algorithm?',opts:['Shannon\'s theorem','Kerckhoffs\'s principle','Turing\'s law','Diffie-Hellman theorem'],a:1}
    ],
    foundations:[
      {q:'What does the Prime Number Theorem estimate for RSA candidate search?',opts:['Primes become denser as numbers grow','The Prime Number Theorem: about 1 in ln(x) numbers near x is prime','Factoring large numbers is easy'],a:1},
      {q:'Which basis makes coordinate rounding exact in the two-dimensional preset shown here?',opts:['The orthogonal basis','Every short, nearly orthogonal basis','Any skewed basis'],a:0},
      {q:'For a bilinear pairing, e(aP, bQ) equals…',opts:['e(P,Q)^(a+b)','e(P,Q)^(ab)','e(P,Q)^(a−b)'],a:1}
    ]
  };

  var LS_PREFIX = 'ciphermuseum.path.';
  var LS_ACTIVE = LS_PREFIX + 'active';

  // Storage may be blocked, or contain data from an older/corrupted session.
  // Keep the current page usable even when persistence is unavailable.
  var memory = {};
  function readSaved(key){
    if(Object.prototype.hasOwnProperty.call(memory, key)) return memory[key];
    try { return localStorage.getItem(key); } catch(e) { return memory[key] || null; }
  }
  function writeSaved(key, value){
    memory[key] = value;
    try { localStorage.setItem(key, value); } catch(e) { /* session-only progress */ }
  }
  function isActive(){ return readSaved(LS_ACTIVE) === '1'; }
  function getPassedHalls(){
    try{
      var saved = JSON.parse(readSaved(LS_PREFIX+'passed'));
      if(!Array.isArray(saved)) return [];
      return saved.filter(function(id, i){
        return saved.indexOf(id) === i && HALLS.some(function(hall){ return hall.id === id; });
      });
    }
    catch(e){ return []; }
  }
  function setPassedHalls(arr){ writeSaved(LS_PREFIX+'passed', JSON.stringify(arr)); }
  function markPassed(hallId){
    var arr = getPassedHalls();
    if(arr.indexOf(hallId)===-1){ arr.push(hallId); setPassedHalls(arr); }
  }

  /* ── Determine current page context ─────────────────── */
  var path = location.pathname;
  var pageName = path.split('/').pop() || 'index.html';
  var parentDir = path.split('/').slice(-2,-1)[0] || '';
  var inSub = ['halls','ciphers','tours','lab','community','hall-of-foundations'].indexOf(parentDir) !== -1;
  var pre = inSub ? '../' : '';

  function currentHallIndex(){
    if(parentDir==='hall-of-foundations' && pageName==='index.html'){
      for(var f=0;f<HALLS.length;f++){ if(HALLS[f].id==='foundations') return f; }
    }
    if(parentDir!=='halls') return -1;
    var id = pageName.replace('.html','');
    for(var i=0;i<HALLS.length;i++){ if(HALLS[i].id===id) return i; }
    return -1;
  }

  /* ── Create Toggle Button ───────────────────────────── */
  var toggle = document.createElement('button');
  toggle.id = 'lpToggle';
  toggle.setAttribute('aria-label','Toggle Learning Path mode');
  toggle.setAttribute('aria-pressed', String(isActive()));
  toggle.innerHTML = '🎓 <span class="lp-label" style="font-family:var(--fm);font-size:.65rem;letter-spacing:.1em">Learning Path</span>';
  Object.assign(toggle.style, {
    position:'fixed', top:'78px', right:'1rem', zIndex:'190',
    background: 'var(--s2)', border:'1px solid var(--gold-b)', borderRadius:'var(--r)',
    color:'var(--gold)', padding:'.5rem .9rem', cursor:'pointer',
    display:'flex', alignItems:'center', gap:'.4rem',
    transition:'all var(--trs)', boxShadow:'0 4px 16px rgba(0,0,0,.3)'
  });
  /* On narrow screens, collapse to icon-only and move below nav */
  function adjustToggle(){
    var narrow = window.innerWidth <= 600;
    toggle.querySelector('.lp-label').style.display = narrow ? 'none' : '';
    toggle.style.top = narrow ? 'auto' : '78px';
    toggle.style.bottom = narrow ? '70px' : 'auto';
    toggle.style.right = narrow ? '1rem' : '1rem';
  }
  adjustToggle();
  window.addEventListener('resize', adjustToggle);
  toggle.addEventListener('mouseenter',function(){ toggle.style.background='var(--gold-glow)'; });
  toggle.addEventListener('mouseleave',function(){ toggle.style.background='var(--s2)'; });
  document.body.appendChild(toggle);

  /* ── Progress Bar ──────────────────────────────────── */
  var progressBar = document.createElement('div');
  progressBar.id = 'lpProgress';
  progressBar.setAttribute('role','progressbar');
  progressBar.setAttribute('aria-label','Learning Path progress');
  Object.assign(progressBar.style, {
    position:'fixed', top:'62px', left:'0', right:'0', height:'4px',
    background:'var(--s3)', zIndex:'199', display:'none'
  });
  var progressFill = document.createElement('div');
  Object.assign(progressFill.style, {
    height:'100%', background:'linear-gradient(90deg,var(--gold-dim),var(--gold))',
    transition:'width .4s ease', width:'0%', borderRadius:'0 2px 2px 0'
  });
  progressBar.appendChild(progressFill);
  document.body.appendChild(progressBar);

  /* ── Next Hall Navigation ──────────────────────────── */
  var nextBar = document.createElement('div');
  nextBar.id = 'lpNext';
  Object.assign(nextBar.style, {
    position:'fixed', bottom:'0', left:'0', right:'0', zIndex:'195',
    background:'rgba(6,6,8,.95)', backdropFilter:'blur(12px)',
    borderTop:'1px solid var(--gold-b)', padding:'.75rem 1rem',
    display:'none', alignItems:'center', justifyContent:'space-between',
    flexWrap:'wrap', gap:'.5rem', fontSize:'.85rem'
  });
  document.body.appendChild(nextBar);

  function updateProgress(){
    var passed = getPassedHalls();
    var pct = Math.round((passed.length / HALLS.length) * 100);
    progressFill.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', String(pct));
    progressBar.setAttribute('aria-valuemin','0');
    progressBar.setAttribute('aria-valuemax','100');
  }

  function updateNextBar(){
    var idx = currentHallIndex();
    var passed = getPassedHalls();
    nextBar.innerHTML = '';
    if(idx === -1){
      /* Not on a hall page — show dashboard link + dismiss button */
      nextBar.innerHTML =
        '<span style="font-family:var(--fm);font-size:.65rem;letter-spacing:.1em;color:var(--tx3)">LEARNING PATH ACTIVE</span>' +
        '<div style="display:flex;align-items:center;gap:1rem">' +
          '<a href="'+pre+'my-path.html" style="font-family:var(--fd);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);text-decoration:none">My Dashboard →</a>' +
          '<button id="lpDismiss" style="background:none;border:1px solid var(--s5);color:var(--tx3);font-family:var(--fm);font-size:.6rem;padding:.3rem .6rem;border-radius:var(--r);cursor:pointer;letter-spacing:.08em" title="Turn off Learning Path">✕ OFF</button>' +
        '</div>';
      var dismissBtn = document.getElementById('lpDismiss');
      if(dismissBtn) dismissBtn.addEventListener('click', function(){ deactivate(); });
      return;
    }
    /* On a hall page */
    var hall = HALLS[idx];
    var isPassed = passed.indexOf(hall.id) !== -1;
    var nextIdx = idx + 1;
    var quizBtn = '';
    if(!isPassed && QUIZZES[hall.id]){
      quizBtn = '<button id="lpQuizBtn" style="font-family:var(--fd);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--black);background:var(--gold);border:none;padding:.5rem 1.2rem;border-radius:var(--r);cursor:pointer">Take Quiz</button>';
    } else if(isPassed){
      quizBtn = '<span style="font-family:var(--fm);font-size:.65rem;letter-spacing:.1em;color:var(--green)">✓ PASSED</span>';
    }
    var nextLink = '';
    if(nextIdx < HALLS.length){
      nextLink = '<a href="'+pre+HALLS[nextIdx].href+'" style="font-family:var(--fd);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);text-decoration:none">Next: '+HALLS[nextIdx].name+' →</a>';
    } else {
      nextLink = '<a href="'+pre+'my-path.html" style="font-family:var(--fd);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);text-decoration:none">View Dashboard →</a>';
    }
    nextBar.innerHTML =
      '<span style="font-family:var(--fm);font-size:.65rem;letter-spacing:.1em;color:var(--tx3)">' + hall.label + ' · ' + hall.name + '</span>' +
      '<div style="display:flex;align-items:center;gap:1rem">' + quizBtn + nextLink + '</div>';
    var qb = document.getElementById('lpQuizBtn');
    if(qb) qb.addEventListener('click', function(){ showQuiz(hall.id); });
  }

  /* ── Quiz Modal ──────────────────────────────────── */
  function showQuiz(hallId){
    var questions = QUIZZES[hallId];
    if(!questions) return;
    var overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position:'fixed',inset:'0',zIndex:'500',
      background:'rgba(0,0,0,.8)',backdropFilter:'blur(6px)',
      display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem'
    });
    var modal = document.createElement('div');
    Object.assign(modal.style, {
      background:'var(--s2)',border:'1px solid var(--gold-b)',borderRadius:'var(--rl)',
      padding:'2.5rem',maxWidth:'600px',width:'100%',maxHeight:'80vh',overflowY:'auto'
    });
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Learning Path quiz');
    var previousFocus = document.activeElement;
    var previousOverflow = document.body.style.overflow;
    overlay.appendChild(modal);
    function closeQuiz(){
      overlay.remove();
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      updateProgress(); updateNextBar();
      (previousFocus && previousFocus.isConnected ? previousFocus : toggle).focus();
    }
    function onKey(e){
      if(e.key === 'Escape'){ e.preventDefault(); closeQuiz(); return; }
      if(e.key !== 'Tab') return;
      var buttons = modal.querySelectorAll('button:not([disabled]),a[href],input,select,textarea');
      if(!buttons.length) return;
      var first = buttons[0], last = buttons[buttons.length - 1];
      if(!modal.contains(document.activeElement) || (e.shiftKey && document.activeElement === first) ||
         (!e.shiftKey && document.activeElement === last)){
        e.preventDefault(); (e.shiftKey ? last : first).focus();
      }
    }
    overlay.addEventListener('click',function(e){ if(e.target===overlay) closeQuiz(); });
    document.addEventListener('keydown', onKey);

    var currentQ = 0;
    var score = 0;

    function renderQ(){
      var q = questions[currentQ];
      modal.innerHTML =
        '<div style="font-family:var(--fm);font-size:.6rem;letter-spacing:.15em;color:var(--tx3);margin-bottom:1rem">QUESTION ' + (currentQ+1) + ' OF ' + questions.length + '</div>' +
        '<p style="font-family:var(--fd);font-size:1.15rem;color:var(--tx);margin-bottom:1.5rem;line-height:1.5">' + escapeHTML(q.q) + '</p>' +
        '<div id="quizOpts" style="display:flex;flex-direction:column;gap:.6rem"></div>' +
        '<button type="button" class="lp-quiz-dismiss" style="margin-top:1rem">Close quiz</button>';
      var optsEl = modal.querySelector('#quizOpts');
      modal.querySelector('.lp-quiz-dismiss').addEventListener('click', closeQuiz);
      q.opts.forEach(function(opt,i){
        var btn = document.createElement('button');
        Object.assign(btn.style, {
          fontFamily:'var(--fb)',fontSize:'1rem',textAlign:'left',
          padding:'.85rem 1.2rem',border:'1px solid var(--s5)',borderRadius:'var(--r)',
          background:'var(--s3)',color:'var(--tx2)',cursor:'pointer',transition:'all .2s'
        });
        btn.textContent = opt;
        btn.addEventListener('mouseenter',function(){ btn.style.borderColor='var(--gold-b)';btn.style.color='var(--tx)'; });
        btn.addEventListener('mouseleave',function(){ btn.style.borderColor='var(--s5)';btn.style.color='var(--tx2)'; });
        btn.addEventListener('click', function(){
          if(i === q.a) score++;
          currentQ++;
          if(currentQ < questions.length){ renderQ(); }
          else { renderResult(); }
        });
        optsEl.appendChild(btn);
      });
      optsEl.querySelector('button').focus();
    }

    function renderResult(){
      var passed = score >= 2; /* Pass = 2/3 correct */
      if(passed) markPassed(hallId);
      modal.innerHTML =
        '<div style="text-align:center">' +
          '<div style="font-size:3rem;margin-bottom:1rem">' + (passed ? '🏆' : '📖') + '</div>' +
          '<p style="font-family:var(--fd);font-size:1.3rem;color:'+(passed?'var(--gold)':'var(--tx)')+';margin-bottom:.5rem">' +
            (passed ? 'Hall Completed!' : 'Keep Studying') + '</p>' +
          '<p style="font-family:var(--fm);font-size:.75rem;color:var(--tx3);margin-bottom:1.5rem">' +
            score + ' / ' + questions.length + ' correct' +
            (passed ? '' : ' — need 2 to pass') + '</p>' +
          (passed ? '<div style="margin-bottom:1.5rem"><svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" fill="none" stroke="var(--gold)" stroke-width="2"/><circle cx="40" cy="40" r="28" fill="var(--gold-glow)" stroke="var(--gold-dim)" stroke-width="1"/><text x="40" y="36" text-anchor="middle" font-family="var(--fd)" font-size="11" fill="var(--gold)" letter-spacing=".1em">BADGE</text><text x="40" y="50" text-anchor="middle" font-family="var(--fm)" font-size="7" fill="var(--tx3)">' + escapeHTML(hallId.toUpperCase()) + '</text></svg></div>' : '') +
          '<button id="quizClose" style="font-family:var(--fd);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--black);background:var(--gold);border:none;padding:.65rem 1.5rem;border-radius:var(--r);cursor:pointer">' +
            (passed ? 'Continue' : 'Try Again Later') + '</button>' +
        '</div>';
      modal.querySelector('#quizClose').addEventListener('click', closeQuiz);
      modal.querySelector('#quizClose').focus();
    }

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    renderQ();
  }

  function escapeHTML(s){
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }

  /* ── Activate / Deactivate ─────────────────────────── */
  function activate(){
    writeSaved(LS_ACTIVE, '1');
    document.body.classList.add('learning-path-active');
    toggle.setAttribute('aria-pressed','true');
    toggle.style.borderColor = 'var(--gold)';
    toggle.style.background = 'rgba(201,168,76,.12)';
    progressBar.style.display = 'block';
    nextBar.style.display = 'flex';
    updateProgress();
    updateNextBar();
  }

  function deactivate(){
    writeSaved(LS_ACTIVE, '0');
    document.body.classList.remove('learning-path-active');
    toggle.setAttribute('aria-pressed','false');
    toggle.style.borderColor = 'var(--gold-b)';
    toggle.style.background = 'var(--s2)';
    progressBar.style.display = 'none';
    nextBar.style.display = 'none';
  }

  toggle.addEventListener('click', function(){
    if(isActive()) deactivate(); else activate();
  });

  /* ── Auto-activate on load if previously active ───── */
  if(isActive()) activate();
})();
```


## JavaScript — js/lightbox.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/lightbox.js`
- Served SHA-256: `df66c54172a603518ed1085ddbe3b963fef68a5a2846e0836ba96386b2286c15`
- Readable-source SHA-256: `df66c54172a603518ed1085ddbe3b963fef68a5a2846e0836ba96386b2286c15`


```javascript
/* ─── Cipher Museum — Image & Diagram Lightbox ─── */
document.addEventListener('DOMContentLoaded', function () {
  // Build overlay
  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Enlarged image');

  var closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '×';

  var lbImg = document.createElement('img');
  lbImg.src = '';
  lbImg.alt = '';

  // Inline SVG figures are enlarged by cloning the node, not via src
  var svgHolder = document.createElement('div');

  var caption = document.createElement('div');
  caption.className = 'lightbox-caption';

  overlay.appendChild(closeBtn);
  overlay.appendChild(lbImg);
  overlay.appendChild(svgHolder);
  overlay.appendChild(caption);
  document.body.appendChild(overlay);

  var lastTrigger = null; // focus returns here on close
  var previousOverflow = '';
  function lockScroll(){
    if(!overlay.classList.contains('active')) previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  function openLightbox(src, alt, cap) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lbImg.style.display = '';
    caption.textContent = cap || '';
    lockScroll();
    overlay.classList.add('active');
    closeBtn.focus();
  }

  function openLightboxSvg(svgEl, cap) {
    var clone = svgEl.cloneNode(true);
    // The in-page figure caps its own width; let the enlarged copy fill the viewport
    clone.style.maxWidth = '92vw';
    clone.style.maxHeight = '90vh';
    clone.style.width = '1100px';
    clone.style.height = 'auto';
    clone.removeAttribute('tabindex');
    clone.removeAttribute('role');
    svgHolder.innerHTML = '';
    svgHolder.appendChild(clone);
    lbImg.style.display = 'none';
    caption.textContent = cap || '';
    lockScroll();
    overlay.classList.add('active');
    closeBtn.focus();
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = previousOverflow;
    lbImg.src = '';
    svgHolder.innerHTML = '';
    if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
  }

  // Close handlers
  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    closeLightbox();
  });

  overlay.addEventListener('click', function (e) {
    if (e.target !== lbImg && !svgHolder.contains(e.target)) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') {
      e.preventDefault(); closeLightbox();
    } else if (e.key === 'Tab') {
      // Images/diagrams are display content; Close is the sole dialog control.
      e.preventDefault(); closeBtn.focus();
    }
  });

  function captionFor(el) {
    var fig = el.closest('figure') || el.closest('.figure');
    var capEl = fig ? fig.querySelector('.figure-caption') : null;
    return capEl ? capEl.textContent : '';
  }

  // Make a figure openable by mouse and keyboard alike
  function attach(el, open) {
    el.style.cursor = 'zoom-in';
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    var base = el.getAttribute('aria-label') || el.getAttribute('alt') || 'figure';
    el.setAttribute('aria-label', 'Enlarge: ' + base);
    function fire(e) {
      e.preventDefault();
      e.stopPropagation();
      lastTrigger = el;
      open();
    }
    el.addEventListener('click', fire);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') fire(e);
    });
  }

  document.querySelectorAll('.figure img').forEach(function (img) {
    attach(img, function () { openLightbox(img.src, img.alt, captionFor(img)); });
  });

  document.querySelectorAll('.figure svg').forEach(function (svg) {
    attach(svg, function () { openLightboxSvg(svg, captionFor(svg)); });
  });
});
```


## JavaScript — js/manual-cipher-demos.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/manual-cipher-demos.js`
- Served SHA-256: `84b99d862dc976f26d28d4d7b91d765025a4c98cfd3103ffa76a2b346b49f3ab`
- Readable-source SHA-256: `84b99d862dc976f26d28d4d7b91d765025a4c98cfd3103ffa76a2b346b49f3ab`


```javascript
/* Original-manual demos: rendering only. Procedures and traces live in CipherEngines. */
(function () {
  'use strict';
  const root = document.querySelector('[data-manual-demo]');
  if (!root) return;
  const name = root.dataset.manualDemo;
  const engine = window.CipherEngines && window.CipherEngines[name];
  const $ = id => root.querySelector('#' + id);
  let mode = 'encrypt', trace = null, frames = [], progress = 0, timer = null;
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function stop() {
    if (timer !== null) { clearInterval(timer); timer = null; }
    $('manual-play').textContent = 'Play';
    $('manual-play').setAttribute('aria-pressed', 'false');
  }
  function key() {
    if (name === 'rasterschluessel44') {
      for (const id of ['rs-row', 'rs-column', 'rs-minute']) {
        if (!$(id).value.trim()) throw new Error('Beginning row, column and minute are required.');
      }
      return { startRow: Number($('rs-row').value) - 1, startColumn: Number($('rs-column').value) - 1,
        minute: Number($('rs-minute').value), strict: $('rs-policy').value === 'strict' };
    }
    if (name === 'doublePlayfair') return {
      squareA: $('dp-a').value, squareB: $('dp-b').value, filler: $('dp-filler').value, strict: true
    };
    const value = $('amsco-key').value.trim();
    if (!value) throw new Error('Enter a permutation of column ranks, such as 41325.');
    if (!/^\d+(?:\s+\d+)*$/.test(value)) throw new Error('Column ranks must be digits, separated by spaces when needed.');
    return { order: value.includes(' ') ? value.split(/\s+/).map(Number) : [...value].map(Number), first: Number($('amsco-first').value) };
  }
  function node(tag, text, cls) {
    const n = document.createElement(tag); if (text !== undefined) n.textContent = text;
    if (cls) n.className = cls; return n;
  }
  function buildFrames(t) {
    if (name !== 'doublePlayfair') return (t.decrypt ? t.extraction : t.placement)
      .map(pos => ({ phase: 'entry', pos })).concat((t.decrypt ? t.placement : t.extraction).map(pos => ({ phase: 'read', pos })));
    const f = [];
    t.blocks.forEach((block, index) => {
      if (!t.decrypt) for (let p = 0; p < block.top.length * 2; p++) f.push({ phase: 'arrange', block: index, pos: p });
      t.pairs.filter(p => p.block === index).forEach(pair => {
        for (const phase of ['pair', 'stage1', 'stage2']) f.push({ phase, block: index, pair });
      });
    }); return f;
  }
  function drawTransposition() {
    const active = frames[progress - 1];
    const entered = new Set(frames.slice(0, progress).filter(f => f.phase === 'entry').map(f => f.pos));
    const read = new Set(frames.slice(0, progress).filter(f => f.phase === 'read').map(f => f.pos));
    const table = node('table', undefined, 'cipher-table manual-table');
    table.append(node('caption', name === 'rasterschluessel44' ? 'Original manual stencil; blocked cells are unavailable' : 'Alternating cell lengths; column ranks above'));
    const head = node('thead'), hr = node('tr'); hr.append(node('th', 'Row'));
    const order = trace.order;
    order.forEach((rank, col) => { const th = node('th', String(rank)); th.scope = 'col'; th.title = 'Column ' + (col + 1) + ', rank ' + rank; hr.append(th); });
    head.append(hr); table.append(head); const body = node('tbody');
    const width = name === 'rasterschluessel44' ? 25 : trace.width;
    const rows = name === 'rasterschluessel44' ? 24 : Math.ceil(trace.cells.length / width);
    for (let row = 0; row < rows; row++) {
      const tr = node('tr'), th = node('th', String(row + 1)); th.scope = 'row'; tr.append(th);
      for (let col = 0; col < width; col++) {
        const pos = row * width + col;
        const blocked = name === 'rasterschluessel44' && trace.grid[row][col] === '#';
        const cell = trace.cells[pos];
        const value = name === 'rasterschluessel44' ? cell : cell && cell.value;
        const td = node('td', blocked ? '×' : entered.has(pos) ? value : '', blocked ? 'manual-blocked' : 'manual-cell');
        if (name === 'amsco' && cell) { td.dataset.length = cell.length; td.title = cell.length + '-letter cell'; }
        if (read.has(pos)) td.classList.add('manual-read');
        if (active && active.pos === pos) td.classList.add('manual-active');
        if (name === 'rasterschluessel44' && pos === trace.beginning) td.classList.add('manual-start');
        tr.append(td);
      } body.append(tr);
    }
    table.append(body); $('manual-grid').replaceChildren(table);
    $('manual-caption').textContent = name === 'rasterschluessel44'
      ? 'Digit sum ' + trace.sum + '; read begins in physical column ' + (trace.readColumn + 1) + ', rank ' + trace.firstRank + '. ' + trace.input.length + ' of 240 writing cells used.'
      : 'Ranks: ' + trace.order.join(' ') + '. First cell: ' + trace.first + ' letter(s). Last cell retains its actual length; no nulls added.';
    $('manual-progress-output').textContent = frames.slice(0, progress).filter(f => f.phase === 'read')
      .map(f => name === 'rasterschluessel44' ? trace.cells[f.pos] : trace.cells[f.pos].value).join('');
    return active ? (active.phase === 'entry' ? 'Place input in ' : 'Extract output from ') + 'row ' + (Math.floor(active.pos / width) + 1) + ', column ' + (active.pos % width + 1) + '.' : 'Ready to place the input.';
  }
  function square(text, label, positions) {
    const table = node('table', undefined, 'cipher-table manual-square'); table.append(node('caption', label));
    const body = node('tbody'); for (let row = 0; row < 5; row++) {
      const tr = node('tr'); for (let col = 0; col < 5; col++) {
        const index = row * 5 + col, td = node('td', text[index]); if (positions.includes(index)) td.classList.add('manual-active'); tr.append(td);
      } body.append(tr);
    } table.append(body); return table;
  }
  function drawDouble() {
    const active = frames[progress - 1], index = active ? active.block : 0;
    const block = trace.blocks[index];
    const table = node('table', undefined, 'cipher-table manual-table'); table.append(node('caption', 'Plaintext arrangement: block ' + (index + 1) + ', up to 17 columns'));
    const body = node('tbody');
    if (block) for (const [row, text] of [['Top', block.top], ['Bottom', block.bottom]]) {
      const tr = node('tr'), th = node('th', row); th.scope = 'row'; tr.append(th);
      [...text].forEach((letter, col) => {
        const p = col + (row === 'Bottom' ? block.top.length : 0);
        const visible = frames.slice(0, progress).some(f => f.block === index && (trace.decrypt
          ? f.phase === 'stage2' && f.pair.column === col : f.phase === 'arrange' && f.pos === p));
        const td = node('td', visible ? letter : ''); if (active && active.pair && active.pair.column === col) td.classList.add('manual-active'); tr.append(td);
      }); body.append(tr);
    }
    table.append(body); $('manual-grid').replaceChildren(table);
    let a = [], b = [], message = 'Ready to arrange the plaintext into two rows.';
    if (active) {
      if (active.phase === 'arrange') message = 'Place plaintext letter ' + (active.pos + 1) + ' in block ' + (index + 1) + '.';
      else {
        const pair = active.pair;
        if (active.phase === 'pair') message = 'Form pair ' + pair.pair + (trace.decrypt ? ' from ciphertext.' : ' vertically: top first, bottom second.');
        else {
          const stage = pair[active.phase];
          [a, b] = trace.decrypt ? [[stage.positions[1]], [stage.positions[0]]] : [[stage.positions[0]], [stage.positions[1]]];
          message = (active.phase === 'stage1' ? 'First' : 'Second') + ' substitution: ' + stage.pair + ' → ' + stage.result + '; ' +
            (stage.sameRow ? 'same row, move ' + (trace.decrypt ? 'left' : 'right') + ', cross the squares.' : 'rectangle, cross the row and column coordinates.');
        }
      }
    }
    $('manual-squares').replaceChildren(square(trace.squareA, 'Square A', a), square(trace.squareB, 'Square B', b));
    $('manual-caption').textContent = 'Two substitutions per pair. ' + trace.blocks.length + ' block(s); ' + trace.padding + ' filler letter(s) added and retained on decryption.';
    // During decryption recovered pairs rebuild row order, not interleaved output.
    const complete = frames.slice(0, progress).filter(f => f.phase === 'stage2');
    $('manual-progress-output').textContent = trace.decrypt ? trace.blocks.map((_, i) => {
      const ps = complete.filter(f => f.block === i).map(f => f.pair.stage2.result); return ps.map(p => p[0]).join('') + ps.map(p => p[1]).join('');
    }).join('') : complete.map(f => f.pair.stage2.result).join('');
    return message;
  }
  function draw() {
    if (!trace) return;
    const text = name === 'doublePlayfair' ? drawDouble() : drawTransposition();
    $('manual-animation-status').textContent = progress + ' / ' + frames.length + ': ' + text;
    $('manual-step').disabled = progress >= frames.length;
    $('manual-play').disabled = progress >= frames.length;
  }
  function clear() {
    trace = null; frames = []; progress = 0;
    for (const id of ['manual-output', 'manual-grid', 'manual-caption', 'manual-progress-output', 'manual-animation-status', 'manual-squares']) {
      const el = $(id); if (el) el.replaceChildren();
    }
    for (const id of ['manual-step', 'manual-play', 'manual-reset', 'manual-use-output']) $(id).disabled = true;
  }
  function run() {
    stop(); clear();
    try {
      if (!engine) throw new Error('The cipher engine could not load. Reload this page.');
      trace = engine.trace($('manual-message').value, key(), mode === 'decrypt');
      frames = buildFrames(trace); $('manual-output').textContent = trace.output;
      $('manual-status').textContent = 'Computed ' + trace.input.length + ' normalized letters. ' + (trace.padding ? 'One filler letter added; decryption retains it.' : 'No padding added.');
      for (const id of ['manual-reset', 'manual-use-output']) $(id).disabled = false;
      draw();
    } catch (error) { clear(); $('manual-status').textContent = error.message; }
  }
  function setMode(next) {
    mode = next; root.querySelectorAll('[data-mode]').forEach(btn => {
      const active = btn.dataset.mode === mode; btn.classList.toggle('active', active); btn.setAttribute('aria-pressed', String(active));
    });
  }
  root.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => { setMode(btn.dataset.mode); run(); }));
  root.querySelectorAll('input, textarea, select').forEach(el => el.addEventListener('input', run));
  $('manual-run').addEventListener('click', run);
  $('manual-use-output').addEventListener('click', () => { if (!trace) return; $('manual-message').value = trace.output; setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt'); run(); });
  $('manual-step').addEventListener('click', () => { stop(); progress = Math.min(progress + 1, frames.length); draw(); });
  $('manual-reset').addEventListener('click', () => { stop(); progress = 0; draw(); });
  $('manual-play').addEventListener('click', () => {
    if (timer !== null) { stop(); return; }
    if (reduced()) { progress = frames.length; draw(); return; }
    $('manual-play').textContent = 'Pause'; $('manual-play').setAttribute('aria-pressed', 'true');
    timer = setInterval(() => { progress++; draw(); if (progress >= frames.length) stop(); }, 220);
  });
  window.addEventListener('pagehide', stop);
  run();
}());
```


## JavaScript — js/multiple-anagramming.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/multiple-anagramming.js`
- Served SHA-256: `6e7cfd2872d5f4ba7483f0f74ad46e71eee7f51451847caa7d708fd48344efb8`
- Readable-source SHA-256: `6e7cfd2872d5f4ba7483f0f74ad46e71eee7f51451847caa7d708fd48344efb8`


```javascript
/* Multiple anagramming: original, complete-rectangle teaching fixtures.
 * A strip is one four-letter column from each intercept, kept in transmitted
 * order. Rearranging a strip applies the same hypothesis to every message.
 * No imported historical ciphertext, dictionary or language model is used.
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) {
    root.MultipleAnagramming = api;
    var start = function () { api.mount(root.document); };
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start);
    else start();
  }
}(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  var WIDTH = 5, HEIGHT = 4;
  // Independently recorded: plaintext written in four rows of five, columns
  // transmitted in order 3, 1, 5, 2, 4. The control uses 5, 2, 4, 1, 3.
  var fixtures = [
    { name: 'Intercept 1', ciphertext: 'ECEOMHRTTUANEEINTORO', plaintext: 'MEETTHECOURIERATNOON' },
    { name: 'Intercept 2', ciphertext: 'ITFUBWBEGRRKRAEDNEOS', plaintext: 'BRINGWATERBEFOREDUSK' },
    { name: 'Intercept 3', ciphertext: 'OEHOSTRNTORDCHTRUNEA', plaintext: 'SCOUTTHENORTHERNROAD' },
    { name: 'Different-key control', ciphertext: 'RTRKEPEDDROSSEBENOFU', plaintext: 'SENDREPORTBEFOREDUSK' }
  ];
  var sharedOrder = [1, 3, 0, 4, 2]; // B, D, A, E, C: transmitted-strip identities.
  var contacts = new Set('TH HE IN ER AN RE ON AT EN ND TI ES OR TE OF ED IS IT AL AR ST TO NT NG SE HA AS OU IO LE VE CO BE RT WA SC RO UR'.split(' '));

  function validOrder(order) {
    return Array.isArray(order) && order.length === WIDTH &&
      order.every(function (v) { return Number.isInteger(v) && v >= 0 && v < WIDTH; }) &&
      new Set(order).size === WIDTH;
  }
  function splitColumns(ciphertext) {
    if (!/^[A-Z]{20}$/.test(ciphertext)) throw new Error('Use exactly twenty A–Z letters for this 4 × 5 exercise.');
    return ciphertext.match(/.{4}/g);
  }
  function reconstruct(ciphertext, order) {
    if (!validOrder(order)) throw new Error('Each of the five strips must appear exactly once.');
    var columns = splitColumns(ciphertext), result = '';
    for (var row = 0; row < HEIGHT; row++) {
      for (var col = 0; col < WIDTH; col++) result += columns[order[col]][row];
    }
    return result;
  }
  function move(order, strip, direction) {
    if (!validOrder(order) || (direction !== -1 && direction !== 1)) throw new Error('Invalid strip movement.');
    var next = order.slice(), at = next.indexOf(strip), target = at + direction;
    if (at === -1) throw new Error('Unknown strip.');
    if (target >= 0 && target < WIDTH) {
      next[at] = next[target];
      next[target] = strip;
    }
    return next;
  }
  function contactScore(order) {
    var count = 0;
    fixtures.slice(0, 3).forEach(function (fixture) {
      var candidate = reconstruct(fixture.ciphertext, order);
      // Count only horizontal contacts between adjacent strips, not the
      // contact from the last column of a row to the first of the next row.
      for (var row = 0; row < HEIGHT; row++) {
        for (var col = 0; col < WIDTH - 1; col++) {
          if (contacts.has(candidate.slice(row * WIDTH + col, row * WIDTH + col + 2))) count++;
        }
      }
    });
    return count;
  }

  function mount(document) {
    var panel = document.getElementById('multiple-anagramming');
    if (!panel || panel.dataset.ready) return;
    panel.dataset.ready = 'true';
    var order = [0, 1, 2, 3, 4], checked = false;
    var select = document.getElementById('ma-selected');
    var stripList = document.getElementById('ma-strips');
    var outputs = document.getElementById('ma-candidates');
    var status = document.getElementById('ma-status');
    var showControl = document.getElementById('ma-control');
    var left = document.getElementById('ma-left'), right = document.getElementById('ma-right');
    var label = function (strip) { return String.fromCharCode(65 + strip); };

    function render() {
      var selected = Number(select.value), visible = showControl.checked ? fixtures : fixtures.slice(0, 3);
      stripList.replaceChildren();
      order.forEach(function (strip, position) {
        var tile = document.createElement('li');
        tile.className = 'ma-strip' + (selected === strip ? ' ma-selected' : '');
        var title = document.createElement('strong');
        title.textContent = label(strip);
        title.setAttribute('aria-label', 'Strip ' + label(strip) + ', position ' + (position + 1));
        tile.appendChild(title);
        visible.forEach(function (fixture, index) {
          var column = document.createElement('div');
          column.className = 'ma-column';
          var tag = document.createElement('small');
          tag.textContent = index === 3 ? 'Control' : 'Msg ' + (index + 1);
          var letters = document.createElement('span');
          var text = splitColumns(fixture.ciphertext)[strip];
          letters.className = 'ma-letters';
          letters.textContent = text.split('').join('\n');
          letters.setAttribute('aria-label', fixture.name + ': ' + text);
          column.append(tag, letters);
          tile.appendChild(column);
        });
        stripList.appendChild(tile);
      });
      outputs.replaceChildren();
      visible.forEach(function (fixture, index) {
        var block = document.createElement('div'), heading = document.createElement('h3');
        heading.textContent = fixture.name;
        var cipher = document.createElement('p');
        cipher.className = 'ma-intercept';
        cipher.textContent = 'Received: ' + splitColumns(fixture.ciphertext).join(' ');
        var candidate = document.createElement('code');
        candidate.className = 'ma-candidate';
        var text = reconstruct(fixture.ciphertext, order);
        candidate.textContent = text;
        candidate.dataset.message = String(index + 1);
        block.append(heading, cipher, candidate);
        if (checked) {
          var result = document.createElement('p');
          result.className = 'ma-check-result';
          result.textContent = text === fixture.plaintext ? 'Matches this prepared message.' :
            (index === 3 ? 'Does not match: this control used a different column order.' : 'Does not yet match this prepared message.');
          block.appendChild(result);
        }
        outputs.appendChild(block);
      });
      var at = order.indexOf(selected);
      left.disabled = at === 0;
      right.disabled = at === WIDTH - 1;
      document.getElementById('ma-order').textContent = order.map(label).join(' → ');
      document.getElementById('ma-score').textContent = contactScore(order) + ' of 48 common contacts';
      if (checked) {
        var solved = fixtures.slice(0, 3).every(function (fixture) { return reconstruct(fixture.ciphertext, order) === fixture.plaintext; });
        status.textContent = solved ? 'All three same-key messages match the prepared answer. The different-key control needs its own ordering.' :
          'This arrangement does not match all three prepared messages. A higher contact score is a clue, not proof.';
      }
    }
    function shift(direction) {
      var strip = Number(select.value);
      order = move(order, strip, direction);
      checked = false;
      render();
      status.textContent = 'Moved strip ' + label(strip) + ' to position ' + (order.indexOf(strip) + 1) + ' in every intercept.';
    }
    select.addEventListener('change', render);
    left.addEventListener('click', function () { shift(-1); });
    right.addEventListener('click', function () { shift(1); });
    showControl.addEventListener('change', render);
    document.getElementById('ma-check').addEventListener('click', function () { checked = true; render(); });
    document.getElementById('ma-reveal').addEventListener('click', function () { order = sharedOrder.slice(); checked = true; render(); });
    document.getElementById('ma-reset').addEventListener('click', function () {
      order = [0, 1, 2, 3, 4]; checked = false; select.value = '0'; render();
      status.textContent = 'Reset to the received strip order A → B → C → D → E.';
    });
    render();
  }
  return { fixtures: fixtures, reconstruct: reconstruct, splitColumns: splitColumns, move: move, contactScore: contactScore, mount: mount };
}));
```


## JavaScript — js/nav.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/nav.js`
- Served SHA-256: `5a45581ad08fd412e0d38e35a7d456fb85134042c142a078e9fa75339eb3fa33`
- Readable-source SHA-256: `5a45581ad08fd412e0d38e35a7d456fb85134042c142a078e9fa75339eb3fa33`


```javascript
/**
 * THE CIPHER MUSEUM — Navigation System
 * 1. Standardizes nav links to one canonical set (handles subdirectory paths)
 * 2. Injects a hamburger toggle at <768px with CSS transition drawer
 * Load on every page: <script src="js/nav.js" defer></script>
 */
'use strict';
(function () {
  var nav = document.querySelector('.museum-nav');
  if (!nav) return;
  var inner = nav.querySelector('.nav-inner');
  if (!inner) return;
  var links = nav.querySelector('.nav-links');
  if (!links) return;

  /* ── Standardize nav links ───────────────────────────── */
  var NAV = [
    ['museum-map.html',   'Explore'],
    ['timeline.html',     'Timeline'],
    ['learn.html',        'Learn'],
    ['cipher-corpus.html','Cipher Corpus'],
    ['cryptanalysis.html', 'Cryptanalysis'],
    ['challenges.html',   'Challenges'],
    ['lab/workbench.html','Lab'],
    ['search.html',       'Search']
  ];
  var path = location.pathname;
  var inSub = /\/(ciphers|halls|tours|lab|community|hall-of-foundations)\//.test(path);
  var pre = inSub ? '../' : '';
  var basename = path.split('/').pop() || 'index.html';
  var parentDir = path.split('/').slice(-2, -1)[0] || '';
  var DIR_ACTIVE = {halls:'Explore',tours:'Explore',community:'Explore',lab:'Lab','hall-of-foundations':'Explore'};
  var ALIASES = {
    'index.html': null,
    'museum-map.html': 'Explore',
    'timeline.html': 'Timeline',
    'glossary.html': 'Learn',
    'modern.html': 'Learn',
    'learn.html': 'Learn',
    'cipher-corpus.html': 'Cipher Corpus',
    'cryptanalysis.html': 'Cryptanalysis',
    'challenges.html': 'Challenges',
    'comparison.html': 'Learn',
    'cipher-flow.html': 'Explore',
    'search.html': 'Search'
  };
  var activeLabel = DIR_ACTIVE[parentDir] || ALIASES[basename] || null;
  links.innerHTML = '';
  NAV.forEach(function (n) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = pre + n[0];
    a.textContent = n[1];
    if (n[1] === activeLabel) a.className = 'active';
    li.appendChild(a);
    links.appendChild(li);
  });

  /* ── Inject hamburger button ──────────────────────────── */
  var btn = document.createElement('button');
  btn.className = 'nav-hamburger';
  btn.setAttribute('aria-label', 'Toggle navigation menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'nav-drawer');
  btn.innerHTML =
    '<span class="hamburger-bar"></span>' +
    '<span class="hamburger-bar"></span>' +
    '<span class="hamburger-bar"></span>';
  inner.appendChild(btn);

  /* ── Mobile-only extra links (visible in drawer only) ──
     Must not repeat anything in NAV above — the drawer shows both lists,
     so an entry in both renders twice. */
  var MOBILE_NAV = [
    ['tours/index.html',    'Guided Tours'],
    ['hall-of-foundations/index.html', 'Hall of Foundations'],
    ['glossary.html',       'Glossary'],
    ['modern.html',         'Modern Cryptography'],
    ['cipher-detective.html','Cipher Detective'],
    ['comparison.html',     'Cipher Comparison'],
    ['community/index.html','Community']
  ];
  var primary = {};
  NAV.forEach(function (n) { primary[n[0]] = true; });
  MOBILE_NAV = MOBILE_NAV.filter(function (n) { return !primary[n[0]]; });

  var divider = document.createElement('li');
  divider.className = 'nav-drawer-divider';
  divider.textContent = 'More to Explore';
  links.appendChild(divider);
  MOBILE_NAV.forEach(function (n) {
    var li = document.createElement('li');
    li.className = 'nav-drawer-only';
    var a = document.createElement('a');
    a.href = pre + n[0];
    a.textContent = n[1];
    li.appendChild(a);
    links.appendChild(li);
  });

  /* Give the links list an id for aria-controls. No role/aria-label here:
     the list already sits inside <nav aria-label="Primary">, and a second
     navigation landmark nested in the first just duplicates the entry in a
     screen reader's landmark list. */
  links.id = 'nav-drawer';

  /* ── Toggle drawer ────────────────────────────────────── */
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', String(open));
  });

  /* Close on link click */
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });

  /* ── Accessibility patches ──────────────────────────── */
  var logoSvg = nav.querySelector('.nav-logo-icon');
  if (logoSvg) logoSvg.setAttribute('aria-hidden', 'true');
  document.querySelectorAll('.section-divider').forEach(function(el){
    el.setAttribute('aria-hidden', 'true');
  });

  /* ── "/" focuses search from anywhere ─────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    var q = document.getElementById('q');
    e.preventDefault();
    if (q) { q.focus(); q.select(); }
    else { location.href = pre + 'search.html'; }
  });

  /* ── Offline support ──────────────────────────────────── */
  if ('serviceWorker' in navigator &&
      (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register(pre + 'sw.js').catch(function () {});
  }

  /* ── Auto-load companion scripts ─────────────────────── */
  var companions = ['breadcrumbs.js', 'footer.js', 'ui-delegates.js'];
  if (/\/ciphers\//.test(path)) {
    companions.push('artifact-cards-data.min.js', 'artifact-cards.js');
  }

  companions.forEach(function(f){
    var s = document.createElement('script');
    s.src = pre + 'js/' + f;
    s.defer = true;
    document.body.appendChild(s);
  });
})();

/* ── Scroll-reveal entrance animations (Phase 2C) ──────── */
(function () {
  if (typeof IntersectionObserver === 'undefined') return;
  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(function (el) { observer.observe(el); });
})();
```


## JavaScript — js/pad-experiments.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/pad-experiments.js`
- Served SHA-256: `d92bae704213cdb6c4b391657eac0f0656f8412220678951d9a86f1bb1f18d5c`
- Readable-source SHA-256: `d92bae704213cdb6c4b391657eac0f0656f8412220678951d9a86f1bb1f18d5c`


```javascript
/* Small, original teaching fixtures; not historical traffic or secure messaging. */
(function (root) {
  'use strict';
  function mod(n, base) { return ((n % base) + base) % base; }
  function decimalGroup(value) {
    if (!/^\d{5}$/.test(value)) throw new Error('Enter exactly five digits in each decimal field, including leading zeroes.');
    return value;
  }
  function decimalCombine(a, b, subtract) {
    decimalGroup(a); decimalGroup(b);
    return a.split('').map(function (digit, i) {
      return String(mod(Number(digit) + (subtract ? -1 : 1) * Number(b[i]), 10));
    }).join('');
  }
  var sampleBook = Object.freeze({ '12345': 'MEET', '13579': 'DAWN', '97531': 'COURIER' });
  function lookup(group) { return sampleBook[group] || 'Unknown — no meaning supplied in this invented codebook'; }
  function decimalTrial(a, b, pad, guess) {
    var c1 = decimalCombine(a, pad, false), c2 = decimalCombine(b, pad, false);
    var difference = decimalCombine(c1, c2, true);
    var candidate = decimalCombine(guess, difference, true);
    return { c1: c1, c2: c2, difference: difference, candidate: candidate, meaning: lookup(candidate) };
  }
  function letters(value) {
    if (!/^[A-Z]{1,32}$/.test(value)) throw new Error('Use 1–32 uppercase A–Z letters, without spaces, for the message and pad.');
    return value;
  }
  function letterCombine(a, b, subtract) {
    letters(a); letters(b);
    if (a.length !== b.length) throw new Error('The demonstration pad must have exactly one letter for every message letter.');
    return a.split('').map(function (letter, i) {
      return String.fromCharCode(65 + mod(letter.charCodeAt(0) - 65 + (subtract ? -1 : 1) * (b.charCodeAt(i) - 65), 26));
    }).join('');
  }
  function tamper(ciphertext, position, delta) {
    letters(ciphertext);
    if (!Number.isInteger(position) || position < 1 || position > ciphertext.length) throw new Error('Choose a position from 1 to the message length.');
    if (!Number.isInteger(delta) || delta < 0 || delta > 25) throw new Error('Choose a whole-number shift from 0 to 25.');
    var changed = ciphertext.split('');
    changed[position - 1] = String.fromCharCode(65 + mod(changed[position - 1].charCodeAt(0) - 65 + delta, 26));
    return changed.join('');
  }
  function mountDecimal(doc) {
    if (!doc.getElementById('venona-decimal-experiment')) return;
    function el(id) { return doc.getElementById('decimal-' + id); }
    function render() {
      el('error').textContent = '';
      try {
        var a = el('a').value, b = el('b').value, pad = el('pad').value;
        var result = decimalTrial(a, b, pad, el('guess').value);
        el('results').hidden = false;
        el('cipher-a').textContent = result.c1;
        el('cipher-b').textContent = result.c2;
        el('difference').textContent = result.difference;
        el('candidate').textContent = result.candidate;
        el('meaning').textContent = result.meaning;
        el('steps').textContent = a.split('').map(function (digit, i) {
          return 'Column ' + (i + 1) + ': ' + digit + ' + ' + pad[i] + ' → ' + result.c1[i] +
            '; ' + b[i] + ' + ' + pad[i] + ' → ' + result.c2[i] +
            '; ' + result.c1[i] + ' − ' + result.c2[i] + ' → ' + result.difference[i];
        }).join('\n') + '\nAll results are reduced modulo 10, independently in each column.';
      } catch (e) {
        el('results').hidden = true;
        el('error').textContent = e.message;
      }
    }
    el('run').addEventListener('click', render);
    ['a', 'b', 'pad', 'guess'].forEach(function (id) {
      el(id).addEventListener('input', render);
    });
    render();
  }
  function mountTampering(doc) {
    if (!doc.getElementById('otp-tampering-experiment')) return;
    function el(id) { return doc.getElementById('tamper-' + id); }
    function render() {
      var hidden = el('hide').checked;
      el('sender').hidden = hidden;
      el('error').textContent = '';
      try {
        var plain = el('message').value, pad = el('pad').value;
        var ciphertext = letterCombine(plain, pad, false);
        el('position').max = String(plain.length);
        if (!el('position').value || !el('delta').value) throw new Error('Enter both a position and a shift.');
        var position = Number(el('position').value), delta = Number(el('delta').value);
        var altered = tamper(ciphertext, position, delta);
        var received = letterCombine(altered, pad, true);
        el('results').hidden = false;
        el('cipher').textContent = ciphertext;
        el('altered').textContent = altered;
        el('original').textContent = hidden ? 'Hidden in attacker view' : plain;
        el('received').textContent = hidden ? 'Hidden in attacker view' : received;
        el('outcome').textContent = delta === 0
          ? 'Shift 0 leaves every letter unchanged.'
          : 'The receiver’s letter at position ' + position + ' shifts by ' + delta + ' modulo 26. Every other letter stays unchanged.';
        el('equation').textContent = hidden
          ? 'At the chosen position: (C + Δ − K) mod 26 = (P + Δ) mod 26. No knowledge of P or K is needed to apply Δ to C.'
          : 'At position ' + position + ': ' + plain[position - 1] + '(' + (plain.charCodeAt(position - 1) - 65) + ') + ' + delta +
            ' mod 26 → ' + received[position - 1] + '(' + (received.charCodeAt(position - 1) - 65) + ').';
      } catch (e) {
        el('results').hidden = true;
        el('error').textContent = e.message;
      }
    }
    el('run').addEventListener('click', render);
    ['message', 'pad', 'position', 'delta'].forEach(function (id) { el(id).addEventListener('input', render); });
    el('hide').addEventListener('change', render);
    render();
  }
  function mount(doc) { mountDecimal(doc); mountTampering(doc); }
  var api = { decimalCombine: decimalCombine, decimalTrial: decimalTrial, lookup: lookup, letterCombine: letterCombine, tamper: tamper, mount: mount };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', function () { mount(root.document); });
    else mount(root.document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
```


## JavaScript — js/protocol-math.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/protocol-math.js`
- Served SHA-256: `a9fb45687f0d4d032a8dbf135741502fe35bf6da3835e27556c85a45197e8966`
- Readable-source SHA-256: `a9fb45687f0d4d032a8dbf135741502fe35bf6da3835e27556c85a45197e8966`


```javascript
/* ==========================================================================
   protocol-math.js — pure logic for the museum's modern protocol exhibits.
   No DOM. Backs:
     ciphers/ecdsa.html                 (§158)
     ciphers/shamir-secret-sharing.html (§159)
     ciphers/zero-knowledge-proofs.html (§160)

   These three are protocols, not ciphers: they sign, share and prove rather
   than encrypt. Each is the deployed counterpart of a Hall of Foundations
   exhibit — §150 elliptic curves, §155 interpolation, §154 Fiat-Shamir — and
   the mathematics here is the same mathematics, at working size.

   All randomness is injected by the caller as explicit values, so every
   result is reproducible and the CI tests can replay exact cases.
   Exposed on window.ProtocolMath (browser) and module.exports (Node/CI).
   ========================================================================== */
(function (root) {
  "use strict";

  function mod(a, m) { return ((a % m) + m) % m; }

  // Modular inverse by extended Euclid. null when gcd(a, m) != 1.
  function modInv(a, m) {
    var t = 0, newT = 1, r = m, newR = mod(a, m);
    while (newR !== 0) {
      var q = Math.floor(r / newR);
      var tmp = t - q * newT; t = newT; newT = tmp;
      tmp = r - q * newR; r = newR; newR = tmp;
    }
    if (r > 1) return null;
    return mod(t, m);
  }

  function powmod(b, e, m) {
    var result = 1; b = mod(b, m);
    while (e > 0) {
      if (e & 1) result = mod(result * b, m);
      b = mod(b * b, m);
      e = Math.floor(e / 2);
    }
    return result;
  }

  /* ---------------------------------------------------------------- curves */
  // Points are {x, y}; the point at infinity is null (the group identity).

  function ecAdd(P, Q, a, p) {
    if (P === null) return Q;
    if (Q === null) return P;
    if (P.x === Q.x && mod(P.y + Q.y, p) === 0) return null; // P + (-P)
    var lam;
    if (P.x === Q.x && P.y === Q.y) {
      var inv2y = modInv(mod(2 * P.y, p), p);
      if (inv2y === null) return null;
      lam = mod((3 * P.x * P.x + a) * inv2y, p);
    } else {
      var invdx = modInv(mod(Q.x - P.x, p), p);
      if (invdx === null) return null;
      lam = mod((Q.y - P.y) * invdx, p);
    }
    var x = mod(lam * lam - P.x - Q.x, p);
    return { x: x, y: mod(lam * (P.x - x) - P.y, p) };
  }

  // Scalar multiplication by double-and-add.
  function ecMul(k, P, a, p) {
    var R = null, N = P;
    if (k < 0) return null;
    while (k > 0) {
      if (k & 1) R = ecAdd(R, N, a, p);
      N = ecAdd(N, N, a, p);
      k = Math.floor(k / 2);
    }
    return R;
  }

  function ecOnCurve(P, a, b, p) {
    if (P === null) return true;
    return mod(P.y * P.y, p) === mod(P.x * P.x * P.x + a * P.x + b, p);
  }

  /* ---------------------------------------------------------------- ECDSA */
  // curve = {a, b, p, G, n} — n is the (prime) order of G.
  // h is the message hash reduced into [0, n). k is the per-signature nonce.
  // Returns null when the nonce produces a degenerate signature, which is the
  // real algorithm's behaviour too: you resample and try again.
  function ecdsaSign(h, d, k, curve) {
    var R = ecMul(k, curve.G, curve.a, curve.p);
    if (R === null) return null;
    var r = mod(R.x, curve.n);
    if (r === 0) return null;
    var kInv = modInv(k, curve.n);
    if (kInv === null) return null;
    var s = mod(kInv * mod(h + r * d, curve.n), curve.n);
    if (s === 0) return null;
    return { r: r, s: s };
  }

  function ecdsaVerify(h, sig, Q, curve) {
    if (!sig) return false;
    if (sig.r <= 0 || sig.r >= curve.n || sig.s <= 0 || sig.s >= curve.n) return false;
    if (!ecOnCurve(Q, curve.a, curve.b, curve.p) || Q === null) return false;
    var w = modInv(sig.s, curve.n);
    if (w === null) return false;
    var u1 = mod(h * w, curve.n);
    var u2 = mod(sig.r * w, curve.n);
    var X = ecAdd(ecMul(u1, curve.G, curve.a, curve.p),
                  ecMul(u2, Q, curve.a, curve.p), curve.a, curve.p);
    if (X === null) return false;
    return mod(X.x, curve.n) === sig.r;
  }

  // The failure that broke the PlayStation 3 and drained Bitcoin wallets:
  // sign twice with the same nonce and the private key falls out by algebra.
  //   s1 = k^-1 (h1 + r d),  s2 = k^-1 (h2 + r d)
  //   => k = (h1 - h2) / (s1 - s2),  then d = (s1 k - h1) / r
  // Returns {k, d} or null if the two signatures do not share a nonce.
  function recoverFromReusedNonce(h1, s1, h2, s2, r, n) {
    var ds = mod(s1 - s2, n);
    if (ds === 0) return null;
    var dsInv = modInv(ds, n);
    if (dsInv === null) return null;
    var k = mod(mod(h1 - h2, n) * dsInv, n);
    var rInv = modInv(r, n);
    if (rInv === null) return null;
    var d = mod(mod(mod(s1 * k, n) - h1, n) * rInv, n);
    return { k: k, d: d };
  }

  /* ------------------------------------------------------ Shamir sharing */
  // Split `secret` so that any `k` of `n` shares reconstruct it and any k-1
  // reveal nothing. coeffs are the k-1 random coefficients above the constant
  // term, supplied by the caller.
  function shamirSplit(secret, k, n, p, coeffs) {
    var poly = [mod(secret, p)];
    for (var i = 0; i < k - 1; i++) poly.push(mod(coeffs[i], p));
    var shares = [];
    for (var x = 1; x <= n; x++) shares.push({ x: x, y: polyEval(poly, x, p) });
    return { shares: shares, poly: poly };
  }

  function polyEval(poly, x, p) {
    var acc = 0;
    for (var i = poly.length - 1; i >= 0; i--) acc = mod(acc * x + poly[i], p);
    return acc;
  }

  // Lagrange interpolation evaluated at zero — the constant term is the secret.
  function shamirCombine(shares, p) {
    var total = 0;
    for (var i = 0; i < shares.length; i++) {
      var num = 1, den = 1;
      for (var j = 0; j < shares.length; j++) {
        if (i === j) continue;
        num = mod(num * mod(-shares[j].x, p), p);
        den = mod(den * mod(shares[i].x - shares[j].x, p), p);
      }
      var dInv = modInv(den, p);
      if (dInv === null) return null;
      total = mod(total + mod(shares[i].y * mod(num * dInv, p), p), p);
    }
    return total;
  }

  /* --------------------------------------------- Schnorr zero-knowledge */
  // group = {p, q, g} with g of prime order q modulo p. Public key y = g^x.
  //   commit:  t = g^r
  //   respond: s = r + c x  (mod q)
  //   verify:  g^s == t * y^c  (mod p)
  function schnorrCommit(r, group) { return powmod(group.g, r, group.p); }
  function schnorrRespond(r, c, x, group) { return mod(r + c * x, group.q); }
  function schnorrVerify(t, c, s, y, group) {
    return powmod(group.g, s, group.p) === mod(t * powmod(y, c, group.p), group.p);
  }

  // The zero-knowledge argument, made concrete: pick the response and the
  // challenge first, then solve for the commitment. The transcript verifies
  // perfectly and no secret was used — which is exactly why a real transcript
  // proves nothing to anyone who did not choose the challenge themselves.
  function schnorrSimulate(c, s, y, group) {
    var yc = powmod(y, c, group.p);
    var inv = modInv(yc, group.p);
    if (inv === null) return null;
    return { t: mod(powmod(group.g, s, group.p) * inv, group.p), c: c, s: s };
  }

  // Soundness from the other side: a prover who can answer two different
  // challenges on one commitment must know the secret, and it drops out.
  //   s1 - s2 = (c1 - c2) x  =>  x = (s1 - s2) / (c1 - c2)
  function schnorrExtract(s1, c1, s2, c2, group) {
    var dc = mod(c1 - c2, group.q);
    if (dc === 0) return null;
    var inv = modInv(dc, group.q);
    if (inv === null) return null;
    return mod(mod(s1 - s2, group.q) * inv, group.q);
  }

  var api = {
    mod: mod, modInv: modInv, powmod: powmod,
    ecAdd: ecAdd, ecMul: ecMul, ecOnCurve: ecOnCurve,
    ecdsaSign: ecdsaSign, ecdsaVerify: ecdsaVerify,
    recoverFromReusedNonce: recoverFromReusedNonce,
    shamirSplit: shamirSplit, shamirCombine: shamirCombine, polyEval: polyEval,
    schnorrCommit: schnorrCommit, schnorrRespond: schnorrRespond,
    schnorrVerify: schnorrVerify, schnorrSimulate: schnorrSimulate,
    schnorrExtract: schnorrExtract,
    // The toy parameters the exhibits use, kept here so pages and tests agree.
    // y^2 = x^3 + 3x + 2 over F_97: 102 affine points plus infinity, so the
    // group has prime order 103 and every point except infinity generates it.
    CURVE: { a: 3, b: 2, p: 97, G: { x: 2, y: 4 }, n: 103 },
    GROUP: { p: 467, q: 233, g: 4 },
    SHAMIR_P: 257
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ProtocolMath = api;

})(typeof self !== "undefined" ? self : this);
```


## JavaScript — js/research-cases.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/research-cases.js`
- Served SHA-256: `bc67c743e701eab7ac56c2ee391435c4c540255a5968c55524d9698fd01256e9`
- Readable-source SHA-256: `bc67c743e701eab7ac56c2ee391435c4c540255a5968c55524d9698fd01256e9`


```javascript
'use strict';
(async function () {
  const $=id=>document.getElementById(id),R=window.MuseumResearch;
  let fixture=null,timer=null;
  function stop(){if(timer)clearInterval(timer);timer=null;$('route-play').textContent='Play route';}
  function render(){
    if(!fixture)return;
    const route=R.z340Route($('route-kind').value),n=Number($('route-step').value),read=new Set(route.slice(0,n));
    Array.from($('route-grid').children).forEach((cell,i)=>{cell.dataset.read=String(read.has(i));cell.dataset.current=String(n>0&&route[n-1]===i);});
    const plain=route.slice(0,n).map(i=>fixture.key[fixture.ciphertext[i]]).join('');
    $('route-output').textContent=plain||'No symbols read yet.';
    $('route-position').textContent=n+' / 153 symbols'+(n?' · current source row '+(Math.floor(route[n-1]/17)+1)+', column '+(route[n-1]%17+1):'');
    $('route-verification').textContent=n<153?'Complete the route to compare with the published diplomatic reading.':plain===fixture.expectedDiplomatic?'Exact match to the published first-section diplomatic reading. This verifies a known-key replay, not a new recovery.':'Does not match the published reading. The same consistent key on a different route is insufficient.';
  }
  $('route-kind').onchange=()=>{stop();$('route-step').value='0';render();};
  $('route-step').oninput=()=>{stop();render();};
  $('route-next').onclick=()=>{stop();$('route-step').value=String(Math.min(153,Number($('route-step').value)+1));render();};
  $('route-complete').onclick=()=>{stop();$('route-step').value='153';render();};
  $('route-play').onclick=()=>{
    if(timer){stop();return;}
    if(Number($('route-step').value)===153)$('route-step').value='0';
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){$('route-step').value='153';render();return;}
    $('route-play').textContent='Pause route';timer=setInterval(()=>{$('route-step').value=String(Number($('route-step').value)+1);render();if(Number($('route-step').value)>=153)stop();},100);
  };
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);
  $('route-workbench').onclick=()=>{
    if(!fixture)return;
    try{
      const d=R.create(fixture.ciphertext);d.source={...d.source,artifactId:'Z340:1969-11-08:rows1-9',archive:'Published solver transcription',folio:'First nine rows',method:fixture.convention,url:fixture.transcriptionUrl};
      d.keys.push({id:'key-1',title:'Published Z340 refined substitution key',sourceUrl:fixture.sourceUrl,entries:Object.entries(fixture.key).map(([symbol,value])=>({symbol,type:'letter',values:[value]}))});
      const route=R.z340Route($('route-kind').value),transposed=route.map(i=>fixture.ciphertext[i]).join(' ');
      const next=R.addLayer(d,'symbols','revision-1',transposed,'Route hypothesis: '+$('route-kind').value+'. '+fixture.sourceLocator);
      sessionStorage.setItem('museum-evidence-import',JSON.stringify(next));location.href='evidence-workbench.html';
    }catch(e){$('route-verification').textContent='Could not transfer the record: '+e.message;}
  };
  try{
    if(typeof fetch !== 'function') throw new Error('This browser does not support loading the source fixture.');
    const response=await fetch('../data/research/v1/z340-section-1.json');if(!response.ok)throw new Error('Could not load the source fixture.');
    fixture=await response.json();
    Array.from(fixture.ciphertext).forEach((symbol,i)=>{const cell=document.createElement('span');cell.className='route-cell';cell.textContent=symbol;cell.title='Row '+(Math.floor(i/17)+1)+', column '+(i%17+1)+'; symbol '+symbol+' → '+fixture.key[symbol];$('route-grid').appendChild(cell);});
    $('route-key').textContent=JSON.stringify(fixture.key,null,2);$('route-controls').disabled=false;render();
  }catch(e){$('route-verification').textContent=e.message+' Reload online to cache the historical replay.';}
})();
```


## JavaScript — js/research-language-model.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/research-language-model.js`
- Served SHA-256: `e494add4faf9ead874c1e00488b78c3043263039861d25725dcc8c1e6ffe9bcb`
- Readable-source SHA-256: `e494add4faf9ead874c1e00488b78c3043263039861d25725dcc8c1e6ffe9bcb`


```javascript
'use strict';
(function(global){
  function build(data){
    if(!data||data.id!=='museum-prose-quadgram-v1'||data.version!==1)throw new Error('Unsupported homophonic language model.');
    const qfloor=Math.log(data.floorCount/data.quadTotal),tfloor=Math.log(data.floorCount/data.triTotal);
    const quad=new Float64Array(26**4).fill(qfloor),tri=new Float64Array(26**3).fill(tfloor);
    data.quad.forEach(([i,n])=>{quad[i]=Math.log(n/data.quadTotal);});data.tri.forEach(([i,n])=>{tri[i]=Math.log(n/data.triTotal);});
    const letterLogs=data.letters.map(n=>Math.log(n/data.letterTotal));
    function fitness(text){
      const n=text.length,counts=new Uint16Array(26);let score=0,last=0;
      for(let i=0;i<n;i++){
        const c=text.charCodeAt(i)-65;if(c<0||c>25)throw new Error('Language model accepts uppercase A–Z only.');counts[c]++;
        last=(last%17576)*26+c;
        if(i>=3)score+=quad[last];else if(i===2&&n===3)score+=tri[last];
      }
      // A declared unigram-distribution penalty discourages collapsed letter keys.
      for(let c=0;c<26;c++)if(counts[c])score-=data.frequencyPenalty*counts[c]*(Math.log(counts[c]/n)-letterLogs[c]);
      return score;
    }
    fitness.modelId=data.id;return{fitness,id:data.id};
  }
  // ── Versioned historical-language profiles ──────────────────────────────
  // Each profile scores letters A–Z under its own corpus. Scores from different
  // profiles are NOT comparable as raw likelihoods, so comparison uses the mean
  // log-probability per letter and reports a margin, never a probability.
  function profileScorer(p){
    const qfloor=Math.log(p.floorCount/p.quadTotal),tfloor=Math.log(p.floorCount/p.triTotal);
    const quad=new Float64Array(26**4).fill(qfloor),tri=new Float64Array(26**3).fill(tfloor);
    const seenQuad=new Uint8Array(26**4);
    p.quad.forEach(([i,n])=>{quad[i]=Math.log(n/p.quadTotal);seenQuad[i]=1;});
    p.tri.forEach(([i,n])=>{tri[i]=Math.log(n/p.triTotal);});
    const letterLogs=p.letters.map(n=>Math.log((n||p.floorCount)/p.letterTotal));
    function read(text){
      const n=text.length,counts=new Uint16Array(26);let score=0,last=0,grams=0,seen=0;
      for(let i=0;i<n;i++){
        const c=text.charCodeAt(i)-65;
        if(c<0||c>25)throw new Error('Language profiles accept uppercase A–Z only.');
        counts[c]++;last=(last%17576)*26+c;
        if(i>=3){score+=quad[last];grams++;if(seenQuad[last])seen++;}
        else if(i===2&&n===3)score+=tri[last];
      }
      for(let c=0;c<26;c++)if(counts[c])score-=p.frequencyPenalty*counts[c]*(Math.log(counts[c]/n)-letterLogs[c]);
      return{score,letters:n,grams,coverage:grams?seen/grams:0,meanLogProbability:n?score/n:0};
    }
    function fitness(text){return read(text).score;}
    fitness.modelId=p.id;
    // Decomposable view for the segmentation lattice: the increment a reading adds,
    // given the text before it. Exact for this quadgram sum apart from the declared
    // unigram-distribution penalty, which depends on the whole string.
    fitness.step=function(prefix,reading){
      if(!reading)return 0;
      const a=prefix?read(prefix).score:0,b=read(prefix+reading).score;
      return b-a;
    };
    return{id:p.id,language:p.language,period:p.period,fitness,read,meta:p};
  }
  function buildProfiles(data){
    if(!data||data.id!=='museum-language-profiles-v1'||data.version!==1)throw new Error('Unsupported historical-language profile set.');
    const profiles=data.profiles.map(profileScorer),byId={};
    profiles.forEach(p=>{byId[p.id]=p;});
    const rule=data.abstention;
    // Compare language hypotheses, and decline when the evidence does not separate them.
    function compare(text,ids){
      const chosen=(ids&&ids.length?ids:profiles.map(p=>p.id)).map(id=>{
        const p=byId[id];if(!p)throw new Error('Unknown language profile: '+id);return p;});
      if(chosen.length<2)throw new Error('Comparing language hypotheses needs at least two profiles.');
      const rows=chosen.map(p=>{const r=p.read(text);
        return{id:p.id,language:p.language,period:p.period,meanLogProbability:r.meanLogProbability,
          coverage:r.coverage,letters:r.letters};});
      rows.sort((a,b)=>b.meanLogProbability-a.meanLogProbability);
      const margin=rows.length>1?rows[0].meanLogProbability-rows[1].meanLogProbability:0;
      const reasons=[];
      if(rows[0].letters<rule.minimumLetters)reasons.push('Input is '+rows[0].letters+' letters; at least '+rule.minimumLetters+' are required.');
      if(margin<rule.minimumMargin)reasons.push('Margin '+margin.toFixed(3)+' is below the declared '+rule.minimumMargin+'.');
      if(rows[0].coverage<rule.minimumCoverage)reasons.push('Best profile covers only '+(100*rows[0].coverage).toFixed(1)+'% of this text\u2019s quadgrams; at least '+(100*rule.minimumCoverage).toFixed(0)+'% are required.');
      return{ranking:rows,margin,decided:reasons.length===0,
        choice:reasons.length?null:rows[0].id,abstentionReasons:reasons,
        rule:rule,
        meaning:'Ranking by mean log-probability per letter under each profile. This is not a probability that the text is in that language, and a language absent from the profile set can never be chosen.'};
    }
    return{id:data.id,version:data.version,profiles,byId,compare,abstention:rule,baseline:data.baseline};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={build,buildProfiles};
  global.MuseumResearchLanguage={build,buildProfiles};
})(typeof window!=='undefined'?window:globalThis);
```


## JavaScript — js/research-model.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/research-model.js`
- Served SHA-256: `883c85c526bb4322319ecb47c42e3171d63693290605eedff63d94f081c12128`
- Readable-source SHA-256: `883c85c526bb4322319ecb47c42e3171d63693290605eedff63d94f081c12128`


```javascript
/* Source-preserving research tools. All examples and searches run locally.
 * Papers and model boundaries: docs/PAPER_REVIEW_IMPLEMENTATION.md.
 */
'use strict';
(function (global) {
  const KIND = 'cipher-museum-transcription';
  const TYPES = ['ciphertext', 'cleartext', 'marginal', 'missing', 'editorial'];
  const KEY_TYPES = ['letter', 'syllable', 'word', 'name', 'null', 'space', 'repeat', 'erase', 'unknown'];
  const copy = x => JSON.parse(JSON.stringify(x));
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  function check(ok, message) { if (!ok) throw new Error(message); }
  function string(x, max, label) { check(typeof x === 'string' && x.length <= max, label + ' is missing or too long.'); return x; }
  function integer(x, min, max, label) { check(Number.isInteger(x) && x >= min && x <= max, 'Invalid ' + label + '.'); return x; }
  function list(x, max, label) { check(Array.isArray(x) && x.length <= max, 'Invalid ' + label + '.'); return x; }
  function url(x) {
    string(x, 2000, 'Source URL');
    if (x) { let parsed; try { parsed = new URL(x); } catch (_) { throw new Error('Use a complete http or https source URL.'); }
      check(['https:', 'http:'].includes(parsed.protocol) && !parsed.username && !parsed.password, 'Use a source URL without credentials and with http or https.'); }
    return x;
  }
  function source(x) {
    check(x && typeof x === 'object' && !Array.isArray(x), 'Invalid source record.');
    const result = {};
    for (const field of ['artifactId', 'archive', 'shelfmark', 'folio', 'transcriber', 'date', 'method', 'imageName']) result[field] = string(x[field] || '', 500, field);
    result.url = url(x.url || ''); return result;
  }
  function create(raw = '') {
    string(raw, 10000, 'Transcription');
    return { version: 2, kind: KIND, raw, mode: 'symbols', width: 1, annotations: {}, revision: 1,
      source: source({}), revisions: [{ id: 1, raw, reason: 'Initial transcription' }], spans: [], layers: [], keys: [], relations: [],
      images: [], inventory: null, hypotheses: [] };
  }
  // Legacy positions count Unicode code points, not UTF-16 code units.
  function legacyTokens(raw, mode, width) {
    const tokens = []; let start = -1, text = '';
    function flush(end) { if (text) tokens.push({ start, end, text }); text = ''; start = -1; }
    const chars = Array.from(raw);
    chars.forEach((ch, i) => {
      const keep = !/\s/u.test(ch) && (mode === 'symbols' || ch === '?' || (mode === 'digits' ? /[0-9]/.test(ch) : /[A-Za-z]/.test(ch)));
      if (!keep) { flush(i); return; }
      if (start < 0) start = i;
      text += ch; if (Array.from(text).length === width) flush(i + 1);
    }); flush(chars.length); return tokens;
  }
  function migrate(v) {
    check(v && v.kind === KIND && (v.version === 1 || v.version === 2), 'Unsupported transcription export.');
    if (v.version === 2) return validate(v);
    string(v.raw, 10000, 'Transcription');
    check(['symbols', 'digits', 'letters'].includes(v.mode) && [1, 2, 5].includes(v.width), 'Unsupported legacy alphabet or width.');
    check(v.annotations && typeof v.annotations === 'object' && !Array.isArray(v.annotations), 'Invalid legacy annotations.');
    const d = create(v.raw); d.mode = v.mode; d.width = v.width;
    const tokens = legacyTokens(v.raw, v.mode, v.width);
    Object.entries(v.annotations).forEach(([index, status]) => {
      check(/^(0|[1-9]\d*)$/.test(index) && Number(index) < tokens.length && ['uncertain', 'missing'].includes(status), 'Invalid legacy annotation.');
      const t = tokens[Number(index)];
      d.spans.push({ id: 'span-' + (d.spans.length + 1), revision: 1, start: t.start, end: t.end, literal: t.text,
        type: status === 'missing' ? 'missing' : 'ciphertext', uncertain: true, alternatives: [], reading: '', reason: 'Imported legacy ' + status + ' annotation', region: null });
    }); return validate(d);
  }
  function validate(value) {
    check(value && value.version === 2 && value.kind === KIND, 'Unsupported evidence document.');
    check(JSON.stringify(value).length <= 750000, 'Evidence document exceeds 750,000 characters.');
    const d = copy(value); string(d.raw, 10000, 'Transcription'); d.source = source(d.source);
    check(['symbols', 'digits', 'letters'].includes(d.mode) && [1, 2, 5].includes(d.width), 'Invalid token settings.');
    integer(d.revision, 1, 50, 'revision'); const revisions = new Map();
    list(d.revisions, 50, 'revisions').forEach(r => {
      integer(r.id, 1, 50, 'revision ID'); check(!revisions.has(r.id), 'Duplicate revision.');
      string(r.raw, 10000, 'Revision text'); string(r.reason, 1000, 'Revision reason');
      check(r.id === 1 || r.reason.trim(), 'Each changed transcription needs a revision reason.'); revisions.set(r.id, r);
    });
    check(revisions.has(d.revision) && revisions.get(d.revision).raw === d.raw, 'Current transcription must match its recorded revision.');
    check(revisions.has(1), 'The original transcription must be retained.');
    check(d.revisions.every((r,i) => r.id === i+1) && d.revision === d.revisions.length, 'Revisions must be consecutive, with the latest revision current.');
    d.annotations = {}; // v2 annotations use source spans, never mutable token indices.
    // Version 2 records written before these existed simply have none of them.
    if (!Array.isArray(d.images)) d.images = [];
    if (!Array.isArray(d.hypotheses)) d.hypotheses = [];
    if (d.inventory === undefined) d.inventory = null;
    const imageIds = new Set();
    list(d.images, 50, 'images').forEach(i => {
      const rec = imageRecord(i);
      check(!imageIds.has(rec.id), 'Duplicate image ID.'); imageIds.add(rec.id);
      Object.assign(i, rec);
    });
    const ids = new Set();
    function unique(id) { string(id, 100, 'Record ID'); check(/^[A-Za-z][A-Za-z0-9_-]*$/.test(id) && !/^revision-/.test(id) && !ids.has(id), 'Invalid, reserved or duplicate record ID.'); ids.add(id); }
    list(d.spans, 500, 'spans').forEach(s => {
      unique(s.id); check(revisions.has(s.revision), 'Span has no source revision.');
      const chars = Array.from(revisions.get(s.revision).raw);
      integer(s.start, 0, chars.length - 1, 'span start'); integer(s.end, s.start + 1, chars.length, 'span end');
      check(s.literal === chars.slice(s.start, s.end).join(''), 'Span does not match its source.');
      check(TYPES.includes(s.type) && typeof s.uncertain === 'boolean', 'Invalid span type or uncertainty.');
      list(s.alternatives, 20, 'alternative readings').forEach(a => string(a, 200, 'Alternative'));
      string(s.reading, 200, 'Accepted reading'); string(s.reason, 1000, 'Reading reason');
      check(!s.reading || !s.alternatives.length || s.alternatives.includes(s.reading), 'Accepted reading must be one of the alternatives.');
      check(s.uncertain || (!s.alternatives.length || (s.reading && s.reason.trim())), 'Resolving alternative readings requires a choice and reason.');
      if (s.region !== null) {
        string(s.imageName, 500, 'Region image filename'); check(s.imageName.trim(), 'An image region needs its recorded source filename.');
        s.imageId = string(s.imageId || '', 100, 'Region image ID');
        check(!s.imageId || imageIds.has(s.imageId), 'An image region must reference a recorded image.');
        check(!s.imageId || d.images.find(i => i.id === s.imageId).name === s.imageName, 'The region filename must match its image record.');
        list(s.region, 4, 'image region'); check(s.region.length === 4 && s.region.every(n => Number.isFinite(n) && n >= 0 && n <= 1), 'Image region uses four fractions between 0 and 1.');
        check(s.region[2] > 0 && s.region[3] > 0 && s.region[0] + s.region[2] <= 1.00000001 && s.region[1] + s.region[3] <= 1.00000001, 'Image region must fit inside the image.');
      }
    });
    const parents = new Set(d.revisions.map(r => 'revision-' + r.id));
    list(d.layers, 100, 'reading layers').forEach(l => {
      unique(l.id); check(['symbols', 'diplomatic', 'normalized', 'translation'].includes(l.kind), 'Unknown reading layer.');
      check(parents.has(l.parent), 'A reading layer must reference an earlier source or layer.');
      check(revisions.has(l.revision), 'Reading layer has no source revision.');
      const parentLayer = d.layers.find(p => p.id === l.parent);
      const parentRevision = parentLayer ? parentLayer.revision : Number(l.parent.replace('revision-', ''));
      check(parentRevision === l.revision, 'Reading layer belongs to a different source revision.');
      string(l.text, 20000, 'Layer text'); string(l.note, 1000, 'Transformation note'); check(l.note.trim(), 'Describe the transformation.'); parents.add(l.id);
    });
    list(d.keys, 30, 'keys').forEach(k => { unique(k.id); string(k.title, 200, 'Key title'); url(k.sourceUrl); validateKey(k.entries); });
    list(d.relations, 100, 'relationships').forEach(r => {
      ['from', 'to', 'evidence'].forEach(f => string(r[f], 2000, 'Relationship ' + f));
      check(r.from.trim() && r.to.trim() && r.evidence.trim(), 'Relationships need two identifiers and supporting evidence.');
      check(['transcribes', 'applies-key', 'supports', 'alternative-to'].includes(r.type), 'Unsupported relationship type.');
    });
    if (d.inventory !== null) {
      const inv = d.inventory;
      check(inv && typeof inv === 'object' && !Array.isArray(inv), 'Invalid symbol inventory.');
      check(revisions.has(inv.revision), 'The symbol inventory has no source revision.');
      check(INVENTORY_TOKENS.includes(inv.tokens), 'Unknown inventory tokenization.');
      integer(inv.width, 1, 8, 'inventory token width'); integer(inv.nextId, 1, 5000, 'inventory counter');
      const src = inventoryTokens(revisions.get(inv.revision).raw, inv.tokens, inv.width);
      list(inv.occurrences, 2000, 'inventory occurrences');
      check(inv.occurrences.length === src.length, 'The symbol inventory does not match its source revision.');
      inv.occurrences.forEach((o, i) => check(o.index === i && o.start === src[i].start && o.end === src[i].end && o.literal === src[i].literal,
        'Inventory occurrence ' + i + ' no longer matches the recorded source.'));
      const assigned = new Set(), classIds = new Set();
      list(inv.classes, 500, 'symbol classes').forEach(c => {
        check(/^class-[1-9][0-9]*$/.test(c.id) && !classIds.has(c.id), 'Invalid or duplicate symbol-class ID.'); classIds.add(c.id);
        string(c.label, 200, 'Class label'); check(c.label.trim(), 'Every symbol class needs a label.');
        string(c.note, 4000, 'Class note'); check(c.note.trim(), 'Every symbol class records why it exists.');
        list(c.occurrences, 2000, 'class occurrences').forEach(i => {
          integer(i, 0, inv.occurrences.length - 1, 'occurrence index');
          check(!assigned.has(i), 'An occurrence belongs to exactly one symbol class.'); assigned.add(i); });
        check(c.occurrences.length > 0, 'A symbol class cannot be empty.');
      });
      check(assigned.size === inv.occurrences.length, 'Every occurrence must belong to a symbol class.');
      list(inv.history, 2000, 'inventory history').forEach((h, i) => {
        check(h.step === i + 1, 'Inventory decision history must stay in order.');
        check(INVENTORY_OPS.includes(h.op), 'Unknown inventory operation.');
        string(h.detail, 4000, 'History detail'); check(h.detail.trim(), 'Every inventory decision records what changed.'); });
      check(inv.history.length > 0, 'The inventory must retain its decision history.');
    }
    list(d.hypotheses, 100, 'hypotheses').forEach(h => {
      unique(h.id); check(/^hypothesis-[1-9][0-9]*$/.test(h.id), 'Invalid hypothesis ID.');
      string(h.claim, 2000, 'Hypothesis claim'); check(h.claim.trim(), 'A hypothesis needs a claim.');
      check(CONFIDENCE.includes(h.confidence), 'Use one of the declared confidence words: ' + CONFIDENCE.join(', ') + '.');
      ['supports', 'contradicts'].forEach(field => list(h[field], 50, field + ' evidence').forEach(e => {
        check(e && typeof e === 'object' && !Array.isArray(e), 'Evidence entries are objects.');
        string(e.ref, 2000, 'Evidence reference'); string(e.note, 2000, 'Evidence note');
        check(e.ref.trim() && e.note.trim(), 'Each piece of evidence needs an identifier and a note.'); }));
      list(h.alternatives, 20, 'unresolved alternatives').forEach(a => string(a, 500, 'Unresolved alternative'));
      string(h.note, 2000, 'Hypothesis note');
      // Applying a key cleanly is not evidence of authorship, attribution or date.
      check(h.confidence !== 'well-supported' || h.supports.length >= 2,
        'Calling a claim well-supported needs at least two separately recorded pieces of supporting evidence.');
      check(h.confidence !== 'well-supported' || h.contradicts.length === 0,
        'Recorded counterevidence must be answered before a claim is called well-supported.');
      check(h.confidence !== 'contradicted' || h.contradicts.length > 0,
        'A contradicted claim must record the evidence against it.');
    });
    return d;
  }
  function revise(d, raw, reason) {
    d = validate(d); string(raw, 10000, 'Transcription'); if (raw === d.raw) return d;
    check(d.revisions.length < 50, 'Export this record before starting a new document: 50 revisions reached.');
    check(typeof reason === 'string' && reason.trim(), 'Describe why the transcription changed.');
    d.revision = Math.max(...d.revisions.map(r => r.id)) + 1; d.raw = raw;
    d.revisions.push({ id: d.revision, raw, reason }); return validate(d);
  }
  function annotate(d, input) {
    d = validate(d); const s = copy(input);
    s.id = 'span-' + (1 + Math.max(0, ...d.spans.map(x => Number(x.id.split('-').pop()) || 0)));
    s.revision = d.revision; s.literal = Array.from(d.raw).slice(s.start, s.end).join('');
    // A region names the image record it belongs to; the filename follows from it.
    if (s.region !== null) {
      if (s.imageId) { const image = d.images.find(i => i.id === s.imageId); check(image, 'An image region must reference a recorded image.'); s.imageName = image.name; }
      else s.imageName = d.source.imageName;
    }
    d.spans.push(s); return validate(d);
  }
  function addLayer(d, kind, parent, text, note) {
    d = validate(d); d.layers.push({ id: 'layer-' + (d.layers.length + 1), revision: d.revision, kind, parent, text, note }); return validate(d);
  }
  function validateKey(entries) {
    list(entries, 150, 'key entries'); const seen = new Set();
    entries.forEach(e => {
      string(e.symbol, 100, 'Key symbol'); check(e.symbol.trim() && !seen.has(e.symbol), 'Each key symbol must be nonempty and unique.'); seen.add(e.symbol);
      check(KEY_TYPES.includes(e.type), 'Unknown key-entry type.'); list(e.values, 20, 'key readings').forEach(v => string(v, 200, 'Key reading'));
      if (['null', 'space', 'repeat', 'erase', 'unknown'].includes(e.type)) check(e.values.length === 0, 'Control entries have no literal readings.');
      else { check(e.values.length > 0 && e.values.every(v => v.length > 0), 'Supply at least one reading.'); if (e.type === 'letter') check(e.values.every(v => Array.from(v).length === 1), 'A letter entry contains single characters.'); }
    }); return entries;
  }
  function applyKey(tokens, entries) {
    validateKey(entries); const key = new Map(entries.map(e => [e.symbol, e])); let text = '', unresolved = 0;
    tokens.forEach(t => {
      const e = key.get(t);
      if (!e || e.type === 'unknown') { text += '⟦' + t + '?⟧'; unresolved++; }
      else if (e.type === 'null') return;
      else if (e.type === 'space') text += ' ';
      else if (e.type === 'repeat' || e.type === 'erase') {
        // This explicit teaching convention acts on one resolved Unicode character.
        if (!text || text.endsWith('⟧')) { text += '⟦' + e.type + '?⟧'; unresolved++; }
        else { const chars = Array.from(text); if (e.type === 'repeat') text += chars.at(-1); else text = chars.slice(0, -1).join(''); }
      } else if (e.values.length > 1) { text += '⟦' + e.values.join('/') + '⟧'; unresolved++; }
      else text += e.values[0];
    }); return { text, unresolved, tokens: tokens.length };
  }
  // ── Numerical segmentation ────────────────────────────────────────────────
  // A typed entry distinguishes a letter, a syllable, a whole word, a name and a
  // null that deliberately contributes nothing. A bare string stays one reading.
  const SEG_TYPES = ['letter', 'syllable', 'word', 'name', 'null'];
  const SEG_LINES = ['boundary', 'span'];
  const COUNT_CAP = 1e15;
  function normalizeCodes(key) {
    const raw = Object.entries(key);
    check(raw.length > 0 && raw.length <= 64, 'Use 1–64 numerical key entries.');
    return raw.map(([code, value]) => {
      check(/^[0-9]{1,6}$/.test(code), 'Codes must contain 1–6 digits.');
      if (typeof value === 'string') {
        string(value, 50, 'Code reading'); check(value.length > 0, 'Code readings cannot be empty.');
        return { code, type: Array.from(value).length === 1 ? 'letter' : 'word', values: [value], note: '' };
      }
      check(value && typeof value === 'object' && !Array.isArray(value), 'A code entry is a string or a typed object.');
      check(SEG_TYPES.includes(value.type), 'Unknown numerical code type.');
      const values = list(value.values || [], 8, 'code readings').map(v => string(v, 50, 'Code reading'));
      if (value.type === 'null') check(values.length === 0, 'A null code contributes no reading.');
      else check(values.length > 0 && values.every(v => v.length > 0), 'Supply at least one reading.');
      return { code, type: value.type, values, note: string(value.note || '', 200, 'Code note') };
    });
  }
  const codeReading = e => (e.type === 'null' ? '' : e.values[0]);
  // Lattice segmentation. Backward reachability prunes dead ends before any path is
  // built. When every complete path fits the node budget the enumeration is exhaustive
  // and the retained set is globally best; otherwise a per-state beam bounds the work
  // and the global optimum is no longer guaranteed. The result says which happened.
  function segment(digits, key, boundaries = [], limit = 10000, score = () => 0, options = {}) {
    check(typeof digits === 'string' && /^[0-9](?:[0-9\n]*[0-9])?$/.test(digits) && digits.replace(/\n/g, '').length <= 80,
      'Use 1–80 digits without spaces; line breaks are allowed and kept as source structure. The source will not be normalized.');
    check(key && typeof key === 'object' && !Array.isArray(key), 'Supply a code-to-reading object.');
    const entries = normalizeCodes(key);
    integer(limit, 1, 20000, 'path budget');
    const opts = options && typeof options === 'object' ? options : {};
    const policy = opts.lineBreaks || 'boundary';
    check(SEG_LINES.includes(policy), 'Unknown line-break policy.');
    const beam = integer(opts.beam === undefined ? 32 : opts.beam, 1, 64, 'retained-path limit');
    const n = digits.length;
    list(boundaries, 159, 'locked boundaries').forEach(b => integer(b, 1, n - 1, 'locked boundary'));
    const cuts = new Set(boundaries);
    // Line breaks are source structure, not data. Under the default policy they are
    // mandatory cuts that no code may cross; under 'span' a code may continue across
    // one. Either way the break itself is never consumed, so the original digits and
    // their line layout survive in every path.
    // Line positions are tracked only for the ambiguity report. Whether a code may
    // cross one is decided in exactly one place, matchAt below, so a change there
    // cannot be masked by a second mechanism quietly enforcing the same rule.
    const lineCuts = new Set();
    if (policy === 'boundary') for (let i = 0; i < n; i++) if (digits[i] === '\n') { lineCuts.add(i); lineCuts.add(i + 1); }
    // Returns the end position of a code matched from pos, or -1.
    function matchAt(pos, code) {
      let i = pos, k = 0;
      while (k < code.length) {
        if (i >= n) return -1;
        if (digits[i] === '\n') { if (policy !== 'span') return -1; i++; continue; }
        if (digits[i] !== code[k]) return -1;
        i++; k++;
      }
      return i;
    }
    const edges = [];
    for (let pos = 0; pos < n; pos++) {
      edges[pos] = [];
      if (digits[pos] === '\n') { edges[pos].push({ entry: null, end: pos + 1 }); continue; }
      for (const e of entries) {
        const end = matchAt(pos, e.code);
        if (end < 0) continue;
        let blocked = false;
        for (let b = pos + 1; b < end; b++) if (cuts.has(b)) { blocked = true; break; }
        if (!blocked) edges[pos].push({ entry: e, end });
      }
    }
    const reach = new Array(n + 1).fill(false), bwd = new Array(n + 1).fill(0);
    reach[n] = true; bwd[n] = 1;
    for (let pos = n - 1; pos >= 0; pos--) {
      let sum = 0;
      for (const edge of edges[pos]) if (reach[edge.end]) sum += bwd[edge.end];
      bwd[pos] = Math.min(sum, COUNT_CAP); reach[pos] = sum > 0;
    }
    const fwd = new Array(n + 1).fill(0); fwd[0] = 1;
    for (let pos = 0; pos < n; pos++) {
      if (!fwd[pos] || !reach[pos]) continue;
      for (const edge of edges[pos]) if (reach[edge.end]) fwd[edge.end] = Math.min(fwd[edge.end] + fwd[pos], COUNT_CAP);
    }
    const total = bwd[0], exhaustive = total <= limit;
    const paths = []; let visited = 0, truncated = false, beamPruned = false;
    const order = (a, b) => b.score - a.score || a.codes.join('|').localeCompare(b.codes.join('|'));
    function keep(codes, items, text) {
      const value = score(text);
      check(Number.isFinite(value), 'The selected scoring model cannot score this reading.');
      paths.push({ codes, entries: items, text, score: value,
        alternatives: items.filter(i => i.values.length > 1).map(i => ({ code: i.code, start: i.start, values: i.values.slice() })) });
      paths.sort(order); if (paths.length > beam) paths.pop();
    }
    function step(pos, edge, codes, items, text) {
      if (!edge.entry) return { codes: codes.concat('\n'), items, text };
      const reading = codeReading(edge.entry);
      // The recorded chunk is the SOURCE slice, so joining a path's chunks always
      // reproduces the original digits, line breaks included.
      const source = digits.slice(pos, edge.end);
      return { codes: codes.concat(source), text: text + reading,
        items: items.concat([{ code: edge.entry.code, source, type: edge.entry.type, reading,
          values: edge.entry.values.slice(), start: pos, end: edge.end }]) };
    }
    if (exhaustive) {
      (function walk(pos, codes, items, text) {
        if (visited >= limit) { truncated = true; return; }
        visited++;
        if (pos === n) { keep(codes, items, text); return; }
        for (const edge of edges[pos]) {
          if (!reach[edge.end]) continue;
          const nx = step(pos, edge, codes, items, text);
          walk(edge.end, nx.codes, nx.items, nx.text);
          if (truncated) return;
        }
      })(0, [], [], '');
    } else {
      const decomposable = typeof score.step === 'function';
      const states = new Array(n + 1);
      states[0] = [{ codes: [], items: [], text: '', score: 0 }];
      for (let pos = 0; pos < n && !truncated; pos++) {
        const here = states[pos];
        if (!here || !here.length || !reach[pos]) continue;
        if (here.length > beam) { here.sort(order); here.length = beam; beamPruned = true; }
        for (const edge of edges[pos]) {
          if (!reach[edge.end]) continue;
          const bucket = states[edge.end] || (states[edge.end] = []);
          for (const partial of here) {
            if (visited >= limit) { truncated = true; break; }
            visited++;
            const nx = step(pos, edge, partial.codes, partial.items, partial.text);
            const value = decomposable ? partial.score + score.step(partial.text, nx.text.slice(partial.text.length)) : 0;
            check(Number.isFinite(value), 'The selected scoring model cannot score this reading.');
            bucket.push({ codes: nx.codes, items: nx.items, text: nx.text, score: value });
          }
          if (truncated) break;
        }
      }
      const finals = (states[n] || []).slice();
      finals.sort(order);
      if (finals.length > beam) beamPruned = true;
      finals.slice(0, beam).forEach(f => keep(f.codes, f.items, f.text));
    }
    // The ambiguity view is read off the lattice itself, so it is exact in both modes.
    const ambiguity = [];
    if (total > 0) for (let p = 1; p < n; p++) {
      const through = Math.min(fwd[p] * bwd[p], COUNT_CAP);
      ambiguity.push({ position: p, pathsCutting: through, locked: cuts.has(p) || lineCuts.has(p),
        forced: through >= total, impossible: through === 0,
        startingCodes: (edges[p] || []).filter(e => e.entry && reach[e.end]).map(e => e.entry.code) });
    }
    const complete = exhaustive && !truncated;
    return { paths, visited, complete, total, totalCapped: total >= COUNT_CAP, retained: paths.length, limit,
      boundaries: boundaries.slice(), lineBreaks: policy, beam, beamPruned, ambiguity,
      mode: exhaustive ? 'exhaustive-lattice' : 'bounded-k-best',
      globalBestGuaranteed: complete,
      pruning: complete
        ? 'Backward reachability only. Every complete path was enumerated and scored, so the retained ranking is globally best.'
        : 'Backward reachability plus a per-state beam of ' + beam + ' within a ' + limit + '-node budget. Pruning can discard the globally best path.' };
  }
  // Segmentation error is reported apart from plaintext error: a boundary can move
  // without changing a letter, and a reading can change without moving a boundary.
  function segmentMetrics(expected, actual) {
    const bounds = codes => { const s = new Set(); let p = 0;
      list(codes, 200, 'code sequence').forEach(c => { p += String(c).length; s.add(p); }); s.delete(p); return s; };
    const a = bounds(expected), b = bounds(actual);
    let shared = 0; a.forEach(x => { if (b.has(x)) shared++; });
    const union = new Set(); a.forEach(x => union.add(x)); b.forEach(x => union.add(x));
    return { boundaryMatches: shared, boundariesExpected: a.size, boundariesActual: b.size,
      boundarySymmetricDifference: union.size - shared,
      boundaryError: a.size ? (a.size - shared) / a.size : (b.size ? 1 : 0),
      exactCodes: expected.length === actual.length && expected.every((c, i) => String(c) === String(actual[i])) };
  }
  function rng(seed) {
    let x = seed >>> 0;
    return function () { x += 0x6D2B79F5; let t = x; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function parseSymbols(raw) {
    string(raw, 12000, 'Symbol sequence'); const tokens = raw.trim().split(/\s+/u).filter(Boolean);
    check(tokens.length >= 3 && tokens.length <= 600, 'Use 3–600 whitespace-separated symbol IDs.');
    check(tokens.every(t => t.length <= 40 && !t.includes('?')), 'Resolve unknown symbols first; IDs may be at most 40 characters.');
    check(new Set(tokens).size <= 100, 'Use at most 100 distinct symbol IDs.'); return tokens;
  }
  // Deterministic simulated annealing; independent assignments permit many-to-one keys.
  function search(tokens, options, score, progress = () => {}) {
    parseSymbols(tokens.join(' ')); const symbols = Array.from(new Set(tokens));
    const seed = integer(options.seed, 0, 4294967295, 'seed');
    const steps = integer(options.steps, 1, 100000, 'search budget');
    check(steps * tokens.length <= 20000000, 'Reduce the step budget: maximum 20 million symbol evaluations.');
    const locks = options.locks || {}; check(typeof locks === 'object' && !Array.isArray(locks), 'Invalid locked key.');
    Object.entries(locks).forEach(([s,v]) => check(symbols.includes(s) && /^[A-Z]$/.test(v), 'A lock must name a present symbol and one A–Z letter.'));
    const random = rng(seed), alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', weighted = 'EEEEEEEEEEEETTTTTTTTTAAAAAAAAOOOOOOOIIIIIIINNNNNNNSSSSSSHHHHHHRRRRRRDDDDLLLLCCCUUUMMWWFFGGYYPPBBVKJXQZ';
    const ids = tokens.map(t => symbols.indexOf(t)), free = symbols.map((_,i) => i).filter(i => !own(locks, symbols[i]));
    let key = [], current = -Infinity, best = -Infinity; const candidates = [], trace = [];
    function decode(k) { return ids.map(i => k[i]).join(''); }
    function retain(k, fit, step) {
      const plaintext = decode(k); if (candidates.some(c => c.plaintext === plaintext)) return;
      candidates.push({ plaintext, score: fit, step, key: Object.fromEntries(symbols.map((s,i) => [s,k[i]])) });
      candidates.sort((a,b) => b.score - a.score || a.plaintext.localeCompare(b.plaintext)); if (candidates.length > 5) candidates.pop();
    }
    const restartLength = Math.min(5000, steps);
    for (let i = 0; i < steps; i++) {
      if (i % restartLength === 0) {
        key = symbols.map(s => own(locks,s) ? locks[s] : weighted[Math.floor(random() * weighted.length)]);
        current = score(decode(key)); check(Number.isFinite(current), 'Scoring model returned an invalid value.'); retain(key, current, i);
      }
      if (!free.length) { retain(key, current, i); best = current; trace.push({ step: 0, score: current }); break; }
      const a = free[Math.floor(random() * free.length)], oldA = key[a];
      let b = -1, oldB;
      if (free.length > 1 && random() < 0.2) { b = free[Math.floor(random() * free.length)]; oldB = key[b]; key[a] = oldB; key[b] = oldA; }
      else key[a] = alphabet[Math.floor(random() * 26)];
      const next = score(decode(key)), temp = 0.2 + 8 * (1 - (i % restartLength) / restartLength);
      check(Number.isFinite(next), 'Scoring model returned an invalid value.');
      if (next >= current || random() < Math.exp((next - current) / temp)) current = next;
      else { key[a] = oldA; if (b >= 0) key[b] = oldB; }
      if (current >= best || i % 1000 === 0) { retain(key, current, i + 1); best = Math.max(best, current); }
      if (i % 1000 === 0 || i === steps - 1) { trace.push({ step: i + 1, score: candidates[0].score }); progress({ step: i + 1, steps, score: candidates[0].score }); }
    }
    return { candidates, trace, seed, requestedSteps: steps, completedSteps: free.length ? steps : 0,
      task: free.length ? 'key-recovery-candidates' : 'known-key-application', locks: copy(locks),
      model: score.modelId || 'custom-scoring-function', verified: false, scope: 'Letter homophones only; no word codes, nulls, control signs or historical-language model.' };
  }
  // ── Images, coordinate transforms and occurrence linking ──────────────────
  // A region is always stored in the ORIGINAL image's normalized coordinates.
  // Crop and rotation describe only how the image is presented, so changing the
  // presentation never rewrites a recorded region.
  const ROTATIONS = [0, 90, 180, 270];
  function imageRecord(x) {
    check(x && typeof x === 'object' && !Array.isArray(x), 'Invalid image record.');
    const r = {};
    r.id = string(x.id, 100, 'Image ID');
    check(/^[A-Za-z][A-Za-z0-9_-]*$/.test(r.id), 'Invalid image ID.');
    r.name = string(x.name || '', 500, 'Image filename');
    check(r.name.trim(), 'An image record needs its recorded filename.');
    r.sha256 = string(x.sha256 || '', 64, 'Image content hash');
    check(r.sha256 === '' || /^[0-9a-f]{64}$/.test(r.sha256), 'An image hash is 64 lowercase hexadecimal characters.');
    r.width = integer(x.width, 1, 100000, 'image width');
    r.height = integer(x.height, 1, 100000, 'image height');
    r.rotation = integer(x.rotation === undefined ? 0 : x.rotation, 0, 270, 'image rotation');
    check(ROTATIONS.includes(r.rotation), 'Rotation must be 0, 90, 180 or 270 degrees clockwise.');
    const crop = x.crop === undefined || x.crop === null ? [0, 0, 1, 1] : x.crop;
    list(crop, 4, 'image crop');
    check(crop.length === 4 && crop.every(v => Number.isFinite(v) && v >= 0 && v <= 1), 'A crop uses four fractions between 0 and 1.');
    check(crop[2] > 0 && crop[3] > 0 && crop[0] + crop[2] <= 1.00000001 && crop[1] + crop[3] <= 1.00000001, 'A crop must fit inside the image.');
    r.crop = crop.map(Number);
    r.note = string(x.note || '', 1000, 'Image note');
    return r;
  }
  function regionToDisplay(image, region) {
    const img = imageRecord(image);
    list(region, 4, 'image region');
    check(region.length === 4 && region.every(v => Number.isFinite(v)), 'A region is four finite numbers.');
    const c = img.crop;
    let x = (region[0] - c[0]) / c[2], y = (region[1] - c[1]) / c[3], w = region[2] / c[2], h = region[3] / c[3];
    const visible = x + w > 1e-9 && y + h > 1e-9 && x < 1 - 1e-9 && y < 1 - 1e-9;
    if (img.rotation === 90) { const nx = 1 - (y + h); y = x; x = nx; const t = w; w = h; h = t; }
    else if (img.rotation === 180) { x = 1 - (x + w); y = 1 - (y + h); }
    else if (img.rotation === 270) { const nx = y; y = 1 - (x + w); x = nx; const t = w; w = h; h = t; }
    const clipped = x < -1e-9 || y < -1e-9 || x + w > 1 + 1e-9 || y + h > 1 + 1e-9;
    return { visible, clipped, box: [x, y, w, h] };
  }
  function displayToRegion(image, box) {
    const img = imageRecord(image);
    list(box, 4, 'display box');
    check(box.length === 4 && box.every(v => Number.isFinite(v)), 'A display box is four finite numbers.');
    let x = box[0], y = box[1], w = box[2], h = box[3];
    if (img.rotation === 90) { const nx = y; y = 1 - (x + w); x = nx; const t = w; w = h; h = t; }
    else if (img.rotation === 180) { x = 1 - (x + w); y = 1 - (y + h); }
    else if (img.rotation === 270) { const nx = 1 - (y + h); y = x; x = nx; const t = w; w = h; h = t; }
    const c = img.crop;
    return [c[0] + x * c[2], c[1] + y * c[3], w * c[2], h * c[3]];
  }
  // Pixel size of what the viewer sees, after cropping and rotation.
  function displayAspect(image) {
    const img = imageRecord(image);
    const w = img.width * img.crop[2], h = img.height * img.crop[3];
    return img.rotation % 180 === 0 ? { width: w, height: h } : { width: h, height: w };
  }
  function addImage(d, input) {
    d = validate(d);
    const next = copy(input || {});
    if (!next.id) next.id = 'image-' + (d.images.length + 1);
    check(!d.images.some(i => i.id === next.id), 'Duplicate image ID.');
    d.images.push(imageRecord(next));
    return validate(d);
  }
  // ── Symbol inventory ──────────────────────────────────────────────────────
  const INVENTORY_TOKENS = ['whitespace', 'fixed'];
  const INVENTORY_OPS = ['build', 'split', 'merge', 'relabel'];
  function inventoryTokens(raw, mode, width) {
    check(INVENTORY_TOKENS.includes(mode), 'Unknown inventory tokenization.');
    const chars = Array.from(raw), out = [];
    let start = -1, text = '';
    const flush = end => { if (text) out.push({ start, end, literal: text }); text = ''; start = -1; };
    chars.forEach((ch, i) => {
      if (/\s/u.test(ch)) { flush(i); return; }
      if (start < 0) start = i;
      text += ch;
      if (mode === 'fixed' && Array.from(text).length === width) flush(i + 1);
    });
    flush(chars.length);
    return out.map((t, i) => ({ index: i, start: t.start, end: t.end, literal: t.literal }));
  }
  function buildInventory(d, options = {}) {
    d = validate(d);
    const mode = options.tokens || 'whitespace';
    const width = mode === 'fixed' ? integer(options.width || 1, 1, 8, 'token width') : 1;
    const tokens = inventoryTokens(d.raw, mode, width);
    check(tokens.length > 0 && tokens.length <= 2000, 'A symbol inventory needs 1–2,000 occurrences.');
    const byLiteral = new Map();
    tokens.forEach(t => { if (!byLiteral.has(t.literal)) byLiteral.set(t.literal, []); byLiteral.get(t.literal).push(t.index); });
    check(byLiteral.size <= 400, 'Use at most 400 distinct symbols in one inventory.');
    let seq = 0;
    const classes = Array.from(byLiteral.entries()).map(([literal, occ]) => ({
      id: 'class-' + (++seq), label: literal,
      note: 'Initial class: every occurrence transcribed as ' + literal + '. Not yet inspected.',
      occurrences: occ.slice() }));
    d.inventory = { revision: d.revision, tokens: mode, width, nextId: seq + 1, occurrences: tokens, classes,
      history: [{ step: 1, op: 'build',
        detail: 'Built ' + classes.length + ' classes from ' + tokens.length + ' occurrences at revision ' + d.revision +
          '. Identical transcriptions start together; splitting them is a research decision.' }] };
    return validate(d);
  }
  function requireInventory(d) { check(d.inventory, 'Build the symbol inventory before changing it.'); return d.inventory; }
  function splitClass(d, classId, indices, label, reason) {
    d = validate(d); const inv = requireInventory(d);
    const source = inv.classes.find(c => c.id === classId);
    check(source, 'Unknown symbol class.');
    const chosen = Array.from(new Set(list(indices, 2000, 'selected occurrences')
      .map(i => integer(i, 0, inv.occurrences.length - 1, 'occurrence index')))).sort((a, b) => a - b);
    check(chosen.length > 0, 'Select at least one occurrence to split out.');
    check(chosen.every(i => source.occurrences.includes(i)), 'Every selected occurrence must belong to the class being split.');
    check(chosen.length < source.occurrences.length, 'Splitting every occurrence would empty the class; relabel it instead.');
    check(typeof reason === 'string' && reason.trim(), 'Record why these occurrences are a different symbol.');
    const id = 'class-' + inv.nextId++;
    const before = source.label;
    source.occurrences = source.occurrences.filter(i => chosen.indexOf(i) < 0);
    inv.classes.push({ id, label: string(label, 200, 'Class label'), note: reason, occurrences: chosen });
    check(label.trim(), 'The new class needs a label.');
    inv.history.push({ step: inv.history.length + 1, op: 'split',
      detail: 'Split occurrences ' + chosen.join(', ') + ' out of ' + source.id + ' (' + before + ') into ' + id +
        ' (' + label + '). Remaining occurrences keep their earlier assignment. Reason: ' + reason });
    return validate(d);
  }
  function mergeClasses(d, ids, label, reason) {
    d = validate(d); const inv = requireInventory(d);
    const chosen = list(ids, 50, 'merged classes').map(id => {
      const c = inv.classes.find(x => x.id === id); check(c, 'Unknown symbol class.'); return c; });
    check(new Set(ids).size === chosen.length, 'List each merged class once.');
    check(chosen.length >= 2, 'Select at least two classes to merge.');
    check(typeof reason === 'string' && reason.trim(), 'Record why these are one symbol.');
    check(typeof label === 'string' && label.trim(), 'The merged class needs a label.');
    const kept = chosen[0];
    const prior = chosen.map(c => c.id + ' labelled ' + c.label + ' (' + c.note + ')').join(' | ');
    const occ = []; chosen.forEach(c => c.occurrences.forEach(i => occ.push(i)));
    kept.occurrences = Array.from(new Set(occ)).sort((a, b) => a - b);
    kept.label = string(label, 200, 'Class label'); kept.note = reason;
    inv.classes = inv.classes.filter(c => c === kept || chosen.indexOf(c) < 0);
    inv.history.push({ step: inv.history.length + 1, op: 'merge',
      detail: 'Merged into ' + kept.id + ' as ' + label + '. Earlier assignments were: ' + prior + '. Reason: ' + reason });
    return validate(d);
  }
  function relabelClass(d, classId, label, reason) {
    d = validate(d); const inv = requireInventory(d);
    const c = inv.classes.find(x => x.id === classId); check(c, 'Unknown symbol class.');
    check(typeof label === 'string' && label.trim(), 'A class needs a label.');
    check(typeof reason === 'string' && reason.trim(), 'Record why the label changed.');
    const before = c.label;
    c.label = string(label, 200, 'Class label'); c.note = reason;
    inv.history.push({ step: inv.history.length + 1, op: 'relabel',
      detail: 'Relabelled ' + classId + ' from ' + before + ' to ' + label + '. Reason: ' + reason });
    return validate(d);
  }
  // Every occurrence of a class, with the spans and image regions recorded over it.
  function classOccurrences(d, classId) {
    d = validate(d); const inv = requireInventory(d);
    const c = inv.classes.find(x => x.id === classId); check(c, 'Unknown symbol class.');
    return c.occurrences.map(i => {
      const o = inv.occurrences[i];
      const spans = d.spans.filter(s => s.revision === inv.revision && s.start < o.end && s.end > o.start);
      return { index: i, start: o.start, end: o.end, literal: o.literal,
        spans: spans.map(s => s.id),
        regions: spans.filter(s => s.region).map(s => ({ span: s.id, imageId: s.imageId || '', imageName: s.imageName || '', region: s.region.slice() })) };
    });
  }
  // The reverse direction: which transcription characters a recorded region covers.
  function regionOccurrences(d, spanId) {
    d = validate(d);
    const s = d.spans.find(x => x.id === spanId); check(s, 'Unknown evidence span.');
    const inv = d.inventory;
    const classes = [];
    if (inv && inv.revision === s.revision) inv.classes.forEach(c => {
      const hit = c.occurrences.filter(i => { const o = inv.occurrences[i]; return o.start < s.end && o.end > s.start; });
      if (hit.length) classes.push({ id: c.id, label: c.label, occurrences: hit });
    });
    return { span: s.id, revision: s.revision, start: s.start, end: s.end, literal: s.literal,
      imageId: s.imageId || '', imageName: s.imageName || '', region: s.region ? s.region.slice() : null, classes };
  }
  // ── Hypothesis register ───────────────────────────────────────────────────
  const CONFIDENCE = ['unsupported', 'possible', 'probable', 'well-supported', 'contradicted'];
  function addHypothesis(d, input) {
    d = validate(d);
    const h = copy(input || {});
    h.id = 'hypothesis-' + (d.hypotheses.length + 1);
    h.supports = h.supports || []; h.contradicts = h.contradicts || [];
    h.alternatives = h.alternatives || []; h.note = h.note || '';
    d.hypotheses.push(h);
    return validate(d);
  }
  // ── Investigation bundle ──────────────────────────────────────────────────
  const BUNDLE_KIND = 'cipher-museum-investigation';
  const BUNDLE_VERSION = 1;
  const MODEL_BUILD = 'research-model-2026-10-29';
  // A declared NON-cryptographic 64-bit fingerprint. It detects a changed input so
  // stale results can be invalidated; it is not an integrity or authenticity check.
  function fingerprint(text) {
    string(text, 4000000, 'Fingerprint input');
    let a = 0x811c9dc5, b = 0x01000193;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      a = Math.imul(a ^ c, 16777619) >>> 0;
      b = Math.imul(b + c + i, 2246822519) >>> 0; b = (b ^ b >>> 13) >>> 0;
    }
    return (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0');
  }
  function lockMap(x, label) {
    check(x && typeof x === 'object' && !Array.isArray(x), 'Invalid ' + label + '.');
    const out = {};
    Object.entries(x).forEach(([k, v]) => { string(k, 40, label + ' symbol'); check(/^[A-Z]$/.test(v), 'A lock names one A–Z letter.'); out[k] = v; });
    check(Object.keys(out).length <= 100, 'Too many locked mappings.');
    return out;
  }
  function searchState(s) {
    check(s && typeof s === 'object' && !Array.isArray(s), 'Invalid solver state.');
    return { algorithm: string(s.algorithm || 'annealing', 40, 'Solver algorithm'),
      raw: string(s.raw || '', 12000, 'Solver input'),
      seed: integer(s.seed === undefined ? 0 : s.seed, 0, 4294967295, 'seed'),
      steps: integer(s.steps === undefined ? 1 : s.steps, 1, 100000, 'search budget'),
      beam: integer(s.beam === undefined ? 0 : s.beam, 0, 2000, 'beam width'),
      locks: lockMap(s.locks || {}, 'locked key'),
      elapsedMs: integer(s.elapsedMs === undefined ? 0 : s.elapsedMs, 0, 86400000, 'elapsed time'),
      // Recorded at the time the result was produced, so a later edit shows up as stale.
      inputFingerprint: s.inputFingerprint === undefined
        ? fingerprint(string(s.raw || '', 12000, 'Solver input'))
        : string(s.inputFingerprint, 32, 'Solver input fingerprint') };
  }
  function segmentationState(s) {
    check(s && typeof s === 'object' && !Array.isArray(s), 'Invalid segmentation state.');
    return { digits: string(s.digits || '', 200, 'Digit stream'),
      key: (() => { const k = s.key || {}; normalizeCodes(Object.keys(k).length ? k : { 0: 'A' }); return copy(k); })(),
      boundaries: list(s.boundaries || [], 159, 'locked boundaries').map(b => integer(b, 1, 200, 'locked boundary')),
      budget: integer(s.budget === undefined ? 10000 : s.budget, 1, 20000, 'path budget'),
      scoring: string(s.scoring || 'neutral', 60, 'Segmentation scoring'),
      lineBreaks: string(s.lineBreaks || 'boundary', 20, 'Line-break policy'),
      inputFingerprint: s.inputFingerprint === undefined
        ? fingerprint(string(s.digits || '', 200, 'Digit stream') + '|' + JSON.stringify(s.key || {}))
        : string(s.inputFingerprint, 32, 'Segmentation input fingerprint') };
  }
  function candidateRecord(c) {
    check(c && typeof c === 'object' && !Array.isArray(c), 'Invalid candidate record.');
    return { plaintext: string(c.plaintext || '', 20000, 'Candidate plaintext'),
      score: (check(Number.isFinite(c.score), 'A candidate needs a finite score.'), c.score),
      key: lockMap(c.key || {}, 'candidate key'),
      chosen: c.chosen === true,
      provenance: string(c.provenance || '', 1000, 'Candidate provenance'),
      verified: false };
  }
  function bundle(d, state = {}) {
    d = validate(d);
    const s = state && typeof state === 'object' ? state : {};
    const value = {
      version: BUNDLE_VERSION, kind: BUNDLE_KIND,
      title: string(s.title || '', 200, 'Investigation title'),
      created: string(s.created || '', 40, 'Bundle timestamp'),
      tool: { modelBuild: MODEL_BUILD, evidenceVersion: d.version,
        scoringModel: string(s.scoringModel || '', 200, 'Scoring-model identity'),
        solver: string(s.solver || '', 200, 'Solver identity') },
      evidence: d,
      selectedLayer: string(s.selectedLayer || '', 100, 'Selected derived layer'),
      keyRevisions: list(s.keyRevisions || [], 50, 'key revisions').map(k => ({
        at: string(k.at || '', 40, 'Key revision time'),
        reason: string(k.reason || '', 1000, 'Key revision reason'),
        locks: lockMap(k.locks || {}, 'locked key') })),
      search: s.search ? searchState(s.search) : null,
      segmentation: s.segmentation ? segmentationState(s.segmentation) : null,
      candidates: list(s.candidates || [], 20, 'retained candidates').map(candidateRecord),
      images: d.images.map(i => ({ id: i.id, name: i.name, sha256: i.sha256, width: i.width, height: i.height,
        rotation: i.rotation, crop: i.crop.slice() })),
      imageBytes: 'Image bytes are deliberately not included. Reopen each file locally; the recorded hash tells you whether the bytes match.',
      sourceFingerprint: fingerprint(d.raw),
      limits: 'Replay needs the same solver and scoring-model build, not only the same seed. A recorded filename or hash identifies bytes; it does not establish that an image is the archival object it claims to be.'
    };
    return openBundle(copy(value));
  }
  function openBundle(value) {
    check(value && typeof value === 'object' && !Array.isArray(value), 'This file is not an investigation bundle.');
    check(value.kind === BUNDLE_KIND, 'This file is not a Cipher Museum investigation bundle.');
    check(value.version === BUNDLE_VERSION,
      'Unsupported investigation-bundle version ' + value.version + '; this workbench reads version ' + BUNDLE_VERSION + '.');
    check(JSON.stringify(value).length <= 1500000, 'Investigation bundle exceeds 1,500,000 characters.');
    const b = copy(value);
    b.title = string(b.title || '', 200, 'Investigation title');
    b.created = string(b.created || '', 40, 'Bundle timestamp');
    check(b.tool && typeof b.tool === 'object', 'A bundle must record the tools that produced it.');
    b.tool.modelBuild = string(b.tool.modelBuild || '', 100, 'Model build');
    b.tool.scoringModel = string(b.tool.scoringModel || '', 200, 'Scoring-model identity');
    b.tool.solver = string(b.tool.solver || '', 200, 'Solver identity');
    b.evidence = validate(b.evidence);
    b.selectedLayer = string(b.selectedLayer || '', 100, 'Selected derived layer');
    check(!b.selectedLayer || b.selectedLayer.indexOf('revision-') === 0 || b.evidence.layers.some(l => l.id === b.selectedLayer),
      'The bundle names a derived layer that its evidence record does not contain.');
    b.keyRevisions = list(b.keyRevisions || [], 50, 'key revisions').map(k => ({
      at: string(k.at || '', 40, 'Key revision time'), reason: string(k.reason || '', 1000, 'Key revision reason'),
      locks: lockMap(k.locks || {}, 'locked key') }));
    b.search = b.search ? searchState(b.search) : null;
    b.segmentation = b.segmentation ? segmentationState(b.segmentation) : null;
    b.candidates = list(b.candidates || [], 20, 'retained candidates').map(candidateRecord);
    b.images = list(b.images || [], 50, 'image manifest').map(i => ({
      id: string(i.id, 100, 'Image ID'), name: string(i.name, 500, 'Image filename'),
      sha256: string(i.sha256 || '', 64, 'Image hash'),
      width: integer(i.width, 1, 100000, 'image width'), height: integer(i.height, 1, 100000, 'image height'),
      rotation: integer(i.rotation, 0, 270, 'image rotation'), crop: i.crop }));
    b.sourceFingerprint = string(b.sourceFingerprint || '', 32, 'Source fingerprint');
    // Stale results are reported, never silently reused.
    const sourceMoved = b.sourceFingerprint !== fingerprint(b.evidence.raw);
    const searchMoved = !!(b.search && b.search.inputFingerprint !== fingerprint(b.search.raw));
    const segmentationMoved = !!(b.segmentation &&
      b.segmentation.inputFingerprint !== fingerprint(b.segmentation.digits + '|' + JSON.stringify(b.segmentation.key)));
    b.stale = { source: sourceMoved, search: searchMoved, segmentation: segmentationMoved,
      modelBuild: b.tool.modelBuild !== MODEL_BUILD,
      candidates: b.candidates.length > 0 && (sourceMoved || searchMoved) };
    return b;
  }
  // ── Beam-search solver baseline ───────────────────────────────────────────
  // A second, bounded homophonic baseline alongside the annealing search.
  // Extension order is DISCLOSED: symbols are fixed in order of first appearance,
  // so every extension lengthens the decoded prefix. Partial hypotheses are scored
  // on that decoded prefix. The heuristic is informative but NOT admissible:
  // beam pruning can discard the branch that contains the correct key.
  function beamSearch(tokens, options, score, progress = () => {}) {
    parseSymbols(tokens.join(' '));
    const opts = options && typeof options === 'object' ? options : {};
    const symbols = Array.from(new Set(tokens));
    const beam = integer(opts.beam === undefined ? 50 : opts.beam, 1, 2000, 'beam width');
    const branch = integer(opts.branch === undefined ? 26 : opts.branch, 1, 26, 'extensions per hypothesis');
    const seed = integer(opts.seed === undefined ? 0 : opts.seed, 0, 4294967295, 'seed');
    const locks = opts.locks || {};
    check(locks && typeof locks === 'object' && !Array.isArray(locks), 'Invalid locked key.');
    Object.entries(locks).forEach(([s, v]) => check(symbols.indexOf(s) >= 0 && /^[A-Z]$/.test(v),
      'A lock must name a present symbol and one A–Z letter.'));
    const alphabet = 'ETAOINSHRDLCUMWFGYPBVKJXQZ'.slice(0, branch);
    const order = symbols.filter(s => !own(locks, s));
    // Longest token prefix decodable once the first k free symbols are assigned.
    const known = new Set(Object.keys(locks));
    const coverage = [];
    for (let k = 0; k <= order.length; k++) {
      if (k > 0) known.add(order[k - 1]);
      let len = 0; while (len < tokens.length && known.has(tokens[len])) len++;
      coverage.push(len);
    }
    check(beam * branch * tokens.length * Math.max(1, order.length) <= 400000000,
      'Reduce the beam width, branching factor or input length: the comparison budget is 400 million symbol evaluations.');
    const decodeWith = (assign, len) => { let t = ''; for (let i = 0; i < len; i++) t += assign[tokens[i]]; return t; };
    const base = Object.assign(Object.create(null), locks);
    let frontier = [{ assign: base, score: 0, covered: coverage[0] }];
    if (coverage[0] > 0) {
      const v = score(decodeWith(base, coverage[0]));
      check(Number.isFinite(v), 'Scoring model returned an invalid value.');
      frontier[0].score = v;
    }
    const trace = []; let evaluations = 0;
    const rank = (a, b) => b.score - a.score || keyString(a.assign).localeCompare(keyString(b.assign));
    function keyString(assign) { return symbols.map(s => assign[s] || '.').join(''); }
    for (let k = 0; k < order.length; k++) {
      const symbol = order[k], len = coverage[k + 1], next = [];
      for (const hyp of frontier) for (const letter of alphabet) {
        const assign = Object.assign(Object.create(null), hyp.assign); assign[symbol] = letter;
        let value = hyp.score;
        if (len > hyp.covered) {
          value = score(decodeWith(assign, len)); evaluations++;
          check(Number.isFinite(value), 'Scoring model returned an invalid value.');
        }
        next.push({ assign, score: value, covered: len });
      }
      next.sort(rank);
      frontier = next.slice(0, beam);
      trace.push({ step: k + 1, score: frontier[0].score, hypotheses: next.length, retained: frontier.length });
      progress({ step: k + 1, steps: order.length, score: frontier[0].score });
    }
    const candidates = [];
    const seen = new Set();
    for (const hyp of frontier) {
      const plaintext = tokens.map(t => hyp.assign[t]).join('');
      if (seen.has(plaintext)) continue; seen.add(plaintext);
      const value = score(plaintext); evaluations++;
      check(Number.isFinite(value), 'Scoring model returned an invalid value.');
      const key = {}; symbols.forEach(s => { key[s] = hyp.assign[s]; });
      candidates.push({ plaintext, score: value, step: order.length, key });
    }
    candidates.sort((a, b) => b.score - a.score || a.plaintext.localeCompare(b.plaintext));
    candidates.length = Math.min(candidates.length, 5);
    if (!candidates.length) {
      const key = {}; symbols.forEach(s => { key[s] = locks[s]; });
      const plaintext = tokens.map(t => locks[t]).join('');
      candidates.push({ plaintext, score: score(plaintext), step: 0, key });
    }
    return { candidates, trace, seed, requestedSteps: order.length, completedSteps: order.length,
      task: order.length ? 'key-recovery-candidates' : 'known-key-application',
      locks: copy(locks), model: score.modelId || 'custom-scoring-function', verified: false,
      algorithm: 'beam-search', beam, branch, evaluations, admissible: false,
      extensionOrder: order.slice(),
      extensionOrderNote: 'Free symbols are fixed in order of first appearance, so every extension lengthens the decoded prefix that is scored.',
      scope: 'Letter homophones only; no word codes, nulls, control signs or historical-language model. ' +
        'Partial scores are non-admissible: beam pruning can discard the branch holding the correct key.' };
  }
  function metrics(expected, actual, expectedKey, actualKey) {
    // Levenshtein distance keeps insertions/deletions distinct from key errors.
    const a = Array.from(expected), b = Array.from(actual); let row = b.map((_,i) => i + 1); row.unshift(0);
    for (let i=1;i<=a.length;i++) { const next=[i]; for (let j=1;j<=b.length;j++) next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1)); row=next; }
    const keys = Object.keys(expectedKey || {});
    return { exact: expected === actual, editDistance: row[b.length], plaintextError: row[b.length] / Math.max(1,a.length),
      keyError: keys.length ? keys.filter(k => !actualKey || actualKey[k] !== expectedKey[k]).length / keys.length : null };
  }
  function z340Route(kind = 'diagonal') {
    check(['diagonal', 'row-major'].includes(kind), 'Unknown route.');
    return Array.from({length:153}, (_, i) => kind === 'diagonal' ? (i % 9) * 17 + (2 * i % 17) : i);
  }
  const api = { TYPES, KEY_TYPES, SEG_TYPES, CONFIDENCE, ROTATIONS, MODEL_BUILD, BUNDLE_VERSION, BUNDLE_KIND,
    create, migrate, validate, revise, annotate, addLayer, validateKey, applyKey,
    segment, segmentMetrics, normalizeCodes, rng, parseSymbols, search, beamSearch, metrics, url, z340Route,
    imageRecord, addImage, regionToDisplay, displayToRegion, displayAspect,
    inventoryTokens, buildInventory, splitClass, mergeClasses, relabelClass, classOccurrences, regionOccurrences,
    addHypothesis, bundle, openBundle, fingerprint };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.MuseumResearch = api;
})(typeof window !== 'undefined' ? window : globalThis);
```
