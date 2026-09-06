import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';

const base='lessons/9-algebra-makarychev/04';
const context=vm.createContext({window:{},console});
for(let i=1;i<=6;i++) new vm.Script(fs.readFileSync(`${base}/packed-${String(i).padStart(2,'0')}.js`,'utf8')).runInContext(context);
new vm.Script(fs.readFileSync(`${base}/packed-data.js`,'utf8')).runInContext(context);
const original=context.window.KTP_COMPRESSED_LESSONS;
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const flush={finishFlush:zlib.constants.Z_SYNC_FLUSH};

function utf8Prefix(buf){
  let i=0;
  while(i<buf.length){
    const a=buf[i];if(a<0x80){i++;continue;}
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
function inspect(s){
  try{
    const gzip=Buffer.from(s,'base64'),out=zlib.inflateRawSync(gzip.subarray(10),flush),valid=utf8Prefix(out);
    let syntax=false,lessons=-1;
    if(valid===out.length){const text=out.toString('utf8');lessons=(text.match(/\"id\":\"\d{2}\"/g)||[]).length;try{new vm.Script(text);syntax=true;}catch{}}
    return {valid,outLen:out.length,syntax,lessons};
  }catch{return {valid:-1,outLen:0,syntax:false,lessons:-1};}
}
function inspectPrefix(s,n){
  try{const gzip=Buffer.from(s,'base64'),out=zlib.inflateRawSync(gzip.subarray(10,10+n),flush);return {valid:utf8Prefix(out),outLen:out.length};}
  catch{return {valid:-1,outLen:0};}
}
function locateFault(s){
  const rawLen=Buffer.from(s,'base64').length-10;let prev=0;
  for(let n=256;n<=rawLen;n+=256){const r=inspectPrefix(s,n);if(r.valid>=0&&r.valid<r.outLen){for(let k=prev+1;k<=n;k++){const q=inspectPrefix(s,k);if(q.valid>=0&&q.valid<q.outLen)return k;}return n;}prev=n;}
  return rawLen;
}
const score=r=>(r.syntax?1e9:0)+r.valid;
function searchNear(s,fault,radius=18){
  const current=inspect(s),center=Math.floor((10+fault)*4/3),start=Math.max(0,center-radius),end=Math.min(s.length-1,center+radius);
  let best={kind:'current',pos:-1,from:'',to:'',s,result:current};
  const consider=(kind,pos,from,to,candidate)=>{const result=inspect(candidate);if(score(result)>score(best.result))best={kind,pos,from,to,s:candidate,result};};
  for(let pos=start;pos<=end;pos++){
    const from=s[pos];
    for(const to of alphabet)if(to!==from)consider('replace',pos,from,to,s.slice(0,pos)+to+s.slice(pos+1));
    consider('delete',pos,from,'',s.slice(0,pos)+s.slice(pos+1));
    for(const to of alphabet)consider('insert-before',pos,'',to,s.slice(0,pos)+to+s.slice(pos));
  }
  return {center,start,end,best};
}

let s=original,edits=[];
console.log(`original length=${s.length}, gzipBytes=${Buffer.from(s,'base64').length}`);
for(let round=1;round<=10;round++){
  const current=inspect(s);console.log(`ROUND ${round} current=${current.valid}/${current.outLen} syntax=${current.syntax} lessons=${current.lessons} b64len=${s.length}`);if(current.syntax)break;
  const fault=locateFault(s),found=searchNear(s,fault),b=found.best;
  console.log(` faultRaw=${fault}, b64Center=${found.center}, search=${found.start}-${found.end}`);
  console.log(` best ${b.kind} pos=${b.pos} ${b.from}->${b.to} valid=${b.result.valid}/${b.result.outLen} syntax=${b.result.syntax}`);
  if(b.pos<0||b.result.valid<current.valid+1000){console.log('No strong repair; stopping.');break;}
  edits.push({kind:b.kind,pos:b.pos,from:b.from,to:b.to,validBefore:current.valid,validAfter:b.result.valid});s=b.s;
}
const final=inspect(s);console.log(`EDITS ${JSON.stringify(edits)}`);console.log(`FINAL ${final.valid}/${final.outLen} syntax=${final.syntax} lessons=${final.lessons} b64len=${s.length}`);
if(final.syntax){
  const source=zlib.inflateRawSync(Buffer.from(s,'base64').subarray(10)).toString('utf8'),sandbox=vm.createContext({window:{KTP_LESSON_SERIES:{lessons:[]}},console});
  try{new vm.Script(source).runInContext(sandbox);console.log(`EXEC lessons=${sandbox.window.KTP_LESSON_SERIES.lessons.length}`);}catch(e){console.log(`EXEC failed: ${e.message}`);}
}
