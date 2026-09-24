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
 'content/10-geometry-atanasyan/02.js',
 'content/10-geometry-atanasyan/02-methodical-plan.md',
 'topics/10-geometry-atanasyan/02.html',
 'lessons/10-geometry-atanasyan/02/series.js',
 'lessons/10-geometry-atanasyan/02/scenes.js',
 'lessons/10-geometry-atanasyan/02/data.js',
 'assessments/10-geometry-atanasyan/02/data.js',
 'labs/10-geometry-atanasyan/parallel-space/index.html',
 'labs/10-geometry-atanasyan/parallel-space/style.css',
 'labs/10-geometry-atanasyan/parallel-space/app.js'
]) assert(exists(p),`missing ${p}`);

for(const p of [
 'content/10-geometry-atanasyan/02.js',
 'lessons/10-geometry-atanasyan/02/series.js',
 'lessons/10-geometry-atanasyan/02/scenes.js',
 'lessons/10-geometry-atanasyan/02/data.js',
 'assessments/10-geometry-atanasyan/02/data.js',
 'labs/10-geometry-atanasyan/parallel-space/app.js'
]) compile(p);

const cap={};
vm.runInNewContext(read('content/10-geometry-atanasyan/02.js'),{KTP_REGISTER_CONTENT:(id,d)=>cap[id]=d});
const C=cap['10-geometry-atanasyan::1'];
assert(C,'content key');
assert(C.meta.title==='Параллельность прямых и плоскостей','topic title');
assert(C.objectives.length>=14,'objectives');
assert(C.expectedResults.length>=15,'expected results');
assert(C.theory.length>=14,'theory');
assert(C.examples.length>=8,'examples');
assert(C.mistakes.length>=10,'mistakes');
assert(Object.values(C.practice).reduce((s,a)=>s+a.length,0)>=20,'practice');
assert(C.diagnostic.length>=6,'diagnostic');
assert(C.homework.required.length>=6&&C.homework.optional.length>=2,'homework');
assert(C.lab?.enabled===true&&C.lab.href.includes('parallel-space'),'lab');
assert(Object.keys(C.spatialScenes||{}).length>=8,'topic spatial scenes');

const source=C.source.paragraphs.join(' ');
for(const token of ['§1','пп. 4–6','§2','пп. 7–9','§3','пп. 10–11','§4','пп. 12–14','Приложение 1','ФРП-2025'])assert(source.includes(token),`source missing ${token}`);
for(const token of ['перпендикулярности','расстояния до плоскости','трёх перпендикулярах','двугранные углы'])assert(C.source.assessment.toLowerCase().includes(token.toLowerCase()),`source guard missing ${token}`);

const theory=C.theory.map(x=>x.html).join(' ');
for(const token of [
 'лежат в одной плоскости',
 'a⊄α',
 'скрещивающимися',
 '0°≤φ≤90°',
 'параллельными, если они не пересекаются',
 'линии их пересечения параллельны',
 'Параллельная проекция',
 'Тетраэдр',
 'сечен',
 'Метод следов'
]) assert(theory.toLowerCase().includes(token.toLowerCase()),`theory missing ${token}`);

const sb={window:{}};
vm.createContext(sb);
for(const p of ['lessons/10-geometry-atanasyan/02/series.js','lessons/10-geometry-atanasyan/02/scenes.js','lessons/10-geometry-atanasyan/02/data.js'])vm.runInContext(read(p),sb,{filename:p});
const S=sb.window.KTP_LESSON_SERIES;
assert(S.meta.topicIndex===1&&S.meta.topicNumber===2,'series meta');
assert(S.meta.totalLessons===19&&S.meta.courseLessonStart===5&&S.meta.courseLessonEnd===23,'series bounds');
assert(S.lessons.length===19,'19 lessons');
assert(Object.keys(S.spatialScenes||{}).length>=19,'19 lesson spatial scenes');

for(let i=0;i<19;i++){
 const l=S.lessons[i],n=i+1,g=5+i,id=String(n).padStart(2,'0');
 assert(l.id===id,`lesson ${n} id`);
 assert(l.number===n&&l.globalNumber===g,`lesson ${n} global ${g}`);
 assert(l.objectives.length>=2,`lesson ${n} objectives`);
 assert(l.theory.length>=2&&l.theory.some(x=>x.spatialFigure),`lesson ${n} theory/spatial`);
 assert(l.examples.length>=2,`lesson ${n} examples`);
 assert(l.mistakes.length>=3,`lesson ${n} mistakes`);
 assert(l.practice.length>=8,`lesson ${n} practice`);
 assert(l.homework.required.length>=6&&l.homework.optional.length>=2,`lesson ${n} homework`);
 assert(l.source.section&&l.source.assessment.includes('перпендикулярности'),`lesson ${n} source guard`);
 for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){
  const a=l[kind];
  assert(a.variants.length===6,`lesson ${n} ${kind} variants`);
  assert(a.maxScore===max,`lesson ${n} ${kind} max`);
  const sig=a.variants.map(v=>JSON.stringify(v.tasks.map(t=>[t.text,t.answer,t.skill])));
  assert(new Set(sig).size===6,`lesson ${n} ${kind} distinct`);
  for(const v of a.variants){
   assert(v.tasks.length===count,`lesson ${n} ${kind} count`);
   assert(v.tasks.reduce((s,t)=>s+Number(t.points||0),0)===max,`lesson ${n} ${kind} score`);
   assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),`lesson ${n} ${kind} complete`);
  }
 }
 const p=`lessons/10-geometry-atanasyan/02/${id}.html`;
 assert(exists(p),`lesson html ${id}`);
 const h=read(p);
 for(const token of ['data-topic="1"','lesson-spatial.js','spatial-scene.js','global-numbering.js'])assert(h.includes(token),`lesson ${id} wiring ${token}`);
}

for(const [index,token] of [[0,'Параллельны'],[2,'a∥α'],[4,'Скрещиваются'],[7,'°'],[9,'α∥β'],[14,'SECTION'],[15,'TRACE'],[18,'COPLANAR']]){
 const text=JSON.stringify(S.lessons[index]);
 assert(text.includes(token),`lesson ${index+1} semantic token ${token}`);
}

const topic=read('topics/10-geometry-atanasyan/02.html');
for(const token of ['data-topic="1"','content/10-geometry-atanasyan/02.js','lessons/10-geometry-atanasyan/02/topic-link.js','assessments/topic-links.js','geometry/spatial-scene.js'])assert(topic.includes(token),`topic wiring ${token}`);

const nav=read('assessments/topic-links.js').match(/'10-geometry-atanasyan':\{min:0,max:(\d+)\}/);
assert(nav&&Number(nav[1])===1,'assessment navigation through topic 02');

const ab={window:{}};
vm.createContext(ab);
vm.runInContext(read('assessments/10-geometry-atanasyan/02/data.js'),ab);
const A=ab.window.KTP_ASSESSMENT_DATA;
assert(A.meta.topic==='02','assessment topic');
for(const [kind,count,max] of [['independent',7,14],['control',10,20]]){
 const a=A.topic[kind];
 assert(a.variants.length===6,`thematic ${kind} variants`);
 assert(a.maxScore===max,`thematic ${kind} max`);
 const sig=a.variants.map(v=>JSON.stringify(v.tasks.map(t=>[t.text,t.answer,t.skill])));
 assert(new Set(sig).size===6,`thematic ${kind} distinct`);
 for(const v of a.variants){
  assert(v.tasks.length===count,`thematic ${kind} count`);
  assert(v.tasks.reduce((s,t)=>s+Number(t.points||0),0)===max,`thematic ${kind} score`);
 }
}

const lab=read('labs/10-geometry-atanasyan/parallel-space/index.html');
for(const token of ['Исследовательский вопрос','intersect','parallel','skew','linePlane','showPlane','yaw','pitch'])assert(lab.includes(token),`lab html missing ${token}`);
const app=read('labs/10-geometry-atanasyan/parallel-space/app.js');
for(const token of ['classifyLines','cross','dot','segmentIntersection','Скрещивающиеся','Параллельные','a ∥ α'])assert(app.includes(token),`lab app missing ${token}`);
assert(app.indexOf('classifyLines(m.a,m.b)')>=0,'lab relation must be derived from 3D data for line-line modes');

const method=read('content/10-geometry-atanasyan/02-methodical-plan.md');
for(const token of ['когнитивные трудности','Урок 5','Урок 23','Digital lab','parallel-space/','Exercise blueprint','QA release-gate'])assert(method.toLowerCase().includes(token.toLowerCase()),`method plan missing ${token}`);

console.log(`Grade 10 Atanasyan topic 02 structural/source QA passed: ${checks} checks.`);
