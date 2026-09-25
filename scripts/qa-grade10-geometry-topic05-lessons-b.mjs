import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd(),read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
let checks=0;const assert=(v,m)=>{checks++;if(!v)throw new Error(m);};
for(const p of [
 'lessons/10-geometry-atanasyan/05/series.js','lessons/10-geometry-atanasyan/05/scenes.js',
 'lessons/10-geometry-atanasyan/05/data.js','lessons/10-geometry-atanasyan/05/data-b.js',
 'lessons/10-geometry-atanasyan/05/index.html','lessons/10-geometry-atanasyan/05/topic-link.js',
 'labs/10-geometry-atanasyan/spatial-router/index.html','labs/10-geometry-atanasyan/spatial-router/style.css',
 'labs/10-geometry-atanasyan/spatial-router/app.js'
]) assert(fs.existsSync(path.join(ROOT,p)),'missing '+p);

for(const p of ['series.js','scenes.js','data.js','data-b.js'].map(x=>'lessons/10-geometry-atanasyan/05/'+x))
 new vm.Script(read(p),{filename:p});
new vm.Script(read('labs/10-geometry-atanasyan/spatial-router/app.js'),{filename:'router'});

const sb={window:{}};vm.createContext(sb);
for(const p of ['series.js','scenes.js','data.js','data-b.js'].map(x=>'lessons/10-geometry-atanasyan/05/'+x))
 vm.runInContext(read(p),sb,{filename:p});
const S=sb.window.KTP_LESSON_SERIES;
assert(S.meta.totalLessons===8&&S.lessons.length===8,'8 lessons');
assert(S.meta.courseLessonStart===61&&S.meta.courseLessonEnd===68,'61-68');
assert(S.meta.implementationStage==='4/5','stage 4/5');
assert(Object.keys(S.spatialScenes).length>=8,'8 scenes');
const titles=['Расстояния и углы в пространстве','Комплексная задача на многогранник','Итоговая комплексная диагностика 10 класса','Адресная коррекция и мост в 11 класс'];
for(let i=4;i<8;i++){
 const l=S.lessons[i],id=String(i+1).padStart(2,'0');
 assert(l.globalNumber===61+i&&l.title===titles[i-4],'lesson '+id+' identity');
 assert(l.theory.length>=3&&l.examples.length>=3&&l.mistakes.length>=3,'lesson '+id+' content');
 assert(l.practice.length>=8&&l.homework.required.length>=6&&l.homework.optional.length>=2,'lesson '+id+' practice/hw');
 assert(l.independent.variants.length===6&&l.control.variants.length===6,'lesson '+id+' 6+6');
 for(const [kind,n,max] of [['independent',5,10],['control',6,14]]){
  const a=l[kind];assert(new Set(a.variants.map(v=>JSON.stringify(v.tasks))).size===6,'lesson '+id+' '+kind+' unique');
  a.variants.forEach(v=>{assert(v.tasks.length===n,'lesson '+id+' '+kind+' count');assert(v.tasks.reduce((s,t)=>s+t.points,0)===max,'lesson '+id+' '+kind+' points');});
 }
 const h=read('lessons/10-geometry-atanasyan/05/'+id+'.html');
 assert(h.includes('data-b.js')&&h.includes('data-topic="4"'),'lesson '+id+' wiring');
}

// Recalculate central metric variants.
const num=s=>Number(String(s).match(/-?\d+(?:[.,]\d+)?/)?.[0].replace(',','.'));
for(const v of S.lessons[4].control.variants){
 const m=v.tasks[0].text.match(/SH=(\d+), HA=(\d+)/);assert(m,'L65 parse');
 assert(num(v.tasks[0].answer)===Math.hypot(+m[1],+m[2]),'L65 hypotenuse v'+v.id);
 assert(v.tasks[3].answer.includes('HA'),'L65 projection v'+v.id);
}
for(const v of S.lessons[5].control.variants){
 let m=v.tasks[0].text.match(/основания (\d+), высоту (\d+), апофему (\d+)/);assert(m,'L66 parse');
 const a=+m[1],h=+m[2],l=+m[3];assert(num(v.tasks[0].answer)===a*a+2*a*l,'L66 surface v'+v.id);
 assert(num(v.tasks[1].answer)===a*a*h/3,'L66 volume v'+v.id);
 m=v.tasks[2].text.match(/k=(\d+)\/(\d+)/);const k=+m[1]/+m[2];
 assert(Math.abs(num(v.tasks[2].answer)-a*a*k*k)<1e-8,'L66 section v'+v.id);
}
for(const v of S.lessons[6].control.variants){
 const skills=v.tasks.map(t=>t.skill);for(const x of ['READ','REL','COND','PLANE','SECTION','VOLUME'])assert(skills.includes(x),'L67 '+x);
}
for(const v of S.lessons[7].control.variants){
 const skills=v.tasks.map(t=>t.skill);for(const x of ['READ','COND','PROJ','SECTION','VOLUME','CHECK'])assert(skills.includes(x),'L68 '+x);
}

// Scene invariants.
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),sub=(a,b)=>a.map((x,i)=>x-b[i]),d=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
let p=S.spatialScenes['g10-p05-05'].points;assert(Math.abs(dot(sub(p.S,p.H),sub(p.A,p.H)))<1e-9,'L65 right triangle');
p=S.spatialScenes['g10-p05-06'].points;assert(Math.abs(d(p.P,p.Q)/d(p.A,p.B)-.5)<1e-9,'L66 parallel section scale');
p=S.spatialScenes['g10-p05-08'].points;assert(d(p.A,p.A1)>d(p.A,p.H),'L68 edge > height');

const lab=read('labs/10-geometry-atanasyan/spatial-router/index.html'),app=read('labs/10-geometry-atanasyan/spatial-router/app.js');
assert((lab.match(/<option value=/g)||[]).length===10,'router 10 scenarios');
for(const t of ['sessionStorage','firstCorrect','roundTried','workingPlane',"lines:{","linePlane:{","perpPlane:{","distance:{","threePerp:{","linePlaneAngle:{","dihedral:{","section:{","surfaceVolume:{","similar:{"])assert(app.includes(t),'router '+t);
assert(!app.includes('localStorage'),'session-only state');

const cap={};vm.runInNewContext(read('content/10-geometry-atanasyan/05.js'),{KTP_REGISTER_CONTENT:(id,x)=>cap[id]=x});
assert(cap['10-geometry-atanasyan::4'].lab.enabled===true,'lab enabled');
assert(read('topics/10-geometry-atanasyan/05.html').includes('lessons/10-geometry-atanasyan/05/topic-link.js'),'topic lesson link');

const all=JSON.stringify(S.lessons).toLowerCase();
for(const bad of ['объём цилиндра','объём конуса','объём шара','координатный метод в пространстве','интегральный вывод'])assert(!all.includes(bad),'future leak '+bad);
console.log('Grade 10 Atanasyan topic 05 STAGE 4 structural/router QA passed: '+checks+' checks.');