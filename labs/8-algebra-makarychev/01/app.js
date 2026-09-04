(function(){
'use strict';
const svgNS='http://www.w3.org/2000/svg';
const values=[-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,7,8,9,10,11,12];
const kRange=document.getElementById('kRange');
const xInput=document.getElementById('xInput');
const showPoint=document.getElementById('showPoint');
const kOut=document.getElementById('kOut');
const formula=document.getElementById('formula');
const quadrants=document.getElementById('quadrants');
const pointText=document.getElementById('pointText');
const productText=document.getElementById('productText');
const left=document.getElementById('leftBranch');
const right=document.getElementById('rightBranch');
const point=document.getElementById('point');
const pointLabel=document.getElementById('pointLabel');
const pointLayer=document.getElementById('pointLayer');
const grid=document.getElementById('grid');
const axes=document.getElementById('axes');
const reset=document.getElementById('reset');
const ox=320,oy=220,sx=24,sy=16,xMin=-12,xMax=12,yMin=-12,yMax=12;
const X=x=>ox+x*sx,Y=y=>oy-y*sy;
const fmt=n=>Number.isInteger(n)?String(n):String(Math.round(n*100)/100).replace('.',',');
function line(parent,x1,y1,x2,y2,cls){const el=document.createElementNS(svgNS,'line');el.setAttribute('x1',x1);el.setAttribute('y1',y1);el.setAttribute('x2',x2);el.setAttribute('y2',y2);el.setAttribute('class',cls);parent.appendChild(el);}
function text(parent,x,y,value){const el=document.createElementNS(svgNS,'text');el.setAttribute('x',x);el.setAttribute('y',y);el.setAttribute('class','tick-label');el.textContent=value;parent.appendChild(el);}
function drawGrid(){grid.textContent='';axes.textContent='';for(let x=-12;x<=12;x+=2){line(grid,X(x),Y(yMin),X(x),Y(yMax),'grid-line');if(x!==0)text(axes,X(x)-6,oy+17,String(x));}for(let y=-12;y<=12;y+=2){line(grid,X(xMin),Y(y),X(xMax),Y(y),'grid-line');if(y!==0)text(axes,ox+7,Y(y)+4,String(y));}line(axes,X(xMin),oy,X(xMax),oy,'axis');line(axes,ox,Y(yMin),ox,Y(yMax),'axis');text(axes,X(xMax)-10,oy-8,'x');text(axes,ox+9,Y(yMax)+14,'y');}
function branchPath(k,start,end,step){let d='',pen=false;for(let x=start;step>0?x<=end:x>=end;x+=step){const y=k/x;const visible=Number.isFinite(y)&&y>=yMin&&y<=yMax;if(!visible){pen=false;continue;}const cmd=pen?'L':'M';d+=`${cmd}${X(x).toFixed(2)} ${Y(y).toFixed(2)} `;pen=true;}return d.trim();}
function update(){const k=values[Number(kRange.value)]||1;const x=Number(xInput.value);kOut.textContent=fmt(k);formula.textContent=`y = ${k}/x`;quadrants.textContent=k>0?'I и III':'II и IV';left.setAttribute('d',branchPath(k,-12,-0.05,0.05));right.setAttribute('d',branchPath(k,0.05,12,0.05));const valid=Number.isFinite(x)&&x!==0;const y=valid?k/x:NaN;pointText.textContent=valid?`(${fmt(x)}; ${fmt(y)})`:'x = 0 запрещён';productText.textContent=valid?fmt(x*y):'—';const onPlot=valid&&x>=xMin&&x<=xMax&&y>=yMin&&y<=yMax&&showPoint.checked;pointLayer.style.display=onPlot?'':'none';if(onPlot){point.setAttribute('cx',X(x));point.setAttribute('cy',Y(y));point.setAttribute('class','point');pointLabel.setAttribute('x',X(x)+10);pointLabel.setAttribute('y',Y(y)-10);pointLabel.setAttribute('class','point-label');pointLabel.textContent=`(${fmt(x)}; ${fmt(y)})`;}}
kRange.addEventListener('input',update);xInput.addEventListener('input',update);showPoint.addEventListener('change',update);reset.addEventListener('click',()=>{kRange.value='17';xInput.value='2';showPoint.checked=true;update();xInput.focus();});drawGrid();update();
})();
