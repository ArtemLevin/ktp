import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const ROOT=process.cwd();
const LINES=[
  {row:'7-algebra-makarychev',topics:7},
  {row:'8-algebra-makarychev',topics:7},
  {row:'9-algebra-makarychev',topics:6},
  {row:'10-algebra-alimov',topics:8},
  {row:'11-algebra-alimov',topics:7}
];
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
const exists=p=>fs.existsSync(path.join(ROOT,p));
const walk=(dir,predicate,out=[])=>{if(!exists(dir))return out;for(const e of fs.readdirSync(path.join(ROOT,dir),{withFileTypes:true})){const rel=path.posix.join(dir,e.name);if(e.isDirectory())walk(rel,predicate,out);else if(predicate(rel))out.push(rel);}return out;};
const numericDirs=dir=>fs.readdirSync(path.join(ROOT,dir),{withFileTypes:true}).filter(e=>e.isDirectory()&&/^\d{2}$/.test(e.name)).map(e=>e.name).sort();

const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent((req.url||'/').split('?')[0]);
  const rel=raw==='/'?'index.html':raw.replace(/^\/+/, '');
  const file=path.normalize(path.join(ROOT,rel));
  if(!file.startsWith(path.normalize(ROOT+path.sep))){res.writeHead(403);return res.end('forbidden');}
  let target=file;
  try{if(fs.statSync(target).isDirectory())target=path.join(target,'index.html');}catch{}
  if(!fs.existsSync(target)){res.writeHead(404);return res.end('not found');}
  res.writeHead(200,{'Content-Type':mime[path.extname(target).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(target).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {port}=server.address();
const base=`http://127.0.0.1:${port}`;
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true});
let pageErrors=[];
page.on('pageerror',err=>pageErrors.push(String(err.message||err)));
page.on('console',msg=>{if(msg.type()==='error')pageErrors.push(`console: ${msg.text()}`);});

const mobilePages=[];
const printPages=[];
for(const line of LINES){
  for(let i=1;i<=line.topics;i++)mobilePages.push(`topics/${line.row}/${String(i).padStart(2,'0')}.html`);
  for(const series of numericDirs(`lessons/${line.row}`)){
    const dir=`lessons/${line.row}/${series}`;
    mobilePages.push(`${dir}/index.html`);
    const lessons=fs.readdirSync(path.join(ROOT,dir)).filter(f=>/^\d{2}\.html$/.test(f)).sort();
    if(lessons.length){mobilePages.push(`${dir}/${lessons[0]}`,`${dir}/${lessons.at(-1)}`);}
  }
  for(const topic of numericDirs(`assessments/${line.row}`)){
    mobilePages.push(`assessments/${line.row}/${topic}/independent.html`,`assessments/${line.row}/${topic}/control.html`);
  }
  const labs=walk(`labs/${line.row}`,p=>p.endsWith('/index.html')||p===`labs/${line.row}/index.html`);
  mobilePages.push(...labs);
  printPages.push(`topics/${line.row}/01.html`,`lessons/${line.row}/01/01.html`,`assessments/${line.row}/01/independent.html`);
  if(labs[0])printPages.push(labs[0]);
}

async function openAndAssert(rel,{print=false}={}){
  pageErrors=[];
  await page.emulateMedia({media:print?'print':'screen'});
  const response=await page.goto(`${base}/${rel}`,{waitUntil:'domcontentloaded',timeout:15000});
  if(!response||!response.ok())throw new Error(`${rel}: HTTP ${response?.status()}`);
  await page.waitForFunction(()=>document.body&&document.body.innerText.trim().length>40,{timeout:8000});
  await page.waitForTimeout(80);
  if(pageErrors.length)throw new Error(`${rel}: browser errors: ${pageErrors.join(' | ')}`);
  const state=await page.evaluate(()=>({
    text:document.body.innerText.trim().length,
    width:document.documentElement.scrollWidth,
    viewport:document.documentElement.clientWidth,
    bodyDisplay:getComputedStyle(document.body).display,
    bodyVisibility:getComputedStyle(document.body).visibility
  }));
  if(state.text<40)throw new Error(`${rel}: rendered content too short`);
  if(state.bodyDisplay==='none'||state.bodyVisibility==='hidden')throw new Error(`${rel}: body hidden in ${print?'print':'screen'} mode`);
  if(!print&&state.width>state.viewport+4)throw new Error(`${rel}: horizontal overflow ${state.width}px > ${state.viewport}px on 390px viewport`);
}

for(const rel of [...new Set(mobilePages)])await openAndAssert(rel);
for(const rel of [...new Set(printPages)])await openAndAssert(rel,{print:true});

for(const line of LINES){
  const rel=`assessments/${line.row}/01/independent.html`;
  await openAndAssert(rel,{print:true});
  const pdf=await page.pdf({format:'A4',printBackground:true});
  if(pdf.length<5000)throw new Error(`${rel}: generated PDF unexpectedly small (${pdf.length} bytes)`);
}

console.log(`Browser QA passed: ${new Set(mobilePages).size} mobile pages, ${new Set(printPages).size} print pages, 5 A4 assessment PDFs.`);
await browser.close();
await new Promise(resolve=>server.close(resolve));
