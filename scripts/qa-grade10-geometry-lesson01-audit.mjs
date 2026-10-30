import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir='lessons/10-geometry-atanasyan/01/';
const ctx=vm.createContext({window:{},console});
for(const p of ['series.js','scenes.js','data.js'])vm.runInContext(fs.readFileSync(dir+p,'utf8'),ctx,{filename:dir+p});
const series=ctx.window.KTP_LESSON_SERIES,lesson=series.lessons[0];
assert.equal(series.meta.rowId,'10-geometry-atanasyan');
assert.equal(series.meta.grade,10);
assert.equal(series.meta.topicIndex,0);
assert.equal(series.meta.totalLessons,4);
assert.equal(series.lessons.length,4);
assert.equal(lesson.id,'01');
assert.equal(lesson.globalNumber,1);
assert.match(lesson.source.section,/Введение, п. 1/);
assert.equal(lesson.examples.length,2);
const [hidden,projection]=lesson.examples;
assert.match(hidden.problem,/ребро CD изображено штриховой линией/);
assert.match(hidden.solution,/ребро CD скрыто/);
assert.match(hidden.solution,/Существование ребра определяется моделью/);
assert.match(hidden.check,/повороте модели/);
assert.match(hidden.answer,/ребро CD существует/);
assert.match(projection.problem,/AB=2·CD/);
assert.match(projection.solution,/Проекция может/);
assert.match(projection.solution,/не устанавливает отношение истинных длин/);
assert.match(projection.check,/нужны данные условия/);
assert.match(projection.answer,/такое равенство не следует/);
assert.ok(lesson.examples.every(e=>e.problem&&e.idea&&e.solution&&e.check&&e.answer&&e.spatialFigure));
assert.ok(lesson.examples.every(e=>e.solution!==e.answer),'examples cannot be answer-only');
const cube=series.spatialScenes['g10-l01-projection'];
assert.ok(cube,'missing opening cube diagram');
assert.equal(Object.keys(cube.points).length,8);
const edges=cube.objects.filter(o=>o.type==='segment');
assert.equal(edges.length,12,'cube requires 12 edges');
const edgeCD=edges.find(o=>o.points[0]==='C'&&o.points[1]==='D');
assert.equal(edgeCD?.visibility,'hidden','worked example must match hidden cube edge');
assert.equal(lesson.practice.length,8);
assert.equal(lesson.homework.required.length,6);
assert.equal(lesson.homework.optional.length,2);
let targeted=0;
for(const kind of ['independent','control']){
 const a=lesson[kind],expected=kind==='independent'?5:6,score=kind==='independent'?10:14;
 assert.equal(a.variants.length,6);
 for(const v of a.variants){
   assert.equal(v.tasks.length,expected);
   assert.equal(v.tasks.reduce((s,t)=>s+t.points,0),score);
   const first=v.tasks[0],second=v.tasks[1];
   assert.match(first.text,/штриховой линией/);
   assert.match(first.answer,/скрытое ребро/);
   assert.match(second.text,/длине отрезка на экране/);
   assert.match(second.answer,/искажает длины/);
   targeted+=2;
 }
}
const occurrences=2+lesson.practice.length+lesson.homework.required.length+
 lesson.homework.optional.length+lesson.independent.variants.reduce((s,v)=>s+v.tasks.length,0)+
 lesson.control.variants.reduce((s,v)=>s+v.tasks.length,0);
assert.equal(occurrences,84);
console.log('Grade 10 geometry lesson 01 PASS: two source-grounded solved examples, hidden cube edge and 12-edge integrity, '+targeted+' targeted assessment checks, '+occurrences+' displayed task occurrences.');
