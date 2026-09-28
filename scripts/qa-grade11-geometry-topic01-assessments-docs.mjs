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

assert(/\| 1\/6 \| 11\/68 \| 1\/6 \| в работе \|/.test(row(R,'11-geometry-atanasyan')),'README grade11 row');
assert(/\| 1\/6 \| 11\/68 \| 1\/6 \| в работе \|/.test(row(P,'11-geometry-atanasyan')),'Plan grade11 row');
assert(/\| 1\/6 \| 11\/68 \| 1–11 \| в работе \|/.test(row(L,'11-geometry-atanasyan')),'lessons grade11 row');
assert(/\| 1\/6 \| в работе \|/.test(row(A,'11-geometry-atanasyan')),'assessments grade11 row');

for(const [text,re,expected,label] of [
 [R,/Суммарно опубликовано \*\*(\d+) полноценных/,1133,'README lessons'],
 [R,/и \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,82,'README assessments'],
 [R,/Сейчас опубликован(?:о)? \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,82,'README current assessments'],
 [P,/полностью готовых тематических серий: \*\*(\d+)\*\*/,82,'Plan series'],
 [P,/опубликованных уроков: \*\*(\d+)\*\*/,1133,'Plan lessons'],
 [P,/assessment-комплектов: \*\*(\d+)\*\*/,82,'Plan assessments'],
 [P,/оставшихся тематических каркасов: \*\*(\d+)\*\*/,39,'Plan skeletons'],
 [L,/Всего опубликовано \*\*(\d+) полноценных/,1133,'lessons total'],
 [A,/Всего опубликовано \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,82,'assessment total']
])assert(metric(text,re,label)===expected,label+': expected '+expected);

for(const text of [R,P,L,A]){
 assert(text.includes('11-geometry-atanasyan'),'grade11 line mentioned');
 assert(text.includes('Цилиндр, конус, шар'),'topic title documented');
}
for(const token of ['6×7 / 14','6×10 / 20'])assert(A.includes(token),'assessment README '+token);
for(const token of ['серии 03','47*–51*','внешняя площадь составных тел'])assert(A.includes(token),'assessment boundary '+token);
assert(T.includes("'11-geometry-atanasyan':{min:0,max:0}"),'topic-links limits grade11 to topic01');
assert(B.includes('этапы 1–3 завершены'),'blueprint stage status');
assert(!B.includes('**Статус:** этап 1 —'),'stale blueprint status removed');
assert(!R.includes('тематические контрольные комплекты запланированы на следующий этап'),'README stale next-stage text removed');
assert(!P.includes('тематические проверочные комплекты готовятся следующим этапом'),'Plan stale assessment text removed');
assert(P.includes('серия 02 **«Объёмы многогранников»**, уроки **12–21**'),'Plan advances next work unit');

console.log('Grade 11 geometry topic 01 thematic assessment documentation QA passed: '+checks+' checks.');
