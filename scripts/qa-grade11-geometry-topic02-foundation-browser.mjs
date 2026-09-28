import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{
  const rel=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/,''),target=path.normalize(path.join(root,rel));
  if(!target.startsWith(path.normalize(root+path.sep))||!fs.existsSync(target)){res.writeHead(404);return res.end('not found');}
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'});
  fs.createReadStream(target).pipe(res);
});

await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true});
  const errors=[];
  const failed=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('requestfailed',r=>failed.push(`${r.url()} :: ${r.failure()?.errorText||'failed'}`));

  const response=await page.goto(`http://127.0.0.1:${server.address().port}/topics/11-geometry-atanasyan/02.html`,{waitUntil:'networkidle'});
  if(!response?.ok())throw Error(`topic route HTTP ${response?.status()}`);

  const data=await page.evaluate(()=>({
    width:document.documentElement.scrollWidth,
    client:document.documentElement.clientWidth,
    scenes:document.querySelectorAll('.spatial-scene svg').length,
    sceneErrors:document.querySelectorAll('.spatial-scene-error').length,
    theory:document.querySelectorAll('.theory-block').length,
    examples:document.querySelectorAll('.example').length,
    mistakes:document.querySelectorAll('.mistake').length,
    diagnostics:document.querySelectorAll('.diagnostic-item').length,
    taskCount:document.querySelectorAll('.task').length,
    text:document.body.innerText.length,
    invalidSvg:[...document.querySelectorAll('.spatial-scene svg *')].some(el=>[...el.attributes].some(a=>/NaN|Infinity/.test(a.value))),
    h1:document.querySelector('h1')?.textContent||''
  }));

  if(data.h1!=='Объёмы многогранников')throw Error(`wrong h1: ${data.h1}`);
  if(data.scenes!==10||data.sceneErrors!==0)throw Error(`scene count/errors: ${JSON.stringify(data)}`);
  if(data.theory!==10||data.examples<8||data.mistakes<9||data.diagnostics<8)throw Error(`content blocks: ${JSON.stringify(data)}`);
  if(data.taskCount<26)throw Error(`too few self-study tasks: ${data.taskCount}`);
  if(data.text<8000)throw Error(`topic text too short: ${data.text}`);
  if(data.width>data.client+4)throw Error(`mobile overflow: ${data.width} > ${data.client}`);
  if(data.invalidSvg)throw Error('NaN/Infinity in SVG');
  if(errors.length)throw Error(`browser errors: ${errors.join('; ')}`);
  if(failed.length)throw Error(`failed requests: ${failed.join('; ')}`);

  await page.setViewportSize({width:1440,height:1000});
  const desktop=await page.evaluate(()=>({width:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  if(desktop.width>desktop.client+4)throw Error(`desktop overflow: ${JSON.stringify(desktop)}`);

  await page.emulateMedia({media:'print'});
  const pdf=await page.pdf({format:'A4',printBackground:true});
  if(pdf.length<25000)throw Error(`topic print PDF too small: ${pdf.length}`);

  console.log('Grade 11 geometry topic 02 browser QA passed: 10 scenes, rich content, mobile, desktop and print.');
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
