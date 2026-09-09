import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const assert=(v,m)=>{if(!v)throw new Error(m)};
const root=read('README.md'),lessons=read('lessons/README.md'),assessments=read('assessments/README.md'),plan=read('Plan.md');
assert(root.includes('7-geometry-atanasyan')&&root.includes('02` **«Треугольники»**')&&root.includes('глава II, §§1–4, пп. 14–23'), 'README must retain completed topic02');
assert(lessons.includes('02` **«Треугольники»** — уроки 13–25'), 'lessons README must retain topic02');
assert(assessments.includes('02` **«Треугольники»**')&&assessments.includes('глава II, §§1–4, пп. 14–23'), 'assessments README must retain topic02');
assert(plan.includes('Тема 02 — «Треугольники»')&&plan.includes('уроки 13–25')&&plan.includes('**Статус: полностью готово.**'), 'Plan must retain topic02 as complete');
console.log('Grade 7 geometry topic 02 documentation regression QA passed.');
