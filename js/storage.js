(function(){
  const KEY='ktp-2026-27-v3';
  const legacyDone='ktp-2026-27-done-v1';
  const baseState=()=>({version:3,topics:{},plans:{},notes:{},history:[],ui:{view:'timeline',density:'comfortable',collapsedGrades:[],focusRow:null,replan:false,shiftFollowing:true}});
  const clone=v=>JSON.parse(JSON.stringify(v));
  function normalize(input){
    const out=baseState();
    if(!input||typeof input!=='object')return out;
    out.topics=input.topics&&typeof input.topics==='object'?input.topics:{};
    out.plans=input.plans&&typeof input.plans==='object'?input.plans:{};
    out.notes=input.notes&&typeof input.notes==='object'?input.notes:{};
    out.history=Array.isArray(input.history)?input.history.slice(-300):[];
    out.ui={...out.ui,...(input.ui||{})};
    out.ui.collapsedGrades=Array.isArray(out.ui.collapsedGrades)?out.ui.collapsedGrades:[];
    out.version=3;return out;
  }
  function migrateLegacy(state){
    try{const legacy=JSON.parse(localStorage.getItem(legacyDone)||'[]');if(Array.isArray(legacy)&&legacy.length&&!Object.keys(state.topics).length){legacy.forEach(id=>{state.topics[id]={status:'done'};});}}catch(_e){}
    return state;
  }
  function load(){try{return migrateLegacy(normalize(JSON.parse(localStorage.getItem(KEY)||'null')))}catch(_e){return baseState()}}
  function save(state){localStorage.setItem(KEY,JSON.stringify(normalize(state)))}
  function addHistory(state,event){state.history.push({id:`h-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,at:new Date().toISOString(),...event});if(state.history.length>300)state.history=state.history.slice(-300);save(state)}
  function exportState(state){return JSON.stringify({schema:'ktp-3',exportedAt:new Date().toISOString(),state:normalize(state)},null,2)}
  function importState(text){const parsed=JSON.parse(text),source=parsed&&parsed.schema==='ktp-3'?parsed.state:parsed;return normalize(source)}
  window.KTP_STORE={KEY,load,save,addHistory,exportState,importState,clone};
})();