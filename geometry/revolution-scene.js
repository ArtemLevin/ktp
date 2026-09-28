(function(){
'use strict';
const NS='http://www.w3.org/2000/svg',M=window.KTP_REVOLUTION_MATH,P=window.KTP_SPATIAL;
if(!M||!P)throw new Error('revolution scene requires revolution-math.js and spatial-scene.js');
const root=document.body;
const key=`${root?.dataset?.row||''}::${Number(root?.dataset?.topic)}`;
const scenes=window.KTP_CONTENT?.[key]?.revolutionScenes;
const svgEl=(name,attrs={})=>{
  const el=document.createElementNS(NS,name);
  for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));
  return el;
};
const point=(p,c)=>P.projectPoint(p,c);
const cameraOf=source=>{
  const c=source||{};
  const yaw=Number(c.yaw??-35),pitch=Number(c.pitch??25),scale=Number(c.scale??60);
  if(![yaw,pitch,scale].every(Number.isFinite)||scale<=0||!Array.isArray(c.origin)||c.origin.length!==2||!c.origin.every(Number.isFinite))throw new RangeError('invalid camera');
  return{yaw:yaw*Math.PI/180,pitch:pitch*Math.PI/180,scale,origin:c.origin};
};
const path=(pts,closed=false)=>pts.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')+(closed?' Z':'');
const projectedCircle=(center,axis,radius,camera)=>M.circle(center,axis,radius).map(p=>point(p,camera));
function splitRing(svg,ring,depth,className){
  const mean=depth??ring.reduce((sum,p)=>sum+p.depth,0)/ring.length;
  for(let i=0;i<ring.length;i++){
    const a=ring[i],b=ring[(i+1)%ring.length];
    svg.append(svgEl('path',{d:path([a,b]),class:`revolution-edge ${((a.depth+b.depth)/2<mean-1e-7)?'revolution-hidden ':''}${className||''}`.trim()}));
  }
}
function extreme(ring,direction){
  const cx=ring.reduce((n,p)=>n+p.x,0)/ring.length,cy=ring.reduce((n,p)=>n+p.y,0)/ring.length;
  const score=p=>(p.x-cx)*direction[0]+(p.y-cy)*direction[1];
  return[ring.reduce((a,b)=>score(a)<score(b)?a:b),ring.reduce((a,b)=>score(a)>score(b)?a:b)];
}
function renderRound(svg,solid,camera){
  const top=M.add(solid.center,M.scale(solid.axis,solid.height));
  const lower=projectedCircle(solid.center,solid.axis,solid.radius,camera);
  const upper=solid.type==='cone'?null:projectedCircle(top,solid.axis,solid.topRadius??solid.radius,camera);
  const c0=point(solid.center,camera),c1=point(top,camera);
  const axis=[c1.x-c0.x,c1.y-c0.y];
  const length=Math.hypot(...axis);
  if(length<1e-6)throw new RangeError('view along axis is unsupported in this schematic');
  const perp=[-axis[1]/length,axis[0]/length];
  const [loL,loR]=extreme(lower,perp);
  const [hiL,hiR]=upper?extreme(upper,perp):[c1,c1];
  svg.append(svgEl('path',{d:path([loL,hiL,hiR,loR],true),class:'revolution-body'}));
  splitRing(svg,lower,c0.depth,'revolution-base');
  svg.append(svgEl('path',{d:path([loL,hiL,hiR,loR]),class:'revolution-edge'}));
  if(upper){
    svg.append(svgEl('path',{d:path(upper,true),class:'revolution-cap'}));
    svg.append(svgEl('path',{d:path(upper,true),class:'revolution-edge'}));
  }
  return{lower,upper,top};
}
function renderSphere(svg,solid,camera){
  const center=point(solid.center,camera);
  svg.append(svgEl('circle',{cx:center.x,cy:center.y,r:solid.radius*camera.scale,class:'revolution-sphere'}));
  const equator=projectedCircle(solid.center,[0,0,1],solid.radius,camera);
  splitRing(svg,equator,center.depth,'revolution-equator');
  return center;
}
function drawSection(svg,solid,section,camera){
  if(section.type==='axial'&&solid.type!=='sphere'&&solid.type!=='ball'){
    const [e]=M.basis(solid.axis),top=M.add(solid.center,M.scale(solid.axis,solid.height));
    const points=[M.add(solid.center,M.scale(e,-solid.radius)),M.add(solid.center,M.scale(e,solid.radius))];
    if(solid.type==='cone')points.push(top);
    else points.push(M.add(top,M.scale(e,solid.topRadius??solid.radius)),M.add(top,M.scale(e,-(solid.topRadius??solid.radius))));
    svg.append(svgEl('path',{d:path(points.map(p=>point(p,camera)),true),class:'revolution-section revolution-section-fill'}));
    return;
  }
  if(section.type==='parallel-base'&&solid.type!=='sphere'&&solid.type!=='ball'){
    const s=M.parallelSection(solid,section.offset);
    if(s.radius===0)return;
    svg.append(svgEl('path',{d:path(projectedCircle(s.center,s.normal,s.radius,camera),true),class:'revolution-section'}));
    return;
  }
  if(!['sphere','ball'].includes(solid.type)||section.type!=='sphere-plane')throw new TypeError('unsupported section');
  const s=M.sphereSection(solid,section.normal,section.offset);
  if(!s)return;
  const center=point(s.center,camera);
  if(s.tangent){svg.append(svgEl('circle',{cx:center.x,cy:center.y,r:4,class:'revolution-tangent'}));return;}
  const ring=projectedCircle(s.center,s.normal,s.radius,camera);
  svg.append(svgEl('path',{d:path(ring,true),class:'revolution-section'}));
}
function render(host,id,source){
  const solid=M.model(source.solid),camera=cameraOf(source.camera),box=source.viewBox??[0,0,420,290];
  if(!Array.isArray(box)||box.length!==4||!box.every(Number.isFinite))throw new RangeError('invalid viewBox');
  const figure=document.createElement('figure');figure.className='revolution-scene';figure.dataset.revolutionScene=id;
  figure.setAttribute('role','img');
  figure.setAttribute('aria-label',source.ariaLabel||source.title||'Тело вращения');
  if(source.title){const h=document.createElement('strong');h.className='revolution-title';h.textContent=source.title;figure.append(h);}
  const svg=svgEl('svg',{viewBox:box.join(' '),'aria-hidden':'true',focusable:'false',preserveAspectRatio:'xMidYMid meet'});
  if(solid.type==='sphere'||solid.type==='ball')renderSphere(svg,solid,camera);else renderRound(svg,solid,camera);
  if(source.section)drawSection(svg,solid,source.section,camera);
  figure.append(svg);
  if(source.caption){const caption=document.createElement('figcaption');caption.textContent=source.caption;figure.append(caption);}
  host.replaceWith(figure);
}
function renderAll(){
  if(!scenes)return;
  document.querySelectorAll('[data-revolution-scene]').forEach(host=>{
    const id=host.dataset.revolutionScene;
    try{
      if(!scenes[id])throw new Error(`revolution scene ${id} missing`);
      render(host,id,scenes[id]);
    }catch(error){console.error(error);host.textContent='Чертёж тела вращения временно недоступен.';host.classList.add('revolution-error');}
  });
}
window.KTP_REVOLUTION={renderAll};renderAll();
})();
