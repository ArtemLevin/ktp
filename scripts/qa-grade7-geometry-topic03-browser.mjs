import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const ROOT=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent((req.url||'/').split('?')[0]);
  const rel=raw==='/'?'index.html':raw.replace(/^\/+/,''),target=path.normalize(path.join(ROOT,rel));
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
page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`)});

async function open(rel,selector,minText=1200){
  errors.length=0;
  const r=await page.goto(`http://127.0.0.1:${port}/${rel}`,{waitUntil:'networkidle',timeout:25000});
  if(!r?.ok())throw new Error(`${rel}: HTTP ${r?.status()}`);
  if(selector)await page.waitForSelector(selector,{timeout:10000});
  const s=await page.evaluate(()=>({
    title:document.title,
    text:document.body.innerText.length,
    scrollWidth:document.documentElement.scrollWidth,
    clientWidth:document.documentElement.clientWidth,
    scenes:document.querySelectorAll('.geometry-scene').length,
    svgs:document.querySelectorAll('.geometry-scene svg').length
  }));
  if(s.scrollWidth>s.clientWidth+4)throw new Error(`${rel}: mobile overflow ${s.scrollWidth}>${s.clientWidth}`);
  if(s.text<minText)throw new Error(`${rel}: rendered text too short ${s.text}`);
  if(errors.length)throw new Error(`${rel}: ${errors.join(' | ')}`);
  return s;
}

const topic=await open('topics/7-geometry-atanasyan/03.html','.geometry-scene svg',4000);
if(!topic.title.includes('Параллельные прямые'))throw new Error(`topic03: wrong title ${topic.title}`);
if(topic.svgs<5)throw new Error(`topic03: expected >=5 SVG scenes, got ${topic.svgs}`);
if(await page.locator('text=9 последовательных уроков').count()!==1)throw new Error('topic03: lesson navigation card missing');
if(await page.locator('text=6 вариантов каждого типа').count()!==1)throw new Error('topic03: assessment navigation card missing');

await open('lessons/7-geometry-atanasyan/03/index.html','.lesson-tile');
if(await page.locator('.lesson-tile').count()!==9)throw new Error('topic03 lesson index: expected 9 tiles');
const tileLabels=await page.locator('.tile-top span').allTextContents();
if(!tileLabels.includes('Урок 26')||!tileLabels.includes('Урок 34'))throw new Error(`global numbering missing on catalog: ${tileLabels.join(', ')}`);

for(const id of ['01','06','09']){
  const s=await open(`lessons/7-geometry-atanasyan/03/${id}.html`,'.lesson-card');
  const expected=25+Number(id);
  if(!s.title.includes(`Урок ${expected}`))throw new Error(`lesson ${id}: global title should be ${expected}, got ${s.title}`);
  if(await page.locator('[data-assessment-select="independent"] option').count()!==6)throw new Error(`lesson ${id}: independent variants`);
  if(await page.locator('[data-assessment-select="control"] option').count()!==6)throw new Error(`lesson ${id}: control variants`);
  if(s.svgs<1)throw new Error(`lesson ${id}: no rendered geometry SVG`);
}

await open('lessons/7-geometry-atanasyan/03/01.html','.lesson-card');
const lesson26Text=await page.locator('body').innerText();
for(const forbidden of ['Сформулируйте аксиому параллельных прямых','a ∥ b. Накрест лежащий угол'])if(lesson26Text.includes(forbidden))throw new Error(`lesson26: future theorem visible: ${forbidden}`);
await open('lessons/7-geometry-atanasyan/03/07.html','.lesson-card');
const lesson32Text=await page.locator('body').innerText();
if(!lesson32Text.includes('Свойства углов при параллельных прямых'))throw new Error('lesson32: properties title missing');

for(const kind of ['independent','control']){
  await open(`assessments/7-geometry-atanasyan/03/${kind}.html`,'.variant-buttons',1800);
  if(await page.locator('[data-pick]').count()!==6)throw new Error(`thematic ${kind}: expected 6 variants`);
  await page.emulateMedia({media:'print'});
  const pdf=await page.pdf({format:'A4',printBackground:true});
  if(pdf.length<12000)throw new Error(`thematic ${kind}: PDF too small ${pdf.length}`);
  await page.emulateMedia({media:'screen'});
}

console.log(`Grade 7 geometry topic 03 browser QA passed: ${topic.svgs} topic SVGs, 9 lesson tiles, lessons 26/31/34, sequence guard, mobile 390px, thematic print.`);
await browser.close();
await new Promise(r=>server.close(r));
