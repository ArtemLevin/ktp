(function(){
'use strict';
// Parallel examination forms: fixed mathematical operation and scoring in every slot.
// Cognitive demand is a rubric for expert review, not a psychometric calibration.
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a)||1;
const pi=(numerator,denominator=1)=>{
 const g=gcd(numerator,denominator),n=numerator/g,d=denominator/g;
 return d===1?n+'π.':n+'π/'+d+'.';
};
const bodyPi=s=>s.endsWith('.')?s.slice(0,-1):s;
const fmtPi=(num,den=1)=>bodyPi(pi(num,den));
const parts=(...steps)=>steps.map(text=>({points:1,text}));
const make=(text,answer,skill,solution,profile,audit)=>({
 text,answer,skill,solution,points:profile.criteria.length,
 criteria:parts(...profile.criteria),cognitive:{
  family:profile.family,dok:profile.dok,steps:profile.criteria.length,method:profile.method
 },audit
});
const P={
 concept:{family:'volume-scaling',dok:1,method:'apply-cube-rule',criteria:['Распознать кубическую зависимость']},
 cylinder:{family:'direct-cylinder-volume',dok:2,method:'single-formula',criteria:['Выбрать формулу объёма цилиндра','Выполнить подстановку и вычисление']},
 cone:{family:'slant-to-cone-volume',dok:2,method:'pythagoras-then-volume',criteria:['Восстановить перпендикулярную высоту по теореме Пифагора','Найти объём конуса с коэффициентом 1/3']},
 frustum:{family:'frustum-volume',dok:2,method:'frustum-formula',criteria:['Записать формулу объёма усечённого конуса','Правильно вычислить объём']},
 sector:{family:'spherical-sector',dok:2,method:'sector-formula',criteria:['Выбрать формулу объёма шарового сектора','Подставить параметры и вычислить']},
 similar:{family:'volume-similarity',dok:2,method:'cube-root-scale',criteria:['Применить кубический закон подобия','Найти отношение линейных размеров']},
 coneError:{family:'cone-factor-reasoning',dok:3,method:'identify-correct-justify',criteria:['Определить ошибку в формуле ученика','Вычислить правильный объём','Объяснить коэффициент 1/3 сравнением с цилиндром']},
 shortCylinder:{family:'direct-cylinder-volume',dok:1,method:'single-formula',criteria:['Найти объём по V=πr²h']},
 sphereBall:{family:'sphere-area-and-ball-volume',dok:2,method:'two-formulas',criteria:['Вычислить площадь сферы','Вычислить объём шара']},
 segment:{family:'spherical-segment',dok:2,method:'segment-formula',criteria:['Записать формулу объёма шарового сегмента','Правильно вычислить коэффициент при π']},
 layer:{family:'spherical-layer',dok:3,method:'two-caps-subtraction',criteria:['Определить высоты двух вспомогательных сегментов','Правильно получить их объёмы','Вычесть объёмы в нужном порядке']},
 composite:{family:'cylinder-with-hemisphere',dok:2,method:'add-component-volumes',criteria:['Вычислить объёмы цилиндра и полушара','Сложить объёмы без двойного счёта']},
 cavityError:{family:'cylindrical-hole-proof',dok:3,method:'subtract-compute-bound',criteria:['Объяснить, почему объём канала вычитается','Вычислить объём оставшегося материала','Доказать положительность объёма и его уменьшение относительно исходного цилиндра']}
};
function volumeConcept(multiplier){
 const n=multiplier**3;
 return make('Все линейные размеры тела увеличили в '+multiplier+' раза. Во сколько раз изменится его объём? Обоснуйте степень.',n+' '+(n%10>=2&&n%10<=4&&!(n%100>=12&&n%100<=14)?'раза':'раз')+'.','VOLUME_SCALE',
  'V′/V='+multiplier+'³='+n+'; объём масштабируется в третьей степени.',P.concept,{kind:'scale',factor:multiplier});
}
function cylinder(r,h,profile=P.cylinder){
 const n=r*r*h;
 return make('Прямой цилиндр имеет r='+r+', h='+h+'. Найдите объём.',pi(n),'CYLINDER_VOLUME',
  'V=πr²h=π·'+r+'²·'+h+'='+fmtPi(n)+'.',profile,{kind:'cylinder',r,h});
}
function coneSlant(r,h,l){
 return make('У прямого конуса радиус '+r+' и образующая '+l+'. Найдите перпендикулярную высоту и объём.', 'h='+h+'; '+pi(r*r*h,3),'CONE_SLANT',
  'h=√(l²−r²)=√('+l+'²−'+r+'²)='+h+'; V=πr²h/3='+fmtPi(r*r*h,3)+'.',P.cone,{kind:'coneSlant',r,l,h});
}
function frustum(R,r,h){
 const n=h*(R*R+R*r+r*r);
 return make('Усечённый конус имеет радиусы оснований '+R+' и '+r+', высоту '+h+'. Найдите объём.',
  pi(n,3),'FRUSTUM_VOLUME','V=πh(R²+Rr+r²)/3='+fmtPi(n,3)+'.',P.frustum,{kind:'frustum',R,r,h});
}
function sector(R,h){
 return make('Шаровой сектор имеет радиус шара '+R+' и высоту соответствующего сегмента '+h+'. Найдите объём.',pi(2*R*R*h,3),
 'SPHERICAL_SECTOR','Vсект=2πR²h/3='+fmtPi(2*R*R*h,3)+'.',P.sector,{kind:'sector',R,h});
}
function similar(a,b){
 const m=Math.round(Math.cbrt(a)),n=Math.round(Math.cbrt(b)),g=gcd(m,n);
 return make('Объёмы двух подобных тел относятся как '+a+':'+b+'. Найдите отношение соответствующих линейных размеров.',
  m/g+':'+n/g+'.','SIMILAR_SOLIDS',
  'Линейные размеры относятся как ∛'+a+':∛'+b+' = '+m/g+':'+n/g+'.',P.similar,{kind:'similar',a,b});
}
function coneError(r,h){
 const n=r*r*h;
 return make('Ученик записал для конуса r='+r+', h='+h+' объём V='+fmtPi(n)+'. Обнаружьте ошибку, вычислите правильный объём и обоснуйте исправление сравнением с цилиндром тех же размеров.',
  'Пропущен множитель 1/3; Vкон='+fmtPi(n,3)+'; конус занимает треть объёма цилиндра с тем же основанием и высотой.','CONE_FACTOR',
  'В цилиндре Vцил=πr²h='+fmtPi(n)+'. Для конуса с тем же r,h: Vкон=Vцил/3='+fmtPi(n,3)+'. Критерии: ошибка в множителе (1); точный объём (1); обоснование (1).',
  P.coneError,{kind:'coneError',r,h});
}
function sphereBall(R){
 return make('Шар радиуса '+R+'. Найдите площадь его сферы и объём шара.',
  'S='+fmtPi(4*R*R)+'; V='+pi(4*R*R*R,3),'SPHERE_BALL',
  'S=4πR²='+fmtPi(4*R*R)+'; V=4πR³/3='+fmtPi(4*R*R*R,3)+'.',
  P.sphereBall,{kind:'sphereBall',R});
}
function segment(R,h){
 return make('Шаровой сегмент имеет радиус шара '+R+' и высоту '+h+'. Найдите объём.',
  pi(h*h*(3*R-h),3),'SPHERICAL_SEGMENT',
  'Vсег=πh²(3R−h)/3='+fmtPi(h*h*(3*R-h),3)+'.',
  P.segment,{kind:'segment',R,h});
}
function capNum(R,h){return h*h*(3*R-h);}
function layer(R,a,b){
 const h1=R-a,h2=R-b,n=capNum(R,h1)-capNum(R,h2);
 return make('В шаре радиуса '+R+' плоскости z='+a+' и z='+b+' (координаты относительно центра) ограничивают слой. Найдите его объём.',
  pi(n,3),'SPHERICAL_LAYER',
  'Высоты вспомогательных сегментов: '+h1+' и '+h2+'; Vслоя=Vсег('+h1+')−Vсег('+h2+')='+fmtPi(n,3)+'.',
  P.layer,{kind:'layer',R,a,b});
}
function compositeHemisphere(r,h){
 const n=3*r*r*h+2*r*r*r;
 return make('К цилиндру радиуса '+r+' и высоты '+h+' присоединена полусфера того же радиуса. Найдите общий объём.',
  pi(n,3),'COMPOSITE_VOLUME',
  'V=πr²h+2πr³/3='+fmtPi(n,3)+'.',
  P.composite,{kind:'composite',r,h});
}
function cavityError(R,r,h){
 const outer=R*R*h,channel=r*r*h,remaining=outer-channel;
 return make('В цилиндре радиуса R='+R+' и высоты h='+h+' просверлен соосный канал радиуса r='+r+'. Ученик записал V=π(R²+r²)h. Исправьте модель, вычислите объём материала и докажите, что он положителен и меньше исходного объёма.',
  'V=π(R²−r²)h='+fmtPi(remaining)+'; канал вычитается; 0<'+fmtPi(remaining)+'<'+fmtPi(outer)+'.',
  'CYLINDER_CAVITY_REASONING',
  'Так как 0<r<R, 0<r²<R², поэтому 0<π(R²−r²)h<πR²h при h>0. Объём материала '+fmtPi(remaining)+'. Критерии: разность (1); вычисление (1); обоснование границ (1).',
  P.cavityError,{kind:'cavityError',R,r,h});
}
// The design is a common blueprint, with parameters changed but the operations fixed.
const I=[
 {m:2,cyl:[3,5],cone:[3,4,5],fr:[5,2,3],sector:[5,2],similar:[125,64],error:[4,6]},
 {m:3,cyl:[4,6],cone:[5,12,13],fr:[6,3,4],sector:[6,3],similar:[216,27],error:[5,9]},
 {m:4,cyl:[5,7],cone:[8,15,17],fr:[7,1,3],sector:[5,3],similar:[343,125],error:[6,8]},
 {m:5,cyl:[2,9],cone:[7,24,25],fr:[4,2,6],sector:[8,4],similar:[64,8],error:[3,10]},
 {m:6,cyl:[6,4],cone:[12,16,20],fr:[8,4,3],sector:[4,2],similar:[729,216],error:[5,12]},
 {m:7,cyl:[7,3],cone:[9,12,15],fr:[5,3,6],sector:[7,3],similar:[512,125],error:[6,10]}
];
const C=[
 {cyl:[4,5],cone:[3,4,5],fr:[5,2,6],sphere:3,seg:[5,2],layer:[5,-1,2],similar:[125,64],comp:[2,5],cavity:[5,2,4]},
 {cyl:[5,4],cone:[5,12,13],fr:[6,3,3],sphere:4,seg:[6,3],layer:[5,-2,0],similar:[216,27],comp:[3,4],cavity:[6,2,3]},
 {cyl:[3,8],cone:[8,15,17],fr:[7,1,6],sphere:5,seg:[5,1],layer:[6,-2,1],similar:[343,125],comp:[3,5],cavity:[6,3,5]},
 {cyl:[6,3],cone:[7,24,25],fr:[4,2,9],sphere:6,seg:[8,4],layer:[6,-1,3],similar:[64,8],comp:[4,3],cavity:[7,3,4]},
 {cyl:[2,12],cone:[20,21,29],fr:[8,4,6],sphere:2,seg:[4,2],layer:[5,-2,2],similar:[729,216],comp:[4,6],cavity:[8,2,3]},
 {cyl:[7,2],cone:[12,35,37],fr:[5,3,12],sphere:7,seg:[10,4],layer:[7,-1,3],similar:[512,125],comp:[5,4],cavity:[9,4,5]}
];
function independent(v){
 if(!Number.isInteger(v)||v<1||v>6)throw new RangeError('Independent variant 1..6 required');
 const a=I[v-1];
 return {id:v,tasks:[
  volumeConcept(a.m),cylinder(...a.cyl),coneSlant(...a.cone),
  frustum(...a.fr),sector(...a.sector),similar(...a.similar),coneError(...a.error)
 ]};
}
function control(v){
 if(!Number.isInteger(v)||v<1||v>6)throw new RangeError('Control variant 1..6 required');
 const a=C[v-1];
 return {id:v,tasks:[
  // One-point prerequisite: same proof of 3:1, with distinct dimensions.
  make('У цилиндра и конуса одинаковые радиус r='+a.cyl[0]+' и высота h='+a.cyl[1]+'. Во сколько раз объём цилиндра больше объёма конуса?',
   'В 3 раза.','CYLINDER_CONE_RATIO','Vцил=πr²h, Vкон=πr²h/3; отношение 3:1.',{
    family:'cylinder-cone-ratio',dok:1,method:'formula-comparison',criteria:['Указать отношение 3:1']
   },{kind:'ratio',r:a.cyl[0],h:a.cyl[1]}),
  cylinder(...a.cyl,P.shortCylinder),coneSlant(...a.cone),frustum(...a.fr),
  sphereBall(a.sphere),segment(...a.seg),layer(...a.layer),
  similar(...a.similar),compositeHemisphere(...a.comp),cavityError(...a.cavity)
 ]};
}
window.KTP_ASSESSMENT_DATA={
 meta:{
  rowId:'11-geometry-atanasyan',grade:11,subject:'Геометрия',
  book:'Атанасян · Бутузов · Кадомцев и др. + ФРП-2025',year:'2026/27',topic:'03',
  sourceNote:'Тема «Объёмы тел вращения»: глава V, п. 55 и пп. 59–62* проверяемого оглавления Атанасяна 2019/2026; ФРП-2025 — объёмы цилиндра, конуса, шара, усечённого конуса, шаровых частей, площадь сферы, подобные тела и практические задачи. Пункт 56 с определённым интегралом не входит в обязательный контроль; векторы и координаты относятся к следующим сериям. Все задания разработаны специально для KTP 3.0.'
 },
 topic:{
  title:'Объёмы тел вращения',
  source:'Атанасян Л. С. и др., «Геометрия. 10–11 классы»: глава V, п. 55, пп. 59–62*; ФРП-2025.',
  independent:{duration:'30–35 минут',maxScore:14,
   purpose:'Проверить свойства объёма, цилиндр, конус с восстановлением высоты, усечённый конус, шаровой сектор, подобие и объяснение ошибки.',
   variants:Array.from({length:6},(_,i)=>independent(i+1))},
  control:{duration:'45 минут',maxScore:20,
   purpose:'Сопоставимые варианты: цилиндр и конус, усечённый конус, сфера и шар, сегмент, слой, подобие, составное тело и доказательное исправление ошибки.',
   variants:Array.from({length:6},(_,i)=>control(i+1))}
 }
};
})();