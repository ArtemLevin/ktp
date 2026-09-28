import fs from 'node:fs';
import vm from 'node:vm';

let checks=0;
const assert=(ok,msg)=>{checks++;if(!ok)throw Error(msg);};
const near=(value,expected,msg)=>assert(Math.abs(value-expected)<1e-9,`${msg}: ${value} vs ${expected}`);
const files=['geometry/revolution-math.js','geometry/revolution-scene.js','geometry/revolution-scene.css','geometry/fixtures/grade11-revolution.html'];
for(const file of files)assert(fs.existsSync(file),`missing ${file}`);
for(const file of files.slice(0,2))new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
const sandbox={window:{},Math,RangeError,TypeError};
vm.runInNewContext(fs.readFileSync(files[0],'utf8'),sandbox);
const M=sandbox.window.KTP_REVOLUTION_MATH;

const cylinder={type:'cylinder',radius:3,height:4};
const c=M.metrics(cylinder);
near(c.lateralArea,24*Math.PI,'cylinder lateral');near(c.totalArea,42*Math.PI,'cylinder total');near(c.volume,36*Math.PI,'cylinder volume');
const cone={type:'cone',radius:3,height:4};
const k=M.metrics(cone);
near(k.slant,5,'cone slant');near(k.lateralArea,15*Math.PI,'cone lateral');near(k.totalArea,24*Math.PI,'cone total');near(k.volume,12*Math.PI,'cone volume');
const frustum={type:'frustum',radius:3,topRadius:2,height:4};
const f=M.metrics(frustum);
near(f.slant,Math.sqrt(17),'frustum slant');near(f.lateralArea,5*Math.PI*Math.sqrt(17),'frustum lateral');near(f.volume,76*Math.PI/3,'frustum volume');
const sphere={type:'sphere',radius:5};
const s=M.metrics(sphere);
near(s.area,100*Math.PI,'sphere area');assert(!('volume' in s),'surface has no volume');
const ball={type:'ball',radius:5};
near(M.metrics(ball).surfaceArea,100*Math.PI,'ball surface area');near(M.metrics(ball).volume,500*Math.PI/3,'ball volume');
near(M.sphericalSegmentVolume(5,5),250*Math.PI/3,'hemisphere segment volume');
near(M.sphericalSegmentVolume(5,10),500*Math.PI/3,'full ball segment limit');
near(M.sphericalSectorVolume(5,5),250*Math.PI/3,'hemisphere sector volume');
near(M.sphericalLayerVolume(5,-1,2),72*Math.PI,'spherical layer volume');
near(M.sphereSectionMetrics(5,3).sectionRadius,4,'section metrics radius');
near(M.sphereSectionMetrics(5,3).capHeight,2,'section metrics cap height');
near(M.sphereCapMetrics(5,8).sectionRadius,4,'cap metrics radius');
near(M.similarityFactors(2).areaFactor,4,'similarity area factor');
near(M.similarityFactors(2).volumeFactor,8,'similarity volume factor');
near(M.axialSection(cylinder).area,24,'cylinder axial area');
near(M.axialSection(cone).area,12,'cone axial area');
near(M.axialSection(frustum).area,20,'frustum axial area');
near(M.parallelSection(cone,2).radius,1.5,'cone halfway radius');
near(M.parallelSection(frustum,2).radius,2.5,'frustum halfway radius');
near(M.parallelSection(cylinder,2).area,9*Math.PI,'cylinder section area');
near(M.sphereSection(ball,[0,0,1],3).radius,4,'ball secant radius');
assert(M.sphereSection(sphere,[0,0,1],5).tangent,'sphere tangent');
assert(M.sphereSection(sphere,[0,0,1],6)===null,'sphere disjoint');
const rotated=M.sphereSection({type:'sphere',center:[2,3,4],radius:5},[0,3,4],3);
near(rotated.radius,4,'rotated section radius');
near(rotated.center[0],2,'rotated center x');near(rotated.center[1],4.8,'rotated center y');near(rotated.center[2],6.4,'rotated center z');
for(const bad of [{type:'cylinder',radius:0,height:2},{type:'cone',radius:-2,height:3},{type:'frustum',radius:1,topRadius:0,height:2},{type:'sphere',radius:Infinity}]){
  let thrown=false;try{M.metrics(bad);}catch{thrown=true;}assert(thrown,'invalid solid rejected');
}
let thrown=false;try{M.parallelSection(cone,5);}catch{thrown=true;}assert(thrown,'out of range section rejected');
for(const [label,fn] of [
  ['zero segment height',()=>M.sphericalSegmentVolume(5,0)],
  ['oversized segment height',()=>M.sphericalSegmentVolume(5,11)],
  ['reversed layer planes',()=>M.sphericalLayerVolume(5,2,-1)],
  ['section distance outside ball',()=>M.sphereSectionMetrics(5,6)],
  ['zero similarity factor',()=>M.similarityFactors(0)]
]){
  let rejected=false;try{fn();}catch{rejected=true;}assert(rejected,label+' rejected');
}
const ring=M.circle([1,2,3],[0,0,1],2);
assert(ring.length===96,'circle samples');
for(const p of ring)near(Math.hypot(p[0]-1,p[1]-2,p[2]-3),2,'circle stays in 3D');
const fixture=fs.readFileSync(files[3],'utf8');
for(const name of ['cylinder','cone','frustum','sphere-section','sphere-tangent'])assert(fixture.includes(`data-revolution-scene="${name}"`),`fixture ${name}`);
console.log(`Grade 11 revolution core QA passed: ${checks} checks.`);
