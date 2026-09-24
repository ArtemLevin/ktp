import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const ROOT=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
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

const response=await page.goto(`http://127.0.0.1:${port}/geometry/fixtures/grade10-spatial-foundation.html`,{waitUntil:'networkidle',timeout:25000});
if(!response?.ok())throw new Error(`fixture HTTP ${response?.status()}`);
await page.waitForSelector('.spatial-scene svg',{timeout:10000});

const metrics=await page.evaluate(()=>({
  scenes:document.querySelectorAll('.spatial-scene svg').length,
  faces:document.querySelectorAll('.spatial-face').length,
  planes:document.querySelectorAll('.spatial-plane').length,
  hidden:document.querySelectorAll('.spatial-hidden').length,
  emphasis:document.querySelectorAll('.spatial-emphasis').length,
  points:document.querySelectorAll('.spatial-point').length,
  scrollWidth:document.documentElement.scrollWidth,
  clientWidth:document.documentElement.clientWidth,
  distance:window.KTP_SPATIAL.distance3([0,0,0],[1,2,2]),
  dot:window.KTP_SPATIAL.dot3([1,0,0],[0,1,0]),
  cross:window.KTP_SPATIAL.cross3([1,0,0],[0,1,0]),
  p1:window.KTP_SPATIAL.projectPoint([1,2,3],{yaw:0,pitch:0,scale:10,origin:[0,0]}),
  p2:window.KTP_SPATIAL.projectPoint([1,2,3],{yaw:Math.PI/4,pitch:Math.PI/6,scale:10,origin:[0,0]})
}));

if(metrics.scenes!==3)throw new Error(`expected 3 spatial scenes: ${JSON.stringify(metrics)}`);
if(metrics.faces<4||metrics.planes<1||metrics.hidden<4||metrics.emphasis<4||metrics.points<18)throw new Error(`spatial primitives missing: ${JSON.stringify(metrics)}`);
if(metrics.scrollWidth>metrics.clientWidth+4)throw new Error(`mobile overflow ${metrics.scrollWidth}>${metrics.clientWidth}`);
if(Math.abs(metrics.distance-3)>1e-9)throw new Error(`3D distance helper broken: ${metrics.distance}`);
if(Math.abs(metrics.dot)>1e-9)throw new Error(`3D dot helper broken: ${metrics.dot}`);
if(metrics.cross.x!==0||metrics.cross.y!==0||metrics.cross.z!==1)throw new Error(`3D cross helper broken: ${JSON.stringify(metrics.cross)}`);
if(metrics.p1.x===metrics.p2.x&&metrics.p1.y===metrics.p2.y)throw new Error('camera projection did not change');
if(errors.length)throw new Error(errors.join(' | '));

await page.emulateMedia({media:'print'});
const pdf=await page.pdf({format:'A4',printBackground:true});
if(pdf.length<9000)throw new Error(`fixture PDF too small ${pdf.length}`);

console.log('Grade 10 spatial foundation browser QA passed: 3D data, projection, hidden edges, mobile and print.');
await browser.close();
await new Promise(r=>server.close(r));
