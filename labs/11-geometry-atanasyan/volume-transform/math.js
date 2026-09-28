(function(){
'use strict';
const finite=(value,name)=>{
  const n=Number(value);
  if(!Number.isFinite(n))throw new TypeError((name||'value')+' must be finite');
  return n;
};
const positive=(value,name)=>{
  const n=finite(value,name);
  if(n<=0)throw new RangeError((name||'value')+' must be positive');
  return n;
};
const round=(n,digits=6)=>{
  const p=10**digits;
  return Math.round((n+Number.EPSILON)*p)/p;
};
function prismState({a,b,h,shift=0}){
  a=positive(a,'a');b=positive(b,'b');h=positive(h,'h');shift=finite(shift,'shift');
  const baseArea=a*b;
  return{
    a,b,h,shift,
    baseArea:round(baseArea),
    lateralEdge:round(Math.hypot(h,shift)),
    volume:round(baseArea*h)
  };
}
function pyramidState({a,b,h,shiftX=0,shiftY=0}){
  a=positive(a,'a');b=positive(b,'b');h=positive(h,'h');
  shiftX=finite(shiftX,'shiftX');shiftY=finite(shiftY,'shiftY');
  const baseArea=a*b;
  return{
    a,b,h,shiftX,shiftY,
    baseArea:round(baseArea),
    slantToCenter:round(Math.hypot(h,shiftX,shiftY)),
    volume:round(baseArea*h/3)
  };
}
function similarityState({k,baseLength=1,baseArea=1,baseVolume=1}){
  k=positive(k,'k');baseLength=positive(baseLength,'baseLength');baseArea=positive(baseArea,'baseArea');baseVolume=positive(baseVolume,'baseVolume');
  return{
    k,
    lengthFactor:round(k),
    areaFactor:round(k*k),
    volumeFactor:round(k*k*k),
    length:round(baseLength*k),
    area:round(baseArea*k*k),
    volume:round(baseVolume*k*k*k)
  };
}
window.KTP_VOLUME_LAB_MATH={prismState,pyramidState,similarityState};
})();