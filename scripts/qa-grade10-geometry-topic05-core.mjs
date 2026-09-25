import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const assert=(v,m)=>{checks++;if(!v)throw new Error(m);};
const compile=p=>{new vm.Script(read(p),{filename:p});checks++;};
const dist3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const close=(a,b,t=1e-8)=>Math.abs(a-b)<=t;

for(const p of [
  'content/10-geometry-atanasyan/05.js',
  'content/10-geometry-atanasyan/05-methodical-plan.md',
  'topics/10-geometry-atanasyan/05.html'
]) assert(exists(p),'missing '+p);

compile('content/10-geometry-atanasyan/05.js');

const captured={};
vm.runInNewContext(read('content/10-geometry-atanasyan/05.js'),{
  KTP_REGISTER_CONTENT:(id,data)=>captured[id]=data
});
const C=captured['10-geometry-atanasyan::4'];
assert(C,'content registry key');
assert(C.meta.title==='Повторение','title');
assert(C.objectives.length>=10,'objectives');
assert(C.expectedResults.length>=20,'expected results');
assert(C.prerequisites.length>=10,'prerequisites');
assert(C.prerequisiteCheck.length>=4,'prerequisite checks');
assert(C.map.length===8,'8-stage map');
assert(C.theory.length>=11,'theory blocks');
assert(C.examples.length>=9,'examples');
assert(C.mistakes.length>=10,'mistakes');
assert(Object.values(C.practice).reduce((s,a)=>s+a.length,0)>=24,'practice >=24');
assert(C.diagnostic.length>=11,'diagnostic domains');
assert(C.homework.required.length>=8&&C.homework.optional.length>=3,'homework');
assert(C.summary.length>=9,'summary');
assert(C.lab?.href.includes('spatial-router'),'router href');
assert(Object.keys(C.spatialScenes||{}).length>=8,'topic spatial scenes');

const source=C.source.paragraphs.join(' ');
for(const token of [
  'Введение, пп. 1–3',
  'Глава I, §§1–4, пп. 4–14',
  'Глава II, §§1–3, пп. 15–24',
  'Глава III, §§1–3, пп. 27–30, 32–37',
  'пп. 74–76, 79–80',
  'ФРП-2025'
]) assert(source.includes(token),'source missing '+token);

for(const token of ['пп. 25*–26*','п. 31*','цилиндр','конус','сферу/шар','интегральный','векторы и координаты пространства']){
  assert(C.source.assessment.toLowerCase().includes(token.toLowerCase()),'source guard missing '+token);
}

const core=JSON.stringify({
  theory:C.theory,examples:C.examples,practice:C.practice,
  diagnostic:C.diagnostic,homework:C.homework,summary:C.summary
}).toLowerCase();

for(const token of [
  'v=s<sub>осн</sub>·h',
  'v=1/3·s<sub>осн</sub>·h',
  'k²','k³',
  'nv−ne+nf=2',
  'две пересекающиеся прямые',
  'ортогональную проекцию',
  'линейный угол'
]) assert(core.includes(token.toLowerCase()),'core concept missing '+token);

for(const code of ['READ','REL','COND','PLANE','PROJ','SECTION','METRIC','SURFACE','VOLUME','LOGIC','CHECK']){
  assert(core.includes(code.toLowerCase()),'diagnostic code missing '+code);
}

const mandatory=JSON.stringify([C.theory,C.examples,C.practice,C.diagnostic,C.homework]).toLowerCase();
for(const forbidden of [
  'объём цилиндра','объём конуса','объём шара',
  'координаты в пространстве','векторы в пространстве',
  'скалярное произведение в пространстве','с помощью интеграла'
]) assert(!mandatory.includes(forbidden),'future-course content leaked: '+forbidden);

const ex=Object.fromEntries(C.examples.map(x=>[x.title,x]));
assert(ex['Наклонная призма: боковое ребро не является высотой']?.answer==='120.','oblique prism example');
assert(ex['Практическая модель коробки']?.answer==='0,48 м³.','box example');
assert(ex['Параллельное сечение пирамиды']?.answer==='36.','section area example');
assert(ex['Перенос перпендикулярности через параллельность']?.answer==='b⊥α.','perpendicular transfer');
assert(ex['Расстояние и наклонная']?.answer==='8.','distance example');
assert(ex['Угол прямой с плоскостью']?.answer==='3/5.','line-plane angle example');
assert(ex['Поверхность и объём правильной пирамиды']?.answer.includes('96')&&ex['Поверхность и объём правильной пирамиды']?.answer.includes('48'),'surface-volume example');
assert(ex['Подобные тела']?.answer.includes('4 раза')&&ex['Подобные тела']?.answer.includes('8 раз'),'similarity example');
assert(ex['Соотношение Эйлера как проверка']?.answer==='12.','Euler example');

// Spatial truth checks.
{
  const p=C.spatialScenes['g10-review-relations'].points;
  const u=sub(p.B,p.A),v=sub(p.C1,p.C),w=sub(p.C,p.A);
  assert(Math.abs(dot(cross(u,v),w))>1e-6,'AB and CC1 must be truly skew');
}
{
  const p=C.spatialScenes['g10-review-volume'].points;
  assert(close(p.H[2],p.A1[2]),'height endpoint in upper base plane');
  assert(close(p.H[0],p.A[0])&&close(p.H[1],p.A[1]),'AH perpendicular to horizontal bases');
  assert(dist3(p.A,p.A1)>dist3(p.A,p.H),'oblique edge longer than height');
}
{
  const p=C.spatialScenes['g10-review-section'].points;
  const pred=[
    p.M[0]+(p.N[0]-p.M[0])+(p.Q[0]-p.M[0]),
    p.M[1]+(p.N[1]-p.M[1])+(p.Q[1]-p.M[1]),
    p.M[2]+(p.N[2]-p.M[2])+(p.Q[2]-p.M[2])
  ];
  assert(pred.every((x,i)=>close(x,p.P[i])),'section MNPQ coplanar');
}
{
  const p=C.spatialScenes['g10-review-perpendicular'].points;
  const sh=sub(p.S,p.H),xy=sub(p.Y,p.X),uv=sub(p.V,p.U);
  assert(close(dot(sh,xy),0)&&close(dot(sh,uv),0),'SH perpendicular to two intersecting plane lines');
  assert(close(dot(xy,uv),0),'supporting plane lines intersect at right angle in model');
}
{
  const p=C.spatialScenes['g10-review-distance'].points;
  const sh=sub(p.S,p.H),ha=sub(p.A,p.H);
  assert(close(dot(sh,ha),0),'distance working triangle right at H');
}
{
  const p=C.spatialScenes['g10-review-line-plane-angle'].points;
  const sh=sub(p.S,p.H),ha=sub(p.A,p.H);
  assert(close(dot(sh,ha),0),'line-plane angle uses true orthogonal projection');
}
{
  const p=C.spatialScenes['g10-review-dihedral'].points;
  const edge=sub(p.E2,p.E1),oa=sub(p.A,p.O),ob=sub(p.B,p.O);
  assert(close(dot(edge,oa),0)&&close(dot(edge,ob),0),'linear-angle rays perpendicular to dihedral edge');
}
{
  const p=C.spatialScenes['g10-review-similar'].points;
  const small=[dist3(p.A,p.B),dist3(p.B,p.C),dist3(p.A,p.A1)];
  const large=[dist3(p.E,p.F),dist3(p.F,p.G),dist3(p.E,p.E1)];
  const ratios=large.map((x,i)=>x/small[i]);
  assert(ratios.every(x=>close(x,1.5)),'similar solids exact k=1.5');
}

const topic=read('topics/10-geometry-atanasyan/05.html');
for(const token of [
  'data-topic="4"',
  'content/registry.js',
  'content/10-geometry-atanasyan/05.js',
  'assessments/topic-links.js',
  'geometry/spatial-scene.js',
  'geometry/spatial-scene.css'
]) assert(topic.includes(token),'topic wiring '+token);

const links=read('assessments/topic-links.js');
const nav=links.match(/'10-geometry-atanasyan':\{min:0,max:(\d+)\}/);
assert(nav&&Number(nav[1])>=3,'assessment navigation must retain topic 04');

const method=read('content/10-geometry-atanasyan/05-methodical-plan.md');
for(const token of ['spatial-router/','Этап 2 · Topic core','Этап 3 · Уроки 61–64','Этап 5 · Assessments + closure всей линии']){
  assert(method.includes(token),'method plan missing '+token);
}

console.log('Grade 10 Atanasyan topic 05 core QA passed: '+checks+' checks.');
