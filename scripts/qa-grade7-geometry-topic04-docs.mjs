import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const assert=(v,m)=>{if(!v)throw new Error(m)};
const firstNumber=(text,re,label)=>{const m=text.match(re);assert(m,`${label}: value not found`);return Number(m[1]);};

const root=read('README.md');
const lessons=read('lessons/README.md');
const assessments=read('assessments/README.md');
const plan=read('Plan.md');
const map=read('content/7-geometry-atanasyan/content-map.md');

assert(root.includes('04` **«Соотношения между сторонами и углами треугольника»**'),'README must retain topic04');
assert(root.includes('глава IV, §§1–4, пп. 30–38'),'README topic04 source range missing');
assert(firstNumber(root,/Суммарно опубликовано \*\*(\d+) полноценных поурочных модулей/,'README lessons')>=897,'README lesson count regressed below 897');
assert(firstNumber(root,/и \*\*(\d+) тематических assessment-комплект/,'README assessments')>=62,'README assessment count regressed below 62');

const rootRow=root.split('\n').find(line=>line.startsWith('| `7-geometry-atanasyan` |'))||'';
const rowMatch=rootRow.match(/\|\s*(\d+)\/6\s*\|\s*(\d+)\/68\s*\|\s*(\d+)\/6\s*\|/);
assert(rowMatch,'README geometry progress row missing');
assert(Number(rowMatch[1])>=4&&Number(rowMatch[2])>=47&&Number(rowMatch[3])>=4,'README geometry progress regressed below topic04');

assert(lessons.includes('04` **«Соотношения между сторонами и углами треугольника»**'),'lessons README must retain topic04');
assert(lessons.includes('уроки 35–47'),'lessons README topic04 numbering missing');
assert(firstNumber(lessons,/Всего опубликовано \*\*(\d+) полноценных поурочных модулей/,'lessons README count')>=897,'lessons README count regressed below 897');

assert(assessments.includes('04` **«Соотношения между сторонами и углами треугольника»**'),'assessments README must retain topic04');
assert(assessments.includes('глава IV, §§1–4, пп. 30–38'),'assessments README topic04 source range missing');
assert(firstNumber(assessments,/Всего опубликовано \*\*(\d+) тематических assessment-комплект/,'assessments README count')>=62,'assessment docs count regressed below 62');

const start=plan.indexOf('### Тема 04 — «Соотношения между сторонами и углами треугольника»');
const end=plan.indexOf('### Тема 05 —',start+1);
const section=start>=0?plan.slice(start,end>=0?end:undefined):'';
assert(section.includes('**Полностью готово.**')||section.includes('**Статус: полностью готово.**'),'Plan must retain topic04 as complete');
assert(section.toLowerCase().includes('уроки 35–47'),'Plan topic04 lesson range missing');
assert(section.includes('глава IV, §§1–4, пп. 30–38'),'Plan topic04 source range missing');

const mapRow=map.split('\n').find(line=>line.startsWith('| 04 | Соотношения между сторонами и углами треугольника |'))||'';
assert(mapRow.includes('18.01–01.03.2027'),'content map topic04 period drift');
assert(mapRow.includes('35–47'),'content map topic04 lesson range drift');
assert(mapRow.includes('Гл. IV, §§1–4, пп. 30–38'),'content map topic04 source drift');
assert(mapRow.includes('**full**'),'content map topic04 must remain full');
assert(map.includes('п. 36\\*')||map.includes('п. 36*'),'content map must retain optional status of point 36*');

console.log('Grade 7 geometry topic 04 documentation regression QA passed.');
