import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),exists=p=>fs.existsSync(path.join(root,p));
let checks=0;
const check=(condition,message)=>{checks++;if(!condition)throw Error(message);};
const near=(value,expected,message,eps=1e-8)=>check(Math.abs(value-expected)<=eps,message+': '+value+' vs '+expected);

const required=[
  'labs/11-geometry-atanasyan/revolution-volume/index.html',
  'labs/11-geometry-atanasyan/revolution-volume/math.js',
  'labs/11-geometry-atanasyan/revolution-volume/app.js',
  'labs/11-geometry-atanasyan/revolution-volume/style.css',
  'geometry/revolution-math.js',
  'geometry/grade11-revolution-volume-scenes.js',
  'content/11-geometry-atanasyan/03.js',
  'lessons/11-geometry-atanasyan/03/series.js',
  'lessons/11-geometry-atanasyan/03/question-bank.js',
  'lessons/11-geometry-atanasyan/03/scenes.js',
  'lessons/11-geometry-atanasyan/03/data.js',
  'content/11-geometry-atanasyan/03-methodical-plan.md',
  'Plan.md'
];
for(const p of required)check(exists(p),'missing '+p);
for(const p of required.filter(p=>p.endsWith('.js')))new vm.Script(read(p),{filename:p});

const mathCtx={window:{},Math,RangeError,TypeError};
vm.runInNewContext(read('geometry/revolution-math.js'),mathCtx,{filename:'geometry/revolution-math.js'});
vm.runInNewContext(read('labs/11-geometry-atanasyan/revolution-volume/math.js'),mathCtx,{filename:'lab math'});
const M=mathCtx.window.KTP_REVOLUTION_VOLUME_LAB_MATH;
check(Boolean(M),'lab math API');
for(const fn of ['cylinderConeState','frustumState','sphereSegmentState','similarityState'])check(typeof M[fn]==='function','math function '+fn);

const cc=M.cylinderConeState({r:3,h:4});
near(cc.cylinderPi,36,'cylinder pi coefficient');
near(cc.conePi,12,'cone pi coefficient');
near(cc.ratio,3,'cylinder cone ratio');
near(cc.cylinderVolume,36*Math.PI,'cylinder numeric volume');
near(cc.coneVolume,12*Math.PI,'cone numeric volume');

const fr=M.frustumState({R:4,r:2,h:3});
near(fr.volumePi,28,'frustum volume coefficient');
near(fr.sharedVolume,28*Math.PI,'frustum shared math agreement');
const frCone=M.frustumState({R:4,r:0,h:3});
near(frCone.volumePi,16,'frustum cone limit');
check(frCone.coneMatch===true,'frustum cone limit marker');
const frCylinder=M.frustumState({R:4,r:4,h:3});
near(frCylinder.volumePi,48,'frustum cylinder limit');
check(frCylinder.cylinderMatch===true,'frustum cylinder limit marker');

const sp=M.sphereSegmentState({R:5,d:3});
near(sp.sectionRadius,4,'sphere section radius');
near(sp.capHeight,2,'sphere cap height');
near(sp.segmentPi,52/3,'sphere segment pi coefficient');
near(sp.segmentVolume,52*Math.PI/3,'sphere segment volume');
const half=M.sphereSegmentState({R:5,d:0});
check(half.isHemisphere===true,'hemisphere marker');
near(half.capHeight,5,'hemisphere height');
near(half.segmentVolume,250*Math.PI/3,'hemisphere volume');
const tangent=M.sphereSegmentState({R:5,d:5});
check(tangent.isTangent===true,'tangent marker');
near(tangent.sectionRadius,0,'tangent section radius');
near(tangent.capHeight,0,'tangent cap height');
near(tangent.segmentVolume,0,'tangent segment volume');

const sim=M.similarityState({k:2});
near(sim.lengthFactor,2,'similar length factor');
near(sim.areaFactor,4,'similar area factor');
near(sim.volumeFactor,8,'similar volume factor');
near(sim.measuredVolumeFactor,8,'shared cylinder measured volume factor');
const simHalf=M.similarityState({k:.5});
near(simHalf.areaFactor,.25,'half area factor');
near(simHalf.volumeFactor,.125,'half volume factor');

for(const [label,fn] of [
  ['zero cylinder radius',()=>M.cylinderConeState({r:0,h:3})],
  ['zero cone height',()=>M.cylinderConeState({r:2,h:0})],
  ['frustum r>R',()=>M.frustumState({R:2,r:3,h:4})],
  ['negative frustum small radius',()=>M.frustumState({R:2,r:-1,h:4})],
  ['sphere d>R',()=>M.sphereSegmentState({R:4,d:5})],
  ['negative sphere distance',()=>M.sphereSegmentState({R:4,d:-1})],
  ['zero scale',()=>M.similarityState({k:0})]
]){
  let thrown=false;try{fn();}catch{thrown=true;}
  check(thrown,'invalid input rejected: '+label);
}

const html=read('labs/11-geometry-atanasyan/revolution-volume/index.html');
for(const token of [
  'Исследовательский вопрос',
  'data-mode-button="cylinder-cone"',
  'data-mode-button="frustum"',
  'data-mode-button="sphere"',
  'data-mode-button="scale"',
  'id="frCone"','id="frCylinder"','id="spHalf"','id="spTangent"',
  'Пять экспериментов','Что заметили','Связь с теорией',
  '../../../topics/11-geometry-atanasyan/03.html',
  '../../../geometry/revolution-math.js','math.js','app.js'
])check(html.includes(token),'lab HTML token '+token);
check((html.match(/<li>/g)||[]).length===5,'exactly five research tasks');
check(html.includes('Tab перемещает фокус')&&html.includes('стрелки изменяют значение ползунка'),'keyboard instructions');

const css=read('labs/11-geometry-atanasyan/revolution-volume/style.css');
for(const token of ['@media(max-width:820px)','@media(max-width:520px)','@media print','break-inside:avoid'])check(css.includes(token),'responsive/print CSS '+token);

const app=read('labs/11-geometry-atanasyan/revolution-volume/app.js');
for(const token of [
  'renderCylinderCone','renderFrustum','renderSphere','renderScale',
  'aria-pressed','stageDesc','input[type="range"]',
  'KTP_REVOLUTION_VOLUME_LAB_CURRENT'
])check(app.includes(token),'app behavior '+token);
check(!/fetch\(|import\(/.test(app),'app has no network/import runtime dependency');
check(!/<script[^>]+src="https?:/i.test(html),'lab HTML has no external script dependency');

const topicCtx={window:{KTP_G11_REVOLUTION_VOLUME_SCENES:{}}};
topicCtx.KTP_REGISTER_CONTENT=(key,payload)=>{topicCtx.window.content=payload;};
vm.runInNewContext(read('content/11-geometry-atanasyan/03.js'),topicCtx,{filename:'topic content'});
const T=topicCtx.window.content;
check(T.lab.enabled===true&&T.lab.planned===false,'topic lab published');
check(T.lab.href==='../../labs/11-geometry-atanasyan/revolution-volume/index.html','topic lab href');
check(T.assessments.enabled===false&&T.assessments.planned===true,'thematic assessment remains stage 5');

const lessonCtx={window:{}};
vm.runInNewContext(read('geometry/grade11-revolution-volume-scenes.js'),lessonCtx,{filename:'scene registry'});
vm.runInNewContext(read('lessons/11-geometry-atanasyan/03/series.js'),lessonCtx,{filename:'series'});
vm.runInNewContext(read('lessons/11-geometry-atanasyan/03/question-bank.js'),lessonCtx,{filename:'question bank'});
vm.runInNewContext(read('lessons/11-geometry-atanasyan/03/scenes.js'),lessonCtx,{filename:'lesson scenes'});
vm.runInNewContext(read('lessons/11-geometry-atanasyan/03/data.js'),lessonCtx,{filename:'lesson data'});
check(lessonCtx.window.KTP_LESSON_SERIES.lessons.length===11,'eleven lessons retained');
for(const L of lessonCtx.window.KTP_LESSON_SERIES.lessons){
  check(L.resources.some(r=>r.href==='../../../labs/11-geometry-atanasyan/revolution-volume/index.html'),'lesson '+L.id+' lab link');
}

const blueprint=read('content/11-geometry-atanasyan/03-methodical-plan.md');
check(blueprint.includes('Этап 4 — лаборатория')&&blueprint.includes('revolution-volume')&&blueprint.includes('**реализован**'),'blueprint stage4 implemented');
for(const token of ['цилиндр ↔ конус','усечённый конус','шаровой сегмент','k²/k³','5 исследовательских заданий'])check(blueprint.includes(token),'blueprint lab token '+token);
const plan=read('Plan.md');
check(plan.includes('этапы 1–4 завершены'),'Plan stage 1-4');
check(plan.includes('этап 5 — thematic assessment 6×7/14 + 6×10/20'),'Plan next stage 5');

console.log('Grade 11 geometry topic 03 revolution-volume lab QA passed: '+checks+' checks.');