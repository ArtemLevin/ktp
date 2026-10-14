import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
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
  const base=`http://127.0.0.1:${server.address().port}`;
  for(const width of [1280,390,320]){
    await page.setViewportSize({width,height:900});
    await page.goto(base+'/geometry/fixtures/grade11-vectors.html',{waitUntil:'networkidle'});
    const stats=await page.evaluate(()=>{
      const figs=[...document.querySelectorAll('.spatial-scene')],S=window.KTP_G11_VECTOR_SCENES,M=window.KTP_VECTOR_MATH;
      const issues=[];
      for(const fig of figs){
        const s=S[fig.dataset.spatialScene],svg=fig.querySelector('svg'),box=svg.viewBox.baseVal;
        for(const o of s.objects.filter(o=>o.type==='vector')){
          const el=[...svg.querySelectorAll('[data-vector-id]')].find(v=>v.dataset.vectorId===o.vectorId);
          const zero=M.isZero(M.subtract(s.points[o.points[1]],s.points[o.points[0]]));
          if(!el){issues.push(s.lesson+' missing '+o.vectorId);continue;}
          if(zero){if(el.tagName!=='circle'||el.hasAttribute('marker-end'))issues.push('zero arrow');}
          else{
            if(el.tagName!=='line'||!el.hasAttribute('marker-end'))issues.push('missing arrow '+o.vectorId);
            const c={...s.camera,yaw:s.camera.yaw*Math.PI/180,pitch:s.camera.pitch*Math.PI/180};
            const end=window.KTP_SPATIAL.projectPoint(s.points[o.points[1]],c);
            if(Math.abs(Number(el.getAttribute('x2'))-end.x)>1e-7||Math.abs(Number(el.getAttribute('y2'))-end.y)>1e-7)issues.push('wrong direction '+o.vectorId);
          }
        }
        for(const text of svg.querySelectorAll('text')){
          const r=text.getBBox();
          if(r.x<box.x||r.y<box.y||r.x+r.width>box.x+box.width||r.y+r.height>box.y+box.height)issues.push(s.lesson+' clipped label '+text.textContent);
        }
        for(const p of Object.values(s.points)){
          const c={...s.camera,yaw:s.camera.yaw*Math.PI/180,pitch:s.camera.pitch*Math.PI/180};
          const xy=window.KTP_SPATIAL.projectPoint(p,c);
          if(xy.x<box.x+7||xy.y<box.y+7||xy.x>box.x+box.width-7||xy.y>box.y+box.height-7)issues.push(s.lesson+' point out of bounds');
        }
      }
      const source=S['g11-vector-42-decomposition'],before=source.vectors.map(v=>v.length);
      const original=M.decompose(M.subtract(source.points.P,source.points.O),source.math.basis.map(([a,b])=>M.subtract(source.points[b],source.points[a])));
      const changed=structuredClone(source);changed.camera.yaw+=35;changed.camera.pitch-=20;
      const now=changed.vectors.map(v=>M.directedSegment(v.id,v.from,v.to,v.label).length);
      const c=s=>({...s.camera,yaw:s.camera.yaw*Math.PI/180,pitch:s.camera.pitch*Math.PI/180});
      return {count:figs.length,accessible:figs.every(f=>f.getAttribute('role')==='img'&&f.getAttribute('aria-label')&&f.querySelector('.spatial-caption')?.textContent),
        svg:document.querySelectorAll('.spatial-scene svg').length,zero:document.querySelectorAll('.spatial-zero-vector').length,
        invalid:figs.some(f=>/NaN|Infinity/.test(f.innerHTML)),issues,
        overflow:document.documentElement.scrollWidth>innerWidth+1,
        before,now,original,projectionChanged:JSON.stringify(window.KTP_SPATIAL.projectPoint(source.points.P,c(source)))!==JSON.stringify(window.KTP_SPATIAL.projectPoint(changed.points.P,c(changed)))};
    });
    check(stats.count===12&&stats.svg===12,`12 scenes at ${width}`);
    check(stats.accessible&&stats.zero===1&&!stats.invalid&&!stats.overflow,'accessible responsive scene '+width);
    check(stats.issues.length===0,`SVG geometry/labels ${width}: ${stats.issues.join('; ')}`);
    check(stats.projectionChanged&&JSON.stringify(stats.before)===JSON.stringify(stats.now),'camera changes only presentation');
    check(stats.original.every((v,i)=>Math.abs(v-[.8,-.4,1.2][i])<1e-9),'browser decomposition');
    if(process.env.KTP_QA_ARTIFACT_DIR){
      fs.mkdirSync(process.env.KTP_QA_ARTIFACT_DIR,{recursive:true});
      await page.screenshot({path:path.join(process.env.KTP_QA_ARTIFACT_DIR,`vectors-${width}.png`),fullPage:true});
    }
  }
  await page.emulateMedia({media:'print'});
  check(await page.locator('.spatial-scene').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).breakInside==='avoid')),'print avoids splitting figures');
  const pdf=await page.pdf({format:'A4',printBackground:true});
  check(pdf.length>15000,'12 scenes in PDF');
  if(process.env.KTP_QA_ARTIFACT_DIR)fs.writeFileSync(path.join(process.env.KTP_QA_ARTIFACT_DIR,'vectors.pdf'),pdf);
  await page.emulateMedia({media:'screen'});
  await page.goto(base+'/geometry/fixtures/grade10-spatial-foundation.html',{waitUntil:'networkidle'});
  const regression=await page.evaluate(()=>({count:document.querySelectorAll('.spatial-scene svg').length,
    hidden:document.querySelectorAll('.spatial-hidden').length,planes:document.querySelectorAll('.spatial-plane').length,
    vectors:document.querySelectorAll('[data-vector-id]').length,overflow:document.documentElement.scrollWidth>innerWidth+1}));
  check(regression.count===3&&regression.hidden>=4&&regression.planes>=1&&regression.vectors===0&&!regression.overflow,'grade10 spatial renderer regression');
  check(errors.length===0,'browser errors: '+errors.join('; '));
  console.log(`Grade 11 geometry topic 04 stage 1 browser/mobile/print/PDF QA passed: ${checks} checks.`);
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
