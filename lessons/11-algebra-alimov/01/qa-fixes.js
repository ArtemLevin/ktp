(function(){
'use strict';
const lesson=window.KTP_LESSON_SERIES?.lessons?.find(x=>x.id==='08');
if(!lesson)return;
const exact={1:'2/9',2:'1/8',3:'2/25',4:'1/18',5:'2/49',6:'1/32'};
['independent','control'].forEach(kind=>{
  (lesson[kind]?.variants||[]).forEach(variant=>{
    const task=(variant.tasks||[]).find(x=>x.skill==='Значение производной');
    if(task&&exact[variant.id])task.answer=exact[variant.id];
  });
});
})();
