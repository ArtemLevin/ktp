import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const assert=(v,m)=>{checks++;if(!v)throw new Error(m);};

const plan=read('content/10-geometry-atanasyan/04-methodical-plan.md');
const lessonPlan=read('lessons/10-geometry-atanasyan/lesson-plan.md');
const map=read('content/10-geometry-atanasyan/content-map.md');

for(const token of [
  'глава III, §§1–3, пп. 27–37',
  'пп. 74–76, 79–80',
  'п. 29* «Теорема Эйлера»',
  'Подобные тела',
  'k^2',
  'k^3',
  'polyhedron-section/',
  'Этап 1',
  'Этап 2',
  'Этап 3',
  'Этап 4',
  'Этап 5',
  'https://media.prosv.ru/content/item/16055/',
  'https://edsoo.ru/wp-content/uploads/2025/07/2025_soo_frp_matematika_10_11_baz.pdf'
]) assert(plan.includes(token),'methodical plan missing: '+token);

for(const token of [
  'V_{\\text{призма}}=S_{\\text{осн}}h',
  'V_{\\text{пирамида}}=\\frac13 S_{\\text{осн}}h',
  'S_{\\text{бок}}=\\frac12 P_{\\text{осн}}l',
  'N_v-N_e+N_f=2'
]) assert(plan.includes(token),'math token missing: '+token);

assert(!/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(plan),'methodical plan contains control characters');

const topic04=lessonPlan.split('\n').filter(x=>/^(4[3-9]|5[0-9]|60)\./.test(x));
assert(topic04.length===18,'expected 18 lesson-plan entries, got '+topic04.length);
for(let i=0;i<18;i++)assert(topic04[i].startsWith(String(43+i)+'.'),'lesson-plan numbering gap at '+(43+i));
assert(topic04.find(x=>x.startsWith('59.'))?.includes('Подобные многогранники'),'lesson 59 must explicitly cover similar polyhedra');
assert(topic04.find(x=>x.startsWith('59.'))?.includes('k²')&&topic04.find(x=>x.startsWith('59.'))?.includes('k³'),'lesson 59 scaling laws');

for(const token of [
  'Подобные тела в пространстве',
  'площади относятся как k²',
  'объёмы — как k³',
  'линейные размеры k, площади k², объёмы k³'
]) assert(map.includes(token),'content map missing: '+token);

const row=map.split('\n').find(x=>x.includes('| 04 | Многогранники |'));
assert(row,'topic 04 row missing');
assert(row.includes('43–60'),'topic 04 bounds');
assert(row.includes('пп. 27–37')&&row.includes('74–76, 79–80'),'topic 04 source boundary');

for(const forbidden of ['п. 77 «Объём цилиндра»','п. 81 «Объём конуса»']){
  assert(plan.includes(forbidden),'plan should explicitly document excluded next-line source');
}

console.log('Grade 10 Atanasyan topic 04 planning QA passed: '+checks+' checks.');
