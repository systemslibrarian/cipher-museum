(function(){
  'use strict';
  const get=id=>document.getElementById(id),button=get('columnar-search-run');if(!button)return;
  button.addEventListener('click',()=>{
    button.disabled=true;get('columnar-search-output').textContent='Searching within the declared evaluation budget…';
    setTimeout(()=>{try{
      const options={width:Number(get('columnar-search-width').value),seed:Number(get('columnar-search-seed').value),budget:Number(get('columnar-search-budget').value),staged:get('columnar-search-staged').checked,alignment:get('columnar-search-align').checked,segments:get('columnar-search-segments').checked,restarts:Number(get('columnar-search-restarts').value)};
      const text=get('columnar-search-text').value;
      const result=options.width?ColumnarSearch.solve(text,options):ColumnarSearch.unknownWidth(text,options);
      const chosen=options.width?result:result.best;
      get('columnar-search-output').textContent='Score evaluations: '+result.evaluations+' / '+options.budget+'. '+(chosen&&chosen.best?'Width '+chosen.width+'; order '+chosen.best.order.map(x=>x+1).join('-')+'; preprocessing '+chosen.preprocessing+'. Best candidate (unverified):\n'+chosen.best.plaintext:chosen?chosen.reason:'No candidate within the per-width budgets.')+'\nEqual evaluation counts are not equal CPU time. Scores do not certify a decryption or uniqueness.';
    }catch(e){get('columnar-search-output').textContent=e.message;}finally{button.disabled=false;}},0);
  });
})();
