import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const assert=(v,m)=>{checks++;if(!v)throw new Error(m)};
const compile=p=>{new vm.Script(read(p),{filename:p});checks++;};

for(const p of [
 'content/9-geometry-atanasyan/01.js',
 'topics/9-geometry-atanasyan/01.html',
 'lessons/9-geometry-atanasyan/01/series.js',
 'lessons/9-geometry-atanasyan/01/scenes.js',
 'lessons/9-geometry-atanasyan/01/data.js',
 'assessments/9-geometry-atanasyan/01/data.js',
 'labs/9-geometry-atanasyan/vector-operations/app.js'
])assert(exists(p),`missing ${p}`);
for(const p of [
 'content/9-geometry-atanasyan/01.js',
 'lessons/9-geometry-atanasyan/01/series.js',
 'lessons/9-geometry-atanasyan/01/scenes.js',
 'lessons/9-geometry-atanasyan/01/data.js',
 'assessments/9-geometry-atanasyan/01/data.js',
 'labs/9-geometry-atanasyan/vector-operations/app.js'
])compile(p);

const captured={};
vm.runInNewContext(read('content/9-geometry-atanasyan/01.js'),{KTP_REGISTER_CONTENT:(id,data)=>captured[id]=data});
const content=captured['9-geometry-atanasyan::0'];
assert(content,'content registry key');
assert(content.meta.title==='Векторы','content title');
assert(content.objectives.length>=10,'objectives');
assert(content.expectedResults.length>=10,'expected results');
assert(content.map.length>=9,'topic map');
assert(content.theory.length>=10,'theory');
assert(content.examples.length>=6,'examples');
assert(content.mistakes.length>=6,'mistakes');
assert(Object.values(content.practice).reduce((s,a)=>s+a.length,0)>=16,'practice');
assert(content.diagnostic.length>=6,'diagnostic');
assert(content.homework.required.length>=6&&content.homework.optional.length>=2,'homework');
assert(content.summary.length>=8,'summary');
assert(content.lab?.enabled&&content.lab.href.includes('vector-operations'),'lab');
assert(content.source.paragraphs.join(' ').includes('76–78')&&content.source.paragraphs.join(' ').includes('83–85'),'source span 76-85');
assert(content.source.assessment.includes('координаты')&&content.source.assessment.includes('скалярное'),'next-topic guards');
assert(Object.keys(content.geometryScenes||{}).length>=6,'topic geometry scenes');

const sandbox={window:{}};
vm.createContext(sandbox);
for(const p of ['lessons/9-geometry-atanasyan/01/series.js','lessons/9-geometry-atanasyan/01/scenes.js','lessons/9-geometry-atanasyan/01/data.js'])vm.runInContext(read(p),sandbox,{filename:p});
const S=sandbox.window.KTP_LESSON_SERIES;
assert(S.meta.topicIndex===0&&S.meta.topicNumber===1,'series topic metadata');
assert(S.meta.totalLessons===10&&S.meta.courseLessonStart===1&&S.meta.courseLessonEnd===10,'series bounds');
assert(S.lessons.length===10,'ten lessons');
assert(Object.keys(S.geometryScenes).length>=10,'lesson scenes');
const ids=new Set(),globals=new Set();
for(let i=0;i<S.lessons.length;i++){
 const l=S.lessons[i],n=i+1;
 assert(l.id===String(n).padStart(2,'0'),`lesson ${n} id`);
 assert(l.number===n&&l.globalNumber===n,`lesson ${n} numbering`);
 assert(!ids.has(l.id)&&!globals.has(l.globalNumber),`lesson ${n} uniqueness`);ids.add(l.id);globals.add(l.globalNumber);
 assert(l.objectives.length>=2,`lesson ${n} objectives`);
 assert(l.theory.length>=2&&l.theory.some(x=>x.figure),`lesson ${n} theory/figure`);
 assert(l.examples.length>=2,`lesson ${n} examples`);
 assert(l.mistakes.length>=3,`lesson ${n} mistakes`);
 assert(l.practice.length>=8,`lesson ${n} practice`);
 assert(l.homework.required.length>=6&&l.homework.optional.length>=2,`lesson ${n} homework`);
 for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){
  const a=l[kind];assert(a.variants.length===6,`lesson ${n} ${kind} variants`);assert(a.maxScore===max,`lesson ${n} ${kind} max`);
  for(const v of a.variants){assert(v.tasks.length===count,`lesson ${n} ${kind} task count`);assert(v.tasks.reduce((s,t)=>s+Number(t.points||0),0)===max,`lesson ${n} ${kind} points`);assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),`lesson ${n} ${kind} completeness`);}
 }
 const html=`lessons/9-geometry-atanasyan/01/${String(n).padStart(2,'0')}.html`;
 assert(exists(html),`lesson html ${n}`);
 const h=read(html);assert(h.includes('data-topic="0"')&&h.includes('geometry-scene.js')&&h.includes('global-numbering.js'),`lesson html wiring ${n}`);
}

assert(S.lessons[3].practice.some(t=>t.answer==='AC⃗.'),'triangle-rule answer');
assert(S.lessons[6].practice.some(t=>String(t.answer).includes('a⃗−b⃗')),'difference answer');
assert(S.lessons[7].practice.some(t=>String(t.answer).toLowerCase().includes('противополож')),'negative scalar direction');
assert(S.lessons[9].practice.some(t=>String(t.skill).includes('Средняя линия')),'trapezoid midline coverage');

const topicHtml=read('topics/9-geometry-atanasyan/01.html');
for(const token of ['data-topic="0"','content/9-geometry-atanasyan/01.js','lessons/9-geometry-atanasyan/01/topic-link.js','assessments/topic-links.js','geometry/geometry-scene.js'])assert(topicHtml.includes(token),`topic html ${token}`);
const nav01=read('assessments/topic-links.js').match(/'9-geometry-atanasyan':\{min:0,max:(\d+)\}/);assert(nav01&&Number(nav01[1])>=0,'assessment navigation topic01');

const asb={window:{}};vm.createContext(asb);vm.runInContext(read('assessments/9-geometry-atanasyan/01/data.js'),asb);
const A=asb.window.KTP_ASSESSMENT_DATA;assert(A.meta.topic==='01','assessment topic');
for(const [kind,count,max] of [['independent',7,14],['control',10,20]]){
 const a=A.topic[kind];assert(a.variants.length===6,`thematic ${kind} variants`);assert(a.maxScore===max,`thematic ${kind} max`);
 for(const v of a.variants){assert(v.tasks.length===count,`thematic ${kind} count`);assert(v.tasks.reduce((s,t)=>s+Number(t.points||0),0)===max,`thematic ${kind} points`);assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),`thematic ${kind} completeness`);}
}
for(const p of ['assessments/9-geometry-atanasyan/01/independent.html','assessments/9-geometry-atanasyan/01/control.html','labs/9-geometry-atanasyan/vector-operations/index.html','labs/9-geometry-atanasyan/vector-operations/style.css','lessons/9-geometry-atanasyan/01/index.html','lessons/9-geometry-atanasyan/01/topic-link.js'])assert(exists(p),`missing ${p}`);
const lab=read('labs/9-geometry-atanasyan/vector-operations/index.html');
for(const token of ['Исследовательский вопрос','Исследуйте','Что нужно заметить','К теме «Векторы»','mode','lenA','angleA','lenB','angleB','k'])assert(lab.includes(token),`lab missing ${token}`);

console.log(`Grade 9 Atanasyan topic 01 structural/source QA passed: ${checks} checks.`);