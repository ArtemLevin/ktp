import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const assert=(v,m)=>{checks++;if(!v)throw new Error(m);};

const plan=read('content/10-geometry-atanasyan/05-methodical-plan.md');
const lessonPlan=read('lessons/10-geometry-atanasyan/lesson-plan.md');
const map=read('content/10-geometry-atanasyan/content-map.md');

for(const token of [
  '10-geometry-atanasyan',
  'Topic index:',
  'Уроки:** 61–68',
  '26.04–20.05.2027',
  'Позиция:** 5/5',
  'Предыдущая тема:** «Многогранники»',
  'Следующий этап:** геометрия 11 класса',
  'Введение',
  'Глава I',
  'Глава II',
  'Глава III',
  'пп. 74–76, 79–80',
  'пп. 25*–26*',
  'п. 31*',
  'spatial-router/',
  'Этап 1 · Blueprint — выполнен',
  'Этап 2 · Topic core',
  'Этап 3 · Уроки 61–64',
  'Этап 4 · Уроки 65–68 + router',
  'Этап 5 · Assessments + closure всей линии',
  'https://media.prosv.ru/content/item/16055/',
  'https://edsoo.ru/wp-content/uploads/2025/07/2025_soo_frp_matematika_10_11_baz.pdf'
]) assert(plan.includes(token),'methodical plan missing: '+token);

for(const code of ['READ','REL','COND','PLANE','PROJ','SECTION','METRIC','SURFACE','VOLUME','LOGIC','CHECK']){
  assert(plan.includes(code),'diagnostic code missing: '+code);
}

for(const token of [
  'V_{\\text{прямоугольный параллелепипед}}=abc',
  'V_{\\text{призма}}=S_{\\text{осн}}h',
  'V_{\\text{пирамида}}=\\frac13S_{\\text{осн}}h',
  'k^2',
  'k^3',
  'N_v-N_e+N_f=2'
]) assert(plan.includes(token),'math invariant missing: '+token);

for(const forbiddenBoundary of [
  'цилиндр, конус, сферу/шар',
  'интегральный вывод объёмов',
  'векторы и координаты в пространстве',
  'Никаких новых формул 11 класса'
]) assert(plan.includes(forbiddenBoundary),'future-course guard missing: '+forbiddenBoundary);

assert(!/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(plan),'methodical plan contains control characters');

const expected=[
  'Объёмы многогранников: систематизация.',
  'Практико-ориентированные задачи на объём.',
  'Сечения: итоговый маршрут построения.',
  'Параллельность и перпендикулярность: карта признаков.',
  'Расстояния и углы в пространстве.',
  'Комплексная задача на многогранник.',
  'Итоговая комплексная диагностика 10 класса.',
  'Адресная коррекция и мост в 11 класс.'
];

const topic05=lessonPlan.split('\n').filter(x=>/^(6[1-8])\./.test(x));
assert(topic05.length===8,'expected 8 lesson-plan entries, got '+topic05.length);
for(let i=0;i<8;i++){
  assert(topic05[i].startsWith(String(61+i)+'.'),'lesson-plan numbering gap at '+(61+i));
  assert(topic05[i].includes(expected[i]),'lesson '+(61+i)+' title mismatch');
}

const planLessons=[...plan.matchAll(/^### Урок (6[1-8]) · (.+)$/gm)];
assert(planLessons.length===8,'methodical plan must detail all 8 lessons');
for(let i=0;i<8;i++){
  assert(Number(planLessons[i][1])===61+i,'methodical lesson numbering '+(61+i));
}

const routerSection=plan.slice(plan.indexOf('### Сценарии'),plan.indexOf('### Interaction'));
for(const token of [
  'параллельные / пересекающиеся / скрещивающиеся прямые',
  'прямая и плоскость',
  'признак прямой, перпендикулярной плоскости',
  'расстояние от точки до плоскости',
  'теорема о трёх перпендикулярах',
  'угол прямой с плоскостью',
  'двугранный угол',
  'сечение многогранника',
  'поверхность или объём',
  'подобные многогранники'
]) assert(routerSection.includes(token),'router scenario missing: '+token);
assert((routerSection.match(/^\d+\./gm)||[]).length===10,'router must contain exactly 10 planned scenarios');

for(const token of [
  'Самостоятельная · 6×7 / 14',
  'Контрольная · 6×10 / 20',
  '6+6 на каждом уроке',
  'mobile 390 px',
  'keyboard',
  'print'
]) assert(plan.includes(token),'release requirement missing: '+token);

const row05=map.split('\n').find(x=>x.includes('| 05 | Повторение |'));
assert(row05,'topic 05 content-map row missing');
assert(row05.includes('61–68'),'topic 05 lesson bounds');
assert(row05.includes('Введения, гл. I–III'),'topic 05 integration source');
assert(row05.includes('74–76, 79–80'),'topic 05 volume transfer source');
assert(/\|\s*(foundation|full)\s*\|$/.test(row05),'topic 05 status must be foundation or full');

const row04=map.split('\n').find(x=>x.includes('| 04 | Многогранники |'));
assert(row04&&row04.endsWith('| full |'),'topic 04 must remain full');

assert(exists('content/10-geometry-atanasyan/04.js'),'topic 04 regression prerequisite');
assert(exists('assessments/10-geometry-atanasyan/04/data.js'),'topic 04 assessment regression prerequisite');

console.log('Grade 10 Atanasyan topic 05 planning QA passed: '+checks+' checks.');
