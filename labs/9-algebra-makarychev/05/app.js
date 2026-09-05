(function(){
'use strict';
const $=id=>document.getElementById(id);
const model=$('model'),first=$('first'),step=$('step'),count=$('count'),showSum=$('showSum');
const canvas=$('plot'),ctx=canvas.getContext('2d');
const fmt=x=>{if(!Number.isFinite(x))return '—';const a=Math.abs(x);if(a>=1e7||(a>0&&a<1e-4))return x.toExponential(3).replace('.',',');return Number(x.toFixed(4)).toString().replace('.',',');};
function configure(){
 const gp=model.value==='gp';
 $('stepLabel').textContent=gp?'Знаменатель q':'Разность d';
 $('memberHead').textContent=gp?'bₖ':'aₖ';
 $('changeHead').textContent=gp?'qₖ=bₖ/bₖ₋₁':'Δ=aₖ−aₖ₋₁';
 if(gp){step.min='-3';step.max='3';step.step='0.5';if(Number(step.value)===0)step.value='2';}
 else{step.min='-5';step.max='5';step.step='1';step.value=String(Math.round(Number(step.value)));}
 render();
}
function values(){
 const a=Number(first.value),p=Number(step.value),n=Number(count.value),gp=model.value==='gp';
 const members=Array.from({length:n},(_,j)=>gp?a*p**j:a+p*j);
 let s=0;const sums=members.map(v=>s+=v);
 return {a,p,n,gp,members,sums};
}
function render(){
 const {a,p,n,gp,members,sums}=values();
 $('firstOut').textContent=fmt(a);$('stepOut').textContent=fmt(p);$('nOut').textContent=n;
 $('formula').innerHTML=gp?`bₖ = ${fmt(a)} · (${fmt(p)})<sup>k−1</sup>`:`aₖ = ${fmt(a)} + ${fmt(p)}(k−1)`;
 const invalid=gp&&(a===0||p===0);
 const insight=$('insight'); insight.classList.toggle('warn',invalid);
 if(invalid) insight.textContent='В линии Макарычева геометрическая прогрессия определяется как последовательность ненулевых чисел. При b₁=0 или q=0 эта модель выходит за принятое в учебнике определение.';
 else if(!gp&&p===0) insight.textContent='d=0: арифметическая прогрессия постоянна; все её члены равны a₁.';
 else if(!gp) insight.textContent=p>0?'d>0: значения растут равными абсолютными шагами — график точек лежит на возрастающей прямой.':'d<0: значения убывают равными абсолютными шагами — график точек лежит на убывающей прямой.';
 else if(p===1) insight.textContent='q=1: геометрическая прогрессия постоянна; Sₖ растёт линейно.';
 else if(p<0) insight.textContent='q<0: знаки соседних членов чередуются; модуль умножается на |q|.';
 else if(p>0&&p<1) insight.textContent='0<q<1: положительный по модулю ряд затухает; каждый следующий член составляет фиксированную долю предыдущего.';
 else insight.textContent='q>1: при положительном b₁ получаем экспоненциальный рост дискретных значений.';
 $('sumLegend').hidden=!showSum.checked;
 $('tbody').innerHTML=members.map((v,j)=>{
  let change='—';
  if(j>0) change=gp?(members[j-1]===0?'не определено':fmt(v/members[j-1])):fmt(v-members[j-1]);
  return `<tr><td>${j+1}</td><td>${fmt(v)}</td><td>${change}</td><td>${fmt(sums[j])}</td></tr>`;
 }).join('');
 draw(members,showSum.checked?sums:[]);
}
function draw(members,sums){
 const dpr=Math.max(1,window.devicePixelRatio||1),w=canvas.clientWidth||900,h=Math.max(360,Math.round(w*0.56));
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.clearRect(0,0,w,h);
 const pad={l:64,r:24,t:28,b:48},all=members.concat(sums);
 let ymin=Math.min(0,...all),ymax=Math.max(0,...all);
 if(ymin===ymax){ymin-=1;ymax+=1}
 const extra=(ymax-ymin)*.08;ymin-=extra;ymax+=extra;
 const x=k=>pad.l+(k-1)*(w-pad.l-pad.r)/Math.max(1,members.length-1);
 const y=v=>pad.t+(ymax-v)*(h-pad.t-pad.b)/(ymax-ymin);
 ctx.strokeStyle='#dfe3e8';ctx.lineWidth=1;
 for(let j=0;j<=5;j++){const yy=pad.t+j*(h-pad.t-pad.b)/5;ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();
  const val=ymax-j*(ymax-ymin)/5;ctx.fillStyle='#687382';ctx.font='12px system-ui';ctx.textAlign='right';ctx.fillText(fmt(val),pad.l-8,yy+4);}
 if(ymin<=0&&ymax>=0){ctx.strokeStyle='#87909b';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pad.l,y(0));ctx.lineTo(w-pad.r,y(0));ctx.stroke();}
 ctx.fillStyle='#687382';ctx.textAlign='center';
 members.forEach((_,j)=>ctx.fillText(String(j+1),x(j+1),h-20));
 function series(vals,hollow){
   if(vals.length>1){ctx.strokeStyle=hollow?'#7a8490':'#303945';ctx.lineWidth=hollow?1.5:2;ctx.beginPath();vals.forEach((v,j)=>j?ctx.lineTo(x(j+1),y(v)):ctx.moveTo(x(j+1),y(v)));ctx.stroke();}
   vals.forEach((v,j)=>{ctx.beginPath();ctx.arc(x(j+1),y(v),hollow?5:4.5,0,Math.PI*2);if(hollow){ctx.fillStyle='white';ctx.fill();ctx.strokeStyle='#7a8490';ctx.lineWidth=2;ctx.stroke();}else{ctx.fillStyle='#303945';ctx.fill();}});
 }
 series(members,false); if(sums.length)series(sums,true);
 ctx.fillStyle='#4d5866';ctx.font='13px system-ui';ctx.textAlign='left';ctx.fillText('значение',8,18);ctx.textAlign='right';ctx.fillText('k',w-8,h-20);
}
[model,first,step,count,showSum].forEach(el=>el.addEventListener('input',el===model?configure:render));
window.addEventListener('resize',render);
configure();
})();