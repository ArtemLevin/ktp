import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root='lessons/11-geometry-atanasyan/06/';
const ctx=vm.createContext({window:{KTP_G11_VECTOR_QUESTION_POOL:()=>[],KTP_G11_COORDINATE_QUESTION_POOL:()=>[],KTP_G11_REVIEW_SCENES:{spatial:{},revolution:{'g11-review-57-surface':{title:'Поверхности и развёртки',solid:{type:'frustum',radius:1,height:2}}}}},console,Math});
for(const p of ['series.js','definitions.js','question-bank.js','scenes.js','data.js'])vm.runInContext(fs.readFileSync(root+p,'utf8'),ctx,{filename:root+p});
const S=ctx.window.KTP_LESSON_SERIES,l=S.lessons[0],pool=ctx.window.KTP_G11_REVIEW_QUESTION_POOL;
assert.equal(S.meta.rowId,'11-geometry-atanasyan');
assert.equal(S.meta.topicIndex,5);
assert.equal(S.meta.totalLessons,12);
assert.equal(S.meta.courseLessonStart,57);
assert.equal(S.lessons.length,12);
assert.equal(l.id,'01');assert.equal(l.globalNumber,57);
assert.equal(l.mode,'surface');
assert.match(l.title,/Поверхности и развёртки/);
assert.match(l.source.section,/Гл\. IV/);
assert.equal(l.examples.length,3);
assert.match(l.examples[0].check,/2π·2·6=24π/);
assert.match(l.examples[1].check,/√\(6²\+8²\)=10/);
assert.match(l.examples[2].check,/2πrh\+2πr²/);
const check=(item)=>{
 const t=item.text||item.problem,a=item.answerCore||item.answer;
 let m,expected;
 if((m=t.match(/^У цилиндра r=(\d+) см, h=(\d+) см\. Найдите (полную|боковую)/))){
  const r=+m[1],h=+m[2];expected=(m[3]==='полную'?2*r*(h+r):2*r*h)+'π см².';
 }else if((m=t.match(/^Конус: r=(\d+) см, h=(\d+) см\. Найдите (полную|боковую)/))){
  const r=+m[1],h=+m[2];const l=Math.hypot(r,h);expected=Math.round((r*l+(m[3]==='полную'?r*r:0))*1e8)/1e8+'π см².';
 }else if((m=t.match(/^Радиус сферы (\d+) см\. Найдите площадь/))){
  expected=(4*(+m[1])**2)+'π см².';
 }else if((m=t.match(/^Усечённый конус: R=(\d+), r=(\d+), h=(\d+) см/))){
  const R=+m[1],r=+m[2],h=+m[3];expected=Math.round(((R+r)*Math.hypot(h,R-r)+R*R+r*r)*1e8)/1e8+'π см².';
 }else if(t.startsWith('Ученик включил только одно основание')){
  expected='Полная поверхность: 2πrh+2πr²; оснований два.';
 }else assert.fail('Unrecognized surface question: '+t);
 assert.equal(a,expected,'Wrong answer for '+t);
 return true;
};
const examples=l.examples.map(e=>({text:e.problem,answer:e.answer}));
const all=[...examples,...l.practice,...l.homework.required,...l.homework.optional,
 ...l.independent.variants.flatMap(v=>v.tasks),...l.control.variants.flatMap(v=>v.tasks)];
assert.equal(all.length,85);
for(const q of all)check(q);
for(let v=1;v<=15;v++){const tasks=pool('surface',v);assert.equal(tasks.length,10);for(const q of tasks)check(q);}
for(const [kind,num,max] of [['independent',5,10],['control',6,14]]){
 assert.equal(l[kind].variants.length,6);
 for(const v of l[kind].variants){assert.equal(v.tasks.length,num);assert.equal(v.tasks.reduce((s,t)=>s+t.points,0),max);}
}
const q=pool('surface',1);
for(const [j,index] of [0,1,4].entries()){
 assert.equal(examples[j].text,q[index].text);
 assert.equal(examples[j].answer,q[index].answerCore);
}
assert.equal(l.practice.length,8);assert.equal(l.homework.required.length,6);assert.equal(l.homework.optional.length,2);
assert.ok(l.examples.every(e=>e.idea&&e.solution&&e.check&&e.answer));
console.log('Grade 11 final geometry 06/01 PASS: all 85 lesson conditions independently solved, 150 generated answers cross-checked, 3 worked examples and 12 assessment variants.');
