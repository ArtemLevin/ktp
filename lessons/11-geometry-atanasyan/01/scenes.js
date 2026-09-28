(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;
if(!S)throw new Error('lesson series required');
const specs=[
 ['cylinder',1.1,1.8,null,'Цилиндр: ось, основания и образующая'],
 ['cylinder',1.2,2,{type:'axial'},'Цилиндр: прямоугольное осевое сечение'],
 ['cylinder',1.2,2,null,'Цилиндр: параллельное оси сечение определяется хордой основания'],
 ['cylinder',1.2,2,null,'Цилиндр и два круговых основания'],
 ['cone',1.3,2.2,{type:'axial'},'Конус: треугольное осевое сечение'],
 ['cone',1.3,2.2,{type:'parallel-base',offset:1.1},'Конус: параллельное основанию сечение'],
 ['cone',1.3,2.2,null,'Конус: образующая и основание'],
 ['frustum',1.3,1.8,{type:'axial'},'Усечённый конус: трапеция осевого сечения'],
 ['ball',1.35,0,{type:'sphere-plane',normal:[0,0,1],offset:.7},'Шар с плоским круговым сечением'],
 ['sphere',1.35,0,{type:'sphere-plane',normal:[0,0,1],offset:1.35},'Сфера и касательная плоскость'],
 ['cylinder',1.2,1.8,null,'Цилиндр: выделяем наружную поверхность составной модели']
];
specs.forEach(([type,r,h,section,title],i)=>{
 const solid={type,radius:r};if(h)solid.height=h;if(type==='frustum')solid.topRadius=.65;
 S.revolutionScenes[`g11-l${String(i+1).padStart(2,'0')}`]={title,ariaLabel:title,solid,section,camera:{yaw:-35,pitch:25,scale:type==='sphere'||type==='ball'?75:62,origin:type==='sphere'||type==='ball'?[210,145]:[210,205]},caption:i===10?'Схема цилиндрической части; полусфера учитывается по формуле 2πr².':'Пространственная схема; истинные размеры указаны в условии урока.'};
});
})();
