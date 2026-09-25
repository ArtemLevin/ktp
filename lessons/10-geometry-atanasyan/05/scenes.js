(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;if(!S)return;

S.spatialScenes={
  'g10-p05-01':{
    title:'Объём наклонной призмы: высота и боковое ребро',
    ariaLabel:'Наклонная треугольная призма с выделенными боковым ребром и перпендикулярной высотой',
    camera:{yaw:-36,pitch:23,scale:60,origin:[210,165]},
    points:{
      A:[-1.3,-.8,0],B:[1.3,-.8,0],C:[0,1.05,0],
      A1:[-.7,-.8,1.8],B1:[1.9,-.8,1.8],C1:[.6,1.05,1.8],
      H:[-1.3,-.8,1.8]
    },
    labels:{H:'H'},
    objects:[
      {type:'face',points:['A','B','C'],style:'aux'},
      {type:'face',points:['A1','B1','C1'],style:'aux'},
      {type:'polyline',points:['A','B','C'],closed:true},
      {type:'polyline',points:['A1','B1','C1'],closed:true},
      {type:'segment',points:['A','A1'],style:'emphasis'},
      {type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},
      {type:'segment',points:['A','H'],style:'aux'}
    ],
    caption:'AA1 — наклонное боковое ребро; AH — расстояние между плоскостями оснований. В V=Sосн·h используется AH.'
  },
  'g10-p05-02':{
    title:'Практическая модель: прямоугольный контейнер',
    ariaLabel:'Прямоугольный параллелепипед как математическая модель реального контейнера',
    camera:{yaw:-38,pitch:24,scale:50,origin:[210,170]},
    points:{
      A:[0,0,0],B:[2.4,0,0],C:[2.4,1.5,0],D:[0,1.5,0],
      A1:[0,0,1.2],B1:[2.4,0,1.2],C1:[2.4,1.5,1.2],D1:[0,1.5,1.2]
    },
    objects:[
      {type:'face',points:['A1','B1','C1','D1'],style:'aux'},
      {type:'segment',points:['A','B'],style:'emphasis'},
      {type:'segment',points:['B','C'],style:'emphasis'},
      {type:'segment',points:['A','A1'],style:'emphasis'},
      {type:'segment',points:['C','D'],visibility:'hidden'},{type:'segment',points:['D','A'],visibility:'hidden'},
      {type:'segment',points:['A1','B1']},{type:'segment',points:['B1','C1']},{type:'segment',points:['C1','D1']},{type:'segment',points:['D1','A1']},
      {type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'}
    ],
    caption:'Перед вычислением реальный объект заменяется идеализированной геометрической моделью и все размеры приводятся к одной системе единиц.'
  },
  'g10-p05-03':{
    title:'Сечение параллелепипеда: маршрут по граням',
    ariaLabel:'Параллелепипед с плоским четырёхугольным сечением MNPQ',
    camera:{yaw:-38,pitch:24,scale:54,origin:[210,165]},
    points:{
      A:[0,0,0],B:[2.4,0,0],C:[2.4,1.6,0],D:[0,1.6,0],
      A1:[0,0,1.8],B1:[2.4,0,1.8],C1:[2.4,1.6,1.8],D1:[0,1.6,1.8],
      M:[0,0,.55],N:[2.4,0,.85],P:[2.4,1.6,1.15],Q:[0,1.6,.85]
    },
    objects:[
      {type:'face',points:['M','N','P','Q'],style:'emphasis'},
      {type:'polyline',points:['M','N','P','Q'],closed:true,style:'emphasis'},
      {type:'segment',points:['A','B']},{type:'segment',points:['B','C']},{type:'segment',points:['C','D'],visibility:'hidden'},{type:'segment',points:['D','A'],visibility:'hidden'},
      {type:'segment',points:['A1','B1']},{type:'segment',points:['B1','C1']},{type:'segment',points:['C1','D1']},{type:'segment',points:['D1','A1']},
      {type:'segment',points:['A','A1']},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'}
    ],
    caption:'Каждая сторона MNPQ лежит в конкретной грани. Замкнутость и принадлежность граням — обязательная проверка.'
  },
  'g10-p05-04':{
    title:'Карта признаков: перпендикулярность и параллельный перенос',
    ariaLabel:'Плоскость alpha, прямая a перпендикулярная плоскости и параллельная ей прямая b',
    camera:{yaw:-34,pitch:25,scale:55,origin:[210,170]},
    points:{
      H:[0,0,0],X:[-1.6,0,0],Y:[1.6,0,0],U:[0,-1.2,0],V:[0,1.2,0],S:[0,0,2.2],
      K:[1.05,.65,0],T:[1.05,.65,2.2]
    },
    objects:[
      {type:'face',points:['X','V','Y','U'],style:'aux'},
      {type:'segment',points:['X','Y'],style:'aux'},
      {type:'segment',points:['U','V'],style:'aux'},
      {type:'segment',points:['H','S'],style:'emphasis'},
      {type:'segment',points:['K','T'],style:'emphasis'}
    ],
    caption:'Если a⊥α и b∥a, то b⊥α. Для доказательства a⊥α по признаку нужны две пересекающиеся прямые плоскости α.'
  }
};
})();