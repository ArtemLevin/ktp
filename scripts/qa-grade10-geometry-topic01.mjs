import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const assert=(value,message)=>{checks++;if(!value)throw new Error(message);};
const compile=p=>{new vm.Script(read(p),{filename:p});checks++;};

for(const p of [
  'content/10-geometry-atanasyan/01.js',
  'content/10-geometry-atanasyan/01-methodical-plan.md',
  'content/10-geometry-atanasyan/methodical-plan.md',
  'topics/10-geometry-atanasyan/01.html',
  'lessons/10-geometry-atanasyan/01/series.js',
  'lessons/10-geometry-atanasyan/01/scenes.js',
  'lessons/10-geometry-atanasyan/01/data.js',
  'assessments/10-geometry-atanasyan/01/data.js',
  'geometry/spatial-scene.js',
  'geometry/lesson-spatial.js'
]) assert(exists(p),`missing ${p}`);

for(const p of [
  'content/10-geometry-atanasyan/01.js',
  'lessons/10-geometry-atanasyan/01/series.js',
  'lessons/10-geometry-atanasyan/01/scenes.js',
  'lessons/10-geometry-atanasyan/01/data.js',
  'assessments/10-geometry-atanasyan/01/data.js'
]) compile(p);

const captured={};
vm.runInNewContext(read('content/10-geometry-atanasyan/01.js'),{KTP_REGISTER_CONTENT:(id,data)=>captured[id]=data});
const C=captured['10-geometry-atanasyan::0'];
assert(C,'content registry key');
assert(C.meta.title==='Повторение','content title');
assert(C.objectives.length>=10,'objectives');
assert(C.expectedResults.length>=10,'expected results');
assert(C.prerequisites.length>=5&&C.prerequisiteCheck.length>=4,'prerequisite layer');
assert(C.map.length>=7,'topic map');
assert(C.theory.length>=9,'theory');
assert(C.examples.length>=6,'examples');
assert(C.mistakes.length>=7,'mistakes');
assert(Object.values(C.practice).reduce((s,a)=>s+a.length,0)>=16,'practice count');
assert(C.diagnostic.length>=6,'diagnostic');
assert(C.homework.required.length>=6&&C.homework.optional.length>=2,'homework');
assert(C.summary.length>=7,'summary');
assert(C.lab?.enabled===false,'topic 01 intentionally has no lab');
assert(Object.keys(C.spatialScenes||{}).length>=6,'topic spatial scenes');

const source=C.source.paragraphs.join(' ');
for(const token of ['п. 1','п. 2','п. 3','Приложение 1','ФРП-2025'])assert(source.includes(token),`source missing ${token}`);
for(const token of ['параллельности','перпендикулярности','сложные построения сечений'])assert(C.source.assessment.includes(token),`source guard missing ${token}`);

const theory=C.theory.map(x=>x.html).join(' ');
for(const token of [
  'три точки, не лежащие на одной прямой',
  'две точки прямой',
  'пересекаются по прямой',
  'параллельная проекция',
  'сечение'
]) assert(theory.toLowerCase().includes(token.toLowerCase()),`theory missing ${token}`);

const sb={window:{}};
vm.createContext(sb);
for(const p of [
  'lessons/10-geometry-atanasyan/01/series.js',
  'lessons/10-geometry-atanasyan/01/scenes.js',
  'lessons/10-geometry-atanasyan/01/data.js'
]) vm.runInContext(read(p),sb,{filename:p});
const S=sb.window.KTP_LESSON_SERIES;
assert(S.meta.topicIndex===0&&S.meta.topicNumber===1,'series meta');
assert(S.meta.totalLessons===4&&S.meta.courseLessonStart===1&&S.meta.courseLessonEnd===4,'series bounds');
assert(S.lessons.length===4,'four lessons');
assert(Object.keys(S.spatialScenes||{}).length>=4,'lesson spatial scenes');

for(let i=0;i<4;i++){
  const l=S.lessons[i],n=i+1,id=String(n).padStart(2,'0');
  assert(l.id===id,`lesson ${n} id`);
  assert(l.number===n&&l.globalNumber===n,`lesson ${n} numbering`);
  assert(l.objectives.length>=2,`lesson ${n} objectives`);
  assert(l.theory.length>=2&&l.theory.some(x=>x.spatialFigure),`lesson ${n} theory/spatial figure`);
  assert(l.examples.length>=2&&l.examples.every(x=>x.problem&&x.solution&&x.answer),`lesson ${n} examples`);
  assert(l.mistakes.length>=3,`lesson ${n} mistakes`);
  assert(l.practice.length>=8,`lesson ${n} practice`);
  assert(l.homework.required.length>=6&&l.homework.optional.length>=2,`lesson ${n} homework`);
  for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){
    const a=l[kind];
    assert(a.variants.length===6,`lesson ${n} ${kind} variants`);
    assert(a.maxScore===max,`lesson ${n} ${kind} max`);
    const signatures=a.variants.map(v=>JSON.stringify(v.tasks.map(t=>[t.text,t.answer,t.skill])));
    assert(new Set(signatures).size===6,`lesson ${n} ${kind} variants must differ`);
    for(const v of a.variants){
      assert(v.tasks.length===count,`lesson ${n} ${kind} count`);
      assert(v.tasks.reduce((sum,t)=>sum+Number(t.points||0),0)===max,`lesson ${n} ${kind} score`);
      assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),`lesson ${n} ${kind} completeness`);
    }
  }
  const p=`lessons/10-geometry-atanasyan/01/${id}.html`;
  assert(exists(p),`lesson html ${id}`);
  const h=read(p);
  for(const token of ['data-topic="0"','lesson-spatial.js','spatial-scene.js','global-numbering.js'])assert(h.includes(token),`lesson ${id} wiring ${token}`);
}

assert(S.lessons[0].practice.some(x=>x.skill==='READ'),'lesson 1 projection reading');
assert(S.lessons[1].practice.some(x=>String(x.answer).includes('a⊂α')),'lesson 2 axiom 2');
assert(S.lessons[2].practice.some(x=>String(x.answer).includes('Ровно одна')),'lesson 3 uniqueness');
assert(S.lessons[3].practice.some(x=>x.skill==='SECTION'),'lesson 4 section literacy');

const topic=read('topics/10-geometry-atanasyan/01.html');
for(const token of [
  'data-topic="0"',
  'content/10-geometry-atanasyan/01.js',
  'lessons/10-geometry-atanasyan/01/topic-link.js',
  'assessments/topic-links.js',
  'geometry/spatial-scene.js'
]) assert(topic.includes(token),`topic wiring ${token}`);

const nav=read('assessments/topic-links.js').match(/'10-geometry-atanasyan':\{min:0,max:(\d+)\}/);
assert(nav&&Number(nav[1])===0,'assessment navigation topic 01 only');

const ab={window:{}};
vm.createContext(ab);
vm.runInContext(read('assessments/10-geometry-atanasyan/01/data.js'),ab);
const A=ab.window.KTP_ASSESSMENT_DATA;
assert(A.meta.topic==='01','assessment topic');
for(const [kind,count,max] of [['independent',7,14],['control',10,20]]){
  const a=A.topic[kind];
  assert(a.variants.length===6,`thematic ${kind} variants`);
  assert(a.maxScore===max,`thematic ${kind} max`);
  const signatures=a.variants.map(v=>JSON.stringify(v.tasks.map(t=>[t.text,t.answer,t.skill])));
  assert(new Set(signatures).size===6,`thematic ${kind} variants must differ`);
  for(const v of a.variants){
    assert(v.tasks.length===count,`thematic ${kind} count`);
    assert(v.tasks.reduce((s,t)=>s+Number(t.points||0),0)===max,`thematic ${kind} points`);
    assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),`thematic ${kind} completeness`);
  }
}
for(const p of [
  'assessments/10-geometry-atanasyan/01/independent.html',
  'assessments/10-geometry-atanasyan/01/control.html',
  'lessons/10-geometry-atanasyan/01/index.html',
  'lessons/10-geometry-atanasyan/01/topic-link.js'
]) assert(exists(p),`missing ${p}`);

const linePlan=read('content/10-geometry-atanasyan/methodical-plan.md');
for(const token of [
  'объект',
  'математическая модель',
  'плоский чертёж',
  'retrieval',
  'parallel-space/',
  'distance-angle-space/',
  'polyhedron-section/',
  'Assessment strategy'
]) assert(linePlan.toLowerCase().includes(token.toLowerCase()),`line methodical plan missing ${token}`);

const topicPlan=read('content/10-geometry-atanasyan/01-methodical-plan.md');
for(const token of [
  'Источниковая граница',
  'Урок 1',
  'Урок 2',
  'Урок 3',
  'Урок 4',
  'Digital lab decision',
  'отдельная лаборатория не создаётся',
  'QA release-gate'
]) assert(topicPlan.toLowerCase().includes(token.toLowerCase()),`topic methodical plan missing ${token}`);

console.log(`Grade 10 Atanasyan topic 01 structural/source QA passed: ${checks} checks.`);
