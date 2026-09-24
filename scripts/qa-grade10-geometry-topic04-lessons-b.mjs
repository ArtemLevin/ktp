import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const assert=(v,m)=>{checks++;if(!v)throw new Error(m);};
const compile=p=>{new vm.Script(read(p),{filename:p});checks++;};
const num=s=>Number(String(s).match(/-?\d+(?:\.\d+)?/)?.[0]);

for(const p of [
  'lessons/10-geometry-atanasyan/04/series.js',
  'lessons/10-geometry-atanasyan/04/scenes.js',
  'lessons/10-geometry-atanasyan/04/data.js',
  'lessons/10-geometry-atanasyan/04/index.html',
  'lessons/10-geometry-atanasyan/04/topic-link.js',
  'labs/10-geometry-atanasyan/polyhedron-section/index.html',
  'labs/10-geometry-atanasyan/polyhedron-section/style.css',
  'labs/10-geometry-atanasyan/polyhedron-section/app.js'
]) assert(exists(p),'missing '+p);

for(const p of [
  'lessons/10-geometry-atanasyan/04/series.js',
  'lessons/10-geometry-atanasyan/04/scenes.js',
  'lessons/10-geometry-atanasyan/04/data.js',
  'labs/10-geometry-atanasyan/polyhedron-section/app.js'
]) compile(p);

const sb={window:{}};
vm.createContext(sb);
for(const p of [
  'lessons/10-geometry-atanasyan/04/series.js',
  'lessons/10-geometry-atanasyan/04/scenes.js',
  'lessons/10-geometry-atanasyan/04/data.js'
]) vm.runInContext(read(p),sb,{filename:p});

const S=sb.window.KTP_LESSON_SERIES;
assert(S.meta.topicIndex===3&&S.meta.topicNumber===4,'topic meta');
assert(S.meta.totalLessons===18,'18 lessons total');
assert(S.meta.courseLessonStart===43&&S.meta.courseLessonEnd===60,'course bounds 43-60');
assert(['4/5','5/5'].includes(S.meta.implementationStage),'stage 4/5 or later');
assert(S.lessons.length===18,'18 lessons loaded');
assert(Object.keys(S.spatialScenes||{}).length>=18,'18 spatial scenes');

const dist3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const close=(a,b,t=1e-8)=>Math.abs(a-b)<=t;

// Spatial truth must live in 3D coordinates, not in a visually convenient distortion.
{
  const p=S.spatialScenes['g10-p04-07'].points;
  assert(close(dist3(p.A,p.B),dist3(p.B,p.C)),'lesson 49 regular pyramid base must be square');
}
{
  const p=S.spatialScenes['g10-p04-09'].points;
  assert(close(dist3(p.A,p.B),dist3(p.B,p.C)),'lesson 51 frustum lower base must be square');
  assert(close(dist3(p.A1,p.B1),dist3(p.B1,p.C1)),'lesson 51 frustum upper base must be square');
  assert(close(dist3(p.A1,p.B1)/dist3(p.A,p.B),dist3(p.B1,p.C1)/dist3(p.B,p.C)),'lesson 51 frustum bases must be homothetic');
}
{
  const p=S.spatialScenes['g10-p04-10'].points;
  assert(close(dist3(p.A,p.B),dist3(p.B,p.C)),'lesson 52 base must be square');
  assert(close(dist3(p.M,p.N),dist3(p.N,p.P)),'lesson 52 section must be square');
  assert(close(dist3(p.M,p.N)/dist3(p.A,p.B),.5),'lesson 52 section linear scale must be 1/2');
}
{
  const p=S.spatialScenes['g10-p04-11'].points;
  const edges=[['T','A'],['T','C'],['T','D'],['T','E'],['B','A'],['B','C'],['B','D'],['B','E'],['A','C'],['C','D'],['D','E'],['E','A']];
  const lengths=edges.map(([a,b])=>dist3(p[a],p[b]));
  assert(lengths.every(x=>close(x,lengths[0])),'lesson 53 octahedron must be regular in 3D');
}
{
  const p=S.spatialScenes['g10-p04-12'].points;
  const e=[dist3(p.A,p.B),dist3(p.B,p.C),dist3(p.A,p.A1)];
  assert(e.every(x=>close(x,e[0])),'lesson 54 symmetry model must be a true cube');
  assert([p.P,p.Q,p.R,p.T].every(x=>close(x[0],.9)),'lesson 54 symmetry plane must pass through cube center');
}
{
  const p=S.spatialScenes['g10-p04-17'].points;
  const small=[dist3(p.A,p.B),dist3(p.B,p.C),dist3(p.A,p.A1)];
  const large=[dist3(p.E,p.F),dist3(p.F,p.G),dist3(p.E,p.E1)];
  const ratios=large.map((x,i)=>x/small[i]);
  assert(ratios.every(x=>close(x,1.5)),'lesson 59 displayed solids must be exactly similar with k=1.5');
}

const expectedB=[
  'Сечения пирамиды',
  'Правильные многогранники',
  'Симметрия в пространстве',
  'Соотношение Эйлера для многогранников',
  'Понятие объёма и его свойства',
  'Объём призмы',
  'Объём пирамиды',
  'Подобные многогранники. Поверхность и объём',
  'Диагностика и коррекция темы 04'
];

for(let i=9;i<18;i++){
  const l=S.lessons[i],n=i+1,g=43+i,id=String(n).padStart(2,'0');
  assert(l.id===id,'lesson '+id+' id');
  assert(l.number===n&&l.globalNumber===g,'lesson '+id+' global '+g);
  assert(l.title===expectedB[i-9],'lesson '+id+' title');
  assert(l.objectives.length>=3,'lesson '+id+' objectives');
  assert(l.theory.length>=3&&l.theory.some(x=>x.spatialFigure),'lesson '+id+' theory/spatial');
  assert(l.examples.length>=3&&l.examples.every(x=>x.problem&&x.idea&&x.solution&&x.check&&x.answer),'lesson '+id+' examples complete');
  assert(l.mistakes.length>=3,'lesson '+id+' mistakes');
  assert(l.practice.length>=8,'lesson '+id+' practice');
  assert(l.homework.required.length>=6&&l.homework.optional.length>=2,'lesson '+id+' homework');
  assert(l.source.section&&l.source.assessment.includes('п. 31*'),'lesson '+id+' source enrichment boundary');

  for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){
    const a=l[kind];
    assert(a.variants.length===6,'lesson '+id+' '+kind+' variants');
    assert(a.maxScore===max,'lesson '+id+' '+kind+' max');
    const signatures=a.variants.map(v=>JSON.stringify(v.tasks.map(t=>[t.text,t.answer,t.skill])));
    assert(new Set(signatures).size===6,'lesson '+id+' '+kind+' variants distinct');
    for(const v of a.variants){
      assert(v.tasks.length===count,'lesson '+id+' '+kind+' count');
      assert(v.tasks.reduce((s,t)=>s+Number(t.points||0),0)===max,'lesson '+id+' '+kind+' points');
      assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),'lesson '+id+' '+kind+' complete');
    }
  }

  const hp='lessons/10-geometry-atanasyan/04/'+id+'.html';
  assert(exists(hp),'lesson html '+id);
  const h=read(hp);
  for(const token of ['data-topic="3"','data-lesson="'+id+'"','lesson-spatial.js','spatial-scene.js','global-numbering.js']){
    assert(h.includes(token),'lesson '+id+' wiring '+token);
  }
}

// Source boundaries lesson-by-lesson.
for(const [idx,tokens] of [
  [9,['§2','пп. 32–34','ФРП-2025']],
  [10,['§3','п. 36']],
  [11,['§3','пп. 35, 37']],
  [12,['п. 29*','ФРП-2025']],
  [13,['пп. 74–75']],
  [14,['пп. 76, 79']],
  [15,['п. 80']],
  [16,['ФРП-2025']],
  [17,['пп. 74–76, 79–80','ФРП-2025']]
]){
  const src=S.lessons[idx].source.section;
  for(const token of tokens)assert(src.includes(token),'lesson '+(idx+1)+' source '+token);
}

const textLesson=i=>JSON.stringify(S.lessons[i]).toLowerCase();
for(const [idx,tokens] of [
  [9,['параллельное сечение','k²','подоб']],
  [10,['тетраэдр','куб','октаэдр','додекаэдр','икосаэдр']],
  [11,['центр симметрии','плоскость симметрии','180°']],
  [12,['nv−ne+nf=2','выпукл']],
  [13,['v=abc','кубическ']],
  [14,['v=sосн·h','наклонной призме']],
  [15,['1/3·sосн·h','апофем']],
  [16,['k²','k³','кубический корень']],
  [17,['model','height','similar','units']]
]){
  const txt=textLesson(idx);
  for(const token of tokens)assert(txt.includes(token.toLowerCase()),'lesson '+(idx+1)+' semantic '+token);
}

// Independent arithmetic re-checks across all six variants.
for(const v of S.lessons[9].control.variants){
  const t0=v.tasks[0],m=t0.text.match(/сторону (\d+).*?(\d+)\/(\d+)/s);
  assert(m,'lesson 52 variant '+v.id+' parse');
  const a=Number(m[1]),p=Number(m[2]),q=Number(m[3]),expected=a*p/q;
  assert(Math.abs(num(t0.answer)-expected)<1e-9,'lesson 52 variant '+v.id+' side');
  const vals=v.tasks[1].answer.match(/-?\d+(?:\.\d+)?/g).map(Number);
  assert(vals.length>=2&&Math.abs(vals[0]-a*a)<1e-9&&Math.abs(vals[1]-expected*expected)<1e-9,'lesson 52 variant '+v.id+' areas');
}

const solids={
  'тетраэдр':[4,6,4],
  'куб':[8,12,6],
  'октаэдр':[6,12,8],
  'додекаэдр':[20,30,12],
  'икосаэдр':[12,30,20]
};
for(const v of S.lessons[10].control.variants){
  const t=v.tasks[0],name=Object.keys(solids).find(x=>t.text.includes(x));
  assert(name,'lesson 53 variant '+v.id+' solid name');
  const got=t.answer.match(/\d+/g).map(Number),exp=solids[name];
  assert(got[0]===exp[0]&&got[1]===exp[1]&&got[2]===exp[2],'lesson 53 variant '+v.id+' counts');
  assert(exp[0]-exp[1]+exp[2]===2,'lesson 53 '+name+' Euler consistency');
}

for(const v of S.lessons[12].control.variants){
  const t=v.tasks[1],m=t.text.match(/Ne=(\d+).*Nf=(\d+)/);
  assert(m,'lesson 55 variant '+v.id+' parse');
  const Ne=Number(m[1]),Nf=Number(m[2]),expected=2+Ne-Nf;
  assert(num(t.answer)===expected,'lesson 55 variant '+v.id+' Euler answer');
}

for(const v of S.lessons[13].control.variants){
  const t=v.tasks[0],m=t.text.match(/измерения (\d+), (\d+), (\d+)/);
  assert(m,'lesson 56 variant '+v.id+' parse');
  const expected=Number(m[1])*Number(m[2])*Number(m[3]);
  assert(num(t.answer)===expected,'lesson 56 variant '+v.id+' volume');
}

for(const v of S.lessons[14].control.variants){
  const t=v.tasks[0],m=t.text.match(/Sосн=(\d+), h=(\d+)/);
  assert(m,'lesson 57 variant '+v.id+' parse');
  assert(num(t.answer)===Number(m[1])*Number(m[2]),'lesson 57 variant '+v.id+' prism volume');
}

for(const v of S.lessons[15].control.variants){
  const t=v.tasks[0],m=t.text.match(/Sосн=(\d+), h=(\d+)/);
  assert(m,'lesson 58 variant '+v.id+' parse');
  assert(num(t.answer)===Number(m[1])*Number(m[2])/3,'lesson 58 variant '+v.id+' pyramid volume');
}

for(const v of S.lessons[16].control.variants){
  const t0=v.tasks[0],m=t0.text.match(/k=(\d+)/);
  assert(m,'lesson 59 variant '+v.id+' parse');
  const k=Number(m[1]);
  assert(num(t0.answer)===k*k,'lesson 59 variant '+v.id+' area scale');
  assert(num(v.tasks[1].answer)===k*k*k,'lesson 59 variant '+v.id+' volume scale');
}

const mandatory=JSON.stringify(S.lessons).toLowerCase();
for(const forbidden of [
  'объём цилиндра','объём конуса','объём шара',
  'вычисление объёмов тел с помощью интеграла'
]) assert(!mandatory.includes(forbidden),'next-line content leaked: '+forbidden);

const contentCap={};
vm.runInNewContext(read('content/10-geometry-atanasyan/04.js'),{KTP_REGISTER_CONTENT:(id,d)=>contentCap[id]=d});
const C=contentCap['10-geometry-atanasyan::3'];
assert(C.lab?.enabled===true,'topic lab enabled');
assert(C.lab?.planned===false,'topic lab no longer planned-only');
assert(C.lab?.href.includes('polyhedron-section'),'topic lab href');
assert(C.lab?.description.includes('шестиугольника'),'topic lab 3-6 scope');
assert(JSON.stringify(C.theory).includes('поворот на 180°'),'topic axial symmetry precision');

const topic=read('topics/10-geometry-atanasyan/04.html');
assert(topic.includes('lessons/10-geometry-atanasyan/04/topic-link.js'),'topic lesson link');
const link=read('lessons/10-geometry-atanasyan/04/topic-link.js');
assert(link.includes('18 последовательных уроков')&&link.includes('Открыть 18 уроков'),'topic link content');

const lab=read('labs/10-geometry-atanasyan/polyhedron-section/index.html');
for(const token of [
  'presetParallel','presetTriangle','presetPentagon','presetHexagon',
  'planePatch','modeNote','Исследовательский вопрос','Рёбра с вершинами сечения'
]) assert(lab.includes(token),'lab HTML '+token);

const app=read('labs/10-geometry-atanasyan/polyhedron-section/app.js');
for(const token of [
  'planeData','sectionPoints','sortInPlane','sectionMetrics','edgeNamesForPoint','faceName',
  'fa*fb<0','specialPreset','hexagon','lockSeedSliders',
  'P=[dims.a,0,dims.c/2]','Q=[0,dims.b,dims.c/2]','R=[dims.a/2,0,dims.c]'
]) assert(app.includes(token),'lab app '+token);

const method=read('content/10-geometry-atanasyan/04-methodical-plan.md');
for(const token of ['перехода 3↔4↔5 сторон','шестиугольного пресета','общий максимальный случай из 6 сторон']){
  assert(method.includes(token),'method lab invariant '+token);
}

console.log('Grade 10 Atanasyan topic 04 STAGE 4 structural/math release QA passed: '+checks+' checks.');
