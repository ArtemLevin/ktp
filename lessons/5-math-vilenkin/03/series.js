(function(){
'use strict';
let lessonStore=[];
const series={
  meta:{
    rowId:'5-math-vilenkin',topicIndex:2,topicId:'5-math-vilenkin::2',topicNumber:3,
    grade:5,subject:'Математика',book:'Виленкин',topicTitle:'Умножение и деление натуральных чисел',schoolYear:'2026/27',
    plannedWeeks:'8–10',totalLessons:15,courseLessonStart:36,courseLessonEnd:50,courseTotal:170,
    topicHref:'../../../topics/5-math-vilenkin/03.html',ktpHref:'../../../index.html?focus=5-math-vilenkin&view=timeline',catalogHref:'index.html'
  },corrections:{}
};
Object.defineProperty(series,'lessons',{enumerable:true,configurable:true,get(){return lessonStore;},set(value){lessonStore=Array.isArray(value)?value.map(lesson=>{if(lesson&&Object.prototype.hasOwnProperty.call(lesson,'milestone')&&lesson.milestone===undefined)delete lesson.milestone;return lesson;}):value;}});
window.KTP_LESSON_SERIES=series;
})();
