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

const topic=await open('topics/7-geometry-atanasyan/02.html','.geometry-scene svg',4000);
if(!topic.title.includes('Треугольники'))throw new Error(`topic02: wrong title ${topic.title}`);
if(topic.svgs<7)throw new Error(`topic02: expected >=7 SVG scenes, got ${topic.svgs}`);
if(await page.locator('text=13 последовательных уроков').count()!==1)throw new Error('topic02: lesson navigation card missing');
if(await page.locator('text=6 вариантов каждого типа').count()!==1)throw new Error('topic02: assessment navigation card missing');

await open('lessons/7-geometry-atanasyan/02/index.html','.lesson-tile');
if(await page.locator('.lesson-tile').count()!==13)throw new Error('topic02 lesson index: expected 13 tiles');
const tileLabels=await page.locator('.tile-top span').allTextContents();
if(!tileLabels.includes('Урок 13')||!tileLabels.includes('Урок 25'))throw new Error(`global numbering missing on catalog: ${tileLabels.join(', ')}`);

for(const id of ['01','08','13']){
  const s=await open(`lessons/7-geometry-atanasyan/02/${id}.html`,'.lesson-card');
  const expected=12+Number(id);
  if(!s.title.includes(`Урок ${expected}`))throw new Error(`lesson ${id}: global title should be ${expected}, got ${s.title}`);
  if(await page.locator('[data-assessment-select="independent"] option').count()!==6)throw new Error(`lesson ${id}: independent variants`);
  if(await page.locator('[data-assessment-select="control"] option').count()!==6)throw new Error(`lesson ${id}: control variants`);
  if(s.svgs<1)throw new Error(`lesson ${id}: no rendered geometry SVG`);
}

for(const kind of ['independent','control']){
  await open(`assessments/7-geometry-atanasyan/02/${kind}.html`,'.variant-buttons',1800);
  if(await page.locator('[data-pick]').count()!==6)throw new Error(`thematic ${kind}: expected 6 variants`);
  await page.emulateMedia({media:'print'});
  const pdf=await page.pdf({format:'A4',printBackground:true});
  if(pdf.length<12000)throw new Error(`thematic ${kind}: PDF too small ${pdf.length}`);
  await page.emulateMedia({media:'screen'});
}

console.log(`Grade 7 geometry topic 02 browser QA passed: ${topic.svgs} topic SVGs, 13 lesson tiles, lessons 13/20/25, mobile 390px, thematic print.`);
await browser.close();
await new Promise(r=>server.close(r));
