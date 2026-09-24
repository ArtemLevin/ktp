(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;if(!S)return;
const plane=(id,title,caption,top=false)=>({
 title,ariaLabel:title,camera:{yaw:-31,pitch:29,scale:68,origin:[210,160]},
 points:{
  P:[-1.65,-1.15,top?1.1:0],Q:[1.65,-1.15,top?1.1:0],R:[1.65,1.15,top?1.1:0],T:[-1.65,1.15,top?1.1:0],
  A:[-1.15,-.5,top?1.1:0],B:[1.15,-.5,top?1.1:0],C:[-1.15,.5,top?1.1:0],D:[1.15,.5,top?1.1:0]
 },
 labels:{P:false,Q:false,R:false,T:false,A:false,B:false,C:false,D:false},
 objects:[
  {type:'plane',points:['P','Q','R','T'],style:'aux'},
  {type:'line',points:['A','B'],extent:.22,style:'emphasis'},
  {type:'line',points:['C','D'],extent:.22}
 ],
 caption
});
const tetra=(title,caption,section=false)=>({
 title,ariaLabel:title,camera:{yaw:-35,pitch:24,scale:65,origin:[210,165]},
 points:{
  A:[0,0,2.4],B:[-1.7,-1.2,0],C:[1.7,-1.2,0],D:[0,1.7,0],
  M:[-.85,-.6,1.2],N:[.85,-.6,1.2],K:[0,.85,1.2]
 },
 labels:section?{M:{dx:-15,dy:-4},N:{dx:8,dy:-4},K:{dx:8,dy:-7}}:{},
 objects:[
  {type:'face',points:['B','C','D'],style:'aux'},
  {type:'segment',points:['A','B'],style:'emphasis'},
  {type:'segment',points:['A','C']},
  {type:'segment',points:['A','D']},
  {type:'segment',points:['B','C']},
  {type:'segment',points:['C','D'],style:'emphasis'},
  {type:'segment',points:['D','B'],visibility:'hidden'},
  ...(section?[
   {type:'face',points:['M','N','K'],style:'emphasis'},
   {type:'polyline',points:['M','N','K'],closed:true,style:'emphasis'}
  ]:[])
 ],
 caption
});
const box=(title,caption,section=false)=>({
 title,ariaLabel:title,camera:{yaw:-38,pitch:24,scale:58,origin:[210,162]},
 points:{
  A:[0,0,0],B:[2.2,0,0],C:[2.2,1.6,0],D:[0,1.6,0],
  A1:[0,0,1.8],B1:[2.2,0,1.8],C1:[2.2,1.6,1.8],D1:[0,1.6,1.8],
  M:[0,0,.9],N:[2.2,0,.9],K:[2.2,1.6,.9],L:[0,1.6,.9]
 },
 labels:section?{M:{dx:-16,dy:0},N:{dx:7,dy:0},K:{dx:7,dy:-5},L:{dx:-16,dy:-5}}:{},
 objects:[
  {type:'face',points:['A1','B1','C1','D1'],style:'aux'},
  {type:'segment',points:['A','B']},{type:'segment',points:['B','C']},
  {type:'segment',points:['C','D'],visibility:'hidden'},{type:'segment',points:['D','A'],visibility:'hidden'},
  {type:'segment',points:['A1','B1']},{type:'segment',points:['B1','C1']},{type:'segment',points:['C1','D1']},{type:'segment',points:['D1','A1']},
  {type:'segment',points:['A','A1']},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'},
  ...(section?[
   {type:'face',points:['M','N','K','L'],style:'emphasis'},
   {type:'polyline',points:['M','N','K','L'],closed:true,style:'emphasis'}
  ]:[])
 ],
 caption
});
S.spatialScenes={
 'g10-p02-01':plane('1','Параллельные прямые в одной плоскости','Компланарность + отсутствие общей точки отличают параллельные прямые от скрещивающихся.'),
 'g10-p02-02':plane('2','Параллельность через третье направление','Обе прямые имеют направление, параллельное одной и той же прямой; это переносит параллельность.'),
 'g10-p02-03':{
  title:'Прямая и плоскость',ariaLabel:'Прямая a над плоскостью alpha и параллельная ей прямая b в плоскости',
  camera:{yaw:-30,pitch:30,scale:68,origin:[210,160]},
  points:{P:[-1.7,-1.2,0],Q:[1.7,-1.2,0],R:[1.7,1.2,0],T:[-1.7,1.2,0],A:[-1.1,-.3,1],B:[1.1,-.3,1],C:[-1.1,.25,0],D:[1.1,.25,0]},
  labels:{P:false,Q:false,R:false,T:false,A:false,B:false,C:false,D:false},
  objects:[{type:'plane',points:['P','Q','R','T'],style:'aux'},{type:'line',points:['C','D'],extent:.2},{type:'line',points:['A','B'],extent:.2,style:'emphasis'}],
  caption:'a∥b, b⊂α и a⊄α позволяют применить признак a∥α.'
 },
 'g10-p02-04':box('Доказательство a∥α на модели параллелепипеда','Опорную прямую ищут внутри нужной плоскости: соответствующие рёбра дают готовое параллельное направление.'),
 'g10-p02-05':{
  title:'Скрещивающиеся прямые',ariaLabel:'Две некомпланарные прямые a и b',
  camera:{yaw:-35,pitch:24,scale:72,origin:[210,155]},
  points:{A:[-1.3,-.7,0],B:[1.3,-.7,0],C:[.55,-1.2,1.15],D:[.55,1.2,1.15]},
  labels:{A:false,B:false,C:false,D:false},
  objects:[{type:'line',points:['A','B'],extent:.25,style:'emphasis'},{type:'line',points:['C','D'],extent:.25}],
  caption:'Изображения могут пересекаться после смены камеры, но сами прямые остаются некомпланарными.'
 },
 'g10-p02-06':{
  title:'Признак скрещивания',ariaLabel:'Прямая a в плоскости alpha и прямая b пересекающая плоскость вне a',
  camera:{yaw:-31,pitch:30,scale:68,origin:[210,165]},
  points:{P:[-1.7,-1.2,0],Q:[1.7,-1.2,0],R:[1.7,1.2,0],T:[-1.7,1.2,0],A:[-1.1,0,0],B:[1.1,0,0],M:[.3,.65,0],U:[.3,.65,1.35],V:[.3,.65,-1.1]},
  labels:{P:false,Q:false,R:false,T:false,A:false,B:false,U:false,V:false},
  objects:[{type:'plane',points:['P','Q','R','T'],style:'aux'},{type:'line',points:['A','B'],extent:.22,style:'emphasis'},{type:'segment',points:['U','M']},{type:'segment',points:['M','V'],visibility:'hidden'}],
  caption:'b пересекает α в M, причём M∉a: a и b скрещиваются.'
 },
 'g10-p02-07':plane('7','Сонаправленные стороны углов','Параллельный перенос направления сохраняет величину угла между соответствующими сонаправленными лучами.'),
 'g10-p02-08':{
  title:'Угол между скрещивающимися прямыми',ariaLabel:'Скрещивающиеся линии и параллельно перенесенные направления через точку O',
  camera:{yaw:-34,pitch:27,scale:68,origin:[210,160]},
  points:{A:[-1.4,-.7,0],B:[1.4,-.7,0],C:[.7,-1.2,1.1],D:[.7,1.2,1.1],O:[-.4,.5,0],E:[.9,.5,0],F:[-.4,1.55,0]},
  labels:{A:false,B:false,C:false,D:false,E:false,F:false},
  objects:[{type:'line',points:['A','B'],extent:.12,style:'aux'},{type:'line',points:['C','D'],extent:.12,style:'aux'},{type:'segment',points:['O','E'],style:'emphasis'},{type:'segment',points:['O','F'],style:'emphasis'}],
  caption:'Истинный угол получают между пересекающимися копиями направлений, а не измеряют на исходной проекции.'
 },
 'g10-p02-09':tetra('Классификация рёбер тетраэдра','Рёбра с общей вершиной пересекаются; противоположные рёбра тетраэдра скрещиваются.'),
 'g10-p02-10':{
  title:'Признак параллельности плоскостей',ariaLabel:'Две параллельные плоскости с парами соответствующих параллельных прямых',
  camera:{yaw:-31,pitch:28,scale:62,origin:[210,165]},
  points:{A:[-1.5,-1,0],B:[1.5,-1,0],C:[-1.5,1,0],D:[1.5,1,0],A1:[-1.5,-1,1.2],B1:[1.5,-1,1.2],C1:[-1.5,1,1.2],D1:[1.5,1,1.2]},
  labels:{A:false,B:false,C:false,D:false,A1:false,B1:false,C1:false,D1:false},
  objects:[{type:'plane',points:['A','B','D','C'],style:'aux'},{type:'plane',points:['A1','B1','D1','C1'],style:'emphasis'},{type:'segment',points:['A','B']},{type:'segment',points:['A','C']},{type:'segment',points:['A1','B1']},{type:'segment',points:['A1','C1']}],
  caption:'Две пересекающиеся прямые нижней плоскости попарно параллельны двум пересекающимся прямым верхней.'
 },
 'g10-p02-11':box('Свойства параллельных плоскостей','Противоположные грани параллелепипеда дают модель двух параллельных плоскостей и параллельных секущих направлений.'),
 'g10-p02-12':{
  title:'Параллельная проекция',ariaLabel:'Параллелограмм в пространстве как проекционная модель',
  camera:{yaw:-42,pitch:18,scale:68,origin:[210,160]},
  points:{A:[-1.2,-.8,.9],B:[1.2,-.8,.9],C:[1.55,.8,.2],D:[-.85,.8,.2]},
  objects:[{type:'polyline',points:['A','B','C','D'],closed:true,style:'emphasis'}],
  caption:'Структура прямых и параллельных направлений сохраняется, а длины и углы на экране могут изменяться.'
 },
 'g10-p02-13':tetra('Тетраэдр: рёбра и грани','Тетраэдр — базовая модель для пересекающихся и скрещивающихся прямых.'),
 'g10-p02-14':box('Параллелепипед: параллельные рёбра и грани','Противоположные грани параллельны; соответствующие рёбра задают устойчивые параллельные направления.'),
 'g10-p02-15':tetra('Сечение по точкам одной грани','Если две точки секущей плоскости лежат в одной грани, их можно соединить частью следа этой плоскости.',true),
 'g10-p02-16':box('Метод следов','Построение продолжается грань за гранью: две точки следа определяют линию пересечения секущей плоскости с гранью.',true),
 'g10-p02-17':box('Сечение и параллельность','Параллельные рёбра и грани помогают обоснованно продолжать след секущей плоскости.',true),
 'g10-p02-18':tetra('Комплексная пространственная конфигурация','Перед выбором теоремы сначала классифицируйте пары прямых и установите рабочую плоскость.',true),
 'g10-p02-19':box('Итоговая диагностика темы','Диагностика проверяет распознавание конфигурации, условия теорем и корректность построения сечения.',true)
};
})();