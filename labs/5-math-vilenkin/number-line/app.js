(function(){
'use strict';
const $=id=>document.getElementById(id);
const canvas=$('lineCanvas'),ctx=canvas.getContext('2d');
const stepEl=$('step'),maxEl=$('max'),aEl=$('pointA'),bEl=$('pointB');
const state={step:2,max:40,A:8,B:24,drag:null,target:18};
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const snap=v=>clamp(Math.round(v/state.step)*state.step,0,state.max);
function syncInputs(){
 [aEl,bEl].forEach(el=>{el.min='0';el.max=String(state.max);el.step=String(state.step)});
 aEl.value=String(state.A);bEl.value=String(state.B);
 $('readA').textContent=state.A;$('readB').textContent=state.B;
 const sign=state.A<state.B?'<':state.A>state.B?'>':'=';
 $('compare').textContent=`A ${sign} B`;
 $('distance').textContent=String(Math.abs(state.B-state.A));
 const right=state.A===state.B?'Точки A и B совпадают.':state.A<state.B?`Точка B расположена правее A, потому что ${state.B} > ${state.A}.`:`Точка A расположена правее B, потому что ${state.A} > ${state.B}.`;
 const dist=Math.abs(state.B-state.A),hi=Math.max(state.A,state.B),lo=Math.min(state.A,state.B);
 $('observation').textContent=`${right} Расстояние AB = ${hi} − ${lo} = ${dist}. Цена одного деления: ${state.step}.`;
}
function geometry(){
 const rect=canvas.getBoundingClientRect(),dpr=Math.max(1,window.devicePixelRatio||1);
 const w=Math.max(320,rect.width),h=Math.max(240,rect.height);
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
 ctx.setTransform(dpr,0,0,dpr,0,0);
 return {w,h,pad:44,y:h*.52,left:44,right:w-28};
}
function xFor(value,g){return g.left+(value/state.max)*(g.right-g.left)}
function valueFor(x,g){return snap((x-g.left)/(g.right-g.left)*state.max)}
function drawArrow(g){
 ctx.strokeStyle='#334155';ctx.fillStyle='#334155';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(g.left,g.y);ctx.lineTo(g.right,g.y);ctx.stroke();
 ctx.beginPath();ctx.moveTo(g.right,g.y);ctx.lineTo(g.right-12,g.y-6);ctx.lineTo(g.right-12,g.y+6);ctx.closePath();ctx.fill();
}
function drawTicks(g){
 ctx.textAlign='center';ctx.textBaseline='top';ctx.font='12px system-ui, sans-serif';
 const count=Math.floor(state.max/state.step),labelEvery=count>22?Math.ceil(count/11):count>14?2:1;
 for(let i=0;i<=count;i++){
  const value=i*state.step,x=xFor(value,g),major=i%labelEvery===0||i===count;
  ctx.strokeStyle=major?'#64748b':'#cbd5e1';ctx.lineWidth=major?1.5:1;
  ctx.beginPath();ctx.moveTo(x,g.y-(major?10:6));ctx.lineTo(x,g.y+(major?10:6));ctx.stroke();
  if(major){ctx.fillStyle='#475569';ctx.fillText(String(value),x,g.y+14)}
 }
 ctx.fillStyle='#475569';ctx.textAlign='left';ctx.fillText('0 — начало отсчёта',g.left,g.y+46);
 ctx.textAlign='right';ctx.fillText(`цена деления: ${state.step}`,g.right,g.y+46);
}
function drawPoint(name,value,yOffset,g,fill){
 const x=xFor(value,g),y=g.y+yOffset;
 ctx.strokeStyle=fill;ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x,g.y);ctx.lineTo(x,y);ctx.stroke();ctx.setLineDash([]);
 ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fff';ctx.font='700 12px system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(name,x,y);
 ctx.fillStyle='#172033';ctx.font='700 13px system-ui, sans-serif';ctx.textBaseline='bottom';ctx.fillText(`${name}(${value})`,x,y-16);
 return {x,y};
}
function draw(){
 const g=geometry();ctx.clearRect(0,0,g.w,g.h);
 const grad=ctx.createLinearGradient(0,0,g.w,0);grad.addColorStop(0,'#f8fbff');grad.addColorStop(1,'#f5f3ff');ctx.fillStyle=grad;ctx.fillRect(0,0,g.w,g.h);
 drawArrow(g);drawTicks(g);
 const A=drawPoint('A',state.A,-48,g,'#2563eb'),B=drawPoint('B',state.B,-92,g,'#7c3aed');
 canvas._hit={A,B,g};
}
function update(){syncInputs();draw()}
function setPoint(name,value){state[name]=snap(Number(value)||0);update()}
function applyScale(){
 state.step=Number(stepEl.value);state.max=Number(maxEl.value);
 state.A=snap(state.A);state.B=snap(state.B);
 state.target=snap(state.target);if(state.target>state.max)state.target=snap(state.max/2);
 aEl.max=bEl.max=String(state.max);aEl.step=bEl.step=String(state.step);
 $('challengeText').textContent=`Поставьте A в точку с координатой ${state.target}.`;
 $('challengeStatus').textContent='';$('challengeStatus').className='challenge-status';
 update();
}
function pointerPos(e){const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}}
canvas.addEventListener('pointerdown',e=>{
 const hit=canvas._hit;if(!hit)return;const p=pointerPos(e);
 const da=Math.hypot(p.x-hit.A.x,p.y-hit.A.y),db=Math.hypot(p.x-hit.B.x,p.y-hit.B.y);
 if(Math.min(da,db)>30)return;
 state.drag=da<=db?'A':'B';canvas.classList.add('dragging');canvas.setPointerCapture(e.pointerId);e.preventDefault();
});
canvas.addEventListener('pointermove',e=>{
 if(!state.drag||!canvas._hit)return;const p=pointerPos(e);state[state.drag]=valueFor(p.x,canvas._hit.g);update();e.preventDefault();
});
function stopDrag(e){if(!state.drag)return;state.drag=null;canvas.classList.remove('dragging');try{canvas.releasePointerCapture(e.pointerId)}catch{} }
canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);
stepEl.addEventListener('change',applyScale);maxEl.addEventListener('change',applyScale);
aEl.addEventListener('change',()=>setPoint('A',aEl.value));bEl.addEventListener('change',()=>setPoint('B',bEl.value));
function newTask(){
 const count=Math.floor(state.max/state.step),minIndex=Math.min(1,count),maxIndex=Math.max(minIndex,count-1);
 const index=minIndex+Math.floor(Math.random()*(maxIndex-minIndex+1));state.target=index*state.step;
 $('challengeText').textContent=`Поставьте A в точку с координатой ${state.target}.`;
 const status=$('challengeStatus');status.textContent='';status.className='challenge-status';
}
$('newTask').addEventListener('click',newTask);
$('checkTask').addEventListener('click',()=>{
 const status=$('challengeStatus');
 if(state.A===state.target){status.textContent=`Верно: A(${state.A}).`;status.className='challenge-status ok'}
 else{status.textContent=`Сейчас A(${state.A}). Нужно ${state.target}. Сравните положение с нужным делением.`;status.className='challenge-status bad'}
});
window.addEventListener('resize',draw);
update();
})();
