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
const indExpected=[
 ['45π.','32π.','39π.','52π/3.','5:4.'],
 ['96π.','h=12; 100π.','84π.','36π.','76π/3.'],
 ['84π.','96π.','57π.','ρ=4; 52π/3.','7:5.'],
 ['36π.','30π.','56π.','72π.','42π.'],
 ['8.','75π.','112π.','64π.','2:1.'],
 ['135π.','h=15; 320π.','98π.','72π.','88π/3.']
];
const indErrors=['CONE_FACTOR','DIAMETER_RADIUS','SIMILAR_K2_K3','FRUSTUM_AVERAGE','SEGMENT_HEIGHT','VOLUME_UNITS'];
for(const [i,v] of A.topic.independent.variants.entries()){
  const t=v.tasks;
  check(t[0].points===1,'independent '+v.id+' concept point');
  check(t[1].skill.startsWith('CYLINDER'),'independent '+v.id+' cylinder');
  check(t[2].skill.startsWith('CONE'),'independent '+v.id+' cone');
  check(t[3].skill==='FRUSTUM_VOLUME','independent '+v.id+' frustum');
  check(['SPHERICAL_SEGMENT','SPHERICAL_SECTOR','SPHERICAL_LAYER','SPHERE_AREA','BALL_VOLUME'].includes(t[4].skill),'independent '+v.id+' sphere part');
  check(['SIMILAR_SOLIDS','COMPOSITE_VOLUME'].includes(t[5].skill),'independent '+v.id+' transfer');
  check(t[6].skill===indErrors[i]&&t[6].points===3,'independent '+v.id+' error slot');
  for(let j=0;j<5;j++)check(t[j+1].answer===indExpected[i][j],'independent '+v.id+' answer '+(j+2));
}

complete(A.topic.control,10,20);
const ctrlExpected=[
 ['80π.','h=4; 12π.','78π.','S=36π; V=36π.','52π/3.','72π.','5:4.','76π/3.'],
 ['100π.','h=12; 100π.','63π.','S=64π; V=256π/3.','45π.','72π.','2:1.','57π.'],
 ['72π.','h=15; 320π.','114π.','S=100π; V=500π/3.','14π/3.','100π/3.','7:5.','160π.'],
 ['108π.','h=24; 392π.','84π.','S=144π; V=288π.','320π/3.','105π.','2:1.','54π.'],
 ['48π.','h=21; 2800π.','224π.','S=16π; V=32π/3.','40π/3.','128π/3.','3:2.','112π.'],
 ['98π.','h=35; 1680π.','196π.','S=196π; V=1372π/3.','416π/3.','284π/3.','8:5.','96π.']
];
const ctrlErrors=['CONE_SLANT','AREA_VOLUME','FRUSTUM_AVERAGE','DIAMETER_RADIUS','SIMILAR_K2_K3','PROJECTION_METRIC'];
for(const [i,v] of A.topic.control.variants.entries()){
  const t=v.tasks;
  check(t[0].points===1,'control '+v.id+' concept point');
  const skills=['CYLINDER','CONE_SLANT','FRUSTUM_VOLUME','SPHERE_BALL','SPHERICAL_SEGMENT'];
  check(t[1].skill.startsWith(skills[0]),'control '+v.id+' cylinder');
  for(let j=1;j<skills.length;j++)check(t[j+1].skill===skills[j],'control '+v.id+' skill '+skills[j]);
  check(['SPHERICAL_SECTOR','SPHERICAL_LAYER'].includes(t[6].skill),'control '+v.id+' sphere part 2');
  check(t[7].skill==='SIMILAR_SOLIDS','control '+v.id+' similar');
  check(['COMPOSITE_VOLUME','CYLINDER_CAVITY'].includes(t[8].skill),'control '+v.id+' composite');
  check(t[9].skill===ctrlErrors[i]&&t[9].points===3,'control '+v.id+' error slot');
  for(let j=0;j<8;j++)check(t[j+1].answer===ctrlExpected[i][j],'control '+v.id+' answer '+(j+2));
}

const all=[...A.topic.independent.variants.flatMap(v=>v.tasks),...A.topic.control.variants.flatMap(v=>v.tasks)];
check(all.length===102,'102 thematic tasks across 12 variants');
check(all.filter(t=>t.skill==='FRUSTUM_VOLUME').length===12,'frustum covered in every variant');
check(all.filter(t=>t.skill==='SIMILAR_SOLIDS').length===10,'similarity coverage');
check(all.some(t=>t.skill==='SPHERICAL_LAYER')&&all.some(t=>t.skill==='SPHERICAL_SECTOR')&&all.some(t=>t.skill==='SPHERICAL_SEGMENT'),'all spherical-part types covered');
check(all.every(t=>!/(интеграл|скалярн|координат[ыа] вектора|уравнение плоскости)/i.test(t.text)),'assessment excludes integral/vector-coordinate methods');

const topic=read('content/11-geometry-atanasyan/03.js');
for(const token of [
  'assessments:{','enabled:true',
  "independentHref:'../../assessments/11-geometry-atanasyan/03/independent.html'",
  "controlHref:'../../assessments/11-geometry-atanasyan/03/control.html'",
  '6 вариантов самостоятельной работы по 7 заданий / 14 баллов',
  '6 вариантов контрольной по 10 заданий / 20 баллов'
])check(topic.includes(token),'topic assessment contract '+token);

check(read('assessments/topic-links.js').includes("'11-geometry-atanasyan':{min:0,max:2}"),'topic-links grade 11 range');
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
check(countFiles(path.join(root,'assessments'),'data.js')===84,'aggregate thematic assessment count 84');

console.log('Grade 11 geometry topic 03 thematic assessment/math/structure QA passed: '+checks+' checks.');