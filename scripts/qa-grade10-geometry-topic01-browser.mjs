import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const ROOT=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent((req.url||'/').split('?')[0]);
  const rel=raw==='/'?'index.html':raw.replace(/^\/+/, '');
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
page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`);});

async function open(rel,selector,minText=900){
  errors.length=0;
  const response=await page.goto(`http://127.0.0.1:${port}/${rel}`,{waitUntil:'networkidle',timeout:25000});
  if(!response?.ok())throw new Error(`${rel}: HTTP ${response?.status()}`);
  if(selector)await page.waitForSelector(selector,{timeout:10000});
  const s=await page.evaluate(()=>({
    title:document.title,
    text:document.body.innerText.length,
    scrollWidth:document.documentElement.scrollWidth,
    clientWidth:document.documentElement.clientWidth,
    spatial:document.querySelectorAll('.spatial-scene svg').length
  }));
  if(s.scrollWidth>s.clientWidth+4)throw new Error(`${rel}: mobile overflow ${s.scrollWidth}>${s.clientWidth}`);
  if(s.text<minText)throw new Error(`${rel}: rendered text too short ${s.text}`);
  if(errors.length)throw new Error(`${rel}: ${errors.join(' | ')}`);
  return s;
}

const topic=await open('topics/10-geometry-atanasyan/01.html','.spatial-scene svg',6500);
if(!topic.title.includes('Повторение'))throw new Error(`topic title ${topic.title}`);
if(topic.spatial<5)throw new Error(`topic spatial scene count ${topic.spatial}`);
let body=await page.locator('body').innerText();
for(const token of [
  'Три уровня представления',
  'Аксиома 1',
  'Аксиома 2',
  'Аксиома 3',
  'Параллельная проекция',
  'Секущая плоскость',
  '4 последовательных урока',
  '6 вариантов каждого типа'
]) if(!body.includes(token))throw new Error(`topic missing ${token}`);
if(body.includes('Открыть лабораторию'))throw new Error('topic 01 must not expose a digital lab');

await open('lessons/10-geometry-atanasyan/01/index.html','.lesson-tile',1200);
if(await page.locator('.lesson-tile').count()!==4)throw new Error('lesson index must contain 4 tiles');

for(let i=1;i<=4;i++){
  const id=String(i).padStart(2,'0');
  const s=await open(`lessons/10-geometry-atanasyan/01/${id}.html`,'.lesson-card',1700);
  if(!s.title.includes(`Урок ${id}`)&&!s.title.includes(`Урок ${i}`))throw new Error(`lesson ${id}: title ${s.title}`);
  if(s.spatial<1)throw new Error(`lesson ${id}: spatial SVG missing`);
  if(await page.locator('[data-assessment-select="independent"] option').count()!==6)throw new Error(`lesson ${id}: independent variants`);
  if(await page.locator('[data-assessment-select="control"] option').count()!==6)throw new Error(`lesson ${id}: control variants`);
}

for(const kind of ['independent','control']){
  await open(`assessments/10-geometry-atanasyan/01/${kind}.html`,'.variant-buttons',1700);
  if(await page.locator('[data-pick]').count()!==6)throw new Error(`thematic ${kind}: six variants`);
  await page.emulateMedia({media:'print'});
  const pdf=await page.pdf({format:'A4',printBackground:true});
  if(pdf.length<12000)throw new Error(`thematic ${kind}: PDF too small ${pdf.length}`);
  await page.emulateMedia({media:'screen'});
}

console.log('Grade 10 Atanasyan topic 01 browser QA passed: topic, 4 lessons, spatial SVG, mobile and thematic print.');
await browser.close();
await new Promise(r=>server.close(r));
