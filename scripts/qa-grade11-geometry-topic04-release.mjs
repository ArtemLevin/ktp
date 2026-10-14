import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createVectorAuditor} from './vector-question-audit.mjs';
import {grade11GeometryProgress} from './grade11-geometry-progress.mjs';
let checks=0;
const check=(v,m)=>{checks++;if(!v)throw Error(m);},read=p=>fs.readFileSync(p,'utf8'),near=(a,b,m)=>check(Math.abs(a-b)<1e-8,m);
const ctx={window:{}};
for(const p of ['geometry/vector-math.js','labs/11-geometry-atanasyan/vector-constructor/math.js','lessons/11-geometry-atanasyan/04/question-bank.js','assessments/11-geometry-atanasyan/04/data.js'])vm.runInNewContext(read(p),ctx,{filename:p});
const L=ctx.window.KTP_VECTOR_LAB_MATH,A=ctx.window.KTP_ASSESSMENT_DATA;
const add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,k)=>a.map(v=>v*k),sub=(a,b)=>add(a,mul(b,-1));
const same=(a,b,m)=>a.forEach((v,i)=>near(v,b[i],m));
const det=(a,b,c)=>a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]);
const values=Array.from({length:9},(_,i)=>i/2-2);
for(const t of values)for(const k of values){
 const s=L.transfer({t,k}),expected=mul([1.5,.3,.6],k);
 same(sub(s.original.to,s.original.from),expected,'original displacement');same(sub(s.copy.to,s.copy.from),expected,'transfer invariant');
 near(s.length,Math.abs(k)*Math.hypot(1.5,.3,.6),'model length');check(s.equal&&s.zero===(k===0),'equality and zero');
}
for(const x of values)for(const y of values)for(const z of values){
 const s=L.combination({x,y,z});same(s.p,[1.6*x+.5*y+.3*z,1.5*y+.2*z,1.5*z],'independent oblique sum');same(s.recovered,[x,y,z],'recovery');check(s.zero===(x===0&&y===0&&z===0),'zero in independent triple');
}
for(const h of [-1.5,-1,-.5,0,.5,1,1.5])for(const target of ['c','outside']){
 const s=L.coplanarity({h,target});check((Math.abs(det(...s.basis))<1e-9)===s.planar,'independent coplanarity');
 check(s.exists===(h!==0||target==='c')&&s.unique===(h!==0),'existence/uniqueness');
 for(const coefficients of s.representations){const rebuilt=s.basis.reduce((v,a,i)=>add(v,mul(a,coefficients[i])),[0,0,0]);same(rebuilt,s.p,'independent reconstruction');}
 check(s.representations.length===(h===0?(target==='c'?2:0):1),'number of exhibited representations');
}
for(const fn of [()=>L.transfer({t:3}),()=>L.transfer({k:NaN}),()=>L.combination({x:Infinity}),()=>L.combination({z:-3}),()=>L.coplanarity({h:2}),()=>L.coplanarity({target:'unknown'}),()=>L.transfer({t:'1'})]){let thrown=false;try{fn();}catch{thrown=true;}check(thrown,'invalid lab state rejected');}
const first=L.combination();first.basis[0][0]=999;check(L.combination().basis[0][0]===1.6,'returned state does not mutate template');
check(A.meta.topic==='04'&&A.meta.rowId==='11-geometry-atanasyan','assessment identity');
const audit=createVectorAuditor(check),skills={independent:['ENDPOINTS','EQUALITY','DIFFERENCE','CHAIN','SCALE','COPLANAR','ERROR'],control:['ENDPOINTS','EQUALITY','TRIANGLE','DIFFERENCE','CHAIN','SCALE','SOLID','COPLANAR','BASIS','ERROR']};
let tasks=0;
for(const [kind,count,max] of [['independent',7,14],['control',10,20]]){
 const work=A.topic[kind];check(work.maxScore===max&&work.variants.length===6,'work dimensions');const signatures=new Set();
 for(const v of work.variants){check(v.tasks.length===count&&v.tasks.reduce((n,t)=>n+t.points,0)===max,'variant totals');signatures.add(JSON.stringify(v.tasks.map(t=>t.text)));
  for(const [i,t] of v.tasks.entries()){
   audit(t,kind+'/'+v.id+'/'+(i+1));tasks++;check(t.points===2&&t.criteria.length===2&&t.criteria.reduce((n,c)=>n+c.points,0)===2,'rubric points');
   check(t.solution.includes('Критерии:')&&t.answer===t.answerCore,'short answer and explicit rubric');
   const acceptable=i===3&&kind==='independent'?['VECTOR_CHAIN']:i===4&&kind==='independent'?['VECTOR_SCALE','VECTOR_MIDPOINT']:i===5&&kind==='control'?['VECTOR_SCALE','VECTOR_MIDPOINT']:['VECTOR_'+skills[kind][i]];
   check(acceptable.includes(t.skillId),'matrix skill '+kind+'/'+i+' '+t.skillId);
   check(!/(координат|скалярн|детерминант|векторное произведение|уравнение плоскости)/i.test(t.text+t.answer+t.solution),'topic boundary');
  }
  check(v.tasks.at(-1).errorAnalysis===true,'every variant analyzes error');
 }
 check(signatures.size===6,'six distinct variants');
}
check(tasks===102,'102 thematic tasks');
for(const route of ['labs/11-geometry-atanasyan/vector-constructor/index.html','assessments/11-geometry-atanasyan/04/independent.html','assessments/11-geometry-atanasyan/04/control.html']){
 const html=read(route);for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(m[1].startsWith('#'))continue;check(fs.existsSync(path.resolve(path.dirname(route),m[1])),'dependency resolves '+m[1]);}
 check(!/src="https?:/i.test(html),'zero-build local dependencies');
}
const progress=grade11GeometryProgress();check(progress.completeSeries>=4&&progress.lessonCount>=44&&progress.totalAssessments>=85,'release totals');
for(const p of ['README.md','Plan.md'])check(read(p).includes(progress.summary),'release documented '+p);
check(read('assessments/README.md').includes('**'+progress.totalAssessments+' тематических'),'assessment count documented');
check(read('content/11-geometry-atanasyan/content-map.md').includes(progress.contentMap),'content map counts');
console.log(`Grade 11 geometry topic 04 release QA passed: ${checks} checks; 102 thematic tasks, 3 lab modes.`);
