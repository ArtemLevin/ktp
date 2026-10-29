import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root='lessons/7-geometry-atanasyan/01/';
const ctx=vm.createContext({window:{},Math,console});
for(const source of ['series.js','data.js']){
  vm.runInContext(fs.readFileSync(root+source,'utf8'),ctx,{filename:root+source});
}
const series=ctx.window.KTP_LESSON_SERIES;
assert.equal(series.meta.rowId,'7-geometry-atanasyan');
assert.equal(series.meta.topicNumber,1);
assert.equal(series.meta.grade,7);
assert.equal(series.meta.totalLessons,12);
assert.equal(series.lessons.length,12);
const lesson=series.lessons[0];
assert.equal(lesson.id,'01');
assert.equal(lesson.globalNumber,1);
assert.match(lesson.title,/точки, прямые и отрезки/i);
assert.match(lesson.source.section,/Глава I, §1, п. 1/);

for(const key of ['g1-line','g1-segment']){
  const scene=series.geometryScenes[key];
  assert.ok(scene,'required diagram: '+key);
  assert.ok(Array.isArray(scene.objects)&&scene.objects.length,'diagram objects: '+key);
  for(const fig of scene.objects){
    for(const point of fig.points||[])assert.ok(scene.points[point],'point '+point+' missing in '+key);
  }
}
const html=fs.readFileSync(root+'01.html','utf8');
assert.match(html,/geometry\/geometry-scene\.js/);
assert.match(html,/geometry\/lesson-geometry\.js/);

assert.equal(lesson.theory.length,2);
assert.equal(lesson.examples.length,2);
assert.equal(lesson.practice.length,8);
assert.equal(lesson.homework.required.length,6);
assert.equal(lesson.homework.optional.length,2);
assert.equal(lesson.independent.variants.length,6);
assert.equal(lesson.control.variants.length,6);

let total=lesson.examples.length;
const tasks=[
  ...lesson.practice,
  ...lesson.homework.required,
  ...lesson.homework.optional,
  ...lesson.independent.variants.flatMap(v=>{
    assert.equal(v.tasks.length,4);
    assert.equal(v.tasks.reduce((s,x)=>s+x.points,0),8);
    return v.tasks;
  }),
  ...lesson.control.variants.flatMap(v=>{
    assert.equal(v.tasks.length,5);
    assert.equal(v.tasks.reduce((s,x)=>s+x.points,0),12);
    return v.tasks;
  })
];
total+=tasks.length;
assert.equal(total,72,'72 displayed example/task occurrences expected');
let explanations=0;
for(const t of tasks){
  assert.ok(typeof t.text==='string'&&t.text.trim(), 'empty question');
  assert.ok(typeof t.answer==='string'&&t.answer.trim(),'empty answer');
  if(!t.text.includes('заканчивается в точках'))continue;
  const match=t.text.match(/прямая ([A-Z])([A-Z]) заканчивается в точках ([A-Z]) и ([A-Z])/);
  assert.ok(match,'unable to identify variable points: '+t.text);
  const [first,second]=[match[1],match[2]];
  assert.equal(match[3],first,'line/endpoint mismatch');
  assert.equal(match[4],second,'line/endpoint mismatch');
  assert.ok(t.answer.includes('точками '+first+' и '+second),'answer must use the prompt point names');
  assert.ok(t.answer.includes('отрезок '+first+second),'answer must use the prompt segment name');
  explanations++;
}
assert.equal(explanations,15,'6 independent + 6 control + 3 practice/homework explanations');

for(const ex of lesson.examples){
  for(const key of ['title','problem','idea','solution','check','answer'])assert.ok(String(ex[key]).trim(),'example missing '+key);
}
console.log('Grade 7 geometry first-lesson audit PASS: '+total+' answer occurrences; '+explanations+' parameterized endpoint explanations; six variants of both assessment types.');
