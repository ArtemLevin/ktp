(function(){
'use strict';
const V=window.KTP_VECTOR_MATH;
if(!V)throw Error('Vector math is required');
const finite=x=>{if(typeof x!=='number'||!Number.isFinite(x))throw new TypeError('Expected a finite number');return x;};
const result=x=>{if(!Number.isFinite(x))throw new RangeError('Calculation overflow');return x;};
const unit=a=>{a=V.vector(a);const n=V.length(a);if(n===0)throw new RangeError('A nonzero direction is required');return a.map(x=>x/n);};
const dot=(a,b)=>{a=V.vector(a);b=V.vector(b);return result(a.reduce((s,x,i)=>s+x*b[i],0));};
const clamp=x=>Math.max(-1,Math.min(1,x));
function plane(normal,d=0){normal=V.vector(normal);finite(d);const size=V.length(normal);if(size===0)throw new RangeError('A nonzero normal is required');return {normal:normal.map(x=>x/size),d:result(d/size)};}
function checked(p){if(!p||typeof p!=='object')throw new TypeError('Expected a plane');return plane(p.normal,p.d);}
function signedDistance(point,p){p=checked(p);return result(dot(V.vector(point),p.normal)+p.d);}
function projectPlane(point,p){point=V.vector(point);p=checked(p);return V.subtract(point,V.scale(p.normal,signedDistance(point,p)));}
function projectLine(point,origin,direction){point=V.vector(point);origin=V.vector(origin);const u=unit(direction);return V.add(origin,V.scale(u,dot(V.subtract(point,origin),u)));}
function sphere(center,radius){center=V.vector(center);finite(radius);if(radius<=0)throw new RangeError('Positive radius required');return {center,radius};}
function spherePosition(point,s){s=sphere(s.center,s.radius);const distance=V.length(V.subtract(point,s.center)),tolerance=V.EPS*Math.max(distance,s.radius);return Math.abs(distance-s.radius)<=tolerance?'surface':distance<s.radius?'inside':'outside';}
function angle(a,b){return Math.acos(clamp(dot(unit(a),unit(b))))*180/Math.PI;}
function lineAngle(a,b){return Math.acos(Math.abs(clamp(dot(unit(a),unit(b)))))*180/Math.PI;}
function linePlaneAngle(direction,normal){return Math.asin(Math.abs(clamp(dot(unit(direction),unit(normal)))))*180/Math.PI;}
function central(point,center=[0,0,0]){return V.subtract(V.scale(center,2),point);}
function axial(point,origin,direction){return V.subtract(V.scale(projectLine(point,origin,direction),2),point);}
function mirror(point,p){point=V.vector(point);p=checked(p);return V.subtract(point,V.scale(p.normal,2*signedDistance(point,p)));}
function similarity(point,center,k){finite(k);if(k===0)throw new RangeError('A nonzero similarity factor is required');return V.add(center,V.scale(V.subtract(point,center),k));}
window.KTP_COORDINATE_MATH=Object.freeze({dot,plane,signedDistance,projectPlane,projectLine,sphere,spherePosition,angle,lineAngle,linePlaneAngle,
 distance:(a,b)=>V.length(V.subtract(a,b)),midpoint:(a,b)=>V.add(V.scale(a,.5),V.scale(b,.5)),displacement:V.subtract,
 central,axial,mirror,translate:V.add,similarity});
})();
