(function(){
'use strict';
const M=window.KTP_COORDINATE_MATH,V=window.KTP_VECTOR_MATH;
const tuple=v=>'('+v.map(x=>String(Object.is(x,-0)?0:x)).join('; ')+')';
const root=n=>Number.isInteger(Math.sqrt(n))?String(Math.sqrt(n)):'√'+n;
const q=(text,answerCore,skill,solution,audit,extra={})=>({text,answerCore,answer:answerCore+' '+solution,skill,solution,audit,...extra});
const vec=(text,a,skill,solution,audit)=>q(text,tuple(a)+'.',skill,solution,{...audit,result:a});
const num=(text,n,skill,solution,audit)=>q(text,n+'.',skill,solution,{...audit,result:n});
const logic=(text,answer,rule,error=false)=>q(text,answer,'Условия и обоснование',answer,{kind:'logic',rule},{errorAnalysis:error});
function pool(mode,variant){
 if(!Number.isInteger(variant)||variant<1||variant>60)throw new RangeError('Variant 1–60 required');
 const k=variant+1,p=(variant-1)%8;
 const shifts=[[k%7+2,4,-4],[-(k%7+3),k%5+2,-3],[k%5+2,-(k%7+3),k%6+2],[-4,k%6+2,k%5+1],[k%8+1,k%5+2,-(k%7+1)],[-(k%5+1),-(k%7+2),k%9+3]];
 const A=[k,k%4-2,2+k%3],B=V.add(A,shifts[(variant-1)%6]),a=[k,2,-1],b=[1,-k,3],center=[k,1,-1],d=k+2;
 // The case families vary directions and orthogonality while preserving exact integer-degree angles.
 const vv=[[[k,k,0],[k,0,0]],[[k,k,0],[k,0,k]],[[k,k,0],[-k,0,0]],[[k,k,0],[-k,0,k]],[[k,k,0],[2*k,k,k]],[[k,k,0],[-2*k,-k,-k]],[[k,k,0],[k,-k,0]],[[k,k,0],[-k,-k,0]]];
 const ll=[[[k,0,0],[k,k,0]],[[k,k,0],[k,0,k]],[[k,0,0],[0,k,0]],[[k,k,0],[-k,-k,0]],[[k,k,0],[2*k,k,k]],[[k,k,0],[k,-k,0]],[[k,k,0],[-k,0,0]],[[k,k,0],[k,0,0]]];
 const pp=[[[k,0,k],[0,0,1]],[[k,k,0],[0,k,k]],[[0,0,k],[0,0,1]],[[k,0,0],[0,0,1]],[[k,k,0],[k,0,k]],[[k,k,0],[0,0,1]],[[k,k,0],[k,k,0]],[[k,0,k],[0,0,1]]];
 // Normals have exact integer lengths (3, 5, 3 and 3).
 const normals=[[2,-1,2],[3,4,0],[0,0,-3],[1,2,2]],n0=normals[(variant-1)%4],P0=[k,k%4+1,k%3+2],distance0=variant%9+1;
 const D0=(variant%2?1:-1)*Math.hypot(...n0)*distance0-M.dot(P0,n0);
 const operation=(op,coef=1)=>vec('a⃗='+tuple(a)+', b⃗='+tuple(b)+'. Найдите '+(op==='add'?'a⃗+b⃗':op==='subtract'?'a⃗−b⃗':coef+'a⃗')+'.',op==='add'?V.add(a,b):op==='subtract'?V.subtract(a,b):V.scale(a,coef),'Операции по координатам','Подстановка: '+(op==='scale'?a.map(x=>coef+'·('+x+')').join('; '):a.map((x,i)=>'('+x+')'+(op==='add'?'+':'−')+'('+b[i]+')').join('; '))+'.',{kind:'operation',op,a,b,coef});
 const mid=(p=A,r=B)=>vec('Найдите середину отрезка с концами '+tuple(p)+' и '+tuple(r)+'.',M.midpoint(p,r),'Середина','Подстановка: '+p.map((x,i)=>'('+x+'+('+r[i]+'))/2').join('; ')+'.',{kind:'midpoint',a:p,b:r});
 const distance=(p=A,r=B)=>{const v=V.subtract(r,p),n=v.reduce((s,x)=>s+x*x,0);return q('Найдите расстояние между '+tuple(p)+' и '+tuple(r)+'.',root(n)+'.','Расстояние','Разности: '+tuple(v)+'. Сумма квадратов '+n+'; расстояние '+root(n)+'.',{kind:'length',a:p,b:r,squared:n});};
 const length=(p=a)=>distance([0,0,0],p);
 const dot=(p=a,r=b)=>num('a⃗='+tuple(p)+', b⃗='+tuple(r)+'. Вычислите a⃗·b⃗.',M.dot(p,r),'Скалярное произведение','Подстановка: '+p.map((x,i)=>'('+x+')·('+r[i]+')').join('+')+'='+M.dot(p,r)+'.',{kind:'dot',a:p,b:r});
 const angle=(p=vv[(variant-1)%8][0],r=vv[(variant-1)%8][1],type='vector')=>{const value=(type==='line'||type==='planes')?M.lineAngle(p,r):type==='plane'?M.linePlaneAngle(p,r):M.angle(p,r),rounded=Math.round(value);return q((type==='plane'?'Найдите угол прямой с направлением ':type==='planes'?'Найдите меньший угол плоскостей с нормалями ':type==='line'?'Найдите угол прямых с направлениями ':'Найдите угол ненулевых векторов ')+tuple(p)+' и '+(type==='plane'?'плоскости с нормалью ':'')+tuple(r)+'.',rounded+'°.','Углы','Для векторов используйте cos φ=(a⃗·b⃗)/(|a⃗||b⃗|); для прямых берите модуль числителя; для прямой и плоскости та же дробь задаёт sin α.',{kind:'angle',type,a:p,b:r,result:rounded});};
 const pd=(point=P0,normal=n0,constant=D0)=>num('Найдите расстояние от P'+tuple(point)+' до плоскости '+normal[0]+'x+('+normal[1]+')y+('+normal[2]+')z+('+constant+')=0.',Math.abs(point.reduce((s,x,i)=>s+x*normal[i],constant))/Math.hypot(...normal),'Расстояние до плоскости','d=|Ax₀+By₀+Cz₀+D|/√(A²+B²+C²). Здесь значение числителя до модуля '+(point.reduce((s,x,i)=>s+x*normal[i],0)+constant)+', длина нормали '+root(normal.reduce((s,x)=>s+x*x,0))+'.',{kind:'planeDistance',point,normal,d:constant});
 const foot=()=>vec('Найдите основание перпендикуляра из P'+tuple(A)+' на плоскость z='+(-k)+'.',[A[0],A[1],-k],'Проекция','Проекция сохраняет первые две координаты, третья равна координате плоскости.',{kind:'planeFoot',point:A,normal:[0,0,1],d:k});
 const sphere=()=>q('Запишите уравнение сферы с центром C'+tuple(center)+' и радиусом '+d+'.','(x−'+k+')²+(y−1)²+(z+1)²='+d*d+'.','Уравнение сферы','Сумма квадратов отклонений от координат центра равна квадрату радиуса.',{kind:'sphere',center,radius:d});
 const motion=(type,point=A)=>{let image,condition;
  if(type==='central'){image=M.central(point,center);condition='центральной симметрии с центром '+tuple(center);}
  else if(type==='axis'){image=M.axial(point,[0,0,0],[0,0,1]);condition='осевой симметрии относительно Oz (поворот на 180°)';}
  else if(type==='mirror'){image=M.mirror(point,M.plane([0,0,1],-k));condition='зеркальной симметрии относительно z='+k;}
  else if(type==='translate'){image=M.translate(point,b);condition='переносе на вектор '+tuple(b);}
  else{image=M.similarity(point,center,-2);condition='подобии с центром '+tuple(center)+' и коэффициентом −2';}
  return vec('Найдите образ P'+tuple(point)+' при '+condition+'.',image,'Преобразование','Примените правило преобразования и проверьте положение центра, оси или плоскости.',{kind:'motion',type,point,center,shift:b,k:-2,planeZ:k});
 };
 const errors={
 axes:logic('Ученик считает, что точка '+tuple([k,1,0])+' лежит на Ox, потому что z=0. Исправьте вывод.','Точка лежит в Oxy; для Ox одновременно нужны y=0 и z=0.','axis-condition',true),
 components:logic('Ученик складывает координаты векторов в наклонном единичном базисе и вычисляет длину по сумме квадратов координат. Где ошибка?','Операции допустимы; формула длины по сумме квадратов требует ортонормированного базиса.','orthonormal',true),
 endpoints:logic('Для AB ученик вычел координаты B из A. Исправьте направление.','Нужно B−A; A−B задаёт BA.','endpoint-order',true),
 length:logic('Ученик нашёл расстояние как сумму трёх разностей координат. Исправьте метод.','Нужен квадратный корень из суммы квадратов трёх разностей.','distance-squares',true),
 sphere:logic('Для сферы радиуса '+d+' ученик записал справа '+d+'. Исправьте запись.','Справа должен стоять квадрат радиуса: '+d*d+'.','radius-square',true),
 angle:logic('Ученик ищет угол между нулевым и ненулевым векторами по формуле косинуса. Объясните ошибку.','Угол с нулевым вектором не определён; знаменатель равен 0.','zero-angle',true),
 dot:logic('Из a⃗·b⃗=0 ученик без условий заключил, что векторы задают угол 90°. Уточните условие.','Оба вектора должны быть ненулевыми; с нулевым вектором угол не определён.','nonzero-orthogonal',true),
 planeAngle:logic('Ученик нашёл угол 30° между прямой и нормалью и назвал его углом прямой с плоскостью. Исправьте ответ.','Угол прямой с плоскостью равен 60°: он дополнительный к углу с нормалью.','complement',true),
 planeDistance:logic('Ученик умножил уравнение плоскости на 5 и получил в 5 раз большее расстояние. Где ошибка?','Нужно разделить модуль значения уравнения на длину нормали; обе части отношения масштабируются одинаково.','normalization',true),
 symmetry:logic('Ученик отразил точку относительно Oz, изменив только знак z. Исправьте правило.','Осевая симметрия относительно Oz меняет знаки x и y, сохраняет z. Смена только z — зеркальная симметрия в Oxy.','axis-mirror',true),
 transfer:logic('Ученик назвал подобие с коэффициентом −2 движением. Объясните ошибку.','Расстояния увеличиваются в 2 раза; движение сохраняет расстояния. Отрицательный знак не делает преобразование движением.','similarity-distance',true),
 diagnostic:logic('Скалярное произведение ненулевых направлений даёт угол 135°. Ученик записал такой же угол между прямыми. Исправьте ответ.','Угол между прямыми равен 45°; используется модуль скалярного произведения.','line-acute',true)};
 let items;
 const projection=(point,axis)=>{const result=point.map((v,i)=>axis==='xy'?(i===2?0:v):axis==='yz'?(i===0?0:v):axis==='xz'?(i===1?0:v):(i===Number(axis)?v:0));return vec('Найдите проекцию P'+tuple(point)+' на '+({xy:'Oxy',yz:'Oyz',xz:'Oxz',0:'Ox',1:'Oy',2:'Oz'}[axis])+'.',result,'Координатные оси и плоскости','Сохраните координаты вдоль выбранных осей; остальные обнулите.',{kind:'coordinateProjection',point,axis});};
 if(mode==='axes')items=[num('P'+tuple(A)+'. Назовите координату z.',A[2],'Чтение координат','Координата z стоит третьей.',{kind:'component',point:A,index:2}),projection(A,'xy'),projection(A,'yz'),projection(A,'xz'),errors.axes,projection(B,'0'),projection(B,'1'),projection(B,'2'),logic('Какие координаты равны 0 у точки на Oz?','x=0 и y=0; z произволен.','axis-z'),projection(B,'xy')];
 else if(mode==='components')items=[operation('add'),operation('subtract'),operation('scale',-.5),operation('scale',2),errors.components,operation('scale',-2),operation('scale',3),operation('scale',0),logic('Меняются ли координаты свободного вектора при переносе в той же системе?','Нет: разности координат концов сохраняются.','free-vector'),operation('add')];
 else if(mode==='endpoints')items=[vec('A'+tuple(A)+', B'+tuple(B)+'. Найдите AB.',V.subtract(B,A),'Координаты концов','AB=B−A.',{kind:'operation',op:'subtract',a:B,b:A}),mid(),distance(),vec('A'+tuple(A)+', AB='+tuple(a)+'. Найдите B.',V.add(A,a),'Конец вектора','B=A+AB.',{kind:'operation',op:'add',a:A,b:a}),errors.endpoints,vec('Найдите BA для A'+tuple(A)+', B'+tuple(B)+'.',V.subtract(A,B),'Направление','BA=A−B.',{kind:'operation',op:'subtract',a:A,b:B}),length(),mid(a,b),logic('Можно ли восстановить B по A и AB?','Да, единственным образом: B=A+AB.','endpoint-recovery'),mid(B,a)];
 else if(mode==='length')items=[length(),distance(),mid(),foot(),errors.length,length(b),distance(A,a),operation('subtract'),logic('Можно ли измерять пространственную длину по экранной проекции?','Нет: экранная проекция зависит от камеры.','projection'),mid(a,b)];
 else if(mode==='sphere')items=[sphere(),q('C'+tuple(center)+', R='+d+'. P=C+('+d+';0;0). Где лежит P?','На сфере.','Принадлежность сфере','Расстояние CP равно R.',{kind:'spherePosition',center,radius:d,point:V.add(center,[d,0,0]),result:'surface'}),q('Сфера: (x−'+k+')²+(y−1)²+(z+1)²='+d*d+'. Найдите центр и радиус.','C'+tuple(center)+', R='+d+'.','Центр и радиус','Знаки в скобках противоположны координатам центра.',{kind:'sphere',center,radius:d}),distance(center,A),errors.sphere,sphere(),length(),mid(),logic('Условие точки шара отличается от условия сферы?','Для шара CP≤R, для сферы CP=R.','ball-sphere'),logic('Может ли квадрат радиуса быть отрицательным у действительной сферы?','Нет; положительный радиус имеет положительный квадрат.','positive-radius')];
 else if(mode==='angle')items=[angle(),angle(...vv[(p+3)%8]),angle(...vv[(p+6)%8]),angle([k,0,0],[-k,0,0]),errors.angle,angle([k,0,0],[-k,0,0]),angle(a,a),length(),logic('Какой диапазон угла между ненулевыми векторами?','От 0° до 180°.','vector-range'),angle([0,k,0],[k,k,0])];
 else if(mode==='dot')items=[dot(),dot([k,1,0],[1,-k,0]),dot(a,a),angle(),errors.dot,dot(b,a),operation('add'),length(),logic('Всегда ли скалярное произведение положительно?','Нет: знак зависит от угла; при тупом угле оно отрицательно.','dot-sign'),dot(a,V.scale(b,2))];
 else if(mode==='planeAngle')items=[angle(...pp[p],'plane'),angle(...ll[p],'line'),angle([0,k,0],[0,0,1],'plane'),angle([0,0,k],[0,0,1],'plane'),errors.planeAngle,angle(...ll[(p+1)%8],'planes'),dot(),length(),logic('Как вычислить меньший угол двух плоскостей по нормалям?','cos φ=|n₁·n₂|/(|n₁||n₂|); нормали ненулевые.','plane-angle'),angle([k,0,0],[-k,0,0],'line')];
 else if(mode==='planeDistance')items=[pd(),foot(),pd([k,1,k]),pd([1,2,k],[0,0,-3],3*(k-1)),errors.planeDistance,pd([1,2,3],[0,0,5],-5),mid(),distance(),logic('Когда расстояние от точки до плоскости равно 0?','Когда точка принадлежит плоскости.','point-plane-zero'),pd([0,0,0],[2,-1,2],-3*k)];
 else if(mode==='symmetry')items=[motion('central'),motion('axis'),motion('mirror'),motion('mirror',center),errors.symmetry,motion('axis',B),motion('central',B),distance(),logic('Сколько раз применить одну симметрию, чтобы вернуть точку?','Два раза; симметрия является инволюцией.','involution'),motion('mirror',B)];
 else if(mode==='transfer')items=[motion('translate'),motion('similarity'),num('При подобии k=−'+k+' исходная длина равна 3. Найдите длину образа.',3*k,'Масштаб длины','Длина умножается на |k|.',{kind:'scaleLength',length:3,k:-k}),motion('translate',B),errors.transfer,motion('similarity',B),distance(),mid(),logic('Как отменить перенос на вектор b⃗?','Выполнить перенос на −b⃗.','inverse-transfer'),logic('Чему равен масштаб площади при коэффициенте −2?','4; масштаб объёма равен 8.','scale-powers')];
 else if(mode==='diagnostic')items=[mid(),dot(),angle(...ll[(p+3)%8],'line'),pd(),errors.diagnostic,distance(),sphere(),motion('mirror'),logic('Что проверить перед вычислением угла по координатам?','Ненулевые направления и тип угла: векторы, прямые или прямая и плоскость.','angle-check'),operation('subtract')];
 else throw new RangeError('Unknown coordinate mode');
 return items;
}
window.KTP_G11_COORDINATE_QUESTION_POOL=pool;
})();
