(function(){
'use strict';
const $=id=>document.getElementById(id),shape=$('shape'),base=$('base'),height=$('height'),top=$('top'),shear=$('shear'),svg=$('stage'),out=$('out'),topWrap=$('topWrap'),shearWrap=$('shearWrap');
const ns='http://www.w3.org/2000/svg';
const el=(name,attrs={})=>{const n=document.createElementNS(ns,name);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n;};
function line(x1,y1,x2,y2,cls='guide'){svg.appendChild(el('line',{x1,y1,x2,y2,class:cls}));}
function text(x,y,value,anchor='middle'){const n=el('text',{x,y,class:'label','text-anchor':anchor});n.textContent=value;svg.appendChild(n);}
function polygon(points){svg.appendChild(el('polygon',{points:points.map(p=>p.join(',')).join(' '),class:'shape'}));}
function right(x,y,size=18){svg.appendChild(el('path',{d:`M ${x} ${y-size} L ${x+size} ${y-size} L ${x+size} ${y}`,class:'right'}));}
function render(){
 const type=shape.value,a=Number(base.value),h=Number(height.value),b=Number(top.value),sh=Number(shear.value);
 $('baseOut').textContent=a;$('heightOut').textContent=h;$('topOut').textContent=b;$('shearOut').textContent=sh;
 topWrap.hidden=type!=='trapezoid';shearWrap.hidden=type!=='parallelogram';svg.replaceChildren();
 const stageW=620,y0=285,scaleY=18,hh=h*scaleY,maxLinear=type==='trapezoid'?Math.max(a,b):a,extra=type==='parallelogram'?Math.abs(sh):0;
 const scaleX=Math.min(23,(stageW-150-extra)/maxLinear),w=a*scaleX,topW=b*scaleX,x0=(stageW-w-(type==='parallelogram'?sh:0))/2;
 let area=0,formula='',explain='';
 if(type==='rectangle'){
  polygon([[x0,y0],[x0,y0-hh],[x0+w,y0-hh],[x0+w,y0]]);line(x0,y0,x0,y0-hh,'height');right(x0,y0);area=a*h;formula=`S = a·h = ${a}·${h} = ${area}`;explain='Прямоугольник показывает базовую модель произведения основания на высоту.';
 }else if(type==='parallelogram'){
  const dx=sh;polygon([[x0,y0],[x0+dx,y0-hh],[x0+dx+w,y0-hh],[x0+w,y0]]);line(x0+dx,y0-hh,x0+dx,y0,'height');line(x0,y0,x0+w,y0);right(x0+dx,y0);area=a*h;formula=`S = a·h = ${a}·${h} = ${area}`;explain='Сдвиг верхней стороны меняет форму, при фиксированных a и h площадь сохраняется.';
 }else if(type==='triangle'){
  polygon([[x0,y0],[x0+w*.42,y0-hh],[x0+w,y0]]);line(x0+w*.42,y0-hh,x0+w*.42,y0,'height');right(x0+w*.42,y0);area=a*h/2;formula=`S = a·h/2 = ${a}·${h}/2 = ${area}`;explain='При тех же основании и высоте треугольник имеет половину площади соответствующего параллелограмма.';
 }else{
  const offset=(w-topW)/2;polygon([[x0,y0],[x0+offset,y0-hh],[x0+offset+topW,y0-hh],[x0+w,y0]]);line(x0+offset,y0-hh,x0+offset,y0,'height');right(x0+offset,y0);area=(a+b)*h/2;formula=`S = (a+b)·h/2 = (${a}+${b})·${h}/2 = ${area}`;explain=`Полусумма оснований равна ${(a+b)/2}; умножение её на высоту даёт площадь трапеции.`;
 }
 text(x0+w/2,y0+34,`a = ${a}`);text(Math.max(28,x0-24),y0-hh/2,`h = ${h}`,'end');if(type==='trapezoid')text(stageW/2,y0-hh-18,`b = ${b}`);
 out.innerHTML=`<p class="formula"><strong>${formula}</strong></p><p>${explain}</p><p>Единицы площади: квадратные единицы.</p>`;
}
for(const c of [shape,base,height,top,shear])c.addEventListener('input',render);shape.addEventListener('change',render);render();
})();
