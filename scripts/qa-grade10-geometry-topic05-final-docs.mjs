import fs from 'node:fs';

const read=file=>fs.readFileSync(file,'utf8');
let checks=0;
const assert=(value,message)=>{checks++;if(!value)throw new Error(message)};
const R=read('README.md'),P=read('Plan.md'),L=read('lessons/README.md'),A=read('assessments/README.md'),M=read('content/10-geometry-atanasyan/content-map.md');
const row=(text,id)=>text.split('\n').find(line=>line.startsWith(`| \`${id}\` |`))?.replaceAll('**','')||'';
const metric=(text,re,label)=>{
  const m=text.match(re);
  assert(Boolean(m),`${label}: missing`);
  return Number(m[1]);
};

assert(/\| 5\/5 \| 68\/68 \| 5\/5 \|/.test(row(R,'10-geometry-atanasyan')),'README line 5/5');
assert(/\| 5\/5 \| 68\/68 \| 5\/5 \|/.test(row(P,'10-geometry-atanasyan')),'Plan line 5/5');
assert(/\| 5\/5 \| 68\/68 \| 1–68 \|/.test(row(L,'10-geometry-atanasyan')),'lessons line 68/68');
assert(/\| 5\/5 \|/.test(row(A,'10-geometry-atanasyan')),'assessment line 5/5');
for(const [text,re,expected,label] of [
  [R,/Суммарно опубликовано \*\*(\d+) полноценных/,1154,'README lessons'],
  [R,/и \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,83,'README assessments'],
  [P,/тематических серий: \*\*(\d+)\*\*/,83,'Plan series'],
  [P,/опубликованных уроков: \*\*(\d+)\*\*/,1154,'Plan lessons'],
  [P,/assessment-комплектов: \*\*(\d+)\*\*/,83,'Plan assessments'],
  [L,/Всего опубликовано \*\*(\d+) полноценных/,1154,'lessons total'],
  [A,/Всего опубликовано \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,83,'assessment total']
]) assert(metric(text,re,label)===expected,`${label}: expected ${expected}`);

for(const text of [R,P,L,A])
  for(const token of ['10-geometry-atanasyan','Повторение'])assert(text.includes(token),'course/topic missing in docs');
for(const token of ['Тема 05 **«Повторение»**','spatial-router/','68/68'])assert(R.includes(token),'README '+token);
assert(P.includes('Тема 05 **«Повторение»**'),'Plan topic 05');
for(const token of ['qa-grade10-geometry-topic05-final.mjs','01–05'])
  assert(A.includes(token),'assessments README '+token);
assert(L.includes('Ретест')||L.includes('ретеста'),'lesson 68 retest documented');
assert(!P.includes('`10-geometry-atanasyan/05` — реализовать'),'Plan contains stale next action');
const topic=M.split('\n').find(line=>line.includes('| 05 | Повторение |'));
assert(topic?.endsWith('| full |'),'content map topic05 full');

console.log('Grade 10 Atanasyan topic 05 FINAL documentation QA passed: '+checks+' checks.');
