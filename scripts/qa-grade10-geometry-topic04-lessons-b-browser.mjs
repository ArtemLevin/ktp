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

await open('lessons/10-geometry-atanasyan/04/index.html','.lesson-tile',2500);
if(await page.locator('.lesson-tile').count()!==18)throw new Error('catalog must contain 18 lessons');

for(let i=10;i<=18;i++){
  const id=String(i).padStart(2,'0'),global=42+i;
  const state=await open('lessons/10-geometry-atanasyan/04/'+id+'.html','.lesson-card',1900);
  if(state.spatial<1)throw new Error('lesson '+id+': spatial missing');
  if(await page.locator('[data-assessment-select="independent"] option').count()!==6)throw new Error('lesson '+id+': independent variants');
  if(await page.locator('[data-assessment-select="control"] option').count()!==6)throw new Error('lesson '+id+': control variants');
  const hero=(await page.locator('.lesson-hero h1 span').innerText()).toUpperCase();
  if(hero!==('Урок '+global).toUpperCase())throw new Error('lesson '+id+': global number '+hero);
}

await open('topics/10-geometry-atanasyan/04.html','.spatial-scene svg',8500);
const topicText=await page.locator('body').innerText();
for(const token of ['18 последовательных уроков','Открыть 18 уроков','Открыть лабораторию']){
  if(!topicText.includes(token))throw new Error('topic missing '+token);
}

await open('labs/10-geometry-atanasyan/polyhedron-section/index.html','#stage',2000);
async function metrics(){
  return{
    count:Number(await page.locator('#count').innerText()),
    area:Number(await page.locator('#area').innerText()),
    perimeter:Number(await page.locator('#perimeter').innerText()),
    kind:await page.locator('#kind').innerText()
  };
}
let m=await metrics();
if(m.count!==5||!m.kind.includes('пятиугольник'))throw new Error('default lab must be pentagon '+JSON.stringify(m));

const yaw0=Number(await page.locator('#yaw').inputValue());
const before={...m};
await page.locator('#yaw').focus();
await page.keyboard.press('ArrowRight');
if(Number(await page.locator('#yaw').inputValue())<=yaw0)throw new Error('keyboard yaw control');
m=await metrics();
if(m.count!==before.count||Math.abs(m.area-before.area)>.01||Math.abs(m.perimeter-before.perimeter)>.01)throw new Error('camera changed true section metrics');

await page.locator('#presetParallel').click();
m=await metrics();
if(m.count!==4||Math.abs(m.area-48)>.01||Math.abs(m.perimeter-28)>.01)throw new Error('parallel preset '+JSON.stringify(m));

await page.locator('#presetTriangle').click();
m=await metrics();
if(m.count!==3)throw new Error('triangle preset '+JSON.stringify(m));

await page.locator('#presetPentagon').click();
m=await metrics();
if(m.count!==5)throw new Error('pentagon preset '+JSON.stringify(m));

const edges=await page.locator('#edgeList').innerText();
const faces=await page.locator('#faceList').innerText();
if(!edges.includes('M:')||!faces.includes('='))throw new Error('lab edge/face trace output missing');

await page.locator('#labels').uncheck();
if(await page.locator('#labels').isChecked())throw new Error('labels toggle');
await page.locator('#planePatch').uncheck();
if(await page.locator('#planePatch').isChecked())throw new Error('plane toggle');

await page.emulateMedia({media:'print'});
const pdf=await page.pdf({format:'A4',printBackground:true});
if(pdf.length<15000)throw new Error('lab print PDF too small '+pdf.length);

console.log('Grade 10 Atanasyan topic 04 lessons 52-60 + section lab browser QA passed.');
await browser.close();
await new Promise(r=>server.close(r));
