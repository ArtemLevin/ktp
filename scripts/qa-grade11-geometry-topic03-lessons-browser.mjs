import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const root=process.cwd(),mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
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
  let errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('requestfailed',r=>failed.push(r.url()+' :: '+(r.failure()?.errorText||'failed')));

  async function open(rel){
    errors=[];failed=[];
    const response=await page.goto('http://127.0.0.1:'+server.address().port+'/'+rel,{waitUntil:'networkidle'});
    if(!response?.ok())throw Error(rel+': HTTP '+response?.status());
    const data=await page.evaluate(()=>({
      width:document.documentElement.scrollWidth,
      client:document.documentElement.clientWidth,
      revolution:document.querySelectorAll('.revolution-scene svg').length,
      invalid:[...document.querySelectorAll('.revolution-scene svg *')].some(el=>[...el.attributes].some(a=>/NaN|Infinity/.test(a.value))),
      sceneError:document.querySelectorAll('.revolution-scene-error').length,
      text:document.body.innerText.length
    }));
    if(data.width>data.client+4||data.invalid||data.sceneError||errors.length||failed.length){
      throw Error(rel+': '+JSON.stringify(data)+' errors='+errors.join('; ')+' failed='+failed.join('; '));
    }
    return data;
  }

  let data=await open('topics/11-geometry-atanasyan/03.html');
  if(data.revolution!==11||data.text<8000)throw Error('topic content/scenes '+JSON.stringify(data));
  if(!await page.locator('a[href="../../lessons/11-geometry-atanasyan/03/index.html"]').count())throw Error('topic lesson link missing');

  data=await open('lessons/11-geometry-atanasyan/03/index.html');
  if(await page.locator('.lesson-tile').count()!==11)throw Error('index must contain 11 lesson tiles');
  const tileLabels=await page.locator('.lesson-tile .tile-top span').allTextContents();
  if(tileLabels[0]!=='Урок 22'||tileLabels[10]!=='Урок 32')throw Error('global tile numbering '+JSON.stringify(tileLabels));

  for(let i=1;i<=11;i++){
    const id=String(i).padStart(2,'0'),global=21+i,rel='lessons/11-geometry-atanasyan/03/'+id+'.html';
    data=await open(rel);
    if(data.revolution<1||data.text<3000)throw Error(rel+': scene/content '+JSON.stringify(data));
    const hero=(await page.locator('.lesson-hero h1 span').textContent())?.trim();
    if(hero!=='Урок '+global)throw Error(rel+': global hero number '+hero);
    const passport=(await page.locator('.lesson-aside .source-card h2').first().textContent())?.trim();
    if(passport!=='Урок '+global+' из 68')throw Error(rel+': global passport '+passport);
    if(await page.locator('#examples .example').count()<3)throw Error(rel+': expected 3 worked examples');
    if(await page.locator('#mistakes .mistake').count()<5)throw Error(rel+': expected 5 mistakes');
    if(await page.locator('#practice .task').count()<8)throw Error(rel+': expected practice');
    if(await page.locator('#homework .task').count()<8)throw Error(rel+': expected homework');
    for(const kind of ['independent','control']){
      const select=page.locator('[data-assessment-select="'+kind+'"]');
      if(await select.locator('option').count()!==6)throw Error(rel+': '+kind+' variants');
      await select.selectOption('6');
      const expected=kind==='independent'?5:6;
      if(await page.locator('[data-assessment-body="'+kind+'"] .task').count()!==expected)throw Error(rel+': '+kind+' task count');
    }
  }

  await page.emulateMedia({media:'print'});
  const pdf=await page.pdf({format:'A4',printBackground:true});
  if(pdf.length<18000)throw Error('lesson print PDF too small: '+pdf.length);

  console.log('Grade 11 geometry topic 03 lesson browser QA passed: index, lessons 22–32, 11 revolution scenes, 132 assessment variants, mobile and print.');
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}