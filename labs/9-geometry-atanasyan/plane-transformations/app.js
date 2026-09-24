(function(){
'use strict';const NS='http://www.w3.org/2000/svg',$=id=>document.getElementById(id),svg=$('stage'),unit=42,origin={x:350,y:235};
const base=[[-3,-1],[0,-1],[-2,2]],names=['A','B','C'];
const el=(name,a={})=>{const n=document.createElementNS(NS,name);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,String(v)));return n},pt=([x,y])=>({x:origin.x+x*unit,y:origin.y-y*unit}),fmt=n=>Math.abs(n)<1e-9?'0':Number(n.toFixed(2)).toString(),dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function line(a,b,cls){const A=pt(a),B=pt(b);svg.append(el('line',{x1:A.x,y1:A.y,x2:B.x,y2:B.y,class:cls}))}
function poly(points,cls){svg.append(el('polygon',{points:points.map(p=>{const q=pt(p);return q.x+','+q.y}).join(' '),class:cls}))}
function label(p,s,cls='label'){const q=pt(p),t=el('text',{x:q.x+8,y:q.y-8,class:cls});t.textContent=s;svg.append(t)}
function grid(){for(let x=-7;x<=7;x++){const p=pt([x,-5]),q=pt([x,5]);svg.append(el('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,class:x===0?'axis':'grid'}))}for(let y=-5;y<=5;y++){const p=pt([-8,y]),q=pt([8,y]);svg.append(el('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,class:y===0?'axis':'grid'}))}}
function draw(points,cls,labelCls,suffix=''){poly(points,cls);points.forEach((p,i)=>{const q=pt(p);svg.append(el('circle',{cx:q.x,cy:q.y,r:3.5,class:labelCls==='accent'?'image-point':'point'}));label(p,names[i]+suffix,labelCls)})}
function rotation(p,c,a){const t=a*Math.PI/180,x=p[0]-c[0],y=p[1]-c[1];return[c[0]+x*Math.cos(t)-y*Math.sin(t),c[1]+x*Math.sin(t)+y*Math.cos(t)]}
function outputs(prefix,vals){Object.entries(vals).forEach(([k,v])=>{const o=$(prefix+k+'Out');if(o)o.textContent=v})}
function clear(){svg.innerHTML='';grid()}
function invariant(img){return `AB=${fmt(dist(base[0],base[1]))}; A′B′=${fmt(dist(img[0],img[1]))}`}
function renderTranslation(){
 const dx=+$('dx').value,dy=+$('dy').value;outputs('',{dx,dy});const img=base.map(([x,y])=>[x+dx,y+dy]);draw(base,'shape','label');draw(img,'image','accent','′');base.forEach((p,i)=>line(p,img[i],'move'));
 $('modeTitle').textContent='Параллельный перенос';$('invariant').textContent=invariant(img);$('formula').textContent=`(x;y) → (x${dx>=0?'+':''}${dx}; y${dy>=0?'+':''}${dy})`;$('explain').textContent=dx||dy?'Все вершины смещены одним вектором. У ненулевого переноса неподвижных точек нет.':'Нулевой вектор даёт тождественное отображение: каждая точка неподвижна.';
}
function renderRotation(){
 const a=+$('angle').value,c=[+$('cx').value,+$('cy').value];outputs('',{angle:a+'°',cx:c[0],cy:c[1]});const img=base.map(p=>rotation(p,c,a));draw(base,'shape','label');draw(img,'image','accent','′');base.forEach((p,i)=>{line(c,p,'guide');line(c,img[i],'guide')});const q=pt(c);svg.append(el('circle',{cx:q.x,cy:q.y,r:5,class:'center'}));label(c,'O','accent');
 $('modeTitle').textContent='Поворот';$('invariant').textContent=invariant(img);$('formula').textContent=`O=(${c[0]};${c[1]}), α=${a}°; OP=OP′`;$('explain').textContent=a%360===0?'При полном обороте все точки неподвижны.':'Центр O неподвижен; каждая вершина движется по окружности с центром O.';
}
function renderReflection(){
 const c=+$('axis').value;outputs('',{axis:c});const img=base.map(([x,y])=>[2*c-x,y]);draw(base,'shape','label');draw(img,'image','accent','′');line([c,-5],[c,5],'guide');base.forEach((p,i)=>line(p,img[i],'move'));
 $('modeTitle').textContent='Осевая симметрия';$('invariant').textContent=invariant(img);$('formula').textContent=`x′=2·${c}−x, y′=y`;$('explain').textContent='Ось x=c является серединным перпендикуляром к каждому отрезку PP′. Точки, уже лежащие на оси, неподвижны.';
}
function renderComposition(){
 const dx=+$('cdx').value,dy=+$('cdy').value,a=+$('cangle').value;outputs('c',{dx,dy,angle:a+'°'});const mid=base.map(([x,y])=>[x+dx,y+dy]),img=mid.map(p=>rotation(p,[0,0],a));draw(base,'shape','label');draw(mid,'middle','label','₁');draw(img,'image','accent','″');line(base[0],mid[0],'move');line([0,0],mid[0],'guide');line([0,0],img[0],'guide');
 $('modeTitle').textContent='Композиция: перенос → поворот';$('invariant').textContent=`AB=${fmt(dist(base[0],base[1]))}; A″B″=${fmt(dist(img[0],img[1]))}`;$('formula').textContent=`1) +(${dx};${dy});  2) поворот ${a}° вокруг O`;$('explain').textContent='Промежуточный образ показан пунктиром. Второе движение применяется именно к нему; смена порядка обычно меняет итог.';
}
function show(mode){document.querySelectorAll('[data-controls]').forEach(x=>x.hidden=x.dataset.controls!==mode)}
function render(){const m=$('mode').value;show(m);clear();if(m==='translation')renderTranslation();if(m==='rotation')renderRotation();if(m==='reflection')renderReflection();if(m==='composition')renderComposition()}
['mode','dx','dy','angle','cx','cy','axis','cdx','cdy','cangle'].forEach(id=>$(id).addEventListener($(id).tagName==='SELECT'?'change':'input',render));render();
})();