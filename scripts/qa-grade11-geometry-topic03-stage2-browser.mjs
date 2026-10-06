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
  const response=await page.goto(`http://127.0.0.1:${server.address().port}/topics/11-geometry-atanasyan/03.html`,{waitUntil:'networkidle'});
  if(!response?.ok())throw Error('topic HTTP '+response?.status());
  await page.waitForSelector('.revolution-scene svg');

  const data=await page.evaluate(()=>{
    const text=document.body.innerText;
    const scenes=[...document.querySelectorAll('.revolution-scene')];
    return{
      title:document.title,
      h1:document.querySelector('h1')?.textContent,
      full:!text.includes('Каркас будущего учебного модуля'),
      theory:document.querySelectorAll('#theory .theory-block').length,
      examples:document.querySelectorAll('#examples .example').length,
      mistakes:document.querySelectorAll('#mistakes .mistake').length,
      practice:document.querySelectorAll('#practice .task').length,
      diagnostic:document.querySelectorAll('#diagnostic .diagnostic-item').length,
      homework:document.querySelectorAll('#homework .task').length,
      summary:document.querySelectorAll('#summary li').length,
      scenes:scenes.length,
      sceneIds:scenes.map(s=>s.dataset.revolutionScene),
      labelled:scenes.every(s=>s.getAttribute('aria-label')&&s.querySelector('figcaption')?.textContent),
      invalid:[...document.querySelectorAll('.revolution-scene svg path')].some(p=>/NaN|Infinity/.test(p.getAttribute('d')||'')),
      overflow:document.documentElement.scrollWidth>innerWidth+1,
      source:text.includes('Глава V, §2, п. 55')&&text.includes('п. 62*')&&text.includes('Пункт 56'),
      labCard:document.querySelectorAll('.lab-card').length,
      assessmentCard:document.querySelectorAll('[data-assessment-topic-link="true"]').length,
      contentReady:window.KTP_CONTENT?.['11-geometry-atanasyan::2']?.meta?.status,
      registry:Object.keys(window.KTP_G11_REVOLUTION_VOLUME_SCENES||{}).length,
      helper:window.KTP_REVOLUTION_MATH?.sphericalSegmentVolume(5,2)
    };
  });

  if(data.title!=='Объёмы тел вращения — 11 класс · KTP 3.0')throw Error('document title '+data.title);
  if(data.h1!=='Объёмы тел вращения'||!data.full||data.contentReady!=='content-ready')throw Error('topic content missing '+JSON.stringify(data));
  if(data.theory!==11||data.examples<10||data.mistakes<12||data.practice<16||data.diagnostic<10||data.homework<10||data.summary<10)throw Error('content counts '+JSON.stringify(data));
  if(data.scenes!==11||data.registry!==11||!data.labelled||data.invalid)throw Error('scene rendering '+JSON.stringify(data));
  if(data.overflow)throw Error('mobile horizontal overflow');
  if(!data.source)throw Error('source boundary not visible');
  if(data.assessmentCard>1)throw Error('topic assessment card duplicated');
  if(Math.abs(data.helper-52*Math.PI/3)>1e-9)throw Error('browser math helper mismatch');
  if(errors.length)throw Error(errors.join('\n'));

  await page.emulateMedia({media:'print'});
  const print=await page.evaluate(()=>({
    scenes:document.querySelectorAll('.revolution-scene').length,
    avoid:[...document.querySelectorAll('.revolution-scene')].every(el=>getComputedStyle(el).breakInside==='avoid')
  }));
  if(print.scenes!==11||!print.avoid)throw Error('print '+JSON.stringify(print));

  console.log('Grade 11 geometry topic 03 stage 2 browser/mobile/print QA passed.');
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
