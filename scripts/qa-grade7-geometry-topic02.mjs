import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
let checks=0;
const fail=m=>{throw new Error(m)};
const assert=(v,m)=>{checks++;if(!v)fail(m)};
const abs=p=>path.join(ROOT,p);
const exists=p=>fs.existsSync(abs(p));
const read=p=>fs.readFileSync(abs(p),'utf8');
const compile=p=>{const src=read(p);try{new vm.Script(src,{filename:p});checks++;return src}catch(e){fail(`${p}: JS syntax error: ${e.message}`)}};
const sum=xs=>xs.reduce((a,b)=>a+Number(b||0),0);

const topic='topics/7-geometry-atanasyan/02.html';
const contentFiles=['content/7-geometry-atanasyan/02.js','content/7-geometry-atanasyan/02-refine.js','content/7-geometry-atanasyan/02-scenes.js'];
const lessonDir='lessons/7-geometry-atanasyan/02';
const lessonData=[`${lessonDir}/series.js`,`${lessonDir}/scenes.js`,`${lessonDir}/data-core.js`,`${lessonDir}/data/01.js`,`${lessonDir}/data-a.js`,`${lessonDir}/data-b.js`,`${lessonDir}/data-c.js`];
const assessmentData='assessments/7-geometry-atanasyan/02/data.js';
const lessonPlan='lessons/7-geometry-atanasyan/lesson-plan.md';
const contentMap='content/7-geometry-atanasyan/content-map.md';
const lessonLinks='lessons/topic-links.js';
const assessmentLinks='assessments/topic-links.js';

for(const f of [topic,...contentFiles,...lessonData,assessmentData,lessonPlan,contentMap,lessonLinks,assessmentLinks,`${lessonDir}/index.html`,'assessments/7-geometry-atanasyan/02/independent.html','assessments/7-geometry-atanasyan/02/control.html'])assert(exists(f),`${f}: missing`);
for(let i=1;i<=13;i++)assert(exists(`${lessonDir}/${String(i).padStart(2,'0')}.html`),`lesson html ${i}: missing`);
for(const f of [...contentFiles,...lessonData,assessmentData,lessonLinks,assessmentLinks])compile(f);

const html=read(topic);
for(const token of ['data-topic="1"','../../content/7-geometry-atanasyan/02.js','../../content/7-geometry-atanasyan/02-refine.js','../../content/7-geometry-atanasyan/02-scenes.js','../../lessons/topic-links.js','../../assessments/topic-links.js','../../geometry/geometry-scene.js'])assert(html.includes(token),`${topic}: missing ${token}`);

const topicWindow={KTP_CONTENT:{}};
const topicCtx=vm.createContext({window:topicWindow,console,KTP_REGISTER_CONTENT:(id,data)=>{topicWindow.KTP_CONTENT[id]=data;}});
for(const f of contentFiles)new vm.Script(read(f),{filename:f}).runInContext(topicCtx);
const c=topicWindow.KTP_CONTENT['7-geometry-atanasyan::1'];
assert(c,'topic content not registered');
assert(c.meta?.title==='Треугольники','wrong topic title');
assert(c.meta?.chapter==='Глава II · §§1–4 · пп. 14–23','wrong textbook range');
assert(Array.isArray(c.objectives)&&c.objectives.length>=6,'objectives too short');
assert(!JSON.stringify(c.objectives).includes('обратное рассуждение'),'premature converse theorem remains in objectives');
assert(Array.isArray(c.expectedResults)&&c.expectedResults.length>=8,'expectedResults too short');
assert(Array.isArray(c.theory)&&c.theory.length>=8,'theory too short');
assert(Array.isArray(c.examples)&&c.examples.length>=6,'examples too short');
assert(Array.isArray(c.mistakes)&&c.mistakes.length>=7,'mistakes too short');
for(const [k,min] of [['basic',5],['standard',5],['transfer',4],['challenge',3]])assert(Array.isArray(c.practice?.[k])&&c.practice[k].length>=min,`practice.${k}: too short`);
const converseProbe=c.practice.transfer.find(x=>String(x.task||'').includes('углы B и C равны'));
assert(converseProbe&&String(converseProbe.answer).startsWith('Пока нет.'),'converse-theorem sequencing guard missing');
const midpointExample=c.examples.find(x=>x.title==='Построение середины отрезка');
assert(midpointExample&&String(midpointExample.check).includes('△APQ = △BPQ')&&String(midpointExample.check).includes('△APM = △BPM'),'midpoint construction proof is incomplete');
assert(c.geometryScenes&&Object.keys(c.geometryScenes).length>=7,'topic geometry scenes missing');
for(const [id,scene] of Object.entries(c.geometryScenes)){
  assert(String(scene.title||'').trim(),`${id}: title missing`);
  assert(String(scene.ariaLabel||'').trim(),`${id}: ariaLabel missing`);
  assert(String(scene.caption||'').trim(),`${id}: caption missing`);
  assert(Array.isArray(scene.viewBox)&&scene.viewBox.length===4,`${id}: invalid viewBox`);
  assert(scene.points&&Object.keys(scene.points).length>=2,`${id}: points missing`);
  assert(Array.isArray(scene.objects)&&scene.objects.length>=1,`${id}: objects missing`);
}

const lessonWindow={};
const lessonCtx=vm.createContext({window:lessonWindow,console});
for(const f of lessonData)new vm.Script(read(f),{filename:f}).runInContext(lessonCtx);
const series=lessonWindow.KTP_LESSON_SERIES;
assert(series?.meta?.rowId==='7-geometry-atanasyan','lesson series row id');
assert(series.meta.topicIndex===1,'lesson series topic index');
assert(series.meta.totalLessons===13,'lesson series totalLessons');
assert(series.meta.courseLessonStart===13&&series.meta.courseLessonEnd===25,'global lesson bounds');
assert(series.meta.courseTotal===68,'course total');
const lessons=[...(series.lessons||[])].sort((a,b)=>a.number-b.number);
assert(lessons.length===13,`expected 13 lessons, got ${lessons.length}`);
const ids=new Set();
for(let i=0;i<lessons.length;i++){
  const l=lessons[i],local=i+1,global=12+local;
  assert(l.number===local,`lesson ${local}: wrong local number ${l.number}`);
  assert(l.globalNumber===global,`lesson ${local}: wrong global number ${l.globalNumber}`);
  assert(l.id===String(local).padStart(2,'0'),`lesson ${local}: wrong id ${l.id}`);
  assert(!ids.has(l.id),`lesson ${local}: duplicate id`);ids.add(l.id);
  assert(Array.isArray(l.objectives)&&l.objectives.length>=2,`lesson ${global}: objectives`);
  assert(Array.isArray(l.prerequisites)&&l.prerequisites.length>=2,`lesson ${global}: prerequisites`);
  assert(Array.isArray(l.theory)&&l.theory.length>=2,`lesson ${global}: theory`);
  assert(Array.isArray(l.examples)&&l.examples.length>=2,`lesson ${global}: examples`);
  assert(Array.isArray(l.mistakes)&&l.mistakes.length>=2,`lesson ${global}: mistakes`);
  assert(Array.isArray(l.practice)&&l.practice.length>=8,`lesson ${global}: practice`);
  assert(l.homework?.required?.length>=6&&l.homework?.optional?.length>=2,`lesson ${global}: homework`);
  for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){
    const w=l[kind];
    assert(w?.variants?.length===6,`lesson ${global} ${kind}: expected 6 variants`);
    assert(w.maxScore===max,`lesson ${global} ${kind}: max score ${w.maxScore}`);
    for(const v of w.variants){
      assert(v.tasks?.length===count,`lesson ${global} ${kind} v${v.id}: task count`);
      assert(sum(v.tasks.map(t=>t.points))===max,`lesson ${global} ${kind} v${v.id}: score sum`);
      v.tasks.forEach((t,j)=>{assert(String(t.text||'').trim(),`lesson ${global} ${kind} v${v.id} task${j+1}: text`);assert(String(t.answer||'').trim(),`lesson ${global} ${kind} v${v.id} task${j+1}: answer`);});
    }
  }
  assert(String(l.source?.section||'').includes('Глава II'),`lesson ${global}: source outside chapter II`);
}
assert(lessons[7].globalNumber===20&&lessons[7].title==='Равнобедренный треугольник: применение свойств','lesson 20 sequence regression');
assert(!JSON.stringify(lessons.slice(0,9)).includes('равные углы, то равны')&&!JSON.stringify(lessons.slice(0,9)).includes('обратное утверждение'),'premature converse theorem leaked into lessons 13–21');
assert(Object.keys(series.geometryScenes||{}).length>=8,'lesson geometry scenes missing');

const assessmentWindow={};
new vm.Script(read(assessmentData),{filename:assessmentData}).runInContext(vm.createContext({window:assessmentWindow,console}));
const a=assessmentWindow.KTP_ASSESSMENT_DATA;
assert(a?.meta?.topic==='02','assessment topic id');
assert(String(a.meta.sourceNote||'').includes('§§1–4, пп. 14–23'),'assessment source range');
for(const [kind,count,max] of [['independent',7,14],['control',10,20]]){
  const w=a.topic?.[kind];
  assert(w?.variants?.length===6,`thematic ${kind}: variants`);
  assert(w.maxScore===max,`thematic ${kind}: maxScore`);
  for(const v of w.variants){
    assert(v.tasks.length===count,`thematic ${kind} v${v.id}: task count`);
    assert(sum(v.tasks.map(t=>t.points))===max,`thematic ${kind} v${v.id}: score sum`);
    v.tasks.forEach((t,j)=>{assert(String(t.text||'').trim(),`thematic ${kind} v${v.id} task${j+1}: text`);assert(String(t.answer||'').trim(),`thematic ${kind} v${v.id} task${j+1}: answer`);});
  }
}

const plan=read(lessonPlan),map=read(contentMap);
assert(plan.includes('Источник: глава II, §§1–4, пп. 14–23.'),'lesson plan source mapping not corrected');
assert(plan.includes('20. Равнобедренный треугольник: применение свойств'),'lesson 20 title not corrected');
assert(map.includes('| 02 | Треугольники | 12.10–07.12.2026 | 13–25 | Гл. II, §§1–4, пп. 14–23 |'),'content map topic02 source mapping');
const lnk=read(lessonLinks),alnk=read(assessmentLinks);
assert(lnk.includes("1:{count:13,weeks:'уроки 13–25 курса',href:'../../lessons/7-geometry-atanasyan/02/index.html'}"),'topic02 lesson link missing');
const geomAssessment=alnk.match(/'7-geometry-atanasyan':\{min:0,max:(\d+)\}/);
assert(geomAssessment&&Number(geomAssessment[1])>=1,'topic02 assessment link missing');

for(let i=1;i<=13;i++){
  const f=`${lessonDir}/${String(i).padStart(2,'0')}.html`,h=read(f);
  assert(h.includes('data-topic="1"'),`${f}: wrong topic`);
  assert(h.includes('../../global-numbering.js'),`${f}: global numbering missing`);
  assert(h.includes('../../../geometry/lesson-geometry.js')&&h.includes('../../../geometry/geometry-scene.js'),`${f}: geometry runtime missing`);
}

console.log(`Grade 7 Atanasyan topic 02 QA passed: ${checks} checks; 13 lessons (13–25), 6+6 per-lesson variants, thematic 14/20 assessment.`);
