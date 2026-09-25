import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const ROOT=process.cwd(),mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{const rel=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/, '')||'index.html';const target=path.normalize(path.join(ROOT,rel));if(!target.startsWith(path.normalize(ROOT+path.sep))||!fs.existsSync(target)){res.writeHead(404);return res.end('not found');}res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(target).pipe(res);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const {port}=server.address();
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:390,height:844},isMobile:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
async function open(rel,selector,min=1000){errors.length=0;const r=await page.goto('http://127.0.0.1:'+port+'/'+rel,{waitUntil:'networkidle',timeout:30000});if(!r?.ok())throw new Error(rel+' HTTP '+r?.status());if(selector)await page.waitForSelector(selector);const s=await page.evaluate(()=>({text:document.body.innerText.length,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,spatial:document.querySelectorAll('.spatial-scene svg').length}));if(s.sw>s.cw+4)throw new Error(rel+' overflow');if(s.text<min)throw new Error(rel+' text '+s.text);if(errors.length)throw new Error(rel+' '+errors.join(' | '));return s;}

await open('lessons/10-geometry-atanasyan/05/index.html','.lesson-tile',1500);
if(await page.locator('.lesson-tile').count()!==8)throw new Error('catalog != 8');
const nos=await page.locator('.lesson-tile .tile-top span').allInnerTexts();
if(nos.map(x=>x.toUpperCase()).join('|')!=='УРОК 61|УРОК 62|УРОК 63|УРОК 64|УРОК 65|УРОК 66|УРОК 67|УРОК 68')throw new Error('numbering '+JSON.stringify(nos));
for(let i=5;i<=8;i++){const id=String(i).padStart(2,'0'),global=60+i,s=await open('lessons/10-geometry-atanasyan/05/'+id+'.html','.lesson-card',1700);if(s.spatial<1)throw new Error(id+' spatial');if(await page.locator('[data-assessment-select="independent"] option').count()!==6)throw new Error(id+' independent');if(await page.locator('[data-assessment-select="control"] option').count()!==6)throw new Error(id+' control');const hero=(await page.locator('.lesson-hero h1 span').innerText()).toUpperCase();if(hero!==('Урок '+global).toUpperCase())throw new Error(id+' global '+hero);}

await open('topics/10-geometry-atanasyan/05.html','.spatial-scene svg',7500);
const topic=await page.locator('body').innerText();
for(const t of ['8 итоговых уроков','Открыть 8 уроков','Открыть лабораторию','Spatial Router'])if(!topic.includes(t))throw new Error('topic missing '+t);

await open('labs/10-geometry-atanasyan/spatial-router/index.html','#stage',1700);
if(await page.locator('#scenario option').count()!==10)throw new Error('router scenarios');
if(!(await page.locator('#firstStep').isHidden()))throw new Error('first step visible too early');
const truth=await page.locator('#truth').innerText(),yaw=Number(await page.locator('#yaw').inputValue());
await page.locator('#yaw').focus();await page.keyboard.press('ArrowRight');
if(Number(await page.locator('#yaw').inputValue())<=yaw)throw new Error('keyboard yaw');
if(await page.locator('#truth').innerText()!==truth)throw new Error('camera changed truth');
await page.locator('[data-method="0"]').click();
if(await page.locator('#firstStep').isHidden())throw new Error('first step not revealed');
if(await page.locator('#attempts').innerText()!=='1'||await page.locator('#firstCorrect').innerText()!=='1')throw new Error('stats');
await page.locator('[data-control="1"]').click();
if(!(await page.locator('#controlFeedback').innerText()).includes('пройден'))throw new Error('control');
await page.locator('#scenario').selectOption('linePlane');await page.locator('[data-method="1"]').click();
if(!(await page.locator('#errorCodes').innerText()).includes('COND'))throw new Error('error code');
if(!(await page.locator('#repeatList').innerText()).includes('Прямая и плоскость'))throw new Error('repeat list');
const before=await page.locator('#truth').innerText(),faces=await page.locator('#stage .work-face').count();
await page.locator('#workingPlane').uncheck();
if(faces<1||await page.locator('#stage .work-face').count()!==0)throw new Error('work plane toggle');
if(await page.locator('#truth').innerText()!==before)throw new Error('toggle changed truth');
await page.reload({waitUntil:'networkidle'});if(Number(await page.locator('#attempts').innerText())<2)throw new Error('session restore');

for(const value of ['lines','linePlane','perpPlane','distance','threePerp','linePlaneAngle','dihedral','section','surfaceVolume','similar']){errors.length=0;await page.locator('#scenario').selectOption(value);if(await page.locator('#stage line').count()<1)throw new Error(value+' no geometry');if(errors.length)throw new Error(value+' '+errors.join(' | '));}

await page.emulateMedia({media:'print'});const pdf=await page.pdf({format:'A4',printBackground:true});if(pdf.length<15000)throw new Error('router PDF '+pdf.length);
console.log('Grade 10 Atanasyan topic 05 STAGE 4 browser/router QA passed.');
await browser.close();await new Promise(r=>server.close(r));