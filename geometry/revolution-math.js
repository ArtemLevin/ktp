(function(global){
'use strict';
const number=(value,name)=>{
  if(typeof value!=='number'||!Number.isFinite(value))throw new RangeError(`${name} must be finite`);
  return value;
};
const positive=(value,name)=>{number(value,name);if(value<=0)throw new RangeError(`${name} must be positive`);return value;};
const vec=(value,name)=>{
  if(!Array.isArray(value)||value.length!==3)throw new TypeError(`${name} must be [x,y,z]`);
  return value.map((n,i)=>number(n,`${name}[${i}]`));
};
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const scale=(a,k)=>a.map(v=>v*k);
const norm=a=>Math.hypot(...a);
const unit=(a,name='direction')=>{const v=vec(a,name),length=norm(v);if(length===0)throw new RangeError(`${name} must be nonzero`);return scale(v,1/length);};
const basis=axis=>{
  const u=unit(axis,'axis');
  const helper=Math.abs(u[2])<.9?[0,0,1]:[1,0,0];
  const e=unit(cross(helper,u));
  return [e,cross(u,e)];
};
function model(raw){
  if(!raw||!['cylinder','cone','frustum','sphere','ball'].includes(raw.type))throw new TypeError('unknown solid type');
  const center=vec(raw.center??[0,0,0],'center');
  const radius=positive(raw.radius,'radius');
  if(raw.type==='sphere'||raw.type==='ball')return{type:raw.type,center,radius};
  const axis=unit(raw.axis??[0,0,1],'axis');
  const height=positive(raw.height,'height');
  if(raw.type==='frustum')return{type:'frustum',center,axis,radius,topRadius:positive(raw.topRadius,'topRadius'),height};
  return{type:raw.type,center,axis,radius,height};
}
function metrics(input){
  const s=model(input),r=s.radius,h=s.height;
  if(s.type==='sphere')return{area:4*Math.PI*r*r};
  if(s.type==='ball')return{surfaceArea:4*Math.PI*r*r,volume:4*Math.PI*r*r*r/3};
  if(s.type==='cylinder')return{lateralArea:2*Math.PI*r*h,totalArea:2*Math.PI*r*(h+r),volume:Math.PI*r*r*h};
  if(s.type==='cone'){
    const slant=Math.hypot(r,h);
    return{slant,lateralArea:Math.PI*r*slant,totalArea:Math.PI*r*(slant+r),volume:Math.PI*r*r*h/3};
  }
  const R=s.topRadius,slant=Math.hypot(R-r,h);
  return{slant,lateralArea:Math.PI*(R+r)*slant,totalArea:Math.PI*((R+r)*slant+R*R+r*r),volume:Math.PI*h*(R*R+R*r+r*r)/3};
}
function circle(center,axis,radius,samples=96){
  const c=vec(center,'center'),[e,f]=basis(axis),r=positive(radius,'radius');
  if(!Number.isInteger(samples)||samples<16||samples>512)throw new RangeError('samples must be an integer in [16,512]');
  return Array.from({length:samples},(_,i)=>{
    const t=2*Math.PI*i/samples;
    return add(c,add(scale(e,r*Math.cos(t)),scale(f,r*Math.sin(t))));
  });
}
function sphereSection(input,normal,offset){
  const s=model(input);
  if(s.type!=='sphere'&&s.type!=='ball')throw new TypeError('sphere section needs a sphere or ball');
  const n=unit(normal,'normal'),d=number(offset,'offset'),r=s.radius;
  if(Math.abs(d)>r+1e-10)return null;
  const distance=Math.max(-r,Math.min(r,d));
  return{center:add(s.center,scale(n,distance)),normal:n,radius:Math.sqrt(Math.max(0,r*r-distance*distance)),tangent:Math.abs(distance)===r};
}
function axialSection(input){
  const s=model(input);
  if(s.type==='sphere'||s.type==='ball')throw new TypeError('sphere has no axial section of this type');
  if(s.type==='cone')return{shape:'triangle',base:2*s.radius,height:s.height,area:s.radius*s.height};
  if(s.type==='cylinder')return{shape:'rectangle',width:2*s.radius,height:s.height,area:2*s.radius*s.height};
  return{shape:'trapezoid',bottomBase:2*s.radius,topBase:2*s.topRadius,height:s.height,area:(s.radius+s.topRadius)*s.height};
}
function parallelSection(input,offset){
  const s=model(input),d=number(offset,'offset');
  if(s.type==='sphere'||s.type==='ball')throw new TypeError('use sphereSection for a sphere or ball');
  if(d<0||d>s.height)throw new RangeError('section outside solid');
  const radius=s.type==='cylinder'?s.radius:s.type==='cone'?s.radius*(1-d/s.height):s.radius+(s.topRadius-s.radius)*d/s.height;
  return{center:add(s.center,scale(s.axis,d)),normal:s.axis,radius,area:Math.PI*radius*radius};
}
global.KTP_REVOLUTION_MATH={model,metrics,circle,sphereSection,axialSection,parallelSection,basis,add,scale,dot,unit};
})(window);
