(function(){
'use strict';

const NS='http://www.w3.org/2000/svg';
const root=document.body;
const key=`${root?.dataset?.row||''}::${Number(root?.dataset?.topic)}`;
const content=window.KTP_CONTENT?.[key];
const scenes=content?.geometryScenes;
if(!scenes||typeof scenes!=='object')return;

const num=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
const el=(name,attrs={})=>{
  const node=document.createElementNS(NS,name);
  for(const [k,v] of Object.entries(attrs)){
    if(v==null)continue;
    node.setAttribute(k,String(v));
  }
  return node;
};
const htmlEl=(name,cls,text)=>{
  const node=document.createElement(name);
  if(cls)node.className=cls;
  if(text!=null)node.textContent=text;
  return node;
};
const point=(scene,name)=>{
  const p=scene.points?.[name];
  if(!Array.isArray(p)||p.length<2)throw new Error(`geometry scene ${scene.id}: point ${name} missing`);
  return {x:num(p[0]),y:num(p[1])};
};
const vec=(a,b)=>({x:b.x-a.x,y:b.y-a.y});
const len=v=>Math.hypot(v.x,v.y);
const unit=v=>{const l=len(v);return l?{x:v.x/l,y:v.y/l}:{x:0,y:0};};
const add=(p,v,k=1)=>({x:p.x+v.x*k,y:p.y+v.y*k});

function boundaryPoint(start,dir,box,forward=true){
  const [x0,y0,w,h]=box,eps=1e-9;
  const candidates=[];
  const push=(t,x,y)=>{
    if((forward?t>eps:t<-eps)&&x>=x0-eps&&x<=x0+w+eps&&y>=y0-eps&&y<=y0+h+eps)candidates.push({t,x,y});
  };
  if(Math.abs(dir.x)>eps){
    let t=(x0-start.x)/dir.x;push(t,x0,start.y+t*dir.y);
    t=(x0+w-start.x)/dir.x;push(t,x0+w,start.y+t*dir.y);
  }
  if(Math.abs(dir.y)>eps){
    let t=(y0-start.y)/dir.y;push(t,start.x+t*dir.x,y0);
    t=(y0+h-start.y)/dir.y;push(t,start.x+t*dir.x,y0+h);
  }
  if(!candidates.length)return start;
  candidates.sort((a,b)=>forward?a.t-b.t:b.t-a.t);
  return {x:candidates[0].x,y:candidates[0].y};
}
function lineEnds(a,b,box){
  const d=vec(a,b);
  return [boundaryPoint(a,d,box,false),boundaryPoint(a,d,box,true)];
}
function arcPath(v,a,b,r){
  const va=unit(vec(v,a)),vb=unit(vec(v,b));
  const p1=add(v,va,r),p2=add(v,vb,r);
  let ang1=Math.atan2(va.y,va.x),ang2=Math.atan2(vb.y,vb.x);
  let diff=ang2-ang1;
  while(diff<=-Math.PI)diff+=2*Math.PI;
  while(diff>Math.PI)diff-=2*Math.PI;
  const sweep=diff>=0?1:0;
  return {d:`M ${p1.x} ${p1.y} A ${r} ${r} 0 0 ${sweep} ${p2.x} ${p2.y}`,midAngle:ang1+diff/2};
}
function drawTicks(svg,a,b,count=1,cls='geometry-mark'){
  const d=unit(vec(a,b)),n={x:-d.y,y:d.x},m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
  const spacing=7,size=7;
  for(let i=0;i<count;i++){
    const off=(i-(count-1)/2)*spacing;
    const c=add(m,d,off);
    const p=add(c,n,-size/2),q=add(c,n,size/2);
    svg.append(el('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,class:cls}));
  }
}
function drawParallelMark(svg,a,b,count=1){
  const d=unit(vec(a,b)),n={x:-d.y,y:d.x},m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
  for(let i=0;i<count;i++){
    const off=(i-(count-1)/2)*8;
    const c=add(m,d,off);
    const p=add(add(c,d,-5),n,5),q=add(add(c,d,5),n,-5);
    svg.append(el('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,class:'geometry-parallel-mark'}));
  }
}
function drawRightAngle(svg,v,a,b,size=18){
  const u=unit(vec(v,a)),w=unit(vec(v,b));
  const p=add(v,u,size),q=add(p,w,size),r=add(v,w,size);
  svg.append(el('polyline',{points:`${p.x},${p.y} ${q.x},${q.y} ${r.x},${r.y}`,class:'geometry-right-mark'}));
}
function drawObject(svg,scene,obj,box,arrowId){
  const cls=`geometry-${obj.style||'main'}${obj.className?` ${obj.className}`:''}`;
  if(obj.type==='segment'){
    const a=point(scene,obj.points[0]),b=point(scene,obj.points[1]);
    svg.append(el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:cls}));
    if(obj.ticks)drawTicks(svg,a,b,num(obj.ticks,1));
    if(obj.parallel)drawParallelMark(svg,a,b,num(obj.parallel,1));
    return;
  }
  if(obj.type==='line'){
    const a=point(scene,obj.points[0]),b=point(scene,obj.points[1]),ends=lineEnds(a,b,box);
    svg.append(el('line',{x1:ends[0].x,y1:ends[0].y,x2:ends[1].x,y2:ends[1].y,class:cls}));
    return;
  }
  if(obj.type==='ray'){
    const a=point(scene,obj.points[0]),b=point(scene,obj.points[1]),end=boundaryPoint(a,vec(a,b),box,true);
    svg.append(el('line',{x1:a.x,y1:a.y,x2:end.x,y2:end.y,class:cls,'marker-end':`url(#${arrowId})`}));
    return;
  }
  if(obj.type==='polygon'){
    const pts=obj.points.map(n=>point(scene,n)).map(p=>`${p.x},${p.y}`).join(' ');
    svg.append(el('polygon',{points:pts,class:cls}));
    return;
  }
  if(obj.type==='circle'){
    const c=point(scene,obj.center);
    svg.append(el('circle',{cx:c.x,cy:c.y,r:num(obj.radius,40),class:cls}));
    return;
  }
  if(obj.type==='angle'){
    const v=point(scene,obj.vertex),a=point(scene,obj.arms[0]),b=point(scene,obj.arms[1]),r=num(obj.radius,28);
    const arc=arcPath(v,a,b,r);
    svg.append(el('path',{d:arc.d,class:'geometry-angle-mark'}));
    if(obj.label){
      const lp={x:v.x+Math.cos(arc.midAngle)*(r+16),y:v.y+Math.sin(arc.midAngle)*(r+16)};
      const t=el('text',{x:lp.x,y:lp.y,class:'geometry-angle-label','text-anchor':'middle','dominant-baseline':'central'});
      t.textContent=obj.label;svg.append(t);
    }
    return;
  }
  if(obj.type==='rightAngle'){
    drawRightAngle(svg,point(scene,obj.vertex),point(scene,obj.arms[0]),point(scene,obj.arms[1]),num(obj.size,17));
    return;
  }
  if(obj.type==='markEqual'){
    drawTicks(svg,point(scene,obj.points[0]),point(scene,obj.points[1]),num(obj.count,1));
    return;
  }
  if(obj.type==='markParallel'){
    drawParallelMark(svg,point(scene,obj.points[0]),point(scene,obj.points[1]),num(obj.count,1));
  }
}
function render(host,id,scene){
  scene={...scene,id};
  const box=Array.isArray(scene.viewBox)&&scene.viewBox.length===4?scene.viewBox.map(Number):[0,0,420,220];
  const figure=htmlEl('span','geometry-scene');
  figure.dataset.scene=id;
  figure.setAttribute('role','img');
  figure.setAttribute('aria-label',scene.ariaLabel||scene.title||'Геометрический чертёж');

  if(scene.title)figure.append(htmlEl('span','geometry-scene-title',scene.title));
  const svg=el('svg',{viewBox:box.join(' '),'aria-hidden':'true','focusable':'false',preserveAspectRatio:'xMidYMid meet'});
  const defs=el('defs');
  const arrowId=`geometry-arrow-${String(id).replace(/[^a-zA-Z0-9_-]/g,'-')}`;
  const marker=el('marker',{id:arrowId,viewBox:'0 0 10 10',refX:'8',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto-start-reverse'});
  marker.append(el('path',{d:'M 0 0 L 10 5 L 0 10 z',class:'geometry-arrowhead'}));
  defs.append(marker);svg.append(defs);

  for(const obj of scene.objects||[])drawObject(svg,scene,obj,box,arrowId);

  const labelCfg=scene.labels||{};
  for(const [name,pair] of Object.entries(scene.points||{})){
    const p=point(scene,name);
    svg.append(el('circle',{cx:p.x,cy:p.y,r:3.1,class:'geometry-point'}));
    const cfg=labelCfg[name]===false?null:(typeof labelCfg[name]==='object'?labelCfg[name]:{});
    if(cfg){
      const dx=num(cfg.dx,8),dy=num(cfg.dy,-9);
      const t=el('text',{x:p.x+dx,y:p.y+dy,class:'geometry-label','text-anchor':cfg.anchor||'start'});
      t.textContent=cfg.text||name;svg.append(t);
    }
  }
  figure.append(svg);
  if(scene.caption)figure.append(htmlEl('span','geometry-caption',scene.caption));
  host.replaceWith(figure);
}
document.querySelectorAll('[data-geometry-scene]').forEach(host=>{
  const id=host.dataset.geometryScene;
  if(!scenes[id]){
    host.textContent='Чертёж временно недоступен.';
    host.classList.add('geometry-scene-error');
    return;
  }
  try{render(host,id,scenes[id]);}
  catch(error){
    console.error(error);
    host.textContent='Чертёж временно недоступен.';
    host.classList.add('geometry-scene-error');
  }
});
})();