(function(){'use strict';
const svg=document.getElementById('tree'),inputs=[1,2,3].map(i=>document.getElementById('s'+i)),outs=[1,2,3].map(i=>document.getElementById('o'+i));
const ns='http://www.w3.org/2000/svg';
function el(name,attrs={}){const x=document.createElementNS(ns,name);Object.entries(attrs).forEach(([k,v])=>x.setAttribute(k,v));return x;}
function draw(){
 const counts=inputs.map((x,i)=>{const v=Number(x.value);outs[i].textContent=v;return v;});
 document.getElementById('product').textContent=counts.join(' · ')+' =';
 document.getElementById('total').textContent=counts.reduce((a,b)=>a*b,1)+' полных вариантов';
 svg.innerHTML=''; const W=760,H=440,xs=[40,250,480,710]; let levels=[[{x:xs[0],y:H/2,label:'старт'}]];
 for(let d=0;d<3;d++){const prev=levels[d],next=[],total=prev.length*counts[d];
  for(let i=0;i<total;i++)next.push({x:xs[d+1],y:(i+1)*H/(total+1),label:d===2?`вариант ${i+1}`:`${d+1}.${i+1}`});
  prev.forEach((p,pi)=>{for(let j=0;j<counts[d];j++){const c=next[pi*counts[d]+j];svg.appendChild(el('line',{x1:p.x,y1:p.y,x2:c.x,y2:c.y,class:'edge'}));}});
  levels.push(next);
 }
 levels.flat().forEach((n,idx)=>{svg.appendChild(el('circle',{cx:n.x,cy:n.y,r:idx?7:9,class:idx>=1+counts[0]+counts[0]*counts[1]?'node leaf':'node'}));const t=el('text',{x:n.x+(idx?10:13),y:n.y+4});t.textContent=n.label;svg.appendChild(t);});
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
}
inputs.forEach(x=>x.addEventListener('input',draw));document.getElementById('randomize').addEventListener('click',()=>{inputs[0].value=1+Math.floor(Math.random()*4);inputs[1].value=1+Math.floor(Math.random()*4);inputs[2].value=1+Math.floor(Math.random()*3);draw();});draw();
})();