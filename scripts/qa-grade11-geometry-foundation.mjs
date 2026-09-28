import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const assert=(condition,message)=>{checks++;if(!condition)throw Error(message);};

const files=[
  'content/11-geometry-atanasyan/content-map.md',
  'lessons/11-geometry-atanasyan/lesson-plan.md',
  'geometry/REVOLUTION_RENDERING.md',
  'geometry/SPATIAL_RENDERING.md',
  'geometry/spatial-scene.js',
  'geometry/lesson-spatial.js'
];
for(const p of files)assert(exists(p),`missing ${p}`);

const sandbox={window:{}};
vm.runInNewContext(read('js/data.js'),sandbox,{filename:'js/data.js'});
const row=sandbox.window.KTP_DATA.rows.find(item=>item.id==='11-geometry-atanasyan');
assert(Boolean(row),'11th grade row exists');
const bounds=Array.from(row.bounds);
assert(JSON.stringify(bounds)===JSON.stringify([0,11,21,32,44,56,68]),`bounds: ${bounds}`);
assert(row.topics.length===6,'six topics');
assert(bounds.at(-1)===68,'68 lessons');

const map=read(files[0]);
for(const token of [
  '34 часа геометрии в 11 классе',
  '68 уроков',
  '12, объёмы тел — 5, векторы и координаты — 10, повторение — 7',
  'гл. IV, §§1–3, пп. 38–46',
  'гл. V, §§1–3, пп. 52–54, 57–58',
  'гл. V, §§2–4, пп. 55, 59–62*',
  'гл. VI, §§1–3, пп. 63–70',
  'гл. VII, §§1–3, пп. 71–78, 80–84*',
  'пункт 74 в новой последовательности',
  'гл. V, п. 58',
  'п. 62* помечен как дополнительный',
  'проверить, что её учебный план действительно предусматривает 2 часа',
  'Полный PDF 2025 года в проекте отсутствует'
])assert(map.includes(token),`source map missing ${token}`);

const oldMap=read('content/10-geometry-atanasyan/content-map.md');
assert(oldMap.includes('Уточнение редакции'),'grade 10 edition warning');
assert(oldMap.includes('../11-geometry-atanasyan/content-map.md#сверка-ссылок-10-класса'),'grade 10 crosswalk link');

const plan=read(files[1]);
const numbered=[...plan.matchAll(/^([1-9]\d?)\.\s/gm)].map(m=>Number(m[1]));
assert(numbered.length===68,`numbered lessons: ${numbered.length}`);
assert(numbered.every((n,i)=>n===i+1),'numbering 1..68');
for(const [i,count] of [11,10,11,12,12,12].entries()){
  assert(bounds[i+1]-bounds[i]===count,`series ${i+1} length`);
}
for(const token of [
  'Касательная плоскость и площадь сферы',
  'Усечённый конус',
  'Шаровой сегмент, слой и сектор',
  'Разложение по трём векторам',
  'Расстояние от точки до плоскости',
  'Итоговая комплексная диагностика 11 класса',
  'Адресная коррекция и повторная проверка'
])assert(plan.includes(token),`lesson plan missing ${token}`);

const rendering=read(files[2]);
for(const token of ['spatial-scene.js','√(r²−d²)','|d| = r','390 px','SVG','Развёртка']){
  assert(rendering.includes(token),`rendering contract missing ${token}`);
}
for(const p of [
  'content/11-geometry-atanasyan/01.js',
  'lessons/11-geometry-atanasyan/01/series.js',
  'assessments/11-geometry-atanasyan/01/data.js'
])assert(!exists(p),`foundation contains published topic artifact: ${p}`);
assert(exists('topics/11-geometry-atanasyan/01.html'),'generic topic route remains available');

assert(read('README.md').includes('content/11-geometry-atanasyan/content-map.md'),'README links foundation');
assert(read('Plan.md').includes('lessons/11-geometry-atanasyan/lesson-plan.md'),'Plan links lesson plan');
console.log(`Grade 11 geometry foundation QA passed: ${checks} checks.`);
