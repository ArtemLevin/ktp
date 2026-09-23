import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';
const ROOT=process.cwd();let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8'),exists=p=>fs.existsSync(path.join(ROOT,p));
const assert=(v,m)=>{checks++;if(!v)throw new Error(m)},compile=p=>{new vm.Script(read(p),{filename:p});checks++;};
const files=[
 'content/9-geometry-atanasyan/03.js','content/9-geometry-atanasyan/03-methodical-plan.md','topics/9-geometry-atanasyan/03.html',
 'lessons/9-geometry-atanasyan/03/series.js','lessons/9-geometry-atanasyan/03/scenes.js','lessons/9-geometry-atanasyan/03/data.js',
 'assessments/9-geometry-atanasyan/03/data.js','labs/9-geometry-atanasyan/triangle-relations/index.html',
 'labs/9-geometry-atanasyan/triangle-relations/style.css','labs/9-geometry-atanasyan/triangle-relations/app.js'
];
files.forEach(p=>assert(exists(p),`missing ${p}`));
['content/9-geometry-atanasyan/03.js','lessons/9-geometry-atanasyan/03/series.js','lessons/9-geometry-atanasyan/03/scenes.js','lessons/9-geometry-atanasyan/03/data.js','assessments/9-geometry-atanasyan/03/data.js','labs/9-geometry-atanasyan/triangle-relations/app.js'].forEach(compile);

const cap={};vm.runInNewContext(read('content/9-geometry-atanasyan/03.js'),{KTP_REGISTER_CONTENT:(id,d)=>cap[id]=d});
const C=cap['9-geometry-atanasyan::2'];assert(C,'content registry key');assert(C.meta.title.includes('Соотношения'),'topic title');
assert(C.objectives.length>=14,'objectives');assert(C.expectedResults.length>=14,'expected results');assert(C.theory.length>=14,'theory');
assert(C.examples.length>=6,'examples');assert(C.mistakes.length>=7,'mistakes');assert(Object.values(C.practice).reduce((s,a)=>s+a.length,0)>=16,'practice');
assert(C.diagnostic.length>=6,'diagnostic');assert(C.homework.required.length>=6&&C.homework.optional.length>=2,'homework');
assert(C.lab?.href.includes('triangle-relations'),'lab link');assert(Object.keys(C.geometryScenes||{}).length>=7,'topic scenes');
const source=C.source.paragraphs.join(' ');for(const t of ['93–95','96–100','101–104'])assert(source.includes(t),`source missing ${t}`);
assert(C.source.assessment.includes('теме 04'),'next-topic guard');
const mapOrder=C.map.join(' → ');assert(mapOrder.indexOf('Теорема синусов')<mapOrder.indexOf('Теорема косинусов'),'textbook order sine before cosine');

const sb={window:{}};vm.createContext(sb);
for(const p of ['lessons/9-geometry-atanasyan/03/series.js','lessons/9-geometry-atanasyan/03/scenes.js','lessons/9-geometry-atanasyan/03/data.js'])vm.runInContext(read(p),sb,{filename:p});
const S=sb.window.KTP_LESSON_SERIES;assert(S.meta.topicIndex===2&&S.meta.topicNumber===3,'series metadata');
assert(S.meta.totalLessons===14&&S.meta.courseLessonStart===19&&S.meta.courseLessonEnd===32,'series bounds');
assert(S.lessons.length===14,'14 lessons');assert(Object.keys(S.geometryScenes).length>=14,'14 lesson scenes');
for(let i=0;i<14;i++){
 const l=S.lessons[i],n=i+1,g=19+i;assert(l.id===String(n).padStart(2,'0'),`lesson ${n} id`);assert(l.number===n&&l.globalNumber===g,`lesson ${n} numbering`);
 assert(l.objectives.length>=2,`lesson ${n} objectives`);assert(l.theory.length>=2&&l.theory.some(x=>x.figure),`lesson ${n} theory/figure`);
 assert(l.examples.length>=2,`lesson ${n} examples`);assert(l.mistakes.length>=3,`lesson ${n} mistakes`);assert(l.practice.length>=8,`lesson ${n} practice`);
 assert(l.homework.required.length>=6&&l.homework.optional.length>=2,`lesson ${n} homework`);
 for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){
  const a=l[kind];assert(a.variants.length===6,`lesson ${n} ${kind} variants`);assert(a.maxScore===max,`lesson ${n} ${kind} max`);
  const unique=new Set(a.variants.map(v=>JSON.stringify(v.tasks.map(t=>[t.text,t.answer]))));assert(unique.size===6,`lesson ${n} ${kind} must have six distinct variants`);
  for(const v of a.variants){assert(v.tasks.length===count,`lesson ${n} ${kind} count`);assert(v.tasks.reduce((sum,t)=>sum+Number(t.points||0),0)===max,`lesson ${n} ${kind} points`);assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),`lesson ${n} ${kind} completeness`);}
 }
 const h=`lessons/9-geometry-atanasyan/03/${String(n).padStart(2,'0')}.html`;assert(exists(h),`lesson html ${n}`);
}
assert(S.lessons[4].globalNumber===23&&S.lessons[4].title.includes('синусов')&&S.lessons[4].source.section.includes('п. 97'),'lesson 23 must be sine theorem p97');
assert(S.lessons[6].globalNumber===25&&S.lessons[6].title.includes('косинусов')&&S.lessons[6].source.section.includes('п. 98'),'lesson 25 must be cosine theorem p98');
assert(S.lessons[0].independent.variants[0].tasks[0].answer.includes('√3/2')&&S.lessons[0].independent.variants[0].tasks[0].answer.includes('−1/2'),'sin/cos 120');
assert(S.lessons[3].practice.some(t=>t.answer==='20.'||t.answer==='20'),'quadrilateral area sample');
assert(S.lessons[10].practice.some(t=>String(t.answer).includes('Нет')),'zero-vector angle guard');
assert(S.lessons[12].practice.some(t=>String(t.answer).includes('0')),'coordinate dot-product coverage');

const topic=read('topics/9-geometry-atanasyan/03.html');for(const t of ['data-topic="2"','content/9-geometry-atanasyan/03.js','lessons/9-geometry-atanasyan/03/topic-link.js','assessments/topic-links.js','geometry/geometry-scene.js'])assert(topic.includes(t),`topic wiring ${t}`);
const nav=read('assessments/topic-links.js').match(/'9-geometry-atanasyan':\{min:0,max:(\d+)\}/);assert(nav&&Number(nav[1])>=2,'assessment navigation includes topic03');

const ab={window:{}};vm.createContext(ab);vm.runInContext(read('assessments/9-geometry-atanasyan/03/data.js'),ab);
const A=ab.window.KTP_ASSESSMENT_DATA;assert(A.meta.topic==='03','assessment topic');
for(const [kind,count,max] of [['independent',7,14],['control',10,20]]){
 const a=A.topic[kind];assert(a.variants.length===6,`thematic ${kind} variants`);
 assert(new Set(a.variants.map(v=>JSON.stringify(v.tasks))).size===6,`thematic ${kind} six distinct variants`);
 for(const v of a.variants){assert(v.tasks.length===count,`thematic ${kind} count`);assert(v.tasks.reduce((sum,t)=>sum+Number(t.points||0),0)===max,`thematic ${kind} points`);assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),`thematic ${kind} completeness`);}
}
for(const p of ['assessments/9-geometry-atanasyan/03/independent.html','assessments/9-geometry-atanasyan/03/control.html','lessons/9-geometry-atanasyan/03/index.html'])assert(exists(p),`missing ${p}`);
const lab=read('labs/9-geometry-atanasyan/triangle-relations/index.html');for(const t of ['Исследовательский вопрос','Задания для наблюдения','trig','triangle','sine','dot'])assert(lab.includes(t),`lab missing ${t}`);
const method=read('content/9-geometry-atanasyan/03-methodical-plan.md');for(const t of ['геометрическая конфигурация','Четыре представления','Контрастные случаи','assessment blueprint','6 действительно различающихся вариантов','QA release-gate'])assert(method.toLowerCase().includes(t.toLowerCase()),`methodical plan missing ${t}`);
console.log(`Grade 9 Atanasyan topic 03 structural/source QA passed: ${checks} checks.`);