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
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const {port}=server.address();

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true});
const errors=[];
page.on('pageerror',e=>errors.push('pageerror: '+e.message));
page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});

async function open(rel,selector,minText=1200){
  errors.length=0;
  const response=await page.goto('http://127.0.0.1:'+port+'/'+rel,{waitUntil:'networkidle',timeout:30000});
  if(!response?.ok())throw new Error(rel+': HTTP '+response?.status());
  if(selector)await page.waitForSelector(selector,{timeout:10000});
  const state=await page.evaluate(()=>({
    text:document.body.innerText.length,
    scrollWidth:document.documentElement.scrollWidth,
    clientWidth:document.documentElement.clientWidth,
    spatial:document.querySelectorAll('.spatial-scene svg').length
  }));
  if(state.scrollWidth>state.clientWidth+4)throw new Error(rel+': overflow '+state.scrollWidth+'>'+state.clientWidth);
  if(state.text<minText)throw new Error(rel+': text too short '+state.text);
  if(errors.length)throw new Error(rel+': '+errors.join(' | '));
  return state;
}

await open('lessons/10-geometry-atanasyan/05/index.html','.lesson-tile',1000);
if(await page.locator('.lesson-tile').count()<4)throw new Error('catalog must contain at least 4 lessons');
const tileNos=await page.locator('.lesson-tile .tile-top span').allInnerTexts();
if(tileNos.slice(0,4).join('|')!=='Урок 61|Урок 62|Урок 63|Урок 64')throw new Error('global numbering 61-64 missing: '+JSON.stringify(tileNos));

for(let i=1;i<=4;i++){
  const id=String(i).padStart(2,'0'),global=60+i;
  const state=await open('lessons/10-geometry-atanasyan/05/'+id+'.html','.lesson-card',1800);
  if(state.spatial<1)throw new Error('lesson '+id+': spatial scene missing');
  if(await page.locator('[data-assessment-select="independent"] option').count()!==6)throw new Error('lesson '+id+': independent variants');
  if(await page.locator('[data-assessment-select="control"] option').count()!==6)throw new Error('lesson '+id+': control variants');
  const hero=(await page.locator('.lesson-hero h1 span').innerText()).toUpperCase();
  if(hero!==('Урок '+global).toUpperCase())throw new Error('lesson '+id+': global '+hero);
  if(await page.locator('details.answer').count()<8)throw new Error('lesson '+id+': answer disclosures');
}

await open('lessons/10-geometry-atanasyan/05/04.html','.lesson-card',1800);
await page.emulateMedia({media:'print'});
const pdf=await page.pdf({format:'A4',printBackground:true});
if(pdf.length<14000)throw new Error('lesson 64 print PDF too small '+pdf.length);

console.log('Grade 10 Atanasyan topic 05 lessons 61-64 browser QA passed: variants, spatial, mobile and print.');
await browser.close();
await new Promise(r=>server.close(r));
