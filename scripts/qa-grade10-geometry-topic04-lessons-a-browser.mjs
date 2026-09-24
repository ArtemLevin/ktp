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
  const response=await page.goto('http://127.0.0.1:'+port+'/'+rel,{waitUntil:'networkidle',timeout:25000});
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

await open('lessons/10-geometry-atanasyan/04/index.html','.lesson-tile',1400);
if(await page.locator('.lesson-tile').count()!==9)throw new Error('stage3 catalog must contain 9 lessons');
const tileLabels=await page.locator('.lesson-tile .tile-top span').allInnerTexts();
if(tileLabels.length!==9)throw new Error('stage3 tile labels missing');

for(let i=1;i<=9;i++){
  const id=String(i).padStart(2,'0');
  const global=42+i;
  const state=await open('lessons/10-geometry-atanasyan/04/'+id+'.html','.lesson-card',1900);
  if(state.spatial<1)throw new Error('lesson '+id+': spatial scene missing');
  if(await page.locator('[data-assessment-select="independent"] option').count()!==6)throw new Error('lesson '+id+': six independent variants expected');
  if(await page.locator('[data-assessment-select="control"] option').count()!==6)throw new Error('lesson '+id+': six control variants expected');
  const hero=await page.locator('.lesson-hero h1 span').innerText();
  if(hero!=='Урок '+global)throw new Error('lesson '+id+': expected global hero '+global+', got '+hero);
  const answerButtons=await page.locator('details.answer').count();
  if(answerButtons<8)throw new Error('lesson '+id+': answer disclosures too few '+answerButtons);
}

await open('lessons/10-geometry-atanasyan/04/09.html','.lesson-card',1900);
const nextHref=await page.locator('.lesson-prev-next a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
if(nextHref.some(h=>h==='10.html'))throw new Error('lesson 51 must not link to unpublished lesson 52');

await page.emulateMedia({media:'print'});
const pdf=await page.pdf({format:'A4',printBackground:true});
if(pdf.length<14000)throw new Error('lesson 51 print PDF too small '+pdf.length);

console.log('Grade 10 Atanasyan topic 04 lessons 43-51 browser QA passed: 9 lessons, variants, spatial, mobile and print.');
await browser.close();
await new Promise(r=>server.close(r));
