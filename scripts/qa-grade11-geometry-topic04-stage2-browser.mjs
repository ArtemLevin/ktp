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
try{
  browser=await chromium.launch({headless:true,...(process.env.KTP_CHROMIUM_PATH?{
    executablePath:process.env.KTP_CHROMIUM_PATH,args:['--no-sandbox']}: {})});
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  const base=`http://127.0.0.1:${server.address().port}`,url=base+'/topics/11-geometry-atanasyan/04.html';
  for(const width of [1280,390,320]){
    await page.setViewportSize({width,height:900});
    await page.goto(url,{waitUntil:'networkidle'});
    const data=await page.evaluate(()=>({
      title:document.title,h1:document.querySelector('h1')?.textContent,
      full:document.querySelectorAll('.lesson').length===1&&!document.body.innerText.includes('Каркас будущего учебного модуля'),
      theory:document.querySelectorAll('#theory .theory-block').length,
      examples:document.querySelectorAll('#examples .example').length,
      practice:document.querySelectorAll('#practice .task').length,
      levels:document.querySelectorAll('#practice .practice-group').length,
      diagnostic:document.querySelectorAll('#diagnostic .diagnostic-item').length,
      homework:document.querySelectorAll('#homework .task').length,
      answers:document.querySelectorAll('details.answer').length,
      closed:[...document.querySelectorAll('details.answer')].every(d=>!d.open),
      scenes:document.querySelectorAll('.spatial-scene svg').length,
      labelled:[...document.querySelectorAll('.spatial-scene')].every(s=>s.getAttribute('aria-label')&&s.querySelector('.spatial-caption')?.textContent),
      error:document.querySelectorAll('.spatial-scene-error').length,
      pendingLinks:document.querySelectorAll('.lab-card,[data-assessment-topic-link]').length,
      hrefs:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),
      period:document.querySelector('.metric strong')?.textContent,
      overflow:document.documentElement.scrollWidth>innerWidth+1,
      plan:window.KTP_CONTENT['11-geometry-atanasyan::3'].meta.status
    }));
    check(data.title==='Векторы в пространстве — 11 класс · KTP 3.0'&&data.h1==='Векторы в пространстве','title '+width);
    check(data.full&&data.plan==='content-ready','full content '+width);
    check(data.theory===12&&data.examples===12&&data.practice===24&&data.levels===4&&data.diagnostic===12&&data.homework===8,'content counts '+width);
    check(data.answers===49&&data.closed,'answers initially hidden '+width);
    check(data.scenes===12&&data.labelled&&data.error===0,'12 accessible scenes '+width);
    check(!data.overflow&&data.pendingLinks===0,'responsive and no unfinished links '+width);
    check(data.period==='11 января 2027 г. — 18 февраля 2027 г.','KTP period '+data.period);
    check(data.hrefs.includes('03.html')&&data.hrefs.includes('05.html'),'neighbor navigation');
    for(const href of data.hrefs){
      if(href.startsWith('#')){
        check(await page.locator(href).count()===1,'anchor '+href);
      }else if(!/^https?:/.test(href)){
        const response=await page.request.get(new URL(href,url).href);
        check(response.ok(),'local navigation '+href);
      }
    }
    const answer=page.locator('#practice details.answer').first();
    await answer.locator('summary').click();
    check(await answer.evaluate(d=>d.open)&&await answer.locator('div').isVisible(),'answer toggles open');
    await answer.locator('summary').click();
    check(!await answer.evaluate(d=>d.open),'answer toggles closed');
    if(process.env.KTP_QA_ARTIFACT_DIR){
      fs.mkdirSync(process.env.KTP_QA_ARTIFACT_DIR,{recursive:true});
      await page.locator('#theory').screenshot({path:path.join(process.env.KTP_QA_ARTIFACT_DIR,`topic04-theory-${width}.png`)});
      await page.screenshot({path:path.join(process.env.KTP_QA_ARTIFACT_DIR,`topic04-${width}.png`),fullPage:true});
      if(width===390)for(const i of [0,7,9,11])await page.locator('#theory .theory-block').nth(i).screenshot({
        path:path.join(process.env.KTP_QA_ARTIFACT_DIR,`topic04-block-${i+1}.png`)});
    }
  }
  await page.evaluate(()=>document.querySelectorAll('details.answer').forEach(d=>d.open=true));
  await page.emulateMedia({media:'print'});
  check(await page.locator('.spatial-scene').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).breakInside==='avoid')),'print scenes intact');
  check(await page.locator('details.answer').evaluateAll(nodes=>nodes.every(n=>n.open&&getComputedStyle(n).display!=='none')),'print answer key when opened');
  const pdf=await page.pdf({format:'A4',printBackground:true});
  check(pdf.length>100000,'content/scenes PDF');
  if(process.env.KTP_QA_ARTIFACT_DIR)fs.writeFileSync(path.join(process.env.KTP_QA_ARTIFACT_DIR,'topic04-answers.pdf'),pdf);
  await page.emulateMedia({media:'screen'});
  // Read an existing KTP status/notes without changing the application's state schema.
  await page.evaluate(()=>{
    const state=window.KTP_STORE.load();
    state.topics['11-geometry-atanasyan::3']={status:'in_progress',actualStart:'2027-01-14',actualEnd:''};
    state.notes['11-geometry-atanasyan::3']=[{at:'2027-01-14T10:00:00Z',text:'Повторить направление разности'}];
    window.KTP_STORE.save(state);
  });
  await page.reload({waitUntil:'networkidle'});
  check(await page.locator('.status').innerText()==='В работе','KTP status retained');
  check((await page.locator('.notes').innerText()).includes('Повторить направление разности'),'KTP note retained');
  await page.locator('.nav a[href="03.html"]').click();
  check(await page.locator('h1').innerText()==='Объёмы тел вращения','previous topic opens');
  await page.goto(url,{waitUntil:'networkidle'});
  await page.locator('.nav a[href="05.html"]').click();
  check(await page.locator('h1').innerText()==='Метод координат в пространстве. Движения','next topic opens');
  check(errors.length===0,'browser errors: '+errors.join('; '));
  console.log(`Grade 11 geometry topic 04 stage 2 browser/mobile/print/PDF QA passed: ${checks} checks.`);
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
