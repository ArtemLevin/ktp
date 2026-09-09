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

const topic='topics/7-geometry-atanasyan/03.html';
const contentFile='content/7-geometry-atanasyan/03.js';
const lessonDir='lessons/7-geometry-atanasyan/03';
const lessonData=[`${lessonDir}/series.js`,`${lessonDir}/scenes.js`,`${lessonDir}/data.js`,`${lessonDir}/refine.js`];
const assessmentData='assessments/7-geometry-atanasyan/03/data.js';
const lessonPlan='lessons/7-geometry-atanasyan/lesson-plan.md';
const contentMap='content/7-geometry-atanasyan/content-map.md';
const lessonLinks='lessons/topic-links.js';
const assessmentLinks='assessments/topic-links.js';

for(const f of [topic,contentFile,...lessonData,assessmentData,lessonPlan,contentMap,lessonLinks,assessmentLinks,`${lessonDir}/index.html`,'assessments/7-geometry-atanasyan/03/independent.html','assessments/7-geometry-atanasyan/03/control.html'])assert(exists(f),`${f}: missing`);
for(let i=1;i<=9;i++)assert(exists(`${lessonDir}/${String(i).padStart(2,'0')}.html`),`lesson html ${i}: missing`);
for(const f of [contentFile,...lessonData,assessmentData,lessonLinks,assessmentLinks])compile(f);
for(const junk of ['tmp-placeholder.txt','DO_NOT_KEEP.tmp','ANOTHER_TEMP.tmp',`${lessonDir}/refine-loader-note.txt`,`${lessonDir}/refine-loader.js`])assert(!exists(junk),`${junk}: temporary file leaked into branch`);

const html=read(topic);
for(const token of ['data-topic="2"','../../content/7-geometry-atanasyan/03.js','../../lessons/topic-links.js','../../assessments/topic-links.js','../../geometry/geometry-scene.js'])assert(html.includes(token),`${topic}: missing ${token}`);

const topicWindow={KTP_CONTENT:{}};
const topicCtx=vm.createContext({window:topicWindow,console,KTP_REGISTER_CONTENT:(id,data)=>{topicWindow.KTP_CONTENT[id]=data;}});
new vm.Script(read(contentFile),{filename:contentFile}).runInContext(topicCtx);
const c=topicWindow.KTP_CONTENT['7-geometry-atanasyan::2'];
assert(c,'topic content not registered');
assert(c.meta?.title==='Параллельные прямые','wrong topic title');
assert(c.meta?.chapter==='Глава III · §§1–2 · пп. 24–29','wrong textbook range');
assert(Array.isArray(c.objectives)&&c.objectives.length>=6,'objectives too short');
assert(Array.isArray(c.expectedResults)&&c.expectedResults.length>=8,'expectedResults too short');
assert(Array.isArray(c.theory)&&c.theory.length>=10,'theory too short');
assert(Array.isArray(c.examples)&&c.examples.length>=6,'examples too short');
assert(Array.isArray(c.mistakes)&&c.mistakes.length>=7,'mistakes too short');
for(const [k,min] of [['basic',5],['standard',5],['transfer',4],['challenge',3]])assert(Array.isArray(c.practice?.[k])&&c.practice[k].length>=min,`practice.${k}: too short`);
const topicText=JSON.stringify(c);
assert(topicText.includes('углы → параллельность')&&topicText.includes('параллельность → углы'),'criterion/property direction guard missing');
assert(c.geometryScenes&&Object.keys(c.geometryScenes).length>=5,'topic geometry scenes missing');
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
assert(series.meta.topicIndex===2,'lesson series topic index');
assert(series.meta.totalLessons===9,'lesson series totalLessons');
assert(series.meta.courseLessonStart===26&&series.meta.courseLessonEnd===34,'global lesson bounds');
assert(series.meta.courseTotal===68,'course total');
const lessons=[...(series.lessons||[])].sort((a,b)=>a.number-b.number);
assert(lessons.length===9,`expected 9 lessons, got ${lessons.length}`);
const expectedTitles=['Параллельные прямые и параллельные отрезки','Секущая. Накрест лежащие, соответственные и односторонние углы','Первый признак параллельности прямых','Второй и третий признаки параллельности прямых','Практика на признаки. Построение параллельных прямых','Аксиомы геометрии. Аксиома параллельных прямых','Свойства углов при параллельных прямых и секущей','Доказательные задачи на параллельность','Обобщение темы «Параллельные прямые»'];
const ids=new Set();
for(let i=0;i<lessons.length;i++){
  const l=lessons[i],local=i+1,global=25+local;
  assert(l.number===local,`lesson ${local}: wrong local number ${l.number}`);
  assert(l.globalNumber===global,`lesson ${local}: wrong global number ${l.globalNumber}`);
  assert(l.id===String(local).padStart(2,'0'),`lesson ${local}: wrong id ${l.id}`);
  assert(l.title===expectedTitles[i],`lesson ${global}: wrong title ${l.title}`);
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
  assert(String(l.source?.section||'').includes('Глава III'),`lesson ${global}: source outside chapter III`);
}
assert(Object.keys(series.geometryScenes||{}).length>=8,'lesson geometry scenes missing');

const workText=l=>JSON.stringify({practice:l.practice,homework:l.homework,independent:l.independent,control:l.control});
for(let i=0;i<5;i++){
  const s=workText(lessons[i]);
  for(const forbidden of ['a ∥ b. Накрест','a ∥ b. Соответ','a ∥ b. Один односторонний','Сформулируйте аксиому параллельных прямых'])assert(!s.includes(forbidden),`lesson ${26+i}: later theorem leaked early: ${forbidden}`);
}
const lesson31Work=workText(lessons[5]);
assert(lesson31Work.includes('Сформулируйте аксиому параллельных прямых'),'lesson 31 axiom material missing');
for(const forbidden of ['a ∥ b. Накрест','a ∥ b. Соответ','a ∥ b. Один односторонний'])assert(!lesson31Work.includes(forbidden),`lesson 31: p.29 property leaked before lesson 32`);
assert(workText(lessons[6]).includes('a ∥ b. Накрест'),'lesson 32 properties not introduced');
assert(workText(lessons[2]).includes('x=20'),'lesson 28 equation regression');
assert(workText(lessons[3]).includes('x=25'),'lesson 29 equation regression');
assert(workText(lessons[6]).includes('x=22,5'),'lesson 32 equation regression');
assert(workText(lessons[7]).includes('x=22'),'lesson 33 equation regression');
assert(workText(lessons[8]).includes('x=21'),'lesson 34 equation regression');

const assessmentWindow={};
new vm.Script(read(assessmentData),{filename:assessmentData}).runInContext(vm.createContext({window:assessmentWindow,console}));
const a=assessmentWindow.KTP_ASSESSMENT_DATA;
assert(a?.meta?.topic==='03','assessment topic id');
assert(String(a.meta.sourceNote||'').includes('§§1–2, пп. 24–29'),'assessment source range');
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
for(const v of a.topic.control.variants){
  const eq=v.tasks.find(t=>String(t.text).includes('3x+'));
  assert(eq&&String(eq.answer).includes('x=18')&&String(eq.solution).includes('2x=36'),`thematic control v${v.id}: parameter equation answer regression`);
  const side=v.tasks.find(t=>String(t.text).includes('2x+10'));
  assert(side&&String(side.answer).includes('x=25')&&String(side.answer).includes('60°')&&String(side.answer).includes('120°'),`thematic control v${v.id}: one-sided equation regression`);
}

const plan=read(lessonPlan),map=read(contentMap),lnk=read(lessonLinks),alnk=read(assessmentLinks);
assert(plan.includes('Источник: глава III, §§1–2, пп. 24–29.'),'lesson plan source mapping');
assert(plan.includes('31. Аксиомы геометрии. Аксиома параллельных прямых')&&plan.includes('32. Свойства углов при параллельных прямых и секущей'),'lesson 31/32 theorem sequence');
assert(map.includes('| 03 | Параллельные прямые | 10.12.2026–14.01.2027 | 26–34 | Гл. III, §§1–2, пп. 24–29 | **full** |'),'content map topic03 source mapping');
assert(lnk.includes("2:{count:9,weeks:'уроки 26–34 курса',href:'../../lessons/7-geometry-atanasyan/03/index.html'}"),'topic03 lesson link missing');
assert(alnk.includes("'7-geometry-atanasyan':{min:0,max:2}"),'topic03 assessment link missing');

const indexHtml=read(`${lessonDir}/index.html`);
assert(indexHtml.includes('<script src="data.js"></script><script src="refine.js"></script>'),'lesson index refinement load order');
for(let i=1;i<=9;i++){
  const f=`${lessonDir}/${String(i).padStart(2,'0')}.html`,h=read(f);
  assert(h.includes('data-topic="2"'),`${f}: wrong topic`);
  assert(h.includes('<script src="data.js"></script><script src="refine.js"></script>'),`${f}: refinement load order missing`);
  assert(h.includes('../../global-numbering.js'),`${f}: global numbering missing`);
  assert(h.includes('../../../geometry/lesson-geometry.js')&&h.includes('../../../geometry/geometry-scene.js'),`${f}: geometry runtime missing`);
}

console.log(`Grade 7 Atanasyan topic 03 QA passed: ${checks} checks; 9 lessons (26–34), theorem-sequence guards, 6+6 per-lesson variants, thematic 14/20 assessment.`);
