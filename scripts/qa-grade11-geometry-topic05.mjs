import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';
import {createCoordinateAuditor} from './coordinate-question-audit.mjs';import {grade11GeometryProgress} from './grade11-geometry-progress.mjs';
let checks=0;const check=(v,m)=>{checks++;if(!v)throw Error(m);},near=(a,b,m)=>check(Math.abs(a-b)<1e-8,m),read=p=>fs.readFileSync(p,'utf8');
const ctx={window:{}};ctx.KTP_REGISTER_CONTENT=(key,p)=>{ctx.window.topic=p;};
for(const p of ['geometry/vector-math.js','geometry/coordinate-math.js','geometry/grade11-coordinate-scenes.js','lessons/11-geometry-atanasyan/05/series.js','lessons/11-geometry-atanasyan/05/definitions.js','lessons/11-geometry-atanasyan/05/question-bank.js','lessons/11-geometry-atanasyan/05/scenes.js','lessons/11-geometry-atanasyan/05/data.js','content/11-geometry-atanasyan/05.js','assessments/11-geometry-atanasyan/05/data.js'])vm.runInNewContext(read(p),ctx,{filename:p});
const M=ctx.window.KTP_COORDINATE_MATH,S=ctx.window.KTP_LESSON_SERIES,T=ctx.window.topic,A=ctx.window.KTP_ASSESSMENT_DATA;
const add=(a,b)=>a.map((x,i)=>x+b[i]),scale=(a,k)=>a.map(x=>x*k),sub=(a,b)=>add(a,scale(b,-1)),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),same=(a,b,m)=>a.forEach((x,i)=>near(x,b[i],m));
for(let i=-8;i<=8;i++){
 const p=[i,2*i-1,3-i],q=[i+2,-i,1];same(M.displacement(q,p),sub(q,p),'displacement');same(M.midpoint(p,q),scale(add(p,q),.5),'midpoint');near(M.distance(p,q),Math.hypot(...sub(p,q)),'distance');near(M.dot(p,q),dot(p,q),'dot');
 const plane=M.plane([2,-1,2],-3),foot=M.projectPlane(p,plane);near(dot(foot,[2,-1,2])-3,0,'foot lies in plane');same(sub(p,foot),scale([2,-1,2],(dot(p,[2,-1,2])-3)/9),'normal projection');
 near(Math.abs(M.signedDistance(p,plane)),Math.abs(dot(p,[2,-1,2])-3)/3,'normalized distance');
 for(const k of [-5,-1,.5,4])near(Math.abs(M.signedDistance(p,M.plane(scale([2,-1,2],k),-3*k))),Math.abs(M.signedDistance(p,plane)),'plane equation rescaling');
 for(const transform of [v=>M.central(v,[1,-2,3]),v=>M.axial(v,[1,1,1],[1,2,2]),v=>M.mirror(v,plane),v=>M.translate(v,[2,-1,3])])near(M.distance(transform(p),transform(q)),M.distance(p,q),'motion preserves distances');
 same(M.mirror(M.mirror(p,plane),plane),p,'mirror involution');same(M.axial(M.axial(p,[1,1,1],[1,2,2]),[1,1,1],[1,2,2]),p,'axis involution');
 for(const k of [-3,-1,.5,2])near(M.distance(M.similarity(p,[1,2,3],k),M.similarity(q,[1,2,3],k)),Math.abs(k)*M.distance(p,q),'similarity scale');
}
for(const k of [1e-100,.5,1,1e100]){near(M.angle([k,0,0],[-k,k,0]),135,'obtuse angle stable');near(M.lineAngle([k,0,0],[-k,k,0]),45,'acute line angle');near(M.linePlaneAngle([k,0,k],[0,0,1]),45,'line plane angle');}
for(const fn of [()=>M.angle([0,0,0],[1,0,0]),()=>M.lineAngle([1,0,0],[0,0,0]),()=>M.plane([0,0,0],1),()=>M.sphere([0,0,0],0),()=>M.similarity([1,2,3],[0,0,0],0),()=>M.axial([1,2,3],[0,0,0],[0,0,0]),()=>M.dot([Infinity,0,0],[1,0,0])]){let fail=false;try{fn();}catch{fail=true;}check(fail,'invalid model rejected');}
same(M.axial([2,1,1],[1,1,1],[0,0,1]),[0,1,1],'axis with displaced origin');
same(M.central([2,1,1],[1,2,3]),[0,3,5],'central image');
same(M.mirror([3,1,2],M.plane([2,-1,2],-3)),[3-8/3,1+4/3,2-8/3],'oblique mirror');
for(const [point,expected] of [[[2,0,0],'surface'],[[1,0,0],'inside'],[[3,0,0],'outside']])check(M.spherePosition(point,M.sphere([0,0,0],2))===expected,'sphere position');
const audit=createCoordinateAuditor(check),modes=ctx.window.KTP_G11_COORDINATE_DEFINITIONS.map(d=>d.mode);
for(const mode of modes)for(let v=1;v<=60;v++){const pool=ctx.window.KTP_G11_COORDINATE_QUESTION_POOL(mode,v);check(pool.length===10&&pool[4].errorAnalysis,'bank contract '+mode);pool.forEach((q,i)=>audit(q,mode+'/'+v+'/'+i));}
for(let v=1;v<=60;v++){
 const q=ctx.window.KTP_G11_COORDINATE_QUESTION_POOL('planeDistance',v)[0];
 check(q.answerCore==='2.'&&q.audit.result===2,'exact distance P-to-plane answer for variant '+v);
}
check(S.lessons.length===12&&S.meta.courseLessonStart===45&&S.meta.courseLessonEnd===56,'12 lessons 45–56');
let assessed=0;
for(const [i,L] of S.lessons.entries()){
 check(L.globalNumber===45+i&&L.week===23+Math.floor(i/2),'global lesson/week');check(L.theory.length===3&&L.examples.length===3&&L.practice.length===8,'lesson content');check(L.homework.required.length===6&&L.homework.optional.length===2,'homework 6+2');
 for(const q of [...L.practice,...L.homework.required,...L.homework.optional])audit(q,L.id+'/practice');
 for(const kind of ['independent','control']){const work=L[kind];check(work.variants.length===6,'six lesson variants');for(const v of work.variants){check(v.tasks.reduce((n,t)=>n+t.points,0)===work.maxScore,'point sum');check(v.tasks.some(q=>q.errorAnalysis),'error in variant');for(const q of v.tasks){audit(q,L.id+'/'+kind);assessed++;}}}
}
check(assessed===792,'792 assessed lesson tasks');
for(const [kind,count,max] of [['independent',7,14],['control',10,20]]){const work=A.topic[kind];check(work.variants.length===6&&work.maxScore===max,'thematic work');const signatures=new Set();for(const v of work.variants){check(v.tasks.length===count&&v.tasks.reduce((n,t)=>n+t.points,0)===max,'thematic variant');signatures.add(JSON.stringify(v.tasks.map(t=>t.text)));v.tasks.forEach(q=>{audit(q,kind+'/'+v.id);check(!['sphere','spherePosition','motion','scaleLength'].includes(q.audit.kind),'base thematic excludes extension');});check(v.tasks.at(-1).errorAnalysis,'thematic error');}check(signatures.size===6,'distinct thematic variants');}
check(T.theory.length===12&&T.examples.length===12&&T.diagnostic.length===12,'topic contents');check(Object.keys(S.spatialScenes).length===12,'12 reusable scenes');
for(const scene of Object.values(S.spatialScenes)){check(scene.title&&scene.ariaLabel&&scene.caption,'accessible scene');for(const o of scene.objects)for(const p of o.points||[])check(scene.points[p]?.length===3,'scene point reference');}
for(const route of ['topics/11-geometry-atanasyan/05.html','lessons/11-geometry-atanasyan/05/index.html',...S.lessons.map(l=>'lessons/11-geometry-atanasyan/05/'+l.id+'.html'),'assessments/11-geometry-atanasyan/05/independent.html','assessments/11-geometry-atanasyan/05/control.html','labs/11-geometry-atanasyan/coordinate-space/index.html'])for(const m of read(route).matchAll(/(?:src|href)="([^"]+)"/g))check(fs.existsSync(path.resolve(path.dirname(route),m[1])),'local dependency '+m[1]);
const scenes=S.spatialScenes;
same(sub(scenes['g11-coordinate-46-components'].points.A,scenes['g11-coordinate-46-components'].points.O),sub(scenes['g11-coordinate-46-components'].points.C,scenes['g11-coordinate-46-components'].points.B),'equal vectors in scene');
const midpointScene=scenes['g11-coordinate-47-endpoints'].points;same(midpointScene.J,scale(add(midpointScene.A,midpointScene.B),.5),'scene midpoint');
const sphereScene=scenes['g11-coordinate-49-sphere'];for(const [name,point] of Object.entries(sphereScene.points))if(name.startsWith('s'))near(Math.hypot(...sub(point,sphereScene.math.center)),sphereScene.math.radius,'sphere scene radius');
for(const [id,angle] of [['g11-coordinate-50-angle',135],['g11-coordinate-51-dot',90],['g11-coordinate-56-diagnostic',135]]){const m=scenes[id].math;near(Math.acos(dot(m.a,m.b)/(Math.hypot(...m.a)*Math.hypot(...m.b)))*180/Math.PI,angle,'independent scene angle');}
const blueprint=read('content/11-geometry-atanasyan/05-methodical-plan.md');for(const token of ['24.02.2027–08.04.2027','79*','ФРП-2025','144 варианта / 792','12 вариантов / 102','5/6, 56/68, 5/6','расширение'])check(blueprint.includes(token),'blueprint '+token);
check(S.lessons.filter(l=>l.source.assessment.startsWith('Расширение')).map(l=>l.globalNumber).join(',')==='49,54,55','separate KTP extension lessons');
const progress=grade11GeometryProgress();check(progress.completeSeries>=5&&progress.lessonCount>=56&&progress.assessmentSeries>=5,'current grade 11 metrics');
for(const p of ['README.md','Plan.md'])check(read(p).includes(progress.summary),'current summary '+p);
console.log(`Grade 11 coordinate series QA passed: ${checks} checks, 792 lesson + 102 thematic tasks.`);
