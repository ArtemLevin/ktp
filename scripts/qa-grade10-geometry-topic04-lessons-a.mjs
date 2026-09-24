import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const assert=(v,m)=>{checks++;if(!v)throw new Error(m);};
const compile=p=>{new vm.Script(read(p),{filename:p});checks++;};

for(const p of [
  'lessons/10-geometry-atanasyan/04/series.js',
  'lessons/10-geometry-atanasyan/04/scenes.js',
  'lessons/10-geometry-atanasyan/04/data.js',
  'lessons/10-geometry-atanasyan/04/index.html'
]) assert(exists(p),'missing '+p);

for(const p of [
  'lessons/10-geometry-atanasyan/04/series.js',
  'lessons/10-geometry-atanasyan/04/scenes.js',
  'lessons/10-geometry-atanasyan/04/data.js'
]) compile(p);

const sb={window:{}};
vm.createContext(sb);
for(const p of [
  'lessons/10-geometry-atanasyan/04/series.js',
  'lessons/10-geometry-atanasyan/04/scenes.js',
  'lessons/10-geometry-atanasyan/04/data.js'
]) vm.runInContext(read(p),sb,{filename:p});

const S=sb.window.KTP_LESSON_SERIES;
assert(S,'series');
assert(S.meta.topicIndex===3&&S.meta.topicNumber===4,'topic meta');
assert(S.meta.totalLessons>=9,'at least 9 lessons published');
assert(S.meta.plannedTotalLessons===18,'planned total 18');
assert(S.meta.courseLessonStart===43&&S.meta.courseLessonEnd>=51,'stage global bounds');
assert(S.meta.plannedCourseLessonEnd===60,'planned global end');
assert(['3/5','4/5','5/5'].includes(S.meta.implementationStage),'stage marker');
assert(S.lessons.length>=9,'at least nine lessons 43-51');
assert(Object.keys(S.spatialScenes||{}).length>=9,'at least nine spatial scenes');

const expectedTitles=[
  'Многогранник и его элементы',
  'Призма',
  'Площадь поверхности призмы',
  'Параллелепипед как призма',
  'Сечения призмы',
  'Пирамида',
  'Правильная пирамида',
  'Площадь поверхности правильной пирамиды',
  'Усечённая пирамида'
];

for(let i=0;i<9;i++){
  const l=S.lessons[i];
  const n=i+1,g=43+i,id=String(n).padStart(2,'0');
  assert(l.id===id,'lesson '+id+' id');
  assert(l.number===n&&l.globalNumber===g,'lesson '+id+' global number');
  assert(l.title===expectedTitles[i],'lesson '+id+' title');
  assert(l.objectives.length>=3,'lesson '+id+' objectives');
  assert(l.theory.length>=3&&l.theory.some(x=>x.spatialFigure),'lesson '+id+' theory/spatial');
  assert(l.examples.length>=3,'lesson '+id+' examples');
  assert(l.examples.every(x=>x.problem&&x.idea&&x.solution&&x.check&&x.answer),'lesson '+id+' examples complete');
  assert(l.mistakes.length>=3,'lesson '+id+' mistakes');
  assert(l.practice.length>=8,'lesson '+id+' practice');
  assert(l.homework.required.length>=6&&l.homework.optional.length>=2,'lesson '+id+' homework');
  assert(l.source.section&&l.source.assessment.includes('п. 31*'),'lesson '+id+' source boundary');

  for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){
    const a=l[kind];
    assert(a.variants.length===6,'lesson '+id+' '+kind+' variants');
    assert(a.maxScore===max,'lesson '+id+' '+kind+' score max');
    const signatures=a.variants.map(v=>JSON.stringify(v.tasks.map(t=>[t.text,t.answer,t.skill])));
    assert(new Set(signatures).size===6,'lesson '+id+' '+kind+' variants distinct');
    for(const v of a.variants){
      assert(v.tasks.length===count,'lesson '+id+' '+kind+' task count');
      assert(v.tasks.reduce((s,t)=>s+Number(t.points||0),0)===max,'lesson '+id+' '+kind+' points');
      assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),'lesson '+id+' '+kind+' task completeness');
    }
  }

  const hp='lessons/10-geometry-atanasyan/04/'+id+'.html';
  assert(exists(hp),'lesson html '+id);
  const h=read(hp);
  for(const token of ['data-topic="3"','data-lesson="'+id+'"','lesson-spatial.js','spatial-scene.js','global-numbering.js']){
    assert(h.includes(token),'lesson '+id+' wiring '+token);
  }
}

const L=S.lessons;
const lessonText=i=>JSON.stringify(L[i]);

// all-six arithmetic release checks for lessons 43-51
const nums=s=>(String(s).match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
const first=s=>nums(s)[0];
const close=(a,b,t=1e-9)=>Math.abs(a-b)<=t;

for(const v of L[0].control.variants){
  const m=v.tasks[0].text.match(/(\d+)-угольная призма/),n=Number(m?.[1]),g=nums(v.tasks[0].answer);
  assert(n&&g[0]===2*n&&g[1]===3*n&&g[2]===n+2,'lesson 43 v'+v.id+' element counts');
}
for(const v of L[2].control.variants){
  let m=v.tasks[0].text.match(/Pосн=(\d+), h=(\d+)/);
  assert(m&&first(v.tasks[0].answer)===Number(m[1])*Number(m[2]),'lesson 45 v'+v.id+' lateral surface');
  const p=Number(m[1]),h=Number(m[2]);
  m=v.tasks[1].text.match(/Sосн=(\d+)/);
  assert(m&&first(v.tasks[1].answer)===p*h+2*Number(m[1]),'lesson 45 v'+v.id+' full surface');
}
for(const v of L[3].control.variants){
  const m=v.tasks[0].text.match(/равны (\d+), (\d+), (\d+)/);
  const expected=Math.hypot(Number(m?.[1]),Number(m?.[2]),Number(m?.[3]));
  assert(m&&close(first(v.tasks[0].answer),expected),'lesson 46 v'+v.id+' space diagonal');
}
for(const v of L[4].control.variants){
  let m=v.tasks[0].text.match(/основание (\d+)×(\d+)/);
  assert(m&&first(v.tasks[0].answer)===Number(m[1])*Number(m[2]),'lesson 47 v'+v.id+' parallel section');
  m=v.tasks[1].text.match(/основанием (\d+)×(\d+) и высотой (\d+)/);
  const expected=Math.hypot(Number(m?.[1]),Number(m?.[2]))*Number(m?.[3]);
  assert(m&&close(first(v.tasks[1].answer),expected),'lesson 47 v'+v.id+' diagonal section');
}
for(const v of L[5].control.variants){
  const m=v.tasks[0].text.match(/(\d+)-угольной пирамиды/),n=Number(m?.[1]),g=nums(v.tasks[0].answer);
  assert(n&&g[0]===n+1&&g[1]===2*n&&g[2]===n+1,'lesson 48 v'+v.id+' pyramid counts');
}
for(const v of L[6].control.variants){
  const m=v.tasks[0].text.match(/сторону основания (\d+) и высоту (\d+)/);
  const expected=Math.hypot(Number(m?.[1])/2,Number(m?.[2]));
  assert(m&&close(first(v.tasks[0].answer),expected),'lesson 49 v'+v.id+' apothem');
}
for(const v of L[7].control.variants){
  let m=v.tasks[0].text.match(/сторону основания (\d+) и апофему (\d+)/);
  const a=Number(m?.[1]),l=Number(m?.[2]),lat=2*a*l;
  assert(m&&first(v.tasks[0].answer)===lat,'lesson 50 v'+v.id+' lateral surface');
  assert(first(v.tasks[1].answer)===lat+a*a,'lesson 50 v'+v.id+' full surface');
}
for(const v of L[8].control.variants){
  const m=v.tasks[0].text.match(/стороны оснований (\d+) и (\d+), апофема (\d+)/);
  const a=Number(m?.[1]),b=Number(m?.[2]),l=Number(m?.[3]),lat=2*(a+b)*l;
  assert(m&&first(v.tasks[0].answer)===lat,'lesson 51 v'+v.id+' lateral surface');
  assert(first(v.tasks[1].answer)===lat+a*a+b*b,'lesson 51 v'+v.id+' full surface');
}

// 3D scene invariants for the first half.
const dist3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
{
  const p=S.spatialScenes['g10-p04-02'].points;
  assert(close(p.A[0],p.H[0])&&close(p.A[1],p.H[1]),'lesson 44 height foot vertical over A');
  assert(close(p.H[2],p.A1[2]),'lesson 44 height foot lies in upper base plane');
  assert(dist3(p.A,p.A1)>dist3(p.A,p.H),'lesson 44 oblique side edge longer than height');
}
{
  const p=S.spatialScenes['g10-p04-05'].points;
  const v1=[p.N[0]-p.M[0],p.N[1]-p.M[1],p.N[2]-p.M[2]];
  const v2=[p.Q[0]-p.M[0],p.Q[1]-p.M[1],p.Q[2]-p.M[2]];
  const pred=[
    p.M[0]+v1[0]+v2[0],
    p.M[1]+v1[1]+v2[1],
    p.M[2]+v1[2]+v2[2]
  ];
  assert(pred.every((x,i)=>close(x,p.P[i])),'lesson 47 section MNPQ must be coplanar');
}

for(const [idx,tokens] of [
  [0,['2n','3n','n+2','развёрт']],
  [1,['наклонной призмы','расстоянием между']],
  [2,['Sбок=Pосн·h','2Sосн']],
  [3,['d²=a²+b²+c²','прямоугольного параллелепипеда']],
  [4,['след','замкнутый многоугольник']],
  [5,['n+1','2n','тетраэдр']],
  [6,['апофем','центр основания']],
  [7,['1/2·Pосн·l','развёртк']],
  [8,['1/2·(P1+P2)·l','равнобедренными трапециями']]
]){
  const txt=lessonText(idx).toLowerCase();
  for(const token of tokens)assert(txt.includes(token.toLowerCase()),'lesson '+(idx+1)+' semantic token '+token);
}

const ex=(idx,title)=>L[idx].examples.find(x=>x.title===title);
assert(ex(0,'Базовый разбор')?.answer.includes('8 вершин'),'lesson 43 variant1 count answer');
assert(ex(2,'Базовый разбор')?.answer==='70.','lesson 45 variant1 side surface');
assert(ex(2,'Проверка понятия')?.answer==='94.','lesson 45 variant1 full surface');
assert(ex(3,'Базовый разбор')?.answer==='13.','lesson 46 variant1 diagonal');
assert(ex(4,'Базовый разбор')?.answer==='12.','lesson 47 variant1 parallel section area');
assert(ex(5,'Базовый разбор')?.answer.includes('5 вершин'),'lesson 48 variant1 count');
assert(ex(6,'Базовый разбор')?.answer==='5.','lesson 49 variant1 apothem');
assert(ex(7,'Базовый разбор')?.answer==='60.','lesson 50 variant1 lateral surface');
assert(ex(8,'Базовый разбор')?.answer==='80.','lesson 51 variant1 lateral surface');

const mandatory=JSON.stringify(S.lessons).toLowerCase();
for(const forbidden of [
  'объём цилиндра','объём конуса','объём шара',
  'интегральный вывод','пространственная теорема пифагора'
]) assert(!mandatory.includes(forbidden),'forbidden/next-stage content leaked: '+forbidden);

const index=read('lessons/10-geometry-atanasyan/04/index.html');
for(const token of ['data-page="lesson-index"','series.js','scenes.js','data.js','lesson-index.js','global-numbering.js']){
  assert(index.includes(token),'index wiring '+token);
}

console.log('Grade 10 Atanasyan topic 04 lessons 43-51 QA passed: '+checks+' checks.');
