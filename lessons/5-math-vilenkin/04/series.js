(function(){
'use strict';
let lessonStore=[];
const counterexampleItems=[
{text:'Верно ли: «каждое чётное число делится на 4»? Приведите контрпример.',answer:'Неверно; например, 6 чётное, но не делится на 4.'},
{text:'Верно ли: «каждое нечётное число простое»? Приведите контрпример.',answer:'Неверно; например, 9 нечётное, но 9=3·3.'},
{text:'Верно ли: «если число делится на 3, то оно делится на 9»? Приведите контрпример.',answer:'Неверно; например, 12 делится на 3, но не на 9.'},
{text:'Верно ли: «если число оканчивается на 5, то оно делится на 10»? Приведите контрпример.',answer:'Неверно; например, 15 оканчивается на 5, но не делится на 10.'},
{text:'Верно ли: «если число делится на 2, то оно делится на 6»? Приведите контрпример.',answer:'Неверно; например, 8 делится на 2, но не на 6.'},
{text:'Верно ли: «если число делится на 5, то его последняя цифра обязательно 5»? Приведите контрпример.',answer:'Неверно; например, 20 делится на 5 и оканчивается на 0.'},
{text:'Верно ли: «если число делится на 9, то оно делится на 3»? Объясните.',answer:'Верно: сумма цифр кратна 9, значит она кратна и 3.'},
{text:'Верно ли: «произведение двух простых чисел составное»? Объясните.',answer:'Верно: произведение pq имеет делитель p, отличный от 1 и pq.'}
];
function diversifyCounterexample(lesson){
 if(!lesson||lesson.number!==12)return lesson;
 for(const key of ['independent','control']){
  const block=lesson[key];if(!block?.variants)return lesson;
  block.variants=block.variants.map((variant,vi)=>{
   const tasks=variant.tasks.map((task,j)=>{const item=counterexampleItems[(vi+j)%counterexampleItems.length];return{...task,text:item.text,answer:item.answer,solution:item.answer}});
   return{...variant,tasks};
  });
 }
 return lesson;
}
const series={meta:{rowId:'5-math-vilenkin',topicIndex:3,topicId:'5-math-vilenkin::3',topicNumber:4,grade:5,subject:'Математика',book:'Виленкин',topicTitle:'Делители и кратные',schoolYear:'2026/27',plannedWeeks:'11–13',totalLessons:13,courseLessonStart:51,courseLessonEnd:63,courseTotal:170,topicHref:'../../../topics/5-math-vilenkin/04.html',ktpHref:'../../../index.html?focus=5-math-vilenkin&view=timeline',catalogHref:'index.html'},corrections:{lesson12:'Проверочные варианты урока о контрпримерах ротируются по набору равноценных утверждений, чтобы все 6 вариантов были различны.'}};
Object.defineProperty(series,'lessons',{enumerable:true,configurable:true,get(){return lessonStore;},set(value){lessonStore=Array.isArray(value)?value.map((l,i)=>{if(l&&Object.prototype.hasOwnProperty.call(l,'milestone')&&l.milestone===undefined)delete l.milestone;return diversifyCounterexample(l,i);}):value;}});
window.KTP_LESSON_SERIES=series;
})();
