import './qa-grade11-geometry-topic03-cognitive.mjs';
import {grade11GeometryProgress} from './grade11-geometry-progress.mjs';
const progress=grade11GeometryProgress();
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),exists=p=>fs.existsSync(path.join(root,p));
let checks=0;
const check=(condition,message)=>{checks++;if(!condition)throw Error(message);};

const assessment='assessments/11-geometry-atanasyan/03/data.js';
for(const p of [assessment,'assessments/11-geometry-atanasyan/03/independent.html','assessments/11-geometry-atanasyan/03/control.html'])check(exists(p),'missing '+p);
new vm.Script(read(assessment),{filename:assessment});
const context=vm.createContext({window:{},Math});
vm.runInContext(read(assessment),context,{filename:assessment});
const A=context.window.KTP_ASSESSMENT_DATA;

check(A.meta.rowId==='11-geometry-atanasyan'&&A.meta.topic==='03','assessment identity');
check(A.meta.grade===11&&A.meta.subject==='Геометрия','grade/subject');
check(A.topic.title==='Объёмы тел вращения','topic title');
for(const token of ['глава V','п. 55','пп. 59–62*','ФРП-2025','Пункт 56','не входит в обязательный контроль','векторы и координаты'])check(A.meta.sourceNote.includes(token),'source boundary '+token);

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
// The independent methodological script checks every problem family, numerical answer,
// scored cognitive step and explicit criterion across all twelve paper forms.
const indSkills=['VOLUME_SCALE','CYLINDER_VOLUME','CONE_SLANT','FRUSTUM_VOLUME','SPHERICAL_SECTOR','SIMILAR_SOLIDS','CONE_FACTOR'];
const ctrlSkills=['CYLINDER_CONE_RATIO','CYLINDER_VOLUME','CONE_SLANT','FRUSTUM_VOLUME','SPHERE_BALL','SPHERICAL_SEGMENT','SPHERICAL_LAYER','SIMILAR_SOLIDS','COMPOSITE_VOLUME','CYLINDER_CAVITY_REASONING'];
for(const [kind,expected] of [['independent',indSkills],['control',ctrlSkills]]){
 const work=A.topic[kind],reference=work.variants[0].tasks.map(q=>[q.skill,q.points,q.cognitive?.dok,q.cognitive?.family,q.cognitive?.method]);
 for(const form of work.variants){
  const actual=form.tasks.map(q=>[q.skill,q.points,q.cognitive?.dok,q.cognitive?.family,q.cognitive?.method]);
  check(JSON.stringify(actual)===JSON.stringify(reference),kind+' stable cognitive blueprint '+form.id);
  check(form.tasks.every((q,i)=>q.skill===expected[i]),kind+' aligned skill sequence '+form.id);
  check(form.tasks.every(q=>q.criteria?.length===q.points&&q.criteria.every(c=>c.points===1)),kind+' pointwise rubric '+form.id);
 }
}
const all=[...A.topic.independent.variants.flatMap(v=>v.tasks),...A.topic.control.variants.flatMap(v=>v.tasks)];
check(all.length===102,'102 thematic tasks across 12 variants');
check(all.filter(t=>t.skill==='FRUSTUM_VOLUME').length===12,'frustum covered in every variant');
check(all.filter(t=>t.skill==='SIMILAR_SOLIDS').length===12,'similarity covered in every variant');
check(all.filter(t=>t.skill==='SPHERICAL_LAYER').length===6,'layers covered in all controls');
check(all.filter(t=>t.skill==='SPHERICAL_SECTOR').length===6,'sectors covered in all independent works');
check(all.filter(t=>t.skill==='SPHERICAL_SEGMENT').length===6,'segments covered in all controls');
check(all.filter(t=>t.skill==='CYLINDER_CAVITY_REASONING').length===6,'proof correction in every control');
check(all.every(t=>!/(интеграл|скалярн|координат[ыа] вектора|уравнение плоскости)/i.test(t.text)),'assessment excludes integral/vector-coordinate methods');

const topic=read('content/11-geometry-atanasyan/03.js');
for(const token of [
  'assessments:{','enabled:true',
  "independentHref:'../../assessments/11-geometry-atanasyan/03/independent.html'",
  "controlHref:'../../assessments/11-geometry-atanasyan/03/control.html'",
  '6 вариантов самостоятельной работы по 7 заданий / 14 баллов',
  '6 вариантов контрольной по 10 заданий / 20 баллов'
])check(topic.includes(token),'topic assessment contract '+token);

check(read('assessments/topic-links.js').includes(`'11-geometry-atanasyan':{min:0,max:${progress.assessmentSeries-1}}`),'topic-links grade 11 range');
const route=read('topics/11-geometry-atanasyan/03.html');
check(route.includes('../../assessments/topic-links.js'),'topic route assessment injector');
for(const kind of ['independent','control']){
  const page=read('assessments/11-geometry-atanasyan/03/'+kind+'.html');
  check(page.includes('data-topic="03"')&&page.includes('data.js')&&page.includes('assessment-page.js'),kind+' route wiring');
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

console.log('Grade 11 geometry topic 03 thematic assessment/math/structure QA passed: '+checks+' checks.');