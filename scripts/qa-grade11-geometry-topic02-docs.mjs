import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let checks=0;
const check=(condition,message)=>{checks++;if(!condition)throw Error(message);};
const row=(text,id)=>text.split('\n').find(line=>line.startsWith('| `'+id+'` |'))?.replaceAll('**','')||'';
const metric=(text,re,label)=>{
  const m=text.match(re);check(Boolean(m),label+' missing');
  return Number(m[1]);
};

const R=read('README.md'),P=read('Plan.md'),L=read('lessons/README.md'),A=read('assessments/README.md');
const M=read('content/11-geometry-atanasyan/content-map.md');
const LP=read('lessons/11-geometry-atanasyan/lesson-plan.md');
const B=read('content/11-geometry-atanasyan/02-methodical-plan.md');
const T=read('assessments/topic-links.js');
const S=read('lessons/11-geometry-atanasyan/02/series.js');

check(/\| 2\/6 \| 21\/68 \| 2\/6 \| в работе \|/.test(row(R,'11-geometry-atanasyan')),'README grade11 row');
check(/\| 2\/6 \| 21\/68 \| 2\/6 \| в работе \|/.test(row(P,'11-geometry-atanasyan')),'Plan grade11 row');
check(/\| 2\/6 \| 21\/68 \| 1–21 \| в работе \|/.test(row(L,'11-geometry-atanasyan')),'lessons grade11 row');
check(/\| 2\/6 \| в работе \|/.test(row(A,'11-geometry-atanasyan')),'assessments grade11 row');

for(const [text,re,expected,label] of [
  [R,/Суммарно опубликовано \*\*(\d+) полноценных/,1143,'README lessons'],
  [R,/и \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,83,'README assessments'],
  [R,/Сейчас опубликован(?:о)? \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,83,'README current assessments'],
  [P,/полностью готовых тематических серий: \*\*(\d+)\*\*/,83,'Plan series'],
  [P,/опубликованных уроков: \*\*(\d+)\*\*/,1143,'Plan lessons'],
  [P,/assessment-комплектов: \*\*(\d+)\*\*/,83,'Plan assessments'],
  [P,/оставшихся тематических каркасов: \*\*(\d+)\*\*/,38,'Plan skeletons'],
  [L,/Всего опубликовано \*\*(\d+) полноценных/,1143,'lessons total'],
  [A,/Всего опубликовано \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,83,'assessment total']
])check(metric(text,re,label)===expected,label+' expected '+expected);

for(const text of [R,P,L,A]){
  check(text.includes('Объёмы многогранников'),'topic02 documented');
}
check(R.includes('volume-transform'),'README lab');
check(L.includes('volume-transform'),'lessons README lab');
check(A.includes('6×7 / 14')&&A.includes('6×10 / 20'),'assessment format documented');
for(const token of ['прямые и наклонные призмы','усечённая пирамида','k → k² → k³'])check(A.includes(token),'assessment coverage '+token);

check(M.includes('опубликованы серии 01–02 — 21/68 уроков и 2/6 тематических assessment-комплектов'),'content map status');
check(M.includes('серия 03 «Объёмы тел вращения», уроки 22–32'),'content map next unit');
check(LP.includes('Пункты 1–21 уже опубликованы'),'lesson plan publication status');
check(P.includes('серия 03 **«Объёмы тел вращения»**, уроки **22–32**'),'Plan next unit');
check(T.includes("'11-geometry-atanasyan':{min:0,max:1}"),'assessment navigation topics 01-02');
check(S.includes("implementationStage:'5/5'"),'series release stage');

for(const token of [
  'серия полностью реализована',
  '10 адресных уроков 12–21',
  'volume-transform',
  '6×7 / 14 + 6×10 / 20',
  'серия 03 «Объёмы тел вращения», уроки 22–32'
])check(B.includes(token),'blueprint final status '+token);
for(const stale of [
  'следующий этап — исследовательская лаборатория',
  'Следующий этап — тематический assessment',
  'assessment пока остаётся'
])check(!B.includes(stale),'blueprint stale text '+stale);

function countFiles(dir,pattern){
  let total=0;
  for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
    const rel=path.join(dir,entry.name);
    if(entry.isDirectory())total+=countFiles(rel,pattern);
    else if(entry.isFile()&&pattern.test(entry.name))total++;
  }
  return total;
}
check(countFiles('lessons',/^\d\d\.html$/)===1143,'1143 addressable lesson pages');
check(countFiles('assessments',/^data\.js$/)===83,'83 thematic assessment data files');

for(const p of [
  'topics/11-geometry-atanasyan/02.html',
  'lessons/11-geometry-atanasyan/02/index.html',
  'labs/11-geometry-atanasyan/volume-transform/index.html',
  'assessments/11-geometry-atanasyan/02/independent.html',
  'assessments/11-geometry-atanasyan/02/control.html'
])check(fs.existsSync(path.join(root,p)),'release route '+p);

console.log('Grade 11 geometry topic 02 documentation/release-state QA passed: '+checks+' checks.');
