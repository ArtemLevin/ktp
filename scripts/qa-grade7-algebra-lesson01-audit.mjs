import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root='lessons/7-algebra-makarychev/01/';
const ctx=vm.createContext({window:{},console});
for(const file of ['series.js','data/01.js']){
  vm.runInContext(fs.readFileSync(root+file,'utf8'),ctx,{filename:root+file});
}
const series=ctx.window.KTP_LESSON_SERIES;
const lesson=series.lessons[0];
assert.equal(series.meta.rowId,'7-algebra-makarychev');
assert.equal(series.meta.grade,7);
assert.equal(series.meta.topicIndex,0);
assert.equal(series.meta.totalLessons,18);
assert.equal(lesson.id,'01');
assert.equal(lesson.number,1);
assert.match(lesson.source.section,/§1, п. 1/);
assert.equal(lesson.examples.length,2);
assert.equal(lesson.practice.length,6);
assert.equal(lesson.homework.required.length,4);
assert.equal(lesson.homework.optional.length,2);
assert.match(lesson.homework.optional[1].text,/две разные дробные записи одного и того же рационального числа/);
assert.equal(lesson.homework.optional[1].answer,'Например 1/2 и 2/4.');

const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return Math.abs(a);};
const parseFraction=s=>{
  const m=String(s).match(/^(-?\d+)\/(\d+)$/);
  assert.ok(m,'invalid rational form '+s);
  return [Number(m[1]),Number(m[2])];
};
const greater=(n,d,a,b)=>n*b>a*d;
const less=(n,d,a,b)=>n*b<a*d;
let variants=0;
for(let i=1;i<=6;i++){
  const q=lesson.independent.variants[i-1].tasks;
  const c=lesson.control.variants[i-1].tasks;
  assert.equal(q.length,6);assert.equal(c.length,7);
  assert.equal(q.reduce((n,t)=>n+t.points,0),10);
  assert.equal(c.reduce((n,t)=>n+t.points,0),14);
  const integer=Number(q[0].text.match(/число -(\d+)\./)?.[1]);
  assert.equal(integer,i+3,'first independent task varies correctly');
  assert.equal(q[0].answer,'Z, Q');
  const fractionTask=q[2].text.match(/Сократите дробь (\d+)\/(\d+)/);
  assert.ok(fractionTask,'missing reduction problem');
  const numerator=Number(fractionTask[1]),denominator=Number(fractionTask[2]);
  const [reducedN,reducedD]=parseFraction(q[2].answer);
  assert.equal(numerator*reducedD,reducedN*denominator,'fraction value preserved');
  assert.equal(gcd(reducedN,reducedD),1,'answer must be in lowest terms');
  assert.match(q[3].answer,/< /,'negative comparison direction');
  const interval=q[4].text.match(/между (\d+)\/(\d+) и (\d+)\/(\d+)/);
  assert.ok(interval,'interval endpoints missing');
  const [,n1,d1,n2,d2]=interval.map(Number);
  assert.ok(less(n1,d1,n2,d2),'invalid interval');
  const sample=q[4].answer.match(/Например, (\d+)\/(\d+)/);
  assert.ok(sample,'example rational number missing');
  const a=Number(sample[1]),b=Number(sample[2]);
  assert.ok(greater(a,b,n1,d1)&&less(a,b,n2,d2),'sample is not strictly inside interval');
  assert.match(q[5].answer,/3,0 = 3/,'decimal representation counterexample');
  const equality=c[2].text.match(/Представьте (\d+)\/(\d+) равной дробью со знаменателем (\d+)/);
  assert.ok(equality,'control equivalent fraction question missing');
  const [,cn,cd,targetD]=equality.map(Number);
  const [an,ad]=parseFraction(c[2].answer);
  assert.equal(ad,targetD,'specified target denominator');
  assert.equal(an*cd,cn*ad,'equivalent fraction changed value');
  assert.equal(c[3].answer,'первое больше','negative fractions order');
  assert.match(c[6].answer,/[−-]4 и 2\/3/,'integer and noninteger rational numbers');
  variants++;
}
assert.equal(variants,6);
assert.equal(lesson.examples.length+lesson.practice.length+lesson.homework.required.length+lesson.homework.optional.length+
  lesson.independent.variants.reduce((sum,v)=>sum+v.tasks.length,0)+
  lesson.control.variants.reduce((sum,v)=>sum+v.tasks.length,0),92);
console.log('Grade 7 algebra lesson 01 math audit PASS: 6 independent and 6 control variants; 92 task/example occurrences; all 6 sample rational numbers lie strictly between their bounds.');
