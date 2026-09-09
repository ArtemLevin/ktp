(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;if(!S)return;
const base=(title,caption,ariaLabel)=>({title,caption,ariaLabel,viewBox:[0,0,420,250],points:{},labels:{},objects:[]});
const parallel=(id,labels=true)=>{
 const s=base('Параллельные прямые','Две прямые сохраняют направление и не пересекаются.','Две горизонтальные параллельные прямые a и b.');
 s.points={A:[40,75],B:[380,75],C:[40,185],D:[380,185]};s.labels={A:false,B:false,C:false,D:false};
 s.objects=[{type:'line',points:['A','B']},{type:'line',points:['C','D']},{type:'markParallel',points:['A','B'],count:1},{type:'markParallel',points:['C','D'],count:1}];return s;
};
const transversal=(title,caption,angles=[])=>{
 const s=base(title,caption,'Две прямые пересечены наклонной секущей в двух точках.');
 s.points={A:[35,75],B:[385,75],C:[35,185],D:[385,185],P:[120,235],M:[220,75],N:[170,185],Q:[270,15],R:[310,75],L:[75,185]};
 s.labels={A:false,B:false,C:false,D:false,P:false,Q:false,R:false,L:false,M:{dx:8,dy:-10},N:{dx:8,dy:20}};
 s.objects=[{type:'line',points:['A','B']},{type:'line',points:['C','D']},{type:'line',points:['P','Q'],style:'emphasis'},...angles];return s;
};
S.geometryScenes={
 'p-lines':parallel(),
 'p-pairs':transversal('Секущая и пары углов','Положение углов относительно прямых и секущей определяет тип пары.'),
 'p-alt':transversal('Накрест лежащие углы','Равенство накрест лежащих углов является признаком параллельности.',[
  {type:'angle',vertex:'M',arms:['N','R'],radius:28,label:'α'},{type:'angle',vertex:'N',arms:['M','L'],radius:28,label:'α'}
 ]),
 'p-corresponding':transversal('Соответственные углы','Равенство соответственных углов является признаком параллельности.',[
  {type:'angle',vertex:'M',arms:['Q','R'],radius:28,label:'β'},{type:'angle',vertex:'N',arms:['M','D'],radius:28,label:'β'}
 ]),
 'p-one-side':transversal('Односторонние углы','Если сумма односторонних углов равна 180°, прямые параллельны.',[
  {type:'angle',vertex:'M',arms:['N','R'],radius:28,label:'α'},{type:'angle',vertex:'N',arms:['M','D'],radius:28,label:'180°−α'}
 ]),
 'p-axiom':(()=>{const s=parallel();s.title='Единственная параллельная через точку';s.points.M=[205,75];s.labels.M={dx:8,dy:-12};s.caption='Через внешнюю точку M проходит ровно одна прямая, параллельная данной.';return s;})(),
 'p-third':(()=>{const s=base('Параллельны третьей','Если a ∥ c и b ∥ c, то a ∥ b.','Три горизонтальные параллельные прямые a, b и c.');s.points={A:[35,55],B:[385,55],C:[35,125],D:[385,125],E:[35,195],F:[385,195]};s.labels={A:false,B:false,C:false,D:false,E:false,F:false};s.objects=[{type:'line',points:['A','B']},{type:'line',points:['C','D']},{type:'line',points:['E','F']},{type:'markParallel',points:['A','B'],count:1},{type:'markParallel',points:['C','D'],count:1},{type:'markParallel',points:['E','F'],count:1}];return s;})(),
 'p-properties':transversal('Свойства углов при параллельных прямых','При a ∥ b накрест лежащие и соответственные углы равны; односторонние в сумме дают 180°.',[
  {type:'markParallel',points:['A','B'],count:1},{type:'markParallel',points:['C','D'],count:1},{type:'angle',vertex:'M',arms:['N','R'],radius:28,label:'γ'},{type:'angle',vertex:'N',arms:['M','L'],radius:28,label:'γ'}
 ])
};
})();
