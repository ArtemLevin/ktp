(function(){
'use strict';
const V=window.KTP_VECTOR_MATH,M=window.KTP_COORDINATE_MATH;
const edge=(a,b,hidden=false)=>({type:'segment',points:[a,b],style:'aux',...(hidden?{visibility:'hidden'}:{})});
const arrow=(a,b,id,label,style='main',offset=[0,-12])=>({type:'vector',points:[a,b],vectorId:id,label,style,labelOffset:offset});
const camera={yaw:-32,pitch:-58,scale:48,origin:[210,200]};
function scene(lesson,title,points,objects,caption,math,labels={}){return {lesson,title,points,objects,caption,math,labels,ariaLabel:title+'. '+caption,camera:{...camera,origin:[...camera.origin]},viewBox:[0,0,460,320]};}
const S={},O=[0,0,0],planeObjects=[{type:'plane',points:['Q','R','S','T'],style:'aux'}],floor={Q:[-.6,-.6,0],R:[3,-.6,0],S:[3,2.2,0],T:[-.6,2.2,0]};
const floorLabels={Q:false,R:false,S:false,T:false};
S['g11-coordinate-45-axes']=scene(45,'Точка и координатные плоскости',{O,X:[3,0,0],Y:[0,3,0],Z:[0,0,3],P:[1.5,1,2],H:[1.5,1,0]},[arrow('O','X','x','x'),arrow('O','Y','y','y'),arrow('O','Z','z','z', 'main',[-18,0]),edge('P','H',true)],'P(1,5;1;2); H(1,5;1;0) — проекция на Oxy. У H третья координата равна 0.',{point:[1.5,1,2],projection:[1.5,1,0]},{O:{dx:-15,dy:18},H:{dy:18}});
S['g11-coordinate-46-components']=scene(46,'Координаты свободного вектора',{O,A:[2,1,1],B:[0,1,1],C:[2,2,2]},[arrow('O','A','a','a⃗','emphasis'),arrow('B','C','copy','a⃗')],'OA=BC=(2;1;1): координаты вектора сохраняются при переносе.',{from:O,to:[2,1,1],copy:[[0,1,1],[2,2,2]]});
S['g11-coordinate-47-endpoints']=scene(47,'Вектор и середина отрезка',{A:[-.5,0,0],B:[2.5,2,2],J:[1,1,1]},[arrow('A','B','ab','AB','emphasis')],'J — середина AB; AB вычисляется как B−A, координаты J — полусумма координат концов.',{A:[-.5,0,0],B:[2.5,2,2],midpoint:[1,1,1]});
S['g11-coordinate-48-length']=scene(48,'Пространственная диагональ',{O,A:[2,0,0],B:[2,2,0],P:[2,2,2]},[edge('O','A'),edge('A','B'),edge('B','P'),arrow('O','P','diagonal','OP','emphasis')],'Три взаимно перпендикулярных перемещения по 2 дают |OP|=2√3. Длина проекции не равна пространственной длине.',{vector:[2,2,2],length:Math.sqrt(12)});
const sp={C:[1,1,1],P:[2.2,1,1]},sphereObjects=[];
for(let axis=0;axis<3;axis++){const names=[];for(let i=0;i<=48;i++){const p=[1,1,1],angle=i*Math.PI/24;p[(axis+1)%3]+=1.2*Math.cos(angle);p[(axis+2)%3]+=1.2*Math.sin(angle);const key='s'+axis+'_'+i;sp[key]=p;names.push(key);}sphereObjects.push({type:'polyline',points:names,style:'aux'});}
S['g11-coordinate-49-sphere']=scene(49,'Сфера с центром C',sp,[...sphereObjects,arrow('C','P','radius','R=1,2','emphasis')],'Центр C(1;1;1), радиус 1,2. Уравнение: (x−1)²+(y−1)²+(z−1)²=1,44.',{center:[1,1,1],radius:1.2},Object.fromEntries(Object.keys(sp).filter(k=>k.startsWith('s')).map(k=>[k,false])));
S['g11-coordinate-49-sphere'].showPoints=false;
S['g11-coordinate-50-angle']=scene(50,'Угол между направленными векторами',{O,A:[2,0,0],B:[-1,1,0]},[arrow('O','A','a','a⃗'),arrow('O','B','b','b⃗','emphasis')],'Угол между OA и OB равен 135°. Модуль в числителе здесь изменил бы ответ.',{a:[2,0,0],b:[-1,1,0],angle:135});
S['g11-coordinate-51-dot']=scene(51,'Ортогональность',{O,A:[2,1,0],B:[-1,2,0]},[arrow('O','A','a','a⃗'),arrow('O','B','b','b⃗','emphasis')],'a⃗·b⃗=2·(−1)+1·2=0. Оба вектора ненулевые: они перпендикулярны.',{a:[2,1,0],b:[-1,2,0],dot:0});
function experiment(mode,t=2){
 if(typeof t!=='number'||!Number.isFinite(t)||t<0||t>3)throw new RangeError('Parameter t must be from 0 to 3');
 const p=[2,1,t],h=[2,1,0],points={...floor,O,P:p,H:h},labels={...floorLabels,O:{dx:-15,dy:18},H:{dy:20},P:t===0?false:{dy:-10}};
 if(mode==='angle')return scene(52,'Угол прямой и плоскости',points,[...planeObjects,arrow('O','P','direction','u⃗','emphasis',[16,-15]),edge('O','H'),edge('H','P',true)],'Проекция направления лежит в плоскости. Угол α вычисляется через sin α=|u⃗·n⃗|/(|u⃗||n⃗|).',{t,angle:M.linePlaneAngle(p,[0,0,1])},labels);
 if(mode==='distance')return scene(53,'Перпендикуляр к плоскости',points,[...planeObjects,edge('P','H'),edge('O','H',true)],'H — основание перпендикуляра; расстояние от P до плоскости z=0 равно |PH|='+t+'.',{t,point:p,foot:h,distance:t},labels);
 if(mode==='motion'){points.P1=M.mirror(p,M.plane([0,0,1],0));labels.P1=t===0?false:{text:'P′',dy:18};const result=scene(54,'Зеркальная симметрия',points,[...planeObjects,edge('P','P1'),edge('O','H',true)],'P′(2;1;−t) отражает P(2;1;t) в плоскости z=0. H — середина PP′.',{t,point:p,image:points.P1},labels);result.camera.origin=[210,150];return result;}
 throw new RangeError('Unknown experiment');
}
S['g11-coordinate-52-plane-angle']=experiment('angle');S['g11-coordinate-53-distance']=experiment('distance');S['g11-coordinate-54-mirror']=experiment('motion');
S['g11-coordinate-55-translation']=scene(55,'Перенос и масштаб',{A:[-.5,0,0],B:[1,0,0],A1:[.5,1,1],B1:[2,1,1],D:[2.5,0,0]},[arrow('A','B','ab','AB'),arrow('A1','B1','copy','A′B′','emphasis'),edge('A','A1',true),edge('B','B1',true),edge('A','D')],'Перенос сохраняет длину AB. При подобии с коэффициентом 2 длина удваивается, поэтому это преобразование не является движением.',{shift:[1,1,1],original:[[-.5,0,0],[1,0,0]],image:[[.5,1,1],[2,1,1]]},{A1:{text:'A′'},B1:{text:'B′'},D:{dy:18}});
S['g11-coordinate-56-diagnostic']=scene(56,'Два определения угла',{O,A:[2,0,0],B:[-1,1,0]},[arrow('O','A','a','a⃗'),arrow('O','B','b','b⃗','emphasis')],'Направленные векторы образуют 135°. Прямые этих направлений образуют 45°. Сначала определите геометрический объект.',{a:[2,0,0],b:[-1,1,0],vectorAngle:135,lineAngle:45});
window.KTP_G11_COORDINATE_SCENES=S;window.KTP_COORDINATE_EXPERIMENT=experiment;
})();
