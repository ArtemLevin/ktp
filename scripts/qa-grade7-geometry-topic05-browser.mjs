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

const topic=await open('topics/7-geometry-atanasyan/05.html','.geometry-scene svg',4500);
if(!topic.title.includes('Геометрические места точек. Симметрия'))throw new Error(`topic05: wrong title ${topic.title}`);
if(topic.svgs<10)throw new Error(`topic05: expected >=10 SVG scenes, got ${topic.svgs}`);
if(await page.locator('text=13 последовательных уроков').count()!==1)throw new Error('topic05: lesson navigation card missing');
if(await page.locator('text=6 вариантов каждого типа').count()!==1)throw new Error('topic05: assessment navigation card missing');
if(await page.locator('text=Лаборатория ГМТ и касания').count()<1)throw new Error('topic05: lab card missing');

await open('lessons/7-geometry-atanasyan/05/index.html','.lesson-tile');
if(await page.locator('.lesson-tile').count()!==13)throw new Error('topic05 lesson index: expected 13 tiles');
const labels=await page.locator('.tile-top span').allTextContents();
if(!labels.includes('Урок 48')||!labels.includes('Урок 60'))throw new Error(`topic05 global numbering missing: ${labels.join(', ')}`);
for(const id of ['01','03','04','06','07','08','09','10','11','12','13']){const s=await open(`lessons/7-geometry-atanasyan/05/${id}.html`,'.lesson-card');const expected=47+Number(id);if(!s.title.includes(`Урок ${expected}`))throw new Error(`lesson ${id}: global title should be ${expected}`);if(await page.locator('[data-assessment-select="independent"] option').count()!==6)throw new Error(`lesson ${id}: independent variants`);if(await page.locator('[data-assessment-select="control"] option').count()!==6)throw new Error(`lesson ${id}: control variants`);if(s.svgs<1)throw new Error(`lesson ${id}: no geometry SVG`);}

await open('lessons/7-geometry-atanasyan/05/01.html','.lesson-card');let text=await page.locator('body').innerText();if(text.includes('равноудалённых от двух пересекающихся прямых'))throw new Error('lesson48: bisector locus theorem leaked before lesson50');
await open('lessons/7-geometry-atanasyan/05/03.html','.lesson-card');text=await page.locator('body').innerText();if(text.includes('Центр окружности касается обеих сторон угла'))throw new Error('lesson50: tangency construction leaked before lesson53/54');
await open('lessons/7-geometry-atanasyan/05/06.html','.lesson-card');text=await page.locator('body').innerText();if(!text.includes('ровно одну общую точку'))throw new Error('lesson53: tangent definition missing');if(text.includes('перпендикулярна радиусу'))throw new Error('lesson53: tangent-radius theorem leaked before lesson54');
await open('lessons/7-geometry-atanasyan/05/07.html','.lesson-card');text=await page.locator('body').innerText();if(!text.includes('перпендикулярна радиусу'))throw new Error('lesson54: tangent-radius theorem missing');

// The lab is intentionally compact: validate its controls/states rather than requiring lesson-page text volume.
await open('labs/7-geometry-atanasyan/loci-circle/index.html','#stage',600);
let out=await page.locator('#out').innerText();if(!out.includes('Равноудалённость выполняется'))throw new Error(`lab bisector neutral state: ${out}`);
await page.locator('#offset').evaluate(el=>{el.value='30';el.dispatchEvent(new Event('input',{bubbles:true}));});out=await page.locator('#out').innerText();if(!out.includes('Равноудалённость нарушена'))throw new Error(`lab bisector offset state: ${out}`);
await page.selectOption('#mode','perp');await page.locator('#offset').evaluate(el=>{el.value='0';el.dispatchEvent(new Event('input',{bubbles:true}));});out=await page.locator('#out').innerText();if(!out.includes('MA = MB'))throw new Error(`lab perpendicular state: ${out}`);
await page.selectOption('#mode','tangent');out=await page.locator('#out').innerText();if(!out.includes('Касательное положение'))throw new Error(`lab tangent neutral state: ${out}`);
await page.locator('#offset').evaluate(el=>{el.value='40';el.dispatchEvent(new Event('input',{bubbles:true}));});out=await page.locator('#out').innerText();if(!out.includes('Прямая отклонена от касательной'))throw new Error(`lab tangent offset state: ${out}`);
const labSize=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));if(labSize.scrollWidth>labSize.clientWidth+4)throw new Error(`lab mobile overflow ${labSize.scrollWidth}>${labSize.clientWidth}`);

for(const kind of ['independent','control']){await open(`assessments/7-geometry-atanasyan/05/${kind}.html`,'.variant-buttons',1800);if(await page.locator('[data-pick]').count()!==6)throw new Error(`thematic ${kind}: expected 6 variants`);await page.emulateMedia({media:'print'});const pdf=await page.pdf({format:'A4',printBackground:true});if(pdf.length<12000)throw new Error(`thematic ${kind}: PDF too small ${pdf.length}`);await page.emulateMedia({media:'screen'});}
console.log(`Grade 7 geometry topic 05 browser QA passed: ${topic.svgs} topic SVGs, 13 lesson tiles, global 48–60, sequence guards, interactive lab, mobile 390px, thematic print.`);
await browser.close();await new Promise(r=>server.close(r));
