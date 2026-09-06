import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';

const base='lessons/9-algebra-makarychev/04';
const context=vm.createContext({window:{},console});
for(let i=1;i<=6;i++){
  new vm.Script(fs.readFileSync(`${base}/packed-${String(i).padStart(2,'0')}.js`,'utf8')).runInContext(context);
}
new vm.Script(fs.readFileSync(`${base}/packed-data.js`,'utf8')).runInContext(context);
const original=context.window.KTP_COMPRESSED_LESSONS;
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const flush={finishFlush:zlib.constants.Z_SYNC_FLUSH};

function utf8Prefix(buf){
  let i=0;
  while(i<buf.length){
    const a=buf[i];
    if(a<0x80){i++;continue;}
    let n;if(a>=0xc2&&a<=0xdf)n=1;else if(a>=0xe0&&a<=0xef)n=2;else if(a>=0xf0&&a<=0xf4)n=3;else return i;
    if(i+n>=buf.length)return buf.length;
    const b=buf[i+1];if((b&0xc0)!==0x80)return i;
    if(n===2&&((a===0xe0&&b<0xa0)||(a===0xed&&b>=0xa0)))return i;
    if(n===3&&((a===0xf0&&b<0x90)||(a===0xf4&&b>=0x90)))return i;
    for(let j=2;j<=n;j++)if((buf[i+j]&0xc0)!==0x80)return i;
    i+=n+1;
  }
  return buf.length;
}
function inspect(b64){
  try{
    const gzip=Buffer.from(b64,'base64');
    const out=zlib.inflateRawSync(gzip.subarray(10),flush);
    const valid=utf8Prefix(out);
    let syntax=false,lessons=-1;
    if(valid===out.length){
      const text=out.toString('utf8');
      lessons=(text.match(/\"id\":\"\d{2}\"/g)||[]).length;
      try{new vm.Script(text);syntax=true;}catch{}
    }
    return {valid,outLen:out.length,syntax,lessons};
  }catch{return {valid:-1,outLen:0,syntax:false,lessons:-1};}
}
function inspectRawPrefix(b64,n){
  try{
    const gzip=Buffer.from(b64,'base64');
    const raw=gzip.subarray(10,10+n);
    const out=zlib.inflateRawSync(raw,flush);
    return {valid:utf8Prefix(out),outLen:out.length};
  }catch{return {valid:-1,outLen:0};}
}
function locateFault(b64){
  const gzip=Buffer.from(b64,'base64'),rawLen=gzip.length-10;
  let prev=0;
  for(let n=256;n<=rawLen;n+=256){
    const r=inspectRawPrefix(b64,n);
    if(r.valid>=0&&r.valid<r.outLen){
      for(let k=prev+1;k<=n;k++){
        const q=inspectRawPrefix(b64,k);if(q.valid>=0&&q.valid<q.outLen)return k;
      }
      return n;
    }
    prev=n;
  }
  return rawLen;
}
function mutate(s,pos,ch){return s.slice(0,pos)+ch+s.slice(pos+1);}
function score(r){return (r.syntax?1e9:0)+r.valid;}
function bestNear(b64,fault,radius=12){
  const current=inspect(b64);
  const abs=10+fault;
  const center=Math.floor(abs*4/3);
  let best={b64,pos:-1,from:'',to:'',result:current};
  const start=Math.max(0,center-radius),end=Math.min(b64.length-1,center+radius);
  for(let pos=start;pos<=end;pos++){
    const from=b64[pos];
    if(from==='=')continue;
    for(const to of alphabet){
      if(to===from)continue;
      const candidate=mutate(b64,pos,to),result=inspect(candidate);
      if(score(result)>score(best.result))best={b64:candidate,pos,from,to,result};
    }
  }
  return {center,start,end,best};
}

let b64=original;
const edits=[];
console.log(`original b64=${b64.length}, gzipBytes=${Buffer.from(b64,'base64').length}`);
for(let round=1;round<=12;round++){
  const current=inspect(b64);
  console.log(`ROUND ${round}: valid=${current.valid}/${current.outLen} syntax=${current.syntax} lessons=${current.lessons}`);
  if(current.syntax)break;
  const fault=locateFault(b64);
  const {center,start,end,best}=bestNear(b64,fault,16);
  console.log(` faultRaw=${fault}, b64Center=${center}, searched=${start}-${end}`);
  console.log(` best pos=${best.pos} ${best.from}->${best.to} valid=${best.result.valid}/${best.result.outLen} syntax=${best.result.syntax} lessons=${best.result.lessons}`);
  if(best.pos<0||best.result.valid<current.valid+1000){
    console.log('No strong single-base64-character repair; stopping.');
    break;
  }
  edits.push({pos:best.pos,from:best.from,to:best.to,validBefore:current.valid,validAfter:best.result.valid});
  b64=best.b64;
}
const final=inspect(b64);
console.log(`EDITS ${JSON.stringify(edits)}`);
console.log(`FINAL valid=${final.valid}/${final.outLen} syntax=${final.syntax} lessons=${final.lessons}`);
if(final.syntax){
  try{
    const source=zlib.inflateRawSync(Buffer.from(b64,'base64').subarray(10)).toString('utf8');
    const sandbox=vm.createContext({window:{KTP_LESSON_SERIES:{lessons:[]}},console});
    new vm.Script(source).runInContext(sandbox);
    console.log(`EXEC lessons=${sandbox.window.KTP_LESSON_SERIES.lessons.length}`);
  }catch(e){console.log(`EXEC failed: ${e.message}`);}
}
