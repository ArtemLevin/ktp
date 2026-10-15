import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/export-grade11-teacher-pages.mjs']);
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const ROOT=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{
 const rel=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/,'')||'index.html';
 const target=path.normalize(path.join(ROOT,rel));
 if(!target.startsWith(path.normalize(ROOT+path.sep))||!fs.existsSync(target)){res.writeHead(404);return res.end('not found');}
 res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});
 fs.createReadStream(target).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true});
let errors=[];
page.on('pageerror',e=>errors.push('pageerror: '+e.message));
page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});

async function open(rel,selector,minText){
 errors=[];
 const response=await page.goto('http://127.0.0.1:'+port+'/'+rel,{waitUntil:'networkidle',timeout:30000});
 if(!response||!response.ok())throw new Error(rel+': HTTP '+(response&&response.status()));
 if(selector)await page.waitForSelector(selector,{timeout:10000});
 const state=await page.evaluate(()=>({
  text:document.body.innerText.length,
  width:document.documentElement.scrollWidth,
  viewport:document.documentElement.clientWidth,
  scenes:document.querySelectorAll('.revolution-scene svg').length,
  invalid:[...document.querySelectorAll('.revolution-scene path')].some(el=>/NaN|Infinity/.test(el.getAttribute('d')||''))
 }));
 if(state.text<minText||state.width>state.viewport+4||state.invalid||errors.length)throw new Error(rel+': '+JSON.stringify({state,errors}));
 return state;
}

try{
 const topicState=await open('topics/11-geometry-atanasyan/01.html','.revolution-scene svg',5000);
 if(topicState.scenes!==4)throw new Error('topic revolution scenes: '+topicState.scenes);
 const card=page.locator('[data-assessment-topic-link]');
 await card.waitFor({state:'visible'});
 if(await card.count()!==1)throw new Error('topic assessment card duplicated');
 const topicText=await card.innerText();
 for(const token of ['Тематическая проверка','6 вариантов','14 баллов','20 баллов'])if(!topicText.includes(token))throw new Error('topic assessment card missing '+token);

 for(const kind of ['independent','control']){
  const expectedTasks=kind==='independent'?42:60;
  const link=card.locator('a[href$="/01/'+kind+'.html"]');
  if(await link.count()!==1)throw new Error(kind+': topic link missing');
  await link.click();
  await page.waitForURL('**/assessments/11-geometry-atanasyan/01/'+kind+'.html');
  await page.waitForSelector('.variant-buttons');
  if(await page.locator('[data-pick]').count()!==6)throw new Error(kind+': six variant buttons');
  if(await page.locator('.variant .task').count()!==expectedTasks)throw new Error(kind+': total task count');
  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  if(width.scroll>width.client+4)throw new Error(kind+': mobile overflow '+JSON.stringify(width));
  await page.locator('[data-pick="6"]').click();
  if(!((await page.locator('[data-pick="6"]').getAttribute('class'))||'').includes('selected'))throw new Error(kind+': variant switching');
  if(await page.locator('[data-answers],.teacher-key').count()!==0)throw Error(kind+': teacher controls leaked into student work');
  const resourceURLs=await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name));
  if(resourceURLs.some(u=>/\/(?:data|question-bank)\.js$/.test(u)))throw Error(kind+': answer-bearing script requested');
  await page.goto('http://127.0.0.1:'+port+'/assessments/11-geometry-atanasyan/01/teacher-'+kind+'.html',{waitUntil:'networkidle'});
  await page.locator('[data-pick="6"]').click();
  await page.locator('[data-answers]').click();
  if(!((await page.locator('body').getAttribute('class'))||'').includes('answers-on'))throw new Error(kind+': answers toggle');
  const key=await page.locator('.variant.active .teacher-key').innerText();
  for(const token of ['Ответы и критерии','балл'])if(!key.includes(token))throw new Error(kind+': teacher key missing '+token);
  const scoring=page.locator('.variant.active .criterion-score');
  if(await scoring.count()<expectedTasks/6)throw Error(kind+': missing pointwise criteria');
  const initialReport=await page.locator('.variant.active .diagnostic-summary').innerText();
  if(!initialReport.includes('Оценено 0 из'))throw Error(kind+': unmarked criteria treated as failures');
  await scoring.first().selectOption('0');
  const zeroReport=await page.locator('.variant.active .diagnostic-summary').innerText();
  if(!zeroReport.includes('Оценено 1 из')||!zeroReport.includes('0 баллов'))throw Error(kind+': awarded zero is not tracked');
  await scoring.first().selectOption('1');
  const gained=await page.locator('.variant.active .diagnostic-summary').innerText();
  if(!gained.includes('Оценено 1 из')||!gained.includes('1 балл'))throw Error(kind+': partial score missing');
  await page.locator('[data-pick="5"]').click();
  if(!(await page.locator('.variant.active .diagnostic-summary').innerText()).includes('Оценено 0 из'))throw Error(kind+': grading leaked across variants');
  await page.locator('[data-pick="6"]').click();
  if(!(await page.locator('.variant.active .diagnostic-summary').innerText()).includes('Оценено 1 из'))throw Error(kind+': grading not preserved on switch');
  await page.locator('[data-all]').click();
  if(!((await page.locator('body').getAttribute('class'))||'').includes('all-on'))throw new Error(kind+': show all variants');
  await page.emulateMedia({media:'print'});
  const pdf=await page.pdf({format:'A4',printBackground:true});
  if(pdf.length<18000)throw new Error(kind+': print PDF too small '+pdf.length);
  await page.emulateMedia({media:'screen'});
  await page.goBack({waitUntil:'networkidle'});
  await page.goBack({waitUntil:'networkidle'});
  await card.waitFor({state:'visible'});
 }
 console.log('Grade 11 geometry topic 01 thematic assessment browser/mobile/print QA passed.');
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
