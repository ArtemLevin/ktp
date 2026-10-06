import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
let checks=0;
const check=(condition,message)=>{checks++;if(!condition)throw Error(message);};
const near=(value,expected,message,eps=1e-9)=>check(Math.abs(value-expected)<=eps,message+': '+value+' vs '+expected);

const required=[
  'content/11-geometry-atanasyan/03.js',
  'topics/11-geometry-atanasyan/03.html',
  'geometry/grade11-revolution-volume-scenes.js',
  'geometry/revolution-math.js',
  'content/11-geometry-atanasyan/03-methodical-plan.md'
];
for(const p of required)check(exists(p),'missing '+p);
for(const p of required.filter(p=>p.endsWith('.js')))new vm.Script(read(p),{filename:p});

const ctx={window:{}};
ctx.KTP_REGISTER_CONTENT=(key,payload)=>{
  ctx.window.KTP_CONTENT=ctx.window.KTP_CONTENT||{};
  ctx.window.KTP_CONTENT[key]=payload;
};
vm.runInNewContext(read('geometry/grade11-revolution-volume-scenes.js'),ctx,{filename:'scenes'});
vm.runInNewContext(read('content/11-geometry-atanasyan/03.js'),ctx,{filename:'topic'});
vm.runInNewContext(read('geometry/revolution-math.js'),ctx,{filename:'math'});
const T=ctx.window.KTP_CONTENT?.['11-geometry-atanasyan::2'];
const S=ctx.window.KTP_G11_REVOLUTION_VOLUME_SCENES;
const M=ctx.window.KTP_REVOLUTION_MATH;

check(Boolean(T),'topic content registered');
check(T.meta?.title==='Объёмы тел вращения','topic title');
check(T.meta?.status==='content-ready','topic content-ready');
check(T.meta?.chapter?.includes('п. 55')&&T.meta.chapter.includes('пп. 59–62*'),'topic source boundary');
check(T.objectives.length>=8,'objectives');
check(T.expectedResults.length>=10,'expected results');
check(T.prerequisites.length>=6,'prerequisites');
check(T.prerequisiteCheck.length>=5,'prerequisite check');
check(T.map.length>=10,'topic map');
check(T.theory.length===11,'eleven theory blocks');
check(T.examples.length>=10,'worked examples');
check(T.mistakes.length>=12,'mistake matrix');
for(const level of ['basic','standard','transfer','challenge'])check(T.practice[level].length>=4,level+' practice');
check(T.diagnostic.length>=10,'diagnostic');
check(T.homework.required.length>=8&&T.homework.optional.length>=2,'homework 8+2');
check(T.summary.length>=10,'summary');
check(Boolean(T.lab),'topic lab contract');
check(Boolean(T.assessments),'topic assessment contract');
check(Object.keys(T.revolutionScenes).length===11,'topic receives eleven scenes');
check(T.revolutionScenes===S,'topic reuses shared scene registry');

const theoryHtml=T.theory.map(x=>x.html).join('\n');
const refs=[...theoryHtml.matchAll(/data-revolution-scene="([^"]+)"/g)].map(m=>m[1]);
check(refs.length===11,'eleven scene references in theory');
check(new Set(refs).size===11,'eleven distinct scene references');
for(const id of refs)check(Boolean(S[id]),'scene reference '+id);

for(const ex of T.examples){
  for(const key of ['title','problem','idea','solution','check','answer'])check(Boolean(ex[key]),'example field '+key);
}
for(const q of [
  ...T.prerequisiteCheck,
  ...T.practice.basic,...T.practice.standard,...T.practice.transfer,...T.practice.challenge,
  ...T.homework.required,...T.homework.optional
])check(Boolean(q.task&&q.answer),'task answer completeness');

const exampleAnswers=T.examples.map(x=>x.answer);
for(const expected of ['45π.','128π.','96π.','100π.','52π.','36π.','52π/3.','72π.','ρ=4; V=52π/3.','76π/3.']){
  check(exampleAnswers.includes(expected),'worked example answer '+expected);
}

near(M.metrics({type:'cylinder',radius:3,height:5}).volume,45*Math.PI,'example cylinder math');
near(Math.PI*(25-9)*8,128*Math.PI,'example cavity math');
near(M.metrics({type:'cone',radius:6,height:8}).volume,96*Math.PI,'example cone math');
near(M.metrics({type:'cone',radius:5,height:12}).volume,100*Math.PI,'example cone slant math');
near(M.metrics({type:'frustum',radius:5,topRadius:2,height:4}).volume,52*Math.PI,'example frustum math');
near(M.metrics({type:'ball',radius:3}).volume,36*Math.PI,'example ball math');
near(M.sphericalSegmentVolume(5,2),52*Math.PI/3,'example segment math');
near(M.sphericalSectorVolume(6,3),72*Math.PI,'example sector math');
near(M.sphericalLayerVolume(5,-1,2),72*Math.PI,'example layer math');
const section=M.sphereSectionMetrics(5,3);
near(section.sectionRadius,4,'example section radius');
near(section.segmentVolume,52*Math.PI/3,'example section segment');
near(M.metrics({type:'cylinder',radius:2,height:5}).volume+M.metrics({type:'ball',radius:2}).volume/2,76*Math.PI/3,'example composite math');
near(M.sphericalLayerVolume(5,-2,1),72*Math.PI,'optional homework layer');

const source=T.source;
check(source.textbook.includes('Атанасян'),'source textbook');
for(const token of ['п. 55','п. 59','п. 60','п. 61','п. 62*','ФРП-2025']){
  check(source.paragraphs.some(x=>x.includes(token)),'source paragraph '+token);
}
check(source.assessment.includes('Пункт 56')&&source.assessment.includes('enrichment'),'integral source guard');
check(source.assessment.includes('Векторы и координаты пространства относятся к следующей серии'),'next-series boundary');

const topicSource=read('content/11-geometry-atanasyan/03.js');
for(const token of [
  'V=πr²h','V=1/3·πr²h','V=πh/3·(R²+Rr+r²)','V=4/3·πR³',
  'V<sub>сег</sub>=πh²(R−h/3)','V<sub>сект</sub>=2/3·πR²h','ρ=√(R²−d²)','k³'
])check(topicSource.includes(token),'topic formula '+token);
for(const forbidden of ['скалярное произведение','координаты вектора','уравнение плоскости']){
  check(!topicSource.toLowerCase().includes(forbidden),'no premature next-series content '+forbidden);
}

const route=read('topics/11-geometry-atanasyan/03.html');
for(const token of [
  'data-row="11-geometry-atanasyan"','data-topic="2"',
  '../../content/registry.js','../../geometry/grade11-revolution-volume-scenes.js',
  '../../content/11-geometry-atanasyan/03.js','../../geometry/spatial-scene.js',
  '../../geometry/revolution-math.js','../../geometry/revolution-scene.js',
  '../../geometry/revolution-scene.css'
])check(route.includes(token),'route token '+token);
check(route.indexOf('grade11-revolution-volume-scenes.js')<route.indexOf('content/11-geometry-atanasyan/03.js'),'scene registry loads before content');
check(route.indexOf('content/11-geometry-atanasyan/03.js')<route.indexOf('../topic-page.js'),'content loads before page renderer');
check(route.indexOf('../topic-page.js')<route.indexOf('revolution-scene.js'),'topic page renders placeholders before scene renderer');


console.log('Grade 11 geometry topic 03 stage 2 content QA passed: '+checks+' checks.');
