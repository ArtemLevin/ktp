import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const assert=(value,message)=>{checks++;if(!value)throw new Error(message);};

const readme=read('README.md');
for(const token of [
  '1058 полноценных поурочных',
  '77 тематических assessment-комплектов',
  '| `10-geometry-atanasyan` | **1/5** | **4/68** | **1/5** | **в работе** |',
  'content/10-geometry-atanasyan/methodical-plan.md',
  'content/10-geometry-atanasyan/01-methodical-plan.md',
  '10-geometry-atanasyan/02'
]) assert(readme.includes(token),`README missing ${token}`);

const plan=read('Plan.md');
for(const token of [
  'полностью готовых тематических серий: **77**',
  'опубликованных уроков: **1058**',
  'тематических assessment-комплектов: **77**',
  'оставшихся тематических каркасов: **44**',
  '1/5 серий, 4/68 уроков, 1/5 thematic assessments',
  '10-geometry-atanasyan/02'
]) assert(plan.includes(token),`Plan missing ${token}`);

const lessons=read('lessons/README.md');
for(const token of [
  '| `10-geometry-atanasyan` | **1/5** | **4/68** | **1–4** | **в работе** |',
  '1058 полноценных поурочных',
  'lesson-spatial.js',
  'spatial-scene.js'
]) assert(lessons.includes(token),`lessons README missing ${token}`);

const assessments=read('assessments/README.md');
for(const token of [
  '| `10-geometry-atanasyan` | **1/5** | **в работе** |',
  '77 тематических assessment-комплектов',
  '6×7 / 14 баллов',
  '6×10 / 20 баллов',
  'только тему **01**'
]) assert(assessments.includes(token),`assessments README missing ${token}`);

const map=read('content/10-geometry-atanasyan/content-map.md');
const row=map.split('\n').find(x=>x.includes('| 01 | Повторение |'));
assert(row&&row.endsWith('| full |'),'content map topic 01 must be full');

console.log(`Grade 10 Atanasyan topic 01 documentation QA passed: ${checks} checks.`);
