import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const assert=(v,m)=>{checks++;if(!v)throw new Error(m);};
const compile=p=>{new vm.Script(read(p),{filename:p});checks++;};

for(const p of [
 'content/10-geometry-atanasyan/03.js',
 'content/10-geometry-atanasyan/03-methodical-plan.md',
 'topics/10-geometry-atanasyan/03.html',
 'lessons/10-geometry-atanasyan/03/series.js',
 'lessons/10-geometry-atanasyan/03/scenes.js',
 'lessons/10-geometry-atanasyan/03/data.js',
 'assessments/10-geometry-atanasyan/03/data.js',
 'labs/10-geometry-atanasyan/distance-angle-space/index.html',
 'labs/10-geometry-atanasyan/distance-angle-space/style.css',
 'labs/10-geometry-atanasyan/distance-angle-space/app.js'
]) assert(exists(p),`missing ${p}`);

for(const p of [
 'content/10-geometry-atanasyan/03.js',
 'lessons/10-geometry-atanasyan/03/series.js',
 'lessons/10-geometry-atanasyan/03/scenes.js',
 'lessons/10-geometry-atanasyan/03/data.js',
 'assessments/10-geometry-atanasyan/03/data.js',
 'labs/10-geometry-atanasyan/distance-angle-space/app.js'
]) compile(p);

const cap={};
vm.runInNewContext(read('content/10-geometry-atanasyan/03.js'),{KTP_REGISTER_CONTENT:(id,d)=>cap[id]=d});
const C=cap['10-geometry-atanasyan::2'];
assert(C,'content key');
assert(C.meta.title==='Перпендикулярность прямых и плоскостей','topic title');
assert(C.objectives.length>=14,'objectives');
assert(C.expectedResults.length>=18,'expected results');
assert(C.theory.length>=14,'theory');
assert(C.examples.length>=8,'examples');
assert(C.mistakes.length>=10,'mistakes');
assert(Object.values(C.practice).reduce((s,a)=>s+a.length,0)>=20,'practice');
assert(C.diagnostic.length>=6,'diagnostic');
assert(C.homework.required.length>=6&&C.homework.optional.length>=2,'homework');
assert(C.lab?.enabled===true&&C.lab.href.includes('distance-angle-space'),'lab');
assert(Object.keys(C.spatialScenes||{}).length>=9,'topic spatial scenes');

const source=C.source.paragraphs.join(' ');
for(const token of ['§1','пп. 15–18','§2','пп. 19–21','§3','пп. 22–24','ФРП-2025'])assert(source.includes(token),`source missing ${token}`);
for(const token of ['25*','26*','не входят','Многогранники'])assert(C.source.assessment.includes(token),`source guard missing ${token}`);

const theory=C.theory.map(x=>x.html).join(' ');
for(const token of [
 'a⊥α','двум пересекающимся прямым','перпендикуляр','ортогональная проекция',
 'Расстояние','трёх перпендикулярах','∠MBH','MB²=MH²+HB²',
 'двугранный','линейный угол','Плоскости перпендикулярны','d²=a²+b²+c²'
]) assert(theory.toLowerCase().includes(token.toLowerCase()),`theory missing ${token}`);

const sb={window:{}};
vm.createContext(sb);
for(const p of ['lessons/10-geometry-atanasyan/03/series.js','lessons/10-geometry-atanasyan/03/scenes.js','lessons/10-geometry-atanasyan/03/data.js'])vm.runInContext(read(p),sb,{filename:p});
const S=sb.window.KTP_LESSON_SERIES;
assert(S.meta.topicIndex===2&&S.meta.topicNumber===3,'series meta');
assert(S.meta.totalLessons===19&&S.meta.courseLessonStart===24&&S.meta.courseLessonEnd===42,'series bounds');
assert(S.lessons.length===19,'19 lessons');
assert(Object.keys(S.spatialScenes||{}).length>=19,'19 lesson spatial scenes');

for(let i=0;i<19;i++){
 const l=S.lessons[i],n=i+1,g=24+i,id=String(n).padStart(2,'0');
 assert(l.id===id,`lesson ${n} id`);
 assert(l.number===n&&l.globalNumber===g,`lesson ${n} global ${g}`);
 assert(l.objectives.length>=2,`lesson ${n} objectives`);
 assert(l.theory.length>=2&&l.theory.some(x=>x.spatialFigure),`lesson ${n} theory/spatial`);
 assert(l.examples.length>=2&&l.examples.every(x=>x.problem&&x.solution&&x.answer),`lesson ${n} examples`);
 assert(l.mistakes.length>=3,`lesson ${n} mistakes`);
 assert(l.practice.length>=8,`lesson ${n} practice`);
 assert(l.homework.required.length>=6&&l.homework.optional.length>=2,`lesson ${n} homework`);
 assert(l.source.section&&l.source.assessment.includes('25*–26*'),`lesson ${n} source guard`);
 for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){
  const a=l[kind];
  assert(a.variants.length===6,`lesson ${n} ${kind} variants`);
  assert(a.maxScore===max,`lesson ${n} ${kind} max`);
  const sig=a.variants.map(v=>JSON.stringify(v.tasks.map(t=>[t.text,t.answer,t.skill])));
  assert(new Set(sig).size===6,`lesson ${n} ${kind} distinct variants`);
  for(const v of a.variants){
   assert(v.tasks.length===count,`lesson ${n} ${kind} count`);
   assert(v.tasks.reduce((s,t)=>s+Number(t.points||0),0)===max,`lesson ${n} ${kind} score`);
   assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),`lesson ${n} ${kind} completeness`);
  }
 }
 const p=`lessons/10-geometry-atanasyan/03/${id}.html`;
 assert(exists(p),`lesson html ${id}`);
 const h=read(p);
 for(const token of ['data-topic="2"','lesson-spatial.js','spatial-scene.js','global-numbering.js'])assert(h.includes(token),`lesson ${id} wiring ${token}`);
}

const lessonText=JSON.stringify(S.lessons).toLowerCase();
assert(!lessonText.includes('трёхгранный угол'),'p25 must not leak into required lessons');
assert(!lessonText.includes('многогранный угол'),'p26 must not leak into required lessons');
for(const [idx,token] of [[2,'CRITERION'],[5,'MH'],[9,'T3P'],[11,'∠MBH'],[13,'двугран'],[16,'d²=a²+b²+c²'],[18,'FOOT']]){
 assert(JSON.stringify(S.lessons[idx]).includes(token),`lesson ${idx+1} semantic token ${token}`);
}

const topic=read('topics/10-geometry-atanasyan/03.html');
for(const token of ['data-topic="2"','content/10-geometry-atanasyan/03.js','lessons/10-geometry-atanasyan/03/topic-link.js','assessments/topic-links.js','geometry/spatial-scene.js'])assert(topic.includes(token),`topic wiring ${token}`);

const nav=read('assessments/topic-links.js').match(/'10-geometry-atanasyan':\{min:0,max:(\d+)\}/);
assert(nav&&Number(nav[1])===2,'assessment navigation through topic 03');

const ab={window:{}};
vm.createContext(ab);
vm.runInContext(read('assessments/10-geometry-atanasyan/03/data.js'),ab);
const A=ab.window.KTP_ASSESSMENT_DATA;
assert(A.meta.topic==='03','assessment topic');
assert(A.meta.sourceNote.includes('пп. 15–24')&&A.meta.sourceNote.includes('25*–26*'),'assessment source guard');
for(const [kind,count,max] of [['independent',7,14],['control',10,20]]){
 const a=A.topic[kind];
 assert(a.variants.length===6,`thematic ${kind} variants`);
 assert(a.maxScore===max,`thematic ${kind} max`);
 const sig=a.variants.map(v=>JSON.stringify(v.tasks.map(t=>[t.text,t.answer,t.skill])));
 assert(new Set(sig).size===6,`thematic ${kind} distinct variants`);
 for(const v of a.variants){
  assert(v.tasks.length===count,`thematic ${kind} count`);
  assert(v.tasks.reduce((s,t)=>s+Number(t.points||0),0)===max,`thematic ${kind} points`);
  assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),`thematic ${kind} complete`);
 }
}
const assText=JSON.stringify(A.topic).toLowerCase();
assert(!assText.includes('трёхгранный'),'thematic must exclude p25');
assert(!assText.includes('многогранный угол'),'thematic must exclude p26');

const lab=read('labs/10-geometry-atanasyan/distance-angle-space/index.html');
for(const token of ['Исследовательский вопрос','height','radius','yaw','pitch','third','preset45','MB²=MH²+HB²'])assert(lab.includes(token),`lab html missing ${token}`);
const app=read('labs/10-geometry-atanasyan/distance-angle-space/app.js');
for(const token of ['Math.hypot(h,r)','Math.atan2(h,r)','h/r','ui.radius.value=ui.height.value','l ⊥ HB','l ⊥ MB'])assert(app.includes(token),`lab app missing ${token}`);

const method=read('content/10-geometry-atanasyan/03-methodical-plan.md');
for(const token of ['Ключевые различения','Урок 24','Урок 42','distance-angle-space/','Математические QA-инварианты','Release gate'])assert(method.includes(token),`method plan missing ${token}`);

console.log(`Grade 10 Atanasyan topic 03 structural/source QA passed: ${checks} checks.`);
