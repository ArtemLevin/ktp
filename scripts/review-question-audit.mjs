import {createVectorAuditor} from './vector-question-audit.mjs';
import {createCoordinateAuditor} from './coordinate-question-audit.mjs';
export function createReviewAuditor(check){
 const vector=createVectorAuditor(check),coordinate=createCoordinateAuditor(check),near=(a,b)=>Math.abs(a-b)<1e-8;
 const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a)||1;
 const pi=(n,d)=>{const g=gcd(n,d);return d/g===1?n/g+'π':n/g+'π/'+(d/g);};
 const rules={'two-bases':/2πrh\+2πr²/,'section-radius':/ρ²=R²−d²/,'true-height':/перпендикулярна/,'cone-third':/1\/3/,'hidden-interface':/два общих диска/,'scale-powers':/9.*27/,'round-up':/вверх/,'sphere-tangent':/точка.*радиус сечения 0/,'sphere-outside':/Нет.*вне шара/,'equal-length':/a⃗ и −a⃗.*противоположные/,'equal-length-orthogonal':/перпендикулярные векторы.*одинаковую длину/,'equal-volume':/призма и пирамида.*одинаковый объём/i,'skew-lines':/скрещивающимися/,'projection':/не сохраняет.*углы/};
 return function audit(q,label){
  if(q.auditOrigin==='vector')return vector(q,label);
  if(q.auditOrigin==='coordinate')return coordinate(q,label);
  check(q.auditOrigin==='review'&&q.text&&q.answerCore&&q.solution&&q.skill,label+' review fields');const a=q.audit;let expected;
  switch(a.kind){
   case 'cylinderArea':expected=a.full?2*a.r*(a.h+a.r):2*a.r*a.h;break;
   case 'coneArea':expected=a.r*Math.hypot(a.r,a.h)+(a.full?a.r*a.r:0);break;
   case 'sphereArea':expected=4*a.r*a.r;break;
   case 'frustumArea':expected=(a.R+a.r)*Math.hypot(a.h,a.R-a.r)+a.R*a.R+a.r*a.r;break;
   case 'sphereSection':expected=Math.sqrt(a.r*a.r-a.d*a.d);break;
   case 'axialCylinder':expected=2*a.r*a.h;break;
   case 'axialCone':expected=a.r*a.h;break;
   case 'parallelCone':expected=(a.r*a.d/a.h)**2;break;
   case 'prism':expected=a.base*a.height;break;
   case 'pyramid':expected=a.base*a.height/3;break;
   case 'box':expected=a.sides.reduce((n,x)=>n*x,1);break;
   case 'polyFrustum':expected=a.h*(a.A+Math.sqrt(a.A*a.B)+a.B)/3;break;
   case 'round':expected=a.type==='cylinder'?a.r*a.r*a.h:a.type==='cone'?a.r*a.r*a.h/3:a.type==='ball'?4*a.r**3/3:a.h*(a.R*a.R+a.R*a.r+a.r*a.r)/3;break;
   case 'roundPart':{const cap=h=>h*h*(3*a.R-h)/3;expected=a.type==='segment'?cap(a.height):a.type==='sector'?2*a.R*a.R*a.height/3:cap(a.R)-cap(a.R-a.offset);break;}
   case 'cavity':expected=(a.R*a.R-a.r*a.r)*a.h;break;
   case 'joinedVolume':expected=a.r*a.r*a.h+2*a.r**3/3;break;
   case 'joinedArea':expected=2*a.r*a.h+3*a.r*a.r;break;
   case 'joinedCone':expected=a.r*a.r*(a.hc+a.hk/3);break;
   case 'rightTriangle':expected=a.a*a.b/2;break;
   case 'hypotenuse':expected=Math.hypot(a.a,a.b);break;
   case 'similarArea':expected=a.area*a.k*a.k;break;
   case 'trig':expected=a.length*.5;break;
   case 'capacity':expected=a.r*a.r*a.h;break;
   case 'fill':expected=a.r*a.r*a.h*a.fraction;break;
   case 'paint':expected=Math.ceil((2*a.r*(a.h+a.r)*a.reserve/a.coveragePi)-1e-10);break;
   case 'litres':expected=a.litres*1000;break;
   case 'concept':check(rules[a.rule]?.test(q.answerCore),label+' reviewed reasoning '+a.rule);return;
   default:throw Error('Unknown review kind '+a.kind);
  }
  if(a.coefficient!=null){check(near(expected,a.coefficient)&&near(expected,a.numerator/a.denominator),label+' independent pi coefficient');check(q.answerCore===pi(a.numerator,a.denominator)+' '+a.unit+'.',label+' exact fraction and unit');}
  else check(near(expected,a.result)&&q.answerCore===a.result+' '+a.unit+'.',label+' independent numeric answer');
 };
}
