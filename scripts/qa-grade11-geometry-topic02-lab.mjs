import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let checks=0;
const check=(condition,message)=>{checks++;if(!condition)throw Error(message);};

for(const p of [
  'labs/11-geometry-atanasyan/volume-transform/index.html',
  'labs/11-geometry-atanasyan/volume-transform/style.css',
  'labs/11-geometry-atanasyan/volume-transform/math.js',
  'labs/11-geometry-atanasyan/volume-transform/app.js'
])check(fs.existsSync(path.join(root,p)),'missing '+p);

const ctx={window:{}};
vm.runInNewContext(read('labs/11-geometry-atanasyan/volume-transform/math.js'),ctx,{filename:'volume-transform/math.js'});
const M=ctx.window.KTP_VOLUME_LAB_MATH;
check(Boolean(M),'math API exported');

const p0=M.prismState({a:4,b:3,h:5,shift:0});
const p1=M.prismState({a:4,b:3,h:5,shift:2});
const p2=M.prismState({a:4,b:3,h:5,shift:-3});
check(p0.baseArea===12&&p0.volume===60,'prism base/volume');
check(p0.volume===p1.volume&&p1.volume===p2.volume,'prism shear preserves volume');
check(p0.lateralEdge===5&&p1.lateralEdge>p0.lateralEdge&&p2.lateralEdge>p1.lateralEdge,'prism edge reacts to shift');

const y0=M.pyramidState({a:6,b:4,h:9,shiftX:0,shiftY:0});
const y1=M.pyramidState({a:6,b:4,h:9,shiftX:2,shiftY:-1.5});
check(y0.baseArea===24&&y0.volume===72,'pyramid base/volume');
check(y0.volume===y1.volume,'pyramid horizontal apex shift preserves volume');
check(y1.slantToCenter>y0.slantToCenter,'pyramid slant changes');

for(const [k,a,v] of [[.5,.25,.125],[1,1,1],[1.5,2.25,3.375],[2,4,8],[3,9,27]]){
  const s=M.similarityState({k,baseLength:2,baseArea:5,baseVolume:7});
  check(s.lengthFactor===k,'length factor k='+k);
  check(s.areaFactor===a,'area factor k='+k);
  check(s.volumeFactor===v,'volume factor k='+k);
  check(s.length===2*k&&s.area===5*a&&s.volume===7*v,'scaled metrics k='+k);
}

let thrown=0;
for(const fn of [
  ()=>M.prismState({a:0,b:2,h:3,shift:0}),
  ()=>M.pyramidState({a:2,b:-1,h:3,shiftX:0,shiftY:0}),
  ()=>M.similarityState({k:0,baseLength:1,baseArea:1,baseVolume:1})
]){
  try{fn();}catch{thrown++;}
}
check(thrown===3,'invalid non-positive values rejected');

const html=read('labs/11-geometry-atanasyan/volume-transform/index.html');
for(const token of [
  'data-mode-button="prism"',
  'data-mode-button="pyramid"',
  'data-mode-button="similarity"',
  'id="prismShift"',
  'id="pyrX"',
  'id="pyrY"',
  'id="k"',
  'aria-live="polite"',
  'Tab переводит фокус',
  'math.js',
  'app.js',
  '../../../topics/11-geometry-atanasyan/02.html'
])check(html.includes(token),'lab html '+token);

const app=read('labs/11-geometry-atanasyan/volume-transform/app.js');
for(const token of [
  'M.prismState',
  'M.pyramidState',
  'M.similarityState',
  "dataset.mode='prism'",
  "dataset.mode='pyramid'",
  "dataset.mode='similarity'",
  'Камера'
])check(app.includes(token),'lab app '+token);
check(!/Math\.(hypot|sqrt).*volume/i.test(app),'volume math stays in math core');

const topicSrc=read('content/11-geometry-atanasyan/02.js');
check(topicSrc.includes('enabled:true')&&topicSrc.includes("href:'../../labs/11-geometry-atanasyan/volume-transform/index.html'"),'topic enables lab');
const lessonSrc=read('lessons/11-geometry-atanasyan/02/data.js');
check((lessonSrc.match(/volume-transform\/index\.html/g)||[]).length===1,'lesson data has reusable lab resource');
check(lessonSrc.includes('[4,5,8].includes(local)'),'lab linked to lessons 15, 16 and 19');

console.log('Grade 11 geometry topic 02 volume lab QA passed: '+checks+' checks.');
