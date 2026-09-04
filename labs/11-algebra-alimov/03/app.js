(function(){'use strict';
const canvas=document.getElementById('plot'),ctx=canvas.getContext('2d');
const els={fn:document.getElementById('fn'),a:document.getElementById('a'),b:document.getElementById('b'),n:document.getElementById('n'),aOut:document.getElementById('aOut'),bOut:document.getElementById('bOut'),nOut:document.getElementById('nOut'),exact:document.getElementById('exact'),geom:document.getElementById('geom'),approx:document.getElementById('approx'),approxGeom:document.getElementById('approxGeom'),error:document.getElementById('error')};
const defs={
 square:{f:x=>x*x,F:x=>x*x*x/3,roots:()=>[0]},
 line:{f:x=>x,F:x=>x*x/2,roots:()=>[0]},
 sine:{f:x=>Math.sin(x),F:x=>-Math.cos(x),roots:(a,b)=>{const r=[];for(let k=Math.ceil(a/Math.PI);k<=Math.floor(b/Math.PI);k++)r.push(k*Math.PI);return r;}},
 fall:{f:x=>2-x,F:x=>2*x-x*x/2,roots:()=>[2]}
};
const fmt=x=>Math.abs(x)<5e-10?'0':Number(x.toFixed(4)).toString().replace('.',',');
function interval(){let a=+els.a.value,b=+els.b.value;if(a>=b){if(document.activeElement===els.a)a=b-.1;else b=a+.1;}return[a,b];}
function exactGeom(d,a,b){const pts=[a,...d.roots(a,b).filter(x=>x>a+1e-9&&x<b-1e-9),b].sort((x,y)=>x-y);let s=0;for(let i=0;i<pts.length-1;i++)s+=Math.abs(d.F(pts[i+1])-d.F(pts[i]));return s;}
function resize(){const r=canvas.getBoundingClientRect(),dpr=devicePixelRatio||1;canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
function draw(){resize();const d=defs[els.fn.value],[a,b]=interval(),N=+els.n.value;els.a.value=a;els.b.value=b;els.aOut.value=fmt(a);els.bOut.value=fmt(b);els.nOut.value=N;
 const exact=d.F(b)-d.F(a),geom=exactGeom(d,a,b),h=(b-a)/N;let approx=0,approxGeom=0;
 for(let i=0;i<N;i++){const x=a+(i+.5)*h,y=d.f(x);approx+=y*h;approxGeom+=Math.abs(y*h);}
 els.exact.textContent=fmt(exact);els.geom.textContent=fmt(geom);els.approx.textContent=fmt(approx);els.approxGeom.textContent=fmt(approxGeom);els.error.textContent=fmt(Math.abs(approx-exact));
 const W=canvas.clientWidth,H=canvas.clientHeight,pad=34,xmin=Math.min(-5,a-.8),xmax=Math.max(5,b+.8);let ymin=-1,ymax=1;
 for(let i=0;i<=400;i++){const x=xmin+(xmax-xmin)*i/400,y=d.f(x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);}
 const span=Math.max(2,ymax-ymin);ymin-=.12*span;ymax+=.12*span;
 const X=x=>pad+(x-xmin)/(xmax-xmin)*(W-2*pad),Y=y=>H-pad-(y-ymin)/(ymax-ymin)*(H-2*pad);
 ctx.clearRect(0,0,W,H);ctx.lineWidth=1;ctx.strokeStyle='#c7ccd4';ctx.beginPath();ctx.moveTo(X(xmin),Y(0));ctx.lineTo(X(xmax),Y(0));ctx.moveTo(X(0),Y(ymin));ctx.lineTo(X(0),Y(ymax));ctx.stroke();
 for(let i=0;i<N;i++){const x=a+(i+.5)*h,y=d.f(x),xL=a+i*h;ctx.globalAlpha=.25;ctx.fillStyle=y>=0?'#2e7d32':'#b23b3b';const y0=Y(0),yy=Y(y);ctx.fillRect(X(xL),Math.min(y0,yy),Math.max(1,X(xL+h)-X(xL)-1),Math.abs(yy-y0));ctx.globalAlpha=1;}
 ctx.strokeStyle='#1f5fae';ctx.lineWidth=2.4;ctx.beginPath();let started=false;for(let i=0;i<=800;i++){const x=xmin+(xmax-xmin)*i/800,y=d.f(x);const px=X(x),py=Y(y);if(!Number.isFinite(py))continue;if(!started){ctx.moveTo(px,py);started=true}else ctx.lineTo(px,py);}ctx.stroke();
 ctx.strokeStyle='#333';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(X(a),pad);ctx.lineTo(X(a),H-pad);ctx.moveTo(X(b),pad);ctx.lineTo(X(b),H-pad);ctx.stroke();ctx.setLineDash([]);
}
Object.values(els).filter(x=>x&&x.addEventListener).forEach(el=>{if(['SELECT','INPUT'].includes(el.tagName))el.addEventListener('input',draw);});
document.getElementById('double').addEventListener('click',()=>{els.n.value=Math.min(80,+els.n.value*2);draw();});addEventListener('resize',draw);draw();
})();