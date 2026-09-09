import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();let checks=0;
const fail=m=>{throw new Error(m)};
const assert=(v,m)=>{checks++;if(!v)fail(m)};
const abs=p=>path.join(ROOT,p),exists=p=>fs.existsSync(abs(p)),read=p=>fs.readFileSync(abs(p),'utf8');
const compile=p=>{const s=read(p);try{new vm.Script(s,{filename:p});checks++;return s}catch(e){fail(`${p}: JS syntax error: ${e.message}`)}};
const sum=xs=>xs.reduce((a,b)=>a+Number(b||0),0);

const topic='topics/7-geometry-atanasyan/04.html';
const contentFile='content/7-geometry-atanasyan/04.js';
const lessonDir='lessons/7-geometry-atanasyan/04';
const lessonFiles=[`${lessonDir}/series.js`,`${lessonDir}/scenes.js`,`${lessonDir}/data.js`];
const assessmentData='assessments/7-geometry-atanasyan/04/data.js';
const map='content/7-geometry-atanasyan/content-map.md';
const plan='lessons/7-geometry-atanasyan/lesson-plan.md';
const lessonLinks='lessons/topic-links.js',assessmentLinks='assessments/topic-links.js';
for(const f of [topic,contentFile,...lessonFiles,assessmentData,map,plan,lessonLinks,assessmentLinks,`${lessonDir}/index.html`,'assessments/7-geometry-atanasyan/04/independent.html','assessments/7-geometry-atanasyan/04/control.html'])assert(exists(f),`${f}: missing`);
for(let i=1;i<=13;i++)assert(exists(`${lessonDir}/${String(i).padStart(2,'0')}.html`),`lesson html ${i}: missing`);
for(const f of [contentFile,...lessonFiles,assessmentData,lessonLinks,assessmentLinks])compile(f);

const html=read(topic);
for(const token of ['data-topic="3"','../../content/7-geometry-atanasyan/04.js','../../lessons/topic-links.js','../../assessments/topic-links.js','../../geometry/geometry-scene.js'])assert(html.includes(token),`${topic}: missing ${token}`);

const topicWindow={KTP_CONTENT:{}};
const topicCtx=vm.createContext({window:topicWindow,console,KTP_REGISTER_CONTENT:(id,data)=>{topicWindow.KTP_CONTENT[id]=data;}});
new vm.Script(read(contentFile),{filename:contentFile}).runInContext(topicCtx);
const c=topicWindow.KTP_CONTENT['7-geometry-atanasyan::3'];
assert(c,'topic content not registered');
assert(c.meta?.title==='Соотношения между сторонами и углами треугольника','topic title');
assert(c.meta?.chapter==='Глава IV · §§1–4 · пп. 30–38','topic source range');
assert(c.objectives?.length>=8,'topic objectives');
assert(c.expectedResults?.length>=10,'topic results');
assert(c.theory?.length>=10,'topic theory');
assert(c.examples?.length>=7,'topic examples');
assert(c.mistakes?.length>=8,'topic mistakes');
for(const [k,min] of [['basic',5],['standard',5],['transfer',5],['challenge',4]])assert(c.practice?.[k]?.length>=min,`topic practice.${k}`);
assert(c.diagnostic?.length>=6,'topic diagnostic');
assert(c.homework?.required?.length>=6&&c.homework?.optional?.length>=2,'topic homework');
assert(Object.keys(c.geometryScenes||{}).length>=9,'topic geometry scenes');
for(const [id,s] of Object.entries(c.geometryScenes)){assert(String(s.title||'').trim(),`${id}: title`);assert(String(s.ariaLabel||'').trim(),`${id}: aria`);assert(String(s.caption||'').trim(),`${id}: caption`);assert(Array.isArray(s.viewBox)&&s.viewBox.length===4,`${id}: viewBox`);assert(Array.isArray(s.objects)&&s.objects.length,`${id}: objects`);}
const topicText=JSON.stringify(c);
for(const token of ['180°','половине гипотенузы','Расстояние от точки до прямой','неравенство треугольника'])assert(topicText.includes(token),`topic missing ${token}`);
assert(!String(c.source?.paragraphs||'').includes('§5'),'topic must not claim chapter IV §5');

const lw={};const lctx=vm.createContext({window:lw,console});
for(const f of lessonFiles)new vm.Script(read(f),{filename:f}).runInContext(lctx);
const S=lw.KTP_LESSON_SERIES,lessons=[...(S?.lessons||[])].sort((a,b)=>a.number-b.number);
assert(S?.meta?.rowId==='7-geometry-atanasyan','series row');
assert(S.meta.topicIndex===3,'series topic index');
assert(S.meta.totalLessons===13&&S.meta.courseLessonStart===35&&S.meta.courseLessonEnd===47&&S.meta.courseTotal===68,'series bounds');
assert(lessons.length===13,`expected 13 lessons, got ${lessons.length}`);
const titles=['Сумма углов треугольника','Внешний угол треугольника','Остроугольный, прямоугольный и тупоугольный треугольники','Соотношение между сторонами и углами треугольника','Признак равнобедренного треугольника','Неравенство треугольника','Возможные длины сторон и следствия неравенства треугольника','Прямоугольный треугольник: острые углы, катеты и гипотенуза','Катет против угла 30° и обратное свойство','Признаки равенства прямоугольных треугольников','Расстояние от точки до прямой. Расстояние между параллельными прямыми','Построение треугольника по трём элементам','Обобщение и диагностика темы'];
for(let i=0;i<13;i++){
 const l=lessons[i],local=i+1,global=35+i;
 assert(l.number===local&&l.globalNumber===global&&l.id===String(local).padStart(2,'0'),`lesson ${global}: numbering`);
 assert(l.title===titles[i],`lesson ${global}: title ${l.title}`);
 assert(l.objectives?.length>=2&&l.prerequisites?.length>=2,`lesson ${global}: goals/prereq`);
 assert(l.theory?.length>=2&&l.examples?.length>=2&&l.mistakes?.length>=3,`lesson ${global}: instructional blocks`);
 assert(l.practice?.length>=8,`lesson ${global}: practice`);
 assert(l.homework?.required?.length>=6&&l.homework?.optional?.length>=2,`lesson ${global}: homework`);
 for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){
  const w=l[kind];assert(w?.variants?.length===6,`lesson ${global} ${kind}: variants`);assert(w.maxScore===max,`lesson ${global} ${kind}: max score`);
  for(const v of w.variants){assert(v.tasks?.length===count,`lesson ${global} ${kind} v${v.id}: count`);assert(sum(v.tasks.map(t=>t.points))===max,`lesson ${global} ${kind} v${v.id}: points`);v.tasks.forEach((t,j)=>{assert(String(t.text||'').trim(),`lesson ${global} v${v.id} task${j+1}: text`);assert(String(t.answer||'').trim(),`lesson ${global} v${v.id} task${j+1}: answer`);});}
 }
 assert(String(l.source?.section||'').includes('Глава IV'),`lesson ${global}: source`);
}
assert(Object.keys(S.geometryScenes||{}).length>=10,'lesson scenes');
const work=i=>JSON.stringify({practice:lessons[i].practice,homework:lessons[i].homework,independent:lessons[i].independent,control:lessons[i].control,theory:lessons[i].theory});
for(let i=0;i<4;i++)assert(!work(i).includes('Если два угла треугольника равны, то равны и стороны'),`lesson ${35+i}: isosceles converse leaked early`);
for(let i=0;i<8;i++)assert(!work(i).includes('половине гипотенузы'),`lesson ${35+i}: 30-degree property leaked early`);
for(let i=0;i<10;i++)assert(!work(i).includes('Расстояние от точки до прямой'),`lesson ${35+i}: distance leaked early`);
assert(work(4).includes('равны')&&lessons[4].source.section.includes('п. 32'),'lesson39 isosceles criterion missing');
assert(work(5).includes('Каждая сторона треугольника меньше суммы двух других'),'lesson40 triangle inequality missing');
assert(work(8).includes('половине гипотенузы'),'lesson43 30-degree property missing');
assert(work(10).includes('Расстояние'),'lesson45 distance missing');
assert(work(11).includes('окружност'),'lesson46 construction missing');
assert(work(0).includes('x=40'),'lesson35 equation regression');
assert(work(1).includes('x=31'),'lesson36 equation regression');
assert(work(6).includes('5 < x < 19'),'lesson41 interval regression');
assert(work(8).includes('30°'),'lesson43 converse regression');

const aw={};new vm.Script(read(assessmentData),{filename:assessmentData}).runInContext(vm.createContext({window:aw,console}));
const a=aw.KTP_ASSESSMENT_DATA;
assert(a?.meta?.topic==='04','assessment topic id');
assert(String(a.meta.sourceNote||'').includes('§§1–4, пп. 30–38'),'assessment source range');
for(const [kind,count,max] of [['independent',7,14],['control',10,20]]){const w=a.topic?.[kind];assert(w?.variants?.length===6,`thematic ${kind}: variants`);assert(w.maxScore===max,`thematic ${kind}: max`);for(const v of w.variants){assert(v.tasks.length===count,`thematic ${kind} v${v.id}: count`);assert(sum(v.tasks.map(t=>t.points))===max,`thematic ${kind} v${v.id}: points`);}}
for(const v of a.topic.control.variants){const eq=v.tasks.find(t=>String(t.text).includes('Углы треугольника равны x°'));assert(eq&&/x=\d/.test(eq.answer),`thematic control v${v.id}: equation answer`);const sss=v.tasks[v.tasks.length-1];assert(sss.points===4&&String(sss.answer).includes('Построение возможно'),`thematic control v${v.id}: SSS task`);}

const m=read(map),p=read(plan),lnk=read(lessonLinks),alnk=read(assessmentLinks);
assert(m.includes('| 04 | Соотношения между сторонами и углами треугольника | 18.01–01.03.2027 | 35–47 | Гл. IV, §§1–4, пп. 30–38'),'content map source correction');
assert(m.includes('п. 36*')&&m.includes('дополнительный'),'optional point 36 mapping');
assert(p.includes('Источник: глава IV, §§1–4, пп. 30–38'),'lesson plan source');
assert(p.includes('39. Признак равнобедренного треугольника')&&p.includes('43. Катет против угла 30°'),'lesson plan sequence');
assert(lnk.includes("3:{count:13,weeks:'уроки 35–47 курса',href:'../../lessons/7-geometry-atanasyan/04/index.html'}"),'topic04 lesson link');
assert(alnk.includes("'7-geometry-atanasyan':{min:0,max:3}"),'topic04 assessment link');
for(let i=1;i<=13;i++){const f=`${lessonDir}/${String(i).padStart(2,'0')}.html`,h=read(f);assert(h.includes('data-topic="3"'),`${f}: topic`);assert(h.includes('../../global-numbering.js'),`${f}: global numbering`);assert(h.includes('../../../geometry/lesson-geometry.js')&&h.includes('../../../geometry/geometry-scene.js'),`${f}: geometry runtime`);}
console.log(`Grade 7 Atanasyan topic 04 QA passed: ${checks} checks; 13 lessons (35–47), source §§1–4 pp.30–38, sequence guards, 6+6 lesson variants, thematic 14/20 assessment.`);
