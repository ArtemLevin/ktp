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
function diversifyConceptVariants(lesson){
  const blocks=[lesson.independent,lesson.control].filter(Boolean);
  if(lesson.number===9){
    const labels=['a','b','c','d','m','n'];
    blocks.forEach(block=>block.variants?.forEach((variant,index)=>{
      if(variant.tasks?.[0])variant.tasks[0].text=`Линия ${labels[index]} мысленно продолжается без конца в обе стороны. Как называется такая геометрическая фигура?`;
    }));
  }
  if(lesson.number===10){
    const names=['ABC','KLM','MNP','DEF','PQR','XYZ'];
    blocks.forEach(block=>block.variants?.forEach((variant,index)=>{
      if(variant.tasks?.[0])variant.tasks[0].text=`Назовите, из каких двух геометрических фигур состоит угол ${names[index]}.`;
    }));
  }
}
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
      diversifyConceptVariants(lesson);
      return lesson;
    }):value;
  }
});
window.KTP_LESSON_SERIES=series;
})();
