(function(){
'use strict';const NS='http://www.w3.org/2000/svg',$=id=>document.getElementById(id),svg=$('stage'),SCALE=28,O={x:350,y:230},R=5;
const el=(n,a={})=>{const x=document.createElementNS(NS,n);Object.entries(a).forEach(([k,v])=>x.setAttribute(k,String(v)));return x},fmt=x=>Number(x.toFixed(3)).toString(),w2p=([x,y])=>({x:O.x+x*SCALE,y:O.y-y*SCALE}),dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function line(a,b,cls='shape'){const A=w2p(a),B=w2p(b);svg.append(el('line',{x1:A.x,y1:A.y,x2:B.x,y2:B.y,class:cls}))}
function poly(ps,cls='shape'){svg.append(el('polygon',{points:ps.map(p=>{const q=w2p(p);return q.x+','+q.y}).join(' '),class:cls}))}
function circle(c,r,cls='circle'){const C=w2p(c);svg.append(el('circle',{cx:C.x,cy:C.y,r:r*SCALE,class:cls}))}
function point(p,s,cls='point'){const q=w2p(p);svg.append(el('circle',{cx:q.x,cy:q.y,r:4,class:cls}));const t=el('text',{x:q.x+7,y:q.y-8,class:cls==='image-point'?'accent':'label'});t.textContent=s;svg.append(t)}
function grid(){for(let x=-11;x<=11;x++){const a=w2p([x,-7]),b=w2p([x,7]);svg.append(el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:x===0?'axis':'grid'}))}for(let y=-7;y<=7;y++){const a=w2p([-12,y]),b=w2p([12,y]);svg.append(el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:y===0?'axis':'grid'}))}}
function clear(){svg.innerHTML='';grid()}
function show(mode){document.querySelectorAll('[data-controls]').forEach(x=>x.hidden=x.dataset.controls!==mode)}
function rootsLineCircle(P,ang){const d=[Math.cos(ang),Math.sin(ang)],b=2*(P[0]*d[0]+P[1]*d[1]),c=P[0]*P[0]+P[1]*P[1]-R*R,D=b*b-4*c;if(D<0)return null;const t1=(-b-Math.sqrt(D))/2,t2=(-b+Math.sqrt(D))/2;return[t1,t2].sort((a,b)=>a-b).map(t=>({t,p:[P[0]+t*d[0],P[1]+t*d[1]]}))}
function renderSimilarity(){
 const lam=+$('lambda').value,c=[+$('simCx').value,+$('simCy').value],base=[[-4,-2],[-1,-2],[-3,1]],img=base.map(p=>[c[0]+lam*(p[0]-c[0]),c[1]+lam*(p[1]-c[1])]);
 $('lambdaOut').textContent=lam;$('simCxOut').textContent=c[0];$('simCyOut').textContent=c[1];poly(base,'shape');poly(img,'image');base.forEach((p,i)=>{line(c,p,'guide');line(c,img[i],'guide');point(p,['A','B','C'][i]);point(img[i],['A′','B′','C′'][i],'image-point')});point(c,'O','special');
 const ab=dist(base[0],base[1]),ab1=dist(img[0],img[1]),area=4.5,area1=area*lam*lam;
 $('modeTitle').textContent='Преобразование подобия';$('result').textContent=`A′B′/AB=${fmt(ab1/ab)}; S′/S=${fmt(area1/area)}`;$('formula').textContent=`M′N′ = ${lam}·MN;   S′ = ${fmt(lam*lam)}·S`;$('explain').textContent='Соответственные точки лежат на лучах из O. Все длины имеют один масштаб λ, площади — λ².';
}
function renderChords(){
 const px=+$('chordP').value,a=+$('chordA').value*Math.PI/180,P=[px,0],r1=rootsLineCircle(P,0),r2=rootsLineCircle(P,a);$('chordPOut').textContent=px;$('chordAOut').textContent=+$('chordA').value+'°';circle([0,0],R);line(r1[0].p,r1[1].p,'shape');line(r2[0].p,r2[1].p,'image');point(P,'P','special');[['A',r1[0]],['B',r1[1]],['C',r2[0]],['D',r2[1]]].forEach(([n,x])=>point(x.p,n));
 const pa=Math.abs(r1[0].t),pb=Math.abs(r1[1].t),pc=Math.abs(r2[0].t),pd=Math.abs(r2[1].t);
 $('modeTitle').textContent='Пересекающиеся хорды';$('result').textContent=`PA·PB≈${fmt(pa*pb)}; PC·PD≈${fmt(pc*pd)}`;$('formula').textContent='PA·PB = PC·PD = R² − OP²';$('explain').textContent='Поворот второй хорды меняет четыре длины, но произведение частей каждой хорды остаётся одинаковым.';
}
function renderSecants(){
 const op=+$('secP').value,dev=+$('secA').value*Math.PI/180,P=[op,0],r1=rootsLineCircle(P,Math.PI),r2=rootsLineCircle(P,Math.PI+dev);$('secPOut').textContent=op;$('secAOut').textContent=+$('secA').value+'°';circle([0,0],R);const s1=r1.filter(x=>x.t>0),s2=r2.filter(x=>x.t>0);line(P,s1[1].p,'shape');line(P,s2[1].p,'image');point(P,'P','special');[['A',s1[0]],['B',s1[1]],['C',s2[0]],['D',s2[1]]].forEach(([n,x])=>point(x.p,n));
 const pa=s1[0].t,pb=s1[1].t,pc=s2[0].t,pd=s2[1].t;$('modeTitle').textContent='Две секущие';$('result').textContent=`PA·PB≈${fmt(pa*pb)}; PC·PD≈${fmt(pc*pd)}`;$('formula').textContent='PA·PB = PC·PD = OP² − R²';$('explain').textContent='PA и PC — внешние части; PB и PD — полные отрезки от P до дальних точек окружности.';
}
function tangentPoint(P,upper=true){const d=Math.hypot(P[0],P[1]),base=Math.atan2(P[1],P[0]),alpha=Math.acos(R/d),th=base+(upper?alpha:-alpha);return[R*Math.cos(th),R*Math.sin(th)]}
function renderTangent(){
 const op=+$('tanP').value,dev=+$('tanA').value*Math.PI/180,P=[op,0],T=tangentPoint(P,true),r=rootsLineCircle(P,Math.PI+dev).filter(x=>x.t>0);$('tanPOut').textContent=op;$('tanAOut').textContent=+$('tanA').value+'°';circle([0,0],R);line(P,T,'image');line(P,r[1].p,'shape');line([0,0],T,'guide');point(P,'P','special');point(T,'T','image-point');point(r[0].p,'A');point(r[1].p,'B');
 const pt=dist(P,T),pa=r[0].t,pb=r[1].t;$('modeTitle').textContent='Касательная и секущая';$('result').textContent=`PT²≈${fmt(pt*pt)}; PA·PB≈${fmt(pa*pb)}`;$('formula').textContent='PT² = PA·PB = OP² − R²';$('explain').textContent='OT перпендикулярен PT. При изменении направления секущей произведение PA·PB остаётся равным квадрату касательной.';
}
function render(){const m=$('mode').value;show(m);clear();if(m==='similarity')renderSimilarity();if(m==='chords')renderChords();if(m==='secants')renderSecants();if(m==='tangent')renderTangent()}
['mode','lambda','simCx','simCy','chordP','chordA','secP','secA','tanP','tanA'].forEach(id=>$(id).addEventListener($(id).tagName==='SELECT'?'change':'input',render));render();
})();