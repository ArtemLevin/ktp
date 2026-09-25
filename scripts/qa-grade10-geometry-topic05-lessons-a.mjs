import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const assert=(v,m)=>{checks++;if(!v)throw new Error(m);};
const compile=p=>{new vm.Script(read(p),{filename:p});checks++;};
const nums=s=>(String(s).match(/-?\d+(?:[.,]\d+)?/g)||[]).map(x=>Number(x.replace(',','.')));
const first=s=>nums(s)[0];
const close=(a,b,t=1e-8)=>Math.abs(a-b)<=t;

for(const p of [
  'lessons/10-geometry-atanasyan/05/series.js',
  'lessons/10-geometry-atanasyan/05/scenes.js',
  'lessons/10-geometry-atanasyan/05/data.js',
  'lessons/10-geometry-atanasyan/05/index.html'
]) assert(exists(p),'missing '+p);

for(const p of [
  'lessons/10-geometry-atanasyan/05/series.js',
  'lessons/10-geometry-atanasyan/05/scenes.js',
  'lessons/10-geometry-atanasyan/05/data.js'
]) compile(p);

const sb={window:{}};
vm.createContext(sb);
for(const p of [
  'lessons/10-geometry-atanasyan/05/series.js',
  'lessons/10-geometry-atanasyan/05/scenes.js',
  'lessons/10-geometry-atanasyan/05/data.js'
]) vm.runInContext(read(p),sb,{filename:p});

const S=sb.window.KTP_LESSON_SERIES;
assert(S,'series');
assert(S.meta.topicIndex===4&&S.meta.topicNumber===5,'topic meta');
assert(S.meta.totalLessons>=4,'at least four stage-3 lessons');
assert(S.meta.plannedTotalLessons===8,'planned total 8');
assert(S.meta.courseLessonStart===61&&S.meta.courseLessonEnd>=64,'published bounds include 61-64');
assert(S.meta.plannedCourseLessonEnd===68&&S.meta.courseTotal===68,'annual bounds');
assert(['3/5','4/5','5/5'].includes(S.meta.implementationStage),'stage 3/5 or later');
assert(S.lessons.length>=4,'lessons include 61-64');
assert(Object.keys(S.spatialScenes||{}).length>=4,'four spatial scenes');

const expected=[
  'Объёмы многогранников: систематизация',
  'Практико-ориентированные задачи на объём',
  'Сечения: итоговый маршрут построения',
  'Параллельность и перпендикулярность: карта признаков'
];

for(let i=0;i<4;i++){
  const l=S.lessons[i],id=String(i+1).padStart(2,'0'),global=61+i;
  assert(l.id===id,'lesson '+id+' id');
  assert(l.number===i+1&&l.globalNumber===global,'lesson '+id+' global');
  assert(l.title===expected[i],'lesson '+id+' title');
  assert(l.objectives.length>=3,'lesson '+id+' objectives');
  assert(l.theory.length>=3&&l.theory.some(x=>x.spatialFigure),'lesson '+id+' theory/spatial');
  assert(l.examples.length>=3&&l.examples.every(x=>x.problem&&x.idea&&x.solution&&x.check&&x.answer),'lesson '+id+' examples');
  assert(l.mistakes.length>=3,'lesson '+id+' mistakes');
  assert(l.practice.length>=8,'lesson '+id+' practice');
  assert(l.homework.required.length>=6&&l.homework.optional.length>=2,'lesson '+id+' homework');
  assert(l.source.assessment.includes('не вводит новых теорем'),'lesson '+id+' no-new-theorems guard');
  assert(l.source.assessment.includes('п. 31*'),'lesson '+id+' enrichment guard');

  for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){
    const a=l[kind];
    assert(a.variants.length===6,'lesson '+id+' '+kind+' variants');
    assert(a.maxScore===max,'lesson '+id+' '+kind+' max');
    const sig=a.variants.map(v=>JSON.stringify(v.tasks.map(t=>[t.text,t.answer,t.skill])));
    assert(new Set(sig).size===6,'lesson '+id+' '+kind+' unique variants');
    for(const v of a.variants){
      assert(v.tasks.length===count,'lesson '+id+' '+kind+' v'+v.id+' count');
      assert(v.tasks.reduce((s,t)=>s+Number(t.points||0),0)===max,'lesson '+id+' '+kind+' v'+v.id+' points');
      assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),'lesson '+id+' '+kind+' v'+v.id+' completeness');
    }
  }

  const hp='lessons/10-geometry-atanasyan/05/'+id+'.html';
  assert(exists(hp),'lesson html '+id);
  const h=read(hp);
  for(const token of ['data-topic="4"','data-lesson="'+id+'"','lesson-spatial.js','spatial-scene.js','global-numbering.js']){
    assert(h.includes(token),'lesson '+id+' wiring '+token);
  }
}

for(const [idx,tokens] of [
  [0,['пп. 74–76, 79–80','ФРП-2025']],
  [1,['пп. 74–76, 79–80','моделирования']],
  [2,['п. 14','пп. 30, 32–34']],
  [3,['пп. 4–11','пп. 15–18']]
]){
  const src=S.lessons[idx].source.section;
  for(const token of tokens)assert(src.includes(token),'lesson '+(idx+1)+' source '+token);
}

// Recompute all numeric control variants independently.
for(const v of S.lessons[0].control.variants){
  let m=v.tasks[0].text.match(/рёбра (\d+), (\d+), (\d+)/);
  assert(m&&first(v.tasks[0].answer)===Number(m[1])*Number(m[2])*Number(m[3]),'L61 v'+v.id+' box volume');
  m=v.tasks[1].text.match(/Sосн=(\d+), высоту (\d+) и боковое ребро (\d+)/);
  assert(m&&first(v.tasks[1].answer)===Number(m[1])*Number(m[2]),'L61 v'+v.id+' prism volume');
  m=v.tasks[2].text.match(/Sосн=(\d+) и высоту (\d+)/);
  assert(m&&first(v.tasks[2].answer)===Number(m[1])*Number(m[2])/3,'L61 v'+v.id+' pyramid volume');
  const values=nums(v.tasks[3].text);
  assert(values.length>=2&&first(v.tasks[3].answer)===values.at(-2),'L61 v'+v.id+' height choice');
}

for(const v of S.lessons[1].control.variants){
  let m=v.tasks[0].text.match(/: ([\d,]+) м × ([\d,]+) м × ([\d,]+) м/);
  assert(m,'L62 v'+v.id+' box parse');
  const box=Number(m[1].replace(',','.'))*Number(m[2].replace(',','.'))*Number(m[3].replace(',','.'));
  assert(close(first(v.tasks[0].answer),box),'L62 v'+v.id+' container volume');

  m=v.tasks[1].text.match(/основанием (\d+) м и высотой (\d+) м, длина призмы (\d+) м/);
  assert(m&&first(v.tasks[1].answer)===Number(m[1])*Number(m[2])*Number(m[3])/2,'L62 v'+v.id+' triangular prism');

  m=v.tasks[2].text.match(/стороной основания (\d+) м и высотой (\d+) м/);
  assert(m&&first(v.tasks[2].answer)===Number(m[1])**2*Number(m[2])/3,'L62 v'+v.id+' pyramid model');
  assert(v.tasks[5].answer.includes('м³'),'L62 v'+v.id+' units correction');
}

for(const v of S.lessons[2].control.variants){
  let m=v.tasks[0].text.match(/основание (\d+)×(\d+)/);
  assert(m&&first(v.tasks[0].answer)===Number(m[1])*Number(m[2]),'L63 v'+v.id+' parallel prism section');

  const base=m;
  m=v.tasks[1].text.match(/высота равна (\d+)/);
  assert(m,'L63 v'+v.id+' diagonal height parse');
  const expected=Math.hypot(Number(base[1]),Number(base[2]))*Number(m[1]);
  assert(close(first(v.tasks[1].answer),expected),'L63 v'+v.id+' diagonal section');

  m=v.tasks[2].text.match(/сторону основания (\d+).*k=(\d+)\/(\d+)/);
  assert(m,'L63 v'+v.id+' pyramid section parse');
  const side=Number(m[1]),k=Number(m[2])/Number(m[3]);
  assert(close(first(v.tasks[2].answer),side*side*k*k),'L63 v'+v.id+' pyramid parallel section');
}

for(const v of S.lessons[3].control.variants){
  assert(v.tasks[0].text.includes('Вариант '+v.id),'L64 v'+v.id+' variant-specific configuration');
  assert(v.tasks.some(t=>t.skill==='PERP_CRITERION'),'L64 v'+v.id+' perpendicular criterion');
  assert(v.tasks.some(t=>t.skill==='PARALLEL_PLANE'),'L64 v'+v.id+' line-plane parallel criterion');
  assert(v.tasks.some(t=>t.skill==='REL'),'L64 v'+v.id+' relation classification');
}

// 3D invariants.
{
  const p=S.spatialScenes['g10-p05-01'].points;
  const h=Math.abs(p.H[2]-p.A[2]);
  const edge=Math.hypot(p.A1[0]-p.A[0],p.A1[1]-p.A[1],p.A1[2]-p.A[2]);
  assert(close(p.H[0],p.A[0])&&close(p.H[1],p.A[1]),'L61 height vertical over A');
  assert(close(p.H[2],p.A1[2])&&edge>h,'L61 height vs oblique edge');
}
{
  const p=S.spatialScenes['g10-p05-03'].points;
  const pred=[
    p.M[0]+(p.N[0]-p.M[0])+(p.Q[0]-p.M[0]),
    p.M[1]+(p.N[1]-p.M[1])+(p.Q[1]-p.M[1]),
    p.M[2]+(p.N[2]-p.M[2])+(p.Q[2]-p.M[2])
  ];
  assert(pred.every((x,i)=>close(x,p.P[i])),'L63 section coplanar');
}
{
  const p=S.spatialScenes['g10-p05-04'].points;
  const a=[p.S[0]-p.H[0],p.S[1]-p.H[1],p.S[2]-p.H[2]];
  const b=[p.T[0]-p.K[0],p.T[1]-p.K[1],p.T[2]-p.K[2]];
  const xy=[p.Y[0]-p.X[0],p.Y[1]-p.X[1],p.Y[2]-p.X[2]];
  const uv=[p.V[0]-p.U[0],p.V[1]-p.U[1],p.V[2]-p.U[2]];
  assert(close(a[0]*b[1]-a[1]*b[0],0)&&close(a[0]*b[2]-a[2]*b[0],0)&&close(a[1]*b[2]-a[2]*b[1],0),'L64 displayed a and b parallel');
  assert(close(a[0]*xy[0]+a[1]*xy[1]+a[2]*xy[2],0),'L64 a perpendicular XY');
  assert(close(a[0]*uv[0]+a[1]*uv[1]+a[2]*uv[2],0),'L64 a perpendicular UV');
}

const mandatory=JSON.stringify(S.lessons.slice(0,4)).toLowerCase();
for(const forbidden of [
  'объём цилиндра','объём конуса','объём шара',
  'векторы в пространстве','координаты в пространстве','интеграл'
]) assert(!mandatory.includes(forbidden),'future-course leak '+forbidden);

const index=read('lessons/10-geometry-atanasyan/05/index.html');
for(const token of ['data-page="lesson-index"','series.js','scenes.js','data.js','lesson-index.js','global-numbering.js']){
  assert(index.includes(token),'index wiring '+token);
}

console.log('Grade 10 Atanasyan topic 05 lessons 61-64 QA passed: '+checks+' checks.');
