import './qa-grade11-geometry-p13.mjs';
import fs from 'node:fs';
import vm from 'node:vm';

// P1.1: the same scored slot must require the same operations in every variant.
// DOK is an expert-authored design rubric, not a psychometric estimate.
const source='assessments/11-geometry-atanasyan/03/data.js';
const ctx=vm.createContext({window:{},Math});
vm.runInContext(fs.readFileSync(source,'utf8'),ctx,{filename:source});
const topic=ctx.window.KTP_ASSESSMENT_DATA.topic;
let count=0;const ok=(c,m)=>{count++;if(!c)throw Error(m);};
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a)||1;
const pi=(n,d=1)=>{ok(Number.isSafeInteger(n)&&Number.isSafeInteger(d)&&d>0,'safe exact coefficient');const g=gcd(n,d);return d/g===1?n/g+'π.':n/g+'π/'+d/g+'.';};
const noDot=s=>s.slice(0,-1);
const expect=(q,answer,label)=>ok(q.answer===answer,label+' answer expected '+answer+', observed '+q.answer);
const grammar=n=>n+' '+(n%10>=2&&n%10<=4&&!(n%100>=12&&n%100<=14)?'раза':'раз')+'.';
const signature=q=>[q.skill,q.points,q.cognitive?.family,q.cognitive?.dok,q.cognitive?.method].join('|');
const blueprints={
 independent:[
  ['VOLUME_SCALE',1,1,'volume-scaling','apply-cube-rule'],
  ['CYLINDER_VOLUME',2,2,'direct-cylinder-volume','single-formula'],
  ['CONE_SLANT',2,2,'slant-to-cone-volume','pythagoras-then-volume'],
  ['FRUSTUM_VOLUME',2,2,'frustum-volume','frustum-formula'],
  ['SPHERICAL_SECTOR',2,2,'spherical-sector','sector-formula'],
  ['SIMILAR_SOLIDS',2,2,'volume-similarity','cube-root-scale'],
  ['CONE_FACTOR',3,3,'cone-factor-reasoning','identify-correct-justify']
 ],
 control:[
  ['CYLINDER_CONE_RATIO',1,1,'cylinder-cone-ratio','formula-comparison'],
  ['CYLINDER_VOLUME',1,1,'direct-cylinder-volume','single-formula'],
  ['CONE_SLANT',2,2,'slant-to-cone-volume','pythagoras-then-volume'],
  ['FRUSTUM_VOLUME',2,2,'frustum-volume','frustum-formula'],
  ['SPHERE_BALL',2,2,'sphere-area-and-ball-volume','two-formulas'],
  ['SPHERICAL_SEGMENT',2,2,'spherical-segment','segment-formula'],
  ['SPHERICAL_LAYER',3,3,'spherical-layer','two-caps-subtraction'],
  ['SIMILAR_SOLIDS',2,2,'volume-similarity','cube-root-scale'],
  ['COMPOSITE_VOLUME',2,2,'cylinder-with-hemisphere','add-component-volumes'],
  ['CYLINDER_CAVITY_REASONING',3,3,'cylindrical-hole-proof','subtract-compute-bound']
 ]
};
const totals={independent:14,control:20};
for(const kind of Object.keys(blueprints)){
 const work=topic[kind],bp=blueprints[kind];ok(work.maxScore===totals[kind]&&work.variants.length===6,kind+' scored forms');
 const first=work.variants[0].tasks.map(signature);
 for(const form of work.variants){
  const label=kind+'/'+form.id;
  ok(form.tasks.length===bp.length,label+' count');
  ok(form.tasks.reduce((s,q)=>s+q.points,0)===totals[kind],label+' score total');
  ok(JSON.stringify(form.tasks.map(signature))===JSON.stringify(first),label+' identical methods and skill signatures');
  for(const [i,q] of form.tasks.entries()){
   const [skill,points,dok,family,method]=bp[i],name=label+'/'+(i+1);
   ok(q.skill===skill&&q.points===points,name+' expected skill/points');
   ok(q.cognitive?.dok===dok&&q.cognitive.family===family&&q.cognitive.method===method&&q.cognitive.steps===points,name+' cognitive design');
   ok(Array.isArray(q.criteria)&&q.criteria.length===points&&q.criteria.every(c=>c.points===1&&c.text.length>12),name+' explicit stepwise rubric');
   ok(Boolean(q.audit&&q.text&&q.answer&&q.solution),name+' auditable work');
   ok(!/NaN|Infinity|undefined/.test(q.text+' '+q.answer+' '+q.solution),name+' finite text');
  }
 }
}
for(const kind of ['independent','control'])for(const form of topic[kind].variants)for(const [i,q] of form.tasks.entries()){
 const a=q.audit,label=kind+'/'+form.id+'/'+(i+1);
 switch(a.kind){
  case 'scale':expect(q,grammar(a.factor**3),label);break;
  case 'ratio':expect(q,'В 3 раза.',label);break;
  case 'cylinder':expect(q,pi(a.r*a.r*a.h),label);break;
  case 'coneSlant':{
   const h=Math.sqrt(a.l*a.l-a.r*a.r);
   ok(Number.isSafeInteger(h)&&a.h===h,label+' independent height');
   expect(q,'h='+h+'; '+pi(a.r*a.r*h,3),label);break;
  }
  case 'frustum':{
   ok(a.R>a.r&&a.r>0&&a.h>0,label+' geometry');
   expect(q,pi(a.h*(a.R*a.R+a.R*a.r+a.r*a.r),3),label);break;
  }
  case 'sector':ok(a.R>0&&a.h>0&&a.h<=2*a.R,label+' bounds');
   expect(q,pi(2*a.R*a.R*a.h,3),label);break;
  case 'similar':{
   const x=Math.round(Math.cbrt(a.a)),y=Math.round(Math.cbrt(a.b)),g=gcd(x,y);
   ok(x**3===a.a&&y**3===a.b,label+' exact cube ratio');
   expect(q,x/g+':'+y/g+'.',label);break;
  }
  case 'coneError':{
   const value=noDot(pi(a.r*a.r*a.h,3));
   ok(q.text.includes('r='+a.r+', h='+a.h),label+' premise');
   ok(q.answer.includes('Vкон='+value)&&q.answer.includes('1/3')&&q.answer.includes('цилиндра'),label+' corrected result and proof');break;
  }
  case 'sphereBall':expect(q,'S='+noDot(pi(4*a.R*a.R))+'; V='+pi(4*a.R*a.R*a.R,3),label);break;
  case 'segment':ok(a.R>0&&a.h>0&&a.h<=2*a.R,label+' bounds');
   expect(q,pi(a.h*a.h*(3*a.R-a.h),3),label);break;
  case 'layer':{
   ok(a.R>0&&-a.R<a.a&&a.a<a.b&&a.b<a.R,label+' ordered layer');
   // Independent integral identity: integral [a,b] of π(R²-z²).
   const num=3*a.R*a.R*(a.b-a.a)-a.b**3+a.a**3;
   expect(q,pi(num,3),label);break;
  }
  case 'composite':expect(q,pi(3*a.r*a.r*a.h+2*a.r**3,3),label);break;
  case 'cavityError':{
   const initial=a.R*a.R*a.h,remaining=(a.R*a.R-a.r*a.r)*a.h;
   ok(a.R>a.r&&a.r>0&&a.h>0&&remaining>0&&remaining<initial,label+' positivity and strict bounds');
   ok(q.text.includes('R='+a.R)&&q.text.includes('r='+a.r)&&q.text.includes('h='+a.h),label+' premise');
   ok(q.answer.includes(noDot(pi(remaining)))&&q.answer.includes('0<'+noDot(pi(remaining))+'<'+pi(initial))&&q.answer.includes('вычитается'),label+' corrected calculation and proof');
   break;
  }
  default:throw Error('Unexpected '+label+' task kind '+a.kind);
 }
}
const all=[...topic.independent.variants.flatMap(v=>v.tasks),...topic.control.variants.flatMap(v=>v.tasks)];
ok(all.length===102,'102 topic questions');
ok(new Set(topic.independent.variants.map(v=>v.tasks[3].answer)).size===6,'distinct independent frustum answers');
ok(new Set(topic.control.variants.map(v=>v.tasks[6].answer)).size===6,'six distinct layer results');
ok(all.every(t=>!/(интеграл|скалярн|координат[ыа] вектора|уравнение плоскости)/i.test(t.text)),'source boundaries');
console.log('Topic03 cognitive equivalence QA: '+count+' checks, 12 parallel forms, 102 audited questions.');
