/* General Report on Tunny (Good, Michie, Timms, 1945), §§23A–C.
 * Bounded two-wheel statistical experiment, not a full Colossus emulator. */
(function (root) {
  'use strict';
  function rng(seed) { let x=seed>>>0; return () => { x=(Math.imul(x,1664525)+1013904223)>>>0; return x/4294967296; }; }
  function delta(bits) { return bits.slice(1).map((x,i)=>x^bits[i]); }
  function validate(z, patterns) {
    if (!Array.isArray(z) || z.length<2 || z.length>4096 || z.some(x=>!Number.isInteger(x)||x<0||x>31)) throw Error('Use 2–4096 five-bit symbols.');
    if (patterns.length!==2 || patterns.some((p,i)=>p.length!==[41,31][i] || p.some(b=>b!==0&&b!==1))) throw Error('Known binary chi patterns must have lengths 41 and 31.');
  }
  function rank(z, patterns) {
    validate(z,patterns);
    const dz=delta(z).map(x=>(x&1)^((x>>>1)&1));
    const wheels=patterns.map(p=>p.map((x,i)=>x^p[(i+1)%p.length]));
    const scores=[];
    for(let a=0;a<41;a++) for(let b=0;b<31;b++) {
      let dots=0;
      for(let t=0;t<dz.length;t++) if ((dz[t]^wheels[0][(a+t)%41]^wheels[1][(b+t)%31])===0) dots++;
      scores.push({a,b,dots,sigma:(dots-dz.length/2)/Math.sqrt(dz.length/4)});
    }
    return scores.sort((a,b)=>b.dots-a.dots||a.a-b.a||a.b-b.b);
  }
  function fixture(length=1024, noise=0, seed=1945) {
    if (![64,256,1024,4096].includes(length) || !Number.isFinite(noise) || noise<0 || noise>0.5) throw Error('Invalid fixture settings.');
    const random=rng(seed), patterns=[41,31].map(n=>Array.from({length:n},()=>random()<0.5?0:1));
    const truth={a:Math.floor(random()*41),b:Math.floor(random()*31)};
    // D is a synthetic residual stream, not German plaintext or a psi-wheel emulator.
    // Its impulse-1 XOR impulse-2 parity changes with probability .30 (plus noise).
    let parity=0;
    const residual=[], ciphertext=[];
    for(let t=0;t<length;t++) {
      if(t && ((random()<0.30 ? 1:0) ^ (random()<noise ? 1:0))) parity^=1;
      const first=random()<0.5?0:1;
      const d=first|((first^parity)<<1)|(Math.floor(random()*8)<<2);
      residual.push(d);
      ciphertext.push(d^patterns[0][(truth.a+t)%41]^(patterns[1][(truth.b+t)%31]<<1));
    }
    return {patterns,truth,residual,ciphertext};
  }
  function experiment(length,noise,seed=1945) {
    const data=fixture(length,noise,seed), ranked=rank(data.ciphertext,data.patterns), random=rng(seed^0x7194);
    // Compare the selected maximum with selected maxima under an explicit iid null.
    const nullMaxima=Array.from({length:39},()=>rank(Array.from({length},()=>Math.floor(random()*32)),data.patterns)[0].dots);
    const exceed=nullMaxima.filter(n=>n>=ranked[0].dots).length;
    const familywiseEstimate=(exceed+1)/(nullMaxima.length+1);
    const truthRank=ranked.findIndex(s=>s.a===data.truth.a&&s.b===data.truth.b)+1;
    return { ...data, ranked, nullMaxima, familywiseEstimate, truthRank,
      conclusion: familywiseEstimate<=0.05 && ranked[0].dots>ranked[1].dots ? 'Evidence for further investigation under the synthetic model; not a decryption.' : 'Inconclusive after searching 1,271 settings.' };
  }
  const api={delta,rank,fixture,experiment};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.ChiSetting=api;
  if(typeof document!=='undefined') {
    const button=document.getElementById('chi-run');
    if(button) button.addEventListener('click',()=>{
      const output=document.getElementById('chi-results');
      const length=Number(document.getElementById('chi-length').value),noise=Number(document.getElementById('chi-noise').value);
      button.disabled=true; output.textContent='Counting all settings and 39 null searches…';
      setTimeout(()=>{try {
        const r=experiment(length,noise);
        const preselected=r.ranked.find(s=>s.a===0&&s.b===0);
        output.innerHTML='<p>Preselected offsets (0, 0), fixed before inspecting the tape: '+preselected.dots+' dots; pointwise sigma '+preselected.sigma.toFixed(2)+'. Compare this one setting with the selected maximum below.</p><p>'+r.conclusion+'</p><p>'+length+' five-bit symbols; '+(length-1)+' adjacent differences. Selected maximum: '+r.ranked[0].dots+' dots. Pointwise sigma: '+r.ranked[0].sigma.toFixed(2)+'. This pointwise score ignores selection among 1,271 settings.</p><p>Whole-search Monte Carlo estimate: '+r.familywiseEstimate.toFixed(3)+' (39 independent null searches; minimum reportable estimate 0.025). This coarse model-dependent estimate is not historical confidence or a proof.</p><table class="cipher-table"><thead><tr><th>chi 1 offset</th><th>chi 2 offset</th><th>Dots</th></tr></thead><tbody>'+r.ranked.slice(0,5).map(s=>'<tr><td>'+s.a+'</td><td>'+s.b+'</td><td>'+s.dots+'</td></tr>').join('')+'</tbody></table><details><summary>Inspect fixture truth and known wheel patterns</summary><p>True offsets '+r.truth.a+', '+r.truth.b+'; rank '+r.truthRank+'. Truth is checked only after ranking.</p><p>chi 1: '+r.patterns[0].join('')+'</p><p>chi 2: '+r.patterns[1].join('')+'</p><p>First 12 ciphertext symbols: '+r.ciphertext.slice(0,12).map(n=>n.toString(2).padStart(5,'0')).join(' ')+'</p></details>';
      }catch(e){output.textContent=e.message;}finally{button.disabled=false;}},0);
    });
  }
})(typeof window!=='undefined'?window:globalThis);
