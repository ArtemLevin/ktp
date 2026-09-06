import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();let checks=0;
const assert=(cond,msg)=>{checks++;if(!cond)throw new Error(msg)};
const abs=p=>path.join(ROOT,p),exists=p=>fs.existsSync(abs(p)),read=p=>fs.readFileSync(abs(p),'utf8');
const rel=(from,target)=>path.normalize(path.join(path.dirname(from),target)).replaceAll('\\','/');
function compile(source,file){try{new vm.Script(source,{filename:file});checks++}catch(e){throw new Error(`${file}: JS syntax error: ${e.message}`)}}
function execute(source,context,file){try{new vm.Script(source,{filename:file}).runInContext(context);checks++}catch(e){throw new Error(`${file}: execution failed: ${e.message}`)}}
function scan(value,label,seen=new Set()){
 if(value===undefined)throw new Error(`${label}: undefined value`);
 if(typeof value==='number')assert(Number.isFinite(value),`${label}: non-finite number`);
 if(typeof value==='string')assert(!/\b(?:NaN|Infinity|undefined)\b/.test(value),`${label}: forbidden runtime token`);
 if(!value||typeof value!=='object'||seen.has(value))return;seen.add(value);
 if(Array.isArray(value))value.forEach((x,i)=>scan(x,`${label}[${i}]`,seen));else Object.entries(value).forEach(([k,x])=>scan(x,`${label}.${k}`,seen));
}
function tasks(items,label,min=1){
 assert(Array.isArray(items)&&items.length>=min,`${label}: expected at least ${min} tasks`);
 items.forEach((t,i)=>{assert(String(t?.text??t?.task??t??'').trim(),`${label}[${i}]: empty text`);if(t&&typeof t==='object')assert(String(t.answer??'').trim(),`${label}[${i}]: empty answer`)});
}
function assessment(block,label,score){
 assert(block&&Array.isArray(block.variants)&&block.variants.length===6,`${label}: expected 6 variants`);
 assert(Number(block.maxScore)===score,`${label}: maxScore ${block?.maxScore} != ${score}`);
 const ids=new Set(),signatures=new Set();
 block.variants.forEach((v,i)=>{ids.add(String(v.id));tasks(v.tasks,`${label} variant ${v.id}`);const sum=v.tasks.reduce((s,t)=>s+Number(t.points||0),0);assert(sum===score,`${label} variant ${v.id}: score ${sum}`);v.tasks.forEach((t,j)=>assert(Number(t.points)>0,`${label} variant ${v.id} task ${j+1}: invalid points`));signatures.add(JSON.stringify(v.tasks.map(t=>t.text)))});
 assert(ids.size===6,`${label}: duplicate variant ids`);assert(signatures.size===6,`${label}: variants are not textually distinct`);
}
const expectedTitles=[
'Сложение натуральных чисел: смысл, компоненты, проверка','Переместительное свойство сложения','Сочетательное свойство сложения','Рациональные приёмы сложения','Текстовые задачи на сложение','Вычитание как действие, обратное сложению','Компоненты вычитания и проверка','Свойства вычитания','Сравнение величин с помощью разности','Текстовые задачи на вычитание','Числовые выражения','Буквенные выражения','Значение буквенного выражения','Формулы и зависимости между величинами','Уравнение и корень уравнения','Уравнения на неизвестный компонент','Обобщение темы и тематическая диагностика'];

const topicHtml='topics/5-math-vilenkin/02.html',contentFile='content/5-math-vilenkin/02.js';
assert(exists(topicHtml),`${topicHtml}: missing`);assert(exists(contentFile),`${contentFile}: missing`);
const topicSource=read(topicHtml);assert(/<meta\s+name=["']viewport["']/i.test(topicSource),`${topicHtml}: viewport missing`);
for(const token of ['../../content/registry.js','../../content/5-math-vilenkin/02.js','../../assessments/topic-links.js','../../lessons/topic-links.js'])assert(topicSource.includes(token),`${topicHtml}: missing ${token}`);
let registered=null;const contentContext=vm.createContext({KTP_REGISTER_CONTENT:(id,data)=>{registered={id,data}},window:{},console});
const contentSource=read(contentFile);compile(contentSource,contentFile);execute(contentSource,contentContext,contentFile);assert(registered?.id==='5-math-vilenkin::1',`${contentFile}: wrong id`);scan(registered.data,contentFile);
const content=registered.data;
assert(content.meta?.title==='Сложение и вычитание натуральных чисел',`${contentFile}: wrong title`);assert(Array.isArray(content.objectives)&&content.objectives.length>=4,`${contentFile}: objectives`);assert(Array.isArray(content.expectedResults)&&content.expectedResults.length>=7,`${contentFile}: expectedResults`);assert(Array.isArray(content.prerequisites)&&content.prerequisites.length>=3,`${contentFile}: prerequisites`);tasks(content.prerequisiteCheck,`${contentFile} prerequisiteCheck`,4);assert(Array.isArray(content.map)&&content.map.length>=7,`${contentFile}: map too short`);assert(Array.isArray(content.theory)&&content.theory.length>=8,`${contentFile}: theory too short`);assert(Array.isArray(content.examples)&&content.examples.length>=6,`${contentFile}: examples too short`);content.examples.forEach((ex,i)=>['problem','idea','solution','check','answer'].forEach(k=>assert(String(ex[k]??'').trim(),`${contentFile}: example ${i+1} missing ${k}`)));assert(Array.isArray(content.mistakes)&&content.mistakes.length>=6,`${contentFile}: mistakes too short`);for(const level of ['basic','standard','transfer','challenge'])tasks(content.practice?.[level],`${contentFile} practice.${level}`);tasks(content.diagnostic,`${contentFile} diagnostic`,5);tasks(content.homework?.required,`${contentFile} homework.required`,6);tasks(content.homework?.optional,`${contentFile} homework.optional`,2);assert(Array.isArray(content.summary)&&content.summary.length>=7,`${contentFile}: summary too short`);assert(content.lab?.enabled!==true,`${contentFile}: decorative lab should not be enabled`);assert(String(content.source?.textbook||'').includes('Виленкин'),`${contentFile}: textbook source missing`);assert((content.source?.paragraphs||[]).some(x=>String(x).includes('пункты 8–11')),`${contentFile}: textbook range missing`);

const lessonBase='lessons/5-math-vilenkin/02',seriesFile=`${lessonBase}/series.js`,dataFile=`${lessonBase}/data.js`;
for(const file of [`${lessonBase}/index.html`,seriesFile,dataFile])assert(exists(file),`${file}: missing`);
compile(read(seriesFile),seriesFile);compile(read(dataFile),dataFile);
const lessonContext=vm.createContext({window:{},console});execute(read(seriesFile),lessonContext,seriesFile);execute(read(dataFile),lessonContext,dataFile);
const S=lessonContext.window.KTP_LESSON_SERIES;assert(S,`${lessonBase}: series missing`);scan(S,lessonBase);
assert(S.meta?.rowId==='5-math-vilenkin',`${lessonBase}: wrong row`);assert(Number(S.meta?.topicIndex)===1,`${lessonBase}: wrong topic index`);assert(Number(S.meta?.topicNumber)===2,`${lessonBase}: wrong topic number`);assert(Number(S.meta?.totalLessons)===17,`${lessonBase}: wrong totalLessons`);assert(Number(S.meta?.courseLessonStart)===19,`${lessonBase}: wrong course start`);assert(Number(S.meta?.courseLessonEnd)===35,`${lessonBase}: wrong course end`);assert(Number(S.meta?.courseTotal)===170,`${lessonBase}: wrong courseTotal`);assert(Array.isArray(S.lessons)&&S.lessons.length===17,`${lessonBase}: expected 17 lessons`);
let previousWeek=0;
S.lessons.forEach((lesson,i)=>{
 const id=String(i+1).padStart(2,'0'),html=`${lessonBase}/${id}.html`,global=19+i;assert(exists(html),`${html}: missing`);const h=read(html);assert(/<meta\s+name=["']viewport["']/i.test(h),`${html}: viewport missing`);for(const token of ['series.js','data.js','../../lesson-page.js','../../global-numbering.js'])assert(h.includes(token),`${html}: missing ${token}`);
 assert(String(lesson.id)===id,`${id}: wrong lesson id`);assert(Number(lesson.number)===i+1,`${id}: wrong lesson number`);assert(Number(lesson.globalNumber)===global,`${id}: wrong global number`);assert(lesson.title===expectedTitles[i],`${id}: title mismatch`);const week=Number(lesson.week);assert(Number.isInteger(week)&&week>=4&&week<=7,`${id}: wrong week ${lesson.week}`);assert(week>=previousWeek,`${id}: week order regression`);previousWeek=week;assert(Array.isArray(lesson.objectives)&&lesson.objectives.length>=2,`${id}: objectives missing`);assert(Array.isArray(lesson.prerequisites)&&lesson.prerequisites.length>=1,`${id}: prerequisites missing`);assert(Array.isArray(lesson.theory)&&lesson.theory.length>=2,`${id}: theory missing`);assert(Array.isArray(lesson.examples)&&lesson.examples.length>=2,`${id}: examples missing`);lesson.examples.forEach((ex,j)=>['problem','idea','solution','check','answer'].forEach(k=>assert(String(ex[k]??'').trim(),`${id}: example ${j+1} missing ${k}`)));assert(Array.isArray(lesson.mistakes)&&lesson.mistakes.length>=3,`${id}: mistakes missing`);tasks(lesson.practice,`${id} practice`,8);tasks(lesson.homework?.required,`${id} homework.required`,6);tasks(lesson.homework?.optional,`${id} homework.optional`,2);assessment(lesson.independent,`${id} independent`,8);assessment(lesson.control,`${id} control`,12);assert(Array.isArray(lesson.summary)&&lesson.summary.length>=3,`${id}: summary missing`);assert(String(lesson.source?.section||'').trim(),`${id}: source section missing`);
});
assert(S.lessons[16].milestone==='Итог темы','lesson 17 milestone missing');

const assessmentBase='assessments/5-math-vilenkin/02';for(const name of ['independent.html','control.html','data.js'])assert(exists(`${assessmentBase}/${name}`),`${assessmentBase}/${name}: missing`);
compile(read(`${assessmentBase}/data.js`),`${assessmentBase}/data.js`);const assessmentContext=vm.createContext({window:{},console});execute(read(`${assessmentBase}/data.js`),assessmentContext,`${assessmentBase}/data.js`);const A=assessmentContext.window.KTP_ASSESSMENT_DATA;assert(A?.meta?.rowId==='5-math-vilenkin',`${assessmentBase}: wrong metadata`);assert(Number(A?.meta?.grade)===5,`${assessmentBase}: wrong grade`);scan(A,assessmentBase);assert(A.topic?.title==='Сложение и вычитание натуральных чисел',`${assessmentBase}: wrong title`);assessment(A.topic.independent,`${assessmentBase} independent`,14);assessment(A.topic.control,`${assessmentBase} control`,20);

compile(read('lessons/topic-links.js'),'lessons/topic-links.js');assert(read('lessons/topic-links.js').includes("1:{count:17"),'lessons/topic-links.js: topic 02 link missing');compile(read('assessments/topic-links.js'),'assessments/topic-links.js');assert(read('assessments/topic-links.js').includes("'5-math-vilenkin':{min:0,max:1}"),'assessments/topic-links.js: topic 02 link missing');

const htmlFiles=[topicHtml,`${lessonBase}/index.html`,...Array.from({length:17},(_,i)=>`${lessonBase}/${String(i+1).padStart(2,'0')}.html`),`${assessmentBase}/independent.html`,`${assessmentBase}/control.html`];
for(const file of htmlFiles){const source=read(file);for(const m of source.matchAll(/(?:href|src)=["']([^"']+)["']/g)){const target=m[1];if(!target||target.startsWith('#')||/^(?:https?:|mailto:|data:|javascript:|\/\/)/.test(target))continue;const clean=target.split(/[?#]/)[0];if(!clean)continue;assert(exists(rel(file,clean)),`${file}: broken static link ${target}`)}}

console.log(`Grade 5 Vilenkin topic 02 QA passed: ${checks} checks, 17 lessons, 204 lesson assessment variants, 2 thematic packs × 6 variants.`);
