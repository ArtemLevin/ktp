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

const raw=Buffer.from(bytes.subarray(10));
const syncFlush={finishFlush:zlib.constants.Z_SYNC_FLUSH};

function utf8ValidPrefix(buf){
  let i=0;
  while(i<buf.length){
    const b0=buf[i];
    if(b0<=0x7f){i++;continue;}
    let n=0;
    if(b0>=0xc2&&b0<=0xdf)n=1;
    else if(b0>=0xe0&&b0<=0xef)n=2;
    else if(b0>=0xf0&&b0<=0xf4)n=3;
    else return i;
    if(i+n>=buf.length)return buf.length; // incomplete trailing code point is harmless for prefix diagnostics
    const b1=buf[i+1];
    if((b1&0xc0)!==0x80)return i;
    if(n===2){
      if(b0===0xe0&&b1<0xa0)return i;
      if(b0===0xed&&b1>=0xa0)return i;
    }
    if(n===3){
      if(b0===0xf0&&b1<0x90)return i;
      if(b0===0xf4&&b1>=0x90)return i;
    }
    for(let j=2;j<=n;j++)if((buf[i+j]&0xc0)!==0x80)return i;
    i+=n+1;
  }
  return buf.length;
}

function inflateCandidate(candidate){
  try{
    const out=zlib.inflateRawSync(candidate,syncFlush);
    const valid=utf8ValidPrefix(out);
    let syntax=false,lessons=-1;
    if(valid===out.length){
      const text=out.toString('utf8');
      lessons=(text.match(/\"id\":\"\d{2}\"/g)||[]).length;
      try{new vm.Script(text,{filename:'candidate.js'});syntax=true;}catch{}
    }
    return {ok:true,valid,outLen:out.length,syntax,lessons};
  }catch(error){return {ok:false,valid:-1,outLen:0,syntax:false,lessons:-1,error:error.message};}
}

const current=inflateCandidate(raw);
console.log(`current raw: ok=${current.ok}, validUtf8Prefix=${current.valid}, outLen=${current.outLen}, syntax=${current.syntax}, lessons=${current.lessons}`);

let firstBadInput=-1,previous=0;
for(let n=64;n<=raw.length;n+=64){
  const result=inflateCandidate(raw.subarray(0,n));
  if(result.ok&&result.valid<result.outLen){firstBadInput=n;previous=Math.max(0,n-64);break;}
}
if(firstBadInput<0)firstBadInput=raw.length;
for(let n=previous+1;n<=firstBadInput;n++){
  const result=inflateCandidate(raw.subarray(0,n));
  if(result.ok&&result.valid<result.outLen){firstBadInput=n;break;}
}
console.log(`first input prefix producing invalid UTF-8: ${firstBadInput} raw bytes after gzip header`);
const faultResult=inflateCandidate(raw.subarray(0,firstBadInput));
if(faultResult.ok){
  const out=zlib.inflateRawSync(raw.subarray(0,firstBadInput),syncFlush);
  const p=faultResult.valid;
  console.log(`first invalid output byte=${p}; context=${JSON.stringify(out.subarray(Math.max(0,p-180),Math.min(out.length,p+80)).toString('utf8'))}`);
}

const start=Math.max(0,firstBadInput-20),end=Math.min(raw.length-1,firstBadInput+8);
let best={kind:'current',pos:-1,value:-1,...current};
function consider(kind,pos,value,candidate){
  const result=inflateCandidate(candidate);
  const score=(result.syntax?1_000_000_000:0)+(result.valid===result.outLen?100_000_000:0)+Math.max(0,result.valid);
  const bestScore=(best.syntax?1_000_000_000:0)+(best.valid===best.outLen?100_000_000:0)+Math.max(0,best.valid);
  if(score>bestScore){best={kind,pos,value,...result};console.log(`BEST ${kind} pos=${pos} value=${value}: valid=${result.valid}/${result.outLen}, syntax=${result.syntax}, lessons=${result.lessons}`);}
}

for(let pos=start;pos<=end;pos++){
  const candidate=Buffer.concat([raw.subarray(0,pos),raw.subarray(pos+1)]);
  consider('delete-byte',pos,-1,candidate);
}

if(!best.syntax){
  for(let pos=start;pos<=end;pos++){
    const original=raw[pos];
    for(let value=0;value<256;value++){
      if(value===original)continue;
      const candidate=Buffer.from(raw);candidate[pos]=value;
      consider('replace-byte',pos,value,candidate);
      if(best.syntax)break;
    }
    if(best.syntax)break;
  }
}

if(!best.syntax&&best.valid<100000){
  for(let pos=start;pos<=end;pos++){
    for(let value=0;value<256;value++){
      const candidate=Buffer.concat([raw.subarray(0,pos),Buffer.from([value]),raw.subarray(pos)]);
      consider('insert-byte',pos,value,candidate);
      if(best.syntax)break;
    }
    if(best.syntax)break;
  }
}

console.log(`FINAL BEST kind=${best.kind} pos=${best.pos} value=${best.value} valid=${best.valid}/${best.outLen} syntax=${best.syntax} lessons=${best.lessons}`);
