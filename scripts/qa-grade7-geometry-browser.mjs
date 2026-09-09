import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const ROOT=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent((req.url||'/').split('?')[0]);
  const rel=(raw==='/'?'index.html':raw.replace(/^\/+/,''));
  const target=path.normalize(path.join(ROOT,rel));
  if(!target.startsWith(path.normalize(ROOT+path.sep))){res.writeHead(403);return res.end('forbidden');}
  if(!fs.existsSync(target)){res.writeHead(404);return res.end('not found');}
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(target).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {port}=server.address();
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true});

const errors=[];
page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`);});

const url=`http://127.0.0.1:${port}/topics/7-geometry-atanasyan/01.html`;
const response=await page.goto(url,{waitUntil:'networkidle',timeout:20000});
if(!response?.ok())throw new Error(`topic01 HTTP ${response?.status()}`);

await page.waitForSelector('.geometry-scene svg',{timeout:8000});
const mobile=await page.evaluate(()=>({
  title:document.title,
  bodyText:document.body.innerText.length,
  scrollWidth:document.documentElement.scrollWidth,
  clientWidth:document.documentElement.clientWidth,
  scenes:document.querySelectorAll('.geometry-scene').length,
  svgs:document.querySelectorAll('.geometry-scene svg').length,
  aria:[...document.querySelectorAll('.geometry-scene')].map(x=>x.getAttribute('aria-label')),
  captions:[...document.querySelectorAll('.geometry-caption')].map(x=>x.textContent.trim()),
  visible:[...document.querySelectorAll('.geometry-scene')].every(x=>{const r=x.getBoundingClientRect();return r.width>100&&r.height>80})
}));
if(!mobile.title.includes('Начальные геометрические сведения'))throw new Error(`wrong title: ${mobile.title}`);
if(mobile.bodyText<4000)throw new Error(`rendered text too short: ${mobile.bodyText}`);
if(mobile.scrollWidth>mobile.clientWidth+4)throw new Error(`mobile overflow: ${mobile.scrollWidth} > ${mobile.clientWidth}`);
if(mobile.scenes!==5||mobile.svgs!==5)throw new Error(`expected 5 rendered scenes, got ${mobile.scenes}/${mobile.svgs}`);
if(mobile.aria.some(x=>!x)||mobile.captions.some(x=>!x))throw new Error('scene accessibility text missing');
if(!mobile.visible)throw new Error('one or more geometry scenes collapsed');
if(errors.length)throw new Error(errors.join(' | '));

await page.emulateMedia({media:'print'});
await page.waitForTimeout(100);
const printState=await page.evaluate(()=>({
  bodyDisplay:getComputedStyle(document.body).display,
  scenes:[...document.querySelectorAll('.geometry-scene')].map(x=>({display:getComputedStyle(x).display,width:x.getBoundingClientRect().width}))
}));
if(printState.bodyDisplay==='none')throw new Error('body hidden in print');
if(printState.scenes.some(x=>x.display==='none'||x.width<100))throw new Error('geometry scene hidden in print');
const pdf=await page.pdf({format:'A4',printBackground:true});
if(pdf.length<15000)throw new Error(`print PDF unexpectedly small: ${pdf.length}`);

console.log(`Grade 7 geometry browser QA passed: ${mobile.bodyText} chars, ${mobile.scenes} SVG scenes, 390px mobile, A4 PDF ${pdf.length} bytes.`);
await browser.close();
await new Promise(resolve=>server.close(resolve));
