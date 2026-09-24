(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;if(!S)return;

const prism=(title,caption,opts={})=>{
  const top=opts.top??1.8,shift=opts.shift??0;
  return{
    title,ariaLabel:title,camera:{yaw:-36,pitch:23,scale:60,origin:[210,165]},
    points:{
      A:[-1.35,-.9,0],B:[1.35,-.9,0],C:[0,1.05,0],
      A1:[-1.35+shift,-.9,top],B1:[1.35+shift,-.9,top],C1:[shift,1.05,top],
      H:[-1.35,-.9,top]
    },
    labels:{H:opts.showHeight?'H':false},
    objects:[
      {type:'face',points:['A1','B1','C1'],style:'aux'},
      {type:'segment',points:['A','B']},{type:'segment',points:['B','C']},{type:'segment',points:['C','A'],visibility:'hidden'},
      {type:'segment',points:['A1','B1']},{type:'segment',points:['B1','C1']},{type:'segment',points:['C1','A1']},
      {type:'segment',points:['A','A1'],style:opts.shift?'':'emphasis'},
      {type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},
      ...(opts.showHeight?[{type:'segment',points:['A','H'],style:'emphasis'}]:[])
    ],
    caption
  };
};

const box=(title,caption,section=false)=>{
  const objects=[
    {type:'face',points:['A1','B1','C1','D1'],style:'aux'},
    {type:'segment',points:['A','B']},{type:'segment',points:['B','C']},
    {type:'segment',points:['C','D'],visibility:'hidden'},{type:'segment',points:['D','A'],visibility:'hidden'},
    {type:'segment',points:['A1','B1']},{type:'segment',points:['B1','C1']},{type:'segment',points:['C1','D1']},{type:'segment',points:['D1','A1']},
    {type:'segment',points:['A','A1']},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'}
  ];
  if(section){
    objects.push(
      {type:'face',points:['M','N','P','Q'],style:'emphasis'},
      {type:'polyline',points:['M','N','P','Q'],closed:true,style:'emphasis'}
    );
  }else{
    objects.push({type:'segment',points:['A','C1'],style:'emphasis'});
  }
  return{
    title,ariaLabel:title,camera:{yaw:-38,pitch:24,scale:54,origin:[210,165]},
    points:{
      A:[0,0,0],B:[2.3,0,0],C:[2.3,1.6,0],D:[0,1.6,0],
      A1:[0,0,1.7],B1:[2.3,0,1.7],C1:[2.3,1.6,1.7],D1:[0,1.6,1.7],
      M:[0,0,.6],N:[2.3,0,.9],P:[2.3,1.6,1.15],Q:[0,1.6,.85]
    },
    labels:section?{}:{M:false,N:false,P:false,Q:false},
    objects,caption
  };
};

const pyramid=(title,caption,opts={})=>{
  const side=opts.side??1.4,h=opts.h??2.4;
  const points={
    A:[-side,-side*.72,0],B:[side,-side*.72,0],C:[side,side*.72,0],D:[-side,side*.72,0],
    O:[0,0,0],M:[0,-side*.72,0],S:[0,0,h]
  };
  const objects=[
    {type:'face',points:['A','B','C','D'],style:'aux'},
    {type:'segment',points:['S','A']},{type:'segment',points:['S','B']},{type:'segment',points:['S','C']},{type:'segment',points:['S','D']},
    {type:'segment',points:['A','B']},{type:'segment',points:['B','C']},{type:'segment',points:['C','D'],visibility:'hidden'},{type:'segment',points:['D','A'],visibility:'hidden'},
    {type:'segment',points:['S','O'],style:opts.heightStyle||'aux'}
  ];
  if(opts.apothem)objects.push({type:'segment',points:['S','M'],style:'emphasis'});
  return{
    title,ariaLabel:title,camera:{yaw:-35,pitch:24,scale:60,origin:[210,168]},
    points,labels:{O:opts.showO?'O':false,M:opts.apothem?'M':false},
    objects,caption
  };
};

const frustum=(title,caption)=>{
  return{
    title,ariaLabel:title,camera:{yaw:-35,pitch:24,scale:58,origin:[210,168]},
    points:{
      A:[-1.55,-1.05,0],B:[1.55,-1.05,0],C:[1.55,1.05,0],D:[-1.55,1.05,0],
      A1:[-.8,-.55,1.6],B1:[.8,-.55,1.6],C1:[.8,.55,1.6],D1:[-.8,.55,1.6],
      M:[0,-1.05,0],N:[0,-.55,1.6]
    },
    objects:[
      {type:'face',points:['A','B','C','D'],style:'aux'},
      {type:'face',points:['A1','B1','C1','D1'],style:'aux'},
      {type:'segment',points:['A','A1']},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'},
      {type:'segment',points:['A','B']},{type:'segment',points:['B','C']},{type:'segment',points:['C','D'],visibility:'hidden'},{type:'segment',points:['D','A'],visibility:'hidden'},
      {type:'segment',points:['A1','B1']},{type:'segment',points:['B1','C1']},{type:'segment',points:['C1','D1']},{type:'segment',points:['D1','A1']},
      {type:'segment',points:['M','N'],style:'emphasis'}
    ],
    caption
  };
};

S.spatialScenes={
  'g10-p04-01':box(
    'Многогранник: каркас, грани и диагональ',
    'Один объект можно читать как каркас из рёбер, как поверхность из граней и как тело, ограниченное этой поверхностью.'
  ),
  'g10-p04-02':prism(
    'Прямая и наклонная призма',
    'Высота — расстояние между плоскостями оснований. В наклонной призме боковое ребро не совпадает с высотой.',
    {shift:.55,showHeight:true}
  ),
  'g10-p04-03':prism(
    'Поверхность прямой призмы',
    'Боковая поверхность прямой призмы разворачивается в набор прямоугольников общей ширины Pосн и высоты h.'
  ),
  'g10-p04-04':box(
    'Параллелепипед как частный случай призмы',
    'Противоположные грани параллельны; для прямоугольного параллелепипеда пространственная диагональ вычисляется через два прямоугольных треугольника.'
  ),
  'g10-p04-05':box(
    'Сечение призмы',
    'Каждая сторона MNPQ должна быть обоснована как отрезок следа секущей плоскости на конкретной грани.',
    true
  ),
  'g10-p04-06':pyramid(
    'Пирамида и её высота',
    'SO — перпендикуляр к плоскости основания. Тетраэдр является треугольной пирамидой.',
    {heightStyle:'emphasis',showO:true}
  ),
  'g10-p04-07':pyramid(
    'Правильная пирамида: высота и апофема',
    'SO — пространственная высота, SM — апофема боковой грани. Эти отрезки выполняют разные роли.',
    {apothem:true,showO:true}
  ),
  'g10-p04-08':pyramid(
    'Площадь поверхности правильной пирамиды',
    'Боковые грани — равные треугольники; их высота равна апофеме l, поэтому Sбок=1/2·Pосн·l.',
    {apothem:true}
  ),
  'g10-p04-09':frustum(
    'Правильная усечённая пирамида',
    'Боковые грани являются равными равнобедренными трапециями; MN — апофема боковой трапеции.'
  )
};
})();