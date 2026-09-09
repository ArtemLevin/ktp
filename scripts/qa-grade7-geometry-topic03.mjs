import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const ok=(v,m)=>{checks++;if(!v)throw new Error(m)};
const compile=p=>{new vm.Script(read(p),{filename:p});checks++;};
const score=tasks=>tasks.reduce((s,t)=>s+Number(t.points||0),0);

const topic='topics/7-geometry-atanasyan/03.html';
const content='content/7-geometry-atanasyan/03.js';
const dir='lessons/7-geometry-atanasyan/03';
const lessonJs=[`${dir}/series.js`,`${dir}/scenes.js`,`${dir}/data.js`,`${dir}/refine.js`];
const assessment='assessments/7-geometry-atanasyan/03/data.js';
const required=[topic,content,...lessonJs,assessment,`${dir}/index.html`,'lessons/7-geometry-atanasyan/lesson-plan.md','content/7-geometry-atanasyan/content-map.md','lessons/topic-links.js','assessments/topic-links.js','assessments/7-geometry-atanasyan/03/independent.html','assessments/7-geometry-atanasyan/03/control.html'];
for(let i=1;i<=9;i++)required.push(`${dir}/${String(i).padStart(2,'0')}.html`);
required.forEach(p=>ok(exists(p),`${p}: missing`));
[content,...lessonJs,assessment,'lessons/topic-links.js','assessments/topic-links.js'].forEach(compile);
for(const p of ['tmp-placeholder.txt','DO_NOT_KEEP.tmp','ANOTHER_TEMP.tmp',`${dir}/refine-loader-note.txt`,`${dir}/refine-loader.js`])ok(!exists(p),`${p}: temporary file leaked`);

const topicHtml=read(topic);
for(const token of ['data-topic="2"','../../content/7-geometry-atanasyan/03.js','../../lessons/topic-links.js','../../assessments/topic-links.js','../../geometry/geometry-scene.js'])ok(topicHtml.includes(token),`${topic}: missing ${token}`);

const w={KTP_CONTENT:{}};
new vm.Script(read(content)).runInContext(vm.createContext({window:w,console,KTP_REGISTER_CONTENT:(id,data)=>{w.KTP_CONTENT[id]=data;}}));
const c=w.KTP_CONTENT['7-geometry-atanasyan::2'];
ok(c?.meta?.title==='Параллельные прямые','topic title');
ok(c.meta.chapter==='Глава III · §§1–2 · пп. 24–29','topic source range');
ok(c.objectives?.length>=6&&c.expectedResults?.length>=8,'topic goals/results');
ok(c.theory?.length>=10&&c.examples?.length>=6&&c.mistakes?.length>=7,'topic theory/examples/mistakes');
for(const [k,n] of [['basic',5],['standard',5],['transfer',4],['challenge',3]])ok(c.practice?.[k]?.length>=n,`practice.${k}`);
const cText=JSON.stringify(c);
ok(cText.includes('углы → параллельность')&&cText.includes('параллельность → углы'),'criterion/property direction missing');
ok(Object.keys(c.geometryScenes||{}).length>=5,'topic geometry scenes');
for(const [id,s] of Object.entries(c.geometryScenes||{})){ok(s.title&&s.ariaLabel&&s.caption,`${id}: scene text`);ok(Array.isArray(s.viewBox)&&s.viewBox.length===4&&s.objects?.length,`${id}: scene geometry`);}

const lw={};
const ctx=vm.createContext({window:lw,console});
lessonJs.forEach(p=>new vm.Script(read(p),{filename:p}).runInContext(ctx));
const s=lw.KTP_LESSON_SERIES;
ok(s?.meta?.rowId==='7-geometry-atanasyan'&&s.meta.topicIndex===2,'series identity');
ok(s.meta.totalLessons===9&&s.meta.courseLessonStart===26&&s.meta.courseLessonEnd===34&&s.meta.courseTotal===68,'series numbering');
const lessons=[...(s.lessons||[])].sort((a,b)=>a.number-b.number);
ok(lessons.length===9,'expected 9 lessons');
const titles=['Параллельные прямые и параллельные отрезки','Секущая. Накрест лежащие, соответственные и односторонние углы','Первый признак параллельности прямых','Второй и третий признаки параллельности прямых','Практика на признаки. Построение параллельных прямых','Аксиомы геометрии. Аксиома параллельных прямых','Свойства углов при параллельных прямых и секущей','Доказательные задачи на параллельность','Обобщение темы «Параллельные прямые»'];
for(let i=0;i<9;i++){
  const l=lessons[i],g=26+i;
  ok(l.id===String(i+1).padStart(2,'0')&&l.number===i+1&&l.globalNumber===g,`lesson ${g}: numbering`);
  ok(l.title===titles[i],`lesson ${g}: title`);
  ok(l.objectives?.length>=2&&l.prerequisites?.length>=2&&l.theory?.length>=2&&l.examples?.length>=2&&l.mistakes?.length>=2,`lesson ${g}: content blocks`);
  ok(l.practice?.length>=8&&l.homework?.required?.length>=6&&l.homework?.optional?.length>=2,`lesson ${g}: practice/homework`);
  for(const [kind,count,max] of [['independent',5,10],['control',6,14]]){
    const work=l[kind];ok(work?.variants?.length===6&&work.maxScore===max,`lesson ${g} ${kind}: variants/max`);
    for(const v of work.variants){ok(v.tasks?.length===count,`lesson ${g} ${kind} v${v.id}: tasks`);ok(score(v.tasks)===max,`lesson ${g} ${kind} v${v.id}: score`);for(const t of v.tasks)ok(String(t.text||'').trim()&&String(t.answer||'').trim(),`lesson ${g} ${kind}: empty task/answer`);}
  }
  ok(String(l.source?.section||'').includes('Глава III'),`lesson ${g}: source`);
}
ok(Object.keys(s.geometryScenes||{}).length>=8,'lesson geometry scenes');

const work=l=>JSON.stringify({practice:l.practice,homework:l.homework,independent:l.independent,control:l.control});
for(let i=0;i<5;i++)for(const bad of ['a ∥ b. Накрест','a ∥ b. Соответ','a ∥ b. Один односторонний','Сформулируйте аксиому параллельных прямых'])ok(!work(lessons[i]).includes(bad),`lesson ${26+i}: future theorem leaked: ${bad}`);
ok(work(lessons[5]).includes('Сформулируйте аксиому параллельных прямых'),'lesson 31: axiom missing');
for(const bad of ['a ∥ b. Накрест','a ∥ b. Соответ','a ∥ b. Один односторонний'])ok(!work(lessons[5]).includes(bad),`lesson 31: p29 property leaked`);
ok(work(lessons[6]).includes('a ∥ b. Накрест'),'lesson 32: properties missing');
for(const [i,x] of [[2,'x=20'],[3,'x=25'],[6,'x=22,5'],[7,'x=22'],[8,'x=21']])ok(work(lessons[i]).includes(x),`lesson ${26+i}: equation regression ${x}`);

const aw={};
new vm.Script(read(assessment)).runInContext(vm.createContext({window:aw,console}));
const a=aw.KTP_ASSESSMENT_DATA;
ok(a?.meta?.topic==='03'&&String(a.meta.sourceNote).includes('§§1–2, пп. 24–29'),'assessment identity/source');
for(const [kind,count,max] of [['independent',7,14],['control',10,20]]){const q=a.topic[kind];ok(q.variants?.length===6&&q.maxScore===max,`thematic ${kind}: variants/max`);for(const v of q.variants){ok(v.tasks.length===count,`thematic ${kind} v${v.id}: tasks`);ok(score(v.tasks)===max,`thematic ${kind} v${v.id}: score`);}}
for(const v of a.topic.control.variants){const eq=v.tasks.find(t=>String(t.text).includes('3x+')),side=v.tasks.find(t=>String(t.text).includes('2x+10'));ok(eq&&String(eq.answer).includes('x=18')&&String(eq.solution).includes('2x=36'),`control v${v.id}: x=18 regression`);ok(side&&String(side.answer).includes('x=25')&&String(side.answer).includes('60°')&&String(side.answer).includes('120°'),`control v${v.id}: x=25 regression`);}

const plan=read('lessons/7-geometry-atanasyan/lesson-plan.md'),map=read('content/7-geometry-atanasyan/content-map.md'),links=read('lessons/topic-links.js'),alinks=read('assessments/topic-links.js');
ok(plan.includes('Источник: глава III, §§1–2, пп. 24–29.')&&plan.includes('31. Аксиомы геометрии. Аксиома параллельных прямых')&&plan.includes('32. Свойства углов при параллельных прямых и секущей'),'lesson plan mapping/sequence');
const row=map.split('\n').find(line=>line.startsWith('| 03 | Параллельные прямые |'))||'';
ok(row.includes('10.12.2026–14.01.2027')&&row.includes('26–34')&&row.includes('Гл. III, §§1–2, пп. 24–29')&&row.includes('**full**'),'content map topic03 row');
ok(links.includes("2:{count:9,weeks:'уроки 26–34 курса',href:'../../lessons/7-geometry-atanasyan/03/index.html'}"),'lesson navigation');
ok(alinks.includes("'7-geometry-atanasyan':{min:0,max:2}"),'assessment navigation');

for(const f of [`${dir}/index.html`,...Array.from({length:9},(_,i)=>`${dir}/${String(i+1).padStart(2,'0')}.html`)]){const h=read(f);ok(h.includes('<script src="data.js"></script><script src="refine.js"></script>'),`${f}: refine load order`);if(!f.endsWith('index.html'))ok(h.includes('../../global-numbering.js')&&h.includes('../../../geometry/lesson-geometry.js')&&h.includes('../../../geometry/geometry-scene.js'),`${f}: runtime wiring`);}

console.log(`Grade 7 Atanasyan topic 03 QA passed: ${checks} checks; lessons 26–34, theorem sequence, 6+6 lesson checks, thematic 14/20.`);
