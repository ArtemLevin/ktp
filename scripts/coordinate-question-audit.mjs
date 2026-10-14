export function createCoordinateAuditor(check){
 const tuple=v=>'('+v.map(x=>String(Object.is(x,-0)?0:x)).join('; ')+').',plus=(a,b)=>a.map((x,i)=>x+b[i]),times=(a,k)=>a.map(x=>x*k),minus=(a,b)=>plus(a,times(b,-1)),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),length=a=>Math.hypot(...a);
 const equal=(a,b)=>a.every((x,i)=>Math.abs(x-b[i])<1e-8),near=(a,b)=>Math.abs(a-b)<1e-8;
 const logic={ 'axis-condition':/y=0.*z=0/,'orthonormal':/ортонормирован/,'endpoint-order':/B−A/,'distance-squares':/суммы квадратов/,'radius-square':/квадрат/,'zero-angle':/не определён/,'nonzero-orthogonal':/ненулев/,'complement':/60°/,'normalization':/длину нормали/,'axis-mirror':/знаки x и y/,'similarity-distance':/2 раза/,'line-acute':/45°/,'axis-z':/x=0 и y=0/,'free-vector':/сохраняются/,'endpoint-recovery':/B=A\+AB/,'projection':/камеры/,'ball-sphere':/CP≤R.*CP=R/,'positive-radius':/положительн/,'vector-range':/0°.*180°/,'dot-sign':/тупом.*отрицательн/,'plane-angle':/cos.*нормали ненулевые/,'point-plane-zero':/принадлежит/,'involution':/Два раза/,'inverse-transfer':/−b⃗/,'scale-powers':/4.*8/,'angle-check':/Ненулевые/ };
 return function audit(q,label){
  check(Boolean(q.text&&q.answerCore&&q.answer&&q.skill&&q.solution&&q.audit),label+' fields');
  const a=q.audit;let expected;
  if(a.kind==='operation')expected=a.op==='add'?plus(a.a,a.b):a.op==='subtract'?minus(a.a,a.b):times(a.a,a.coef);
  else if(a.kind==='midpoint')expected=times(plus(a.a,a.b),.5);
  else if(a.kind==='coordinateProjection')expected=a.point.map((v,i)=>a.axis==='xy'?(i===2?0:v):a.axis==='yz'?(i===0?0:v):a.axis==='xz'?(i===1?0:v):(i===Number(a.axis)?v:0));
  else if(a.kind==='planeFoot'){const factor=(dot(a.point,a.normal)+a.d)/dot(a.normal,a.normal);expected=minus(a.point,times(a.normal,factor));check(near(dot(expected,a.normal)+a.d,0),label+' foot in plane');}
  else if(a.kind==='motion'){
   const p=a.point;
   expected=a.type==='central'?minus(times(a.center,2),p):a.type==='axis'?[-p[0],-p[1],p[2]]:a.type==='mirror'?[p[0],p[1],2*a.planeZ-p[2]]:a.type==='translate'?plus(p,a.shift):plus(a.center,times(minus(p,a.center),a.k));
  }
  if(expected){check(equal(a.result,expected),label+' independent vector result');check(q.answerCore===tuple(expected),label+' vector answer');return;}
  if(a.kind==='length'){const v=minus(a.b,a.a),n=dot(v,v),r=Math.sqrt(n),answer=(Number.isInteger(r)?r:'√'+n)+'.';check(n===a.squared&&q.answerCore===answer,label+' independent squared length');}
  else if(a.kind==='dot')check(a.result===dot(a.a,a.b)&&q.answerCore===a.result+'.',label+' independent dot');
  else if(a.kind==='component')check(a.result===a.point[a.index]&&q.answerCore===a.result+'.',label+' component');
  else if(a.kind==='scaleLength')check(a.result===Math.abs(a.k)*a.length&&q.answerCore===a.result+'.',label+' length scale');
  else if(a.kind==='planeDistance'){expected=Math.abs(dot(a.point,a.normal)+a.d)/length(a.normal);check(near(expected,a.result)&&q.answerCore===a.result+'.',label+' normalized distance');}
  else if(a.kind==='angle'){const raw=dot(a.a,a.b)/(length(a.a)*length(a.b)),ratio=Math.abs(Math.abs(raw)-1)<1e-12?Math.sign(raw):Math.max(-1,Math.min(1,raw)),deg=a.type==='plane'?Math.asin(Math.abs(ratio))*180/Math.PI:Math.acos((a.type==='line'||a.type==='planes')?Math.abs(ratio):ratio)*180/Math.PI;check(near(deg,a.result)&&q.answerCore===a.result+'°.',label+' independent angle');}
  else if(a.kind==='sphere'){const [x,y,z]=a.center;check(q.text.includes(''+a.radius)||q.text.includes(''+a.radius*a.radius),label+' sphere prompt radius');check(q.answerCore.includes(''+a.radius*a.radius)||q.answerCore.includes('R='+a.radius),label+' sphere answer radius');check(x>0&&y===1&&z===-1,label+' sphere model');const expected=q.answerCore.includes('R=')?'C('+x+'; 1; -1), R='+a.radius+'.':'(x−'+x+')²+(y−1)²+(z+1)²='+a.radius*a.radius+'.';check(q.answerCore===expected,label+' exact sphere center/radius');}
  else if(a.kind==='spherePosition')check(near(length(minus(a.point,a.center)),a.radius)&&a.result==='surface'&&q.answerCore==='На сфере.',label+' independent sphere membership');
  else if(a.kind==='logic')check(logic[a.rule]?.test(q.answerCore),label+' reviewed conceptual rule '+a.rule);
  else throw Error('Unknown coordinate audit '+a.kind);
 };
}
