import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const w={window:{},Math};const ctx=vm.createContext(w);
for(const p of [
 'geometry/vector-math.js','geometry/coordinate-math.js',
 'lessons/11-geometry-atanasyan/04/question-bank.js',
 'lessons/11-geometry-atanasyan/05/question-bank.js',
 'lessons/11-geometry-atanasyan/06/question-bank.js',
 'labs/11-geometry-atanasyan/review-route/math.js'
])vm.runInContext(read(p),ctx,{filename:p});
const router=w.window.KTP_G11_REVIEW_ROUTER;
let count=0;const test=(condition,message)=>{count++;if(!condition)throw Error(message);};
test(router.domains.length===10,'ten independent diagnostic domains');
for(let variant=1;variant<=60;variant++){
 const initial=router.diagnostic(variant);
 test(initial.length===10,'ten initial questions for backwards-compatible /20 score');
 for(const domain of router.domains){
  const key=domain.id,q0=router.quiz(key,variant,0),q1=router.confirm(key,variant);
  const repair=router.correction(key,variant);
  test(initial.some(x=>x.domain===key),'initial covers '+key);
  test(q0.prompt!==q1.prompt,'independent confirmation task '+key+'/'+variant);
  test(q1.index===1&&repair.length===2&&repair[0].index===3&&repair[1].index===5,'non-overlapping indices '+key+'/'+variant);
  test(repair.every(q=>q.prompt!==q1.prompt),'confirmation differs from correction '+key+'/'+variant);
  for(const q of [q0,q1,...repair]){
   test(q.options.length===4&&new Set(q.options).size===4,'four unique options '+key+'/'+variant+'/'+q.index);
   test(q.correct>=0&&q.correct<4&&q.options[q.correct]===q.answer,'answer preserved '+key+'/'+variant+'/'+q.index);
   test(q.options.filter(x=>x===q.answer).length===1,'exactly one valid answer '+key+'/'+variant+'/'+q.index);
   test(q.prompt&&q.solution,'complete item '+key+'/'+variant+'/'+q.index);
  }
  const full=router.grade([q0,q1],[q0.correct,q1.correct]);
  test(full.score===4&&full.maxScore===4,'two-answer score '+key+'/'+variant);
  const wrong=router.grade([q0,q1],[(q0.correct+1)%4,q1.correct]);
  test(wrong.score===2,'single correct evidence '+key+'/'+variant);
  const pending=router.evidence(true,null,null);
  test(pending.status==='provisional'&&!pending.confirmed&&pending.observed===1,'do not conclude from one item');
  const confirmed=router.evidence(true,true,null);
  test(confirmed.confirmed&&confirmed.correct===2&&confirmed.observed===2,'two items independently confirm');
  const weak=router.evidence(true,false,null);
  test(weak.status==='needs-work'&&!weak.confirmed&&weak.correct===1,'mixed evidence requests follow-up');
  test(router.evidence(false,false,true).status==='remediated','correction distinct from proficiency');
 }
}
for(const index of [0,1,3,5]){
 const q=router.quiz('proof',1,index);
 test(q.options.slice().filter(x=>x!==q.answer).every(x=>x.length>15),'plausible proof distractors '+index);
}
console.log('P1.4 confirmatory diagnostics QA: '+count+' checks across 60 variants and 10 domains.');
