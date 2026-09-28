import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{
  const rel=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/, '');
  const target=path.normalize(path.join(root,rel));
  if(!target.startsWith(path.normalize(root+path.sep))||!fs.existsSync(target)){res.writeHead(404);return res.end('not found');}
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'});
  fs.createReadStream(target).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const response=await page.goto(`http://127.0.0.1:${server.address().port}/geometry/fixtures/grade11-revolution.html`,{waitUntil:'networkidle'});
  if(!response?.ok())throw Error(`fixture HTTP ${response?.status()}`);
  await page.waitForSelector('.revolution-scene svg');
  const data=await page.evaluate(()=>{
    const scenes=[...document.querySelectorAll('.revolution-scene')];
    return{
      count:scenes.length,
      ids:scenes.map(s=>s.dataset.revolutionScene),
      labelled:scenes.every(s=>s.getAttribute('aria-label')&&s.querySelector('figcaption')?.textContent),
      paths:[...document.querySelectorAll('.revolution-scene svg path')].length,
      hidden:document.querySelectorAll('.revolution-hidden').length,
      sections:document.querySelectorAll('.revolution-section').length,
      tangent:document.querySelectorAll('.revolution-tangent').length,
      invalid:[...document.querySelectorAll('.revolution-scene svg path')].some(p=>/NaN|Infinity/.test(p.getAttribute('d'))),
      overflow:document.documentElement.scrollWidth>innerWidth+1,
      math:window.KTP_REVOLUTION_MATH.metrics({type:'ball',radius:3}).volume,
      body:document.body.innerText
    };
  });
  if(data.count!==5||data.ids.join(',')!=='cylinder,cone,frustum,sphere-section,sphere-tangent')throw Error(`scenes: ${data.ids}`);
  if(!data.labelled||data.paths<100||!data.hidden||data.sections<2||data.tangent!==1||data.invalid||data.overflow)throw Error(`render metrics: ${JSON.stringify({...data,body:undefined})}`);
  if(Math.abs(data.math-36*Math.PI)>1e-9)throw Error('browser math mismatch');
  if(errors.length)throw Error(errors.join('\n'));
  await page.emulateMedia({media:'print'});
  const print=await page.evaluate(()=>({scenes:document.querySelectorAll('.revolution-scene').length,breakInside:getComputedStyle(document.querySelector('.revolution-scene')).breakInside}));
  if(print.scenes!==5||print.breakInside!=='avoid')throw Error(`print: ${JSON.stringify(print)}`);
  console.log('Grade 11 revolution browser/mobile/print QA passed: five scenes, valid SVG, accessible labels, hidden arcs and sections.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
