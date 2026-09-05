(function(){
'use strict';
const svg=document.getElementById('plot'),passport=document.getElementById('passport'),questions=document.getElementById('questions'),legend=document.getElementById('legend');
const tabs=[...document.querySelectorAll('[data-mode]')],controls=[...document.querySelectorAll('[data-controls]')];
let mode='parabola'; const W=720,H=700,xmin=-8,xmax=8,ymin=-8,ymax=8;
const sx=x=>60+(x-xmin)/(xmax-xmin)*(W-120), sy=y=>H-50-(y-ymin)/(ymax-ymin)*(H-100);
const val=id=>Number(document.getElementById(id).value), esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function linePath(fn){let d='';for(let i=0;i<=320;i++){const x=xmin+(xmax-xmin)*i/320,y=fn(x);const cmd=i?'L':'M';d+=`${cmd}${sx(x).toFixed(1)},${sy(y).toFixed(1)} `;}return d}
function grid(){
 let s=`<rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>`;
 for(let x=Math.ceil(xmin);x<=xmax;x++)s+=`<line x1="${sx(x)}" y1="${sy(ymin)}" x2="${sx(x)}" y2="${sy(ymax)}" stroke="${x===0?'#65728a':'#e8ecf3'}" stroke-width="${x===0?1.8:1}"/>`;
 for(let y=Math.ceil(ymin);y<=ymax;y++)s+=`<line x1="${sx(xmin)}" y1="${sy(y)}" x2="${sx(xmax)}" y2="${sy(y)}" stroke="${y===0?'#65728a':'#e8ecf3'}" stroke-width="${y===0?1.8:1}"/>`;
 for(let x=-8;x<=8;x+=2)if(x!==0)s+=`<text x="${sx(x)}" y="${sy(0)+18}" text-anchor="middle" font-size="11" fill="#66738b">${x}</text>`;
 for(let y=-6;y<=6;y+=2)if(y!==0)s+=`<text x="${sx(0)-9}" y="${sy(y)+4}" text-anchor="end" font-size="11" fill="#66738b">${y}</text>`;
 return s;
}
function dot(x,y,label=''){
 if(x<xmin||x>xmax||y<ymin||y>ymax)return'';
 return `<circle cx="${sx(x)}" cy="${sy(y)}" r="5" fill="#172238"/><text x="${sx(x)+8}" y="${sy(y)-8}" font-size="12" font-weight="700" fill="#172238">${esc(label)}</text>`;
}
function fmt(n){if(Math.abs(n)<1e-9)n=0;return Number.isInteger(n)?String(n):String(Math.round(n*100)/100).replace('.',',')}
function setPassport(rows){passport.innerHTML='<dl>'+rows.map(([a,b])=>`<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')+'</dl>'}
function setQuestions(items){questions.innerHTML=items.map(x=>`<li>${esc(x)}</li>`).join('')}
function renderParabola(){
 const m=val('pm'),b=val('pb'),c=val('pc'); ['pm','pb','pc'].forEach(id=>document.getElementById(id+'v').textContent=fmt(val(id)));
 const D=m*m-4*(c-b); let pts=[]; let status;
 if(D>1e-9){const d=Math.sqrt(D),x1=(m-d)/2,x2=(m+d)/2;pts=[[x1,x1*x1+c],[x2,x2*x2+c]];status='2 решения';}
 else if(Math.abs(D)<=1e-9){const x=m/2;pts=[[x,x*x+c]];status='1 решение (касание)';}
 else status='нет решений';
 svg.innerHTML=grid()+`<path d="${linePath(x=>x*x+c)}" fill="none" stroke="#2f6fed" stroke-width="3"/><path d="${linePath(x=>m*x+b)}" fill="none" stroke="#ed7a2f" stroke-width="3"/>`+pts.map((p,i)=>dot(p[0],p[1],`P${i+1}`)).join('');
 setPassport([['Парабола',`y=x²${c>=0?'+':''}${fmt(c)}`],['Прямая',`y=${fmt(m)}x${b>=0?'+':''}${fmt(b)}`],['D',fmt(D)],['Число решений',status],['Точки',pts.length?pts.map(p=>`(${fmt(p[0])};${fmt(p[1])})`).join(' · '):'—']]);
 setQuestions(['Измените b так, чтобы D=0. Что произошло с двумя точками?','Сделайте D<0. Где находится прямая относительно параболы?','Сопоставьте число корней квадратного уравнения и число общих точек.']);
 legend.textContent='Синяя кривая — парабола; оранжевая — прямая; тёмные точки — решения системы.';
}
function renderLines(){
 const m1=val('m1'),b1=val('b1'),m2=val('m2'),b2=val('b2'); ['m1','b1','m2','b2'].forEach(id=>document.getElementById(id+'v').textContent=fmt(val(id)));
 let status,pts=[];
 if(Math.abs(m1-m2)>1e-9){const x=(b2-b1)/(m1-m2),y=m1*x+b1;pts=[[x,y]];status='1 решение';}
 else if(Math.abs(b1-b2)<=1e-9)status='бесконечно много решений';
 else status='нет решений';
 svg.innerHTML=grid()+`<path d="${linePath(x=>m1*x+b1)}" fill="none" stroke="#2f6fed" stroke-width="3"/><path d="${linePath(x=>m2*x+b2)}" fill="none" stroke="#ed7a2f" stroke-width="3"/>`+pts.map(p=>dot(p[0],p[1],'P')).join('');
 setPassport([['Первая прямая',`y=${fmt(m1)}x${b1>=0?'+':''}${fmt(b1)}`],['Вторая прямая',`y=${fmt(m2)}x${b2>=0?'+':''}${fmt(b2)}`],['m₁−m₂',fmt(m1-m2)],['Число решений',status],['Общая точка',pts.length?`(${fmt(pts[0][0])};${fmt(pts[0][1])})`:'—']]);
 setQuestions(['Сделайте m₁=m₂, но b₁≠b₂. Как изменилось число решений?','Теперь сделайте и b₁=b₂. Почему решений стало бесконечно много?','Верните m₁≠m₂. Почему единственная точка восстанавливается алгебраически?']);
 legend.textContent='Синяя и оранжевая прямые показывают три возможных случая линейной системы.';
}
function halfPlanePolygon(k,b,side){
 const pts=[]; for(let x=xmin;x<=xmax;x+=(xmax-xmin)/80){const y=k*x+b;pts.push([sx(x),sy(y)])}
 if(side==='above'){pts.unshift([sx(xmin),sy(ymax)]);pts.push([sx(xmax),sy(ymax)])}
 else {pts.unshift([sx(xmin),sy(ymin)]);pts.push([sx(xmax),sy(ymin)])}
 return pts.map(p=>p.join(',')).join(' ');
}
function renderRegions(){
 const r=val('r'),k=val('k'),b=val('lb'),side=document.getElementById('side').value,strict=document.getElementById('strict').value;
 document.getElementById('rv').textContent=fmt(r);document.getElementById('kv').textContent=fmt(k);document.getElementById('lbv').textContent=fmt(b);
 const clip=`clip_${Math.random().toString(36).slice(2)}`;
 const poly=halfPlanePolygon(k,b,side), dash=strict==='open'?'8 6':'0';
 svg.innerHTML=grid()+`<defs><clipPath id="${clip}"><circle cx="${sx(0)}" cy="${sy(0)}" r="${Math.abs(sx(r)-sx(0))}"/></clipPath></defs>
 <circle cx="${sx(0)}" cy="${sy(0)}" r="${Math.abs(sx(r)-sx(0))}" fill="#2f6fed" fill-opacity=".16" stroke="#2f6fed" stroke-width="3"/>
 <polygon points="${poly}" fill="#ed7a2f" fill-opacity=".16"/>
 <polygon points="${poly}" fill="#6d4bc3" fill-opacity=".28" clip-path="url(#${clip})"/>
 <path d="${linePath(x=>k*x+b)}" fill="none" stroke="#ed7a2f" stroke-width="3" stroke-dasharray="${dash}"/>`;
 const inside0=0<=r*r;
 const line0=side==='above'?(strict==='open'?0>b:0>=b):(strict==='open'?0<b:0<=b);
 setPassport([['Круг',`x²+y²≤${fmt(r*r)}`],['Полуплоскость',`y ${side==='above'?(strict==='open'?'>':'≥'):(strict==='open'?'<':'≤')} ${fmt(k)}x${b>=0?'+':''}${fmt(b)}`],['Радиус',fmt(r)],['Точка (0;0)',inside0&&line0?'в пересечении':'вне пересечения'],['Граница прямой',strict==='open'?'исключена':'включена']]);
 setQuestions(['Изменяйте b: когда общая область становится очень малой?','Переключите сторону полуплоскости. Как меняется пересечение?','Смените нестрогую границу на строгую: изменяется площадь области или только принадлежность границы?']);
 legend.textContent='Синяя заливка — круг; оранжевая — полуплоскость; более тёмная зона — их пересечение.';
}
function render(){if(mode==='parabola')renderParabola();else if(mode==='lines')renderLines();else renderRegions();}
tabs.forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.mode;tabs.forEach(b=>b.classList.toggle('active',b===btn));controls.forEach(c=>c.hidden=c.dataset.controls!==mode);render();}));
document.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',render));
render();
})();
