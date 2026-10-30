import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root='lessons/9-geometry-atanasyan/01/';
const context=vm.createContext({window:{},console});
for(const file of ['series.js','scenes.js','data.js']){
  vm.runInContext(fs.readFileSync(root+file,'utf8'),context,{filename:root+file});
}
const series=context.window.KTP_LESSON_SERIES;
assert.equal(series.meta.rowId,'9-geometry-atanasyan');
assert.equal(series.meta.grade,9);
assert.equal(series.meta.topicIndex,0);
assert.equal(series.meta.totalLessons,10);
assert.equal(series.lessons.length,10);

const lesson=series.lessons[0];
assert.equal(lesson.id,'01');
assert.equal(lesson.number,1);
assert.match(lesson.source.section,/Гл\. IX, §1, п\. 76/);
assert.match(lesson.title,/Вектор как направленный отрезок/);
assert.equal(lesson.theory.length,2);
assert.match(lesson.theory[0].html,/началом и концом/);
assert.match(lesson.theory[1].html,/длина равна 0/);

assert.equal(lesson.examples.length,2);
const [ordinary,zero]=lesson.examples;
assert.match(ordinary.problem,/\|AB⃗\|=9 см/);
assert.match(ordinary.solution,/\|BA⃗\|=BA=AB=9 см/);
assert.match(ordinary.solution,/Направления противоположны/);
assert.match(ordinary.answer,/AB⃗≠BA⃗/);
assert.match(zero.problem,/AA⃗/);
assert.match(zero.solution,/Начало и конец совпадают/);
assert.match(zero.solution,/AA=0/);
assert.equal(zero.answer,'Нулевой вектор; длина 0.');
assert.ok(lesson.examples.every(x=>x.problem&&x.idea&&x.solution&&x.check&&x.answer&&x.figure));
assert.ok(lesson.examples.every(x=>x.solution!==x.answer),'example cannot be a bare answer');

const scene=series.geometryScenes['g9-v01'];
assert.ok(scene);
assert.deepEqual([...scene.objects[0].points],['A','B']);
assert.equal(scene.objects[0].type,'vector');
const A=scene.points.A,B=scene.points.B;
assert.ok(Math.hypot(B[0]-A[0],B[1]-A[1])>0,'base vector must be nonzero');

assert.equal(lesson.practice.length,8);
assert.equal(lesson.homework.required.length,6);
assert.equal(lesson.homework.optional.length,2);
let numerical=0;
for(let i=1;i<=6;i++){
  const expected=i+3;
  const q=lesson.independent.variants[i-1];
  const c=lesson.control.variants[i-1];
  assert.equal(q.tasks.length,5);
  assert.equal(c.tasks.length,6);
  assert.equal(q.tasks.reduce((t,x)=>t+x.points,0),10);
  assert.equal(c.tasks.reduce((t,x)=>t+x.points,0),14);
  for(const v of [q,c]){
    const t=v.tasks[0];
    assert.ok(t.text.includes('длину '+expected+' см'));
    assert.equal(t.answer,expected+' см');
    assert.match(t.text,/\|BA⃗\|/);
    assert.match(v.tasks[1].text,/AA⃗/);
    assert.match(v.tasks[1].answer,/Нулевой вектор/);
    assert.equal(v.tasks[2].answer,'0.');
    assert.equal(v.tasks[3].answer,'P.');
    assert.equal(v.tasks[4].answer,'Q.');
    numerical++;
  }
  assert.match(c.tasks[5].answer,/направления противоположны/);
}
const count=2+lesson.practice.length+lesson.homework.required.length+
 lesson.homework.optional.length+
 lesson.independent.variants.reduce((s,v)=>s+v.tasks.length,0)+
 lesson.control.variants.reduce((s,v)=>s+v.tasks.length,0);
assert.equal(count,84);
console.log('Grade 9 vector first lesson audit PASS: '+numerical+' numerical variant checks; 2 independently solved examples; '+count+' displayed example/task occurrences; vector SVG source');
