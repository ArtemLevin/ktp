import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';

const base='lessons/9-algebra-makarychev/04';
const context=vm.createContext({window:{},console});
for(let i=1;i<=6;i++){
  const file=`${base}/packed-${String(i).padStart(2,'0')}.js`;
  new vm.Script(fs.readFileSync(file,'utf8'),{filename:file}).runInContext(context);
  const parts=context.window.KTP_COMPRESSED_PARTS||[];
  console.log(`${file}: partLength=${parts.at(-1)?.length||0}, total=${parts.reduce((s,x)=>s+x.length,0)}`);
}
new vm.Script(fs.readFileSync(`${base}/packed-data.js`,'utf8')).runInContext(context);
const bytes=Buffer.from(context.window.KTP_COMPRESSED_LESSONS,'base64');
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
    if(i+n>=buf.length)return buf.length;
    const b1=buf[i+1];
    if((b1&0xc0)!==0x80)return i;
    if(n===2){if(b0===0xe0&&b1<0xa0)return i;if(b0===0xed&&b1>=0xa0)return i;}
    if(n===3){if(b0===0xf0&&b1<0x90)return i;if(b0===0xf4&&b1>=0x90)return i;}
    for(let j=2;j<=n;j++)if((buf[i+j]&0xc0)!==0x80)return i;
    i+=n+1;
  }
  return buf.length;
}
function inspect(raw){
  try{
    const out=zlib.inflateRawSync(raw,syncFlush),valid=utf8ValidPrefix(out);
    let syntax=false,lessons=-1;
    if(valid===out.length){
      const text=out.toString('utf8');
      lessons=(text.match(/\"id\":\"\d{2}\"/g)||[]).length;
      try{new vm.Script(text);syntax=true;}catch{}
    }
    return {ok:true,valid,outLen:out.length,syntax,lessons};
  }catch(e){return {ok:false,valid:-1,outLen:0,syntax:false,lessons:-1,error:e.message};}
}
function locate(raw){
  let prev=0;
  for(let n=128;n<=raw.length;n+=128){
    const r=inspect(raw.subarray(0,n));
    if(r.ok&&r.valid<r.outLen){
      for(let j=prev+1;j<=n;j++){const q=inspect(raw.subarray(0,j));if(q.ok&&q.valid<q.outLen)return j;}
      return n;
    }
    prev=n;
  }
  return raw.length;
}
function score(r){return r.syntax?1e9+r.valid:r.valid;}
function search(raw,fault){
  const current=inspect(raw),start=Math.max(0,fault-18),end=Math.min(raw.length-1,fault+8);
  let best={kind:'current',pos:-1,value:-1,result:current,data:raw};
  const consider=(kind,pos,value,data)=>{const result=inspect(data);if(score(result)>score(best.result))best={kind,pos,value,result,data};};
  for(let pos=start;pos<=end;pos++)consider('delete',pos,-1,Buffer.concat([raw.subarray(0,pos),raw.subarray(pos+1)]));
  for(let pos=start;pos<=end;pos++){
    for(let value=0;value<256;value++){
      if(value===raw[pos])continue;
      const data=Buffer.from(raw);data[pos]=value;consider('replace',pos,value,data);
      if(best.result.syntax)return best;
    }
  }
  if(best.result.valid<current.valid+10000){
    for(let pos=start;pos<=end;pos++)for(let value=0;value<256;value++){
      consider('insert',pos,value,Buffer.concat([raw.subarray(0,pos),Buffer.from([value]),raw.subarray(pos)]));
      if(best.result.syntax)return best;
    }
  }
  return best;
}

const raw=Buffer.from(bytes.subarray(10));
console.log(`raw bytes=${raw.length}, original byte@2100=${raw[2100]}`);
raw[2100]=216;
let current=inspect(raw);
console.log(`after known repair 2100->216: valid=${current.valid}/${current.outLen} syntax=${current.syntax}`);
const fault=locate(raw);
console.log(`next fault input=${fault}`);
const best=search(raw,fault);
console.log(`BEST2 kind=${best.kind} pos=${best.pos} from=${best.pos>=0?raw[best.pos]:-1} value=${best.value} valid=${best.result.valid}/${best.result.outLen} syntax=${best.result.syntax} lessons=${best.result.lessons}`);
