'use strict';
/**
 * THE CIPHER MUSEUM — Cryptographer's Path (Learning Mode)
 * Toggleable overlay that sequences users through halls with quizzes & badges.
 * Include on every page: <script src="js/learning-path.js" defer></script>
 */
(function(){
  var HALLS = [
    {id:'ancient',      label:'Hall I',   name:'Birth of Cryptography', href:'halls/ancient.html'},
    {id:'substitution', label:'Hall II',  name:'Classical Substitution', href:'halls/substitution.html'},
    {id:'polyalphabetic',label:'Hall III',name:'Polyalphabetic',         href:'halls/polyalphabetic.html'},
    {id:'transposition',label:'Hall IV',  name:'Transposition',          href:'halls/transposition.html'},
    {id:'military',     label:'Hall V',   name:'Military & Spy',         href:'halls/military.html'},
    {id:'civil-war',    label:'CW',       name:'Civil War Gallery',      href:'halls/civil-war.html'},
    {id:'machines',     label:'Hall VI',  name:'Mechanical Machines',     href:'halls/machines.html'},
    {id:'puzzle',       label:'Hall VII', name:'Puzzle Ciphers',          href:'halls/puzzle.html'},
    {id:'unbreakable',  label:'Final',    name:'Unbreakable Ciphers',    href:'halls/unbreakable.html'},
    {id:'codebreakers', label:'⚜',       name:'Hall of Codebreakers',   href:'halls/codebreakers.html'}
  ];

  var QUIZZES = {
    ancient:[
      {q:'What is the Scytale?',opts:['A substitution cipher','A transposition device using a rod','A Roman military code','A Greek frequency table'],a:1},
      {q:'How many possible keys does the Caesar cipher have?',opts:['26','25','52','10'],a:1},
      {q:'Who documented the first frequency analysis technique?',opts:['Julius Caesar','Al-Kindi','Leon Battista Alberti','Blaise de Vigenère'],a:1}
    ],
    substitution:[
      {q:'What makes frequency analysis effective against monoalphabetic ciphers?',opts:['Each letter always maps to the same cipher letter','The key is too short','The alphabet is preserved','It uses a known plaintext'],a:0},
      {q:'How many possible keys does a monoalphabetic cipher have?',opts:['26','26!','2²⁵⁶','52!'],a:1},
      {q:'What does a homophonic cipher do differently?',opts:['Uses polyalphabetic shifting','Assigns multiple symbols to common letters','Encrypts pairs of letters','Transposes text positions'],a:1}
    ],
    polyalphabetic:[
      {q:'The Vigenère cipher was called "le chiffre indéchiffrable" for how long?',opts:['50 years','100 years','About 300 years','1,000 years'],a:2},
      {q:'What technique did Kasiski use to break the Vigenère cipher?',opts:['Brute force','Finding repeated ciphertext sequences to determine key length','Known plaintext attack','Matrix inversion'],a:1},
      {q:'What makes the Alberti disk historically significant?',opts:['It was unbreakable','It was the first polyalphabetic device','It used a rotor mechanism','It was used in WWII'],a:1}
    ],
    transposition:[
      {q:'What does a transposition cipher preserve?',opts:['Letter positions','Letter frequencies','The key','The alphabet order'],a:1},
      {q:'Why is double transposition much stronger than single?',opts:['It uses a longer key','Two passes multiply the possible arrangements','It changes letter frequencies','It adds substitution'],a:1},
      {q:'How many rails typically make a Rail Fence cipher practical?',opts:['2-10','100+','Just 1','Unlimited'],a:0}
    ],
    military:[
      {q:'What was ADFGVX designed for?',opts:['Naval communication','WWI German field telegraph','Cold War espionage','WWII Pacific theater'],a:1},
      {q:'Why was the VIC cipher never broken by cryptanalysis?',opts:['It used a computer','It combined multiple techniques including checkerboard and double transposition','Its key was 256 bits','It was never intercepted'],a:1},
      {q:'What broke the Nihilist cipher?',opts:['Machine learning','Frequency analysis on digit sums with repeating key detection','Brute force','A defector revealed the key'],a:1}
    ],
    'civil-war':[
      {q:'Which side\'s cipher was never broken during the Civil War?',opts:['Confederate','Union','Both were broken','Neither used ciphers'],a:1},
      {q:'What type of cipher did the Stager system use?',opts:['Substitution','Route transposition plus code words','Enigma-style rotors','One-time pad'],a:1},
      {q:'What was the major weakness of Confederate ciphers?',opts:['Too complex to use','They relied on Vigenère with known weaknesses','They used physical machines','The keys were too long'],a:1}
    ],
    machines:[
      {q:'How many possible daily settings did the Enigma machine have?',opts:['About 1,000','About 10²³','About 26','About 256'],a:1},
      {q:'What was the historical significance of Colossus?',opts:['It was the first personal computer','It was the first programmable electronic computer','It broke the Caesar cipher','It invented public-key cryptography'],a:1},
      {q:'What Enigma property ensures a letter never encrypts to itself?',opts:['The plugboard','The reflector','The rotors','The ring settings'],a:1}
    ],
    puzzle:[
      {q:'What makes the Pigpen cipher easy to recognize?',opts:['Its numeric output','Its distinctive geometric symbols','Its use of colors','Its ASCII art'],a:1},
      {q:'The Zodiac Killer\'s Z340 cipher was solved after how many years?',opts:['5 years','20 years','Over 50 years','It remains unsolved'],a:2},
      {q:'Bacon\'s cipher is an early example of what?',opts:['Public-key cryptography','Steganography','Hash functions','Digital signatures'],a:1}
    ],
    unbreakable:[
      {q:'Who proved the One-Time Pad is perfectly secret?',opts:['Alan Turing','Claude Shannon','Blaise de Vigenère','Auguste Kerckhoffs'],a:1},
      {q:'What is the One-Time Pad\'s critical practical requirement?',opts:['A computer','A truly random key as long as the message, used only once','A 256-bit key','A public key exchange'],a:1},
      {q:'What caused the VENONA project to succeed against Soviet OTPs?',opts:['Better computers','Key pad reuse due to wartime supply pressure','A mathematical breakthrough','Social engineering'],a:1}
    ],
    codebreakers:[
      {q:'Who was the first person to describe frequency analysis?',opts:['Al-Kindi (9th century)','Alan Turing (20th century)','Charles Babbage (19th century)','Julius Caesar (1st century BC)'],a:0},
      {q:'What did Marian Rejewski use to initially break Enigma?',opts:['A captured machine','Mathematical group theory applied to rotor permutations','Brute force','A defector'],a:1},
      {q:'What principle states that a cipher\'s security must depend only on the key, not secrecy of the algorithm?',opts:['Shannon\'s theorem','Kerckhoffs\'s principle','Turing\'s law','Diffie-Hellman theorem'],a:1}
    ]
  };

  var LS_PREFIX = 'ciphermuseum.path.';
  var LS_ACTIVE = LS_PREFIX + 'active';

  function isActive(){ return localStorage.getItem(LS_ACTIVE) === '1'; }
  function getPassedHalls(){
    try{ return JSON.parse(localStorage.getItem(LS_PREFIX+'passed')) || []; }
    catch(e){ return []; }
  }
  function setPassedHalls(arr){ localStorage.setItem(LS_PREFIX+'passed', JSON.stringify(arr)); }
  function markPassed(hallId){
    var arr = getPassedHalls();
    if(arr.indexOf(hallId)===-1){ arr.push(hallId); setPassedHalls(arr); }
  }

  /* ── Determine current page context ─────────────────── */
  var path = location.pathname;
  var pageName = path.split('/').pop() || 'index.html';
  var parentDir = path.split('/').slice(-2,-1)[0] || '';
  var inSub = ['halls','ciphers','tours','lab','community'].indexOf(parentDir) !== -1;
  var pre = inSub ? '../' : '';

  function currentHallIndex(){
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
    overlay.appendChild(modal);
    overlay.addEventListener('click',function(e){ if(e.target===overlay) overlay.remove(); });
    document.addEventListener('keydown', function onEsc(e){ if(e.key==='Escape'){overlay.remove();document.removeEventListener('keydown',onEsc);} });

    var currentQ = 0;
    var score = 0;

    function renderQ(){
      var q = questions[currentQ];
      modal.innerHTML =
        '<div style="font-family:var(--fm);font-size:.6rem;letter-spacing:.15em;color:var(--tx3);margin-bottom:1rem">QUESTION ' + (currentQ+1) + ' OF ' + questions.length + '</div>' +
        '<p style="font-family:var(--fd);font-size:1.15rem;color:var(--tx);margin-bottom:1.5rem;line-height:1.5">' + escapeHTML(q.q) + '</p>' +
        '<div id="quizOpts" style="display:flex;flex-direction:column;gap:.6rem"></div>';
      var optsEl = document.getElementById('quizOpts');
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
      document.getElementById('quizClose').addEventListener('click', function(){
        overlay.remove();
        updateProgress();
        updateNextBar();
      });
    }

    renderQ();
    document.body.appendChild(overlay);
  }

  function escapeHTML(s){
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }

  /* ── Activate / Deactivate ─────────────────────────── */
  function activate(){
    localStorage.setItem(LS_ACTIVE, '1');
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
    localStorage.setItem(LS_ACTIVE, '0');
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
