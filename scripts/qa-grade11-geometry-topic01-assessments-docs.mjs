import {grade11GeometryProgress} from './grade11-geometry-progress.mjs';
const progress=grade11GeometryProgress();
import fs from 'node:fs';

const read=file=>fs.readFileSync(file,'utf8');
let checks=0;
const assert=(value,message)=>{checks++;if(!value)throw new Error(message);};
const row=(text,id)=>text.split('\n').find(line=>line.startsWith('| \`'+id+'\` |'))?.replaceAll('**','')||'';
const metric=(text,re,label)=>{
 const m=text.match(re);
 assert(Boolean(m),label+': missing');
 return Number(m[1]);
};

const R=read('README.md');
const P=read('Plan.md');
const L=read('lessons/README.md');
const A=read('assessments/README.md');
const B=read('content/11-geometry-atanasyan/01-methodical-plan.md');
const T=read('assessments/topic-links.js');

assert(row(R,'11-geometry-atanasyan').includes(progress.row+' в работе |'),'README grade11 row');
assert(row(P,'11-geometry-atanasyan').includes(progress.row+' в работе |'),'Plan grade11 row');
assert(row(L,'11-geometry-atanasyan').includes(progress.lessonRow+' в работе |'),'lessons grade11 row');
assert(row(A,'11-geometry-atanasyan').includes('| '+progress.assessmentSeries+'/6 | в работе |'),'assessments grade11 row');

for(const [text,re,expected,label] of [
 [R,/Суммарно опубликовано \*\*(\d+) полноценных/,progress.totalLessons,'README lessons'],
 [R,/и \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,progress.totalAssessments,'README assessments'],
 [R,/Сейчас опубликован(?:о)? \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,progress.totalAssessments,'README current assessments'],
 [P,/полностью готовых тематических серий: \*\*(\d+)\*\*/,progress.totalAssessments,'Plan series'],
 [P,/опубликованных уроков: \*\*(\d+)\*\*/,progress.totalLessons,'Plan lessons'],
 [P,/assessment-комплектов: \*\*(\d+)\*\*/,progress.totalAssessments,'Plan assessments'],
 [P,/оставшихся тематических каркасов: \*\*(\d+)\*\*/,progress.remainingTopics,'Plan skeletons'],
 [L,/Всего опубликовано \*\*(\d+) полноценных/,progress.totalLessons,'lessons total'],
 [A,/Всего опубликовано \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,progress.totalAssessments,'assessment total']
])assert(metric(text,re,label)===expected,label+': expected '+expected);

for(const text of [R,P,L,A]){
 assert(text.includes('11-geometry-atanasyan'),'grade11 line mentioned');
 assert(text.includes('Цилиндр, конус, шар'),'topic title documented');
}
for(const token of ['6×7 / 14','6×10 / 20'])assert(A.includes(token),'assessment README '+token);
for(const token of ['серии 03','47*–51*','внешняя площадь составных тел'])assert(A.includes(token),'assessment boundary '+token);
assert(T.includes(`'11-geometry-atanasyan':{min:0,max:${progress.assessmentSeries-1}}`),'topic-links covers published grade 11 topics');
assert(B.includes('этапы 1–3 завершены'),'blueprint stage status');
assert(!B.includes('**Статус:** этап 1 —'),'stale blueprint status removed');
assert(!R.includes('тематические контрольные комплекты запланированы на следующий этап'),'README stale next-stage text removed');
assert(!P.includes('тематические проверочные комплекты готовятся следующим этапом'),'Plan stale assessment text removed');
assert(P.includes('серия 04 **«Векторы в пространстве»**, уроки **33–44**'),'Plan advances next work unit to topic04');

console.log('Grade 11 geometry topic 01 thematic assessment documentation QA passed: '+checks+' checks.');
