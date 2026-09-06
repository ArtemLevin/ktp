(function(){
'use strict';
const $=id=>document.getElementById(id);
const a=$('a'),b=$('b'),k=$('k');
const NS='http://www.w3.org/2000/svg';
const svgEl=(name,attrs={})=>{const e=document.createElementNS(NS,name);Object.entries(attrs).forEach(([key,value])=>e.setAttribute(key,String(value)));return e};
const polar=(cx,cy,r,angle)=>{const t=(angle-90)*Math.PI/180;return[cx+r*Math.cos(t),cy+r*Math.sin(t)]};
function sectorPath(index,count){
 const start=index*360/count,end=(index+1)*360/count;
 const [x1,y1]=polar(60,60,52,start),[x2,y2]=polar(60,60,52,end);
 const large=end-start>180?1:0;
 return`M 60 60 L ${x1.toFixed(3)} ${y1.toFixed(3)} A 52 52 0 ${large} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;
}
function renderCircles(num,den){
 const host=$('circles');host.textContent='';
 const wholes=Math.max(1,Math.ceil(num/den));
 for(let w=0;w<wholes;w++){
  const svg=svgEl('svg',{viewBox:'0 0 120 120','aria-label':`Целое ${w+1}, разделённое на ${den} равных секторов`});
  svg.style.width='112px';svg.style.height='112px';
  const used=Math.max(0,Math.min(den,num-w*den));
  for(let i=0;i<den;i++)svg.appendChild(svgEl('path',{d:sectorPath(i,den),fill:i<used?'#dbeafe':'#fff',stroke:'#64748b','stroke-width':'1'}));
  svg.appendChild(svgEl('circle',{cx:60,cy:60,r:2.4,fill:'#18202b'}));host.appendChild(svg);
 }
}
function renderStrips(num,den){
 const host=$('strips');host.textContent='';
 const wholes=Math.max(1,Math.ceil(num/den));
 for(let w=0;w<wholes;w++){
  const strip=document.createElement('div');strip.className='strip';strip.style.gridTemplateColumns=`repeat(${den},1fr)`;
  const used=Math.max(0,Math.min(den,num-w*den));
  for(let i=0;i<den;i++){const cell=document.createElement('div');cell.className='cell'+(i<used?' on':'');cell.title=`${i+1}-я доля из ${den}`;strip.appendChild(cell)}
  host.appendChild(strip);
 }
}
function renderLine(num,den){
 const svg=$('line');svg.textContent='';
 const left=60,right=660,y=96,width=right-left;
 svg.appendChild(svgEl('line',{x1:left,y1:y,x2:right,y2:y,stroke:'#334155','stroke-width':3}));
 const arrow=svgEl('path',{d:`M ${right} ${y} l -12 -7 v 14 z`,fill:'#334155'});svg.appendChild(arrow);
 for(let n=0;n<=3;n++){
  const x=left+width*n/3;svg.appendChild(svgEl('line',{x1:x,y1:y-14,x2:x,y2:y+14,stroke:'#334155','stroke-width':2}));
  const text=svgEl('text',{x,y:y+36,'text-anchor':'middle','font-size':16,fill:'#18202b'});text.textContent=String(n);svg.appendChild(text);
 }
 for(let i=1;i<3*den;i++){
  if(i%den===0)continue;
  const x=left+width*(i/den)/3;svg.appendChild(svgEl('line',{x1:x,y1:y-7,x2:x,y2:y+7,stroke:'#94a3b8','stroke-width':1}));
 }
 const value=num/den,x=left+width*value/3;
 svg.appendChild(svgEl('line',{x1:x,y1:y-48,x2:x,y2:y,stroke:'#2563eb','stroke-width':2,'stroke-dasharray':'4 3'}));
 svg.appendChild(svgEl('circle',{cx:x,cy:y,r:7,fill:'#2563eb'}));
 const label=svgEl('text',{x,y:y-58,'text-anchor':'middle','font-size':17,'font-weight':700,fill:'#1d4ed8'});label.textContent=`${num}/${den}`;svg.appendChild(label);
 }
function mixedText(num,den){
 if(num===0)return'0';const q=Math.floor(num/den),r=num%den;if(r===0)return String(q);if(q===0)return`${num}/${den}`;return`${q} ${r}/${den}`;
}
function update(){
 const den=Number(b.value);a.max=String(3*den);if(Number(a.value)>3*den)a.value=String(3*den);
 const num=Number(a.value),mult=Number(k.value),q=Math.floor(num/den),r=num%den;
 $('av').textContent=String(num);$('bv').textContent=String(den);$('kv').textContent=String(mult);
 $('fractionOut').textContent=`${num}/${den}`;
 $('relationOut').textContent=num<den?'< 1':num===den?'= 1':'> 1';
 $('mixedOut').textContent=mixedText(num,den);
 $('equalOut').textContent=`${num*mult}/${den*mult}`;
 renderCircles(num,den);renderStrips(num,den);renderLine(num,den);
 const relation=num<den?'дробь правильная и точка лежит между 0 и 1':num===den?'получается ровно одна целая единица':`видно ${q} полных целых${r?` и ещё ${r}/${den}`:''}`;
 $('observation').textContent=`Сейчас ${num}/${den}: ${relation}. Умножение числителя и знаменателя на ${mult} даёт ${num*mult}/${den*mult}; закрашенная величина и координата точки при этом не меняются.`;
}
[a,b,k].forEach(el=>el.addEventListener('input',update));
$('proper').addEventListener('click',()=>{a.value=String(Math.max(1,Number(b.value)-1));update()});
$('improper').addEventListener('click',()=>{a.value=String(Number(b.value)+2);update()});
$('reset').addEventListener('click',()=>{b.value='5';a.max='15';a.value='7';k.value='2';update()});
update();
})();
