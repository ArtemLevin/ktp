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
assert(S.meta.courseLessonStart===43&&S.meta.courseLessonEnd===60,'course bounds');
assert(['4/5','5/5'].includes(S.meta.implementationStage),'stage 4/5 marker');
assert(S.lessons.length===18,'18 lessons loaded');
assert(Object.keys(S.spatialScenes||{}).length>=18,'18 spatial scenes');

const expected=[
  'Многогранник и его элементы',
  'Призма',
  'Площадь поверхности призмы',
  'Параллелепипед как призма',
  'Сечения призмы',
  'Пирамида',
  'Правильная пирамида',
  'Площадь поверхности правильной пирамиды',
  'Усечённая пирамида',
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

for(let i=0;i<18;i++){
  const l=S.lessons[i],n=i+1,g=43+i,id=String(n).padStart(2,'0');
  assert(l.id===id,'lesson '+id+' id');
  assert(l.number===n&&l.globalNumber===g,'lesson '+id+' global');
  assert(l.title===expected[i],'lesson '+id+' title');
  assert(l.objectives.length>=3,'lesson '+id+' objectives');
  assert(l.theory.length>=3&&l.theory.some(x=>x.spatialFigure),'lesson '+id+' theory/spatial');
  assert(l.examples.length>=3&&l.examples.every(x=>x.problem&&x.solution&&x.answer),'lesson '+id+' examples');
  assert(l.mistakes.length>=3,'lesson '+id+' mistakes');
  assert(l.practice.length>=8,'lesson '+id+' practice');
  assert(l.homework.required.length>=6&&l.homework.optional.length>=2,'lesson '+id+' homework');

  for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){
    const a=l[kind];
    assert(a.variants.length===6,'lesson '+id+' '+kind+' variants');
    assert(a.maxScore===max,'lesson '+id+' '+kind+' max');
    const signatures=a.variants.map(v=>JSON.stringify(v.tasks.map(t=>[t.text,t.answer,t.skill])));
    assert(new Set(signatures).size===6,'lesson '+id+' '+kind+' variants distinct');
    for(const v of a.variants){
      assert(v.tasks.length===count,'lesson '+id+' '+kind+' task count');
      assert(v.tasks.reduce((s,t)=>s+Number(t.points||0),0)===max,'lesson '+id+' '+kind+' points');
      assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),'lesson '+id+' '+kind+' completeness');
    }
  }

  const hp='lessons/10-geometry-atanasyan/04/'+id+'.html';
  assert(exists(hp),'lesson html '+id);
  const h=read(hp);
  for(const token of ['data-topic="3"','data-lesson="'+id+'"','lesson-spatial.js','spatial-scene.js','global-numbering.js']){
    assert(h.includes(token),'lesson '+id+' wiring '+token);
  }
}

const textLesson=i=>JSON.stringify(S.lessons[i]).toLowerCase();
for(const [idx,tokens] of [
  [9,['параллельное сечение','k²']],
  [10,['тетраэдр','октаэдр','додекаэдр','икосаэдр']],
  [11,['центр симметрии','плоскость симметрии']],
  [12,['nv−ne+nf=2','выпукл']],
  [13,['v=abc','кубическ']],
  [14,['v=sосн·h','наклонной призме']],
  [15,['1/3·sосн·h','апофем']],
  [16,['k²','k³']],
  [17,['model','height','similar','units']]
]){
  const txt=textLesson(idx);
  for(const token of tokens)assert(txt.includes(token.toLowerCase()),'lesson '+(idx+1)+' semantic '+token);
}

// Selected arithmetic checks for variant 1.
const ex=(idx,title)=>S.lessons[idx].examples.find(x=>x.title===title);
assert(ex(9,'Базовый разбор')?.answer==='6.','lesson 52 section side');
assert(ex(9,'Проверка понятия')?.answer==='144 и 36.','lesson 52 section areas');
assert(ex(10,'Базовый разбор')?.answer.includes('4 вершин'),'lesson 53 tetra data');
assert(ex(12,'Проверка понятия')?.answer==='8.','lesson 55 Euler missing vertices');
assert(ex(13,'Базовый разбор')?.answer==='60.','lesson 56 box volume');
assert(ex(14,'Базовый разбор')?.answer==='72.','lesson 57 prism volume');
assert(ex(15,'Базовый разбор')?.answer==='32.','lesson 58 pyramid volume');
assert(ex(16,'Базовый разбор')?.answer==='4 раз.','lesson 59 area scale');
assert(ex(16,'Проверка понятия')?.answer==='8 раз.','lesson 59 volume scale');

const mandatory=JSON.stringify(S.lessons).toLowerCase();
for(const forbidden of ['объём цилиндра','объём конуса','объём шара','вычисление объёмов тел с помощью интеграла']){
  assert(!mandatory.includes(forbidden),'next-line content leaked: '+forbidden);
}

const contentCap={};
vm.runInNewContext(read('content/10-geometry-atanasyan/04.js'),{KTP_REGISTER_CONTENT:(id,d)=>contentCap[id]=d});
const C=contentCap['10-geometry-atanasyan::3'];
assert(C.lab?.enabled===true,'topic lab enabled');
assert(C.lab?.href.includes('polyhedron-section'),'topic lab href');

const topic=read('topics/10-geometry-atanasyan/04.html');
assert(topic.includes('lessons/10-geometry-atanasyan/04/topic-link.js'),'topic lesson link');
const link=read('lessons/10-geometry-atanasyan/04/topic-link.js');
assert(link.includes('18 последовательных уроков')&&link.includes('Открыть 18 уроков'),'topic link content');

const nav=read('assessments/topic-links.js').match(/'10-geometry-atanasyan':\{min:0,max:(\d+)\}/);
assert(nav&&Number(nav[1])>=2,'grade 10 assessment navigation must not regress below topic 03');

const lab=read('labs/10-geometry-atanasyan/polyhedron-section/index.html');
for(const token of ['presetParallel','presetTriangle','presetPentagon','planePatch','Исследовательский вопрос','Рёбра с вершинами сечения']){
  assert(lab.includes(token),'lab HTML '+token);
}
const app=read('labs/10-geometry-atanasyan/polyhedron-section/app.js');
for(const token of ['planeData','sectionPoints','sortInPlane','sectionMetrics','edgeNamesForPoint','faceName','fa*fb<0','preset(1,6,6)','preset(1,5,4)']){
  assert(app.includes(token),'lab app '+token);
}

const method=read('content/10-geometry-atanasyan/04-methodical-plan.md');
assert(method.includes('перехода 3↔4↔5 сторон'),'method lab count invariant');

console.log('Grade 10 Atanasyan topic 04 lessons 52-60 + lab QA passed: '+checks+' checks.');
