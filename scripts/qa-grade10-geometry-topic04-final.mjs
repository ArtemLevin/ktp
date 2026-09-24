import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const assert=(v,m)=>{checks++;if(!v)throw new Error(m);};
const compile=p=>{new vm.Script(read(p),{filename:p});checks++;};
const nums=s=>(String(s).match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
const first=s=>nums(s)[0];

for(const p of [
  'content/10-geometry-atanasyan/04.js',
  'content/10-geometry-atanasyan/04-methodical-plan.md',
  'topics/10-geometry-atanasyan/04.html',
  'lessons/10-geometry-atanasyan/04/series.js',
  'lessons/10-geometry-atanasyan/04/scenes.js',
  'lessons/10-geometry-atanasyan/04/data.js',
  'lessons/10-geometry-atanasyan/04/topic-link.js',
  'assessments/10-geometry-atanasyan/04/data.js',
  'assessments/10-geometry-atanasyan/04/independent.html',
  'assessments/10-geometry-atanasyan/04/control.html',
  'labs/10-geometry-atanasyan/polyhedron-section/index.html',
  'labs/10-geometry-atanasyan/polyhedron-section/style.css',
  'labs/10-geometry-atanasyan/polyhedron-section/app.js'
]) assert(exists(p),'missing '+p);

for(const p of [
  'content/10-geometry-atanasyan/04.js',
  'lessons/10-geometry-atanasyan/04/series.js',
  'lessons/10-geometry-atanasyan/04/scenes.js',
  'lessons/10-geometry-atanasyan/04/data.js',
  'assessments/10-geometry-atanasyan/04/data.js',
  'labs/10-geometry-atanasyan/polyhedron-section/app.js'
]) compile(p);

const ls={window:{}};
vm.createContext(ls);
for(const p of [
  'lessons/10-geometry-atanasyan/04/series.js',
  'lessons/10-geometry-atanasyan/04/scenes.js',
  'lessons/10-geometry-atanasyan/04/data.js'
]) vm.runInContext(read(p),ls,{filename:p});
const S=ls.window.KTP_LESSON_SERIES;
assert(S.meta.totalLessons===18,'series total 18');
assert(S.meta.courseLessonStart===43&&S.meta.courseLessonEnd===60,'global 43-60');
assert(S.meta.implementationStage==='5/5','release stage 5/5');
assert(S.lessons.length===18,'18 lesson objects');
assert(Object.keys(S.spatialScenes||{}).length>=18,'18 lesson scenes');

for(let i=0;i<18;i++){
  const l=S.lessons[i],id=String(i+1).padStart(2,'0');
  assert(l.globalNumber===43+i,'global lesson '+id);
  assert(l.examples.length>=3,'examples '+id);
  assert(l.practice.length>=8,'practice '+id);
  assert(l.homework.required.length>=6&&l.homework.optional.length>=2,'homework '+id);
  assert(l.independent.variants.length===6&&l.control.variants.length===6,'6+6 '+id);
}

const ab={window:{}};
vm.createContext(ab);
vm.runInContext(read('assessments/10-geometry-atanasyan/04/data.js'),ab,{filename:'assessment-04'});
const A=ab.window.KTP_ASSESSMENT_DATA;
assert(A.meta.topic==='04','assessment topic number');
assert(A.topic.title==='Многогранники','assessment title');
assert(A.meta.sourceNote.includes('пп. 27–37'),'chapter III source');
assert(A.meta.sourceNote.includes('пп. 74–76, 79–80'),'volume source');
assert(A.meta.sourceNote.includes('П. 31*')&&A.meta.sourceNote.includes('enrichment-only'),'p31 source guard');
for(const token of ['цилиндр','конус','шар/сфера','интегральный'])assert(A.meta.sourceNote.toLowerCase().includes(token.toLowerCase()),'source exclusion '+token);

for(const [kind,count,max] of [['independent',7,14],['control',10,20]]){
  const a=A.topic[kind];
  assert(a.variants.length===6,'thematic '+kind+' six variants');
  assert(a.maxScore===max,'thematic '+kind+' max');
  const sig=a.variants.map(v=>JSON.stringify(v.tasks.map(t=>[t.text,t.answer,t.skill])));
  assert(new Set(sig).size===6,'thematic '+kind+' distinct variants');
  for(const v of a.variants){
    assert(v.tasks.length===count,'thematic '+kind+' v'+v.id+' count');
    assert(v.tasks.reduce((s,t)=>s+Number(t.points||0),0)===max,'thematic '+kind+' v'+v.id+' points');
    assert(v.tasks.every(t=>t.text&&t.answer&&t.skill),'thematic '+kind+' v'+v.id+' complete');
  }
}

for(const v of A.topic.independent.variants){
  let m=v.tasks[0].text.match(/(\d+)-угольной призмы/);
  assert(m,'ind v'+v.id+' prism n parse');
  const n=Number(m[1]),got=nums(v.tasks[0].answer);
  assert(got[0]===2*n&&got[1]===3*n&&got[2]===n+2,'ind v'+v.id+' prism counts');
  m=v.tasks[1].text.match(/Pосн=(\d+), h=(\d+)/);
  assert(m&&first(v.tasks[1].answer)===Number(m[1])*Number(m[2]),'ind v'+v.id+' prism lateral');
  m=v.tasks[2].text.match(/сторону основания (\d+) и апофему (\d+)/);
  assert(m&&first(v.tasks[2].answer)===2*Number(m[1])*Number(m[2]),'ind v'+v.id+' pyramid lateral');
  assert(v.tasks[3].text.includes('Пирамида имеет прямоугольное основание'),'ind v'+v.id+' section must use a pyramid, not a prism');
  assert(v.tasks[3].text.includes('k=1/2'),'ind v'+v.id+' section similarity coefficient');
  m=v.tasks[3].text.match(/размеры (\d+)×(\d+)/);
  assert(m&&Math.abs(first(v.tasks[3].answer)-Number(m[1])*Number(m[2])/4)<1e-9,'ind v'+v.id+' section area');
  m=v.tasks[4].text.match(/(\d+) рёбер и (\d+) граней/);
  assert(m&&first(v.tasks[4].answer)===2+Number(m[1])-Number(m[2]),'ind v'+v.id+' Euler');
  m=v.tasks[5].text.match(/Sосн=(\d+), h=(\d+)/);
  assert(m&&first(v.tasks[5].answer)===Number(m[1])*Number(m[2]),'ind v'+v.id+' prism volume');
  m=v.tasks[6].text.match(/k=(\d+)/);
  const k=Number(m?.[1]);
  assert(k&&v.tasks[6].answer.includes(String(k*k*k)),'ind v'+v.id+' similarity volume');
}

for(const v of A.topic.control.variants){
  let m=v.tasks[0].text.match(/(\d+)-угольной пирамиды/),n=Number(m?.[1]),got=nums(v.tasks[0].answer);
  assert(n&&got[0]===n+1&&got[1]===2*n&&got[2]===n+1,'ctl v'+v.id+' pyramid counts');
  m=v.tasks[1].text.match(/Pосн=(\d+), h=(\d+), Sосн=(\d+)/);
  assert(m&&first(v.tasks[1].answer)===Number(m[1])*Number(m[2])+2*Number(m[3]),'ctl v'+v.id+' prism full surface');
  m=v.tasks[2].text.match(/основание (\d+)×(\d+) и высоту (\d+)/);
  assert(m&&Math.abs(first(v.tasks[2].answer)-Math.hypot(Number(m[1]),Number(m[2]))*Number(m[3]))<1e-9,'ctl v'+v.id+' diagonal section');
  m=v.tasks[3].text.match(/сторона основания (\d+), высота (\d+), апофема (\d+)/);
  assert(m&&v.tasks[3].answer.includes('Апофема')&&nums(v.tasks[3].answer).at(-1)===2*Number(m[1])*Number(m[3]),'ctl v'+v.id+' regular pyramid surface');
  m=v.tasks[4].text.match(/оснований (\d+) и (\d+), апофема (\d+)/);
  assert(m&&first(v.tasks[4].answer)===2*(Number(m[1])+Number(m[2]))*Number(m[3]),'ctl v'+v.id+' frustum lateral');
  assert(v.tasks[5].answer.includes('плоскости симметрии'),'ctl v'+v.id+' regular solid symmetry must name a concrete valid symmetry');
  m=v.tasks[6].text.match(/Ne=(\d+), Nf=(\d+)/);
  assert(m&&first(v.tasks[6].answer)===2+Number(m[1])-Number(m[2]),'ctl v'+v.id+' Euler');
  m=v.tasks[7].text.match(/Sосн=(\d+), высоту (\d+), боковое ребро/);
  assert(m&&first(v.tasks[7].answer)===Number(m[1])*Number(m[2]),'ctl v'+v.id+' oblique prism volume');
  m=v.tasks[8].text.match(/Sосн=(\d+), h=(\d+)/);
  assert(m&&first(v.tasks[8].answer)===Number(m[1])*Number(m[2])/3,'ctl v'+v.id+' pyramid volume');
  m=v.tasks[9].text.match(/k=(\d+)/);
  const k=Number(m?.[1]),values=nums(v.tasks[9].answer);
  assert(k&&values.includes(k*k)&&values.includes(k*k*k),'ctl v'+v.id+' similarity correction');
}

const assText=JSON.stringify(A.topic).toLowerCase();
assert(!assText.includes('параллельное основанию сечение призмы')&&!assText.includes('линейно уменьшено в 2 раза'),'thematic impossible prism section guard');
for(const forbidden of ['объём цилиндра','объём конуса','объём шара','интеграл'])assert(!assText.includes(forbidden),'forbidden assessment content '+forbidden);

const links=read('assessments/topic-links.js');
const nav=links.match(/'10-geometry-atanasyan':\{min:0,max:(\d+)\}/);
assert(nav&&Number(nav[1])===3,'assessment navigation through topic 04');

const map=read('content/10-geometry-atanasyan/content-map.md');
const row=map.split('\n').find(x=>x.includes('| 04 | Многогранники |'));
assert(row&&row.endsWith('| full |'),'content map topic04 full');

const Ccap={};
vm.runInNewContext(read('content/10-geometry-atanasyan/04.js'),{KTP_REGISTER_CONTENT:(id,d)=>Ccap[id]=d});
const C=Ccap['10-geometry-atanasyan::3'];
assert(C.lab?.enabled===true&&C.lab?.href.includes('polyhedron-section'),'lab published');
assert(C.source.assessment.includes('Все упражнения KTP разработаны самостоятельно'),'original exercise source note');

const method=read('content/10-geometry-atanasyan/04-methodical-plan.md');
for(const token of [
  'Этап 1 · Source + методический blueprint — выполнен',
  'Этап 2 · Topic core — выполнен',
  'Этап 3 · Уроки 43–51 — выполнен',
  'Этап 4 · Уроки 52–60 + lab — выполнен',
  'Этап 5 · Assessments + release gate — текущий'
]) assert(method.includes(token),'stage status '+token);

console.log('Grade 10 Atanasyan topic 04 FINAL structural/math/source QA passed: '+checks+' checks.');
