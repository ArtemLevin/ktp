import fs from 'node:fs';
import vm from 'node:vm';

// P1.3: all 6 assessment series retain 6 variants of each work type.
// The scoring model must distinguish unmarked steps from earned 0 points.
let checks=0;
const check=(valid,message)=>{checks++;if(!valid)throw Error(message);};
const read=p=>fs.readFileSync(p,'utf8');
const common=['geometry/vector-math.js','geometry/coordinate-math.js',
 'lessons/11-geometry-atanasyan/04/question-bank.js',
 'lessons/11-geometry-atanasyan/05/question-bank.js',
 'lessons/11-geometry-atanasyan/06/question-bank.js'];
for(let n=1;n<=6;n++){
 const series=String(n).padStart(2,'0');
 const context=vm.createContext({window:{},
   document:{body:{dataset:{kind:'control',topic:series}},getElementById:()=>null},Math});
 if(n>=4)for(const file of common.slice(0,n===4?3:n===5?4:5))
  vm.runInContext(read(file),context,{filename:file});
 const file='assessments/11-geometry-atanasyan/'+series+'/data.js';
 vm.runInContext(read(file),context,{filename:file});
 vm.runInContext(read('assessments/assessment-page.js'),context,{filename:'assessments/assessment-page.js'});
 const topic=context.window.KTP_ASSESSMENT_DATA.topic;
 const engine=context.window.KTP_ASSESSMENT_DIAGNOSTICS;
 check(!!engine&&typeof engine.criteriaFor==='function'&&typeof engine.assessmentSummary==='function',series+' public scoring contract');
 for(const kind of ['independent','control']){
  const work=topic[kind];
  check(work.variants.length===6,series+'/'+kind+' six variants');
  check(work.maxScore===(kind==='independent'?14:20),series+'/'+kind+' maximum score');
  for(const v of work.variants){
   const tag=series+'/'+kind+'/'+v.id,all={},zero={},rubrics=[];
   v.tasks.forEach((q,i)=>{
    const rubric=engine.criteriaFor(q);
    check(Array.isArray(rubric.rows)&&rubric.rows.length>0,tag+'/'+i+' rubric');
    check(rubric.rows.reduce((sum,r)=>sum+r.points,0)===q.points,tag+'/'+i+' rubric conserves points');
    if(n<=3)check(!rubric.generic,tag+'/'+i+' first three series use specific criteria');
    const domain=engine.domainFor(q,series);
    check(typeof domain==='string'&&domain.length>=3,tag+'/'+i+' meaningful focus');
    rubric.rows.forEach((part,j)=>{rubrics.push(part);all[v.id+'/'+i+'/'+j]=part.points;zero[v.id+'/'+i+'/'+j]=0;});
   });
   const none=engine.assessmentSummary(v,{},series);
   check(!none.complete&&none.earned===0&&none.markedParts===0,tag+' no marks must remain unknown');
   check(none.allPoints===work.maxScore,tag+' total rubric coverage');
   const one={[v.id+'/0/0']:0};
   const partial=engine.assessmentSummary(v,one,series);
   check(partial.markedParts===1&&!partial.complete&&partial.markedPoints>0&&partial.earned===0,tag+' checked zero is distinct from unmarked');
   const full=engine.assessmentSummary(v,all,series);
   check(full.complete&&full.earned===work.maxScore&&full.markedPoints===work.maxScore,tag+' fully correct');
   check(full.toRecheck.length===0&&full.groups.length>0,tag+' no false deficiency on full marks');
   const failed=engine.assessmentSummary(v,zero,series);
   check(failed.complete&&failed.earned===0&&failed.toRecheck.length===failed.groups.length,tag+' weak domains flagged only when checked');
   const firstDomain=engine.domainFor(v.tasks[0],series);
   const mixed={...all};
   v.tasks.forEach((q,i)=>engine.criteriaFor(q).rows.forEach((part,j)=>{
    if(engine.domainFor(q,series)===firstDomain)mixed[v.id+'/'+i+'/'+j]=0;
   }));
   const mixedReport=engine.assessmentSummary(v,mixed,series);
   check(mixedReport.complete&&mixedReport.toRecheck.some(g=>g.domain===firstDomain),tag+' remedial signal');
   check(mixedReport.toRecheck.every(g=>g.advice.length>8),tag+' actionable advice');
  }
 }
}
// Independent geometric proof checks for the new argumentation tasks.
for(const series of ['01','02']){
 const ctx=vm.createContext({window:{},Math});
 vm.runInContext(read('assessments/11-geometry-atanasyan/'+series+'/data.js'),ctx);
 const topic=ctx.window.KTP_ASSESSMENT_DATA.topic;
 for(const v of topic.independent.variants){
  const proof=v.tasks.at(-1);
  check(proof.points===3&&proof.criteria.length===3,series+' independent proof rubric');
  if(series==='01'){
   const m=proof.text.match(/R=(\d+), d=(\d+)/);
   check(!!m,'sphere proof premise');
   const R=Number(m[1]),d=Number(m[2]),rho=Math.sqrt(R*R-d*d);
   check(d>0&&d<R&&Number.isSafeInteger(rho)&&rho>0&&rho<R,'independent sphere-section inequality');
   check(proof.answer.includes('ρ='+rho)&&proof.answer.includes('0<ρ<R'),'student must prove strict bounds');
  }else{
   const m=proof.text.match(/Sосн=(\d+), ребро (\d+), проекция (\d+)/);
   check(!!m,'oblique prism proof premise');
   const S=Number(m[1]),edge=Number(m[2]),proj=Number(m[3]);
   const h=Math.sqrt(edge*edge-proj*proj);
   check(Number.isSafeInteger(h)&&h>0&&h<edge,'oblique height bounds');
   check(proof.answer.includes('h='+h)&&proof.answer.includes('V='+(S*h))&&proof.answer.includes('0<h<e'),'oblique prism proof arithmetic');
  }
 }
 for(const v of topic.control.variants){
  const proof=v.tasks.at(-1);
  check(proof.points===3&&proof.criteria.length===3,series+' control proof rubric');
  if(series==='01'){
   const m=proof.text.match(/R=(\d+), r=(\d+), h=(\d+)/);
   check(!!m,'frustum surface proof premise');
   const R=+m[1],r=+m[2],h=+m[3],l=Math.sqrt(h*h+(R-r)*(R-r));
   check(R>r&&Number.isSafeInteger(l)&&l>h,'frustum slant strict inequality');
   check(proof.answer.includes('l='+l)&&proof.answer.includes('Sбок='+(R+r)*l+'π')&&proof.answer.includes('l>h'),'frustum proof conclusion');
  }else{
   const m=proof.text.match(/S₁=(\d+), S₂=(\d+), h=(\d+)/);
   check(!!m,'frustum volume proof premise');
   const A=+m[1],B=+m[2],h=+m[3],g=Math.sqrt(A*B);
   const V=h*(A+g+B)/3,over=h*(A+B-2*g)/6;
   check(A!==B&&Number.isSafeInteger(g)&&over>0,'AM/GM proof inequality');
   check(proof.answer.includes('V='+V+'.')&&proof.answer.includes('Завышение составляет '+over),'correct proof excess');
   check(proof.answer.includes('Vош−V=h(√S₁−√S₂)²/6>0'),'independent proof identity');
  }
 }
}
console.log('P1.3 assessment diagnostics and proof audit: '+checks+' checks passed, 72 forms, 612 tasks.');
