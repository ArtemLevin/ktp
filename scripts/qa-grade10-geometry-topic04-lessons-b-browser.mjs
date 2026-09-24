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
async function metrics(){
  return{
    count:Number(await page.locator('#count').innerText()),
    area:Number(await page.locator('#area').innerText()),
    perimeter:Number(await page.locator('#perimeter').innerText()),
    kind:await page.locator('#kind').innerText(),
    equation:await page.locator('#equation').innerText(),
    edgeList:await page.locator('#edgeList').innerText(),
    faceList:await page.locator('#faceList').innerText()
  };
}
async function setRange(id,value){
  await page.locator('#'+id).fill(String(value));
  await page.locator('#'+id).dispatchEvent('input');
}
const close=(a,b,t=.02)=>Math.abs(a-b)<=t;

// Full second half of the lesson series.
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
  if(await page.locator('details.answer').count()<8)throw new Error('lesson '+id+': too few answer disclosures');
}

// Topic exposes the complete 18-lesson series and implemented lab.
await open('topics/10-geometry-atanasyan/04.html','.spatial-scene svg',8500);
const topicText=await page.locator('body').innerText();
for(const token of ['18 последовательных уроков','Открыть 18 уроков','Открыть лабораторию']){
  if(!topicText.includes(token))throw new Error('topic missing '+token);
}

// Section lab: default pentagon and camera invariance.
await open('labs/10-geometry-atanasyan/polyhedron-section/index.html','#stage',1700);
let m=await metrics();
if(m.count!==5||!m.kind.includes('пятиугольник'))throw new Error('default lab must be pentagon '+JSON.stringify(m));
if(!Number.isFinite(m.area)||!Number.isFinite(m.perimeter))throw new Error('default metrics not finite');

const before={count:m.count,area:m.area,perimeter:m.perimeter};
const yaw0=Number(await page.locator('#yaw').inputValue());
await page.locator('#yaw').focus();
await page.keyboard.press('ArrowRight');
if(Number(await page.locator('#yaw').inputValue())<=yaw0)throw new Error('keyboard yaw control');
m=await metrics();
if(m.count!==before.count||!close(m.area,before.area,.01)||!close(m.perimeter,before.perimeter,.01))throw new Error('camera changed true section metrics');

// Four-sided section parallel to the base: exact rectangle 8×6.
await page.locator('#presetParallel').click();
m=await metrics();
if(m.count!==4||!close(m.area,48,.01)||!close(m.perimeter,28,.01))throw new Error('parallel preset '+JSON.stringify(m));
for(const face of ['x=0','x=8','y=0','y=6'])if(!m.faceList.includes(face))throw new Error('parallel section face trace missing '+face+': '+m.faceList);
if(m.faceList.includes('проверить'))throw new Error('parallel section face trace unresolved '+m.faceList);

// Three-sided preset.
await page.locator('#presetTriangle').click();
m=await metrics();
if(m.count!==3||!m.kind.includes('треугольник'))throw new Error('triangle preset '+JSON.stringify(m));
if(m.faceList.includes('проверить'))throw new Error('triangle face trace unresolved '+m.faceList);

// Five-sided preset.
await page.locator('#presetPentagon').click();
m=await metrics();
if(m.count!==5||!m.kind.includes('пятиугольник'))throw new Error('pentagon preset '+JSON.stringify(m));
if(m.faceList.includes('проверить'))throw new Error('pentagon face trace unresolved '+m.faceList);

// General maximum for a plane section of a parallelepiped: six sides.
await page.locator('#presetHexagon').click();
m=await metrics();
if(m.count!==6||!m.kind.includes('шестиугольник'))throw new Error('hexagon preset '+JSON.stringify(m));
if(!close(m.area,57.63,.03)||!close(m.perimeter,28.49,.03))throw new Error('hexagon metrics '+JSON.stringify(m));
if(!m.equation.includes('z = 9')||!m.equation.includes('0.75x'))throw new Error('hexagon plane equation '+m.equation);
if(m.faceList.includes('проверить'))throw new Error('hexagon face trace unresolved '+m.faceList);
for(const id of ['p','q','r'])if(!(await page.locator('#'+id).isDisabled()))throw new Error('hexagon must lock '+id);
if(!(await page.locator('#modeNote').innerText()).includes('другом наборе рёбер'))throw new Error('hexagon mode explanation');

// Camera remains a pure view transform even for the six-sided section.
const hexBefore={count:m.count,area:m.area,perimeter:m.perimeter};
await page.locator('#pitch').focus();
await page.keyboard.press('ArrowUp');
m=await metrics();
if(m.count!==hexBefore.count||!close(m.area,hexBefore.area,.01)||!close(m.perimeter,hexBefore.perimeter,.01))throw new Error('hexagon metrics changed with camera');

// Reset returns to the editable five-sided family.
await page.locator('#reset').click();
m=await metrics();
if(m.count!==5)throw new Error('reset must return pentagon');
for(const id of ['p','q','r'])if(await page.locator('#'+id).isDisabled())throw new Error('reset must unlock '+id);

// Degenerate boundary case: whole bottom face z=0.
await setRange('p',0);await setRange('q',0);await setRange('r',0);
m=await metrics();
if(m.count!==4||!close(m.area,48,.01)||!close(m.perimeter,28,.01))throw new Error('bottom-face degeneracy '+JSON.stringify(m));
if(!m.faceList.includes('z=0'))throw new Error('bottom face trace '+m.faceList);

// Degenerate boundary case: whole top face z=6.
await setRange('p',6);await setRange('q',6);await setRange('r',6);
m=await metrics();
if(m.count!==4||!close(m.area,48,.01)||!close(m.perimeter,28,.01))throw new Error('top-face degeneracy '+JSON.stringify(m));
if(!m.faceList.includes('z=6'))throw new Error('top face trace '+m.faceList);

// Exact passage through a box vertex: deduplication must keep one geometric point.
await setRange('p',0);await setRange('q',5);await setRange('r',4);
m=await metrics();
if(m.count<3||m.count>6||!Number.isFinite(m.area)||!Number.isFinite(m.perimeter))throw new Error('vertex passage unstable '+JSON.stringify(m));
if(!m.edgeList.includes('AA1')||!m.edgeList.includes('AB'))throw new Error('vertex-edge membership not preserved '+m.edgeList);

// Near-boundary floating-point case.
await setRange('p',0);await setRange('q',0.25);await setRange('r',5.75);
m=await metrics();
if(m.count<3||m.count>6||!Number.isFinite(m.area)||!Number.isFinite(m.perimeter))throw new Error('near-degenerate case unstable '+JSON.stringify(m));
if(m.faceList.includes('проверить'))throw new Error('near-degenerate face trace unresolved '+m.faceList);

// Restore and verify visual toggles affect rendering rather than mathematical values.
await page.locator('#reset').click();
const stable=await metrics();
if(await page.locator('#stage .label, #stage .seed-label').count()===0)throw new Error('labels should start visible');
await page.locator('#labels').uncheck();
if(await page.locator('#stage .label, #stage .seed-label').count()!==0)throw new Error('labels toggle did not remove labels');
if(await page.locator('#stage .plane').count()===0)throw new Error('plane patch should start visible');
await page.locator('#planePatch').uncheck();
if(await page.locator('#stage .plane').count()!==0)throw new Error('plane patch toggle did not remove patch');
m=await metrics();
if(m.count!==stable.count||!close(m.area,stable.area,.01)||!close(m.perimeter,stable.perimeter,.01))throw new Error('visual toggles changed geometry');

await page.emulateMedia({media:'print'});
const pdf=await page.pdf({format:'A4',printBackground:true});
if(pdf.length<15000)throw new Error('lab print PDF too small '+pdf.length);

console.log('Grade 10 Atanasyan topic 04 STAGE 4 browser release QA passed: lessons 52-60, 3/4/5/6 sections, degeneracy, camera invariance, keyboard, mobile and print.');
await browser.close();
await new Promise(r=>server.close(r));
