export function createVectorAuditor(check){
// Independent arithmetic audit: no production vector functions are used below.
const plus=(a,b)=>a.map((x,i)=>x+b[i]),times=(a,k)=>a.map(x=>x*k),minus=(a,b)=>plus(a,times(b,-1));
const equal=(a,b)=>a.every((x,i)=>Math.abs(x-b[i])<1e-9);
const zero=[0,0,0],axes=[[2,1,0],[.5,3,0],[.5,.5,4]];
const det=(a,b,c)=>a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]);
const fromCoefficients=a=>a.reduce((v,k,i)=>plus(v,times(axes[i],k)),zero);
function model(a){
  const [A,B,C,D]=(a.letters||'ABCD').split(''),p={};
  if(a.model==='box')Object.assign(p,{[A]:zero,[B]:axes[0],[D]:axes[1],[C]:plus(axes[0],axes[1])});
  else if(a.model==='tetra')Object.assign(p,{[A]:zero,[B]:axes[0],[C]:axes[1],[D]:axes[2]});
  else Object.assign(p,{[A]:[1,2,3],[B]:[-3,5,1],[C]:[7,-2,4],[D]:[-1,3,-6]});
  if(a.model==='prism')Object.assign(p,{[A]:zero,[B]:axes[0],[C]:axes[1]});
  if(a.model==='box'||a.model==='prism')for(const name of Object.keys(p))p[name+'₁']=plus(p[name],axes[2]);
  const mid=(x,y)=>times(plus(p[x],p[y]),.5);
  if(a.midpoint){check(!Object.hasOwn(p,a.to),'midpoint name collision');p[a.to]=mid(...a.midpoint);}
  for(const [name,pair] of Object.entries(a.midpoints||{})){check(!Object.hasOwn(p,name),'two midpoint name collision');p[name]=mid(...pair);}
  if(a.division){check(!Object.hasOwn(p,a.to),'division point collision');const [x,y]=a.division.ends;p[a.to]=plus(p[x],times(minus(p[y],p[x]),a.division.t));}
  return p;
}
const value=s=>{s=s.trim().replaceAll('−','-');return s.includes('/')?s.split('/').map(Number).reduce((a,b)=>a/b):Number(s);};
function tuple(text){const m=text.match(/\(([-\d/ .;]+)\)/);check(Boolean(m),'coefficient tuple present '+text);const result=m[1].split(';').map(value);check(result.length===3&&result.every(Number.isFinite),'three finite coefficients');return result;}
function parseExpression(text){
  const first=text.split('.')[0].split(';')[0],result=[0,0,0],fraction=/([+−-]?)(\d+(?:\/\d+)?)?([abc])⃗/g;
  for(const m of first.matchAll(fraction))result['abc'.indexOf(m[3])]+=(m[1]==='−'||m[1]==='-'?-1:1)*(m[2]?value(m[2]):1);
  return result;
}
const rules={
  'zero-direction':/направлен|направления/,'length-nonnegative':/модуль|неотрицатель|Длина/,'reverse':/одинаков|сохраня|направлен/,
  'projection':/условие|геометрическ/,'zero-equality':/нулевые векторы равны/,'displacement-path':/путь|Путь|траектор/,
  'prism-equal':/равны|равен|рёбра|₁/,'equal-length-insufficient':/направлен/,'multiple-collinear':/Да/,
  'opposite-not-equal':/направлен|противополож/,'free-vector':/направлен|длин|Начала/,'transfer-unique':/Один/,
  'zero-codirected':/условност/,'box-equal':/Да/,'prism-opposite':/Нет/,'opposed-sum-length':/разности/,
  'bad-chain':/цепоч|неверно/,'reverse-difference':/противополож/,'equal-difference-zero':/a⃗=b⃗/,
  'difference-orientation':/Проверка|Направление|разност/,'spatial-chain':/пространствен/,'triangle':/треугольника/,
  'negative-scale':/противоположная/,'midpoint-reverse':/−½/,'multiple-unknown':/Нет/,'midpoint':/½|полусумм/,
  'pyramid-directions':/различаются/,'midpoint-segment':/½/,'midpoint-factor':/½/,'two-coplanar':/Да/,
  'collinear-pair':/Да/,'box-basis':/Нет/,'two-basis-condition':/неколлинеар/,'common-origin':/общ|одн/,
  'two-basis-unique':/Одно/,'zero-coplanar':/Да/,'four-points':/четыре/,'oblique-basis':/некомпланар/,
  'degenerate-box':/Нет/,'space-diagonal':/треть|Пропущено/,'zero-basis':/\(0; 0; 0\)/,
  'basis-condition':/некомпланар|коэффициент|Некомпланар/,'basis-unique':/две другие/,
  'plane-zero-coefficient':/равняться 0/,'pairwise-not-basis':/Контрпример/,'combination-coplanar':/линейной комбинацией/
};
function audit(q,label){
  check(Boolean(q.text&&q.answerCore&&q.answer&&q.solution&&q.skill&&q.skillId&&q.audit),label+' complete fields');
  check(!q.skill.startsWith('VECTOR_'),label+' human skill label');
  const a=q.audit;
  if(a.kind==='segment'||a.kind==='zero'){
    const p=model(a),result=a.terms.reduce((sum,[from,to,k])=>{
      check(Boolean(p[from]&&p[to]),label+' point reference '+from+'/'+to);
      return plus(sum,times(minus(p[to],p[from]),k));
    },zero);
    if(a.kind==='zero')check(equal(result,zero)&&q.answerCore==='0⃗.',label+' zero chain');
    else{
      check(equal(result,minus(p[a.result[1]],p[a.result[0]])),label+' segment identity');
      check(q.answerCore===a.result.join('')+'.',label+' answer matches directed endpoints');
    }
  }else if(a.kind==='coefficients'){
    const expected=a.terms.reduce((s,[k,v])=>plus(s,times(v,k)),zero);
    const actual=a.response==='expression'?parseExpression(q.answerCore):tuple(q.answerCore);
    check(equal(actual,expected),label+' independent linear arithmetic '+q.answerCore);
  }else if(a.kind==='geometry-coefficients'){
    const p=model(a),actual=tuple(q.answerCore);
    check(equal(fromCoefficients(actual),minus(p[a.to],p[a.from])),label+' independent oblique geometry '+q.answerCore);
  }else if(a.kind==='scale'){
    check(q.answerCore.startsWith(Math.abs(a.n*a.k)+' см;'),label+' multiplier length');
    check(q.answerCore.includes(a.k>0?'сонаправленность':a.k<0?'противоположная':'нулевой'),label+' multiplier direction');
  }else if(a.kind==='endpoints'){
    check(q.answerCore===`Начало ${a.from}, конец ${a.to}, длина ${a.n} см.`,label+' endpoints');
    check(q.text.includes(a.from+a.to)&&q.text.includes(a.n+' см'),label+' prompt/endpoint consistency');
  }else if(a.kind==='length')check(q.answerCore===a.n+' см.',label+' length');
  else if(a.kind==='difference-length')check(q.answerCore===(a.left-a.right)+' см.',label+' difference of lengths');
  else if(a.kind==='sum-length')check(q.answerCore===(a.left+a.right)+' см.',label+' sum of codirected lengths');
  else if(a.kind==='coplanar-combination'){
    const c=plus(times(axes[0],a.coefficients[0]),times(axes[1],a.coefficients[1]));
    check(Math.abs(det(axes[0],axes[1],c))<1e-9&&q.answerCore==='Да.',label+' coplanarity');
  }else if(a.kind==='logic'){
    check(Boolean(rules[a.rule]),label+' reviewed conceptual rule '+a.rule);
    check(rules[a.rule].test(q.answerCore),label+' conceptual answer '+a.rule);
  }else throw Error('Unknown audit kind '+a.kind);
}

return audit;
}
