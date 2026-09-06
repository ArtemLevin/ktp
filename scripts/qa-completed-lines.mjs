import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';

const ROOT=process.cwd();
const LINES=[
  {row:'7-algebra-makarychev',series:7,topics:7,total:102},
  {row:'8-algebra-makarychev',series:7,topics:7,total:102},
  {row:'9-algebra-makarychev',series:6,topics:6,total:102},
  {row:'10-algebra-alimov',series:8,topics:8,total:102},
  {row:'11-algebra-alimov',series:7,topics:7,total:102}
];
let checks=0;
let lessonCount=0;
let thematicVariantCount=0;
let lessonVariantCount=0;
const warnings=[];
const fail=message=>{throw new Error(message);};
const assert=(condition,message)=>{checks++;if(!condition)fail(message);};
const abs=p=>path.join(ROOT,p);
const exists=p=>fs.existsSync(abs(p));
const read=p=>fs.readFileSync(abs(p),'utf8');
const posix=p=>p.split(path.sep).join('/');

function compile(source,filename){
  try{new vm.Script(source,{filename});checks++;}
  catch(error){fail(`${filename}: JS syntax error: ${error.message}`);}
}
function execute(source,context,filename){
  try{new vm.Script(source,{filename}).runInContext(context);checks++;}
  catch(error){fail(`${filename}: execution failed: ${error.message}`);}
}
function gunzipBase64(encoded,label){
  const bytes=Buffer.from(encoded,'base64');
  try{return zlib.gunzipSync(bytes).toString('utf8');}
  catch(error){
    if(bytes.length>18&&bytes[0]===0x1f&&bytes[1]===0x8b&&bytes[2]===0x08){
      try{
        const raw=zlib.inflateRawSync(bytes.subarray(10,-8)).toString('utf8');
        warnings.push(`${label}: recovered raw DEFLATE from invalid gzip trailer/checksum`);
        return raw;
      }catch{}
    }
    fail(`${label}: invalid gzip/Base64 payload: ${error.message}`);
  }
}
function context(){
  const sandbox={window:{},console};
  sandbox.window.window=sandbox.window;
  return vm.createContext(sandbox);
}
function scriptSources(html){
  return [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi)].map(m=>m[1]);
}
function localScriptPaths(indexFile,base){
  const html=read(indexFile);
  const baseAbs=abs(base)+path.sep;
  return scriptSources(html).map(src=>{
    const clean=src.split('?')[0].split('#')[0];
    return path.normalize(path.join(path.dirname(abs(indexFile)),clean));
  }).filter(p=>p.startsWith(baseAbs)&&p.endsWith('.js')).map(p=>posix(path.relative(ROOT,p)));
}
function executeLocalRuntime(indexFile,base,compressedVar){
  const ctx=context();
  const scripts=localScriptPaths(indexFile,base);
  assert(scripts.length>0,`${indexFile}: no local runtime scripts`);
  for(const file of scripts){
    assert(exists(file),`${indexFile}: missing local script ${file}`);
    const src=read(file);compile(src,file);execute(src,ctx,file);
  }
  const encoded=ctx.window[compressedVar];
  if(typeof encoded==='string'&&encoded.length){
    const payload=gunzipBase64(encoded,`${base}/${compressedVar}`);
    compile(payload,`${base}/compressed-payload.js`);
    execute(payload,ctx,`${base}/compressed-payload.js`);
  }
  return {ctx,scripts};
}
function validateFinite(value,label,seen=new Set()){
  if(value===undefined)fail(`${label}: undefined value in runtime`);
  if(typeof value==='number')assert(Number.isFinite(value),`${label}: non-finite number ${value}`);
  if(typeof value==='string')assert(!/(^|\W)(?:NaN|Infinity|undefined)(\W|$)/.test(value),`${label}: suspicious runtime token in string: ${value}`);
  if(!value||typeof value!=='object')return;
  if(seen.has(value))return;seen.add(value);
  if(Array.isArray(value))value.forEach((v,i)=>validateFinite(v,`${label}[${i}]`,seen));
  else for(const [k,v] of Object.entries(value))validateFinite(v,`${label}.${k}`,seen);
}
function assertTasks(tasks,label){
  assert(Array.isArray(tasks)&&tasks.length>0,`${label}: tasks missing`);
  for(const [i,task] of tasks.entries()){
    assert(String(task?.text??task?.task??'').trim(),`${label} task ${i+1}: empty text`);
    assert(String(task?.answer??'').trim(),`${label} task ${i+1}: empty answer`);
    if(task?.points!=null)assert(Number.isFinite(Number(task.points))&&Number(task.points)>0,`${label} task ${i+1}: invalid points`);
  }
}
function assertAssessment(block,label){
  assert(block&&Array.isArray(block.variants),`${label}: assessment block missing`);
  assert(block.variants.length===6,`${label}: expected 6 variants, got ${block.variants?.length}`);
  const ids=new Set();
  for(const variant of block.variants){
    ids.add(String(variant.id));
    assertTasks(variant.tasks,`${label} variant ${variant.id}`);
    const sum=variant.tasks.reduce((n,t)=>n+Number(t.points||0),0);
    if(block.maxScore!=null)assert(sum===Number(block.maxScore),`${label} variant ${variant.id}: score ${sum} != ${block.maxScore}`);
  }
  assert(ids.size===6,`${label}: duplicate variant ids`);
}
function validateLesson(lesson,label){
  assert(lesson&&typeof lesson==='object',`${label}: lesson missing`);
  assert(String(lesson.id??'').trim(),`${label}: id missing`);
  assert(Number.isInteger(Number(lesson.number))&&Number(lesson.number)>0,`${label}: invalid local number`);
  assert(String(lesson.title??'').trim(),`${label}: title missing`);
  assert(Array.isArray(lesson.objectives)&&lesson.objectives.length>=2,`${label}: objectives missing`);
  assert(Array.isArray(lesson.prerequisites)&&lesson.prerequisites.length>=1,`${label}: prerequisites missing`);
  assert(Array.isArray(lesson.theory)&&lesson.theory.length>=1,`${label}: theory missing`);
  assert(Array.isArray(lesson.examples)&&lesson.examples.length>=2,`${label}: examples missing`);
  assert(Array.isArray(lesson.mistakes)&&lesson.mistakes.length>=2,`${label}: mistakes missing`);
  assertTasks(lesson.practice,`${label} practice`);
  assertTasks(lesson.homework?.required,`${label} homework.required`);
  assert(Array.isArray(lesson.summary)&&lesson.summary.length>=3,`${label}: summary missing`);
  assertAssessment(lesson.independent,`${label} independent`);
  assertAssessment(lesson.control,`${label} control`);
  lessonVariantCount+=12;
  validateFinite(lesson,label);
}
function numericDirs(dir){
  return fs.readdirSync(abs(dir),{withFileTypes:true}).filter(e=>e.isDirectory()&&/^\d{2}$/.test(e.name)).map(e=>e.name).sort();
}
function validateSeries(line){
  const row=line.row,root=`lessons/${row}`;
  assert(exists(root),`${root}: missing`);
  const dirs=numericDirs(root);
  assert(dirs.length===line.series,`${row}: expected ${line.series} series, got ${dirs.length}`);
  let expectedGlobal=1;
  let rowLessons=0;
  for(const [seriesIndex,n] of dirs.entries()){
    const base=`${root}/${n}`;
    const indexFile=`${base}/index.html`;
    assert(exists(indexFile),`${indexFile}: missing`);
    const {ctx}=executeLocalRuntime(indexFile,base,'KTP_COMPRESSED_LESSONS');
    const series=ctx.window.KTP_LESSON_SERIES;
    assert(series?.meta?.rowId===row,`${base}: wrong rowId`);
    assert(Number(series.meta.topicIndex)===seriesIndex,`${base}: topicIndex mismatch`);
    const lessons=series.lessons;
    assert(Array.isArray(lessons)&&lessons.length>0,`${base}: no lessons loaded`);
    const count=Number(series.meta.totalLessons??lessons.length);
    assert(lessons.length===count,`${base}: loaded ${lessons.length}, meta total ${count}`);
    assert(Number(series.meta.globalStart)===expectedGlobal,`${base}: globalStart ${series.meta.globalStart}, expected ${expectedGlobal}`);
    const expectedEnd=expectedGlobal+count-1;
    if(series.meta.globalEnd!=null)assert(Number(series.meta.globalEnd)===expectedEnd,`${base}: globalEnd mismatch`);
    assert(Number(series.meta.courseTotal??102)===line.total,`${base}: courseTotal mismatch`);
    const htmlLessons=fs.readdirSync(abs(base)).filter(f=>/^\d{2}\.html$/.test(f));
    assert(htmlLessons.length===count,`${base}: ${htmlLessons.length} lesson HTML files, expected ${count}`);
    const ids=new Set();
    lessons.forEach((lesson,i)=>{
      assert(Number(lesson.number)===i+1,`${base}: lesson ${i+1} local number mismatch`);
      ids.add(String(lesson.id));
      validateLesson(lesson,`${base}/${String(i+1).padStart(2,'0')}`);
    });
    assert(ids.size===count,`${base}: duplicate lesson ids`);
    expectedGlobal=expectedEnd+1;
    rowLessons+=count;
  }
  assert(rowLessons===line.total,`${row}: total ${rowLessons}, expected ${line.total}`);
  assert(expectedGlobal===line.total+1,`${row}: final global number mismatch`);
  lessonCount+=rowLessons;
}
function loadAssessment(base){
  const dataFile=`${base}/data.js`;
  assert(exists(dataFile),`${dataFile}: missing`);
  const ctx=context();
  const src=read(dataFile);compile(src,dataFile);execute(src,ctx,dataFile);
  const encoded=ctx.window.KTP_COMPRESSED_ASSESSMENT;
  if(typeof encoded==='string'&&encoded.length){
    const payload=gunzipBase64(encoded,`${base}/KTP_COMPRESSED_ASSESSMENT`);
    compile(payload,`${base}/compressed-assessment.js`);
    execute(payload,ctx,`${base}/compressed-assessment.js`);
  }
  return ctx.window.KTP_ASSESSMENT_DATA;
}
function validateAssessments(line){
  const root=`assessments/${line.row}`;
  assert(exists(root),`${root}: missing thematic assessments`);
  const dirs=numericDirs(root);
  assert(dirs.length===line.topics,`${line.row}: expected ${line.topics} thematic assessment dirs, got ${dirs.length}`);
  for(const n of dirs){
    const base=`${root}/${n}`;
    for(const f of ['independent.html','control.html','data.js'])assert(exists(`${base}/${f}`),`${base}/${f}: missing`);
    const data=loadAssessment(base);
    assert(data?.meta?.rowId===line.row,`${base}: assessment rowId mismatch`);
    assert(data?.topic,`${base}: topic data missing`);
    assertAssessment(data.topic.independent,`${base} independent`);
    assertAssessment(data.topic.control,`${base} control`);
    thematicVariantCount+=12;
    validateFinite(data,base);
  }
}
function validateTopics(line){
  const topicRoot=`topics/${line.row}`;
  const contentRoot=`content/${line.row}`;
  assert(exists(topicRoot),`${topicRoot}: missing`);
  assert(exists(contentRoot),`${contentRoot}: missing`);
  for(let i=1;i<=line.topics;i++){
    const n=String(i).padStart(2,'0');
    const topic=`${topicRoot}/${n}.html`,content=`${contentRoot}/${n}.js`;
    assert(exists(topic),`${topic}: missing`);assert(exists(content),`${content}: missing`);
    const html=read(topic);
    assert(/name=["']viewport["']/i.test(html),`${topic}: viewport meta missing`);
    assert(html.includes('../../lessons/topic-links.js'),`${topic}: lesson navigation layer missing`);
    assert(html.includes('../../assessments/topic-links.js'),`${topic}: assessment navigation layer missing`);
    compile(read(content),content);
  }
}
function registryHasRow(file,row,max){
  const source=read(file);
  const safe=row.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re=new RegExp(`['\"]${safe}['\"]\\s*:\\s*\\{\\s*min\\s*:\\s*0\\s*,\\s*max\\s*:\\s*${max}\\s*\\}`);
  assert(re.test(source),`${file}: ${row} expected min 0 max ${max}`);
}
function walk(dir,predicate=()=>true,out=[]){
  if(!exists(dir))return out;
  for(const e of fs.readdirSync(abs(dir),{withFileTypes:true})){
    const rel=path.posix.join(dir,e.name);
    if(e.isDirectory())walk(rel,predicate,out);else if(predicate(rel))out.push(rel);
  }
  return out;
}
function validateStaticLinks(line){
  const roots=[`topics/${line.row}`,`lessons/${line.row}`,`assessments/${line.row}`,`labs/${line.row}`];
  const htmlFiles=roots.flatMap(root=>walk(root,p=>p.endsWith('.html')));
  for(const file of htmlFiles){
    const html=read(file);
    assert(/name=["']viewport["']/i.test(html),`${file}: viewport meta missing`);
    const re=/(?:href|src)=["']([^"']+)["']/gi;let match;
    while((match=re.exec(html))){
      const target=match[1];
      if(!target||target.startsWith('#')||/^(?:https?:|mailto:|data:|javascript:)/i.test(target))continue;
      const clean=target.split('#')[0].split('?')[0];if(!clean)continue;
      const resolved=path.normalize(path.join(path.dirname(abs(file)),clean));
      assert(fs.existsSync(resolved),`${file}: broken static link ${target}`);
    }
  }
}
function validateLabs(line){
  const root=`labs/${line.row}`;
  assert(exists(root),`${root}: lab root missing`);
  const indexes=walk(root,p=>p.endsWith('/index.html')||p===`${root}/index.html`);
  assert(indexes.length>0,`${root}: no lab index pages`);
  for(const file of indexes){
    const html=read(file);
    assert(/name=["']viewport["']/i.test(html),`${file}: viewport meta missing`);
  }
  for(const js of walk(root,p=>p.endsWith('.js')))compile(read(js),js);
  for(const css of walk(root,p=>p.endsWith('.css'))){
    const text=read(css);assert(text.trim().length>0,`${css}: empty stylesheet`);
  }
}
function validateResponsiveAndPrintInfrastructure(){
  const common=['topics/topic-page.css','lessons/lesson-page.css','assessments/assessment-page.css'];
  for(const css of common){
    assert(exists(css),`${css}: missing`);const src=read(css);
    assert(/@media\s*\([^)]*(?:max-width|width)/i.test(src),`${css}: responsive media query missing`);
    assert(/@media\s+print/i.test(src),`${css}: print media rules missing`);
  }
}

for(const file of ['lessons/topic-links.js','assessments/topic-links.js','lessons/lesson-page.js','lessons/lesson-index.js','lessons/series-adapter.js','lessons/compressed-loader.js','assessments/assessment-page.js','assessments/compressed-loader.js']){
  assert(exists(file),`${file}: missing`);compile(read(file),file);
}
for(const line of LINES){
  registryHasRow('lessons/topic-links.js',line.row,line.topics-1);
  registryHasRow('assessments/topic-links.js',line.row,line.topics-1);
  validateTopics(line);
  validateSeries(line);
  validateAssessments(line);
  validateLabs(line);
  validateStaticLinks(line);
}
validateResponsiveAndPrintInfrastructure();
assert(lessonCount===510,`global lesson count ${lessonCount}, expected 510`);
assert(lessonVariantCount===510*12,`lesson assessment variants ${lessonVariantCount}, expected ${510*12}`);
assert(thematicVariantCount===(7+7+6+8+7)*12,`thematic variants ${thematicVariantCount}: unexpected count`);

if(warnings.length){console.warn('QA warnings:');warnings.forEach(w=>console.warn(`- ${w}`));}
console.log(`Unified KTP regression QA passed: ${checks} checks; ${lessonCount} lessons; ${lessonVariantCount} lesson assessment variants; ${thematicVariantCount} thematic assessment variants; 5 completed lines.`);
