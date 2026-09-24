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
  'content/10-geometry-atanasyan/04.js',
  'content/10-geometry-atanasyan/04-methodical-plan.md',
  'topics/10-geometry-atanasyan/04.html'
]) assert(exists(p),'missing '+p);

compile('content/10-geometry-atanasyan/04.js');

const captured={};
vm.runInNewContext(read('content/10-geometry-atanasyan/04.js'),{
  KTP_REGISTER_CONTENT:(id,data)=>captured[id]=data
});
const C=captured['10-geometry-atanasyan::3'];
assert(C,'content registry key');
assert(C.meta.title==='Многогранники','title');
assert(C.objectives.length>=18,'objectives');
assert(C.expectedResults.length>=20,'expected results');
assert(C.prerequisites.length>=8,'prerequisites');
assert(C.prerequisiteCheck.length>=4,'prerequisite check');
assert(C.map.length>=9,'map');
assert(C.theory.length>=14,'theory');
assert(C.examples.length>=9,'examples');
assert(C.mistakes.length>=10,'mistakes');
assert(Object.values(C.practice).reduce((s,a)=>s+a.length,0)>=24,'practice');
assert(C.diagnostic.length>=7,'diagnostic');
assert(C.homework.required.length>=8&&C.homework.optional.length>=3,'homework');
assert(C.summary.length>=9,'summary');
assert(C.lab?.href.includes('polyhedron-section'),'lab href');
assert(C.lab?.enabled===false||C.lab?.enabled===true,'lab state');
assert(Object.keys(C.spatialScenes||{}).length>=10,'topic spatial scenes');

const source=C.source.paragraphs.join(' ');
for(const token of [
  'Глава III, §1',
  'пп. 32–34',
  'пп. 35–37',
  'п. 29*',
  'пп. 74–76, 79–80',
  'подобные тела'
]) assert(source.toLowerCase().includes(token.toLowerCase()),'source missing '+token);

for(const token of ['цилиндр','конус','шар/сферу','интегральный']){
  assert(C.source.assessment.toLowerCase().includes(token.toLowerCase()),'source exclusion missing '+token);
}

const core=JSON.stringify({
  theory:C.theory,
  examples:C.examples,
  practice:C.practice,
  diagnostic:C.diagnostic,
  homework:C.homework,
  summary:C.summary
}).toLowerCase();

for(const token of [
  '2n','3n','n+2',
  'n+1','2n',
  's<sub>бок</sub>=p<sub>осн</sub>·h',
  '1/2·p<sub>осн</sub>·l',
  'n<sub>v</sub>−n<sub>e</sub>+n<sub>f</sub>=2',
  'v=s<sub>осн</sub>·h',
  'v=1/3·s<sub>осн</sub>·h',
  'k²','k³'
]) assert(core.includes(token.toLowerCase()),'core concept missing '+token);

const mandatoryText=JSON.stringify([C.theory,C.examples,C.practice,C.diagnostic,C.homework]).toLowerCase();
for(const forbidden of ['объём цилиндра','объём конуса','объём шара','сфера и шар','с помощью интеграла']){
  assert(!mandatoryText.includes(forbidden),'forbidden next-line content leaked: '+forbidden);
}

const exampleByTitle=Object.fromEntries(C.examples.map(x=>[x.title,x]));
assert(exampleByTitle['Сколько элементов у призмы']?.answer.includes('10 вершин'),'prism count answer');
assert(exampleByTitle['Поверхность прямой призмы']?.answer==='166.','prism surface answer');
assert(exampleByTitle['Высота наклонной призмы']?.answer==='120.','oblique prism volume');
assert(exampleByTitle['Правильная пирамида']?.answer==='96.','pyramid surface');
assert(exampleByTitle['Правильная усечённая пирамида']?.answer==='120.','frustum surface');
assert(exampleByTitle['Эйлер']?.answer==='8.','Euler answer');
assert(exampleByTitle['Объём призмы']?.answer==='240.','prism volume answer');
assert(exampleByTitle['Объём пирамиды']?.answer==='180.','pyramid volume answer');
assert(exampleByTitle['Подобные тела']?.answer.includes('9/4')&&exampleByTitle['Подобные тела']?.answer.includes('27/8'),'similar solids answer');

const topic=read('topics/10-geometry-atanasyan/04.html');
for(const token of [
  'data-topic="3"',
  'content/registry.js',
  'content/10-geometry-atanasyan/04.js',
  'assessments/topic-links.js',
  'geometry/spatial-scene.js',
  'geometry/spatial-scene.css'
]) assert(topic.includes(token),'topic wiring '+token);

const links=read('assessments/topic-links.js');
const nav=links.match(/'10-geometry-atanasyan':\{min:0,max:(\d+)\}/);
assert(nav&&Number(nav[1])===2,'topic 04 assessments must remain unpublished during core stage');

const method=read('content/10-geometry-atanasyan/04-methodical-plan.md');
for(const token of ['Подобные тела','polyhedron-section/','Этап 2 · Topic core','Этап 3 · Уроки 43–51'])assert(method.includes(token),'method plan missing '+token);

console.log('Grade 10 Atanasyan topic 04 core QA passed: '+checks+' checks.');
