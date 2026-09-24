import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
let checks=0;
const assert=(v,m)=>{checks++;if(!v)throw new Error(m)};

const R=read('README.md'),P=read('Plan.md'),L=read('lessons/README.md'),A=read('assessments/README.md'),M=read('content/10-geometry-atanasyan/content-map.md');

for(const token of [
  '1114 полноценных поурочных',
  '80 тематических assessment-комплектов',
  '**4/5** | **60/68** | **4/5**',
  'Тема 04 **«Многогранники»** полностью реализована',
  '04-methodical-plan.md',
  'polyhedron-section/',
  '10-geometry-atanasyan/05'
]) assert(R.includes(token),'README missing '+token);

for(const token of [
  'тематических серий: **80**',
  'опубликованных уроков: **1114**',
  'assessment-комплектов: **80**',
  'каркасов: **41**',
  '4/5 серий, 60/68 уроков, 4/5 thematic assessments',
  'Тема 04 **«Многогранники»** полностью реализована',
  '10-geometry-atanasyan/05'
]) assert(P.includes(token),'Plan missing '+token);

for(const token of [
  '**4/5** | **60/68** | **1–60**',
  '1114 полноценных поурочных',
  'Серия `04` **«Многогранники»**',
  'polyhedron-section/',
  'Следующая серия: `05`'
]) assert(L.includes(token),'lessons README missing '+token);

for(const token of [
  '**4/5** | **в работе**',
  '80 тематических assessment-комплектов',
  'Комплект `04` **«Многогранники»**',
  '6×7 / 14 баллов',
  '6×10 / 20 баллов',
  'темы **01–04**'
]) assert(A.includes(token),'assessments README missing '+token);

const row=M.split('\n').find(x=>x.includes('| 04 | Многогранники |'));
assert(row&&row.endsWith('| full |'),'content map topic04 full');

console.log('Grade 10 Atanasyan topic 04 FINAL documentation QA passed: '+checks+' checks.');