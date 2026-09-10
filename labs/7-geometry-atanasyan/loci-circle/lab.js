(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
const svg=document.getElementById('stage'),mode=document.getElementById('mode'),pos=document.getElementById('pos'),offset=document.getElementById('offset'),out=document.getElementById('out'),posLabel=document.getElementById('posLabel'),offsetLabel=document.getElementById('offsetLabel');
const E=(name,attrs={},text='')=>{const n=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text)n.textContent=text;return n;};
const line=(a,b,cls='main')=>E('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:cls});
const point=(p,label)=>{svg.append(E('circle',{cx:p.x,cy:p.y,r:4,class:'point'}));if(label)svg.append(E('text',{x:p.x+9,y:p.y-9,class:'label'},label));};
const text=(x,y,value,cls='measure')=>svg.append(E('text',{x,y,class:cls},value));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const project=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy);return{x:a.x+t*dx,y:a.y+t*dy};};
const fmt=x=>(Math.round(x*10)/10).toFixed(1);
function clear(){while(svg.firstChild)svg.removeChild(svg.firstChild);}
function renderBisector(){
 const t=Number(pos.value)/100,off=Number(offset.value);
 const A={x:70,y:180},B={x:575,y:55},C={x:575,y:305};
 const M={x:170+300*t,y:180+off};
 const K=project(M,A,B),L=project(M,A,C),d1=dist(M,K),d2=dist(M,L),equal=Math.abs(d1-d2)<.15;
 svg.append(line(A,B));svg.append(line(A,C));svg.append(line(A,{x:610,y:180},'aux'));
 svg.append(E('circle',{cx:M.x,cy:M.y,r:Math.min(d1,d2),class:'circle-fill'}));
 svg.append(line(M,K,'em'));svg.append(line(M,L,'em'));
 [A,M,K,L].forEach((p,i)=>point(p,['A','M','K','L'][i]));
 text(92,166,'биссектриса','measure');
 out.innerHTML=`<strong>${equal?'Равноудалённость выполняется':'Равноудалённость нарушена'}</strong>d(M, AB) = ${fmt(d1)}; d(M, AC) = ${fmt(d2)}.<br>${equal?'Центр лежит на биссектрисе, поэтому окружность касается обеих сторон.':'Точка сошла с биссектрисы: расстояния до сторон стали различными.'}`;
}
function renderPerp(){
 const t=Number(pos.value)/100,off=Number(offset.value);
 const A={x:120,y:270},B={x:520,y:270},O={x:320,y:270},M={x:320+off,y:55+150*t};
 const d1=dist(M,A),d2=dist(M,B),equal=Math.abs(d1-d2)<.15;
 svg.append(line(A,B));svg.append(line({x:320,y:25},{x:320,y:330},'aux'));svg.append(line(M,A,'em'));svg.append(line(M,B,'em'));
 point(A,'A');point(B,'B');point(O,'O');point(M,'M');text(330,45,'серединный перпендикуляр');
 out.innerHTML=`<strong>${equal?'MA = MB':'MA и MB различны'}</strong>MA = ${fmt(d1)}; MB = ${fmt(d2)}.<br>${equal?'M лежит на серединном перпендикуляре к AB.':'После смещения M перестала быть равноудалённой от A и B.'}`;
}
function renderTangent(){
 const t=Number(pos.value)/100,off=Number(offset.value),O={x:280,y:180},r=105,theta=(-55+110*t)*Math.PI/180,A={x:O.x+r*Math.cos(theta),y:O.y+r*Math.sin(theta)};
 const tangent=theta+Math.PI/2+off/4*Math.PI/180,dx=Math.cos(tangent)*170,dy=Math.sin(tangent)*170,P={x:A.x-dx,y:A.y-dy},Q={x:A.x+dx,y:A.y+dy};
 const angle=90+off/4,equal=Math.abs(off)<.1;
 svg.append(E('circle',{cx:O.x,cy:O.y,r,class:'circle-fill'}));svg.append(line(O,A,'em'));svg.append(line(P,Q));point(O,'O');point(A,'A');text(35,45,'t');
 out.innerHTML=`<strong>${equal?'Касательное положение':'Прямая отклонена от касательной'}</strong>Угол между OA и t = ${fmt(Math.abs(angle))}°.<br>${equal?'OA перпендикулярен t в точке A: t является касательной.':'Для касательной требуется угол 90° между радиусом и прямой в точке окружности.'}`;
}
function render(){clear();const m=mode.value;if(m==='bisector'){posLabel.textContent='Положение вдоль биссектрисы';offsetLabel.textContent='Смещение с биссектрисы';renderBisector();}else if(m==='perp'){posLabel.textContent='Положение вдоль серединного перпендикуляра';offsetLabel.textContent='Смещение с серединного перпендикуляра';renderPerp();}else{posLabel.textContent='Точка касания на окружности';offsetLabel.textContent='Отклонение прямой от перпендикуляра';renderTangent();}}
[mode,pos,offset].forEach(x=>x.addEventListener('input',render));render();
})();
