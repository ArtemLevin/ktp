import {createVectorAuditor} from './vector-question-audit.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

let checks=0,count=0;
const check=(value,message)=>{checks++;if(!value)throw Error(message);};
const read=p=>fs.readFileSync(p,'utf8');
const ctx={window:{}};
for(const file of ['js/data.js','geometry/vector-math.js','geometry/grade11-vector-scenes.js',
  'lessons/11-geometry-atanasyan/04/series.js','lessons/11-geometry-atanasyan/04/question-bank.js',
  'lessons/11-geometry-atanasyan/04/scenes.js','lessons/11-geometry-atanasyan/04/data.js'])
  vm.runInNewContext(read(file),ctx,{filename:file});
const S=ctx.window.KTP_LESSON_SERIES,pool=ctx.window.KTP_G11_VECTOR_QUESTION_POOL;
const modes=['directed','equality','addition','difference','chain','scale','solid','coplanar','box','basis','composite','diagnostic'];
check(S.meta.topicIndex===3&&S.meta.courseLessonStart===33&&S.meta.courseLessonEnd===44,'identity and global range');
check(S.lessons.length===12&&Object.keys(S.spatialScenes).length===12,'12 lessons/scenes');

const audit=createVectorAuditor(check);

for(const mode of modes)for(let variant=1;variant<=15;variant++){
  const bank=pool(mode,variant);check(bank.length===10,mode+' bank size');
  for(const [i,q] of bank.entries())audit(q,mode+'/'+variant+'/'+i);
  check(bank[4].errorAnalysis===true,mode+' embedded reasoning-error question');
}
for(const [i,L] of S.lessons.entries()){
  const id=String(i+1).padStart(2,'0'),global=i+33;
  check(L.id===id&&L.globalNumber===global&&L.mode===modes[i],'lesson numbering and mode '+id);
  check(L.week===Math.floor((global-1)/2)+1,'calendar week '+id);
  check(L.theory.length>=3&&L.examples.length===3&&L.mistakes.length===5&&L.objectives.length>=2,'rich lesson '+id);
  const scene=L.theory[0].spatialFigure;check(S.spatialScenes[scene]?.lesson===global,'correct scene '+id);
  check(L.practice.length===8&&L.homework.required.length===6&&L.homework.optional.length===2,'8 practice and 6+2 homework '+id);
  for(const q of [...L.practice,...L.homework.required,...L.homework.optional])audit(q,id+' practice/homework');
  for(const ex of L.examples){check(ex.problem&&ex.idea&&ex.solution&&ex.check&&ex.answer,'worked example '+id);audit({text:ex.problem,answer:ex.answer,answerCore:ex.answer,skill:'Пример',skillId:'VECTOR_EXAMPLE',solution:ex.solution,audit:ex.audit},id+' example');}
  for(const [kind,n,score] of [['independent',5,10],['control',6,14]]){
    const A=L[kind];check(A.variants.length===6&&A.maxScore===score,id+' '+kind+' contract');
    const texts=new Set();
    for(const V of A.variants){
      check(V.tasks.length===n&&V.tasks.reduce((s,q)=>s+q.points,0)===score,id+' '+kind+' score');
      check(V.tasks.some(q=>q.errorAnalysis),id+' '+kind+' reasoning error');
      for(const q of V.tasks){audit(q,id+' '+kind+'/'+V.id);check(q.criteria.length===2,id+' scoring criteria');
        check(q.criteria.reduce((sum,c)=>sum+Number(c.match(/^\d+/)?.[0]||0),0)===q.points,id+' criteria sum matches points');
        texts.add(q.text);count++;}
    }
    check(texts.size>=n*3,id+' '+kind+' structural diversity');
    const covered=[];for(const row of A.grading)for(let s=row.min;s<=row.max;s++)covered.push(s);
    check(covered.length===score+1&&new Set(covered).size===score+1,id+' nonoverlapping grading covers all scores');
  }
  const file='lessons/11-geometry-atanasyan/04/'+id+'.html',html=read(file);
  check(html.includes('data-lesson="'+id+'"')&&html.includes('data-topic="3"'),id+' route binding');
  for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g))check(fs.existsSync(path.resolve(path.dirname(file),m[1])),id+' dependency '+m[1]);
  check(L.source.assessment.includes('серии 05'),'source guard '+id);
  const teaching=JSON.stringify({theory:L.theory,practice:L.practice.map(q=>q.text),examples:L.examples,homework:[...L.homework.required,...L.homework.optional].map(q=>q.text)}).toLowerCase();
  for(const forbidden of ['координаты вектора','скалярное произведение','уравнение плоскости','детерминант'])check(!teaching.includes(forbidden),'no series05 method '+id);
}
check(count===792,'792 assessed tasks in 144 variants');
for(const mode of ['scale','addition','difference','chain'])check(!pool(mode,1).some(q=>q.answerCore.includes('коэффициенты (')),'no premature three-vector basis in '+mode);
for(const value of [0,-1,1.5,'1',NaN,61]){let thrown=false;try{pool('directed',value);}catch{thrown=true;}check(thrown,'reject invalid variant '+value);}
let thrown=false;try{pool('missing',1);}catch{thrown=true;}check(thrown,'reject unknown mode');
check(read('topics/11-geometry-atanasyan/04.html').includes('lessons/11-geometry-atanasyan/04/topic-link.js'),'topic integration');
console.log(`Grade 11 geometry topic 04 lessons QA passed: ${checks} checks; ${count} assessed tasks in 144 variants.`);
