'use strict';
const hc=require('./hill-climbing-solver');
const {rng,move}=require('../js/columnar-search');
function solve(ciphertext,{method='sa',budget=6000,seed=2018,restarts=3}={}) {
  if(!['hc','sa','sa+hc'].includes(method)||!Number.isInteger(budget)||budget<100||!Number.isInteger(restarts)||restarts<1||restarts>8||restarts*2>budget)throw Error('Invalid bounded solver options.');
  const text=hc.cleanText(ciphertext),random=rng(seed),alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let evaluations=0,best=null;
  function evaluate(key){evaluations++;const plaintext=hc.decrypt(text,key);return {key,plaintext,score:hc.scoreText(plaintext)};}
  for(let restart=0;restart<restarts;restart++){
    let key=alphabet.split('');for(let i=25;i>0;i--){const j=Math.floor(random()*(i+1));[key[i],key[j]]=[key[j],key[i]];}
    const quota=Math.floor(budget/restarts)+(restart<budget%restarts?1:0),start=evaluations,end=start+quota;
    let current=evaluate(key.join(''));if(!best||current.score>best.score)best=current;
    while(evaluations<end){
      const progress=(evaluations-start)/quota,anneal=method==='sa'||(method==='sa+hc'&&progress<0.7);
      const candidate=evaluate(move(current.key.split(''),random,false).join(''));
      const temperature=Math.max(0.01,10*Math.pow(0.001,progress));
      if(candidate.score>current.score||(anneal&&random()<Math.exp((candidate.score-current.score)/temperature)))current=candidate;
      if(candidate.score>best.score)best=candidate;
    }
  }
  return {...best,method,evaluations,seed,restarts};
}
function wilson(successes,n){if(!n)return null;const z=1.96,p=successes/n,den=1+z*z/n,center=(p+z*z/(2*n))/den,half=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den;return [center-half,center+half];}
module.exports={solve,wilson};
