(function(){
'use strict';
const NS='http://www.w3.org/2000/svg',$=id=>document.getElementById(id),svg=$('stage');
const ids=['mode','limitN','limitR','polyN','polyR','arcR','arcA','segR','segA'];
const fmt=x=>Math.abs(x)<1e-10?'0':Number(x.toFixed(3)).toString(),deg=x=>x*Math.PI/180;
const el=(name,attrs={})=>{const n=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));return n;};
function line(a,b,cls='shape'){svg.append(el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:cls}));}
function circle(c,r,cls='shape'){svg.append(el('circle',{cx:c.x,cy:c.y,r,class:cls}));}
function text(p,s,cls='label',anchor='start'){const t=el('text',{x:p.x,y:p.y,class:cls,'text-anchor':anchor});t.textContent=s;svg.append(t);}
function polygonPoints(n,c,r,offset=-Math.PI/2){return Array.from({length:n},(_,i)=>({x:c.x+r*Math.cos(offset+2*Math.PI*i/n),y:c.y+r*Math.sin(offset+2*Math.PI*i/n)}));}
function pathPoints(pts){return pts.map((p,i)=>(i?'L':'M')+' '+p.x+' '+p.y).join(' ')+' Z';}
function polygon(pts,cls='shape',fill='none'){svg.append(el('path',{d:pathPoints(pts),class:cls,fill}));}
function polar(c,r,a){return{x:c.x+r*Math.cos(a),y:c.y-r*Math.sin(a)};}
function sectorPath(c,r,a){const p0=polar(c,r,0),p1=polar(c,r,a),large=a>Math.PI?1:0;return `M ${c.x} ${c.y} L ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 0 ${p1.x} ${p1.y} Z`;}
function segmentPath(c,r,a){const p0=polar(c,r,-a/2),p1=polar(c,r,a/2),large=a>Math.PI?1:0;return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 0 ${p1.x} ${p1.y} Z`;}
function showControls(mode){document.querySelectorAll('[data-controls]').forEach(x=>x.hidden=x.dataset.controls!==mode);}
function clear(){svg.innerHTML='';}
function renderLimit(){
 const n=+$('limitN').value,R=+$('limitR').value,c={x:350,y:225},rr=155;
 $('limitNOut').textContent=n;$('limitROut').textContent=R;
 const pin=2*n*R*Math.sin(Math.PI/n),pout=2*n*R*Math.tan(Math.PI/n),C=2*Math.PI*R;
 circle(c,rr,'emph');polygon(polygonPoints(n,c,rr),'shape');polygon(polygonPoints(n,c,rr/Math.cos(Math.PI/n)),'aux');
 text({x:350,y:42},'описанный n-угольник','label','middle');text({x:350,y:442},'вписанный n-угольник','label','middle');
 $('modeTitle').textContent='Приближение окружности многоугольниками';
 $('result').textContent=`Pвп≈${fmt(pin)} · C≈${fmt(C)} · Pопис≈${fmt(pout)}`;
 $('formula').textContent='Pвп = 2nR sin(π/n) < 2πR < 2nR tan(π/n) = Pопис';
 $('explain').textContent=`При n=${n} относительная ошибка вписанного периметра ≈ ${fmt((C-pin)/C*100)}%. При росте n обе границы сходятся к одной длине.`;
}
function renderPolygon(){
 const n=+$('polyN').value,R=+$('polyR').value,c={x:350,y:230},rr=160,pts=polygonPoints(n,c,rr);
 $('polyNOut').textContent=n;$('polyROut').textContent=R;
 circle(c,rr,'aux');polygon(pts,'emph');line(c,pts[0],'radius');const mid={x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2};line(c,mid,'aux');
 const a=2*R*Math.sin(Math.PI/n),r=R*Math.cos(Math.PI/n),P=n*a,area=.5*P*r;
 text({x:c.x+8,y:c.y-8},'O','accent');text({x:mid.x+8,y:mid.y},'r','label');
 $('modeTitle').textContent='Элементы правильного n-угольника';$('result').textContent=`a≈${fmt(a)} · r≈${fmt(r)} · P≈${fmt(P)} · S≈${fmt(area)}`;
 $('formula').textContent='a = 2R sin(π/n);  r = R cos(π/n);  S = ½Pr';
 $('explain').textContent=`Центральный угол = ${fmt(360/n)}°. Увеличение R в k раз умножает a, r и P на k, а площадь на k².`;
}
function renderArc(){
 const R=+$('arcR').value,A=+$('arcA').value,phi=deg(A),c={x:350,y:235},rr=160,a=phi;
 $('arcROut').textContent=R;$('arcAOut').textContent=A+'°';
 svg.append(el('path',{d:sectorPath(c,rr,a),class:'fill-soft'}));circle(c,rr,'shape');const p0=polar(c,rr,0),p1=polar(c,rr,a);line(c,p0,'radius');line(c,p1,'radius');
 const l=R*phi,S=.5*R*R*phi;
 $('modeTitle').textContent='Дуга и сектор';$('result').textContent=`φ≈${fmt(phi)} рад · l≈${fmt(l)} · Sсект≈${fmt(S)}`;
 $('formula').textContent='φ = α·π/180;  l = Rφ;  Sсектора = ½R²φ';
 $('explain').textContent=`Угол ${A}° составляет ${fmt(A/360)} полной окружности: такую же долю составляют и длина дуги, и площадь сектора.`;
}
function renderSegment(){
 const R=+$('segR').value,A=+$('segA').value,phi=deg(A),c={x:350,y:235},rr=160;
 $('segROut').textContent=R;$('segAOut').textContent=A+'°';
 const p0=polar(c,rr,-phi/2),p1=polar(c,rr,phi/2);
 svg.append(el('path',{d:segmentPath(c,rr,phi),class:'fill-strong'}));circle(c,rr,'shape');line(p0,p1,'chord');line(c,p0,'aux');line(c,p1,'aux');
 const sector=.5*R*R*phi,tri=.5*R*R*Math.sin(phi),segm=sector-tri;
 $('modeTitle').textContent='Круговой сегмент';$('result').textContent=`Sсект≈${fmt(sector)} · S△≈${fmt(tri)} · Sсегм≈${fmt(segm)}`;
 $('formula').textContent='Sсегмента = Sсектора − S△ = ½R²(φ − sin φ)';
 $('explain').textContent=A<180?'Малый сегмент — часть сектора после удаления центрального треугольника. Его площадь положительна и меньше площади сектора.':'При 180° хорда становится диаметром, треугольник вырождается и сегмент равен половине круга.';
}
function render(){const mode=$('mode').value;showControls(mode);clear();if(mode==='limit')renderLimit();if(mode==='polygon')renderPolygon();if(mode==='arc')renderArc();if(mode==='segment')renderSegment();}
ids.map($).filter(Boolean).forEach(x=>x.addEventListener(x.tagName==='SELECT'?'change':'input',render));render();
})();