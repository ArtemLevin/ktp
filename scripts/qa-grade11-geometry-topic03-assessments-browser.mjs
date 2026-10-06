import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const ROOT=process.cwd(),mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{
  const rel=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/, '')||'index.html';
  const target=path.normalize(path.join(ROOT,rel));
  if(!target.startsWith(path.normalize(ROOT+path.sep))||!fs.existsSync(target)){res.writeHead(404);return res.end('not found');}
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(target).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));

const port=server.address().port,browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true});
let errors=[];
page.on('pageerror',e=>errors.push('pageerror: '+e.message));
page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});

async function open(rel,selector,minText){
  errors=[];
  const response=await page.goto('http://127.0.0.1:'+port+'/'+rel,{waitUntil:'networkidle',timeout:30000});
  if(!response||!response.ok())throw Error(rel+': HTTP '+(response&&response.status()));
  if(selector)await page.waitForSelector(selector,{timeout:10000});
  const state=await page.evaluate(()=>({
    text:document.body.innerText.length,
    width:document.documentElement.scrollWidth,
    viewport:document.documentElement.clientWidth,
    revolution:document.querySelectorAll('.revolution-scene svg').length,
    invalid:[...document.querySelectorAll('.revolution-scene svg *')].some(el=>[...el.attributes].some(a=>/NaN|Infinity/.test(a.value)))
  }));
  if(state.text<minText||state.width>state.viewport+4||state.invalid||errors.length)throw Error(rel+': '+JSON.stringify({state,errors}));
  return state;
}

try{
  const topicState=await open('topics/11-geometry-atanasyan/03.html','.revolution-scene svg',8000);
  if(topicState.revolution!==11)throw Error('topic revolution scenes: '+topicState.revolution);
  const card=page.locator('[data-assessment-topic-link]');
  await card.waitFor({state:'visible'});
  if(await card.count()!==1)throw Error('topic assessment card duplicated');
  const topicText=await card.innerText();
  for(const token of ['Проверочные материалы','6 вариантов','Самостоятельная работа','Контрольная работа'])if(!topicText.includes(token))throw Error('topic assessment card missing '+token);
  const lab=page.locator('.lab-card a[href="../../labs/11-geometry-atanasyan/revolution-volume/index.html"]');
  if(await lab.count()!==1)throw Error('topic lab card missing after assessment release');

  for(const kind of ['independent','control']){
    const expectedTasks=kind==='independent'?42:60;
    const expectedMax=kind==='independent'?'14 баллов':'20 баллов';
    const link=card.locator('a[href$="/03/'+kind+'.html"]');
    if(await link.count()!==1)throw Error(kind+': topic link missing');
    await link.click();
    await page.waitForURL('**/assessments/11-geometry-atanasyan/03/'+kind+'.html');
    await page.waitForSelector('.variant-buttons');
    if(await page.locator('[data-pick]').count()!==6)throw Error(kind+': six variant buttons');
    if(await page.locator('.variant .task').count()!==expectedTasks)throw Error(kind+': total task count');
    const hero=await page.locator('.hero').innerText();
    if(!hero.includes('Объёмы тел вращения')||!hero.includes(expectedMax)||!hero.includes('6 равноценных вариантов'))throw Error(kind+': hero contract');
    const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    if(width.scroll>width.client+4)throw Error(kind+': mobile overflow '+JSON.stringify(width));
    await page.locator('[data-pick="6"]').click();
    if(!((await page.locator('[data-pick="6"]').getAttribute('class'))||'').includes('selected'))throw Error(kind+': variant switching');
    await page.locator('[data-answers]').click();
    if(!((await page.locator('body').getAttribute('class'))||'').includes('answers-on'))throw Error(kind+': answers toggle');
    const key=await page.locator('.variant.active .teacher-key').innerText();
    for(const token of ['Ответы и критерии','балл'])if(!key.includes(token))throw Error(kind+': teacher key missing '+token);
    await page.locator('[data-all]').click();
    if(!((await page.locator('body').getAttribute('class'))||'').includes('all-on'))throw Error(kind+': show all variants');
    await page.emulateMedia({media:'print'});
    const pdf=await page.pdf({format:'A4',printBackground:true});
    if(pdf.length<18000)throw Error(kind+': print PDF too small '+pdf.length);
    await page.emulateMedia({media:'screen'});
    await page.goBack({waitUntil:'networkidle'});
    await card.waitFor({state:'visible'});
  }

  const lesson=await open('lessons/11-geometry-atanasyan/03/11.html','.revolution-scene svg',3000);
  if(lesson.revolution<1)throw Error('lesson 32 revolution scene missing');
  const labLink=page.locator('a[href="../../../labs/11-geometry-atanasyan/revolution-volume/index.html"]');
  if(await labLink.count()<1)throw Error('lesson lab resource missing');

  console.log('Grade 11 geometry topic 03 thematic assessment browser/mobile/print QA passed.');
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}