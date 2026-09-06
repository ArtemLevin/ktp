import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
const base='lessons/9-algebra-makarychev/04';
const ctx=vm.createContext({window:{}});ctx.window.window=ctx.window;
for(let i=1;i<=6;i++){
  const f=`${base}/packed-${String(i).padStart(2,'0')}.js`;
  new vm.Script(fs.readFileSync(f,'utf8'),{filename:f}).runInContext(ctx);
}
const parts=ctx.window.KTP_COMPRESSED_PARTS;
console.log('part lengths='+parts.map(x=>x.length).join(','));
new vm.Script(fs.readFileSync(`${base}/packed-data.js`,'utf8')).runInContext(ctx);
const encoded=ctx.window.KTP_COMPRESSED_LESSONS;
console.log(`current base64 chars=${encoded.length}, compressed bytes=${Buffer.from(encoded,'base64').length}`);
try{zlib.gunzipSync(Buffer.from(encoded,'base64'));console.log('current exact gunzip OK');}catch(e){console.log(`current exact gunzip failed: ${e.message}`);}
const candidateParts=[...parts];
candidateParts[3]=candidateParts[3].slice(0,candidateParts[0].length);
const candidate=candidateParts.join('');
console.log(`candidate part4=${candidateParts[3].length}, total=${candidate.length}`);
const source=zlib.gunzipSync(Buffer.from(candidate,'base64')).toString('utf8');
console.log(`candidate exact gunzip OK, source chars=${source.length}`);
new vm.Script(source,{filename:'candidate-payload.js'});
const runtime=vm.createContext({window:{}});runtime.window.window=runtime.window;
new vm.Script(source,{filename:'candidate-payload.js'}).runInContext(runtime);
console.log(`candidate JS OK; lessons=${runtime.window.KTP_LESSON_SERIES?.lessons?.length ?? 'n/a'}`);
