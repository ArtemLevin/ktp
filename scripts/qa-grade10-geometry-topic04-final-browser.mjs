import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const ROOT=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{
  const rel=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/, '')||'index.html';
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
  const s=await page.evaluate(()=>({
    text:document.body.innerText.length,
    scrollWidth:document.documentElement.scrollWidth,
    clientWidth:document.documentElement.clientWidth,
    spatial:document.querySelectorAll('.spatial-scene svg').length
  }));
  if(s.scrollWidth>s.clientWidth+4)throw new Error(rel+': overflow '+s.scrollWidth+'>'+s.clientWidth);
  if(s.text<minText)throw new Error(rel+': text too short '+s.text);
  if(errors.length)throw new Error(rel+': '+errors.join(' | '));
  return s;
}

const topic=await open('topics/10-geometry-atanasyan/04.html','.spatial-scene svg',9000);
if(topic.spatial<8)throw new Error('topic spatial scenes '+topic.spatial);
const topicText=await page.locator('body').innerText();
for(const token of ['18 последовательных уроков','Открыть 18 уроков','Проверочные материалы','Самостоятельная работа','Контрольная работа','Открыть лабораторию','Подобные тела']){
  if(!topicText.includes(token))throw new Error('topic missing '+token);
}

await open('lessons/10-geometry-atanasyan/04/index.html','.lesson-tile',2500);
if(await page.locator('.lesson-tile').count()!==18)throw new Error('lesson catalog !=18');

for(const kind of ['independent','control']){
  await open('assessments/10-geometry-atanasyan/04/'+kind+'.html','.variant-buttons',1800);
  if(await page.locator('[data-pick]').count()!==6)throw new Error('thematic '+kind+' !=6 variants');
  await page.locator('[data-pick="6"]').click();
  const cls=await page.locator('[data-pick="6"]').getAttribute('class');
  if(!(cls||'').includes('selected'))throw new Error('thematic '+kind+' variant switching');
  await page.emulateMedia({media:'print'});
  const pdf=await page.pdf({format:'A4',printBackground:true});
  if(pdf.length<12000)throw new Error('thematic '+kind+' PDF too small '+pdf.length);
  await page.emulateMedia({media:'screen'});
}

await open('labs/10-geometry-atanasyan/polyhedron-section/index.html','#stage',1600);
const readMetrics=async()=>({
  count:Number(await page.locator('#count').innerText()),
  area:Number(await page.locator('#area').innerText()),
  perimeter:Number(await page.locator('#perimeter').innerText())
});
await page.locator('#presetParallel').click();
let m=await readMetrics();
if(m.count!==4||Math.abs(m.area-48)>.02||Math.abs(m.perimeter-28)>.02)throw new Error('parallel section '+JSON.stringify(m));
await page.locator('#presetTriangle').click();
m=await readMetrics();if(m.count!==3)throw new Error('triangle preset '+JSON.stringify(m));
await page.locator('#presetPentagon').click();
m=await readMetrics();if(m.count!==5)throw new Error('pentagon preset '+JSON.stringify(m));

if(await page.locator('#presetHexagon').count()){
  await page.locator('#presetHexagon').click();
  m=await readMetrics();if(m.count!==6)throw new Error('hexagon preset '+JSON.stringify(m));
}

const before=await readMetrics();
const yaw0=Number(await page.locator('#yaw').inputValue());
await page.locator('#yaw').focus();
await page.keyboard.press('ArrowRight');
if(Number(await page.locator('#yaw').inputValue())<=yaw0)throw new Error('keyboard camera');
const after=await readMetrics();
if(before.count!==after.count||Math.abs(before.area-after.area)>.02||Math.abs(before.perimeter-after.perimeter)>.02)throw new Error('camera changed true section');

await page.emulateMedia({media:'print'});
const labPdf=await page.pdf({format:'A4',printBackground:true});
if(labPdf.length<15000)throw new Error('lab PDF too small '+labPdf.length);

console.log('Grade 10 Atanasyan topic 04 FINAL browser/mobile/assessment/lab/print QA passed.');
await browser.close();
await new Promise(r=>server.close(r));