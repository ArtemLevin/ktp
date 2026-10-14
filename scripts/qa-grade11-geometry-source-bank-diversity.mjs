import fs from 'node:fs';
import vm from 'node:vm';

// Regression for the original 11th-grade source banks (01-03).
// Deliberately separate from the review bank (06): it must keep its own answers.
const read=p=>fs.readFileSync(p,'utf8');
let checks=0;
const check=(condition,message)=>{checks++;if(!condition)throw Error(message);};
const nums=text=>[...String(text).matchAll(/\d+/g)].map(m=>Number(m[0]));
const int=(n,label)=>{check(Number.isSafeInteger(n),label+' integer mathematical answer');return n+'.';};
const pi=n=>int(n,'pi coefficient').slice(0,-1)+'π.';
const thirds=n=>{check(Number.isSafeInteger(n),'fraction numerator');return n%3===0?pi(n/3):n+'π/3.';};
const expected=(q,answer,label)=>check(q.answer===answer,label+' exact value: expected '+answer+' got '+q.answer);
const specs=[
 {id:'01',name:'KTP_G11_QUESTION_POOL',deps:[],count:11},
 {id:'02',name:'KTP_G11_VOLUME_QUESTION_POOL',deps:['geometry/grade11-volume-scenes.js'],count:10},
 {id:'03',name:'KTP_G11_REVOLUTION_VOLUME_QUESTION_POOL',deps:['geometry/grade11-revolution-volume-scenes.js'],count:11}
];
const pools={};
for(const spec of specs){
 const folder='lessons/11-geometry-atanasyan/'+spec.id+'/';
 const bankPath=folder+'question-bank.js',source=read(bankPath);
 const ctx={window:{}};
 for(const file of [...spec.deps,folder+'series.js',bankPath,folder+'scenes.js',folder+'data.js']){
  vm.runInNewContext(read(file),ctx,{filename:file});
 }
 const pool=ctx.window[spec.name],series=ctx.window.KTP_LESSON_SERIES;
 check(typeof pool==='function','source bank '+spec.id+' present');
 check(series.lessons.length===spec.count,'expected lesson count '+spec.id);
 const modes=[...source.matchAll(/mode==='([^']+)'/g)].map(m=>m[1]).filter((m,i,arr)=>arr.indexOf(m)===i);
 check(modes.length===spec.count,'one mode per lesson '+spec.id);
 pools[spec.id]=pool;
 for(const mode of modes){
  const reference=pool(mode,1).map(q=>q.skill);
  check(reference.length===10,'ten tasks '+spec.id+'/'+mode);
  for(let variant=1;variant<=60;variant++){
   const bank=pool(mode,variant);
   check(bank.length===10,'ten tasks '+spec.id+'/'+mode+'/'+variant);
   for(let index=0;index<10;index++){
    const q=bank[index];
    check(Boolean(q.text&&q.answer&&q.skill&&q.solution),spec.id+'/'+mode+'/'+variant+'/'+index+' fields');
    check(q.skill===reference[index],spec.id+'/'+mode+'/'+variant+'/'+index+' stable skill');
    check(!/NaN|Infinity|undefined/.test(q.text+' '+q.answer+' '+q.solution),spec.id+'/'+mode+'/'+variant+'/'+index+' finite');
   }
  }
 }
 for(const lesson of series.lessons){
  for(const kind of ['independent','control']){
   const variants=lesson[kind].variants,reference=variants[0].tasks.map(q=>q.points+'|'+q.skill);
   check(variants.length===6,'six variants '+spec.id+'/'+lesson.id+'/'+kind);
   for(const variant of variants){
    const signature=variant.tasks.map(q=>q.points+'|'+q.skill);
    check(JSON.stringify(signature)===JSON.stringify(reference),'equal scored skill slots '+spec.id+'/'+lesson.id+'/'+kind+'/'+variant.id);
    check(variant.tasks.reduce((total,q)=>total+q.points,0)===lesson[kind].maxScore,'same points '+spec.id+'/'+lesson.id+'/'+kind+'/'+variant.id);
   }
  }
 }
}
const checkCase=(id,mode,index,minUnique)=>{
 const pool=pools[id],arr=Array.from({length:6},(_,i)=>pool(mode,i+1)[index].answer);
 check(new Set(arr).size>=minUnique,'distinct numerical answers '+id+'/'+mode+'/'+index);
};
for(const [id,mode,index,min] of [
 ['01','cylinderCut',0,4],['01','cylinderCut',1,6],
 ['01','coneGeometry',3,6],['01','coneCut',0,5],
 ['01','coneArea',0,6],['01','sphereCut',0,4],
 ['02','prism',0,6],['02','obliquePrism',0,6],
 ['02','pyramid',0,6],['02','sectionVolume',0,6],
 ['03','cone',0,6],['03','sphericalParts',1,6],
 ['03','sphereSection',0,4],['03','sphereSection',3,6]
])checkCase(id,mode,index,min);
// Ratio diversity measures geometric similarity directly; changing only scale fails.
const ratioCases=[
 ['01','cylinderCut',q=>{const [R,d]=nums(q.text);return d/R;}],
 ['01','coneGeometry',q=>{const [r,h]=nums(q.text);return r/h;}],
 ['01','coneCut',q=>{const [r,h]=nums(q.text);return r/h;}],
 ['01','coneArea',q=>{const [r,h]=nums(q.text);return r/h;}],
 ['01','sphereCut',q=>{const [R,d]=nums(q.text);return d/R;}],
 ['02','obliquePrism',q=>{const [,edge,projection]=nums(q.text);return projection/edge;}],
 ['03','cone',q=>{const [r,h]=nums(q.text);return r/h;}],
 ['03','sphericalParts',q=>{const [R,d]=nums(q.text);return d/R;}],
 ['03','sphereSection',q=>{const [R,d]=nums(q.text);return d/R;}]
];
for(const [id,mode,ratio] of ratioCases){
 const values=Array.from({length:6},(_,i)=>ratio(pools[id](mode,i+1)[0]));
 check(values.every(v=>Number.isFinite(v)&&v>0),'valid positive ratios '+id+'/'+mode);
 check(new Set(values.map(v=>v.toFixed(8))).size>=2,'at least two geometrically different shapes '+id+'/'+mode);
}
for(let variant=1;variant<=60;variant++){
 let q=pools['01']('cylinderCut',variant),n=nums(q[0].text),chord=2*Math.sqrt(n[0]**2-n[1]**2);
 expected(q[0],int(chord,'cylinder chord'), '01 cylinder chord '+variant);
 n=nums(q[1].text);expected(q[1],int(2*Math.sqrt(n[0]**2-n[2]**2)*n[1],'cylinder section'),'01 cylinder section '+variant);
 q=pools['01']('coneGeometry',variant);n=nums(q[0].text);
 expected(q[0],int(Math.hypot(n[0],n[1]),'cone slant'),'01 cone slant '+variant);
 q=pools['01']('coneCut',variant);n=nums(q[0].text);
 const radius=n[0]*(n[1]-n[2])/n[1];
 expected(q[0],int(radius,'cone section radius'),'01 cone slice '+variant);
 q=pools['01']('coneArea',variant);n=nums(q[0].text);
 expected(q[0],pi(n[0]*Math.hypot(n[0],n[1])),'01 cone area '+variant);
 q=pools['01']('sphereCut',variant);n=nums(q[0].text);
 expected(q[0],int(Math.sqrt(n[0]**2-n[1]**2),'sphere radius'),'01 sphere slice '+variant);
 q=pools['02']('obliquePrism',variant);n=nums(q[0].text);
 const height=Math.sqrt(n[1]**2-n[2]**2);
 expected(q[0],int(n[0]*height,'oblique prism volume'),'02 prism volume '+variant);
 expected(q[1],int(height,'oblique prism height'),'02 prism height '+variant);
 q=pools['03']('cone',variant);n=nums(q[0].text);
 expected(q[0],pi(n[0]**2*n[1]/3),'03 cone volume '+variant);
 q=pools['03']('sphericalParts',variant);n=nums(q[0].text);
 const segmentHeight=n[0]-n[1];
 expected(q[0],int(segmentHeight,'segment height'),'03 segment height '+variant);
 expected(q[1],thirds(segmentHeight**2*(3*n[0]-segmentHeight)),'03 segment volume '+variant);
 expected(q[3],thirds(2*n[0]**2*segmentHeight),'03 sector volume '+variant);
 q=pools['03']('sphereSection',variant);n=nums(q[0].text);
 const sectionRadius=Math.sqrt(n[0]**2-n[1]**2);
 expected(q[0],int(sectionRadius,'section radius'),'03 sphere section radius '+variant);
 expected(q[2],pi(sectionRadius**2),'03 sphere section area '+variant);
 const whole=4*n[0]**3,part=segmentHeight**2*(3*n[0]-segmentHeight);
 expected(q[8],thirds(whole-part),'03 larger segment '+variant);
 expected(q[9],thirds(whole),'03 full sphere '+variant);
}
console.log('Grade 11 source banks 01–03: '+checks+' checks passed; 60 variants per mode, independently verified geometry and balanced control slots.');
