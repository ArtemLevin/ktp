import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const assert=(value,message)=>{checks++;if(!value)throw new Error(message);};

for(const p of [
  'content/10-geometry-atanasyan/content-map.md',
  'lessons/10-geometry-atanasyan/lesson-plan.md',
  'geometry/SPATIAL_RENDERING.md',
  'geometry/spatial-scene.js',
  'geometry/spatial-scene.css',
  'geometry/lesson-spatial.js',
  'geometry/fixtures/grade10-spatial-foundation.html'
]) assert(exists(p),`missing ${p}`);

new vm.Script(read('geometry/spatial-scene.js'),{filename:'geometry/spatial-scene.js'});
new vm.Script(read('geometry/lesson-spatial.js'),{filename:'geometry/lesson-spatial.js'});
checks+=2;

const map=read('content/10-geometry-atanasyan/content-map.md');
for(const token of [
  '4 + 19 + 19 + 18 + 8 = 68',
  'Введение, пп. 1–3',
  'Гл. I, §§1–4, пп. 4–14',
  'Гл. II, §§1–3, пп. 15–24',
  'пп. 25*–26* только как enrichment',
  'Гл. III, §§1–3, пп. 27–37',
  'п. 29* «Теорема Эйлера» — **обязательна через ФРП-2025**',
  'пп. 74–76, 79–80',
  'Приложение 1 «Изображение пространственных фигур»',
  '10 | темы 01–02',
  '12 | тема 02',
  '12 | тема 03',
  '10 | тема 03',
  '11 | тема 04',
  '9 | темы 04–05',
  '4 | тема 05',
  'Номера страниц намеренно не фиксируются',
  'ни один полноценный урок 10 класса в foundation-ветке не генерируется'
]) assert(map.includes(token),`content map missing: ${token}`);

const plan=read('lessons/10-geometry-atanasyan/lesson-plan.md');
const numbered=[...plan.matchAll(/^([1-9]|[1-5][0-9]|6[0-8])\.\s/gm)].map(m=>Number(m[1]));
assert(numbered.length===68,`lesson plan count ${numbered.length}`);
assert(numbered.every((n,i)=>n===i+1),'lesson plan numbering must be 1..68');
for(const token of [
  '4 урока (1–4)',
  '19 уроков (5–23)',
  '19 уроков (24–42)',
  '18 уроков (43–60)',
  '8 уроков (61–68)',
  'Параллельное проектирование',
  'Теорема о трёх перпендикулярах',
  'Соотношение Эйлера',
  'Объём призмы',
  'Объём пирамиды',
  'Итоговая комплексная диагностика 10 класса'
]) assert(plan.includes(token),`lesson plan missing: ${token}`);

const data=read('js/data.js');
assert(data.includes("id:'10-geometry-atanasyan'"),'grade 10 geometry row missing');
assert(data.includes("bounds:[0,4,23,42,60,68]"),'grade 10 geometry bounds changed');
for(const title of [
  'Повторение (4 ч). Уроки 1–4',
  'Параллельность прямых и плоскостей (19 ч). Уроки 5–23',
  'Перпендикулярность прямых и плоскостей (19 ч). Уроки 24–42',
  'Многогранники (18 ч). Уроки 43–60',
  'Повторение (8 ч). Уроки 61–68'
]) assert(data.includes(`'${title}'`),`KTP topic missing: ${title}`);

const runtime=read('geometry/spatial-scene.js');
for(const token of [
  'spatialScenes',
  'function projectPoint',
  'distance3',
  'dot3',
  'cross3',
  "obj.visibility==='hidden'",
  "obj.type==='face'||obj.type==='plane'",
  "['segment','line','ray']",
  'depthOfObject'
]) assert(runtime.includes(token),`spatial runtime missing: ${token}`);

const css=read('geometry/spatial-scene.css');
for(const token of ['.spatial-face','.spatial-plane','.spatial-hidden','.spatial-emphasis','@media(max-width:620px)','@media print']){
  assert(css.includes(token),`spatial CSS missing: ${token}`);
}

const adapter=read('geometry/lesson-spatial.js');
for(const token of ['holder.spatialScenes','item.spatialFigure','data-spatial-scene']){
  assert(adapter.includes(token)||token==='data-spatial-scene'&&adapter.includes('dataset.spatialScene'),`lesson spatial adapter missing: ${token}`);
}

const fixture=read('geometry/fixtures/grade10-spatial-foundation.html');
for(const token of [
  'data-spatial-scene="cube"',
  'data-spatial-scene="line-plane"',
  'data-spatial-scene="tetra-section"',
  'visibility:"hidden"',
  'type:"plane"',
  'type:"face"'
]) assert(fixture.includes(token),`fixture missing: ${token}`);

const contract=read('geometry/SPATIAL_RENDERING.md');
for(const token of [
  'The source geometry is authoritative',
  'Never derive a mathematical length',
  '[x, y, z]',
  'Hidden-edge inference is intentionally **not automatic**',
  'WebGL/Three.js',
  '390 px'
]) assert(contract.includes(token),`spatial contract missing: ${token}`);

assert(!exists('content/10-geometry-atanasyan/01.js'),'foundation must not generate topic 01 content');
assert(!exists('lessons/10-geometry-atanasyan/01/series.js'),'foundation must not generate lesson series');
assert(!exists('assessments/10-geometry-atanasyan/01/data.js'),'foundation must not generate assessments');

console.log(`Grade 10 Atanasyan geometry foundation QA passed: ${checks} checks.`);
