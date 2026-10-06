import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let checks=0;
const check=(condition,message)=>{checks++;if(!condition)throw Error(message);};
const row=(text,id)=>text.split('\n').find(line=>line.startsWith('| `'+id+'` |'))?.replaceAll('**','')||'';
const metric=(text,re,label)=>{const m=text.match(re);check(Boolean(m),label+' missing');return Number(m[1]);};

const R=read('README.md'),P=read('Plan.md'),L=read('lessons/README.md'),A=read('assessments/README.md');
const M=read('content/11-geometry-atanasyan/content-map.md');
const B=read('content/11-geometry-atanasyan/03-methodical-plan.md');
const T=read('assessments/topic-links.js');
const C=read('content/11-geometry-atanasyan/03.js');

check(/\| 3\/6 \| 32\/68 \| 3\/6 \| в работе \|/.test(row(R,'11-geometry-atanasyan')),'README grade11 row');
check(/\| 3\/6 \| 32\/68 \| 3\/6 \| в работе \|/.test(row(P,'11-geometry-atanasyan')),'Plan grade11 row');
check(/\| 3\/6 \| 32\/68 \| 1–32 \| в работе \|/.test(row(L,'11-geometry-atanasyan')),'lessons grade11 row');
check(/\| 3\/6 \| в работе \|/.test(row(A,'11-geometry-atanasyan')),'assessments grade11 row');

for(const [text,re,expected,label] of [
 [R,/Суммарно опубликовано \*\*(\d+) полноценных/,1154,'README lessons'],
 [R,/и \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,84,'README assessments'],
 [R,/Сейчас опубликован(?:о)? \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,84,'README current assessments'],
 [P,/полностью готовых тематических серий: \*\*(\d+)\*\*/,84,'Plan series'],
 [P,/опубликованных уроков: \*\*(\d+)\*\*/,1154,'Plan lessons'],
 [P,/assessment-комплектов: \*\*(\d+)\*\*/,84,'Plan assessments'],
 [P,/оставшихся тематических каркасов: \*\*(\d+)\*\*/,37,'Plan skeletons'],
 [L,/Всего опубликовано \*\*(\d+) полноценных/,1154,'lessons total'],
 [A,/Всего опубликовано \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,84,'assessment total']
])check(metric(text,re,label)===expected,label+' expected '+expected);

for(const token of [
 'Серия `11-geometry-atanasyan/03` **«Объёмы тел вращения»** завершена',
 '132 поурочных варианта / 726 оцениваемых заданий',
 'тематическая самостоятельная **6×7 / 14**',
 'контрольная **6×10 / 20**',
 'revolution-volume'
])check(R.includes(token),'README topic03 release token '+token);

for(const token of [
 'Опубликован комплект `03` **«Объёмы тел вращения»**',
 'самостоятельная **6×7 / 14 баллов**',
 'контрольная **6×10 / 20 баллов**',
 'Пункт 56 с определённым интегралом не входит в обязательный контроль',
 'темы **01–03**'
])check(A.includes(token),'assessment README topic03 '+token);

check(M.includes('серии 01–03 завершены'),'content map completed series');
check(M.includes('Поурочный слой: 32/68; тематические assessment-комплекты: 3/6'),'content map status');
check(M.includes('серия 04 «Векторы в пространстве», уроки 33–44'),'content map next unit');
check(P.includes('серия 04 **«Векторы в пространстве»**, уроки **33–44**'),'Plan next unit');
check(T.includes("'11-geometry-atanasyan':{min:0,max:2}"),'assessment navigation topics 01-03');

check(B.includes('Этап 5 — thematic assessment и release gate · **реализован**'),'blueprint stage5 implemented');
for(const token of ['12 тематических вариантов / 102 оцениваемых задания','3/6, 32/68, 3/6'])check(B.includes(token),'blueprint final token '+token);
for(const stale of [
 'Thematic assessment серии 03 — следующий',
 'assessment остаётся финальным этапом серии',
 'этап 5 — thematic assessment 6×7/14 + 6×10/20 и финальный release gate'
])check(!R.includes(stale)&&!P.includes(stale)&&!L.includes(stale)&&!M.includes(stale),'stale release text '+stale);

for(const token of [
 "enabled:true",
 "independentHref:'../../assessments/11-geometry-atanasyan/03/independent.html'",
 "controlHref:'../../assessments/11-geometry-atanasyan/03/control.html'"
])check(C.includes(token),'topic assessment wiring '+token);

function countFiles(dir,pattern){
 let total=0;
 for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
   const rel=path.join(dir,entry.name);
   if(entry.isDirectory())total+=countFiles(rel,pattern);
   else if(entry.isFile()&&pattern.test(entry.name))total++;
 }
 return total;
}
check(countFiles('lessons',/^\d\d\.html$/)===1154,'1154 addressable lesson pages');
check(countFiles('assessments',/^data\.js$/)===84,'84 thematic assessment data files');

for(const p of [
 'topics/11-geometry-atanasyan/03.html',
 'lessons/11-geometry-atanasyan/03/index.html',
 'labs/11-geometry-atanasyan/revolution-volume/index.html',
 'assessments/11-geometry-atanasyan/03/independent.html',
 'assessments/11-geometry-atanasyan/03/control.html'
])check(fs.existsSync(path.join(root,p)),'release route '+p);

console.log('Grade 11 geometry topic 03 documentation/release-state QA passed: '+checks+' checks.');