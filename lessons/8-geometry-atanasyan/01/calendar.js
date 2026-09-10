(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;if(!S||!Array.isArray(S.lessons))return;
S.lessons.forEach(l=>{l.week=Math.ceil(Number(l.globalNumber||0)/2);});

// Нормализация вариантов для концептуальных уроков: шесть вариантов должны
// оставаться равноценными, но не совпадать дословно.
const rotate=(items,k)=>items.slice(k).concat(items.slice(0,k));
for(const lesson of S.lessons){
  for(const kind of ['independent','control']){
    const work=lesson[kind];if(!work?.variants?.length)continue;
    if(lesson.number===5||lesson.number===12){
      const count=kind==='independent'?5:6;
      work.variants.forEach((variant,i)=>{
        variant.tasks=Array.from({length:count},(_,j)=>{
          const src=lesson.practice[(i+j)%lesson.practice.length];
          return {...src,points:kind==='independent'?2:(j===count-1?4:2)};
        });
      });
    }else if(lesson.number===1){
      work.variants.forEach((variant,i)=>{
        if(i<3)return;
        const k=(i-2)%variant.tasks.length;
        variant.tasks=i===5?[...variant.tasks].reverse():rotate(variant.tasks,k);
      });
    }
  }
}
})();
