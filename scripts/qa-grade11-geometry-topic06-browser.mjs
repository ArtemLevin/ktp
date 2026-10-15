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
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const base=`http://127.0.0.1:${server.address().port}`,open=rel=>page.goto(base+'/'+rel,{waitUntil:'networkidle'}),overflow=()=>page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 for(const width of [1280,390,320]){
  await page.setViewportSize({width,height:900});await open('topics/11-geometry-atanasyan/06.html');check(await page.locator('#theory .theory-block').count()===12,'12 topic theories');check(await page.locator('.spatial-scene svg,.revolution-scene svg').count()===12,'12 mixed scenes');check(!await overflow(),'topic responsive');check(!/\[object Object\]/.test(await page.locator('body').innerText()),'readable topic map');
  await page.locator('.lab-card a').click();await page.waitForSelector('input[name="surface"]');
  check(await page.locator('.question').count()===10,'ten diagnostic questions');
  await page.locator('input[name="surface"]').first().focus();await page.keyboard.press('ArrowRight');check(await page.evaluate(()=>Number.isInteger(window.KTP_G11_REVIEW_STATE.answers.surface)),'keyboard records answer');
  await page.locator('[data-submit]').click();check(await page.locator('#routes').count()===0,'incomplete diagnosis not graded');check((await page.locator('.error').innerText()).includes('десяти'),'missing answers guidance');
  const answers=await page.evaluate(()=>window.KTP_G11_REVIEW_ROUTER.diagnostic(window.KTP_G11_REVIEW_STATE.variant).map((q,i)=>({domain:q.domain,index:i===0?(q.correct+1)%4:q.correct})));
  for(const a of answers)await page.locator('input[name="'+a.domain+'"][value="'+a.index+'"]').check();
  await page.locator('[data-submit]').click();check((await page.locator('.score').innerText()).includes('18 / 20'),'primary score');check((await page.locator('[data-domain="surface"]').innerText()).includes('Нужна коррекция'),'weak domain identified');check(await page.locator('.domain-card').count()===10,'ten routes');
  check((await page.locator('[data-domain="sections"]').innerText()).includes('Нужен второй независимый вопрос'),'single correct initial answer stays provisional');
  await page.locator('[data-confirm="surface"]').click();
  check(await page.locator('#confirmation .question').count()===1,'second independent domain question');
  const confirmationAnswer=await page.evaluate(()=>window.KTP_G11_REVIEW_ROUTER.confirm('surface',window.KTP_G11_REVIEW_STATE.variant).correct);
  await page.locator('#confirmation input[value="'+confirmationAnswer+'"]').check();
  await page.locator('[data-check-confirmation]').click();
  check((await page.locator('[data-domain="surface"]').innerText()).includes('1 из 2'),'mixed evidence does not certify proficiency');
  await page.locator('[data-confirm="sections"]').click();
  const validConfirmation=await page.evaluate(()=>window.KTP_G11_REVIEW_ROUTER.confirm('sections',window.KTP_G11_REVIEW_STATE.variant).correct);
  await page.locator('#confirmation input[value="'+validConfirmation+'"]').check();
  await page.locator('[data-check-confirmation]').click();
  check((await page.locator('[data-domain="sections"]').innerText()).includes('Подтверждено: 2 из 2'),'two independent correct tasks confirm skill');
  await page.reload({waitUntil:'networkidle'});check((await page.locator('.score').innerText()).includes('18 / 20'),'primary score persists');
  check((await page.locator('[data-domain="sections"]').innerText()).includes('Подтверждено: 2 из 2'),'confirmation persists on reload');
  await page.locator('[data-correct="surface"]').click();check(await page.locator('#correction .question').count()===2,'two correction tasks');
  let q=await page.evaluate(()=>{const route=window.KTP_G11_REVIEW_CURRENT_ROUTE;return window.KTP_G11_REVIEW_ROUTER.correction(route.domain,route.variant).map(x=>x.correct);});
  await page.locator('#correction input[name="correction-0"][value="'+q[0]+'"]').check();await page.locator('[data-check-correction]').click();check(await page.locator('[data-check-correction]').count()===1,'incomplete correction not graded');
  await page.locator('#correction input[name="correction-1"][value="'+((q[1]+1)%4)+'"]').check();await page.locator('[data-check-correction]').click();check((await page.locator('#correction .feedback[role="status"]').innerText()).includes('Пока'),'one correct does not pass');
  const first=await page.evaluate(()=>window.KTP_G11_REVIEW_CURRENT_ROUTE.variant);await page.locator('[data-repeat]').click();check(await page.evaluate(()=>window.KTP_G11_REVIEW_CURRENT_ROUTE.variant)!==first,'new correction variant');
  q=await page.evaluate(()=>{const route=window.KTP_G11_REVIEW_CURRENT_ROUTE;return window.KTP_G11_REVIEW_ROUTER.correction(route.domain,route.variant).map(x=>x.correct);});
  for(let i=0;i<2;i++)await page.locator('#correction input[name="correction-'+i+'"][value="'+q[i]+'"]').check();await page.locator('[data-check-correction]').click();check((await page.locator('#correction .feedback[role="status"]').innerText()).includes('2 из 2'),'two correct pass');check((await page.locator('.score').innerText()).includes('18 / 20'),'correction preserves primary score');
  await page.reload({waitUntil:'networkidle'});check((await page.locator('[data-domain="surface"]').innerText()).includes('Обе задачи решены верно'),'correction persists separately');check(!await overflow(),'router responsive '+width);
  if(width===1280){await page.screenshot({path:path.join(out,'review-router-results.png'),fullPage:true});await page.locator('#routes').screenshot({path:path.join(out,'review-domain-routes.png')});await page.emulateMedia({media:'print'});check(await page.locator('.top-actions').isHidden(),'print controls hidden');await page.pdf({path:path.join(out,'review-router-results.pdf'),format:'A4',printBackground:true});await page.emulateMedia({media:'screen'});}
  await page.locator('[data-new]').click();check(await page.locator('#routes').count()===0&&await page.locator('.score').count()===0,'new diagnosis is ungraded');check((await page.locator('.history').innerText()).includes('18/20'),'previous primary score in history');
 }
 // Validate every correction domain in the real UI, rather than testing one branch only.
 await page.setViewportSize({width:390,height:900});const qs=await page.evaluate(()=>window.KTP_G11_REVIEW_ROUTER.diagnostic(window.KTP_G11_REVIEW_STATE.variant).map(q=>({domain:q.domain,index:q.correct})));
 for(const q of qs)await page.locator('input[name="'+q.domain+'"][value="'+q.index+'"]').check();await page.locator('[data-submit]').click();
 for(const domain of qs.map(q=>q.domain)){
  await page.locator('[data-correct="'+domain+'"]').click();const q=await page.evaluate(()=>{const r=window.KTP_G11_REVIEW_CURRENT_ROUTE;return window.KTP_G11_REVIEW_ROUTER.correction(r.domain,r.variant).map(q=>q.correct);});for(let i=0;i<2;i++)await page.locator('#correction input[name="correction-'+i+'"][value="'+q[i]+'"]').check();await page.locator('[data-check-correction]').click();check((await page.locator('#correction .feedback[role="status"]').innerText()).includes('2 из 2'),'UI correction domain '+domain);check(!await overflow(),'correction mobile '+domain);
 }
 await page.evaluate(()=>localStorage.setItem('ktp:g11:review:v1','{bad json'));await page.reload({waitUntil:'networkidle'});check(await page.locator('.score').count()===0&&await page.locator('.question').count()===10,'corrupt state recovered');
 await page.evaluate(()=>localStorage.setItem('ktp:g11:review:v1',JSON.stringify({version:1,variant:1,answers:[],submitted:false,corrections:{},counters:{},history:[]})));await page.reload({waitUntil:'networkidle'});check(await page.evaluate(()=>!Array.isArray(window.KTP_G11_REVIEW_STATE.answers)),'invalid saved shape replaced with fresh object');
 for(const kind of ['independent','control'])for(const width of [1280,390,320]){
  await page.setViewportSize({width,height:900});await open('assessments/11-geometry-atanasyan/06/'+kind+'.html');
  check(await page.locator('[data-answers],.teacher-key').count()===0,'student key absent');
  await open('assessments/11-geometry-atanasyan/06/teacher-'+kind+'.html');check(await page.locator('.teacher-key:visible').count()===0,'answers hidden');
  for(let v=1;v<=6;v++){await page.locator('[data-pick="'+v+'"]').click();const active=page.locator('.variant.active');check(await active.locator('.task').count()===(kind==='independent'?7:10),'thematic task count');check(!await overflow(),'thematic responsive');await page.locator('[data-answers]').click();check((await active.locator('.teacher-key').innerText()).includes('Критерии:'),'criteria shown');check(!await overflow(),'teacher key responsive');await page.locator('[data-answers]').click();}
  await page.locator('[data-all]').click();check(await page.locator('.variant:visible').count()===6,'all thematic variants');
  if(width===1280){for(const answers of [false,true]){if(answers)await page.locator('[data-answers]').click();await page.emulateMedia({media:'print'});check(await page.locator('.teacher-key:visible').count()===(answers?6:0),'print answer visibility');await page.pdf({path:path.join(out,'review-'+kind+(answers?'-answers':'')+'.pdf'),format:'A4'});await page.emulateMedia({media:'screen'});}}
 }
 // Whole-line route smoke: all 68 actual lessons and all six topic maps.
 await page.setViewportSize({width:390,height:900});let total=0;
 for(const [series,count,start] of [['01',11,1],['02',10,12],['03',11,22],['04',12,33],['05',12,45],['06',12,57]]){
  await open('topics/11-geometry-atanasyan/'+series+'.html');check(!/\[object Object\]|Каркас будущего/.test(await page.locator('body').innerText()),'readable complete topic '+series);
  for(let i=1;i<=count;i++){await open('lessons/11-geometry-atanasyan/'+series+'/'+String(i).padStart(2,'0')+'.html');check(Number((await page.locator('.lesson-hero h1 span').innerText()).match(/Урок\s+(\d+)/i)?.[1])===(start+i-1),'global route '+series+'/'+i);check(await page.locator('#examples .example').count()>=2,'worked examples '+series+'/'+i);check(await page.locator('.spatial-scene-error,.revolution-error').count()===0,'scene renders '+series+'/'+i);check(!await overflow(),'course mobile '+series+'/'+i);total++;}
 }
 check(total===68,'all 68 course lessons');check(errors.length===0,'browser errors: '+errors.join('; '));console.log(`Grade 11 final review course/router/thematic browser QA passed: ${checks} checks; 68 routes and all ten correction domains.`);
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
