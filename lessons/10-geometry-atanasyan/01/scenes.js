(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;if(!S)return;
S.spatialScenes={
 'g10-l01-projection':{
  title:'Куб: модель и проекция',
  ariaLabel:'Куб с видимыми и скрытыми рёбрами',
  camera:{yaw:-38,pitch:24,scale:62,origin:[210,160]},
  points:{A:[0,0,0],B:[2,0,0],C:[2,2,0],D:[0,2,0],A1:[0,0,2],B1:[2,0,2],C1:[2,2,2],D1:[0,2,2]},
  labels:{A:{dx:-14,dy:15},B:{dx:8,dy:14},C:{dx:8,dy:12},D:{dx:-14,dy:-4},A1:{dx:-18,dy:-8},B1:{dx:8,dy:-7},C1:{dx:8,dy:-8},D1:{dx:-18,dy:-8}},
  objects:[
   {type:'face',points:['A1','B1','C1','D1'],style:'aux'},
   {type:'segment',points:['A','B']},{type:'segment',points:['B','C']},
   {type:'segment',points:['C','D'],visibility:'hidden'},{type:'segment',points:['D','A'],visibility:'hidden'},
   {type:'segment',points:['A1','B1']},{type:'segment',points:['B1','C1']},{type:'segment',points:['C1','D1']},{type:'segment',points:['D1','A1']},
   {type:'segment',points:['A','A1']},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'}
  ],
  caption:'Чертёж показывает структуру куба. Длины и углы берутся из модели и условий, а не измеряются по экрану.'
 },
 'g10-l02-axioms':{
  title:'Три точки и плоскость α',
  ariaLabel:'Три неколлинеарные точки A B C в плоскости альфа и прямая AB',
  camera:{yaw:-29,pitch:33,scale:72,origin:[210,160]},
  points:{P:[-1.7,-1.2,0],Q:[1.7,-1.2,0],R:[1.7,1.2,0],S:[-1.7,1.2,0],A:[-1,-.45,0],B:[.9,-.55,0],C:[.15,.8,0]},
  objects:[
   {type:'plane',points:['P','Q','R','S'],style:'aux'},
   {type:'segment',points:['A','B'],style:'emphasis'}
  ],
  caption:'A, B, C неколлинеарны: они определяют единственную плоскость α; две точки A и B обеспечивают AB⊂α.'
 },
 'g10-l03-consequences':{
  title:'Две пересекающиеся прямые задают плоскость',
  ariaLabel:'Две пересекающиеся прямые a и b в плоскости альфа',
  camera:{yaw:-31,pitch:31,scale:72,origin:[210,160]},
  points:{P:[-1.7,-1.2,0],Q:[1.7,-1.2,0],R:[1.7,1.2,0],S:[-1.7,1.2,0],A:[-1.2,0,0],O:[0,0,0],B:[1.2,0,0],C:[0,-.95,0],D:[0,.95,0]},
  objects:[
   {type:'plane',points:['P','Q','R','S'],style:'aux'},
   {type:'line',points:['A','B'],extent:.22,style:'emphasis'},
   {type:'line',points:['C','D'],extent:.22}
  ],
  caption:'Выбираем A∈a и D∈b. Точки A, O, D неколлинеарны; затем аксиома 2 включает обе прямые в найденную плоскость.'
 },
 'g10-l04-section':{
  title:'Секущая плоскость и сечение',
  ariaLabel:'Тетраэдр ABCD с треугольным сечением MNP',
  camera:{yaw:-35,pitch:24,scale:66,origin:[210,165]},
  points:{A:[0,0,2.4],B:[-1.7,-1.2,0],C:[1.7,-1.2,0],D:[0,1.7,0],M:[-.85,-.6,1.2],N:[.85,-.6,1.2],P:[0,.85,1.2]},
  labels:{M:{dx:-16,dy:-4},N:{dx:8,dy:-4},P:{dx:8,dy:-7}},
  objects:[
   {type:'face',points:['B','C','D'],style:'aux'},
   {type:'segment',points:['A','B']},{type:'segment',points:['A','C']},{type:'segment',points:['A','D']},
   {type:'segment',points:['B','C']},{type:'segment',points:['C','D']},{type:'segment',points:['D','B'],visibility:'hidden'},
   {type:'face',points:['M','N','P'],style:'emphasis'},
   {type:'polyline',points:['M','N','P'],closed:true,style:'emphasis'}
  ],
  caption:'Стороны сечения лежат в гранях многогранника; вид рисунка подсказывает конструкцию, но не заменяет проверку принадлежности.'
 }
};
})();