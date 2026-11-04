'use strict';
(function(global){
  function build(data){
    if(!data||data.id!=='museum-prose-quadgram-v1'||data.version!==1)throw new Error('Unsupported homophonic language model.');
    const qfloor=Math.log(data.floorCount/data.quadTotal),tfloor=Math.log(data.floorCount/data.triTotal);
    const quad=new Float64Array(26**4).fill(qfloor),tri=new Float64Array(26**3).fill(tfloor);
    data.quad.forEach(([i,n])=>{quad[i]=Math.log(n/data.quadTotal);});data.tri.forEach(([i,n])=>{tri[i]=Math.log(n/data.triTotal);});
    const letterLogs=data.letters.map(n=>Math.log(n/data.letterTotal));
    function fitness(text){
      const n=text.length,counts=new Uint16Array(26);let score=0,last=0;
      for(let i=0;i<n;i++){
        const c=text.charCodeAt(i)-65;if(c<0||c>25)throw new Error('Language model accepts uppercase A–Z only.');counts[c]++;
        last=(last%17576)*26+c;
        if(i>=3)score+=quad[last];else if(i===2&&n===3)score+=tri[last];
      }
      // A declared unigram-distribution penalty discourages collapsed letter keys.
      for(let c=0;c<26;c++)if(counts[c])score-=data.frequencyPenalty*counts[c]*(Math.log(counts[c]/n)-letterLogs[c]);
      return score;
    }
    fitness.modelId=data.id;return{fitness,id:data.id};
  }
  // ── Versioned historical-language profiles ──────────────────────────────
  // Each profile scores letters A–Z under its own corpus. Scores from different
  // profiles are NOT comparable as raw likelihoods, so comparison uses the mean
  // log-probability per letter and reports a margin, never a probability.
  function profileScorer(p){
    const qfloor=Math.log(p.floorCount/p.quadTotal),tfloor=Math.log(p.floorCount/p.triTotal);
    const quad=new Float64Array(26**4).fill(qfloor),tri=new Float64Array(26**3).fill(tfloor);
    const seenQuad=new Uint8Array(26**4);
    p.quad.forEach(([i,n])=>{quad[i]=Math.log(n/p.quadTotal);seenQuad[i]=1;});
    p.tri.forEach(([i,n])=>{tri[i]=Math.log(n/p.triTotal);});
    const letterLogs=p.letters.map(n=>Math.log((n||p.floorCount)/p.letterTotal));
    function read(text){
      const n=text.length,counts=new Uint16Array(26);let score=0,last=0,grams=0,seen=0;
      for(let i=0;i<n;i++){
        const c=text.charCodeAt(i)-65;
        if(c<0||c>25)throw new Error('Language profiles accept uppercase A–Z only.');
        counts[c]++;last=(last%17576)*26+c;
        if(i>=3){score+=quad[last];grams++;if(seenQuad[last])seen++;}
        else if(i===2&&n===3)score+=tri[last];
      }
      for(let c=0;c<26;c++)if(counts[c])score-=p.frequencyPenalty*counts[c]*(Math.log(counts[c]/n)-letterLogs[c]);
      return{score,letters:n,grams,coverage:grams?seen/grams:0,meanLogProbability:n?score/n:0};
    }
    function fitness(text){return read(text).score;}
    fitness.modelId=p.id;
    // Decomposable view for the segmentation lattice: the increment a reading adds,
    // given the text before it. Exact for this quadgram sum apart from the declared
    // unigram-distribution penalty, which depends on the whole string.
    fitness.step=function(prefix,reading){
      if(!reading)return 0;
      const a=prefix?read(prefix).score:0,b=read(prefix+reading).score;
      return b-a;
    };
    return{id:p.id,language:p.language,period:p.period,fitness,read,meta:p};
  }
  function buildProfiles(data){
    if(!data||data.id!=='museum-language-profiles-v1'||data.version!==1)throw new Error('Unsupported historical-language profile set.');
    const profiles=data.profiles.map(profileScorer),byId={};
    profiles.forEach(p=>{byId[p.id]=p;});
    const rule=data.abstention;
    // Compare language hypotheses, and decline when the evidence does not separate them.
    function compare(text,ids){
      const chosen=(ids&&ids.length?ids:profiles.map(p=>p.id)).map(id=>{
        const p=byId[id];if(!p)throw new Error('Unknown language profile: '+id);return p;});
      if(chosen.length<2)throw new Error('Comparing language hypotheses needs at least two profiles.');
      const rows=chosen.map(p=>{const r=p.read(text);
        return{id:p.id,language:p.language,period:p.period,meanLogProbability:r.meanLogProbability,
          coverage:r.coverage,letters:r.letters};});
      rows.sort((a,b)=>b.meanLogProbability-a.meanLogProbability);
      const margin=rows.length>1?rows[0].meanLogProbability-rows[1].meanLogProbability:0;
      const reasons=[];
      if(rows[0].letters<rule.minimumLetters)reasons.push('Input is '+rows[0].letters+' letters; at least '+rule.minimumLetters+' are required.');
      if(margin<rule.minimumMargin)reasons.push('Margin '+margin.toFixed(3)+' is below the declared '+rule.minimumMargin+'.');
      if(rows[0].coverage<rule.minimumCoverage)reasons.push('Best profile covers only '+(100*rows[0].coverage).toFixed(1)+'% of this text\u2019s quadgrams; at least '+(100*rule.minimumCoverage).toFixed(0)+'% are required.');
      return{ranking:rows,margin,decided:reasons.length===0,
        choice:reasons.length?null:rows[0].id,abstentionReasons:reasons,
        rule:rule,
        meaning:'Ranking by mean log-probability per letter under each profile. This is not a probability that the text is in that language, and a language absent from the profile set can never be chosen.'};
    }
    return{id:data.id,version:data.version,profiles,byId,compare,abstention:rule,baseline:data.baseline};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={build,buildProfiles};
  global.MuseumResearchLanguage={build,buildProfiles};
})(typeof window!=='undefined'?window:globalThis);
