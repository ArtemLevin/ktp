import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
const base='lessons/9-algebra-makarychev/04';
const ctx=vm.createContext({window:{}});ctx.window.window=ctx.window;
for(let i=1;i<=6;i++){
  const f=`${base}/packed-${String(i).padStart(2,'0')}.js`;
  new vm.Script(fs.readFileSync(f,'utf8'),{filename:f}).runInContext(ctx);
}
new vm.Script(fs.readFileSync(`${base}/packed-data.js`,'utf8')).runInContext(ctx);
const encoded=ctx.window.KTP_COMPRESSED_LESSONS;
const bytes=Buffer.from(encoded,'base64');
console.log(`series04 base64 chars=${encoded.length}, compressed bytes=${bytes.length}`);
try{const ok=zlib.gunzipSync(bytes);console.log(`exact gunzip OK, source bytes=${ok.length}`);process.exit(0);}catch(e){console.log(`exact gunzip failed: ${e.message}`);}
const partial=zlib.gunzipSync(bytes,{finishFlush:zlib.constants.Z_SYNC_FLUSH}).toString('utf8');
console.log(`partial source chars=${partial.length}`);
console.log('--- recovered tail ---');
console.log(partial.slice(-4000));
console.log('--- end recovered tail ---');
try{new vm.Script(partial);console.log('partial source is syntactically complete');}catch(e){console.log(`partial syntax: ${e.message}`);}
