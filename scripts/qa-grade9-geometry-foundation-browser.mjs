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
const response=await page.goto(`http://127.0.0.1:${port}/geometry/fixtures/grade9-foundation.html`,{waitUntil:'networkidle',timeout:25000});
if(!response?.ok())throw new Error(`fixture HTTP ${response?.status()}`);
await page.waitForSelector('.geometry-scene svg',{timeout:10000});
const metrics=await page.evaluate(()=>({
  scenes:document.querySelectorAll('.geometry-scene svg').length,
  grids:document.querySelectorAll('.geometry-grid').length,
  axes:document.querySelectorAll('.geometry-axis').length,
  arrows:document.querySelectorAll('[marker-end]').length,
  vectorLabels:document.querySelectorAll('.geometry-vector-label').length,
  scrollWidth:document.documentElement.scrollWidth,
  clientWidth:document.documentElement.clientWidth
}));
if(metrics.scenes!==2)throw new Error(`expected 2 scenes: ${JSON.stringify(metrics)}`);
if(metrics.grids<10||metrics.axes!==2||metrics.arrows<5||metrics.vectorLabels<4)throw new Error(`geometry primitives missing: ${JSON.stringify(metrics)}`);
if(metrics.scrollWidth>metrics.clientWidth+4)throw new Error(`mobile overflow ${metrics.scrollWidth}>${metrics.clientWidth}`);
if(errors.length)throw new Error(errors.join(' | '));
await page.emulateMedia({media:'print'});
const pdf=await page.pdf({format:'A4',printBackground:true});
if(pdf.length<7000)throw new Error(`fixture PDF too small ${pdf.length}`);
console.log('Grade 9 geometry foundation browser QA passed: vector, coordinate axes, mobile and print.');
await browser.close();
await new Promise(r=>server.close(r));
