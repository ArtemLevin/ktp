import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';
const root=process.cwd(),mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{
 const rel=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/,''),target=path.normalize(path.join(root,rel));
 if(!target.startsWith(path.normalize(root+path.sep))||!fs.existsSync(target)){res.writeHead(404);return res.end('not found');}
 res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'});fs.createReadStream(target).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true});
 let errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 async function open(rel){
  errors=[];const response=await page.goto(`http://127.0.0.1:${server.address().port}/${rel}`,{waitUntil:'networkidle'});
  if(!response?.ok())throw Error(`${rel}: HTTP ${response?.status()}`);
  const data=await page.evaluate(()=>({width:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,scenes:document.querySelectorAll('.revolution-scene svg').length,invalid:[...document.querySelectorAll('.revolution-scene path')].some(el=>/NaN|Infinity/.test(el.getAttribute('d')||'')),text:document.body.innerText.length,error:document.querySelectorAll('.revolution-error').length}));
  if(data.width>data.client+4||data.invalid||data.error||errors.length)throw Error(`${rel}: ${JSON.stringify(data)} ${errors.join('; ')}`);
  return data;
 }
 let data=await open('topics/11-geometry-atanasyan/01.html');
 if(data.scenes!==4||data.text<4500)throw Error(`topic content/scenes: ${JSON.stringify(data)}`);
 if(!await page.locator('a[href="../../lessons/11-geometry-atanasyan/01/index.html"]').count())throw Error('topic lesson link');
 data=await open('lessons/11-geometry-atanasyan/01/index.html');
 if(await page.locator('.lesson-tile').count()!==11)throw Error('index tiles');
 for(let i=1;i<=11;i++){
  const id=String(i).padStart(2,'0'),rel=`lessons/11-geometry-atanasyan/01/${id}.html`;data=await open(rel);
  if(data.scenes<1||data.text<1800)throw Error(`${rel}: scene/content ${JSON.stringify(data)}`);
  for(const kind of ['independent','control']){
   const select=page.locator(`[data-assessment-select="${kind}"]`);
   if(await select.locator('option').count()!==6)throw Error(`${rel}: ${kind} variants`);
   await select.selectOption('6');
   if(await page.locator(`[data-assessment-body="${kind}"] .task`).count()!==(kind==='independent'?5:6))throw Error(`${rel}: ${kind} tasks`);
  }
 }
 await page.emulateMedia({media:'print'});const pdf=await page.pdf({format:'A4',printBackground:true});
 if(pdf.length<15000)throw Error(`lesson print PDF too small: ${pdf.length}`);
 console.log('Grade 11 geometry topic 01 browser QA passed: topic, index, 11 lesson routes, 15 scenes, mobile, variant selection and print.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
