(function(){
'use strict';
let lessonStore=[];
const series={meta:{rowId:'5-math-vilenkin',topicIndex:3,topicId:'5-math-vilenkin::3',topicNumber:4,grade:5,subject:'Математика',book:'Виленкин',topicTitle:'Делители и кратные',schoolYear:'2026/27',plannedWeeks:'11–13',totalLessons:13,courseLessonStart:51,courseLessonEnd:63,courseTotal:170,topicHref:'../../../topics/5-math-vilenkin/04.html',ktpHref:'../../../index.html?focus=5-math-vilenkin&view=timeline',catalogHref:'index.html'},corrections:{}};
Object.defineProperty(series,'lessons',{enumerable:true,configurable:true,get(){return lessonStore;},set(value){lessonStore=Array.isArray(value)?value.map(l=>{if(l&&Object.prototype.hasOwnProperty.call(l,'milestone')&&l.milestone===undefined)delete l.milestone;return l;}):value;}});
window.KTP_LESSON_SERIES=series;
})();
