(function(){
'use strict';
const canvas=document.getElementById('plot');
const ctx=canvas.getContext('2d');
const xRange=document.getElementById('xRange');
const cRange=document.getElementById('cRange');
const showSquare=document.getElementById('showSquare');
const showCube=document.getElementById('showCube');
const showLevel=document.getElementById('showLevel');
const xOut=document.getElementById('xOut');
const cOut=document.getElementById('cOut');
const squareOut=document.getElementById('squareOut');
const cubeOut=document.getElementById('cubeOut');
const squareRoots=document.getElementById('squareRoots');
const cubeRoots=document.getElementById('cubeRoots');
const resetBtn=document.getElementById('resetBtn');
const xmin=-4,xmax=4,ymin=-9,ymax=9,pad=44;
const fmt=n=>Math.abs(n)<1e-10?'0':String(Math.round(n*1000)/1000).replace('.',',');
const px=x=>pad+(x-xmin)/(xmax-xmin)*(canvas.width-2*pad);
const py=y=>canvas.height-pad-(y-ymin)/(ymax-ymin)*(canvas.height-2*pad);
function line(x1,y1,x2,y2,width=1,dash=[]){ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(px(x1),py(y1));ctx.lineTo(px(x2),py(y2));ctx.stroke();ctx.setLineDash([]);}
function drawGrid(){
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.font='14px system-ui';ctx.textAlign='center';ctx.textBaseline='top';
  for(let x=Math.ceil(xmin);x<=xmax;x++){ctx.strokeStyle='#e6eaf2';line(x,ymin,x,ymax);if(x!==0){ctx.fillStyle='#67738a';ctx.fillText(String(x),px(x),py(0)+7)}}
  ctx.textAlign='right';ctx.textBaseline='middle';
  for(let y=Math.ceil(ymin);y<=ymax;y++){ctx.strokeStyle='#edf0f6';line(xmin,y,xmax,y);if(y!==0&&y%2===0){ctx.fillStyle='#67738a';ctx.fillText(String(y),px(0)-8,py(y))}}
  ctx.strokeStyle='#7b879c';line(xmin,0,xmax,0,1.6);line(0,ymin,0,ymax,1.6);ctx.fillStyle='#33405a';ctx.textAlign='right';ctx.fillText('x',px(xmax)-4,py(0)+18);ctx.textAlign='left';ctx.fillText('y',px(0)+8,py(ymax)+4);
}
function curve(fn){
  ctx.lineWidth=3;ctx.beginPath();let started=false;
  for(let i=0;i<=500;i++){const x=xmin+(xmax-xmin)*i/500,y=fn(x);if(y<ymin-1||y>ymax+1){started=false;continue;}const X=px(x),Y=py(y);if(!started){ctx.moveTo(X,Y);started=true}else ctx.lineTo(X,Y)}ctx.stroke();
}
function dot(x,y){if(y<ymin||y>ymax)return;ctx.beginPath();ctx.arc(px(x),py(y),6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();}
function draw(){
  const x=Number(xRange.value),c=Number(cRange.value);drawGrid();
  if(showSquare.checked){ctx.strokeStyle='#315faa';curve(v=>v*v);ctx.fillStyle='#315faa';dot(x,x*x)}
  if(showCube.checked){ctx.strokeStyle='#a04f42';curve(v=>v*v*v);ctx.fillStyle='#a04f42';dot(x,x*x*x)}
  if(showLevel.checked){ctx.strokeStyle='#54835b';line(xmin,c,xmax,c,2,[10,7]);}
  xOut.value=fmt(x);cOut.value=fmt(c);squareOut.textContent=fmt(x*x);cubeOut.textContent=fmt(x*x*x);
  squareRoots.textContent=c>0?'2 решения':c===0?'1 решение':'0 решений';cubeRoots.textContent='1 решение';
}
[xRange,cRange,showSquare,showCube,showLevel].forEach(el=>el.addEventListener('input',draw));
resetBtn.addEventListener('click',()=>{xRange.value=1;cRange.value=2;showSquare.checked=true;showCube.checked=true;showLevel.checked=true;draw();});
draw();
})();
