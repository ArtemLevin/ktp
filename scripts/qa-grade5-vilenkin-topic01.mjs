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
'Входная диагностика: числовая информация и вычислительная готовность','Числовая информация в таблицах: строки, столбцы, чтение данных','Разряды и классы десятичной записи','Чтение и запись многозначных натуральных чисел','Натуральный ряд и число 0','Отрезок и измерение длины','Единицы длины и преобразование величин','Ломаная, длина ломаной и периметр многоугольника','Плоскость, прямая и луч','Угол как геометрическая фигура','Шкала и цена деления','Координатная прямая','Координаты точек и расстояние на числовой прямой','Сравнение натуральных чисел','Упорядочивание чисел и двойные неравенства','Округление натуральных чисел','Столбчатые диаграммы: чтение и сравнение данных','Обобщение темы «Натуральные числа» и мини-диагностика'];

const topicHtml='topics/5-math-vilenkin/01.html',contentFile='content/5-math-vilenkin/01.js';
assert(exists(topicHtml),`${topicHtml}: missing`);assert(exists(contentFile),`${contentFile}: missing`);
const topicSource=read(topicHtml);assert(/<meta\s+name=["']viewport["']/i.test(topicSource),`${topicHtml}: viewport missing`);
for(const token of ['../../content/registry.js','../../content/5-math-vilenkin/01.js','../../assessments/topic-links.js','../../lessons/topic-links.js'])assert(topicSource.includes(token),`${topicHtml}: missing ${token}`);
let registered=null;const contentContext=vm.createContext({KTP_REGISTER_CONTENT:(id,data)=>{registered={id,data}},window:{},console});
compile(read(contentFile),contentFile);execute(read(contentFile),contentContext,contentFile);assert(registered?.id==='5-math-vilenkin::0',`${contentFile}: wrong id`);scan(registered.data,contentFile);
const content=registered.data;
assert(content.meta?.title==='Натуральные числа',`${contentFile}: wrong title`);assert(Array.isArray(content.objectives)&&content.objectives.length>=4,`${contentFile}: objectives`);assert(Array.isArray(content.expectedResults)&&content.expectedResults.length>=6,`${contentFile}: expectedResults`);assert(Array.isArray(content.theory)&&content.theory.length>=8,`${contentFile}: theory too short`);assert(Array.isArray(content.examples)&&content.examples.length>=5,`${contentFile}: examples too short`);content.examples.forEach((ex,i)=>['problem','idea','solution','check','answer'].forEach(k=>assert(String(ex[k]??'').trim(),`${contentFile}: example ${i+1} missing ${k}`)));assert(Array.isArray(content.mistakes)&&content.mistakes.length>=6,`${contentFile}: mistakes too short`);for(const level of ['basic','standard','transfer','challenge'])tasks(content.practice?.[level],`${contentFile} practice.${level}`);tasks(content.diagnostic,`${contentFile} diagnostic`,5);tasks(content.homework?.required,`${contentFile} homework.required`,6);tasks(content.homework?.optional,`${contentFile} homework.optional`,2);assert(Array.isArray(content.summary)&&content.summary.length>=8,`${contentFile}: summary too short`);assert(content.lab?.enabled===true,`${contentFile}: lab disabled`);
const labTarget=rel(topicHtml,String(content.lab.href).split(/[?#]/)[0]);assert(exists(labTarget),`${contentFile}: lab target missing ${labTarget}`);
assert(String(content.source?.textbook||'').includes('Виленкин'),`${contentFile}: textbook source missing`);assert((content.source?.paragraphs||[]).some(x=>String(x).includes('пункты 1–7')),`${contentFile}: textbook range missing`);assert((content.source?.paragraphs||[]).some(x=>String(x).includes('федераль')),`${contentFile}: FWP rounding note missing`);

const lessonBase='lessons/5-math-vilenkin/01',seriesFile=`${lessonBase}/series.js`,dataFile=`${lessonBase}/data.js`;
for(const file of [`${lessonBase}/index.html`,seriesFile,dataFile])assert(exists(file),`${file}: missing`);
compile(read(seriesFile),seriesFile);compile(read(dataFile),dataFile);
const lessonContext=vm.createContext({window:{},console});execute(read(seriesFile),lessonContext,seriesFile);execute(read(dataFile),lessonContext,dataFile);
const S=lessonContext.window.KTP_LESSON_SERIES;assert(S,`${lessonBase}: series missing`);scan(S,lessonBase);
assert(S.meta?.rowId==='5-math-vilenkin',`${lessonBase}: wrong row`);assert(Number(S.meta?.topicIndex)===0,`${lessonBase}: wrong topic index`);assert(Number(S.meta?.totalLessons)===18,`${lessonBase}: wrong totalLessons`);assert(Number(S.meta?.courseTotal)===170,`${lessonBase}: wrong courseTotal`);assert(Array.isArray(S.lessons)&&S.lessons.length===18,`${lessonBase}: expected 18 lessons`);
S.lessons.forEach((lesson,i)=>{
 const id=String(i+1).padStart(2,'0'),html=`${lessonBase}/${id}.html`;assert(exists(html),`${html}: missing`);const h=read(html);assert(/<meta\s+name=["']viewport["']/i.test(h),`${html}: viewport missing`);for(const token of ['series.js','data.js','../../lesson-page.js'])assert(h.includes(token),`${html}: missing ${token}`);
 assert(String(lesson.id)===id,`${id}: wrong lesson id`);assert(Number(lesson.number)===i+1,`${id}: wrong lesson number`);assert(Number(lesson.globalNumber)===i+1,`${id}: wrong global number`);assert(lesson.title===expectedTitles[i],`${id}: title mismatch`);assert(Number(lesson.week)===Math.min(4,Math.floor(i/5)+1),`${id}: wrong week`);assert(Array.isArray(lesson.objectives)&&lesson.objectives.length>=2,`${id}: objectives missing`);assert(Array.isArray(lesson.prerequisites)&&lesson.prerequisites.length>=1,`${id}: prerequisites missing`);assert(Array.isArray(lesson.theory)&&lesson.theory.length>=2,`${id}: theory missing`);assert(Array.isArray(lesson.examples)&&lesson.examples.length>=2,`${id}: examples missing`);lesson.examples.forEach((ex,j)=>['problem','idea','solution','check','answer'].forEach(k=>assert(String(ex[k]??'').trim(),`${id}: example ${j+1} missing ${k}`)));assert(Array.isArray(lesson.mistakes)&&lesson.mistakes.length>=3,`${id}: mistakes missing`);tasks(lesson.practice,`${id} practice`,8);tasks(lesson.homework?.required,`${id} homework.required`,6);tasks(lesson.homework?.optional,`${id} homework.optional`,2);assessment(lesson.independent,`${id} independent`,8);assessment(lesson.control,`${id} control`,12);assert(Array.isArray(lesson.summary)&&lesson.summary.length>=3,`${id}: summary missing`);assert(String(lesson.source?.section||'').trim(),`${id}: source section missing`);
});
assert(S.lessons[0].milestone==='Входная диагностика','lesson 01 milestone missing');assert(S.lessons[17].milestone==='Итог темы','lesson 18 milestone missing');

const assessmentBase='assessments/5-math-vilenkin/01';for(const name of ['independent.html','control.html','data.js'])assert(exists(`${assessmentBase}/${name}`),`${assessmentBase}/${name}: missing`);
compile(read(`${assessmentBase}/data.js`),`${assessmentBase}/data.js`);const assessmentContext=vm.createContext({window:{},console});execute(read(`${assessmentBase}/data.js`),assessmentContext,`${assessmentBase}/data.js`);const A=assessmentContext.window.KTP_ASSESSMENT_DATA;assert(A?.meta?.rowId==='5-math-vilenkin',`${assessmentBase}: wrong metadata`);scan(A,assessmentBase);assert(A.topic?.title==='Натуральные числа',`${assessmentBase}: wrong title`);assessment(A.topic.independent,`${assessmentBase} independent`,14);assessment(A.topic.control,`${assessmentBase} control`,20);

for(const file of ['lessons/topic-links.js','assessments/topic-links.js']){compile(read(file),file);assert(read(file).includes("'5-math-vilenkin'"),`${file}: grade 5 row link missing`)}
for(const file of ['labs/5-math-vilenkin/number-line/index.html','labs/5-math-vilenkin/number-line/app.js','labs/5-math-vilenkin/common.css'])assert(exists(file),`${file}: missing`);compile(read('labs/5-math-vilenkin/number-line/app.js'),'labs/5-math-vilenkin/number-line/app.js');assert(/<meta\s+name=["']viewport["']/i.test(read('labs/5-math-vilenkin/number-line/index.html')),'lab: viewport missing');assert(/@media\s*\([^)]*max-width/i.test(read('labs/5-math-vilenkin/common.css')),'lab: responsive CSS missing');assert(/@media\s+print/i.test(read('labs/5-math-vilenkin/common.css')),'lab: print CSS missing');

const htmlFiles=[topicHtml,`${lessonBase}/index.html`,...Array.from({length:18},(_,i)=>`${lessonBase}/${String(i+1).padStart(2,'0')}.html`),`${assessmentBase}/independent.html`,`${assessmentBase}/control.html`,'labs/5-math-vilenkin/number-line/index.html'];
for(const file of htmlFiles){const source=read(file);for(const m of source.matchAll(/(?:href|src)=["']([^"']+)["']/g)){const target=m[1];if(!target||target.startsWith('#')||/^(?:https?:|mailto:|data:|javascript:|\/\/)/.test(target))continue;const clean=target.split(/[?#]/)[0];if(!clean)continue;assert(exists(rel(file,clean)),`${file}: broken static link ${target}`)}}

console.log(`Grade 5 Vilenkin topic 01 QA passed: ${checks} checks, 18 lessons, 216 lesson assessment variants, 2 thematic packs × 6 variants, 1 digital lab.`);
