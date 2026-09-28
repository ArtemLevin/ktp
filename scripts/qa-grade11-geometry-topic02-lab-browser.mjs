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
    const dims=await page.evaluate(()=>({width:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    if(dims.width>dims.client+4)throw Error(rel+': mobile overflow '+JSON.stringify(dims));
    if(errors.length||failed.length)throw Error(rel+': '+errors.join('; ')+' '+failed.join('; '));
  }
  const num=async id=>Number((await page.locator('#'+id).textContent()).replace(',','.'));

  await open('labs/11-geometry-atanasyan/volume-transform/index.html');
  if(await page.locator('[data-mode-button]').count()!==3)throw Error('three lab modes required');
  if(await page.locator('#stage[data-mode="prism"]').count()!==1)throw Error('default prism mode');
  const prismV0=await num('m4'),edge0=await num('m3');
  if(prismV0!==48||edge0!==4)throw Error('default prism metrics '+prismV0+' '+edge0);
  await page.locator('#prismTilt').click();
  const prismV1=await num('m4'),edge1=await num('m3');
  if(prismV1!==prismV0||edge1<=edge0)throw Error('prism shear invariant failed');

  await page.locator('[data-mode-button="pyramid"]').click();
  if(await page.locator('#stage[data-mode="pyramid"]').count()!==1)throw Error('pyramid mode');
  const pyrV0=await num('m4'),slant0=await num('m3');
  if(pyrV0!==16||slant0!==4)throw Error('default pyramid metrics '+pyrV0+' '+slant0);
  await page.locator('#pyrMove').click();
  const pyrV1=await num('m4'),slant1=await num('m3');
  if(pyrV1!==pyrV0||slant1<=slant0)throw Error('pyramid shift invariant failed');

  await page.locator('[data-mode-button="similarity"]').click();
  await page.locator('[data-k="2"]').click();
  const factors=[await num('m1'),await num('m2'),await num('m3')];
  if(JSON.stringify(factors)!==JSON.stringify([2,4,8]))throw Error('similarity factors '+JSON.stringify(factors));

  const metricBefore=await num('m4');
  await page.locator('#yaw').evaluate(el=>{el.value='15';el.dispatchEvent(new Event('input',{bubbles:true}));});
  const metricAfter=await num('m4');
  if(metricAfter!==metricBefore)throw Error('camera changed mathematical metric');

  const svgState=await page.evaluate(()=>({
    invalid:[...document.querySelectorAll('#stage *')].some(el=>[...el.attributes].some(a=>/NaN|Infinity/.test(a.value))),
    shapes:document.querySelectorAll('#stage line,#stage polygon,#stage circle').length,
    formula:document.querySelector('#formula')?.textContent||''
  }));
  if(svgState.invalid||svgState.shapes<10||!svgState.formula.includes('k³'))throw Error('similarity render '+JSON.stringify(svgState));

  await open('topics/11-geometry-atanasyan/02.html');
  if(!await page.locator('a[href="../../labs/11-geometry-atanasyan/volume-transform/index.html"]').count())throw Error('topic lab card link');

  await open('lessons/11-geometry-atanasyan/02/04.html');
  if(!await page.locator('a[href="../../../labs/11-geometry-atanasyan/volume-transform/index.html"]').count())throw Error('lesson 15 lab resource');

  await page.goto('http://127.0.0.1:'+server.address().port+'/labs/11-geometry-atanasyan/volume-transform/index.html',{waitUntil:'networkidle'});
  await page.emulateMedia({media:'print'});
  const pdf=await page.pdf({format:'A4',printBackground:true});
  if(pdf.length<18000)throw Error('lab print PDF too small: '+pdf.length);

  console.log('Grade 11 geometry topic 02 volume lab browser QA passed: prism/pyramid invariants, k³ scaling, camera independence, mobile and print.');
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
