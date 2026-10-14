import fs from 'node:fs';
import vm from 'node:vm';

let checks=0;
const check=(condition,message)=>{checks++;if(!condition)throw Error(message);};
const near=(a,b,message,eps=1e-9)=>check(Math.abs(a-b)<=eps*Math.max(1,Math.abs(b)),`${message}: ${a} vs ${b}`);
const arr=(a,b,message)=>{check(a.length===b.length,message+' length');a.forEach((v,i)=>near(v,b[i],message+' '+i));};
const reject=(fn,message)=>{let thrown=false;try{fn();}catch{thrown=true;}check(thrown,message);};
const ctx={window:{}};
for(const file of ['geometry/vector-math.js','geometry/grade11-vector-scenes.js'])
  vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const M=ctx.window.KTP_VECTOR_MATH,S=ctx.window.KTP_G11_VECTOR_SCENES;
check(Boolean(M&&S),'API and scenes registered');
const input=[1,2,2],before=JSON.stringify(input);
near(M.length(input),3,'3D length 1-2-2');
arr(M.add([1,-2,3],[4,2,-1]),[5,0,2],'sum');
arr(M.subtract([1,-2,3],[4,2,-1]),[-3,-4,4],'difference');
arr(M.scale([2,-4,1],-.5),[-1,2,-.5],'negative multiplier');
arr(M.scale(input,0),[0,0,0],'zero multiplier');
arr(M.sum([]),[0,0,0],'empty sum');
arr(M.sum([[1,2,3],[4,-2,1],[-5,0,-4]]),[0,0,0],'closed sum');
check(before===JSON.stringify(input),'inputs preserved');
const seg=M.directedSegment('a',[3,2,1],[4,4,3],'a⃗');
near(seg.length,3,'directed length');arr(seg.displacement,[1,2,2],'directed displacement');
check(seg.from!==input&&!seg.zero,'segment shape');
const stale={...seg,displacement:[99,99,99],length:99};
const translated=M.translate(stale,[-1,0,4]);
arr(translated.to,[0,2,6],'translate recomputes from endpoints');
near(translated.length,3,'translate length');
check(translated.id==='a'&&translated.label==='a⃗','identity preserved');
for(const magnitude of [1e-100,1e-7,1,1e7,1e100]){
  const a=[magnitude,0,0],b=[0,magnitude,0];
  check(M.relation(a,[2*magnitude,0,0]).codirected,'same direction scaled '+magnitude);
  check(M.relation(a,[-2*magnitude,0,0]).opposed,'opposed scaled '+magnitude);
  check(!M.relation(a,b).collinear,'independent directions scaled '+magnitude);
  check(!M.isZero(a),'small nonzero preserved '+magnitude);
  check(!M.equal(a,[0,0,0]),'small nonzero not equal to zero '+magnitude);
  check(!M.coplanar(a,b,[0,0,magnitude]),'noncoplanar scaled '+magnitude);
  check(M.coplanar(a,b,[magnitude,magnitude,0]),'coplanar scaled '+magnitude);
}
for(const zero of [[0,0,0],[-0,0,0]]){
  check(M.isZero(zero),'zero recognised');
  for(const a of [[1,2,3],[0,0,0]]){
    const r=M.relation(zero,a);
    check(r.collinear&&r.codirected&&!r.opposed&&!r.directionDefined,'zero convention');
    check(M.coplanar(zero,[1,0,0],a),'zero coplanarity');
  }
}
check(!M.relation([1,0,0],[0,1,0]).equal,'same length does not imply equality');
check(M.relation([1,2,3],[1,2,3]).equal,'equal vectors');
check(!M.relation([1,0,0],[2,0,0]).equal,'same direction different length');
const plane=M.plane([2,3,4],[1,0,0],[0,1,1]);
check(M.inPlane(plane,[5,5,6]),'point in translated plane');
check(!M.inPlane(plane,[5,5,7]),'point outside plane');
check(M.inPlane({...plane,normal:[0,0,1]},[0,2,2],false),'plane ignores stale normal');
const basis=[[2,0,0],[1,3,0],[1,1,4]];
arr(M.decompose([4.5,-.5,4],basis),[2,-.5,1],'oblique basis known coefficients');
arr(M.decompose([0,0,0],basis),[0,0,0],'zero decomposition');
const box=M.parallelepiped([10,-3,7],basis);
arr(box.points.D,[14,1,11],'parallelepiped opposite vertex');
arr(box.diagonal,[4,4,4],'parallelepiped diagonal');
check(Object.keys(box.points).length===8,'eight vertices');

// Independent arithmetic construction, no call to linearCombination to produce test values.
let seed=20261014;
const next=()=>{seed=(1664525*seed+1013904223)>>>0;return (seed%81-40)/4;};
for(let trial=0;trial<160;trial++){
  const k=[next(),next(),next()];
  const target=[2*k[0]+k[1]+k[2],3*k[1]+k[2],4*k[2]];
  arr(M.decompose(target,basis),k,'independent decomposition '+trial);
  const cycle=v=>[v[2],v[0],v[1]];
  arr(M.decompose(cycle(target),basis.map(cycle)),k,'rotation invariant '+trial);
}
for(const bad of [null,{},'1,2,3',[1,2],[1,2,3,4],['1',2,3],[NaN,0,0],[Infinity,0,0],Array(3)])
  reject(()=>M.length(bad),'invalid vector rejected '+String(bad));
for(const bad of ['2',null,NaN,Infinity])reject(()=>M.scale(input,bad),'invalid multiplier '+String(bad));
const dependent=[[1,0,0],[0,1,0],[1,1,0]];
for(const target of [[1,1,0],[0,0,1],[0,0,0]])reject(()=>M.decompose(target,dependent),'dependent basis rejected');
reject(()=>M.decompose([1,2,3],[[1,0,0],[0,1,0],[1,1,1e-12]]),'near-dependent basis rejected');
reject(()=>M.parallelepiped([0,0,0],dependent),'degenerate box rejected');
reject(()=>M.plane([0,0,0],[1,0,0],[2,0,0]),'degenerate plane rejected');
reject(()=>M.plane([0,0,0],[0,0,0],[2,0,0]),'zero plane direction rejected');
reject(()=>M.linearCombination(basis,[1,2]),'coefficient count mismatch');
reject(()=>M.linearCombination(basis,Array(3)),'sparse coefficients rejected');
reject(()=>M.sum(Array(2)),'sparse vectors rejected');
reject(()=>M.directedSegment('',[0,0,0],[1,0,0]),'missing vector id');
reject(()=>M.add([Number.MAX_VALUE,0,0],[Number.MAX_VALUE,0,0]),'overflow rejected');

const ids=Object.keys(S);
check(ids.length===12,'twelve scenes');
arr(Object.values(S).map(s=>s.lesson),Array.from({length:12},(_,i)=>33+i),'lessons 33-44');
const delta=(s,pair)=>M.subtract(s.points[pair[1]],s.points[pair[0]]);
for(const [id,s] of Object.entries(S)){
  check(Boolean(s.title&&s.ariaLabel&&s.caption),'accessible scene '+id);
  const snapshot=JSON.stringify(s);
  check(s.vectors.length>0,'directed model descriptors '+id);
  for(const [name,p] of Object.entries(s.points))check(p.length===3&&p.every(Number.isFinite),'finite point '+id+' '+name);
  const usedIds=new Set();
  for(const o of s.objects){
    check(o.points.every(p=>Object.hasOwn(s.points,p)),'object point references '+id);
    if(o.type==='vector'){
      check(!usedIds.has(o.vectorId),'unique vector id '+id);usedIds.add(o.vectorId);
      const descriptor=s.vectors.find(v=>v.id===o.vectorId);
      arr(descriptor.displacement,delta(s,o.points),'scene displacement '+id+' '+o.vectorId);
      near(descriptor.length,Math.hypot(...descriptor.displacement),'scene true length');
    }
  }
  const q=s.math;
  if(q.equal)check(M.equal(...q.equal.map(pair=>delta(s,pair))),'claimed equality '+id);
  if(q.opposed)check(M.relation(...q.opposed.map(pair=>delta(s,pair))).opposed,'claimed opposite '+id);
  if(q.terms&&q.result&&q.focus!=='difference'){
    const value=M.scale(M.sum(q.terms.map(pair=>delta(s,pair))),q.factor??1);
    arr(value,delta(s,q.result),'claimed sum/difference/midpoint '+id);
  }
  if(q.focus==='difference')arr(M.subtract(...q.terms.map(pair=>delta(s,pair))),delta(s,q.result),'difference orientation');
  if(q.focus==='directed'){near(M.length(delta(s,q.vector)),Math.sqrt(6),'scene length');check(M.isZero(delta(s,q.zero)),'scene zero');}
  if(q.scaled)for(const item of q.scaled)arr(delta(s,item.vector),M.scale(delta(s,q.base),item.k),'scene multiplier');
  if(q.focus==='coplanar'){
    const directions=q.basis.map(pair=>delta(s,pair));
    check(M.coplanar(...directions,delta(s,q.target)),'coplanarity after transfer');
    arr(M.linearCombination(directions,q.coefficients),delta(s,q.target),'coplanar coefficients');
    arr(delta(s,q.copy),delta(s,q.target),'equal vector outside original plane');
    check(!M.inPlane(M.plane(s.points.O,...directions),s.points.U),'original attachment is outside plane');
  }
  if(q.focus==='box'){const b=q.basis.map(pair=>delta(s,pair));check(!M.coplanar(...b),'box noncoplanarity');arr(M.sum(b),delta(s,q.result),'box diagonal');}
  if(q.focus==='decomposition')arr(M.decompose(delta(s,q.target),q.basis.map(pair=>delta(s,pair))),q.coefficients,'scene oblique decomposition');
  if(q.midpoint)arr(s.points[q.midpoint[2]],M.scale(M.add(s.points[q.midpoint[0]],s.points[q.midpoint[1]]),.5),'midpoint');
  if(q.focus==='dependent'){
    const b=q.basis.map(pair=>delta(s,pair));check(M.coplanar(...b),'dependent scene');
    for(const k of q.alternatives)arr(M.linearCombination(b,k),delta(s,q.target),'nonunique decomposition');
    check(!M.coplanar(b[0],b[1],delta(s,q.outside)),'outside vector cannot be decomposed');
  }
  check(JSON.stringify(s)===snapshot,'scene untouched by math '+id);
}
check(!/document|camera|svg|projectPoint/.test(fs.readFileSync('geometry/vector-math.js','utf8').replace(/\/\/[^\n]*/g,'')),'model independent of presentation');
console.log(`Grade 11 geometry topic 04 stage 1 math/scenes QA passed: ${checks} checks.`);
