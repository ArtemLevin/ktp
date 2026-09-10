import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();let checks=0;
const assert=(v,m)=>{checks++;if(!v)throw new Error(m)};
const abs=p=>path.join(ROOT,p),exists=p=>fs.existsSync(abs(p)),read=p=>fs.readFileSync(abs(p),'utf8');
const compile=p=>{const s=read(p);new vm.Script(s,{filename:p});checks++;return s};
const sum=xs=>xs.reduce((a,b)=>a+Number(b||0),0);
const taskText=t=>String(t?.text??t?.task??'').trim();
const checkTasks=(tasks,label,count,max)=>{assert(tasks?.length===count,`${label}: expected ${count} tasks`);assert(sum(tasks.map(t=>t.points))===max,`${label}: score sum`);for(const [i,t] of tasks.entries()){assert(taskText(t),`${label} task ${i+1}: text`);assert(String(t.answer??'').trim(),`${label} task ${i+1}: answer`);}};

const topic='topics/7-geometry-atanasyan/06.html',content='content/7-geometry-atanasyan/06.js';
const dir='lessons/7-geometry-atanasyan/06';
const lessonFiles=[`${dir}/series.js`,`${dir}/scenes.js`,`${dir}/data.js`,`${dir}/calendar.js`];
const assessment='assessments/7-geometry-atanasyan/06/data.js';
const map='content/7-geometry-atanasyan/content-map.md',plan='lessons/7-geometry-atanasyan/lesson-plan.md';
const lessonLinks='lessons/topic-links.js',assessmentLinks='assessments/topic-links.js';
const required=[topic,content,...lessonFiles,assessment,map,plan,lessonLinks,assessmentLinks,`${dir}/index.html`,'assessments/7-geometry-atanasyan/06/independent.html','assessments/7-geometry-atanasyan/06/control.html'];
for(let i=1;i<=8;i++)required.push(`${dir}/${String(i).padStart(2,'0')}.html`);
required.forEach(f=>assert(exists(f),`${f}: missing`));
[content,...lessonFiles,assessment,lessonLinks,assessmentLinks].forEach(compile);

const topicHtml=read(topic);
for(const token of ['data-topic="5"','../../content/7-geometry-atanasyan/06.js','../../lessons/topic-links.js','../../assessments/topic-links.js','../../geometry/geometry-scene.js'])assert(topicHtml.includes(token),`${topic}: missing ${token}`);

const tw={KTP_CONTENT:{}};const tc=vm.createContext({window:tw,console,KTP_REGISTER_CONTENT:(id,data)=>{tw.KTP_CONTENT[id]=data;}});new vm.Script(read(content),{filename:content}).runInContext(tc);
const c=tw.KTP_CONTENT['7-geometry-atanasyan::5'];
assert(c,'topic content not registered');
assert(c.meta?.title==='Повторение','topic title');
assert(String(c.meta?.chapter||'').includes('главы I–IV'),'topic source range');
assert(c.objectives?.length>=8,'topic objectives');assert(c.expectedResults?.length>=10,'topic results');assert(c.theory?.length>=12,'topic theory');assert(c.examples?.length>=8,'topic examples');assert(c.mistakes?.length>=8,'topic mistakes');
for(const [k,min] of [['basic',6],['standard',6],['transfer',5],['challenge',4]])assert(c.practice?.[k]?.length>=min,`topic practice.${k}`);
assert(c.diagnostic?.length===8,'topic diagnostic');assert(c.homework?.required?.length>=6&&c.homework?.optional?.length>=2,'topic homework');
assert(Object.keys(c.geometryScenes||{}).length>=6,'topic geometry scenes');
for(const [id,s] of Object.entries(c.geometryScenes||{})){assert(String(s.title||'').trim(),`${id}: title`);assert(String(s.ariaLabel||'').trim(),`${id}: aria`);assert(String(s.caption||'').trim(),`${id}: caption`);assert(Array.isArray(s.viewBox)&&s.viewBox.length===4,`${id}: viewBox`);assert(Array.isArray(s.objects)&&s.objects.length,`${id}: objects`);}
const challenge=c.practice.challenge;
assert(challenge.some(t=>String(t.answer).includes('x=30')),'topic exterior-angle regression');
assert(challenge.some(t=>String(t.answer).includes('17 значений')),'topic triangle-inequality integer count regression');
assert(c.diagnostic.some(t=>String(t.answer).includes('40° и 140°')),'topic adjacent-ratio regression');

const lw={};const lc=vm.createContext({window:lw,console});for(const f of lessonFiles)new vm.Script(read(f),{filename:f}).runInContext(lc);
const S=lw.KTP_LESSON_SERIES,lessons=[...(S?.lessons||[])].sort((a,b)=>a.number-b.number);
assert(S?.meta?.rowId==='7-geometry-atanasyan'&&S.meta.topicIndex===5,'series identity');
assert(S.meta.totalLessons===8&&S.meta.courseLessonStart===61&&S.meta.courseLessonEnd===68&&S.meta.courseTotal===68,'series bounds');
assert(S.meta.plannedWeeks==='31–34','series planned weeks');assert(lessons.length===8,'lesson count');
const titles=['Повторение: простейшие фигуры, длины и углы','Повторение: вертикальные, смежные и перпендикулярные прямые','Повторение: равенство треугольников','Повторение: параллельные прямые','Повторение: углы и стороны треугольника','Повторение: ГМТ, симметрия, окружность и построения','Итоговая комплексная диагностика 7 класса','Работа над ошибками и готовность к геометрии 8 класса'];
for(let i=0;i<8;i++){
 const l=lessons[i],local=i+1,global=61+i,week=Math.ceil(global/2);
 assert(l.id===String(local).padStart(2,'0')&&l.number===local&&l.globalNumber===global,`lesson ${global}: numbering`);
 assert(l.week===week,`lesson ${global}: week ${l.week}, expected ${week}`);assert(l.title===titles[i],`lesson ${global}: title`);
 assert(l.objectives?.length>=2&&l.prerequisites?.length>=2,`lesson ${global}: goals/prereq`);assert(l.theory?.length>=2&&l.examples?.length>=2&&l.mistakes?.length>=3,`lesson ${global}: blocks`);assert(l.practice?.length>=8,`lesson ${global}: practice`);assert(l.homework?.required?.length>=6&&l.homework?.optional?.length>=2,`lesson ${global}: homework`);
 for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){const w=l[kind];assert(w?.variants?.length===6,`lesson ${global} ${kind}: variants`);assert(w.maxScore===max,`lesson ${global} ${kind}: max`);const sig=new Set();for(const v of w.variants){checkTasks(v.tasks,`lesson ${global} ${kind} v${v.id}`,count,max);sig.add(JSON.stringify(v.tasks.map(t=>t.text)));}assert(sig.size===6,`lesson ${global} ${kind}: duplicate variants`);}
 assert(String(l.source?.section||'').trim(),`lesson ${global}: source`);
}
assert(lessons[6].milestone==='Итоговая диагностика 7 класса','lesson67 milestone');assert(lessons[7].milestone==='Завершение курса геометрии 7 класса','lesson68 milestone');
assert(Object.keys(S.geometryScenes||{}).length>=8,'lesson geometry scenes');
for(const l of lessons)for(const t of l.theory||[])if(t.figure)assert(S.geometryScenes[t.figure],`lesson ${l.globalNumber}: missing scene ${t.figure}`);

const lesson64=JSON.stringify(lessons[3]);assert(lesson64.includes('x=20'),'lesson64 parallel equation regression');
const lesson65=JSON.stringify(lessons[4]);assert(lesson65.includes('5<x<'),'lesson65 strict inequality guard');
const lesson68=JSON.stringify(lessons[7]);assert(lesson68.includes('Круговое рассуждение')&&lesson68.includes('центр описанной окружности'),'lesson68 error-analysis coverage');

const aw={};new vm.Script(read(assessment),{filename:assessment}).runInContext(vm.createContext({window:aw,console}));const A=aw.KTP_ASSESSMENT_DATA;
assert(A?.meta?.topic==='06','assessment topic');assert(String(A.meta.sourceNote||'').includes('главы I–IV'),'assessment source');
for(const [kind,count,max] of [['independent',7,14],['control',10,20]]){const w=A.topic?.[kind];assert(w?.variants?.length===6,`thematic ${kind}: variants`);assert(w.maxScore===max,`thematic ${kind}: max`);const sig=new Set();for(const v of w.variants){checkTasks(v.tasks,`thematic ${kind} v${v.id}`,count,max);sig.add(JSON.stringify(v.tasks.map(t=>t.text)));}assert(sig.size===6,`thematic ${kind}: duplicate variants`);}
for(let i=0;i<6;i++){
 const v=i+1,ind=A.topic.independent.variants[i],ctrl=A.topic.control.variants[i];
 assert(ind.tasks[2].answer.includes('x=19'),`independent v${v}: parallel equation`);
 assert(ind.tasks[4].answer.includes(`5<x<${17+2*v}`),`independent v${v}: triangle interval`);
 assert(ind.tasks[5].answer.includes(`${8+v} см`),`independent v${v}: 30-degree leg`);
 assert(ctrl.tasks[3].answer.includes('x=20'),`control v${v}: parallel equation`);
 assert(ctrl.tasks[5].answer===String(13+2*v),`control v${v}: integer side count`);
 assert(ctrl.tasks[6].answer.includes(`${9+v} см`),`control v${v}: 30-degree leg`);
}

const m=read(map),p=read(plan),lnk=read(lessonLinks),alnk=read(assessmentLinks);
const row=m.split('\n').find(line=>line.startsWith('| 06 | Повторение |'))||'';
assert(row.includes('26.04–20.05.2027')&&row.includes('61–68')&&row.includes('**full**'),'content map topic06 row');
assert(m.includes('новых теорем')||m.includes('Новых теорем'),'content map review boundary');
assert(p.includes('## 6. Повторение — 8 уроков (61–68)')&&p.includes('Источник: главы I–IV'),'lesson plan topic06 source');
assert(lnk.includes("5:{count:8,weeks:'уроки 61–68 курса',href:'../../lessons/7-geometry-atanasyan/06/index.html'}"),'topic06 lesson link');
assert(alnk.includes("'7-geometry-atanasyan':{min:0,max:5}"),'topic06 assessment link');

const starts=[1,13,26,35,48,61],ends=[12,25,34,47,60,68],counts=[12,13,9,13,13,8];
for(let i=0;i<6;i++){const f=`lessons/7-geometry-atanasyan/${String(i+1).padStart(2,'0')}/series.js`;assert(exists(f),`${f}: missing`);const w={};new vm.Script(read(f),{filename:f}).runInContext(vm.createContext({window:w,console}));const meta=w.KTP_LESSON_SERIES?.meta;assert(meta?.courseLessonStart===starts[i]&&meta.courseLessonEnd===ends[i]&&meta.totalLessons===counts[i]&&meta.courseTotal===68,`course continuity topic ${i+1}`);}

for(let i=1;i<=8;i++){const f=`${dir}/${String(i).padStart(2,'0')}.html`,h=read(f);for(const token of ['data-topic="5"','data.js','calendar.js','../../lesson-page.js','../../global-numbering.js','../../../geometry/lesson-geometry.js','../../../geometry/geometry-scene.js'])assert(h.includes(token),`${f}: missing ${token}`);}
const index=read(`${dir}/index.html`);assert(index.includes('data.js"></script><script src="calendar.js"'),'lesson index calendar load order');

console.log(`Grade 7 Atanasyan topic 06 structural QA passed: ${checks} checks; 8 lessons 61–68, weeks 31–34, full 1–68 continuity, 6+6 lesson checks and thematic 14/20.`);
