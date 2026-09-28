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
  const url=`http://127.0.0.1:${server.address().port}/geometry/fixtures/grade11-revolution-volume.html`;
  const response=await page.goto(url,{waitUntil:'networkidle'});
  if(!response?.ok())throw Error(`fixture HTTP ${response?.status()}`);
  await page.waitForSelector('.revolution-scene svg');

  const data=await page.evaluate(()=>{
    const scenes=[...document.querySelectorAll('.revolution-scene')];
    const math=window.KTP_REVOLUTION_MATH;
    const segment=math.sphericalSegmentVolume(3,3);
    const layer=math.sphericalLayerVolume(5,-1,2);
    const section=math.sphereSectionMetrics(5,3);
    return{
      count:scenes.length,
      ids:scenes.map(s=>s.dataset.revolutionScene),
      labelled:scenes.every(s=>s.getAttribute('aria-label')&&s.querySelector('figcaption')?.textContent),
      svgs:document.querySelectorAll('.revolution-scene svg').length,
      paths:document.querySelectorAll('.revolution-scene svg path').length,
      circles:document.querySelectorAll('.revolution-scene svg circle').length,
      hidden:document.querySelectorAll('.revolution-hidden').length,
      sections:document.querySelectorAll('.revolution-section').length,
      invalid:[...document.querySelectorAll('.revolution-scene svg path')].some(p=>/NaN|Infinity/.test(p.getAttribute('d')||'')),
      overflow:document.documentElement.scrollWidth>innerWidth+1,
      segment,layer,sectionRadius:section.sectionRadius,
      registry:Object.keys(window.KTP_G11_REVOLUTION_VOLUME_SCENES||{}).length
    };
  });

  const expected=[
    'g11-volrev-22-cylinder','g11-volrev-23-cylinder-cavity','g11-volrev-24-cone',
    'g11-volrev-25-frustum','g11-volrev-26-ball','g11-volrev-27-segment',
    'g11-volrev-28-sphere-area-volume','g11-volrev-29-section','g11-volrev-30-similarity',
    'g11-volrev-31-composite','g11-volrev-32-diagnostic'
  ];
  if(data.count!==11||data.svgs!==11||data.registry!==11)throw Error('scene count '+JSON.stringify(data));
  if(data.ids.join(',')!==expected.join(','))throw Error('scene order '+data.ids.join(','));
  if(!data.labelled||data.paths<150||data.circles<3||data.hidden<5||data.sections<5||data.invalid||data.overflow)throw Error('render metrics '+JSON.stringify(data));
  if(Math.abs(data.segment-18*Math.PI)>1e-9)throw Error('segment math mismatch');
  if(Math.abs(data.layer-72*Math.PI)>1e-9)throw Error('layer math mismatch');
  if(Math.abs(data.sectionRadius-4)>1e-9)throw Error('section math mismatch');
  if(errors.length)throw Error(errors.join('\n'));

  await page.emulateMedia({media:'print'});
  const print=await page.evaluate(()=>({
    scenes:document.querySelectorAll('.revolution-scene').length,
    avoid:[...document.querySelectorAll('.revolution-scene')].every(el=>getComputedStyle(el).breakInside==='avoid')
  }));
  if(print.scenes!==11||!print.avoid)throw Error('print '+JSON.stringify(print));

  console.log('Grade 11 geometry topic 03 stage 1 browser/mobile/print QA passed: 11 accessible reusable scenes.');
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
