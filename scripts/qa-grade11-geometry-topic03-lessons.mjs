import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let checks=0,taskCount=0;
const check=(condition,message)=>{checks++;if(!condition)throw Error(message);};

const ctx={window:{}};
ctx.KTP_REGISTER_CONTENT=(key,payload)=>{
  ctx.window.KTP_CONTENT=ctx.window.KTP_CONTENT||{};
  ctx.window.KTP_CONTENT[key]=payload;
};
ctx.window.KTP_CONTENT={};

for(const p of [
  'geometry/grade11-revolution-volume-scenes.js',
  'lessons/11-geometry-atanasyan/03/series.js',
  'lessons/11-geometry-atanasyan/03/question-bank.js',
  'lessons/11-geometry-atanasyan/03/scenes.js',
  'lessons/11-geometry-atanasyan/03/data.js',
  'content/11-geometry-atanasyan/03.js'
])vm.runInNewContext(read(p),ctx,{filename:p});

const S=ctx.window.KTP_LESSON_SERIES;
const T=ctx.window.KTP_CONTENT['11-geometry-atanasyan::2'];
const pool=ctx.window.KTP_G11_REVOLUTION_VOLUME_QUESTION_POOL;

check(S.meta.rowId==='11-geometry-atanasyan'&&S.meta.topicIndex===2,'topic identity');
check(S.meta.totalLessons===11&&S.lessons.length===11,'eleven lessons');
check(S.meta.courseLessonStart===22&&S.meta.courseLessonEnd===32,'global range 22-32');
check(S.meta.implementationStage==='3/5','stage 3 implementation marker');
check(Object.keys(S.revolutionScenes).length===11,'eleven lesson revolution scenes');
check(T?.theory?.length===11&&T.examples.length>=10,'thematic content retained');
check(T.lab.enabled===false&&T.lab.planned===true,'lab remains stage 4');
check(T.assessments.enabled===false&&T.assessments.planned===true,'thematic assessment remains stage 5');

const expectedModes=[
  'cylinder','cylinderComposite','cone','frustum','ball','sphericalParts',
  'sphereAreaVolume','sphereSection','similar','appliedComposite','diagnostic'
];
const sceneIds=[
  'g11-volrev-22-cylinder','g11-volrev-23-cylinder-cavity','g11-volrev-24-cone',
  'g11-volrev-25-frustum','g11-volrev-26-ball','g11-volrev-27-segment',
  'g11-volrev-28-sphere-area-volume','g11-volrev-29-section','g11-volrev-30-similarity',
  'g11-volrev-31-composite','g11-volrev-32-diagnostic'
];

for(const [i,L] of S.lessons.entries()){
  const local=i+1,id=String(local).padStart(2,'0'),global=22+i;
  check(L.id===id&&L.number===local&&L.globalNumber===global,id+' numbering');
  const route='lessons/11-geometry-atanasyan/03/'+id+'.html';
  check(fs.existsSync(route)&&read(route).includes('data-lesson="'+id+'"'),id+' route');
  check(read(route).includes('data-topic="2"'),id+' topic binding');
  check(read(route).includes('lesson-revolution.js')&&read(route).includes('revolution-scene.js'),id+' revolution runtime');
  check(L.objectives.length>=2&&L.theory.length>=2&&L.examples.length>=3&&L.mistakes.length>=5,id+' rich content');
  check(L.theory[0].revolutionFigure===sceneIds[i]&&S.revolutionScenes[sceneIds[i]],id+' scene reference');
  check(L.examples[0].revolutionFigure===sceneIds[i],id+' example scene reference');
  check(L.practice.length>=8&&L.homework.required.length>=6&&L.homework.optional.length>=2,id+' practice/homework');
  for(const q of [...L.practice,...L.homework.required,...L.homework.optional]){
    check(Boolean(q.text&&q.answer&&q.solution&&q.skill),id+' self-study fields');
  }
  for(const [kind,max,n] of [['independent',10,5],['control',14,6]]){
    const A=L[kind];
    check(A.variants.length===6&&A.maxScore===max,id+' '+kind+' variants/max score');
    const texts=new Set();
    for(const V of A.variants){
      check(V.tasks.length===n,id+' '+kind+' task count');
      check(V.tasks.reduce((sum,q)=>sum+q.points,0)===max,id+' '+kind+' point total');
      for(const q of V.tasks){
        check(Boolean(q.text&&q.answer&&q.solution&&q.skill&&q.points),id+' '+kind+' question fields');
        texts.add(q.text);
        taskCount++;
      }
    }
    check(texts.size>=n*3,id+' '+kind+' variant diversity');
  }
  check(L.source.assessment.includes('Пункт 56')&&L.source.assessment.includes('enrichment-only'),id+' integral source guard');
  check(L.source.assessment.includes('векторы и координаты'),'next-series boundary '+id);
}

check(taskCount===726,'726 assessed tasks across 132 variants');

const index=read('lessons/11-geometry-atanasyan/03/index.html');
for(const token of ['lesson-index.js','global-numbering.js','question-bank.js','grade11-revolution-volume-scenes.js','data.js'])check(index.includes(token),'index route '+token);

const topicRoute=read('topics/11-geometry-atanasyan/03.html');
for(const token of [
  'content/11-geometry-atanasyan/03.js',
  'geometry/grade11-revolution-volume-scenes.js',
  'lessons/11-geometry-atanasyan/03/topic-link.js',
  'geometry/revolution-math.js','geometry/revolution-scene.js'
])check(topicRoute.includes(token),'topic route '+token);
check(read('lessons/11-geometry-atanasyan/03/topic-link.js').includes('уроки 22–32'),'topic lesson link text');

for(const mode of expectedModes){
  const a=pool(mode,1);
  check(Array.isArray(a)&&a.length===10,mode+' pool size');
  for(const q of a)check(Boolean(q.text&&q.answer&&q.skill&&q.solution),mode+' pool fields');
}
for(let k=1;k<=15;k++){
  check(pool('cylinder',k)[0].answer===String((k+2)**2*(k+3))+'π.','cylinder k='+k);
  check(pool('cylinderComposite',k)[0].answer===String(((k+4)**2-(k+1)**2)*(k+2))+'π.','cylinder composite k='+k);
  check(pool('cone',k)[0].answer===String(12*k**3)+'π.','cone k='+k);
  const R=k+3,r=k+1,A=R*R+R*r+r*r;
  check(pool('frustum',k)[0].answer===String(A)+'π.','frustum k='+k);
  check(pool('ball',k)[0].answer===String(36*k**3)+'π.','ball k='+k);
  check(pool('sphericalParts',k)[0].answer===String(2*k)+'.','segment height k='+k);
  check(pool('sphericalParts',k)[2].answer===String(72*k**3)+'π.','layer k='+k);
  check(pool('sphereAreaVolume',k)[0].answer===String(36*k*k)+'π; '+String(36*k**3)+'π.','area-volume pair k='+k);
  check(pool('sphereSection',k)[0].answer===String(4*k)+'.','section radius k='+k);
  check(pool('similar',k)[0].answer===String((k+1)**3)+':'+String(k**3)+'.','similar k='+k);
  check(pool('appliedComposite',k)[0].answer===String(54*k**3)+'π.','composite k='+k);
  check(pool('diagnostic',k)[0].answer===String(36*k**3)+'π.','diagnostic cylinder k='+k);
}

check(pool('frustum',3)[2].answer==='V=1/3·πR²h — объём конуса.','frustum cone limit');
check(pool('frustum',3)[3].answer==='V=πR²h — объём цилиндра.','frustum cylinder limit');
check(pool('sphereSection',1)[8].answer==='448π/3.','large spherical segment');
check(pool('sphereSection',1)[9].answer==='500π/3.','two segments make ball');
check(pool('appliedComposite',2)[2].answer==='480π.','cylindrical cavity composite');
check(pool('diagnostic',2)[5].answer==='27:8.','diagnostic scale cube');

const lessonSource=read('lessons/11-geometry-atanasyan/03/data.js');
for(const token of [
  'Глава V, §2, п. 55',
  'Глава V, §3, п. 59',
  'Глава V, §4, п. 60',
  'Глава V, §4, п. 61',
  'Глава V, §4, пп. 60, 62* + ФРП-2025',
  'ФРП-2025: подобные тела и отношение объёмов'
])check(lessonSource.includes(token),'lesson source boundary '+token);

for(const forbidden of ['скалярное произведение','координаты вектора','уравнение плоскости']){
  check(!lessonSource.toLowerCase().includes(forbidden),'no future-series content '+forbidden);
}

console.log('Grade 11 geometry topic 03 lessons QA passed: '+checks+' checks, '+taskCount+' assessed tasks in 132 variants.');