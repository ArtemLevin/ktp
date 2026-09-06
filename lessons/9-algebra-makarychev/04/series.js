(function(){
'use strict';
let lessonStore=[];
const series={
  meta:{
    rowId:'9-algebra-makarychev',
    topicIndex:3,
    topicId:'9-algebra-makarychev::3',
    topicNumber:4,
    grade:9,
    subject:'Алгебра',
    book:'Макарычев',
    topicTitle:'Уравнения и неравенства с двумя переменными',
    schoolYear:'2026/27',
    plannedWeeks:'19–25',
    totalLessons:20,
    courseLessonStart:55,
    globalStart:55,
    courseTotal:102,
    courseLessonEnd:74,
    topicHref:'../../../topics/9-algebra-makarychev/04.html',
    ktpHref:'../../../index.html?focus=9-algebra-makarychev&view=timeline',
    catalogHref:'index.html'
  },
  corrections:{}
};
Object.defineProperty(series,'lessons',{
  enumerable:true,
  configurable:true,
  get(){return lessonStore;},
  set(value){
    lessonStore=Array.isArray(value)?value.map(lesson=>{
      if(lesson&&Object.prototype.hasOwnProperty.call(lesson,'milestone')&&lesson.milestone===undefined)delete lesson.milestone;
      return lesson;
    }):value;
  }
});
window.KTP_LESSON_SERIES=series;
})();
