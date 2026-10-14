import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

let checks=0,count=0;
const check=(value,message)=>{checks++;if(!value)throw Error(message);};
const read=p=>fs.readFileSync(p,'utf8');
const ctx={window:{}};
for(const file of ['js/data.js','geometry/vector-math.js','geometry/grade11-vector-scenes.js',
  'lessons/11-geometry-atanasyan/04/series.js','lessons/11-geometry-atanasyan/04/question-bank.js',
  'lessons/11-geometry-atanasyan/04/scenes.js','lessons/11-geometry-atanasyan/04/data.js'])
  vm.runInNewContext(read(file),ctx,{filename:file});
const S=ctx.window.KTP_LESSON_SERIES,pool=ctx.window.KTP_G11_VECTOR_QUESTION_POOL;
const modes=['directed','equality','addition','difference','chain','scale','solid','coplanar','box','basis','composite','diagnostic'];
check(S.meta.topicIndex===3&&S.meta.courseLessonStart===33&&S.meta.courseLessonEnd===44,'identity and global range');
check(S.lessons.length===12&&Object.keys(S.spatialScenes).length===12,'12 lessons/scenes');

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

for(const mode of modes)for(let variant=1;variant<=15;variant++){
  const bank=pool(mode,variant);check(bank.length===10,mode+' bank size');
  for(const [i,q] of bank.entries())audit(q,mode+'/'+variant+'/'+i);
  check(bank[4].errorAnalysis===true,mode+' embedded reasoning-error question');
}
for(const [i,L] of S.lessons.entries()){
  const id=String(i+1).padStart(2,'0'),global=i+33;
  check(L.id===id&&L.globalNumber===global&&L.mode===modes[i],'lesson numbering and mode '+id);
  check(L.week===Math.floor((global-1)/2)+1,'calendar week '+id);
  check(L.theory.length>=3&&L.examples.length===3&&L.mistakes.length===5&&L.objectives.length>=2,'rich lesson '+id);
  const scene=L.theory[0].spatialFigure;check(S.spatialScenes[scene]?.lesson===global,'correct scene '+id);
  check(L.practice.length===8&&L.homework.required.length===6&&L.homework.optional.length===2,'8 practice and 6+2 homework '+id);
  for(const q of [...L.practice,...L.homework.required,...L.homework.optional])audit(q,id+' practice/homework');
  for(const ex of L.examples){check(ex.problem&&ex.idea&&ex.solution&&ex.check&&ex.answer,'worked example '+id);audit({text:ex.problem,answer:ex.answer,answerCore:ex.answer,skill:'Пример',skillId:'VECTOR_EXAMPLE',solution:ex.solution,audit:ex.audit},id+' example');}
  for(const [kind,n,score] of [['independent',5,10],['control',6,14]]){
    const A=L[kind];check(A.variants.length===6&&A.maxScore===score,id+' '+kind+' contract');
    const texts=new Set();
    for(const V of A.variants){
      check(V.tasks.length===n&&V.tasks.reduce((s,q)=>s+q.points,0)===score,id+' '+kind+' score');
      check(V.tasks.some(q=>q.errorAnalysis),id+' '+kind+' reasoning error');
      for(const q of V.tasks){audit(q,id+' '+kind+'/'+V.id);check(q.criteria.length===2,id+' scoring criteria');
        check(q.criteria.reduce((sum,c)=>sum+Number(c.match(/^\d+/)?.[0]||0),0)===q.points,id+' criteria sum matches points');
        texts.add(q.text);count++;}
    }
    check(texts.size>=n*3,id+' '+kind+' structural diversity');
    const covered=[];for(const row of A.grading)for(let s=row.min;s<=row.max;s++)covered.push(s);
    check(covered.length===score+1&&new Set(covered).size===score+1,id+' nonoverlapping grading covers all scores');
  }
  const file='lessons/11-geometry-atanasyan/04/'+id+'.html',html=read(file);
  check(html.includes('data-lesson="'+id+'"')&&html.includes('data-topic="3"'),id+' route binding');
  for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g))check(fs.existsSync(path.resolve(path.dirname(file),m[1])),id+' dependency '+m[1]);
  check(L.source.assessment.includes('серии 05'),'source guard '+id);
  const teaching=JSON.stringify({theory:L.theory,practice:L.practice.map(q=>q.text),examples:L.examples,homework:[...L.homework.required,...L.homework.optional].map(q=>q.text)}).toLowerCase();
  for(const forbidden of ['координаты вектора','скалярное произведение','уравнение плоскости','детерминант'])check(!teaching.includes(forbidden),'no series05 method '+id);
}
check(count===792,'792 assessed tasks in 144 variants');
for(const mode of ['scale','addition','difference','chain'])check(!pool(mode,1).some(q=>q.answerCore.includes('коэффициенты (')),'no premature three-vector basis in '+mode);
for(const value of [0,-1,1.5,'1',NaN,61]){let thrown=false;try{pool('directed',value);}catch{thrown=true;}check(thrown,'reject invalid variant '+value);}
let thrown=false;try{pool('missing',1);}catch{thrown=true;}check(thrown,'reject unknown mode');
check(read('topics/11-geometry-atanasyan/04.html').includes('lessons/11-geometry-atanasyan/04/topic-link.js'),'topic integration');
console.log(`Grade 11 geometry topic 04 lessons QA passed: ${checks} checks; ${count} assessed tasks in 144 variants.`);
