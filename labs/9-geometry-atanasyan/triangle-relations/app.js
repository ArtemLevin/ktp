(function(){
'use strict';
const NS='http://www.w3.org/2000/svg',$=id=>document.getElementById(id),svg=$('stage');
const ids=['mode','alpha','p','q','cAngle','A','B','sideA','u','v','phi'];
const deg=x=>x*Math.PI/180,fmt=x=>Math.abs(x)<1e-10?'0':Number(x.toFixed(2)).toString();
const el=(name,attrs={})=>{const n=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));return n;};
function line(a,b,cls='shape',arrow=false){svg.append(el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:cls,...(arrow?{'marker-end':'url(#arrow)'}:{})}));}
function text(p,value,cls='label',anchor='start'){const t=el('text',{x:p.x,y:p.y,class:cls,'text-anchor':anchor});t.textContent=value;svg.append(t);}
function circle(p,r,cls='point'){svg.append(el('circle',{cx:p.x,cy:p.y,r,class:cls}));}
function defs(){const d=el('defs'),m=el('marker',{id:'arrow',viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'});m.append(el('path',{d:'M0 0 L10 5 L0 10z',fill:'context-stroke'}));d.append(m);svg.append(d);}
function axes(o,scale){for(let i=-4;i<=4;i++){line({x:o.x+i*scale,y:50},{x:o.x+i*scale,y:390},'grid');line({x:70,y:o.y+i*scale},{x:610,y:o.y+i*scale},'grid');}line({x:70,y:o.y},{x:610,y:o.y},'axis');line({x:o.x,y:390},{x:o.x,y:50},'axis');}
function showControls(mode){document.querySelectorAll('[data-controls]').forEach(x=>x.hidden=x.dataset.controls!==mode);}
function renderTrig(){
 const a=+$('alpha').value,r=145,o={x:340,y:285},M={x:o.x+r*Math.cos(deg(a)),y:o.y-r*Math.sin(deg(a))},H={x:M.x,y:o.y};
 $('alphaOut').textContent=a+'°';axes(o,52);svg.append(el('path',{d:`M ${o.x-r} ${o.y} A ${r} ${r} 0 0 1 ${o.x+r} ${o.y}`,class:'shape'}));line(o,M,'emph',true);line(M,H,'aux');circle(M,4);text({x:M.x+8,y:M.y-8},'M','accent');
 const si=Math.sin(deg(a)),co=Math.cos(deg(a)),ta=Math.abs(co)<1e-9?null:si/co;
 $('modeTitle').textContent='Sin, cos и угол';$('result').textContent=`sin α = ${fmt(si)} · cos α = ${fmt(co)}`; $('formula').textContent=ta==null?'tg α не определён: cos α = 0':`tg α = sin α / cos α = ${fmt(ta)}`;
 $('explain').textContent=co>1e-9?'Угол острый: sin и cos положительны.':co<-1e-9?'Угол тупой: sin положителен, cos отрицателен.':'При 90° cos равен нулю, поэтому tg не определён.';
}
function renderTriangle(){
 const p=+$('p').value,q=+$('q').value,C=+$('cAngle').value;
 $('pOut').textContent=p;$('qOut').textContent=q;$('cAngleOut').textContent=C+'°';
 const d=Math.sqrt(p*p+q*q-2*p*q*Math.cos(deg(C))),S=.5*p*q*Math.sin(deg(C));
 const O={x:120,y:330},scale=Math.min(42,410/Math.max(p,q,d)),A={x:O.x+p*scale,y:O.y},B={x:O.x+q*scale*Math.cos(deg(C)),y:O.y-q*scale*Math.sin(deg(C))};
 line(O,A,'shape');line(O,B,'shape');line(A,B,'emph');circle(O,4);circle(A,4);circle(B,4);text({x:O.x-14,y:O.y+22},'C');text({x:A.x+7,y:A.y+4},'A');text({x:B.x+6,y:B.y-8},'B');
 $('modeTitle').textContent='Две стороны и включённый угол';$('result').textContent=`третья сторона ≈ ${fmt(d)} · S ≈ ${fmt(S)}`; $('formula').textContent=`d² = p² + q² − 2pq cos C;   S = ½pq sin C`;
 $('explain').textContent=C<90?'C острый: cos C > 0, поэтому поправка в теореме косинусов уменьшает d².':C>90?'C тупой: cos C < 0, поэтому d² становится больше p²+q².':'При C=90° теорема косинусов превращается в теорему Пифагора.';
}
function renderSine(){
 const A=+$('A').value,B=+$('B').value,a=+$('sideA').value,C=180-A-B;
 $('AOut').textContent=A+'°';$('BOut').textContent=B+'°';$('sideAOut').textContent=a;
 const b=a*Math.sin(deg(B))/Math.sin(deg(A)),c=a*Math.sin(deg(C))/Math.sin(deg(A)),R=a/(2*Math.sin(deg(A)));
 const O={x:100,y:335},scale=Math.min(40,430/Math.max(b,c,a)),P={x:O.x+c*scale,y:O.y},Q={x:O.x+b*scale*Math.cos(deg(A)),y:O.y-b*scale*Math.sin(deg(A))};
 line(O,P,'shape');line(O,Q,'shape');line(P,Q,'emph');circle(O,4);circle(P,4);circle(Q,4);text({x:O.x-15,y:O.y+22},'A');text({x:P.x+7,y:P.y+4},'B');text({x:Q.x+5,y:Q.y-8},'C');
 $('modeTitle').textContent='Теорема синусов';$('result').textContent=`C=${C}° · b≈${fmt(b)} · c≈${fmt(c)} · R≈${fmt(R)}`; $('formula').textContent='a/sin A = b/sin B = c/sin C = 2R';
 const pairs=[{ang:A,side:a,name:'a'},{ang:B,side:b,name:'b'},{ang:C,side:c,name:'c'}].sort((x,y)=>x.ang-y.ang);
 $('explain').textContent=`Углы и противоположные стороны сохраняют один порядок: напротив меньшего угла ${pairs[0].ang}° лежит меньшая сторона ${pairs[0].name}.`;
}
function renderDot(){
 const u=+$('u').value,v=+$('v').value,phi=+$('phi').value,dot=u*v*Math.cos(deg(phi)),o={x:130,y:320},scale=50,U={x:o.x+u*scale,y:o.y},V={x:o.x+v*scale*Math.cos(deg(phi)),y:o.y-v*scale*Math.sin(deg(phi))};
 $('uOut').textContent=u;$('vOut').textContent=v;$('phiOut').textContent=phi+'°';line(o,U,'vec',true);line(o,V,'emph',true);circle(o,4);text({x:U.x-5,y:U.y-12},'u⃗','label','end');text({x:V.x+8,y:V.y-8},'v⃗','accent');
 const type=dot>1e-9?'острый':dot<-1e-9?'тупой':'прямой';
 $('modeTitle').textContent='Скалярное произведение';$('result').textContent=`u⃗·v⃗ = ${fmt(dot)} · угол ${type}`; $('formula').textContent=`u⃗·v⃗ = |u⃗||v⃗|cos φ = ${fmt(u)}·${fmt(v)}·cos ${phi}°`;
 $('explain').textContent=dot>1e-9?'Положительный результат соответствует острому углу.':dot<-1e-9?'Отрицательный результат соответствует тупому углу.':'Нулевое произведение двух ненулевых векторов означает перпендикулярность.';
}
function render(){const mode=$('mode').value;showControls(mode);svg.innerHTML='';defs();if(mode==='trig')renderTrig();if(mode==='triangle')renderTriangle();if(mode==='sine')renderSine();if(mode==='dot')renderDot();}
ids.map($).filter(Boolean).forEach(x=>x.addEventListener(x.tagName==='SELECT'?'change':'input',render));render();
})();