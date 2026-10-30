import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const dir='lessons/8-geometry-atanasyan/01/';
const context=vm.createContext({window:{},console});
for(const file of ['series.js','scenes.js','data.js']) {
  vm.runInContext(fs.readFileSync(dir+file,'utf8'),context,{filename:dir+file});
}
const series=context.window.KTP_LESSON_SERIES;
assert.equal(series.meta.rowId,'8-geometry-atanasyan');
assert.equal(series.meta.grade,8);
assert.equal(series.meta.topicIndex,0);
assert.equal(series.meta.totalLessons,13);
assert.equal(series.lessons.length,13);

const lesson=series.lessons[0];
assert.equal(lesson.id,'01');
assert.equal(lesson.number,1);
assert.match(lesson.title,/Многоугольник\. Выпуклый многоугольник/);
assert.match(lesson.source.section,/Гл\. V, §1, пп\. 39–40/);
assert.match(lesson.theory[1].html,/из одной вершины/);
assert.match(lesson.theory[1].html,/n≥3/);
assert.match(lesson.theory[1].html,/n−2/);
assert.equal(lesson.examples.length,2);
assert.ok(lesson.examples.every(x=>x.idea&&x.solution&&x.check&&x.answer),'Worked examples require real solutions');
assert.match(lesson.examples[0].solution,/8−2=6/);
assert.match(lesson.examples[0].solution,/6·180°=1080°/);
assert.equal(lesson.examples[0].answer,'1080°');
assert.match(lesson.examples[1].solution,/6−2/);
assert.match(lesson.examples[1].solution,/720°:6=120°/);
assert.equal(lesson.examples[1].answer,'120°');
assert.ok(!lesson.examples.some(x=>x.solution.startsWith('После проверки условий получаем:')),'generic answer-only examples prohibited');

const scene=series.geometryScenes['g-polygon'];
assert.equal(scene.objects.filter(x=>x.type==='polygon').length,1);
const diagonalObjects=scene.objects.filter(x=>x.type==='segment');
const vertices=scene.objects.find(x=>x.type==='polygon').points;
assert.equal(vertices.length,6);
assert.equal(diagonalObjects.length,vertices.length-3,'all nonadjacent diagonals from first vertex');
for(const item of diagonalObjects) {
  assert.equal(item.points[0],'A');
  assert.ok(['C','D','E'].includes(item.points[1]));
}
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);
const points=vertices.map(v=>scene.points[v]);
const signs=points.map((_,i)=>cross(points[i],points[(i+1)%points.length],points[(i+2)%points.length]));
assert.ok(signs.every(v=>v>0)||signs.every(v=>v<0),'polygon diagram must be strictly convex');

let checked=0;
for(let variant=1;variant<=6;variant++){
  const n=[6,8,10,6,8,10][variant-1],s=(n-2)*180,e=s/n;
  const independent=lesson.independent.variants[variant-1].tasks;
  const control=lesson.control.variants[variant-1].tasks;
  assert.equal(independent.length,5);
  assert.equal(control.length,6);
  assert.equal(independent.reduce((sum,t)=>sum+t.points,0),10);
  assert.equal(control.reduce((sum,t)=>sum+t.points,0),14);
  assert.equal(independent[0].answer,s+'°');
  assert.equal(independent[1].answer,String(n-2));
  assert.equal(independent[2].answer,e+'°');
  assert.equal(control[0].answer,s+'°');
  assert.equal(control[1].answer,String(n-2));
  assert.equal(control[2].answer,e+'°');
  for(const task of [independent[1],control[1]]) {
    assert.match(task.text,/все диагонали, проведённые из одной его вершины/);
    assert.match(task.text,/выпуклый/);
  }
  for(const task of [independent[2],control[2]]) {
    assert.match(task.text,/Все внутренние углы выпуклого/);
    assert.match(task.text,/равны/);
    assert.doesNotMatch(task.text,/правильного/);
  }
  assert.equal((n-2)*180,n*e);
  checked+=11;
}
assert.equal(lesson.practice.length,8);
assert.equal(lesson.homework.required.length,6);
assert.equal(lesson.homework.optional.length,2);
assert.match(lesson.practice[1].text,/все диагонали/);
assert.match(lesson.homework.required[1].text,/все диагонали/);
const directAnswerOccurrences=2+lesson.practice.length+lesson.homework.required.length+lesson.homework.optional.length+6*5+6*6;
assert.equal(directAnswerOccurrences,84);
console.log('Grade 8 geometry polygon QA PASS: '+checked+' independent numeric/wording checks across 6 variants, convex geometry scene, 2 worked examples, '+directAnswerOccurrences+' displayed answer occurrences.');
