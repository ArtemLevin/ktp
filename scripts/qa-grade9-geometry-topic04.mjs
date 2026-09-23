import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';
const ROOT=process.cwd();let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8'),exists=p=>fs.existsSync(path.join(ROOT,p));
const assert=(v,m)=>{checks++;if(!v)throw new Error(m)},compile=p=>{new vm.Script(read(p),{filename:p});checks++;};
const files=[
 'content/9-geometry-atanasyan/04.js','content/9-geometry-atanasyan/04-methodical-plan.md','topics/9-geometry-atanasyan/04.html',
 'lessons/9-geometry-atanasyan/04/series.js','lessons/9-geometry-atanasyan/04/scenes.js','lessons/9-geometry-atanasyan/04/data.js',
 'assessments/9-geometry-atanasyan/04/data.js','assessments/9-geometry-atanasyan/04/independent.html','assessments/9-geometry-atanasyan/04/control.html',
 'labs/9-geometry-atanasyan/circle-measures/index.html','labs/9-geometry-atanasyan/circle-measures/style.css','labs/9-geometry-atanasyan/circle-measures/app.js'
];
files.forEach(p=>assert(exists(p),`missing ${p}`));
['content/9-geometry-atanasyan/04.js','lessons/9-geometry-atanasyan/04/series.js','lessons/9-geometry-atanasyan/04/scenes.js','lessons/9-geometry-atanasyan/04/data.js','assessments/9-geometry-atanasyan/04/data.js','labs/9-geometry-atanasyan/circle-measures/app.js'].forEach(compile);

const cap={};vm.runInNewContext(read('content/9-geometry-atanasyan/04.js'),{KTP_REGISTER_CONTENT:(id,d)=>cap[id]=d});
const C=cap['9-geometry-atanasyan::3'];assert(C,'content registry key');assert(C.meta.title==='Длина окружности и площадь круга','topic title');
assert(C.objectives.length>=14,'objectives');assert(C.expectedResults.length>=14,'expected results');assert(C.theory.length>=13,'theory');
assert(C.examples.length>=8,'examples');assert(C.mistakes.length>=8,'mistakes');assert(Object.values(C.practice).reduce((s,a)=>s+a.length,0)>=16,'practice');
assert(C.diagnostic.length>=6,'diagnostic');assert(C.homework.required.length>=6&&C.homework.optional.length>=2,'homework');
assert(C.lab?.href.includes('circle-measures'),'lab link');assert(Object.keys(C.geometryScenes||{}).length>=9,'topic scenes');
const source=C.source.paragraphs.join(' ');for(const t of ['105–109','п. 110','111–112','радиан','сегмент'])assert(source.includes(t),`source/crosswalk missing ${t}`);
assert(C.source.assessment.includes('темой 05'),'next-topic guard');
for(const t of ['aₙ=2R','r=R','C=2πR','l=Rφ','S=πR²','Sсектора','Sсегм'])assert(C.theory.map(x=>x.html).join(' ').includes(t),`theory formula missing ${t}`);

const sb={window:{}};vm.createContext(sb);
for(const p of ['lessons/9-geometry-atanasyan/04/series.js','lessons/9-geometry-atanasyan/04/scenes.js','lessons/9-geometry-atanasyan/04/data.js'])vm.runInContext(read(p),sb,{filename:p});
const S=sb.window.KTP_LESSON_SERIES;
assert(S.meta.topicIndex===3&&S.meta.topicNumber===4,'series metadata');assert(S.meta.totalLessons===10&&S.meta.courseLessonStart===33&&S.meta.courseLessonEnd===42,'series bounds');
assert(S.lessons.length===10,'10 lessons');assert(Object.keys(S.geometryScenes).length>=10,'10 lesson scenes');
for(let i=0;i<10;i++){
 const l=S.lessons[i],n=i+1,g=33+i;assert(l.id===String(n).padStart(2,'0'),`lesson ${n} id`);assert(l.number===n&&l.globalNumber===g,`lesson ${n} numbering`);
 assert(l.objectives.length>=2,`lesson ${n} objectives`);assert(l.theory.length>=2&&l.theory.some(x=>x.figure),`lesson ${n} theory/figure`);
 assert(l.examples.length>=2,`lesson ${n} examples`);assert(l.mistakes.length>=3,`lesson ${n} mistakes`);assert(l.practice.length>=8,`lesson ${n} practice`);
 assert(l.homework.required.length>=6&&l.homework.optional.length>=2,`lesson ${n} homework`);
 for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){
  const a=l[kind];assert(a.variants.length===6,`lesson ${n} ${kind} variants`);assert(a.maxScore===max,`lesson ${n} ${kind} max`);
  assert(new Set(a.variants.map(v=>JSON.stringify(v.tasks.map(t=>[t.text,t.answer])))).size===6,`lesson ${n} ${kind} six distinct variants`);
  for(const v of a.variants){assert(v.tasks.length===count,`lesson ${n} ${kind} count`);assert(v.tasks.reduce((sum,t)=>sum+Number(t.points||0),0)===max,`lesson ${n} ${kind} points`);assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),`lesson ${n} ${kind} completeness`);}
 }
 assert(exists(`lessons/9-geometry-atanasyan/04/${String(n).padStart(2,'0')}.html`),`lesson html ${n}`);
}
const expectedSections=['п. 105','п. 106','п. 107','п. 108','п. 109','п. 110','п. 110 + ФРП','п. 111','п. 112 + ФРП','пп. 105–112 + ФРП'];
expectedSections.forEach((x,i)=>assert(S.lessons[i].source.section.includes(x),`lesson ${i+33} source ${x}`));
assert(S.lessons[0].independent.variants[3].tasks[0].answer==='60°.','regular hex central angle');
assert(S.lessons[0].independent.variants[3].tasks[1].answer==='120°.','regular hex interior angle');
assert(S.lessons[3].independent.variants[2].tasks[0].answer==='5.','a6=R');
assert(S.lessons[3].independent.variants[0].tasks[1].answer==='2.','r3=R/2');
assert(S.lessons[5].independent.variants[0].tasks[0].answer==='8π.','circumference C=2πR');
assert(S.lessons[6].independent.variants[2].tasks[1].answer==='π/3 рад.','60 degrees radians');
assert(S.lessons[6].independent.variants[2].tasks[0].answer==='3π.','arc formula');
assert(S.lessons[7].independent.variants[2].tasks[0].answer==='25π.','circle area');
assert(S.lessons[8].independent.variants[3].tasks[0].answer==='16π.','sector area');
assert(S.lessons[8].independent.variants[3].tasks[2].answer==='16π−32.','segment area');

const topic=read('topics/9-geometry-atanasyan/04.html');for(const t of ['data-topic="3"','content/9-geometry-atanasyan/04.js','lessons/9-geometry-atanasyan/04/topic-link.js','assessments/topic-links.js','geometry/geometry-scene.js'])assert(topic.includes(t),`topic wiring ${t}`);
const nav=read('assessments/topic-links.js').match(/'9-geometry-atanasyan':\{min:0,max:(\d+)\}/);assert(nav&&Number(nav[1])>=3,'assessment navigation includes topic04');

const ab={window:{}};vm.createContext(ab);vm.runInContext(read('assessments/9-geometry-atanasyan/04/data.js'),ab);
const A=ab.window.KTP_ASSESSMENT_DATA;assert(A.meta.topic==='04','assessment topic');
for(const [kind,count,max] of [['independent',7,14],['control',10,20]]){
 const a=A.topic[kind];assert(a.variants.length===6,`thematic ${kind} variants`);
 assert(new Set(a.variants.map(v=>JSON.stringify(v.tasks.map(t=>[t.text,t.answer])))).size===6,`thematic ${kind} six distinct variants`);
 for(const v of a.variants){assert(v.tasks.length===count,`thematic ${kind} count`);assert(v.tasks.reduce((sum,t)=>sum+Number(t.points||0),0)===max,`thematic ${kind} points`);assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),`thematic ${kind} completeness`);}
}
const lab=read('labs/9-geometry-atanasyan/circle-measures/index.html');for(const t of ['Исследовательский вопрос','Наблюдения, которые нужно получить самому','limit','polygon','arc','segment'])assert(lab.includes(t),`lab missing ${t}`);
const app=read('labs/9-geometry-atanasyan/circle-measures/app.js');for(const t of ['2*n*R*Math.sin','2*n*R*Math.tan','R*phi','.5*R*R*phi','sector-tri'])assert(app.includes(t),`lab math missing ${t}`);
const method=read('content/9-geometry-atanasyan/04-methodical-plan.md');for(const t of ['правильный n-угольник →','Четыре представления','Ключевые инварианты','assessment blueprint','6 **реально различающихся** вариантов','QA release-gate'])assert(method.toLowerCase().includes(t.toLowerCase()),`methodical plan missing ${t}`);
console.log(`Grade 9 Atanasyan topic 04 structural/source QA passed: ${checks} checks.`);