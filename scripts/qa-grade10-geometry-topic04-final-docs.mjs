import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
let checks=0;
const assert=(v,m)=>{checks++;if(!v)throw new Error(m)};
const count=(text,re,label)=>{
  const value=Number(text.match(re)?.[1]);
  assert(Number.isFinite(value),`${label}: count missing`);
  return value;
};
const row=(text,id)=>text.split('\n').find(line=>line.startsWith(`| \`${id}\` |`))?.replaceAll('**','')||'';

const R=read('README.md'),P=read('Plan.md'),L=read('lessons/README.md'),A=read('assessments/README.md'),M=read('content/10-geometry-atanasyan/content-map.md');

// Topic 04 remains published as later topics raise the course totals.
assert(count(R,/Суммарно опубликовано \*\*(\d+) полноценных/,'README lessons')>=1114,'README lesson aggregate regressed');
assert(count(R,/и \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,'README assessments')>=80,'README assessment aggregate regressed');
assert(/\|\s*[45]\/5\s*\|\s*(?:60|68)\/68\s*\|\s*[45]\/5\s*\|/.test(row(R,'10-geometry-atanasyan')),'README grade 10 progress');
for(const token of ['Тема 04 **«Многогранники»** полностью реализована','04-methodical-plan.md','polyhedron-section/','10-geometry-atanasyan/05'])
  assert(R.includes(token),'README missing '+token);

for(const [label,re,min] of [
  ['series',/тематических серий: \*\*(\d+)\*\*/,80],
  ['lessons',/опубликованных уроков: \*\*(\d+)\*\*/,1114],
  ['assessments',/assessment-комплектов: \*\*(\d+)\*\*/,80]
]) assert(count(P,re,`Plan ${label}`)>=min,`Plan ${label} regressed`);
assert(count(P,/оставшихся тематических каркасов: \*\*(\d+)\*\*/,'Plan frames')<=41,'Plan remaining frames increased');
assert(/\|\s*[45]\/5\s*\|\s*(?:60|68)\/68\s*\|\s*[45]\/5\s*\|/.test(row(P,'10-geometry-atanasyan')),'Plan grade 10 progress');
assert(P.includes('Тема 04 **«Многогранники»** полностью реализована')&&P.includes('10-geometry-atanasyan/05'),'Plan topic continuity');

assert(/\|\s*[45]\/5\s*\|\s*(?:60|68)\/68\s*\|\s*(?:1–60|1–68)\s*\|/.test(row(L,'10-geometry-atanasyan')),'lessons README grade 10 progress');
assert(count(L,/Всего опубликовано \*\*(\d+) полноценных/,'lessons README total')>=1114,'lessons aggregate regressed');
assert(L.includes('Серия \`04\` **«Многогранники»**')&&L.includes('polyhedron-section/'),'lessons README topic 04');

assert(/\|\s*[45]\/5\s*\|/.test(row(A,'10-geometry-atanasyan')),'assessments README grade 10 progress');
assert(count(A,/Всего опубликовано \*\*(\d+) тематическ(?:их|ий) assessment-комплект/,'assessments README total')>=80,'assessments aggregate regressed');
for(const token of ['Комплект \`04\` **«Многогранники»**','6×7 / 14 баллов','6×10 / 20 баллов'])
  assert(A.includes(token),'assessments README missing '+token);

const mapRow=M.split('\n').find(line=>line.includes('| 04 | Многогранники |'));
assert(mapRow?.endsWith('| full |'),'content map topic 04 full');

console.log('Grade 10 Atanasyan topic 04 FINAL documentation QA passed: '+checks+' checks.');
