/* JSDOM smoke test for the live cipher-detective.html page. */
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('cipher-detective.html', 'utf8');
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources:  'usable',
  url:        'file://' + path.resolve('cipher-detective.html')
});

dom.window.addEventListener('load', function () {
  const w = dom.window;
  console.log('DetectiveLangModel loaded:', !!w.DetectiveLangModel);
  console.log('DetectiveSolvers   loaded:', !!w.DetectiveSolvers);
  console.log('Auto-Solve button   found:', !!w.document.getElementById('det-autosolve-btn'));
  console.log('Result panel        found:', !!w.document.getElementById('det-autosolve-result'));

  const input = w.document.getElementById('detective-input');
  input.value = 'WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ';
  input.dispatchEvent(new w.Event('input', { bubbles: true }));

  setTimeout(function () {
    const btn = w.document.getElementById('det-autosolve-btn');
    console.log('Button enabled after input:', !btn.disabled);
    btn.click();
    setTimeout(function () {
      const r = w.document.getElementById('det-autosolve-result').innerHTML;
      console.log('Result has best card :', r.indexOf('Best candidate') >= 0);
      console.log('Result has Caesar    :', r.indexOf('Caesar') >= 0);
      console.log('Result has plaintext :', r.indexOf('THE QUICK') >= 0);
      console.log('---');
      console.log(r.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').substring(0, 300));
      process.exit(0);
    }, 800);
  }, 200);
});

setTimeout(function () { console.log('TIMEOUT'); process.exit(1); }, 15000);
