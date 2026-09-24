import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const assert=(value,message)=>{checks++;if(!value)throw new Error(message);};
const metric=(text,label)=>{
  const i=text.indexOf(label);if(i<0)return NaN;
  const m=text.slice(i,i+180).match(/\*\*(\d+)\*\*/)||text.slice(i,i+180).match(/(\d+)/);
  return m?Number(m[1]):NaN;
};

const readme=read('README.md');
assert(metric(readme,'Суммарно опубликовано')>=1058,'README lesson aggregate must not regress');
assert(readme.match(/(?:77|78|79|8\d|9\d|1\d\d) тематических assessment-комплект/),'README assessment aggregate must not regress');
for(const token of [
  '10-geometry-atanasyan',
  'content/10-geometry-atanasyan/methodical-plan.md',
  'content/10-geometry-atanasyan/01-methodical-plan.md',
  'Тема 01'
]) assert(readme.includes(token),`README missing ${token}`);

const plan=read('Plan.md');
assert(metric(plan,'полностью готовых тематических серий:')>=77,'Plan series metric must not regress');
assert(metric(plan,'опубликованных уроков:')>=1058,'Plan lesson metric must not regress');
assert(metric(plan,'тематических assessment-комплектов:')>=77,'Plan assessment metric must not regress');
for(const token of ['10-geometry-atanasyan','Тема 01 **«Повторение»** полностью реализована','01-methodical-plan.md'])assert(plan.includes(token),`Plan missing ${token}`);

const lessons=read('lessons/README.md');
assert(lessons.includes('10-geometry-atanasyan'),'lessons grade10 row missing');
assert(metric(lessons,'Всего опубликовано')>=1058,'lessons aggregate must not regress');
for(const token of ['lesson-spatial.js','spatial-scene.js','серия `01` **«повторение»**'])assert(lessons.toLowerCase().includes(token.toLowerCase()),`lessons README missing ${token}`);

const assessments=read('assessments/README.md');
assert(assessments.includes('10-geometry-atanasyan'),'assessment grade10 row missing');
assert(metric(assessments,'Всего опубликовано')>=77,'assessment aggregate must not regress');
for(const token of ['комплект `01`','6×7 / 14 баллов','6×10 / 20 баллов'])assert(assessments.toLowerCase().includes(token.toLowerCase()),`assessments README missing ${token}`);

const map=read('content/10-geometry-atanasyan/content-map.md');
const row=map.split('\n').find(x=>x.includes('| 01 | Повторение |'));
assert(row&&row.endsWith('| full |'),'content map topic 01 must stay full');

console.log(`Grade 10 Atanasyan topic 01 documentation QA passed: ${checks} checks.`);
