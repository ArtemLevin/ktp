import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';
const cwd=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 let file=path.resolve(cwd,'.'+pathname);
 if(!file.startsWith(cwd+path.sep)){res.writeHead(403).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
const routes=[
 ['7-algebra-makarychev/04/01.html','Многочлен'],
 ['8-algebra-makarychev/04/01.html','неравенства'],
 ['9-algebra-makarychev/03/01.html','уравнен'],
 ['10-algebra-alimov/05/01.html','Радиан'],
 ['11-algebra-alimov/04/01.html','произведен']
];
try{
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:850}});
  for(const [rel,stem] of routes){
   const errors=[];
   const handler=e=>errors.push(String(e));
   page.on('pageerror',handler);
   const response=await page.goto(origin+'/lessons/'+rel,{waitUntil:'domcontentloaded'});
   assert.equal(response.status(),200,rel+' HTTP');
   await page.waitForFunction(()=>document.querySelector('#app')?.textContent?.length>220,{timeout:20000});
   const text=await page.locator('#app').innerText();
   assert.ok(text.toLowerCase().includes(stem.toLowerCase()),rel+' lesson title missing');
   assert.ok(!text.includes('Не удалось загрузить данные урока'),rel+' decompression failure');
   assert.equal(errors.length,0,rel+' JS errors '+errors.join('\n'));
   const mobile=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));
   assert.ok(mobile.scroll<=mobile.w+28,rel+' horizontal body overflow at '+width+': '+JSON.stringify(mobile));
   await page.emulateMedia({media:'print'});
   assert.ok((await page.locator('#app').innerText()).length>220,'print lost content');
   await page.emulateMedia({media:'screen'});
   page.off('pageerror',handler);
  }
  await page.close();
 }
 console.log('Algebra middle 7–11 browser PASS: all five routes render on desktop and 390px mobile, no page errors, print retains content.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
