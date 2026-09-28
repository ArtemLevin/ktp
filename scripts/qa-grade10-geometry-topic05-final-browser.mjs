import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const ROOT=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{
  const rel=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/, '')||'index.html';
  const target=path.normalize(path.join(ROOT,rel));
  if(!target.startsWith(path.normalize(ROOT+path.sep))||!fs.existsSync(target)){res.writeHead(404);return res.end('not found')}
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(target).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {port}=server.address();
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});

async function open(rel,selector,minText=1000){
  errors.length=0;
  const response=await page.goto(`http://127.0.0.1:${port}/${rel}`,{waitUntil:'networkidle',timeout:30000});
  if(!response?.ok())throw new Error(`${rel}: HTTP ${response?.status()}`);
  await page.waitForSelector(selector,{timeout:10000});
  const state=await page.evaluate(()=>({text:document.body.innerText.length,width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  if(state.text<minText||state.width>state.viewport+4||errors.length)throw new Error(`${rel}: ${JSON.stringify({state,errors})}`);
}

try{
  await open('topics/10-geometry-atanasyan/05.html','.spatial-scene svg',7500);
  const card=page.locator('[data-assessment-topic-link]');
  await card.waitFor({state:'visible'});
  if(await card.count()!==1)throw new Error('topic assessment card duplicated');
  for(const kind of ['independent','control']){
    const link=card.locator(`a[href$="/05/${kind}.html"]`);
    if(await link.count()!==1)throw new Error(`${kind}: assessment link missing`);
    await link.click();
    await page.waitForURL(`**/assessments/10-geometry-atanasyan/05/${kind}.html`);
    await page.waitForSelector('.variant-buttons');
    if(await page.locator('[data-pick]').count()!==6)throw new Error(`${kind}: six variant buttons`);
    if(await page.locator('.variant .task').count()!==(kind==='independent'?42:60))throw new Error(`${kind}: task count`);
    await page.locator('[data-pick="6"]').click();
    if(!(await page.locator('[data-pick="6"]').getAttribute('class'))?.includes('selected'))throw new Error(`${kind}: variant switching`);
    await page.locator('[data-answers]').click();
    if(!(await page.locator('body').getAttribute('class'))?.includes('answers-on'))throw new Error(`${kind}: teacher answers`);
    await page.emulateMedia({media:'print'});
    const pdf=await page.pdf({format:'A4',printBackground:true});
    if(pdf.length<12000)throw new Error(`${kind}: print PDF too small`);
    await page.emulateMedia({media:'screen'});
    await page.goBack({waitUntil:'networkidle'});
    await card.waitFor({state:'visible'});
  }
  await open('lessons/10-geometry-atanasyan/05/07.html','.lesson-card',2000);
  const profile=await page.locator('body').innerText();
  for(const token of ['Итоговая комплексная диагностика','READ','PROJ','SECTION','VOLUME'])
    if(!profile.includes(token))throw new Error('lesson 67 missing '+token);
  await open('lessons/10-geometry-atanasyan/05/08.html','.lesson-card',2000);
  await page.locator('[data-assessment-select="control"]').selectOption('6');
  if(!(await page.locator('[data-assessment-body="control"]').innerText()).includes('Ретест'))throw new Error('lesson 68 retest missing');
  console.log('Grade 10 Atanasyan topic 05 FINAL browser/mobile/assessments/print QA passed.');
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
