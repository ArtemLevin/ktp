(function(){
'use strict';
const $=id=>document.getElementById(id);
const controls=['a','b','c','d','x'].map($);
const grid=$('distGrid');
const fmt=n=>n===0?'0':String(n).replace('-', '−');
const term=(coef,power)=>{
  if(coef===0)return '0';
  const sign=coef<0?'−':'';
  const a=Math.abs(coef);
  if(power===2)return sign+(a===1?'':a)+'x²';
  if(power===1)return sign+(a===1?'':a)+'x';
  return sign+a;
};
const signed=(coef,power,first=false)=>{
  if(first)return term(coef,power);
  if(coef===0)return '+ 0';
  return (coef<0?'− ':'+ ')+term(Math.abs(coef),power);
};
const binom=(a,b)=>{
  const first=term(a,1);
  if(b===0)return first;
  return first+(b<0?' − ':' + ')+Math.abs(b);
};
function draw(){
  const a=Number($('a').value),b=Number($('b').value),c=Number($('c').value),d=Number($('d').value),x=Number($('x').value);
  const ac=a*c, ad=a*d, bc=b*c, bd=b*d;
  const mid=ad+bc;
  $('expression').textContent=`(${binom(a,b)})(${binom(c,d)})`;
  const cells=[
    ['','header'],[term(c,1),'header'],[term(d,0),'header'],
    [term(a,1),'header'],[term(ac,2),'product',`${term(a,1)} · ${term(c,1)}`],[term(ad,1),'product',`${term(a,1)} · ${term(d,0)}`],
    [term(b,0),'header'],[term(bc,1),'product',`${term(b,0)} · ${term(c,1)}`],[term(bd,0),'product',`${term(b,0)} · ${term(d,0)}`]
  ];
  grid.innerHTML=cells.map(([main,cls,hint])=>`<div class="grid-cell ${cls}"><span>${main}</span>${hint?`<small>${hint}</small>`:''}</div>`).join('');
  $('expanded').textContent=`${term(ac,2)} ${signed(ad,1)} ${signed(bc,1)} ${signed(bd,0)}`;
  const parts=[];
  [[ac,2],[mid,1],[bd,0]].forEach(([co,p])=>{if(co!==0)parts.push([co,p])});
  let std='0';
  if(parts.length){
    std=term(parts[0][0],parts[0][1]);
    for(let i=1;i<parts.length;i++)std+=' '+signed(parts[i][0],parts[i][1]);
  }
  $('standard').textContent=std;
  $('coef2').textContent=fmt(ac);$('coef1').textContent=fmt(mid);$('coef0').textContent=fmt(bd);
  $('xOut').value=x;
  const src=(a*x+b)*(c*x+d), poly=ac*x*x+mid*x+bd;
  $('sourceValue').textContent=fmt(src);$('polyValue').textContent=fmt(poly);
  $('status').textContent=src===poly?'✓ значения совпали':'Проверьте вычисления';
}
controls.forEach(el=>el.addEventListener('input',draw));
$('toggleHints').addEventListener('click',()=>{
  grid.classList.toggle('hide-hints');
  $('toggleHints').textContent=grid.classList.contains('hide-hints')?'Показать подсказки':'Скрыть подсказки';
});
draw();
})();
