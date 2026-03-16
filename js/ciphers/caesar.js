/**
 * THE CIPHER MUSEUM — Caesar Cipher Engine
 * Exhibit 01 · Ancient Rome · ~58 BC
 */
'use strict';
const CaesarCipher = (() => {
  function shift(text, n, encode) {
    const s = encode ? ((n%26)+26)%26 : ((26-n)%26);
    return text.split('').map(ch => {
      const c = ch.charCodeAt(0);
      if (c>=65&&c<=90) return String.fromCharCode(((c-65+s)%26)+65);
      if (c>=97&&c<=122) return String.fromCharCode(((c-97+s)%26)+97);
      return ch;
    }).join('');
  }
  const encode = (text, key) => shift(text, parseInt(key)||0, true);
  const decode = (text, key) => shift(text, parseInt(key)||0, false);
  const bruteForce = text => Array.from({length:25},(_,i)=>({shift:i+1,text:shift(text,i+1,false)}));
  return { encode, decode, bruteForce };
})();
