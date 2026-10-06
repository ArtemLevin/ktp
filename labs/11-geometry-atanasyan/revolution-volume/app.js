(function(){
'use strict';
const M=window.KTP_REVOLUTION_VOLUME_LAB_MATH;
if(!M)throw new Error('revolution volume lab math core required');

const NS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id);
const ui={
  buttons:[...document.querySelectorAll('[data-mode-button]')],
  controlTitle:$('controlTitle'),
  stage:$('stage'),stageTitle:$('stageTitle'),stageDesc:$('stageDesc'),
  formula:$('formula'),observation:$('observation'),
  m1Label:$('m1Label'),m2Label:$('m2Label'),m3Label:$('m3Label'),m4Label:$('m4Label'),
  m1:$('m1'),m2:$('m2'),m3:$('m3'),m4:$('m4'),
  ccR:$('ccR'),ccH:$('ccH'),ccROut:$('ccROut'),ccHOut:$('ccHOut'),
  frR:$('frR'),frr:$('frr'),frH:$('frH'),frROut:$('frROut'),frrOut:$('frrOut'),frHOut:$('frHOut'),
  spR:$('spR'),spD:$('spD'),spROut:$('spROut'),spDOut:$('spDOut'),
  scaleK:$('scaleK'),scaleKOut:$('scaleKOut'),
  ccClassic:$('ccClassic'),ccDoubleR:$('ccDoubleR'),
  frCone:$('frCone'),frCylinder:$('frCylinder'),
  spHalf:$('spHalf'),spTangent:$('spTangent')
};
let mode='cylinder-cone';

const fmt=value=>{
  const n=Math.abs(Number(value))<1e-10?0:Number(value);
  if(Number.isInteger(n))return String(n);
  return n.toFixed(3).replace(/0+$/,'').replace(/\.$/,'').replace('.',',');
};
const piText=coefficient=>{
  const c=Number(coefficient);
  if(Math.abs(c)<1e-10)return'0';
  if(Math.abs(c-1)<1e-10)return'π';
  return fmt(c)+'π';
};
const el=(name,attrs={})=>{
  const node=document.createElementNS(NS,name);
  for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));
  return node;
};
function clearStage(){
  [...ui.stage.querySelectorAll(':scope > :not(title):not(desc)')].forEach(node=>node.remove());
}
function line(x1,y1,x2,y2,cls='outline'){
  ui.stage.append(el('line',{x1,y1,x2,y2,class:cls}));
}
function ellipse(cx,cy,rx,ry,cls='outline'){
  ui.stage.append(el('ellipse',{cx,cy,rx,ry,class:cls}));
}
function circle(cx,cy,r,cls='outline'){
  ui.stage.append(el('circle',{cx,cy,r,class:cls}));
}
function path(d,cls='outline'){
  ui.stage.append(el('path',{d,class:cls}));
}
function label(x,y,text,cls='label',anchor='middle'){
  const t=el('text',{x,y,class:cls,'text-anchor':anchor});
  t.textContent=text;ui.stage.append(t);
}
function dot(x,y,cls='focus'){
  ui.stage.append(el('circle',{cx:x,cy:y,r:5,class:cls}));
}
function metrics(a,b,c,d){
  for(const [i,item] of [a,b,c,d].entries()){
    ui['m'+(i+1)+'Label'].textContent=item[0];
    ui['m'+(i+1)].textContent=item[1];
  }
}
function cylinderShape(cx,baseY,r,h,scale,labelText,cls='fill'){
  const rx=r*scale,ry=Math.max(8,rx*.26),height=h*scale,topY=baseY-height;
  ellipse(cx,baseY,rx,ry,cls);
  ellipse(cx,topY,rx,ry,cls);
  line(cx-rx,topY,cx-rx,baseY,'outline');
  line(cx+rx,topY,cx+rx,baseY,'outline');
  label(cx,baseY+ry+28,labelText);
  line(cx,baseY,cx+rx,baseY,'helper');
  label(cx+rx*.55,baseY-8,'r','small-label');
  line(cx+rx+16,topY,cx+rx+16,baseY,'helper');
  label(cx+rx+27,(topY+baseY)/2,'h','small-label','start');
}
function coneShape(cx,baseY,r,h,scale,labelText){
  const rx=r*scale,ry=Math.max(8,rx*.26),height=h*scale,topY=baseY-height;
  ellipse(cx,baseY,rx,ry,'fill-alt');
  line(cx-rx,baseY,cx,topY,'outline');
  line(cx+rx,baseY,cx,topY,'outline');
  dot(cx,topY);
  label(cx,baseY+ry+28,labelText);
  line(cx,baseY,cx+rx,baseY,'helper');
  label(cx+rx*.55,baseY-8,'r','small-label');
  line(cx+rx+16,topY,cx+rx+16,baseY,'helper');
  label(cx+rx+27,(topY+baseY)/2,'h','small-label','start');
}

function renderCylinderCone(){
  const s=M.cylinderConeState({r:ui.ccR.value,h:ui.ccH.value});
  ui.ccROut.textContent=fmt(s.r);ui.ccHOut.textContent=fmt(s.h);
  clearStage();
  const scale=Math.min(42,115/s.r,175/s.h);
  cylinderShape(205,365,s.r,s.h,scale,'цилиндр');
  coneShape(555,365,s.r,s.h,scale,'конус');
  metrics(
    ['V цилиндра',piText(s.cylinderPi)],
    ['V конуса',piText(s.conePi)],
    ['Vцил / Vкон',fmt(s.ratio)],
    ['S основания',piText(s.r*s.r)]
  );
  ui.formula.textContent='Vцил = πr²h = '+piText(s.cylinderPi)+'; Vкон = ⅓πr²h = '+piText(s.conePi)+'.';
  ui.observation.textContent='При одинаковых r и h отношение Vцил : Vкон остаётся 3 : 1. Изменение радиуса влияет на оба объёма квадратично, высоты — линейно.';
  ui.stageTitle.textContent='Цилиндр и конус одинаковых радиуса и высоты';
  ui.stageDesc.textContent='Слева цилиндр, справа конус. Оба имеют радиус '+fmt(s.r)+' и высоту '+fmt(s.h)+'. Отношение объёмов равно 3.';
  ui.stage.dataset.mode='cylinder-cone';
  window.KTP_REVOLUTION_VOLUME_LAB_CURRENT=s;
}
function renderFrustum(){
  if(Number(ui.frr.value)>Number(ui.frR.value))ui.frr.value=ui.frR.value;
  ui.frr.max=ui.frR.value;
  const s=M.frustumState({R:ui.frR.value,r:ui.frr.value,h:ui.frH.value});
  ui.frROut.textContent=fmt(s.R);ui.frrOut.textContent=fmt(s.r);ui.frHOut.textContent=fmt(s.h);
  clearStage();
  const cx=380,baseY=365,scale=Math.min(48,145/s.R,190/s.h),baseRx=s.R*scale,topRx=s.r*scale;
  const baseRy=Math.max(8,baseRx*.25),topRy=s.r===0?0:Math.max(6,topRx*.25),topY=baseY-s.h*scale;
  ellipse(cx,baseY,baseRx,baseRy,'fill');
  if(s.r>0)ellipse(cx,topY,topRx,topRy,'fill-alt');
  else dot(cx,topY);
  line(cx-baseRx,baseY,cx-topRx,topY,'outline');
  line(cx+baseRx,baseY,cx+topRx,topY,'outline');
  line(cx,baseY,cx+baseRx,baseY,'helper');label(cx+baseRx*.55,baseY-9,'R','small-label');
  if(s.r>0){line(cx,topY,cx+topRx,topY,'helper');label(cx+topRx*.55,topY-9,'r','small-label');}
  line(cx+baseRx+18,topY,cx+baseRx+18,baseY,'helper');label(cx+baseRx+28,(topY+baseY)/2,'h','small-label','start');
  if(s.r>0&&s.r<s.R){
    const extra=s.h*s.r/(s.R-s.r),apexY=topY-extra*scale;
    if(apexY>20){
      line(cx-topRx,topY,cx,apexY,'helper');line(cx+topRx,topY,cx,apexY,'helper');dot(cx,apexY);
      label(cx+12,apexY-9,'S','small-label','start');
    }
  }
  const state=s.coneMatch?'граница: конус':s.cylinderMatch?'граница: цилиндр':'усечённый конус';
  label(cx,420,state);
  metrics(
    ['Объём V',piText(s.volumePi)],
    ['Больший R',fmt(s.R)],
    ['Меньший r',fmt(s.r)],
    ['Высота h',fmt(s.h)]
  );
  ui.formula.textContent='V = πh/3·(R² + Rr + r²) = '+piText(s.volumePi)+'.';
  ui.observation.textContent=s.coneMatch
    ?'При r=0 формула точно превращается в V=⅓πR²h — объём конуса.'
    :s.cylinderMatch
      ?'При r=R сумма в скобках равна 3R², поэтому V=πR²h — объём цилиндра.'
      :'Изменяйте r: формула непрерывно соединяет объём конуса при r=0 и объём цилиндра при r=R.';
  ui.stageTitle.textContent='Усечённый конус и его предельные случаи';
  ui.stageDesc.textContent='Больший радиус '+fmt(s.R)+', меньший радиус '+fmt(s.r)+', высота '+fmt(s.h)+'. '+ui.observation.textContent;
  ui.stage.dataset.mode='frustum';
  window.KTP_REVOLUTION_VOLUME_LAB_CURRENT=s;
}
function renderSphere(){
  if(Number(ui.spD.value)>Number(ui.spR.value))ui.spD.value=ui.spR.value;
  ui.spD.max=ui.spR.value;
  const s=M.sphereSegmentState({R:ui.spR.value,d:ui.spD.value});
  ui.spROut.textContent=fmt(s.R);ui.spDOut.textContent=fmt(s.d);
  clearStage();
  const cx=380,cy=245,rad=160,ratio=s.d/s.R,y=cy-rad*ratio;
  const half=rad*(s.sectionRadius/s.R);
  circle(cx,cy,rad,'fill');
  line(cx-rad-18,cy,cx+rad+18,cy,'axis');
  line(cx-half,y,cx+half,y,'section');
  if(half>0)ellipse(cx,y,half,Math.max(5,half*.2),'section-fill');
  line(cx,cy,cx,y,'helper');
  line(cx,y,cx,cy-rad,'helper');
  dot(cx,cy);label(cx+10,cy+22,'O','small-label','start');
  if(s.d>0)label(cx+12,(cy+y)/2,'d','small-label','start');
  if(s.capHeight>0)label(cx+12,(y+cy-rad)/2,'h','small-label','start');
  if(half>0){line(cx,y,cx+half,y,'helper');label(cx+half*.55,y-10,'ρ','small-label');}
  metrics(
    ['ρ сечения',fmt(s.sectionRadius)],
    ['h сегмента',fmt(s.capHeight)],
    ['V сегмента',piText(s.segmentPi)],
    ['V сегм / V шара',fmt(s.sphereVolume? s.segmentVolume/s.sphereVolume:0)]
  );
  ui.formula.textContent='ρ = √(R²−d²) = '+fmt(s.sectionRadius)+'; h = R−d = '+fmt(s.capHeight)+'; Vсег = πh²(R−h/3) = '+piText(s.segmentPi)+'.';
  ui.observation.textContent=s.isHemisphere
    ?'d=0: плоскость проходит через центр, h=R, поэтому сегмент является полушаром.'
    :s.isTangent
      ?'d=R: радиус сечения и высота сегмента равны 0; секущая плоскость стала касательной.'
      :'При движении плоскости к полюсу одновременно уменьшаются ρ, h и объём верхнего сегмента.';
  ui.stageTitle.textContent='Шар, секущая плоскость и шаровой сегмент';
  ui.stageDesc.textContent='Осевое сечение шара радиуса '+fmt(s.R)+'. Плоскость удалена от центра на '+fmt(s.d)+', радиус круга сечения '+fmt(s.sectionRadius)+', высота сегмента '+fmt(s.capHeight)+'.';
  ui.stage.dataset.mode='sphere';
  window.KTP_REVOLUTION_VOLUME_LAB_CURRENT=s;
}
function renderScale(){
  const s=M.similarityState({k:ui.scaleK.value,baseRadius:2,baseHeight:3});
  ui.scaleKOut.textContent=fmt(s.k);
  clearStage();
  const common=42/Math.max(1,s.k);
  cylinderShape(220,350,2,3,common,'исходное тело','fill');
  cylinderShape(555,350,2*s.k,3*s.k,common,'масштаб k='+fmt(s.k),'fill-alt');
  metrics(
    ['k',fmt(s.lengthFactor)],
    ['k²',fmt(s.areaFactor)],
    ['k³',fmt(s.volumeFactor)],
    ['V₂ / V₁',fmt(s.measuredVolumeFactor)]
  );
  ui.formula.textContent='Длины × '+fmt(s.lengthFactor)+'; площади × '+fmt(s.areaFactor)+'; объёмы × '+fmt(s.volumeFactor)+'.';
  ui.observation.textContent=s.k===1
    ?'При k=1 тела совпадают по масштабу: площади и объёмы тоже не меняются.'
    :'Три независимых линейных направления дают произведение k·k·k=k³ для объёма.';
  ui.stageTitle.textContent='Подобные тела и закон k³';
  ui.stageDesc.textContent='Два подобных цилиндра с коэффициентом '+fmt(s.k)+'. Площадь масштабируется в '+fmt(s.areaFactor)+' раза, объём в '+fmt(s.volumeFactor)+' раза.';
  ui.stage.dataset.mode='scale';
  window.KTP_REVOLUTION_VOLUME_LAB_CURRENT=s;
}
function render(){
  if(mode==='cylinder-cone')renderCylinderCone();
  else if(mode==='frustum')renderFrustum();
  else if(mode==='sphere')renderSphere();
  else renderScale();
}
function setMode(next){
  mode=next;
  const titles={
    'cylinder-cone':'Цилиндр и конус',
    frustum:'Усечённый конус',
    sphere:'Шар и сегмент',
    scale:'Масштаб k² / k³'
  };
  ui.controlTitle.textContent=titles[next];
  for(const button of ui.buttons)button.setAttribute('aria-pressed',String(button.dataset.modeButton===next));
  document.querySelectorAll('[data-controls]').forEach(set=>set.hidden=set.dataset.controls!==next);
  render();
}
ui.buttons.forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.modeButton)));
for(const input of document.querySelectorAll('input[type="range"]'))input.addEventListener('input',render);

ui.ccClassic.addEventListener('click',()=>{ui.ccR.value=3;ui.ccH.value=4;render();});
ui.ccDoubleR.addEventListener('click',()=>{ui.ccR.value=Math.min(Number(ui.ccR.max),Number(ui.ccR.value)*2);render();});
ui.frCone.addEventListener('click',()=>{ui.frr.value=0;render();});
ui.frCylinder.addEventListener('click',()=>{ui.frr.value=ui.frR.value;render();});
ui.spHalf.addEventListener('click',()=>{ui.spD.value=0;render();});
ui.spTangent.addEventListener('click',()=>{ui.spD.value=ui.spR.value;render();});
document.querySelectorAll('[data-k]').forEach(button=>button.addEventListener('click',()=>{ui.scaleK.value=button.dataset.k;render();}));

setMode('cylinder-cone');
})();