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
const targetLen=parts[0].length;
const extra=parts[3].length-targetLen;
console.log(`part4 extra=${extra}; brute-forcing one contiguous insertion removal`);
let found=null;
for(let offset=0;offset<=targetLen;offset+=4){
  const repaired=parts[3].slice(0,offset)+parts[3].slice(offset+extra);
  if(repaired.length!==targetLen)continue;
  const encoded=[parts[0],parts[1],parts[2],repaired,parts[4],parts[5]].join('');
  try{
    const source=zlib.gunzipSync(Buffer.from(encoded,'base64')).toString('utf8');
    new vm.Script(source,{filename:'candidate-payload.js'});
    const runtime=vm.createContext({window:{}});runtime.window.window=runtime.window;
    new vm.Script(source,{filename:'candidate-payload.js'}).runInContext(runtime);
    if(runtime.window.KTP_LESSON_SERIES?.lessons?.length===20){found={offset,sourceChars:source.length,repaired};break;}
  }catch{}
}
if(!found)throw new Error('No valid contiguous-insertion repair candidate found');
console.log(`REPAIR FOUND offset=${found.offset}, remove=${extra}, repairedLen=${found.repaired.length}, sourceChars=${found.sourceChars}`);
console.log(`prefix chars kept=${found.offset}, suffix chars kept=${targetLen-found.offset}`);
