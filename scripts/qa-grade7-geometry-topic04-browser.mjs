import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const ROOT=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{const raw=decodeURIComponent((req.url||'/').split('?')[0]);const rel=raw==='/'?'index.html':raw.replace(/^\/+/,''),target=path.normalize(path.join(ROOT,rel));if(!target.startsWith(path.normalize(ROOT+path.sep))||!fs.existsSync(target)){res.writeHead(404);return res.end('not found');}res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(target).pipe(res);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const {port}=server.address();
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true});
const errors=[];page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`)});
async function open(rel,selector,minText=1200){errors.length=0;const r=await page.goto(`http://127.0.0.1:${port}/${rel}`,{waitUntil:'networkidle',timeout:25000});if(!r?.ok())throw new Error(`${rel}: HTTP ${r?.status()}`);if(selector)await page.waitForSelector(selector,{timeout:10000});const s=await page.evaluate(()=>({title:document.title,text:document.body.innerText.length,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,scenes:document.querySelectorAll('.geometry-scene').length,svgs:document.querySelectorAll('.geometry-scene svg').length}));if(s.scrollWidth>s.clientWidth+4)throw new Error(`${rel}: mobile overflow ${s.scrollWidth}>${s.clientWidth}`);if(s.text<minText)throw new Error(`${rel}: rendered text too short ${s.text}`);if(errors.length)throw new Error(`${rel}: ${errors.join(' | ')}`);return s;}

const topic=await open('topics/7-geometry-atanasyan/04.html','.geometry-scene svg',4500);
if(!topic.title.includes('Соотношения между сторонами и углами треугольника'))throw new Error(`topic04: wrong title ${topic.title}`);
if(topic.svgs<9)throw new Error(`topic04: expected >=9 SVG scenes, got ${topic.svgs}`);
if(await page.locator('text=13 последовательных уроков').count()!==1)throw new Error('topic04: lesson navigation card missing');
if(await page.locator('text=6 вариантов каждого типа').count()!==1)throw new Error('topic04: assessment navigation card missing');

await open('lessons/7-geometry-atanasyan/04/index.html','.lesson-tile');
if(await page.locator('.lesson-tile').count()!==13)throw new Error('topic04 lesson index: expected 13 tiles');
const labels=await page.locator('.tile-top span').allTextContents();
if(!labels.includes('Урок 35')||!labels.includes('Урок 47'))throw new Error(`topic04 global numbering missing: ${labels.join(', ')}`);
for(const id of ['01','05','09','11','12','13']){const s=await open(`lessons/7-geometry-atanasyan/04/${id}.html`,'.lesson-card');const expected=34+Number(id);if(!s.title.includes(`Урок ${expected}`))throw new Error(`lesson ${id}: global title should be ${expected}`);if(await page.locator('[data-assessment-select="independent"] option').count()!==6)throw new Error(`lesson ${id}: independent variants`);if(await page.locator('[data-assessment-select="control"] option').count()!==6)throw new Error(`lesson ${id}: control variants`);if(s.svgs<1)throw new Error(`lesson ${id}: no geometry SVG`);}

await open('lessons/7-geometry-atanasyan/04/01.html','.lesson-card');
let text=await page.locator('body').innerText();
if(text.includes('Признак равнобедренного треугольника'))throw new Error('lesson35: future p.32 consequence leaked');
if(text.includes('половине гипотенузы'))throw new Error('lesson35: future p.34 property leaked');
await open('lessons/7-geometry-atanasyan/04/08.html','.lesson-card');text=await page.locator('body').innerText();if(text.includes('половине гипотенузы'))throw new Error('lesson42: 30-degree property must wait until lesson43');
await open('lessons/7-geometry-atanasyan/04/09.html','.lesson-card');text=await page.locator('body').innerText();if(!text.includes('половине гипотенузы'))throw new Error('lesson43: 30-degree property missing');
await open('lessons/7-geometry-atanasyan/04/11.html','.lesson-card');text=await page.locator('body').innerText();if(!text.includes('Расстояние от точки до прямой'))throw new Error('lesson45: distance definition missing');

for(const kind of ['independent','control']){await open(`assessments/7-geometry-atanasyan/04/${kind}.html`,'.variant-buttons',1800);if(await page.locator('[data-pick]').count()!==6)throw new Error(`thematic ${kind}: expected 6 variants`);await page.emulateMedia({media:'print'});const pdf=await page.pdf({format:'A4',printBackground:true});if(pdf.length<12000)throw new Error(`thematic ${kind}: PDF too small ${pdf.length}`);await page.emulateMedia({media:'screen'});}
console.log(`Grade 7 geometry topic 04 browser QA passed: ${topic.svgs} topic SVGs, 13 lesson tiles, global 35–47, sequence guards, mobile 390px, thematic print.`);
await browser.close();await new Promise(r=>server.close(r));
