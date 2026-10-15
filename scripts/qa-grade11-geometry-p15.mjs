import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
let checks=0,exercises=0;
const check=(ok,message)=>{checks++;if(!ok)throw Error(message);};
const read=p=>fs.readFileSync(p,'utf8');
execFileSync(process.execPath,['scripts/build-grade11-student-assessments.mjs','--check'],{stdio:'pipe'});
const deps={
 '01':[],'02':[],'03':[],
 '04':['lessons/11-geometry-atanasyan/04/question-bank.js'],
 '05':['geometry/vector-math.js','geometry/coordinate-math.js','lessons/11-geometry-atanasyan/05/question-bank.js'],
 '06':['geometry/vector-math.js','geometry/coordinate-math.js','lessons/11-geometry-atanasyan/04/question-bank.js','lessons/11-geometry-atanasyan/05/question-bank.js','lessons/11-geometry-atanasyan/06/question-bank.js']
};
const allowed=new Set(['text','skill','points','position']);
for(const [topic,modules] of Object.entries(deps)){
 const source=vm.createContext({window:{},Math}),student=vm.createContext({window:{},Math});
 for(const p of [...modules,'assessments/11-geometry-atanasyan/'+topic+'/data.js'])vm.runInContext(read(p),source,{filename:p});
 vm.runInContext(read('assessments/11-geometry-atanasyan/'+topic+'/student-data.js'),student);
 const original=source.window.KTP_ASSESSMENT_DATA,published=student.window.KTP_ASSESSMENT_DATA;
 check(published.meta.topic===topic,topic+' identity');
 for(const kind of ['independent','control']){
  const a=original.topic[kind],b=published.topic[kind],label=topic+'/'+kind;
  check(a.variants.length===6&&b.variants.length===6,label+' forms');
  check(a.maxScore===b.maxScore&&a.duration===b.duration,label+' total/time');
  for(let v=0;v<6;v++){
   check(a.variants[v].tasks.length===b.variants[v].tasks.length,label+' count '+v);
   check(b.variants[v].tasks.reduce((sum,q)=>sum+q.points,0)===a.maxScore,label+' points '+v);
   for(let j=0;j<a.variants[v].tasks.length;j++){
    const src=a.variants[v].tasks[j],dest=b.variants[v].tasks[j];
    check(src.text===dest.text&&src.skill===dest.skill&&src.points===dest.points,label+' problem '+v+'/'+j);
    check(Object.keys(dest).every(k=>allowed.has(k)),label+' no solution properties '+v+'/'+j);
    exercises++;
   }
  }
  const page=read('assessments/11-geometry-atanasyan/'+topic+'/'+kind+'.html');
  check(page.includes('data-audience="student"')&&page.includes('src="student-data.js"'),label+' student entrypoint');
  check(!/src="data\.js"|question-bank\.js/.test(page),label+' answer code not requested');
 }
}
const renderer=read('assessments/assessment-page.js');
check(renderer.includes("const teacher=body.dataset.audience!=='student';"),'role switch');
check(renderer.includes('$'+'{teacher?keyHtml(v):'+String.fromCharCode(39,39)+'}'),'student key omitted from generated HTML');
check(read('.gitignore').includes('teacher-*.html'),'local workbooks ignored');
check(exercises===612,'all 612 items unchanged');
execFileSync(process.execPath,['scripts/export-grade11-teacher-pages.mjs'],{stdio:'pipe'});
for(const id of Object.keys(deps))for(const kind of ['independent','control']){
 const html=read('assessments/11-geometry-atanasyan/'+id+'/teacher-'+kind+'.html');
 check(html.includes('data-audience="teacher"')&&html.includes('src="data.js"'),'local teacher workbook '+id+'/'+kind);
 check(!html.includes('src="student-data.js"'),'teacher retains its own full source '+id+'/'+kind);
}
console.log('P1.5 grade11 student-teacher QA: '+checks+' checks, 612 preserved questions, 12 public and 12 local teacher pages.');
