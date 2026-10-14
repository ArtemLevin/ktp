import './qa-grade11-geometry-topic01-02-cognitive.mjs';
import {grade11GeometryProgress} from './grade11-geometry-progress.mjs';
const progress=grade11GeometryProgress();
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
let checks=0;
const check=(condition,message)=>{checks++;if(!condition)throw Error(message);};

const assessment='assessments/11-geometry-atanasyan/02/data.js';
for(const p of [
  assessment,
  'assessments/11-geometry-atanasyan/02/independent.html',
  'assessments/11-geometry-atanasyan/02/control.html'
])check(exists(p),'missing '+p);

new vm.Script(read(assessment),{filename:assessment});
const context=vm.createContext({window:{}});
vm.runInContext(read(assessment),context,{filename:assessment});
const A=context.window.KTP_ASSESSMENT_DATA;

check(A.meta.rowId==='11-geometry-atanasyan'&&A.meta.topic==='02','assessment identity');
check(A.meta.grade===11&&A.meta.subject==='Геометрия','grade/subject');
check(A.topic.title==='Объёмы многогранников','topic title');
for(const token of ['глава V','§§1–3','пп. 52–54, 57–58','главу III, п. 34','ФРП-2025','серии 03'])check(A.meta.sourceNote.includes(token),'source boundary '+token);

function complete(work,count,max){
  check(work.variants.length===6,'six variants');
  check(work.maxScore===max,'max score '+max);
  const signatures=new Set();
  for(const v of work.variants){
    check(v.tasks.length===count,'variant '+v.id+' task count');
    check(v.tasks.reduce((s,t)=>s+t.points,0)===max,'variant '+v.id+' points');
    check(v.tasks.every(t=>t.text&&t.answer&&t.solution&&t.skill&&Number.isInteger(t.points)&&t.points>0),'variant '+v.id+' complete fields');
    signatures.add(JSON.stringify(v.tasks.map(t=>[t.text,t.answer,t.skill,t.points])));
  }
  check(signatures.size===6,'six distinct variants');
}

complete(A.topic.independent,7,14);
complete(A.topic.control,10,20);
// Deep mathematical and rubric checks are implemented by the imported independent QA.
const blueprint={
 independent:['VOLUME_SCALE','PRISM_VOLUME','OBLIQUE_PRISM','PYRAMID_VOLUME','FRUSTUM_VOLUME','COMPOSITE_VOLUME','ERROR_OBLIQUE_HEIGHT'],
 control:['VOLUME_SCALE','PRISM_VOLUME','OBLIQUE_PRISM','PYRAMID_VOLUME','FRUSTUM_VOLUME','SECTION_VOLUME','SIMILAR_SOLIDS','COMPOSITE_VOLUME','INVERSE_VOLUME','ERROR_FRUSTUM_MEAN']
};
for(const kind of ['independent','control']){
 const forms=A.topic[kind].variants,reference=forms[0].tasks.map(q=>[q.skill,q.points,q.cognitive?.dok,q.cognitive?.family,q.cognitive?.method]);
 for(const v of forms){
  check(JSON.stringify(v.tasks.map(q=>[q.skill,q.points,q.cognitive?.dok,q.cognitive?.family,q.cognitive?.method]))===JSON.stringify(reference),'same cognitive blueprint '+kind+'/'+v.id);
  v.tasks.forEach((q,i)=>{
   check(q.skill===blueprint[kind][i],kind+' skill slot '+v.id+'/'+i);
   check(q.criteria?.length===q.points&&q.criteria.every(c=>c.points===1),kind+' pointwise rubric '+v.id+'/'+i);
  });
 }
}
const all=[...A.topic.independent.variants.flatMap(v=>v.tasks),...A.topic.control.variants.flatMap(v=>v.tasks)];
check(all.length===102,'102 thematic tasks across 12 variants');
check(all.every(t=>!/(цилиндр|конус|шар|сфер)/i.test(t.text)),'assessment excludes bodies of revolution');
check(all.filter(t=>t.skill==='FRUSTUM_VOLUME').length===12,'frustum covered in every variant');
check(all.filter(t=>t.skill==='OBLIQUE_PRISM').length===12,'oblique prism covered in every variant');
check(all.filter(t=>t.skill==='SECTION_VOLUME').length===6,'working section covered in all controls');
check(all.filter(t=>t.skill==='ERROR_FRUSTUM_MEAN').length===6,'proof of frustum volume covered');

const topic=read('content/11-geometry-atanasyan/02.js');
for(const token of [
  'assessments:{',
  'enabled:true',
  "independentHref:'../../assessments/11-geometry-atanasyan/02/independent.html'",
  "controlHref:'../../assessments/11-geometry-atanasyan/02/control.html'",
  '6 вариантов самостоятельной работы по 7 заданий / 14 баллов',
  '6 вариантов контрольной по 10 заданий / 20 баллов'
])check(topic.includes(token),'topic assessment contract '+token);

check(read('assessments/topic-links.js').includes(`'11-geometry-atanasyan':{min:0,max:${progress.assessmentSeries-1}}`),'topic-links grade 11 range');
for(const kind of ['independent','control']){
  const route=read('assessments/11-geometry-atanasyan/02/'+kind+'.html');
  check(route.includes('data-topic="02"')&&route.includes('data.js')&&route.includes('assessment-page.js'),kind+' route wiring');
}

function countFiles(dir,name){
  let total=0;
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())total+=countFiles(full,name);
    else if(entry.isFile()&&entry.name===name)total++;
  }
  return total;
}
check(countFiles(path.join(root,'assessments'),'data.js')===progress.totalAssessments,'current aggregate thematic assessment count');

console.log('Grade 11 geometry topic 02 thematic assessment/math/structure QA passed: '+checks+' checks.');
