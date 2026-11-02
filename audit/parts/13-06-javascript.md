# javascript appendix 6

Snapshot: `f5a994abd27f5d28531efa53a23d5b8661e41b61`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

## JavaScript — js/historical-ciphers.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/historical-ciphers.js`
- Served SHA-256: `0df911fca104641b48a6ef6dbde4ec141c8bcc526ffac157497dbb085510af6b`
- Readable-source SHA-256: `0df911fca104641b48a6ef6dbde4ec141c8bcc526ffac157497dbb085510af6b`


```javascript
/* Historical exhibit algorithms. Each call starts from the supplied key.
 * NEMA wiring/notch measurements: https://www.cryptomuseum.com/crypto/nema/
 * Military stepping and window convention checked against Martin Grap's rmsk2:
 * https://github.com/rmsk2/rmsk2/blob/master/nema_test.cpp
 * This is an independent implementation of the published machine specification.
 */
(function (root) {
  'use strict';
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const clean = text => String(text).normalize('NFD').replace(/\p{M}/gu, '')
    .toUpperCase().replace(/[^A-Z]/g, '');
  const mod = n => (n % 26 + 26) % 26;

  // Electrical contact zero is I. Positions are the lower window row, not
  // the top of the wheels. A two-contact offset connects those conventions.
  const CONTACTS = 'IJKLMNOPQRSTUVWXYZABCDEFGH';
  const physicalWiring = {
    A: 'NSKITCOYMVWAUJDRLZXHFQEGPB', B: 'KJYNTMEHLOZQBWPSXIRFAGUDVC',
    C: 'PNFUTEDIZYAHVRWOJSGBQMKCXL', D: 'WJBEYFUCMDTAZKXPIQHSVLGONR',
    U: 'KWPNGHEFVTAZUDYCXSRJMIBQOL'
  };
  const wiring = Object.fromEntries(Object.entries(physicalWiring).map(([name, w]) =>
    [name, [...CONTACTS].map(c => CONTACTS.indexOf(w[ABC.indexOf(c)]))]));
  const entry = [...'QMNBVCXYLKJHGFDSAPOIUZTREW'].map(c => CONTACTS.indexOf(c));
  const notches = {
    1: 'BJSYZ', 12: 'BCDEFGHIJKLPQRSUVWXYZ', 13: 'ABDEFGJKMNPQRTUVWXY',
    14: 'CEFGHJKLMNOPQSVXZ', 15: 'ADEGMOPQRSTVXYZ', 22: 'ABEGHKMNPQRSVWX'
  };

  function nema(text, windows = 'MQQPZQSOEV') {
    const key = String(windows).trim().toUpperCase();
    if (!/^[A-Z]{10}$/.test(key)) throw new Error('Enter exactly ten A–Z window letters.');
    // Index from the right: red drive, D, drive 15, C, drive 14, B,
    // drive 13, A, drive 12, reflector. The electrical entry is static.
    const position = [0, ...[...key].reverse().map(c => CONTACTS.indexOf(c))];
    const wheels = { 0: entry, 2: wiring.D, 4: wiring.C, 6: wiring.B, 8: wiring.A, 10: wiring.U };
    const notch = (slot, wheel, offset) =>
      notches[wheel].includes(CONTACTS[mod(position[slot] + offset)]);
    const pass = (x, slot, inverse = false) => {
      const displacement = slot === 0 ? 0 : mod(position[slot] - 2);
      const contact = mod(x + displacement);
      return mod((inverse ? wheels[slot].indexOf(contact) : wheels[slot][contact]) - displacement);
    };
    const trace = [];
    let output = '';
    for (const letter of clean(text)) {
      // Sense all notches in the old state, then step backwards before
      // passing current. The two red-wheel tracks drive separate linkages.
      const slow = notch(1, 1, 17);
      const moving = [1, 5, 9];
      if (notch(1, 22, 16)) moving.push(2);
      if (slow) moving.push(3, 7);
      if (slow && notch(3, 15, 16)) moving.push(4);
      if (notch(5, 14, 16)) moving.push(6);
      if (slow && notch(7, 13, 16)) moving.push(8);
      if (notch(9, 12, 16)) moving.push(10);
      moving.forEach(slot => { position[slot] = mod(position[slot] - 1); });
      let x = pass(CONTACTS.indexOf(letter), 0, true);
      [2, 4, 6, 8, 10].forEach(slot => { x = pass(x, slot); });
      [8, 6, 4, 2].forEach(slot => { x = pass(x, slot, true); });
      const result = CONTACTS[pass(x, 0)];
      output += result;
      if (trace.length < 12) trace.push({ input: letter, output: result,
        windows: position.slice(1).reverse().map(p => CONTACTS[p]).join('') });
    }
    return { output, trace, windows: position.slice(1).reverse().map(p => CONTACTS[p]).join('') };
  }

  function rotate(index, size) {
    const row = Math.floor(index / size), col = index % size;
    return col * size + size - 1 - row;
  }

  function grilleOrder(size, holes) {
    if (![4, 6, 8].includes(size)) throw new Error('Choose a 4×4, 6×6, or 8×8 grille.');
    if (!Array.isArray(holes) || holes.length !== size * size / 4 ||
      holes.some(h => !Number.isInteger(h) || h < 0 || h >= size * size)) {
      throw new Error('Select one hole from each rotation orbit.');
    }
    const orientations = [];
    let current = [...holes];
    for (let turn = 0; turn < 4; turn++) {
      orientations.push([...current].sort((a, b) => a - b));
      current = current.map(h => rotate(h, size));
    }
    const order = orientations.flat();
    if (new Set(order).size !== size * size) throw new Error('Rotated holes overlap; every cell must be visited once.');
    return { order, orientations };
  }

  function turningGrille(text, size, holes, decrypt = false) {
    const { order, orientations } = grilleOrder(size, holes);
    const capacity = size * size;
    let input = clean(text);
    const padding = decrypt ? 0 : (capacity - input.length % capacity) % capacity;
    if (decrypt && input.length % capacity) throw new Error(`Ciphertext must contain complete ${capacity}-letter blocks.`);
    input += 'X'.repeat(padding);
    const blocks = [];
    let output = '';
    for (let start = 0; start < input.length; start += capacity) {
      const chunk = input.slice(start, start + capacity);
      const grid = decrypt ? [...chunk] : Array(capacity);
      if (decrypt) output += order.map(i => grid[i]).join('');
      else { order.forEach((cell, i) => { grid[cell] = chunk[i]; }); output += grid.join(''); }
      blocks.push(grid);
    }
    return { output, blocks, padding, orientations };
  }

  function myszkowski(text, keyword, decrypt = false) {
    const key = clean(keyword);
    if (key.length < 2 || key.length > 24) throw new Error('Use a keyword of 2–24 letters.');
    const input = clean(text), width = key.length;
    const groups = [...new Set(key)].sort();
    const ranks = [...key].map(c => groups.indexOf(c) + 1);
    const order = [];
    for (const letter of groups) {
      const cols = [...key].flatMap((c, i) => c === letter ? [i] : []);
      // One column: downwards. Tied columns: across each row before the
      // next row. Missing cells in the last row are skipped, never padded.
      for (let row = 0; row * width < input.length; row++) {
        for (const col of cols) if (row * width + col < input.length) order.push(row * width + col);
      }
    }
    const cells = decrypt ? Array(input.length) : [...input];
    if (decrypt) order.forEach((cell, i) => { cells[cell] = input[i]; });
    const output = decrypt ? cells.join('') : order.map(cell => input[cell]).join('');
    return { output, cells, key, ranks, order };
  }

  const api = { clean, nema, rotate, grilleOrder, turningGrille, myszkowski };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HistoricalCiphers = api;
})(typeof window === 'undefined' ? globalThis : window);
```


## JavaScript — js/historical-demos.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/historical-demos.js`
- Served SHA-256: `39f299e5c2497d83acdea66530dc0a0cf132d98570e614020201b4a2834e7a1a`
- Readable-source SHA-256: `39f299e5c2497d83acdea66530dc0a0cf132d98570e614020201b4a2834e7a1a`


```javascript
(function () {
  'use strict';
  const demo = document.querySelector('[data-historical-demo]');
  if (!demo) return;
  const cipher = demo.dataset.historicalDemo, api = window.HistoricalCiphers;
  const $ = id => document.getElementById(id);
  let mode = 'encrypt', turn = 0, holes = [], last = null;
  const size = () => Number($('grille-size').value);

  function resetHoles() {
    const n = size(), seen = new Set();
    holes = [];
    for (let cell = 0; cell < n * n; cell++) {
      if (seen.has(cell)) continue;
      holes.push(cell);
      let next = cell;
      for (let t = 0; t < 4; t++) { seen.add(next); next = api.rotate(next, n); }
    }
    turn = 0;
  }

  function drawGrille() {
    const n = size(), grid = $('grille-grid');
    grid.replaceChildren();
    grid.style.gridTemplateColumns = `repeat(${n}, minmax(2.75rem, 1fr))`;
    const order = api.grilleOrder(n, holes);
    const visible = new Set(order.orientations[turn]);
    for (let cell = 0; cell < n * n; cell++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'historical-cell' + (visible.has(cell) ? ' is-hole' : '');
      button.textContent = last?.blocks[0]?.[cell] || '·';
      button.setAttribute('aria-pressed', String(visible.has(cell)));
      button.setAttribute('aria-label', `Row ${Math.floor(cell / n) + 1}, column ${cell % n + 1}: ${visible.has(cell) ? 'hole' : 'covered'}, ${button.textContent}`);
      // Select a new representative in the current orientation, then undo
      // the viewing rotation to store it in the original key orientation.
      button.addEventListener('click', () => {
        let base = cell;
        for (let t = turn; t < 4 && turn !== 0; t++) base = api.rotate(base, n);
        const orbit = [base];
        for (let t = 1; t < 4; t++) orbit.push(api.rotate(orbit[t - 1], n));
        holes = holes.filter(h => !orbit.includes(h));
        holes.push(base);
        run();
        grid.children[cell]?.focus();
      });
      grid.appendChild(button);
    }
    $('grille-angle').textContent = `Orientation ${turn * 90}° clockwise. Highlighted cells are the holes; each rotation covers one quarter of the grid.`;
    $('grille-key').textContent = [...holes].sort((a, b) => a - b).join(', ');
    $('grille-reading').textContent = last?.blocks[0]
      ? `Read through these holes: ${order.orientations[turn].map(c => last.blocks[0][c]).join('')}`
      : 'Enter a message to fill the grid.';
  }

  function drawMyszkowski(result) {
    const grid = $('myszkowski-grid');
    grid.replaceChildren();
    grid.style.gridTemplateColumns = `repeat(${result.key.length}, minmax(2.75rem, 1fr))`;
    [...result.key].forEach((letter, i) => {
      const cell = document.createElement('span');
      cell.className = 'historical-cell historical-key-heading';
      cell.textContent = `${letter} ${result.ranks[i]}`;
      grid.appendChild(cell);
    });
    // Keep large messages usable; the full transformation is still output.
    result.cells.slice(0, result.key.length * 12).forEach(letter => {
      const cell = document.createElement('span');
      cell.className = 'historical-cell'; cell.textContent = letter; grid.appendChild(cell);
    });
    $('myszkowski-ranks').textContent = `Ranks: ${result.ranks.join(' ')}. Equal ranks are read across rows together. Grid shows at most twelve message rows.`;
  }

  function run() {
    try {
      const text = $('historical-message').value;
      if (cipher === 'nema') {
        last = api.nema(text, $('nema-windows').value);
        $('nema-trace').replaceChildren();
        last.trace.forEach((step, i) => {
          const row = document.createElement('tr');
          [i + 1, step.input, step.output, step.windows].forEach(value => {
            const cell = document.createElement('td'); cell.textContent = value; row.appendChild(cell);
          });
          $('nema-trace').appendChild(row);
        });
        $('historical-status').textContent = `${mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} ${last.output.length} letters. Each run resets to the supplied windows. Final windows: ${last.windows}.`;
      } else if (cipher === 'turning-grille') {
        last = api.turningGrille(text, size(), holes, mode === 'decrypt');
        drawGrille();
        $('historical-status').textContent = `${last.blocks.length} block(s). ${mode === 'encrypt' ? `${last.padding} X padding letter(s) added.` : 'Padding is retained: remove it only if you know the original length.'} Grid shows the first block.`;
      } else {
        last = api.myszkowski(text, $('myszkowski-key').value, mode === 'decrypt');
        drawMyszkowski(last);
        $('historical-status').textContent = `${mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} ${last.output.length} letters; no padding added.`;
      }
      $('historical-output').textContent = last.output || 'Enter a message to begin.';
    } catch (error) {
      last = null;
      $('historical-output').textContent = '';
      $('historical-status').textContent = error.message;
      if (cipher === 'turning-grille') drawGrille();
      if (cipher === 'nema') $('nema-trace').replaceChildren();
      if (cipher === 'myszkowski') {
        $('myszkowski-grid').replaceChildren();
        $('myszkowski-grid').style.gridTemplateColumns = '';
        $('myszkowski-ranks').textContent = '';
      }
    }
  }

  demo.querySelectorAll('[data-mode]').forEach(button => {
    button.addEventListener('click', () => {
      mode = button.dataset.mode;
      demo.querySelectorAll('[data-mode]').forEach(b => {
        b.classList.toggle('active', b === button);
        b.setAttribute('aria-pressed', String(b === button));
      });
      run();
    });
  });
  $('historical-run').addEventListener('click', run);
  $('historical-use-output').addEventListener('click', () => {
    if (!last?.output) return;
    $('historical-message').value = last.output;
    demo.querySelector(`[data-mode="${mode === 'encrypt' ? 'decrypt' : 'encrypt'}"]`).click();
  });
  $('historical-message').addEventListener('input', run);
  if (cipher === 'nema') $('nema-windows').addEventListener('input', run);
  if (cipher === 'myszkowski') $('myszkowski-key').addEventListener('input', run);
  if (cipher === 'turning-grille') {
    resetHoles();
    $('grille-size').addEventListener('change', () => { resetHoles(); run(); });
    $('grille-rotate').addEventListener('click', () => { turn = (turn + 1) % 4; drawGrille(); });
    $('grille-reset').addEventListener('click', () => { resetHoles(); run(); });
  }
  run();
})();
```


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


## JavaScript — js/reader-companion.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/reader-companion.js`
- Served SHA-256: `513832d95df62ee7511404605d301a00ba0a7767f74a6a1f3bd6345458facc69`
- Readable-source SHA-256: `513832d95df62ee7511404605d301a00ba0a7767f74a6a1f3bd6345458facc69`


```javascript
/* Original fictional reader case. Gates guide the activity; they are not access control. */
'use strict';
(function () {
  const $ = id => document.getElementById(id);
  if (!$('unlock-form')) return;
  const normalize = text => text.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const instruction = 'COMPARE THE COPIES BEFORE YOU TRUST THEM';
  const state = { started: false, decoded: false, compared: false, source: false, complete: false, entry: '', help: new Set() };
  const stages = ['recover the destination', 'compare the copies', 'request another source', 'make a finding'];
  const codebook = Object.fromEntries([...document.querySelectorAll('#dispatch-key [data-code]')].map(el => [el.dataset.code, el.textContent.trim()]));
  const groups = $('dispatch-cipher').textContent.match(/\d{2}/g) || [];
  const reading = groups.map(group => codebook[group]);
  const room = reading[reading.indexOf('ROOM') + 1];
  const validDispatch = groups.length > 0 && reading.every(Boolean) && normalize(reading.join(' ')) === normalize($('retained-message').textContent);
  function progress(step) {
    document.querySelectorAll('.case-progress [data-step]').forEach(el => {
      const number = Number(el.dataset.step);
      el.classList.toggle('is-complete', state.complete || number < step);
      if (number === step && !state.complete) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    });
    $('case-progress-text').textContent = state.complete ? 'Investigation complete. Your finding is below.' : `Step ${step} of 4: ${stages[step - 1]}.`;
  }
  function openCase(entry) {
    if (!validDispatch) {
      $('unlock-feedback').textContent = 'This case file has an inconsistent dispatch. Please reload the page before continuing.';
      return;
    }
    if (!state.started) state.entry = entry;
    state.started = true;
    $('investigation').hidden = false;
    $('case-title').focus();
  }
  function finishDecode(revealed) {
    if (!state.started) return;
    state.decoded = true;
    if (revealed) state.help.add('dispatch-answer');
    $('decode-feedback').textContent = `The dispatch names ROOM ${room}. The complete reading is beside the delivered copy below.`;
    $('copies-panel').hidden = false;
    progress(2);
    $('copies-title').focus();
  }
  async function copyText(text, feedbackId, copyId, labelId, success) {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      $(copyId).hidden = true;
      $(labelId).hidden = true;
      $(feedbackId).textContent = success;
    } catch (_) {
      $(labelId).hidden = false;
      $(copyId).hidden = false;
      $(copyId).value = text;
      $(copyId).focus();
      $(copyId).select();
      $(feedbackId).textContent = 'Select and copy the text below. Nothing has been sent.';
    }
  }
  $('start-case').addEventListener('click', () => openCase('Direct start'));
  $('unlock-form').addEventListener('submit', event => {
    event.preventDefault();
    if (normalize($('instruction').value) !== normalize(instruction)) {
      $('unlock-feedback').textContent = 'That does not quite fit. Join all four answers in slip order. The hints above are there whenever you want them.';
      return;
    }
    $('unlock-feedback').textContent = 'The instruction fits. The envelope is open below.';
    openCase('Four book slips');
  });
  $('decode-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!state.started) return;
    const answer = normalize($('dispatch-room').value).replace(/^ROOM/, '');
    if (![normalize(room), '4'].includes(answer)) {
      $('decode-feedback').textContent = 'Follow the code group immediately after ROOM. Enter its word or room number; the codebook and hints are available above.';
      return;
    }
    finishDecode(false);
  });
  $('reveal-dispatch').addEventListener('click', () => {
    $('dispatch-room').value = room;
    finishDecode(true);
  });
  $('compare-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!state.decoded) return;
    const choice = document.querySelector('input[name="difference"]:checked');
    if (!choice) return;
    if (choice.value !== 'room') {
      $('compare-feedback').textContent = 'Compare the message wording again. Both copies say AT NINE and name ELLIS. The document timestamps are separate from the instruction.';
      return;
    }
    state.compared = true;
    document.querySelectorAll('[data-difference]').forEach(mark => mark.classList.add('revealed'));
    $('compare-feedback').textContent = 'Yes: A names FOUR and B names FIVE. The difference is established; its cause is not.';
    $('source-panel').hidden = false;
    progress(3);
    $('source-title').focus();
  });
  $('source-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!state.compared) return;
    const choice = document.querySelector('input[name="source"]:checked');
    if (!choice) return;
    if (choice.value !== 'register') {
      $('source-feedback').textContent = choice.value === 'keys'
        ? 'The checkout log could clarify access to the contents. It would not establish which destination the curator authorised.'
        : 'The arrival log could clarify delivery timing. It would not establish the authorised wording. Look for a record linked to reference CM-17.';
      return;
    }
    state.source = true;
    $('register-record').hidden = false;
    $('source-feedback').textContent = 'The register is below. It supports a destination, with limits of its own. Read it before making your finding.';
    $('verdict-form').hidden = false;
    progress(4);
    $('register-record').setAttribute('tabindex', '-1');
    $('register-record').focus();
  });
  $('verdict-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!state.source) return;
    const choice = document.querySelector('input[name="verdict"]:checked');
    if (!choice) return;
    const responses = {
      theft: 'Ellis holds the case keys, but none of these records identifies who altered the delivered copy. Custody is not evidence of authorship; check authorisation without turning that gap into an accusation.',
      clerk: 'A later delivery time is not evidence of an authorised revision. Which record says the curator changed the destination?',
      nothing: 'D explicitly says the contents were not checked. An apparently intact seal cannot settle whether they remain intact.'
    };
    if (choice.value !== 'evidence') {
      state.complete = false;
      $('finding').hidden = true;
      progress(4);
      $('verdict-feedback').textContent = responses[choice.value] || 'Choose the conclusion supported by these documents.';
      return;
    }
    state.complete = true;
    $('verdict-feedback').textContent = 'Your finding separates the supported destination from an unsupported accusation.';
    $('finding').hidden = false;
    progress(4);
    $('finding-title').focus();
  });
  document.querySelectorAll('details.hint').forEach((el, index) => {
    el.addEventListener('toggle', () => { if (el.open) state.help.add(`hint-${index}`); });
  });
  $('share-finding').addEventListener('click', () => {
    if (!state.complete) return;
    const text = 'I completed The Curator’s Sealed Letter, a free codebreaking and evidence investigation at Cipher Museum. Try the case: https://ciphermuseum.com/sealed-letter.html';
    copyText(text, 'share-feedback', 'share-copy', 'share-copy-label', 'Copied. Paste the invitation wherever you choose—no solution included.');
  });
  $('playtest-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!state.complete || !$('playtest-form').checkValidity()) return;
    const text = [
      'Cipher Museum playtest · The Curator’s Sealed Letter · Pilot 1',
      `Entry: ${state.entry}`,
      'Case completed: yes',
      `Help items opened: ${state.help.size}`,
      `Most needed help: ${$('playtest-hardest').value}`,
      `Would try another case: ${$('playtest-again').value}`,
      `Notes: ${$('playtest-note').value.trim() || '(none)'}`
    ].join('\n');
    copyText(text, 'playtest-feedback', 'playtest-copy', 'playtest-copy-label', 'Notes copied. Send them to the person who invited you when you are ready. Nothing was submitted here.');
  });
  $('restart-case').addEventListener('click', () => {
    Object.assign(state, { decoded: false, compared: false, source: false, complete: false });
    ['copies-panel', 'source-panel', 'register-record', 'verdict-form', 'finding', 'share-copy', 'share-copy-label', 'playtest-copy', 'playtest-copy-label'].forEach(id => { $(id).hidden = true; });
    ['decode-form', 'compare-form', 'source-form', 'verdict-form', 'playtest-form'].forEach(id => $(id).reset());
    ['decode-feedback', 'compare-feedback', 'source-feedback', 'verdict-feedback', 'share-feedback', 'playtest-feedback'].forEach(id => { $(id).textContent = ''; });
    document.querySelectorAll('[data-difference]').forEach(mark => mark.classList.remove('revealed'));
    progress(1);
    $('case-title').focus();
  });
})();
```


## JavaScript — js/reading-evidence.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/reading-evidence.js`
- Served SHA-256: `f57389c6a5775cc985d8f1e2882fcc0e51129471e43517a8bc72922b424e3293`
- Readable-source SHA-256: `f57389c6a5775cc985d8f1e2882fcc0e51129471e43517a8bc72922b424e3293`


```javascript
/* Original museum exercises; source papers are credited on the companion page. */
(function (root) {
  'use strict';
  const keyTokens = '1 2 2 3 / 4 3 / 5 4 3 2'.split(' ');
  const keys = {
    A: { 1: 'S', 2: 'O', 3: 'N', 4: 'I', 5: 'D' },
    B: { 1: 'M', 2: 'E', 3: 'T', 4: 'A' },
    C: { 1: 'M', 2: 'E', 3: 'T', 4: 'A', 5: 'G' }
  };
  function applyKey(id) {
    if (!Object.hasOwn(keys, id)) throw new Error('Choose key A, B or C.');
    const unresolved = keyTokens.filter(t => t !== '/' && !Object.hasOwn(keys[id], t)).length;
    return { text: keyTokens.map(t => t === '/' ? ' ' : keys[id][t] || '?').join(''), unresolved, total: 10 };
  }
  const spans = [
    { text: 'London, 14 May 1625:', kind: 'cleartext', why: 'The invented sender left this dateline unencrypted. Digits alone do not make a passage ciphertext.' },
    { text: '31 47 31', kind: 'ciphertext', why: 'The invented key records 31 → M and 47 → E: this encrypted passage reads MEM. Appearance alone was only a clue.' },
    { text: 'MON AMI', kind: 'cleartext', why: 'The sender left this French greeting unencrypted. A letter can switch languages; this greeting does not establish the language of every other passage.' },
    { text: '19 20', kind: 'uncertain', why: 'No matching key or contextual explanation survives in this case. These could be codes or ordinary numbers. Leave them unresolved.' },
    { text: 'SEND', kind: 'ciphertext', why: 'The supplied case key maps S → P, E → B, N → K, D → A, giving PBKA. A ciphertext can happen to spell a familiar word. Without the key, uncertainty was reasonable.' },
    { text: '[mark unreadable]', kind: 'uncertain', why: 'This is an editorial report of damage, not letters recovered from the source. Do not feed the bracketed words to a cipher solver.' }
  ];
  function checkSpans(answers) {
    if (!Array.isArray(answers) || answers.length !== spans.length || answers.some(a => !['cleartext', 'ciphertext', 'uncertain'].includes(a))) throw new Error('Mark every passage first.');
    return spans.map((s, i) => ({ ...s, agrees: answers[i] === s.kind, chosen: answers[i] }));
  }
  const phrases = { modern: 'SEND THE SHIP AT NOON', older: 'SENDE THE SHIPPE AT NOONE' };
  const vocabularies = { modern: ['SEND', 'THE', 'SHIP', 'AT', 'NOON'], older: ['SENDE', 'THE', 'SHIPPE', 'AT', 'NOONE'] };
  function shift(text, n) {
    return text.replace(/[A-Z]/g, c => String.fromCharCode(65 + ((c.charCodeAt(0) - 65 + n) % 26 + 26) % 26));
  }
  function distance(a, b) {
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const row = [i];
      for (let j = 1; j <= b.length; j++) row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + Number(a[i - 1] !== b[j - 1]));
      previous = row;
    }
    return previous[b.length];
  }
  // No answer key is passed to the search. Exhaust all 26 Caesar shifts and
  // score exact dictionary-word matches; ties are retained, never called solved.
  function rankCaesar(ciphertext, profile) {
    if (!Object.hasOwn(vocabularies, profile)) throw new Error('Unknown vocabulary.');
    return Array.from({ length: 26 }, (_, key) => {
      const text = shift(ciphertext, -key);
      const score = text.split(/\s+/).filter(w => vocabularies[profile].includes(w)).length;
      return { key, text, score };
    }).sort((a, b) => b.score - a.score || a.key - b.key);
  }
  function noiseExperiment(spelling, noise, profile) {
    if (!Object.hasOwn(phrases, spelling) || !['none', 'substitute', 'delete'].includes(noise)) throw new Error('Unknown experiment setting.');
    const original = phrases[spelling], clean = shift(original, 7);
    const at = original.indexOf('SHIP');
    let damaged = clean;
    if (noise === 'substitute') damaged = clean.slice(0, at) + shift(clean[at], 1) + clean.slice(at + 1);
    if (noise === 'delete') damaged = clean.slice(0, at) + clean.slice(at + 1);
    function run(input) {
      const ranked = rankCaesar(input, profile), best = ranked[0];
      const letters = original.replace(/ /g, '');
      return { ranked, ties: ranked.filter(r => r.score === best.score).length,
        edits: distance(letters, best.text.replace(/ /g, '')), length: letters.length };
    }
    return { original, clean, damaged, position: at + 1, baseline: run(clean), changed: run(damaged) };
  }
  function tokens(text) {
    const parts = text.trim().split(/\s+/).filter(Boolean);
    if (!parts.length || parts.length > 64 || parts.some(t => t.length > 16)) throw new Error('Use 1–64 space-separated symbols, each at most 16 characters.');
    return parts;
  }
  // Section 3.1 of Kambhatla et al.: assign each new symbol its order of first
  // occurrence, and reuse that integer at every later occurrence.
  function recurrence(sequence) {
    const seen = new Map();
    return sequence.map(s => { if (!seen.has(s)) seen.set(s, seen.size + 1); return seen.get(s); });
  }
  function rename(sequence) { return recurrence(sequence).map(n => 'g' + (101 - n)); }
  function alter(sequence) {
    const changed = sequence.slice();
    const firstRepeated = sequence.findIndex((s, i) => sequence.indexOf(s) < i);
    if (firstRepeated >= 0) {
      let fresh = 'NEW'; while (sequence.includes(fresh)) fresh += '_';
      changed[firstRepeated] = fresh;
    } else if (sequence.length > 1) changed[sequence.length - 1] = sequence[0];
    return changed;
  }
  function mount(doc) {
    const $ = id => doc.getElementById(id);
    if (!$('key-choice')) return;
    function el(tag, text, parent) { const node = doc.createElement(tag); node.textContent = text; if (parent) parent.append(node); return node; }
    function keyView() {
      const id = $('key-choice').value, result = applyKey(id);
      $('key-map').textContent = Object.entries(keys[id]).map(([s, p]) => s + ' → ' + p).join('; ');
      $('key-literal').textContent = result.text;
      $('key-coverage').textContent = (result.total - result.unresolved) + '/' + result.total + ' symbol occurrences mapped; ' + result.unresolved + ' unresolved. Coverage is not a probability of correctness.';
      $('key-copy').hidden = true;
      $('key-result').textContent = 'Inspect the reading, then compare the other keys or reveal the separate plaintext copy.';
    }
    $('key-choice').addEventListener('change', keyView);
    $('keys-compare').addEventListener('click', () => {
      const list = $('key-result'); list.replaceChildren();
      for (const id of Object.keys(keys)) { const r = applyKey(id); el('p', 'Key ' + id + ': ' + r.text + ' — ' + (10 - r.unresolved) + '/10 mapped.', list); }
      el('p', 'A and C both cover every symbol. B is incomplete. A readable result is a candidate to investigate; coverage alone cannot choose a key.', list);
    });
    $('key-reveal').addEventListener('click', () => {
      $('key-copy').hidden = false;
      $('key-result').textContent = 'Key C agrees with the separate copy. Key B agrees where it has entries, but leaves G unresolved. This supports C for this fragment; it does not establish authorship or prove that C works for every letter in the folder.';
    });
    $('key-reset').addEventListener('click', () => { $('key-choice').value = 'A'; keyView(); }); keyView();
    const spanList = $('span-list');
    spans.forEach((s, i) => {
      const box = el('div', '', spanList); box.className = 'research-card';
      el('p', 'Passage ' + (i + 1) + ': ' + s.text, box);
      const label = el('label', 'Your classification for passage ' + (i + 1), box); label.htmlFor = 'span-guess-' + i;
      const select = el('select', '', box); select.id = label.htmlFor;
      [['', 'Choose…'], ['cleartext', 'Cleartext — left unencrypted'], ['ciphertext', 'Ciphertext — encrypted'], ['uncertain', 'Uncertain / insufficient evidence']].forEach(([value, text]) => { const o = el('option', text, select); o.value = value; });
    });
    $('span-check').addEventListener('click', () => {
      const out = $('span-feedback'); out.replaceChildren();
      try {
        const rows = checkSpans(spans.map((_, i) => $('span-guess-' + i).value));
        el('p', rows.filter(r => r.agrees).length + '/6 classifications agree with the case notes. This is feedback on supplied chunks, not a boundary-detection or language-identification benchmark. An uncertain first answer can be sensible before seeing the key.', out);
        rows.forEach((r, i) => el('p', (i + 1) + '. ' + r.kind + ': ' + r.why, out));
      } catch (e) { out.textContent = e.message; }
    });
    spanList.addEventListener('change', () => { $('span-feedback').textContent = 'Your classifications changed. Compare again when ready.'; });
    $('span-reset').addEventListener('click', () => { spans.forEach((_, i) => { $('span-guess-' + i).value = ''; }); $('span-feedback').textContent = 'Classify the passages, then reveal the case notes.'; });
    function noiseView() {
      const r = noiseExperiment($('noise-spelling').value, $('noise-kind').value, $('noise-profile').value);
      $('noise-original').textContent = r.original; $('noise-clean').textContent = r.clean; $('noise-damaged').textContent = r.damaged;
      $('noise-words').textContent = vocabularies[$('noise-profile').value].join(', ');
      $('noise-change').textContent = $('noise-kind').value === 'none' ? 'No transcription change.' : 'Changed ciphertext position ' + r.position + ' (counting spaces): ' + ($('noise-kind').value === 'delete' ? 'deleted one letter.' : 'replaced one letter with the next alphabet letter.');
      const out = $('noise-results'); out.replaceChildren();
      for (const [title, data] of [['Clean transcription', r.baseline], ['Selected transcription', r.changed]]) {
        const card = el('div', '', out); card.className = 'research-card'; el('h3', title, card);
        el('p', 'Best displayed reading: ' + data.ranked[0].text, card);
        el('p', data.ties > 1 ? 'No unique winner: ' + data.ties + ' shifts tie at the top score. Display order uses ascending shift, not confidence.' : 'Unique top score in this 26-key search. Recovered shift: ' + data.ranked[0].key + '.', card);
        el('p', 'Letter edit distance from the supplied original: ' + data.edits + '/' + data.length + ' = ' + (100 * data.edits / data.length).toFixed(1) + '%. Spaces excluded; insertion, deletion and substitution each cost one. The original is used only for evaluation.', card);
        el('p', 'Top three candidates (word matches, not probabilities):', card);
        const list = el('ol', '', card);
        data.ranked.slice(0, 3).forEach(c => el('li', 'Shift ' + c.key + ': ' + c.text + ' — ' + c.score + '/5 words matched.', list));
      }
    }
    ['noise-spelling', 'noise-kind', 'noise-profile'].forEach(id => $(id).addEventListener('change', noiseView));
    $('noise-reset').addEventListener('click', () => { $('noise-spelling').value = 'modern'; $('noise-kind').value = 'none'; $('noise-profile').value = 'modern'; noiseView(); }); noiseView();
    let sequence = [];
    function patternView(mode) {
      try {
        sequence = tokens($('pattern-input').value);
        const other = mode === 'alter' ? alter(sequence) : rename(sequence);
        const a = recurrence(sequence), b = recurrence(other);
        $('pattern-original').textContent = sequence.join(' '); $('pattern-other').textContent = other.join(' ');
        $('pattern-a').textContent = a.join(' '); $('pattern-b').textContent = b.join(' ');
        $('pattern-result').textContent = JSON.stringify(a) === JSON.stringify(b)
          ? 'Same recurrence pattern. Renaming symbols bijectively preserves which positions match. It does not reveal the plaintext.'
          : 'The pattern changed. Changing one occurrence changed a relationship between positions; that is different from renaming every occurrence consistently.';
        if (mode === 'alter' && sequence.length === 1) $('pattern-result').textContent = 'One symbol always has pattern 1. Add at least two symbols to change an equality relationship.';
        const buttons = $('pattern-symbols'); buttons.replaceChildren();
        [...new Set(sequence)].forEach(s => {
          const btn = el('button', s, buttons); btn.type = 'button'; btn.setAttribute('aria-pressed', 'false');
          btn.addEventListener('click', () => {
            buttons.querySelectorAll('button').forEach(n => n.setAttribute('aria-pressed', String(n === btn)));
            $('pattern-positions').textContent = 'Symbol ' + s + ' occurs at positions ' + sequence.flatMap((t, i) => t === s ? [i + 1] : []).join(', ') + '.';
          });
        }); $('pattern-positions').textContent = 'Choose a source symbol to locate its occurrences.';
      } catch (e) {
        for (const id of ['pattern-original', 'pattern-other', 'pattern-a', 'pattern-b', 'pattern-positions']) $(id).textContent = '';
        $('pattern-symbols').replaceChildren(); $('pattern-result').textContent = e.message;
      }
    }
    $('pattern-rename').addEventListener('click', () => patternView('rename'));
    $('pattern-alter').addEventListener('click', () => patternView('alter'));
    $('pattern-input').addEventListener('input', () => { $('pattern-result').textContent = 'Input changed. Choose an action to recalculate the displayed sequences.'; });
    $('pattern-reset').addEventListener('click', () => { $('pattern-input').value = 'Q Z Z R Q Z S R'; patternView('rename'); }); patternView('rename');
  }
  const api = { applyKey, spans, checkSpans, shift, distance, rankCaesar, noiseExperiment, tokens, recurrence, rename, alter, mount };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', () => mount(root.document), { once: true });
    else mount(root.document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
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
