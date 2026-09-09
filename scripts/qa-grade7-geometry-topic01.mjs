import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
let checks=0;
const fail=m=>{throw new Error(m)};
const assert=(v,m)=>{checks++;if(!v)fail(m)};
const abs=p=>path.join(ROOT,p);
const exists=p=>fs.existsSync(abs(p));
const read=p=>fs.readFileSync(abs(p),'utf8');

function compile(file){
  const src=read(file);
  try{new vm.Script(src,{filename:file});checks++;return src}
  catch(e){fail(`${file}: JS syntax error: ${e.message}`)}
}
function finiteTree(value,label,seen=new Set()){
  if(value===undefined)fail(`${label}: undefined`);
  if(typeof value==='number')assert(Number.isFinite(value),`${label}: non-finite`);
  if(typeof value==='string')assert(!/\b(?:NaN|Infinity|undefined)\b/.test(value),`${label}: forbidden runtime token`);
  if(!value||typeof value!=='object'||seen.has(value))return;
  seen.add(value);
  if(Array.isArray(value))value.forEach((v,i)=>finiteTree(v,`${label}[${i}]`,seen));
  else Object.entries(value).forEach(([k,v])=>finiteTree(v,`${label}.${k}`,seen));
}
function tasks(items,label,min){
  assert(Array.isArray(items)&&items.length>=min,`${label}: expected >= ${min}`);
  items.forEach((t,i)=>{
    assert(String(t?.task??t?.text??'').trim(),`${label}[${i}]: task missing`);
    assert(String(t?.answer??'').trim(),`${label}[${i}]: answer missing`);
  });
}
function point(scene,name){
  const p=scene.points?.[name];
  assert(Array.isArray(p)&&p.length===2,`${scene.title}: point ${name} missing`);
  p.forEach((x,i)=>assert(Number.isFinite(Number(x)),`${scene.title}: ${name}[${i}] not finite`));
  return p.map(Number);
}
function dot(a,b,c){
  const u=[a[0]-b[0],a[1]-b[1]],v=[c[0]-b[0],c[1]-b[1]];
  return u[0]*v[0]+u[1]*v[1];
}
function validateScene(id,scene){
  assert(String(scene.title||'').trim(),`${id}: title missing`);
  assert(String(scene.ariaLabel||'').trim(),`${id}: ariaLabel missing`);
  assert(String(scene.caption||'').trim(),`${id}: caption missing`);
  assert(Array.isArray(scene.viewBox)&&scene.viewBox.length===4,`${id}: viewBox`);
  scene.viewBox.forEach((x,i)=>assert(Number.isFinite(Number(x)),`${id}: viewBox[${i}]`));
  assert(scene.points&&Object.keys(scene.points).length>=2,`${id}: points missing`);
  Object.keys(scene.points).forEach(name=>point(scene,name));
  const allowed=new Set(['segment','line','ray','polygon','circle','angle','rightAngle','markEqual','markParallel']);
  assert(Array.isArray(scene.objects)&&scene.objects.length>=1,`${id}: objects missing`);
  for(const obj of scene.objects){
    assert(allowed.has(obj.type),`${id}: unsupported object ${obj.type}`);
    const refs=[];
    if(Array.isArray(obj.points))refs.push(...obj.points);
    if(obj.center)refs.push(obj.center);
    if(obj.vertex)refs.push(obj.vertex);
    if(Array.isArray(obj.arms))refs.push(...obj.arms);
    refs.forEach(name=>point(scene,name));
    if(obj.type==='rightAngle'){
      const a=point(scene,obj.arms[0]),v=point(scene,obj.vertex),b=point(scene,obj.arms[1]);
      assert(Math.abs(dot(a,v,b))<1e-6,`${id}: rightAngle geometry is not perpendicular`);
    }
  }
}

const topic='topics/7-geometry-atanasyan/01.html';
const contentFile='content/7-geometry-atanasyan/01.js';
const geometryJs='geometry/geometry-scene.js';
const geometryCss='geometry/geometry-scene.css';
const geometryReadme='geometry/README.md';
const mapFile='content/7-geometry-atanasyan/content-map.md';
const planFile='lessons/7-geometry-atanasyan/lesson-plan.md';
const browserQa='scripts/qa-grade7-geometry-browser.mjs';

for(const f of [topic,contentFile,geometryJs,geometryCss,geometryReadme,mapFile,planFile,browserQa])assert(exists(f),`${f}: missing`);
for(const f of [contentFile,geometryJs])compile(f);

const html=read(topic);
for(const token of [
  '<meta name="viewport"',
  '../../content/registry.js',
  '../../content/7-geometry-atanasyan/01.js',
  '../../geometry/geometry-scene.css',
  '../../geometry/geometry-scene.js',
  '../topic-page.js'
])assert(html.includes(token),`${topic}: missing ${token}`);

let registered=null;
const ctx=vm.createContext({KTP_REGISTER_CONTENT:(id,data)=>{registered={id,data}},window:{},console});
new vm.Script(read(contentFile),{filename:contentFile}).runInContext(ctx);
assert(registered?.id==='7-geometry-atanasyan::0',`${contentFile}: wrong content id`);
const c=registered.data;
finiteTree(c,contentFile);
assert(c.meta?.title==='Начальные геометрические сведения','wrong topic title');
assert(String(c.meta?.chapter||'').includes('§§1–6'),'textbook range missing');
assert(Array.isArray(c.objectives)&&c.objectives.length>=5,'objectives too short');
assert(Array.isArray(c.expectedResults)&&c.expectedResults.length>=7,'expectedResults too short');
assert(Array.isArray(c.prerequisites)&&c.prerequisites.length>=3,'prerequisites too short');
tasks(c.prerequisiteCheck,'prerequisiteCheck',4);
assert(Array.isArray(c.map)&&c.map.length===6,'topic map must have 6 nodes');
assert(Array.isArray(c.theory)&&c.theory.length>=9,'theory too short');
assert(Array.isArray(c.examples)&&c.examples.length>=5,'examples too short');
c.examples.forEach((ex,i)=>['problem','idea','solution','check','answer'].forEach(k=>assert(String(ex[k]??'').trim(),`example ${i+1}: ${k} missing`)));
assert(Array.isArray(c.mistakes)&&c.mistakes.length>=6,'mistakes too short');
for(const [key,min] of [['basic',4],['standard',4],['transfer',3],['challenge',2]])tasks(c.practice?.[key],`practice.${key}`,min);
tasks(c.diagnostic,'diagnostic',5);
tasks(c.homework?.required,'homework.required',6);
tasks(c.homework?.optional,'homework.optional',2);
assert(Array.isArray(c.summary)&&c.summary.length>=7,'summary too short');
assert(c.lab?.enabled===false,'topic01 pilot should not expose unfinished lab');
assert(String(c.source?.textbook||'').includes('Атанасян'),'textbook source missing');
assert((c.source?.paragraphs||[]).some(x=>String(x).includes('Федеральная')),'federal source mapping missing');
assert((c.source?.paragraphs||[]).some(x=>String(x).includes('ФИПИ')),'FIPI calibration missing');

assert(c.geometryScenes&&Object.keys(c.geometryScenes).length>=4,'geometry scenes missing');
Object.entries(c.geometryScenes).forEach(([id,scene])=>validateScene(id,scene));
const sceneRefs=[...JSON.stringify(c.theory).matchAll(/data-geometry-scene=\\"([^\\"]+)\\"/g)].map(m=>m[1]);
assert(sceneRefs.length>=4,'theory must reference geometry scenes');
sceneRefs.forEach(id=>assert(c.geometryScenes[id],`theory references missing scene ${id}`));

const css=read(geometryCss);
assert(/@media\s*\([^)]*max-width/i.test(css),'geometry CSS: responsive rule missing');
assert(/@media\s+print/i.test(css),'geometry CSS: print rule missing');
assert(css.includes('vector-effect:non-scaling-stroke'),'geometry CSS: non-scaling strokes missing');
const runtime=read(geometryJs);
for(const token of ["type==='segment'","type==='line'","type==='ray'","type==='angle'","type==='rightAngle'","type==='circle'","type==='polygon'"])assert(runtime.includes(token),`geometry runtime missing ${token}`);

const map=read(mapFile);
for(const title of ['Начальные геометрические сведения','Треугольники','Параллельные прямые','Соотношения между сторонами и углами треугольника','Геометрические места точек. Симметрия','Повторение'])assert(map.includes(title),`${mapFile}: ${title} missing`);
assert(map.includes('12 + 13 + 9 + 13 + 13 + 8 = 68'),`${mapFile}: allocation invariant missing`);
assert(map.includes('01.09–08.10.2026'),`${mapFile}: topic01 period missing`);

const plan=read(planFile);
const lessonRows=[...plan.matchAll(/^(\d+)\.\s+.+$/gm)].map(m=>Number(m[1]));
assert(lessonRows.length===68,`${planFile}: expected 68 lesson rows, got ${lessonRows.length}`);
lessonRows.forEach((n,i)=>assert(n===i+1,`${planFile}: expected lesson ${i+1}, got ${n}`));
for(const heading of ['12 уроков (1–12)','13 уроков (13–25)','9 уроков (26–34)','13 уроков (35–47)','13 уроков (48–60)','8 уроков (61–68)'])assert(plan.includes(heading),`${planFile}: heading ${heading} missing`);

assert(c.examples[0].answer==='10,5 см','segment example answer changed');
assert(c.examples[2].answer==='142°','adjacent-angle example answer changed');
assert(c.examples[3].answer==='67°, 113°, 113°','vertical-angle example answer changed');
assert(c.examples[4].answer==='56°','perpendicular-angle example answer changed');
assert(c.practice.challenge.some(t=>String(t.answer).includes('67°')),'challenge 67° answer missing');

const localTargets=[...html.matchAll(/(?:href|src)="([^"]+)"/g)]
  .map(m=>m[1]).filter(x=>x&&!/^(?:https?:|mailto:|data:|#)/.test(x));
for(const target of localTargets){
  const resolved=path.normalize(path.join(path.dirname(topic),target.split(/[?#]/)[0])).replaceAll('\\','/');
  assert(exists(resolved),`${topic}: broken local link ${target} -> ${resolved}`);
}

console.log(`Grade 7 Atanasyan topic 01 QA passed: ${checks} checks; 1 content-ready topic; 5 SVG scenes; 68-lesson line plan.`);
