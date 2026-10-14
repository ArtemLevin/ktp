(function(){
'use strict';
const M=window.KTP_VECTOR_MATH,L=window.KTP_VECTOR_LAB_MATH,$=id=>document.getElementById(id);
const registry=window.KTP_CONTENT['11-geometry-atanasyan::3'].spatialScenes;
let mode='transfer',target='c';
const number=id=>Number($(id).value),fmt=n=>String(Math.abs(n)<1e-9?0:Number(n.toFixed(3))).replace('.',','),tuple=v=>'('+v.map(fmt).join('; ')+')';
const arrow=(from,to,id,label,style='main',labelOffset=[0,-12])=>({type:'vector',points:[from,to],vectorId:id,label,style,labelOffset});
function scene(points,objects,title,caption,labels={}){
  const camera={yaw:-32,pitch:-58,scale:55,origin:[0,0]},p=Object.values(points).map(v=>window.KTP_SPATIAL.projectPoint(v,{yaw:camera.yaw*Math.PI/180,pitch:camera.pitch*Math.PI/180,scale:camera.scale,origin:camera.origin}));
  const xs=p.map(v=>v.x),ys=p.map(v=>v.y),left=Math.min(...xs)-45,top=Math.min(...ys)-45;
  registry['vector-lab']={points,objects,title,caption,ariaLabel:title+'. '+caption,camera,labels,
    viewBox:[left,top,Math.max(180,Math.max(...xs)-left+45),Math.max(160,Math.max(...ys)-top+45)]};
  const host=document.createElement('span');host.dataset.spatialScene='vector-lab';$('scene').replaceChildren(host);window.KTP_SPATIAL.renderAll();
}
function metrics(label1,value1,label2,value2){$('m1Label').textContent=label1;$('m1').textContent=value1;$('m2Label').textContent=label2;$('m2').textContent=value2;}
function render(){
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
  document.querySelectorAll('[data-controls]').forEach(e=>e.hidden=e.dataset.controls!==mode);
  document.querySelectorAll('[data-target]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.target===target)));
  for(const id of ['t','k','x','y','z','h'])$(id+'Out').textContent=fmt(number(id));
  let state;
  if(mode==='transfer'){
    $('controlTitle').textContent='Перенос';state=L.transfer({t:number('t'),k:number('k')});
    const {original:a,copy:b}=state;
    const caption=state.zero?'AB и CD — нулевые векторы: длина 0, определённого направления нет.':'AB=CD: равные длины и одинаковое направление при разных началах.';
    scene({A:a.from,B:a.to,C:b.from,D:b.to},[arrow('A','B','original',state.zero?'0⃗':'a⃗','main'),arrow('C','D','copy',state.zero?'0⃗':'a⃗','emphasis')],'Перенос равного вектора',caption,state.zero?{B:false,D:false,A:{dx:-15,dy:18},C:{dx:-15,dy:18}}:{A:{dx:-15,dy:18},C:{dx:-15,dy:18}});
    metrics('Равенство AB и CD',state.equal?'Сохраняется':'Нарушено','Длина каждого',fmt(state.length)+' ед.');
    $('formula').textContent='AB=CD; |AB|=|CD|. Множитель k='+fmt(state.k)+'.';
    $('observation').textContent=caption+' '+(state.k<0?'При отрицательном k направление относительно исходного вектора меняется.':state.k>0?'При положительном k направление относительно исходного вектора сохраняется.':'Нулевой вектор обозначен кольцом.');
  }else if(mode==='combination'){
    $('controlTitle').textContent='Сумма и коэффициенты';state=L.combination({x:number('x'),y:number('y'),z:number('z')});
    const [a,b,c]=state.basis,[u,v]=state.parts,O=[0,0,0],X=u,Y=M.add(u,v),P=state.p;
    const caption='Сложите xa⃗, yb⃗, zc⃗ по цепочке O→X→Y→P. Итог — OP.';
    scene({O,A:a,B:b,C:c,X,Y,P},[arrow('O','A','a','a⃗','aux',[0,20]),arrow('O','B','b','b⃗','aux',[18,0]),arrow('O','C','c','c⃗','aux',[-18,0]),arrow('O','X','xa','','main'),arrow('X','Y','yb','','main'),arrow('Y','P','zc','','main'),arrow('O','P','sum',state.zero?'0⃗':'p⃗','emphasis',[14,-14])],'Сумма в наклонной тройке',caption,{O:{dx:-15,dy:18},X:false,Y:false,P:state.zero?false:{dx:10,dy:-8}});
    metrics('Коэффициенты',tuple(state.coefficients),'Разложение','Единственное');
    $('formula').textContent='p⃗='+fmt(state.coefficients[0])+'a⃗ + ('+fmt(state.coefficients[1])+')b⃗ + ('+fmt(state.coefficients[2])+')c⃗.';
    $('observation').textContent=state.zero?'Все коэффициенты равны 0, поэтому сумма — нулевой вектор.':caption+' Три опоры некомпланарны; прямые углы между ними не требуются.';
  }else{
    $('controlTitle').textContent='Компланарность';state=L.coplanarity({h:number('h'),target});
    const [a,b,c]=state.basis,O=[0,0,0],caption=state.planar?(state.exists?'c⃗=a⃗+b⃗. Два разных набора коэффициентов дают один вектор.':'n⃗ выходит из плоскости a⃗,b⃗,c⃗. Разложение отсутствует.'):'Тройка a⃗,b⃗,c⃗ некомпланарна: любой вектор имеет единственное разложение.';
    const objects=[{type:'plane',points:['O','A','E','B'],style:'aux'},arrow('O','A','a','a⃗','main'),arrow('O','B','b','b⃗','main',[-20,-14]),arrow('O','C','c',target==='c'?'c⃗=p⃗':'c⃗','emphasis',state.h<0?[45,-25]:[45,12])];
    if(target==='outside')objects.push(arrow('O','P','target','n⃗=p⃗','emphasis',[-24,-5]));
    scene({O,A:a,B:b,C:c,E:M.add(a,b),P:state.p},objects,'Проверка условия разложения',caption,{O:{dx:-15,dy:18},A:{dx:7,dy:20},E:false,P:target==='c'?false:{dx:10,dy:-8}});
    metrics('Тройка',state.planar?'Компланарная':'Некомпланарная','Разложение',!state.exists?'Отсутствует':state.unique?'Единственное':'Множество');
    $('formula').textContent='c⃗=a⃗+b⃗+('+fmt(state.h)+')n⃗. '+(state.exists?'Коэффициенты p⃗: '+state.representations.map(tuple).join(' и ')+'.':'Вектор p⃗=n⃗ не выражается через эту тройку.');
    $('observation').textContent=caption+' Наблюдение согласуется с условием теоремы; обоснуйте его векторным равенством.';
  }
  window.KTP_VECTOR_LAB_CURRENT={mode,state};
}
function reset(){for(const [id,v] of Object.entries({t:0,k:1,x:1,y:1,z:1,h:1}))$(id).value=v;target='c';render();}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;render();}));
document.querySelectorAll('input[type="range"]').forEach(e=>e.addEventListener('input',render));
document.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',()=>{target=b.dataset.target;render();}));
document.querySelectorAll('[data-reset]').forEach(b=>b.addEventListener('click',reset));
$('negative').addEventListener('click',()=>{$('k').value=-1;render();});$('zero').addEventListener('click',()=>{$('k').value=0;render();});
$('allZero').addEventListener('click',()=>{for(const id of ['x','y','z'])$(id).value=0;render();});
$('mixed').addEventListener('click',()=>{$('x').value=1;$('y').value=-.5;$('z').value=.5;render();});
$('planar').addEventListener('click',()=>{$('h').value=0;render();});render();
})();
