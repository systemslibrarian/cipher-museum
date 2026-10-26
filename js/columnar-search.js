/* Bounded adaptation of George Lasry, A Methodology for the Cryptanalysis of
 * Classical Ciphers with Search Metaheuristics (2018), §§5.3.2–5.3.4. */
(function(root) {
  'use strict';
  function rng(seed) { let x=seed>>>0; return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;}; }
  function permutation(order) { return Array.isArray(order)&&order.length>=2&&order.every(x=>Number.isInteger(x)&&x>=0&&x<order.length)&&new Set(order).size===order.length; }
  function columns(text,order) {
    if(!permutation(order)) throw Error('Invalid column permutation.');
    const k=order.length,r=Math.floor(text.length/k),u=text.length%k, cols=Array(k), starts=[];
    let at=0;
    order.forEach((original,rank)=>{starts[rank]=at;const n=r+(original<u?1:0);cols[original]=text.slice(at,at+n);at+=n;});
    return {cols,starts};
  }
  function decrypt(text,order) {
    const {cols}=columns(text,order);let out='';
    for(let row=0;row<Math.ceil(text.length/order.length);row++) for(const col of cols) if(row<col.length)out+=col[row];
    return out;
  }
  function encrypt(text,order) {if(!permutation(order))throw Error('Invalid column permutation.');return order.map(c=>{let out='';for(let i=c;i<text.length;i+=order.length)out+=text[i];return out;}).join('');}
  function shuffle(order,random) {const a=order.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function move(order,random,segments=true) {
    const a=order.slice(),k=a.length,kind=segments?Math.floor(random()*3):0;
    if(kind===0){const i=Math.floor(random()*k);let j=Math.floor(random()*(k-1));if(j>=i)j++;[a[i],a[j]]=[a[j],a[i]];return a;}
    const length=1+Math.floor(random()*Math.floor(k/2));
    if(kind===1){const start=Math.floor(random()*(k-length+1)),part=a.splice(start,length),at=Math.floor(random()*(a.length+1));a.splice(at,0,...part);return a;}
    const left=Math.floor(random()*(k-2*length+1)),right=left+length+Math.floor(random()*(k-left-2*length+1));
    for(let i=0;i<length;i++)[a[left+i],a[right+i]]=[a[right+i],a[left+i]];return a;
  }
  function solve(text,options={},model=root.DetectiveLangModel) {
    text=String(text).toUpperCase().replace(/[^A-Z]/g,'');
    const width=options.width,budget=options.budget??6000,restarts=options.restarts??4,seed=options.seed??2018;
    if(!Number.isInteger(width)||width<2||width>12||text.length<width*2||text.length>2000)throw Error('Use width 2–12 and 2–2000 letters per columnar task (at least two full rows).');
    if(!Number.isInteger(budget)||budget<100||budget>20000||!Number.isInteger(restarts)||restarts<1||restarts>8||!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw Error('Use 100–20000 evaluations, 1–8 restarts and an unsigned 32-bit seed.');
    const random=rng(seed),r=Math.floor(text.length/width),u=text.length%width,staged=options.staged!==false,alignment=options.alignment!==false;
    let evaluations=0,preprocessing=0,best=null;
    const matrix=Array.from({length:width},()=>Array(width));
    if(staged){
      const positions=Array.from({length:width},(_,i)=>Array.from({length:Math.min(i,u)-Math.max(0,u-(width-i))+1},(_,j)=>i*r+Math.max(0,u-(width-i))+j));
      for(let i=0;i<width;i++)for(let j=0;j<width;j++)if(i!==j){
        let score=-Infinity,offset=0;
        for(const a of positions[i])for(const b of positions[j]){
          if(evaluations>=budget-2*restarts)return {best:null,evaluations,preprocessing:evaluations,seed,width,reason:'Preprocessing exhausted the declared budget; increase it or disable staged scoring.'};
          let value=0;for(let row=0;row<r;row++)value+=model.BIGRAM_LOG[text[a+row]+text[b+row]]??model.BIGRAM_FLOOR;
          evaluations++;
          if(value>score){score=value;offset=((b-a)%r+r)%r;}
        }
        matrix[i][j]={score,offset};
      }
      preprocessing=evaluations;
    }
    function adjacency(order){
      const {starts}=columns(text,order),rank=Array(width);order.forEach((col,i)=>rank[col]=i);
      let score=0,align=0,previous=false;
      for(let col=0;col<width-1;col++){
        const i=rank[col],j=rank[col+1],entry=matrix[i][j];score+=entry.score;
        const matches=((starts[j]-starts[i])%r+r)%r===entry.offset;
        if(matches)align+=2+(previous?1:0);previous=matches;
      }
      return score/(r*(width-1))+(u&&alignment?align/(3*(width-1)):0);
    }
    const remaining=budget-evaluations;
    for(let restart=0;restart<restarts;restart++){
      const quota=Math.floor(remaining/restarts)+(restart<remaining%restarts?1:0),end=evaluations+quota;
      let order=shuffle(Array.from({length:width},(_,i)=>i),random),current=-Infinity;
      const stageEnd=evaluations+(staged?Math.floor(quota/3):0);
      if(staged){current=adjacency(order);evaluations++;while(evaluations<stageEnd){const candidate=move(order,random,options.segments!==false),score=adjacency(candidate);evaluations++;if(score>current){order=candidate;current=score;}}}
      let plain=decrypt(text,order);current=model.fitness(plain);evaluations++;
      if(!best||current>best.score)best={order:order.slice(),plaintext:plain,score:current};
      while(evaluations<end){const candidate=move(order,random,options.segments!==false),p=decrypt(text,candidate),score=model.fitness(p);evaluations++;if(score>current){order=candidate;plain=p;current=score;if(score>best.score)best={order:order.slice(),plaintext:plain,score};}}
    }
    return {best,evaluations,preprocessing,seed,width,restarts,reason:'Best candidate within budget; correctness and uniqueness are unverified.'};
  }
  function unknownWidth(text,options={},model=root.DetectiveLangModel){
    const widths=options.widths??[2,3,4,5,6,7,8,9,10,11,12],budget=options.budget??20000;
    if(!Array.isArray(widths)||!widths.length||new Set(widths).size!==widths.length||widths.some(k=>!Number.isInteger(k)||k<2||k>12)||!Number.isInteger(budget)||budget>20000||budget<100*widths.length)throw Error('Invalid outer width budget.');
    const results=widths.map((width,i)=>solve(text,{...options,width,budget:Math.floor(budget/widths.length)+(i<budget%widths.length?1:0)},model));
    return {results,budget,evaluations:results.reduce((n,r)=>n+r.evaluations,0),best:results.filter(r=>r.best).sort((a,b)=>b.best.score-a.best.score)[0]??null};
  }
  const api={rng,columns,decrypt,encrypt,move,solve,unknownWidth};root.ColumnarSearch=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
