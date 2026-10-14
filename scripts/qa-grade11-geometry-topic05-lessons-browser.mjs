import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';
const root=process.cwd(),mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/,''));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('not found');}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser,checks=0;
const check=(v,msg)=>{checks++;if(!v)throw Error(msg);};
try{
  browser=await chromium.launch({headless:true,...(process.env.KTP_CHROMIUM_PATH?{executablePath:process.env.KTP_CHROMIUM_PATH,args:['--no-sandbox']}: {})});
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  const base=`http://127.0.0.1:${server.address().port}`;
  const artifacts=process.env.KTP_QA_ARTIFACT_DIR;if(artifacts)fs.mkdirSync(artifacts,{recursive:true});
  async function open(rel){
    const r=await page.goto(base+'/'+rel,{waitUntil:'networkidle'});check(r?.ok(),'HTTP '+rel);
    const data=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,
      broken:document.querySelectorAll('.spatial-scene-error').length,
      invalid:[...document.querySelectorAll('.spatial-scene svg *')].some(e=>[...e.attributes].some(a=>/NaN|Infinity/.test(a.value))),
      overflowNodes:[...document.querySelectorAll('.task-text,.lesson-card,.source-card,.example,.theory')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>e.className)}));
    check(!data.overflow&&!data.broken&&!data.invalid,rel+' rendering '+JSON.stringify(data));
  }
  for(const width of [390,320]){
    await page.setViewportSize({width,height:900});
    await open('topics/11-geometry-atanasyan/05.html');
    const cta=page.locator('[data-coordinate-lesson-link] a');check(await cta.count()===1,'one topic lesson link');
    await cta.click();
    await page.waitForSelector('.lesson-tile');
    check(await page.locator('.lesson-tile').count()===12,'12 catalog routes');
    const labels=await page.locator('.tile-top span').allTextContents();
    check(labels[0]==='Урок 45'&&labels[11]==='Урок 56','global catalog numbering');
    check((await page.locator('.catalog-summary').innerText()).includes('72'),'72 variants of each kind in catalog');
    for(let local=1;local<=12;local++){
      const id=String(local).padStart(2,'0'),global=local+44;
      await open('lessons/11-geometry-atanasyan/05/'+id+'.html');
      const stats=await page.evaluate(()=>({title:document.title,hero:document.querySelector('.lesson-hero h1 span').textContent,
        passport:document.querySelector('.lesson-aside h2').textContent,examples:document.querySelectorAll('#examples .example').length,
        practice:document.querySelectorAll('#practice .task').length,homework:document.querySelectorAll('#homework .task').length,
        scenes:document.querySelectorAll('.spatial-scene svg').length,scene:document.querySelector('.spatial-scene')?.dataset.spatialScene,
        labelled:[...document.querySelectorAll('.spatial-scene')].every(s=>s.getAttribute('aria-label')&&s.querySelector('.spatial-caption')?.textContent),
        closed:[...document.querySelectorAll('details.answer')].every(d=>!d.open),technical:/VECTOR_|geometry-coefficients|implementationStage/.test(document.body.innerText)}));
      check(stats.hero==='Урок '+global&&stats.title.startsWith('Урок '+global+'.')&&stats.passport==='Урок '+global+' из 68','global page labels '+id);
      check(stats.examples===3&&stats.practice===8&&stats.homework===8,'lesson content '+id);
      check(stats.scenes===1&&stats.scene.startsWith('g11-coordinate-'+global+'-')&&stats.labelled,'correct scene '+id);
      check(stats.closed&&!stats.technical,'student-facing answers and labels '+id);
      for(const [kind,n,score] of [['independent',5,10],['control',6,14]]){
        const select=page.locator(`[data-assessment-select="${kind}"]`);check(await select.locator('option').count()===6,'6 variants '+id+'/'+kind);
        const seen=new Set();
        for(let variant=1;variant<=6;variant++){
          await select.selectOption(String(variant));
          const result=await page.locator(`[data-assessment-body="${kind}"]`).evaluate(el=>({
            count:el.querySelectorAll('.task').length,score:el.querySelector('.variant-caption span').textContent,
            tasks:[...el.querySelectorAll('.task-text')].map(t=>t.textContent),answers:[...el.querySelectorAll('.answer div')].map(t=>t.textContent)}));
          check(result.count===n&&result.score===score+' баллов','variant tasks/score '+id+'/'+kind+'/'+variant);
          check(result.answers.every(Boolean),'variant answers '+id+'/'+kind+'/'+variant);seen.add(result.tasks.join('|'));
        }
        check(seen.size===6,'6 distinct variants '+id+'/'+kind);
      }
      const answer=page.locator('#practice details.answer').first();await answer.locator('summary').click();
      check(await answer.evaluate(d=>d.open)&&await answer.locator('div').isVisible(),'answer opens '+id);
      if(width===390){
        if(artifacts&&[1,8,10,12].includes(local))await page.locator('#theory').screenshot({path:path.join(artifacts,`lesson-${global}-theory.png`)});
        await page.evaluate(()=>document.querySelectorAll('details.answer').forEach(d=>d.open=true));
        await page.emulateMedia({media:'print'});
        check(await page.locator('.spatial-scene').evaluate(e=>getComputedStyle(e).breakInside==='avoid'),'print scene '+id);
        const pdf=await page.pdf({format:'A4',printBackground:true});check(pdf.length>30000,'PDF '+id);
        if(artifacts)fs.writeFileSync(path.join(artifacts,`lesson-${global}-answers.pdf`),pdf);
        await page.emulateMedia({media:'screen'});
      }
      const links=await page.locator('.lesson-prev-next a').evaluateAll(nodes=>nodes.map(n=>({href:n.getAttribute('href'),text:n.textContent})));
      if(local>1)check(links.some(a=>a.href===String(local-1).padStart(2,'0')+'.html'&&a.text.includes(global-1)),'previous lesson '+id);
      if(local<12)check(links.some(a=>a.href===String(local+1).padStart(2,'0')+'.html'&&a.text.includes(global+1)),'next lesson '+id);
    }
  }
  await page.setViewportSize({width:1280,height:900});
  for(const id of ['01','12'])await open('lessons/11-geometry-atanasyan/05/'+id+'.html');
  check(errors.length===0,'browser errors '+errors.join('; '));
  console.log(`Grade 11 geometry topic 05 lessons browser/mobile/print/PDF QA passed: ${checks} checks; all 12 routes and 144 variants.`);
}finally{
  await browser?.close();await new Promise(r=>server.close(r));
}
