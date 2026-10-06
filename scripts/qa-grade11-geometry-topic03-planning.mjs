import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
let checks=0;
const check=(condition,message)=>{checks++;if(!condition)throw Error(message);};
const close=(a,b,eps=1e-9)=>Math.abs(a-b)<=eps;

const planPath='content/11-geometry-atanasyan/03-methodical-plan.md';
check(exists(planPath),'missing topic 03 methodical plan');
check(exists('content/11-geometry-atanasyan/content-map.md'),'missing grade 11 content map');
check(exists('lessons/11-geometry-atanasyan/lesson-plan.md'),'missing grade 11 lesson plan');
check(exists('geometry/revolution-math.js'),'missing revolution math core');
check(exists('geometry/revolution-scene.js'),'missing revolution renderer');
check(exists('content/11-geometry-atanasyan/01.js'),'topic 01 regression source');
check(exists('content/11-geometry-atanasyan/02.js'),'topic 02 regression source');
check(exists('labs/11-geometry-atanasyan/volume-transform/index.html'),'topic 02 volume lab regression');

const plan=read(planPath);
for(const token of [
  'topic index:** `2`',
  'уроки:** 22–32',
  '26.11–31.12.2026',
  'п. 55 «Объём цилиндра»',
  'п. 59 «Объём конуса»',
  'пп. 60–62*',
  'enrichment-source',
  'V=πr²h',
  'V = 1/3·Sосн·h = 1/3·πr²h',
  'V = πh/3·(R² + Rr + r²)',
  'V = 4/3·πR³',
  'Vсег = πh²(R − h/3)',
  'Vсект = 2/3·πR²h',
  'ρ = √(R²−d²)',
  'k²',
  'k³',
  'CYLINDER_BASE',
  'CONE_FACTOR',
  'SEGMENT_HEIGHT',
  'SIMILAR_K2_K3',
  'revolution-volume',
  '6 вариантов × 7 заданий / 14 баллов',
  '6 вариантов × 10 заданий / 20 баллов',
  '132 поурочных варианта',
  'Этап 1 — математическое ядро и сцены',
  'Этап 5 — thematic assessment и release gate'
])check(plan.includes(token),'methodical plan missing '+token);

const dataCtx={window:{}};
vm.runInNewContext(read('js/data.js'),dataCtx,{filename:'js/data.js'});
const row=dataCtx.window.KTP_DATA.rows.find(r=>r.id==='11-geometry-atanasyan');
check(Boolean(row),'grade 11 geometry row');
check(row.grade===11&&row.subject==='Геометрия'&&row.book==='Атанасян','row identity');
check(JSON.stringify(row.bounds)===JSON.stringify([0,11,21,32,44,56,68]),'row bounds');
check(row.topics[2].title==='Объёмы тел вращения','topic 03 title');
check(row.bounds[2]===21&&row.bounds[3]===32,'topic 03 local range has 11 lessons');

const contentMap=read('content/11-geometry-atanasyan/content-map.md');
for(const token of [
  '| 03 «Объёмы тел вращения» | 22–32 |',
  'пп. 55, 59–62*'
])check(contentMap.includes(token),'content map missing '+token);

const lessonPlan=read('lessons/11-geometry-atanasyan/lesson-plan.md');
const sectionStart=lessonPlan.indexOf('## 03 · «Объёмы тел вращения» · 22–32');
const sectionEnd=lessonPlan.indexOf('## 04 ·',sectionStart);
check(sectionStart>=0&&sectionEnd>sectionStart,'topic 03 lesson-plan section');
const section=lessonPlan.slice(sectionStart,sectionEnd);
for(let n=22;n<=32;n++)check(section.includes(n+'. **'),'lesson plan missing global lesson '+n);
for(const token of ['V = πr²h','V = πr²h/3','V = 4πr³/3','Шаровой сегмент, слой и сектор','Подобные тела вращения']){
  check(section.includes(token),'lesson plan topic 03 missing '+token);
}

const revCtx={window:{}};
vm.runInNewContext(read('geometry/revolution-math.js'),revCtx,{filename:'geometry/revolution-math.js'});
const M=revCtx.window.KTP_REVOLUTION_MATH;
check(Boolean(M&&M.metrics&&M.sphereSection),'revolution math API');
const cyl=M.metrics({type:'cylinder',center:[0,0,0],axis:[0,0,1],radius:3,height:5});
check(close(cyl.volume,45*Math.PI),'cylinder volume exact');
const cone=M.metrics({type:'cone',center:[0,0,0],axis:[0,0,1],radius:3,height:5});
check(close(cone.volume,15*Math.PI),'cone volume exact');
check(close(cyl.volume,3*cone.volume),'cylinder cone ratio 3:1');
const fr=M.metrics({type:'frustum',center:[0,0,0],axis:[0,0,1],radius:2,topRadius:4,height:3});
check(close(fr.volume,28*Math.PI),'frustum volume exact');
const ball=M.metrics({type:'ball',center:[0,0,0],radius:3});
check(close(ball.volume,36*Math.PI),'ball volume exact');
check(close(ball.surfaceArea,36*Math.PI),'sphere area exact');
const sec=M.sphereSection({type:'ball',center:[0,0,0],radius:5},[0,0,1],3);
check(close(sec.radius,4),'sphere section 3-4-5');
check(M.sphereSection({type:'ball',center:[0,0,0],radius:5},[0,0,1],6)===null,'sphere section outside ball');

check(plan.includes('не входит в обязательный контроль серии'),'integral method explicitly non-mandatory');
check(plan.includes('векторы и координаты пространства — это граница следующей серии'),'vector/coordinate boundary');
check(plan.includes('SVG отвечает только за визуализацию; камера не меняет истинные величины.'),'projection metric guard');

console.log('Grade 11 geometry topic 03 planning QA passed: '+checks+' checks.');
