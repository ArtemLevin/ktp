(function(){
'use strict';
window.KTP_LESSON_SERIES={
  meta:{rowId:'7-algebra-makarychev',topicIndex:6,topicId:'7-algebra-makarychev::6',topicNumber:7,grade:7,subject:'Алгебра',book:'Макарычев',topicTitle:'Повторение (12 ч). Уроки 91–102',schoolYear:'2026/27',plannedWeeks:'31–34',totalLessons:12,topicHref:'../../../topics/7-algebra-makarychev/07.html',ktpHref:'../../../index.html?focus=7-algebra-makarychev&view=timeline',catalogHref:'index.html'},
  corrections:{},lessons:[]
};

// Нормализация машинной записи коэффициентов в генерируемых проверках.
// Фабрика назначает window.KTP_REVIEW_ASSESSMENTS после загрузки series.js;
// перехватываем назначение и очищаем только ученические строки, не затрагивая логику задач.
const cleanText=value=>{
  if(value==null)return value;
  return String(value)
    .replace(/−\s*1([A-Za-z])/g,'−$1')
    .replace(/-\s*1([A-Za-z])/g,'−$1')
    .replace(/(^|[=\s(+,;:])1([A-Za-z])/g,'$1$2')
    .replace(/\+\s*−/g,'− ')
    .replace(/\+\s*-/g,'− ')
    .replace(/−\s*−/g,'+ ');
};
const normalizeTask=task=>{
  ['text','answer','solution'].forEach(key=>{
    if(typeof task[key]==='string')task[key]=cleanText(task[key]);
  });
};
let reviewAssessments;
Object.defineProperty(window,'KTP_REVIEW_ASSESSMENTS',{
  configurable:true,
  get(){return reviewAssessments;},
  set(factory){
    reviewAssessments=function(...args){
      const data=factory(...args);
      ['independent','control'].forEach(kind=>{
        data[kind].variants.forEach(variant=>variant.tasks.forEach(normalizeTask));
      });
      return data;
    };
  }
});
})();