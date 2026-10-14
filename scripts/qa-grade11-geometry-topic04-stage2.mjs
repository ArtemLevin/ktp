import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

let checks=0;
const check=(condition,message)=>{checks++;if(!condition)throw Error(message);};
const read=p=>fs.readFileSync(p,'utf8');
const ctx={window:{}};
ctx.KTP_REGISTER_CONTENT=(key,value)=>{ctx.window.KTP_CONTENT??={};ctx.window.KTP_CONTENT[key]=value;};
for(const p of ['geometry/vector-math.js','geometry/grade11-vector-scenes.js','content/11-geometry-atanasyan/04.js'])
  vm.runInNewContext(read(p),ctx,{filename:p});
const T=ctx.window.KTP_CONTENT['11-geometry-atanasyan::3'];
check(T.meta.title==='Векторы в пространстве'&&T.meta.status==='content-ready','topic registration');
check(T.meta.chapter==='Глава VI, §§1–3, пп. 63–70','source boundary');
for(const [key,count] of [['objectives',8],['expectedResults',11],['prerequisites',6],['prerequisiteCheck',5],['map',10],['theory',12],['examples',12],['mistakes',14],['diagnostic',12],['summary',14]])
  check(T[key].length===count,key+' count');
for(const level of ['basic','standard','transfer','challenge'])check(T.practice[level].length===6,level+' six exercises');
check(T.homework.required.length===6&&T.homework.optional.length===2,'homework 6+2');
check(!T.lab.enabled&&!T.assessments.enabled&&!T.lab.href&&!T.assessments.independentHref,'no unfinished routes promoted');
check(T.spatialScenes===ctx.window.KTP_G11_VECTOR_SCENES,'reuse shared scene registry');
const refs=[...T.theory.map(t=>t.html).join('\n').matchAll(/data-spatial-scene="([^"]+)"/g)].map(m=>m[1]);
check(refs.length===12&&new Set(refs).size===12,'twelve distinct scene references');
for(const id of refs)check(Boolean(T.spatialScenes[id]),'scene resolves '+id);
const questions=[...T.prerequisiteCheck,...T.examples,...Object.values(T.practice).flat(),...T.diagnostic,...T.homework.required,...T.homework.optional];
const byId=Object.fromEntries(questions.map(q=>[q.id,q]));
check(questions.length===61&&Object.keys(byId).length===61,'61 uniquely identified questions/examples');
for(const q of questions)check(Boolean(q.id&&(q.task||q.problem)&&q.answer),'complete question '+q.id);
for(const ex of T.examples)for(const key of ['title','problem','idea','solution','check','answer'])check(Boolean(ex[key]),ex.id+' '+key);

// Independent answer audit. This module does not call the production vector API.
const verified=new Set();
const answer=(id,re)=>{check(Boolean(byId[id]),'audit id '+id);check(re.test(byId[id].answer),'answer '+id+': '+byId[id].answer);verified.add(id);};
const add=(...vs)=>[0,1,2].map(i=>vs.reduce((s,v)=>s+v[i],0));
const mul=(v,k)=>v.map(x=>x*k),sub=(a,b)=>add(a,mul(b,-1));
const same=(a,b,label)=>check(a.every((v,i)=>Math.abs(v-b[i])<1e-9),'independent identity '+label);
const v=(points,from,to)=>sub(points[to],points[from]);
const arbitrary={P:[2,-4,1],Q:[-1,3,7],R:[5,2,-3],S:[-2,1,4],T:[1,-2,2],A:[3,1,-1],B:[-1,5,3],C:[4,-2,7],D:[5,6,-3],E:[2,7,9],F:[-4,3,8],G:[8,-2,4],K:[3,4,-8],L:[-2,7,3],M:[1,-5,6],N:[8,9,4],O:[-1,0,2],U:[3,7,-2],V:[7,-3,1],X:[-5,2,9],Y:[3,-7,2],Z:[8,6,-3]};
const segment=(id,terms,result,token)=>{
  same(add(...terms.map(([a,b,k=1])=>mul(v(arbitrary,a,b),k))),v(arbitrary,...result),id);
  answer(id,new RegExp(token));
};
segment('pre-2',[['K','L'],['L','M']],['K','M'],'^KM');
segment('pre-3',[['R','S'],['S','R']],['R','R'],'Нулевому');
segment('ex-2',[['S','U'],['S','V',-1]],['V','U'],'^VU');
segment('ex-3',[['P','Q'],['Q','R'],['R','S'],['S','P'],['P','T']],['P','T'],'^PT');
segment('a-3',[['E','F'],['F','G']],['E','G'],'^EG');
segment('a-4',[['S','T'],['S','R',-1]],['R','T'],'^RT');
segment('b-1',[['A','B'],['B','C'],['C','D'],['D','A'],['A','E']],['A','E'],'^AE');
segment('b-2',[['P','Q'],['R','S'],['R','Q',-1]],['P','S'],'^PS');
segment('diag-4',[['X','Y'],['Y','Z']],['X','Z'],'^XZ');
segment('diag-5',[['O','P'],['O','Q',-1]],['Q','P'],'^QP');
segment('diag-6',[['A','B'],['B','C'],['C','A']],['A','A'],'^0⃗');
segment('hw-2',[['K','M'],['K','N',-1]],['N','M'],'^NM');
segment('hw-3',[['P','Q'],['Q','R'],['R','S'],['S','T'],['P','T',-1]],['P','P'],'^0⃗');
for(const [id,n,k] of [['ex-4',8,-.75],['a-5',10,-.4],['diag-7',12,-2/3],['hw-4',15,-.4]]){
  answer(id,new RegExp('^'+Math.abs(n*k)+' см'));
  if(id!=='diag-7')check(byId[id].answer.includes('противоположное'),'negative direction '+id);
}
const box={A:[0,0,0],B:[2,1,0],D:[.5,3,0],A1:[.5,.5,4]};
box.C=add(box.B,box.D);box.B1=add(box.B,box.A1);box.C1=add(box.C,box.A1);box.D1=add(box.D,box.A1);
same(add(v(box,'B','A'),v(box,'B','C'),v(box,'B','B1')),v(box,'B','D1'),'b-4 oblique box');answer('b-4',/^BD₁/);
same(add(box.B,box.D,box.A1),box.C1,'ex-5/diag-10 diagonal');answer('ex-5',/^KM₁/);answer('diag-10',/^AC₁/);
same(add(mul(box.B,-1),box.D,box.A1),v(box,'B','D1'),'ex-6 decomposition');answer('ex-6',/−a⃗\+b⃗\+c⃗/);
same(add(mul(box.B,-1),mul(box.D,-1),mul(box.A1,-1)),v(box,'C1','A'),'c-2 decomposition');answer('c-2',/−a⃗−b⃗−c⃗/);
same(add(mul(box.B,-1),box.D,mul(box.A1,-1)),v(box,'B1','D'),'hw-5 decomposition');answer('hw-5',/−a⃗\+b⃗−c⃗/);
const prism={P:[-2,1,0],Q:[1,-1,0],R:[2,3,0]},shift=[.7,.3,3];
prism.P1=add(prism.P,shift);prism.Q1=add(prism.Q,shift);prism.R1=add(prism.R,shift);
same(v(prism,'P','P1'),v(prism,'Q','Q1'),'prism equal shifts');
same(add(v(prism,'P','Q'),v(prism,'Q','Q1'),v(prism,'Q1','R1')),v(prism,'P','R1'),'c-1 prism chain');
answer('ex-1',/LL₁ и MM₁/);answer('c-1',/^PR₁/);answer('hw-1',/^EE₁ и FF₁/);answer('diag-8',/^AC₁/);
const coeff={a:[1,0,0],b:[0,1,0],c:[0,0,1]};
same(sub(mul(sub(coeff.a,mul(coeff.b,2)),3),mul(sub(coeff.a,coeff.b),2)),[1,-4,0],'b-3');answer('b-3',/^a⃗−4b⃗/);
same(add(mul(sub(coeff.a,coeff.b),2),mul(coeff.b,3)),[2,1,0],'ex-7');answer('ex-7',/c⃗=2a⃗\+b⃗/);
same(sub(add(mul(sub(coeff.a,coeff.b),2),mul(add(coeff.b,coeff.c),3)),coeff.c),[2,1,2],'ex-11');answer('ex-11',/^\(2; 1; 2\)/);
const midpoint=(a,b)=>mul(add(a,b),.5),A=[2,1,0],B=[.5,3,0],C=[.5,.5,4],O=[0,0,0];
same(sub(midpoint(A,B),C),add(mul(A,.5),mul(B,.5),mul(C,-1)),'ex-8');answer('ex-8',/^½a⃗\+½b⃗−c⃗/);
same(sub(midpoint(A,C),B),add(mul(A,.5),mul(B,-1),mul(C,.5)),'c-3');answer('c-3',/½a⃗−b⃗\+½c⃗/);
same(sub(midpoint(B,C),A),add(mul(A,-1),mul(B,.5),mul(C,.5)),'hw-6');answer('hw-6',/−a⃗\+½b⃗\+½c⃗/);
same(sub(midpoint(arbitrary.P,arbitrary.Z),midpoint(arbitrary.X,arbitrary.Y)),mul(add(v(arbitrary,'X','P'),v(arbitrary,'Y','Z')),.5),'hw-8');answer('hw-8',/^MN=½XP\+½YZ/);
same(add(sub(arbitrary.M,arbitrary.O),sub(arbitrary.N,arbitrary.O)),mul(sub(midpoint(arbitrary.M,arbitrary.N),arbitrary.O),2),'midpoint arbitrary origin');
answer('ex-9',/^ON;/);answer('d-5',/QM\+QN=0⃗/);answer('pre-4',/^EM=½EF/);answer('b-5',/^PM=½PQ; MP=−½PQ/);
same(sub(midpoint(A,B),A),mul(sub(B,A),.5),'midpoint one endpoint');

answer('pre-1',/Начало P.*7 см/);answer('pre-5',/^NM:/);
answer('a-1',/^Начало V, конец U, длина 9 см/);answer('a-2',/нулевой.*0.*без определённого направления/);
answer('diag-1',/^NM/);answer('diag-2',/^Нет;.*сонаправленность/);answer('diag-3',/^0⃗/);
answer('ex-10',/^Данных недостаточно.*сонаправленности/);
same(add([4,0,0],[3,0,0]),[7,0,0],'codirected length');
same(add([4,0,0],[-3,0,0]),[1,0,0],'opposed length counterexample');
same(add(A,B,mul(A,-1),mul(B,-1)),O,'robot closed route');answer('c-4',/^0⃗/);
const det=(a,b,c)=>a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]);
check(det(A,B,C)!==0,'oblique triple is a valid basis');
check(det(A,B,add(mul(A,4),mul(B,-3)))===0,'b-6 coplanarity');answer('b-6',/линейная комбинация/);
check(det(A,B,add(mul(A,-1),mul(B,5)))===0,'diag-9 coplanarity');answer('diag-9',/^Да:/);
check(Math.abs(det(sub(A,C),sub(B,C),sub(midpoint(A,B),C)))<1e-9,'c-5 coplanarity');answer('c-5',/Да: CK=½CA\+½CB/);
answer('a-6',/^Да:/);
// Any two directions span at most a plane; every combination stays there.
for(let i=1;i<=12;i++)check(Math.abs(det(A,B,add(mul(A,i),mul(B,13-i))))<1e-9,'two-vector plane '+i);
check(det([1,0,0],[2,0,0],[0,1,0])===0,'c-6 dependent counterexample coplanar');
check([1,0,0].every((x,i)=>i===0||x===0)&&[2,0,0][1]===0,'first two generate only one direction');
answer('c-6',/Нужна неколлинеарность.*разложения нет/);
answer('d-4',/^Нет.*Например, b⃗=−a⃗/);
same(mul(A,-1),[-2,-1,0],'d-4 counterexample multiplier');
const dependentC=add(A,B);
same(add(mul(A,2),B),add(A,dependentC),'ex-12 nonunique');answer('ex-12',/\(2; 1; 0\) и \(1; 0; 1\)/);
same(add(mul(A,3),mul(B,2)),add(A,mul(dependentC,2)),'d-2 nonunique');answer('d-2',/\(3; 2; 0\) и \(1; 0; 2\)/);
check(det(A,B,sub(mul(A,2),B))===0,'hw-7 dependent c');answer('hw-7',/\(2; −1; 0\) и \(0; 0; 1\)/);
check(det(add(A,B),add(B,C),add(C,A))===2*det(A,B,C),'d-3 transformed triple remains independent');
answer('d-3',/^Нет.*λ=μ=ν=0/);
answer('d-6',/^Нет:.*компланарность/);
check(det(A,B,mul(add(A,B),-1))===0,'zero sum forces coplanarity');
answer('d-1',/^x=2,y=−1,z=3/);same([2-2,-1+1,3-3],O,'zero decomposition coefficients');
answer('diag-11',/^\(½; −2; 0\)/);answer('diag-12',/^Некомпланарность/);
check(verified.size===61,'independent audit covers every item; missing '+questions.filter(q=>!verified.has(q.id)).map(q=>q.id));

const studentText=JSON.stringify({theory:T.theory,examples:T.examples,practice:T.practice,diagnostic:T.diagnostic,homework:T.homework});
for(const forbidden of ['скалярное произведение','координаты вектора','детерминант','уравнение плоскости','векторное произведение','projectPoint','[x,y,z]'])
  check(!studentText.toLowerCase().includes(forbidden.toLowerCase()),'series 05/internal method not taught: '+forbidden);
check(T.source.assessment.includes('серии 05'),'explicit next-series boundary');
const route=read('topics/11-geometry-atanasyan/04.html');
check(route.includes('data-row="11-geometry-atanasyan"')&&route.includes('data-topic="3"'),'row/topic identity');
const scripts=[...route.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
for(const p of [...scripts,...[...route.matchAll(/<link[^>]+href="([^"]+)"/g)].map(m=>m[1])])
  check(fs.existsSync(path.resolve('topics/11-geometry-atanasyan',p)),'local dependency resolves '+p);
for(const [first,last] of [['vector-math.js','grade11-vector-scenes.js'],['grade11-vector-scenes.js','content/11-geometry-atanasyan/04.js'],['content/11-geometry-atanasyan/04.js','../topic-page.js'],['../topic-page.js','spatial-scene.js']])
  check(route.indexOf(first)<route.indexOf(last),'load order '+first+' before '+last);
const review=read('content/11-geometry-atanasyan/04-methodical-review.md');
for(const token of ['Саакян','Зив','Глазков','пп. 63–70','С-19–С-22','79–95','2015','2009','2010'])check(review.includes(token),'methodical evidence '+token);
for(const p of ['README.md','Plan.md']){
  const doc=read(p);
  check(doc.includes('3/6, 32/68, 3/6'),'partial-series counts '+p);
  check(doc.includes('04-methodical-review.md')&&doc.includes('Этапы 0–2'),'current stage and methodical review '+p);
}
console.log(`Grade 11 geometry topic 04 stage 2 QA passed: ${checks} checks, 61 answer audits, 12 scenes.`);
