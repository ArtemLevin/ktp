(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;
if(!S||!Array.isArray(S.lessons))return;
S.lessons.forEach(lesson=>{lesson.week=Math.ceil(Number(lesson.globalNumber||0)/2);});
})();
