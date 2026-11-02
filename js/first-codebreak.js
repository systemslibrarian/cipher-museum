/* Original classroom fixtures. Reuses DetectiveWorkspaces.Desk for partial keys.
 * Vigenère: A=0, repeating key, ASCII letters only; spacing is not encrypted.
 * Language panels describe the displayed samples, not population frequencies.
 */
'use strict';
(function (global) {
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const SUB_KEY = 'QWERTYUIOPASDFGHJKLZXCVBNM';
  const NOTICE = 'LOOK FOR THE BOOK OF MAPS IN THE SCHOOL ROOM. DO NOT GO TO THE OLD DOOR. BRING THE BOOK TO THE READING ROOM AT NOON.';
  const VIG_KEY = 'LAMP';
  const DISPATCH = 'THE READING ROOM WILL OPEN AT NINE. BRING THE MAP AND THE LETTER TO THE LIBRARY. THE READING ROOM WILL CLOSE AT FIVE. CHECK THE NAME ON THE LETTER BEFORE YOU GIVE IT TO THE READER. KEEP A COPY OF THE MESSAGE AND NOTE THE TIME IT ARRIVED. THE MAP SHOWS THE ROAD TO THE OLD SCHOOL AND THE BRIDGE OVER THE RIVER. THE READER WILL WAIT IN THE LIBRARY UNTIL THE OTHER COPY ARRIVES. COMPARE THE TWO COPIES AND RECORD EVERY CHANGE. A CLEAR MESSAGE IS ONLY PART OF THE EVIDENCE.';
  const SAMPLES = [
    {id:'en', name:'English', text:'THE LIBRARY KEEPS LETTERS AND MAPS. READ THE LETTER BEFORE YOU LEAVE. THERE IS A NAME ON THE PAGE AND A NOTE IN THE MARGIN.'},
    {id:'fr', name:'French', text:'LA BIBLIOTHEQUE GARDE LES LETTRES ET LES CARTES. LISEZ LA LETTRE AVANT DE PARTIR. IL Y A UN NOM SUR LA PAGE ET UNE NOTE DANS LA MARGE.'},
    {id:'de', name:'German', text:'DIE BIBLIOTHEK BEWAHRT BRIEFE UND KARTEN AUF. LESEN SIE DEN BRIEF VOR DER ABREISE. AUF DER SEITE STEHT EIN NAME UND AM RAND EINE NOTIZ.'},
    {id:'it', name:'Italian', text:'LA BIBLIOTECA CONSERVA LETTERE E MAPPE. LEGGETE LA LETTERA PRIMA DI PARTIRE. SULLA PAGINA SI TROVA UN NOME E NEL MARGINE UNA NOTA.'},
    {id:'es', name:'Spanish', text:'LA BIBLIOTECA GUARDA CARTAS Y MAPAS. LEAN LA CARTA ANTES DE SALIR. HAY UN NOMBRE EN LA PAGINA Y UNA NOTA EN EL MARGEN.'}
  ];
  const ENGLISH = [8.2,1.5,2.8,4.3,12.7,2.2,2,6.1,7,.15,.77,4,2.4,6.7,7.5,1.9,.095,6,6.3,9.1,2.8,.98,2.4,.15,2,.074];
  const letters = text => text.toUpperCase().replace(/[^A-Z]/g, '');
  function substitution(text) { return text.replace(/[A-Z]/g, c => SUB_KEY[ABC.indexOf(c)]); }
  function counts(text) {
    const out = {};
    letters(text).split('').forEach(c => { out[c] = (out[c] || 0) + 1; });
    return Object.entries(out).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]));
  }
  function vigenere(text, key, decrypt = false) {
    if (!/^[A-Z]+$/.test(key)) throw new Error('Use one or more A–Z key letters.');
    let pos = 0;
    return text.replace(/[A-Z]/g, c => ABC[(ABC.indexOf(c) + (decrypt ? -1 : 1)*ABC.indexOf(key[pos++ % key.length]) + 26)%26]);
  }
  function repeats(text) {
    const t = letters(text), seen = {}, found = [];
    for (let i=0;i<t.length-2;i++) {
      const s = t.slice(i,i+3);
      if (seen[s] !== undefined) found.push({sequence:s, first:seen[s], second:i, distance:i-seen[s]});
      else seen[s]=i;
    }
    return found;
  }
  function columns(text, period) {
    if (!Number.isInteger(period) || period<1 || period>10) throw new Error('Choose a period from 1 to 10.');
    const groups = Array.from({length:period},()=> '');
    letters(text).split('').forEach((c,i)=>{ groups[i%period]+=c; }); return groups;
  }
  function rankShifts(text) {
    const t = letters(text);
    if (!t.length) return [];
    return Array.from({length:26},(_,shift)=> {
      const decoded = vigenere(t,ABC[shift],true), freq=Object.fromEntries(counts(decoded));
      const score = ENGLISH.reduce((sum,f,i)=> { const expected=t.length*f/100; return sum+Math.pow((freq[ABC[i]]||0)-expected,2)/expected; },0);
      return {shift, key:ABC[shift], text:decoded, score};
    }).sort((a,b)=>a.score-b.score);
  }
  function bigrams(text) {
    const out = {};
    (text.match(/[A-Z]+/g)||[]).forEach(word=> {for(let i=0;i<word.length-1;i++) {const pair=word.slice(i,i+2); out[pair]=(out[pair]||0)+1;} });
    return Object.entries(out).sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0])).slice(0,6);
  }
  function homophones(text, alternatives, rng = Math.random) {
    if (!Number.isInteger(alternatives) || alternatives<1 || alternatives>8) throw new Error('Choose 1–8 alternatives.');
    const tokens=[], key={};
    letters(text).split('').forEach(c=> {
      const n = c==='O' ? alternatives : 1;
      const token=String(ABC.indexOf(c)*8+Math.floor(rng()*n)).padStart(3,'0');
      tokens.push(token);key[token]=c;
    });
    const freq={}; tokens.forEach(t=>{freq[t]=(freq[t]||0)+1;});
    return {tokens,key,frequencies:Object.entries(freq).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))};
  }
  const api={ABC,SUB_KEY,NOTICE,VIG_KEY,DISPATCH,SAMPLES,letters,substitution,counts,vigenere,repeats,columns,rankShifts,bigrams,homophones};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  global.FirstCodebreak=api;
  function boot() {
    const d=global.document, $=id=>d.getElementById(id);
    if (!$('first-desk')) return;
    const W=global.DetectiveWorkspaces, cipher=substitution(NOTICE), desk=new W.Desk(cipher);
    let hint=0;
    const hints=[
      'G occurs 24 times. A frequency guess of G → E is tempting. Try it, but treat it as a guess.',
      'FGGF has the pattern 0.1.1.0. The meeting time is a four-letter word with this pattern: NOON. Test F → N and G → O. Undo a conflicting guess first.',
      'The repeated word ZIT can be tested as THE: Z → T, I → H, T → E. Does that fit every occurrence?',
      'This is a library notice. Try WGGA → BOOK and KGGD → ROOM. Each letter must keep the same meaning throughout.',
      'QZ is AT; GY is OF; OF is IN. Use the surrounding words to finish. If stuck, reveal one missing letter at a time.'
    ];
    const say=text=>{$('desk-status').textContent=text;};
    const grid=$('lesson-key');
    counts(cipher).map(r=>r[0]).sort().forEach(c=>{
      const cell=d.createElement('div');cell.className='det-key-cell';
      const label=d.createElement('label');label.htmlFor='lesson-map-'+c;label.textContent=c+' →';
      const input=d.createElement('input');input.id=label.htmlFor;input.maxLength=1;input.autocomplete='off';input.type='text';input.setAttribute('aria-label','Plaintext for cipher '+c);
      const assign=()=>{try{const value=input.value.trim().toUpperCase();if(value!==(desk.state.map[c]||'')){desk.assign(c,value);say('Mapping updated. Check it against every word.');}}catch(e){say(e.message);}render();};
      input.addEventListener('input',assign);input.addEventListener('change',assign);
      const lock=d.createElement('label');lock.className='det-lock';const box=d.createElement('input');box.type='checkbox';box.id='lesson-lock-'+c;box.setAttribute('aria-label','Lock cipher '+c);
      box.addEventListener('change',()=>{try{desk.lock(c,box.checked);say('Lock updated.');}catch(e){say(e.message);}render();});
      lock.append(box,d.createTextNode('Lock'));cell.append(label,input,lock);grid.append(cell);
    });
    function render() {
      $('lesson-cipher').textContent=cipher;
      $('lesson-plain').textContent=W.decode(cipher,desk.state.map);
      counts(cipher).forEach(([c])=> {const input=$('lesson-map-'+c);input.value=desk.state.map[c]||'';input.readOnly=!!desk.state.locks[c];$('lesson-lock-'+c).checked=!!desk.state.locks[c];});
      $('lesson-undo').disabled=!desk.history.length;
      const used=counts(cipher).length, correct=counts(cipher).filter(([c])=>desk.state.map[c]===ABC[SUB_KEY.indexOf(c)]).length;
      $('lesson-progress').textContent=Object.keys(desk.state.map).length+' of '+used+' used symbols assigned. Check the message when you are ready.';
      $('lesson-check').onclick=()=>say(correct===used?'The plaintext matches the supplied exercise. Now explain which clues supported it. This verifies an invented fixture; it does not authenticate a historical document.':'The supplied message does not match yet. Check repeated words and test your guesses across the whole notice.');
    }
    function highlight(kind) {
      const words=cipher.match(/[A-Z]+/g)||[], frequencies={};words.forEach(w=>{frequencies[w]=(frequencies[w]||0)+1;});
      const parts=cipher.split(/([A-Z]+)/);$('clue-output').textContent='';
      parts.forEach(word=>{
        const match=kind==='double'?/([A-Z])\1/.test(word):kind==='short'?/^[A-Z]{1,3}$/.test(word):frequencies[word]>1;
        const node=d.createElement(match?'mark':'span');node.textContent=word;$('clue-output').append(node);
      });
      $('clue-caption').textContent={double:'Highlighted words contain doubled letters. A one-to-one substitution preserves this pattern.',short:'Highlighted words have one to three letters. These boundaries were intentionally retained in this exercise.',repeat:'Highlighted words recur. One shared mapping must explain all occurrences.'}[kind];
    }
    ['double','short','repeat'].forEach(kind=>$('clue-'+kind).addEventListener('click',()=>highlight(kind)));
    $('lesson-frequencies').textContent=counts(cipher).map(([c,n])=>c+': '+n).join(' · ');
    $('lesson-wrong').addEventListener('click',()=>{try{desk.assign('G','E');say('G → E is an unverified frequency guess. Compare FGGF with the NOON clue; Undo restores your previous key.');}catch(e){say(e.message);}render();});
    $('lesson-undo').addEventListener('click',()=>{desk.undo();render();say('Restored the previous key and locks.');});
    $('lesson-reset').addEventListener('click',()=>{desk.clear();render();say('Cleared unlocked guesses. Locked letters are retained.');});
    $('lesson-hint').addEventListener('click',()=>{const p=d.createElement('p');p.textContent=(hint+1)+'. '+hints[hint++];$('lesson-hints').append(p);$('lesson-hint').disabled=hint===hints.length;});
    $('lesson-reveal').addEventListener('click',()=>{
      const next=counts(cipher).map(r=>r[0]).find(c=>desk.state.map[c]!==ABC[SUB_KEY.indexOf(c)]);
      if(!next){say('All used letters match. Check the message, then record your reasoning.');return;}
      try {desk.assign(next,ABC[SUB_KEY.indexOf(next)]);say('Answer help: revealed '+next+' → '+desk.state.map[next]+'.');}catch(e){say('Reveal stopped: '+e.message+' Undo or clear conflicting guesses before revealing.');}render();
    });
    render();highlight('double');

    // A complete, inspectable repeating-key attack on one supplied fixture.
    const vigCipher=vigenere(letters(DISPATCH),VIG_KEY);let selectedRepeat=null;
    $('vig-cipher').textContent=vigCipher;
    $('vig-find').addEventListener('click',()=>{
      const rows=repeats(vigCipher);$('vig-repeats').textContent='';
      rows.slice(0,20).forEach(row=>{
        const button=d.createElement('button');button.type='button';button.textContent=row.sequence+': positions '+(row.first+1)+' and '+(row.second+1)+'; distance '+row.distance;
        button.addEventListener('click',()=>{selectedRepeat=row;drawVig();});$('vig-repeats').append(button);
      });
      $('vig-repeat-note').textContent='Showing the first '+Math.min(20,rows.length)+' of '+rows.length+' repeated-trigram pairs (each later occurrence compared with its first). Positions count A–Z letters from 1. Select a pair to highlight it; repeats can be accidental.';
    });
    function drawVig() {
      const period=Number($('vig-period').value), groups=columns(vigCipher,period);
      $('vig-cipher').textContent='';
      vigCipher.split('').forEach((c,i)=> {const node=d.createElement(selectedRepeat && ((i>=selectedRepeat.first&&i<selectedRepeat.first+3)||(i>=selectedRepeat.second&&i<selectedRepeat.second+3))?'mark':'span');node.textContent=c;$('vig-cipher').append(node);});
      $('vig-distance-note').textContent=selectedRepeat?'Distance '+selectedRepeat.distance+(selectedRepeat.distance%period===0?' is divisible by ':' is not divisible by ')+period+'. A compatible spacing suggests a period; it does not prove one.':'Choose a repeated fragment, then compare candidate periods.';
      $('vig-columns').textContent='';
      groups.forEach((group,i)=>{
        const card=d.createElement('div');card.className='column-card';const label=d.createElement('label');label.htmlFor='vig-key-'+i;label.textContent='Column '+(i+1)+' key letter';
        const select=d.createElement('select');select.id=label.htmlFor;
        ABC.split('').forEach(c=>{const o=d.createElement('option');o.value=c;o.textContent=c;select.append(o);});
        const preview=d.createElement('output');preview.className='cipher-strip';preview.id='vig-preview-'+i;
        const rank=rankShifts(group);const suggest=d.createElement('button');suggest.type='button';suggest.textContent='Try best English fit ('+rank[0].key+')';
        const evidence=d.createElement('details');const summary=d.createElement('summary');summary.textContent='Inspect all 26 shifts';const list=d.createElement('ol');
        rank.forEach(r=>{const li=d.createElement('li');li.textContent=r.key+' — χ² '+r.score.toFixed(1)+' — '+r.text.slice(0,24);list.append(li);});evidence.append(summary,list);
        select.addEventListener('change',updateKey);suggest.addEventListener('click',()=>{select.value=rank[0].key;updateKey();});
        card.append(label,select,preview,suggest,evidence);$('vig-columns').append(card);
      });updateKey();
    }
    function updateKey() {
      const period=Number($('vig-period').value), groups=columns(vigCipher,period);let key='';
      groups.forEach((group,i)=>{const c=$('vig-key-'+i).value;key+=c;$('vig-preview-'+i).textContent=vigenere(group,c,true);});
      $('vig-key-display').textContent=key;$('vig-result').textContent=vigenere(vigCipher,key,true);$('vig-status').textContent='Candidate key only. Read the full result and check it against the supplied exercise.';
    }
    $('vig-period').addEventListener('change',drawVig);
    $('vig-check').addEventListener('click',()=>{$('vig-status').textContent=$('vig-result').textContent===letters(DISPATCH)?'Matches the supplied plaintext. LAMP is the generating key; repeating it (for example LAMPLAMP) describes the same stream. A matching toy answer is not evidence of a historical message.':'This candidate does not recover the supplied message. Try another period and inspect the column shifts.';});
    $('vig-reveal').addEventListener('click',()=>{$('vig-period').value='4';drawVig();VIG_KEY.split('').forEach((c,i)=>{$('vig-key-'+i).value=c;});updateKey();$('vig-status').textContent='Answer revealed: LAMP. Revisit the highlighted repeats and four column distributions to explain why it works.';});
    drawVig();

    // Explicitly small, original modern-language samples with disclosed normalization.
    SAMPLES.forEach(sample=>{const option=d.createElement('option');option.value=sample.id;option.textContent=sample.name;$('language-sample').append(option);});
    function drawLanguage() {
      const sample=SAMPLES.find(s=>s.id===$('language-sample').value), freq=counts(sample.text), n=letters(sample.text).length;
      $('language-text').textContent=sample.text;
      $('language-counts').textContent=freq.map(([c,count])=>c+': '+count+' ('+(100*count/n).toFixed(1)+'%)').join(' · ');
      $('language-pairs').textContent=bigrams(sample.text).map(([pair,count])=>pair+': '+count).join(' · ');
      $('language-words').textContent=Array.from(new Set(sample.text.match(/\b[A-Z]{1,3}\b/g)||[])).join(', ');
      $('language-comparison').textContent='This '+n+'-letter '+sample.name+' sample peaks at '+freq.filter(row=>row[1]===freq[0][1]).map(row=>row[0]).join('/')+'. The notice in lesson 1 peaks at O (24 occurrences). Even two texts in the same language can have different distributions. These samples cannot identify a language or supply a historical frequency model.';
    }
    $('language-sample').addEventListener('change',drawLanguage);drawLanguage();
    function bars(id,rows,total) {
      $(id).textContent='';rows.forEach(([symbol,n])=>{const row=d.createElement('div');row.className='frequency-row';const label=d.createElement('span');label.textContent=symbol;const meter=d.createElement('meter');meter.min=0;meter.max=total;meter.value=n;meter.setAttribute('aria-label',symbol+': '+n+' of '+total);const count=d.createElement('span');count.textContent=n;row.append(label,meter,count);$(id).append(row);});
    }
    function drawHomophones() {
      const n=Number($('homophone-count').value), original=homophones(NOTICE,1), changed=homophones(NOTICE,n);
      bars('homophone-before',original.frequencies,original.tokens.length);bars('homophone-after',changed.frequencies,changed.tokens.length);
      $('homophone-output').textContent=changed.tokens.join(' ');
      $('homophone-status').textContent='O has '+n+' possible token(s), selected independently with equal probability in this toy. Its 24 occurrences are distributed among '+new Set(changed.tokens.filter(t=>changed.key[t]==='O')).size+' observed token(s). The expected count per O-token is '+(24/n).toFixed(1)+', but a sample can vary. The other letters still have one token each.';
    }
    $('homophone-count').addEventListener('change',drawHomophones);$('homophone-rerun').addEventListener('click',drawHomophones);drawHomophones();
  }
  if(typeof document!=='undefined') {if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);else boot();}
})(typeof window!=='undefined'?window:globalThis);
