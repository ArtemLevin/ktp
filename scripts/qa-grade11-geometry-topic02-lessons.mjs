import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let count=0,taskCount=0;
const check=(condition,message)=>{count++;if(!condition)throw Error(message);};

const ctx={window:{}};
ctx.KTP_REGISTER_CONTENT=(key,payload)=>{
  ctx.window.KTP_CONTENT=ctx.window.KTP_CONTENT||{};
  ctx.window.KTP_CONTENT[key]=payload;
};
ctx.window.KTP_CONTENT={};

for(const p of [
  'geometry/grade11-volume-scenes.js',
  'lessons/11-geometry-atanasyan/02/series.js',
  'lessons/11-geometry-atanasyan/02/question-bank.js',
  'lessons/11-geometry-atanasyan/02/scenes.js',
  'lessons/11-geometry-atanasyan/02/data.js',
  'content/11-geometry-atanasyan/02.js'
])vm.runInNewContext(read(p),ctx,{filename:p});

const S=ctx.window.KTP_LESSON_SERIES;
const T=ctx.window.KTP_CONTENT['11-geometry-atanasyan::1'];
const pool=ctx.window.KTP_G11_VOLUME_QUESTION_POOL;

check(S.meta.rowId==='11-geometry-atanasyan'&&S.meta.topicIndex===1,'topic identity');
check(S.meta.totalLessons===10&&S.lessons.length===10,'ten lessons');
check(S.meta.courseLessonStart===12&&S.meta.courseLessonEnd===21,'global range 12-21');
check(S.meta.implementationStage==='5/5','lesson and lab implementation stage');
check(Object.keys(S.spatialScenes).length===10,'ten lesson spatial scenes');
check(T?.theory?.length===10&&T.examples.length>=8,'thematic content retained');
check(T.lab.enabled===false&&T.lab.planned===true,'lab still planned');
check(T.assessments.enabled===true&&T.assessments.planned===false,'thematic assessment published');
for(const p of ['data.js','independent.html','control.html'])check(fs.existsSync(path.join(root,'assessments/11-geometry-atanasyan/02',p)),'assessment route '+p);

const expectedModes=['volumeBasics','box','prism','obliquePrism','pyramid','frustum','sectionVolume','similarSolids','composite','diagnostic'];
const sceneIds=[
  'g11-vol-01-unit','g11-vol-02-box','g11-vol-03-prism','g11-vol-04-oblique','g11-vol-05-pyramid',
  'g11-vol-06-frustum','g11-vol-07-section','g11-vol-08-similar','g11-vol-09-composite','g11-vol-10-diagnostic'
];

for(const [i,L] of S.lessons.entries()){
  const local=i+1,id=String(local).padStart(2,'0'),global=12+i;
  check(L.id===id&&L.number===local&&L.globalNumber===global,id+' numbering');
  const route='lessons/11-geometry-atanasyan/02/'+id+'.html';
  check(fs.existsSync(route)&&read(route).includes('data-lesson="'+id+'"'),id+' route');
  check(read(route).includes('data-topic="1"'),id+' topic binding');
  check(L.objectives.length>=2&&L.theory.length>=2&&L.examples.length>=3&&L.mistakes.length>=4,id+' rich content');
  check(L.theory[0].spatialFigure===sceneIds[i]&&S.spatialScenes[sceneIds[i]],id+' spatial reference');
  check(L.examples[0].spatialFigure===sceneIds[i],id+' example spatial reference');
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
}

check(taskCount===660,'660 assessed tasks across 120 variants');

const index=read('lessons/11-geometry-atanasyan/02/index.html');
for(const token of ['lesson-index.js','global-numbering.js','question-bank.js','grade11-volume-scenes.js','data.js'])check(index.includes(token),'index route '+token);

const topicRoute=read('topics/11-geometry-atanasyan/02.html');
for(const token of ['content/11-geometry-atanasyan/02.js','geometry/grade11-volume-scenes.js','lessons/11-geometry-atanasyan/02/topic-link.js','geometry/spatial-scene.js'])check(topicRoute.includes(token),'topic route '+token);
check(read('lessons/11-geometry-atanasyan/02/topic-link.js').includes('уроки 12–21'),'topic lesson link text');

for(const mode of expectedModes){
  const a=pool(mode,1);
  check(Array.isArray(a)&&a.length===10,mode+' pool size');
  for(const q of a)check(Boolean(q.text&&q.answer&&q.skill&&q.solution),mode+' pool fields');
}

for(let k=1;k<=15;k++){
  const a=k+1,b=k+2,c=2;
  check(pool('volumeBasics',k)[0].answer===String(a*b*c)+'.','volumeBasics k='+k);
  check(pool('box',k)[0].answer===String((k+2)*(k+3)*(k+4))+'.','box k='+k);
  check(pool('prism',k)[0].answer===String(k*(k+3)*(k+4))+'.','prism k='+k);
  check(pool('obliquePrism',k)[0].answer===String(24*k*k)+'.','obliquePrism k='+k);
  check(pool('obliquePrism',k)[1].answer===String(4*k)+'.','oblique height k='+k);
  check(pool('pyramid',k)[0].answer===String(12*k*k)+'.','pyramid k='+k);
  check(pool('frustum',k)[0].answer===String(28*k*k*k)+'.','frustum k='+k);
  check(pool('sectionVolume',k)[0].answer===String(24*k*k)+'.','section volume k='+k);
  check(pool('similarSolids',k)[0].answer===String((k+1)**3)+':'+String(k**3)+'.','similar solids k='+k);
  check(pool('composite',k)[0].answer===String(408*k*k*k)+'.','composite k='+k);
  check(pool('diagnostic',k)[0].answer===String(60*k*k)+'.','diagnostic k='+k);
}

check(pool('frustum',2)[5].answer==='В V=Sh — формулу призмы.','frustum equal-base limit');
check(pool('frustum',2)[6].answer==='V=1/3·S₁h — объём пирамиды.','frustum zero-top limit');
check(pool('similarSolids',3)[3].answer==='125:64.','area-to-volume scale chain');
check(pool('diagnostic',4)[4].answer==='336.','diagnostic frustum numeric result');

const lessonSource=read('lessons/11-geometry-atanasyan/02/data.js');
for(const token of [
  'Глава V, §1, п. 52',
  'Глава V, §1, п. 53',
  'Глава V, §1, п. 54',
  'Глава V, §3, п. 57',
  'Глава V, §3, п. 58',
  'Глава III, п. 34 + глава V, п. 58',
  'ФРП-2025: отношение объёмов подобных фигур'
])check(lessonSource.includes(token),'lesson source boundary '+token);

for(const forbidden of ['Vцил=','Vкон=','Vшара=','4/3·πr³'])check(!lessonSource.includes(forbidden),'no future-series formula '+forbidden);

console.log('Grade 11 geometry topic 02 lessons QA passed: '+count+' checks, '+taskCount+' assessed tasks in 120 variants.');
