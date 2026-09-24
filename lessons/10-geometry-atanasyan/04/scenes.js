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
    A:[-side,-side,0],B:[side,-side,0],C:[side,side,0],D:[-side,side,0],
    O:[0,0,0],M:[0,-side,0],S:[0,0,h]
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
      A:[-1.5,-1.5,0],B:[1.5,-1.5,0],C:[1.5,1.5,0],D:[-1.5,1.5,0],
      A1:[-.8,-.8,1.6],B1:[.8,-.8,1.6],C1:[.8,.8,1.6],D1:[-.8,.8,1.6],
      M:[0,-1.5,0],N:[0,-.8,1.6]
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
Object.assign(S.spatialScenes,{
  'g10-p04-10':{
    title:'Сечение пирамиды, параллельное основанию',
    ariaLabel:'Квадратная пирамида с квадратным сечением, параллельным основанию',
    camera:{yaw:-35,pitch:24,scale:60,origin:[210,168]},
    points:{
      A:[-1.4,-1.4,0],B:[1.4,-1.4,0],C:[1.4,1.4,0],D:[-1.4,1.4,0],S:[0,0,2.4],
      M:[-.7,-.7,1.2],N:[.7,-.7,1.2],P:[.7,.7,1.2],Q:[-.7,.7,1.2]
    },
    objects:[
      {type:'face',points:['A','B','C','D'],style:'aux'},
      {type:'segment',points:['S','A']},{type:'segment',points:['S','B']},{type:'segment',points:['S','C']},{type:'segment',points:['S','D']},
      {type:'face',points:['M','N','P','Q'],style:'emphasis'},
      {type:'polyline',points:['M','N','P','Q'],closed:true,style:'emphasis'}
    ],
    caption:'Параллельное основанию сечение подобно основанию; линейный масштаб и масштаб площади различаются.'
  },
  'g10-p04-11':{
    title:'Октаэдр как правильный многогранник',
    ariaLabel:'Правильный октаэдр с восемью треугольными гранями',
    camera:{yaw:-32,pitch:22,scale:58,origin:[210,165]},
    points:{T:[0,0,1.5],B:[0,0,-1.5],A:[-1.5,0,0],C:[0,1.5,0],D:[1.5,0,0],E:[0,-1.5,0]},
    objects:[
      {type:'face',points:['T','A','C'],style:'aux'},
      {type:'face',points:['T','C','D'],style:'aux'},
      {type:'segment',points:['T','A']},{type:'segment',points:['T','C']},{type:'segment',points:['T','D']},{type:'segment',points:['T','E']},
      {type:'polyline',points:['A','C','D','E'],closed:true},
      {type:'segment',points:['B','A']},{type:'segment',points:['B','C']},{type:'segment',points:['B','D']},{type:'segment',points:['B','E'],visibility:'hidden'}
    ],
    caption:'У правильного октаэдра 8 равных правильных треугольных граней, 6 вершин и 12 рёбер.'
  },
  'g10-p04-12':{
    title:'Плоскость симметрии куба',
    ariaLabel:'Куб и плоскость симметрии, проходящая через его центр',
    camera:{yaw:-38,pitch:24,scale:54,origin:[210,165]},
    points:{
      A:[0,0,0],B:[1.8,0,0],C:[1.8,1.8,0],D:[0,1.8,0],
      A1:[0,0,1.8],B1:[1.8,0,1.8],C1:[1.8,1.8,1.8],D1:[0,1.8,1.8],
      P:[.9,-.2,-.1],Q:[.9,2,-.1],R:[.9,2,1.9],T:[.9,-.2,1.9],O:[.9,.9,.9]
    },
    labels:{P:false,Q:false,R:false,T:false},
    objects:[
      {type:'plane',points:['P','Q','R','T'],style:'emphasis'},
      {type:'segment',points:['A','B']},{type:'segment',points:['B','C']},{type:'segment',points:['C','D'],visibility:'hidden'},{type:'segment',points:['D','A'],visibility:'hidden'},
      {type:'segment',points:['A1','B1']},{type:'segment',points:['B1','C1']},{type:'segment',points:['C1','D1']},{type:'segment',points:['D1','A1']},
      {type:'segment',points:['A','A1']},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'}
    ],
    caption:'Отражение относительно выделенной плоскости переводит куб в себя и меняет местами симметричные вершины.'
  },
  'g10-p04-13':box(
    'Эйлер на модели параллелепипеда',
    'Для выпуклого параллелепипеда: Nv=8, Ne=12, Nf=6, поэтому 8−12+6=2.'
  ),
  'g10-p04-14':{
    title:'Объём прямоугольного параллелепипеда',
    ariaLabel:'Прямоугольный параллелепипед с тремя взаимно перпендикулярными измерениями',
    camera:{yaw:-38,pitch:24,scale:50,origin:[210,170]},
    points:{A:[0,0,0],B:[2.4,0,0],C:[2.4,1.6,0],D:[0,1.6,0],A1:[0,0,1.8],B1:[2.4,0,1.8],C1:[2.4,1.6,1.8],D1:[0,1.6,1.8]},
    objects:[
      {type:'face',points:['A1','B1','C1','D1'],style:'aux'},
      {type:'segment',points:['A','B'],style:'emphasis'},{type:'segment',points:['B','C'],style:'emphasis'},
      {type:'segment',points:['A','A1'],style:'emphasis'},
      {type:'segment',points:['C','D'],visibility:'hidden'},{type:'segment',points:['D','A'],visibility:'hidden'},
      {type:'segment',points:['A1','B1']},{type:'segment',points:['B1','C1']},{type:'segment',points:['C1','D1']},{type:'segment',points:['D1','A1']},
      {type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'}
    ],
    caption:'Объём прямоугольного параллелепипеда равен произведению трёх взаимно перпендикулярных измерений: V=abc.'
  },
  'g10-p04-15':prism(
    'Объём наклонной призмы',
    'В формуле V=Sосн·h используется перпендикулярное расстояние между основаниями; наклонное боковое ребро не заменяет h.',
    {shift:.6,showHeight:true}
  ),
  'g10-p04-16':pyramid(
    'Объём пирамиды',
    'Пирамида с теми же основанием и высотой, что и призма, имеет объём V=1/3·Sосн·h.',
    {heightStyle:'emphasis',showO:true}
  ),
  'g10-p04-17':{
    title:'Подобные многогранники',
    ariaLabel:'Два подобных прямоугольных параллелепипеда с разным линейным масштабом',
    camera:{yaw:-38,pitch:24,scale:46,origin:[210,170]},
    points:{
      A:[-2.5,-.45,0],B:[-1.3,-.45,0],C:[-1.3,.35,0],D:[-2.5,.35,0],A1:[-2.5,-.45,.9],B1:[-1.3,-.45,.9],C1:[-1.3,.35,.9],D1:[-2.5,.35,.9],
      E:[.15,-.75,0],F:[1.95,-.75,0],G:[1.95,.45,0],H:[.15,.45,0],E1:[.15,-.75,1.35],F1:[1.95,-.75,1.35],G1:[1.95,.45,1.35],H1:[.15,.45,1.35]
    },
    objects:[
      {type:'face',points:['A1','B1','C1','D1'],style:'aux'},
      {type:'polyline',points:['A','B','C','D'],closed:true},{type:'polyline',points:['A1','B1','C1','D1'],closed:true},
      {type:'segment',points:['A','A1']},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'},
      {type:'face',points:['E1','F1','G1','H1'],style:'emphasis'},
      {type:'polyline',points:['E','F','G','H'],closed:true},{type:'polyline',points:['E1','F1','G1','H1'],closed:true},
      {type:'segment',points:['E','E1']},{type:'segment',points:['F','F1']},{type:'segment',points:['G','G1']},{type:'segment',points:['H','H1'],visibility:'hidden'}
    ],
    caption:'Линейные размеры меняются как k, площади как k², объёмы как k³.'
  },
  'g10-p04-18':box(
    'Диагностика темы «Многогранники»',
    'В итоговой задаче сначала распознайте модель и величину, затем выберите высоту/апофему/сечение и только после этого формулу.'
  )
});
})();