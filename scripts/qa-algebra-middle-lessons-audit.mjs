import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';

function loader(dir,uncompressed=[],packed=false){
 const ctx=vm.createContext({window:{},console,Math});
 for(const name of ['series.js',...uncompressed])vm.runInContext(fs.readFileSync(dir+'/'+name,'utf8'),ctx,{filename:dir+'/'+name});
 if(packed){
   let base64=ctx.window.KTP_COMPRESSED_LESSONS;
   assert.ok(base64,dir+' packed data missing');
   const bytes=Buffer.from(base64,'base64');
   let source;
   try{source=zlib.gunzipSync(bytes).toString('utf8');}
   catch(e){
     for(let trim=8;trim>=0;trim--){try{source=zlib.inflateRawSync(bytes.subarray(10,bytes.length-trim)).toString('utf8');break;}catch{}}
     assert.ok(source,dir+' gzip payload could not be decompressed');
   }
   vm.runInContext(source,ctx,{filename:dir+'/unpacked.js'});
 }
 return ctx.window.KTP_LESSON_SERIES;
}
const root='lessons/';
const lessons={};
lessons.g7=loader(root+'7-algebra-makarychev/04',['data/01.js']).lessons[0];
lessons.g8=loader(root+'8-algebra-makarychev/04',['assessment-factory.js','data/block-1.js']).lessons[0];
const g9dir=root+'9-algebra-makarychev/03';
const p9=Array.from({length:20},(_,i)=>'packed-'+String(i+1).padStart(2,'0')+'.js');
lessons.g9=loader(g9dir,[...p9,'packed-data.js'],true).lessons[0];
lessons.g10=loader(root+'10-algebra-alimov/05',['data.js'],true).lessons[0];
lessons.g11=loader(root+'11-algebra-alimov/04',['data/lessons-1.js','data/lessons-2.js','data/lessons-3.js','data/lessons-4.js','assessment-factory.js']).lessons[0];

for(const [key,l] of Object.entries(lessons)){
 assert.ok(l,'missing '+key);
 for(const a of ['id','title','theory','examples','practice','homework','independent','control'])assert.ok(l[a]!==undefined,key+' missing '+a);
 assert.equal(l.id,'01');
 for(const a of ['independent','control']){
  assert.equal(l[a].variants.length,6,key+' '+a+' variants');
  for(const v of l[a].variants){
   assert.ok(v.tasks.length>0);
   assert.equal(v.tasks.reduce((s,t)=>s+t.points,0),l[a].maxScore,key+' '+a+' score');
  }
 }
 const displayed=[...l.examples.map(e=>({text:e.problem,answer:e.answer})),...l.practice,...l.homework.required,...l.homework.optional,...l.independent.variants.flatMap(v=>v.tasks),...l.control.variants.flatMap(v=>v.tasks)];
 assert.ok(displayed.every(e=>e.text&&String(e.answer).trim()),key+' blank answer');
 const norms=new Map();for(const task of displayed){const k=task.text.replace(/[−-]?\d+(?:[,\.]\d+)?/g,'#');if(!norms.has(k))norms.set(k,{q:task.text,a:task.answer});}console.log('PATTERNS',JSON.stringify({key,count:norms.size,patterns:[...norms.values()]}));
 console.log('MIDDLE_LESSON',JSON.stringify({key,title:l.title,global:l.globalNumber,section:l.source?.section,total:displayed.length,prerequisites:l.prerequisites,examples:l.examples.slice(0,2),practice:l.practice.slice(0,8),required:l.homework.required.slice(0,6),optional:l.homework.optional.slice(0,2),independent:l.independent.variants[0].tasks,control:l.control.variants[0].tasks}));
}
console.log('Five algebra middle-lesson loaders/assessments initial QA PASS');
