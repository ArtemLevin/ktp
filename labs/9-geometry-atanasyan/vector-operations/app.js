(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id),svg=$('stage');
const controls=['mode','lenA','angleA','lenB','angleB','k'].map($);
const state=()=>({mode:$('mode').value,lenA:+$('lenA').value,angleA:+$('angleA').value,lenB:+$('lenB').value,angleB:+$('angleB').value,k:+$('k').value});
const el=(name,attrs={})=>{const n=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
const vec=(len,deg)=>{const r=deg*Math.PI/180;return{x:len*Math.cos(r),y:-len*Math.sin(r)}};
const add=(p,v,k=1)=>({x:p.x+v.x*k,y:p.y+v.y*k});
const scale=(v,k)=>({x:v.x*k,y:v.y*k});
const mag=v=>Math.hypot(v.x,v.y);
const u=52,origin={x:310,y:235};
function line(a,b,cls,marker=true){svg.append(el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:cls,...(marker?{'marker-end':'url(#arrow)'}:{})}));}
function label(p,text,cls='vlabel'){const t=el('text',{x:p.x+8,y:p.y-8,class:cls});t.textContent=text;svg.append(t);}
function grid(){
 for(let x=50;x<=570;x+=52)svg.append(el('line',{x1:x,y1:35,x2:x,y2:385,class:'grid-line'}));
 for(let y=27;y<=391;y+=52)svg.append(el('line',{x1:45,y1:y,x2:575,y2:y,class:'grid-line'}));
 svg.append(el('line',{x1:45,y1:origin.y,x2:575,y2:origin.y,class:'axis'}));
 svg.append(el('line',{x1:origin.x,y1:35,x2:origin.x,y2:385,class:'axis'}));
 svg.append(el('circle',{cx:origin.x,cy:origin.y,r:4,class:'origin'}));label(origin,'O');
}
function render(){
 const s=state();
 $('lenAOut').textContent=s.lenA.toFixed(2).replace(/\.00$/,'');
 $('angleAOut').textContent=s.angleA+'°';
 $('lenBOut').textContent=s.lenB.toFixed(2).replace(/\.00$/,'');
 $('angleBOut').textContent=s.angleB+'°';
 $('kOut').textContent=s.k;
 $('bControls').hidden=s.mode==='scalar';
 $('kControl').hidden=s.mode!=='scalar';
 svg.innerHTML='';
 const defs=el('defs'),marker=el('marker',{id:'arrow',viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'});
 marker.append(el('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:'context-stroke'}));defs.append(marker);svg.append(defs);grid();
 const a=scale(vec(s.lenA,s.angleA),u),b=scale(vec(s.lenB,s.angleB),u),A=add(origin,a),B=add(origin,b);
 if(s.mode==='triangle'){
  const C=add(A,b);line(origin,A,'vector-a');line(A,C,'vector-b');line(origin,C,'vector-result');label(A,'a⃗');label(C,'a⃗+b⃗','rlabel');
  $('modeTitle').textContent='Сумма · правило треугольника';$('result').textContent='|a⃗+b⃗| ≈ '+(mag({x:a.x+b.x,y:a.y+b.y})/u).toFixed(2);$('explain').textContent='b⃗ перенесён равным себе к концу a⃗. Результат соединяет начало первого вектора с концом второго.';
 }else if(s.mode==='parallelogram'){
  const C=add(A,b);line(origin,A,'vector-a');line(origin,B,'vector-b');line(A,C,'construction',false);line(B,C,'construction',false);line(origin,C,'vector-result');label(A,'a⃗');label(B,'b⃗');label(C,'a⃗+b⃗','rlabel');
  $('modeTitle').textContent='Сумма · правило параллелограмма';$('result').textContent='тот же результат';$('explain').textContent='Оба слагаемых имеют общее начало. Диагональ параллелограмма из O совпадает с суммой, построенной правилом треугольника.';
 }else if(s.mode==='difference'){
  const minusB=scale(b,-1),C=add(A,minusB);line(origin,A,'vector-a');line(origin,B,'vector-b');line(B,A,'vector-result');line(A,C,'construction');label(A,'a⃗');label(B,'b⃗');label(add({x:(A.x+B.x)/2,y:(A.y+B.y)/2},{x:0,y:-4}),'a⃗−b⃗','rlabel');
  $('modeTitle').textContent='Разность a⃗ − b⃗';$('result').textContent='от конца b⃗ к концу a⃗';$('explain').textContent='a⃗−b⃗=a⃗+(−b⃗). При общем начале результирующий вектор удобно сразу провести от конца b⃗ к концу a⃗.';
 }else{
  const ka=scale(a,s.k),K=add(origin,ka);line(origin,A,'vector-a');line(origin,K,'vector-result');label(A,'a⃗');label(K,'k·a⃗','rlabel');
  $('modeTitle').textContent='Умножение k·a⃗';$('result').textContent='|k·a⃗| = '+Math.abs(s.k).toFixed(1)+'·|a⃗|';$('explain').textContent=s.k>0?'Направление сохраняется.':s.k<0?'Направление становится противоположным.':'При k=0 получается нулевой вектор.';
 }
}
controls.forEach(c=>c.addEventListener(c.tagName==='SELECT'?'change':'input',render));render();
})();