(function(){
'use strict';
let lessonStore=[];
const series={
  meta:{
    rowId:'5-math-vilenkin',
    topicIndex:0,
    topicId:'5-math-vilenkin::0',
    topicNumber:1,
    grade:5,
    subject:'Математика',
    book:'Виленкин',
    topicTitle:'Натуральные числа',
    schoolYear:'2026/27',
    plannedWeeks:'1–4',
    totalLessons:18,
    courseLessonStart:1,
    courseLessonEnd:18,
    courseTotal:170,
    topicHref:'../../../topics/5-math-vilenkin/01.html',
    ktpHref:'../../../index.html?focus=5-math-vilenkin&view=timeline',
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
      if(lesson?.number===1){
        const practiceAnswer='тридцать семь тысяч четыреста восемь';
        if(lesson.practice?.[0])lesson.practice[0].answer=practiceAnswer;
        if(lesson.examples?.[0]){
          lesson.examples[0].answer=practiceAnswer;
          lesson.examples[0].solution='Читаем число по классам: 37 | 408. Получаем: тридцать семь тысяч четыреста восемь.';
        }
        if(lesson.homework?.required?.[0])lesson.homework.required[0].answer='тридцать восемь тысяч четыреста восемь';
      }
      return lesson;
    }):value;
  }
});
window.KTP_LESSON_SERIES=series;
})();
