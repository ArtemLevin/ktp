import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const ROOT=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{
  const rel=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/,'')||'index.html';
  const target=path.normalize(path.join(ROOT,rel));
  if(!target.startsWith(path.normalize(ROOT+path.sep))||!fs.existsSync(target)){res.writeHead(404);return res.end('not found');}
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(target).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const {port}=server.address();

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true});
const errors=[];
page.on('pageerror',e=>errors.push('pageerror: '+e.message));
page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});

const response=await page.goto('http://127.0.0.1:'+port+'/topics/10-geometry-atanasyan/04.html',{waitUntil:'networkidle',timeout:25000});
if(!response?.ok())throw new Error('topic HTTP '+response?.status());
await page.waitForSelector('.spatial-scene svg',{timeout:10000});

const state=await page.evaluate(()=>({
  title:document.title,
  text:document.body.innerText.length,
  scrollWidth:document.documentElement.scrollWidth,
  clientWidth:document.documentElement.clientWidth,
  spatial:document.querySelectorAll('.spatial-scene svg').length,
  links:[...document.querySelectorAll('a')].map(a=>a.textContent.trim())
}));
if(state.scrollWidth>state.clientWidth+4)throw new Error('mobile overflow '+state.scrollWidth+'>'+state.clientWidth);
if(state.text<8500)throw new Error('topic rendered text too short '+state.text);
if(state.spatial<8)throw new Error('expected >=8 rendered spatial scenes, got '+state.spatial);
if(errors.length)throw new Error(errors.join(' | '));

const body=await page.locator('body').innerText();
for(const token of [
  'Многогранник: что именно мы изучаем',
  'Призма',
  'Сечение призмы',
  'Правильная пирамида',
  'Соотношение Эйлера',
  'Объём призмы',
  'Объём пирамиды',
  'Подобные тела'
]) if(!body.includes(token))throw new Error('topic missing '+token);

if(body.includes('Открыть лабораторию'))throw new Error('planned lab must not be exposed before implementation');
if(body.includes('18 последовательных уроков'))throw new Error('lesson catalog must not be exposed before stage 3');

await page.emulateMedia({media:'print'});
const pdf=await page.pdf({format:'A4',printBackground:true});
if(pdf.length<15000)throw new Error('topic print PDF too small '+pdf.length);

console.log('Grade 10 Atanasyan topic 04 core browser QA passed: topic, spatial scenes, mobile and print.');
await browser.close();
await new Promise(r=>server.close(r));
