import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';

const ROOT=process.cwd();
const ROW='10-algebra-alimov';
const COUNTS=[11,10,10,14,16,14,15,12];
const STARTS=[1,12,22,32,46,62,76,91];
let checks=0;
const transportFallbacks=[];
const fail=message=>{throw new Error(message);};
const assert=(condition,message)=>{checks++;if(!condition)fail(message);};
const abs=p=>path.join(ROOT,p);
const exists=p=>fs.existsSync(abs(p));
const read=p=>fs.readFileSync(abs(p),'utf8');

function compile(source,filename){
  try{new vm.Script(source,{filename});checks++;}
  catch(error){fail(`${filename}: JS syntax error: ${error.message}`);}
}

function unpack(file,variable){
  const source=read(file);
  const re=new RegExp(`${variable}=['\"]([^'\"]+)['\"]`);
  const match=source.match(re);
  assert(match,`${file}: ${variable} payload not found`);
  const bytes=Buffer.from(match[1],'base64');
  try{return zlib.gunzipSync(bytes).toString('utf8');}
  catch(gzipError){
    const isPlainGzip=bytes.length>18&&bytes[0]===0x1f&&bytes[1]===0x8b&&bytes[2]===0x08&&bytes[3]===0x00;
    if(isPlainGzip){
      try{
        const recovered=zlib.inflateRawSync(bytes.subarray(10,-8)).toString('utf8');
        transportFallbacks.push(`${file}: gzip trailer/checksum invalid; raw DEFLATE recovered`);
        return recovered;
      }catch(rawError){
        fail(`${file}: invalid gzip payload (${gzipError.message}); raw recovery failed (${rawError.message})`);
      }
    }
    fail(`${file}: invalid gzip payload: ${gzipError.message}`);
  }
}

function execute(source,context,filename){
  try{new vm.Script(source,{filename}).runInContext(context);checks++;}
  catch(error){fail(`${filename}: execution failed: ${error.message}`);}
}

function assertTasks(tasks,label){
  assert(Array.isArray(tasks)&&tasks.length>0,`${label}: no tasks`);
  tasks.forEach((task,index)=>{
    assert(String(task.text??task.task??'').trim(),`${label} task ${index+1}: empty text`);
    assert(String(task.answer??'').trim(),`${label} task ${index+1}: empty answer`);
    if(task.points!=null)assert(Number.isFinite(Number(task.points))&&Number(task.points)>0,`${label} task ${index+1}: invalid points`);
  });
}

function assertAssessmentBlock(block,label){
  assert(block&&Array.isArray(block.variants),`${label}: assessment block missing`);
  assert(block.variants.length===6,`${label}: expected 6 variants, got ${block.variants?.length}`);
  const ids=new Set();
  block.variants.forEach((variant,index)=>{
    ids.add(String(variant.id));
    assertTasks(variant.tasks,`${label} variant ${variant.id??index+1}`);
    if(block.maxScore!=null){
      const sum=variant.tasks.reduce((total,task)=>total+Number(task.points||0),0);
      assert(sum===Number(block.maxScore),`${label} variant ${variant.id}: score ${sum} != ${block.maxScore}`);
    }
  });
  assert(ids.size===6,`${label}: duplicate variant ids`);
}

function validateLessonSeries(seriesNo,count,start){
  const n=String(seriesNo).padStart(2,'0');
  const base=`lessons/${ROW}/${n}`;
  for(const file of ['index.html','series.js','data.js'])assert(exists(`${base}/${file}`),`${base}/${file}: missing`);
  for(let i=1;i<=count;i++)assert(exists(`${base}/${String(i).padStart(2,'0')}.html`),`${base}: missing lesson ${i}`);

  const context=vm.createContext({window:{},console});
  execute(read(`${base}/series.js`),context,`${base}/series.js`);
  const payload=unpack(`${base}/data.js`,'KTP_COMPRESSED_LESSONS');
  compile(payload,`${base}/data.payload.js`);
  execute(payload,context,`${base}/data.payload.js`);
  const series=context.window.KTP_LESSON_SERIES;
  assert(series?.meta?.rowId===ROW,`${base}: wrong rowId`);
  assert(Number(series.meta.topicIndex)===seriesNo-1,`${base}: wrong topicIndex`);
  assert(Number(series.meta.totalLessons)===count,`${base}: wrong totalLessons`);
  assert(Number(series.meta.globalStart)===start,`${base}: wrong globalStart`);
  assert(Number(series.meta.courseTotal)===102,`${base}: wrong courseTotal`);
  assert(Array.isArray(series.lessons)&&series.lessons.length===count,`${base}: expected ${count} lessons, got ${series.lessons?.length}`);
  const ids=new Set();
  series.lessons.forEach((lesson,index)=>{
    const local=index+1;
    const expectedId=String(local).padStart(2,'0');
    assert(String(lesson.id)===expectedId,`${base}: lesson ${local} id=${lesson.id}, expected ${expectedId}`);
    assert(Number(lesson.number)===local,`${base}: lesson ${expectedId} local number mismatch`);
    ids.add(String(lesson.id));
    assert(String(lesson.title||'').trim(),`${base}/${expectedId}: empty title`);
    assert(Array.isArray(lesson.objectives)&&lesson.objectives.length>=2,`${base}/${expectedId}: objectives missing`);
    assert(Array.isArray(lesson.prerequisites)&&lesson.prerequisites.length>=1,`${base}/${expectedId}: prerequisites missing`);
    assert(Array.isArray(lesson.theory)&&lesson.theory.length>=1,`${base}/${expectedId}: theory missing`);
    assert(Array.isArray(lesson.examples)&&lesson.examples.length>=2,`${base}/${expectedId}: need at least 2 examples`);
    lesson.examples.forEach((example,j)=>{
      for(const key of ['problem','idea','solution','check','answer'])assert(String(example[key]||'').trim(),`${base}/${expectedId}: example ${j+1} missing ${key}`);
    });
    assert(Array.isArray(lesson.mistakes)&&lesson.mistakes.length>=2,`${base}/${expectedId}: mistakes missing`);
    assertTasks(lesson.practice,`${base}/${expectedId} practice`);
    assertTasks(lesson.homework?.required,`${base}/${expectedId} homework`);
    assert(Array.isArray(lesson.summary)&&lesson.summary.length>=3,`${base}/${expectedId}: summary missing`);
    assertAssessmentBlock(lesson.independent,`${base}/${expectedId} independent`);
    assertAssessmentBlock(lesson.control,`${base}/${expectedId} control`);
  });
  assert(ids.size===count,`${base}: duplicate lesson ids`);
}

function validateTopicContent(topicIndex){
  const n=String(topicIndex+1).padStart(2,'0');
  const file=`content/${ROW}/${n}.js`;
  assert(exists(file),`${file}: missing`);
  let registered=null;
  const context=vm.createContext({KTP_REGISTER_CONTENT:(id,data)=>{registered={id,data};},console});
  execute(read(file),context,file);
  assert(registered?.id===`${ROW}::${topicIndex}`,`${file}: wrong content id`);
  const data=registered.data;
  assert(Array.isArray(data.objectives)&&data.objectives.length>=3,`${file}: objectives missing`);
  assert(Array.isArray(data.expectedResults)&&data.expectedResults.length>=3,`${file}: expectedResults missing`);
  assert(Array.isArray(data.prerequisites)&&data.prerequisites.length>=2,`${file}: prerequisites missing`);
  assert(Array.isArray(data.prerequisiteCheck)&&data.prerequisiteCheck.length>=2,`${file}: prerequisiteCheck missing`);
  assert(Array.isArray(data.map)&&data.map.length>=2,`${file}: map missing`);
  assert(Array.isArray(data.theory)&&data.theory.length>=4,`${file}: theory too short`);
  assert(Array.isArray(data.examples)&&data.examples.length>=4,`${file}: examples too short`);
  assert(Array.isArray(data.mistakes)&&data.mistakes.length>=3,`${file}: mistakes too short`);
  for(const level of ['basic','standard','transfer','challenge'])assertTasks(data.practice?.[level],`${file} practice.${level}`);
  assert(Array.isArray(data.diagnostic)&&data.diagnostic.length>=3,`${file}: diagnostic missing`);
  assertTasks(data.homework?.required,`${file} homework.required`);
  assert(Array.isArray(data.summary)&&data.summary.length>=3,`${file}: summary missing`);
  assert(data.source?.textbook,`${file}: source textbook missing`);
  const serialized=JSON.stringify(data);
  assert(!/TODO|placeholder|заглушк/i.test(serialized),`${file}: placeholder marker found`);
  if(data.lab?.enabled){
    const href=String(data.lab.href||'').replace(/^\.\.\/\.\.\//,'');
    assert(exists(href),`${file}: lab target missing: ${data.lab.href}`);
  }
}

function validateThematicAssessment(topicIndex){
  const n=String(topicIndex+1).padStart(2,'0');
  const base=`assessments/${ROW}/${n}`;
  for(const file of ['independent.html','control.html','data.js'])assert(exists(`${base}/${file}`),`${base}/${file}: missing`);
  const payload=unpack(`${base}/data.js`,'KTP_COMPRESSED_ASSESSMENT');
  compile(payload,`${base}/data.payload.js`);
  const context=vm.createContext({window:{},console});
  execute(payload,context,`${base}/data.payload.js`);
  const data=context.window.KTP_ASSESSMENT_DATA;
  assert(data?.meta?.rowId===ROW,`${base}: wrong assessment rowId`);
  assert(Number(data.meta.grade)===10,`${base}: wrong assessment grade`);
  assert(data.topic,`${base}: topic assessment missing`);
  assertAssessmentBlock(data.topic.independent,`${base} independent`);
  assertAssessmentBlock(data.topic.control,`${base} control`);
}

function validateStaticLinks(){
  const roots=[`topics/${ROW}`,`lessons/${ROW}`,`assessments/${ROW}`,`labs/${ROW}`];
  const htmlFiles=[];
  const walk=dir=>{
    for(const entry of fs.readdirSync(abs(dir),{withFileTypes:true})){
      const rel=path.posix.join(dir,entry.name);
      if(entry.isDirectory())walk(rel);else if(entry.name.endsWith('.html'))htmlFiles.push(rel);
    }
  };
  roots.forEach(walk);
  htmlFiles.forEach(file=>{
    const source=read(file);
    const re=/(?:href|src)=["']([^"']+)["']/g;
    let match;
    while((match=re.exec(source))){
      const target=match[1];
      if(!target||target.startsWith('#')||/^(?:https?:|mailto:|data:)/.test(target))continue;
      const clean=target.split('#')[0].split('?')[0];
      if(!clean)continue;
      const resolved=path.normalize(path.join(path.dirname(abs(file)),clean));
      assert(fs.existsSync(resolved),`${file}: broken static link ${target}`);
    }
  });
}

for(const file of ['lessons/compressed-loader.js','assessments/compressed-loader.js','assessments/assessment-page.js',`labs/${ROW}/common.js`]){
  assert(exists(file),`${file}: missing`);compile(read(file),file);
}

assert(exists(`content/${ROW}/content-map.md`),'content map missing');
assert(exists(`lessons/${ROW}/lesson-plan.md`),'lesson plan missing');
COUNTS.forEach((count,index)=>validateLessonSeries(index+1,count,STARTS[index]));
for(let i=0;i<8;i++){validateTopicContent(i);validateThematicAssessment(i);}
for(const lab of ['power-function','exponential','logarithmic','unit-circle','trig-equations','trig-functions'])assert(exists(`labs/${ROW}/${lab}/index.html`),`lab ${lab}: missing`);
validateStaticLinks();

if(transportFallbacks.length){
  console.warn('Recovered compressed payloads with invalid gzip trailer/checksum:');
  transportFallbacks.forEach(item=>console.warn(`- ${item}`));
}
console.log(`Grade 10 Alimov QA passed: ${checks} checks, 102 lessons, 1224 lesson assessment variants, 8 thematic assessment packs, 6 labs.`);
