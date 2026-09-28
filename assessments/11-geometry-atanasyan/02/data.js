(function(){
'use strict';
const task=(text,answer,points,skill,solution)=>({text,answer,points,skill,solution});
const vol=(a,b,c)=>a*b*c;
const prismSpec=(cfg)=>{
  if(cfg.type==='triangle'){
    const S=cfg.a*cfg.b/2,V=S*cfg.h;
    return{S,V,text:'Основание прямой призмы — прямоугольный треугольник с катетами '+cfg.a+' и '+cfg.b+'. Высота призмы '+cfg.h+'. Найдите объём.',solution:'Sосн=1/2·'+cfg.a+'·'+cfg.b+'='+S+'; V='+S+'·'+cfg.h+'='+V+'.'};
  }
  if(cfg.type==='parallelogram'){
    const S=cfg.a*cfg.alt,V=S*cfg.h;
    return{S,V,text:'Основание прямой призмы — параллелограмм со стороной '+cfg.a+' и высотой к ней '+cfg.alt+'. Высота призмы '+cfg.h+'. Найдите объём.',solution:'Sосн='+cfg.a+'·'+cfg.alt+'='+S+'; V='+S+'·'+cfg.h+'='+V+'.'};
  }
  const S=cfg.a*cfg.b,V=S*cfg.h;
  return{S,V,text:'Основание прямой призмы — прямоугольник '+cfg.a+'×'+cfg.b+'. Высота призмы '+cfg.h+'. Найдите объём.',solution:'Sосн='+cfg.a+'·'+cfg.b+'='+S+'; V='+S+'·'+cfg.h+'='+V+'.'};
};
const pyramidSpec=(cfg)=>{
  if(cfg.type==='square'){
    const S=cfg.a*cfg.a,V=S*cfg.h/3;
    return{S,V,text:'Основание пирамиды — квадрат со стороной '+cfg.a+', высота '+cfg.h+'. Найдите объём.',solution:'Sосн='+cfg.a+'²='+S+'; V=1/3·'+S+'·'+cfg.h+'='+V+'.'};
  }
  if(cfg.type==='rectangle'){
    const S=cfg.a*cfg.b,V=S*cfg.h/3;
    return{S,V,text:'Основание пирамиды — прямоугольник '+cfg.a+'×'+cfg.b+', высота '+cfg.h+'. Найдите объём.',solution:'Sосн='+cfg.a+'·'+cfg.b+'='+S+'; V=1/3·'+S+'·'+cfg.h+'='+V+'.'};
  }
  if(cfg.type==='triangle'){
    const S=cfg.a*cfg.b/2,V=S*cfg.h/3;
    return{S,V,text:'Основание пирамиды — прямоугольный треугольник с катетами '+cfg.a+' и '+cfg.b+', высота пирамиды '+cfg.h+'. Найдите объём.',solution:'Sосн=1/2·'+cfg.a+'·'+cfg.b+'='+S+'; V=1/3·'+S+'·'+cfg.h+'='+V+'.'};
  }
  const S=cfg.S,V=S*cfg.h/3;
  return{S,V,text:'Пирамида имеет площадь основания '+S+' и высоту '+cfg.h+'. Найдите объём.',solution:'V=1/3·'+S+'·'+cfg.h+'='+V+'.'};
};
const frustumSpec=(cfg)=>{
  const g=Math.sqrt(cfg.S1*cfg.S2),V=cfg.h*(cfg.S1+g+cfg.S2)/3;
  return{g,V,text:'Усечённая пирамида имеет площади оснований '+cfg.S1+' и '+cfg.S2+', высоту '+cfg.h+'. Найдите объём.',solution:'√(S₁S₂)=√('+cfg.S1+'·'+cfg.S2+')='+g+'; V='+cfg.h+'/3·('+cfg.S1+'+'+g+'+'+cfg.S2+')='+V+'.'};
};
const obliqueSpec=(cfg)=>{
  const h=Math.sqrt(cfg.edge*cfg.edge-cfg.proj*cfg.proj),V=cfg.S*h;
  return{h,V,text:'Наклонная призма имеет площадь основания '+cfg.S+', боковое ребро '+cfg.edge+'. Проекция этого ребра на плоскость основания равна '+cfg.proj+'. Найдите объём.',solution:'В рабочем прямоугольном треугольнике h=√('+cfg.edge+'²−'+cfg.proj+'²)='+h+'. V='+cfg.S+'·'+h+'='+V+'.'};
};
const cavitySpec=(cfg)=>{
  const outer=vol(...cfg.outer),inner=vol(...cfg.inner),V=outer-inner;
  return{outer,inner,V,text:'Из прямоугольного блока '+cfg.outer.join('×')+' вырезали сквозную прямоугольную полость '+cfg.inner.join('×')+'. Найдите объём оставшегося материала.',solution:'V='+outer+'−'+inner+'='+V+'. Полость вычитается из внешнего объёма.'};
};

const I=[
 {concept:['Почему объём записывают в кубических единицах?','Потому что объём характеризует трёхмерное тело: произведение трёх линейных измерений имеет кубическую размерность.','VOLUME_UNITS'],prism:{type:'triangle',a:6,b:8,h:5},oblique:{S:24,edge:13,proj:5},pyramid:{type:'square',a:6,h:10},frustum:{S1:144,S2:36,h:9},cavity:{outer:[10,8,6],inner:[4,3,6]},error:['Ученик в наклонной призме подставил боковое ребро 13 вместо высоты, хотя его проекция на основание равна 5. Исправьте решение.','Высота равна √(13²−5²)=12. В формулу V=Sосн·h нужно подставлять 12, а не 13.','HEIGHT_EDGE']},
 {concept:['Как используется аддитивность объёма при разбиении тела?','Если части не имеют общих внутренних точек, объём целого равен сумме их объёмов.','ADDITIVITY'],prism:{type:'rectangle',a:7,b:4,h:6},oblique:{S:30,edge:10,proj:6},pyramid:{type:'rectangle',a:8,b:6,h:9},frustum:{S1:100,S2:25,h:6},cavity:{outer:[9,8,5],inner:[3,2,5]},error:['Ученик для пирамиды записал V=Sосн·h. Найдите ошибку.','Для пирамиды нужен коэффициент 1/3: V=1/3·Sосн·h.','PYRAMID_FACTOR']},
 {concept:['Сколько кубических сантиметров в 1 дм³? Объясните коэффициент.','1000 см³: 1 дм=10 см, поэтому 1 дм³=10³ см³.','UNIT_CONVERSION'],prism:{type:'triangle',a:10,b:6,h:7},oblique:{S:18,edge:17,proj:8},pyramid:{type:'given',S:42,h:8},frustum:{S1:81,S2:9,h:12},cavity:{outer:[12,9,5],inner:[3,3,5]},error:['Ученик решил, что при коэффициенте подобия k=3 объёмы отличаются в 9 раз. Исправьте правило.','9=k² относится к площадям. Объёмы отличаются в k³=27 раз.','SIMILAR_K2_K3']},
 {concept:['Что можно сказать об объёмах двух равных пространственных тел?','Равные тела имеют равные объёмы.','VOLUME_PROPERTY'],prism:{type:'parallelogram',a:9,alt:4,h:5},oblique:{S:16,edge:5,proj:3},pyramid:{type:'square',a:10,h:12},frustum:{S1:64,S2:16,h:9},cavity:{outer:[8,7,6],inner:[2,3,6]},error:['Ученик получил объём 240 см². Что неверно в записи?','Объём должен быть выражен в кубических единицах: если длины заданы в сантиметрах, единица — см³.','AREA_VOLUME']},
 {concept:['Все линейные размеры подобного тела увеличили в 2 раза. Как изменится объём?','Увеличится в 2³=8 раз.','VOLUME_SCALE'],prism:{type:'rectangle',a:8,b:5,h:9},oblique:{S:21,edge:13,proj:5},pyramid:{type:'triangle',a:10,b:15,h:12},frustum:{S1:225,S2:25,h:6},cavity:{outer:[6,5,4],inner:[2,2,4]},error:['Ученик измерил высоту многогранника линейкой прямо на перспективном SVG-рисунке. Почему результат ненадёжен?','Проекция зависит от камеры и искажает истинные длины. Высоту получают из условия и пространственных геометрических связей.','PROJECTION_LENGTH']},
 {concept:['Чем объём отличается от площади поверхности по геометрическому смыслу и размерности?','Объём относится к трёхмерному телу и имеет кубическую размерность; площадь относится к двумерной поверхности и имеет квадратную размерность.','AREA_VOLUME'],prism:{type:'triangle',a:12,b:5,h:8},oblique:{S:25,edge:10,proj:6},pyramid:{type:'rectangle',a:9,b:4,h:15},frustum:{S1:196,S2:49,h:9},cavity:{outer:[15,10,4],inner:[5,4,4]},error:['Ученик вычисляет объём усечённой пирамиды как h·(S₁+S₂)/2. Объясните ошибку.','Площади параллельных сечений меняются не линейно. Верно V=h/3·(S₁+√(S₁S₂)+S₂).','FRUSTUM_AVERAGE']}
];

function independent(v){
 const q=I[v-1],p=prismSpec(q.prism),o=obliqueSpec(q.oblique),y=pyramidSpec(q.pyramid),f=frustumSpec(q.frustum),c=cavitySpec(q.cavity);
 return{id:v,tasks:[
  task(q.concept[0],q.concept[1],1,q.concept[2],'Зачёт при корректном указании свойства объёма и его геометрического смысла.'),
  task(p.text,String(p.V)+'.',2,'PRISM_VOLUME',p.solution),
  task(o.text,String(o.V)+'.',2,'OBLIQUE_PRISM',o.solution),
  task(y.text,String(y.V)+'.',2,'PYRAMID_VOLUME',y.solution),
  task(f.text,String(f.V)+'.',2,'FRUSTUM_VOLUME',f.solution),
  task(c.text,String(c.V)+'.',2,'COMPOSITE_VOLUME',c.solution),
  task(q.error[0],q.error[1],3,q.error[2],'3 балла: обнаружить неверный шаг, записать корректное правило и объяснить геометрический смысл исправления.')
 ]};
}

const C=[
 {concept:['Сформулируйте свойство аддитивности объёма.','При разбиении тела на части без общих внутренних точек объём целого равен сумме объёмов частей.','ADDITIVITY'],prism:{type:'triangle',a:8,b:15,h:6},oblique:{S:35,edge:13,proj:5},pyramid:{type:'given',S:96,h:9},frustum:{S1:100,S2:25,h:9},section:{type:'pyramidRect',a:6,b:8,edge:13,center:5},similar:{ratio:[125,64],linear:[5,4]},cavity:{outer:[12,8,6],inner:[4,2,6]},inverse:{type:'prism',V:420,S:35},error:['Для усечённой пирамиды ученик использовал формулу V=h(S₁+S₂)/2. Исправьте модель.','Верно V=h/3·(S₁+√(S₁S₂)+S₂); простое среднее площадей не учитывает квадратичное изменение площадей подобных сечений.','ERROR_FRUSTUM']},
 {concept:['Переведите 0,036 м³ в литры.','36 л.','UNIT_CONVERSION'],prism:{type:'rectangle',a:9,b:5,h:8},oblique:{S:28,edge:10,proj:6},pyramid:{type:'square',a:8,h:9},frustum:{S1:144,S2:36,h:6},section:{type:'prism',S:40,edge:17,proj:8},similar:{scale:[3,2],smallV:64},cavity:{outer:[10,10,8],inner:[4,4,8]},inverse:{type:'pyramid',V:180,S:60},error:['Ученик в наклонной призме при боковом ребре 10 и проекции 6 взял h=10. Исправьте.','h=√(10²−6²)=8. Высота — перпендикулярное расстояние, а не наклонное ребро.','HEIGHT_EDGE']},
 {concept:['Призма и пирамида имеют одинаковые основание и высоту. Как связаны их объёмы?','Объём пирамиды равен одной трети объёма призмы.','COMPARE'],prism:{type:'parallelogram',a:12,alt:5,h:7},oblique:{S:32,edge:17,proj:8},pyramid:{type:'rectangle',a:10,b:6,h:12},frustum:{S1:81,S2:9,h:15},section:{type:'pyramidRect',a:8,b:6,edge:13,center:5},similar:{ratio:[343,125],linear:[7,5]},cavity:{outer:[14,9,5],inner:[4,3,5]},inverse:{type:'prism',V:630,S:42},error:['Ученик вычислил объём пирамиды по формуле Sосн·h и получил 540. Как исправить результат?','Нужно разделить на 3: объём пирамиды равен 180.','PYRAMID_FACTOR']},
 {concept:['Линейный коэффициент подобия равен 1/2. Как изменится объём?','Станет 1/8 исходного, потому что объём масштабируется как k³.','VOLUME_SCALE'],prism:{type:'triangle',a:10,b:12,h:9},oblique:{S:45,edge:5,proj:3},pyramid:{type:'given',S:150,h:8},frustum:{S1:196,S2:49,h:6},section:{type:'prism',S:36,edge:13,proj:5},similar:{scale:[5,4],smallV:64},cavity:{outer:[16,10,6],inner:[6,4,6]},inverse:{type:'pyramid',V:280,S:70},error:['Для подобных тел с k=4 ученик умножил объём на 16. Исправьте.','16=4² относится к площадям; объём нужно умножить на 4³=64.','SIMILAR_K2_K3']},
 {concept:['Что называют высотой призмы?','Перпендикулярное расстояние между плоскостями её оснований.','HEIGHT'],prism:{type:'rectangle',a:11,b:6,h:5},oblique:{S:27,edge:13,proj:5},pyramid:{type:'square',a:12,h:10},frustum:{S1:225,S2:25,h:12},section:{type:'pyramidRect',a:12,b:16,edge:26,center:10},similar:{ratio:[216,125],linear:[6,5]},cavity:{outer:[18,12,5],inner:[8,4,5]},inverse:{type:'prism',V:432,S:36},error:['При переводе 2 м³ в дм³ ученик получил 20 дм³. Исправьте.','1 м³=1000 дм³, поэтому 2 м³=2000 дм³.','UNIT_CONVERSION']},
 {concept:['Какая размерность должна быть у результата задачи на объём, если все длины даны в сантиметрах?','Кубические сантиметры, см³.','VOLUME_UNITS'],prism:{type:'parallelogram',a:15,alt:4,h:6},oblique:{S:50,edge:10,proj:6},pyramid:{type:'triangle',a:12,b:9,h:10},frustum:{S1:256,S2:64,h:9},section:{type:'prism',S:42,edge:17,proj:8},similar:{scale:[2,1],smallV:90},cavity:{outer:[20,10,5],inner:[5,6,5]},inverse:{type:'pyramid',V:360,S:90},error:['На рисунке высота кажется равной 7 см, и ученик использовал это значение без данных условия. В чём ошибка?','Перспективная проекция не сохраняет истинные длины. Высоту нужно получить из условия или доказанной пространственной связи.','PROJECTION_LENGTH']}
];

function sectionTask(cfg){
 if(cfg.type==='prism'){
   const h=Math.sqrt(cfg.edge*cfg.edge-cfg.proj*cfg.proj),V=cfg.S*h;
   return{text:'Площадь основания наклонной призмы '+cfg.S+'. В рабочем сечении боковое ребро '+cfg.edge+' имеет проекцию '+cfg.proj+' на основание. Найдите истинную высоту и объём.',answer:'h='+h+'; V='+V+'.',solution:'h=√('+cfg.edge+'²−'+cfg.proj+'²)='+h+'; V='+cfg.S+'·'+h+'='+V+'.'};
 }
 const S=cfg.a*cfg.b,h=Math.sqrt(cfg.edge*cfg.edge-cfg.center*cfg.center),V=S*h/3;
 return{text:'Основание пирамиды — прямоугольник '+cfg.a+'×'+cfg.b+'. Проекция вершины — центр основания; расстояние от центра до вершины основания '+cfg.center+', боковое ребро '+cfg.edge+'. Найдите высоту и объём.',answer:'h='+h+'; V='+V+'.',solution:'В рабочем сечении h=√('+cfg.edge+'²−'+cfg.center+'²)='+h+'. Sосн='+S+'; V=1/3·'+S+'·'+h+'='+V+'.'};
}
function similarTask(cfg){
 if(cfg.ratio)return{text:'Объёмы двух подобных многогранников относятся как '+cfg.ratio[0]+':'+cfg.ratio[1]+'. Найдите отношение соответствующих линейных размеров.',answer:cfg.linear[0]+':'+cfg.linear[1]+'.',solution:'Извлекаем кубический корень: ∛'+cfg.ratio[0]+':∛'+cfg.ratio[1]+'='+cfg.linear[0]+':'+cfg.linear[1]+'.'};
 const factor=Math.pow(cfg.scale[0]/cfg.scale[1],3),V=cfg.smallV*factor;
 return{text:'Линейные размеры большего подобного тела относятся к меньшему как '+cfg.scale[0]+':'+cfg.scale[1]+'. Объём меньшего '+cfg.smallV+'. Найдите объём большего.',answer:String(V)+'.',solution:'Коэффициент объёмов ('+cfg.scale[0]+'/'+cfg.scale[1]+')³='+factor+'. V='+cfg.smallV+'·'+factor+'='+V+'.'};
}
function inverseTask(cfg){
 if(cfg.type==='prism'){
   const h=cfg.V/cfg.S;
   return{text:'Объём призмы '+cfg.V+', площадь основания '+cfg.S+'. Найдите высоту.',answer:String(h)+'.',solution:'h=V/Sосн='+cfg.V+'/'+cfg.S+'='+h+'.'};
 }
 const h=3*cfg.V/cfg.S;
 return{text:'Объём пирамиды '+cfg.V+', площадь основания '+cfg.S+'. Найдите высоту.',answer:String(h)+'.',solution:'h=3V/Sосн=3·'+cfg.V+'/'+cfg.S+'='+h+'.'};
}
function control(v){
 const q=C[v-1],p=prismSpec(q.prism),o=obliqueSpec(q.oblique),y=pyramidSpec(q.pyramid),f=frustumSpec(q.frustum),s=sectionTask(q.section),sim=similarTask(q.similar),c=cavitySpec(q.cavity),inv=inverseTask(q.inverse);
 return{id:v,tasks:[
  task(q.concept[0],q.concept[1],1,q.concept[2],'Зачёт при точной формулировке свойства или корректном переводе единиц.'),
  task(p.text,String(p.V)+'.',2,'PRISM_VOLUME',p.solution),
  task(o.text,String(o.V)+'.',2,'OBLIQUE_PRISM',o.solution),
  task(y.text,String(y.V)+'.',2,'PYRAMID_VOLUME',y.solution),
  task(f.text,String(f.V)+'.',2,'FRUSTUM_VOLUME',f.solution),
  task(s.text,s.answer,2,'SECTION_VOLUME',s.solution),
  task(sim.text,sim.answer,2,'SIMILAR_SOLIDS',sim.solution),
  task(c.text,String(c.V)+'.',2,'COMPOSITE_VOLUME',c.solution),
  task(inv.text,inv.answer,2,'INVERSE_VOLUME',inv.solution),
  task(q.error[0],q.error[1],3,q.error[2],'3 балла: обнаружить ошибку, записать верное правило или значение и дать геометрическое объяснение.')
 ]};
}

window.KTP_ASSESSMENT_DATA={
 meta:{
  rowId:'11-geometry-atanasyan',
  grade:11,
  subject:'Геометрия',
  book:'Атанасян · Бутузов · Кадомцев и др. + ФРП-2025',
  year:'2026/27',
  topic:'02',
  sourceNote:'Тема «Объёмы многогранников»: глава V, §§1–3, пп. 52–54, 57–58 проверенного оглавления Атанасяна 2019/2026; усечённая пирамида адресно опирается на главу III, п. 34; ФРП-2025 — объёмы многогранников, подобные тела и практические задачи. Объёмы тел вращения относятся к серии 03. Все задания разработаны специально для KTP 3.0.'
 },
 topic:{
  title:'Объёмы многогранников',
  source:'Атанасян Л. С. и др., «Геометрия. 10–11 классы»: глава V, §§1–3, пп. 52–54, 57–58; глава III, п. 34 адресно; ФРП-2025.',
  independent:{
   duration:'30–35 минут',
   maxScore:14,
   purpose:'Проверить свойства объёма, призмы, наклонную призму, пирамиду, усечённую пирамиду, составную модель и анализ ошибки.',
   variants:Array.from({length:6},(_,i)=>independent(i+1))
  },
  control:{
   duration:'45 минут',
   maxScore:20,
   purpose:'Развёрнутый контроль: призмы и пирамиды, рабочее сечение, усечённая пирамида, подобные тела, составная и обратная задачи, анализ ошибки.',
   variants:Array.from({length:6},(_,i)=>control(i+1))
  }
 }
};
})();