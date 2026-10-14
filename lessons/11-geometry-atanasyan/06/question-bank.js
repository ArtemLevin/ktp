(function(){
'use strict';
const VP=window.KTP_G11_VECTOR_QUESTION_POOL,CP=window.KTP_G11_COORDINATE_QUESTION_POOL;
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a)||1;
const pi=(n,d=1)=>{const g=gcd(n,d);return d/g===1?n/g+'π':n/g+'π/'+(d/g);};
const make=(text,core,skill,solution,audit,extra={})=>({text,answerCore:core,answer:core+' '+solution,skill,solution,audit,auditOrigin:'review',...extra});
const measure=(text,coef,den,unit,skill,solution,audit)=>make(text,pi(coef,den)+' '+unit+'.',skill,solution,{...audit,coefficient:coef/den,numerator:coef,denominator:den,unit});
const number=(text,value,unit,skill,solution,audit)=>make(text,value+' '+unit+'.',skill,solution,{...audit,result:value,unit});
const concept=(text,core,rule,error=false,choices)=>make(text,core,'Условия и обоснование',core,{kind:'concept',rule},{errorAnalysis:error,...(choices?{choices}: {})});
const from=(origin,q)=>({...q,auditOrigin:origin});
const coord=(mode,v,index)=>from('coordinate',CP(mode,v)[index]);
const vector=(mode,v,index)=>from('vector',VP(mode,v)[index]);
function pool(mode,variant){
 if(!Number.isInteger(variant)||variant<1||variant>60)throw new RangeError('Variant 1–60 required');
 const k=variant+1,r=k,h=(2+variant%4)*k,pattern=(variant-1)%6;
 // Six equally demanding numeric families; each formula retains its original skill.
 const triple=variant%2? [3,4,5]:[5,12,13];
 const cr=triple[0]*k,ch=triple[1]*k,cl=triple[2]*k;
 const fr=variant%2?{R:4*k,r:k,h:4*k,l:5*k}:{R:6*k,r:k,h:12*k,l:13*k};
 const section=variant%2?{R:5*k,d:3*k,small:4*k}:{R:13*k,d:5*k,small:12*k};
 const coneSlice=[[3,6,2],[4,6,3],[4,8,2]][pattern%3];
 const sliceR=coneSlice[0]*k,sliceH=coneSlice[1]*k,sliceD=coneSlice[2]*k,sliceSmall=sliceR*sliceD/sliceH;
 const pb=(4+variant%3)*k*k,ph=(2+variant%4)*k;
 const pyramidBase=3*(2+variant%3)*k*k,pyramidH=(2+variant%4)*k;
 const boxSides=[k,(2+variant%3)*k,(3+(variant+1)%3)*k];
 const polySizes=[[3,1],[4,2],[5,3]][pattern%3],polyA=polySizes[0]**2*k*k,polyB=polySizes[1]**2*k*k,polyH=3*k;
 // Fixed operation sequence: identify shape, apply the formula and calculate exactly.
 const cylinderArea=(full=false)=>measure('У цилиндра r='+r+' см, h='+h+' см. Найдите '+(full?'полную':'боковую')+' площадь поверхности.',full?2*r*(h+r):2*r*h,1,'см²','Поверхность цилиндра',full?'S=2πr(h+r)=2π·'+r+'·('+h+'+'+r+').':'Sбок=2πrh=2π·'+r+'·'+h+'.',{kind:'cylinderArea',r,h,full});
 const coneArea=(full=false)=>measure('Конус: r='+cr+' см, h='+ch+' см. Найдите '+(full?'полную':'боковую')+' поверхность.',cr*(cl+(full?cr:0)),1,'см²','Поверхность конуса','l=√(r²+h²)='+cl+'; Sбок=πrl; для полной поверхности добавьте πr².',{kind:'coneArea',r:cr,h:ch,full});
 const sphereArea=()=>measure('Радиус сферы '+k+' см. Найдите площадь.',4*k*k,1,'см²','Площадь сферы','S=4πR²=4π·'+k+'².',{kind:'sphereArea',r:k});
 const frustumArea=()=>measure('Усечённый конус: R='+fr.R+', r='+fr.r+', h='+fr.h+' см. Найдите полную поверхность.',(fr.R+fr.r)*fr.l+fr.R*fr.R+fr.r*fr.r,1,'см²','Поверхность усечённого конуса','l=√(h²+(R−r)²)='+fr.l+'; S=π(R+r)l+π(R²+r²).',{kind:'frustumArea',R:fr.R,r:fr.r,h:fr.h});
 const sphereSection=()=>number('Радиус шара '+section.R+' см; плоскость удалена от центра на '+section.d+' см. Найдите радиус сечения.',section.small,'см','Сечение шара','ρ²=R²−d²='+section.small**2+'; ρ='+section.small+'.',{kind:'sphereSection',r:section.R,d:section.d});
 const axialCylinder=()=>number('Цилиндр r='+r+', h='+h+' см. Найдите площадь осевого сечения.',2*r*h,'см²','Осевое сечение','Прямоугольник имеет стороны 2r и h; S=2rh.',{kind:'axialCylinder',r,h});
 const axialCone=()=>number('Конус r='+cr+', h='+ch+' см. Найдите площадь осевого сечения.',cr*ch,'см²','Осевое сечение конуса','Треугольник имеет основание 2r и высоту h; S=rh.',{kind:'axialCone',r:cr,h:ch});
 const parallelCone=()=>measure('Конус r='+sliceR+', h='+sliceH+' см. Плоскость параллельна основанию и удалена от вершины на '+sliceD+' см. Найдите площадь сечения.',sliceSmall**2,1,'см²','Подобие в сечении','Коэффициент от вершины '+coneSlice[2]+'/'+coneSlice[1]+'; радиус сечения '+sliceSmall+'; S=πρ².',{kind:'parallelCone',r:sliceR,h:sliceH,d:sliceD});
 const prism=()=>number('Наклонная призма: площадь основания '+pb+' см², расстояние между основаниями '+ph+' см. Найдите объём.',pb*ph,'см³','Объём призмы','V=Sосн·h='+pb+'·'+ph+'.',{kind:'prism',base:pb,height:ph});
 const pyramid=()=>number('Пирамида: Sосн='+pyramidBase+' см², перпендикулярная высота '+pyramidH+' см. Найдите объём.',pyramidBase*pyramidH/3,'см³','Объём пирамиды','V=Sосн·h/3='+pyramidBase+'·'+pyramidH+'/3.',{kind:'pyramid',base:pyramidBase,height:pyramidH});
 const box=()=>number('Прямоугольный параллелепипед: рёбра '+boxSides.join(', ')+' см. Найдите объём.',boxSides.reduce((x,y)=>x*y,1),'см³','Параллелепипед','V=abc='+boxSides.join('·')+'.',{kind:'box',sides:boxSides});
 const polyFrustum=()=>number('Усечённая пирамида: площади оснований '+polyA+' и '+polyB+' см², высота '+polyH+' см. Найдите объём.',polyH*(polyA+polySizes[0]*polySizes[1]*k*k+polyB)/3,'см³','Усечённая пирамида','V=h/3·(S₁+√(S₁S₂)+S₂); средний член '+polySizes[0]*polySizes[1]*k*k+'.',{kind:'polyFrustum',A:polyA,B:polyB,h:polyH});
 const round=(type)=>{
  const R=variant%2?3*k:4*k,small=variant%2?k:2*k,frh=variant%2?9*k:6*k;
  const coef=type==='cylinder'?r*r*h:type==='cone'?r*r*h:type==='ball'?4*r*r*r:frh*(R*R+R*small+small*small);
  const den=type==='ball'||type==='cone'||type==='frustum'?3:1;
  const text=type==='ball'?'Шар радиуса '+r+' см. Найдите объём.':type==='frustum'?'Усечённый конус R='+R+', r='+small+', h='+frh+' см. Найдите объём.':(type==='cone'?'Конус':'Цилиндр')+' r='+r+', h='+h+' см. Найдите объём.';
  return measure(text,coef,den,'см³','Объём тела вращения',type==='ball'?'V=4πR³/3.':type==='frustum'?'V=πh(R²+Rr+r²)/3.':type==='cone'?'V=πr²h/3.':'V=πr²h.',{kind:'round',type,r,h,...(type==='frustum'?{R,r:small,h:frh}:{})});
 };
 const part=(type)=>{
  const R=5*k,height=(2+variant%2)*k,offset=(2+variant%2)*k;
  const cap=h=>h*h*(3*R-h),n=type==='segment'?cap(height):type==='sector'?2*R*R*height:cap(R)-cap(R-offset);
  const text=type==='layer'?'Шар R='+R+' см ограничен плоскостями z=0 и z='+offset+' см относительно центра. Найдите объём слоя.':(type==='segment'?'Шаровой сегмент':'Шаровой сектор')+': R='+R+' см, высота соответствующего сегмента '+height+' см. Найдите объём.';
  return measure(text,n,3,'см³','Шаровые части',type==='segment'?'V=πh²(3R−h)/3.':type==='sector'?'V=2πR²h/3.':'Вычтите из объёма полушара верхний сегмент высоты '+(R-offset)+' см.',{kind:'roundPart',type,R,height,offset});
 };
 const cavity=()=>{
  const R=(3+variant%2)*k,inner=k,H=(2+variant%2)*k;
  return measure('В цилиндре R='+R+', h='+H+' см просверлен соосный сквозной канал r='+inner+' см. Найдите объём материала.',(R*R-inner*inner)*H,1,'см³','Полость','V=π(R²−r²)h=π('+R*R+'−'+inner*inner+')·'+H+'.',{kind:'cavity',R,r:inner,h:H});
 };
 const joinedVolume=()=>measure('Цилиндр радиуса '+r+' и высоты '+h+' см соединён основанием с полушаром того же радиуса. Найдите общий объём.',3*r*r*h+2*r*r*r,3,'см³','Составной объём','V=πr²h+2πr³/3; внутренние части не перекрываются.',{kind:'joinedVolume',r,h});
 const joinedArea=()=>measure('Цилиндр r='+r+', h='+h+' см накрыт полушаром того же радиуса; снизу имеется основание. Найдите внешнюю поверхность.',2*r*h+3*r*r,1,'см²','Внешняя поверхность','S=2πrh+2πr²+πr². Общий диск цилиндра и полушара скрыт внутри.',{kind:'joinedArea',r,h});
 const joinedCone=()=>{
  const hc=(2+variant%2)*k,hk=(3+3*(variant%2))*k;
  return measure('Цилиндр r='+r+', h='+hc+' см соединён с конусом r='+r+', h='+hk+' см без перекрытия. Найдите объём.',r*r*(3*hc+hk),3,'см³','Составление объёмов','V=πr²hц+πr²hк/3.',{kind:'joinedCone',r,hc,hk});
 };
 const rightTriangle=()=>number('В прямоугольном треугольнике катеты '+3*k+' и '+4*k+' см. Найдите площадь.',6*k*k,'см²','Площадь треугольника','S=ab/2='+3*k+'·'+4*k+'/2.',{kind:'rightTriangle',a:3*k,b:4*k});
 const hypotenuse=()=>number('Катеты прямоугольного треугольника '+3*k+' и '+4*k+' см. Найдите гипотенузу.',5*k,'см','Теорема Пифагора','c=√(a²+b²)='+5*k+'.',{kind:'hypotenuse',a:3*k,b:4*k});
 const similarArea=()=>number('Площадь фигуры '+6*k*k+' см². Линейный масштаб равен 3. Найдите площадь подобной фигуры.',54*k*k,'см²','Масштаб площади','Площадь умножается на 3²=9.',{kind:'similarArea',area:6*k*k,k:3});
 const trig=()=>number('Наклонный отрезок длины '+2*k+' см образует с плоскостью угол 30°. Найдите его перпендикулярную составляющую.',k,'см','Рабочий треугольник','h=l·sin30°=l/2.',{kind:'trig',length:2*k});
 const capacity=()=>measure('Цилиндрическая ёмкость r='+k+' дм, h=3 дм. Сколько литров она вмещает?',3*k*k,1,'л','Единицы объёма','1 дм³=1 л; V=πr²h='+3*k*k+'π дм³.',{kind:'capacity',r:k,h:3});
 const fill=()=>measure('Ёмкость цилиндрической формы r='+k+', h=3 дм заполнена на 2/3. Найдите объём воды в литрах.',2*k*k,1,'л','Доля вместимости','Сначала вычислите вместимость 3πr², затем умножьте на 2/3.',{kind:'fill',r:k,h:3,fraction:2/3});
 const paint=()=>{const area=6*k*k,count=Math.ceil(11*area/100);return number('Замкнутый цилиндр r='+k+', h='+2*k+' м нужно покрасить с запасом 10%. Одна банка покрывает 10π м². Сколько целых банок требуется?',count,'банок','Практическая модель','S=6πr²; с запасом 6,6πr². Делим на 10π и округляем вверх.',{kind:'paint',r:k,h:2*k,reserve:1.1,coveragePi:10});};
 const units=()=>number('Вместимость сосуда '+3*k+' л. Выразите её в см³.',3000*k,'см³','Перевод единиц','1 л=1 дм³=1000 см³.',{kind:'litres',litres:3*k});
 const equalLength=()=>variant%2?concept('Два вектора имеют длину '+k+' см. Достаточно ли этого для их равенства? Приведите контрпример.','Нет: ненулевые a⃗ и −a⃗ имеют равные длины и противоположные направления.','equal-length'):concept('Векторы a⃗=('+k+';0;0) и b⃗=(0;'+k+';0) имеют одну длину. Равны ли они? Обоснуйте.','Нет: перпендикулярные векторы могут иметь одинаковую длину, но разные направления.','equal-length-orthogonal');
 const equalVolume=()=>variant%2?concept('Призма и пирамида имеют одинаковый объём '+k*k*k+' см³. Гарантирует ли это одинаковую форму?','Нет: призма и пирамида могут иметь одинаковый объём. Например, при Sосн='+k*k+' см² высоты '+k+' и '+3*k+' см дают у обеих V='+k*k*k+' см³, хотя формы различаются.','equal-volume'):concept('Призма и пирамида имеют одинаковую высоту '+2*k+' см. Могут ли они иметь равные объёмы при разных основаниях?','Да: призма и пирамида имеют одинаковый объём '+2*k*k*k+' см³ при Sосн='+k*k+' и '+3*k*k+' см² соответственно; Vпр='+k*k+'·'+2*k+', Vпир='+3*k*k+'·'+2*k+'/3.','equal-volume');
 const skewExample=()=>variant%2?concept('Верно ли: две непараллельные прямые в пространстве обязательно пересекаются?','Нет: прямые могут быть скрещивающимися. Например, ось Ox и прямая через (0;1;'+k+') и (0;2;'+k+') не пересекаются и непараллельны.','skew-lines'):concept('Две прямые: первая проходит через (0;0;0) и (1;0;0), вторая — через (0;'+k+';1) и (0;'+k+';2). Обязательно ли они пересекаются?','Нет: прямые могут быть скрещивающимися: направления Ox и Oz различны, а координата y второй прямой равна '+k+'.','skew-lines');
 const errors={
 surface:concept('Ученик включил только одно основание в полную поверхность замкнутого цилиндра. Исправьте формулу.','Полная поверхность: 2πrh+2πr²; оснований два.','two-bases',true),
 sections:concept('Ученик считает радиусом сечения шара расстояние секущей плоскости от центра. Исправьте связь.','ρ²=R²−d²; радиус сечения и расстояние до плоскости — разные катеты.','section-radius',true),
 polyhedron:concept('Ученик подставил наклонное боковое ребро вместо высоты пирамиды. Что проверить?','Высота должна быть перпендикулярна плоскости основания; V=Sоснh/3.','true-height',true),
 round:concept('Ученик для конуса использовал V=πr²h. Найдите ошибку.','Нужен коэффициент 1/3: V=πr²h/3.','cone-third',true),
 composite:concept('Ученик посчитал общую поверхность цилиндра и полушара как сумму полных поверхностей частей. Исправьте способ.','Из суммы поверхностей частей вычтите два общих диска: они находятся внутри соединения.','hidden-interface',true),
 plane:concept('Линейный масштаб равен 3. Ученик умножил площадь на 3. Исправьте результат.','Площадь умножается на 9; объём — на 27.','scale-powers',true),
 practical:concept('После деления площади на расход одной банки ученик округлил число банок вниз. Исправьте решение.','Нужно округлить вверх до целого числа, иначе материала не хватит.','round-up',true)};
 let p;
 if(mode==='surface')p=[cylinderArea(),coneArea(),sphereArea(),frustumArea(),errors.surface,cylinderArea(true),coneArea(true),sphereArea(),errors.surface,coneArea(true)];
 else if(mode==='sections')p=[sphereSection(),axialCylinder(),axialCone(),parallelCone(),errors.sections,sphereSection(),parallelCone(),axialCylinder(),concept('При d=R как выглядит сечение шара?','Одна точка касания; радиус сечения 0.','sphere-tangent'),concept('При d>R есть ли сечение шара плоскостью?','Нет: плоскость проходит вне шара.','sphere-outside',true)];
 else if(mode==='polyhedron')p=[prism(),pyramid(),box(),polyFrustum(),errors.polyhedron,prism(),pyramid(),box(),errors.polyhedron,polyFrustum()];
 else if(mode==='round')p=[round('cylinder'),round('cone'),round('ball'),round('frustum'),errors.round,part('segment'),part('sector'),part('layer'),errors.round,round('cylinder')];
 else if(mode==='composite')p=[joinedArea(),cavity(),joinedVolume(),joinedCone(),errors.composite,joinedVolume(),joinedCone(),cavity(),errors.composite,joinedArea()];
 else if(mode==='vectors')p=[coord('endpoints',variant,0),coord('endpoints',variant,1),vector('basis',variant,1),vector('chain',variant,0),vector('basis',variant,4),coord('components',variant,0),vector('composite',variant,0),coord('endpoints',variant,3),vector('coplanar',variant,8),vector('diagnostic',variant,9)];
 else if(mode==='metric')p=[coord('planeAngle',variant,0),coord('planeDistance',variant,0),coord('length',variant,1),coord('planeAngle',variant,5),coord('diagnostic',variant,4),coord('dot',variant,1),coord('planeDistance',variant,1),coord('angle',variant,1),coord('planeAngle',variant,8),coord('planeDistance',variant,4)];
 else if(mode==='plane')p=[rightTriangle(),hypotenuse(),similarArea(),trig(),errors.plane,rightTriangle(),similarArea(),hypotenuse(),errors.plane,trig()];
 else if(mode==='proof')p=[equalLength(),vector('coplanar',variant,4),coord('angle',variant,4),equalVolume(),vector('composite',variant,4),vector('basis',variant,8),coord('dot',variant,4),skewExample(),vector('coplanar',variant,9),concept('Ученик измеряет истинный угол по пространственному чертежу. Объясните ошибку.','Проекция не сохраняет пространственные углы; нужны данные модели и обоснованное вычисление.','projection',true)];
 else if(mode==='practical')p=[capacity(),paint(),fill(),units(),errors.practical,capacity(),fill(),paint(),errors.practical,units()];
 else if(mode==='diagnostic'||mode==='correction'){
  const domains=['surface','sections','polyhedron','round','composite','vectors','metric','plane','proof','practical'];
  p=domains.map((domain,i)=>{const q=pool(domain,variant)[i===4?4:0];return {...q,domain};});
 }else throw new RangeError('Unknown review mode');
 return p;
}
const domains=[['surface','Поверхности',57,'01'],['sections','Сечения',58,'01'],['polyhedron','Объёмы многогранников',59,'02'],['round','Объёмы тел вращения',60,'03'],['composite','Составная модель',61,'03'],['vectors','Векторы и координаты',62,'04'],['metric','Углы и расстояния',63,'05'],['plane','Планиметрия',64,'05'],['proof','Условия и доказательство',65,'04'],['practical','Модель и единицы',66,'03']].map(([id,title,lesson,topic])=>({id,title,lesson,topic}));
window.KTP_G11_REVIEW_DOMAINS=domains;window.KTP_G11_REVIEW_QUESTION_POOL=pool;
})();
