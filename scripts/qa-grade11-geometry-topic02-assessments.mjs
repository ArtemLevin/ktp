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
const indExpected=[
  [120,288,120,756,408],
  [168,240,144,350,330],
  [210,270,112,468,495],
  [180,64,400,336,300],
  [360,252,300,650,104],
  [240,200,180,1029,520]
];
const indErrors=['HEIGHT_EDGE','PYRAMID_FACTOR','SIMILAR_K2_K3','AREA_VOLUME','PROJECTION_LENGTH','FRUSTUM_AVERAGE'];
for(const [i,v] of A.topic.independent.variants.entries()){
  const t=v.tasks;
  check(t[0].points===1,'independent '+v.id+' concept point');
  check(t[1].skill==='PRISM_VOLUME','independent '+v.id+' prism');
  check(t[2].skill==='OBLIQUE_PRISM','independent '+v.id+' oblique prism');
  check(t[3].skill==='PYRAMID_VOLUME','independent '+v.id+' pyramid');
  check(t[4].skill==='FRUSTUM_VOLUME','independent '+v.id+' frustum');
  check(t[5].skill==='COMPOSITE_VOLUME','independent '+v.id+' composite');
  check(t[6].skill===indErrors[i]&&t[6].points===3,'independent '+v.id+' error slot');
  for(let j=0;j<5;j++)check(t[j+1].answer===String(indExpected[i][j])+'.','independent '+v.id+' numeric '+(j+1));
}

complete(A.topic.control,10,20);
const ctrlExpected=[
  ['360.','420.','288.','525.','h=12; V=192.','5:4.','528.','12.'],
  ['360.','224.','192.','504.','h=15; V=600.','216.','672.','9.'],
  ['420.','480.','240.','585.','h=12; V=192.','7:5.','570.','15.'],
  ['540.','180.','400.','686.','h=12; V=432.','125.','816.','12.'],
  ['330.','324.','480.','1300.','h=24; V=1536.','6:5.','920.','12.'],
  ['360.','400.','180.','1344.','h=15; V=630.','720.','850.','12.']
];
const ctrlErrors=['ERROR_FRUSTUM','HEIGHT_EDGE','PYRAMID_FACTOR','SIMILAR_K2_K3','UNIT_CONVERSION','PROJECTION_LENGTH'];
for(const [i,v] of A.topic.control.variants.entries()){
  const t=v.tasks;
  const skills=['PRISM_VOLUME','OBLIQUE_PRISM','PYRAMID_VOLUME','FRUSTUM_VOLUME','SECTION_VOLUME','SIMILAR_SOLIDS','COMPOSITE_VOLUME','INVERSE_VOLUME'];
  check(t[0].points===1,'control '+v.id+' concept point');
  for(let j=0;j<skills.length;j++){
    check(t[j+1].skill===skills[j],'control '+v.id+' skill '+skills[j]);
    check(t[j+1].answer===ctrlExpected[i][j],'control '+v.id+' answer '+(j+2));
  }
  check(t[9].skill===ctrlErrors[i]&&t[9].points===3,'control '+v.id+' error slot');
}

const all=[...A.topic.independent.variants.flatMap(v=>v.tasks),...A.topic.control.variants.flatMap(v=>v.tasks)];
check(all.length===102,'102 thematic tasks across 12 variants');
check(all.every(t=>!/(цилиндр|конус|шар|сфер)/i.test(t.text)),'assessment excludes bodies of revolution');
check(all.filter(t=>t.skill==='FRUSTUM_VOLUME').length===12,'frustum covered in every variant');
check(all.filter(t=>t.skill==='OBLIQUE_PRISM').length===12,'oblique prism covered in every variant');

const topic=read('content/11-geometry-atanasyan/02.js');
for(const token of [
  'assessments:{',
  'enabled:true',
  "independentHref:'../../assessments/11-geometry-atanasyan/02/independent.html'",
  "controlHref:'../../assessments/11-geometry-atanasyan/02/control.html'",
  '6 вариантов самостоятельной работы по 7 заданий / 14 баллов',
  '6 вариантов контрольной по 10 заданий / 20 баллов'
])check(topic.includes(token),'topic assessment contract '+token);

check(read('assessments/topic-links.js').includes("'11-geometry-atanasyan':{min:0,max:1}"),'topic-links grade 11 range');
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
check(countFiles(path.join(root,'assessments'),'data.js')===84,'aggregate thematic assessment count 84');

console.log('Grade 11 geometry topic 02 thematic assessment/math/structure QA passed: '+checks+' checks.');
