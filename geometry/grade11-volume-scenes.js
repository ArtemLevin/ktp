(function(){
'use strict';

const camera={yaw:-36,pitch:24,scale:54,origin:[210,165]};

const box=(title,caption,{x=2.4,y=1.6,z=1.8,shift=0,height=false,diagonal=false}={})=>{
  const p={
    A:[0,0,0],B:[x,0,0],C:[x,y,0],D:[0,y,0],
    A1:[shift,0,z],B1:[x+shift,0,z],C1:[x+shift,y,z],D1:[shift,y,z],
    H:[0,0,z]
  };
  const o=[
    {type:'face',points:['A1','B1','C1','D1'],style:'aux'},
    {type:'segment',points:['A','B']},{type:'segment',points:['B','C']},
    {type:'segment',points:['C','D'],visibility:'hidden'},{type:'segment',points:['D','A'],visibility:'hidden'},
    {type:'segment',points:['A1','B1']},{type:'segment',points:['B1','C1']},{type:'segment',points:['C1','D1']},{type:'segment',points:['D1','A1']},
    {type:'segment',points:['A','A1'],style:shift?'main':'emphasis'},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'}
  ];
  if(height)o.push({type:'segment',points:['A','H'],style:'emphasis'});
  if(diagonal)o.push({type:'segment',points:['A','C1'],style:'emphasis'});
  return{title,ariaLabel:title,camera,points:p,labels:{H:height?'H':false},objects:o,caption};
};

const triangularPrism=(title,caption,{shift=.0,height=false}={})=>{
  const p={
    A:[-1.35,-.9,0],B:[1.35,-.9,0],C:[0,1.05,0],
    A1:[-1.35+shift,-.9,1.9],B1:[1.35+shift,-.9,1.9],C1:[shift,1.05,1.9],
    H:[-1.35,-.9,1.9]
  };
  const o=[
    {type:'face',points:['A','B','C'],style:'aux'},{type:'face',points:['A1','B1','C1'],style:'aux'},
    {type:'segment',points:['A','B']},{type:'segment',points:['B','C']},{type:'segment',points:['C','A'],visibility:'hidden'},
    {type:'segment',points:['A1','B1']},{type:'segment',points:['B1','C1']},{type:'segment',points:['C1','A1']},
    {type:'segment',points:['A','A1']},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']}
  ];
  if(height)o.push({type:'segment',points:['A','H'],style:'emphasis'});
  return{title,ariaLabel:title,camera:{...camera,scale:60},points:p,labels:{H:height?'H':false},objects:o,caption};
};

const pyramid=(title,caption,{apex=[0,0,2.5],section=false}={})=>{
  const p={
    A:[-1.45,-1.2,0],B:[1.45,-1.2,0],C:[1.45,1.2,0],D:[-1.45,1.2,0],
    S:apex,O:[apex[0],apex[1],0],
    M:[-.72,-.6,1.25],N:[.72,-.6,1.25],P:[.72,.6,1.25],Q:[-.72,.6,1.25]
  };
  const o=[
    {type:'face',points:['A','B','C','D'],style:'aux'},
    {type:'segment',points:['S','A']},{type:'segment',points:['S','B']},{type:'segment',points:['S','C']},{type:'segment',points:['S','D']},
    {type:'segment',points:['A','B']},{type:'segment',points:['B','C']},{type:'segment',points:['C','D'],visibility:'hidden'},{type:'segment',points:['D','A'],visibility:'hidden'},
    {type:'segment',points:['S','O'],style:'emphasis'}
  ];
  if(section)o.push(
    {type:'face',points:['M','N','P','Q'],style:'emphasis'},
    {type:'polyline',points:['M','N','P','Q'],closed:true,style:'emphasis'}
  );
  return{title,ariaLabel:title,camera:{...camera,scale:59},points:p,labels:{O:'O'},objects:o,caption};
};

const unitGrid={
  title:'Объём как число единичных кубов',
  ariaLabel:'Прямоугольный параллелепипед два на два на два, разбитый на восемь единичных кубов',
  camera:{yaw:-38,pitch:25,scale:65,origin:[210,175]},
  points:{
    A:[0,0,0],B:[2,0,0],C:[2,2,0],D:[0,2,0],A1:[0,0,2],B1:[2,0,2],C1:[2,2,2],D1:[0,2,2],
    E:[1,0,0],F:[1,0,2],G:[1,2,2],H:[0,1,0],I:[0,1,2],J:[2,1,2],K:[0,0,1],L:[2,0,1],M:[2,2,1]
  },
  labels:{E:false,F:false,G:false,H:false,I:false,J:false,K:false,L:false,M:false},
  objects:[
    {type:'face',points:['A1','B1','C1','D1'],style:'aux'},
    {type:'polyline',points:['A','B','C','D'],closed:true},{type:'polyline',points:['A1','B1','C1','D1'],closed:true},
    {type:'segment',points:['A','A1']},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'},
    {type:'segment',points:['E','F'],style:'emphasis'},{type:'segment',points:['F','G'],style:'emphasis'},
    {type:'segment',points:['H','I'],style:'aux'},{type:'segment',points:['I','J'],style:'aux'},
    {type:'segment',points:['K','L'],style:'aux'},{type:'segment',points:['L','M'],style:'aux'}
  ],
  caption:'Разбиение подчёркивает кубическую размерность: объём складывается из объёмов непересекающихся частей.'
};

const frustum={
  title:'Усечённая пирамида как разность двух подобных пирамид',
  ariaLabel:'Квадратная усечённая пирамида и продолжения боковых рёбер к общей вершине',
  camera:{yaw:-35,pitch:24,scale:55,origin:[210,180]},
  points:{
    A:[-1.55,-1.35,0],B:[1.55,-1.35,0],C:[1.55,1.35,0],D:[-1.55,1.35,0],
    A1:[-.82,-.72,1.5],B1:[.82,-.72,1.5],C1:[.82,.72,1.5],D1:[-.82,.72,1.5],
    S:[0,0,3.18],O:[0,0,0],O1:[0,0,1.5]
  },
  objects:[
    {type:'face',points:['A','B','C','D'],style:'aux'},{type:'face',points:['A1','B1','C1','D1'],style:'emphasis'},
    {type:'segment',points:['A','A1']},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'},
    {type:'segment',points:['A1','S'],style:'aux'},{type:'segment',points:['B1','S'],style:'aux'},{type:'segment',points:['C1','S'],style:'aux'},{type:'segment',points:['D1','S'],style:'aux'},
    {type:'segment',points:['O','O1'],style:'emphasis'},{type:'segment',points:['O1','S'],style:'aux'}
  ],
  caption:'Продолжение боковых рёбер восстанавливает две подобные пирамиды: объём усечённой части находят вычитанием.'
};

const sectionScene={
  title:'Рабочее сечение для поиска истинной высоты',
  ariaLabel:'Наклонная четырёхугольная призма с вертикальной высотой и диагональным рабочим сечением',
  camera:{yaw:-37,pitch:24,scale:52,origin:[210,170]},
  points:{
    A:[0,0,0],B:[2.4,0,0],C:[2.4,1.5,0],D:[0,1.5,0],
    A1:[.7,0,1.8],B1:[3.1,0,1.8],C1:[3.1,1.5,1.8],D1:[.7,1.5,1.8],
    H:[0,0,1.8],M:[0,0,0],N:[.7,0,1.8],P:[3.1,0,1.8],Q:[2.4,0,0]
  },
  labels:{H:'H',M:false,N:false,P:false,Q:false},
  objects:[
    {type:'face',points:['A1','B1','C1','D1'],style:'aux'},
    {type:'face',points:['M','N','P','Q'],style:'emphasis'},
    {type:'polyline',points:['M','N','P','Q'],closed:true,style:'emphasis'},
    {type:'segment',points:['A','A1']},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'},
    {type:'segment',points:['A','H'],style:'emphasis'}
  ],
  caption:'Сечение помогает получить истинную длину; объём затем вычисляется по площади основания и перпендикулярной высоте.'
};

const similarScene={
  title:'Подобные тела: k, k² и k³',
  ariaLabel:'Два подобных прямоугольных параллелепипеда с коэффициентом линейного подобия полтора',
  camera:{yaw:-38,pitch:24,scale:44,origin:[210,170]},
  points:{
    A:[-2.7,-.45,0],B:[-1.5,-.45,0],C:[-1.5,.35,0],D:[-2.7,.35,0],A1:[-2.7,-.45,.9],B1:[-1.5,-.45,.9],C1:[-1.5,.35,.9],D1:[-2.7,.35,.9],
    E:[.1,-.72,0],F:[1.9,-.72,0],G:[1.9,.48,0],H:[.1,.48,0],E1:[.1,-.72,1.35],F1:[1.9,-.72,1.35],G1:[1.9,.48,1.35],H1:[.1,.48,1.35]
  },
  objects:[
    {type:'face',points:['A1','B1','C1','D1'],style:'aux'},{type:'polyline',points:['A','B','C','D'],closed:true},{type:'polyline',points:['A1','B1','C1','D1'],closed:true},
    {type:'segment',points:['A','A1']},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'},
    {type:'face',points:['E1','F1','G1','H1'],style:'emphasis'},{type:'polyline',points:['E','F','G','H'],closed:true},{type:'polyline',points:['E1','F1','G1','H1'],closed:true},
    {type:'segment',points:['E','E1']},{type:'segment',points:['F','F1']},{type:'segment',points:['G','G1']},{type:'segment',points:['H','H1'],visibility:'hidden'}
  ],
  caption:'Если линейный масштаб равен k, площади меняются как k², а объёмы — как k³.'
};

const compositeScene={
  title:'Составное тело и полость',
  ariaLabel:'Прямоугольный блок с выделенным меньшим внутренним блоком, объём которого нужно вычесть',
  camera:{yaw:-38,pitch:24,scale:50,origin:[210,170]},
  points:{
    A:[0,0,0],B:[2.8,0,0],C:[2.8,1.9,0],D:[0,1.9,0],A1:[0,0,1.8],B1:[2.8,0,1.8],C1:[2.8,1.9,1.8],D1:[0,1.9,1.8],
    E:[.8,.45,.45],F:[2,.45,.45],G:[2,1.35,.45],H:[.8,1.35,.45],E1:[.8,.45,1.35],F1:[2,.45,1.35],G1:[2,1.35,1.35],H1:[.8,1.35,1.35]
  },
  objects:[
    {type:'face',points:['A1','B1','C1','D1'],style:'aux'},
    {type:'polyline',points:['A','B','C','D'],closed:true},{type:'polyline',points:['A1','B1','C1','D1'],closed:true},
    {type:'segment',points:['A','A1']},{type:'segment',points:['B','B1']},{type:'segment',points:['C','C1']},{type:'segment',points:['D','D1'],visibility:'hidden'},
    {type:'face',points:['E1','F1','G1','H1'],style:'emphasis'},
    {type:'polyline',points:['E','F','G','H'],closed:true,style:'emphasis'},{type:'polyline',points:['E1','F1','G1','H1'],closed:true,style:'emphasis'},
    {type:'segment',points:['E','E1'],style:'emphasis'},{type:'segment',points:['F','F1'],style:'emphasis'},{type:'segment',points:['G','G1'],style:'emphasis'},{type:'segment',points:['H','H1'],style:'emphasis'}
  ],
  caption:'Перед вычислением подпишите знак каждой части: внешний объём складывается, полость вычитается.'
};

window.KTP_G11_VOLUME_SCENES={
  'g11-vol-01-unit':unitGrid,
  'g11-vol-02-box':box('Прямоугольный параллелепипед','Три взаимно перпендикулярных измерения задают V=abc.',{diagonal:true}),
  'g11-vol-03-prism':triangularPrism('Прямая призма','Высота совпадает с боковым ребром только у прямой призмы.'),
  'g11-vol-04-oblique':triangularPrism('Наклонная призма','Боковое ребро наклонено; выделенный перпендикуляр показывает истинную высоту между основаниями.',{shift:.75,height:true}),
  'g11-vol-05-pyramid':pyramid('Пирамида и её высота','Высота — перпендикуляр от вершины к плоскости основания; V=1/3·Sосн·h.'),
  'g11-vol-06-frustum':frustum,
  'g11-vol-07-section':sectionScene,
  'g11-vol-08-similar':similarScene,
  'g11-vol-09-composite':compositeScene,
  'g11-vol-10-diagnostic':pyramid('Диагностическая конфигурация','Сначала определите основание и истинную высоту, затем выбирайте формулу объёма.',{apex:[.65,.25,2.5],section:true})
};
})();
