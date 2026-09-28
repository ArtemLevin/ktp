import fs from 'node:fs';
import vm from 'node:vm';

let checks=0;
const check=(condition,message)=>{checks++;if(!condition)throw Error(message);};
const near=(value,expected,message,eps=1e-9)=>check(Math.abs(value-expected)<=eps,`${message}: ${value} vs ${expected}`);
const read=p=>fs.readFileSync(p,'utf8');

const mathPath='geometry/revolution-math.js';
const scenesPath='geometry/grade11-revolution-volume-scenes.js';
const fixturePath='geometry/fixtures/grade11-revolution-volume.html';
const planPath='content/11-geometry-atanasyan/03-methodical-plan.md';
for(const p of [mathPath,scenesPath,fixturePath,planPath,'geometry/revolution-scene.js','geometry/revolution-scene.css'])check(fs.existsSync(p),'missing '+p);

for(const p of [mathPath,scenesPath,'geometry/revolution-scene.js'])new vm.Script(read(p),{filename:p});

const sandbox={window:{},Math,RangeError,TypeError};
vm.runInNewContext(read(mathPath),sandbox,{filename:mathPath});
vm.runInNewContext(read(scenesPath),sandbox,{filename:scenesPath});
const M=sandbox.window.KTP_REVOLUTION_MATH;
const S=sandbox.window.KTP_G11_REVOLUTION_VOLUME_SCENES;
check(Boolean(M),'math API registered');
check(Boolean(S),'scene registry registered');

for(const api of [
  'sphericalSegmentVolume','sphericalSectorVolume','sphericalLayerVolume',
  'similarityFactors','sphereSectionMetrics','sphereCapMetrics'
])check(typeof M[api]==='function','math API '+api);

near(M.sphericalSegmentVolume(3,3),18*Math.PI,'hemisphere segment');
near(M.sphericalSegmentVolume(3,6),36*Math.PI,'full sphere as segment');
near(M.sphericalSectorVolume(3,3),18*Math.PI,'hemisphere sector');
near(M.sphericalLayerVolume(5,-1,2),72*Math.PI,'layer by cap subtraction');
near(M.sphericalLayerVolume(5,-5,5),500*Math.PI/3,'full ball as layer');

const section=M.sphereSectionMetrics(5,3);
near(section.sectionRadius,4,'section radius 3-4-5');
near(section.sectionArea,16*Math.PI,'section area');
near(section.capHeight,2,'near cap height');
near(section.segmentVolume,52*Math.PI/3,'section cap volume');
near(section.sectorVolume,100*Math.PI/3,'section sector volume');

const cap=M.sphereCapMetrics(5,8);
near(cap.signedDistance,-3,'cap signed plane distance');
near(cap.sectionRadius,4,'cap section radius');
near(cap.segmentVolume,M.sphericalSegmentVolume(5,8),'cap segment volume');
near(cap.sectorVolume,M.sphericalSectorVolume(5,8),'cap sector volume');

const similarity=M.similarityFactors(2.5);
near(similarity.lengthFactor,2.5,'similarity length');
near(similarity.areaFactor,6.25,'similarity area');
near(similarity.volumeFactor,15.625,'similarity volume');

const cylinder=M.metrics({type:'cylinder',radius:3,height:5});
const cone=M.metrics({type:'cone',radius:3,height:5});
near(cylinder.volume,45*Math.PI,'cylinder volume');
near(cone.volume,15*Math.PI,'cone volume');
near(cylinder.volume/cone.volume,3,'cylinder cone 3:1');

const frustum=M.metrics({type:'frustum',radius:4,topRadius:2,height:3});
near(frustum.volume,28*Math.PI,'frustum volume');
const almostCone=M.metrics({type:'frustum',radius:4,topRadius:1e-6,height:3}).volume;
near(almostCone,16*Math.PI, 'frustum approaches cone',2e-5);
const cylinderLimit=M.metrics({type:'frustum',radius:4,topRadius:4,height:3}).volume;
near(cylinderLimit,48*Math.PI,'frustum equals cylinder at equal radii');

const invalid=[
  ()=>M.sphericalSegmentVolume(3,0),
  ()=>M.sphericalSegmentVolume(3,6.1),
  ()=>M.sphericalSectorVolume(3,-1),
  ()=>M.sphericalLayerVolume(3,2,-2),
  ()=>M.sphericalLayerVolume(3,-4,1),
  ()=>M.sphereSectionMetrics(3,-.1),
  ()=>M.sphereSectionMetrics(3,3.1),
  ()=>M.sphereCapMetrics(3,6.1),
  ()=>M.similarityFactors(0)
];
for(const [i,fn] of invalid.entries()){
  let thrown=false;try{fn();}catch{thrown=true;}
  check(thrown,'invalid helper input rejected '+(i+1));
}

const ids=Object.keys(S);
check(ids.length===11,'eleven reusable scenes');
const lessons=ids.map(id=>S[id].lesson).sort((a,b)=>a-b);
check(JSON.stringify(lessons)===JSON.stringify([22,23,24,25,26,27,28,29,30,31,32]),'scene lessons 22-32');
check(new Set(lessons).size===11,'one scene per lesson');

for(const [id,scene] of Object.entries(S)){
  check(Boolean(scene.title&&scene.ariaLabel&&scene.caption),'scene accessible metadata '+id);
  check(scene.math&&scene.math.focus,'scene math focus '+id);
  check(scene.camera&&Number.isFinite(scene.camera.yaw)&&Number.isFinite(scene.camera.pitch)&&Number.isFinite(scene.camera.scale),'scene camera '+id);
  check(Array.isArray(scene.camera.origin)&&scene.camera.origin.length===2&&scene.camera.origin.every(Number.isFinite),'scene camera origin '+id);
  const solid=M.model(scene.solid);
  check(Boolean(solid),'scene solid model '+id);
  const first=M.metrics(scene.solid);
  const cameraChanged={...scene.camera,yaw:scene.camera.yaw+47,pitch:scene.camera.pitch-19,scale:scene.camera.scale*1.17};
  check(JSON.stringify(M.metrics(scene.solid))===JSON.stringify(first),'camera-independent metrics '+id);
  check(cameraChanged.yaw!==scene.camera.yaw,'camera mutation fixture '+id);
  if(scene.section?.type==='sphere-plane'){
    const sec=M.sphereSection(scene.solid,scene.section.normal,scene.section.offset);
    check(Boolean(sec),'sphere section exists '+id);
    check(sec.radius>=0,'sphere section radius '+id);
  }
  if(scene.section?.type==='axial'){
    const axial=M.axialSection(scene.solid);
    check(axial.area>0,'axial section area '+id);
  }
}

const cavity=S['g11-volrev-23-cylinder-cavity'].math;
near(Math.PI*(cavity.outerRadius*cavity.outerRadius-cavity.innerRadius*cavity.innerRadius)*cavity.height,3.6465*Math.PI,'cylindrical cavity net volume');
const segmentScene=S['g11-volrev-27-segment'].math;
const segmentState=M.sphereSectionMetrics(segmentScene.radius,segmentScene.distance);
near(segmentState.capHeight,1,'segment scene height');
const sectionScene=S['g11-volrev-29-section'].math;
near(M.sphereSectionMetrics(sectionScene.radius,sectionScene.distance).sectionRadius,1.2,'lesson 29 section radius');
const composite=S['g11-volrev-31-composite'].math;
const compositeVolume=Math.PI*composite.cylinderRadius**2*composite.cylinderHeight+(2/3)*Math.PI*composite.hemisphereRadius**3;
near(compositeVolume,3.744*Math.PI,'composite cylinder hemisphere volume');
const diagnostic=S['g11-volrev-32-diagnostic'].math;
near(Math.hypot(diagnostic.radius,diagnostic.height),diagnostic.slant,'diagnostic slant');

const fixture=read(fixturePath);
for(const id of ids)check(fixture.includes(`data-revolution-scene="${id}"`),'fixture scene '+id);
check(fixture.includes('window.KTP_G11_REVOLUTION_VOLUME_SCENES'),'fixture registry wiring');

const mathSource=read(mathPath);
check(!/camera/i.test(mathSource),'math core has no camera dependency');
const plan=read(planPath);
for(const token of [
  'Этап 1 — математическое ядро и сцены',
  'sphericalSegmentVolume(R,h)',
  'sphericalSectorVolume(R,h)',
  'sphericalLayerVolume(...)',
  'helper для проверки масштаба `k²/k³`',
  'тематическая страница и уроки пока не публикуются'
])check(plan.includes(token),'stage 1 plan token '+token);

console.log('Grade 11 geometry topic 03 stage 1 math/scenes QA passed: '+checks+' checks.');
