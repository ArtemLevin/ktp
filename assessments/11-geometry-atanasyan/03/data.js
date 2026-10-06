(function(){
'use strict';
const task=(text,answer,points,skill,solution)=>({text,answer,points,skill,solution});
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=a%b;a=b;b=t;}return a||1;};
const cubeRootInt=n=>Math.round(Math.cbrt(n));
const ratioFromCubes=(a,b)=>{
  let x=cubeRootInt(a),y=cubeRootInt(b),g=gcd(x,y);
  return (x/g)+':'+(y/g)+'.';
};
const pi=(num,den=1)=>{
  num=Math.round(num);den=Math.round(den);
  const g=gcd(num,den);num/=g;den/=g;
  return den===1?num+'π.':num+'π/'+den+'.';
};
const cylinder=(r,h)=>({text:'Цилиндр имеет радиус '+r+' и высоту '+h+'. Найдите объём.',answer:pi(r*r*h),solution:'V=πr²h=π·'+r+'²·'+h+'='+pi(r*r*h).replace('.','')+'.'});
const cylinderCavity=(R,r,h)=>{
  const c=(R*R-r*r)*h;
  return{text:'В цилиндре радиуса '+R+' и высоты '+h+' просверлен соосный сквозной канал радиуса '+r+'. Найдите объём оставшегося материала.',answer:pi(c),solution:'V=π(R²−r²)h=π('+R+'²−'+r+'²)·'+h+'='+pi(c).replace('.','')+'.'};
};
const cylinderInverse=(vPi,r)=>{
  const h=vPi/(r*r);
  return{text:'Объём цилиндра равен '+vPi+'π, радиус '+r+'. Найдите высоту.',answer:String(h)+'.',solution:'h=V/(πr²)='+vPi+'/'+(r*r)+'='+h+'.'};
};
const cone=(r,h)=>({text:'Конус имеет радиус '+r+' и высоту '+h+'. Найдите объём.',answer:pi(r*r*h,3),solution:'V=1/3·πr²h=1/3·π·'+r+'²·'+h+'='+pi(r*r*h,3).replace('.','')+'.'});
const coneSlant=(r,h,l)=>({text:'Радиус конуса '+r+', образующая '+l+'. Найдите высоту и объём конуса.',answer:'h='+h+'; '+pi(r*r*h,3),solution:'h=√('+l+'²−'+r+'²)='+h+'. Затем V=1/3·π·'+r+'²·'+h+'='+pi(r*r*h,3).replace('.','')+'.'});
const frustum=(R,r,h)=>{
  const n=h*(R*R+R*r+r*r);
  return{text:'Усечённый конус имеет радиусы оснований '+R+' и '+r+', высоту '+h+'. Найдите объём.',answer:pi(n,3),solution:'V=πh/3·(R²+Rr+r²)=π·'+h+'/3·('+(R*R)+'+'+(R*r)+'+'+(r*r)+')='+pi(n,3).replace('.','')+'.'};
};
const ball=(R)=>({text:'Шар имеет радиус '+R+'. Найдите объём.',answer:pi(4*R*R*R,3),solution:'V=4/3·πR³=4/3·π·'+R+'³='+pi(4*R*R*R,3).replace('.','')+'.'});
const sphereArea=(R)=>({text:'Сфера имеет радиус '+R+'. Найдите её площадь.',answer:pi(4*R*R),solution:'S=4πR²=4π·'+R+'²='+pi(4*R*R).replace('.','')+'.'});
const segment=(R,h)=>{
  const n=h*h*(3*R-h);
  return{text:'Радиус шара '+R+', высота шарового сегмента '+h+'. Найдите объём сегмента.',answer:pi(n,3),solution:'Vсег=πh²/3·(3R−h)=π·'+h+'²/3·('+(3*R)+'−'+h+')='+pi(n,3).replace('.','')+'.'};
};
const sectionSegment=(R,d)=>{
  const rho=Math.sqrt(R*R-d*d),h=R-d,n=h*h*(3*R-h);
  return{text:'Радиус шара '+R+', секущая плоскость удалена от центра на '+d+'. Найдите радиус круга сечения и объём меньшего сегмента.',answer:'ρ='+rho+'; '+pi(n,3),solution:'ρ=√(R²−d²)=√('+(R*R)+'−'+(d*d)+')='+rho+', h=R−d='+h+'. Затем Vсег='+pi(n,3).replace('.','')+'.'};
};
const sector=(R,h)=>{
  const n=2*R*R*h;
  return{text:'Радиус шара '+R+', высота соответствующего шарового сегмента '+h+'. Найдите объём шарового сектора.',answer:pi(n,3),solution:'Vсект=2/3·πR²h=2/3·π·'+R+'²·'+h+'='+pi(n,3).replace('.','')+'.'};
};
const segCoeff=(R,h)=>h*h*(3*R-h)/3;
const layer=(R,a,b)=>{
  const ha=R-a,hb=R-b;
  const na=ha*ha*(3*R-ha),nb=hb*hb*(3*R-hb),n=na-nb;
  return{text:'В шаре радиуса '+R+' две параллельные плоскости имеют координаты z='+a+' и z='+b+' относительно центра. Найдите объём слоя между ними.',answer:pi(n,3),solution:'Объём слоя равен разности верхних сегментов: V='+pi(na,3).replace('.','')+'−'+pi(nb,3).replace('.','')+'='+pi(n,3)};
};
const similar=(a,b)=>({text:'Объёмы двух подобных тел вращения относятся как '+a+':'+b+'. Найдите отношение соответствующих линейных размеров.',answer:ratioFromCubes(a,b),solution:'Линейный коэффициент равен отношению кубических корней: ∛'+a+':∛'+b+'='+ratioFromCubes(a,b)});
const compositeHemisphere=(r,h)=>{
  const n=3*r*r*h+2*r*r*r;
  return{text:'К цилиндру радиуса '+r+' и высоты '+h+' присоединена полусфера того же радиуса. Найдите общий объём.',answer:pi(n,3),solution:'V=πr²h+2/3·πr³='+pi(3*r*r*h,3).replace('.','')+'+'+pi(2*r*r*r,3).replace('.','')+'='+pi(n,3)};
};
const compositeCone=(r,hc,hk)=>{
  const n=3*r*r*hc+r*r*hk;
  return{text:'Цилиндр радиуса '+r+' и высоты '+hc+' соединён с конусом того же радиуса и высоты '+hk+'. Найдите общий объём.',answer:pi(n,3),solution:'V=πr²·'+hc+'+1/3·πr²·'+hk+'='+pi(n,3)};
};

const I=[
 {
  concept:['Почему объём тела вращения записывают в кубических единицах?','Потому что объём характеризует трёхмерное тело и имеет кубическую размерность.','VOLUME_UNITS'],
  cyl:()=>cylinder(3,5),cone:()=>cone(4,6),fr:()=>frustum(5,2,3),part:()=>segment(5,2),transfer:()=>similar(125,64),
  error:['Ученик для конуса r=4, h=6 записал V=πr²h. Найдите ошибку и исправьте ответ.','Пропущен коэффициент 1/3. Верно V=1/3·π·4²·6=32π.','CONE_FACTOR']
 },
 {
  concept:['Чем площадь сферы отличается от объёма шара по размерности?','Площадь сферы имеет квадратную размерность, объём шара — кубическую.','AREA_VOLUME'],
  cyl:()=>cylinder(4,6),cone:()=>coneSlant(5,12,13),fr:()=>frustum(6,3,4),part:()=>ball(3),transfer:()=>compositeHemisphere(2,5),
  error:['Диаметр шара равен 8. Ученик подставил 8 как R в формулу объёма. Исправьте рассуждение.','Радиус равен 4. В формулу V=4/3·πR³ нужно подставить R=4.','DIAMETER_RADIUS']
 },
 {
  concept:['Если все линейные размеры подобного тела увеличили в 3 раза, как изменится объём?','Увеличится в 27 раз.','SIMILAR_K3'],
  cyl:()=>cylinderCavity(5,2,4),cone:()=>cone(6,8),fr:()=>frustum(7,1,3),part:()=>sectionSegment(5,3),transfer:()=>similar(343,125),
  error:['Ученик при коэффициенте подобия k=3 умножил объём на 9. Исправьте правило.','9=k² относится к площадям. Объём нужно умножать на k³=27.','SIMILAR_K2_K3']
 },
 {
  concept:['Каков допустимый диапазон высоты шарового сегмента радиуса R?','0<h≤2R.','SEGMENT_DOMAIN'],
  cyl:()=>cylinder(2,9),cone:()=>cone(3,10),fr:()=>frustum(4,2,6),part:()=>sector(6,3),transfer:()=>compositeCone(3,4,2),
  error:['Ученик вычислил объём усечённого конуса как h·π(R²+r²)/2. Объясните ошибку.','Площади подобных сечений меняются квадратично. Верно V=πh/3·(R²+Rr+r²).','FRUSTUM_AVERAGE']
 },
 {
  concept:['Назовите формулы площади сферы и объёма шара радиуса R.','S=4πR²; V=4/3·πR³.','SPHERE_BALL_FORMULAS'],
  cyl:()=>cylinderInverse(72,3),cone:()=>cone(5,9),fr:()=>frustum(8,4,3),part:()=>sphereArea(4),transfer:()=>similar(216,27),
  error:['Ученик назвал радиус круга сечения ρ высотой шарового сегмента. Исправьте.','ρ лежит в секущей плоскости; высота сегмента измеряется вдоль диаметра перпендикулярно этой плоскости.','SEGMENT_HEIGHT']
 },
 {
  concept:['Почему нельзя измерять истинный радиус тела по перспективному SVG-рисунку?','Проекция зависит от камеры и не сохраняет истинные длины; параметры берут из условия и математической модели.','PROJECTION_METRIC'],
  cyl:()=>cylinderCavity(6,3,5),cone:()=>coneSlant(8,15,17),fr:()=>frustum(5,3,6),part:()=>layer(5,-1,2),transfer:()=>compositeHemisphere(2,6),
  error:['Ученик получил объём 72π см². Что неверно в записи?','Объём должен быть записан в кубических единицах: 72π см³.','VOLUME_UNITS']
 }
];

function independent(v){
 const q=I[v-1],a=q.cyl(),b=q.cone(),c=q.fr(),d=q.part(),e=q.transfer();
 return{id:v,tasks:[
  task(q.concept[0],q.concept[1],1,q.concept[2],'1 балл за корректную формулировку геометрического смысла или правила.'),
  task(a.text,a.answer,2,a.text.includes('канал')?'CYLINDER_CAVITY':a.text.includes('Объём цилиндра равен')?'CYLINDER_INVERSE':'CYLINDER_VOLUME',a.solution),
  task(b.text,b.answer,2,b.text.includes('образующая')?'CONE_SLANT':'CONE_VOLUME',b.solution),
  task(c.text,c.answer,2,'FRUSTUM_VOLUME',c.solution),
  task(d.text,d.answer,2,d.text.includes('сектора')?'SPHERICAL_SECTOR':d.text.includes('слоя')?'SPHERICAL_LAYER':d.text.includes('Сфера')?'SPHERE_AREA':d.text.includes('Шар имеет')?'BALL_VOLUME':'SPHERICAL_SEGMENT',d.solution),
  task(e.text,e.answer,2,e.text.includes('подобных')?'SIMILAR_SOLIDS':'COMPOSITE_VOLUME',e.solution),
  task(q.error[0],q.error[1],3,q.error[2],'3 балла: обнаружить неверный шаг, записать верное правило и объяснить геометрический смысл исправления.')
 ]};
}

const C=[
 {
  concept:['Как связаны объёмы цилиндра и конуса с одинаковыми основанием и высотой?','Объём цилиндра в 3 раза больше объёма конуса.','CYLINDER_CONE_RATIO'],
  cyl:()=>cylinder(4,5),cone:()=>coneSlant(3,4,5),fr:()=>frustum(5,2,6),sphere:()=>({text:'Шар радиуса 3. Найдите площадь сферы и объём шара.',answer:'S=36π; V=36π.',solution:'S=4π·3²=36π; V=4/3·π·3³=36π.'}),seg:()=>segment(5,2),part:()=>sector(6,3),sim:()=>similar(125,64),comp:()=>compositeHemisphere(2,5),
  error:['Ученик в формуле объёма конуса подставил образующую 5 вместо высоты 4. Исправьте решение.','В объём входит перпендикулярная высота h=4. Для r=3 получаем V=12π.','CONE_SLANT']
 },
 {
  concept:['Какая величина имеет формулу 4πR² и какая — 4/3·πR³?','4πR² — площадь сферы; 4/3·πR³ — объём шара.','AREA_VOLUME'],
  cyl:()=>cylinder(5,4),cone:()=>coneSlant(5,12,13),fr:()=>frustum(6,3,3),sphere:()=>({text:'Шар радиуса 4. Найдите площадь сферы и объём шара.',answer:'S=64π; V=256π/3.',solution:'S=4π·4²=64π; V=4/3·π·4³=256π/3.'}),seg:()=>segment(6,3),part:()=>layer(5,-1,2),sim:()=>similar(216,27),comp:()=>compositeCone(3,5,4),
  error:['Ученик записал 4πR² как объём шара. Исправьте.','4πR² — площадь сферы. Объём шара равен 4/3·πR³.','AREA_VOLUME']
 },
 {
  concept:['Как получить линейный коэффициент подобия по отношению объёмов?','Извлечь кубический корень из отношения объёмов.','SIMILAR_INVERSE'],
  cyl:()=>cylinder(3,8),cone:()=>coneSlant(8,15,17),fr:()=>frustum(7,1,6),sphere:()=>({text:'Шар радиуса 5. Найдите площадь сферы и объём шара.',answer:'S=100π; V=500π/3.',solution:'S=4π·5²=100π; V=4/3·π·5³=500π/3.'}),seg:()=>segment(5,1),part:()=>sector(5,2),sim:()=>similar(343,125),comp:()=>cylinderCavity(6,2,5),
  error:['Для усечённого конуса ученик использовал V=πh(R²+r²)/2. Исправьте модель.','Верно V=πh/3·(R²+Rr+r²); смешанный член Rr обязателен.','FRUSTUM_AVERAGE']
 },
 {
  concept:['Что происходит с кругом сечения шара, когда расстояние d от центра достигает R?','Радиус сечения становится 0; секущая плоскость становится касательной.','TANGENT_LIMIT'],
  cyl:()=>cylinder(6,3),cone:()=>coneSlant(7,24,25),fr:()=>frustum(4,2,9),sphere:()=>({text:'Шар радиуса 6. Найдите площадь сферы и объём шара.',answer:'S=144π; V=288π.',solution:'S=4π·6²=144π; V=4/3·π·6³=288π.'}),seg:()=>segment(8,4),part:()=>layer(6,-2,1),sim:()=>similar(64,8),comp:()=>compositeHemisphere(3,4),
  error:['Диаметр шара 12. Ученик подставил R=12 в формулу объёма. Исправьте.','Радиус равен 6. Нужно использовать V=4/3·π·6³=288π.','DIAMETER_RADIUS']
 },
 {
  concept:['Почему при подобии объём масштабируется как k³?','Тело масштабируется по трём независимым линейным направлениям, поэтому коэффициенты перемножаются: k·k·k=k³.','SIMILAR_K3'],
  cyl:()=>cylinder(2,12),cone:()=>coneSlant(20,21,29),fr:()=>frustum(8,4,6),sphere:()=>({text:'Шар радиуса 2. Найдите площадь сферы и объём шара.',answer:'S=16π; V=32π/3.',solution:'S=4π·2²=16π; V=4/3·π·2³=32π/3.'}),seg:()=>segment(4,2),part:()=>sector(4,4),sim:()=>similar(729,216),comp:()=>compositeCone(4,6,3),
  error:['Ученик при k=3 применил к объёму коэффициент 9. Исправьте.','9=k² относится к площадям. Объём масштабируется как k³=27.','SIMILAR_K2_K3']
 },
 {
  concept:['Назовите надёжный порядок решения составной задачи на объём.','Разбить модель на стандартные тела, назначить знаки частям, привести единицы, вычислить объёмы, сложить или вычесть и проверить результат.','COMPOSITE_ROUTE'],
  cyl:()=>cylinder(7,2),cone:()=>coneSlant(12,35,37),fr:()=>frustum(5,3,12),sphere:()=>({text:'Шар радиуса 7. Найдите площадь сферы и объём шара.',answer:'S=196π; V=1372π/3.',solution:'S=4π·7²=196π; V=4/3·π·7³=1372π/3.'}),seg:()=>segment(10,4),part:()=>layer(5,-2,2),sim:()=>similar(512,125),comp:()=>cylinderCavity(5,3,6),
  error:['Ученик измерил радиус шара линейкой на SVG-проекции и использовал это значение в формуле. Почему решение ненадёжно?','Перспективная проекция зависит от камеры и не сохраняет истинные длины. Радиус должен быть получен из условия или математической модели.','PROJECTION_METRIC']
 }
];

function control(v){
 const q=C[v-1],a=q.cyl(),b=q.cone(),c=q.fr(),d=q.sphere(),e=q.seg(),f=q.part(),g=q.sim(),h=q.comp();
 return{id:v,tasks:[
  task(q.concept[0],q.concept[1],1,q.concept[2],'1 балл за точную формулировку свойства или метода.'),
  task(a.text,a.answer,2,a.text.includes('канал')?'CYLINDER_CAVITY':'CYLINDER_VOLUME',a.solution),
  task(b.text,b.answer,2,'CONE_SLANT',b.solution),
  task(c.text,c.answer,2,'FRUSTUM_VOLUME',c.solution),
  task(d.text,d.answer,2,'SPHERE_BALL',d.solution),
  task(e.text,e.answer,2,'SPHERICAL_SEGMENT',e.solution),
  task(f.text,f.answer,2,f.text.includes('слоя')?'SPHERICAL_LAYER':'SPHERICAL_SECTOR',f.solution),
  task(g.text,g.answer,2,'SIMILAR_SOLIDS',g.solution),
  task(h.text,h.answer,2,h.text.includes('канал')?'CYLINDER_CAVITY':'COMPOSITE_VOLUME',h.solution),
  task(q.error[0],q.error[1],3,q.error[2],'3 балла: обнаружить ошибку, дать корректное вычисление или правило и объяснить геометрический смысл.')
 ]};
}

window.KTP_ASSESSMENT_DATA={
 meta:{
  rowId:'11-geometry-atanasyan',
  grade:11,
  subject:'Геометрия',
  book:'Атанасян · Бутузов · Кадомцев и др. + ФРП-2025',
  year:'2026/27',
  topic:'03',
  sourceNote:'Тема «Объёмы тел вращения»: глава V, п. 55 и пп. 59–62* проверяемого оглавления Атанасяна 2019/2026; ФРП-2025 — объёмы цилиндра, конуса, шара, усечённого конуса, шаровых частей, площадь сферы, подобные тела и практические задачи. Пункт 56 с определённым интегралом не входит в обязательный контроль; векторы и координаты относятся к следующим сериям. Все задания разработаны специально для KTP 3.0.'
 },
 topic:{
  title:'Объёмы тел вращения',
  source:'Атанасян Л. С. и др., «Геометрия. 10–11 классы»: глава V, п. 55, пп. 59–62*; ФРП-2025.',
  independent:{
   duration:'30–35 минут',
   maxScore:14,
   purpose:'Проверить цилиндр, конус, усечённый конус, шар и его части, подобие или составную модель, а также анализ типичной ошибки.',
   variants:Array.from({length:6},(_,i)=>independent(i+1))
  },
  control:{
   duration:'45 минут',
   maxScore:20,
   purpose:'Развёрнутый контроль: цилиндр, конус с осевым сечением, усечённый конус, сфера и шар, шаровой сегмент, сектор или слой, подобие, составная модель и анализ ошибки.',
   variants:Array.from({length:6},(_,i)=>control(i+1))
  }
 }
};
})();