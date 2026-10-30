import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root='lessons/10-geometry-atanasyan/05/';
const ctx=vm.createContext({window:{},console});
for(const file of ['series.js','scenes.js','data.js'])vm.runInContext(fs.readFileSync(root+file,'utf8'),ctx,{filename:file});
const S=ctx.window.KTP_LESSON_SERIES,l=S.lessons[0];
assert.equal(S.meta.rowId,'10-geometry-atanasyan');
assert.equal(S.meta.topicIndex,4);
assert.equal(S.meta.courseLessonStart,61);
assert.equal(S.meta.courseLessonEnd,68);
assert.equal(S.lessons.length,8);
assert.equal(l.id,'01');
assert.equal(l.globalNumber,61);
assert.match(l.title,/Объёмы многогранников/);
assert.match(l.source.section,/Гл\. III/);
assert.equal(l.examples.length,3);
assert.match(l.examples[0].check,/3·4·5=60/);
assert.match(l.examples[1].check,/18·7=126/);
assert.match(l.examples[1].check,/вместо высоты 7/);
assert.match(l.examples[2].check,/30·6\/3=60/);
function examine(question,answer){
 let m;const num=n=>Number(n);
 if((m=question.match(/Прямоугольный параллелепипед имеет рёбра (\d+), (\d+), (\d+)/)))return assert.equal(answer,num(m[1])*num(m[2])*num(m[3])+'.');
 if((m=question.match(/Наклонная призма имеет Sосн=(\d+), высоту (\d+) и боковое ребро (\d+)/))){
  const [a,h,e]=m.slice(1).map(num);
  assert.ok(e>=h,'slanted prism edge shorter than true height');
  return assert.equal(answer,a*h+'.');
 }
 if((m=question.match(/Пирамида имеет Sосн=(\d+) и высоту (\d+)/)))return assert.equal(answer,num(m[1])*num(m[2])/3+'.');
 if((m=question.match(/какое число в условии наклонной призмы отвечает за расстояние между плоскостями оснований: (\d+) или (\d+)/i)))return assert.equal(answer,m[1]+'.');
 if(question.startsWith('Какие единицы должен иметь ответ задачи на объём'))return assert.equal(answer,'Кубические сантиметры, см³.');
 if((m=question.match(/вычислил объём пирамиды как (\d+)·(\d+)=(\d+)/))) {
  const [a,h,wrong]=m.slice(1).map(num);assert.equal(wrong,a*h);
  return assert.equal(answer,'Множитель 1/3; правильный объём '+a*h/3+'.');
 }
 if((m=question.match(/коэффициент k=(\d+)/)))return assert.equal(answer,'В '+num(m[1])**3+' раз.');
 if(question.startsWith('Чем площадь поверхности отличается'))return assert.match(answer,/квадратных единицах.*кубических/);
 if((m=question.match(/Объём призмы равен (\d+), а площадь основания (\d+)/)))return assert.equal(answer,num(m[1])/num(m[2])+'.');
 if((m=question.match(/Объём пирамиды равен (\d+), высота (\d+)/)))return assert.equal(answer,3*num(m[1])/num(m[2])+'.');
 assert.fail('Unrecognized question: '+question);
}
const list=[...l.examples.map(e=>({text:e.problem,answer:e.answer})),...l.practice,...l.homework.required,...l.homework.optional,...l.independent.variants.flatMap(v=>v.tasks),...l.control.variants.flatMap(v=>v.tasks)];
assert.equal(list.length,85);
for(const item of list)examine(item.text,item.answer);
for(const [kind,size,score] of [['independent',5,10],['control',6,14]]){
 assert.equal(l[kind].variants.length,6);
 for(const v of l[kind].variants){
  assert.equal(v.tasks.length,size);assert.equal(v.tasks.reduce((n,t)=>n+t.points,0),score);
 }
}
assert.equal(l.practice.length,8);
assert.equal(l.homework.required.length,6);
assert.equal(l.homework.optional.length,2);
assert.ok(l.examples.every(e=>e.solution&&e.idea&&e.check&&e.answer));
console.log('Geometry 10 final 05/01: 85/85 independently checked conditions and answers, 3 verified worked examples, 6+6 assessment variants PASS.');
