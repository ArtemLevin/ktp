(function(){
'use strict';
const NS='http://www.w3.org/2000/svg',DEG=Math.PI/180;
const $=id=>document.getElementById(id);
const ui={height:$('height'),radius:$('radius'),yaw:$('yaw'),pitch:$('pitch'),third:$('third'),preset45:$('preset45'),reset:$('reset'),hOut:$('hOut'),rOut:$('rOut'),yawOut:$('yawOut'),pitchOut:$('pitchOut'),mh:$('mh'),hb:$('hb'),mb:$('mb'),angle:$('angle'),pythagoras:$('pythagoras'),trig:$('trig'),thirdText:$('thirdText'),stage:$('stage')};
const fmt=n=>Number(n).toFixed(2).replace(/\.00$/,'');
function project(p){
 const yaw=Number(ui.yaw.value)*DEG,pitch=Number(ui.pitch.value)*DEG;
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 const x1=p[0]*cy-p[1]*sy,y1=p[0]*sy+p[1]*cy,z1=p[2];
 const y2=y1*cp-z1*sp,depth=y1*sp+z1*cp;
 return{x:330+44*x1,y:250-44*y2,depth};
}
const el=(name,attrs={})=>{const n=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
function line(svg,a,b,cls){svg.append(el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:cls}));}
function label(svg,p,text,dx=8,dy=-8,cls='label'){const t=el('text',{x:p.x+dx,y:p.y+dy,class:cls});t.textContent=text;svg.append(t);}
function render(){
 const h=Number(ui.height.value),r=Number(ui.radius.value);
 const H=[0,0,0],M=[0,0,h],B=[r,0,0];
 const mb=Math.hypot(h,r),phi=Math.atan2(h,r)/DEG;
 const plane=[[-4,-3,0],[4,-3,0],[4,3,0],[-4,3,0]].map(project);
 const pH=project(H),pM=project(M),pB=project(B),svg=ui.stage;
 [...svg.querySelectorAll(':scope > :not(title):not(desc)')].forEach(n=>n.remove());
 svg.append(el('polygon',{points:plane.map(p=>`${p.x},${p.y}`).join(' '),class:'plane'}));
 label(svg,plane[2],'α',8,-6,'plane-label');
 line(svg,pM,pH,'seg em');line(svg,pM,pB,'seg em');line(svg,pH,pB,'seg aux');
 for(const [p,name,dx,dy] of [[pM,'M',8,-8],[pH,'H',-18,16],[pB,'B',8,16]]){svg.append(el('circle',{cx:p.x,cy:p.y,r:5,class:'pt'}));label(svg,p,name,dx,dy);}
 if(ui.third.checked){
   const L1=project([r,-2.5,0]),L2=project([r,2.5,0]);
   line(svg,L1,L2,'seg third');
   label(svg,L2,'l',8,-4);
 }
 ui.hOut.textContent=fmt(h);ui.rOut.textContent=fmt(r);
 ui.yawOut.textContent=`${Number(ui.yaw.value)}°`.replace('-', '−');ui.pitchOut.textContent=`${Number(ui.pitch.value)}°`;
 ui.mh.textContent=fmt(h);ui.hb.textContent=fmt(r);ui.mb.textContent=fmt(mb);ui.angle.textContent=`${fmt(phi)}°`;
 ui.pythagoras.textContent=`MB² = MH² + HB² = ${fmt(h*h)} + ${fmt(r*r)} = ${fmt(mb*mb)}`;
 ui.trig.textContent=`tan φ = MH/HB = ${fmt(h)}/${fmt(r)} = ${fmt(h/r)}`;
 ui.thirdText.hidden=!ui.third.checked;
 ui.thirdText.textContent=ui.third.checked?'l лежит в α и l ⊥ HB. При MH ⊥ α теорема о трёх перпендикулярах даёт l ⊥ MB.':'';
}
for(const x of [ui.height,ui.radius,ui.yaw,ui.pitch,ui.third])x.addEventListener('input',render);
ui.preset45.addEventListener('click',()=>{ui.radius.value=ui.height.value;render();ui.radius.focus();});
ui.reset.addEventListener('click',()=>{ui.height.value=4;ui.radius.value=6;ui.yaw.value=-35;ui.pitch.value=26;ui.third.checked=false;render();ui.height.focus();});
render();
})();