(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;if(!S)return;

const planeBase=(title,caption,opts={})=>{
 const z=0;
 const points={
  P:[-1.7,-1.2,z],Q:[1.7,-1.2,z],R:[1.7,1.2,z],T:[-1.7,1.2,z],
  O:[0,0,0],A:[-1.05,0,0],B:[1.05,0,0],C:[0,-.95,0],D:[0,.95,0],
  U:[0,0,1.6],V:[0,0,-.65]
 };
 const objects=[
  {type:'plane',points:['P','Q','R','T'],style:'aux'},
  ...(opts.cross?[
   {type:'line',points:['A','B'],extent:.12},
   {type:'line',points:['C','D'],extent:.12}
  ]:[]),
  {type:'segment',points:['O','U'],style:'emphasis'},
  ...(opts.hidden?[{type:'segment',points:['O','V'],style:'emphasis',visibility:'hidden'}]:[])
 ];
 return{
  title,ariaLabel:title,camera:{yaw:-32,pitch:28,scale:66,origin:[210,165]},
  points,labels:{P:false,Q:false,R:false,T:false,A:false,B:false,C:false,D:false,U:false,V:false},
  objects,caption
 };
};

const oblique=(title,caption,extraLine=false)=>{
 const points={
  P:[-1.7,-1.2,0],Q:[1.7,-1.2,0],R:[1.7,1.2,0],T:[-1.7,1.2,0],
  H:[-.6,0,0],M:[-.6,0,1.55],B:[.95,0,0],L1:[.95,-1,0],L2:[.95,1,0]
 };
 const objects=[
  {type:'plane',points:['P','Q','R','T'],style:'aux'},
  {type:'segment',points:['M','H'],style:'aux'},
  {type:'segment',points:['M','B'],style:'emphasis'},
  {type:'segment',points:['H','B']},
  ...(extraLine?[{type:'line',points:['L1','L2'],extent:.12,style:'emphasis'}]:[])
 ];
 return{
  title,ariaLabel:title,camera:{yaw:-35,pitch:26,scale:68,origin:[210,170]},
  points,labels:{P:false,Q:false,R:false,T:false,L1:false,L2:false},
  objects,caption
 };
};

const dihedral=(title,caption,right=false)=>{
 const theta=right?Math.PI/2:Math.PI/3;
 const cy=Math.cos(theta),sz=Math.sin(theta);
 return{
  title,ariaLabel:title,camera:{yaw:-25,pitch:24,scale:68,origin:[210,165]},
  points:{
   E1:[-1.5,0,0],O:[0,0,0],E2:[1.5,0,0],
   A:[0,1.05,0],A1:[-1.5,1.05,0],A2:[1.5,1.05,0],
   B:[0,1.05*cy,1.05*sz],B1:[-1.5,1.05*cy,1.05*sz],B2:[1.5,1.05*cy,1.05*sz]
  },
  labels:{E1:false,E2:false,A1:false,A2:false,B1:false,B2:false},
  objects:[
   {type:'plane',points:['E1','E2','A2','A1'],style:'aux'},
   {type:'plane',points:['E1','E2','B2','B1'],style:'emphasis'},
   {type:'line',points:['E1','E2'],extent:.1},
   {type:'segment',points:['O','A']},
   {type:'segment',points:['O','B'],style:'emphasis'}
  ],
  caption
 };
};

const box=(title,caption)=>{
 return{
  title,ariaLabel:title,camera:{yaw:-38,pitch:24,scale:56,origin:[210,165]},
  points:{
   A:[0,0,0],B:[2.3,0,0],C:[2.3,1.6,0],D:[0,1.6,0],
   A1:[0,0,1.7],B1:[2.3,0,1.7],C1:[2.3,1.6,1.7],D1:[0,1.6,1.7]
  },
  objects:[
   {type:'face',points:['A1','B1','C1','D1'],style:'aux'},
   {type:'segment',points:['A','B']},{type:'segment',points:['B','C']},
   {type:'segment',points:['C','D'],visibility:'hidden'},{type:'segment',points:['D','A'],visibility:'hidden'},
   {type:'segment',points:['A1','B1']},{type:'segment',points:['B1','C1']},{type:'segment',points:['C1','D1']},{type:'segment',points:['D1','A1']},
   {type:'segment',points:['A','A1']},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'},
   {type:'segment',points:['A','C1'],style:'emphasis'}
  ],
  caption
 };
};

S.spatialScenes={
 'g10-p03-01':{title:'Перпендикулярные прямые',ariaLabel:'Две прямые через O с углом 90 градусов',camera:{yaw:-28,pitch:28,scale:74,origin:[210,155]},points:{A:[-1.2,0,0],O:[0,0,0],B:[1.2,0,0],C:[0,-1.2,0],D:[0,1.2,0]},labels:{A:false,B:false,C:false,D:false},objects:[{type:'line',points:['A','B'],extent:.2,style:'emphasis'},{type:'line',points:['C','D'],extent:.2}],caption:'Перпендикулярность задана истинным углом 90°, а не внешним видом проекции.'},
 'g10-p03-02':planeBase('Параллельные нормальные направления','Если одно из параллельных направлений перпендикулярно α, второе также перпендикулярно α.',{hidden:true}),
 'g10-p03-03':planeBase('Признак перпендикулярности прямой и плоскости','Две пересекающиеся прямые плоскости через O дают достаточную проверку a⊥α.',{cross:true}),
 'g10-p03-04':planeBase('Единственный перпендикуляр к плоскости','Через заданную точку проходит единственная прямая, перпендикулярная данной плоскости.',{}),
 'g10-p03-05':planeBase('Доказательство a⊥α','Рабочий план: найти две пересекающиеся прямые в α и доказать две перпендикулярности.',{cross:true}),
 'g10-p03-06':oblique('Перпендикуляр, наклонная, проекция','MH — перпендикуляр, MB — наклонная, HB — её ортогональная проекция.'),
 'g10-p03-07':oblique('Расстояние от точки до плоскости','d(M,α)=MH; наклонная MB длиннее кратчайшего перпендикуляра MH.'),
 'g10-p03-08':planeBase('Расстояния между параллельными объектами','Все перпендикуляры между параллельными плоскостями имеют одинаковую длину.',{}),
 'g10-p03-09':oblique('Метрическая задача на расстояние','В рабочей плоскости возникает прямоугольный треугольник MHB.',false),
 'g10-p03-10':oblique('Теорема о трёх перпендикулярах','l⊥HB в α ⇒ l⊥MB при MH⊥α.',true),
 'g10-p03-11':oblique('Обратная теорема о трёх перпендикулярах','l⊥MB ⇒ l⊥HB в стандартной конфигурации MH⊥α.',true),
 'g10-p03-12':oblique('Угол между прямой и плоскостью','Искомый угол — угол между MB и её ортогональной проекцией HB.'),
 'g10-p03-13':oblique('Угол и расстояние в одной модели','В MHB: MB²=MH²+HB², а sin, cos, tan связывают угол с тремя длинами.'),
 'g10-p03-14':dihedral('Двугранный угол','Две полуплоскости имеют общее ребро; пространственный угол измеряется линейным углом.'),
 'g10-p03-15':dihedral('Линейный угол двугранного угла','OA и OB выходят из одной точки ребра и обе перпендикулярны ребру.'),
 'g10-p03-16':dihedral('Перпендикулярные плоскости','Линейный угол равен 90°; признак позволяет доказать это через прямую одной плоскости, перпендикулярную другой.',true),
 'g10-p03-17':box('Прямоугольный параллелепипед','Три направления рёбер попарно перпендикулярны; пространственная диагональ удовлетворяет d²=a²+b²+c².'),
 'g10-p03-18':box('Комплексная метрическая задача','Прямоугольный параллелепипед объединяет перпендикулярность, расстояния, углы и прямоугольные треугольники.'),
 'g10-p03-19':oblique('Диагностика темы','Проверьте: основание перпендикуляра, проекцию, рабочую плоскость, выбранный угол и метрический расчёт.',true)
};
})();