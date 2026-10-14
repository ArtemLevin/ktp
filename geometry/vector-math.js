(function(){
'use strict';

// Model data only. The camera and SVG never participate in these calculations.
const EPS=1e-10;
function number(value){
  if(typeof value!=='number'||!Number.isFinite(value))throw new TypeError('Expected a finite number');
  return value;
}
function vector(value){
  if(!Array.isArray(value)||value.length!==3)throw new TypeError('Expected [x,y,z]');
  return Array.from(value,number);
}
function result(value){
  if(!value.every(Number.isFinite))throw new RangeError('Vector calculation overflow');
  return value;
}
function add(a,b){a=vector(a);b=vector(b);return result(a.map((v,i)=>v+b[i]));}
function subtract(a,b){a=vector(a);b=vector(b);return result(a.map((v,i)=>v-b[i]));}
function scale(a,k){a=vector(a);k=number(k);return result(a.map(v=>v*k));}
function length(a){
  const n=Math.hypot(...vector(a));
  if(!Number.isFinite(n))throw new RangeError('Vector length overflow');
  return n;
}
function isZero(a){return vector(a).every(v=>v===0);}
function unit(a){const n=length(a);return n===0?null:vector(a).map(v=>v/n);}
function equal(a,b){
  a=vector(a);b=vector(b);
  if(isZero(a)||isZero(b))return isZero(a)&&isZero(b);
  const bound=EPS*Math.max(...a.map(Math.abs),...b.map(Math.abs));
  return a.every((v,i)=>Math.abs(v-b[i])<=bound);
}
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const determinant=(a,b,c)=>dot(a,cross(b,c));

function relation(a,b){
  a=vector(a);b=vector(b);
  const u=unit(a),v=unit(b),zero=!u||!v;
  const collinear=zero||length(cross(u,v))<=EPS;
  // Atanasyan §1: the zero vector is conventionally codirected with every vector.
  return {equal:equal(a,b),collinear,codirected:zero||(collinear&&dot(u,v)>0),
    opposed:!zero&&collinear&&dot(u,v)<0,directionDefined:!zero};
}
function sum(values){
  if(!Array.isArray(values))throw new TypeError('Expected an array of vectors');
  let total=[0,0,0];
  for(const value of values)total=add(total,value);
  return total;
}
function directedSegment(id,from,to,label=id){
  if(typeof id!=='string'||!id.trim())throw new TypeError('Expected a vector id');
  if(typeof label!=='string')throw new TypeError('Expected a vector label');
  from=vector(from);to=vector(to);
  const displacement=subtract(to,from);
  return {id,label,from,to,displacement,length:length(displacement),zero:isZero(displacement)};
}
function translate(segment,origin){
  if(!segment||typeof segment!=='object')throw new TypeError('Expected a directed segment');
  const checked=directedSegment(segment.id,segment.from,segment.to,segment.label);
  origin=vector(origin);
  return directedSegment(checked.id,origin,add(origin,checked.displacement),checked.label);
}
function coplanar(a,b,c){
  const u=unit(a),v=unit(b),w=unit(c);
  return !u||!v||!w||Math.abs(determinant(u,v,w))<=EPS;
}
function plane(origin,a,b){
  origin=vector(origin);a=vector(a);b=vector(b);
  if(relation(a,b).collinear)throw new RangeError('A plane requires two noncollinear vectors');
  const normal=unit(cross(unit(a),unit(b)));
  return {origin,a,b,normal};
}
function inPlane(model,value,asPoint=true){
  // Recompute the plane to reject stale or forged normals.
  const p=plane(model?.origin,model?.a,model?.b);
  const displacement=asPoint?subtract(value,p.origin):vector(value);
  const u=unit(displacement);
  return !u||Math.abs(dot(u,p.normal))<=EPS;
}
function basis(values){
  if(!Array.isArray(values)||values.length!==3)throw new TypeError('Expected three basis vectors');
  const checked=Array.from(values,vector);
  if(coplanar(...checked))throw new RangeError('Three noncoplanar vectors are required');
  return checked;
}
function linearCombination(values,coefficients){
  if(!Array.isArray(values)||!Array.isArray(coefficients)||values.length!==coefficients.length)
    throw new TypeError('Each vector requires a coefficient');
  return sum(Array.from(values,(v,i)=>scale(v,coefficients[i])));
}
function decompose(value,values){
  value=vector(value);values=basis(values);
  const sizes=values.map(length),units=values.map(unit),d=determinant(...units);
  const n=length(value);
  if(n===0)return [0,0,0];
  const u=unit(value);
  return result([
    determinant(u,units[1],units[2])/d*(n/sizes[0]),
    determinant(units[0],u,units[2])/d*(n/sizes[1]),
    determinant(units[0],units[1],u)/d*(n/sizes[2])
  ]);
}
function parallelepiped(origin,values){
  origin=vector(origin);const [a,b,c]=basis(values);
  const at=(...v)=>add(origin,sum(v));
  return {points:{O:origin,A:at(a),B:at(b),C:at(c),AB:at(a,b),AC:at(a,c),BC:at(b,c),D:at(a,b,c)},
    basis:[a,b,c],diagonal:sum([a,b,c])};
}

window.KTP_VECTOR_MATH=Object.freeze({EPS,vector,add,subtract,scale,length,isZero,equal,relation,sum,
  directedSegment,translate,coplanar,plane,inPlane,linearCombination,decompose,parallelepiped});
})();
