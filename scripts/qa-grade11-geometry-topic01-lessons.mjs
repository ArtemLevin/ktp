import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const check=(c,m)=>{if(!c)throw Error(m);count++;};let count=0;
const ctx={window:{}};ctx.KTP_REGISTER_CONTENT=(key,payload)=>{ctx.window.KTP_CONTENT[key]=payload};ctx.window.KTP_CONTENT={};
for(const p of ['lessons/11-geometry-atanasyan/01/series.js','lessons/11-geometry-atanasyan/01/question-bank.js','lessons/11-geometry-atanasyan/01/scenes.js','lessons/11-geometry-atanasyan/01/data.js','content/11-geometry-atanasyan/01.js'])vm.runInNewContext(read(p),ctx,{filename:p});
const S=ctx.window.KTP_LESSON_SERIES,T=ctx.window.KTP_CONTENT['11-geometry-atanasyan::0'];
check(S.meta.totalLessons===11&&S.lessons.length===11,'eleven lessons');
check(T?.theory.length>=10&&T.examples.length>=6&&T.diagnostic.length>=8,'rich thematic content');
check(T.assessments.enabled===true,'thematic assessments published at stage 3');
check(fs.existsSync('assessments/11-geometry-atanasyan/01/data.js'),'thematic assessment data route');
check(Object.keys(T.revolutionScenes).length===4,'topic scenes');
check(Object.keys(S.revolutionScenes).length===11,'lesson scenes');
for(const [id,scene] of Object.entries({...T.revolutionScenes,...S.revolutionScenes})){
 check(scene.solid&&scene.ariaLabel&&scene.caption&&scene.camera,`${id} scene contract`);
}
let taskCount=0;
for(const [i,L] of S.lessons.entries()){
 const id=String(i+1).padStart(2,'0'),prefix=`lessons/11-geometry-atanasyan/01/${id}.html`;
 check(L.id===id&&L.number===i+1&&L.globalNumber===i+1,`${id} numbering`);
 check(fs.existsSync(prefix)&&read(prefix).includes(`data-lesson="${id}"`),`${id} route`);
 check(L.objectives.length>=2&&L.theory.length>=2&&L.examples.length>=2&&L.mistakes.length>=3,`${id} content`);
 check(L.theory[0].revolutionFigure&&S.revolutionScenes[L.theory[0].revolutionFigure],`${id} diagram reference`);
 check(L.practice.length>=8&&L.homework.required.length>=6&&L.homework.optional.length>=2,`${id} practice/homework`);
 for(const [kind,max,n] of [['independent',10,5],['control',14,6]]){
  const A=L[kind];check(A.variants.length===6&&A.maxScore===max,`${id} ${kind} variants`);
  const texts=new Set();
  for(const V of A.variants){
   check(V.tasks.length===n&&V.tasks.reduce((sum,q)=>sum+q.points,0)===max,`${id} ${kind} points`);
   for(const q of V.tasks){check(q.text&&q.answer&&q.skill&&q.solution,`${id} ${kind} question fields`);texts.add(q.text);taskCount++;}
  }
  check(texts.size>=n*3,`${id} ${kind} variant diversity`);
 }
 for(const q of [...L.practice,...L.homework.required,...L.homework.optional])check(q.text&&q.answer&&q.solution,`${id} self-study answer`);
}
const route=read('topics/11-geometry-atanasyan/01.html');
for(const p of ['content/11-geometry-atanasyan/01.js','geometry/revolution-math.js','geometry/revolution-scene.js','lessons/11-geometry-atanasyan/01/topic-link.js'])check(route.includes(p),`topic route ${p}`);
check(read('lessons/11-geometry-atanasyan/01/index.html').includes('lesson-index.js'),'index route');
check(read('lessons/11-geometry-atanasyan/01/01.html').includes('lesson-revolution.js'),'lesson adapter');
// Independently verify numerical answers at representative parameters for each formula family.
const pool=ctx.window.KTP_G11_QUESTION_POOL,pi='π.';
for(let k=1;k<=15;k++){
 const r=k+2,h=k+3;
 const expected={cylinderAxial:[`${2*r} и ${h}.`,`${2*r*h}.`],cylinderCut:[`${8*k}.`,`${8*k*(k+3)}.`],cylinderArea:[`${2*r*h}π.`,`${2*r*(h+r)}π.`],coneGeometry:[`${5*k}.`,`${4*k}.`],coneCut:[`${4*k}.`,`${16*k*k}π.`],coneArea:[`${15*k*k}π.`,`${24*k*k}π.`],frustum:[`${5*k}.`,`${35*k*k}π.`],sphereCut:[`${4*k}.`,`${16*k*k}π.`],sphereArea:[`${4*r*r}π.`,`${r}.`],combined:[`${24*k*k}π.`]};
 for(const [mode,values] of Object.entries(expected))values.forEach((answer,j)=>check(pool(mode,k)[j].answer===answer,`${mode} k=${k} task=${j+1}`));
}
console.log(`Grade 11 geometry topic 01 lessons QA passed: ${count} checks, ${taskCount} assessed tasks in 132 variants.`);
