(function(){
'use strict';
const M=window.KTP_VECTOR_MATH;
const a=[1.6,0,0],b=[.5,1.5,0],c=[.3,.2,1.5],n=[0,0,1];
function bounded(value,min,max){
  if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw new RangeError('Parameter outside model range');
  return value;
}
function transfer({t=0,k=1}={}){
  bounded(t,-2,2);bounded(k,-2,2);
  const base=M.scale([1.5,.3,.6],k),original=M.directedSegment('a',[-1,-1,0],M.add([-1,-1,0],base),'a⃗');
  const copy=M.translate(original,[-1+t,1,.4+t/2]);
  return {original,copy,k,t,equal:M.equal(original.displacement,copy.displacement),length:original.length,zero:original.zero};
}
function combination({x=1,y=1,z=1}={}){
  [x,y,z].forEach(v=>bounded(v,-2,2));
  const basis=[a,b,c].map(v=>[...v]),coefficients=[x,y,z],parts=basis.map((v,i)=>M.scale(v,coefficients[i]));
  const p=M.sum(parts);
  return {basis,coefficients,parts,p,zero:M.isZero(p),recovered:M.decompose(p,basis)};
}
function coplanarity({h=1,target='c'}={}){
  bounded(h,-1.5,1.5);if(!['c','outside'].includes(target))throw new RangeError('Unknown target');
  const third=M.sum([a,b,M.scale(n,h)]),basis=[[...a],[...b],third],p=target==='c'?third:[...n];
  const planar=M.coplanar(...basis),exists=!planar||target==='c';
  const representations=planar?(exists?[[1,1,0],[0,0,1]]:[]):[M.decompose(p,basis)];
  return {h,target,basis,p,planar,exists,unique:!planar,representations};
}
window.KTP_VECTOR_LAB_MATH=Object.freeze({transfer,combination,coplanarity});
window.KTP_CONTENT={'11-geometry-atanasyan::3':{spatialScenes:{}}};
})();
