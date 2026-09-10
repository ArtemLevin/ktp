import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const assert=(v,m)=>{if(!v)throw new Error(m)};
const firstNumber=(text,re,label)=>{const m=text.match(re);assert(m,`${label}: value not found`);return Number(m[1]);};

const root=read('README.md');
const lessons=read('lessons/README.md');
const assessments=read('assessments/README.md');
const plan=read('Plan.md');
const map=read('content/7-geometry-atanasyan/content-map.md');

assert(root.includes('05` **«Геометрические места точек. Симметрия»**'),'README must retain topic05');
for(const token of ['глава II, §4, пп. 21–23','глава VI, §3, п. 47','глава VIII, пп. 68–69, 72, 74–75'])assert(root.includes(token),`README topic05 source missing ${token}`);
assert(root.includes('labs/7-geometry-atanasyan/loci-circle/'),'README must retain topic05 lab');
assert(firstNumber(root,/Суммарно опубликовано \*\*(\d+) полноценных поурочных модулей/,'README lessons')>=910,'README lesson count regressed below 910');
assert(firstNumber(root,/и \*\*(\d+) тематических assessment-комплект/,'README assessments')>=63,'README assessment count regressed below 63');
const rootRow=root.split('\n').find(line=>line.startsWith('| `7-geometry-atanasyan` |'))||'';
const rowMatch=rootRow.match(/\|\s*(\d+)\/6\s*\|\s*(\d+)\/68\s*\|\s*(\d+)\/6\s*\|/);
assert(rowMatch,'README geometry progress row missing');
assert(Number(rowMatch[1])>=5&&Number(rowMatch[2])>=60&&Number(rowMatch[3])>=5,'README geometry progress regressed below topic05');

assert(lessons.includes('05` **«Геометрические места точек. Симметрия»** — уроки 48–60'),'lessons README topic05 missing');
assert(lessons.includes('пп. 68–69, 72, 74–75'),'lessons README distributed source missing');
assert(firstNumber(lessons,/Всего опубликовано \*\*(\d+) полноценных поурочных модулей/,'lessons README count')>=910,'lessons README count regressed below 910');

assert(assessments.includes('05` **«Геометрические места точек. Симметрия»**'),'assessments README topic05 missing');
assert(assessments.includes('глава VIII, §1, пп. 68–69'),'assessments README source missing');
assert(firstNumber(assessments,/Всего опубликовано \*\*(\d+) тематических assessment-комплект/,'assessment README count')>=63,'assessment README count regressed below 63');

const start=plan.indexOf('### Тема 05 — «Геометрические места точек. Симметрия»');
const end=plan.indexOf('### Тема 06 —',start+1);
const section=start>=0?plan.slice(start,end>=0?end:undefined):'';
assert(section.includes('**Полностью готово.**')||section.includes('**Статус: полностью готово.**'),'Plan must retain topic05 as complete');
assert(section.includes('Уроки 48–60')||section.includes('Уроки **48–60**'),'Plan topic05 lesson range missing');
for(const token of ['гл. II §4 пп. 21–23','гл. VI §3 п. 47','гл. VIII пп. 68–69, 72, 74–75'])assert(section.includes(token),`Plan topic05 source missing ${token}`);

const mapRow=map.split('\n').find(line=>line.startsWith('| 05 | Геометрические места точек. Симметрия |'))||'';
assert(mapRow.includes('04.03–22.04.2027')&&mapRow.includes('48–60'),'content map topic05 period/range');
assert(mapRow.includes('пп. 68–69, 72, 74–75'),'content map topic05 source range');
assert(mapRow.includes('**full**'),'content map topic05 must remain full');
assert(map.includes('Пункты 70–71')&&map.includes('не входят'),'content map must retain 70–71 exclusion');
assert(map.includes('loci-circle'),'content map must retain topic05 lab');

console.log('Grade 7 geometry topic 05 documentation regression QA passed.');
