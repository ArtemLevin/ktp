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
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const {port}=server.address();
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true});
const errors=[];
page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`);});

async function open(rel,selector,minText=800){
 errors.length=0;
 const response=await page.goto(`http://127.0.0.1:${port}/${rel}`,{waitUntil:'networkidle',timeout:25000});
 if(!response?.ok())throw new Error(`${rel}: HTTP ${response?.status()}`);
 if(selector)await page.waitForSelector(selector,{timeout:10000});
 const s=await page.evaluate(()=>({text:document.body.innerText.length,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,spatial:document.querySelectorAll('.spatial-scene svg').length,title:document.title}));
 if(s.scrollWidth>s.clientWidth+4)throw new Error(`${rel}: overflow ${s.scrollWidth}>${s.clientWidth}`);
 if(s.text<minText)throw new Error(`${rel}: text too short ${s.text}`);
 if(errors.length)throw new Error(`${rel}: ${errors.join(' | ')}`);
 return s;
}

const topic=await open('topics/10-geometry-atanasyan/02.html','.spatial-scene svg',9000);
if(topic.spatial<7)throw new Error(`topic spatial count ${topic.spatial}`);
let body=await page.locator('body').innerText();
for(const token of ['Параллельные прямые в пространстве','Скрещивающиеся прямые','Угол между прямыми','Параллельные плоскости','Метод следов','19 последовательных уроков','Открыть лабораторию'])if(!body.includes(token))throw new Error(`topic missing ${token}`);

await open('lessons/10-geometry-atanasyan/02/index.html','.lesson-tile',2500);
if(await page.locator('.lesson-tile').count()!==19)throw new Error('lesson index must contain 19 tiles');

for(let i=1;i<=19;i++){
 const id=String(i).padStart(2,'0');
 const s=await open(`lessons/10-geometry-atanasyan/02/${id}.html`,'.lesson-card',1600);
 if(s.spatial<1)throw new Error(`lesson ${id}: spatial missing`);
 if(await page.locator('[data-assessment-select="independent"] option').count()!==6)throw new Error(`lesson ${id}: independent variants`);
 if(await page.locator('[data-assessment-select="control"] option').count()!==6)throw new Error(`lesson ${id}: control variants`);
}

for(const kind of ['independent','control']){
 await open(`assessments/10-geometry-atanasyan/02/${kind}.html`,'.variant-buttons',1700);
 if(await page.locator('[data-pick]').count()!==6)throw new Error(`thematic ${kind}: six variants`);
 await page.emulateMedia({media:'print'});
 const pdf=await page.pdf({format:'A4',printBackground:true});
 if(pdf.length<12000)throw new Error(`thematic ${kind}: PDF too small ${pdf.length}`);
 await page.emulateMedia({media:'screen'});
}

await open('labs/10-geometry-atanasyan/parallel-space/index.html','#stage',1800);
if((await page.locator('#mode option').count())!==4)throw new Error('lab modes');
if((await page.locator('#truth').innerText())!=='Скрещивающиеся')throw new Error('lab default true relation');
const before=Number(await page.locator('#yaw').inputValue());
await page.locator('#yaw').focus();
await page.keyboard.press('ArrowRight');
const after=Number(await page.locator('#yaw').inputValue());
if(after<=before)throw new Error('lab keyboard yaw control');
let found=false;
for(const pitch of [12,20,30,40,50]){
 await page.locator('#pitch').fill(String(pitch));await page.locator('#pitch').dispatchEvent('input');
 for(let yaw=-80;yaw<=80;yaw+=10){
  await page.locator('#yaw').fill(String(yaw));await page.locator('#yaw').dispatchEvent('input');
  if((await page.locator('#projection').innerText()).includes('пересекаются')){found=true;break;}
 }
 if(found)break;
}
if(!found)throw new Error('lab should find misleading crossing projection for skew lines');
if((await page.locator('#truth').innerText())!=='Скрещивающиеся')throw new Error('lab 3D truth changed with camera');
await page.selectOption('#mode','parallel');
if((await page.locator('#truth').innerText())!=='Параллельные')throw new Error('lab parallel classification');
await page.selectOption('#mode','intersect');
if((await page.locator('#truth').innerText())!=='Пересекающиеся')throw new Error('lab intersect classification');
await page.selectOption('#mode','linePlane');
if((await page.locator('#truth').innerText())!=='a ∥ α')throw new Error('lab line-plane relation');

console.log('Grade 10 Atanasyan topic 02 browser QA passed: topic, 19 lessons, assessments, spatial lab, mobile and print.');
await browser.close();await new Promise(r=>server.close(r));
