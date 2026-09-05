(function(){
'use strict';
const cfg=window.KTP_LAB_CONFIG||{};
const root=document.getElementById('lab-app');
if(!root)return;
const esc=s=>String(s??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
root.innerHTML=`<main class="lab-page"><div class="lab-top"><a href="${esc(cfg.backHref||'#')}">← К теме</a><a href="../../../index.html?focus=10-algebra-alimov&view=timeline">КТП 3.0</a></div><header class="hero"><div class="kicker">Цифровая лаборатория · 10 класс</div><h1>${esc(cfg.title||'Исследование')}</h1><p>${esc(cfg.question||'Изменяйте параметры и формулируйте наблюдения.')}</p></header><div class="lab-grid"><section class="panel plot-wrap"><div id="controls" class="controls"></div><div class="canvas-shell"><canvas id="plot" aria-label="${esc(cfg.canvasLabel||cfg.title||'Интерактивная модель')}"></canvas></div><div class="legend" id="legend"></div></section><aside class="panel"><h2>Исследуйте</h2><ol class="question-list">${(cfg.tasks||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ol><h2>Что заметили</h2><div class="observation" id="observation">Измените параметр и сравните результат.</div><a class="theory-link" href="${esc(cfg.backHref||'#')}">Вернуться к теории →</a><p class="small">Модель предназначена для исследования закономерностей; точные алгебраические выводы проверяйте по формулам урока.</p></aside></div></main>`;
const controls=document.getElementById('controls'),canvas=document.getElementById('plot'),obs=document.getElementById('observation'),legend=document.getElementById('legend');
const state={};
(cfg.controls||[]).forEach(c=>{
  const box=document.createElement('div');box.className='control';
  const label=document.createElement('label');label.htmlFor='ctl-'+c.id;label.textContent=c.label;
  let input;
  if(c.type==='select'){input=document.createElement('select');(c.options||[]).forEach(o=>{const op=document.createElement('option');op.value=o.value;op.textContent=o.label;input.appendChild(op);});input.value=c.value;}
  else {input=document.createElement('input');input.type='range';input.min=c.min;input.max=c.max;input.step=c.step;input.value=c.value;}
  input.id='ctl-'+c.id;input.dataset.id=c.id;
  const output=document.createElement('output');output.htmlFor=input.id;
  const update=()=>{state[c.id]=c.type==='select'?input.value:Number(input.value);output.value=c.format?c.format(state[c.id]):String(state[c.id]);draw();};
  input.addEventListener('input',update);input.addEventListener('change',update);
  box.append(label,input,output);controls.appendChild(box);state[c.id]=c.type==='select'?c.value:Number(c.value);output.value=c.format?c.format(state[c.id]):String(state[c.id]);
});
function resize(){const dpr=window.devicePixelRatio||1,rect=canvas.getBoundingClientRect();canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
window.addEventListener('resize',resize);
function grid(ctx,w,h,xmin,xmax,ymin,ymax){
  const X=x=>(x-xmin)/(xmax-xmin)*w,Y=y=>h-(y-ymin)/(ymax-ymin)*h;
  ctx.clearRect(0,0,w,h);ctx.lineWidth=1;ctx.strokeStyle='#e7edf6';
  for(let x=Math.ceil(xmin);x<=xmax;x++){ctx.beginPath();ctx.moveTo(X(x),0);ctx.lineTo(X(x),h);ctx.stroke();}
  for(let y=Math.ceil(ymin);y<=ymax;y++){ctx.beginPath();ctx.moveTo(0,Y(y));ctx.lineTo(w,Y(y));ctx.stroke();}
  ctx.strokeStyle='#53647f';ctx.lineWidth=1.4;
  if(xmin<=0&&xmax>=0){ctx.beginPath();ctx.moveTo(X(0),0);ctx.lineTo(X(0),h);ctx.stroke();}
  if(ymin<=0&&ymax>=0){ctx.beginPath();ctx.moveTo(0,Y(0));ctx.lineTo(w,Y(0));ctx.stroke();}
  return {X,Y};
}
function curve(ctx,f,xmin,xmax,map,skip,color='#244c9c'){
  ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.beginPath();let pen=false;
  for(let i=0;i<=900;i++){const x=xmin+(xmax-xmin)*i/900,y=f(x);if(!Number.isFinite(y)||Math.abs(y)>1e3||(skip&&skip(x,y))){pen=false;continue;}const px=map.X(x),py=map.Y(y);if(py<-40||py>canvas.clientHeight+40){pen=false;continue;}if(!pen){ctx.moveTo(px,py);pen=true}else ctx.lineTo(px,py);}
  ctx.stroke();
}
function drawFunction(mode){
  const ctx=canvas.getContext('2d'),w=canvas.clientWidth,h=canvas.clientHeight,xmin=-5,xmax=5,ymin=-5,ymax=5,map=grid(ctx,w,h,xmin,xmax,ymin,ymax);
  let f,label,note,point;
  if(mode==='power'){
    const p=Number(state.p);
    f=x=>{if(Number.isInteger(p))return x**p;if(x<0)return NaN;if(x===0&&p<0)return NaN;return x**p};
    label=`y=x^${p}`;
    note=p>0?'При x>0 функция возрастает; область определения и симметрия зависят от показателя.':'Отрицательный показатель исключает x=0 и создаёт неограниченность около нуля.';
    point='(1;1)';
    curve(ctx,f,xmin,xmax,map);
  }
  if(mode==='exponential'){
    const a=Number(state.a);f=x=>a**x;label=`y=${a.toFixed(2)}^x`;note=a>1?'Основание больше 1: график возрастает.':'Основание между 0 и 1: график убывает.';point='(0;1)';
    curve(ctx,f,xmin,xmax,map);
  }
  if(mode==='logarithmic'){
    const a=Number(state.a),log=x=>x>0?Math.log(x)/Math.log(a):NaN,exp=x=>a**x;
    curve(ctx,log,xmin,xmax,map,null,'#244c9c');
    curve(ctx,exp,xmin,xmax,map,null,'#c76a48');
    ctx.save();ctx.setLineDash([6,5]);ctx.strokeStyle='#8b98ad';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(map.X(-5),map.Y(-5));ctx.lineTo(map.X(5),map.Y(5));ctx.stroke();ctx.restore();
    label=`y=log_${a.toFixed(2)} x · y=${a.toFixed(2)}^x · y=x`;
    note=(a>1?'Обе взаимно обратные функции возрастают.':'Обе взаимно обратные функции убывают.')+' Их графики симметричны относительно прямой y=x; логарифм определён только при x>0.';
    point='(1;0) для логарифма и (0;1) для экспоненты';
  }
  legend.textContent=label;obs.textContent=note+' Характерные точки: '+point+'.';
}
function drawCircle(equations){
  const ctx=canvas.getContext('2d'),w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);const cx=w/2,cy=h/2,R=Math.min(w,h)*.34;
  ctx.strokeStyle='#dce4f0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(20,cy);ctx.lineTo(w-20,cy);ctx.moveTo(cx,20);ctx.lineTo(cx,h-20);ctx.stroke();
  ctx.strokeStyle='#53647f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.stroke();
  if(!equations){
    const a=Number(state.angle);const x=Math.cos(a),y=Math.sin(a),px=cx+R*x,py=cy-R*y;
    ctx.strokeStyle='#244c9c';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(px,py);ctx.stroke();ctx.fillStyle='#244c9c';ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#9aa9be';ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(px,cy);ctx.lineTo(px,py);ctx.moveTo(cx,py);ctx.lineTo(px,py);ctx.stroke();ctx.setLineDash([]);
    legend.textContent=`α=${(a/Math.PI).toFixed(2)}π; cos α=${x.toFixed(3)}; sin α=${y.toFixed(3)}`;
    const eps=1e-9;
    let where;
    if(Math.abs(y)<eps&&x>0)where='на положительной полуоси Ox';
    else if(Math.abs(y)<eps&&x<0)where='на отрицательной полуоси Ox';
    else if(Math.abs(x)<eps&&y>0)where='на положительной полуоси Oy';
    else if(Math.abs(x)<eps&&y<0)where='на отрицательной полуоси Oy';
    else where=`в ${x>0&&y>0?'I':x<0&&y>0?'II':x<0&&y<0?'III':'IV'} четверти`;
    obs.textContent=`Точка находится ${where}. cos α — её абсцисса, sin α — ордината.`;
    return;
  }
  const fn=state.fn||'cos',a=Number(state.level);let sols=[];
  ctx.strokeStyle='#c76a48';ctx.lineWidth=2;
  if(fn==='cos'&&Math.abs(a)<=1){const px=cx+R*a;ctx.beginPath();ctx.moveTo(px,cy-R);ctx.lineTo(px,cy+R);ctx.stroke();const y=Math.sqrt(Math.max(0,1-a*a));sols=[[a,y],[a,-y]];}
  if(fn==='sin'&&Math.abs(a)<=1){const py=cy-R*a;ctx.beginPath();ctx.moveTo(cx-R,py);ctx.lineTo(cx+R,py);ctx.stroke();const x=Math.sqrt(Math.max(0,1-a*a));sols=[[x,a],[-x,a]];}
  if(fn==='tg'){const ang=Math.atan(a);sols=[[Math.cos(ang),Math.sin(ang)],[-Math.cos(ang),-Math.sin(ang)]];}
  sols=sols.filter(([x,y],i,arr)=>arr.findIndex(([u,v])=>Math.hypot(x-u,y-v)<1e-9)===i);
  ctx.fillStyle='#244c9c';sols.forEach(([x,y])=>{ctx.beginPath();ctx.arc(cx+R*x,cy-R*y,5,0,Math.PI*2);ctx.fill();});
  legend.textContent=`${fn} x = ${a.toFixed(2)} · отмечено решений на одном полном обороте: ${sols.length}`;
  obs.textContent=fn==='tg'?'Тангенс принимает любое действительное значение и повторяется через π.':(Math.abs(a)>1?`Для ${fn} x=${a.toFixed(2)} решений нет, потому что значения ${fn} лежат в [−1;1].`:`Для ${fn} условие |a|≤1 выполнено; число различных точек на одном обороте зависит от уровня a.`);
}
function drawTrig(){
  const ctx=canvas.getContext('2d'),w=canvas.clientWidth,h=canvas.clientHeight,xmin=-2*Math.PI,xmax=2*Math.PI,ymin=-2.2,ymax=2.2,map=grid(ctx,w,h,xmin,xmax,ymin,ymax);
  const fn=state.fn||'sin';let f=fn==='sin'?Math.sin:fn==='cos'?Math.cos:Math.tan;
  curve(ctx,f,xmin,xmax,map,(x,y)=>fn==='tg'&&Math.abs(Math.cos(x))<.04);
  const level=Number(state.level||0);ctx.strokeStyle='#c76a48';ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(0,map.Y(level));ctx.lineTo(w,map.Y(level));ctx.stroke();ctx.setLineDash([]);
  legend.textContent=`y=${fn} x; горизонтальный уровень y=${level.toFixed(2)}`;
  obs.textContent=fn==='tg'?'tg x имеет период π и вертикальные асимптоты x=π/2+πk.':`${fn} x имеет период 2π и множество значений [−1;1]. Пересечения с горизонтальной линией дают решения уравнения.`;
}
function draw(){if(!canvas.width)return;const mode=cfg.mode;if(['power','exponential','logarithmic'].includes(mode))drawFunction(mode);else if(mode==='unit-circle')drawCircle(false);else if(mode==='trig-equations')drawCircle(true);else if(mode==='trig-functions')drawTrig();}
resize();
})();
