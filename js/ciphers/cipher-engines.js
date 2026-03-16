/**
 * THE CIPHER MUSEUM — Vigenère Cipher Engine
 */
'use strict';
const VigenereCipher = (() => {
  function run(text, key, enc) {
    const t = text.toUpperCase().replace(/[^A-Z]/g,'');
    const k = key.toUpperCase().replace(/[^A-Z]/g,'')||'KEY';
    let out='', steps=[];
    for(let i=0;i<t.length;i++){
      const p=t.charCodeAt(i)-65, ki=k.charCodeAt(i%k.length)-65;
      const c=enc?(p+ki)%26:(p-ki+26)%26;
      out+='ABCDEFGHIJKLMNOPQRSTUVWXYZ'[c];
      steps.push({plain:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[enc?p:c],key:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[ki],cipher:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[enc?c:p]});
    }
    return {out, steps};
  }
  return {encode:(t,k)=>run(t,k,true), decode:(t,k)=>run(t,k,false)};
})();

/**
 * THE CIPHER MUSEUM — Rail Fence Cipher Engine
 */
const RailFenceCipher = (() => {
  function encode(text, rails) {
    const t=text.toUpperCase().replace(/[^A-Z]/g,'');
    if(rails<2) return t;
    const fence=Array.from({length:rails},()=>[]);
    let rail=0, dir=1;
    for(const ch of t){
      fence[rail].push(ch);
      if(rail===0) dir=1;
      else if(rail===rails-1) dir=-1;
      rail+=dir;
    }
    return fence.map(r=>r.join('')).join('');
  }
  function decode(text, rails) {
    const n=text.length;
    if(rails<2) return text;
    const pattern=Array(n).fill(0);
    let rail=0, dir=1;
    for(let i=0;i<n;i++){
      pattern[i]=rail;
      if(rail===0) dir=1;
      else if(rail===rails-1) dir=-1;
      rail+=dir;
    }
    const indices=Array.from({length:rails},(_,r)=>pattern.map((p,i)=>p===r?i:-1).filter(x=>x>=0));
    const result=Array(n);
    let pos=0;
    for(let r=0;r<rails;r++) for(const idx of indices[r]) result[idx]=text[pos++];
    return result.join('');
  }
  return {encode, decode};
})();

/**
 * THE CIPHER MUSEUM — Columnar Transposition Engine  
 */
const ColumnarCipher = (() => {
  function getOrder(key) {
    return key.toUpperCase().replace(/[^A-Z]/g,'').split('')
      .map((ch,i)=>({ch,i}))
      .sort((a,b)=>a.ch===b.ch?a.i-b.i:a.ch.localeCompare(b.ch))
      .map(x=>x.i);
  }
  function encode(text, key) {
    const t=text.toUpperCase().replace(/[^A-Z]/g,'');
    const k=key.toUpperCase().replace(/[^A-Z]/g,'')||'KEY';
    const cols=k.length, rows=Math.ceil(t.length/cols);
    const grid=Array.from({length:rows},()=>Array(cols).fill('X'));
    let idx=0;
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) if(idx<t.length) grid[r][c]=t[idx++];
    const order=getOrder(k);
    return order.map(c=>grid.map(r=>r[c]).join('')).join('');
  }
  function decode(text, key) {
    const k=key.toUpperCase().replace(/[^A-Z]/g,'')||'KEY';
    const cols=k.length, rows=Math.ceil(text.length/cols);
    const order=getOrder(k);
    const colLens=Array(cols).fill(rows);
    const extra=text.length%cols;
    if(extra>0) for(let i=extra;i<cols;i++) if(order.indexOf(i)>=extra) colLens[i]--;
    const columns={};
    let pos=0;
    for(const c of order){ columns[c]=text.substr(pos,colLens[c]).split(''); pos+=colLens[c]; }
    const result=[];
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) if(columns[c]&&columns[c][r]) result.push(columns[c][r]);
    return result.join('');
  }
  return {encode, decode};
})();
