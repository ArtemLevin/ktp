import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';
import {createReviewAuditor} from './review-question-audit.mjs';import {grade11GeometryProgress} from './grade11-geometry-progress.mjs';
let checks=0;const check=(v,m)=>{checks++;if(!v)throw Error(m);},read=p=>fs.readFileSync(p,'utf8');
const ctx={window:{}};ctx.KTP_REGISTER_CONTENT=(key,value)=>{ctx.window.topic=value;};
const deps=['js/data.js','geometry/vector-math.js','geometry/coordinate-math.js','geometry/revolution-math.js','geometry/grade11-volume-scenes.js','geometry/grade11-revolution-volume-scenes.js','geometry/grade11-vector-scenes.js','geometry/grade11-coordinate-scenes.js','geometry/grade11-review-scenes.js','lessons/11-geometry-atanasyan/04/question-bank.js','lessons/11-geometry-atanasyan/05/question-bank.js','lessons/11-geometry-atanasyan/06/series.js','lessons/11-geometry-atanasyan/06/definitions.js','lessons/11-geometry-atanasyan/06/question-bank.js','lessons/11-geometry-atanasyan/06/scenes.js','lessons/11-geometry-atanasyan/06/data.js','content/11-geometry-atanasyan/06.js','assessments/11-geometry-atanasyan/06/data.js','labs/11-geometry-atanasyan/review-route/math.js'];
for(const p of deps)vm.runInNewContext(read(p),ctx,{filename:p});
const S=ctx.window.KTP_LESSON_SERIES,A=ctx.window.KTP_ASSESSMENT_DATA,T=ctx.window.topic,R=ctx.window.KTP_G11_REVIEW_ROUTER,pool=ctx.window.KTP_G11_REVIEW_QUESTION_POOL,audit=createReviewAuditor(check),defs=ctx.window.KTP_G11_REVIEW_DEFINITIONS;
for(const mode of defs.map(d=>d.mode))for(let v=1;v<=60;v++){const bank=pool(mode,v);check(bank.length===10&&bank[4].errorAnalysis,mode+' bank dimensions/error');bank.forEach((q,i)=>audit(q,mode+'/'+v+'/'+i));}
let assessed=0;
check(S.meta.courseLessonStart===57&&S.meta.courseLessonEnd===68&&S.lessons.length===12,'range 57–68');
for(const [i,L] of S.lessons.entries()){
 check(L.globalNumber===i+57&&L.week===29+Math.floor(i/2),'global lesson/week');check(L.theory.length===3&&L.examples.length===3&&L.practice.length===8&&L.mistakes.every(m=>m.title&&m.explanation),'lesson content');check(L.homework.required.length===6&&L.homework.optional.length===2,'homework');
 for(const ex of L.examples)audit({text:ex.problem,answerCore:ex.answer,answer:ex.answer,skill:ex.title,solution:ex.solution,audit:ex.audit,auditOrigin:ex.auditOrigin,skillId:ex.skillId},L.id+'/example');
 for(const q of [...L.practice,...L.homework.required,...L.homework.optional])audit(q,L.id+'/practice');
 for(const kind of ['independent','control']){const work=L[kind],n=i===10?(kind==='independent'?7:10):(kind==='independent'?5:6),max=i===10?(kind==='independent'?14:20):(kind==='independent'?10:14);
  check(work.variants.length===6&&work.maxScore===max,'lesson work dimensions');const signatures=new Set();
  for(const v of work.variants){check(v.tasks.length===n&&v.tasks.reduce((s,q)=>s+q.points,0)===max,'lesson variant points');check(v.tasks.some(q=>q.errorAnalysis),'lesson error slot');signatures.add(JSON.stringify(v.tasks.map(q=>q.text)));for(const q of v.tasks){audit(q,L.id+'/'+kind);assessed++;}}
  check(signatures.size===6,'six distinct lesson variants '+L.id+'/'+kind);
 }
}
check(assessed===828,'828 lesson tasks');
// Reused coordinate tasks must retain genuine answer diversity in the final course.
for(const [mode,index,count,min] of [
 ['vectors',0,6,6],['metric',0,8,4],['metric',1,6,6]
]){
 const answers=Array.from({length:count},(_,v)=>pool(mode,v+1)[index].answerCore);
 check(new Set(answers).size>=min,'review diagnostic answer diversity '+mode+'/'+index);
}
const domains=R.domains.map(d=>d.id);
for(const [kind,n,max] of [['independent',7,14],['control',10,20]]){const work=A.topic[kind];check(work.variants.length===6&&work.maxScore===max,'thematic dimensions');const signatures=new Set();for(const v of work.variants){check(v.tasks.length===n&&v.tasks.reduce((s,q)=>s+q.points,0)===max,'thematic points');signatures.add(JSON.stringify(v.tasks.map(q=>q.text)));v.tasks.forEach(q=>audit(q,kind+'/'+v.id));check(v.tasks.at(-1).errorAnalysis,'thematic error');if(kind==='control')check(new Set(v.tasks.map(q=>q.domain)).size===10&&domains.every(d=>v.tasks.some(q=>q.domain===d)),'all ten domains in final control');}check(signatures.size===6,'six distinct thematic variants');}
for(let v=1;v<=60;v++){
 const qs=R.diagnostic(v);check(qs.length===10&&new Set(qs.map(q=>q.domain)).size===10,'ten diagnostic domains');
 for(const q of qs){check(q.options.length===4&&new Set(q.options).size===4&&q.correct>=0&&q.options[q.correct]===q.answer,'quiz options');}
 const correct=qs.map(q=>q.correct),wrong=qs.map(q=>(q.correct+1)%4);check(R.grade(qs,correct).score===20&&R.grade(qs,wrong).score===0,'grade extremes');
 const mixed=correct.map((x,i)=>i===0?(x+1)%4:x);check(R.grade(qs,mixed).score===18&&R.grade(qs,mixed).results[0].correct===false,'one weak domain');
 for(const domain of domains){const next=v%60+1,questions=R.correction(domain,next);check(questions.length===2&&questions.every(q=>q.variant===next)&&questions.every(q=>q.prompt!==qs.find(p=>p.domain===domain).prompt),'two new correction tasks');check(R.grade(questions,questions.map(q=>q.correct)).score===4,'both pass');const one=questions.map(q=>q.correct);one[1]=(one[1]+1)%4;check(R.grade(questions,one).score===2,'one alone does not pass');}
}
for(const fn of [()=>R.quiz('unknown',1),()=>R.quiz('surface',0),()=>R.quiz('surface',1,9),()=>R.grade(R.diagnostic(1),[]),()=>R.grade(R.diagnostic(1),Array(10).fill(-1))]){let fail=false;try{fn();}catch{fail=true;}check(fail,'invalid router state rejected');}
check(T.theory.length===12&&T.examples.length===12&&T.diagnostic.length===10&&Object.values(T.practice).every(p=>p.length===6),'topic content');
for(const q of [...T.examples.map(q=>({text:q.problem,answerCore:q.answer,answer:q.answer,solution:q.solution,skill:q.title,audit:q.audit,auditOrigin:q.auditOrigin,skillId:q.skillId})),...Object.values(T.practice).flat().map(q=>({...q,text:q.task})),...T.diagnostic.map(q=>({...q,text:q.task})),...T.homework.required.map(q=>({...q,text:q.task})),...T.homework.optional.map(q=>({...q,text:q.task}))])audit(q,'topic');
check(Object.keys(S.spatialScenes).length===8&&Object.keys(S.revolutionScenes).length===4,'8 spatial and 4 revolution scenes');
for(const scene of [...Object.values(S.spatialScenes),...Object.values(S.revolutionScenes)])check(scene.title&&scene.caption&&scene.ariaLabel,'accessible scene');
for(const route of ['topics/11-geometry-atanasyan/06.html','lessons/11-geometry-atanasyan/06/index.html',...S.lessons.map(l=>'lessons/11-geometry-atanasyan/06/'+l.id+'.html'),'assessments/11-geometry-atanasyan/06/independent.html','assessments/11-geometry-atanasyan/06/control.html','labs/11-geometry-atanasyan/review-route/index.html'])for(const m of read(route).matchAll(/(?:src|href)="([^"]+)"/g))check(fs.existsSync(path.resolve(path.dirname(route),m[1])),'dependency '+m[1]);
const triangle=S.spatialScenes['g11-review-64-plane'].points,dist=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));check(dist(triangle.O,triangle.A)===3&&dist(triangle.O,triangle.B)===4&&dist(triangle.A,triangle.B)===5,'independent 3–4–5 diagram');
const blueprint=read('content/11-geometry-atanasyan/06-methodical-plan.md');for(const token of ['12.04.2027–20.05.2027','144 поурочных варианта / 828','12 вариантов / 102','6/6, 68/68, 6/6','двух верных','Первичный балл не изменяется'])check(blueprint.includes(token),'final blueprint '+token);
const route=read('topics/11-geometry-atanasyan/06.html');check(route.includes('../../content/registry.js')&&route.indexOf('content/registry.js')<route.indexOf('content/11-geometry-atanasyan/06.js'),'registry loaded before topic registration');
const progress=grade11GeometryProgress();check(progress.summary==='6/6, 68/68, 6/6'&&progress.lineStatus==='готово','complete course metrics');
for(const p of ['README.md','Plan.md'])check(read(p).includes(progress.summary)&&read(p).includes('828'),'complete course documented');
check(read('README.md').includes('**'+progress.totalLessons+' полноценных')&&read('assessments/README.md').includes('**'+progress.totalAssessments+' тематических'),'current aggregate documentation');
console.log(`Grade 11 final review QA passed: ${checks} checks, 828 lesson + 102 thematic tasks; ten-domain correction router.`);
