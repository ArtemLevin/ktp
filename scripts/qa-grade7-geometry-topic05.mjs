import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();let checks=0;
const fail=m=>{throw new Error(m)};
const assert=(v,m)=>{checks++;if(!v)fail(m)};
const abs=p=>path.join(ROOT,p),exists=p=>fs.existsSync(abs(p)),read=p=>fs.readFileSync(abs(p),'utf8');
const compile=p=>{const s=read(p);try{new vm.Script(s,{filename:p});checks++;return s}catch(e){fail(`${p}: JS syntax error: ${e.message}`)}};
const sum=xs=>xs.reduce((a,b)=>a+Number(b||0),0);
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const pointLineDistance=(p,a,b)=>Math.abs((b[1]-a[1])*p[0]-(b[0]-a[0])*p[1]+b[0]*a[1]-b[1]*a[0])/Math.hypot(b[1]-a[1],b[0]-a[0]);
const sceneLineDistance=(s,centerName,pair)=>pointLineDistance(s.points[centerName],s.points[pair[0]],s.points[pair[1]]);

const topic='topics/7-geometry-atanasyan/05.html';
const contentFile='content/7-geometry-atanasyan/05.js';
const contentRefine='content/7-geometry-atanasyan/05-refine.js';
const lessonDir='lessons/7-geometry-atanasyan/05';
const lessonFiles=[`${lessonDir}/series.js`,`${lessonDir}/scenes.js`,`${lessonDir}/data.js`,`${lessonDir}/refine.js`];
const assessmentData='assessments/7-geometry-atanasyan/05/data.js';
const map='content/7-geometry-atanasyan/content-map.md';
const plan='lessons/7-geometry-atanasyan/lesson-plan.md';
const lessonLinks='lessons/topic-links.js',assessmentLinks='assessments/topic-links.js';
const labHtml='labs/7-geometry-atanasyan/loci-circle/index.html',labJs='labs/7-geometry-atanasyan/loci-circle/lab.js',labCss='labs/7-geometry-atanasyan/lab.css';
const required=[topic,contentFile,contentRefine,...lessonFiles,assessmentData,map,plan,lessonLinks,assessmentLinks,labHtml,labJs,labCss,`${lessonDir}/index.html`,'assessments/7-geometry-atanasyan/05/independent.html','assessments/7-geometry-atanasyan/05/control.html'];
for(let i=1;i<=13;i++)required.push(`${lessonDir}/${String(i).padStart(2,'0')}.html`);
required.forEach(f=>assert(exists(f),`${f}: missing`));
[contentFile,contentRefine,...lessonFiles,assessmentData,lessonLinks,assessmentLinks,labJs].forEach(compile);

const html=read(topic);
for(const token of ['data-topic="4"','../../content/7-geometry-atanasyan/05.js','../../content/7-geometry-atanasyan/05-refine.js','../../lessons/topic-links.js','../../assessments/topic-links.js','../../geometry/geometry-scene.js'])assert(html.includes(token),`${topic}: missing ${token}`);

const topicWindow={KTP_CONTENT:{}};
const topicCtx=vm.createContext({window:topicWindow,console,KTP_REGISTER_CONTENT:(id,data)=>{topicWindow.KTP_CONTENT[id]=data;}});
for(const f of [contentFile,contentRefine])new vm.Script(read(f),{filename:f}).runInContext(topicCtx);
const c=topicWindow.KTP_CONTENT['7-geometry-atanasyan::4'];
assert(c,'topic content not registered');
assert(c.meta?.title==='Геометрические места точек. Симметрия','topic title');
assert(String(c.meta?.chapter||'').includes('ФРП-2025'),'topic normative mapping');
assert(c.objectives?.length>=9,'topic objectives');
assert(c.expectedResults?.length>=10,'topic expected results');
assert(c.theory?.length>=10,'topic theory');
assert(c.examples?.length>=6,'topic examples');
assert(c.mistakes?.length>=7,'topic mistakes');
for(const [k,min] of [['basic',5],['standard',5],['transfer',4],['challenge',3]])assert(c.practice?.[k]?.length>=min,`topic practice.${k}`);
assert(c.diagnostic?.length>=6,'topic diagnostic');
assert(c.homework?.required?.length>=6&&c.homework?.optional?.length>=2,'topic homework');
assert(c.lab?.enabled&&c.lab.href==='../../labs/7-geometry-atanasyan/loci-circle/index.html','topic lab link');
const sourceText=JSON.stringify(c.source||{});
for(const token of ['пп. 21–23','п. 47','пп. 68–69','п. 72','пп. 74–75','пп. 70–71'])assert(sourceText.includes(token),`topic source map missing ${token}`);
assert(sourceText.includes('не включаются'),'topic source must explicitly exclude points 70–71');
assert(Object.keys(c.geometryScenes||{}).length>=10,'topic geometry scenes');
for(const [id,s] of Object.entries(c.geometryScenes||{})){assert(String(s.title||'').trim(),`${id}: title`);assert(String(s.ariaLabel||'').trim(),`${id}: aria`);assert(String(s.caption||'').trim(),`${id}: caption`);assert(Array.isArray(s.viewBox)&&s.viewBox.length===4,`${id}: viewBox`);assert(Array.isArray(s.objects)&&s.objects.length,`${id}: objects`);}
const ts=c.geometryScenes['axial-symmetry'];
assert(ts.objects.some(o=>o.type==='segment'&&o.points?.join('-')==='P-O'&&o.ticks===1),'topic symmetry: PO equality mark');
assert(ts.objects.some(o=>o.type==='segment'&&o.points?.join('-')==='O-Q'&&o.ticks===1),'topic symmetry: OP′ equality mark');
const tlc=c.geometryScenes['line-circle'];
assert(sceneLineDistance(tlc,'O3',['N1','N2'])>55,'topic line-circle: external line must not intersect circle');
const tic=c.geometryScenes['triangle-incircle'];
for(const pair of [['A','B'],['B','C'],['A','C']])assert(Math.abs(sceneLineDistance(tic,'I',pair)-76)<1,`topic incircle: radius mismatch on ${pair.join('')}`);
const tcc=c.geometryScenes['triangle-circumcircle'];
for(const p of ['A','B','C'])assert(Math.abs(dist(tcc.points.O,tcc.points[p])-100)<1e-6,`topic circumcircle: ${p} not on circle`);

const lw={};const lctx=vm.createContext({window:lw,console});
for(const f of lessonFiles)new vm.Script(read(f),{filename:f}).runInContext(lctx);
const S=lw.KTP_LESSON_SERIES,lessons=[...(S?.lessons||[])].sort((a,b)=>a.number-b.number);
assert(S?.meta?.rowId==='7-geometry-atanasyan'&&S.meta.topicIndex===4,'series identity');
assert(S.meta.totalLessons===13&&S.meta.courseLessonStart===48&&S.meta.courseLessonEnd===60&&S.meta.courseTotal===68,'series bounds');
assert(lessons.length===13,`expected 13 lessons, got ${lessons.length}`);
const titles=['Геометрическое место точек: идея и примеры','Серединный перпендикуляр как геометрическое место точек','Биссектриса угла как геометрическое место точек','Осевая симметрия: точки, фигуры и серединный перпендикуляр','Окружность и круг. Радиус, хорда и диаметр','Взаимное расположение прямой и окружности','Касательная к окружности. Перпендикулярность касательной и радиуса','Окружность, вписанная в угол. Центр на биссектрисе','Вписанная окружность треугольника. Пересечение биссектрис','Описанная окружность треугольника. Пересечение серединных перпендикуляров','Метод ГМТ и основные построения циркулем и линейкой','Построение касательной и комбинированные конструктивные задачи','Обобщение и диагностика темы'];
for(let i=0;i<13;i++){
 const l=lessons[i],local=i+1,global=48+i;
 assert(l.number===local&&l.globalNumber===global&&l.id===String(local).padStart(2,'0'),`lesson ${global}: numbering`);
 assert(l.title===titles[i],`lesson ${global}: title ${l.title}`);
 assert(l.objectives?.length>=2&&l.prerequisites?.length>=2,`lesson ${global}: goals/prereq`);
 assert(l.theory?.length>=2&&l.examples?.length>=2&&l.mistakes?.length>=3,`lesson ${global}: instructional blocks`);
 assert(l.practice?.length>=8,`lesson ${global}: practice`);
 assert(l.homework?.required?.length>=6&&l.homework?.optional?.length>=2,`lesson ${global}: homework`);
 for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){
  const w=l[kind];assert(w?.variants?.length===6,`lesson ${global} ${kind}: variants`);assert(w.maxScore===max,`lesson ${global} ${kind}: max`);
  for(const v of w.variants){assert(v.tasks?.length===count,`lesson ${global} ${kind} v${v.id}: tasks`);assert(sum(v.tasks.map(t=>t.points))===max,`lesson ${global} ${kind} v${v.id}: score`);for(const t of v.tasks){assert(String(t.text||'').trim(),`lesson ${global}: empty task`);assert(String(t.answer||'').trim(),`lesson ${global}: empty answer`);}}
 }
 assert(String(l.source?.section||'').trim(),`lesson ${global}: source`);
}
assert(Object.keys(S.geometryScenes||{}).length>=11,'lesson geometry scenes');
const ls=S.geometryScenes['g-symmetry'];
assert(ls.objects.some(o=>o.type==='segment'&&o.points?.join('-')==='P-O'&&o.ticks===1),'lesson symmetry: PO equality mark');
assert(ls.objects.some(o=>o.type==='segment'&&o.points?.join('-')==='O-Q'&&o.ticks===1),'lesson symmetry: OP′ equality mark');
const llc=S.geometryScenes['g-line-circle'];
assert(sceneLineDistance(llc,'O3',['N1','N2'])>55,'lesson line-circle: external line must not intersect circle');
const lic=S.geometryScenes['g-incircle'];for(const pair of [['A','B'],['B','C'],['A','C']])assert(Math.abs(sceneLineDistance(lic,'I',pair)-76)<1,`lesson incircle: radius mismatch ${pair.join('')}`);
const lcc=S.geometryScenes['g-circumcircle'];for(const p of ['A','B','C'])assert(Math.abs(dist(lcc.points.O,lcc.points[p])-100)<1e-6,`lesson circumcircle: ${p} not on circle`);

const work=i=>JSON.stringify({theory:lessons[i].theory,examples:lessons[i].examples,mistakes:lessons[i].mistakes,practice:lessons[i].practice,homework:lessons[i].homework,independent:lessons[i].independent,control:lessons[i].control,summary:lessons[i].summary});
assert(!work(0).includes('равноудалённых от двух пересекающихся прямых'),'lesson48 must not pre-teach bisector locus theorem');
assert(!work(2).includes('Центр окружности касается обеих сторон угла'),'lesson50 must not pre-teach tangency construction');
assert(work(5).includes('ровно одну общую точку'),'lesson53 tangent definition missing');
assert(!work(5).includes('перпендикулярна радиусу'),'lesson53 tangent-radius theorem leaked before lesson54');
assert(work(6).includes('перпендикулярна радиусу')||work(6).includes('перпендикулярна радиусу,')||work(6).includes('Касательная к окружности перпендикулярна радиусу'),'lesson54 tangent-radius theorem missing');
assert(work(8).includes('центр вписанной окружности'),'lesson56 incircle center missing');
assert(work(9).includes('центр описанной окружности'),'lesson57 circumcircle center missing');
const instructional=lessons.map((l,i)=>work(i)).join('\n').toLowerCase();
assert(!instructional.includes('центральный угол'),'central-angle material leaked into grade 7 topic05');
assert(!instructional.includes('вписанный угол'),'inscribed-angle material leaked into grade 7 topic05');

const aw={};new vm.Script(read(assessmentData),{filename:assessmentData}).runInContext(vm.createContext({window:aw,console}));
const a=aw.KTP_ASSESSMENT_DATA;
assert(a?.meta?.topic==='05','assessment topic id');
const asource=String(a.meta.sourceNote||'');
for(const token of ['пп. 21–23','п. 47','пп. 68–69','п. 72','пп. 74–75','Пункты 70–71'])assert(asource.includes(token),`assessment source missing ${token}`);
for(const [kind,count,max] of [['independent',7,14],['control',10,20]]){const w=a.topic?.[kind];assert(w?.variants?.length===6,`thematic ${kind}: variants`);assert(w.maxScore===max,`thematic ${kind}: max`);for(const v of w.variants){assert(v.tasks.length===count,`thematic ${kind} v${v.id}: tasks`);assert(sum(v.tasks.map(t=>t.points))===max,`thematic ${kind} v${v.id}: score`);}}
for(let i=0;i<6;i++){
 const v=i+1,ind=a.topic.independent.variants[i],ctrl=a.topic.control.variants[i];
 const r=4+v,d=3+v,ma=7+v,half=5+v,tan=8+v;
 assert(ind.tasks[0].answer.includes(String(r)),`thematic independent v${v}: locus radius`);
 assert(ind.tasks[1].answer.includes(String(ma)),`thematic independent v${v}: perpendicular bisector length`);
 assert(ind.tasks[2].answer.includes(String(d)),`thematic independent v${v}: angle distance`);
 assert(ind.tasks[3].answer.includes(String(half)),`thematic independent v${v}: symmetry half`);
 assert(ind.tasks[6].answer.includes(String(tan)),`thematic independent v${v}: tangent segment`);
 const cr=5+v,ceq=8+v,cd=4+v,chalf=6+v,ctan=9+v;
 assert(ctrl.tasks[1].answer.includes(String(2*cr)),`thematic control v${v}: diameter`);
 assert(ctrl.tasks[3].answer.includes(String(ceq)),`thematic control v${v}: MA=MB`);
 assert(ctrl.tasks[4].text.includes(String(cd)),`thematic control v${v}: angle distance parameter`);
 assert(ctrl.tasks[5].answer.includes(String(chalf)),`thematic control v${v}: symmetry half`);
 assert(ctrl.tasks[6].answer.includes(String(ctan)),`thematic control v${v}: tangent equality`);
}

const m=read(map),p=read(plan),lnk=read(lessonLinks),alnk=read(assessmentLinks);
const row=m.split('\n').find(line=>line.startsWith('| 05 | Геометрические места точек. Симметрия |'))||'';
assert(row.includes('04.03–22.04.2027')&&row.includes('48–60')&&row.includes('**full**'),'content map topic05 row');
for(const token of ['глава II, §4, пп. 21–23','глава VI, §3, п. 47','глава VIII, §1, пп. 68–69','глава VIII, §3, п. 72','глава VIII, §4, пп. 74–75'])assert(p.includes(token),`lesson plan source missing ${token}`);
assert(p.includes('Пункты 70–71')&&p.includes('не входят'),'lesson plan must exclude points 70–71');
assert(lnk.includes("4:{count:13,weeks:'уроки 48–60 курса',href:'../../lessons/7-geometry-atanasyan/05/index.html'}"),'topic05 lesson link');
const geometryCfg=alnk.match(/'7-geometry-atanasyan':\{min:0,max:(\d+)\}/);assert(geometryCfg&&Number(geometryCfg[1])>=4,'topic05 assessment navigation');
for(let i=1;i<=13;i++){const f=`${lessonDir}/${String(i).padStart(2,'0')}.html`,h=read(f);assert(h.includes('data-topic="4"'),`${f}: topic`);assert(h.includes('<script src="data.js"></script><script src="refine.js"></script>'),`${f}: refine load order`);assert(h.includes('../../global-numbering.js'),`${f}: global numbering`);assert(h.includes('../../../geometry/lesson-geometry.js')&&h.includes('../../../geometry/geometry-scene.js'),`${f}: geometry runtime`);}
const index=read(`${lessonDir}/index.html`);assert(index.includes('<script src="data.js"></script><script src="refine.js"></script>'),'lesson index refine load order');
const lh=read(labHtml);for(const token of ['id="mode"','value="bisector"','value="perp"','value="tangent"','id="stage"','lab.js'])assert(lh.includes(token),`lab html missing ${token}`);
console.log(`Grade 7 Atanasyan topic 05 QA passed: ${checks} checks; 13 lessons (48–60), distributed source map, geometry guards, 6+6 lesson variants, thematic 14/20 assessment, digital lab.`);
