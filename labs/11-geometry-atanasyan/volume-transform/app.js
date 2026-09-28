(function(){
'use strict';
const M=window.KTP_VOLUME_LAB_MATH;
if(!M)throw new Error('volume lab math core required');

const NS='http://www.w3.org/2000/svg',DEG=Math.PI/180;
const $=id=>document.getElementById(id);
const ui={
  buttons:[...document.querySelectorAll('[data-mode-button]')],
  controlTitle:$('controlTitle'),stage:$('stage'),formula:$('formula'),observation:$('observation'),
  m1Label:$('m1Label'),m2Label:$('m2Label'),m3Label:$('m3Label'),m4Label:$('m4Label'),
  m1:$('m1'),m2:$('m2'),m3:$('m3'),m4:$('m4'),
  prismA:$('prismA'),prismB:$('prismB'),prismH:$('prismH'),prismShift:$('prismShift'),
  prismAOut:$('prismAOut'),prismBOut:$('prismBOut'),prismHOut:$('prismHOut'),prismShiftOut:$('prismShiftOut'),
  pyrA:$('pyrA'),pyrB:$('pyrB'),pyrH:$('pyrH'),pyrX:$('pyrX'),pyrY:$('pyrY'),
  pyrAOut:$('pyrAOut'),pyrBOut:$('pyrBOut'),pyrHOut:$('pyrHOut'),pyrXOut:$('pyrXOut'),pyrYOut:$('pyrYOut'),
  k:$('k'),kOut:$('kOut'),yaw:$('yaw'),pitch:$('pitch'),yawOut:$('yawOut'),pitchOut:$('pitchOut'),
  showHeight:$('showHeight'),showFormula:$('showFormula'),
  prismStraight:$('prismStraight'),prismTilt:$('prismTilt'),pyrCenter:$('pyrCenter'),pyrMove:$('pyrMove')
};
let mode='prism';

const fmt=n=>{
  const value=Math.abs(Number(n))<1e-10?0:Number(n);
  return Number.isInteger(value)?String(value):value.toFixed(2).replace(/0+$/,'').replace(/\.$/,'').replace('.',',');
};
const svgEl=(name,attrs={})=>{
  const node=document.createElementNS(NS,name);
  for(const [k,v]of Object.entries(attrs))node.setAttribute(k,String(v));
  return node;
};
const sub=(a,b)=>a.map((x,i)=>x-b[i]);

function project(p){
  const yaw=Number(ui.yaw.value)*DEG,pitch=Number(ui.pitch.value)*DEG;
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  const x1=p[0]*cy-p[1]*sy,y1=p[0]*sy+p[1]*cy,z1=p[2];
  const y2=y1*cp-z1*sp,depth=y1*sp+z1*cp;
  return{x:360+48*x1,y:265-48*y2,depth};
}
function clearStage(){
  [...ui.stage.querySelectorAll(':scope > :not(title):not(desc)')].forEach(n=>n.remove());
}
function line(a,b,cls='edge'){
  const pa=project(a),pb=project(b);
  ui.stage.append(svgEl('line',{x1:pa.x,y1:pa.y,x2:pb.x,y2:pb.y,class:cls}));
}
function polygon(points,cls='face'){
  const pp=points.map(project);
  ui.stage.append(svgEl('polygon',{points:pp.map(p=>p.x+','+p.y).join(' '),class:cls}));
}
function point(p,label,cls='point',dx=7,dy=-7){
  const q=project(p);
  ui.stage.append(svgEl('circle',{cx:q.x,cy:q.y,r:4.5,class:cls}));
  if(label){
    const t=svgEl('text',{x:q.x+dx,y:q.y+dy,class:'label '+(cls==='foot'?'height-label':'')});
    t.textContent=label;ui.stage.append(t);
  }
}
function drawBox(points,{heightSegment=null,emphasis=false}={}){
  const {A,B,C,D,A1,B1,C1,D1}=points;
  polygon([A1,B1,C1,D1],emphasis?'face emphasis':'face');
  polygon([A,B,C,D],'face');
  for(const [p,q,hidden] of [[A,B],[B,C],[C,D,true],[D,A,true],[A1,B1],[B1,C1],[C1,D1],[D1,A1],[A,A1],[B,B1],[C,C1],[D,D1,true]])line(p,q,'edge'+(hidden?' hidden':''));
  if(heightSegment&&ui.showHeight.checked){
    line(heightSegment[0],heightSegment[1],'height');
    point(heightSegment[1],'H','foot');
  }
}
function prismPoints(s){
  const x=s.a/2,y=s.b/2,d=s.shift;
  return{
    A:[-x,-y,0],B:[x,-y,0],C:[x,y,0],D:[-x,y,0],
    A1:[-x+d,-y,s.h],B1:[x+d,-y,s.h],C1:[x+d,y,s.h],D1:[-x+d,y,s.h],
    H:[-x+d,-y,0]
  };
}
function pyramidPoints(s){
  const x=s.a/2,y=s.b/2;
  return{
    A:[-x,-y,0],B:[x,-y,0],C:[x,y,0],D:[-x,y,0],
    S:[s.shiftX,s.shiftY,s.h],O:[s.shiftX,s.shiftY,0]
  };
}
function drawPyramid(p){
  polygon([p.A,p.B,p.C,p.D],'face');
  line(p.A,p.B);line(p.B,p.C);line(p.C,p.D,'edge hidden');line(p.D,p.A,'edge hidden');
  line(p.S,p.A);line(p.S,p.B);line(p.S,p.C);line(p.S,p.D);
  if(ui.showHeight.checked){line(p.S,p.O,'height');point(p.O,'H','foot');}
  point(p.S,'S');
}
function translatedBox(scale,offsetX,emphasis){
  const a=1.3*scale,b=.9*scale,h=1.15*scale,x=a/2,y=b/2;
  return{
    A:[offsetX-x,-y,0],B:[offsetX+x,-y,0],C:[offsetX+x,y,0],D:[offsetX-x,y,0],
    A1:[offsetX-x,-y,h],B1:[offsetX+x,-y,h],C1:[offsetX+x,y,h],D1:[offsetX-x,y,h],
    H:[offsetX-x,-y,0],emphasis
  };
}
function drawSimilarity(k){
  const left=translatedBox(1,-2.35,false),right=translatedBox(k,1.55,true);
  drawBox(left);
  drawBox(right,{emphasis:true});
  point(left.A1,'1×');point(right.A1,fmt(k)+'×');
}
function metric(label1,v1,label2,v2,label3,v3,label4,v4){
  ui.m1Label.textContent=label1;ui.m1.textContent=v1;
  ui.m2Label.textContent=label2;ui.m2.textContent=v2;
  ui.m3Label.textContent=label3;ui.m3.textContent=v3;
  ui.m4Label.textContent=label4;ui.m4.textContent=v4;
}
function setFormula(text){ui.formula.textContent=text;ui.formula.hidden=!ui.showFormula.checked;}
function setObservation(text){ui.observation.textContent=text;}

function renderPrism(){
  const s=M.prismState({a:ui.prismA.value,b:ui.prismB.value,h:ui.prismH.value,shift:ui.prismShift.value});
  ui.prismAOut.textContent=fmt(s.a);ui.prismBOut.textContent=fmt(s.b);ui.prismHOut.textContent=fmt(s.h);ui.prismShiftOut.textContent=fmt(s.shift);
  clearStage();
  const p=prismPoints(s);drawBox(p,{heightSegment:[p.A1,p.H],emphasis:Math.abs(s.shift)>.01});
  metric('S основания',fmt(s.baseArea),'Высота h',fmt(s.h),'Боковое ребро',fmt(s.lateralEdge),'Объём V',fmt(s.volume));
  setFormula('V = Sосн·h = '+fmt(s.baseArea)+'·'+fmt(s.h)+' = '+fmt(s.volume)+'. Сдвиг '+fmt(s.shift)+' в формулу не входит.');
  setObservation(Math.abs(s.shift)<.01?'Призма прямая: боковое ребро совпадает с высотой.':'Призма наклонена: боковое ребро стало '+fmt(s.lateralEdge)+', но h='+fmt(s.h)+' и объём '+fmt(s.volume)+' сохранились.');
  ui.stage.dataset.mode='prism';ui.stage.setAttribute('aria-label','Призма со сдвигом верхнего основания; объём '+fmt(s.volume));
  window.KTP_VOLUME_LAB_CURRENT=s;
}
function renderPyramid(){
  const s=M.pyramidState({a:ui.pyrA.value,b:ui.pyrB.value,h:ui.pyrH.value,shiftX:ui.pyrX.value,shiftY:ui.pyrY.value});
  ui.pyrAOut.textContent=fmt(s.a);ui.pyrBOut.textContent=fmt(s.b);ui.pyrHOut.textContent=fmt(s.h);ui.pyrXOut.textContent=fmt(s.shiftX);ui.pyrYOut.textContent=fmt(s.shiftY);
  clearStage();drawPyramid(pyramidPoints(s));
  metric('S основания',fmt(s.baseArea),'Высота h',fmt(s.h),'S–центр',fmt(s.slantToCenter),'Объём V',fmt(s.volume));
  setFormula('V = ⅓Sосн·h = ⅓·'+fmt(s.baseArea)+'·'+fmt(s.h)+' = '+fmt(s.volume)+'. Горизонтальное положение вершины в формулу не входит.');
  setObservation((Math.abs(s.shiftX)+Math.abs(s.shiftY))<.01?'Вершина находится над центром основания.':'Вершина смещена: наклонные отрезки меняются, а перпендикулярная высота и объём сохраняются.');
  ui.stage.dataset.mode='pyramid';ui.stage.setAttribute('aria-label','Пирамида со смещаемой вершиной; объём '+fmt(s.volume));
  window.KTP_VOLUME_LAB_CURRENT=s;
}
function renderSimilarity(){
  const baseVolume=1.3*.9*1.15,s=M.similarityState({k:ui.k.value,baseLength:1,baseArea:1.3*.9,baseVolume});
  ui.kOut.textContent=fmt(s.k);
  clearStage();drawSimilarity(s.k);
  metric('k',fmt(s.lengthFactor),'k²',fmt(s.areaFactor),'k³',fmt(s.volumeFactor),'V₂',fmt(s.volume));
  setFormula('Длины ×'+fmt(s.lengthFactor)+', площади ×'+fmt(s.areaFactor)+', объёмы ×'+fmt(s.volumeFactor)+'. V₂/V₁ = k³.');
  setObservation(s.k===1?'При k=1 тела равны по масштабу.':'Третья степень появляется потому, что масштабируются три независимых линейных направления.');
  ui.stage.dataset.mode='similarity';ui.stage.setAttribute('aria-label','Два подобных параллелепипеда с коэффициентом '+fmt(s.k));
  window.KTP_VOLUME_LAB_CURRENT=s;
}
function render(){
  ui.yawOut.textContent=String(Number(ui.yaw.value)).replace('-','−')+'°';
  ui.pitchOut.textContent=String(Number(ui.pitch.value))+'°';
  if(mode==='prism')renderPrism();
  else if(mode==='pyramid')renderPyramid();
  else renderSimilarity();
}
function setMode(next){
  mode=next;
  for(const b of ui.buttons)b.setAttribute('aria-pressed',String(b.dataset.modeButton===mode));
  document.querySelectorAll('[data-controls]').forEach(el=>el.hidden=el.dataset.controls!==mode);
  ui.controlTitle.textContent=mode==='prism'?'Призма':mode==='pyramid'?'Пирамида':'Подобные тела';
  render();
}
ui.buttons.forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.modeButton)));
for(const id of ['prismA','prismB','prismH','prismShift','pyrA','pyrB','pyrH','pyrX','pyrY','k','yaw','pitch']){
  ui[id].addEventListener('input',render);
}
ui.showHeight.addEventListener('input',render);
ui.showFormula.addEventListener('input',render);
ui.prismStraight.addEventListener('click',()=>{ui.prismShift.value=0;render();ui.prismShift.focus();});
ui.prismTilt.addEventListener('click',()=>{ui.prismShift.value=2.5;render();ui.prismShift.focus();});
ui.pyrCenter.addEventListener('click',()=>{ui.pyrX.value=0;ui.pyrY.value=0;render();ui.pyrX.focus();});
ui.pyrMove.addEventListener('click',()=>{ui.pyrX.value=2;ui.pyrY.value=1;render();ui.pyrX.focus();});
document.querySelectorAll('[data-k]').forEach(b=>b.addEventListener('click',()=>{ui.k.value=b.dataset.k;render();ui.k.focus();}));

setMode('prism');
})();