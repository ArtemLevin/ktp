import fs from 'node:fs';
import path from 'node:path';
 import vm from 'node:vm';

const ROOT=process.cwd();
const failures=[];
const inventory=[];
const baseline={rows:17,topicPages:121,contentTopics:87,lessons:1190,assessmentTopics:87};
const file=p=>path.join(ROOT,p);
const exists=p=>fs.existsSync(file(p));
const read=p=>fs.readFileSync(file(p),'utf8');
const requireCondition=(ok,message)=>{if(!ok)failures.push(message);};
const pad=n=>String(n).padStart(2,'0');

function htmlFiles(dir){
  if(!exists(dir))return [];
  const result=[];
  function visit(rel){
    for(const entry of fs.readdirSync(file(rel),{withFileTypes:true})){
      const child=path.posix.join(rel,entry.name);
      if(entry.isDirectory())visit(child);
      else if(entry.isFile()&&entry.name.endsWith('.html'))result.push(child);
    }
  }
  visit(dir);
  return result;
}

function checkStaticAssets(p){
  const html=read(p);
  for(const tag of html.matchAll(/<(?:script|link)\b[^>]*>/gi)){
    const match=tag[0].match(/\b(?:src|href)\s*=\s*(["'])([^"']+)\1/i);
    if(!match)continue;
    const url=match[2].split(/[?#]/,1)[0];
    if(!url||url.startsWith('/')||url.startsWith('#')||/^(?:https?:|data:|blob:|\/\/|mailto:)/i.test(url))continue;
    let target;
    try{target=path.resolve(ROOT,path.dirname(p),decodeURIComponent(url));}
    catch(_error){failures.push(p+': invalid asset URL '+url);continue;}
    if(target!==ROOT&&!target.startsWith(ROOT+path.sep)){
      failures.push(p+': asset leaves repository '+url);
      continue;
    }
    requireCondition(fs.existsSync(target),p+': missing static asset '+url);
  }
}

function checkStudentIsolation(p){
  const html=read(p);
  if(!/data-audience\s*=\s*["']student["']/i.test(html))return;
  const scripts=[...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*(["'])([^"']+)\1/gi)].map(m=>m[2]);
  requireCondition(scripts.some(s=>s.includes('student-data.js')),p+': student page has no student-data.js');
  requireCondition(scripts.every(s=>!/(?:^|\/)(?:data|question-bank|teacher-data)\.js(?:$|[?#])/i.test(s)),p+': student page requests teacher-side source');
  requireCondition(!/teacher-(?:independent|control)\.html/i.test(html),p+': student page links to local teacher workbook');
}

const sandbox={window:{}};
try{vm.runInNewContext(read('js/data.js'),sandbox,{filename:'js/data.js'});}
catch(error){throw new Error('Cannot load js/data.js: '+error.message);}
const data=sandbox.window.KTP_DATA;
if(!data||!Array.isArray(data.rows))throw new Error('KTP_DATA.rows is missing');
const stats={rows:data.rows.length,topicPages:0,contentTopics:0,lessons:0,assessmentTopics:0,studentAssessmentPages:0};
const ids=new Set();

for(const row of data.rows){
  const {id,grade,subject,topics,bounds}=row;
  requireCondition(!ids.has(id),'duplicate row '+id);ids.add(id);
  requireCondition(Array.isArray(topics)&&topics.length>0,id+': no topics');
  if(!Array.isArray(topics)||!topics.length)continue;
  requireCondition(Array.isArray(bounds)&&bounds.length===topics.length+1,id+': invalid bounds');
  if(Array.isArray(bounds)&&bounds.length===topics.length+1){
    requireCondition(bounds[0]===0&&bounds.at(-1)===68,id+': calendar must cover 34 weeks');
    requireCondition(bounds.every((v,i)=>i===0||(Number.isInteger(v)&&v>bounds[i-1])),id+': bounds must increase');
  }
  let authored=0,lessons=0,assessmentTopics=0;
  for(let i=0;i<topics.length;i++){
    const n=pad(i+1),topicId=id+'::'+i;
    const page='topics/'+id+'/'+n+'.html';
    const content='content/'+id+'/'+n+'.js';
    requireCondition(topics[i].id===topicId,id+': wrong topic identity '+n);
    requireCondition(exists(page),page+': missing');
    if(exists(page))stats.topicPages++;
    const hasContent=exists(content);
    if(!hasContent){
      requireCondition(id.endsWith('-constructor'),content+': missing for textbook line');
      continue;
    }
    authored++;stats.contentTopics++;
    if(exists(page)){
      const html=read(page);
      requireCondition(html.includes('../../content/'+id+'/'+n+'.js'),page+': missing content script');
    }
    try{new vm.Script(read(content),{filename:content});}
    catch(error){failures.push(content+': JavaScript syntax error: '+error.message);}
    const base='lessons/'+id+'/'+n;
    requireCondition(exists(base+'/index.html'),base+'/index.html: missing');
    if(exists(base)){
      const lessonFiles=fs.readdirSync(file(base)).filter(f=>/^\d{2}\.html$/.test(f)).sort();
      const expected=Array.from({length:lessonFiles.length},(_,j)=>pad(j+1)+'.html');
      requireCondition(lessonFiles.join('|')===expected.join('|'),base+': lesson numbering gaps');
      requireCondition(lessonFiles.length>0,base+': no lesson pages');
      lessons+=lessonFiles.length;
      stats.lessons+=lessonFiles.length;
    }
    const assessments='assessments/'+id+'/'+n;
    const both=['independent.html','control.html'].every(f=>exists(assessments+'/'+f));
    requireCondition(both,assessments+': missing thematic assessment page(s)');
    if(both){assessmentTopics++;stats.assessmentTopics++;}
  }
  const expectedLessons=grade===5||grade===6?170:subject==='Геометрия'?68:102;
  if(authored===topics.length){
    requireCondition(lessons===expectedLessons,id+': '+lessons+' lessons; expected '+expectedLessons);
    requireCondition(assessmentTopics===topics.length,id+': assessment coverage '+assessmentTopics+'/'+topics.length);
  }
  inventory.push({id,grade,topics:topics.length,content:authored,lessons,assessments:assessmentTopics});
}

for(const [key,min] of Object.entries(baseline)){
  requireCondition(stats[key]>=min,key+': below baseline '+stats[key]+' < '+min);
}

const pages=['index.html','topics/index.html',...htmlFiles('topics'),...htmlFiles('lessons'),...htmlFiles('assessments'),...htmlFiles('labs')];
for(const p of new Set(pages)){
  requireCondition(exists(p),p+': missing');
  if(!exists(p))continue;
  checkStaticAssets(p);
  if(p.startsWith('assessments/')){
    checkStudentIsolation(p);
    if(/data-audience\s*=\s*["']student["']/i.test(read(p)))stats.studentAssessmentPages++;
  }
}

// Browser QA must not silently move to an unsupported new runner image.
for(const workflow of fs.readdirSync(file('.github/workflows')).filter(name=>/\.ya?ml$/.test(name))){
  const yaml=read('.github/workflows/'+workflow);
  if(/playwright|chromium/i.test(yaml)&&/\bruns-on:\s*ubuntu-latest\b/.test(yaml)){
    failures.push('.github/workflows/'+workflow+': pin a supported Ubuntu runner for Playwright');
  }
}

console.log('KTP release integrity inventory:');
for(const r of inventory)console.log(r.id+': topics '+r.content+'/'+r.topics+', lessons '+r.lessons+', assessments '+r.assessments);
console.log('Totals: '+JSON.stringify(stats)+'; static HTML pages checked: '+new Set(pages).size);
if(failures.length){
  console.error('FAIL: '+failures.length+' integrity violation(s):');
  for(const issue of failures.slice(0,80))console.error('- '+issue);
  if(failures.length>80)console.error('... '+(failures.length-80)+' more');
  process.exitCode=1;
}else{
  console.log('PASS: release inventory, topic mapping, static assets and student entrypoint isolation.');
}
