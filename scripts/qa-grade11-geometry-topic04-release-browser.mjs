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
const artifacts=path.resolve(process.env.KTP_QA_ARTIFACT_DIR||'qa-artifacts');fs.mkdirSync(artifacts,{recursive:true});
try{
 browser=await chromium.launch({headless:true,...(process.env.KTP_CHROMIUM_PATH?{executablePath:process.env.KTP_CHROMIUM_PATH,args:['--no-sandbox']}: {})});
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const base=`http://127.0.0.1:${server.address().port}`,lab=base+'/labs/11-geometry-atanasyan/vector-constructor/index.html';
 const current=()=>page.evaluate(()=>window.KTP_VECTOR_LAB_CURRENT);
 const overflow=()=>page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 const range=async(id,value)=>{await page.locator('#'+id).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},value);};
 for(const width of [1280,390,320]){
  await page.setViewportSize({width,height:900});await page.goto(lab,{waitUntil:'networkidle'});
  for(const mode of ['transfer','combination','coplanarity']){
   await page.locator('[data-mode="'+mode+'"]').click();check(await page.locator('[data-controls="'+mode+'"]').isVisible(),'controls '+mode);
   check(await page.locator('[data-mode="'+mode+'"]').getAttribute('aria-pressed')==='true','mode aria');
   for(const other of ['transfer','combination','coplanarity'].filter(m=>m!==mode))check(await page.locator('[data-controls="'+other+'"]').isHidden(),'inactive controls');
   check(await page.locator('#scene svg').count()===1,'single scene');check(await page.locator('#scene [role="img"]').getAttribute('aria-label'),'accessible scene');
   check(!await overflow(),'lab responsive '+width+'/'+mode);
  }
  await page.locator('[data-mode="transfer"]').click();
  for(const t of [-2,-.5,0,1,2])for(const k of [-2,-.5,0,1,2]){await range('t',t);await range('k',k);const c=await current();check(c.state.equal&&c.state.zero===(k===0),'transfer invariant');check((await page.locator('.spatial-zero-vector').count())===(k===0?2:0),'zero rings');}
  await page.locator('#negative').click();check((await current()).state.k===-1,'negative preset');
  await page.locator('#k').focus();await page.keyboard.press('ArrowRight');check((await current()).state.k===-.5,'keyboard range');
  await page.locator('#zero').click();check((await page.locator('#observation').innerText()).includes('определённого направления нет'),'zero explanation');
  await page.locator('[data-controls="transfer"] [data-reset]').click();check((await current()).state.k===1,'reset');
  await page.locator('[data-mode="combination"]').click();
  for(const x of [-2,0,.5,2])for(const y of [-2,0,1,2])for(const z of [-2,0,.5,2]){await range('x',x);await range('y',y);await range('z',z);const s=(await current()).state;check(s.recovered.every((v,i)=>Math.abs(v-[x,y,z][i])<1e-8),'interactive coefficients');}
  await page.locator('#mixed').click();check(JSON.stringify((await current()).state.coefficients)==='[1,-0.5,0.5]','mixed preset');
  await page.locator('#allZero').click();check((await current()).state.zero,'zero sum');
  await page.locator('[data-mode="coplanarity"]').click();
  for(const target of ['c','outside']){await page.locator('[data-target="'+target+'"]').click();for(const h of [-1.5,-.5,0,.5,1.5]){await range('h',h);const s=(await current()).state;check(s.planar===(h===0)&&s.exists===(h!==0||target==='c'),'interactive degeneration');check(s.representations.length===(h===0?(target==='c'?2:0):1),'displayed representations');
    const collisions=await page.locator('#scene').evaluate(e=>{const ts=[...e.querySelectorAll('text')],rs=ts.map(t=>t.getBoundingClientRect()),pairs=[];rs.forEach((a,i)=>rs.forEach((b,j)=>{if(j>i&&Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)pairs.push([ts[i].textContent,ts[j].textContent]);}));return pairs;});
    check(collisions.length===0,'scene labels '+h+'/'+target+'/'+width+' '+JSON.stringify(collisions));}}
  await page.locator('#planar').click();check((await page.locator('#observation').innerText()).includes('отсутствует'),'outside-plane explanation');
  await page.locator('[data-target="c"]').click();check((await page.locator('#formula').innerText()).includes('(1; 1; 0) и (0; 0; 1)'),'two decompositions');
  check(!await overflow(),'planar responsive');
  const overlap=await page.locator('#scene').evaluate(e=>{const rs=[...e.querySelectorAll('text')].map(t=>t.getBoundingClientRect());return rs.some((a,i)=>rs.slice(i+1).some(b=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1));});
  check(!overlap,'planar scene label separation');
  check(!await page.evaluate(()=>/determinant|projectPoint|\[x,y,z\]/.test(document.body.innerText)),'no internal model text');
  if(width===1280){
   for(const mode of ['transfer','combination','coplanarity']){await page.locator('[data-mode="'+mode+'"]').click();await page.screenshot({path:path.join(artifacts,'vector-lab-'+mode+'.png'),fullPage:true});await page.emulateMedia({media:'print'});check(await page.locator('.controls').isHidden(),'print controls hidden');check(await page.locator('#scene svg').isVisible(),'print scene visible');await page.pdf({path:path.join(artifacts,'vector-lab-'+mode+'.pdf'),format:'A4',printBackground:true});await page.emulateMedia({media:'screen'});}
  }
 }
 for(const kind of ['independent','control'])for(const width of [1280,390,320]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/assessments/11-geometry-atanasyan/04/'+kind+'.html',{waitUntil:'networkidle'});
  check(await page.locator('[data-answers],.teacher-key').count()===0,'student key absent');
  check(!await page.evaluate(()=>performance.getEntriesByType('resource').some(x=>/\/(?:data|question-bank)\.js$/.test(x.name))),'student response has no answer scripts');
  await page.goto(base+'/assessments/11-geometry-atanasyan/04/teacher-'+kind+'.html',{waitUntil:'networkidle'});
  check(await page.locator('h1').innerText()==='Векторы в пространстве','assessment title');check(await page.locator('.variant:visible').count()===1,'one variant initially');check(await page.locator('.teacher-key:visible').count()===0,'answers hidden');
  for(let v=1;v<=6;v++){
   await page.locator('[data-pick="'+v+'"]').click();const active=page.locator('.variant.active');
   check(await active.getAttribute('data-variant')===String(v),'selected variant');check(await active.locator('.task').count()===(kind==='independent'?7:10),'task count');
   check((await active.locator('.paper-meta').innerText()).includes(kind==='independent'?'14 баллов':'20 баллов'),'total score');check(!await overflow(),'assessment responsive '+kind+'/'+width+'/'+v);
   await page.locator('[data-answers]').click();check(await active.locator('.teacher-key').isVisible(),'teacher key');check((await active.locator('.teacher-key').innerText()).includes('Критерии:'),'rubric displayed');
   check(!/VECTOR_|geometry-coefficients/.test(await page.locator('body').innerText()),'human skills');await page.locator('[data-answers]').click();
  }
  await page.locator('[data-all]').click();check(await page.locator('.variant:visible').count()===6,'all variants');
  if(width===1280){for(const answers of [false,true]){if(answers)await page.locator('[data-answers]').click();await page.emulateMedia({media:'print'});check(await page.locator('.controls').isHidden(),'print controls');check(await page.locator('.teacher-key:visible').count()===(answers?6:0),'print answer visibility');await page.pdf({path:path.join(artifacts,'vector-'+kind+(answers?'-answers':'')+'.pdf'),format:'A4',printBackground:true});await page.emulateMedia({media:'screen'});}}
 }
 await page.goto(base+'/topics/11-geometry-atanasyan/04.html',{waitUntil:'networkidle'});check(await page.locator('[data-assessment-topic-link]').count()===1,'single thematic navigation card');
 await page.locator('.lab-card a').click();await page.waitForSelector('#controlTitle');check((await page.locator('h1').innerText()).includes('Соберите вектор'),'topic to lab');
 await page.locator('.back').click();await page.locator('[data-assessment-topic-link] a').first().click();await page.waitForSelector('.task');check(await page.locator('.task').count()===42,'topic to independent');
 check(errors.length===0,'browser errors: '+errors.join('; '));
 console.log(`Grade 11 geometry topic 04 release browser QA passed: ${checks} checks; lab and 12 thematic variants, mobile/print/PDF.`);
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
