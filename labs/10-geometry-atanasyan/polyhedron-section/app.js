(function(){
'use strict';
const NS='http://www.w3.org/2000/svg',DEG=Math.PI/180,EPS=1e-8;
const dims={a:8,b:6,c:6};
const $=id=>document.getElementById(id);
const ui={
  p:$('p'),q:$('q'),r:$('r'),yaw:$('yaw'),pitch:$('pitch'),labels:$('labels'),planePatch:$('planePatch'),
  pOut:$('pOut'),qOut:$('qOut'),rOut:$('rOut'),yawOut:$('yawOut'),pitchOut:$('pitchOut'),
  count:$('count'),area:$('area'),perimeter:$('perimeter'),kind:$('kind'),
  equation:$('equation'),edgeList:$('edgeList'),faceList:$('faceList'),stage:$('stage'),
  presetParallel:$('presetParallel'),presetTriangle:$('presetTriangle'),presetPentagon:$('presetPentagon'),reset:$('reset')
};
const add=(a,b)=>a.map((x,i)=>x+b[i]);
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const mul=(a,k)=>a.map(x=>x*k);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>Math.hypot(...a);
const unit=a=>{const n=norm(a)||1;return a.map(x=>x/n);};
const dist=(a,b)=>norm(sub(a,b));
const fmt=n=>Math.abs(n)<1e-10?'0':Number(n).toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1');
const el=(name,attrs={})=>{const n=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));return n;};

const V={
  A:[0,0,0],B:[dims.a,0,0],C:[dims.a,dims.b,0],D:[0,dims.b,0],
  A1:[0,0,dims.c],B1:[dims.a,0,dims.c],C1:[dims.a,dims.b,dims.c],D1:[0,dims.b,dims.c]
};
const edges=[
  ['A','B'],['B','C'],['C','D'],['D','A'],
  ['A1','B1'],['B1','C1'],['C1','D1'],['D1','A1'],
  ['A','A1'],['B','B1'],['C','C1'],['D','D1']
];

function planeData(){
  const p=Number(ui.p.value),q=Number(ui.q.value),r=Number(ui.r.value);
  const P=[0,0,p],Q=[dims.a,0,q],R=[0,dims.b,r];
  const n=cross(sub(Q,P),sub(R,P));
  return{P,Q,R,n,d:-dot(n,P),p,q,r};
}
function addUnique(list,p){
  if(!list.some(q=>dist(p,q)<1e-7))list.push(p);
}
function sectionPoints(pl){
  const pts=[];
  for(const [na,nb] of edges){
    const A=V[na],B=V[nb];
    const fa=dot(pl.n,A)+pl.d,fb=dot(pl.n,B)+pl.d;
    if(Math.abs(fa)<EPS&&Math.abs(fb)<EPS){addUnique(pts,A);addUnique(pts,B);continue;}
    if(Math.abs(fa)<EPS){addUnique(pts,A);continue;}
    if(Math.abs(fb)<EPS){addUnique(pts,B);continue;}
    if(fa*fb<0){
      const t=fa/(fa-fb);
      if(t>-EPS&&t<1+EPS)addUnique(pts,add(A,mul(sub(B,A),t)));
    }
  }
  return sortInPlane(pts,pl.n);
}
function basis(normal){
  const n=unit(normal);
  const ref=Math.abs(n[2])<.9?[0,0,1]:[0,1,0];
  const u=unit(cross(n,ref));
  const v=unit(cross(n,u));
  return{n,u,v};
}
function sortInPlane(pts,normal){
  if(pts.length<3)return pts;
  const center=pts.reduce((s,p)=>add(s,p),[0,0,0]).map(x=>x/pts.length);
  const {u,v}=basis(normal);
  return [...pts].sort((a,b)=>{
    const da=sub(a,center),db=sub(b,center);
    return Math.atan2(dot(da,v),dot(da,u))-Math.atan2(dot(db,v),dot(db,u));
  });
}
function sectionMetrics(pts,normal){
  if(pts.length<3)return{area:0,perimeter:0};
  const center=pts.reduce((s,p)=>add(s,p),[0,0,0]).map(x=>x/pts.length);
  const {u,v}=basis(normal);
  const xy=pts.map(p=>{const d=sub(p,center);return[dot(d,u),dot(d,v)];});
  let twice=0,per=0;
  for(let i=0;i<pts.length;i++){
    const j=(i+1)%pts.length;
    twice+=xy[i][0]*xy[j][1]-xy[j][0]*xy[i][1];
    per+=dist(pts[i],pts[j]);
  }
  return{area:Math.abs(twice)/2,perimeter:per};
}
function edgeNamesForPoint(p){
  const names=[];
  for(const [a,b] of edges){
    const A=V[a],B=V[b],ab=sub(B,A),ap=sub(p,A);
    const den=dot(ab,ab);
    const t=den?dot(ap,ab)/den:0;
    const proj=add(A,mul(ab,t));
    if(t>-EPS&&t<1+EPS&&dist(proj,p)<1e-6)names.push(a+b);
  }
  return names;
}
function faceName(a,b){
  const tests=[
    ['x=0',0,0],['x=8',0,dims.a],['y=0',1,0],['y=6',1,dims.b],['z=0',2,0],['z=6',2,dims.c]
  ];
  const names=tests.filter(([,axis,value])=>Math.abs(a[axis]-value)<1e-6&&Math.abs(b[axis]-value)<1e-6).map(x=>x[0]);
  return names.length?names.join(' / '):'проверить';
}
function project(p){
  const center=[dims.a/2,dims.b/2,dims.c/2];
  const d=sub(p,center);
  const yaw=Number(ui.yaw.value)*DEG,pitch=Number(ui.pitch.value)*DEG;
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  const x1=d[0]*cy-d[1]*sy,y1=d[0]*sy+d[1]*cy,z1=d[2];
  const y2=y1*cp-z1*sp,depth=y1*sp+z1*cp;
  return{x:360+43*x1,y:245-43*y2,depth};
}
function svgLine(svg,a,b,cls){svg.append(el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:cls}));}
function svgText(svg,p,text,cls='label',dx=7,dy=-7){const t=el('text',{x:p.x+dx,y:p.y+dy,class:cls});t.textContent=text;svg.append(t);}
function planePatchPoints(pl,pts){
  const center=pts.length?pts.reduce((s,p)=>add(s,p),[0,0,0]).map(x=>x/pts.length):[dims.a/2,dims.b/2,dims.c/2];
  const {u,v}=basis(pl.n);
  const ru=5.4,rv=4.1;
  return[
    add(add(center,mul(u,-ru)),mul(v,-rv)),
    add(add(center,mul(u, ru)),mul(v,-rv)),
    add(add(center,mul(u, ru)),mul(v, rv)),
    add(add(center,mul(u,-ru)),mul(v, rv))
  ];
}
function kind(n){return({3:'треугольник',4:'четырёхугольник',5:'пятиугольник',6:'шестиугольник'})[n]||n+'-угольник';}

function render(){
  const pl=planeData(),pts=sectionPoints(pl),metrics=sectionMetrics(pts,pl.n),svg=ui.stage;
  [...svg.querySelectorAll(':scope > :not(title):not(desc)')].forEach(n=>n.remove());

  const faces=[
    ['A','B','B1','A1'],['B','C','C1','B1'],['C','D','D1','C1'],['D','A','A1','D1'],['A1','B1','C1','D1']
  ];
  for(const face of faces){
    const pp=face.map(x=>project(V[x]));
    svg.append(el('polygon',{points:pp.map(p=>p.x+','+p.y).join(' '),class:'box-face'}));
  }

  if(ui.planePatch.checked&&pts.length>=3){
    const pp=planePatchPoints(pl,pts).map(project);
    svg.append(el('polygon',{points:pp.map(p=>p.x+','+p.y).join(' '),class:'plane'}));
  }

  for(let i=0;i<edges.length;i++){
    const [a,b]=edges[i],pa=project(V[a]),pb=project(V[b]);
    svgLine(svg,pa,pb,'edge '+(i===2||i===3||i===7||i===11?'hidden':''));
  }

  if(pts.length>=3){
    const pp=pts.map(project);
    svg.append(el('polygon',{points:pp.map(p=>p.x+','+p.y).join(' '),class:'section'}));
    pp.forEach((p,i)=>{
      svg.append(el('circle',{cx:p.x,cy:p.y,r:5,class:'point'}));
      if(ui.labels.checked)svgText(svg,p,String.fromCharCode(77+i));
    });
  }

  for(const [seed,name] of [[pl.P,'P'],[pl.Q,'Q'],[pl.R,'R']]){
    const p=project(seed);
    svg.append(el('circle',{cx:p.x,cy:p.y,r:5,class:'seed'}));
    if(ui.labels.checked)svgText(svg,p,name,'seed-label',8,15);
  }

  ui.pOut.textContent=fmt(pl.p);ui.qOut.textContent=fmt(pl.q);ui.rOut.textContent=fmt(pl.r);
  ui.yawOut.textContent=(String(Number(ui.yaw.value))+'°').replace('-','−');
  ui.pitchOut.textContent=String(Number(ui.pitch.value))+'°';
  ui.count.textContent=String(pts.length);
  ui.area.textContent=fmt(metrics.area);
  ui.perimeter.textContent=fmt(metrics.perimeter);
  ui.kind.textContent=kind(pts.length);

  const ax=(pl.q-pl.p)/dims.a,by=(pl.r-pl.p)/dims.b;
  ui.equation.textContent='z = '+fmt(pl.p)+(ax>=0?' + ':' − ')+fmt(Math.abs(ax))+'x'+(by>=0?' + ':' − ')+fmt(Math.abs(by))+'y';
  ui.edgeList.textContent=pts.map((p,i)=>String.fromCharCode(77+i)+': '+edgeNamesForPoint(p).join('/')).join('; ');
  ui.faceList.textContent=pts.map((p,i)=>faceName(p,pts[(i+1)%pts.length])).join(' → ');
}

for(const x of [ui.p,ui.q,ui.r,ui.yaw,ui.pitch,ui.labels,ui.planePatch])x.addEventListener('input',render);
function preset(p,q,r){
  ui.p.value=p;ui.q.value=q;ui.r.value=r;render();
}
ui.presetParallel.addEventListener('click',()=>preset(3,3,3));
ui.presetTriangle.addEventListener('click',()=>preset(1,6,6));
ui.presetPentagon.addEventListener('click',()=>preset(1,5,4));
ui.reset.addEventListener('click',()=>{ui.yaw.value=-35;ui.pitch.value=25;ui.labels.checked=true;ui.planePatch.checked=true;preset(1,5,4);ui.p.focus();});
render();
})();