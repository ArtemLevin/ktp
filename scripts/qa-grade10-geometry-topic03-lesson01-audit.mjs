import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const dir='lessons/10-geometry-atanasyan/03/';
const ctx=vm.createContext({window:{},console});
for(const name of ['series.js','scenes.js','data.js'])vm.runInContext(fs.readFileSync(dir+name,'utf8'),ctx,{filename:dir+name});
const S=ctx.window.KTP_LESSON_SERIES,l=S.lessons[0];
assert.equal(S.meta.rowId,'10-geometry-atanasyan');
assert.equal(S.meta.topicIndex,2);
assert.equal(S.meta.topicNumber,3);
assert.equal(S.meta.totalLessons,19);
assert.equal(S.meta.courseLessonStart,24);
assert.equal(S.meta.courseLessonEnd,42);
assert.equal(l.id,'01');
assert.equal(l.globalNumber,24);
assert.match(l.source.section,/Гл\. II, §1, п\. 15/);
assert.equal(l.examples.length,2);
assert.match(l.examples[0].problem,/∠AOC=90°/);
assert.match(l.examples[0].solution,/По определению эти прямые перпендикулярны/);
assert.equal(l.examples[0].answer,'AB⊥CD.');
assert.match(l.examples[1].problem,/AB и CC₁/);
assert.match(l.examples[1].solution,/не лежит на AB/);
assert.match(l.examples[1].solution,/BB₁∥CC₁/);
assert.match(l.examples[1].solution,/AB⊥BB₁/);
assert.match(l.examples[1].solution,/90°/);
assert.equal(l.examples[1].spatialFigure,'g10-p03-01-skew');
assert.ok(l.examples.every(e=>e.problem&&e.idea&&e.solution&&e.check&&e.answer));
assert.ok(l.examples.every(e=>e.solution!==e.answer));

const diagram=S.spatialScenes[l.examples[1].spatialFigure];
assert.ok(diagram,'missing skew scene');
assert.equal(Object.keys(diagram.points).length,8,'all cube vertices');
const edges=diagram.objects.filter(o=>o.type==='segment');
assert.equal(edges.length,12,'all cube edges');
const hasEdge=(a,b)=>edges.some(x=>x.points[0]===a&&x.points[1]===b);
for(const [a,b] of [['A','B'],['C','C1'],['B','B1']])assert.ok(hasEdge(a,b),'missing '+a+b);
const diff=(a,b)=>diagram.points[b].map((v,i)=>v-diagram.points[a][i]);
const ab=diff('A','B'), cc1=diff('C','C1'),bb1=diff('B','B1');
const dot=(x,y)=>x.reduce((acc,v,i)=>acc+v*y[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
assert.equal(dot(ab,cc1),0,'actual cube edges must form right angle');
assert.deepEqual([...cross(cc1,bb1)],[0,0,0],'vertical edges must be parallel');
assert.equal(dot(diff('A','C'),cross(ab,cc1))===0,false,'skew supporting lines must be noncoplanar');
assert.ok(edges.filter(x=>x.style==='emphasis').length===2,'highlight exactly perpendicular skew edges');

assert.equal(l.practice.length,8);
assert.equal(l.homework.required.length,6);
assert.equal(l.homework.optional.length,2);
let checks=0;
for(const k of ['independent','control']){
 const w=l[k],size=k==='independent'?5:6,score=k==='independent'?10:14;
 assert.equal(w.variants.length,6);
 for(const v of w.variants){
   assert.equal(v.tasks.length,size);
   assert.equal(v.tasks.reduce((s,t)=>s+t.points,0),score);
   assert.match(v.tasks[0].text,/равен 90°/);
   assert.match(v.tasks[0].answer,/перпендикулярны/);
   assert.match(v.tasks[1].text,/проекции/);
   assert.match(v.tasks[1].answer,/нужен истинный угол 90°/);
   assert.match(v.tasks[2].text,/скрещивающиеся/);
   assert.match(v.tasks[2].answer,/угол между их направлениями равен 90°/);
   assert.match(v.tasks[3].answer,/перпендикулярны/);
   assert.match(v.tasks[4].answer,/меньший угол/);
   if(k==='control')assert.equal(v.tasks[5].answer,'0°…90°.');
   checks+=size;
 }
}
const count=2+8+6+2+(6*5)+(6*6);
assert.equal(count,84);
console.log('Grade 10 geometry 03/01 audit PASS: 2 proven configurations, real 3D skew and orthogonality, '+checks+' independently checked assessment occurrences; 84 displayed items total.');
