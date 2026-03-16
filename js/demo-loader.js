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
