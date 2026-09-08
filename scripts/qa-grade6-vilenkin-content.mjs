import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const rowId='6-math-vilenkin';
const failures=[];
let checks=0;
const ok=(condition,message)=>{checks++;if(!condition)failures.push(message);};
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const dataSandbox={window:{}};
vm.createContext(dataSandbox);
vm.runInContext(read('js/data.js'),dataSandbox,{filename:'js/data.js'});
const row=dataSandbox.window.KTP_DATA.rows.find(r=>r.id===rowId);
ok(Boolean(row),'row 6-math-vilenkin is registered in js/data.js');
ok(row?.topics?.length===10,'row has exactly 10 topics');

const requiredArrays=['objectives','expectedResults','prerequisites','prerequisiteCheck','map','theory','examples','mistakes','diagnostic','summary'];
for(let i=0;i<10;i++){
  const n=String(i+1).padStart(2,'0');
  const key=`${rowId}::${i}`;
  const contentPath=`content/${rowId}/${n}.js`;
  const topicPath=`topics/${rowId}/${n}.html`;
  ok(fs.existsSync(path.join(root,contentPath)),`${contentPath} exists`);
  ok(fs.existsSync(path.join(root,topicPath)),`${topicPath} exists`);
  if(!fs.existsSync(path.join(root,contentPath)))continue;

  let payload=null;
  const sandbox={KTP_REGISTER_CONTENT:(k,p)=>{ok(k===key,`${contentPath}: registry key ${key}`);payload=p;}};
  vm.createContext(sandbox);
  try{vm.runInContext(read(contentPath),sandbox,{filename:contentPath});}
  catch(error){failures.push(`${contentPath}: JS runtime error: ${error.message}`);continue;}
  ok(Boolean(payload),`${contentPath}: payload registered`);
  if(!payload)continue;
  ok(payload.meta?.title===row.topics[i].title,`${contentPath}: meta.title matches js/data.js`);
  for(const field of requiredArrays)ok(Array.isArray(payload[field])&&payload[field].length>0,`${contentPath}: ${field} is non-empty`);
  ok(payload.objectives.length>=3,`${contentPath}: at least 3 objectives`);
  ok(payload.theory.length>=5,`${contentPath}: at least 5 theory blocks`);
  ok(payload.examples.length>=5,`${contentPath}: at least 5 worked examples`);
  ok(payload.mistakes.length>=4,`${contentPath}: at least 4 common mistakes`);
  ok(payload.diagnostic.length>=4,`${contentPath}: at least 4 diagnostic tasks`);
  ok(payload.homework&&Array.isArray(payload.homework.required)&&payload.homework.required.length>=5,`${contentPath}: homework required has at least 5 tasks`);
  const groups=['basic','standard','transfer','challenge'];
  for(const group of groups)ok(Array.isArray(payload.practice?.[group])&&payload.practice[group].length>0,`${contentPath}: practice.${group} is non-empty`);
  const allTasks=[...groups.flatMap(g=>payload.practice[g]),...payload.diagnostic,...payload.homework.required,...(payload.homework.optional||[])];
  for(const [j,item] of allTasks.entries()){
    ok(typeof item.task==='string'&&item.task.trim().length>0,`${contentPath}: task ${j+1} has text`);
    ok(item.answer!==undefined&&String(item.answer).trim().length>0,`${contentPath}: task ${j+1} has answer`);
  }
  ok(Boolean(payload.source?.textbook),`${contentPath}: source textbook recorded`);
  ok(Array.isArray(payload.source?.paragraphs)&&payload.source.paragraphs.length>0,`${contentPath}: source paragraphs recorded`);

  const html=read(topicPath);
  ok(html.includes(`data-row="${rowId}"`),`${topicPath}: correct data-row`);
  ok(html.includes(`data-topic="${i}"`),`${topicPath}: correct data-topic`);
  ok(html.includes('../../content/registry.js'),`${topicPath}: registry connected`);
  ok(html.includes(`../../content/${rowId}/${n}.js`),`${topicPath}: content module connected`);
  ok(html.includes('../topic-page.js'),`${topicPath}: shared renderer connected`);
}

ok(fs.existsSync(path.join(root,`content/${rowId}/content-map.md`)),'content map exists');

if(failures.length){
  console.error(`Grade 6 Vilenkin content QA failed: ${failures.length} failure(s), ${checks} checks.`);
  for(const f of failures)console.error(`- ${f}`);
  process.exit(1);
}
console.log(`Grade 6 Vilenkin content QA passed: ${checks} checks across 10 thematic modules.`);
