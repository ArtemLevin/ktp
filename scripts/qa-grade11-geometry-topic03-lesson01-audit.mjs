import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const dir='lessons/11-geometry-atanasyan/03/';
const ctx=vm.createContext({window:{},console});
for(const file of ['series.js','question-bank.js'])vm.runInContext(fs.readFileSync(dir+file,'utf8'),ctx,{filename:dir+file});
vm.runInContext(fs.readFileSync('geometry/grade11-revolution-volume-scenes.js','utf8'),ctx,{filename:'grade11-revolution-volume-scenes.js'});
for(const file of ['scenes.js','data.js'])vm.runInContext(fs.readFileSync(dir+file,'utf8'),ctx,{filename:dir+file});
const series=ctx.window.KTP_LESSON_SERIES, lesson=series.lessons[0],pool=ctx.window.KTP_G11_REVOLUTION_VOLUME_QUESTION_POOL;
assert.equal(series.meta.rowId,'11-geometry-atanasyan');
assert.equal(series.meta.topicIndex,2);
assert.equal(series.meta.topicNumber,3);
assert.equal(series.meta.courseLessonStart,22);
assert.equal(series.meta.totalLessons,11);
assert.equal(lesson.id,'01');
assert.equal(lesson.globalNumber,22);
assert.equal(lesson.week,11);
assert.match(lesson.source.section,/Глава V, §2, п. 55/);
assert.match(lesson.title,/Объём цилиндра/);
assert.match(lesson.theory[0].html,/V=πr²h/);
assert.match(lesson.theory[1].html,/4 раза/);

const val=(t)=>{
 const text=t.text,skill=t.skill;
 const take=(regex)=>{const m=text.match(regex);assert.ok(m,'Question cannot be independently parsed: '+text);return m.slice(1).map(Number);};
 let expected;
 if(skill==='CYLINDER_VOLUME'){const [r,h]=take(/r=(\d+) и h=(\d+)/);expected=(r*r*h)+'π.';}
 else if(skill==='CYLINDER_INVERSE'){const [V,r]=take(/Объём цилиндра равен (\d+)π, радиус (\d+)/);expected=V/(r*r)+'.';}
 else if(skill==='DIAMETER_RADIUS'){const [D,h]=take(/Диаметр цилиндра (\d+), высота (\d+)/);expected=(D/2)**2*h+'π.';}
 else if(skill==='BASE_AREA'){const [base,h]=take(/Площадь основания цилиндра (\d+)π, высота (\d+)/);expected=base*h+'π.';}
 else if(skill==='RADIUS_SCALE'){expected='В 4 раза.';}
 else if(skill==='CAVALIERI_MODEL'){expected='1:1.';}
 else if(skill==='AREA_VOLUME_ERROR'){expected='Площадь боковой поверхности, а не объём.';}
 else if(skill==='VOLUME_UNITS'){expected='см³.';}
 else if(skill==='ADDITIVITY'){const [r,h1,h2]=take(/Два цилиндра радиуса (\d+) имеют высоты (\d+) и (\d+)/);expected=r*r*(h1+h2)+'π.';}
 else if(skill==='PROJECTION_METRIC'){expected='Эллипс — проекция круга; истинный радиус берут из условия или 3D-модели.';}
 else assert.fail('Unknown first-lesson skill '+skill);
 assert.equal(t.answer,expected,'Wrong answer for '+text);
 assert.ok(t.solution&&t.solution.length>=8,'Missing solution for '+skill);
 return skill;
};
const kinds=new Set;
for(let k=1;k<=15;k++){
 const tasks=pool('cylinder',k);
 assert.equal(tasks.length,10);
 for(const item of tasks)kinds.add(val(item));
}
assert.equal(kinds.size,10,'All ten exercise types have independent expected answers');

const ex=lesson.examples;
assert.equal(ex.length,3);
assert.equal(ex[0].answer,'36π.');
assert.equal(ex[1].answer,'4.');
assert.equal(ex[2].answer,'36π.');
assert.match(ex[0].check,/9π·4=36π/);
assert.match(ex[1].check,/3²·4=36π/);
assert.match(ex[2].check,/6\/2/);
assert.ok(ex.every(x=>x.idea&&x.solution&&x.check&&x.answer));
const scene=series.revolutionScenes['g11-volrev-22-cylinder'];
assert.equal(scene.solid.type,'cylinder');
assert.ok(scene.solid.radius>0&&scene.solid.height>0);
assert.equal(scene.section.type,'axial');
assert.equal(scene.math.focus,'cylinder-volume');
assert.equal(scene.math.radius,scene.solid.radius);
assert.equal(scene.math.height,scene.solid.height);

const visible=[...ex,...lesson.practice,...lesson.homework.required,...lesson.homework.optional,
 ...lesson.independent.variants.flatMap(v=>v.tasks),...lesson.control.variants.flatMap(v=>v.tasks)];
assert.equal(lesson.practice.length,8);
assert.equal(lesson.homework.required.length,6);
assert.equal(lesson.homework.optional.length,2);
assert.equal(visible.length,85);
for(const item of visible)val(item);
for(const [kind,taskCount,score] of [['independent',5,10],['control',6,14]]){
 const variants=lesson[kind].variants;
 assert.equal(variants.length,6);
 for(const variant of variants){
  assert.equal(variant.tasks.length,taskCount);
  assert.equal(variant.tasks.reduce((s,t)=>s+t.points,0),score);
 }
}
const html=fs.readFileSync(dir+'01.html','utf8');
assert.match(html,/question-bank\.js/);
assert.match(html,/grade11-revolution-volume-scenes\.js/);
assert.match(html,/data\.js/);
console.log('Grade 11 volume lesson 03/01 PASS: 150 independent generated answer checks across 10 task families, all 85 displayed lesson tasks independently verified, 6+6 scored variants and coherent volume scene.');
