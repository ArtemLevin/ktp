(function(){
'use strict';
const ids=['a1','b1','c1','a2','b2','c2'];
const el=Object.fromEntries(ids.map(id=>[id,document.getElementById(id)]));
const svg=document.getElementById('graph');
const result=document.getElementById('result');
const reason=document.getElementById('reason');
const check=document.getElementById('check');
const W=640,H=480,xMin=-8,xMax=8,yMin=-8,yMax=8,eps=1e-9;
const X=x=>(x-xMin)/(xMax-xMin)*W;
const Y=y=>H-(y-yMin)/(yMax-yMin)*H;
const val=id=>Number(el[id].value);
const fmt=n=>{
  const z=Math.abs(n)<1e-10?0:Math.round(n*1000)/1000;
  return Number.isInteger(z)?String(z):String(z).replace('.',',');
};
function lhs(a,b){
  let s='';
  const put=(c,name)=>{
    if(c===0)return;
    const abs=Math.abs(c),core=(abs===1?'':abs)+name;
    if(!s)s=(c<0?'−':'')+core; else s+=(c<0?' − ':' + ')+core;
  };
  put(a,'x');put(b,'y');
  return s||'0';
}
const eq=(a,b,c)=>`${lhs(a,b)} = ${fmt(c)}`;
function type(a,b,c){
  if(a===0&&b===0)return c===0?'plane':'empty';
  return 'line';
}
function note(a,b,c){
  const q=type(a,b,c);
  if(q==='plane')return 'Любая пара (x;y) — решение: график совпадает со всей плоскостью.';
  if(q==='empty')return 'Решений нет: равенство 0 = c при c ≠ 0 невозможно.';
  if(b===0)return `Вертикальная прямая x = ${fmt(c/a)}.`;
  if(a===0)return `Горизонтальная прямая y = ${fmt(c/b)}.`;
  const k=-a/b,bb=c/b;
  return `Прямая y = ${fmt(k)}x${bb>0?' + '+fmt(bb):bb<0?' − '+fmt(Math.abs(bb)):''}.`;
}
function segment(a,b,c){
  const pts=[];
  const add=(x,y)=>{
    if(x>=xMin-eps&&x<=xMax+eps&&y>=yMin-eps&&y<=yMax+eps&&!pts.some(p=>Math.abs(p[0]-x)<eps&&Math.abs(p[1]-y)<eps))pts.push([x,y]);
  };
  if(Math.abs(b)>eps){add(xMin,(c-a*xMin)/b);add(xMax,(c-a*xMax)/b);}
  if(Math.abs(a)>eps){add((c-b*yMin)/a,yMin);add((c-b*yMax)/a,yMax);}
  if(pts.length<2)return null;
  let best=[pts[0],pts[1]],dist=-1;
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
    const d=(pts[i][0]-pts[j][0])**2+(pts[i][1]-pts[j][1])**2;
    if(d>dist){dist=d;best=[pts[i],pts[j]];}
  }
  return best;
}
function classify(A){
  const [a1,b1,c1,a2,b2,c2]=A;
  const t1=type(a1,b1,c1),t2=type(a2,b2,c2);
  if(t1==='empty'||t2==='empty')return {kind:'none',text:'Решений нет.',why:'Хотя бы одно уравнение само по себе не имеет решений.'};
  if(t1==='plane'&&t2==='plane')return {kind:'many',text:'Бесконечно много решений.',why:'Оба уравнения верны для любой точки плоскости.'};
  if(t1==='plane'||t2==='plane')return {kind:'many',text:'Бесконечно много решений.',why:'Одно уравнение не ограничивает точку; решениями системы являются все точки второй прямой.'};
  const d=a1*b2-a2*b1;
  if(Math.abs(d)>eps){
    const x=(c1*b2-c2*b1)/d;
    const y=(a1*c2-a2*c1)/d;
    return {kind:'one',text:`Одно решение: (${fmt(x)}; ${fmt(y)}).`,why:'Коэффициенты при x и y непропорциональны, поэтому прямые пересекаются.',x,y};
  }
  const same=Math.abs(a1*c2-a2*c1)<eps&&Math.abs(b1*c2-b2*c1)<eps;
  return same
    ?{kind:'many',text:'Бесконечно много решений.',why:'Все коэффициенты пропорциональны одним и тем же множителем: уравнения задают одну прямую.'}
    :{kind:'none',text:'Решений нет.',why:'Левые части пропорциональны, но правые части не согласуются тем же множителем: прямые параллельны.'};
}
function grid(){
  let h='';
  for(let x=xMin;x<=xMax;x++)h+=`<line x1="${X(x)}" y1="0" x2="${X(x)}" y2="${H}" stroke="${x===0?'#8a96aa':'#e9edf4'}" stroke-width="${x===0?2:1}"/>`;
  for(let y=yMin;y<=yMax;y++)h+=`<line x1="0" y1="${Y(y)}" x2="${W}" y2="${Y(y)}" stroke="${y===0?'#8a96aa':'#e9edf4'}" stroke-width="${y===0?2:1}"/>`;
  for(let x=-6;x<=6;x+=2)if(x!==0)h+=`<text x="${X(x)+3}" y="${Y(0)-5}" font-size="12" fill="#7a879b">${x}</text>`;
  for(let y=-6;y<=6;y+=2)if(y!==0)h+=`<text x="${X(0)+5}" y="${Y(y)-4}" font-size="12" fill="#7a879b">${y}</text>`;
  h+=`<text x="${W-16}" y="${Y(0)-7}" font-size="14" fill="#596780">x</text><text x="${X(0)+7}" y="16" font-size="14" fill="#596780">y</text>`;
  return h;
}
function draw(){
  ids.forEach(id=>document.getElementById(id+'Out').textContent=fmt(val(id)));
  const A=ids.map(val),[a1,b1,c1,a2,b2,c2]=A;
  document.getElementById('eq1').textContent=eq(a1,b1,c1);
  document.getElementById('eq2').textContent=eq(a2,b2,c2);
  document.getElementById('eq1Note').textContent=note(a1,b1,c1);
  document.getElementById('eq2Note').textContent=note(a2,b2,c2);
  const res=classify(A);
  result.textContent=res.text;reason.textContent=res.why;
  if(res.kind==='one'){
    const l1=a1*res.x+b1*res.y,l2=a2*res.x+b2*res.y;
    check.textContent=`Проверка: ${fmt(l1)} = ${fmt(c1)}; ${fmt(l2)} = ${fmt(c2)}.`;
  }else check.textContent='Для случаев 0 и ∞ решений сравните коэффициенты и геометрическое положение графиков.';
  let h=grid();
  const colors=['#2563eb','#7c3aed'];
  [[a1,b1,c1],[a2,b2,c2]].forEach((q,idx)=>{
    const tp=type(...q);
    if(tp==='plane')h+=`<rect x="0" y="0" width="${W}" height="${H}" fill="${colors[idx]}" opacity=".045"/>`;
    if(tp==='line'){
      const seg=segment(...q);
      if(seg)h+=`<line x1="${X(seg[0][0])}" y1="${Y(seg[0][1])}" x2="${X(seg[1][0])}" y2="${Y(seg[1][1])}" stroke="${colors[idx]}" stroke-width="4" stroke-linecap="round"/>`;
    }
  });
  if(res.kind==='one'&&res.x>=xMin&&res.x<=xMax&&res.y>=yMin&&res.y<=yMax){
    h+=`<circle cx="${X(res.x)}" cy="${Y(res.y)}" r="8" fill="#dc2626"/><circle cx="${X(res.x)}" cy="${Y(res.y)}" r="13" fill="none" stroke="#fecaca" stroke-width="4"/>`;
  }
  svg.innerHTML=h;
}
const presets={
  one:[1,1,4,1,-1,0],
  none:[1,1,4,2,2,10],
  many:[1,-2,3,2,-4,6],
  vertical:[1,0,2,0,1,3],
  plane:[0,0,0,1,-1,2]
};
document.querySelectorAll('[data-preset]').forEach(btn=>btn.addEventListener('click',()=>{
  const p=presets[btn.dataset.preset];ids.forEach((id,i)=>el[id].value=p[i]);draw();
}));
ids.forEach(id=>el[id].addEventListener('input',draw));
draw();
})();
