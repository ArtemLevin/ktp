import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const assert=(v,m)=>{if(!v)throw new Error(m)};
const firstNumber=(text,re,label)=>{const m=text.match(re);assert(m,`${label}: value not found`);return Number(m[1]);};

const root=read('README.md');
const lessons=read('lessons/README.md');
const assessments=read('assessments/README.md');
const plan=read('Plan.md');
const map=read('content/7-geometry-atanasyan/content-map.md');

assert(root.includes('05` **«Геометрические места точек. Симметрия»**'),'README must publish topic05');
for(const token of ['глава II, §4, пп. 21–23','глава VI, §3, п. 47','глава VIII, пп. 68–69, 72, 74–75'])assert(root.includes(token),`README topic05 source missing ${token}`);
assert(root.includes('Пункты 70–71')&&root.includes('исключены'),'README must record 70–71 exclusion');
assert(root.includes('labs/7-geometry-atanasyan/loci-circle/'),'README must publish topic05 lab');
assert(firstNumber(root,/Суммарно опубликовано \*\*(\d+) полноценных поурочных модулей/,'README lessons')>=910,'README lesson count below 910');
assert(firstNumber(root,/и \*\*(\d+) тематических assessment-комплект/,'README assessments')>=63,'README assessment count below 63');
const rootRow=root.split('\n').find(line=>line.startsWith('| `7-geometry-atanasyan` |'))||'';
const rowMatch=rootRow.match(/\|\s*(\d+)\/6\s*\|\s*(\d+)\/68\s*\|\s*(\d+)\/6\s*\|/);
assert(rowMatch,'README geometry progress row missing');
assert(Number(rowMatch[1])>=5&&Number(rowMatch[2])>=60&&Number(rowMatch[3])>=5,'README geometry progress below topic05');

assert(lessons.includes('05` **«Геометрические места точек. Симметрия»** — уроки 48–60'),'lessons README topic05 missing');
assert(lessons.includes('пп. 68–69, 72, 74–75'),'lessons README distributed source missing');
assert(lessons.includes('loci-circle'),'lessons README lab missing');
assert(firstNumber(lessons,/Всего опубликовано \*\*(\d+) полноценных поурочных модулей/,'lessons README count')>=910,'lessons README count below 910');

assert(assessments.includes('05` **«Геометрические места точек. Симметрия»**'),'assessments README topic05 missing');
assert(assessments.includes('глава VIII, §1, пп. 68–69'),'assessments README source missing');
assert(assessments.includes('Пункты 70–71')&&assessments.includes('не входят'),'assessment docs must exclude 70–71');
assert(firstNumber(assessments,/Всего опубликовано \*\*(\d+) тематических assessment-комплект/,'assessment README count')>=63,'assessment README count below 63');

assert(plan.includes('Тема 05 — «Геометрические места точек. Симметрия»'),'Plan topic05 missing');
assert(plan.includes('**Статус: полностью готово.**'),'Plan must mark completed topics');
assert(plan.includes('Уроки **48–60**'),'Plan topic05 lesson range missing');
for(const token of ['глава II, §4, пп. 21–23','глава VI, §3, п. 47','глава VIII, §1, пп. 68–69','глава VIII, §3, п. 72','глава VIII, §4, пп. 74–75'])assert(plan.includes(token),`Plan topic05 source missing ${token}`);
assert(plan.includes('Тема 06 — «Повторение»')&&plan.includes('**Следующая рабочая единица.**'),'Plan must hand off to topic06');

const mapRow=map.split('\n').find(line=>line.startsWith('| 05 | Геометрические места точек. Симметрия |'))||'';
assert(mapRow.includes('04.03–22.04.2027')&&mapRow.includes('48–60'),'content map topic05 period/range');
assert(mapRow.includes('пп. 68–69, 72, 74–75'),'content map topic05 source range');
assert(mapRow.includes('**full**'),'content map topic05 must be full');
assert(map.includes('Пункты 70–71')&&map.includes('не входят'),'content map must exclude 70–71');
assert(map.includes('loci-circle'),'content map must document topic05 lab');

console.log('Grade 7 geometry topic 05 documentation QA passed: 5/6 series, 60/68 lessons, 63 assessments, distributed source map and lab documented.');
