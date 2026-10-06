(function(){
'use strict';
const shared=window.KTP_REVOLUTION_MATH;
if(!shared)throw new Error('KTP_REVOLUTION_MATH is required before lab math');

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
const nonNegative=(value,name)=>{
  const n=finite(value,name);
  if(n<0)throw new RangeError((name||'value')+' must be non-negative');
  return n;
};
const round=(value,digits=8)=>{
  const p=10**digits;
  return Math.round((Number(value)+Number.EPSILON)*p)/p;
};

function cylinderConeState({r,h}){
  r=positive(r,'r');h=positive(h,'h');
  const cylinder=shared.metrics({type:'cylinder',radius:r,height:h}).volume;
  const cone=shared.metrics({type:'cone',radius:r,height:h}).volume;
  return{
    r,h,
    baseArea:round(Math.PI*r*r),
    cylinderVolume:round(cylinder),
    coneVolume:round(cone),
    ratio:round(cylinder/cone),
    cylinderPi:round(r*r*h),
    conePi:round(r*r*h/3)
  };
}

function frustumState({R,r,h}){
  R=positive(R,'R');r=nonNegative(r,'r');h=positive(h,'h');
  if(r>R)throw new RangeError('r must satisfy 0 <= r <= R');
  const coefficient=h*(R*R+R*r+r*r)/3;
  const coneCoefficient=R*R*h/3;
  const cylinderCoefficient=R*R*h;
  const state={
    R,r,h,
    volume:round(Math.PI*coefficient),
    volumePi:round(coefficient),
    coneLimitPi:round(coneCoefficient),
    cylinderLimitPi:round(cylinderCoefficient),
    coneMatch:r===0,
    cylinderMatch:r===R
  };
  if(r>0){
    const sharedVolume=shared.metrics({type:'frustum',radius:R,topRadius:r,height:h}).volume;
    state.sharedVolume=round(sharedVolume);
  }
  return state;
}

function sphereSegmentState({R,d}){
  R=positive(R,'R');d=nonNegative(d,'d');
  if(d>R)throw new RangeError('d must satisfy 0 <= d <= R');
  const m=shared.sphereSectionMetrics(R,d);
  const h=R-d;
  const sphere=shared.metrics({type:'ball',radius:R});
  return{
    R,d,
    sectionRadius:round(m.sectionRadius),
    sectionArea:round(m.sectionArea),
    capHeight:round(h),
    segmentVolume:round(m.segmentVolume),
    segmentPi:round(h===0?0:h*h*(R-h/3)),
    sectorVolume:round(m.sectorVolume),
    sphereVolume:round(sphere.volume),
    hemisphereVolume:round(sphere.volume/2),
    isHemisphere:d===0,
    isTangent:d===R
  };
}

function similarityState({k,baseRadius=2,baseHeight=3}){
  k=positive(k,'k');baseRadius=positive(baseRadius,'baseRadius');baseHeight=positive(baseHeight,'baseHeight');
  const factors=shared.similarityFactors(k);
  const base=shared.metrics({type:'cylinder',radius:baseRadius,height:baseHeight});
  const scaled=shared.metrics({type:'cylinder',radius:baseRadius*k,height:baseHeight*k});
  return{
    k,
    baseRadius,baseHeight,
    lengthFactor:round(factors.lengthFactor),
    areaFactor:round(factors.areaFactor),
    volumeFactor:round(factors.volumeFactor),
    baseVolume:round(base.volume),
    scaledVolume:round(scaled.volume),
    measuredVolumeFactor:round(scaled.volume/base.volume)
  };
}

window.KTP_REVOLUTION_VOLUME_LAB_MATH={
  cylinderConeState,
  frustumState,
  sphereSegmentState,
  similarityState
};
})();