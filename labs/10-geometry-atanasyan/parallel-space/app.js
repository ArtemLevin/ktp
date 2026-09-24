(function(){
'use strict';
const NS='http://www.w3.org/2000/svg',DEG=Math.PI/180;
const $=id=>document.getElementById(id);
const ui={mode:$('mode'),yaw:$('yaw'),pitch:$('pitch'),showPlane:$('showPlane'),reset:$('reset'),yawOut:$('yawOut'),pitchOut:$('pitchOut'),truth:$('truth'),projection:$('projection'),explain:$('explain'),stage:$('stage')};
const models={
 intersect:{
  relation:'Пересекающиеся',
  explain:'Прямые имеют общую точку O и лежат в одной плоскости. При вращении их проекция меняется, общая пространственная точка сохраняется.',
  a:[[-1.55,0,0],[1.55,0,0]],b:[[0,-1.4,0],[0,1.4,0]],point:[0,0,0],
  plane:[[-1.8,-1.5,0],[1.8,-1.5,0],[1.8,1.5,0],[-1.8,1.5,0]]
 },
 parallel:{
  relation:'Параллельные',
  explain:'Направления прямых совпадают, общих точек нет. Эти две прямые лежат в одной плоскости, хотя в некоторых ракурсах расстояние между их изображениями сильно меняется.',
  a:[[-1.55,-.7,0],[1.55,-.7,0]],b:[[-1.55,.65,.8],[1.55,.65,.8]],
  plane:[[-1.75,-.7,0],[1.75,-.7,0],[1.75,.65,.8],[-1.75,.65,.8]]
 },
 skew:{
  relation:'Скрещивающиеся',
  explain:'Прямая a лежит в плоскости α. Прямая b пересекает α в точке M вне a. Это признак скрещивания. Попробуйте найти ракурс, где изображения a и b пересекутся.',
  a:[[-1.55,-.65,0],[1.55,-.65,0]],b:[[.45,.55,-1.35],[.45,.55,1.35]],point:[.45,.55,0],
  plane:[[-1.8,-1.3,0],[1.8,-1.3,0],[1.8,1.3,0],[-1.8,1.3,0]]
 },
 linePlane:{
  relation:'a ∥ α',
  explain:'Прямая a не имеет общих точек с α и параллельна прямой b⊂α. Вращение может визуально приблизить a к плоскости, но истинное отношение не меняется.',
  a:[[-1.45,-.35,.95],[1.45,-.35,.95]],b:[[-1.45,.2,0],[1.45,.2,0]],
  plane:[[-1.8,-1.3,0],[1.8,-1.3,0],[1.8,1.3,0],[-1.8,1.3,0]]
 }
};
const v=(p,q)=>[q[0]-p[0],q[1]-p[1],q[2]-p[2]];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const norm=a=>Math.hypot(...a);
function classifyLines(a,b){
 const da=v(a[0],a[1]),db=v(b[0],b[1]),c=cross(da,db);
 if(norm(c)<1e-8)return'Параллельные';
 const triple=Math.abs(dot(v(a[0],b[0]),c));
 return triple<1e-8?'Пересекающиеся':'Скрещивающиеся';
}
function project(p){
 const yaw=Number(ui.yaw.value)*DEG,pitch=Number(ui.pitch.value)*DEG;
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 const x1=p[0]*cy-p[1]*sy,y1=p[0]*sy+p[1]*cy,z1=p[2];
 const y2=y1*cp-z1*sp,depth=y1*sp+z1*cp;
 return{x:310+92*x1,y:215-92*y2,depth};
}
function el(name,attrs={}){
 const n=document.createElementNS(NS,name);
 for(const [k,val] of Object.entries(attrs))n.setAttribute(k,String(val));
 return n;
}
function line(svg,p,q,cls){
 svg.append(el('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,class:cls}));
}
function segmentIntersection(p1,p2,p3,p4){
 const d=(p1.x-p2.x)*(p3.y-p4.y)-(p1.y-p2.y)*(p3.x-p4.x);
 if(Math.abs(d)<1e-7)return false;
 const t=((p1.x-p3.x)*(p3.y-p4.y)-(p1.y-p3.y)*(p3.x-p4.x))/d;
 const u=-((p1.x-p2.x)*(p1.y-p3.y)-(p1.y-p2.y)*(p1.x-p3.x))/d;
 return t>=0&&t<=1&&u>=0&&u<=1;
}
function render(){
 const m=models[ui.mode.value],svg=ui.stage;
 [...svg.querySelectorAll(':scope > :not(title):not(desc)')].forEach(n=>n.remove());
 const planePts=(m.plane||[]).map(project);
 if(ui.showPlane.checked&&planePts.length){
  svg.append(el('polygon',{points:planePts.map(p=>`${p.x},${p.y}`).join(' '),class:'model-plane'}));
  const c=planePts.reduce((a,p)=>({x:a.x+p.x/planePts.length,y:a.y+p.y/planePts.length}),{x:0,y:0});
  const t=el('text',{x:c.x+8,y:c.y-8,class:'model-plane-label'});t.textContent='α';svg.append(t);
 }
 const pa=m.a.map(project),pb=m.b.map(project);
 line(svg,pa[0],pa[1],'model-line a');
 line(svg,pb[0],pb[1],'model-line b');
 for(const [pts,label,dy] of [[pa,'a',-9],[pb,'b',-9]]){
  const p=pts[1],t=el('text',{x:p.x+8,y:p.y+dy,class:'model-label'});t.textContent=label;svg.append(t);
 }
 if(m.point){
  const p=project(m.point);svg.append(el('circle',{cx:p.x,cy:p.y,r:5,class:'model-point'}));
  const t=el('text',{x:p.x+9,y:p.y-8,class:'model-label'});t.textContent=ui.mode.value==='intersect'?'O':'M';svg.append(t);
 }
 const trueRelation=ui.mode.value==='linePlane'?'a ∥ α':classifyLines(m.a,m.b);
 const crossing=segmentIntersection(pa[0],pa[1],pb[0],pb[1]);
 ui.truth.textContent=trueRelation;
 ui.projection.textContent=crossing?'изображения пересекаются':'изображения не пересекаются';
 ui.explain.textContent=m.explain+(ui.mode.value==='skew'&&crossing?' Сейчас проекция особенно наглядна: изображения пересеклись, а прямые по-прежнему скрещиваются.':'');
 ui.yawOut.textContent=`${Number(ui.yaw.value)}°`.replace('-', '−');
 ui.pitchOut.textContent=`${Number(ui.pitch.value)}°`;
}
for(const x of [ui.mode,ui.yaw,ui.pitch,ui.showPlane])x.addEventListener('input',render);
ui.reset.addEventListener('click',()=>{ui.yaw.value=-35;ui.pitch.value=26;ui.showPlane.checked=true;render();ui.yaw.focus();});
render();
})();