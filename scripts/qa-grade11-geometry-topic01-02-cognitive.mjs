import fs from 'node:fs';
import vm from 'node:vm';
// P1.2. Independent mathematical and cognitive-difficulty audit of thematic papers.
let checks=0;const assert=(c,m)=>{checks++;if(!c)throw Error(m);};
const ns=s=>[...String(s).matchAll(/-?\d+(?:\.\d+)?/g)].map(x=>Number(x[0]));
const pi=s=>{const m=String(s).match(/(-?\d+)π/);return m?+m[1]:NaN;};
const near=(a,b)=>Math.abs(a-b)<1e-9;
const gcd=(a,b)=>b?gcd(b,a%b):a;
const forms={};
const expected={
 '01':{
 independent:['BODY_SURFACE','CYLINDER_SECTION','CONE_SURFACE','SPHERE_SECTION','CYLINDER_SURFACE','COMPOSITE_SURFACE','ERROR_SPHERE_SECTION'],
 control:['TERMS','CYLINDER_SECTION','CYLINDER_SURFACE','CONE_SURFACE','CONE_PARALLEL_SECTION','FRUSTUM_SURFACE','SPHERE_SECTION','SPHERE_AREA','COMPOSITE_SURFACE','ERROR_FRUSTUM_SLANT']
 },
 '02':{
 independent:['VOLUME_SCALE','PRISM_VOLUME','OBLIQUE_PRISM','PYRAMID_VOLUME','FRUSTUM_VOLUME','COMPOSITE_VOLUME','ERROR_OBLIQUE_HEIGHT'],
 control:['VOLUME_SCALE','PRISM_VOLUME','OBLIQUE_PRISM','PYRAMID_VOLUME','FRUSTUM_VOLUME','SECTION_VOLUME','SIMILAR_SOLIDS','COMPOSITE_VOLUME','INVERSE_VOLUME','ERROR_FRUSTUM_MEAN']
 }
};
const scores={independent:[1,2,2,2,2,2,3],control:{'01':[1,2,2,2,2,2,2,1,3,3],'02':[1,2,2,2,2,2,2,2,2,3]}};
for(const topicId of ['01','02']){
 const source='assessments/11-geometry-atanasyan/'+topicId+'/data.js',ctx=vm.createContext({window:{},Math});
 vm.runInContext(fs.readFileSync(source,'utf8'),ctx,{filename:source});
 const topic=ctx.window.KTP_ASSESSMENT_DATA.topic;
 forms[topicId]=topic;
 for(const kind of ['independent','control']){
  const work=topic[kind],skills=expected[topicId][kind],weights=kind==='independent'?scores.independent:scores.control[topicId];
  assert(work.variants.length===6,topicId+'/'+kind+' six versions');
  assert(work.maxScore===(kind==='independent'?14:20),topicId+'/'+kind+' score');
  let signature=null;
  for(const v of work.variants){
   const label=topicId+'/'+kind+'/'+v.id;
   assert(v.tasks.length===skills.length,label+' length');
   assert(v.tasks.reduce((total,q)=>total+q.points,0)===work.maxScore,label+' total');
   const actual=v.tasks.map(q=>[q.skill,q.points,q.cognitive?.family,q.cognitive?.dok,q.cognitive?.method].join('/')).join(';');
   if(signature!==null)assert(signature===actual,label+' exact cognitive and skill sequence');
   signature=actual;
   v.tasks.forEach((q,i)=>{
    const key=label+'/'+(i+1),need=weights[i];
    assert(q.skill===skills[i],key+' skill');
    assert(q.points===need,key+' points');
    assert(q.cognitive?.steps===need&&q.cognitive?.dok===(need===3?3:need===1?1:2),key+' DOK and operations');
    assert(Array.isArray(q.criteria)&&q.criteria.length===need&&q.criteria.every(x=>x.points===1&&x.text.length>9),key+' separate scoring criteria');
    assert(q.text&&q.answer&&q.solution,key+' full solution');
    assert(!/NaN|Infinity|undefined/.test(q.text+q.answer+q.solution),key+' finite content');
   });
  }
  assert(new Set(work.variants.map(v=>v.tasks.at(-1).text)).size===6,topicId+'/'+kind+' six different justifications');
  assert(new Set(work.variants.map(v=>v.tasks.at(-1).answer)).size===6,topicId+'/'+kind+' six different proof results');
 }
}
for(let v=1;v<=6;v++){
 const t1=forms['01'].independent.variants[v-1].tasks, c1=forms['01'].control.variants[v-1].tasks;
 const t2=forms['02'].independent.variants[v-1].tasks, c2=forms['02'].control.variants[v-1].tasks;
 const exact=(q,expected,label)=>assert(q.answer===expected,label+' expected '+expected+' got '+q.answer);
 function cutCylinder(q,areaOnly,label){
  const [r,h,d]=ns(q.text),a=Math.sqrt(r*r-d*d),width=2*a,S=width*h;
  assert(Number.isSafeInteger(a)&&d<r,label+' exact chord geometry');
  if(areaOnly)exact(q,'S='+S+'.',label);
  else exact(q,'Ширина '+width+'; площадь '+S+'.',label);
 }
 function coneArea(q,label){
  const [r,h]=ns(q.text),l=Math.hypot(r,h);
  assert(Number.isSafeInteger(l),label+' Pythagorean triple');
  exact(q,'l='+l+'; Sбок='+r*l+'π.',label);
 }
 function sphere(q,label){const [r,d]=ns(q.text),rho=Math.sqrt(r*r-d*d);
  assert(Number.isSafeInteger(rho),label+' section radius');
  assert(ns(q.answer)[0]===rho&&pi(q.answer)===rho*rho,label+' radius and area');}
 cutCylinder(t1[1],false,'01 independent cylinder '+v);
 coneArea(t1[2],'01 independent cone '+v);
 sphere(t1[3],'01 independent sphere '+v);
 const [ir,ih]=ns(t1[4].text);assert(pi(t1[4].answer)===2*ir*ih,'01 independent cylinder area '+v);
 const [cr,ch]=ns(t1[5].text);assert(pi(t1[5].answer)===2*cr*ch+3*cr*cr,'01 independent composite '+v);
 const [sr,sd]=ns(t1[6].text),rsect=Math.sqrt(sr*sr-sd*sd);
  assert(Number.isSafeInteger(rsect)&&t1[6].answer.includes('ρ='+rsect+'.'),'01 independent sphere counterexample '+v);
 cutCylinder(c1[1],true,'01 control cylinder '+v);
 coneArea(c1[3],'01 control cone '+v);
 const [pr,ph,pz]=ns(c1[4].text);assert(near(ns(c1[4].answer)[0],pr*(ph-pz)/ph),'01 control cone section '+v);
 const [R,small,H]=ns(c1[5].text),sl=Math.hypot(H,R-small);
 assert(Number.isSafeInteger(sl)&&c1[5].answer.includes('l='+sl+'; Sбок='+(R+small)*sl+'π.'),'01 frustum lateral '+v);
 sphere(c1[6],'01 control sphere '+v);
 const [Rc,rc,hc]=ns(c1[9].text),l=Math.hypot(hc,Rc-rc);
 assert(Number.isSafeInteger(l)&&c1[9].answer.includes('l='+l+'; Sбок='+(Rc+rc)*l+'π.'),'01 control frustum proof '+v);
 function triPrism(q,label){
  const [a,b,h]=ns(q.text);exact(q,(a*b*h/2)+'.',label);
 }
 function oblique(q,label){
  const [S,e,p]=ns(q.text),h=Math.sqrt(e*e-p*p);
  assert(Number.isSafeInteger(h),'oblique Pythagorean length '+label);
  exact(q,S*h+'.',label);
 }
 function trianglePyramid(q,label){
  const [a,b,h]=ns(q.text);exact(q,(a*b*h/6)+'.',label);
 }
 function frustum(q,label){
  const [A,B,h]=ns(q.text),g=Math.sqrt(A*B);
  assert(Number.isSafeInteger(g),label+' exact geometric mean');
  exact(q,h*(A+g+B)/3+'.',label);
 }
 function cavity(q,label){const n=ns(q.text),outer=n[0]*n[1]*n[2],inner=n[3]*n[4]*n[5];
  assert(n.length===6&&outer>inner,label+' valid cavity');
  exact(q,(outer-inner)+'.',label);
 }
 for(const [list,kind] of [[t2,'ind'],[c2,'ctrl']]){
  triPrism(list[1],'02 '+kind+' prism '+v);
  oblique(list[2],'02 '+kind+' oblique '+v);
  trianglePyramid(list[3],'02 '+kind+' pyramid '+v);
  frustum(list[4],'02 '+kind+' frustum '+v);
  cavity(list[kind==='ind'?5:7],'02 '+kind+' cavity '+v);
 }
 const [eS,eEdge,eProj]=ns(t2[6].text),height=Math.sqrt(eEdge*eEdge-eProj*eProj);
 assert(t2[6].answer.includes('h='+height+'; V='+eS*height+'.'),'02 independent oblique proof '+v);
 const [sS,sEdge,sProj]=ns(c2[5].text),sectionHeight=Math.sqrt(sEdge*sEdge-sProj*sProj);
 assert(c2[5].answer==='h='+sectionHeight+'; V='+sS*sectionHeight+'.','02 control section '+v);
 const [A,B]=ns(c2[6].text),x=Math.round(Math.cbrt(A)),y=Math.round(Math.cbrt(B)),g=gcd(x,y);
 assert(x**3===A&&y**3===B,'02 similar cube values '+v);
 exact(c2[6],x/g+':'+y/g+'.','02 control similar '+v);
 const [vol,base]=ns(c2[8].text);exact(c2[8],3*vol/base+'.','02 inverse pyramid '+v);
 const [sA,sB,hp]=ns(c2[9].text),gm=Math.sqrt(sA*sB),correct=hp*(sA+gm+sB)/3;
 assert(Number.isSafeInteger(gm)&&c2[9].answer.includes('√(S₁S₂)='+gm)&&c2[9].answer.includes('V='+correct+'.'),'02 frustum proof '+v);
}
console.log('Grade 11 topic 01–02 parallel cognitive QA passed: '+checks+' checks; 24 examination variants, 204 solved tasks.');
