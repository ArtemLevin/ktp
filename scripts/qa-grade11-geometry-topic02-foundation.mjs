import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
let checks=0;
const check=(condition,message)=>{checks++;if(!condition)throw Error(message);};

const required=[
  'content/11-geometry-atanasyan/02-methodical-plan.md',
  'content/11-geometry-atanasyan/02.js',
  'topics/11-geometry-atanasyan/02.html',
  'geometry/grade11-volume-scenes.js',
  'lessons/11-geometry-atanasyan/02/series.js',
  'lessons/11-geometry-atanasyan/02/scenes.js'
];
for(const p of required)check(exists(p),`missing ${p}`);

const plan=read(required[0]);
for(const token of [
  'уроки:** 12–21',
  '08.10–23.11.2026',
  'гл. V, §§1–3, пп. 52–54, 57–58',
  'V = Sосн·h',
  'V = 1/3·Sосн·h',
  'k²',
  'k³',
  'HEIGHT_EDGE',
  'FRUSTUM_AVERAGE',
  'volume-transform',
  '6 вариантов × 7 заданий / 14 баллов',
  '6 вариантов × 10 заданий / 20 баллов'
])check(plan.includes(token),`methodical plan missing ${token}`);

const ctx={window:{}};
ctx.KTP_REGISTER_CONTENT=(key,payload)=>{
  ctx.window.KTP_CONTENT=ctx.window.KTP_CONTENT||{};
  ctx.window.KTP_CONTENT[key]=payload;
};
for(const p of [
  'geometry/grade11-volume-scenes.js',
  'content/11-geometry-atanasyan/02.js',
  'lessons/11-geometry-atanasyan/02/series.js',
  'lessons/11-geometry-atanasyan/02/scenes.js'
])vm.runInNewContext(read(p),ctx,{filename:p});

const scenes=ctx.window.KTP_G11_VOLUME_SCENES;
check(scenes&&Object.keys(scenes).length===10,'ten shared spatial scenes');
for(const [id,scene] of Object.entries(scenes)){
  check(Boolean(scene.title&&scene.ariaLabel&&scene.caption&&scene.camera),`${id}: scene metadata`);
  check(scene.points&&Object.keys(scene.points).length>=6,`${id}: enough 3D points`);
  for(const [name,p] of Object.entries(scene.points)){
    check(Array.isArray(p)&&p.length===3&&p.every(Number.isFinite),`${id}:${name} finite [x,y,z]`);
  }
  check(Array.isArray(scene.objects)&&scene.objects.length>=4,`${id}: objects`);
}

const T=ctx.window.KTP_CONTENT?.['11-geometry-atanasyan::1'];
check(Boolean(T),'topic content registered');
check(T.meta?.status==='content-ready','topic content-ready');
check(T.meta?.chapter?.includes('пп. 52–54, 57–58'),'topic source boundary');
check(T.objectives.length>=8&&T.expectedResults.length>=10,'objectives/results');
check(T.prerequisites.length>=5&&T.prerequisiteCheck.length>=4,'prerequisites');
check(T.map.length>=8,'topic map');
check(T.theory.length===10,'ten theory blocks');
check(T.examples.length>=8,'eight worked examples');
check(T.mistakes.length>=9,'diagnostic mistake matrix');
for(const level of ['basic','standard','transfer','challenge'])check(T.practice[level].length>=4,`${level} practice`);
check(T.diagnostic.length>=8,'mini diagnostic');
check(T.homework.required.length>=8&&T.homework.optional.length>=2,'homework');
check(T.summary.length>=10,'summary');
check(T.lab.enabled===false&&T.lab.planned===true,'lab planned, not prematurely enabled');
check(T.assessments.enabled===false&&T.assessments.planned===true,'assessment planned, not prematurely enabled');
check(T.source.paragraphs.some(x=>x.includes('пп. 52–54')),'source p52-54');
check(T.source.paragraphs.some(x=>x.includes('пп. 57–58')),'source p57-58');
check(T.source.assessment.includes('серии 03'),'bodies of revolution deferred');

const theoryHtml=T.theory.map(x=>x.html).join('\n');
const refs=[...theoryHtml.matchAll(/data-spatial-scene="([^"]+)"/g)].map(m=>m[1]);
check(refs.length===10,'one scene reference per theory block');
check(new Set(refs).size===10,'ten distinct scene references');
for(const id of refs)check(Boolean(scenes[id]),`scene reference ${id}`);

for(const ex of T.examples){
  for(const key of ['title','problem','idea','solution','check','answer'])check(Boolean(ex[key]),`example field ${key}`);
}
for(const q of [
  ...T.prerequisiteCheck,
  ...T.practice.basic,...T.practice.standard,...T.practice.transfer,...T.practice.challenge,
  ...T.homework.required,...T.homework.optional
])check(Boolean(q.task&&q.answer),'task and answer');

const source=read('content/11-geometry-atanasyan/02.js');
for(const token of ['V=abc','V=S<sub>осн</sub>·h','V=1/3·S<sub>осн</sub>·h','V=h/3·(S₁+√(S₁S₂)+S₂)','V₂/V₁=k³']){
  check(source.includes(token),`content formula ${token}`);
}
for(const forbidden of ['Vцил=','Vкон=','Vшара=','πr²h','4/3·πr³'])check(!source.includes(forbidden),`no body-of-revolution formula in topic content: ${forbidden}`);

const series=ctx.window.KTP_LESSON_SERIES;
check(series.meta.topicIndex===1&&series.meta.topicNumber===2,'series topic identity');
check(series.meta.totalLessons===10,'series has ten planned lessons');
check(series.meta.courseLessonStart===12&&series.meta.courseLessonEnd===21,'global lessons 12-21');
check(Object.keys(series.spatialScenes).length===10,'lesson scaffold receives shared scenes');

const route=read('topics/11-geometry-atanasyan/02.html');
for(const token of [
  'data-row="11-geometry-atanasyan"',
  'data-topic="1"',
  '../../content/registry.js',
  '../../geometry/grade11-volume-scenes.js',
  '../../content/11-geometry-atanasyan/02.js',
  '../../geometry/spatial-scene.js'
])check(route.includes(token),`topic route token ${token}`);

const diagnostic=scenes['g11-vol-10-diagnostic'];
const mid=(a,b)=>a.map((v,i)=>(v+b[i])/2);
for(const [sectionPoint,basePoint] of [['M','A'],['N','B'],['P','C'],['Q','D']]){
  const expected=mid(diagnostic.points[basePoint],diagnostic.points.S);
  const actual=diagnostic.points[sectionPoint];
  check(actual.every((v,i)=>Math.abs(v-expected[i])<1e-9),`${sectionPoint} lies on pyramid edge`);
}

console.log(`Grade 11 geometry topic 02 foundation QA passed: ${checks} checks.`);
