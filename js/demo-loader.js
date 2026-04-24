/**
 * THE CIPHER MUSEUM — Demo Loader
 * Auto-generates interactive "Try It Yourself" demos for all cipher exhibit pages.
 * Place <div class="demo-section" data-cipher="cipherName"></div> in the HTML.
 */
'use strict';

(function () {
  const CONFIGS = {
    caesar: {
      label: 'Caesar Cipher', engine: 'caesar', defaultMsg: 'THE QUICK BROWN FOX',
      inputs: [{ type: 'range', id: 'shift', label: 'Shift', min: 1, max: 25, value: 3 }]
    },
    monoalphabetic: {
      label: 'Monoalphabetic Substitution', engine: 'monoalphabetic', defaultMsg: 'ATTACK AT DAWN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'ZEBRA', placeholder: 'Keyword…' }]
    },
    polybius: {
      label: 'Polybius Square', engine: 'polybius', defaultMsg: 'HELLO WORLD',
      inputs: []
    },
    homophonic: {
      label: 'Homophonic Substitution', engine: 'homophonic', defaultMsg: 'SECRET MESSAGE',
      inputs: [{ type: 'text', id: 'keyword', label: 'Seed Keyword', value: 'CIPHER', placeholder: 'Seed…' }]
    },
    playfair: {
      label: 'Playfair Cipher', engine: 'playfair', defaultMsg: 'HIDE THE GOLD',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'MONARCHY', placeholder: 'Keyword…' }]
    },
    hill: {
      label: 'Hill Cipher', engine: 'hill', defaultMsg: 'SHORT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Key Matrix (a,b,c,d)', value: '3,3,2,5', placeholder: '3,3,2,5' }]
    },
    vigenere: {
      label: 'Vigenère Cipher', engine: 'vigenere', defaultMsg: 'ATTACKATDAWN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'LEMON', placeholder: 'Keyword…' }]
    },
    beaufort: {
      label: 'Beaufort Cipher', engine: 'beaufort', defaultMsg: 'THE QUICK BROWN FOX',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'FORTIFICATION', placeholder: 'Keyword…' }]
    },
    gronsfeld: {
      label: 'Gronsfeld Cipher', engine: 'gronsfeld', defaultMsg: 'THE SECRET CODE',
      inputs: [{ type: 'text', id: 'keyword', label: 'Numeric Key', value: '31415', placeholder: 'Digits…' }]
    },
    porta: {
      label: 'Porta Cipher', engine: 'porta', defaultMsg: 'DEFEND THE EAST WALL',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'FORTIFY', placeholder: 'Keyword…' }]
    },
    runningKey: {
      label: 'Running Key Cipher', engine: 'runningKey', defaultMsg: 'FLEE AT ONCE',
      inputs: [{ type: 'textarea', id: 'keyword', label: 'Key Text', value: 'WE HOLD THESE TRUTHS TO BE SELF EVIDENT', placeholder: 'Long key text…' }]
    },
    railFence: {
      label: 'Rail Fence Cipher', engine: 'railFence', defaultMsg: 'WE ARE DISCOVERED FLEE AT ONCE',
      inputs: [{ type: 'range', id: 'shift', label: 'Rails', min: 2, max: 10, value: 3 }]
    },
    columnar: {
      label: 'Columnar Transposition', engine: 'columnar', defaultMsg: 'THE TOMATO IS A PLANT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'ZEBRA', placeholder: 'Keyword…' }]
    },
    doubleTransposition: {
      label: 'Double Transposition', engine: 'doubleTransposition', defaultMsg: 'ATTACK AT DAWN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keywords (key1,key2)', value: 'FIRST,SECOND', placeholder: 'KEY1,KEY2' }]
    },
    bacon: {
      label: "Bacon's Cipher", engine: 'bacon', defaultMsg: 'HELLO',
      inputs: []
    },
    tapCode: {
      label: 'Tap Code', engine: 'tapCode', defaultMsg: 'HELLO',
      inputs: []
    },
    pigpen: {
      label: 'Pigpen Cipher', engine: 'pigpen', defaultMsg: 'FREEMASON',
      inputs: []
    },
    bifid: {
      label: 'Bifid Cipher', engine: 'bifid', defaultMsg: 'FLEEATONCE',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'SECRET', placeholder: 'Keyword…' }]
    },
    trifid: {
      label: 'Trifid Cipher', engine: 'trifid', defaultMsg: 'DEFEND',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'FELIX', placeholder: 'Keyword…' }]
    },
    adfgx: {
      label: 'ADFGX Cipher', engine: 'adfgx', defaultMsg: 'ATTACK',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keys (polybius,columnar)', value: 'PRIVACY,GERMAN', placeholder: 'KEY1,KEY2' }]
    },
    adfgvx: {
      label: 'ADFGVX Cipher', engine: 'adfgvx', defaultMsg: 'ATTACK',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keys (polybius,columnar)', value: 'PRIVACY,GERMAN', placeholder: 'KEY1,KEY2' }]
    },
    nihilist: {
      label: 'Nihilist Cipher', engine: 'nihilist', defaultMsg: 'DYNAMITE WINTER PALACE',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keys (polybius,keyword)', value: 'RUSSIAN,KEY', placeholder: 'GRID,KEY' }]
    },
    otp: {
      label: 'One-Time Pad', engine: 'otp', defaultMsg: 'ATTACK',
      inputs: [{ type: 'text', id: 'keyword', label: 'Key (leave blank for random)', value: '', placeholder: 'Random key if empty' }]
    },
    fractionatedMorse: {
      label: 'Fractionated Morse', engine: 'fractionatedMorse', defaultMsg: 'HELLO WORLD',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'ROUNDTABLE', placeholder: 'Keyword…' }]
    },
    confederateVigenere: {
      label: 'Confederate Vigenère', engine: 'confederateVigenere', defaultMsg: 'SEND REINFORCEMENTS',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'CONFEDERATE', placeholder: 'Keyword…' }]
    },
    bazeries: {
      label: 'Bazeries Cipher', engine: 'bazeries', defaultMsg: 'RETREAT TO THE HILLS',
      inputs: [{ type: 'range', id: 'shift', label: 'Number Key', min: 2, max: 99, value: 42 }]
    },
    alberti: {
      label: 'Alberti Cipher Disk', engine: 'alberti', defaultMsg: 'SECRETS OF THE VATICAN',
      inputs: [{ type: 'range', id: 'shift', label: 'Initial Disk Setting', min: 0, max: 25, value: 3 }]
    },
    jefferson: {
      label: 'Jefferson Disk', engine: 'jefferson', defaultMsg: 'WE HOLD THESE TRUTHS',
      inputs: [{ type: 'text', id: 'keyword', label: 'Disk Order (comma-separated)', value: '3,1,5,2,4,6', placeholder: '1,2,3…26' }]
    },
    enigma: {
      label: 'Enigma Machine', engine: 'enigma', defaultMsg: 'HELLO WORLD',
      inputs: [{ type: 'text', id: 'keyword', label: 'Rotor Start (3 letters)', value: 'AAA', placeholder: 'AAA' }]
    },
    lorenz: {
      label: 'Lorenz Cipher', engine: 'lorenz', defaultMsg: 'URGENT MESSAGE',
      inputs: [{ type: 'text', id: 'keyword', label: 'Wheel Seed', value: 'LORENZ', placeholder: 'Seed word…' }]
    },
    dictionaryCode: {
      label: 'Dictionary Code', engine: 'dictionaryCode', defaultMsg: 'WTUSC',
      inputs: [{ type: 'textarea', id: 'keyword', label: 'Reference Text', value: 'We the People of the United States in Order to form a more perfect Union establish Justice insure domestic Tranquility provide for the common defence', placeholder: 'Reference text…' }]
    },
    stager: {
      label: 'Route Cipher (Stager)', engine: 'stager', defaultMsg: 'WE ARE DISCOVERED FLEE AT ONCE',
      inputs: [{ type: 'range', id: 'shift', label: 'Columns', min: 2, max: 10, value: 5 }]
    },
    vic: {
      label: 'VIC Cipher', engine: 'vic', defaultMsg: 'AGENT REPORT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'SNOWFALL', placeholder: 'Keyword…' }]
    },
    scytale: {
      label: 'Scytale', engine: 'scytale', defaultMsg: 'ATTACK AT DAWN',
      inputs: [{ type: 'range', id: 'shift', label: 'Rod Rows', min: 2, max: 10, value: 3 }]
    },
    vernam: {
      label: 'Vernam Cipher (XOR)', engine: 'vernam', defaultMsg: 'SECRET',
      inputs: [{ type: 'text', id: 'keyword', label: 'Key (leave blank for random)', value: '', placeholder: 'Random key if empty' }]
    },
    greatCipher: {
      label: 'Great Cipher (Grand Chiffre)', engine: 'greatCipher',
      defaultMsg: 'THE KING ORDERS RETREAT TO PARIS AT DAWN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Codebook Seed', value: 'LOUIS', placeholder: 'Seed word…' }]
    },
    babington: {
      label: 'Babington Plot Cipher', engine: 'babington',
      defaultMsg: 'THE QUEEN MUST DIE FOR LIBERTY',
      inputs: [{ type: 'text', id: 'keyword', label: 'Codebook Seed', value: 'BABINGTON', placeholder: 'Seed word…' }]
    },
    'navajo-code-talkers': {
      label: 'Navajo Code Talkers', engine: 'navajo',
      defaultMsg: 'ENEMY TANK BATTLESHIP IWO JIMA',
      inputs: []
    },
    voynich: {
      label: 'Voynich Manuscript (Voynichese render)', engine: 'voynich',
      defaultMsg: 'HE WHO DECIPHERS THIS WILL BE FAMOUS',
      inputs: []
    },
    atbash: {
      label: 'Atbash', engine: 'atbash', defaultMsg: 'HELLO WORLD',
      inputs: []
    },
    rot13: {
      label: 'ROT13', engine: 'rot13', defaultMsg: 'TRY ROTATING THIRTEEN',
      inputs: []
    },
    foursquare: {
      label: 'Four-Square Cipher', engine: 'foursquare', defaultMsg: 'HELP ME OBI WAN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Two Keywords (key1,key2)', value: 'EXAMPLE,KEYWORD', placeholder: 'KEY1,KEY2' }]
    },
    twosquare: {
      label: 'Two-Square Cipher', engine: 'twosquare', defaultMsg: 'COME QUICKLY WE NEED HELP',
      inputs: [{ type: 'text', id: 'keyword', label: 'Two Keywords (key1,key2)', value: 'EXAMPLE,KEYWORD', placeholder: 'KEY1,KEY2' }]
    },
    straddlingCheckerboard: {
      label: 'Straddling Checkerboard', engine: 'straddlingCheckerboard',
      defaultMsg: 'ATTACK AT DAWN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Top-Row Letters (8)', value: 'ATONESIRE', placeholder: '8 distinct letters' }]
    },
    chaocipher: {
      label: 'Chaocipher', engine: 'chaocipher', defaultMsg: 'WELLDONE IS BETTER THAN WELLSAID',
      inputs: [{ type: 'text', id: 'keyword', label: 'Initial Alphabet Key', value: 'CHAOCIPHER', placeholder: 'Seed word…' }]
    },
    m209: {
      label: 'M-209 (Hagelin C-38)', engine: 'm209', defaultMsg: 'ENEMY ADVANCING ON FLANK',
      inputs: [{ type: 'text', id: 'keyword', label: 'Wheel Pin Seed', value: 'HAGELIN', placeholder: 'Seed word…' }]
    },
    solitaire: {
      label: 'Solitaire / Pontifex', engine: 'solitaire', defaultMsg: 'DO NOT USE PC',
      inputs: [{ type: 'text', id: 'keyword', label: 'Deck Key', value: 'CRYPTONOMICON', placeholder: 'Key word…' }]
    },
    beale: {
      label: 'Beale Cipher (book cipher)', engine: 'beale', defaultMsg: 'GOLD',
      inputs: [{ type: 'textarea', id: 'keyword', label: 'Reference Text (Declaration of Independence excerpt)',
        value: 'When in the course of human events it becomes necessary for one people to dissolve the political bands which have connected them with another and to assume among the powers of the earth the separate and equal station to which the laws of nature and of natures god entitle them a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation',
        placeholder: 'Long reference text…' }]
    },
    copiale: {
      label: 'Copiale Cipher', engine: 'copiale', defaultMsg: 'OCULIST ORDER SECRETS',
      inputs: [{ type: 'text', id: 'keyword', label: 'Symbol Seed', value: 'COPIALE', placeholder: 'Seed word…' }]
    },
    kryptos: {
      label: 'Kryptos K1/K2 Tableau', engine: 'kryptos', defaultMsg: 'BETWEEN SUBTLE SHADING AND THE ABSENCE OF LIGHT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Vigenère Key', value: 'PALIMPSEST', placeholder: 'PALIMPSEST or ABSCISSA' }]
    },
    purple: {
      label: 'Purple (simplified)', engine: 'purple', defaultMsg: 'CLIMB MOUNT NIITAKA',
      inputs: [{ type: 'text', id: 'keyword', label: 'Switch Seed', value: 'PURPLE', placeholder: 'Seed word…' }]
    },
    autokey: {
      label: 'Autokey Cipher (Vigenère self-extending)', engine: 'autokey', defaultMsg: 'ATTACK AT DAWN',
      inputs: [{ type: 'text', id: 'keyword', label: 'Primer Key', value: 'QUEENLY', placeholder: 'Primer word…' }]
    },
    nomenclator: {
      label: 'Nomenclator (codebook + cipher alphabet)', engine: 'nomenclator',
      defaultMsg: 'THE KING WILL ATTACK PARIS AT DAWN',
      inputs: []
    },
    bookCipher: {
      label: 'Book Cipher (Declaration of Independence)', engine: 'bookCipher',
      defaultMsg: 'GOLD',
      inputs: []
    },
    sigaba: {
      label: 'SIGABA (pseudorandom rotor stepping)', engine: 'sigaba', defaultMsg: 'CLIMB MOUNT NIITAKA',
      inputs: [{ type: 'text', id: 'keyword', label: 'Rotor Seed', value: 'SIGABA', placeholder: 'Seed word…' }]
    },
    typex: {
      label: 'Typex (5-rotor Enigma-style)', engine: 'typex', defaultMsg: 'BRITISH SIGNAL READY',
      inputs: [{ type: 'text', id: 'keyword', label: 'Rotor Start (5 letters)', value: 'AAAAA', placeholder: 'AAAAA' }]
    },
    'kama-sutra': {
      label: 'Kama Sutra Cipher (Mlecchita Vikalpa)', engine: 'kamaSutra',
      defaultMsg: 'SECRET LOVERS LANGUAGE',
      inputs: [{ type: 'text', id: 'keyword', label: 'Pairing Seed', value: 'KAMASUTRA', placeholder: 'Seed word…' }]
    },
    'aeneas-tacticus': {
      label: 'Aeneas Tacticus Water-Clock Code', engine: 'aeneasTacticus',
      defaultMsg: 'SHIPS APPROACH AT NIGHT',
      inputs: []
    },
    'arabic-nomenclators': {
      label: 'Arabic Nomenclator (al-Kindi era)', engine: 'nomenclator',
      defaultMsg: 'THE CALIPH RIDES AT DAWN',
      inputs: []
    },
    'jn-25': {
      label: 'JN-25 (illustrative superenciphered codebook)', engine: 'jn25',
      defaultMsg: 'AF SHORT OF WATER',
      inputs: [{ type: 'text', id: 'keyword', label: 'Additive Key Digits', value: '31415', placeholder: 'Digits only…' }]
    },
    'red-type-a': {
      label: 'Red (Type A) stepping-switch model', engine: 'redTypeA',
      defaultMsg: 'DIPLOMATIC TRAFFIC TOKYO',
      inputs: [{ type: 'text', id: 'keyword', label: 'Switch Seed', value: 'TOKYORED', placeholder: 'Seed word…' }]
    },
    'affine': {
      label: 'Affine Cipher  (E(x) = a·x + b mod 26)', engine: 'affine',
      defaultMsg: 'AFFINE CIPHER',
      inputs: [{ type: 'text', id: 'keyword', label: 'Key (a,b) — a coprime to 26', value: '5,8', placeholder: '5,8' }]
    },
    'trithemius': {
      label: 'Trithemius Progressive Cipher (1518)', engine: 'trithemius',
      defaultMsg: 'STEGANOGRAPHIA',
      inputs: [{ type: 'number', id: 'shift', label: 'Starting Shift', value: '0', placeholder: '0' }]
    },
    'cardano-autokey': {
      label: 'Cardano Autokey (1550)', engine: 'cardanoAutokey',
      defaultMsg: 'MEET ME AT MIDNIGHT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Single Seed Letter', value: 'Q', placeholder: 'Q' }]
    },
    'wheatstone': {
      label: 'Wheatstone Cryptograph (1867)', engine: 'wheatstone',
      defaultMsg: 'TELEGRAPH SIGNAL',
      inputs: [{ type: 'text', id: 'keyword', label: 'Inner-Dial Keyword', value: 'WHEATSTONE', placeholder: 'Keyword…' }]
    },
    'morse': {
      label: 'International Morse Code', engine: 'morse',
      defaultMsg: 'SOS',
      inputs: []
    },
    'cardano-grille': {
      label: 'Cardano Grille (1550)', engine: 'cardanoGrille',
      defaultMsg: 'MEETME',
      inputs: [{ type: 'text', id: 'keyword', label: 'Pattern (size:idx,idx,…)', value: '5:0,3,7,12,19,21,24', placeholder: 'e.g. 5:0,3,7,12,19' }]
    },
    'null-cipher': {
      label: 'Null Cipher (Hidden-Letter Concealment)', engine: 'nullCipher',
      defaultMsg: 'HELP',
      inputs: [{ type: 'text', id: 'keyword', label: 'Position (first | last | N)', value: 'first', placeholder: 'first' }]
    },
    'fialka': {
      label: 'Fialka M-125 (Soviet 10-rotor model)', engine: 'fialka',
      defaultMsg: 'WARSAW PACT TRAFFIC',
      inputs: [{ type: 'text', id: 'keyword', label: 'Rotor Seed', value: 'M125', placeholder: 'Seed word…' }]
    },
    'kl-7': {
      label: 'KL-7 (US 1952 8-rotor model)', engine: 'kl7',
      defaultMsg: 'NATO READY MESSAGE',
      inputs: [{ type: 'text', id: 'keyword', label: 'Rotor Seed', value: 'TSEC', placeholder: 'Seed word…' }]
    },
    'geheimschreiber': {
      label: 'Geheimschreiber T52 (Sturgeon family)', engine: 'geheimschreiber',
      defaultMsg: 'OBERKOMMANDO WEHRMACHT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Wheel Seed', value: 'STURGEON', placeholder: 'Seed word…' }]
    },
    'kryha': {
      label: 'Kryha Pocket Cipher (1924)', engine: 'kryha',
      defaultMsg: 'UNBREAKABLE CIPHER',
      inputs: [{ type: 'text', id: 'keyword', label: 'Wheel Seed', value: 'POCKET', placeholder: 'Seed word…' }]
    },
    'm-94': {
      label: 'M-94 / M-138-A Strip Cipher (1922)', engine: 'm94',
      defaultMsg: 'ARMY SIGNAL READY',
      inputs: [{ type: 'text', id: 'keyword', label: 'Offset Row[, disk-order]', value: '5', placeholder: '5 or 5,1,2,3,…' }]
    },
    'chinese-telegraph': {
      label: 'Chinese Telegraph Code (1881, 4-digit codebook)', engine: 'chineseTelegraph',
      defaultMsg: 'SHANGHAI',
      inputs: [{ type: 'text', id: 'keyword', label: 'Additive Key (numeric, 0–9999)', value: '0', placeholder: 'e.g. 1234' }]
    },
    'zimmermann': {
      label: 'Zimmermann Telegram (Code 0075 / 13040 simulation)', engine: 'zimmermann',
      defaultMsg: 'WAR WITH MEXICO STOP',
      inputs: [{ type: 'text', id: 'keyword', label: 'Additive Key (numeric)', value: '0', placeholder: 'e.g. 13040' }]
    },
    'slidex': {
      label: 'Slidex (British WWII tactical bigram card)', engine: 'slidex',
      defaultMsg: 'TANK MOVE NORTH',
      inputs: [{ type: 'text', id: 'keyword', label: 'Card Seed', value: 'SLIDEX', placeholder: 'Seed word…' }]
    },
    'commercial-codebooks': {
      label: 'Commercial Telegraph Codebooks (ABC / Bentley\'s style)', engine: 'commercialCode',
      defaultMsg: 'CONFIRMED SHIPMENT URGENT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Codebook (informational only)', value: 'ABC', placeholder: 'ABC, Bentley, Lieber…' }]
    },
    'culper-ring': {
      label: 'Culper Ring / Tallmadge Code (1779)', engine: 'culperRing',
      defaultMsg: 'WASHINGTON ATTACK MIDNIGHT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Codebook key (informational)', value: 'TALLMADGE', placeholder: 'TALLMADGE' }]
    },
    'arnold-andre': {
      label: 'Arnold–André Book Cipher (Blackstone\'s Commentaries)', engine: 'arnoldAndre',
      defaultMsg: 'GENERAL ARNOLD MEET ANDRE TONIGHT',
      inputs: [{ type: 'text', id: 'keyword', label: 'Book seed (informational)', value: 'BLACKSTONE', placeholder: 'BLACKSTONE' }]
    }
  };

  function buildDemo(container) {
    const cipherName = container.dataset.cipher;
    const config = CONFIGS[cipherName];
    if (!config || !window.CipherEngines) return;

    const engine = window.CipherEngines[config.engine];
    if (!engine) return;

    let mode = 'enc';
    const inputId = 'demo-msg-' + cipherName;
    const keyId = 'demo-key-' + cipherName;

    let inputsHTML = '';
    for (const inp of config.inputs) {
      if (inp.type === 'range') {
        inputsHTML += `
          <div class="input-group">
            <label class="input-label" for="${keyId}">${inp.label} — <span id="demo-range-val-${cipherName}">${inp.value}</span></label>
            <div class="range-row">
              <input type="range" class="museum-range" id="${keyId}" min="${inp.min}" max="${inp.max}" value="${inp.value}"
                aria-label="${inp.label}">
              <span class="range-val" id="demo-range-display-${cipherName}">${inp.value}</span>
            </div>
          </div>`;
      } else if (inp.type === 'textarea') {
        inputsHTML += `
          <div class="input-group">
            <label class="input-label" for="${keyId}">${inp.label}</label>
            <textarea class="museum-input" id="${keyId}" rows="2" placeholder="${inp.placeholder || ''}"
              aria-label="${inp.label}">${inp.value}</textarea>
          </div>`;
      } else {
        inputsHTML += `
          <div class="input-group">
            <label class="input-label" for="${keyId}">${inp.label}</label>
            <input class="museum-input" id="${keyId}" type="text" value="${inp.value}" placeholder="${inp.placeholder || ''}"
              aria-label="${inp.label}">
          </div>`;
      }
    }

    const modeToggle = config.encryptOnly ? `
      <div class="mode-toggle" role="group" aria-label="Cipher mode">
        <button class="mode-btn active" data-mode="enc" aria-pressed="true">Encrypt</button>
      </div>` : `
      <div class="mode-toggle" role="group" aria-label="Cipher mode">
        <button class="mode-btn active" data-mode="enc" aria-pressed="true">Encrypt</button>
        <button class="mode-btn" data-mode="dec" aria-pressed="false">Decrypt</button>
      </div>`;

    container.innerHTML = `
      <div class="demo-panel">
        <div class="demo-head">
          <span>🔐</span>
          <span class="demo-title">Try It Yourself</span>
        </div>
        <div class="demo-body">
          <div class="demo-col">
            ${modeToggle}
            <div class="input-group">
              <label class="input-label" for="${inputId}">Message</label>
              <textarea class="museum-input" id="${inputId}" rows="3" placeholder="Type a message…"
                aria-label="Message input">${config.defaultMsg}</textarea>
            </div>
            ${inputsHTML}
          </div>
          <div class="demo-col">
            <div class="btn-group">
              <button class="btn btn-primary" id="demo-run-${cipherName}">Run Cipher</button>
              <button class="btn btn-secondary" id="demo-clear-${cipherName}">Clear</button>
            </div>
            <div class="input-group">
              <span class="input-label" id="demo-output-label-${cipherName}">Output</span>
              <div class="output-box" id="demo-output-${cipherName}" aria-live="polite" aria-labelledby="demo-output-label-${cipherName}" role="status">
                <span class="output-empty">Result appears here…</span>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    // Wire events
    const modeButtons = container.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        mode = btn.dataset.mode;
      });
    });

    const rangeInput = container.querySelector('.museum-range');
    if (rangeInput) {
      const valSpan = document.getElementById('demo-range-val-' + cipherName);
      const displaySpan = document.getElementById('demo-range-display-' + cipherName);
      rangeInput.addEventListener('input', () => {
        if (valSpan) valSpan.textContent = rangeInput.value;
        if (displaySpan) displaySpan.textContent = rangeInput.value;
      });
    }

    function getKey() {
      const el = document.getElementById(keyId);
      return el ? el.value : '';
    }

    const runBtn = document.getElementById('demo-run-' + cipherName);
    const clearBtn = document.getElementById('demo-clear-' + cipherName);
    const outputBox = document.getElementById('demo-output-' + cipherName);
    const msgInput = document.getElementById(inputId);

    runBtn.addEventListener('click', () => {
      const msg = msgInput.value;
      const key = getKey();
      try {
        const result = mode === 'enc' ? engine.encode(msg, key) : engine.decode(msg, key);
        outputBox.innerHTML = '';
        outputBox.textContent = result;
      } catch (e) {
        outputBox.innerHTML = '<span class="output-empty">Error: ' + e.message + '</span>';
      }
    });

    clearBtn.addEventListener('click', () => {
      msgInput.value = '';
      outputBox.innerHTML = '<span class="output-empty">Result appears here…</span>';
    });

    // Auto-run on load for instant feedback
    runBtn.click();
  }

  /* ─── Sources & Further Reading ─── */
  const SOURCES = {
    caesar: [
      { text: 'Suetonius, <em>The Twelve Caesars</em>, "Divus Iulius" §56', url: 'https://en.wikipedia.org/wiki/Caesar_cipher' },
      { text: 'Singh, Simon. <em>The Code Book</em>, ch. 1', url: 'https://en.wikipedia.org/wiki/The_Code_Book' },
      { text: 'Practical Cryptography — Caesar Cipher', url: 'https://practicalcryptography.com/ciphers/caesar-cipher/' }
    ],
    polybius: [
      { text: 'Polybius, <em>Histories</em>, Book X §45', url: 'https://en.wikipedia.org/wiki/Polybius_square' },
      { text: 'Practical Cryptography — Polybius Square', url: 'https://practicalcryptography.com/ciphers/polybius-cipher/' }
    ],
    scytale: [
      { text: 'Plutarch, <em>Life of Lysander</em> §19', url: 'https://en.wikipedia.org/wiki/Scytale' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 2', url: 'https://en.wikipedia.org/wiki/The_Codebreakers' }
    ],
    monoalphabetic: [
      { text: 'Al-Kindi, <em>A Manuscript on Deciphering Cryptographic Messages</em> (~850 AD)', url: 'https://en.wikipedia.org/wiki/Al-Kindi' },
      { text: 'Singh, Simon. <em>The Code Book</em>, ch. 1', url: 'https://en.wikipedia.org/wiki/The_Code_Book' },
      { text: 'Practical Cryptography — Simple Substitution', url: 'https://practicalcryptography.com/ciphers/simple-substitution-cipher/' }
    ],
    homophonic: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 3', url: 'https://en.wikipedia.org/wiki/Substitution_cipher#Homophonic_substitution' },
      { text: 'Practical Cryptography — Homophonic Substitution', url: 'https://practicalcryptography.com/ciphers/homophonic-substitution-cipher/' }
    ],
    babington: [
      { text: 'Pollen, John Hungerford. <em>Mary Queen of Scots and the Babington Plot</em> (Scottish History Society, 1922)', url: 'https://archive.org/details/maryqueenofscots00poll' },
      { text: 'Singh, Simon. <em>The Code Book</em>, ch. 1 — "The Cipher of Mary Queen of Scots"', url: 'https://en.wikipedia.org/wiki/The_Code_Book' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 4', url: 'https://en.wikipedia.org/wiki/Babington_Plot' },
      { text: 'British Library — Cotton MS Caligula C IX (Babington letter facsimile)', url: 'https://www.bl.uk/manuscripts/' }
    ],
    voynich: [
      { text: 'Beinecke MS 408 — Voynich Manuscript full digitization (Yale)', url: 'https://collections.library.yale.edu/catalog/2002046' },
      { text: 'Reddy &amp; Knight, "What we know about the Voynich Manuscript" (ACL 2011)', url: 'https://aclanthology.org/W11-1511/' },
      { text: 'Pelling, Nick. <em>The Curse of the Voynich</em> (2006)', url: 'https://ciphermysteries.com/the-voynich-manuscript' },
      { text: 'Kennedy &amp; Churchill. <em>The Voynich Manuscript</em> (Orion, 2004)', url: 'https://en.wikipedia.org/wiki/Voynich_manuscript' }
    ],
    playfair: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 6', url: 'https://en.wikipedia.org/wiki/Playfair_cipher' },
      { text: 'Practical Cryptography — Playfair Cipher', url: 'https://practicalcryptography.com/ciphers/playfair-cipher/' }
    ],
    hill: [
      { text: 'Hill, Lester S., "Cryptography in an Algebraic Alphabet," <em>American Math Monthly</em> 36 (1929)', url: 'https://en.wikipedia.org/wiki/Hill_cipher' },
      { text: 'Practical Cryptography — Hill Cipher', url: 'https://practicalcryptography.com/ciphers/hill-cipher/' }
    ],
    vigenere: [
      { text: 'Vigenère, Blaise de. <em>Traicté des chiffres</em> (1586)', url: 'https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher' },
      { text: 'Kasiski, Friedrich. <em>Die Geheimschriften und die Dechiffrirkunst</em> (1863)', url: 'https://en.wikipedia.org/wiki/Kasiski_examination' },
      { text: 'Singh, Simon. <em>The Code Book</em>, ch. 2', url: 'https://en.wikipedia.org/wiki/The_Code_Book' }
    ],
    beaufort: [
      { text: 'Beaufort, Sir Francis. <em>Cipher system</em> (1857)', url: 'https://en.wikipedia.org/wiki/Beaufort_cipher' },
      { text: 'Practical Cryptography — Beaufort Cipher', url: 'https://practicalcryptography.com/ciphers/beaufort-cipher/' }
    ],
    gronsfeld: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 5', url: 'https://en.wikipedia.org/wiki/Gronsfeld_cipher' }
    ],
    porta: [
      { text: 'Porta, Giovanni Battista della. <em>De Furtivis Literarum Notis</em> (1563)', url: 'https://en.wikipedia.org/wiki/Porta_cipher' }
    ],
    runningKey: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 5', url: 'https://en.wikipedia.org/wiki/Running_key_cipher' },
      { text: 'Practical Cryptography — Running Key Cipher', url: 'https://practicalcryptography.com/ciphers/running-key-cipher/' }
    ],
    railFence: [
      { text: 'Practical Cryptography — Rail Fence Cipher', url: 'https://practicalcryptography.com/ciphers/rail-fence-cipher/' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 4', url: 'https://en.wikipedia.org/wiki/Rail_fence_cipher' }
    ],
    columnar: [
      { text: 'Practical Cryptography — Columnar Transposition', url: 'https://practicalcryptography.com/ciphers/columnar-transposition-cipher/' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 13', url: 'https://en.wikipedia.org/wiki/Transposition_cipher#Columnar_transposition' }
    ],
    doubleTransposition: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 13', url: 'https://en.wikipedia.org/wiki/Transposition_cipher#Double_transposition' }
    ],
    bacon: [
      { text: 'Bacon, Francis. <em>De Augmentis Scientiarum</em> (1623)', url: 'https://en.wikipedia.org/wiki/Bacon%27s_cipher' },
      { text: 'Singh, Simon. <em>The Code Book</em>, ch. 1', url: 'https://en.wikipedia.org/wiki/The_Code_Book' }
    ],
    tapCode: [
      { text: 'Kahn, David. <em>The Codebreakers</em>', url: 'https://en.wikipedia.org/wiki/Tap_code' },
      { text: 'Stockdale, Jim. <em>In Love and War</em>', url: 'https://en.wikipedia.org/wiki/Tap_code' }
    ],
    pigpen: [
      { text: 'Kahn, David. <em>The Codebreakers</em>', url: 'https://en.wikipedia.org/wiki/Pigpen_cipher' }
    ],
    bifid: [
      { text: 'Delastelle, Félix. <em>Traité élémentaire de cryptographie</em> (1902)', url: 'https://en.wikipedia.org/wiki/Bifid_cipher' },
      { text: 'Practical Cryptography — Bifid Cipher', url: 'https://practicalcryptography.com/ciphers/bifid-cipher/' }
    ],
    trifid: [
      { text: 'Delastelle, Félix. <em>Traité élémentaire de cryptographie</em> (1902)', url: 'https://en.wikipedia.org/wiki/Trifid_cipher' }
    ],
    adfgx: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 11', url: 'https://en.wikipedia.org/wiki/ADFGX_cipher' }
    ],
    adfgvx: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 11', url: 'https://en.wikipedia.org/wiki/ADFGVX_cipher' },
      { text: 'Practical Cryptography — ADFGVX Cipher', url: 'https://practicalcryptography.com/ciphers/adfgvx-cipher/' }
    ],
    nihilist: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 7', url: 'https://en.wikipedia.org/wiki/Nihilist_cipher' },
      { text: 'Practical Cryptography — Nihilist Cipher', url: 'https://practicalcryptography.com/ciphers/nihilist-cipher/' }
    ],
    otp: [
      { text: 'Shannon, Claude. "Communication Theory of Secrecy Systems" (1949)', url: 'https://en.wikipedia.org/wiki/One-time_pad' },
      { text: 'Vernam, Gilbert. US Patent 1,310,719 (1919)', url: 'https://en.wikipedia.org/wiki/Gilbert_Vernam' }
    ],
    fractionatedMorse: [
      { text: 'Practical Cryptography — Fractionated Morse', url: 'https://practicalcryptography.com/ciphers/fractionated-morse-cipher/' }
    ],
    confederateVigenere: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 8', url: 'https://en.wikipedia.org/wiki/Confederate_cipher_disk' }
    ],
    bazeries: [
      { text: 'Bazeries, Étienne. <em>Les Chiffres et les Lettres</em> (1901)', url: 'https://en.wikipedia.org/wiki/Bazeries_cylinder' }
    ],
    alberti: [
      { text: 'Alberti, Leon Battista. <em>De Componendis Cifris</em> (1467)', url: 'https://en.wikipedia.org/wiki/Alberti_cipher' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 4', url: 'https://en.wikipedia.org/wiki/The_Codebreakers' }
    ],
    jefferson: [
      { text: 'Jefferson, Thomas. Papers, 1795', url: 'https://en.wikipedia.org/wiki/Jefferson_disk' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 7', url: 'https://en.wikipedia.org/wiki/The_Codebreakers' }
    ],
    enigma: [
      { text: 'Hodges, Andrew. <em>Alan Turing: The Enigma</em>', url: 'https://en.wikipedia.org/wiki/Enigma_machine' },
      { text: 'Singh, Simon. <em>The Code Book</em>, ch. 4–6', url: 'https://en.wikipedia.org/wiki/The_Code_Book' },
      { text: 'Kahn, David. <em>Seizing the Enigma</em>', url: 'https://en.wikipedia.org/wiki/Seizing_the_Enigma' }
    ],
    lorenz: [
      { text: 'Jack Copeland, <em>Colossus: The Secrets of Bletchley Park</em>', url: 'https://en.wikipedia.org/wiki/Lorenz_cipher' },
      { text: 'Singh, Simon. <em>The Code Book</em>, ch. 6', url: 'https://en.wikipedia.org/wiki/The_Code_Book' }
    ],
    dictionaryCode: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 5', url: 'https://en.wikipedia.org/wiki/Book_cipher' }
    ],
    stager: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 8', url: 'https://en.wikipedia.org/wiki/Transposition_cipher#Route_cipher' }
    ],
    vic: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 18', url: 'https://en.wikipedia.org/wiki/VIC_cipher' }
    ],
    vernam: [
      { text: 'Vernam, Gilbert. US Patent 1,310,719 (1919)', url: 'https://en.wikipedia.org/wiki/Gilbert_Vernam' },
      { text: 'Shannon, Claude. "Communication Theory of Secrecy Systems" (1949)', url: 'https://en.wikipedia.org/wiki/One-time_pad' }
    ],
    'navajo-code-talkers': [
      { text: 'Meadows, William C. <em>The Comanche Code Talkers of World War II</em>', url: 'https://en.wikipedia.org/wiki/Code_talker' },
      { text: 'National Museum of the American Indian — Navajo Code Talkers', url: 'https://en.wikipedia.org/wiki/Navajo_Code_Talkers%27_Dictionary' }
    ],
    zodiac: [
      { text: 'Oranchak, David et al. "Cracking the Zodiac 340-Character Cipher" (2020)', url: 'https://en.wikipedia.org/wiki/Zodiac_Killer#Communications' },
      { text: 'Singh, Simon. <em>The Code Book</em>, ch. 8', url: 'https://en.wikipedia.org/wiki/The_Code_Book' }
    ],
    autokey: [
      { text: 'Vigenère, Blaise de. <em>Traicté des chiffres</em> (1586) — autokey variant', url: 'https://en.wikipedia.org/wiki/Autokey_cipher' },
      { text: 'Practical Cryptography — Autokey Cipher', url: 'https://practicalcryptography.com/ciphers/autokey-cipher/' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 5', url: 'https://en.wikipedia.org/wiki/The_Codebreakers' }
    ],
    nomenclator: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 4 — "The Era of the Black Chambers"', url: 'https://en.wikipedia.org/wiki/Nomenclator_cipher' },
      { text: 'Singh, Simon. <em>The Code Book</em>, ch. 1', url: 'https://en.wikipedia.org/wiki/The_Code_Book' }
    ],
    bookCipher: [
      { text: 'Ward, James B. <em>The Beale Papers</em> (1885)', url: 'https://en.wikipedia.org/wiki/Beale_ciphers' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 18', url: 'https://en.wikipedia.org/wiki/Book_cipher' }
    ],
    sigaba: [
      { text: 'Stamp &amp; Chan, "SIGABA: Cryptanalysis of the Full Keyspace" (2007)', url: 'https://en.wikipedia.org/wiki/SIGABA' },
      { text: 'NSA Center for Cryptologic History — SIGABA', url: 'https://www.nsa.gov/History/Cryptologic-History/' }
    ],
    typex: [
      { text: 'Erskine, Ralph. "The Development of Typex" (Cryptologia, 1997)', url: 'https://en.wikipedia.org/wiki/Typex' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 11', url: 'https://en.wikipedia.org/wiki/The_Codebreakers' }
    ],
    jn25: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 17 (Pacific cryptanalysis)', url: 'https://en.wikipedia.org/wiki/JN-25' },
      { text: 'Carlson, Elliot. <em>Joe Rochefort\'s War</em> (2011)', url: 'https://www.usni.org/press/books/joe-rocheforts-war' },
      { text: 'Parshall & Tully, <em>Shattered Sword</em> (Midway and the AF deception)', url: 'https://en.wikipedia.org/wiki/Battle_of_Midway' }
    ],
    redTypeA: [
      { text: 'Rowlett, Frank. <em>The Story of Magic</em> (Purple predecessor context)', url: 'https://en.wikipedia.org/wiki/Japanese_diplomatic_cipher_machine' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, Red/Purple transition chapters', url: 'https://en.wikipedia.org/wiki/Purple_(cipher_machine)' },
      { text: 'NSA CCH materials on SIS Japanese machine exploitation', url: 'https://www.nsa.gov/History/Cryptologic-History/' }
    ],
    affine: [
      { text: 'Lyons, James. "Affine Cipher" — Practical Cryptography', url: 'https://practicalcryptography.com/ciphers/classical-era/affine/' },
      { text: 'Stinson, Douglas. <em>Cryptography: Theory and Practice</em>, ch. 1 (modular arithmetic primer)', url: 'https://en.wikipedia.org/wiki/Affine_cipher' },
      { text: 'Wikipedia — Affine cipher (key-space derivation)', url: 'https://en.wikipedia.org/wiki/Affine_cipher' }
    ],
    trithemius: [
      { text: 'Trithemius, Johannes. <em>Polygraphia</em> (1518) — first printed cryptography book', url: 'https://en.wikipedia.org/wiki/Polygraphia_(book)' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 5 (Renaissance polyalphabetics)', url: 'https://en.wikipedia.org/wiki/The_Codebreakers' },
      { text: 'Practical Cryptography — Trithemius cipher', url: 'https://practicalcryptography.com/ciphers/classical-era/trithemius/' }
    ],
    cardanoAutokey: [
      { text: 'Cardano, Girolamo. <em>De Subtilitate</em> (1550)', url: 'https://en.wikipedia.org/wiki/Gerolamo_Cardano' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 4 (Cardano and Vigenère)', url: 'https://en.wikipedia.org/wiki/The_Codebreakers' },
      { text: 'Wikipedia — Autokey cipher (history section)', url: 'https://en.wikipedia.org/wiki/Autokey_cipher' }
    ],
    wheatstone: [
      { text: 'Wheatstone, Charles. <em>Cryptograph</em> — 1867 Paris Universal Exposition (described in Kahn)', url: 'https://en.wikipedia.org/wiki/Charles_Wheatstone#Cryptography' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 7 (Wheatstone &amp; Playfair)', url: 'https://en.wikipedia.org/wiki/The_Codebreakers' },
      { text: 'Crypto Museum — Cipher disks and dial machines', url: 'https://www.cryptomuseum.com/crypto/' }
    ],
    morse: [
      { text: 'ITU-R Recommendation M.1677 — International Morse Code', url: 'https://www.itu.int/rec/R-REC-M.1677/' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 9 (telegraph &amp; code)', url: 'https://en.wikipedia.org/wiki/The_Codebreakers' },
      { text: 'Wikipedia — Morse code', url: 'https://en.wikipedia.org/wiki/Morse_code' }
    ],
    cardanoGrille: [
      { text: 'Cardano, Girolamo. <em>De Subtilitate</em> (1550) — original grille proposal', url: 'https://en.wikipedia.org/wiki/Cardan_grille' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 4 (grilles &amp; turning grilles)', url: 'https://en.wikipedia.org/wiki/The_Codebreakers' },
      { text: 'Wikipedia — Grille (cryptography)', url: 'https://en.wikipedia.org/wiki/Grille_(cryptography)' }
    ],
    nullCipher: [
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 14 (concealment ciphers in WWII)', url: 'https://en.wikipedia.org/wiki/The_Codebreakers' },
      { text: 'Wikipedia — Null cipher', url: 'https://en.wikipedia.org/wiki/Null_cipher' },
      { text: 'Stamatatos, Efstathios. "A Survey of Modern Authorship Attribution Methods" (2009) — statistical detection of constrained text', url: 'https://en.wikipedia.org/wiki/Stylometry' }
    ],
    fialka: [
      { text: 'Crypto Museum — Fialka M-125 deep dive', url: 'https://www.cryptomuseum.com/crypto/fialka/' },
      { text: 'Wikipedia — Fialka', url: 'https://en.wikipedia.org/wiki/Fialka' },
      { text: 'Reuvers &amp; Simons, "Fialka History &amp; Operation" (Crypto Museum, 2009)', url: 'https://www.cryptomuseum.com/crypto/fialka/files/' }
    ],
    kl7: [
      { text: 'Crypto Museum — KL-7 (TSEC/KL-7 ADONIS)', url: 'https://www.cryptomuseum.com/crypto/usa/kl7/' },
      { text: 'NSA Cryptologic Heritage — KL-7 retirement (1968)', url: 'https://www.nsa.gov/History/Cryptologic-History/' },
      { text: 'Wikipedia — KL-7', url: 'https://en.wikipedia.org/wiki/KL-7' }
    ],
    geheimschreiber: [
      { text: 'Crypto Museum — Siemens &amp; Halske T52 Geheimschreiber', url: 'https://www.cryptomuseum.com/crypto/siemens/t52/' },
      { text: 'Beckman, Bengt. <em>Codebreakers: Arne Beurling and the Swedish Crypto Program</em>', url: 'https://en.wikipedia.org/wiki/Arne_Beurling' },
      { text: 'Wikipedia — Siemens and Halske T52 / "Sturgeon" / Fish (cryptography)', url: 'https://en.wikipedia.org/wiki/Siemens_and_Halske_T52' }
    ],
    kryha: [
      { text: 'Friedman, Kullback, Sinkov, Rosen — broke Kryha in a few hours; declassified analysis', url: 'https://www.nsa.gov/Portals/70/documents/news-features/declassified-documents/friedman-documents/' },
      { text: 'Crypto Museum — Kryha Standard Cipher Machine', url: 'https://www.cryptomuseum.com/crypto/kryha/' },
      { text: 'Wikipedia — Kryha', url: 'https://en.wikipedia.org/wiki/Kryha' }
    ],
    m94: [
      { text: 'Crypto Museum — M-94 / CSP-488', url: 'https://www.cryptomuseum.com/crypto/usa/m94/' },
      { text: 'Kahn, David. <em>The Codebreakers</em>, ch. 12 (US Army cylinder devices)', url: 'https://en.wikipedia.org/wiki/M-94' },
      { text: 'Wikipedia — M-94 and M-138-A', url: 'https://en.wikipedia.org/wiki/M-94' }
    ],
    chineseTelegraph: [
      { text: 'Wikipedia — Chinese telegraph code', url: 'https://en.wikipedia.org/wiki/Chinese_telegraph_code' },
      { text: 'Mullaney, Thomas S. <em>The Chinese Typewriter: A History</em> — covers the 1881 codebook', url: 'https://mitpress.mit.edu/9780262536103/the-chinese-typewriter/' },
      { text: 'Standard Telegraph Codebook scans (Internet Archive)', url: 'https://archive.org/details/chinesetelegrap00gordgoog' }
    ],
    zimmermann: [
      { text: 'NSA Center for Cryptologic History — The Zimmermann Telegram', url: 'https://www.nsa.gov/Helpful-Links/NSA-FOIA/Declassification-Transparency-Initiatives/Historical-Releases/' },
      { text: 'Tuchman, Barbara W. <em>The Zimmermann Telegram</em> (1958)', url: 'https://en.wikipedia.org/wiki/The_Zimmermann_Telegram_(book)' },
      { text: 'National Archives — Zimmermann Telegram (decoded text)', url: 'https://www.archives.gov/education/lessons/zimmermann' },
      { text: 'Boghardt, Thomas. <em>The Zimmermann Telegram: Intelligence, Diplomacy, and America\'s Entry into WWI</em>', url: 'https://www.usni.org/press/books/zimmermann-telegram' }
    ],
    slidex: [
      { text: 'Crypto Museum — Slidex', url: 'https://www.cryptomuseum.com/crypto/uk/slidex/' },
      { text: 'Wikipedia — Slidex', url: 'https://en.wikipedia.org/wiki/Slidex' },
      { text: 'GCHQ historical pamphlet on tactical cipher cards (declassified)', url: 'https://www.gchq.gov.uk/history' }
    ],
    commercialCode: [
      { text: 'McKenna, Edward L. <em>Code-Books and the Telegraph</em>', url: 'https://en.wikipedia.org/wiki/Commercial_code_(communications)' },
      { text: 'Bentley\'s Complete Phrase Code (1906) — Internet Archive', url: 'https://archive.org/details/bentleyscomplete00bent' },
      { text: 'ABC Telegraphic Code, 5th edition (1901) — Internet Archive', url: 'https://archive.org/details/abctelegraphicco00clauuoft' },
      { text: 'Standage, Tom. <em>The Victorian Internet</em> (cultural context)', url: 'https://www.bloomsbury.com/uk/victorian-internet-9781620405925/' }
    ],
    culperRing: [
      { text: 'Rose, Alexander. <em>Washington\'s Spies: The Story of America\'s First Spy Ring</em> (2006)', url: 'https://www.simonandschuster.com/books/Washingtons-Spies/Alexander-Rose/9780553383294' },
      { text: 'Library of Congress — Tallmadge\'s codebook (digitised pages)', url: 'https://www.loc.gov/collections/george-washington-papers/' },
      { text: 'Mount Vernon — The Culper Spy Ring', url: 'https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/the-culper-code-book/' },
      { text: 'Wikipedia — Culper Ring', url: 'https://en.wikipedia.org/wiki/Culper_Ring' }
    ],
    arnoldAndre: [
      { text: 'Wikipedia — Benedict Arnold and John André correspondence', url: 'https://en.wikipedia.org/wiki/Benedict_Arnold' },
      { text: 'Bakeless, John. <em>Turncoats, Traitors and Heroes</em> (1959) — chapter on the Arnold cipher', url: 'https://en.wikipedia.org/wiki/Turncoats,_Traitors_and_Heroes' },
      { text: 'Mount Vernon — André\'s captured ciphered letter', url: 'https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/john-andre/' },
      { text: 'Cipher History — Arnold-André book cipher analysis', url: 'https://www.tandfonline.com/journals/ucry20' }
    ]
  };

  const GENERAL_RESOURCES = [
    { text: 'Crypto Museum — Encyclopedic hardware-focused archive (Enigma variants, spy gear, thousands of photos)', url: 'https://www.cryptomuseum.com/' },
    { text: 'CrypTool-Online — Interactive encrypt / decrypt / analysis tools for many classical ciphers', url: 'https://www.cryptool.org/en/cto/' },
    { text: 'CrypTool Open-Source Project (GitHub)', url: 'https://github.com/cryptool-org' },
    { text: 'National Cryptologic Museum (NSA) — Virtual exhibits on VENONA, Purple, and 20th-century crypto', url: 'https://www.nsa.gov/Museum/' },
    { text: 'Cipher Machines &amp; Cryptology — Deep technical simulations of cipher machines', url: 'https://www.ciphermachinesandcryptology.com/' },
    { text: 'Practical Cryptography — Cipher encyclopaedia with detailed algorithms &amp; analysis', url: 'https://practicalcryptography.com/ciphers/' },
    { text: 'CyberChef — GCHQ\'s open-source data transformation playground', url: 'https://gchq.github.io/CyberChef/' },
    { text: 'CryptoHack — Modern cryptography puzzles &amp; challenges', url: 'https://cryptohack.org/' }
  ];

  function buildSources(cipherName) {
    const sources = SOURCES[cipherName] || [];
    const target = document.querySelector('.exhibit-side') || document.querySelector('.exhibit-main');
    if (!target) return;

    function renderList(items) {
      return '<ul style="list-style:none;display:flex;flex-direction:column;gap:.75rem;margin:0;padding:0;">' +
        items.map(function (s) {
          return '<li style="font-size:.92rem;line-height:1.65;color:var(--tx2);">' +
            '<a href="' + s.url + '" target="_blank" rel="noopener noreferrer" style="color:var(--gold);">' +
            s.text + ' ↗</a></li>';
        }).join('') + '</ul>';
    }

    var body = '';
    if (sources.length) {
      body += '<h4 style="color:var(--tx1);margin:0 0 .75rem;font-size:.95rem;">Exhibit Sources</h4>' +
              renderList(sources);
      body += '<hr style="border:none;border-top:1px solid var(--gold-b);margin:1.25rem 0;">';
    }
    body += '<h4 style="color:var(--tx1);margin:0 0 .75rem;font-size:.95rem;">General Cryptography Resources</h4>' +
            renderList(GENERAL_RESOURCES);

    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.style.borderColor = 'var(--gold-b)';
    panel.innerHTML = '<div class="panel-head" style="background:var(--gold-glow);border-color:var(--gold-b);">' +
      '<span class="panel-icon">📚</span>' +
      '<span class="panel-title" style="color:var(--gold);">Further Reading &amp; Sources</span></div>' +
      '<div class="panel-body">' + body + '</div>';
    target.appendChild(panel);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.demo-section[data-cipher]').forEach(function(el) {
      if (!el.children.length) {
        el.innerHTML = '<p style="color:var(--tx3);font-family:var(--fm);font-size:.85rem;padding:1.5rem;text-align:center;border:1px dashed var(--s5);border-radius:var(--rl);">Loading interactive demo\u2026</p>';
      }
      buildDemo(el);
    });
    const cipherEl = document.querySelector('.demo-section[data-cipher]') ||
                     document.querySelector('[data-cipher]');
    if (cipherEl) buildSources(cipherEl.dataset.cipher);
  });
})();
