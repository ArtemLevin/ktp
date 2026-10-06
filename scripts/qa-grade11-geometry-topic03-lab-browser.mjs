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
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true});
  const errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('requestfailed',r=>failed.push(r.url()+' :: '+(r.failure()?.errorText||'failed')));
  const base='http://127.0.0.1:'+server.address().port+'/';

  let response=await page.goto(base+'labs/11-geometry-atanasyan/revolution-volume/index.html',{waitUntil:'networkidle'});
  if(!response?.ok())throw Error('lab HTTP '+response?.status());

  const initial=await page.evaluate(()=>({
    title:document.title,
    mode:document.querySelector('#stage')?.dataset.mode,
    buttons:[...document.querySelectorAll('[data-mode-button]')].map(b=>[b.dataset.modeButton,b.getAttribute('aria-pressed')]),
    state:window.KTP_REVOLUTION_VOLUME_LAB_CURRENT,
    tasks:document.querySelectorAll('.research-tasks li').length,
    svg:document.querySelectorAll('#stage *').length,
    invalid:[...document.querySelectorAll('#stage *')].some(el=>[...el.attributes].some(a=>/NaN|Infinity/.test(a.value))),
    overflow:document.documentElement.scrollWidth>innerWidth+4,
    text:document.body.innerText
  }));
  if(initial.title!=='Объёмы тел вращения — цифровая лаборатория · Геометрия 11 · KTP 3.0')throw Error('lab title '+initial.title);
  if(initial.mode!=='cylinder-cone'||Math.abs(initial.state.ratio-3)>1e-9||initial.tasks!==5||initial.svg<12||initial.invalid||initial.overflow)throw Error('initial lab '+JSON.stringify(initial));
  if(await page.locator('.noticed').count()!==1||await page.locator('.theory-link').count()!==1)throw Error('required pedagogy blocks missing');

  const ccR=page.locator('#ccR');
  await ccR.focus();
  const before=Number(await ccR.inputValue());
  await page.keyboard.press('ArrowRight');
  const after=Number(await ccR.inputValue());
  if(!(after>before))throw Error('range keyboard control failed');
  await page.locator('#ccClassic').click();
  await page.locator('#ccDoubleR').click();
  let state=await page.evaluate(()=>window.KTP_REVOLUTION_VOLUME_LAB_CURRENT);
  if(state.r!==6||state.h!==4||Math.abs(state.ratio-3)>1e-9||Math.abs(state.cylinderPi-144)>1e-9)throw Error('cylinder/cone interaction '+JSON.stringify(state));

  await page.locator('[data-mode-button="frustum"]').click();
  if(await page.locator('[data-controls="frustum"]').getAttribute('hidden')!==null)throw Error('frustum controls hidden');
  await page.locator('#frCone').click();
  state=await page.evaluate(()=>window.KTP_REVOLUTION_VOLUME_LAB_CURRENT);
  if(!state.coneMatch||Math.abs(state.volumePi-16)>1e-9)throw Error('frustum cone limit '+JSON.stringify(state));
  await page.locator('#frCylinder').click();
  state=await page.evaluate(()=>window.KTP_REVOLUTION_VOLUME_LAB_CURRENT);
  if(!state.cylinderMatch||Math.abs(state.volumePi-48)>1e-9)throw Error('frustum cylinder limit '+JSON.stringify(state));

  await page.locator('[data-mode-button="sphere"]').click();
  state=await page.evaluate(()=>window.KTP_REVOLUTION_VOLUME_LAB_CURRENT);
  if(Math.abs(state.sectionRadius-4)>1e-9||Math.abs(state.capHeight-2)>1e-9)throw Error('sphere initial state '+JSON.stringify(state));
  await page.locator('#spHalf').click();
  state=await page.evaluate(()=>window.KTP_REVOLUTION_VOLUME_LAB_CURRENT);
  if(!state.isHemisphere||Math.abs(state.capHeight-5)>1e-9)throw Error('sphere hemisphere state '+JSON.stringify(state));
  await page.locator('#spTangent').click();
  state=await page.evaluate(()=>window.KTP_REVOLUTION_VOLUME_LAB_CURRENT);
  if(!state.isTangent||state.sectionRadius!==0||state.segmentVolume!==0)throw Error('sphere tangent state '+JSON.stringify(state));

  await page.locator('[data-mode-button="scale"]').click();
  await page.locator('[data-k="2"]').click();
  state=await page.evaluate(()=>window.KTP_REVOLUTION_VOLUME_LAB_CURRENT);
  if(state.lengthFactor!==2||state.areaFactor!==4||state.volumeFactor!==8||state.measuredVolumeFactor!==8)throw Error('scale k=2 '+JSON.stringify(state));
  await page.locator('[data-k="0.5"]').click();
  state=await page.evaluate(()=>window.KTP_REVOLUTION_VOLUME_LAB_CURRENT);
  if(state.lengthFactor!==.5||state.areaFactor!==.25||state.volumeFactor!==.125)throw Error('scale k=.5 '+JSON.stringify(state));

  const mobile=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth>innerWidth+4,
    invalid:[...document.querySelectorAll('#stage *')].some(el=>[...el.attributes].some(a=>/NaN|Infinity/.test(a.value))),
    aria:document.querySelector('#stage')?.getAttribute('aria-labelledby'),
    desc:document.querySelector('#stageDesc')?.textContent
  }));
  if(mobile.overflow||mobile.invalid||mobile.aria!=='stageTitle stageDesc'||!mobile.desc)throw Error('mobile/svg '+JSON.stringify(mobile));

  await page.setViewportSize({width:1280,height:900});
  await page.locator('[data-mode-button="cylinder-cone"]').click();
  const desktop=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+4,modeButtons:document.querySelectorAll('.modebar button').length}));
  if(desktop.overflow||desktop.modeButtons!==4)throw Error('desktop '+JSON.stringify(desktop));

  response=await page.goto(base+'topics/11-geometry-atanasyan/03.html',{waitUntil:'networkidle'});
  if(!response?.ok())throw Error('topic HTTP '+response?.status());
  const topicLink=page.locator('.lab-card a[href="../../labs/11-geometry-atanasyan/revolution-volume/index.html"]');
  if(await topicLink.count()!==1)throw Error('topic lab card link missing');

  response=await page.goto(base+'lessons/11-geometry-atanasyan/03/06.html',{waitUntil:'networkidle'});
  if(!response?.ok())throw Error('lesson HTTP '+response?.status());
  const lessonLink=page.locator('a[href="../../../labs/11-geometry-atanasyan/revolution-volume/index.html"]');
  if(await lessonLink.count()<1)throw Error('lesson lab resource link missing');

  response=await page.goto(base+'labs/11-geometry-atanasyan/revolution-volume/index.html',{waitUntil:'networkidle'});
  if(!response?.ok())throw Error('lab print HTTP '+response?.status());
  await page.emulateMedia({media:'print'});
  const print=await page.evaluate(()=>({
    controls:getComputedStyle(document.querySelector('.controls')).display,
    modebar:getComputedStyle(document.querySelector('.modebar')).display,
    stage:getComputedStyle(document.querySelector('#stage')).display,
    tasks:document.querySelectorAll('.research-tasks li').length
  }));
  if(print.controls!=='none'||print.modebar!=='none'||print.stage==='none'||print.tasks!==5)throw Error('print fallback '+JSON.stringify(print));

  if(errors.length)throw Error('page errors: '+errors.join('\n'));
  if(failed.length)throw Error('failed requests: '+failed.join('\n'));
  console.log('Grade 11 geometry topic 03 revolution-volume browser/mobile/print QA passed.');
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}