import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';
const cwd=process.cwd();
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
 let pathname=decodeURIComponent(new URL(req.url,'http://local.test').pathname);
 let file=path.resolve(cwd,'.'+pathname);
 if(!file.startsWith(cwd+path.sep)){res.writeHead(403).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
const routes=[
 ['7-algebra-makarychev/07/01.html','Рациональные числа'],
 ['8-algebra-makarychev/07/01.html','Рациональные выражения'],
 ['9-algebra-makarychev/01/01.html','Действительные числа']
];
try{
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:830}});
  for(const [rel,title] of routes){
   const errors=[];const handler=e=>errors.push(String(e));page.on('pageerror',handler);
   const response=await page.goto(origin+'/lessons/'+rel,{waitUntil:'domcontentloaded'});
   assert.equal(response.status(),200,rel+' HTTP');
   await page.waitForFunction(()=>document.querySelector('#app')?.textContent?.length>220,{timeout:20000});
   const text=await page.locator('#app').innerText();
   assert.ok(text.toLowerCase().includes(title.toLowerCase()),rel+' title missing');
   assert.ok(!text.includes('Не удалось загрузить данные урока'));
   assert.equal(errors.length,0,rel+' errors '+errors.join('\n'));
   const v=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));
   assert.ok(v.scroll<=v.w+28,rel+' horizontal overflow: '+JSON.stringify(v));
   await page.emulateMedia({media:'print'});
   assert.ok((await page.locator('#app').innerText()).length>220,'missing print lesson');
   await page.emulateMedia({media:'screen'});page.off('pageerror',handler);
  }
  await page.close();
 }
 console.log('Grades 7, 8 ending and grade 9 opening browser QA PASS at 1280 and 390 px plus print.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}