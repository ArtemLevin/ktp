import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
let checks=0;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const assert=(value,message)=>{checks++;if(!value)throw new Error(message);};

for(const p of [
  'content/9-geometry-atanasyan/content-map.md',
  'lessons/9-geometry-atanasyan/lesson-plan.md',
  'geometry/geometry-scene.js',
  'geometry/geometry-scene.css',
  'geometry/fixtures/grade9-foundation.html'
]) assert(exists(p),`missing ${p}`);

new vm.Script(read('geometry/geometry-scene.js'),{filename:'geometry/geometry-scene.js'});
checks++;

const map=read('content/9-geometry-atanasyan/content-map.md');
for(const token of [
  '10 + 8 + 14 + 10 + 9 + 9 + 8 = 68',
  'Гл. IX, §§1–3, пп. 76–85',
  'Гл. X, §§1–3, пп. 86–92',
  'Гл. XI, §§1–3, пп. 93–104',
  'Гл. XII, §§1–2, пп. 105–112',
  'Гл. XIII, §§1–2, пп. 113–117',
  'произведение отрезков пересекающихся хорд',
  'произведение отрезков секущих',
  'квадрате касательной',
  'радианная мера',
  'осевая симметрия'
]) assert(map.toLowerCase().includes(token.toLowerCase()),`content map missing: ${token}`);

const plan=read('lessons/9-geometry-atanasyan/lesson-plan.md');
const numbered=[...plan.matchAll(/^([1-9]|[1-5][0-9]|6[0-8])\.\s/gm)].map(m=>Number(m[1]));
assert(numbered.length===68,`lesson plan count ${numbered.length}`);
assert(numbered.every((n,i)=>n===i+1),'lesson plan numbering must be 1..68');
for(const token of ['Векторы — 10 уроков','Метод координат — 8 уроков','14 уроков (19–32)','10 уроков (33–42)','Движения — 9 уроков','Подобие фигур — 9 уроков','Повторение — 8 уроков']){
  assert(plan.includes(token),`lesson plan missing: ${token}`);
}

const runtime=read('geometry/geometry-scene.js');
for(const token of ["obj.type==='vector'","obj.type==='coordinateAxes'","function drawCoordinateAxes","geometry-vector-label","geometry-axis"]){
  assert(runtime.includes(token),`geometry runtime missing: ${token}`);
}
const css=read('geometry/geometry-scene.css');
for(const token of ['.geometry-grid','.geometry-axis','.geometry-axis-tick','.geometry-axis-label','.geometry-vector-label']){
  assert(css.includes(token),`geometry css missing: ${token}`);
}

const fixture=read('geometry/fixtures/grade9-foundation.html');
for(const token of ['data-geometry-scene="vector-sum"','data-geometry-scene="coordinate-plane"','type:"vector"','type:"coordinateAxes"']){
  assert(fixture.includes(token),`fixture missing: ${token}`);
}

const data=read('js/data.js');
assert(data.includes("id:'9-geometry-atanasyan'"),'grade 9 geometry row missing');
assert(data.includes("bounds:[0,10,18,32,42,51,60,68]"),'grade 9 geometry bounds changed');
for(const title of ['Векторы','Метод координат','Соотношения между сторонами и углами треугольника. Скалярное произведение векторов','Длина окружности и площадь круга','Движения','Подобие фигур','Повторение (8 ч). Уроки 61–68']){
  assert(data.includes(`'${title}'`),`KTP topic missing: ${title}`);
}

console.log(`Grade 9 geometry foundation QA passed: ${checks} checks.`);
