(function(){
'use strict';

const NS='http://www.w3.org/2000/svg';
const DEG=Math.PI/180;
const root=document.body;
const key=`${root?.dataset?.row||''}::${Number(root?.dataset?.topic)}`;
const scenes=window.KTP_CONTENT?.[key]?.spatialScenes;

const finite=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
const v3=p=>Array.isArray(p)?{x:finite(p[0]),y:finite(p[1]),z:finite(p[2])}:{x:finite(p?.x),y:finite(p?.y),z:finite(p?.z)};
const sub=(a,b)=>{a=v3(a);b=v3(b);return{x:a.x-b.x,y:a.y-b.y,z:a.z-b.z};};
const dot3=(a,b)=>{a=v3(a);b=v3(b);return a.x*b.x+a.y*b.y+a.z*b.z;};
const cross3=(a,b)=>{a=v3(a);b=v3(b);return{x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x};};
const norm3=a=>{a=v3(a);return Math.hypot(a.x,a.y,a.z);};
const distance3=(a,b)=>norm3(sub(a,b));
const unit3=a=>{a=v3(a);const n=norm3(a);return n?{x:a.x/n,y:a.y/n,z:a.z/n}:{x:0,y:0,z:0};};

function cameraOf(scene){
  const c=scene.camera||{};
  return{
    yaw:finite(c.yaw,-35)*DEG,
    pitch:finite(c.pitch,25)*DEG,
    scale:Math.max(1,finite(c.scale,62)),
    origin:Array.isArray(c.origin)?[finite(c.origin[0],210),finite(c.origin[1],145)]:[210,145]
  };
}

function projectPoint(raw,camera){
  const p=v3(raw),cy=Math.cos(camera.yaw),sy=Math.sin(camera.yaw),cp=Math.cos(camera.pitch),sp=Math.sin(camera.pitch);
  const x1=p.x*cy-p.y*sy;
  const y1=p.x*sy+p.y*cy;
  const z1=p.z;
  const y2=y1*cp-z1*sp;
  const depth=y1*sp+z1*cp;
  return{x:camera.origin[0]+camera.scale*x1,y:camera.origin[1]-camera.scale*y2,depth};
}

const svgEl=(name,attrs={})=>{
  const node=document.createElementNS(NS,name);
  for(const [k,v] of Object.entries(attrs))if(v!=null)node.setAttribute(k,String(v));
  return node;
};
const htmlEl=(name,cls,text)=>{
  const node=document.createElement(name);
  if(cls)node.className=cls;
  if(text!=null)node.textContent=text;
  return node;
};

function point3(scene,name){
  const p=scene.points?.[name];
  if(!Array.isArray(p)||p.length<3)throw new Error(`spatial scene ${scene.id}: point ${name} missing or not [x,y,z]`);
  return v3(p);
}
function projected(scene,name,camera){return projectPoint(scene.points[name],camera);}
function depthOfObject(scene,obj,camera){
  const names=obj.points||[];
  if(!names.length)return 0;
  return names.reduce((s,n)=>s+projected(scene,n,camera).depth,0)/names.length;
}
function classFor(obj,base){
  const style=obj.style||'main';
  return `${base} spatial-${style}${obj.visibility==='hidden'?' spatial-hidden':''}${obj.className?` ${obj.className}`:''}`;
}
function linePoints(scene,obj){
  const a=point3(scene,obj.points[0]),b=point3(scene,obj.points[1]);
  const d=sub(b,a);
  if(obj.type==='line'){
    const e=Math.max(1,finite(obj.extent,2.5));
    return [
      [a.x-d.x*e,a.y-d.y*e,a.z-d.z*e],
      [b.x+d.x*e,b.y+d.y*e,b.z+d.z*e]
    ];
  }
  if(obj.type==='ray'){
    const e=Math.max(1,finite(obj.extent,3));
    return [[a.x,a.y,a.z],[a.x+d.x*e,a.y+d.y*e,a.z+d.z*e]];
  }
  return [[a.x,a.y,a.z],[b.x,b.y,b.z]];
}
function drawLinear(svg,scene,obj,camera,arrowId){
  const pts=linePoints(scene,obj).map(p=>projectPoint(p,camera));
  const attrs={x1:pts[0].x,y1:pts[0].y,x2:pts[1].x,y2:pts[1].y,class:classFor(obj,'spatial-edge')};
  if(obj.type==='ray'||obj.arrow===true)attrs['marker-end']=`url(#${arrowId})`;
  svg.append(svgEl('line',attrs));
}
function drawPolyline(svg,scene,obj,camera){
  const pts=(obj.points||[]).map(n=>projected(scene,n,camera)).map(p=>`${p.x},${p.y}`).join(' ');
  svg.append(svgEl(obj.closed?'polygon':'polyline',{points:pts,class:classFor(obj,obj.closed?'spatial-outline':'spatial-polyline')}));
}
function drawFace(svg,scene,obj,camera){
  const pts=(obj.points||[]).map(n=>projected(scene,n,camera)).map(p=>`${p.x},${p.y}`).join(' ');
  svg.append(svgEl('polygon',{points:pts,class:classFor(obj,obj.type==='plane'?'spatial-plane':'spatial-face')}));
}
function drawObject(svg,scene,obj,camera,arrowId){
  if(['segment','line','ray'].includes(obj.type))return drawLinear(svg,scene,obj,camera,arrowId);
  if(obj.type==='polyline')return drawPolyline(svg,scene,obj,camera);
  if(obj.type==='face'||obj.type==='plane')return drawFace(svg,scene,obj,camera);
}
function buildDefs(svg,sceneId){
  const defs=svgEl('defs');
  const arrowId=`spatial-arrow-${String(sceneId).replace(/[^a-zA-Z0-9_-]/g,'-')}`;
  const marker=svgEl('marker',{id:arrowId,viewBox:'0 0 10 10',refX:'8',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto-start-reverse'});
  marker.append(svgEl('path',{d:'M 0 0 L 10 5 L 0 10 z',class:'spatial-arrowhead'}));
  defs.append(marker);svg.append(defs);
  return arrowId;
}
function render(host,id,source){
  const scene={...source,id};
  const camera=cameraOf(scene);
  const box=Array.isArray(scene.viewBox)&&scene.viewBox.length===4?scene.viewBox.map(Number):[0,0,420,290];
  const figure=htmlEl('span','spatial-scene');
  figure.dataset.spatialScene=id;
  figure.setAttribute('role','img');
  figure.setAttribute('aria-label',scene.ariaLabel||scene.title||'Пространственный геометрический чертёж');
  if(scene.title)figure.append(htmlEl('span','spatial-scene-title',scene.title));

  const svg=svgEl('svg',{viewBox:box.join(' '),'aria-hidden':'true','focusable':'false',preserveAspectRatio:'xMidYMid meet'});
  const arrowId=buildDefs(svg,id);
  const objects=[...(scene.objects||[])];
  const fills=objects.filter(o=>o.type==='face'||o.type==='plane').sort((a,b)=>depthOfObject(scene,a,camera)-depthOfObject(scene,b,camera));
  const strokes=objects.filter(o=>o.type!=='face'&&o.type!=='plane');
  fills.forEach(o=>drawObject(svg,scene,o,camera,arrowId));
  strokes.filter(o=>o.visibility==='hidden').forEach(o=>drawObject(svg,scene,o,camera,arrowId));
  strokes.filter(o=>o.visibility!=='hidden').forEach(o=>drawObject(svg,scene,o,camera,arrowId));

  const labels=scene.labels||{};
  if(scene.showPoints!==false){
    for(const name of Object.keys(scene.points||{})){
      const p=projected(scene,name,camera);
      const cfg=labels[name]===false?null:(typeof labels[name]==='object'?labels[name]:{});
      svg.append(svgEl('circle',{cx:p.x,cy:p.y,r:3.1,class:'spatial-point'}));
      if(cfg){
        const t=svgEl('text',{x:p.x+finite(cfg.dx,7),y:p.y+finite(cfg.dy,-8),class:'spatial-label','text-anchor':cfg.anchor||'start'});
        t.textContent=cfg.text||name;svg.append(t);
      }
    }
  }
  figure.append(svg);
  if(scene.caption)figure.append(htmlEl('span','spatial-caption',scene.caption));
  host.replaceWith(figure);
}
function renderAll(){
  if(!scenes||typeof scenes!=='object')return;
  document.querySelectorAll('[data-spatial-scene]').forEach(host=>{
    const id=host.dataset.spatialScene;
    if(!scenes[id]){
      host.textContent='Пространственный чертёж временно недоступен.';
      host.classList.add('spatial-scene-error');
      return;
    }
    try{render(host,id,scenes[id]);}
    catch(error){
      console.error(error);
      host.textContent='Пространственный чертёж временно недоступен.';
      host.classList.add('spatial-scene-error');
    }
  });
}

window.KTP_SPATIAL={projectPoint,distance3,dot3,cross3,norm3,unit3,renderAll};
renderAll();
})();