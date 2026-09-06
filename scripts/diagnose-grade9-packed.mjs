import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';

const base='lessons/9-algebra-makarychev/04';
const context=vm.createContext({window:{},console});
for(let i=1;i<=6;i++){
  const file=`${base}/packed-${String(i).padStart(2,'0')}.js`;
  new vm.Script(fs.readFileSync(file,'utf8'),{filename:file}).runInContext(context);
  const parts=context.window.KTP_COMPRESSED_PARTS||[];
  console.log(`${file}: parts=${parts.length}, lastLength=${parts.at(-1)?.length||0}, total=${parts.reduce((s,x)=>s+x.length,0)}`);
}
new vm.Script(fs.readFileSync(`${base}/packed-data.js`,'utf8')).runInContext(context);
const b64=context.window.KTP_COMPRESSED_LESSONS;
const bytes=Buffer.from(b64,'base64');
console.log(`joined base64=${b64.length}, bytes=${bytes.length}, base64Mod4=${b64.length%4}`);
console.log(`header=${[...bytes.subarray(0,10)].map(x=>x.toString(16).padStart(2,'0')).join(' ')}, tail=${[...bytes.subarray(-16)].map(x=>x.toString(16).padStart(2,'0')).join(' ')}`);
try{console.log(`gunzip strict length=${zlib.gunzipSync(bytes).length}`);}catch(e){console.log(`gunzip strict failed: ${e.message}`);}
const body=bytes.subarray(10);
let best={len:-1,trim:null,text:''};
for(let trim=0;trim<=8;trim++){
  const raw=trim?body.subarray(0,body.length-trim):body;
  try{
    const text=zlib.inflateRawSync(raw,{finishFlush:zlib.constants.Z_SYNC_FLUSH}).toString('utf8');
    console.log(`partial trim=${trim}: utf8=${text.length}`);
    if(text.length>best.len)best={len:text.length,trim,text};
  }catch(e){console.log(`partial trim=${trim} failed: ${e.message}`);}
}
console.log(`best partial: trim=${best.trim}, length=${best.len}`);
console.log(`HEAD>>>${JSON.stringify(best.text.slice(0,1600))}<<<HEAD`);
const replacement=best.text.indexOf('\uFFFD');
console.log(`first replacement char index=${replacement}`);
const markers=[...best.text.matchAll(/(?:id|number|globalNumber)\s*:\s*["']?(\d{1,3})/g)].slice(-80);
console.log('last numeric markers:',markers.map(m=>`${m[0]}@${m.index}`).join(' | '));
const lessonIds=[...best.text.matchAll(/id\s*:\s*["'](\d{2})["']/g)];
console.log(`lesson-like id matches=${lessonIds.length}; last=${lessonIds.slice(-30).map(m=>`${m[1]}@${m.index}`).join(', ')}`);
const lessonNumbers=[...best.text.matchAll(/number\s*:\s*(\d{1,3})/g)];
console.log(`number matches=${lessonNumbers.length}; last=${lessonNumbers.slice(-30).map(m=>`${m[1]}@${m.index}`).join(', ')}`);
console.log(`last lessons token=${best.text.lastIndexOf('lessons')}, last summary token=${best.text.lastIndexOf('summary')}, last control token=${best.text.lastIndexOf('control')}`);
console.log(`TAIL>>>${JSON.stringify(best.text.slice(-1800))}<<<TAIL`);
try{new vm.Script(best.text,{filename:'partial-payload.js'});console.log('partial payload is syntactically complete');}catch(e){console.log(`partial syntax error: ${e.message}`);}
