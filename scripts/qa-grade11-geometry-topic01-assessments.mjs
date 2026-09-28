import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

let checks=0;
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const assert=(condition,message)=>{checks++;if(!condition)throw new Error(message);};
const near=(a,b)=>Math.abs(a-b)<1e-9;
const nums=text=>[...String(text).matchAll(/-?\d+(?:[.,]\d+)?/g)].map(m=>Number(m[0].replace(',','.')));
const coeffPi=text=>{const m=String(text).match(/(-?\d+(?:[.,]\d+)?)π/);return m?Number(m[1].replace(',','.')):NaN;};

const assessment='assessments/11-geometry-atanasyan/01/data.js';
for(const p of [assessment,'assessments/11-geometry-atanasyan/01/independent.html','assessments/11-geometry-atanasyan/01/control.html'])assert(exists(p),'missing '+p);
new vm.Script(read(assessment),{filename:assessment});
const context=vm.createContext({window:{}});
vm.runInContext(read(assessment),context,{filename:assessment});
const A=context.window.KTP_ASSESSMENT_DATA;
assert(A.meta.rowId==='11-geometry-atanasyan'&&A.meta.topic==='01','assessment identity');
assert(A.meta.grade===11&&A.meta.subject==='Геометрия','grade/subject identity');
assert(A.topic.title==='Цилиндр, конус, шар','topic title');
for(const token of ['глава IV','§§1–3','пп. 38–46','ФРП-2025','серии 03','47*–51*'])assert(A.meta.sourceNote.includes(token),'source boundary '+token);

function complete(work,count,max){
 assert(work.variants.length===6,'six variants');
 assert(work.maxScore===max,'max score '+max);
 const signatures=new Set();
 for(const variant of work.variants){
  assert(variant.tasks.length===count,'variant '+variant.id+' task count');
  assert(variant.tasks.reduce((sum,t)=>sum+t.points,0)===max,'variant '+variant.id+' score');
  assert(variant.tasks.every(t=>t.text&&t.answer&&t.solution&&t.skill&&Number.isInteger(t.points)&&t.points>0),'variant '+variant.id+' complete key');
  signatures.add(JSON.stringify(variant.tasks.map(t=>[t.text,t.answer,t.points,t.skill])));
 }
 assert(signatures.size===6,'six distinct variants');
}

complete(A.topic.independent,7,14);
for(const v of A.topic.independent.variants){
 const t=v.tasks;
 assert(t[0].skill==='BODY_SURFACE','independent '+v.id+' body/surface concept skill');
 assert(t[1].skill==='CYLINDER_SECTION','independent '+v.id+' cylinder section skill');
 let n=nums(t[1].text),a=nums(t[1].answer),r=n[0],h=n[1],d=n[2],width=2*Math.sqrt(r*r-d*d);
 assert(Number.isInteger(width)&&near(a[0],width)&&near(a[1],width*h),'independent '+v.id+' cylinder section math');
 assert(t[2].skill==='CONE_SURFACE','independent '+v.id+' cone skill');
 n=nums(t[2].text);a=nums(t[2].answer);r=n[0];h=n[1];const l=Math.sqrt(r*r+h*h);
 assert(near(a[0],l)&&near(coeffPi(t[2].answer),r*l),'independent '+v.id+' cone math');
 assert(t[3].skill==='SPHERE_SECTION','independent '+v.id+' sphere section skill');
 n=nums(t[3].text);a=nums(t[3].answer);r=n[0];d=n[1];const rho=Math.sqrt(r*r-d*d);
 assert(near(a[0],rho)&&near(coeffPi(t[3].answer),rho*rho)&&t[3].answer.includes('кас'),'independent '+v.id+' sphere/tangency math');
 assert(t[4].skill==='CYLINDER_SURFACE','independent '+v.id+' cylinder surface skill');
 n=nums(t[4].text);r=n[0];h=n[1];const lat=2*r*h,full=lat+2*r*r;
 const piMatches=[...t[4].answer.matchAll(/(\d+)π/g)].map(m=>Number(m[1]));
 assert(piMatches[0]===lat&&piMatches[1]===full,'independent '+v.id+' cylinder surface math');
 assert(t[5].skill==='COMPOSITE_SURFACE','independent '+v.id+' composite skill');
 n=nums(t[5].text);r=n[0];h=n[1];
 assert(coeffPi(t[5].answer)===2*r*h+3*r*r,'independent '+v.id+' hemisphere composite math');
 assert(t[6].skill.startsWith('ERROR_')&&t[6].points===3,'independent '+v.id+' error-analysis slot');
}

complete(A.topic.control,10,20);
for(const v of A.topic.control.variants){
 const t=v.tasks;
 assert(t[0].skill==='TERMS'&&t[0].points===1,'control '+v.id+' terminology');
 assert(t[1].skill==='CYLINDER_SECTION','control '+v.id+' cylinder section');
 let n=nums(t[1].text),r=n[0],h=n[1],d=n[2],width=2*Math.sqrt(r*r-d*d);
 assert(near(nums(t[1].answer)[0],width*h),'control '+v.id+' cylinder section math');
 assert(t[2].skill==='CYLINDER_SURFACE','control '+v.id+' cylinder surface');
 n=nums(t[2].text);r=n[0];h=n[1];let p=[...t[2].answer.matchAll(/(\d+)π/g)].map(m=>Number(m[1]));
 assert(p[0]===2*r*h&&p[1]===2*r*h+2*r*r,'control '+v.id+' cylinder surface math');
 assert(t[3].skill==='CONE_SURFACE','control '+v.id+' cone surface');
 n=nums(t[3].text);r=n[0];h=n[1];const l=Math.sqrt(r*r+h*h);
 assert(nums(t[3].answer)[0]===l&&coeffPi(t[3].answer)===r*l,'control '+v.id+' cone math');
 assert(t[4].skill==='CONE_PARALLEL_SECTION','control '+v.id+' cone parallel section');
 n=nums(t[4].text);r=n[0];h=n[1];const z=n[2],expectedRho=r*(h-z)/h;
 assert(near(nums(t[4].answer)[0],expectedRho),'control '+v.id+' cone similarity math');
 assert(t[5].skill==='FRUSTUM_SURFACE','control '+v.id+' frustum');
 n=nums(t[5].text);const R=n[0],rr=n[1],hh=n[2],slant=Math.sqrt(hh*hh+(R-rr)*(R-rr));
 assert(nums(t[5].answer)[0]===slant&&coeffPi(t[5].answer)===(R+rr)*slant,'control '+v.id+' frustum math');
 assert(t[6].skill==='SPHERE_SECTION','control '+v.id+' sphere section');
 n=nums(t[6].text);r=n[0];d=n[1];const rho=Math.sqrt(r*r-d*d);
 assert(nums(t[6].answer)[0]===rho&&coeffPi(t[6].answer)===rho*rho&&t[6].answer.includes('кас'),'control '+v.id+' sphere/tangency math');
 assert(t[7].skill==='SPHERE_AREA'&&t[7].points===1,'control '+v.id+' sphere area');
 const S=coeffPi(t[7].text),rad=nums(t[7].answer)[0];
 assert(S===4*rad*rad,'control '+v.id+' sphere area math');
 assert(t[8].skill==='COMPOSITE_SURFACE'&&t[8].points===3,'control '+v.id+' composite');
 n=nums(t[8].text);r=n[0];h=n[1];const gen=n[2];
 assert(coeffPi(t[8].answer)===2*r*h+r*r+r*gen,'control '+v.id+' composite math');
 assert(t[9].skill.startsWith('ERROR_')&&t[9].points===3,'control '+v.id+' error-analysis slot');
}

const topicSource=read('content/11-geometry-atanasyan/01.js');
for(const token of ["assessments:{enabled:true","independentHref:'../../assessments/11-geometry-atanasyan/01/independent.html'","controlHref:'../../assessments/11-geometry-atanasyan/01/control.html'"])assert(topicSource.includes(token),'topic assessment contract '+token);
assert(read('assessments/topic-links.js').includes("'11-geometry-atanasyan':{min:0,max:1}"),'topic-links grade 11 range');
for(const p of ['independent','control'])assert(read('assessments/11-geometry-atanasyan/01/'+p+'.html').includes('data.js')&&read('assessments/11-geometry-atanasyan/01/'+p+'.html').includes('assessment-page.js'),p+' route wiring');

function countFiles(dir,name){
 let total=0;
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())total+=countFiles(full,name);
  else if(entry.isFile()&&entry.name===name)total++;
 }
 return total;
}
assert(countFiles(path.join(root,'assessments'),'data.js')===83,'aggregate thematic assessment count 83');
console.log('Grade 11 geometry topic 01 thematic assessment/math/structure QA passed: '+checks+' checks.');
