(function(){
'use strict';
const M=window.KTP_VECTOR_MATH;
if(!M)throw new Error('Load vector-math.js before grade11-vector-scenes.js');
const camera={yaw:-32,pitch:-58,scale:60,origin:[190,200]};
const arrow=(from,to,id,label=id,style='main',labelOffset=[0,-10])=>
  ({type:'vector',points:[from,to],vectorId:id,label,style,labelOffset});
const edge=(from,to,hidden=false)=>({type:'segment',points:[from,to],style:'aux',...(hidden?{visibility:'hidden'}:{})});
const scene=(lesson,title,points,objects,caption,math,labels={})=>({
  lesson,title,ariaLabel:title+'. '+caption,caption,points,objects,math,labels,
  viewBox:[50,55,330,230],camera:{...camera,origin:[...camera.origin]}
});
const S={};
S['g11-vector-33-directed']=scene(33,'Направленный отрезок и нулевой вектор',
  {A:[-.8,-.7,0],B:[1.2,.3,1],Z:[-.8,1.5,0]},
  [arrow('A','B','AB','AB →','emphasis'),arrow('Z','Z','zero','0⃗','main',[16,-14])],
  'Стрелка AB идёт от A к B. Нулевой вектор в точке Z обозначен кольцом; длина равна 0.',
  {focus:'directed',vector:['A','B'],zero:['Z','Z'],length:Math.sqrt(6)},
  {A:{dx:-14,dy:17},Z:{dx:-15,dy:16}});

const eqA=[-1,-.8,0],eqB=[.7,-.6,.8],translated=M.translate(M.directedSegment('a',eqA,eqB),[-1,1,.3]);
S['g11-vector-34-equality']=scene(34,'Равные векторы из разных начал',
  {A:eqA,B:eqB,C:translated.from,D:translated.to,E:[.6,-.5,1.7],F:M.add([.6,-.5,1.7],M.scale(translated.displacement,-1))},
  [arrow('A','B','a','a⃗','emphasis'),arrow('C','D','a-copy','a⃗','emphasis',[0,-18]),arrow('E','F','minus-a','−a⃗','main',[0,19])],
  'AB = CD: направления и длины совпадают. EF имеет ту же длину и противоположное направление.',
  {focus:'equality',equal:[['A','B'],['C','D']],opposed:[['A','B'],['E','F']]},
  {A:{dy:17},C:{dx:-13,dy:17},F:{dx:-12,dy:-9},E:{dx:10,dy:-16}});

S['g11-vector-35-triangle']=scene(35,'Правило треугольника',
  {O:[-1,-.8,0],A:[.7,-.8,0],B:[.9,1.3,1.4]},
  [arrow('O','A','a','a⃗'),arrow('A','B','b','b⃗'),arrow('O','B','sum','a⃗ + b⃗','emphasis',[-25,6])],
  'Второй вектор начинается в конце первого: OA + AB = OB.',
  {focus:'triangle',terms:[['O','A'],['A','B']],result:['O','B']},
  {O:{dx:-13,dy:15},A:{dy:16}});

S['g11-vector-36-difference']=scene(36,'Ориентация разности',
  {O:[-1,-.8,0],A:[.9,-.6,.4],B:[-.3,1,1.6]},
  [arrow('O','A','a','a⃗'),arrow('O','B','b','b⃗'),arrow('B','A','difference','a⃗ − b⃗','emphasis',[26,-4])],
  'Для векторов с общим началом OA − OB = BA. Разность направлена от конца вычитаемого к концу уменьшаемого.',
  {focus:'difference',terms:[['O','A'],['O','B']],result:['B','A']},
  {O:{dy:16},A:{dx:10,dy:15},B:{dx:-13,dy:-10}});

S['g11-vector-37-chain']=scene(37,'Сумма вдоль пространственной ломаной',
  {O:[-1,-.7,0],A:[.7,-.7,0],B:[.7,1.1,.2],C:[.7,1.1,1.5],D:[-.4,.7,1.5]},
  [arrow('O','A','OA',''),arrow('A','B','AB',''),arrow('B','C','BC',''),arrow('C','D','CD',''),arrow('O','D','OD','сумма','emphasis',[-22,0])],
  'OA + AB + BC + CD = OD. Ломаная выходит из плоскости; при возвращении в O сумма была бы нулевой.',
  {focus:'chain',terms:[['O','A'],['A','B'],['B','C'],['C','D']],result:['O','D']},
  {O:{dx:-14,dy:16},A:{dy:17},C:{dy:-10},D:{dx:-15,dy:-9}});

S['g11-vector-38-scale']=scene(38,'Знак множителя и длина',
  {O:[0,0,0],A:[1,.2,.3],P:[2,.4,.6],N:[-1.5,-.3,-.45]},
  [arrow('O','P','twice','2a⃗','aux',[8,-20]),arrow('O','A','a','a⃗','emphasis',[0,14]),arrow('O','N','negative','−1,5a⃗')],
  'Вектор 2a сонаправлен a. Вектор −1,5a направлен противоположно, его длина равна 1,5|a|.',
  {focus:'scale',base:['O','A'],scaled:[{k:2,vector:['O','P']},{k:-1.5,vector:['O','N']}]},
  {O:{dx:1,dy:22},A:{dx:8,dy:18},N:{dx:-14,dy:15}});

const prism={A:[-1,-.8,0],B:[1,-.8,0],C:[-.3,1,0],A1:[-.6,-.6,1.8],B1:[1.4,-.6,1.8],C1:[.1,1.2,1.8]};
S['g11-vector-39-prism']=scene(39,'Векторное равенство в наклонной призме',prism,
  [edge('A','C',true),edge('B','C'),edge('A1','B1'),edge('B1','C1'),edge('C1','A1'),edge('C','C1',true),
    arrow('A','B','AB','AB'),arrow('B','B1','BB1','BB₁','main',[25,0]),arrow('A','A1','AA1','AA₁','aux',[-23,0]),arrow('A','B1','AB1','AB₁','emphasis',[0,-16])],
  'В призме AA₁ = BB₁. По правилу треугольника AB + AA₁ = AB + BB₁ = AB₁.',
  {focus:'prism',equal:[['A','A1'],['B','B1']],terms:[['A','B'],['A','A1']],result:['A','B1']},
  {A:{dx:-15,dy:16},B:{dy:17},A1:{text:'A₁',dx:-15,dy:-9},B1:{text:'B₁'},C1:{text:'C₁'}});

const a=[1.5,0,0],b=[0,1.5,.7],c=M.add(M.scale(a,.4),M.scale(b,.8));
const start=[-1,-.8,0];
S['g11-vector-40-coplanar']=scene(40,'Компланарность после переноса к общему началу',
  {O:start,A:M.add(start,a),B:M.add(start,b),C:M.add(start,c),
    U:[-1,-.8,1.5],V:M.add([-1,-.8,1.5],c),P:M.add(start,M.scale(a,-.15)),Q:M.add(start,M.scale(a,1.2)),
    R:M.add(start,M.add(M.scale(a,1.2),M.scale(b,1.2))),T:M.add(start,M.add(M.scale(a,-.15),M.scale(b,1.2)))},
  [{type:'plane',points:['P','Q','R','T'],style:'aux'},arrow('O','A','a','a⃗'),arrow('O','B','b','b⃗'),
    arrow('O','C','c','c⃗','emphasis',[21,5]),arrow('U','V','c-copy','c⃗','emphasis')],
  'UV перенесён в OC. Векторы a, b, c компланарны, поскольку c = 0,4a + 0,8b; исходные отрезки могут находиться в разных плоскостях.',
  {focus:'coplanar',basis:[['O','A'],['O','B']],target:['O','C'],coefficients:[.4,.8],copy:['U','V']},
  {P:false,Q:false,R:false,T:false,O:{dx:-14,dy:14},A:{dy:16},C:{dx:13,dy:12}});

const box=M.parallelepiped([-1,-1,0],[[1.7,0,0],[.4,1.5,0],[.2,.2,1.7]]);
const boxEdges=[edge('A','AB'),edge('B','AB',true),edge('C','AC'),edge('C','BC'),edge('A','AC'),edge('B','BC',true),edge('AB','D'),edge('AC','D'),edge('BC','D')];
const boxLabels={O:{dx:-14,dy:16},A:{dy:18},AB:{text:'E',dy:16},AC:{text:'F'},BC:{text:'G'}};
S['g11-vector-41-box']=scene(41,'Правило параллелепипеда',box.points,
  [...boxEdges,arrow('O','A','a','a⃗'),arrow('O','B','b','b⃗'),arrow('O','C','c','c⃗','main',[-15,0]),arrow('O','D','sum','a⃗ + b⃗ + c⃗','emphasis',[0,-25])],
  'OA, OB, OC — три некомпланарных вектора. Их сумма равна пространственной диагонали OD наклонного параллелепипеда.',
  {focus:'box',basis:[['O','A'],['O','B'],['O','C']],result:['O','D']},boxLabels);

const coeff=[.8,-.4,1.2],basis=box.basis,origin=[-1,-.3,0],p=M.linearCombination(basis,coeff);
S['g11-vector-42-decomposition']=scene(42,'Разложение по неортогональной тройке',
  {O:origin,A:M.add(origin,basis[0]),B:M.add(origin,basis[1]),C:M.add(origin,basis[2]),
    X:M.add(origin,M.scale(basis[0],coeff[0])),Y:M.add(origin,M.sum([M.scale(basis[0],coeff[0]),M.scale(basis[1],coeff[1])])),P:M.add(origin,p)},
  [arrow('O','A','a','a⃗','aux',[0,25]),arrow('O','B','b','b⃗','aux',[-14,-2]),arrow('O','C','c','c⃗','aux',[-16,0]),
    arrow('O','X','xa','','main'),arrow('X','Y','yb','','main'),
    arrow('Y','P','zc','','main'),arrow('O','P','p','p⃗','emphasis',[16,-7])],
  'p = 0,8a − 0,4b + 1,2c. Тройка некомпланарна, поэтому коэффициенты единственны; прямые углы между векторами не требуются.',
  {focus:'decomposition',basis:[['O','A'],['O','B'],['O','C']],target:['O','P'],coefficients:coeff},
  {O:{dx:-15,dy:15},A:{dx:14,dy:12},B:{dx:10,dy:5},X:false,Y:false});

const tetra={O:[-1,-.8,0],A:[1,-.8,0],B:[-.2,1.3,.2],C:[-.3,-.1,2]};
tetra.K=M.scale(M.add(tetra.A,tetra.B),.5);
S['g11-vector-43-midpoint']=scene(43,'Середина ребра тетраэдра',tetra,
  [edge('A','B'),edge('A','C'),edge('B','C',true),edge('O','B',true),
    arrow('O','A','OA','OA','aux'),arrow('O','C','OC','OC','aux',[-25,-2]),
    arrow('C','A','CA','CA','main',[-10,15]),arrow('C','B','CB','CB','main',[25,-2]),arrow('C','K','CK','CK','emphasis',[17,6])],
  'K — середина AB. Вектор CK = ½(CA + CB); следовательно, CK = ½OA + ½OB − OC.',
  {focus:'midpoint',midpoint:['A','B','K'],terms:[['C','A'],['C','B']],result:['C','K'],factor:.5},
  {O:{dx:-14,dy:16},A:{dy:17},B:{dx:10,dy:14},K:{dx:10,dy:13}});

const depOrigin=[-1,-.8,0],depA=[1.6,0,0],depB=[0,1.6,0],depC=M.add(depA,depB);
S['g11-vector-44-dependent']=scene(44,'Почему нужна некомпланарная тройка',
  {O:depOrigin,A:M.add(depOrigin,depA),B:M.add(depOrigin,depB),C:M.add(depOrigin,depC),P:M.add(depOrigin,[0,0,1.7])},
  [{type:'plane',points:['O','A','C','B'],style:'aux'},arrow('O','A','a','a⃗'),arrow('O','B','b','b⃗'),arrow('O','C','c','c⃗','emphasis'),arrow('O','P','p','p⃗')],
  'c = a + b: тройка компланарна. Для c подходят коэффициенты (1; 1; 0) и (0; 0; 1). Вектор OP выходит из этой плоскости и по такой тройке не раскладывается.',
  {focus:'dependent',basis:[['O','A'],['O','B'],['O','C']],alternatives:[[1,1,0],[0,0,1]],target:['O','C'],outside:['O','P']},
  {O:{dx:-14,dy:16},A:{dy:17},B:{dx:-14,dy:-7},P:{dx:-12,dy:-9}});

// Attach authoritative model descriptors. Consumers may use these for assertions or labs.
for(const s of Object.values(S)){
  s.vectors=s.objects.filter(o=>o.type==='vector').map(o=>
    M.directedSegment(o.vectorId,s.points[o.points[0]],s.points[o.points[1]],o.label));
}
window.KTP_G11_VECTOR_SCENES=S;
})();
