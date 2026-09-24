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
assert(S.meta.totalLessons===9,'stage 3 publishes 9 lessons');
assert(S.meta.plannedTotalLessons===18,'planned total 18');
assert(S.meta.courseLessonStart===43&&S.meta.courseLessonEnd===51,'stage global bounds');
assert(S.meta.plannedCourseLessonEnd===60,'planned global end');
assert(S.meta.implementationStage==='3/5','stage marker');
assert(S.lessons.length===9,'nine lessons 43-51');
assert(Object.keys(S.spatialScenes||{}).length>=9,'nine spatial scenes');

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

assert(!exists('lessons/10-geometry-atanasyan/04/10.html'),'lesson 52 must wait for stage 4');
assert(!exists('lessons/10-geometry-atanasyan/04/topic-link.js'),'topic link must wait until full 18-lesson series');
assert(!exists('assessments/10-geometry-atanasyan/04/data.js'),'thematic assessment must wait until stage 5');

const topic=read('topics/10-geometry-atanasyan/04.html');
assert(!topic.includes('lessons/10-geometry-atanasyan/04/topic-link.js'),'topic must not expose partial catalog');

console.log('Grade 10 Atanasyan topic 04 lessons 43-51 QA passed: '+checks+' checks.');
