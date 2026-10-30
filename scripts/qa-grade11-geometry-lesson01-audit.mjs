import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root='lessons/11-geometry-atanasyan/01/';
const ctx=vm.createContext({window:{},console,Math});
for(const name of ['series.js','question-bank.js','scenes.js','data.js']){
  vm.runInContext(fs.readFileSync(root+name,'utf8'),ctx,{filename:root+name});
}
const series=ctx.window.KTP_LESSON_SERIES,lesson=series.lessons[0];
assert.equal(series.meta.rowId,'11-geometry-atanasyan');
assert.equal(series.meta.grade,11);
assert.equal(series.meta.topicIndex,0);
assert.equal(series.meta.totalLessons,11);
assert.equal(series.lessons.length,11);
assert.equal(lesson.id,'01');
assert.equal(lesson.globalNumber,1);
assert.match(lesson.source.section,/пп\. 38, 40, 43/);
assert.match(lesson.title,/Тела вращения: цилиндр, конус, шар/);
assert.equal(lesson.theory.length,2);
assert.match(lesson.theory[0].html,/Полуокружность \(дуга, ограничивающая полукруг\)/);
assert.match(lesson.theory[0].html,/образует сферу — поверхность шара/);
assert.match(lesson.theory[0].html,/полукруг вокруг диаметра — шар/);
assert.doesNotMatch(lesson.theory[0].html,/Окружность границы полукруга/);
assert.match(lesson.summary.join(' '),/Полуокружность/);
assert.equal(lesson.examples.length,2);
const [cylinder,sphere]=lesson.examples;
assert.match(cylinder.problem,/радиус основания 3 см, высота 4 см/);
assert.match(cylinder.solution,/Длина каждой образующей равна расстоянию между основаниями/);
assert.match(cylinder.answer,/4 см/);
assert.match(sphere.problem,/полукруг/);
assert.match(sphere.solution,/вращении вокруг диаметра эти точки заполняют весь шар/);
assert.match(sphere.solution,/полуокружность/i);
assert.match(sphere.answer,/Полукруг образует шар; полуокружность образует сферу/);
assert.ok(lesson.examples.every(e=>e.idea&&e.solution&&e.check&&e.answer&&e.problem));
assert.ok(lesson.examples.every(e=>e.solution!==e.answer));
const image=series.revolutionScenes['g11-l01'];
assert.equal(image.solid.type,'cylinder');
assert.ok(image.solid.radius>0&&image.solid.height>0);
assert.equal(lesson.practice.length,8);
assert.equal(lesson.homework.required.length,6);
assert.equal(lesson.homework.optional.length,2);
let variants=0;
for(const kind of ['independent','control']){
  const isIndependent=kind==='independent',a=lesson[kind],expected=isIndependent?5:6,max=isIndependent?10:14;
  assert.equal(a.variants.length,6);
  assert.equal(a.maxScore,max);
  for(let i=0;i<6;i++){
    const v=a.variants[i],k=i+(isIndependent?1:7),r=k+2,h=k+3;
    assert.equal(v.tasks.length,expected);
    assert.equal(v.tasks.reduce((s,t)=>s+t.points,0),max);
    assert.match(v.tasks[0].text,new RegExp('радиус '+r+', высота '+h));
    assert.equal(v.tasks[0].answer,h+'.');
    assert.match(v.tasks[0].solution,/равна высоте/);
    assert.equal(v.tasks[1].answer,'Сфера.');
    assert.match(v.tasks[1].solution,/Граница шара — сфера/);
    assert.equal(v.tasks[2].answer,2*r+'π.');
    assert.equal(v.tasks[3].answer,'Круг включает внутренние точки, окружность — его граница.');
    assert.equal(v.tasks[4].answer,'Прямой круговой цилиндр.');
    if(!isIndependent)assert.equal(v.tasks[5].answer,'Прямой круговой конус.');
    variants++;
  }
}
assert.equal(variants,12);
const total=lesson.examples.length+lesson.practice.length+lesson.homework.required.length+lesson.homework.optional.length+
 lesson.independent.variants.reduce((s,v)=>s+v.tasks.length,0)+
 lesson.control.variants.reduce((s,v)=>s+v.tasks.length,0);
assert.equal(total,84);
console.log('Grade 11 geometry lesson 01 mathematical QA PASS: semicircle→sphere, semidisk→ball, two solved examples, '+variants+' assessment variants, '+total+' displayed items.');
