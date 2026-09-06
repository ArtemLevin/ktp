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
function inflateCandidate(candidate){
  try{
    const out=zlib.inflateRawSync(candidate,syncFlush);
    const valid=utf8ValidPrefix(out);
    let syntax=false,lessons=-1,completeText=false;
    if(valid===out.length){
      const text=out.toString('utf8');
      lessons=(text.match(/\"id\":\"\d{2}\"/g)||[]).length;
      completeText=text.includes('S.lessons=[')&&text.trimEnd().endsWith('})();');
      try{new vm.Script(text,{filename:'candidate.js'});syntax=true;}catch{}
    }
    return {ok:true,valid,outLen:out.length,syntax,lessons,completeText};
  }catch(error){return {ok:false,valid:-1,outLen:0,syntax:false,lessons:-1,completeText:false,error:error.message};}
}
function score(result){
  if(!result.ok)return -1;
  return (result.syntax?1_000_000_000:0)+(result.completeText&&result.outLen>300000?100_000_000:0)+Math.max(0,result.valid);
}
function locateFirstBadInput(candidate){
  let bad=-1,previous=0;
  for(let n=128;n<=candidate.length;n+=128){
    const result=inflateCandidate(candidate.subarray(0,n));
    if(result.ok&&result.valid<result.outLen){bad=n;previous=Math.max(0,n-128);break;}
  }
  if(bad<0)return candidate.length;
  for(let n=previous+1;n<=bad;n++){
    const result=inflateCandidate(candidate.subarray(0,n));
    if(result.ok&&result.valid<result.outLen)return n;
  }
  return bad;
}
function bestMutation(candidate,firstBadInput){
  const current=inflateCandidate(candidate);
  const start=Math.max(0,firstBadInput-18),end=Math.min(candidate.length-1,firstBadInput+8);
  let best={kind:'current',pos:-1,value:-1,data:candidate,result:current};
  const consider=(kind,pos,value,data)=>{
    const result=inflateCandidate(data);
    if(score(result)>score(best.result))best={kind,pos,value,data,result};
  };
  for(let pos=start;pos<=end;pos++)consider('delete-byte',pos,-1,Buffer.concat([candidate.subarray(0,pos),candidate.subarray(pos+1)]));
  for(let pos=start;pos<=end;pos++){
    const original=candidate[pos];
    for(let value=0;value<256;value++){
      if(value===original)continue;
      const data=Buffer.from(candidate);data[pos]=value;consider('replace-byte',pos,value,data);
      if(best.result.syntax)return best;
    }
  }
  if(best.result.valid<current.valid+10000){
    for(let pos=start;pos<=end;pos++){
      for(let value=0;value<256;value++){
        consider('insert-byte',pos,value,Buffer.concat([candidate.subarray(0,pos),Buffer.from([value]),candidate.subarray(pos)]));
        if(best.result.syntax)return best;
      }
    }
  }
  return best;
}

let working=Buffer.from(bytes.subarray(10));
const operations=[];
for(let round=1;round<=12;round++){
  const current=inflateCandidate(working);
  console.log(`ROUND ${round} current valid=${current.valid}/${current.outLen} syntax=${current.syntax} lessons=${current.lessons} bytes=${working.length}`);
  if(current.syntax){console.log('Payload is syntactically complete.');break;}
  const firstBadInput=locateFirstBadInput(working);
  const prefixResult=inflateCandidate(working.subarray(0,firstBadInput));
  console.log(`ROUND ${round} firstBadInput=${firstBadInput}, invalidOutput=${prefixResult.valid}/${prefixResult.outLen}`);
  if(prefixResult.ok&&prefixResult.valid<prefixResult.outLen){
    const out=zlib.inflateRawSync(working.subarray(0,firstBadInput),syncFlush);
    const p=prefixResult.valid;
    console.log(`ROUND ${round} context=${JSON.stringify(out.subarray(Math.max(0,p-110),Math.min(out.length,p+45)).toString('utf8'))}`);
  }
  const best=bestMutation(working,firstBadInput);
  console.log(`ROUND ${round} best=${best.kind} pos=${best.pos} value=${best.value} valid=${best.result.valid}/${best.result.outLen} syntax=${best.result.syntax} lessons=${best.result.lessons}`);
  if(best.kind==='current'||score(best.result)<=score(current)+16){console.log('No material improvement; stopping.');break;}
  operations.push({kind:best.kind,pos:best.pos,value:best.value,from:working[best.pos],validBefore:current.valid,validAfter:best.result.valid});
  working=best.data;
}
console.log(`OPERATIONS ${JSON.stringify(operations)}`);
const final=inflateCandidate(working);
console.log(`FINAL valid=${final.valid}/${final.outLen} syntax=${final.syntax} lessons=${final.lessons} completeText=${final.completeText} bytes=${working.length}`);
if(final.syntax){
  const source=zlib.inflateRawSync(working).toString('utf8');
  const sandbox=vm.createContext({window:{KTP_LESSON_SERIES:{lessons:[]}},console});
  try{new vm.Script(source).runInContext(sandbox);console.log(`EXECUTED lessons=${sandbox.window.KTP_LESSON_SERIES.lessons?.length}`);}catch(e){console.log(`EXECUTION failed: ${e.message}`);}
}
