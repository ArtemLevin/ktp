import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/export-grade11-teacher-pages.mjs']);
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const root=process.cwd(),mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{
  const target=path.resolve(root,decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/,''));
  if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){
    res.writeHead(404);return res.end('not found');
  }
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'});
  fs.createReadStream(target).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser,checks=0;
const check=(value,message)=>{checks++;if(!value)throw Error(message);};
const out=path.resolve(process.env.KTP_QA_ARTIFACT_DIR||'qa-artifacts');fs.mkdirSync(out,{recursive:true});
try{
 browser=await chromium.launch({headless:true,...(process.env.KTP_CHROMIUM_PATH?{executablePath:process.env.KTP_CHROMIUM_PATH,args:['--no-sandbox']}: {})});
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const base=`http://127.0.0.1:${server.address().port}`,open=rel=>page.goto(base+'/'+rel,{waitUntil:'networkidle'}),overflow=()=>page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 for(const width of [1280,390,320]){
  await page.setViewportSize({width,height:900});await open('topics/11-geometry-atanasyan/05.html');
  check(await page.locator('#theory .theory-block').count()===12,'12 topic theories');check(await page.locator('.spatial-scene svg').count()===12,'12 topic scenes');check(!await overflow(),'topic responsive '+width);
  check(await page.locator('[data-coordinate-lesson-link]').count()===1&&await page.locator('[data-assessment-topic-link]').count()===1,'single resource cards');
  await page.locator('.lab-card a').click();await page.waitForSelector('#t');
  for(const mode of ['angle','distance','motion']){
   await page.locator('[data-mode="'+mode+'"]').click();check(await page.locator('[data-mode="'+mode+'"]').getAttribute('aria-pressed')==='true','mode aria');
   for(const t of [0,.25,1,2,3]){
    await page.locator('#t').evaluate((e,t)=>{e.value=t;e.dispatchEvent(new Event('input',{bubbles:true}));},t);
    const data=await page.evaluate(()=>({state:window.KTP_COORDINATE_LAB_CURRENT,scene:document.querySelectorAll('#scene svg').length,invalid:[...document.querySelectorAll('#scene svg *')].some(e=>[...e.attributes].some(a=>/NaN|Infinity/.test(a.value)))}));
    check(data.scene===1&&!data.invalid,'valid dynamic scene');check(data.state.t===t&&data.state.distance===t&&data.state.image[2]===-t,'lab model state');check(Math.abs(data.state.angle-Math.atan2(t,Math.sqrt(5))*180/Math.PI)<1e-8,'angle from geometric ratio');check(!await overflow(),'lab responsive '+width);
    const clipped=await page.locator('#scene svg').evaluate(svg=>{const v=svg.viewBox.baseVal;return [...svg.querySelectorAll('text,circle')].some(e=>{const b=e.getBBox();return b.x<v.x-1||b.y<v.y-1||b.x+b.width>v.x+v.width+1||b.y+b.height>v.y+v.height+1;});});check(!clipped,'lab labels in viewbox '+mode+'/'+t);
   }
   if(width===1280){await page.locator('#reset').click();await page.screenshot({path:path.join(out,'coordinate-lab-'+mode+'.png'),fullPage:true});await page.emulateMedia({media:'print'});check(await page.locator('.controls').isHidden(),'print controls');await page.pdf({path:path.join(out,'coordinate-lab-'+mode+'.pdf'),format:'A4',printBackground:true});await page.emulateMedia({media:'screen'});}
  }
  await page.locator('#t').focus();await page.keyboard.press('ArrowLeft');check((await page.evaluate(()=>window.KTP_COORDINATE_LAB_CURRENT.t))<3,'keyboard range');await page.locator('#onPlane').click();check((await page.locator('#observation').innerText()).includes('равны 0'),'zero boundary');
 }
 for(const kind of ['independent','control'])for(const width of [1280,390,320]){
  await page.setViewportSize({width,height:900});await open('assessments/11-geometry-atanasyan/05/'+kind+'.html');
  check(await page.locator('[data-answers],.teacher-key').count()===0,'student key absent');
  await open('assessments/11-geometry-atanasyan/05/teacher-'+kind+'.html');check(await page.locator('.teacher-key:visible').count()===0,'initial answers hidden');
  for(let v=1;v<=6;v++){
   await page.locator('[data-pick="'+v+'"]').click();const active=page.locator('.variant.active');check(await active.locator('.task').count()===(kind==='independent'?7:10),'task count');check(!await overflow(),'assessment mobile');await page.locator('[data-answers]').click();check(await active.locator('.teacher-key').isVisible(),'teacher key');check((await active.locator('.teacher-key').innerText()).includes('Критерии:'),'criteria');check(!await overflow(),'answers responsive');await page.locator('[data-answers]').click();
  }
  await page.locator('[data-all]').click();check(await page.locator('.variant:visible').count()===6,'all variants');
  if(width===1280){for(const answers of [false,true]){if(answers)await page.locator('[data-answers]').click();await page.emulateMedia({media:'print'});check(await page.locator('.teacher-key:visible').count()===(answers?6:0),'print key visibility');await page.pdf({path:path.join(out,'coordinate-'+kind+(answers?'-answers':'')+'.pdf'),format:'A4'});await page.emulateMedia({media:'screen'});}}
 }
 check(errors.length===0,'browser errors: '+errors.join('; '));console.log(`Grade 11 coordinate topic/lab/thematic browser QA passed: ${checks} checks.`);
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
