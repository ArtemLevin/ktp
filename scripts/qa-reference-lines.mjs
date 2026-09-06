import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';

const ROOT=process.cwd();
const COURSE_TOTAL=102;
const LINES=[
  {row:'7-algebra-makarychev',grade:7,topics:7,counts:[18,11,12,18,18,13,12]},
  {row:'8-algebra-makarychev',grade:8,topics:7,counts:[15,15,27,12,13,8,12]},
  {row:'9-algebra-makarychev',grade:9,topics:6,counts:[18,16,20,20,16,12]},
  {row:'10-algebra-alimov',grade:10,topics:8,counts:[11,10,10,14,16,14,15,12]},
  {row:'11-algebra-alimov',grade:11,topics:7,counts:[16,16,13,10,8,12,27]}
];
let checks=0;
const transportFallbacks=[];
const assert=(condition,message)=>{checks++;if(!condition)throw new Error(message);};
const abs=p=>path.join(ROOT,p);
const exists=p=>fs.existsSync(abs(p));
const read=p=>fs.readFileSync(abs(p),'utf8');
const rel=(from,target)=>path.normalize(path.join(path.dirname(from),target)).replaceAll('\\','/');

function compile(source,filename){
  try{new vm.Script(source,{filename});checks++;}
  catch(error){throw new Error(`${filename}: JS syntax error: ${error.message}`);}
}
function execute(source,context,filename){
  try{new vm.Script(source,{filename}).runInContext(context);checks++;}
  catch(error){throw new Error(`${filename}: execution failed: ${error.message}`);}
}
function extractCompressed(source,variable,file){
  const re=new RegExp(`${variable}\\s*=\\s*['\"]([^'\"]+)['\"]`);
  const match=source.match(re);
  assert(match,`${file}: ${variable} payload not found`);
  return Buffer.from(match[1],'base64');
}
function gunzip(bytes,file){
  try{return zlib.gunzipSync(bytes).toString('utf8');}
  catch(gzipError){
    const plainGzip=bytes.length>18&&bytes[0]===0x1f&&bytes[1]===0x8b&&bytes[2]===0x08&&bytes[3]===0x00;
    if(!plainGzip)throw new Error(`${file}: invalid gzip payload: ${gzipError.message}`);
    try{
      const recovered=zlib.inflateRawSync(bytes.subarray(10,-8)).toString('utf8');
      transportFallbacks.push(`${file}: gzip trailer/checksum invalid; raw DEFLATE recovered`);
      return recovered;
    }catch(rawError){
      throw new Error(`${file}: invalid gzip payload (${gzipError.message}); raw recovery failed (${rawError.message})`);
    }
  }
}
function executeMaybeCompressed(source,context,filename){
  if(/KTP_COMPRESSED_LESSONS\s*=\s*['\"]/.test(source)){
    const payload=gunzip(extractCompressed(source,'KTP_COMPRESSED_LESSONS',filename),filename);
    compile(payload,`${filename}#payload`);
    execute(payload,context,`${filename}#payload`);
    return;
  }
  if(/KTP_COMPRESSED_ASSESSMENT\s*=\s*['\"]/.test(source)){
    const payload=gunzip(extractCompressed(source,'KTP_COMPRESSED_ASSESSMENT',filename),filename);
    compile(payload,`${filename}#payload`);
    execute(payload,context,`${filename}#payload`);
    return;
  }
  compile(source,filename);
  execute(source,context,filename);
}
function scanValues(value,label,seen=new Set()){
  if(value===undefined)throw new Error(`${label}: undefined value`);
  if(typeof value==='number')assert(Number.isFinite(value),`${label}: non-finite number ${value}`);
  if(typeof value==='string')assert(!/\b(?:NaN|Infinity|undefined)\b/.test(value),`${label}: forbidden runtime token in string`);
  if(!value||typeof value!=='object')return;
  if(seen.has(value))return;seen.add(value);
  if(Array.isArray(value)){value.forEach((item,i)=>scanValues(item,`${label}[${i}]`,seen));return;}
  Object.entries(value).forEach(([key,item])=>scanValues(item,`${label}.${key}`,seen));
}
function assertTaskArray(tasks,label,{points=false}={}){
  assert(Array.isArray(tasks)&&tasks.length>0,`${label}: no tasks`);
  tasks.forEach((task,index)=>{
    const text=String(task?.text??task?.task??task??'').trim();
    assert(text,`${label} task ${index+1}: empty text`);
    if(task&&typeof task==='object'){
      assert(String(task.answer??'').trim(),`${label} task ${index+1}: empty answer`);
      if(points){
        const p=Number(task.points);
        assert(Number.isFinite(p)&&p>0,`${label} task ${index+1}: invalid points`);
      }
    }
  });
}
function assertAssessment(block,label){
  assert(block&&Array.isArray(block.variants),`${label}: assessment block missing`);
  assert(block.variants.length===6,`${label}: expected 6 variants, got ${block?.variants?.length}`);
  const ids=new Set();
  block.variants.forEach((variant,index)=>{
    ids.add(String(variant.id));
    assertTaskArray(variant.tasks,`${label} variant ${variant.id??index+1}`,{points:true});
    const score=variant.tasks.reduce((sum,t)=>sum+Number(t.points||0),0);
    assert(Number.isFinite(score),`${label} variant ${variant.id}: invalid score`);
    if(block.maxScore!=null)assert(score===Number(block.maxScore),`${label} variant ${variant.id}: score ${score} != ${block.maxScore}`);
  });
  assert(ids.size===6,`${label}: duplicate variant ids`);
}
function scriptSources(html){return [...html.matchAll(/<script\s+[^>]*src=["']([^"']+)["'][^>]*>/g)].map(m=>m[1]);}
function loadLessonSeries(row,topicIndex){
  const n=String(topicIndex+1).padStart(2,'0');
  const base=`lessons/${row}/${n}`;
  const indexFile=`${base}/index.html`;
  assert(exists(indexFile),`${indexFile}: missing`);
  const html=read(indexFile);
  assert(/<meta\s+name=["']viewport["']/i.test(html),`${indexFile}: viewport meta missing`);
  const context=vm.createContext({window:{},console});
  const local=scriptSources(html).filter(src=>!src.startsWith('../')&&!/^(?:https?:|\/\/)/.test(src));
  assert(local.includes('series.js'),`${indexFile}: series.js not referenced`);
  local.forEach(src=>{
    const file=rel(indexFile,src);
    assert(exists(file),`${indexFile}: missing local script ${src}`);
    executeMaybeCompressed(read(file),context,file);
  });
  if(context.window.KTP_COMPRESSED_LESSONS){
    const payload=gunzip(Buffer.from(context.window.KTP_COMPRESSED_LESSONS,'base64'),`${base}/packed-runtime`);
    compile(payload,`${base}/packed-runtime#payload`);
    execute(payload,context,`${base}/packed-runtime#payload`);
    delete context.window.KTP_COMPRESSED_LESSONS;
  }
  const series=context.window.KTP_LESSON_SERIES;
  assert(series,`${base}: KTP_LESSON_SERIES not created`);
  scanValues(series,base);
  return {series,base,indexFile};
}
function validateLessonLine(config){
  let expectedStart=1,total=0;
  config.counts.forEach((count,topicIndex)=>{
    const {series,base}=loadLessonSeries(config.row,topicIndex);
    const meta=series.meta||{};
    assert(meta.rowId===config.row,`${base}: wrong rowId`);
    assert(Number(meta.topicIndex)===topicIndex,`${base}: wrong topicIndex`);
    assert(Number(meta.topicNumber)===topicIndex+1,`${base}: wrong topicNumber`);
    assert(Number(meta.grade)===config.grade,`${base}: wrong grade`);
    assert(Number(meta.totalLessons)===count,`${base}: totalLessons ${meta.totalLessons} != ${count}`);
    const declaredStart=Number(meta.globalStart??meta.courseLessonStart);
    assert(Number.isInteger(declaredStart)&&declaredStart===expectedStart,`${base}: course lesson start ${declaredStart} != ${expectedStart}`);
    if(meta.courseLessonEnd!=null)assert(Number(meta.courseLessonEnd)===expectedStart+count-1,`${base}: courseLessonEnd mismatch`);
    if(meta.courseTotal!=null)assert(Number(meta.courseTotal)===COURSE_TOTAL,`${base}: courseTotal mismatch`);
    assert(Array.isArray(series.lessons)&&series.lessons.length===count,`${base}: expected ${count} lessons, got ${series.lessons?.length}`);
    const ids=new Set();
    series.lessons.forEach((lesson,index)=>{
      const local=index+1,expectedId=String(local).padStart(2,'0'),file=`${base}/${expectedId}.html`;
      assert(exists(file),`${file}: missing`);
      const html=read(file);
      assert(/<meta\s+name=["']viewport["']/i.test(html),`${file}: viewport meta missing`);
      assert(String(lesson.id)===expectedId,`${base}: lesson ${local} id=${lesson.id}, expected ${expectedId}`);
      assert(Number(lesson.number)===local,`${base}: lesson ${expectedId} local number mismatch`);
      if(lesson.globalNumber!=null)assert(Number(lesson.globalNumber)===expectedStart+index,`${base}/${expectedId}: globalNumber mismatch`);
      ids.add(String(lesson.id));
      assert(String(lesson.title||'').trim(),`${base}/${expectedId}: empty title`);
      assert(Array.isArray(lesson.objectives)&&lesson.objectives.length>=2,`${base}/${expectedId}: objectives missing`);
      assert(Array.isArray(lesson.prerequisites)&&lesson.prerequisites.length>=1,`${base}/${expectedId}: prerequisites missing`);
      assert(Array.isArray(lesson.theory)&&lesson.theory.length>=1,`${base}/${expectedId}: theory missing`);
      assert(Array.isArray(lesson.examples)&&lesson.examples.length>=2,`${base}/${expectedId}: need at least 2 examples`);
      lesson.examples.forEach((ex,j)=>['problem','idea','solution','check','answer'].forEach(key=>assert(String(ex[key]??'').trim(),`${base}/${expectedId}: example ${j+1} missing ${key}`)));
      assert(Array.isArray(lesson.mistakes)&&lesson.mistakes.length>=2,`${base}/${expectedId}: mistakes missing`);
      assertTaskArray(lesson.practice,`${base}/${expectedId} practice`);
      assertTaskArray(lesson.homework?.required,`${base}/${expectedId} homework.required`);
      assert(Array.isArray(lesson.summary)&&lesson.summary.length>=3,`${base}/${expectedId}: summary missing`);
      assertAssessment(lesson.independent,`${base}/${expectedId} independent`);
      assertAssessment(lesson.control,`${base}/${expectedId} control`);
    });
    assert(ids.size===count,`${base}: duplicate lesson ids`);
    expectedStart+=count;total+=count;
  });
  assert(total===COURSE_TOTAL,`${config.row}: lesson total ${total} != ${COURSE_TOTAL}`);
}
function validateTopicContent(config,topicIndex){
  const n=String(topicIndex+1).padStart(2,'0');
  const topicHtml=`topics/${config.row}/${n}.html`;
  const contentFile=`content/${config.row}/${n}.js`;
  assert(exists(topicHtml),`${topicHtml}: missing`);
  assert(exists(contentFile),`${contentFile}: missing`);
  const html=read(topicHtml);
  assert(/<meta\s+name=["']viewport["']/i.test(html),`${topicHtml}: viewport meta missing`);
  assert(html.includes(`../../content/${config.row}/${n}.js`),`${topicHtml}: content script not connected`);
  assert(html.includes('../../assessments/topic-links.js'),`${topicHtml}: assessment navigation missing`);
  assert(html.includes('../../lessons/topic-links.js'),`${topicHtml}: lesson navigation missing`);
  let registered=null;
  const context=vm.createContext({KTP_REGISTER_CONTENT:(id,data)=>{registered={id,data};},window:{},console});
  executeMaybeCompressed(read(contentFile),context,contentFile);
  assert(registered?.id===`${config.row}::${topicIndex}`,`${contentFile}: wrong content id`);
  const data=registered.data;
  scanValues(data,contentFile);
  assert(Array.isArray(data.objectives)&&data.objectives.length>=3,`${contentFile}: objectives missing`);
  assert(Array.isArray(data.expectedResults)&&data.expectedResults.length>=3,`${contentFile}: expectedResults missing`);
  assert(Array.isArray(data.prerequisites)&&data.prerequisites.length>=1,`${contentFile}: prerequisites missing`);
  assert(Array.isArray(data.prerequisiteCheck)&&data.prerequisiteCheck.length>=2,`${contentFile}: prerequisiteCheck missing`);
  assert(Array.isArray(data.map)&&data.map.length>=2,`${contentFile}: map missing`);
  assert(Array.isArray(data.theory)&&data.theory.length>=4,`${contentFile}: theory too short`);
  assert(Array.isArray(data.examples)&&data.examples.length>=4,`${contentFile}: examples too short`);
  assert(Array.isArray(data.mistakes)&&data.mistakes.length>=3,`${contentFile}: mistakes too short`);
  for(const level of ['basic','standard','transfer','challenge'])assertTaskArray(data.practice?.[level],`${contentFile} practice.${level}`);
  assert(Array.isArray(data.diagnostic)&&data.diagnostic.length>=3,`${contentFile}: diagnostic missing`);
  assertTaskArray(data.diagnostic,`${contentFile} diagnostic`);
  assertTaskArray(data.homework?.required,`${contentFile} homework.required`);
  assert(Array.isArray(data.summary)&&data.summary.length>=3,`${contentFile}: summary missing`);
  assert(String(data.source?.textbook||'').trim(),`${contentFile}: source textbook missing`);
  assert(!/TODO|placeholder|заглушк/i.test(JSON.stringify(data)),`${contentFile}: placeholder marker found`);
  if(data.lab?.enabled){
    assert(String(data.lab.href||'').trim(),`${contentFile}: enabled lab without href`);
    const target=rel(topicHtml,String(data.lab.href).split('#')[0].split('?')[0]);
    assert(exists(target),`${contentFile}: lab target missing: ${data.lab.href}`);
  }
}
function loadThematicAssessment(config,topicIndex){
  const n=String(topicIndex+1).padStart(2,'0');
  const base=`assessments/${config.row}/${n}`;
  for(const name of ['independent.html','control.html','data.js'])assert(exists(`${base}/${name}`),`${base}/${name}: missing`);
  for(const name of ['independent.html','control.html'])assert(/<meta\s+name=["']viewport["']/i.test(read(`${base}/${name}`)),`${base}/${name}: viewport meta missing`);
  const context=vm.createContext({window:{},console});
  executeMaybeCompressed(read(`${base}/data.js`),context,`${base}/data.js`);
  if(context.window.KTP_COMPRESSED_ASSESSMENT){
    const payload=gunzip(Buffer.from(context.window.KTP_COMPRESSED_ASSESSMENT,'base64'),`${base}/data.js`);
    compile(payload,`${base}/data.js#payload`);
    execute(payload,context,`${base}/data.js#payload`);
    delete context.window.KTP_COMPRESSED_ASSESSMENT;
  }
  const data=context.window.KTP_ASSESSMENT_DATA;
  assert(data,`${base}: KTP_ASSESSMENT_DATA not created`);
  scanValues(data,base);
  assert(data.meta?.rowId===config.row,`${base}: wrong assessment rowId`);
  assert(Number(data.meta?.grade)===config.grade,`${base}: wrong assessment grade`);
  assert(data.topic,`${base}: topic assessment missing`);
  assertAssessment(data.topic.independent,`${base} independent`);
  assertAssessment(data.topic.control,`${base} control`);
}
function walkFiles(dir,predicate=()=>true){
  if(!exists(dir))return [];
  const out=[];
  const walk=current=>fs.readdirSync(abs(current),{withFileTypes:true}).forEach(entry=>{
    const p=path.posix.join(current,entry.name);
    if(entry.isDirectory())walk(p);else if(predicate(p))out.push(p);
  });
  walk(dir);return out;
}
function validateStaticLinks(config){
  const roots=[`topics/${config.row}`,`lessons/${config.row}`,`assessments/${config.row}`,`labs/${config.row}`].filter(exists);
  const htmlFiles=roots.flatMap(root=>walkFiles(root,p=>p.endsWith('.html')));
  htmlFiles.forEach(file=>{
    const source=read(file);
    assert(/<meta\s+name=["']viewport["']/i.test(source),`${file}: viewport meta missing`);
    const re=/(?:href|src)=["']([^"']+)["']/g;
    let match;
    while((match=re.exec(source))){
      const target=match[1];
      if(!target||target.startsWith('#')||/^(?:https?:|mailto:|data:|javascript:|\/\/)/.test(target))continue;
      const clean=target.split('#')[0].split('?')[0];
      if(!clean)continue;
      const resolved=rel(file,clean);
      assert(exists(resolved),`${file}: broken static link ${target}`);
    }
  });
  roots.flatMap(root=>walkFiles(root,p=>p.endsWith('.js'))).forEach(file=>compile(read(file),file));
}
function validateNoTempFiles(config){
  const roots=[`content/${config.row}`,`topics/${config.row}`,`lessons/${config.row}`,`assessments/${config.row}`,`labs/${config.row}`].filter(exists);
  roots.flatMap(root=>walkFiles(root)).forEach(file=>assert(!/(?:^|\/)(?:qa[-_]?probe|probe|tmp|temp)(?:[._-]|$)|\.bak$|\.tmp$|~$/i.test(file),`${file}: temporary QA file`));
}
function validateSharedRuntime(){
  const js=['js/data.js','lessons/lesson-page.js','lessons/lesson-index.js','lessons/series-adapter.js','lessons/global-numbering.js','lessons/compressed-loader.js','assessments/assessment-page.js','assessments/compressed-loader.js','lessons/topic-links.js','assessments/topic-links.js','topics/topic-page.js'];
  js.forEach(file=>{assert(exists(file),`${file}: missing`);compile(read(file),file);});
  const dataContext=vm.createContext({window:{},console});
  execute(read('js/data.js'),dataContext,'js/data.js');
  assert(Array.isArray(dataContext.window.KTP_DATA?.rows)&&dataContext.window.KTP_DATA.rows.length===17,'js/data.js: expected 17 KTP rows');
  LINES.forEach(config=>assert(dataContext.window.KTP_DATA.rows.some(r=>r.id===config.row),`js/data.js: missing ${config.row}`));
  const lessonLinks=read('lessons/topic-links.js'),assessmentLinks=read('assessments/topic-links.js');
  LINES.forEach(config=>{
    assert(lessonLinks.includes(`'${config.row}'`),`lessons/topic-links.js: ${config.row} missing`);
    assert(assessmentLinks.includes(`'${config.row}'`),`assessments/topic-links.js: ${config.row} missing`);
  });
  const cssChecks=[
    ['topics/topic-page.css',true],
    ['lessons/lesson-page.css',true],
    ['assessments/assessment-page.css',true]
  ];
  cssChecks.forEach(([file,print])=>{
    assert(exists(file),`${file}: missing`);const css=read(file);
    assert(/@media\s*\([^)]*max-width/i.test(css),`${file}: responsive media rules missing`);
    if(print)assert(/@media\s+print/i.test(css),`${file}: print rules missing`);
  });
}

validateSharedRuntime();
for(const config of LINES){
  assert(config.counts.length===config.topics,`${config.row}: topic/count configuration mismatch`);
  validateLessonLine(config);
  for(let topicIndex=0;topicIndex<config.topics;topicIndex++){
    validateTopicContent(config,topicIndex);
    loadThematicAssessment(config,topicIndex);
  }
  validateStaticLinks(config);
  validateNoTempFiles(config);
}

if(transportFallbacks.length){
  console.warn('Recovered compressed payloads with invalid gzip trailer/checksum:');
  transportFallbacks.forEach(item=>console.warn(`- ${item}`));
}
const seriesCount=LINES.reduce((sum,x)=>sum+x.topics,0);
const lessonCount=LINES.reduce((sum,x)=>sum+x.counts.reduce((a,b)=>a+b,0),0);
console.log(`Reference-lines regression QA passed: ${checks} checks, ${LINES.length} lines, ${seriesCount} thematic series, ${lessonCount} lessons.`);
