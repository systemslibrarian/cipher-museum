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
      inputs: [{ type: 'text', id: 'keyword', label: 'Keyword', value: 'ROUNDTABLE', placeholder: 'Keyword…' }],
      encryptOnly: true
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
              <span class="input-label">Output</span>
              <div class="output-box" id="demo-output-${cipherName}" aria-live="polite">
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

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.demo-section[data-cipher]').forEach(buildDemo);
  });
})();
